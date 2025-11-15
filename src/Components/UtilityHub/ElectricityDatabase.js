import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ElectricityDatabase = ({ username, userRoles = [] }) => {
    const [electricityData, setElectricityData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        siteName: '',
        vendor: '',
        utilityTypeNumber: '',
        contractor: '',
        paymentMode: ''
    });

    // Fetch electricity expenses data
    useEffect(() => {
        const fetchElectricityData = async () => {
            try {
                const response = await axios.get('https://backendaab.in/aabuilderDash/expenses_form/utility/electricity');
                setElectricityData(response.data || []);
                setFilteredData(response.data || []);
            } catch (error) {
                console.error('Error fetching electricity data:', error);
                setError('Failed to fetch electricity data');
            } finally {
                setLoading(false);
            }
        };

        fetchElectricityData();
    }, []);

    // Apply filters
    useEffect(() => {
        let filtered = electricityData;

        if (filters.siteName) {
            filtered = filtered.filter(item =>
                item.siteName && item.siteName.toLowerCase().includes(filters.siteName.toLowerCase())
            );
        }

        if (filters.vendor) {
            filtered = filtered.filter(item =>
                item.vendor && item.vendor.toLowerCase().includes(filters.vendor.toLowerCase())
            );
        }

        if (filters.utilityTypeNumber) {
            filtered = filtered.filter(item =>
                item.utilityTypeNumber && item.utilityTypeNumber.toLowerCase().includes(filters.utilityTypeNumber.toLowerCase())
            );
        }

        if (filters.contractor) {
            filtered = filtered.filter(item =>
                item.contractor && item.contractor.toLowerCase().includes(filters.contractor.toLowerCase())
            );
        }

        if (filters.paymentMode) {
            filtered = filtered.filter(item =>
                item.paymentMode && item.paymentMode.toLowerCase().includes(filters.paymentMode.toLowerCase())
            );
        }

        setFilteredData(filtered);
    }, [filters, electricityData]);

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '-';

        try {
            const date = new Date(timestamp);
            const formattedDate = date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            const formattedTime = date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            return `${formattedDate} ${formattedTime}`;
        } catch (error) {
            return '-';
        }
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return '-';

        try {
            return new Date(dateValue).toLocaleDateString('en-GB');
        } catch (error) {
            return '-';
        }
    };

    const formatAmountDisplay = (value) => {
        if (value === null || value === undefined || value === '') {
            return '₹0';
        }

        const amountNumber = Number(value);

        if (Number.isFinite(amountNumber)) {
            return `₹${amountNumber.toLocaleString()}`;
        }

        return `₹${value}`;
    };

    const getAmountExportValue = (value) => {
        if (value === null || value === undefined || value === '') {
            return 0;
        }

        const amountNumber = Number(value);

        if (Number.isFinite(amountNumber)) {
            return amountNumber;
        }

        return value;
    };

    const handleExportPDF = () => {
        if (!filteredData.length) return;

        const doc = new jsPDF({ orientation: 'landscape' });
        doc.setFontSize(14);
        doc.text('Electricity Expenses', 14, 20);

        const tableColumn = [
            'Sl.No',
            'Timestamp',
            'Date',
            'Site Name',
            'Vendor',
            'Contractor',
            'Electricity Number',
            'Category',
            'Amount',
            'Payment Mode',
            'For The Month',
            'ENo',
            'Bill Copy'
        ];

        const tableRows = filteredData.map((item, index) => [
            index + 1,
            formatTimestamp(item.timestamp),
            formatDate(item.date),
            item.siteName || '-',
            item.vendor || '-',
            item.contractor || '-',
            item.utilityTypeNumber || '-',
            item.category || '-',
            formatAmountDisplay(item.amount),
            item.paymentMode || '-',
            formatUtilityMonth(item.utilityForTheMonth),
            item.eno || '-',
            item.billCopy ? 'Available' : '-'
        ]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 28,
            styles: {
                fontSize: 8
            },
            headStyles: {
                fillColor: [191, 152, 83]
            }
        });

        doc.save('ElectricityExpenses.pdf');
    };

    const handleExportExcel = () => {
        if (!filteredData.length) return;

        const worksheetData = filteredData.map((item, index) => ({
            'Sl.No': index + 1,
            Timestamp: formatTimestamp(item.timestamp),
            Date: formatDate(item.date),
            'Site Name': item.siteName || '-',
            Vendor: item.vendor || '-',
            Contractor: item.contractor || '-',
            'Electricity Number': item.utilityTypeNumber || '-',
            Category: item.category || '-',
            Amount: getAmountExportValue(item.amount),
            'Payment Mode': item.paymentMode || '-',
            'For The Month': formatUtilityMonth(item.utilityForTheMonth),
            ENo: item.eno || '-',
            'Bill Copy URL': item.billCopy || '-'
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'ElectricityExpenses');
        XLSX.writeFile(workbook, 'ElectricityExpenses.xlsx');
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
        electricityData.forEach(item => {
            if (key === 'siteName' && item.siteName) {
                values.add(item.siteName);
            } else if (key === 'vendor' && item.vendor) {
                values.add(item.vendor);
            } else if (key === 'utilityTypeNumber' && item.utilityTypeNumber) {
                values.add(item.utilityTypeNumber);
            } else if (key === 'contractor' && item.contractor) {
                values.add(item.contractor);
            } else if (key === 'paymentMode' && item.paymentMode) {
                values.add(item.paymentMode);
            }
        });
        return Array.from(values).sort().map(value => ({
            value: value,
            label: value
        }));
    };

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            siteName: '',
            vendor: '',
            utilityTypeNumber: '',
            contractor: '',
            paymentMode: ''
        });
    };

    // Format utility month to readable format
    const formatUtilityMonth = (utilityForTheMonth) => {
        if (!utilityForTheMonth) return '-';
        
        try {
            const [year, month] = utilityForTheMonth.split('-');
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            
            const monthIndex = parseInt(month) - 1;
            if (monthIndex >= 0 && monthIndex < 12) {
                return `${monthNames[monthIndex]} ${year}`;
            }
            return utilityForTheMonth; // Return original if parsing fails
        } catch (error) {
            return utilityForTheMonth; // Return original if parsing fails
        }
    };

    return (
        <div className="bg-[#FAF6ED] rounded-lg shadow-sm">
            {/* Filter Section */}
            <div className="bg-white rounded-md mb-5 h-[128px] ml-5 mr-5">
                <div className="p-6">
                    <div className="flex text-left gap-4">
                        <div>
                            <label className="block font-semibold mb-1">Site Name</label>
                            <Select
                                options={getUniqueValues('siteName')}
                                value={filters.siteName ? { value: filters.siteName, label: filters.siteName } : null}
                                onChange={(selectedOption) => handleFilterChange('siteName', selectedOption ? selectedOption.value : '')}
                                placeholder="Select Site Name"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Vendor</label>
                            <Select
                                options={getUniqueValues('vendor')}
                                value={filters.vendor ? { value: filters.vendor, label: filters.vendor } : null}
                                onChange={(selectedOption) => handleFilterChange('vendor', selectedOption ? selectedOption.value : '')}
                                placeholder="Select Vendor"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Utility Type Number</label>
                            <Select
                                options={getUniqueValues('utilityTypeNumber')}
                                value={filters.utilityTypeNumber ? { value: filters.utilityTypeNumber, label: filters.utilityTypeNumber } : null}
                                onChange={(selectedOption) => handleFilterChange('utilityTypeNumber', selectedOption ? selectedOption.value : '')}
                                placeholder="Select Utility Type Number"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Contractor</label>
                            <Select
                                options={getUniqueValues('contractor')}
                                value={filters.contractor ? { value: filters.contractor, label: filters.contractor } : null}
                                onChange={(selectedOption) => handleFilterChange('contractor', selectedOption ? selectedOption.value : '')}
                                placeholder="Select Contractor"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Payment Mode</label>
                            <Select
                                options={getUniqueValues('paymentMode')}
                                value={filters.paymentMode ? { value: filters.paymentMode, label: filters.paymentMode } : null}
                                onChange={(selectedOption) => handleFilterChange('paymentMode', selectedOption ? selectedOption.value : '')}
                                placeholder="Select Payment Mode"
                                isClearable
                                isSearchable
                                styles={customSelectStyles}
                                className="w-full"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-md ml-5 mr-5 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Electricity Expenses</h3>
                    <div className="flex items-center gap-4 text-sm text-black">
                        <button
                            type="button"
                            onClick={handleExportPDF}
                            disabled={!filteredData.length}
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
                            disabled={!filteredData.length}
                            className="flex items-center font-semibold gap-2 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-current"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Export Excel
                        </button>
                    </div>
                </div>

                <div className="border-l-8 border-l-[#BF9853] rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#FAF6ED]">
                                    <td className="px-4 py-2 text-left font-semibold">Sl.No</td>
                                    <td className="px-4 py-2 text-left font-semibold">Timestamp</td>
                                    <td className="px-4 py-2 text-left font-semibold">Date</td>                                    
                                    <td className="px-4 py-2 text-left font-semibold">Site Name</td>
                                    <td className="px-4 py-2 text-left font-semibold">Vendor</td>
                                    <td className="px-4 py-2 text-left font-semibold">Contractor</td>
                                    <td className="px-4 py-2 text-left font-semibold">Electricity Number</td>
                                    <td className="px-4 py-2 text-left font-semibold">Category</td>
                                    <td className="px-4 py-2 text-left font-semibold">Amount</td>
                                    <td className="px-4 py-2 text-left font-semibold">Payment Mode</td>
                                    <td className="px-4 py-2 text-left font-semibold">For The Month</td>
                                    <td className="px-4 py-2 text-left font-semibold">ENo</td>
                                    <td className="px-4 py-2 text-left font-semibold">Bill Copy</td>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="12" className="text-center py-4">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="12" className="text-center py-4 text-red-500">
                                            {error}
                                        </td>
                                    </tr>
                                ) : filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="12" className="text-center py-4">
                                            No electricity expenses found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((item, index) => (
                                        <tr key={item.id} className="odd:bg-white even:bg-[#FAF6ED]">
                                            <td className="px-4 py-2">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {new Date(item.timestamp).toLocaleDateString('en-GB', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                }) + ' ' + new Date(item.timestamp).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })}
                                            </td>
                                            <td className="px-4 py-2 text-left">
                                                {item.date ? new Date(item.date).toLocaleDateString('en-GB') : '-'}
                                            </td>
                                            <td className="px-4 py-2 text-left">{item.siteName || '-'}</td>
                                            <td className="px-4 py-2 text-left">{item.vendor || '-'}</td>
                                            <td className="px-4 py-2 text-left">{item.contractor || '-'}</td>
                                            <td className="px-4 py-2 text-left font-mono">{item.utilityTypeNumber || '-'}</td>
                                            <td className="px-4 py-2 text-left">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    {item.category || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <span className="font-semibold text-green-600">
                                                    {formatAmountDisplay(item.amount)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {item.paymentMode || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2">{formatUtilityMonth(item.utilityForTheMonth)}</td>                                            
                                            <td className="px-4 py-2">{item.eno || '-'}</td>
                                            <td className="px-4 py-2">
                                                {item.billCopy ? (
                                                    <button
                                                        onClick={() => window.open(item.billCopy, '_blank')}
                                                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                                                    >
                                                        View Bill
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ElectricityDatabase;
