import React, { useState, useEffect, useMemo } from "react";
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
    const [editAdvance, setEditAdvance] = useState('');
    const [editRent, setEditRent] = useState('');
    const [editStartingMonth, setEditStartingMonth] = useState('');
    const [tableData, setTableData] = useState([]);
    const [selectedShop, setSelectedShop] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [properties, setProperties] = useState([]);
    const [showVacantPopup, setShowVacantPopup] = useState(false);
    const [sortField, setSortField] = useState('tenantName'); // or 'shopNo'
    const [sortOrder, setSortOrder] = useState('asc'); // or 'desc'
    const [selectedShopNo, setSelectedShopNo] = useState('');
    const [selectedTenantName, setSelectedTenantName] = useState('');
    const [selectedDoorNo, setSelectedDoorNo] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [selectedMonthYear, setSelectedMonthYear] = useState(getCurrentMonth());
    const selectedYear = selectedMonthYear ? parseInt(selectedMonthYear.split('-')[0]) : '';
    const selectedMonth = selectedMonthYear ? parseInt(selectedMonthYear.split('-')[1]) - 1 : '';
    useEffect(() => {
        const savedPaymentStatus = sessionStorage.getItem('paymentStatus');
        const savedShopNo = sessionStorage.getItem('selectedShopNo')
        const savedSelectedDoorNo = sessionStorage.getItem('selectedDoorNo');
        const savedTenantName = sessionStorage.getItem('selectedTenantName');
        const savedSelectedProperty = sessionStorage.getItem('selectedProperty');
        try {
            if (savedPaymentStatus) setPaymentStatus(JSON.parse(savedPaymentStatus));
            if (savedShopNo) setSelectedShopNo(JSON.parse(savedShopNo));
            if (savedTenantName) setSelectedTenantName(JSON.parse(savedTenantName));
            if (savedSelectedDoorNo) setSelectedDoorNo(JSON.parse(savedSelectedDoorNo));
            if (savedSelectedProperty) setSelectedProperty(JSON.parse(savedSelectedProperty));
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
    };
    useEffect(() => {
        if (paymentStatus) sessionStorage.setItem('paymentStatus', JSON.stringify(paymentStatus));
        if (selectedShopNo) sessionStorage.setItem('selectedShopNo', JSON.stringify(selectedShopNo));
        if (selectedDoorNo) sessionStorage.setItem('selectedDoorNo', JSON.stringify(selectedDoorNo));
        if (selectedTenantName) sessionStorage.setItem('selectedTenantName', JSON.stringify(selectedTenantName));
        if (selectedProperty) sessionStorage.setItem('selectedProperty', JSON.stringify(selectedProperty));
    }, [paymentStatus, selectedShopNo, selectedDoorNo, selectedTenantName, selectedProperty]);

    const handleSort = (field) => {
        if (sortField === field) {
            // Toggle the sort order
            setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };
    [...tableData].sort((a, b) => {
        let valA = a[sortField]?.toString().toLowerCase() || '';
        let valB = b[sortField]?.toString().toLowerCase() || '';

        if (sortField === 'shopNo') {
            // Sort by first character (alphabetical)
            valA = valA.charAt(0);
            valB = valB.charAt(0);
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });


    const vacantShops = useMemo(() => {
        return tableData.filter(shop =>
            shop.tenantName === "Vacant" || !shop.advance
        );
    }, [tableData]);
    useEffect(() => {
        fetchProperties();
    }, []);
    const fetchProperties = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/properties/all');
            if (response.ok) {
                const data = await response.json();
                setProperties(data);
                // Extract property names
            } else {
                console.log('Error fetching properties.');
            }
        } catch (error) {
            console.error('Error:', error);
            console.log('Error fetching properties.');
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
        fetchTenants();
    }, []);
    const fetchTenants = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/tenantShop/getAll');
            if (response.ok) {
                const data = await response.json();
                setTenantShopData(data);
                console.log(data);
                //get the total actual rent
                let total = 0;
                data.forEach(tenant => {
                    tenant.property?.forEach(property => {
                        property.shops?.forEach(shop => {
                            if (shop.active && shop.monthlyRent) {
                                total += parseFloat(shop.monthlyRent) || 0;
                            }
                        });
                    });
                });
                console.log(total);
                setTotalMonthlyRent(total);
            } else {
                console.error('Error fetching tenants.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const shopInfoMap = {};
    tenantShopData.forEach(tenant => {
        tenant.property?.forEach(property => {
            property.shops?.forEach(shop => {
                if (shop.shopNo) {
                    shopInfoMap[shop.shopNo] = {
                        doorNo: shop.doorNo || '',
                        propertyName: property.propertyName || '',
                        advanceAmount: shop.advanceAmount || '',
                        monthlyRent: shop.monthlyRent || '',
                        tenantId: tenant.id,     // ← Add tenant ID
                        shopId: shop.id,          // ← Add shop ID
                        startingDate: shop.startingDate,
                        shouldCollectAdvance: shop.shouldCollectAdvance
                    };
                }
            });
        });
    });
    const formatDateOnly = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    useEffect(() => {
        const allShops = [];
        // 1. Collect all shop data from properties
        properties.forEach(property => {
            property.propertyDetailsList?.forEach(shop => {
                if (shop.shopNo) {
                    allShops.push({
                        shopNo: shop.shopNo,
                        doorNo: shop.doorNo || '',
                        propertyName: property.propertyName || '',
                        advance: null,
                        tenantName: null,
                        tenantId: null,
                        shopId: shop.id,
                        active: false
                    });
                }
            });
        });
        // 2. Merge tenant data (excluding advance)
        tenantShopData.forEach(tenant => {
            tenant.property?.forEach(property => {
                property.shops?.forEach(shop => {
                    const shopEntryIndex = allShops.findIndex(s => s.shopNo === shop.shopNo);
                    if (shopEntryIndex !== -1) {
                        allShops[shopEntryIndex] = {
                            ...allShops[shopEntryIndex],
                            tenantName: tenant.tenantName || '',
                            tenantId: tenant.id,
                            active: shop.active ?? true
                        };
                    }
                });
            });
        });
        // 3. Filter rent data for selected year
        const filteredForms = rentForms.filter(entry => {
            const date = new Date(entry.forTheMonthOf);
            return (entry.formType === 'Rent' || entry.formType === 'Pending Rent') &&
                date.getFullYear() === parseInt(selectedYear);
        });
        // 4. Group rents and collect detailed history
        const groupedRentals = {};
        const rentHistoryMap = {};
        filteredForms.forEach(entry => {
            const month = new Date(entry.forTheMonthOf).getMonth();
            const shopKey = entry.shopNo;
            const amount = parseFloat(entry.amount || 0);
            const paidOn = formatDateOnly(entry.paidOnDate) || '';
            if (!groupedRentals[shopKey]) {
                groupedRentals[shopKey] = Array(12).fill(null).map(() => []);
            }
            if (!rentHistoryMap[shopKey]) {
                rentHistoryMap[shopKey] = Array(12).fill(null).map(() => []);
            }
            groupedRentals[shopKey][month].push(amount);
            rentHistoryMap[shopKey][month].push(`${paidOn} - ₹${amount.toLocaleString()}`);
        });
        // 5. Advance map and history
        const advanceMap = {};
        const advanceDetailsMap = {};
        const advanceAdjustmentDetailsMap = {};
        rentForms.forEach(entry => {
            if (entry.formType === 'Advance' && entry.shopNo) {
                const amount = parseFloat(entry.amount || 0);
                const paidOn = formatDateOnly(entry.paidOnDate) || '';
                const shopKey = entry.shopNo;
                if (!advanceMap[shopKey]) {
                    advanceMap[shopKey] = 0;
                    advanceDetailsMap[shopKey] = [];
                    advanceAdjustmentDetailsMap[shopKey] = [];
                }
                advanceMap[shopKey] += amount;
                advanceDetailsMap[shopKey].push(`${paidOn} - ₹${amount.toLocaleString()}`);
            } else if ((entry.formType === 'Rent' || entry.formType === 'Pending Rent') && entry.paymentMode?.trim() === 'Advance Adjustment' && entry.shopNo) {
                const amount = parseFloat(entry.amount || 0);
                const paidOn = formatDateOnly(entry.paidOnDate) || '';
                const shopKey = entry.shopNo;
                if (!advanceAdjustmentDetailsMap[shopKey]) {
                    advanceAdjustmentDetailsMap[shopKey] = [];
                }
                advanceAdjustmentDetailsMap[shopKey].push(`${paidOn} - ₹${amount.toLocaleString()}`);
            }
        });
        // 6. Final table data
        const finalTableData = [];
        allShops.forEach((shop) => {
            const months = groupedRentals[shop.shopNo] || Array(12).fill(null).map(() => []);
            const rentDetails = rentHistoryMap[shop.shopNo] || Array(12).fill([]);
            const advanceAmount = advanceMap[shop.shopNo] || 0;
            const advanceDetails = advanceDetailsMap[shop.shopNo] || [];
            const advanceAdjustmentDetails = advanceAdjustmentDetailsMap[shop.shopNo] || [];
            const totalRentPaid = rentForms
                .filter(entry =>
                    entry.shopNo === shop.shopNo &&
                    (entry.formType === 'Rent' || entry.formType === 'Pending Rent') &&
                    entry.paymentMode?.trim() === 'Advance Adjustment'
                )
                .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
            const remainingAdvance = Math.max(0, advanceAmount - totalRentPaid);

            const wasActiveThisYear = months.some(monthArr => monthArr.length > 0);
            const row = {
                shNo: finalTableData.length + 1,
                shopNo: shop.shopNo,
                tenantName: shop.active ? shop.tenantName : "Vacant",
                doorNo: shop.doorNo,
                advance: shop.active ? remainingAdvance : null,
                advanceDetails: shop.active ? advanceDetails : [],
                advanceAdjustmentDetails: shop.active ? advanceAdjustmentDetails : [],
                months,
                rentDetails,
                propertyName: shop.propertyName,
                vacated: !shop.active && wasActiveThisYear,
                startingDate: shop.active ? shopInfoMap[shop.shopNo]?.startingDate : null,
                shouldCollectAdvance: shopInfoMap[shop.shopNo]?.shouldCollectAdvance ?? true
            };
            if (!shop.active && wasActiveThisYear) {
                const hasAnotherActiveTenant = allShops.some(
                    s => s.shopNo === shop.shopNo && s.active
                );
                finalTableData.push({
                    ...row,
                    tenantName: shop.tenantName || 'Vacated',
                    vacated: true
                });
                if (!hasAnotherActiveTenant) {
                    finalTableData.push({
                        ...row,
                        tenantName: 'Vacant',
                        advance: null,
                        advanceDetails: [],
                        months: Array(12).fill([]),
                        rentDetails: Array(12).fill([]),
                        vacated: false
                    });
                }
            } else {
                finalTableData.push(row);
            }
        });
        setTableData(finalTableData);
    }, [rentForms, tenantShopData, properties, selectedYear]);
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
            // First, update the tenant shop data
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
                // If rent amount and starting month are provided, save rent history
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
                
                await fetchTenants();  // Refresh data
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
            return matchesShopNo && matchesTenantName && matchesDoorNo && matchesProperty && (!isVacant || paymentStatus === '') && matchesMonthStatus;
        });
    }, [
        tableData,
        selectedShopNo,
        selectedTenantName,
        selectedDoorNo,
        selectedMonth,
        paymentStatus,
        selectedProperty, // ✅ Include here
    ]);

    const sortedTableData = useMemo(() => {
        return [...filteredTableData].sort((a, b) => {
            const normalize = (val) =>
                val?.toString().replace(/\s+/g, '').toUpperCase() || '';
            const valA = normalize(a[sortField]?.split(',')[0]);
            const valB = normalize(b[sortField]?.split(',')[0]);
            if (sortField === 'shopNo') {
                // Match prefix (letters), number, and optional suffix
                const regex = /^([A-Z]+)?(\d+)?([A-Z]*)?$/;
                const [, prefixA = '', numA = '', suffixA = ''] =
                    valA.match(regex) || [];
                const [, prefixB = '', numB = '', suffixB = ''] =
                    valB.match(regex) || [];
                if (prefixA < prefixB) return sortOrder === 'asc' ? -1 : 1;
                if (prefixA > prefixB) return sortOrder === 'asc' ? 1 : -1;
                const num1 = parseInt(numA, 10) || 0;
                const num2 = parseInt(numB, 10) || 0;
                if (num1 < num2) return sortOrder === 'asc' ? -1 : 1;
                if (num1 > num2) return sortOrder === 'asc' ? 1 : -1;
                if (suffixA < suffixB) return sortOrder === 'asc' ? -1 : 1;
                if (suffixA > suffixB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            }
            // Default sorting for other fields
            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredTableData, sortField, sortOrder]);

    const options = properties.map((property) => ({
        value: property.propertyName,
        label: property.propertyName,
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
                const isBeforeStart = shopStartDate
                    ? (selectedYear < shopStartDate.getFullYear() ||
                        (selectedYear === shopStartDate.getFullYear() && i < shopStartDate.getMonth()))
                    : false;
                const totalAmount = amounts.reduce((a, b) => a + b, 0);
                if (isVacant || isBeforeStart) return "-";
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
        const tableColumn = ["S.No", "Shop No", "Door No", "Property Name"];
        const tableRows = filteredVacantShops.map((shop, index) => [
            index + 1,
            shop.shopNo,
            shop.doorNo || 'N/A',
            shop.propertyName || 'N/A'
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
    }, [filteredTableData]);
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
        <div>
            <div className='mx-auto lg:w-[1750px] p-4 lg:pl-8 bg-white lg:ml-12 lg:mr-6 rounded-md text-left flex'>
                <div>
                    <h1 className='font-semibold mb-3'>Select Year</h1>
                    <input
                        type="month"
                        value={selectedMonthYear}
                        onChange={(e) => setSelectedMonthYear(e.target.value)}
                        className="border-2 border-[#BF9853] rounded-lg p-2 w-[180px] h-[45px] focus:outline-none"
                    />
                </div>
                <div className="flex gap-4 mt-9 ml-3.5 w-full flex-wrap">
                    <div className="min-w-[200px]">
                        <Select
                            options={shopOptions}
                            isClearable
                            placeholder="Select Shop No"
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
                    <div className="min-w-[200px]">
                        <Select
                            options={tenantOptions}
                            isClearable
                            placeholder="Select Tenant Name"
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
                    <div className="min-w-[200px]">
                        <Select
                            options={doorOptions}
                            placeholder="Select Door No"
                            isClearable
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
                    <div className="min-w-[200px]">
                        <select
                            className='w-full h-[45px] border-2 border-[#BF9853] rounded-lg pl-3 focus:outline-none'
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
                            <option value="">Select Status</option>
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                        </select>
                    </div>
                    <div className="min-w-[200px]">
                        <Select
                            className="w-[300px]"
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

                </div>
            </div>
            {/* Rent Table */}
            <div className='mx-auto lg:w-[1750px] p-4 lg:pl-8 mt-6 bg-white lg:ml-12 mr-6 rounded-md'>
                <div className='flex justify-end gap-10 items-center mb-3'>
                    <div className=" font-semibold flex gap-2">
                        <h1>Total Monthly Rent:</h1>
                        <h1 className='font-bold cursor-pointer text-[#E4572E]'> ₹{totalMonthlyRents.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</h1>
                    </div>
                    <div className="text-right font-semibold text-base">
                        Total Collected for {monthNames[selectedMonth]} {selectedYear}:&nbsp;
                        <span className="text-green-600">
                            ₹{totalForSelectedMonth.toLocaleString("en-IN")}
                        </span>
                    </div>
                    <div className="text-right font-semibold text-base">
                        Balance Rent to Collect for {monthNames[selectedMonth]} {selectedYear}:&nbsp;
                        <span className="text-red-600">
                            ₹{(totalMonthlyRents - totalForSelectedMonth).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </span>
                    </div>
                    <div className="font-semibold flex gap-2">
                        <h1>Total Occupied Shops:</h1>
                        <h1 className='font-bold cursor-pointer text-[#E4572E]'>
                            {occupiedCount}
                        </h1>
                    </div>
                    <div className="font-semibold flex gap-2">
                        <h1>Total Shop Vacancy :</h1>
                        <h1
                            className='font-bold cursor-pointer text-[#E4572E]'
                            onClick={() => setShowVacantPopup(true)}
                        >
                            {filteredVacantShops.length}
                        </h1>
                    </div>
                    <h1
                        className='font-bold text-sm text-[#E4572E] cursor-pointer hover:underline'
                        onClick={handleExportPDF}
                    >
                        Export PDF
                    </h1>
                </div>
                <div className="rounded-lg border-l-8 border-[#BF9853] overflow-x-auto no-scrollbar">
                    <table className="border-collapse w-full text-left">
                        <thead>
                            <tr className="bg-[#FAF6ED]">
                                <th className="px-2 py-2 font-semibold cursor-pointer">S.No</th>
                                <th
                                    className="px-4 py-2 font-semibold cursor-pointer"
                                    onClick={() => handleSort('shopNo')}
                                >
                                    Sh.No {sortField === 'shopNo' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    className="px-4 py-2 font-semibold cursor-pointer"
                                    onClick={() => handleSort('tenantName')}
                                >
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
                                            
                                            let tooltip = [];
                                            
                                            // Add advance payments
                                            advanceDetails.forEach(detail => {
                                                tooltip.push(detail);
                                            });
                                            
                                            // Add advance adjustments with clear labeling
                                            adjustmentDetails.forEach(detail => {
                                                tooltip.push(detail + ' (Advance Adjustment)');
                                            });
                                            
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
                                            const isBeforeStart = shopStartDate
                                                ? (selectedYear < shopStartDate.getFullYear() ||
                                                    (selectedYear === shopStartDate.getFullYear() && i < shopStartDate.getMonth()))
                                                : false;
                                            return (
                                                <td key={i} className="px-4 py-2 text-center" title={hoverText}>
                                                    {isVacant || isBeforeStart ? (
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[480px] h-[200px]">
                        <p className="text-[22px] font-semibold mb-2 text-center">
                            Are you sure you want to edit
                        </p>
                        <div className="text-[22px] font-semibold mb-4 text-center">
                            <span className="text-[#BF9853] ">{selectedShop.tenantName}</span>?
                        </div>
                        <div className="flex justify-end gap-4">
                            <button className="bg-gray-300 px-4 py-2 rounded-md mt-8" onClick={() => { setShowConfirm(false); setSelectedShop(null); }}>
                                Cancel
                            </button>
                            <button
                                className="bg-[#BF9853] text-white px-4 py-2 rounded-md mt-8"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] relative">
                        <div className="text-left left-2 text-lg text-[#E4572E] font-bold">
                            {selectedShop.tenantName} - {shopInfoMap[selectedShop.shopNo]?.doorNo || ''}
                        </div>
                        <div className="mt-5 text-left">
                            <div>
                                <label className="font-semibold block">Rent</label>
                                <input
                                    type="text"
                                    placeholder="Rent"
                                    value={formatINR(editRent)}
                                    onChange={(e) => setEditRent(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full border px-3 py-2 rounded-md focus:outline-none"
                                />
                            </div>
                            <div className=" mt-3">
                                <label className="font-semibold block">Advance</label>
                                <input
                                    type="text"
                                    placeholder="Advance"
                                    value={formatINR(editAdvance)}
                                    onChange={(e) => setEditAdvance(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full border px-3 py-2 rounded-md focus:outline-none"
                                />
                            </div>
                            <div className=" mt-3">
                                <label className="font-semibold block">Starting Month for This Rent</label>
                                <input
                                    type="month"
                                    value={editStartingMonth}
                                    onChange={(e) => setEditStartingMonth(e.target.value)}
                                    className="w-full border px-3 py-2 rounded-md focus:outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-6 gap-4">
                            <button className="bg-gray-300 px-4 py-2 rounded-md" onClick={() => { setShowEditPopup(false); setSelectedShop(null); setEditRent(''); setEditAdvance(''); setEditStartingMonth(''); }}>
                                Close
                            </button>
                            <button className="bg-[#BF9853] text-white px-4 py-2 rounded-md" onClick={handleSaveRentAdvance}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showVacantPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto">
                    <div className="bg-white rounded-xl p-6 w-full h-[350px] max-w-lg shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-lg font-semibold">Vacant Shop Details</h2>
                            </div>
                            <div className="flex items-center gap-7">
                                <h2 className="text-[#E4572E] font-semibold text-sm cursor-pointer" onClick={handleExportVacantPDF}>
                                    Export PDF
                                </h2>
                                <button onClick={() => setShowVacantPopup(false)} className="text-gray-500 hover:text-black">
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className="border-l-8 border-[#BF9853] rounded-lg h-[250px] overflow-y-auto">
                            <table className="w-full  text-sm ">
                                <thead className="bg-[#FAF6ED]">
                                    <tr>
                                        <th className="px-2 py-1 ">S.No</th>
                                        <th className="px-2 py-1 ">Shop No</th>
                                        <th className="px-2 py-1 ">Door No</th>
                                        <th className="px-2 py-1 ">Property Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredVacantShops.map((shop, index) => (
                                        <tr key={shop.shopNo}>
                                            <td className="px-2 py-1 ">{index + 1}</td>
                                            <td className="px-2 py-1 ">{shop.shopNo}</td>
                                            <td className="px-2 py-1 ">{shop.doorNo || 'N/A'}</td>
                                            <td className="px-2 py-1 ">{shop.propertyName || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Dashboard;