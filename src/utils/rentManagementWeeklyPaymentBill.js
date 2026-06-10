import {
  updateWeeklyPaymentBillById,
  saveWeeklyPaymentBill,
} from './advancePortalWeeklyPaymentBill';

const TOOLS_API_BASE = 'https://backendaab.in/demoAabuildersDash';

const normalizeWeeklyBillNullableId = (value) => {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const normalizeWeeklyBillApiDate = (value) => {
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

const pickExistingBillField = (bill, snakeKey, camelKey, fallback = null) =>
  bill?.[snakeKey] ?? bill?.[camelKey] ?? fallback;

const pickRentModalPaymentField = (modalPaymentData, key) => {
  const val = modalPaymentData?.[key];
  if (val != null && String(val).trim() !== '') return val;
  return null;
};

const pickRentWeeklyBillModalOrExisting = (modalPaymentData, bill, modalKey, snakeKey, camelKey) => {
  const fromModal = pickRentModalPaymentField(modalPaymentData, modalKey);
  if (fromModal != null) return fromModal;
  return pickExistingBillField(bill, snakeKey, camelKey, null);
};

export const fetchWeeklyPaymentBillsByRentManagementId = async (rentManagementId) => {
  const listResponse = await fetch(`${TOOLS_API_BASE}/api/weekly-payment-bills/all`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!listResponse.ok) {
    throw new Error('Failed to fetch weekly payment bills');
  }
  const billPayments = await listResponse.json();
  return (Array.isArray(billPayments) ? billPayments : []).filter((bill) => {
    const billRentId = bill.rent_management_id ?? bill.rentManagementId;
    return billRentId != null && String(billRentId) === String(rentManagementId);
  });
};

export const buildRentPaymentModalData = (existingBill, defaults = {}) => {
  const bill = existingBill || {};
  return {
    date:
      defaults.date ||
      normalizeWeeklyBillApiDate(bill.date) ||
      new Date().toISOString().split('T')[0],
    amount: defaults.amount ?? bill.amount ?? '',
    paymentMode:
      defaults.paymentMode ??
      bill.bill_payment_mode ??
      bill.billPaymentMode ??
      '',
    chequeNo:
      bill.cheque_number ??
      bill.chequeNumber ??
      defaults.chequeNo ??
      '',
    chequeDate:
      normalizeWeeklyBillApiDate(bill.cheque_date ?? bill.chequeDate) ??
      defaults.chequeDate ??
      '',
    transactionNumber:
      bill.transaction_number ??
      bill.transactionNumber ??
      defaults.transactionNumber ??
      '',
    accountNumber:
      bill.account_number ??
      bill.accountNumber ??
      defaults.accountNumber ??
      '',
  };
};

export const loadRentPaymentModalData = async (rentManagementId, defaults = {}) => {
  if (!rentManagementId) {
    return buildRentPaymentModalData(null, defaults);
  }
  try {
    const bills = await fetchWeeklyPaymentBillsByRentManagementId(rentManagementId);
    const existingBill = bills.length > 0 ? bills[0] : null;
    return buildRentPaymentModalData(existingBill, defaults);
  } catch (error) {
    console.warn('Could not fetch weekly bill to prefill rent payment modal', error);
    return buildRentPaymentModalData(null, defaults);
  }
};

export const buildRentManagementWeeklyBillUpdatePayload = (
  rentPayload,
  existingBill,
  { editedBy = '', rentManagementId, modalPaymentData = null } = {}
) => {
  const bill = existingBill || {};
  const chequeDateRaw = pickRentWeeklyBillModalOrExisting(
    modalPaymentData,
    bill,
    'chequeDate',
    'cheque_date',
    'chequeDate'
  );
  const chequeDate =
    chequeDateRaw != null
      ? normalizeWeeklyBillApiDate(chequeDateRaw) || String(chequeDateRaw).trim()
      : null;

  const resolvedRentManagementId =
    normalizeWeeklyBillNullableId(rentManagementId) ??
    normalizeWeeklyBillNullableId(bill.rent_management_id ?? bill.rentManagementId);

  return {
    date:
      normalizeWeeklyBillApiDate(rentPayload.date) ??
      normalizeWeeklyBillApiDate(bill.date),
    created_at: pickExistingBillField(bill, 'created_at', 'createdAt', new Date().toISOString()),
    contractor_id: normalizeWeeklyBillNullableId(bill.contractor_id ?? bill.contractorId),
    vendor_id: normalizeWeeklyBillNullableId(bill.vendor_id ?? bill.vendorId),
    employee_id: normalizeWeeklyBillNullableId(bill.employee_id ?? bill.employeeId),
    labour_id: normalizeWeeklyBillNullableId(bill.labour_id ?? bill.labourId),
    project_id:
      normalizeWeeklyBillNullableId(rentPayload.project_id) ??
      normalizeWeeklyBillNullableId(bill.project_id ?? bill.projectId),
    type: 'Rent Payment',
    amount: parseFloat(rentPayload.amount) || parseFloat(bill.amount) || 0,
    status: bill.status !== false,
    weekly_number: bill.weekly_number ?? bill.weeklyNumber ?? '',
    weekly_payment_expense_id: normalizeWeeklyBillNullableId(
      bill.weekly_payment_expense_id ?? bill.weeklyPaymentExpenseId
    ),
    bill_payment_mode:
      rentPayload.payment_mode ||
      rentPayload.bill_payment_mode ||
      bill.bill_payment_mode ||
      bill.billPaymentMode ||
      null,
    advance_portal_id: normalizeWeeklyBillNullableId(bill.advance_portal_id ?? bill.advancePortalId),
    staff_advance_portal_id: normalizeWeeklyBillNullableId(
      bill.staff_advance_portal_id ?? bill.staffAdvancePortalId
    ),
    claim_payment_id: normalizeWeeklyBillNullableId(bill.claim_payment_id ?? bill.claimPaymentId),
    expenses_entry_id: normalizeWeeklyBillNullableId(bill.expenses_entry_id ?? bill.expensesEntryId),
    rent_management_id: resolvedRentManagementId,
    loan_portal_id: normalizeWeeklyBillNullableId(bill.loan_portal_id ?? bill.loanPortalId),
    tenant_id:
      normalizeWeeklyBillNullableId(rentPayload.tenant_id) ??
      normalizeWeeklyBillNullableId(bill.tenant_id ?? bill.tenantId),
    tenant_complex_name:
      rentPayload.tenant_complex_name ??
      bill.tenant_complex_name ??
      bill.tenantComplexName ??
      null,
    cheque_number: pickRentWeeklyBillModalOrExisting(
      modalPaymentData,
      bill,
      'chequeNo',
      'cheque_number',
      'chequeNumber'
    ),
    cheque_date: chequeDate,
    transaction_number: pickRentWeeklyBillModalOrExisting(
      modalPaymentData,
      bill,
      'transactionNumber',
      'transaction_number',
      'transactionNumber'
    ),
    account_number: pickRentWeeklyBillModalOrExisting(
      modalPaymentData,
      bill,
      'accountNumber',
      'account_number',
      'accountNumber'
    ),
    vendor_payment_tracker_id:
      bill.vendor_payment_tracker_id ?? bill.vendorPaymentTrackerId ?? null,
    branch_id: normalizeWeeklyBillNullableId(bill.branch_id ?? bill.branchId),
    edited_by: editedBy || bill.edited_by || bill.editedBy || null,
    entered_by: (bill.entered_by ?? bill.enteredBy) ?? (editedBy || null),
  };
};

export const buildRentManagementWeeklyBillSavePayload = (
  rentPayload,
  rentManagementId,
  { modalPaymentData = null, enteredBy = '' } = {}
) => {
  const chequeDateRaw = pickRentModalPaymentField(modalPaymentData, 'chequeDate');
  const chequeDate =
    chequeDateRaw != null
      ? normalizeWeeklyBillApiDate(chequeDateRaw) || String(chequeDateRaw).trim()
      : null;

  return {
    date: normalizeWeeklyBillApiDate(rentPayload.date),
    created_at: new Date().toISOString(),
    contractor_id: null,
    vendor_id: null,
    employee_id: null,
    project_id: normalizeWeeklyBillNullableId(rentPayload.project_id),
    type: 'Rent Payment',
    bill_payment_mode:
      rentPayload.payment_mode || rentPayload.bill_payment_mode || null,
    amount: parseFloat(rentPayload.amount) || 0,
    status: true,
    weekly_number: '',
    rent_management_id: normalizeWeeklyBillNullableId(rentManagementId),
    advance_portal_id: null,
    staff_advance_portal_id: null,
    claim_payment_id: null,
    expenses_entry_id: null,
    cheque_number: pickRentModalPaymentField(modalPaymentData, 'chequeNo'),
    cheque_date: chequeDate,
    transaction_number: pickRentModalPaymentField(modalPaymentData, 'transactionNumber'),
    account_number: pickRentModalPaymentField(modalPaymentData, 'accountNumber'),
    tenant_id: normalizeWeeklyBillNullableId(rentPayload.tenant_id),
    tenant_complex_name: rentPayload.tenant_complex_name ?? null,
    entered_by: enteredBy || null,
  };
};

export const syncWeeklyPaymentBillsForRentManagement = async (
  rentManagementId,
  rentPayload,
  { editedBy = '', modalPaymentData = null } = {}
) => {
  if (!rentManagementId) return;

  if (!modalPaymentData?.accountNumber) {
    return;
  }

  const matchingBills = await fetchWeeklyPaymentBillsByRentManagementId(rentManagementId);

  if (matchingBills.length > 0) {
    for (const bill of matchingBills) {
      if (bill?.id == null) continue;
      const payload = buildRentManagementWeeklyBillUpdatePayload(rentPayload, bill, {
        editedBy,
        rentManagementId,
        modalPaymentData,
      });
      await updateWeeklyPaymentBillById(bill.id, payload);
    }
    return;
  }

  const savePayload = buildRentManagementWeeklyBillSavePayload(rentPayload, rentManagementId, {
    modalPaymentData,
    enteredBy: editedBy,
  });
  await saveWeeklyPaymentBill(savePayload);
};
