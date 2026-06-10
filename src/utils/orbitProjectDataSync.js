import { prefetchIncomingTrackerData } from '../componentsMobile/Inventory/incomingTrackerPrefetch';
import { prefetchInventoryNetStockData } from '../componentsMobile/Inventory/inventoryNetStockPrefetch';
import { prefetchToolsNetStockData } from '../componentsMobile/ToolsTracker/netStockPrefetch';
import { populateExpensesFormCache } from './expensesFormPrefetch';

export const ORBIT_MODULE_SYNC_INTERVAL_MS = 60_000;
const SYNC_INTERVAL_MS = ORBIT_MODULE_SYNC_INTERVAL_MS;
const SYNC_STATUS_EVENT = 'orbitSyncStatusChanged';
const SYNC_DATA_EVENT = 'orbitProjectDataSync';
const PAGE_TABLE_REFRESH_EVENT = 'orbitPageTableRefresh';

const BASE8081 = 'https://backendaab.in/demoAabuilderDash/api';
const BASE8082 = 'https://backendaab.in/demoAabuildersDash/api';
const EXP8081 = 'https://backendaab.in/demoAabuilderDash';

let lastSyncedAt = null;
let isSyncing = false;
let syncInFlight = null;
let autoSyncTimer = null;
let getCurrentPathRef = () => window.location.pathname || '';

const statusListeners = new Set();
const refreshHandlersByModuleId = new Map();

/** Module sync tasks — background API prefetch + table refresh via registered handlers. */
const ORBIT_SYNC_MODULES = [
  {
    id: 'expense-entry',
    paths: ['/expense-entry'],
    notifyEvent: 'expensesDataSync',
    run: () =>
      fetchAll(
        [`${EXP8081}/expenses_form/get_form`, `${BASE8081}/expenses_categories/getAll`],
        { useBranch: true }
      ),
  },
  {
    id: 'portal',
    paths: ['/portal'],
    notifyEvent: 'advanceUpdated',
    run: async () => {
      await fetchAll([`${BASE8082}/advance_portal/getAll`, `${BASE8082}/weekly-payment-bills/all`]);
      await fetchJson(`${EXP8081}/expenses_form/get_form`, { useBranch: true });
    },
  },
  {
    id: 'loan',
    paths: ['/loan'],
    notifyEvent: 'loanUpdated',
    run: () =>
      fetchAll(
        [
          `${BASE8082}/loans/all`,
          `${BASE8082}/loan-purposes/getAll`,
          `${BASE8082}/weekly-payment-bills/all`,
        ],
        { useBranch: true }
      ),
  },
  {
    id: 'staffadvance',
    paths: ['/staffadvance'],
    notifyEvent: 'staffAdvanceUpdated',
    run: () => fetchAll([`${BASE8082}/staff-advance/all`, `${BASE8082}/weekly-payment-bills/all`]),
  },
  {
    id: 'rent',
    paths: ['/rent'],
    notifyEvent: 'rentDataSync',
    run: () =>
      fetchAll([
        `${BASE8082}/rental_forms/getAll`,
        `${BASE8082}/tenant_link_shop/getAll`,
        `${BASE8082}/weekly-payment-bills/all`,
      ]),
  },
  {
    id: 'tracker',
    paths: ['/tracker'],
    notifyEvent: 'billTrackerDataSync',
    run: () =>
      fetchAll([
        `${BASE8082}/vendor-payments/trackers/pending`,
        `${BASE8082}/vendor-payments/trackers/enriched/paid`,
        `${BASE8082}/bill-entry/getAll`,
        `${BASE8082}/weekly-payment-bills/all`,
      ]),
  },
  {
    id: 'weekly-payment',
    paths: ['/weekly-payment'],
    notifyEvent: 'weeklyPaymentDataSync',
    run: () =>
      fetchAll([
        `${BASE8082}/weekly-payment-bills/all`,
        `${BASE8082}/weekly-expenses/getAll`,
      ]),
  },
  {
    id: 'bank-register',
    paths: ['/bank-register', '/orbit-erp/bill-payment'],
    notifyEvent: 'bankRegisterDataSync',
    run: () =>
      fetchAll(
        [`${BASE8082}/weekly-payment-bills/all`, `${BASE8082}/account-details/getAll`],
        { useBranch: true }
      ),
  },
  {
    id: 'Claim',
    paths: ['/Claim'],
    notifyEvent: 'claimPaymentDataSync',
    run: () => fetchAll([`${BASE8082}/claim_payments/getAll`, `${BASE8082}/weekly-payment-bills/all`]),
  },
  {
    id: 'purchaseorder',
    paths: ['/purchaseorder'],
    notifyEvent: 'poUpdated',
    run: () =>
      fetchAll([
        `${BASE8082}/purchase_orders/getAll`,
        `${BASE8082}/po_itemNames/getAll`,
        `${BASE8082}/po_category/getAll`,
        `${BASE8082}/po_brand/getAll`,
        `${BASE8082}/po_model/getAll`,
        `${BASE8082}/po_type/getAll`,
      ]),
  },
  {
    id: 'inventory',
    paths: ['/inventory'],
    notifyEvent: 'inventoryDataSync',
    run: async () => {
      await Promise.all([
        prefetchIncomingTrackerData({ force: true }),
        prefetchInventoryNetStockData({ force: true }),
        fetchAll([`${BASE8082}/inventory/getAll`]),
      ]);
    },
  },
  {
    id: 'toolsTracker',
    paths: ['/toolsTracker', '/testtoolsTracker'],
    notifyEvent: 'toolsTrackerDataSync',
    run: async () => {
      await Promise.all([
        prefetchToolsNetStockData({ force: true }),
        fetchAll([
          `${BASE8082}/tools_tracker_management/getAll`,
          `${BASE8082}/tools_tracker_stock_management/getAll`,
        ]),
      ]);
    },
  },
  {
    id: 'utility',
    paths: ['/utility'],
    notifyEvent: 'utilityDataSync',
    run: () =>
      fetchAll([
        `${EXP8081}/expenses_form/utility/property`,
        `${EXP8081}/expenses_form/utility/electricity`,
        `${EXP8081}/expenses_form/utility/water`,
      ]),
  },
  {
    id: 'master-data',
    paths: ['/master-data'],
    notifyEvent: 'masterDataSync',
    run: () =>
      fetchAll([
        `${BASE8081}/project_Names/getAll`,
        `${BASE8081}/vendor_Names/getAll`,
        `${BASE8081}/contractor_Names/getAll`,
        `${BASE8081}/expenses_categories/getAll`,
        `${BASE8082}/account-details/getAll`,
        `${BASE8082}/employee_details/getAll`,
        `${BASE8082}/labours-details/getAll`,
        `${BASE8082}/payment_mode/getAll`,
      ]),
  },
];

const WEEKLY_BILL_SOURCE_MODULE_IDS = new Set([
  'portal',
  'loan',
  'staffadvance',
  'rent',
  'tracker',
  'weekly-payment',
  'bank-register',
  'Claim',
]);

const emitSyncStatus = () => {
  const snapshot = { lastSyncedAt, isSyncing };
  statusListeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      console.warn('orbit sync status listener failed', error);
    }
  });
  window.dispatchEvent(new CustomEvent(SYNC_STATUS_EVENT, { detail: snapshot }));
};

export const subscribeOrbitSyncStatus = (listener) => {
  statusListeners.add(listener);
  listener({ lastSyncedAt, isSyncing });
  return () => statusListeners.delete(listener);
};

export const getOrbitLastSyncedAt = () => lastSyncedAt;

export const formatOrbitLastSyncedTime = (date = lastSyncedAt) => {
  if (!date) return 'Not synced';
  try {
    return date.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return '—';
  }
};

export const getOrbitModuleIdForPath = (path = '') => {
  const normalized = String(path || window.location.pathname || '');
  const match = ORBIT_SYNC_MODULES.find((module) =>
    module.paths.some((prefix) => normalized.startsWith(prefix))
  );
  return match?.id ?? null;
};

export const getOrbitModulePaths = (moduleId) => {
  const module = ORBIT_SYNC_MODULES.find((item) => item.id === moduleId);
  return module?.paths ?? [];
};

export const getOrbitModuleNotifyEvent = (moduleId) => {
  const module = ORBIT_SYNC_MODULES.find((item) => item.id === moduleId);
  return module?.notifyEvent ?? null;
};

export const registerOrbitPageRefresh = (moduleId, callback) => {
  if (!moduleId || typeof callback !== 'function') return () => {};
  if (!refreshHandlersByModuleId.has(moduleId)) {
    refreshHandlersByModuleId.set(moduleId, new Set());
  }
  refreshHandlersByModuleId.get(moduleId).add(callback);
  return () => {
    refreshHandlersByModuleId.get(moduleId)?.delete(callback);
  };
};

const invokeModuleRefreshers = (moduleId) => {
  if (!moduleId) return;
  const handlers = refreshHandlersByModuleId.get(moduleId);
  if (!handlers || handlers.size === 0) return;
  handlers.forEach((handler) => {
    try {
      handler();
    } catch (error) {
      console.warn(`Orbit page refresh failed for module "${moduleId}"`, error);
    }
  });
};

const dispatchPageTableRefresh = (path, { scope = 'current', moduleId = null } = {}) => {
  const detail = { path, scope, moduleId };
  window.dispatchEvent(new CustomEvent(PAGE_TABLE_REFRESH_EVENT, { detail }));
  window.dispatchEvent(new CustomEvent(SYNC_DATA_EVENT, { detail }));
};

/**
 * Refresh visible page tables immediately (each page re-fetches its own API).
 * This runs even when a background sync is already in progress.
 */
export const refreshOrbitPageTables = (currentPath = '') => {
  const path = currentPath || getCurrentPathRef() || window.location.pathname || '';
  const currentModuleId = getOrbitModuleIdForPath(path);

  if (currentModuleId) {
    invokeModuleRefreshers(currentModuleId);
  }

  if (currentModuleId === 'bank-register') {
    invokeModuleRefreshers('bank-register');
  }
};

const withBranchQuery = (url) => {
  const branchId = localStorage.getItem('selectedBranchId');
  if (!branchId) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}branchId=${encodeURIComponent(branchId)}`;
};

const fetchJson = async (url, { useBranch = false } = {}) => {
  const finalUrl = useBranch ? withBranchQuery(url) : url;
  try {
    const response = await fetch(finalUrl, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (String(url).includes('/expenses_form/get_form') && Array.isArray(data)) {
      const branchId = useBranch ? localStorage.getItem('selectedBranchId') : null;
      populateExpensesFormCache(data, branchId);
    }
    return data;
  } catch {
    return null;
  }
};

const fetchAll = async (urls, options = {}) => {
  await Promise.all(urls.map((url) => fetchJson(url, options)));
};

const dispatchNotify = (eventName) => {
  if (!eventName) return;
  window.dispatchEvent(new Event(eventName));
};

const pathMatchesModule = (path, modulePaths = []) =>
  modulePaths.some((prefix) => path.startsWith(prefix));

const syncMasterData = async () => {
  await fetchAll(
    [
      `${BASE8081}/project_Names/getAll`,
      `${BASE8081}/vendor_Names/getAll`,
      `${BASE8081}/contractor_Names/getAll`,
      `${BASE8081}/projects/getAll`,
      `${BASE8082}/branch/getAll`,
      `${BASE8082}/payment_mode/getAll`,
      `${BASE8082}/account-details/getAll`,
      `${BASE8082}/purposes/getAll`,
    ],
    { useBranch: false }
  );
};

const runModuleSync = async (module, path) => {
  try {
    await module.run();
    invokeModuleRefreshers(module.id);

    if (
      WEEKLY_BILL_SOURCE_MODULE_IDS.has(module.id) &&
      module.id !== 'bank-register'
    ) {
      invokeModuleRefreshers('bank-register');
    }
  } catch (error) {
    console.warn(`Orbit sync failed for module "${module.id}"`, error);
  }
};

const runModuleBatch = async (modules, path, { sequential = false } = {}) => {
  if (sequential) {
    for (const module of modules) {
      // eslint-disable-next-line no-await-in-loop
      await runModuleSync(module, path);
    }
    return;
  }
  await Promise.all(modules.map((module) => runModuleSync(module, path)));
};

const runBackgroundPrefetch = async (path, priorityFirst) => {
  if (priorityFirst) {
    const currentModules = ORBIT_SYNC_MODULES.filter((module) =>
      pathMatchesModule(path, module.paths)
    );
    const otherModules = ORBIT_SYNC_MODULES.filter(
      (module) => !pathMatchesModule(path, module.paths)
    );

    if (currentModules.length > 0) {
      await runModuleBatch(currentModules, path, { sequential: true });
    }

    await syncMasterData();
    await runModuleBatch(otherModules, path);
    return;
  }

  const currentModuleId = getOrbitModuleIdForPath(path);
  const currentModules = currentModuleId
    ? ORBIT_SYNC_MODULES.filter((module) => module.id === currentModuleId)
    : [];
  const otherModules = currentModuleId
    ? ORBIT_SYNC_MODULES.filter((module) => module.id !== currentModuleId)
    : ORBIT_SYNC_MODULES;

  if (currentModules.length > 0) {
    await runModuleBatch(currentModules, path, { sequential: true });
  }

  await Promise.all([syncMasterData(), runModuleBatch(otherModules, path)]);
};

/**
 * Sync only the module for the current route — prefetches that module's APIs
 * and refreshes its registered page handlers. Never syncs other modules or master data.
 */
export const runOrbitCurrentModuleSync = async ({ currentPath = '' } = {}) => {
  const path = currentPath || getCurrentPathRef() || window.location.pathname || '';
  const currentModuleId = getOrbitModuleIdForPath(path);
  const currentModule = currentModuleId
    ? ORBIT_SYNC_MODULES.find((module) => module.id === currentModuleId)
    : null;

  if (syncInFlight) {
    return syncInFlight;
  }

  if (!currentModule) {
    lastSyncedAt = new Date();
    emitSyncStatus();
    return Promise.resolve();
  }

  isSyncing = true;
  emitSyncStatus();

  syncInFlight = (async () => {
    try {
      await runModuleSync(currentModule, path);
      lastSyncedAt = new Date();
    } catch (error) {
      console.error(`Orbit module sync failed for "${currentModule.id}"`, error);
    } finally {
      isSyncing = false;
      syncInFlight = null;
      emitSyncStatus();
    }
  })();

  return syncInFlight;
};

/**
 * Full-project sync (all modules + master data). Prefer runOrbitCurrentModuleSync for UI buttons.
 */
export const runOrbitProjectSync = async ({
  currentPath = '',
  priorityFirst = true,
} = {}) => {
  const path = currentPath || getCurrentPathRef() || window.location.pathname || '';

  refreshOrbitPageTables(path);

  if (syncInFlight) {
    return syncInFlight.finally(() => {
      refreshOrbitPageTables(path);
    });
  }

  isSyncing = true;
  emitSyncStatus();

  syncInFlight = (async () => {
    try {
      refreshOrbitPageTables(path);
      await runBackgroundPrefetch(path, priorityFirst);
      refreshOrbitPageTables(path);
      dispatchPageTableRefresh(path, { scope: 'all', moduleId: getOrbitModuleIdForPath(path) });
      lastSyncedAt = new Date();
    } catch (error) {
      console.error('Orbit project sync failed', error);
    } finally {
      isSyncing = false;
      syncInFlight = null;
      emitSyncStatus();
    }
  })();

  return syncInFlight;
};

/** Call after save/update/delete — refresh mounted tabs once (no duplicate events). */
export const notifyOrbitModuleDataChanged = (moduleId) => {
  if (!moduleId) return;
  invokeModuleRefreshers(moduleId);
};

export const startOrbitAutoSync = (getCurrentPath = () => window.location.pathname) => {
  getCurrentPathRef = getCurrentPath;
  stopOrbitAutoSync();

  const tick = () => {
    const path = getCurrentPathRef() || window.location.pathname || '';
    void runOrbitCurrentModuleSync({ currentPath: path });
  };

  autoSyncTimer = window.setInterval(tick, SYNC_INTERVAL_MS);
};

export const stopOrbitAutoSync = () => {
  if (autoSyncTimer != null) {
    window.clearInterval(autoSyncTimer);
    autoSyncTimer = null;
  }
};

/** Call after saving weekly-payment-bills from any page for instant Bank Register update. */
export const notifyWeeklyPaymentBillsChanged = () => {
  invokeModuleRefreshers('bank-register');
};
