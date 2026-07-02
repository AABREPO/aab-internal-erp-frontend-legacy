import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import Select from 'react-select';
import Change from '../Images/dropdownchange.png';
import fileUpload from '../Images/FileUpload.svg';
import file from '../Images/FileView.svg';
import NotesStart from '../Images/TextUpload.svg';
import NotesEnd from '../Images/TextView.svg';
import FileRemover from '../Images/FileRemover.svg';
import restore from '../Images/Restore.svg';
import ExtraFeild from '../Images/ExtraFeild.svg';
import ExtraFeildClose from '../Images/ExtraFeildClose.svg';
import Edit from '../Images/Edit.svg';
import Delete from '../Images/Delete.svg';
import history from '../Images/History.svg';
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
    EdbcExpandableBodyCell,
    useEdbcExpandedCells,
    EDBC_TABLE_EDGE_TABLE_CLASS,
    EDBC_CASH_REGISTER_CHANGE_COLUMN_CLASS,
    EDBC_CASH_REGISTER_DAILY_REFUND_TABLE_LOCK_TABLE_CLASS,
    EDBC_CASH_REGISTER_DAILY_TABLE_LOCK_TABLE_CLASS,
    EDBC_CASH_REGISTER_EXTRA_FIELD_BUTTON_COLUMN_CLASS,
    EDBC_CASH_REGISTER_DESCRIPTION_COLUMN_CLASS,
    EDBC_CASH_REGISTER_EXTRA_AMOUNT_COLUMN_CLASS,
    EDBC_CASH_REGISTER_REFUND_PORTAL_BODY_COLUMN_CLASS,
    EDBC_CASH_REGISTER_REFUND_PORTAL_HEADER_COLUMN_CLASS,
    EDBC_FILTER_CONTROL_BOX_STYLE,
    formatEdbcTotalAmountPlaceholder,
    getEdbcColumnConfig,
    getEdbcColumnHeaderSortProps,
    matchesEdbcAmountFilter,
    matchesWeeklyPaymentExpenseOverallSearch,
} from '../ExpensesEntry/databaseExpensesSharedColumns';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';
import { useLiveDataSync } from '../../utils/useLiveDataSync';
import { useWeeklyPaymentRegisterPermissions } from '../../utils/useWeeklyPaymentRegisterPermissions';

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

/** Locks tbody column widths for past weeks without forcing thead entry-row cells. */
const DAILY_HISTORY_EXPENSES_TBODY_TABLE_LOCK_TABLE_CLASS =
    EDBC_CASH_REGISTER_DAILY_TABLE_LOCK_TABLE_CLASS
        .replace(/\[&_td#/g, '[&_tbody_td#')
        .replace(/\[&_td\.edbc/g, '[&_tbody_td.edbc');

const DAILY_HISTORY_EXPENSES_TABLE_FIXED_WIDTH_CLASS = 'w-[1240px] min-w-[1240px]';
const DAILY_REFUND_TABLE_FIXED_WIDTH_CLASS = 'w-[490px] min-w-[490px]';
const DAILY_REFUND_TABLE_INCOME_STYLE_CLASS =
    '[&_th#EDBC-20]:!w-[70px] [&_td#EDBC-20]:!w-[70px] [&_th#EDBC-20]:!min-w-[70px] [&_td#EDBC-20]:!min-w-[70px] [&_th#EDBC-20]:!max-w-[70px] [&_td#EDBC-20]:!max-w-[70px]';
const DAILY_REFUND_TBODY_TABLE_LOCK_TABLE_CLASS =
    EDBC_CASH_REGISTER_DAILY_REFUND_TABLE_LOCK_TABLE_CLASS.replace(/\[&_td#/g, '[&_tbody_td#');

const formatRefundAmountDisplay = (amount) =>
    `₹${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const DAILY_HISTORY_EXPENSES_TBODY_EDBC8_LOCK_TABLE_CLASS =
    '[&_thead_tr.bg-\\[\\#eeeeee\\]>th#EDBC-8]:!pr-0 [&_th#EDBC-8]:!w-[120px] [&_th#EDBC-8]:!max-w-[120px] [&_th#EDBC-8]:!overflow-hidden [&_tbody_td#EDBC-8]:!w-[98px] [&_tbody_td#EDBC-8]:!max-w-[98px] [&_tbody_td#EDBC-8]:!overflow-visible';

const DailyHistory = ({ username, userRoles = [], onExportActionsReady, isTabActive = true }) => {
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
    const [activeBranchId, setActiveBranchId] = useState(() => resolveActiveBranchId());
    const withBranchParams = useCallback(() => (
        activeBranchId !== null && activeBranchId !== undefined && activeBranchId !== ""
            ? { params: { branchId: activeBranchId } }
            : {}
    ), [activeBranchId]);
    /** Only rows for the selected branch — used so week lists never mix branches if API returns extra rows. */
    const isRowForActiveBranch = useCallback((row) => {
        if (activeBranchId === null || activeBranchId === undefined || activeBranchId === "") return true;
        const bid = row?.branch_id ?? row?.branchId;
        if (bid === null || bid === undefined || bid === "") return false;
        return Number(bid) === Number(activeBranchId);
    }, [activeBranchId]);
    useEffect(() => {
        const syncBranch = () => {
            const nextBranchId = resolveActiveBranchId();
            setActiveBranchId((prevBranchId) => (prevBranchId === nextBranchId ? prevBranchId : nextBranchId));
        };
        syncBranch();
        window.addEventListener("branchSelectionChanged", syncBranch);
        return () => window.removeEventListener("branchSelectionChanged", syncBranch);
    }, []);
    const [selectedWeek, setSelectedWeek] = useState("");
    useEffect(() => {
        selectedWeekRef.current = selectedWeek;
    }, [selectedWeek]);
    const [weeks, setWeeks] = useState([]);
    const [lastWeekWithData, setLastWeekWithData] = useState(null);
    /** Tracks branch+year for the last fetchWeeks run — used to reset the week dropdown when branch/year changes. */
    const prevWeeksContextKeyRef = useRef(null);
    const skipWeekChangeLoadRef = useRef(false);
    const weekTableLoadTokenRef = useRef(0);
    const selectedWeekRef = useRef("");
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
    const [isChangeButtonActive, setIsChangeButtonActive] = useState(true);
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
    const [purposeOptions, setPurposeOptions] = useState([]);
    const [showPurposePopup, setShowPurposePopup] = useState(false);
    const [selectedPurpose, setSelectedPurpose] = useState(null);
    const [pendingRefundData, setPendingRefundData] = useState(null);
    const [showPopups, setShowPopups] = useState(false);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [entryId, setEntryId] = useState(null);
    const [descriptionRowId, setDescriptionRowId] = useState(null);
    const [fileUploadPopup, setFileUploadPopup] = useState(false);
    const [currentFileRow, setCurrentFileRow] = useState(null);
    const [selectedFileForPopup, setSelectedFileForPopup] = useState(null);
    const [removedFileUrlRows, setRemovedFileUrlRows] = useState({});
    const REMOVED_FILE_URL_STORAGE_KEY = 'cashRegister_removedFileUrlIds';
    const isRestorableRemovedFileUrl = (row) => {
        if (!row) return false;
        if (
            row.removed_file_url ??
            row.removedFileUrl ??
            row.stored_file_url ??
            row.storedFileUrl ??
            row.backup_file_url ??
            row.backupFileUrl
        ) {
            return true;
        }
        return row.file_url_removed === true || row.fileUrlRemoved === true;
    };
    const buildRemovedFileUrlRowsMap = (expensesList) => {
        const map = {};
        const expenses = expensesList || [];
        expenses.forEach((exp) => {
            if (exp?.id != null && !exp.file_url && isRestorableRemovedFileUrl(exp)) {
                map[exp.id] = true;
            }
        });
        try {
            const stored = JSON.parse(localStorage.getItem(REMOVED_FILE_URL_STORAGE_KEY) || '[]');
            const ids = Array.isArray(stored) ? stored : [];
            const nextStored = [];
            ids.forEach((id) => {
                const row = expenses.find((e) => String(e.id) === String(id));
                if (!row) {
                    nextStored.push(Number(id));
                    return;
                }
                if (!row.file_url) {
                    map[row.id] = true;
                    nextStored.push(Number(id));
                }
            });
            localStorage.setItem(REMOVED_FILE_URL_STORAGE_KEY, JSON.stringify(nextStored));
        } catch {
            // ignore
        }
        return map;
    };
    const persistRemovedFileUrlId = (id) => {
        try {
            const stored = JSON.parse(localStorage.getItem(REMOVED_FILE_URL_STORAGE_KEY) || '[]');
            const ids = Array.isArray(stored) ? stored : [];
            if (!ids.some((x) => String(x) === String(id))) {
                localStorage.setItem(REMOVED_FILE_URL_STORAGE_KEY, JSON.stringify([...ids, Number(id)]));
            }
        } catch {
            // ignore
        }
    };
    const clearPersistedRemovedFileUrlId = (id) => {
        try {
            const stored = JSON.parse(localStorage.getItem(REMOVED_FILE_URL_STORAGE_KEY) || '[]');
            localStorage.setItem(
                REMOVED_FILE_URL_STORAGE_KEY,
                JSON.stringify((Array.isArray(stored) ? stored : []).filter((x) => String(x) !== String(id)))
            );
        } catch {
            // ignore
        }
    };
    const [editingDailyExpenseRowId, setEditingDailyExpenseRowId] = useState('');
    const [editingPaymentId, setEditingPaymentId] = useState('');
    const [isRefundChangeButtonActive, setIsRefundChangeButtonActive] = useState(true);
    const editDailyExpenseOriginalRef = useRef(null);
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
    const [lastEditableWeek, setLastEditableWeek] = useState(null); // { weekNumber, year }
    const [sendingToExpensesEntry, setSendingToExpensesEntry] = useState(false);
    const [sendingProgress, setSendingProgress] = useState({ current: 0, total: 0 });
    const [showFilters, setShowFilters] = useState(false);
    const [overallSearch, setOverallSearch] = useState('');
    const [refundOverallSearch, setRefundOverallSearch] = useState('');
    const [showRefundFilters, setShowRefundFilters] = useState(false);
    const [selectRefundName, setSelectRefundName] = useState('');
    const [selectRefundAmount, setSelectRefundAmount] = useState('');
    const [refundSortConfig, setRefundSortConfig] = useState({ key: null, direction: 'asc' });
    const [selectDate, setSelectDate] = useState('');
    const [selectContractororVendorName, setSelectContractororVendorName] = useState('');
    const [selectProjectName, setSelectProjectName] = useState('');
    const [selectType, setSelectType] = useState('');
    const [selectQuantity, setSelectQuantity] = useState('');
    const [selectAmount, setSelectAmount] = useState('');
    const scrollRef = useRef(null);
    const filterRowRef = useRef(null);
    const filterNudgeUsedRef = useRef(false);
    const expensesFilterChipsRef = useRef(null);
    const refundFilterChipsRef = useRef(null);
    const refundScrollRef = useRef(null);
    const refundFilterRowRef = useRef(null);
    const refundFilterNudgeUsedRef = useRef(false);
    const { expandedCells, toggleExpandedCell } = useEdbcExpandedCells();
    const isDragging = useRef(false);
    const dragHorizontalOnly = useRef(false);
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
    const { hasEditPermission, hasDeletePermission } = useWeeklyPaymentRegisterPermissions(userRoles);
    const canRemoveFileUrl = hasDeletePermission;
    // Allow editing only for the most recent week (across all years) that has data with status === true
    const canEditSelectedWeek = selectedWeek && lastEditableWeek !== null &&
        Number(selectedWeek) === Number(lastEditableWeek.weekNumber) &&
        parseInt(year, 10) === lastEditableWeek.year;
    const handleMouseDown = (e, ref, horizontalOnly = false) => {
        if (!ref.current) return;
        const interactiveSelector = 'input, select, textarea, button, a, [contenteditable="true"], [role="button"]';
        if (e.target instanceof Element && e.target.closest(interactiveSelector)) {
            return;
        }
        isDragging.current = true;
        dragHorizontalOnly.current = horizontalOnly;
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
        const dy = dragHorizontalOnly.current ? 0 : (e.clientY - start.current.y);
        const now = Date.now();
        const dt = now - lastMove.current.time || 16;
        velocity.current = {
            x: (e.clientX - lastMove.current.x) / dt,
            y: dragHorizontalOnly.current ? 0 : (e.clientY - lastMove.current.y) / dt,
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
    // ISO 8601 week number calculation
    // Week belongs to the year that contains the Thursday of that week
    // Week 1 is the week with the year's first Thursday
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

    const getCurrentISOWeekNumber = () => {
        return getISOWeekNumber(new Date());
    };

    const getWeekNumberFromDate = (dateString) => {
        if (!dateString) return Number(selectedWeek) || getISOWeekNumber(new Date());
        const date = new Date(dateString);
        if (dateString.includes('/')) {
            const parts = dateString.split('/');
            if (parts.length === 3) {
                date.setFullYear(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
            }
        }
        return getISOWeekNumber(date);
    };

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

    const getIsoYearFromRowDate = (row) => {
        const raw =
            row?.period_end_date ||
            row?.created_at ||
            row?.date ||
            row?.timestamp ||
            null;
        if (!raw) return null;
        const d = new Date(raw);
        if (Number.isNaN(d.getTime())) return null;
        return getWeekYear(d);
    };

    const getLatestStatusTrueWeekFromPayments = (paymentsRows) => {
        const rows = (Array.isArray(paymentsRows) ? paymentsRows : []).filter(isRowForActiveBranch);
        const byIso = rows
            .filter((p) => p?.status === true)
            .map((p) => {
                const wn = Number(p.weekly_number);
                const isoYear = getIsoYearFromRowDate(p);
                if (!Number.isFinite(wn) || !Number.isFinite(isoYear)) return null;
                return { weekNumber: wn, year: isoYear };
            })
            .filter(Boolean);
        if (byIso.length === 0) return null;
        return byIso.reduce((best, cur) => {
            if (!best) return cur;
            if (cur.year > best.year) return cur;
            if (cur.year < best.year) return best;
            return cur.weekNumber > best.weekNumber ? cur : best;
        }, null);
    };

    const computeLastEditableWeek = (branchPayments) => {
        const now = new Date();
        const currentWeekNumber = getISOWeekNumber(now);
        const currentWeekYear = getWeekYear(now);
        const hasCurrentWeekTrue = branchPayments.some((payment) => {
            if (payment?.status !== true) return false;
            const wn = Number(payment.weekly_number);
            if (!Number.isFinite(wn) || wn !== currentWeekNumber) return false;
            return getIsoYearFromRowDate(payment) === currentWeekYear;
        });
        if (hasCurrentWeekTrue) {
            return { weekNumber: currentWeekNumber, year: currentWeekYear };
        }
        const latest = getLatestStatusTrueWeekFromPayments(branchPayments);
        if (latest) return latest;
        const { startDate } = getStartAndEndDateOfISOWeek(currentWeekNumber, currentWeekYear);
        const prevDate = new Date(startDate);
        prevDate.setDate(prevDate.getDate() - 1);
        return {
            weekNumber: getISOWeekNumber(prevDate),
            year: getWeekYear(prevDate),
        };
    };

    const loadWeekAndFirstDayData = useCallback(async (weekInfo, selectedYear, loadToken) => {
        if (!weekInfo) return;
        const selectedWeekNum = Number(weekInfo.number);
        const defaultDate = weekInfo.start;
        const requestWeek = String(selectedWeekNum);
        try {
            const [expensesRes, paymentsRes, dailyRes, refundRes] = await Promise.all([
                axios.get(`https://backendaab.in/aabuildersDash/api/weekly-expenses/week/${requestWeek}`, withBranchParams()),
                axios.get(`https://backendaab.in/aabuildersDash/api/payments-received/week/${requestWeek}`, withBranchParams()),
                axios.get(`https://backendaab.in/aabuildersDash/api/daily-payments/date/${defaultDate}`, withBranchParams()),
                axios.get(`https://backendaab.in/aabuildersDash/api/refund_received/date/${defaultDate}`, withBranchParams()),
            ]);
            if (loadToken !== weekTableLoadTokenRef.current) return;

            const filteredExpenses = expensesRes.data.filter((expense) => {
                if (!isRowForActiveBranch(expense)) return false;
                if (expense.status !== true) return false;
                const wn = Number(expense.weekly_number);
                if (!Number.isFinite(wn) || wn !== selectedWeekNum) return false;
                return getIsoYearFromRowDate(expense) === selectedYear;
            });

            const filteredPayments = paymentsRes.data.filter((payment) => {
                if (!isRowForActiveBranch(payment)) return false;
                if (payment.status !== true) return false;
                const wn = Number(payment.weekly_number);
                if (!Number.isFinite(wn) || wn !== selectedWeekNum) return false;
                if (getIsoYearFromRowDate(payment) !== selectedYear) return false;
                return payment.type !== "Handover";
            });

            setExpenses(filteredExpenses);
            setPayments(filteredPayments);
            setSelectedDate(defaultDate);
            setNewRefundReceived((prev) => ({ ...prev, date: defaultDate }));
            setDailyExpenses(dailyRes.data);
            setRemovedFileUrlRows(buildRemovedFileUrlRowsMap(dailyRes.data));
            setRefundPayments(refundRes.data);
        } catch (error) {
            console.error("Error loading week and daily data:", error);
        }
    }, [withBranchParams, isRowForActiveBranch]);

    useEffect(() => {
        const fetchWeeks = async () => {
            const selectedYear = parseInt(year, 10);
            const requestBranchId = activeBranchId;
            const requestYearNum = selectedYear;
            const requestKey = `${requestBranchId ?? "none"}-${requestYearNum}`;
            const loadToken = ++weekTableLoadTokenRef.current;
            try {
                let branchPayments = [];
                let weeksWithData = new Set();
                try {
                    const paymentsResponse = await axios.get('https://backendaab.in/aabuildersDash/api/payments-received/getAll', withBranchParams());
                    branchPayments = (Array.isArray(paymentsResponse.data) ? paymentsResponse.data : []).filter(isRowForActiveBranch);
                    branchPayments.forEach((payment) => {
                        if (payment?.status !== true) return;
                        const wn = Number(payment.weekly_number);
                        if (!Number.isFinite(wn)) return;
                        const paymentWeekYear = getIsoYearFromRowDate(payment);
                        if (paymentWeekYear === selectedYear) {
                            weeksWithData.add(wn);
                        }
                    });
                } catch (error) {
                    console.error('Error fetching payments for week filtering:', error);
                }

                if (requestBranchId !== activeBranchId || requestYearNum !== parseInt(year, 10)) {
                    return;
                }

                const allWeeks = [];
                weeksWithData.forEach((weekNum) => {
                    allWeeks.push(getStartAndEndDateOfWeek(weekNum, selectedYear));
                });

                allWeeks.sort((a, b) => b.number - a.number);

                const lastWeekWithDataValue = weeksWithData.size > 0 ? Math.max(...Array.from(weeksWithData)) : null;
                const defaultWeekNum =
                    lastWeekWithDataValue != null && allWeeks.some((w) => w.number === lastWeekWithDataValue)
                        ? lastWeekWithDataValue
                        : allWeeks[0]?.number ?? null;

                const previousKey = prevWeeksContextKeyRef.current;
                const contextChanged = previousKey !== null && previousKey !== requestKey;
                prevWeeksContextKeyRef.current = requestKey;

                setLastWeekWithData(lastWeekWithDataValue);
                setWeeks(allWeeks);
                setLastEditableWeek(computeLastEditableWeek(branchPayments));

                let weekToSelect = "";
                if (allWeeks.length > 0 && defaultWeekNum != null) {
                    weekToSelect = String(defaultWeekNum);
                }

                let resolvedWeekStr = weekToSelect;
                if (weekToSelect) {
                    const prev = selectedWeekRef.current;
                    const prevNum = prev !== "" && prev != null ? Number(prev) : NaN;
                    const prevInList = !Number.isNaN(prevNum) && allWeeks.some((w) => w.number === prevNum);
                    if (!contextChanged && prev && prev !== "" && prevInList) {
                        resolvedWeekStr = prev;
                    }
                } else {
                    resolvedWeekStr = "";
                }
                setSelectedWeek(resolvedWeekStr);

                const weekInfo = allWeeks.find((w) => w.number === Number(resolvedWeekStr));
                if (weekInfo) {
                    skipWeekChangeLoadRef.current = true;
                    await loadWeekAndFirstDayData(weekInfo, selectedYear, loadToken);
                }
            } catch (error) {
                console.error('Error fetching active weeks:', error);
            }
        };
        fetchWeeks();
    }, [year, activeBranchId, withBranchParams, isRowForActiveBranch, loadWeekAndFirstDayData]);

    useEffect(() => {
        if (!selectedWeek) return;
        if (skipWeekChangeLoadRef.current) {
            skipWeekChangeLoadRef.current = false;
            return;
        }
        const weekInfo = weeks.find((w) => w.number === Number(selectedWeek));
        if (!weekInfo) return;
        const loadToken = ++weekTableLoadTokenRef.current;
        void loadWeekAndFirstDayData(weekInfo, parseInt(year, 10), loadToken);
    }, [selectedWeek, year, weeks, loadWeekAndFirstDayData]);

    const refreshWeekTableData = useCallback(async () => {
        if (!selectedWeek) return;
        try {
            const [expensesRes, paymentsRes] = await Promise.all([
                axios.get(`https://backendaab.in/aabuildersDash/api/weekly-expenses/week/${selectedWeek}`, withBranchParams()),
                axios.get(`https://backendaab.in/aabuildersDash/api/payments-received/week/${selectedWeek}`, withBranchParams()),
            ]);

            const selectedYear = parseInt(year, 10);
            const selectedWeekNum = Number(selectedWeek);

            const filteredExpenses = expensesRes.data.filter((expense) => {
                if (!isRowForActiveBranch(expense)) return false;
                if (expense.status !== true) return false;
                const wn = Number(expense.weekly_number);
                if (!Number.isFinite(wn) || wn !== selectedWeekNum) return false;
                return getIsoYearFromRowDate(expense) === selectedYear;
            });

            const filteredPaymentsByYear = paymentsRes.data.filter((payment) => {
                if (!isRowForActiveBranch(payment)) return false;
                if (payment.status !== true) return false;
                const wn = Number(payment.weekly_number);
                if (!Number.isFinite(wn) || wn !== selectedWeekNum) return false;
                return getIsoYearFromRowDate(payment) === selectedYear;
            });

            const filteredPayments = filteredPaymentsByYear.filter(
                (payment) => payment.type !== "Handover"
            );

            setExpenses(filteredExpenses);
            setPayments(filteredPayments);
        } catch (error) {
            console.error("Error fetching weekly data:", error);
        }
    }, [selectedWeek, year, withBranchParams, isRowForActiveBranch]);
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
        const fetchPurposeOptions = async () => {
            try {
                const response = await fetch('https://backendaab.in/aabuildersDash/api/loan-purposes/getAll', {
                    method: "GET",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                });
                if (!response.ok) {
                    throw new Error("Network response was not ok: " + response.statusText);
                }
                const data = await response.json();
                const formattedData = data.map((item) => ({
                    value: item.purpose,
                    label: item.purpose,
                    id: item.id,
                    type: 'Purpose',
                }));
                setPurposeOptions(formattedData);
            } catch (error) {
                console.error("Error fetching purpose options: ", error);
                setPurposeOptions([]);
            }
        };
        fetchPurposeOptions();
    }, []);
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
            const response = await fetch("https://backendaab.in/aabuildersDash/api/employee_details/basic/getAll", {
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
    const getWeeklyExpenseTypeId = useCallback((typeLabel) => {
        if (typeLabel === null || typeLabel === undefined || String(typeLabel).trim() === "") return null;
        const found = weeklyTypes.find((t) => t && t.type === typeLabel);
        if (!found) return null;
        const id = found.id;
        return id !== undefined && id !== null && !Number.isNaN(Number(id)) ? Number(id) : null;
    }, [weeklyTypes]);
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
    const formatDate = (date) =>
        date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const handleDateClick = async (dateStr) => {
        setSelectedDate(dateStr);
        setNewDailyExpense((prev) => ({ ...prev, date: dateStr }));
        setNewRefundReceived((prev) => ({ ...prev, date: dateStr }));
        try {
            const [dailyRes, refundRes] = await Promise.all([
                axios.get(`https://backendaab.in/aabuildersDash/api/daily-payments/date/${dateStr}`, withBranchParams()),
                axios.get(`https://backendaab.in/aabuildersDash/api/refund_received/date/${dateStr}`, withBranchParams())
            ]);
            setDailyExpenses(dailyRes.data);
            setRemovedFileUrlRows(buildRemovedFileUrlRowsMap(dailyRes.data));
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
        .reduce((sum, row) => sum + (Number(row.amount || 0) + Number(row.extra_amount || 0)), 0);
    const totalRefund = refundPayments
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const balance = (
        payments.reduce((total, row) => total + Number(row.amount || 0), 0) -
        expenses.reduce((total, expense) => total + Number(expense.amount || 0), 0)
    );
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
    const refreshSelectedDateData = useCallback(async () => {
        if (!selectedDate) return;
        try {
            const [dailyRes, refundRes] = await Promise.all([
                axios.get(`https://backendaab.in/aabuildersDash/api/daily-payments/date/${selectedDate}`, withBranchParams()),
                axios.get(`https://backendaab.in/aabuildersDash/api/refund_received/date/${selectedDate}`, withBranchParams()),
            ]);
            setDailyExpenses(dailyRes.data);
            setRemovedFileUrlRows(buildRemovedFileUrlRowsMap(dailyRes.data));
            setRefundPayments(refundRes.data);
        } catch (error) {
            console.error('Error refreshing daily table data:', error);
        }
    }, [selectedDate, withBranchParams]);
    const refreshLiveTableData = useCallback(async () => {
        await refreshWeekTableData();
        await refreshSelectedDateData();
    }, [refreshWeekTableData, refreshSelectedDateData]);
    useLiveDataSync(
        refreshLiveTableData,
        Boolean(
            editingDailyExpenseRowId ||
            editingPaymentId ||
            showPurposePopup ||
            sendingToExpensesEntry ||
            fileUploadPopup ||
            showPopups ||
            !isTabActive
        )
    );
    const getLastEntryNumber = async () => {
        try {
            const response = await axios.get("https://backendaab.in/aabuildersDash/api/staff-advance/all");
            if (response.data && response.data.length > 0) {
                const lastEntry = response.data[response.data.length - 1];
                return (lastEntry.entry_no || 0) + 1;
            }
            return 1;
        } catch (error) {
            console.error("Error fetching last entry number:", error);
            return 1;
        }
    };
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
        const response = await fetch(`https://backendaab.in/aabuildersDash/api/loans/${loanPortalId}?editedBy=${encodeURIComponent(username)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error("Failed to clear Loan Portal entry");
        }
    };
    const handleRefundSubmit = async () => {
        try {
            const isLabourOrEmployeeRefund = (newRefundReceived.labour_id && Number(newRefundReceived.labour_id) > 0) ||
                (newRefundReceived.employee_id && Number(newRefundReceived.employee_id) > 0);
            const isVendorOrContractorRefund = (newRefundReceived.vendor_id && Number(newRefundReceived.vendor_id) > 0) ||
                (newRefundReceived.contractor_id && Number(newRefundReceived.contractor_id) > 0);
            if (!newRefundReceived.amount) {
                alert("Please enter amount.");
                return;
            }
            if (isLabourOrEmployeeRefund) {
                const entryNo = await getLastEntryNumber();
                const staffAdvancePayload = {
                    date: selectedDate,
                    type: "Refund",
                    labour_id: Number(newRefundReceived.labour_id) || null,
                    employee_id: Number(newRefundReceived.employee_id) || null,
                    staff_refund_amount: Number(newRefundReceived.amount),
                    week_no: Number(selectedWeek),
                    staff_payment_mode: "Cash",
                    from_purpose_id: 5,
                    entry_no: entryNo,
                    branch_id: activeBranchId,
                    entered_by: enteredBy,
                    source: "Cash Register",
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
                    weekly_number: Number(selectedWeek),
                    staff_advance_portal_id: staffAdvancePortalId,
                    branch_id: activeBranchId,
                    entered_by: enteredBy,
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
                    weekly_number: Number(selectedWeek),
                    branch_id: activeBranchId,
                });
                setShowPurposePopup(true);
                return;
            } else {
                alert("Please select a labour, employee, vendor, or contractor for the refund.");
                return;
            }
            await refreshSelectedDateData();
            setNewRefundReceived({
                date: selectedDate,
                labour_id: "",
                vendor_id: "",
                contractor_id: "",
                employee_id: "",
                amount: "",
            });
        } catch (error) {
            console.error("Error saving refund:", error);
            alert("Error adding refund. Please try again.");
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
                "https://backendaab.in/aabuildersDash/api/loans/save",
                loanPortalPayload,
                { headers: { "Content-Type": "application/json" } }
            );
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
                "https://backendaab.in/aabuildersDash/api/refund_received/save",
                refundPayload,
                { headers: { "Content-Type": "application/json" } }
            );
            setShowPurposePopup(false);
            setSelectedPurpose(null);
            setPendingRefundData(null);
            await refreshSelectedDateData();
            setNewRefundReceived({
                date: selectedDate,
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
            if (newDailyExpense.type === "Staff Advance") {
                const entryNo = await getLastEntryNumber();
                const staffAdvancePayload = {
                    date: selectedDate,
                    type: "Advance",
                    labour_id: Number(newDailyExpense.labour_id) || null,
                    amount: Number(newDailyExpense.amount),
                    week_no: Number(selectedWeek),
                    staff_payment_mode: "Cash",
                    from_purpose_id: 5,
                    entry_no: entryNo,
                    branch_id: activeBranchId,
                    entered_by: enteredBy,
                    source: "Cash Register",
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
                    type_id: getWeeklyExpenseTypeId(newDailyExpense.type),
                    amount: Number(newDailyExpense.amount),
                    extra_amount: newDailyExpense.extra_amount ? Number(newDailyExpense.extra_amount) : 0,
                    description: newDailyExpense.description || "",
                    weekly_number: Number(selectedWeek),
                    staff_advance_portal_id: staffAdvancePortalId,
                    branch_id: activeBranchId,
                    entered_by: enteredBy,
                };
                await axios.post(
                    "https://backendaab.in/aabuildersDash/api/daily-payments/save",
                    dailyPaymentPayload,
                    { headers: { "Content-Type": "application/json" } }
                );
                const expenseForBackend = {
                    date: selectedDate,
                    contractor_id: contractorOptions.find((opt) => opt.label === "Company Labour")?.id || null,
                    vendor_id: null,
                    project_id: siteOptions.find((opt) => opt.label === "Daily Wage")?.id || null,
                    type: "Daily",
                    amount: 0,
                    weekly_number: Number(selectedWeek),
                    status: false,
                    branch_id: activeBranchId,
                    entered_by: enteredBy,
                };
                await axios.post(
                    "https://backendaab.in/aabuildersDash/api/weekly-expenses/save-daily",
                    expenseForBackend,
                    { headers: { "Content-Type": "application/json" } }
                );
            } else {
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
                    type_id: getWeeklyExpenseTypeId(newDailyExpense.type),
                    amount: Number(newDailyExpense.amount),
                    extra_amount: newDailyExpense.extra_amount ? Number(newDailyExpense.extra_amount) : 0,
                    description: newDailyExpense.description || "",
                    weekly_number: Number(selectedWeek),
                    branch_id: activeBranchId,
                    entered_by: enteredBy,
                };
                await axios.post(
                    "https://backendaab.in/aabuildersDash/api/daily-payments/save",
                    expenseData
                );
                const expenseForBackend = {
                    date: selectedDate,
                    contractor_id: contractorOptions.find((opt) => opt.label === "Company Labour")?.id || null,
                    vendor_id: null,
                    project_id: siteOptions.find((opt) => opt.label === "Daily Wage")?.id || null,
                    type: "Daily",
                    amount: 0,
                    weekly_number: Number(selectedWeek),
                    status: false,
                    branch_id: activeBranchId,
                    entered_by: enteredBy,
                };
                await axios.post(
                    "https://backendaab.in/aabuildersDash/api/weekly-expenses/save-daily",
                    expenseForBackend,
                    { headers: { "Content-Type": "application/json" } }
                );
            }
            await refreshSelectedDateData();
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
        setSelectQuantity('');
        setSelectAmount('');
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
        if (selectQuantity.trim()) {
            if (!String(entry.quantity ?? '').toLowerCase().includes(selectQuantity.toLowerCase().trim())) return false;
        }
        if (selectAmount.trim()) {
            const entryAmount = Number(entry.amount || 0) + Number(entry.extra_amount || 0);
            if (!matchesEdbcAmountFilter(entryAmount, selectAmount)) return false;
        }
        if (!matchesWeeklyPaymentExpenseOverallSearch(entry, overallSearch, {
            formatDateOnly,
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
                            axios.get(`https://backendaab.in/aabuildersDash/api/daily-payments/date/${dateStr}`, withBranchParams()),
                            axios.get(`https://backendaab.in/aabuildersDash/api/refund_received/date/${dateStr}`, withBranchParams())
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
        setDescriptionRowId(row.id);
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
                "https://backendaab.in/aabuildersDash/api/files/upload",
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
                `https://backendaab.in/aabuildersDash/api/daily-payments/edit/${currentFileRow.id}?username=${encodeURIComponent(username)}`,
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
            clearPersistedRemovedFileUrlId(currentFileRow.id);
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
                `https://backendaab.in/aabuildersDash/api/daily-payments/${row.id}/remove-file`,
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
            persistRemovedFileUrlId(row.id);
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
                `https://backendaab.in/aabuildersDash/api/daily-payments/${row.id}/restore-file`,
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
            clearPersistedRemovedFileUrlId(row.id);
            if (currentFileRow?.id === row.id && restoredUrl) {
                setCurrentFileRow((prev) => (prev ? { ...prev, file_url: restoredUrl } : prev));
            }
            alert('File restored successfully!');
        } catch (error) {
            console.error('Error restoring file:', error);
            alert('Failed to restore file. Please try again.');
        }
    };
    const handleUpdate = async () => {
        const trimmedDescription = description.trim();
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
                description: trimmedDescription,
                file_url: currentExpense.file_url || null,
                branch_id: currentExpense.branch_id ?? currentExpense.branchId ?? activeBranchId ?? null,
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
                        ? { ...exp, description: trimmedDescription }
                        : exp
                )
            );
            setShowPopups(false);
            setEntryId(null);
            setDescriptionRowId(null);
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
            file_url: row.file_url || "",
            staff_advance_portal_id: row.staff_advance_portal_id || "",
        });
        editDailyExpenseOriginalRef.current = {
            date: row.date,
            labour_id: Number(row.labour_id) || null,
            vendor_id: Number(row.vendor_id) || null,
            contractor_id: Number(row.contractor_id) || null,
            employee_id: Number(row.employee_id) || null,
            project_id: Number(row.project_id),
            quantity: Number(row.quantity) || 0,
            type: row.type || "",
            type_id: getWeeklyExpenseTypeId(row.type || ""),
            amount: Number(row.amount),
            extra_amount: Number(row.extra_amount || 0),
            description: row.description || "",
            file_url: row.file_url || null,
            branch_id: row.branch_id ?? row.branchId ?? activeBranchId ?? null,
        };
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
                type_id: getWeeklyExpenseTypeId(editDailyExpenseData.type),
                amount: Number(editDailyExpenseData.amount),
                extra_amount: Number(editDailyExpenseData.extra_amount || 0),
                description: editDailyExpenseData.description || "",
                file_url: editDailyExpenseData.file_url || null,
                staff_advance_portal_id: editDailyExpenseData.staff_advance_portal_id || null,
                branch_id: row.branch_id ?? row.branchId ?? activeBranchId ?? null,
            };
            const wasStaffAdvance = row.type === "Staff Advance";
            const isNowStaffAdvance = editDailyExpenseData.type === "Staff Advance";
            const typeChangedFromStaffAdvance = wasStaffAdvance && !isNowStaffAdvance;
            const typeChangedToStaffAdvance = !wasStaffAdvance && isNowStaffAdvance;
            const amountChanged = Number(row.amount) !== Number(editDailyExpenseData.amount);
            const original = editDailyExpenseOriginalRef.current;
            const keysToCompare = [
                "date",
                "labour_id",
                "vendor_id",
                "contractor_id",
                "employee_id",
                "project_id",
                "quantity",
                "type",
                "type_id",
                "amount",
                "extra_amount",
                "description",
                "file_url",
                "branch_id",
            ];
            const hasChanges =
                !original ||
                keysToCompare.some((key) => {
                    const a = original[key];
                    const b = payload[key];
                    return a !== b;
                }) ||
                typeChangedFromStaffAdvance ||
                typeChangedToStaffAdvance;
            if (typeChangedFromStaffAdvance) {
                payload.staff_advance_portal_id = null;
                if (row.staff_advance_portal_id) {
                    try {
                        await clearStaffAdvancePortalEntry(
                            row.staff_advance_portal_id,
                            editDailyExpenseData.date || row.date,
                            row.entry_no
                        );
                    } catch (error) {
                        console.error("Error clearing staff advance portal:", error);
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
                        week_no: Number(selectedWeek),
                        staff_payment_mode: "Cash",
                        from_purpose_id: 5,
                        entry_no: entryNo,
                        branch_id: activeBranchId,
                        entered_by: enteredBy,
                        source: "Cash Register",
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
                        file_url: editDailyExpenseData.file_url || null,
                        branch_id: row.branch_id ?? row.branchId ?? activeBranchId ?? null,
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
            if (!hasChanges) {
                setEditingDailyExpenseRowId(null);
                return;
            }
            await axios.put(
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
            const refundData = refundPayments.find((refund) => refund.id === id);
            if (!refundData) return;
            const toNullableNumber = (value) => (value ? Number(value) : null);
            const hasChanges =
                toNullableNumber(refundData.labour_id) !== toNullableNumber(editRefundPaymentData.labour_id) ||
                toNullableNumber(refundData.vendor_id) !== toNullableNumber(editRefundPaymentData.vendor_id) ||
                toNullableNumber(refundData.contractor_id) !== toNullableNumber(editRefundPaymentData.contractor_id) ||
                toNullableNumber(refundData.employee_id) !== toNullableNumber(editRefundPaymentData.employee_id) ||
                Number(refundData.amount) !== Number(editRefundPaymentData.amount);
            if (!hasChanges) {
                setEditingPaymentId(null);
                return;
            }
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
                        `https://backendaab.in/aabuildersDash/api/staff-advance/${refundData.staff_advance_portal_id}?editedBy=${encodeURIComponent(username)}`,
                        staffAdvanceUpdatePayload,
                        { headers: { "Content-Type": "application/json" } }
                    );
                } catch (error) {
                    console.error("Error updating staff advance portal for refund:", error);
                }
            }
            const payload = {
                labour_id: editRefundPaymentData.labour_id ? Number(editRefundPaymentData.labour_id) : null,
                vendor_id: editRefundPaymentData.vendor_id ? Number(editRefundPaymentData.vendor_id) : null,
                contractor_id: editRefundPaymentData.contractor_id ? Number(editRefundPaymentData.contractor_id) : null,
                employee_id: editRefundPaymentData.employee_id ? Number(editRefundPaymentData.employee_id) : null,
                amount: Number(editRefundPaymentData.amount),
                branch_id: refundData?.branch_id ?? refundData?.branchId ?? activeBranchId ?? null,
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
    const clearStaffAdvancePortalEntry = async (staffAdvancePortalId, date, entry_no) => {
        if (!staffAdvancePortalId) return;
        let resolvedEntryNo = entry_no;
        if (resolvedEntryNo == null || resolvedEntryNo === "") {
            try {
                const response = await axios.get("https://backendaab.in/aabuildersDash/api/staff-advance/all");
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
    const handleDailyExpensesDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete This Daily Expense Data?");
        if (confirmed) {
            try {
                const expenseData = dailyExpenses.find((expense) => expense.id === id);
                if (expenseData?.staff_advance_portal_id) {
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
                const refundData = refundPayments.find((refund) => refund.id === id);
                if (refundData?.staff_advance_portal_id) {
                    try {
                        await clearStaffAdvancePortalEntry(
                            refundData.staff_advance_portal_id,
                            refundData.date,
                            refundData.entry_no
                        );
                    } catch (error) {
                        console.error("Error clearing staff advance portal for refund:", error);
                        alert("Failed to clear the associated Staff Advance Portal entry. Please try again.");
                        return;
                    }
                }
                if (refundData?.loan_portal_id) {
                    try {
                        await clearLoanPortalEntry(refundData.loan_portal_id, refundData.date, refundData.entry_no);
                    } catch (error) {
                        console.error("Error clearing loan portal for refund:", error);
                        alert("Failed to clear the associated Loan Portal entry. Please try again.");
                        return;
                    }
                }
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
                    "https://backendaab.in/aabuildersDash/api/daily-payments/getAll",
                    withBranchParams()
                );
                allDailyPayments = allDailyPaymentsResponse.data || [];
            } catch (error) {
                console.warn("getAll endpoint not available, using current date's expenses:", error);
                allDailyPayments = dailyExpenses;
            }
            // Get current week number and year using ISO calculation
            const now = new Date();
            const actualCurrentWeekNumber = getISOWeekNumber(now);
            const actualCurrentWeekYear = getWeekYear(now);

            // Calculate previous week number and year by going back 7 days from current week start
            // This correctly handles cases where previous week might be week 53 of previous year
            const { startDate: currentWeekStart } = getStartAndEndDateOfISOWeek(actualCurrentWeekNumber, actualCurrentWeekYear);
            const previousWeekDate = new Date(currentWeekStart);
            previousWeekDate.setDate(previousWeekDate.getDate() - 7);
            previousWeekDate.setHours(0, 0, 0, 0);
            const previousWeekNumber = getISOWeekNumber(previousWeekDate);
            const previousWeekYear = getWeekYear(previousWeekDate);

            // Filter expenses: exclude those from current week or previous week using ISO week calculation
            allDailyPayments = allDailyPayments.filter(expense => {
                if (!expense.date) return true;

                const expenseDate = new Date(expense.date);
                // Check if date is valid
                if (isNaN(expenseDate.getTime())) {
                    console.warn('Invalid date for expense:', expense);
                    return true; // Include invalid dates (let them pass through)
                }
                expenseDate.setHours(0, 0, 0, 0);

                // Calculate ISO week number and year for this expense
                const expenseWeekNumber = getISOWeekNumber(expenseDate);
                const expenseWeekYear = getWeekYear(expenseDate);

                // Exclude if expense is from current week
                if (expenseWeekNumber === actualCurrentWeekNumber && expenseWeekYear === actualCurrentWeekYear) {
                    return false;
                }

                // Exclude if expense is from previous week
                if (expenseWeekNumber === previousWeekNumber && expenseWeekYear === previousWeekYear) {
                    return false;
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
                `Are you sure you want to send ${expensesToSend.length} expense entry/entries (from ${originalExpenseCount} original expense(s)) to Expenses Entry?\n\nNote: Expenses from the actual current week (Week ${actualCurrentWeekNumber} of ${actualCurrentWeekYear}) and previous week (Week ${previousWeekNumber} of ${previousWeekYear}) will be excluded.${combinedMessage}`
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
                        paymentMode: "Cash",
                        branchId: expense.branch_id ?? expense.branchId ?? activeBranchId,
                        enteredBy: username,
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
    useEffect(() => {
        if (!onExportActionsReady) return;
        onExportActionsReady({ generatePDF: generateExpensesPDF, generateExcel: generateWeekDataExcel });
        return () => onExportActionsReady(null);
    }, [onExportActionsReady, generateExpensesPDF, generateWeekDataExcel]);
    const sendExpensesToolbarSlotElRef = useRef(null);
    const [sendExpensesToolbarSlot, setSendExpensesToolbarSlot] = useState(null);
    useEffect(() => {
        if (!isTabActive) {
            sendExpensesToolbarSlotElRef.current?.remove();
            sendExpensesToolbarSlotElRef.current = null;
            setSendExpensesToolbarSlot(null);
            return;
        }
        let cancelled = false;
        const attachSendExpensesToolbarSlot = () => {
            if (cancelled) return;
            const container = document.querySelector('.topbar-title.expense-entry-tabs .flex.items-center.gap-2.shrink-0');
            const exportWrapper = container?.querySelector('.relative.shrink-0');
            if (!container || !exportWrapper) {
                requestAnimationFrame(attachSendExpensesToolbarSlot);
                return;
            }
            const slot = document.createElement('span');
            slot.className = 'shrink-0';
            container.insertBefore(slot, exportWrapper);
            sendExpensesToolbarSlotElRef.current = slot;
            setSendExpensesToolbarSlot(slot);
        };
        attachSendExpensesToolbarSlot();
        return () => {
            cancelled = true;
            sendExpensesToolbarSlotElRef.current?.remove();
            sendExpensesToolbarSlotElRef.current = null;
            setSendExpensesToolbarSlot(null);
        };
    }, [isTabActive]);
    const expensesDstCol21Label = 'S.No';
    const expensesDstCol4Label = 'Associate';
    const expensesDstCol4EntryPlaceholder = isChangeButtonActive ? 'Labour Name' : 'Con/Ven/Emp';
    const expensesDstCol3Label = 'Project Name';
    const expensesDstCol8Label = 'Amount';
    const expensesDstCol12Label = 'Type';
    const expensesDstCol7Label = 'Quantity';
    const expensesDstCol20FileLabel = 'File';
    const expensesDstCol20ActivityLabel = 'Activity';
    const refundDstCol4Label = 'Associate';
    const refundDstCol4EntryPlaceholder = isRefundChangeButtonActive ? 'Labour Name' : 'Con/Ven/Emp';
    const refundDstCol8Label = 'Amount';
    const refundDstCol20Label = 'Activity';
    return (
        <body className="bg-[#FAF6ED] overflow-hidden">
            <div className="flex flex-col h-[calc(100vh-104px)] overflow-hidden bg-[#FAF6ED] px-[10px] min-[400px]:px-[14px] md:px-[18px] pt-[10px] min-[400px]:pt-[14px] md:pt-[18px] pb-[10px] min-[400px]:pb-[14px] md:pb-[18px]">
                <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-[#FAF6ED]">
                    <div className="w-full rounded-[6px] bg-white mb-[18px] shrink-0">
                        <div className="flex flex-wrap items-center justify-between text-left max-md:flex-col max-md:items-stretch">
                            <div className="flex-1 min-w-0 overflow-visible p-[10px] min-[400px]:p-[14px] md:p-[18px]">
                                <div className="flex flex-wrap gap-[8px] min-[400px]:gap-[10px] md:gap-[12px] items-end text-left">
                                    {(() => {
                                        const entryCheckLikeSelectStyles = {
                                            control: (provided, state) => ({
                                                ...provided,
                                                backgroundColor: 'transparent',
                                                fontSize: '14px',
                                                border: '2px solid rgba(191, 152, 83, 0.2)',
                                                borderRadius: '8px',
                                                minHeight: '40px',
                                                fontWeight: 'medium',
                                                height: '40px',
                                                flexWrap: 'nowrap',
                                                boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                                                '&:hover': { borderColor: 'rgba(191, 152, 83, 0.4)' },
                                            }),
                                            valueContainer: (provided) => ({
                                                ...provided,
                                                flexWrap: 'nowrap',
                                                overflow: 'hidden',
                                                paddingLeft: '12px',
                                                paddingRight: '2px',
                                                height: '36px',
                                                alignItems: 'center',
                                            }),
                                            placeholder: (provided) => ({
                                                ...provided,
                                                color: '#999',
                                                textAlign: 'left',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxWidth: '100%',
                                                position: 'absolute',
                                            }),
                                            menu: (provided) => ({ ...provided, zIndex: 9999, maxHeight: 288 }),
                                            menuList: (provided) => ({
                                                ...provided,
                                                maxHeight: 288,
                                                paddingTop: 0,
                                                paddingBottom: 0,
                                                overflowY: 'auto',
                                                scrollbarWidth: 'none',
                                                msOverflowStyle: 'none',
                                                '&::-webkit-scrollbar': { display: 'none' },
                                            }),
                                            option: (provided, state) => ({
                                                ...provided,
                                                minHeight: 36,
                                                height: 36,
                                                paddingTop: 0,
                                                paddingBottom: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                textAlign: 'left',
                                                fontWeight: 'normal',
                                                fontSize: '15px',
                                                backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                color: 'black',
                                            }),
                                            singleValue: (provided) => ({
                                                ...provided,
                                                textAlign: 'left',
                                                color: 'black',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                maxWidth: '100%',
                                            }),
                                            input: (provided) => ({
                                                ...provided,
                                                margin: 0,
                                                padding: 0,
                                                whiteSpace: 'nowrap',
                                            }),
                                            dropdownIndicator: (provided, state) => ({
                                                ...provided,
                                                display: state.hasValue && state.selectProps.isClearable ? 'none' : 'flex',
                                                color: '#000000',
                                                flexShrink: 0,
                                            }),
                                            clearIndicator: (provided) => ({
                                                ...provided,
                                                cursor: 'pointer',
                                                color: '#000000',
                                                flexShrink: 0,
                                            }),
                                            indicatorSeparator: () => ({ display: 'none' }),
                                        };
                                        const entryCheckLikeSelectClassNames = {
                                            menuList: () => 'no-scrollbar scrollbar-none',
                                            valueContainer: () => '!flex-nowrap !overflow-hidden',
                                            placeholder: () => '!whitespace-nowrap !overflow-hidden !text-ellipsis',
                                            singleValue: () => '!whitespace-nowrap !overflow-hidden !text-ellipsis !font-semibold',
                                        };
                                        const formatWeekOptionDate = (date) =>
                                            date.toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "long"
                                            });
                                        const weekSelectOptions = weeks.map((week) => ({
                                            value: String(week.number),
                                            label: `Week ${week.number}, ${formatWeekOptionDate(new Date(week.start))} to ${formatWeekOptionDate(new Date(week.end))}`,
                                        }));
                                        const yearSelectOptions = years.map((y) => ({ value: String(y), label: String(y) }));
                                        return (
                                            <>
                                                <div className="min-w-0">
                                                    <h1 className='font-semibold mb-[8px]'>Select Week</h1>
                                                    <Select
                                                        className="min-w-0 w-[260px]"
                                                        classNames={entryCheckLikeSelectClassNames}
                                                        options={weekSelectOptions}
                                                        value={weekSelectOptions.find((opt) => opt.value === String(selectedWeek)) || null}
                                                        onChange={(opt) => setSelectedWeek(opt ? opt.value : "")}
                                                        placeholder="Select Week"
                                                        isSearchable
                                                        isClearable
                                                        styles={entryCheckLikeSelectStyles}
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <label className="block font-semibold mb-[8px]">Year</label>
                                                    <Select
                                                        className="min-w-0 w-[120px]"
                                                        classNames={entryCheckLikeSelectClassNames}
                                                        options={yearSelectOptions}
                                                        value={yearSelectOptions.find((opt) => opt.value === String(year)) || null}
                                                        onChange={(opt) => setYear(opt ? opt.value : getCurrentWeekYear().toString())}
                                                        placeholder="Year"
                                                        isSearchable
                                                        isClearable
                                                        styles={entryCheckLikeSelectStyles}
                                                    />
                                                </div>
                                                <div className="min-w-0 shrink-0">
                                                    <label className="block font-semibold mb-[8px]">Weekly Balance</label>
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={`₹${balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                                        className="min-w-0 w-[150px] h-[40px] px-3 text-[#000000] text-left text-[14px] font-semibold bg-[#ededed] border-2 border-[rgba(191,152,83,0.2)] rounded-lg focus:outline-none"
                                                    />
                                                </div>
                                            </>
                                        );
                                    })()}
                                    {weekDays.length > 0 && (() => {
                                        const selectedDayIndex = weekDays.findIndex(
                                            (day) => day.toISOString().split("T")[0] === selectedDate
                                        );
                                        return (
                                            <div className="relative flex items-center rounded-lg bg-[#FFFDF9] border border-[#FFEBC9] shrink-0 w-fit max-w-full overflow-x-auto no-scrollbar scrollbar-none">
                                                {selectedDayIndex >= 0 && (
                                                    <div
                                                        className="absolute top-0 bottom-0 rounded-md bg-[#BF9853] transition-all duration-700 ease-in-out"
                                                        style={{
                                                            width: `${100 / weekDays.length}%`,
                                                            left: `${(selectedDayIndex * 100) / weekDays.length}%`,
                                                        }}
                                                    />
                                                )}
                                                {weekDays.map((day, idx) => {
                                                    const dateStr = day.toISOString().split("T")[0];
                                                    const isSelected = selectedDate === dateStr;
                                                    return (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => handleDateClick(dateStr)}
                                                            className={`relative z-10 flex shrink-0 flex-col items-center w-[44px] min-[400px]:w-[52px] sm:w-[58px] md:w-[73px] pt-[6px] pb-[6px] min-[400px]:pt-[8px] min-[400px]:pb-[7px] md:pt-[10px] md:pb-[8px] px-[3px] min-[400px]:px-[5px] sm:px-[8px] md:px-[14px] rounded-md transition-colors duration-300 ${isSelected ? 'text-white' : 'text-black'}`}
                                                        >
                                                            <span className="text-[10px] min-[400px]:text-[11px] sm:text-[12px] md:text-[14px] font-semibold leading-tight">
                                                                {day.toLocaleDateString("en-US", { weekday: "short" })}
                                                            </span>
                                                            <span className="text-[10px] min-[400px]:text-[11px] sm:text-[12px] md:text-[14px] font-semibold leading-tight mt-[2px] whitespace-nowrap">
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
                                            ₹{Number(netAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full p-[18px] border-collapse bg-[#FFFFFF] rounded-md flex flex-col flex-1 min-h-0 overflow-hidden max-xl:overflow-y-auto max-xl:overflow-x-hidden no-scrollbar scrollbar-none">
                        <div className="w-full flex flex-col xl:flex-row gap-[18px] flex-1 min-h-0 overflow-hidden max-xl:flex-none max-xl:overflow-x-auto no-scrollbar scrollbar-none">
                            <div className="shrink-0 w-fit max-w-full flex flex-col min-h-0 overflow-hidden max-xl:flex-none max-xl:overflow-x-auto no-scrollbar scrollbar-none">
                                <div className="w-full max-w-full xl:w-[1258px] xl:max-w-[1258px] flex flex-col shrink-0 self-start flex-1 min-h-0 overflow-hidden">
                                    <div className="flex justify-between items-center mb-[8px] w-full">
                                        <h1 className="font-bold text-base">Expenses (PS {selectedWeek ?? "-"})</h1>
                                        <h1 className="font-bold text-base" style={{ color: "#E4572E" }}>
                                            ₹{Number(filteredExpenses.reduce((total, expense) => total + Number(expense.amount || 0), 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </h1>
                                    </div>
                                    <div className="mb-[12px] w-full max-w-full min-w-0 min-h-[34px] shrink-0 flex flex-row flex-nowrap items-center justify-between gap-[6px] overflow-hidden">
                                        <div className="flex flex-row flex-nowrap items-center gap-[6px] min-w-0 flex-1 overflow-hidden">
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
                                                onMouseDown={(e) => handleMouseDown(e, expensesFilterChipsRef)}
                                                onMouseMove={(e) => handleMouseMove(e, expensesFilterChipsRef)}
                                                onMouseUp={() => handleMouseUp(expensesFilterChipsRef)}
                                                onMouseLeave={() => handleMouseUp(expensesFilterChipsRef)}
                                            >
                                                {selectContractororVendorName && (
                                                    <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                        <span className="font-medium text-[#BF9853]">{expensesDstCol4Label}: </span>
                                                        <span className="font-semibold text-[14px]">{selectContractororVendorName}</span>
                                                        <button type="button" onClick={() => setSelectContractororVendorName('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                                    </span>
                                                )}
                                                {selectProjectName && (
                                                    <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                        <span className="font-medium text-[#BF9853]">{expensesDstCol3Label}: </span>
                                                        <span className="font-semibold text-[14px]">{selectProjectName}</span>
                                                        <button type="button" onClick={() => setSelectProjectName('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                                    </span>
                                                )}
                                                {selectType && (
                                                    <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                        <span className="font-medium text-[#BF9853]">{expensesDstCol12Label}: </span>
                                                        <span className="font-semibold text-[14px]">{selectType}</span>
                                                        <button type="button" onClick={() => setSelectType('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                                    </span>
                                                )}
                                                {selectAmount.trim() && (
                                                    <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                        <span className="font-medium text-[#BF9853]">{expensesDstCol8Label}: </span>
                                                        <span className="font-semibold text-[14px]">{selectAmount}</span>
                                                        <button type="button" onClick={() => setSelectAmount('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                                    </span>
                                                )}
                                                {selectQuantity.trim() && (
                                                    <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                        <span className="font-medium text-[#BF9853]">{expensesDstCol7Label}: </span>
                                                        <span className="font-semibold text-[14px]">{selectQuantity}</span>
                                                        <button type="button" onClick={() => setSelectQuantity('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <EdbcTableToolbarRightActions
                                            onClearFilters={clearFilters}
                                            overallSearch={overallSearch}
                                            onOverallSearchChange={setOverallSearch}
                                            wrapperClassName="flex items-center gap-[6px] min-w-0 z-[2] bg-white pl-[4px] shrink-0"
                                        />
                                    </div>
                                    <div className="w-full flex-1 min-h-0 rounded-lg border-l-8 border-l-[#BF9853] overflow-hidden">
                                        <div ref={scrollRef} className="w-full flex-1 min-h-0 overflow-y-auto overflow-x-auto h-full no-scrollbar scrollbar-none select-none" onWheel={() => { filterNudgeUsedRef.current = false; }} onMouseDown={(e) => handleMouseDown(e, scrollRef)} onMouseMove={(e) => handleMouseMove(e, scrollRef)}
                                            onMouseUp={() => handleMouseUp(scrollRef)} onMouseLeave={() => handleMouseUp(scrollRef)} >
                                            <table className={`border-collapse text-left ${DAILY_HISTORY_EXPENSES_TABLE_FIXED_WIDTH_CLASS} table-fixed ${EDBC_TABLE_EDGE_TABLE_CLASS} ${DAILY_HISTORY_EXPENSES_TBODY_EDBC8_LOCK_TABLE_CLASS} ${DAILY_HISTORY_EXPENSES_TBODY_TABLE_LOCK_TABLE_CLASS} [&_tbody_tr]:!h-[40px] [&_tbody_tr]:!max-h-[40px] [&_tbody_tr>td]:box-border [&_tbody_tr>td]:!h-[40px] [&_tbody_tr>td]:!max-h-[40px] [&_tbody_tr>td]:!py-0 [&_tbody_tr>td]:!leading-none [&_tbody_tr:has(td#EDBC-8:hover)]:!relative [&_tbody_tr:has(td#EDBC-8:hover)]:!overflow-visible [&_tbody_tr:has(td#EDBC-8:hover)]:!z-[50] [&_thead_tr>th#EDBC-19]:!pr-[1px] [&_tbody_tr>td#EDBC-19]:!pr-[1px] [&_th#EDBC-20]:!w-[70px] [&_td#EDBC-20]:!w-[70px] [&_th#EDBC-20]:!min-w-[70px] [&_td#EDBC-20]:!min-w-[70px] [&_th#EDBC-20]:!max-w-[70px] [&_td#EDBC-20]:!max-w-[70px]`}>
                                                <colgroup>
                                                    <col style={{ width: '70px' }} />
                                                    <col style={{ width: '218px' }} />
                                                    <col style={{ width: '30px' }} />
                                                    <col style={{ width: '298px' }} />
                                                    <col style={{ width: '158px' }} />
                                                    <col style={{ width: '120px' }} />
                                                    <col style={{ width: '20px' }} />
                                                    <col style={{ width: '66px' }} />
                                                    <col style={{ width: '88px' }} />
                                                    <col style={{ width: '30px' }} />
                                                    <col style={{ width: '70px' }} />
                                                    <col style={{ width: '70px' }} />
                                                    <col style={{ width: '12px' }} />
                                                </colgroup>
                                                <thead className="sticky top-0 z-10 bg-white">
                                                    <EdbcTableHeaderRow>
                                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC21} label={expensesDstCol21Label} />
                                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC4} label={expensesDstCol4Label} sortProps={edbcSortProps} />
                                                        <th className={EDBC_CASH_REGISTER_CHANGE_COLUMN_CLASS} aria-hidden="true"></th>
                                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC3} label={expensesDstCol3Label} sortProps={edbcSortProps} />
                                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC12} label={expensesDstCol12Label} sortProps={edbcSortProps} />
                                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC8} label={expensesDstCol8Label} sortProps={edbcSortProps} />
                                                        <th className="w-[20px] min-w-[20px] max-w-[20px] p-0 overflow-visible" aria-hidden="true"></th>
                                                        <th className=" w-[66px] font-bold text-center" aria-hidden="true"></th>
                                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC7} label={expensesDstCol7Label} sortProps={edbcSortProps} />
                                                        <th className={EDBC_CASH_REGISTER_CHANGE_COLUMN_CLASS} aria-hidden="true"></th>
                                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC20} label={expensesDstCol20FileLabel} />
                                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC20} label={expensesDstCol20ActivityLabel} />
                                                        <th className="w-[12px] min-w-[12px] max-w-[12px] p-0" aria-hidden="true"></th>
                                                    </EdbcTableHeaderRow>
                                                    {showFilters && (
                                                        <EdbcTableFilterRow ref={filterRowRef}>
                                                            <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC21} />
                                                            <EdbcSelectFilter
                                                                columnId={EDBC_IDS.EDBC4}
                                                                placeholder={expensesDstCol4Label}
                                                                options={contractorVendorFilterOptions}
                                                                value={selectContractororVendorName}
                                                                onChange={setSelectContractororVendorName}
                                                                selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                                                            />
                                                            <th className={EDBC_CASH_REGISTER_CHANGE_COLUMN_CLASS} aria-hidden="true"></th>
                                                            <EdbcProjectNameFilter
                                                                placeholder={expensesDstCol3Label}
                                                                options={projectFilterOptions}
                                                                value={selectProjectName}
                                                                onChange={setSelectProjectName}
                                                                selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                                                            />
                                                            <EdbcSelectFilter
                                                                columnId={EDBC_IDS.EDBC12}
                                                                placeholder={expensesDstCol12Label}
                                                                options={typeFilterOptions}
                                                                value={selectType}
                                                                onChange={setSelectType}
                                                                selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                                                            />
                                                            <EdbcTotalAmountFilter
                                                                columnId={EDBC_IDS.EDBC8}
                                                                totalAmount={filteredExpenses.reduce((total, expense) => total + Number(expense.amount || 0), 0)}
                                                                value={selectAmount}
                                                                onChange={(e) => setSelectAmount(e.target.value)}
                                                            />
                                                            <th className="w-[20px] min-w-[20px] max-w-[20px] p-0 overflow-visible"></th>
                                                            <th className="pl-[6px] w-[66px]"></th>
                                                            <EdbcTextInputFilter
                                                                columnId={EDBC_IDS.EDBC7}
                                                                placeholder={expensesDstCol7Label}
                                                                value={selectQuantity}
                                                                onChange={(e) => setSelectQuantity(e.target.value)}
                                                            />
                                                            <th className={EDBC_CASH_REGISTER_CHANGE_COLUMN_CLASS} aria-hidden="true"></th>
                                                            <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC20} />
                                                            <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC20} />
                                                            <th className="w-[12px] min-w-[12px] max-w-[12px] p-0" aria-hidden="true"></th>
                                                        </EdbcTableFilterRow>
                                                    )}
                                                    {canEditSelectedWeek && (
                                                        <tr className="bg-white items-center justify-center !h-[40px] !max-h-[40px] [&>td]:box-border [&>td]:!h-[40px] [&>td]:!max-h-[40px] [&>td]:!py-0 [&>td]:!leading-none overflow-hidden">
                                                            <td id={EDBC_IDS.EDBC21} className={getEdbcColumnConfig(EDBC_IDS.EDBC21)?.tdClass}>{dailyExpenses.length + 1}.</td>
                                                            <td id={EDBC_IDS.EDBC4} className={getEdbcColumnConfig(EDBC_IDS.EDBC4)?.tdClass}>
                                                                <div className={getEdbcColumnConfig(EDBC_IDS.EDBC4)?.filterWidthClass}>
                                                                    <Select
                                                                        name="labour_id"
                                                                        className="text-xs focus:outline-none w-full"
                                                                        placeholder={expensesDstCol4EntryPlaceholder}
                                                                        isSearchable
                                                                        isClearable
                                                                        options={isChangeButtonActive ? laboursList : combinedOptions}
                                                                        styles={CASH_REGISTER_SELECT_STYLES}
                                                                        menuPortalTarget={document.body}
                                                                        value={
                                                                            isChangeButtonActive
                                                                                ? laboursList.find(opt => opt.id === Number(newDailyExpense.labour_id)) || null
                                                                                : combinedOptions.find(opt =>
                                                                                    (opt.type === "Employee" && opt.id === Number(newDailyExpense.employee_id)) ||
                                                                                    (opt.type === "Vendor" && opt.id === Number(newDailyExpense.vendor_id)) ||
                                                                                    (opt.type === "Contractor" && opt.id === Number(newDailyExpense.contractor_id))
                                                                                ) || null
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
                                                            </td>
                                                            <td className="w-[30px] px-[6px] overflow-visible align-middle">
                                                                <div className="flex items-center justify-center h-[40px]">
                                                                    <button type="button" onClick={handleChangeButtonClick} className="inline-flex items-center justify-center">
                                                                        <img src={Change} className={`w-4 h-4 ${isChangeButtonActive ? 'opacity-10' : ''}`} alt="Toggle name type" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td id={EDBC_IDS.EDBC3} className={getEdbcColumnConfig(EDBC_IDS.EDBC3)?.tdClass}>
                                                                <div className="min-w-0 w-full">
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
                                                                        className="text-xs focus:outline-none w-full"
                                                                        placeholder={expensesDstCol3Label}
                                                                        isSearchable
                                                                        isClearable
                                                                        styles={CASH_REGISTER_SELECT_STYLES}
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td id={EDBC_IDS.EDBC12} className={getEdbcColumnConfig(EDBC_IDS.EDBC12)?.tdClass}>
                                                                <div className="min-w-0 w-full">
                                                                    <Select
                                                                        name="type"
                                                                        className="text-xs focus:outline-none w-full"
                                                                        value={newDailyExpense.type ? { value: newDailyExpense.type, label: newDailyExpense.type } : null}
                                                                        onChange={(selectedOption) => handleInputChange({ target: { name: 'type', value: selectedOption ? selectedOption.value : '' } })}
                                                                        options={(isChangeButtonActive ? weeklyTypes : expensesCategory).map((type) => ({
                                                                            value: isChangeButtonActive ? type.type : type.category,
                                                                            label: isChangeButtonActive ? type.type : type.category,
                                                                        }))}
                                                                        placeholder={expensesDstCol12Label}
                                                                        isSearchable
                                                                        isClearable
                                                                        menuPortalTarget={document.body}
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
                                                            <td className="w-[20px] min-w-[20px] max-w-[20px] overflow-visible align-middle">
                                                                <div className="flex items-center justify-center h-[40px]">
                                                                    <button onClick={() => setShowExtraAmount(prev => !prev)} type="button" className="inline-flex pl-[6px] items-center justify-center h-4 w-4 shrink-0">
                                                                        <img src={showExtraAmount ? ExtraFeildClose : ExtraFeild} className={`h-4 w-4 min-h-4 min-w-4 max-h-4 max-w-4 shrink-0 object-contain origin-center ${showExtraAmount ? 'scale-[1.375]' : ''}`} alt="Extra" />
                                                                    </button>
                                                                </div>
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
                                                            <td className="w-[30px] px-[6px] overflow-visible flex items-center justify-center h-[40px]"></td>
                                                            <td id={EDBC_IDS.EDBC20} className={getEdbcColumnConfig(EDBC_IDS.EDBC20)?.tdClass}>
                                                            </td>
                                                            <td id={EDBC_IDS.EDBC20} className={getEdbcColumnConfig(EDBC_IDS.EDBC20)?.tdClass}>
                                                            </td>
                                                            <td className="w-[12px] min-w-[12px] max-w-[12px] p-0"></td>
                                                        </tr>
                                                    )}
                                                </thead>
                                                <tbody>
                                                    {sortedDailyExpenses
                                                        .filter(row => row.date === selectedDate)
                                                        .reverse()
                                                        .map((row, index) => (
                                                            <EdbcTableBodyRow key={row.id} className="!h-[40px] !max-h-[40px] [&>td]:box-border [&>td]:!h-[40px] [&>td]:!max-h-[40px] [&>td]:!py-0 [&>td]:!leading-none">
                                                                <td id={EDBC_IDS.EDBC21} className={getEdbcColumnConfig(EDBC_IDS.EDBC21)?.tdClass}>{dailyExpenses.length - index}</td>
                                                                <td id={EDBC_IDS.EDBC4} className={getEdbcColumnConfig(EDBC_IDS.EDBC4)?.tdClass}>
                                                                    <div className={`${getEdbcColumnConfig(EDBC_IDS.EDBC4)?.filterWidthClass} h-[40px] flex items-center`}>
                                                                        {editingDailyExpenseRowId === row.id && canEditSelectedWeek ? (
                                                                            <Select
                                                                                name="labour_id"
                                                                                className="text-xs focus:outline-none w-full"
                                                                                placeholder={expensesDstCol4Label}
                                                                                isSearchable
                                                                                isClearable
                                                                                options={isChangeButtonActive ? laboursList : combinedOptions}
                                                                                styles={CASH_REGISTER_SELECT_STYLES}
                                                                                menuPortalTarget={document.body}
                                                                                value={
                                                                                    isChangeButtonActive
                                                                                        ? laboursList.find(opt => opt.id === Number(editDailyExpenseData.labour_id)) || null
                                                                                        : combinedOptions.find(opt =>
                                                                                            (opt.type === "Employee" && opt.id === Number(editDailyExpenseData.employee_id)) ||
                                                                                            (opt.type === "Vendor" && opt.id === Number(editDailyExpenseData.vendor_id)) ||
                                                                                            (opt.type === "Contractor" && opt.id === Number(editDailyExpenseData.contractor_id))
                                                                                        ) || null
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
                                                                <td className={EDBC_CASH_REGISTER_CHANGE_COLUMN_CLASS} aria-hidden="true"></td>
                                                                <td id={EDBC_IDS.EDBC3} className={getEdbcColumnConfig(EDBC_IDS.EDBC3)?.tdClass}>
                                                                    {editingDailyExpenseRowId === row.id && canEditSelectedWeek ? (
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
                                                                <td id={EDBC_IDS.EDBC12} className={getEdbcColumnConfig(EDBC_IDS.EDBC12)?.tdClass}>
                                                                    {editingDailyExpenseRowId === row.id && canEditSelectedWeek ? (
                                                                        <div className={getEdbcColumnConfig(EDBC_IDS.EDBC12)?.filterWidthClass}>
                                                                            <Select
                                                                                name="type"
                                                                                className="text-xs focus:outline-none w-full"
                                                                                value={editDailyExpenseData.type ? { value: editDailyExpenseData.type, label: editDailyExpenseData.type } : null}
                                                                                onChange={(selectedOption) => setEditDailyExpenseData(prev => ({ ...prev, type: selectedOption ? selectedOption.value : '' }))}
                                                                                options={(isChangeButtonActive ? weeklyTypes : expensesCategory).map((type) => ({
                                                                                    value: isChangeButtonActive ? type.type : type.category,
                                                                                    label: isChangeButtonActive ? type.type : type.category,
                                                                                }))}
                                                                                placeholder={expensesDstCol12Label}
                                                                                isSearchable
                                                                                isClearable
                                                                                menuPortalTarget={document.body}
                                                                                styles={CASH_REGISTER_SELECT_STYLES}
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <div className={`${getEdbcColumnConfig(EDBC_IDS.EDBC12)?.filterWidthClass || ''} h-[40px] flex items-center min-w-0`}>
                                                                            <span
                                                                                className="block w-full truncate whitespace-nowrap overflow-hidden"
                                                                                title={row.type || ""}
                                                                            >
                                                                                {row.type}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td id={EDBC_IDS.EDBC8} className={`${getEdbcColumnConfig(EDBC_IDS.EDBC8)?.tdClass} relative group hover:z-[100]`}>
                                                                    {editingDailyExpenseRowId === row.id && canEditSelectedWeek ? (
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
                                                                            <div className="relative h-[40px] flex flex-col justify-center leading-tight cursor-default text-right">
                                                                                <span>
                                                                                    {formatEdbcTotalAmountPlaceholder(Number((row.amount || 0) + (row.extra_amount || 0)))}
                                                                                </span>
                                                                                <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block bg-black text-white text-xs rounded p-2 z-[100] shadow-lg whitespace-nowrap pointer-events-none">
                                                                                    Amount: {Number(row.amount || 0).toLocaleString('en-IN')} <br />
                                                                                    Extra Amount: {Number(row.extra_amount || 0).toLocaleString('en-IN')}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className={EDBC_CASH_REGISTER_EXTRA_FIELD_BUTTON_COLUMN_CLASS}></td>
                                                                <td className={`${EDBC_CASH_REGISTER_EXTRA_AMOUNT_COLUMN_CLASS} text-center`}>
                                                                    {editingDailyExpenseRowId === row.id && canEditSelectedWeek ? (
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
                                                                <td id={EDBC_IDS.EDBC7} className={getEdbcColumnConfig(EDBC_IDS.EDBC7)?.tdClass}>
                                                                    <div className="w-[60px] h-[40px] flex items-center">
                                                                        {editingDailyExpenseRowId === row.id && canEditSelectedWeek ? (
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
                                                                <td className={`${EDBC_CASH_REGISTER_DESCRIPTION_COLUMN_CLASS} flex items-center justify-center h-[40px]`}>
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
                                                                </td>
                                                                <td id={EDBC_IDS.EDBC20} className={getEdbcColumnConfig(EDBC_IDS.EDBC20)?.tdClass}>
                                                                    <div className="flex w-full items-center justify-center">
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
                                                                                    {canRemoveFileUrl && canEditSelectedWeek && (
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
                                                                                <span className="inline-flex items-center gap-2">
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleFileUploadClick(row)}
                                                                                        className="inline-flex h-4 w-4 shrink-0 items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                                                                        title="Upload File"
                                                                                        disabled={!canEditSelectedWeek}
                                                                                    >
                                                                                        <img
                                                                                            src={fileUpload}
                                                                                            className={`w-4 h-4 ${canEditSelectedWeek ? 'opacity-70 hover:opacity-100' : 'opacity-30'}`}
                                                                                            alt="Upload File"
                                                                                        />
                                                                                    </button>
                                                                                    {canRemoveFileUrl && canEditSelectedWeek && removedFileUrlRows[row.id] ? (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => handleRestoreFileUrl(row)}
                                                                                            className="inline-flex shrink-0"
                                                                                            title="Restore Removed File"
                                                                                        >
                                                                                            <img src={restore} alt="" className="w-4 h-4" />
                                                                                        </button>
                                                                                    ) : null}
                                                                                </span>
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td id={EDBC_IDS.EDBC20} className={getEdbcColumnConfig(EDBC_IDS.EDBC20)?.tdClass}>
                                                                    {canEditSelectedWeek && (
                                                                        <div className="flex gap-1 justify-center">
                                                                            {editingDailyExpenseRowId === row.id ? (
                                                                                <span className="inline-flex w-5 h-4 shrink-0 items-center justify-center">
                                                                                    <button className="text-green-600 font-bold text-lg relative z-10" onClick={() => saveEditedExpense(row)}>
                                                                                        ✓
                                                                                    </button>
                                                                                </span>
                                                                            ) : (
                                                                                <span className="inline-flex w-5 h-4 shrink-0 items-center justify-center">
                                                                                    {hasEditPermission ? (
                                                                                        <button onClick={() => handleEditClick(row)}>
                                                                                            <img className="w-5 h-4" src={Edit} alt="Edit" />
                                                                                        </button>
                                                                                    ) : (
                                                                                        <img className="w-5 h-4 opacity-40 cursor-not-allowed" src={Edit} alt="Edit Disabled" />
                                                                                    )}
                                                                                </span>
                                                                            )}
                                                                            <span className="inline-flex w-5 h-4 shrink-0 items-center justify-center">
                                                                                {hasDeletePermission ? (
                                                                                    <button type="button" onClick={() => handleDailyExpensesDelete(row.id)}>
                                                                                        <img src={Delete} className="w-5 h-4" alt="Delete" />
                                                                                    </button>
                                                                                ) : (
                                                                                    <img className="w-5 h-4 opacity-40 cursor-not-allowed" src={Delete} alt="Delete Disabled" />
                                                                                )}
                                                                            </span>
                                                                            <span className="inline-flex w-5 h-4 shrink-0 items-center justify-center">
                                                                                <button type="button" onClick={() => fetchAuditDetailsForDailyExpense(row.id)}>
                                                                                    <img className="w-5 h-4" src={history} alt="History" />
                                                                                </button>
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className="w-[12px] min-w-[12px] max-w-[12px] p-0"></td>
                                                            </EdbcTableBodyRow>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-fit shrink-0 flex flex-col min-h-0 overflow-hidden max-xl:flex-none max-xl:overflow-x-auto no-scrollbar scrollbar-none xl:h-full max-xl:h-auto max-xl:w-full">
                                <div className="flex flex-col flex-1 min-h-0 max-xl:w-full">
                                <div className="w-[502px] max-w-full shrink-0 self-start flex flex-col">
                                    <div className="flex justify-between items-center mb-[8px] w-full">
                                        <h1 className="font-bold text-base">Refund Received</h1>
                                        <h1 className="font-bold text-base" style={{ color: "#E4572E" }}>
                                            ₹{Number(totalRefund).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </h1>
                                    </div>
                                    <div className="mb-[12px] w-full max-w-full min-w-0 min-h-[34px] shrink-0 flex flex-row flex-nowrap items-center justify-between gap-[6px] overflow-hidden">
                                        <div className="flex flex-row flex-nowrap items-center gap-[6px] min-w-0 flex-1 overflow-hidden">
                                            <div className="shrink-0 flex items-center z-[2] bg-white">
                                                <EdbcFilterToggleButton
                                                    onClick={() => {
                                                        const willOpen = !showRefundFilters;
                                                        const scroller = refundScrollRef.current;
                                                        if (willOpen) {
                                                            setShowRefundFilters(true);
                                                            if (!scroller) return;
                                                            if (scroller.scrollTop <= 0) return;
                                                            if (refundFilterNudgeUsedRef.current) return;
                                                            refundFilterNudgeUsedRef.current = true;
                                                            requestAnimationFrame(() => {
                                                                requestAnimationFrame(() => {
                                                                    const h = refundFilterRowRef.current?.offsetHeight || 0;
                                                                    if (h > 0) {
                                                                        scroller.scrollTop = Math.max(0, scroller.scrollTop - h);
                                                                    }
                                                                });
                                                            });
                                                            return;
                                                        }
                                                        const h = refundFilterRowRef.current?.offsetHeight || 0;
                                                        setShowRefundFilters(false);
                                                        if (!scroller || h <= 0 || !refundFilterNudgeUsedRef.current) return;
                                                        refundFilterNudgeUsedRef.current = false;
                                                        requestAnimationFrame(() => {
                                                            requestAnimationFrame(() => {
                                                                scroller.scrollTop = scroller.scrollTop + h;
                                                            });
                                                        });
                                                    }}
                                                />
                                            </div>
                                            <div
                                                ref={refundFilterChipsRef}
                                                className="w-0 flex-1 min-w-0 flex flex-row flex-nowrap items-center gap-[6px] overflow-x-auto overflow-y-hidden no-scrollbar scrollbar-none cursor-grab max-xl:w-auto max-xl:flex-none max-xl:shrink"
                                                onMouseDown={(e) => handleMouseDown(e, refundFilterChipsRef, true)}
                                                onMouseMove={(e) => handleMouseMove(e, refundFilterChipsRef)}
                                                onMouseUp={() => handleMouseUp(refundFilterChipsRef)}
                                                onMouseLeave={() => handleMouseUp(refundFilterChipsRef)}
                                            >
                                                {selectRefundName && (
                                                    <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit">
                                                        <span className="font-medium text-[#BF9853]">{refundDstCol4Label}: </span>
                                                        <span className="font-semibold text-[14px]">{selectRefundName}</span>
                                                        <button type="button" onClick={() => setSelectRefundName('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                                                    </span>
                                                )}
                                                {selectRefundAmount.trim() && (
                                                    <span className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit">
                                                        <span className="font-medium text-[#BF9853]">{refundDstCol8Label}: </span>
                                                        <span className="font-semibold text-[14px]">{selectRefundAmount}</span>
                                                        <button type="button" onClick={() => setSelectRefundAmount('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <EdbcTableToolbarRightActions
                                            onClearFilters={clearRefundFilters}
                                            overallSearch={refundOverallSearch}
                                            onOverallSearchChange={setRefundOverallSearch}
                                            wrapperClassName="flex items-center gap-[6px] min-w-0 z-[2] bg-white pl-[4px] shrink-0"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col flex-1 min-h-0 max-xl:flex-row max-xl:flex-wrap max-xl:items-start max-xl:gap-x-[18px] max-xl:gap-y-[12px] w-full">
                                <div className="w-[502px] max-w-full shrink-0 self-start flex flex-col">
                                    <div className="w-fit max-w-full flex flex-col shrink-0">
                                        <div
                                            ref={refundScrollRef}
                                            className="rounded-lg border-l-8 border-l-[#BF9853] min-h-[330px] w-full max-w-full shrink-0 overflow-y-auto overflow-x-auto no-scrollbar scrollbar-none"
                                            onWheel={(e) => {
                                                refundFilterNudgeUsedRef.current = false;
                                                e.stopPropagation();
                                            }}
                                            onMouseDown={(e) => handleMouseDown(e, refundScrollRef)}
                                            onMouseMove={(e) => handleMouseMove(e, refundScrollRef)}
                                            onMouseUp={() => handleMouseUp(refundScrollRef)}
                                            onMouseLeave={() => handleMouseUp(refundScrollRef)}
                                            style={{
                                                height: `${40 + (showRefundFilters ? 40 : 0) + (canEditSelectedWeek ? 40 : 0) + 180}px`,
                                                maxHeight: `${40 + (showRefundFilters ? 40 : 0) + (canEditSelectedWeek ? 40 : 0) + 180}px`,
                                                willChange: 'scroll-position',
                                                WebkitOverflowScrolling: 'touch',
                                                transform: 'translateZ(0)',
                                                backfaceVisibility: 'hidden'
                                            }}
                                        >
                                            <table className={`border-collapse text-left ${DAILY_REFUND_TABLE_FIXED_WIDTH_CLASS} table-fixed ${EDBC_TABLE_EDGE_TABLE_CLASS} ${DAILY_REFUND_TABLE_INCOME_STYLE_CLASS} ${DAILY_REFUND_TBODY_TABLE_LOCK_TABLE_CLASS}`}>
                                                <colgroup>
                                                    <col style={{ width: '218px' }} />
                                                    <col style={{ width: '100px' }} />
                                                    <col style={{ width: '80px' }} />
                                                    <col style={{ width: '70px' }} />
                                                    <col style={{ width: '12px' }} />
                                                </colgroup>
                                                <thead className="sticky top-0 z-[99999] bg-white">
                                                    <EdbcTableHeaderRow>
                                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC4} label={refundDstCol4Label} sortProps={refundEdbcSortProps} />
                                                        <th className="px-[2px] w-[100px] overflow-visible" aria-hidden="true"></th>
                                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC22} label={refundDstCol8Label} sortProps={refundEdbcSortProps} />
                                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC20} label={refundDstCol20Label} />
                                                        <th className="w-[12px] min-w-[12px] max-w-[12px] p-0" aria-hidden="true"></th>
                                                    </EdbcTableHeaderRow>
                                                    {showRefundFilters && (
                                                        <EdbcTableFilterRow ref={refundFilterRowRef}>
                                                            <th id={EDBC_IDS.EDBC4} className={`${getEdbcColumnConfig(EDBC_IDS.EDBC4)?.tdClass} overflow-hidden !pl-[12px]`}>
                                                                <div className={`${getEdbcColumnConfig(EDBC_IDS.EDBC4)?.filterWidthClass} min-w-0 max-w-full`}>
                                                                    <Select
                                                                        className="text-xs focus:outline-none w-full"
                                                                        options={refundNameFilterOptions}
                                                                        value={refundNameFilterOptions.find((opt) => opt.value === selectRefundName) || null}
                                                                        onChange={(opt) => setSelectRefundName(opt ? opt.value : '')}
                                                                        placeholder={refundDstCol4Label}
                                                                        isSearchable
                                                                        isClearable={false}
                                                                        menuPlacement="bottom"
                                                                        menuPortalTarget={document.body}
                                                                        noOptionsMessage={() => null}
                                                                        styles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                                                                    />
                                                                </div>
                                                            </th>
                                                            <th className={EDBC_CASH_REGISTER_REFUND_PORTAL_HEADER_COLUMN_CLASS} aria-hidden="true"></th>
                                                            <EdbcTotalAmountFilter
                                                                columnId={EDBC_IDS.EDBC22}
                                                                totalAmount={filteredRefundPayments.reduce((total, row) => total + Number(row.amount || 0), 0)}
                                                                value={selectRefundAmount}
                                                                onChange={(e) => setSelectRefundAmount(e.target.value)}
                                                            />
                                                            <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC20} />
                                                            <th className="w-[12px] min-w-[12px] max-w-[12px] p-0" aria-hidden="true"></th>
                                                        </EdbcTableFilterRow>
                                                    )}
                                                    {canEditSelectedWeek && (
                                                        <EdbcTableBodyRow className="!bg-white border-b-2 border-gray-200 !h-[40px] !max-h-[40px] [&>td]:!py-0 overflow-hidden">
                                                            <td id={EDBC_IDS.EDBC4} className={`${getEdbcColumnConfig(EDBC_IDS.EDBC4)?.tdClass} overflow-hidden !pl-[12px]`}>
                                                                <div className={`${getEdbcColumnConfig(EDBC_IDS.EDBC4)?.filterWidthClass} min-w-0 max-w-full`}>
                                                                    <Select
                                                                        name="refund_party"
                                                                        className="text-xs focus:outline-none w-full"
                                                                        placeholder={refundDstCol4EntryPlaceholder}
                                                                        isSearchable
                                                                        isClearable
                                                                        value={
                                                                            isRefundChangeButtonActive
                                                                                ? laboursList.find(opt => String(opt.id) === String(newRefundReceived.labour_id)) || null
                                                                                : combinedOptions.find(opt =>
                                                                                    (opt.type === "Employee" && String(opt.id) === String(newRefundReceived.employee_id)) ||
                                                                                    (opt.type === "Vendor" && String(opt.id) === String(newRefundReceived.vendor_id)) ||
                                                                                    (opt.type === "Contractor" && String(opt.id) === String(newRefundReceived.contractor_id))
                                                                                ) || null
                                                                        }
                                                                        onChange={handleRefundSelectChange}
                                                                        onKeyDown={handleKeyDown}
                                                                        options={isRefundChangeButtonActive ? laboursList : combinedOptions}
                                                                        styles={CASH_REGISTER_SELECT_STYLES}
                                                                        menuPortalTarget={document.body}
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td className={`${EDBC_CASH_REGISTER_REFUND_PORTAL_BODY_COLUMN_CLASS} align-middle`}>
                                                                <div className="flex h-[40px]">
                                                                    <button type="button" onClick={handleRefundChangeButtonClick} className="inline-flex items-center justify-center">
                                                                        <img
                                                                            src={Change}
                                                                            className={`w-4 h-4 ${isRefundChangeButtonActive ? 'opacity-10' : ''}`}
                                                                            alt="Toggle options"
                                                                        />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td id={EDBC_IDS.EDBC22} className={getEdbcColumnConfig(EDBC_IDS.EDBC22)?.tdClass}>
                                                                <div className={getEdbcColumnConfig(EDBC_IDS.EDBC22)?.filterWidthClass}>
                                                                    <input
                                                                        type="number"
                                                                        name="amount"
                                                                        style={EDBC_FILTER_CONTROL_BOX_STYLE}
                                                                        className={`${getEdbcColumnConfig(EDBC_IDS.EDBC22)?.inputClassName || ''} no-spinner`}
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
                                                            <td className="w-[12px] min-w-[12px] max-w-[12px] p-0"></td>
                                                        </EdbcTableBodyRow>
                                                    )}
                                                </thead>
                                                <tbody>
                                                    {sortedRefundPayments.map((row, index) => (
                                                        <EdbcTableBodyRow key={row.id || index}>
                                                            {editingPaymentId === row.id && canEditSelectedWeek ? (
                                                                <td id={EDBC_IDS.EDBC4} className={getEdbcColumnConfig(EDBC_IDS.EDBC4)?.tdClass}>
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
                                                                </td>
                                                            ) : (
                                                                <EdbcExpandableBodyCell
                                                                    columnId={EDBC_IDS.EDBC4}
                                                                    expense={row}
                                                                    rowIndex={index}
                                                                    expandedCells={expandedCells}
                                                                    onToggleExpanded={toggleExpandedCell}
                                                                    getDisplayValue={getRefundRowName}
                                                                />
                                                            )}
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
                                                            {editingPaymentId === row.id && canEditSelectedWeek ? (
                                                                <td id={EDBC_IDS.EDBC22} className={getEdbcColumnConfig(EDBC_IDS.EDBC22)?.tdClass}>
                                                                    <div className={getEdbcColumnConfig(EDBC_IDS.EDBC22)?.filterWidthClass}>
                                                                        <input
                                                                            type="number"
                                                                            name="amount"
                                                                            value={editRefundPaymentData.amount}
                                                                            onChange={handleEditRefundChange}
                                                                            style={EDBC_FILTER_CONTROL_BOX_STYLE}
                                                                            className={`${getEdbcColumnConfig(EDBC_IDS.EDBC22)?.inputClassName || ''} no-spinner`}
                                                                            placeholder={refundDstCol8Label}
                                                                            min="0"
                                                                            step="any"
                                                                            onWheel={(e) => e.preventDefault()}
                                                                        />
                                                                    </div>
                                                                </td>
                                                            ) : (
                                                                <EdbcExpandableBodyCell
                                                                    columnId={EDBC_IDS.EDBC22}
                                                                    expense={row}
                                                                    rowIndex={index}
                                                                    expandedCells={expandedCells}
                                                                    onToggleExpanded={toggleExpandedCell}
                                                                    textAlignClass="text-right"
                                                                    getDisplayValue={(entry) => formatRefundAmountDisplay(entry.amount)}
                                                                />
                                                            )}
                                                            <td id={EDBC_IDS.EDBC20} className={getEdbcColumnConfig(EDBC_IDS.EDBC20)?.tdClass}>
                                                                {canEditSelectedWeek && (
                                                                    <div className="flex gap-1 justify-center">
                                                                        {editingPaymentId === row.id ? (
                                                                            <span className="inline-flex w-5 h-4 shrink-0 items-center justify-center">
                                                                                <button className="text-green-600 font-bold text-lg" onClick={() => saveEditedRefundPayment(row.id)}>
                                                                                    ✓
                                                                                </button>
                                                                            </span>
                                                                        ) : (
                                                                            <span className="inline-flex w-5 h-4 shrink-0 items-center justify-center">
                                                                                {hasEditPermission ? (
                                                                                    <button onClick={() => handleEditRefundClick(row)}>
                                                                                        <img className="w-5 h-4" src={Edit} alt="Edit" />
                                                                                    </button>
                                                                                ) : (
                                                                                    <img className="w-5 h-4 opacity-40 cursor-not-allowed" src={Edit} alt="Edit Disabled" />
                                                                                )}
                                                                            </span>
                                                                        )}
                                                                        <span className="inline-flex w-5 h-4 shrink-0 items-center justify-center">
                                                                            {hasDeletePermission ? (
                                                                                <button type="button" onClick={() => handleRefundPaymentsDelete(row.id)}>
                                                                                    <img src={Delete} className="w-5 h-4" alt="Delete" />
                                                                                </button>
                                                                            ) : (
                                                                                <img className="w-5 h-4 opacity-40 cursor-not-allowed" src={Delete} alt="Delete Disabled" />
                                                                            )}
                                                                        </span>
                                                                        <span className="inline-flex w-5 h-4 shrink-0 items-center justify-center">
                                                                            <button type="button" onClick={() => fetchAuditDetailsForRefundPaymentReceived(row.id)}>
                                                                                <img className="w-5 h-4" src={history} alt="History" />
                                                                            </button>
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="w-[12px] min-w-[12px] max-w-[12px] p-0"></td>
                                                        </EdbcTableBodyRow>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div className="xl:mt-[12px] max-xl:flex-1 max-xl:min-w-[280px] flex-1 min-h-0 rounded-xl bg-white px-[18px] py-[12px] border border-[#E6DAC6] text-left overflow-hidden overflow-x-hidden no-scrollbar scrollbar-none max-xl:overflow-visible">
                                    <div className="flex flex-col h-full min-h-0 overflow-x-hidden">
                                        <div className="flex items-center justify-between rounded-lg mb-[4px]">
                                            <p className="text-[16px] font-semibold text-black">Summary Details</p>
                                        </div>
                                        <div className="overflow-y-auto overflow-x-hidden no-scrollbar scrollbar-none flex-1 min-h-0 max-xl:overflow-visible max-xl:flex-none">
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
                        </div>
                    {showPopups && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]"
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    setShowPopups(false);
                                    setEntryId(null);
                                    setDescriptionRowId(null);
                                    setDescription("");
                                }
                                if (e.key === 'Enter' && entryId) {
                                    handleUpdate();
                                }
                            }}
                            tabIndex={0}
                        >
                            <div className="bg-white rounded-xl shadow-lg p-[18px] w-[650px]">
                                <label className="block text-left">
                                    <span className="font-semibold block text-[18px] mb-[8px]">Description</span>
                                    {entryId ? (
                                        <div>
                                            <textarea
                                                name="description"
                                                placeholder="Enter description"
                                                rows={4}
                                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none resize-none whitespace-normal break-words"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') e.stopPropagation(); }}
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <textarea
                                                name="description"
                                                placeholder="Description"
                                                rows={4}
                                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none resize-none whitespace-normal break-words bg-[#ededed]"
                                                value={description}
                                                readOnly
                                            />
                                        </div>
                                    )}
                                </label>
                                <div className="flex justify-end gap-[18px] mt-[18px]">
                                    {!entryId && description && editingDailyExpenseRowId === descriptionRowId && (
                                        <button
                                            onClick={() => setEntryId(descriptionRowId)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md"
                                        >
                                            Edit
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            setShowPopups(false);
                                            setEntryId(null);
                                            setDescriptionRowId(null);
                                            setDescription("");
                                        }}
                                        className="px-4 py-2 border border-[#BF9853] text-[#BF9853] rounded-md"
                                    >
                                        Close
                                    </button>
                                    {entryId && (!(expenses.find((e) => String(e.id) === String(descriptionRowId))?.description || '').trim() || editingDailyExpenseRowId === descriptionRowId) && (
                                        <button
                                            onClick={handleUpdate}
                                            disabled={loading}
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
                                        htmlFor="daily-history-file-upload-input"
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
                                        id="daily-history-file-upload-input"
                                        type="file"
                                        accept=".pdf"
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
                                    <button
                                        onClick={handleSaveFileFromPopup}
                                        disabled={!selectedFileForPopup}
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
                    {showPurposePopup && (
                        <div
                            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
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
                                                    border: '2px solid rgba(191, 152, 83, 0.5)',
                                                },
                                            }),
                                            valueContainer: (provided) => ({
                                                ...provided,
                                                padding: '2px 8px',
                                            }),
                                            input: (provided) => ({
                                                ...provided,
                                                margin: '0px',
                                            }),
                                            indicatorSeparator: () => ({
                                                display: 'none',
                                            }),
                                            indicatorsContainer: (provided) => ({
                                                ...provided,
                                                height: '45px',
                                                gap: '0px',
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
                                                zIndex: 9999,
                                            }),
                                            menu: (provided) => ({
                                                ...provided,
                                                zIndex: 9999,
                                            }),
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
            {sendExpensesToolbarSlot && createPortal(
                <button
                    type="button"
                    onClick={handleSendToExpensesEntry}
                    className="py-1.5 bg-[#BF9853] text-white text-[14px] font-bold px-[16px] rounded shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={sendingToExpensesEntry}
                >
                    {sendingToExpensesEntry ? 'Sending...' : 'Send Expenses'}
                </button>,
                sendExpensesToolbarSlot
            )}
        </body>
    );
};
export default DailyHistory;
const AuditModal = ({ show, onClose, audits, laboursList, siteOptions, vendorOptions, employeeOptions, contractorOptions }) => {
    if (!show) return null;
    const getNameById = (id, options) => {
        if (!id && id !== 0) return "-";
        const found = options.find(opt => String(opt.id) === String(id));
        return found ? found.label : id;
    };
    const fields = [
        { oldKey: "old_type", newKey: "new_type", label: "Type", width: "100px" },
        { oldKey: "old_amount", newKey: "new_amount", label: "Amount", width: "100px" },
        { oldKey: "old_extra_amount", newKey: "new_extra_amount", label: "Extra", width: "100px" },
        { oldKey: "old_quantity", newKey: "new_quantity", label: "Quantity", width: "100px" },
    ];
    const normalizeAuditId = (id) => {
        if (id == null || String(id).trim() === "" || String(id) === "0") return null;
        return id;
    };
    const getAssociateFromAudit = (audit, keyPrefix) => {
        const vendorId = normalizeAuditId(audit[`${keyPrefix}_vendor_id`]);
        const contractorId = normalizeAuditId(audit[`${keyPrefix}_contractor_id`]);
        const employeeId = normalizeAuditId(audit[`${keyPrefix}_employee_id`]);
        const labourId = normalizeAuditId(audit[`${keyPrefix}_labour_id`]);
        if (vendorId) return { name: getNameById(vendorId, vendorOptions), type: "Vendor" };
        if (contractorId) return { name: getNameById(contractorId, contractorOptions), type: "Contractor" };
        if (employeeId) return { name: getNameById(employeeId, employeeOptions), type: "Employee" };
        if (labourId) return { name: getNameById(labourId, laboursList), type: "Labour" };
        return { name: "-", type: "-" };
    };
    const getProjectNameFromAudit = (audit, keyPrefix) => {
        const projectId = normalizeAuditId(audit[`${keyPrefix}_project_id`]);
        return projectId ? getNameById(projectId, siteOptions) : "-";
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
            (field.oldKey?.includes("labour_id") || field.oldKey?.includes("vendor_id") || field.oldKey?.includes("contractor_id") || field.oldKey?.includes("employee_id") || field.oldKey?.includes("project_id") || field.oldKey?.includes("transfer_site_id") ||
                field.newKey?.includes("labour_id") || field.newKey?.includes("vendor_id") || field.newKey?.includes("contractor_id") || field.newKey?.includes("employee_id") || field.newKey?.includes("project_id") || field.newKey?.includes("transfer_site_id")) &&
            String(value) === "0"
        ) {
            return "-";
        }
        if (field.lookup) {
            return getNameById(value, field.lookup);
        }
        if (field.label.includes("Amount") || field.label === "Extra") {
            return value ? Number(value).toLocaleString("en-IN") : "-";
        }
        if (field.label === "Date") {
            return value ? new Date(value).toLocaleDateString("en-GB") : "-";
        }
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
                                <EdbcColumnHeader columnId={EDBC_IDS.EDBC4} label="Associate" />
                                <EdbcColumnHeader columnId={EDBC_IDS.EDBC12} label="Associate Type" />
                                <EdbcColumnHeader columnId={EDBC_IDS.EDBC3} label="Project Name" />
                                <EdbcColumnHeader columnId={EDBC_IDS.EDBC12} label="Type" />
                                <EdbcColumnHeader columnId={EDBC_IDS.EDBC8} label="Amount" />
                                <th className="w-[66px] min-w-[66px] max-w-[66px] pl-[1px] pr-[1px] font-bold text-left">Extra</th>
                                <EdbcColumnHeader columnId={EDBC_IDS.EDBC7} label="Quantity" />
                                <EdbcColumnHeader columnId={EDBC_IDS.EDBC12} label="Edited By" />
                            </EdbcTableHeaderRow>
                        </thead>
                        <tbody>
                            {audits.map((audit, index) => (
                                <EdbcTableBodyRow key={index}>
                                    <td id={EDBC_IDS.EDBC1} className={`${getEdbcColumnConfig(EDBC_IDS.EDBC1)?.tdClass} whitespace-nowrap overflow-hidden text-ellipsis`} >
                                        {formatDateTime(audit.edited_date)}
                                    </td>
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
                                                {(() => {
                                                    const oldProjectName = getProjectNameFromAudit(audit, "old");
                                                    const newProjectName = getProjectNameFromAudit(audit, "new");
                                                    const projectChanged = oldProjectName !== newProjectName;
                                                    return (
                                                        <td id={EDBC_IDS.EDBC3} title={projectChanged ? `Previous: ${oldProjectName} → Current: ${newProjectName}` : ""}
                                                            className={`${getEdbcColumnConfig(EDBC_IDS.EDBC3)?.tdClass} whitespace-nowrap overflow-hidden text-ellipsis ${projectChanged ? "bg-[#BF9853] font-bold" : ""}`}
                                                        >
                                                            {oldProjectName}
                                                        </td>
                                                    );
                                                })()}
                                            </>
                                        );
                                    })()}
                                    {fields.slice(0, 2).map((f) => {
                                        const oldDisplay = formatDisplayValue(audit[f.oldKey], f);
                                        const newDisplay = formatDisplayValue(audit[f.newKey], f);
                                        const changed = oldDisplay !== newDisplay;
                                        const columnId = f.label === "Type" ? EDBC_IDS.EDBC12 : EDBC_IDS.EDBC8;
                                        return (
                                            <td key={f.label} id={columnId} title={changed ? `Previous: ${oldDisplay} → Current: ${newDisplay}` : ""}
                                                className={`${getEdbcColumnConfig(columnId)?.tdClass} whitespace-nowrap overflow-hidden text-ellipsis ${changed ? "bg-[#BF9853] font-bold" : ""
                                                    }`} >
                                                {oldDisplay}
                                            </td>
                                        );
                                    })}
                                    {fields.slice(2).map((f) => {
                                        const oldDisplay = formatDisplayValue(audit[f.oldKey], f);
                                        const newDisplay = formatDisplayValue(audit[f.newKey], f);
                                        const changed = oldDisplay !== newDisplay;
                                        if (f.label === "Extra") {
                                            return (
                                                <td key={f.label} className={`w-[66px] min-w-[66px] max-w-[66px] pl-[6px] whitespace-nowrap overflow-hidden text-ellipsis ${changed ? "bg-[#BF9853] font-bold" : ""
                                                    }`} title={changed ? `Previous: ${oldDisplay} → Current: ${newDisplay}` : ""}>
                                                    {oldDisplay}
                                                </td>
                                            );
                                        }
                                        return (
                                            <td key={f.label} id={EDBC_IDS.EDBC7} title={changed ? `Previous: ${oldDisplay} → Current: ${newDisplay}` : ""}
                                                className={`${getEdbcColumnConfig(EDBC_IDS.EDBC7)?.tdClass} whitespace-nowrap overflow-hidden text-ellipsis ${changed ? "bg-[#BF9853] font-bold" : ""
                                                    }`} >
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
const AuditModalWeeklyPaymentsReceived = ({ show, onClose, audits, laboursList }) => {
    if (!show) return null;
    const getNameById = (id, options) => {
        if (!id && id !== 0) return "-";
        const found = options.find(opt => String(opt.id) === String(id));
        return found ? found.label : id;
    };
    const fields = [
        { oldKey: "old_amount", newKey: "new_amount", label: "Amount", width: "100px" },
    ];
    const normalizeAuditId = (id) => {
        if (id == null || String(id).trim() === "" || String(id) === "0") return null;
        return id;
    };
    const getAssociateFromAudit = (audit, keyPrefix) => {
        const labourId = normalizeAuditId(audit[`${keyPrefix}_labour_id`]);
        if (labourId) return { name: getNameById(labourId, laboursList), type: "Labour" };
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
                                <EdbcColumnHeader columnId={EDBC_IDS.EDBC4} label="Associate" />
                                <EdbcColumnHeader columnId={EDBC_IDS.EDBC12} label="Associate Type" />
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
                                    {fields.map((f) => {
                                        const oldDisplay = formatDisplayValue(audit[f.oldKey], f);
                                        const newDisplay = formatDisplayValue(audit[f.newKey], f);
                                        const changed = oldDisplay !== newDisplay;
                                        return (
                                            <td key={f.label} id={EDBC_IDS.EDBC8} title={changed ? `Previous: ${oldDisplay} → Current: ${newDisplay}` : ""}
                                                className={`${getEdbcColumnConfig(EDBC_IDS.EDBC8)?.tdClass} whitespace-nowrap overflow-hidden text-ellipsis ${changed ? "bg-[#BF9853] font-bold" : ""
                                                    }`} >
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