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

export const weeklyExpenseMatchesExpensesEntryId = (row, expensesEntryId) => {
  if (expensesEntryId == null || expensesEntryId === '') return false;
  const rowExpId = row?.expenses_entry_id ?? row?.expensesEntryId;
  if (rowExpId == null || rowExpId === '') return false;
  return String(rowExpId) === String(expensesEntryId);
};

export const fetchWeeklyExpensesByExpensesEntryId = async (
  expensesEntryId,
  apiBase = EXPENSES_WEEKLY_BILLS_API_BASE
) => {
  try {
    const response = await fetch(`${apiBase}/api/weekly-expenses/getAll`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) return [];
    const data = await response.json();
    const list = Array.isArray(data) ? data : [];
    return list.filter((row) => weeklyExpenseMatchesExpensesEntryId(row, expensesEntryId));
  } catch {
    return [];
  }
};

/** Weekly Payment table type label from expense entry account type (Form.js cash save). */
export const getWeeklyExpenseTypeFromExpensesEntry = (accountType, utilityType, existingType) => {
  const t = String(accountType || '').trim();
  if (!t) return existingType || null;
  if (t === 'Claim Payment') return 'Claim Payment';
  if (t === 'Sundry Payment') return 'Sundry Payment';
  if (t === 'Bill Payments') return 'Bill Payment';
  if (t === 'Bill Refund') return 'Bill Refund';
  if (t === 'Utility Bills') {
    const ut = String(utilityType || '').trim();
    if (ut) return ut;
    return existingType || 'Utility Payment';
  }
  return getExpenseEntryWeeklyBillType(accountType);
};

export const buildWeeklyExpenseStubFromWeeklyPaymentBill = (bill) => {
  if (!bill) return null;
  const expenseId = bill.weekly_payment_expense_id ?? bill.weeklyPaymentExpenseId;
  if (expenseId == null) return null;
  return {
    id: expenseId,
    date: bill.date,
    created_at: bill.created_at ?? bill.createdAt,
    contractor_id: bill.contractor_id ?? bill.contractorId,
    vendor_id: bill.vendor_id ?? bill.vendorId,
    employee_id: bill.employee_id ?? bill.employeeId,
    labour_id: bill.labour_id ?? bill.labourId,
    project_id: bill.project_id ?? bill.projectId,
    type: bill.type,
    amount: bill.amount,
    status: bill.status,
    weekly_number: bill.weekly_number ?? bill.weeklyNumber,
    branch_id: bill.branch_id ?? bill.branchId,
    expenses_entry_id: bill.expenses_entry_id ?? bill.expensesEntryId,
    advance_portal_id: bill.advance_portal_id ?? bill.advancePortalId,
    staff_advance_portal_id: bill.staff_advance_portal_id ?? bill.staffAdvancePortalId,
    loan_portal_id: bill.loan_portal_id ?? bill.loanPortalId,
    rent_management_id: bill.rent_management_id ?? bill.rentManagementId,
    bill_copy_url: bill.bill_copy_url ?? bill.billCopyUrl ?? '',
  };
};

export const buildWeeklyExpenseUpdatePayloadFromExpensesEntry = (
  updatedFormData,
  existingRow,
  { editedBy = '', expensesEntryId = null } = {}
) => {
  const row = existingRow || {};
  const employeeId =
    updatedFormData.employeeId ??
    updatedFormData.employee_id ??
    row.employee_id ??
    row.employeeId;
  const labourId =
    updatedFormData.labourId ??
    updatedFormData.labour_id ??
    row.labour_id ??
    row.labourId;

  const resolvedDate =
    normalizeWeeklyBillApiDate(updatedFormData.date) ??
    normalizeWeeklyBillApiDate(row.date) ??
    null;

  const accountType = updatedFormData.accountType;
  const utilityType = updatedFormData.utilityType ?? updatedFormData.utility_type;
  const type = getWeeklyExpenseTypeFromExpensesEntry(accountType, utilityType, row.type);

  const amountRaw = parseFloat(updatedFormData.amount);
  let amount = Number.isFinite(amountRaw) ? amountRaw : parseFloat(row.amount) || 0;
  if (accountType === 'Bill Refund') {
    amount = -Math.abs(amount);
  }

  const billCopy =
    String(
      updatedFormData.billCopyUrl ??
        updatedFormData.billCopy ??
        updatedFormData.bill_copy_url ??
        ''
    ).trim() ||
    row.bill_copy_url ||
    row.billCopyUrl ||
    '';

  return {
    ...row,
    date: resolvedDate,
    contractor_id: normalizeWeeklyBillNullableId(
      updatedFormData.contractorId ??
        updatedFormData.contractor_id ??
        row.contractor_id ??
        row.contractorId
    ),
    vendor_id: normalizeWeeklyBillNullableId(
      updatedFormData.vendorId ?? updatedFormData.vendor_id ?? row.vendor_id ?? row.vendorId
    ),
    employee_id: normalizeWeeklyBillNullableId(employeeId),
    labour_id: normalizeWeeklyBillNullableId(labourId),
    project_id: normalizeWeeklyBillNullableId(
      updatedFormData.projectId ?? updatedFormData.project_id ?? row.project_id ?? row.projectId
    ),
    type,
    amount,
    bill_copy_url: billCopy,
    expenses_entry_id: normalizeWeeklyBillNullableId(
      expensesEntryId ?? updatedFormData.id ?? row.expenses_entry_id ?? row.expensesEntryId
    ),
    branch_id: normalizeWeeklyBillNullableId(row.branch_id ?? row.branchId),
    edited_by: editedBy || row.edited_by || null,
  };
};

export const updateWeeklyExpenseById = async (
  weeklyExpenseId,
  payload,
  { editedBy = '', apiBase = EXPENSES_WEEKLY_BILLS_API_BASE } = {}
) => {
  const response = await fetch(
    `${apiBase}/api/weekly-expenses/edit/${weeklyExpenseId}?username=${encodeURIComponent(editedBy || '')}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    }
  );
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Weekly expense update failed: ${errText}`);
  }
  const text = await response.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

export const collectWeeklyExpensesLinkedToExpensesEntry = async (
  expensesEntryId,
  existingWeeklyBills = [],
  apiBase = EXPENSES_WEEKLY_BILLS_API_BASE
) => {
  const byId = new Map();

  const fromApi = await fetchWeeklyExpensesByExpensesEntryId(expensesEntryId, apiBase);
  for (const row of fromApi) {
    if (row?.id != null) byId.set(String(row.id), row);
  }

  for (const bill of existingWeeklyBills || []) {
    const stub = buildWeeklyExpenseStubFromWeeklyPaymentBill(bill);
    if (!stub?.id) continue;
    const key = String(stub.id);
    if (!byId.has(key)) {
      byId.set(key, stub);
    } else {
      byId.set(key, { ...stub, ...byId.get(key) });
    }
  }

  return Array.from(byId.values());
};

/** Keep Weekly Payment / History rows in sync when an expense entry is edited. */
export const syncWeeklyExpensesForExpensesEntryEdit = async (
  expensesEntryId,
  updatedFormData,
  { editedBy = '', existingWeeklyBills = [], apiBase = EXPENSES_WEEKLY_BILLS_API_BASE } = {}
) => {
  if (!expensesEntryId) return;

  const linkedRows = await collectWeeklyExpensesLinkedToExpensesEntry(
    expensesEntryId,
    existingWeeklyBills,
    apiBase
  );

  for (const row of linkedRows) {
    if (row?.id == null) continue;
    const payload = buildWeeklyExpenseUpdatePayloadFromExpensesEntry(updatedFormData, row, {
      editedBy,
      expensesEntryId,
    });
    await updateWeeklyExpenseById(row.id, payload, { editedBy, apiBase });
  }
};

const EXPENSES_FORM_API_BASE = 'https://backendaab.in/demoAabuilderDash';

export const resolveWeeklyExpenseExpensesEntryId = (row) => {
  const id = row?.expenses_entry_id ?? row?.expensesEntryId;
  if (id == null || id === '') return null;
  const n = Number(id);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export const getExpensesEntryAccountTypeFromWeeklyExpenseType = (weeklyType) => {
  const t = String(weeklyType || '').trim();
  if (t === 'Bill Payment' || t === 'Bill') return 'Bill Payments';
  if (t === 'Claim' || t === 'Claim Payment') return 'Claim Payment';
  return null;
};

export const fetchExpensesFormEntryById = async (
  expensesEntryId,
  apiBase = EXPENSES_FORM_API_BASE
) => {
  const res = await fetch(`${apiBase}/expenses_form/get_form`, {
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch expenses for linked entry update');
  }
  const all = await res.json();
  return (Array.isArray(all) ? all : []).find((e) => String(e.id) === String(expensesEntryId)) || null;
};

export const buildExpenseUpdatePayloadFromWeeklyExpenseEdit = (
  weeklyData,
  existingExpense,
  { editedBy = '', siteLabel = '', vendorName = '', contractorName = '' } = {}
) => {
  const existing = existingExpense || {};
  const weeklyType = weeklyData?.type ?? weeklyData?.accountType;
  const mappedAccountType = getExpensesEntryAccountTypeFromWeeklyExpenseType(weeklyType);

  const resolvedDate =
    normalizeWeeklyBillApiDate(weeklyData?.date) ??
    normalizeWeeklyBillApiDate(existing.date) ??
    '';

  const projectId =
    normalizeWeeklyBillNullableId(weeklyData?.project_id ?? weeklyData?.projectId) ??
    existing.projectId ??
    existing.project_id ??
    null;

  const vendorId = normalizeWeeklyBillNullableId(weeklyData?.vendor_id ?? weeklyData?.vendorId);
  const contractorId = normalizeWeeklyBillNullableId(
    weeklyData?.contractor_id ?? weeklyData?.contractorId
  );

  const amountRaw = parseFloat(weeklyData?.amount);
  const amount = Number.isFinite(amountRaw) ? amountRaw : parseFloat(existing.amount) || 0;

  const weeklyDescription = String(weeklyData?.description ?? '').trim();

  // Inline Cash Register edits must not touch bill copy on expenses_form — only the
  // expense-entry popup / dedicated upload flow should change the file URL.
  const existingBillCopy = String(existing.billCopyUrl ?? existing.billCopy ?? '').trim();

  return {
    ...existing,
    accountType: mappedAccountType || existing.accountType || 'Bill Payments',
    date: resolvedDate,
    siteName: siteLabel || existing.siteName || existing.projectName || '',
    projectId,
    vendor: vendorName || existing.vendor || '',
    vendorId: vendorId ?? existing.vendorId ?? existing.vendor_id ?? null,
    contractor: contractorName || existing.contractor || '',
    contractorId: contractorId ?? existing.contractorId ?? existing.contractor_id ?? null,
    amount,
    ...(existingBillCopy ? { billCopy: existingBillCopy, billCopyUrl: existingBillCopy } : {}),
    comments: weeklyDescription || existing.comments || '',
    source: existing.source || weeklyData?.source || 'Cash Register',
    branchId:
      normalizeWeeklyBillNullableId(weeklyData?.branch_id ?? weeklyData?.branchId) ??
      existing.branchId ??
      existing.branch_id ??
      null,
    editedBy: editedBy || existing.editedBy || null,
  };
};

/** When a Cash Register weekly expense row is edited, mirror changes onto expenses_form. */
export const syncExpensesEntryFromWeeklyExpenseEdit = async (
  weeklyExpenseData,
  {
    editedBy = '',
    siteLabel = '',
    vendorName = '',
    contractorName = '',
    apiBase = EXPENSES_FORM_API_BASE,
  } = {}
) => {
  const expensesEntryId = resolveWeeklyExpenseExpensesEntryId(weeklyExpenseData);
  if (!expensesEntryId) return { ok: false, skipped: true };

  const existingExpense = await fetchExpensesFormEntryById(expensesEntryId, apiBase);
  if (!existingExpense) {
    console.warn(`Linked expense entry ${expensesEntryId} not found; skipping expense sync`);
    return { ok: false, skipped: true, notFound: true };
  }

  const updatePayload = buildExpenseUpdatePayloadFromWeeklyExpenseEdit(
    weeklyExpenseData,
    existingExpense,
    { editedBy, siteLabel, vendorName, contractorName }
  );

  const response = await fetch(`${apiBase}/expenses_form/update/${expensesEntryId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updatePayload),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to update linked expense entry: ${errText}`);
  }
  return { ok: true, expensesEntryId };
};
