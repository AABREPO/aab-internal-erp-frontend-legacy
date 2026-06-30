const API_BASE = 'https://backendaab.in/demoAabuildersDash/api';

export const EXPENSE_ENTRY_MODULE_NAME = 'Expense Entry';
export const RENT_MANAGEMENT_MODULE_NAME = 'Rent Management';
export const ADVANCE_PORTAL_MODULE_NAME = 'Advance Portal';
export const LOAN_PORTAL_MODULE_NAME = 'Loan Portal';
export const STAFF_ADVANCE_MODULE_NAME = 'Staff Advance';
export const BILL_PAYMENT_TRACKER_MODULE_NAME = 'Bill Payment Tracker';
export const BANK_REGISTER_MODULE_NAME = 'Bank Register';
export const CLAIM_PAYMENTS_MODULE_NAME = 'Claim Payments';

/** Orbit ERP module id → Master Data payment mode arrangement module name */
export const ORBIT_MODULE_ID_TO_ARRANGEMENT_NAME = {
  'expense-entry': 'Expense Entry',
  portal: 'Advance Portal',
  loan: 'Loan Portal',
  staffadvance: 'Staff Advance',
  rent: 'Rent Management',
  tracker: 'Bill Payment Tracker',
  'bank-register': 'Bank Register',
  Claim: 'Claim Payments',
  'weekly-payment': 'Cash Register',
};

const ARRANGEMENT_CACHE_TTL_MS = 20_000;
const ARRANGEMENT_REFRESH_INTERVAL_MS = 20_000;

let arrangementsCache = null;
let arrangementsCacheAt = 0;
let paymentModesMasterCache = null;
let paymentModesMasterCacheAt = 0;

const arrangementRefreshListeners = new Set();
let arrangementRefreshIntervalId = null;
let arrangementRefreshInFlight = null;

export const PAYMENT_MODE_ARRANGEMENT_UPDATED_EVENT = 'paymentModeArrangementUpdated';

const notifyArrangementRefreshListeners = () => {
  arrangementRefreshListeners.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      console.error('Payment mode arrangement refresh listener failed:', error);
    }
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PAYMENT_MODE_ARRANGEMENT_UPDATED_EVENT));
  }
};

const startArrangementRefreshPolling = () => {
  if (arrangementRefreshIntervalId != null) return;
  arrangementRefreshIntervalId = setInterval(() => {
    refreshPaymentModeArrangementCaches();
  }, ARRANGEMENT_REFRESH_INTERVAL_MS);
};

export const subscribePaymentModeArrangementRefresh = (listener) => {
  if (typeof listener !== 'function') return () => {};
  arrangementRefreshListeners.add(listener);
  return () => {
    arrangementRefreshListeners.delete(listener);
  };
};

export let refreshPaymentModeArrangementCaches = async () => {};

export const populatePaymentModeArrangementCache = (arrangements) => {
  arrangementsCache = Array.isArray(arrangements) ? arrangements : [];
  arrangementsCacheAt = Date.now();
};

export const populatePaymentModesMasterCache = (modes) => {
  paymentModesMasterCache = Array.isArray(modes) ? modes : [];
  paymentModesMasterCacheAt = Date.now();
};

export const invalidatePaymentModeArrangementCache = () => {
  arrangementsCache = null;
  arrangementsCacheAt = 0;
  paymentModesMasterCache = null;
  paymentModesMasterCacheAt = 0;
};

export const getCachedPaymentModeArrangements = () =>
  Array.isArray(arrangementsCache) ? arrangementsCache : [];

export const getCachedPaymentModesMaster = () =>
  Array.isArray(paymentModesMasterCache) ? paymentModesMasterCache : [];

const normalizeText = (value) => String(value ?? '').trim();
const normalizeKey = (value) => normalizeText(value).toLowerCase();

export const getArrangementModuleName = (row) => row?.module_name ?? row?.moduleName ?? '';

export const getArrangementPaymentModes = (row) => {
  const modes = row?.payment_modes ?? row?.paymentModes;
  if (Array.isArray(modes) && modes.length > 0) {
    return modes
      .map((item) => ({
        id: item?.id ?? item?.payment_mode_id ?? item?.paymentModeId,
        modeOfPayment: normalizeText(item?.mode_of_payment ?? item?.modeOfPayment),
      }))
      .filter((item) => item.modeOfPayment);
  }

  const legacyList = row?.payment_mode_list ?? row?.paymentModeList;
  if (Array.isArray(legacyList)) {
    return legacyList
      .map((label) => ({ modeOfPayment: normalizeText(label) }))
      .filter((item) => item.modeOfPayment);
  }

  return [];
};

export const getArrangementPaymentModeList = (row) =>
  getArrangementPaymentModes(row).map((mode) => mode.modeOfPayment);

export const getArrangementPaymentModeIds = (row) => {
  const ids = row?.payment_mode_ids ?? row?.paymentModeIds;
  if (Array.isArray(ids) && ids.length > 0) {
    return ids.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0);
  }
  return getArrangementPaymentModes(row)
    .map((mode) => Number(mode.id))
    .filter((id) => Number.isFinite(id) && id > 0);
};

export const findPaymentModeArrangementForModule = (arrangements, moduleName) => {
  const target = normalizeKey(moduleName);
  if (!target || !Array.isArray(arrangements)) return null;
  return (
    arrangements.find((row) => normalizeKey(getArrangementModuleName(row)) === target) || null
  );
};

const fetchArrangements = async () => {
  const now = Date.now();
  if (arrangementsCache && now - arrangementsCacheAt < ARRANGEMENT_CACHE_TTL_MS) {
    return arrangementsCache;
  }
  try {
    const response = await fetch(`${API_BASE}/payment_mode_arrangement/getAll`);
    if (!response.ok) return arrangementsCache || [];
    const data = await response.json();
    populatePaymentModeArrangementCache(data);
    return arrangementsCache;
  } catch (error) {
    console.error('Error fetching payment mode arrangements:', error);
    return arrangementsCache || [];
  }
};

export const fetchModuleArrangement = async (moduleName) => {
  const normalized = normalizeText(moduleName);
  if (!normalized) return null;

  const cached = findPaymentModeArrangementForModule(arrangementsCache, normalized);
  if (cached && arrangementsCache && Date.now() - arrangementsCacheAt < ARRANGEMENT_CACHE_TTL_MS) {
    return cached;
  }

  try {
    const response = await fetch(
      `${API_BASE}/payment_mode_arrangement/module?module_name=${encodeURIComponent(normalized)}`
    );
    if (response.ok) {
      return await response.json();
    }
    if (response.status === 404) {
      const arrangements = await fetchArrangements();
      return findPaymentModeArrangementForModule(arrangements, normalized);
    }
  } catch (error) {
    console.error('Error fetching payment mode arrangement by module:', error);
  }

  const arrangements = await fetchArrangements();
  return findPaymentModeArrangementForModule(arrangements, normalized);
};

export const fetchModuleArrangementByOrbitModuleId = async (orbitModuleId) => {
  const moduleName = ORBIT_MODULE_ID_TO_ARRANGEMENT_NAME[orbitModuleId];
  if (!moduleName) return null;
  return fetchModuleArrangement(moduleName);
};

export const fetchModulePaymentModeArrangementList = async (moduleName) => {
  const arrangement = await fetchModuleArrangement(moduleName);
  return arrangement ? getArrangementPaymentModeList(arrangement) : [];
};

const fetchAllPaymentModes = async () => {
  const now = Date.now();
  if (paymentModesMasterCache && now - paymentModesMasterCacheAt < ARRANGEMENT_CACHE_TTL_MS) {
    return paymentModesMasterCache;
  }
  try {
    const response = await fetch(`${API_BASE}/payment_mode/getAll`);
    if (!response.ok) return paymentModesMasterCache || [];
    const data = await response.json();
    populatePaymentModesMasterCache(data);
    return paymentModesMasterCache;
  } catch (error) {
    console.error('Error fetching payment modes:', error);
    return paymentModesMasterCache || [];
  }
};

export const fetchPaymentModesForOrbitModule = async (orbitModuleId, options = {}) => {
  const moduleName = ORBIT_MODULE_ID_TO_ARRANGEMENT_NAME[orbitModuleId];
  if (!moduleName) {
    const allModes = await fetchAllPaymentModes();
    return allModes.map(toPaymentModeObject).filter(Boolean);
  }
  return fetchPaymentModesForModule(moduleName, options);
};

const toPaymentModeObject = (mode) => {
  if (mode && typeof mode === 'object') {
    const label = normalizeText(mode.modeOfPayment ?? mode.label ?? mode.value);
    if (!label) return null;
    const id = Number(mode.id);
    return {
      ...mode,
      ...(Number.isFinite(id) && id > 0 ? { id } : {}),
      modeOfPayment: label,
    };
  }
  const label = normalizeText(mode);
  return label ? { modeOfPayment: label } : null;
};

export const orderPaymentModesByArrangementIds = (allModes, orderedIds) => {
  const modes = (Array.isArray(allModes) ? allModes : [])
    .map(toPaymentModeObject)
    .filter(Boolean);
  const ids = (Array.isArray(orderedIds) ? orderedIds : [])
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id) && id > 0);

  if (ids.length === 0) return modes;

  const modeById = new Map();
  modes.forEach((mode) => {
    const id = Number(mode.id);
    if (Number.isFinite(id) && id > 0) {
      modeById.set(id, mode);
    }
  });

  return ids.map((id) => modeById.get(id)).filter(Boolean);
};

export const orderPaymentModesByArrangement = (allModes, arrangementList) => {
  const modes = (Array.isArray(allModes) ? allModes : [])
    .map(toPaymentModeObject)
    .filter(Boolean);
  const orderedLabels = Array.isArray(arrangementList)
    ? arrangementList.map((label) => normalizeText(label)).filter(Boolean)
    : [];

  if (orderedLabels.length === 0) return modes;

  const modeByLabel = new Map();
  modes.forEach((mode) => {
    const label = normalizeText(mode.modeOfPayment);
    if (label) modeByLabel.set(normalizeKey(label), mode);
  });

  return orderedLabels
    .map((label) => modeByLabel.get(normalizeKey(label)) || { modeOfPayment: label })
    .filter(Boolean);
};

export const fetchPaymentModesForModule = async (moduleName, { fallbackModes = [] } = {}) => {
  const arrangement = await fetchModuleArrangement(moduleName);
  const arrangedFromResponse = getArrangementPaymentModes(arrangement);
  if (arrangedFromResponse.length > 0) {
    return arrangedFromResponse.map((mode) => ({
      ...(mode.id ? { id: mode.id } : {}),
      modeOfPayment: mode.modeOfPayment,
    }));
  }

  const allModes = await fetchAllPaymentModes();
  const orderedIds = getArrangementPaymentModeIds(arrangement);
  if (orderedIds.length > 0) {
    const byIds = orderPaymentModesByArrangementIds(allModes, orderedIds);
    if (byIds.length > 0) return byIds;
  }

  const arrangementLabels = getArrangementPaymentModeList(arrangement);
  const arrangedModes = orderPaymentModesByArrangement(allModes, arrangementLabels);
  if (arrangedModes.length > 0) return arrangedModes;

  if (allModes.length > 0) return allModes.map(toPaymentModeObject).filter(Boolean);

  return (Array.isArray(fallbackModes) ? fallbackModes : [])
    .map(toPaymentModeObject)
    .filter(Boolean);
};

export const mapPaymentModesToSelectOptions = (modes) =>
  (Array.isArray(modes) ? modes : [])
    .filter((mode) => mode?.modeOfPayment)
    .map((mode) => ({
      value: mode.modeOfPayment,
      label: mode.modeOfPayment,
    }));

export const fetchPaymentModeSelectOptionsForModule = async (moduleName, fallbackOptions = []) => {
  const fallbackModes = (Array.isArray(fallbackOptions) ? fallbackOptions : []).map((option) => ({
    modeOfPayment: typeof option === 'string' ? option : option?.value || option?.label,
  }));
  const modes = await fetchPaymentModesForModule(moduleName, { fallbackModes });
  const options = mapPaymentModesToSelectOptions(modes);
  return options.length > 0 ? options : mapPaymentModesToSelectOptions(fallbackModes);
};

const isBlankFilterOption = (option) => {
  const value = option?.value;
  return value === '' || value == null || String(value).trim() === '';
};

export const sortValuesByArrangement = (values, arrangementList) => {
  const items = Array.isArray(values) ? [...values] : [];
  const order = Array.isArray(arrangementList)
    ? arrangementList.map((label) => normalizeText(label)).filter(Boolean)
    : [];
  if (order.length === 0) return items;

  const orderMap = new Map(order.map((label, index) => [normalizeKey(label), index]));
  return items.sort((a, b) => {
    const aLabel = normalizeKey(typeof a === 'object' ? a.value ?? a.label : a);
    const bLabel = normalizeKey(typeof b === 'object' ? b.value ?? b.label : b);
    const aIndex = orderMap.has(aLabel) ? orderMap.get(aLabel) : Number.MAX_SAFE_INTEGER;
    const bIndex = orderMap.has(bLabel) ? orderMap.get(bLabel) : Number.MAX_SAFE_INTEGER;
    if (aIndex !== bIndex) return aIndex - bIndex;
    return aLabel.localeCompare(bLabel);
  });
};

export const sortEdbcFilterOptionsByArrangement = (options, arrangementList) => {
  if (!Array.isArray(options) || !arrangementList?.length) return options;
  const blankOptions = options.filter(isBlankFilterOption);
  const rest = options.filter((option) => !isBlankFilterOption(option));
  return [...blankOptions, ...sortValuesByArrangement(rest, arrangementList)];
};

refreshPaymentModeArrangementCaches = async () => {
  if (arrangementRefreshInFlight) return arrangementRefreshInFlight;

  arrangementRefreshInFlight = (async () => {
    arrangementsCacheAt = 0;
    paymentModesMasterCacheAt = 0;
    try {
      await Promise.all([fetchArrangements(), fetchAllPaymentModes()]);
    } catch (error) {
      console.error('Error refreshing payment mode arrangement caches:', error);
    } finally {
      notifyArrangementRefreshListeners();
      arrangementRefreshInFlight = null;
    }
  })();

  return arrangementRefreshInFlight;
};

if (typeof window !== 'undefined') {
  startArrangementRefreshPolling();
}
