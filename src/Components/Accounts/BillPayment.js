import React, { useState, useEffect, useCallback, useRef } from "react";
import Edit from '../Images/Edit.svg'
import Delete from '../Images/Delete.svg'
import Select from 'react-select';
import history from '../Images/History.svg';
import Filter from '../Images/filter (3).png'
import NotesStart from '../Images/notes _start.png';
import NotesEnd from '../Images/notes_end.png';

const BillPayment = ({ username, userRoles = [] }) => {
    const [billPayments, setBillPayments] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [contractorOptions, setContractorOptions] = useState([]);
    const [siteOptions, setSiteOptions] = useState([]);
    const [combinedOptions, setCombinedOptions] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [selectedProjectName, setSelectedProjectName] = useState(null);
    const [selectedContractor, setSelectedContractor] = useState(null);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [popup, setPopup] = useState({ show: false, message: "", type: "", dateStr: "" });
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, item: null });
    // Filter state variables
    const [showFilters, setShowFilters] = useState(false);
    const [selectDate, setSelectDate] = useState('');
    const [selectContractororVendorName, setSelectContractororVendorName] = useState('');
    const [selectProjectName, setSelectProjectName] = useState('');
    const [selectType, setSelectType] = useState('');
    // Sorting state
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc'
    });
    // Click and drag scrolling functionality
    const scrollRef = useRef(null);
    const isDragging = useRef(false);
    const start = useRef({ x: 0, y: 0 });
    const scroll = useRef({ left: 0, top: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const animationFrame = useRef(null);
    const lastMove = useRef({ time: 0, x: 0, y: 0 });
    const handleMouseDown = (e) => {
        if (!scrollRef.current) return;
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
        if (!isDragging.current || !scrollRef.current) return;
        const dx = e.clientX - start.current.x;
        const dy = e.clientY - start.current.y;
        const now = Date.now();
        const dt = now - lastMove.current.time || 16;
        velocity.current = {
            x: (e.clientX - lastMove.current.x) / dt,
            y: (e.clientY - lastMove.current.y) / dt,
        };
        lastMove.current = { time: now, x: e.clientX, y: e.clientY };
        scrollRef.current.scrollLeft = scroll.current.left - dx;
        scrollRef.current.scrollTop = scroll.current.top - dy;
    };
    const handleMouseUp = () => {
        if (!scrollRef.current) return;
        isDragging.current = false;
        scrollRef.current.style.cursor = 'grab';
        scrollRef.current.style.userSelect = '';
        if (Math.abs(velocity.current.x) > 0.5 || Math.abs(velocity.current.y) > 0.5) {
            startMomentum();
        }
    };
    const startMomentum = () => {
        const animate = () => {
            if (!scrollRef.current || !isDragging.current) return;
            velocity.current.x *= 0.95;
            velocity.current.y *= 0.95;
            if (Math.abs(velocity.current.x) < 0.5 && Math.abs(velocity.current.y) < 0.5) {
                cancelMomentum();
                return;
            }
            scrollRef.current.scrollLeft -= velocity.current.x * 16;
            scrollRef.current.scrollTop -= velocity.current.y * 16;
            animationFrame.current = requestAnimationFrame(animate);
        };
        animationFrame.current = requestAnimationFrame(animate);
    };
    const cancelMomentum = () => {
        if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
            animationFrame.current = null;
        }
    };
    // Fetch bill payments data
    const fetchBillPayments = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:8082/api/weekly-payment-bills/all", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                const data = await response.json();
                // Filter only Bill type entries
                const billData = data.filter(item => item.type === "Bill");
                setBillPayments(data);
            } else {
                console.error("Failed to fetch bill payments");
            }
        } catch (error) {
            console.error("Error fetching bill payments:", error);
        }
    }, []);
    // Fetch vendor options
    const fetchVendorOptions = useCallback(async () => {
        try {
            const response = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/getAll", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                const data = await response.json();
                const options = data.map(vendor => ({
                    value: vendor.vendorName,
                    label: vendor.vendorName,
                    id: vendor.id,
                }));
                setVendorOptions(options);
            }
        } catch (error) {
            console.error("Error fetching vendor options:", error);
        }
    }, []);
    // Fetch contractor options
    const fetchContractorOptions = useCallback(async () => {
        try {
            const response = await fetch("https://backendaab.in/aabuilderDash/api/contractor_Names/getAll", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                const data = await response.json();
                const options = data.map(contractor => ({
                    value: contractor.contractorName,
                    label: contractor.contractorName,
                    id: contractor.id,
                }));
                setContractorOptions(options);
            }
        } catch (error) {
            console.error("Error fetching contractor options:", error);
        }
    }, []);
    // Fetch employee options
    const fetchEmployeeOptions = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:8082/api/employee_details/getAll", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                const data = await response.json();
                const options = data.map(employee => ({
                    value: employee.employee_name,
                    label: employee.employee_name,
                    id: employee.id,
                }));
                setEmployeeOptions(options);
            }
        } catch (error) {
            console.error("Error fetching employee options:", error);
        }
    }, []);
    // Fetch project options
    const fetchProjectOptions = useCallback(async () => {
        try {
            const response = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/getAll", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                const data = await response.json();
                const options = data.map(project => ({
                    value: project.siteName,
                    label: project.siteName,
                    id: project.id,
                }));
                setSiteOptions(options);
            }
        } catch (error) {
            console.error("Error fetching project options:", error);
        }
    }, []);

    // Delete bill payment function
    const handleDeleteBillPayment = async (id) => {
        try {
            const response = await fetch(`http://localhost:8082/api/weekly-payment-bills/delete/${id}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            
            if (response.ok) {
                setPopup({
                    show: true,
                    message: "Bill payment deleted successfully!",
                    type: "success",
                    dateStr: ""
                });
                // Refresh the data
                fetchBillPayments();
            } else {
                setPopup({
                    show: true,
                    message: "Failed to delete bill payment. Please try again.",
                    type: "error",
                    dateStr: ""
                });
            }
        } catch (error) {
            console.error("Error deleting bill payment:", error);
            setPopup({
                show: true,
                message: "An error occurred while deleting the bill payment.",
                type: "error",
                dateStr: ""
            });
        }
    };

    // Show delete confirmation
    const showDeleteConfirmation = (item) => {
        setDeleteConfirm({
            show: true,
            id: item.id,
            item: item
        });
    };

    // Confirm delete
    const confirmDelete = () => {
        if (deleteConfirm.id) {
            handleDeleteBillPayment(deleteConfirm.id);
            setDeleteConfirm({ show: false, id: null, item: null });
        }
    };

    // Cancel delete
    const cancelDelete = () => {
        setDeleteConfirm({ show: false, id: null, item: null });
    };

    // Combine vendor and contractor options
    useEffect(() => {
        const combined = [
            ...vendorOptions.map(option => ({ ...option, category: 'Vendor' })),
            ...contractorOptions.map(option => ({ ...option, category: 'Contractor' })),
            ...employeeOptions.map(option => ({ ...option, category: 'Employee' }))
        ];
        setCombinedOptions(combined);
    }, [vendorOptions, contractorOptions, employeeOptions]);
    // Load data on component mount
    useEffect(() => {
        fetchBillPayments();
        fetchVendorOptions();
        fetchContractorOptions();
        fetchEmployeeOptions();
        fetchProjectOptions();
    }, [fetchBillPayments, fetchVendorOptions, fetchContractorOptions, fetchEmployeeOptions, fetchProjectOptions]);
    // Helper functions to get names from IDs
    const getProjectName = (projectId) => {
        const project = siteOptions.find(option => option.id === projectId);
        return project ? project.label : '-';
    };

    const getVendorName = (vendorId) => {
        const vendor = vendorOptions.find(option => option.id === vendorId);
        return vendor ? vendor.label : '-';
    };

    const getContractorName = (contractorId) => {
        const contractor = contractorOptions.find(option => option.id === contractorId);
        return contractor ? contractor.label : '-';
    };

    const getEmployeeName = (employeeId) => {
        const employee = employeeOptions.find(option => option.id === employeeId);
        return employee ? employee.label : '-';
    };

    // Sorting function
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    // Filter function
    const getFilteredData = () => {
        let filtered = billPayments;
        if (selectDate) {
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.date).toISOString().split('T')[0];
                return itemDate === selectDate;
            });
        }
        if (selectContractororVendorName) {
            filtered = filtered.filter(item => {
                const contractorName = getContractorName(item.contractor_id);
                const vendorName = getVendorName(item.vendor_id);
                const employeeName = getEmployeeName(item.employee_id);
                return contractorName === selectContractororVendorName ||
                       vendorName === selectContractororVendorName ||
                       employeeName === selectContractororVendorName;
            });
        }
        if (selectProjectName) {
            filtered = filtered.filter(item => {
                const projectName = getProjectName(item.project_id);
                return projectName === selectProjectName;
            });
        }
        if (selectType) {
            filtered = filtered.filter(item => item.type === selectType);
        }
        // Apply sorting
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aVal, bVal;
                
                // Handle ID-based fields by converting to names for sorting
                switch (sortConfig.key) {
                    case 'project_name':
                        aVal = getProjectName(a.project_id);
                        bVal = getProjectName(b.project_id);
                        break;
                    case 'contractor_name':
                        aVal = getContractorName(a.contractor_id);
                        bVal = getContractorName(b.contractor_id);
                        break;
                    case 'vendor_name':
                        aVal = getVendorName(a.vendor_id);
                        bVal = getVendorName(b.vendor_id);
                        break;
                    case 'employee_name':
                        aVal = getEmployeeName(a.employee_id);
                        bVal = getEmployeeName(b.employee_id);
                        break;
                    default:
                        aVal = a[sortConfig.key];
                        bVal = b[sortConfig.key];
                }
                
                if (aVal < bVal) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aVal > bVal) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return filtered;
    };
    const filteredData = getFilteredData();
    
    // Calculate totals
    const totalAmount = filteredData.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const totalPaid = filteredData.reduce((sum, item) => sum + (parseFloat(item.paid_amount) || 0), 0);
    const totalPending = totalAmount - totalPaid;

    return (
        <div className="bg-[#FAF6ED] min-h-screen">
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Bill Payments</h1>
                    <p className="text-gray-600">Manage and track bill payments</p>
                </div>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                                <p className="text-2xl font-bold text-blue-600">₹{totalAmount.toLocaleString()}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                                <p className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                                <p className="text-2xl font-bold text-orange-600">₹{totalPending.toLocaleString()}</p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-full">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <img src={Filter} alt="Filter" className="w-4 h-4" />
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>
                    </div>
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    value={selectDate}
                                    onChange={(e) => setSelectDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contractor/Vendor/Employee</label>
                                <Select
                                    value={selectContractororVendorName ? { value: selectContractororVendorName, label: selectContractororVendorName } : null}
                                    onChange={(option) => setSelectContractororVendorName(option ? option.value : '')}
                                    options={combinedOptions}
                                    placeholder="Select..."
                                    isClearable
                                    className="basic-single"
                                    classNamePrefix="select"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                                <Select
                                    value={selectProjectName ? { value: selectProjectName, label: selectProjectName } : null}
                                    onChange={(option) => setSelectProjectName(option ? option.value : '')}
                                    options={siteOptions}
                                    placeholder="Select..."
                                    isClearable
                                    className="basic-single"
                                    classNamePrefix="select"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                <input
                                    type="text"
                                    value={selectType}
                                    onChange={(e) => setSelectType(e.target.value)}
                                    placeholder="Enter type..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}
                </div>
                {/* Data Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">Bill Payment Records</h3>
                        <p className="text-sm text-gray-600 mt-1">Showing {filteredData.length} records</p>
                    </div>
                    <div 
                        ref={scrollRef}
                        className="overflow-auto max-h-96 cursor-grab active:cursor-grabbing"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <table className="w-full">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('date')}
                                    >
                                        Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('project_name')}
                                    >
                                        Project {sortConfig.key === 'project_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('contractor_name')}
                                    >
                                        Contractor {sortConfig.key === 'contractor_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('vendor_name')}
                                    >
                                        Vendor {sortConfig.key === 'vendor_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('employee_name')}
                                    >
                                        Employee {sortConfig.key === 'employee_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('type')}
                                    >
                                        Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('amount')}
                                    >
                                        Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('paid_amount')}
                                    >
                                        Paid Amount {sortConfig.key === 'paid_amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('bill_payment_mode')}
                                    >
                                        Payment Mode {sortConfig.key === 'bill_payment_mode' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(item.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {getProjectName(item.project_id)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {getContractorName(item.contractor_id)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {getVendorName(item.vendor_id)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {getEmployeeName(item.employee_id)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ₹{parseFloat(item.amount || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ₹{parseFloat(item.paid_amount || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.bill_payment_mode || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <button
                                                onClick={() => showDeleteConfirmation(item)}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                            >
                                                <img src={Delete} alt="Delete" className="w-4 h-4 mr-1" />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Popup for messages */}
                {popup.show && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white rounded-xl shadow-lg p-6 w-[400px]">
                            <div className="text-center">
                                <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${
                                    popup.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                    {popup.type === 'success' ? (
                                        <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </div>
                                <h3 className={`text-lg font-medium mb-2 ${
                                    popup.type === 'success' ? 'text-green-800' : 'text-red-800'
                                }`}>
                                    {popup.type === 'success' ? 'Success' : 'Error'}
                                </h3>
                                <p className="text-gray-600 mb-4">{popup.message}</p>
                                <button
                                    onClick={() => setPopup({ show: false, message: "", type: "", dateStr: "" })}
                                    className={`w-full px-4 py-2 rounded-lg font-medium ${
                                        popup.type === 'success' 
                                            ? 'bg-green-600 text-white hover:bg-green-700' 
                                            : 'bg-red-600 text-white hover:bg-red-700'
                                    }`}
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Delete Confirmation Dialog */}
                {deleteConfirm.show && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white rounded-xl shadow-lg p-6 w-[400px]">
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 bg-red-100">
                                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Confirm Delete
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Are you sure you want to delete this bill payment? This action cannot be undone.
                                </p>
                                {deleteConfirm.item && (
                                    <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left">
                                        <p className="text-sm text-gray-700">
                                            <strong>Date:</strong> {new Date(deleteConfirm.item.date).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            <strong>Amount:</strong> ₹{parseFloat(deleteConfirm.item.amount || 0).toLocaleString()}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            <strong>Type:</strong> {deleteConfirm.item.type}
                                        </p>
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <button
                                        onClick={cancelDelete}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default BillPayment;