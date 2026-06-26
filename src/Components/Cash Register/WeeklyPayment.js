import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Edit from '../Images/Edit.svg'
import Delete from '../Images/Delete.svg'
import Select from 'react-select';
import history from '../Images/History.svg';
import NotesStart from '../Images/TextUpload.svg';
import NotesEnd from '../Images/TextView.svg';
import fileUpload from '../Images/FileUpload.svg';
import fileSignatureUpload from '../Images/SignatureIcon.svg';
import download from '../Images/file_download.png'
import file from '../Images/FileView.svg';
import FileRemover from '../Images/FileRemover.svg';
import AddExtra from '../Images/AddExtra.svg';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    postBankRegisterLogSave,
    bankRegisterLogSaveUrlMatchingRequest,
    isPaymentModeRequiringBankRegisterLog,
} from '../../utils/bankRegisterLogBeforeWeeklyBill';
import {
    fetchStaffPurposeOptions,
    splitStaffAdvancePortalByPurpose,
    getPortalAdvancePartyName,
    getPortalAdvanceProjectName,
    UTILITY_BILL_TYPES,
    UTILITY_BILLS_SUMMARY_TYPE,
    getExpenseSummaryType,
    buildWeeklyPaymentExpenseTypeSummary,
} from '../../utils/weeklyPaymentStaffAdvancePdf';
import Change from '../Images/dropdownchange.png';
import { useLiveDataSync } from '../../utils/useLiveDataSync';
import CustomDateField from '../ExpensesEntry/CustomDateField';
import ExpenseEntryForm from '../ExpensesEntry/Form';
import AdvancePortalForm from '../Advance Portal/AdvancePortal';
import restore from '../Images/Restore.svg';
import {
    DATABASE_TABLE_FILTER_SELECT_STYLES,
    EDBC_FILTER_CONTROL_BOX_STYLE,
    EDBC_FILTER_CONTROL_HEIGHT_PX,
    EDBC_IDS,
    EDBC_TABLE_EDGE_TABLE_CLASS,
    EdbcColumnHeader,
    EdbcDateBodyCell,
    EdbcDateFilter,
    EdbcEmptyFilterCell,
    EdbcFilterToggleButton,
    EdbcExpandableBodyCell,
    EdbcProjectNameBodyCell,
    EdbcProjectNameFilter,
    EdbcSelectFilter,
    EdbcTableBodyRow,
    EdbcTableFilterRow,
    EdbcTableHeaderRow,
    EdbcTableToolbarRightActions,
    EdbcTotalAmountFilter,
    EDBC2_FIRST_COLUMN_WIDTH_CLASS,
    formatEdbcTotalAmountPlaceholder,
    getEdbcColumnConfig,
    matchesEdbcAmountFilter,
    matchesWeeklyPaymentExpenseOverallSearch,
    sortWeeklyPaymentExpenseRows,
    sortWeeklyPaymentPaymentRows,
    useEdbcExpandedCells,
    useEdbcTableSort,
} from '../ExpensesEntry/databaseExpensesSharedColumns';

const ENTRY_ROW_SELECT_CLASS_NAMES = {
    menuList: () => 'no-scrollbar',
};
const entryRowSelectMenuListStyle = (provided) => ({
    ...provided,
    maxHeight: '300px',
    overflowY: 'auto',
    overflowX: 'hidden',
});

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

const WEEKLY_PAYMENT_EDBC8_TABLE_CLASS =
    '[&_thead_tr.bg-\\[\\#eeeeee\\]>th#EDBC-8]:!pr-0 [&_th#EDBC-8]:!w-[120px] [&_th#EDBC-8]:!max-w-[120px] [&_th#EDBC-8]:!overflow-hidden [&_tbody_td#EDBC-8]:!w-[98px] [&_tbody_td#EDBC-8]:!max-w-[98px] [&_tbody_td#EDBC-8]:!overflow-hidden';

const WEEKLY_PAYMENT_EXPENSES_TABLE_LOCK_TABLE_CLASS =
    '[&_th#EDBC-21]:!w-[70px] [&_td#EDBC-21]:!w-[70px] [&_th#EDBC-21]:!min-w-[70px] [&_td#EDBC-21]:!min-w-[70px] [&_th#EDBC-21]:!max-w-[70px] [&_td#EDBC-21]:!max-w-[70px] [&_th#EDBC-2]:!w-[120px] [&_td#EDBC-2]:!w-[120px] [&_th#EDBC-2]:!min-w-[120px] [&_td#EDBC-2]:!min-w-[120px] [&_th#EDBC-2]:!max-w-[120px] [&_td#EDBC-2]:!max-w-[120px] [&_th#EDBC-4]:!w-[218px] [&_td#EDBC-4]:!w-[218px] [&_th#EDBC-4]:!min-w-[218px] [&_td#EDBC-4]:!min-w-[218px] [&_th#EDBC-4]:!max-w-[218px] [&_td#EDBC-4]:!max-w-[218px] [&_th#EDBC-3]:!w-[298px] [&_td#EDBC-3]:!w-[298px] [&_th#EDBC-3]:!min-w-[298px] [&_td#EDBC-3]:!min-w-[298px] [&_th#EDBC-3]:!max-w-[298px] [&_td#EDBC-3]:!max-w-[298px] [&_th#EDBC-12]:!w-[158px] [&_td#EDBC-12]:!w-[158px] [&_th#EDBC-12]:!min-w-[158px] [&_td#EDBC-12]:!min-w-[158px] [&_th#EDBC-12]:!max-w-[158px] [&_td#EDBC-12]:!max-w-[158px] [&_thead_tr>th:nth-child(4)]:!w-[30px] [&_thead_tr>th:nth-child(4)]:!min-w-[30px] [&_thead_tr>th:nth-child(4)]:!max-w-[30px] [&_tbody_tr>td:nth-child(4)]:!w-[30px] [&_tbody_tr>td:nth-child(4)]:!min-w-[30px] [&_tbody_tr>td:nth-child(4)]:!max-w-[30px] [&_thead_tr:nth-child(2)>th:nth-child(4)]:!w-[30px] [&_thead_tr:nth-child(2)>th:nth-child(4)]:!min-w-[30px] [&_thead_tr:nth-child(2)>th:nth-child(4)]:!max-w-[30px] [&_thead_tr>th:nth-last-child(2)]:!w-[70px] [&_thead_tr>th:nth-last-child(2)]:!min-w-[70px] [&_thead_tr>th:nth-last-child(2)]:!max-w-[70px] [&_tbody_tr>td:nth-last-child(2)]:!w-[70px] [&_tbody_tr>td:nth-last-child(2)]:!min-w-[70px] [&_tbody_tr>td:nth-last-child(2)]:!max-w-[70px] [&_thead_tr>th:nth-last-child(2)]:!overflow-hidden [&_tbody_tr>td:nth-last-child(2)]:!overflow-hidden';

const WEEKLY_PAYMENT_INCOME_TABLE_LOCK_TABLE_CLASS =
    '[&_thead_tr>th#EDBC-2:first-child]:!w-[130px] [&_tbody_tr>td#EDBC-2:first-child]:!w-[130px] [&_thead_tr>th#EDBC-2:first-child]:!min-w-[130px] [&_tbody_tr>td#EDBC-2:first-child]:!min-w-[130px] [&_thead_tr>th#EDBC-2:first-child]:!max-w-[130px] [&_tbody_tr>td#EDBC-2:first-child]:!max-w-[130px] [&_th#EDBC-12]:!w-[158px] [&_td#EDBC-12]:!w-[158px] [&_th#EDBC-12]:!min-w-[158px] [&_td#EDBC-12]:!min-w-[158px] [&_th#EDBC-12]:!max-w-[158px] [&_td#EDBC-12]:!max-w-[158px] [&_thead_tr>th:nth-last-child(2)]:!w-[70px] [&_thead_tr>th:nth-last-child(2)]:!min-w-[70px] [&_thead_tr>th:nth-last-child(2)]:!max-w-[70px] [&_tbody_tr>td:nth-last-child(2)]:!w-[70px] [&_tbody_tr>td:nth-last-child(2)]:!min-w-[70px] [&_tbody_tr>td:nth-last-child(2)]:!max-w-[70px] [&_thead_tr>th:nth-last-child(2)]:!overflow-hidden [&_tbody_tr>td:nth-last-child(2)]:!overflow-hidden';

const WEEKLY_PAYMENT_EXPENSES_TABLE_FIXED_WIDTH_CLASS = 'w-full xl:w-[1246px] xl:min-w-[1246px]';
const WEEKLY_PAYMENT_INCOME_TABLE_FIXED_WIDTH_CLASS = 'w-[490px] min-w-[490px]';

const WEEKLY_PAYMENT_INCOME_TBODY_TABLE_LOCK_TABLE_CLASS =
    WEEKLY_PAYMENT_INCOME_TABLE_LOCK_TABLE_CLASS.replace(/\[&_td#/g, '[&_tbody_td#');

const formatWeeklyPaymentAmountDisplay = (amount) =>
    `₹${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// Helper function to clean URL by removing surrounding quotes and parsing JSON if needed
function cleanUrl(url) {
    if (!url) return url;
    let cleanedUrl = url.replace(/^["']|["']$/g, '');
    if (cleanedUrl.includes('{') && cleanedUrl.includes('billCopyUrl')) {
        try {
            const parsed = JSON.parse(cleanedUrl);
            if (parsed.billCopyUrl) {
                return parsed.billCopyUrl;
            }
        } catch (e) {
            console.warn('Failed to parse URL as JSON:', cleanedUrl);
        }
    }
    return cleanedUrl;
}
// ISO 8601 week number calculation
// Week belongs to the year that contains the Thursday of that week
// Week 1 is the week with the year's first Thursday
function getISOWeekNumber(date) {
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
}

const WEEKLY_PAYMENT_WEEK_LOOKBACK = 12;

function getIsoWeekWithOffset(baseWeek, offsetBack) {
    let week = baseWeek - offsetBack;
    while (week < 1) week += 52;
    return week;
}

function getStartAndEndDateOfISOWeek(weekNo, year) {
    const simple = new Date(year, 0, 1 + (weekNo - 1) * 7);
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
    return { startDate: ISOweekStart, endDate: ISOweekEnd };
}
const WeeklyPayment = ({ username, userRoles = [], onExportActionsReady, onClosureActionsReady, isTabActive = true }) => {
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
    const normalizedUsername = username?.trim();
    const canRemoveBillCopyUrl = normalizedUsername === 'Admin' || normalizedUsername === 'Mahalingam M';
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
    const [activeBranchId, setActiveBranchId] = useState(() => resolveActiveBranchId());
    const buildBranchUrl = useCallback((baseUrl) => {
        const url = new URL(baseUrl);
        if (activeBranchId !== null && activeBranchId !== undefined && activeBranchId !== "") {
            url.searchParams.set("branchId", String(activeBranchId));
        }
        return url.toString();
    }, [activeBranchId]);
    useEffect(() => {
        const syncBranch = () => {
            const nextBranchId = resolveActiveBranchId();
            setActiveBranchId((prevBranchId) =>
                prevBranchId === nextBranchId ? prevBranchId : nextBranchId
            );
        };
        syncBranch();
        window.addEventListener("branchSelectionChanged", syncBranch);
        return () => {
            window.removeEventListener("branchSelectionChanged", syncBranch);
        };
    }, []);
    const [currentWeekNumber, setCurrentWeekNumber] = useState(null);
    const [previousWeekHasStatusTrue, setPreviousWeekHasStatusTrue] = useState(false);
    const [previousWeekHasData, setPreviousWeekHasData] = useState(false);
    const [currentWeekHasStatusTrue, setCurrentWeekHasStatusTrue] = useState(false);
    // Calculate actual current week number using ISO week calculation
    const actualCurrentWeekNumber = getISOWeekNumber(new Date());
    const nextCalendarWeekNumber = getISOWeekNumber(new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)));
    // The week we MUST operate on — null until resolved (never default to current week)
    const [activeWeekNumber, setActiveWeekNumber] = useState(null);
    const [isWeekResolved, setIsWeekResolved] = useState(false);
    const operationalWeekNumber = activeWeekNumber;
    const weekResolveTokenRef = useRef(0);
    const weekExpensesFetchTokenRef = useRef(0);
    const weekPaymentsFetchTokenRef = useRef(0);
    const pendingWeekDataRef = useRef(null);
    const lastPortalDescriptionKeyRef = useRef("");
    const lastStaffAdvanceDescriptionKeyRef = useRef("");
    const formatLocalISODate = (date) => {
        const d = date instanceof Date ? date : new Date(date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    };
    const getWeekCacheKey = useCallback((baseKey) => {
        const branchKey = activeBranchId ?? "all";
        const todayKey = formatLocalISODate(new Date());
        return `${baseKey}::${branchKey}::${todayKey}`;
    }, [activeBranchId]);
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
    const clearCachedActiveWeek = useCallback(() => {
        try {
            sessionStorage.removeItem(getWeekCacheKey("cashRegisterActiveWeek"));
        } catch {
            // ignore
        }
    }, [getWeekCacheKey]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [contractorOptions, setContractorOptions] = useState([]);
    const [siteOptions, setSiteOptions] = useState([]);
    const [combinedOptions, setCombinedOptions] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [clientOptions, setClientOptions] = useState([]);
    const [clientProjectOptions, setClientProjectOptions] = useState([]);
    const [clientProjectMap, setClientProjectMap] = useState({});
    const [projectIdToClientName, setProjectIdToClientName] = useState({});
    const [weeklyPaymentBills, setWeeklyPaymentBills] = useState([]);
    const [selectedProjectName, setSelectedProjectName] = useState(null);
    const [portalDescriptions, setPortalDescriptions] = useState({});
    const [staffAdvanceDescriptions, setStaffAdvanceDescriptions] = useState({});
    const [selectedContractor, setSelectedContractor] = useState(null);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isClientToggleActive, setIsClientToggleActive] = useState(false);
    const [weeklyTypes, setWeeklyTypes] = useState([]);
    const [showWeeklyPaymentExpensesModal, setShowWeeklyPaymentExpensesModal] = useState(false);
    const [weeklyPaymentExpensesAudits, setWeeklyPaymentExpensesAudits] = useState([]);
    const [showWeeklyPaymentReceivedModal, setShowWeeklyPaymentReceivedModal] = useState(false);
    const [weeklyPaymentReceivedAudits, setWeeklyPaymentReceivedAudits] = useState([]);
    const [allRefundAmount, setAllRefundAmount] = useState([]);
    const [popup, setPopup] = useState({ show: false, message: "", type: "", dateStr: "", editRowId: null, editIndex: null, originalDate: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Expenses
    const [expenses, setExpenses] = useState([]);
    const [weeklyReceivedTypes, setWeeklyReceivedTypes] = useState([]);
    const [currentRow, setCurrentRow] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [showPaymentsFilters, setShowPaymentsFilters] = useState(false);
    const [paymentsOverallSearch, setPaymentsOverallSearch] = useState('');
    const [selectPaymentDate, setSelectPaymentDate] = useState('');
    const [selectPaymentAmount, setSelectPaymentAmount] = useState('');
    const [selectPaymentType, setSelectPaymentType] = useState('');
    const [selectDate, setSelectDate] = useState('');
    const [selectContractororVendorName, setSelectContractororVendorName] = useState('');
    const [selectProjectName, setSelectProjectName] = useState('');
    const [selectType, setSelectType] = useState('');
    const [selectExpenseAmount, setSelectExpenseAmount] = useState('');
    const { sortField: expensesSortField, sortDirection: expensesSortDirection, sortProps: expensesSortProps } = useEdbcTableSort();
    const { sortField: paymentsSortField, sortDirection: paymentsSortDirection, sortProps: paymentsSortProps } = useEdbcTableSort();
    // Click and drag scrolling functionality
    const scrollRef = useRef(null);
    const filterRowRef = useRef(null);
    const filterNudgeUsedRef = useRef(false);
    const paymentsScrollRef = useRef(null);
    const paymentsFilterRowRef = useRef(null);
    const paymentsFilterNudgeUsedRef = useRef(false);
    const expensesFilterChipsRef = useRef(null);
    const paymentsFilterChipsRef = useRef(null);
    const isDragging = useRef(false);
    const activeScrollRef = useRef(null);
    const start = useRef({ x: 0, y: 0 });
    const lastPosition = useRef({ x: 0, y: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const animationFrame = useRef(null);
    const lastMove = useRef({ time: 0, x: 0, y: 0 });
    const dragHorizontalOnly = useRef(false);
    const [overallSearch, setOverallSearch] = useState('');
    const { expandedCells, toggleExpandedCell } = useEdbcExpandedCells();
    const handleMouseDown = (e, ref = scrollRef, horizontalOnly = false) => {
        if (!ref.current) return;
        const interactiveSelector = 'input, select, textarea, button, a, [contenteditable="true"], [role="button"]';
        if (e.target instanceof Element && e.target.closest(interactiveSelector)) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        isDragging.current = true;
        dragHorizontalOnly.current = horizontalOnly;
        activeScrollRef.current = ref.current;
        start.current = { x: e.clientX, y: e.clientY };
        lastPosition.current = { x: e.clientX, y: e.clientY };
        lastMove.current = {
            time: Date.now(),
            x: e.clientX,
            y: e.clientY,
        };
        ref.current.style.cursor = 'grabbing';
        ref.current.style.userSelect = 'none';
        ref.current.style.scrollBehavior = 'auto';
        cancelMomentum();
    };
    const handleMouseMove = (e, ref = scrollRef, horizontalOnly = false) => {
        if (!isDragging.current || !ref.current || activeScrollRef.current !== ref.current) return;
        e.stopPropagation();
        const now = Date.now();
        const dt = now - lastMove.current.time || 16;
        const deltaX = e.clientX - lastPosition.current.x;
        const deltaY = e.clientY - lastPosition.current.y;
        const isHorizontalOnly = horizontalOnly || dragHorizontalOnly.current;
        velocity.current = {
            x: (e.clientX - lastMove.current.x) / dt,
            y: isHorizontalOnly ? 0 : (e.clientY - lastMove.current.y) / dt,
        };
        if (ref.current && (deltaX !== 0 || (!isHorizontalOnly && deltaY !== 0))) {
            ref.current.scrollBy({
                left: -deltaX,
                top: isHorizontalOnly ? 0 : -deltaY,
                behavior: 'auto',
            });
        }
        lastPosition.current = { x: e.clientX, y: e.clientY };
        lastMove.current = {
            time: now,
            x: e.clientX,
            y: e.clientY,
        };
    };
    const handleMouseUp = (ref = scrollRef) => {
        if (!isDragging.current || !ref.current || activeScrollRef.current !== ref.current) return;
        isDragging.current = false;
        if (ref.current) {
            ref.current.style.cursor = '';
            ref.current.style.userSelect = '';
            ref.current.style.scrollBehavior = '';
        }
        applyMomentum();
        activeScrollRef.current = null;
    };
    const cancelMomentum = () => {
        if (animationFrame.current) {
            cancelAnimationFrame(animationFrame.current);
            animationFrame.current = null;
        }
    };
    const applyMomentum = () => {
        if (!activeScrollRef.current) return;
        const friction = 0.95;
        const minVelocity = 0.1;
        const step = () => {
            const { x, y } = velocity.current;
            const activeRef = activeScrollRef.current;
            if (!activeRef) {
                cancelMomentum();
                return;
            }
            if (Math.abs(x) > minVelocity || (!dragHorizontalOnly.current && Math.abs(y) > minVelocity)) {
                activeRef.scrollLeft -= x * 20;
                if (!dragHorizontalOnly.current) {
                    activeRef.scrollTop -= y * 20;
                }
                velocity.current.x *= friction;
                velocity.current.y *= friction;
                animationFrame.current = requestAnimationFrame(step);
            } else {
                cancelMomentum();
                activeScrollRef.current = null;
            }
        };
        animationFrame.current = requestAnimationFrame(step);
    };
    useEffect(() => {
        fetchWeeklyReceivedType();
        fetchPurposeOptions();
    }, []);
    useEffect(() => {
        fetchWeeklyPaymentBills();
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
            const formattedData = data.map((item) => ({
                value: item.purpose,
                label: item.purpose,
                id: item.id,
                type: "Purpose"
            }));
            setPurposeOptions(formattedData);
        } catch (error) {
            console.error("Error fetching purpose options: ", error);
            setPurposeOptions([]);
        }
    };
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    };
    const [newExpense, setNewExpense] = useState({
        date: getTodayDate(),
        contractor: "",
        vendor: "",
        employee: "",
        client_name: "",
        client_id: "",
        project: "",
        type: "",
        amount: "",
        staff_advance_portal_id: "",
        loan_portal_id: "",
    });
    const [editingRowId, setEditingRowId] = useState(null);
    const [editingOriginalRow, setEditingOriginalRow] = useState(null);
    const [editFormData, setEditFormData] = useState({
        date: "",
        contractor_id: "",
        vendor_id: "",
        employee_id: "",
        client_name: "",
        client_id: "",
        project_id: "",
        type: "",
        amount: "",
        advance_portal_id: "",
        staff_advance_portal_id: "",
        loan_portal_id: "",
        description: "",
    });
    const handleEditClick = async (row) => {
        setEditingRowId(row.id);
        setEditingOriginalRow({ ...row });
        let description = row.description || "";
        if (row.advance_portal_id) {
            try {
                const res = await fetch(
                    `https://backendaab.in/demoAabuildersDash/api/advance_portal/get/${row.advance_portal_id}`
                );
                if (!res.ok) throw new Error("Failed to fetch advance portal data");
                const data = await res.json();
                description = data.description || description;
            } catch (error) {
                console.error("Error fetching advance portal data:", error);
            }
        }
        if (row.staff_advance_portal_id) {
            try {
                const res = await fetch(
                    `https://backendaab.in/demoAabuildersDash/api/staff-advance/${row.staff_advance_portal_id}`
                );
                if (!res.ok) throw new Error("Failed to fetch staff advance data");

                const data = await res.json();
                description = data.description || description;
            } catch (error) {
                console.error("Error fetching staff advance data:", error);
            }
        }
        setEditFormData({
            date: row.date,
            contractor_id: row.contractor_id,
            vendor_id: row.vendor_id,
            employee_id: row.employee_id,
            client_name: row.client_name || "",
            client_id: row.client_id || "",
            project_id: row.project_id,
            type: row.type,
            amount: row.amount,
            advance_portal_id: row.advance_portal_id,
            staff_advance_portal_id: row.staff_advance_portal_id,
            loan_portal_id: row.loan_portal_id || "",
            description: description,
            branch_id: row.branch_id ?? row.branchId ?? activeBranchId ?? null,
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
        if (name === "date") {
            // Validate date against current week range
            const validationWeekNumber = operationalWeekNumber || currentWeekNumber;
            if (!value || !validationWeekNumber) {
                setEditFormData((prev) => ({ ...prev, date: value }));
                return;
            }
            const year = new Date().getFullYear();
            const { startDate, endDate } = getStartAndEndDateOfISOWeek(validationWeekNumber, year);
            const selectedDate = new Date(value);
            selectedDate.setHours(0, 0, 0, 0);
            if (selectedDate < startDate || selectedDate > endDate) {
                setPopup({
                    show: true,
                    message: `Selected date is out of current week range (${startDate.toLocaleDateString("en-GB")} - ${endDate.toLocaleDateString("en-GB")})`,
                    type: "edit-expense",
                    dateStr: value,
                    editRowId: editingRowId,
                    editIndex: null,
                    originalDate: editFormData.date || ""
                });
                return; // Prevent date change
            }
            setEditFormData((prev) => ({ ...prev, date: value }));
        }
        else if (name === "amount") {
            let numericValue = parseFloat(value);
            if (isNaN(numericValue)) numericValue = "";
            if (numericValue > balance) {
                alert(`Amount cannot exceed balance: ${balance}`);
                numericValue = "";
            }
            if (numericValue < 0) numericValue = 0;
            setEditFormData((prev) => ({ ...prev, amount: numericValue }));
        }
        else if (name === "description") {
            setEditFormData((prev) => ({ ...prev, description: value }));
        }
        else if (name === "type") {
            // Validate type selection against current party selection
            const allowedTypesForClient = ["Loan", "Bank", "Claim"];
            const isClientTypeAllowed = allowedTypesForClient.includes(value);
            if (value === "Staff Advance") {
                // Staff Advance only allows Employee
                if (editFormData.contractor_id || editFormData.vendor_id || editFormData.client_id) {
                    alert("Staff Advance type only allows Employee. Please select an Employee or clear the Contractor/Vendor/Client selection.");
                    return; // Prevent type change
                }
            } else if (value === "Project Advance") {
                // Project Advance only allows Contractor or Vendor
                if (editFormData.employee_id || editFormData.client_id) {
                    alert("Project Advance type only allows Contractor or Vendor. Please select a Contractor or Vendor or clear the Employee/Client selection.");
                    return; // Prevent type change
                }
            }
            // If type doesn't allow client selection and client toggle is active, disable it and clear client selection
            if (!isClientTypeAllowed && isClientToggleActive) {
                setIsClientToggleActive(false);
                setSelectedClient(null);
                setClientProjectOptions([]);
                setEditFormData((prev) => ({
                    ...prev,
                    [name]: value,
                    client_name: "",
                    client_id: "",
                }));
                return;
            }
            // If validation passes, update the type
            setEditFormData((prev) => ({ ...prev, [name]: value }));
        }
        else {
            setEditFormData((prev) => ({ ...prev, [name]: value }));
        }
    };
    const [payments, setPayments] = useState([]);
    const [newPayment, setNewPayment] = useState({ date: "", amount: "", type: "Weekly" });
    const [showPopup, setShowPopup] = useState(false);
    const [showPopups, setShowPopups] = useState(false);
    const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
    const [carryForwardBalance, setCarryForwardBalance] = useState(0);
    const [editingPaymentId, setEditingPaymentId] = useState(null);
    const [editPaymentData, setEditPaymentData] = useState({
        date: "",
        amount: "",
        type: "",
        branch_id: ""
    });
    const [showPaymentPopup, setShowPaymentPopup] = useState(false);
    const [paymentPopupData, setPaymentPopupData] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: "",
        paymentMode: "",
        chequeNo: "",
        chequeDate: "",
        transactionNumber: "",
        accountNumber: ""
    });
    const [currentProjectAdvanceRow, setCurrentProjectAdvanceRow] = useState(null);
    const [previousPayments, setPreviousPayments] = useState([]);
    const [fileUploadPopup, setFileUploadPopup] = useState(false);
    const [showBillExpenseEntryModal, setShowBillExpenseEntryModal] = useState(false);
    const [showBillSettlementAdvanceModal, setShowBillSettlementAdvanceModal] = useState(false);
    const [currentFileRow, setCurrentFileRow] = useState(null);
    const [selectedFileForPopup, setSelectedFileForPopup] = useState(null);
    const [removedBillCopyRows, setRemovedBillCopyRows] = useState({});
    const REMOVED_BILL_COPY_STORAGE_KEY = 'cashRegister_removedBillCopyIds';
    const isRestorableRemovedBillCopy = (row) => {
        if (!row) return false;
        if (
            row.removed_bill_copy_url ??
            row.removedBillCopyUrl ??
            row.stored_bill_copy_url ??
            row.storedBillCopyUrl ??
            row.backup_bill_copy_url ??
            row.backupBillCopyUrl
        ) {
            return true;
        }
        return row.bill_copy_url_removed === true || row.billCopyUrlRemoved === true;
    };
    const buildRemovedBillCopyRowsMap = (expensesList) => {
        const map = {};
        const expenses = expensesList || [];
        expenses.forEach((exp) => {
            if (exp?.id != null && !exp.bill_copy_url && isRestorableRemovedBillCopy(exp)) {
                map[exp.id] = true;
            }
        });
        try {
            const stored = JSON.parse(localStorage.getItem(REMOVED_BILL_COPY_STORAGE_KEY) || '[]');
            const ids = Array.isArray(stored) ? stored : [];
            const nextStored = [];
            ids.forEach((id) => {
                const row = expenses.find((e) => String(e.id) === String(id));
                if (!row) {
                    nextStored.push(Number(id));
                    return;
                }
                if (!row.bill_copy_url) {
                    map[row.id] = true;
                    nextStored.push(Number(id));
                }
            });
            localStorage.setItem(REMOVED_BILL_COPY_STORAGE_KEY, JSON.stringify(nextStored));
        } catch {
            // ignore
        }
        return map;
    };
    const persistRemovedBillCopyId = (id) => {
        try {
            const stored = JSON.parse(localStorage.getItem(REMOVED_BILL_COPY_STORAGE_KEY) || '[]');
            const ids = Array.isArray(stored) ? stored : [];
            if (!ids.some((x) => String(x) === String(id))) {
                localStorage.setItem(REMOVED_BILL_COPY_STORAGE_KEY, JSON.stringify([...ids, Number(id)]));
            }
        } catch {
            // ignore
        }
    };
    const clearPersistedRemovedBillCopyId = (id) => {
        try {
            const stored = JSON.parse(localStorage.getItem(REMOVED_BILL_COPY_STORAGE_KEY) || '[]');
            localStorage.setItem(
                REMOVED_BILL_COPY_STORAGE_KEY,
                JSON.stringify((Array.isArray(stored) ? stored : []).filter((x) => String(x) !== String(id)))
            );
        } catch {
            // ignore
        }
    };
    const [accountDetails, setAccountDetails] = useState([]);
    const [showCategoryPopup, setShowCategoryPopup] = useState(false);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isConfirmingCategory, setIsConfirmingCategory] = useState(false);
    const [categoryComments, setCategoryComments] = useState("");
    const [purposeOptions, setPurposeOptions] = useState([]);
    const [showPurposePopup, setShowPurposePopup] = useState(false);
    const [selectedPurpose, setSelectedPurpose] = useState(null);
    const [loanPurposeDescription, setLoanPurposeDescription] = useState("");
    const [pendingLoanData, setPendingLoanData] = useState(null);
    const [showPaymentDetailsPopup, setShowPaymentDetailsPopup] = useState(false);
    const [selectedPaymentDetails, setSelectedPaymentDetails] = useState([]);
    const getWeeklyExpenseTypeId = useCallback((typeLabel) => {
        if (typeLabel === null || typeLabel === undefined || String(typeLabel).trim() === "") return null;
        const found = weeklyTypes.find((t) => t && t.type === typeLabel);
        if (!found) return null;
        const id = found.id;
        return id !== undefined && id !== null && !Number.isNaN(Number(id)) ? Number(id) : null;
    }, [weeklyTypes]);
    const isWeeklyExpenseTypeMatched = useCallback(
        (typeLabel) => getWeeklyExpenseTypeId(typeLabel) !== null,
        [getWeeklyExpenseTypeId]
    );
    const getWeeklyReceivedTypeId = useCallback((receivedLabel) => {
        if (receivedLabel === null || receivedLabel === undefined || String(receivedLabel).trim() === "") return null;
        const found = weeklyReceivedTypes.find((t) => t && t.received_type === receivedLabel);
        if (!found) return null;
        const id = found.id;
        return id !== undefined && id !== null && !Number.isNaN(Number(id)) ? Number(id) : null;
    }, [weeklyReceivedTypes]);
    const handleEditPaymentClick = (row) => {
        setEditingPaymentId(row.id || null);
        setEditPaymentData({
            date: row.date,
            amount: row.amount,
            type: row.type,
            branch_id: row.branch_id ?? row.branchId ?? activeBranchId ?? null
        });
    };
    const saveWeeklyPaymentBill = async (paymentData) => {
        try {
            const finalPaymentData = {
                ...paymentData,
                branch_id: paymentData?.branch_id ?? activeBranchId ?? null,
                entered_by: enteredBy,
                source: "Cash Register",
            };
            const response = await fetch("https://backendaab.in/demoAabuildersDash/api/weekly-payment-bills/save", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(finalPaymentData)
            });
            if (!response.ok) {
                throw new Error("Network response was not ok: " + response.statusText);
            }
            const result = await response.json();
            return result;

        } catch (error) {
            console.error("Error saving payment:", error);
            throw error;
        }
    };
    const fetchWeeklyPaymentBills = async () => {
        try {
            const response = await fetch("https://backendaab.in/demoAabuildersDash/api/weekly-payment-bills/all", {
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
            setWeeklyPaymentBills(data);
            return data;
        } catch (error) {
            console.error("Error fetching payment bills:", error);
            return [];
        }
    };
    const getPaymentsByExpenseId = (expenseId) => {
        if (!weeklyPaymentBills || weeklyPaymentBills.length === 0) {
            return [];
        }
        const payments = weeklyPaymentBills.filter(bill => bill.weekly_payment_expense_id === expenseId);
        return payments;
    };
    // File upload functions — Bill rows open Expenses Entry (Bill Payments) like Utility Dashboard
    const handleFileUploadClick = (row) => {
        if (row.type === 'Bill Payment' || row.type === 'Claim') {
            const project = siteOptions.find((opt) => Number(opt.id) === Number(row.project_id));
            const resolvedSiteName = project?.label ?? '';
            const isSummaryBillProject = String(resolvedSiteName).trim() === "Summary Bill";
            const siteName = isSummaryBillProject ? "" : resolvedSiteName;
            let dateStr = '';
            if (row.date) {
                const d = String(row.date);
                dateStr = d.includes('T') ? d.split('T')[0] : d;
            }
            const rawVid = row.vendor_id ?? row.vendorId;
            const rawCid = row.contractor_id ?? row.contractorId;
            const vendorName =
                row.vendor ??
                row.vendor_name ??
                row.vendorName ??
                (rawVid != null && !Number.isNaN(Number(rawVid)) ? getVendorName(Number(rawVid)) : "") ??
                "";
            const contractorName =
                row.contractor ??
                row.contractor_name ??
                row.contractorName ??
                (rawCid != null && !Number.isNaN(Number(rawCid)) ? getContractorName(Number(rawCid)) : "") ??
                "";
            const prefill = {
                accountType: row.type === 'Claim' ? 'Claim Payment' : 'Bill Payments',
                siteName,
                amount: row.amount,
                date: dateStr,
                client_id: row.client_id ?? row.clientId ?? "",
                client_name: row.client_name ?? row.clientName ?? "",
                vendorId:
                    rawVid != null && String(rawVid).trim() !== '' && !Number.isNaN(Number(rawVid))
                        ? Number(rawVid)
                        : null,
                contractorId:
                    rawCid != null && String(rawCid).trim() !== '' && !Number.isNaN(Number(rawCid))
                        ? Number(rawCid)
                        : null,
                vendorName,
                contractorName,
                summaryBillTotal:
                    isSummaryBillProject && row.amount != null && row.amount !== ""
                        ? Number(row.amount)
                        : null,
                paymentMode: 'Cash',
                fromWeeklyCashRegister: true,
                weeklyExpenseId: row.id,
            };
            localStorage.setItem('expenseEntryPrefill', JSON.stringify(prefill));
            setShowBillExpenseEntryModal(true);
            return;
        }
        if (row.type === 'Bill Settlement') {
            const project = siteOptions.find((opt) => Number(opt.id) === Number(row.project_id));
            const resolvedSiteName = project?.label ?? '';
            let dateStr = '';
            if (row.date) {
                const d = String(row.date);
                dateStr = d.includes('T') ? d.split('T')[0] : d;
            }
            const rawVid = row.vendor_id ?? row.vendorId;
            const rawCid = row.contractor_id ?? row.contractorId;
            const vendorName =
                row.vendor ??
                row.vendor_name ??
                row.vendorName ??
                (rawVid != null && !Number.isNaN(Number(rawVid)) ? getVendorName(Number(rawVid)) : "") ??
                "";
            const contractorName =
                row.contractor ??
                row.contractor_name ??
                row.contractorName ??
                (rawCid != null && !Number.isNaN(Number(rawCid)) ? getContractorName(Number(rawCid)) : "") ??
                "";
            const selectedOptionPrefill =
                rawVid != null && String(rawVid).trim() !== "" && !Number.isNaN(Number(rawVid))
                    ? {
                        id: Number(rawVid),
                        value: vendorName,
                        label: vendorName,
                        type: "Vendor",
                    }
                    : rawCid != null && String(rawCid).trim() !== "" && !Number.isNaN(Number(rawCid))
                        ? {
                            id: Number(rawCid),
                            value: contractorName,
                            label: contractorName,
                            type: "Contractor",
                        }
                        : null;
            const selectedSitePrefill = project
                ? {
                    id: Number(project.id),
                    value: project.value ?? project.label,
                    label: project.label,
                    sNo: project.sNo,
                }
                : null;
            try {
                sessionStorage.setItem("selectedType", JSON.stringify("Bill Settlement"));
                if (selectedOptionPrefill) {
                    sessionStorage.setItem("selectedOption", JSON.stringify(selectedOptionPrefill));
                } else {
                    sessionStorage.removeItem("selectedOption");
                }
                if (selectedSitePrefill) {
                    sessionStorage.setItem("selectedSite", JSON.stringify(selectedSitePrefill));
                } else {
                    sessionStorage.removeItem("selectedSite");
                }
                // Amount Given should be prefilled, bill amount should be empty (user fills)
                if (row.amount != null && row.amount !== "") {
                    sessionStorage.setItem("advanceAmount", JSON.stringify(String(row.amount)));
                } else {
                    sessionStorage.removeItem("advanceAmount");
                }
                sessionStorage.removeItem("billAmount");
                sessionStorage.setItem("paymentMode", JSON.stringify("Cash"));
                sessionStorage.removeItem("description");
                // best-effort prefill for date (Advance Portal uses dateValue state; keep for future extension)
                if (dateStr) sessionStorage.setItem("cashRegisterBillSettlementDate", JSON.stringify(dateStr));
                // used by AdvancePortal popup to update this weekly expense row with uploaded bill URL
                sessionStorage.setItem("advancePortalWeeklyExpenseIdForBillCopyUrl", JSON.stringify(row.id));
            } catch {
                // ignore storage failures
            }
            setShowBillSettlementAdvanceModal(true);
            return;
        }
        setCurrentFileRow(row);
        setSelectedFileForPopup(null);
        setFileUploadPopup(true);
    };
    const canCloseExpenseEntryModal = () => {
        try {
            const raw = localStorage.getItem('expenseEntryPrefill');
            if (!raw) return true;
            const parsed = JSON.parse(raw);
            const total = Number(parsed?.summaryBillTotal ?? parsed?.summary_bill_total ?? 0);
            if (Number.isFinite(total) && total > 0) {
                alert('Please complete the full Summary Bill amount before closing this popup.');
                return false;
            }
            return true;
        } catch {
            return true;
        }
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

            const uploadFormData = new FormData();

            // ✅ CHANGE 1: "files" instead of "file"
            uploadFormData.append("files", selectedFileForPopup);

            // ✅ CHANGE 2: required folder
            uploadFormData.append("folder", "FileUpload / Cash_Register");

            // ✅ CHANGE 3: filename param
            uploadFormData.append("fileName", finalName);

            const uploadResponse = await fetch(
                "https://backendaab.in/demoAabuildersDash/api/files/upload",
                {
                    method: "POST",
                    body: uploadFormData,
                }
            );

            if (!uploadResponse.ok) {
                throw new Error("File upload failed");
            }

            const uploadResult = await uploadResponse.json();

            // ✅ CHANGE 4: new response format
            const pdfUrl = uploadResult.urls[0];

            const updateResponse = await fetch(`https://backendaab.in/demoAabuildersDash/api/weekly-expenses/${currentFileRow.id}/bill-copy-url`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pdfUrl)
            });
            if (!updateResponse.ok) {
                throw new Error("Failed to update bill copy URL");
            }
            setExpenses((prev) =>
                prev.map((exp) => (exp.id === currentFileRow.id ? { ...exp, bill_copy_url: pdfUrl } : exp))
            );
            setRemovedBillCopyRows((prev) => {
                const next = { ...prev };
                delete next[currentFileRow.id];
                return next;
            });
            clearPersistedRemovedBillCopyId(currentFileRow.id);
            setFileUploadPopup(false);
            setCurrentFileRow(null);
            setSelectedFileForPopup(null);
            setPopup({
                show: true,
                message: "File uploaded successfully!",
                type: "success",
                dateStr: new Date().toLocaleDateString('en-GB'),
                editRowId: null,
                editIndex: null,
                originalDate: ""
            });
        } catch (error) {
            console.error("Error uploading file:", error);
            setPopup({
                show: true,
                message: "Error during file upload. Please try again.",
                type: "error",
                dateStr: new Date().toLocaleDateString('en-GB'),
                editRowId: null,
                editIndex: null,
                originalDate: ""
            });
        }
    };
    const handleRemoveBillCopyUrl = async (row) => {
        if (!row?.id) return;
        const shouldRemove = window.confirm('Remove attached bill file?');
        if (!shouldRemove) return;
        try {
            const response = await fetch(`https://backendaab.in/demoAabuildersDash/api/weekly-expenses/${row.id}/remove-bill`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(username || ''),
            });
            if (!response.ok) {
                throw new Error('Failed to remove bill copy URL');
            }
            setExpenses((prev) =>
                prev.map((exp) => (exp.id === row.id ? { ...exp, bill_copy_url: null } : exp))
            );
            setRemovedBillCopyRows((prev) => ({ ...prev, [row.id]: true }));
            persistRemovedBillCopyId(row.id);
            setPopup({
                show: true,
                message: "Bill file removed successfully!",
                type: "success",
                dateStr: new Date().toLocaleDateString('en-GB'),
                editRowId: null,
                editIndex: null,
                originalDate: ""
            });
        } catch (error) {
            console.error("Error removing bill file:", error);
            setPopup({
                show: true,
                message: "Failed to remove bill file. Please try again.",
                type: "error",
                dateStr: new Date().toLocaleDateString('en-GB'),
                editRowId: null,
                editIndex: null,
                originalDate: ""
            });
        }
    };
    const handleRestoreBillCopyUrl = async (row) => {
        if (!row?.id) return;
        try {
            const response = await fetch(`https://backendaab.in/demoAabuildersDash/api/weekly-expenses/${row.id}/restore-bill`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Failed to restore bill copy URL');
            }
            const restored = await response.json().catch(() => null);
            const restoredUrl = restored?.bill_copy_url ?? restored?.billCopyUrl ?? null;
            setExpenses((prev) =>
                prev.map((exp) =>
                    exp.id === row.id ? { ...exp, bill_copy_url: restoredUrl || exp.bill_copy_url } : exp
                )
            );
            setRemovedBillCopyRows((prev) => {
                const next = { ...prev };
                delete next[row.id];
                return next;
            });
            clearPersistedRemovedBillCopyId(row.id);
            setPopup({
                show: true,
                message: "Bill file restored successfully!",
                type: "success",
                dateStr: new Date().toLocaleDateString('en-GB'),
                editRowId: null,
                editIndex: null,
                originalDate: ""
            });
        } catch (error) {
            console.error("Error restoring bill file:", error);
            setPopup({
                show: true,
                message: "Failed to restore bill file. Please try again.",
                type: "error",
                dateStr: new Date().toLocaleDateString('en-GB'),
                editRowId: null,
                editIndex: null,
                originalDate: ""
            });
        }
    };
    const getPaymentsByType = (expenseId, billPaymentMode) => {
        if (!weeklyPaymentBills || weeklyPaymentBills.length === 0) {
            return [];
        }
        return weeklyPaymentBills.filter(bill =>
            bill.weekly_payment_expense_id === expenseId && bill.bill_payment_mode === billPaymentMode
        );
    };
    const fetchAuditDetailsForExpense = async (expensesId) => {
        try {
            const response = await fetch(`https://backendaab.in/demoAabuildersDash/api/weekly_payment_audit/expenses/${expensesId}`);
            const data = await response.json();
            setWeeklyPaymentExpensesAudits(data);
            setShowWeeklyPaymentExpensesModal(true);
        } catch (error) {
            console.error("Error fetching audit details:", error);
        }
    };
    const fetchAuditDetailsForPaymentReceived = async (receivedId) => {
        try {
            const response = await fetch(`https://backendaab.in/demoAabuildersDash/api/weekly_payment_audit/payments/${receivedId}`);
            const data = await response.json();
            setWeeklyPaymentReceivedAudits(data);
            setShowWeeklyPaymentReceivedModal(true);
        } catch (error) {
            console.error("Error fetching audit details:", error);
        }
    };
    const handleEditPaymentChange = (e) => {
        const { name, value } = e.target;
        if (name === "date") {
            const validationWeekNumber = operationalWeekNumber || currentWeekNumber;
            if (!value || !validationWeekNumber) {
                setEditPaymentData((prev) => ({ ...prev, date: value }));
                return;
            }
            const year = new Date().getFullYear();
            const { startDate, endDate } = getStartAndEndDateOfISOWeek(validationWeekNumber, year);
            const selectedDate = new Date(value);
            selectedDate.setHours(0, 0, 0, 0);
            if (selectedDate < startDate || selectedDate > endDate) {
                const paymentIndex = payments.findIndex(p => p.id === editingPaymentId);
                setPopup({
                    show: true,
                    message: `Selected date is out of current week range (${startDate.toLocaleDateString("en-GB")} - ${endDate.toLocaleDateString("en-GB")})`,
                    type: "edit-payment",
                    dateStr: value,
                    editRowId: null,
                    editIndex: paymentIndex !== -1 ? paymentIndex : null,
                    originalDate: editPaymentData.date || ""
                });
                return;
            }
            setEditPaymentData((prev) => ({ ...prev, date: value }));
        } else {
            setEditPaymentData((prev) => ({ ...prev, [name]: value }));
        }
    };
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
        const fetchProjects = async () => {
            try {
                const response = await fetch("https://backendaab.in/demoAabuilderDash/api/projects/getAll", {
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
                const projectClientMapTemp = {};
                const projectClientNameTemp = {};
                const projectOptions = Array.isArray(data)
                    ? data.map((project, index) => {
                        const label = (project.projectName || project.projectReferenceName || `Project ${project.projectId || project.id || index + 1}`).trim();
                        const rawId = project.id ?? project.projectId ?? (100000 + index);
                        const optionId = Number(rawId);
                        const option = {
                            value: label,
                            label,
                            id: optionId,
                            sNo: project.projectId || "",
                        };
                        const ownerCandidates = Array.isArray(project?.ownerDetailsList)
                            ? project.ownerDetailsList
                            : Array.isArray(project?.ownerDetails)
                                ? project.ownerDetails
                                : [];
                        ownerCandidates.forEach((owner) => {
                            const key = buildClientKey(owner?.clientName, owner?.fatherName, owner?.mobile);
                            if (!key) return;
                            if (!projectClientMapTemp[key]) {
                                projectClientMapTemp[key] = {
                                    name: owner.clientName,
                                    fatherName: owner.fatherName || "",
                                    mobile: owner.mobile || "",
                                    clientId: owner.id || key,
                                    projects: [],
                                };
                            }
                            projectClientMapTemp[key].projects.push(option);
                            if (!projectClientNameTemp[optionId]) {
                                projectClientNameTemp[optionId] = owner.clientName || "";
                            }
                        });
                        if (!projectClientNameTemp[optionId]) {
                            projectClientNameTemp[optionId] = "";
                        }
                        return option;
                    })
                    : [];
                const combinedSiteOptions = [...predefinedSiteOptions, ...projectOptions];
                setSiteOptions(combinedSiteOptions);
                const clientOptionList = Object.entries(projectClientMapTemp).map(([key, value], idx) => ({
                    value: value.name,
                    label: value.name,
                    id: value.clientId || `client-${idx}`,
                    clientId: value.clientId || `client-${idx}`,
                    fatherName: value.fatherName,
                    mobile: value.mobile,
                    type: "Client",
                    compositeKey: key,
                    projects: value.projects,
                }));
                setClientOptions(clientOptionList);
                setClientProjectMap(projectClientMapTemp);
                setProjectIdToClientName(projectClientNameTemp);
            } catch (error) {
                console.error("Error fetching projects:", error);
                setClientOptions([]);
                setClientProjectMap({});
                setProjectIdToClientName({});
            }
        };
        fetchProjects();
    }, []);

    const siteOptionsForNewEntry = useMemo(() => {
        const hiddenPredefinedIds = new Set([1, 2, 3, 4, 5, 6, 8, 9, 10, 11]);
        return (siteOptions || []).filter((opt) => {
            if (String(opt?.label || opt?.value || "").trim() === "Multi-Project Batch") return false;
            const idNum = Number(opt?.id);
            if (Number.isFinite(idNum) && hiddenPredefinedIds.has(idNum)) return false;
            return true;
        });
    }, [siteOptions]);
    useEffect(() => {
        fetchWeeklyType();
    }, []);
    useEffect(() => {
        fetchAccountDetails();
    }, []);
    useEffect(() => {
        fetchCategories();
    }, []);
    const fetchWeeklyType = async () => {
        try {
            const response = await fetch('https://backendaab.in/demoAabuildersDash/api/weekly_types/getAll');
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
    const fetchAccountDetails = async () => {
        try {
            const response = await fetch('https://backendaab.in/demoAabuildersDash/api/account-details/getAll');
            if (response.ok) {
                const data = await response.json();
                setAccountDetails(data);
            } else {
                console.error('Error fetching account details');
            }
        } catch (error) {
            console.error('Error fetching account details:', error);
        }
    };
    const fetchCategories = async () => {
        try {
            const response = await fetch("https://backendaab.in/demoAabuilderDash/api/expenses_categories/getAll", {
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
                id: item.id,
                value: item.category,
                label: item.category,
            }));
            setCategoryOptions(formattedData);
        } catch (error) {
            console.error("Fetch error: ", error);
        }
    };
    const fetchCurrentWeekNumber = useCallback(() => {
        fetch("https://backendaab.in/demoAabuildersDash/api/payments-received/current-week")
            .then((res) => res.json())
            .then(setCurrentWeekNumber)
            .catch(console.error);
    }, []);
    const checkCurrentWeekStatus = useCallback(async () => {
        if (!actualCurrentWeekNumber) {
            setCurrentWeekHasStatusTrue(false);
            return;
        }
        try {
            const [expensesRes, paymentsRes] = await Promise.all([
                fetch(buildBranchUrl(`https://backendaab.in/demoAabuildersDash/api/weekly-expenses/week/${actualCurrentWeekNumber}`)),
                fetch(buildBranchUrl(`https://backendaab.in/demoAabuildersDash/api/payments-received/week/${actualCurrentWeekNumber}`))
            ]);
            if (expensesRes.ok && paymentsRes.ok) {
                const expensesData = await expensesRes.json();
                const paymentsData = await paymentsRes.json();
                const hasStatusTrue =
                    (Array.isArray(expensesData) && expensesData.some((expense) => expense.status === true)) ||
                    (Array.isArray(paymentsData) && paymentsData.some((payment) => payment.status === true));
                setCurrentWeekHasStatusTrue(hasStatusTrue);
            } else {
                setCurrentWeekHasStatusTrue(false);
            }
        } catch (error) {
            console.error("Error checking current week status:", error);
            setCurrentWeekHasStatusTrue(false);
        }
    }, [actualCurrentWeekNumber, buildBranchUrl]);

    const fetchWeekStatus = useCallback(async (weekNumber) => {
        const [expensesRes, paymentsRes] = await Promise.all([
            fetch(buildBranchUrl(`https://backendaab.in/demoAabuildersDash/api/weekly-expenses/week/${weekNumber}`)),
            fetch(buildBranchUrl(`https://backendaab.in/demoAabuildersDash/api/payments-received/week/${weekNumber}`))
        ]);
        const expensesData = expensesRes.ok ? await expensesRes.json() : [];
        const paymentsData = paymentsRes.ok ? await paymentsRes.json() : [];
        const hasData =
            (Array.isArray(expensesData) && expensesData.length > 0) ||
            (Array.isArray(paymentsData) && paymentsData.length > 0);
        const closed =
            (Array.isArray(expensesData) && expensesData.some((e) => e?.status === true)) ||
            (Array.isArray(paymentsData) && paymentsData.some((p) => p?.status === true));
        return { weekNumber, expensesData, paymentsData, hasData, closed };
    }, [buildBranchUrl]);

    const updatePreviousWeekFlagsFromCache = useCallback((operationalWeek, statusByWeek) => {
        const previousWeekNumber = operationalWeek === 1 ? 52 : operationalWeek - 1;
        const prevStatus = statusByWeek.get(previousWeekNumber);
        if (prevStatus) {
            setPreviousWeekHasData(Boolean(prevStatus.hasData));
            setPreviousWeekHasStatusTrue(Boolean(prevStatus.closed));
            return;
        }
        setPreviousWeekHasData(false);
        setPreviousWeekHasStatusTrue(false);
    }, []);

    const applyResolvedOperationalWeek = useCallback((weekNum, status, statusByWeek) => {
        pendingWeekDataRef.current = {
            week: weekNum,
            expenses: status.expensesData,
            payments: status.paymentsData,
        };
        lastPortalDescriptionKeyRef.current = "";
        lastStaffAdvanceDescriptionKeyRef.current = "";
        updatePreviousWeekFlagsFromCache(weekNum, statusByWeek);
        setActiveWeekNumber(weekNum);
        writeCachedActiveWeek(weekNum);
        setIsWeekResolved(true);
    }, [updatePreviousWeekFlagsFromCache, writeCachedActiveWeek]);

    // Walk back from current week and show the oldest open week that has data.
    // Never show current/next week while any earlier week is still open.
    const resolveOperationalWeek = useCallback(async () => {
        if (!actualCurrentWeekNumber) return;
        const token = ++weekResolveTokenRef.current;
        setIsWeekResolved(false);
        try {
            const weekNumbers = Array.from(
                { length: WEEKLY_PAYMENT_WEEK_LOOKBACK },
                (_, index) => getIsoWeekWithOffset(actualCurrentWeekNumber, WEEKLY_PAYMENT_WEEK_LOOKBACK - 1 - index)
            );
            const statuses = await Promise.all(weekNumbers.map((weekNum) => fetchWeekStatus(weekNum)));
            if (token !== weekResolveTokenRef.current) return;

            const statusByWeek = new Map(statuses.map((status) => [status.weekNumber, status]));
            const openStatus = statuses.find((status) => status.hasData && !status.closed);

            if (openStatus) {
                setCurrentWeekHasStatusTrue(false);
                applyResolvedOperationalWeek(openStatus.weekNumber, openStatus, statusByWeek);
                return;
            }

            const currentStatus = statusByWeek.get(actualCurrentWeekNumber)
                ?? await fetchWeekStatus(actualCurrentWeekNumber);
            if (token !== weekResolveTokenRef.current) return;

            statusByWeek.set(currentStatus.weekNumber, currentStatus);
            setCurrentWeekHasStatusTrue(Boolean(currentStatus.closed));
            const decidedWeek = currentStatus.closed ? nextCalendarWeekNumber : actualCurrentWeekNumber;
            let decidedStatus = currentStatus;
            if (currentStatus.closed && decidedWeek !== actualCurrentWeekNumber) {
                decidedStatus = statusByWeek.get(decidedWeek) ?? await fetchWeekStatus(decidedWeek);
                if (token !== weekResolveTokenRef.current) return;
                statusByWeek.set(decidedStatus.weekNumber, decidedStatus);
            }

            applyResolvedOperationalWeek(decidedWeek, decidedStatus, statusByWeek);
        } catch (e) {
            if (token !== weekResolveTokenRef.current) return;
            console.error("Error resolving operational week:", e);
            setActiveWeekNumber(actualCurrentWeekNumber);
            setIsWeekResolved(true);
        }
    }, [
        actualCurrentWeekNumber,
        nextCalendarWeekNumber,
        fetchWeekStatus,
        applyResolvedOperationalWeek,
    ]);
    const resolveOperationalWeekRef = useRef(resolveOperationalWeek);
    resolveOperationalWeekRef.current = resolveOperationalWeek;
    const fetchPortalDescriptions = useCallback(async (expensesData) => {
        const projectAdvanceRows = expensesData.filter(row => row.type === "Project Advance" && row.advance_portal_id);
        if (projectAdvanceRows.length === 0) return;
        const uniqueIds = [...new Set(projectAdvanceRows.map((row) => row.advance_portal_id))];
        const entries = await Promise.all(uniqueIds.map(async (portalId) => {
            try {
                const res = await fetch(
                    `https://backendaab.in/demoAabuildersDash/api/advance_portal/get/${portalId}`
                );
                if (!res.ok) return [portalId, undefined];
                const data = await res.json();
                const description = (data.description || "").trim();
                return [portalId, description !== "" ? description : undefined];
            } catch (error) {
                console.error("Error fetching advance portal data:", error);
                return [portalId, undefined];
            }
        }));
        setPortalDescriptions((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    }, []);
    // Fetch descriptions for Staff Advance rows
    const fetchStaffAdvanceDescriptions = useCallback(async (expensesData) => {
        const staffAdvanceRows = expensesData.filter(row => row.type === "Staff Advance" && row.staff_advance_portal_id);
        if (staffAdvanceRows.length === 0) return;
        const uniqueIds = [...new Set(staffAdvanceRows.map((row) => row.staff_advance_portal_id))];
        const entries = await Promise.all(uniqueIds.map(async (portalId) => {
            try {
                const res = await fetch(
                    `https://backendaab.in/demoAabuildersDash/api/staff-advance/${portalId}`
                );
                if (!res.ok) return [portalId, undefined];
                const data = await res.json();
                const description = (data.description || "").trim();
                return [portalId, description !== "" ? description : undefined];
            } catch (error) {
                console.error("Error fetching staff advance data:", error);
                return [portalId, undefined];
            }
        }));
        setStaffAdvanceDescriptions((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    }, []);
    const loadPortalDescriptionsIfNeeded = useCallback((expensesData) => {
        const projectAdvanceRows = expensesData.filter(
            (row) => row.type === "Project Advance" && row.advance_portal_id
        );
        const key = projectAdvanceRows
            .map((row) => row.advance_portal_id)
            .sort((a, b) => String(a).localeCompare(String(b)))
            .join(",");
        if (key && key === lastPortalDescriptionKeyRef.current) return;
        lastPortalDescriptionKeyRef.current = key;
        fetchPortalDescriptions(expensesData);
    }, [fetchPortalDescriptions]);
    const loadStaffAdvanceDescriptionsIfNeeded = useCallback((expensesData) => {
        const staffAdvanceRows = expensesData.filter(
            (row) => row.type === "Staff Advance" && row.staff_advance_portal_id
        );
        const key = staffAdvanceRows
            .map((row) => row.staff_advance_portal_id)
            .sort((a, b) => String(a).localeCompare(String(b)))
            .join(",");
        if (key && key === lastStaffAdvanceDescriptionKeyRef.current) return;
        lastStaffAdvanceDescriptionKeyRef.current = key;
        fetchStaffAdvanceDescriptions(expensesData);
    }, [fetchStaffAdvanceDescriptions]);
    const applyWeekTableData = useCallback((expensesData, paymentsData, { loadDescriptions = true } = {}) => {
        if (Array.isArray(expensesData)) {
            const filteredExpenses = expensesData.filter((expense) => !expense.status);
            setExpenses(filteredExpenses);
            setRemovedBillCopyRows(buildRemovedBillCopyRowsMap(filteredExpenses));
            if (loadDescriptions) {
                loadPortalDescriptionsIfNeeded(filteredExpenses);
                loadStaffAdvanceDescriptionsIfNeeded(filteredExpenses);
            }
        }
        if (Array.isArray(paymentsData)) {
            const filteredPayments = paymentsData.filter(
                (payment) => payment.type !== "Handover" && !payment.status
            );
            setPayments(filteredPayments);
        }
    }, [loadPortalDescriptionsIfNeeded, loadStaffAdvanceDescriptionsIfNeeded]);
    const fetchExpensesRef = useRef(null);
    const fetchPaymentsRef = useRef(null);
    const fetchRefundPaymentsRef = useRef(null);
    const applyWeekTableDataRef = useRef(null);
    // Fetch expenses for the resolved operational week
    const fetchExpenses = useCallback((options = {}) => {
        const { loadDescriptions = true } = options;
        if (!operationalWeekNumber) return;
        const fetchToken = ++weekExpensesFetchTokenRef.current;
        fetch(buildBranchUrl(`https://backendaab.in/demoAabuildersDash/api/weekly-expenses/week/${operationalWeekNumber}`))
            .then((res) => res.json())
            .then((data) => {
                if (fetchToken !== weekExpensesFetchTokenRef.current) return;
                applyWeekTableData(data, null, { loadDescriptions });
            })
            .catch(console.error);
    }, [operationalWeekNumber, buildBranchUrl, applyWeekTableData]);
    // Fetch payments for the resolved operational week
    const fetchPayments = useCallback(() => {
        if (!operationalWeekNumber) return;
        const fetchToken = ++weekPaymentsFetchTokenRef.current;
        fetch(buildBranchUrl(`https://backendaab.in/demoAabuildersDash/api/payments-received/week/${operationalWeekNumber}`))
            .then((res) => res.json())
            .then((data) => {
                if (fetchToken !== weekPaymentsFetchTokenRef.current) return;
                applyWeekTableData(null, data);
            })
            .catch(console.error);
    }, [operationalWeekNumber, buildBranchUrl, applyWeekTableData]);
    const fetchRefundPayments = useCallback(() => {
        if (!operationalWeekNumber) return;
        fetch(buildBranchUrl(`https://backendaab.in/demoAabuildersDash/api/refund_received/getAll`))
            .then((res) => res.json())
            .then((data) => {
                setAllRefundAmount(data);
            })
            .catch(console.error);
    }, [operationalWeekNumber, buildBranchUrl]);
    fetchExpensesRef.current = fetchExpenses;
    fetchPaymentsRef.current = fetchPayments;
    fetchRefundPaymentsRef.current = fetchRefundPayments;
    applyWeekTableDataRef.current = applyWeekTableData;
    // Check if previous week has status === true
    const checkPreviousWeekStatus = useCallback(async () => {
        // Use actual current week number for calculation
        if (!operationalWeekNumber) {
            setPreviousWeekHasStatusTrue(false);
            setPreviousWeekHasData(false);
            return;
        }
        let previousWeekNumber;
        let previousYear;
        if (operationalWeekNumber === 1) {
            previousWeekNumber = 52;
        } else {
            previousWeekNumber = operationalWeekNumber - 1;
        }
        try {
            const [expensesRes, paymentsRes] = await Promise.all([
                fetch(buildBranchUrl(`https://backendaab.in/demoAabuildersDash/api/weekly-expenses/week/${previousWeekNumber}`)),
                fetch(buildBranchUrl(`https://backendaab.in/demoAabuildersDash/api/payments-received/week/${previousWeekNumber}`))
            ]);
            if (expensesRes.ok && paymentsRes.ok) {
                const expensesData = await expensesRes.json();
                const paymentsData = await paymentsRes.json();
                const hasPreviousWeekData =
                    (Array.isArray(expensesData) && expensesData.length > 0) ||
                    (Array.isArray(paymentsData) && paymentsData.length > 0);
                // Check if any expense or payment has status === true
                const hasStatusTrue =
                    expensesData.some(expense => expense.status === true) ||
                    paymentsData.some(payment => payment.status === true);
                setPreviousWeekHasData(hasPreviousWeekData);
                setPreviousWeekHasStatusTrue(hasStatusTrue);
            } else {
                setPreviousWeekHasData(false);
                setPreviousWeekHasStatusTrue(false);
            }
        } catch (error) {
            console.error('Error checking previous week status:', error);
            setPreviousWeekHasData(false);
            setPreviousWeekHasStatusTrue(false);
        }
    }, [operationalWeekNumber, buildBranchUrl]);
    const refreshWeeklyPaymentTables = useCallback(() => {
        if (!operationalWeekNumber || !isWeekResolved) return;
        fetchExpenses({ loadDescriptions: false });
        fetchPayments();
        fetchRefundPayments();
    }, [operationalWeekNumber, isWeekResolved, fetchExpenses, fetchPayments, fetchRefundPayments]);
    const resolveAndRefreshWeeklyPaymentData = useCallback(async () => {
        clearCachedActiveWeek();
        pendingWeekDataRef.current = null;
        await resolveOperationalWeek();
        fetchCurrentWeekNumber();
        fetchRefundPayments();
        fetchWeeklyPaymentBills();
    }, [
        clearCachedActiveWeek,
        resolveOperationalWeek,
        fetchCurrentWeekNumber,
        fetchRefundPayments,
    ]);
    const refreshWeeklyPaymentData = useCallback(async () => {
        if (!operationalWeekNumber || !isWeekResolved) return;
        lastPortalDescriptionKeyRef.current = "";
        lastStaffAdvanceDescriptionKeyRef.current = "";
        fetchExpenses({ loadDescriptions: true });
        fetchPayments();
        fetchRefundPayments();
        fetchWeeklyPaymentBills();
    }, [operationalWeekNumber, isWeekResolved, fetchExpenses, fetchPayments, fetchRefundPayments]);
    useLiveDataSync(
        refreshWeeklyPaymentTables,
        Boolean(
            editingRowId ||
            editingPaymentId ||
            isSubmitting ||
            showPurposePopup ||
            showPopup ||
            showPopups ||
            fileUploadPopup ||
            !isWeekResolved ||
            !isTabActive
        )
    );
    // Initial fetch of current week number
    useEffect(() => {
        fetchCurrentWeekNumber();
    }, [fetchCurrentWeekNumber]);
    useEffect(() => {
        if (!actualCurrentWeekNumber || !isTabActive) return;
        setActiveWeekNumber(null);
        setIsWeekResolved(false);
        pendingWeekDataRef.current = null;
        void resolveOperationalWeekRef.current();
    }, [actualCurrentWeekNumber, activeBranchId, isTabActive]);
    // Load table data only after the operational week is resolved
    useEffect(() => {
        if (!operationalWeekNumber || !isWeekResolved) return;
        const pending = pendingWeekDataRef.current;
        if (pending?.week === operationalWeekNumber) {
            pendingWeekDataRef.current = null;
            applyWeekTableDataRef.current?.(pending.expenses, pending.payments);
            void fetchRefundPaymentsRef.current?.();
            return;
        }
        fetchExpensesRef.current?.();
        fetchPaymentsRef.current?.();
        void fetchRefundPaymentsRef.current?.();
    }, [operationalWeekNumber, isWeekResolved]);
    useEffect(() => {
        if (!isClientToggleActive) return;
        if (clientProjectOptions.length === 1) {
            setSelectedProjectName(clientProjectOptions[0]);
        }
    }, [clientProjectOptions, isClientToggleActive]);
    // Calculations
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0) + (Number(newExpense.amount) || 0);
    const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0) + (Number(newPayment.amount) || 0);
    const totalRefund = allRefundAmount.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const balance = totalPayments - expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const expenseTypeSummary = React.useMemo(
        () => buildWeeklyPaymentExpenseTypeSummary(expenses, weeklyTypes),
        [expenses, weeklyTypes]
    );
    const formatWeeklySummaryAmount = (amount) =>
        `₹${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
                numericValue = "";
            }
            if (numericValue < 0) numericValue = 0;
            setNewExpense((prev) => ({ ...prev, amount: numericValue }));
        } else if (name === "type") {
            const allowedTypesForClient = ["Loan", "Bank", "Claim"];
            const isClientTypeAllowed = allowedTypesForClient.includes(value);
            if (value === "Staff Advance") {
                if (selectedContractor || selectedVendor || selectedClient) {
                    alert("Staff Advance type only allows Employee. Please select an Employee or clear the Contractor/Vendor/Client selection.");
                    return;
                }
            } else if (value === "Project Advance") {
                if (selectedEmployee || selectedClient) {
                    alert("Project Advance type only allows Contractor or Vendor. Please select a Contractor or Vendor or clear the Employee/Client selection.");
                    return;
                }
            }
            if (!isClientTypeAllowed && isClientToggleActive) {
                setIsClientToggleActive(false);
                setSelectedClient(null);
                setClientProjectOptions([]);
                setNewExpense((prev) => ({
                    ...prev,
                    [name]: value,
                    client_name: "",
                    client_id: "",
                }));
                setSelectedProjectName(null);
                return;
            }
            setNewExpense((prev) => ({ ...prev, [name]: value }));
        } else {
            setNewExpense((prev) => ({ ...prev, [name]: value }));
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "type") {
            const allowedTypesForClient = ["Loan", "Bank", "Claim"];
            const isClientTypeAllowed = allowedTypesForClient.includes(value);
            if (value === "Staff Advance") {
                if (selectedContractor || selectedVendor || selectedClient) {
                    alert("Staff Advance type only allows Employee. Please select an Employee or clear the Contractor/Vendor/Client selection.");
                    return;
                }
            } else if (value === "Project Advance") {
                if (selectedEmployee || selectedClient) {
                    alert("Project Advance type only allows Contractor or Vendor. Please select a Contractor or Vendor or clear the Employee/Client selection.");
                    return;
                }
            }
            if (!isClientTypeAllowed && isClientToggleActive) {
                setIsClientToggleActive(false);
                setSelectedClient(null);
                setClientProjectOptions([]);
                setNewExpense((prev) => ({
                    ...prev,
                    [name]: value,
                    client_name: "",
                    client_id: "",
                }));
                setSelectedProjectName(null);
                return;
            }
            setNewExpense((prev) => ({ ...prev, [name]: value }));
        } else {
            setNewExpense((prev) => ({ ...prev, [name]: value }));
        }
    };
    const handlePartySourceToggle = () => {
        setIsClientToggleActive((prev) => {
            const nextState = !prev;
            setSelectContractororVendorName('');
            if (nextState) {
                setSelectedContractor(null);
                setSelectedVendor(null);
                setSelectedEmployee(null);
                setSelectedClient(null);
                setClientProjectOptions([]);
                setNewExpense((prevExpense) => ({
                    ...prevExpense,
                    client_name: "",
                    client_id: "",
                }));
                setSelectedProjectName(null);
            } else {
                setSelectedClient(null);
                setClientProjectOptions([]);
                setNewExpense((prevExpense) => ({
                    ...prevExpense,
                    client_name: "",
                    client_id: "",
                }));
                setSelectedProjectName(null);
            }
            return nextState;
        });
    };
    const updateLoanPortalEntry = async (loanPortalId, { date, amount, vendorId, contractorId, employeeId, projectId }) => {
        if (!loanPortalId) return;
        const payload = {
            type: "Loan",
            date,
            amount,
            loan_payment_mode: "Cash",
            loan_refund_amount: 0,
            from_purpose_id: 0,
            transfer_Project_id: 0,
            to_purpose_id: 0,
            vendor_id: vendorId || 0,
            contractor_id: contractorId || 0,
            employee_id: employeeId || 0,
            project_id: projectId || 0,
            description: "",
            file_url: "",
            branch_id: activeBranchId ?? null,
        };
        const response = await fetch(`https://backendaab.in/demoAabuildersDash/api/loans/${loanPortalId}?editedBy=${encodeURIComponent(username)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error("Failed to update Loan Portal entry");
        }
        return response.json();
    };
    const clearLoanPortalEntry = async (loanPortalId, date) => {
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
            entry_no: 0,
            description: "",
            branch_id: activeBranchId ?? null,
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
    const createLoanPortalEntry = async ({ date, amount, vendorId, contractorId, employeeId, projectId, purposeId = 0, description = "" }) => {
        const payload = {
            type: "Loan",
            date,
            amount,
            loan_payment_mode: "Cash",
            loan_refund_amount: 0,
            from_purpose_id: Number(purposeId) || 0,
            transfer_Project_id: 0,
            to_purpose_id: 0,
            vendor_id: vendorId || 0,
            contractor_id: contractorId || 0,
            employee_id: employeeId || 0,
            project_id: 0,
            source: "Cash Register",
            description: description || "",
            file_url: "",
            branch_id: activeBranchId ?? null,
            entered_by: enteredBy,
        };
        const response = await fetch("https://backendaab.in/demoAabuildersDash/api/loans/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error("Failed to save Loan Portal entry");
        }
        return response.json();
    };
    const handlePurposeSelection = async () => {
        if (!selectedPurpose) {
            alert("Please select a purpose");
            return;
        }
        const trimmedDescription = (loanPurposeDescription || "").trim();
        if (!trimmedDescription) {
            alert("Please enter description");
            return;
        }
        if (!pendingLoanData) {
            alert("No pending loan data found");
            return;
        }
        setIsSubmitting(true);
        try {
            const expenseForBackend = {
                date: pendingLoanData.date,
                contractor_id: pendingLoanData.contractor_id,
                vendor_id: pendingLoanData.vendor_id,
                employee_id: pendingLoanData.employee_id,
                client_name: pendingLoanData.client_name,
                client_id: pendingLoanData.client_id,
                project_id: pendingLoanData.project_id,
                type: "Loan",
                type_id: getWeeklyExpenseTypeId("Loan"),
                amount: pendingLoanData.amount,
                weekly_number: pendingLoanData.weekly_number,
                status: false,
                created_at: new Date().toISOString(),
                description: trimmedDescription,
                advance_portal_id: null,
                staff_advance_portal_id: null,
                loan_portal_id: null,
                branch_id: activeBranchId,
                entered_by: enteredBy,
                source: "Cash Register",
            };
            const loanResponse = await createLoanPortalEntry({
                date: pendingLoanData.date,
                amount: pendingLoanData.amount || 0,
                vendorId: pendingLoanData.vendor_id || 0,
                contractorId: pendingLoanData.contractor_id || 0,
                employeeId: pendingLoanData.employee_id || 0,
                projectId: pendingLoanData.project_id || 0,
                purposeId: selectedPurpose.id,
                description: trimmedDescription,
                entered_by: enteredBy,
                source: "Cash Register",
                branch_id: activeBranchId ?? null,
            });
            expenseForBackend.loan_portal_id = loanResponse?.id || loanResponse?.loanPortalId || null;
            const res = await fetch("https://backendaab.in/demoAabuildersDash/api/weekly-expenses/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(expenseForBackend),
            });
            if (!res.ok) throw new Error("Failed to save weekly expense");
            await res.json();
            setShowPurposePopup(false);
            setSelectedPurpose(null);
            setLoanPurposeDescription("");
            setPendingLoanData(null);
            await refreshWeeklyPaymentData();
            setNewExpense({
                date: "",
                contractor: "",
                vendor: "",
                employee: "",
                client_name: "",
                client_id: "",
                project: "",
                type: "",
                amount: "",
                staff_advance_portal_id: "",
                loan_portal_id: "",
            });
            setClientProjectOptions([]);
            setSelectedVendor(null);
            setSelectedContractor(null);
            setSelectedEmployee(null);
            setSelectedClient(null);
            setSelectedProjectName(null);
        } catch (error) {
            console.error("Error saving loan with purpose:", error);
            alert("Error saving loan. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };
    const updateAdvancePortalEntry = async (advancePortalId, { date, amount, vendorId, contractorId, projectId, description, weekNo }) => {
        if (!advancePortalId) return;
        const payload = {
            type: "Advance",
            date,
            contractor_id: contractorId || null,
            vendor_id: vendorId || null,
            project_id: projectId || null,
            transfer_site_id: 0,
            payment_mode: "Cash",
            amount: Number(amount) || 0,
            bill_amount: 0,
            refund_amount: 0,
            week_no: weekNo || editFormData.weekly_number || operationalWeekNumber,
            description: description || "",
            source: "Cash Register",
            file_url: "",
            branch_id: activeBranchId ?? null,
        };
        const response = await fetch(
            `https://backendaab.in/demoAabuildersDash/api/advance_portal/edit/${advancePortalId}?editedBy=${encodeURIComponent(username)}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }
        );
        if (!response.ok) {
            throw new Error("Failed to update Advance Portal entry");
        }
        return response.json();
    };
    const clearAdvancePortalEntry = async (advancePortalId, date) => {
        if (!advancePortalId) return;
        const clearedData = {
            date: date || new Date().toISOString().split("T")[0],
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
            entry_no: null,
            branch_id: activeBranchId ?? null,
        };
        const response = await fetch(
            `https://backendaab.in/demoAabuildersDash/api/advance_portal/edit/${advancePortalId}?editedBy=${encodeURIComponent(username)}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(clearedData),
            }
        );
        if (!response.ok) {
            throw new Error("Failed to clear Advance Portal entry");
        }
        return response.json();
    };
    const updateStaffAdvancePortalEntry = async (staffAdvancePortalId, { date, amount, employeeId, projectId, description, weekNo }) => {
        if (!staffAdvancePortalId) return;
        const payload = {
            type: "Advance",
            date,
            employee_id: employeeId || null,
            project_id: projectId || null,
            amount: Number(amount) || 0,
            week_no: weekNo || editFormData.weekly_number || operationalWeekNumber,
            staff_payment_mode: "Cash",
            from_purpose_id: 4,
            description: description || "",
            staff_refund_amount: 0,
            file_url: null,
            branch_id: activeBranchId ?? null,
        };
        const response = await fetch(
            `https://backendaab.in/demoAabuildersDash/api/staff-advance/${staffAdvancePortalId}?editedBy=${encodeURIComponent(username)}`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }
        );
        if (!response.ok) {
            throw new Error("Failed to update Staff Advance Portal entry");
        }
        return response.json();
    };
    const clearStaffAdvancePortalEntry = async (staffAdvancePortalId, date) => {
        if (!staffAdvancePortalId) return;
        const clearedData = {
            date: date || new Date().toISOString().split("T")[0],
            amount: null,
            employee_id: null,
            description: null,
            type: null,
            week_no: null,
            from_purpose_id: null,
            staff_payment_mode: null,
            file_url: null,
            staff_refund_amount: null,
            entry_no: null,
            branch_id: activeBranchId ?? null,
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
    const validateExpenseDate = (dateStr) => {
        const validationWeekNumber = operationalWeekNumber || currentWeekNumber;
        if (!dateStr || !validationWeekNumber) return;
        const year = new Date().getFullYear();
        const { startDate, endDate } = getStartAndEndDateOfISOWeek(validationWeekNumber, year);
        const selectedDate = new Date(dateStr);
        selectedDate.setHours(0, 0, 0, 0);
        if (selectedDate < startDate || selectedDate > endDate) {
            setPopup({
                show: true,
                message: `Selected date is out of current week range (${startDate.toLocaleDateString("en-GB")} - ${endDate.toLocaleDateString("en-GB")})`,
                type: "expense",
                dateStr,
                editRowId: null,
                editIndex: null,
                originalDate: ""
            });
        } else {
            setNewExpense((prev) => ({ ...prev, date: dateStr }));
        }
    };
    const handleKeyDownExpense = async (e) => {
        if (e.key !== "Enter") return;
        if (isSubmitting) {
            alert("Please wait for the previous submission to complete.");
            return;
        }
        if (!newExpense.date) {
            alert("Please select a date");
            return;
        }
        if (!selectedProjectName || !newExpense.type || !newExpense.amount) {
            alert("Please fill all fields except date");
            return;
        }
        if (newExpense.type === "Staff Advance") {
            if (selectedContractor || selectedVendor) {
                alert("Staff Advance type only allows Employee. Please select an Employee and remove Contractor/Vendor selection.");
                return;
            }
            if (!selectedEmployee) {
                alert("Staff Advance type requires an Employee to be selected.");
                return;
            }
        }
        if (newExpense.type === "Project Advance") {
            if (selectedEmployee) {
                alert("Project Advance type only allows Contractor or Vendor. Please select a Contractor/Vendor and remove Employee selection.");
                return;
            }
            if (!selectedContractor && !selectedVendor) {
                alert("Project Advance type requires either a Contractor or Vendor to be selected.");
                return;
            }
        }
        const typesWithoutPartyRequirement = ["Loan", "Bank", "Claim"];
        if (!typesWithoutPartyRequirement.includes(newExpense.type)) {
            if (newExpense.type !== "Staff Advance" && newExpense.type !== "Project Advance") {
                if (!selectedContractor && !selectedVendor && !selectedEmployee) {
                    alert("Please select a Contractor, Vendor, or Employee for this expense type.");
                    return;
                }
            }
        }
        if (newExpense.type === "Loan") {
            setPendingLoanData({
                date: newExpense.date,
                contractor_id: selectedContractor ? Number(selectedContractor.id) : null,
                vendor_id: selectedVendor ? Number(selectedVendor.id) : null,
                employee_id: selectedEmployee ? Number(selectedEmployee.id) : null,
                client_name: selectedClient?.label || newExpense.client_name || null,
                client_id: selectedClient?.id || newExpense.client_id || null,
                project_id: selectedProjectName ? Number(selectedProjectName.id) : null,
                amount: Number(newExpense.amount),
                weekly_number: operationalWeekNumber,
            });
            setSelectedPurpose(null);
            setLoanPurposeDescription("");
            setShowPurposePopup(true);
            return;
        }
        setIsSubmitting(true);
        try {
            const expenseForBackend = {
                date: newExpense.date,
                contractor_id: selectedContractor ? Number(selectedContractor.id) : null,
                vendor_id: selectedVendor ? Number(selectedVendor.id) : null,
                employee_id: selectedEmployee ? Number(selectedEmployee.id) : null,
                client_name: selectedClient?.label || newExpense.client_name || null,
                client_id: selectedClient?.id || newExpense.client_id || null,
                project_id: selectedProjectName ? Number(selectedProjectName.id) : null,
                type: newExpense.type,
                type_id: getWeeklyExpenseTypeId(newExpense.type),
                amount: Number(newExpense.amount),
                weekly_number: operationalWeekNumber,
                status: false,
                created_at: new Date().toISOString(),
                advance_portal_id: null,
                staff_advance_portal_id: null,
                loan_portal_id: null,
                branch_id: activeBranchId,
                entered_by: enteredBy,
            };
            if (newExpense.type === "Loan") {
                const loanProjectId = selectedProjectName ? Number(selectedProjectName.id) : 0;
                const loanResponse = await createLoanPortalEntry({
                    date: newExpense.date,
                    amount: Number(newExpense.amount) || 0,
                    vendorId: selectedVendor ? Number(selectedVendor.id) : 0,
                    contractorId: selectedContractor ? Number(selectedContractor.id) : 0,
                    employeeId: selectedEmployee ? Number(selectedEmployee.id) : 0,
                    projectId: loanProjectId,
                });
                expenseForBackend.loan_portal_id = loanResponse?.id || loanResponse?.loanPortalId || null;
            }
            if (newExpense.type === "Project Advance") {
                const res = await fetch("https://backendaab.in/demoAabuildersDash/api/advance_portal/getAll");
                if (!res.ok) throw new Error("Failed to fetch entry numbers");
                const allData = await res.json();
                const maxEntryNo =
                    allData.length > 0
                        ? Math.max(...allData.map((item) => item.entry_no || 0))
                        : 0;
                const nextEntryNo = maxEntryNo + 1;
                const getWeekNumber = () => {
                    return getISOWeekNumber(new Date());
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
                    source: "Cash Register",
                    file_url: "",
                    branch_id: activeBranchId ?? null,
                    entered_by: enteredBy,
                };
                expenseForBackend.employee_id = null;
                const saveAdvance = await fetch("https://backendaab.in/demoAabuildersDash/api/advance_portal/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(advancePayload),
                });
                if (!saveAdvance.ok) throw new Error("Failed to save advance");
                const savedAdvance = await saveAdvance.json();
                expenseForBackend.advance_portal_id = savedAdvance.advancePortalId;
                const saveWeekly = await fetch("https://backendaab.in/demoAabuildersDash/api/weekly-expenses/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(expenseForBackend),
                });
                if (!saveWeekly.ok) throw new Error("Failed to save weekly expense");
                await saveWeekly.json();
            } else if (newExpense.type === "Staff Advance") {
                const res = await fetch("https://backendaab.in/demoAabuildersDash/api/staff-advance/all");
                if (!res.ok) throw new Error("Failed to fetch staff advance entry numbers");
                const allData = await res.json();
                const maxEntryNo =
                    allData.length > 0
                        ? Math.max(...allData.map((item) => item.entry_no || 0))
                        : 0;
                const nextEntryNo = maxEntryNo + 1;
                const staffAdvancePayload = {
                    date: newExpense.date,
                    type: "Advance",
                    employee_id: selectedEmployee ? Number(selectedEmployee.id) : null,
                    amount: Number(newExpense.amount),
                    week_no: operationalWeekNumber,
                    staff_payment_mode: "Cash",
                    from_purpose_id: 4,
                    entry_no: nextEntryNo,
                    source: "Cash Register",
                    branch_id: activeBranchId ?? null,
                    entered_by: enteredBy,
                };
                const saveStaffAdvance = await fetch("https://backendaab.in/demoAabuildersDash/api/staff-advance/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(staffAdvancePayload),
                });
                if (!saveStaffAdvance.ok) throw new Error("Failed to save staff advance");
                const savedStaffAdvance = await saveStaffAdvance.json();
                expenseForBackend.contractor_id = null;
                expenseForBackend.vendor_id = null;
                expenseForBackend.staff_advance_portal_id = savedStaffAdvance.staffAdvancePortalId;
                const saveWeekly = await fetch("https://backendaab.in/demoAabuildersDash/api/weekly-expenses/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(expenseForBackend),
                });
                if (!saveWeekly.ok) throw new Error("Failed to save weekly expense");
                await saveWeekly.json();
            } else {
                const res = await fetch("https://backendaab.in/demoAabuildersDash/api/weekly-expenses/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(expenseForBackend),
                });
                if (!res.ok) throw new Error("Failed to save weekly expense");
                await res.json();
            }
            await refreshWeeklyPaymentData();
            setNewExpense({
                date: "",
                contractor: "",
                vendor: "",
                employee: "",
                client_name: "",
                client_id: "",
                project: "",
                type: "",
                amount: "",
                staff_advance_portal_id: "",
                loan_portal_id: "",
            });
            setClientProjectOptions([]);
            setSelectedVendor(null);
            setSelectedContractor(null);
            setSelectedEmployee(null);
            setSelectedClient(null);
            setSelectedProjectName(null);
            setIsSubmitting(false);
        } catch (err) {
            setIsSubmitting(false);
            alert("Error saving expense: " + err.message);
        }
    };
    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        if (name === "date") {
            validatePaymentDate(value);
        } else {
            setNewPayment((prev) => ({ ...prev, [name]: value }));
        }
    };
    const validatePaymentDate = (dateStr) => {
        if (!dateStr || !operationalWeekNumber) return;
        const year = new Date().getFullYear();
        const { startDate, endDate } = getStartAndEndDateOfISOWeek(operationalWeekNumber, year);
        const selectedDate = new Date(dateStr);
        if (selectedDate < startDate || selectedDate > endDate) {
            setPopup({
                show: true,
                message: `Selected date is out of current week range (${startDate.toLocaleDateString("en-GB")} - ${endDate.toLocaleDateString("en-GB")})`,
                type: "payment",
                dateStr,
                editRowId: null,
                editIndex: null,
                originalDate: ""
            });
        } else {
            setNewPayment((prev) => ({ ...prev, date: dateStr }));
        }
    };
    const handleKeyDownPayment = (e) => {
        if (e.key !== "Enter") return;
        if (isSubmitting) {
            alert("Please wait for the previous submission to complete.");
            return;
        }
        if (!newPayment.date) {
            alert("Please select a date");
            return;
        }
        if (!newPayment.amount || !newPayment.type) {
            alert("Please fill Amount and Type");
            return;
        }
        setIsSubmitting(true);
        const payload = {
            date: newPayment.date,
            amount: Number(newPayment.amount),
            type: newPayment.type,
            type_id: getWeeklyReceivedTypeId(newPayment.type),
            weekly_number: operationalWeekNumber,
            status: false,
            branch_id: activeBranchId,
            entered_by: enteredBy,
            source: "Cash Register",
        };
        fetch("https://backendaab.in/demoAabuildersDash/api/payments-received/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to save payment");
                return res.json();
            })
            .then(async () => {
                setNewPayment({ date: "", amount: "", type: "Weekly" });
                await refreshWeeklyPaymentData();
                setIsSubmitting(false);
            })
            .catch((err) => {
                setIsSubmitting(false);
                alert("Error saving payment: " + err.message);
            });
    };
    const openAccountClosure = () => {
        if (activeBranchId === null || activeBranchId === undefined || activeBranchId === "") {
            alert("Branch is not selected. Please select a branch before account closure.");
            return;
        }
        setCarryForwardBalance(balance.toFixed(2));
        setShowPopup(true);
    };
    const handleAccountClosure = async (type, discountAmount = 0) => {
        try {
            if (activeBranchId === null || activeBranchId === undefined || activeBranchId === "") {
                throw new Error("Branch is not selected. Account closure is blocked to avoid affecting all branches.");
            }
            const carryForwardParam = (type === "Carry (CF)" || type === "Handover") ? "true" : "false";
            const carryAmountParam = carryForwardParam === "true" && balance > 0 ? balance : 0;
            const currentDate = new Date();
            const nextWeekDate = new Date(currentDate);
            nextWeekDate.setDate(currentDate.getDate() + 7);
            const nextWeekNumber = getISOWeekNumber(nextWeekDate);
            const url = new URL("https://backendaab.in/demoAabuildersDash/api/payments-received/account-closure");
            url.searchParams.append("closureType", type);
            url.searchParams.append("carryForward", carryForwardParam);
            url.searchParams.append("carryAmount", carryAmountParam - discountAmount);
            url.searchParams.append("discountAmount", discountAmount);
            url.searchParams.append("currentWeek", operationalWeekNumber);
            url.searchParams.append("branchId", String(activeBranchId));
            const res = await fetch(url.toString(), { method: "POST" });
            await res.json();
            setCurrentWeekNumber(nextWeekNumber);
            await resolveAndRefreshWeeklyPaymentData();
            setNewExpense({ date: "", contractor: "", project: "", type: "", amount: "", staff_advance_portal_id: "" });
            setNewPayment({ date: "", amount: "", type: "Weekly" });
        } catch (error) {
            alert("Failed to complete account closure: " + error.message);
        }
    };
    const groupedExpenses = expenses.reduce((acc, expense) => {
        if (!acc[expense.type]) acc[expense.type] = 0;
        acc[expense.type] += Number(expense.amount) || 0;
        return acc;
    }, {});
    const mergedExpenses = Object.entries(groupedExpenses).map(([type, amount]) => ({ type, amount }));
    const saveEditedExpense = async (row) => {
        try {
            if (editFormData.type === "Staff Advance") {
                if (editFormData.contractor_id || editFormData.vendor_id) {
                    alert("Staff Advance type only allows Employee. Please select an Employee and remove Contractor/Vendor selection.");
                    return;
                }
                if (!editFormData.employee_id) {
                    alert("Staff Advance type requires an Employee to be selected.");
                    return;
                }
            }
            if (editFormData.type === "Project Advance") {
                if (editFormData.employee_id) {
                    alert("Project Advance type only allows Contractor or Vendor. Please select a Contractor/Vendor and remove Employee selection.");
                    return;
                }
                if (!editFormData.contractor_id && !editFormData.vendor_id) {
                    alert("Project Advance type requires either a Contractor or Vendor to be selected.");
                    return;
                }
            }
            const typesWithoutPartyRequirement = ["Loan", "Bank", "Claim"];
            if (!typesWithoutPartyRequirement.includes(editFormData.type)) {
                if (editFormData.type !== "Staff Advance" && editFormData.type !== "Project Advance") {
                    if (!editFormData.contractor_id && !editFormData.vendor_id && !editFormData.employee_id) {
                        alert("Please select a Contractor, Vendor, or Employee for this expense type.");
                        return;
                    }
                }
            }
            const normalize = (val) =>
                val === null || val === undefined ? "" : String(val).trim();
            const changedFields = Object.keys(editFormData).filter(
                (key) => normalize(editFormData[key]) !== normalize(row[key])
            );
            if (changedFields.length === 0) {
                setEditingRowId(null);
                setEditingOriginalRow(null);
                return;
            }
            const onlyDescriptionChanged =
                changedFields.length === 1 && changedFields[0] === "description";
            const wasLoan = row.type === "Loan";
            const isNowLoan = editFormData.type === "Loan";
            const wasProjectAdvance = row.type === "Project Advance";
            const isNowProjectAdvance = editFormData.type === "Project Advance";
            const wasStaffAdvance = row.type === "Staff Advance";
            const isNowStaffAdvance = editFormData.type === "Staff Advance";
            if (wasProjectAdvance && !isNowProjectAdvance && row.advance_portal_id) {
                try {
                    await clearAdvancePortalEntry(row.advance_portal_id, editFormData.date);
                } catch (advanceError) {
                    console.error("Error clearing advance portal entry:", advanceError);
                }
                editFormData.advance_portal_id = null;
            }
            if (wasStaffAdvance && !isNowStaffAdvance && row.staff_advance_portal_id) {
                try {
                    await clearStaffAdvancePortalEntry(row.staff_advance_portal_id, editFormData.date);
                } catch (staffAdvanceError) {
                    console.error("Error clearing staff advance portal entry:", staffAdvanceError);
                }
                editFormData.staff_advance_portal_id = null;
            }
            if (isNowProjectAdvance) {
                const advancePayload = {
                    date: editFormData.date,
                    amount: Number(editFormData.amount) || 0,
                    vendorId: editFormData.vendor_id ? Number(editFormData.vendor_id) : 0,
                    contractorId: editFormData.contractor_id ? Number(editFormData.contractor_id) : 0,
                    projectId: editFormData.project_id ? Number(editFormData.project_id) : 0,
                    description: editFormData.description || "",
                    weekNo: editFormData.weekly_number || operationalWeekNumber,
                };
                if (row.advance_portal_id) {
                    await updateAdvancePortalEntry(row.advance_portal_id, advancePayload);
                    editFormData.advance_portal_id = row.advance_portal_id;
                } else {
                    const resAll = await fetch(
                        "https://backendaab.in/demoAabuildersDash/api/advance_portal/getAll"
                    );
                    if (!resAll.ok) throw new Error("Failed to fetch entry numbers");
                    const allData = await resAll.json();
                    const maxEntryNo =
                        allData.length > 0
                            ? Math.max(...allData.map((item) => item.entry_no || 0))
                            : 0;
                    const nextEntryNo = maxEntryNo + 1;
                    const saveAdvancePayload = {
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
                        entry_no: nextEntryNo,
                        week_no: editFormData.weekly_number || operationalWeekNumber,
                        source: "Cash Register",
                        description: editFormData.description || "",
                        file_url: editFormData.file_url || "",
                        branch_id: activeBranchId ?? null,
                        entered_by: enteredBy
                    };
                    const saveAdvance = await fetch(
                        "https://backendaab.in/demoAabuildersDash/api/advance_portal/save",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(saveAdvancePayload),
                        }
                    );
                    if (!saveAdvance.ok) throw new Error("Failed to save advance");
                    const savedAdvance = await saveAdvance.json();
                    editFormData.advance_portal_id = savedAdvance.advancePortalId;
                }
            }
            if (isNowStaffAdvance) {
                const staffAdvancePayload = {
                    date: editFormData.date,
                    amount: Number(editFormData.amount) || 0,
                    employeeId: editFormData.employee_id ? Number(editFormData.employee_id) : 0,
                    projectId: editFormData.project_id ? Number(editFormData.project_id) : 0,
                    description: editFormData.description || "",
                    weekNo: editFormData.weekly_number || operationalWeekNumber,
                };
                if (row.staff_advance_portal_id) {
                    await updateStaffAdvancePortalEntry(row.staff_advance_portal_id, staffAdvancePayload);
                    editFormData.staff_advance_portal_id = row.staff_advance_portal_id;
                } else {
                    const resAll = await fetch(
                        "https://backendaab.in/demoAabuildersDash/api/staff-advance/all"
                    );
                    if (!resAll.ok) throw new Error("Failed to fetch entry numbers");
                    const allData = await resAll.json();
                    const maxEntryNo =
                        allData.length > 0
                            ? Math.max(...allData.map((item) => item.entry_no || 0))
                            : 0;
                    const nextEntryNo = maxEntryNo + 1;
                    const saveStaffAdvancePayload = {
                        date: editFormData.date,
                        type: "Advance",
                        employee_id: editFormData.employee_id || null,
                        project_id: editFormData.project_id || null,
                        amount: Number(editFormData.amount) || 0,
                        week_no: editFormData.weekly_number || operationalWeekNumber,
                        staff_payment_mode: "Cash",
                        from_purpose_id: 4,
                        entry_no: nextEntryNo,
                        source: "Cash Register",
                        description: editFormData.description || "",
                        staff_refund_amount: 0,
                        file_url: null,
                        branch_id: activeBranchId ?? null,
                        entered_by: enteredBy
                    };
                    const saveStaffAdvance = await fetch(
                        "https://backendaab.in/demoAabuildersDash/api/staff-advance/save",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(saveStaffAdvancePayload),
                        }
                    );
                    if (!saveStaffAdvance.ok) throw new Error("Failed to save staff advance");
                    const savedStaffAdvance = await saveStaffAdvance.json();
                    editFormData.staff_advance_portal_id = savedStaffAdvance.id || savedStaffAdvance.staff_advance_portal_id || savedStaffAdvance.staffAdvancePortalId;
                }
            }
            if (isNowLoan) {
                const loanPayload = {
                    date: editFormData.date,
                    amount: Number(editFormData.amount) || 0,
                    vendorId: editFormData.vendor_id ? Number(editFormData.vendor_id) : 0,
                    contractorId: editFormData.contractor_id ? Number(editFormData.contractor_id) : 0,
                    employeeId: editFormData.employee_id ? Number(editFormData.employee_id) : 0,
                    projectId: editFormData.project_id ? Number(editFormData.project_id) : 0,
                };
                if (row.loan_portal_id) {
                    await updateLoanPortalEntry(row.loan_portal_id, loanPayload);
                    editFormData.loan_portal_id = row.loan_portal_id;
                } else {
                    const newLoan = await createLoanPortalEntry(loanPayload);
                    editFormData.loan_portal_id = newLoan?.id || newLoan?.loanPortalId || null;
                }
            } else if (wasLoan && row.loan_portal_id) {
                try {
                    await clearLoanPortalEntry(row.loan_portal_id, editFormData.date);
                } catch (loanError) {
                    console.error("❌ Error clearing loan portal entry:", loanError);
                    alert("Failed to delete the associated Loan Portal entry. Please try again.");
                    return;
                }
                editFormData.loan_portal_id = null;
            }
            if (!onlyDescriptionChanged) {
                const finalEditData = { ...editFormData };
                finalEditData.branch_id = row.branch_id ?? row.branchId ?? activeBranchId ?? null;
                finalEditData.type_id = getWeeklyExpenseTypeId(editFormData.type);
                if (editFormData.type === "Project Advance") {
                    finalEditData.employee_id = null;
                }
                if (editFormData.type === "Staff Advance") {
                    finalEditData.contractor_id = null;
                    finalEditData.vendor_id = null;
                }
                const response = await fetch(
                    `https://backendaab.in/demoAabuildersDash/api/weekly-expenses/edit/${row.id}?username=${encodeURIComponent(
                        username
                    )}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(finalEditData),
                    }
                );
                if (!response.ok) throw new Error("Failed to update expense");
                const updatedExpense = await response.json();
                setExpenses((prevExpenses) => {
                    const newExpenses = prevExpenses.map((exp) => (exp.id === row.id ? updatedExpense : exp));
                    fetchPortalDescriptions(newExpenses);
                    fetchStaffAdvanceDescriptions(newExpenses);
                    return newExpenses;
                });
            }
            await refreshWeeklyPaymentData();
            setEditingRowId(null);
            setEditingOriginalRow(null);
        } catch (error) {
            console.error("❌ Error updating expense:", error);
        }
    };
    const saveEditedPaymentReceived = async (row) => {
        try {
            const normalize = (val) =>
                val === null || val === undefined ? "" : String(val).trim();
            const hasChanges = Object.keys(editPaymentData).some((key) => {
                return normalize(editPaymentData[key]) !== normalize(row[key]);
            });
            if (!hasChanges) {
                setEditingPaymentId(null);
                return;
            }
            const finalPaymentData = {
                ...editPaymentData,
                branch_id: row.branch_id ?? row.branchId ?? activeBranchId ?? null,
                type_id: getWeeklyReceivedTypeId(editPaymentData.type),
            };
            const response = await fetch(`https://backendaab.in/demoAabuildersDash/api/payments-received/edit/${row.id}?username=${encodeURIComponent(username)}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(finalPaymentData),
            });
            if (!response.ok) {
                throw new Error("Failed to update payment");
            }
            await response.json();
            await refreshWeeklyPaymentData();
            setEditingPaymentId(null);
        } catch (error) {
            console.error("Error updating payment:", error);
        }
    };
    const handleWeeklyExpensesDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete This Expense Data?");
        if (confirmed) {
            try {
                const expenseRecord = expenses.find((exp) => exp.id === id);
                if (expenseRecord?.type === "Loan" && expenseRecord.loan_portal_id) {
                    try {
                        await clearLoanPortalEntry(expenseRecord.loan_portal_id, expenseRecord.date);
                    } catch (loanError) {
                        console.error("Error clearing loan portal entry:", loanError);
                        alert("Failed to clear the associated Loan entry. Please try again.");
                        return;
                    }
                }
                if (expenseRecord?.type === "Project Advance" && expenseRecord.advance_portal_id) {
                    try {
                        await clearAdvancePortalEntry(expenseRecord.advance_portal_id, expenseRecord.date);
                    } catch (advanceError) {
                        console.error("Error clearing advance portal entry:", advanceError);
                        alert("Failed to clear the associated Advance Portal entry. Please try again.");
                        return;
                    }
                }
                if (expenseRecord?.type === "Staff Advance" && expenseRecord.staff_advance_portal_id) {
                    try {
                        await clearStaffAdvancePortalEntry(expenseRecord.staff_advance_portal_id, expenseRecord.date);
                    } catch (staffAdvanceError) {
                        console.error("Error clearing staff advance portal entry:", staffAdvanceError);
                        alert("Failed to clear the associated Staff Advance Portal entry. Please try again.");
                        return;
                    }
                }
                const response = await fetch(`https://backendaab.in/demoAabuildersDash/api/weekly-expenses/delete_by_id/${id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    alert("Weekly Expenses deleted successfully!!!");
                    await refreshWeeklyPaymentData();
                } else {
                    console.error("Failed to delete the Weekly Expenses. Status:", response.status);
                    alert("Error deleting the Weekly Expenses. Please try again.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred while deleting the Expense.");
            }
        } else {
            console.log("Deletion cancelled.");
        }
    };
    const handleWeeklyReceivedDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete This Expense Data?");
        if (confirmed) {
            try {
                const response = await fetch(`https://backendaab.in/demoAabuildersDash/api/payments-received/delete/${id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    alert("Weekly Expenses deleted successfully!!!");
                    await refreshWeeklyPaymentData();
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
    const buildClientKey = (name = "", father = "", mobile = "") => {
        const normalizedName = (name || "").trim().toLowerCase();
        if (!normalizedName) return "";
        const normalizedFather = (father || "").trim().toLowerCase();
        const normalizedMobile = (mobile || "").trim();
        return `${normalizedName}|${normalizedFather}|${normalizedMobile}`;
    };
    const getVendorName = (id) =>
        vendorOptions.find(v => v.id === id)?.value || "";
    const getContractorName = (id) =>
        contractorOptions.find(c => c.id === id)?.value || "";
    const getEmployeeName = (id) =>
        employeeOptions.find(c => c.id === id)?.value || "";
    const getSiteName = (id) =>
        siteOptions.find(s => String(s.id) === String(id))?.value || "";
    const getClientNameFromProjectId = (projectId) =>
        projectIdToClientName[String(projectId)] || "";
    const getClientName = (entry) => {
        if (!entry) return "";
        if (entry.client_name) return entry.client_name;
        if (entry.client_id) {
            const option = clientOptions.find(opt => String(opt.clientId || opt.id) === String(entry.client_id));
            if (option) return option.label;
        }
        if (entry.project_id) {
            return getClientNameFromProjectId(entry.project_id);
        }
        return "";
    };
    const getClientOption = (clientId, clientName) => {
        if (!clientOptions.length) return null;
        if (clientId) {
            const byId = clientOptions.find(opt => String(opt.clientId || opt.id) === String(clientId));
            if (byId) return byId;
        }
        if (clientName) {
            return clientOptions.find(opt => opt.label === clientName) || null;
        }
        return null;
    };
    const getPartyDisplayName = (entry) => {
        const hasContractorVendorEmployee = entry.contractor_id || entry.vendor_id || entry.employee_id;
        if (!hasContractorVendorEmployee && entry.type === "Loan") {
            const client = getClientName(entry);
            if (client) return client;
        }
        if (entry.vendor_id) return getVendorName(entry.vendor_id);
        if (entry.contractor_id) return getContractorName(entry.contractor_id);
        if (entry.employee_id) return getEmployeeName(entry.employee_id);
        return "";
    };
    const getExpenseFilterSnapshot = (entry) =>
        editingRowId === entry.id && editingOriginalRow ? editingOriginalRow : entry;
    const filteredExpenses = expenses.filter((entry) => {
        const snapshot = getExpenseFilterSnapshot(entry);
        if (selectDate) {
            const [year, month, day] = selectDate.split("-");
            const formattedSelectDate = `${parseInt(day)}-${parseInt(month)}-${year}`;
            const entryDateObj = new Date(snapshot.date);
            const formattedEntryDate = `${entryDateObj.getDate()}-${entryDateObj.getMonth() + 1}-${entryDateObj.getFullYear()}`;
            if (formattedEntryDate !== formattedSelectDate) return false;
        }
        if (selectContractororVendorName) {
            if (isClientToggleActive) {
                const clientName = getClientName(snapshot) || "";
                if (clientName.toLowerCase() !== selectContractororVendorName.toLowerCase()) {
                    return false;
                }
            } else {
                const name =
                    snapshot.vendor_id
                        ? getVendorName(snapshot.vendor_id)
                        : getContractorName(snapshot.contractor_id) || getEmployeeName(snapshot.employee_id);
                if (name.toLowerCase() !== selectContractororVendorName.toLowerCase())
                    return false;
            }
        }
        if (selectProjectName) {
            const projectName = getSiteName(snapshot.project_id) || "";
            if (projectName.toLowerCase() !== selectProjectName.toLowerCase())
                return false;
        }
        if (selectType) {
            if (getExpenseSummaryType(snapshot.type)?.toLowerCase() !== selectType.toLowerCase()) return false;
        }
        if (selectExpenseAmount && !matchesEdbcAmountFilter(snapshot.amount, selectExpenseAmount)) return false;
        if (!matchesWeeklyPaymentExpenseOverallSearch(snapshot, overallSearch, {
            formatDateOnly,
            getPartyName: (entry) => {
                if (isClientToggleActive) return getClientName(entry) || '';
                return getPartyDisplayName(entry) || '';
            },
            getProjectName: (entry) =>
                siteOptions.find(opt => opt.id === Number(entry.project_id))?.label
                || getSiteName(entry.project_id)
                || '',
        })) {
            return false;
        }
        return true;
    });
    const contractorVendorFilterOptions = React.useMemo(() => {
        const labels = new Set();
        return filteredExpenses.map(exp => {
            const label = getPartyDisplayName(exp);
            if (label && !labels.has(label)) {
                labels.add(label);
                return { value: label, label };
            }
            return null;
        }).filter(Boolean);
    }, [filteredExpenses, combinedOptions, clientOptions, projectIdToClientName]);
    const clearFilters = () => {
        setSelectDate('');
        setSelectContractororVendorName('');
        setSelectProjectName('');
        setSelectType('');
        setSelectExpenseAmount('');
        setOverallSearch('');
    };
    const clearPaymentsFilters = () => {
        setPaymentsOverallSearch('');
        setSelectPaymentDate('');
        setSelectPaymentAmount('');
        setSelectPaymentType('');
    };
    const getPartyNameForSort = useCallback((entry) => {
        if (isClientToggleActive) return getClientName(entry) || '';
        return getPartyDisplayName(entry) || '';
    }, [isClientToggleActive]);
    const getProjectNameForSort = useCallback((entry) =>
        siteOptions.find(opt => opt.id === Number(entry.project_id))?.label || '',
        [siteOptions]);
    const sortedExpenses = React.useMemo(() => {
        const reversed = [...filteredExpenses].reverse();
        if (!expensesSortField) {
            return reversed.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        return sortWeeklyPaymentExpenseRows(reversed, expensesSortField, expensesSortDirection, {
            getPartyName: getPartyNameForSort,
            getProjectName: getProjectNameForSort,
        });
    }, [filteredExpenses, expensesSortField, expensesSortDirection, getPartyNameForSort, getProjectNameForSort]);
    const filteredPayments = React.useMemo(() => payments.filter((row) => {
        if (paymentsOverallSearch.trim()) {
            const q = paymentsOverallSearch.toLowerCase().trim();
            if (
                !String(row.type || '').toLowerCase().includes(q) &&
                !String(row.amount || '').includes(q) &&
                !String(formatDateOnly(row.date) || '').toLowerCase().includes(q)
            ) {
                return false;
            }
        }
        if (selectPaymentDate) {
            const [year, month, day] = selectPaymentDate.split('-');
            const formattedSelectDate = `${parseInt(day)}-${parseInt(month)}-${year}`;
            const entryDateObj = new Date(row.date);
            const formattedEntryDate = `${entryDateObj.getDate()}-${entryDateObj.getMonth() + 1}-${entryDateObj.getFullYear()}`;
            if (formattedEntryDate !== formattedSelectDate) return false;
        }
        if (selectPaymentAmount && !matchesEdbcAmountFilter(row.amount, selectPaymentAmount)) return false;
        if (selectPaymentType && String(row.type || '').toLowerCase() !== selectPaymentType.toLowerCase()) return false;
        return true;
    }), [payments, paymentsOverallSearch, selectPaymentDate, selectPaymentAmount, selectPaymentType]);
    const sortedPayments = React.useMemo(() => {
        if (!paymentsSortField) return filteredPayments;
        return sortWeeklyPaymentPaymentRows(filteredPayments, paymentsSortField, paymentsSortDirection);
    }, [filteredPayments, paymentsSortField, paymentsSortDirection]);
    const partyFilterOptions = React.useMemo(() => {
        const ids = new Set();
        if (isClientToggleActive) {
            return clientOptions.map(opt => {
                if (ids.has(opt.label)) return null;
                ids.add(opt.label);
                return { value: opt.label, label: opt.label };
            }).filter(Boolean);
        }
        return filteredExpenses.map(exp => {
            const option =
                combinedOptions.find(
                    opt =>
                        (opt.type === "Contractor" && opt.id === Number(exp.contractor_id)) ||
                        (opt.type === "Vendor" && opt.id === Number(exp.vendor_id)) ||
                        (opt.type === "Employee" && opt.id === Number(exp.employee_id))
                );
            if (option && !ids.has(option.id)) {
                ids.add(option.id);
                return { value: option.label, label: option.label };
            }
            return null;
        }).filter(Boolean);
    }, [filteredExpenses, combinedOptions, clientOptions, isClientToggleActive]);
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
    const updateDescription = async (id, description) => {
        try {
            const res = await fetch(`https://backendaab.in/demoAabuildersDash/api/advance_portal/update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ description }),
            });
            if (!res.ok) {
                throw new Error("Failed to update description");
            }
            const data = await res.json();
            setEditFormData((prev) => ({
                ...prev,
                description: data.description,
            }));
            setPortalDescriptions((prev) => ({
                ...prev,
                [id]: data.description,
            }));
            return data;
        } catch (error) {
            console.error("❌ Error updating description:", error);
            alert("Failed to update description");
        }
    };
    const generatePDF = async () => {
        if (!operationalWeekNumber) {
            alert("Please ensure week data is loaded before generating the PDF.");
            return;
        }
        const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const year = new Date().getFullYear();
        const weekDates = getStartAndEndDateOfISOWeek(operationalWeekNumber, year);
        const weekStartDate = weekDates.startDate.toLocaleDateString("en-GB");
        const weekEndDate = weekDates.endDate.toLocaleDateString("en-GB");
        if (!Array.isArray(expenses) || !Array.isArray(payments)) {
            alert("Error: Data not loaded properly. Please refresh the page and try again.");
            return;
        }
        const totalExpenses = expenses.reduce((t, e) => t + Number(e.amount || 0), 0);
        const totalPayments = payments.reduce((t, p) => t + Number(p.amount || 0), 0);
        const balance = totalPayments - totalExpenses;
        let advancePortalData = [];
        let staffAdvanceData = [];
        let loanPortalData = [];
        try {
            const [advanceRes, staffAdvanceRes, loanRes] = await Promise.all([
                fetch("https://backendaab.in/demoAabuildersDash/api/advance_portal/getAll").catch(() => null),
                fetch("https://backendaab.in/demoAabuildersDash/api/staff-advance/all").catch(() => null),
                fetch("https://backendaab.in/demoAabuildersDash/api/loans/all").catch(() => null)
            ]);
            if (advanceRes && advanceRes.ok) {
                advancePortalData = await advanceRes.json();
            }
            if (staffAdvanceRes && staffAdvanceRes.ok) {
                staffAdvanceData = await staffAdvanceRes.json();
            }
            if (loanRes && loanRes.ok) {
                loanPortalData = await loanRes.json();
            }
        } catch (error) {
            console.error("Error fetching portal data:", error);
        }
        const isDateInWeek = (dateStr) => {
            if (!dateStr) return false;
            const date = new Date(dateStr);
            date.setHours(0, 0, 0, 0);
            return date >= weekDates.startDate && date <= weekDates.endDate;
        };
        const staffPurposeOptions = await fetchStaffPurposeOptions();
        const {
            salaryAdvanceEntries: salaryAdvancePortalEntries,
            wageAdvanceEntries: wageAdvancePortalEntries,
            salaryAdvanceTotal: staffAdvanceTotalFromPortal,
        } = splitStaffAdvancePortalByPurpose(staffAdvanceData, isDateInWeek, staffPurposeOptions);
        const loanTotalFromPortal = loanPortalData
            .filter(entry =>
                (entry.loan_payment_mode === "Cash" || entry.payment_mode === "Cash") &&
                entry.type === "Loan" &&
                isDateInWeek(entry.date)
            )
            .reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
        const getPartyDisplayName = (entry) => {
            const hasContractorVendorEmployee = entry.contractor_id || entry.vendor_id || entry.employee_id;
            if (!hasContractorVendorEmployee && entry.type === "Loan") {
                const client = getClientName(entry);
                if (client) return client;
            }
            if (entry.vendor_id) return getVendorName(entry.vendor_id);
            if (entry.contractor_id) return getContractorName(entry.contractor_id);
            if (entry.employee_id) return getEmployeeName(entry.employee_id);
            return "";
        };
        const formatDateOnly = (dateString) => {
            if (!dateString) return "";
            try {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return "";
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
            } catch (error) {
                console.error("Error formatting date:", error);
                return "";
            }
        };
        const formatDate = (dateString) => {
            if (!dateString) return "";
            try {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return "";
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
            } catch (error) {
                console.error("Error formatting date:", error);
                return "";
            }
        };
        const drawHeader = (doc, titleText = "") => {
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.rect(20, 24, 810, 40);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const shouldShowWeekNumber = previousWeekHasStatusTrue || !previousWeekHasData;
            const displayWeekNumber = shouldShowWeekNumber ? (operationalWeekNumber || "") : "";
            doc.text(`PS: ${String(operationalWeekNumber ?? "-")}`, 30, 40);
            doc.setFontSize(9);
            doc.text(String(new Date().toLocaleDateString("en-GB") || ""), 30, 55);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(titleText, 180, 50);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.text(`START  ${String(weekStartDate || "")}`, 460, 40);
            doc.text(`END    ${String(weekEndDate || "")}`, 465, 58);
            doc.setFillColor(220, 250, 220);
            doc.rect(620, 25, 190, 18.5, "F");
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("EXPENSES", 660, 37);
            const amountX = 800;
            doc.text(
                String(totalExpenses.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"),
                amountX, 37,
                { align: "right" }
            );
            doc.setFillColor(250, 220, 220);
            doc.rect(620, 44, 190, 18.5, "F");
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("BALANCE", 660, 58);
            doc.text(
                String(balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"),
                amountX, 58,
                { align: "right" }
            );
        };
        drawHeader(doc, "WEEKLY PAYMENT REPORT");
        const expensesHeaders = [["SNO", "Date", "Party", "Project Name", "Type", "Amount", "AC", "C", ""]];
        const pdfFilteredExpenses = expenses.filter(row => row.type === "Bill Payment" || row.type === "Wage" || row.type === "Bill Settlement");
        const expensesData = pdfFilteredExpenses.map((row, idx) => [
            String(idx + 1 || ""),
            String(row.date ? formatDateOnly(row.date) : ""),
            String(getPartyDisplayName(row) || ""),
            String(siteOptions.find(opt => opt.id === Number(row.project_id))?.label || ""),
            String(row.type || ""),
            String(Number(row.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"),
            String(""),
            String(""),
            String("")
        ]);
        autoTable(doc, {
            head: expensesHeaders,
            body: expensesData,
            margin: { top: 64, left: 20 },
            tableWidth: 810,
            theme: "grid",
            styles: {
                fontSize: 8,
                cellPadding: 3,
                textColor: [0, 0, 0],
                lineColor: [0, 0, 0],
                lineWidth: 0.5
            },
            headStyles: {
                textColor: [0, 0, 0],
                fillColor: [255, 230, 230],
                lineColor: [0, 0, 0],
                lineWidth: 1.0,
                fontStyle: 'normal'
            },
            columnStyles: {
                5: { halign: 'right' }
            },
            didDrawPage: (data) => {
                drawHeader(doc, "WEEKLY PAYMENT REPORT");
                if (data.pageNumber > 1) {
                    doc.setFontSize(10);
                }
            },
            pageBreak: 'auto',
            showHead: 'everyPage',
        });
        const paymentsHeaders = [["DATE RECEIVED", "AMOUNT", "TYPE"]];
        const paymentsData = payments.map(r => [
            String(r.created_at ? formatDate(r.created_at) : ""),
            String(Number(r.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"),
            String(r.type || "")
        ]);
        paymentsData.push([
            { content: "TOTAL", styles: { fontStyle: "bold" } },
            { content: String(totalPayments.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"), styles: { fontStyle: "bold" } },
            { content: "", styles: { fontStyle: "bold" } }
        ]);
        paymentsData.push([
            { content: "BALANCE", styles: { fontStyle: "bold" } },
            { content: String(balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"), styles: { fontStyle: "bold" } },
            { content: "", styles: { fontStyle: "bold" } }
        ]);
        doc.addPage();
        drawHeader(doc, "WEEKLY PAYMENT STATEMENT");
        const baseY = 110;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("PAYMENT RECEIVED", 22, baseY - 25);
        autoTable(doc, {
            head: paymentsHeaders,
            body: paymentsData,
            startY: baseY - 20,
            margin: { left: 20 },
            tableWidth: 210,
            theme: "grid",
            styles: { fontSize: 8, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5 },
            headStyles: { textColor: [0, 0, 0], fillColor: [255, 230, 230], lineColor: [0, 0, 0], lineWidth: 1, fontStyle: 'bold' },
            bodyStyles: { fontStyle: 'bold' },
            columnStyles: {
                1: { halign: 'right' }
            },
            didDrawPage: () => {
                drawHeader(doc);
            }
        });
        const paymentReceivedTable = doc.lastAutoTable;
        const handoverStartY = paymentReceivedTable && paymentReceivedTable.finalY ? paymentReceivedTable.finalY + 20 : baseY + 250;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("HANDOVER DETAILS", 22, handoverStartY - 5);
        autoTable(doc, {
            head: [["DATE RETURNED", "AMOUNT"]],
            body: [
                ["", ""],
                ["RETURNED", "0"]
            ],
            startY: handoverStartY,
            margin: { left: 22 },
            tableWidth: 200,
            theme: "grid",
            styles: { fontSize: 8, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5 },
            headStyles: { textColor: [0, 0, 0], fillColor: [255, 230, 230], lineColor: [0, 0, 0], lineWidth: 1, fontStyle: 'bold' },
            bodyStyles: { fontStyle: 'bold' },
            columnStyles: {
                1: { halign: 'right' }
            },
            didDrawPage: () => {
                drawHeader(doc);
            }
        });
        const dividerX = 260;
        const headerBottomY = 65;
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(dividerX, headerBottomY, dividerX, pageHeight - 0);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        const dailyExpenses = expenses.filter(expense => expense.type === "Daily");
        const dailyExpenseData = dailyExpenses.map(expense => [
            String(expense.date ? formatDateOnly(expense.date) : ""),
            String(Number(expense.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
        ]);
        const dailyExpensesTotal = dailyExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
        if (dailyExpenseData.length === 0) {
            dailyExpenseData.push(["No Daily Expenses", "0.00"]);
        }
        const expenditureDailyWageGap = 28;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("EXPENDITURE PAYMENTS", 300, baseY - 25);
        const summaryMap = weeklyTypes.reduce((acc, typeObj) => {
            acc[typeObj.type] = { count: 0, total: 0 };
            return acc;
        }, {});
        if (!summaryMap[UTILITY_BILLS_SUMMARY_TYPE]) {
            summaryMap[UTILITY_BILLS_SUMMARY_TYPE] = { count: 0, total: 0 };
        }
        const allExpenseTypes = [...new Set(
            expenses
                .filter(expense => expense.type)
                .map(e => e.type)
                .filter(Boolean)
        )];
        const fixedTypes = weeklyTypes.map(typeObj => typeObj.type);
        allExpenseTypes.forEach(type => {
            if (UTILITY_BILL_TYPES.includes(type)) return;
            const summaryType = getExpenseSummaryType(type);
            if (!fixedTypes.includes(summaryType) && !summaryMap[summaryType]) {
                summaryMap[summaryType] = { count: 0, total: 0 };
            }
        });
        expenses
            .filter(expense => Number(expense.amount) > 0)
            .forEach(expense => {
                const type = getExpenseSummaryType(expense.type);
                const amount = Number(expense.amount);
                if (summaryMap[type]) {
                    summaryMap[type].count += 1;
                    if (type !== "Staff Advance" && type !== "Loan") {
                        summaryMap[type].total += amount;
                    }
                }
            });
        UTILITY_BILL_TYPES.forEach((utilityType) => {
            delete summaryMap[utilityType];
        });
        if (summaryMap["Staff Advance"]) {
            summaryMap["Staff Advance"].total = staffAdvanceTotalFromPortal;
            summaryMap["Staff Advance"].count = salaryAdvancePortalEntries.length;
        }
        if (summaryMap["Loan"]) {
            summaryMap["Loan"].total = loanTotalFromPortal;
        }
        const summaryData = Object.entries(summaryMap)
            .map(([type, { count, total }]) => [
                String(type || ""),
                String(Number(total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"),
                count,
                total
            ])
            .sort((a, b) => {
                const totalA = Number(a[3]);
                const totalB = Number(b[3]);
                if (totalA === 0 && totalB === 0) {
                    return a[0].localeCompare(b[0]);
                } else if (totalA === 0) {
                    return 1;
                } else if (totalB === 0) {
                    return -1;
                } else {
                    return totalB - totalA;
                }
            })
            .map(([type, formattedTotal, count, originalTotal]) => [
                type,
                formattedTotal,
                count
            ]);
        autoTable(doc, {
            head: [["SUMMARY", "TOTAL"]],
            body: summaryData.map(r => [String(r[0] || ""), String(r[1] || "0")]),
            startY: baseY - 20,
            margin: { left: 300 },
            tableWidth: 200,
            theme: "grid",
            styles: { fontSize: 9, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5 },
            headStyles: { textColor: [0, 0, 0], fillColor: [255, 230, 230], lineColor: [0, 0, 0], lineWidth: 1, fontStyle: 'bold' },
            bodyStyles: { fontStyle: 'bold' },
            columnStyles: {
                1: { halign: 'right' }
            },
            didDrawPage: () => {
                drawHeader(doc);
            },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index === 0 && data.row && data.row.index !== undefined) {
                    const rowData = summaryData[data.row.index];
                    if (rowData && rowData[2] !== undefined) {
                        const count = rowData[2];
                        if (data.cell && typeof data.cell.x === 'number' && typeof data.cell.y === 'number' && typeof data.cell.height === 'number') {
                            const textX = data.cell.x - 3;
                            const textY = data.cell.y + data.cell.height / 2 + 2;
                            doc.setFontSize(9);
                            doc.text(String(count || "0"), textX, textY, { align: 'right' });
                        }
                    }
                }
            }
        });
        const summaryTable = doc.lastAutoTable;
        if (summaryTable && summaryTable.body && Array.isArray(summaryTable.body)) {
            summaryData.forEach((row, i) => {
                const count = row[2];
                if (count > 1 && summaryTable.body[i] && typeof summaryTable.body[i].y === 'number') {
                    const rowY = summaryTable.body[i].y + 6;
                    const leftX = (summaryTable.settings && summaryTable.settings.margin && summaryTable.settings.margin.left) ? summaryTable.settings.margin.left - 15 : 285;
                    doc.setFontSize(9);
                    doc.text(String(count || ""), leftX, rowY, { align: "right" });
                }
            });
        }
        const summaryTotal = summaryData.reduce((acc, row) => acc + Number(String(row[1] || "0").replace(/,/g, "")), 0);
        const summaryBoxY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 15 : baseY + 100;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.rect(300, summaryBoxY - 12, 200, 20);
        const splitX = 420;
        doc.line(splitX, summaryBoxY - 12, splitX, summaryBoxY + 8);
        doc.text("TOTAL", 310, summaryBoxY + 3);
        doc.text(
            String(summaryTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"),
            490,
            summaryBoxY + 3,
            { align: "right" }
        );
        const expenditureSectionBottomY = summaryBoxY + 8;
        const dailyWageStartY = expenditureSectionBottomY + expenditureDailyWageGap;
        autoTable(doc, {
            head: [["DAILY WAGE", "AMOUNT"]],
            body: dailyExpenseData,
            startY: dailyWageStartY,
            margin: { left: 300 },
            tableWidth: 200,
            theme: "grid",
            styles: {
                fontSize: 8,
                cellPadding: 3,
                textColor: [0, 0, 0],
                lineColor: [0, 0, 0],
                lineWidth: 0.5
            },
            headStyles: {
                textColor: [0, 0, 0],
                fillColor: [255, 230, 230],
                lineColor: [0, 0, 0],
                lineWidth: 1,
                fontStyle: 'bold',
                halign: 'left'
            },
            bodyStyles: {
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { halign: 'left' },
                1: { halign: 'right' }
            },
            didDrawPage: () => {
                drawHeader(doc, "WEEKLY PAYMENT STATEMENT");
            }
        });
        const dailyWageTable = doc.lastAutoTable;
        if (dailyWageTable) {
            const boxY = dailyWageTable.finalY + 2;
            const boxX = 300;
            const boxWidth = 200;
            const boxHeight = 20;
            const splitX = boxX + 114;
            doc.rect(boxX, boxY, boxWidth, boxHeight);
            doc.line(splitX, boxY, splitX, boxY + boxHeight);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("TOTAL", boxX + 10, boxY + 13);
            doc.text(
                String(dailyExpensesTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })),
                boxX + boxWidth - 10,
                boxY + 13,
                { align: "right" }
            );
        }
        const newTableX = 520;
        let newTableY = baseY;
        const portalPartyHelpers = { getEmployeeName };
        const appendPortalAdvanceTable = (title, portalEntries) => {
            if (!portalEntries.length) return;
            const count = portalEntries.length;
            const total = portalEntries.reduce((sum, e) => sum + Number(e.amount || 0), 0);
            if (newTableY > doc.internal.pageSize.getHeight() - 150) {
                doc.addPage();
                drawHeader(doc, "WEEKLY PAYMENT STATEMENT");
                newTableY = baseY;
            }
            const tableY = newTableY + 10;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(title, newTableX, tableY - 25);
            const tableHead = [[
                String(count || "0"),
                "PARTY",
                "PROJECT NAME",
                String(total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
            ]];
            const tableBody = portalEntries.map((entry) => [
                String(entry.date ? formatDateOnly(entry.date) : ""),
                String(getPortalAdvancePartyName(entry, portalPartyHelpers) || ""),
                String(getPortalAdvanceProjectName(entry, siteOptions) || ""),
                String(Number(entry.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
            ]);
            autoTable(doc, {
                head: tableHead,
                body: tableBody,
                startY: tableY - 20,
                margin: { left: newTableX },
                tableWidth: 310,
                theme: "grid",
                styles: { fontSize: 8, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5 },
                headStyles: { textColor: [0, 0, 0], fillColor: [255, 230, 230], lineColor: [0, 0, 0], lineWidth: 1, fontStyle: 'bold' },
                bodyStyles: { fontStyle: 'bold' },
                columnStyles: {
                    3: { halign: 'right' }
                },
                didParseCell: (data) => {
                    if (data.section === 'head' && data.column.index === 3) {
                        data.cell.styles.halign = 'right';
                    }
                },
                didDrawPage: () => {
                    drawHeader(doc, "WEEKLY PAYMENT STATEMENT");
                }
            });
            newTableY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : newTableY + 50;
        };
        appendPortalAdvanceTable("SALARY ADVANCE", salaryAdvancePortalEntries);
        appendPortalAdvanceTable("WAGE ADVANCE", wageAdvancePortalEntries);
        const staffSalaryEntries = expenses.filter(e => e.type === "Staff Salary");
        if (staffSalaryEntries.length > 0) {
            const staffSalaryCount = staffSalaryEntries.length;
            const staffSalaryTotal = staffSalaryEntries.reduce((sum, e) => sum + Number(e.amount || 0), 0);
            const staffSalaryY = newTableY + 30;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("STAFF SALARY", newTableX, staffSalaryY - 25);
            const staffSalaryHead = [[
                String(staffSalaryCount || "0"),
                "PARTY",
                "PROJECT NAME",
                String(staffSalaryTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
            ]];
            const staffSalaryBody = staffSalaryEntries.map(e => [
                String(e.date ? formatDateOnly(e.date) : ""),
                String(getPartyDisplayName(e) || ""),
                String(siteOptions.find(opt => opt.id === Number(e.project_id))?.label || ""),
                String(Number(e.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
            ]);
            autoTable(doc, {
                head: staffSalaryHead,
                body: staffSalaryBody,
                startY: staffSalaryY - 20,
                margin: { left: newTableX },
                tableWidth: 310,
                theme: "grid",
                styles: { fontSize: 8, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5 },
                headStyles: { textColor: [0, 0, 0], fillColor: [255, 230, 230], lineColor: [0, 0, 0], lineWidth: 1, fontStyle: 'bold' },
                bodyStyles: { fontStyle: 'bold' },
                columnStyles: {
                    3: { halign: 'right' }
                },
                didParseCell: (data) => {
                    if (data.section === 'head' && data.column.index === 3) {
                        data.cell.styles.halign = 'right';
                    }
                },
                didDrawPage: () => {
                    drawHeader(doc);
                }
            });
            newTableY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : newTableY + 50;
        }
        const excludedTypes = ["Bill Payment", "Wage", "Project Advance", "Staff Advance", "Staff Salary", "Daily", "Diwali Bonus", "Bill Settlement", "Utility Bills", ...UTILITY_BILL_TYPES];
        const otherExpenseTypes = [...new Set(expenses.map(e => e.type).filter(type => type && !excludedTypes.includes(type)))];
        otherExpenseTypes.forEach((expenseType) => {
            const typeEntries = expenses.filter(e => e.type === expenseType);
            if (typeEntries.length === 0) return;
            const typeCount = typeEntries.length;
            const typeTotal = typeEntries.reduce((sum, e) => sum + Number(e.amount || 0), 0);
            const typeY = newTableY + 30;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(expenseType.toUpperCase(), newTableX, typeY - 25);
            const typeHead = [[
                String(typeCount || "0"),
                "PARTY",
                "PROJECT NAME",
                String(typeTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
            ]];
            const typeBody = typeEntries.map(e => [
                String(e.date ? formatDateOnly(e.date) : ""),
                String(getPartyDisplayName(e) || ""),
                String(siteOptions.find(opt => opt.id === Number(e.project_id))?.label || ""),
                String(Number(e.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
            ]);
            if (newTableY > doc.internal.pageSize.getHeight() - 150) {
                doc.addPage();
                drawHeader(doc, "WEEKLY PAYMENT STATEMENT");
                newTableY = baseY;
            }
            autoTable(doc, {
                head: typeHead,
                body: typeBody,
                startY: typeY - 20,
                margin: { left: newTableX },
                tableWidth: 310,
                theme: "grid",
                styles: { fontSize: 8, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5 },
                headStyles: { textColor: [0, 0, 0], fillColor: [255, 230, 230], lineColor: [0, 0, 0], lineWidth: 1, fontStyle: 'bold' },
                bodyStyles: { fontStyle: 'bold' },
                columnStyles: {
                    3: { halign: 'right' }
                },
                didParseCell: (data) => {
                    if (data.section === 'head' && data.column.index === 3) {
                        data.cell.styles.halign = 'right';
                    }
                },
                didDrawPage: () => {
                    drawHeader(doc, "WEEKLY PAYMENT STATEMENT");
                }
            });
            newTableY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : newTableY + 50;
        });
        UTILITY_BILL_TYPES.forEach((utilityType) => {
            const typeEntries = expenses.filter((e) => e.type === utilityType);
            if (typeEntries.length === 0) return;
            const typeCount = typeEntries.length;
            const typeTotal = typeEntries.reduce((sum, e) => sum + Number(e.amount || 0), 0);
            const typeY = newTableY + 30;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(utilityType.toUpperCase(), newTableX, typeY - 25);
            const typeHead = [[
                String(typeCount || "0"),
                "PARTY",
                "PROJECT NAME",
                String(typeTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
            ]];
            const typeBody = typeEntries.map(e => [
                String(e.date ? formatDateOnly(e.date) : ""),
                String(getPartyDisplayName(e) || ""),
                String(siteOptions.find(opt => opt.id === Number(e.project_id))?.label || ""),
                String(Number(e.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
            ]);
            if (newTableY > doc.internal.pageSize.getHeight() - 150) {
                doc.addPage();
                drawHeader(doc, "WEEKLY PAYMENT STATEMENT");
                newTableY = baseY;
            }
            autoTable(doc, {
                head: typeHead,
                body: typeBody,
                startY: typeY - 20,
                margin: { left: newTableX },
                tableWidth: 310,
                theme: "grid",
                styles: { fontSize: 8, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5 },
                headStyles: { textColor: [0, 0, 0], fillColor: [255, 230, 230], lineColor: [0, 0, 0], lineWidth: 1, fontStyle: 'bold' },
                bodyStyles: { fontStyle: 'bold' },
                columnStyles: {
                    3: { halign: 'right' }
                },
                didParseCell: (data) => {
                    if (data.section === 'head' && data.column.index === 3) {
                        data.cell.styles.halign = 'right';
                    }
                },
                didDrawPage: () => {
                    drawHeader(doc, "WEEKLY PAYMENT STATEMENT");
                }
            });
            newTableY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : newTableY + 50;
        });
        const diwaliBonusEntries = expenses.filter(e => e.type === "Diwali Bonus");
        if (diwaliBonusEntries.length > 0) {
            const diwaliBonusCount = diwaliBonusEntries.length;
            const diwaliBonusTotal = diwaliBonusEntries.reduce((sum, e) => sum + Number(e.amount || 0), 0);
            const diwaliBonusY = newTableY + 30;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("DIWALI BONUS", newTableX, diwaliBonusY - 25);
            const diwaliBonusHead = [[
                String(diwaliBonusCount || "0"),
                "PARTY",
                "AMOUNT",
                String(diwaliBonusTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00")
            ]];
            const diwaliBonusBody = diwaliBonusEntries.map(e => [
                String(e.date ? formatDateOnly(e.date) : ""),
                String(getPartyDisplayName(e) || ""),
                String(Number(e.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"),
                ""
            ]);
            autoTable(doc, {
                head: diwaliBonusHead,
                body: diwaliBonusBody,
                startY: diwaliBonusY - 20,
                margin: { left: newTableX },
                tableWidth: 310,
                theme: "grid",
                styles: { fontSize: 8, cellPadding: 3, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5 },
                headStyles: { textColor: [0, 0, 0], fillColor: [255, 230, 230], lineColor: [0, 0, 0], lineWidth: 1, fontStyle: 'bold' },
                bodyStyles: { fontStyle: 'bold' },
                columnStyles: {
                    2: { halign: 'right' },
                    3: { halign: 'right' }
                },
                didParseCell: (data) => {
                    if (data.section === 'head' && data.column.index === 3) {
                        data.cell.styles.halign = 'right';
                    }
                },
                didDrawPage: () => {
                    drawHeader(doc);
                }
            });
            newTableY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : newTableY + 50;
        }
        const lastPeriodEndDate = expenses
            .map(exp => exp.period_end_date)
            .filter(Boolean)
            .pop();
        newTableY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : newTableY + 50;
        doc.save(`PR ${operationalWeekNumber || ""} - Weekly Payment Report ${formatDateOnly(lastPeriodEndDate)}.pdf`);
    };
    useEffect(() => {
        if (!onExportActionsReady) return;
        onExportActionsReady({ generatePDF });
        return () => onExportActionsReady(null);
    }, [onExportActionsReady, generatePDF]);
    useEffect(() => {
        if (!onClosureActionsReady || !isTabActive) return;
        onClosureActionsReady({
            openClosure: openAccountClosure,
            isClosureDisabled: activeBranchId === null || activeBranchId === undefined || activeBranchId === "",
        });
        return () => onClosureActionsReady(null);
    }, [onClosureActionsReady, isTabActive, activeBranchId, openAccountClosure]);
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
        menu: (provided) => ({
            ...provided,
            zIndex: 10050,
        }),
        menuPortal: (provided) => ({
            ...provided,
            zIndex: 10050,
        }),
    };
    const expensesDstCol21Label = 'S.No';
    const expensesDstCol2Label = 'Date';
    const expensesDstCol4Label = 'Associate';
    const expensesDstCol4ClientLabel = 'Client Name';
    const expensesDstCol3Label = 'Project Name';
    const expensesDstCol12Label = 'Type';
    const expensesDstCol8Label = 'Amount';
    const expensesDstCol20FileLabel = 'File';
    const expensesDstCol20ActivityLabel = 'Activity';
    const expensesAssociateEntryPlaceholder = isClientToggleActive
        ? expensesDstCol4ClientLabel
        : 'Con/Ven/Emp';
    const paymentsDstCol2Label = 'Date';
    const paymentsDstCol8Label = 'Amount';
    const paymentsDstCol12Label = 'Type';
    const paymentsDstCol20Label = 'Activity';
    return (
        <div className="bg-[#FAF6ED] overflow-hidden">
            {showPopup && (
                <AccountClosurePopup
                    onClose={() => setShowPopup(false)}
                    carryForwardBalance={carryForwardBalance}
                    onConfirm={(type, discount) => {
                        handleAccountClosure(type, discount);
                        setShowPopup(false);
                    }}
                />
            )}
            <div className="flex flex-col h-[calc(100vh-104px)] overflow-hidden bg-[#FAF6ED] px-[18px] pt-[18px] pb-[18px]">
                <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-[#FAF6ED]">
                    <div className="w-full rounded-[6px] bg-white mb-[18px] shrink-0">
                        <div className="flex flex-wrap items-center justify-between text-left max-md:flex-col max-md:items-stretch">
                            <div className="flex-1 min-w-0 overflow-visible p-[18px]">
                                <div className="flex flex-wrap gap-[12px] items-end text-left">
                                    {(selectType
                                        ? expenseTypeSummary.items.filter(({ type }) => type === selectType)
                                        : expenseTypeSummary.items
                                    ).map(({ type, count, total }) => (
                                        <div key={type} className="cursor-pointer transition-all duration-200 hover:scale-105" onClick={() => setSelectType(type)}>
                                            <div className="flex items-center justify-between mb-[8px]">
                                                <label className={`font-semibold text-[16px] transition-colors duration-200 ${selectType === type ? 'text-[#BF9853]' : 'text-[#000000]'}`}>
                                                    {type}
                                                </label>
                                                <span className="text-[14px] text-red-500 font-medium">
                                                    {count}
                                                </span>
                                            </div>
                                            <input
                                                type="text"
                                                value={`₹${Number(total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                                readOnly
                                                className={`${type === 'Bill Payments + Claim' || type === 'Sundry Payment' ? 'w-[220px]' : 'w-[150px]'} h-[40px] cursor-pointer rounded-lg border-2 focus:outline-none pl-[12px] text-[14px] font-semibold transition-all duration-200 ${selectType === type
                                                    ? 'border-[#BF9853] bg-[#FFFFFF] text-[#000000] shadow-md'
                                                    : 'border-[#BF9853] border-opacity-25 bg-[#FFFFFF] text-[#000000] hover:border-[#BF9853] hover:border-opacity-75 hover:shadow-sm'
                                                    }`}
                                            />
                                        </div>
                                    ))}
                                    {!selectType && expenseTypeSummary.totalCount > 0 && (
                                        <div className="cursor-pointer transition-all duration-200 hover:scale-105 shrink-0">
                                            <div className="flex items-center justify-between mb-[8px]">
                                                <label className="font-semibold text-[16px] text-[#000000]">
                                                    Total
                                                </label>
                                                <span className="text-[14px] text-red-500 font-medium">
                                                    {expenseTypeSummary.totalCount}
                                                </span>
                                            </div>
                                            <input
                                                type="text"
                                                value={`₹${Number(expenseTypeSummary.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                                readOnly
                                                className="w-[150px] h-[40px] cursor-pointer rounded-lg border-2 focus:outline-none pl-[12px] text-[14px] font-semibold transition-all duration-200 border-[#BF9853] border-opacity-25 bg-[#FFFFFF] text-[#000000] hover:border-[#BF9853] hover:border-opacity-75 hover:shadow-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center flex-wrap justify-end pr-[18px] max-md:justify-start max-md:px-[18px] max-md:pb-[18px] max-md:w-full">
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
                                            <span>Income</span>
                                            <span className="ml-auto">:</span>
                                        </span>
                                        <span className="font-semibold" style={{ color: "#E4572E" }}>
                                            {formatWeeklySummaryAmount(totalPayments)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[14px] gap-6 py-0.5">
                                        <span className="flex shrink-0 w-[76px] text-black font-semibold">
                                            <span>Expenses</span>
                                            <span className="ml-auto">:</span>
                                        </span>
                                        <span className="font-semibold" style={{ color: "#E4572E" }}>
                                            {formatWeeklySummaryAmount(totalExpenses)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[14px] gap-6 py-0.5">
                                        <span className="flex shrink-0 w-[76px] text-black font-semibold">
                                            <span>Balance</span>
                                            <span className="ml-auto">:</span>
                                        </span>
                                        <span className="font-semibold" style={{ color: "#E4572E" }}>
                                            {formatWeeklySummaryAmount(balance - (Number(newExpense.amount) || 0))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full pt-[18px] px-[18px] pb-[18px] bg-white rounded-[6px] flex flex-col flex-1 min-h-0 overflow-hidden max-xl:overflow-y-auto no-scrollbar scrollbar-none">
                        <div className="flex flex-col xl:flex-row gap-[18px] flex-1 min-h-0 overflow-hidden max-xl:flex-none max-xl:overflow-x-auto max-xl:no-scrollbar max-xl:scrollbar-none">
                            <div className="flex-1 min-w-0 flex flex-col min-h-0 overflow-hidden max-xl:flex-none max-xl:overflow-x-auto max-xl:no-scrollbar max-xl:scrollbar-none max-xl:shrink-0 xl:min-w-[1240] xl:max-w-[1240] xl:shrink-0 xl:h-full xl:flex-none xl:w-auto">
                                <div className="flex justify-between items-center mb-[8px] shrink-0">
                                    <h1 className="font-bold text-base">
                                        Expenses (PS {operationalWeekNumber ?? "-"})
                                    </h1>
                                    <h1 className="font-bold text-base" style={{ color: "#E4572E" }}>
                                        ₹{Number(totalExpenses).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </h1>
                                </div>
                                <div className="flex flex-col w-full max-w-full overflow-hidden xl:w-fit xl:flex-1 xl:min-h-0 max-xl:flex-none max-xl:overflow-x-auto max-xl:no-scrollbar max-xl:scrollbar-none">
                                    <div className="mb-[12px] w-full min-w-0 min-h-[34px] shrink-0 flex flex-row flex-nowrap items-center gap-[6px] overflow-hidden">
                                        <div className="shrink-0 flex items-center z-[2] bg-white">
                                            <EdbcFilterToggleButton
                                                onClick={() => {
                                                    const willOpen = !showFilters;
                                                    const scroller = scrollRef.current;
                                                    if (willOpen) {
                                                        setShowFilters(true);
                                                        if (!scroller) return;
                                                        if (scroller.scrollTop <= 0) return;
                                                        if (filterNudgeUsedRef.current) return;
                                                        filterNudgeUsedRef.current = true;
                                                        requestAnimationFrame(() => {
                                                            requestAnimationFrame(() => {
                                                                const h = filterRowRef.current?.offsetHeight || 0;
                                                                if (h > 0) {
                                                                    scroller.scrollTop = Math.max(0, scroller.scrollTop - h);
                                                                }
                                                            });
                                                        });
                                                        return;
                                                    }
                                                    const h = filterRowRef.current?.offsetHeight || 0;
                                                    setShowFilters(false);
                                                    if (!scroller || h <= 0 || !filterNudgeUsedRef.current) return;
                                                    filterNudgeUsedRef.current = false;
                                                    requestAnimationFrame(() => {
                                                        requestAnimationFrame(() => {
                                                            scroller.scrollTop = scroller.scrollTop + h;
                                                        });
                                                    });
                                                }}
                                            />
                                        </div>
                                        <div
                                            ref={expensesFilterChipsRef}
                                            className="w-0 flex-1 min-w-0 flex flex-row flex-nowrap items-center gap-[6px] overflow-x-auto overflow-y-hidden no-scrollbar scrollbar-none cursor-grab max-xl:w-auto max-xl:flex-none max-xl:shrink"
                                            onMouseDown={(e) => handleMouseDown(e, expensesFilterChipsRef, true)}
                                            onMouseMove={(e) => handleMouseMove(e, expensesFilterChipsRef, true)}
                                            onMouseUp={() => handleMouseUp(expensesFilterChipsRef)}
                                            onMouseLeave={() => handleMouseUp(expensesFilterChipsRef)}
                                        >
                                            {selectDate && (
                                                <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit">
                                                    <span className="font-medium text-[#BF9853]">Date: </span>
                                                    <span className="font-semibold text-[14px]">{formatDateOnly(selectDate)}</span>
                                                    <button onClick={() => setSelectDate('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                                                </span>
                                            )}
                                            {selectContractororVendorName && (
                                                <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                    <span className="font-medium text-[#BF9853]">Associate: </span>
                                                    <span className="font-semibold text-[14px]">{selectContractororVendorName}</span>
                                                    <button onClick={() => setSelectContractororVendorName('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                                </span>
                                            )}
                                            {selectProjectName && (
                                                <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                    <span className="font-medium text-[#BF9853]">Project Name: </span>
                                                    <span className="font-semibold text-[14px]">{selectProjectName}</span>
                                                    <button onClick={() => setSelectProjectName('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                                </span>
                                            )}
                                            {selectType && (
                                                <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                    <span className="font-medium text-[#BF9853]">Type: </span>
                                                    <span className="font-semibold text-[14px]">{selectType}</span>
                                                    <button onClick={() => setSelectType('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                                </span>
                                            )}
                                            {selectExpenseAmount.trim() && (
                                                <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                    <span className="font-medium text-[#BF9853]">{expensesDstCol8Label}: </span>
                                                    <span className="font-semibold text-[14px]">{selectExpenseAmount}</span>
                                                    <button type="button" onClick={() => setSelectExpenseAmount('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                                </span>
                                            )}
                                        </div>
                                        <EdbcTableToolbarRightActions
                                            onClearFilters={clearFilters}
                                            overallSearch={overallSearch}
                                            onOverallSearchChange={setOverallSearch}
                                            wrapperClassName="flex items-center gap-[6px] min-w-0 z-[2] bg-white pl-[4px] max-xl:flex-1 xl:shrink-0"
                                            searchWrapperClassName="h-[34px] min-w-0 flex-1 border border-[#D6D6D6] rounded-md bg-white flex items-center px-2 gap-1 xl:w-[286px] xl:shrink-0"
                                        />
                                    </div>
                                    <div className="w-full flex-1 min-h-0 rounded-lg border-l-8 border-l-[#BF9853] overflow-hidden xl:w-fit xl:flex xl:flex-col max-xl:flex-none max-xl:min-h-[330px]">
                                        <div
                                            ref={scrollRef}
                                            className="w-full flex-1 min-h-0 h-full overflow-y-auto overflow-x-auto no-scrollbar scrollbar-none max-xl:flex-none max-xl:min-h-[330px] xl:w-fit xl:max-w-full xl:overflow-auto"
                                            onWheel={() => { filterNudgeUsedRef.current = false; }}
                                            onMouseDown={(e) => handleMouseDown(e, scrollRef)}
                                            onMouseMove={(e) => handleMouseMove(e, scrollRef)}
                                            onMouseUp={() => handleMouseUp(scrollRef)}
                                            onMouseLeave={() => handleMouseUp(scrollRef)}
                                        >
                                            <table className={`border-collapse text-left ${WEEKLY_PAYMENT_EXPENSES_TABLE_FIXED_WIDTH_CLASS} table-fixed ${EDBC_TABLE_EDGE_TABLE_CLASS} [&_thead_tr>th#EDBC-19]:!pr-[1px] [&_tbody_tr>td#EDBC-19]:!pr-[1px] [&_th#EDBC-20]:!w-[70px] [&_td#EDBC-20]:!w-[70px] [&_th#EDBC-20]:!min-w-[70px] [&_td#EDBC-20]:!min-w-[70px] [&_th#EDBC-20]:!max-w-[70px] [&_td#EDBC-20]:!max-w-[70px] ${WEEKLY_PAYMENT_EDBC8_TABLE_CLASS} ${WEEKLY_PAYMENT_EXPENSES_TABLE_LOCK_TABLE_CLASS}`}>
                                                <colgroup>
                                                    <col style={{ width: '70px' }} />
                                                    <col style={{ width: '120px' }} />
                                                    <col style={{ width: '218px' }} />
                                                    <col style={{ width: '30px' }} />
                                                    <col style={{ width: '298px' }} />
                                                    <col style={{ width: '158px' }} />
                                                    <col style={{ width: '120px' }} />
                                                    <col style={{ width: '70px' }} />
                                                    <col style={{ width: '70px' }} />
                                                    <col style={{ width: '70px' }} />
                                                    <col style={{ width: '12px' }} />
                                                </colgroup>
                                                <thead className="sticky top-0 z-10 bg-white">
                                                    <EdbcTableHeaderRow>
                                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC21} label={expensesDstCol21Label} />
                                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC2} label={expensesDstCol2Label} {...expensesSortProps} />
                                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC4} label={expensesDstCol4Label} {...expensesSortProps} />
                                                        <th className="w-[30px] min-w-[30px] max-w-[30px] p-0 overflow-visible" aria-hidden="true"></th>
                                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC3} label={expensesDstCol3Label} {...expensesSortProps} />
                                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC12} label={expensesDstCol12Label} {...expensesSortProps} />
                                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC8} label={expensesDstCol8Label} {...expensesSortProps} />
                                                        <th
                                                            id={EDBC_IDS.EDBC20}
                                                            className={`${getEdbcColumnConfig(EDBC_IDS.EDBC20)?.headerClass || ''}`.replace(/\bcursor-pointer\b/g, '').replace(/\bhover:bg-gray-200\b/g, '').replace(/\bselect-none\b/g, '').replace(/\s+/g, ' ').trim() + ' !pr-0'}
                                                            style={{ paddingRight: 0 }}
                                                            aria-hidden="true"
                                                        />
                                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC20} label={expensesDstCol20FileLabel} />
                                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC19} label={expensesDstCol20ActivityLabel} />
                                                        <th className="w-[12px] min-w-[12px] max-w-[12px] p-0" aria-hidden="true"></th>
                                                    </EdbcTableHeaderRow>
                                                    {showFilters && (
                                                        <EdbcTableFilterRow ref={filterRowRef}>
                                                            <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC21} />
                                                            <EdbcDateFilter placeholder={expensesDstCol2Label} value={selectDate} onChange={setSelectDate} />
                                                            <EdbcSelectFilter columnId={EDBC_IDS.EDBC4} placeholder={expensesDstCol4Label} options={contractorVendorFilterOptions} value={selectContractororVendorName} onChange={setSelectContractororVendorName} selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES} />
                                                            <th className="w-[30px] min-w-[30px] max-w-[30px] p-0 overflow-visible"></th>
                                                            <EdbcProjectNameFilter placeholder={expensesDstCol3Label} options={projectFilterOptions} value={selectProjectName} onChange={setSelectProjectName} selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES} />
                                                            <EdbcSelectFilter columnId={EDBC_IDS.EDBC12} placeholder={expensesDstCol12Label} options={weeklyTypes.map((type) => ({ value: type.type, label: type.type }))} value={selectType} onChange={setSelectType} selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES} />
                                                            <EdbcTotalAmountFilter columnId={EDBC_IDS.EDBC8} totalAmount={filteredExpenses.reduce((total, expense) => total + Number(expense.amount || 0), 0)} value={selectExpenseAmount} onChange={(e) => setSelectExpenseAmount(e.target.value)} />
                                                            <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC20} />
                                                            <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC20} />
                                                            <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC19} />
                                                            <th className="w-[12px] min-w-[12px] max-w-[12px] p-0" aria-hidden="true"></th>
                                                        </EdbcTableFilterRow>
                                                    )}
                                                    <tr className="bg-white border-b-2 border-gray-200 h-[40px] max-h-[40px] [&>td]:!py-0 overflow-hidden">
                                                        <td id={EDBC_IDS.EDBC21} className={getEdbcColumnConfig(EDBC_IDS.EDBC21)?.tdClass}>
                                                            {filteredExpenses.length + 1}.
                                                        </td>
                                                        <td id={EDBC_IDS.EDBC2} className={getEdbcColumnConfig(EDBC_IDS.EDBC2)?.tdClass}>
                                                            <div className={getEdbcColumnConfig(EDBC_IDS.EDBC2)?.filterWidthClass} onKeyDown={handleKeyDownExpense}>
                                                                <CustomDateField
                                                                    value={newExpense.date}
                                                                    onChange={(dateStr) => handleExpenseChange({ target: { name: 'date', value: dateStr } })}
                                                                    placeholder={expensesDstCol2Label}
                                                                    alwaysOpenBelow
                                                                    controlHeightPx={EDBC_FILTER_CONTROL_HEIGHT_PX}
                                                                    className={` [&>div]:!w-full [&>div]:!border-2 [&>div]:!border-[rgba(191,152,83,0.2)] [&>div]:!rounded-lg [&>div]:!shadow-none [&>div]:!text-[14px] [&>div:hover]:!border-[rgba(191,152,83,0.4)] ${newExpense.date ? '[&>div]:!text-black [&>div]:!font-normal' : '[&>div]:!text-[#d3d5db] [&>div]:!font-normal'}`}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td id={EDBC_IDS.EDBC4} className={getEdbcColumnConfig(EDBC_IDS.EDBC4)?.tdClass}>
                                                            <div className={getEdbcColumnConfig(EDBC_IDS.EDBC4)?.filterWidthClass}>
                                                                <Select
                                                                    name="party"
                                                                    isDisabled={isSubmitting}
                                                                    value={isClientToggleActive ? (selectedClient || null) : (selectedContractor || selectedVendor || selectedEmployee || null)}
                                                                    onChange={(selectedOption) => {
                                                                        if (newExpense.type === "Staff Advance") {
                                                                            if (selectedOption && (selectedOption.type === "Contractor" || selectedOption.type === "Vendor")) {
                                                                                alert("Staff Advance type only allows Employee. Please select an Employee.");
                                                                                return;
                                                                            }
                                                                        }
                                                                        if (newExpense.type === "Project Advance") {
                                                                            if (selectedOption && selectedOption.type === "Employee") {
                                                                                alert("Project Advance type only allows Contractor or Vendor. Please select a Contractor or Vendor.");
                                                                                return;
                                                                            }
                                                                        }
                                                                        if (isClientToggleActive) {
                                                                            if (selectedOption) {
                                                                                const clientKey = selectedOption?.compositeKey || buildClientKey(selectedOption.label, selectedOption.fatherName, selectedOption.mobile);
                                                                                const projectsForClient = selectedOption?.projects || (clientKey ? (clientProjectMap[clientKey]?.projects || []) : []);
                                                                                setClientProjectOptions(projectsForClient);
                                                                                if (projectsForClient.length === 1) {
                                                                                    setSelectedProjectName(projectsForClient[0]);
                                                                                } else if (projectsForClient.length === 0) {
                                                                                    setSelectedProjectName(null);
                                                                                } else {
                                                                                    setSelectedProjectName((prevProject) =>
                                                                                        projectsForClient.find((proj) => String(proj.id) === String(prevProject?.id)) || null
                                                                                    );
                                                                                }
                                                                                setSelectedClient(selectedOption);
                                                                                setNewExpense((prev) => ({
                                                                                    ...prev,
                                                                                    client_name: selectedOption.label,
                                                                                    client_id: selectedOption.clientId || selectedOption.id || "",
                                                                                }));
                                                                            } else {
                                                                                setSelectedClient(null);
                                                                                setClientProjectOptions([]);
                                                                                setSelectedProjectName(null);
                                                                                setNewExpense((prev) => ({
                                                                                    ...prev,
                                                                                    client_name: "",
                                                                                    client_id: "",
                                                                                }));
                                                                            }
                                                                            setSelectedContractor(null);
                                                                            setSelectedVendor(null);
                                                                            setSelectedEmployee(null);
                                                                            return;
                                                                        }
                                                                        if (!selectedOption) {
                                                                            setSelectedContractor(null);
                                                                            setSelectedVendor(null);
                                                                            setSelectedEmployee(null);
                                                                        } else if (selectedOption.type === "Contractor") {
                                                                            setSelectedContractor(selectedOption);
                                                                            setSelectedVendor(null);
                                                                            setSelectedEmployee(null);
                                                                        } else if (selectedOption.type === "Vendor") {
                                                                            setSelectedVendor(selectedOption);
                                                                            setSelectedContractor(null);
                                                                            setSelectedEmployee(null);
                                                                        } else if (selectedOption.type === "Employee") {
                                                                            setSelectedVendor(null);
                                                                            setSelectedContractor(null);
                                                                            setSelectedEmployee(selectedOption);
                                                                        }
                                                                        setSelectedClient(null);
                                                                        setClientProjectOptions([]);
                                                                        setNewExpense((prev) => ({
                                                                            ...prev,
                                                                            client_name: "",
                                                                            client_id: "",
                                                                        }));
                                                                    }}
                                                                    options={isClientToggleActive ? clientOptions : combinedOptions}
                                                                    placeholder={expensesAssociateEntryPlaceholder}
                                                                    isSearchable
                                                                    isClearable
                                                                    menuPortalTarget={document.body}
                                                                    menuPosition="fixed"
                                                                    classNames={ENTRY_ROW_SELECT_CLASS_NAMES}
                                                                    styles={{
                                                                        ...CASH_REGISTER_SELECT_STYLES,
                                                                        menu: (provided) => ({ ...CASH_REGISTER_SELECT_STYLES.menu(provided), zIndex: 10050 }),
                                                                        menuList: (provided) => ({ ...entryRowSelectMenuListStyle(provided), paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, WebkitOverflowScrolling: 'touch' }),
                                                                        menuPortal: (provided) => ({ ...provided, zIndex: 10050 }),
                                                                    }}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="w-[30px] min-w-[30px] max-w-[30px] px-[6px] p-0 overflow-visible">
                                                            <button type="button" onClick={handlePartySourceToggle} disabled={isSubmitting}>
                                                                <img src={Change} className={`w-4 h-4 ${isClientToggleActive ? 'opacity-100' : 'opacity-60'} ${isSubmitting ? 'opacity-40' : ''}`} alt="Toggle party type" />
                                                            </button>
                                                        </td>
                                                        <td id={EDBC_IDS.EDBC3} className={getEdbcColumnConfig(EDBC_IDS.EDBC3)?.tdClass}>
                                                            <div className={getEdbcColumnConfig(EDBC_IDS.EDBC3)?.filterWidthClass}>
                                                                <Select
                                                                    name="project"
                                                                    isDisabled={isSubmitting}
                                                                    isClearable
                                                                    className="text-xs focus:outline-none w-full"
                                                                    value={selectedProjectName}
                                                                    onChange={(selectedOption) => setSelectedProjectName(selectedOption)}
                                                                    options={(isClientToggleActive && clientProjectOptions.length > 0) ? clientProjectOptions : siteOptionsForNewEntry}
                                                                    placeholder={expensesDstCol3Label}
                                                                    isSearchable
                                                                    menuPortalTarget={document.body}
                                                                    menuPosition="fixed"
                                                                    classNames={ENTRY_ROW_SELECT_CLASS_NAMES}
                                                                    styles={{
                                                                        ...CASH_REGISTER_SELECT_STYLES,
                                                                        menu: (provided) => ({ ...CASH_REGISTER_SELECT_STYLES.menu(provided), zIndex: 10050 }),
                                                                        menuList: entryRowSelectMenuListStyle,
                                                                        menuPortal: (provided) => ({ ...provided, zIndex: 10050 }),
                                                                    }}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td id={EDBC_IDS.EDBC12} className={getEdbcColumnConfig(EDBC_IDS.EDBC12)?.tdClass}>
                                                            <div className={getEdbcColumnConfig(EDBC_IDS.EDBC12)?.filterWidthClass} onKeyDown={handleKeyDownExpense}>
                                                                <Select
                                                                    name="type"
                                                                    isDisabled={isSubmitting}
                                                                    className="text-xs focus:outline-none w-full"
                                                                    value={newExpense.type ? { value: newExpense.type, label: newExpense.type } : null}
                                                                    onChange={(selectedOption) => handleInputChange({ target: { name: 'type', value: selectedOption ? selectedOption.value : '' } })}
                                                                    options={weeklyTypes.map((type) => ({ value: type.type, label: type.type }))}
                                                                    placeholder={expensesDstCol12Label}
                                                                    isSearchable
                                                                    isClearable
                                                                    menuPortalTarget={document.body}
                                                                    menuPosition="fixed"
                                                                    classNames={ENTRY_ROW_SELECT_CLASS_NAMES}
                                                                    styles={{
                                                                        ...CASH_REGISTER_SELECT_STYLES,
                                                                        menu: (provided) => ({ ...CASH_REGISTER_SELECT_STYLES.menu(provided), zIndex: 10050 }),
                                                                        menuList: entryRowSelectMenuListStyle,
                                                                        menuPortal: (provided) => ({ ...provided, zIndex: 10050 }),
                                                                    }}
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
                                                                    value={newExpense.amount}
                                                                    onChange={handleExpenseChange}
                                                                    onKeyDown={handleKeyDownExpense}
                                                                    disabled={isSubmitting || !newExpense.date || !selectedProjectName}
                                                                    onFocus={() => window.addEventListener("wheel", (e) => e.preventDefault(), { passive: false })}
                                                                    onBlur={() => window.removeEventListener("wheel", (e) => e.preventDefault())}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td id={EDBC_IDS.EDBC20} className={`${getEdbcColumnConfig(EDBC_IDS.EDBC20)?.tdClass || ''} !pr-0`} style={{ paddingRight: 0 }}></td>
                                                        <td id={EDBC_IDS.EDBC20} className={`${getEdbcColumnConfig(EDBC_IDS.EDBC20)?.tdClass || ''} !pr-0`} style={{ paddingRight: 0 }}></td>
                                                        <td id={EDBC_IDS.EDBC19} className={`${getEdbcColumnConfig(EDBC_IDS.EDBC20)?.tdClass || ''} !pr-0`} style={{ paddingRight: 0 }}></td>
                                                        <td className="w-[12px] min-w-[12px] max-w-[12px] p-0"></td>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sortedExpenses.length > 0 ? (
                                                        sortedExpenses.map((row, index) => (
                                                            <EdbcTableBodyRow key={row.id}>
                                                                <td id={EDBC_IDS.EDBC21} className={getEdbcColumnConfig(EDBC_IDS.EDBC21)?.tdClass}>
                                                                    {expenses.length - index}
                                                                </td>
                                                                {editingRowId === row.id ? (
                                                                    <td id={EDBC_IDS.EDBC2} className={getEdbcColumnConfig(EDBC_IDS.EDBC2)?.tdClass}>
                                                                        <div className={getEdbcColumnConfig(EDBC_IDS.EDBC2)?.filterWidthClass}>
                                                                            <CustomDateField
                                                                                value={editFormData.date}
                                                                                onChange={(dateStr) => handleEditChange({ target: { name: 'date', value: dateStr } })}
                                                                                placeholder={expensesDstCol2Label}
                                                                                alwaysOpenBelow
                                                                                controlHeightPx={EDBC_FILTER_CONTROL_HEIGHT_PX}
                                                                                className={` [&>div]:!w-full [&>div]:!border-2 [&>div]:!border-[rgba(191,152,83,0.2)] [&>div]:!rounded-lg [&>div]:!shadow-none [&>div]:!text-[14px] [&>div:hover]:!border-[rgba(191,152,83,0.4)] ${editFormData.date ? '[&>div]:!text-black [&>div]:!font-normal' : '[&>div]:!text-[#d3d5db] [&>div]:!font-normal'}`}
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                ) : (
                                                                    <EdbcDateBodyCell expense={row} rowIndex={index} expandedCells={expandedCells} onToggleExpanded={toggleExpandedCell} formatValue={formatDateOnly} />
                                                                )}
                                                                {editingRowId === row.id ? (
                                                                    <td id={EDBC_IDS.EDBC4} className={getEdbcColumnConfig(EDBC_IDS.EDBC4)?.tdClass}>
                                                                        <Select
                                                                            name="party"
                                                                            className={getEdbcColumnConfig(EDBC_IDS.EDBC4)?.filterWidthClass || ''}
                                                                            value={
                                                                                ((isClientToggleActive || (!row.contractor_id && !row.vendor_id && !row.employee_id)) && ["Loan", "Bank", "Claim"].includes(editFormData.type))
                                                                                    ? getClientOption(editFormData.client_id, editFormData.client_name || getClientName(row))
                                                                                    : combinedOptions.find(
                                                                                        opt =>
                                                                                            (opt.type === "Contractor" && opt.id === Number(editFormData.contractor_id)) ||
                                                                                            (opt.type === "Vendor" && opt.id === Number(editFormData.vendor_id)) ||
                                                                                            (opt.type === "Employee" && opt.id === Number(editFormData.employee_id))
                                                                                    ) || null
                                                                            }
                                                                            onChange={(selectedOption) => {
                                                                                if (editFormData.type === "Staff Advance") {
                                                                                    if (selectedOption && (selectedOption.type === "Contractor" || selectedOption.type === "Vendor")) {
                                                                                        alert("Staff Advance type only allows Employee. Please select an Employee.");
                                                                                        return;
                                                                                    }
                                                                                }
                                                                                if (editFormData.type === "Project Advance") {
                                                                                    if (selectedOption && selectedOption.type === "Employee") {
                                                                                        alert("Project Advance type only allows Contractor or Vendor. Please select a Contractor or Vendor.");
                                                                                        return;
                                                                                    }
                                                                                }
                                                                                const forceClientMode = !row.contractor_id && !row.vendor_id && !row.employee_id;
                                                                                const allowedTypesForClient = ["Loan", "Bank", "Claim"];
                                                                                const isClientTypeAllowed = allowedTypesForClient.includes(editFormData.type);
                                                                                const useClientNameFlow = (isClientToggleActive || forceClientMode) && isClientTypeAllowed;
                                                                                if (useClientNameFlow) {
                                                                                    handleEditChange({ target: { name: "client_name", value: selectedOption ? selectedOption.label : "" } });
                                                                                    handleEditChange({ target: { name: "client_id", value: selectedOption ? (selectedOption.clientId || selectedOption.id) : "" } });
                                                                                    handleEditChange({ target: { name: "contractor_id", value: "" } });
                                                                                    handleEditChange({ target: { name: "vendor_id", value: "" } });
                                                                                    handleEditChange({ target: { name: "employee_id", value: "" } });
                                                                                    return;
                                                                                }
                                                                                if (!selectedOption) {
                                                                                    handleEditChange({ target: { name: "contractor_id", value: "" } });
                                                                                    handleEditChange({ target: { name: "vendor_id", value: "" } });
                                                                                    handleEditChange({ target: { name: "employee_id", value: "" } });
                                                                                } else if (selectedOption.type === "Contractor") {
                                                                                    handleEditChange({ target: { name: "contractor_id", value: selectedOption.id } });
                                                                                    handleEditChange({ target: { name: "vendor_id", value: "" } });
                                                                                    handleEditChange({ target: { name: "employee_id", value: "" } });
                                                                                } else if (selectedOption.type === "Vendor") {
                                                                                    handleEditChange({ target: { name: "vendor_id", value: selectedOption.id } });
                                                                                    handleEditChange({ target: { name: "contractor_id", value: "" } });
                                                                                    handleEditChange({ target: { name: "employee_id", value: "" } });
                                                                                } else if (selectedOption.type === "Employee") {
                                                                                    handleEditChange({ target: { name: "employee_id", value: selectedOption.id } });
                                                                                    handleEditChange({ target: { name: "contractor_id", value: "" } });
                                                                                    handleEditChange({ target: { name: "vendor_id", value: "" } });
                                                                                }
                                                                                handleEditChange({ target: { name: "client_name", value: "" } });
                                                                                handleEditChange({ target: { name: "client_id", value: "" } });
                                                                            }}
                                                                            options={(isClientToggleActive || (!row.contractor_id && !row.vendor_id && !row.employee_id)) && ["Loan", "Bank", "Claim"].includes(editFormData.type) ? clientOptions : combinedOptions}
                                                                            placeholder={(isClientToggleActive || (!row.contractor_id && !row.vendor_id && !row.employee_id)) && ["Loan", "Bank", "Claim"].includes(editFormData.type) ? expensesDstCol4ClientLabel : expensesDstCol4Label}
                                                                            isSearchable
                                                                            isClearable
                                                                            menuPortalTarget={document.body}
                                                                            menuPosition="fixed"
                                                                            classNames={ENTRY_ROW_SELECT_CLASS_NAMES}
                                                                            styles={{
                                                                                ...CASH_REGISTER_SELECT_STYLES,
                                                                                menu: (provided) => ({ ...CASH_REGISTER_SELECT_STYLES.menu(provided), zIndex: 10050 }),
                                                                                menuList: (provided) => ({ ...entryRowSelectMenuListStyle(provided), paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0, WebkitOverflowScrolling: 'touch' }),
                                                                                menuPortal: (provided) => ({ ...provided, zIndex: 10050 }),
                                                                            }}
                                                                        />
                                                                    </td>
                                                                ) : (
                                                                    <EdbcExpandableBodyCell columnId={EDBC_IDS.EDBC4} expense={row} rowIndex={index} expandedCells={expandedCells} onToggleExpanded={toggleExpandedCell} getDisplayValue={getPartyDisplayName} />
                                                                )}
                                                                <td className="w-[30px] min-w-[30px] max-w-[30px] p-0 overflow-visible"></td>
                                                                {editingRowId === row.id ? (
                                                                    <td id={EDBC_IDS.EDBC3} className={getEdbcColumnConfig(EDBC_IDS.EDBC3)?.tdClass}>
                                                                        <div className={getEdbcColumnConfig(EDBC_IDS.EDBC3)?.filterWidthClass}>
                                                                            <Select
                                                                                name="project_id"
                                                                                className="text-xs focus:outline-none w-full"
                                                                                value={siteOptions.find(opt => opt.id === Number(editFormData.project_id)) || null}
                                                                                onChange={(selectedOption) => handleEditChange({ target: { name: "project_id", value: selectedOption ? selectedOption.id : "" } })}
                                                                                options={siteOptions}
                                                                                placeholder={expensesDstCol3Label}
                                                                                isSearchable
                                                                                isClearable
                                                                                menuPortalTarget={document.body}
                                                                                menuPosition="fixed"
                                                                                classNames={ENTRY_ROW_SELECT_CLASS_NAMES}
                                                                                styles={{
                                                                                    ...CASH_REGISTER_SELECT_STYLES,
                                                                                    menu: (provided) => ({ ...CASH_REGISTER_SELECT_STYLES.menu(provided), zIndex: 10050 }),
                                                                                    menuList: entryRowSelectMenuListStyle,
                                                                                    menuPortal: (provided) => ({ ...provided, zIndex: 10050 }),
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                ) : (
                                                                    <EdbcProjectNameBodyCell expense={row} rowIndex={index} expandedCells={expandedCells} onToggleExpanded={toggleExpandedCell} getDisplayValue={(entry) => siteOptions.find(opt => opt.id === Number(entry.project_id))?.label || ''} />
                                                                )}
                                                                <td id={EDBC_IDS.EDBC12} className={getEdbcColumnConfig(EDBC_IDS.EDBC12)?.tdClass}>
                                                                    {editingRowId === row.id ? (
                                                                        <div className={getEdbcColumnConfig(EDBC_IDS.EDBC12)?.filterWidthClass}>
                                                                            <Select
                                                                                name="type"
                                                                                className="text-xs focus:outline-none w-full"
                                                                                value={editFormData.type ? { value: editFormData.type, label: editFormData.type } : null}
                                                                                onChange={(selectedOption) => handleEditChange({ target: { name: 'type', value: selectedOption ? selectedOption.value : '' } })}
                                                                                options={weeklyTypes.map((type) => ({ value: type.type, label: type.type }))}
                                                                                placeholder={expensesDstCol12Label}
                                                                                isSearchable
                                                                                isClearable
                                                                                menuPortalTarget={document.body}
                                                                                menuPosition="fixed"
                                                                                classNames={ENTRY_ROW_SELECT_CLASS_NAMES}
                                                                                styles={{
                                                                                    ...CASH_REGISTER_SELECT_STYLES,
                                                                                    menu: (provided) => ({ ...CASH_REGISTER_SELECT_STYLES.menu(provided), zIndex: 10050 }),
                                                                                    menuList: entryRowSelectMenuListStyle,
                                                                                    menuPortal: (provided) => ({ ...provided, zIndex: 10050 }),
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex flex-col gap-1">
                                                                            <div className="flex items-center gap-2"><span>{row.type}</span></div>
                                                                            {(() => {
                                                                                const rowPayments = getPaymentsByExpenseId(row.id);
                                                                                const paymentModes = [...new Set(rowPayments.map(p => p.bill_payment_mode).filter(mode => mode !== null && mode !== undefined))];
                                                                                if (paymentModes.length === 0) return null;
                                                                                const hoverContent = rowPayments.map(payment => `${payment.bill_payment_mode}: ₹${payment.amount.toLocaleString('en-IN')}`).join('\n');
                                                                                return (
                                                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                                                        {paymentModes.length === 1 ? (
                                                                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-blue-200 transition-colors" title={hoverContent}>{paymentModes[0]}</span>
                                                                                        ) : (
                                                                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-green-200 transition-colors" title={hoverContent}>Online</span>
                                                                                        )}
                                                                                    </div>
                                                                                );
                                                                            })()}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                {editingRowId === row.id ? (
                                                                    <td id={EDBC_IDS.EDBC8} className={getEdbcColumnConfig(EDBC_IDS.EDBC8)?.tdClass}>
                                                                        <div className={getEdbcColumnConfig(EDBC_IDS.EDBC8)?.filterWidthClass}>
                                                                            <input type="number" name="amount" style={EDBC_FILTER_CONTROL_BOX_STYLE} className={`${getEdbcColumnConfig(EDBC_IDS.EDBC8)?.inputClassName || ''} no-spinner`} value={editFormData.amount} onChange={handleEditChange} min="0" step="any" />
                                                                        </div>
                                                                    </td>
                                                                ) : (
                                                                    <EdbcExpandableBodyCell columnId={EDBC_IDS.EDBC8} expense={row} rowIndex={index} expandedCells={expandedCells} onToggleExpanded={toggleExpandedCell} textAlignClass="text-right" getDisplayValue={(entry) => formatWeeklyPaymentAmountDisplay(entry.amount)} />
                                                                )}
                                                                <td id={EDBC_IDS.EDBC20} className={`${getEdbcColumnConfig(EDBC_IDS.EDBC20)?.tdClass || ''} !pr-0`} style={{ paddingRight: 0 }}>
                                                                    <div className="flex items-center w-[70px] gap-[20px]">
                                                                        {row.type !== "Daily" && isWeeklyExpenseTypeMatched(row.type) ? (
                                                                            <button type="button" onClick={() => {
                                                                                setCurrentProjectAdvanceRow(row);
                                                                                setPaymentPopupData({ date: new Date().toISOString().split('T')[0], amount: "", paymentMode: "", chequeNo: "", chequeDate: "", transactionNumber: "", accountNumber: "" });
                                                                                setPreviousPayments(getPaymentsByExpenseId(row.id));
                                                                                setShowPaymentPopup(true);
                                                                            }} className="text-white flex items-center justify-center transition-colors text-xs" title="Add Payment">
                                                                                <img src={AddExtra} className="w-[18px] h-[18px]" alt="Add Payment" />
                                                                            </button>
                                                                        ) : null}
                                                                        {row.type === "Project Advance" ? (
                                                                            <button type="button" onClick={async () => {
                                                                                let description = "";
                                                                                if (row.advance_portal_id) {
                                                                                    try {
                                                                                        const res = await fetch(`https://backendaab.in/demoAabuildersDash/api/advance_portal/get/${row.advance_portal_id}`);
                                                                                        if (!res.ok) throw new Error("Failed to fetch advance portal data");
                                                                                        const data = await res.json();
                                                                                        description = (data.description || "").trim();
                                                                                        setPortalDescriptions((prev) => ({ ...prev, [row.advance_portal_id]: description !== "" ? description : undefined }));
                                                                                    } catch (error) {
                                                                                        console.error("Error fetching advance portal data:", error);
                                                                                    }
                                                                                }
                                                                                setEditFormData((prev) => ({ ...prev, description }));
                                                                                setCurrentRow(row);
                                                                                setIsDescriptionEditing(false);
                                                                                setShowPopups(true);
                                                                            }}>
                                                                                <img src={portalDescriptions[row.advance_portal_id] ? NotesEnd : NotesStart} alt="Notes" className="w-[18px] h-[18px]" />
                                                                            </button>
                                                                        ) : null}
                                                                    </div>
                                                                </td>
                                                                <td id={EDBC_IDS.EDBC20} className={getEdbcColumnConfig(EDBC_IDS.EDBC20)?.tdClass}>
                                                                    <div className="flex w-full items-center justify-center">
                                                                        <span className="inline-flex items-center gap-[4px]">
                                                                            {row.bill_copy_url ? (
                                                                                <>
                                                                                    <a href={cleanUrl(row.bill_copy_url)} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 w-[16px] h-[16px] items-center justify-center cursor-pointer" title="View File">
                                                                                        <img src={file} className="" alt="Open File" />
                                                                                    </a>
                                                                                    {canRemoveBillCopyUrl && isWeeklyExpenseTypeMatched(row.type) ? (
                                                                                        <button type="button" onClick={() => handleRemoveBillCopyUrl(row)} className="flex h-[12px] w-[12px] shrink-0 items-center justify-center rounded-full hover:bg-[#fff1ee]" title="Remove File">
                                                                                            <img src={FileRemover} className="" alt="Remove File" />
                                                                                        </button>
                                                                                    ) : null}
                                                                                </>
                                                                            ) : (
                                                                                <span className="inline-flex items-center gap-2">
                                                                                    {isWeeklyExpenseTypeMatched(row.type) ? (
                                                                                        <button type="button" onClick={() => handleFileUploadClick(row)} className="inline-flex h-4 w-4 shrink-0 items-center justify-center cursor-pointer" title="Upload File">
                                                                                            <img src={fileUpload} className="w-4 h-4 opacity-70 hover:opacity-100" alt="Upload File" />
                                                                                        </button>
                                                                                    ) : (
                                                                                        <button type="button" disabled className="inline-flex h-4 w-4 shrink-0 items-center justify-center opacity-40 cursor-not-allowed" title="Upload File">
                                                                                            <img src={fileUpload} className="w-4 h-4 opacity-70" alt="Upload File" />
                                                                                        </button>
                                                                                    )}
                                                                                    {canRemoveBillCopyUrl && isWeeklyExpenseTypeMatched(row.type) && removedBillCopyRows[row.id] ? (
                                                                                        <button type="button" onClick={() => handleRestoreBillCopyUrl(row)} className="inline-flex shrink-0" title="Restore Removed File">
                                                                                            <img src={restore} alt="" className="w-4 h-4" />
                                                                                        </button>
                                                                                    ) : null}
                                                                                </span>
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td id={EDBC_IDS.EDBC19} className={getEdbcColumnConfig(EDBC_IDS.EDBC20)?.tdClass}>
                                                                    <div className="flex gap-1 justify-center">
                                                                        {((row.contractor_id === 117 && row.project_id === 8 && row.type === "Daily") || (row.contractor_id === 258 && row.project_id === 9 && row.type === "Advance Refund")) ? (
                                                                            <>
                                                                                <span className="inline-flex w-5 h-4 shrink-0 items-center justify-center">
                                                                                    <img className="w-5 h-4 opacity-40 cursor-not-allowed" src={Edit} alt="Edit Disabled" />
                                                                                </span>
                                                                                <span className="inline-flex w-5 h-4 shrink-0 items-center justify-center">
                                                                                    <img className="w-5 h-4 opacity-40 cursor-not-allowed" src={Delete} alt="Delete Disabled" />
                                                                                </span>
                                                                                <span className="inline-flex w-5 h-4 shrink-0 items-center justify-center">
                                                                                    <img className="w-5 h-4 opacity-40 cursor-not-allowed" src={history} alt="History Disabled" />
                                                                                </span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                {editingRowId === row.id ? (
                                                                                    <span className="inline-flex w-5 h-4 shrink-0 items-center justify-center">
                                                                                        <button type="button" onClick={() => saveEditedExpense(row)} className="text-green-600 font-bold text-lg p-0 leading-none">✓</button>
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="inline-flex w-5 h-4 shrink-0 items-center justify-center">
                                                                                        {isWeeklyExpenseTypeMatched(row.type) ? (
                                                                                            <button type="button" onClick={() => handleEditClick(row)}>
                                                                                                <img src={Edit} alt="Edit" className="w-5 h-4" />
                                                                                            </button>
                                                                                        ) : (
                                                                                            <img className="w-5 h-4 opacity-40 cursor-not-allowed" src={Edit} alt="Edit Disabled" />
                                                                                        )}
                                                                                    </span>
                                                                                )}
                                                                                <span className="inline-flex w-5 h-4 shrink-0 items-center justify-center">
                                                                                    {isWeeklyExpenseTypeMatched(row.type) ? (
                                                                                        <button type="button" onClick={() => handleWeeklyExpensesDelete(row.id)}>
                                                                                            <img src={Delete} className="w-5 h-4" alt="Delete" />
                                                                                        </button>
                                                                                    ) : (
                                                                                        <img className="w-5 h-4 opacity-40 cursor-not-allowed" src={Delete} alt="Delete Disabled" />
                                                                                    )}
                                                                                </span>
                                                                                <span className="inline-flex w-5 h-4 shrink-0 items-center justify-center">
                                                                                    <button type="button" onClick={() => fetchAuditDetailsForExpense(row.id)}>
                                                                                        <img className="w-5 h-4" src={history} alt="History" />
                                                                                    </button>
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="w-[12px] min-w-[12px] max-w-[12px] p-0"></td>
                                                            </EdbcTableBodyRow>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td className="p-2 text-center text-sm text-gray-400" colSpan={11}>
                                                                No data available
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-fit shrink-0 flex flex-col min-h-0 xl:h-full max-xl:h-auto max-xl:w-full">
                                <div className="flex justify-between items-center mb-[8px]">
                                    <h1 className="font-bold text-base">Income</h1>
                                    <h1 className="font-bold text-base" style={{ color: "#E4572E" }}>
                                        ₹{payments.reduce((total, row) => total + Number(row.amount || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </h1>
                                </div>
                                <div className="flex flex-col w-fit max-w-full min-h-0 overflow-hidden max-xl:w-full max-xl:overflow-x-auto max-xl:no-scrollbar max-xl:scrollbar-none">
                                    <div className="mb-[12px] w-full min-w-0 min-h-[34px] shrink-0 flex flex-row flex-nowrap items-center gap-[6px] overflow-hidden">
                                        <div className="shrink-0 flex items-center z-[2] bg-white">
                                            <EdbcFilterToggleButton
                                                onClick={() => {
                                                    const willOpen = !showPaymentsFilters;
                                                    const scroller = paymentsScrollRef.current;
                                                    if (willOpen) {
                                                        setShowPaymentsFilters(true);
                                                        if (!scroller) return;
                                                        if (scroller.scrollTop <= 0) return;
                                                        if (paymentsFilterNudgeUsedRef.current) return;
                                                        paymentsFilterNudgeUsedRef.current = true;
                                                        requestAnimationFrame(() => {
                                                            requestAnimationFrame(() => {
                                                                const h = paymentsFilterRowRef.current?.offsetHeight || 0;
                                                                if (h > 0) {
                                                                    scroller.scrollTop = Math.max(0, scroller.scrollTop - h);
                                                                }
                                                            });
                                                        });
                                                        return;
                                                    }
                                                    const h = paymentsFilterRowRef.current?.offsetHeight || 0;
                                                    setShowPaymentsFilters(false);
                                                    if (!scroller || h <= 0 || !paymentsFilterNudgeUsedRef.current) return;
                                                    paymentsFilterNudgeUsedRef.current = false;
                                                    requestAnimationFrame(() => {
                                                        requestAnimationFrame(() => {
                                                            scroller.scrollTop = scroller.scrollTop + h;
                                                        });
                                                    });
                                                }}
                                            />
                                        </div>
                                        <div
                                            ref={paymentsFilterChipsRef}
                                            className="w-0 flex-1 min-w-0 flex flex-row flex-nowrap items-center gap-[6px] overflow-x-auto overflow-y-hidden no-scrollbar scrollbar-none cursor-grab max-xl:w-auto max-xl:flex-none max-xl:shrink"
                                            onMouseDown={(e) => handleMouseDown(e, paymentsFilterChipsRef, true)}
                                            onMouseMove={(e) => handleMouseMove(e, paymentsFilterChipsRef, true)}
                                            onMouseUp={() => handleMouseUp(paymentsFilterChipsRef)}
                                            onMouseLeave={() => handleMouseUp(paymentsFilterChipsRef)}
                                        >
                                            {selectPaymentDate && (
                                                <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit">
                                                    <span className="font-medium text-[#BF9853]">Date: </span>
                                                    <span className="font-semibold text-[14px]">{formatDateOnly(selectPaymentDate)}</span>
                                                    <button onClick={() => setSelectPaymentDate('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                                                </span>
                                            )}
                                            {selectPaymentAmount && (
                                                <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit">
                                                    <span className="font-medium text-[#BF9853]">Amount: </span>
                                                    <span className="font-semibold text-[14px]">{selectPaymentAmount}</span>
                                                    <button onClick={() => setSelectPaymentAmount('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                                                </span>
                                            )}
                                            {selectPaymentType && (
                                                <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit">
                                                    <span className="font-medium text-[#BF9853]">Type: </span>
                                                    <span className="font-semibold text-[14px]">{selectPaymentType}</span>
                                                    <button onClick={() => setSelectPaymentType('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                                </span>
                                            )}
                                        </div>
                                        <EdbcTableToolbarRightActions
                                            onClearFilters={clearPaymentsFilters}
                                            overallSearch={paymentsOverallSearch}
                                            onOverallSearchChange={setPaymentsOverallSearch}
                                            wrapperClassName="flex items-center gap-[6px] min-w-0 z-[2] bg-white pl-[4px] max-xl:flex-1 xl:shrink-0"
                                            searchWrapperClassName="h-[34px] min-w-0 flex-1 border border-[#D6D6D6] rounded-md bg-white flex items-center px-2 gap-1 xl:w-[286px] xl:shrink-0"
                                        />
                                    </div>
                                    <div className="w-fit max-w-full flex flex-col shrink-0">
                                        <div
                                            ref={paymentsScrollRef}
                                            className="rounded-lg border-l-8 border-l-[#BF9853] min-h-[330px] w-fit max-w-full shrink-0 overflow-y-auto overflow-x-auto no-scrollbar scrollbar-none max-xl:w-full"
                                            style={{
                                                height: `${40 + (showPaymentsFilters ? 40 : 0) + 40 + 180}px`,
                                                maxHeight: `${40 + (showPaymentsFilters ? 40 : 0) + 40 + 180}px`,
                                                willChange: 'scroll-position',
                                                WebkitOverflowScrolling: 'touch',
                                                transform: 'translateZ(0)',
                                                backfaceVisibility: 'hidden'
                                            }}
                                            onWheel={(e) => {
                                                paymentsFilterNudgeUsedRef.current = false;
                                                e.stopPropagation();
                                            }}
                                            onMouseDown={(e) => handleMouseDown(e, paymentsScrollRef)}
                                            onMouseMove={(e) => handleMouseMove(e, paymentsScrollRef)}
                                            onMouseUp={() => handleMouseUp(paymentsScrollRef)}
                                            onMouseLeave={() => handleMouseUp(paymentsScrollRef)}
                                        >
                                            <table className={`border-collapse text-left ${WEEKLY_PAYMENT_INCOME_TABLE_FIXED_WIDTH_CLASS} table-fixed ${EDBC_TABLE_EDGE_TABLE_CLASS} [&_th#EDBC-19]:!w-[70px] [&_td#EDBC-19]:!w-[70px] [&_th#EDBC-19]:!min-w-[70px] [&_td#EDBC-19]:!min-w-[70px] [&_th#EDBC-19]:!max-w-[70px] [&_td#EDBC-19]:!max-w-[70px] [&_th#EDBC-20]:!w-[70px] [&_td#EDBC-20]:!w-[70px] [&_th#EDBC-20]:!min-w-[70px] [&_td#EDBC-20]:!min-w-[70px] [&_th#EDBC-20]:!max-w-[70px] [&_td#EDBC-20]:!max-w-[70px] ${WEEKLY_PAYMENT_EDBC8_TABLE_CLASS} ${WEEKLY_PAYMENT_INCOME_TBODY_TABLE_LOCK_TABLE_CLASS}`}>
                                                <colgroup>
                                                    <col style={{ width: '130px' }} />
                                                    <col style={{ width: '158px' }} />
                                                    <col style={{ width: '120px' }} />
                                                    <col style={{ width: '70px' }} />
                                                    <col style={{ width: '12px' }} />
                                                </colgroup>
                                                <thead className="sticky top-0 z-[99999] bg-white">
                                                    <EdbcTableHeaderRow>
                                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC2} label={paymentsDstCol2Label} columnWidthClass={EDBC2_FIRST_COLUMN_WIDTH_CLASS} {...paymentsSortProps} />
                                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC12} label={paymentsDstCol12Label} {...paymentsSortProps} />
                                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC8} label={paymentsDstCol8Label} {...paymentsSortProps} />
                                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC19} label={paymentsDstCol20Label} />
                                                        <th className="w-[12px] min-w-[12px] max-w-[12px] p-0" aria-hidden="true"></th>
                                                    </EdbcTableHeaderRow>
                                                    {showPaymentsFilters && (
                                                        <EdbcTableFilterRow ref={paymentsFilterRowRef}>
                                                            <EdbcDateFilter placeholder={paymentsDstCol2Label} value={selectPaymentDate} onChange={setSelectPaymentDate} />
                                                            <th id={EDBC_IDS.EDBC12} className={`${getEdbcColumnConfig(EDBC_IDS.EDBC12)?.tdClass} overflow-hidden`}>
                                                                <div className={`${getEdbcColumnConfig(EDBC_IDS.EDBC12)?.filterWidthClass} min-w-0 max-w-full`}>
                                                                    <Select
                                                                        className="text-xs focus:outline-none w-full"
                                                                        options={weeklyReceivedTypes.map((type) => ({ value: type.received_type, label: type.received_type }))}
                                                                        value={weeklyReceivedTypes.map((type) => ({ value: type.received_type, label: type.received_type })).find((opt) => opt.value === selectPaymentType) || null}
                                                                        onChange={(opt) => setSelectPaymentType(opt ? opt.value : '')}
                                                                        placeholder={paymentsDstCol12Label}
                                                                        isSearchable
                                                                        isClearable={false}
                                                                        menuPlacement="bottom"
                                                                        menuPortalTarget={document.body}
                                                                        noOptionsMessage={() => null}
                                                                        styles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                                                                    />
                                                                </div>
                                                            </th>
                                                            <th id={EDBC_IDS.EDBC8} className={getEdbcColumnConfig(EDBC_IDS.EDBC8)?.tdClass}>
                                                                <div className="min-w-0 w-full">
                                                                    <input
                                                                        type="text"
                                                                        inputMode="decimal"
                                                                        value={selectPaymentAmount}
                                                                        onChange={(e) => setSelectPaymentAmount(e.target.value.replace(/[^\d.,]/g, ''))}
                                                                        placeholder={formatEdbcTotalAmountPlaceholder(payments.reduce((total, row) => total + Number(row.amount || 0), 0))}
                                                                        style={EDBC_FILTER_CONTROL_BOX_STYLE}
                                                                        className={`${getEdbcColumnConfig(EDBC_IDS.EDBC8)?.inputClassName || ''} no-spinner !w-full`}
                                                                    />
                                                                </div>
                                                            </th>
                                                            <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC19} />
                                                            <th className="w-[12px] min-w-[12px] max-w-[12px] p-0" aria-hidden="true"></th>
                                                        </EdbcTableFilterRow>
                                                    )}
                                                    <EdbcTableBodyRow className="!bg-white border-b-2 border-gray-200 !h-[40px] !max-h-[40px] [&>td]:!py-0 overflow-hidden">
                                                        <td id={EDBC_IDS.EDBC2} className={`pl-[12px] ${EDBC2_FIRST_COLUMN_WIDTH_CLASS} pr-[1px] text-left overflow-hidden`}>
                                                            <div
                                                                className={`${getEdbcColumnConfig(EDBC_IDS.EDBC2)?.filterWidthClass} overflow-visible relative z-[99999]`}
                                                                onKeyDown={handleKeyDownPayment}
                                                            >
                                                                <CustomDateField
                                                                    value={newPayment.date}
                                                                    onChange={(dateStr) => handlePaymentChange({ target: { name: 'date', value: dateStr } })}
                                                                    placeholder={paymentsDstCol2Label}
                                                                    alwaysOpenBelow
                                                                    calendarPortal
                                                                    controlHeightPx={EDBC_FILTER_CONTROL_HEIGHT_PX}
                                                                    disabled={isSubmitting}
                                                                    className={` !z-[99999] !overflow-visible [&_.absolute]:!z-[99999] [&>div]:!w-full [&>div]:!border-2 [&>div]:!border-[rgba(191,152,83,0.2)] [&>div]:!rounded-lg [&>div]:!shadow-none [&>div]:!text-[14px] [&>div:hover]:!border-[rgba(191,152,83,0.4)] ${newPayment.date ? '[&>div]:!text-black [&>div]:!font-normal' : '[&>div]:!text-[#d3d5db] [&>div]:!font-normal'}`}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td id={EDBC_IDS.EDBC12} className={`${getEdbcColumnConfig(EDBC_IDS.EDBC12)?.tdClass} overflow-hidden`}>
                                                            <div
                                                                className={`${getEdbcColumnConfig(EDBC_IDS.EDBC12)?.filterWidthClass} min-w-0 max-w-full`}
                                                                onKeyDown={handleKeyDownPayment}
                                                            >
                                                                <Select
                                                                    name="type"
                                                                    className="text-xs focus:outline-none w-full"
                                                                    value={newPayment.type ? { value: newPayment.type, label: newPayment.type } : null}
                                                                    onChange={(selectedOption) => handlePaymentChange({ target: { name: 'type', value: selectedOption ? selectedOption.value : '' } })}
                                                                    options={weeklyReceivedTypes.map((type) => ({ value: type.received_type, label: type.received_type }))}
                                                                    placeholder={paymentsDstCol12Label}
                                                                    isSearchable
                                                                    isClearable
                                                                    isDisabled={isSubmitting}
                                                                    menuPortalTarget={document.body}
                                                                    menuPosition="fixed"
                                                                    classNames={ENTRY_ROW_SELECT_CLASS_NAMES}
                                                                    styles={{
                                                                        ...CASH_REGISTER_SELECT_STYLES,
                                                                        menu: (provided) => ({
                                                                            ...CASH_REGISTER_SELECT_STYLES.menu(provided),
                                                                            zIndex: 10050,
                                                                        }),
                                                                        menuList: entryRowSelectMenuListStyle,
                                                                        menuPortal: (provided) => ({
                                                                            ...provided,
                                                                            zIndex: 10050,
                                                                        }),
                                                                    }}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td id={EDBC_IDS.EDBC8} className={`pl-[1px] pr-[9px] ${getEdbcColumnConfig(EDBC_IDS.EDBC8)?.filterWidthClass} text-right overflow-hidden`}>
                                                            <div className="min-w-0 w-full">
                                                                <input
                                                                    type="number"
                                                                    name="amount"
                                                                    style={EDBC_FILTER_CONTROL_BOX_STYLE}
                                                                    className={`${getEdbcColumnConfig(EDBC_IDS.EDBC8)?.inputClassName || ''} no-spinner !w-full`}
                                                                    placeholder={paymentsDstCol8Label}
                                                                    value={newPayment.amount}
                                                                    onChange={handlePaymentChange}
                                                                    onKeyDown={handleKeyDownPayment}
                                                                    disabled={isSubmitting}
                                                                    onWheel={(e) => e.preventDefault()}
                                                                    onFocus={() => window.addEventListener("wheel", (e) => e.preventDefault(), { passive: false })}
                                                                    onBlur={() => window.removeEventListener("wheel", (e) => e.preventDefault())}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td id={EDBC_IDS.EDBC19} className={`${getEdbcColumnConfig(EDBC_IDS.EDBC20)?.tdClass || ''} !pr-0`} style={{ paddingRight: 0 }}></td>
                                                        <td className="w-[12px] min-w-[12px] max-w-[12px] p-0"></td>
                                                    </EdbcTableBodyRow>
                                                </thead>
                                                <tbody>
                                                    {sortedPayments.map((row, index) => (
                                                        <EdbcTableBodyRow key={row.id || index}>
                                                            {editingPaymentId === (row.id || null) ? (
                                                                <td id={EDBC_IDS.EDBC2} className={`pl-[12px] ${EDBC2_FIRST_COLUMN_WIDTH_CLASS} pr-[1px] text-left overflow-visible`}>
                                                                    <div
                                                                        className={`${getEdbcColumnConfig(EDBC_IDS.EDBC2)?.filterWidthClass || ''} overflow-visible relative z-[99999]`}
                                                                    >
                                                                        <CustomDateField
                                                                            value={editPaymentData.date}
                                                                            onChange={(dateStr) => handleEditPaymentChange({ target: { name: 'date', value: dateStr } })}
                                                                            placeholder={paymentsDstCol2Label}
                                                                            alwaysOpenBelow
                                                                            calendarPortal
                                                                            controlHeightPx={EDBC_FILTER_CONTROL_HEIGHT_PX}
                                                                            className={` !z-[99999] !overflow-visible [&_.absolute]:!z-[99999] [&>div]:!w-full [&>div]:!border-2 [&>div]:!border-[rgba(191,152,83,0.2)] [&>div]:!rounded-lg [&>div]:!shadow-none [&>div]:!text-[14px] [&>div:hover]:!border-[rgba(191,152,83,0.4)] ${editPaymentData.date ? '[&>div]:!text-black [&>div]:!font-normal' : '[&>div]:!text-[#d3d5db] [&>div]:!font-normal'}`}
                                                                        />
                                                                    </div>
                                                                </td>
                                                            ) : (
                                                                <EdbcDateBodyCell
                                                                    expense={row}
                                                                    rowIndex={index}
                                                                    expandedCells={expandedCells}
                                                                    onToggleExpanded={toggleExpandedCell}
                                                                    formatValue={formatDateOnly}
                                                                    columnWidthClass={EDBC2_FIRST_COLUMN_WIDTH_CLASS}
                                                                />
                                                            )}
                                                            {editingPaymentId === (row.id || null) ? (
                                                                <td id={EDBC_IDS.EDBC12} className={getEdbcColumnConfig(EDBC_IDS.EDBC12)?.tdClass}>
                                                                    <div className={getEdbcColumnConfig(EDBC_IDS.EDBC12)?.filterWidthClass}>
                                                                        <Select
                                                                            name="type"
                                                                            className="text-xs focus:outline-none w-full"
                                                                            value={editPaymentData.type ? { value: editPaymentData.type, label: editPaymentData.type } : null}
                                                                            onChange={(selectedOption) => handleEditPaymentChange({ target: { name: 'type', value: selectedOption ? selectedOption.value : '' } })}
                                                                            options={weeklyReceivedTypes.map((type) => ({ value: type.received_type, label: type.received_type }))}
                                                                            placeholder={paymentsDstCol12Label}
                                                                            isSearchable
                                                                            isClearable
                                                                            menuPortalTarget={document.body}
                                                                            menuPosition="fixed"
                                                                            classNames={ENTRY_ROW_SELECT_CLASS_NAMES}
                                                                            styles={{
                                                                                ...CASH_REGISTER_SELECT_STYLES,
                                                                                menu: (provided) => ({
                                                                                    ...CASH_REGISTER_SELECT_STYLES.menu(provided),
                                                                                    zIndex: 10050,
                                                                                }),
                                                                                menuList: entryRowSelectMenuListStyle,
                                                                                menuPortal: (provided) => ({
                                                                                    ...provided,
                                                                                    zIndex: 10050,
                                                                                }),
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </td>
                                                            ) : (
                                                                <EdbcExpandableBodyCell
                                                                    columnId={EDBC_IDS.EDBC12}
                                                                    expense={row}
                                                                    rowIndex={index}
                                                                    expandedCells={expandedCells}
                                                                    onToggleExpanded={toggleExpandedCell}
                                                                    getDisplayValue={(entry) => entry.type}
                                                                />
                                                            )}
                                                            {editingPaymentId === (row.id || null) ? (
                                                                <td id={EDBC_IDS.EDBC8} className={getEdbcColumnConfig(EDBC_IDS.EDBC8)?.tdClass}>
                                                                    <div className={getEdbcColumnConfig(EDBC_IDS.EDBC8)?.filterWidthClass}>
                                                                        <input
                                                                            type="number"
                                                                            name="amount"
                                                                            value={editPaymentData.amount}
                                                                            onChange={handleEditPaymentChange}
                                                                            style={EDBC_FILTER_CONTROL_BOX_STYLE}
                                                                            className={`${getEdbcColumnConfig(EDBC_IDS.EDBC8)?.inputClassName || ''} no-spinner`}
                                                                            onWheel={(e) => e.preventDefault()}
                                                                            onFocus={() => window.addEventListener("wheel", (e) => e.preventDefault(), { passive: false })}
                                                                            onBlur={() => window.removeEventListener("wheel", (e) => e.preventDefault())}
                                                                        />
                                                                    </div>
                                                                </td>
                                                            ) : (
                                                                <EdbcExpandableBodyCell
                                                                    columnId={EDBC_IDS.EDBC8}
                                                                    expense={row}
                                                                    rowIndex={index}
                                                                    expandedCells={expandedCells}
                                                                    onToggleExpanded={toggleExpandedCell}
                                                                    textAlignClass="text-right"
                                                                    getDisplayValue={(entry) => formatWeeklyPaymentAmountDisplay(entry.amount)}
                                                                />
                                                            )}
                                                            <td id={EDBC_IDS.EDBC19} className={getEdbcColumnConfig(EDBC_IDS.EDBC20)?.tdClass}>
                                                                <div className="flex gap-1 justify-center">
                                                                    {editingPaymentId === row.id ? (
                                                                        <span className="inline-flex w-5 h-4 shrink-0 items-center justify-center">
                                                                            <button
                                                                                className="text-green-600 font-bold text-lg"
                                                                                onClick={() => saveEditedPaymentReceived(row)}
                                                                                disabled={!weeklyReceivedTypes.some(type => type.received_type === row.type)}
                                                                            >
                                                                                ✓
                                                                            </button>
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex w-5 h-4 shrink-0 items-center justify-center">
                                                                            {weeklyReceivedTypes.some(type => type.received_type === row.type) ? (
                                                                                <button onClick={() => handleEditPaymentClick(row)}>
                                                                                    <img className="w-5 h-4" src={Edit} alt="Edit" />
                                                                                </button>
                                                                            ) : (
                                                                                <img
                                                                                    className="w-5 h-4 opacity-40 cursor-not-allowed"
                                                                                    src={Edit}
                                                                                    alt="Edit Disabled"
                                                                                />
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                    <span className="inline-flex w-5 h-4 shrink-0 items-center justify-center">
                                                                        {weeklyReceivedTypes.some(type => type.received_type === row.type) ? (
                                                                            <button type="button" onClick={() => handleWeeklyReceivedDelete(row.id)}>
                                                                                <img src={Delete} className="w-5 h-4" alt="Delete" />
                                                                            </button>
                                                                        ) : (
                                                                            <img
                                                                                className="w-5 h-4 opacity-40 cursor-not-allowed"
                                                                                src={Delete}
                                                                                alt="Delete Disabled"
                                                                            />
                                                                        )}
                                                                    </span>
                                                                    <span className="inline-flex w-5 h-4 shrink-0 items-center justify-center">
                                                                        {weeklyReceivedTypes.some(type => type.received_type === row.type) ? (
                                                                            <button type="button" onClick={() => fetchAuditDetailsForPaymentReceived(row.id)}>
                                                                                <img className="w-5 h-4" src={history} alt="History" />
                                                                            </button>
                                                                        ) : (
                                                                            <img
                                                                                className="w-5 h-4 opacity-40 cursor-not-allowed"
                                                                                src={history}
                                                                                alt="History Disabled"
                                                                            />
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="w-[12px] min-w-[12px] max-w-[12px] p-0"></td>
                                                        </EdbcTableBodyRow>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-[12px] flex-1 min-h-0 rounded-xl bg-white px-[18px] py-[12px] border border-[#E6DAC6] text-left overflow-hidden max-xl:flex-none max-xl:overflow-visible">
                                    <div className="flex flex-col h-full min-h-0">
                                        <div className="flex items-center justify-between rounded-lg mb-[4px]">
                                            <p className="text-[16px] font-semibold text-black">Summary Details</p>
                                        </div>
                                        <div className="overflow-y-auto no-scrollbar scrollbar-none flex-1 min-h-0 max-xl:overflow-visible max-xl:flex-none">
                                            {Object.entries(
                                                expenses
                                                    .filter(expense => Number(expense.amount) > 0)
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
                                                ₹{expenses.reduce((total, expense) => total + Number(expense.amount || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>
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
                        {(popup.type === "expense" || popup.type === "payment" || popup.type === "edit-expense" || popup.type === "edit-payment") && (
                            <button
                                className="px-4 py-2 bg-[#BF9853] w-[90px] text-white rounded-lg"
                                onClick={() => {
                                    if (popup.type === "expense") {
                                        setNewExpense((prev) => ({ ...prev, date: popup.dateStr }));
                                    } else if (popup.type === "payment") {
                                        setNewPayment((prev) => ({ ...prev, date: popup.dateStr }));
                                    } else if (popup.type === "edit-expense" && popup.editRowId !== null) {
                                        setEditFormData((prev) => ({ ...prev, date: popup.dateStr }));
                                    } else if (popup.type === "edit-payment" && popup.editIndex !== null) {
                                        setEditPaymentData((prev) => ({ ...prev, date: popup.dateStr }));
                                    }
                                    setPopup({ show: false, message: "", type: "", dateStr: "", editRowId: null, editIndex: null, originalDate: "" });
                                }}
                            >
                                Ignore
                            </button>
                        )}
                        <button
                            className={`px-4 py-2 ${popup.type === "expense" || popup.type === "payment" || popup.type === "edit-expense" || popup.type === "edit-payment" ? "border border-[#BF9853] w-[90px]" : "bg-[#BF9853] text-white w-[90px]"} rounded-lg`}
                            onClick={() => {
                                if (popup.type === "expense") {
                                    setNewExpense((prev) => ({ ...prev, date: "" }));
                                } else if (popup.type === "payment") {
                                    setNewPayment((prev) => ({ ...prev, date: "" }));
                                } else if (popup.type === "edit-expense" && popup.editRowId !== null && popup.originalDate) {
                                    setEditFormData((prev) => ({ ...prev, date: popup.originalDate }));
                                } else if (popup.type === "edit-payment" && popup.editIndex !== null && popup.originalDate) {
                                    setEditPaymentData((prev) => ({ ...prev, date: popup.originalDate }));
                                }
                                setPopup({ show: false, message: "", type: "", dateStr: "", editRowId: null, editIndex: null, originalDate: "" });
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
            {showPopups && (currentRow?.type === "Project Advance" || currentRow?.type === "Bill Payment") && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
                    <div className="bg-white rounded-xl shadow-lg p-[18px] w-[650px]">
                        <label className="block text-left">
                            <span className="font-semibold text-[18px] block mb-[8px]">Description</span>
                            <textarea
                                name="description"
                                placeholder="Description"
                                rows={4}
                                className={`border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none resize-none whitespace-normal break-words${Boolean(portalDescriptions[currentRow?.advance_portal_id]) && !isDescriptionEditing ? ' bg-[#ededed]' : ''}`}
                                value={editFormData.description || ""}
                                onChange={handleEditChange}
                                readOnly={Boolean(portalDescriptions[currentRow?.advance_portal_id]) && !isDescriptionEditing}
                            />
                        </label>
                        <div className="flex justify-end gap-[18px] mt-[18px]">
                            {portalDescriptions[currentRow?.advance_portal_id] && !isDescriptionEditing && (
                                <button onClick={() => setIsDescriptionEditing(true)} disabled={editingRowId !== currentRow?.id} className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                    Edit
                                </button>
                            )}
                            <button onClick={() => { setShowPopups(false); setIsDescriptionEditing(false); }} className="px-4 py-2 border border-[#BF9853] text-[#BF9853] rounded">
                                Close
                            </button>
                            {(!portalDescriptions[currentRow?.advance_portal_id] || isDescriptionEditing) && (
                                <button
                                    onClick={async () => {
                                        await updateDescription(currentRow.advance_portal_id, editFormData.description);
                                        setIsDescriptionEditing(false);
                                        setShowPopups(false);
                                    }}
                                    className="px-4 py-2 bg-[#BF9853] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Save
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {showPaymentPopup && (
                <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white text-left rounded-xl px-[18px] py-[18px] overflow-y-auto">
                        <label className="font-bold text-[18px]">Add Payment</label>
                        <div className="space-y-[18px] mt-[14px]">
                            <div className="border-2 border-[#BF9853] border-opacity-25 w-[600px] rounded-lg p-[18px]">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[16px] font-semibold text-black mb-2">Date</label>
                                        <CustomDateField
                                            value={paymentPopupData.date || ''}
                                            onChange={() => { }}
                                            disabled
                                            placeholder="Date"
                                            placeholderButtonClassName="text-[14px] font-normal placeholder:text-[#A6A5A6] placeholder:text-[14px]"
                                            alwaysOpenBelow
                                            calendarPortal
                                            controlHeightPx={40}
                                            className={` [&>div]:!w-full [&>div]:!h-[40px] [&>div]:!min-h-[40px] [&>div]:!border-2 [&>div]:!border-[rgba(191,152,83,0.2)] [&>div]:!rounded-lg [&>div]:!shadow-none [&>div]:!text-[14px] ${paymentPopupData.date ? '[&>div]:!text-black [&>div]:!font-normal' : '[&>div]:!text-[#A6A5A6] [&>div]:!font-normal'}`}
                                        />
                                    </div>
                                    <div>
                                        {currentProjectAdvanceRow ? (
                                            <div className="flex justify-between items-center text-[16px] font-semibold text-black mb-2">
                                                <span>Amount</span>
                                                <span className="text-[#E45732]">
                                                    ₹{(Number(currentProjectAdvanceRow.amount) + previousPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)).toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        ) : (
                                            <label className="block text-[16px] font-semibold text-black mb-2">Amount</label>
                                        )}
                                        <input
                                            type="number"
                                            value={paymentPopupData.amount}
                                            onChange={(e) => setPaymentPopupData(prev => ({ ...prev, amount: e.target.value }))}
                                            placeholder="Amount"
                                            className="border-2 border-[#BF9853] border-opacity-25 h-[40px] box-border px-2 rounded-lg w-full focus:outline-none no-spinner text-[14px] placeholder:text-[#A6A5A6] placeholder:text-[14px] placeholder:font-normal"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[16px] font-semibold text-black mb-2">Mode</label>
                                        <Select
                                            value={paymentPopupData.paymentMode ? { value: paymentPopupData.paymentMode, label: paymentPopupData.paymentMode } : null}
                                            onChange={(selectedOption) => setPaymentPopupData(prev => ({ ...prev, paymentMode: selectedOption ? selectedOption.value : '' }))}
                                            options={[
                                                { value: 'Gpay', label: 'Gpay' },
                                                { value: 'PhonePe', label: 'PhonePe' },
                                                { value: 'Net Banking', label: 'Net Banking' },
                                                { value: 'Cheque', label: 'Cheque' },
                                            ]}
                                            placeholder="Mode"
                                            isSearchable
                                            isClearable
                                            menuPortalTarget={document.body}
                                            menuPosition="fixed"
                                            className="w-full text-[14px] focus:outline-none"
                                            classNames={ENTRY_ROW_SELECT_CLASS_NAMES}
                                            styles={{
                                                ...CASH_REGISTER_SELECT_STYLES,
                                                control: (provided, state) => ({
                                                    ...CASH_REGISTER_SELECT_STYLES.control(provided, state),
                                                    minHeight: '40px',
                                                    height: '40px',
                                                    maxHeight: '40px',
                                                }),
                                                placeholder: (provided) => ({
                                                    ...CASH_REGISTER_SELECT_STYLES.placeholder(provided),
                                                    color: '#A6A5A6',
                                                    fontSize: '14px',
                                                    fontWeight: 'normal',
                                                }),
                                                menu: (provided) => ({
                                                    ...CASH_REGISTER_SELECT_STYLES.menu(provided),
                                                    zIndex: 10050,
                                                }),
                                                menuList: entryRowSelectMenuListStyle,
                                                menuPortal: (provided) => ({
                                                    ...provided,
                                                    zIndex: 10050,
                                                }),
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="border-2 border-[#BF9853] border-opacity-25 w-[600px] rounded-lg p-[18px]">
                                <div className="space-y-[18px]">
                                    {paymentPopupData.paymentMode === "Cheque" && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[16px] font-semibold text-black mb-2">Cheque No</label>
                                                <input
                                                    type="text"
                                                    value={paymentPopupData.chequeNo}
                                                    onChange={(e) => setPaymentPopupData(prev => ({ ...prev, chequeNo: e.target.value }))}
                                                    placeholder="Cheque No"
                                                    className="border-2 border-[#BF9853] border-opacity-25 h-[40px] box-border px-2 rounded-lg w-full focus:outline-none text-[14px] placeholder:text-[#A6A5A6] placeholder:text-[14px] placeholder:font-normal"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[16px] font-semibold text-black mb-2">Cheque Date</label>
                                                <CustomDateField
                                                    value={paymentPopupData.chequeDate || ''}
                                                    onChange={(dateStr) => setPaymentPopupData(prev => ({ ...prev, chequeDate: dateStr }))}
                                                    placeholder="Cheque Date"
                                                    placeholderButtonClassName="text-[14px] font-normal placeholder:text-[#A6A5A6] placeholder:text-[14px]"
                                                    alwaysOpenBelow
                                                    calendarPortal
                                                    controlHeightPx={40}
                                                    className={` [&>div]:!w-full [&>div]:!h-[40px] [&>div]:!min-h-[40px] [&>div]:!border-2 [&>div]:!border-[rgba(191,152,83,0.2)] [&>div]:!rounded-lg [&>div]:!shadow-none [&>div]:!text-[14px] [&>div:hover]:!border-[rgba(191,152,83,0.4)] ${paymentPopupData.chequeDate ? '[&>div]:!text-black [&>div]:!font-normal' : '[&>div]:!text-[#A6A5A6] [&>div]:!font-normal'}`}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[16px] font-semibold text-black mb-2">Transaction Number</label>
                                            <input
                                                type="text"
                                                value={paymentPopupData.transactionNumber}
                                                onChange={(e) => setPaymentPopupData(prev => ({ ...prev, transactionNumber: e.target.value }))}
                                                placeholder="Transaction Number"
                                                className="border-2 border-[#BF9853] border-opacity-25 h-[40px] box-border px-2 rounded-lg w-full focus:outline-none text-[14px] placeholder:text-[#A6A5A6] placeholder:text-[14px] placeholder:font-normal"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[16px] font-semibold text-black mb-2">Account Number</label>
                                            <Select
                                                value={paymentPopupData.accountNumber ? { value: paymentPopupData.accountNumber, label: paymentPopupData.accountNumber } : null}
                                                onChange={(selectedOption) => setPaymentPopupData(prev => ({ ...prev, accountNumber: selectedOption ? selectedOption.value : '' }))}
                                                options={accountDetails.map((account) => ({
                                                    value: account.account_number,
                                                    label: account.account_number,
                                                }))}
                                                placeholder="Account Number"
                                                isSearchable
                                                isClearable
                                                menuPortalTarget={document.body}
                                                menuPosition="fixed"
                                                className="w-full text-[14px] focus:outline-none"
                                                classNames={ENTRY_ROW_SELECT_CLASS_NAMES}
                                                styles={{
                                                    ...CASH_REGISTER_SELECT_STYLES,
                                                    control: (provided, state) => ({
                                                        ...CASH_REGISTER_SELECT_STYLES.control(provided, state),
                                                        minHeight: '40px',
                                                        height: '40px',
                                                        maxHeight: '40px',
                                                    }),
                                                    placeholder: (provided) => ({
                                                        ...CASH_REGISTER_SELECT_STYLES.placeholder(provided),
                                                        color: '#A6A5A6',
                                                        fontSize: '14px',
                                                        fontWeight: 'normal',
                                                    }),
                                                    menu: (provided) => ({
                                                        ...CASH_REGISTER_SELECT_STYLES.menu(provided),
                                                        zIndex: 10050,
                                                    }),
                                                    menuList: entryRowSelectMenuListStyle,
                                                    menuPortal: (provided) => ({
                                                        ...provided,
                                                        zIndex: 10050,
                                                    }),
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Previous Payments Section */}
                            {previousPayments.length > 0 && (
                                <div>
                                    <h4 className="text-md font-semibold text-black  ml-20">Previous Payments: {previousPayments.length} </h4>
                                    <div className="mb-[18px] justify-items-center">
                                        <div className="space-y-[18px] max-h-64 overflow-y-auto">
                                            {previousPayments.map((payment, index) => (
                                                <div key={index} className="">
                                                    {/* First Row: Date, Amount, Mode */}
                                                    <div className="border-2 border-[#BF9853] border-opacity-25 w-[600px] rounded-lg p-[18px] mb-4">
                                                        <div className="grid grid-cols-3 gap-4">
                                                            {/* Date */}
                                                            <div>
                                                                <label className="block text-[16px] font-semibold text-black mb-2">Date</label>
                                                                <input
                                                                    type="text"
                                                                    value={new Date(payment.date).toLocaleDateString('en-GB')}
                                                                    readOnly
                                                                    className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full  text-gray-600"
                                                                />
                                                            </div>
                                                            {/* Amount */}
                                                            <div>
                                                                <label className="block text-[16px] font-semibold text-black mb-2">Amount</label>
                                                                <input
                                                                    type="text"
                                                                    value={payment.amount.toLocaleString('en-IN')}
                                                                    readOnly
                                                                    className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full  text-gray-600"
                                                                />
                                                            </div>
                                                            {/* Mode */}
                                                            <div>
                                                                <label className="block text-[16px] font-semibold text-black mb-2">Mode</label>
                                                                <input
                                                                    type="text"
                                                                    value={payment.bill_payment_mode}
                                                                    readOnly
                                                                    className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full  text-gray-600"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="border-2 border-[#BF9853] border-opacity-25 rounded-lg p-[18px]">
                                                        <div className="space-y-[18px]">
                                                            {payment.bill_payment_mode === "Cheque" && (
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    {/* Cheque No */}
                                                                    <div>
                                                                        <label className="block text-[16px] font-semibold text-black mb-2">Cheque No</label>
                                                                        <input
                                                                            type="text"
                                                                            value={payment.cheque_number || ""}
                                                                            readOnly
                                                                            className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full  text-gray-600"
                                                                        />
                                                                    </div>
                                                                    {/* Cheque Date */}
                                                                    <div>
                                                                        <label className="block text-[16px] font-semibold text-black mb-2">Cheque Date</label>
                                                                        <input
                                                                            type="text"
                                                                            value={payment.cheque_date ? new Date(payment.cheque_date).toLocaleDateString('en-GB') : ""}
                                                                            readOnly
                                                                            className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full  text-gray-600"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-[16px] font-semibold text-black mb-2">Transaction Number</label>
                                                                    <input
                                                                        type="text"
                                                                        value={payment.transaction_number || ""}
                                                                        readOnly
                                                                        className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full  text-gray-600"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[16px] font-semibold text-black mb-2">Account Number</label>
                                                                    <input
                                                                        type="text"
                                                                        value={payment.account_number || ""}
                                                                        readOnly
                                                                        className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full  text-gray-600"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {currentProjectAdvanceRow && currentProjectAdvanceRow.type === "Claim" && currentProjectAdvanceRow.send_to_expenses_entry && (
                                <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="text-center">
                                        <span className="text-sm font-medium text-green-700">
                                            This Claim Amount Was Already Sent to the Expense Entry
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-between items-center mt-[18px]">
                                <div className="flex gap-3 ml-auto">
                                    <button
                                        onClick={() => {
                                            setShowPaymentPopup(false);
                                            setPaymentPopupData({
                                                date: new Date().toISOString().split('T')[0],
                                                amount: "",
                                                paymentMode: "",
                                                chequeNo: "",
                                                chequeDate: "",
                                                transactionNumber: "",
                                                accountNumber: ""
                                            });
                                            setPreviousPayments([]);
                                            setCurrentProjectAdvanceRow(null);
                                        }}
                                        className="px-4 py-2 border border-[#BF9853] text-[#BF9853] rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            try {
                                                if (currentProjectAdvanceRow && paymentPopupData.paymentMode && paymentPopupData.amount) {
                                                    if (isPaymentModeRequiringBankRegisterLog(paymentPopupData.paymentMode)) {
                                                        let mainRefUrl = "https://backendaab.in/demoAabuildersDash/api/weekly-payment-bills/save";
                                                        if (currentProjectAdvanceRow.type === "Project Advance" && currentProjectAdvanceRow.advance_portal_id) {
                                                            mainRefUrl = "https://backendaab.in/demoAabuildersDash/api/advance_portal/save";
                                                        } else if (currentProjectAdvanceRow.type === "Staff Advance") {
                                                            mainRefUrl = "https://backendaab.in/demoAabuildersDash/api/staff-advance/save";
                                                        }
                                                        await postBankRegisterLogSave(
                                                            bankRegisterLogSaveUrlMatchingRequest(mainRefUrl),
                                                            "Cash Register — Weekly Payment",
                                                            {
                                                                bill_payment_mode: paymentPopupData.paymentMode,
                                                                amount: paymentPopupData.amount,
                                                                entered_by: enteredBy,
                                                            }
                                                        );
                                                    }
                                                    let advancePortalId = null;
                                                    let staffAdvancePortalId = null;
                                                    if (currentProjectAdvanceRow.type === "Project Advance" && currentProjectAdvanceRow.advance_portal_id) {
                                                        try {
                                                            const res = await fetch("https://backendaab.in/demoAabuildersDash/api/advance_portal/getAll");
                                                            if (!res.ok) throw new Error("Failed to fetch entry numbers");
                                                            const allData = await res.json();
                                                            const maxEntryNo =
                                                                allData.length > 0
                                                                    ? Math.max(...allData.map((item) => item.entry_no || 0))
                                                                    : 0;
                                                            const nextEntryNo = maxEntryNo + 1;
                                                            const getWeekNumber = () => {
                                                                return getISOWeekNumber(new Date());
                                                            };
                                                            const description = portalDescriptions[currentProjectAdvanceRow.advance_portal_id] || "";
                                                            const advanceUpdateData = {
                                                                type: "Advance",
                                                                date: paymentPopupData.date,
                                                                description: description,
                                                                bill_amount: 0,
                                                                amount: parseFloat(paymentPopupData.amount),
                                                                project_id: currentProjectAdvanceRow.project_id,
                                                                vendor_id: currentProjectAdvanceRow.vendor_id,
                                                                contractor_id: currentProjectAdvanceRow.contractor_id,
                                                                entry_no: nextEntryNo,
                                                                week_no: getWeekNumber(),
                                                                file_url: "",
                                                                transfer_site_id: 0,
                                                                refund_amount: 0,
                                                                payment_mode: paymentPopupData.paymentMode,
                                                                not_allow_to_edit: true,
                                                                source: "Cash Register",
                                                                branch_id: activeBranchId ?? null,
                                                                entered_by: enteredBy
                                                            };
                                                            const advanceResponse = await fetch(
                                                                "https://backendaab.in/demoAabuildersDash/api/advance_portal/save",
                                                                {
                                                                    method: "POST",
                                                                    headers: { "Content-Type": "application/json" },
                                                                    body: JSON.stringify(advanceUpdateData)
                                                                }
                                                            );
                                                            if (!advanceResponse.ok) {
                                                                console.error("Failed to update advance portal payment mode");
                                                            } else {
                                                                const advanceResponseData = await advanceResponse.json();
                                                                advancePortalId = advanceResponseData.advancePortalId || advanceResponseData.advance_portal_id;
                                                            }
                                                        } catch (error) {
                                                            console.error("Error updating advance portal payment mode:", error);
                                                        }
                                                    }
                                                    if (currentProjectAdvanceRow.type === "Staff Advance") {
                                                        try {
                                                            const staffAdvanceRes = await fetch("https://backendaab.in/demoAabuildersDash/api/staff-advance/all");
                                                            if (!staffAdvanceRes.ok) throw new Error("Failed to fetch staff advance entry numbers");
                                                            const staffAdvanceData = await staffAdvanceRes.json();
                                                            const maxEntryNo =
                                                                staffAdvanceData.length > 0
                                                                    ? Math.max(...staffAdvanceData.map((item) => item.entry_no || 0))
                                                                    : 0;
                                                            const nextEntryNo = maxEntryNo + 1;
                                                            const getWeekNumber = () => {
                                                                return getISOWeekNumber(new Date());
                                                            };
                                                            const staffAdvanceSaveData = {
                                                                date: paymentPopupData.date,
                                                                employee_id: currentProjectAdvanceRow.employee_id,
                                                                project_id: currentProjectAdvanceRow.project_id,
                                                                type: "Advance",
                                                                from_purpose_id: 4,
                                                                staff_payment_mode: paymentPopupData.paymentMode,
                                                                entry_no: nextEntryNo,
                                                                week_no: getWeekNumber(),
                                                                amount: parseFloat(paymentPopupData.amount),
                                                                staff_refund_amount: 0.0,
                                                                description: "",
                                                                source: "Cash Register",
                                                                file_url: null,
                                                                labour_id: 0,
                                                                not_allow_to_edit: true,
                                                                branch_id: activeBranchId ?? null,
                                                                entered_by: enteredBy
                                                            };
                                                            const staffAdvanceResponse = await fetch(
                                                                "https://backendaab.in/demoAabuildersDash/api/staff-advance/save",
                                                                {
                                                                    method: "POST",
                                                                    headers: { "Content-Type": "application/json" },
                                                                    body: JSON.stringify(staffAdvanceSaveData)
                                                                }
                                                            );
                                                            if (!staffAdvanceResponse.ok) {
                                                                console.error("Failed to save staff advance");
                                                            } else {
                                                                const staffAdvanceResponseData = await staffAdvanceResponse.json();
                                                                staffAdvancePortalId = staffAdvanceResponseData.staffAdvancePortalId || staffAdvanceResponseData.staff_advance_portal_id;
                                                            }
                                                        } catch (error) {
                                                            console.error("Error saving staff advance:", error);
                                                        }
                                                    }
                                                    const paymentData = {
                                                        date: paymentPopupData.date,
                                                        created_at: new Date().toISOString(),
                                                        contractor_id: currentProjectAdvanceRow.contractor_id || null,
                                                        vendor_id: currentProjectAdvanceRow.vendor_id || null,
                                                        employee_id: currentProjectAdvanceRow.employee_id || null,
                                                        project_id: currentProjectAdvanceRow.project_id || null,
                                                        type: currentProjectAdvanceRow.type || null,
                                                        bill_payment_mode: paymentPopupData.paymentMode,
                                                        amount: parseFloat(paymentPopupData.amount),
                                                        status: true,
                                                        weekly_number: operationalWeekNumber,
                                                        weekly_payment_expense_id: currentProjectAdvanceRow.id,
                                                        advance_portal_id: advancePortalId,
                                                        staff_advance_portal_id: staffAdvancePortalId,
                                                        cheque_number: paymentPopupData.chequeNo || null,
                                                        cheque_date: paymentPopupData.chequeDate || null,
                                                        transaction_number: paymentPopupData.transactionNumber || null,
                                                        account_number: paymentPopupData.accountNumber || null,
                                                        branch_id: activeBranchId ?? null,
                                                    };
                                                    await saveWeeklyPaymentBill(paymentData);
                                                    await fetchWeeklyPaymentBills();
                                                }
                                            } catch (error) {
                                                console.error("Error saving payment:", error);
                                            }

                                            setShowPaymentPopup(false);
                                            setPaymentPopupData({
                                                date: new Date().toISOString().split('T')[0],
                                                amount: "",
                                                paymentMode: "",
                                                chequeNo: "",
                                                chequeDate: "",
                                                transactionNumber: "",
                                                accountNumber: ""
                                            });
                                            setPreviousPayments([]);
                                            setCurrentProjectAdvanceRow(null);
                                        }}
                                        className="px-4 py-2 bg-[#BF9853] text-white rounded-lg"
                                        disabled={!paymentPopupData.paymentMode || !paymentPopupData.amount}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showBillExpenseEntryModal ? (
                <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-[18px]">
                    <div className="bg-white rounded-lg w-full max-w-[690px] max-h-[92vh] overflow-y-auto shadow-lg relative p-[18px]">
                        <div className="flex items-center justify-between pl-[18px] mb-[14px]">
                            <p className="text-[18px] font-semibold text-[#202020]">Expense Entry</p>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!canCloseExpenseEntryModal()) return;
                                    setShowBillExpenseEntryModal(false);
                                    localStorage.removeItem('expenseEntryPrefill');
                                }}
                                className="w-3 h-3 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 text-xl"
                            >
                                <img src={FileRemover} className="w-4 h-4" alt="Close" />
                            </button>
                        </div>
                        <style>{`
                            .weekly-payment-expense-entry-form > div > div {
                                padding-top: 0 !important;
                                padding-bottom: 0 !important;
                            }
                            .weekly-payment-expense-entry-form div.flex.items-start.justify-between:has(label[for="fileInput"]) {
                                margin-top: 8px !important;
                                margin-bottom: 12px !important;
                            }
                            .weekly-payment-expense-entry-form div.mt-\\[12px\\].flex:has(button[type="submit"]) {
                                margin-top: 0 !important;
                            }
                            .weekly-payment-expense-entry-form [aria-readonly="true"].w-\\[300px\\] {
                                min-height: 40px !important;
                                height: 40px !important;
                                max-height: 40px !important;
                                background-color: #ededed !important;
                            }
                        `}</style>
                        <div className="weekly-payment-expense-entry-form">
                            <ExpenseEntryForm
                                username={username}
                                userRoles={userRoles}
                                embedded
                                lockAccountTypePrefill
                                lockClaimPaymentModeCash
                                disableWeeklyExpensesSave
                                onSuccess={async () => {
                                    setShowBillExpenseEntryModal(false);
                                    localStorage.removeItem('expenseEntryPrefill');
                                    try {
                                        await fetchExpenses();
                                    } catch {
                                        /* ignore */
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            ) : null}
            {showBillSettlementAdvanceModal ? (
                <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg w-full max-w-[1824px] max-h-[92vh] overflow-y-auto shadow-lg relative">
                        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                            <p className="text-sm font-semibold text-[#202020]">Advance Portal</p>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowBillSettlementAdvanceModal(false);
                                    try {
                                        sessionStorage.removeItem("selectedType");
                                        sessionStorage.removeItem("selectedOption");
                                        sessionStorage.removeItem("selectedSite");
                                        sessionStorage.removeItem("advanceAmount");
                                        sessionStorage.removeItem("billAmount");
                                        sessionStorage.removeItem("paymentMode");
                                        sessionStorage.removeItem("description");
                                        sessionStorage.removeItem("cashRegisterBillSettlementDate");
                                    } catch {
                                        /* ignore */
                                    }
                                }}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 text-xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-3">
                            <AdvancePortalForm
                                username={username}
                                userRoles={userRoles}
                                embedded
                                lockTypePrefill
                                onSuccess={async () => {
                                    setShowBillSettlementAdvanceModal(false);
                                    try {
                                        sessionStorage.removeItem("selectedType");
                                        sessionStorage.removeItem("selectedOption");
                                        sessionStorage.removeItem("selectedSite");
                                        sessionStorage.removeItem("advanceAmount");
                                        sessionStorage.removeItem("billAmount");
                                        sessionStorage.removeItem("paymentMode");
                                        sessionStorage.removeItem("description");
                                        sessionStorage.removeItem("cashRegisterBillSettlementDate");
                                    } catch {
                                        /* ignore */
                                    }
                                    try {
                                        await refreshWeeklyPaymentData();
                                    } catch {
                                        /* ignore */
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            ) : null}
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
                            {currentFileRow?.bill_copy_url ? 'Change File' : 'Upload File'}
                        </h3>
                        {currentFileRow?.bill_copy_url && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-2">Current file:</p>
                                <a href={cleanUrl(currentFileRow.bill_copy_url)}
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
                                htmlFor="weekly-payment-file-upload-input"
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
                                id="weekly-payment-file-upload-input"
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
            {showPaymentDetailsPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-[500px] max-h-[600px] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4 text-center">Payment Details</h3>
                        <div className="space-y-3">
                            {selectedPaymentDetails.map((payment, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-3">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="font-medium text-gray-700">{payment.type}</span>
                                            <p className="text-sm text-gray-500">
                                                {new Date(payment.date).toLocaleDateString('en-GB')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-semibold text-green-600">
                                                ₹{payment.amount.toLocaleString('en-IN')}
                                            </span>
                                            <p className="text-xs text-gray-500">
                                                {payment.status ? 'Active' : 'Inactive'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {selectedPaymentDetails.length === 0 && (
                                <div className="text-center text-gray-500 py-8">
                                    No payment details found
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end mt-4">
                            <button onClick={() => { setShowPaymentDetailsPopup(false); setSelectedPaymentDetails([]); }}
                                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showCategoryPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-[400px]">
                        <h3 className="text-lg font-semibold mb-4 text-center">Select Category</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <Select
                                value={selectedCategory}
                                onChange={(selectedOption) => setSelectedCategory(selectedOption)}
                                options={categoryOptions}
                                placeholder="Select Category..."
                                isSearchable
                                isClearable
                                styles={{
                                    control: (provided, state) => ({
                                        ...provided,
                                        backgroundColor: 'white',
                                        borderWidth: '2px',
                                        borderColor: state.isFocused
                                            ? '#BF9853'
                                            : '#BF9853',
                                        borderRadius: '8px',
                                        boxShadow: state.isFocused ? '0 0 0 1px #BF9853' : 'none',
                                        '&:hover': {
                                            borderColor: '#BF9853',
                                        },
                                    }),
                                    placeholder: (provided) => ({
                                        ...provided,
                                        color: '#999',
                                        textAlign: 'left',
                                    }),
                                    menu: (provided) => ({
                                        ...provided,
                                        zIndex: 9999,
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
                                        padding: '2px',
                                        color: '#000000',
                                    }),
                                    dropdownIndicator: (provided, state) => ({
                                        ...provided,
                                        padding: '2px',
                                        color: '#000000',
                                        display: state.hasValue && state.selectProps.isClearable ? 'none' : 'flex',
                                    })
                                }}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comments
                            </label>
                            <textarea
                                value={categoryComments}
                                onChange={(e) => setCategoryComments(e.target.value)}
                                placeholder="Enter comments..."
                                className="w-full border-2 border-[#BF9853] border-opacity-25 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-[#BF9853] focus:border-transparent resize-none"
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowCategoryPopup(false);
                                    setSelectedCategory(null);
                                    setIsConfirmingCategory(false);
                                    setCategoryComments("");
                                }}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (!selectedCategory || isConfirmingCategory) {
                                        if (!selectedCategory) {
                                            alert("Please select a category");
                                        }
                                        return;
                                    }
                                    setIsConfirmingCategory(true);
                                    setShowCategoryPopup(false);
                                    try {
                                        const enoResponse = await fetch('https://backendaab.in/demoAabuilderDash/expenses_form/get_form');
                                        if (!enoResponse.ok) {
                                            throw new Error('Failed to fetch ENo');
                                        }
                                        const enoData = await enoResponse.json();
                                        const nextEno = enoData.length > 0 ? Math.max(...enoData.map(item => item.eno || 0)) + 1 : 1;
                                        const expensesFormData = {
                                            accountType: "Claim",
                                            eno: nextEno,
                                            date: currentProjectAdvanceRow.date,
                                            siteName: siteOptions.find(opt => opt.id === Number(currentProjectAdvanceRow.project_id))?.label || "",
                                            vendor: vendorOptions.find(opt => opt.id === Number(currentProjectAdvanceRow.vendor_id))?.label || "",
                                            quantity: 1,
                                            contractor: contractorOptions.find(opt => opt.id === Number(currentProjectAdvanceRow.contractor_id))?.label || "",
                                            amount: Number(currentProjectAdvanceRow.amount) + previousPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
                                            category: selectedCategory.value,
                                            comments: categoryComments || "",
                                            machineTools: "",
                                            source: "Cash Register",
                                            billCopyUrl: cleanUrl(currentProjectAdvanceRow.bill_copy_url),
                                            branchId: activeBranchId ?? null,
                                            enteredBy: enteredBy
                                        };
                                        const expensesFormResponse = await fetch('https://backendaab.in/demoAabuilderDash/expenses_form/save', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify(expensesFormData)
                                        });
                                        if (!expensesFormResponse.ok) {
                                            throw new Error('Failed to save to expenses form');
                                        }
                                        console.log(expensesFormData);
                                        console.log(expensesFormResponse);
                                        const response = await fetch(`https://backendaab.in/demoAabuildersDash/api/weekly-expenses/${currentProjectAdvanceRow.id}/send-to-expenses`, {
                                            method: 'PUT',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                        });
                                        if (response.ok) {
                                            await fetchExpenses();
                                            setCurrentProjectAdvanceRow(prev => ({ ...prev, send_to_expenses_entry: true }));
                                            setPopup({
                                                show: true,
                                                message: "Successfully added to expense entry!",
                                                type: "success",
                                                dateStr: new Date().toLocaleDateString('en-GB'),
                                                editRowId: null,
                                                editIndex: null,
                                                originalDate: ""
                                            });
                                            setTimeout(() => {
                                                setShowPaymentPopup(false);
                                                setPaymentPopupData({
                                                    date: new Date().toISOString().split('T')[0],
                                                    amount: "",
                                                    paymentMode: "",
                                                    chequeNo: "",
                                                    chequeDate: "",
                                                    transactionNumber: "",
                                                    accountNumber: ""
                                                });
                                                setPreviousPayments([]);
                                                setCurrentProjectAdvanceRow(null);
                                                setSelectedCategory(null);
                                                setIsConfirmingCategory(false);
                                                setCategoryComments("");
                                            }, 2000);
                                        } else {
                                            throw new Error('Failed to update expense entry status');
                                        }
                                    } catch (error) {
                                        console.error('Error updating expense entry status:', error);
                                        setIsConfirmingCategory(false);
                                        setPopup({
                                            show: true,
                                            message: "Failed to add to expense entry. Please try again.",
                                            type: "error",
                                            dateStr: new Date().toLocaleDateString('en-GB'),
                                            editRowId: null,
                                            editIndex: null,
                                            originalDate: ""
                                        });
                                    }
                                }}
                                className="px-4 py-2 bg-[#BF9853] text-white rounded-lg hover:bg-[#BF9853]/90 transition-colors"
                                disabled={!selectedCategory || isConfirmingCategory}
                            >
                                {isConfirmingCategory ? "Processing..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showPurposePopup && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            setShowPurposePopup(false);
                            setSelectedPurpose(null);
                            setLoanPurposeDescription("");
                            setPendingLoanData(null);
                        }
                    }}
                    tabIndex={0}
                >
                    <div className="bg-white rounded-xl shadow-lg p-6 w-[500px]">
                        <h3 className="text-lg font-semibold mb-4 text-center">
                            Select Purpose for Loan
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
                                menuPosition="fixed"
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
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={loanPurposeDescription}
                                onChange={(e) => setLoanPurposeDescription(e.target.value)}
                                placeholder="Enter description"
                                rows={3}
                                className="w-full border-2 border-[rgba(191, 152, 83, 0.25)] rounded-lg px-3 py-2 focus:outline-none focus:border-[rgba(191, 152, 83, 0.5)]"
                            />
                        </div>
                        {pendingLoanData && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Loan Details:</p>
                                <p className="text-sm">Amount: ₹{Number(pendingLoanData.amount || 0).toLocaleString('en-IN')}</p>
                                <p className="text-sm">Date: {formatDateOnly(pendingLoanData.date)}</p>
                            </div>
                        )}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowPurposePopup(false);
                                    setSelectedPurpose(null);
                                    setLoanPurposeDescription("");
                                    setPendingLoanData(null);
                                }}
                                className="px-4 py-2 border border-[#BF9853] text-[#BF9853] rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePurposeSelection}
                                className="px-4 py-2 bg-[#BF9853] text-white rounded-lg"
                                disabled={!selectedPurpose || !(loanPurposeDescription || "").trim() || isSubmitting}
                            >
                                {isSubmitting ? "Saving..." : "Save"}
                            </button>
                        </div>
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
        const discountValue = closureType === "Carry (CF)" ? parseFloat(continueDiscount) || 0 : parseFloat(handoverDiscount) || 0;
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
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
            <div className="bg-white p-4 text-left rounded-md w-[480px] relative">
                <button onClick={onClose} className="absolute top-2 right-4 text-red-500 font-bold text-xl" >
                    x
                </button>
                {step === 1 ? (
                    <>
                        <h2 className="mb-2 text-[18px] font-semibold">Do you want to Account Closure?</h2>
                        <label className="flex items-center space-x-2 text-[14px]">
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
                        <div className="flex mt-4 gap-[18px] justify-end">
                            <button onClick={onClose} className="rounded border border-[#BF9853] py-2 px-8 font-bold text-[#BF9853]" >
                                No
                            </button>
                            <button onClick={handleYesClick} className="rounded bg-[#BF9853] py-2 px-8 text-white font-bold" >
                                Yes
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
                            <div className="w-[150px]">
                                <label className="block mb-[8px] font-semibold">Discount</label>
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
                        <div className="mt-6 flex justify-end gap-[18px]">
                            <button onClick={() => setStep(1)} className="rounded border border-[#BF9853] py-2 px-8 font-bold text-[#BF9853]" >
                                No
                            </button>
                            <button onClick={handleConfirm} className="rounded bg-[#BF9853] py-2 px-8 text-white font-bold" >
                                Yes
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
        { oldKey: "old_amount", newKey: "new_amount", label: "Amount", width: "100px" },
    ];
    const normalizeAuditId = (id) => {
        if (id == null || String(id).trim() === "" || String(id) === "0") return null;
        return id;
    };
    const getAssociateFromAudit = (audit, keyPrefix) => {
        const vendorId = normalizeAuditId(audit[`${keyPrefix}_vendor_id`]);
        const contractorId = normalizeAuditId(audit[`${keyPrefix}_contractor_id`]);
        const projectId = normalizeAuditId(audit[`${keyPrefix}_project_id`]);
        if (vendorId) return { name: getNameById(vendorId, vendorOptions), type: "Vendor" };
        if (contractorId) return { name: getNameById(contractorId, contractorOptions), type: "Contractor" };
        if (projectId) return { name: getNameById(projectId, siteOptions), type: "Project" };
        return { name: "-", type: "-" };
    };
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
            (field.oldKey?.includes("vendor_id") || field.oldKey?.includes("transfer_site_id") ||
                field.newKey?.includes("vendor_id") || field.newKey?.includes("transfer_site_id")) &&
            String(value) === "0"
        ) { return "-"; }
        if (field.lookup) { return getNameById(value, field.lookup); }
        if (field.label.includes("Amount")) { return value ? Number(value).toLocaleString("en-IN") : "-"; }
        if (field.label === "Date") { return value ? new Date(value).toLocaleDateString("en-GB") : "-"; }
        return value ?? "-";
    };
    return (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-md shadow-lg p-4">
                <div className="flex justify-between items-center mb-[8px]">
                    <h2 className="text-xl font-bold">History</h2>
                    <button onClick={onClose}>
                        <img src={FileRemover} className="w-[10px] h-[10px]" alt="Close" />
                    </button>
                </div>
                <div className="overflow-auto max-h-80 no-scrollbar scrollbar-none border border-l-8 border-l-[#BF9853] rounded-lg">
                    <table className="table-fixed min-w-full bg-white">
                        <thead>
                            <EdbcTableHeaderRow>
                                <EdbcColumnHeader columnId={EDBC_IDS.EDBC1} label="Time Stamp" />
                                <EdbcColumnHeader columnId={EDBC_IDS.EDBC2} label="Date" />
                                <EdbcColumnHeader columnId={EDBC_IDS.EDBC4} label="Associate" />
                                <EdbcColumnHeader columnId={EDBC_IDS.EDBC12} label="Associate Type" />
                                <EdbcColumnHeader columnId={EDBC_IDS.EDBC12} label="Type" />
                                <EdbcColumnHeader columnId={EDBC_IDS.EDBC8} label="Amount" />
                                <EdbcColumnHeader columnId={EDBC_IDS.EDBC12} label="Edited By" />
                            </EdbcTableHeaderRow>
                        </thead>
                        <tbody>
                            {audits.map((audit, index) => (
                                <EdbcTableBodyRow key={index}>
                                    <td id={EDBC_IDS.EDBC1} className={`${getEdbcColumnConfig(EDBC_IDS.EDBC1)?.tdClass} whitespace-nowrap overflow-hidden text-ellipsis`} >
                                        {formatDateTime(audit.edited_date)}
                                    </td>
                                    {fields.slice(0, 1).map((f) => {
                                        const oldDisplay = formatDisplayValue(audit[f.oldKey], f);
                                        const newDisplay = formatDisplayValue(audit[f.newKey], f);
                                        const changed = oldDisplay !== newDisplay;
                                        return (
                                            <td key={f.label} id={EDBC_IDS.EDBC2} title={changed ? `Previous: ${oldDisplay} → Current: ${newDisplay}` : ""}
                                                className={`${getEdbcColumnConfig(EDBC_IDS.EDBC2)?.tdClass} whitespace-nowrap overflow-hidden text-ellipsis ${changed ? "bg-[#BF9853] font-bold" : ""}`}
                                            >
                                                {oldDisplay}
                                            </td>
                                        );
                                    })}
                                    {(() => {
                                        const oldAssociate = getAssociateFromAudit(audit, "old");
                                        const newAssociate = getAssociateFromAudit(audit, "new");
                                        const associateChanged = oldAssociate.name !== newAssociate.name;
                                        const associateTypeChanged = oldAssociate.type !== newAssociate.type;
                                        return (
                                            <>
                                                <td id={EDBC_IDS.EDBC4} title={associateChanged ? `Previous: ${oldAssociate.name} → Current: ${newAssociate.name}` : ""}
                                                    className={`${getEdbcColumnConfig(EDBC_IDS.EDBC4)?.tdClass} whitespace-nowrap overflow-hidden text-ellipsis ${associateChanged ? "bg-[#BF9853] font-bold" : ""}`}
                                                >
                                                    {oldAssociate.name}
                                                </td>
                                                <td id={EDBC_IDS.EDBC12} title={associateTypeChanged ? `Previous: ${oldAssociate.type} → Current: ${newAssociate.type}` : ""}
                                                    className={`${getEdbcColumnConfig(EDBC_IDS.EDBC12)?.tdClass} whitespace-nowrap overflow-hidden text-ellipsis ${associateTypeChanged ? "bg-[#BF9853] font-bold" : ""}`}
                                                >
                                                    {oldAssociate.type}
                                                </td>
                                            </>
                                        );
                                    })()}
                                    {fields.slice(1, 2).map((f) => {
                                        const oldDisplay = formatDisplayValue(audit[f.oldKey], f);
                                        const newDisplay = formatDisplayValue(audit[f.newKey], f);
                                        const changed = oldDisplay !== newDisplay;
                                        return (
                                            <td key={f.label} id={EDBC_IDS.EDBC12} title={changed ? `Previous: ${oldDisplay} → Current: ${newDisplay}` : ""}
                                                className={`${getEdbcColumnConfig(EDBC_IDS.EDBC12)?.tdClass} whitespace-nowrap overflow-hidden text-ellipsis ${changed ? "bg-[#BF9853] font-bold" : ""}`}
                                            >
                                                {oldDisplay}
                                            </td>
                                        );
                                    })}
                                    {fields.slice(2).map((f) => {
                                        const oldDisplay = formatDisplayValue(audit[f.oldKey], f);
                                        const newDisplay = formatDisplayValue(audit[f.newKey], f);
                                        const changed = oldDisplay !== newDisplay;
                                        return (
                                            <td key={f.label} id={EDBC_IDS.EDBC8} title={changed ? `Previous: ${oldDisplay} → Current: ${newDisplay}` : ""}
                                                className={`${getEdbcColumnConfig(EDBC_IDS.EDBC8)?.tdClass} whitespace-nowrap overflow-hidden text-ellipsis ${changed ? "bg-[#BF9853] font-bold" : ""}`}
                                            >
                                                {oldDisplay}
                                            </td>
                                        );
                                    })}
                                    <td id={EDBC_IDS.EDBC12} className={`${getEdbcColumnConfig(EDBC_IDS.EDBC12)?.tdClass} whitespace-nowrap overflow-hidden text-ellipsis`} >
                                        {audit.edited_by}
                                    </td>
                                </EdbcTableBodyRow>
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
        { oldKey: "old_type", newKey: "new_type", label: "Type", width: "100px" },
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
            (field.oldKey?.includes("vendor_id") || field.oldKey?.includes("transfer_site_id") ||
                field.newKey?.includes("vendor_id") || field.newKey?.includes("transfer_site_id")) &&
            String(value) === "0"
        ) { return "-"; }
        if (field.lookup) { return getNameById(value, field.lookup); }
        if (field.label.includes("Amount")) { return value ? Number(value).toLocaleString("en-IN") : "-"; }
        if (field.label === "Date") { return value ? new Date(value).toLocaleDateString("en-GB") : "-"; }
        return value ?? "-";
    };
    return (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-md shadow-lg p-[16px]">
                <div className="flex justify-between items-center mb-[8px]">
                    <h2 className="text-xl font-bold">History</h2>
                    <button onClick={onClose}>
                        <img src={FileRemover} className="w-[10px] h-[10px]" alt="Close" />
                    </button>
                </div>
                <div className="overflow-auto max-h-80 no-scrollbar scrollbar-none border border-l-8 border-l-[#BF9853] rounded-lg">
                    <table className="table-fixed min-w-full bg-white">
                        <thead>
                            <EdbcTableHeaderRow>
                                <EdbcColumnHeader columnId={EDBC_IDS.EDBC1} label="Time Stamp" />
                                <EdbcColumnHeader columnId={EDBC_IDS.EDBC2} label="Date" />
                                <EdbcColumnHeader columnId={EDBC_IDS.EDBC12} label="Type" />
                                <EdbcColumnHeader columnId={EDBC_IDS.EDBC8} label="Amount" />
                                <EdbcColumnHeader columnId={EDBC_IDS.EDBC12} label="Edited By" />
                            </EdbcTableHeaderRow>
                        </thead>
                        <tbody>
                            {audits.map((audit, index) => (
                                <EdbcTableBodyRow key={index}>
                                    <td id={EDBC_IDS.EDBC1} className={`${getEdbcColumnConfig(EDBC_IDS.EDBC1)?.tdClass} whitespace-nowrap overflow-hidden text-ellipsis`} >
                                        {formatDateTime(audit.edited_date)}
                                    </td>
                                    {fields.map((f) => {
                                        const oldDisplay = formatDisplayValue(audit[f.oldKey], f);
                                        const newDisplay = formatDisplayValue(audit[f.newKey], f);
                                        const changed = oldDisplay !== newDisplay;
                                        const columnId = f.label === "Date" ? EDBC_IDS.EDBC2 : f.label === "Type" ? EDBC_IDS.EDBC12 : EDBC_IDS.EDBC8;
                                        return (
                                            <td key={f.label} id={columnId} title={changed ? `Previous: ${oldDisplay} → Current: ${newDisplay}` : ""}
                                                className={`${getEdbcColumnConfig(columnId)?.tdClass} whitespace-nowrap overflow-hidden text-ellipsis ${changed ? "bg-[#BF9853] font-bold" : ""}`}
                                            >
                                                {oldDisplay}
                                            </td>
                                        );
                                    })}
                                    <td id={EDBC_IDS.EDBC12} className={`${getEdbcColumnConfig(EDBC_IDS.EDBC12)?.tdClass} whitespace-nowrap overflow-hidden text-ellipsis`} >
                                        {audit.edited_by}
                                    </td>
                                </EdbcTableBodyRow>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};