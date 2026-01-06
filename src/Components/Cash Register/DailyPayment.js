import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Edit from '../Images/Edit.svg';
import Delete from '../Images/Delete.svg';
import history from '../Images/History.svg';
import Select from 'react-select';
import fileUpload from '../Images/file_upload.png';
import download from '../Images/file_download.png'
import file from '../Images/file.png';
import Change from '../Images/dropdownchange.png'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { type } from '@testing-library/user-event/dist/type';
import { e, re } from 'mathjs';
import NotesStart from '../Images/notes _start.png';
import NotesEnd from '../Images/notes_end.png';
import Filter from '../Images/filter (3).png';
const DailyPayment = ({ username, userRoles = [] }) => {
    const [expenses, setExpenses] = useState([]);
    const [dailyExpenses, setDailyExpenses] = useState([]);
    const [refundPayments, setRefundPayments] = useState([]);
    const [expensesCategory, setExpensesCategory] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showPopups, setShowPopups] = useState(false);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [entryId, setEntryId] = useState(null);
    const [fileUploadPopup, setFileUploadPopup] = useState(false);
    const [newDailyExpense, setNewDailyExpense] = useState({
        date: "",
        labour_id: "",
        vendor_id: "",
        contractor_id: "",
        employee_id: "",
        project_id: "",
        quantity: "",
        type: "Wage",
        amount: "",
        extra_amount: ""
    });
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
        file_url: "",
        staff_advance_portal_id: ""
    });
    const [weeks, setWeeks] = useState([]);
    const [allRefundAmount, setAllRefundAmount] = useState([]);
    const [contractorOptions, setContractorOptions] = useState([]);
    const [siteOptions, setSiteOptions] = useState([]);
    const [projectId, setProjectId] = useState('');
    const [selectedWeek, setSelectedWeek] = useState("");
    const [editingDailyExpenseRowId, setEditingDailyExpenseRowId] = useState('');
    const [editingPaymentId, setEditingPaymentId] = useState('');
    const [showWeeklyPaymentExpensesModal, setShowWeeklyPaymentExpensesModal] = useState(false);
    const [weeklyPaymentExpensesAudits, setWeeklyPaymentExpensesAudits] = useState([]);
    const [showWeeklyPaymentReceivedModal, setShowWeeklyPaymentReceivedModal] = useState(false);
    const [weeklyPaymentReceivedAudits, setWeeklyPaymentReceivedAudits] = useState([]);
    const [showExtraAmount, setShowExtraAmount] = useState(false);
    const [weeklyTypes, setWeeklyTypes] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [combinedOptions, setCombinedOptions] = useState([]);
    const currentYear = new Date().getFullYear();
    const currentWeek = weeks.find((w) => w.number === Number(selectedWeek));
    const [weeklyReceivedTypes, setWeeklyReceivedTypes] = useState([]);
    const [isChangeButtonActive, setIsChangeButtonActive] = useState(false);
    const [isRefundChangeButtonActive, setIsRefundChangeButtonActive] = useState(false);
    const [currentFileRow, setCurrentFileRow] = useState(null);
    const [selectedFileForPopup, setSelectedFileForPopup] = useState(null);
    const [purposeOptions, setPurposeOptions] = useState([]);
    const [showPurposePopup, setShowPurposePopup] = useState(false);
    const [selectedPurpose, setSelectedPurpose] = useState(null);
    const [pendingRefundData, setPendingRefundData] = useState(null);
    useEffect(() => {
        fetchWeeklyReceivedType();
        fetchPurposeOptions();
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
    const fetchPurposeOptions = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/loan-purposes/getAll', {
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
                value: item.purpose,
                label: item.purpose,
                id: item.id,
                type: 'Purpose'
            }));
            setPurposeOptions(formattedData);
        } catch (error) {
            console.error("Error fetching purpose options: ", error);
            setPurposeOptions([]);
        }
    };
    useEffect(() => {
        fetchCategories();
    }, []);
    const fetchCategories = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuilderDash/api/expenses_categories/getAll');
            if (response.ok) {
                const data = await response.json();
                setExpensesCategory(data);
            } else {
                console.log('Error fetching category.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    // Sorting state
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc'
    });
    // Filter state variables
    const [showFilters, setShowFilters] = useState(false);
    const [selectDate, setSelectDate] = useState('');
    const [selectContractororVendorName, setSelectContractororVendorName] = useState('');
    const [selectProjectName, setSelectProjectName] = useState('');
    const [selectType, setSelectType] = useState('');
    // Click and drag scrolling functionality
    const scrollRef = useRef(null);
    const isDragging = useRef(false);
    const start = useRef({ x: 0, y: 0 });
    const scroll = useRef({ left: 0, top: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const animationFrame = useRef(null);
    const lastMove = useRef({ time: 0, x: 0, y: 0 });
    // Move laboursList state declaration here, before it's used in sortedDailyExpenses
    const [laboursList, setLaboursList] = useState([]);
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
    // Filter functions
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

    // Filtered data based on selected filters
    const filteredExpenses = React.useMemo(() => {
        return dailyExpenses.filter((entry) => {
            // Date filter (exact match since it's type="date")
            if (selectDate) {
                // Convert selectDate (YYYY-MM-DD) → DD-M-YYYY
                const [year, month, day] = selectDate.split("-");
                const formattedSelectDate = `${parseInt(day)}-${parseInt(month)}-${year}`;
                // Convert entry.date to DD-M-YYYY
                const entryDateObj = new Date(entry.date);
                const formattedEntryDate = `${entryDateObj.getDate()}-${entryDateObj.getMonth() + 1}-${entryDateObj.getFullYear()}`;
                if (formattedEntryDate !== formattedSelectDate) return false;
            }
            // Contractor/Vendor/Labour filter
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
            // Project Name filter
            if (selectProjectName) {
                const projectName = getSiteName(entry.project_id) || "";
                if (projectName.toLowerCase() !== selectProjectName.toLowerCase())
                    return false;
            }
            // Type filter
            if (selectType) {
                if (entry.type?.toLowerCase() !== selectType.toLowerCase()) return false;
            }
            return true; // passes all filters
        });
    }, [dailyExpenses, selectDate, selectContractororVendorName, selectProjectName, selectType, vendorOptions, contractorOptions, employeeOptions, siteOptions, laboursList]);

    const contractorVendorFilterOptions = React.useMemo(() => {
        const ids = new Set();
        const options = [];

        // Add contractor/vendor/employee options
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

        // Add labour options
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

    // Sorting functions
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
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
            // Default sorting: Most recent entries first (by date descending)
            sortableData.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB - dateA; // Descending order (newest first)
            });
        }
        return sortableData;
    }, [filteredExpenses, sortConfig, laboursList, siteOptions, isChangeButtonActive, combinedOptions, employeeOptions, vendorOptions, contractorOptions]);
    // ISO 8601 week number calculation
    // Week belongs to the year that contains the Thursday of that week
    // Week 1 is the week with the year's first Thursday
    const getISOWeekNumber = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        
        // Get Thursday of the week containing the date
        // Monday = 1, Tuesday = 2, ..., Sunday = 0 (convert to 7)
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

    // Calculate week number from a specific date (not current date)
    const getWeekNumberFromDate = (dateString) => {
        if (!dateString) return getCurrentWeekNumber();
        const date = new Date(dateString);
        // Handle date strings in DD/MM/YYYY format
        if (dateString.includes('/')) {
            const parts = dateString.split('/');
            if (parts.length === 3) {
                date.setFullYear(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
        }
        return getISOWeekNumber(date);
    };
    const currentWeekNumber = getCurrentWeekNumber();
    const startYear = 2000; // Change if needed
    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
    const [newRefundReceived, setNewRefundReceived] = useState({
        date: new Date().toISOString().split("T")[0],
        labour_id: "",
        vendor_id: "",
        contractor_id: "",
        employee_id: "",
        amount: ""
    });
    const [editRefundPaymentData, setEditRefundPaymentData] = useState({
        labour_id: "",
        vendor_id: "",
        contractor_id: "",
        employee_id: "",
        amount: "",
    });
    const [payments, setPayments] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const handleEditClick = (row) => {
        setEditingDailyExpenseRowId(row.id);
        setEditDailyExpenseData({
            date: row.date,
            labour_id: row.labour_id || "",
            vendor_id: row.vendor_id || "",
            contractor_id: row.contractor_id || "",
            employee_id: row.employee_id || "",
            project_id: row.project_id,
            type: row.type,
            amount: row.amount,
            extra_amount: row.extra_amount,
            quantity: row.quantity || "",
            description: row.description || "",
            file_url: row.file_url || "",
            staff_advance_portal_id: row.staff_advance_portal_id || ""
        });
    };
    const handleDescriptionClick = (row) => {
        if (row.description) {
            // If description exists, show it in a read-only modal
            setDescription(row.description);
            setEntryId(null); // No editing allowed
            setShowPopups(true);
        } else {
            // If no description, allow editing
            setEntryId(row.id);
            setDescription("");
            setShowPopups(true);
        }
    };
    const handleEditRefundClick = (row) => {
        setEditingPaymentId(row.id);
        setEditRefundPaymentData({
            labour_id: row.labour_id || "",
            vendor_id: row.vendor_id || "",
            contractor_id: row.contractor_id || "",
            employee_id: row.employee_id || "",
            amount: row.amount,
        });
    };
    const handleEditRefundChange = (e) => {
        const { name, value } = e.target;
        setEditRefundPaymentData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleEditRefundLabourChange = (selectedOption) => {
        if (selectedOption) {
            const { type, id } = selectedOption;
            setEditRefundPaymentData((prev) => ({
                ...prev,
                labour_id: type === "Labour" ? id : "",
                vendor_id: type === "Vendor" ? id : "",
                contractor_id: type === "Contractor" ? id : "",
                employee_id: type === "Employee" ? id : "",
            }));
        } else {
            setEditRefundPaymentData((prev) => ({
                ...prev,
                labour_id: "",
                vendor_id: "",
                contractor_id: "",
                employee_id: "",
            }));
        }
    };
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
        // This ensures the input is cleared even if the same file is selected again next time
        e.target.value = '';
    };
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
    const fetchExpenses = useCallback(() => {
        if (!currentWeekNumber) return;
        fetch(`https://backendaab.in/aabuildersDash/api/weekly-expenses/week/${currentWeekNumber}`)
            .then((res) => res.json())
            .then(setExpenses)
            .catch(console.error);
    }, [currentWeekNumber]);
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
    useEffect(() => {
        if (currentWeekNumber) {
            fetchPayments();
            fetchExpenses();
            fetchRefundPayments();
        }
    }, [currentWeekNumber, fetchPayments, fetchExpenses, fetchRefundPayments]);
    // Cleanup momentum animation on unmount
    useEffect(() => {
        return () => {
            cancelMomentum();
        };
    }, []);
    const formatDateOnly = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };
    useEffect(() => {
        fetchLaboursList();
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
                    extra: item.extra_amount
                }));
                setLaboursList(formattedData);
            } else {
                console.log('Error fetching Labour names.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    useEffect(() => {
        fetchWeeklyType();
    }, []);
    const fetchWeeklyType = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/weekly_types/getAll');
            if (response.ok) {
                const data = await response.json();
                // Add Staff Advance to the types if it doesn't exist
                const hasStaffAdvance = data.some(type => type.type === "Staff Advance");
                if (!hasStaffAdvance) {
                    data.push({ type: "Staff Advance" });
                }
                setWeeklyTypes(data);
            } else {
                console.log('Error fetching tile area names.');
            }
        } catch (error) {
            console.error('Error:', error);
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
    const handleInputChange = (e) => {
        setNewDailyExpense((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
    // Function to get the last entry number from staff-advance API
    const getLastEntryNumber = async () => {
        try {
            const response = await axios.get("https://backendaab.in/aabuildersDash/api/staff-advance/all");
            if (response.data && response.data.length > 0) {
                // Get the last entry_no and increment by 1
                const lastEntry = response.data[response.data.length - 1];
                return (lastEntry.entry_no || 0) + 1;
            }
            return 1; // If no entries exist, start with 1
        } catch (error) {
            console.error("Error fetching last entry number:", error);
            return 1; // Default to 1 if API call fails
        }
    };

    // Clear Loan Portal entry function
    const clearLoanPortalEntry = async (loanPortalId, date, entry_no) => {
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
            entry_no,
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

    const clearStaffAdvancePortalEntry = async (staffAdvancePortalId, date, entry_no) => {
        if (!staffAdvancePortalId) return;
        const clearedData = {
            date: date || new Date().toISOString().split("T")[0],
            amount: null,
            employee_id: null,
            labour_id: null,
            description: null,
            type: null,
            week_no: null,
            from_purpose_id: null,
            staff_payment_mode: null,
            file_url: null,
            staff_refund_amount: null,
            entry_no,
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

    const handleRefundSubmit = async () => {
        try {
            const isLabourOrEmployeeRefund = (newRefundReceived.labour_id && Number(newRefundReceived.labour_id) > 0) ||
                (newRefundReceived.employee_id && Number(newRefundReceived.employee_id) > 0);
            const isVendorOrContractorRefund = (newRefundReceived.vendor_id && Number(newRefundReceived.vendor_id) > 0) ||
                (newRefundReceived.contractor_id && Number(newRefundReceived.contractor_id) > 0);
            if (isLabourOrEmployeeRefund) {
                const entryNo = await getLastEntryNumber();
                const staffAdvancePayload = {
                    date: selectedDate,
                    type: "Refund",
                    labour_id: Number(newRefundReceived.labour_id) || null,
                    employee_id: Number(newRefundReceived.employee_id) || null,
                    staff_refund_amount: Number(newRefundReceived.amount),
                    week_no: Number(currentWeekNumber),
                    staff_payment_mode: "Cash",
                    from_purpose_id: 5,
                    entry_no: entryNo
                };
                const staffAdvanceResponse = await axios.post(
                    "https://backendaab.in/aabuildersDash/api/staff-advance/save",
                    staffAdvancePayload,
                    { headers: { "Content-Type": "application/json" } }
                );
                const staffAdvancePortalId = staffAdvanceResponse.data?.staffAdvancePortalId;
                const refundPayload = {
                    date: selectedDate,
                    labour_id: Number(newRefundReceived.labour_id) || null,
                    employee_id: Number(newRefundReceived.employee_id) || null,
                    amount: Number(newRefundReceived.amount),
                    weekly_number: Number(currentWeekNumber),
                    staff_advance_portal_id: staffAdvancePortalId
                };
                await axios.post(
                    "https://backendaab.in/aabuildersDash/api/refund_received/save",
                    refundPayload,
                    { headers: { "Content-Type": "application/json" } }
                );
            } else if (isVendorOrContractorRefund) {
                setPendingRefundData({
                    date: selectedDate,
                    vendor_id: Number(newRefundReceived.vendor_id) || null,
                    contractor_id: Number(newRefundReceived.contractor_id) || null,
                    amount: Number(newRefundReceived.amount),
                    weekly_number: Number(currentWeekNumber)
                });
                setShowPurposePopup(true);
                return;
            } else {
                alert("Please select a labour, employee, vendor, or contractor for the refund.");
                return;
            }
            window.location.reload();
            setNewRefundReceived({
                date: new Date().toISOString().split("T")[0],
                labour_id: "",
                vendor_id: "",
                contractor_id: "",
                employee_id: "",
                amount: "",
            });
        } catch (error) {
            console.error("Error saving refund:", error);
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleRefundSubmit();
        }
    };
    const handlePurposeSelection = async () => {
        if (!selectedPurpose) {
            alert("Please select a purpose");
            return;
        }
        if (!pendingRefundData) {
            alert("No pending refund data found");
            return;
        }
        try {
            // Calculate week_no from the date to ensure it's correct
            const weekNo = getWeekNumberFromDate(pendingRefundData.date);
            const loanPortalPayload = {
                type: "Refund",
                date: pendingRefundData.date,
                amount: 0,
                loan_payment_mode: "Cash",
                loan_refund_amount: Number(pendingRefundData.amount),
                from_purpose_id: selectedPurpose.id,
                transfer_Project_id: 0,
                to_purpose_id: 0,
                vendor_id: Number(pendingRefundData.vendor_id) || 0,
                contractor_id: Number(pendingRefundData.contractor_id) || 0,
                project_id: 0,
                week_no: Number(weekNo),
                description: "Refund from Cash Register",
                file_url: ""
            };
            const loanPortalResponse = await axios.post(
                "https://backendaab.in/aabuildersDash/api/loans/save",
                loanPortalPayload,
                { headers: { "Content-Type": "application/json" } }
            );
            // Calculate weekly_number from the date in pendingRefundData to ensure it's correct
            const correctWeeklyNumber = getWeekNumberFromDate(pendingRefundData.date);
            const refundPayload = {
                date: pendingRefundData.date,
                vendor_id: Number(pendingRefundData.vendor_id) || null,
                contractor_id: Number(pendingRefundData.contractor_id) || null,
                amount: Number(pendingRefundData.amount),
                weekly_number: Number(correctWeeklyNumber),
                staff_advance_portal_id: null,
                loan_portal_id: loanPortalResponse.data?.id || loanPortalResponse.data?.loanPortalId
            };
            await axios.post(
                "https://backendaab.in/aabuildersDash/api/refund_received/save",
                refundPayload,
                { headers: { "Content-Type": "application/json" } }
            );
            setShowPurposePopup(false);
            setSelectedPurpose(null);
            setPendingRefundData(null);
            window.location.reload();
            setNewRefundReceived({
                date: new Date().toISOString().split("T")[0],
                labour_id: "",
                vendor_id: "",
                contractor_id: "",
                employee_id: "",
                amount: "",
            });
        } catch (error) {
            console.error("Error saving refund with purpose:", error);
            alert("Error saving refund. Please try again.");
        }
    };
    const handleChangeButtonClick = () => {
        setIsChangeButtonActive(prev => !prev);
    };
    const handleRefundChangeButtonClick = () => {
        setIsRefundChangeButtonActive(prev => !prev);
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
                file_url: editDailyExpenseData.file_url || null,  // 🔹 send url here
                staff_advance_portal_id: editDailyExpenseData.staff_advance_portal_id || null,
            };
            const wasStaffAdvance = row.type === "Staff Advance";
            const isNowStaffAdvance = editDailyExpenseData.type === "Staff Advance";
            const typeChangedFromStaffAdvance = wasStaffAdvance && !isNowStaffAdvance;
            const typeChangedToStaffAdvance = !wasStaffAdvance && isNowStaffAdvance;
            const amountChanged = Number(row.amount) !== Number(editDailyExpenseData.amount);
            const isChanged = Object.keys(payload).some(
                (key) => {
                    const payloadValue = payload[key] ?? "";
                    const rowValue = row[key] ?? "";
                    const numericFields = ['labour_id', 'vendor_id', 'contractor_id', 'employee_id', 'project_id', 'quantity', 'amount', 'extra_amount'];
                    if (numericFields.includes(key)) {
                        return Number(payloadValue) !== Number(rowValue);
                    }
                    return String(payloadValue) !== String(rowValue);
                }
            ) || typeChangedFromStaffAdvance || typeChangedToStaffAdvance;
            if (typeChangedFromStaffAdvance) {
                payload.staff_advance_portal_id = null;
                if (row.staff_advance_portal_id) {
                    try {
                        await axios.delete(
                            `https://backendaab.in/aabuildersDash/api/staff-advance/${row.staff_advance_portal_id}`,
                            { headers: { "Content-Type": "application/json" } }
                        );
                    } catch (error) {
                        console.error("Error deleting staff advance portal:", error);
                    }
                }
            }
            if (typeChangedToStaffAdvance) {
                try {
                    const entryNo = await getLastEntryNumber();
                    const staffAdvancePayload = {
                        date: editDailyExpenseData.date,
                        type: "Advance",
                        labour_id: Number(editDailyExpenseData.labour_id) || null,
                        amount: Number(editDailyExpenseData.amount),
                        week_no: Number(currentWeekNumber),
                        staff_payment_mode: "Cash",
                        from_purpose_id: 5,
                        entry_no: entryNo
                    };
                    const staffAdvanceResponse = await axios.post(
                        "https://backendaab.in/aabuildersDash/api/staff-advance/save",
                        staffAdvancePayload,
                        { headers: { "Content-Type": "application/json" } }
                    );
                    const staffAdvancePortalId = staffAdvanceResponse.data?.staffAdvancePortalId;
                    payload.staff_advance_portal_id = staffAdvancePortalId;
                } catch (error) {
                    console.error("Error creating staff advance portal:", error);
                }
            }
            if (amountChanged && isNowStaffAdvance && row.staff_advance_portal_id) {
                try {
                    const staffAdvanceUpdatePayload = {
                        type: "Advance",
                        date: editDailyExpenseData.date,
                        labour_id: Number(editDailyExpenseData.labour_id) || null,
                        from_purpose_id: 5,
                        to_purpose_id: null,
                        staff_payment_mode: "Cash",
                        amount: Number(editDailyExpenseData.amount),
                        staff_refund_amount: 0,
                        description: editDailyExpenseData.description || "",
                        file_url: editDailyExpenseData.file_url || null
                    };
                    await axios.put(
                        `https://backendaab.in/aabuildersDash/api/staff-advance/${row.staff_advance_portal_id}?editedBy=${encodeURIComponent(username)}`,
                        staffAdvanceUpdatePayload,
                        { headers: { "Content-Type": "application/json" } }
                    );
                } catch (error) {
                    console.error("Error updating staff advance portal amount:", error);
                }
            }
            if (!isChanged) {
                setEditingDailyExpenseRowId(null);
                return;
            }
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
    };
    const saveEditedRefundPayment = async (id) => {
        try {
            const refundData = refundPayments.find(refund => refund.id === id);
            if (refundData && refundData.staff_advance_portal_id) {
                try {
                    const staffAdvanceUpdatePayload = {
                        type: "Refund",
                        date: refundData.date,
                        labour_id: Number(editRefundPaymentData.labour_id) || null,
                        vendor_id: Number(editRefundPaymentData.vendor_id) || null,
                        contractor_id: Number(editRefundPaymentData.contractor_id) || null,
                        employee_id: Number(editRefundPaymentData.employee_id) || null,
                        from_purpose_id: 5,
                        to_purpose_id: null,
                        staff_payment_mode: "Cash",
                        amount: 0,
                        staff_refund_amount: Number(editRefundPaymentData.amount),
                        description: "",
                        file_url: null
                    };
                    await axios.put(
                        `https://backendaab.in/aabuildersDash/api/staff-advance/${refundData.staff_advance_portal_id}?editedBy=${encodeURIComponent(username)}`,
                        staffAdvanceUpdatePayload,
                        { headers: { "Content-Type": "application/json" } }
                    );
                } catch (error) {
                    console.error("Error updating staff advance portal for refund:", error);
                }
            }
            await axios.put(
                `https://backendaab.in/aabuildersDash/api/refund_received/edit/${id}?username=${encodeURIComponent(username)}`,
                editRefundPaymentData
            );
            setRefundPayments((prev) =>
                prev.map((row) =>
                    row.id === id ? { ...row, ...editRefundPaymentData } : row
                )
            );
            setEditingPaymentId(null);
        } catch (error) {
            console.error("Error updating refund payment:", error);
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
    const handleDailyExpensesDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete This Daily Expense Data?");
        if (confirmed) {
            try {
                const expenseData = dailyExpenses.find(expense => expense.id === id);
                if (expenseData && expenseData.staff_advance_portal_id) {
                    try {
                        await axios.delete(
                            `https://backendaab.in/aabuildersDash/api/staff-advance/${expenseData.staff_advance_portal_id}`,
                            { headers: { "Content-Type": "application/json" } }
                        );
                    } catch (error) {
                        console.error("Error deleting staff advance portal:", error);
                    }
                }
                const response = await fetch(`https://backendaab.in/aabuildersDash/api/daily-payments/delete/${id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    alert("Daily Expenses deleted successfully!!!");
                    window.location.reload();
                } else {
                    console.error("Failed to delete the Daily Expenses. Status:", response.status);
                    alert("Error deleting the Daily Expenses. Please try again.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred while deleting the Daily Expenses.");
            }
        } else {
            console.log("Deletion cancelled.");
        }
    };
    const handleRefundPaymentsDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete This Refund Received Data?");
        if (confirmed) {
            try {
                const refundData = refundPayments.find(refund => refund.id === id);
                if (refundData && refundData.staff_advance_portal_id) {
                    try {
                        await clearStaffAdvancePortalEntry(refundData.staff_advance_portal_id, refundData.date, refundData.entry_no);
                    } catch (error) {
                        console.error("Error clearing staff advance portal for refund:", error);
                        alert("Failed to clear the associated Staff Advance Portal entry. Please try again.");
                        return;
                    }
                }
                if (refundData && refundData.loan_portal_id) {
                    try {
                        await clearLoanPortalEntry(refundData.loan_portal_id, refundData.date, refundData.entry_no);
                    } catch (error) {
                        console.error("Error clearing loan portal for refund:", error);
                        alert("Failed to clear the associated Loan Portal entry. Please try again.");
                        return;
                    }
                }
                const response = await fetch(`https://backendaab.in/aabuildersDash/api/refund_received/delete/${id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    alert("Refund Received deleted successfully!!!");
                    window.location.reload();
                } else {
                    console.error("Failed to delete the Refund Received. Status:", response.status);
                    alert("Error deleting the Refund Received. Please try again.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred while deleting the Refund Payments.");
            }
        } else {
            console.log("Deletion cancelled.");
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
                alert("Please select all requried details.");
                return;
            }
            if (newDailyExpense.type === "Staff Advance") {
                const entryNo = await getLastEntryNumber();
                const staffAdvancePayload = {
                    date: selectedDate,
                    type: "Advance",
                    labour_id: Number(newDailyExpense.labour_id) || null,
                    amount: Number(newDailyExpense.amount),
                    week_no: Number(currentWeekNumber),
                    staff_payment_mode: "Cash",
                    from_purpose_id: 5,
                    entry_no: entryNo
                };
                const staffAdvanceResponse = await axios.post(
                    "https://backendaab.in/aabuildersDash/api/staff-advance/save",
                    staffAdvancePayload,
                    { headers: { "Content-Type": "application/json" } }
                );
                const staffAdvancePortalId = staffAdvanceResponse.data?.staffAdvancePortalId;
                const dailyPaymentPayload = {
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
                    weekly_number: Number(currentWeekNumber),
                    staff_advance_portal_id: staffAdvancePortalId
                };
                await axios.post(
                    "https://backendaab.in/aabuildersDash/api/daily-payments/save",
                    dailyPaymentPayload,
                    { headers: { "Content-Type": "application/json" } }
                );
                const expenseForBackend = {
                    date: selectedDate,
                    contractor_id: contractorOptions.find(opt => opt.label === "Company Labour")?.id || null,
                    vendor_id: null,
                    project_id: siteOptions.find(opt => opt.label === "Daily Wage")?.id || null,
                    type: "Daily",
                    amount: 0,
                    weekly_number: currentWeekNumber,
                    status: false,
                };
                await axios.post(
                    "https://backendaab.in/aabuildersDash/api/weekly-expenses/save-daily",
                    expenseForBackend,
                    { headers: { "Content-Type": "application/json" } }
                );
            } else {
                const payload = {
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
                    weekly_number: Number(currentWeekNumber),
                };
                await axios.post(
                    "https://backendaab.in/aabuildersDash/api/daily-payments/save",
                    payload,
                    { headers: { "Content-Type": "application/json" } }
                );
                const expenseForBackend = {
                    date: selectedDate,
                    contractor_id: contractorOptions.find(opt => opt.label === "Company Labour")?.id || null,
                    vendor_id: null,
                    project_id: siteOptions.find(opt => opt.label === "Daily Wage")?.id || null,
                    type: "Daily",
                    amount: 0,
                    weekly_number: currentWeekNumber,
                    status: false,
                };
                await axios.post(
                    "https://backendaab.in/aabuildersDash/api/weekly-expenses/save-daily",
                    expenseForBackend,
                    { headers: { "Content-Type": "application/json" } }
                );
            }
            await handleDateClick(selectedDate);
            window.location.reload();
            setNewDailyExpense({
                labour_id: "",
                vendor_id: "",
                contractor_id: "",
                employee_id: "",
                labour_name: "",
                project_id: "",
                type: "",
                amount: "",
                extra_amount: "",
            });
            setShowExtraAmount(false);
        } catch (error) {
            console.error("Error saving expense:", error);
        }
    };
    useEffect(() => {
        if (weeks.length > 0) {
            setSelectedWeek(weeks[weeks.length - 1].number);
        }
    }, [weeks]);
    const getCurrentWeekDays = () => {
        const today = new Date();
        const dayOfWeek = today.getDay() || 7;
        const monday = new Date(today);
        monday.setDate(today.getDate() - dayOfWeek + 1);
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            days.push(d);
        }
        return days;
    };
    const days = [];
    if (currentWeek) {
        const start = new Date(currentWeek.start);
        for (let i = 0; i < 7; i++) {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            days.push(day);
        }
    }
    const currentWeekDays = getCurrentWeekDays();
    useEffect(() => {
        if (currentWeekDays.length > 0) {
            const todayStr = new Date().toISOString().split("T")[0];
            const matchedDay = currentWeekDays.find(
                (d) => d.toISOString().split("T")[0] === todayStr
            );
            const defaultDate = matchedDay
                ? matchedDay.toISOString().split("T")[0]
                : currentWeekDays[0].toISOString().split("T")[0];
            setSelectedDate(defaultDate);
            setNewDailyExpense((prev) => ({ ...prev, date: defaultDate }));
        }
    }, []);
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
            setDailyExpenses(dailyRes.data);
            setRefundPayments(refundRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            setDailyExpenses([]);
            setRefundPayments([]);
        }
    };
    const today = new Date().toISOString().split("T")[0];
    if (!selectedDate && currentWeekDays.length > 0) {
        const todayInWeek = currentWeekDays.find(
            (d) => d.toISOString().split("T")[0] === today
        );
        const defaultDate = todayInWeek
            ? today
            : currentWeekDays[0].toISOString().split("T")[0];
        handleDateClick(defaultDate);
    }
    const totalAmount = filteredExpenses
        .filter(row => row.date === selectedDate)
        .reduce((sum, row) => sum + (Number(row.amount || 0) + Number(row.extra_amount || 0)), 0);
    const totalRefund = refundPayments
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const totalPayments = payments
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const netBalance = totalAmount - totalRefund;
    const balance = totalPayments - expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
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
                    // Filter entries for this labour_id up to selectedDate
                    const labourEntries = staffAdvanceData.filter(entry => {
                        if (entry.labour_id !== Number(refundRow.labour_id)) return false;
                        const entryDate = new Date(entry.date);
                        if (entryDate > selectedDateObj) return false;
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
        const headerText = `PS: ${currentWeekNumber}`;
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
                return b.type.localeCompare(a.type); // type DESC
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
            `${totalRefundAmount.toLocaleString('en-IN').replace(/\u202F/g, ',')}`,
            ""
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
        const fileName = `PS ${currentWeekNumber} - Daily Payment Statement ${formatDateOnly(selectedDate)}.pdf`;
        doc.save(fileName);
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
                { headers: { "Content-Type": "application/json", }, }
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
    return (
        <body>
            <h1 className="font-bold text-xl flex justify-end mr-5 -mt-7">
                Balance:<span style={{ color: "#E4572E" }}>{Number(balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2, })}</span>
            </h1>
            <div className='mx-auto flex justify-between w-auto p-4 pl-8 border-collapse text-left bg-[#FFFFFF] ml-[30px] mr-6 rounded-md lg:h-[147px]'>
                <div>
                    {days.length > 0 && (
                        <div className='lg:w-[600px]'>
                            <div className="grid grid-cols-3 lg:grid-cols-7 gap-2">
                                {currentWeekDays.map((day, idx) => {
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
                    <div className="mt-6 flex">
                        <div>
                            <h2 className="font-semibold">Table Data (Week {currentWeekNumber})</h2>
                        </div>
                        <div>
                            {selectedDate && <p>Selected day: {formatDateOnly(selectedDate)}</p>}
                        </div>
                    </div>
                </div>
                <div className="mr-5 flex gap-3">
                    <button onClick={generateExpensesPDF} className='font-semibold mt-4 mr-5 hover:text-[#E4572E]'>Report</button>
                </div>
            </div>
            <div className="mt-4 flex justify-end mr-6">
                <h1 className="font-bold text-xl">
                    Net Balance:<span style={{ color: "#E4572E" }}>{Number(netBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2, })}</span>
                </h1>
            </div>
            <div className="mx-auto w-auto p-6 border-collapse bg-[#FFFFFF] ml-[30px] mr-6 rounded-md">
                <div className="w-full mt- flex flex-col xl:flex-row gap-6">
                    <div className="flex-[2] min-w-0">
                        <div className="flex justify-between mb-4">
                            <h1 className="font-bold text-xl">
                                PS: {currentWeekNumber}
                            </h1>
                            <h1 className="font-bold text-base mr-16">
                                Expenses:<span style={{ color: "#E4572E" }}>{Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2, })}</span>
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
                            <div ref={scrollRef} className="overflow-auto max-h-[600px] thin-scrollbar" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} >
                                <table className="w-[1200px] border-collapse text-left">
                                    <thead className="sticky top-0 z-10 bg-white">
                                        <tr className="bg-[#FAF6ED] h-12">
                                            <th className="py-2 px-1 text-left w-[60px]">S.No</th>
                                            <th className="py-2 px-1 text-left w-[140px] cursor-pointer hover:bg-gray-200"
                                                onClick={() => handleSort('labour_name')}>
                                                Name {sortConfig.key === 'labour_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="py-2 px-1 text-left w-[170px] cursor-pointer hover:bg-gray-200"
                                                onClick={() => handleSort('project_name')}>
                                                Project Name {sortConfig.key === 'project_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="py-2 px-1 text-left w-[120px] cursor-pointer hover:bg-gray-200"
                                                onClick={() => handleSort('amount')}>
                                                Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="py-2 px-1 text-left w-[120px] cursor-pointer hover:bg-gray-200"
                                                onClick={() => handleSort('type')}>
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
                                        {Number(currentWeekNumber) === Number(currentWeekNumber) ? (
                                            <tr className="bg-white border-b border-gray-200">
                                                <td className="px-1 py-2 font-bold">{dailyExpenses.length + 1}.</td>
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
                                                            <img src={Change} className={`w-4 h-4 ${isChangeButtonActive ? 'opacity-10' : ''}`} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="py-2">
                                                    <Select
                                                        name="project"
                                                        value={siteOptions.find(opt => opt.id === Number(newDailyExpense.project_id)) || null}
                                                        onChange={(selectedOption) => {
                                                            setNewDailyExpense(prev => ({
                                                                ...prev,
                                                                project_id: selectedOption ? selectedOption.id : ""
                                                            }));
                                                            setProjectId(selectedOption ? selectedOption.id : "");
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
                                                <td className="py-2 text-left flex items-center gap-2">
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
                                                <td className="py-2 text-left">
                                                    <Select
                                                        name="type"
                                                        value={(isChangeButtonActive ? expensesCategory : weeklyTypes).find(option =>
                                                            (isChangeButtonActive ? option.category : option.type) === newDailyExpense.type
                                                        ) ? {
                                                            value: newDailyExpense.type,
                                                            label: newDailyExpense.type
                                                        } : null}
                                                        onChange={(selectedOption) => {
                                                            setNewDailyExpense(prev => ({
                                                                ...prev,
                                                                type: selectedOption ? selectedOption.value : ""
                                                            }));
                                                        }}
                                                        options={(isChangeButtonActive ? expensesCategory : weeklyTypes).map((type, index) => ({
                                                            value: isChangeButtonActive ? type.category : type.type,
                                                            label: isChangeButtonActive ? type.category : type.type
                                                        }))}
                                                        placeholder="Select"
                                                        isSearchable={true}
                                                        isClearable={true}
                                                        menuPortalTarget={document.body}
                                                        className="w-[165px]"
                                                        styles={{
                                                            control: (provided, state) => ({
                                                                ...provided,
                                                                minHeight: '40px',
                                                                border: '2px solid rgba(191, 152, 83, 0.25)',
                                                                borderRadius: '8px',
                                                                boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                                                '&:hover': {
                                                                    border: '2px solid rgba(191, 152, 83, 0.5)'
                                                                }
                                                            }),
                                                            valueContainer: (provided) => ({
                                                                ...provided,
                                                                padding: '2px 8px'
                                                            }),
                                                            input: (provided) => ({
                                                                ...provided,
                                                                margin: '0px'
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
                                                <td className="py-2">
                                                    <input
                                                        type="number"
                                                        name="quantity"
                                                        className="border-2 border-[#BF9853] border-opacity-25 p-1 w-[50px] h-[40px] rounded-lg focus:outline-none no-spinner"
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
                                                <td>
                                                </td>
                                            </tr>
                                        ) : null}
                                    </thead>
                                    <tbody>
                                        {sortedDailyExpenses
                                            .filter(row => row.date === selectedDate)
                                            .reverse()
                                            .map((row, index) => (
                                                <tr key={row.id} className="even:bg-[#FFFFFF] odd:bg-[#FAF6ED] text-left">
                                                    <td className="py-2 font-bold text-left">{dailyExpenses.length - index}</td>
                                                    <td className="py-2">
                                                        {editingDailyExpenseRowId === row.id ? (
                                                            <Select
                                                                name="labour_id"
                                                                className="w-[230px]"
                                                                placeholder={isChangeButtonActive ? "Vendor/Contractor" : "Labour Name"}
                                                                isSearchable
                                                                isClearable
                                                                styles={customStyles}
                                                                options={isChangeButtonActive ? combinedOptions : laboursList}
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
                                                                        const { type, id } = selectedOption;
                                                                        setEditDailyExpenseData(prev => ({
                                                                            ...prev,
                                                                            labour_id: type === "Labour" ? id : "",
                                                                            vendor_id: type === "Vendor" ? id : "",
                                                                            contractor_id: type === "Contractor" ? id : "",
                                                                            employee_id: type === "Employee" ? id : "",
                                                                        }));
                                                                    } else {
                                                                        setEditDailyExpenseData(prev => ({
                                                                            ...prev,
                                                                            labour_id: "",
                                                                            vendor_id: "",
                                                                            contractor_id: "",
                                                                            employee_id: "",
                                                                        }));
                                                                    }
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-[180px] h-[40px] flex items-center">
                                                                {(() => {
                                                                    const employee = employeeOptions.find(opt => opt.id === Number(row.employee_id));
                                                                    const vendor = vendorOptions.find(opt => opt.id === Number(row.vendor_id));
                                                                    const contractor = contractorOptions.find(opt => opt.id === Number(row.contractor_id));
                                                                    const labour = laboursList.find(opt => opt.id === Number(row.labour_id));
                                                                    const labels = [employee?.label, vendor?.label, contractor?.label, labour?.label].filter(Boolean);
                                                                    return labels.length > 0 ? labels.join(" | ") : "";
                                                                })()}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-2">
                                                        {editingDailyExpenseRowId === row.id ? (
                                                            <Select
                                                                name="project_id"
                                                                className="w-[220px]"
                                                                placeholder="Select Project"
                                                                isSearchable
                                                                isClearable
                                                                styles={customStyles}
                                                                options={siteOptions}
                                                                value={siteOptions.find(opt => opt.id === Number(editDailyExpenseData.project_id)) || null}
                                                                onChange={(selectedOption) =>
                                                                    setEditDailyExpenseData(prev => ({
                                                                        ...prev,
                                                                        project_id: selectedOption ? selectedOption.id : "",
                                                                    }))
                                                                }
                                                            />
                                                        ) : (
                                                            <div className="w-[260px] h-[40px] flex items-center">
                                                                {siteOptions.find(opt => opt.id === Number(row.project_id))?.label || ""}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-2 relative group flex ">
                                                        <div className="flex items-center">
                                                            <div className='flex items-center gap-2'>
                                                                {editingDailyExpenseRowId === row.id ? (
                                                                    <>
                                                                        <input
                                                                            type="number"
                                                                            name="amount"
                                                                            className="border-2 border-[#BF9853] border-opacity-25 bg-transparent p-1 w-[90px] h-[40px] rounded-lg focus:outline-none no-spinner"
                                                                            value={editDailyExpenseData.amount}
                                                                            onChange={(e) =>
                                                                                setEditDailyExpenseData(prev => ({ ...prev, amount: e.target.value }))
                                                                            }
                                                                        />
                                                                        <input
                                                                            type="number"
                                                                            name="extra_amount"
                                                                            className="border-2 border-[#BF9853] border-opacity-25 bg-transparent p-1 w-[90px] h-[40px] rounded-lg focus:outline-none no-spinner"
                                                                            value={editDailyExpenseData.extra_amount}
                                                                            onChange={(e) =>
                                                                                setEditDailyExpenseData(prev => ({
                                                                                    ...prev,
                                                                                    extra_amount: e.target.value
                                                                                }))
                                                                            }
                                                                        />
                                                                    </>
                                                                ) : (
                                                                    <div className="w-[120px] h-[40px] flex flex-col justify-center leading-tight cursor-default">
                                                                        <span>
                                                                            {Number((row.amount || 0) + (row.extra_amount || 0)).toLocaleString("en-IN")}
                                                                        </span>
                                                                        <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-black text-white text-xs rounded p-2 z-50 shadow-lg whitespace-nowrap">
                                                                            Amount: {Number(row.amount || 0).toLocaleString('en-IN')} <br />
                                                                            Extra Amount: {Number(row.extra_amount || 0).toLocaleString('en-IN')}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                {editingDailyExpenseRowId === row.id ? (
                                                                    <div className="w-[20px] h-[40px] flex items-center justify-center text-gray-500 text-sm">
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-[20px] h-[40px] flex items-center gap-2">
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
                                                                    <button onClick={() => handleFileUploadClick(row)} className="cursor-pointer" title="Upload File" >
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
                                                    <td className="py-2">
                                                        {editingDailyExpenseRowId === row.id ? (
                                                            <Select
                                                                name="type"
                                                                value={(isChangeButtonActive ? expensesCategory : weeklyTypes).find(option =>
                                                                    (isChangeButtonActive ? option.category : option.type) === editDailyExpenseData.type
                                                                ) ? {
                                                                    value: editDailyExpenseData.type,
                                                                    label: editDailyExpenseData.type
                                                                } : null}
                                                                onChange={(selectedOption) => {
                                                                    setEditDailyExpenseData(prev => ({
                                                                        ...prev,
                                                                        type: selectedOption ? selectedOption.value : ""
                                                                    }));
                                                                }}
                                                                options={(isChangeButtonActive ? expensesCategory : weeklyTypes).map((type, index) => ({
                                                                    value: isChangeButtonActive ? type.category : type.type,
                                                                    label: isChangeButtonActive ? type.category : type.type
                                                                }))}
                                                                placeholder="Select"
                                                                isSearchable={true}
                                                                isClearable={true}
                                                                className="w-[165px]"
                                                                menuPortalTarget={document.body}
                                                                styles={{
                                                                    control: (provided, state) => ({
                                                                        ...provided,
                                                                        minHeight: '40px',
                                                                        border: '2px solid rgba(191, 152, 83, 0.25)',
                                                                        borderRadius: '8px',
                                                                        backgroundColor: 'transparent',
                                                                        boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                                                        '&:hover': {
                                                                            border: '2px solid rgba(191, 152, 83, 0.5)'
                                                                        }
                                                                    }),
                                                                    valueContainer: (provided) => ({
                                                                        ...provided,
                                                                        padding: '2px 8px'
                                                                    }),
                                                                    input: (provided) => ({
                                                                        ...provided,
                                                                        margin: '0px'
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
                                                            <div className="w-[120px] h-[40px] flex items-center">
                                                                {row.type}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-2">
                                                        <div className="w-[60px] h-[40px] flex items-center">
                                                            {editingDailyExpenseRowId === row.id ? (
                                                                <input
                                                                    type="number"
                                                                    name="quantity"
                                                                    className="border-2 border-[#BF9853] border-opacity-25 p-1 w-[60px] h-[40px] rounded-lg focus:outline-none no-spinner"
                                                                    value={editDailyExpenseData.quantity || ""}
                                                                    onChange={(e) => setEditDailyExpenseData(prev => ({ ...prev, quantity: e.target.value }))}
                                                                />
                                                            ) : (
                                                                <div className="w-[60px] h-[40px] flex items-center text-center">
                                                                    {row.quantity || ""}
                                                                </div>

                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-2 relative">
                                                        <div className="flex gap-2 w-[80px]">
                                                            {editingDailyExpenseRowId === row.id ? (
                                                                <button className="text-green-600 font-bold text-lg relative z-10" onClick={() => saveEditedExpense(row)}>
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
                                                                    <button onClick={() => handleEditClick(row)}>
                                                                        <img className="w-5 h-4" src={Edit} alt="Edit" />
                                                                    </button>
                                                                )
                                                            )}
                                                            <button onClick={() => handleDailyExpensesDelete(row.id)}>
                                                                <img src={Delete} className="w-5 h-4" alt="Delete" />
                                                            </button>
                                                            <button onClick={() => fetchAuditDetailsForDailyExpense(row.id)}>
                                                                <img src={history} className="w-5 h-4" alt="History" />
                                                            </button>
                                                        </div>
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
                                        {[...refundPayments].map((row, index) => (
                                            <tr key={row.id || index} className="even:bg-[#FAF6ED] odd:bg-[#FFFFFF] text-left">
                                                <td className="px-1 py-2">
                                                    {editingPaymentId === row.id ? (
                                                        (() => {
                                                            let optionsToShow = combinedOptions;
                                                            let placeholderText = "Select Name";
                                                            if (Number(row.labour_id)) {
                                                                optionsToShow = laboursList;
                                                                placeholderText = "Labour Name";
                                                            } else if (Number(row.contractor_id)) {
                                                                optionsToShow = contractorOptions;
                                                                placeholderText = "Contractor Name";
                                                            } else if (Number(row.vendor_id)) {
                                                                optionsToShow = vendorOptions;
                                                                placeholderText = "Vendor Name";
                                                            } else if (Number(row.employee_id)) {
                                                                optionsToShow = employeeOptions;
                                                                placeholderText = "Employee Name";
                                                            }
                                                            const selectedValue =
                                                                optionsToShow.find(opt =>
                                                                    (optionsToShow === laboursList && Number(opt.id) === Number(editRefundPaymentData.labour_id)) ||
                                                                    (optionsToShow === contractorOptions && Number(opt.id) === Number(editRefundPaymentData.contractor_id)) ||
                                                                    (optionsToShow === vendorOptions && Number(opt.id) === Number(editRefundPaymentData.vendor_id)) ||
                                                                    (optionsToShow === employeeOptions && Number(opt.id) === Number(editRefundPaymentData.employee_id))
                                                                ) || null;
                                                            return (
                                                                <Select
                                                                    name="labour_id"
                                                                    className="w-[180px]"
                                                                    placeholder={placeholderText}
                                                                    isSearchable
                                                                    isClearable
                                                                    value={selectedValue}
                                                                    onChange={handleEditRefundLabourChange}
                                                                    options={optionsToShow}
                                                                    menuPortalTarget={document.body}
                                                                    styles={customStyles}
                                                                />
                                                            );
                                                        })()
                                                    ) : (
                                                        <div className="flex items-center justify-between w-full gap-2">
                                                            <div className="truncate pr-2">
                                                                {(() => {
                                                                    const employee = employeeOptions.find(opt => opt.id === Number(row.employee_id));
                                                                    const vendor = vendorOptions.find(opt => opt.id === Number(row.vendor_id));
                                                                    const contractor = contractorOptions.find(opt => opt.id === Number(row.contractor_id));
                                                                    const labour = laboursList.find(opt => opt.id === Number(row.labour_id));
                                                                    const labels = [employee?.label, vendor?.label, contractor?.label, labour?.label].filter(Boolean);
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
                                                <td className=" py-2 text-center">
                                                    {editingPaymentId === row.id ? (
                                                        <input
                                                            type="number"
                                                            name="amount"
                                                            value={editRefundPaymentData.amount}
                                                            onChange={handleEditRefundChange}
                                                            className="border-2 border-[#BF9853] border-opacity-25 rounded-lg w-[90px] h-[40px] text-center focus:outline-none no-spinner"
                                                            min="0"
                                                            step="any"
                                                            onWheel={(e) => e.preventDefault()}
                                                        />
                                                    ) : (
                                                        Number(row.amount).toLocaleString("en-IN")
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="flex">
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
                                                        <button onClick={() => fetchAuditDetailsForRefundPaymentReceived(row.id)} className="pl-3">
                                                            <img src={history} className="w-5 h-4" alt="History" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td className="py-2 text-left flex items-center gap-2">
                                                <div>
                                                    <Select
                                                        name="labour_id"
                                                        className="w-[265px] text-left"
                                                        placeholder={isRefundChangeButtonActive ? "Vendor/Contractor" : "Labour Name"}
                                                        isSearchable
                                                        isClearable
                                                        value={
                                                            isRefundChangeButtonActive
                                                                ? combinedOptions.find(opt =>
                                                                    (opt.type === "Employee" && opt.id === Number(newRefundReceived.employee_id)) ||
                                                                    (opt.type === "Vendor" && opt.id === Number(newRefundReceived.vendor_id)) ||
                                                                    (opt.type === "Contractor" && opt.id === Number(newRefundReceived.contractor_id))
                                                                ) || null
                                                                : laboursList.find(opt => opt.id === Number(newRefundReceived.labour_id)) || null
                                                        }
                                                        onChange={(selectedOption) => {
                                                            if (selectedOption) {
                                                                const { type, id, label } = selectedOption;
                                                                setNewRefundReceived(prev => ({
                                                                    ...prev,
                                                                    labour_id: type === "Labour" ? id : "",
                                                                    vendor_id: type === "Vendor" ? id : "",
                                                                    contractor_id: type === "Contractor" ? id : "",
                                                                    employee_id: type === "Employee" ? id : "",
                                                                }));
                                                            } else {
                                                                setNewRefundReceived(prev => ({
                                                                    ...prev,
                                                                    labour_id: "",
                                                                    vendor_id: "",
                                                                    contractor_id: "",
                                                                    employee_id: "",
                                                                }));
                                                            }
                                                        }}
                                                        onKeyDown={handleKeyDown}
                                                        options={isRefundChangeButtonActive ? combinedOptions : laboursList}
                                                        styles={customStyles}
                                                        menuPortalTarget={document.body}
                                                    />
                                                </div>
                                                <div>
                                                    <button onClick={handleRefundChangeButtonClick}>
                                                        <img src={Change} className={`w-4 h-4 ${isRefundChangeButtonActive ? 'opacity-10' : ''}`} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className=" py-2">
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
                                        </tr>
                                    </tbody>
                                </table>
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
                                    <div className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full bg-gray-50">
                                        {description}
                                    </div>
                                )}
                            </label>
                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    onClick={() => {
                                        setShowPopups(false);
                                        setEntryId(null);
                                        setDescription("");
                                    }}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                                {entryId && (
                                    <button
                                        onClick={handleUpdate}
                                        disabled={loading}
                                        className={`px-4 py-2 rounded-lg ${loading
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700'
                                            } text-white`}
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
                                    {currentFileRow?.file_url ? 'Update File' : 'Upload File'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <AuditModal show={showWeeklyPaymentExpensesModal} onClose={() => setShowWeeklyPaymentExpensesModal(false)} audits={weeklyPaymentExpensesAudits} laboursList={laboursList} contractorOptions={contractorOptions}
                    siteOptions={siteOptions} vendorOptions={vendorOptions} employeeOptions={employeeOptions} />
                <AuditModalWeeklyPaymentsReceived show={showWeeklyPaymentReceivedModal} onClose={() => setShowWeeklyPaymentReceivedModal(false)}
                    audits={weeklyPaymentReceivedAudits} laboursList={laboursList} />
                {/* Purpose Selection Popup */}
                {showPurposePopup && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                setShowPurposePopup(false);
                                setSelectedPurpose(null);
                                setPendingRefundData(null);
                            }
                        }}
                        tabIndex={0}
                    >
                        <div className="bg-white rounded-xl shadow-lg p-6 w-[500px]">
                            <h3 className="text-lg font-semibold mb-4 text-center">
                                Select Purpose for Refund
                            </h3>
                            <div className="mb-4">
                                <label className="block mb-2 text-sm font-medium">
                                    Purpose <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    name="purpose"
                                    className="w-full"
                                    placeholder="Select Purpose"
                                    isSearchable
                                    isClearable
                                    value={selectedPurpose}
                                    onChange={(selectedOption) => setSelectedPurpose(selectedOption)}
                                    options={purposeOptions}
                                    menuPortalTarget={document.body}
                                    styles={{
                                        control: (provided, state) => ({
                                            ...provided,
                                            minHeight: '45px',
                                            border: '2px solid rgba(191, 152, 83, 0.25)',
                                            borderRadius: '8px',
                                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                            '&:hover': {
                                                border: '2px solid rgba(191, 152, 83, 0.5)'
                                            }
                                        }),
                                        valueContainer: (provided) => ({
                                            ...provided,
                                            padding: '2px 8px'
                                        }),
                                        input: (provided) => ({
                                            ...provided,
                                            margin: '0px'
                                        }),
                                        indicatorSeparator: () => ({
                                            display: 'none'
                                        }),
                                        indicatorsContainer: (provided) => ({
                                            ...provided,
                                            height: '45px',
                                            gap: '0px'
                                        }),
                                        clearIndicator: (provided) => ({
                                            ...provided,
                                            padding: '2px'
                                        }),
                                        dropdownIndicator: (provided) => ({
                                            ...provided,
                                            padding: '2px'
                                        }),
                                        menuPortal: (provided) => ({
                                            ...provided,
                                            zIndex: 9999
                                        }),
                                        menu: (provided) => ({
                                            ...provided,
                                            zIndex: 9999
                                        })
                                    }}
                                />
                            </div>
                            {pendingRefundData && (
                                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Refund Details:</p>
                                    <p className="text-sm">Amount: ₹{Number(pendingRefundData.amount).toLocaleString('en-IN')}</p>
                                    <p className="text-sm">Date: {formatDateOnly(pendingRefundData.date)}</p>
                                </div>
                            )}
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowPurposePopup(false);
                                        setSelectedPurpose(null);
                                        setPendingRefundData(null);
                                    }}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePurposeSelection}
                                    disabled={!selectedPurpose}
                                    className={`px-4 py-2 rounded-lg ${!selectedPurpose
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700'
                                        } text-white`}
                                >
                                    Submit Refund
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </body >
    )
}
export default DailyPayment;
const AuditModal = ({ show, onClose, audits, laboursList, siteOptions, vendorOptions, employeeOptions, contractorOptions }) => {
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
        { oldKey: "old_labour_id", newKey: "new_labour_id", label: "Labour Name", width: "150px", lookup: laboursList },
        { oldKey: "old_employee_id", newKey: "new_employee_id", label: "Employee Name", width: "150px", lookup: employeeOptions },
        { oldKey: "old_vendor_id", newKey: "new_vendor_id", label: "Vendor Name", width: "150px", lookup: vendorOptions },
        { oldKey: "old_contractor_id", newKey: "new_contractor_id", label: "Contractor Name", width: "150px", lookup: contractorOptions },
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
            (field.oldKey?.includes("labour_id") || field.oldKey?.includes("vendor_id") || field.oldKey?.includes("contractor_id") || field.oldKey?.includes("employee_id") || field.oldKey?.includes("transfer_site_id") ||
                field.newKey?.includes("labour_id") || field.newKey?.includes("vendor_id") || field.newKey?.includes("contractor_id") || field.newKey?.includes("employee_id") || field.newKey?.includes("transfer_site_id")) &&
            String(value) === "0"
        ) {
            return "-";
        }
        if (field.lookup) {
            if (field.label.includes("Vendor")) {
                return getNameById(value, vendorOptions || []);
            } else if (field.label.includes("Contractor")) {
                return getNameById(value, contractorOptions || []);
            } else if (field.label.includes("Labour")) {
                return getNameById(value, laboursList || []);
            } else if (field.label.includes("Employee")) {
                return getNameById(value, employeeOptions || []);
            } else {
                return getNameById(value, field.lookup);
            }
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
                                                className={`whitespace-nowrap overflow-hidden text-ellipsis px-2 ${changed ? "bg-[#BF9853] font-bold" : ""
                                                    }`} >
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
const AuditModalWeeklyPaymentsReceived = ({ show, onClose, audits, laboursList }) => {
    if (!show) return null;
    const getNameById = (id, options) => {
        if (!id && id !== 0) return "-";
        const found = options.find(opt => String(opt.id) === String(id));
        return found ? found.label : id;
    };
    const fields = [
        { oldKey: "old_date", newKey: "new_date", label: "Date", width: "120px" },
        { oldKey: "old_amount", newKey: "new_amount", label: "Amount", width: "100px" },
        { oldKey: "old_labour_id", newKey: "new_labour_id", label: "Labour Name", width: "150px", lookup: laboursList },
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
            (field.oldKey?.includes("labour_id") || field.oldKey?.includes("transfer_site_id") ||
                field.newKey?.includes("labour_id") || field.newKey?.includes("transfer_site_id")) &&
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