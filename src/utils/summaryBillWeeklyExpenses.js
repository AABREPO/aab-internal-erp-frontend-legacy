const EXPENSES_FORM_BASE_URL = 'https://backendaab.in/demoAabuilderDash/expenses_form';

export const SUMMARY_BILL_PROJECT_ID = 7;
export const SUMMARY_BILL_PROJECT_LABEL = 'Summary Bill';

export const isSummaryBillProject = (projectId, siteOptions = []) => {
    if (Number(projectId) === SUMMARY_BILL_PROJECT_ID) return true;
    const project = siteOptions.find((opt) => Number(opt.id) === Number(projectId));
    return String(project?.label ?? project?.value ?? '').trim() === SUMMARY_BILL_PROJECT_LABEL;
};

export const isSummaryBillPaymentRow = (row, siteOptions = []) => {
    if (!row || String(row.type ?? '').trim() !== 'Bill Payment') return false;
    return isSummaryBillProject(row.project_id ?? row.projectId, siteOptions);
};

const buildBranchUrl = (baseUrl, branchId) => {
    const url = new URL(baseUrl);
    if (branchId != null && branchId !== '') {
        url.searchParams.set('branchId', String(branchId));
    }
    return url.toString();
};

export const getWeeklyExpensesIdFromExpense = (expense) =>
    expense?.weeklyExpensesId ??
    expense?.weekly_expenses_id ??
    expense?.weeklyExpenseId ??
    expense?.weekly_expense_id ??
    null;

export const getExpenseProjectId = (expense) =>
    expense?.projectId ?? expense?.project_id ?? null;

export const getExpenseAmountNumber = (expense) => {
    const raw = expense?.amount;
    const num = Number(raw);
    return Number.isFinite(num) ? Math.abs(num) : 0;
};

export async function fetchAllExpensesFormRecords(branchId) {
    const response = await fetch(buildBranchUrl(`${EXPENSES_FORM_BASE_URL}/get_form`, branchId));
    if (!response.ok) {
        throw new Error(`Failed to fetch expenses (${response.status})`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
}

export async function fetchExpensesLinkedToWeeklyExpense(weeklyExpensesId, branchId) {
    if (weeklyExpensesId == null || weeklyExpensesId === '') return [];
    const all = await fetchAllExpensesFormRecords(branchId);
    return all.filter(
        (expense) => String(getWeeklyExpensesIdFromExpense(expense)) === String(weeklyExpensesId)
    );
}

export const sumLinkedExpenseAmounts = (entries) =>
    (Array.isArray(entries) ? entries : []).reduce(
        (sum, entry) => sum + getExpenseAmountNumber(entry),
        0
    );

export const isSummaryBillAllocationComplete = (total, entries) => {
    const target = Number(total);
    if (!Number.isFinite(target) || target <= 0) return true;
    const allocated = sumLinkedExpenseAmounts(entries);
    return Math.abs(allocated - target) <= 0.01;
};

export async function deleteExpenseFormEntry(expenseId, editedBy, branchId) {
    if (expenseId == null || expenseId === '') return false;
    const deleteUrl = `${EXPENSES_FORM_BASE_URL}/delete/${expenseId}?editedBy=${encodeURIComponent(editedBy || '')}`;
    const response = await fetch(buildBranchUrl(deleteUrl, branchId), {
        method: 'POST',
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error(`Failed to delete expense entry ${expenseId}`);
    }
    return true;
}

export async function deleteExpensesLinkedToWeeklyExpense(weeklyExpensesId, editedBy, branchId) {
    const linked = await fetchExpensesLinkedToWeeklyExpense(weeklyExpensesId, branchId);
    for (const entry of linked) {
        if (entry?.id == null) continue;
        await deleteExpenseFormEntry(entry.id, editedBy, branchId);
    }
    return linked.length;
}

export const weeklyRowHadExpenseEntryLink = (row, siteOptions = []) => {
    if (!row) return false;
    if (isSummaryBillPaymentRow(row, siteOptions)) return true;
    const type = String(row.type ?? '').trim();
    if (type !== 'Bill Payment' && type !== 'Claim') return false;
    return Boolean(
        row.expenses_entry_id ??
            row.expensesEntryId ??
            row.bill_copy_url ??
            row.billCopyUrl ??
            ''
    );
};

export async function clearLinkedExpensesOnWeeklyTypeChange(
    weeklyExpensesId,
    row,
    editedBy,
    branchId
) {
    const deletedIds = new Set();
    const linked = await fetchExpensesLinkedToWeeklyExpense(weeklyExpensesId, branchId);
    for (const entry of linked) {
        if (entry?.id == null) continue;
        await deleteExpenseFormEntry(entry.id, editedBy, branchId);
        deletedIds.add(String(entry.id));
    }
    const singleId = row?.expenses_entry_id ?? row?.expensesEntryId ?? null;
    if (singleId != null && singleId !== '' && !deletedIds.has(String(singleId))) {
        await deleteExpenseFormEntry(singleId, editedBy, branchId);
    }
    return linked.length;
};

export async function clearWeeklyExpenseBillCopyUrl(weeklyExpenseId, editedBy) {
    if (weeklyExpenseId == null) return false;
    const response = await fetch(
        `https://backendaab.in/demoAabuildersDash/api/weekly-expenses/${weeklyExpenseId}/remove-bill`,
        {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editedBy || ''),
        }
    );
    return response.ok;
}

export async function updatePartyOnLinkedExpenses(
    weeklyExpensesId,
    { vendor, vendorId, contractor, contractorId, editedBy, branchId }
) {
    const linked = await fetchExpensesLinkedToWeeklyExpense(weeklyExpensesId, branchId);
    for (const entry of linked) {
        if (entry?.id == null) continue;
        const updateUrl = buildBranchUrl(`${EXPENSES_FORM_BASE_URL}/update/${entry.id}`, branchId);
        const payload = {
            ...entry,
            id: entry.id,
            vendor: vendor ?? entry.vendor ?? '',
            vendorId: vendorId ?? entry.vendorId ?? entry.vendor_id ?? null,
            vendor_id: vendorId ?? entry.vendorId ?? entry.vendor_id ?? null,
            contractor: contractor ?? entry.contractor ?? '',
            contractorId: contractorId ?? entry.contractorId ?? entry.contractor_id ?? null,
            contractor_id: contractorId ?? entry.contractorId ?? entry.contractor_id ?? null,
            editedBy: editedBy || entry.editedBy || '',
        };
        const response = await fetch(updateUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error(`Failed to update linked expense entry ${entry.id}`);
        }
    }
    return linked.length;
}

export const syncSummaryBillEditProgress = (weeklyExpensesId, summaryBillTotal, entries) => {
    try {
        localStorage.setItem(
            'summaryBillEditProgress',
            JSON.stringify({
                weeklyExpensesId,
                summaryBillTotal: Number(summaryBillTotal) || 0,
                allocatedSum: sumLinkedExpenseAmounts(entries),
            })
        );
    } catch {
        // ignore storage failures
    }
};

export const canCloseSummaryBillExpenseModal = () => {
    try {
        const rawPrefill = localStorage.getItem('expenseEntryPrefill');
        if (!rawPrefill) return true;
        const prefill = JSON.parse(rawPrefill);
        const total = Number(prefill?.summaryBillTotal ?? prefill?.summary_bill_total ?? 0);
        if (!Number.isFinite(total) || total <= 0) return true;

        if (prefill?.summaryBillEditMode) {
            const rawProgress = localStorage.getItem('summaryBillEditProgress');
            if (!rawProgress) {
                alert('Please complete the full Summary Bill amount before closing this popup.');
                return false;
            }
            const progress = JSON.parse(rawProgress);
            if (
                String(progress?.weeklyExpensesId ?? '') !== String(prefill?.weeklyExpensesId ?? prefill?.weeklyExpenseId ?? '')
            ) {
                alert('Please complete the full Summary Bill amount before closing this popup.');
                return false;
            }
            if (!isSummaryBillAllocationComplete(total, [{ amount: progress?.allocatedSum ?? 0 }])) {
                alert('Please complete the full Summary Bill amount before closing this popup.');
                return false;
            }
            return true;
        }

        alert('Please complete the full Summary Bill amount before closing this popup.');
        return false;
    } catch {
        return true;
    }
};

export const buildSummaryBillExpenseEditPrefill = (row, siteOptions, { getVendorName, getContractorName } = {}) => {
    const base = buildBillExpenseEntryPrefill(row, siteOptions, { getVendorName, getContractorName });
    return {
        ...base,
        siteName: '',
        summaryBillTotal:
            row.amount != null && row.amount !== '' ? Number(row.amount) : null,
        summaryBillEditMode: true,
        expensesEntryId: null,
    };
};

export const resolveLinkedExpensesForWeeklyRow = async (row, branchId) => {
    if (!row?.id) return [];
    const linked = await fetchExpensesLinkedToWeeklyExpense(row.id, branchId);
    if (linked.length > 0) return linked;
    const singleId = row.expenses_entry_id ?? row.expensesEntryId ?? null;
    if (singleId == null || singleId === '') return [];
    const all = await fetchAllExpensesFormRecords(branchId);
    const match = all.find((entry) => String(entry.id) === String(singleId));
    return match ? [match] : [];
};

export const isWeeklyRowAmountMatchingLinkedExpenses = (row, linkedEntries) => {
    if (!Array.isArray(linkedEntries) || linkedEntries.length === 0) return false;
    const rowAmount = Math.abs(Number(row?.amount) || 0);
    const linkedTotal = sumLinkedExpenseAmounts(linkedEntries);
    return Math.abs(rowAmount - linkedTotal) <= 0.01;
};

export const buildBillExpenseEntryPrefill = (row, siteOptions, { getVendorName, getContractorName } = {}) => {
    const project = siteOptions.find((opt) => Number(opt.id) === Number(row.project_id));
    const resolvedSiteName = project?.label ?? '';
    const isSummaryBillProject = String(resolvedSiteName).trim() === SUMMARY_BILL_PROJECT_LABEL;
    const siteName = isSummaryBillProject ? '' : resolvedSiteName;
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
        (rawVid != null && !Number.isNaN(Number(rawVid)) && getVendorName
            ? getVendorName(Number(rawVid))
            : '') ??
        '';
    const contractorName =
        row.contractor ??
        row.contractor_name ??
        row.contractorName ??
        (rawCid != null && !Number.isNaN(Number(rawCid)) && getContractorName
            ? getContractorName(Number(rawCid))
            : '') ??
        '';
    return {
        accountType: row.type === 'Claim' ? 'Claim Payment' : 'Bill Payments',
        siteName,
        amount: row.amount,
        date: dateStr,
        client_id: row.client_id ?? row.clientId ?? '',
        client_name: row.client_name ?? row.clientName ?? '',
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
            isSummaryBillProject && row.amount != null && row.amount !== ''
                ? Number(row.amount)
                : null,
        paymentMode: 'Cash',
        expensesEntryId: row.expenses_entry_id ?? row.expensesEntryId ?? null,
        fromWeeklyCashRegister: true,
        weeklyExpenseId: row.id,
        weeklyExpensesId: row.id,
        weeklyExpenseRow: row,
        source: 'Cash Register',
    };
};
