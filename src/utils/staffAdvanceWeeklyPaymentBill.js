import {
  postBankRegisterLogSave,
  bankRegisterLogSaveUrlMatchingRequest,
  isPaymentModeRequiringBankRegisterLog,
  isChequePaymentMode,
} from './bankRegisterLogBeforeWeeklyBill';
import {
  updateWeeklyPaymentBillById,
  saveWeeklyPaymentBill,
  buildEditPaymentModalDataFromWeeklyBill,
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

const pickStaffModalPaymentField = (modalPaymentData, key) => {
  const val = modalPaymentData?.[key];
  if (val != null && String(val).trim() !== '') return val;
  return null;
};

const pickStaffWeeklyBillModalOrExisting = (modalPaymentData, bill, modalKey, snakeKey, camelKey) => {
  const fromModal = pickStaffModalPaymentField(modalPaymentData, modalKey);
  if (fromModal != null) return fromModal;
  return pickExistingBillField(bill, snakeKey, camelKey, null);
};

export const getStaffAdvanceRecordId = (record) =>
  record?.staffAdvancePortalId ?? record?.staff_advance_portal_id ?? record?.id;

/** GPay, PhonePe, Net Banking, Cheque */
export const isStaffAdvanceOnlinePaymentModeForModal = (paymentMode) =>
  isPaymentModeRequiringBankRegisterLog(paymentMode);

export const isStaffAdvanceChequePaymentMode = (paymentMode) => isChequePaymentMode(paymentMode);

export const shouldPromptStaffEditPaymentModal = (payload) => {
  if (payload?.type === 'Transfer') return false;
  return isStaffAdvanceOnlinePaymentModeForModal(payload?.staff_payment_mode);
};

export const getStaffAdvanceDisplayAmount = (payload) => {
  if (payload?.type === 'Refund') return payload.staff_refund_amount ?? '';
  return payload.amount ?? '';
};

export const fetchWeeklyPaymentBillsByStaffAdvancePortalId = async (staffAdvancePortalId) => {
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
    const billStaffId = bill.staff_advance_portal_id ?? bill.staffAdvancePortalId;
    return billStaffId != null && String(billStaffId) === String(staffAdvancePortalId);
  });
};

export const fetchStaffEditPaymentModalData = async (staffAdvancePortalId, accountDetails = []) => {
  let existingBill = null;
  try {
    const bills = await fetchWeeklyPaymentBillsByStaffAdvancePortalId(staffAdvancePortalId);
    existingBill = Array.isArray(bills) && bills.length > 0 ? bills[0] : null;
  } catch (e) {
    console.warn('Could not fetch existing weekly bill to prefill payment details', e);
  }
  return buildEditPaymentModalDataFromWeeklyBill(existingBill, accountDetails);
};

const resolveStaffWeeklyBillAmount = (staffPayload) => {
  if (staffPayload?.type === 'Refund') {
    return parseFloat(staffPayload.staff_refund_amount) || 0;
  }
  return parseFloat(staffPayload.amount) || 0;
};

const shouldSyncStaffAdvanceToWeeklyBill = (staffPayload) => {
  if (staffPayload?.type === 'Transfer') return false;
  const mode = String(staffPayload?.staff_payment_mode || '').trim();
  if (!mode) return false;
  return isStaffAdvanceOnlinePaymentModeForModal(mode);
};

const shouldDeleteStaffWeeklyBillsOnEdit = (staffPayload) =>
  staffPayload?.type === 'Transfer' || !shouldSyncStaffAdvanceToWeeklyBill(staffPayload);

const buildStaffWeeklyBillModalDataFromExistingBill = (bill) => ({
  chequeNo: bill?.cheque_number ?? bill?.chequeNumber ?? '',
  chequeDate: bill?.cheque_date ?? bill?.chequeDate ?? '',
  transactionNumber: bill?.transaction_number ?? bill?.transactionNumber ?? '',
  accountNumber: bill?.account_number ?? bill?.accountNumber ?? '',
});

export const buildStaffEditPayloadFromForm = ({ editFormData }) => ({
  type: editFormData.type || '',
  date: editFormData.date || '',
  employee_id: editFormData.employee_id || '',
  labour_id: editFormData.labour_id || '',
  from_purpose_id: editFormData.from_purpose_id || null,
  to_purpose_id: editFormData.to_purpose_id || null,
  staff_payment_mode: editFormData.staff_payment_mode || '',
  amount: editFormData.type === 'Refund' ? 0 : Number(editFormData.amount || 0),
  staff_refund_amount:
    editFormData.type === 'Refund' ? Number(editFormData.staff_refund_amount || 0) : 0,
  entry_no: editFormData.entryNo ?? null,
  description: editFormData.description || '',
  file_url: editFormData.file_url || '',
});

export const buildStaffAdvanceWeeklyBillUpdatePayload = (
  staffPayload,
  existingBill,
  { editedBy = '', staffAdvancePortalId, modalPaymentData = null } = {}
) => {
  const bill = existingBill || {};
  const chequeDateRaw = pickStaffWeeklyBillModalOrExisting(
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

  const resolvedStaffAdvancePortalId =
    normalizeWeeklyBillNullableId(staffAdvancePortalId) ??
    normalizeWeeklyBillNullableId(bill.staff_advance_portal_id ?? bill.staffAdvancePortalId);

  return {
    date:
      normalizeWeeklyBillApiDate(staffPayload.date) ?? normalizeWeeklyBillApiDate(bill.date),
    created_at: pickExistingBillField(bill, 'created_at', 'createdAt', new Date().toISOString()),
    contractor_id: normalizeWeeklyBillNullableId(bill.contractor_id ?? bill.contractorId),
    vendor_id: normalizeWeeklyBillNullableId(bill.vendor_id ?? bill.vendorId),
    employee_id:
      normalizeWeeklyBillNullableId(staffPayload.employee_id) ??
      normalizeWeeklyBillNullableId(bill.employee_id ?? bill.employeeId),
    labour_id:
      normalizeWeeklyBillNullableId(staffPayload.labour_id) ??
      normalizeWeeklyBillNullableId(bill.labour_id ?? bill.labourId),
    project_id: normalizeWeeklyBillNullableId(bill.project_id ?? bill.projectId),
    type: 'Staff Advance',
    amount: resolveStaffWeeklyBillAmount(staffPayload),
    status: bill.status !== false,
    weekly_number: bill.weekly_number ?? bill.weeklyNumber ?? null,
    weekly_payment_expense_id: normalizeWeeklyBillNullableId(
      bill.weekly_payment_expense_id ?? bill.weeklyPaymentExpenseId
    ),
    bill_payment_mode:
      staffPayload.staff_payment_mode ||
      bill.bill_payment_mode ||
      bill.billPaymentMode ||
      null,
    advance_portal_id: normalizeWeeklyBillNullableId(bill.advance_portal_id ?? bill.advancePortalId),
    staff_advance_portal_id: resolvedStaffAdvancePortalId,
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
    purpose_id: normalizeWeeklyBillNullableId(
      staffPayload.from_purpose_id ?? bill.purpose_id ?? bill.purposeId
    ),
    cheque_number: pickStaffWeeklyBillModalOrExisting(
      modalPaymentData,
      bill,
      'chequeNo',
      'cheque_number',
      'chequeNumber'
    ),
    cheque_date: chequeDate,
    transaction_number: pickStaffWeeklyBillModalOrExisting(
      modalPaymentData,
      bill,
      'transactionNumber',
      'transaction_number',
      'transactionNumber'
    ),
    account_number: pickStaffWeeklyBillModalOrExisting(
      modalPaymentData,
      bill,
      'accountNumber',
      'account_number',
      'accountNumber'
    ),
    vendor_payment_tracker_id:
      bill.vendor_payment_tracker_id ?? bill.vendorPaymentTrackerId ?? null,
    branch_id: normalizeWeeklyBillNullableId(
      staffPayload.branch_id ?? bill.branch_id ?? bill.branchId
    ),
    payment_status: bill.payment_status ?? bill.paymentStatus ?? null,
    received_from: bill.received_from ?? bill.receivedFrom ?? null,
    description: bill.description ?? null,
    discount_amount: parseFloat(bill.discount_amount ?? bill.discountAmount) || 0,
    edited_by: editedBy || bill.edited_by || bill.editedBy || null,
    entered_by: (bill.entered_by ?? bill.enteredBy) ?? (editedBy || null),
    source: bill.source ?? 'Staff Advance',
  };
};

export const buildStaffAdvanceWeeklyBillSavePayload = (
  staffPayload,
  staffAdvancePortalId,
  { modalPaymentData = null, branchId = null, enteredBy = '' } = {}
) => {
  const chequeDateRaw = pickStaffModalPaymentField(modalPaymentData, 'chequeDate');
  const chequeDate =
    chequeDateRaw != null
      ? normalizeWeeklyBillApiDate(chequeDateRaw) || String(chequeDateRaw).trim()
      : null;

  return {
    date: normalizeWeeklyBillApiDate(staffPayload.date),
    created_at: new Date().toISOString(),
    contractor_id: null,
    vendor_id: null,
    employee_id: normalizeWeeklyBillNullableId(staffPayload.employee_id),
    labour_id: normalizeWeeklyBillNullableId(staffPayload.labour_id),
    project_id: null,
    type: 'Staff Advance',
    bill_payment_mode: staffPayload.staff_payment_mode || null,
    amount: resolveStaffWeeklyBillAmount(staffPayload),
    status: true,
    weekly_number: '',
    weekly_payment_expense_id: null,
    advance_portal_id: null,
    staff_advance_portal_id: normalizeWeeklyBillNullableId(staffAdvancePortalId),
    claim_payment_id: null,
    purpose_id: normalizeWeeklyBillNullableId(staffPayload.from_purpose_id),
    cheque_number: pickStaffModalPaymentField(modalPaymentData, 'chequeNo'),
    cheque_date: chequeDate,
    transaction_number: pickStaffModalPaymentField(modalPaymentData, 'transactionNumber'),
    account_number: pickStaffModalPaymentField(modalPaymentData, 'accountNumber'),
    branch_id: normalizeWeeklyBillNullableId(branchId ?? staffPayload.branch_id),
    entered_by: enteredBy || null,
    source: 'Staff Advance',
  };
};

export const deleteRelatedWeeklyPaymentBillsForStaffAdvancePortal = async (staffAdvancePortalId) => {
  const matchingBills = await fetchWeeklyPaymentBillsByStaffAdvancePortalId(staffAdvancePortalId);
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

export const syncWeeklyPaymentBillsForStaffAdvancePortal = async (
  staffAdvancePortalId,
  staffPayload,
  { editedBy = '', branchId = null, modalPaymentData = null } = {}
) => {
  if (!staffAdvancePortalId) return;

  const matchingBills = await fetchWeeklyPaymentBillsByStaffAdvancePortalId(staffAdvancePortalId);
  const isOnlineMode = shouldSyncStaffAdvanceToWeeklyBill(staffPayload);

  if (shouldDeleteStaffWeeklyBillsOnEdit(staffPayload)) {
    if (matchingBills.length > 0) {
      await deleteRelatedWeeklyPaymentBillsForStaffAdvancePortal(staffAdvancePortalId);
    }
    return;
  }

  if (!isOnlineMode) {
    if (matchingBills.length > 0) {
      await deleteRelatedWeeklyPaymentBillsForStaffAdvancePortal(staffAdvancePortalId);
    }
    return;
  }

  const resolvedModalPaymentData =
    modalPaymentData?.accountNumber
      ? modalPaymentData
      : matchingBills.length > 0
        ? buildStaffWeeklyBillModalDataFromExistingBill(matchingBills[0])
        : null;

  if (!resolvedModalPaymentData?.accountNumber) {
    return;
  }

  if (matchingBills.length > 0) {
    for (const bill of matchingBills) {
      if (bill?.id == null) continue;
      const payload = buildStaffAdvanceWeeklyBillUpdatePayload(staffPayload, bill, {
        editedBy,
        staffAdvancePortalId,
        modalPaymentData: resolvedModalPaymentData,
      });
      await updateWeeklyPaymentBillById(bill.id, payload);
    }
    return;
  }

  const resolvedBranchId = branchId ?? staffPayload.branch_id ?? staffPayload.branchId;
  const savePayload = buildStaffAdvanceWeeklyBillSavePayload(staffPayload, staffAdvancePortalId, {
    modalPaymentData: resolvedModalPaymentData,
    branchId: resolvedBranchId,
    enteredBy: editedBy,
  });

  const staffEditUrl = `${TOOLS_API_BASE}/api/staff-advance/${staffAdvancePortalId}?editedBy=${encodeURIComponent(editedBy || '')}`;
  if (isPaymentModeRequiringBankRegisterLog(staffPayload.staff_payment_mode)) {
    await postBankRegisterLogSave(
      bankRegisterLogSaveUrlMatchingRequest(staffEditUrl),
      'Staff Advance',
      {
        bill_payment_mode: staffPayload.staff_payment_mode,
        amount: resolveStaffWeeklyBillAmount(staffPayload),
        entered_by: editedBy,
      }
    );
  }

  await saveWeeklyPaymentBill(savePayload, { branchId: resolvedBranchId });
};

export const buildStaffAdvanceClearedPayload = (record, staffAdvancePortalId) => ({
  staffAdvancePortalId:
    staffAdvancePortalId ?? getStaffAdvanceRecordId(record),
  type: '',
  date: record.date,
  amount: 0,
  staff_refund_amount: 0,
  staff_payment_mode: '',
  from_purpose_id: 0,
  to_purpose_id: 0,
  employee_id: 0,
  labour_id: 0,
  entry_no: record.entry_no ?? record.entryNo ?? 0,
  description: '',
  file_url: record.file_url ?? record.fileUrl ?? '',
  branch_id: record.branch_id ?? record.branchId ?? null,
});

export const clearStaffAdvanceRecordsOnDelete = async (
  idToDelete,
  record,
  allStaffData,
  editedBy
) => {
  if (!record) {
    throw new Error('Staff advance record not found for delete');
  }

  const entryNo = record.entry_no ?? record.entryNo;
  const clearedRecords = [];

  const clearRecord = async (staffRec) => {
    const staffId = getStaffAdvanceRecordId(staffRec);
    const clearedData = buildStaffAdvanceClearedPayload(staffRec, staffId);
    const res = await fetch(
      `${TOOLS_API_BASE}/api/staff-advance/${staffId}?editedBy=${encodeURIComponent(editedBy || '')}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(clearedData),
      }
    );
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(errText || `Failed to clear staff advance record ${staffId}`);
    }
    clearedRecords.push(staffRec);
  };

  if (record.type === 'Transfer') {
    const transferRecords = (allStaffData || []).filter(
      (row) => String(row.entry_no ?? row.entryNo) === String(entryNo)
    );
    if (transferRecords.length !== 2) {
      console.warn(
        `Expected 2 Transfer records with entry_no ${entryNo}, but found ${transferRecords.length}`
      );
    }
    if (transferRecords.length > 0) {
      await Promise.all(transferRecords.map(clearRecord));
    } else {
      await clearRecord(record);
    }
  } else {
    await clearRecord(record);
  }

  let deletedCount = 0;
  let failedCount = 0;
  const processedStaffIds = new Set();
  for (const staffRec of clearedRecords) {
    const staffId = getStaffAdvanceRecordId(staffRec);
    if (!staffId || processedStaffIds.has(String(staffId))) continue;
    processedStaffIds.add(String(staffId));
    try {
      const result = await deleteRelatedWeeklyPaymentBillsForStaffAdvancePortal(staffId);
      deletedCount += result.deletedCount;
      failedCount += result.failedCount;
    } catch (billDeleteErr) {
      console.error('Failed to delete related weekly payment bills:', billDeleteErr);
      failedCount += 1;
    }
  }

  return {
    clearedRecords,
    weeklyBillDelete: { deletedCount, failedCount },
  };
};
