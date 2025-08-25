import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Edit from '../Images/Edit.svg';
import Delete from '../Images/Delete.svg';
import history from '../Images/History.svg';
import Select from 'react-select';
import download from '../Images/file_download.png'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
const DailyPayment = ({ username, userRoles = [] }) => {
    const [expenses, setExpenses] = useState([]);
    console.log("Expenses Data:", expenses);
    const [payments, setPayments] = useState([]);
    const [newExpense, setNewExpense] = useState({ date: "", contractor: "", vendor: "", project: "", type: "", amount: "" });
    const [newPayment, setNewPayment] = useState({ date: "", amount: "", type: "Weekly" });
    const [weeks, setWeeks] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [contractorOptions, setContractorOptions] = useState([]);
    const [siteOptions, setSiteOptions] = useState([]);
    const [combinedOptions, setCombinedOptions] = useState([]);
    const [vendorId, setVendorId] = useState('');
    const [contractorId, setContractorId] = useState('');
    const [projectId, setProjectId] = useState('');
    const [selectedWeek, setSelectedWeek] = useState("");
    const [editingRowId, setEditingRowId] = useState('');
    const [editingPaymentId, setEditingPaymentId] = useState('');
    const [selectedDate, setSelectedDate] = useState(null); // new state
    const [showWeeklyPaymentExpensesModal, setShowWeeklyPaymentExpensesModal] = useState(false);
    const [weeklyPaymentExpensesAudits, setWeeklyPaymentExpensesAudits] = useState([]);
    const [showWeeklyPaymentReceivedModal, setShowWeeklyPaymentReceivedModal] = useState(false);
    const [weeklyPaymentReceivedAudits, setWeeklyPaymentReceivedAudits] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [weeklyTypes, setWeeklyTypes] = useState([]);
    const currentYear = new Date().getFullYear();
    const startYear = 2000; // Change if needed
    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);

    function getStartAndEndDateOfWeek(weekNumber, year) {
        const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
        const dayOfWeek = simple.getDay();
        const ISOWeekStart = new Date(simple);
        ISOWeekStart.setDate(simple.getDate() - ((dayOfWeek + 7) % 9)); // Monday

        const ISOWeekEnd = new Date(ISOWeekStart);
        ISOWeekEnd.setDate(ISOWeekStart.getDate() + 6); // Saturday (not Sunday)

        return {
            number: weekNumber,
            start: ISOWeekStart.toISOString().split("T")[0],
            end: ISOWeekEnd.toISOString().split("T")[0],
        };
    }
    const formatDateOnly = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };
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
        const fetchWeeks = async () => {
            try {
                const response = await axios.get('https://backendaab.in/aabuildersDash/api/payments-received/active_weeks');
                const currentYear = new Date().getFullYear();

                const enrichedWeeks = response.data.map((weekNumber) =>
                    getStartAndEndDateOfWeek(weekNumber, currentYear)
                );

                console.log("Enriched weeks:", enrichedWeeks);
                setWeeks(enrichedWeeks);
            } catch (error) {
                console.error('Error fetching active weeks:', error);
            }
        };
        fetchWeeks();
    }, []);

    useEffect(() => {
        const fetchWeekData = async () => {
            if (!selectedWeek) return;

            try {
                const [expensesRes, paymentsRes] = await Promise.all([
                    axios.get(`https://backendaab.in/aabuildersDash/api/weekly-expenses/week/${selectedWeek}`),
                    axios.get(`https://backendaab.in/aabuildersDash/api/payments-received/week/${selectedWeek}`)
                ]);

                setExpenses(expensesRes.data);
                const filteredPayments = paymentsRes.data.filter(
                    (payment) => payment.type !== "Handover"
                );
                setPayments(filteredPayments);
            } catch (error) {
                console.error("Error fetching weekly data:", error);
            }
        };

        fetchWeekData();
    }, [selectedWeek]);
    const handleInputChange = (e) => {
        setNewExpense((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const balance = (
        payments.reduce((total, row) => total + Number(row.amount || 0), 0) -
        expenses.reduce((total, expense) => total + Number(expense.amount || 0), 0)
    ).toFixed(2);

    // For new expense input
    const handleExpenseChange = (e) => {
        const { name, value } = e.target;
        if (name === "amount" && Number(value) > Number(balance)) {
            alert("Amount cannot exceed the available Balance!");
            setNewExpense((prev) => ({ ...prev, [name]: "" })); // clear field
            return;
        }
        setNewExpense((prev) => ({ ...prev, [name]: value }));
    };
    useEffect(() => {
        const handleWheel = (event) => {
            if (document.activeElement.type === "number") {
                event.preventDefault();
            }
        };

        document.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            document.removeEventListener("wheel", handleWheel);
        };
    }, []);

    const handleKeyDown = async (e) => {
        if (e.key === "Enter") {

            const payload = {
                date: newExpense.date,
                created_at: new Date().toISOString(),
                contractor_id: contractorId || null,
                vendor_id: vendorId || null,
                project_id: projectId || null,
                type: newExpense.type,
                amount: parseFloat(newExpense.amount),
                status: true,
                weekly_number: Number(selectedWeek),
                period_start_date: new Date().toISOString().split("T")[0],
                period_end_date: new Date().toISOString().split("T")[0],
            };

            try {
                const response = await fetch("https://backendaab.in/aabuildersDash/api/weekly-expenses/update/save", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    window.location.reload();
                    setExpenses((prev) => [{ id: Date.now(), ...newExpense }, ...prev]);
                    setNewExpense({ date: "", contractor: "", project: "", type: "", amount: "" });
                    setVendorId('');
                    setContractorId('');
                    setProjectId('');
                } else {
                    console.error("Failed to save expense. Server responded with:", response.status);
                }
            } catch (err) {
                console.error("Error during expense save:", err);
            }
        }
    };

    const handleKeyDown1 = async (e) => {
        if (e.key === "Enter") {
            const paymentPayload = {
                date: newPayment.date,
                amount: parseFloat(newPayment.amount),
                type: newPayment.type,
                status: true,
                weekly_number: Number(selectedWeek),
                period_start_date: new Date().toISOString().split("T")[0],
                period_end_date: new Date().toISOString().split("T")[0],
            };

            try {
                const response = await fetch("https://backendaab.in/aabuildersDash/api/payments-received/update/save", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(paymentPayload),
                });

                if (response.ok) {
                    console.log("✅ Payment saved successfully");
                    window.location.reload();
                    setPayments((prev) => [{ id: Date.now(), ...newPayment }, ...prev]);
                    setNewPayment({ date: "", amount: "", type: "Weekly" });
                } else {
                    console.error("❌ Failed to save payment");
                }
            } catch (error) {
                console.error("🚨 Error saving payment:", error);
            }
        }
    };

    const handleEditExpense = (id, field, value) => {
        if (field === "amount" && Number(value) > Number(balance)) {
            alert("Amount cannot exceed the available Balance!");
            // Clear the input for this row
            setExpenses((prevExpenses) =>
                prevExpenses.map((expense) =>
                    expense.id === id ? { ...expense, amount: "" } : expense
                )
            );
            return;
        }
        setExpenses((prevExpenses) =>
            prevExpenses.map((expense) =>
                expense.id === id ? { ...expense, [field]: value } : expense
            )
        );
    };

    const lastWeekNumber = Math.max(...weeks.map(week => week.number));

    console.log("Last Week Number:", lastWeekNumber);

    const saveEditedExpense = async (row) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/weekly-expenses/update/${row.id}?username=${encodeURIComponent(username)} `, {
                method: "PUT", // or "POST", based on your API
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(row),
            });

            if (!response.ok) {
                throw new Error("Failed to update expense");
            }
            window.location.reload();
            if (row.type === "Carry Forward") return;
            // Optionally show success toast / refresh list
            setEditingRowId(null);
        } catch (error) {
            console.error("Error updating expense:", error);
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
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/payments-received/update/${row.id}?username=${encodeURIComponent(username)}`, {
                method: "PUT", // or "POST", based on your API
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(row),
            });
            if (!response.ok) {
                throw new Error("Failed to update expense");
            }
            window.location.reload();
            // Optionally show success toast / refresh list
            setEditingPaymentId(null);
        } catch (error) {
            console.error("Error updating expense:", error);
        }
    };

    useEffect(() => {
        if (weeks.length > 0) {
            setSelectedWeek(weeks[weeks.length - 1].number); // last week's number
        }
    }, [weeks]);

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

    useEffect(() => {
        if (weeks.length > 0) {
            setSelectedWeek(weeks[weeks.length - 1].number); // default last week
        }
    }, [weeks]);

    // Helper to format dates
    const formatDate = (date) =>
        date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

    // Get currently selected week object
    const currentWeek = weeks.find((w) => w.number === Number(selectedWeek));

    // Generate 7 days if week selected
    const days = [];
    if (currentWeek) {
        const start = new Date(currentWeek.start);
        for (let i = 0; i < 7; i++) {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            days.push(day);
        }
    }

    return (
        <body>
            <div className='mx-auto w-[1800px] flex gap-8 p-4 pl-8 border-collapse text-left bg-[#FFFFFF] ml-14 mr-6 rounded-md h-[127px]'>
                <div>
                    {days.length > 0 && (
                        <div className="grid grid-cols-7 gap-2 mt-4">
                            {days.map((day, idx) => (
                                <button
                                    key={idx}
                                    className={`p-2 rounded-lg border ${selectedDate === day.toISOString().split("T")[0]
                                            ? "bg-[#BF9853] text-white"
                                            : "bg-white border-gray-300"
                                        }`}
                                    onClick={() => {
                                        const dateStr = day.toISOString().split("T")[0]; // format yyyy-mm-dd
                                        setSelectedDate(dateStr);
                                        setNewExpense(prev => ({ ...prev, date: dateStr })); // set to table
                                    }}
                                >
                                    {formatDate(day)}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Example: Table stays same regardless of day button */}
                    <div className="mt-6 flex">
                        <div>
                            <h2 className="font-semibold">Table Data (Week {selectedWeek})</h2>
                        </div>
                        <div>
                            {selectedDate && <p>Selected day: {selectedDate}</p>}
                            {/* Your table here: use selectedWeek only */}
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-4 ml-[1440px] ">
                <h1 className="font-bold ml-40 text-xl">
                    Balance: <span style={{ color: "#E4572E" }}>
                        {(
                            payments.reduce((total, row) => total + Number(row.amount || 0), 0) -
                            expenses.reduce((total, expense) => total + Number(expense.amount || 0), 0)
                        ).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2, })}
                    </span>
                </h1>
            </div>
            <div className="mx-auto w-[1800px] p-6 border-collapse bg-[#FFFFFF] ml-14 mr-6 rounded-md">
                <div className="flex">
                    <h1 className="font-bold text-xl">PS: <span style={{ color: "#E4572E" }}>{selectedWeek}</span> </h1>
                    <h1 className="font-bold text-base ml-[950px]">
                        Expenses: <span style={{ color: "#E4572E" }}>
                            {expenses.reduce((total, expense) => total + Number(expense.amount || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2, })}
                        </span>
                    </h1>
                </div>
                {/* EXPENSES TABLE */}
                <div className="flex">
                    <div className="flex gap-10">
                        <div className="rounded-lg border-l-8 border-l-[#BF9853]">
                            <table className="w-auto">
                                <thead>
                                    <tr className="bg-[#FAF6ED] h-12">
                                        <th className="px-4 py-2 text-left">Sl.No</th>
                                        <th className="px-4 py-2 text-left">Date</th>
                                        <th className="px-4 py-2 text-left">Contractor/Vendor</th>
                                        <th className="px-4 py-2 text-left">Project Name</th>
                                        <th className="px-4 py-2 text-left">Type</th>
                                        <th className="px-4 py-2 text-left">Amount</th>
                                        <th>Activity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Number(selectedWeek) === Number(lastWeekNumber) ? (
                                        <tr className="">
                                            <td className="px-4 py-2 font-bold">{expenses.length + 1}.</td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="date"
                                                    name="date"
                                                    className="border-2 border-[#BF9853] border-opacity-25 p-1 rounded-lg w-[130px] h-[40px] focus:outline-none"
                                                    value={newExpense.date}
                                                    onChange={handleExpenseChange}
                                                    onKeyDown={handleKeyDown}
                                                    disabled={!!selectedDate}
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <Select
                                                    name="contractor"
                                                    className="w-[202px]"
                                                    value={
                                                        combinedOptions.find(
                                                            opt =>
                                                                (opt.type === "Contractor" && opt.id === Number(newExpense.contractor_id)) ||
                                                                (opt.type === "Vendor" && opt.id === Number(newExpense.vendor_id))
                                                        ) || null
                                                    }
                                                    onChange={(selectedOption) => {
                                                        if (!selectedOption) {
                                                            setNewExpense(prev => ({
                                                                ...prev,
                                                                contractor_id: "",
                                                                vendor_id: ""
                                                            }));
                                                            setContractorId("");
                                                            setVendorId("");
                                                        } else if (selectedOption.type === "Contractor") {
                                                            setNewExpense(prev => ({
                                                                ...prev,
                                                                contractor_id: selectedOption.id,
                                                                vendor_id: ""
                                                            }));
                                                            setContractorId(selectedOption.id);
                                                            setVendorId("");
                                                        } else if (selectedOption.type === "Vendor") {
                                                            setNewExpense(prev => ({
                                                                ...prev,
                                                                vendor_id: selectedOption.id,
                                                                contractor_id: ""
                                                            }));
                                                            setVendorId(selectedOption.id);
                                                            setContractorId("");
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
                                                    value={siteOptions.find(opt => opt.id === Number(newExpense.project_id)) || null}
                                                    onChange={(selectedOption) => {
                                                        setNewExpense(prev => ({
                                                            ...prev,
                                                            project_id: selectedOption ? selectedOption.id : ""
                                                        }));
                                                        setProjectId(selectedOption ? selectedOption.id : "");
                                                    }}
                                                    options={siteOptions}
                                                    placeholder="Select Site"
                                                    isSearchable
                                                    isClearable
                                                    styles={customStyles}
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-left">
                                                <select
                                                    name="type"
                                                    className="border-2 border-[#BF9853] border-opacity-25 p-1 w-[130px] h-[40px] rounded-lg focus:outline-none"
                                                    value={newExpense.type}
                                                    onChange={handleInputChange}
                                                    onKeyDown={handleKeyDown}
                                                >
                                                    <option value="">Select</option>
                                                    {weeklyTypes.map((type, index) => (
                                                        <option key={index} value={type.type}>
                                                            {type.type}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-2 text-left">
                                                <input
                                                    type="number"
                                                    name="amount"
                                                    className="border-2 border-[#BF9853] border-opacity-25 p-1 w-[100px] h-[40px] rounded-lg focus:outline-none"
                                                    value={newExpense.amount}
                                                    onChange={handleExpenseChange}
                                                    onKeyDown={handleKeyDown}
                                                    onFocus={() => window.addEventListener("wheel", (e) => e.preventDefault(), { passive: false })}
                                                    onBlur={() => window.removeEventListener("wheel", (e) => e.preventDefault())}
                                                />
                                            </td>
                                        </tr>
                                    ) : null}
                                    {/* Editable Expense rows */}
                                    {[...expenses].reverse().map((row, index) => (
                                        <tr key={row.id} className="even:bg-[#FAF6ED] odd:bg-[#FFFFFF] text-left">
                                            <td className="px-4 py-2 font-bold">{expenses.length - index}</td>
                                            <td className="px-4 py-2">
                                                {editingRowId === row.id ? (
                                                    <input
                                                        type="date"
                                                        name="date"
                                                        className="bg-transparent p-1 rounded w-[100px] h-[40px] focus:outline-none"
                                                        value={row.date}
                                                        onChange={(e) => handleEditExpense(row.id, 'date', e.target.value)}
                                                        disabled={editingRowId !== row.id}
                                                    />
                                                ) : (
                                                    <div className="w-[130px] h-[40px] flex items-center">
                                                        {formatDateOnly(row.date) || ""}
                                                    </div>
                                                )}
                                            </td>
                                            {/* Contractor / Vendor column */}
                                            <td className="px-4 py-2">
                                                {editingRowId === row.id ? (
                                                    <Select
                                                        name="party"
                                                        className="w-[202px]"
                                                        value={
                                                            combinedOptions.find(
                                                                opt =>
                                                                    (opt.type === "Contractor" && opt.id === Number(row.contractor_id)) ||
                                                                    (opt.type === "Vendor" && opt.id === Number(row.vendor_id))
                                                            ) || null
                                                        }
                                                        onChange={(selectedOption) => {
                                                            if (!selectedOption) {
                                                                handleEditExpense(row.id, "contractor_id", "");
                                                                handleEditExpense(row.id, "vendor_id", "");
                                                            } else if (selectedOption.type === "Contractor") {
                                                                handleEditExpense(row.id, "contractor_id", selectedOption.id);
                                                                handleEditExpense(row.id, "vendor_id", "");
                                                            } else if (selectedOption.type === "Vendor") {
                                                                handleEditExpense(row.id, "vendor_id", selectedOption.id);
                                                                handleEditExpense(row.id, "contractor_id", "");
                                                            }
                                                        }}
                                                        options={combinedOptions}
                                                        placeholder="Select Contractor/Vendor"
                                                        isSearchable
                                                        isClearable
                                                        styles={customStyles}
                                                    />
                                                ) : (
                                                    // Show label in view mode
                                                    <div className="w-[205px] h-[40px] flex items-center">
                                                        {combinedOptions.find(
                                                            opt =>
                                                                (opt.type === "Contractor" && opt.id === Number(row.contractor_id)) ||
                                                                (opt.type === "Vendor" && opt.id === Number(row.vendor_id))
                                                        )?.label || ""}
                                                    </div>
                                                )}
                                            </td>
                                            {/* Project column */}
                                            <td className="px-4 py-2">
                                                {editingRowId === row.id ? (
                                                    <Select
                                                        name="project"
                                                        className="w-[259px]"
                                                        value={siteOptions.find(opt => opt.id === Number(row.project_id)) || null}
                                                        onChange={(selectedOption) =>
                                                            handleEditExpense(
                                                                row.id,
                                                                "project_id",
                                                                selectedOption ? selectedOption.id : ""
                                                            )
                                                        }
                                                        options={siteOptions}
                                                        placeholder="Select Project"
                                                        isSearchable
                                                        isClearable
                                                        styles={customStyles}
                                                    />
                                                ) : (
                                                    // Show label in view mode
                                                    <div className="w-[259px] h-[40px] flex items-center">
                                                        {siteOptions.find(opt => opt.id === Number(row.project_id))?.label || ""}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                {editingRowId === row.id ? (
                                                    <select
                                                        name="type"
                                                        className="border-2 border-[#BF9853] border-opacity-25 bg-transparent p-1 w-[130px] text-left h-[40px] rounded-lg focus:outline-none"
                                                        value={row.type}
                                                        onChange={(e) => handleEditExpense(row.id, 'type', e.target.value)}
                                                    >
                                                        <option value="">Select</option>
                                                        {weeklyTypes.map((type, index) => (
                                                            <option key={index} value={type.type}>
                                                                {type.type}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <div className="w-[129px] h-[40px] flex items-center">
                                                        {row.type}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                {editingRowId === row.id ? (
                                                    <input
                                                        type="number"
                                                        name="amount"
                                                        className="border-2 border-[#BF9853] border-opacity-25 bg-transparent p-1 w-[100px] h-[40px] rounded-lg focus:outline-none"
                                                        value={row.amount}
                                                        onChange={(e) => handleEditExpense(row.id, 'amount', e.target.value)}
                                                        disabled={editingRowId !== row.id}
                                                        onWheel={(e) => e.preventDefault()}
                                                        onFocus={() => window.addEventListener("wheel", (e) => e.preventDefault(), { passive: false })}
                                                        onBlur={() => window.removeEventListener("wheel", (e) => e.preventDefault())}
                                                    />
                                                ) : (
                                                    <div className="w-[129px] h-[40px] flex items-center">
                                                        {Number(row.amount).toLocaleString('en-IN')}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-2 py-2 relative">
                                                {Number(row.weekly_number) === Number(lastWeekNumber) && (
                                                    <div className="flex gap-2"> {/* <-- Added flex container */}
                                                        {editingRowId === row.id ? (
                                                            <button
                                                                className="text-green-600 font-bold text-lg relative z-10"
                                                                onClick={() => saveEditedExpense(row)}
                                                            >
                                                                ✓
                                                            </button>
                                                        ) : (
                                                            row.type === "Carry Forward" ? (
                                                                <img
                                                                    className="w-5 h-4 opacity-40 cursor-not-allowed"
                                                                    src={Edit}
                                                                    alt="Edit Disabled"
                                                                />
                                                            ) : (
                                                                <button onClick={() => setEditingRowId(row.id)}>
                                                                    <img className="w-5 h-4" src={Edit} alt="Edit" />
                                                                </button>
                                                            )
                                                        )}

                                                        {/* Delete Button */}
                                                        <button className="" onClick={() => handleWeeklyExpensesDelete(row.id)}>
                                                            <img src={Delete} className="w-5 h-4" alt="Delete" />
                                                        </button>
                                                        <button className="" onClick={() => fetchAuditDetailsForExpense(row.id)}>
                                                            <img src={history} className="w-5 h-4" alt="Delete" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
                <AuditModal show={showWeeklyPaymentExpensesModal} onClose={() => setShowWeeklyPaymentExpensesModal(false)} audits={weeklyPaymentExpensesAudits} vendorOptions={vendorOptions} contractorOptions={contractorOptions}
                    siteOptions={siteOptions} />
                <AuditModalWeeklyPaymentsReceived show={showWeeklyPaymentReceivedModal} onClose={() => setShowWeeklyPaymentReceivedModal(false)}
                    audits={weeklyPaymentReceivedAudits} />
            </div>
        </body >
    )
}

export default DailyPayment

const formatDate = (dateString) => {
    const date = new Date(dateString);
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
};

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
                                    <th
                                        key={f.label}
                                        style={{ width: f.width }}
                                        className="border-b py-2 px-2 text-center font-bold whitespace-nowrap overflow-hidden text-ellipsis"
                                    >
                                        {f.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {audits.map((audit, index) => (
                                <tr
                                    key={index}
                                    className="odd:bg-white even:bg-[#FAF6ED]"
                                >
                                    <td
                                        className="whitespace-nowrap overflow-hidden text-ellipsis"
                                        style={{ width: "130px" }}
                                    >
                                        {formatDateTime(audit.edited_date)}
                                    </td>
                                    <td
                                        className="whitespace-nowrap overflow-hidden text-ellipsis"
                                        style={{ width: "120px" }}
                                    >
                                        {audit.edited_by}
                                    </td>
                                    {fields.map((f) => {
                                        const oldDisplay = formatDisplayValue(audit[f.oldKey], f);
                                        const newDisplay = formatDisplayValue(audit[f.newKey], f);
                                        const changed = oldDisplay !== newDisplay;

                                        return (
                                            <td
                                                key={f.label}
                                                style={{ width: f.width }}
                                                title={changed ? `Previous: ${oldDisplay} → Current: ${newDisplay}` : ""}
                                                className={`whitespace-nowrap overflow-hidden text-ellipsis px-2 ${changed ? "bg-[#BF9853] font-bold" : ""
                                                    }`}
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
                                    <th
                                        key={f.label}
                                        style={{ width: f.width }}
                                        className="border-b py-2 px-2 text-center font-bold whitespace-nowrap overflow-hidden text-ellipsis"
                                    >
                                        {f.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {audits.map((audit, index) => (
                                <tr
                                    key={index}
                                    className="odd:bg-white even:bg-[#FAF6ED]"
                                >
                                    <td
                                        className="whitespace-nowrap overflow-hidden text-ellipsis"
                                        style={{ width: "130px" }}
                                    >
                                        {formatDateTime(audit.edited_date)}
                                    </td>
                                    <td
                                        className="whitespace-nowrap overflow-hidden text-ellipsis"
                                        style={{ width: "120px" }}
                                    >
                                        {audit.edited_by}
                                    </td>
                                    {fields.map((f) => {
                                        const oldDisplay = formatDisplayValue(audit[f.oldKey], f);
                                        const newDisplay = formatDisplayValue(audit[f.newKey], f);
                                        const changed = oldDisplay !== newDisplay;

                                        return (
                                            <td
                                                key={f.label}
                                                style={{ width: f.width }}
                                                title={changed ? `Previous: ${oldDisplay} → Current: ${newDisplay}` : ""}
                                                className={`whitespace-nowrap overflow-hidden text-ellipsis px-2 ${changed ? "bg-[#BF9853] font-bold" : ""
                                                    }`}
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