import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import edit from '../Images/Edit.svg';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PropertyTab = ({ username, userRoles = [] }) => {
    const [filters, setFilters] = useState({
        year: new Date().getFullYear().toString(),
        month: MONTH_LABELS[new Date().getMonth()],
        paymentStatus: '',
        vendor: '',
        service: '',
        doorNo: '',
        shop: '',
        projectName: '',
        projectType: '',
        tenant: '',
        occupancyStatus: ''
    });

    const [projects, setProjects] = useState([]);
    const [propertyTaxPayments, setPropertyTaxPayments] = useState([]);
    const [frequencyHistory, setFrequencyHistory] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(''); // Show all by default
    const [showHideModal, setShowHideModal] = useState(false);
    const [hiddenProjects, setHiddenProjects] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [tenantShopData, setTenantShopData] = useState([]);
    const [tenantOptions, setTenantOptions] = useState([]);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [activityFormData, setActivityFormData] = useState({
        propertyTaxFrequency: '',
        propertyTaxStartingMonth: ''
    });
    const [selectedRowData, setSelectedRowData] = useState(null);
    const [submittedFrequencyData, setSubmittedFrequencyData] = useState({});
    const monthLabels = MONTH_LABELS;
    const paymentStatusOptions = [
        { value: 'Paid', label: 'Paid' },
        { value: 'Unpaid', label: 'Unpaid' }
    ];
    const occupancyStatusOptions = [
        { value: 'occupied', label: 'Occupied Shop' },
        { value: 'vacated', label: 'Vacated Shop' }
    ];

    // Fetch projects data
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get('https://backendaab.in/demoAabuilderDash/api/projects/getAll');
                // Filter projects that have propertyNo in propertyDetails
                const projectsWithPropertyNo = response.data.filter(project =>
                    project.propertyDetails &&
                    project.propertyDetails.some(property => property.propertyTaxNo && property.propertyTaxNo.trim() !== '')
                );

                // Separate hidden and visible projects
                const visibleProjects = projectsWithPropertyNo.filter(project => !project.hide);
                const hiddenProjects = projectsWithPropertyNo.filter(project => project.hide);

                setProjects(visibleProjects);
                setHiddenProjects(hiddenProjects);
                setFilteredProjects(visibleProjects);
            } catch (error) {
                console.error('Error fetching projects:', error);
                setError('Failed to fetch projects data');
            }
        };

        fetchProjects();
    }, []);

    // Fetch property tax payments data
    useEffect(() => {
        const fetchPropertyTaxPayments = async () => {
            try {
                const response = await axios.get('https://backendaab.in/demoAabuilderDash/expenses_form/utility/property');
                setPropertyTaxPayments(response.data || []);
            } catch (error) {
                console.error('Error fetching property tax payments:', error);
                // Don't set error for this as it might not be critical
            } finally {
                setLoading(false);
            }
        };

        fetchPropertyTaxPayments();
    }, []);

    // Fetch frequency history data
    useEffect(() => {
        const fetchFrequencyHistory = async () => {
            try {
                const response = await axios.get('https://backendaab.in/demoAabuilderDash/api/frequency-history/getAll');
                setFrequencyHistory(response.data || []);
            } catch (error) {
                console.error('Error fetching frequency history:', error);
                // Don't set error for this as it might not be critical
            }
        };

        fetchFrequencyHistory();
    }, []);

    // Fetch vendor names
    useEffect(() => {
        const fetchVendorNames = async () => {
            try {
                const response = await fetch("https://backendaab.in/demoAabuilderDash/api/vendor_Names/getAll", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                if (!response.ok) {
                    throw new Error("Network response was not ok: " + response.statusText);
                }
                const data = await response.json();
                const formattedData = data.map(item => ({
                    value: item.vendorName,
                    label: item.vendorName
                }));
                setVendorOptions(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchVendorNames();
    }, []);

    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const response = await fetch('https://backendaab.in/demoAabuildersDash/api/tenant_link_shop/getAll');
                if (!response.ok) return;
                const data = await response.json();
                const tenants = Array.isArray(data) ? data : [];
                setTenantShopData(tenants);
                const opts = Array.from(
                    new Set(
                        tenants
                            .map(t => (t?.tenantName || '').toString().trim())
                            .filter(Boolean)
                    )
                )
                    .sort((a, b) => a.localeCompare(b))
                    .map(name => ({ value: name, label: name }));
                setTenantOptions(opts);
            } catch (e) {
                console.error('Error fetching tenants:', e);
            }
        };
        if (projects.length > 0) {
            fetchTenants();
        }
    }, [projects]);

    const matchesPaymentFilters = (property) => {
        const selectedMonth = filters.month;
        const selectedStatus = filters.paymentStatus;

        if (!selectedMonth && !selectedStatus) {
            return true;
        }

        const evaluateMonth = (month) => {
            const paymentData = getPaymentData(property.propertyTaxNo, month, property.id);
            const isPaid = paymentData.amount !== '-' && paymentData.amount !== '0';
            const isUnpaid = paymentData.amount === '0';

            if (selectedStatus === 'Paid') return isPaid;
            if (selectedStatus === 'Unpaid') return isUnpaid;
            return true;
        };

        if (selectedMonth) {
            return evaluateMonth(selectedMonth);
        }

        return monthLabels.some((month) => evaluateMonth(month));
    };

    // Apply filters (match ElectricityTab behavior)
    useEffect(() => {
        const toLower = (value) => (value ? value.toString().toLowerCase() : '');
        const vendorFilter = toLower(filters.vendor);
        const doorFilter = toLower(filters.doorNo);
        const shopFilter = toLower(filters.shop);
        const projectTypeFilter = toLower(filters.projectType);
        const serviceFilter = toLower(filters.service);
        const tenantFilter = toLower(filters.tenant);
        const projectNameFilter = toLower(filters.projectName);
        const occupancyFilter = toLower(filters.occupancyStatus);
        const selectedYearForFilters = filters.year || new Date().getFullYear().toString();
        const monthMap = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
            'May': '05', 'June': '06', 'July': '07', 'Aug': '08',
            'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };
        const selectedMonthNumber = filters.month ? monthMap[filters.month] : null;
        const selectedYearMonthForFilters = selectedMonthNumber ? `${selectedYearForFilters}-${selectedMonthNumber}` : null;

        const getPaymentVendorValue = (payment) => toLower(
            payment?.vendorName ??
            payment?.vendor ??
            payment?.vendor_name ??
            payment?.vendorNameLabel ??
            payment?.party ??
            ''
        );

        const propertyMatchesVendorFromPayments = (property) => {
            if (!vendorFilter) return true;
            const serviceNo = property?.propertyTaxNo;
            if (!serviceNo) return false;
            const paymentsForService = propertyTaxPayments.filter(p => p?.utilityTypeNumber === serviceNo);
            const scopedPayments = selectedYearMonthForFilters
                ? paymentsForService.filter(p => p?.utilityForTheMonth === selectedYearMonthForFilters)
                : paymentsForService.filter(p => typeof p?.utilityForTheMonth === 'string' && p.utilityForTheMonth.startsWith(`${selectedYearForFilters}-`));
            return scopedPayments.some(p => getPaymentVendorValue(p).includes(vendorFilter));
        };

        // Tenant ↔ Shop link lookup
        const tenantLinksByPropertyId = new Map();
        if (Array.isArray(tenantShopData) && tenantShopData.length) {
            tenantShopData.forEach(tenant => {
                const tName = (tenant?.tenantName || '').toString();
                (tenant?.shopNos || []).forEach(shop => {
                    const propertyId = shop?.shopNoId;
                    if (!propertyId) return;
                    if (!tenantLinksByPropertyId.has(propertyId)) tenantLinksByPropertyId.set(propertyId, []);
                    tenantLinksByPropertyId.get(propertyId).push({
                        tenantName: tName,
                        shopClosureDate: shop?.shopClosureDate || null
                    });
                });
            });
        }
        const getLinksForProperty = (propertyId) => tenantLinksByPropertyId.get(propertyId) || [];
        const matchesTenantFromLinks = (propertyId) => {
            if (!tenantFilter) return true;
            const links = getLinksForProperty(propertyId);
            if (!links.length) return false;
            return links.some(l => toLower(l.tenantName).includes(tenantFilter));
        };
        const matchesOccupancyFromLinks = (propertyId) => {
            if (!occupancyFilter) return true;
            const links = getLinksForProperty(propertyId);
            const hasActive = links.some(l => !l.shopClosureDate);
            const hasVacated = links.some(l => !!l.shopClosureDate);
            if (occupancyFilter === 'occupied') return hasActive;
            if (occupancyFilter === 'vacated') return !hasActive && hasVacated;
            return true;
        };

        const filtered = projects.reduce((acc, project) => {
            if (selectedCategory && project.projectCategory !== selectedCategory) {
                return acc;
            }

            if (projectNameFilter && !toLower(project.projectName).includes(projectNameFilter)) {
                return acc;
            }

            const filteredProperties = (project.propertyDetails || []).filter(property => {
                if (!property || !property.propertyTaxNo || !property.propertyTaxNo.trim()) {
                    return false;
                }
                if (doorFilter && !toLower(property.doorNo).includes(doorFilter)) {
                    return false;
                }
                if (shopFilter && !toLower(property.shopNo).includes(shopFilter)) {
                    return false;
                }
                if (projectTypeFilter && !toLower(property.projectType).includes(projectTypeFilter)) {
                    return false;
                }
                if (serviceFilter && !toLower(property.propertyTaxNo).includes(serviceFilter)) {
                    return false;
                }
                if (vendorFilter && !propertyMatchesVendorFromPayments(property)) {
                    return false;
                }
                if (!matchesPaymentFilters(property)) {
                    return false;
                }
                const propertyId = property?.id ?? property?.propertyId ?? property?.projectNamePropertyDetailsId;
                if (!matchesTenantFromLinks(propertyId)) return false;
                if (!matchesOccupancyFromLinks(propertyId)) return false;
                return true;
            });

            if (filteredProperties.length === 0) {
                return acc;
            }

            acc.push({
                ...project,
                propertyDetails: filteredProperties
            });

            return acc;
        }, []);

        setFilteredProjects(filtered);
    }, [filters, projects, selectedCategory, propertyTaxPayments, frequencyHistory, tenantShopData]);

    const handleFilterChange = (filterType, selectedOption) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: selectedOption ? selectedOption.value : ''
        }));
    };

    // Custom styles for react-select
    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            height: '45px',
            border: '2px solid #BF9853',
            borderOpacity: '0.35',
            borderRadius: '8px',
            boxShadow: 'none',
            '&:hover': {
                border: '2px solid #BF9853',
            },
            ...(state.isFocused && {
                border: '2px solid #BF9853',
                boxShadow: 'none',
            }),
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#BF9853' : state.isFocused ? '#F5F5F5' : 'white',
            color: state.isSelected ? 'white' : 'black',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#9CA3AF',
        }),
    };

    // Get unique values for filter options
    const getUniqueValues = (key) => {
        const values = new Set();
        projects.forEach(project => {
            if (key === 'projectName') {
                values.add(project.projectName);
            } else if (key === 'doorNo') {
                project.propertyDetails.forEach(property => {
                    if (property.doorNo) values.add(property.doorNo);
                });
            } else if (key === 'shop') {
                project.propertyDetails.forEach(property => {
                    if (property.shopNo) values.add(property.shopNo);
                });
            } else if (key === 'projectType') {
                project.propertyDetails.forEach(property => {
                    if (property.projectType) values.add(property.projectType);
                });
            } else if (key === 'serviceNo') {
                project.propertyDetails.forEach(property => {
                    if (property.propertyTaxNo) values.add(property.propertyTaxNo);
                });
            }
        });
        return Array.from(values).sort().map(value => ({
            value: value,
            label: value
        }));
    };

    // Get frequency data for a specific property
    const getFrequencyData = (propertyId) => {
        console.log('Looking for frequency data for property ID:', propertyId);
        console.log('Available frequency history:', frequencyHistory);
        const found = frequencyHistory.find(freq => freq.projectNamePropertyDetailsId === propertyId);
        console.log('Found frequency data:', found);
        return found;
    };

    // Determine if a month needs payment based on frequency
    const shouldPayInMonth = (propertyId, month, year) => {
        if (!propertyId) return true;
        if (!frequencyHistory || frequencyHistory.length === 0) return true;

        const propertyIdStr = String(propertyId);
        const records = frequencyHistory.filter((f) => {
            const freqPropertyId = f?.projectNamePropertyDetailsId;
            const freqPropertyIdStr = freqPropertyId !== undefined && freqPropertyId !== null ? String(freqPropertyId) : null;
            return (
                freqPropertyIdStr === propertyIdStr &&
                (f.startingMonthOfPropertyTaxFrequency || f.startingMonthOfPropertyFrequency)
            );
        });
        if (records.length === 0) return true;

        const currentYear = parseInt(year, 10);
        const currentMonth = parseInt(month, 10);
        if (Number.isNaN(currentYear) || Number.isNaN(currentMonth)) return true;

        const currentVal = currentYear * 12 + currentMonth;
        const sorted = records.slice().sort((a, b) => {
            const [aY, aM] = (a.startingMonthOfPropertyTaxFrequency || a.startingMonthOfPropertyFrequency).split('-').map(Number);
            const [bY, bM] = (b.startingMonthOfPropertyTaxFrequency || b.startingMonthOfPropertyFrequency).split('-').map(Number);
            return aY * 12 + aM - (bY * 12 + bM);
        });

        let active = null;
        for (const rec of sorted) {
            const [rY, rM] = (rec.startingMonthOfPropertyTaxFrequency || rec.startingMonthOfPropertyFrequency).split('-').map(Number);
            const recVal = rY * 12 + rM;
            if (recVal <= currentVal) active = rec;
            else break;
        }
        if (!active) return true;

        const activeFreqRaw = active.propertyTaxFrequencyNo ?? active.propertyFrequencyNo;
        const activeFreqMissing = activeFreqRaw === undefined || activeFreqRaw === null;
        const activeStart = active.startingMonthOfPropertyTaxFrequency || active.startingMonthOfPropertyFrequency;
        if (activeFreqMissing || !activeStart) return true;

        const frequency = parseInt(activeFreqRaw, 10);
        if (Number.isNaN(frequency) || frequency < 0) return true;

        const [startYear, startMonth] = String(activeStart).trim().split('-').map(Number);
        const monthsSinceStart = (currentYear - startYear) * 12 + (currentMonth - startMonth);

        // Frequency 0 means: from starting month onwards, no payment required (show "-")
        if (frequency === 0) return monthsSinceStart < 0;

        return monthsSinceStart >= 0 && monthsSinceStart % frequency === 0;
    };

    // Check if payment is made for a specific propertyTaxNo and month
    const isPaymentMade = (propertyTaxNo, month) => {
        return propertyTaxPayments.some(payment =>
            payment.utilityTypeNumber === propertyTaxNo &&
            payment.utilityForTheMonth === month
        );
    };

    const getPaymentData = (propertyTaxNo, month, propertyId) => {
        const selectedYear = filters.year || new Date().getFullYear().toString();
        const monthMap = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
            'May': '05', 'June': '06', 'July': '07', 'Aug': '08',
            'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };

        const monthNumber = monthMap[month];
        if (!monthNumber) return { amount: '-', date: null };

        const yearMonth = `${selectedYear}-${monthNumber}`;
        // ✅ Helper: find the active frequency record for this month
        const getActiveFrequencyData = (propertyId, year, monthNumber) => {
            if (!frequencyHistory || frequencyHistory.length === 0) return null;

            const propertyIdStr = String(propertyId);
            const records = frequencyHistory.filter((f) => {
                const freqPropertyId = f?.projectNamePropertyDetailsId;
                const freqPropertyIdStr = freqPropertyId !== undefined && freqPropertyId !== null ? String(freqPropertyId) : null;
                return (
                    freqPropertyIdStr === propertyIdStr &&
                    (f.startingMonthOfPropertyTaxFrequency || f.startingMonthOfPropertyFrequency)
                );
            });

            if (records.length === 0) return null;

            const currentVal = year * 12 + parseInt(monthNumber);

            // Sort ascending
            const sorted = records.sort((a, b) => {
                const [aY, aM] = (a.startingMonthOfPropertyTaxFrequency || a.startingMonthOfPropertyFrequency).split('-').map(Number);
                const [bY, bM] = (b.startingMonthOfPropertyTaxFrequency || b.startingMonthOfPropertyFrequency).split('-').map(Number);
                return aY * 12 + aM - (bY * 12 + bM);
            });

            // Pick the most recent record before or equal to current month
            let active = sorted[0];
            for (const rec of sorted) {
                const [rY, rM] = (rec.startingMonthOfPropertyTaxFrequency || rec.startingMonthOfPropertyFrequency).split('-').map(Number);
                const recVal = rY * 12 + rM;
                if (recVal <= currentVal) {
                    active = rec;
                } else {
                    break;
                }
            }

            return active;
        };

        // ✅ Get the correct frequency record
        const freqData = getActiveFrequencyData(propertyId, parseInt(selectedYear), parseInt(monthNumber));
        const freqValue = freqData?.propertyTaxFrequencyNo ?? freqData?.propertyFrequencyNo;
        const freqMissing = freqValue === undefined || freqValue === null;
        if (!freqData || freqMissing || !(freqData.startingMonthOfPropertyTaxFrequency || freqData.startingMonthOfPropertyFrequency)) {
            const payment = propertyTaxPayments.find(p =>
                p.utilityTypeNumber === propertyTaxNo &&
                p.utilityForTheMonth === yearMonth
            );
            if (payment) {
                return {
                    amount: payment.amount || '0',
                    date: payment.date || null,
                    billCopyUrl: payment.billCopyUrl || payment.billCopy || payment.fileUrl || null
                };
            }
            return { amount: '0', date: null }; // Default: monthly
        }

        const frequency = parseInt(freqValue, 10);
        const startingMonth = (freqData.startingMonthOfPropertyTaxFrequency || freqData.startingMonthOfPropertyFrequency).trim();

        // Parse YYYY-MM safely
        const [startYear, startMonth] = startingMonth.split('-').map(Number);
        const currentMonth = parseInt(monthNumber);
        const currentYear = parseInt(selectedYear);

        // ✅ Get today's year and month
        const now = new Date();
        const thisYear = now.getFullYear();
        const thisMonth = now.getMonth() + 1;

        // ✅ Don't ask payment for future months
        if (currentYear > thisYear || (currentYear === thisYear && currentMonth > thisMonth)) {
            return { amount: '-', date: null, isNotRequired: true }; // Future month → skip
        }

        // ✅ Calculate months since start
        const monthsSinceStart = (currentYear - startYear) * 12 + (currentMonth - startMonth);

        // ✅ Frequency 0 means: from starting month onwards, not required ("-")
        if (frequency === 0 && monthsSinceStart >= 0) {
            console.log(
                `[PropertyTab] getPaymentData: property=${propertyId} service=${propertyTaxNo} ym=${yearMonth} frequency=0 start=${startingMonth} -> "-" (override payments)`
            );
            return { amount: '-', date: null, isNotRequired: true };
        }

        const payment = propertyTaxPayments.find(p =>
            p.utilityTypeNumber === propertyTaxNo &&
            p.utilityForTheMonth === yearMonth
        );
        if (payment) {
            return {
                amount: payment.amount || '0',
                date: payment.date || null,
                billCopyUrl: payment.billCopyUrl || payment.billCopy || payment.fileUrl || null
            };
        }

        // ✅ Include starting month as payable
        const shouldPay = monthsSinceStart >= 0 && monthsSinceStart % frequency === 0;

        console.log(
            `DEBUG → Property ${propertyId} (FreqID: ${freqData.id}) | Month ${month}/${selectedYear} | Start ${startMonth}/${startYear} | Freq ${frequency} | MonthsSinceStart=${monthsSinceStart} | ShouldPay=${shouldPay}`
        );

        if (shouldPay) {
            return { amount: '0', date: null }; // Payment required (unpaid)
        } else {
            return { amount: '-', date: null, isNotRequired: true }; // Not due this month
        }
    };

    // Get unpaid count for a Property Tax number
    const getUnpaidCount = (propertyTaxNo, propertyId) => {
        // Use selected year or current year as fallback
        const selectedYear = filters.year || new Date().getFullYear().toString();
        const monthMap = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
            'May': '05', 'June': '06', 'July': '07', 'Aug': '08',
            'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let unpaidCount = 0;
        months.forEach(month => {
            const monthNumber = monthMap[month];

            // Only count months that need payment based on frequency
            if (shouldPayInMonth(propertyId, monthNumber, selectedYear)) {
                const yearMonth = `${selectedYear}-${monthNumber}`;
                const payment = propertyTaxPayments.find(p =>
                    p.utilityTypeNumber === propertyTaxNo &&
                    p.utilityForTheMonth === yearMonth
                );
                if (!payment) {
                    unpaidCount++;
                }
            }
        });
        return unpaidCount;
    };
    const toggleProjectHideStatus = async (projectId, isHide) => {
        try {
            const response = await axios.put(`https://backendaab.in/demoAabuilderDash/api/projects/hide/${projectId}`, null, {
                params: { isHide }
            });
            if (response.data) {
                // Update the project in the appropriate state
                if (isHide) {
                    // Move from visible to hidden
                    const projectToHide = projects.find(p => p.id === projectId);
                    if (projectToHide) {
                        setProjects(prev => prev.filter(p => p.id !== projectId));
                        setHiddenProjects(prev => [...prev, { ...projectToHide, hide: true }]);
                    }
                } else {
                    // Move from hidden to visible
                    const projectToShow = hiddenProjects.find(p => p.id === projectId);
                    if (projectToShow) {
                        setHiddenProjects(prev => prev.filter(p => p.id !== projectId));
                        setProjects(prev => [...prev, { ...projectToShow, hide: false }]);
                    }
                }
            }
        } catch (error) {
            console.error('Error updating project hide status:', error);
        }
    };
    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };
    // Handle file click - open file directly
    const handleFileClick = (fileData) => {
        if (fileData && fileData.billCopyUrl) {
            window.open(fileData.billCopyUrl, '_blank');
        } else if (fileData) {
            alert('No file attached for this payment');
        }
    };
    // Handle activity edit button click
    const handleActivityEdit = (project, property) => {
        setSelectedRowData({ project, property });
        setActivityFormData({
            propertyTaxFrequency: '',
            propertyTaxStartingMonth: ''
        });
        setShowActivityModal(true);
    };
    // Handle activity form submission
    const handleActivitySubmit = async () => {
        if (!activityFormData.propertyTaxFrequency.trim() || !activityFormData.propertyTaxStartingMonth) {
            alert('Please fill in all required fields');
            return;
        }
        try {
            // Prepare frequency history data
            // Property tab should save to Property frequency fields
            const frequencyHistoryData = {
                projectNamePropertyDetailsId: selectedRowData.property.id, // Property ID from the selected row
                propertyFrequencyNo: parseInt(activityFormData.propertyTaxFrequency, 10),
                startingMonthOfPropertyFrequency: activityFormData.propertyTaxStartingMonth,
                electricityFrequencyNo: null,
                startingMonthOfElectricityFrequency: null,
                propertyTaxFrequencyNo: null,
                startingMonthOfPropertyTaxFrequency: null,
                waterFrequencyNo: null,
                startingMonthOfWaterFrequency: null
            };
            // Send data to frequency history API
            const response = await axios.post('https://backendaab.in/demoAabuilderDash/api/frequency-history/save', frequencyHistoryData);

            if (response.data) {
                // Store the submitted data for display
                setSubmittedFrequencyData(prev => ({
                    ...prev,
                    [selectedRowData.property.id]: {
                        propertyFrequency: activityFormData.propertyTaxFrequency,
                        propertyStartingMonth: activityFormData.propertyTaxStartingMonth
                    }
                }));

                // Refresh frequency history data to get updated data from database
                const fetchFrequencyHistory = async () => {
                    try {
                        const response = await axios.get('https://backendaab.in/demoAabuilderDash/api/frequency-history/getAll');
                        setFrequencyHistory(response.data || []);
                    } catch (error) {
                        console.error('Error fetching frequency history:', error);
                    }
                };
                fetchFrequencyHistory();

                alert('Property frequency history saved successfully!');
                setShowActivityModal(false);
                setSelectedRowData(null);
                setActivityFormData({
                    propertyTaxFrequency: '',
                    propertyTaxStartingMonth: ''
                });
            }
        } catch (error) {
            console.error('Error saving frequency history:', error);
            alert('Failed to save frequency history. Please try again.');
        }
    };
    // Clear all filters
    const clearFilters = () => {
        setFilters({
            year: '',
            month: '',
            paymentStatus: '',
            vendor: '',
            service: '',
            doorNo: '',
            shop: '',
            projectName: '',
            projectType: '',
            tenant: '',
            occupancyStatus: ''
        });
        setSelectedCategory(''); // Also clear category filter
    };

    return (
        <div className="bg-[#FAF6ED] rounded-lg shadow-sm">
            <div className="bg-white rounded-md mb-5 min-h-[128px] ml-5 mr-5">
                <div className="p-6">
                    {/* 10 filters -> grid of 5 columns naturally renders them as 2 rows */}
                    <div className="grid grid-cols-5 gap-4 text-left">
                        <div>
                            <label className="block font-semibold mb-1">Year</label>
                            <Select
                                options={[
                                    { value: new Date().getFullYear().toString(), label: new Date().getFullYear().toString() },
                                    { value: (new Date().getFullYear() - 1).toString(), label: (new Date().getFullYear() - 1).toString() },
                                    { value: (new Date().getFullYear() - 2).toString(), label: (new Date().getFullYear() - 2).toString() }
                                ]}
                                value={filters.year ? { value: filters.year, label: filters.year } : { value: new Date().getFullYear().toString(), label: new Date().getFullYear().toString() }}
                                onChange={(selectedOption) => handleFilterChange('year', selectedOption)}
                                placeholder="Select Year"
                                isClearable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    ...customSelectStyles,
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                }}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Vendor</label>
                            <Select
                                options={vendorOptions}
                                value={filters.vendor ? { value: filters.vendor, label: filters.vendor } : null}
                                onChange={(selectedOption) => handleFilterChange('vendor', selectedOption)}
                                placeholder="Select Vendor"
                                isClearable
                                isSearchable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    ...customSelectStyles,
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                }}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Month</label>
                            <Select
                                options={monthLabels.map(month => ({ value: month, label: month }))}
                                value={filters.month ? { value: filters.month, label: filters.month } : null}
                                onChange={(selectedOption) => handleFilterChange('month', selectedOption)}
                                placeholder="Select Month"
                                isClearable
                                isSearchable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    ...customSelectStyles,
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                }}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Payment Status</label>
                            <Select
                                options={paymentStatusOptions}
                                value={filters.paymentStatus ? { value: filters.paymentStatus, label: filters.paymentStatus } : null}
                                onChange={(selectedOption) => handleFilterChange('paymentStatus', selectedOption)}
                                placeholder="Select Status"
                                isClearable
                                isSearchable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    ...customSelectStyles,
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                }}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Service</label>
                            <Select
                                options={getUniqueValues('serviceNo')}
                                value={filters.service ? { value: filters.service, label: filters.service } : null}
                                onChange={(selectedOption) => handleFilterChange('service', selectedOption)}
                                placeholder="Select Service No"
                                isClearable
                                isSearchable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    ...customSelectStyles,
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                }}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Door No</label>
                            <Select
                                options={getUniqueValues('doorNo')}
                                value={filters.doorNo ? { value: filters.doorNo, label: filters.doorNo } : null}
                                onChange={(selectedOption) => handleFilterChange('doorNo', selectedOption)}
                                placeholder="Select Door No"
                                isClearable
                                isSearchable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    ...customSelectStyles,
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                }}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Shop</label>
                            <Select
                                options={getUniqueValues('shop')}
                                value={filters.shop ? { value: filters.shop, label: filters.shop } : null}
                                onChange={(selectedOption) => handleFilterChange('shop', selectedOption)}
                                placeholder="Select Shop"
                                isClearable
                                isSearchable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    ...customSelectStyles,
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                }}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Project Name</label>
                            <Select
                                options={getUniqueValues('projectName')}
                                value={filters.projectName ? { value: filters.projectName, label: filters.projectName } : null}
                                onChange={(selectedOption) => handleFilterChange('projectName', selectedOption)}
                                placeholder="Select Project"
                                isClearable
                                isSearchable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    ...customSelectStyles,
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                }}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Project Type</label>
                            <Select
                                options={getUniqueValues('projectType')}
                                value={filters.projectType ? { value: filters.projectType, label: filters.projectType } : null}
                                onChange={(selectedOption) => handleFilterChange('projectType', selectedOption)}
                                placeholder="Select Project Type"
                                isClearable
                                isSearchable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    ...customSelectStyles,
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                }}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Tenant</label>
                            <Select
                                options={tenantOptions}
                                value={filters.tenant ? { value: filters.tenant, label: filters.tenant } : null}
                                onChange={(selectedOption) => handleFilterChange('tenant', selectedOption)}
                                placeholder="Select Tenant"
                                isClearable
                                isSearchable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    ...customSelectStyles,
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                }}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Occupancy Status</label>
                            <Select
                                options={occupancyStatusOptions}
                                value={filters.occupancyStatus ? { value: filters.occupancyStatus, label: occupancyStatusOptions.find(o => o.value === filters.occupancyStatus)?.label || filters.occupancyStatus } : null}
                                onChange={(selectedOption) => handleFilterChange('occupancyStatus', selectedOption)}
                                placeholder="Select Status"
                                isClearable
                                isSearchable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    ...customSelectStyles,
                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                }}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-md ml-5 mr-5 p-6">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSelectedCategory(selectedCategory === 'Client Project' ? '' : 'Client Project')}
                                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${selectedCategory === 'Client Project'
                                    ? 'bg-[#BF9853] text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                Clients Projects
                            </button>
                            <button
                                onClick={() => setSelectedCategory(selectedCategory === 'Own Project' ? '' : 'Own Project')}
                                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${selectedCategory === 'Own Project'
                                    ? 'bg-[#BF9853] text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                Own Projects
                            </button>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-black">
                            <button className="flex items-center font-semibold gap-2 hover:text-blue-600">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                                Export PDF
                            </button>
                            <button className="flex items-center font-semibold gap-2 hover:text-green-600">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Export XL
                            </button>
                            <button className="flex items-center font-semibold gap-2 hover:text-gray-600">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                                </svg>
                                Print
                            </button>
                            <button
                                onClick={() => setShowHideModal(true)}
                                className="px-4 py-2 bg-[#BF9853] text-white rounded-lg font-semibold hover:bg-[#A68B4A] transition-colors"
                            >
                                Hide Items
                            </button>
                        </div>
                    </div>
                    <div className="border-l-8 border-l-[#BF9853] rounded-lg">
                        <div className="overflow-x-auto">
                            <div className="overflow-y-auto h-[480px] min-w-max">
                            <table className="w-full border-collapse table-auto">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-[#FAF6ED]">
                                        <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Sl.No</td>
                                        <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">PID</td>
                                        <td className="px-4 py-2 text-left font-semibold">Project Name</td>
                                        <td className="px-4 py-2 text-left font-semibold"></td>
                                        <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">D.No</td>
                                        <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Property No</td>
                                        <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Jan</td>
                                        <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Feb</td>
                                        <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Mar</td>
                                        <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Apr</td>
                                        <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">May</td>
                                        <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">June</td>
                                        <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">July</td>
                                        <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Aug</td>
                                        <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Sep</td>
                                        <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Oct</td>
                                        <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Nov</td>
                                        <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Dec</td>
                                        <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Unpaid</td>
                                        <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Activity</td>
                                        <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Hide</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="20" className="text-center py-4">
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan="20" className="text-center py-4 text-red-500">
                                                {error}
                                            </td>
                                        </tr>
                                    ) : filteredProjects.length === 0 ? (
                                        <tr>
                                            <td colSpan="20" className="text-center py-4">
                                                No projects found with property tax connections
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProjects.map((project, projectIndex) =>
                                            project.propertyDetails
                                                .filter(property => property.propertyTaxNo && property.propertyTaxNo.trim() !== '')
                                                .map((property, propertyIndex) => {
                                                    const rowIndex = projectIndex * project.propertyDetails.length + propertyIndex;
                                                    return (
                                                        <tr key={`${project.id}-${property.id}`} className="odd:bg-white even:bg-[#FAF6ED]">
                                                            <td className="px-4 py-2">{rowIndex + 1}</td>
                                                            <td className="px-4 py-2">{project.projectId}</td>
                                                            <td className="px-4 py-2 text-left">{project.projectName}</td>
                                                            <td className="px-4 py-2">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${project.projectCategory === 'Client Project'
                                                                    ? 'bg-orange-100 text-orange-800'
                                                                    : project.projectCategory === 'Own Project'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                    {property.projectType || project.projectCategory || '-'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap">{property.doorNo || '-'}</td>
                                                            <td className="px-4 py-2 text-left">{property.propertyTaxNo}</td>
                                                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => {
                                                                const paymentData = getPaymentData(property.propertyTaxNo, month, property.id);
                                                                const isPaid = paymentData.amount !== '-' && paymentData.amount !== '0';
                                                                const isNotRequired = paymentData.isNotRequired;
                                                                return (
                                                                    <td key={month} className="px-4 py-2">
                                                                        <span
                                                                            className={`text-sm font-medium ${isNotRequired
                                                                                ? 'text-gray-400 cursor-default'
                                                                                : isPaid
                                                                                    ? 'text-green-600 hover:text-green-800 cursor-pointer'
                                                                                    : paymentData.amount === '0'
                                                                                        ? 'text-red-600 hover:text-red-800 cursor-pointer'
                                                                                        : 'text-gray-500 cursor-default'
                                                                                }`}
                                                                            title={isNotRequired ? 'No payment required this month' : paymentData.date ? `Date: ${formatDate(paymentData.date)}` : ''}
                                                                            onClick={isNotRequired ? undefined : () => handleFileClick(paymentData)}
                                                                        >
                                                                            {paymentData.amount}
                                                                        </span>
                                                                    </td>
                                                                );
                                                            })}
                                                            <td className="px-4 py-2">
                                                                <span className="text-sm font-medium text-gray-700">
                                                                    {getUnpaidCount(property.propertyTaxNo, property.id)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <button
                                                                    onClick={() => handleActivityEdit(project, property)}
                                                                    className="rounded-full transition duration-200 hover:scale-110 hover:brightness-110"
                                                                >
                                                                    <img
                                                                        src={edit}
                                                                        alt="Edit"
                                                                        className="w-5 h-4 transform hover:scale-110 hover:brightness-110 transition duration-200"
                                                                    />
                                                                </button>
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <button
                                                                    onClick={() => toggleProjectHideStatus(project.id, true)}
                                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                    </svg>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                        )
                                    )}
                                </tbody>
                            </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showHideModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-4/5 max-w-6xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Hide Items</h2>
                            <button
                                onClick={() => setShowHideModal(false)}
                                className="text-red-600 hover:text-red-800"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {hiddenProjects.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No hidden items</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-[#FAF6ED]">
                                            <td className="px-4 py-2 text-left font-semibold">Sl.No</td>
                                            <td className="px-4 py-2 text-left font-semibold">PID</td>
                                            <td className="px-4 py-2 text-left font-semibold">Project Name</td>
                                            <td className="px-4 py-2 text-left font-semibold">D.No</td>
                                            <td className="px-4 py-2 text-left font-semibold">Service No</td>
                                            <td className="px-4 py-2 text-left font-semibold">Unhide</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {hiddenProjects.map((project, projectIndex) =>
                                            project.propertyDetails
                                                .filter(property => property.propertyTaxNo && property.propertyTaxNo.trim() !== '')
                                                .map((property, propertyIndex) => {
                                                    const rowIndex = projectIndex * project.propertyDetails.length + propertyIndex;
                                                    return (
                                                        <tr key={`${project.id}-${property.id}`} className="odd:bg-white even:bg-[#FAF6ED]">
                                                            <td className="px-4 py-2">{rowIndex + 1}</td>
                                                            <td className="px-4 py-2">{project.projectId}</td>
                                                            <td className="px-4 py-2">{project.projectName}</td>
                                                            <td className="px-4 py-2">{property.doorNo || '-'}</td>
                                                            <td className="px-4 py-2">{property.propertyTaxNo}</td>
                                                            <td className="px-4 py-2">
                                                                <button
                                                                    onClick={() => toggleProjectHideStatus(project.id, false)}
                                                                    className="text-red-600 hover:text-red-800"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                                    </svg>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Activity Modal */}
            {showActivityModal && selectedRowData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-[600px]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">Activity Entry</h2>
                            <button
                                onClick={() => {
                                    setShowActivityModal(false);
                                    setSelectedRowData(null);
                                    setActivityFormData({
                                        propertyFrequency: '',
                                        propertyStartingMonth: ''
                                    });
                                }}
                                className="text-red-600 hover:text-red-800"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-3 text-left">
                            <div className="bg-gray-50 flex p-3 w-auto rounded-lg">
                                <div className=' border-r border-gray-300 px-3'>
                                    <h3 className="font-semibold text-gray-700 mb-1">Project Details:</h3>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Project:</span> {selectedRowData.project.projectName}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Service No:</span> {selectedRowData.property.propertyTaxNo}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Door No:</span> {selectedRowData.property.doorNo || '-'}
                                    </p>
                                </div>
                                <div className='pl-5'>
                                     {(() => {
                                         // Get all frequency data for this Service No (property ID)
                                         const propertyId = selectedRowData?.property?.id;
                                         const propertyIdStr = propertyId !== undefined && propertyId !== null ? String(propertyId) : null;
                                         const allFrequencyData = frequencyHistory
                                             .filter((freq) => {
                                                 const freqPropertyId = freq?.projectNamePropertyDetailsId;
                                                 const freqPropertyIdStr =
                                                     freqPropertyId !== undefined && freqPropertyId !== null ? String(freqPropertyId) : null;
                                                 const freqRaw = freq?.propertyTaxFrequencyNo ?? freq?.propertyFrequencyNo;
                                                 const hasFreq = freqRaw !== undefined && freqRaw !== null; // allow 0
                                                 const hasStart = !!(freq?.startingMonthOfPropertyTaxFrequency || freq?.startingMonthOfPropertyFrequency);
                                                 return !!propertyIdStr && freqPropertyIdStr === propertyIdStr && hasFreq && hasStart;
                                             })
                                             .sort((a, b) => {
                                                 const aKey = String(a.startingMonthOfPropertyTaxFrequency || a.startingMonthOfPropertyFrequency || '');
                                                 const bKey = String(b.startingMonthOfPropertyTaxFrequency || b.startingMonthOfPropertyFrequency || '');
                                                 return aKey.localeCompare(bKey);
                                             });

                                         // Add submitted data if available
                                         const submittedData = submittedFrequencyData[selectedRowData.property.id];
                                         if (submittedData?.propertyFrequency && submittedData?.propertyStartingMonth) {
                                             allFrequencyData.push({
                                                 propertyFrequencyNo: submittedData.propertyFrequency,
                                                 startingMonthOfPropertyFrequency: submittedData.propertyStartingMonth
                                             });
                                         }
                                         // Dedupe: backend refresh + optimistic push can show duplicates until reload
                                         const dedupedFrequencyData = Array.from(
                                             new Map(
                                                 allFrequencyData.map((row) => {
                                                     const freqVal = row?.propertyTaxFrequencyNo ?? row?.propertyFrequencyNo;
                                                     const startVal = String(row?.startingMonthOfPropertyTaxFrequency || row?.startingMonthOfPropertyFrequency || '').trim();
                                                     return [`${startVal}__${freqVal}`, row];
                                                 })
                                             ).values()
                                         ).sort((a, b) => {
                                             const aKey = String(a.startingMonthOfPropertyTaxFrequency || a.startingMonthOfPropertyFrequency || '');
                                             const bKey = String(b.startingMonthOfPropertyTaxFrequency || b.startingMonthOfPropertyFrequency || '');
                                             return aKey.localeCompare(bKey);
                                         });

                                         if (allFrequencyData.length > 0) {
    return (
                                                 <div className="mt-2">
                                                     <table className="w-[200px] border-collapse border border-gray-300">
                                                         <thead>
                                                             <tr className="bg-gray-100">
                                                                 <th className="border border-gray-300 px-2 py-1 text-left text-xs font-semibold">Frequency</th>
                                                                 <th className="border border-gray-300 px-2 py-1 text-left text-xs font-semibold">Starting Month</th>
                                                             </tr>
                                                         </thead>
                                                         <tbody>
                                                             {dedupedFrequencyData.map((freqData, index) => (
                                                                 <tr key={index}>
                                                                     <td className="border border-gray-300 px-2 py-1 text-xs">{freqData.propertyTaxFrequencyNo || freqData.propertyFrequencyNo}</td>
                                                                     <td className="border border-gray-300 px-2 py-1 text-xs">{new Date(((freqData.startingMonthOfPropertyTaxFrequency || freqData.startingMonthOfPropertyFrequency)) + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</td>
                                                                 </tr>
                                                             ))}
                                                         </tbody>
                                                     </table>
                                                 </div>
                                             );
                                         }
                                         return null;
                                     })()}
                                </div>
                            </div>
                            <div className='flex gap-4'>
                                <div>
                                    <label className="text-md font-semibold mb-2 block">
                                        Property Tax Frequency <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={activityFormData.propertyTaxFrequency}
                                        onChange={(e) => setActivityFormData(prev => ({
                                            ...prev,
                                            propertyTaxFrequency: e.target.value
                                        }))}
                                        placeholder="Enter property tax frequency"
                                        className="border-2 border-[#BF9853] rounded-lg px-4 py-2 w-[290px] h-[45px] focus:outline-none border-opacity-[0.20]"
                                    />
                                </div>
                                <div>
                                    <label className="text-md font-semibold mb-2 block">
                                        Property Tax Starting Month <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="month"
                                        value={activityFormData.propertyTaxStartingMonth}
                                        onChange={(e) => setActivityFormData(prev => ({
                                            ...prev,
                                            propertyTaxStartingMonth: e.target.value
                                        }))}
                                        className="border-2 border-[#BF9853] rounded-lg px-4 py-2 w-[250px] h-[45px] focus:outline-none border-opacity-[0.20]"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowActivityModal(false);
                                        setSelectedRowData(null);
                                        setActivityFormData({
                                            propertyTaxFrequency: '',
                                            propertyTaxStartingMonth: ''
                                        });
                                    }}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleActivitySubmit}
                                    className="px-4 py-2 bg-[#BF9853] text-white rounded-lg hover:bg-[#A68B4A] transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default PropertyTab;
