import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import Reload from '../Images/rotate-right.png';

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

const formatPair = (oldVal, newVal, mode = 'text') => {
    const o = oldVal === null || oldVal === undefined || oldVal === '' ? '—' : String(oldVal);
    const n = newVal === null || newVal === undefined || newVal === '' ? '—' : String(newVal);
    if (mode === 'amount') {
        return `${formatInr(oldVal)} → ${formatInr(newVal)}`;
    }
    if (o === n) return n;
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
        return `${ocs.slice(0, 40)}${ocs.length > 40 ? '…' : ''} → ${ncs.slice(0, 40)}${ncs.length > 40 ? '…' : ''}`;
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

    const onMouseDown = (e) => {
        if (!scrollRef.current) return;
        isDragging.current = true;
        start.current = { x: e.clientX, y: e.clientY };
        scroll.current = { left: scrollRef.current.scrollLeft, top: scrollRef.current.scrollTop };
        scrollRef.current.style.cursor = 'grabbing';
        scrollRef.current.style.userSelect = 'none';
    };
    const onMouseMove = (e) => {
        if (!isDragging.current || !scrollRef.current) return;
        const dx = e.clientX - start.current.x;
        const dy = e.clientY - start.current.y;
        scrollRef.current.scrollLeft = scroll.current.left - dx;
        scrollRef.current.scrollTop = scroll.current.top - dy;
    };
    const endDrag = () => {
        isDragging.current = false;
        if (scrollRef.current) {
            scrollRef.current.style.cursor = 'grab';
            scrollRef.current.style.userSelect = '';
        }
    };

    return (
        <div className="bg-[#FAF6ED] px-6 pb-8">
            <div className="w-full p-6 bg-white shadow-lg overflow-x-auto rounded-lg">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-left text-[#202020]">Database history log</h1>
                        
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {loading && (
                            <span className="text-sm text-gray-600">Loading…</span>
                        )}
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search user, E.No, site, amount…"
                            className="border-2 border-[#BF9853] border-opacity-25 rounded-lg px-3 py-2 text-sm w-[min(100%,280px)] focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
                        />
                        <button
                            type="button"
                            onClick={() => void loadHistory()}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-[#BF9853] border-opacity-40 text-sm font-semibold text-[#BF9853] hover:bg-[#FAF6ED] disabled:opacity-50"
                        >
                            <img src={Reload} alt="" className="w-4 h-4" />
                            Reload
                        </button>
                    </div>
                </div>

                {error && <div className="mb-3 text-sm text-red-600 text-left">{error}</div>}

                <div
                    ref={scrollRef}
                    className="overflow-auto max-h-[70vh] border border-l-8 border-l-[#BF9853] rounded-lg thin-scrollbar cursor-grab select-none"
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={endDrag}
                    onMouseLeave={endDrag}
                >
                    <table className="w-full min-w-[1100px] border-collapse text-left">
                        <thead className="bg-[#FAF6ED] sticky top-0 z-10">
                            <tr>
                                <th className="px-3 py-3 text-sm font-bold whitespace-nowrap border-b">#</th>
                                <th className="px-3 py-3 text-sm font-bold whitespace-nowrap border-b">Edited (log time)</th>
                                <th className="px-3 py-3 text-sm font-bold whitespace-nowrap border-b">Edited by</th>
                                <th className="px-3 py-3 text-sm font-bold whitespace-nowrap border-b">E.No</th>
                                <th className="px-3 py-3 text-sm font-bold whitespace-nowrap border-b">Expense id</th>
                                <th className="px-3 py-3 text-sm font-bold border-b min-w-[200px]">Site (old → new)</th>
                                <th className="px-3 py-3 text-sm font-bold whitespace-nowrap border-b">A/C type</th>
                                <th className="px-3 py-3 text-sm font-bold border-b min-w-[200px]">Amount (old → new)</th>
                                <th className="px-3 py-3 text-sm font-bold border-b min-w-[160px]">Entry date (old → new)</th>
                                <th className="px-3 py-3 text-sm font-bold border-b min-w-[160px]">Category (old → new)</th>
                                <th className="px-3 py-3 text-sm font-bold border-b min-w-[200px]">Comments (trimmed)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && logRows.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                                        Loading expense audit log…
                                    </td>
                                </tr>
                            ) : filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                                        {logRows.length === 0
                                            ? 'No audit entries returned for current branch (edits may not be logged yet).'
                                            : 'No rows match your search.'}
                                    </td>
                                </tr>
                            ) : (
                                pageRows.map((row, i) => (
                                    <tr key={row.key} className="odd:bg-white even:bg-[#FAF6ED]">
                                        <td className="px-3 py-2 text-sm">{startIdx + i + 1}</td>
                                        <td className="px-3 py-2 text-sm whitespace-nowrap">{formatLogTimestamp(row.editedDate)}</td>
                                        <td className="px-3 py-2 text-sm">{row.editedBy}</td>
                                        <td className="px-3 py-2 text-sm font-semibold">{row.eno}</td>
                                        <td className="px-3 py-2 text-sm text-gray-600">{row.expenseId}</td>
                                        <td className="px-3 py-2 text-sm break-words max-w-[280px]">{row.siteChange}</td>
                                        <td className="px-3 py-2 text-sm">{row.accountType}</td>
                                        <td className="px-3 py-2 text-sm whitespace-nowrap">{row.amountChange}</td>
                                        <td className="px-3 py-2 text-sm">{row.dateChange}</td>
                                        <td className="px-3 py-2 text-sm break-words">{row.categoryChange}</td>
                                        <td className="px-3 py-2 text-sm text-gray-700 break-words max-w-[320px]" title={row.commentsSnippet}>
                                            {row.commentsSnippet}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredRows.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-4 px-1">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <span>Rows per page:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                            >
                                {[25, 50, 100, 200].map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                            <span>
                                Showing {filteredRows.length === 0 ? 0 : startIdx + 1}–
                                {Math.min(startIdx + itemsPerPage, filteredRows.length)} of {filteredRows.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-[#BF9853] hover:text-white border-gray-300"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-600 px-2">
                                Page {page} / {totalPages}
                            </span>
                            <button
                                type="button"
                                disabled={page >= totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-[#BF9853] hover:text-white border-gray-300"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DatabaseExpenseHistoryLog;
