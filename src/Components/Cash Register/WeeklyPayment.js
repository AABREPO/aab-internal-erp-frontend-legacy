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
// Helper function to get start and end date of ISO week
function getStartAndEndDateOfISOWeek(weekNo, year) {
    const simple = new Date(year, 0, 1 + (weekNo - 1) * 7);
    let dayOfWeek = simple.getDay();
    // Treat Sunday (0) as 7
    if (dayOfWeek === 0) {
        dayOfWeek = 7;
    }
    // Get Monday of that week
    const ISOweekStart = new Date(simple);
    ISOweekStart.setDate(simple.getDate() - dayOfWeek + 1);
    // Get Sunday of that week
    const ISOweekEnd = new Date(ISOweekStart);
    ISOweekEnd.setDate(ISOweekStart.getDate() + 6);
    // Normalize both to midnight
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
    const [weeklyPaymentBills, setWeeklyPaymentBills] = useState([]);
    const [selectedProjectName, setSelectedProjectName] = useState(null);
    const [portalDescriptions, setPortalDescriptions] = useState({});
    const [staffAdvanceDescriptions, setStaffAdvanceDescriptions] = useState({});
    const [selectedContractor, setSelectedContractor] = useState(null);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [weeklyTypes, setWeeklyTypes] = useState([]);
    const [showWeeklyPaymentExpensesModal, setShowWeeklyPaymentExpensesModal] = useState(false);
    const [weeklyPaymentExpensesAudits, setWeeklyPaymentExpensesAudits] = useState([]);
    const [showWeeklyPaymentReceivedModal, setShowWeeklyPaymentReceivedModal] = useState(false);
    const [weeklyPaymentReceivedAudits, setWeeklyPaymentReceivedAudits] = useState([]);
    const [allRefundAmount, setAllRefundAmount] = useState([]);
    const [popup, setPopup] = useState({ show: false, message: "", type: "", dateStr: "" });
    // Expenses
    const [expenses, setExpenses] = useState([]);
    const [weeklyReceivedTypes, setWeeklyReceivedTypes] = useState([]);
    const [currentRow, setCurrentRow] = useState([]);

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
        project: "",
        type: "",
        amount: "",
        staff_advance_portal_id: "",
    });
    const [editingRowId, setEditingRowId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        date: "",
        contractor_id: "",
        vendor_id: "",
        employee_id: "",
        project_id: "",
        type: "",
        amount: "",
        advance_portal_id: "",
        staff_advance_portal_id: "",
        description: "",
    });
    const handleEditClick = async (row) => {
        setEditingRowId(row.id);
        // Start with row data
        let description = row.description || "";
        // ✅ If advance_portal_id exists, fetch its description
        if (row.advance_portal_id) {
            try {
                const res = await fetch(
                    `https://backendaab.in/aabuildersDash/api/advance_portal/get/${row.advance_portal_id}`
                );
                if (!res.ok) throw new Error("Failed to fetch advance portal data");

                const data = await res.json();
                description = data.description || description; // fallback if no description
            } catch (error) {
                console.error("Error fetching advance portal data:", error);
            }
        }
        // ✅ If staff_advance_portal_id exists, fetch its description
        if (row.staff_advance_portal_id) {
            try {
                const res = await fetch(
                    `https://backendaab.in/aabuildersDash/api/staff-advance/${row.staff_advance_portal_id}`
                );
                if (!res.ok) throw new Error("Failed to fetch staff advance data");

                const data = await res.json();
                description = data.description || description; // fallback if no description
            } catch (error) {
                console.error("Error fetching staff advance data:", error);
            }
        }
        setEditFormData({
            date: row.date,
            contractor_id: row.contractor_id,
            vendor_id: row.vendor_id,
            employee_id: row.employee_id,
            project_id: row.project_id,
            type: row.type,
            amount: row.amount,
            advance_portal_id: row.advance_portal_id,
            staff_advance_portal_id: row.staff_advance_portal_id,
            description: description, // ✅ updated with fetched description if available
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

        if (name === "amount") {
            let numericValue = parseFloat(value);
            if (isNaN(numericValue)) numericValue = "";
            if (numericValue > balance) {
                alert(`Amount cannot exceed balance: ${balance}`);
                numericValue = "";   // clear instead of forcing to balance
            }
            if (numericValue < 0) numericValue = 0;
            setEditFormData((prev) => ({ ...prev, amount: numericValue }));
        }
        else if (name === "description") {
            setEditFormData((prev) => ({ ...prev, description: value }));
        }
        else {
            setEditFormData((prev) => ({ ...prev, [name]: value }));
        }
    };
    // Payments
    const [payments, setPayments] = useState([]);
    const [newPayment, setNewPayment] = useState({ date: "", amount: "", type: "Weekly" });
    // Account Closure popup
    const [showPopup, setShowPopup] = useState(false);
    const [showPopups, setShowPopups] = useState(false);
    const [carryForwardBalance, setCarryForwardBalance] = useState(0);
    const [editingPaymentId, setEditingPaymentId] = useState(null);
    const [editPaymentData, setEditPaymentData] = useState({
        date: "",
        amount: "",
        type: ""
    });

    // Payment popup states for Project Advance
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
    // Weekly Payment Bill Data List states

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

    // API functions for WeeklyPaymentBillDataList
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
            const siteNo = project?.siteNo || "";
            const name =
                vendorOptions.find(opt => opt.id === Number(currentFileRow.vendor_id))?.label ||
                contractorOptions.find(opt => opt.id === Number(currentFileRow.contractor_id))?.label ||
                employeeOptions.find(opt => opt.id === Number(currentFileRow.employee_id))?.label ||
                "";
            
            const formData = new FormData();
            const finalName = `${currentFileRow.date}-${siteNo}-${name}`;
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
            
            // Update the bill copy URL using the weekly expenses API
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
            
            // Update local state
            setExpenses((prev) =>
                prev.map((exp) => (exp.id === currentFileRow.id ? { ...exp, bill_copy_url: pdfUrl } : exp))
            );
            
            setFileUploadPopup(false);
            setCurrentFileRow(null);
            setSelectedFileForPopup(null);
            
            // Show success message
            setPopup({
                show: true,
                message: "File uploaded successfully!",
                type: "success",
                dateStr: new Date().toLocaleDateString('en-GB')
            });
            
        } catch (error) {
            console.error("Error uploading file:", error);
            setPopup({
                show: true,
                message: "Error during file upload. Please try again.",
                type: "error",
                dateStr: new Date().toLocaleDateString('en-GB')
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
        setEditPaymentData((prev) => ({ ...prev, [name]: value }));
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
        const fetchSites = async () => {
            try {
                const response = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/getAll", {
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
                    value: item.siteName,
                    label: item.siteName,
                    id: item.id,
                    sNo: item.siteNo
                }));
                const predefinedSiteOptions = [
                    {
                        value: "Mason Advance",
                        label: "Mason Advance",
                        id: 1,
                        sNo: "1"
                    },
                    {
                        value: "Material Advance",
                        label: "Material Advance",
                        id: 2,
                        sNo: "2"
                    },
                    {
                        value: "Weekly Advance",
                        label: "Weekly Advance",
                        id: 3,
                        sNo: "3"
                    },
                    {
                        value: "Excess Advance",
                        label: "Excess Advance",
                        id: 4,
                        sNo: "4"
                    },
                    {
                        value: "Material Rent",
                        label: "Material Rent",
                        id: 5,
                        sNo: "5"
                    },
                    {
                        value: "Subhash Kumar - Kunnur",
                        label: "Subhash Kumar - Kunnur",
                        id: 6,
                        sNo: "6"
                    },
                    {
                        value: "Summary Bill",
                        label: "Summary Bill",
                        id: 7,
                        sNo: "7"
                    },
                    {
                        value: "Daily Wage",
                        label: "Daily Wage",
                        id: 8,
                        sNo: "8"
                    },
                    {
                        value: "Rent Management Portal",
                        label: "Rent Management Portal",
                        id: 9,
                        sNo: "9"
                    }
                ];
                // Combine backend data with predefined options
                const combinedSiteOptions = [...predefinedSiteOptions, ...formattedData];
                setSiteOptions(combinedSiteOptions);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchSites();
    }, []);
    useEffect(() => {
        fetchWeeklyType();
    }, []);
    useEffect(() => {
        fetchAccountDetails();
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
    // Calculations
    const totalExpenses =
        expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0) + (Number(newExpense.amount) || 0);
    const totalPayments =
        payments.reduce((sum, p) => sum + Number(p.amount || 0), 0) + (Number(newPayment.amount) || 0);
    const totalRefund = allRefundAmount
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
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
                numericValue = "";   // clear instead of clamping
            }
            if (numericValue < 0) numericValue = 0;
            setNewExpense((prev) => ({ ...prev, amount: numericValue }));
        } else {
            setNewExpense((prev) => ({ ...prev, [name]: value }));
        }
    };
    // Immediate date validation for Expense
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
            });
        } else {
            setNewExpense((prev) => ({ ...prev, date: dateStr }));
        }
    };
    // Expense save on Enter with date checked previously
    const handleKeyDownExpense = async (e) => {
        if (e.key !== "Enter") return;
        if (!newExpense.date) {
            alert("Please select a date");
            return;
        }
        if (!selectedProjectName || !newExpense.type || !newExpense.amount) {
            alert("Please fill all fields except date");
            return;
        }
        try {
            // ---------- Common object for weekly-expenses ----------
            const expenseForBackend = {
                date: newExpense.date,
                contractor_id: selectedContractor ? Number(selectedContractor.id) : null,
                vendor_id: selectedVendor ? Number(selectedVendor.id) : null,
                employee_id: selectedEmployee ? Number(selectedEmployee.id) : null,
                project_id: selectedProjectName ? Number(selectedProjectName.id) : null,
                type: newExpense.type,
                amount: Number(newExpense.amount),
                weekly_number: currentWeekNumber,
                status: false,
                created_at: new Date().toISOString(),
                advance_portal_id: null, // will be filled if Project Advance
                staff_advance_portal_id: null, // will be filled if Staff Advance
            };
            if (newExpense.type === "Project Advance") {
                // ---------- Save to advance_portal ----------
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
                const saveAdvance = await fetch("https://backendaab.in/aabuildersDash/api/advance_portal/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(advancePayload),
                });
                if (!saveAdvance.ok) throw new Error("Failed to save advance");
                const savedAdvance = await saveAdvance.json();
                // ✅ use correct field name from backend
                expenseForBackend.advance_portal_id = savedAdvance.advancePortalId;
                // ---------- Save to weekly-expenses ----------
                const saveWeekly = await fetch("https://backendaab.in/aabuildersDash/api/weekly-expenses/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(expenseForBackend),
                });
                if (!saveWeekly.ok) throw new Error("Failed to save weekly expense");
                const savedWeekly = await saveWeekly.json();
                setExpenses((prev) => {
                    const newExpenses = [savedAdvance, savedWeekly, ...prev];
                    // Fetch descriptions for the new Project Advance rows
                    fetchPortalDescriptions(newExpenses);
                    return newExpenses;
                });
                window.location.reload();
            } else if (newExpense.type === "Staff Advance") {
                // ---------- Save to staff-advance ----------
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
                // ---------- Save to weekly-expenses ----------
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
                    // Fetch descriptions for the new Staff Advance rows
                    fetchStaffAdvanceDescriptions(newExpenses);
                    return newExpenses;
                });
                window.location.reload();
            } else {
                // ---------- Normal case (not Project Advance or Staff Advance) ----------
                const res = await fetch("https://backendaab.in/aabuildersDash/api/weekly-expenses/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(expenseForBackend),
                });
                if (!res.ok) throw new Error("Failed to save weekly expense");
                const saved = await res.json();
                setExpenses((prev) => {
                    const newExpenses = [saved, ...prev];
                    // Fetch descriptions for the new Project Advance rows
                    fetchPortalDescriptions(newExpenses);
                    return newExpenses;
                });
                window.location.reload();
            }
            // ---------- Reset fields ----------
            setNewExpense({ date: "", contractor: "", project: "", type: "", amount: "", staff_advance_portal_id: "" });
            setSelectedVendor("");
            setSelectedContractor("");
            setSelectedProjectName("");
        } catch (err) {
            alert("Error saving expense: " + err.message);
        }
    };
    // Payment input change with immediate date validation
    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        if (name === "date") {
            validatePaymentDate(value);
        } else {
            setNewPayment((prev) => ({ ...prev, [name]: value }));
        }
    };
    // Immediate date validation for Payment
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
            });
        } else {
            setNewPayment((prev) => ({ ...prev, date: dateStr }));
        }
    };
    // Payment save on Enter with date checked previously
    const handleKeyDownPayment = (e) => {
        if (e.key !== "Enter") return;
        if (!newPayment.date) {
            alert("Please select a date");
            return;
        }
        if (!newPayment.amount || !newPayment.type) {
            alert("Please fill Amount and Type");
            return;
        }
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
            .catch((err) => alert("Error saving payment: " + err.message));
    };
    // Open Account Closure popup
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
            if (
                row.type === "Project Advance" &&
                editFormData.type !== "Project Advance" &&
                row.advance_portal_id
            ) {
                const clearedData = {
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
                const res = await fetch(
                    `https://backendaab.in/aabuildersDash/api/advance_portal/edit/${row.advance_portal_id}?editedBy=${username}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(clearedData),
                    }
                );
                const data = await res.json().catch(() => null);
            }
            // Handle Staff Advance clearing when changing from Staff Advance to another type
            if (
                row.type === "Staff Advance" &&
                editFormData.type !== "Staff Advance" &&
                row.staff_advance_portal_id
            ) {
                const clearedData = {
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
                const res = await fetch(
                    `https://backendaab.in/aabuildersDash/api/staff-advance/${row.staff_advance_portal_id}?editedBy=${username}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(clearedData),
                    }
                );
                const data = await res.json().catch(() => null);
            }
            if (
                (row.type !== "Project Advance" &&
                    editFormData.type === "Project Advance") ||
                row.type === "Project Advance"
            ) {
                const advancePayload = {
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
                    week_no: editFormData.weekly_number,
                    description: editFormData.description || "", // 🔥 from popup
                    file_url: editFormData.file_url || "",
                };
                if (row.advance_portal_id) {
                    await fetch(
                        `https://backendaab.in/aabuildersDash/api/advance_portal/edit/${row.advance_portal_id}?editedBy=${username}`,
                        {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(advancePayload),
                        }
                    );
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
                    advancePayload.entry_no = nextEntryNo;
                    const saveAdvance = await fetch(
                        "https://backendaab.in/aabuildersDash/api/advance_portal/save",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(advancePayload),
                        }
                    );
                    if (!saveAdvance.ok) throw new Error("Failed to save advance");
                    const savedAdvance = await saveAdvance.json();
                    editFormData.advance_portal_id = savedAdvance.advancePortalId;
                }
            }
            // Handle Staff Advance editing
            if (
                (row.type !== "Staff Advance" &&
                    editFormData.type === "Staff Advance") ||
                row.type === "Staff Advance"
            ) {
                const staffAdvancePayload = {
                    type: "Advance",
                    date: editFormData.date,
                    employee_id: editFormData.employee_id || null,
                    amount: Number(editFormData.amount) || 0,
                    week_no: editFormData.weekly_number,
                    staff_payment_mode: "Cash",
                    from_purpose_id: 4,
                    description: editFormData.description || "",
                };
                if (row.staff_advance_portal_id) {
                    await fetch(
                        `https://backendaab.in/aabuildersDash/api/staff-advance/${row.staff_advance_portal_id}?editedBy=${username}`,
                        {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(staffAdvancePayload),
                        }
                    );
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
                    staffAdvancePayload.entry_no = nextEntryNo;
                    const saveStaffAdvance = await fetch(
                        "https://backendaab.in/aabuildersDash/api/staff-advance/save",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(staffAdvancePayload),
                        }
                    );
                    if (!saveStaffAdvance.ok) throw new Error("Failed to save staff advance");
                    const savedStaffAdvance = await saveStaffAdvance.json();
                    editFormData.staff_advance_portal_id = savedStaffAdvance.id;
                }
            }
            if (!onlyDescriptionChanged) {
                const response = await fetch(
                    `https://backendaab.in/aabuildersDash/api/weekly-expenses/edit/${row.id}?username=${encodeURIComponent(
                        username
                    )}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(editFormData),
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
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/payments-received/edit/${row.id} ?username=${encodeURIComponent(username)}`, {
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
                const response = await fetch(`https://backendaab.in/aabuildersDash/api/weekly-expenses/delete/${id}`, {
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

    const getVendorName = (id) =>
        vendorOptions.find(v => v.id === id)?.value || "";
    const getContractorName = (id) =>
        contractorOptions.find(c => c.id === id)?.value || "";
    const getEmployeeName = (id) =>
        employeeOptions.find(c => c.id === id)?.value || "";
    const getSiteName = (id) =>
        siteOptions.find(s => String(s.id) === String(id))?.value || "";
    const filteredExpenses = expenses.filter((entry) => {
        if (selectDate) {
            const [year, month, day] = selectDate.split("-");
            const formattedSelectDate = `${parseInt(day)}-${parseInt(month)}-${year}`;
            const entryDateObj = new Date(entry.date);
            const formattedEntryDate = `${entryDateObj.getDate()}-${entryDateObj.getMonth() + 1}-${entryDateObj.getFullYear()}`;
            if (formattedEntryDate !== formattedSelectDate) return false;
        }
        if (selectContractororVendorName) {
            const name =
                entry.vendor_id
                    ? getVendorName(entry.vendor_id)
                    : getContractorName(entry.contractor_id) || getEmployeeName(entry.employee_id);
            if (name.toLowerCase() !== selectContractororVendorName.toLowerCase())
                return false;
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
                        aValue = combinedOptions.find(opt =>
                            (opt.type === "Contractor" && opt.id === Number(a.contractor_id)) ||
                            (opt.type === "Vendor" && opt.id === Number(a.vendor_id)) ||
                            (opt.type === "Employee" && opt.id === Number(a.employee_id))
                        )?.label || "";
                        bValue = combinedOptions.find(opt =>
                            (opt.type === "Contractor" && opt.id === Number(b.contractor_id)) ||
                            (opt.type === "Vendor" && opt.id === Number(b.vendor_id)) ||
                            (opt.type === "Employee" && opt.id === Number(b.employee_id))
                        )?.label || "";
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
    }, [filteredExpenses, sortConfig, combinedOptions, siteOptions]);
    const contractorVendorFilterOptions = React.useMemo(() => {
        const ids = new Set();
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
    }, [filteredExpenses, combinedOptions]);
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
                <div className="text-left">
                    <button onClick={() => setShowFilters(!showFilters)}>
                        <img
                            src={Filter}
                            alt="Toggle Filter"
                            className="w-7 h-7 border border-[#BF9853] rounded-md mb-3"
                        />
                    </button>
                </div>
                <div className="w-full mt- flex flex-col xl:flex-row gap-6">
                    <div className="flex-[3] min-w-0">
                        <div className="flex justify-between mb-4">
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
                                                <span className="font-normal">Contractor/Vendor Name: </span>
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
                                            <th className="pt-2 pl-2 w-[60px] font-bold text-left">Sl.No</th>
                                            <th className="pt-2 w-[135px] font-bold text-left cursor-pointer hover:bg-gray-200"
                                                onClick={() => handleSort('date')}
                                            >
                                                Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="px-1 w-[200px] font-bold text-left cursor-pointer hover:bg-gray-200"
                                                onClick={() => handleSort('contractor_vendor')}
                                            >
                                                Contractor/Vendor {sortConfig.key === 'contractor_vendor' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="px-1 w-[240px] font-bold text-left cursor-pointer hover:bg-gray-200"
                                                onClick={() => handleSort('project_name')}
                                            >
                                                Project Name {sortConfig.key === 'project_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="px-1 w-[100px] font-bold text-left cursor-pointer hover:bg-gray-200"
                                                onClick={() => handleSort('type')}
                                            >
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
                                                        options={contractorVendorFilterOptions}
                                                        value={selectContractororVendorName ? { value: selectContractororVendorName, label: selectContractororVendorName } : null}
                                                        onChange={(opt) => setSelectContractororVendorName(opt ? opt.value : "")}
                                                        className="text-xs focus:outline-none"
                                                        placeholder="Contractor/Ven..."
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
                                                        {weeklyTypes.map((type, index) => (
                                                            <option key={index} value={type.type}>
                                                                {type.type}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </th>
                                                <th className="pt-2 pb-2 w-[110px]"></th>
                                                <th className="pt-2 pb-2 w-[120px]"></th>
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
                                                />
                                            </td>
                                            <td className="pt-2 pb-2 w-[200px]">
                                                <Select
                                                    name="party"
                                                    value={selectedContractor || selectedVendor || selectedEmployee || null}
                                                    onChange={(selectedOption) => {
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
                                                    }}
                                                    options={combinedOptions}
                                                    placeholder="Contractor/Ven..."
                                                    isSearchable
                                                    isClearable
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
                                            <td className="pt-2 pb-2 w-[240px]">
                                                <Select
                                                    name="project"
                                                    value={selectedProjectName}
                                                    onChange={(selectedOption) => {
                                                        setSelectedProjectName(selectedOption);
                                                    }}
                                                    options={siteOptions}
                                                    placeholder="Project Name..."
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
                                                    disabled={!newExpense.date || !selectedProjectName}
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
                                                                    combinedOptions.find(
                                                                        opt =>
                                                                            (opt.type === "Contractor" && opt.id === Number(editFormData.contractor_id)) ||
                                                                            (opt.type === "Vendor" && opt.id === Number(editFormData.vendor_id)) ||
                                                                            (opt.type === "Employee" && opt.id === Number(editFormData.employee_id))
                                                                    ) || null
                                                                }
                                                                onChange={(selectedOption) => {
                                                                    if (!selectedOption) {
                                                                        handleEditChange({ target: { name: "contractor_id", value: "" } });
                                                                        handleEditChange({ target: { name: "vendor_id", value: "" } });
                                                                    } else if (selectedOption.type === "Contractor") {
                                                                        handleEditChange({ target: { name: "contractor_id", value: selectedOption.id } });
                                                                        handleEditChange({ target: { name: "vendor_id", value: "" } });
                                                                    } else if (selectedOption.type === "Vendor") {
                                                                        handleEditChange({ target: { name: "vendor_id", value: selectedOption.id } });
                                                                        handleEditChange({ target: { name: "contractor_id", value: "" } });
                                                                    }
                                                                }}
                                                                options={combinedOptions}
                                                                placeholder="Contractor/Ven..."
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
                                                            combinedOptions.find(
                                                                opt =>
                                                                    (opt.type === "Contractor" && opt.id === Number(row.contractor_id)) ||
                                                                    (opt.type === "Vendor" && opt.id === Number(row.vendor_id)) ||
                                                                    (opt.type === "Employee" && opt.id === Number(row.employee_id))
                                                            )?.label || ""
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
                                                                                // Fetch previous payments for this expense
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
                                                                {/* Payment Mode Display */}
                                                                {(() => {
                                                                    const payments = getPaymentsByExpenseId(row.id);
                                                                    const paymentModes = [...new Set(payments.map(p => p.bill_payment_mode).filter(mode => mode !== null && mode !== undefined))];

                                                                    if (paymentModes.length === 0) return null;
                                                                    // Create hover tooltip content
                                                                    const hoverContent = payments.map(payment =>
                                                                        `${payment.bill_payment_mode}: ₹${payment.amount.toLocaleString('en-IN')}`
                                                                    ).join('\n');
                                                                    return (
                                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                                            {paymentModes.length === 1 ? (
                                                                                // Single payment mode - show it directly
                                                                                <span
                                                                                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-blue-200 transition-colors"
                                                                                    title={hoverContent}
                                                                                >
                                                                                    {paymentModes[0]}
                                                                                </span>
                                                                            ) : (
                                                                                // Multiple payment modes - show "Online"
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
                                                                        <img
                                                                            src={
                                                                                portalDescriptions[row.advance_portal_id] ? NotesEnd : NotesStart
                                                                            }
                                                                            alt="Notes"
                                                                            className="w-4 h-4 mr-3"
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
                                                                        href={row.bill_copy_url}
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
                                                                    <button
                                                                        onClick={() => saveEditedExpense(row)}
                                                                        className="text-green-600 font-bold text-lg mr-3"
                                                                    >
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
                                                            disabled={row.type === "Carry (CF))" || row.type === "Wage Refund" || row.type === "Claim"}
                                                        >
                                                            ✓
                                                        </button>
                                                    ) : (
                                                        row.type === "Carry (CF)" || row.type === "Wage Refund" || row.type === "Claim" ? (
                                                            <img
                                                                className="w-5 h-4 opacity-40 cursor-not-allowed"
                                                                src={Edit}
                                                                alt="Edit Disabled"
                                                            />
                                                        ) : (
                                                            <button onClick={() => handleEditPaymentClick(row)}>
                                                                <img className="w-5 h-4" src={Edit} alt="Edit" />
                                                            </button>
                                                        )
                                                    )}
                                                    {row.type === "Carry (CF)" || row.type === "Wage Refund" || row.type === "Claim" ? (
                                                        <img
                                                            className="w-5 h-4 opacity-40 cursor-not-allowed"
                                                            src={Delete}
                                                            alt="Delete Disabled"
                                                        />
                                                    ) : (
                                                        <button className="pl-3">
                                                            <img src={Delete} className="w-5 h-4" alt="Delete" onClick={() => handleWeeklyReceivedDelete(row.id)} />
                                                        </button>
                                                    )}
                                                    {row.type === "Carry (CF)" || row.type === "Wage Refund" || row.type === "Claim" ? (
                                                        <img
                                                            className="w-5 h-4 opacity-40 cursor-not-allowed"
                                                            src={history}
                                                            alt="History Disabled"
                                                        />
                                                    ) : (
                                                        <button className="" onClick={() => fetchAuditDetailsForPaymentReceived(row.id)}>
                                                            <img src={history} className="w-5 h-4" alt="History" />
                                                        </button>
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
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <select
                                                name="type"
                                                className="border-2 border-[#BF9853] border-opacity-25 w-[90px] h-[40px] rounded-lg focus:outline-none"
                                                value={newPayment.type} onChange={handlePaymentChange} onKeyDown={handleKeyDownPayment}>
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
                        <button
                            className="px-4 py-2 bg-[#BF9853] w-[90px] text-white rounded-lg"
                            onClick={() => {
                                if (popup.type === "expense") {
                                    setNewExpense((prev) => ({ ...prev, date: popup.dateStr }));
                                } else {
                                    setNewPayment((prev) => ({ ...prev, date: popup.dateStr }));
                                }
                                setPopup({ show: false, message: "", type: "", dateStr: "" });
                            }}
                        >
                            Ignore
                        </button>
                        <button
                            className="px-4 py-2 border border-[#BF9853] w-[90px] rounded-lg"
                            onClick={() => {
                                if (popup.type === "expense") {
                                    setNewExpense((prev) => ({ ...prev, date: "" }));
                                } else {
                                    setNewPayment((prev) => ({ ...prev, date: "" }));
                                }
                                setPopup({ show: false, message: "", type: "", dateStr: "" });
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

                                                {/* Second Row: Transaction Number, Account Number, Cheque Fields */}
                                                <div className="border-2 border-[#BF9853] border-opacity-25 rounded-lg p-4">
                                                    <div className="space-y-4">
                                                        {/* Cheque Fields Row (if cheque payment) */}
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
                                                        {/* Transaction Number and Account Number Row */}
                                                        <div className="grid grid-cols-2 gap-4">
                                                            {/* Transaction Number */}
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Number</label>
                                                                <input
                                                                    type="text"
                                                                    value={payment.transaction_number || ""}
                                                                    readOnly
                                                                    className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full  text-gray-600"
                                                                />
                                                            </div>
                                                            {/* Account Number */}
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
                        {/* Status Message for Claim type */}
                        {currentProjectAdvanceRow && currentProjectAdvanceRow.type === "Claim" && currentProjectAdvanceRow.send_to_expenses_entry && (
                            <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="text-center">
                                    <span className="text-sm font-medium text-green-700">
                                        This Claim Amount Was Already Sent to the Expense Entry
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center mt-6">
                            {/* Add To Expense Entry Button - only for Claim type */}
                            {currentProjectAdvanceRow && currentProjectAdvanceRow.type === "Claim" && !currentProjectAdvanceRow.send_to_expenses_entry && (
                                <button
                                    onClick={async () => {
                                        try {
                                            // First, get the next ENo from the expenses form API
                                            const enoResponse = await fetch('https://backendaab.in/aabuilderDash/expenses_form/get_form');
                                            if (!enoResponse.ok) {
                                                throw new Error('Failed to fetch ENo');
                                            }
                                            const enoData = await enoResponse.json();
                                            const nextEno = enoData.length > 0 ? Math.max(...enoData.map(item => item.eno || 0)) + 1 : 1;

                                            // Prepare expenses form data
                                            const expensesFormData = {
                                                accountType: "Claim",
                                                eno: nextEno,
                                                date: currentProjectAdvanceRow.date,
                                                siteName: siteOptions.find(opt => opt.id === Number(currentProjectAdvanceRow.project_id))?.label || "",
                                                vendor: vendorOptions.find(opt => opt.id === Number(currentProjectAdvanceRow.vendor_id))?.label || "",
                                                quantity: 1,
                                                contractor: contractorOptions.find(opt => opt.id === Number(currentProjectAdvanceRow.contractor_id))?.label || "",
                                                amount: Number(currentProjectAdvanceRow.amount) + previousPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
                                                category: "Claim",
                                                comments: `Claim from Weekly Payment `,
                                                machineTools: "",
                                                billCopyUrl: currentProjectAdvanceRow.bill_copy_url
                                            };

                                            // Send data to expenses form API
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

                                            // Then update the weekly expenses status
                                            const response = await fetch(`https://backendaab.in/aabuildersDash/api/weekly-expenses/${currentProjectAdvanceRow.id}/send-to-expenses`, {
                                                method: 'PUT',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                },
                                            });
                                            
                                            if (response.ok) {
                                                // Refresh the expenses data from server to get updated status
                                                await fetchExpenses();
                                                
                                                // Update the current row as well
                                                setCurrentProjectAdvanceRow(prev => ({ ...prev, send_to_expenses_entry: true }));
                                                
                                                // Show success message
                                                setPopup({
                                                    show: true,
                                                    message: "Successfully added to expense entry!",
                                                    type: "success",
                                                    dateStr: new Date().toLocaleDateString('en-GB')
                                                });
                                                
                                                // Close popup after 2 seconds
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
                                                }, 2000);
                                            } else {
                                                throw new Error('Failed to update expense entry status');
                                            }
                                        } catch (error) {
                                            console.error('Error updating expense entry status:', error);
                                            setPopup({
                                                show: true,
                                                message: "Failed to add to expense entry. Please try again.",
                                                type: "error",
                                                dateStr: new Date().toLocaleDateString('en-GB')
                                            });
                                        }
                                    }}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Add To Expense Entry
                                </button>
                            )}

                            {/* Right side buttons */}
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

                                                // Handle Project Advance type first
                                                if (currentProjectAdvanceRow.type === "Project Advance" && currentProjectAdvanceRow.advance_portal_id) {
                                                    try {
                                                        // Get the last entry number from all advance portal records and add 1
                                                        const res = await fetch("https://backendaab.in/aabuildersDash/api/advance_portal/getAll");
                                                        if (!res.ok) throw new Error("Failed to fetch entry numbers");
                                                        const allData = await res.json();
                                                        const maxEntryNo =
                                                            allData.length > 0
                                                                ? Math.max(...allData.map((item) => item.entry_no || 0))
                                                                : 0;
                                                        const nextEntryNo = maxEntryNo + 1;
                                                        // Get week number
                                                        const getWeekNumber = () => {
                                                            const now = new Date();
                                                            const start = new Date(now.getFullYear(), 0, 1);
                                                            const diff =
                                                                now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000;
                                                            const oneWeek = 604800000; // ms in a week
                                                            return Math.floor(diff / oneWeek) + 1;
                                                        };
                                                        // Get description from portalDescriptions state
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
                                                            console.log("Advance portal payment mode updated successfully, ID:", advancePortalId);
                                                        }
                                                    } catch (error) {
                                                        console.error("Error updating advance portal payment mode:", error);
                                                    }
                                                }

                                                // Handle Staff Advance type
                                                if (currentProjectAdvanceRow.type === "Staff Advance") {
                                                    try {
                                                        // Get the last entry number from staff-advance/all endpoint
                                                        const staffAdvanceRes = await fetch("https://backendaab.in/aabuildersDash/api/staff-advance/all");
                                                        if (!staffAdvanceRes.ok) throw new Error("Failed to fetch staff advance entry numbers");
                                                        const staffAdvanceData = await staffAdvanceRes.json();
                                                        const maxEntryNo =
                                                            staffAdvanceData.length > 0
                                                                ? Math.max(...staffAdvanceData.map((item) => item.entry_no || 0))
                                                                : 0;
                                                        const nextEntryNo = maxEntryNo + 1;

                                                        // Get week number
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
                                                            console.log("Staff advance saved successfully, ID:", staffAdvancePortalId);
                                                        }
                                                    } catch (error) {
                                                        console.error("Error saving staff advance:", error);
                                                    }
                                                }

                                                // Now save the weekly payment bill with the portal IDs
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
                                                console.log("Saving payment data:", paymentData);
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
                        {/* Total Amount Display for Claim type - at bottom */}
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
            {/* File Upload Popup */}
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
                                <a href={currentFileRow.bill_copy_url}
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
            {/* Payment Details Popup */}
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
                            <button
                                onClick={() => {
                                    setShowPaymentDetailsPopup(false);
                                    setSelectedPaymentDetails([]);
                                }}
                                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Close
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