import {
  postBankRegisterLogSave,
  bankRegisterLogSaveUrlMatchingRequest,
  isPaymentModeRequiringBankRegisterLog,
} from './bankRegisterLogBeforeWeeklyBill';
import { fetchWeeklyPaymentBillsByExpensesEntryId } from './expensesEntryWeeklyPaymentBill';

const TOOLS_API_BASE = 'https://backendaab.in/demoAabuildersDash';

/** Parse /api/files/upload JSON — supports urls[], url, and legacy shapes (same as AdvancePortal.js). */
export const resolveFilesUploadResponseUrl = (uploadResult) => {
  if (uploadResult == null) return '';
  if (typeof uploadResult === 'string') return uploadResult.trim();
  if (typeof uploadResult !== 'object') return '';
  const fromUrls = Array.isArray(uploadResult.urls) ? uploadResult.urls[0] : null;
  return (
    fromUrls ??
    uploadResult.url ??
    uploadResult.data?.url ??
    uploadResult.fileUrl ??
    uploadResult.downloadUrl ??
    ''
  );
};

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

/** GPay, PhonePe, Net Banking, Cheque — not Cash or Direct */
export const isAdvanceOnlinePaymentModeForModal = (paymentMode) =>
  isPaymentModeRequiringBankRegisterLog(paymentMode);

/** Weekly-payment-bills are only for online modes (not Cash/Direct/Transfer). */
const shouldSyncAdvanceToWeeklyBill = (advancePayload) => {
  if (advancePayload?.type === 'Transfer') return false;
  const mode = String(advancePayload?.payment_mode || '').trim();
  if (!mode || mode.toLowerCase() === 'direct') return false;
  return isAdvanceOnlinePaymentModeForModal(advancePayload.payment_mode);
};

/** Payment-details modal only when online mode and no weekly bill linked yet */
export const needsAdvancePortalPaymentModalForWeeklyBill = async (advancePortalId, advancePayload) => {
  if (!advancePortalId || !shouldSyncAdvanceToWeeklyBill(advancePayload)) return false;
  const matchingBills = await fetchWeeklyPaymentBillsByAdvancePortalId(advancePortalId);
  return matchingBills.length === 0;
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

const pickAdvanceWeeklyBillModalOrExisting = (modalPaymentData, bill, modalKey, snakeKey, camelKey) => {
  const fromModal = pickAdvanceModalPaymentField(modalPaymentData, modalKey);
  if (fromModal != null) return fromModal;
  return pickExistingBillField(bill, snakeKey, camelKey, null);
};

export const buildAdvancePortalWeeklyBillUpdatePayload = (
  advancePayload,
  existingBill,
  { editedBy = '', advancePortalId, modalPaymentData = null, expensesEntryId = null } = {}
) => {
  const bill = existingBill || {};
  const chequeDateRaw = pickAdvanceWeeklyBillModalOrExisting(
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
    expenses_entry_id:
      normalizeWeeklyBillNullableId(expensesEntryId) ??
      normalizeWeeklyBillNullableId(bill.expenses_entry_id ?? bill.expensesEntryId),
    claim_payment_id: normalizeWeeklyBillNullableId(
      bill.claim_payment_id ?? bill.claimPaymentId
    ),
    purpose_id: normalizeWeeklyBillNullableId(bill.purpose_id ?? bill.purposeId),
    cheque_number: pickAdvanceWeeklyBillModalOrExisting(
      modalPaymentData,
      bill,
      'chequeNo',
      'cheque_number',
      'chequeNumber'
    ),
    cheque_date: chequeDate,
    transaction_number: pickAdvanceWeeklyBillModalOrExisting(
      modalPaymentData,
      bill,
      'transactionNumber',
      'transaction_number',
      'transactionNumber'
    ),
    account_number: pickAdvanceWeeklyBillModalOrExisting(
      modalPaymentData,
      bill,
      'accountNumber',
      'account_number',
      'accountNumber'
    ),
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
  const result = await response.json();
  try {
    const { notifyWeeklyPaymentBillsChanged } = await import('./orbitProjectDataSync');
    notifyWeeklyPaymentBillsChanged();
  } catch {
    window.dispatchEvent(new Event('bankRegisterDataSync'));
  }
  return result;
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
  const result = await response.json();
  try {
    const { notifyWeeklyPaymentBillsChanged } = await import('./orbitProjectDataSync');
    notifyWeeklyPaymentBillsChanged();
  } catch {
    window.dispatchEvent(new Event('bankRegisterDataSync'));
  }
  return result;
};

const updateAdvancePortalWeeklyBills = async (
  bills,
  advancePayload,
  { editedBy = '', advancePortalId, modalPaymentData = null, expensesEntryId = null } = {}
) => {
  for (const bill of bills) {
    if (bill?.id == null) continue;
    const payload = buildAdvancePortalWeeklyBillUpdatePayload(advancePayload, bill, {
      editedBy,
      advancePortalId,
      modalPaymentData,
      expensesEntryId,
    });
    await updateWeeklyPaymentBillById(bill.id, payload);
  }
};

export const syncWeeklyPaymentBillsForAdvancePortal = async (
  advancePortalId,
  advancePayload,
  { editedBy = '', branchId = null, modalPaymentData = null, expensesEntryId = null } = {}
) => {
  if (!advancePortalId) return;

  const matchingBills = await fetchWeeklyPaymentBillsByAdvancePortalId(advancePortalId);
  const isOnlineMode = shouldSyncAdvanceToWeeklyBill(advancePayload);

  if (!isOnlineMode) {
    if (matchingBills.length > 0) {
      await deleteRelatedWeeklyPaymentBillsForAdvancePortal(advancePortalId);
    }
    if (expensesEntryId) {
      const expenseBills = await fetchWeeklyPaymentBillsByExpensesEntryId(expensesEntryId);
      const advanceBillIds = new Set(matchingBills.map((b) => b.id));
      for (const bill of expenseBills) {
        if (bill?.id == null || advanceBillIds.has(bill.id)) continue;
        await fetch(
          `${TOOLS_API_BASE}/api/weekly-payment-bills/delete/${bill.id}`,
          {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }
    return;
  }

  // IMPORTANT: Never touch weekly-payment-bills unless user provided payment details (account number)
  // via the Payment Details modal.
  if (!modalPaymentData?.accountNumber) {
    return;
  }

  let updatedAnyBill = false;

  if (matchingBills.length > 0) {
    await updateAdvancePortalWeeklyBills(matchingBills, advancePayload, {
      editedBy,
      advancePortalId,
      modalPaymentData,
      expensesEntryId,
    });
    updatedAnyBill = true;
  }

  if (expensesEntryId) {
    const expenseBills = await fetchWeeklyPaymentBillsByExpensesEntryId(expensesEntryId);
    const updatedBillIds = new Set(matchingBills.map((b) => b.id));
    const expenseOnlyBills = expenseBills.filter(
      (bill) => bill?.id != null && !updatedBillIds.has(bill.id)
    );
    if (expenseOnlyBills.length > 0) {
      await updateAdvancePortalWeeklyBills(expenseOnlyBills, advancePayload, {
        editedBy,
        advancePortalId,
        modalPaymentData,
        expensesEntryId,
      });
      updatedAnyBill = true;
    }
  }

  if (updatedAnyBill) {
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

const EXPENSES_API_BASE = 'https://backendaab.in/demoAabuilderDash';

export const resolveAdvancePortalExpensesEntryId = (record) => {
  const id = record?.expenses_entry_id ?? record?.expensesEntryId;
  if (id == null || id === '' || id === 0) return null;
  return id;
};

const pickPositiveNumericId = (value) => {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** Parse expenses_form/save response — DB primary key `id` only (never `eno`). */
export const parseExpensesFormSaveResponseId = (responseText) => {
  const trimmed = String(responseText ?? '').trim();
  if (!trimmed) return null;
  if (/^\d+$/.test(trimmed)) {
    return pickPositiveNumericId(trimmed);
  }
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return null;
  }
  try {
    const parsed = JSON.parse(trimmed);
    const fromObject = (obj) => {
      if (obj == null) return null;
      if (typeof obj === 'number') return pickPositiveNumericId(obj);
      if (typeof obj !== 'object') return null;
      return pickPositiveNumericId(
        obj.id ??
          obj.Id ??
          obj.expensesEntryId ??
          obj.expenses_entry_id ??
          obj.expenseId ??
          obj.expense_id
      );
    };
    if (Array.isArray(parsed) && parsed.length > 0) {
      return fromObject(parsed[0]);
    }
    return (
      fromObject(parsed) ??
      fromObject(parsed?.data) ??
      fromObject(parsed?.result) ??
      fromObject(parsed?.expense) ??
      fromObject(parsed?.expensesForm) ??
      null
    );
  } catch {
    return null;
  }
};

/** Id from expenses_form/save response body only — does not call get_form. */
export const resolveExpensesEntryIdAfterSave = (responseText) =>
  parseExpensesFormSaveResponseId(responseText);

export const buildAdvancePortalExpensesEntryLinkFields = (expensesEntryId) => {
  const id = pickPositiveNumericId(expensesEntryId);
  if (id == null) return {};
  return {
    expenses_entry_id: id,
    expensesEntryId: id,
  };
};

export const resolveAdvancePortalIdFromSaveResponse = (responseBody) => {
  if (responseBody == null) return null;
  if (typeof responseBody === 'number') return pickPositiveNumericId(responseBody);
  const trimmed = String(responseBody).trim();
  if (/^\d+$/.test(trimmed)) return pickPositiveNumericId(trimmed);
  if (typeof responseBody !== 'object') return null;
  return pickPositiveNumericId(
    responseBody.id ??
      responseBody.advancePortalId ??
      responseBody.advance_portal_id ??
      responseBody.data?.id ??
      responseBody.data?.advancePortalId ??
      responseBody.result?.id
  );
};

/** Ensure expenses_entry_id is stored on advance portal after both saves complete. */
export const linkExpensesEntryIdToAdvancePortal = async (
  advancePortalId,
  expensesEntryId,
  { editedBy = '', advancePayload = {}, buildUrl } = {}
) => {
  const resolvedAdvanceId = pickPositiveNumericId(advancePortalId);
  const resolvedExpenseId = pickPositiveNumericId(expensesEntryId);
  if (resolvedAdvanceId == null || resolvedExpenseId == null) {
    return { ok: false, skipped: true };
  }
  const baseUrl = `${TOOLS_API_BASE}/api/advance_portal/edit/${resolvedAdvanceId}?editedBy=${encodeURIComponent(editedBy || '')}`;
  const url = typeof buildUrl === 'function' ? buildUrl(baseUrl) : baseUrl;
  const body = {
    ...(advancePayload && typeof advancePayload === 'object' ? advancePayload : {}),
    ...buildAdvancePortalExpensesEntryLinkFields(resolvedExpenseId),
  };
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to link expenses_entry_id to advance portal: ${errText}`);
  }
  return { ok: true, skipped: false };
};

const fetchExpensesFormEntryById = async (expensesEntryId) => {
  const res = await fetch(`${EXPENSES_API_BASE}/expenses_form/get_form`, {
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch expenses for linked entry update');
  }
  const all = await res.json();
  return (Array.isArray(all) ? all : []).find((e) => String(e.id) === String(expensesEntryId)) || null;
};

export const buildExpenseUpdatePayloadFromAdvanceEdit = (
  advancePayload,
  existingExpense,
  { editedBy = '', siteOptions = [], selectedOption = null, branchId = null } = {}
) => {
  const site = (siteOptions || []).find((s) => String(s.id) === String(advancePayload.project_id));
  let vendor = '';
  let contractor = '';
  let vendorId = normalizeWeeklyBillNullableId(advancePayload.vendor_id);
  let contractorId = normalizeWeeklyBillNullableId(advancePayload.contractor_id);

  if (selectedOption?.type === 'Vendor') {
    vendor = selectedOption.label || '';
    vendorId = selectedOption.id;
    contractor = '';
    contractorId = null;
  } else if (selectedOption?.type === 'Contractor') {
    contractor = selectedOption.label || '';
    contractorId = selectedOption.id;
    vendor = '';
    vendorId = null;
  }

  const resolvedDate =
    normalizeWeeklyBillApiDate(advancePayload.date) ??
    (existingExpense?.date ? String(existingExpense.date).slice(0, 10) : '');

  const expenseAmount =
    advancePayload.type === 'Bill Settlement'
      ? parseFloat(advancePayload.bill_amount) || 0
      : existingExpense?.amount;

  const fileUrl =
    advancePayload.file_url || existingExpense?.billCopy || existingExpense?.billCopyUrl || '';

  let billArrivalForApi = existingExpense?.billArrivalDate ?? existingExpense?.bill_arrival_date ?? '';
  if (billArrivalForApi != null && String(billArrivalForApi).trim() !== '') {
    const normalized = normalizeWeeklyBillApiDate(billArrivalForApi);
    if (normalized) billArrivalForApi = normalized;
  }

  return {
    ...existingExpense,
    accountType: existingExpense?.accountType || 'Bill Payments',
    date: resolvedDate,
    siteName: site?.label || site?.siteName || existingExpense?.siteName || '',
    projectId: advancePayload.project_id ?? existingExpense?.projectId ?? null,
    vendor: vendor || existingExpense?.vendor || '',
    vendorId: vendorId ?? existingExpense?.vendorId ?? null,
    contractor: contractor || existingExpense?.contractor || '',
    contractorId: contractorId ?? existingExpense?.contractorId ?? null,
    quantity: existingExpense?.quantity ?? '',
    amount: expenseAmount,
    category: existingExpense?.category ?? '',
    machineTools: existingExpense?.machineTools ?? '',
    comments: advancePayload.description ?? existingExpense?.comments ?? '',
    billCopy: fileUrl,
    billCopyUrl: fileUrl,
    paymentMode: advancePayload.payment_mode || existingExpense?.paymentMode || '',
    billArrivalDate: billArrivalForApi,
    utilityType: existingExpense?.utilityType ?? '',
    utilityTypeNumber: existingExpense?.utilityTypeNumber ?? '',
    utilityForTheMonth: existingExpense?.utilityForTheMonth ?? '',
    utilityValidityDays: existingExpense?.utilityValidityDays ?? '',
    utilityValidityType: existingExpense?.utilityValidityType ?? '',
    serviceStartingDate: existingExpense?.serviceStartingDate ?? '',
    otherVendorName: existingExpense?.otherVendorName ?? '',
    otherContractorName: existingExpense?.otherContractorName ?? '',
    discount_amount: existingExpense?.discount_amount ?? existingExpense?.discountAmount ?? 0,
    source: existingExpense?.source || 'Advance Portal',
    branchId: branchId ?? advancePayload.branch_id ?? existingExpense?.branchId ?? null,
    editedBy,
  };
};

/** PUT expenses_form/update when advance portal row is linked via expenses_entry_id */
export const syncExpensesEntryFromAdvancePortalEdit = async (
  expensesEntryId,
  advancePayload,
  { editedBy = '', siteOptions = [], selectedOption = null, branchId = null } = {}
) => {
  if (!expensesEntryId) return;

  const existingExpense = await fetchExpensesFormEntryById(expensesEntryId);
  if (!existingExpense) {
    console.warn(`Linked expense entry ${expensesEntryId} not found; skipping expense sync`);
    return;
  }

  const updatePayload = buildExpenseUpdatePayloadFromAdvanceEdit(advancePayload, existingExpense, {
    editedBy,
    siteOptions,
    selectedOption,
    branchId,
  });

  const response = await fetch(`${EXPENSES_API_BASE}/expenses_form/update/${expensesEntryId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(updatePayload),
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to update linked expense entry: ${errText}`);
  }
};

export const getAdvancePortalRecordId = (record) =>
  record?.advancePortalId ?? record?.advance_portal_id;

export const getAdvancePortalEntryNo = (record) => record?.entry_no ?? record?.entryNo;

export const buildAdvancePortalClearedPayload = (record) => ({
  entry_no: getAdvancePortalEntryNo(record),
  date: record.date,
  amount: '',
  project_id: '',
  vendor_id: '',
  contractor_id: '',
  file_url: '',
  description: '',
  bill_amount: '',
  type: '',
  transfer_site_id: '',
  payment_mode: '',
  refund_amount: '',
});

export const fetchAllAdvancePortalRecords = async () => {
  const response = await fetch(`${TOOLS_API_BASE}/api/advance_portal/getAll`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch advance portal data');
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

export const findAdvancePortalRecordsByExpensesEntryId = (advanceData, expensesEntryId) => {
  if (expensesEntryId == null || expensesEntryId === '') return [];
  return (advanceData || []).filter((record) => {
    const linkedId = resolveAdvancePortalExpensesEntryId(record);
    return linkedId != null && String(linkedId) === String(expensesEntryId);
  });
};

/** Clear advance portal row(s) and delete weekly bills — same as Advance Database delete. */
export const clearAdvancePortalRecordsOnDelete = async (
  idToDelete,
  record,
  allAdvanceData,
  editedBy
) => {
  if (!record) {
    throw new Error('Advance portal record not found for delete');
  }
  const clearedData = buildAdvancePortalClearedPayload(record);
  const entryNo = getAdvancePortalEntryNo(record);
  const advancePortalIdsToClear = [];

  const putClear = async (advancePortalId) => {
    const res = await fetch(
      `${TOOLS_API_BASE}/api/advance_portal/edit/${advancePortalId}?editedBy=${encodeURIComponent(editedBy || '')}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(clearedData),
      }
    );
    if (!res.ok) {
      throw new Error(`Failed to clear advance portal record ${advancePortalId}`);
    }
    advancePortalIdsToClear.push(advancePortalId);
  };

  if (record.type === 'Transfer') {
    const transferRecords = (allAdvanceData || []).filter(
      (r) => getAdvancePortalEntryNo(r) === entryNo
    );
    if (transferRecords.length !== 2) {
      console.warn(
        `Expected 2 Transfer records with entry_no ${entryNo}, but found ${transferRecords.length}`
      );
    }
    await Promise.all(
      transferRecords.map(async (rec) => putClear(getAdvancePortalRecordId(rec)))
    );
  } else {
    await putClear(idToDelete);
  }

  let deletedCount = 0;
  let failedCount = 0;
  for (const advancePortalId of advancePortalIdsToClear) {
    const result = await deleteRelatedWeeklyPaymentBillsForAdvancePortal(advancePortalId);
    deletedCount += result.deletedCount;
    failedCount += result.failedCount;
  }

  return { advancePortalIdsToClear, weeklyBillDelete: { deletedCount, failedCount } };
};

/** When an expense is deleted, clear linked advance portal rows (by expenses_entry_id). */
export const clearLinkedAdvancePortalForExpenseDelete = async (
  expensesEntryId,
  { editedBy, advanceData } = {}
) => {
  const data = advanceData ?? (await fetchAllAdvancePortalRecords());
  const linkedRecords = findAdvancePortalRecordsByExpensesEntryId(data, expensesEntryId);
  if (!linkedRecords.length) {
    return {
      weeklyBillDelete: { deletedCount: 0, failedCount: 0 },
      clearedAdvanceIds: [],
    };
  }

  const processedRootIds = new Set();
  let deletedCount = 0;
  let failedCount = 0;
  const clearedAdvanceIds = [];

  for (const record of linkedRecords) {
    const rootId = getAdvancePortalRecordId(record);
    if (processedRootIds.has(String(rootId))) continue;
    processedRootIds.add(String(rootId));

    const { advancePortalIdsToClear, weeklyBillDelete } = await clearAdvancePortalRecordsOnDelete(
      rootId,
      record,
      data,
      editedBy
    );
    clearedAdvanceIds.push(...advancePortalIdsToClear);
    deletedCount += weeklyBillDelete.deletedCount;
    failedCount += weeklyBillDelete.failedCount;
  }

  return {
    weeklyBillDelete: { deletedCount, failedCount },
    clearedAdvanceIds,
  };
};

/** When advance portal is deleted, delete the linked expenses_form row. */
export const deleteLinkedExpenseEntryOnAdvancePortalDelete = async (expensesEntryId, editedBy) => {
  if (!expensesEntryId) return { ok: false, skipped: true };
  const response = await fetch(
    `${EXPENSES_API_BASE}/expenses_form/delete/${expensesEntryId}?editedBy=${encodeURIComponent(editedBy || '')}`,
    {
      method: 'POST',
      credentials: 'include',
    }
  );
  return { ok: response.ok, skipped: false };
};

export const formatWeeklyBillDeleteMessage = (deletedCount, failedCount) => {
  if (deletedCount > 0 && failedCount === 0) {
    return ' Related bill payment record(s) were also deleted.';
  }
  if (deletedCount > 0 && failedCount > 0) {
    return ' Some related bill payment record(s) could not be deleted.';
  }
  if (failedCount > 0) {
    return ' Failed to delete related bill payment record(s).';
  }
  return '';
};

export const formatAdvancePortalClearOnExpenseDeleteMessage = (clearedAdvanceIds) => {
  if (!clearedAdvanceIds?.length) return '';
  return ' Related advance portal record(s) were also cleared.';
};

export const resolveLoanAdvancePortalId = (record) => {
  const id = record?.advance_portal_id ?? record?.advancePortalId;
  if (id == null || id === '' || id === 0) return null;
  return id;
};

export const fetchAdvancePortalRecordById = async (advancePortalId) => {
  if (!advancePortalId) return null;
  const response = await fetch(`${TOOLS_API_BASE}/api/advance_portal/get/${advancePortalId}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) return null;
  return response.json();
};

/** Map loan edit payload to advance portal edit payload (Loan Portal → Advance Portal transfer link). */
export const buildAdvancePortalUpdatePayloadFromLoanEdit = (loanPayload, existingAdvance) => {
  const existing = existingAdvance || {};
  const loanType = loanPayload?.type || existing.type || 'Transfer';
  const transferProjectId =
    loanPayload?.transfer_Project_id ??
    loanPayload?.transferProjectId ??
    0;

  const base = {
    entry_no: existing.entry_no ?? existing.entryNo ?? loanPayload?.entry_no ?? 0,
    week_no: existing.week_no ?? existing.weekNo ?? '',
    date: loanPayload?.date ?? existing.date,
    file_url: existing.file_url ?? existing.fileUrl ?? '',
    description: existing.description ?? 'Transfer from Loan Portal',
    branch_id: existing.branch_id ?? existing.branchId ?? loanPayload?.branch_id ?? null,
    source: existing.source ?? 'Loan Portal',
    loan_portal_id: existing.loan_portal_id ?? existing.loanPortalId ?? null,
    expenses_entry_id: existing.expenses_entry_id ?? existing.expensesEntryId ?? null,
  };

  if (loanType === 'Transfer') {
    const loanAmount = parseFloat(loanPayload?.amount) || 0;
    return {
      ...base,
      type: 'Transfer',
      vendor_id: loanPayload?.vendor_id || 0,
      contractor_id: loanPayload?.contractor_id || 0,
      project_id:
        transferProjectId ||
        loanPayload?.project_id ||
        existing.project_id ||
        existing.projectId ||
        0,
      transfer_site_id: existing.transfer_site_id ?? existing.transferSiteId ?? 11,
      payment_mode: '',
      amount: Math.abs(loanAmount),
      bill_amount: 0,
      refund_amount: 0,
    };
  }

  return {
    ...base,
    type: existing.type || loanType,
    vendor_id: loanPayload?.vendor_id || 0,
    contractor_id: loanPayload?.contractor_id || 0,
    project_id: loanPayload?.project_id || 0,
    transfer_site_id: existing.transfer_site_id ?? existing.transferSiteId ?? '',
    payment_mode: loanPayload?.loan_payment_mode || existing.payment_mode || existing.paymentMode || '',
    amount: parseFloat(loanPayload?.amount) || 0,
    bill_amount: 0,
    refund_amount: 0,
  };
};

/** PUT advance_portal/edit when loan row is linked via advance_portal_id */
export const syncAdvancePortalFromLoanEdit = async (
  advancePortalId,
  loanPayload,
  { editedBy = '', existingAdvanceRecord = null, siteOptions = [], selectedOption = null, branchId = null } = {}
) => {
  if (!advancePortalId) return;

  const existingAdvance =
    existingAdvanceRecord ?? (await fetchAdvancePortalRecordById(advancePortalId));
  if (!existingAdvance) {
    console.warn(`Linked advance portal entry ${advancePortalId} not found; skipping advance sync`);
    return;
  }

  const advancePayload = buildAdvancePortalUpdatePayloadFromLoanEdit(loanPayload, existingAdvance);

  const response = await fetch(
    `${TOOLS_API_BASE}/api/advance_portal/edit/${advancePortalId}?editedBy=${encodeURIComponent(editedBy || '')}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(advancePayload),
    }
  );
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to update linked advance portal entry: ${errText}`);
  }

  const expensesEntryId = resolveAdvancePortalExpensesEntryId(existingAdvance);
  if (expensesEntryId) {
    await syncExpensesEntryFromAdvancePortalEdit(expensesEntryId, advancePayload, {
      editedBy,
      siteOptions,
      selectedOption,
      branchId: branchId ?? advancePayload.branch_id,
    });
  }
};
