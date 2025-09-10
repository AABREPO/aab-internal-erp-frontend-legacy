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
import { e } from 'mathjs';
import NotesStart from '../Images/notes _start.png';
import NotesEnd from '../Images/notes_end.png';
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
        file_url: ""
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
    const [currentFileRow, setCurrentFileRow] = useState(null);
    const [selectedFileForPopup, setSelectedFileForPopup] = useState(null);
    useEffect(() => {
        fetchWeeklyReceivedType();
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
            console.log('Error fetching Payment Received type.');
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
            console.log('Error fetching category.');
        }
    };
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
    // Sorting functions
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
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
            // Default sorting: Most recent entries first (by date descending)
            sortableData.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB - dateA; // Descending order (newest first)
            });
        }
        return sortableData;
    }, [dailyExpenses, sortConfig, laboursList, siteOptions, isChangeButtonActive, combinedOptions, employeeOptions, vendorOptions, contractorOptions]);
    const getCurrentWeekNumber = () => {
        const date = new Date();
        const firstJan = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date - firstJan) / (24 * 60 * 60 * 1000));
        return Math.ceil((days + firstJan.getDay() + 1) / 7);
    };
    const currentWeekNumber = getCurrentWeekNumber();
    const startYear = 2000; // Change if needed
    const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
    const [newRefundReceived, setNewRefundReceived] = useState({
        date: new Date().toISOString().split("T")[0],
        labour_id: "",
        amount: ""
    });
    const [editRefundPaymentData, setEditRefundPaymentData] = useState({
        labour_id: "",
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
            description: row.description || "",
            file_url: row.file_url || ""
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
            labour_id: row.labour_id,
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
    const handleEditRefundLabourChange = (selected) => {
        setEditRefundPaymentData((prev) => ({
            ...prev,
            labour_id: selected ? selected.id : "",
        }));
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
            console.log('Error fetching Labour names.');
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
    const handleRefundSubmit = async () => {
        try {
            const payload = {
                date: selectedDate,
                labour_id: newRefundReceived.labour_id,
                amount: Number(newRefundReceived.amount),
                weekly_number: Number(currentWeekNumber),
            };
            const response = await axios.post(
                "https://backendaab.in/aabuildersDash/api/refund_received/save",
                payload,
                { headers: { "Content-Type": "application/json" } }
            );
            window.location.reload();
            // Reset form after save
            setNewRefundReceived({
                labour_id: null,
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
    const handleChangeButtonClick = () => {
        setIsChangeButtonActive(prev => !prev);
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
            };
            const isChanged = Object.keys(payload).some(
                (key) => String(payload[key]) !== String(row[key] ?? "")
            );
            if (!isChanged) {
                console.log("No changes detected. Skipping update.");
                setEditingDailyExpenseRowId(null);
                return;
            }
            const response = await axios.put(
                `https://backendaab.in/aabuildersDash/api/daily-payments/edit/${row.id}?username=${encodeURIComponent(username)}`,
                payload,
                { headers: { "Content-Type": "application/json" } }
            );
            // ✅ Update UI without reload
            setDailyExpenses((prev) =>
                prev.map((exp) => (exp.id === row.id ? { ...exp, ...payload } : exp))
            );
            setEditingDailyExpenseRowId(null); // exit edit mode
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
    const saveEditedRefundPayment = async (id) => {
        try {
            await axios.put(
                `https://backendaab.in/aabuildersDash/api/refund_received/edit/${id}?username=${encodeURIComponent(username)}`,
                editRefundPaymentData
            );
            // Update UI immediately
            setRefundPayments((prev) =>
                prev.map((row) =>
                    row.id === id ? { ...row, ...editRefundPaymentData } : row
                )
            );
            setEditingPaymentId(null); // exit edit mode
            console.log("Refund payment updated successfully");
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
                alert("An error occurred while deleting the Contractor Name.");
            }
        } else {
            console.log("Deletion cancelled.");
        }
    };
    const handleRefundPaymentsDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete This Refund Received Data?");
        if (confirmed) {
            try {
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
                (newDailyExpense.vendor_id && Number(newDailyExpense.vendor_id) > 0);

            if (!hasAnyId || !newDailyExpense.project_id || !newDailyExpense.type || !newDailyExpense.amount) {
                alert("Please select all requried details.");
                return;
            }
            // ✅ Save Daily Entry
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
            // ✅ Save Weekly Expense "meta row" (amount will be recalculated in backend)
            const expenseForBackend = {
                date: selectedDate,
                contractor_id: contractorOptions.find(opt => opt.label === "Company Labour")?.id || null,
                vendor_id: null,
                project_id: siteOptions.find(opt => opt.label === "Daily Wage")?.id || null,
                type: "Daily",
                amount: 0, // 🔹 always 0 → backend will recalc sum
                weekly_number: currentWeekNumber,
                status: false,
            };
            await axios.post(
                "https://backendaab.in/aabuildersDash/api/weekly-expenses/save-daily",
                expenseForBackend,
                { headers: { "Content-Type": "application/json" } }
            );
            // ✅ Refresh UI
            await handleDateClick(selectedDate);
            window.location.reload();
            // ✅ Reset form
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
            setSelectedWeek(weeks[weeks.length - 1].number); // default last week
        }
    }, [weeks]);
    const getCurrentWeekDays = () => {
        const today = new Date();
        const dayOfWeek = today.getDay() || 7; // make Sunday = 7
        const monday = new Date(today);
        monday.setDate(today.getDate() - dayOfWeek + 1); // back to Monday
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            days.push(d);
        }
        return days;
    };
    // Generate 7 days if week selected (your existing code)
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
    // Auto select today's date ONCE when component mounts
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
        // empty dependency array → only run once
        // DO NOT put currentWeekDays in deps
    }, []);
    // format helper
    const formatDate = (date) =>
        date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const handleDateClick = async (dateStr) => {
        setSelectedDate(dateStr);
        setNewDailyExpense((prev) => ({ ...prev, date: dateStr }));
        try {
            // Fetch daily expenses
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
    // ✅ get today's date
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
    const totalAmount = dailyExpenses
        .filter(row => row.date === selectedDate)        // only current date rows
        .reduce((sum, row) => sum + (Number(row.amount || 0) + Number(row.extra_amount || 0)), 0);
    const totalRefund = refundPayments
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const totalExpenses =
        expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const totalPayments = payments
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const overAllTotalPayments = (totalPayments + totalRefund);
    const netBalance = totalAmount - totalRefund;
    const balance = totalPayments - expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    // PDF Generation function for the left side expenses table
    const generateExpensesPDF = () => {
        if (!selectedDate || dailyExpenses.length === 0) {
            alert("No data available to generate PDF");
            return;
        }
        const doc = new jsPDF();
        // Add header with PS number, title, date and day
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        // Get day name
        const dateObj = new Date(selectedDate);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
        // Calculate center position for the header
        const pageWidth = doc.internal.pageSize.width;
        const headerText = `PS: ${currentWeekNumber}`;
        const headerText1 = "DAILY PAYMENT STATEMENT";
        const headerText2 = `${formatDateOnly(selectedDate)}`;
        const headerWidth = doc.getTextWidth(headerText);
        const headerX = (pageWidth - headerWidth) / 2;
        doc.text(headerText1, 60, 24);
        doc.text(headerText2, 170, 20);
        doc.text(headerText, 14, 20);
        // Add day name below
        doc.setFontSize(10);
        const dayText = dayName;
        const dayWidth = doc.getTextWidth(dayText);
        doc.text(dayText, 170, 27);
        // Add lines above and below
        doc.setLineWidth(0.5);
        doc.line(14, 15, pageWidth - 14, 15); // Line above
        doc.line(14, 30, pageWidth - 14, 30); // Line below
        // Reset font
        doc.setFont(undefined, 'normal');
        // Calculate total amount for selected date
        const filteredExpenses = sortedDailyExpenses.filter(row => row.date === selectedDate);
        const totalAmount = filteredExpenses.reduce(
            (sum, row) => sum + ((row.amount || 0) + (row.extra_amount || 0)),
            0
        );
        // Calculate total refund amount for selected date
        const totalRefundAmount = refundPayments.reduce(
            (sum, row) => sum + Number(row.amount || 0),
            0
        );
        // Reset color for table
        doc.setTextColor(0, 0, 0);
        // Expenses table columns (removed Date column)
        const expensesTableColumn = [
            "SNO", "PROJECT NAME", "NAME", "QTY", "TYPE", "AMOUNT", "DESCRIPTION"
        ];
        // Prepare expenses with projectName and type for sorting
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
            // Sort by projectName ASC, then by type DESC
            .sort((a, b) => {
                const projectCompare = a.projectName.localeCompare(b.projectName);
                if (projectCompare !== 0) return projectCompare;
                return b.type.localeCompare(a.type); // type DESC
            })
            // Map to array format for autoTable
            .map((row, idx) => [
                (idx + 1).toString(),
                row.projectName,
                row.name,
                row.quantity.toString(),
                row.type,
                row.amount,
                row.description
            ]);
        // Add total row for expenses
        expensesTableRows.push([
            "",
            "TOTAL",
            "",
            "",
            "",
            `${totalAmount.toLocaleString('en-IN').replace(/\u202F/g, ',')}`,
            ""
        ]);
        // Add Expenses table heading
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('WAGE EXPENSES', 14, 48);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('EXPENDITURE PAYMENTS', 14, 38);
        // Start expenses table
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
                fillColor: [255, 248, 220], // Light orange color
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                lineColor: [200, 200, 200],
                lineWidth: 0.1,
            },
            columnStyles: {
                0: { cellWidth: 13, halign: 'center', fillColor: [255, 255, 255] },    // SNO - white background
                1: { cellWidth: 47, halign: 'left' },      // Project Name
                2: { cellWidth: 30, halign: 'left' },      // Name
                3: { cellWidth: 12, halign: 'center' },    // Qty
                4: { cellWidth: 25, halign: 'left' },      // Type
                5: { cellWidth: 20, halign: 'right' },     // Amount
                6: { cellWidth: 35, halign: 'left' }       // Description
            },
            bodyStyles: {
                lineWidth: 0.1,
            },
            alternateRowStyles: {
                fillColor: false,
            }
        });
        // Get the end position of the first table
        const firstTableEndY = doc.lastAutoTable.finalY;
        // Add some space between tables
        const spaceBetweenTables = 10;
        // Refund Received table columns
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
        // Add total row for refunds
        refundTableRows.push([
            "",
            "TOTAL",
            `${totalRefundAmount.toLocaleString('en-IN').replace(/\u202F/g, ',')}`
        ]);
        const netBalance = totalAmount - totalRefundAmount;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`NET BALANCE: ${netBalance.toLocaleString('en-IN')}`, 155, 38);
        // Add Refund Received table heading
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('WAGE REFUND', 14, firstTableEndY + spaceBetweenTables - 2);
        // Add Refund Received table
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
                fillColor: [255, 248, 220], // Light orange color
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
                0: { cellWidth: 15, halign: 'center', fillColor: [255, 255, 255] },    // SNS - white background
                1: { cellWidth: 50, halign: 'left' },      // Name
                2: { cellWidth: 25, halign: 'right' }      // Amount
            }
        });
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
            // Find the current expense data to preserve all existing fields
            const currentExpense = dailyExpenses.find(exp => exp.id === entryId);
            if (!currentExpense) {
                throw new Error("Expense not found");
            }
            // Create payload with all existing data plus the new description
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
            // Use the same API endpoint as saveEditedExpense
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
            // Update the local state to reflect the change
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
            const siteNo = project?.siteNo || ""; // use siteNo if available, fallback to label
            // Find matching name from whichever id exists
            const name =
                laboursList.find(opt => opt.id === Number(currentFileRow.labour_id))?.label ||
                vendorOptions.find(opt => opt.id === Number(currentFileRow.vendor_id))?.label ||
                contractorOptions.find(opt => opt.id === Number(currentFileRow.contractor_id))?.label ||
                employeeOptions.find(opt => opt.id === Number(currentFileRow.employee_id))?.label ||
                "";
            const formData = new FormData();
            const finalName = `${formatDateOnly(currentFileRow.date)}-${siteNo}-${name}`;
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
            // Update the row with the new file URL while preserving all existing data
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
            // Update UI without reload
            setDailyExpenses((prev) =>
                prev.map((exp) => (exp.id === currentFileRow.id ? { ...exp, file_url: pdfUrl } : exp))
            );
            // Close popup and reset state
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
                    <div className="mt-6 flex">
                        <div>
                            <h2 className="font-semibold">Table Data (Week {currentWeekNumber})</h2>
                        </div>
                        <div>
                            {selectedDate && <p>Selected day: {formatDateOnly(selectedDate)}</p>}
                        </div>
                    </div>
                </div>
                <div className="mr-5">
                    <button onClick={generateExpensesPDF} className='font-semibold mt-4 mr-5 hover:text-[#E4572E]'>Report</button>
                </div>
            </div>
            <div className="mt-4 flex justify-end mr-6">
                <h1 className="font-bold text-xl">
                    Net Balance:<span style={{ color: "#E4572E" }}>{Number(netBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2, })}</span>
                </h1>
            </div>
            <div className="mx-auto w-auto p-6 border-collapse bg-[#FFFFFF] ml-[30px] mr-6 rounded-md">
                {/* EXPENSES TABLE */}
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
                        <div className="w-full h-[600px] rounded-lg border-l-8 border-l-[#BF9853] overflow-hidden ">
                            {/* Single Table with Scrollable Container */}
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
                                                        <button
                                                            className="font-semibold text-[25px]"
                                                            onClick={() => setShowExtraAmount(prev => !prev)}
                                                            type="button"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    {/* Conditionally render extra input */}
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
                                                    <select
                                                        name="type"
                                                        value={newDailyExpense.type}
                                                        menuPortalTarget={document.body}
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
                                                <td className="py-2">
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
                                                <td>
                                                </td>
                                            </tr>
                                        ) : null}
                                    </thead>
                                    <tbody>
                                        {/* Editable Expense rows */}
                                        {sortedDailyExpenses
                                            .filter(row => row.date === selectedDate) // only rows for selected date
                                            .reverse()
                                            .map((row, index) => (
                                                <tr key={row.id} className="even:bg-[#FFFFFF] odd:bg-[#FAF6ED] text-left">
                                                    <td className="py-2 font-bold text-left">{dailyExpenses.length - index}</td>
                                                    {/* Contractor / Vendor column */}
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
                                                            // Show label in view mode
                                                            <div className="w-[180px] h-[40px] flex items-center">
                                                                {(() => {
                                                                    const employee = employeeOptions.find(opt => opt.id === Number(row.employee_id));
                                                                    const vendor = vendorOptions.find(opt => opt.id === Number(row.vendor_id));
                                                                    const contractor = contractorOptions.find(opt => opt.id === Number(row.contractor_id));
                                                                    const labour = laboursList.find(opt => opt.id === Number(row.labour_id));
                                                                    // Collect all non-empty labels
                                                                    const labels = [employee?.label, vendor?.label, contractor?.label, labour?.label].filter(Boolean);
                                                                    return labels.length > 0 ? labels.join(" | ") : "";
                                                                })()}
                                                            </div>
                                                        )}
                                                    </td>
                                                    {/* Project column */}
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
                                                            // Show label in view mode
                                                            <div className="w-[220px] h-[40px] flex items-center">
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
                                                                        {/* Tooltip on hover */}
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
                                                    </td>
                                                    <td className="py-2">
                                                        {editingDailyExpenseRowId === row.id ? (
                                                            <select
                                                                name="type"
                                                                className="border-2 border-[#BF9853] border-opacity-25 bg-transparent p-1 w-[120px] text-left h-[40px] rounded-lg focus:outline-none"
                                                                value={editDailyExpenseData.type}
                                                                onChange={(e) =>
                                                                    setEditDailyExpenseData(prev => ({ ...prev, type: e.target.value }))
                                                                }
                                                            >
                                                                <option value="">Select</option>
                                                                {(isChangeButtonActive ? expensesCategory : weeklyTypes).map((type, index) => (
                                                                    <option key={index} value={isChangeButtonActive ? type.category : type.type}>
                                                                        {isChangeButtonActive ? type.category : type.type}
                                                                    </option>
                                                                ))}
                                                            </select>
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
                                                            {/* Edit Button */}
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
                                                            {/* Delete Button */}
                                                            <button onClick={() => handleDailyExpensesDelete(row.id)}>
                                                                <img src={Delete} className="w-5 h-4" alt="Delete" />
                                                            </button>
                                                            {/* History Button */}
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
                            <div className="w-full rounded-lg border-l-8 border-l-[#BF9853] overflow-x-auto" style={{ maxHeight: "400px" }}>
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
                                                        <Select
                                                            name="labour_id"
                                                            className="w-[180px]"
                                                            placeholder="Labour Name"
                                                            isSearchable
                                                            isClearable
                                                            value={laboursList.find(opt => opt.id === editRefundPaymentData.labour_id) || null}
                                                            onChange={handleEditRefundLabourChange}
                                                            options={laboursList}
                                                            menuPortalTarget={document.body}
                                                            styles={customStyles}
                                                        />
                                                    ) : (
                                                        laboursList.find(opt => opt.id === Number(row.labour_id))?.label || ""
                                                    )}
                                                </td>
                                                <td className=" py-2">
                                                    {editingPaymentId === row.id ? (
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
                                            <td className=" py-2 text-left">
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
            </div>
        </body >
    )
}
export default DailyPayment
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
        // If vendor, contractor, labour, employee or transfer site is 0, show "-"
        if (
            (field.oldKey?.includes("labour_id") || field.oldKey?.includes("vendor_id") || field.oldKey?.includes("contractor_id") || field.oldKey?.includes("employee_id") || field.oldKey?.includes("transfer_site_id") ||
                field.newKey?.includes("labour_id") || field.newKey?.includes("vendor_id") || field.newKey?.includes("contractor_id") || field.newKey?.includes("employee_id") || field.newKey?.includes("transfer_site_id")) &&
            String(value) === "0"
        ) {
            return "-";
        }
        if (field.lookup) {
            // Handle different lookup types based on field label
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
        // If vendor or transfer site is 0, show "-"
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