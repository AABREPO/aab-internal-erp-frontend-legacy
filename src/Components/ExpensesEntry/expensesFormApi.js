const EXPENSES_FORM_BASE_URL = 'https://backendaab.in/demoAabuilderDash/expenses_form';

export const normalizeExpenseRecord = (expense) => {
    if (!expense || typeof expense !== 'object') return expense;
    const branchId = expense.branchId ?? expense.branch_id;
    const eno = expense.eno ?? expense.eNo ?? expense.ENo;
    return {
        ...expense,
        eno,
        branchId,
        branch_id: branchId,
    };
};

export const getExpenseRecordKey = (expense) => {
    const normalized = normalizeExpenseRecord(expense);
    if (normalized.id != null && normalized.id !== '') return String(normalized.id);
    if (normalized.eno != null && normalized.eno !== '') return `eno-${normalized.eno}`;
    return null;
};

export const sortExpensesByEnoDesc = (expenses) =>
    [...expenses].sort((a, b) => {
        const enoA = parseInt(a.eno, 10);
        const enoB = parseInt(b.eno, 10);
        return (Number.isFinite(enoB) ? enoB : 0) - (Number.isFinite(enoA) ? enoA : 0);
    });

export const filterExpensesByBranch = (expenses, branchId) => {
    if (!branchId) return expenses;
    return expenses.filter((expense) => {
        const expenseBranchId = expense.branch_id ?? expense.branchId;
        return expenseBranchId == null || String(expenseBranchId) === String(branchId);
    });
};

export const buildExpensesFilterDto = ({ branchId } = {}) => {
    const filter = {};
    if (branchId) filter.branchId = Number(branchId);
    return filter;
};

export const mergeExpenseRecords = (existingMap, records) => {
    const nextMap = existingMap instanceof Map ? new Map(existingMap) : new Map();
    (records || []).forEach((record) => {
        const key = getExpenseRecordKey(record);
        if (!key) return;
        nextMap.set(key, normalizeExpenseRecord(record));
    });
    return nextMap;
};

export const expensesMapToSortedList = (expenseMap, branchId) =>
    sortExpensesByEnoDesc(filterExpensesByBranch(Array.from(expenseMap.values()), branchId));

export async function fetchLast400Expenses() {
    const response = await fetch(`${EXPENSES_FORM_BASE_URL}/get/last_400`);
    if (!response.ok) {
        throw new Error(`Failed to fetch last 400 expenses (${response.status})`);
    }
    const data = await response.json();
    return (Array.isArray(data) ? data : []).map(normalizeExpenseRecord);
}

export async function fetchAllExpensesLegacy(branchId) {
    const url = new URL(`${EXPENSES_FORM_BASE_URL}/get_form`);
    if (branchId) url.searchParams.set('branchId', String(branchId));
    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error(`Failed to fetch expenses (${response.status})`);
    }
    const data = await response.json();
    return (Array.isArray(data) ? data : []).map(normalizeExpenseRecord);
}

export async function streamFilteredExpenses(filter, handlers = {}, signal) {
    const { onRecent, onChunk, onComplete, onError } = handlers;
    const response = await fetch(`${EXPENSES_FORM_BASE_URL}/filter`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/x-ndjson',
        },
        body: JSON.stringify(filter ?? {}),
        signal,
    });

    if (!response.ok) {
        throw new Error(`Expense filter stream failed (${response.status})`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error('Expense filter stream is not supported in this browser');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    const handlePayload = (payload) => {
        if (!payload || typeof payload !== 'object') return;
        if (payload.type === 'recent') onRecent?.(payload);
        else if (payload.type === 'chunk') onChunk?.(payload);
        else if (payload.type === 'complete') onComplete?.(payload);
    };

    const parseLine = (line) => {
        if (!line.trim()) return;
        try {
            handlePayload(JSON.parse(line));
        } catch (error) {
            onError?.(error, line);
        }
    };

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        lines.forEach(parseLine);
    }

    if (buffer.trim()) {
        parseLine(buffer);
    }
}
