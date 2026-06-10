const GET_FORM_URL = 'https://backendaab.in/demoAabuilderDash/expenses_form/get_form';
const CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_ENO = 54173;

let cache = {
    branchKey: null,
    fetchedAt: 0,
    expenses: [],
    byDate: new Map(),
};

let inFlightKey = null;
let inFlight = null;

export const toExpenseLocalDateStr = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const normalizeStr = (s) => (s == null ? '' : String(s).trim());

const branchCacheKey = (branchId) => {
    if (branchId === null || branchId === undefined || branchId === '') return '';
    return String(branchId);
};

const buildBranchUrl = (branchId) => {
    const url = new URL(GET_FORM_URL);
    const key = branchCacheKey(branchId);
    if (key) {
        url.searchParams.set('branchId', key);
    }
    return url.toString();
};

const buildByDateIndex = (expenses) => {
    const byDate = new Map();
    for (const exp of expenses) {
        const dateStr = toExpenseLocalDateStr(exp.date || exp.timestamp);
        if (!dateStr) continue;
        const bucket = byDate.get(dateStr);
        if (bucket) bucket.push(exp);
        else byDate.set(dateStr, [exp]);
    }
    return byDate;
};

const isCacheFresh = (branchKey) =>
    cache.fetchedAt > 0 &&
    Date.now() - cache.fetchedAt < CACHE_TTL_MS &&
    cache.branchKey === branchKey;

export const populateExpensesFormCache = (expenses, branchId = null) => {
    const branchKey = branchCacheKey(branchId);
    const list = Array.isArray(expenses) ? expenses : [];
    cache = {
        branchKey,
        fetchedAt: Date.now(),
        expenses: list,
        byDate: buildByDateIndex(list),
    };
};

export const invalidateExpensesFormPrefetch = (branchId = null) => {
    const branchKey = branchCacheKey(branchId);
    if (branchId == null || cache.branchKey === branchKey) {
        cache = { branchKey: null, fetchedAt: 0, expenses: [], byDate: new Map() };
        inFlight = null;
        inFlightKey = null;
    }
};

export const appendExpenseToFormCache = (expense, branchId = null) => {
    if (!expense || typeof expense !== 'object') return;
    const branchKey = branchCacheKey(branchId);
    if (cache.branchKey !== branchKey || cache.expenses.length === 0) return;

    cache.expenses.push(expense);
    const dateStr = toExpenseLocalDateStr(expense.date || expense.timestamp);
    if (!dateStr) return;
    const bucket = cache.byDate.get(dateStr);
    if (bucket) bucket.push(expense);
    else cache.byDate.set(dateStr, [expense]);
};

export const getLatestEnoFromExpenses = (expenses = cache.expenses) => {
    if (!Array.isArray(expenses) || expenses.length === 0) return DEFAULT_ENO;
    let maxEno = 0;
    for (const exp of expenses) {
        const n = Number(exp?.eno ?? 0);
        if (n > maxEno) maxEno = n;
    }
    return maxEno > 0 ? maxEno + 1 : DEFAULT_ENO;
};

export const findDuplicateExpenses = ({
    dateStr,
    amountNum,
    siteLabel,
    selectedProjectId,
    selectedType,
    vendorLabel,
    contractorLabel,
    selectedId,
    branchId = null,
} = {}) => {
    const branchKey = branchCacheKey(branchId);
    if (cache.branchKey !== branchKey || !dateStr) return [];

    const candidates = cache.byDate.get(dateStr) || [];
    if (candidates.length === 0) return [];

    const normalizedSite = normalizeStr(siteLabel);
    const normalizedVendor = normalizeStr(vendorLabel);
    const normalizedContractor = normalizeStr(contractorLabel);
    const projectIdNum = selectedProjectId != null ? Number(selectedProjectId) : null;
    const partyIdNum = selectedId != null ? Number(selectedId) : null;

    const matching = [];
    for (const exp of candidates) {
        const expAmount = Math.abs(parseFloat(exp.amount) || 0);
        if (Math.abs(expAmount - amountNum) >= 0.01) continue;

        const expSiteName = normalizeStr(exp.siteName || exp.projectName || '');
        const expProjectId = exp.projectId ?? exp.project_id ?? null;
        const projectMatch =
            (normalizedSite && expSiteName && expSiteName === normalizedSite) ||
            (projectIdNum && expProjectId != null && Number(expProjectId) === projectIdNum);
        if (!projectMatch) continue;

        const expVendor = normalizeStr(exp.vendor || '');
        const expContractor = normalizeStr(exp.contractor || '');
        const expVendorId = exp.vendorId ?? exp.vendor_id ?? null;
        const expContractorId = exp.contractorId ?? exp.contractor_id ?? null;

        let vendorContractorMatch = false;
        if (selectedType === 'Vendor') {
            vendorContractorMatch =
                (normalizedVendor && expVendor === normalizedVendor) ||
                (partyIdNum != null && expVendorId != null && Number(expVendorId) === partyIdNum);
        } else if (selectedType === 'Contractor') {
            vendorContractorMatch =
                (normalizedContractor && expContractor === normalizedContractor) ||
                (partyIdNum != null && expContractorId != null && Number(expContractorId) === partyIdNum);
        }
        if (!vendorContractorMatch) continue;

        matching.push(exp);
    }

    return matching;
};

export async function prefetchExpensesFormData({ branchId = null, force = false } = {}) {
    const branchKey = branchCacheKey(branchId);

    if (!force && isCacheFresh(branchKey)) {
        return cache.expenses;
    }

    if (inFlight && inFlightKey === branchKey) {
        return inFlight;
    }

    inFlightKey = branchKey;
    inFlight = (async () => {
        try {
            const response = await fetch(buildBranchUrl(branchId), {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                return cache.expenses;
            }
            const data = await response.json();
            populateExpensesFormCache(data, branchId);
            return cache.expenses;
        } catch (error) {
            console.error('Failed to prefetch expenses form data:', error);
            return cache.expenses;
        } finally {
            inFlight = null;
            inFlightKey = null;
        }
    })();

    return inFlight;
}
