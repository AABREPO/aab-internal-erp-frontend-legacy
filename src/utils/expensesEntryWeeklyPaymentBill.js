import { isPaymentModeRequiringBankRegisterLog } from './bankRegisterLogBeforeWeeklyBill';

export const EXPENSES_WEEKLY_BILLS_API_BASE = 'https://backendaab.in/demoAabuildersDash';

export const resolveWeeklyBillExpensesEntryId = (bill) => {
  const id = bill?.expenses_entry_id ?? bill?.expensesEntryId;
  if (id == null || id === '') return null;
  return id;
};

export const billMatchesExpensesEntryId = (bill, expensesEntryId) => {
  if (expensesEntryId == null || expensesEntryId === '') return false;
  const billExpId = resolveWeeklyBillExpensesEntryId(bill);
  if (billExpId == null) return false;
  return String(billExpId) === String(expensesEntryId);
};

/** Same rule as Form.js handlePaymentSubmit — all types except Bill Payments */
export const isExpenseEntryWeeklyBillAccountType = (accountType) => {
  const t = String(accountType || '').trim();
  return t !== '' && t !== 'Bill Payments';
};

/** GPay, PhonePe, Net Banking, Cheque (case-insensitive) */
export const isExpenseEntryNonCashPaymentMode = (paymentMode) =>
  isPaymentModeRequiringBankRegisterLog(paymentMode);

export const getExpenseEntryWeeklyBillType = (accountType) => {
  if (accountType === 'Claim Payment') return 'Claim Payment';
  if (accountType === 'Sundry Payment') return 'Sundry Payment';
  return 'Utility Payment';
};

export const normalizeWeeklyBillApiDate = (value) => {
  if (value == null || String(value).trim() === '') return null;
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const dmy = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    const [, day, month, year] = dmy;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
};

export const normalizeWeeklyBillNullableId = (value) => {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const pickModalPaymentField = (modalPaymentData, key) => {
  const val = modalPaymentData?.[key];
  if (val != null && String(val).trim() !== '') return val;
  return null;
};

export const fetchWeeklyPaymentBillsByExpensesEntryId = async (
  expensesEntryId,
  apiBase = EXPENSES_WEEKLY_BILLS_API_BASE
) => {
  const listResponse = await fetch(`${apiBase}/api/weekly-payment-bills/all`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!listResponse.ok) {
    throw new Error('Failed to fetch weekly payment bills');
  }
  const billPayments = await listResponse.json();
  return (Array.isArray(billPayments) ? billPayments : []).filter((bill) =>
    billMatchesExpensesEntryId(bill, expensesEntryId)
  );
};

/** Payload aligned with Form.js weekly-payment-bills/save */
export const buildExpenseEntryWeeklyBillSavePayload = (
  updatedFormData,
  expensesEntryId,
  { modalPaymentData = null, branchId = null, enteredBy = '' } = {}
) => {
  const chequeDateRaw = pickModalPaymentField(modalPaymentData, 'chequeDate');
  const chequeDate =
    chequeDateRaw != null
      ? normalizeWeeklyBillApiDate(chequeDateRaw) || String(chequeDateRaw).trim()
      : null;

  const resolvedDate =
    normalizeWeeklyBillApiDate(updatedFormData.date) ??
    normalizeWeeklyBillApiDate(updatedFormData.paymentDate) ??
    new Date().toISOString().slice(0, 10);

  return {
    date: resolvedDate,
    created_at: new Date().toISOString(),
    contractor_id: normalizeWeeklyBillNullableId(
      updatedFormData.contractorId ?? updatedFormData.contractor_id
    ),
    vendor_id: normalizeWeeklyBillNullableId(updatedFormData.vendorId ?? updatedFormData.vendor_id),
    employee_id: normalizeWeeklyBillNullableId(
      updatedFormData.employeeId ?? updatedFormData.employee_id
    ),
    labour_id: null,
    project_id: normalizeWeeklyBillNullableId(updatedFormData.projectId ?? updatedFormData.project_id),
    type: getExpenseEntryWeeklyBillType(updatedFormData.accountType),
    bill_payment_mode: updatedFormData.paymentMode || null,
    amount: parseFloat(updatedFormData.amount) || 0,
    status: true,
    weekly_number: '',
    weekly_payment_expense_id: null,
    expenses_entry_id: normalizeWeeklyBillNullableId(expensesEntryId),
    advance_portal_id: null,
    staff_advance_portal_id: null,
    claim_payment_id: null,
    cheque_number: pickModalPaymentField(modalPaymentData, 'chequeNo'),
    cheque_date: chequeDate,
    transaction_number: pickModalPaymentField(modalPaymentData, 'transactionNumber'),
    account_number: pickModalPaymentField(modalPaymentData, 'accountNumber'),
    branch_id: normalizeWeeklyBillNullableId(branchId),
    enteredBy: enteredBy || null,
    entered_by: enteredBy || null,
  };
};

export const saveExpenseEntryWeeklyPaymentBill = async (
  payload,
  { branchId = null, apiBase = EXPENSES_WEEKLY_BILLS_API_BASE } = {}
) => {
  let url = `${apiBase}/api/weekly-payment-bills/save`;
  if (branchId != null && branchId !== '') {
    url += `?branchId=${encodeURIComponent(branchId)}`;
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Weekly payment bills save failed: ${errText}`);
  }
  const text = await response.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

export const expenseEntryNeedsWeeklyBillPaymentModal = async (expensesEntryId, formData) => {
  if (!expensesEntryId) return false;
  if (!isExpenseEntryWeeklyBillAccountType(formData?.accountType)) return false;
  if (!isExpenseEntryNonCashPaymentMode(formData?.paymentMode)) return false;
  const existing = await fetchWeeklyPaymentBillsByExpensesEntryId(expensesEntryId);
  return existing.length === 0;
};
