import React, { useState, useEffect, useCallback } from "react";
import Edit from '../Images/Edit.svg'
import Delete from '../Images/Delete.svg'
import Select from 'react-select';
import history from '../Images/History.svg';

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
    const [selectedProjectName, setSelectedProjectName] = useState(null);
    const [selectedContractor, setSelectedContractor] = useState(null);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [weeklyTypes, setWeeklyTypes] = useState([]);
    const [showWeeklyPaymentExpensesModal, setShowWeeklyPaymentExpensesModal] = useState(false);
    const [weeklyPaymentExpensesAudits, setWeeklyPaymentExpensesAudits] = useState([]);
    const [showWeeklyPaymentReceivedModal, setShowWeeklyPaymentReceivedModal] = useState(false);
    const [weeklyPaymentReceivedAudits, setWeeklyPaymentReceivedAudits] = useState([]);
    const [popup, setPopup] = useState({ show: false, message: "", type: "", dateStr: "" });
    // Expenses
    const [expenses, setExpenses] = useState([]);
    const [newExpense, setNewExpense] = useState({
        date: "",
        contractor: "",
        vendor: "",
        project: "",
        type: "",
        amount: "",
    });
    const [editingRowId, setEditingRowId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        date: "",
        contractor_id: "",
        vendor_id: "",
        project_id: "",
        type: "",
        amount: "",
        advance_portal_id:"",
    });
    const handleEditClick = (row) => {
        setEditingRowId(row.id);
        setEditFormData({
            date: row.date,
            contractor_id: row.contractor_id,
            vendor_id: row.vendor_id,
            project_id: row.project_id,
            type: row.type,
            amount: row.amount,
            advance_portal_id: row.advance_portal_id
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
        else {
            setEditFormData((prev) => ({ ...prev, [name]: value }));
        }
    };
    // Payments
    const [payments, setPayments] = useState([]);
    const [newPayment, setNewPayment] = useState({ date: "", amount: "", type: "Weekly" });
    // Account Closure popup
    const [showPopup, setShowPopup] = useState(false);
    const [carryForwardBalance, setCarryForwardBalance] = useState(0);
    const [editingPaymentId, setEditingPaymentId] = useState(null);
    const [editPaymentData, setEditPaymentData] = useState({
        date: "",
        amount: "",
        type: ""
    });
    const handleEditPaymentClick = (row) => {
        setEditingPaymentId(row.id || null);
        setEditPaymentData({
            date: row.date,
            amount: row.amount,
            type: row.type
        });
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
    useEffect(() => { setCombinedOptions([...vendorOptions, ...contractorOptions]); }, [vendorOptions, contractorOptions]);
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
                setSiteOptions(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchSites();
    }, []);
    useEffect(() => {
        fetchWeeklyType();
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
    // Fetch current week number from backend
    const fetchCurrentWeekNumber = useCallback(() => {
        fetch("https://backendaab.in/aabuildersDash/api/payments-received/current-week")
            .then((res) => res.json())
            .then(setCurrentWeekNumber)
            .catch(console.error);
    }, []);
    // Fetch expenses by currentWeekNumber
    const fetchExpenses = useCallback(() => {
        if (!currentWeekNumber) return;
        fetch(`https://backendaab.in/aabuildersDash/api/weekly-expenses/week/${currentWeekNumber}`)
            .then((res) => res.json())
            .then(setExpenses)
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
    // Initial fetch of current week number
    useEffect(() => {
        fetchCurrentWeekNumber();
    }, [fetchCurrentWeekNumber]);
    // Fetch expenses and payments whenever current week changes
    useEffect(() => {
        if (currentWeekNumber) {
            fetchExpenses();
            fetchPayments();
        }
    }, [currentWeekNumber, fetchExpenses, fetchPayments]);
    // Calculations
    const totalExpenses =
        expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0) + (Number(newExpense.amount) || 0);
    const totalPayments =
        payments.reduce((sum, p) => sum + Number(p.amount || 0), 0) + (Number(newPayment.amount) || 0);
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
                project_id: selectedProjectName ? Number(selectedProjectName.id) : null,
                type: newExpense.type,
                amount: Number(newExpense.amount),
                weekly_number: currentWeekNumber,
                status: false,
                created_at: new Date().toISOString(),
                advance_portal_id: null, // will be filled if Project Advance
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

                setExpenses((prev) => [savedAdvance, savedWeekly, ...prev]);
                window.location.reload();
            } else {
                // ---------- Normal case (not Project Advance) ----------
                const res = await fetch("https://backendaab.in/aabuildersDash/api/weekly-expenses/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(expenseForBackend),
                });
                if (!res.ok) throw new Error("Failed to save weekly expense");
                const saved = await res.json();
                setExpenses((prev) => [saved, ...prev]);
                window.location.reload();
            }

            // ---------- Reset fields ----------
            setNewExpense({ date: "", contractor: "", project: "", type: "", amount: "" });
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
    // Account Closure handler
    const handleAccountClosure = async (type, discountAmount = 0) => {
        try {
            // Determine if carry forward applies to both continue and handover
            const carryForwardParam = (type === "Carry (CF)" || type === "Handover") ? "true" : "false";
            const carryAmountParam = carryForwardParam === "true" && balance > 0 ? balance : 0;
            // Construct URL and params
            const url = new URL("https://backendaab.in/aabuildersDash/api/payments-received/account-closure");
            url.searchParams.append("closureType", type);
            url.searchParams.append("carryForward", carryForwardParam);
            url.searchParams.append("carryAmount", carryAmountParam - discountAmount);
            url.searchParams.append("discountAmount", discountAmount);
            // API call
            const res = await fetch(url.toString(), { method: "POST" });
            const newWeekNumber = await res.json();
            // Update state, reset forms
            setCurrentWeekNumber(newWeekNumber);
            setNewExpense({ date: "", contractor: "", project: "", type: "", amount: "" });
            setNewPayment({ date: "", amount: "", type: "Weekly" });
        } catch (error) {
            alert("Failed to complete account closure: " + error.message);
        }
    };
    // Group expenses for summary
    const groupedExpenses = expenses.reduce((acc, expense) => {
        if (!acc[expense.type]) acc[expense.type] = 0;
        acc[expense.type] += Number(expense.amount) || 0;
        return acc;
    }, {});
    const mergedExpenses = Object.entries(groupedExpenses).map(([type, amount]) => ({ type, amount }));
    const saveEditedExpense = async (row) => { 
        try {
            // ✅ Case 1: Project Advance → Other (clear advance_portal row)
            if (row.type === "Project Advance" && editFormData.type !== "Project Advance" && row.advance_portal_id) {
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
                    entry_no: null
                };
    
                console.log("➡️ Clearing advance_portal row:", row.advance_portal_id, clearedData);
    
                const res = await fetch(
                    `https://backendaab.in/aabuildersDash/api/advance_portal/edit/${row.advance_portal_id}?editedBy=${username}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(clearedData),
                    }
                );
    
                const data = await res.json().catch(() => null);
                console.log("✅ Advance portal cleared response:", res.status, data);
            }
    
            // ✅ Case 2: Other → Project Advance
            if (row.type !== "Project Advance" && editFormData.type === "Project Advance") {
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
                    description: editFormData.description || "",
                    file_url: editFormData.file_url || "",
                };
    
                if (row.advance_portal_id) {
                    // 🔄 Update existing advance_portal row
                    console.log("➡️ Updating existing advance_portal:", row.advance_portal_id, advancePayload);
    
                    const res = await fetch(
                        `https://backendaab.in/aabuildersDash/api/advance_portal/edit/${row.advance_portal_id}?editedBy=${username}`,
                        {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(advancePayload),
                        }
                    );
    
                    const updatedAdvance = await res.json();
                    console.log("✅ Advance portal updated:", updatedAdvance);
    
                    editFormData.advance_portal_id = row.advance_portal_id;
                } else {
                    // ➕ Create a new advance_portal row
                    console.log("➡️ Creating new advance_portal:", advancePayload);
    
                    // 🔹 Generate entry_no like in handleKeyDownExpense
                    const resAll = await fetch("https://backendaab.in/aabuildersDash/api/advance_portal/getAll");
                    if (!resAll.ok) throw new Error("Failed to fetch entry numbers");
                    const allData = await resAll.json();
                    const maxEntryNo =
                        allData.length > 0
                            ? Math.max(...allData.map((item) => item.entry_no || 0))
                            : 0;
                    const nextEntryNo = maxEntryNo + 1;
    
                    advancePayload.entry_no = nextEntryNo; // ✅ assign entry_no
    
                    const saveAdvance = await fetch("https://backendaab.in/aabuildersDash/api/advance_portal/save", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(advancePayload),
                    });
    
                    if (!saveAdvance.ok) throw new Error("Failed to save advance");
                    const savedAdvance = await saveAdvance.json();
    
                    console.log("✅ Advance portal created:", savedAdvance);
    
                    // attach advance_portal_id into editFormData
                    editFormData.advance_portal_id = savedAdvance.advancePortalId;
    
                    // 🔄 ensure weekly-expenses row is updated with the new advance_portal_id
                    console.log("➡️ Linking new advance_portal_id to weekly-expenses:", savedAdvance.advancePortalId);
                }
            }
    
            // ✅ Case 3: Always update weekly-expenses
            console.log("➡️ Updating weekly-expenses row:", row.id, editFormData);
            const response = await fetch(
                `https://backendaab.in/aabuildersDash/api/weekly-expenses/edit/${row.id}?username=${encodeURIComponent(username)}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editFormData),
                }
            );
    
            if (!response.ok) throw new Error("Failed to update expense");
    
            const updatedExpense = await response.json();
            console.log("✅ Weekly-expense updated:", updatedExpense);
            window.location.reload();
    
            setExpenses((prevExpenses) =>
                prevExpenses.map((exp) => (exp.id === row.id ? updatedExpense : exp))
            );
            setEditingRowId(null);
        } catch (error) {
            console.error("❌ Error updating expense:", error);
        }
    };
    
    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            borderWidth: '2px',
            borderRadius: '8px',
            borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'rgba(191, 152, 83, 0.2)',
            boxShadow: state.isFocused ? '0 0 0 1px rgba(101, 102, 53, 0.1)' : 'none',
            '&:hover': {
                borderColor: 'rgba(191, 152, 83, 0.2)',
            }
        }),
    };
    const saveEditedPaymentReceived = async (row) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/payments-received/edit/${row.id} ?username=${encodeURIComponent(username)}`, {
                method: "PUT", // assuming backend uses PUT
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editPaymentData), // send edited data
            });
            if (!response.ok) {
                throw new Error("Failed to update payment");
            }
            const updatedPayment = await response.json();
            window.location.reload();
            // ✅ Update local state so UI refreshes with new values
            setPayments((prev) =>
                prev.map((p) => (p.id === row.id ? updatedPayment : p))
            );
            // ✅ Clear edit mode
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
    return (
        <div>
            {/* Balance display */}
            <div className="mt-[-25px] lg:ml-[1580px] ml-[660px]">
                <h1 className="font-bold text-xl">
                    Balance: <span style={{ color: "#E4572E" }}>
                        {(balance - (Number(newExpense.amount) || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2, })}
                    </span>
                </h1>
            </div>
            <div className="mx-auto w-auto p-6 bg-white ml-[30px] mr-6 rounded-md border border-transparent">
                {/* Header */}
                <div className="lg:w-[1150px] mt-5">
                    <div className="flex justify-between  ml-16">
                        <h1 className="font-bold text-xl">PS: {currentWeekNumber ?? "-"}</h1>
                        <h1 className="font-bold text-base">
                            Expenses: <span style={{ color: "#E4572E" }}>{Number(totalExpenses).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2, })}</span>
                        </h1>
                    </div>
                    <div className=" lg:flex ml-16 gap-10" key={currentWeekNumber /* force re-mount on week change */}>
                        {/* Expenses Table */}
                        <div className="w-[1100px] rounded-lg border-l-8 border-l-[#BF9853]">
                            <table className=" border-collapse text-left">
                                <thead>
                                    <tr className="bg-[#FAF6ED] h-12">
                                        <th className="px-4 py-2 text-left">Sl.No</th>
                                        <th className="px-4 py-2 text-left">Date</th>
                                        <th className="px-4 py-2 text-left">Contractor/Vendor</th>
                                        <th className="px-4 py-2 text-left">Project Name</th>
                                        <th className="px-4 py-2 text-left">Type</th>
                                        <th className="px-4 py-2 text-left">Amount</th>
                                        <th className="px-4 py-2 text-left">Activity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Input Row */}
                                    <tr>
                                        <td className="px-4 py-2 font-bold">{expenses.length + 1}.</td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="date"
                                                name="date"
                                                className="border-2 border-[#BF9853] border-opacity-25 p-1 rounded-lg w-[130px] h-[38px] focus:outline-none"
                                                value={newExpense.date}
                                                onChange={handleExpenseChange}
                                                onKeyDown={handleKeyDownExpense}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <Select
                                                name="party"
                                                className="w-[202px]"
                                                value={selectedContractor || selectedVendor || null} // show whichever is selected
                                                onChange={(selectedOption) => {
                                                    if (!selectedOption) {
                                                        setSelectedContractor(null);
                                                        setSelectedVendor(null);
                                                    } else if (selectedOption.type === "Contractor") {
                                                        setSelectedContractor(selectedOption);
                                                        setSelectedVendor(null); // clear vendor if contractor selected
                                                    } else if (selectedOption.type === "Vendor") {
                                                        setSelectedVendor(selectedOption);
                                                        setSelectedContractor(null); // clear contractor if vendor selected
                                                    }
                                                }}
                                                options={combinedOptions}
                                                placeholder="Contractor/Vendor"
                                                isSearchable
                                                isClearable
                                                styles={customStyles}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <Select
                                                name="project"
                                                className="w-[259px]"
                                                value={selectedProjectName}
                                                onChange={(selectedOption) => {
                                                    setSelectedProjectName(selectedOption); // store the full object
                                                }}
                                                options={siteOptions}
                                                placeholder="Select Site"
                                                isClearable
                                                isSearchable
                                                styles={customStyles}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <select
                                                name="type"
                                                className="border-2 border-[#BF9853] border-opacity-25 p-1 w-[97px] h-[40px] rounded-lg focus:outline-none"
                                                value={newExpense.type}
                                                onChange={handleExpenseChange}
                                                onKeyDown={handleKeyDownExpense}
                                            >
                                                <option value="">Select</option>
                                                {weeklyTypes.map((type, index) => (
                                                    <option key={index} value={type.type}>
                                                        {type.type}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="number"
                                                name="amount"
                                                className="border-2 border-[#BF9853] border-opacity-25 bg-transparent p-1 w-[85px] h-[40px] rounded-lg focus:outline-none no-spinner"
                                                value={newExpense.amount}
                                                onChange={handleExpenseChange}
                                                onKeyDown={handleKeyDownExpense}
                                                disabled={!newExpense.date || !selectedProjectName}
                                                min="0"
                                                step="any"
                                            />
                                        </td>
                                    </tr>
                                    {/* Existing Expenses */}
                                    {[...expenses].reverse().map((row, index) => (
                                        <tr key={row.id} className={`even:bg-[#FAF6ED] odd:bg-[#FFFFFF]`}>
                                            <td className="px-4 py-2 font-bold">{expenses.length - index}</td>
                                            {/* Date column */}
                                            <td className="px-4 py-2">
                                                {editingRowId === row.id ? (
                                                    <input
                                                        type="date"
                                                        name="date"
                                                        className="border-2 border-[#BF9853] border-opacity-25 p-1 rounded-lg w-[130px] h-[32px] focus:outline-none"
                                                        value={editFormData.date}
                                                        onChange={handleEditChange}
                                                    />
                                                ) : (
                                                    formatDateOnly(row.date) || ""
                                                )}
                                            </td>
                                            {/* Contractor column */}
                                            <td className="px-4 py-2">
                                                {editingRowId === row.id ? (
                                                    <Select
                                                        name="party"
                                                        className="w-[202px]"
                                                        value={
                                                            combinedOptions.find(
                                                                opt =>
                                                                    (opt.type === "Contractor" && opt.id === Number(editFormData.contractor_id)) ||
                                                                    (opt.type === "Vendor" && opt.id === Number(editFormData.vendor_id))
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
                                                        placeholder="Contractor/Vendor"
                                                        isSearchable
                                                        styles={customStyles}
                                                    />
                                                ) : (
                                                    // Read-only display using combinedOptions
                                                    <>
                                                        {combinedOptions.find(
                                                            opt =>
                                                                (opt.type === "Contractor" && opt.id === Number(row.contractor_id)) ||
                                                                (opt.type === "Vendor" && opt.id === Number(row.vendor_id))
                                                        )?.label || ""} {/* assuming options have a label property */}
                                                    </>
                                                )}
                                            </td>
                                            {/* Project column */}
                                            <td className="px-4 py-2">
                                                {editingRowId === row.id ? (
                                                    <Select
                                                        name="project_id"
                                                        className="w-[259px]"
                                                        value={siteOptions.find(opt => opt.id === Number(editFormData.project_id)) || null}
                                                        onChange={(selectedOption) =>
                                                            handleEditChange({
                                                                target: { name: "project_id", value: selectedOption ? selectedOption.id : "" }
                                                            })
                                                        }
                                                        options={siteOptions}
                                                        placeholder="Select Site"
                                                        isSearchable
                                                        styles={customStyles}
                                                    />
                                                ) : (
                                                    // Read-only display using siteOptions
                                                    <>
                                                        {siteOptions.find(opt => opt.id === Number(row.project_id))?.label || ""}
                                                    </>
                                                )}
                                            </td>
                                            {/* Type column */}
                                            <td className="px-4 py-2">
                                                {editingRowId === row.id ? (
                                                    <select name="type"
                                                        className="border-2 border-[#BF9853] border-opacity-25 p-1 w-[97px] h-[32px] rounded-lg focus:outline-none"
                                                        value={editFormData.type} onChange={handleEditChange}
                                                    >
                                                        <option value="">Select</option>
                                                        {weeklyTypes.map((type, index) => (
                                                            <option key={index} value={type.type}>
                                                                {type.type}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    row.type
                                                )}
                                            </td>
                                            {/* Amount column */}
                                            <td className="px-4 py-2">
                                                {editingRowId === row.id ? (
                                                    <input
                                                        type="number"
                                                        name="amount"
                                                        className="border-2 border-[#BF9853] border-opacity-25 p-1 w-[85px] h-[32px] bg-transparent rounded-lg focus:outline-none no-spinner"
                                                        value={editFormData.amount}
                                                        onChange={handleEditChange}
                                                        min="0"
                                                        step="any"
                                                    />
                                                ) : (
                                                    Number(row.amount).toLocaleString('en-IN')
                                                )}
                                            </td>
                                            {/* Edit/Save action column */}
                                            <td className="px-4 py-2 flex">
                                                {editingRowId === row.id ? (
                                                    <button
                                                        onClick={() => saveEditedExpense(row)}
                                                        className="text-green-600 font-bold text-lg"
                                                    >
                                                        ✓
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleEditClick(row)}>
                                                        <img className="w-5 h-4" src={Edit} alt="Edit" />
                                                    </button>
                                                )}
                                                <button className="pl-3">
                                                    <img src={Delete} className=" w-5 h-4" onClick={() => handleWeeklyExpensesDelete(row.id)} />
                                                </button>
                                                <button className="" onClick={() => fetchAuditDetailsForExpense(row.id)}>
                                                    <img src={history} className="w-5 h-4 ml-2" alt="History" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Payments + Account Closure + Summary */}
                        <div className="-mt-6">
                            <div className="flex justify-between lg:ml-10 ">
                                <h1 className="font-bold text-base ">Payments Received</h1>
                                <h1 className="font-bold text-base text-[#E4572E]">
                                    Total: <span>{Number(totalPayments).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2, })}</span>
                                </h1>
                            </div>
                            <div className="rounded-lg lg:ml-9 border-l-8 border-l-[#BF9853]" style={{ maxHeight: "400px", overflowY: "auto" }} >
                                <table className=" border-collapse">
                                    <thead className="bg-[#FAF6ED] h-12">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Date</th>
                                            <th className="px-4 py-2">Amount</th>
                                            <th className="px-4 py-2 text-left">Type</th>
                                            <th className="px-4 py-2 text-left">Activity</th>
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
                                                            className="border-2 border-[#BF9853] border-opacity-25 p-1 rounded-lg w-[100px] h-[40px] focus:outline-none"
                                                            value={editPaymentData.date}
                                                            onChange={handleEditPaymentChange}
                                                        />
                                                    ) : (
                                                        formatDateOnly(row.date) || ""
                                                    )}
                                                </td>
                                                <td className="px-2 py-2">
                                                    {editingPaymentId === (row.id || null) ? (
                                                        <input
                                                            type="number"
                                                            name="amount"
                                                            className="border-2 border-[#BF9853] border-opacity-25 rounded-lg w-[100px] h-[40px] focus:outline-none"
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
                                                <td className="px-2 py-2 flex items-center justify-between">
                                                    {editingPaymentId === (row.id || null) ? (
                                                        <>
                                                            <select
                                                                name="type"
                                                                className="border-2 border-[#BF9853] border-opacity-25 w-[100px] h-[40px] rounded-lg focus:outline-none"
                                                                value={editPaymentData.type} onChange={handleEditPaymentChange}
                                                            >
                                                                <option value="Weekly">Weekly</option>
                                                                <option value="Daily">Daily</option>
                                                                <option value="Monthly">Monthly</option>
                                                            </select>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {row.type}
                                                        </>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="flex">
                                                        {editingPaymentId === row.id ? (
                                                            <button
                                                                onClick={() => saveEditedPaymentReceived(row)}
                                                                className="text-green-600 font-bold text-lg"
                                                                disabled={row.type === "Carry (CF))"} // block save button too
                                                            >
                                                                ✓
                                                            </button>
                                                        ) : (
                                                            row.type === "Carry (CF)" ? (
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
                                                        {/* 👇 Delete button with same Carry Forward restriction */}
                                                        {row.type === "Carry (CF)" ? (
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
                                                        {row.type === "Carry (CF)" ? (
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
                                                    className="border-2 border-[#BF9853] border-opacity-25 p-1 rounded-lg w-[120px] h-[40px] focus:outline-none"
                                                    value={newPayment.date}
                                                    onChange={handlePaymentChange}
                                                    onKeyDown={handleKeyDownPayment}
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <input
                                                    type="number"
                                                    name="amount"
                                                    className="border-2 border-[#BF9853] border-opacity-25 rounded-lg w-[100px] h-[40px] focus:outline-none"
                                                    value={newPayment.amount}
                                                    onChange={handlePaymentChange}
                                                    onKeyDown={handleKeyDownPayment}
                                                    min="0"
                                                    step="any"
                                                    onWheel={(e) => e.preventDefault()}
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <select
                                                    name="type"
                                                    className="border-2 border-[#BF9853] border-opacity-25 w-[100px] h-[40px] rounded-lg focus:outline-none"
                                                    value={newPayment.type} onChange={handlePaymentChange} onKeyDown={handleKeyDownPayment}>
                                                    <option value="Weekly">Weekly</option>
                                                    <option value="Daily">Daily</option>
                                                    <option value="Monthly">Monthly</option>
                                                </select>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 ml-4">
                                <button className="w-[345px] h-[36px] bg-[#BF9853] text-white font-bold rounded" onClick={openAccountClosure} >
                                    Account Closure
                                </button>
                                {showPopup && (
                                    <AccountClosurePopup
                                        onClose={() => setShowPopup(false)}
                                        carryForwardBalance={carryForwardBalance}
                                        onConfirm={(type, discount) => {   // 👈 accept discount
                                            handleAccountClosure(type, discount); // 👈 forward discount
                                            setShowPopup(false);
                                        }}
                                    />
                                )}
                            </div>
                            <div className="mt-4 pt-2 ml-12">
                                <h2 className="font-bold text-lg">Summary</h2>
                                <div className="overflow-hidden rounded-md border-l-8 border-[#BF9853]">
                                    <table className="w-[345px] border-collapse">
                                        <tbody>
                                            {mergedExpenses.map((expense, index, arr) => (
                                                <tr key={index}
                                                    className={`even:bg-[#FAF6ED] odd:bg-[#FFFFFF] ${index === 0 ? "rounded-t-md" : ""
                                                        } ${index === arr.length - 1 ? "rounded-b-md" : ""}`}
                                                >
                                                    <td className="font-bold py-1.5 pl-2">{expense.type}</td>
                                                    <td className="font-bold py-1.5 px-4 text-right">
                                                        {expense.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2, })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
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
                                // Ignore → keep date
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
                                // OK → clear date
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
        const discountValue =
            closureType === "Carry (CF)"
                ? parseFloat(continueDiscount) || 0
                : parseFloat(handoverDiscount) || 0;
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
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-red-500 font-bold text-xl"
                >
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
        // If vendor or transfer site is 0, show "-"
        if (
            (field.oldKey?.includes("vendor_id") || field.oldKey?.includes("transfer_site_id") ||
                field.newKey?.includes("vendor_id") || field.newKey?.includes("transfer_site_id")) &&
            String(value) === "0"
        ) {
            return "-";
        }
        if (field.lookup) {
            return getNameById(value, field.lookup);
        }
        if (field.label.includes("Amount")) {
            return value ? Number(value).toLocaleString("en-IN") : "-";
        }
        if (field.label === "Date") {
            return value ? new Date(value).toLocaleDateString("en-GB") : "-";
        }
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
                {/* Scroll container for both vertical and horizontal overflow */}
                <div className="overflow-auto mt-2 max-h-80 border border-l-8 border-l-[#BF9853] rounded-lg ml-7">
                    <table className="table-fixed min-w-full bg-white">
                        <thead className="bg-[#FAF6ED]">
                            <tr>
                                <th style={{ width: "130px" }}>Time Stamp</th>
                                <th style={{ width: "120px" }}>Edited By</th>
                                {fields.map((f) => (
                                    <th key={f.label} style={{ width: f.width }}
                                        className="border-b py-2 px-2 text-center font-bold whitespace-nowrap overflow-hidden text-ellipsis"
                                    >
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
        // If vendor or transfer site is 0, show "-"
        if (
            (field.oldKey?.includes("vendor_id") || field.oldKey?.includes("transfer_site_id") ||
                field.newKey?.includes("vendor_id") || field.newKey?.includes("transfer_site_id")) &&
            String(value) === "0"
        ) {
            return "-";
        }
        if (field.lookup) {
            return getNameById(value, field.lookup);
        }
        if (field.label.includes("Amount")) {
            return value ? Number(value).toLocaleString("en-IN") : "-";
        }
        if (field.label === "Date") {
            return value ? new Date(value).toLocaleDateString("en-GB") : "-";
        }
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
                {/* Scroll container for both vertical and horizontal overflow */}
                <div className="overflow-auto mt-2 max-h-80 border border-l-8 border-l-[#BF9853] rounded-lg ml-7">
                    <table className="table-fixed min-w-full bg-white">
                        <thead className="bg-[#FAF6ED]">
                            <tr>
                                <th style={{ width: "130px" }}>Time Stamp</th>
                                <th style={{ width: "120px" }}>Edited By</th>
                                {fields.map((f) => (
                                    <th key={f.label} style={{ width: f.width }}
                                        className="border-b py-2 px-2 text-center font-bold whitespace-nowrap overflow-hidden text-ellipsis"
                                    >
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