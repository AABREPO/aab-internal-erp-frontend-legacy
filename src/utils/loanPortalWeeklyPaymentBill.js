import {
  postBankRegisterLogSave,
  bankRegisterLogSaveUrlMatchingRequest,
  isPaymentModeRequiringBankRegisterLog,
} from './bankRegisterLogBeforeWeeklyBill';
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

const pickLoanModalPaymentField = (modalPaymentData, key) => {
  const val = modalPaymentData?.[key];
  if (val != null && String(val).trim() !== '') return val;
  return null;
};

const pickLoanWeeklyBillModalOrExisting = (modalPaymentData, bill, modalKey, snakeKey, camelKey) => {
  const fromModal = pickLoanModalPaymentField(modalPaymentData, modalKey);
  if (fromModal != null) return fromModal;
  return pickExistingBillField(bill, snakeKey, camelKey, null);
};

/** GPay, PhonePe, Net Banking, Cheque */
export const isLoanOnlinePaymentModeForModal = (paymentMode) =>
  isPaymentModeRequiringBankRegisterLog(paymentMode);

export const getLoanPortalDisplayAmount = (payload) => {
  if (payload?.type === 'Refund') return payload.loan_refund_amount ?? '';
  return payload.amount ?? '';
};

export const fetchWeeklyPaymentBillsByLoanPortalId = async (loanPortalId) => {
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
    const billLoanId = bill.loan_portal_id ?? bill.loanPortalId;
    return billLoanId != null && String(billLoanId) === String(loanPortalId);
  });
};

const resolveLoanWeeklyBillAmount = (loanPayload) => {
  if (loanPayload?.type === 'Refund') {
    return parseFloat(loanPayload.loan_refund_amount) || 0;
  }
  return parseFloat(loanPayload.amount) || 0;
};

const shouldSyncLoanToWeeklyBill = (loanPayload) => {
  if (loanPayload?.type !== 'Loan') return false;
  const mode = String(loanPayload?.loan_payment_mode || '').trim();
  if (!mode) return false;
  return isLoanOnlinePaymentModeForModal(mode);
};

export const buildLoanPortalWeeklyBillUpdatePayload = (
  loanPayload,
  existingBill,
  { editedBy = '', loanPortalId, modalPaymentData = null, purposeId = null } = {}
) => {
  const bill = existingBill || {};
  const chequeDateRaw = pickLoanWeeklyBillModalOrExisting(
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

  const resolvedLoanPortalId =
    normalizeWeeklyBillNullableId(loanPortalId) ??
    normalizeWeeklyBillNullableId(bill.loan_portal_id ?? bill.loanPortalId);

  return {
    date:
      normalizeWeeklyBillApiDate(loanPayload.date) ??
      normalizeWeeklyBillApiDate(bill.date),
    created_at: pickExistingBillField(bill, 'created_at', 'createdAt', new Date().toISOString()),
    contractor_id:
      normalizeWeeklyBillNullableId(loanPayload.contractor_id) ??
      normalizeWeeklyBillNullableId(bill.contractor_id ?? bill.contractorId),
    vendor_id:
      normalizeWeeklyBillNullableId(loanPayload.vendor_id) ??
      normalizeWeeklyBillNullableId(bill.vendor_id ?? bill.vendorId),
    employee_id:
      normalizeWeeklyBillNullableId(loanPayload.employee_id) ??
      normalizeWeeklyBillNullableId(bill.employee_id ?? bill.employeeId),
    labour_id: normalizeWeeklyBillNullableId(bill.labour_id ?? bill.labourId),
    project_id: normalizeWeeklyBillNullableId(bill.project_id ?? bill.projectId),
    type: 'Loan',
    amount: resolveLoanWeeklyBillAmount(loanPayload),
    status: bill.status !== false,
    weekly_number: bill.weekly_number ?? bill.weeklyNumber ?? null,
    weekly_payment_expense_id: normalizeWeeklyBillNullableId(
      bill.weekly_payment_expense_id ?? bill.weeklyPaymentExpenseId
    ),
    bill_payment_mode:
      loanPayload.loan_payment_mode ||
      bill.bill_payment_mode ||
      bill.billPaymentMode ||
      null,
    advance_portal_id: normalizeWeeklyBillNullableId(bill.advance_portal_id ?? bill.advancePortalId),
    staff_advance_portal_id: normalizeWeeklyBillNullableId(
      bill.staff_advance_portal_id ?? bill.staffAdvancePortalId
    ),
    tenant_id: normalizeWeeklyBillNullableId(bill.tenant_id ?? bill.tenantId),
    tenant_complex_name: bill.tenant_complex_name ?? bill.tenantComplexName ?? null,
    rent_management_id: normalizeWeeklyBillNullableId(
      bill.rent_management_id ?? bill.rentManagementId
    ),
    loan_portal_id: resolvedLoanPortalId,
    expenses_entry_id: normalizeWeeklyBillNullableId(
      bill.expenses_entry_id ?? bill.expensesEntryId
    ),
    claim_payment_id: normalizeWeeklyBillNullableId(
      bill.claim_payment_id ?? bill.claimPaymentId
    ),
    purpose_id:
      normalizeWeeklyBillNullableId(purposeId) ??
      normalizeWeeklyBillNullableId(loanPayload.from_purpose_id) ??
      normalizeWeeklyBillNullableId(bill.purpose_id ?? bill.purposeId),
    cheque_number: pickLoanWeeklyBillModalOrExisting(
      modalPaymentData,
      bill,
      'chequeNo',
      'cheque_number',
      'chequeNumber'
    ),
    cheque_date: chequeDate,
    transaction_number: pickLoanWeeklyBillModalOrExisting(
      modalPaymentData,
      bill,
      'transactionNumber',
      'transaction_number',
      'transactionNumber'
    ),
    account_number: pickLoanWeeklyBillModalOrExisting(
      modalPaymentData,
      bill,
      'accountNumber',
      'account_number',
      'accountNumber'
    ),
    vendor_payment_tracker_id:
      bill.vendor_payment_tracker_id ?? bill.vendorPaymentTrackerId ?? null,
    branch_id: normalizeWeeklyBillNullableId(
      loanPayload.branch_id ?? bill.branch_id ?? bill.branchId
    ),
    payment_status: bill.payment_status ?? bill.paymentStatus ?? null,
    received_from: bill.received_from ?? bill.receivedFrom ?? null,
    description: bill.description ?? null,
    discount_amount: parseFloat(bill.discount_amount ?? bill.discountAmount) || 0,
    edited_by: editedBy || bill.edited_by || bill.editedBy || null,
    entered_by: (bill.entered_by ?? bill.enteredBy) ?? (editedBy || null),
  };
};

export const buildLoanPortalWeeklyBillSavePayload = (
  loanPayload,
  loanPortalId,
  { modalPaymentData = null, branchId = null, enteredBy = '', purposeId = null } = {}
) => {
  const chequeDateRaw = pickLoanModalPaymentField(modalPaymentData, 'chequeDate');
  const chequeDate =
    chequeDateRaw != null
      ? normalizeWeeklyBillApiDate(chequeDateRaw) || String(chequeDateRaw).trim()
      : null;

  return {
    date: normalizeWeeklyBillApiDate(loanPayload.date),
    created_at: new Date().toISOString(),
    contractor_id: normalizeWeeklyBillNullableId(loanPayload.contractor_id),
    vendor_id: normalizeWeeklyBillNullableId(loanPayload.vendor_id),
    employee_id: normalizeWeeklyBillNullableId(loanPayload.employee_id),
    project_id: 0,
    type: 'Loan',
    bill_payment_mode: loanPayload.loan_payment_mode || null,
    amount: resolveLoanWeeklyBillAmount(loanPayload),
    status: true,
    weekly_number: '',
    weekly_payment_expense_id: null,
    advance_portal_id: null,
    staff_advance_portal_id: null,
    claim_payment_id: null,
    purpose_id:
      normalizeWeeklyBillNullableId(purposeId) ??
      normalizeWeeklyBillNullableId(loanPayload.from_purpose_id),
    loan_portal_id: normalizeWeeklyBillNullableId(loanPortalId),
    cheque_number: pickLoanModalPaymentField(modalPaymentData, 'chequeNo'),
    cheque_date: chequeDate,
    transaction_number: pickLoanModalPaymentField(modalPaymentData, 'transactionNumber'),
    account_number: pickLoanModalPaymentField(modalPaymentData, 'accountNumber'),
    branch_id: normalizeWeeklyBillNullableId(branchId ?? loanPayload.branch_id),
    entered_by: enteredBy || null,
  };
};

export const deleteRelatedWeeklyPaymentBillsForLoanPortal = async (loanPortalId) => {
  const matchingBills = await fetchWeeklyPaymentBillsByLoanPortalId(loanPortalId);
  if (!matchingBills.length) {
    return { deletedCount: 0, failedCount: 0 };
  }

  const deleteResults = await Promise.all(
    matchingBills.map(async (bill) => {
      if (bill?.id == null) return false;
      const deleteResponse = await fetch(
        `${TOOLS_API_BASE}/api/weekly-payment-bills/delete/${bill.id}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return deleteResponse.ok;
    })
  );

  const deletedCount = deleteResults.filter(Boolean).length;
  return { deletedCount, failedCount: deleteResults.length - deletedCount };
};

export const syncWeeklyPaymentBillsForLoanPortal = async (
  loanPortalId,
  loanPayload,
  { editedBy = '', branchId = null, modalPaymentData = null, purposeId = null } = {}
) => {
  if (!loanPortalId) return;

  const matchingBills = await fetchWeeklyPaymentBillsByLoanPortalId(loanPortalId);
  const isOnlineMode = shouldSyncLoanToWeeklyBill(loanPayload);

  if (!isOnlineMode) {
    if (matchingBills.length > 0) {
      await deleteRelatedWeeklyPaymentBillsForLoanPortal(loanPortalId);
    }
    return;
  }

  if (!modalPaymentData?.accountNumber) {
    return;
  }

  if (matchingBills.length > 0) {
    for (const bill of matchingBills) {
      if (bill?.id == null) continue;
      const payload = buildLoanPortalWeeklyBillUpdatePayload(loanPayload, bill, {
        editedBy,
        loanPortalId,
        modalPaymentData,
        purposeId,
      });
      await updateWeeklyPaymentBillById(bill.id, payload);
    }
    return;
  }

  const resolvedBranchId = branchId ?? loanPayload.branch_id ?? loanPayload.branchId;
  const savePayload = buildLoanPortalWeeklyBillSavePayload(loanPayload, loanPortalId, {
    modalPaymentData,
    branchId: resolvedBranchId,
    enteredBy: editedBy,
    purposeId,
  });

  const loanEditUrl = `${TOOLS_API_BASE}/api/loans/${loanPortalId}?editedBy=${encodeURIComponent(editedBy || '')}`;
  if (isPaymentModeRequiringBankRegisterLog(loanPayload.loan_payment_mode)) {
    await postBankRegisterLogSave(
      bankRegisterLogSaveUrlMatchingRequest(loanEditUrl),
      'Loan Portal',
      {
        bill_payment_mode: loanPayload.loan_payment_mode,
        amount: resolveLoanWeeklyBillAmount(loanPayload),
        entered_by: editedBy,
      }
    );
  }

  await saveWeeklyPaymentBill(savePayload, { branchId: resolvedBranchId });
};
