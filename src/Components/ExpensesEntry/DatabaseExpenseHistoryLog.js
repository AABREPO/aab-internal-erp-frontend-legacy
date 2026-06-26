import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import {
    EdbcTableToolbarRightActions,
    EDBC_TABLE_EDGE_TABLE_CLASS,
    EDBC_IDS,
    EdbcColumnHeader,
    EdbcTableHeaderRow,
    EdbcTableBodyRow,
    getEdbcColumnConfig,
    useEdbcExpandedCells,
} from './databaseExpensesSharedColumns';

const GET_FORM_URL = 'https://backendaab.in/demoAabuilderDash/expenses_form/get_form';
/** Bulk audit log — single response (see ExpensesController GET /expenses_form/get/full_history). */
const FULL_HISTORY_URL = 'https://backendaab.in/demoAabuilderDash/expenses_form/get/full_history';

const formatLogTimestamp = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return String(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? String(hours).padStart(2, '0') : '12';
    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
};

const formatInr = (value) => {
    if (value === null || value === undefined || value === '') return '';
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const isEmptyValue = (value) => value === null || value === undefined || value === '';

const formatDisplayValue = (value, mode = 'text') => {
    if (isEmptyValue(value)) return '';
    if (mode === 'amount') return formatInr(value);
    return String(value).trim();
};

const valuesEqual = (oldVal, newVal, mode = 'text') => {
    if (isEmptyValue(oldVal) && isEmptyValue(newVal)) return true;
    if (mode === 'amount') {
        const oldNum = Number(oldVal);
        const newNum = Number(newVal);
        if (!Number.isNaN(oldNum) && !Number.isNaN(newNum)) return oldNum === newNum;
    }
    const o = isEmptyValue(oldVal) ? '' : String(oldVal).trim();
    const n = isEmptyValue(newVal) ? '' : String(newVal).trim();
    return o === n;
};

const renderSiteChangeCell = (value) => {
    const text = value == null || value === '' ? '' : String(value);
    if (!text) return null;
    const arrow = ' → ';
    if (text.includes(arrow)) {
        const arrowIdx = text.indexOf(arrow);
        const oldPart = text.slice(0, arrowIdx);
        const newPart = text.slice(arrowIdx + arrow.length);
        if (oldPart !== newPart) {
            return (
                <span
                    className="block w-full whitespace-normal break-words leading-[1.25] line-clamp-2 py-0.5"
                    title={text}
                >
                    {oldPart}
                    <span className="whitespace-nowrap"> → </span>
                    {newPart}
                </span>
            );
        }
    }
    return (
        <span className="block w-full whitespace-normal break-words leading-[1.25] line-clamp-2 py-0.5" title={text}>
            {text}
        </span>
    );
};

const formatPair = (oldVal, newVal, mode = 'text') => {
    const oldDisplay = formatDisplayValue(oldVal, mode);
    const newDisplay = formatDisplayValue(newVal, mode);
    if (valuesEqual(oldVal, newVal, mode)) {
        return newDisplay || oldDisplay || '';
    }
    if (!oldDisplay && !newDisplay) return '';
    if (!oldDisplay) return newDisplay;
    if (!newDisplay) return oldDisplay;
    return `${oldDisplay} → ${newDisplay}`;
};

const getNameById = (id, options) => {
    if (id === null || id === undefined || id === '' || String(id) === '0') return '';
    const found = options.find((opt) => String(opt.id) === String(id));
    return found ? found.label : '';
};

const formatNamePairFromIds = (oldId, newId, options, oldNameFallback = '', newNameFallback = '') => {
    const oldName = getNameById(oldId, options) || (isEmptyValue(oldNameFallback) ? '' : String(oldNameFallback));
    const newName = getNameById(newId, options) || (isEmptyValue(newNameFallback) ? '' : String(newNameFallback));
    return formatPair(oldName, newName, 'text');
};

const pickUtilityTypeNumber = (audit, side) => {
    if (side === 'old') {
        return (
            pick(audit, 'oldUtilityTypeNumber', 'old_utility_type_number') ??
            pick(audit, 'oldUtilityTypeNo', 'old_utility_type_no')
        );
    }
    return (
        pick(audit, 'newUtilityTypeNumber', 'new_utility_type_number') ??
        pick(audit, 'newUtilityTypeNo', 'new_utility_type_no')
    );
};

const fetchLookupOptions = async (url, mapItem) => {
    try {
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data.map(mapItem) : [];
    } catch (error) {
        console.error(`Lookup fetch failed (${url})`, error);
        return [];
    }
};

const resolveActiveBranchId = () => {
    try {
        const selectedBranchId = localStorage.getItem('selectedBranchId');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const fallbackBranchId = user?.branchId ?? user?.branch_id ?? user?.brachId;
        const resolved = Number(selectedBranchId || fallbackBranchId);
        return Number.isFinite(resolved) && resolved > 0 ? resolved : null;
    } catch {
        return null;
    }
};

const fmtAuditDate = (raw) => {
    if (raw == null || raw === '') return '';
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? String(raw) : d.toLocaleDateString('en-GB');
};

/** Normalize audit row from entity JSON (camelCase or snake_case). */
const pick = (row, camel, snake) => row[camel] ?? row[snake];

const resolveStaffDisplay = (audit, side, employeeOptions, labourOptions) => {
    const isOld = side === 'old';
    const labourId = pick(
        audit,
        isOld ? 'oldLabourId' : 'newLabourId',
        isOld ? 'old_labour_id' : 'new_labour_id'
    );
    const employeeId = pick(
        audit,
        isOld ? 'oldEmployeeId' : 'newEmployeeId',
        isOld ? 'old_employee_id' : 'new_employee_id'
    );
    const labourFallback = pick(audit, isOld ? 'oldLabour' : 'newLabour', isOld ? 'old_labour' : 'new_labour');
    const employeeFallback = pick(audit, isOld ? 'oldEmployee' : 'newEmployee', isOld ? 'old_employee' : 'new_employee');
    return (
        getNameById(labourId, labourOptions) ||
        getNameById(employeeId, employeeOptions) ||
        (isEmptyValue(labourFallback) ? '' : String(labourFallback)) ||
        (isEmptyValue(employeeFallback) ? '' : String(employeeFallback))
    );
};

const AuditChangeEdbcHeader = ({ columnId, label, headerId = columnId }) => {
    const config = getEdbcColumnConfig(columnId);
    if (!config) return null;
    const headerClass = config.headerClass
        .replace(/\bcursor-pointer\b/g, '')
        .replace(/\bhover:bg-gray-200\b/g, '')
        .replace(/\bselect-none\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    const alignClass = headerClass.includes('text-right')
        ? 'items-end'
        : headerClass.includes('text-center')
            ? 'items-center'
            : 'items-start';
    return (
        <th id={headerId} className={headerClass}>
            <div className={`flex flex-col leading-[1.15] py-[2px] ${alignClass}`}>
                <span>{label}</span>
                <span className="text-[12px] font-semibold">(old → new)</span>
            </div>
        </th>
    );
};

const HISTORY_COLUMN_COUNT = 22;

const mapAuditToDisplayRow = (audit, idx, enoByExpenseId, lookups = {}) => {
    const {
        vendorOptions = [],
        contractorOptions = [],
        employeeOptions = [],
        labourOptions = [],
        branchOptions = [],
    } = lookups;
    const expenseId = pick(audit, 'expenseId', 'expense_id');
    const auditRowId = audit.id;
    const editedDate = pick(audit, 'editedDate', 'edited_date');
    const editedBy = pick(audit, 'editedBy', 'edited_by') ?? '';
    const eidStr = expenseId != null ? String(expenseId) : '';
    const eno = eidStr && enoByExpenseId.has(eidStr) ? enoByExpenseId.get(eidStr) : '';

    const oldDateRaw = pick(audit, 'oldDate', 'old_date');
    const newDateRaw = pick(audit, 'newDate', 'new_date');

    const oc = pick(audit, 'oldComments', 'old_comments');
    const nc = pick(audit, 'newComments', 'new_comments');
    const commentsSnippet = (() => {
        const ocs = oc != null ? String(oc) : '';
        const ncs = nc != null ? String(nc) : '';
        if (!ocs && !ncs) return '';
        const trimSnippet = (s) => `${s.slice(0, 40)}${s.length > 40 ? '…' : ''}`;
        if (ocs === ncs) return trimSnippet(ncs);
        return `${trimSnippet(ocs)} → ${trimSnippet(ncs)}`;
    })();

    return {
        key: auditRowId != null ? `audit-${auditRowId}` : `audit-${eidStr}-${idx}-${editedDate || ''}-${editedBy}`,
        expenseId: expenseId ?? '',
        eno,
        editedDate,
        editedBy,
        dateChange: formatPair(fmtAuditDate(oldDateRaw), fmtAuditDate(newDateRaw), 'text'),
        siteChange: formatPair(pick(audit, 'oldSiteName', 'old_site_name'), pick(audit, 'newSiteName', 'new_site_name'), 'text'),
        vendorChange: formatNamePairFromIds(
            pick(audit, 'oldVendorId', 'old_vendor_id'),
            pick(audit, 'newVendorId', 'new_vendor_id'),
            vendorOptions,
            pick(audit, 'oldVendor', 'old_vendor'),
            pick(audit, 'newVendor', 'new_vendor')
        ),
        contractorChange: formatNamePairFromIds(
            pick(audit, 'oldContractorId', 'old_contractor_id'),
            pick(audit, 'newContractorId', 'new_contractor_id'),
            contractorOptions,
            pick(audit, 'oldContractor', 'old_contractor'),
            pick(audit, 'newContractor', 'new_contractor')
        ),
        staffChange: formatPair(
            resolveStaffDisplay(audit, 'old', employeeOptions, labourOptions),
            resolveStaffDisplay(audit, 'new', employeeOptions, labourOptions),
            'text'
        ),
        quantityChange: formatPair(pick(audit, 'oldQuantity', 'old_quantity'), pick(audit, 'newQuantity', 'new_quantity'), 'text'),
        amountChange: formatPair(pick(audit, 'oldAmount', 'old_amount'), pick(audit, 'newAmount', 'new_amount'), 'amount'),
        commentsSnippet,
        categoryChange: formatPair(pick(audit, 'oldCategory', 'old_category'), pick(audit, 'newCategory', 'new_category'), 'text'),
        machineToolsChange: formatPair(
            pick(audit, 'oldMachineTools', 'old_machine_tools'),
            pick(audit, 'newMachineTools', 'new_machine_tools'),
            'text'
        ),
        accountTypeChange: formatPair(
            pick(audit, 'oldAccountType', 'old_account_type'),
            pick(audit, 'newAccountType', 'new_account_type'),
            'text'
        ),
        utilityTypeChange: formatPair(
            pick(audit, 'oldUtilityType', 'old_utility_type'),
            pick(audit, 'newUtilityType', 'new_utility_type'),
            'text'
        ),
        serviceNumberChange: formatPair(pickUtilityTypeNumber(audit, 'old'), pickUtilityTypeNumber(audit, 'new'), 'text'),
        paymentModeChange: formatPair(
            pick(audit, 'oldPaymentMode', 'old_payment_mode'),
            pick(audit, 'newPaymentMode', 'new_payment_mode'),
            'text'
        ),
        sourceChange: formatPair(pick(audit, 'oldSource', 'old_source'), pick(audit, 'newSource', 'new_source'), 'text'),
        branchChange: formatNamePairFromIds(
            pick(audit, 'oldBranchId', 'old_branch_id'),
            pick(audit, 'newBranchId', 'new_branch_id'),
            branchOptions,
            pick(audit, 'oldBranchName', 'old_branch_name'),
            pick(audit, 'newBranchName', 'new_branch_name')
        ),
        enteredByChange: formatPair(
            pick(audit, 'oldEnteredBy', 'old_entered_by'),
            pick(audit, 'newEnteredBy', 'new_entered_by'),
            'text'
        ),
        billArrivalChange: formatPair(
            fmtAuditDate(pick(audit, 'oldBillArrivalDate', 'old_bill_arrival_date')),
            fmtAuditDate(pick(audit, 'newBillArrivalDate', 'new_bill_arrival_date')),
            'text'
        ),
    };
};

/**
 * Read-only log of expense database edit history (bulk GET /get/full_history + get_form for E.No / branch scope).
 */
const DatabaseExpenseHistoryLog = ({ username: _username, userRoles: _userRoles = [], isActive = true }) => {
    const [activeBranchId, setActiveBranchId] = useState(() => resolveActiveBranchId());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [logRows, setLogRows] = useState([]);
    const [overallSearch, setOverallSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const { expandedCells, toggleExpandedCell } = useEdbcExpandedCells();
    const scrollRef = useRef(null);
    const isDragging = useRef(false);
    const start = useRef({ x: 0, y: 0 });
    const scroll = useRef({ left: 0, top: 0 });

    useEffect(() => {
        const syncBranch = () => setActiveBranchId(resolveActiveBranchId());
        syncBranch();
        window.addEventListener('branchSelectionChanged', syncBranch);
        return () => window.removeEventListener('branchSelectionChanged', syncBranch);
    }, []);

    const loadHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        setLogRows([]);
        try {
            const formParams = activeBranchId ? { branchId: activeBranchId } : {};
            const [
                historyRes,
                formRes,
                vendorOptions,
                contractorOptions,
                employeeOptions,
                labourOptions,
                branchOptions,
            ] = await Promise.all([
                axios.get(FULL_HISTORY_URL),
                axios.get(GET_FORM_URL, { params: formParams }),
                fetchLookupOptions('https://backendaab.in/demoAabuilderDash/api/vendor_Names/getAll', (item) => ({
                    id: item.id,
                    label: item.vendorName,
                })),
                fetchLookupOptions('https://backendaab.in/demoAabuilderDash/api/contractor_Names/getAll', (item) => ({
                    id: item.id,
                    label: item.contractorName,
                })),
                fetchLookupOptions('https://backendaab.in/demoAabuildersDash/api/employee_details/getAll', (item) => ({
                    id: item.id,
                    label: item.employee_name,
                })),
                fetchLookupOptions('https://backendaab.in/demoAabuildersDash/api/labours-details/getAll', (item) => ({
                    id: item.id,
                    label: item.labour_name,
                })),
                fetchLookupOptions('https://backendaab.in/demoAabuildersDash/api/branch/getAll', (item) => ({
                    id: item.id,
                    label: item.branch,
                })),
            ]);

            const allAudits = Array.isArray(historyRes.data) ? historyRes.data : [];
            const expenses = Array.isArray(formRes.data) ? formRes.data : [];

            const enoByExpenseId = new Map();
            const allowedExpenseIds = new Set();
            expenses.forEach((e) => {
                if (!e || e.id == null) return;
                const idStr = String(e.id);
                allowedExpenseIds.add(idStr);
                const eno = e.eno ?? e.eNo ?? e.ENo ?? '';
                enoByExpenseId.set(idStr, eno);
            });

            const scopedAudits = allAudits.filter((a) => {
                const eid = pick(a, 'expenseId', 'expense_id');
                if (eid == null) return false;
                if (allowedExpenseIds.size === 0) return false;
                return allowedExpenseIds.has(String(eid));
            });

            const flat = scopedAudits.map((audit, idx) =>
                mapAuditToDisplayRow(audit, idx, enoByExpenseId, {
                    vendorOptions,
                    contractorOptions,
                    employeeOptions,
                    labourOptions,
                branchOptions,
                })
            );
            flat.sort((a, b) => {
                const ta = a.editedDate ? new Date(a.editedDate).getTime() : 0;
                const tb = b.editedDate ? new Date(b.editedDate).getTime() : 0;
                return tb - ta;
            });
            setLogRows(flat);
        } catch (e) {
            console.error('DatabaseExpenseHistoryLog load failed', e);
            setError('Failed to load expense history. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [activeBranchId]);

    const clearFilters = useCallback(() => {
        setOverallSearch('');
        setCurrentPage(1);
        void loadHistory();
    }, [loadHistory]);

    useEffect(() => {
        if (!isActive) return;
        void loadHistory();
    }, [isActive, activeBranchId, loadHistory]);

    const filteredRows = useMemo(() => {
        const q = overallSearch.trim().toLowerCase();
        if (!q) return logRows;
        return logRows.filter((row) => {
            const blob = [
                row.editedBy,
                String(row.eno),
                row.dateChange,
                row.siteChange,
                row.vendorChange,
                row.contractorChange,
                row.staffChange,
                row.quantityChange,
                row.amountChange,
                row.commentsSnippet,
                row.categoryChange,
                row.machineToolsChange,
                row.accountTypeChange,
                row.utilityTypeChange,
                row.serviceNumberChange,
                row.paymentModeChange,
                row.sourceChange,
                row.branchChange,
                row.enteredByChange,
                row.billArrivalChange,
                String(row.expenseId),
            ]
                .join(' ')
                .toLowerCase();
            return blob.includes(q);
        });
    }, [logRows, overallSearch]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
    const page = Math.min(currentPage, totalPages);
    const startIdx = (page - 1) * itemsPerPage;
    const pageRows = filteredRows.slice(startIdx, startIdx + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [overallSearch, itemsPerPage, logRows.length]);

    const handleMouseDown = (e) => {
        if (!scrollRef.current) return;
        isDragging.current = true;
        start.current = { x: e.clientX, y: e.clientY };
        scroll.current = {
            left: scrollRef.current.scrollLeft,
            top: scrollRef.current.scrollTop,
        };
        scrollRef.current.style.cursor = 'grabbing';
        scrollRef.current.style.userSelect = 'none';
    };
    const handleMouseMove = (e) => {
        if (!isDragging.current || !scrollRef.current) return;
        const dx = e.clientX - start.current.x;
        const dy = e.clientY - start.current.y;
        scrollRef.current.scrollLeft = scroll.current.left - dx;
        scrollRef.current.scrollTop = scroll.current.top - dy;
    };
    const handleMouseUp = () => {
        if (!isDragging.current || !scrollRef.current) return;
        isDragging.current = false;
        scrollRef.current.style.cursor = '';
        scrollRef.current.style.userSelect = '';
    };

    const endIndex = Math.min(startIdx + itemsPerPage, filteredRows.length);

    const renderAuditCell = (rowId, field, value, elementId, textAlignClass = '', styleColumnId = elementId) => {
        const config = getEdbcColumnConfig(styleColumnId);
        const display = value == null ? '' : String(value);
        const cellKey = `${rowId}-${field}`;
        return (
            <td id={elementId} className={`${config?.tdClass || ''} ${textAlignClass}`.trim()}>
                <span
                    onClick={() => toggleExpandedCell(cellKey)}
                    className={`block w-full cursor-pointer ${expandedCells[cellKey] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'} ${textAlignClass}`}
                    title={display}
                >
                    {display}
                </span>
            </td>
        );
    };

    const editedByHeaderClass = (getEdbcColumnConfig(EDBC_IDS.EDBC16)?.headerClass || '')
        .replace(/\bcursor-pointer\b/g, '')
        .replace(/\bhover:bg-gray-200\b/g, '')
        .replace(/\bselect-none\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    const expenseIdHeaderClass = (getEdbcColumnConfig(EDBC_IDS.EDBC17)?.headerClass || '')
        .replace(/\bcursor-pointer\b/g, '')
        .replace(/\bhover:bg-gray-200\b/g, '')
        .replace(/\bselect-none\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    return (
        <div className="flex flex-col h-[calc(100vh-104px)] overflow-hidden bg-[#FAF6ED]">
            <div className="px-[18px] pt-[18px] pb-[18px] flex flex-col flex-1 min-h-0 overflow-hidden bg-[#FAF6ED]">
                <div className="w-full pt-[18px] px-[18px] bg-white rounded-[6px] flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="text-left flex flex-row justify-between items-center mb-[12px] gap-[6px]">
                        <div className="flex flex-row items-center sm:space-x-3 min-w-0 flex-1 overflow-hidden" />
                        <EdbcTableToolbarRightActions
                            onClearFilters={clearFilters}
                            overallSearch={overallSearch}
                            onOverallSearchChange={setOverallSearch}
                            clearButtonType="button"
                        />
                    </div>
                    {error && <div className="mb-3 text-sm text-red-600 text-left">{error}</div>}
                    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                        <div
                            ref={scrollRef}
                            className="w-full rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] flex-1 min-h-0 overflow-auto select-none scrollbar-none no-scrollbar"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <table className={`table-fixed w-full border-collapse ${EDBC_TABLE_EDGE_TABLE_CLASS} min-w-[1920px]`}>
                                <thead className="sticky top-0 z-10 bg-white">
                                    <EdbcTableHeaderRow>
                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC1} label="Edited Time" />
                                        <th id="audit-expense-id" className={expenseIdHeaderClass}>Expense id</th>
                                        <th id="audit-edited-by" className={editedByHeaderClass}>Edited by</th>
                                        <AuditChangeEdbcHeader columnId={EDBC_IDS.EDBC2} label="Date" />
                                        <AuditChangeEdbcHeader columnId={EDBC_IDS.EDBC3} label="Project Name" />
                                        <AuditChangeEdbcHeader columnId={EDBC_IDS.EDBC4} label="Vendor Name" />
                                        <AuditChangeEdbcHeader columnId={EDBC_IDS.EDBC5} label="Contractor Name" />
                                        <AuditChangeEdbcHeader columnId={EDBC_IDS.EDBC6} label="Staff Name" />
                                        <AuditChangeEdbcHeader columnId={EDBC_IDS.EDBC7} label="Quantity" />
                                        <AuditChangeEdbcHeader columnId={EDBC_IDS.EDBC8} label="Amount" />
                                        <AuditChangeEdbcHeader columnId={EDBC_IDS.EDBC9} label="Description" />
                                        <AuditChangeEdbcHeader columnId={EDBC_IDS.EDBC10} label="Category" />
                                        <AuditChangeEdbcHeader columnId={EDBC_IDS.EDBC12} label="A/C Type" />
                                        <AuditChangeEdbcHeader columnId={EDBC_IDS.EDBC10} headerId="audit-utility-type" label="Utility Type" />
                                        <AuditChangeEdbcHeader columnId={EDBC_IDS.EDBC22} label="Service Number" />
                                        <AuditChangeEdbcHeader columnId={EDBC_IDS.EDBC13} label="Mode" />
                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC17} label="Entry No" />
                                    </EdbcTableHeaderRow>
                                </thead>
                                <tbody>
                                    {loading && logRows.length === 0 ? (
                                        <tr>
                                            <td colSpan={HISTORY_COLUMN_COUNT} className="px-4 py-8 text-center text-[14px] text-gray-500">
                                                Loading expense audit log…
                                            </td>
                                        </tr>
                                    ) : filteredRows.length === 0 ? (
                                        <tr>
                                            <td colSpan={HISTORY_COLUMN_COUNT} className="px-4 py-8 text-center text-[14px] text-gray-500">
                                                {logRows.length === 0
                                                    ? 'No audit entries returned for current branch (edits may not be logged yet).'
                                                    : 'No rows match your search.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        pageRows.map((row, i) => {
                                            const rowId = row.key || `${startIdx + i}`;
                                            const projectTdClass = getEdbcColumnConfig(EDBC_IDS.EDBC3)?.tdClass || '';
                                            return (
                                                <EdbcTableBodyRow key={row.key}>
                                                    {renderAuditCell(rowId, 'editedDate', formatLogTimestamp(row.editedDate), EDBC_IDS.EDBC1)}
                                                    {renderAuditCell(rowId, 'expenseId', String(row.expenseId), 'audit-expense-id', 'text-right text-gray-600', EDBC_IDS.EDBC17)}
                                                    {renderAuditCell(rowId, 'editedBy', row.editedBy, 'audit-edited-by', '', EDBC_IDS.EDBC16)}
                                                    {renderAuditCell(rowId, 'dateChange', row.dateChange, EDBC_IDS.EDBC2)}
                                                    <td id={EDBC_IDS.EDBC3} className={`${projectTdClass} align-top py-1`}>
                                                        {renderSiteChangeCell(row.siteChange)}
                                                    </td>
                                                    {renderAuditCell(rowId, 'vendorChange', row.vendorChange, EDBC_IDS.EDBC4)}
                                                    {renderAuditCell(rowId, 'contractorChange', row.contractorChange, EDBC_IDS.EDBC5)}
                                                    {renderAuditCell(rowId, 'staffChange', row.staffChange, EDBC_IDS.EDBC6)}
                                                    {renderAuditCell(rowId, 'quantityChange', row.quantityChange, EDBC_IDS.EDBC7)}
                                                    {renderAuditCell(rowId, 'amountChange', row.amountChange, EDBC_IDS.EDBC8, 'text-right')}
                                                    {renderAuditCell(rowId, 'commentsSnippet', row.commentsSnippet, EDBC_IDS.EDBC9)}
                                                    {renderAuditCell(rowId, 'categoryChange', row.categoryChange, EDBC_IDS.EDBC10)}
                                                    {renderAuditCell(rowId, 'accountTypeChange', row.accountTypeChange, EDBC_IDS.EDBC12)}
                                                    {renderAuditCell(rowId, 'utilityTypeChange', row.utilityTypeChange, 'audit-utility-type', '', EDBC_IDS.EDBC10)}
                                                    {renderAuditCell(rowId, 'serviceNumberChange', row.serviceNumberChange, EDBC_IDS.EDBC22, 'text-right')}
                                                    {renderAuditCell(rowId, 'paymentModeChange', row.paymentModeChange, EDBC_IDS.EDBC13)}
                                                    {renderAuditCell(rowId, 'eno', String(row.eno), EDBC_IDS.EDBC17, 'text-right')}
                                                </EdbcTableBodyRow>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex shrink-0 items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-700">Items per page:</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
                                >
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                    <option value={200}>200</option>
                                    <option value={300}>300</option>
                                    <option value={400}>400</option>
                                    <option value={500}>500</option>
                                    <option value={600}>600</option>
                                    <option value={700}>700</option>
                                    <option value={800}>800</option>
                                    <option value={900}>900</option>
                                    <option value={1000}>1000</option>
                                </select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-700">
                                    Showing {filteredRows.length === 0 ? 0 : startIdx + 1} to {endIndex} of{' '}
                                    {filteredRows.length} entries
                                </span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <button
                                    type="button"
                                    disabled={page <= 1}
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#BF9853] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = idx + 1;
                                    } else if (page <= 3) {
                                        pageNum = idx + 1;
                                    } else if (page >= totalPages - 2) {
                                        pageNum = totalPages - 4 + idx;
                                    } else {
                                        pageNum = page - 2 + idx;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            type="button"
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#BF9853] ${
                                                page === pageNum
                                                    ? 'bg-[#BF9853] text-white border-[#BF9853]'
                                                    : 'border-gray-300 hover:bg-[#BF9853] hover:text-white'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    type="button"
                                    disabled={page >= totalPages}
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#BF9853] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DatabaseExpenseHistoryLog;
