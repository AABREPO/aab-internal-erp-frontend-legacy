import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import edit from '../Images/Edit.svg';
import ExpenseEntryForm from '../ExpensesEntry/Form';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ElectricityTab = ({ username, userRoles = [] }) => {
    const [showExpenseEntryModal, setShowExpenseEntryModal] = useState(false);
    const [expenseEntryPrefill, setExpenseEntryPrefill] = useState(null);
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
    const [electricityPayments, setElectricityPayments] = useState([]);
    const [frequencyHistory, setFrequencyHistory] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showHideModal, setShowHideModal] = useState(false);
    const [hiddenProjects, setHiddenProjects] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [tenantShopData, setTenantShopData] = useState([]);
    const [tenantOptions, setTenantOptions] = useState([]);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [activityFormData, setActivityFormData] = useState({
        electricityFrequency: '',
        electricityStartingMonth: ''
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
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get('https://backendaab.in/demoAabuilderDash/api/projects/getAll');
                const projectsWithEbNo = response.data.filter(project =>
                    project.propertyDetails &&
                    project.propertyDetails.some(property => property.ebNo && property.ebNo.trim() !== '')
                );
                const visibleProjects = projectsWithEbNo.filter(project => !project.hide);
                const hiddenProjects = projectsWithEbNo.filter(project => project.hide);
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
    useEffect(() => {
        const fetchElectricityPayments = async () => {
            try {
                const response = await axios.get('https://backendaab.in/demoAabuilderDash/expenses_form/utility/electricity');
                setElectricityPayments(response.data || []);
            } catch (error) {
                console.error('Error fetching electricity payments:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchElectricityPayments();
    }, []);
    useEffect(() => {
        const fetchFrequencyHistory = async () => {
            try {
                const response = await axios.get('https://backendaab.in/demoAabuilderDash/api/frequency-history/getAll');
                console.log('[ElectricityTab] frequency-history/getAll response:', response.data);
                setFrequencyHistory(response.data || []);
            } catch (error) {
                console.error('Error fetching frequency history:', error);
            }
        };
        fetchFrequencyHistory();
    }, []);
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
            const ebNo = property?.ebNo;
            if (!ebNo) return false;
            const paymentsForService = electricityPayments.filter(p => p?.utilityTypeNumber === ebNo);
            const scopedPayments = selectedYearMonthForFilters
                ? paymentsForService.filter(p => p?.utilityForTheMonth === selectedYearMonthForFilters)
                : paymentsForService.filter(p => typeof p?.utilityForTheMonth === 'string' && p.utilityForTheMonth.startsWith(`${selectedYearForFilters}-`));
            return scopedPayments.some(p => getPaymentVendorValue(p).includes(vendorFilter));
        };

        // Tenant ↔ Shop link lookup (same source as RentManagement Dashboard)
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
                if (!property || !property.ebNo || !property.ebNo.trim()) {
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
                if (serviceFilter && !toLower(property.ebNo).includes(serviceFilter)) {
                    return false;
                }
                if (!matchesTenantFromLinks(property.id)) return false;
                if (!matchesOccupancyFromLinks(property.id)) return false;
                if (vendorFilter) {
                    // Vendor is stored on each electricity payment record (expenses_form API),
                    // so filter by matching payments for this EB No (optionally scoped to selected month/year).
                    if (!propertyMatchesVendorFromPayments(property)) {
                        return false;
                    }
                }

                if (!matchesPaymentFilters(property)) {
                    return false;
                }

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
    }, [filters, projects, selectedCategory, electricityPayments, frequencyHistory]);
    const handleFilterChange = (filterType, selectedOption) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: selectedOption ? selectedOption.value : ''
        }));
    };
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
                    if (property.ebNo) values.add(property.ebNo);
                });
            }
        });
        return Array.from(values).sort().map(value => ({
            value: value,
            label: value
        }));
    };
    const getFrequencyData = (propertyId) => {
        console.log('Looking for frequency data for property ID:', propertyId);
        console.log('Available frequency history:', frequencyHistory);
        const found = frequencyHistory.find(freq => freq.projectNamePropertyDetailsId === propertyId);
        console.log('Found frequency data:', found);
        return found;
    };
    const shouldPayInMonth = (propertyId, month, year) => {
        if (!propertyId) return true;
        if (!frequencyHistory || frequencyHistory.length === 0) return true;

        const records = frequencyHistory.filter(
            (f) => f.projectNamePropertyDetailsId === propertyId && f.startingMonthOfElectricityFrequency
        );
        if (records.length === 0) return true;

        const currentYear = parseInt(year, 10);
        const currentMonth = parseInt(month, 10);
        if (Number.isNaN(currentYear) || Number.isNaN(currentMonth)) return true;

        const currentVal = currentYear * 12 + currentMonth;
        const sorted = records.slice().sort((a, b) => {
            const [aY, aM] = a.startingMonthOfElectricityFrequency.split('-').map(Number);
            const [bY, bM] = b.startingMonthOfElectricityFrequency.split('-').map(Number);
            return aY * 12 + aM - (bY * 12 + bM);
        });

        let active = null;
        for (const rec of sorted) {
            const [rY, rM] = rec.startingMonthOfElectricityFrequency.split('-').map(Number);
            const recVal = rY * 12 + rM;
            if (recVal <= currentVal) active = rec;
            else break;
        }
        const activeFreqMissing = active?.electricityFrequencyNo === undefined || active?.electricityFrequencyNo === null;
        if (!active || activeFreqMissing || !active.startingMonthOfElectricityFrequency) return true;

        const frequency = parseInt(active.electricityFrequencyNo, 10);
        if (Number.isNaN(frequency)) return true;

        // If frequency is 0 from its starting month, we should show "-" from that month onwards.
        if (frequency === 0) {
            return false;
        }

        const [startYear, startMonth] = active.startingMonthOfElectricityFrequency.split('-').map(Number);
        const monthsSinceStart = (currentYear - startYear) * 12 + (currentMonth - startMonth);
        if (monthsSinceStart >= 0) {
            console.log(
                `[ElectricityTab] property=${propertyId} month=${month}/${year} activeFrequency=${frequency} start=${active.startingMonthOfElectricityFrequency} monthsSinceStart=${monthsSinceStart}`
            );
        }
        return monthsSinceStart >= 0 && monthsSinceStart % frequency === 0;
    };
    const getPaymentData = (ebNo, month, propertyId) => {
        const selectedYear = filters.year || new Date().getFullYear().toString();
        const monthMap = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
            'May': '05', 'June': '06', 'July': '07', 'Aug': '08',
            'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        };
        const monthNumber = monthMap[month];
        if (!monthNumber) return { amount: '-', date: null };
        const yearMonth = `${selectedYear}-${monthNumber}`;
        const getActiveFrequencyData = (propertyId, year, monthNumber) => {
            if (!frequencyHistory || frequencyHistory.length === 0) return null;
            const records = frequencyHistory.filter(
                f => f.projectNamePropertyDetailsId === propertyId && f.startingMonthOfElectricityFrequency
            );
            if (records.length === 0) return null;
            const currentVal = year * 12 + parseInt(monthNumber);
            const sorted = records.sort((a, b) => {
                const [aY, aM] = a.startingMonthOfElectricityFrequency.split('-').map(Number);
                const [bY, bM] = b.startingMonthOfElectricityFrequency.split('-').map(Number);
                return aY * 12 + aM - (bY * 12 + bM);
            });
            let active = sorted[0];
            for (const rec of sorted) {
                const [rY, rM] = rec.startingMonthOfElectricityFrequency.split('-').map(Number);
                const recVal = rY * 12 + rM;
                if (recVal <= currentVal) {
                    active = rec;
                } else {
                    break;
                }
            }
            if (propertyId === 80) {
                console.log('[ElectricityTab] propertyId=80 frequency records(sorted):', sorted);
                console.log('[ElectricityTab] propertyId=80 selected active frequency:', active, 'for', `${year}-${monthNumber}`);
            }
            return active;
        };
        const freqData = getActiveFrequencyData(propertyId, parseInt(selectedYear), parseInt(monthNumber));
        const freqMissing = freqData?.electricityFrequencyNo === undefined || freqData?.electricityFrequencyNo === null;
        if (!freqData || freqMissing || !freqData.startingMonthOfElectricityFrequency) {
            const payment = electricityPayments.find(p =>
                p.utilityTypeNumber === ebNo &&
                p.utilityForTheMonth === yearMonth
            );
            if (payment) {
                return {
                    amount: payment.amount || '0',
                    date: payment.date || null,
                    billCopyUrl: payment.billCopyUrl || payment.billCopy || payment.fileUrl || null
                };
            }
            return { amount: '0', date: null };
        }
        const frequency = parseInt(freqData.electricityFrequencyNo, 10);
        const startingMonth = freqData.startingMonthOfElectricityFrequency.trim();
        const [startYear, startMonth] = startingMonth.split('-').map(Number);
        const currentMonth = parseInt(monthNumber);
        const currentYear = parseInt(selectedYear);
        const monthsSinceStart = (currentYear - startYear) * 12 + (currentMonth - startMonth);
        // Frequency 0 means: from starting month onwards, ignore even existing "0" payments and show "-"
        if (frequency === 0 && monthsSinceStart >= 0) {
            console.log(
                `[ElectricityTab] getPaymentData: property=${propertyId} ebNo=${ebNo} ym=${yearMonth} frequency=0 start=${startingMonth} -> "-" (override payments)`
            );
            return { amount: '-', date: null, isNotRequired: true };
        }

        const payment = electricityPayments.find(p =>
            p.utilityTypeNumber === ebNo &&
            p.utilityForTheMonth === yearMonth
        );
        if (payment) {
            return {
                amount: payment.amount || '0',
                date: payment.date || null,
                billCopyUrl: payment.billCopyUrl || payment.billCopy || payment.fileUrl || null
            };
        }

        const shouldPay = monthsSinceStart >= 0 && monthsSinceStart % frequency === 0;
        
        if (shouldPay) {
            return { amount: '0', date: null }; 
        } else {
            return { amount: '-', date: null, isNotRequired: true }; 
        }
    };
    const getUnpaidCount = (ebNo, propertyId) => {
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
            if (shouldPayInMonth(propertyId, monthNumber, selectedYear)) {
                const yearMonth = `${selectedYear}-${monthNumber}`;
                const payment = electricityPayments.find(p =>
                    p.utilityTypeNumber === ebNo &&
                    p.utilityForTheMonth === yearMonth
                );
                if (!payment) {
                    unpaidCount++;
                }
            }
        });
        return unpaidCount;
    };
    const matchesPaymentFilters = (property) => {
        const selectedMonth = filters.month;
        const selectedStatus = filters.paymentStatus;

        if (!selectedMonth && !selectedStatus) {
            return true;
        }

        const evaluateMonth = (month) => {
            const paymentData = getPaymentData(property.ebNo, month, property.id);
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

    const buildExportRows = () => {
        const rows = [];
        let rowNumber = 0;

        filteredProjects.forEach(project => {
            const properties = Array.isArray(project.propertyDetails) ? project.propertyDetails : [];

            properties
                .filter(property => property.ebNo && property.ebNo.trim() !== '')
                .forEach(property => {
                    rowNumber += 1;
                    const row = {
                        slNo: rowNumber,
                        pid: project.projectId || '-',
                        projectName: project.projectName || '-',
                        category: property.projectType || project.projectCategory || '-',
                        shopNo: property.shopNo || '-',
                        doorNo: property.doorNo || '-',
                        phase: property.ebNoPhase ? `Phase ${property.ebNoPhase.replace('P', '')}` : '-',
                        serviceNo: property.ebNo || '-'
                    };

                    monthLabels.forEach(month => {
                        const paymentData = getPaymentData(property.ebNo, month, property.id);
                        row[month] = paymentData && paymentData.amount !== undefined ? paymentData.amount : '-';
                    });

                    row.unpaid = getUnpaidCount(property.ebNo, property.id);
                    rows.push(row);
                });
        });

        return rows;
    };

    const handleExportPDF = () => {
        const rows = buildExportRows();
        if (!rows.length) return;

        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(14);
        doc.text('Electricity Projects Overview', 14, 20);

        const headers = ['Sl.No', 'PID', 'Project Name', 'Category', 'Shop No', 'Door No', 'Phase', 'Service No', ...monthLabels, 'Unpaid'];
        const body = rows.map(row => [
            row.slNo,
            row.pid,
            row.projectName,
            row.category,
            row.shopNo,
            row.doorNo,
            row.phase,
            row.serviceNo,
            ...monthLabels.map(month => row[month]),
            row.unpaid
        ]);

        doc.autoTable({
            head: [headers],
            body,
            startY: 28,
            styles: {
                fontSize: 7,
                cellPadding: 2
            },
            headStyles: {
                fillColor: [191, 152, 83]
            },
            margin: {
                left: 10,
                right: 10
            }
        });

        doc.save('ElectricityProjects.pdf');
    };

    const handleExportExcel = () => {
        const rows = buildExportRows();
        if (!rows.length) return;

        const worksheetData = rows.map(row => {
            const base = {
                'Sl.No': row.slNo,
                PID: row.pid,
                'Project Name': row.projectName,
                Category: row.category,
                'Door No': row.doorNo,
                'Phase': row.phase,
                'Service No': row.serviceNo
            };

            monthLabels.forEach(month => {
                base[month] = row[month];
            });

            base['Unpaid'] = row.unpaid;
            return base;
        });

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'ElectricityProjects');
        XLSX.writeFile(workbook, 'ElectricityProjects.xlsx');
    };

    const hasExportableData = filteredProjects.some(project =>
        Array.isArray(project.propertyDetails) &&
        project.propertyDetails.some(property => property.ebNo && property.ebNo.trim() !== '')
    );
    const toggleProjectHideStatus = async (projectId, isHide) => {
        try {
            const response = await axios.put(`https://backendaab.in/demoAabuilderDash/api/projects/hide/${projectId}`, null, {
                params: { isHide }
            });
            if (response.data) {
                if (isHide) {
                    const projectToHide = projects.find(p => p.id === projectId);
                    if (projectToHide) {
                        setProjects(prev => prev.filter(p => p.id !== projectId));
                        setHiddenProjects(prev => [...prev, { ...projectToHide, hide: true }]);
                    }
                } else {
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
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };
    const handleFileClick = (fileData) => {
        if (fileData && fileData.billCopyUrl) {
            window.open(fileData.billCopyUrl, '_blank');
        } else if (fileData) {
            alert('No file attached for this payment');
        }
    };
    const handleActivityEdit = (project, property) => {
        setSelectedRowData({ project, property });
        setActivityFormData({
            electricityFrequency: '',
            electricityStartingMonth: ''
        });
        setShowActivityModal(true);
    };
    const handleActivitySubmit = async () => {
        if (!activityFormData.electricityFrequency.trim() || !activityFormData.electricityStartingMonth) {
            alert('Please fill in all required fields');
            return;
        }
        try {
            const frequencyHistoryData = {
                projectNamePropertyDetailsId: selectedRowData.property.id, 
                electricityFrequencyNo: parseInt(activityFormData.electricityFrequency),
                startingMonthOfElectricityFrequency: activityFormData.electricityStartingMonth,
                propertyFrequencyNo: null, 
                startingMonthOfPropertyFrequency: null,
                waterFrequencyNo: null, 
                startingMonthOfWaterFrequency: null 
            };
            const response = await axios.post('https://backendaab.in/demoAabuilderDash/api/frequency-history/save', frequencyHistoryData);
            if (response.data) {
                setSubmittedFrequencyData(prev => ({
                    ...prev,
                    [selectedRowData.property.id]: {
                        electricityFrequency: activityFormData.electricityFrequency,
                        electricityStartingMonth: activityFormData.electricityStartingMonth
                    }
                }));
                const fetchFrequencyHistory = async () => {
                    try {
                        const response = await axios.get('https://backendaab.in/demoAabuilderDash/api/frequency-history/getAll');
                        setFrequencyHistory(response.data || []);
                        console.log(response.data);
                    } catch (error) {
                        console.error('Error fetching frequency history:', error);
                    }
                };
                fetchFrequencyHistory();
                alert('Electricity frequency history saved successfully!');
                setShowActivityModal(false);
                setSelectedRowData(null);
                setActivityFormData({
                    electricityFrequency: '',
                    electricityStartingMonth: ''
                });
            }
        } catch (error) {
            console.error('Error saving frequency history:', error);
            alert('Failed to save frequency history. Please try again.');
        }
    };

    const handleOpenExpenseEntryPopup = ({ ebNo, project, property }) => {
        const prefillData = {
            utilityType: 'Electricity',
            siteName: project?.projectName || project?.siteName || '',
            projectId: project?.id || project?.projectId || null,
            propertyId: property?.id || null,
            utilityIdentifier: { key: 'ebNo', value: ebNo },
            ebNo
        };
        localStorage.setItem('expenseEntryPrefill', JSON.stringify(prefillData));
        setExpenseEntryPrefill(prefillData);
        setShowExpenseEntryModal(true);
    };
    return (
        <div className="bg-[#FAF6ED] rounded-lg shadow-sm">
            {showExpenseEntryModal ? (
                <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg w-full max-w-[1824px] max-h-[92vh] overflow-y-auto shadow-lg relative">
                        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                            <p className="text-sm font-semibold text-[#202020]">Expense Entry</p>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowExpenseEntryModal(false);
                                    setExpenseEntryPrefill(null);
                                    localStorage.removeItem('expenseEntryPrefill');
                                }}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 text-xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-3">
                            <ExpenseEntryForm
                                username={username}
                                userRoles={userRoles}
                                embedded
                                onSuccess={async () => {
                                    setShowExpenseEntryModal(false);
                                    setExpenseEntryPrefill(null);
                                    localStorage.removeItem('expenseEntryPrefill');
                                    try {
                                        const response = await axios.get('https://backendaab.in/demoAabuilderDash/expenses_form/utility/electricity');
                                        setElectricityPayments(response.data || []);
                                    } catch {
                                        // ignore refresh errors
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            ) : null}
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
                            <button onClick={() => setSelectedCategory(selectedCategory === 'Client Project' ? '' : 'Client Project')}
                                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${selectedCategory === 'Client Project'
                                    ? 'bg-[#BF9853] text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                Clients Projects
                            </button>
                            <button onClick={() => setSelectedCategory(selectedCategory === 'Own Project' ? '' : 'Own Project')}
                                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${selectedCategory === 'Own Project'
                                    ? 'bg-[#BF9853] text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                Own Projects
                            </button>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-black">
                            <button
                                type="button"
                                onClick={handleExportPDF}
                                disabled={loading || !hasExportableData}
                                className="flex items-center font-semibold gap-2 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-current"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                                Export PDF
                            </button>
                            <button
                                type="button"
                                onClick={handleExportExcel}
                                disabled={loading || !hasExportableData}
                                className="flex items-center font-semibold gap-2 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-current"
                            >
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
                            <button onClick={() => setShowHideModal(true)}
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
                                        <td className="px-4 py-2 text-left font-semibold whitespace-nowrap"></td>
                                        <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">D.No</td>
                                        <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Shop No</td>
                                        <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Phase</td>
                                        <td className="px-4 py-2 text-left font-semibold whitespace-nowrap">Service No</td>
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
                                                No projects found with electricity connections
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProjects
                                            .flatMap(project =>
                                                project.propertyDetails
                                                    .filter(property => property.ebNo && property.ebNo.trim() !== '')
                                                    .map(property => ({ project, property }))
                                            )
                                            .map(({ project, property }, index) => {
                                                return (
                                                        <tr key={`${project.id}-${property.id}`} className="odd:bg-white even:bg-[#FAF6ED]">
                                                            <td className="px-2 py-2">{index + 1}</td>
                                                            <td className="px-2 py-2">{project.projectId}</td>
                                                            <td className="px-2 py-2 text-left whitespace-normal break-words max-w-[220px]">
                                                                {project.projectName}
                                                            </td>
                                                            <td className="px-2 py-2">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${project.projectCategory === 'Client Project'
                                                                    ? 'bg-orange-100 text-orange-800'
                                                                    : project.projectCategory === 'Own Project'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                    {property.projectType || project.projectCategory || '-'}
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-2">{property.doorNo || '-'}</td>
                                                            <td className="px-2 py-2">{property.shopNo || '-'}</td>
                                                            <td className="px-2 py-2">
                                                                {property.ebNoPhase ? 
                                                                    ` ${property.ebNoPhase.replace('P', '')}` : 
                                                                    '-'
                                                                }
                                                            </td>
                                                            <td
                                                                className="px-2 py-2 text-left text-sm font-semibold text-black cursor-pointer hover:text-[#BF9853] hover:underline"
                                                                onClick={() =>
                                                                    handleOpenExpenseEntryPopup({
                                                                        ebNo: property.ebNo,
                                                                        project,
                                                                        property
                                                                    })
                                                                }
                                                            >
                                                                {property.ebNo}
                                                            </td>
                                                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => {
                                                                const paymentData = getPaymentData(property.ebNo, month, property.id);
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
                                                            <td className="px-2 py-2">
                                                                <span className="text-sm font-medium text-gray-700">
                                                                    {getUnpaidCount(property.ebNo, property.id)}
                                                                </span>
                                                            </td>
                                                            <td className="px-2 py-2">
                                                                <button onClick={() => handleActivityEdit(project, property)}
                                                                    className="rounded-full transition duration-200 hover:scale-110 hover:brightness-110"
                                                                >
                                                                    <img
                                                                        src={edit}
                                                                        alt="Edit"
                                                                        className="w-5 h-4 transform hover:scale-110 hover:brightness-110 transition duration-200"
                                                                    />
                                                                </button>
                                                            </td>
                                                            <td className="px-2 py-2">
                                                                <button onClick={() => toggleProjectHideStatus(project.id, true)} className="text-red-600 hover:text-red-800 text-sm" >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
                                            <td className="px-4 py-2 text-left font-semibold">Phase</td>
                                            <td className="px-4 py-2 text-left font-semibold">Service No</td>
                                            <td className="px-4 py-2 text-left font-semibold">Unhide</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {hiddenProjects
                                            .flatMap(project =>
                                                project.propertyDetails
                                                    .filter(property => property.ebNo && property.ebNo.trim() !== '')
                                                    .map(property => ({ project, property }))
                                            )
                                            .map(({ project, property }, index) => {
                                                    return (
                                                        <tr key={`${project.id}-${property.id}`} className="odd:bg-white even:bg-[#FAF6ED]">
                                                            <td className="px-4 py-2">{index + 1}</td>
                                                            <td className="px-4 py-2">{project.projectId}</td>
                                                            <td className="px-4 py-2 whitespace-normal break-words max-w-[220px]">
                                                                {project.projectName}
                                                            </td>
                                                            <td className="px-4 py-2">{property.doorNo || '-'}</td>
                                                            <td className="px-4 py-2">
                                                                {property.ebNoPhase ? 
                                                                    `Phase ${property.ebNoPhase.replace('P', '')}` : 
                                                                    '-'
                                                                }
                                                            </td>
                                                            <td
                                                                className="px-4 py-2 text-sm font-semibold text-black cursor-pointer hover:text-[#BF9853] hover:underline"
                                                                onClick={() =>
                                                                    handleOpenExpenseEntryPopup({
                                                                        ebNo: property.ebNo,
                                                                        project,
                                                                        property
                                                                    })
                                                                }
                                                            >
                                                                {property.ebNo}
                                                            </td>
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
                                                })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
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
                                        electricityFrequency: '',
                                        electricityStartingMonth: ''
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
                                        <span className="font-medium">Service No:</span> {selectedRowData.property.ebNo}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Door No:</span> {selectedRowData.property.doorNo || '-'}
                                    </p>
                                </div>
                                <div className='pl-5'>
                                     {(() => {
                                         const propertyId = selectedRowData?.property?.id;
                                         const propertyIdStr = propertyId !== undefined && propertyId !== null ? String(propertyId) : null;
                                         const allFrequencyData = frequencyHistory
                                             .filter((freq) => {
                                                 const freqPropertyId = freq?.projectNamePropertyDetailsId;
                                                 const freqPropertyIdStr =
                                                     freqPropertyId !== undefined && freqPropertyId !== null ? String(freqPropertyId) : null;
                                                 // NOTE: electricityFrequencyNo can be 0 — still valid and should show in history.
                                                 const hasFreq = freq?.electricityFrequencyNo !== undefined && freq?.electricityFrequencyNo !== null;
                                                 const hasStart = !!freq?.startingMonthOfElectricityFrequency;
                                                 return !!propertyIdStr && freqPropertyIdStr === propertyIdStr && hasFreq && hasStart;
                                             })
                                             .sort((a, b) => {
                                                 const aKey = String(a.startingMonthOfElectricityFrequency || '');
                                                 const bKey = String(b.startingMonthOfElectricityFrequency || '');
                                                 return aKey.localeCompare(bKey);
                                             });
                                         const submittedData = submittedFrequencyData[selectedRowData.property.id];
                                         if (submittedData?.electricityFrequency && submittedData?.electricityStartingMonth) {
                                             allFrequencyData.push({
                                                 electricityFrequencyNo: submittedData.electricityFrequency,
                                                 startingMonthOfElectricityFrequency: submittedData.electricityStartingMonth
                                             });
                                         }
                                         // Dedupe: backend refresh + optimistic push can show duplicates until reload
                                         const dedupedFrequencyData = Array.from(
                                             new Map(
                                                 allFrequencyData.map((row) => {
                                                     const freqVal = row?.electricityFrequencyNo;
                                                     const startVal = String(row?.startingMonthOfElectricityFrequency || '').trim();
                                                     return [`${startVal}__${freqVal}`, row];
                                                 })
                                             ).values()
                                         ).sort((a, b) => {
                                             const aKey = String(a.startingMonthOfElectricityFrequency || '');
                                             const bKey = String(b.startingMonthOfElectricityFrequency || '');
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
                                                                     <td className="border border-gray-300 px-2 py-1 text-xs">{freqData.electricityFrequencyNo}</td>
                                                                     <td className="border border-gray-300 px-2 py-1 text-xs">{new Date(freqData.startingMonthOfElectricityFrequency + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</td>
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
                                        Electricity Frequency <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={activityFormData.electricityFrequency}
                                        onChange={(e) => setActivityFormData(prev => ({
                                            ...prev,
                                            electricityFrequency: e.target.value
                                        }))}
                                        placeholder="Enter electricity frequency"
                                        className="border-2 border-[#BF9853] rounded-lg px-4 py-2 w-[290px] h-[45px] focus:outline-none border-opacity-[0.20]"
                                    />
                                </div>
                                <div>
                                    <label className="text-md font-semibold mb-2 block">
                                        Electricity Starting Month <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="month"
                                        value={activityFormData.electricityStartingMonth}
                                        onChange={(e) => setActivityFormData(prev => ({
                                            ...prev,
                                            electricityStartingMonth: e.target.value
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
                                            electricityFrequency: '',
                                            electricityStartingMonth: ''
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
export default ElectricityTab;
