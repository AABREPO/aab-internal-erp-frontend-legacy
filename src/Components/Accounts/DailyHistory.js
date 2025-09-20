import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Select from 'react-select';
import Change from '../Images/dropdownchange.png';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [newDailyExpense, setNewDailyExpense] = useState({
        date: "",
        labour_id: "",
        vendor_id: "",
        contractor_id: "",
        employee_id: "",
        project_id: "",
        quantity: "",
        type: "",
        amount: "",
        extra_amount: "",
        description: ""
    });
    const [showExtraAmount, setShowExtraAmount] = useState(false);
    const [isChangeButtonActive, setIsChangeButtonActive] = useState(false);
    const [weeklyTypes, setWeeklyTypes] = useState([]);
    const [expensesCategory, setExpensesCategory] = useState([]);
    const [newRefundReceived, setNewRefundReceived] = useState({
        date: new Date().toISOString().split("T")[0],
        labour_id: "",
        amount: ""
    });
    const currentYear = new Date().getFullYear();
    const currentWeek = weeks.find((w) => w.number === Number(selectedWeek));
    const startYear = 2000;
    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
    function getStartAndEndDateOfWeek(weekNumber, year) {
        const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
        const dayOfWeek = simple.getDay();
        const ISOWeekStart = new Date(simple);
        ISOWeekStart.setDate(simple.getDate() - ((dayOfWeek + 7) % 9)); 
        const ISOWeekEnd = new Date(ISOWeekStart);
        ISOWeekEnd.setDate(ISOWeekStart.getDate() + 6); 
        return {
            number: weekNumber,
            start: ISOWeekStart.toISOString().split("T")[0],
            end: ISOWeekEnd.toISOString().split("T")[0],
        };
    }
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
    useEffect(() => {
        if (weeks.length > 0) {
            setSelectedWeek(weeks[weeks.length - 1].number); 
        }
        }, [weeks]);
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
    useEffect(() => {
        fetchLaboursList();
        fetchSites();
        fetchVendorNames();
        fetchContractorNames();
        fetchEmployeeDetails();
        fetchWeeklyTypes();
        fetchExpensesCategory();
    }, []);
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
    const fetchWeeklyTypes = async () => {
        try {
            const response = await fetch("https://backendaab.in/aabuildersDash/api/weekly-types/getAll", {
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
            setWeeklyTypes(data);
        } catch (error) {
            console.error("Fetch error: ", error);
        }
    };
    const fetchExpensesCategory = async () => {
        try {
            const response = await fetch("https://backendaab.in/aabuildersDash/api/expenses-category/getAll", {
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
            setExpensesCategory(data);
        } catch (error) {
            console.error("Fetch error: ", error);
        }
    };
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
    const formatDate = (date) =>
        date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const handleDateClick = async (dateStr) => {
        setSelectedDate(dateStr);
        setNewDailyExpense((prev) => ({ ...prev, date: dateStr }));
        try {
            const [dailyRes, refundRes] = await Promise.all([
                axios.get(`https://backendaab.in/aabuildersDash/api/daily-payments/date/${dateStr}`),
                axios.get(`https://backendaab.in/aabuildersDash/api/refund_received/date/${dateStr}`)
            ]);
            console.log("Daily Expenses:", dailyRes.data);
            console.log("Refund Payments:", refundRes.data);
            setDailyExpenses(dailyRes.data);
            setRefundPayments(refundRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            setDailyExpenses([]);
            setRefundPayments([]);
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
    const totalAmount = dailyExpenses
        .filter(row => row.date === selectedDate)
        .reduce((sum, row) => sum + (Number(row.amount || 0) + Number(row.extra_amount || 0)), 0);
    const totalRefund = refundPayments
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const overAllTotalPayments = (totalPayments + totalRefund);
    const balance = overAllTotalPayments - expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const netAmount = totalAmount - totalRefund;
    const getNameById = (id, options) => {
        if (!id && id !== 0) return "-";
        const found = options.find(opt => String(opt.id) === String(id));
        return found ? found.label : id;
    };
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    const handleInputChange = (e) => {
        setNewDailyExpense((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleChangeButtonClick = () => {
        setIsChangeButtonActive(prev => !prev);
    };
    const handleNewPaymentChange = (e) => {
        const { name, value } = e.target;
        setNewRefundReceived(prev => ({ ...prev, [name]: value }));
    };
    const handleLabourChange = (selected) => {
        setNewRefundReceived(prev => ({
            ...prev,
            labour_id: selected ? selected.id : ""
        }));
    };
    const handleRefundSubmit = async () => {
        try {
            if (!newRefundReceived.labour_id || !newRefundReceived.amount) {
                alert("Please select labour and enter amount.");
                return;
            }
            const payload = {
                date: selectedDate,
                labour_id: newRefundReceived.labour_id,
                amount: Number(newRefundReceived.amount),
                weekly_number: Number(selectedWeek),
            };
            const response = await axios.post(
                'https://backendaab.in/aabuildersDash/api/refund_received/save',
                payload
            );
            if (response.status === 200) {
                const refundRes = await axios.get(`https://backendaab.in/aabuildersDash/api/refund_received/date/${selectedDate}`);
                setRefundPayments(refundRes.data);
                setNewRefundReceived({
                    labour_id: "",
                    amount: "",
                });
            }
        } catch (error) {
            console.error("Error adding refund:", error);
            alert("Error adding refund. Please try again.");
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleRefundSubmit();
        }
    };
    const handleAddExpense = async () => {
        try {
            const hasAnyId =
                (newDailyExpense.labour_id && Number(newDailyExpense.labour_id) > 0) ||
                (newDailyExpense.contractor_id && Number(newDailyExpense.contractor_id) > 0) ||
                (newDailyExpense.vendor_id && Number(newDailyExpense.vendor_id) > 0) ||
                (newDailyExpense.employee_id && Number(newDailyExpense.employee_id) > 0);
            if (!hasAnyId || !newDailyExpense.project_id || !newDailyExpense.type || !newDailyExpense.amount) {
                alert("Please select all required details.");
                return;
            }
            const expenseData = {
                date: selectedDate,
                created_at: new Date().toISOString(),
                labour_id: Number(newDailyExpense.labour_id) || null,
                vendor_id: Number(newDailyExpense.vendor_id) || null,
                contractor_id: Number(newDailyExpense.contractor_id) || null,
                employee_id: Number(newDailyExpense.employee_id) || null,
                project_id: Number(newDailyExpense.project_id),
                quantity: Number(newDailyExpense.quantity) || 0,
                type: newDailyExpense.type,
                amount: Number(newDailyExpense.amount),
                extra_amount: newDailyExpense.extra_amount ? Number(newDailyExpense.extra_amount) : 0,
                description: newDailyExpense.description || "",
                weekly_number: Number(selectedWeek),
            };
            await axios.post(
                'https://backendaab.in/aabuildersDash/api/daily-payments',
                expenseData
            );
            const [dailyRes, refundRes] = await Promise.all([
                axios.get(`https://backendaab.in/aabuildersDash/api/daily-payments/date/${selectedDate}`),
                axios.get(`https://backendaab.in/aabuildersDash/api/refund_received/date/${selectedDate}`)
            ]);
            setDailyExpenses(dailyRes.data);
            setRefundPayments(refundRes.data);
            setNewDailyExpense({
                labour_id: "",
                vendor_id: "",
                contractor_id: "",
                employee_id: "",
                project_id: "",
                quantity: "",
                type: "",
                amount: "",
                extra_amount: "",
                description: ""
            });
            setShowExtraAmount(false);
        } catch (error) {
            console.error("Error adding expense:", error);
            alert("Error adding expense. Please try again.");
        }
    };
    const sortedDailyExpenses = React.useMemo(() => {
        let sortableData = [...dailyExpenses];
        if (sortConfig.key) {
            sortableData.sort((a, b) => {
                let aValue, bValue;
                switch (sortConfig.key) {
                    case 'date':
                        aValue = new Date(a.date);
                        bValue = new Date(b.date);
                        break;
                    case 'labour_name':
                        if (isChangeButtonActive) {
                            const getAValue = () => {
                                const employee = employeeOptions.find(opt => opt.id === Number(a.employee_id));
                                const vendor = vendorOptions.find(opt => opt.id === Number(a.vendor_id));
                                const contractor = contractorOptions.find(opt => opt.id === Number(a.contractor_id));
                                return employee?.label || vendor?.label || contractor?.label || "";
                            };
                            const getBValue = () => {
                                const employee = employeeOptions.find(opt => opt.id === Number(b.employee_id));
                                const vendor = vendorOptions.find(opt => opt.id === Number(b.vendor_id));
                                const contractor = contractorOptions.find(opt => opt.id === Number(b.contractor_id));
                                return employee?.label || vendor?.label || contractor?.label || "";
                            };
                            aValue = getAValue();
                            bValue = getBValue();
                        } else {
                            aValue = laboursList.find(opt => opt.id === Number(a.labour_id))?.label || "";
                            bValue = laboursList.find(opt => opt.id === Number(b.labour_id))?.label || "";
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
                    case 'amount':
                        aValue = Number(a.amount || 0) + Number(a.extra_amount || 0);
                        bValue = Number(b.amount || 0) + Number(b.extra_amount || 0);
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
    }, [dailyExpenses, sortConfig, laboursList, siteOptions, isChangeButtonActive, combinedOptions, employeeOptions, vendorOptions, contractorOptions]);
    const formatDateOnly = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };
    const generateExpensesPDF = () => {
        if (!selectedDate || dailyExpenses.length === 0) {
            alert("No data available to generate PDF");
            return;
        }
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        const dateObj = new Date(selectedDate);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
        const pageWidth = doc.internal.pageSize.width;
        const headerText = `PS: ${selectedWeek}`;
        const headerText1 = "DAILY PAYMENT STATEMENT";
        const headerText2 = `${formatDateOnly(selectedDate)}`;
        const headerWidth = doc.getTextWidth(headerText);
        const headerX = (pageWidth - headerWidth) / 2;
        doc.text(headerText1, 60, 24);
        doc.text(headerText2, 170, 20);
        doc.text(headerText, 14, 20);
        doc.setFontSize(10);
        const dayText = dayName;
        const dayWidth = doc.getTextWidth(dayText);
        doc.text(dayText, 170, 27);
        doc.setLineWidth(0.5);
        doc.line(14, 15, pageWidth - 14, 15); 
        doc.line(14, 30, pageWidth - 14, 30); 
        doc.setFont(undefined, 'normal');
        const filteredExpenses = sortedDailyExpenses.filter(row => row.date === selectedDate);
        const totalAmount = filteredExpenses.reduce(
            (sum, row) => sum + ((row.amount || 0) + (row.extra_amount || 0)),
            0
        );
        const totalRefundAmount = refundPayments.reduce(
            (sum, row) => sum + Number(row.amount || 0),
            0
        );
        doc.setTextColor(0, 0, 0);
        const expensesTableColumn = [
            "SNO", "PROJECT NAME", "NAME", "QTY", "TYPE", "AMOUNT", "DESCRIPTION"
        ];
        const expensesTableRows = filteredExpenses
            .map((row, index) => {
                const employee = employeeOptions.find(opt => opt.id === Number(row.employee_id));
                const vendor = vendorOptions.find(opt => opt.id === Number(row.vendor_id));
                const contractor = contractorOptions.find(opt => opt.id === Number(row.contractor_id));
                const labour = laboursList.find(opt => opt.id === Number(row.labour_id));
                const name = [employee?.label, vendor?.label, contractor?.label, labour?.label]
                    .filter(Boolean).join(" | ") || "";
                const projectName = siteOptions.find(opt => opt.id === Number(row.project_id))?.label || "";
                const amount = (row.amount || 0) + (row.extra_amount || 0);
                const formattedAmount = `${amount.toLocaleString('en-IN').replace(/\u202F/g, ',')}`;
                const quantity = row.quantity || "";
                const type = row.type || "";
                const description = row.description || "";
                return {
                    sno: index + 1,
                    projectName,
                    name,
                    quantity,
                    type,
                    amount: formattedAmount,
                    description
                };
            })
            .sort((a, b) => {
                const projectCompare = a.projectName.localeCompare(b.projectName);
                if (projectCompare !== 0) return projectCompare;
                return b.type.localeCompare(a.type); 
            })
            .map((row, idx) => [
                (idx + 1).toString(),
                row.projectName,
                row.name,
                row.quantity.toString(),
                row.type,
                row.amount,
                row.description
            ]);
        expensesTableRows.push([
            "",
            "TOTAL",
            "",
            "",
            "",
            `${totalAmount.toLocaleString('en-IN').replace(/\u202F/g, ',')}`,
            ""
        ]);
        const netBalance = totalAmount - totalRefundAmount;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`NET BALANCE: ${netBalance.toLocaleString('en-IN')}`, 155, 38);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('WAGE EXPENSES', 14, 48);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('EXPENDITURE PAYMENTS', 14, 38);
        doc.autoTable({
            startY: 50,
            head: [expensesTableColumn],
            body: expensesTableRows,
            styles: {
                fontSize: 9,
                cellPadding: 2,
                halign: 'left',
                valign: 'middle',
                textColor: [80, 80, 80],
            },
            headStyles: {
                fillColor: [255, 248, 220], 
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                lineColor: [200, 200, 200],
                lineWidth: 0.1,
            },
            columnStyles: {
                0: { cellWidth: 13, halign: 'center', fillColor: [255, 255, 255] },    
                1: { cellWidth: 47, halign: 'left' },      // Project Name
                2: { cellWidth: 34, halign: 'left' },      // Name
                3: { cellWidth: 12, halign: 'center' },    // Qty
                4: { cellWidth: 22, halign: 'left' },      // Type
                5: { cellWidth: 18, halign: 'right' },     // Amount
                6: { cellWidth: 35, halign: 'left' }       // Description
            },
            bodyStyles: {
                lineWidth: 0.1,
            },
            alternateRowStyles: {
                fillColor: false,
            }
        });
        const firstTableEndY = doc.lastAutoTable.finalY;
        const spaceBetweenTables = 10;
        const refundTableColumn = [
            "SNO", "NAME", "AMOUNT"
        ];
        const refundTableRows = refundPayments
            .reverse()
            .map((row, index) => {
                const labour = laboursList.find(opt => opt.id === Number(row.labour_id));
                const name = labour?.label || "";
                const amount = Number(row.amount || 0);
                const formattedAmount = `${amount.toLocaleString('en-IN').replace(/\u202F/g, ',')}`;
                return [
                    (index + 1).toString(),
                    name,
                    formattedAmount
                ];
            });
        refundTableRows.push([
            "",
            "TOTAL",
            `${totalRefundAmount.toLocaleString('en-IN').replace(/\u202F/g, ',')}`
        ]);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('WAGE REFUND', 14, firstTableEndY + spaceBetweenTables - 2);
        doc.autoTable({
            startY: firstTableEndY + spaceBetweenTables,
            head: [refundTableColumn],
            body: refundTableRows,
            styles: {
                fontSize: 9,
                cellPadding: 2,
                halign: 'left',
                valign: 'middle',
                textColor: [80, 80, 80],
            },
            headStyles: {
                fillColor: [255, 248, 220], 
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                lineColor: [200, 200, 200],
                lineWidth: 0.1,
            },
            bodyStyles: {
                lineWidth: 0.1,
            },
            alternateRowStyles: {
                fillColor: false,
            },
            columnStyles: {
                0: { cellWidth: 15, halign: 'center', fillColor: [255, 255, 255] }, 
                1: { cellWidth: 50, halign: 'left' }, 
                2: { cellWidth: 25, halign: 'right' } 
            }
        });
        const fileName = `PS ${selectedWeek} - Daily Payment Statement ${formatDateOnly(selectedDate)}.pdf`;
        doc.save(fileName);
    };
    return (
        <body>
            <h1 className="font-bold text-xl flex justify-end mr-20 -mt-7">
                Balance:<span style={{ color: "#E4572E" }}>{Number(balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2, })}</span>
            </h1>
            <div className=' w-full max-w-[1800px] lg:flex gap-4 lg:gap-8 p-4 lg:pl-8 border-collapse items-center text-left bg-[#FFFFFF] ml-10 mr-6 rounded-md lg:h-[150px]'>
                <div className='lg:flex'>
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
                                        <div key={idx} className="flex flex-col items-left w-20 mx-auto">
                                            <div className="font-semibold text-[#E4572E]">
                                                {day.toLocaleDateString("en-US", { weekday: "short" })}
                                            </div>
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
                <div className="mr-5">
                    <button onClick={generateExpensesPDF} className='font-semibold mt-4 mr-5 hover:text-[#E4572E]'>Report</button>
                </div>
            </div>
            <div className="mt-4 flex justify-end mr-4 lg:mr-16">
                <h1 className="font-bold text-xl">
                    Net Amount: <span style={{ color: "#E4572E" }}>
                        {Number(netAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </h1>
            </div>
            <div className="w-full max-w-[1800px] h-auto p-4 lg:p-6 border-collapse bg-[#FFFFFF] ml-10 mr-6 rounded-md">
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                    <div className="flex-1 lg:flex-[3] min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between mb-4 w-full">
                            <h1 className="font-bold text-xl">
                                PS: <span style={{ color: "#E4572E" }}>{selectedWeek}</span>
                            </h1>
                            <h1 className="font-bold text-base">
                                Expenses: <span style={{ color: "#E4572E" }}>
                                    {Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </h1>
                        </div>
                        <div className="w-full h-[500px] rounded-lg border-l-8 border-l-[#BF9853] overflow-hidden">
                            <div className="overflow-auto max-h-[500px] w-full">
                                <table className="w-full min-w-[1200px] lg:min-w-[1450px] border-collapse text-left">
                                    <thead className="sticky top-0 z-10 bg-white">
                                        <tr className="bg-[#FAF6ED] h-12">
                                            <th className="py-2 px-1 text-left w-[60px]">S.No</th>
                                            <th className="py-2 px-1 text-left w-[200px] cursor-pointer hover:bg-gray-200" onClick={() => handleSort('labour_name')}>
                                                Name {sortConfig.key === 'labour_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="py-2 px-1 text-left w-[220px] cursor-pointer hover:bg-gray-200" onClick={() => handleSort('project_name')}>
                                                Project Name {sortConfig.key === 'project_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="py-2 px-1 text-left w-[120px] cursor-pointer hover:bg-gray-200" onClick={() => handleSort('amount')}>
                                                Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="py-2 px-1 text-left w-[60px]">Qty</th>
                                            <th className="py-2 px-1 text-left w-[120px] cursor-pointer hover:bg-gray-200" onClick={() => handleSort('type')}>
                                                Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="py-2 px-1 text-left w-[80px]">Activity</th>
                                        </tr>
                                        <tr className="bg-white border-b border-gray-200">
                                            <td className="px-1 py-2 font-bold">{dailyExpenses.filter(row => row.date === selectedDate).length + 1}.</td>
                                            <td className="flex items-center gap-2 py-2">
                                                <div>
                                                    <Select
                                                        name="labour_id"
                                                        className="w-[265px]"
                                                        placeholder={isChangeButtonActive ? "Vendor/Contractor" : "Labour Name"}
                                                        isSearchable
                                                        isClearable
                                                        options={isChangeButtonActive ? combinedOptions : laboursList}
                                                        styles={customStyles}
                                                        menuPortalTarget={document.body}
                                                        value={
                                                            isChangeButtonActive
                                                                ? combinedOptions.find(opt =>
                                                                    (opt.type === "Employee" && opt.id === Number(newDailyExpense.employee_id)) ||
                                                                    (opt.type === "Vendor" && opt.id === Number(newDailyExpense.vendor_id)) ||
                                                                    (opt.type === "Contractor" && opt.id === Number(newDailyExpense.contractor_id))
                                                                ) || null
                                                                : laboursList.find(opt => opt.id === Number(newDailyExpense.labour_id)) || null
                                                        }
                                                        onChange={(selectedOption) => {
                                                            if (selectedOption) {
                                                                const { type, id, label, salary } = selectedOption;
                                                                setNewDailyExpense(prev => ({
                                                                    ...prev,
                                                                    labour_id: type === "Labour" ? id : "",
                                                                    vendor_id: type === "Vendor" ? id : "",
                                                                    contractor_id: type === "Contractor" ? id : "",
                                                                    employee_id: type === "Employee" ? id : "",
                                                                    labour_name: label,
                                                                    amount: salary || ""
                                                                }));
                                                            } else {
                                                                setNewDailyExpense(prev => ({
                                                                    ...prev,
                                                                    labour_id: "",
                                                                    vendor_id: "",
                                                                    contractor_id: "",
                                                                    employee_id: "",
                                                                    labour_name: "",
                                                                    amount: ""
                                                                }));
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <button onClick={handleChangeButtonClick}>
                                                        <img src={Change} className={`w-4 h-4 ${isChangeButtonActive ? 'opacity-70' : ''}`} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-1 py-2">
                                                <Select
                                                    name="project"
                                                    value={siteOptions.find(opt => opt.id === Number(newDailyExpense.project_id)) || null}
                                                    onChange={(selectedOption) => {
                                                        setNewDailyExpense(prev => ({
                                                            ...prev,
                                                            project_id: selectedOption ? selectedOption.id : ""
                                                        }));
                                                    }}
                                                    options={siteOptions}
                                                    menuPortalTarget={document.body}
                                                    className="w-[260px]"
                                                    placeholder="Select Site"
                                                    isSearchable
                                                    isClearable
                                                    styles={customStyles}
                                                />
                                            </td>
                                            <td className="px-1 py-2 text-left flex items-center gap-2">
                                                <div>
                                                    <input
                                                        type="number"
                                                        name="amount"
                                                        className="border-2 border-[#BF9853] border-opacity-25 p-1 w-[90px] h-[40px] rounded-lg focus:outline-none no-spinner"
                                                        value={newDailyExpense.amount || ""}
                                                        onChange={(e) => setNewDailyExpense(prev => ({ ...prev, amount: e.target.value }))}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                e.preventDefault();
                                                                handleAddExpense();
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <button className="font-semibold text-[25px]" onClick={() => setShowExtraAmount(prev => !prev)} type="button">
                                                        +
                                                    </button>
                                                </div>
                                                {showExtraAmount && (
                                                    <div>
                                                        <input
                                                            type="number"
                                                            name="extra_amount"
                                                            className="border-2 border-[#BF9853] border-opacity-25 p-1 w-[90px] h-[40px] rounded-lg focus:outline-none no-spinner"
                                                            placeholder="Extra"
                                                            value={newDailyExpense.extra_amount || ""}
                                                            onChange={(e) => setNewDailyExpense(prev => ({
                                                                ...prev,
                                                                extra_amount: e.target.value
                                                            }))}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    e.preventDefault();
                                                                    handleAddExpense();
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-1 py-2">
                                                <input
                                                    type="number"
                                                    name="quantity"
                                                    className="border-2 border-[#BF9853] border-opacity-25 p-1 w-[60px] h-[40px] rounded-lg focus:outline-none no-spinner"
                                                    value={newDailyExpense.quantity || ""}
                                                    onChange={(e) => setNewDailyExpense(prev => ({ ...prev, quantity: e.target.value }))}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            handleAddExpense();
                                                        }
                                                    }}
                                                />
                                            </td>
                                            <td className="px-1 py-2 text-left">
                                                <select
                                                    name="type"
                                                    value={newDailyExpense.type}
                                                    onChange={handleInputChange}
                                                    className="border-2 border-[#BF9853] border-opacity-25 p-1 w-[120px] h-[40px] rounded-lg focus:outline-none"
                                                >
                                                    <option value="">Select</option>
                                                    {(isChangeButtonActive ? expensesCategory : weeklyTypes).map((type, index) => (
                                                        <option key={index} value={isChangeButtonActive ? type.category : type.type}>
                                                            {isChangeButtonActive ? type.category : type.type}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-1 py-2">
                                            </td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dailyExpenses
                                            .filter(row => row.date === selectedDate)
                                            .map((row, index) => (
                                                <tr key={row.id} className="even:bg-[#FAF6ED] odd:bg-[#FFFFFF] text-left">
                                                    <td className="px-1 py-2 font-bold">{index + 1}</td>
                                                    <td className="px-1 py-2">
                                                        <div className="w-[200px] h-[40px] flex items-center">
                                                            {(() => {
                                                                const employee = employeeOptions.find(opt => opt.id === Number(row.employee_id));
                                                                const vendor = vendorOptions.find(opt => opt.id === Number(row.vendor_id));
                                                                const contractor = contractorOptions.find(opt => opt.id === Number(row.contractor_id));
                                                                const labour = laboursList.find(opt => opt.id === Number(row.labour_id));
                                                                return employee?.label || vendor?.label || contractor?.label || labour?.label || "";
                                                            })()}
                                                        </div>
                                                    </td>
                                                    <td className="px-1 py-2">
                                                        <div className="w-[220px] h-[40px] flex items-center">
                                                            {siteOptions.find(opt => opt.id === Number(row.project_id))?.label || ""}
                                                        </div>
                                                    </td>
                                                    <td className="px-1 py-2 relative group flex">
                                                        <div className="flex items-center">
                                                            <div className="w-[120px] h-[40px] flex flex-col justify-center leading-tight cursor-default">
                                                                <span>
                                                                    {Number((row.amount || 0) + (row.extra_amount || 0)).toLocaleString("en-IN")}
                                                                </span>
                                                                <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-black text-white text-xs rounded p-2 z-50 shadow-lg whitespace-nowrap">
                                                                    Amount: {Number(row.amount || 0).toLocaleString('en-IN')} <br />
                                                                    Extra Amount: {Number(row.extra_amount || 0).toLocaleString('en-IN')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-1 py-2">
                                                        <div className="w-[60px] h-[40px] flex items-center">
                                                            {row.quantity || "-"}
                                                        </div>
                                                    </td>
                                                    <td className="px-1 py-2">
                                                        <div className="w-[120px] h-[40px] flex items-center">
                                                            {row.type}
                                                        </div>
                                                    </td>
                                                    <td className="px-1 py-2">
                                                        <div className="w-[80px] h-[40px] flex items-center">
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 lg:flex-[1] min-w-0 lg:max-w-[400px]">
                        <div className="flex justify-between mb-4">
                            <h1 className="font-bold text-base">Refund Received</h1>
                            <h1 className="font-bold text-base">
                                Total: <span style={{ color: "#E4572E" }}>
                                    {Number(totalRefund).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </h1>
                        </div>
                        <div>
                            <div className="w-full rounded-lg border-l-8 border-l-[#BF9853] overflow-x-auto" style={{ maxHeight: "400px" }}>
                                <table className="w-full min-w-[350px] lg:min-w-[380px] border-collapse">
                                    <thead className="bg-[#FAF6ED] h-12">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Name</th>
                                            <th className="px-4 py-2">Amount</th>
                                            <th className="px-4 py-2 text-left">Activity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {refundPayments.map((row, index) => (
                                            <tr key={row.id || index} className="even:bg-[#FAF6ED] odd:bg-[#FFFFFF] text-left">
                                                <td className="py-2">
                                                    {laboursList.find(opt => opt.id === Number(row.labour_id))?.label || ""}
                                                </td>
                                                <td className="py-2">
                                                    {Number(row.amount).toLocaleString("en-IN")}
                                                </td>
                                                <td className="py-2">
                                                    {row.description || "-"}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td className="py-2 text-left">
                                                <Select
                                                    name="labour_id"
                                                    className="w-[265px] text-left"
                                                    placeholder="Labour Name"
                                                    isSearchable
                                                    isClearable
                                                    value={laboursList.find(opt => opt.id === newRefundReceived.labour_id) || null}
                                                    onChange={handleLabourChange}
                                                    onKeyDown={handleKeyDown}
                                                    options={laboursList}
                                                    styles={customStyles}
                                                    menuPortalTarget={document.body}
                                                />
                                            </td>
                                            <td className="py-2">
                                                <input
                                                    type="number"
                                                    name="amount"
                                                    value={newRefundReceived.amount}
                                                    onChange={handleNewPaymentChange}
                                                    onKeyDown={handleKeyDown}
                                                    className="border-2 border-[#BF9853] border-opacity-25 rounded-lg w-[90px] h-[40px] focus:outline-none no-spinner"
                                                    min="0"
                                                    step="any"
                                                    onWheel={(e) => e.preventDefault()}
                                                />
                                            </td>
                                            <td className="py-2">
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
    );
};
export default DailyHistory;