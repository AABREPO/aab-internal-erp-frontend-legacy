import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from 'axios';
import Edit from '../Images/Edit.svg'
import Select from 'react-select';
import jsPDF from "jspdf";
import "jspdf-autotable";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
const Dashboard = () => {
    const getCurrentMonth = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;
    };
    const [totalMonthlyRent, setTotalMonthlyRent] = useState(0);
    const [rentForms, setRentForms] = useState([]);
    const [tenantShopData, setTenantShopData] = useState([]);
    const [shopNoIdToShopNoMap, setShopNoIdToShopNoMap] = useState({});
    const [tenantNameIdToTenantNameMap, setTenantNameIdToTenantNameMap] = useState({});
    const [editAdvance, setEditAdvance] = useState('');
    const [editRent, setEditRent] = useState('');
    const [editStartingMonth, setEditStartingMonth] = useState('');
    const [tableData, setTableData] = useState([]);
    const [selectedShop, setSelectedShop] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [projects, setProjects] = useState([]);
    const [showVacantPopup, setShowVacantPopup] = useState(false);
    const [sortField, setSortField] = useState('tenantName'); // or 'shopNo'
    const [sortOrder, setSortOrder] = useState('asc'); // or 'desc'
    const [selectedShopNo, setSelectedShopNo] = useState('');
    const [selectedTenantName, setSelectedTenantName] = useState('');
    const [selectedDoorNo, setSelectedDoorNo] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [selectedOccupancyStatus, setSelectedOccupancyStatus] = useState('');
    const [selectedMonthYear, setSelectedMonthYear] = useState(getCurrentMonth());
    const [tableHeight, setTableHeight] = useState(400); // Default height in pixels
    const scrollRef = useRef(null);
    const isDragging = useRef(false);
    const start = useRef({ x: 0, y: 0 });
    const scroll = useRef({ left: 0, top: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const animationFrame = useRef(null);
    const lastMove = useRef({ time: 0, x: 0, y: 0 });
    const selectedYear = selectedMonthYear ? parseInt(selectedMonthYear.split('-')[0]) : '';
    const selectedMonth = selectedMonthYear ? parseInt(selectedMonthYear.split('-')[1]) - 1 : '';
    useEffect(() => {
        const savedPaymentStatus = sessionStorage.getItem('paymentStatus');
        const savedShopNo = sessionStorage.getItem('selectedShopNo')
        const savedSelectedDoorNo = sessionStorage.getItem('selectedDoorNo');
        const savedTenantName = sessionStorage.getItem('selectedTenantName');
        const savedSelectedProperty = sessionStorage.getItem('selectedProperty');
        const savedOccupancyStatus = sessionStorage.getItem('selectedOccupancyStatus');
        try {
            if (savedPaymentStatus) setPaymentStatus(JSON.parse(savedPaymentStatus));
            if (savedShopNo) setSelectedShopNo(JSON.parse(savedShopNo));
            if (savedTenantName) setSelectedTenantName(JSON.parse(savedTenantName));
            if (savedSelectedDoorNo) setSelectedDoorNo(JSON.parse(savedSelectedDoorNo));
            if (savedSelectedProperty) setSelectedProperty(JSON.parse(savedSelectedProperty));
            if (savedOccupancyStatus) setSelectedOccupancyStatus(JSON.parse(savedOccupancyStatus));
        } catch (error) {
            console.error("Error parsing sessionStorage data:", error);
        }
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);
    const handleBeforeUnload = () => {
        sessionStorage.removeItem('paymentStatus');
        sessionStorage.removeItem('selectedShopNo');
        sessionStorage.removeItem('selectedDoorNo');
        sessionStorage.removeItem('selectedTenantName');
        sessionStorage.removeItem('selectedProperty');
        sessionStorage.removeItem('selectedOccupancyStatus');
    };
    useEffect(() => {
        if (paymentStatus) sessionStorage.setItem('paymentStatus', JSON.stringify(paymentStatus));
        if (selectedShopNo) sessionStorage.setItem('selectedShopNo', JSON.stringify(selectedShopNo));
        if (selectedDoorNo) sessionStorage.setItem('selectedDoorNo', JSON.stringify(selectedDoorNo));
        if (selectedTenantName) sessionStorage.setItem('selectedTenantName', JSON.stringify(selectedTenantName));
        if (selectedProperty) sessionStorage.setItem('selectedProperty', JSON.stringify(selectedProperty));
        if (selectedOccupancyStatus) sessionStorage.setItem('selectedOccupancyStatus', JSON.stringify(selectedOccupancyStatus));
    }, [paymentStatus, selectedShopNo, selectedDoorNo, selectedTenantName, selectedProperty, selectedOccupancyStatus]);

    const handleSort = (field) => {
        if (sortField === field) {
            // Toggle the sort order
            setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    // Advanced drag and scroll functionality
    const handleMouseDown = (e) => {
        isDragging.current = true;
        start.current = { x: e.clientX, y: e.clientY };
        scroll.current = {
            left: scrollRef.current.scrollLeft,
            top: scrollRef.current.scrollTop,
        };
        lastMove.current = {
            time: Date.now(),
            x: e.clientX,
            y: e.clientY,
        };
        scrollRef.current.style.cursor = 'grabbing';
        scrollRef.current.style.userSelect = 'none';
        cancelMomentum();
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        const dx = e.clientX - start.current.x;
        const dy = e.clientY - start.current.y;
        const now = Date.now();
        const dt = now - lastMove.current.time || 16;
        velocity.current = {
            x: (e.clientX - lastMove.current.x) / dt,
            y: (e.clientY - lastMove.current.y) / dt,
        };
        scrollRef.current.scrollLeft = scroll.current.left - dx;
        scrollRef.current.scrollTop = scroll.current.top - dy;
        lastMove.current = {
            time: now,
            x: e.clientX,
            y: e.clientY,
        };
    };

    const handleMouseUp = () => {
        if (!isDragging.current) return;
        isDragging.current = false;
        scrollRef.current.style.cursor = '';
        scrollRef.current.style.userSelect = '';
        applyMomentum();
    };

    const cancelMomentum = () => {
        if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
            animationFrame.current = null;
        }
    };

    const applyMomentum = () => {
        const friction = 0.95;
        const minVelocity = 0.1;
        const step = () => {
            const { x, y } = velocity.current;
            if (Math.abs(x) > minVelocity || Math.abs(y) > minVelocity) {
                scrollRef.current.scrollLeft -= x * 20;
                scrollRef.current.scrollTop -= y * 20;
                velocity.current.x *= friction;
                velocity.current.y *= friction;
                animationFrame.current = requestAnimationFrame(step);
            } else {
                cancelMomentum();
            }
        };
        animationFrame.current = requestAnimationFrame(step);
    };


    const vacantShops = useMemo(() => {
        return tableData.filter(shop =>
            shop.tenantName === "Vacant" || !shop.advance
        );
    }, [tableData]);
    useEffect(() => {
        fetchProjects();
    }, []);
    const fetchProjects = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuilderDash/api/projects/getAll');
            if (response.ok) {
                const data = await response.json();
                const ownProjects = Array.isArray(data)
                    ? data.filter(p => (p.projectCategory || '').toLowerCase() === 'own project')
                    : [];
                setProjects(ownProjects);
            } else {
                console.log('Error fetching projects.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    useEffect(() => {
        axios
            .get('https://backendaab.in/aabuildersDash/api/rental_forms/getAll')
            .then((response) => {
                const sortedForms = response.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                setRentForms(sortedForms);
            })
            .catch((error) => {
                console.error('Error fetching rental data:', error);
            });
    }, []);
    useEffect(() => {
        if (projects.length > 0) {
            fetchTenants();
        }
    }, [projects]);
    const fetchTenants = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/tenant_link_shop/getAll');
            if (response.ok) {
                const data = await response.json();
                setTenantShopData(data);
                const shopNoIdToShopNoMap = {};
                projects
                    .filter(project => project.projectReferenceName)
                    .forEach(project => {
                        const propertyDetailsArray = Array.isArray(project.propertyDetails)
                            ? project.propertyDetails
                            : Array.from(project.propertyDetails || []);

                        propertyDetailsArray.forEach(detail => {
                            if (detail.shopNo && detail.id) {
                                shopNoIdToShopNoMap[detail.id] = detail.shopNo;
                            }
                        });
                    });
                setShopNoIdToShopNoMap(shopNoIdToShopNoMap);
                const tenantNameIdMap = {};
                data.forEach(tenant => {
                    if (tenant.id && tenant.tenantName) {
                        tenantNameIdMap[tenant.id] = tenant.tenantName;
                    }
                });
                setTenantNameIdToTenantNameMap(tenantNameIdMap);
                let total = 0;
                data.forEach(tenant => {
                    tenant.shopNos?.forEach(shop => {
                        if (!shop.shopClosureDate && shop.monthlyRent) {
                            total += parseFloat(shop.monthlyRent) || 0;
                        }
                    });
                });
                setTotalMonthlyRent(total);
            } else {
                console.error('Error fetching tenants.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const formatDateOnly = (dateString) => {
        if (!dateString) return '';
        if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
            return dateString.replace(/-/g, '/');
        }
        if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
            const parts = dateString.split('-');
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }
        return dateString;
    };
    const shopInfoMap = useMemo(() => {
        const map = {};
        tenantShopData.forEach(tenant => {
            tenant.shopNos?.forEach(shop => {
                if (shop.shopNoId) {
                    const shopNo = shopNoIdToShopNoMap[shop.shopNoId] || '';
                    if (shopNo) {
                        let doorNo = '';
                        let projectReferenceName = '';
                        projects
                            .filter(project => project.projectReferenceName)
                            .forEach(project => {
                                const propertyDetailsArray = Array.isArray(project.propertyDetails)
                                    ? project.propertyDetails
                                    : Array.from(project.propertyDetails || []);
                                propertyDetailsArray.forEach(detail => {
                                    if (detail.id === shop.shopNoId) {
                                        doorNo = detail.doorNo || '';
                                        projectReferenceName = project.projectReferenceName || '';
                                    }
                                });
                            });
                        map[shopNo] = {
                            doorNo: doorNo,
                            projectReferenceName: projectReferenceName,
                            advanceAmount: shop.advanceAmount || '',
                            monthlyRent: shop.monthlyRent || '',
                            tenantId: tenant.id,
                            shopId: shop.shopNoId,
                            startingDate: shop.startingDate,
                            shopClosureDate: shop.shopClosureDate,
                            shouldCollectAdvance: shop.shouldCollectAdvance
                        };
                    }
                }
            });
        });
        return map;
    }, [tenantShopData, shopNoIdToShopNoMap, projects]);
    const parseAmountOrZero = (value) => {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : 0;
    };
    useEffect(() => {
        const buildTenantKey = (shopNo, tenantId, tenantName) => {
            const normalizedShop = shopNo || 'unknown';
            const tenantIdentifier = tenantId
                ? `id:${tenantId}`
                : tenantName
                    ? `name:${tenantName}`
                    : 'vacant';
            return `${normalizedShop}||${tenantIdentifier}`;
        };
        const getTenantKeyFromForm = (entry) => {
            const resolvedShopNo = entry.shopNoId
                ? (shopNoIdToShopNoMap[entry.shopNoId] || entry.shopNo || '')
                : (entry.shopNo || '');
            if (!resolvedShopNo) return null;
            const tenantIdentifier = entry.tenantNameId
                ? `id:${entry.tenantNameId}`
                : entry.tenantName
                    ? `name:${entry.tenantName}`
                    : 'vacant';
            return `${resolvedShopNo}||${tenantIdentifier}`;
        };
        const createMonthBuckets = () => Array(12).fill(null).map(() => []);
        const doesFormBelongToShop = (entry, shop) => {
            const shopMatches = entry.shopNoId
                ? (shop.shopNoId && entry.shopNoId === shop.shopNoId)
                : (entry.shopNo === shop.shopNo);
            if (!shopMatches) return false;
            if (entry.tenantNameId) {
                return shop.tenantId && entry.tenantNameId === shop.tenantId;
            }
            if (entry.tenantName && shop.tenantName) {
                return entry.tenantName === shop.tenantName;
            }
            return !entry.tenantName && !shop.tenantName;
        };
        const allShops = [];
        projects
            .filter(project => project.projectReferenceName)
            .forEach(project => {
                const propertyDetailsArray = Array.isArray(project.propertyDetails) 
                    ? project.propertyDetails 
                    : Array.from(project.propertyDetails || []);
                
                propertyDetailsArray.forEach(shop => {
                    if (shop.shopNo) {
                        allShops.push({
                            shopNo: shop.shopNo,
                            doorNo: shop.doorNo || '',
                            propertyName: project.projectReferenceName || '',
                            advance: null,
                            tenantName: null,
                            tenantId: null,
                            shopId: shop.id,
                            shopNoId: shop.id,
                            active: false,
                            tenantKey: buildTenantKey(shop.shopNo, null, null),
                            isBase: true,
                            hasTenant: false,
                            startingDate: null,
                            shopClosureDate: null,
                            shouldCollectAdvance: true
                        });
                    }
                });
            });
        tenantShopData.forEach(tenant => {
            tenant.shopNos?.forEach(shop => {
                if (!shop?.shopNoId) return;
                const shopNo = shopNoIdToShopNoMap[shop.shopNoId] || '';
                if (!shopNo) return;
                const shopEntryIndex = allShops.findIndex(s => s.shopNo === shopNo && s.isBase);
                if (shopEntryIndex !== -1) {
                    allShops[shopEntryIndex].hasTenant = true;
                }
                const baseEntry = shopEntryIndex !== -1 ? allShops[shopEntryIndex] : null;
                const tenantEntry = {
                    shopNo,
                    doorNo: baseEntry?.doorNo || '',
                    propertyName: baseEntry?.propertyName || '',
                    advance: null,
                    tenantName: tenant.tenantName || '',
                    tenantId: tenant.id,
                    shopId: shop.id || shop.shopNoId,
                    shopNoId: shop.shopNoId,
                    active: !shop.shopClosureDate,
                    tenantKey: buildTenantKey(shopNo, tenant.id, tenant.tenantName),
                    isBase: false,
                    startingDate: shop.startingDate || null,
                    shopClosureDate: shop.shopClosureDate || null,
                    shouldCollectAdvance: shop.shouldCollectAdvance ?? true
                };
                allShops.push(tenantEntry);
            });
        });
        const shopsForTable = allShops.filter(shop => !(shop.isBase && shop.hasTenant));
        // 3. Filter rent data for selected year
        const filteredForms = rentForms.filter(entry => {
            const date = new Date(entry.forTheMonthOf);
            return (entry.formType === 'Rent' || entry.formType === 'Pending Rent') &&
                date.getFullYear() === parseInt(selectedYear);
        });
        // 4. Group rents and collect detailed history using shopNoId
        const groupedRentals = {};
        const rentHistoryMap = {};
        filteredForms.forEach(entry => {
            const month = new Date(entry.forTheMonthOf).getMonth();
            const key = getTenantKeyFromForm(entry);
            if (!key) return;
            const amount = parseFloat(entry.amount || 0);
            const paidOn = formatDateOnly(entry.paidOnDate) || '';
            if (!groupedRentals[key]) {
                groupedRentals[key] = createMonthBuckets();
            }
            if (!rentHistoryMap[key]) {
                rentHistoryMap[key] = createMonthBuckets();
            }
            groupedRentals[key][month].push(amount);
            rentHistoryMap[key][month].push(`${paidOn} - ₹${amount.toLocaleString()}`);
        });
        // 5. Advance map and history using shopNoId
        const advanceMap = {};
        const advanceDetailsMap = {};
        const advanceAdjustmentDetailsMap = {};
        const shopClosureDetailsMap = {};
        const refundDetailsMap = {};
        rentForms.forEach(entry => {
            const key = getTenantKeyFromForm(entry);
            if (!key) return;
            
            if (entry.formType === 'Advance') {
                const amount = parseFloat(entry.amount || 0);
                const paidOn = formatDateOnly(entry.paidOnDate) || '';
                if (!advanceMap[key]) {
                    advanceMap[key] = 0;
                    advanceDetailsMap[key] = [];
                    advanceAdjustmentDetailsMap[key] = [];
                    shopClosureDetailsMap[key] = [];
                    refundDetailsMap[key] = [];
                }
                advanceMap[key] += amount;
                advanceDetailsMap[key].push(`${paidOn} - ₹${amount.toLocaleString()}`);
            } else if ((entry.formType === 'Rent' || entry.formType === 'Pending Rent') && entry.paymentMode?.trim() === 'Advance Adjustment') {
                const amount = parseFloat(entry.amount || 0);
                const paidOn = formatDateOnly(entry.paidOnDate) || '';
                if (!advanceAdjustmentDetailsMap[key]) {
                    advanceAdjustmentDetailsMap[key] = [];
                }
                advanceAdjustmentDetailsMap[key].push(`${paidOn} - ₹${amount.toLocaleString()}`);
            } else if (entry.formType === 'Shop Closure') {
                const amount = parseAmountOrZero(entry.refundAmount ?? entry.amount);
                const paidOn = formatDateOnly(entry.paidOnDate) || '';
                if (!shopClosureDetailsMap[key]) {
                    shopClosureDetailsMap[key] = [];
                }
                shopClosureDetailsMap[key].push(`${paidOn} - ₹${amount.toLocaleString()}`);
            } else if (entry.formType === 'Refund') {
                const amount = parseFloat(entry.refundAmount || entry.amount || 0);
                const paidOn = formatDateOnly(entry.paidOnDate) || '';
                if (!refundDetailsMap[key]) {
                    refundDetailsMap[key] = [];
                }
                refundDetailsMap[key].push(`${paidOn} - ₹${amount.toLocaleString()}`);
            }
        });
        const finalTableData = [];
        shopsForTable.forEach((shop) => {
            const months = groupedRentals[shop.tenantKey] || createMonthBuckets();
            const rentDetails = rentHistoryMap[shop.tenantKey] || createMonthBuckets();
            const advanceAmount = advanceMap[shop.tenantKey] || 0;
            const advanceDetails = advanceDetailsMap[shop.tenantKey] || [];
            const advanceAdjustmentDetails = advanceAdjustmentDetailsMap[shop.tenantKey] || [];
            const shopClosureDetails = shopClosureDetailsMap[shop.tenantKey] || [];
            const refundDetails = refundDetailsMap[shop.tenantKey] || [];
            const totalRentPaid = rentForms
                .filter(entry => {
                    return doesFormBelongToShop(entry, shop) &&
                        (entry.formType === 'Rent' || entry.formType === 'Pending Rent') &&
                        entry.paymentMode?.trim() === 'Advance Adjustment';
                })
                .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
            const totalShopClosurePaid = rentForms
                .filter(entry => {
                    return doesFormBelongToShop(entry, shop) && entry.formType === 'Shop Closure';
                })
                .reduce((sum, entry) => sum + parseAmountOrZero(entry.refundAmount ?? entry.amount), 0);
            const totalRefundPaid = rentForms
                .filter(entry => {
                    return doesFormBelongToShop(entry, shop) && entry.formType === 'Refund';
                })
                .reduce((sum, entry) => sum + parseFloat(entry.refundAmount || entry.amount || 0), 0);
            const remainingAdvance = Math.max(0, advanceAmount - totalRentPaid - totalShopClosurePaid - totalRefundPaid);
            const hadRentPaymentsThisYear = months.some(monthArr => monthArr.length > 0);
            const shopClosureDate = shop.shopClosureDate || shopInfoMap[shop.shopNo]?.shopClosureDate;
            let vacatedThisYear = false;
            if (shopClosureDate && !shop.active) {
                const closureDate = new Date(shopClosureDate);
                const closureYear = closureDate.getFullYear();
                vacatedThisYear = closureYear === parseInt(selectedYear);
            }
            const wasActiveThisYear = hadRentPaymentsThisYear || vacatedThisYear;
            const row = {
                shNo: finalTableData.length + 1,
                shopNo: shop.shopNo,
                tenantName: shop.active ? shop.tenantName : "Vacant",
                doorNo: shop.doorNo,
                advance: shop.active ? remainingAdvance : null,
                advanceDetails: shop.active ? advanceDetails : [],
                advanceAdjustmentDetails: shop.active ? advanceAdjustmentDetails : [],
                shopClosureDetails: shop.active ? shopClosureDetails : [],
                refundDetails: shop.active ? refundDetails : [],
                months,
                rentDetails,
                propertyName: shop.propertyName,
                vacated: !shop.active && wasActiveThisYear,
                startingDate: shop.startingDate || shopInfoMap[shop.shopNo]?.startingDate || null,
                shopClosureDate: shop.active ? null : shopClosureDate || null,
                shouldCollectAdvance: shop.shouldCollectAdvance ?? (shopInfoMap[shop.shopNo]?.shouldCollectAdvance ?? true)
            };
            if (!shop.active && wasActiveThisYear) {
                const hasAnotherActiveTenant = shopsForTable.some(
                    s => s.shopNo === shop.shopNo && s.active
                );
                finalTableData.push({
                    ...row,
                    tenantName: shop.tenantName || 'Vacated', 
                    vacated: true,
                    advance: remainingAdvance, 
                    advanceDetails: advanceDetails, 
                    advanceAdjustmentDetails: advanceAdjustmentDetails, 
                    shopClosureDetails: shopClosureDetails, 
                    refundDetails: refundDetails 
                });
                if (!hasAnotherActiveTenant) {
                    finalTableData.push({
                        ...row,
                        tenantName: 'Vacant',
                        advance: null,
                        advanceDetails: [],
                        months: createMonthBuckets(),
                        rentDetails: createMonthBuckets(),
                        vacated: false
                    });
                }
            } else {
                finalTableData.push(row);
            }
        });
        setTableData(finalTableData);
    }, [rentForms, tenantShopData, projects, selectedYear, shopNoIdToShopNoMap]);
    const formatINR = (value) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        if (!numericValue) return '';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(Number(numericValue));
    };

    const handleSaveRentAdvance = async () => {
        const { tenantId, shopId } = selectedShop;
        try {
            const updateResponse = await fetch(`https://backendaab.in/aabuildersDash/api/tenantShop/update/${tenantId}/shop/${shopId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    monthlyRent: editRent || null,
                    advanceAmount: editAdvance || null
                })
            });
            if (updateResponse.ok) {
                if (editRent && editStartingMonth) {
                    const rentHistoryData = {
                        tenantWithShopNoId: shopId,
                        rentAmount: editRent,
                        startingMonthForThisRent: editStartingMonth
                    };
                    const historyResponse = await fetch('https://backendaab.in/aabuildersDash/api/rent-history/save', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(rentHistoryData)
                    });
                    if (!historyResponse.ok) {
                        console.error('Failed to save rent history');
                        alert('Rent/Advance updated but failed to save rent history');
                    }
                }
                await fetchTenants();
                setShowEditPopup(false);
                setSelectedShop(null);
                setEditRent('');
                setEditAdvance('');
                setEditStartingMonth('');
            } else {
                console.error('Failed to update rent/advance');
                alert('Failed to update rent/advance');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while saving data');
        }
    };
    const filteredTableData = useMemo(() => {
        return tableData.filter((shop) => {
            const matchesShopNo = selectedShopNo ? shop.shopNo === selectedShopNo : true;
            const matchesTenantName = selectedTenantName ? shop.tenantName === selectedTenantName : true;
            const matchesDoorNo = selectedDoorNo ? shop.doorNo === selectedDoorNo : true;
            const matchesProperty = selectedProperty ? shop.propertyName === selectedProperty.value : true;
            const isVacant = shop.tenantName === 'Vacant';
            const isVacated = shop.vacated;
            const isOccupied = !isVacant && !isVacated;
            let matchesOccupancyStatus = true;
            if (selectedOccupancyStatus) {
                if (selectedOccupancyStatus === 'vacant') {
                    matchesOccupancyStatus = isVacant;
                } else if (selectedOccupancyStatus === 'occupied') {
                    matchesOccupancyStatus = isOccupied;
                } else if (selectedOccupancyStatus === 'vacated') {
                    matchesOccupancyStatus = isVacated;
                }
            }
            let matchesMonthStatus = true;
            if (selectedMonth !== '' && paymentStatus !== '') {
                const monthPayments = shop.months?.[selectedMonth] || [];
                const totalAmount = monthPayments.reduce((a, b) => a + b, 0);

                if (paymentStatus === 'paid') {
                    matchesMonthStatus = totalAmount > 0;
                } else if (paymentStatus === 'unpaid') {
                    const startingDate = shop.startingDate ? new Date(shop.startingDate) : null;
                    const selectedMonthDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), 1);

                    const hasStarted = startingDate ? startingDate <= selectedMonthDate : true;

                    matchesMonthStatus = totalAmount === 0 && hasStarted;
                }
            }
            return matchesShopNo && matchesTenantName && matchesDoorNo && matchesProperty && matchesOccupancyStatus && (!isVacant || paymentStatus === '') && matchesMonthStatus;
        });
    }, [
        tableData,
        selectedShopNo,
        selectedTenantName,
        selectedDoorNo,
        selectedMonth,
        paymentStatus,
        selectedProperty,
        selectedOccupancyStatus,
    ]);

    const sortedTableData = useMemo(() => {
        return [...filteredTableData].sort((a, b) => {
            const normalize = (val) =>
                val?.toString().replace(/\s+/g, '').toUpperCase() || '';
            const valA = normalize(a[sortField]?.split(',')[0]);
            const valB = normalize(b[sortField]?.split(',')[0]);
            if (sortField === 'shopNo') {
                // Parse shop number: extract first two letters and numeric part
                const parseShopNo = (str) => {
                    if (!str) return { letters: '', number: 0 };
                    // Extract first two letters (or one if only one exists)
                    const letterMatch = str.match(/^([A-Z]{1,2})/);
                    const letters = letterMatch ? letterMatch[1] : '';
                    // Extract numeric part
                    const numberMatch = str.match(/(\d+)/);
                    const number = numberMatch ? parseInt(numberMatch[1], 10) : 0;
                    return { letters, number };
                };
                
                const parsedA = parseShopNo(valA);
                const parsedB = parseShopNo(valB);
                
                // Compare letters first
                if (parsedA.letters < parsedB.letters) return sortOrder === 'asc' ? -1 : 1;
                if (parsedA.letters > parsedB.letters) return sortOrder === 'asc' ? 1 : -1;
                
                // If letters are same, compare numbers numerically
                if (parsedA.number < parsedB.number) return sortOrder === 'asc' ? -1 : 1;
                if (parsedA.number > parsedB.number) return sortOrder === 'asc' ? 1 : -1;
                
                return 0;
            }
            // Default sorting for other fields
            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredTableData, sortField, sortOrder]);

    const options = projects
        .filter(project => project.projectReferenceName) // Only include projects with projectReferenceName
        .map((project) => ({
            value: project.projectReferenceName,
            label: project.projectReferenceName,
        }));

    const shopOptions = [...new Set(tableData.map(shop => shop.shopNo))].map(no => ({ value: no, label: no }));
    const filteredByShop = selectedShopNo
        ? tableData.filter(shop => shop.shopNo === selectedShopNo)
        : tableData;
    const tenantOptions = [...new Set(filteredByShop.map(shop => shop.tenantName))].map(name => ({ value: name, label: name }));
    const filteredByTenant = selectedTenantName
        ? filteredByShop.filter(shop => shop.tenantName === selectedTenantName)
        : filteredByShop;
    const doorOptions = [...new Set(filteredByTenant.map(shop => shop.doorNo))].map(door => ({ value: door, label: door }));

    const handleExportPDF = () => {
        const doc = new jsPDF('landscape');
        const reportTitle =
            paymentStatus?.trim().toLowerCase() === 'unpaid'
                ? `Unpaid Shops Rent Report ${monthNames[selectedMonth]} ${selectedYear}`
                : `Shop Rent Report ${monthNames[selectedMonth]} ${selectedYear}`;
        const tableColumn = [
            "S.No",
            "Shop No",
            "Tenant Name",
            "Door No",
            "Advance",
            ...monthNames,
            "Unpaid"
        ];
        const now = new Date();
        const tableRows = sortedTableData.map((shop, index) => {
            const isVacant = shop.tenantName === 'Vacant';
            const isVacated = shop.vacated;
            const advance = shop.advance != null && shop.shouldCollectAdvance !== false
                ? Number(shop.advance).toLocaleString("en-IN")
                : shop.shouldCollectAdvance === false
                    ? 'NIL'
                    : "";
            const monthValues = shop.months.map((amounts, i) => {
                const isFutureMonth =
                    selectedYear > now.getFullYear() ||
                    (selectedYear === now.getFullYear() && i >= now.getMonth());
                const shopStartDate = shop.startingDate ? new Date(shop.startingDate) : null;
                const shopClosureDate = shop.shopClosureDate ? new Date(shop.shopClosureDate) : null;
                const isBeforeStart = shopStartDate
                    ? (selectedYear < shopStartDate.getFullYear() ||
                        (selectedYear === shopStartDate.getFullYear() && i < shopStartDate.getMonth()))
                    : false;
                const isAfterClosure = shopClosureDate && isVacated
                    ? (selectedYear > shopClosureDate.getFullYear() ||
                        (selectedYear === shopClosureDate.getFullYear() && i > shopClosureDate.getMonth()))
                    : false;
                const totalAmount = amounts.reduce((a, b) => a + b, 0);
                if (isVacant || isBeforeStart || isAfterClosure) return "-";
                if (totalAmount > 0) return totalAmount.toLocaleString();
                if (isFutureMonth) return "-";
                return "0";
            });
            const unpaidCount = isVacant
                ? "-"
                : shop.months.filter((arr, i) => {
                    const isPastMonth =
                        selectedYear < now.getFullYear() ||
                        (selectedYear === now.getFullYear() && i < now.getMonth());
                    const shopStartDate = shop.startingDate ? new Date(shop.startingDate) : null;
                    const currentMonthDate = new Date(`${selectedYear}-${String(i + 1).padStart(2, '0')}-01`);
                    const isBeforeStart = shopStartDate ? currentMonthDate < shopStartDate : false;
                    const total = arr.reduce((a, b) => a + b, 0);
                    return isPastMonth && total === 0 && !isBeforeStart;
                }).length.toString().padStart(2, '0');
            return {
                rowData: [
                    index + 1,
                    shop.shopNo,
                    isVacant ? "Vacant" : shop.tenantName,
                    shop.doorNo || "-",
                    advance,
                    ...monthValues,
                    unpaidCount,
                ],
                isVacant,
                isVacated,
            };
        });
        doc.setFontSize(12);
        doc.text(reportTitle, 14, 10);
        doc.autoTable({
            head: [tableColumn],
            body: tableRows.map((r) => r.rowData),
            startY: 15,
            styles: {
                fontSize: 7,
                overflow: 'linebreak',
                lineColor: [0, 0, 0],
                lineWidth: 0.1,
                textColor: [0, 0, 0],
            },
            headStyles: {
                fillColor: false,
                textColor: [0, 0, 0],
                fontStyle: 'bold',
            },
            bodyStyles: {
                fillColor: false,
                textColor: [0, 0, 0],
            },
            theme: 'grid'
        });
        const fileName =
            paymentStatus?.trim().toLowerCase() === 'unpaid'
                ? `Unpaid Shops Rent Report - ${selectedMonthYear}.pdf`
                : `Shop-Rent-${selectedMonthYear}.pdf`;

        doc.save(fileName);
    };
    const handleExportVacantPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["S.No", "Shop No", "Door No", "Project Reference Name"];
        const tableRows = filteredVacantShops.map((shop, index) => [
            index + 1,
            shop.shopNo,
            shop.doorNo || 'N/A',
            shop.propertyName || 'N/A' // propertyName stores projectReferenceName
        ]);

        doc.text("Vacant Shop Details", 14, 10);
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 15,
            styles: {
                fontSize: 10,
                lineColor: [200, 200, 200],
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: false,
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                lineColor: [200, 200, 200],
                lineWidth: 0.1,
            },
            bodyStyles: {
                fillColor: false,
                textColor: [0, 0, 0],
                lineColor: [200, 200, 200],
                lineWidth: 0.1,
            },
            theme: 'grid',
        });

        doc.save("Vacant-Shops.pdf");
    };
    const filteredVacantShops = useMemo(() => {
        const vacantShops = filteredTableData.filter(shop => {
            const shopInfo = shopInfoMap[shop.shopNo];
            const isVacant = shop.tenantName === "Vacant" || !shop.advance;
            const shouldInclude = !shopInfo || shopInfo.shouldCollectAdvance !== false;
            return isVacant && shouldInclude;
        });
        
        // Remove duplicates based on shopNo
        const uniqueVacantShops = vacantShops.reduce((acc, current) => {
            const existingShop = acc.find(shop => shop.shopNo === current.shopNo);
            if (!existingShop) {
                acc.push(current);
            }
            return acc;
        }, []);
        
        return uniqueVacantShops;
    }, [filteredTableData, shopInfoMap]);
    const occupiedCount = sortedTableData.length - filteredVacantShops.length;

    const totalMonthlyRents = useMemo(() => {
        if (selectedMonth === '' || selectedYear === '') return 0;
        const selectedMonthIndex = parseInt(selectedMonth); // 0-based
        const selectedYearNum = parseInt(selectedYear);
        const daysInMonth = new Date(selectedYearNum, selectedMonthIndex + 1, 0).getDate();
        return tableData.reduce((sum, shop) => {
            const isActive = shop.tenantName !== 'Vacant';
            const shopInfo = shopInfoMap[shop.shopNo];
            if (!isActive || !shopInfo?.monthlyRent) return sum;
            const rent = parseFloat(shopInfo.monthlyRent || 0);
            const startDate = shopInfo.startingDate ? new Date(shopInfo.startingDate) : null;
            if (!startDate) {
                return sum + rent;
            }
            const startYear = startDate.getFullYear();
            const startMonth = startDate.getMonth();
            if (startYear > selectedYearNum || (startYear === selectedYearNum && startMonth > selectedMonthIndex)) {
                return sum; // Not started yet
            }
            if (startYear === selectedYearNum && startMonth === selectedMonthIndex) {
                const startDay = startDate.getDate();
                const activeDays = daysInMonth - startDay + 1;
                let prorated = (rent / daysInMonth) * activeDays;
                const rounded = Math.floor(prorated / 10) * 10;
                const diff = prorated - rounded;
                if (diff >= 9) {
                    prorated = Math.round(prorated); // Normal round if very close
                } else {
                    prorated = rounded;
                }
                return sum + prorated;
            }
            return sum + rent; // Full rent
        }, 0);
    }, [tableData, shopInfoMap, selectedMonth, selectedYear]);

    const totalForSelectedMonth = useMemo(() => {
        if (selectedMonth === '' || selectedYear === '') return 0;
        return tableData.reduce((sum, shop) => {
            const amounts = shop.months?.[selectedMonth];
            if (!amounts || !Array.isArray(amounts)) return sum;
            const shopStartDate = shop.startingDate ? new Date(shop.startingDate) : null;
            const selectedMonthDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), 1);
            const isBeforeStart = shopStartDate ? selectedMonthDate < shopStartDate : false;
            if (shop.tenantName === 'Vacant' || isBeforeStart) return sum;
            const totalAmount = amounts.reduce((a, b) => a + b, 0);
            return sum + totalAmount;
        }, 0);
    }, [filteredTableData, selectedMonth, selectedYear]);

    return (
        <div className="">
            <div className='mx-auto lg:w-[1750px] p-4 lg:pl-4 bg-white lg:ml-12 lg:mr-6 rounded-md text-left'>
                <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-3 p-4">
                    <div className="flex-shrink-0 mr-3">
                        <h1 className='font-semibold mb-2'>Select Year</h1>
                        <input
                            type="month"
                            value={selectedMonthYear}
                            onChange={(e) => setSelectedMonthYear(e.target.value)}
                            className="border-2 border-[#BF9853] rounded-lg p-2 w-full lg:w-[180px] h-[45px] focus:outline-none"
                        />
                    </div>
                    <div className="flex  sm:flex-row w-full flex-wrap">
                        <div className="w-full sm:w-auto sm:min-w-[200px]">
                            <label className="block font-semibold mb-2 text-sm sm:text-base">Shop No</label>
                            <Select
                                options={shopOptions}
                                isClearable
                                placeholder="Select"
                                className="w-full lg:w-[180px]"
                                value={shopOptions.find(o => o.value === selectedShopNo) || null}
                                onChange={(option) => {
                                    const value = option?.value || '';
                                    setSelectedShopNo(value);
                                    setSelectedTenantName('');
                                    setSelectedDoorNo('');
                                    if (value) {
                                        sessionStorage.setItem('selectedShopNo', JSON.stringify(value));
                                    } else {
                                        sessionStorage.removeItem('selectedShopNo');
                                    }
                                    sessionStorage.removeItem('selectedTenantName');
                                    sessionStorage.removeItem('selectedDoorNo');
                                }}
                                styles={{
                                    control: (provided, state) => ({
                                        ...provided,
                                        height: '45px',
                                        minHeight: '45px',
                                        backgroundColor: 'transparent',
                                        borderWidth: '2px',
                                        borderColor: state.isFocused
                                            ? 'rgba(191, 152, 83, 1)'
                                            : 'rgba(191, 152, 83, 1)',
                                        borderRadius: '8px',
                                        boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 1)' : 'none',
                                        '&:hover': {
                                            borderColor: 'rgba(191, 152, 83, 1)',
                                        },
                                    }),
                                    placeholder: (provided) => ({
                                        ...provided,
                                        color: '#999',
                                    }),
                                    singleValue: (provided) => ({
                                        ...provided,
                                        color: 'black',
                                    }),
                                }}
                            />
                        </div>
                        <div className="w-full sm:w-auto sm:min-w-[200px] mr-5">
                            <label className="block font-semibold mb-2 text-sm sm:text-base">Tenant Name</label>
                            <Select
                                options={tenantOptions}
                                isClearable
                                placeholder="Select"
                                value={tenantOptions.find(o => o.value === selectedTenantName) || null}
                                onChange={(option) => {
                                    const value = option?.value || '';
                                    setSelectedTenantName(value);
                                    if (value) {
                                        sessionStorage.setItem('selectedTenantName', JSON.stringify(value));
                                    } else {
                                        sessionStorage.removeItem('selectedTenantName');
                                    }
                                    setSelectedDoorNo('');
                                    sessionStorage.removeItem('selectedDoorNo');
                                }}
                                isDisabled={!filteredByShop.length}
                                styles={{
                                    control: (provided, state) => ({
                                        ...provided,
                                        height: '45px',
                                        minHeight: '45px',
                                        backgroundColor: 'transparent',
                                        borderWidth: '2px',
                                        borderColor: state.isFocused
                                            ? 'rgba(191, 152, 83, 1)'
                                            : 'rgba(191, 152, 83, 1)',
                                        borderRadius: '8px',
                                        boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 1)' : 'none',
                                        '&:hover': {
                                            borderColor: 'rgba(191, 152, 83, 1)',
                                        },
                                    }),
                                    placeholder: (provided) => ({
                                        ...provided,
                                        color: '#999',
                                    }),
                                    singleValue: (provided) => ({
                                        ...provided,
                                        color: 'black',
                                    }),
                                }}
                            />
                        </div>
                        <div className="w-full sm:w-auto sm:min-w-[200px]">
                            <label className="block font-semibold mb-2 text-sm sm:text-base">Door No</label>
                            <Select
                                options={doorOptions}
                                placeholder="Select"
                                isClearable
                                className="w-full lg:w-[180px]"
                                value={doorOptions.find(o => o.value === selectedDoorNo) || null}
                                onChange={(option) => {
                                    const value = option?.value || '';
                                    setSelectedDoorNo(value);

                                    if (value) {
                                        sessionStorage.setItem('selectedDoorNo', JSON.stringify(value));
                                    } else {
                                        sessionStorage.removeItem('selectedDoorNo');
                                    }
                                }}
                                isDisabled={!filteredByTenant.length}
                                styles={{
                                    control: (provided, state) => ({
                                        ...provided,
                                        height: '45px',
                                        minHeight: '45px',
                                        backgroundColor: 'transparent',
                                        borderWidth: '2px',
                                        borderColor: state.isFocused
                                            ? 'rgba(191, 152, 83, 1)'
                                            : 'rgba(191, 152, 83, 1)',
                                        borderRadius: '8px',
                                        boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 1)' : 'none',
                                        '&:hover': {
                                            borderColor: 'rgba(191, 152, 83, 1)',
                                        },
                                    }),
                                    placeholder: (provided) => ({
                                        ...provided,
                                        color: '#999',
                                    }),
                                    singleValue: (provided) => ({
                                        ...provided,
                                        color: 'black',
                                    }),
                                }}
                            />
                        </div>
                        <div className="w-full sm:w-auto sm:min-w-[200px]">
                            <label className="block font-semibold mb-2 text-sm sm:text-base">Payment Status</label>
                            <select
                                className='w-full lg:w-[180px] h-[45px] border-2 border-[#BF9853] rounded-lg pl-3 focus:outline-none'
                                value={paymentStatus}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setPaymentStatus(value);

                                    if (value) {
                                        sessionStorage.setItem('paymentStatus', JSON.stringify(value));
                                    } else {
                                        sessionStorage.removeItem('paymentStatus');
                                    }
                                }}
                            >
                                <option value="">Select</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                        </div>
                        <div className="w-full sm:w-auto sm:min-w-[200px] mr-5">
                            <label className="block font-semibold mb-2 text-sm sm:text-base">Project Reference Name</label>
                            <Select
                                options={options}
                                value={selectedProperty}
                                isClearable
                                onChange={(option) => {
                                    setSelectedProperty(option);
                                    if (option) {
                                        sessionStorage.setItem('selectedProperty', JSON.stringify(option));
                                    } else {
                                        sessionStorage.removeItem('selectedProperty');
                                    }
                                }}
                                placeholder="Select"
                                isSearchable
                                styles={{
                                    control: (provided, state) => ({
                                        ...provided,
                                        height: '45px',
                                        minHeight: '45px',
                                        backgroundColor: 'transparent',
                                        borderWidth: '2px',
                                        borderColor: state.isFocused
                                            ? 'rgba(191, 152, 83, 1)'
                                            : 'rgba(191, 152, 83, 1)',
                                        borderRadius: '8px',
                                        boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 1)' : 'none',
                                        '&:hover': {
                                            borderColor: 'rgba(191, 152, 83, 1)',
                                        },
                                    }),
                                    placeholder: (provided) => ({
                                        ...provided,
                                        color: '#999',
                                    }),
                                    singleValue: (provided) => ({
                                        ...provided,
                                        color: 'black',
                                    }),
                                }}
                            />
                        </div>
                        <div className="w-full sm:w-auto sm:min-w-[200px]">
                            <label className="block font-semibold mb-2 text-sm sm:text-base">Occupancy Status</label>
                            <select
                                className='w-full lg:w-[180px] h-[45px] border-2 border-[#BF9853] rounded-lg pl-3 focus:outline-none'
                                value={selectedOccupancyStatus}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSelectedOccupancyStatus(value);
                                    if (value) {
                                        sessionStorage.setItem('selectedOccupancyStatus', JSON.stringify(value));
                                    } else {
                                        sessionStorage.removeItem('selectedOccupancyStatus');
                                    }
                                }}
                            >
                                <option value="">Select</option>
                                <option value="occupied">Occupied Shop</option>
                                <option value="vacant">Vacant Shop</option>
                                <option value="vacated">Vacated Shop</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            {/* Rent Table */}
            <div className='mx-auto lg:w-[1750px] p-4 lg:pl-8 mt-5 bg-white lg:ml-12 mr-6 rounded-md'>
                <div className='flex flex-col lg:flex-row lg:justify-end gap-4 lg:gap-10 items-start lg:items-center mb-3'>
                    <div className="font-semibold flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <span>Total Monthly Rent:</span>
                        <span className='font-bold cursor-pointer text-[#E4572E]'>₹{totalMonthlyRents.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="font-semibold text-sm sm:text-base">
                        <span className="block sm:inline">Total Collected for {monthNames[selectedMonth]} {selectedYear}:</span>
                        <span className="text-green-600 ml-0 sm:ml-1">
                            ₹{totalForSelectedMonth.toLocaleString("en-IN")}
                        </span>
                    </div>
                    <div className="font-semibold text-sm sm:text-base">
                        <span className="block sm:inline">Balance Rent to Collect for {monthNames[selectedMonth]} {selectedYear}:</span>
                        <span className="text-red-600 ml-0 sm:ml-1">
                            ₹{(totalMonthlyRents - totalForSelectedMonth).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </span>
                    </div>
                    <div className="font-semibold flex gap-2">
                        <span>Total Occupied Shops:</span>
                        <span className='font-bold cursor-pointer text-[#E4572E]'>
                            {occupiedCount}
                        </span>
                    </div>
                    <div className="font-semibold flex gap-2">
                        <span>Total Shop Vacancy:</span>
                        <span
                            className='font-bold cursor-pointer text-[#E4572E]'
                            onClick={() => setShowVacantPopup(true)}
                        >
                            {filteredVacantShops.length}
                        </span>
                    </div>
                    <button
                        className='font-bold text-sm text-[#E4572E] cursor-pointer hover:underline text-left lg:text-right'
                        onClick={handleExportPDF}
                    >
                        Export PDF
                    </button>
                </div>
                <div ref={scrollRef} className="rounded-lg border-l-8 border-[#BF9853] overflow-scroll select-none" style={{ height: `${550}px` }}
                    onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
                >
                    <table className="border-collapse w-full text-left min-w-[1165px]">
                        <thead className="sticky top-0">
                            <tr className="bg-[#FAF6ED]">
                                <th className="px-2 py-2 font-semibold cursor-pointer">S.No</th>
                                <th className="px-4 py-2 font-semibold cursor-pointer" onClick={() => handleSort('shopNo')} >
                                    Sh.No {sortField === 'shopNo' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-4 py-2 font-semibold cursor-pointer" onClick={() => handleSort('tenantName')} >
                                    Shop Name {sortField === 'tenantName' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-4 py-2 font-semibold">D.No</th>
                                <th className="px-4 py-2 font-semibold">Advance</th>
                                {monthNames.map((month, i) => (
                                    <th key={i} className="px-4 py-2 font-semibold">{month}</th>
                                ))}
                                <th className="px-4 py-2 font-semibold">Unpaid</th>
                                <th className="px-4 py-2 font-semibold">Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedTableData.map((shop, index) => {
                                const isVacant = shop.tenantName === 'Vacant';
                                return (
                                    <tr
                                        key={`${shop.shopNo}-${shop.tenantName || 'Vacant'}-${shop.shNo}`}
                                        className={`font-semibold text-sm ${isVacant
                                            ? 'bg-[#FFE5C5] text-[#E4572E] italic'
                                            : shop.vacated
                                                ? 'bg-[#FDE2E4] text-gray-600 line-through'
                                                : 'odd:bg-white even:bg-[#FAF6ED]'
                                            }`}
                                    >
                                        <td className="pr-2 pl-4 py-2 ">{index + 1}</td>
                                        <td className="pr-6 pl-4 py-2 " title={`${shop.doorNo || ''} - ${shop.propertyName || ''}`}>
                                            {shop.shopNo}
                                        </td>
                                        <td className="px-4 py-2">
                                            {isVacant ? (
                                                <em></em>
                                            ) : (
                                                <span
                                                    className={shop.vacated ? 'line-through text-gray-500' : ''}
                                                    title={shop.vacated ? 'Tenant vacated during this year' : ''}
                                                >
                                                    {shop.tenantName}
                                                </span>
                                            )}
                                        </td>
                                        <td className="pr-2 pl-4 py-2">
                                            {shop.doorNo || '-'}
                                        </td>
                                        <td className="px-4 py-2" title={(() => {
                                            const advanceDetails = shop.advanceDetails || [];
                                            const adjustmentDetails = shop.advanceAdjustmentDetails || [];
                                            const shopClosureDetails = shop.shopClosureDetails || [];
                                            const refundDetails = shop.refundDetails || [];                                            
                                            let tooltip = [];                                            
                                            // Add advance payments
                                            advanceDetails.forEach(detail => {
                                                tooltip.push(detail);
                                            });                                            
                                            // Add advance adjustments with clear labeling
                                            adjustmentDetails.forEach(detail => {
                                                tooltip.push(detail + ' (Advance Adjustment)');
                                            });                                            
                                            // Add shop closure payments with clear labeling
                                            shopClosureDetails.forEach(detail => {
                                                tooltip.push(detail + ' (Shop Closure)');
                                            });
                                            
                                            // Add refund payments with clear labeling
                                            refundDetails.forEach(detail => {
                                                tooltip.push(detail + ' (Refund)');
                                            });                                            
                                            // Add note for vacated shops
                                            if (shop.vacated && shop.advance > 0) {
                                                tooltip.push('Balance to be returned to tenant');
                                            }                                            
                                            return tooltip.join('\n');
                                        })()}>
                                            {shop.advance != null && shop.shouldCollectAdvance !== false
                                                ? Number(shop.advance).toLocaleString("en-IN", {
                                                    style: "currency",
                                                    currency: "INR",
                                                    maximumFractionDigits: 0
                                                })
                                                : shop.shouldCollectAdvance === false
                                                    ? 'NIL'
                                                    : ""}
                                        </td>
                                        {shop.months.map((amounts, i) => {
                                            const now = new Date();
                                            const isFutureMonth =
                                                selectedYear > now.getFullYear() ||
                                                (selectedYear === now.getFullYear() && i >= now.getMonth());
                                            const totalAmount = amounts.reduce((a, b) => a + b, 0);
                                            const hoverText = shop.rentDetails?.[i]?.join('\n') || "";
                                            const shopStartDate = shop.startingDate ? new Date(shop.startingDate) : null;
                                            const shopClosureDate = shop.shopClosureDate ? new Date(shop.shopClosureDate) : null;
                                            const isBeforeStart = shopStartDate
                                                ? (selectedYear < shopStartDate.getFullYear() ||
                                                    (selectedYear === shopStartDate.getFullYear() && i < shopStartDate.getMonth()))
                                                : false;
                                            const isAfterClosure = shopClosureDate && shop.vacated
                                                ? (selectedYear > shopClosureDate.getFullYear() ||
                                                    (selectedYear === shopClosureDate.getFullYear() && i > shopClosureDate.getMonth()))
                                                : false;
                                            return (
                                                <td key={i} className="px-4 py-2 text-center" title={hoverText}>
                                                    {isVacant || isBeforeStart || isAfterClosure ? (
                                                        <span className="text-gray-400 font-medium">-</span>
                                                    ) : totalAmount > 0 ? (
                                                        <span className="text-green-600 font-semibold">{totalAmount.toLocaleString()}</span>
                                                    ) : isFutureMonth ? (
                                                        <span className="text-gray-400 font-medium">-</span>
                                                    ) : (
                                                        <span className="text-[#E4572E] font-medium">0</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td className="px-4 py-2 text-center font-bold">
                                            {isVacant
                                                ? '-'
                                                : shop.months.filter((arr, i) => {
                                                    const now = new Date();
                                                    const isPastMonth =
                                                        selectedYear < now.getFullYear() ||
                                                        (selectedYear === now.getFullYear() && i < now.getMonth());
                                                    const total = arr.reduce((a, b) => a + b, 0);
                                                    const shopStartDate = shop.startingDate ? new Date(shop.startingDate) : null;
                                                    const currentMonthDate = new Date(`${selectedYear}-${String(i + 1).padStart(2, '0')}-01`);
                                                    const isBeforeStart = shopStartDate ? currentMonthDate < shopStartDate : false;
                                                    return isPastMonth && total === 0 && !isBeforeStart;
                                                }).length.toString().padStart(2, '0')}
                                        </td>
                                        <td className="px-4 py-2 items-center text-center ">
                                            {!isVacant && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedShop(shop);
                                                        setShowConfirm(true);
                                                    }}>
                                                    <img src={Edit} alt="" className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {tableData.length === 0 && (
                                <tr>
                                    <td colSpan="17" className="text-center py-4 text-gray-500">
                                        No data available for {selectedYear}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {showConfirm && selectedShop && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md">
                        <p className="text-lg sm:text-xl font-semibold mb-2 text-center">
                            Are you sure you want to edit
                        </p>
                        <div className="text-lg sm:text-xl font-semibold mb-6 text-center">
                            <span className="text-[#BF9853]">{selectedShop.tenantName}</span>?
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                            <button 
                                className="bg-gray-300 px-4 py-2 rounded-md text-sm sm:text-base" 
                                onClick={() => { setShowConfirm(false); setSelectedShop(null); }}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-[#BF9853] text-white px-4 py-2 rounded-md text-sm sm:text-base"
                                onClick={() => {
                                    const info = shopInfoMap[selectedShop.shopNo] || {};
                                    setEditAdvance(info.advanceAmount || '');
                                    setEditRent(info.monthlyRent || '');
                                    setEditStartingMonth('');
                                    setSelectedShop(prev => ({
                                        ...prev,
                                        tenantId: info.tenantId,
                                        shopId: info.shopId
                                    }));
                                    setShowConfirm(false);
                                    setShowEditPopup(true);
                                }}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showEditPopup && selectedShop && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto">
                        <div className="text-left text-base sm:text-lg text-[#E4572E] font-bold mb-4">
                            {selectedShop.tenantName} - {shopInfoMap[selectedShop.shopNo]?.doorNo || ''}
                        </div>
                        <div className="text-left space-y-4">
                            <div>
                                <label className="font-semibold block text-sm sm:text-base mb-1">Rent</label>
                                <input
                                    type="text"
                                    placeholder="Rent"
                                    value={formatINR(editRent)}
                                    onChange={(e) => setEditRent(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full border px-3 py-2 rounded-md focus:outline-none text-sm sm:text-base"
                                />
                            </div>
                            <div>
                                <label className="font-semibold block text-sm sm:text-base mb-1">Advance</label>
                                <input
                                    type="text"
                                    placeholder="Advance"
                                    value={formatINR(editAdvance)}
                                    onChange={(e) => setEditAdvance(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full border px-3 py-2 rounded-md focus:outline-none text-sm sm:text-base"
                                />
                            </div>
                            <div>
                                <label className="font-semibold block text-sm sm:text-base mb-1">Starting Month for This Rent</label>
                                <input
                                    type="month"
                                    value={editStartingMonth}
                                    onChange={(e) => setEditStartingMonth(e.target.value)}
                                    className="w-full border px-3 py-2 rounded-md focus:outline-none text-sm sm:text-base"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end mt-6 gap-3 sm:gap-4">
                            <button 
                                className="bg-gray-300 px-4 py-2 rounded-md text-sm sm:text-base" 
                                onClick={() => { setShowEditPopup(false); setSelectedShop(null); setEditRent(''); setEditAdvance(''); setEditStartingMonth(''); }}
                            >
                                Close
                            </button>
                            <button 
                                className="bg-[#BF9853] text-white px-4 py-2 rounded-md text-sm sm:text-base" 
                                onClick={handleSaveRentAdvance}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showVacantPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto p-4">
                    <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] shadow-xl">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                            <div>
                                <h2 className="text-lg sm:text-xl font-semibold">Vacant Shop Details</h2>
                            </div>
                            <div className="flex items-center gap-4 sm:gap-7">
                                <button 
                                    className="text-[#E4572E] font-semibold text-sm cursor-pointer hover:underline" 
                                    onClick={handleExportVacantPDF}
                                >
                                    Export PDF
                                </button>
                                <button 
                                    onClick={() => setShowVacantPopup(false)} 
                                    className="text-gray-500 hover:text-black text-lg sm:text-xl"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className="border-l-8 border-[#BF9853] rounded-lg max-h-[60vh] overflow-y-auto">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs sm:text-sm min-w-[400px]">
                                    <thead className="bg-[#FAF6ED] sticky top-0">
                                        <tr>
                                            <th className="px-2 py-2 text-left">S.No</th>
                                            <th className="px-2 py-2 text-left">Shop No</th>
                                            <th className="px-2 py-2 text-left">Door No</th>
                                            <th className="px-2 py-2 text-left">Project Reference Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredVacantShops.map((shop, index) => (
                                            <tr key={shop.shopNo} className="border-b border-gray-200">
                                                <td className="px-2 py-2">{index + 1}</td>
                                                <td className="px-2 py-2 font-medium">{shop.shopNo}</td>
                                                <td className="px-2 py-2">{shop.doorNo || 'N/A'}</td>
                                                <td className="px-2 py-2">{shop.propertyName || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Dashboard;