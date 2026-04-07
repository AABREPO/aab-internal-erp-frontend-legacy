/**
 * Mobile Advance Portal — prefer {@code /paged} and {@code /getLast150} over {@code /getAll}
 * so the browser does not parse/render huge JSON payloads.
 *
 * Backend (Spring): {@code GET /api/advance_portal/paged?page=0&size=150&sort=advancePortalId,desc}
 */

const ADVANCE_PORTAL_BASE = 'https://backendaab.in/aabuildersDash/api/advance_portal';

/** Spring Page JSON or a plain array (legacy). */
export function parsePagedRows(json) {
  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json.content)) return json.content;
  return [];
}

/**
 * Recent rows for form/vendor totals (bounded size).
 * Tries paged first, then getLast150.
 */
export async function fetchAdvancePortalListForMobile(withBranchUrl) {
  const pagedUrl = withBranchUrl(
    `${ADVANCE_PORTAL_BASE}/paged?page=0&size=150&sort=advancePortalId,desc`
  );
  try {
    const res = await fetch(pagedUrl);
    if (res.ok) {
      const json = await res.json();
      const rows = parsePagedRows(json);
      if (rows.length > 0) return rows;
    }
  } catch (_) {
    /* fall through */
  }
  const lastUrl = withBranchUrl(`${ADVANCE_PORTAL_BASE}/getLast150`);
  const res = await fetch(lastUrl);
  if (!res.ok) return [];
  const json = await res.json();
  return Array.isArray(json) ? json : [];
}

function rowEntryNo(row) {
  if (!row) return 0;
  const v = row.entry_no ?? row.entryNo;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Next entry number = max(entry_no) + 1. Uses a single row from paged sort (cheap).
 * Falls back to scanning getLast150 with yields if sort is unsupported.
 */
export async function fetchMaxEntryNoFromBranch(withBranchUrl) {
  const sortCandidates = ['entryNo,desc', 'entry_no,desc'];
  for (const sort of sortCandidates) {
    try {
      const url = withBranchUrl(
        `${ADVANCE_PORTAL_BASE}/paged?page=0&size=1&sort=${encodeURIComponent(sort)}`
      );
      const res = await fetch(url);
      if (!res.ok) continue;
      const json = await res.json();
      const rows = parsePagedRows(json);
      if (rows.length > 0) {
        const n = rowEntryNo(rows[0]);
        if (n > 0) return n;
      }
    } catch (_) {
      /* try next */
    }
  }

  const lastUrl = withBranchUrl(`${ADVANCE_PORTAL_BASE}/getLast150`);
  try {
    const res = await fetch(lastUrl);
    if (!res.ok) return 0;
    const arr = await res.json();
    if (!Array.isArray(arr) || arr.length === 0) return 0;
    let m = 0;
    for (let i = 0; i < arr.length; i++) {
      const n = rowEntryNo(arr[i]);
      if (n > m) m = n;
      if (i > 0 && i % 2000 === 0) await new Promise((r) => setTimeout(r, 0));
    }
    return m;
  } catch {
    return 0;
  }
}

/**
 * Full advance list for totals (matches desktop AdvancePortal.js — uses getAll, not paged/last150).
 * Caller should pass branch-aware URL builder (same as other mobile advance_portal calls).
 */
export async function fetchAdvancePortalGetAll(withBranchUrl) {
  const url = withBranchUrl(`${ADVANCE_PORTAL_BASE}/getAll`);
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = await res.json();
  return Array.isArray(json) ? json : [];
}

function rowAdvanceNet(row) {
  const amount = parseFloat(row.amount) || 0;
  const billAmount = parseFloat(row.bill_amount) || 0;
  const refundAmount = parseFloat(row.refund_amount) || 0;
  return amount - billAmount - refundAmount;
}

/**
 * One getAll + one pass: vendor/contractor overall and optional project total (same rules as AdvancePortal.js).
 * @returns {{ overall: number, projectAmount: number | null }} projectAmount is null when project omitted.
 */
export async function computeAdvanceTotalsFromGetAll(withBranchUrl, selected, project) {
  if (!selected) return { overall: 0, projectAmount: null };
  const data = await fetchAdvancePortalGetAll(withBranchUrl);
  const vid = Number(selected.id);
  const isVendor = selected.type === "Vendor";
  const pid = project ? Number(project.id) : null;
  let overall = 0;
  let projectSum = pid !== null ? 0 : null;
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const vendorMatch = isVendor
      ? Number(item.vendor_id) === vid
      : Number(item.contractor_id) === vid;
    if (!vendorMatch) continue;
    const net = rowAdvanceNet(item);
    overall += net;
    if (pid !== null && Number(item.project_id) === pid) {
      projectSum += net;
    }
    if (i > 0 && i % 2000 === 0) await new Promise((r) => setTimeout(r, 0));
  }
  return { overall, projectAmount: projectSum };
}
