const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cache = {
  fetchedAt: 0,
  categories: null,
  projects: null, // project_Names/getAll (used for stocking locations + name map)
  itemNames: null,
  brands: null,
  models: null,
  types: null,
  inventoryAll: null,
};

let inFlight = null;

const isFresh = () => Date.now() - (cache.fetchedAt || 0) < CACHE_TTL_MS;

export function getInventoryNetStockPrefetchCache() {
  return cache;
}

export async function prefetchInventoryNetStockData({ force = false } = {}) {
  if (inFlight) return inFlight;
  if (!force && isFresh()) return cache;

  inFlight = (async () => {
    const base8081 = 'https://backendaab.in/demoAabuilderDash/api';
    const base8082 = 'https://backendaab.in/demoAabuildersDash/api';

    const requests = {
      categories: fetch(`${base8082}/po_category/getAll`, { credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      projects: fetch(`${base8081}/project_Names/getAll`, { credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      itemNames: fetch(`${base8082}/po_itemNames/getAll`, { credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      brands: fetch(`${base8082}/po_brand/getAll`, { credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      models: fetch(`${base8082}/po_model/getAll`, { credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      types: fetch(`${base8082}/po_type/getAll`, { credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      inventoryAll: fetch(`${base8082}/inventory/getAll`, { credentials: 'include' })
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

