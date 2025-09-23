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
    const [properties, setProperties] = useState([]);
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
        // This ensures the input is cleared even if the same file is selected again next time
        e.target.value = '';
    };
    useEffect(() => {
        fetchProperties();
    }, []);
    const fetchProperties = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/properties/all');
            if (response.ok) {
                const data = await response.json();
                setProperties(data);
                setMessage('Error fetching properties.');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error fetching properties.');
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

                // For regular types, filter active tenants only
                if (selectedRentType !== "Pending Rent") {
                    const activeTenants = data.filter(t =>
                        t.property?.some(p =>
                            p.shops?.some(shop => shop.active)
                        )
                    );
                    // Step 2: Map all active tenant-shop combinations
                    const options = activeTenants.flatMap(t =>
                        t.property.flatMap(p =>
                            p.shops
                                .filter(shop => shop.active)
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
                    // For Pending Rent, include all tenants (active and vacated)
                    const allTenants = data.filter(t => t.tenantName); // Filter out any invalid entries
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
            setMessage('Error fetching properties.');
        }
    };
    const [shopInfoMap, setShopInfoMap] = useState({});
    useEffect(() => {
        const newShopInfoMap = {};
        tenantShopData.forEach(tenant => {
            tenant.property?.forEach(property => {
                property.shops?.forEach(shop => {
                    if (shop.shopNo) {
                        newShopInfoMap[shop.shopNo] = {
                            doorNo: shop.doorNo || '',
                            propertyName: property.propertyName || '',
                            advanceAmount: shop.advanceAmount || '',
                            monthlyRent: shop.monthlyRent || '',
                            startingDate: shop.startingDate
                        };
                    }
                });
            });
        });
        setShopInfoMap(newShopInfoMap);
    }, [tenantShopData]);
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
            console.log(shopDetails);
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
    // Handle payment mode change and auto-fill advance amount
    const handlePaymentModeChange = (e) => {
        const newPaymentMode = e.target.value;
        setFormPaymentMode(newPaymentMode);
        setAmountError(''); 
        // Auto-fill advance amount when Advance Adjustment is selected for Rent type
        if ((selectedRentType === "Rent" || selectedRentType === "Pending Rent") && newPaymentMode && newPaymentMode.trim() === "Advance Adjustment" && advanceAmount > 0) {
            setAmount(advanceAmount.toString());
        }
    };
     // Validate amount input for Advance Adjustment and Shop Closure
     const validateAmount = (inputAmount) => {
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
        // ✅ Check if payment mode is selected (required for Shop Closure only when refundAmount > 0)
        const cleanedAmount = parseFloat((amount || "").replace(/[^0-9.]/g, ""));
        const isShopClosureWithNoRefund = selectedRentType === "Shop Closure" && (isNaN(cleanedAmount) || cleanedAmount === 0);
        if (!formPaymentMode && !isShopClosureWithNoRefund) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Payment Mode',
                text: 'Please select a Payment Mode before submitting.',
                confirmButtonColor: '#bf9853'
            });
            return;
        }
        // ✅ Validate amount for Advance Adjustment
        if (!validateAmount(amount)) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Amount',
                text: amountError,
                confirmButtonColor: '#bf9853'
            });
            return;
        }
        setIsSubmitting(true);
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
        try {
            const rentFormsRes = await fetch("https://backendaab.in/aabuildersDash/api/rental_forms/getAll");
            if (!rentFormsRes.ok) throw new Error("Failed to fetch existing rent forms");
            const rentForms = await rentFormsRes.json();
            let pdfUrl = '';
            if (selectedRentFile) {
                const formData = new FormData();
                formData.append('pdf', selectedRentFile);
                formData.append('filename', `${date} `);
                const uploadResponse = await fetch("https://backendaab.in/aabuildersDash/rentForm/googleUploader/uploadToGoogleDrive", {
                    method: "POST",
                    body: formData,
                });
                if (!uploadResponse.ok) throw new Error('File upload failed');
                const uploadResult = await uploadResponse.json();
                pdfUrl = uploadResult.url;
            }
            const tenantInfo = shopInfoMap[formShopNo];
            const baseMonthlyRent = parseFloat(tenantInfo?.monthlyRent || 0);            
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
                    setIsSubmitting(false);
                    return;
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
                        setIsSubmitting(false);
                        return;
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
                        setIsSubmitting(false);
                        return;
                    }            
                    const amountToPay = Math.min(remainingAmount, dueThisMonth);            
                    const rentalForm = {
                        formType: selectedRentType,
                        shopNo: formShopNo,
                        eno,
                        tenantName: formTenantName,
                        amount: amountToPay,
                        refundAmount: "",
                        paymentMode: formPaymentMode,
                        paidOnDate,
                        forTheMonthOf: currentMonthStr,
                        attachedFile: pdfUrl,
                        shopClosureDate: closureDate || "",
                    };
            
                    submissions.push(rentalForm);
                    remainingAmount -= amountToPay;
                    currentDate.setMonth(currentDate.getMonth() + 1);
                }
            }
             else {
                const isClosure = selectedRentType === "Shop Closure";
                const form = {
                    formType: selectedRentType,
                    shopNo: formShopNo,
                    eno,
                    tenantName: formTenantName,
                    amount: isClosure ? "" : cleanedAmount,
                    refundAmount: isClosure ? cleanedAmount : "",
                    paymentMode: formPaymentMode,
                    paidOnDate,
                    forTheMonthOf: selectedRentType === "Rent" || selectedRentType === "Pending Rent" ? selectedMonth : "",
                    attachedFile: pdfUrl,
                    shopClosureDate: closureDate || "",
                };
                submissions.push(form);
            }
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
                    console.log("✅ Form submitted:", form);
                }
            }
            if (closureDate && formTenantName && formShopNo) {
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
            }
            if (selectedRentType === "Shop Closure") {
                try {
                    await vacateShop(selectedTenantId, formShopNo);
                } catch (err) {
                    console.error("❌ VacateShop failed", err);
                }
            }
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
            else if (selectedRentType === "Shop Closure") {
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
            if (selectedRentType !== "Pending Rent") {
                shops = tenant?.property?.flatMap(p => p.shops)?.filter(shop => shop.active) || [];
            } else {
                shops = tenant?.property?.flatMap(p => p.shops) || [];
            }
            const filtered = shops.map(shop => ({
                label: shop.shopNo,
                value: shop.shopNo,
            }));
            setFilteredShopNoOptions(filtered);
        } else {
            setFilteredShopNoOptions(shopNoOptions);
        }
    }, [formTenantName, tenantShopData, shopNoOptions, selectedRentType]);
    return (
        <div className="p-6 bg-[#FFFFFF] lg:w-[1800px] w-[400px] ml-12 text-left pl-8">
            <div className="flex">
                <div>
                    <h2 className="text-[#E4572E] font-bold mb-2 text-base">Select Type</h2>
                    <select className="border-2 border-opacity-[0.18] focus:outline-none border-[#BF9853] rounded-lg p-2 mt-1 w-[170px] h-[45px]"
                        value={selectedRentType} onChange={(e) => setSelectedRentType(e.target.value)} >
                        <option value="Rent">Rent</option>
                        <option value="Advance">Advance</option>
                        <option value="Shop Closure">Shop Closure</option>
                        <option value="Pending Rent">Pending Rent</option>
                    </select>
                </div>
                <span className="text-right ml-4 text-[#E4572E]">ENO:{eno}</span>
            </div>
            <div className="mt-4 lg:flex gap-8">
                <div className="mt-4">
                    <label className="block font-semibold mb-2">Shop No</label>
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
                                            p.shops?.some(shop => shop.shopNo === selectedShopNo && shop.active)
                                        )
                                    );
                                    if (matchingTenant) {
                                        setFormTenantName(matchingTenant.tenantName);
                                        setSelectedTenantId(matchingTenant.id);
                                        const shopData = shopInfoMap[selectedShopNo];
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
                        className="w-[170px]"
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
                <div className="mt-4">
                    <div className="space-y-2">
                        {formTenantName && formShopNo && (
                            <div className={`text-sm text-gray-700 mb-3 flex items-center gap-2 ${
                                (selectedRentType === "Rent" || selectedRentType === "Pending Rent" || selectedRentType === "Shop Closure") 
                                    ? "-mt-[53px]" 
                                    : " -mt-[34px]"
                            }`}>
                                <span>Advance Amount: ₹ {advanceAmount.toLocaleString('en-IN')}</span>
                            </div>
                        )}
                        {selectedRentType === "Rent" && selectedMonth && calculatedRent && (
                            <div className="text-sm text-gray-700 ">
                                Rent To Be Paid For {selectedMonth
                                    ? new Date(`${selectedMonth}-01`).toLocaleString('default', {
                                        month: 'long',
                                        year: 'numeric',
                                    })
                                    : ''}: ₹ {calculatedRent}
                            </div>
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
                    <label className="block font-semibold mb-2">Tenant Name</label>
                    <Select
                        name="tenantName"
                        value={tenantOptions.find(option => option.value === formTenantName)}
                        onChange={(selectedOption) => {
                            if (selectedOption) {
                                setFormTenantName(selectedOption.value);
                                setSelectedTenantId(selectedOption.tenantId);
                                if (selectedRentType !== "Pending Rent") {
                                    const tenantMatch = tenantShopData.find(t => t.tenantName === selectedOption.value);
                                    const tenantShops = tenantMatch?.property?.flatMap(p => p.shops)?.filter(shop => shop.active) || [];
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
                        className="w-[290px]"
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
            <div className="mt-2 lg:flex gap-8">
                <div className="mt-4">
                    <label className="block font-semibold mb-2">
                        {selectedRentType === "Shop Closure" ? "Refund Amount" : "Amount"}
                    </label>
                    <input
                        className={`border-2 border-opacity-[0.18] focus:outline-none rounded-lg p-2 w-[170px] h-[45px] ${
                            amountError ? 'border-red-500' : 'border-[#BF9853]'
                        }`}
                        type="text"
                        value={formatINR(amount)}
                        onChange={(e) => {
                            setAmount(e.target.value);
                            validateAmount(e.target.value);
                        }}
                    />
                </div>
                <div className="mt-4">
                    <label className="block font-semibold mb-2">Payment Mode</label>
                    <select
                        value={formPaymentMode}
                        onChange={handlePaymentModeChange}
                        className="border-2 border-opacity-[0.18] focus:outline-none border-[#BF9853] rounded-lg p-2 w-[290px] h-[45px]"
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
            <div className="mt-2 lg:flex gap-8">
                <div className="mt-4">
                    <label className="block font-semibold mb-2">Paid on</label>
                    <input
                        type="date"
                        value={paidOnDate}
                        onChange={(e) => setPaidOnDate(e.target.value)}
                        className="border-2 border-opacity-[0.18] focus:outline-none border-[#BF9853] rounded-lg p-2 w-[170px] h-[45px]"
                    />
                </div>
                {selectedRentType === "Shop Closure" && (
                    <div className="mt-4">
                        <label className="block font-semibold mb-2">Closure Date</label>
                        <input
                            type="date"
                            value={closureDate}
                            onChange={(e) => setClosureDate(e.target.value)}
                            className="border-2 border-opacity-[0.18] focus:outline-none border-[#BF9853] rounded-lg p-2 w-[170px] h-[45px]"
                        />
                    </div>
                )}
                {(selectedRentType === "Rent" || selectedRentType === "Pending Rent") && (
                    <div className="mt-4">
                        <label className="block font-semibold mb-2">For The Month of</label>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="border-2 border-opacity-[0.18] focus:outline-none border-[#BF9853] rounded-lg p-2 w-[170px] h-[45px]"
                        />
                    </div>
                )}
            </div>
            <div className="mt-4 sm:flex">
                <div className='flex'>
                    <label htmlFor="fileInput" className="cursor-pointer flex items-center text-orange-600">
                        <img className='w-5 h-4' alt='' src={Attach}></img>
                        Attach file
                    </label>
                    <input type="file" id="fileInput" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                </div>
                {selectedRentFile && <span className="text-gray-600">{selectedRentFile.name}</span>}
            </div>
            <button
                type='submit'
                disabled={isSubmitting}
                onClick={handleSubmit}
                className={`bg-yellow-700 text-white px-6 mt-8 py-2 rounded-md hover:bg-yellow-600 transition duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
        </div>
    );
};
export default Form;