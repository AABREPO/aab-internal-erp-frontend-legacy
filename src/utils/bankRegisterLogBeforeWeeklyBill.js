function resolveEnteredByFromPayload(p) {
  const direct = p?.entered_by ?? p?.enteredBy;
  if (direct !== null && direct !== undefined && String(direct).trim() !== '') {
    return String(direct);
  }
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return String(user?.name || user?.username || user?.userName || '').trim();
  } catch {
    return '';
  }
}

/** GPay / Gpay, PhonePe, Net Banking, Cheque — case-insensitive */
export function isPaymentModeRequiringBankRegisterLog(paymentMode) {
  const m = String(paymentMode || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
  if (!m) return false;
  return m === 'gpay' || m === 'phonepe' || m === 'net banking' || m === 'cheque';
}

/**
 * Bank log lives on aabuildersDash; copy query params (e.g. branchId) from the main request URL.
 */
export function bankRegisterLogSaveUrlMatchingRequest(referenceAbsoluteUrl) {
  const base = 'https://backendaab.in/demoAabuildersDash/api/bank_register_log/save';
  try {
    const ref = new URL(referenceAbsoluteUrl);
    const out = new URL(base);
    ref.searchParams.forEach((v, k) => out.searchParams.set(k, v));
    return out.toString();
  } catch {
    return base;
  }
}

export function buildBankRegisterLogBody(moduleName, weeklyBillPayload) {
  const p = weeklyBillPayload || {};
  const enteredBy = resolveEnteredByFromPayload(p);
  const amount = p.amount != null && p.amount !== '' ? String(p.amount) : '';
  const paymentMode =
    p.bill_payment_mode ?? p.billPaymentMode ?? p.payment_mode ?? p.paymentMode ?? '';
  return {
    module_name: String(moduleName || ''),
    entered_by: enteredBy,
    amount,
    payment_mode: String(paymentMode || ''),
  };
}

/**
 * POST bank_register_log/save. Default: throws if the response is not OK (so main module save does not run).
 */
export async function postBankRegisterLogSave(logUrl, moduleName, payloadFields, options = {}) {
  if (!logUrl || typeof logUrl !== 'string') {
    throw new Error('postBankRegisterLogSave: log URL is required');
  }
  const body = buildBankRegisterLogBody(moduleName, payloadFields);
  const credentials = options.credentials ?? 'include';
  const res = await fetch(logUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`bank_register_log/save failed: ${res.status} ${text}`);
    if (options.throwOnError !== false) throw err;
    console.warn(err.message);
  }
}

/**
 * Legacy name kept for older call sites: POST bank log using the same query string as the given URL
 * (e.g. weekly-payment-bills/save?branchId=…). Prefer {@link postBankRegisterLogSave} with
 * {@link bankRegisterLogSaveUrlMatchingRequest} before your module’s main save.
 */
export async function postBankRegisterLogBeforeWeeklyBillSave(
  referenceWeeklyOrMainUrl,
  moduleName,
  payloadFields,
  options = {}
) {
  return postBankRegisterLogSave(
    bankRegisterLogSaveUrlMatchingRequest(referenceWeeklyOrMainUrl),
    moduleName,
    payloadFields,
    options
  );
}
