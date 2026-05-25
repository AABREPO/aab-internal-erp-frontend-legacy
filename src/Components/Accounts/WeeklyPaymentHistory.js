import React, { useState } from "react";

import { useEffect } from "react";

const History = () => {
    const handleInputChange = (e) => {
        setNewExpense((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleExpenseChange = (e) => {
        const { name, value } = e.target;
        setNewExpense((prev) => ({ ...prev, [name]: value }));
    };

    // Function to calculate the sum of "Project Advance" amounts
    const calculateProjectAdvanceTotal = () => {
        return expenses
            .filter((expense) => expense.type === "Project Advance")
            .reduce((total, expense) => total + Number(expense.amount || 0), 0);
    };


    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
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



    const calculatePSNumber = () => {
        if (expenses.length === 0 && payments.length === 0) return 1;

        const allDates = [
            ...expenses.map(exp => new Date(exp.date)),
            ...payments.map(pay => new Date(pay.date))
        ].filter(date => !isNaN(date));

        if (allDates.length === 0) return 1;

        return 1;
    };


    const [expenses, setExpenses] = useState([]);
    const [payments, setPayments] = useState([]);
    const [newExpense, setNewExpense] = useState({ date: "", contractor: "", project: "", type: "", amount: "" });
    const [newPayment, setNewPayment] = useState({ date: "", amount: "", type: "Weekly" });
    const [showPopup, setShowPopup] = useState(false);
    const [editing, setEditing] = useState(null);



    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        setNewPayment((prev) => ({ ...prev, [name]: value }));
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            setExpenses((prev) => [{ id: Date.now(), ...newExpense }, ...prev]);
            setNewExpense({ date: "", contractor: "", project: "", type: "", amount: "" });
        }
    };

    const handleKeyDown1 = (e) => {
        if (e.key === "Enter") {
            setPayments((prev) => [{ id: Date.now(), ...newPayment }, ...prev]);
            setNewPayment({ date: "", amount: "", type: "Weekly" });
        }
    };

    const handleEditExpense = (id, field, value) => {
        setExpenses((prevExpenses) =>
            prevExpenses.map((expense) =>
                expense.id === id ? { ...expense, [field]: value } : expense
            )
        );
    };
    const handleEditPayment = (index, field, value) => {
        setPayments((prevPayments) =>
            prevPayments.map((payment, i) =>
                i === index ? { ...payment, [field]: value } : payment
            )
        );
    };

    const addPayment = () => {
        setPayments([{ ...newPayment, id: Date.now() }, ...payments]);
        setNewPayment({ date: "", amount: "", type: "Weekly" });
    };

    return (
        <body>
            <div>
                <h1 className="mt-[-28px] ml-[1040px] font-semibold text-lg">Report</h1>
            </div>
            <div className='mx-auto w-[1500px] p-4 pl-8 border-collapse text-left bg-[#FFFFFF] ml-14 mr-6 rounded-md h-[127px]'>
                <h1 className='font-semibold'>Select Week</h1>
                <div>
                    <select className='w-[253px] h-[45px] border-2 border-[#BF9853] rounded-md opacity-[0.17]'>
                        <option></option>
                    </select>
                </div>
            </div>
            <div className="mt-4 ml-[820px] ">
                <h1 className="font-bold ml-40 text-xl">
                    Balance: <span style={{ color: "#E4572E" }}>
                        {(
                            payments.reduce((total, row) => total + Number(row.amount || 0), 0) -
                            expenses.reduce((total, expense) => total + Number(expense.amount || 0), 0)
                        ).toFixed(2)}
                    </span>
                </h1>

            </div>
            <div className="mx-auto w-[1500px] p-6 border-collapse bg-[#FFFFFF] ml-14 mr-6 rounded-md">
                <div className="flex">
                    <h1 className="font-bold text-xl">PS: <span style={{ color: "#E4572E" }}>{calculatePSNumber()}</span> </h1>
                    <h1 className="font-bold text-base ml-[780px]">
                        Expenses: <span style={{ color: "#E4572E" }}>
                            {expenses.reduce((total, expense) => total + Number(expense.amount || 0), 0).toFixed(2)}
                        </span>
                    </h1>
                    <h1 className="font-bold text-base ml-[80px] mr-24">Payments Received</h1>
                    <h1 className="font-bold text-base text-[#E4572E]">
                        Total: <span style={{ color: "#E4572E" }}>
                            {payments.reduce((total, row) => total + Number(row.amount || 0), 0).toFixed(2)}
                        </span>
                    </h1>
                </div>

                {/* EXPENSES TABLE */}
                <div className="flex">
                    <div className="flex gap-10">
                        <div className="rounded-lg border-l-8 border-l-[#BF9853]">
                            <table className="w-[915px]">
                                <thead>
                                    <tr className="bg-[#FAF6ED] h-12">
                                        <th className="px-4 py-2 text-left">Sl.No</th>
                                        <th className="px-4 py-2 text-left">Date</th>
                                        <th className="px-4 py-2 text-left">Contractor/Vendor</th>
                                        <th className="px-4 py-2 text-left">Project Name</th>
                                        <th className="px-4 py-2 text-left">Type</th>
                                        <th className="px-4 py-2 text-left">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="">
                                        <td className="px-4 py-2 font-bold">{expenses.length + 1}.</td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="date"
                                                name="date"
                                                className="border p-1 rounded bg-[#DCDCDC] w-[100px] h-[32px] focus:outline-none"
                                                value={newExpense.date}
                                                onChange={handleExpenseChange}
                                                onKeyDown={handleKeyDown}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <select
                                                name="contractor"
                                                className="border p-1 w-[202px] h-[32px] rounded bg-[#DCDCDC] focus:outline-none"
                                                value={newExpense.contractor}
                                                onChange={handleInputChange}
                                                onKeyDown={handleKeyDown}
                                            >
                                                <option value="">Select</option>
                                                <option>Daily Labour Wage</option>
                                                <option>Murugan Centring</option>
                                                <option>Paramasivam Centring</option>
                                                <option>Eswaran Tiles</option>
                                                <option>Mahendran Sir</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-2">
                                            <select
                                                name="project"
                                                className="border p-1 w-[259px] h-[32px] rounded bg-[#DCDCDC] focus:outline-none"
                                                value={newExpense.project}
                                                onChange={handleInputChange}
                                                onKeyDown={handleKeyDown}
                                            >
                                                <option value="">Select</option>
                                                <option>AAB Office Md road</option>
                                                <option>Karthick chakkaraikulam st</option>
                                                <option>Summary Bill</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-2">
                                            <select
                                                name="type"
                                                className="border p-1 w-[97px] h-[32px] rounded bg-[#DCDCDC] focus:outline-none"
                                                value={newExpense.type}
                                                onChange={handleInputChange}
                                                onKeyDown={handleKeyDown}
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
                                                onKeyDown={handleKeyDown}
                                                onFocus={() => window.addEventListener("wheel", (e) => e.preventDefault(), { passive: false })}
                                                onBlur={() => window.removeEventListener("wheel", (e) => e.preventDefault())}
                                            />
                                        </td>
                                    </tr>
                                    {/* Editable Expense rows */}
                                    {expenses.map((row, index) => (
                                        <tr key={row.id} className={` even:bg-[#FAF6ED] odd:bg-[#FFFFFF]`}>
                                            <td className="px-4 py-2 font-bold">{expenses.length - index}</td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="date"
                                                    name="date"
                                                    className="bg-transparent p-1 rounded bg-[#FFFFFF] w-[100px] h-[32px] focus:outline-none"
                                                    value={row.date}
                                                    onChange={(e) => handleEditExpense(row.id, 'date', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <select
                                                    name="contractor"
                                                    className="bg-transparent p-1 w-[202px] h-[32px] rounded bg-[#FFFFFF] focus:outline-none"
                                                    value={row.contractor}
                                                    onChange={(e) => handleEditExpense(row.id, 'contractor', e.target.value)}
                                                >
                                                    <option>Daily Labour Wage</option>
                                                    <option>Murugan Centring</option>
                                                    <option>Paramasivam Centring</option>
                                                    <option>Eswaran Tiles</option>
                                                    <option>Mahendran Sir</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-2">
                                                <select
                                                    name="project"
                                                    className="bg-transparent p-1 w-[259px] h-[32px] rounded bg-[#FFFFFF] focus:outline-none"
                                                    value={row.project}
                                                    onChange={(e) => handleEditExpense(row.id, 'project', e.target.value)}
                                                >
                                                    <option>AAB Office Md road</option>
                                                    <option>Karthick chakkaraikulam st</option>
                                                    <option>Summary Bill</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-2">
                                                <select
                                                    name="type"
                                                    className="bg-transparent p-1 w-[97px] h-[32px] rounded bg-[#FFFFFF] focus:outline-none"
                                                    value={row.type}
                                                    onChange={(e) => handleEditExpense(row.id, 'type', e.target.value)}
                                                >
                                                    <option>Project Advance</option>
                                                    <option>Advance</option>
                                                    <option>Bill</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    name="amount"
                                                    className="bg-transparent p-1 w-[85px] h-[32px] rounded bg-[#FFFFFF] focus:outline-none"
                                                    value={row.amount}
                                                    onChange={(e) => handleEditExpense(row.id, 'amount', e.target.value)}
                                                    onWheel={(e) => e.preventDefault()}
                                                    onFocus={() => window.addEventListener("wheel", (e) => e.preventDefault(), { passive: false })}
                                                    onBlur={() => window.removeEventListener("wheel", (e) => e.preventDefault())}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* PAYMENTS RECEIVED TABLE */}
                    <div className=" overflow-y-scroll scrollbar-hide">
                        <div className="block">
                            <div className="rounded-lg ml-9 border-l-8 border-l-[#BF9853] ">
                                <table className="w-[346px] border-collapse">
                                    <thead className="bg-[#FAF6ED] h-12">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Date</th>
                                            <th className="px-4 py-2">Amount</th>
                                            <th className="px-4 py-2 text-left">Type</th>
                                        </tr>
                                    </thead>
                                </table>
                                <div className="max-h-[250px]">
                                    <table className="w-[346px] border-collapse overflow-hidden">
                                        <tbody>
                                            {[...payments].reverse().map((row, index) => (
                                                <tr key={index} className="even:bg-[#FAF6ED] odd:bg-[#FFFFFF]">
                                                    <td className="px-4 py-2">
                                                        <input
                                                            type="date"
                                                            value={row.date || ""}
                                                            onChange={(e) => handleEditPayment(payments.length - 1 - index, "date", e.target.value)}
                                                            className="p-1 rounded bg-transparent w-[96px] h-[31px] focus:outline-none"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <input
                                                            type="number"
                                                            value={row.amount || ""}
                                                            onChange={(e) => handleEditPayment(payments.length - 1 - index, "amount", e.target.value)}
                                                            className="rounded bg-transparent w-[95px] h-[31px] focus:outline-none"
                                                            onWheel={(e) => e.preventDefault()}
                                                            onFocus={() => window.addEventListener("wheel", (e) => e.preventDefault(), { passive: false })}
                                                            onBlur={() => window.removeEventListener("wheel", (e) => e.preventDefault())}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <select
                                                            value={row.type || "Weekly"}
                                                            onChange={(e) => handleEditPayment(payments.length - 1 - index, "type", e.target.value)}
                                                            className="w-[70px] h-[32px] rounded bg-transparent focus:outline-none"
                                                        >
                                                            <option value="Weekly">Weekly</option>
                                                            <option value="Daily">Daily</option>
                                                            <option value="Monthly">Monthly</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* FIXED INPUT ROW (ALWAYS AT BOTTOM) */}
                                <table className="w-[346px] border-collapse">
                                    <tbody>
                                        <tr>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="date"
                                                    name="date"
                                                    className="border p-1 rounded bg-[#DCDCDC] w-[96px] h-[31px] focus:outline-none"
                                                    value={newPayment.date}
                                                    onChange={handlePaymentChange}
                                                    onKeyDown={handleKeyDown1}
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    name="amount"
                                                    className="border rounded bg-[#DCDCDC] w-[95px] h-[31px] focus:outline-none"
                                                    value={newPayment.amount}
                                                    onChange={handlePaymentChange}
                                                    onKeyDown={handleKeyDown1}
                                                    onWheel={(e) => e.preventDefault()}
                                                    onFocus={() => window.addEventListener("wheel", (e) => e.preventDefault(), { passive: false })}
                                                    onBlur={() => window.removeEventListener("wheel", (e) => e.preventDefault())}
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <select
                                                    name="type"
                                                    className="border w-[70px] h-[32px] rounded bg-[#DCDCDC] focus:outline-none"
                                                    value={newPayment.type}
                                                    onChange={handlePaymentChange}
                                                    onKeyDown={handleKeyDown1}
                                                >
                                                    <option value="Weekly">Weekly</option>
                                                    <option value="Daily">Daily</option>
                                                    <option value="Monthly">Monthly</option>
                                                </select>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* ACCOUNT CLOSURE BUTTON */}


                            {/* SUMMARY SECTION */}
                            <div className="mt-4 pt-2 ml-[38px]">
                                <h2 className="font-bold ml-[-280px] text-lg">Summary</h2>
                                <div className="overflow-hidden rounded-md border-l-8 border-[#BF9853]">
                                    <table className="w-[345px] border-collapse">
                                        <tbody>
                                            {expenses
                                                .filter((expense) => Number(expense.amount) > 0) // Show only non-zero amounts
                                                .map((expense, index, arr) => (
                                                    <tr
                                                        key={index}
                                                        className={`even:bg-[#FAF6ED] odd:bg-[#FFFFFF] ${index === 0 ? "rounded-t-md" : ""
                                                            } ${index === arr.length - 1 ? "rounded-b-md" : ""}`}
                                                    >
                                                        <td className="font-bold py-1.5 pl-2">{expense.type}</td>
                                                        <td className="font-bold py-1.5 px-4 text-right">
                                                            {Number(expense.amount).toLocaleString("en-US", {
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
        </body>

    )
}

export default History




