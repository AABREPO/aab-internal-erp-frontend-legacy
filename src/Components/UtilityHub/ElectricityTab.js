import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import edit from '../Images/Edit.svg';

const ElectricityTab = ({ username, userRoles = [] }) => {
    const [filters, setFilters] = useState({
        year: new Date().getFullYear().toString(),
        vendor: '',
        service: '',
        doorNo: '',
        shop: '',
        projectName: '',
        projectType: '',
        tenant: ''
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
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [activityFormData, setActivityFormData] = useState({
        electricityFrequency: '',
        electricityStartingMonth: ''
    });
    const [selectedRowData, setSelectedRowData] = useState(null);
    const [submittedFrequencyData, setSubmittedFrequencyData] = useState({});
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get('https://backendaab.in/aabuilderDash/api/projects/getAll');
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
                const response = await axios.get('https://backendaab.in/aabuilderDash/expenses_form/utility/electricity');
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
                const response = await axios.get('https://backendaab.in/aabuilderDash/api/frequency-history/getAll');
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
                const response = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/getAll", {
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
        const toLower = (value) => (value ? value.toString().toLowerCase() : '');
        const vendorFilter = toLower(filters.vendor);
        const doorFilter = toLower(filters.doorNo);
        const shopFilter = toLower(filters.shop);
        const projectTypeFilter = toLower(filters.projectType);
        const serviceFilter = toLower(filters.service);
        const tenantFilter = toLower(filters.tenant);
        const projectNameFilter = toLower(filters.projectName);

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
                if (tenantFilter) {
                    const tenantValue = toLower(
                        property.tenantName ||
                        property.tenant ||
                        (property.tenantDetails && property.tenantDetails.tenantName)
                    );
                    if (!tenantValue || !tenantValue.includes(tenantFilter)) {
                        return false;
                    }
                }
                if (vendorFilter) {
                    const vendorValue = toLower(
                        property.vendorName ||
                        property.vendor ||
                        project.vendorName ||
                        project.vendor
                    );
                    if (!vendorValue || !vendorValue.includes(vendorFilter)) {
                        return false;
                    }
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
    }, [filters, projects, selectedCategory, electricityPayments]);
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
        const freqData = getFrequencyData(propertyId);
        if (!freqData || !freqData.electricityFrequencyNo || !freqData.startingMonthOfElectricityFrequency) {
            console.log(`No frequency data found for property ${propertyId}, assuming monthly payment`);
            return true; 
        }
        const frequency = parseInt(freqData.electricityFrequencyNo);
        if (frequency === 0) {
            console.log(`Frequency is 0 for property ${propertyId}, no payment required`);
            return false;
        }
        const startingMonth = freqData.startingMonthOfElectricityFrequency;
        const [startYearStr, startMonthStr] = startingMonth.split('-');
        const startYear = parseInt(startYearStr);
        const startMonth = parseInt(startMonthStr);
        const currentMonth = parseInt(month);
        const currentYear = parseInt(year);
        const monthsSinceStart = (currentYear - startYear) * 12 + (currentMonth - startMonth);
        const shouldPay = monthsSinceStart >= 0 && monthsSinceStart % frequency === 0;
        return shouldPay;
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
            return active;
        };
        const freqData = getActiveFrequencyData(propertyId, parseInt(selectedYear), parseInt(monthNumber));
        if (!freqData || !freqData.electricityFrequencyNo || !freqData.startingMonthOfElectricityFrequency) {
            return { amount: '0', date: null };
        }
        const frequency = parseInt(freqData.electricityFrequencyNo);
        if (frequency === 0) {
            return { amount: '-', date: null, isNotRequired: true };
        }        
        const startingMonth = freqData.startingMonthOfElectricityFrequency.trim();
        const [startYear, startMonth] = startingMonth.split('-').map(Number);
        const currentMonth = parseInt(monthNumber);
        const currentYear = parseInt(selectedYear);
        const monthsSinceStart = (currentYear - startYear) * 12 + (currentMonth - startMonth);
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

    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

        const headers = ['Sl.No', 'PID', 'Project Name', 'Category', 'Door No', 'Phase', 'Service No', ...monthLabels, 'Unpaid'];
        const body = rows.map(row => [
            row.slNo,
            row.pid,
            row.projectName,
            row.category,
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
            const response = await axios.put(`https://backendaab.in/aabuilderDash/api/projects/hide/${projectId}`, null, {
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
            const response = await axios.post('https://backendaab.in/aabuilderDash/api/frequency-history/save', frequencyHistoryData);
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
                        const response = await axios.get('https://backendaab.in/aabuilderDash/api/frequency-history/getAll');
                        setFrequencyHistory(response.data || []);
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
    return (
        <div className="bg-[#FAF6ED] rounded-lg shadow-sm">
            <div className="bg-white rounded-md mb-5 h-[128px] ml-5 mr-5">
                <div className="p-6">
                    <div className="flex text-left gap-4">
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
                                styles={customSelectStyles}
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
                                styles={customSelectStyles}
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
                                styles={customSelectStyles}
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
                                styles={customSelectStyles}
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
                                styles={customSelectStyles}
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
                                styles={customSelectStyles}
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
                                styles={customSelectStyles}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Tenant</label>
                            <Select
                                options={[]}
                                value={filters.tenant ? { value: filters.tenant, label: filters.tenant } : null}
                                onChange={(selectedOption) => handleFilterChange('tenant', selectedOption)}
                                placeholder="Select Tenant"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
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
                        <div className="overflow-y-auto h-[480px]">
                            <table className="w-full border-collapse ">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-[#FAF6ED]">
                                        <td className=" px-4 py-2 text-left font-semibold">Sl.No</td>
                                        <td className=" px-4 py-2 text-left font-semibold">PID</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Project Name</td>
                                        <td className=" px-4 py-2 text-left font-semibold"></td>
                                        <td className=" px-4 py-2 text-left font-semibold">D.No</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Phase</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Service No</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Jan</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Feb</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Mar</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Apr</td>
                                        <td className=" px-4 py-2 text-left font-semibold">May</td>
                                        <td className=" px-4 py-2 text-left font-semibold">June</td>
                                        <td className=" px-4 py-2 text-left font-semibold">July</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Aug</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Sep</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Oct</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Nov</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Dec</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Unpaid</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Activity</td>
                                        <td className=" px-4 py-2 text-left font-semibold">Hide</td>
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
                                        filteredProjects.map((project, projectIndex) =>
                                            project.propertyDetails
                                                .filter(property => property.ebNo && property.ebNo.trim() !== '')
                                                .map((property, propertyIndex) => {
                                                    const rowIndex = projectIndex * project.propertyDetails.length + propertyIndex;
                                                    return (
                                                        <tr key={`${project.id}-${property.id}`} className="odd:bg-white even:bg-[#FAF6ED]">
                                                            <td className="px-2 py-2">{rowIndex + 1}</td>
                                                            <td className="px-2 py-2">{project.projectId}</td>
                                                            <td className="px-2 py-2 text-left">{project.projectName}</td>
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
                                                            <td className="px-2 py-2">
                                                                {property.ebNoPhase ? 
                                                                    ` ${property.ebNoPhase.replace('P', '')}` : 
                                                                    '-'
                                                                }
                                                            </td>
                                                            <td className="px-2 py-2 text-left">{property.ebNo}</td>
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
                                        )
                                    )}
                                </tbody>
                            </table>
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
                                        {hiddenProjects.map((project, projectIndex) =>
                                            project.propertyDetails
                                                .filter(property => property.ebNo && property.ebNo.trim() !== '')
                                                .map((property, propertyIndex) => {
                                                    const rowIndex = projectIndex * project.propertyDetails.length + propertyIndex;
                                                    return (
                                                        <tr key={`${project.id}-${property.id}`} className="odd:bg-white even:bg-[#FAF6ED]">
                                                            <td className="px-4 py-2">{rowIndex + 1}</td>
                                                            <td className="px-4 py-2">{project.projectId}</td>
                                                            <td className="px-4 py-2">{project.projectName}</td>
                                                            <td className="px-4 py-2">{property.doorNo || '-'}</td>
                                                            <td className="px-4 py-2">
                                                                {property.ebNoPhase ? 
                                                                    `Phase ${property.ebNoPhase.replace('P', '')}` : 
                                                                    '-'
                                                                }
                                                            </td>
                                                            <td className="px-4 py-2">{property.ebNo}</td>
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
                                         const allFrequencyData = frequencyHistory.filter(freq => 
                                             freq.projectNamePropertyDetailsId === selectedRowData.property.id &&
                                             freq.electricityFrequencyNo &&
                                             freq.startingMonthOfElectricityFrequency
                                         );
                                         const submittedData = submittedFrequencyData[selectedRowData.property.id];
                                         if (submittedData?.electricityFrequency && submittedData?.electricityStartingMonth) {
                                             allFrequencyData.push({
                                                 electricityFrequencyNo: submittedData.electricityFrequency,
                                                 startingMonthOfElectricityFrequency: submittedData.electricityStartingMonth
                                             });
                                         }
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
                                                             {allFrequencyData.map((freqData, index) => (
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