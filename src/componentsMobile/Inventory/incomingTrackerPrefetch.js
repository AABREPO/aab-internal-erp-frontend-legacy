const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cache = {
  fetchedAt: 0,
  vendorId: null,
  vendors: null,
  sites: null,
  purchaseOrders: null,
  poItemNames: null,
  poBrands: null,
  poModels: null,
  poTypes: null,
  poCategories: null,
  liveIncoming: null, // live-with-missing response (normalized not applied here)
  closedIncoming: null,
};

let inFlight = null;

const isFresh = () => Date.now() - (cache.fetchedAt || 0) < CACHE_TTL_MS;

export function getIncomingTrackerPrefetchCache() {
  return cache;
}

export async function prefetchIncomingTrackerData({ vendorId, force = false } = {}) {
  if (inFlight) return inFlight;

  if (
    !force &&
    isFresh() &&
    (!vendorId || String(cache.vendorId) === String(vendorId))
  ) {
    return cache;
  }

  inFlight = (async () => {
    const base8081 = 'https://backendaab.in/aabuilderDash/api';
    const base8082 = 'https://backendaab.in/aabuildersDash/api';

    const requests = {
      vendors: fetch(`${base8081}/vendor_Names/getAll`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      sites: fetch(`${base8081}/project_Names/getAll`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      }).then((r) => (r.ok ? r.json() : null)).catch(() => null),

      purchaseOrders: fetch(`${base8082}/purchase_orders/getAll`).then((r) => (r.ok ? r.json() : null)).catch(() => null),

      poItemNames: fetch(`${base8082}/po_itemNames/getAll`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      poBrands: fetch(`${base8082}/po_brand/getAll`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      poModels: fetch(`${base8082}/po_model/getAll`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      poTypes: fetch(`${base8082}/po_type/getAll`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      poCategories: fetch(`${base8082}/po_category/getAll`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    };

    if (vendorId !== null && vendorId !== undefined && String(vendorId).trim() !== '') {
      requests.liveIncoming = fetch(
        `${base8082}/inventory/getIncomingLiveWithMissing?vendorId=${encodeURIComponent(vendorId)}`
      ).then((r) => (r.ok ? r.json() : null)).catch(() => null);

      requests.closedIncoming = fetch(
        `${base8082}/inventory/getIncomingClosed?vendorId=${encodeURIComponent(vendorId)}`
      ).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    }

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
    next.vendorId = vendorId ?? next.vendorId ?? null;
    cache = next;
    return cache;
  })().finally(() => {
    inFlight = null;
  });

  return inFlight;
}

