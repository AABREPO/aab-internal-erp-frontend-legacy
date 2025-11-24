import React, { useState, useRef, useEffect } from "react";
import Attach from '../Images/Attachfile.svg';
import Select from 'react-select';
import Swal from 'sweetalert2';
import axios from 'axios';
const Form = () => {
    const [selectedRentType, setSelectedRentType] = useState("Rent");
    const getPreviousMonth = () => {
        const now = new Date();
        now.setMonth(now.getMonth() - 1); // go to previous month
        return now.toISOString().slice(0, 7); // format YYYY-MM
    };
    const [startingDate, setStartingDate] = useState('');
    const [calculatedRent, setCalculatedRent] = useState('');
    const [projects, setProjects] = useState([]);
    const [formTenantName, setFormTenantName] = useState('');
    const [formShopNo, setFormShopNo] = useState('');
    const [tenantOptions, setTenantOptions] = useState([]);
    const [tenantShopData, setTenantShopData] = useState([]);
    const [selectedTenantId, setSelectedTenantId] = useState('');
    const [shopNoOptions, setShopNoOptions] = useState([]);
    const [shopNoIdToShopNoMap, setShopNoIdToShopNoMap] = useState({});
    const [selectedMonth, setSelectedMonth] = useState(getPreviousMonth());
    const [amount, setAmount] = useState("");
    const [formPaymentMode, setFormPaymentMode] = useState("");
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [filteredShopNoOptions, setFilteredShopNoOptions] = useState(shopNoOptions);

    const handleFileChanges = (e) => {
        setFile(e.target.files[0]);
        setUploadStatus('');
    };
    const [paidOnDate, setPaidOnDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0]; // "YYYY-MM-DD"
    });
    const [selectedRentFile, setSelectedRentFile] = useState(null);
    const fileInputRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentModeOptions, setPaymentModeOptions] = useState([]);
    const [advanceAmount, setAdvanceAmount] = useState(0);
    const [rentalFormsData, setRentalFormsData] = useState([]);
    const [amountError, setAmountError] = useState('');
    const [closureDate, setClosureDate] = useState('');
    const [rentHistoryData, setRentHistoryData] = useState([]);
    const [shopClosureToggle, setShopClosureToggle] = useState(false);
    const [accountDetails, setAccountDetails] = useState([]);

    const [showWeeklyPaymentPopup, setShowWeeklyPaymentPopup] = useState(false);
    const [weeklyPaymentData, setWeeklyPaymentData] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: "",
        paymentMode: "",
        chequeNo: "",
        chequeDate: "",
        transactionNumber: "",
        accountNumber: ""
    });

    const getCurrentWeekNumber = () => {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
        return Math.ceil((days + startOfYear.getDay() + 1) / 7);
    };
    useEffect(() => {
        const savedSelectedRentType = sessionStorage.getItem('selectedRentType');
        const savedFormShopNo = sessionStorage.getItem('formShopNo')
        const savedSelectedMonth = sessionStorage.getItem('selectedMonth');
        const savedFormTenantName = sessionStorage.getItem('formTenantName');
        const savedAmount = sessionStorage.getItem('amount');
        const savedPaidOnDate = sessionStorage.getItem('paidOnDate');
        const savedFormPaymentMode = sessionStorage.getItem('formPaymentMode');
        const savedCalculatedRent = sessionStorage.getItem('calculatedRent');
        const savedClosureDate = sessionStorage.getItem('closureDate');
        try {
            if (savedSelectedRentType) setSelectedRentType(JSON.parse(savedSelectedRentType));
            if (savedSelectedMonth) setSelectedMonth(JSON.parse(savedSelectedMonth));
            if (savedFormShopNo) setFormShopNo(JSON.parse(savedFormShopNo));
            if (savedFormTenantName) setFormTenantName(JSON.parse(savedFormTenantName));
            if (savedAmount) setAmount(JSON.parse(savedAmount));
            if (savedFormPaymentMode) setFormPaymentMode(JSON.parse(savedFormPaymentMode));
            if (savedPaidOnDate) setPaidOnDate(JSON.parse(savedPaidOnDate));
            if (savedCalculatedRent) setCalculatedRent(JSON.parse(savedCalculatedRent));
            if (savedClosureDate) setClosureDate(JSON.parse(savedClosureDate));
        } catch (error) {
            // Error parsing sessionStorage data
        }
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);
    const handleBeforeUnload = () => {
        sessionStorage.removeItem('selectedRentType');
        sessionStorage.removeItem('formShopNo');
        sessionStorage.removeItem('selectedMonth');
        sessionStorage.removeItem('formTenantName');
        sessionStorage.removeItem('amount');
        sessionStorage.removeItem('paidOnDate');
        sessionStorage.removeItem('formPaymentMode');
        sessionStorage.removeItem('calculatedRent');
        sessionStorage.removeItem('closureDate');
    };
    useEffect(() => {
        if (selectedRentType) sessionStorage.setItem('selectedRentType', JSON.stringify(selectedRentType));
        if (formShopNo) sessionStorage.setItem('formShopNo', JSON.stringify(formShopNo));
        if (selectedMonth) sessionStorage.setItem('selectedMonth', JSON.stringify(selectedMonth));
        if (formTenantName) sessionStorage.setItem('formTenantName', JSON.stringify(formTenantName));
        if (amount) sessionStorage.setItem('amount', JSON.stringify(amount));
        if (paidOnDate) sessionStorage.setItem('paidOnDate', JSON.stringify(paidOnDate));
        if (formPaymentMode) sessionStorage.setItem('formPaymentMode', JSON.stringify(formPaymentMode));
        if (calculatedRent) sessionStorage.setItem('calculatedRent', JSON.stringify(calculatedRent));
        if (closureDate) sessionStorage.setItem('closureDate', JSON.stringify(closureDate));
    }, [selectedRentType, formShopNo, selectedMonth, formTenantName, amount, paidOnDate, formPaymentMode, calculatedRent, closureDate]);
    const [message, setMessage] = useState('');
    const [eno, setEno] = useState(null);
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedRentFile(file);
        }
        e.target.value = '';
    };
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
                const shopNoIdMap = {};
                ownProjects
                    .filter(project => project.projectReferenceName)
                    .forEach(project => {
                        const propertyDetailsArray = Array.isArray(project.propertyDetails)
                            ? project.propertyDetails
                            : Array.from(project.propertyDetails || []);
                        propertyDetailsArray.forEach(detail => {
                            if (detail.shopNo && detail.id) {
                                shopNoIdMap[detail.id] = detail.shopNo;
                            }
                        });
                    });
                setShopNoIdToShopNoMap(shopNoIdMap);
            } else {
                setMessage('Error fetching projects.');
            }
        } catch (error) {
            setMessage('Error fetching projects.');
        }
    };
    useEffect(() => {
        if (projects.length > 0) {
            fetchTenants();
        }
    }, [selectedRentType, projects]);
    const fetchTenants = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/tenant_link_shop/getAll');
            if (response.ok) {
                const data = await response.json();
                setTenantShopData(data);
                
                const shopNoIdMap = {};
                projects
                    .filter(project => project.projectReferenceName)
                    .forEach(project => {
                        const propertyDetailsArray = Array.isArray(project.propertyDetails)
                            ? project.propertyDetails
                            : Array.from(project.propertyDetails || []);
                        propertyDetailsArray.forEach(detail => {
                            if (detail.shopNo && detail.id) {
                                shopNoIdMap[detail.id] = detail.shopNo;
                            }
                        });
                    });
                const shopMap = new Map();
                data.flatMap(t => (t.shopNos || []))
                    .forEach(shop => {
                        if (shop.shopNoId) {
                            const shopNo = shopNoIdMap[shop.shopNoId];
                            if (shopNo && !shopMap.has(shopNo)) {
                                shopMap.set(shopNo, shop.shopNoId);
                            }
                        }
                    });
                const shopOptions = Array.from(shopMap.entries()).map(([shopNo, shopNoId]) => ({
                    label: shopNo,
                    value: shopNo,
                    shopNoId: shopNoId
                }));
                setShopNoOptions(shopOptions);
                
                if (selectedRentType === "Refund") {
                    const vacatedTenants = data.filter(t =>
                        t.shopNos?.some(shop => shop.shopClosureDate)
                    );
                    const tenantOptionsUnique = vacatedTenants
                        .filter(t => t.tenantName)
                        .map(t => ({
                            label: t.tenantName,
                            value: t.tenantName,
                            tenantId: t.id
                        }))
                        .filter((t, i, arr) => arr.findIndex(x => x.value === t.value) === i);
                    setTenantOptions(tenantOptionsUnique);
                } else if (selectedRentType !== "Pending Rent") {
                    const activeTenants = data.filter(t =>
                        t.shopNos?.some(shop => !shop.shopClosureDate)
                    );
                    const tenantOptionsUnique = activeTenants
                        .filter(t => t.tenantName)
                        .map(t => ({
                            label: t.tenantName,
                            value: t.tenantName,
                            tenantId: t.id
                        }))
                        .filter((t, i, arr) => arr.findIndex(x => x.value === t.value) === i);
                    setTenantOptions(tenantOptionsUnique);
                } else {
                    const allTenants = data.filter(t => t.tenantName);
                    const tenantOptionsUnique = allTenants
                        .map(t => ({
                            label: t.tenantName,
                            value: t.tenantName,
                            tenantId: t.id
                        }))
                        .filter((t, i, arr) => arr.findIndex(x => x.value === t.value) === i);
                    setTenantOptions(tenantOptionsUnique);
                }
            } else {
                setMessage('Error fetching tenants.');
            }
        } catch (error) {
            setMessage('Error fetching tenants.');
        }
    };
    const [shopInfoMap, setShopInfoMap] = useState({});
    useEffect(() => {
        const newShopInfoMap = {};
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
                        
                        newShopInfoMap[shopNo] = {
                            doorNo: doorNo,
                            projectReferenceName: projectReferenceName,
                            advanceAmount: shop.advanceAmount || '',
                            monthlyRent: shop.monthlyRent || '',
                            startingDate: shop.startingDate,
                            tenantNameId: tenant.id,
                            shopNoId: shop.shopNoId,
                            shopClosureDate: shop.shopClosureDate || '',
                            isActive: !shop.shopClosureDate
                        };
                    }
                }
            });
        });
        setShopInfoMap(newShopInfoMap);
    }, [tenantShopData, projects, shopNoIdToShopNoMap]);
    const formatINR = (value) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        if (!numericValue) return '';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(Number(numericValue));
    };
    const fetchLatestEno = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/rental_forms/getAll');
            if (!response.ok) {
                throw new Error('Failed to fetch ENo');
            }
            const data = await response.json();
            if (data.length > 0) {
                const sortedData = data.sort((a, b) => b.eno - a.eno);
                const lastEno = sortedData[0].eno;
                setEno(lastEno + 1);
            } else {
                setEno(1);
            }
        } catch (error) {
            // Error fetching latest ENo
        }
    };
    useEffect(() => {
        fetchLatestEno();
    }, []);
    useEffect(() => {
        fetchPaymentModes();
        fetchRentalForms();
        fetchRentHistory();
        fetchAccountDetails();
    }, []);
    const fetchPaymentModes = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/payment_mode/getAll');
            if (response.ok) {
                const data = await response.json();
                setPaymentModeOptions(data);
            } else {
                setMessage('Error fetching tile area names.');
            }
        } catch (error) {
            setMessage('Error fetching tile area names.');
        }
    };
    const fetchRentalForms = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/rental_forms/getAll');
            if (response.ok) {
                const data = await response.json();
                setRentalFormsData(data);
            }
        } catch (error) {
            // Error fetching rental forms
        }
    };
    const fetchRentHistory = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/rent-history/getAll');
            if (response.ok) {
                const data = await response.json();
                setRentHistoryData(data);
            } else {
                console.error('Error fetching rent history data');
            }
        } catch (error) {
            // Error fetching rent history
        }
    };
    const fetchAccountDetails = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/account-details/getAll');
            if (response.ok) {
                const data = await response.json();
                setAccountDetails(data);
            }
        } catch (error) {
            // Error fetching account details
        }
    };
    const calculateAdvanceAmount = (tenantName, shopNo) => {

        if (!tenantName || !shopNo || rentalFormsData.length === 0) {
            setAdvanceAmount(0);
            return;
        }
        let totalAdvance = 0;
        const relevantForms = rentalFormsData.filter(form =>
            form.tenantName === tenantName && form.shopNo === shopNo
        );
        relevantForms.forEach(form => {
            if (form.formType === 'Advance' && form.amount) {
                const advanceAmount = parseFloat(form.amount) || 0;
                totalAdvance += advanceAmount;
            } else if (
                form.paymentMode &&
                form.paymentMode.trim() === 'Advance Adjustment' &&
                form.amount != null
            ) {
                const adjustmentAmount = parseFloat(form.amount) || 0;
                totalAdvance -= adjustmentAmount;
            } else if (form.formType === 'Shop Closure' && form.refundAmount) {
                const refundAmount = parseFloat(form.refundAmount) || 0;
                totalAdvance -= refundAmount;
            } else if (form.formType === 'Refund' && form.refundAmount) {
                const refundAmount = parseFloat(form.refundAmount) || 0;
                totalAdvance -= refundAmount;
            }
        });

        setAdvanceAmount(totalAdvance);
    };
    const buildTenantShopMapping = () => {
        const tenantShopMapping = {};
        tenantShopData.forEach(tenant => {
            tenant.shopNos?.forEach(shop => {
                if (!shop) return;
                const tenantShopKey = (shop.id ?? shop.shopNoId);
                const shopNo = shop.shopNoId ? (shopNoIdToShopNoMap[shop.shopNoId] || '') : '';
                if (!tenantShopKey || !shopNo) return;
                tenantShopMapping[tenantShopKey.toString()] = {
                    shopNo: shopNo,
                    tenantName: tenant.tenantName,
                    startingDate: shop.startingDate,
                    shopClosureDate: shop.shopClosureDate,
                    monthlyRent: shop.monthlyRent
                };
            });
        });
        return tenantShopMapping;
    };
    const normalizeMonthFormat = (monthString) => {
        if (!monthString) return null;
        const match = monthString.match(/^(\d{4})-(\d{1,2})$/);
        if (match) {
            const year = match[1];
            const month = parseInt(match[2], 10).toString().padStart(2, '0');
            return `${year}-${month}`;
        }
        return monthString;
    };

    const calculatePendingRentUpToDate = (endDate) => {
        if (!formTenantName || !formShopNo || !startingDate || rentHistoryData.length === 0) {
            return 0;
        }
        const calculationEndDate = closureDate || endDate;
        const tenantShopMapping = buildTenantShopMapping();
        const matchingTenantShopIds = Object.keys(tenantShopMapping).filter(id =>
            tenantShopMapping[id].shopNo === formShopNo &&
            tenantShopMapping[id].tenantName === formTenantName
        );
        if (matchingTenantShopIds.length === 0) {
            return 0;
        }
        let shopRentHistory = rentHistoryData.filter(history =>
            matchingTenantShopIds.includes(history.tenantWithShopNoId.toString())
        );
        if (shopRentHistory.length === 0) {
            const fallbackTenantShopId = matchingTenantShopIds[0];
            const tenantShopInfo = tenantShopMapping[fallbackTenantShopId] || {};
            const shopInfo = shopInfoMap[formShopNo] || {};
            const fallbackMonthlyRent = parseFloat(tenantShopInfo.monthlyRent || shopInfo.monthlyRent || 0);
            const fallbackStartDate = tenantShopInfo.startingDate || startingDate;
            if (fallbackMonthlyRent > 0 && fallbackStartDate) {
                const fallbackStart = new Date(fallbackStartDate);
                if (!isNaN(fallbackStart.getTime())) {
                    const fallbackMonth = `${fallbackStart.getFullYear()}-${(fallbackStart.getMonth() + 1).toString().padStart(2, '0')}`;
                    shopRentHistory = [{
                        tenantWithShopNoId: fallbackTenantShopId,
                        rentAmount: fallbackMonthlyRent,
                        startingMonthForThisRent: fallbackMonth
                    }];
                }
            }
        }
        if (shopRentHistory.length === 0) {
            return 0;
        }
        const sortedRentHistory = shopRentHistory.sort((a, b) => new Date(a.startingMonthForThisRent) - new Date(b.startingMonthForThisRent));
        const start = new Date(startingDate);
        const end = new Date(calculationEndDate);
        
        const allFormsForTenantShop = rentalFormsData.filter(form =>
            form.tenantName === formTenantName && form.shopNo === formShopNo
        );
        let totalPendingRent = 0;
        let currentDate = new Date(start.getFullYear(), start.getMonth(), 1);
        while (currentDate <= end) {
            const year = currentDate.getFullYear();
            const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            const currentMonth = `${year}-${month}`;
            const monthName = currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
            
            let monthlyRentDue = 0;
            for (let i = 0; i < sortedRentHistory.length; i++) {
                const historyEntry = sortedRentHistory[i];
                const historyStartDate = new Date(historyEntry.startingMonthForThisRent);
                if (historyStartDate <= currentDate) {
                    if (i === sortedRentHistory.length - 1 ||
                        new Date(sortedRentHistory[i + 1].startingMonthForThisRent) > currentDate) {
                        monthlyRentDue = parseFloat(historyEntry.rentAmount || 0);
                        break;
                    }
                }
            }
            if (monthlyRentDue === 0) {
                currentDate.setMonth(currentDate.getMonth() + 1);
                continue;
            }
            
            const formsMatchingTenantShop = rentalFormsData.filter(form =>
                form.tenantName === formTenantName && form.shopNo === formShopNo
            );
            
            const formsMatchingMonth = formsMatchingTenantShop.filter(form => {
                const normalizedFormMonth = normalizeMonthFormat(form.forTheMonthOf);
                return normalizedFormMonth === currentMonth;
            });
            const allRentPayments = rentalFormsData.filter(form => {
                const normalizedFormMonth = normalizeMonthFormat(form.forTheMonthOf);
                return form.tenantName === formTenantName &&
                    form.shopNo === formShopNo &&
                    normalizedFormMonth === currentMonth &&
                    (form.formType === "Rent" || form.formType === "Pending Rent");
            });
            const excludedForms = formsMatchingMonth.filter(form =>
                !(form.formType === "Rent" || form.formType === "Pending Rent")
            );            
            const originalMonthlyRentDue = monthlyRentDue;
            if (currentDate.getFullYear() === start.getFullYear() && currentDate.getMonth() === start.getMonth()) {
                const totalDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                const startDay = start.getDate();
                const rentPerDay = monthlyRentDue / totalDays;
                const proRatedDays = totalDays - startDay + 1;
                monthlyRentDue = Math.floor((rentPerDay * proRatedDays) / 10) * 10;
            }
            else if (currentDate.getFullYear() === end.getFullYear() && currentDate.getMonth() === end.getMonth()) {
                const totalDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                const endDay = end.getDate();
                const rentPerDay = monthlyRentDue / totalDays;
                monthlyRentDue = Math.floor((rentPerDay * endDay) / 10) * 10;
            }
            const totalPaidForMonth = allRentPayments.reduce((sum, form) => {
                return sum + parseFloat(form.amount || 0);
            }, 0);
            const pendingForMonth = monthlyRentDue - totalPaidForMonth;
            if (pendingForMonth > 0) {
                totalPendingRent += pendingForMonth;
            }
            currentDate.setMonth(currentDate.getMonth() + 1);
        }        
        return totalPendingRent;
    };
    const calculatePendingRentForPendingType = () => {
        if (!formTenantName || !formShopNo || !startingDate || rentHistoryData.length === 0 || tenantShopData.length === 0) {
            return 0;
        }
        const tenantInfo = shopInfoMap[formShopNo];
        const formShopNoId = tenantInfo?.shopNoId || null;
        
        let shopClosureDate = null;
        const matchingTenant = tenantShopData.find(tenant => tenant.tenantName === formTenantName);
        if (matchingTenant) {
            matchingTenant.shopNos?.forEach(shop => {
                const shopNo = shop.shopNoId ? shopNoIdToShopNoMap[shop.shopNoId] : null;
                if ((shopNo === formShopNo) || (shop.shopNoId === formShopNoId)) {
                    shopClosureDate = shop.shopClosureDate;
                }
            });
        }
        const tenantShopMapping = buildTenantShopMapping();
        const matchingTenantShopIds = Object.keys(tenantShopMapping).filter(id =>
            tenantShopMapping[id].shopNo === formShopNo &&
            tenantShopMapping[id].tenantName === formTenantName
        );
        if (matchingTenantShopIds.length === 0) {
            return 0;
        }
        let shopRentHistory = rentHistoryData.filter(history =>
            matchingTenantShopIds.includes(history.tenantWithShopNoId.toString())
        );
        if (shopRentHistory.length === 0) {
            const fallbackTenantShopId = matchingTenantShopIds[0];
            const tenantShopInfo = tenantShopMapping[fallbackTenantShopId] || {};
            const shopInfo = shopInfoMap[formShopNo] || {};
            const fallbackMonthlyRent = parseFloat(tenantShopInfo.monthlyRent || shopInfo.monthlyRent || 0);
            const fallbackStartDate = tenantShopInfo.startingDate || startingDate;
            if (fallbackMonthlyRent > 0 && fallbackStartDate) {
                const fallbackStart = new Date(fallbackStartDate);
                if (!isNaN(fallbackStart.getTime())) {
                    const fallbackMonth = `${fallbackStart.getFullYear()}-${(fallbackStart.getMonth() + 1).toString().padStart(2, '0')}`;
                    shopRentHistory = [{
                        tenantWithShopNoId: fallbackTenantShopId,
                        rentAmount: fallbackMonthlyRent,
                        startingMonthForThisRent: fallbackMonth
                    }];
                }
            }
        }
        if (shopRentHistory.length === 0) {
            return 0;
        }
        const sortedRentHistory = shopRentHistory.sort((a, b) => new Date(a.startingMonthForThisRent) - new Date(b.startingMonthForThisRent));
        const endDate = shopClosureDate || new Date().toISOString().split('T')[0];
        const infoStartDate = startingDate ? new Date(startingDate) : null;
        const earliestHistoryStart = sortedRentHistory.length
            ? new Date(sortedRentHistory[0].startingMonthForThisRent)
            : null;
        let start;
        if (infoStartDate && !isNaN(infoStartDate.getTime())) {
            start = new Date(infoStartDate.getFullYear(), infoStartDate.getMonth(), 1);
        } else if (earliestHistoryStart && !isNaN(earliestHistoryStart.getTime())) {
            start = new Date(earliestHistoryStart.getFullYear(), earliestHistoryStart.getMonth(), 1);
        } else {
            return 0;
        }
        const end = new Date(endDate);
        if (end < start) {
            if (earliestHistoryStart && !isNaN(earliestHistoryStart.getTime())) {
                start = new Date(earliestHistoryStart.getFullYear(), earliestHistoryStart.getMonth(), 1);
            } else {
                return 0;
            }
        }
        const allFormsForTenantShop = rentalFormsData.filter(form =>
            form.tenantName === formTenantName && 
            (form.shopNoId === formShopNoId || form.shopNo === formShopNo)
        );
        let totalPendingRent = 0;
        let currentDate = new Date(start.getFullYear(), start.getMonth(), 1);
        while (currentDate <= end) {
            const year = currentDate.getFullYear();
            const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            const currentMonth = `${year}-${month}`;
            const monthName = currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
            
            let monthlyRentDue = 0;
            for (let i = 0; i < sortedRentHistory.length; i++) {
                const historyEntry = sortedRentHistory[i];
                const historyStartDate = new Date(historyEntry.startingMonthForThisRent);
                if (historyStartDate <= currentDate) {
                    if (i === sortedRentHistory.length - 1 ||
                        new Date(sortedRentHistory[i + 1].startingMonthForThisRent) > currentDate) {
                        monthlyRentDue = parseFloat(historyEntry.rentAmount || 0);
                        break;
                    }
                }
            }
            if (monthlyRentDue === 0) {
                currentDate.setMonth(currentDate.getMonth() + 1);
                continue;
            }
            
            const formsMatchingTenantShop = rentalFormsData.filter(form =>
                form.tenantName === formTenantName && 
                (form.shopNoId === formShopNoId || form.shopNo === formShopNo)
            );
            const formsMatchingMonth = formsMatchingTenantShop.filter(form => {
                const normalizedFormMonth = normalizeMonthFormat(form.forTheMonthOf);
                return normalizedFormMonth === currentMonth;
            });
            
            const allRentPayments = rentalFormsData.filter(form => {
                const normalizedFormMonth = normalizeMonthFormat(form.forTheMonthOf);
                return form.tenantName === formTenantName &&
                    (form.shopNoId === formShopNoId || form.shopNo === formShopNo) &&
                    normalizedFormMonth === currentMonth &&
                    (form.formType === "Rent" || form.formType === "Pending Rent");
            });
            
            const excludedForms = formsMatchingMonth.filter(form =>
                !(form.formType === "Rent" || form.formType === "Pending Rent")
            );
            const originalMonthlyRentDue = monthlyRentDue;
            if (currentDate.getFullYear() === start.getFullYear() && currentDate.getMonth() === start.getMonth()) {
                const totalDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                const startDay = start.getDate();
                const rentPerDay = monthlyRentDue / totalDays;
                const proRatedDays = totalDays - startDay + 1;
                monthlyRentDue = Math.floor((rentPerDay * proRatedDays) / 10) * 10;
            }
            else if (currentDate.getFullYear() === end.getFullYear() && currentDate.getMonth() === end.getMonth()) {
                const totalDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                const endDay = end.getDate();
                const rentPerDay = monthlyRentDue / totalDays;
                monthlyRentDue = Math.floor((rentPerDay * endDay) / 10) * 10;
            }
            const totalPaidForMonth = allRentPayments.reduce((sum, form) => {
                return sum + parseFloat(form.amount || 0);
            }, 0);
            const pendingForMonth = monthlyRentDue - totalPaidForMonth;
            if (pendingForMonth > 0) {
                totalPendingRent += pendingForMonth;
            }
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        
        return totalPendingRent;
    };
    const handlePaymentModeChange = (e) => {
        const newPaymentMode = e.target.value;
        setFormPaymentMode(newPaymentMode);
        setAmountError('');
    };
    const validateAmount = (inputAmount) => {
        if (inputAmount === null || inputAmount === undefined) {
            setAmountError('');
            return true;
        }
        if (typeof inputAmount === "string" && inputAmount.trim() === "") {
            setAmountError('');
            return true;
        }
        if ((selectedRentType === "Rent" || selectedRentType === "Pending Rent") && formPaymentMode && formPaymentMode.trim() === "Advance Adjustment") {
            const numericAmount = parseFloat(inputAmount.replace(/[^0-9.]/g, ""));
            if (numericAmount > advanceAmount) {
                const errorMsg = `Amount cannot exceed remaining advance amount of ₹ ${advanceAmount.toLocaleString('en-IN')}`;
                setAmountError(errorMsg);
                return false;
            } else {
                setAmountError('');
                return true;
            }
        }
        if (selectedRentType === "Refund") {
            const numericAmount = parseFloat(inputAmount.replace(/[^0-9.]/g, ""));
            if (numericAmount > advanceAmount) {
                const errorMsg = `Refund amount cannot exceed remaining advance amount of ₹ ${advanceAmount.toLocaleString('en-IN')}`;
                setAmountError(errorMsg);
                return false;
            }
            if (numericAmount <= 0 || Number.isNaN(numericAmount)) {
                const errorMsg = `Refund amount must be greater than 0.`;
                setAmountError(errorMsg);
                return false;
            }
            setAmountError('');
            return true;
        }
        if (selectedRentType === "Shop Closure") {
            const numericAmount = parseFloat(inputAmount.replace(/[^0-9.]/g, ""));
            if (numericAmount > advanceAmount) {
                const errorMsg = `Refund amount cannot exceed remaining advance amount of ₹ ${advanceAmount.toLocaleString('en-IN')}`;
                setAmountError(errorMsg);
                return false;
            } else {
                setAmountError('');
                return true;
            }
        }
        setAmountError('');
        return true;
    };
    const handleSubmit = async () => {
        const cleanedAmount = parseFloat((amount || "").replace(/[^0-9.]/g, ""));
        const isShopClosureWithNoRefund = selectedRentType === "Shop Closure" && (isNaN(cleanedAmount) || cleanedAmount === 0);
        const shopDetails = shopInfoMap[formShopNo] || null;
        if (selectedRentType === "Shop Closure" && shopDetails && (shopDetails.shopClosureDate || shopDetails.isActive === false)) {
            Swal.fire({
                icon: 'warning',
                title: 'Shop Already Closed',
                text: 'This shop already has a closure date or is vacated. Shop closure cannot be submitted again.',
                confirmButtonColor: '#bf9853'
            });
            return;
        }
        if (selectedRentType === "Refund") {
            if (!shopDetails || (shopDetails.isActive && !shopDetails.shopClosureDate)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Refund Not Allowed',
                    text: 'Refunds are allowed only for shops that are already vacated.',
                    confirmButtonColor: '#bf9853'
                });
                return;
            }
            if (isNaN(cleanedAmount) || cleanedAmount <= 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Invalid Refund Amount',
                    text: 'Please enter a refund amount greater than 0.',
                    confirmButtonColor: '#bf9853'
                });
                return;
            }
            if (!advanceAmount || advanceAmount <= 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'No Advance Balance',
                    text: 'There is no remaining advance amount to refund for this shop.',
                    confirmButtonColor: '#bf9853'
                });
                return;
            }
        }
        if (!formPaymentMode && !isShopClosureWithNoRefund) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Payment Mode',
                text: 'Please select a Payment Mode before submitting.',
                confirmButtonColor: '#bf9853'
            });
            return;
        }
        if (!validateAmount(amount)) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Amount',
                text: amountError,
                confirmButtonColor: '#bf9853'
            });
            return;
        }
        if (["Gpay", "PhonePe", "Net Banking", "Cheque"].includes(formPaymentMode)) {
            setWeeklyPaymentData({
                date: paidOnDate,
                amount: cleanedAmount,
                paymentMode: formPaymentMode,
                chequeNo: "",
                chequeDate: "",
                transactionNumber: "",
                accountNumber: ""
            });
            setShowWeeklyPaymentPopup(true);
            return;
        }
        setIsSubmitting(true);
        try {
            await submitRentalForm();
            setIsSubmitting(false);
            setFormShopNo('');
            setFormTenantName('');
            setSelectedTenantId('');
            setAmount('');
            setFormPaymentMode('');
            setPaidOnDate('');
            await fetchRentalForms();
            await fetchLatestEno();
        } catch (error) {
            alert("Unexpected error occurred.");
            setIsSubmitting(false);
        }
    };
    const handleWeeklyPaymentSubmit = async () => {
        if (!weeklyPaymentData.paymentMode) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Payment Mode',
                text: 'Please select a Payment Mode.',
                confirmButtonColor: '#bf9853'
            });
            return;
        }
        if (!weeklyPaymentData.amount) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Amount',
                text: 'Please enter an amount.',
                confirmButtonColor: '#bf9853'
            });
            return;
        }
        setIsSubmitting(true);
        setShowWeeklyPaymentPopup(false);
        try {
            const submittedFormIds = await submitRentalForm();
            const isShopClosureWithRefund = selectedRentType === "Shop Closure" && weeklyPaymentData.amount && parseFloat(weeklyPaymentData.amount) > 0;
            const isRefundPayment = selectedRentType === "Refund" && weeklyPaymentData.amount && parseFloat(weeklyPaymentData.amount) > 0;
            const isRefundFlow = isShopClosureWithRefund || isRefundPayment;
            const paymentType = isRefundFlow ? "Rent Payment Refund" : "Rent Payment";
            const formattedWeeklyDate = convertToYYYYMMDD(weeklyPaymentData.date);
            const rentManagementId = submittedFormIds.length > 0 ? submittedFormIds[0] : null;
            if (!rentManagementId) {
                Swal.fire({
                    icon: 'error',
                    title: 'Missing Rent Management ID',
                    text: 'Could not retrieve the rent management form ID. Please try again.',
                    confirmButtonColor: '#bf9853'
                });
                setIsSubmitting(false);
                throw new Error("rent_management_id is required but was not found");
            }
            const weeklyPaymentBillPayload = {
                date: formattedWeeklyDate,
                created_at: new Date().toISOString(),
                contractor_id: null,
                vendor_id: null,
                employee_id: null,
                project_id: null,
                type: paymentType,
                bill_payment_mode: weeklyPaymentData.paymentMode,
                amount: parseFloat(weeklyPaymentData.amount),
                status: true,
                weekly_number: "",
                weekly_payment_expense_id: null,
                advance_portal_id: null,
                staff_advance_portal_id: null,
                claim_payment_id: null,
                cheque_number: weeklyPaymentData.chequeNo || null,
                cheque_date: weeklyPaymentData.chequeDate || null,
                transaction_number: weeklyPaymentData.transactionNumber || null,
                account_number: weeklyPaymentData.accountNumber || null,
                rent_management_id: rentManagementId,
                tenant_id: selectedTenantId || null,
                tenant_complex_name: shopInfoMap[formShopNo]?.projectReferenceName || null,
            };
            const weeklyPaymentBillResponse = await fetch(
                "https://backendaab.in/aabuildersDash/api/weekly-payment-bills/save",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(weeklyPaymentBillPayload)
                }
            );
            if (!weeklyPaymentBillResponse.ok) {
                const errorText = await weeklyPaymentBillResponse.text();
                throw new Error(`Weekly payment bill submission failed: ${weeklyPaymentBillResponse.status} ${weeklyPaymentBillResponse.statusText}`);
            }
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: isRefundFlow
                    ? 'Rent refund saved successfully and added to Weekly Payment Bills!'
                    : 'Rent payment saved successfully and added to Weekly Payment Bills!',
                confirmButtonColor: '#bf9853'
            });
            setFormShopNo('');
            setFormTenantName('');
            setSelectedTenantId('');
            setAmount('');
            setFormPaymentMode('');
            setPaidOnDate('');
            await fetchRentalForms();
            await fetchLatestEno();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error occurred while saving payment.',
                confirmButtonColor: '#bf9853'
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    const convertToDDMMYYYY = (dateString) => {
        if (!dateString) return '';
        if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
            return dateString;
        }
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };
    const convertToYYYYMMDD = (dateString) => {
        if (!dateString) return '';
        if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
            return dateString;
        }
        if (dateString.includes('-')) {
            const parts = dateString.split('-');
            if (parts.length === 3 && parts[0].length === 2) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const submitRentalForm = async () => {
        const today = new Date();
        const day = today.getDate();
        const month = today.toLocaleString('default', { month: 'long' });
        const year = today.getFullYear();
        const getOrdinal = (n) => {
            const s = ["th", "st", "nd", "rd"];
            const v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };
        const date = `${month} ${getOrdinal(day)} ${year}`;
        const formattedPaidOnDate = convertToDDMMYYYY(paidOnDate);
        const rentFormsRes = await fetch("https://backendaab.in/aabuildersDash/api/rental_forms/getAll");
        if (!rentFormsRes.ok) throw new Error("Failed to fetch existing rent forms");
        const rentForms = await rentFormsRes.json();
        let pdfUrl = '';
        if (selectedRentFile) {
            const formData = new FormData();
            formData.append('pdf', selectedRentFile);
            formData.append('filename', `${date} `);
            const uploadResponse = await fetch("https://backendaab.in/aabuildersDash/api/rentForm/googleUploader/uploadToGoogleDrive", {
                method: "POST",
                body: formData,
            });
            if (!uploadResponse.ok) throw new Error('File upload failed');
            const uploadResult = await uploadResponse.json();
            pdfUrl = uploadResult.url;
        }
        const tenantInfo = shopInfoMap[formShopNo];
        const formShopNoId = tenantInfo?.shopNoId || null;
        const baseMonthlyRent = parseFloat(tenantInfo?.monthlyRent || 0);
        const closureValueForForm = selectedRentType === "Shop Closure"
            ? (closureDate || "")
            : (tenantInfo?.shopClosureDate || "");
        let correctTenantNameId = tenantInfo?.tenantNameId || null;
        if (selectedRentType === "Pending Rent" && selectedTenantId) {
            const selectedTenant = tenantShopData.find(t => t.id === selectedTenantId);
            if (selectedTenant) {
                correctTenantNameId = selectedTenant.id; // The tenant's id is the tenant name ID
            }
        }
        const isStartingMonth = (dateObj) => {
            const start = new Date(startingDate);
            return (
                dateObj.getFullYear() === start.getFullYear() &&
                dateObj.getMonth() === start.getMonth()
            );
        };
        const cleanedAmount = parseFloat((amount || "").replace(/[^0-9.]/g, ""));
        let remainingAmount = isNaN(cleanedAmount) ? 0 : cleanedAmount;
        const submissions = [];
        if ((selectedRentType === "Rent" || selectedRentType === "Pending Rent") && baseMonthlyRent > 0) {
            let currentDate = new Date(selectedMonth);
            const selectedMonthStr = currentDate.toISOString().slice(0, 7);
            const existingEntriesForSelectedMonth = rentForms.filter(r => {
                return (r.formType === "Rent" || r.formType === "Pending Rent") &&
                    (r.shopNoId === formShopNoId || r.shopNo === formShopNo) &&
                    r.forTheMonthOf === selectedMonthStr;
            });
            const alreadyPaidForSelectedMonth = existingEntriesForSelectedMonth.reduce(
                (sum, r) => sum + parseFloat(r.amount || 0),
                0
            );
            const applicableRentForSelectedMonth = isStartingMonth(currentDate)
                ? parseFloat(calculatedRent || 0)
                : baseMonthlyRent;
            const dueForSelectedMonth = applicableRentForSelectedMonth - alreadyPaidForSelectedMonth;
            if (dueForSelectedMonth <= 0) {
                Swal.fire({
                    icon: 'info',
                    title: 'Rent Already Paid',
                    text: `Rent is already fully paid for ${selectedMonthStr}. Please change the month.`,
                    confirmButtonColor: '#bf9853'
                });
                throw new Error("Rent already paid");
            }
            if (selectedRentType === "Pending Rent") {
                const calculatedPendingRent = calculatePendingRentForPendingType();
                if (cleanedAmount > calculatedPendingRent) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Payment Exceeds Pending Amount',
                        text: `Payment amount ₹${cleanedAmount.toLocaleString('en-IN')} exceeds the pending rent amount of ₹${calculatedPendingRent.toLocaleString('en-IN')}. Please enter the correct amount.`,
                        confirmButtonColor: '#bf9853'
                    });
                    throw new Error("Payment exceeds pending amount");
                }
            }
            while (remainingAmount > 0) {
                const currentMonthStr = currentDate.toISOString().slice(0, 7);
                const existingEntries = rentForms.filter(r => {
                    if (selectedRentType === "Pending Rent") {
                        return (r.formType === "Rent" || r.formType === "Pending Rent") &&
                            (r.shopNoId === formShopNoId || r.shopNo === formShopNo) &&
                            r.forTheMonthOf === currentMonthStr;
                    } else {
                        return r.formType === "Rent" &&
                            (r.shopNoId === formShopNoId || r.shopNo === formShopNo) &&
                            r.forTheMonthOf === currentMonthStr;
                    }
                });
                const alreadyPaid = existingEntries.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
                const applicableRent = isStartingMonth(currentDate)
                    ? parseFloat(calculatedRent || 0)
                    : baseMonthlyRent;
                const dueThisMonth = applicableRent - alreadyPaid;
                if (dueThisMonth <= 0) {
                    Swal.fire({
                        icon: 'info',
                        title: 'Rent Already Paid',
                        text: `Rent is already fully paid for ${currentMonthStr}. Please change the month.`,
                        confirmButtonColor: '#bf9853'
                    });
                    throw new Error("Rent already paid");
                }
                const amountToPay = Math.min(remainingAmount, dueThisMonth);
                const rentalForm = {
                    formType: selectedRentType,
                    shopNo: formShopNo,
                    shopNoId: tenantInfo?.shopNoId || null,
                    eno,
                    tenantName: formTenantName,
                    tenantNameId: correctTenantNameId,
                    amount: amountToPay,
                    refundAmount: "",
                    paymentMode: formPaymentMode,
                    paidOnDate: formattedPaidOnDate,
                    forTheMonthOf: currentMonthStr,
                    attachedFile: pdfUrl,
                    shopClosureDate: closureValueForForm,
                };
                submissions.push(rentalForm);
                remainingAmount -= amountToPay;
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
        }
        else {
            const isClosure = selectedRentType === "Shop Closure";
            const isRefund = selectedRentType === "Refund";
            const paymentMode = isClosure && shopClosureToggle
                ? formPaymentMode + " From Cash Register"
                : formPaymentMode;
            const form = {
                formType: selectedRentType,
                shopNo: formShopNo,
                shopNoId: tenantInfo?.shopNoId || null,
                eno,
                tenantName: formTenantName,
                tenantNameId: correctTenantNameId,
                amount: (isClosure || isRefund) ? "" : cleanedAmount,
                refundAmount: (isClosure || isRefund) ? cleanedAmount : "",
                paymentMode: paymentMode,
                paidOnDate: formattedPaidOnDate,
                forTheMonthOf: selectedRentType === "Rent" || selectedRentType === "Pending Rent" ? selectedMonth : "",
                attachedFile: pdfUrl,
                shopClosureDate: closureValueForForm,
            };
            submissions.push(form);
        }
        const submittedFormIds = [];
        for (const form of submissions) {
            const response = await fetch("https://backendaab.in/aabuildersDash/api/rental_forms/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Form submission failed: ${response.status} ${response.statusText}`);
            } else {
                try {
                    const contentType = response.headers.get("content-type");
                    let savedForm = null;                    
                    if (contentType && contentType.includes("application/json")) {
                        savedForm = await response.json();
                    } else {
                        const textResponse = await response.text();
                        try {
                            savedForm = JSON.parse(textResponse);
                        } catch (parseError) {
                            const numericId = parseInt(textResponse.trim());
                            if (!isNaN(numericId)) {
                                savedForm = { id: numericId };
                            }
                        }
                    }                    
                    if (savedForm && savedForm.id) {
                        submittedFormIds.push(savedForm.id);
                    }
                } catch (error) {
                    // Silently continue - will use fallback method
                }
            }
        }        
        if (submittedFormIds.length === 0 && submissions.length > 0) {
            try {
                const allFormsRes = await fetch("https://backendaab.in/aabuildersDash/api/rental_forms/getAll");
                if (allFormsRes.ok) {
                    const allForms = await allFormsRes.json();
                    const matchingForms = allForms.filter(f => {
                        const matchesEno = f.eno === eno;
                        const matchesTenant = f.tenantName === formTenantName;
                        const matchesShop = (f.shopNoId === formShopNoId || f.shopNo === formShopNo);
                        const matchesType = f.formType === selectedRentType;
                        const matchesDate = f.paidOnDate === formattedPaidOnDate || f.paidOnDate === paidOnDate;                        
                        return matchesEno && matchesTenant && matchesShop && matchesType && matchesDate;
                    });
                    matchingForms
                        .sort((a, b) => (b.id || 0) - (a.id || 0)) // Sort by ID descending (most recent first)
                        .slice(0, submissions.length) // Take only as many as we submitted
                        .forEach(f => {
                            if (f.id) submittedFormIds.push(f.id);
                        });
                }
            } catch (error) {
                // Silently continue
            }
        }
        if (selectedRentType === "Shop Closure" && shopClosureToggle) {
            const cleanedAmount = parseFloat((amount || "").replace(/[^0-9.]/g, ""));
            const weeklyExpenseData = {
                date: paidOnDate,
                contractor_id: 258,
                project_id: 9,
                type: "Advance Refund",
                amount: isNaN(cleanedAmount) ? 0 : cleanedAmount,
                weekly_number: getCurrentWeekNumber(),
                status: false,
                created_at: new Date().toISOString(),
            };
            try {
                const weeklyExpenseResponse = await fetch("https://backendaab.in/aabuildersDash/api/weekly-expenses/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(weeklyExpenseData),
                });
                if (!weeklyExpenseResponse.ok) {
                    // Weekly expense submission failed
                }
            } catch (error) {
                // Error submitting weekly expense
            }
        }
        if (selectedRentType === "Shop Closure" && closureDate && formTenantName && formShopNo && formShopNoId) {
            try {
                const updateClosureResponse = await fetch(`https://backendaab.in/aabuildersDash/api/tenant_link_shop/updateClosureDate/${encodeURIComponent(formTenantName)}/${encodeURIComponent(formShopNoId)}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ shopClosureDate: closureDate }),
                });
                if (!updateClosureResponse.ok) {
                    // Update failed
                }
            } catch (error) {
                // Error updating closure date
            }
            if (selectedTenantId && formShopNoId) {
                try {
                    await vacateShop(selectedTenantId, formShopNoId);
                } catch (err) {
                    // VacateShop failed
                }
            }
        }
        return submittedFormIds;
    };
    const vacateShop = async (tenantId, shopNoId) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/tenant_link_shop/vacateShop/${tenantId}/${shopNoId}`, {
                method: 'PUT',
            });
            if (!response.ok) {
                throw new Error('Failed to vacate shop');
            }
            const result = await response.text();
            Swal.fire({
                icon: 'success',
                title: 'Shop Vacated',
                text: result,
                confirmButtonColor: '#bf9853'
            });
            await fetchRentalForms();
        } catch (error) {
            alert('Failed to vacate shop');
        }
    };
    useEffect(() => {
        if (selectedRentType === "Pending Rent") return;
        if (!startingDate || !selectedMonth || selectedRentType !== "Rent") return;
        const isTenantVacated = tenantShopData.some(tenant =>
            tenant.tenantName === formTenantName &&
            tenant.shopNos?.some(shop => {
                const shopNo = shop.shopNoId ? shopNoIdToShopNoMap[shop.shopNoId] : null;
                return shopNo === formShopNo && shop.shopClosureDate;
            })
        );
        if (isTenantVacated) {
            setCalculatedRent("0");
            return;
        }
        const currentMonthStr = selectedMonth;
        const existingPayments = rentalFormsData.filter(form =>
            form.tenantName === formTenantName &&
            form.shopNo === formShopNo &&
            (form.formType === "Rent" || form.formType === "Pending Rent") &&
            form.forTheMonthOf === currentMonthStr
        );
        const totalPaid = existingPayments.reduce((sum, form) => sum + parseFloat(form.amount || 0), 0);
        const monthlyRent = parseFloat(shopInfoMap[formShopNo]?.monthlyRent || 0);
        if (totalPaid >= monthlyRent) {
            setCalculatedRent("0");
            return;
        }
        const start = new Date(startingDate);
        const [year, month] = selectedMonth.split('-').map(Number);
        const selected = new Date(year, month - 1);
        if (
            selected.getFullYear() < start.getFullYear() ||
            (selected.getFullYear() === start.getFullYear() && selected.getMonth() < start.getMonth())
        ) {
            setCalculatedRent("0");
            return;
        }
        if (start.getFullYear() === selected.getFullYear() && start.getMonth() === selected.getMonth()) {
            const totalDays = new Date(year, month, 0).getDate();
            const startDay = start.getDate();
            const rentPerDay = monthlyRent / totalDays;
            const proRatedDays = totalDays - startDay + 1;
            const rawRent = rentPerDay * proRatedDays;
            const proRatedRent = Math.floor(rawRent / 10) * 10;
            setCalculatedRent(proRatedRent.toString());
        } else {
            const remainingRent = monthlyRent - totalPaid;
            setCalculatedRent(remainingRent > 0 ? remainingRent.toString() : "0");
        }
    }, [selectedMonth, startingDate, selectedRentType, formShopNo, formTenantName, tenantShopData, rentalFormsData, shopInfoMap]);
    useEffect(() => {
        if ((selectedRentType === "Rent" || selectedRentType === "Pending Rent") && calculatedRent) {
            setAmount(calculatedRent.toString());
        }
    }, [selectedRentType, calculatedRent]);
    useEffect(() => {
        if (formTenantName && formShopNo && rentalFormsData.length > 0) {
            calculateAdvanceAmount(formTenantName, formShopNo);
        } else {
            setAdvanceAmount(0);
        }
    }, [formTenantName, formShopNo, rentalFormsData, rentHistoryData]);
    useEffect(() => {
        if (!formPaymentMode || formPaymentMode.trim() !== "Advance Adjustment") {
            setAmountError('');
        }
    }, [formPaymentMode]);
    useEffect(() => {
        if (selectedRentType !== "Shop Closure") {
            setAmountError('');
        }
    }, [selectedRentType]);
    useEffect(() => {
        if (amount) {
            if (selectedRentType === "Rent" && formPaymentMode && formPaymentMode.trim() === "Advance Adjustment") {
                validateAmount(amount);
            }
            else if (selectedRentType === "Shop Closure" || selectedRentType === "Refund") {
                validateAmount(amount);
            }
        }
    }, [advanceAmount]);
    useEffect(() => {
        if (selectedRentType === "Pending Rent" && formTenantName && formShopNo && rentHistoryData.length > 0 && tenantShopData.length > 0 && startingDate) {
            const pendingRent = calculatePendingRentForPendingType();
            if (pendingRent > 0) {
                setCalculatedRent(pendingRent.toString());
            } else {
                setCalculatedRent("0");
            }
        }
    }, [selectedRentType, formTenantName, formShopNo, rentHistoryData, tenantShopData, startingDate, rentalFormsData, shopInfoMap, shopNoIdToShopNoMap]);
    useEffect(() => {
        if (selectedRentType === "Rent" && formTenantName && formShopNo && startingDate && closureDate) {
            const totalPendingRent = calculatePendingRentUpToDate(closureDate);
            if (totalPendingRent > 0) {
                setAmount(totalPendingRent.toString());
            }
        } else if (selectedRentType === "Rent" && !closureDate && calculatedRent) {
            setAmount(calculatedRent.toString());
        }
    }, [selectedRentType, formTenantName, formShopNo, startingDate, closureDate, calculatedRent]);
    const handleSubmitOldData = async (e) => {
        e.preventDefault();
        if (!file) {
            setUploadStatus('Please select a CSV file to upload.');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await axios.post('https://backendaab.in/aabuildersDash/api/rental_forms/upload_old_data', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setUploadStatus(response.data);
        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus('Failed to upload file. Please try again.');
        }
    };
    useEffect(() => {
        if (formTenantName) {
            const tenant = tenantShopData.find(t => t.tenantName === formTenantName);
            let shops;
            if (selectedRentType === "Refund") {
                shops = tenant?.shopNos?.filter(shop => shop.shopClosureDate) || [];
            } else if (selectedRentType !== "Pending Rent") {
                shops = tenant?.shopNos?.filter(shop => !shop.shopClosureDate) || [];
            } else {
                shops = tenant?.shopNos || [];
            }
            const filtered = shops
                .map(shop => {
                    const shopNo = shop.shopNoId ? shopNoIdToShopNoMap[shop.shopNoId] : null;
                    return shopNo ? { label: shopNo, value: shopNo, shopNoId: shop.shopNoId } : null;
                })
                .filter(Boolean);
            setFilteredShopNoOptions(filtered);
        } else {
            if (selectedRentType === "Refund") {
                const vacatedShops = shopNoOptions.filter(option => {
                    const details = shopInfoMap[option.value || option.label];
                    return details && (details.isActive === false || !!details.shopClosureDate);
                });
                setFilteredShopNoOptions(vacatedShops);
            } else {
                setFilteredShopNoOptions(shopNoOptions);
            }
        }
    }, [formTenantName, tenantShopData, shopNoOptions, selectedRentType, shopInfoMap, shopNoIdToShopNoMap]);
    return (
        <div className="p-3 sm:p-4 md:p-6 bg-[#FFFFFF] w-full max-w-[1830px] min-h-[700px] ml-10 mr-12 text-left">
            <div className="flex  sm:flex-row sm:items-center gap-6">
                <div>
                    <h2 className="text-[#E4572E] font-bold mb-2 text-sm sm:text-base">Select Type</h2>
                    <select className="border-2 border-opacity-[0.18] focus:outline-none border-[#BF9853] rounded-lg p-2 mt-1 w-full sm:w-[170px] h-[45px]"
                        value={selectedRentType} onChange={(e) => setSelectedRentType(e.target.value)} >
                        <option value="Rent">Rent</option>
                        <option value="Advance">Advance</option>
                        <option value="Shop Closure">Shop Closure</option>
                        <option value="Refund">Refund</option>
                        <option value="Pending Rent">Pending Rent</option>
                    </select>
                </div>
                <span className="text-right text-[#E4572E] text-sm sm:text-base -mt-20 ml-10 ">ENO:{eno}</span>
            </div>
            <div className="mt-4 flex flex-col lg:flex-row gap-4 lg:gap-8">
                <div className="w-full lg:w-auto">
                    <label className="block font-semibold mb-2 text-sm sm:text-base">Shop No</label>
                    <Select
                        name="shopNo"
                        value={filteredShopNoOptions.find(option => option.value === formShopNo)}
                        onChange={(selectedOption) => {
                            if (selectedOption) {
                                const selectedShopNo = selectedOption.value;
                                setFormShopNo(selectedShopNo);
                                if (selectedRentType !== "Pending Rent") {
                                    const selectedShopOption = filteredShopNoOptions.find(opt => opt.value === selectedShopNo);
                                    const selectedShopNoId = selectedShopOption?.shopNoId || null;                                    
                                    const matchingTenant = [...tenantShopData].reverse().find(t =>
                                        t.shopNos?.some(shop => {
                                            if (!shop || shop.shopNoId !== selectedShopNoId) return false;
                                            if (selectedRentType === "Refund") {
                                                return !!shop.shopClosureDate;
                                            }
                                            return !shop.shopClosureDate;
                                        })
                                    );
                                    if (matchingTenant) {
                                        setFormTenantName(matchingTenant.tenantName);
                                        setSelectedTenantId(matchingTenant.id);
                                        const shopData = shopInfoMap[selectedShopNo];
                                        if (selectedRentType === "Shop Closure" && shopData && (shopData.shopClosureDate || shopData.isActive === false)) {
                                            Swal.fire({
                                                icon: 'warning',
                                                title: 'Shop Already Closed',
                                                text: 'This shop is already vacated or has a closure date. Please choose a different shop.',
                                                confirmButtonColor: '#bf9853'
                                            });
                                            setFormShopNo('');
                                            setFormTenantName('');
                                            setSelectedTenantId('');
                                            setStartingDate('');
                                            return;
                                        }
                                        if (shopData) {
                                            setStartingDate(shopData.startingDate);
                                        }
                                    } else {
                                        setFormTenantName('');
                                        setSelectedTenantId('');
                                    }
                                } else {
                                    const selectedShopOption = filteredShopNoOptions.find(opt => opt.value === selectedShopNo);
                                    const selectedShopNoId = selectedShopOption?.shopNoId || null;
                                    
                                    const tenantsForShop = tenantShopData.filter(t =>
                                        t.shopNos?.some(shop => shop.shopNoId === selectedShopNoId)
                                    );
                                    const shopTenantOptions = tenantsForShop.map(t => ({
                                        label: t.tenantName,
                                        value: t.tenantName,
                                        tenantId: t.id
                                    }));
                                    setTenantOptions(shopTenantOptions);
                                    
                                    const vacatedTenant = tenantsForShop.find(t =>
                                        t.shopNos?.some(shop => 
                                            shop.shopNoId === selectedShopNoId && shop.shopClosureDate
                                        )
                                    );                                    
                                    if (vacatedTenant) {
                                        setFormTenantName(vacatedTenant.tenantName);
                                        setSelectedTenantId(vacatedTenant.id);
                                        const shopData = shopInfoMap[selectedShopNo];
                                        if (shopData) {
                                            setStartingDate(shopData.startingDate);
                                        }
                                    } else {
                                        setFormTenantName('');
                                        setSelectedTenantId('');
                                    }
                                }
                            } else {
                                setFormShopNo('');
                                setFormTenantName('');
                                setSelectedTenantId('');
                                if (selectedRentType === "Pending Rent") {
                                    fetchTenants();
                                }
                            }
                        }}
                        options={filteredShopNoOptions}
                        placeholder="Choose No"
                        isSearchable
                        isClearable
                        className="w-full sm:w-[170px]"
                        classNamePrefix="select"
                        styles={{
                            control: (provided, state) => ({
                                ...provided,
                                height: '45px',
                                minHeight: '45px',
                                backgroundColor: 'transparent',
                                borderWidth: '2px',
                                borderColor: state.isFocused
                                    ? 'rgba(191, 152, 83, 0.5)'
                                    : 'rgba(191, 152, 83, 0.18)',
                                borderRadius: '8px',
                                boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                '&:hover': {
                                    borderColor: 'rgba(191, 152, 83, 0.4)',
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
                <div className="w-full lg:w-auto">
                    <div className="space-y-2">
                        {formTenantName && formShopNo && (
                            <div className={`text-sm text-gray-700 mb-3 flex items-center gap-2 ${selectedRentType === "Rent"
                                ? "lg:-mt-[76px]"
                                : selectedRentType === "Pending Rent" || selectedRentType === "Shop Closure"
                                    ? "lg:-mt-[53px]"
                                    : "lg:-mt-[34px]"
                                }`}>
                                <span>Advance Amount: ₹ {advanceAmount.toLocaleString('en-IN')}</span>
                            </div>
                        )}
                        {selectedRentType === "Rent" && selectedMonth && calculatedRent && (
                            <>
                                <div className="text-sm text-gray-700 ">
                                    Rent To Be Paid For {selectedMonth
                                        ? new Date(`${selectedMonth}-01`).toLocaleString('default', {
                                            month: 'long',
                                            year: 'numeric',
                                        })
                                        : ''}: ₹ {calculatedRent}
                                </div>
                                {formTenantName && formShopNo && startingDate && (
                                    <div className="text-sm text-gray-700 ">
                                        {closureDate ? (
                                            <>Total Pending Rent (Up to {new Date(closureDate).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}): ₹ {calculatePendingRentUpToDate(closureDate).toLocaleString('en-IN')}</>
                                        ) : (
                                            <>Total Pending Rent (Up to Today): ₹ {calculatePendingRentUpToDate(new Date().toISOString().split('T')[0]).toLocaleString('en-IN')}</>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                        {selectedRentType === "Pending Rent" && formTenantName && formShopNo && startingDate && (() => {
                            let shopClosureDate = null;
                            const matchingTenant = tenantShopData.find(tenant => tenant.tenantName === formTenantName);
                            if (matchingTenant) {
                                matchingTenant.shopNos?.forEach(shop => {
                                    const shopNo = shop.shopNoId ? shopNoIdToShopNoMap[shop.shopNoId] : null;
                                    if (shopNo === formShopNo) {
                                        shopClosureDate = shop.shopClosureDate;
                                    }
                                });
                            }
                            return (
                                <div className="text-sm text-gray-700 ">
                                    {shopClosureDate ? (
                                        <>Total Pending Rent (Up to {new Date(shopClosureDate).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}): ₹ {calculatePendingRentForPendingType().toLocaleString('en-IN')}</>
                                    ) : (
                                        <>Total Pending Rent (Up to Today): ₹ {calculatePendingRentForPendingType().toLocaleString('en-IN')}</>
                                    )}
                                </div>
                            );
                        })()}
                        {selectedRentType === "Shop Closure" && formTenantName && formShopNo && startingDate && (() => {
                            return (
                                <div className="text-sm text-gray-700 ">
                                    {closureDate ? (
                                        <>Total Pending Rent (Up to {new Date(closureDate).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        })}): ₹ {calculatePendingRentUpToDate(closureDate).toLocaleString('en-IN')}</>
                                    ) : (
                                        <>Total Pending Rent (Up to Today): ₹ {calculatePendingRentUpToDate(new Date().toISOString().split('T')[0]).toLocaleString('en-IN')}</>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                    <label className="block font-semibold mb-2 text-sm sm:text-base">Tenant Name</label>
                    <Select
                        name="tenantName"
                        value={tenantOptions.find(option => option.value === formTenantName)}
                        onChange={(selectedOption) => {
                            if (selectedOption) {
                                setFormTenantName(selectedOption.value);
                                setSelectedTenantId(selectedOption.tenantId);
                                if (selectedRentType !== "Pending Rent") {
                                    const tenantMatch = tenantShopData.find(t => t.tenantName === selectedOption.value);
                                    const tenantShopsRaw = tenantMatch?.shopNos || [];
                                    const tenantShops = tenantShopsRaw
                                        .map(shop => {
                                            if (!shop) return null;
                                            const resolvedShopNo = shop.shopNo
                                                ? String(shop.shopNo)
                                                : (shop.shopNoId ? shopNoIdToShopNoMap[shop.shopNoId] : null);
                                            if (!resolvedShopNo) return null;
                                            return {
                                                ...shop,
                                                resolvedShopNo
                                            };
                                        })
                                        .filter(Boolean)
                                        .filter(shop => {
                                            if (selectedRentType === "Refund") {
                                                return !!shop.shopClosureDate;
                                            }
                                            return !shop.shopClosureDate;
                                        });
                                    const newShopOptions = tenantShops.map(shop => ({
                                        value: shop.resolvedShopNo,
                                        label: shop.resolvedShopNo,
                                        shopNoId: shop.shopNoId
                                    }));
                                    setFilteredShopNoOptions(newShopOptions);
                                    if (tenantShops.length > 0) {
                                        const activeShop = tenantShops[0];
                                        setFormShopNo(activeShop.resolvedShopNo);
                                        const shopData = shopInfoMap[activeShop.resolvedShopNo];
                                        if (shopData) {
                                            setStartingDate(shopData.startingDate);
                                        }
                                    } else {
                                        setFormShopNo('');
                                    }
                                } else {
                                    const tenantMatch = tenantShopData.find(t => t.tenantName === selectedOption.value);
                                    
                                    if (formShopNo && selectedRentType === "Pending Rent") {
                                        const selectedShopOption = filteredShopNoOptions.find(opt => opt.value === formShopNo);
                                        const selectedShopNoId = selectedShopOption?.shopNoId || null;
                                        
                                        const hasShopClosureDate = tenantMatch?.shopNos?.some(shop => 
                                            shop.shopNoId === selectedShopNoId && shop.shopClosureDate
                                        );
                                        
                                        if (!hasShopClosureDate) {
                                            Swal.fire({
                                                icon: 'warning',
                                                title: 'Invalid Tenant Selection',
                                                text: 'For Pending Rent, please select the tenant that was vacated from this shop (the tenant with a closure date).',
                                                confirmButtonColor: '#bf9853'
                                            });
                                            const vacatedTenant = tenantShopData.find(t =>
                                                t.shopNos?.some(shop => 
                                                    shop.shopNoId === selectedShopNoId && shop.shopClosureDate
                                                )
                                            );
                                            if (vacatedTenant) {
                                                setFormTenantName(vacatedTenant.tenantName);
                                                setSelectedTenantId(vacatedTenant.id);
                                            } else {
                                                setFormTenantName('');
                                                setSelectedTenantId('');
                                            }
                                            return;
                                        }
                                    }
                                    const tenantShopsRaw = tenantMatch?.shopNos || [];
                                    const tenantShops = tenantShopsRaw
                                        .map(shop => {
                                            if (!shop) return null;
                                            const resolvedShopNo = shop.shopNo
                                                ? String(shop.shopNo)
                                                : (shop.shopNoId ? shopNoIdToShopNoMap[shop.shopNoId] : null);
                                            if (!resolvedShopNo) return null;
                                            return {
                                                ...shop,
                                                resolvedShopNo
                                            };
                                        })
                                        .filter(Boolean);
                                    const newShopOptions = tenantShops.map(shop => ({
                                        value: shop.resolvedShopNo,
                                        label: shop.resolvedShopNo,
                                        shopNoId: shop.shopNoId
                                    }));
                                    setFilteredShopNoOptions(newShopOptions);
                                    if (tenantShops.length > 0) {
                                        const firstShop = tenantShops[0];
                                        setFormShopNo(firstShop.resolvedShopNo);
                                        const shopData = shopInfoMap[firstShop.resolvedShopNo];
                                        if (shopData) {
                                            setStartingDate(shopData.startingDate);
                                        }
                                    } else {
                                        setFormShopNo('');
                                    }
                                }
                            } else {
                                setFormTenantName('');
                                setSelectedTenantId('');
                                setFilteredShopNoOptions(shopNoOptions);
                                setFormShopNo('');
                            }
                        }}
                        options={tenantOptions}
                        placeholder="Choose Tenant"
                        isSearchable
                        isClearable
                        className="w-full sm:w-[290px]"
                        classNamePrefix="select"
                        styles={{
                            control: (provided, state) => ({
                                ...provided,
                                height: '45px',
                                minHeight: '45px',
                                backgroundColor: 'transparent',
                                borderWidth: '2px',
                                borderColor: state.isFocused
                                    ? 'rgba(191, 152, 83, 0.5)'
                                    : 'rgba(191, 152, 83, 0.18)',
                                borderRadius: '8px',
                                boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                '&:hover': {
                                    borderColor: 'rgba(191, 152, 83, 0.4)',
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
            <div className="mt-4 flex flex-col lg:flex-row gap-4 lg:gap-8">
                <div className="w-full lg:w-auto">
                    <label className="block font-semibold mb-2 text-sm sm:text-base">
                        {(selectedRentType === "Shop Closure" || selectedRentType === "Refund") ? "Refund Amount" : "Amount"}
                    </label>
                    <input
                        className={`border-2 border-opacity-[0.18] focus:outline-none rounded-lg p-2 w-full sm:w-[170px] h-[45px] ${amountError ? 'border-red-500' : 'border-[#BF9853]'
                            }`}
                        type="text"
                        value={formatINR(amount)}
                        onChange={(e) => {
                            setAmount(e.target.value);
                            validateAmount(e.target.value);
                        }}
                    />

                </div>
                <div className="w-full lg:w-auto">
                    <label className="block font-semibold mb-2 text-sm sm:text-base">Payment Mode</label>
                    <select
                        value={formPaymentMode}
                        onChange={handlePaymentModeChange}
                        className="border-2 border-opacity-[0.18] focus:outline-none border-[#BF9853] rounded-lg p-2 w-full sm:w-[290px] h-[45px]"
                    >
                        <option value="">Choose Method</option>
                        {paymentModeOptions
                            .filter(mode => {
                                if (selectedRentType === "Advance" &&
                                    (mode.modeOfPayment === "Advance Adjustment" ||
                                        mode.modeOfPayment?.toLowerCase().includes("advance adjustment"))) {
                                    return false;
                                }
                                return true;
                            })
                            .map((mode) => (
                                <option key={mode.id} value={mode.modeOfPayment}>
                                    {mode.modeOfPayment}
                                </option>
                            ))}
                    </select>
                </div>
            </div>
            <div className="h-5 mt-1">
                {amountError && (
                    <p className="text-red-500 text-xs mt-1">{amountError}</p>
                )}
            </div>
            <div className="mt-4 flex flex-col lg:flex-row gap-4 lg:gap-8">
                <div className="w-full lg:w-auto">
                    <label className="block font-semibold mb-2 text-sm sm:text-base">Paid on</label>
                    <input
                        type="date"
                        value={paidOnDate}
                        onChange={(e) => setPaidOnDate(e.target.value)}
                        className="border-2 border-opacity-[0.18] focus:outline-none border-[#BF9853] rounded-lg p-2 w-full sm:w-[170px] h-[45px]"
                    />
                </div>
                {selectedRentType === "Shop Closure" && (
                    <div className="w-full lg:w-auto">
                        <label className="block font-semibold mb-2 text-sm sm:text-base">Closure Date</label>
                        <input
                            type="date"
                            value={closureDate}
                            onChange={(e) => setClosureDate(e.target.value)}
                            className="border-2 border-opacity-[0.18] focus:outline-none border-[#BF9853] rounded-lg p-2 w-full sm:w-[170px] h-[45px]"
                        />
                    </div>
                )}
                {selectedRentType === "Shop Closure" && (
                    <div className="mt-8 flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setShopClosureToggle(!shopClosureToggle)}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm sm:text-base transition-colors duration-200 border-2 ${shopClosureToggle
                                ? 'border-green-500 text-green-500 hover:border-green-600 hover:text-green-600'
                                : 'border-red-500 text-red-500 hover:border-red-600 hover:text-red-600'
                                }`}
                        >
                            Source From CR
                        </button>
                    </div>
                )}
                {(selectedRentType === "Rent" || selectedRentType === "Pending Rent") && (
                    <div className="w-full lg:w-auto">
                        <label className="block font-semibold mb-2 text-sm sm:text-base">For The Month of</label>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="border-2 border-opacity-[0.18] focus:outline-none border-[#BF9853] rounded-lg p-2 w-full sm:w-[170px] h-[45px]"
                        />
                    </div>
                )}
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className='flex items-center'>
                    <label htmlFor="fileInput" className="cursor-pointer flex items-center text-orange-600 text-sm sm:text-base">
                        <img className='w-4 h-3 sm:w-5 sm:h-4 mr-1' alt='' src={Attach}></img>
                        Attach file
                    </label>
                    <input type="file" id="fileInput" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                </div>
                {selectedRentFile && <span className="text-gray-600 text-sm sm:text-base break-all">{selectedRentFile.name}</span>}
            </div>
            <button type='submit' disabled={isSubmitting} onClick={handleSubmit}
                className={`bg-yellow-700 text-white px-4 sm:px-6 mt-6 sm:mt-8 py-2 rounded-md hover:bg-yellow-600 transition duration-200 text-sm sm:text-base w-full sm:w-auto ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            {showWeeklyPaymentPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white text-left rounded-xl p-6 w-[800px] h-[600px] overflow-y-auto flex flex-col">
                        <h3 className="text-lg font-semibold mb-4 text-center">Payment Details</h3>
                        <div className="flex-1 overflow-hidden">
                            <div className="space-y-4 mb-4">
                                <div className="border-2 border-[#BF9853] border-opacity-25 w-full rounded-lg p-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                            <input
                                                type="date"
                                                value={weeklyPaymentData.date}
                                                onChange={(e) => setWeeklyPaymentData(prev => ({ ...prev, date: e.target.value }))}
                                                readOnly
                                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none bg-gray-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                                            <input
                                                type="number"
                                                value={weeklyPaymentData.amount}
                                                readOnly
                                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full text-gray-600 bg-gray-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                                            <input
                                                type="text"
                                                value={weeklyPaymentData.paymentMode}
                                                readOnly
                                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full text-gray-600 bg-gray-100"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {(weeklyPaymentData.paymentMode === "Gpay" || weeklyPaymentData.paymentMode === "PhonePe" ||
                                    weeklyPaymentData.paymentMode === "Net Banking" || weeklyPaymentData.paymentMode === "Cheque") && (
                                        <div className="border-2 border-[#BF9853] border-opacity-25 w-full rounded-lg p-4">
                                            <div className="space-y-4">
                                                {weeklyPaymentData.paymentMode === "Cheque" && (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Cheque No<span className="text-red-500">*</span></label>
                                                            <input
                                                                type="text"
                                                                value={weeklyPaymentData.chequeNo}
                                                                onChange={(e) => setWeeklyPaymentData(prev => ({ ...prev, chequeNo: e.target.value }))}
                                                                placeholder="Enter cheque number"
                                                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Cheque Date<span className="text-red-500">*</span></label>
                                                            <input
                                                                type="date"
                                                                value={weeklyPaymentData.chequeDate}
                                                                onChange={(e) => setWeeklyPaymentData(prev => ({ ...prev, chequeDate: e.target.value }))}
                                                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Number<span className="text-red-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            value={weeklyPaymentData.transactionNumber}
                                                            onChange={(e) => setWeeklyPaymentData(prev => ({ ...prev, transactionNumber: e.target.value }))}
                                                            placeholder="Enter transaction number"
                                                            className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Number<span className="text-red-500">*</span></label>
                                                        <select
                                                            value={weeklyPaymentData.accountNumber}
                                                            onChange={(e) => setWeeklyPaymentData(prev => ({ ...prev, accountNumber: e.target.value }))}
                                                            className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                                        >
                                                            <option value="">Select Account</option>
                                                            {accountDetails.map((account) => (
                                                                <option key={account.id} value={account.account_number}>
                                                                    {account.account_number}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 p-4 bg-white">
                            <button
                                onClick={() => {
                                    setShowWeeklyPaymentPopup(false);
                                    setWeeklyPaymentData({
                                        date: new Date().toISOString().split('T')[0],
                                        amount: "",
                                        paymentMode: "",
                                        chequeNo: "",
                                        chequeDate: "",
                                        transactionNumber: "",
                                        accountNumber: ""
                                    });
                                }}
                                className="px-4 py-2 border border-[#BF9853] text-[#BF9853] rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleWeeklyPaymentSubmit}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-[#BF9853] text-white rounded-lg disabled:bg-gray-400"
                            >
                                {isSubmitting ? 'Saving...' : 'Submit'}
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                setShowWeeklyPaymentPopup(false);
                                setWeeklyPaymentData({
                                    date: new Date().toISOString().split('T')[0],
                                    amount: "",
                                    paymentMode: "",
                                    chequeNo: "",
                                    chequeDate: "",
                                    transactionNumber: "",
                                    accountNumber: ""
                                });
                            }}
                            className="absolute top-3 right-4 text-xl font-bold text-gray-500 hover:text-black"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Form;