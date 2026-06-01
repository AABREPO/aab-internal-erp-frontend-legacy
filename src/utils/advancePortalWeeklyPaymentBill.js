import {
  postBankRegisterLogSave,
  bankRegisterLogSaveUrlMatchingRequest,
  isPaymentModeRequiringBankRegisterLog,
} from './bankRegisterLogBeforeWeeklyBill';

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

const normalizeWeeklyBillWeeklyNumber = (value) => {
  if (value == null || value === '') return null;
  const n = parseInt(String(value).trim(), 10);
  return Number.isFinite(n) ? n : null;
};

const pickExistingBillField = (bill, snakeKey, camelKey, fallback = null) =>
  bill?.[snakeKey] ?? bill?.[camelKey] ?? fallback;

const resolveAdvanceWeeklyBillAmount = (advancePayload) => {
  const type = advancePayload?.type;
  if (type === 'Refund') return parseFloat(advancePayload.refund_amount) || 0;
  return parseFloat(advancePayload.amount) || 0;
};

const shouldSyncAdvanceToWeeklyBill = (advancePayload) => {
  const mode = String(advancePayload?.payment_mode || '').trim();
  if (!mode || mode.toLowerCase() === 'direct') return false;
  if (advancePayload?.type === 'Transfer') return false;
  return true;
};

export const needsAdvancePortalPaymentModalForWeeklyBill = async (advancePortalId, advancePayload) => {
  if (!advancePortalId || !shouldSyncAdvanceToWeeklyBill(advancePayload)) return false;
  const matchingBills = await fetchWeeklyPaymentBillsByAdvancePortalId(advancePortalId);
  return matchingBills.length === 0;
};

export const isAdvanceOnlinePaymentModeForModal = (paymentMode) => {
  const mode = String(paymentMode || '').trim();
  return mode === 'GPay' || mode === 'Gpay' || mode === 'PhonePe' || mode === 'Net Banking' || mode === 'Cheque';
};

export const getAdvancePortalDisplayAmount = (payload) => {
  if (payload?.type === 'Refund') return payload.refund_amount ?? '';
  return payload.amount ?? '';
};

export const fetchWeeklyPaymentBillsByAdvancePortalId = async (advancePortalId) => {
  const listResponse = await fetch(`${TOOLS_API_BASE}/api/weekly-payment-bills/all`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!listResponse.ok) {
    throw new Error('Failed to fetch bill payments');
  }
  const billPayments = await listResponse.json();
  return (Array.isArray(billPayments) ? billPayments : []).filter((bill) => {
    const billAdvanceId = bill.advance_portal_id ?? bill.advancePortalId;
    return billAdvanceId != null && String(billAdvanceId) === String(advancePortalId);
  });
};

export const buildAdvancePortalWeeklyBillUpdatePayload = (
  advancePayload,
  existingBill,
  { editedBy = '', advancePortalId } = {}
) => {
  const bill = existingBill || {};
  const resolvedAdvancePortalId =
    normalizeWeeklyBillNullableId(advancePortalId) ??
    normalizeWeeklyBillNullableId(
      advancePayload.advancePortalId ?? advancePayload.advance_portal_id
    );

  const resolvedDate =
    normalizeWeeklyBillApiDate(advancePayload.date) ??
    normalizeWeeklyBillApiDate(bill.date);

  const vendorId = normalizeWeeklyBillNullableId(advancePayload.vendor_id);
  const contractorId = normalizeWeeklyBillNullableId(advancePayload.contractor_id);

  return {
    date: resolvedDate,
    created_at: pickExistingBillField(bill, 'created_at', 'createdAt', new Date().toISOString()),
    contractor_id:
      contractorId ??
      normalizeWeeklyBillNullableId(bill.contractor_id ?? bill.contractorId),
    vendor_id:
      vendorId ?? normalizeWeeklyBillNullableId(bill.vendor_id ?? bill.vendorId),
    employee_id: normalizeWeeklyBillNullableId(bill.employee_id ?? bill.employeeId),
    labour_id: normalizeWeeklyBillNullableId(bill.labour_id ?? bill.labourId),
    project_id: normalizeWeeklyBillNullableId(
      advancePayload.project_id ?? bill.project_id ?? bill.projectId
    ),
    type: advancePayload.type || bill.type,
    amount: resolveAdvanceWeeklyBillAmount(advancePayload),
    status: bill.status !== false,
    weekly_number: normalizeWeeklyBillWeeklyNumber(bill.weekly_number ?? bill.weeklyNumber),
    weekly_payment_expense_id: normalizeWeeklyBillNullableId(
      bill.weekly_payment_expense_id ?? bill.weeklyPaymentExpenseId
    ),
    bill_payment_mode:
      advancePayload.payment_mode ||
      bill.bill_payment_mode ||
      bill.billPaymentMode ||
      null,
    advance_portal_id: resolvedAdvancePortalId,
    staff_advance_portal_id: normalizeWeeklyBillNullableId(
      bill.staff_advance_portal_id ?? bill.staffAdvancePortalId
    ),
    tenant_id: normalizeWeeklyBillNullableId(bill.tenant_id ?? bill.tenantId),
    tenant_complex_name: bill.tenant_complex_name ?? bill.tenantComplexName ?? null,
    rent_management_id: normalizeWeeklyBillNullableId(
      bill.rent_management_id ?? bill.rentManagementId
    ),
    loan_portal_id: normalizeWeeklyBillNullableId(bill.loan_portal_id ?? bill.loanPortalId),
    expenses_entry_id: normalizeWeeklyBillNullableId(
      bill.expenses_entry_id ?? bill.expensesEntryId
    ),
    claim_payment_id: normalizeWeeklyBillNullableId(
      bill.claim_payment_id ?? bill.claimPaymentId
    ),
    purpose_id: normalizeWeeklyBillNullableId(bill.purpose_id ?? bill.purposeId),
    cheque_number: bill.cheque_number ?? bill.chequeNumber ?? null,
    cheque_date: bill.cheque_date ?? bill.chequeDate ?? null,
    transaction_number: bill.transaction_number ?? bill.transactionNumber ?? null,
    account_number: bill.account_number ?? bill.accountNumber ?? null,
    vendor_payment_tracker_id:
      bill.vendor_payment_tracker_id ?? bill.vendorPaymentTrackerId ?? null,
    branch_id: normalizeWeeklyBillNullableId(
      advancePayload.branch_id ?? bill.branch_id ?? bill.branchId
    ),
    payment_status: bill.payment_status ?? bill.paymentStatus ?? null,
    received_from: bill.received_from ?? bill.receivedFrom ?? null,
    description: bill.description ?? null,
    discount_amount:
      advancePayload.discount_amount != null && advancePayload.discount_amount !== ''
        ? parseFloat(advancePayload.discount_amount) || 0
        : (parseFloat(bill.discount_amount ?? bill.discountAmount) || 0),
    edited_by: editedBy || bill.edited_by || bill.editedBy || null,
    entered_by: (bill.entered_by ?? bill.enteredBy) ?? (editedBy || null),
  };
};

const pickAdvanceModalPaymentField = (modalPaymentData, modalKey) => {
  const modalVal = modalPaymentData?.[modalKey];
  if (modalVal != null && String(modalVal).trim() !== '') {
    return modalVal;
  }
  return null;
};

export const buildAdvancePortalWeeklyBillSavePayload = (
  advancePayload,
  advancePortalId,
  { modalPaymentData = null, branchId = null, enteredBy = '' } = {}
) => {
  const chequeDateRaw = pickAdvanceModalPaymentField(modalPaymentData, 'chequeDate');
  const chequeDate =
    chequeDateRaw != null
      ? normalizeWeeklyBillApiDate(chequeDateRaw) || String(chequeDateRaw).trim()
      : null;

  return {
    date: normalizeWeeklyBillApiDate(advancePayload.date),
    created_at: new Date().toISOString(),
    contractor_id: normalizeWeeklyBillNullableId(advancePayload.contractor_id),
    vendor_id: normalizeWeeklyBillNullableId(advancePayload.vendor_id),
    employee_id: null,
    labour_id: null,
    project_id: normalizeWeeklyBillNullableId(advancePayload.project_id),
    type: advancePayload.type || null,
    bill_payment_mode: advancePayload.payment_mode || null,
    amount: resolveAdvanceWeeklyBillAmount(advancePayload),
    discount_amount:
      advancePayload.discount_amount != null && advancePayload.discount_amount !== ''
        ? parseFloat(advancePayload.discount_amount) || 0
        : 0,
    status: true,
    weekly_number: null,
    weekly_payment_expense_id: null,
    advance_portal_id: normalizeWeeklyBillNullableId(advancePortalId),
    staff_advance_portal_id: null,
    claim_payment_id: null,
    cheque_number: pickAdvanceModalPaymentField(modalPaymentData, 'chequeNo'),
    cheque_date: chequeDate,
    transaction_number: pickAdvanceModalPaymentField(modalPaymentData, 'transactionNumber'),
    account_number: pickAdvanceModalPaymentField(modalPaymentData, 'accountNumber'),
    branch_id: normalizeWeeklyBillNullableId(
      branchId ?? advancePayload.branch_id ?? advancePayload.branchId
    ),
    entered_by: enteredBy || null,
  };
};

export const saveWeeklyPaymentBill = async (payload, { branchId = null } = {}) => {
  let url = `${TOOLS_API_BASE}/api/weekly-payment-bills/save`;
  if (branchId != null && branchId !== '') {
    const saveUrl = new URL(url);
    saveUrl.searchParams.set('branchId', String(branchId));
    url = saveUrl.toString();
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Weekly payment bill save failed: ${errText}`);
  }
  return response.json();
};

export const updateWeeklyPaymentBillById = async (billId, payload) => {
  const response = await fetch(`${TOOLS_API_BASE}/api/weekly-payment-bills/update/${billId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Weekly payment bill update failed: ${errText}`);
  }
  return response.json();
};

export const syncWeeklyPaymentBillsForAdvancePortal = async (
  advancePortalId,
  advancePayload,
  { editedBy = '', branchId = null, modalPaymentData = null } = {}
) => {
  if (!advancePortalId) return;

  const matchingBills = await fetchWeeklyPaymentBillsByAdvancePortalId(advancePortalId);
  const shouldSync = shouldSyncAdvanceToWeeklyBill(advancePayload);

  if (!shouldSync) {
    if (matchingBills.length > 0) {
      await deleteRelatedWeeklyPaymentBillsForAdvancePortal(advancePortalId);
    }
    return;
  }

  if (matchingBills.length > 0) {
    for (const bill of matchingBills) {
      if (bill?.id == null) continue;
      const payload = buildAdvancePortalWeeklyBillUpdatePayload(advancePayload, bill, {
        editedBy,
        advancePortalId,
      });
      await updateWeeklyPaymentBillById(bill.id, payload);
    }
    return;
  }

  const resolvedBranchId = branchId ?? advancePayload.branch_id ?? advancePayload.branchId;
  const savePayload = buildAdvancePortalWeeklyBillSavePayload(advancePayload, advancePortalId, {
    modalPaymentData,
    branchId: resolvedBranchId,
    enteredBy: editedBy,
  });

  const advanceEditUrl = `${TOOLS_API_BASE}/api/advance_portal/edit/${advancePortalId}?editedBy=${encodeURIComponent(editedBy || '')}`;
  if (isPaymentModeRequiringBankRegisterLog(advancePayload.payment_mode)) {
    await postBankRegisterLogSave(
      bankRegisterLogSaveUrlMatchingRequest(advanceEditUrl),
      'Advance Portal',
      {
        bill_payment_mode: advancePayload.payment_mode,
        amount: resolveAdvanceWeeklyBillAmount(advancePayload),
        entered_by: editedBy,
      }
    );
  }

  await saveWeeklyPaymentBill(savePayload, { branchId: resolvedBranchId });
};

export const deleteRelatedWeeklyPaymentBillsForAdvancePortal = async (advancePortalId) => {
  const matchingBills = await fetchWeeklyPaymentBillsByAdvancePortalId(advancePortalId);
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
