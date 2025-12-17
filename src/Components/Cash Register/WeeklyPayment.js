import React, { useState, useEffect, useCallback, useRef } from "react";
import Edit from '../Images/Edit.svg'
import Delete from '../Images/Delete.svg'
import Select from 'react-select';
import history from '../Images/History.svg';
import Filter from '../Images/filter (3).png'
import NotesStart from '../Images/notes _start.png';
import NotesEnd from '../Images/notes_end.png';
import fileUpload from '../Images/file_upload.png';
import download from '../Images/file_download.png'
import file from '../Images/file.png';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Change from '../Images/dropdownchange.png';

// Helper function to clean URL by removing surrounding quotes and parsing JSON if needed
function cleanUrl(url) {
    if (!url) return url;
    let cleanedUrl = url.replace(/^["']|["']$/g, '');
    if (cleanedUrl.includes('{') && cleanedUrl.includes('billCopyUrl')) {
        try {
            const parsed = JSON.parse(cleanedUrl);
            if (parsed.billCopyUrl) {
                return parsed.billCopyUrl;
            }
        } catch (e) {
            console.warn('Failed to parse URL as JSON:', cleanedUrl);
        }
    }
    return cleanedUrl;
}
function getStartAndEndDateOfISOWeek(weekNo, year) {
    const simple = new Date(year, 0, 1 + (weekNo - 1) * 7);
    let dayOfWeek = simple.getDay();
    if (dayOfWeek === 0) {
        dayOfWeek = 7;
    }
    const ISOweekStart = new Date(simple);
    ISOweekStart.setDate(simple.getDate() - dayOfWeek + 1);
    const ISOweekEnd = new Date(ISOweekStart);
    ISOweekEnd.setDate(ISOweekStart.getDate() + 6);
    ISOweekStart.setHours(0, 0, 0, 0);
    ISOweekEnd.setHours(23, 59, 59, 999);
    return { startDate: ISOweekStart, endDate: ISOweekEnd };
}
const WeeklyPayment = ({ username, userRoles = [] }) => {
    const [currentWeekNumber, setCurrentWeekNumber] = useState(null);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [contractorOptions, setContractorOptions] = useState([]);
    const [siteOptions, setSiteOptions] = useState([]);
    const [combinedOptions, setCombinedOptions] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [clientOptions, setClientOptions] = useState([]);
    const [clientProjectOptions, setClientProjectOptions] = useState([]);
    const [clientProjectMap, setClientProjectMap] = useState({});
    const [projectIdToClientName, setProjectIdToClientName] = useState({});
    const [weeklyPaymentBills, setWeeklyPaymentBills] = useState([]);
    const [selectedProjectName, setSelectedProjectName] = useState(null);
    const [portalDescriptions, setPortalDescriptions] = useState({});
    const [staffAdvanceDescriptions, setStaffAdvanceDescriptions] = useState({});
    const [selectedContractor, setSelectedContractor] = useState(null);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isClientToggleActive, setIsClientToggleActive] = useState(false);
    const [weeklyTypes, setWeeklyTypes] = useState([]);
    const [showWeeklyPaymentExpensesModal, setShowWeeklyPaymentExpensesModal] = useState(false);
    const [weeklyPaymentExpensesAudits, setWeeklyPaymentExpensesAudits] = useState([]);
    const [showWeeklyPaymentReceivedModal, setShowWeeklyPaymentReceivedModal] = useState(false);
    const [weeklyPaymentReceivedAudits, setWeeklyPaymentReceivedAudits] = useState([]);
    const [allRefundAmount, setAllRefundAmount] = useState([]);
    const [popup, setPopup] = useState({ show: false, message: "", type: "", dateStr: "", editRowId: null, editIndex: null, originalDate: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Expenses
    const [expenses, setExpenses] = useState([]);
    const [weeklyReceivedTypes, setWeeklyReceivedTypes] = useState([]);
    const [currentRow, setCurrentRow] = useState([]);
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
        scrollRef.current.scrollLeft = scroll.current.left - dx;
        scrollRef.current.scrollTop = scroll.current.top - dy;
        lastMove.current = {
            time: now,
            x: e.clientX,
            y: e.clientY,
        };
    };
    const handleMouseUp = () => {
        if (!isDragging.current || !scrollRef.current) return;
        isDragging.current = false;
        scrollRef.current.style.cursor = '';
        scrollRef.current.style.userSelect = '';
        applyMomentum();
    };
    const cancelMomentum = () => {
        if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
            animationFrame.current = null;
        }
    };
    const applyMomentum = () => {
        if (!scrollRef.current) return;
        const friction = 0.95;
        const minVelocity = 0.1;
        const step = () => {
            const { x, y } = velocity.current;
            if (!scrollRef.current) return;
            if (Math.abs(x) > minVelocity || Math.abs(y) > minVelocity) {
                scrollRef.current.scrollLeft -= x * 20;
                scrollRef.current.scrollTop -= y * 20;
                velocity.current.x *= friction;
                velocity.current.y *= friction;
                animationFrame.current = requestAnimationFrame(step);
            } else {
                cancelMomentum();
            }
        };
        animationFrame.current = requestAnimationFrame(step);
    };
    useEffect(() => {
        fetchWeeklyReceivedType();
    }, []);
    useEffect(() => {
        fetchWeeklyPaymentBills();
    }, []);
    const fetchWeeklyReceivedType = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/weekly_received_types/getAll');
            if (response.ok) {
                const data = await response.json();
                setWeeklyReceivedTypes(data);
            } else {
                console.log('Error fetching Payment Received type.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    };
    const [newExpense, setNewExpense] = useState({
        date: getTodayDate(),
        contractor: "",
        vendor: "",
        employee: "",
        client_name: "",
        client_id: "",
        project: "",
        type: "",
        amount: "",
        staff_advance_portal_id: "",
        loan_portal_id: "",
    });
    const [editingRowId, setEditingRowId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        date: "",
        contractor_id: "",
        vendor_id: "",
        employee_id: "",
        client_name: "",
        client_id: "",
        project_id: "",
        type: "",
        amount: "",
        advance_portal_id: "",
        staff_advance_portal_id: "",
        loan_portal_id: "",
        description: "",
    });
    const handleEditClick = async (row) => {
        setEditingRowId(row.id);
        let description = row.description || "";
        if (row.advance_portal_id) {
            try {
                const res = await fetch(
                    `https://backendaab.in/aabuildersDash/api/advance_portal/get/${row.advance_portal_id}`
                );
                if (!res.ok) throw new Error("Failed to fetch advance portal data");
                const data = await res.json();
                description = data.description || description;
            } catch (error) {
                console.error("Error fetching advance portal data:", error);
            }
        }
        if (row.staff_advance_portal_id) {
            try {
                const res = await fetch(
                    `https://backendaab.in/aabuildersDash/api/staff-advance/${row.staff_advance_portal_id}`
                );
                if (!res.ok) throw new Error("Failed to fetch staff advance data");

                const data = await res.json();
                description = data.description || description;
            } catch (error) {
                console.error("Error fetching staff advance data:", error);
            }
        }
        setEditFormData({
            date: row.date,
            contractor_id: row.contractor_id,
            vendor_id: row.vendor_id,
            employee_id: row.employee_id,
            client_name: row.client_name || "",
            client_id: row.client_id || "",
            project_id: row.project_id,
            type: row.type,
            amount: row.amount,
            advance_portal_id: row.advance_portal_id,
            staff_advance_portal_id: row.staff_advance_portal_id,
            loan_portal_id: row.loan_portal_id || "",
            description: description,
        });
    };
    const formatDateOnly = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        if (name === "date") {
            // Validate date against current week range
            if (!value || !currentWeekNumber) {
                setEditFormData((prev) => ({ ...prev, date: value }));
                return;
            }
            const year = new Date().getFullYear();
            const { startDate, endDate } = getStartAndEndDateOfISOWeek(currentWeekNumber, year);
            const selectedDate = new Date(value);
            selectedDate.setHours(0, 0, 0, 0);
            if (selectedDate < startDate || selectedDate > endDate) {
                setPopup({
                    show: true,
                    message: `Selected date is out of current week range (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`,
                    type: "edit-expense",
                    dateStr: value,
                    editRowId: editingRowId,
                    editIndex: null,
                    originalDate: editFormData.date || ""
                });
                return; // Prevent date change
            }
            setEditFormData((prev) => ({ ...prev, date: value }));
        }
        else if (name === "amount") {
            let numericValue = parseFloat(value);
            if (isNaN(numericValue)) numericValue = "";
            if (numericValue > balance) {
                alert(`Amount cannot exceed balance: ${balance}`);
                numericValue = "";
            }
            if (numericValue < 0) numericValue = 0;
            setEditFormData((prev) => ({ ...prev, amount: numericValue }));
        }
        else if (name === "description") {
            setEditFormData((prev) => ({ ...prev, description: value }));
        }
        else if (name === "type") {
            // Validate type selection against current party selection
            const allowedTypesForClient = ["Loan", "Bank", "Claim"];
            const isClientTypeAllowed = allowedTypesForClient.includes(value);
            if (value === "Staff Advance") {
                // Staff Advance only allows Employee
                if (editFormData.contractor_id || editFormData.vendor_id || editFormData.client_id) {
                    alert("Staff Advance type only allows Employee. Please select an Employee or clear the Contractor/Vendor/Client selection.");
                    return; // Prevent type change
                }
            } else if (value === "Project Advance") {
                // Project Advance only allows Contractor or Vendor
                if (editFormData.employee_id || editFormData.client_id) {
                    alert("Project Advance type only allows Contractor or Vendor. Please select a Contractor or Vendor or clear the Employee/Client selection.");
                    return; // Prevent type change
                }
            }
            // If type doesn't allow client selection and client toggle is active, disable it and clear client selection
            if (!isClientTypeAllowed && isClientToggleActive) {
                setIsClientToggleActive(false);
                setSelectedClient(null);
                setClientProjectOptions([]);
                setEditFormData((prev) => ({
                    ...prev,
                    [name]: value,
                    client_name: "",
                    client_id: "",
                }));
                return;
            }
            // If validation passes, update the type
            setEditFormData((prev) => ({ ...prev, [name]: value }));
        }
        else {
            setEditFormData((prev) => ({ ...prev, [name]: value }));
        }
    };
    const [payments, setPayments] = useState([]);
    const [newPayment, setNewPayment] = useState({ date: "", amount: "", type: "Weekly" });
    const [showPopup, setShowPopup] = useState(false);
    const [showPopups, setShowPopups] = useState(false);
    const [carryForwardBalance, setCarryForwardBalance] = useState(0);
    const [editingPaymentId, setEditingPaymentId] = useState(null);
    const [editPaymentData, setEditPaymentData] = useState({
        date: "",
        amount: "",
        type: ""
    });
    const [showPaymentPopup, setShowPaymentPopup] = useState(false);
    const [paymentPopupData, setPaymentPopupData] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: "",
        paymentMode: "",
        chequeNo: "",
        chequeDate: "",
        transactionNumber: "",
        accountNumber: ""
    });
    const [currentProjectAdvanceRow, setCurrentProjectAdvanceRow] = useState(null);
    const [previousPayments, setPreviousPayments] = useState([]);
    const [fileUploadPopup, setFileUploadPopup] = useState(false);
    const [currentFileRow, setCurrentFileRow] = useState(null);
    const [selectedFileForPopup, setSelectedFileForPopup] = useState(null);
    const [accountDetails, setAccountDetails] = useState([]);
    const [showCategoryPopup, setShowCategoryPopup] = useState(false);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isConfirmingCategory, setIsConfirmingCategory] = useState(false);
    const [categoryComments, setCategoryComments] = useState("");
    const [showPaymentDetailsPopup, setShowPaymentDetailsPopup] = useState(false);
    const [selectedPaymentDetails, setSelectedPaymentDetails] = useState([]);
    const handleEditPaymentClick = (row) => {
        setEditingPaymentId(row.id || null);
        setEditPaymentData({
            date: row.date,
            amount: row.amount,
            type: row.type
        });
    };
    const saveWeeklyPaymentBill = async (paymentData) => {
        try {
            const response = await fetch("https://backendaab.in/aabuildersDash/api/weekly-payment-bills/save", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(paymentData)
            });
            if (!response.ok) {
                throw new Error("Network response was not ok: " + response.statusText);
            }
            const result = await response.json();
            return result;

        } catch (error) {
            console.error("Error saving payment:", error);
            throw error;
        }
    };
    const fetchWeeklyPaymentBills = async () => {
        try {
            const response = await fetch("https://backendaab.in/aabuildersDash/api/weekly-payment-bills/all", {
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
            setWeeklyPaymentBills(data);
            return data;
        } catch (error) {
            console.error("Error fetching payment bills:", error);
            return [];
        }
    };
    const getPaymentsByExpenseId = (expenseId) => {
        if (!weeklyPaymentBills || weeklyPaymentBills.length === 0) {
            return [];
        }
        const payments = weeklyPaymentBills.filter(bill => bill.weekly_payment_expense_id === expenseId);
        return payments;
    };
    // File upload functions
    const handleFileUploadClick = (row) => {
        setCurrentFileRow(row);
        setSelectedFileForPopup(null);
        setFileUploadPopup(true);
    };
    const handleFileSelectInPopup = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFileForPopup(file);
        }
        e.target.value = '';
    };
    const handleSaveFileFromPopup = async () => {
        if (!selectedFileForPopup || !currentFileRow) return;
        try {
            const project = siteOptions.find(opt => opt.id === Number(currentFileRow.project_id));
            const siteNo = project?.sNo || "";
            const name =
                vendorOptions.find(opt => opt.id === Number(currentFileRow.vendor_id))?.label ||
                contractorOptions.find(opt => opt.id === Number(currentFileRow.contractor_id))?.label ||
                employeeOptions.find(opt => opt.id === Number(currentFileRow.employee_id))?.label ||
                "";
            const now = new Date();
            const timestamp = now.toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            })
                .replace(",", "")
                .replace(/\s/g, "-");
            const formData = new FormData();
            const finalName = `${timestamp}-${siteNo}-${name}`;
            formData.append("file", selectedFileForPopup);
            formData.append("file_name", finalName);
            const uploadResponse = await fetch(
                "https://backendaab.in/aabuilderDash/expenses/googleUploader/uploadToGoogleDrive",
                {
                    method: "POST",
                    body: formData,
                }
            );
            if (!uploadResponse.ok) {
                throw new Error("File upload failed");
            }
            const uploadResult = await uploadResponse.json();
            const pdfUrl = uploadResult.url;
            const updateResponse = await fetch(`https://backendaab.in/aabuildersDash/api/weekly-expenses/${currentFileRow.id}/bill-copy-url`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pdfUrl)
            });
            if (!updateResponse.ok) {
                throw new Error("Failed to update bill copy URL");
            }
            setExpenses((prev) =>
                prev.map((exp) => (exp.id === currentFileRow.id ? { ...exp, bill_copy_url: pdfUrl } : exp))
            );
            setFileUploadPopup(false);
            setCurrentFileRow(null);
            setSelectedFileForPopup(null);
            setPopup({
                show: true,
                message: "File uploaded successfully!",
                type: "success",
                dateStr: new Date().toLocaleDateString('en-GB'),
                editRowId: null,
                editIndex: null,
                originalDate: ""
            });
        } catch (error) {
            console.error("Error uploading file:", error);
            setPopup({
                show: true,
                message: "Error during file upload. Please try again.",
                type: "error",
                dateStr: new Date().toLocaleDateString('en-GB'),
                editRowId: null,
                editIndex: null,
                originalDate: ""
            });
        }
    };
    const getPaymentsByType = (expenseId, billPaymentMode) => {
        if (!weeklyPaymentBills || weeklyPaymentBills.length === 0) {
            return [];
        }
        return weeklyPaymentBills.filter(bill =>
            bill.weekly_payment_expense_id === expenseId && bill.bill_payment_mode === billPaymentMode
        );
    };
    const fetchAuditDetailsForExpense = async (expensesId) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/weekly_payment_audit/expenses/${expensesId}`);
            const data = await response.json();
            setWeeklyPaymentExpensesAudits(data);
            setShowWeeklyPaymentExpensesModal(true);
        } catch (error) {
            console.error("Error fetching audit details:", error);
        }
    };
    const fetchAuditDetailsForPaymentReceived = async (receivedId) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/weekly_payment_audit/payments/${receivedId}`);
            const data = await response.json();
            setWeeklyPaymentReceivedAudits(data);
            setShowWeeklyPaymentReceivedModal(true);
        } catch (error) {
            console.error("Error fetching audit details:", error);
        }
    };
    const handleEditPaymentChange = (e) => {
        const { name, value } = e.target;
        if (name === "date") {
            if (!value || !currentWeekNumber) {
                setEditPaymentData((prev) => ({ ...prev, date: value }));
                return;
            }
            const year = new Date().getFullYear();
            const { startDate, endDate } = getStartAndEndDateOfISOWeek(currentWeekNumber, year);
            const selectedDate = new Date(value);
            selectedDate.setHours(0, 0, 0, 0);
            if (selectedDate < startDate || selectedDate > endDate) {
                const paymentIndex = payments.findIndex(p => p.id === editingPaymentId);
                setPopup({
                    show: true,
                    message: `Selected date is out of current week range (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`,
                    type: "edit-payment",
                    dateStr: value,
                    editRowId: null,
                    editIndex: paymentIndex !== -1 ? paymentIndex : null,
                    originalDate: editPaymentData.date || ""
                });
                return;
            }
            setEditPaymentData((prev) => ({ ...prev, date: value }));
        } else {
            setEditPaymentData((prev) => ({ ...prev, [name]: value }));
        }
    };
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
                    label: item.vendorName,
                    id: item.id,
                    type: "Vendor",
                }));
                setVendorOptions(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchVendorNames();
    }, []);
    useEffect(() => {
        const fetchEmployeeDetails = async () => {
            try {
                const response = await fetch("https://backendaab.in/aabuildersDash/api/employee_details/getAll", {
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
                    value: item.employee_name,
                    label: item.employee_name,
                    id: item.id,
                    type: "Employee",
                }));

                setEmployeeOptions(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchEmployeeDetails();
    }, []);
    useEffect(() => {
        const fetchContractorNames = async () => {
            try {
                const response = await fetch("https://backendaab.in/aabuilderDash/api/contractor_Names/getAll", {
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
                    value: item.contractorName,
                    label: item.contractorName,
                    id: item.id,
                    type: "Contractor",
                }));
                setContractorOptions(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchContractorNames();
    }, []);
    useEffect(() => { setCombinedOptions([...vendorOptions, ...contractorOptions, ...employeeOptions]); }, [vendorOptions, contractorOptions, employeeOptions]);
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch("https://backendaab.in/aabuilderDash/api/projects/getAll", {
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
                const projectClientMapTemp = {};
                const projectClientNameTemp = {};
                const projectOptions = Array.isArray(data)
                    ? data.map((project, index) => {
                        const label = (project.projectName || project.projectReferenceName || `Project ${project.projectId || project.id || index + 1}`).trim();
                        const rawId = project.id ?? project.projectId ?? (100000 + index);
                        const optionId = Number(rawId);
                        const option = {
                            value: label,
                            label,
                            id: optionId,
                            sNo: project.projectId || "",
                        };
                        const ownerCandidates = Array.isArray(project?.ownerDetailsList)
                            ? project.ownerDetailsList
                            : Array.isArray(project?.ownerDetails)
                                ? project.ownerDetails
                                : [];
                        ownerCandidates.forEach((owner) => {
                            const key = buildClientKey(owner?.clientName, owner?.fatherName, owner?.mobile);
                            if (!key) return;
                            if (!projectClientMapTemp[key]) {
                                projectClientMapTemp[key] = {
                                    name: owner.clientName,
                                    fatherName: owner.fatherName || "",
                                    mobile: owner.mobile || "",
                                    clientId: owner.id || key,
                                    projects: [],
                                };
                            }
                            projectClientMapTemp[key].projects.push(option);
                            if (!projectClientNameTemp[optionId]) {
                                projectClientNameTemp[optionId] = owner.clientName || "";
                            }
                        });
                        if (!projectClientNameTemp[optionId]) {
                            projectClientNameTemp[optionId] = "";
                        }
                        return option;
                    })
                    : [];
                const combinedSiteOptions = [...predefinedSiteOptions, ...projectOptions];
                setSiteOptions(combinedSiteOptions);
                const clientOptionList = Object.entries(projectClientMapTemp).map(([key, value], idx) => ({
                    value: value.name,
                    label: value.name,
                    id: value.clientId || `client-${idx}`,
                    clientId: value.clientId || `client-${idx}`,
                    fatherName: value.fatherName,
                    mobile: value.mobile,
                    type: "Client",
                    compositeKey: key,
                    projects: value.projects,
                }));
                setClientOptions(clientOptionList);
                setClientProjectMap(projectClientMapTemp);
                setProjectIdToClientName(projectClientNameTemp);
            } catch (error) {
                console.error("Error fetching projects:", error);
                setClientOptions([]);
                setClientProjectMap({});
                setProjectIdToClientName({});
            }
        };
        fetchProjects();
    }, []);
    useEffect(() => {
        const fetchClientNames = async () => {
            try {
                const response = await fetch("https://backendaab.in/aabuilderDash/api/projects/getAll", {
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
                const formattedData = Array.isArray(data)
                    ? data.flatMap((project) => {
                        const owners = Array.isArray(project?.ownerDetailsList)
                            ? project.ownerDetailsList
                            : Array.isArray(project?.ownerDetails)
                                ? project.ownerDetails
                                : [];
                        return owners
                            .filter((owner) => owner?.clientName)
                            .map((owner, index) => ({
                                value: owner.clientName,
                                label: owner.clientName,
                                id: owner.id ?? `${project.id || 'project'}-${index}`,
                                projectId: project.id,
                                fatherName: owner.fatherName || "",
                                mobile: owner.mobile || "",
                                type: "Client",
                            }));
                    })
                    : [];
                const uniqueOptions = [];
                const seen = new Set();
                formattedData.forEach((option) => {
                    const key = `${option.label}|${option.fatherName}|${option.mobile}`;
                    if (option.label && !seen.has(key)) {
                        seen.add(key);
                        uniqueOptions.push(option);
                    }
                });
                setClientOptions(uniqueOptions);
            } catch (error) {
                console.error("Error fetching client names:", error);
                setClientOptions([]);
            }
        };
        fetchClientNames();
    }, []);
    useEffect(() => {
        fetchWeeklyType();
    }, []);
    useEffect(() => {
        fetchAccountDetails();
    }, []);
    useEffect(() => {
        fetchCategories();
    }, []);
    const fetchWeeklyType = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/weekly_types/getAll');
            if (response.ok) {
                const data = await response.json();
                setWeeklyTypes(data);
            } else {
                console.log('Error fetching tile area names.');
            }
        } catch (error) {
            console.error('Error:', error);
            console.log('Error fetching tile area names.');
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
    const fetchCategories = async () => {
        try {
            const response = await fetch("https://backendaab.in/aabuilderDash/api/expenses_categories/getAll", {
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
                id: item.id,
                value: item.category,
                label: item.category,
            }));
            setCategoryOptions(formattedData);
        } catch (error) {
            console.error("Fetch error: ", error);
        }
    };
    const fetchCurrentWeekNumber = useCallback(() => {
        fetch("https://backendaab.in/aabuildersDash/api/payments-received/current-week")
            .then((res) => res.json())
            .then(setCurrentWeekNumber)
            .catch(console.error);
    }, []);
    const fetchPortalDescriptions = useCallback(async (expensesData) => {
        const projectAdvanceRows = expensesData.filter(row => row.type === "Project Advance" && row.advance_portal_id);
        const newDescriptions = { ...portalDescriptions };
        for (const row of projectAdvanceRows) {
            if (!(row.advance_portal_id in newDescriptions)) {
                try {
                    const res = await fetch(
                        `https://backendaab.in/aabuildersDash/api/advance_portal/get/${row.advance_portal_id}`
                    );
                    if (res.ok) {
                        const data = await res.json();
                        const description = (data.description || "").trim();
                        newDescriptions[row.advance_portal_id] = description !== "" ? description : undefined;
                    }
                } catch (error) {
                    console.error("Error fetching advance portal data:", error);
                    newDescriptions[row.advance_portal_id] = undefined;
                }
            }
        }
        setPortalDescriptions(newDescriptions);
    }, [portalDescriptions]);
    // Fetch descriptions for Staff Advance rows
    const fetchStaffAdvanceDescriptions = useCallback(async (expensesData) => {
        const staffAdvanceRows = expensesData.filter(row => row.type === "Staff Advance" && row.staff_advance_portal_id);
        const newDescriptions = { ...staffAdvanceDescriptions };
        for (const row of staffAdvanceRows) {
            if (!(row.staff_advance_portal_id in newDescriptions)) {
                try {
                    const res = await fetch(
                        `https://backendaab.in/aabuildersDash/api/staff-advance/${row.staff_advance_portal_id}`
                    );
                    if (res.ok) {
                        const data = await res.json();
                        const description = (data.description || "").trim();
                        newDescriptions[row.staff_advance_portal_id] = description !== "" ? description : undefined;
                    }
                } catch (error) {
                    console.error("Error fetching staff advance data:", error);
                    newDescriptions[row.staff_advance_portal_id] = undefined;
                }
            }
        }
        setStaffAdvanceDescriptions(newDescriptions);
    }, [staffAdvanceDescriptions]);
    // Fetch expenses by currentWeekNumber
    const fetchExpenses = useCallback(() => {
        if (!currentWeekNumber) return;
        fetch(`https://backendaab.in/aabuildersDash/api/weekly-expenses/week/${currentWeekNumber}`)
            .then((res) => res.json())
            .then((data) => {
                setExpenses(data);
                // Fetch descriptions for all Project Advance rows
                fetchPortalDescriptions(data);
                // Fetch descriptions for all Staff Advance rows
                fetchStaffAdvanceDescriptions(data);
            })
            .catch(console.error);
    }, [currentWeekNumber]);
    // Fetch payments by currentWeekNumber
    const fetchPayments = useCallback(() => {
        if (!currentWeekNumber) return;
        fetch(`https://backendaab.in/aabuildersDash/api/payments-received/week/${currentWeekNumber}`)
            .then((res) => res.json())
            .then((data) => {
                // Filter out records where type is "Handover"
                const filtered = data.filter((payment) => payment.type !== "Handover");
                setPayments(filtered);
            })
            .catch(console.error);
    }, [currentWeekNumber]);
    const fetchRefundPayments = useCallback(() => {
        if (!currentWeekNumber) return;
        fetch(`https://backendaab.in/aabuildersDash/api/refund_received/getAll`)
            .then((res) => res.json())
            .then((data) => {
                setAllRefundAmount(data);
            })
            .catch(console.error);
    }, [currentWeekNumber]);
    // Initial fetch of current week number
    useEffect(() => {
        fetchCurrentWeekNumber();
    }, [fetchCurrentWeekNumber]);
    // Fetch expenses and payments whenever current week changes
    useEffect(() => {
        if (currentWeekNumber) {
            fetchExpenses();
            fetchPayments();
            fetchRefundPayments();
        }
    }, [currentWeekNumber]);
    useEffect(() => {
        if (!isClientToggleActive) return;
        if (clientProjectOptions.length === 1) {
            setSelectedProjectName(clientProjectOptions[0]);
        }
    }, [clientProjectOptions, isClientToggleActive]);
    // Calculations
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0) + (Number(newExpense.amount) || 0);
    const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0) + (Number(newPayment.amount) || 0);
    const totalRefund = allRefundAmount.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const balance = totalPayments - expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    // Expense input change with immediate date validation
    const handleExpenseChange = (e) => {
        const { name, value } = e.target;
        if (name === "date") {
            validateExpenseDate(value);
        } else if (name === "amount") {
            let numericValue = parseFloat(value);
            if (isNaN(numericValue)) numericValue = "";
            if (numericValue > balance) {
                alert(`Amount cannot exceed balance: ${balance}`);
                numericValue = "";
            }
            if (numericValue < 0) numericValue = 0;
            setNewExpense((prev) => ({ ...prev, amount: numericValue }));
        } else if (name === "type") {
            const allowedTypesForClient = ["Loan", "Bank", "Claim"];
            const isClientTypeAllowed = allowedTypesForClient.includes(value);
            if (value === "Staff Advance") {
                if (selectedContractor || selectedVendor || selectedClient) {
                    alert("Staff Advance type only allows Employee. Please select an Employee or clear the Contractor/Vendor/Client selection.");
                    return;
                }
            } else if (value === "Project Advance") {
                if (selectedEmployee || selectedClient) {
                    alert("Project Advance type only allows Contractor or Vendor. Please select a Contractor or Vendor or clear the Employee/Client selection.");
                    return;
                }
            }
            if (!isClientTypeAllowed && isClientToggleActive) {
                setIsClientToggleActive(false);
                setSelectedClient(null);
                setClientProjectOptions([]);
                setNewExpense((prev) => ({
                    ...prev,
                    [name]: value,
                    client_name: "",
                    client_id: "",
                }));
                setSelectedProjectName(null);
                return;
            }
            setNewExpense((prev) => ({ ...prev, [name]: value }));
        } else {
            setNewExpense((prev) => ({ ...prev, [name]: value }));
        }
    };
    const handlePartySourceToggle = () => {
        setIsClientToggleActive((prev) => {
            const nextState = !prev;
            setSelectContractororVendorName('');
            if (nextState) {
                setSelectedContractor(null);
                setSelectedVendor(null);
                setSelectedEmployee(null);
                setSelectedClient(null);
                setClientProjectOptions([]);
                setNewExpense((prevExpense) => ({
                    ...prevExpense,
                    client_name: "",
                    client_id: "",
                }));
                setSelectedProjectName(null);
            } else {
                setSelectedClient(null);
                setClientProjectOptions([]);
                setNewExpense((prevExpense) => ({
                    ...prevExpense,
                    client_name: "",
                    client_id: "",
                }));
                setSelectedProjectName(null);
            }
            return nextState;
        });
    };
    const updateLoanPortalEntry = async (loanPortalId, { date, amount, vendorId, contractorId, employeeId, projectId }) => {
        if (!loanPortalId) return;
        const payload = {
            type: "Loan",
            date,
            amount,
            loan_payment_mode: "Cash",
            loan_refund_amount: 0,
            from_purpose_id: 0,
            transfer_Project_id: 0,
            to_purpose_id: 0,
            vendor_id: vendorId || 0,
            contractor_id: contractorId || 0,
            employee_id: employeeId || 0,
            project_id: projectId || 0,
            description: "",
            file_url: ""
        };
        const response = await fetch(`https://backendaab.in/aabuildersDash/api/loans/${loanPortalId}?editedBy=${encodeURIComponent(username)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error("Failed to update Loan Portal entry");
        }
        return response.json();
    };
    const clearLoanPortalEntry = async (loanPortalId, date) => {
        if (!loanPortalId) return;
        const payload = {
            loanPortalId,
            type: "",
            date,
            amount: 0,
            loan_refund_amount: 0,
            loan_payment_mode: "",
            from_purpose_id: 0,
            to_purpose_id: 0,
            vendor_id: 0,
            contractor_id: 0,
            employee_id: 0,
            project_id: 0,
            transfer_Project_id: 0,
            entry_no: 0,
            description: "",
        };
        const response = await fetch(`https://backendaab.in/aabuildersDash/api/loans/${loanPortalId}?editedBy=${encodeURIComponent(username)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error("Failed to clear Loan Portal entry");
        }
    };
    const createLoanPortalEntry = async ({ date, amount, vendorId, contractorId, employeeId, projectId }) => {
        const payload = {
            type: "Loan",
            date,
            amount,
            loan_payment_mode: "Cash",
            loan_refund_amount: 0,
            from_purpose_id: 0,
            transfer_Project_id: 0,
            to_purpose_id: 0,
            vendor_id: vendorId || 0,
            contractor_id: contractorId || 0,
            employee_id: employeeId || 0,
            project_id: projectId || 0,
            description: "Loan from Cash Register",
            file_url: ""
        };
        const response = await fetch("https://backendaab.in/aabuildersDash/api/loans/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error("Failed to save Loan Portal entry");
        }
        return response.json();
    };
    const updateAdvancePortalEntry = async (advancePortalId, { date, amount, vendorId, contractorId, projectId, description, weekNo }) => {
        if (!advancePortalId) return;
        const payload = {
            type: "Advance",
            date,
            contractor_id: contractorId || null,
            vendor_id: vendorId || null,
            project_id: projectId || null,
            transfer_site_id: 0,
            payment_mode: "Cash",
            amount: Number(amount) || 0,
            bill_amount: 0,
            refund_amount: 0,
            week_no: weekNo || editFormData.weekly_number || currentWeekNumber,
            description: description || "",
            file_url: "",
        };
        const response = await fetch(
            `https://backendaab.in/aabuildersDash/api/advance_portal/edit/${advancePortalId}?editedBy=${encodeURIComponent(username)}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }
        );
        if (!response.ok) {
            throw new Error("Failed to update Advance Portal entry");
        }
        return response.json();
    };
    const clearAdvancePortalEntry = async (advancePortalId, date) => {
        if (!advancePortalId) return;
        const clearedData = {
            date: date || new Date().toISOString().split("T")[0],
            amount: null,
            project_id: null,
            vendor_id: null,
            contractor_id: null,
            file_url: null,
            description: null,
            bill_amount: null,
            type: null,
            transfer_site_id: null,
            payment_mode: null,
            refund_amount: null,
            week_no: null,
            entry_no: null,
        };
        const response = await fetch(
            `https://backendaab.in/aabuildersDash/api/advance_portal/edit/${advancePortalId}?editedBy=${encodeURIComponent(username)}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(clearedData),
            }
        );
        if (!response.ok) {
            throw new Error("Failed to clear Advance Portal entry");
        }
        return response.json();
    };
    const updateStaffAdvancePortalEntry = async (staffAdvancePortalId, { date, amount, employeeId, projectId, description, weekNo }) => {
        if (!staffAdvancePortalId) return;
        const payload = {
            type: "Advance",
            date,
            employee_id: employeeId || null,
            project_id: projectId || null,
            amount: Number(amount) || 0,
            week_no: weekNo || editFormData.weekly_number || currentWeekNumber,
            staff_payment_mode: "Cash",
            from_purpose_id: 4,
            description: description || "",
            staff_refund_amount: 0,
            file_url: null,
        };
        const response = await fetch(
            `https://backendaab.in/aabuildersDash/api/staff-advance/${staffAdvancePortalId}?editedBy=${encodeURIComponent(username)}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }
        );
        if (!response.ok) {
            throw new Error("Failed to update Staff Advance Portal entry");
        }
        return response.json();
    };
    const clearStaffAdvancePortalEntry = async (staffAdvancePortalId, date) => {
        if (!staffAdvancePortalId) return;
        const clearedData = {
            date: date || new Date().toISOString().split("T")[0],
            amount: null,
            employee_id: null,
            description: null,
            type: null,
            week_no: null,
            from_purpose_id: null,
            staff_payment_mode: null,
            file_url: null,
            staff_refund_amount: null,
            entry_no: null,
        };
        const response = await fetch(
            `https://backendaab.in/aabuildersDash/api/staff-advance/${staffAdvancePortalId}?editedBy=${encodeURIComponent(username)}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(clearedData),
            }
        );
        if (!response.ok) {
            throw new Error("Failed to clear Staff Advance Portal entry");
        }
        return response.json();
    };
    const validateExpenseDate = (dateStr) => {
        if (!dateStr || !currentWeekNumber) return;
        const year = new Date().getFullYear();
        const { startDate, endDate } = getStartAndEndDateOfISOWeek(currentWeekNumber, year);
        const selectedDate = new Date(dateStr);
        selectedDate.setHours(0, 0, 0, 0);
        if (selectedDate < startDate || selectedDate > endDate) {
            setPopup({
                show: true,
                message: `Selected date is out of current week range (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`,
                type: "expense",
                dateStr,
                editRowId: null,
                editIndex: null,
                originalDate: ""
            });
        } else {
            setNewExpense((prev) => ({ ...prev, date: dateStr }));
        }
    };
    const handleKeyDownExpense = async (e) => {
        if (e.key !== "Enter") return;
        if (isSubmitting) {
            alert("Please wait for the previous submission to complete.");
            return;
        }
        if (!newExpense.date) {
            alert("Please select a date");
            return;
        }
        if (!selectedProjectName || !newExpense.type || !newExpense.amount) {
            alert("Please fill all fields except date");
            return;
        }
        setIsSubmitting(true);
        if (newExpense.type === "Staff Advance") {
            if (selectedContractor || selectedVendor) {
                alert("Staff Advance type only allows Employee. Please select an Employee and remove Contractor/Vendor selection.");
                return;
            }
            if (!selectedEmployee) {
                alert("Staff Advance type requires an Employee to be selected.");
                return;
            }
        }
        if (newExpense.type === "Project Advance") {
            if (selectedEmployee) {
                alert("Project Advance type only allows Contractor or Vendor. Please select a Contractor/Vendor and remove Employee selection.");
                return;
            }
            if (!selectedContractor && !selectedVendor) {
                alert("Project Advance type requires either a Contractor or Vendor to be selected.");
                return;
            }
        }
        try {
            const expenseForBackend = {
                date: newExpense.date,
                contractor_id: selectedContractor ? Number(selectedContractor.id) : null,
                vendor_id: selectedVendor ? Number(selectedVendor.id) : null,
                employee_id: selectedEmployee ? Number(selectedEmployee.id) : null,
                client_name: selectedClient?.label || newExpense.client_name || null,
                client_id: selectedClient?.id || newExpense.client_id || null,
                project_id: selectedProjectName ? Number(selectedProjectName.id) : null,
                type: newExpense.type,
                amount: Number(newExpense.amount),
                weekly_number: currentWeekNumber,
                status: false,
                created_at: new Date().toISOString(),
                advance_portal_id: null,
                staff_advance_portal_id: null,
                loan_portal_id: null,
            };
            if (newExpense.type === "Loan") {
                const loanProjectId = selectedProjectName ? Number(selectedProjectName.id) : 0;
                const loanResponse = await createLoanPortalEntry({
                    date: newExpense.date,
                    amount: Number(newExpense.amount) || 0,
                    vendorId: selectedVendor ? Number(selectedVendor.id) : 0,
                    contractorId: selectedContractor ? Number(selectedContractor.id) : 0,
                    employeeId: selectedEmployee ? Number(selectedEmployee.id) : 0,
                    projectId: loanProjectId,
                });
                expenseForBackend.loan_portal_id = loanResponse?.id || loanResponse?.loanPortalId || null;
            }
            if (newExpense.type === "Project Advance") {
                const res = await fetch("https://backendaab.in/aabuildersDash/api/advance_portal/getAll");
                if (!res.ok) throw new Error("Failed to fetch entry numbers");
                const allData = await res.json();
                const maxEntryNo =
                    allData.length > 0
                        ? Math.max(...allData.map((item) => item.entry_no || 0))
                        : 0;
                const nextEntryNo = maxEntryNo + 1;
                const getWeekNumber = () => {
                    const now = new Date();
                    const start = new Date(now.getFullYear(), 0, 1);
                    const diff =
                        now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000;
                    const oneWeek = 604800000;
                    return Math.floor(diff / oneWeek) + 1;
                };
                const advancePayload = {
                    type: "Advance",
                    date: newExpense.date,
                    contractor_id: selectedContractor ? Number(selectedContractor.id) : null,
                    vendor_id: selectedVendor ? Number(selectedVendor.id) : null,
                    project_id: selectedProjectName ? Number(selectedProjectName.id) : null,
                    transfer_site_id: 0,
                    payment_mode: "Cash",
                    amount: Number(newExpense.amount),
                    bill_amount: 0,
                    refund_amount: 0,
                    entry_no: nextEntryNo,
                    week_no: getWeekNumber(),
                    description: "",
                    file_url: "",
                };
                expenseForBackend.employee_id = null;
                const saveAdvance = await fetch("https://backendaab.in/aabuildersDash/api/advance_portal/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(advancePayload),
                });
                if (!saveAdvance.ok) throw new Error("Failed to save advance");
                const savedAdvance = await saveAdvance.json();
                expenseForBackend.advance_portal_id = savedAdvance.advancePortalId;
                const saveWeekly = await fetch("https://backendaab.in/aabuildersDash/api/weekly-expenses/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(expenseForBackend),
                });
                if (!saveWeekly.ok) throw new Error("Failed to save weekly expense");
                const savedWeekly = await saveWeekly.json();
                setExpenses((prev) => {
                    const newExpenses = [savedAdvance, savedWeekly, ...prev];
                    fetchPortalDescriptions(newExpenses);
                    return newExpenses;
                });
                window.location.reload();
            } else if (newExpense.type === "Staff Advance") {
                const res = await fetch("https://backendaab.in/aabuildersDash/api/staff-advance/all");
                if (!res.ok) throw new Error("Failed to fetch staff advance entry numbers");
                const allData = await res.json();
                const maxEntryNo =
                    allData.length > 0
                        ? Math.max(...allData.map((item) => item.entry_no || 0))
                        : 0;
                const nextEntryNo = maxEntryNo + 1;
                const staffAdvancePayload = {
                    date: newExpense.date,
                    type: "Advance",
                    employee_id: selectedEmployee ? Number(selectedEmployee.id) : null,
                    amount: Number(newExpense.amount),
                    week_no: currentWeekNumber,
                    staff_payment_mode: "Cash",
                    from_purpose_id: 4,
                    entry_no: nextEntryNo,
                };
                const saveStaffAdvance = await fetch("https://backendaab.in/aabuildersDash/api/staff-advance/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(staffAdvancePayload),
                });
                if (!saveStaffAdvance.ok) throw new Error("Failed to save staff advance");
                const savedStaffAdvance = await saveStaffAdvance.json();
                expenseForBackend.contractor_id = null;
                expenseForBackend.vendor_id = null;
                expenseForBackend.staff_advance_portal_id = savedStaffAdvance.staffAdvancePortalId;
                const saveWeekly = await fetch("https://backendaab.in/aabuildersDash/api/weekly-expenses/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(expenseForBackend),
                });
                if (!saveWeekly.ok) throw new Error("Failed to save weekly expense");
                const savedWeekly = await saveWeekly.json();
                setExpenses((prev) => {
                    const newExpenses = [savedStaffAdvance, savedWeekly, ...prev];
                    fetchStaffAdvanceDescriptions(newExpenses);
                    return newExpenses;
                });
                window.location.reload();
            } else {
                const res = await fetch("https://backendaab.in/aabuildersDash/api/weekly-expenses/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(expenseForBackend),
                });
                if (!res.ok) throw new Error("Failed to save weekly expense");
                const saved = await res.json();
                setExpenses((prev) => {
                    const newExpenses = [saved, ...prev];
                    fetchPortalDescriptions(newExpenses);
                    return newExpenses;
                });
                window.location.reload();
            }
            setNewExpense({
                date: "",
                contractor: "",
                vendor: "",
                employee: "",
                client_name: "",
                client_id: "",
                project: "",
                type: "",
                amount: "",
                staff_advance_portal_id: "",
                loan_portal_id: "",
            });
            setClientProjectOptions([]);
            setSelectedVendor(null);
            setSelectedContractor(null);
            setSelectedEmployee(null);
            setSelectedClient(null);
            setSelectedProjectName(null);
        } catch (err) {
            setIsSubmitting(false);
            alert("Error saving expense: " + err.message);
        }
    };
    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        if (name === "date") {
            validatePaymentDate(value);
        } else {
            setNewPayment((prev) => ({ ...prev, [name]: value }));
        }
    };
    const validatePaymentDate = (dateStr) => {
        if (!dateStr || !currentWeekNumber) return;
        const year = new Date().getFullYear();
        const { startDate, endDate } = getStartAndEndDateOfISOWeek(currentWeekNumber, year);
        const selectedDate = new Date(dateStr);
        if (selectedDate < startDate || selectedDate > endDate) {
            setPopup({
                show: true,
                message: `Selected date is out of current week range (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`,
                type: "payment",
                dateStr,
                editRowId: null,
                editIndex: null,
                originalDate: ""
            });
        } else {
            setNewPayment((prev) => ({ ...prev, date: dateStr }));
        }
    };
    const handleKeyDownPayment = (e) => {
        if (e.key !== "Enter") return;
        if (isSubmitting) {
            alert("Please wait for the previous submission to complete.");
            return;
        }
        if (!newPayment.date) {
            alert("Please select a date");
            return;
        }
        if (!newPayment.amount || !newPayment.type) {
            alert("Please fill Amount and Type");
            return;
        }
        setIsSubmitting(true);
        const payload = {
            date: newPayment.date,
            amount: Number(newPayment.amount),
            type: newPayment.type,
            weekly_number: currentWeekNumber,
            status: false,
        };
        fetch("https://backendaab.in/aabuildersDash/api/payments-received/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to save payment");
                return res.json();
            })
            .then((saved) => {
                setPayments((prev) => [saved, ...prev]);
                setNewPayment({ date: "", amount: "", type: "Weekly" });
                window.location.reload();
            })
            .catch((err) => {
                setIsSubmitting(false);
                alert("Error saving payment: " + err.message);
            });
    };
    const openAccountClosure = () => {
        setCarryForwardBalance(balance.toFixed(2));
        setShowPopup(true);
    };
    const handleAccountClosure = async (type, discountAmount = 0) => {
        try {
            const carryForwardParam = (type === "Carry (CF)" || type === "Handover") ? "true" : "false";
            const carryAmountParam = carryForwardParam === "true" && balance > 0 ? balance : 0;
            const url = new URL("https://backendaab.in/aabuildersDash/api/payments-received/account-closure");
            url.searchParams.append("closureType", type);
            url.searchParams.append("carryForward", carryForwardParam);
            url.searchParams.append("carryAmount", carryAmountParam - discountAmount);
            url.searchParams.append("discountAmount", discountAmount);
            const res = await fetch(url.toString(), { method: "POST" });
            const newWeekNumber = await res.json();
            setCurrentWeekNumber(newWeekNumber);
            setNewExpense({ date: "", contractor: "", project: "", type: "", amount: "", staff_advance_portal_id: "" });
            setNewPayment({ date: "", amount: "", type: "Weekly" });
        } catch (error) {
            alert("Failed to complete account closure: " + error.message);
        }
    };
    const groupedExpenses = expenses.reduce((acc, expense) => {
        if (!acc[expense.type]) acc[expense.type] = 0;
        acc[expense.type] += Number(expense.amount) || 0;
        return acc;
    }, {});
    const mergedExpenses = Object.entries(groupedExpenses).map(([type, amount]) => ({ type, amount }));
    const saveEditedExpense = async (row) => {
        try {
            if (editFormData.type === "Staff Advance") {
                if (editFormData.contractor_id || editFormData.vendor_id) {
                    alert("Staff Advance type only allows Employee. Please select an Employee and remove Contractor/Vendor selection.");
                    return;
                }
                if (!editFormData.employee_id) {
                    alert("Staff Advance type requires an Employee to be selected.");
                    return;
                }
            }
            if (editFormData.type === "Project Advance") {
                if (editFormData.employee_id) {
                    alert("Project Advance type only allows Contractor or Vendor. Please select a Contractor/Vendor and remove Employee selection.");
                    return;
                }
                if (!editFormData.contractor_id && !editFormData.vendor_id) {
                    alert("Project Advance type requires either a Contractor or Vendor to be selected.");
                    return;
                }
            }
            const normalize = (val) =>
                val === null || val === undefined ? "" : String(val).trim();
            const changedFields = Object.keys(editFormData).filter(
                (key) => normalize(editFormData[key]) !== normalize(row[key])
            );
            if (changedFields.length === 0) {
                setEditingRowId(null);
                return;
            }
            const onlyDescriptionChanged =
                changedFields.length === 1 && changedFields[0] === "description";
            const wasLoan = row.type === "Loan";
            const isNowLoan = editFormData.type === "Loan";
            const wasProjectAdvance = row.type === "Project Advance";
            const isNowProjectAdvance = editFormData.type === "Project Advance";
            const wasStaffAdvance = row.type === "Staff Advance";
            const isNowStaffAdvance = editFormData.type === "Staff Advance";
            if (wasProjectAdvance && !isNowProjectAdvance && row.advance_portal_id) {
                try {
                    await clearAdvancePortalEntry(row.advance_portal_id, editFormData.date);
                } catch (advanceError) {
                    console.error("Error clearing advance portal entry:", advanceError);
                }
                editFormData.advance_portal_id = null;
            }
            if (wasStaffAdvance && !isNowStaffAdvance && row.staff_advance_portal_id) {
                try {
                    await clearStaffAdvancePortalEntry(row.staff_advance_portal_id, editFormData.date);
                } catch (staffAdvanceError) {
                    console.error("Error clearing staff advance portal entry:", staffAdvanceError);
                }
                editFormData.staff_advance_portal_id = null;
            }
            if (isNowProjectAdvance) {
                const advancePayload = {
                    date: editFormData.date,
                    amount: Number(editFormData.amount) || 0,
                    vendorId: editFormData.vendor_id ? Number(editFormData.vendor_id) : 0,
                    contractorId: editFormData.contractor_id ? Number(editFormData.contractor_id) : 0,
                    projectId: editFormData.project_id ? Number(editFormData.project_id) : 0,
                    description: editFormData.description || "",
                    weekNo: editFormData.weekly_number || currentWeekNumber,
                };
                if (row.advance_portal_id) {
                    await updateAdvancePortalEntry(row.advance_portal_id, advancePayload);
                    editFormData.advance_portal_id = row.advance_portal_id;
                } else {
                    const resAll = await fetch(
                        "https://backendaab.in/aabuildersDash/api/advance_portal/getAll"
                    );
                    if (!resAll.ok) throw new Error("Failed to fetch entry numbers");
                    const allData = await resAll.json();
                    const maxEntryNo =
                        allData.length > 0
                            ? Math.max(...allData.map((item) => item.entry_no || 0))
                            : 0;
                    const nextEntryNo = maxEntryNo + 1;
                    const saveAdvancePayload = {
                        type: "Advance",
                        date: editFormData.date,
                        contractor_id: editFormData.contractor_id || null,
                        vendor_id: editFormData.vendor_id || null,
                        project_id: editFormData.project_id || null,
                        transfer_site_id: 0,
                        payment_mode: "Cash",
                        amount: Number(editFormData.amount) || 0,
                        bill_amount: 0,
                        refund_amount: 0,
                        entry_no: nextEntryNo,
                        week_no: editFormData.weekly_number || currentWeekNumber,
                        description: editFormData.description || "",
                        file_url: editFormData.file_url || "",
                    };
                    const saveAdvance = await fetch(
                        "https://backendaab.in/aabuildersDash/api/advance_portal/save",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(saveAdvancePayload),
                        }
                    );
                    if (!saveAdvance.ok) throw new Error("Failed to save advance");
                    const savedAdvance = await saveAdvance.json();
                    editFormData.advance_portal_id = savedAdvance.advancePortalId;
                }
            }
            if (isNowStaffAdvance) {
                const staffAdvancePayload = {
                    date: editFormData.date,
                    amount: Number(editFormData.amount) || 0,
                    employeeId: editFormData.employee_id ? Number(editFormData.employee_id) : 0,
                    projectId: editFormData.project_id ? Number(editFormData.project_id) : 0,
                    description: editFormData.description || "",
                    weekNo: editFormData.weekly_number || currentWeekNumber,
                };
                if (row.staff_advance_portal_id) {
                    await updateStaffAdvancePortalEntry(row.staff_advance_portal_id, staffAdvancePayload);
                    editFormData.staff_advance_portal_id = row.staff_advance_portal_id;
                } else {
                    const resAll = await fetch(
                        "https://backendaab.in/aabuildersDash/api/staff-advance/all"
                    );
                    if (!resAll.ok) throw new Error("Failed to fetch entry numbers");
                    const allData = await resAll.json();
                    const maxEntryNo =
                        allData.length > 0
                            ? Math.max(...allData.map((item) => item.entry_no || 0))
                            : 0;
                    const nextEntryNo = maxEntryNo + 1;
                    const saveStaffAdvancePayload = {
                        date: editFormData.date,
                        type: "Advance",
                        employee_id: editFormData.employee_id || null,
                        project_id: editFormData.project_id || null,
                        amount: Number(editFormData.amount) || 0,
                        week_no: editFormData.weekly_number || currentWeekNumber,
                        staff_payment_mode: "Cash",
                        from_purpose_id: 4,
                        entry_no: nextEntryNo,
                        description: editFormData.description || "",
                        staff_refund_amount: 0,
                        file_url: null,
                    };
                    const saveStaffAdvance = await fetch(
                        "https://backendaab.in/aabuildersDash/api/staff-advance/save",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(saveStaffAdvancePayload),
                        }
                    );
                    if (!saveStaffAdvance.ok) throw new Error("Failed to save staff advance");
                    const savedStaffAdvance = await saveStaffAdvance.json();
                    editFormData.staff_advance_portal_id = savedStaffAdvance.id || savedStaffAdvance.staff_advance_portal_id || savedStaffAdvance.staffAdvancePortalId;
                }
            }
            if (isNowLoan) {
                const loanPayload = {
                    date: editFormData.date,
                    amount: Number(editFormData.amount) || 0,
                    vendorId: editFormData.vendor_id ? Number(editFormData.vendor_id) : 0,
                    contractorId: editFormData.contractor_id ? Number(editFormData.contractor_id) : 0,
                    employeeId: editFormData.employee_id ? Number(editFormData.employee_id) : 0,
                    projectId: editFormData.project_id ? Number(editFormData.project_id) : 0,
                };
                if (row.loan_portal_id) {
                    await updateLoanPortalEntry(row.loan_portal_id, loanPayload);
                    editFormData.loan_portal_id = row.loan_portal_id;
                } else {
                    const newLoan = await createLoanPortalEntry(loanPayload);
                    editFormData.loan_portal_id = newLoan?.id || newLoan?.loanPortalId || null;
                }
            } else if (wasLoan && row.loan_portal_id) {
                try {
                    await clearLoanPortalEntry(row.loan_portal_id, editFormData.date);
                } catch (loanError) {
                    console.error("❌ Error clearing loan portal entry:", loanError);
                    alert("Failed to delete the associated Loan Portal entry. Please try again.");
                    return;
                }
                editFormData.loan_portal_id = null;
            }
            if (!onlyDescriptionChanged) {
                const finalEditData = { ...editFormData };
                if (editFormData.type === "Project Advance") {
                    finalEditData.employee_id = null;
                }
                if (editFormData.type === "Staff Advance") {
                    finalEditData.contractor_id = null;
                    finalEditData.vendor_id = null;
                }
                const response = await fetch(
                    `https://backendaab.in/aabuildersDash/api/weekly-expenses/edit/${row.id}?username=${encodeURIComponent(
                        username
                    )}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(finalEditData),
                    }
                );
                if (!response.ok) throw new Error("Failed to update expense");
                const updatedExpense = await response.json();
                setExpenses((prevExpenses) => {
                    const newExpenses = prevExpenses.map((exp) => (exp.id === row.id ? updatedExpense : exp));
                    fetchPortalDescriptions(newExpenses);
                    fetchStaffAdvanceDescriptions(newExpenses);
                    return newExpenses;
                });
            }
            window.location.reload();
            setEditingRowId(null);
        } catch (error) {
            console.error("❌ Error updating expense:", error);
        }
    };
    const saveEditedPaymentReceived = async (row) => {
        try {
            const normalize = (val) =>
                val === null || val === undefined ? "" : String(val).trim();
            const hasChanges = Object.keys(editPaymentData).some((key) => {
                return normalize(editPaymentData[key]) !== normalize(row[key]);
            });
            if (!hasChanges) {
                setEditingPaymentId(null);
                return;
            }
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/payments-received/edit/${row.id}?username=${encodeURIComponent(username)}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editPaymentData),
            });
            if (!response.ok) {
                throw new Error("Failed to update payment");
            }
            const updatedPayment = await response.json();
            window.location.reload();
            setPayments((prev) =>
                prev.map((p) => (p.id === row.id ? updatedPayment : p))
            );
            setEditingPaymentId(null);
        } catch (error) {
            console.error("Error updating payment:", error);
        }
    };
    const handleWeeklyExpensesDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete This Expense Data?");
        if (confirmed) {
            try {
                const expenseRecord = expenses.find((exp) => exp.id === id);
                if (expenseRecord?.type === "Loan" && expenseRecord.loan_portal_id) {
                    try {
                        await clearLoanPortalEntry(expenseRecord.loan_portal_id, expenseRecord.date);
                    } catch (loanError) {
                        console.error("Error clearing loan portal entry:", loanError);
                        alert("Failed to clear the associated Loan entry. Please try again.");
                        return;
                    }
                }
                if (expenseRecord?.type === "Project Advance" && expenseRecord.advance_portal_id) {
                    try {
                        await clearAdvancePortalEntry(expenseRecord.advance_portal_id, expenseRecord.date);
                    } catch (advanceError) {
                        console.error("Error clearing advance portal entry:", advanceError);
                        alert("Failed to clear the associated Advance Portal entry. Please try again.");
                        return;
                    }
                }
                if (expenseRecord?.type === "Staff Advance" && expenseRecord.staff_advance_portal_id) {
                    try {
                        await clearStaffAdvancePortalEntry(expenseRecord.staff_advance_portal_id, expenseRecord.date);
                    } catch (staffAdvanceError) {
                        console.error("Error clearing staff advance portal entry:", staffAdvanceError);
                        alert("Failed to clear the associated Staff Advance Portal entry. Please try again.");
                        return;
                    }
                }
                const response = await fetch(`https://backendaab.in/aabuildersDash/api/weekly-expenses/delete_by_id/${id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    alert("Weekly Expenses deleted successfully!!!");
                    window.location.reload();
                } else {
                    console.error("Failed to delete the Weekly Expenses. Status:", response.status);
                    alert("Error deleting the Weekly Expenses. Please try again.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred while deleting the Expense.");
            }
        } else {
            console.log("Deletion cancelled.");
        }
    };
    const handleWeeklyReceivedDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete This Expense Data?");
        if (confirmed) {
            try {
                const response = await fetch(`https://backendaab.in/aabuildersDash/api/payments-received/delete/${id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    alert("Weekly Expenses deleted successfully!!!");
                    window.location.reload();
                } else {
                    console.error("Failed to delete the Weekly Expenses. Status:", response.status);
                    alert("Error deleting the Weekly Expenses. Please try again.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred while deleting the Contractor Name.");
            }
        } else {
            console.log("Deletion cancelled.");
        }
    };
    const buildClientKey = (name = "", father = "", mobile = "") => {
        const normalizedName = (name || "").trim().toLowerCase();
        if (!normalizedName) return "";
        const normalizedFather = (father || "").trim().toLowerCase();
        const normalizedMobile = (mobile || "").trim();
        return `${normalizedName}|${normalizedFather}|${normalizedMobile}`;
    };
    const getVendorName = (id) =>
        vendorOptions.find(v => v.id === id)?.value || "";
    const getContractorName = (id) =>
        contractorOptions.find(c => c.id === id)?.value || "";
    const getEmployeeName = (id) =>
        employeeOptions.find(c => c.id === id)?.value || "";
    const getSiteName = (id) =>
        siteOptions.find(s => String(s.id) === String(id))?.value || "";
    const getClientNameFromProjectId = (projectId) =>
        projectIdToClientName[String(projectId)] || "";
    const getClientName = (entry) => {
        if (!entry) return "";
        if (entry.client_name) return entry.client_name;
        if (entry.client_id) {
            const option = clientOptions.find(opt => String(opt.clientId || opt.id) === String(entry.client_id));
            if (option) return option.label;
        }
        if (entry.project_id) {
            return getClientNameFromProjectId(entry.project_id);
        }
        return "";
    };
    const getClientOption = (clientId, clientName) => {
        if (!clientOptions.length) return null;
        if (clientId) {
            const byId = clientOptions.find(opt => String(opt.clientId || opt.id) === String(clientId));
            if (byId) return byId;
        }
        if (clientName) {
            return clientOptions.find(opt => opt.label === clientName) || null;
        }
        return null;
    };
    const filteredExpenses = expenses.filter((entry) => {
        if (selectDate) {
            const [year, month, day] = selectDate.split("-");
            const formattedSelectDate = `${parseInt(day)}-${parseInt(month)}-${year}`;
            const entryDateObj = new Date(entry.date);
            const formattedEntryDate = `${entryDateObj.getDate()}-${entryDateObj.getMonth() + 1}-${entryDateObj.getFullYear()}`;
            if (formattedEntryDate !== formattedSelectDate) return false;
        }
        if (selectContractororVendorName) {
            if (isClientToggleActive) {
                const clientName = getClientName(entry) || "";
                if (clientName.toLowerCase() !== selectContractororVendorName.toLowerCase()) {
                    return false;
                }
            } else {
                const name =
                    entry.vendor_id
                        ? getVendorName(entry.vendor_id)
                        : getContractorName(entry.contractor_id) || getEmployeeName(entry.employee_id);
                if (name.toLowerCase() !== selectContractororVendorName.toLowerCase())
                    return false;
            }
        }
        if (selectProjectName) {
            const projectName = getSiteName(entry.project_id) || "";
            if (projectName.toLowerCase() !== selectProjectName.toLowerCase())
                return false;
        }
        if (selectType) {
            if (entry.type?.toLowerCase() !== selectType.toLowerCase()) return false;
        }
        return true;
    });
    const clearFilters = () => {
        setSelectDate('');
        setSelectContractororVendorName('');
        setSelectProjectName('');
        setSelectType('');
    };
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    const sortedExpenses = React.useMemo(() => {
        let sortableData = [...filteredExpenses].reverse();
        if (sortConfig.key) {
            sortableData.sort((a, b) => {
                let aValue, bValue;
                switch (sortConfig.key) {
                    case 'date':
                        aValue = new Date(a.date);
                        bValue = new Date(b.date);
                        break;
                    case 'contractor_vendor':
                        if (isClientToggleActive) {
                            aValue = getClientName(a) || "";
                            bValue = getClientName(b) || "";
                        } else {
                            const aHasContractorVendorEmployee = a.contractor_id || a.vendor_id || a.employee_id;
                            const bHasContractorVendorEmployee = b.contractor_id || b.vendor_id || b.employee_id;
                            if (!aHasContractorVendorEmployee && a.type === "Loan") {
                                aValue = getClientName(a) || "";
                            } else {
                                aValue = combinedOptions.find(opt =>
                                    (opt.type === "Contractor" && opt.id === Number(a.contractor_id)) ||
                                    (opt.type === "Vendor" && opt.id === Number(a.vendor_id)) ||
                                    (opt.type === "Employee" && opt.id === Number(a.employee_id))
                                )?.label || "";
                            }
                            if (!bHasContractorVendorEmployee && b.type === "Loan") {
                                bValue = getClientName(b) || "";
                            } else {
                                bValue = combinedOptions.find(opt =>
                                    (opt.type === "Contractor" && opt.id === Number(b.contractor_id)) ||
                                    (opt.type === "Vendor" && opt.id === Number(b.vendor_id)) ||
                                    (opt.type === "Employee" && opt.id === Number(b.employee_id))
                                )?.label || "";
                            }
                        }
                        break;
                    case 'project_name':
                        aValue = siteOptions.find(opt => opt.id === Number(a.project_id))?.label || "";
                        bValue = siteOptions.find(opt => opt.id === Number(b.project_id))?.label || "";
                        break;
                    case 'type':
                        aValue = a.type || "";
                        bValue = b.type || "";
                        break;
                    default:
                        return 0;
                }
                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        } else {
            sortableData.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB - dateA;
            });
        }
        return sortableData;
    }, [filteredExpenses, sortConfig, combinedOptions, siteOptions, clientOptions, isClientToggleActive]);
    const partyFilterOptions = React.useMemo(() => {
        const ids = new Set();
        if (isClientToggleActive) {
            return clientOptions.map(opt => {
                if (ids.has(opt.label)) return null;
                ids.add(opt.label);
                return { value: opt.label, label: opt.label };
            }).filter(Boolean);
        }
        return filteredExpenses.map(exp => {
            const option =
                combinedOptions.find(
                    opt =>
                        (opt.type === "Contractor" && opt.id === Number(exp.contractor_id)) ||
                        (opt.type === "Vendor" && opt.id === Number(exp.vendor_id)) ||
                        (opt.type === "Employee" && opt.id === Number(exp.employee_id))
                );
            if (option && !ids.has(option.id)) {
                ids.add(option.id);
                return { value: option.label, label: option.label };
            }
            return null;
        }).filter(Boolean);
    }, [filteredExpenses, combinedOptions, clientOptions, isClientToggleActive]);
    const projectFilterOptions = React.useMemo(() => {
        const ids = new Set();
        return filteredExpenses.map(exp => {
            const option = siteOptions.find(opt => opt.id === Number(exp.project_id));
            if (option && !ids.has(option.id)) {
                ids.add(option.id);
                return { value: option.label, label: option.label };
            }
            return null;
        }).filter(Boolean);
    }, [filteredExpenses, siteOptions]);
    const updateDescription = async (id, description) => {
        try {
            const res = await fetch(`https://backendaab.in/aabuildersDash/api/advance_portal/update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ description }),
            });
            if (!res.ok) {
                throw new Error("Failed to update description");
            }
            const data = await res.json();
            setEditFormData((prev) => ({
                ...prev,
                description: data.description,
            }));
            return data;
        } catch (error) {
            console.error("❌ Error updating description:", error);
            alert("Failed to update description");
        }
    };
    const generatePDF = async () => {
        if (!currentWeekNumber) {
            alert("Please ensure week data is loaded before generating the PDF.");
            return;
        }
        const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const year = new Date().getFullYear();
        const weekDates = getStartAndEndDateOfISOWeek(currentWeekNumber, year);
        const weekStartDate = weekDates.startDate.toLocaleDateString("en-GB");
        const weekEndDate = weekDates.endDate.toLocaleDateString("en-GB");
        if (!Array.isArray(expenses) || !Array.isArray(payments)) {
            alert("Error: Data not loaded properly. Please refresh the page and try again.");
            return;
        }
        const totalExpenses = expenses.reduce((t, e) => t + Number(e.amount || 0), 0);
        const totalPayments = payments.reduce((t, p) => t + Number(p.amount || 0), 0);
        const balance = totalPayments - totalExpenses;
        let advancePortalData = [];
        let staffAdvanceData = [];
        let loanPortalData = [];
        try {
            const [advanceRes, staffAdvanceRes, loanRes] = await Promise.all([
                fetch("https://backendaab.in/aabuildersDash/api/advance_portal/getAll").catch(() => null),
                fetch("https://backendaab.in/aabuildersDash/api/staff-advance/all").catch(() => null),
                fetch("https://backendaab.in/aabuildersDash/api/loans/all").catch(() => null)
            ]);
            if (advanceRes && advanceRes.ok) {
                advancePortalData = await advanceRes.json();
            }
            if (staffAdvanceRes && staffAdvanceRes.ok) {
                staffAdvanceData = await staffAdvanceRes.json();
            }
            if (loanRes && loanRes.ok) {
                loanPortalData = await loanRes.json();
            }
        } catch (error) {
            console.error("Error fetching portal data:", error);
        }
        const isDateInWeek = (dateStr) => {
            if (!dateStr) return false;
            const date = new Date(dateStr);
            date.setHours(0, 0, 0, 0);
            return date >= weekDates.startDate && date <= weekDates.endDate;
        };
        const staffAdvanceTotalFromPortal = staffAdvanceData
            .filter(entry =>
                entry.staff_payment_mode === "Cash" &&
                entry.type === "Advance" &&
                isDateInWeek(entry.date)
            )
            .reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
        const loanTotalFromPortal = loanPortalData
            .filter(entry =>
                (entry.loan_payment_mode === "Cash" || entry.payment_mode === "Cash") &&
                entry.type === "Loan" &&
                isDateInWeek(entry.date)
            )
            .reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
        const getPartyDisplayName = (entry) => {
            const hasContractorVendorEmployee = entry.contractor_id || entry.vendor_id || entry.employee_id;
            if (!hasContractorVendorEmployee && entry.type === "Loan") {
                const client = getClientName(entry);
                if (client) return client;
            }
            if (entry.vendor_id) return getVendorName(entry.vendor_id);
            if (entry.contractor_id) return getContractorName(entry.contractor_id);
            if (entry.employee_id) return getEmployeeName(entry.employee_id);
            return "";
        };
        const formatDateOnly = (dateString) => {
            if (!dateString) return "";
            try {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return "";
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
            } catch (error) {
                console.error("Error formatting date:", error);
                return "";
            }
        };
        const formatDate = (dateString) => {
            if (!dateString) return "";
            try {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return "";
                date.setMinutes(date.getMinutes());
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                let hours = date.getHours();
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? String(hours).padStart(2, '0') : '12';
                return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
            } catch (error) {
                console.error("Error formatting date:", error);
                return "";
            }
        };
        const drawHeader = (doc, titleText = "") => {
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.rect(20, 24, 810, 40);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text(`PS: ${String(currentWeekNumber || "")}`, 30, 40);
            doc.setFontSize(9);
            doc.text(String(new Date().toLocaleDateString("en-GB") || ""), 30, 55);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(titleText, 180, 50);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text(`START  ${String(weekStartDate || "")}`, 460, 40);
            doc.text(`END    ${String(weekEndDate || "")}`, 465, 58);
            doc.setFillColor(220, 250, 220);
            doc.rect(620, 25, 190, 18.5, "F");
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("EXPENSES", 660, 37);
            const amountX = 800;
            doc.text(
                String(totalExpenses.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"),
                amountX, 37,
                { align: "right" }
            );
            doc.setFillColor(250, 220, 220);
            doc.rect(620, 44, 190, 18.5, "F");
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("BALANCE", 660, 58);
            doc.text(
                String(balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"),
                amountX, 58,
                { align: "right" }
            );
        };
        drawHeader(doc, "WEEKLY PAYMENT REPORT");
        const expensesHeaders = [["SNO", "Date", "Party", "Project Name", "Type", "Amount", "AC", "C", ""]];
        const pdfFilteredExpenses = expenses.filter(row => row.type === "Bill" || row.type === "Wage");
        const expensesData = pdfFilteredExpenses.map((row, idx) => [
            String(idx + 1 || ""),
            String(row.date ? formatDateOnly(row.date) : ""),
            String(getPartyDisplayName(row) || ""),
            String(siteOptions.find(opt => opt.id === Number(row.project_id))?.label || ""),
            String(row.type || ""),
            String(Number(row.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"),
            String(""),
            String(""),
            String("")
        ]);
        autoTable(doc, {
            head: expensesHeaders,
            body: expensesData,
            margin: { top: 64, left: 20 },
            tableWidth: 810,
            theme: "grid",
            styles: {
                fontSize: 8,
                cellPadding: 3,
                textColor: [0, 0, 0],
                lineColor: [0, 0, 0],
                lineWidth: 0.5
            },
            headStyles: {
                textColor: [0, 0, 0],
                fillColor: [255, 230, 230],
                lineColor: [0, 0, 0],
                lineWidth: 1.0,
                fontStyle: 'normal'
            },
            columnStyles: {
                5: { halign: 'right' }
            },
            didDrawPage: (data) => {
                drawHeader(doc, "WEEKLY PAYMENT REPORT");
                if (data.pageNumber > 1) {
                    doc.setFontSize(10);
                }
            },
            pageBreak: 'auto',
            showHead: 'everyPage',
        });
        const paymentsHeaders = [["DATE RECEIVED", "AMOUNT", "TYPE"]];
        const paymentsData = payments.map(r => [
            String(r.created_at ? formatDate(r.created_at) : ""),
            String(Number(r.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"),
            String(r.type || "")
        ]);
        paymentsData.push([
            { content: "TOTAL", styles: { fontStyle: "bold" } },
            { content: String(totalPayments.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"), styles: { fontStyle: "bold" } },
            { content: "", styles: { fontStyle: "bold" } }
        ]);
        paymentsData.push([
            { content: "BALANCE", styles: { fontStyle: "bold" } },
            { content: String(balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"), styles: { fontStyle: "bold" } },
            { content: "", styles: { fontStyle: "bold" } }
        ]);
        doc.addPage();
        drawHeader(doc, "WEEKLY PAYMENT STATEMENT");
        const baseY = 110;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("PAYMENT RECEIVED", 22, baseY - 25);
        autoTable(doc, {
            head: paymentsHeaders,
            body: paymentsData,
            startY: baseY - 20,
            margin: { left: 20 },
            tableWidth: 210,
            theme: "grid",
            styles: { fontSize: 8, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5 },
            headStyles: { textColor: [0, 0, 0], fillColor: [255, 230, 230], lineColor: [0, 0, 0], lineWidth: 1, fontStyle: 'bold' },
            bodyStyles: { fontStyle: 'bold' },
            columnStyles: {
                1: { halign: 'right' }
            },
            didDrawPage: () => {
                drawHeader(doc);
            }
        });
        const paymentReceivedTable = doc.lastAutoTable;
        const handoverStartY = paymentReceivedTable && paymentReceivedTable.finalY ? paymentReceivedTable.finalY + 20 : baseY + 250;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("HANDOVER DETAILS", 22, handoverStartY - 5);
        autoTable(doc, {
            head: [["DATE RETURNED", "AMOUNT"]],
            body: [
                ["", ""],
                ["RETURNED", "0"]
            ],
            startY: handoverStartY,
            margin: { left: 22 },
            tableWidth: 200,
            theme: "grid",
            styles: { fontSize: 8, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5 },
            headStyles: { textColor: [0, 0, 0], fillColor: [255, 230, 230], lineColor: [0, 0, 0], lineWidth: 1, fontStyle: 'bold' },
            bodyStyles: { fontStyle: 'bold' },
            columnStyles: {
                1: { halign: 'right' }
            },
            didDrawPage: () => {
                drawHeader(doc);
            }
        });
        const dividerX = 260;
        const headerBottomY = 65;
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(dividerX, headerBottomY, dividerX, pageHeight - 0);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        const dailyExpenses = expenses.filter(expense => expense.type === "Daily");
        const dailyExpenseData = dailyExpenses.map(expense => [
            String(expense.date ? formatDateOnly(expense.date) : ""),
            String(Number(expense.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
        ]);
        const dailyExpensesTotal = dailyExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
        if (dailyExpenseData.length === 0) {
            dailyExpenseData.push(["No Daily Expenses", "0.00"]);
        }
        autoTable(doc, {
            head: [["DAILY WAGE", "AMOUNT"]],
            body: dailyExpenseData,
            startY: baseY + 210,
            margin: { left: 300 },
            tableWidth: 200,
            theme: "grid",
            styles: {
                fontSize: 8,
                cellPadding: 3,
                textColor: [0, 0, 0],
                lineColor: [0, 0, 0],
                lineWidth: 0.5
            },
            headStyles: {
                textColor: [0, 0, 0],
                fillColor: [255, 230, 230],
                lineColor: [0, 0, 0],
                lineWidth: 1,
                fontStyle: 'bold',
                halign: 'left'
            },
            bodyStyles: {
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { halign: 'left' },
                1: { halign: 'right' }
            },
            didDrawPage: () => {
                drawHeader(doc);
            }
        });
        const dailyWageTable = doc.lastAutoTable;
        if (dailyWageTable) {
            const boxY = dailyWageTable.finalY + 2;
            const boxX = 300;
            const boxWidth = 200;
            const boxHeight = 20;
            const splitX = boxX + 114;
            doc.rect(boxX, boxY, boxWidth, boxHeight);
            doc.line(splitX, boxY, splitX, boxY + boxHeight);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("TOTAL", boxX + 10, boxY + 13);
            doc.text(
                String(dailyExpensesTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })),
                boxX + boxWidth - 10,
                boxY + 13,
                { align: "right" }
            );
        }
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("EXPENDITURE PAYMENTS", 300, baseY - 25);
        const summaryMap = weeklyTypes.reduce((acc, typeObj) => {
            acc[typeObj.type] = { count: 0, total: 0 };
            return acc;
        }, {});
        const allExpenseTypes = [...new Set(
            expenses
                .filter(expense => expense.type)
                .map(e => e.type)
                .filter(Boolean)
        )];
        const fixedTypes = weeklyTypes.map(typeObj => typeObj.type);
        allExpenseTypes.forEach(type => {
            if (!fixedTypes.includes(type)) {
                summaryMap[type] = { count: 0, total: 0 };
            }
        });
        expenses
            .filter(expense => Number(expense.amount) > 0)
            .forEach(expense => {
                const type = expense.type;
                const amount = Number(expense.amount);
                if (summaryMap[type]) {
                    summaryMap[type].count += 1;
                    if (type !== "Staff Advance" && type !== "Loan") {
                        summaryMap[type].total += amount;
                    }
                }
            });
        if (summaryMap["Staff Advance"]) {
            summaryMap["Staff Advance"].total = staffAdvanceTotalFromPortal;
        }
        if (summaryMap["Loan"]) {
            summaryMap["Loan"].total = loanTotalFromPortal;
        }
        const summaryData = Object.entries(summaryMap)
            .map(([type, { count, total }]) => [
                String(type || ""),
                String(Number(total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"),
                count,
                total
            ])
            .sort((a, b) => {
                const totalA = Number(a[3]);
                const totalB = Number(b[3]);
                if (totalA === 0 && totalB === 0) {
                    return a[0].localeCompare(b[0]);
                } else if (totalA === 0) {
                    return 1;
                } else if (totalB === 0) {
                    return -1;
                } else {
                    return totalB - totalA;
                }
            })
            .map(([type, formattedTotal, count, originalTotal]) => [
                type,
                formattedTotal,
                count
            ]);
        autoTable(doc, {
            head: [["SUMMARY", "TOTAL"]],
            body: summaryData.map(r => [String(r[0] || ""), String(r[1] || "0")]),
            startY: baseY - 20,
            margin: { left: 300 },
            tableWidth: 200,
            theme: "grid",
            styles: { fontSize: 9, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5 },
            headStyles: { textColor: [0, 0, 0], fillColor: [255, 230, 230], lineColor: [0, 0, 0], lineWidth: 1, fontStyle: 'bold' },
            bodyStyles: { fontStyle: 'bold' },
            columnStyles: {
                1: { halign: 'right' }
            },
            didDrawPage: () => {
                drawHeader(doc);
            },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index === 0 && data.row && data.row.index !== undefined) {
                    const rowData = summaryData[data.row.index];
                    if (rowData && rowData[2] !== undefined) {
                        const count = rowData[2];
                        if (data.cell && typeof data.cell.x === 'number' && typeof data.cell.y === 'number' && typeof data.cell.height === 'number') {
                            const textX = data.cell.x - 3;
                            const textY = data.cell.y + data.cell.height / 2 + 2;
                            doc.setFontSize(9);
                            doc.text(String(count || "0"), textX, textY, { align: 'right' });
                        }
                    }
                }
            }
        });
        const summaryTable = doc.lastAutoTable;
        if (summaryTable && summaryTable.body && Array.isArray(summaryTable.body)) {
            summaryData.forEach((row, i) => {
                const count = row[2];
                if (count > 1 && summaryTable.body[i] && typeof summaryTable.body[i].y === 'number') {
                    const rowY = summaryTable.body[i].y + 6;
                    const leftX = (summaryTable.settings && summaryTable.settings.margin && summaryTable.settings.margin.left) ? summaryTable.settings.margin.left - 15 : 285;
                    doc.setFontSize(9);
                    doc.text(String(count || ""), leftX, rowY, { align: "right" });
                }
            });
        }
        const summaryTotal = summaryData.reduce((acc, row) => acc + Number(String(row[1] || "0").replace(/,/g, "")), 0);
        const summaryBoxY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 15 : baseY + 100;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.rect(300, summaryBoxY - 12, 200, 20);
        const splitX = 420;
        doc.line(splitX, summaryBoxY - 12, splitX, summaryBoxY + 8);
        doc.text("TOTAL", 310, summaryBoxY + 3);
        doc.text(
            String(summaryTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"),
            490,
            summaryBoxY + 3,
            { align: "right" }
        );
        const newTableX = 520;
        let newTableY = baseY;
        const staffAdvanceEntries = expenses.filter(e => e.type === "Staff Advance");
        if (staffAdvanceEntries.length > 0) {
            const staffAdvanceCount = staffAdvanceEntries.length;
            const staffAdvanceTotal = staffAdvanceEntries.reduce((sum, e) => sum + Number(e.amount || 0), 0);
            const staffAdvanceY = newTableY + 10;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("STAFF ADVANCE", newTableX, staffAdvanceY - 25);
            const staffAdvanceHead = [[
                String(staffAdvanceCount || "0"),
                "PARTY",
                "PROJECT NAME",
                String(staffAdvanceTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
            ]];
            const staffAdvanceBody = staffAdvanceEntries.map(e => [
                String(e.date ? formatDateOnly(e.date) : ""),
                String(getPartyDisplayName(e) || ""),
                String(siteOptions.find(opt => opt.id === Number(e.project_id))?.label || ""),
                String(Number(e.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
            ]);
            autoTable(doc, {
                head: staffAdvanceHead,
                body: staffAdvanceBody,
                startY: staffAdvanceY - 20,
                margin: { left: newTableX },
                tableWidth: 310,
                theme: "grid",
                styles: { fontSize: 8, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5 },
                headStyles: { textColor: [0, 0, 0], fillColor: [255, 230, 230], lineColor: [0, 0, 0], lineWidth: 1, fontStyle: 'bold' },
                bodyStyles: { fontStyle: 'bold' },
                columnStyles: {
                    3: { halign: 'right' }
                },
                didParseCell: (data) => {
                    if (data.section === 'head' && data.column.index === 3) {
                        data.cell.styles.halign = 'right';
                    }
                },
                didDrawPage: () => {
                    drawHeader(doc);
                }
            });
            newTableY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : newTableY + 50;
        }
        const staffSalaryEntries = expenses.filter(e => e.type === "Staff Salary");
        if (staffSalaryEntries.length > 0) {
            const staffSalaryCount = staffSalaryEntries.length;
            const staffSalaryTotal = staffSalaryEntries.reduce((sum, e) => sum + Number(e.amount || 0), 0);
            const staffSalaryY = newTableY + 30;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("STAFF SALARY", newTableX, staffSalaryY - 25);
            const staffSalaryHead = [[
                String(staffSalaryCount || "0"),
                "PARTY",
                "PROJECT NAME",
                String(staffSalaryTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
            ]];
            const staffSalaryBody = staffSalaryEntries.map(e => [
                String(e.date ? formatDateOnly(e.date) : ""),
                String(getPartyDisplayName(e) || ""),
                String(siteOptions.find(opt => opt.id === Number(e.project_id))?.label || ""),
                String(Number(e.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
            ]);
            autoTable(doc, {
                head: staffSalaryHead,
                body: staffSalaryBody,
                startY: staffSalaryY - 20,
                margin: { left: newTableX },
                tableWidth: 310,
                theme: "grid",
                styles: { fontSize: 8, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5 },
                headStyles: { textColor: [0, 0, 0], fillColor: [255, 230, 230], lineColor: [0, 0, 0], lineWidth: 1, fontStyle: 'bold' },
                bodyStyles: { fontStyle: 'bold' },
                columnStyles: {
                    3: { halign: 'right' }
                },
                didParseCell: (data) => {
                    if (data.section === 'head' && data.column.index === 3) {
                        data.cell.styles.halign = 'right';
                    }
                },
                didDrawPage: () => {
                    drawHeader(doc);
                }
            });
            newTableY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : newTableY + 50;
        }
        const excludedTypes = ["Bill", "Wage", "Project Advance", "Staff Advance", "Staff Salary", "Daily", "Diwali Bonus"];
        const otherExpenseTypes = [...new Set(expenses.map(e => e.type).filter(type => type && !excludedTypes.includes(type)))];
        otherExpenseTypes.forEach((expenseType) => {
            const typeEntries = expenses.filter(e => e.type === expenseType);
            if (typeEntries.length === 0) return;
            const typeCount = typeEntries.length;
            const typeTotal = typeEntries.reduce((sum, e) => sum + Number(e.amount || 0), 0);
            const typeY = newTableY + 30;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(expenseType.toUpperCase(), newTableX, typeY - 25);
            const typeHead = [[
                String(typeCount || "0"),
                "PARTY",
                "PROJECT NAME",
                String(typeTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
            ]];
            const typeBody = typeEntries.map(e => [
                String(e.date ? formatDateOnly(e.date) : ""),
                String(getPartyDisplayName(e) || ""),
                String(siteOptions.find(opt => opt.id === Number(e.project_id))?.label || ""),
                String(Number(e.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
            ]);
            if (newTableY > doc.internal.pageSize.getHeight() - 150) {
                doc.addPage();
                drawHeader(doc, "WEEKLY PAYMENT STATEMENT");
                newTableY = baseY;
            }
            autoTable(doc, {
                head: typeHead,
                body: typeBody,
                startY: typeY - 20,
                margin: { left: newTableX },
                tableWidth: 310,
                theme: "grid",
                styles: { fontSize: 8, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5 },
                headStyles: { textColor: [0, 0, 0], fillColor: [255, 230, 230], lineColor: [0, 0, 0], lineWidth: 1, fontStyle: 'bold' },
                bodyStyles: { fontStyle: 'bold' },
                columnStyles: {
                    3: { halign: 'right' }
                },
                didParseCell: (data) => {
                    if (data.section === 'head' && data.column.index === 3) {
                        data.cell.styles.halign = 'right';
                    }
                },
                didDrawPage: () => {
                    drawHeader(doc, "WEEKLY PAYMENT STATEMENT");
                }
            });
            newTableY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : newTableY + 50;
        });
        const diwaliBonusEntries = expenses.filter(e => e.type === "Diwali Bonus");
        if (diwaliBonusEntries.length > 0) {
            const diwaliBonusCount = diwaliBonusEntries.length;
            const diwaliBonusTotal = diwaliBonusEntries.reduce((sum, e) => sum + Number(e.amount || 0), 0);
            const diwaliBonusY = newTableY + 30;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("DIWALI BONUS", newTableX, diwaliBonusY - 25);
            const diwaliBonusHead = [[
                String(diwaliBonusCount || "0"),
                "PARTY",
                "AMOUNT",
                String(diwaliBonusTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
            ]];
            const diwaliBonusBody = diwaliBonusEntries.map(e => [
                String(e.date ? formatDateOnly(e.date) : ""),
                String(getPartyDisplayName(e) || ""),
                String(Number(e.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"),
                ""
            ]);
            autoTable(doc, {
                head: diwaliBonusHead,
                body: diwaliBonusBody,
                startY: diwaliBonusY - 20,
                margin: { left: newTableX },
                tableWidth: 310,
                theme: "grid",
                styles: { fontSize: 8, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5 },
                headStyles: { textColor: [0, 0, 0], fillColor: [255, 230, 230], lineColor: [0, 0, 0], lineWidth: 1, fontStyle: 'bold' },
                bodyStyles: { fontStyle: 'bold' },
                columnStyles: {
                    2: { halign: 'right' },
                    3: { halign: 'right' }
                },
                didParseCell: (data) => {
                    if (data.section === 'head' && data.column.index === 3) {
                        data.cell.styles.halign = 'right';
                    }
                },
                didDrawPage: () => {
                    drawHeader(doc);
                }
            });
            newTableY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : newTableY + 50;
        }
        const lastPeriodEndDate = expenses
            .map(exp => exp.period_end_date)
            .filter(Boolean)
            .pop();
        newTableY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : newTableY + 50;
        doc.save(`PR ${currentWeekNumber || ""} - Weekly Payment Report ${formatDateOnly(lastPeriodEndDate)}.pdf`);
    };
    return (
        <div>
            <div className="mt-[-28px] flex justify-end mr-5">
                <h1 className="font-bold text-xl">
                    Balance: <span style={{ color: "#E4572E" }}>
                        {(balance - (Number(newExpense.amount) || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2, })}
                    </span>
                </h1>
            </div>
            <div className="mx-auto w-auto p-6 bg-white ml-[30px] mr-6 rounded-md border border-transparent">
                <div className="flex justify-between">
                    <div className="text-left">
                        <button onClick={() => setShowFilters(!showFilters)}>
                            <img
                                src={Filter}
                                alt="Toggle Filter"
                                className="w-7 h-7 border border-[#BF9853] rounded-md mb-3"
                            />
                        </button>
                    </div>
                    <div className="-mt-4justify-end mr-6">
                        {(username === 'Admin' || username === 'Mahalingam M') && (
                            <button className="font-semibold text-lg cursor-pointer flex items-center gap-2" onClick={generatePDF}>
                                Report
                                <img className='w-6 h-5' src={download} alt="Download" />
                            </button>
                        )}
                    </div>
                </div>
                <div className="w-full flex flex-col xl:flex-row gap-6">
                    <div className="flex-[3] min-w-0">
                        <div className="flex justify-between">
                            <h1 className="font-bold text-xl">PS: {currentWeekNumber ?? "-"}</h1>
                            <h1 className="font-bold text-base">
                                Expenses: <span style={{ color: "#E4572E" }}>
                                    {Number(totalExpenses).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </h1>
                        </div>
                        <div className={`text-left flex ${selectDate || selectContractororVendorName || selectProjectName || selectType
                            ? 'flex-col sm:flex-row sm:justify-between'
                            : 'flex-row justify-between items-center'
                            } mb-3 gap-2`}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                                {(selectDate || selectContractororVendorName || selectProjectName || selectType) && (
                                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-2 sm:mt-0">
                                        {selectDate && (
                                            <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium w-fit">
                                                <span className="font-normal">Date: </span>
                                                <span className="font-bold">{selectDate}</span>
                                                <button onClick={() => setSelectDate('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                            </span>
                                        )}
                                        {selectContractororVendorName && (
                                            <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                                <span className="font-normal">
                                                    {isClientToggleActive ? 'Client Name:' : 'Contractor/Vendor Name:'}
                                                </span>
                                                <span className="font-bold">{selectContractororVendorName}</span>
                                                <button onClick={() => setSelectContractororVendorName('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectProjectName && (
                                            <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                                <span className="font-normal">Project Name:</span>
                                                <span className="font-bold">{selectProjectName}</span>
                                                <button onClick={() => setSelectProjectName('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectType && (
                                            <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                                <span className="font-normal">Type: </span>
                                                <span className="font-bold">{selectType}</span>
                                                <button onClick={() => setSelectType('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="w-full h-[600px] rounded-lg border-l-8 border-l-[#BF9853] overflow-hidden">
                            <div ref={scrollRef} className="overflow-auto max-h-[600px] thin-scrollbar"
                                onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
                            >
                                <table className="w-[1320px] border-collapse text-left">
                                    <thead className="sticky top-0 z-10 bg-white">
                                        <tr className="bg-[#FAF6ED]">
                                            <th className="pt-2 pl-2 w-[60px] font-bold text-left">S.No</th>
                                            <th className="pt-2 w-[135px] font-bold text-left cursor-pointer hover:bg-gray-200" onClick={() => handleSort('date')}>
                                                Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="px-1 w-[200px] font-bold text-left cursor-pointer hover:bg-gray-200" onClick={() => handleSort('contractor_vendor')}>
                                                <div className="flex items-center gap-2">
                                                    <span>{isClientToggleActive ? 'Client Name' : 'Contractor/Vendor/Employee'}</span>
                                                    {sortConfig.key === 'contractor_vendor' && (
                                                        <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                                                    )}
                                                </div>
                                            </th>
                                            <th className="px-1 w-[240px] font-bold text-left cursor-pointer hover:bg-gray-200" onClick={() => handleSort('project_name')}>
                                                Project Name {sortConfig.key === 'project_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="px-1 w-[100px] font-bold text-left cursor-pointer hover:bg-gray-200" onClick={() => handleSort('type')}>
                                                Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="px-1 w-[110px] font-bold text-left">Amount</th>
                                            <th className="px-1 w-[120px] font-bold text-left">Activity</th>
                                        </tr>
                                        {showFilters && (
                                            <tr className="bg-[#FAF6ED] border-b border-gray-200">
                                                <th className="pt-2 pb-2 w-[60px]"></th>
                                                <th className="pt-2 pb-2 w-[140px]">
                                                    <input
                                                        type="date"
                                                        value={selectDate}
                                                        onChange={(e) => setSelectDate(e.target.value)}
                                                        className="p-1 rounded-md bg-transparent w-[140px] border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none"
                                                        placeholder="Search Date..."
                                                    />
                                                </th>
                                                <th className="pt-2 pb-2 w-[200px]">
                                                    <Select
                                                        options={partyFilterOptions}
                                                        value={selectContractororVendorName ? { value: selectContractororVendorName, label: selectContractororVendorName } : null}
                                                        onChange={(opt) => setSelectContractororVendorName(opt ? opt.value : "")}
                                                        className="text-xs focus:outline-none"
                                                        placeholder={isClientToggleActive ? "Client Name..." : "Contractor/Ven..."}
                                                        isSearchable
                                                        isClearable
                                                        styles={{
                                                            control: (provided, state) => ({
                                                                ...provided,
                                                                backgroundColor: 'transparent',
                                                                width: '200px',
                                                                maxWidth: '200px',
                                                                minWidth: '200px',
                                                                borderWidth: '3px',
                                                                borderColor: state.isFocused
                                                                    ? 'rgba(191, 152, 83, 0.2)'
                                                                    : 'rgba(191, 152, 83, 0.2)',
                                                                borderRadius: '6px',
                                                                boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                                                '&:hover': {
                                                                    borderColor: 'rgba(191, 152, 83, 0.2)',
                                                                },
                                                            }),
                                                            placeholder: (provided) => ({
                                                                ...provided,
                                                                color: '#999',
                                                                textAlign: 'left',
                                                            }),
                                                            menu: (provided) => ({
                                                                ...provided,
                                                                zIndex: 9,
                                                            }),
                                                            option: (provided, state) => ({
                                                                ...provided,
                                                                textAlign: 'left',
                                                                fontWeight: 'normal',
                                                                fontSize: '15px',
                                                                backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                                color: 'black',
                                                            }),
                                                            valueContainer: (provided) => ({
                                                                ...provided,
                                                                maxWidth: '160px',
                                                                overflow: 'hidden',
                                                            }),
                                                            singleValue: (provided) => ({
                                                                ...provided,
                                                                textAlign: 'left',
                                                                fontWeight: 'normal',
                                                                color: 'black',
                                                                maxWidth: '100%',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                            }),
                                                            indicatorSeparator: () => ({
                                                                display: 'none'
                                                            }),
                                                            indicatorsContainer: (provided) => ({
                                                                ...provided,
                                                                height: '40px',
                                                                gap: '0px'
                                                            }),
                                                            clearIndicator: (provided) => ({
                                                                ...provided,
                                                                padding: '2px'
                                                            }),
                                                            dropdownIndicator: (provided) => ({
                                                                ...provided,
                                                                padding: '2px'
                                                            })
                                                        }}
                                                    />
                                                </th>
                                                <th className="pt-2 pb-2 w-[240px]">
                                                    <Select
                                                        options={projectFilterOptions}
                                                        value={selectProjectName ? { value: selectProjectName, label: selectProjectName } : null}
                                                        onChange={(opt) => setSelectProjectName(opt ? opt.value : "")}
                                                        className="focus:outline-none text-xs"
                                                        placeholder="Project Name..."
                                                        isSearchable
                                                        isClearable
                                                        styles={{
                                                            control: (provided, state) => ({
                                                                ...provided,
                                                                backgroundColor: 'transparent',
                                                                borderWidth: '3px',
                                                                borderColor: state.isFocused
                                                                    ? 'rgba(191, 152, 83, 0.2)'
                                                                    : 'rgba(191, 152, 83, 0.2)',
                                                                borderRadius: '6px',
                                                                boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                                                '&:hover': {
                                                                    borderColor: 'rgba(191, 152, 83, 0.2)',
                                                                },
                                                            }),
                                                            placeholder: (provided) => ({
                                                                ...provided,
                                                                color: '#999',
                                                                textAlign: 'left',
                                                            }),
                                                            menu: (provided) => ({
                                                                ...provided,
                                                                zIndex: 9,
                                                            }),
                                                            option: (provided, state) => ({
                                                                ...provided,
                                                                textAlign: 'left',
                                                                fontWeight: 'normal',
                                                                fontSize: '15px',
                                                                backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                                color: 'black',
                                                            }),
                                                            singleValue: (provided) => ({
                                                                ...provided,
                                                                textAlign: 'left',
                                                                fontWeight: 'normal',
                                                                color: 'black',
                                                            }),
                                                            indicatorSeparator: () => ({
                                                                display: 'none'
                                                            }),
                                                            indicatorsContainer: (provided) => ({
                                                                ...provided,
                                                                height: '40px',
                                                                gap: '0px'
                                                            }),
                                                            clearIndicator: (provided) => ({
                                                                ...provided,
                                                                padding: '2px'
                                                            }),
                                                            dropdownIndicator: (provided) => ({
                                                                ...provided,
                                                                padding: '2px'
                                                            })
                                                        }}
                                                    />
                                                </th>
                                                <th className="pt-2 pb-2 w-[100px]">
                                                    <select
                                                        value={selectType}
                                                        onChange={(e) => setSelectType(e.target.value)}
                                                        className="p-1 rounded-md bg-transparent w-[120px] h-[42px] font-normal border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none text-xs"
                                                        placeholder="Type..."
                                                    >
                                                        <option value=''>Select Type...</option>
                                                        {weeklyTypes.filter(type => type.type !== "Staff Advance").map((type, index) => (
                                                            <option key={index} value={type.type}>
                                                                {type.type}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </th>
                                                <th className="pt-2 pb-2 w-[110px]"></th>
                                                <th className="pt-2 pb-2 w-[120px]">
                                                    <button
                                                        onClick={clearFilters}
                                                        className="px-3 py-1.5 bg-[#BF9853] text-white rounded-lg hover:bg-[#A68B4A] transition-colors text-sm font-semibold"
                                                        title="Clear all filters"
                                                    >
                                                        Clear
                                                    </button>
                                                </th>
                                            </tr>
                                        )}
                                        <tr className="bg-white border-b border-gray-200">
                                            <td className="pt-2 pb-2 w-[60px] font-bold">{expenses.length + 1}.</td>
                                            <td className="pt-2 pb-2 w-[135px]">
                                                <input
                                                    type="date"
                                                    name="date"
                                                    className="p-1 rounded-md bg-transparent w-[135px] border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none"
                                                    value={newExpense.date}
                                                    onChange={handleExpenseChange}
                                                    onKeyDown={handleKeyDownExpense}
                                                    disabled={isSubmitting}
                                                />
                                            </td>
                                            <td className="pt-2 pb-2 w-[200px]">
                                                <div className="flex items-center gap-2 w-full">
                                                    <Select
                                                        name="party"
                                                        isDisabled={isSubmitting}
                                                        value={isClientToggleActive
                                                            ? (selectedClient || null)
                                                            : (selectedContractor || selectedVendor || selectedEmployee || null)}
                                                        onChange={(selectedOption) => {
                                                            if (newExpense.type === "Staff Advance") {
                                                                if (selectedOption && (selectedOption.type === "Contractor" || selectedOption.type === "Vendor")) {
                                                                    alert("Staff Advance type only allows Employee. Please select an Employee.");
                                                                    return;
                                                                }
                                                            }
                                                            if (newExpense.type === "Project Advance") {
                                                                if (selectedOption && selectedOption.type === "Employee") {
                                                                    alert("Project Advance type only allows Contractor or Vendor. Please select a Contractor or Vendor.");
                                                                    return;
                                                                }
                                                            }
                                                            if (isClientToggleActive) {
                                                                if (selectedOption) {
                                                                    const clientKey = selectedOption?.compositeKey || buildClientKey(selectedOption.label, selectedOption.fatherName, selectedOption.mobile);
                                                                    const projectsForClient = selectedOption?.projects || (clientKey ? (clientProjectMap[clientKey]?.projects || []) : []);
                                                                    setClientProjectOptions(projectsForClient);
                                                                    if (projectsForClient.length === 1) {
                                                                        setSelectedProjectName(projectsForClient[0]);
                                                                    } else if (projectsForClient.length === 0) {
                                                                        setSelectedProjectName(null);
                                                                    } else {
                                                                        setSelectedProjectName((prevProject) =>
                                                                            projectsForClient.find((proj) => String(proj.id) === String(prevProject?.id)) || null
                                                                        );
                                                                    }
                                                                    setSelectedClient(selectedOption);
                                                                    setNewExpense((prev) => ({
                                                                        ...prev,
                                                                        client_name: selectedOption.label,
                                                                        client_id: selectedOption.clientId || selectedOption.id || "",
                                                                    }));
                                                                } else {
                                                                    setSelectedClient(null);
                                                                    setClientProjectOptions([]);
                                                                    setSelectedProjectName(null);
                                                                    setNewExpense((prev) => ({
                                                                        ...prev,
                                                                        client_name: "",
                                                                        client_id: "",
                                                                    }));
                                                                }
                                                                setSelectedContractor(null);
                                                                setSelectedVendor(null);
                                                                setSelectedEmployee(null);
                                                                return;
                                                            }
                                                            if (!selectedOption) {
                                                                setSelectedContractor(null);
                                                                setSelectedVendor(null);
                                                                setSelectedEmployee(null);
                                                            } else if (selectedOption.type === "Contractor") {
                                                                setSelectedContractor(selectedOption);
                                                                setSelectedVendor(null);
                                                                setSelectedEmployee(null);
                                                            } else if (selectedOption.type === "Vendor") {
                                                                setSelectedVendor(selectedOption);
                                                                setSelectedContractor(null);
                                                                setSelectedEmployee(null);
                                                            } else if (selectedOption.type === "Employee") {
                                                                setSelectedVendor(null);
                                                                setSelectedContractor(null);
                                                                setSelectedEmployee(selectedOption);
                                                            }
                                                            setSelectedClient(null);
                                                            setClientProjectOptions([]);
                                                            setNewExpense((prev) => ({
                                                                ...prev,
                                                                client_name: "",
                                                                client_id: "",
                                                            }));
                                                        }}
                                                        options={isClientToggleActive ? clientOptions : combinedOptions}
                                                        placeholder={isClientToggleActive ? "Client Name" : "Contractor/Ven..."}
                                                        isSearchable
                                                        isClearable
                                                        menuPortalTarget={document.body}
                                                        styles={{
                                                            control: (provided, state) => ({
                                                                ...provided,
                                                                backgroundColor: 'transparent',
                                                                width: '260px',
                                                                maxWidth: '260px',
                                                                minWidth: '260px',
                                                                borderWidth: '3px',
                                                                borderColor: state.isFocused
                                                                    ? 'rgba(191, 152, 83, 0.2)'
                                                                    : 'rgba(191, 152, 83, 0.2)',
                                                                borderRadius: '6px',
                                                                boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                                                '&:hover': {
                                                                    borderColor: 'rgba(191, 152, 83, 0.2)',
                                                                },
                                                            }),
                                                            placeholder: (provided) => ({
                                                                ...provided,
                                                                color: '#999',
                                                                textAlign: 'left',
                                                            }),
                                                            menu: (provided) => ({
                                                                ...provided,
                                                                zIndex: 9,
                                                            }),
                                                            option: (provided, state) => ({
                                                                ...provided,
                                                                textAlign: 'left',
                                                                fontWeight: 'normal',
                                                                fontSize: '15px',
                                                                backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                                color: 'black',
                                                            }),
                                                            valueContainer: (provided) => ({
                                                                ...provided,
                                                                maxWidth: '210px',
                                                                overflow: 'hidden',
                                                            }),
                                                            singleValue: (provided) => ({
                                                                ...provided,
                                                                textAlign: 'left',
                                                                fontWeight: 'normal',
                                                                color: 'black',
                                                                maxWidth: '100%',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                            }),
                                                            indicatorSeparator: () => ({
                                                                display: 'none'
                                                            }),
                                                            indicatorsContainer: (provided) => ({
                                                                ...provided,
                                                                height: '40px',
                                                                gap: '0px'
                                                            }),
                                                            clearIndicator: (provided) => ({
                                                                ...provided,
                                                                padding: '2px'
                                                            }),
                                                            dropdownIndicator: (provided) => ({
                                                                ...provided,
                                                                padding: '2px'
                                                            })
                                                        }}
                                                    />
                                                    <button type="button" onClick={handlePartySourceToggle} disabled={isSubmitting} >
                                                        <img
                                                            src={Change}
                                                            className={`w-4 h-4 ${isClientToggleActive ? 'opacity-100' : 'opacity-60'} ${isSubmitting ? 'opacity-40' : ''}`}
                                                            alt="Toggle party type"
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="pt-2 pb-2 w-[240px]">
                                                <Select
                                                    name="project"
                                                    isDisabled={isSubmitting}
                                                    value={selectedProjectName}
                                                    onChange={(selectedOption) => {
                                                        setSelectedProjectName(selectedOption);
                                                    }}
                                                    options={(isClientToggleActive && clientProjectOptions.length > 0) ? clientProjectOptions : siteOptions}
                                                    placeholder={isClientToggleActive ? "Client Project..." : "Project Name..."}
                                                    isClearable
                                                    isSearchable
                                                    menuPortalTarget={document.body}
                                                    styles={{
                                                        control: (provided, state) => ({
                                                            ...provided,
                                                            backgroundColor: 'transparent',
                                                            borderWidth: '3px',
                                                            borderColor: state.isFocused
                                                                ? 'rgba(191, 152, 83, 0.2)'
                                                                : 'rgba(191, 152, 83, 0.2)',
                                                            borderRadius: '6px',
                                                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                                            '&:hover': {
                                                                borderColor: 'rgba(191, 152, 83, 0.2)',
                                                            },
                                                        }),
                                                        placeholder: (provided) => ({
                                                            ...provided,
                                                            color: '#999',
                                                            textAlign: 'left',
                                                        }),
                                                        menu: (provided) => ({
                                                            ...provided,
                                                            zIndex: 9,
                                                        }),
                                                        option: (provided, state) => ({
                                                            ...provided,
                                                            textAlign: 'left',
                                                            fontWeight: 'normal',
                                                            fontSize: '15px',
                                                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                            color: 'black',
                                                        }),
                                                        singleValue: (provided) => ({
                                                            ...provided,
                                                            textAlign: 'left',
                                                            fontWeight: 'normal',
                                                            color: 'black',
                                                        }),
                                                        indicatorSeparator: () => ({
                                                            display: 'none'
                                                        }),
                                                        indicatorsContainer: (provided) => ({
                                                            ...provided,
                                                            height: '40px',
                                                            gap: '0px'
                                                        }),
                                                        clearIndicator: (provided) => ({
                                                            ...provided,
                                                            padding: '2px'
                                                        }),
                                                        dropdownIndicator: (provided) => ({
                                                            ...provided,
                                                            padding: '2px'
                                                        })
                                                    }}
                                                />
                                            </td>
                                            <td className="pt-2 pb-2 w-[100px]">
                                                <select
                                                    name="type"
                                                    className="p-1 rounded-md bg-transparent w-[120px] h-[42px] font-normal border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none"
                                                    value={newExpense.type}
                                                    onChange={handleExpenseChange}
                                                    onKeyDown={handleKeyDownExpense}
                                                    disabled={isSubmitting}
                                                >
                                                    <option value="">Select Type...</option>
                                                    {weeklyTypes.map((type, index) => (
                                                        <option key={index} value={type.type}>
                                                            {type.type}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="pt-2 pb-2 w-[110px]">
                                                <input
                                                    type="number"
                                                    name="amount"
                                                    className="p-1 rounded-md bg-transparent w-[80px] h-[42px] font-normal border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none no-spinner"
                                                    value={newExpense.amount}
                                                    onChange={handleExpenseChange}
                                                    onKeyDown={handleKeyDownExpense}
                                                    disabled={isSubmitting || !newExpense.date || !selectedProjectName}
                                                    min="0"
                                                    step="any"
                                                />
                                            </td>
                                            <td className="pt-2 pb-2 w-[120px]"></td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedExpenses.length > 0 ? (
                                            sortedExpenses.map((row, index) => (
                                                <tr key={row.id} className="odd:bg-white even:bg-[#FAF6ED]">
                                                    <td className="text-sm text-left p-2 w-[60px] font-semibold">{expenses.length - index}</td>
                                                    <td className="text-sm text-left p-2 w-[140px] font-semibold">
                                                        {editingRowId === row.id ? (
                                                            <input
                                                                type="date"
                                                                name="date"
                                                                className="p-1 rounded-md bg-transparent w-[120px] border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none"
                                                                value={editFormData.date}
                                                                onChange={handleEditChange}
                                                            />
                                                        ) : (
                                                            formatDateOnly(row.date) || ""
                                                        )}
                                                    </td>
                                                    <td className="text-sm text-left w-[200px] font-semibold">
                                                        {editingRowId === row.id ? (
                                                            <Select
                                                                name="party"
                                                                value={
                                                                    ((isClientToggleActive || (!row.contractor_id && !row.vendor_id && !row.employee_id)) && ["Loan", "Bank", "Claim"].includes(editFormData.type))
                                                                        ? getClientOption(editFormData.client_id, editFormData.client_name || getClientName(row))
                                                                        : combinedOptions.find(
                                                                            opt =>
                                                                                (opt.type === "Contractor" && opt.id === Number(editFormData.contractor_id)) ||
                                                                                (opt.type === "Vendor" && opt.id === Number(editFormData.vendor_id)) ||
                                                                                (opt.type === "Employee" && opt.id === Number(editFormData.employee_id))
                                                                        ) || null
                                                                }
                                                                onChange={(selectedOption) => {
                                                                    if (editFormData.type === "Staff Advance") {
                                                                        if (selectedOption && (selectedOption.type === "Contractor" || selectedOption.type === "Vendor")) {
                                                                            alert("Staff Advance type only allows Employee. Please select an Employee.");
                                                                            return;
                                                                        }
                                                                    }
                                                                    if (editFormData.type === "Project Advance") {
                                                                        if (selectedOption && selectedOption.type === "Employee") {
                                                                            alert("Project Advance type only allows Contractor or Vendor. Please select a Contractor or Vendor.");
                                                                            return;
                                                                        }
                                                                    }
                                                                    const forceClientMode = !row.contractor_id && !row.vendor_id && !row.employee_id;
                                                                    const allowedTypesForClient = ["Loan", "Bank", "Claim"];
                                                                    const isClientTypeAllowed = allowedTypesForClient.includes(editFormData.type);
                                                                    if (isClientToggleActive || forceClientMode) {
                                                                        if (!isClientTypeAllowed) {
                                                                            alert("Client name selection is only allowed for Loan, Bank, or Claim types.");
                                                                            return;
                                                                        }
                                                                        handleEditChange({ target: { name: "client_name", value: selectedOption ? selectedOption.label : "" } });
                                                                        handleEditChange({ target: { name: "client_id", value: selectedOption ? (selectedOption.clientId || selectedOption.id) : "" } });
                                                                        handleEditChange({ target: { name: "contractor_id", value: "" } });
                                                                        handleEditChange({ target: { name: "vendor_id", value: "" } });
                                                                        handleEditChange({ target: { name: "employee_id", value: "" } });
                                                                        return;
                                                                    }
                                                                    if (!selectedOption) {
                                                                        handleEditChange({ target: { name: "contractor_id", value: "" } });
                                                                        handleEditChange({ target: { name: "vendor_id", value: "" } });
                                                                        handleEditChange({ target: { name: "employee_id", value: "" } });
                                                                    } else if (selectedOption.type === "Contractor") {
                                                                        handleEditChange({ target: { name: "contractor_id", value: selectedOption.id } });
                                                                        handleEditChange({ target: { name: "vendor_id", value: "" } });
                                                                        handleEditChange({ target: { name: "employee_id", value: "" } });
                                                                    } else if (selectedOption.type === "Vendor") {
                                                                        handleEditChange({ target: { name: "vendor_id", value: selectedOption.id } });
                                                                        handleEditChange({ target: { name: "contractor_id", value: "" } });
                                                                        handleEditChange({ target: { name: "employee_id", value: "" } });
                                                                    } else if (selectedOption.type === "Employee") {
                                                                        handleEditChange({ target: { name: "employee_id", value: selectedOption.id } });
                                                                        handleEditChange({ target: { name: "contractor_id", value: "" } });
                                                                        handleEditChange({ target: { name: "vendor_id", value: "" } });
                                                                    }
                                                                    handleEditChange({ target: { name: "client_name", value: "" } });
                                                                    handleEditChange({ target: { name: "client_id", value: "" } });
                                                                }}
                                                                options={(isClientToggleActive || (!row.contractor_id && !row.vendor_id && !row.employee_id)) && ["Loan", "Bank", "Claim"].includes(editFormData.type) ? clientOptions : combinedOptions}
                                                                placeholder={(isClientToggleActive || (!row.contractor_id && !row.vendor_id && !row.employee_id)) && ["Loan", "Bank", "Claim"].includes(editFormData.type) ? "Client Name" : "Contractor/Ven..."}
                                                                isSearchable
                                                                isClearable
                                                                styles={{
                                                                    control: (provided, state) => ({
                                                                        ...provided,
                                                                        backgroundColor: 'transparent',
                                                                        width: '200px',
                                                                        maxWidth: '200px',
                                                                        minWidth: '200px',
                                                                        borderWidth: '3px',
                                                                        borderColor: state.isFocused
                                                                            ? 'rgba(191, 152, 83, 0.2)'
                                                                            : 'rgba(191, 152, 83, 0.2)',
                                                                        borderRadius: '6px',
                                                                        boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                                                        '&:hover': {
                                                                            borderColor: 'rgba(191, 152, 83, 0.2)',
                                                                        },
                                                                    }),
                                                                    placeholder: (provided) => ({
                                                                        ...provided,
                                                                        color: '#999',
                                                                        textAlign: 'left',
                                                                    }),
                                                                    menu: (provided) => ({
                                                                        ...provided,
                                                                        zIndex: 9,
                                                                    }),
                                                                    option: (provided, state) => ({
                                                                        ...provided,
                                                                        textAlign: 'left',
                                                                        fontWeight: 'normal',
                                                                        fontSize: '15px',
                                                                        backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                                        color: 'black',
                                                                    }),
                                                                    valueContainer: (provided) => ({
                                                                        ...provided,
                                                                        maxWidth: '160px',
                                                                        overflow: 'hidden',
                                                                    }),
                                                                    singleValue: (provided) => ({
                                                                        ...provided,
                                                                        textAlign: 'left',
                                                                        fontWeight: 'normal',
                                                                        color: 'black',
                                                                        maxWidth: '100%',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap',
                                                                    }),
                                                                    indicatorSeparator: () => ({
                                                                        display: 'none'
                                                                    }),
                                                                    indicatorsContainer: (provided) => ({
                                                                        ...provided,
                                                                        height: '40px',
                                                                        gap: '0px'
                                                                    }),
                                                                    clearIndicator: (provided) => ({
                                                                        ...provided,
                                                                        padding: '2px'
                                                                    }),
                                                                    dropdownIndicator: (provided) => ({
                                                                        ...provided,
                                                                        padding: '2px'
                                                                    })
                                                                }}
                                                            />
                                                        ) : (
                                                            (() => {
                                                                const hasContractorVendorEmployee = row.contractor_id || row.vendor_id || row.employee_id;
                                                                const option = combinedOptions.find(
                                                                    opt =>
                                                                        (opt.type === "Contractor" && opt.id === Number(row.contractor_id)) ||
                                                                        (opt.type === "Vendor" && opt.id === Number(row.vendor_id)) ||
                                                                        (opt.type === "Employee" && opt.id === Number(row.employee_id))
                                                                )?.label;
                                                                const shouldShowClientName = !hasContractorVendorEmployee && row.type === "Loan";
                                                                const clientName = shouldShowClientName ? getClientName(row) : "";
                                                                return [clientName, option].filter(Boolean).join(" | ") || "";
                                                            })()
                                                        )}
                                                    </td>
                                                    <td className="text-sm text-left w-[240px] font-semibold">
                                                        {editingRowId === row.id ? (
                                                            <Select
                                                                name="project_id"
                                                                value={siteOptions.find(opt => opt.id === Number(editFormData.project_id)) || null}
                                                                onChange={(selectedOption) =>
                                                                    handleEditChange({
                                                                        target: { name: "project_id", value: selectedOption ? selectedOption.id : "" }
                                                                    })
                                                                }
                                                                options={siteOptions}
                                                                placeholder="Project Name..."
                                                                isSearchable
                                                                styles={{
                                                                    control: (provided, state) => ({
                                                                        ...provided,
                                                                        backgroundColor: 'transparent',
                                                                        borderWidth: '3px',
                                                                        borderColor: state.isFocused
                                                                            ? 'rgba(191, 152, 83, 0.2)'
                                                                            : 'rgba(191, 152, 83, 0.2)',
                                                                        borderRadius: '6px',
                                                                        boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                                                        '&:hover': {
                                                                            borderColor: 'rgba(191, 152, 83, 0.2)',
                                                                        },
                                                                    }),
                                                                    placeholder: (provided) => ({
                                                                        ...provided,
                                                                        color: '#999',
                                                                        textAlign: 'left',
                                                                    }),
                                                                    menu: (provided) => ({
                                                                        ...provided,
                                                                        zIndex: 9,
                                                                    }),
                                                                    option: (provided, state) => ({
                                                                        ...provided,
                                                                        textAlign: 'left',
                                                                        fontWeight: 'normal',
                                                                        fontSize: '15px',
                                                                        backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                                        color: 'black',
                                                                    }),
                                                                    singleValue: (provided) => ({
                                                                        ...provided,
                                                                        textAlign: 'left',
                                                                        fontWeight: 'normal',
                                                                        color: 'black',
                                                                    }),
                                                                    indicatorSeparator: () => ({
                                                                        display: 'none'
                                                                    }),
                                                                    indicatorsContainer: (provided) => ({
                                                                        ...provided,
                                                                        height: '40px',
                                                                        gap: '0px'
                                                                    }),
                                                                    clearIndicator: (provided) => ({
                                                                        ...provided,
                                                                        padding: '2px'
                                                                    }),
                                                                    dropdownIndicator: (provided) => ({
                                                                        ...provided,
                                                                        padding: '2px'
                                                                    })
                                                                }}
                                                            />
                                                        ) : (
                                                            siteOptions.find(opt => opt.id === Number(row.project_id))?.label || ""
                                                        )}
                                                    </td>
                                                    <td className="text-sm text-left w-[100px] font-semibold">
                                                        {editingRowId === row.id ? (
                                                            <select name="type"
                                                                className="p-1 rounded-md bg-transparent w-[90px] h-[42px] font-normal border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none"
                                                                value={editFormData.type} onChange={handleEditChange}
                                                            >
                                                                <option value="">Select Type...</option>
                                                                {weeklyTypes.map((type, index) => (
                                                                    <option key={index} value={type.type}>
                                                                        {type.type}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={row.type === "Claim" && !row.send_to_expenses_entry ? "text-red-500" : ""}>{row.type}</span>
                                                                    {row.type !== "Daily" && (
                                                                        <button
                                                                            onClick={() => {
                                                                                setCurrentProjectAdvanceRow(row);
                                                                                setPaymentPopupData({
                                                                                    date: new Date().toISOString().split('T')[0],
                                                                                    amount: "",
                                                                                    paymentMode: "",
                                                                                    chequeNo: "",
                                                                                    chequeDate: "",
                                                                                    transactionNumber: "",
                                                                                    accountNumber: ""
                                                                                });
                                                                                const previousPaymentsForExpense = getPaymentsByExpenseId(row.id);
                                                                                setPreviousPayments(previousPaymentsForExpense);
                                                                                setShowPaymentPopup(true);
                                                                            }}
                                                                            className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-green-600 transition-colors text-xs"
                                                                            title="Add Payment"
                                                                        >
                                                                            +
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                {(() => {
                                                                    const payments = getPaymentsByExpenseId(row.id);
                                                                    const paymentModes = [...new Set(payments.map(p => p.bill_payment_mode).filter(mode => mode !== null && mode !== undefined))];
                                                                    if (paymentModes.length === 0) return null;
                                                                    const hoverContent = payments.map(payment =>
                                                                        `${payment.bill_payment_mode}: ₹${payment.amount.toLocaleString('en-IN')}`
                                                                    ).join('\n');
                                                                    return (
                                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                                            {paymentModes.length === 1 ? (
                                                                                <span
                                                                                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-blue-200 transition-colors"
                                                                                    title={hoverContent}
                                                                                >
                                                                                    {paymentModes[0]}
                                                                                </span>
                                                                            ) : (
                                                                                <span
                                                                                    className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-green-200 transition-colors"
                                                                                    title={hoverContent}
                                                                                >
                                                                                    Online
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="text-sm text-left pl-2 w-[110px] font-semibold">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                {editingRowId === row.id ? (
                                                                    <input
                                                                        type="number"
                                                                        name="amount"
                                                                        className="p-1 rounded-md bg-transparent w-[80px] h-[42px] font-normal border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none no-spinner"
                                                                        value={editFormData.amount}
                                                                        onChange={handleEditChange}
                                                                        min="0"
                                                                        step="any"
                                                                    />
                                                                ) : (
                                                                    Number(row.amount).toLocaleString('en-IN')
                                                                )}
                                                            </div>
                                                            <div className="mr-6 flex items-center gap-3">
                                                                {row.type === "Project Advance" ? (
                                                                    <button
                                                                        onClick={async () => {
                                                                            let description = "";
                                                                            if (row.advance_portal_id) {
                                                                                try {
                                                                                    const res = await fetch(
                                                                                        `https://backendaab.in/aabuildersDash/api/advance_portal/get/${row.advance_portal_id}`
                                                                                    );
                                                                                    if (!res.ok) throw new Error("Failed to fetch advance portal data");
                                                                                    const data = await res.json();
                                                                                    description = (data.description || "").trim();
                                                                                    setPortalDescriptions((prev) => ({
                                                                                        ...prev,
                                                                                        [row.advance_portal_id]: description !== "" ? description : undefined,
                                                                                    }));
                                                                                } catch (error) {
                                                                                    console.error("Error fetching advance portal data:", error);
                                                                                }
                                                                            }
                                                                            setEditFormData((prev) => ({ ...prev, description, }));
                                                                            setCurrentRow(row);
                                                                            setShowPopups(true);
                                                                        }}
                                                                    >
                                                                        <img src={portalDescriptions[row.advance_portal_id] ? NotesEnd : NotesStart}
                                                                            alt="Notes" className="w-4 h-4 mr-3"
                                                                        />
                                                                    </button>
                                                                ) : (
                                                                    <button>
                                                                        <img
                                                                            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPC9zdmc+"
                                                                            alt=""
                                                                            className="w-4 h-4 mr-3 opacity-0"
                                                                        />
                                                                    </button>
                                                                )}
                                                                {row.bill_copy_url ? (
                                                                    <a
                                                                        href={cleanUrl(row.bill_copy_url)}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="cursor-pointer ml-3"
                                                                        title="View File"
                                                                    >
                                                                        <img src={file} className="w-4 h-4" alt="Open File" />
                                                                    </a>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleFileUploadClick(row)}
                                                                        className="cursor-pointer ml-3"
                                                                        title="Upload File"
                                                                    >
                                                                        <img
                                                                            src={fileUpload}
                                                                            className="w-4 h-4 opacity-70 hover:opacity-100"
                                                                            alt="Upload File"
                                                                        />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="flex py-2 w-[120px]">
                                                        {(
                                                            (row.contractor_id === 117 && row.project_id === 8 && row.type === "Daily") ||
                                                            (row.contractor_id === 258 && row.project_id === 9 && row.type === "Advance Refund")
                                                        ) ? (
                                                            <>
                                                                <img
                                                                    className="w-5 h-4 opacity-40 cursor-not-allowed"
                                                                    src={Edit}
                                                                    alt="Edit Disabled"
                                                                />
                                                                <img
                                                                    className="w-5 h-4 opacity-40 cursor-not-allowed ml-3"
                                                                    src={Delete}
                                                                    alt="Delete Disabled"
                                                                />
                                                                <img
                                                                    className="w-5 h-4 opacity-40 cursor-not-allowed ml-3"
                                                                    src={history}
                                                                    alt="History Disabled"
                                                                />
                                                            </>
                                                        ) : (
                                                            <>
                                                                {editingRowId === row.id ? (
                                                                    <button onClick={() => saveEditedExpense(row)} className="text-green-600 font-bold text-lg mr-3">
                                                                        ✓
                                                                    </button>
                                                                ) : (
                                                                    <button className="rounded-full transition duration-200 ml-2 mr-3">
                                                                        <img
                                                                            src={Edit}
                                                                            onClick={() => handleEditClick(row)}
                                                                            alt="Edit"
                                                                            className="w-4 h-4 transform hover:scale-110 hover:brightness-110 transition duration-200"
                                                                        />
                                                                    </button>
                                                                )}
                                                                <button className="rounded-full transition duration-200 mr-3">
                                                                    <img
                                                                        src={Delete}
                                                                        className="w-4 h-4 transform hover:scale-110 hover:brightness-110 transition duration-200"
                                                                        onClick={() => handleWeeklyExpensesDelete(row.id)}
                                                                        alt="Delete"
                                                                    />
                                                                </button>
                                                                <button className="rounded-full transition duration-200 mr-3">
                                                                    <img
                                                                        src={history}
                                                                        className="w-4 h-4 transform hover:scale-110 hover:brightness-110 transition duration-200"
                                                                        onClick={() => fetchAuditDetailsForExpense(row.id)}
                                                                        alt="History"
                                                                    />
                                                                </button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td className="p-2 text-center text-sm text-gray-400" colSpan={7}>
                                                    No data available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="flex-[1] min-w-0">
                        <div className="flex justify-between flex-wrap mb-4">
                            <h1 className="font-bold text-base">Payments Received</h1>
                            <h1 className="font-bold text-base ">
                                Total: <span style={{ color: "#E4572E" }}>{Number(totalPayments).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </h1>
                        </div>
                        <div className="w-full rounded-lg border-l-8 border-l-[#BF9853] overflow-x-auto" style={{ maxHeight: "400px" }}>
                            <table className="w-full min-w-[320px] border-collapse">
                                <thead className="bg-[#FAF6ED] h-12">
                                    <tr>
                                        <th className="px-2 py-2 w-[90px] text-left">Date</th>
                                        <th className="px-2 py-2 w-[90px] text-left">Type</th>
                                        <th className="px-2 py-2 w-[90px]">Amount</th>
                                        <th className="px-2 py-2 w-[90px] text-left">Activity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...payments].map((row, index) => (
                                        <tr key={row.id || index} className="even:bg-[#FAF6ED] odd:bg-[#FFFFFF] text-left">
                                            <td className="px-2 py-2">
                                                {editingPaymentId === (row.id || null) ? (
                                                    <input
                                                        type="date"
                                                        name="date"
                                                        className="border-2 border-[#BF9853] border-opacity-25 p-1 rounded-lg w-[90px] h-[40px] focus:outline-none"
                                                        value={editPaymentData.date}
                                                        onChange={handleEditPaymentChange}
                                                    />
                                                ) : (
                                                    formatDateOnly(row.date) || ""
                                                )}
                                            </td>
                                            <td className="px-2 py-2 flex items-center justify-between">
                                                {editingPaymentId === (row.id || null) ? (
                                                    <>
                                                        <select
                                                            name="type"
                                                            className="border-2 border-[#BF9853] border-opacity-25 w-[90px] h-[40px] rounded-lg focus:outline-none"
                                                            value={editPaymentData.type} onChange={handleEditPaymentChange}
                                                        >
                                                            <option value="">Select</option>
                                                            {weeklyReceivedTypes.map((type, index) => (
                                                                <option key={index} value={type.received_type}>
                                                                    {type.received_type}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </>
                                                ) : (
                                                    <>
                                                        {row.type}
                                                    </>
                                                )}
                                            </td>
                                            <td className="px-2 py-2">
                                                {editingPaymentId === (row.id || null) ? (
                                                    <input
                                                        type="number"
                                                        name="amount"
                                                        className="border-2 border-[#BF9853] border-opacity-25 rounded-lg w-[90px] h-[40px] focus:outline-none"
                                                        value={editPaymentData.amount}
                                                        onChange={handleEditPaymentChange}
                                                        min="0"
                                                        step="any"
                                                        onWheel={(e) => e.preventDefault()}
                                                    />
                                                ) : (
                                                    Number(row.amount).toLocaleString('en-IN')
                                                )}
                                            </td>
                                            <td className="px-2 py-2">
                                                <div className="flex">
                                                    {editingPaymentId === row.id ? (
                                                        <button
                                                            onClick={() => saveEditedPaymentReceived(row)}
                                                            className="text-green-600 font-bold text-lg"
                                                            disabled={!weeklyReceivedTypes.some(type => type.received_type === row.type)}
                                                        >
                                                            ✓
                                                        </button>
                                                    ) : (
                                                        weeklyReceivedTypes.some(type => type.received_type === row.type) ? (
                                                            <button onClick={() => handleEditPaymentClick(row)}>
                                                                <img className="w-5 h-4" src={Edit} alt="Edit" />
                                                            </button>
                                                        ) : (
                                                            <img
                                                                className="w-5 h-4 opacity-40 cursor-not-allowed"
                                                                src={Edit}
                                                                alt="Edit Disabled"
                                                            />
                                                        )
                                                    )}
                                                    {weeklyReceivedTypes.some(type => type.received_type === row.type) ? (
                                                        <button className="pl-3">
                                                            <img src={Delete} className="w-5 h-4" alt="Delete" onClick={() => handleWeeklyReceivedDelete(row.id)} />
                                                        </button>
                                                    ) : (
                                                        <span className="pl-3">
                                                            <img
                                                                className="w-5 h-4 opacity-40 cursor-not-allowed"
                                                                src={Delete}
                                                                alt="Delete Disabled"
                                                            />
                                                        </span>
                                                    )}
                                                    {weeklyReceivedTypes.some(type => type.received_type === row.type) ? (
                                                        <button className="" onClick={() => fetchAuditDetailsForPaymentReceived(row.id)}>
                                                            <img src={history} className="w-5 h-4" alt="History" />
                                                        </button>
                                                    ) : (
                                                        <img
                                                            className="w-5 h-4 opacity-40 cursor-not-allowed"
                                                            src={history}
                                                            alt="History Disabled"
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td className="px-2 py-2">
                                            <input
                                                type="date"
                                                name="date"
                                                className="border-2 border-[#BF9853] border-opacity-25 p-1 rounded-lg w-[90px] h-[40px] focus:outline-none"
                                                value={newPayment.date}
                                                onChange={handlePaymentChange}
                                                onKeyDown={handleKeyDownPayment}
                                                disabled={isSubmitting}
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <select
                                                name="type"
                                                className="border-2 border-[#BF9853] border-opacity-25 w-[90px] h-[40px] rounded-lg focus:outline-none"
                                                value={newPayment.type} onChange={handlePaymentChange} onKeyDown={handleKeyDownPayment}
                                                disabled={isSubmitting}>
                                                <option value="">Select</option>
                                                {weeklyReceivedTypes.map((type, index) => (
                                                    <option key={index} value={type.received_type}>
                                                        {type.received_type}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-2 py-2">
                                            <input
                                                type="number"
                                                name="amount"
                                                className="border-2 border-[#BF9853] border-opacity-25 rounded-lg w-[90px] h-[40px] focus:outline-none"
                                                value={newPayment.amount}
                                                onChange={handlePaymentChange}
                                                onKeyDown={handleKeyDownPayment}
                                                min="0"
                                                step="any"
                                                onWheel={(e) => e.preventDefault()}
                                                disabled={isSubmitting}
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4">
                            <button className="w-full max-w-[320px] h-[36px] bg-[#BF9853] text-white font-bold rounded" onClick={openAccountClosure} >
                                Account Closure
                            </button>
                            {showPopup && (
                                <AccountClosurePopup
                                    onClose={() => setShowPopup(false)}
                                    carryForwardBalance={carryForwardBalance}
                                    onConfirm={(type, discount) => {
                                        handleAccountClosure(type, discount);
                                        setShowPopup(false);
                                    }}
                                />
                            )}
                        </div>
                        <div className="mt-4 pt-2">
                            <h2 className="font-bold text-lg mb-2">Summary</h2>
                            <div className="overflow-hidden rounded-md border-l-8 border-[#BF9853]">
                                <table className="w-full max-w-[320px] border-collapse">
                                    <tbody>
                                        {mergedExpenses.map((expense, index, arr) => (
                                            <tr
                                                key={index}
                                                className={`even:bg-[#FAF6ED] odd:bg-[#FFFFFF] ${index === 0 ? "rounded-t-md" : ""
                                                    } ${index === arr.length - 1 ? "rounded-b-md" : ""}`}
                                            >
                                                <td className="font-bold py-1.5 pl-2 text-left">{expense.type}</td>
                                                <td className="font-bold py-1.5 px-4 text-right">
                                                    {expense.amount.toLocaleString("en-IN", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="bg-[#E5E5E5] font-bold">
                                            <td className="py-1.5 pl-2 text-left">Total</td>
                                            <td className="py-1.5 px-4 text-right text-[#E4572E]">
                                                {mergedExpenses
                                                    .reduce((sum, exp) => sum + exp.amount, 0)
                                                    .toLocaleString("en-IN", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {popup.show && (
                <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 bg-white border rounded-lg shadow-lg p-4 z-50 w-96">
                    <p className="mb-4 font-semibold text-center">{popup.message}</p>
                    <div className="flex justify-around">
                        {(popup.type === "expense" || popup.type === "payment" || popup.type === "edit-expense" || popup.type === "edit-payment") && (
                            <button
                                className="px-4 py-2 bg-[#BF9853] w-[90px] text-white rounded-lg"
                                onClick={() => {
                                    if (popup.type === "expense") {
                                        setNewExpense((prev) => ({ ...prev, date: popup.dateStr }));
                                    } else if (popup.type === "payment") {
                                        setNewPayment((prev) => ({ ...prev, date: popup.dateStr }));
                                    } else if (popup.type === "edit-expense" && popup.editRowId !== null) {
                                        setEditFormData((prev) => ({ ...prev, date: popup.dateStr }));
                                    } else if (popup.type === "edit-payment" && popup.editIndex !== null) {
                                        setEditPaymentData((prev) => ({ ...prev, date: popup.dateStr }));
                                    }
                                    setPopup({ show: false, message: "", type: "", dateStr: "", editRowId: null, editIndex: null, originalDate: "" });
                                }}
                            >
                                Ignore
                            </button>
                        )}
                        <button
                            className={`px-4 py-2 ${popup.type === "expense" || popup.type === "payment" || popup.type === "edit-expense" || popup.type === "edit-payment" ? "border border-[#BF9853] w-[90px]" : "bg-[#BF9853] text-white w-[90px]"} rounded-lg`}
                            onClick={() => {
                                if (popup.type === "expense") {
                                    setNewExpense((prev) => ({ ...prev, date: "" }));
                                } else if (popup.type === "payment") {
                                    setNewPayment((prev) => ({ ...prev, date: "" }));
                                } else if (popup.type === "edit-expense" && popup.editRowId !== null && popup.originalDate) {
                                    setEditFormData((prev) => ({ ...prev, date: popup.originalDate }));
                                } else if (popup.type === "edit-payment" && popup.editIndex !== null && popup.originalDate) {
                                    setEditPaymentData((prev) => ({ ...prev, date: popup.originalDate }));
                                }
                                setPopup({ show: false, message: "", type: "", dateStr: "", editRowId: null, editIndex: null, originalDate: "" });
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
            {showPopups && (currentRow?.type === "Project Advance" || currentRow?.type === "Bill") && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-[400px]">
                        <label className="block mb-3 text-left">
                            <span className="font-semibold">Description</span>
                            <input
                                type="text"
                                name="description"
                                placeholder="Enter description"
                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                value={editFormData.description || ""}
                                onChange={handleEditChange}
                                readOnly={Boolean(currentRow?.description)}
                            />
                        </label>
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => setShowPopups(false)} className="px-4 py-2 bg-gray-200 rounded-lg">
                                Close
                            </button>
                            {!portalDescriptions[currentRow?.advance_portal_id] && (
                                <button
                                    onClick={async () => {
                                        await updateDescription(currentRow.advance_portal_id, editFormData.description);
                                        setShowPopups(false);
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg"
                                >
                                    Save
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {showPaymentPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white text-left rounded-xl  p-6 w-[800px] h-[770px] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4 text-center">Add Payment</h3>
                        <div className="space-y-4 mb-4 justify-items-center">
                            {/* First Row: Date, Amount, Mode - with border */}
                            <div className="border-2 border-[#BF9853] border-opacity-25 w-[600px] rounded-lg p-4">
                                <div className="grid grid-cols-3 gap-4">
                                    {/* Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={paymentPopupData.date}
                                                onChange={(e) => setPaymentPopupData(prev => ({ ...prev, date: e.target.value }))}
                                                readOnly
                                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    {/* Amount */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                                        <input
                                            type="number"
                                            value={paymentPopupData.amount}
                                            onChange={(e) => setPaymentPopupData(prev => ({ ...prev, amount: e.target.value }))}
                                            placeholder="Enter amount"
                                            className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none no-spinner"
                                        />
                                    </div>
                                    {/* Mode */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                                        <select
                                            value={paymentPopupData.paymentMode}
                                            onChange={(e) => setPaymentPopupData(prev => ({ ...prev, paymentMode: e.target.value }))}
                                            className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                        >
                                            <option value="">---Select---</option>
                                            <option value="Gpay">Gpay</option>
                                            <option value="PhonePe">PhonePe</option>
                                            <option value="Net Banking">Net Banking</option>
                                            <option value="Cheque">Cheque</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            {/* Second Row: Transaction Number, Account Number, Cheque Fields - with border */}
                            <div className="border-2 border-[#BF9853] border-opacity-25 w-[600px] rounded-lg p-4">
                                <div className="space-y-4">
                                    {/* Cheque Fields Row (only for Cheque mode) */}
                                    {paymentPopupData.paymentMode === "Cheque" && (
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Cheque No */}
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
                                            {/* Cheque Date */}
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
                                    {/* Transaction Number and Account Number Row */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Transaction Number */}
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
                                        {/* Account Number */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                                            <select
                                                value={paymentPopupData.accountNumber}
                                                onChange={(e) => setPaymentPopupData(prev => ({ ...prev, accountNumber: e.target.value }))}
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
                        </div>
                        {/* Previous Payments Section */}
                        {previousPayments.length > 0 && (
                            <div>
                                <h4 className="text-md font-medium text-gray-700 mb-3 ml-20">Previous Payments: {previousPayments.length} </h4>
                                <div className="mb-6 justify-items-center">
                                    <div className="space-y-4 max-h-64 overflow-y-auto">
                                        {previousPayments.map((payment, index) => (
                                            <div key={index} className="">
                                                {/* First Row: Date, Amount, Mode */}
                                                <div className="border-2 border-[#BF9853] border-opacity-25 w-[600px] rounded-lg p-4 mb-4">
                                                    <div className="grid grid-cols-3 gap-4">
                                                        {/* Date */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                                            <input
                                                                type="text"
                                                                value={new Date(payment.date).toLocaleDateString('en-GB')}
                                                                readOnly
                                                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full  text-gray-600"
                                                            />
                                                        </div>
                                                        {/* Amount */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                                                            <input
                                                                type="text"
                                                                value={payment.amount.toLocaleString('en-IN')}
                                                                readOnly
                                                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full  text-gray-600"
                                                            />
                                                        </div>
                                                        {/* Mode */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                                                            <input
                                                                type="text"
                                                                value={payment.bill_payment_mode}
                                                                readOnly
                                                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full  text-gray-600"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="border-2 border-[#BF9853] border-opacity-25 rounded-lg p-4">
                                                    <div className="space-y-4">
                                                        {payment.bill_payment_mode === "Cheque" && (
                                                            <div className="grid grid-cols-2 gap-4">
                                                                {/* Cheque No */}
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cheque No</label>
                                                                    <input
                                                                        type="text"
                                                                        value={payment.cheque_number || ""}
                                                                        readOnly
                                                                        className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full  text-gray-600"
                                                                    />
                                                                </div>
                                                                {/* Cheque Date */}
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Cheque Date</label>
                                                                    <input
                                                                        type="text"
                                                                        value={payment.cheque_date ? new Date(payment.cheque_date).toLocaleDateString('en-GB') : ""}
                                                                        readOnly
                                                                        className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full  text-gray-600"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Number</label>
                                                                <input
                                                                    type="text"
                                                                    value={payment.transaction_number || ""}
                                                                    readOnly
                                                                    className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full  text-gray-600"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                                                                <input
                                                                    type="text"
                                                                    value={payment.account_number || ""}
                                                                    readOnly
                                                                    className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full  text-gray-600"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        {currentProjectAdvanceRow && currentProjectAdvanceRow.type === "Claim" && currentProjectAdvanceRow.send_to_expenses_entry && (
                            <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="text-center">
                                    <span className="text-sm font-medium text-green-700">
                                        This Claim Amount Was Already Sent to the Expense Entry
                                    </span>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-between items-center mt-6">
                            {currentProjectAdvanceRow && currentProjectAdvanceRow.type === "Claim" && !currentProjectAdvanceRow.send_to_expenses_entry && (
                                <button
                                    onClick={() => {
                                        setSelectedCategory(null);
                                        setIsConfirmingCategory(false);
                                        setShowCategoryPopup(true);
                                    }}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Add To Expense Entry
                                </button>
                            )}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowPaymentPopup(false);
                                        setPaymentPopupData({
                                            date: new Date().toISOString().split('T')[0],
                                            amount: "",
                                            paymentMode: "",
                                            chequeNo: "",
                                            chequeDate: "",
                                            transactionNumber: "",
                                            accountNumber: ""
                                        });
                                        setPreviousPayments([]);
                                        setCurrentProjectAdvanceRow(null);
                                    }}
                                    className="px-4 py-2 border border-[#BF9853] text-[#BF9853] rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            if (currentProjectAdvanceRow && paymentPopupData.paymentMode && paymentPopupData.amount) {
                                                let advancePortalId = null;
                                                let staffAdvancePortalId = null;
                                                if (currentProjectAdvanceRow.type === "Project Advance" && currentProjectAdvanceRow.advance_portal_id) {
                                                    try {
                                                        const res = await fetch("https://backendaab.in/aabuildersDash/api/advance_portal/getAll");
                                                        if (!res.ok) throw new Error("Failed to fetch entry numbers");
                                                        const allData = await res.json();
                                                        const maxEntryNo =
                                                            allData.length > 0
                                                                ? Math.max(...allData.map((item) => item.entry_no || 0))
                                                                : 0;
                                                        const nextEntryNo = maxEntryNo + 1;
                                                        const getWeekNumber = () => {
                                                            const now = new Date();
                                                            const start = new Date(now.getFullYear(), 0, 1);
                                                            const diff =
                                                                now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000;
                                                            const oneWeek = 604800000; // ms in a week
                                                            return Math.floor(diff / oneWeek) + 1;
                                                        };
                                                        const description = portalDescriptions[currentProjectAdvanceRow.advance_portal_id] || "";
                                                        const advanceUpdateData = {
                                                            type: "Advance",
                                                            date: paymentPopupData.date,
                                                            description: description,
                                                            bill_amount: 0,
                                                            amount: parseFloat(paymentPopupData.amount),
                                                            project_id: currentProjectAdvanceRow.project_id,
                                                            vendor_id: currentProjectAdvanceRow.vendor_id,
                                                            contractor_id: currentProjectAdvanceRow.contractor_id,
                                                            entry_no: nextEntryNo,
                                                            week_no: getWeekNumber(),
                                                            file_url: "",
                                                            transfer_site_id: 0,
                                                            refund_amount: 0,
                                                            payment_mode: paymentPopupData.paymentMode,
                                                            not_allow_to_edit: true
                                                        };
                                                        const advanceResponse = await fetch(
                                                            "https://backendaab.in/aabuildersDash/api/advance_portal/save",
                                                            {
                                                                method: "POST",
                                                                headers: { "Content-Type": "application/json" },
                                                                body: JSON.stringify(advanceUpdateData)
                                                            }
                                                        );
                                                        if (!advanceResponse.ok) {
                                                            console.error("Failed to update advance portal payment mode");
                                                        } else {
                                                            const advanceResponseData = await advanceResponse.json();
                                                            advancePortalId = advanceResponseData.advancePortalId || advanceResponseData.advance_portal_id;
                                                        }
                                                    } catch (error) {
                                                        console.error("Error updating advance portal payment mode:", error);
                                                    }
                                                }
                                                if (currentProjectAdvanceRow.type === "Staff Advance") {
                                                    try {
                                                        const staffAdvanceRes = await fetch("https://backendaab.in/aabuildersDash/api/staff-advance/all");
                                                        if (!staffAdvanceRes.ok) throw new Error("Failed to fetch staff advance entry numbers");
                                                        const staffAdvanceData = await staffAdvanceRes.json();
                                                        const maxEntryNo =
                                                            staffAdvanceData.length > 0
                                                                ? Math.max(...staffAdvanceData.map((item) => item.entry_no || 0))
                                                                : 0;
                                                        const nextEntryNo = maxEntryNo + 1;
                                                        const getWeekNumber = () => {
                                                            const now = new Date();
                                                            const start = new Date(now.getFullYear(), 0, 1);
                                                            const diff =
                                                                now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000;
                                                            const oneWeek = 604800000; // ms in a week
                                                            return Math.floor(diff / oneWeek) + 1;
                                                        };
                                                        const staffAdvanceSaveData = {
                                                            date: paymentPopupData.date,
                                                            employee_id: currentProjectAdvanceRow.employee_id,
                                                            project_id: currentProjectAdvanceRow.project_id,
                                                            type: "Advance",
                                                            from_purpose_id: 4,
                                                            staff_payment_mode: paymentPopupData.paymentMode,
                                                            entry_no: nextEntryNo,
                                                            week_no: getWeekNumber(),
                                                            amount: parseFloat(paymentPopupData.amount),
                                                            staff_refund_amount: 0.0,
                                                            description: "",
                                                            file_url: null,
                                                            labour_id: 0,
                                                            not_allow_to_edit: true
                                                        };
                                                        const staffAdvanceResponse = await fetch(
                                                            "https://backendaab.in/aabuildersDash/api/staff-advance/save",
                                                            {
                                                                method: "POST",
                                                                headers: { "Content-Type": "application/json" },
                                                                body: JSON.stringify(staffAdvanceSaveData)
                                                            }
                                                        );
                                                        if (!staffAdvanceResponse.ok) {
                                                            console.error("Failed to save staff advance");
                                                        } else {
                                                            const staffAdvanceResponseData = await staffAdvanceResponse.json();
                                                            staffAdvancePortalId = staffAdvanceResponseData.staffAdvancePortalId || staffAdvanceResponseData.staff_advance_portal_id;
                                                        }
                                                    } catch (error) {
                                                        console.error("Error saving staff advance:", error);
                                                    }
                                                }
                                                const paymentData = {
                                                    date: paymentPopupData.date,
                                                    created_at: new Date().toISOString(),
                                                    contractor_id: currentProjectAdvanceRow.contractor_id || null,
                                                    vendor_id: currentProjectAdvanceRow.vendor_id || null,
                                                    employee_id: currentProjectAdvanceRow.employee_id || null,
                                                    project_id: currentProjectAdvanceRow.project_id || null,
                                                    type: currentProjectAdvanceRow.type || null,
                                                    bill_payment_mode: paymentPopupData.paymentMode,
                                                    amount: parseFloat(paymentPopupData.amount),
                                                    status: true,
                                                    weekly_number: currentWeekNumber,
                                                    weekly_payment_expense_id: currentProjectAdvanceRow.id,
                                                    advance_portal_id: advancePortalId,
                                                    staff_advance_portal_id: staffAdvancePortalId,
                                                    cheque_number: paymentPopupData.chequeNo || null,
                                                    cheque_date: paymentPopupData.chequeDate || null,
                                                    transaction_number: paymentPopupData.transactionNumber || null,
                                                    account_number: paymentPopupData.accountNumber || null
                                                };
                                                await saveWeeklyPaymentBill(paymentData);
                                                await fetchWeeklyPaymentBills();
                                            }
                                        } catch (error) {
                                            console.error("Error saving payment:", error);
                                        }

                                        setShowPaymentPopup(false);
                                        setPaymentPopupData({
                                            date: new Date().toISOString().split('T')[0],
                                            amount: "",
                                            paymentMode: "",
                                            chequeNo: "",
                                            chequeDate: "",
                                            transactionNumber: "",
                                            accountNumber: ""
                                        });
                                        setPreviousPayments([]);
                                        setCurrentProjectAdvanceRow(null);
                                    }}
                                    className="px-4 py-2 bg-[#BF9853] text-white rounded-lg"
                                    disabled={!paymentPopupData.paymentMode || !paymentPopupData.amount}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                        {currentProjectAdvanceRow && currentProjectAdvanceRow.type === "Claim" && (
                            <div className="mt- p-3 text-center -ml-[600px]">
                                <span className="text-sm font-medium text-gray-700">Total Amount: </span>
                                <span className="text-lg font-semibold text-gray-900">
                                    ₹{(Number(currentProjectAdvanceRow.amount) + previousPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)).toLocaleString('en-IN')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {fileUploadPopup && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            setFileUploadPopup(false);
                            setCurrentFileRow(null);
                            setSelectedFileForPopup(null);
                        }
                    }}
                    tabIndex={0}
                >
                    <div className="bg-white rounded-xl shadow-lg p-6 w-[500px]">
                        <h3 className="text-lg font-semibold mb-4 text-center">
                            {currentFileRow?.bill_copy_url ? 'Change File' : 'Upload File'}
                        </h3>
                        {currentFileRow?.bill_copy_url && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-2">Current file:</p>
                                <a href={cleanUrl(currentFileRow.bill_copy_url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline"
                                >
                                    View Current File
                                </a>
                            </div>
                        )}
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">
                                Select PDF File
                            </label>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileSelectInPopup}
                                className="w-full p-2 border-2 border-[#BF9853] border-opacity-25 rounded-lg focus:outline-none"
                            />
                            {selectedFileForPopup && (
                                <p className="text-sm text-green-600 mt-2">
                                    ✓ {selectedFileForPopup.name} selected
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setFileUploadPopup(false);
                                    setCurrentFileRow(null);
                                    setSelectedFileForPopup(null);
                                }}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button onClick={handleSaveFileFromPopup} disabled={!selectedFileForPopup}
                                className={`px-4 py-2 rounded-lg ${!selectedFileForPopup
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                                    } text-white`}
                            >
                                {currentFileRow?.bill_copy_url ? 'Update File' : 'Upload File'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showPaymentDetailsPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-[500px] max-h-[600px] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4 text-center">Payment Details</h3>
                        <div className="space-y-3">
                            {selectedPaymentDetails.map((payment, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-3">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="font-medium text-gray-700">{payment.type}</span>
                                            <p className="text-sm text-gray-500">
                                                {new Date(payment.date).toLocaleDateString('en-GB')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-semibold text-green-600">
                                                ₹{payment.amount.toLocaleString('en-IN')}
                                            </span>
                                            <p className="text-xs text-gray-500">
                                                {payment.status ? 'Active' : 'Inactive'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {selectedPaymentDetails.length === 0 && (
                                <div className="text-center text-gray-500 py-8">
                                    No payment details found
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end mt-4">
                            <button onClick={() => {setShowPaymentDetailsPopup(false); setSelectedPaymentDetails([]);}}
                                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showCategoryPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-[400px]">
                        <h3 className="text-lg font-semibold mb-4 text-center">Select Category</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <Select
                                value={selectedCategory}
                                onChange={(selectedOption) => setSelectedCategory(selectedOption)}
                                options={categoryOptions}
                                placeholder="Select Category..."
                                isSearchable
                                isClearable
                                styles={{
                                    control: (provided, state) => ({
                                        ...provided,
                                        backgroundColor: 'white',
                                        borderWidth: '2px',
                                        borderColor: state.isFocused
                                            ? '#BF9853'
                                            : '#BF9853',
                                        borderRadius: '8px',
                                        boxShadow: state.isFocused ? '0 0 0 1px #BF9853' : 'none',
                                        '&:hover': {
                                            borderColor: '#BF9853',
                                        },
                                    }),
                                    placeholder: (provided) => ({
                                        ...provided,
                                        color: '#999',
                                        textAlign: 'left',
                                    }),
                                    menu: (provided) => ({
                                        ...provided,
                                        zIndex: 9999,
                                    }),
                                    option: (provided, state) => ({
                                        ...provided,
                                        textAlign: 'left',
                                        fontWeight: 'normal',
                                        fontSize: '15px',
                                        backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                        color: 'black',
                                    }),
                                    singleValue: (provided) => ({
                                        ...provided,
                                        textAlign: 'left',
                                        fontWeight: 'normal',
                                        color: 'black',
                                    }),
                                    indicatorSeparator: () => ({
                                        display: 'none'
                                    }),
                                    indicatorsContainer: (provided) => ({
                                        ...provided,
                                        height: '40px',
                                        gap: '0px'
                                    }),
                                    clearIndicator: (provided) => ({
                                        ...provided,
                                        padding: '2px'
                                    }),
                                    dropdownIndicator: (provided) => ({
                                        ...provided,
                                        padding: '2px'
                                    })
                                }}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comments
                            </label>
                            <textarea
                                value={categoryComments}
                                onChange={(e) => setCategoryComments(e.target.value)}
                                placeholder="Enter comments..."
                                className="w-full border-2 border-[#BF9853] border-opacity-25 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#BF9853] focus:border-transparent resize-none"
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowCategoryPopup(false);
                                    setSelectedCategory(null);
                                    setIsConfirmingCategory(false);
                                    setCategoryComments("");
                                }}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (!selectedCategory || isConfirmingCategory) {
                                        if (!selectedCategory) {
                                            alert("Please select a category");
                                        }
                                        return;
                                    }
                                    setIsConfirmingCategory(true);
                                    setShowCategoryPopup(false);
                                    try {
                                        const enoResponse = await fetch('https://backendaab.in/aabuilderDash/expenses_form/get_form');
                                        if (!enoResponse.ok) {
                                            throw new Error('Failed to fetch ENo');
                                        }
                                        const enoData = await enoResponse.json();
                                        const nextEno = enoData.length > 0 ? Math.max(...enoData.map(item => item.eno || 0)) + 1 : 1;
                                        const expensesFormData = {
                                            accountType: "Claim",
                                            eno: nextEno,
                                            date: currentProjectAdvanceRow.date,
                                            siteName: siteOptions.find(opt => opt.id === Number(currentProjectAdvanceRow.project_id))?.label || "",
                                            vendor: vendorOptions.find(opt => opt.id === Number(currentProjectAdvanceRow.vendor_id))?.label || "",
                                            quantity: 1,
                                            contractor: contractorOptions.find(opt => opt.id === Number(currentProjectAdvanceRow.contractor_id))?.label || "",
                                            amount: Number(currentProjectAdvanceRow.amount) + previousPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
                                            category: selectedCategory.value,
                                            comments: categoryComments || "",
                                            machineTools: "",
                                            source: "Cash Register",
                                            billCopyUrl: currentProjectAdvanceRow.bill_copy_url
                                        };
                                        const expensesFormResponse = await fetch('https://backendaab.in/aabuilderDash/expenses_form/save', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify(expensesFormData)
                                        });
                                        if (!expensesFormResponse.ok) {
                                            throw new Error('Failed to save to expenses form');
                                        }
                                        const response = await fetch(`https://backendaab.in/aabuildersDash/api/weekly-expenses/${currentProjectAdvanceRow.id}/send-to-expenses`, {
                                            method: 'PUT',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                        });
                                        if (response.ok) {
                                            await fetchExpenses();
                                            setCurrentProjectAdvanceRow(prev => ({ ...prev, send_to_expenses_entry: true }));
                                            setPopup({
                                                show: true,
                                                message: "Successfully added to expense entry!",
                                                type: "success",
                                                dateStr: new Date().toLocaleDateString('en-GB'),
                                                editRowId: null,
                                                editIndex: null,
                                                originalDate: ""
                                            });
                                            setTimeout(() => {
                                                setShowPaymentPopup(false);
                                                setPaymentPopupData({
                                                    date: new Date().toISOString().split('T')[0],
                                                    amount: "",
                                                    paymentMode: "",
                                                    chequeNo: "",
                                                    chequeDate: "",
                                                    transactionNumber: "",
                                                    accountNumber: ""
                                                });
                                                setPreviousPayments([]);
                                                setCurrentProjectAdvanceRow(null);
                                                setSelectedCategory(null);
                                                setIsConfirmingCategory(false);
                                                setCategoryComments("");
                                            }, 2000);
                                        } else {
                                            throw new Error('Failed to update expense entry status');
                                        }
                                    } catch (error) {
                                        console.error('Error updating expense entry status:', error);
                                        setIsConfirmingCategory(false);
                                        setPopup({
                                            show: true,
                                            message: "Failed to add to expense entry. Please try again.",
                                            type: "error",
                                            dateStr: new Date().toLocaleDateString('en-GB'),
                                            editRowId: null,
                                            editIndex: null,
                                            originalDate: ""
                                        });
                                    }
                                }}
                                className="px-4 py-2 bg-[#BF9853] text-white rounded-lg hover:bg-[#BF9853]/90 transition-colors"
                                disabled={!selectedCategory || isConfirmingCategory}
                            >
                                {isConfirmingCategory ? "Processing..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <AuditModal show={showWeeklyPaymentExpensesModal} onClose={() => setShowWeeklyPaymentExpensesModal(false)} audits={weeklyPaymentExpensesAudits} vendorOptions={vendorOptions} contractorOptions={contractorOptions}
                siteOptions={siteOptions} />
            <AuditModalWeeklyPaymentsReceived show={showWeeklyPaymentReceivedModal} onClose={() => setShowWeeklyPaymentReceivedModal(false)}
                audits={weeklyPaymentReceivedAudits} />
        </div>
    );
};
const AccountClosurePopup = ({ onClose, carryForwardBalance, onConfirm }) => {
    const [step, setStep] = useState(1);
    const [closureType, setClosureType] = useState("Carry (CF)");
    const [continueDiscount, setContinueDiscount] = useState("");
    const [handoverDiscount, setHandoverDiscount] = useState("");
    const handleYesClick = () => setStep(2);
    const handleConfirm = () => {
        const discountValue = closureType === "Carry (CF)" ? parseFloat(continueDiscount) || 0 : parseFloat(handoverDiscount) || 0;
        onConfirm(closureType, discountValue);
    };
    const adjustedContinueBalance = Math.max(
        (carryForwardBalance ?? 0) - (parseFloat(continueDiscount) || 0),
        0
    );
    const adjustedHandoverBalance = Math.max(
        (carryForwardBalance ?? 0) - (parseFloat(handoverDiscount) || 0),
        0
    );
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-4 rounded-md w-[480px] relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-red-500 font-bold text-xl" >
                    ✖
                </button>
                {step === 1 ? (
                    <>
                        <h2 className="mb-2 text-lg font-semibold">Do you want to Account Closure?</h2>
                        <label className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="closure"
                                className="accent-[#007233]"
                                checked={closureType === "Carry (CF)"}
                                onChange={() => setClosureType("Carry (CF)")}
                            />
                            <span className="font-semibold text-base">Continue for Next week</span>
                            <span className="ml-4 font-bold text-[#E4572E]">
                                {carryForwardBalance ?? 0}
                            </span>
                        </label>
                        <label className="flex items-center space-x-2 mt-3">
                            <input
                                type="radio"
                                name="closure"
                                className="accent-[#007233]"
                                checked={closureType === "Handover"}
                                onChange={() => setClosureType("Handover")}
                            />
                            <span className="font-semibold text-base">Handover</span>
                            <span className="ml-4 font-bold text-[#E4572E]">
                                {carryForwardBalance ?? 0}
                            </span>
                        </label>
                        <div className="flex mt-4 space-x-6 justify-center">
                            <button onClick={handleYesClick} className="rounded bg-[#BF9853] py-2 px-8 text-white font-bold" >
                                Yes
                            </button>
                            <button onClick={onClose} className="rounded border border-[#BF9853] py-2 px-8 font-bold text-[#BF9853]" >
                                No
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="mb-4 text-base font-semibold text-left">
                            {closureType === "Carry (CF)"
                                ? "Do you want to continue for Next Week?"
                                : "Do you want to hand over the account?"}
                        </h2>
                        <div className="flex">
                            <div className="mb-4 w-[150px]">
                                <label className="block mb-1 font-semibold">Discount</label>
                                {closureType === "Carry (CF)" ? (
                                    <input
                                        type="number"
                                        value={continueDiscount}
                                        onChange={(e) => setContinueDiscount(e.target.value)}
                                        placeholder="Enter discount if any"
                                        className="w-full rounded border border-[#BF9853] p-2 no-spinner focus:outline-none"
                                    />
                                ) : (
                                    <input
                                        type="number"
                                        value={handoverDiscount}
                                        onChange={(e) => setHandoverDiscount(e.target.value)}
                                        placeholder="Enter discount if any"
                                        className="w-full rounded border border-[#BF9853] p-2 no-spinner focus:outline-none"
                                    />
                                )}
                            </div>
                            <div className="ml-4 mt-9 font-semibold text-[#E4572E]">
                                Balance: {closureType === "Carry (CF)" ? adjustedContinueBalance : adjustedHandoverBalance}
                            </div>
                        </div>
                        <div className="mt-6 flex justify-center space-x-6">
                            <button onClick={handleConfirm} className="rounded bg-[#BF9853] py-2 px-8 text-white font-bold" >
                                Yes
                            </button>
                            <button onClick={() => setStep(1)} className="rounded border border-[#BF9853] py-2 px-8 font-bold text-[#BF9853]" >
                                No
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
export default WeeklyPayment;
const AuditModal = ({ show, onClose, audits, vendorOptions, contractorOptions, siteOptions }) => {
    if (!show) return null;
    const getNameById = (id, options) => {
        if (!id && id !== 0) return "-";
        const found = options.find(opt => String(opt.id) === String(id));
        return found ? found.label : id;
    };
    const fields = [
        { oldKey: "old_date", newKey: "new_date", label: "Date", width: "120px" },
        { oldKey: "old_type", newKey: "new_type", label: "Type", width: "100px" },
        { oldKey: "old_project_id", newKey: "new_project_id", label: "Project Name", width: "180px", lookup: siteOptions },
        { oldKey: "old_vendor_id", newKey: "new_vendor_id", label: "Vendor", width: "150px", lookup: vendorOptions },
        { oldKey: "old_contractor_id", newKey: "new_contractor_id", label: "Contractor", width: "150px", lookup: contractorOptions },
        { oldKey: "old_amount", newKey: "new_amount", label: "Amount", width: "100px" },
    ];
    const formatDateTime = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        hours = String(hours).padStart(2, "0");
        return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    };
    const formatDisplayValue = (value, field) => {
        if (
            (field.oldKey?.includes("vendor_id") || field.oldKey?.includes("transfer_site_id") ||
                field.newKey?.includes("vendor_id") || field.newKey?.includes("transfer_site_id")) &&
            String(value) === "0"
        ) { return "-"; }
        if (field.lookup) { return getNameById(value, field.lookup); }
        if (field.label.includes("Amount")) { return value ? Number(value).toLocaleString("en-IN") : "-"; }
        if (field.label === "Date") { return value ? new Date(value).toLocaleDateString("en-GB") : "-"; }
        return value ?? "-";
    };
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-md shadow-lg w-[95%] max-w-[1800px] mx-4 p-2">
                <div className="flex justify-between items-center mt-4 ml-7 mr-7">
                    <h2 className="text-xl font-bold">History</h2>
                    <button onClick={onClose}>
                        <h2 className="text-xl text-red-500 -mt-10 font-bold">x</h2>
                    </button>
                </div>
                <div className="overflow-auto mt-2 max-h-80 border border-l-8 border-l-[#BF9853] rounded-lg ml-7">
                    <table className="table-fixed min-w-full bg-white">
                        <thead className="bg-[#FAF6ED]">
                            <tr>
                                <th style={{ width: "130px" }}>Time Stamp</th>
                                <th style={{ width: "120px" }}>Edited By</th>
                                {fields.map((f) => (
                                    <th key={f.label} style={{ width: f.width }} className="border-b py-2 px-2 text-center font-bold whitespace-nowrap overflow-hidden text-ellipsis" >
                                        {f.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {audits.map((audit, index) => (
                                <tr key={index} className="odd:bg-white even:bg-[#FAF6ED]" >
                                    <td className="whitespace-nowrap overflow-hidden text-ellipsis" style={{ width: "130px" }} >
                                        {formatDateTime(audit.edited_date)}
                                    </td>
                                    <td className="whitespace-nowrap overflow-hidden text-ellipsis" style={{ width: "120px" }} >
                                        {audit.edited_by}
                                    </td>
                                    {fields.map((f) => {
                                        const oldDisplay = formatDisplayValue(audit[f.oldKey], f);
                                        const newDisplay = formatDisplayValue(audit[f.newKey], f);
                                        const changed = oldDisplay !== newDisplay;
                                        return (
                                            <td key={f.label} style={{ width: f.width }} title={changed ? `Previous: ${oldDisplay} → Current: ${newDisplay}` : ""}
                                                className={`whitespace-nowrap overflow-hidden text-ellipsis px-2 ${changed ? "bg-[#BF9853] font-bold" : ""}`}
                                            >
                                                {oldDisplay}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
const AuditModalWeeklyPaymentsReceived = ({ show, onClose, audits }) => {
    if (!show) return null;
    const getNameById = (id, options) => {
        if (!id && id !== 0) return "-";
        const found = options.find(opt => String(opt.id) === String(id));
        return found ? found.label : id;
    };
    const fields = [
        { oldKey: "old_date", newKey: "new_date", label: "Date", width: "120px" },
        { oldKey: "old_amount", newKey: "new_amount", label: "Amount", width: "100px" },
        { oldKey: "old_type", newKey: "new_type", label: "Type", width: "100px" },
    ];
    const formatDateTime = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        hours = String(hours).padStart(2, "0");
        return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    };
    const formatDisplayValue = (value, field) => {
        if (
            (field.oldKey?.includes("vendor_id") || field.oldKey?.includes("transfer_site_id") ||
                field.newKey?.includes("vendor_id") || field.newKey?.includes("transfer_site_id")) &&
            String(value) === "0"
        ) { return "-"; }
        if (field.lookup) { return getNameById(value, field.lookup); }
        if (field.label.includes("Amount")) { return value ? Number(value).toLocaleString("en-IN") : "-"; }
        if (field.label === "Date") { return value ? new Date(value).toLocaleDateString("en-GB") : "-"; }
        return value ?? "-";
    };
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-md shadow-lg w-[95%] max-w-[1800px] mx-4 p-2">
                <div className="flex justify-between items-center mt-4 ml-7 mr-7">
                    <h2 className="text-xl font-bold">History</h2>
                    <button onClick={onClose}>
                        <h2 className="text-xl text-red-500 -mt-10 font-bold">x</h2>
                    </button>
                </div>
                <div className="overflow-auto mt-2 max-h-80 border border-l-8 border-l-[#BF9853] rounded-lg ml-7">
                    <table className="table-fixed min-w-full bg-white">
                        <thead className="bg-[#FAF6ED]">
                            <tr>
                                <th style={{ width: "130px" }}>Time Stamp</th>
                                <th style={{ width: "120px" }}>Edited By</th>
                                {fields.map((f) => (
                                    <th key={f.label} style={{ width: f.width }}
                                        className="border-b py-2 px-2 text-center font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                                        {f.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {audits.map((audit, index) => (
                                <tr key={index} className="odd:bg-white even:bg-[#FAF6ED]">
                                    <td className="whitespace-nowrap overflow-hidden text-ellipsis" style={{ width: "130px" }} >
                                        {formatDateTime(audit.edited_date)}
                                    </td>
                                    <td className="whitespace-nowrap overflow-hidden text-ellipsis" style={{ width: "120px" }} >
                                        {audit.edited_by}
                                    </td>
                                    {fields.map((f) => {
                                        const oldDisplay = formatDisplayValue(audit[f.oldKey], f);
                                        const newDisplay = formatDisplayValue(audit[f.newKey], f);
                                        const changed = oldDisplay !== newDisplay;
                                        return (
                                            <td key={f.label} style={{ width: f.width }} title={changed ? `Previous: ${oldDisplay} → Current: ${newDisplay}` : ""}
                                                className={`whitespace-nowrap overflow-hidden text-ellipsis px-2 ${changed ? "bg-[#BF9853] font-bold" : ""}`}
                                            >
                                                {oldDisplay}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};