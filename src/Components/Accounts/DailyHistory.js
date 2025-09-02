import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const DailyHistory = () => {
    const [selectedWeek, setSelectedWeek] = useState("");
    const [weeks, setWeeks] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [dailyExpenses, setDailyExpenses] = useState([]);
    const [refundPayments, setRefundPayments] = useState([]);
    const [payments, setPayments] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [laboursList, setLaboursList] = useState([]);
    const [siteOptions, setSiteOptions] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [contractorOptions, setContractorOptions] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [combinedOptions, setCombinedOptions] = useState([]);

    const currentYear = new Date().getFullYear();
    const currentWeek = weeks.find((w) => w.number === Number(selectedWeek));
    const startYear = 2000;
    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);

    // Function to get start and end date of a week
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

    // Fetch weeks data
    useEffect(() => {
        const fetchWeeks = async () => {
            try {
                const response = await axios.get('https://backendaab.in/aabuildersDash/api/payments-received/active_weeks');
                const currentYear = new Date().getFullYear();
                const enrichedWeeks = response.data.map((weekNumber) =>
                    getStartAndEndDateOfWeek(weekNumber, currentYear)
                );
                setWeeks(enrichedWeeks);
            } catch (error) {
                console.error('Error fetching active weeks:', error);
            }
        };
        fetchWeeks();
    }, []);

    // Set default selected week
    useEffect(() => {
        if (weeks.length > 0) {
            setSelectedWeek(weeks[weeks.length - 1].number); // default last week
        }
    }, [weeks]);

    // Fetch weekly data when week changes
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

    // Fetch options data
    useEffect(() => {
        fetchLaboursList();
        fetchSites();
        fetchVendorNames();
        fetchContractorNames();
        fetchEmployeeDetails();
    }, []);

    // Combine options
    useEffect(() => { 
        setCombinedOptions([...vendorOptions, ...contractorOptions, ...employeeOptions]); 
    }, [vendorOptions, contractorOptions, employeeOptions]);

    const fetchLaboursList = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/labours-details/getAll');
            if (response.ok) {
                const data = await response.json();
                const formattedData = data.map(item => ({
                    value: item.labour_name,
                    label: item.labour_name,
                    id: item.id,
                    salary: item.labour_salary,
                }));
                setLaboursList(formattedData);
            } else {
                console.log('Error fetching Labour names.');
            }
        } catch (error) {
            console.error('Error:', error);
            console.log('Error fetching Labour names.');
        }
    };

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
                }
            ];
            const combinedSiteOptions = [...predefinedSiteOptions, ...formattedData];
            setSiteOptions(combinedSiteOptions);
        } catch (error) {
            console.error("Fetch error: ", error);
        }
    };

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

    // Generate 7 days for selected week
    const getWeekDays = () => {
        const days = [];
        if (currentWeek) {
            const start = new Date(currentWeek.start);
            for (let i = 0; i < 7; i++) {
                const day = new Date(start);
                day.setDate(start.getDate() + i);
                days.push(day);
            }
        }
        return days;
    };

    const weekDays = getWeekDays();

    // Auto select today's date when component mounts or week changes
    useEffect(() => {
        if (weekDays.length > 0) {
            const todayStr = new Date().toISOString().split("T")[0];
            const matchedDay = weekDays.find(
                (d) => d.toISOString().split("T")[0] === todayStr
            );
            const defaultDate = matchedDay
                ? matchedDay.toISOString().split("T")[0]
                : weekDays[0].toISOString().split("T")[0];
            setSelectedDate(defaultDate);
        }
    }, [currentWeek]);

    // Format helper
    const formatDate = (date) =>
        date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

    const formatDateOnly = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleDateClick = async (dateStr) => {
        setSelectedDate(dateStr);
        try {
            // Fetch daily expenses and refund payments for the selected date
            const [dailyRes, refundRes] = await Promise.all([
                axios.get(`https://backendaab.in/aabuildersDash/api/daily-payments/date/${dateStr}`),
                axios.get(`https://backendaab.in/aabuildersDash/api/refund_received/date/${dateStr}`)
            ]);
            setDailyExpenses(dailyRes.data);
            setRefundPayments(refundRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            setDailyExpenses([]);
            setRefundPayments([]);
        }
    };

    // Calculate totals
    const totalAmount = dailyExpenses
        .filter(row => row.date === selectedDate)
        .reduce((sum, row) => sum + (Number(row.amount || 0) + Number(row.extra_amount || 0)), 0);

    const totalRefund = refundPayments
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const overAllTotalPayments = (totalPayments + totalRefund);
    const balance = overAllTotalPayments - expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    // Get name by ID helper function
    const getNameById = (id, options) => {
        if (!id && id !== 0) return "-";
        const found = options.find(opt => String(opt.id) === String(id));
        return found ? found.label : id;
    };

    return (
        <body>
            <div className='mx-auto w-auto lg:flex gap-8 p-4 pl-8 border-collapse items-center text-left bg-[#FFFFFF] ml-[30px] mr-6 rounded-md lg:h-[150px]'>
                <div className='flex'>
                    <div>
                        <h1 className='font-semibold'>Select Week</h1>
                        <div>
                            <select
                                className="w-[303px] h-[45px] border-2 border-[#BF9853] border-opacity-25 rounded-lg px-3 py-2"
                                value={selectedWeek}
                                onChange={(e) => setSelectedWeek(e.target.value)}
                            >
                                <option value="">-- Select Week --</option>
                                {weeks.map((week) => {
                                    const startDate = new Date(week.start);
                                    const endDate = new Date(week.end);
                                    const formatDate = (date) =>
                                        date.toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "long"
                                        });
                                    return (
                                        <option key={week.number} value={week.number}>
                                            {`Week ${week.number}, ${formatDate(startDate)} to ${formatDate(endDate)}`}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>
                    <div className='block ml-4'>
                        <label className="block font-semibold">Year</label>
                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="border-2 border-[#BF9853] border-opacity-25 rounded-lg px-3 py-2 w-[168px] h-[45px] focus:outline-none"
                        >
                            {years.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    {weekDays.length > 0 && (
                        <div className='lg:w-[600px]'>
                            <div className="grid grid-cols-3 lg:grid-cols-7 gap-2">
                                {weekDays.map((day, idx) => {
                                    const dateStr = day.toISOString().split("T")[0];
                                    return (
                                        <div
                                            key={idx}
                                            className="flex flex-col items-left w-20 mx-auto"
                                        >
                                            {/* Day Name */}
                                            <div className="font-semibold text-[#E4572E]">
                                                {day.toLocaleDateString("en-US", { weekday: "short" })}
                                            </div>

                                            {/* Date Button */}
                                            <button
                                                onClick={() => handleDateClick(dateStr)}
                                                className={`p- rounded-lg border text-center w-20 h-[37px] mt-1 ${selectedDate === dateStr
                                                    ? "bg-[#BF9853] text-white border-[#BF9853]"
                                                    : "bg-white border-gray-300"
                                                    }`}
                                            >
                                                {formatDate(day)}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 flex justify-end mr-6">
                <h1 className="font-bold text-xl">
                    Balance: <span style={{ color: "#E4572E" }}>
                        {Number(balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </h1>
            </div>

            <div className="mx-auto w-auto p-6 border-collapse bg-[#FFFFFF] ml-[30px] mr-6 rounded-md">
                <div className="flex justify-between mb-4">
                    <h1 className="font-bold text-xl">
                        PS: <span style={{ color: "#E4572E" }}>{selectedWeek}</span>
                    </h1>
                    <h1 className="font-bold text-base">
                        Expenses: <span style={{ color: "#E4572E" }}>
                            {Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </h1>
                </div>

                {/* DATA TABLE */}
                <div className="flex flex-col xl:flex-row gap-6">
                    <div className="flex-[2] min-w-0">
                        <div className="w-full h-[500px] rounded-lg border-l-8 border-l-[#BF9853] overflow-hidden">
                            <div className="overflow-auto h-[500px]">
                                <table className="w-[1150px] border-collapse text-left">
                                    <thead className="sticky top-0 z-10 bg-white">
                                        <tr className="bg-[#FAF6ED] h-12">
                                            <th className="px-2 py-2 text-left w-[60px]">Sl.No</th>
                                            <th className="py-2 text-left w-[120px]">Date</th>
                                            <th className="py-2 text-left w-[180px]">Name</th>
                                            <th className="py-2 text-left w-[220px]">Project Name</th>
                                            <th className="py-2 text-left w-[120px]">Type</th>
                                            <th className="py-2 text-left w-[120px]">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dailyExpenses
                                            .filter(row => row.date === selectedDate)
                                            .map((row, index) => (
                                                <tr key={row.id} className="even:bg-[#FAF6ED] odd:bg-[#FFFFFF] text-left">
                                                    <td className="py-2 font-bold">{index + 1}</td>
                                                    <td className="py-2">
                                                        <div className="w-[120px] h-[40px] flex items-center">
                                                            {formatDateOnly(row.date) || ""}
                                                        </div>
                                                    </td>
                                                    <td className="py-2">
                                                        <div className="w-[180px] h-[40px] flex items-center">
                                                            {(() => {
                                                                const employee = employeeOptions.find(opt => opt.id === Number(row.employee_id));
                                                                const vendor = vendorOptions.find(opt => opt.id === Number(row.vendor_id));
                                                                const contractor = contractorOptions.find(opt => opt.id === Number(row.contractor_id));
                                                                const labour = laboursList.find(opt => opt.id === Number(row.labour_id));
                                                                return employee?.label || vendor?.label || contractor?.label || labour?.label || "";
                                                            })()}
                                                        </div>
                                                    </td>
                                                    <td className="py-2">
                                                        <div className="w-[220px] h-[40px] flex items-center">
                                                            {siteOptions.find(opt => opt.id === Number(row.project_id))?.label || ""}
                                                        </div>
                                                    </td>
                                                    <td className="py-2">
                                                        <div className="w-[120px] h-[40px] flex items-center">
                                                            {row.type}
                                                        </div>
                                                    </td>
                                                    <td className="py-2">
                                                        <div className="w-[120px] h-[40px] flex flex-col justify-center leading-tight cursor-default">
                                                            <span>
                                                                {Number((row.amount || 0) + (row.extra_amount || 0)).toLocaleString("en-IN")}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="flex-[1] min-w-0">
                        <div className="flex justify-between mb-4">
                            <h1 className="font-bold text-base">Refund Received</h1>
                            <h1 className="font-bold text-base">
                                Total: <span style={{ color: "#E4572E" }}>
                                    {Number(overAllTotalPayments).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </h1>
                        </div>
                        <div className="rounded-lg border-l-8 border-l-[#BF9853] w-full" style={{ maxHeight: "400px", overflowY: "auto" }}>
                            <table className="w-full border-collapse">
                                <thead className="bg-[#FAF6ED] h-12">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Date</th>
                                        <th className="px-4 py-2 text-left">Name</th>
                                        <th className="px-4 py-2">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {refundPayments.map((row, index) => (
                                        <tr key={row.id || index} className="even:bg-[#FAF6ED] odd:bg-[#FFFFFF] text-left">
                                            <td className="py-2">
                                                {formatDateOnly(row.date) || ""}
                                            </td>
                                            <td className="py-2">
                                                {laboursList.find(opt => opt.id === Number(row.labour_id))?.label || ""}
                                            </td>
                                            <td className="py-2">
                                                {Number(row.amount).toLocaleString("en-IN")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </body>
    );
};

export default DailyHistory;
