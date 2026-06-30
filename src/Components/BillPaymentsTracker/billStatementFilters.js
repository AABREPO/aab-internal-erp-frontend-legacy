/** Pure helpers for Bill Statement filtering (no React). */

export const normalizeStatementList = (data) => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.content)) return data.content;
  if (Array.isArray(data.statements)) return data.statements;
  if (Array.isArray(data.rows)) return data.rows;
  return [];
};

export const normalizeVendorKey = (name) =>
  String(name || '')
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

export const getStatementVendorName = (row) =>
  String(row?.vendor_name ?? row?.vendorName ?? row?.vendor ?? '').trim();

/** Prefer vendor name on the row; fall back to master vendor list by id. */
export const createVendorNameResolver = (vendorNameById) => (row) => {
  const fromRow = getStatementVendorName(row);
  if (fromRow) return fromRow;
  const vid = row?.vendor_id ?? row?.vendorId;
  if (vid != null && vendorNameById instanceof Map) {
    const fromMaster = vendorNameById.get(String(vid));
    if (fromMaster) return String(fromMaster).trim();
  }
  return '';
};

export const vendorNamesMatch = (rowName, filterName) => {
  const rowKey = normalizeVendorKey(rowName);
  const filterKey = normalizeVendorKey(filterName);
  if (!filterKey) return true;
  return rowKey.length > 0 && rowKey === filterKey;
};

export const parseStatementDate = (input) => {
  if (input == null || input === '') return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  if (Array.isArray(input)) {
    const [y, mo, d, h = 0, mi = 0, s = 0] = input;
    if (y == null || mo == null || d == null) return null;
    const dt = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s));
    return isNaN(dt.getTime()) ? null : dt;
  }
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;
    const slash = trimmed.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s*,\s*(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/
    );
    if (slash) {
      const [, dd, mm, yyyy, HH, MM, SS] = slash;
      const dt = new Date(
        Number(yyyy),
        Number(mm) - 1,
        Number(dd),
        Number(HH ?? 0),
        Number(MM ?? 0),
        Number(SS ?? 0)
      );
      return isNaN(dt.getTime()) ? null : dt;
    }
    const dt = new Date(trimmed);
    return isNaN(dt.getTime()) ? null : dt;
  }
  if (typeof input === 'number' && Number.isFinite(input)) {
    const dt = new Date(input);
    return isNaN(dt.getTime()) ? null : dt;
  }
  return null;
};

export const toYmd = (date) => {
  if (!date || isNaN(date.getTime())) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getArrivalYmd = (row) =>
  toYmd(parseStatementDate(row?.arrival_date ?? row?.bill_arrival_date ?? row?.billArrivalDate));

export const getPaymentYmd = (row) =>
  toYmd(
    parseStatementDate(
      row?.payment_timestamp ??
        row?.paymentTimestamp ??
        row?.payment_date ??
        row?.paymentDate ??
        row?.p_date ??
        row?.pDate
    )
  );

export const filterStatementRows = (rows, filters, resolveVendorName) => {
  const list = Array.isArray(rows) ? rows : [];
  const vendorName = String(filters?.vendorName || '').trim();
  const fromDate = String(filters?.fromDate || '').trim();
  const toDate = String(filters?.toDate || '').trim();
  const paymentDate = String(filters?.paymentDate || '').trim();
  const paymentMode = String(filters?.paymentMode || '').trim();
  const getName = typeof resolveVendorName === 'function' ? resolveVendorName : getStatementVendorName;

  return list.filter((row) => {
    if (vendorName && !vendorNamesMatch(getName(row), vendorName)) {
      return false;
    }

    if (fromDate) {
      const arrival = getArrivalYmd(row);
      if (!arrival || arrival < fromDate) return false;
    }
    if (toDate) {
      const arrival = getArrivalYmd(row);
      if (!arrival || arrival > toDate) return false;
    }
    if (paymentDate && getPaymentYmd(row) !== paymentDate) return false;
    if (paymentMode && String(row?.mode ?? '').trim() !== paymentMode) return false;
    return true;
  });
};
