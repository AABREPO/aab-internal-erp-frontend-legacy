import React, { useState, useEffect, useCallback, useRef } from "react";
import Edit from '../Images/Edit.svg'
import Delete from '../Images/Delete.svg'
import Select from 'react-select';
import history from '../Images/History.svg';
import Filter from '../Images/filter (3).png'
import NotesStart from '../Images/notes _start.png';
import NotesEnd from '../Images/notes_end.png';
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from 'xlsx';

const BillPayment = ({ username, userRoles = [] }) => {
    const [billPayments, setBillPayments] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [contractorOptions, setContractorOptions] = useState([]);
    const [siteOptions, setSiteOptions] = useState([]);
    const [combinedOptions, setCombinedOptions] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [purposeOptions, setPurposeOptions] = useState([]);
    const [tenantOptions, setTenantOptions] = useState([]);
    const [tenantShopData, setTenantShopData] = useState([]);
    const [selectedProjectName, setSelectedProjectName] = useState(null);
    const [selectedContractor, setSelectedContractor] = useState(null);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [popup, setPopup] = useState({ show: false, message: "", type: "", dateStr: "" });
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, item: null });
    // Payment popup states
    const [showEditPaymentPopup, setShowEditPaymentPopup] = useState(false);
    const [paymentPopupData, setPaymentPopupData] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: "",
        paymentMode: "",
        chequeNo: "",
        chequeDate: "",
        transactionNumber: "",
        accountNumber: ""
    });
    const [currentBillPaymentRow, setCurrentBillPaymentRow] = useState(null);
    // Filter state variables
    const [showFilters, setShowFilters] = useState(false);
    const [selectDate, setSelectDate] = useState('');
    const [selectContractororVendorName, setSelectContractororVendorName] = useState('');
    const [selectProjectName, setSelectProjectName] = useState('');
    const [selectType, setSelectType] = useState('');
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    // Sorting state - default to ID descending (newest first)
    const [sortConfig, setSortConfig] = useState({
        key: 'id',
        direction: 'desc'
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
            const response = await fetch("https://backendaab.in/aabuildersDash/api/weekly-payment-bills/all", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                const data = await response.json();
                const sortedData = data.sort((a, b) => (b.id || 0) - (a.id || 0));
                setBillPayments(sortedData);
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
            const response = await fetch("https://backendaab.in/aabuildersDash/api/employee_details/getAll", {
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
                const formattedData = data.map(item => ({
                    value: item.siteName,
                    label: item.siteName,
                    id: item.id,
                    sNo: item.siteNo
                }));
                const predefinedSiteOptions = [
                    { value: "Mason Advance", label: "Mason Advance", id: 1, sNo: "1" },
                    { value: "Material Advance", label: "Material Advance", id: 2, sNo: "2" },
                    { value: "Weekly Advance", label: "Weekly Advance", id: 3, sNo: "3" },
                    { value: "Excess Advance", label: "Excess Advance", id: 4, sNo: "4" },
                    { value: "Material Rent", label: "Material Rent", id: 5, sNo: "5" },
                    { value: "Subhash Kumar - Kunnur", label: "Subhash Kumar - Kunnur", id: 6, sNo: "6" },
                    { value: "Summary Bill", label: "Summary Bill", id: 7, sNo: "7" },
                    { value: "Daily Wage", label: "Daily Wage", id: 8, sNo: "8" },
                    { value: "Rent Management Portal", label: "Rent Management Portal", id: 9, sNo: "9" },
                    { value: "Multi-Project Batch", label: "Multi-Project Batch", id: 10, sNo: "10" },
                    { value: "Loan Portal", label: "Loan Portal", id: 11, sNo: "11" },
                ];
                // Combine backend data with predefined options
                const combinedSiteOptions = [...predefinedSiteOptions, ...formattedData];
                setSiteOptions(combinedSiteOptions);
            }
        } catch (error) {
            console.error("Error fetching project options:", error);
        }
    }, []);

    // Fetch purpose options from API
    const fetchPurposeOptions = useCallback(async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/loan-purposes/getAll', {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                const data = await response.json();
                const options = data.map(purpose => ({
                    value: purpose.purpose,
                    label: purpose.purpose,
                    id: purpose.id,
                    type: 'Purpose'
                }));
                setPurposeOptions(options);
            }
        } catch (error) {
            console.error("Error fetching purpose options:", error);
            setPurposeOptions([]);
        }
    }, []);
    // Fetch tenant options from tenant link shop API (like Form.js)
    const fetchTenantOptions = useCallback(async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/tenant_link_shop/getAll', {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                const data = await response.json();
                setTenantShopData(data);

                // Build tenant options from tenant link shop data (unique tenant names)
                const tenantOptionsUnique = data
                    .filter(t => t.tenantName)
                    .map(t => ({
                        label: t.tenantName,
                        value: t.tenantName,
                        id: t.id,
                        tenantId: t.id
                    }))
                    .filter((t, i, arr) => arr.findIndex(x => x.value === t.value) === i);

                setTenantOptions(tenantOptionsUnique);
            }
        } catch (error) {
            console.error("Error fetching tenant options:", error);
            setTenantOptions([]);
            setTenantShopData([]);
        }
    }, []);

    const handleDeleteBillPayment = async (item) => {
        try {
            let successMessage = "Bill payment deleted successfully!";
            let errorMessage = "Failed to delete bill payment. Please try again.";
            let allOperationsSuccessful = true;
            const deleteResponse = await fetch(`https://backendaab.in/aabuildersDash/api/weekly-payment-bills/delete/${item.id}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!deleteResponse.ok) {
                allOperationsSuccessful = false;
                errorMessage = "Failed to delete bill payment. Please try again.";
            }
            if (item.advance_portal_id) {
                const clearResponse = await fetch(`https://backendaab.in/aabuildersDash/api/advance_portal/edit/${item.advance_portal_id}?editedBy=${username}`, {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        project_id: null,
                        contractor_id: null,
                        vendor_id: null,
                        employee_id: null,
                        type: null,
                        amount: null,
                        bill_payment_mode: null,
                        date: item.date,
                        entry_no: item.entry_no,
                        timestamp: item.timestamp
                    })
                });
                if (!clearResponse.ok) {
                    allOperationsSuccessful = false;
                    errorMessage = "Bill payment deleted but failed to clear advance portal data.";
                } else {
                    successMessage = "Bill payment deleted and advance portal data cleared successfully!";
                }
            }
            else if (item.staff_advance_portal_id) {
                const clearResponse = await fetch(`https://backendaab.in/aabuildersDash/api/staff-advance/${item.staff_advance_portal_id}?editedBy=${username}`, {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        project_id: null,
                        contractor_id: null,
                        vendor_id: null,
                        employee_id: null,
                        type: null,
                        amount: null,
                        bill_payment_mode: null,
                        date: item.date,
                        entry_no: item.entry_no,
                        timestamp: item.timestamp
                    })
                });
                if (!clearResponse.ok) {
                    allOperationsSuccessful = false;
                    errorMessage = "Bill payment deleted but failed to clear staff advance data.";
                } else {
                    successMessage = "Bill payment deleted and staff advance data cleared successfully!";
                }
            }
            if (allOperationsSuccessful) {
                setPopup({
                    show: true,
                    message: successMessage,
                    type: "success",
                    dateStr: ""
                });
                fetchBillPayments();
            } else {
                setPopup({
                    show: true,
                    message: errorMessage,
                    type: "error",
                    dateStr: ""
                });
                fetchBillPayments();
            }
        } catch (error) {
            console.error("Error processing bill payment:", error);
            setPopup({
                show: true,
                message: "An error occurred while processing the request.",
                type: "error",
                dateStr: ""
            });
        }
    };
    const showDeleteConfirmation = (item) => {
        setDeleteConfirm({
            show: true,
            id: item.id,
            item: item
        });
    };
    const confirmDelete = () => {
        if (deleteConfirm.item) {
            handleDeleteBillPayment(deleteConfirm.item);
            setDeleteConfirm({ show: false, id: null, item: null });
        }
    };
    const cancelDelete = () => {
        setDeleteConfirm({ show: false, id: null, item: null });
    };
    const showPaymentPopupHandler = (item) => {
        setCurrentBillPaymentRow(item);
        setPaymentPopupData({
            date: new Date().toISOString().split('T')[0],
            amount: item.amount || "",
            paymentMode: item.bill_payment_mode || "",
            chequeNo: item.cheque_number || "",
            chequeDate: item.cheque_date ? new Date(item.cheque_date).toISOString().split('T')[0] : "",
            transactionNumber: item.transaction_number || "",
            accountNumber: item.account_number || ""
        });
        setShowEditPaymentPopup(true);
    };
    useEffect(() => {
        const combined = [
            ...vendorOptions.map(option => ({ ...option, category: 'Vendor' })),
            ...contractorOptions.map(option => ({ ...option, category: 'Contractor' })),
            ...employeeOptions.map(option => ({ ...option, category: 'Employee' })),
            ...tenantOptions.map(option => ({ ...option, category: 'Tenant' }))
        ];
        setCombinedOptions(combined);
    }, [vendorOptions, contractorOptions, employeeOptions, tenantOptions]);
    useEffect(() => {
        fetchBillPayments();
        fetchVendorOptions();
        fetchContractorOptions();
        fetchEmployeeOptions();
        fetchProjectOptions();
        fetchPurposeOptions();
        fetchTenantOptions();
    }, [fetchBillPayments, fetchVendorOptions, fetchContractorOptions, fetchEmployeeOptions, fetchProjectOptions, fetchPurposeOptions, fetchTenantOptions]);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectDate, selectContractororVendorName, selectProjectName, selectType]);
    const getProjectName = (projectId) => {
        const project = siteOptions.find(option => option.id === projectId);
        return project ? project.label : '-';
    };
    // New function to get project name or purpose name
    const getProjectOrPurposeName = (item) => {
        // Check if this is a tenant - if so, show tenant_complex_name directly from the data
        const partyData = getPartyNameAndType(item);
        if (partyData.type === 'Tenant' && item.tenant_complex_name) {
            return item.tenant_complex_name;
        }
        // First try to get project name
        if (item.project_id) {
            const projectName = getProjectName(item.project_id);
            if (projectName !== '-') {
                return projectName;
            }
        }
        // If no project_id or project not found, try to get purpose name
        if (item.purpose_id) {
            const purposeName = getPurposeName(item.purpose_id);
            if (purposeName !== '-') {
                return purposeName;
            }
        }
        return '-';
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
    const getPurposeName = (purposeId) => {
        const purpose = purposeOptions.find(option => option.id === purposeId);
        return purpose ? purpose.label : '-';
    };
    const getTenantName = (tenantId) => {
        // First try to find in tenantOptions
        const tenant = tenantOptions.find(option => option.id === tenantId);
        if (tenant) {
            return tenant.label;
        }
        // Fallback: search in tenantShopData
        const tenantFromLink = tenantShopData.find(t => t.id === tenantId);
        return tenantFromLink ? tenantFromLink.tenantName : '-';
    };
    const getPartyNameAndType = (item) => {
        const contractorName = getContractorName(item.contractor_id);
        const vendorName = getVendorName(item.vendor_id);
        const employeeName = getEmployeeName(item.employee_id);
        const tenantName = getTenantName(item.tenant_id);
        if (contractorName !== '-') {
            return { name: contractorName, type: 'Contractor' };
        } else if (vendorName !== '-') {
            return { name: vendorName, type: 'Vendor' };
        } else if (employeeName !== '-') {
            return { name: employeeName, type: 'Employee' };
        } else if (tenantName !== '-') {
            return { name: tenantName, type: 'Tenant' };
        } else {
            return { name: '-', type: '-' };
        }
    };
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
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
                const partyData = getPartyNameAndType(item);
                return partyData.name === selectContractororVendorName;
            });
        }
        if (selectProjectName) {
            filtered = filtered.filter(item => {
                const projectName = getProjectOrPurposeName(item);
                return projectName === selectProjectName;
            });
        }
        if (selectType) {
            filtered = filtered.filter(item => item.type === selectType);
        }
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aVal, bVal;
                switch (sortConfig.key) {
                    case 'project_name':
                        aVal = getProjectOrPurposeName(a);
                        bVal = getProjectOrPurposeName(b);
                        break;
                    case 'party_name':
                        aVal = getPartyNameAndType(a).name;
                        bVal = getPartyNameAndType(b).name;
                        break;
                    case 'party_type':
                        aVal = getPartyNameAndType(a).type;
                        bVal = getPartyNameAndType(b).type;
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
                    case 'tenant_name':
                        aVal = getTenantName(a.tenant_id);
                        bVal = getTenantName(b.tenant_id);
                        break;
                    case 'date':
                        aVal = new Date(a.date);
                        bVal = new Date(b.date);
                        break;
                    case 'id':
                        aVal = a.id || 0;
                        bVal = b.id || 0;
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
    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredData.slice(startIndex, endIndex);
    // Extract unique type values from the data for dropdown options
    const getUniqueTypes = () => {
        const uniqueTypes = [...new Set(billPayments.map(item => item.type).filter(type => type && type.trim() !== ''))];
        return uniqueTypes.map(type => ({
            value: type,
            label: type
        }));
    };
    const calculatePaymentTotals = () => {
        let upiTotal = 0;
        let netBankingTotal = 0;
        let chequeTotal = 0;
        filteredData.forEach(item => {
            const amount = parseFloat(item.amount) || 0;
            const paymentMode = (item.bill_payment_mode || '').toLowerCase();

            if (paymentMode.includes('upi') || paymentMode.includes('gpay') || paymentMode.includes('phonepe') || paymentMode.includes('google pay')) {
                upiTotal += amount;
            } else if (paymentMode.includes('netbanking') || paymentMode.includes('net banking') || paymentMode.includes('bank transfer')) {
                netBankingTotal += amount;
            } else if (paymentMode.includes('cheque') || paymentMode.includes('check')) {
                chequeTotal += amount;
            }
        });
        return { upiTotal, netBankingTotal, chequeTotal };
    };
    const { upiTotal, netBankingTotal, chequeTotal } = calculatePaymentTotals();
    // Export functions
    const handleExportPDF = () => {
        const doc = new jsPDF('landscape');
        const tableColumn = [
            "S.No",
            "Date",
            "Project",
            "Party Name",
            "Party Type",
            "Type",
            "Amount",
            "Payment Mode",
            "Account No",
            "Cheque No",
            "Cheque Date"
        ];
        const tableRows = filteredData.map((item, index) => [
            index + 1,
            new Date(item.date).toLocaleDateString(),
            getProjectOrPurposeName(item),
            getPartyNameAndType(item).name,
            getPartyNameAndType(item).type,
            item.type,
            `₹${parseFloat(item.amount || 0).toLocaleString()}`,
            item.bill_payment_mode || '-',
            item.account_number || '-',
            item.cheque_number || '-',
            item.cheque_date ? new Date(item.cheque_date).toLocaleDateString() : '-'
        ]);
        doc.setFontSize(12);
        doc.text("Bank Records Report", 14, 10);
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
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

        const fileName = `Bank-Records-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    };

    const handleExportExcel = () => {
        const worksheetData = [
            ["S.No", "Date", "Project", "Party Name", "Party Type", "Type", "Amount", "Payment Mode", "Account No", "Cheque No", "Cheque Date"],
            ...filteredData.map((item, index) => [
                index + 1,
                new Date(item.date).toLocaleDateString(),
                getProjectOrPurposeName(item),
                getPartyNameAndType(item).name,
                getPartyNameAndType(item).type,
                item.type,
                parseFloat(item.amount || 0),
                item.bill_payment_mode || '-',
                item.account_number || '-',
                item.cheque_number || '-',
                item.cheque_date ? new Date(item.cheque_date).toLocaleDateString() : '-'
            ])
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Bank Records");

        const fileName = `Bank-Records-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const tableHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bank Records Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { text-align: center; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; font-weight: bold; }
                    .summary { margin-bottom: 20px; }
                    .summary div { margin: 5px 0; }
                </style>
            </head>
            <body>
                <h1>Bank Records Report</h1>
                <div class="summary">
                    <div><strong>Total UPI Amount:</strong> ₹${upiTotal.toLocaleString()}</div>
                    <div><strong>Total NetBanking Amount:</strong> ₹${netBankingTotal.toLocaleString()}</div>
                    <div><strong>Total Cheque Amount:</strong> ₹${chequeTotal.toLocaleString()}</div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Date</th>
                            <th>Project</th>
                            <th>Party Name</th>
                            <th>Party Type</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Payment Mode</th>
                            <th>Account No</th>
                            <th>Cheque No</th>
                            <th>Cheque Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredData.map((item, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${new Date(item.date).toLocaleDateString()}</td>
                                <td>${getProjectOrPurposeName(item)}</td>
                                <td>${getPartyNameAndType(item).name}</td>
                                <td>${getPartyNameAndType(item).type}</td>
                                <td>${item.type}</td>
                                <td>₹${parseFloat(item.amount || 0).toLocaleString()}</td>
                                <td>${item.bill_payment_mode || '-'}</td>
                                <td>${item.account_number || '-'}</td>
                                <td>${item.cheque_number || '-'}</td>
                                <td>${item.cheque_date ? new Date(item.cheque_date).toLocaleDateString() : '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        printWindow.document.write(tableHTML);
        printWindow.document.close();
        printWindow.print();
    };
    return (
        <body className="bg-[#FAF6ED]">
            <div className="bg-white ml-10 mr-10 min-h-screen">
                <div className="p-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Bank Records</h1>
                        <p className="text-gray-600">Manage and track all Bank records</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total UPI Amount</p>
                                    <p className="text-2xl font-bold text-blue-600">₹{upiTotal.toLocaleString()}</p>
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
                                    <p className="text-sm font-medium text-gray-600">Total NetBanking Amount</p>
                                    <p className="text-2xl font-bold text-green-600">₹{netBankingTotal.toLocaleString()}</p>
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
                                    <p className="text-sm font-medium text-gray-600">Total Cheque Amount</p>
                                    <p className="text-2xl font-bold text-orange-600">₹{chequeTotal.toLocaleString()}</p>
                                </div>
                                <div className="bg-orange-100 p-3 rounded-full">
                                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Party Name</label>
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
                                    <Select
                                        value={selectType ? { value: selectType, label: selectType } : null}
                                        onChange={(option) => setSelectType(option ? option.value : '')}
                                        options={getUniqueTypes()}
                                        placeholder="Select type..."
                                        isClearable
                                        className="basic-single"
                                        classNamePrefix="select"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-md overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Bank Records</h3>
                                <p className="text-sm text-gray-600 mt-1">Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length} records</p>
                            </div>
                            <div className="flex justify-end items-center">
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleExportPDF}
                                        className="text-sm font-medium text-[#E4572E] hover:text-gray-900 focus:outline-none"
                                    >
                                        Export PDF
                                    </button>
                                    <button
                                        onClick={handleExportExcel}
                                        className="text-sm font-medium text-[#007233] hover:text-gray-900 focus:outline-none"
                                    >
                                        Export XL
                                    </button>
                                    <button
                                        onClick={handlePrint}
                                        className="text-sm font-medium text-[#BF9853] hover:text-gray-900 focus:outline-none"
                                    >
                                        Print
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div ref={scrollRef} className="overflow-y-auto overflow-x-auto max-h-96 rounded-lg border-l-8 border-l-[#BF9853] no-scrollbar"
                            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
                        >
                            <table className="w-full min-w-max">
                                <thead className="bg-[#FAF6ED] sticky text-sm top-0">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-semibold  uppercase tracking-wider whitespace-nowrap min-w-[80px]"
                                        >
                                            S.NO
                                        </th>
                                        <th className="px-6 py-3 text-left font-semibold  uppercase tracking-wider whitespace-nowrap min-w-[80px]"
                                        >
                                            TIMESTAMP
                                        </th>
                                        <th className="px-6 py-3 text-left font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap min-w-[100px]"
                                            onClick={() => handleSort('date')}
                                        >
                                            DATE {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-6 py-3 text-left font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap min-w-[200px]"
                                            onClick={() => handleSort('project_name')}
                                        >
                                            PROJECT {sortConfig.key === 'project_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-6 py-3 text-left font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap min-w-[150px]"
                                            onClick={() => handleSort('party_name')}
                                        >
                                            PARTY NAME {sortConfig.key === 'party_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap min-w-[120px]"
                                            onClick={() => handleSort('party_type')}
                                        >
                                            PARTY TYPE {sortConfig.key === 'party_type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap min-w-[100px]"
                                            onClick={() => handleSort('type')}
                                        >
                                            TYPE {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap min-w-[120px]"
                                            onClick={() => handleSort('amount')}
                                        >
                                            AMOUNT {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left font-semibold uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap min-w-[140px]"
                                            onClick={() => handleSort('bill_payment_mode')}
                                        >
                                            PAYMENT MODE {sortConfig.key === 'bill_payment_mode' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-6 py-3 text-left font-semibold uppercase tracking-wider whitespace-nowrap min-w-[140px]">
                                            ACCOUNT NO
                                        </th>
                                        <th className="px-6 py-3 text-left font-semibold uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                                            CHEQUE NO
                                        </th>
                                        <th className="px-6 py-3 text-left font-semibold uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                                            CHEQUE DATE
                                        </th>
                                        <th className="px-6 py-3 text-left font-semibold uppercase tracking-wider whitespace-nowrap min-w-[180px]">
                                            ACTIONS
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentItems.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 odd:bg-white even:bg-[#FAF6ED]">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {startIndex + index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {(() => {
                                                    const date = new Date(item.created_at);
                                                    date.setMinutes(date.getMinutes() + 330);
                                                    return (
                                                        date.toLocaleDateString('en-GB', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric'
                                                        }) +
                                                        ' ' +
                                                        date.toLocaleTimeString('en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            hour12: true
                                                        })
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {new Date(item.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {getProjectOrPurposeName(item)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {getPartyNameAndType(item).name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs rounded-full">
                                                    {getPartyNameAndType(item).type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm ">
                                                ₹{parseFloat(item.amount || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm ">
                                                {item.bill_payment_mode || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {item.account_number || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {item.cheque_number || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {item.cheque_date ? new Date(item.cheque_date).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="">
                                                <div className="flex">
                                                    <button onClick={() => showPaymentPopupHandler(item)} className="inline-flex items-center text-sm font-medium rounded-md text-white  focus:outline-none mr-4">
                                                        <img src={Edit} alt="Edit" className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    <button onClick={() => showDeleteConfirmation(item)} className="inline-flex items-centert text-sm  font-medium rounded-md text-white focus:outline-none">
                                                        <img src={Delete} alt="Delete" className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                    <button className="inline-flex items-center text-sm  font-medium rounded-md text-white focus:outline-none">
                                                        <img src={history} alt="Delete" className="w-4 h-4" />
                                                        History
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-700">Items per page:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span className="text-sm text-gray-700">
                                    Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
                                </span>
                            </div>

                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#BF9853] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#BF9853] ${currentPage === pageNum
                                                ? 'bg-[#BF9853] text-white border-[#BF9853]'
                                                : 'border-gray-300 hover:bg-[#BF9853] hover:text-white'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#BF9853] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                    {popup.show && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <div className="bg-white rounded-xl shadow-lg p-6 w-[400px]">
                                <div className="text-center">
                                    <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4 ${popup.type === 'success' ? 'bg-green-100' : 'bg-red-100'
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
                                    <h3 className={`text-lg font-medium mb-2 ${popup.type === 'success' ? 'text-green-800' : 'text-red-800'
                                        }`}>
                                        {popup.type === 'success' ? 'Success' : 'Error'}
                                    </h3>
                                    <p className="text-gray-600 mb-4">{popup.message}</p>
                                    <button onClick={() => setPopup({ show: false, message: "", type: "", dateStr: "" })}
                                        className={`w-full px-4 py-2 rounded-lg font-medium ${popup.type === 'success'
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
                                        {deleteConfirm.item && (deleteConfirm.item.advance_portal_id || deleteConfirm.item.staff_advance_portal_id)
                                            ? 'Are you sure you want to delete this bill payment? This will delete the record and also clear the corresponding advance portal data (preserving entry number and timestamp). This action cannot be undone.'
                                            : 'Are you sure you want to delete this bill payment? This action cannot be undone.'}
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
                                        <button onClick={cancelDelete}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button onClick={confirmDelete}
                                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {showEditPaymentPopup && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <div className="bg-white text-left rounded-xl p-6 w-[700px] h-[720px] overflow-y-auto">
                                <h3 className="text-lg font-semibold mb-4 text-center">Edit Payment</h3>
                                <div className="space-y-4 mb-4 justify-items-center">
                                    <div className="border-2 border-[#BF9853] border-opacity-25 rounded-lg p-4">
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                                    <input
                                                        type="date"
                                                        value={paymentPopupData.date}
                                                        onChange={(e) => setPaymentPopupData(prev => ({ ...prev, date: e.target.value }))}
                                                        className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                                                    <input
                                                        type="number"
                                                        value={paymentPopupData.amount}
                                                        onChange={(e) => setPaymentPopupData(prev => ({ ...prev, amount: e.target.value }))}
                                                        placeholder="Enter amount"
                                                        className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                                                    <select
                                                        value={paymentPopupData.paymentMode}
                                                        onChange={(e) => setPaymentPopupData(prev => ({ ...prev, paymentMode: e.target.value }))}
                                                        className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                                    >
                                                        <option value="">Select Payment Mode</option>
                                                        <option value="UPI">UPI</option>
                                                        <option value="Net Banking">Net Banking</option>
                                                        <option value="Cheque">Cheque</option>
                                                        <option value="Cash">Cash</option>
                                                    </select>
                                                </div>
                                            </div>
                                            {paymentPopupData.paymentMode === "Cheque" && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Cheque No</label>
                                                        <input
                                                            type="text"
                                                            value={paymentPopupData.chequeNo}
                                                            onChange={(e) => setPaymentPopupData(prev => ({ ...prev, chequeNo: e.target.value }))}
                                                            placeholder="Enter cheque number"
                                                            className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Cheque Date</label>
                                                        <input
                                                            type="date"
                                                            value={paymentPopupData.chequeDate}
                                                            onChange={(e) => setPaymentPopupData(prev => ({ ...prev, chequeDate: e.target.value }))}
                                                            className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Number</label>
                                                    <input
                                                        type="text"
                                                        value={paymentPopupData.transactionNumber}
                                                        onChange={(e) => setPaymentPopupData(prev => ({ ...prev, transactionNumber: e.target.value }))}
                                                        placeholder="Enter transaction number"
                                                        className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                                                    <select
                                                        value={paymentPopupData.accountNumber}
                                                        onChange={(e) => setPaymentPopupData(prev => ({ ...prev, accountNumber: e.target.value }))}
                                                        className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                                    >
                                                        <option value="">Select Account</option>
                                                        <option value="2027887700014">2027887700014</option>
                                                        <option value="2027887700015">2027887700015</option>
                                                        <option value="2027887700016">2027887700016</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        onClick={() => {
                                            setShowEditPaymentPopup(false);
                                            setPaymentPopupData({
                                                date: new Date().toISOString().split('T')[0],
                                                amount: "",
                                                paymentMode: "",
                                                chequeNo: "",
                                                chequeDate: "",
                                                transactionNumber: "",
                                                accountNumber: ""
                                            });
                                            setCurrentBillPaymentRow(null);
                                        }}
                                        className="px-4 py-2 border border-[#BF9853] text-[#BF9853] rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowEditPaymentPopup(false);
                                            setPaymentPopupData({
                                                date: new Date().toISOString().split('T')[0],
                                                amount: "",
                                                paymentMode: "",
                                                chequeNo: "",
                                                chequeDate: "",
                                                transactionNumber: "",
                                                accountNumber: ""
                                            });
                                            setCurrentBillPaymentRow(null);
                                        }}
                                        className="px-4 py-2 bg-[#BF9853] text-white rounded-lg"
                                        disabled={!paymentPopupData.paymentMode || !paymentPopupData.amount}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </body>
    );
};
export default BillPayment;