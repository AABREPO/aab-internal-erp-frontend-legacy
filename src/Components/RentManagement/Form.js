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

    // Weekly Payment Bills popup state
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

    // Function to get current week number
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
            console.error("Error parsing sessionStorage data:", error);
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
                // Filter for "own project" category
                const ownProjects = Array.isArray(data)
                    ? data.filter(p => (p.projectCategory || '').toLowerCase() === 'own project')
                    : [];
                setProjects(ownProjects);
                console.log('Fetched projects:', ownProjects.length, 'projects');
            } else {
                setMessage('Error fetching projects.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error fetching projects.');
        }
    };
    useEffect(() => {
        fetchTenants();
    }, [selectedRentType]);
    const fetchTenants = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/tenantShop/getAll');
            if (response.ok) {
                const data = await response.json();
                setTenantShopData(data);
                if (selectedRentType === "Refund") {
                    const vacatedTenants = data.filter(t =>
                        t.property?.some(p =>
                            p.shops?.some(shop => !shop.active || !!shop.shopClosureDate)
                        )
                    );
                    const options = vacatedTenants.flatMap(t =>
                        t.property?.flatMap(p =>
                            p.shops
                                ?.filter(shop => !shop.active || !!shop.shopClosureDate)
                                .map(shop => ({
                                    label: t.tenantName,
                                    value: t.tenantName,
                                    tenantId: t.id,
                                    shopNo: shop.shopNo
                                })) || []
                        ) || []
                    );
                    const tenantOptionsUnique = options.filter(
                        (t, i, arr) => t.label && arr.findIndex(x => x.value === t.value) === i
                    );
                    setTenantOptions(tenantOptionsUnique);
                } else if (selectedRentType !== "Pending Rent") {
                    const activeTenants = data.filter(t =>
                        t.property?.some(p =>
                            p.shops?.some(shop => shop.active && !shop.shopClosureDate)
                        )
                    );
                    const options = activeTenants.flatMap(t =>
                        t.property.flatMap(p =>
                            p.shops
                                .filter(shop => shop.active && !shop.shopClosureDate)
                                .map(shop => ({
                                    label: t.tenantName,
                                    value: t.tenantName,
                                    tenantId: t.id,
                                    shopNo: shop.shopNo
                                }))
                        )
                    );
                    const tenantOptionsUnique = options.filter(
                        (t, i, arr) => t.label && arr.findIndex(x => x.value === t.value) === i
                    );
                    setTenantOptions(tenantOptionsUnique);
                } else {
                    const allTenants = data.filter(t => t.tenantName);
                    const options = allTenants.flatMap(t =>
                        t.property?.flatMap(p =>
                            p.shops?.map(shop => ({
                                label: t.tenantName,
                                value: t.tenantName,
                                tenantId: t.id,
                                shopNo: shop.shopNo,
                                isActive: shop.active
                            })) || []
                        ) || []
                    );
                    const tenantOptionsUnique = options.filter(
                        (t, i, arr) => t.label && arr.findIndex(x => x.value === t.value) === i
                    );
                    setTenantOptions(tenantOptionsUnique);
                }
                // Create shop options from all shops (active and inactive)
                const allShops = data.flatMap(t =>
                    t.property?.flatMap(p =>
                        p.shops?.map(shop => shop.shopNo) || []
                    ) || []
                );
                const uniqueShopNos = [...new Set(allShops.filter(Boolean))];
                const shopOptions = uniqueShopNos.map(no => ({ label: no, value: no }));
                setShopNoOptions(shopOptions);
            } else {
                setMessage('Error fetching tenants.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error fetching tenants.');
        }
    };
    const [shopInfoMap, setShopInfoMap] = useState({});
    useEffect(() => {
        const newShopInfoMap = {};
        // First, build a mapping from shopNo to shopNoId from projects data (project management)
        const shopNoToIdMap = {};
        projects
            .filter(project => project.projectReferenceName) // Only include projects with projectReferenceName
            .forEach(project => {
                // Convert Set to Array if needed
                const propertyDetailsArray = Array.isArray(project.propertyDetails) 
                    ? project.propertyDetails 
                    : Array.from(project.propertyDetails || []);
                
                propertyDetailsArray.forEach(detail => {
                    if (detail.shopNo && detail.id) {
                        shopNoToIdMap[detail.shopNo] = detail.id;
                    }
                });
            });

        tenantShopData.forEach(tenant => {
            tenant.property?.forEach(property => {
                property.shops?.forEach(shop => {
                    if (shop.shopNo) {
                        newShopInfoMap[shop.shopNo] = {
                            doorNo: shop.doorNo || '',
                            projectReferenceName: property.propertyName || '', // propertyName stores projectReferenceName
                            advanceAmount: shop.advanceAmount || '',
                            monthlyRent: shop.monthlyRent || '',
                            startingDate: shop.startingDate,
                            tenantNameId: tenant.id,
                            shopNoId: shopNoToIdMap[shop.shopNo] || null,
                            shopClosureDate: shop.shopClosureDate || '',
                            isActive: typeof shop.active === "boolean" ? shop.active : true
                        };
                    }
                });
            });
        });
        setShopInfoMap(newShopInfoMap);
    }, [tenantShopData, projects]);
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
            console.error('Error fetching latest ENo:', error);
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
            console.error('Error:', error);
            setMessage('Error fetching tile area names.');
        }
    };

    const fetchRentalForms = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/rental_forms/getAll');
            if (response.ok) {
                const data = await response.json();
                setRentalFormsData(data);
            } else {
                console.error('Error fetching rental forms data');
            }
        } catch (error) {
            console.error('Error fetching rental forms:', error);
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
            console.error('Error fetching rent history:', error);
        }
    };

    const fetchAccountDetails = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/account-details/getAll');
            if (response.ok) {
                const data = await response.json();
                setAccountDetails(data);
            } else {
                console.error('Error fetching account details');
            }
        } catch (error) {
            console.error('Error fetching account details:', error);
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
    // Calculate pending rent up to a specific date using rent history data
    const calculatePendingRentUpToDate = (endDate) => {
        if (!formTenantName || !formShopNo || !startingDate || rentHistoryData.length === 0) {
            return 0;
        }
        // Use closure date if provided, otherwise use the passed endDate
        const calculationEndDate = closureDate || endDate;
        // Create a mapping from tenantWithShopNoId to shopNo
        const tenantShopMapping = {};
        tenantShopData.forEach(tenant => {
            tenant.property?.forEach(property => {
                property.shops?.forEach(shop => {
                    if (shop.id) {
                        tenantShopMapping[shop.id] = {
                            shopNo: shop.shopNo,
                            tenantName: tenant.tenantName,
                            startingDate: shop.startingDate
                        };
                    }
                });
            });
        });
        rentHistoryData.forEach(history => {
            const shopDetails = tenantShopMapping[history.tenantWithShopNoId];
        });
        // Filter rent history data for the specific shopNo by first finding matching tenantWithShopNoIds
        const matchingTenantShopIds = Object.keys(tenantShopMapping).filter(id =>
            tenantShopMapping[id].shopNo === formShopNo &&
            tenantShopMapping[id].tenantName === formTenantName
        );
        if (matchingTenantShopIds.length === 0) {
            return 0;
        }
        // Get rent history for the matching tenantWithShopNoIds
        const shopRentHistory = rentHistoryData.filter(history =>
            matchingTenantShopIds.includes(history.tenantWithShopNoId.toString())
        );
        if (shopRentHistory.length === 0) {
            return 0;
        }
        // Sort rent history by starting date to get chronological order
        const sortedRentHistory = shopRentHistory.sort((a, b) => new Date(a.startingMonthForThisRent) - new Date(b.startingMonthForThisRent));
        const start = new Date(startingDate);
        const end = new Date(calculationEndDate);
        let totalPendingRent = 0;
        let currentDate = new Date(start.getFullYear(), start.getMonth(), 1);
        while (currentDate <= end) {
            const year = currentDate.getFullYear();
            const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            const currentMonth = `${year}-${month}`;
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
                // Move to next month if no rent amount found
                currentDate.setMonth(currentDate.getMonth() + 1);
                continue;
            }
            // Get all rent-related payments for this month from rentalFormsData
            const allRentPayments = rentalFormsData.filter(form =>
                form.tenantName === formTenantName &&
                form.shopNo === formShopNo &&
                form.forTheMonthOf === currentMonth &&
                (
                    (form.formType === "Rent") ||
                    (form.formType === "Pending Rent") ||
                    (form.paymentMode && form.paymentMode.trim() === "Advance Adjustment")
                )
            );
            const totalPaidForMonth = allRentPayments.reduce((sum, form) => {
                return sum + parseFloat(form.amount || 0);
            }, 0);
            // If it's the first month, calculate pro-rated rent
            if (currentDate.getFullYear() === start.getFullYear() && currentDate.getMonth() === start.getMonth()) {
                const totalDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                const startDay = start.getDate();
                const rentPerDay = monthlyRentDue / totalDays;
                const proRatedDays = totalDays - startDay + 1;
                monthlyRentDue = Math.floor((rentPerDay * proRatedDays) / 10) * 10;
            }
            // If it's the last month and end date is not the last day of the month
            else if (currentDate.getFullYear() === end.getFullYear() && currentDate.getMonth() === end.getMonth()) {
                const totalDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                const endDay = end.getDate();
                const rentPerDay = monthlyRentDue / totalDays;
                monthlyRentDue = Math.floor((rentPerDay * endDay) / 10) * 10;
            }
            // For full months (not first or last), use the full rent amount
            else {
                console.log(`  → Full month rent: ₹${monthlyRentDue}`);
            }
            // Calculate pending rent for this month (rent due - payments made)
            const pendingForMonth = monthlyRentDue - totalPaidForMonth;
            if (pendingForMonth > 0) {
                totalPendingRent += pendingForMonth;
            }
            // Move to next month
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        return totalPendingRent;
    };
    // Calculate pending rent for "Pending Rent" type using rent history
    const calculatePendingRentForPendingType = () => {
        if (!formTenantName || !formShopNo || !startingDate || rentHistoryData.length === 0 || tenantShopData.length === 0) {
            return 0;
        }
        // Find the tenant and shop to get the shop closure date
        let shopClosureDate = null;
        const matchingTenant = tenantShopData.find(tenant => tenant.tenantName === formTenantName);
        if (matchingTenant) {
            matchingTenant.property?.forEach(property => {
                property.shops?.forEach(shop => {
                    if (shop.shopNo === formShopNo) {
                        shopClosureDate = shop.shopClosureDate;
                    }
                });
            });
        }
        // Create a mapping from tenantWithShopNoId to shopNo
        const tenantShopMapping = {};
        tenantShopData.forEach(tenant => {
            tenant.property?.forEach(property => {
                property.shops?.forEach(shop => {
                    if (shop.id) {
                        tenantShopMapping[shop.id] = {
                            shopNo: shop.shopNo,
                            tenantName: tenant.tenantName,
                            startingDate: shop.startingDate,
                            shopClosureDate: shop.shopClosureDate
                        };
                    }
                });
            });
        });
        // Filter rent history data for the specific shopNo
        const matchingTenantShopIds = Object.keys(tenantShopMapping).filter(id =>
            tenantShopMapping[id].shopNo === formShopNo &&
            tenantShopMapping[id].tenantName === formTenantName
        );
        if (matchingTenantShopIds.length === 0) {
            return 0;
        }
        const shopRentHistory = rentHistoryData.filter(history =>
            matchingTenantShopIds.includes(history.tenantWithShopNoId.toString())
        );
        if (shopRentHistory.length === 0) {
            return 0;
        }
        // Sort rent history by starting date to get chronological order
        const sortedRentHistory = shopRentHistory.sort((a, b) => new Date(a.startingMonthForThisRent) - new Date(b.startingMonthForThisRent));
        // Use shop closure date from tenant data, or current date if no closure date
        const endDate = shopClosureDate || new Date().toISOString().split('T')[0];
        const start = new Date(startingDate);
        const end = new Date(endDate);
        let totalPendingRent = 0;
        let currentDate = new Date(start.getFullYear(), start.getMonth(), 1);
        while (currentDate <= end) {
            // Get current month in YYYY-MM format more reliably
            const year = currentDate.getFullYear();
            const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            const currentMonth = `${year}-${month}`;
            let monthlyRentDue = 0;
            for (let i = 0; i < sortedRentHistory.length; i++) {
                const historyEntry = sortedRentHistory[i];
                const historyStartDate = new Date(historyEntry.startingMonthForThisRent);
                // Check if this rent history entry applies to the current month
                if (historyStartDate <= currentDate) {
                    // If this is the last entry, or if the next entry starts after current month
                    if (i === sortedRentHistory.length - 1 ||
                        new Date(sortedRentHistory[i + 1].startingMonthForThisRent) > currentDate) {
                        monthlyRentDue = parseFloat(historyEntry.rentAmount || 0);
                        break;
                    }
                }
            }
            if (monthlyRentDue === 0) {
                // Move to next month if no rent amount found
                currentDate.setMonth(currentDate.getMonth() + 1);
                continue;
            }
            // Get all rent-related payments for this month from rentalFormsData
            const allRentPayments = rentalFormsData.filter(form =>
                form.tenantName === formTenantName &&
                form.shopNo === formShopNo &&
                form.forTheMonthOf === currentMonth &&
                (
                    (form.formType === "Rent") ||
                    (form.formType === "Pending Rent") ||
                    (form.paymentMode && form.paymentMode.trim() === "Advance Adjustment")
                )
            );
            const totalPaidForMonth = allRentPayments.reduce((sum, form) => {
                return sum + parseFloat(form.amount || 0);
            }, 0);
            // If it's the first month, calculate pro-rated rent
            if (currentDate.getFullYear() === start.getFullYear() && currentDate.getMonth() === start.getMonth()) {
                const totalDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                const startDay = start.getDate();
                const rentPerDay = monthlyRentDue / totalDays;
                const proRatedDays = totalDays - startDay + 1;
                monthlyRentDue = Math.floor((rentPerDay * proRatedDays) / 10) * 10;
            }
            // If it's the last month and end date is not the last day of the month
            else if (currentDate.getFullYear() === end.getFullYear() && currentDate.getMonth() === end.getMonth()) {
                const totalDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                const endDay = end.getDate();
                const rentPerDay = monthlyRentDue / totalDays;
                monthlyRentDue = Math.floor((rentPerDay * endDay) / 10) * 10;
            }
            // Calculate pending rent for this month (rent due - payments made)
            const pendingForMonth = monthlyRentDue - totalPaidForMonth;
            if (pendingForMonth > 0) {
                totalPendingRent += pendingForMonth;
            }
            // Move to next month
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        return totalPendingRent;
    };
    // Handle payment mode change
    const handlePaymentModeChange = (e) => {
        const newPaymentMode = e.target.value;
        setFormPaymentMode(newPaymentMode);
        setAmountError('');
    };
    // Validate amount input for Advance Adjustment and Shop Closure
    const validateAmount = (inputAmount) => {
        if (inputAmount === null || inputAmount === undefined) {
            setAmountError('');
            return true;
        }
        if (typeof inputAmount === "string" && inputAmount.trim() === "") {
            setAmountError('');
            return true;
        }
        // Validation for Rent type with Advance Adjustment payment mode
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
        // Validation for Shop Closure type - refund amount cannot exceed remaining advance
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
        // Check if payment mode requires weekly payment bills popup
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
            window.location.reload();
            setIsSubmitting(false);
            setFormShopNo('');
            setFormTenantName('');
            setSelectedTenantId('');
            setAmount('');
            setFormPaymentMode('');
            setPaidOnDate('');
            await fetchRentalForms();
        } catch (error) {
            console.error("❌ Error submitting form:", error);
            alert("Unexpected error occurred.");
            setIsSubmitting(false);
        }
    };
    // Handle weekly payment bills submission
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
            // First submit the rental form and get the IDs of submitted forms
            const submittedFormIds = await submitRentalForm();
            // Determine the type based on rent type and refund amount
            const isShopClosureWithRefund = selectedRentType === "Shop Closure" && weeklyPaymentData.amount && parseFloat(weeklyPaymentData.amount) > 0;
            const isRefundPayment = selectedRentType === "Refund" && weeklyPaymentData.amount && parseFloat(weeklyPaymentData.amount) > 0;
            const isRefundFlow = isShopClosureWithRefund || isRefundPayment;
            const paymentType = isRefundFlow ? "Rent Payment Refund" : "Rent Payment";
            // Then submit to weekly payment bills with the rental form ID
            const weeklyPaymentBillPayload = {
                date: weeklyPaymentData.date,
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
                rent_management_id: submittedFormIds.length > 0 ? submittedFormIds[0] : null,
                tenant_id: selectedTenantId || null,
                tenant_complex_name: shopInfoMap[formShopNo]?.projectReferenceName || null,
            };
            const weeklyPaymentBillResponse = await fetch(
                "https://backendaab.in/aabuildersDash/api/weekly-payment-bills/save",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(weeklyPaymentBillPayload)
                }
            );
            if (!weeklyPaymentBillResponse.ok) {
                console.error("❌ Weekly payment bill submission failed");
            } else {
                console.log("✅ Weekly payment bill submitted:", weeklyPaymentBillPayload);
            }
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: isRefundFlow
                    ? 'Rent refund saved successfully and added to Weekly Payment Bills!'
                    : 'Rent payment saved successfully and added to Weekly Payment Bills!',
                confirmButtonColor: '#bf9853'
            });
            // Reset form
            window.location.reload();
        } catch (error) {
            console.error("❌ Error submitting weekly payment:", error);
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
    // Extract the rental form submission logic into a separate function
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
        const baseMonthlyRent = parseFloat(tenantInfo?.monthlyRent || 0);
        const closureValueForForm = selectedRentType === "Shop Closure"
            ? (closureDate || "")
            : (tenantInfo?.shopClosureDate || "");
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
                    r.shopNo === formShopNo &&
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
                            r.shopNo === formShopNo &&
                            r.forTheMonthOf === currentMonthStr;
                    } else {
                        return r.formType === "Rent" &&
                            r.shopNo === formShopNo &&
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
                    tenantNameId: tenantInfo?.tenantNameId || null,
                    amount: amountToPay,
                    refundAmount: "",
                    paymentMode: formPaymentMode,
                    paidOnDate,
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
                tenantNameId: tenantInfo?.tenantNameId || null,
                amount: (isClosure || isRefund) ? "" : cleanedAmount,
                refundAmount: (isClosure || isRefund) ? cleanedAmount : "",
                paymentMode: paymentMode,
                paidOnDate,
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
                console.error("❌ Submission failed for:", form);
                throw new Error("Form submission failed");
            } else {
                try {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const savedForm = await response.json();
                        if (savedForm && savedForm.id) {
                            submittedFormIds.push(savedForm.id);
                        }
                    } else {
                        const textResponse = await response.text();
                    }
                } catch (error) {
                    console.log("✅ Form submitted (could not parse response)");
                }
            }
        }
        // If we couldn't get IDs from the response, fetch the latest forms to get the IDs
        if (submittedFormIds.length === 0 && submissions.length > 0) {
            try {
                const allFormsRes = await fetch("https://backendaab.in/aabuildersDash/api/rental_forms/getAll");
                if (allFormsRes.ok) {
                    const allForms = await allFormsRes.json();
                    // Get the forms that match our submission criteria
                    const matchingForms = allForms.filter(f =>
                        f.eno === eno &&
                        f.tenantName === formTenantName &&
                        f.shopNo === formShopNo &&
                        f.paidOnDate === paidOnDate
                    );
                    // Get the IDs from matching forms
                    matchingForms.forEach(f => {
                        if (f.id) submittedFormIds.push(f.id);
                    });
                }
            } catch (error) {
                console.error("Could not fetch form IDs:", error);
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
                    console.error("❌ Weekly expense submission failed");
                } else {
                    console.log("✅ Weekly expense submitted:", weeklyExpenseData);
                }
            } catch (error) {
                console.error("❌ Error submitting weekly expense:", error);
            }
        }
        if (selectedRentType === "Shop Closure" && closureDate && formTenantName && formShopNo) {
            try {
                const updateClosureResponse = await fetch(`https://backendaab.in/aabuildersDash/api/tenantShop/updateClosureDate/${encodeURIComponent(formTenantName)}/${encodeURIComponent(formShopNo)}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ shopClosureDate: closureDate }),
                });
                if (!updateClosureResponse.ok) {
                    console.error("❌ Update closure date failed");
                } else {
                    console.log("✅ Closure date updated successfully");
                }
            } catch (error) {
                console.error("❌ Error updating closure date:", error);
            }
            try {
                await vacateShop(selectedTenantId, formShopNo);
            } catch (err) {
                console.error("❌ VacateShop failed", err);
            }
        }
        return submittedFormIds;
    };

    const vacateShop = async (tenantId, shopNo) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/tenantShop/vacateShop/${tenantId}/${shopNo}`, {
                method: 'PUT',
            });
            if (!response.ok) {
                throw new Error('Failed to vacate shop');
            }
            const result = await response.text();
            alert(result);
            window.location.reload();
        } catch (error) {
            console.error('Vacate error:', error);
            alert('Failed to vacate shop');
        }
    };
    useEffect(() => {
        if (!startingDate || !selectedMonth || (selectedRentType !== "Rent" && selectedRentType !== "Pending Rent")) return;
        const isTenantVacated = tenantShopData.some(tenant =>
            tenant.tenantName === formTenantName &&
            tenant.property?.some(p =>
                p.shops?.some(shop => shop.shopNo === formShopNo && !shop.active)
            )
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
        if (selectedRentType === "Pending Rent" && formTenantName && formShopNo && rentHistoryData.length > 0 && tenantShopData.length > 0) {
            const tenantShopMapping = {};
            tenantShopData.forEach(tenant => {
                tenant.property?.forEach(property => {
                    property.shops?.forEach(shop => {
                        if (shop.id) {
                            tenantShopMapping[shop.id] = {
                                shopNo: shop.shopNo,
                                tenantName: tenant.tenantName,
                                startingDate: shop.startingDate
                            };
                        }
                    });
                });
            });
            rentHistoryData.forEach(history => {
                const shopDetails = tenantShopMapping[history.tenantWithShopNoId];
            });
            const matchingTenantShopIds = Object.keys(tenantShopMapping).filter(id =>
                tenantShopMapping[id].shopNo === formShopNo &&
                tenantShopMapping[id].tenantName === formTenantName
            );
            const shopRentHistory = rentHistoryData.filter(history =>
                matchingTenantShopIds.includes(history.tenantWithShopNoId.toString())
            );
        }
    }, [selectedRentType, formTenantName, formShopNo, rentHistoryData, tenantShopData]);
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
                shops = tenant?.property?.flatMap(p => p.shops)?.filter(shop => !shop.active || !!shop.shopClosureDate) || [];
            } else if (selectedRentType !== "Pending Rent") {
                shops = tenant?.property?.flatMap(p => p.shops)?.filter(shop => shop.active && !shop.shopClosureDate) || [];
            } else {
                shops = tenant?.property?.flatMap(p => p.shops) || [];
            }
            const filtered = shops.map(shop => ({
                label: shop.shopNo,
                value: shop.shopNo,
            }));
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
    }, [formTenantName, tenantShopData, shopNoOptions, selectedRentType, shopInfoMap]);
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
                                    const matchingTenant = [...tenantShopData].reverse().find(t =>
                                        t.property?.some(p =>
                                            p.shops?.some(shop => {
                                                if (!shop || shop.shopNo !== selectedShopNo) return false;
                                                if (selectedRentType === "Refund") {
                                                    return !shop.active || !!shop.shopClosureDate;
                                                }
                                                return shop.active && !shop.shopClosureDate;
                                            })
                                        )
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
                                    const tenantsForShop = tenantShopData.filter(t =>
                                        t.property?.some(p =>
                                            p.shops?.some(shop => shop.shopNo === selectedShopNo)
                                        )
                                    );
                                    const shopTenantOptions = tenantsForShop.map(t => ({
                                        label: t.tenantName,
                                        value: t.tenantName,
                                        tenantId: t.id
                                    }));
                                    setTenantOptions(shopTenantOptions);
                                    setFormTenantName('');
                                    setSelectedTenantId('');
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
                                matchingTenant.property?.forEach(property => {
                                    property.shops?.forEach(shop => {
                                        if (shop.shopNo === formShopNo) {
                                            shopClosureDate = shop.shopClosureDate;
                                        }
                                    });
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
                                    const tenantShops = tenantMatch?.property?.flatMap(p => p.shops)?.filter(shop => {
                                        if (!shop) return false;
                                        if (selectedRentType === "Refund") {
                                            return !shop.active || !!shop.shopClosureDate;
                                        }
                                        return shop.active && !shop.shopClosureDate;
                                    }) || [];
                                    const newShopOptions = tenantShops.map(shop => ({
                                        value: shop.shopNo,
                                        label: shop.shopNo
                                    }));
                                    setFilteredShopNoOptions(newShopOptions);
                                    if (tenantShops.length > 0) {
                                        const activeShop = tenantShops[0];
                                        setFormShopNo(activeShop.shopNo);
                                        const shopData = shopInfoMap[activeShop.shopNo];
                                        if (shopData) {
                                            setStartingDate(shopData.startingDate);
                                        }
                                    } else {
                                        setFormShopNo('');
                                    }
                                } else {
                                    const tenantMatch = tenantShopData.find(t => t.tenantName === selectedOption.value);
                                    const tenantShops = tenantMatch?.property?.flatMap(p => p.shops) || [];
                                    const newShopOptions = tenantShops.map(shop => ({
                                        value: shop.shopNo,
                                        label: shop.shopNo
                                    }));
                                    setFilteredShopNoOptions(newShopOptions);
                                    if (tenantShops.length > 0) {
                                        const firstShop = tenantShops[0];
                                        setFormShopNo(firstShop.shopNo);
                                        const shopData = shopInfoMap[firstShop.shopNo];
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
            {/* Weekly Payment Bills Popup */}
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