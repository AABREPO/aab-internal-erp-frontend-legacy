const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cache = {
  fetchedAt: 0,
  itemNames: null,
  itemIds: null,
  brands: null,
  projects: null,
  vendors: null,
  machineNumbers: null,
  employees: null,
  stockManagement: null,
  trackerManagement: null,
};

let inFlight = null;

const isFresh = () => Date.now() - (cache.fetchedAt || 0) < CACHE_TTL_MS;

export function getToolsNetStockPrefetchCache() {
  return cache;
}

export async function prefetchToolsNetStockData({ force = false } = {}) {
  if (inFlight) return inFlight;
  if (!force && isFresh()) return cache;

  inFlight = (async () => {
    const base8081 = 'https://backendaab.in/demoAabuilderDash/api';
    const base8082 = 'https://backendaab.in/demoAabuildersDash/api';

    const requests = {
      itemNames: fetch(`${base8082}/tools_item_name/getAll`, { credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      itemIds: fetch(`${base8082}/tools_item_id/getAll`, { credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      brands: fetch(`${base8082}/tools_brand/getAll`, { credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      projects: fetch(`${base8081}/project_Names/getAll`, { credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      vendors: fetch(`${base8081}/vendor_Names/getAll`, { credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      machineNumbers: fetch(`${base8082}/tools_machine_number/getAll`, { credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      employees: fetch(`${base8082}/employee_details/site_engineers`, { credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),

      stockManagement: fetch(`${base8082}/tools_tracker_stock_management/getAll`, { credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      trackerManagement: fetch(`${base8082}/tools_tracker_management/getAll`, { credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    };

    const results = await Promise.all(
      Object.entries(requests).map(async ([key, p]) => {
        const value = await p;
        return [key, value];
      })
    );

    const next = { ...cache };
    for (const [key, value] of results) {
      next[key] = value;
    }
    next.fetchedAt = Date.now();
    cache = next;
    return cache;
  })().finally(() => {
    inFlight = null;
  });

  return inFlight;
}

