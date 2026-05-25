import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import Reload from '../Images/Clear.svg';
import Search from '../Images/Searchnew.svg';

const GET_FORM_URL = 'https://backendaab.in/demoAabuilderDash/expenses_form/get_form';
/** Bulk audit log — single response (see ExpensesController GET /expenses_form/get/full_history). */
const FULL_HISTORY_URL = 'https://backendaab.in/demoAabuilderDash/expenses_form/get/full_history';

const formatLogTimestamp = (dateString) => {
    if (!dateString) return '—';
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
    if (value === null || value === undefined || value === '') return '—';
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const isEmptyValue = (value) => value === null || value === undefined || value === '';

const valuesEqual = (oldVal, newVal, mode = 'text') => {
    if (isEmptyValue(oldVal) && isEmptyValue(newVal)) return true;
    if (mode === 'amount') {
        const oldNum = Number(oldVal);
        const newNum = Number(newVal);
        if (!Number.isNaN(oldNum) && !Number.isNaN(newNum)) return oldNum === newNum;
    }
    const o = isEmptyValue(oldVal) ? '—' : String(oldVal).trim();
    const n = isEmptyValue(newVal) ? '—' : String(newVal).trim();
    return o === n;
};

const renderSiteChangeCell = (value) => {
    const text = value == null || value === '' ? '—' : String(value);
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
    if (valuesEqual(oldVal, newVal, mode)) {
        if (mode === 'amount') {
            if (isEmptyValue(oldVal) && isEmptyValue(newVal)) return '—';
            return formatInr(newVal ?? oldVal);
        }
        return isEmptyValue(newVal) ? '—' : String(newVal);
    }
    if (mode === 'amount') {
        return `${formatInr(oldVal)} → ${formatInr(newVal)}`;
    }
    const o = isEmptyValue(oldVal) ? '—' : String(oldVal);
    const n = isEmptyValue(newVal) ? '—' : String(newVal);
    return `${o} → ${n}`;
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

/** Normalize audit row from entity JSON (camelCase or snake_case). */
const pick = (row, camel, snake) => row[camel] ?? row[snake];

const mapAuditToDisplayRow = (audit, idx, enoByExpenseId) => {
    const expenseId = pick(audit, 'expenseId', 'expense_id');
    const auditRowId = audit.id;
    const editedDate = pick(audit, 'editedDate', 'edited_date');
    const editedBy = pick(audit, 'editedBy', 'edited_by') ?? '—';
    const eidStr = expenseId != null ? String(expenseId) : '';
    const eno = eidStr && enoByExpenseId.has(eidStr) ? enoByExpenseId.get(eidStr) : '—';

    const oldDateRaw = pick(audit, 'oldDate', 'old_date');
    const newDateRaw = pick(audit, 'newDate', 'new_date');
    const fmtEntryDate = (raw) => {
        if (raw == null || raw === '') return '';
        const d = new Date(raw);
        return Number.isNaN(d.getTime()) ? String(raw) : d.toLocaleDateString('en-GB');
    };

    const oc = pick(audit, 'oldComments', 'old_comments');
    const nc = pick(audit, 'newComments', 'new_comments');
    const commentsSnippet = (() => {
        const ocs = oc != null ? String(oc) : '';
        const ncs = nc != null ? String(nc) : '';
        if (!ocs && !ncs) return '—';
        const trimSnippet = (s) => `${s.slice(0, 40)}${s.length > 40 ? '…' : ''}`;
        if (ocs === ncs) return trimSnippet(ncs);
        return `${trimSnippet(ocs)} → ${trimSnippet(ncs)}`;
    })();

    return {
        key: auditRowId != null ? `audit-${auditRowId}` : `audit-${eidStr}-${idx}-${editedDate || ''}-${editedBy}`,
        expenseId: expenseId ?? '—',
        eno,
        editedDate,
        editedBy,
        accountType:
            pick(audit, 'newAccountType', 'new_account_type') ??
            pick(audit, 'oldAccountType', 'old_account_type') ??
            '—',
        amountChange: formatPair(pick(audit, 'oldAmount', 'old_amount'), pick(audit, 'newAmount', 'new_amount'), 'amount'),
        siteChange: formatPair(pick(audit, 'oldSiteName', 'old_site_name'), pick(audit, 'newSiteName', 'new_site_name'), 'text'),
        dateChange: formatPair(fmtEntryDate(oldDateRaw), fmtEntryDate(newDateRaw), 'text'),
        categoryChange: formatPair(pick(audit, 'oldCategory', 'old_category'), pick(audit, 'newCategory', 'new_category'), 'text'),
        vendorChange: formatPair(pick(audit, 'oldVendor', 'old_vendor'), pick(audit, 'newVendor', 'new_vendor'), 'text'),
        contractorChange: formatPair(
            pick(audit, 'oldContractor', 'old_contractor'),
            pick(audit, 'newContractor', 'new_contractor'),
            'text'
        ),
        commentsSnippet,
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
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [expandedCells, setExpandedCells] = useState({});
    const scrollRef = useRef(null);
    const isDragging = useRef(false);
    const start = useRef({ x: 0, y: 0 });
    const scroll = useRef({ left: 0, top: 0 });

    const toggleExpandedCell = (key) => {
        setExpandedCells((prev) => ({ ...prev, [key]: !prev[key] }));
    };

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
            const [historyRes, formRes] = await Promise.all([
                axios.get(FULL_HISTORY_URL),
                axios.get(GET_FORM_URL, { params: formParams }),
            ]);

            const allAudits = Array.isArray(historyRes.data) ? historyRes.data : [];
            const expenses = Array.isArray(formRes.data) ? formRes.data : [];

            const enoByExpenseId = new Map();
            const allowedExpenseIds = new Set();
            expenses.forEach((e) => {
                if (!e || e.id == null) return;
                const idStr = String(e.id);
                allowedExpenseIds.add(idStr);
                const eno = e.eno ?? e.eNo ?? e.ENo ?? '—';
                enoByExpenseId.set(idStr, eno);
            });

            const scopedAudits = allAudits.filter((a) => {
                const eid = pick(a, 'expenseId', 'expense_id');
                if (eid == null) return false;
                if (allowedExpenseIds.size === 0) return false;
                return allowedExpenseIds.has(String(eid));
            });

            const flat = scopedAudits.map((audit, idx) => mapAuditToDisplayRow(audit, idx, enoByExpenseId));
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

    useEffect(() => {
        if (!isActive) return;
        void loadHistory();
    }, [isActive, activeBranchId, loadHistory]);

    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return logRows;
        return logRows.filter((row) => {
            const blob = [
                row.editedBy,
                String(row.eno),
                row.accountType,
                row.siteChange,
                row.amountChange,
                row.categoryChange,
                row.vendorChange,
                row.contractorChange,
                row.commentsSnippet,
                String(row.expenseId),
            ]
                .join(' ')
                .toLowerCase();
            return blob.includes(q);
        });
    }, [logRows, search]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
    const page = Math.min(currentPage, totalPages);
    const startIdx = (page - 1) * itemsPerPage;
    const pageRows = filteredRows.slice(startIdx, startIdx + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, itemsPerPage, logRows.length]);

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

    return (
        <div className="flex flex-col h-[calc(100vh-104px)] overflow-hidden bg-[#FAF6ED]">
            <div className="px-[18px] pt-[18px] pb-[18px] flex flex-col flex-1 min-h-0 overflow-hidden bg-[#FAF6ED]">
                <div className="w-full pt-[18px] px-[18px] bg-white rounded-[6px] flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="flex flex-row justify-between items-center mb-[12px] gap-[6px]">
                        <h1 className="text-[18px] font-bold text-left text-[#202020]">Database history log</h1>
                        <div className="flex items-end gap-[6px]">
                            {loading && (
                                <span className="text-sm text-gray-600 pb-1">Loading…</span>
                            )}
                            <button
                                type="button"
                                onClick={() => void loadHistory()}
                                disabled={loading}
                                className="flex h-[30px] w-[30px] shrink-0 items-center justify-center disabled:opacity-50"
                            >
                                <img className="w-full h-full" src={Reload} alt="Reload" />
                            </button>
                            <div className="w-[286px] min-w-[286px] translate-y-[2px] shrink-0 h-[34px] border border-[#D6D6D6] rounded-md bg-white flex items-center px-2 gap-1">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search Transactions..."
                                    className="h-full w-full border-0 p-0 text-[14px] text-[#000000] bg-transparent outline-none"
                                />
                                <img src={Search} alt="Search" className="w-[16px] h-[16px] pointer-events-none" />
                            </div>
                        </div>
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
                            <table className="table-fixed w-full min-w-[1920px] border-collapse">
                                <thead className="sticky top-0 z-10 bg-white">
                                    <tr className="bg-[#FAF6ED] h-[40px] text-[16px] font-bold text-center">
                                        <th className="pl-[12px] w-[50px] font-bold text-left">#</th>
                                        <th className="pl-[1px] pr-[1px] w-[168px] font-bold text-left">Edited (log time)</th>
                                        <th className="pl-[1px] pr-[1px] w-[120px] font-bold text-left">Edited by</th>
                                        <th className="pl-[1px] pr-[1px] w-[80px] font-bold text-right">E.No</th>
                                        <th className="pl-[1px] pr-[12px] w-[120px] font-bold text-right">Expense id</th>
                                        <th className="pl-[4px] pr-[1px] w-[298px] font-bold text-left">Site (old → new)</th>
                                        <th className="pl-[1px] pr-[1px] w-[158px] font-bold text-left">A/C type</th>
                                        <th className="pl-[1px] pr-[12px] w-[158px] font-bold text-right">Amount (old → new)</th>
                                        <th className="pl-[4px] pr-[1px] w-[170px] font-bold text-left">Entry date (old → new)</th>
                                        <th className="pl-[1px] pr-[1px] w-[158px] font-bold text-left">Category (old → new)</th>
                                        <th className="pl-[9px] pr-[12px] w-[248px] font-bold text-left">Comments (trimmed)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading && logRows.length === 0 ? (
                                        <tr>
                                            <td colSpan={11} className="px-4 py-8 text-center text-[14px] text-gray-500">
                                                Loading expense audit log…
                                            </td>
                                        </tr>
                                    ) : filteredRows.length === 0 ? (
                                        <tr>
                                            <td colSpan={11} className="px-4 py-8 text-center text-[14px] text-gray-500">
                                                {logRows.length === 0
                                                    ? 'No audit entries returned for current branch (edits may not be logged yet).'
                                                    : 'No rows match your search.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        pageRows.map((row, i) => {
                                            const rowId = row.key || `${startIdx + i}`;
                                            const cell = (field, value, className = 'text-left') => (
                                                <span
                                                    onClick={() => toggleExpandedCell(`${rowId}-${field}`)}
                                                    className={`block w-full cursor-pointer ${expandedCells[`${rowId}-${field}`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'} ${className}`}
                                                    title={value}
                                                >
                                                    {value}
                                                </span>
                                            );
                                            return (
                                                <tr key={row.key} className="odd:bg-white even:bg-[#FAF6ED] text-[14px] font-semibold min-h-[40px]">
                                                    <td className="pl-[12px] w-[50px] text-left">{startIdx + i + 1}</td>
                                                    <td className="pl-[1px] pr-[1px] w-[168px] text-left">
                                                        {cell('editedDate', formatLogTimestamp(row.editedDate))}
                                                    </td>
                                                    <td className="pl-[1px] pr-[1px] w-[120px] text-left">
                                                        {cell('editedBy', row.editedBy)}
                                                    </td>
                                                    <td className="pl-[1px] pr-[1px] w-[80px] text-right">
                                                        {cell('eno', String(row.eno), 'text-right')}
                                                    </td>
                                                    <td className="pl-[1px] pr-[12px] w-[120px] text-right text-gray-600">
                                                        {cell('expenseId', String(row.expenseId), 'text-right')}
                                                    </td>
                                                    <td className="pl-[4px] pr-[1px] w-[298px] text-left align-top py-1">
                                                        {renderSiteChangeCell(row.siteChange)}
                                                    </td>
                                                    <td className="pl-[1px] pr-[1px] w-[158px] text-left">
                                                        {cell('accountType', row.accountType)}
                                                    </td>
                                                    <td className="pl-[1px] pr-[12px] w-[120px] text-right">
                                                        {cell('amountChange', row.amountChange, 'text-right')}
                                                    </td>
                                                    <td className="pl-[4px] pr-[1px] w-[170px] text-left">
                                                        {cell('dateChange', row.dateChange)}
                                                    </td>
                                                    <td className="pl-[1px] pr-[1px] w-[158px] text-left">
                                                        {cell('categoryChange', row.categoryChange)}
                                                    </td>
                                                    <td className="pl-[9px] pr-[12px] w-[248px] text-left text-gray-700">
                                                        {cell('commentsSnippet', row.commentsSnippet)}
                                                    </td>
                                                </tr>
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
                                    {[25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map((n) => (
                                        <option key={n} value={n}>
                                            {n}
                                        </option>
                                    ))}
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
