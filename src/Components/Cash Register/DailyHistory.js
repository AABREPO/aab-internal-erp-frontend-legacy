import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Select from 'react-select';
import Change from '../Images/dropdownchange.png';
import fileUpload from '../Images/file_upload.png';
import file from '../Images/file.png';
import NotesStart from '../Images/notes _start.png';
import NotesEnd from '../Images/notes_end.png';
import Edit from '../Images/Edit.svg';
import Delete from '../Images/Delete.svg';
import history from '../Images/History.svg';
import Filter from '../Images/filter (3).png';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';
const DailyHistory = ({ username, userRoles = [] }) => {
    const [selectedWeek, setSelectedWeek] = useState("");
    const [weeks, setWeeks] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [dailyExpenses, setDailyExpenses] = useState([]);
    const [refundPayments, setRefundPayments] = useState([]);
    const [payments, setPayments] = useState([]);
    const [expenses, setExpenses] = useState([]);
    // Get the current week year (ISO 8601) - may differ from calendar year for weeks spanning year boundaries
    const getCurrentWeekYear = () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        const dayOfWeek = d.getDay() || 7;
        const thursday = new Date(d);
        thursday.setDate(d.getDate() + 4 - dayOfWeek);
        thursday.setHours(0, 0, 0, 0);
        return thursday.getFullYear();
    };
    const [year, setYear] = useState(getCurrentWeekYear().toString());
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
        vendor_id: "",
        contractor_id: "",
        employee_id: "",
        amount: ""
    });
    const [showPopups, setShowPopups] = useState(false);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [entryId, setEntryId] = useState(null);
    const [fileUploadPopup, setFileUploadPopup] = useState(false);
    const [currentFileRow, setCurrentFileRow] = useState(null);
    const [selectedFileForPopup, setSelectedFileForPopup] = useState(null);
    const [editingDailyExpenseRowId, setEditingDailyExpenseRowId] = useState('');
    const [editingPaymentId, setEditingPaymentId] = useState('');
    const [isRefundChangeButtonActive, setIsRefundChangeButtonActive] = useState(false);
    const [editDailyExpenseData, setEditDailyExpenseData] = useState({
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
        description: "",
        file_url: ""
    });
    const [editRefundPaymentData, setEditRefundPaymentData] = useState({
        labour_id: "",
        vendor_id: "",
        contractor_id: "",
        employee_id: "",
        amount: "",
    });
    const [showWeeklyPaymentExpensesModal, setShowWeeklyPaymentExpensesModal] = useState(false);
    const [weeklyPaymentExpensesAudits, setWeeklyPaymentExpensesAudits] = useState([]);
    const [showWeeklyPaymentReceivedModal, setShowWeeklyPaymentReceivedModal] = useState(false);
    const [weeklyPaymentReceivedAudits, setWeeklyPaymentReceivedAudits] = useState([]);
    const [sendingToExpensesEntry, setSendingToExpensesEntry] = useState(false);
    const [sendingProgress, setSendingProgress] = useState({ current: 0, total: 0 });
    const [showFilters, setShowFilters] = useState(false);
    const [selectDate, setSelectDate] = useState('');
    const [selectContractororVendorName, setSelectContractororVendorName] = useState('');
    const [selectProjectName, setSelectProjectName] = useState('');
    const [selectType, setSelectType] = useState('');
    const scrollRef = useRef(null);
    const refundScrollRef = useRef(null);
    const isDragging = useRef(false);
    const start = useRef({ x: 0, y: 0 });
    const scroll = useRef({ left: 0, top: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const animationFrame = useRef(null);
    const lastMove = useRef({ time: 0, x: 0, y: 0 });
    const currentYear = new Date().getFullYear();
    const currentWeek = weeks.find((w) => w.number === Number(selectedWeek));
    const startYear = 2000;
    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
    const lastWeekNumber = weeks.length > 0 ? Math.max(...weeks.map(week => week.number)) : 0;
    const canEditDelete = userRoles.includes('Admin') || username === 'Mahalingam M';
    const handleMouseDown = (e, ref) => {
        if (!ref.current) return;
        isDragging.current = true;
        start.current = { x: e.clientX, y: e.clientY };
        scroll.current = {
            left: ref.current.scrollLeft,
            top: ref.current.scrollTop,
        };
        lastMove.current = {
            time: Date.now(),
            x: e.clientX,
            y: e.clientY,
        };
        ref.current.style.cursor = 'grabbing';
        ref.current.style.userSelect = 'none';
        cancelMomentum();
    };
    const handleMouseMove = (e, ref) => {
        if (!isDragging.current || !ref.current) return;
        const dx = e.clientX - start.current.x;
        const dy = e.clientY - start.current.y;
        const now = Date.now();
        const dt = now - lastMove.current.time || 16;
        velocity.current = {
            x: (e.clientX - lastMove.current.x) / dt,
            y: (e.clientY - lastMove.current.y) / dt,
        };
        ref.current.scrollLeft = scroll.current.left - dx;
        ref.current.scrollTop = scroll.current.top - dy;
        lastMove.current = {
            time: now,
            x: e.clientX,
            y: e.clientY,
        };
    };
    const handleMouseUp = (ref) => {
        if (!isDragging.current || !ref.current) return;
        isDragging.current = false;
        ref.current.style.cursor = '';
        ref.current.style.userSelect = '';
        applyMomentum();
    };
    const cancelMomentum = () => {
        if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
            animationFrame.current = null;
        }
    };
    const applyMomentum = () => {
        if (!scrollRef.current && !refundScrollRef.current) return;
        const friction = 0.95;
        const minVelocity = 0.1;
        const step = () => {
            const { x, y } = velocity.current;
            const activeRef = scrollRef.current || refundScrollRef.current;
            if (!activeRef) return;
            if (Math.abs(x) > minVelocity || Math.abs(y) > minVelocity) {
                activeRef.scrollLeft -= x * 20;
                activeRef.scrollTop -= y * 20;
                velocity.current.x *= friction;
                velocity.current.y *= friction;
                animationFrame.current = requestAnimationFrame(step);
            } else {
                cancelMomentum();
            }
        };
        animationFrame.current = requestAnimationFrame(step);
    };
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
    // Get the year that a week belongs to (ISO 8601 - based on Thursday's year)
    const getWeekYear = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        const dayOfWeek = d.getDay() || 7;
        const thursday = new Date(d);
        thursday.setDate(d.getDate() + 4 - dayOfWeek);
        thursday.setHours(0, 0, 0, 0);
        return thursday.getFullYear();
    };
    useEffect(() => {
        const fetchWeeks = async () => {
            try {
                const response = await axios.get('https://backendaab.in/aabuildersDash/api/payments-received/active_weeks');
                const selectedYear = parseInt(year, 10);
                
                // Filter and enrich weeks for the selected year
                const enrichedWeeks = response.data
                    .map((weekNumber) => {
                        // Calculate week dates for the selected year
                        const weekInfo = getStartAndEndDateOfWeek(weekNumber, selectedYear);
                        // Check if this week actually belongs to the selected year (ISO 8601)
                        const weekStartDate = new Date(weekInfo.start);
                        const weekYear = getWeekYear(weekStartDate);
                        
                        // Only include weeks that belong to the selected year
                        if (weekYear === selectedYear) {
                            return weekInfo;
                        }
                        return null;
                    })
                    .filter(week => week !== null); // Remove weeks that don't belong to selected year
                
                setWeeks(enrichedWeeks);
            } catch (error) {
                console.error('Error fetching active weeks:', error);
            }
        };
        fetchWeeks();
    }, [year]);
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
    useEffect(() => {
        return () => {
            cancelMomentum();
        };
    }, []);
    const fetchLaboursList = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/labours-details/getAll');
            if (response.ok) {
                const data = await response.json();
                const formattedData = data.map(item => ({
                    value: item.labour_name,
                    label: item.labour_name,
                    id: item.id,
                    type: "Labour",
                    salary: item.labour_salary,
                }));
                setLaboursList(formattedData);
            } else {
                console.log('Error fetching Labour names.');
            }
        } catch (error) {
            console.error('Error:', error);
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
            const response = await fetch("https://backendaab.in/aabuildersDash/api/weekly_types/getAll", {
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
            // Add Staff Advance to the types if it doesn't exist
            const hasStaffAdvance = data.some(type => type.type === "Staff Advance");
            if (!hasStaffAdvance) {
                data.push({ type: "Staff Advance" });
            }
            setWeeklyTypes(data);
        } catch (error) {
            console.error("Fetch error: ", error);
        }
    };
    const fetchExpensesCategory = async () => {
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
            // Add Staff Advance to the categories if it doesn't exist
            const hasStaffAdvance = data.some(category => category.category === "Staff Advance");
            if (!hasStaffAdvance) {
                data.push({ category: "Staff Advance" });
            }
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
            // Always set the first day of the selected week as default
            const defaultDate = weekDays[0].toISOString().split("T")[0];
            setSelectedDate(defaultDate);
            setNewRefundReceived((prev) => ({ ...prev, date: defaultDate }));
            // Fetch data for the first day of the week
            const fetchDataForDate = async (dateStr) => {
                try {
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

            fetchDataForDate(defaultDate);
        }
    }, [currentWeek]);
    const formatDate = (date) =>
        date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const handleDateClick = async (dateStr) => {
        setSelectedDate(dateStr);
        setNewDailyExpense((prev) => ({ ...prev, date: dateStr }));
        setNewRefundReceived((prev) => ({ ...prev, date: dateStr }));
        try {
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
    const handleRefundSelectChange = (selected) => {
        setNewRefundReceived(prev => ({
            ...prev,
            labour_id: selected && selected.type === "Labour" ? selected.id : "",
            vendor_id: selected && selected.type === "Vendor" ? selected.id : "",
            contractor_id: selected && selected.type === "Contractor" ? selected.id : "",
            employee_id: selected && selected.type === "Employee" ? selected.id : "",
        }));
    };
    const handleRefundChangeButtonClick = () => {
        setIsRefundChangeButtonActive((prev) => {
            const next = !prev;
            setNewRefundReceived((state) => ({
                ...state,
                labour_id: next ? "" : state.labour_id,
                vendor_id: next ? state.vendor_id : "",
                contractor_id: next ? state.contractor_id : "",
                employee_id: next ? state.employee_id : "",
            }));
            return next;
        });
    };
    const handleRefundSubmit = async () => {
        try {
            const hasPayee =
                (newRefundReceived.labour_id && Number(newRefundReceived.labour_id) > 0) ||
                (newRefundReceived.vendor_id && Number(newRefundReceived.vendor_id) > 0) ||
                (newRefundReceived.contractor_id && Number(newRefundReceived.contractor_id) > 0) ||
                (newRefundReceived.employee_id && Number(newRefundReceived.employee_id) > 0);
            if (!hasPayee || !newRefundReceived.amount) {
                alert("Please select payee and enter amount.");
                return;
            }
            const payload = {
                date: selectedDate,
                labour_id: newRefundReceived.labour_id ? Number(newRefundReceived.labour_id) : null,
                vendor_id: newRefundReceived.vendor_id ? Number(newRefundReceived.vendor_id) : null,
                contractor_id: newRefundReceived.contractor_id ? Number(newRefundReceived.contractor_id) : null,
                employee_id: newRefundReceived.employee_id ? Number(newRefundReceived.employee_id) : null,
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
                    date: selectedDate,
                    labour_id: "",
                    vendor_id: "",
                    contractor_id: "",
                    employee_id: "",
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
    const formatDateOnly = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };
    const clearFilters = () => {
        setSelectDate('');
        setSelectContractororVendorName('');
        setSelectProjectName('');
        setSelectType('');
    };
    const getVendorName = (id) =>
        vendorOptions.find(v => String(v.id) === String(id))?.value || "";
    const getContractorName = (id) =>
        contractorOptions.find(c => String(c.id) === String(id))?.value || "";
    const getEmployeeName = (id) =>
        employeeOptions.find(e => String(e.id) === String(id))?.value || "";
    const getSiteName = (id) =>
        siteOptions.find(s => String(s.id) === String(id))?.value || "";
    const filteredExpenses = dailyExpenses.filter((entry) => {
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
                    : entry.contractor_id
                        ? getContractorName(entry.contractor_id)
                        : entry.employee_id
                            ? getEmployeeName(entry.employee_id)
                            : entry.labour_id
                                ? laboursList.find(l => l.id === Number(entry.labour_id))?.label || ""
                                : "";
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
    const contractorVendorFilterOptions = React.useMemo(() => {
        const ids = new Set();
        const options = [];
        filteredExpenses.forEach(exp => {
            const option =
                combinedOptions.find(
                    opt =>
                        (opt.type === "Contractor" && opt.id === Number(exp.contractor_id)) ||
                        (opt.type === "Vendor" && opt.id === Number(exp.vendor_id)) ||
                        (opt.type === "Employee" && opt.id === Number(exp.employee_id))
                );
            if (option && !ids.has(option.id)) {
                ids.add(option.id);
                options.push({ value: option.label, label: option.label });
            }
        });
        filteredExpenses.forEach(exp => {
            const labourOption = laboursList.find(opt => opt.id === Number(exp.labour_id));
            if (labourOption && !ids.has(labourOption.id)) {
                ids.add(labourOption.id);
                options.push({ value: labourOption.label, label: labourOption.label });
            }
        });
        return options;
    }, [filteredExpenses, combinedOptions, laboursList]);
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
    const typeFilterOptions = React.useMemo(() => {
        const types = new Set();
        filteredExpenses.forEach(exp => {
            if (exp.type) {
                types.add(exp.type);
            }
        });
        return Array.from(types).map(type => ({
            value: type,
            label: type
        }));
    }, [filteredExpenses]);
    const refundSelectOptions = React.useMemo(() => {
        const unique = new Map();
        [...laboursList, ...combinedOptions].forEach((option) => {
            const key = `${option.type || 'Labour'}-${option.id}`;
            if (!unique.has(key)) {
                unique.set(key, option);
            }
        });
        return Array.from(unique.values());
    }, [laboursList, combinedOptions]);
    const sortedDailyExpenses = React.useMemo(() => {
        let sortableData = [...filteredExpenses];
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
    }, [filteredExpenses, sortConfig, laboursList, siteOptions, isChangeButtonActive, combinedOptions, employeeOptions, vendorOptions, contractorOptions]);
    const calculateBalanceForRefundPayments = async (refundPaymentsList) => {
        try {
            // Fetch all data once
            const [staffAdvanceRes, loanRes] = await Promise.all([
                fetch('https://backendaab.in/aabuildersDash/api/staff-advance/all'),
                fetch('https://backendaab.in/aabuildersDash/api/loans/all')
            ]);

            const staffAdvanceData = staffAdvanceRes.ok ? await staffAdvanceRes.json() : [];
            const loanData = loanRes.ok ? await loanRes.json() : [];

            const selectedDateObj = new Date(selectedDate);

            // Calculate balances for each refund payment
            return refundPaymentsList.map((refundRow, currentIndex) => {
                let balance = 0;

                if (refundRow.labour_id) {
                    // For labour_id: Get balance from staff-advance data
                    // Filter entries for this labour_id up to selectedDate
                    const labourEntries = staffAdvanceData.filter(entry => {
                        if (entry.labour_id !== Number(refundRow.labour_id)) return false;
                        const entryDate = new Date(entry.date);
                        if (entryDate > selectedDateObj) return false;

                        // Exclude refunds from staff-advance that match refunds in refundPaymentsList
                        // to avoid double-counting
                        if (entry.type === 'Refund') {
                            const refundAmount = Number(entry.staff_refund_amount || 0);
                            const refundDate = new Date(entry.date);
                            // Check if this refund matches any refund in refundPaymentsList
                            const matchesRefundInList = refundPaymentsList.some(refund => {
                                if (refund.labour_id !== Number(refundRow.labour_id)) return false;
                                const refundListDate = new Date(refund.date || selectedDate);
                                return refundDate.getTime() === refundListDate.getTime() &&
                                    Math.abs(refundAmount - Number(refund.amount || 0)) < 0.01;
                            });
                            if (matchesRefundInList) return false;
                        }
                        return true;
                    });

                    // Calculate base balance: Advance amount - Refund amount from staff-advance data
                    labourEntries.forEach(entry => {
                        if (entry.type === 'Advance') {
                            balance += Number(entry.amount || 0);
                        } else if (entry.type === 'Refund') {
                            balance -= Number(entry.staff_refund_amount || 0);
                        }
                    });

                    // Subtract all refunds from refundPaymentsList for this labour up to and including current row
                    for (let i = 0; i <= currentIndex; i++) {
                        const refund = refundPaymentsList[i];
                        if (refund.labour_id === refundRow.labour_id) {
                            balance -= Number(refund.amount || 0);
                        }
                    }
                } else if (refundRow.vendor_id || refundRow.contractor_id) {
                    // For vendor_id/contractor_id: Get balance from loan data
                    const loanEntries = loanData.filter(entry => {
                        const matchesVendor = refundRow.vendor_id && entry.vendor_id === Number(refundRow.vendor_id);
                        const matchesContractor = refundRow.contractor_id && entry.contractor_id === Number(refundRow.contractor_id);
                        if (!matchesVendor && !matchesContractor) return false;
                        const entryDate = new Date(entry.date);
                        if (entryDate > selectedDateObj) return false;

                        // Exclude refunds from loan data that match refunds in refundPaymentsList
                        // to avoid double-counting
                        if (entry.type === 'Refund') {
                            const refundAmount = Number(entry.loan_refund_amount || 0);
                            const refundDate = new Date(entry.date);
                            // Check if this refund matches any refund in refundPaymentsList
                            const matchesRefundInList = refundPaymentsList.some(refund => {
                                const matchesVendorRefund = refundRow.vendor_id && refund.vendor_id === refundRow.vendor_id;
                                const matchesContractorRefund = refundRow.contractor_id && refund.contractor_id === refundRow.contractor_id;
                                if (!matchesVendorRefund && !matchesContractorRefund) return false;
                                const refundListDate = new Date(refund.date || selectedDate);
                                return refundDate.getTime() === refundListDate.getTime() &&
                                    Math.abs(refundAmount - Number(refund.amount || 0)) < 0.01;
                            });
                            if (matchesRefundInList) return false;
                        }
                        return true;
                    });

                    // Calculate base balance: Loan amount - Refund amount from loan data
                    loanEntries.forEach(entry => {
                        if (entry.type === 'Loan' || entry.type === 'Transfer') {
                            balance += Number(entry.amount || 0);
                        } else if (entry.type === 'Refund') {
                            balance -= Number(entry.loan_refund_amount || 0);
                        }
                    });

                    // Subtract all refunds from refundPaymentsList for this vendor/contractor up to and including current row
                    for (let i = 0; i <= currentIndex; i++) {
                        const refund = refundPaymentsList[i];
                        if ((refundRow.vendor_id && refund.vendor_id === refundRow.vendor_id) ||
                            (refundRow.contractor_id && refund.contractor_id === refundRow.contractor_id)) {
                            balance -= Number(refund.amount || 0);
                        }
                    }
                }

                return { ...refundRow, calculatedBalance: balance };
            });
        } catch (error) {
            console.error('Error calculating balances:', error);
            return refundPaymentsList.map(row => ({ ...row, calculatedBalance: 0 }));
        }
    };
    const generateExpensesPDF = async () => {
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
        const filteredExpenses = dailyExpenses.filter(row => row.date === selectedDate && row.type !== "Staff Advance" && row.type !== "Diwali Bonus");
        const totalAmount = filteredExpenses.reduce(
            (sum, row) => sum + ((row.amount || 0) + (row.extra_amount || 0)),
            0
        );
        const advanceExpenses = dailyExpenses.filter(row => row.date === selectedDate && row.type === "Staff Advance");
        const totalAdvanceAmount = advanceExpenses.reduce(
            (sum, row) => sum + ((row.amount || 0) + (row.extra_amount || 0)),
            0
        );
        const diwaliBonusExpenses = dailyExpenses.filter(row => row.date === selectedDate && row.type === "Diwali Bonus");
        const totalDiwaliBonusAmount = diwaliBonusExpenses.reduce(
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
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('WAGE EXPENSES', 14, 44);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('EXPENDITURE PAYMENTS', 14, 35);
        doc.autoTable({
            startY: 46,
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
                1: { cellWidth: 47, halign: 'left' },
                2: { cellWidth: 30, halign: 'left' },
                3: { cellWidth: 12, halign: 'center' },
                4: { cellWidth: 25, halign: 'left' },
                5: { cellWidth: 20, halign: 'right' },
                6: { cellWidth: 35, halign: 'left' }
            },
            bodyStyles: {
                lineWidth: 0.1,
            },
            alternateRowStyles: {
                fillColor: false,
            },
            didParseCell: function (data) {
                if (data.row.index === expensesTableRows.length - 1) {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [255, 255, 255];
                    data.cell.styles.textColor = [0, 0, 0];
                }
            }
        });
        const firstTableEndY = doc.lastAutoTable.finalY;
        const spaceBetweenTables = 10;
        const netBalance = totalAmount - totalRefundAmount;
        doc.setPage(1);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`NET BALANCE: ${netBalance.toLocaleString('en-IN')}`, 155, 35);
        const addHeaderToPage = (pageNum) => {
            doc.setPage(pageNum);
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(headerText1, 60, 24);
            doc.text(headerText2, 170, 20);
            doc.text(headerText, 14, 20);
            doc.setFontSize(10);
            doc.text(dayText, 170, 27);
            doc.setLineWidth(0.5);
            doc.line(14, 15, pageWidth - 14, 15);
            doc.line(14, 30, pageWidth - 14, 30);
        };
        doc.addPage();
        addHeaderToPage(doc.internal.getNumberOfPages());
        const secondPageStartY = 40;
        const sideBySideStartY = secondPageStartY;
        const refundTableColumn = [
            "SNO", "NAME", "", "BALANCE"
        ];
        // Calculate balances for all refund payments
        const refundPaymentsWithBalance = await calculateBalanceForRefundPayments(refundPayments.slice().reverse());
        const refundTableRows = refundPaymentsWithBalance.map((row, index) => {
            const vendor = vendorOptions.find(opt => opt.id === Number(row.vendor_id));
            const contractor = contractorOptions.find(opt => opt.id === Number(row.contractor_id));
            const labour = laboursList.find(opt => opt.id === Number(row.labour_id));
            const name = vendor?.label || contractor?.label || labour?.label || "";
            const amount = Number(row.amount || 0);
            const formattedAmount = `${amount.toLocaleString('en-IN').replace(/\u202F/g, ',')}`;
            const formattedBalance = `${row.calculatedBalance.toLocaleString('en-IN').replace(/\u202F/g, ',')}`;
            return [
                (index + 1).toString(),
                name,
                formattedAmount,
                formattedBalance
            ];
        });
        refundTableRows.push([
            "",
            "TOTAL",
            `${totalRefundAmount.toLocaleString('en-IN').replace(/\u202F/g, ',')}`
        ]);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('WAGE REFUND', 14, sideBySideStartY - 2);
        doc.autoTable({
            startY: sideBySideStartY,
            head: [refundTableColumn],
            body: refundTableRows,
            tableWidth: 'wrap',
            styles: {
                fontSize: 8,
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
                0: { cellWidth: 10, halign: 'center', fillColor: [255, 255, 255] },
                1: { cellWidth: 30, halign: 'left' },
                2: { cellWidth: 20, halign: 'right' },
                3: { cellWidth: 20, halign: 'right' }
            },
            margin: { left: 14, right: 95 },
            didDrawPage: function (data) {
                if (data.pageNumber > 1) {
                    addHeaderToPage(data.pageNumber);
                }
            }
        });
        const refundTableEndY = doc.lastAutoTable.finalY;
        if (advanceExpenses.length > 0) {
            const advanceTableColumn = [
                "S.NO", "PROJECT NAME", "STAFF NAME", "TOTAL AMOUNT"
            ];
            const advanceTableRows = advanceExpenses
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

                    return [
                        (index + 1).toString(),
                        projectName,
                        name,
                        formattedAmount
                    ];
                });
            advanceTableRows.push([
                "",
                "TOTAL",
                "",
                `${totalAdvanceAmount.toLocaleString('en-IN').replace(/\u202F/g, ',')}`
            ]);
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('STAFF ADVANCE', 100, sideBySideStartY - 2);
            doc.autoTable({
                startY: sideBySideStartY,
                head: [advanceTableColumn],
                body: advanceTableRows,
                tableWidth: 'wrap',
                styles: {
                    fontSize: 8,
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
                    0: { cellWidth: 11, halign: 'center', fillColor: [255, 255, 255] },
                    1: { cellWidth: 34, halign: 'left' },
                    2: { cellWidth: 32, halign: 'left' },
                    3: { cellWidth: 20, halign: 'right' }
                },
                margin: { left: 100, right: 0 },
                didDrawPage: function (data) {
                    if (data.pageNumber > 1) {
                        addHeaderToPage(data.pageNumber);
                    }
                }
            });
        }
        if (diwaliBonusExpenses.length > 0) {
            const diwaliBonusTableColumn = [
                "SNO", "NAME", "AMOUNT"
            ];
            const diwaliBonusTableRows = diwaliBonusExpenses
                .map((row, index) => {
                    const employee = employeeOptions.find(opt => opt.id === Number(row.employee_id));
                    const vendor = vendorOptions.find(opt => opt.id === Number(row.vendor_id));
                    const contractor = contractorOptions.find(opt => opt.id === Number(row.contractor_id));
                    const labour = laboursList.find(opt => opt.id === Number(row.labour_id));
                    const name = [employee?.label, vendor?.label, contractor?.label, labour?.label]
                        .filter(Boolean).join(" | ") || "";
                    const amount = (row.amount || 0) + (row.extra_amount || 0);
                    const formattedAmount = `${amount.toLocaleString('en-IN').replace(/\u202F/g, ',')}`;
                    return [
                        (index + 1).toString(),
                        name,
                        formattedAmount
                    ];
                });
            diwaliBonusTableRows.push([
                "",
                "TOTAL",
                `${totalDiwaliBonusAmount.toLocaleString('en-IN').replace(/\u202F/g, ',')}`
            ]);
            let diwaliY = sideBySideStartY;
            let diwaliX = 100;
            if (advanceExpenses.length === 0) {
                doc.setFontSize(12);
                doc.setFont(undefined, 'bold');
                doc.text('DIWALI BONUS', diwaliX, sideBySideStartY - 2);
            } else {
                diwaliY = Math.max(refundTableEndY, doc.lastAutoTable.finalY) + 15;
                diwaliX = 14;
                doc.setFontSize(12);
                doc.setFont(undefined, 'bold');
                doc.text('DIWALI BONUS', diwaliX, diwaliY - 2);
            }
            doc.autoTable({
                startY: diwaliY,
                head: [diwaliBonusTableColumn],
                body: diwaliBonusTableRows,
                tableWidth: 'wrap',
                styles: {
                    fontSize: 8,
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
                    0: { cellWidth: 12, halign: 'center', fillColor: [255, 255, 255] },
                    1: { cellWidth: 35, halign: 'left' },
                    2: { cellWidth: 20, halign: 'right' }
                },
                margin: { left: diwaliX, right: 0 },
                didDrawPage: function (data) {
                    if (data.pageNumber > 1) {
                        addHeaderToPage(data.pageNumber);
                    }
                }
            });
        }
        const fileName = `PS ${selectedWeek} - Daily Payment Statement ${formatDateOnly(selectedDate)}.pdf`;
        doc.save(fileName);
    };
    const generateWeekDataExcel = async () => {
        if (!weeks || weeks.length === 0) {
            alert("No weeks data available to export");
            return;
        }
        try {
            setLoading(true);
            const allDailyExpenses = [];
            const allRefundPayments = [];
            for (const week of weeks) {
                const start = new Date(week.start);
                const weekDays = [];
                for (let i = 0; i < 7; i++) {
                    const day = new Date(start);
                    day.setDate(start.getDate() + i);
                    weekDays.push(day);
                }
                for (const day of weekDays) {
                    const dateStr = day.toISOString().split("T")[0];
                    try {
                        const [dailyRes, refundRes] = await Promise.all([
                            axios.get(`https://backendaab.in/aabuildersDash/api/daily-payments/date/${dateStr}`),
                            axios.get(`https://backendaab.in/aabuildersDash/api/refund_received/date/${dateStr}`)
                        ]);
                        allDailyExpenses.push(...dailyRes.data);
                        allRefundPayments.push(...refundRes.data);
                    } catch (error) {
                        console.error(`Error fetching data for ${dateStr}:`, error);
                    }
                }
            }
            const workbook = XLSX.utils.book_new();
            const dailyExpensesHeaders = ['S.No', 'Date', 'Week Number', 'Name', 'Project Name', 'Amount', 'Extra Amount', 'Type', 'Quantity', 'Description', 'Created At'];
            const dailyExpensesRows = allDailyExpenses.map((row, idx) => {
                const name =
                    laboursList.find(opt => opt.id === Number(row.labour_id))?.label ||
                    vendorOptions.find(opt => opt.id === Number(row.vendor_id))?.label ||
                    contractorOptions.find(opt => opt.id === Number(row.contractor_id))?.label ||
                    employeeOptions.find(opt => opt.id === Number(row.employee_id))?.label ||
                    "";
                const projectName = siteOptions.find(opt => opt.id === Number(row.project_id))?.label || "";
                const rowDate = row.date ? new Date(row.date) : null;
                let weekNumber = "";
                if (rowDate) {
                    const matchingWeek = weeks.find(week => {
                        const weekStart = new Date(week.start);
                        const weekEnd = new Date(week.end);
                        return rowDate >= weekStart && rowDate <= weekEnd;
                    });
                    weekNumber = matchingWeek ? matchingWeek.number : "";
                }
                let createdAt = "";
                if (row.created_at) {
                    const createdDate = new Date(row.created_at);
                    createdAt = createdDate.toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                    });
                }
                return [
                    idx + 1,
                    row.date ? new Date(row.date).toLocaleDateString("en-GB") : "",
                    weekNumber,
                    name,
                    projectName,
                    Number(row.amount || 0),
                    Number(row.extra_amount || 0),
                    row.type || "",
                    row.quantity || "",
                    row.description || "",
                    createdAt
                ];
            });
            const dailyExpensesData = [dailyExpensesHeaders, ...dailyExpensesRows];
            const dailyExpensesWs = XLSX.utils.aoa_to_sheet(dailyExpensesData);
            dailyExpensesWs['!cols'] = [
                { wch: 8 },
                { wch: 12 },
                { wch: 12 },
                { wch: 25 },
                { wch: 25 },
                { wch: 15 },
                { wch: 15 },
                { wch: 20 },
                { wch: 10 },
                { wch: 40 },
                { wch: 20 }
            ];
            XLSX.utils.book_append_sheet(workbook, dailyExpensesWs, 'Daily Expenses');
            const refundPaymentsHeaders = ['S.No', 'Date', 'Week Number', 'Name', 'Amount', 'Created At'];
            const refundPaymentsRows = allRefundPayments.map((row, idx) => {
                const name =
                    laboursList.find(opt => opt.id === Number(row.labour_id))?.label ||
                    vendorOptions.find(opt => opt.id === Number(row.vendor_id))?.label ||
                    contractorOptions.find(opt => opt.id === Number(row.contractor_id))?.label ||
                    employeeOptions.find(opt => opt.id === Number(row.employee_id))?.label ||
                    "";
                const rowDate = row.date ? new Date(row.date) : null;
                let weekNumber = "";
                if (rowDate) {
                    const matchingWeek = weeks.find(week => {
                        const weekStart = new Date(week.start);
                        const weekEnd = new Date(week.end);
                        return rowDate >= weekStart && rowDate <= weekEnd;
                    });
                    weekNumber = matchingWeek ? matchingWeek.number : "";
                }
                let createdAt = "";
                if (row.created_at) {
                    const createdDate = new Date(row.created_at);
                    createdAt = createdDate.toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                    });
                }
                return [
                    idx + 1,
                    row.date ? new Date(row.date).toLocaleDateString("en-GB") : "",
                    weekNumber,
                    name,
                    Number(row.amount || 0),
                    createdAt
                ];
            });
            const refundPaymentsData = [refundPaymentsHeaders, ...refundPaymentsRows];
            const refundPaymentsWs = XLSX.utils.aoa_to_sheet(refundPaymentsData);
            refundPaymentsWs['!cols'] = [
                { wch: 8 },
                { wch: 12 },
                { wch: 12 },
                { wch: 25 },
                { wch: 15 },
                { wch: 20 }
            ];
            XLSX.utils.book_append_sheet(workbook, refundPaymentsWs, 'Refund Payments');
            const firstWeek = weeks[0];
            const lastWeek = weeks[weeks.length - 1];
            const startDate = new Date(firstWeek.start).toLocaleDateString("en-GB").replace(/\//g, "-");
            const endDate = new Date(lastWeek.end).toLocaleDateString("en-GB").replace(/\//g, "-");
            const fileName = `All_Weeks_Data_${startDate}_to_${endDate}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            setLoading(false);
            alert("Excel file generated successfully with all weeks data!");
        } catch (error) {
            console.error("Error generating Excel file:", error);
            setLoading(false);
            alert("Error generating Excel file. Please try again.");
        }
    };
    const handleDescriptionClick = (row) => {
        if (row.description) {
            setDescription(row.description);
            setEntryId(null);
            setShowPopups(true);
        } else {
            setEntryId(row.id);
            setDescription("");
            setShowPopups(true);
        }
    };
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
                laboursList.find(opt => opt.id === Number(currentFileRow.labour_id))?.label ||
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
            const payload = {
                date: currentFileRow.date,
                labour_id: Number(currentFileRow.labour_id) || null,
                vendor_id: Number(currentFileRow.vendor_id) || null,
                contractor_id: Number(currentFileRow.contractor_id) || null,
                employee_id: Number(currentFileRow.employee_id) || null,
                project_id: Number(currentFileRow.project_id),
                quantity: Number(currentFileRow.quantity) || 0,
                type: currentFileRow.type,
                amount: Number(currentFileRow.amount),
                extra_amount: Number(currentFileRow.extra_amount || 0),
                description: currentFileRow.description || "",
                file_url: pdfUrl
            };
            const response = await axios.put(
                `https://backendaab.in/aabuildersDash/api/daily-payments/edit/${currentFileRow.id}?username=${encodeURIComponent(username)}`,
                payload,
                { headers: { "Content-Type": "application/json" } }
            );
            setDailyExpenses((prev) =>
                prev.map((exp) => (exp.id === currentFileRow.id ? { ...exp, file_url: pdfUrl } : exp))
            );
            setFileUploadPopup(false);
            setCurrentFileRow(null);
            setSelectedFileForPopup(null);
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Error during file upload. Please try again.");
        }
    };
    const handleUpdate = async () => {
        if (!description.trim()) {
            alert("Please enter a description");
            return;
        }
        setLoading(true);
        try {
            const currentExpense = dailyExpenses.find(exp => exp.id === entryId);
            if (!currentExpense) {
                throw new Error("Expense not found");
            }
            const payload = {
                date: currentExpense.date,
                labour_id: Number(currentExpense.labour_id) || null,
                vendor_id: Number(currentExpense.vendor_id) || null,
                contractor_id: Number(currentExpense.contractor_id) || null,
                employee_id: Number(currentExpense.employee_id) || null,
                project_id: Number(currentExpense.project_id),
                quantity: Number(currentExpense.quantity) || 0,
                type: currentExpense.type,
                amount: Number(currentExpense.amount),
                extra_amount: Number(currentExpense.extra_amount || 0),
                description: description.trim(),
                file_url: currentExpense.file_url || null,
            };
            await axios.put(
                `https://backendaab.in/aabuildersDash/api/daily-payments/edits/${entryId}?username=${encodeURIComponent(username)}`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            alert("Description updated successfully!");
            setDailyExpenses(prev =>
                prev.map(exp =>
                    exp.id === entryId
                        ? { ...exp, description: description.trim() }
                        : exp
                )
            );
            setShowPopups(false);
            setEntryId(null);
            setDescription("");
        } catch (err) {
            console.error(err);
            alert("Failed to update description. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    const handleEditClick = (row) => {
        setEditingDailyExpenseRowId(row.id);
        setEditDailyExpenseData({
            date: row.date,
            labour_id: row.labour_id || "",
            vendor_id: row.vendor_id || "",
            contractor_id: row.contractor_id || "",
            employee_id: row.employee_id || "",
            project_id: row.project_id || "",
            quantity: row.quantity || "",
            type: row.type || "",
            amount: row.amount || "",
            extra_amount: row.extra_amount || "",
            description: row.description || "",
            file_url: row.file_url || ""
        });
    };
    const saveEditedExpense = async (row) => {
        try {
            const payload = {
                date: editDailyExpenseData.date,
                labour_id: Number(editDailyExpenseData.labour_id) || null,
                vendor_id: Number(editDailyExpenseData.vendor_id) || null,
                contractor_id: Number(editDailyExpenseData.contractor_id) || null,
                employee_id: Number(editDailyExpenseData.employee_id) || null,
                project_id: Number(editDailyExpenseData.project_id),
                quantity: Number(editDailyExpenseData.quantity) || 0,
                type: editDailyExpenseData.type,
                amount: Number(editDailyExpenseData.amount),
                extra_amount: Number(editDailyExpenseData.extra_amount || 0),
                description: editDailyExpenseData.description || "",
                file_url: editDailyExpenseData.file_url || null,
            };
            const response = await axios.put(
                `https://backendaab.in/aabuildersDash/api/daily-payments/edit/${row.id}?username=${encodeURIComponent(username)}`,
                payload,
                { headers: { "Content-Type": "application/json" } }
            );
            setDailyExpenses((prev) =>
                prev.map((exp) => (exp.id === row.id ? { ...exp, ...payload } : exp))
            );
            setEditingDailyExpenseRowId(null);
        } catch (error) {
            console.error("Error updating expense:", error);
            alert("Error updating expense. Please try again.");
        }
    };
    const handleEditRefundClick = (row) => {
        setEditingPaymentId(row.id);
        setEditRefundPaymentData({
            labour_id: row.labour_id || "",
            vendor_id: row.vendor_id || "",
            contractor_id: row.contractor_id || "",
            employee_id: row.employee_id || "",
            amount: row.amount || "",
        });
    };
    const handleEditRefundChange = (e) => {
        const { name, value } = e.target;
        setEditRefundPaymentData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleEditRefundLabourChange = (selected) => {
        setEditRefundPaymentData((prev) => ({
            ...prev,
            labour_id: selected && selected.type === "Labour" ? selected.id : "",
            vendor_id: selected && selected.type === "Vendor" ? selected.id : "",
            contractor_id: selected && selected.type === "Contractor" ? selected.id : "",
            employee_id: selected && selected.type === "Employee" ? selected.id : "",
        }));
    };
    const saveEditedRefundPayment = async (id) => {
        try {
            const payload = {
                labour_id: editRefundPaymentData.labour_id ? Number(editRefundPaymentData.labour_id) : null,
                vendor_id: editRefundPaymentData.vendor_id ? Number(editRefundPaymentData.vendor_id) : null,
                contractor_id: editRefundPaymentData.contractor_id ? Number(editRefundPaymentData.contractor_id) : null,
                employee_id: editRefundPaymentData.employee_id ? Number(editRefundPaymentData.employee_id) : null,
                amount: Number(editRefundPaymentData.amount),
            };
            await axios.put(
                `https://backendaab.in/aabuildersDash/api/refund_received/edit/${id}?username=${encodeURIComponent(username)}`,
                payload
            );
            setRefundPayments((prev) =>
                prev.map((row) =>
                    row.id === id ? { ...row, ...payload } : row
                )
            );
            setEditingPaymentId(null);
        } catch (error) {
            console.error("Error updating refund payment:", error);
            alert("Error updating refund payment. Please try again.");
        }
    };
    const handleDailyExpensesDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete This Daily Expense Data?");
        if (confirmed) {
            try {
                await axios.delete(
                    `https://backendaab.in/aabuildersDash/api/daily-payments/delete/${id}?username=${encodeURIComponent(username)}`,
                    { headers: { "Content-Type": "application/json" } }
                );
                setDailyExpenses((prev) => prev.filter((expense) => expense.id !== id));
            } catch (error) {
                console.error("Error deleting daily expense:", error);
                alert("Error deleting daily expense. Please try again.");
            }
        } else {
            console.log("Deletion cancelled.");
        }
    };
    const handleRefundPaymentsDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete This Refund Received Data?");
        if (confirmed) {
            try {
                await axios.delete(
                    `https://backendaab.in/aabuildersDash/api/refund_received/delete/${id}?username=${encodeURIComponent(username)}`,
                    { headers: { "Content-Type": "application/json" } }
                );
                setRefundPayments((prev) => prev.filter((refund) => refund.id !== id));
            } catch (error) {
                console.error("Error deleting refund payment:", error);
                alert("Error deleting refund payment. Please try again.");
            }
        } else {
            console.log("Deletion cancelled.");
        }
    };
    const fetchAuditDetailsForDailyExpense = async (expensesId) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/daily_entry_audit/daily_expense/${expensesId}`);
            const data = await response.json();
            setWeeklyPaymentExpensesAudits(data);
            setShowWeeklyPaymentExpensesModal(true);
        } catch (error) {
            console.error("Error fetching audit details:", error);
        }
    };
    const fetchAuditDetailsForRefundPaymentReceived = async (receivedId) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/daily_entry_audit/refund/${receivedId}`);
            const data = await response.json();
            setWeeklyPaymentReceivedAudits(data);
            setShowWeeklyPaymentReceivedModal(true);
        } catch (error) {
            console.error("Error fetching audit details:", error);
        }
    };
    const handleSendToExpensesEntry = async () => {
        try {
            let allDailyPayments = [];
            try {
                const allDailyPaymentsResponse = await axios.get(
                    "https://backendaab.in/aabuildersDash/api/daily-payments/getAll"
                );
                allDailyPayments = allDailyPaymentsResponse.data || [];
            } catch (error) {
                console.warn("getAll endpoint not available, using current date's expenses:", error);
                allDailyPayments = dailyExpenses;
            }
            const getISOWeekNumber = (date) => {
                const d = new Date(date);
                d.setHours(0, 0, 0, 0);                
                // Get Thursday of the week containing the date
                const dayOfWeek = d.getDay() || 7; // Convert Sunday (0) to 7
                const thursday = new Date(d);
                thursday.setDate(d.getDate() + 4 - dayOfWeek); // Thursday is 4 days after Monday
                thursday.setHours(0, 0, 0, 0);                
                // Use the year that Thursday falls in (ISO 8601 rule)
                const weekYear = thursday.getFullYear();                
                // Get January 1st of that year
                const jan1 = new Date(weekYear, 0, 1);
                jan1.setHours(0, 0, 0, 0);                
                // Get the Thursday of week 1 (first Thursday of the year)
                const jan1DayOfWeek = jan1.getDay() || 7;
                const firstThursday = new Date(jan1);
                firstThursday.setDate(jan1.getDate() + 4 - jan1DayOfWeek);
                firstThursday.setHours(0, 0, 0, 0);                
                // Calculate week number: difference in days divided by 7, plus 1
                const daysDiff = Math.floor((thursday - firstThursday) / 86400000);
                const weekNo = Math.floor(daysDiff / 7) + 1;                
                return weekNo;
            };            
            const getCurrentWeekNumber = () => {
                return getISOWeekNumber(new Date());
            };
            const actualCurrentWeekNumber = getCurrentWeekNumber();
            const currentYear = new Date().getFullYear();
            const actualCurrentWeek = getStartAndEndDateOfWeek(actualCurrentWeekNumber, currentYear);
            const lastWeekNumber = weeks.length > 0 ? Math.max(...weeks.map(w => w.number)) : null;
            const lastWeek = weeks.find(w => w.number === lastWeekNumber);
            allDailyPayments = allDailyPayments.filter(expense => {
                if (!expense.date) return true;
                const expenseDate = new Date(expense.date);
                expenseDate.setHours(0, 0, 0, 0);
                const currentWeekStart = new Date(actualCurrentWeek.start);
                currentWeekStart.setHours(0, 0, 0, 0);
                const currentWeekEnd = new Date(actualCurrentWeek.end);
                currentWeekEnd.setHours(23, 59, 59, 999);
                if (expenseDate >= currentWeekStart && expenseDate <= currentWeekEnd) {
                    return false;
                }
                if (lastWeek) {
                    const lastWeekStart = new Date(lastWeek.start);
                    lastWeekStart.setHours(0, 0, 0, 0);
                    const lastWeekEnd = new Date(lastWeek.end);
                    lastWeekEnd.setHours(23, 59, 59, 999);
                    if (expenseDate >= lastWeekStart && expenseDate <= lastWeekEnd) {
                        return false;
                    }
                }
                return true;
            });
            let expensesToSend = allDailyPayments.filter(expense =>
                expense.send_to_expenses_entry === false || expense.send_to_expenses_entry === undefined || expense.send_to_expenses_entry === null
            );
            const originalExpenseCount = expensesToSend.length;
            const companyLabourContractor = contractorOptions.find(opt => opt.label === "Company Labour");
            expensesToSend = expensesToSend.filter(expense => expense.type !== "Staff Advance");
            const wageExpenseGroups = new Map();
            const diwaliBonusExpenseGroups = new Map();
            const otherExpenses = [];
            expensesToSend.forEach(expense => {
                if (expense.type === "Wage" && expense.labour_id && expense.project_id && expense.date) {
                    const key = `${expense.date}_${expense.project_id}_Wage`;
                    if (!wageExpenseGroups.has(key)) {
                        wageExpenseGroups.set(key, []);
                    }
                    wageExpenseGroups.get(key).push(expense);
                }
                else if (expense.type === "Diwali Bonus" && expense.labour_id && expense.project_id && expense.date) {
                    const key = `${expense.date}_${expense.project_id}_DiwaliBonus`;
                    if (!diwaliBonusExpenseGroups.has(key)) {
                        diwaliBonusExpenseGroups.set(key, []);
                    }
                    diwaliBonusExpenseGroups.get(key).push(expense);
                }
                else {
                    otherExpenses.push(expense);
                }
            });
            const processedExpenses = [];
            wageExpenseGroups.forEach((group, key) => {
                if (group.length > 0) {
                    const firstExpense = group[0];
                    const totalAmount = group.reduce((sum, exp) =>
                        sum + Number(exp.amount || 0) + Number(exp.extra_amount || 0), 0
                    );
                    const entryCount = group.length;
                    const combinedWageExpense = {
                        ...firstExpense,
                        amount: totalAmount,
                        extra_amount: 0,
                        quantity: entryCount,
                        labour_id: null,
                        contractor_id: companyLabourContractor?.id || null,
                        type: "Wage",
                        _originalExpenses: group
                    };
                    processedExpenses.push(combinedWageExpense);
                }
            });
            diwaliBonusExpenseGroups.forEach((group, key) => {
                if (group.length > 0) {
                    const firstExpense = group[0];
                    const totalAmount = group.reduce((sum, exp) =>
                        sum + Number(exp.amount || 0) + Number(exp.extra_amount || 0), 0
                    );
                    const entryCount = group.length;
                    const combinedDiwaliBonusExpense = {
                        ...firstExpense,
                        amount: totalAmount,
                        extra_amount: 0,
                        quantity: entryCount,
                        labour_id: null,
                        contractor_id: companyLabourContractor?.id || null,
                        type: "Diwali Bonus",
                        _originalExpenses: group
                    };
                    processedExpenses.push(combinedDiwaliBonusExpense);
                }
            });
            const expenseGroups = new Map();
            otherExpenses.forEach(expense => {
                if (expense.labour_id) {
                    const key = `${expense.date}_${expense.project_id}_${expense.labour_id}`;
                    if (!expenseGroups.has(key)) {
                        expenseGroups.set(key, []);
                    }
                    expenseGroups.get(key).push(expense);
                } else {
                    processedExpenses.push(expense);
                }
            });
            expenseGroups.forEach((group, key) => {
                if (group.length > 1) {
                    const firstExpense = group[0];
                    const totalAmount = group.reduce((sum, exp) =>
                        sum + Number(exp.amount || 0) + Number(exp.extra_amount || 0), 0
                    );
                    const entryCount = group.length;
                    const combinedExpense = {
                        ...firstExpense,
                        amount: totalAmount,
                        extra_amount: 0,
                        quantity: entryCount,
                        labour_id: null,
                        contractor_id: companyLabourContractor?.id || null,
                        _originalExpenses: group
                    };
                    processedExpenses.push(combinedExpense);
                } else {
                    processedExpenses.push(group[0]);
                }
            });
            expensesToSend = processedExpenses;
            if (expensesToSend.length === 0) {
                alert("No expenses to send. All expenses have already been sent to Expenses Entry, or all remaining expenses are from the current or previous week.");
                return;
            }
            const combinedCount = expensesToSend.filter(exp => exp._originalExpenses && exp._originalExpenses.length > 0).length;
            const combinedMessage = combinedCount > 0
                ? `\n\nNote: ${combinedCount} group(s) of expenses with same labour, project, and date will be combined into single entries with "Company Labour" as contractor.`
                : "";
            const confirmed = window.confirm(
                `Are you sure you want to send ${expensesToSend.length} expense entry/entries (from ${originalExpenseCount} original expense(s)) to Expenses Entry?\n\nNote: Expenses from the actual current week (Week ${actualCurrentWeekNumber}) and last week (Week ${lastWeekNumber}) will be excluded.${combinedMessage}`
            );
            if (!confirmed) {
                return;
            }
            setSendingToExpensesEntry(true);
            setSendingProgress({ current: 0, total: expensesToSend.length });
            let currentEno = null;
            try {
                const enoResponse = await fetch('https://backendaab.in/aabuilderDash/expenses_form/get_form');
                if (enoResponse.ok) {
                    const enoData = await enoResponse.json();
                    if (enoData.length > 0) {
                        const sortedData = enoData.sort((a, b) => b.eno - a.eno);
                        const lastEno = sortedData[0].eno;
                        currentEno = lastEno + 1;
                    } else {
                        currentEno = 54173;
                    }
                } else {
                    console.warn("Failed to fetch ENO, using default");
                    currentEno = 54173;
                }
            } catch (error) {
                console.error('Error fetching latest ENo:', error);
                currentEno = 54173;
            }
            let successCount = 0;
            let errorCount = 0;
            const successfullySentExpenses = [];
            for (let i = 0; i < expensesToSend.length; i++) {
                const expense = expensesToSend[i];
                try {
                    setSendingProgress({ current: i + 1, total: expensesToSend.length });
                    const project = siteOptions.find(opt => opt.id === Number(expense.project_id));
                    const siteName = project?.label || "";
                    const employee = employeeOptions.find(opt => opt.id === Number(expense.employee_id));
                    const vendor = vendorOptions.find(opt => opt.id === Number(expense.vendor_id));
                    const contractor = contractorOptions.find(opt => opt.id === Number(expense.contractor_id));
                    const labour = laboursList.find(opt => opt.id === Number(expense.labour_id));
                    const vendorName = vendor?.label || "";
                    const contractorName = contractor?.label || "";
                    const employeeName = employee?.label || "";
                    const labourName = labour?.label || "";
                    const finalContractorName = expense.contractor_id && contractorOptions.find(opt => opt.id === Number(expense.contractor_id))?.label === "Company Labour"
                        ? "Company Labour"
                        : contractorName;
                    const expensesPayload = {
                        accountType: "Daily Wage",
                        eno: currentEno,
                        date: expense.date,
                        siteName: siteName,
                        projectId: Number(expense.project_id) || null,
                        vendor: vendorName,
                        vendorId: Number(expense.vendor_id) || null,
                        contractor: finalContractorName,
                        contractorId: Number(expense.contractor_id) || null,
                        employeeId: Number(expense.employee_id) || null,
                        labourId: Number(expense.labour_id) || null, // Will be null for combined expenses
                        quantity: expense.quantity || "",
                        amount: Number(expense.amount || 0) + Number(expense.extra_amount || 0),
                        category: expense.type || "",
                        comments: expense.description || "",
                        machineTools: "",
                        billCopyUrl: expense.file_url || "",
                        source: "Cash Register",
                        paymentMode: "Cash"
                    };
                    const expensesResponse = await fetch(
                        "https://backendaab.in/aabuilderDash/expenses_form/save",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(expensesPayload),
                        }
                    );
                    if (!expensesResponse.ok) {
                        const errorText = await expensesResponse.text();
                        console.error(`Failed to save expense ${expense.id}:`, errorText);
                        errorCount++;
                    } else {
                        successCount++;
                        if (expense._originalExpenses && expense._originalExpenses.length > 0) {
                            successfullySentExpenses.push(...expense._originalExpenses);
                        } else {
                            successfullySentExpenses.push(expense);
                        }
                        currentEno = currentEno + 1;
                    }
                } catch (error) {
                    console.error(`Error sending expense ${expense.id} to Expenses Entry:`, error);
                    errorCount++;
                }
            }
            if (successCount > 0) {
                try {
                    let markedCount = 0;
                    for (const expense of successfullySentExpenses) {
                        try {
                            const markResponse = await axios.put(
                                `https://backendaab.in/aabuildersDash/api/daily-payments/send-to-expenses/${expense.id}`
                            );
                            if (markResponse.status === 200) {
                                markedCount++;
                            }
                        } catch (error) {
                            console.error(`Error marking expense ${expense.id} as sent:`, error);
                        }
                    }
                    if (markedCount < successfullySentExpenses.length) {
                        console.warn(`Only ${markedCount} out of ${successfullySentExpenses.length} expenses were marked as sent.`);
                    }
                    alert(
                        `Successfully sent ${successCount} expense(s) to Expenses Entry.` +
                        (errorCount > 0 ? ` ${errorCount} expense(s) failed.` : "")
                    );
                    if (selectedDate) {
                        await handleDateClick(selectedDate);
                    }
                } catch (error) {
                    console.error("Error marking expenses as sent:", error);
                    alert(
                        `Expenses sent to Expenses Entry, but failed to mark as sent. ` +
                        `Please contact support. Success: ${successCount}, Failed: ${errorCount}`
                    );
                }
            } else {
                alert(`Failed to send expenses to Expenses Entry. ${errorCount} error(s) occurred.`);
            }
        } catch (error) {
            console.error("Error in handleSendToExpensesEntry:", error);
            alert("An error occurred while sending expenses to Expenses Entry. Please try again.");
        } finally {
            setSendingToExpensesEntry(false);
            setSendingProgress({ current: 0, total: 0 });
        }
    };
    return (
        <body>
            <h1 className="font-bold text-xl flex justify-end mr-5 -mt-7">
                Balance:<span style={{ color: "#E4572E" }}>{Number(balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2, })}</span>
            </h1>
            <div className='mx-auto flex justify-between w-auto p-4 pl-8 border-collapse text-left bg-[#FFFFFF] ml-[30px] mr-6 rounded-md lg:h-[147px]'>
                <div className='flex gap-4'>
                    <div className='flex gap-4 mb-4'>
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
                        <div className='block'>
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
                                            <button onClick={() => handleDateClick(dateStr)}
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
                    <button
                        onClick={generateWeekDataExcel}
                        className='font-semibold mt-4 mr-5 hover:text-[#E4572E]'
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : 'Export Excel'}
                    </button>
                    <button
                        onClick={handleSendToExpensesEntry}
                        className={`font-semibold mt-4 mr-5 hover:text-[#E4572E] ${sendingToExpensesEntry ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={sendingToExpensesEntry}
                    >
                        {sendingToExpensesEntry ? 'Sending...' : 'Send To Expenses Entry'}
                    </button>
                </div>
            </div>
            <div className="mt-4 flex justify-end mr-6">
                <h1 className="font-bold text-xl">
                    Net Amount: <span style={{ color: "#E4572E" }}>
                        {Number(netAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </h1>
            </div>
            <div className="mx-auto w-auto p-6 border-collapse bg-[#FFFFFF] ml-[30px] mr-6 rounded-md">
                <div className="w-full mt- flex flex-col xl:flex-row gap-6">
                    <div className="flex-[2] min-w-0">
                        <div className="flex justify-between mb-4">
                            <h1 className="font-bold text-xl">
                                PS: <span style={{ color: "#E4572E" }}>{selectedWeek}</span>
                            </h1>
                            <h1 className="font-bold text-base mr-16">
                                Expenses:<span style={{ color: "#E4572E" }}>{Number(filteredExpenses.reduce((total, expense) => total + Number(expense.amount || 0), 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2, })}</span>
                            </h1>
                        </div>
                        <div className="text-left mb-4">
                            <button onClick={() => setShowFilters(!showFilters)}>
                                <img
                                    src={Filter}
                                    alt="Toggle Filter"
                                    className="w-7 h-7 border border-[#BF9853] rounded-md"
                                />
                            </button>
                        </div>
                        <div className="w-full h-[590px] rounded-lg border-l-8 border-l-[#BF9853] overflow-hidden ">
                            <div ref={scrollRef} className="overflow-auto max-h-[600px] thin-scrollbar" onMouseDown={(e) => handleMouseDown(e, scrollRef)} onMouseMove={(e) => handleMouseMove(e, scrollRef)}
                                onMouseUp={() => handleMouseUp(scrollRef)} onMouseLeave={() => handleMouseUp(scrollRef)} >
                                <table className="w-[1200px] border-collapse text-left">
                                    <thead className="sticky top-0 z-10 bg-white">
                                        <tr className="bg-[#FAF6ED] h-12">
                                            <th className="py-2 px-1 text-left w-[60px]">S.No</th>
                                            <th className="py-2 px-1 text-left w-[140px] cursor-pointer hover:bg-gray-200" onClick={() => handleSort('labour_name')}>
                                                Name {sortConfig.key === 'labour_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="py-2 px-1 text-left w-[170px] cursor-pointer hover:bg-gray-200" onClick={() => handleSort('project_name')}>
                                                Project Name {sortConfig.key === 'project_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="py-2 px-1 text-left w-[120px] cursor-pointer hover:bg-gray-200" onClick={() => handleSort('amount')}>
                                                Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="py-2 px-1 text-left w-[120px] cursor-pointer hover:bg-gray-200" onClick={() => handleSort('type')}>
                                                Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="py-2 px-1 text-left w-[60px]">Qty</th>
                                            <th className="py-2 px-1 text-left w-[80px]">Activity</th>
                                        </tr>
                                        {showFilters && (
                                            <tr className="bg-white border-b border-gray-200">
                                                <th className="pt-2 pb-2 w-[60px]"></th>
                                                <th className="pt-2 pb-2 w-[120px] sm:w-[140px]">
                                                    <Select
                                                        options={contractorVendorFilterOptions}
                                                        value={selectContractororVendorName ? { value: selectContractororVendorName, label: selectContractororVendorName } : null}
                                                        onChange={(opt) => setSelectContractororVendorName(opt ? opt.value : "")}
                                                        className="text-xs focus:outline-none"
                                                        placeholder="Name..."
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
                                                <th className="pt-2 pb-2 w-[160px] sm:w-[170px]">
                                                    <Select
                                                        options={projectFilterOptions}
                                                        value={selectProjectName ? { value: selectProjectName, label: selectProjectName } : null}
                                                        onChange={(opt) => setSelectProjectName(opt ? opt.value : "")}
                                                        className="focus:outline-none text-xs"
                                                        placeholder="Project..."
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
                                                <th className="pt-2 pb-2 w-[100px] sm:w-[120px]"></th>
                                                <th className="pt-2 pb-2 w-[100px] sm:w-[120px]">
                                                    <Select
                                                        options={typeFilterOptions}
                                                        value={selectType ? { value: selectType, label: selectType } : null}
                                                        onChange={(opt) => setSelectType(opt ? opt.value : "")}
                                                        className="focus:outline-none text-xs"
                                                        placeholder="Type..."
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
                                                                zIndex: 10,
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
                                                <th className="pt-2 pb-2 w-[50px] sm:w-[60px]"></th>
                                                <th className="pt-2 pb-2 w-[70px] sm:w-[80px]">
                                                    <button
                                                        onClick={clearFilters}
                                                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 focus:outline-none"
                                                    >
                                                        Clear
                                                    </button>
                                                </th>
                                            </tr>
                                        )}
                                        {Number(selectedWeek) === Number(lastWeekNumber) && (
                                            <tr className="bg-white border-b border-gray-200">
                                                <td className="px-1 py-2 font-bold">{sortedDailyExpenses.filter(row => row.date === selectedDate).length + 1}.</td>
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
                                                                        amount: type === "Labour" ? salary : ""
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
                                                            <img src={Change} className={`w-4 h-4 ${isChangeButtonActive ? 'opacity-10' : ''}`} />
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
                                                <td className="px-1 py-2">
                                                </td>
                                            </tr>
                                        )}
                                    </thead>
                                    <tbody>
                                        {sortedDailyExpenses
                                            .filter(row => row.date === selectedDate)
                                            .map((row, index) => (
                                                <tr key={row.id} className="even:bg-[#FAF6ED] odd:bg-[#FFFFFF] text-left">
                                                    <td className="px-1 py-2 font-bold">{index + 1}</td>
                                                    <td className="px-1 py-2">
                                                        <div className="w-[200px] h-[40px] flex items-center">
                                                            {editingDailyExpenseRowId === row.id && Number(selectedWeek) === Number(lastWeekNumber) ? (
                                                                <Select
                                                                    name="labour_id"
                                                                    className="w-[200px]"
                                                                    placeholder={isChangeButtonActive ? "Vendor/Contractor" : "Labour Name"}
                                                                    isSearchable
                                                                    isClearable
                                                                    options={isChangeButtonActive ? combinedOptions : laboursList}
                                                                    styles={customStyles}
                                                                    menuPortalTarget={document.body}
                                                                    value={
                                                                        isChangeButtonActive
                                                                            ? combinedOptions.find(opt =>
                                                                                (opt.type === "Employee" && opt.id === Number(editDailyExpenseData.employee_id)) ||
                                                                                (opt.type === "Vendor" && opt.id === Number(editDailyExpenseData.vendor_id)) ||
                                                                                (opt.type === "Contractor" && opt.id === Number(editDailyExpenseData.contractor_id))
                                                                            ) || null
                                                                            : laboursList.find(opt => opt.id === Number(editDailyExpenseData.labour_id)) || null
                                                                    }
                                                                    onChange={(selectedOption) => {
                                                                        if (selectedOption) {
                                                                            const { type, id, label, salary } = selectedOption;
                                                                            setEditDailyExpenseData(prev => ({
                                                                                ...prev,
                                                                                labour_id: type === "Labour" ? id : "",
                                                                                vendor_id: type === "Vendor" ? id : "",
                                                                                contractor_id: type === "Contractor" ? id : "",
                                                                                employee_id: type === "Employee" ? id : "",
                                                                                labour_name: label,
                                                                                amount: type === "Labour" ? salary : prev.amount
                                                                            }));
                                                                        } else {
                                                                            setEditDailyExpenseData(prev => ({
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
                                                            ) : (
                                                                (() => {
                                                                    const employee = employeeOptions.find(opt => opt.id === Number(row.employee_id));
                                                                    const vendor = vendorOptions.find(opt => opt.id === Number(row.vendor_id));
                                                                    const contractor = contractorOptions.find(opt => opt.id === Number(row.contractor_id));
                                                                    const labour = laboursList.find(opt => opt.id === Number(row.labour_id));
                                                                    return employee?.label || vendor?.label || contractor?.label || labour?.label || "";
                                                                })()
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-1 py-2">
                                                        <div className="w-[220px] h-[40px] flex items-center">
                                                            {editingDailyExpenseRowId === row.id && Number(selectedWeek) === Number(lastWeekNumber) ? (
                                                                <Select
                                                                    name="project"
                                                                    value={siteOptions.find(opt => opt.id === Number(editDailyExpenseData.project_id)) || null}
                                                                    onChange={(selectedOption) => {
                                                                        setEditDailyExpenseData(prev => ({
                                                                            ...prev,
                                                                            project_id: selectedOption ? selectedOption.id : ""
                                                                        }));
                                                                    }}
                                                                    options={siteOptions}
                                                                    menuPortalTarget={document.body}
                                                                    className="w-[220px]"
                                                                    placeholder="Select Site"
                                                                    isSearchable
                                                                    isClearable
                                                                    styles={customStyles}
                                                                />
                                                            ) : (
                                                                siteOptions.find(opt => opt.id === Number(row.project_id))?.label || ""
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-1 py-2 relative group flex">
                                                        <div className="flex items-center">
                                                            {editingDailyExpenseRowId === row.id && Number(selectedWeek) === Number(lastWeekNumber) ? (
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="number"
                                                                        name="amount"
                                                                        className="border-2 border-[#BF9853] border-opacity-25 p-1 w-[90px] h-[40px] rounded-lg focus:outline-none no-spinner"
                                                                        value={editDailyExpenseData.amount || ""}
                                                                        onChange={(e) => setEditDailyExpenseData(prev => ({ ...prev, amount: e.target.value }))}
                                                                    />
                                                                    <input
                                                                        type="number"
                                                                        name="extra_amount"
                                                                        className="border-2 border-[#BF9853] border-opacity-25 p-1 w-[90px] h-[40px] rounded-lg focus:outline-none no-spinner"
                                                                        placeholder="Extra"
                                                                        value={editDailyExpenseData.extra_amount || ""}
                                                                        onChange={(e) => setEditDailyExpenseData(prev => ({ ...prev, extra_amount: e.target.value }))}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="w-[120px] h-[40px] flex flex-col justify-center leading-tight cursor-default">
                                                                        <span>
                                                                            {Number((row.amount || 0) + (row.extra_amount || 0)).toLocaleString("en-IN")}
                                                                        </span>
                                                                        <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-black text-white text-xs rounded p-2 z-50 shadow-lg whitespace-nowrap">
                                                                            Amount: {Number(row.amount || 0).toLocaleString('en-IN')} <br />
                                                                            Extra Amount: {Number(row.extra_amount || 0).toLocaleString('en-IN')}
                                                                        </div>
                                                                    </div>
                                                                    <div className="w-[80px] h-[40px] flex items-center gap-2">
                                                                        <div className="flex items-center gap-1">
                                                                            {row.description ? (
                                                                                <div className="flex items-center justify-center w-full">
                                                                                    <img
                                                                                        src={NotesEnd}
                                                                                        alt="View Description"
                                                                                        className="w-4 h-4 cursor-pointer opacity-60 hover:opacity-100 flex-shrink-0"
                                                                                        onClick={() => handleDescriptionClick(row)}
                                                                                    />
                                                                                </div>
                                                                            ) : (
                                                                                <div className="flex items-center justify-center w-full">
                                                                                    <img
                                                                                        src={NotesStart}
                                                                                        alt="Add Description"
                                                                                        className="w-4 h-4 cursor-pointer opacity-60 hover:opacity-100"
                                                                                        onClick={() => handleDescriptionClick(row)}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="ml-3 flex items-center gap-1">
                                                                            {row.file_url ? (
                                                                                <a
                                                                                    href={row.file_url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="cursor-pointer"
                                                                                    title="View File"
                                                                                >
                                                                                    <img src={file} className="w-4 h-4" alt="Open File" />
                                                                                </a>
                                                                            ) : (
                                                                                <button
                                                                                    onClick={() => handleFileUploadClick(row)}
                                                                                    className="cursor-pointer"
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
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-1 py-2">
                                                        <div className="w-[120px] h-[40px] flex items-center">
                                                            {editingDailyExpenseRowId === row.id && Number(selectedWeek) === Number(lastWeekNumber) ? (
                                                                <select
                                                                    name="type"
                                                                    value={editDailyExpenseData.type}
                                                                    onChange={(e) => setEditDailyExpenseData(prev => ({ ...prev, type: e.target.value }))}
                                                                    className="border-2 border-[#BF9853] border-opacity-25 p-1 w-[120px] h-[40px] rounded-lg focus:outline-none"
                                                                >
                                                                    <option value="">Select</option>
                                                                    {(isChangeButtonActive ? expensesCategory : weeklyTypes).map((type, index) => (
                                                                        <option key={index} value={isChangeButtonActive ? type.category : type.type}>
                                                                            {isChangeButtonActive ? type.category : type.type}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                row.type
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-1 py-2">
                                                        <div className="w-[60px] h-[40px] flex items-center">
                                                            {editingDailyExpenseRowId === row.id && Number(selectedWeek) === Number(lastWeekNumber) ? (
                                                                <input
                                                                    type="number"
                                                                    name="quantity"
                                                                    className="border-2 border-[#BF9853] border-opacity-25 p-1 w-[60px] h-[40px] rounded-lg focus:outline-none no-spinner"
                                                                    value={editDailyExpenseData.quantity || ""}
                                                                    onChange={(e) => setEditDailyExpenseData(prev => ({ ...prev, quantity: e.target.value }))}
                                                                />
                                                            ) : (
                                                                row.quantity || "-"
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-1 py-2 relative">
                                                        {Number(selectedWeek) === Number(lastWeekNumber) && (
                                                            <div className="flex gap-2 w-[80px]">
                                                                {canEditDelete && (
                                                                    <>
                                                                        {editingDailyExpenseRowId === row.id ? (
                                                                            <button className="text-green-600 font-bold text-lg relative z-10" onClick={() => saveEditedExpense(row)}>
                                                                                ✓
                                                                            </button>
                                                                        ) : (
                                                                            <button onClick={() => handleEditClick(row)}>
                                                                                <img className="w-5 h-4" src={Edit} alt="Edit" />
                                                                            </button>
                                                                        )}
                                                                        <button onClick={() => handleDailyExpensesDelete(row.id)}>
                                                                            <img src={Delete} className="w-5 h-4" alt="Delete" />
                                                                        </button>
                                                                    </>
                                                                )}
                                                                <button onClick={() => fetchAuditDetailsForDailyExpense(row.id)}>
                                                                    <img src={history} className="w-5 h-4" alt="History" />
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
                    <div className="flex-[1] min-w-0 ">
                        <div className="flex justify-between mb-4">
                            <h1 className="font-bold text-base">Refund Received</h1>
                            <h1 className="font-bold text-base">
                                Total: <span style={{ color: "#E4572E" }}>{Number(totalRefund).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2, })}</span>
                            </h1>
                        </div>
                        <div>
                            <div className="w-full rounded-lg border-l-8 border-l-[#BF9853] overflow-x-auto" style={{ maxHeight: "600px" }}>
                                <table className="w-full min-w-[320px] border-collapse">
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
                                                    {editingPaymentId === row.id && Number(selectedWeek) === Number(lastWeekNumber) ? (
                                                        <Select
                                                            name="refund_party"
                                                            className="w-[200px]"
                                                            placeholder="Select Name"
                                                            isSearchable
                                                            isClearable
                                                            value={
                                                                refundSelectOptions.find(opt =>
                                                                    (opt.type === "Labour" && String(opt.id) === String(editRefundPaymentData.labour_id)) ||
                                                                    (opt.type === "Vendor" && String(opt.id) === String(editRefundPaymentData.vendor_id)) ||
                                                                    (opt.type === "Contractor" && String(opt.id) === String(editRefundPaymentData.contractor_id)) ||
                                                                    (opt.type === "Employee" && String(opt.id) === String(editRefundPaymentData.employee_id))
                                                                ) || null
                                                            }
                                                            onChange={handleEditRefundLabourChange}
                                                            options={refundSelectOptions}
                                                            menuPortalTarget={document.body}
                                                            styles={customStyles}
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-between w-full gap-2">
                                                            <div className="truncate pr-2">
                                                                {(() => {
                                                                    const employee = getEmployeeName(row.employee_id);
                                                                    const vendor = getVendorName(row.vendor_id);
                                                                    const contractor = getContractorName(row.contractor_id);
                                                                    const labour = laboursList.find(opt => String(opt.id) === String(row.labour_id))?.label || "";
                                                                    const labels = [employee, vendor, contractor, labour].filter(Boolean);
                                                                    return labels.join(", ") || "";
                                                                })()}
                                                            </div>
                                                            {(() => {
                                                                const hasLabourId = row.labour_id && Number(row.labour_id) > 0;
                                                                const hasVendorOrContractorId = (row.vendor_id && Number(row.vendor_id) > 0) ||
                                                                    (row.contractor_id && Number(row.contractor_id) > 0);
                                                                if (!hasLabourId && !hasVendorOrContractorId) return null;
                                                                return (
                                                                    <div className="bg-[#E3F2FD] text-[#1565C0] font-semibold px-3 py-[2px] text-xs rounded-full whitespace-nowrap">
                                                                        {hasLabourId ? 'Staff Portal' : 'Loan Portal'}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-2 text-center">
                                                    {editingPaymentId === row.id && Number(selectedWeek) === Number(lastWeekNumber) ? (
                                                        <input
                                                            type="number"
                                                            name="amount"
                                                            value={editRefundPaymentData.amount}
                                                            onChange={handleEditRefundChange}
                                                            className="border-2 border-[#BF9853] border-opacity-25 rounded-lg w-[90px] h-[40px] focus:outline-none no-spinner"
                                                            min="0"
                                                            step="any"
                                                            onWheel={(e) => e.preventDefault()}
                                                        />
                                                    ) : (
                                                        Number(row.amount).toLocaleString("en-IN")
                                                    )}
                                                </td>
                                                <td className="py-2">
                                                    {Number(selectedWeek) === Number(lastWeekNumber) && (
                                                        <div className="flex">
                                                            {canEditDelete && (
                                                                <>
                                                                    {editingPaymentId === row.id ? (
                                                                        <button className="text-green-600 font-bold text-lg" onClick={() => saveEditedRefundPayment(row.id)}>
                                                                            ✓
                                                                        </button>
                                                                    ) : (
                                                                        <button onClick={() => handleEditRefundClick(row)}>
                                                                            <img className="w-5 h-4" src={Edit} alt="Edit" />
                                                                        </button>
                                                                    )}
                                                                    <button className="pl-3" onClick={() => handleRefundPaymentsDelete(row.id)}>
                                                                        <img src={Delete} className="w-5 h-4" alt="Delete" />
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button onClick={() => fetchAuditDetailsForRefundPaymentReceived(row.id)} className={canEditDelete ? "pl-3" : ""}>
                                                                <img src={history} className="w-5 h-4" alt="History" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {Number(selectedWeek) === Number(lastWeekNumber) && (
                                            <tr>
                                                <td className="py-2 text-left">
                                                    <div className="flex items-center gap-2">
                                                        <Select
                                                            name="refund_party"
                                                            className="w-[265px] text-left"
                                                            placeholder={isRefundChangeButtonActive ? "Vendor/Contractor/Employee" : "Labour Name"}
                                                            isSearchable
                                                            isClearable
                                                            value={
                                                                isRefundChangeButtonActive
                                                                    ? combinedOptions.find(opt =>
                                                                        (opt.type === "Employee" && String(opt.id) === String(newRefundReceived.employee_id)) ||
                                                                        (opt.type === "Vendor" && String(opt.id) === String(newRefundReceived.vendor_id)) ||
                                                                        (opt.type === "Contractor" && String(opt.id) === String(newRefundReceived.contractor_id))
                                                                    ) || null
                                                                    : laboursList.find(opt => String(opt.id) === String(newRefundReceived.labour_id)) || null
                                                            }
                                                            onChange={handleRefundSelectChange}
                                                            onKeyDown={handleKeyDown}
                                                            options={isRefundChangeButtonActive ? combinedOptions : laboursList}
                                                            styles={customStyles}
                                                            menuPortalTarget={document.body}
                                                        />
                                                        <button onClick={handleRefundChangeButtonClick}>
                                                            <img
                                                                src={Change}
                                                                className={`w-4 h-4 ${isRefundChangeButtonActive ? 'opacity-10' : ''}`}
                                                                alt="Toggle options"
                                                            />
                                                        </button>
                                                    </div>
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
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showPopups && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            setShowPopups(false);
                            setEntryId(null);
                            setDescription("");
                        }
                        if (e.key === 'Enter' && entryId && description.trim()) {
                            handleUpdate();
                        }
                    }}
                    tabIndex={0}
                >
                    <div className="bg-white rounded-xl shadow-lg p-6 w-[400px]">
                        <label className="block mb-3 text-left">
                            <span className="font-semibold">Description</span>
                            {entryId ? (
                                <div>
                                    <input
                                        type="text"
                                        name="description"
                                        placeholder="Enter description"
                                        className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        maxLength={200}
                                    />
                                    <div className="text-xs text-gray-500 mt-1 text-right">
                                        {description.length}/200 characters
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <textarea
                                        name="description"
                                        placeholder="Description"
                                        className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none h-24 resize-none"
                                        value={description}
                                        readOnly
                                    />
                                </div>
                            )}
                        </label>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowPopups(false);
                                    setEntryId(null);
                                    setDescription("");
                                }}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            {entryId && (
                                <button
                                    onClick={handleUpdate}
                                    disabled={loading || !description.trim()}
                                    className="px-4 py-2 bg-[#BF9853] text-white rounded-lg hover:bg-[#A68A4A] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                            )}
                        </div>
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
                            {currentFileRow?.file_url ? 'Change File' : 'Upload File'}
                        </h3>
                        {currentFileRow?.file_url && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-2">Current file:</p>
                                <a href={currentFileRow.file_url}
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
                                accept=".pdf"
                                onChange={handleFileSelectInPopup}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#BF9853] file:text-white hover:file:bg-[#A68A4A]"
                            />
                            {selectedFileForPopup && (
                                <p className="mt-2 text-sm text-green-600">
                                    Selected: {selectedFileForPopup.name}
                                </p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setFileUploadPopup(false);
                                    setCurrentFileRow(null);
                                    setSelectedFileForPopup(null);
                                }}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveFileFromPopup}
                                disabled={!selectedFileForPopup}
                                className={`px-4 py-2 rounded-lg ${!selectedFileForPopup
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700'
                                    } text-white`}
                            >
                                {currentFileRow?.file_url ? 'Update File' : 'Upload File'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showWeeklyPaymentExpensesModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-md shadow-lg w-[95%] max-w-[1800px] mx-4 p-2">
                        <div className="flex justify-between items-center mt-4 ml-7 mr-7">
                            <h2 className="text-xl font-bold">History</h2>
                            <button onClick={() => setShowWeeklyPaymentExpensesModal(false)}>
                                <h2 className="text-xl text-red-500 -mt-10 font-bold">x</h2>
                            </button>
                        </div>
                        <div className="overflow-auto max-h-[600px] w-full">
                            <table className="w-full border-collapse text-left">
                                <thead className="sticky top-0 z-10 bg-white">
                                    <tr className="bg-[#FAF6ED] h-12">
                                        <th className="py-2 px-4 text-left">S.No</th>
                                        <th className="py-2 px-4 text-left">Date</th>
                                        <th className="py-2 px-4 text-left">Action</th>
                                        <th className="py-2 px-4 text-left">Changed By</th>
                                        <th className="py-2 px-4 text-left">Old Values</th>
                                        <th className="py-2 px-4 text-left">New Values</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {weeklyPaymentExpensesAudits.map((audit, index) => (
                                        <tr key={audit.id || index} className="even:bg-[#FAF6ED] odd:bg-[#FFFFFF] text-left">
                                            <td className="px-4 py-2">{index + 1}</td>
                                            <td className="px-4 py-2">{audit.created_at ? new Date(audit.created_at).toLocaleString() : '-'}</td>
                                            <td className="px-4 py-2">{audit.action || '-'}</td>
                                            <td className="px-4 py-2">{audit.changed_by || '-'}</td>
                                            <td className="px-4 py-2">
                                                <div className="max-w-xs overflow-auto">
                                                    {audit.old_values ? JSON.stringify(audit.old_values, null, 2) : '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="max-w-xs overflow-auto">
                                                    {audit.new_values ? JSON.stringify(audit.new_values, null, 2) : '-'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {showWeeklyPaymentReceivedModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-md shadow-lg w-[95%] max-w-[1800px] mx-4 p-2">
                        <div className="flex justify-between items-center mt-4 ml-7 mr-7">
                            <h2 className="text-xl font-bold">History</h2>
                            <button onClick={() => setShowWeeklyPaymentReceivedModal(false)}>
                                <h2 className="text-xl text-red-500 -mt-10 font-bold">x</h2>
                            </button>
                        </div>
                        <div className="overflow-auto max-h-[600px] w-full">
                            <table className="w-full border-collapse text-left">
                                <thead className="sticky top-0 z-10 bg-white">
                                    <tr className="bg-[#FAF6ED] h-12">
                                        <th className="py-2 px-4 text-left">S.No</th>
                                        <th className="py-2 px-4 text-left">Date</th>
                                        <th className="py-2 px-4 text-left">Action</th>
                                        <th className="py-2 px-4 text-left">Changed By</th>
                                        <th className="py-2 px-4 text-left">Old Values</th>
                                        <th className="py-2 px-4 text-left">New Values</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {weeklyPaymentReceivedAudits.map((audit, index) => (
                                        <tr key={audit.id || index} className="even:bg-[#FAF6ED] odd:bg-[#FFFFFF] text-left">
                                            <td className="px-4 py-2">{index + 1}</td>
                                            <td className="px-4 py-2">{audit.created_at ? new Date(audit.created_at).toLocaleString() : '-'}</td>
                                            <td className="px-4 py-2">{audit.action || '-'}</td>
                                            <td className="px-4 py-2">{audit.changed_by || '-'}</td>
                                            <td className="px-4 py-2">
                                                <div className="max-w-xs overflow-auto">
                                                    {audit.old_values ? JSON.stringify(audit.old_values, null, 2) : '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="max-w-xs overflow-auto">
                                                    {audit.new_values ? JSON.stringify(audit.new_values, null, 2) : '-'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {sendingToExpensesEntry && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-[400px]">
                        <h3 className="text-lg font-semibold mb-4 text-center">Sending to Expenses Entry</h3>
                        <div className="mb-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-600">
                                    Processing expense {sendingProgress.current} of {sendingProgress.total}
                                </span>
                                <span className="text-sm text-gray-600">
                                    {sendingProgress.total > 0 ? Math.round((sendingProgress.current / sendingProgress.total) * 100) : 0}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-[#BF9853] h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${(sendingProgress.current / sendingProgress.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </body>
    );
};
export default DailyHistory;