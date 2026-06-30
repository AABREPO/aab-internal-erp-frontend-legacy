import {
  postBankRegisterLogSave,
  bankRegisterLogSaveUrlMatchingRequest,
  isPaymentModeRequiringBankRegisterLog,
  isChequePaymentMode,
} from './bankRegisterLogBeforeWeeklyBill';
import {
  updateWeeklyPaymentBillById,
  saveWeeklyPaymentBill,
  resolveLoanAdvancePortalId,
  syncAdvancePortalFromLoanEdit,
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

export const shouldPromptLoanEditPaymentModal = (payload) => {
  if (payload?.type === 'Transfer') return false;
  return isLoanOnlinePaymentModeForModal(payload?.loan_payment_mode);
};

export const fetchLoanEditPaymentModalData = async (loanPortalId, accountDetails = []) => {
  let existingBill = null;
  try {
    const bills = await fetchWeeklyPaymentBillsByLoanPortalId(loanPortalId);
    existingBill = Array.isArray(bills) && bills.length > 0 ? bills[0] : null;
  } catch (e) {
    console.warn('Could not fetch existing weekly bill to prefill payment details', e);
  }
  return buildEditPaymentModalDataFromWeeklyBill(existingBill, accountDetails);
};

export const isLoanChequePaymentMode = (paymentMode) => isChequePaymentMode(paymentMode);

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

/** Weekly bills: sync for Loan/Refund with online mode; delete only for Transfer (or non-online). */
const shouldSyncLoanToWeeklyBill = (loanPayload) => {
  if (loanPayload?.type === 'Transfer') return false;
  const mode = String(loanPayload?.loan_payment_mode || '').trim();
  if (!mode) return false;
  return isLoanOnlinePaymentModeForModal(mode);
};

const shouldDeleteLoanWeeklyBillsOnEdit = (loanPayload) => loanPayload?.type === 'Transfer';

const buildLoanWeeklyBillModalDataFromExistingBill = (bill) => ({
  chequeNo: bill?.cheque_number ?? bill?.chequeNumber ?? '',
  chequeDate: bill?.cheque_date ?? bill?.chequeDate ?? '',
  transactionNumber: bill?.transaction_number ?? bill?.transactionNumber ?? '',
  accountNumber: bill?.account_number ?? bill?.accountNumber ?? '',
});

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
    type: loanPayload.type || bill.type || 'Loan',
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
    type: loanPayload.type || 'Loan',
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

  if (shouldDeleteLoanWeeklyBillsOnEdit(loanPayload)) {
    if (matchingBills.length > 0) {
      await deleteRelatedWeeklyPaymentBillsForLoanPortal(loanPortalId);
    }
    return;
  }

  if (!isOnlineMode) {
    if (matchingBills.length > 0) {
      await deleteRelatedWeeklyPaymentBillsForLoanPortal(loanPortalId);
    }
    return;
  }

  const resolvedModalPaymentData =
    modalPaymentData?.accountNumber
      ? modalPaymentData
      : matchingBills.length > 0
        ? buildLoanWeeklyBillModalDataFromExistingBill(matchingBills[0])
        : null;

  if (!resolvedModalPaymentData?.accountNumber) {
    return;
  }

  if (matchingBills.length > 0) {
    for (const bill of matchingBills) {
      if (bill?.id == null) continue;
      const payload = buildLoanPortalWeeklyBillUpdatePayload(loanPayload, bill, {
        editedBy,
        loanPortalId,
        modalPaymentData: resolvedModalPaymentData,
        purposeId,
      });
      await updateWeeklyPaymentBillById(bill.id, payload);
    }
    return;
  }

  const resolvedBranchId = branchId ?? loanPayload.branch_id ?? loanPayload.branchId;
  const savePayload = buildLoanPortalWeeklyBillSavePayload(loanPayload, loanPortalId, {
    modalPaymentData: resolvedModalPaymentData,
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

export const buildLoanEditPayloadFromForm = ({
  editingId,
  editSelectedType,
  editFormData,
  editTransferSelection,
  editSelectedOption,
  editPurpose,
  editTransferAmount,
  editPaymentMode,
  editDescription,
  currentEntry,
}) => {
  const isRefund = editSelectedType === 'Refund';
  const isTransfer = editSelectedType === 'Transfer';
  const transferType = editTransferSelection?.type;
  const isTransferToSite =
    isTransfer &&
    transferType === 'Site' &&
    (editSelectedOption?.type === 'Vendor' || editSelectedOption?.type === 'Contractor');
  const transferAmount = parseFloat(editTransferAmount || editFormData.loan_amount || 0) || 0;

  return {
    loanPortalId: editingId,
    type: editSelectedType,
    date: editFormData.date,
    amount: isRefund
      ? 0
      : isTransfer
        ? isTransferToSite
          ? -Math.abs(transferAmount)
          : transferAmount
        : parseFloat(editFormData.loan_amount || 0) || 0,
    loan_refund_amount: isRefund ? parseFloat(editFormData.loan_refund_amount || 0) : 0,
    loan_payment_mode: isTransfer ? '' : (editPaymentMode || ''),
    from_purpose_id: editPurpose || 0,
    to_purpose_id: isTransfer && transferType === 'Purpose' ? (editTransferSelection?.id || 0) : 0,
    vendor_id:
      editSelectedOption?.type === 'Vendor'
        ? editSelectedOption.id
        : (currentEntry?.vendor_id || 0),
    contractor_id:
      editSelectedOption?.type === 'Contractor'
        ? editSelectedOption.id
        : (currentEntry?.contractor_id || 0),
    employee_id:
      editSelectedOption?.type === 'Employee'
        ? editSelectedOption.id
        : (currentEntry?.employee_id || 0),
    labour_id:
      editSelectedOption?.type === 'Labour'
        ? editSelectedOption.id
        : (currentEntry?.labour_id || 0),
    project_id: editFormData.project_id || currentEntry?.project_id || 0,
    transfer_Project_id: isTransfer && transferType === 'Site' ? (editTransferSelection?.id || 0) : 0,
    entry_no: editFormData.entry_no || currentEntry?.entry_no || 0,
    description: editDescription || '',
    file_url: currentEntry?.file_url ?? currentEntry?.fileUrl ?? '',
    advance_portal_id: currentEntry?.advance_portal_id ?? currentEntry?.advancePortalId ?? null,
    branch_id: currentEntry?.branch_id ?? currentEntry?.branchId ?? null,
  };
};

export const buildLoanClearedPayload = (record, loanPortalId) => ({
  loanPortalId: loanPortalId ?? record.loanPortalId ?? record.id,
  type: '',
  date: record.date,
  amount: 0,
  loan_refund_amount: 0,
  loan_payment_mode: '',
  from_purpose_id: 0,
  to_purpose_id: 0,
  vendor_id: 0,
  contractor_id: 0,
  project_id: 0,
  transfer_Project_id: 0,
  entry_no: record.entry_no ?? 0,
  description: '',
});

export const clearLoanPortalRecordsOnDelete = async (idToDelete, record, allLoanData, editedBy) => {
  if (!record) {
    throw new Error('Loan record not found for delete');
  }

  const entryNo = record.entry_no;
  const clearedRecords = [];

  const clearRecord = async (loanRec) => {
    const loanId = loanRec.loanPortalId ?? loanRec.id;
    const clearedData = buildLoanClearedPayload(loanRec, loanId);
    const res = await fetch(
      `${TOOLS_API_BASE}/api/loans/${loanId}?editedBy=${encodeURIComponent(editedBy || '')}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(clearedData),
      }
    );
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(errText || `Failed to clear loan record ${loanId}`);
    }
    clearedRecords.push(loanRec);
  };

  if (record.type === 'Transfer') {
    const transferRecords = (allLoanData || []).filter((row) => row.entry_no === entryNo);
    if (transferRecords.length !== 2) {
      console.warn(`Expected 2 Transfer records with entry_no ${entryNo}, but found ${transferRecords.length}`);
    }
    await Promise.all(transferRecords.map(clearRecord));
  } else {
    await clearRecord(record);
  }

  let deletedCount = 0;
  let failedCount = 0;
  const processedLoanIds = new Set();
  for (const loanRec of clearedRecords) {
    const loanId = loanRec.loanPortalId ?? loanRec.id;
    if (!loanId || processedLoanIds.has(String(loanId))) continue;
    processedLoanIds.add(String(loanId));
    const result = await deleteRelatedWeeklyPaymentBillsForLoanPortal(loanId);
    deletedCount += result.deletedCount;
    failedCount += result.failedCount;
  }

  return {
    clearedRecords,
    weeklyBillDelete: { deletedCount, failedCount },
  };
};

export const performLoanPortalEditWithSync = async ({
  editingId,
  payload,
  editedBy,
  currentEntry,
  siteOptions = [],
  selectedOption = null,
  modalPaymentData = null,
}) => {
  const res = await fetch(
    `${TOOLS_API_BASE}/api/loans/${editingId}?editedBy=${encodeURIComponent(editedBy || '')}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || 'Failed to update loan record');
  }

  try {
    await syncWeeklyPaymentBillsForLoanPortal(editingId, payload, {
      editedBy,
      branchId: payload.branch_id,
      modalPaymentData,
      purposeId: payload.from_purpose_id,
    });
  } catch (weeklyErr) {
    console.error('Weekly payment bill sync failed after loan edit:', weeklyErr);
  }

  let advanceSyncFailed = false;
  const advancePortalId = resolveLoanAdvancePortalId(currentEntry);
  if (advancePortalId) {
    try {
      await syncAdvancePortalFromLoanEdit(advancePortalId, payload, {
        editedBy,
        siteOptions,
        selectedOption,
        branchId: payload.branch_id,
      });
    } catch (advanceErr) {
      console.error('Failed to sync linked advance portal entry:', advanceErr);
      advanceSyncFailed = true;
    }
  }

  return { advanceSyncFailed };
};
