import React, { useState, useEffect, useCallback } from "react";
import Edit from '../Images/Edit.svg'
import Delete from '../Images/Delete.svg'

const contractorMap = {
    1: "Daily Labour Wage",
    2: "Murugan Centring",
    3: "Paramasivam Centring",
    4: "Eswaran Tiles",
    5: "Mahendran Sir",
    // Add more as needed
};

const projectMap = {
    1: "AAB Office Md road",
    2: "Karthick chakkaraikulam st",
    3: "Summary Bill",
    // Add more as needed
};

// Helper function to get start and end date of ISO week
function getStartAndEndDateOfISOWeek(weekNo, year) {
    const simple = new Date(year, 0, 1 + (weekNo - 1) * 7);
    const dayOfWeek = simple.getDay();
    const ISOweekStart = new Date(simple);
    if (dayOfWeek <= 4) {
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    const ISOweekEnd = new Date(ISOweekStart);
    ISOweekEnd.setDate(ISOweekStart.getDate() + 6);
    return { startDate: ISOweekStart, endDate: ISOweekEnd };
}

const WeeklyPayment = () => {
    const [currentWeekNumber, setCurrentWeekNumber] = useState(null);

    // Expenses
    const [expenses, setExpenses] = useState([]);
    const [newExpense, setNewExpense] = useState({
        date: "",
        contractor: "",
        project: "",
        type: "",
        amount: "",
    });
    const [editingRowId, setEditingRowId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        date: "",
        contractor_id: "",
        project_id: "",
        type: "",
        amount: ""
    });

    const handleEditClick = (row) => {
        setEditingRowId(row.id);
        setEditFormData({
            date: row.date,
            contractor_id: row.contractor_id,
            project_id: row.project_id,
            type: row.type,
            amount: row.amount
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveClick = () => {
        setExpenses((prevExpenses) =>
            prevExpenses.map((row) =>
                row.id === editingRowId ? { ...row, ...editFormData } : row
            )
        );
        setEditingRowId(null);
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
        type: "Weekly"
    });

    const handleEditPaymentClick = (row) => {
        setEditingPaymentId(row.id || null);
        setEditPaymentData({
            date: row.date,
            amount: row.amount,
            type: row.type
        });
    };

    const handleEditPaymentChange = (e) => {
        const { name, value } = e.target;
        setEditPaymentData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSavePaymentClick = () => {
        setPayments((prev) =>
            prev.map((p) =>
                (p.id || null) === editingPaymentId
                    ? { ...p, ...editPaymentData }
                    : p
            )
        );
        setEditingPaymentId(null);
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
            .then(setPayments)
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

        if (selectedDate < startDate || selectedDate > endDate) {
            alert(
                `Selected date is out of current week range (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`
            );
            // Clear the invalid date input
            setNewExpense((prev) => ({ ...prev, date: "" }));
        } else {
            setNewExpense((prev) => ({ ...prev, date: dateStr }));
        }
    };

    // Expense save on Enter with date checked previously
    const handleKeyDownExpense = (e) => {
        if (e.key !== "Enter") return;

        if (!newExpense.date) {
            alert("Please select a date");
            return;
        }

        if (!newExpense.contractor || !newExpense.project || !newExpense.type || !newExpense.amount) {
            alert("Please fill all fields except date");
            return;
        }

        const expenseForBackend = {
            date: newExpense.date,
            contractor_id: Number(newExpense.contractor),
            project_id: Number(newExpense.project),
            type: newExpense.type,
            amount: Number(newExpense.amount),
            weekly_number: currentWeekNumber,
            status: false,
            created_at: new Date().toISOString(),
        };

        fetch("https://backendaab.in/aabuildersDash/api/weekly-expenses/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(expenseForBackend),
        })
            .then((res) => res.json())
            .then((saved) => {
                setExpenses((prev) => [saved, ...prev]);
                setNewExpense({ date: "", contractor: "", project: "", type: "", amount: "" });
            })
            .catch((err) => alert("Error saving expense: " + err.message));
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
            alert(
                `Selected date is out of current week range (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`
            );
            // Clear the invalid date input
            setNewPayment((prev) => ({ ...prev, date: "" }));
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
            })
            .catch((err) => alert("Error saving payment: " + err.message));
    };

    // Open Account Closure popup
    const openAccountClosure = () => {
        setCarryForwardBalance(balance.toFixed(2));
        setShowPopup(true);
    };

    // Account Closure handler
    const handleAccountClosure = async (type) => {
        try {
            const carryForwardParam = type === "continue" ? "true" : "false";
            const carryAmountParam = type === "continue" && balance > 0 ? balance : 0;

            const url = new URL("https://backendaab.in/aabuildersDash/api/payments-received/account-closure");
            url.searchParams.append("carryForward", carryForwardParam);
            url.searchParams.append("carryAmount", carryAmountParam);

            const res = await fetch(url.toString(), { method: "POST" });
            const newWeekNumber = await res.json();

            setCurrentWeekNumber(newWeekNumber);

            // Clear inputs
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

    return (
        <div>
            {/* Balance display */}
            <div className="mt-[-25px] ml-[1580px]">
                <h1 className="font-bold text-xl">
                    Balance: <span style={{ color: "#E4572E" }}>{balance.toFixed(2)}</span>
                </h1>
            </div>

            <div className="mx-auto w-auto p-6 bg-white ml-[30px] mr-6 rounded-md border border-transparent">
                {/* Header */}
                <div className="flex">
                    <h1 className="font-bold text-xl ml-[70px]">PS: {currentWeekNumber ?? "-"}</h1>
                    <h1 className="font-bold text-base ml-[780px]">
                        Expenses: <span style={{ color: "#E4572E" }}>{totalExpenses.toFixed(2)}</span>
                    </h1>
                    <h1 className="font-bold text-base ml-[150px] mr-24">Payments Received</h1>
                    <h1 className="font-bold text-base text-[#E4572E]">
                        Total: <span>{totalPayments.toFixed(2)}</span>
                    </h1>
                </div>

                {/* Main */}
                <div className="flex ml-16 gap-10" key={currentWeekNumber /* force re-mount on week change */}>
                    {/* Expenses Table */}
                    <div className="rounded-lg border-l-8 border-l-[#BF9853]">
                        <table className="w-[915px] border-collapse">
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
                                            className="border p-1 rounded bg-[#DCDCDC] w-[100px] h-[32px] focus:outline-none"
                                            value={newExpense.date}
                                            onChange={handleExpenseChange}
                                            onKeyDown={handleKeyDownExpense}
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <select
                                            name="contractor"
                                            className="border p-1 w-[202px] h-[32px] rounded bg-[#DCDCDC] focus:outline-none"
                                            value={newExpense.contractor}
                                            onChange={handleExpenseChange}
                                            onKeyDown={handleKeyDownExpense}
                                        >
                                            <option value="">Select</option>
                                            {Object.entries(contractorMap).map(([id, name]) => (
                                                <option key={id} value={id}>
                                                    {name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-2">
                                        <select
                                            name="project"
                                            className="border p-1 w-[259px] h-[32px] rounded bg-[#DCDCDC] focus:outline-none"
                                            value={newExpense.project}
                                            onChange={handleExpenseChange}
                                            onKeyDown={handleKeyDownExpense}
                                        >
                                            <option value="">Select</option>
                                            {Object.entries(projectMap).map(([id, name]) => (
                                                <option key={id} value={id}>
                                                    {name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-2">
                                        <select
                                            name="type"
                                            className="border p-1 w-[97px] h-[32px] rounded bg-[#DCDCDC] focus:outline-none"
                                            value={newExpense.type}
                                            onChange={handleExpenseChange}
                                            onKeyDown={handleKeyDownExpense}
                                        >
                                            <option value="">Select</option>
                                            <option value="Project Advance">Project Advance</option>
                                            <option value="Advance">Advance</option>
                                            <option value="Bill">Bill</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="number"
                                            name="amount"
                                            className="border p-1 w-[85px] h-[32px] rounded bg-[#DCDCDC] focus:outline-none"
                                            value={newExpense.amount}
                                            onChange={handleExpenseChange}
                                            onKeyDown={handleKeyDownExpense}
                                            disabled={!newExpense.date || !newExpense.contractor || !newExpense.project}
                                            min="0"
                                            step="any"
                                        />
                                    </td>
                                </tr>

                                {/* Existing Expenses */}
                                {expenses.map((row, index) => (
                                    <tr key={row.id} className={`even:bg-[#FAF6ED] odd:bg-[#FFFFFF]`}>
                                        <td className="px-4 py-2 font-bold">{expenses.length - index}</td>

                                        {/* Date column */}
                                        <td className="px-4 py-2">
                                            {editingRowId === row.id ? (
                                                <input
                                                    type="date"
                                                    name="date"
                                                    className="border p-1 rounded bg-[#DCDCDC] w-[100px] h-[32px] focus:outline-none"
                                                    value={editFormData.date}
                                                    onChange={handleEditChange}
                                                />
                                            ) : (
                                                row.date || ""
                                            )}
                                        </td>

                                        {/* Contractor column */}
                                        <td className="px-4 py-2">
                                            {editingRowId === row.id ? (
                                                <select
                                                    name="contractor_id"
                                                    className="border p-1 w-[202px] h-[32px] rounded bg-[#DCDCDC] focus:outline-none"
                                                    value={editFormData.contractor_id}
                                                    onChange={handleEditChange}
                                                >
                                                    <option value="">Select</option>
                                                    {Object.entries(contractorMap).map(([id, name]) => (
                                                        <option key={id} value={id}>{name}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                contractorMap[row.contractor_id] || row.contractor_id
                                            )}
                                        </td>

                                        {/* Project column */}
                                        <td className="px-4 py-2">
                                            {editingRowId === row.id ? (
                                                <select
                                                    name="project_id"
                                                    className="border p-1 w-[259px] h-[32px] rounded bg-[#DCDCDC] focus:outline-none"
                                                    value={editFormData.project_id}
                                                    onChange={handleEditChange}
                                                >
                                                    <option value="">Select</option>
                                                    {Object.entries(projectMap).map(([id, name]) => (
                                                        <option key={id} value={id}>{name}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                projectMap[row.project_id] || row.project_id
                                            )}
                                        </td>

                                        {/* Type column */}
                                        <td className="px-4 py-2">
                                            {editingRowId === row.id ? (
                                                <select
                                                    name="type"
                                                    className="border p-1 w-[97px] h-[32px] rounded bg-[#DCDCDC] focus:outline-none"
                                                    value={editFormData.type}
                                                    onChange={handleEditChange}
                                                >
                                                    <option value="">Select</option>
                                                    <option value="Project Advance">Project Advance</option>
                                                    <option value="Advance">Advance</option>
                                                    <option value="Bill">Bill</option>
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
                                                    className="border p-1 w-[85px] h-[32px] rounded bg-[#DCDCDC] focus:outline-none no-spinner"
                                                    value={editFormData.amount}
                                                    onChange={handleEditChange}
                                                    min="0"
                                                    step="any"
                                                />
                                            ) : (
                                                row.amount
                                            )}
                                        </td>

                                        {/* Edit/Save action column */}
                                        <td className="px-4 py-2">
                                            {editingRowId === row.id ? (
                                                <button
                                                    onClick={handleSaveClick}
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
                                                <img src={Delete} className=" w-5 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Payments + Account Closure + Summary */}
                    <div>
                        <div
                            className="rounded-lg ml-9 border-l-8 border-l-[#BF9853]"
                            style={{ maxHeight: "400px", overflowY: "auto" }}
                        >
                            <table className="w-[346px] border-collapse">
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
                                        <tr key={row.id || index} className="even:bg-[#FAF6ED] odd:bg-[#FFFFFF]">
                                            <td className="px-4 py-2">
                                                {editingPaymentId === (row.id || null) ? (
                                                    <input
                                                        type="date"
                                                        name="date"
                                                        className="border p-1 rounded bg-[#DCDCDC] w-[96px] h-[31px] focus:outline-none"
                                                        value={editPaymentData.date}
                                                        onChange={handleEditPaymentChange}
                                                    />
                                                ) : (
                                                    row.date || ""
                                                )}
                                            </td>

                                            <td className="px-4 py-2">
                                                {editingPaymentId === (row.id || null) ? (
                                                    <input
                                                        type="number"
                                                        name="amount"
                                                        className="border rounded bg-[#DCDCDC] w-[95px] h-[31px] focus:outline-none"
                                                        value={editPaymentData.amount}
                                                        onChange={handleEditPaymentChange}
                                                        min="0"
                                                        step="any"
                                                        onWheel={(e) => e.preventDefault()}
                                                    />
                                                ) : (
                                                    row.amount
                                                )}
                                            </td>

                                            <td className="px-4 py-2 flex items-center justify-between">
                                                {editingPaymentId === (row.id || null) ? (
                                                    <>
                                                        <select
                                                            name="type"
                                                            className="border w-[70px] h-[32px] rounded bg-[#DCDCDC] focus:outline-none"
                                                            value={editPaymentData.type}
                                                            onChange={handleEditPaymentChange}
                                                        >
                                                            <option value="Weekly">Weekly</option>
                                                            <option value="Daily">Daily</option>
                                                            <option value="Monthly">Monthly</option>
                                                            <option value="Carry Forward">Carry Forward</option>
                                                        </select>
                                                    </>
                                                ) : (
                                                    <>
                                                        {row.type}
                                                    </>
                                                )}
                                            </td>
                                            <td className="px-4 py-2">
                                                {editingPaymentId === row.id ? (
                                                    <button
                                                        onClick={handleSavePaymentClick}
                                                        className="text-green-600 font-bold text-lg"
                                                    >
                                                        ✓
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleEditPaymentClick(row)}>
                                                        <img className="w-5 h-4" src={Edit} alt="Edit" />
                                                    </button>
                                                )}
                                                <button className="pl-3">
                                                    <img src={Delete} className=" w-5 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td className="px-4 py-2">
                                            <input
                                                type="date"
                                                name="date"
                                                className="border p-1 rounded bg-[#DCDCDC] w-[96px] h-[31px] focus:outline-none"
                                                value={newPayment.date}
                                                onChange={handlePaymentChange}
                                                onKeyDown={handleKeyDownPayment}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="number"
                                                name="amount"
                                                className="border rounded bg-[#DCDCDC] w-[95px] h-[31px] focus:outline-none"
                                                value={newPayment.amount}
                                                onChange={handlePaymentChange}
                                                onKeyDown={handleKeyDownPayment}
                                                min="0"
                                                step="any"
                                                onWheel={(e) => e.preventDefault()}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <select
                                                name="type"
                                                className="border w-[70px] h-[32px] rounded bg-[#DCDCDC] focus:outline-none"
                                                value={newPayment.type}
                                                onChange={handlePaymentChange}
                                                onKeyDown={handleKeyDownPayment}
                                            >
                                                <option value="Weekly">Weekly</option>
                                                <option value="Daily">Daily</option>
                                                <option value="Monthly">Monthly</option>
                                                <option value="Carry Forward">Carry Forward</option>
                                            </select>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 ml-4">
                            <button
                                className="w-[345px] h-[36px] bg-[#BF9853] text-white font-bold rounded"
                                onClick={openAccountClosure}
                            >
                                Account Closure
                            </button>

                            {showPopup && (
                                <AccountClosurePopup
                                    onClose={() => setShowPopup(false)}
                                    carryForwardBalance={carryForwardBalance}
                                    onConfirm={(type) => {
                                        handleAccountClosure(type);
                                        setShowPopup(false);
                                    }}
                                />
                            )}
                        </div>

                        <div className="mt-4 pt-2">
                            <h2 className="font-bold text-lg">Summary</h2>
                            <div className="overflow-hidden rounded-md border-l-8 border-[#BF9853]">
                                <table className="w-[345px] border-collapse">
                                    <tbody>
                                        {mergedExpenses.map((expense, index, arr) => (
                                            <tr
                                                key={index}
                                                className={`even:bg-[#FAF6ED] odd:bg-[#FFFFFF] ${index === 0 ? "rounded-t-md" : ""
                                                    } ${index === arr.length - 1 ? "rounded-b-md" : ""}`}
                                            >
                                                <td className="font-bold py-1.5 pl-2">{expense.type}</td>
                                                <td className="font-bold py-1.5 px-4 text-right">
                                                    {expense.amount.toLocaleString("en-US", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}
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
    );
};

const AccountClosurePopup = ({ onClose, carryForwardBalance, onConfirm }) => {
    const [step, setStep] = React.useState(1);
    const [closureType, setClosureType] = React.useState("continue");

    const handleYesClick = () => {
        if (closureType === "handover") {
            onConfirm(closureType);
        } else {
            setStep(2);
        }
    };

    const handleConfirmContinue = () => {
        onConfirm(closureType);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white h-[220px] shadow-lg w-[480px] rounded-md p-4 relative">
                <div className="flex justify-end">
                    <button onClick={onClose} className="text-red-500 text-xl font-bold">
                        ✖
                    </button>
                </div>

                {step === 1 ? (
                    <>
                        <h2 className="text-lg font-semibold mb-2">Do you want to Account Closure?</h2>
                        <div className="mb-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="closure"
                                    className="accent-[#007233]"
                                    checked={closureType === "continue"}
                                    onChange={() => setClosureType("continue")}
                                />
                                <span className="font-semibold text-base">Continue for Next week</span>
                                <span className="ml-4 font-bold text-[#E4572E]">
                                    Balance: {carryForwardBalance ?? 0}
                                </span>
                            </label>
                            <label className="flex items-center space-x-2 mt-3">
                                <input
                                    type="radio"
                                    name="closure"
                                    className="accent-[#007233]"
                                    checked={closureType === "handover"}
                                    onChange={() => setClosureType("handover")}
                                />
                                <span className="font-semibold text-base">Handover</span>
                            </label>
                        </div>
                        <div className="flex space-x-6 justify-center">
                            <button
                                className="bg-[#BF9853] text-white font-bold py-2 px-8 rounded"
                                onClick={handleYesClick}
                            >
                                Yes
                            </button>
                            <button
                                className="border border-[#BF9853] text-[#BF9853] font-bold py-2 px-8 rounded"
                                onClick={onClose}
                            >
                                No
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-base font-semibold mb-4">Do you want to continue for Next Week?</h2>
                        <div className="flex space-x-6 justify-center">
                            <button
                                className="bg-[#BF9853] text-white font-bold py-2 px-8 rounded"
                                onClick={handleConfirmContinue}
                            >
                                Yes
                            </button>
                            <button
                                className="border border-[#BF9853] text-[#BF9853] font-bold py-2 px-8 rounded"
                                onClick={() => setStep(1)}
                            >
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
