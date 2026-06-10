import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { populateExpensesFormCache } from '../../utils/expensesFormPrefetch';
import {
    buildExpensesFilterDto,
    expensesMapToSortedList,
    fetchAllExpensesLegacy,
    fetchLast400Expenses,
    filterExpensesByBranch,
    mergeExpenseRecords,
    streamFilteredExpenses,
} from './expensesFormApi';

export const EXPENSES_LIST_POLL_INTERVAL_MS = 10_000;

const normalizeBranchId = (branchId) => {
    if (branchId == null || branchId === '') return null;
    const n = Number(branchId);
    return Number.isFinite(n) && n > 0 ? n : null;
};

let store = {
    branchId: null,
    expenseMap: new Map(),
    totalCount: null,
    loading: false,
    loadingMore: false,
    initialLoadComplete: false,
};

let cachedSnapshot = {
    expenses: [],
    totalCount: null,
    loading: false,
    loadingMore: false,
    initialLoadComplete: false,
};

const listeners = new Set();
let listenerCount = 0;
let loadAbortController = null;
let loadInFlight = null;
let pollTimer = null;
let pollInFlight = false;

const rebuildSnapshot = () => {
    cachedSnapshot = {
        expenses: expensesMapToSortedList(store.expenseMap, store.branchId),
        totalCount: store.totalCount,
        loading: store.loading,
        loadingMore: store.loadingMore,
        initialLoadComplete: store.initialLoadComplete,
    };
};

const emit = () => {
    rebuildSnapshot();
    populateExpensesFormCache(cachedSnapshot.expenses, store.branchId);
    listeners.forEach((listener) => listener());
};

const getSnapshot = () => cachedSnapshot;

const hasExpenseMapChanges = (prevMap, nextMap) => {
    if (prevMap.size !== nextMap.size) return true;
    for (const [key, value] of nextMap) {
        const prev = prevMap.get(key);
        if (!prev) return true;
        if (String(prev.timestamp ?? '') !== String(value.timestamp ?? '')) return true;
        if (String(prev.amount ?? '') !== String(value.amount ?? '')) return true;
        if (String(prev.vendor ?? '') !== String(value.vendor ?? '')) return true;
        if (String(prev.comments ?? '') !== String(value.comments ?? '')) return true;
    }
    return false;
};

const abortLoad = () => {
    loadAbortController?.abort();
    loadAbortController = null;
};

const stopPolling = () => {
    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
    }
};

const startPolling = () => {
    stopPolling();
    pollTimer = setInterval(() => {
        void silentPollLatest(store.branchId);
    }, EXPENSES_LIST_POLL_INTERVAL_MS);
};

const applyExpenseMap = (expenseMap, totalCount, { silent = false } = {}) => {
    const prevMap = store.expenseMap;
    const nextMap = expenseMap instanceof Map ? expenseMap : mergeExpenseRecords(new Map(), expenseMap);
    if (silent && !hasExpenseMapChanges(prevMap, nextMap) && store.totalCount === totalCount) {
        return false;
    }
    store.expenseMap = nextMap;
    if (typeof totalCount === 'number') {
        store.totalCount = totalCount;
    } else if (nextMap.size > (store.totalCount ?? 0)) {
        store.totalCount = nextMap.size;
    }
    emit();
    return true;
};

async function runFullLoad(branchId, { silent = false } = {}) {
    abortLoad();
    const controller = new AbortController();
    loadAbortController = controller;
    const normalizedBranchId = normalizeBranchId(branchId);

    store.branchId = normalizedBranchId;

    if (!silent) {
        store.loading = true;
        store.loadingMore = false;
        emit();
    }

    const loadLegacyExpenses = async () => {
        const legacyRows = await fetchAllExpensesLegacy(normalizedBranchId);
        if (controller.signal.aborted) return;
        const expenseMap = mergeExpenseRecords(new Map(), legacyRows);
        applyExpenseMap(expenseMap, legacyRows.length, { silent });
        store.initialLoadComplete = true;
        store.loading = false;
        store.loadingMore = false;
        emit();
    };

    try {
        let expenseMap = new Map();
        let recentRows = [];

        try {
            recentRows = filterExpensesByBranch(await fetchLast400Expenses(), normalizedBranchId);
        } catch (recentError) {
            console.warn('Last 400 expenses fetch failed, falling back to legacy get_form.', recentError);
            await loadLegacyExpenses();
            return;
        }

        if (controller.signal.aborted) return;

        expenseMap = mergeExpenseRecords(expenseMap, recentRows);
        applyExpenseMap(expenseMap, recentRows.length, { silent });
        store.loading = false;
        if (!silent) {
            store.loadingMore = true;
            emit();
        }

        const filter = buildExpensesFilterDto({ branchId: normalizedBranchId });

        try {
            await streamFilteredExpenses(filter, {
                onRecent: ({ data, totalCount }) => {
                    if (controller.signal.aborted) return;
                    expenseMap = mergeExpenseRecords(expenseMap, data);
                    applyExpenseMap(expenseMap, totalCount, { silent });
                },
                onChunk: ({ data, totalCount }) => {
                    if (controller.signal.aborted) return;
                    expenseMap = mergeExpenseRecords(expenseMap, data);
                    applyExpenseMap(expenseMap, totalCount, { silent });
                },
                onComplete: ({ totalCount }) => {
                    if (controller.signal.aborted) return;
                    applyExpenseMap(expenseMap, totalCount, { silent });
                    store.loadingMore = false;
                    store.initialLoadComplete = true;
                    emit();
                },
                onError: (error, line) => {
                    console.warn('Expense filter stream parse error:', error, line);
                },
            }, controller.signal);
        } catch (streamError) {
            if (streamError?.name === 'AbortError') return;
            console.warn('Expense filter stream failed, keeping latest loaded records.', streamError);
            store.loadingMore = false;
            store.initialLoadComplete = true;
            emit();
        }
    } catch (error) {
        if (error?.name === 'AbortError') return;
        console.error('Error fetching expenses:', error);
        try {
            await loadLegacyExpenses();
        } catch (legacyError) {
            if (legacyError?.name !== 'AbortError') {
                console.error('Legacy expenses fallback failed:', legacyError);
            }
        }
    } finally {
        if (!controller.signal.aborted && store.loading) {
            store.loading = false;
            emit();
        }
    }
}

async function silentPollLatest(branchId) {
    const normalizedBranchId = normalizeBranchId(branchId);
    if (pollInFlight || store.loading || store.loadingMore) return;
    if (!store.initialLoadComplete || store.branchId !== normalizedBranchId) return;

    pollInFlight = true;
    try {
        const recentRows = filterExpensesByBranch(await fetchLast400Expenses(), normalizedBranchId);
        const merged = mergeExpenseRecords(store.expenseMap, recentRows);
        applyExpenseMap(merged, store.totalCount, { silent: true });
    } catch (error) {
        console.warn('Silent expenses poll failed:', error);
    } finally {
        pollInFlight = false;
    }
}

export function subscribeExpensesList(listener) {
    listeners.add(listener);
    listenerCount += 1;
    if (listenerCount === 1) {
        startPolling();
    }
    return () => {
        listeners.delete(listener);
        listenerCount -= 1;
        if (listenerCount === 0) {
            stopPolling();
            abortLoad();
        }
    };
}

export function ensureExpensesListLoaded(branchId) {
    const normalizedBranchId = normalizeBranchId(branchId);

    if (
        store.initialLoadComplete &&
        store.branchId === normalizedBranchId &&
        store.expenseMap.size > 0
    ) {
        return loadInFlight ?? Promise.resolve(getSnapshot());
    }

    if (store.branchId !== normalizedBranchId) {
        abortLoad();
        store = {
            branchId: normalizedBranchId,
            expenseMap: new Map(),
            totalCount: null,
            loading: false,
            loadingMore: false,
            initialLoadComplete: false,
        };
        emit();
    }

    if (loadInFlight) return loadInFlight;

    loadInFlight = runFullLoad(normalizedBranchId, { silent: false }).finally(() => {
        loadInFlight = null;
        loadAbortController = null;
    });
    return loadInFlight;
}

export function reloadExpensesList(branchId, { silent = true } = {}) {
    const normalizedBranchId = normalizeBranchId(branchId);
    abortLoad();
    store.branchId = normalizedBranchId;
    if (!silent) {
        store.loading = true;
        store.loadingMore = false;
        store.initialLoadComplete = false;
        emit();
    }
    loadInFlight = runFullLoad(normalizedBranchId, { silent }).finally(() => {
        loadInFlight = null;
        loadAbortController = null;
    });
    return loadInFlight;
}

export function useExpensesListLoader(activeBranchId) {
    const snapshot = useSyncExternalStore(subscribeExpensesList, getSnapshot, getSnapshot);

    useEffect(() => {
        ensureExpensesListLoaded(activeBranchId).catch((error) => {
            if (error?.name !== 'AbortError') {
                console.error('Error loading expenses list:', error);
            }
        });
    }, [activeBranchId]);

    const refetchExpenses = useCallback(
        () => reloadExpensesList(activeBranchId, { silent: true }),
        [activeBranchId]
    );

    return {
        expenses: snapshot.expenses,
        expensesLoading: snapshot.loading,
        expensesLoadingMore: snapshot.loadingMore,
        expensesTotalCount: snapshot.totalCount,
        refetchExpenses,
    };
}
