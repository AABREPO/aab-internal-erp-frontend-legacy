import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import Edit from '../Images/Edit.svg';
import Delete from '../Images/Delete.svg';
import history from '../Images/History.svg';
import Select from 'react-select';
import fileUpload from '../Images/FileUpload.svg';
import file from '../Images/FileView.svg';
import download from '../Images/file_download.png'
import Change from '../Images/dropdownchange.png'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { type } from '@testing-library/user-event/dist/type';
import { e, re } from 'mathjs';
import NotesStart from '../Images/TextUpload.svg';
import NotesEnd from '../Images/TextView.svg';
import ExtraFeild from '../Images/ExtraFeild.svg';
import ExtraFeildClose from '../Images/ExtraFeildClose.svg';
import FileRemover from '../Images/FileRemover.svg';
import {
    DATABASE_TABLE_FILTER_SELECT_STYLES,
    EDBC_IDS,
    EdbcColumnHeader,
    EdbcEmptyFilterCell,
    EdbcFilterToggleButton,
    EdbcProjectNameFilter,
    EdbcSelectFilter,
    EdbcTableBodyRow,
    EdbcTableFilterRow,
    EdbcTableHeaderRow,
    EdbcTableToolbarRightActions,
    EdbcTextInputFilter,
    EdbcTotalAmountFilter,
    EDBC_TABLE_EDGE_TABLE_CLASS,
    EDBC_FILTER_CONTROL_BOX_STYLE,
    formatEdbcTotalAmountPlaceholder,
    getEdbcColumnConfig,
    getEdbcColumnHeaderSortProps,
    matchesEdbcAmountFilter,
    matchesWeeklyPaymentExpenseOverallSearch,
} from '../ExpensesEntry/databaseExpensesSharedColumns';
import { useLiveDataSync } from '../../utils/useLiveDataSync';

const CASH_REGISTER_SELECT_STYLES = {
    ...DATABASE_TABLE_FILTER_SELECT_STYLES,
    clearIndicator: (provided) => ({
        ...DATABASE_TABLE_FILTER_SELECT_STYLES.clearIndicator(provided),
        color: '#000000',
    }),
    dropdownIndicator: (provided, state) => ({
        ...DATABASE_TABLE_FILTER_SELECT_STYLES.dropdownIndicator(provided),
        color: '#000000',
        display: state.hasValue && state.selectProps.isClearable ? 'none' : 'flex',
    }),
};

const DailyPayment = ({ username, userRoles = [], onExportActionsReady, isTabActive = true }) => {
    const resolveActiveBranchId = () => {
        try {
            const selectedBranchId = localStorage.getItem("selectedBranchId");
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const fallbackBranchId = user?.branchId ?? user?.branch_id ?? user?.brachId;
            const resolved = Number(selectedBranchId || fallbackBranchId);
            return Number.isFinite(resolved) && resolved > 0 ? resolved : null;
        } catch {
            return null;
        }
    };
    const resolveEnteredBy = () => {
        const propUsername = typeof username === 'string' ? username.trim() : '';
        if (propUsername) return propUsername;
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            return user?.name || user?.username || user?.userName || '';
        } catch {
            return '';
        }
    };
    const enteredBy = resolveEnteredBy();
    const canRemoveFileUrl = username === 'Admin' || username === 'Mahalingam M';
    const [activeBranchId, setActiveBranchId] = useState(() => resolveActiveBranchId());
    const withBranchUrl = useCallback((baseUrl) => {
        const url = new URL(baseUrl);
        if (activeBranchId !== null && activeBranchId !== undefined && activeBranchId !== "") {
            url.searchParams.set("branchId", String(activeBranchId));
        }
        return url.toString();
    }, [activeBranchId]);
    const withBranchParams = useCallback(() => (
        activeBranchId !== null && activeBranchId !== undefined && activeBranchId !== ""
            ? { params: { branchId: activeBranchId } }
            : {}
    ), [activeBranchId]);
    useEffect(() => {
        const syncBranch = () => {
            const nextBranchId = resolveActiveBranchId();
            setActiveBranchId((prevBranchId) => (prevBranchId === nextBranchId ? prevBranchId : nextBranchId));
        };
        syncBranch();
        window.addEventListener("branchSelectionChanged", syncBranch);
        return () => window.removeEventListener("branchSelectionChanged", syncBranch);
    }, []);
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
        type: "",
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
    const [weeklyReceivedTypes, setWeeklyReceivedTypes] = useState([]);
    const [isChangeButtonActive, setIsChangeButtonActive] = useState(false);
    /** Labour vs Vendor/Contractor/Employee toggle — only for the row currently being edited (independent from new entry). */
    const [isEditChangeButtonActive, setIsEditChangeButtonActive] = useState(false);
    const [isRefundChangeButtonActive, setIsRefundChangeButtonActive] = useState(false);
    const [currentFileRow, setCurrentFileRow] = useState(null);
    const [selectedFileForPopup, setSelectedFileForPopup] = useState(null);
    const [removedFileUrlRows, setRemovedFileUrlRows] = useState({});
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
            const response = await fetch('https://backendaab.in/demoAabuildersDash/api/weekly_received_types/getAll');
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
            const response = await fetch('https://backendaab.in/demoAabuildersDash/api/loan-purposes/getAll', {
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
            const response = await fetch('https://backendaab.in/demoAabuilderDash/api/expenses_categories/getAll');
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
    const [selectQuantity, setSelectQuantity] = useState('');
    const [overallSearch, setOverallSearch] = useState('');
    const [refundOverallSearch, setRefundOverallSearch] = useState('');
    const [showRefundFilters, setShowRefundFilters] = useState(false);
    const [selectRefundName, setSelectRefundName] = useState('');
    const [selectRefundAmount, setSelectRefundAmount] = useState('');
    const [refundSortConfig, setRefundSortConfig] = useState({ key: null, direction: 'asc' });
    // Click and drag scrolling functionality
    const scrollRef = useRef(null);
    const isDragging = useRef(false);
    const start = useRef({ x: 0, y: 0 });
    const scroll = useRef({ left: 0, top: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const animationFrame = useRef(null);
    const lastMove = useRef({ time: 0, x: 0, y: 0 });
    /** Do not start drag-to-scroll when interacting with form fields (mouse selection would scroll the table). */
    const isScrollDragExcludedTarget = (target) => {
        if (!target || typeof target.closest !== 'function') return false;
        return Boolean(
            target.closest(
                [
                    'input',
                    'textarea',
                    'select',
                    'button',
                    'option',
                    'a[href]',
                    'label',
                    '[contenteditable="true"]',
                    '[role="combobox"]',
                    '[role="searchbox"]',
                    '[role="textbox"]',
                    '[role="listbox"]',
                    '[role="option"]'
                ].join(', ')
            )
        );
    };
    // Move laboursList state declaration here, before it's used in sortedDailyExpenses
    const [laboursList, setLaboursList] = useState([]);
    const handleMouseDown = (e, ref) => {
        if (!ref.current) return;
        if (isScrollDragExcludedTarget(e.target)) return;
        if (e.button !== 0) return;
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
        setSelectQuantity('');
        setOverallSearch('');
    };
    const clearRefundFilters = () => {
        setRefundOverallSearch('');
        setSelectRefundName('');
        setSelectRefundAmount('');
    };

    const getVendorName = (id) =>
        vendorOptions.find(v => String(v.id) === String(id))?.value || "";

    const getContractorName = (id) =>
        contractorOptions.find(c => String(c.id) === String(id))?.value || "";

    const getEmployeeName = (id) =>
        employeeOptions.find(e => String(e.id) === String(id))?.value || "";

    const getRefundRowName = (row) => {
        const employee = getEmployeeName(row.employee_id);
        const vendor = getVendorName(row.vendor_id);
        const contractor = getContractorName(row.contractor_id);
        const labour = laboursList.find(opt => String(opt.id) === String(row.labour_id))?.label || "";
        return [employee, vendor, contractor, labour].filter(Boolean).join(", ") || "";
    };

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
            if (selectQuantity.trim()) {
                if (!String(entry.quantity ?? '').toLowerCase().includes(selectQuantity.toLowerCase().trim())) return false;
            }
            if (!matchesWeeklyPaymentExpenseOverallSearch(entry, overallSearch, {
                formatDateOnly: (dateString) => {
                    if (!dateString) return '';
                    const d = new Date(dateString);
                    if (Number.isNaN(d.getTime())) return '';
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = d.getFullYear();
                    return `${day}-${month}-${year}`;
                },
                getPartyName: (exp) =>
                    exp.vendor_id
                        ? getVendorName(exp.vendor_id)
                        : exp.contractor_id
                            ? getContractorName(exp.contractor_id)
                            : exp.employee_id
                                ? getEmployeeName(exp.employee_id)
                                : exp.labour_id
                                    ? laboursList.find(l => l.id === Number(exp.labour_id))?.label || ""
                                    : "",
                getProjectName: (exp) => getSiteName(exp.project_id) || '',
            })) {
                return false;
            }
            return true; // passes all filters
        });
    }, [dailyExpenses, selectDate, selectContractororVendorName, selectProjectName, selectType, selectQuantity, overallSearch, vendorOptions, contractorOptions, employeeOptions, siteOptions, laboursList]);

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
    const refundNameFilterOptions = React.useMemo(() => {
        const names = new Set();
        const options = [];
        refundPayments.forEach((row) => {
            const name = getRefundRowName(row);
            if (name && !names.has(name)) {
                names.add(name);
                options.push({ value: name, label: name });
            }
        });
        return options;
    }, [refundPayments, laboursList, vendorOptions, contractorOptions, employeeOptions]);
    const filteredRefundPayments = refundPayments.filter((row) => {
        if (refundOverallSearch.trim()) {
            const q = refundOverallSearch.toLowerCase().trim();
            const name = getRefundRowName(row).toLowerCase();
            if (!name.includes(q) && !String(row.amount || '').includes(q)) return false;
        }
        if (selectRefundName) {
            if (getRefundRowName(row).toLowerCase() !== selectRefundName.toLowerCase()) return false;
        }
        if (selectRefundAmount.trim()) {
            if (!matchesEdbcAmountFilter(row.amount, selectRefundAmount)) return false;
        }
        return true;
    });
    const handleRefundSort = (key) => {
        let direction = 'asc';
        if (refundSortConfig.key === key && refundSortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setRefundSortConfig({ key, direction });
    };
    const refundEdbcSortFieldMap = {
        refund_name: 'vendor',
        amount: 'amount',
    };
    const refundEdbcHandleSort = (field) => {
        const reverseMap = {
            vendor: 'refund_name',
            amount: 'amount',
        };
        handleRefundSort(reverseMap[field] || field);
    };
    const refundEdbcSortProps = getEdbcColumnHeaderSortProps(
        refundEdbcSortFieldMap[refundSortConfig.key] || refundSortConfig.key || '',
        refundSortConfig.direction,
        refundEdbcHandleSort
    );
    const sortedRefundPayments = React.useMemo(() => {
        const sortableData = [...filteredRefundPayments];
        if (refundSortConfig.key) {
            sortableData.sort((a, b) => {
                let aValue;
                let bValue;
                switch (refundSortConfig.key) {
                    case 'refund_name':
                        aValue = getRefundRowName(a);
                        bValue = getRefundRowName(b);
                        break;
                    case 'amount':
                        aValue = Number(a.amount || 0);
                        bValue = Number(b.amount || 0);
                        break;
                    default:
                        return 0;
                }
                if (aValue < bValue) return refundSortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return refundSortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableData;
    }, [filteredRefundPayments, refundSortConfig, laboursList, vendorOptions, contractorOptions, employeeOptions]);
    // Sorting functions
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    const edbcSortFieldMap = {
        labour_name: 'vendor',
        project_name: 'siteName',
        amount: 'amount',
        type: 'accountType',
        quantity: 'quantity',
    };
    const edbcHandleSort = (field) => {
        const reverseMap = {
            vendor: 'labour_name',
            siteName: 'project_name',
            amount: 'amount',
            accountType: 'type',
            quantity: 'quantity',
        };
        handleSort(reverseMap[field] || field);
    };
    const edbcSortProps = getEdbcColumnHeaderSortProps(
        edbcSortFieldMap[sortConfig.key] || sortConfig.key || '',
        sortConfig.direction,
        edbcHandleSort
    );
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
                    case 'labour_name': {
                        const getNameSortValue = (row) => {
                            const hasNonLabour =
                                Number(row.vendor_id) > 0 ||
                                Number(row.contractor_id) > 0 ||
                                Number(row.employee_id) > 0;
                            if (hasNonLabour) {
                                const employee = employeeOptions.find(opt => opt.id === Number(row.employee_id));
                                const vendor = vendorOptions.find(opt => opt.id === Number(row.vendor_id));
                                const contractor = contractorOptions.find(opt => opt.id === Number(row.contractor_id));
                                return employee?.label || vendor?.label || contractor?.label || "";
                            }
                            return laboursList.find(opt => opt.id === Number(row.labour_id))?.label || "";
                        };
                        aValue = getNameSortValue(a);
                        bValue = getNameSortValue(b);
                        break;
                    }
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
    }, [filteredExpenses, sortConfig, laboursList, siteOptions, combinedOptions, employeeOptions, vendorOptions, contractorOptions]);
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
    const getWeekCacheKey = useCallback((baseKey) => {
        const branchKey = activeBranchId ?? "all";
        // cache should vary by "today" so it naturally refreshes each week/day
        const todayKey = formatLocalISODate(new Date());
        return `${baseKey}::${branchKey}::${todayKey}`;
    }, [activeBranchId]);
    const readCachedActiveWeek = useCallback(() => {
        try {
            const raw = sessionStorage.getItem(getWeekCacheKey("cashRegisterActiveWeek"));
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            const maxAgeMs = 5 * 60 * 1000; // 5 minutes
            if (!parsed || !parsed.week || !parsed.ts) return null;
            if (Date.now() - parsed.ts > maxAgeMs) return null;
            return Number(parsed.week);
        } catch {
            return null;
        }
    }, [getWeekCacheKey]);
    const writeCachedActiveWeek = useCallback((week) => {
        try {
            sessionStorage.setItem(
                getWeekCacheKey("cashRegisterActiveWeek"),
                JSON.stringify({ week: Number(week), ts: Date.now() })
            );
        } catch {
            // ignore
        }
    }, [getWeekCacheKey]);
    const formatLocalISODate = (date) => {
        const d = date instanceof Date ? date : new Date(date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    };
    const parseLocalISODate = (value) => {
        if (!value || typeof value !== "string") return null;
        const [y, m, d] = value.split("-").map((part) => Number(part));
        if (!y || !m || !d) return null;
        return new Date(y, m - 1, d);
    };
    const actualCurrentWeekNumber = getISOWeekNumber(new Date());
    const nextCalendarWeekNumber = getISOWeekNumber(new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)));
    const [activeWeekNumber, setActiveWeekNumber] = useState(actualCurrentWeekNumber);
    const operationalWeekNumber = activeWeekNumber || actualCurrentWeekNumber;
    // Calculate week number from a specific date (not current date)
    const getWeekNumberFromDate = (dateString) => {
        if (!dateString) return operationalWeekNumber;
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
    const currentWeekNumber = operationalWeekNumber;
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
    const getEditChangeModeFromRow = (row) => {
        const v = Number(row.vendor_id) || 0;
        const c = Number(row.contractor_id) || 0;
        const e = Number(row.employee_id) || 0;
        return v > 0 || c > 0 || e > 0;
    };
    const handleEditClick = (row) => {
        setEditingDailyExpenseRowId(row.id);
        setIsEditChangeButtonActive(getEditChangeModeFromRow(row));
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
    function getStartAndEndDateOfISOWeek(weekNumber, year) {
        const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
        let dayOfWeek = simple.getDay();
        if (dayOfWeek === 0) {
            dayOfWeek = 7;
        }
        const ISOweekStart = new Date(simple);
        ISOweekStart.setDate(simple.getDate() - dayOfWeek + 1);
        const ISOweekEnd = new Date(ISOweekStart);
        ISOweekEnd.setDate(ISOweekStart.getDate() + 6);
        ISOweekStart.setHours(0, 0, 0, 0);
        ISOweekEnd.setHours(23, 59, 59, 999);
        return {
            number: weekNumber,
            // use local YYYY-MM-DD (avoid UTC shift that can turn Monday into Sunday)
            start: formatLocalISODate(ISOweekStart),
            end: formatLocalISODate(ISOweekEnd),
        };
    }
    const determineActiveWeekNumber = useCallback(async () => {
        if (!actualCurrentWeekNumber) return;
        // Optimistic fast path: use cached week immediately if available
        const cachedWeek = readCachedActiveWeek();
        if (cachedWeek && Number.isFinite(cachedWeek)) {
            setActiveWeekNumber(cachedWeek);
            return;
        }
        const previousWeekNumber = actualCurrentWeekNumber === 1 ? 52 : actualCurrentWeekNumber - 1;
        try {
            const [prevExpensesRes, prevPaymentsRes] = await Promise.all([
                fetch(withBranchUrl(`https://backendaab.in/demoAabuildersDash/api/weekly-expenses/week/${previousWeekNumber}`)),
                fetch(withBranchUrl(`https://backendaab.in/demoAabuildersDash/api/payments-received/week/${previousWeekNumber}`))
            ]);
            const prevExpensesData = prevExpensesRes.ok ? await prevExpensesRes.json() : [];
            const prevPaymentsData = prevPaymentsRes.ok ? await prevPaymentsRes.json() : [];
            const hasPreviousWeekData =
                (Array.isArray(prevExpensesData) && prevExpensesData.length > 0) ||
                (Array.isArray(prevPaymentsData) && prevPaymentsData.length > 0);
            const previousClosed =
                (Array.isArray(prevExpensesData) && prevExpensesData.some((e) => e?.status === true)) ||
                (Array.isArray(prevPaymentsData) && prevPaymentsData.some((p) => p?.status === true));
            if (hasPreviousWeekData && !previousClosed) {
                setActiveWeekNumber(previousWeekNumber);
                writeCachedActiveWeek(previousWeekNumber);
                return;
            }
            const [currExpensesRes, currPaymentsRes] = await Promise.all([
                fetch(withBranchUrl(`https://backendaab.in/demoAabuildersDash/api/weekly-expenses/week/${actualCurrentWeekNumber}`)),
                fetch(withBranchUrl(`https://backendaab.in/demoAabuildersDash/api/payments-received/week/${actualCurrentWeekNumber}`))
            ]);
            const currExpensesData = currExpensesRes.ok ? await currExpensesRes.json() : [];
            const currPaymentsData = currPaymentsRes.ok ? await currPaymentsRes.json() : [];
            const currentClosed =
                (Array.isArray(currExpensesData) && currExpensesData.some((e) => e?.status === true)) ||
                (Array.isArray(currPaymentsData) && currPaymentsData.some((p) => p?.status === true));
            setActiveWeekNumber(currentClosed ? nextCalendarWeekNumber : actualCurrentWeekNumber);
            writeCachedActiveWeek(currentClosed ? nextCalendarWeekNumber : actualCurrentWeekNumber);
        } catch {
            setActiveWeekNumber(actualCurrentWeekNumber);
            writeCachedActiveWeek(actualCurrentWeekNumber);
        }
    }, [actualCurrentWeekNumber, nextCalendarWeekNumber, withBranchUrl]);
    const fetchExpenses = useCallback(() => {
        if (!currentWeekNumber) return;
        fetch(withBranchUrl(`https://backendaab.in/demoAabuildersDash/api/weekly-expenses/week/${currentWeekNumber}`))
            .then((res) => res.json())
            .then(setExpenses)
            .catch(console.error);
    }, [currentWeekNumber, withBranchUrl]);
    const fetchPayments = useCallback(() => {
        if (!currentWeekNumber) return;
        fetch(withBranchUrl(`https://backendaab.in/demoAabuildersDash/api/payments-received/week/${currentWeekNumber}`))
            .then((res) => res.json())
            .then((data) => {
                // Filter out records where type is "Handover"
                const filtered = data.filter((payment) => payment.type !== "Handover");
                setPayments(filtered);
            })
            .catch(console.error);
    }, [currentWeekNumber, withBranchUrl]);
    const fetchRefundPayments = useCallback(() => {
        if (!currentWeekNumber) return;
        fetch(withBranchUrl(`https://backendaab.in/demoAabuildersDash/api/refund_received/getAll`))
            .then((res) => res.json())
            .then((data) => {
                setAllRefundAmount(data);
            })
            .catch(console.error);
    }, [currentWeekNumber, withBranchUrl]);
    useEffect(() => {
        determineActiveWeekNumber();
    }, [determineActiveWeekNumber]);
    const fetchDailyDataForSelectedDate = useCallback(async (dateStr) => {
        if (!dateStr) return;
        try {
            const [dailyRes, refundRes] = await Promise.all([
                axios.get(`https://backendaab.in/demoAabuildersDash/api/daily-payments/date/${dateStr}`, withBranchParams()),
                axios.get(`https://backendaab.in/demoAabuildersDash/api/refund_received/date/${dateStr}`, withBranchParams())
            ]);
            setDailyExpenses(dailyRes.data);
            setRefundPayments(refundRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            setDailyExpenses([]);
            setRefundPayments([]);
        }
    }, [withBranchParams]);
    const refreshCashRegisterData = useCallback(async () => {
        fetchPayments();
        fetchExpenses();
        fetchRefundPayments();
        if (selectedDate) {
            await fetchDailyDataForSelectedDate(selectedDate);
        }
    }, [fetchPayments, fetchExpenses, fetchRefundPayments, selectedDate, fetchDailyDataForSelectedDate]);
    useLiveDataSync(
        refreshCashRegisterData,
        Boolean(
            editingDailyExpenseRowId ||
            editingPaymentId ||
            showPurposePopup ||
            fileUploadPopup ||
            showPopups ||
            !isTabActive
        )
    );
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
        if (!dateString) return '';
        if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString.trim())) {
            const d = parseLocalISODate(dateString.trim());
            if (!d || Number.isNaN(d.getTime())) return '';
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}-${month}-${year}`;
        }
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return '';
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
            const response = await fetch('https://backendaab.in/demoAabuildersDash/api/labours-details/getAll');
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
            const response = await fetch('https://backendaab.in/demoAabuildersDash/api/weekly_types/getAll');
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
    const getWeeklyExpenseTypeId = useCallback((typeLabel) => {
        if (typeLabel === null || typeLabel === undefined || String(typeLabel).trim() === "") return null;
        const found = weeklyTypes.find((t) => t && t.type === typeLabel);
        if (!found) return null;
        const id = found.id;
        return id !== undefined && id !== null && !Number.isNaN(Number(id)) ? Number(id) : null;
    }, [weeklyTypes]);
    useEffect(() => {
        const fetchVendorNames = async () => {
            try {
                const response = await fetch("https://backendaab.in/demoAabuilderDash/api/vendor_Names/getAll", {
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
                    category: item.category || "",
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
                const response = await fetch("https://backendaab.in/demoAabuildersDash/api/employee_details/basic/getAll", {
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
                const response = await fetch("https://backendaab.in/demoAabuilderDash/api/contractor_Names/getAll", {
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
                    category: item.category || "",
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
                const response = await fetch("https://backendaab.in/demoAabuilderDash/api/project_Names/getAll", {
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
                const response = await axios.get('https://backendaab.in/demoAabuildersDash/api/payments-received/active_weeks', withBranchParams());
                const currentYear = new Date().getFullYear();
                const list = Array.isArray(response.data) ? response.data : [];
                const enrichedWeeks = list
                    .map((w) => getStartAndEndDateOfISOWeek(Number(w), currentYear))
                    .filter((row) => row && Number.isFinite(Number(row.number)));
                setWeeks(enrichedWeeks);
            } catch (error) {
                console.error('Error fetching active weeks:', error);
            }
        };
        fetchWeeks();
    }, [withBranchParams]);
    const handleInputChange = (e) => {
        setNewDailyExpense((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
    const handleLabourChange = (selected) => {
        setNewRefundReceived(prev => ({
            ...prev,
            labour_id: selected ? selected.id : ""
        }));
    };
    // Function to get the last entry number from staff-advance API
    const getLastEntryNumber = async () => {
        try {
            const response = await axios.get("https://backendaab.in/demoAabuildersDash/api/staff-advance/all");
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
            branch_id: activeBranchId,
        };
        const response = await fetch(`https://backendaab.in/demoAabuildersDash/api/loans/${loanPortalId}?editedBy=${encodeURIComponent(username)}`, {
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
        let resolvedEntryNo = entry_no;
        if (resolvedEntryNo == null || resolvedEntryNo === "") {
            try {
                const response = await axios.get("https://backendaab.in/demoAabuildersDash/api/staff-advance/all");
                const allData = Array.isArray(response.data) ? response.data : [];
                const staffRecord = allData.find(
                    (item) =>
                        String(item.staffAdvancePortalId ?? item.staff_advance_portal_id ?? item.id) ===
                        String(staffAdvancePortalId)
                );
                resolvedEntryNo = staffRecord?.entry_no ?? null;
            } catch (error) {
                console.warn("Could not resolve staff advance entry_no:", error);
            }
        }
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
            entry_no: resolvedEntryNo,
            branch_id: activeBranchId,
        };
        const response = await fetch(
            `https://backendaab.in/demoAabuildersDash/api/staff-advance/${staffAdvancePortalId}?editedBy=${encodeURIComponent(username)}`,
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
                    entry_no: entryNo,
                    branch_id: activeBranchId,
                    entered_by: enteredBy,
                    source: "Cash Register",
                };
                const staffAdvanceResponse = await axios.post(
                    "https://backendaab.in/demoAabuildersDash/api/staff-advance/save",
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
                    staff_advance_portal_id: staffAdvancePortalId,
                    branch_id: activeBranchId,
                    entered_by: enteredBy,
                };
                await axios.post(
                    "https://backendaab.in/demoAabuildersDash/api/refund_received/save",
                    refundPayload,
                    { headers: { "Content-Type": "application/json" } }
                );
            } else if (isVendorOrContractorRefund) {
                setPendingRefundData({
                    date: selectedDate,
                    vendor_id: Number(newRefundReceived.vendor_id) || null,
                    contractor_id: Number(newRefundReceived.contractor_id) || null,
                    amount: Number(newRefundReceived.amount),
                    weekly_number: Number(currentWeekNumber),
                    branch_id: activeBranchId
                });
                setShowPurposePopup(true);
                return;
            } else {
                alert("Please select a labour, employee, vendor, or contractor for the refund.");
                return;
            }
            await refreshCashRegisterData();
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
                file_url: "",
                source: "Cash Register",
                branch_id: activeBranchId,
                entered_by: enteredBy,
            };
            const loanPortalResponse = await axios.post(
                "https://backendaab.in/demoAabuildersDash/api/loans/save",
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
                loan_portal_id: loanPortalResponse.data?.id || loanPortalResponse.data?.loanPortalId,
                branch_id: activeBranchId,
                entered_by: enteredBy,
            };
            await axios.post(
                "https://backendaab.in/demoAabuildersDash/api/refund_received/save",
                refundPayload,
                { headers: { "Content-Type": "application/json" } }
            );
            setShowPurposePopup(false);
            setSelectedPurpose(null);
            setPendingRefundData(null);
            await refreshCashRegisterData();
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
    const handleEditChangeButtonClick = () => {
        setIsEditChangeButtonActive((prev) => !prev);
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
                type_id: getWeeklyExpenseTypeId(editDailyExpenseData.type),
                amount: Number(editDailyExpenseData.amount),
                extra_amount: Number(editDailyExpenseData.extra_amount || 0),
                description: editDailyExpenseData.description || "",
                file_url: editDailyExpenseData.file_url || null,  // 🔹 send url here
                staff_advance_portal_id: editDailyExpenseData.staff_advance_portal_id || null,
                branch_id: row.branch_id ?? row.branchId ?? activeBranchId ?? null,
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
                            `https://backendaab.in/demoAabuildersDash/api/staff-advance/${row.staff_advance_portal_id}`,
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
                        entry_no: entryNo,
                        branch_id: activeBranchId,
                        entered_by: enteredBy,
                        source: "Cash Register",
                    };
                    const staffAdvanceResponse = await axios.post(
                        "https://backendaab.in/demoAabuildersDash/api/staff-advance/save",
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
                        file_url: editDailyExpenseData.file_url || null,
                        branch_id: row.branch_id ?? row.branchId ?? activeBranchId ?? null,
                    };
                    await axios.put(
                        `https://backendaab.in/demoAabuildersDash/api/staff-advance/${row.staff_advance_portal_id}?editedBy=${encodeURIComponent(username)}`,
                        staffAdvanceUpdatePayload,
                        { headers: { "Content-Type": "application/json" } }
                    );
                } catch (error) {
                    console.error("Error updating staff advance portal amount:", error);
                }
            }
            if (!isChanged) {
                setEditingDailyExpenseRowId(null);
                setIsEditChangeButtonActive(false);
                return;
            }
            const response = await axios.put(
                `https://backendaab.in/demoAabuildersDash/api/daily-payments/edit/${row.id}?username=${encodeURIComponent(username)}`,
                payload,
                { headers: { "Content-Type": "application/json" } }
            );
            setDailyExpenses((prev) =>
                prev.map((exp) => (exp.id === row.id ? { ...exp, ...payload } : exp))
            );
            setEditingDailyExpenseRowId(null);
            setIsEditChangeButtonActive(false);
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
                        file_url: null,
                        branch_id: refundData?.branch_id ?? refundData?.branchId ?? activeBranchId ?? null,
                    };
                    await axios.put(
                        `https://backendaab.in/demoAabuildersDash/api/staff-advance/${refundData.staff_advance_portal_id}?editedBy=${encodeURIComponent(username)}`,
                        staffAdvanceUpdatePayload,
                        { headers: { "Content-Type": "application/json" } }
                    );
                } catch (error) {
                    console.error("Error updating staff advance portal for refund:", error);
                }
            }
            const refundPayload = {
                labour_id: editRefundPaymentData.labour_id ? Number(editRefundPaymentData.labour_id) : null,
                vendor_id: editRefundPaymentData.vendor_id ? Number(editRefundPaymentData.vendor_id) : null,
                contractor_id: editRefundPaymentData.contractor_id ? Number(editRefundPaymentData.contractor_id) : null,
                employee_id: editRefundPaymentData.employee_id ? Number(editRefundPaymentData.employee_id) : null,
                amount: Number(editRefundPaymentData.amount),
                branch_id: refundData?.branch_id ?? refundData?.branchId ?? activeBranchId ?? null,
            };
            await axios.put(
                `https://backendaab.in/demoAabuildersDash/api/refund_received/edit/${id}?username=${encodeURIComponent(username)}`,
                refundPayload
            );
            setRefundPayments((prev) =>
                prev.map((row) =>
                    row.id === id ? { ...row, ...refundPayload } : row
                )
            );
            setEditingPaymentId(null);
        } catch (error) {
            console.error("Error updating refund payment:", error);
        }
    };
    const fetchAuditDetailsForDailyExpense = async (expensesId) => {
        try {
            const response = await fetch(`https://backendaab.in/demoAabuildersDash/api/daily_entry_audit/daily_expense/${expensesId}`);
            const data = await response.json();
            setWeeklyPaymentExpensesAudits(data);
            setShowWeeklyPaymentExpensesModal(true);
        } catch (error) {
            console.error("Error fetching audit details:", error);
        }
    };
    const fetchAuditDetailsForRefundPaymentReceived = async (receivedId) => {
        try {
            const response = await fetch(`https://backendaab.in/demoAabuildersDash/api/daily_entry_audit/refund/${receivedId}`);
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
                        await clearStaffAdvancePortalEntry(
                            expenseData.staff_advance_portal_id,
                            expenseData.date,
                            expenseData.entry_no
                        );
                    } catch (error) {
                        console.error("Error clearing staff advance portal for daily expense:", error);
                        alert("Failed to clear the associated Staff Advance Portal entry. Please try again.");
                        return;
                    }
                }
                const response = await fetch(`https://backendaab.in/demoAabuildersDash/api/daily-payments/delete/${id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    alert("Daily Expenses deleted successfully!!!");
                    if (String(editingDailyExpenseRowId) === String(id)) {
                        setEditingDailyExpenseRowId(null);
                        setIsEditChangeButtonActive(false);
                    }
                    await refreshCashRegisterData();
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
                const response = await fetch(`https://backendaab.in/demoAabuildersDash/api/refund_received/delete/${id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    alert("Refund Received deleted successfully!!!");
                    await refreshCashRegisterData();
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
                    entry_no: entryNo,
                    branch_id: activeBranchId,
                    entered_by: enteredBy,
                    source: "Cash Register",
                };
                const staffAdvanceResponse = await axios.post(
                    "https://backendaab.in/demoAabuildersDash/api/staff-advance/save",
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
                    type_id: getWeeklyExpenseTypeId(newDailyExpense.type),
                    amount: Number(newDailyExpense.amount),
                    extra_amount: newDailyExpense.extra_amount ? Number(newDailyExpense.extra_amount) : 0,
                    weekly_number: Number(currentWeekNumber),
                    staff_advance_portal_id: staffAdvancePortalId,
                    branch_id: activeBranchId,
                    entered_by: enteredBy,
                };
                await axios.post(
                    "https://backendaab.in/demoAabuildersDash/api/daily-payments/save",
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
                    branch_id: activeBranchId,
                    entered_by: enteredBy,
                };
                await axios.post(
                    "https://backendaab.in/demoAabuildersDash/api/weekly-expenses/save-daily",
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
                    type_id: getWeeklyExpenseTypeId(newDailyExpense.type),
                    amount: Number(newDailyExpense.amount),
                    extra_amount: newDailyExpense.extra_amount ? Number(newDailyExpense.extra_amount) : 0,
                    weekly_number: Number(currentWeekNumber),
                    branch_id: activeBranchId,
                    entered_by: enteredBy,
                };
                await axios.post(
                    "https://backendaab.in/demoAabuildersDash/api/daily-payments/save",
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
                    branch_id: activeBranchId,
                    entered_by: enteredBy,
                };
                await axios.post(
                    "https://backendaab.in/demoAabuildersDash/api/weekly-expenses/save-daily",
                    expenseForBackend,
                    { headers: { "Content-Type": "application/json" } }
                );
            }
            await refreshCashRegisterData();
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
            const preferredWeek = Number(currentWeekNumber);
            const hasPreferred = weeks.some((w) => Number(w.number) === preferredWeek);
            setSelectedWeek(hasPreferred ? preferredWeek : weeks[weeks.length - 1].number);
        } else {
            setSelectedWeek("");
            setSelectedDate(null);
            setDailyExpenses([]);
            setRefundPayments([]);
            setExpenses([]);
            setPayments([]);
            setAllRefundAmount([]);
        }
    }, [weeks, currentWeekNumber]);
    // Must match `currentWeekNumber` (same as "Week {n}" / PS) — do not use `weeks.find(selectedWeek).start`
    // or the strip can lag one week behind when `selectedWeek` has not caught up yet.
    const displayedWeekDays = useMemo(() => {
        const wn = Number(currentWeekNumber);
        if (!wn || !Number.isFinite(wn)) return [];
        const year = new Date().getFullYear();
        const { start } = getStartAndEndDateOfISOWeek(wn, year);
        const startDate = parseLocalISODate(start) ?? new Date(start);
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + i);
            days.push(day);
        }
        return days;
    }, [currentWeekNumber]);
    const displayedWeekDaysKey = useMemo(
        () => displayedWeekDays.map((d) => formatLocalISODate(d)).join('|'),
        [displayedWeekDays]
    );
    // Keep selected day inside the 7 dates shown for the current week (week number already comes from branch logic).
    useEffect(() => {
        if (!displayedWeekDays.length) return;
        const dayKeys = displayedWeekDays.map((d) => formatLocalISODate(d));
        const todayStr = formatLocalISODate(new Date());
        const matchedDay = displayedWeekDays.find((d) => formatLocalISODate(d) === todayStr);
        const defaultDate = formatLocalISODate(matchedDay ?? displayedWeekDays[0]);
        setSelectedDate((prev) => (prev && dayKeys.includes(prev) ? prev : defaultDate));
        setNewDailyExpense((prev) => ({
            ...prev,
            date: prev.date && dayKeys.includes(prev.date) ? prev.date : defaultDate,
        }));
    }, [activeBranchId, currentWeekNumber, selectedWeek, displayedWeekDaysKey]);
    useEffect(() => {
        if (!selectedDate) return;
        fetchDailyDataForSelectedDate(selectedDate);
    }, [selectedDate, fetchDailyDataForSelectedDate]);
    const formatDate = (date) =>
        date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const handleDateClick = async (dateStr) => {
        setSelectedDate(dateStr);
        setNewDailyExpense((prev) => ({ ...prev, date: dateStr }));
    };
    const today = formatLocalISODate(new Date());
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
                fetch('https://backendaab.in/demoAabuildersDash/api/staff-advance/all'),
                fetch('https://backendaab.in/demoAabuildersDash/api/loans/all')
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
                type_id: getWeeklyExpenseTypeId(currentExpense.type),
                amount: Number(currentExpense.amount),
                extra_amount: Number(currentExpense.extra_amount || 0),
                description: description.trim(),
                file_url: currentExpense.file_url || null,
                branch_id: currentExpense.branch_id ?? currentExpense.branchId ?? activeBranchId ?? null,
            };
            await axios.put(
                `https://backendaab.in/demoAabuildersDash/api/daily-payments/edits/${entryId}?username=${encodeURIComponent(username)}`,
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
                second: "2-digit",
                hour12: true
            })
                .replace(",", "")
                .replace(/\s/g, "-");
            const formData = new FormData();
            const finalName = `${timestamp}-${siteNo}-${name}`;
            formData.append("files", selectedFileForPopup);
            formData.append("folder", "FileUpload / Daily_Cash_Register");
            formData.append("fileName", finalName);
            const uploadResponse = await fetch(
                "https://backendaab.in/demoAabuildersDash/api/files/upload",
                {
                    method: "POST",
                    body: formData,
                }
            );
            if (!uploadResponse.ok) {
                throw new Error("File upload failed");
            }
            const uploadResult = await uploadResponse.json();
            const pdfUrl = uploadResult.urls[0];
            const payload = {
                date: currentFileRow.date,
                labour_id: Number(currentFileRow.labour_id) || null,
                vendor_id: Number(currentFileRow.vendor_id) || null,
                contractor_id: Number(currentFileRow.contractor_id) || null,
                employee_id: Number(currentFileRow.employee_id) || null,
                project_id: Number(currentFileRow.project_id),
                quantity: Number(currentFileRow.quantity) || 0,
                type: currentFileRow.type,
                type_id: getWeeklyExpenseTypeId(currentFileRow.type),
                amount: Number(currentFileRow.amount),
                extra_amount: Number(currentFileRow.extra_amount || 0),
                description: currentFileRow.description || "",
                file_url: pdfUrl,
                branch_id: currentFileRow.branch_id ?? currentFileRow.branchId ?? activeBranchId ?? null,
            };
            const response = await axios.put(
                `https://backendaab.in/demoAabuildersDash/api/daily-payments/edit/${currentFileRow.id}?username=${encodeURIComponent(username)}`,
                payload,
                { headers: { "Content-Type": "application/json" } }
            );
            setDailyExpenses((prev) =>
                prev.map((exp) => (exp.id === currentFileRow.id ? { ...exp, file_url: pdfUrl } : exp))
            );
            setRemovedFileUrlRows((prev) => {
                const next = { ...prev };
                delete next[currentFileRow.id];
                return next;
            });
            setFileUploadPopup(false);
            setCurrentFileRow(null);
            setSelectedFileForPopup(null);
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Error during file upload. Please try again.");
        }
    };
    const handleRemoveFileUrl = async (row) => {
        if (!row?.id) return;
        const shouldRemove = window.confirm('Remove attached file?');
        if (!shouldRemove) return;
        try {
            const response = await fetch(
                `https://backendaab.in/demoAabuildersDash/api/daily-payments/${row.id}/remove-file`,
                {
                    method: 'PUT',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(enteredBy || username || ''),
                }
            );
            if (!response.ok) {
                throw new Error('Failed to remove file URL');
            }
            setDailyExpenses((prev) =>
                prev.map((exp) => (exp.id === row.id ? { ...exp, file_url: null } : exp))
            );
            setRemovedFileUrlRows((prev) => ({ ...prev, [row.id]: true }));
            if (currentFileRow?.id === row.id) {
                setCurrentFileRow((prev) => (prev ? { ...prev, file_url: null } : prev));
            }
            alert('File removed successfully!');
        } catch (error) {
            console.error('Error removing file:', error);
            alert('Failed to remove file. Please try again.');
        }
    };
    const handleRestoreFileUrl = async (row) => {
        if (!row?.id) return;
        try {
            const response = await fetch(
                `https://backendaab.in/demoAabuildersDash/api/daily-payments/${row.id}/restore-file`,
                {
                    method: 'PUT',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                }
            );
            if (!response.ok) {
                throw new Error('Failed to restore file URL');
            }
            const restored = await response.json().catch(() => null);
            const restoredUrl = restored?.file_url ?? restored?.fileUrl ?? null;
            setDailyExpenses((prev) =>
                prev.map((exp) =>
                    exp.id === row.id ? { ...exp, file_url: restoredUrl || exp.file_url } : exp
                )
            );
            setRemovedFileUrlRows((prev) => {
                const next = { ...prev };
                delete next[row.id];
                return next;
            });
            if (currentFileRow?.id === row.id && restoredUrl) {
                setCurrentFileRow((prev) => (prev ? { ...prev, file_url: restoredUrl } : prev));
            }
            alert('File restored successfully!');
        } catch (error) {
            console.error('Error restoring file:', error);
            alert('Failed to restore file. Please try again.');
        }
    };
    useEffect(() => {
        if (!onExportActionsReady) return;
        onExportActionsReady({ generatePDF: generateExpensesPDF });
        return () => onExportActionsReady(null);
    }, [onExportActionsReady, generateExpensesPDF]);
    const expensesDstCol21Label = 'S.No';
    const expensesDstCol4Label = isChangeButtonActive ? 'Associate' : 'Labour Name';
    const expensesDstCol3Label = 'Project Name';
    const expensesDstCol8Label = 'Amount';
    const expensesDstCol12Label = 'Type';
    const expensesDstCol7Label = 'Quantity';
    const expensesDstCol20FileLabel = 'File';
    const expensesDstCol20ActivityLabel = 'Activity';
    const expensesFilteredTotal = filteredExpenses
        .filter(row => row.date === selectedDate)
        .reduce((total, expense) => total + Number(expense.amount || 0) + Number(expense.extra_amount || 0), 0);
    const refundDstCol4Label = isRefundChangeButtonActive ? 'Associate' : 'Labour Name';
    const refundDstCol8Label = 'Amount';
    const refundDstCol20Label = 'Activity';
    return (
        <body className="bg-[#FAF6ED] overflow-hidden">
            <div className="flex flex-col h-[calc(100vh-104px)] overflow-hidden bg-[#FAF6ED] px-[18px] pt-[18px] pb-[18px]">
                <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-[#FAF6ED]">
                    <div className="w-full rounded-[6px] bg-white mb-[18px] shrink-0">
                        <div className="flex flex-wrap items-center justify-between text-left">
                            <div className='flex gap-[12px] p-[18px]'>
                                <div className="min-w-0">
                                    <label className="block font-semibold mb-[8px]">Weekly Balance</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={`₹${balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                        className="min-w-0 w-[150px] h-[40px] px-3 text-[#000000] text-left text-[14px] font-semibold bg-[#ededed] border-2 border-[rgba(191,152,83,0.2)] rounded-lg bg-transparent focus:outline-none"
                                    />
                                </div>
                                {displayedWeekDays.length > 0 && (() => {
                                    const selectedDayIndex = displayedWeekDays.findIndex(
                                        (day) => formatLocalISODate(day) === selectedDate
                                    );
                                    return (
                                        <div className="relative flex items-center rounded-lg bg-[#FFFDF9] border border-[#FFEBC9]">
                                            {selectedDayIndex >= 0 && (
                                                <div
                                                    className="absolute top-0 bottom-0 rounded-md bg-[#BF9853] transition-all duration-700 ease-in-out"
                                                    style={{
                                                        width: `${100 / displayedWeekDays.length}%`,
                                                        left: `${(selectedDayIndex * 100) / displayedWeekDays.length}%`,
                                                    }}
                                                />
                                            )}
                                            {displayedWeekDays.map((day, idx) => {
                                                const dateStr = formatLocalISODate(day);
                                                const isSelected = selectedDate === dateStr;
                                                return (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => handleDateClick(dateStr)}
                                                        className={`relative z-10 flex flex-1 flex-col items-center min-w-[73px] pt-[10px] pb-[8px] px-[14px] rounded-md transition-colors duration-300 ${isSelected ? 'text-white' : 'text-black'}`}
                                                    >
                                                        <span className="text-[14px] font-semibold leading-tight">
                                                            {day.toLocaleDateString("en-US", { weekday: "short" })}
                                                        </span>
                                                        <span className="text-[14px] font-semibold leading-tight mt-[2px]">
                                                            {formatDate(day)}
                                                        </span>
                                                        {isSelected && (
                                                            <span className="w-[6px] h-[6px] bg-white rounded-full mt-[6px]" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                            </div>
                            <div className="flex items-center space-x-3 flex-wrap justify-end pr-[18px]">
                                <div
                                    className="rounded-md px-4 py-[8px] text-sm shrink-0"
                                    style={{
                                        backgroundColor: '#FFFDF9',
                                        backgroundImage: [
                                            'repeating-linear-gradient(90deg, #E4572E66 0 3px, transparent 3px 6px)',
                                            'repeating-linear-gradient(90deg, #E4572E66 0 3px, transparent 3px 6px)',
                                            'repeating-linear-gradient(0deg, #E4572E66 0 3px, transparent 3px 6px)',
                                            'repeating-linear-gradient(0deg, #E4572E66 0 3px, transparent 3px 6px)',
                                        ].join(', '),
                                        backgroundSize: '100% 1px, 100% 1px, 1px 100%, 1px 100%',
                                        backgroundPosition: '0 0, 0 100%, 0 0, 100% 0',
                                        backgroundRepeat: 'repeat-x, repeat-x, repeat-y, repeat-y',
                                    }}
                                >
                                    <div className="flex justify-between text-[14px] gap-6 py-0.5">
                                        <span className="flex shrink-0 w-[76px] text-black font-semibold">
                                            <span>Expenses</span>
                                            <span className="ml-auto">:</span>
                                        </span>
                                        <span className="font-semibold" style={{ color: "#E4572E" }}>
                                            ₹{Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[14px] gap-6 py-0.5">
                                        <span className="flex shrink-0 w-[76px] text-black font-semibold">
                                            <span>Refund</span>
                                            <span className="ml-auto">:</span>
                                        </span>
                                        <span className="font-semibold" style={{ color: "#E4572E" }}>
                                            ₹{Number(totalRefund).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[14px] gap-6 py-0.5">
                                        <span className="flex shrink-0 w-[76px] text-black font-semibold">
                                            <span>Balance</span>
                                            <span className="ml-auto">:</span>
                                        </span>
                                        <span className="font-semibold" style={{ color: "#E4572E" }}>
                                            ₹{Number(netBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            <div className="w-full p-[18px] border-collapse bg-[#FFFFFF] rounded-md flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="w-full flex flex-col xl:flex-row gap-[18px] flex-1 min-h-0 overflow-hidden">
                    <div className="flex-1 min-w-0 flex flex-col min-h-0 overflow-hidden">
                        <div className="flex justify-between items-center mb-[8px]">
                            <h1 className="font-bold text-base">Expenses (PS {currentWeekNumber ?? "-"})</h1>
                            <h1 className="font-bold text-base" style={{ color: "#E4572E" }}>
                                ₹{Number(expensesFilteredTotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h1>
                        </div>
                        <div className="text-left flex flex-row justify-between items-center mb-[12px] gap-[6px]">
                            <div className="flex flex-row items-center sm:space-x-3 min-w-0 flex-1 overflow-hidden">
                                <EdbcFilterToggleButton onClick={() => setShowFilters(!showFilters)} />
                            </div>
                            <EdbcTableToolbarRightActions
                                onClearFilters={clearFilters}
                                overallSearch={overallSearch}
                                onOverallSearchChange={setOverallSearch}
                            />
                        </div>
                        <div className="w-full flex-1 min-h-0 rounded-lg border-l-8 border-l-[#BF9853] overflow-hidden">
                            <div ref={scrollRef} className="w-full flex-1 min-h-0 overflow-y-auto overflow-x-hidden h-full no-scrollbar select-none" onMouseDown={(e) => handleMouseDown(e, scrollRef)} onMouseMove={(e) => handleMouseMove(e, scrollRef)}
                                onMouseUp={() => handleMouseUp(scrollRef)} onMouseLeave={() => handleMouseUp(scrollRef)} >
                                <table className={`border-collapse text-left w-full table-fixed ${EDBC_TABLE_EDGE_TABLE_CLASS} [&_thead_tr>th#EDBC-19]:!pr-[1px] [&_tbody_tr>td#EDBC-19]:!pr-[1px] [&_th#EDBC-20]:!w-[70px] [&_td#EDBC-20]:!w-[70px] [&_th#EDBC-20]:!min-w-[70px] [&_td#EDBC-20]:!min-w-[70px] [&_th#EDBC-20]:!max-w-[70px] [&_td#EDBC-20]:!max-w-[70px]`}>
                                    <thead className="sticky top-0 z-10 bg-white">
                                        <EdbcTableHeaderRow>
                                            <EdbcColumnHeader columnId={EDBC_IDS.EDBC21} label={expensesDstCol21Label} />
                                            <EdbcColumnHeader columnId={EDBC_IDS.EDBC4} label={expensesDstCol4Label} sortProps={edbcSortProps} />
                                            <th className="w-[30px] px-[2px] overflow-visible" aria-hidden="true"></th>
                                            <EdbcColumnHeader columnId={EDBC_IDS.EDBC3} label={expensesDstCol3Label} sortProps={edbcSortProps} />
                                            <EdbcColumnHeader columnId={EDBC_IDS.EDBC8} label={expensesDstCol8Label} sortProps={edbcSortProps} />
                                            <th className="w-4 min-w-4 max-w-4 p-0 overflow-visible" aria-hidden="true"></th>
                                            <th className=" w-[66px] font-bold text-center" aria-hidden="true"></th>
                                            <EdbcColumnHeader columnId={EDBC_IDS.EDBC12} label={expensesDstCol12Label} sortProps={edbcSortProps} />
                                            <EdbcColumnHeader columnId={EDBC_IDS.EDBC7} label={expensesDstCol7Label} sortProps={edbcSortProps} />
                                            <EdbcColumnHeader columnId={EDBC_IDS.EDBC20} label={expensesDstCol20FileLabel} />
                                            <EdbcColumnHeader columnId={EDBC_IDS.EDBC20} label={expensesDstCol20ActivityLabel} />
                                        </EdbcTableHeaderRow>
                                        {showFilters && (
                                            <EdbcTableFilterRow>
                                                <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC21} />
                                                <EdbcSelectFilter
                                                    columnId={EDBC_IDS.EDBC4}
                                                    placeholder={expensesDstCol4Label}
                                                    options={contractorVendorFilterOptions}
                                                    value={selectContractororVendorName}
                                                    onChange={setSelectContractororVendorName}
                                                    selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                                                />
                                                <th className=" p-0 overflow-visible"></th>
                                                <EdbcProjectNameFilter
                                                    placeholder={expensesDstCol3Label}
                                                    options={projectFilterOptions}
                                                    value={selectProjectName}
                                                    onChange={setSelectProjectName}
                                                    isClearable
                                                    selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                                                />
                                                <EdbcTotalAmountFilter
                                                    columnId={EDBC_IDS.EDBC8}
                                                    totalAmount={filteredExpenses.filter(row => row.date === selectedDate).reduce((total, expense) => total + Number(expense.amount || 0) + Number(expense.extra_amount || 0), 0)}
                                                />
                                                <th className="w-4 min-w-4 max-w-4 p-0 overflow-visible"></th>
                                                <th className="pl-[6px] w-[66px]"></th>
                                                <EdbcSelectFilter
                                                    columnId={EDBC_IDS.EDBC12}
                                                    placeholder={expensesDstCol12Label}
                                                    options={typeFilterOptions}
                                                    value={selectType}
                                                    onChange={setSelectType}
                                                    selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                                                />
                                                <EdbcTextInputFilter
                                                    columnId={EDBC_IDS.EDBC7}
                                                    placeholder={expensesDstCol7Label}
                                                    value={selectQuantity}
                                                    onChange={(e) => setSelectQuantity(e.target.value)}
                                                />
                                                <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC20} />
                                                <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC20} />
                                            </EdbcTableFilterRow>
                                        )}
                                        {Number(currentWeekNumber) === Number(currentWeekNumber) ? (
                                            <tr className="bg-white border-b border-gray-200 items-center justify-center">
                                                <td id={EDBC_IDS.EDBC21} className={getEdbcColumnConfig(EDBC_IDS.EDBC21)?.tdClass}>{dailyExpenses.length + 1}.</td>
                                                <td id={EDBC_IDS.EDBC4} className={getEdbcColumnConfig(EDBC_IDS.EDBC4)?.tdClass}>
                                                    <div className={getEdbcColumnConfig(EDBC_IDS.EDBC4)?.filterWidthClass}>
                                                        <Select
                                                            name="labour_id"
                                                            className="text-xs focus:outline-none w-full"
                                                            placeholder={expensesDstCol4Label}
                                                            isSearchable
                                                            isClearable
                                                            options={isChangeButtonActive ? combinedOptions : laboursList}
                                                            styles={CASH_REGISTER_SELECT_STYLES}
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
                                                                    const resolvedCategory = selectedOption.category || "";
                                                                    setNewDailyExpense(prev => ({
                                                                        ...prev,
                                                                        labour_id: type === "Labour" ? id : "",
                                                                        vendor_id: type === "Vendor" ? id : "",
                                                                        contractor_id: type === "Contractor" ? id : "",
                                                                        employee_id: type === "Employee" ? id : "",
                                                                        labour_name: label,
                                                                        amount: salary || "",
                                                                        type:
                                                                            type === "Labour"
                                                                                ? "Wage"
                                                                                : (type === "Vendor" || type === "Contractor") && resolvedCategory
                                                                                    ? resolvedCategory
                                                                                    : prev.type
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
                                                </td>
                                                <td className="w-[30px] px-[6px] overflow-visible flex items-center justify-center h-[38px]">
                                                    <button type="button" onClick={handleChangeButtonClick} className="inline-flex items-center justify-center">
                                                        <img src={Change} className={`w-4 h-4 ${isChangeButtonActive ? 'opacity-10' : ''}`} alt="Toggle name type" />
                                                    </button>
                                                </td>
                                                <td id={EDBC_IDS.EDBC3} className={getEdbcColumnConfig(EDBC_IDS.EDBC3)?.tdClass}>
                                                    <div className={getEdbcColumnConfig(EDBC_IDS.EDBC3)?.filterWidthClass}>
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
                                                            className="text-xs focus:outline-none w-full"
                                                            placeholder={expensesDstCol3Label}
                                                            isSearchable
                                                            isClearable
                                                            styles={CASH_REGISTER_SELECT_STYLES}
                                                        />
                                                    </div>
                                                </td>
                                                <td id={EDBC_IDS.EDBC8} className={getEdbcColumnConfig(EDBC_IDS.EDBC8)?.tdClass}>
                                                    <div className={getEdbcColumnConfig(EDBC_IDS.EDBC8)?.filterWidthClass}>
                                                        <input
                                                            type="number"
                                                            name="amount"
                                                            style={EDBC_FILTER_CONTROL_BOX_STYLE}
                                                            className={`${getEdbcColumnConfig(EDBC_IDS.EDBC8)?.inputClassName || ''} no-spinner`}
                                                            placeholder={expensesDstCol8Label}
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
                                                </td>
                                                <td className="overflow-visible flex items-center justify-center h-[38px]">
                                                    <button onClick={() => setShowExtraAmount(prev => !prev)} type="button" className="inline-flex  pl-[6px] items-center justify-center h-4 w-4 shrink-0">
                                                        <img src={showExtraAmount ? ExtraFeildClose : ExtraFeild} className={`h-4 w-4 min-h-4 min-w-4 max-h-4 max-w-4 shrink-0 object-contain origin-center ${showExtraAmount ? 'scale-[1.375]' : ''}`} alt="Extra" />
                                                    </button>
                                                </td>
                                                <td className="pl-[6px] w-[66px] text-center">
                                                    {showExtraAmount && (
                                                        <div className="w-[60px]">
                                                            <input
                                                                type="number"
                                                                name="extra_amount"
                                                                style={EDBC_FILTER_CONTROL_BOX_STYLE}
                                                                className={`${getEdbcColumnConfig(EDBC_IDS.EDBC8)?.inputClassName || ''} no-spinner !w-[60px]`}
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
                                                <td id={EDBC_IDS.EDBC12} className={getEdbcColumnConfig(EDBC_IDS.EDBC12)?.tdClass}>
                                                    <div className={getEdbcColumnConfig(EDBC_IDS.EDBC12)?.filterWidthClass}>
                                                        <Select
                                                            name="type"
                                                            className="text-xs focus:outline-none w-full"
                                                            value={newDailyExpense.type ? { value: newDailyExpense.type, label: newDailyExpense.type } : null}
                                                            onChange={(selectedOption) => handleInputChange({ target: { name: 'type', value: selectedOption ? selectedOption.value : '' } })}
                                                            options={(isChangeButtonActive ? expensesCategory : weeklyTypes).map((type) => ({
                                                                value: isChangeButtonActive ? type.category : type.type,
                                                                label: isChangeButtonActive ? type.category : type.type,
                                                            }))}
                                                            placeholder={expensesDstCol12Label}
                                                            isSearchable
                                                            isClearable
                                                            menuPortalTarget={document.body}
                                                            styles={CASH_REGISTER_SELECT_STYLES}
                                                        />
                                                    </div>
                                                </td>
                                                <td id={EDBC_IDS.EDBC7} className={getEdbcColumnConfig(EDBC_IDS.EDBC7)?.tdClass}>
                                                    <div className={getEdbcColumnConfig(EDBC_IDS.EDBC7)?.filterWidthClass}>
                                                        <input
                                                            type="number"
                                                            name="quantity"
                                                            style={EDBC_FILTER_CONTROL_BOX_STYLE}
                                                            className={`${getEdbcColumnConfig(EDBC_IDS.EDBC7)?.inputClassName || ''} no-spinner`}
                                                            placeholder={expensesDstCol7Label}
                                                            value={newDailyExpense.quantity || ""}
                                                            onChange={(e) => setNewDailyExpense(prev => ({ ...prev, quantity: e.target.value }))}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    e.preventDefault();
                                                                    handleAddExpense();
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                                <td id={EDBC_IDS.EDBC20} className={getEdbcColumnConfig(EDBC_IDS.EDBC20)?.tdClass}>
                                                </td>
                                                <td id={EDBC_IDS.EDBC20} className={getEdbcColumnConfig(EDBC_IDS.EDBC20)?.tdClass}>
                                                </td>
                                            </tr>
                                        ) : null}
                                    </thead>
                                    <tbody>
                                        {sortedDailyExpenses
                                            .filter(row => row.date === selectedDate)
                                            .reverse()
                                            .map((row, index) => (
                                                <EdbcTableBodyRow key={row.id}>
                                                    <td id={EDBC_IDS.EDBC21} className={getEdbcColumnConfig(EDBC_IDS.EDBC21)?.tdClass}>{dailyExpenses.length - index}</td>
                                                    <td id={EDBC_IDS.EDBC4} className={getEdbcColumnConfig(EDBC_IDS.EDBC4)?.tdClass}>
                                                        <div className={`${getEdbcColumnConfig(EDBC_IDS.EDBC4)?.filterWidthClass} h-[40px] flex items-center`}>
                                                            {editingDailyExpenseRowId === row.id ? (
                                                                <Select
                                                                    name="labour_id"
                                                                    className="text-xs focus:outline-none w-full"
                                                                    placeholder={expensesDstCol4Label}
                                                                    isSearchable
                                                                    isClearable
                                                                    styles={CASH_REGISTER_SELECT_STYLES}
                                                                    options={isEditChangeButtonActive ? combinedOptions : laboursList}
                                                                    menuPortalTarget={document.body}
                                                                    value={
                                                                        isEditChangeButtonActive
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
                                                                            const resolvedCategory = selectedOption.category || "";
                                                                            setEditDailyExpenseData(prev => ({
                                                                                ...prev,
                                                                                labour_id: type === "Labour" ? id : "",
                                                                                vendor_id: type === "Vendor" ? id : "",
                                                                                contractor_id: type === "Contractor" ? id : "",
                                                                                employee_id: type === "Employee" ? id : "",
                                                                                type:
                                                                                    type === "Labour"
                                                                                        ? "Wage"
                                                                                        : (type === "Vendor" || type === "Contractor") && resolvedCategory
                                                                                            ? resolvedCategory
                                                                                            : prev.type
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
                                                    <td className="w-4 min-w-4 max-w-4 p-0 overflow-visible"></td>
                                                    <td id={EDBC_IDS.EDBC3} className={getEdbcColumnConfig(EDBC_IDS.EDBC3)?.tdClass}>
                                                        {editingDailyExpenseRowId === row.id ? (
                                                            <div className={getEdbcColumnConfig(EDBC_IDS.EDBC3)?.filterWidthClass}>
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
                                                                    className="text-xs focus:outline-none w-full"
                                                                    placeholder={expensesDstCol3Label}
                                                                    isSearchable
                                                                    isClearable
                                                                    styles={CASH_REGISTER_SELECT_STYLES}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className={`${getEdbcColumnConfig(EDBC_IDS.EDBC3)?.filterWidthClass || ''} h-[40px] flex items-center min-w-0`}>
                                                                <span
                                                                    className="block w-full truncate whitespace-nowrap overflow-hidden"
                                                                    title={siteOptions.find(opt => opt.id === Number(row.project_id))?.label || ""}
                                                                >
                                                                    {siteOptions.find(opt => opt.id === Number(row.project_id))?.label || ""}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td id={EDBC_IDS.EDBC8} className={`${getEdbcColumnConfig(EDBC_IDS.EDBC8)?.tdClass} relative group`}>
                                                        {editingDailyExpenseRowId === row.id ? (
                                                            <div className={getEdbcColumnConfig(EDBC_IDS.EDBC8)?.filterWidthClass}>
                                                                <input
                                                                    type="number"
                                                                    name="amount"
                                                                    style={EDBC_FILTER_CONTROL_BOX_STYLE}
                                                                    className={`${getEdbcColumnConfig(EDBC_IDS.EDBC8)?.inputClassName || ''} no-spinner`}
                                                                    value={editDailyExpenseData.amount || ""}
                                                                    onChange={(e) => setEditDailyExpenseData(prev => ({ ...prev, amount: e.target.value }))}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-end">
                                                                <div className="h-[40px] flex flex-col justify-center leading-tight cursor-default text-right">
                                                                    <span>
                                                                        {formatEdbcTotalAmountPlaceholder(Number((row.amount || 0) + (row.extra_amount || 0)))}
                                                                    </span>
                                                                    <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-black text-white text-xs rounded p-2 z-50 shadow-lg whitespace-nowrap">
                                                                        Amount: {Number(row.amount || 0).toLocaleString('en-IN')} <br />
                                                                        Extra Amount: {Number(row.extra_amount || 0).toLocaleString('en-IN')}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="w-4 min-w-4 max-w-4 p-0 overflow-visible"></td>
                                                    <td className="pl-[6px] w-[66px] text-center">
                                                        {editingDailyExpenseRowId === row.id ? (
                                                            <div className="w-[60px]">
                                                                <input
                                                                    type="number"
                                                                    name="extra_amount"
                                                                    style={EDBC_FILTER_CONTROL_BOX_STYLE}
                                                                    className={`${getEdbcColumnConfig(EDBC_IDS.EDBC8)?.inputClassName || ''} no-spinner !w-[60px]`}
                                                                    placeholder="Extra"
                                                                    value={editDailyExpenseData.extra_amount || ""}
                                                                    onChange={(e) => setEditDailyExpenseData(prev => ({ ...prev, extra_amount: e.target.value }))}
                                                                />
                                                            </div>
                                                        ) : null}
                                                    </td>
                                                    <td id={EDBC_IDS.EDBC12} className={getEdbcColumnConfig(EDBC_IDS.EDBC12)?.tdClass}>
                                                        <div className="w-[120px] h-[40px] flex items-center">
                                                            {editingDailyExpenseRowId === row.id ? (
                                                                <div className={getEdbcColumnConfig(EDBC_IDS.EDBC12)?.filterWidthClass}>
                                                                    <Select
                                                                        name="type"
                                                                        className="text-xs focus:outline-none w-full"
                                                                        value={editDailyExpenseData.type ? { value: editDailyExpenseData.type, label: editDailyExpenseData.type } : null}
                                                                        onChange={(selectedOption) => setEditDailyExpenseData(prev => ({ ...prev, type: selectedOption ? selectedOption.value : '' }))}
                                                                        options={(isEditChangeButtonActive ? expensesCategory : weeklyTypes).map((type) => ({
                                                                            value: isEditChangeButtonActive ? type.category : type.type,
                                                                            label: isEditChangeButtonActive ? type.category : type.type,
                                                                        }))}
                                                                        placeholder={expensesDstCol12Label}
                                                                        isSearchable
                                                                        isClearable
                                                                        menuPortalTarget={document.body}
                                                                        styles={CASH_REGISTER_SELECT_STYLES}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                row.type
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td id={EDBC_IDS.EDBC7} className={getEdbcColumnConfig(EDBC_IDS.EDBC7)?.tdClass}>
                                                        <div className="w-[60px] h-[40px] flex items-center">
                                                            {editingDailyExpenseRowId === row.id ? (
                                                                <div className={getEdbcColumnConfig(EDBC_IDS.EDBC7)?.filterWidthClass}>
                                                                    <input
                                                                        type="number"
                                                                        name="quantity"
                                                                        style={EDBC_FILTER_CONTROL_BOX_STYLE}
                                                                        className={`${getEdbcColumnConfig(EDBC_IDS.EDBC7)?.inputClassName || ''} no-spinner`}
                                                                        value={editDailyExpenseData.quantity || ""}
                                                                        onChange={(e) => setEditDailyExpenseData(prev => ({ ...prev, quantity: e.target.value }))}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                row.quantity || "-"
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td id={EDBC_IDS.EDBC20} className={getEdbcColumnConfig(EDBC_IDS.EDBC20)?.tdClass}>
                                                        <div className="flex w-full items-center justify-center">
                                                            <span className="inline-flex items-center gap-[10px]">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDescriptionClick(row)}
                                                                    className="inline-flex shrink-0 w-[16px] h-[16px] items-center justify-center"
                                                                    title={row.description ? 'View Description' : 'Add Description'}
                                                                >
                                                                    <img
                                                                        src={row.description ? NotesEnd : NotesStart}
                                                                        alt=""
                                                                        className=" cursor-pointer opacity-60 hover:opacity-100"
                                                                    />
                                                                </button>
                                                                <span className="inline-flex items-center gap-[4px]">
                                                                    {row.file_url ? (
                                                                        <>
                                                                            <a
                                                                                href={row.file_url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="inline-flex shrink-0 w-[16px] h-[16px] items-center justify-center cursor-pointer"
                                                                                title="View File"
                                                                            >
                                                                                <img src={file} className="" alt="Open File" />
                                                                            </a>
                                                                            {canRemoveFileUrl && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleRemoveFileUrl(row)}
                                                                                    className="flex h-[12px] w-[12px] shrink-0 items-center justify-center rounded-full hover:bg-[#fff1ee]"
                                                                                    title="Remove File"
                                                                                >
                                                                                    <img src={FileRemover} className="" alt="Remove File" />
                                                                                </button>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleFileUploadClick(row)}
                                                                            className="inline-flex h-4 w-4 shrink-0 items-center justify-center cursor-pointer"
                                                                            title="Upload File"
                                                                        >
                                                                            <img
                                                                                src={fileUpload}
                                                                                className="w-4 h-4 opacity-70 hover:opacity-100"
                                                                                alt="Upload File"
                                                                            />
                                                                        </button>
                                                                    )}
                                                                </span>
                                                                {canRemoveFileUrl && !row.file_url && removedFileUrlRows[row.id] && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRestoreFileUrl(row)}
                                                                        className="shrink-0 rounded border border-[#007233] px-1 text-[9px] font-semibold leading-tight text-[#007233] hover:bg-[#e9f8f0]"
                                                                        title="Restore Removed File"
                                                                    >
                                                                        Restore
                                                                    </button>
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td id={EDBC_IDS.EDBC20} className={getEdbcColumnConfig(EDBC_IDS.EDBC20)?.tdClass}>
                                                        <div className="flex gap-1 justify-center">
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
                                                </EdbcTableBodyRow>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="shrink-0 flex flex-col min-h-0 overflow-hidden">
                        <div className="w-fit max-w-full flex flex-col min-h-0">
                            <div className="flex justify-between items-center mb-[8px] w-full">
                                <h1 className="font-bold text-base">Refund Received</h1>
                                <h1 className="font-bold text-base" style={{ color: "#E4572E" }}>
                                    ₹{Number(totalRefund).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </h1>
                            </div>
                            <div className="text-left flex flex-row items-center mb-[12px] gap-[6px] w-full">
                                <EdbcFilterToggleButton onClick={() => setShowRefundFilters(!showRefundFilters)} />
                                <EdbcTableToolbarRightActions
                                    onClearFilters={clearRefundFilters}
                                    overallSearch={refundOverallSearch}
                                    onOverallSearchChange={setRefundOverallSearch}
                                    wrapperClassName="flex items-end gap-[6px] min-w-0 flex-1 justify-end"
                                    searchWrapperClassName="h-[34px] min-w-0 w-1/2 border border-[#D6D6D6] rounded-md bg-white flex items-center px-2 gap-1"
                                />
                            </div>
                            <div className="shrink-0">
                                <div className="rounded-lg border-l-8 border-l-[#BF9853] min-h-[330px] w-fit max-w-full shrink-0 overflow-y-auto overflow-x-auto no-scrollbar"
                                    style={{
                                        height: `${40 + (showRefundFilters ? 40 : 0) + 40 + 180}px`,
                                        maxHeight: `${40 + (showRefundFilters ? 40 : 0) + 40 + 180}px`,
                                        willChange: 'scroll-position',
                                        WebkitOverflowScrolling: 'touch',
                                        transform: 'translateZ(0)',
                                        backfaceVisibility: 'hidden'
                                    }}
                                >
                                    <table className={`border-collapse text-left w-max table-fixed ${EDBC_TABLE_EDGE_TABLE_CLASS} [&_th#EDBC-20]:!w-[70px] [&_td#EDBC-20]:!w-[70px] [&_th#EDBC-20]:!min-w-[70px] [&_td#EDBC-20]:!min-w-[70px] [&_th#EDBC-20]:!max-w-[70px] [&_td#EDBC-20]:!max-w-[70px]`}>
                                        <thead className="sticky top-0 z-10 bg-white">
                                            <EdbcTableHeaderRow>
                                                <EdbcColumnHeader columnId={EDBC_IDS.EDBC4} label={refundDstCol4Label} sortProps={refundEdbcSortProps} />
                                                <th className="px-[2px] w-[100px] overflow-visible" aria-hidden="true"></th>
                                                <EdbcColumnHeader columnId={EDBC_IDS.EDBC8} label={refundDstCol8Label} sortProps={refundEdbcSortProps} />
                                                <EdbcColumnHeader columnId={EDBC_IDS.EDBC20} label={refundDstCol20Label} />
                                            </EdbcTableHeaderRow>
                                            {showRefundFilters && (
                                                <EdbcTableFilterRow>
                                                    <EdbcSelectFilter
                                                        columnId={EDBC_IDS.EDBC4}
                                                        placeholder={refundDstCol4Label}
                                                        options={refundNameFilterOptions}
                                                        value={selectRefundName}
                                                        onChange={setSelectRefundName}
                                                        selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                                                    />
                                                    <th className="px-[2px] w-[60px] overflow-visible"></th>
                                                    <EdbcTotalAmountFilter
                                                        columnId={EDBC_IDS.EDBC8}
                                                        totalAmount={filteredRefundPayments.reduce((total, row) => total + Number(row.amount || 0), 0)}
                                                        value={selectRefundAmount}
                                                        onChange={(e) => setSelectRefundAmount(e.target.value)}
                                                    />
                                                    <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC20} />
                                                </EdbcTableFilterRow>
                                            )}
                                            <tr className="bg-white border-b border-gray-200">
                                                <td id={EDBC_IDS.EDBC4} className="pl-[12px] pr-[1px] w-[218px] text-left">
                                                    <Select
                                                        name="refund_party"
                                                        className={getEdbcColumnConfig(EDBC_IDS.EDBC4)?.filterWidthClass}
                                                        placeholder={refundDstCol4Label}
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
                                                        styles={CASH_REGISTER_SELECT_STYLES}
                                                        menuPortalTarget={document.body}
                                                    />
                                                </td>
                                                <td className="pl-[6px] w-[100px] overflow-visible">
                                                    <button type="button" onClick={handleRefundChangeButtonClick}>
                                                        <img
                                                            src={Change}
                                                            className={`w-4 h-4 ${isRefundChangeButtonActive ? 'opacity-10' : ''}`}
                                                            alt="Toggle options"
                                                        />
                                                    </button>
                                                </td>
                                                <td id={EDBC_IDS.EDBC8} className={getEdbcColumnConfig(EDBC_IDS.EDBC8)?.tdClass}>
                                                    <div className={getEdbcColumnConfig(EDBC_IDS.EDBC8)?.filterWidthClass}>
                                                        <input
                                                            type="number"
                                                            name="amount"
                                                            style={EDBC_FILTER_CONTROL_BOX_STYLE}
                                                            className={`${getEdbcColumnConfig(EDBC_IDS.EDBC8)?.inputClassName || ''} no-spinner`}
                                                            placeholder={refundDstCol8Label}
                                                            value={newRefundReceived.amount}
                                                            onChange={handleNewPaymentChange}
                                                            onKeyDown={handleKeyDown}
                                                            min="0"
                                                            step="any"
                                                            onWheel={(e) => e.preventDefault()}
                                                        />
                                                    </div>
                                                </td>
                                                <td id={EDBC_IDS.EDBC20} className={getEdbcColumnConfig(EDBC_IDS.EDBC20)?.tdClass}>
                                                </td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedRefundPayments.map((row, index) => (
                                                <EdbcTableBodyRow key={row.id || index}>
                                                    <td id={EDBC_IDS.EDBC4} className={getEdbcColumnConfig(EDBC_IDS.EDBC4)?.tdClass}>
                                                        {editingPaymentId === row.id ? (
                                                            <Select
                                                                name="refund_party"
                                                                className="text-xs focus:outline-none w-full"
                                                                placeholder={refundDstCol4Label}
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
                                                                styles={CASH_REGISTER_SELECT_STYLES}
                                                            />
                                                        ) : (
                                                            <div className={`${getEdbcColumnConfig(EDBC_IDS.EDBC4)?.filterWidthClass} h-[40px] flex items-center overflow-hidden`}>
                                                                <div className="truncate">
                                                                    {getRefundRowName(row)}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-[2px] overflow-visible">
                                                        {editingPaymentId !== row.id && (() => {
                                                            const hasLabourId = row.labour_id && Number(row.labour_id) > 0;
                                                            const hasVendorOrContractorId = (row.vendor_id && Number(row.vendor_id) > 0) ||
                                                                (row.contractor_id && Number(row.contractor_id) > 0);
                                                            if (!hasLabourId && !hasVendorOrContractorId) return null;
                                                            return (
                                                                <div className="bg-[#E3F2FD] text-[#1565C0] font-semibold px-3 py-[2px] text-xs rounded-full whitespace-nowrap flex items-center justify-center">
                                                                    {hasLabourId ? 'Staff Portal' : 'Loan Portal'}
                                                                </div>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td id={EDBC_IDS.EDBC8} className={getEdbcColumnConfig(EDBC_IDS.EDBC8)?.tdClass}>
                                                        {editingPaymentId === row.id ? (
                                                            <div className={getEdbcColumnConfig(EDBC_IDS.EDBC8)?.filterWidthClass}>
                                                                <input
                                                                    type="number"
                                                                    name="amount"
                                                                    value={editRefundPaymentData.amount}
                                                                    onChange={handleEditRefundChange}
                                                                    style={EDBC_FILTER_CONTROL_BOX_STYLE}
                                                                    className={`${getEdbcColumnConfig(EDBC_IDS.EDBC8)?.inputClassName || ''} no-spinner`}
                                                                    placeholder={refundDstCol8Label}
                                                                    min="0"
                                                                    step="any"
                                                                    onWheel={(e) => e.preventDefault()}
                                                                />
                                                            </div>
                                                        ) : (
                                                            formatEdbcTotalAmountPlaceholder(row.amount)
                                                        )}
                                                    </td>
                                                    <td id={EDBC_IDS.EDBC20} className={getEdbcColumnConfig(EDBC_IDS.EDBC20)?.tdClass}>
                                                        <div className="flex gap-1 justify-center">
                                                            {editingPaymentId === row.id ? (
                                                                <button className="text-green-600 font-bold text-lg" onClick={() => saveEditedRefundPayment(row.id)}>
                                                                    ✓
                                                                </button>
                                                            ) : (
                                                                <button onClick={() => handleEditRefundClick(row)}>
                                                                    <img className="w-5 h-4" src={Edit} alt="Edit" />
                                                                </button>
                                                            )}
                                                            <button onClick={() => handleRefundPaymentsDelete(row.id)}>
                                                                <img src={Delete} className="w-5 h-4" alt="Delete" />
                                                            </button>
                                                            <button onClick={() => fetchAuditDetailsForRefundPaymentReceived(row.id)}>
                                                                <img src={history} className="w-5 h-4" alt="History" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </EdbcTableBodyRow>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="mt-[12px] flex-1 min-h-0 rounded-xl bg-white px-[18px] py-[12px] border border-[#E6DAC6] text-left overflow-hidden">
                                <div className="flex flex-col h-full min-h-0">
                                    <div className="flex items-center justify-between rounded-lg mb-[4px]">
                                        <p className="text-[16px] font-semibold text-black">Summary Details</p>
                                    </div>
                                    <div className="overflow-y-auto no-scrollbar flex-1 min-h-0">
                                        {Object.entries(
                                            sortedDailyExpenses
                                                .filter((expense) => expense.date === selectedDate && Number(expense.amount) > 0)
                                                .reduce((acc, expense) => {
                                                    const type = expense.type;
                                                    const amount = Number(expense.amount);
                                                    acc[type] = (acc[type] || 0) + amount;
                                                    return acc;
                                                }, {})
                                        ).map(([type, total]) => (
                                            <div key={type} className="flex items-center justify-between py-[4px]">
                                                <p className="text-[14px] font-semibold text-[#666666]">{type}</p>
                                                <p className="text-[14px] font-semibold text-black">
                                                    ₹{Number(total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between py-[6px] border-b border-t border-dashed mt-[4px] border-[#454545]">
                                        <p className="text-[14px] font-semibold text-black">Total Amount</p>
                                        <p className="text-[14px] font-semibold text-black">
                                            ₹{sortedDailyExpenses
                                                .filter((expense) => expense.date === selectedDate)
                                                .reduce((total, expense) => total + Number(expense.amount || 0), 0)
                                                .toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {showPopups && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]"
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
                        <div className="bg-white rounded-xl shadow-lg p-6 w-[650px]">
                            <label className="block text-left">
                                <span className="font-semibold block text-[18px] mb-[8px]">Description</span>
                                {entryId ? (
                                    <div>
                                        <textarea
                                            name="description"
                                            placeholder="Description"
                                            rows={4}
                                            className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full lg:w-[616px] focus:outline-none resize-none whitespace-normal break-words"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') e.stopPropagation(); }}
                                        />
                                    </div>
                                ) : (
                                    <textarea
                                        name="description"
                                        rows={4}
                                        className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full lg:w-[616px] focus:outline-none resize-none whitespace-normal break-words bg-gray-50"
                                        value={description}
                                        readOnly
                                    />
                                )}
                            </label>
                            <div className="flex justify-end gap-[18px] mt-[18px]">
                                <button
                                    onClick={() => {
                                        setShowPopups(false);
                                        setEntryId(null);
                                        setDescription("");
                                    }}
                                    className="px-4 py-2 border border-[#BF9853] text-[#BF9853] rounded-md"
                                >
                                    Close
                                </button>
                                {entryId && (
                                    <button
                                        onClick={handleUpdate}
                                        disabled={loading || !description.trim()}
                                        className="px-4 py-2 bg-[#BF9853] text-white rounded-md hover:bg-[#BF9853] disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center"
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
                                <label
                                    htmlFor="daily-payment-file-upload-input"
                                    className="flex flex-col items-center justify-center w-full h-[120px] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <svg width="40" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M17 8L12 3L7 8" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 3V15" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p className="text-[14px] font-medium text-[#E4572E] mt-[4px]">Click to Upload</p>
                                    <p className="text-[10px] text-gray-400">Files will be compressed on upload</p>
                                </label>
                                <input
                                    id="daily-payment-file-upload-input"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileSelectInPopup}
                                    className="hidden"
                                />
                                {selectedFileForPopup && (
                                    <div className="mt-2">
                                        <p className="text-[12px] font-medium text-black mb-[4px]">File Uploading</p>
                                        <div className="bg-gray-50 rounded-lg p-[12px]">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-[12px] flex-1 min-w-0">
                                                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[12px] font-medium text-black truncate">{selectedFileForPopup.name}</p>
                                                        <p className="text-[10px] text-gray-500">{(selectedFileForPopup.size / (1024 * 1024)).toFixed(2)} MB</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-[12px]">
                                                    <button type="button" onClick={() => setSelectedFileForPopup(null)} className="text-red-500 hover:text-red-700">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    </button>
                                                    <span className="text-[12px] font-semibold text-black w-[40px] text-right">100%</span>
                                                </div>
                                            </div>
                                            <div className="mt-2 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full w-full bg-[#BF9853] rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-3 mt-6 w-full">
                                <button onClick={handleSaveFileFromPopup} disabled={!selectedFileForPopup}
                                    className={`w-full px-4 py-2 rounded-lg ${!selectedFileForPopup
                                        ? 'bg-[#BF9853] opacity-50 cursor-not-allowed text-white'
                                        : 'bg-[#BF9853] text-white'
                                        }`}
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={() => {
                                        setFileUploadPopup(false);
                                        setCurrentFileRow(null);
                                        setSelectedFileForPopup(null);
                                    }}
                                    className="w-full px-4 py-2 border border-[#BF9853] text-[#BF9853] rounded-lg"
                                >
                                    Cancel
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
                                            padding: '2px',
                                            color: '#000000',
                                        }),
                                        dropdownIndicator: (provided, state) => ({
                                            ...provided,
                                            padding: '2px',
                                            color: '#000000',
                                            display: state.hasValue && state.selectProps.isClearable ? 'none' : 'flex',
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
            </div>
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
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
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
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
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