import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Filter from '../Images/Filter.png';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';
import DeleteConfirmModal from '../PurchaseOrder/DeleteConfirmModal';
import Pen from '../Images/Pen.svg';
import Edit from '../Images/edit1.png';
import Delete from '../Images/delete.png';
import CloseIcon from '../Images/Close F.svg';
import { fetchUserModulePermissions } from '../utils/fetchUserModulePermissions';
import {
  LOAN_PORTAL_MODULE_NAME,
} from '../../utils/paymentModeArrangement';
import { usePaymentModeSelectOptionsForModule } from '../../utils/usePaymentModeArrangement';

const History = ({ user }) => {
  const resolveActiveBranchId = () => {
    try {
      const selectedBranchId = localStorage.getItem("selectedBranchId");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const fallbackBranchId = user?.branchId ?? user?.branch_id ?? user?.brachId;
      const resolved = Number(selectedBranchId || fallbackBranchId);
      return Number.isFinite(resolved) && resolved > 0 ? resolved : null;
    } catch {
      return null;
    }
  };

  const [activeBranchId] = useState(() => resolveActiveBranchId());
  const withBranchUrl = (baseUrl) => {
    const url = new URL(baseUrl);
    if (activeBranchId !== null && activeBranchId !== undefined && activeBranchId !== "") {
      url.searchParams.set("branchId", String(activeBranchId));
    }
    return url.toString();
  };

  const [loanData, setLoanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [labourOptions, setLabourOptions] = useState([]);
  const [purposeOptions, setPurposeOptions] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [typeSearchQuery, setTypeSearchQuery] = useState('');
  const [associateFilter, setAssociateFilter] = useState('');
  const [entryNoFilter, setEntryNoFilter] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('');
  const [paymentModeFilter, setPaymentModeFilter] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [showEntryNoModal, setShowEntryNoModal] = useState(false);
  const [showPurposeModal, setShowPurposeModal] = useState(false);
  const [showPaymentModeModal, setShowPaymentModeModal] = useState(false);
  const defaultPaymentModeOptions = [
    { value: 'Cash', label: 'Cash' },
    { value: 'GPay', label: 'GPay' },
    { value: 'PhonePe', label: 'PhonePe' },
    { value: 'Net Banking', label: 'Net Banking' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'Advance Transfer', label: 'Advance Transfer' }
  ];
  const paymentModeOptions = usePaymentModeSelectOptionsForModule(
    LOAN_PORTAL_MODULE_NAME,
    defaultPaymentModeOptions
  );
  const paymentModeFilterOptions = useMemo(
    () => paymentModeOptions.map((opt) => opt.label),
    [paymentModeOptions]
  );
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');
  const [showFilePreviewModal, setShowFilePreviewModal] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState('');
  const [filePreviewLoading, setFilePreviewLoading] = useState(false);
  const [swipeStates, setSwipeStates] = useState({});
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState(null);
  const [modulePermissions, setModulePermissions] = useState([]);
  const cardRefs = useRef({});
  const billTrackersCacheRef = useRef(null);
  const billPaymentsCacheRef = useRef({});
  const weeklyExpenseRowsCacheRef = useRef(null);
  const dailyPaymentsByDateCacheRef = useRef({});

  const convertToViewableUrl = (url) => {
    if (!url) return url;
    if (url.includes('drive.google.com')) {
      let fileId = null;
      const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match1) fileId = match1[1];
      if (!fileId) {
        const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (match2) fileId = match2[1];
      }
      if (!fileId) {
        const match3 = url.match(/\/uc\?id=([a-zA-Z0-9_-]+)/);
        if (match3) fileId = match3[1];
      }
      if (fileId) return `https://drive.google.com/file/d/${fileId}/view`;
    }
    return url;
  };

  const normalizeStoredFileUrl = (url) => {
    const trimmed = String(url || '').trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return '';
    if (trimmed.startsWith('data:')) return trimmed;
    if (trimmed.startsWith('http')) return convertToViewableUrl(trimmed);
    if (trimmed.startsWith('/')) {
      return convertToViewableUrl(`https://backendaab.in${trimmed}`);
    }
    return convertToViewableUrl(trimmed);
  };

  const resolveEntryFileUrl = (entry) => {
    if (!entry || typeof entry !== 'object') return '';
    if (Array.isArray(entry.urls) && entry.urls.length > 0) {
      const fromUrls = normalizeStoredFileUrl(entry.urls[0]);
      if (fromUrls) return fromUrls;
    }
    const preferredKeys = [
      'file_url',
      'fileUrl',
      'new_file_url',
      'newFileUrl',
      'old_file_url',
      'oldFileUrl',
      'attachment_url',
      'attachmentUrl',
      'bill_url',
      'billUrl',
      'bill_copy_url',
      'billCopyUrl',
      'document_url',
      'documentUrl',
      'upload_url',
      'uploadUrl',
      'preview_url',
      'previewUrl',
    ];
    for (const key of preferredKeys) {
      const value = entry[key];
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed && trimmed !== 'null' && trimmed !== 'undefined') {
          return normalizeStoredFileUrl(trimmed);
        }
      }
    }
    for (const [key, value] of Object.entries(entry)) {
      if (typeof value === 'string' && /url|file|attach|bill/i.test(key)) {
        const normalized = normalizeStoredFileUrl(value);
        if (normalized) return normalized;
      }
    }
    return '';
  };

  const normalizeDateKey = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return '';
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    } catch {
      return '';
    }
  };

  const getLoanAmountAbs = (entry) => {
    if (!entry) return 0;
    if (entry.type === 'Refund') {
      return Math.abs(parseFloat(entry.loan_refund_amount) || 0);
    }
    return Math.abs(parseFloat(entry.amount) || 0);
  };

  const getEntryLoanId = (entry) =>
    entry?.loanPortalId ?? entry?.id ?? entry?.loan_portal_id ?? null;

  const getCacheRowUrl = (row) =>
    row?.file_url || row?.fileUrl || row?.previewDataUrl || '';

  const unwrapLoanPayload = (data) => {
    if (!data || typeof data !== 'object') return data;
    if (Array.isArray(data)) return data;
    return data.loan ?? data.data ?? data.result ?? data.entry ?? data.record ?? data;
  };

  const mergeLoanRows = (lists) => {
    const byKey = new Map();
    const all = lists.flat().filter(Boolean);
    for (const entry of all) {
      const id = getEntryLoanId(entry);
      const key =
        id != null
          ? `id:${id}`
          : `eno:${entry?.entry_no ?? entry?.entryNo ?? ''}-${normalizeDateKey(entry?.date || entry?.timestamp)}`;
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, entry);
        continue;
      }
      const existingUrl = resolveEntryFileUrl(existing);
      const nextUrl = resolveEntryFileUrl(entry);
      const merged = { ...existing, ...entry };
      if (nextUrl && !existingUrl) merged.file_url = nextUrl;
      else if (existingUrl) merged.file_url = existingUrl;
      byKey.set(key, merged);
    }
    return Array.from(byKey.values());
  };

  const associateIdsMatch = (entry, row) => {
    const pairs = [
      ['vendor_id', 'vendorId'],
      ['contractor_id', 'contractorId'],
      ['employee_id', 'employeeId'],
      ['labour_id', 'labourId'],
    ];
    for (const [snake, camel] of pairs) {
      const entryId = entry?.[snake] ?? entry?.[camel];
      const rowId = row?.[snake] ?? row?.[camel];
      if (entryId != null && entryId !== '' && entryId !== 0 && rowId != null && rowId !== '') {
        return String(entryId) === String(rowId);
      }
    }
    return false;
  };

  const expenseRowMatchesEntry = (entry, row) => {
    const loanPortalId = row?.loan_portal_id ?? row?.loanPortalId;
    const entryId = getEntryLoanId(entry);
    if (loanPortalId != null && entryId != null && String(loanPortalId) === String(entryId)) {
      return true;
    }

    if (!associateIdsMatch(entry, row)) return false;

    const entryAmount = getLoanAmountAbs(entry);
    const rowAmount = Math.abs(parseFloat(row?.amount) || 0);
    if (entryAmount > 0 && rowAmount > 0 && Math.abs(entryAmount - rowAmount) > 0.01) {
      return false;
    }

    const entryDate = normalizeDateKey(entry?.date || entry?.timestamp || entry?.created_at || entry?.createdAt);
    const rowDate = normalizeDateKey(row?.date || row?.created_at || row?.createdAt);
    if (entryDate && rowDate && entryDate !== rowDate) return false;

    return true;
  };

  const getPaymentAmountAbs = (payment) => {
    const mode = payment?.vendor_bill_payment_mode ?? payment?.vendorBillPaymentMode ?? '';
    if (mode === 'Carry Forward') {
      return Math.abs(parseFloat(payment?.carry_forward_amount ?? payment?.carryForwardAmount) || 0);
    }
    return Math.abs(parseFloat(payment?.amount) || 0);
  };

  const normalizePaymentMode = (mode) =>
    String(mode || '')
      .trim()
      .toLowerCase()
      .replace(/[\s_-]/g, '');

  const paymentModesMatch = (loanMode, paymentMode) => {
    const a = normalizePaymentMode(loanMode);
    const b = normalizePaymentMode(paymentMode);
    if (!a || !b) return true;
    return a === b;
  };

  const paymentMatchesLoanEntry = (entry, payment) => {
    const entryDate = normalizeDateKey(entry?.date || entry?.timestamp || entry?.created_at || entry?.createdAt);
    const paymentDate = normalizeDateKey(payment?.date || payment?.payment_date || payment?.paymentDate);
    if (entryDate && paymentDate && entryDate !== paymentDate) return false;

    const entryAmount = getLoanAmountAbs(entry);
    const paymentAmount = getPaymentAmountAbs(payment);
    if (entryAmount > 0 && paymentAmount > 0 && Math.abs(entryAmount - paymentAmount) > 0.01) {
      return false;
    }

    const loanMode = entry?.loan_payment_mode ?? entry?.loanPaymentMode ?? '';
    const payMode = payment?.vendor_bill_payment_mode ?? payment?.vendorBillPaymentMode ?? '';
    return paymentModesMatch(loanMode, payMode);
  };

  const getWeekNumberFromDate = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 0;
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const elapsedDays = Math.floor((date - firstDay) / 86400000);
    return Math.ceil((elapsedDays + firstDay.getDay() + 1) / 7);
  };

  const fetchVendorTrackersByVendorId = async (vendorId) => {
    const vId = String(vendorId ?? '').trim();
    if (!vId) return [];
    try {
      const response = await fetch(
        `https://backendaab.in/aabuildersDash/api/vendor-payments/vendor/${encodeURIComponent(vId)}`,
        { credentials: 'include', headers: { 'Content-Type': 'application/json' } }
      );
      if (!response.ok) return [];
      const data = await response.json().catch(() => []);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  };

  const findLatestBillUrlForVendor = async (vendorId) => {
    const vendorTrackers = await fetchVendorTrackersByVendorId(vendorId);
    const allTrackers = await fetchBillTrackersList();
    const mergedById = new Map();
    [...vendorTrackers, ...allTrackers.filter((t) => String(t?.vendor_id ?? t?.vendorId) === String(vendorId))].forEach((tracker) => {
      const id = tracker?.id ?? tracker?.bill_id ?? tracker?.billId;
      if (id != null) mergedById.set(String(id), tracker);
    });
    let latestUrl = '';
    let latestTime = 0;
    for (const tracker of mergedById.values()) {
      const trackerId = tracker?.id ?? tracker?.bill_id ?? tracker?.billId;
      if (!trackerId) continue;
      const payments = await fetchTrackerPayments(trackerId);
      for (const payment of payments) {
        const url = resolveEntryFileUrl(payment);
        if (!url) continue;
        const ts = new Date(payment?.created_at ?? payment?.createdAt ?? payment?.date ?? 0).getTime();
        if (!Number.isNaN(ts) && ts >= latestTime) {
          latestTime = ts;
          latestUrl = url;
        }
      }
    }
    return latestUrl;
  };

  const loanCacheMatchesEntry = (entry, row) => {
    if (!getCacheRowUrl(row)) return false;

    const entryId = getEntryLoanId(entry);
    const rowId = getEntryLoanId(row);
    if (entryId != null && rowId != null && String(entryId) === String(rowId)) {
      return true;
    }

    const entryNo = entry?.entry_no ?? entry?.entryNo;
    const rowNo = row?.entry_no ?? row?.entryNo;
    if (entryNo != null && rowNo != null && String(entryNo) === String(rowNo)) {
      return true;
    }
    if (entryNo != null && rowNo != null) {
      const diff = Math.abs(Number(entryNo) - Number(rowNo));
      if (!Number.isNaN(diff) && diff <= 1) return true;
    }

    if (!associateIdsMatch(entry, row)) return false;

    const entryAmount = getLoanAmountAbs(entry);
    const rowAmount = Number(row?.amount) || 0;
    if (entryAmount > 0 && rowAmount > 0 && Math.abs(entryAmount - rowAmount) > 0.01) {
      return false;
    }

    const entryDate = normalizeDateKey(entry?.date || entry?.timestamp || entry?.created_at || entry?.createdAt);
    const rowDate = normalizeDateKey(row?.date);
    if (entryDate && rowDate && entryDate !== rowDate) return false;

    return true;
  };

  const readLoanFileCache = () => {
    try {
      const fromSession = JSON.parse(sessionStorage.getItem('aab_loan_file_cache') || '[]');
      const fromLocal = JSON.parse(localStorage.getItem('aab_loan_file_cache') || '[]');
      const merged = [
        ...(Array.isArray(fromSession) ? fromSession : []),
        ...(Array.isArray(fromLocal) ? fromLocal : []),
      ];
      const seen = new Set();
      return merged.filter((row) => {
        const key = `${getEntryLoanId(row) || ''}-${row?.entry_no ?? row?.entryNo ?? ''}-${getCacheRowUrl(row)}`;
        if (!getCacheRowUrl(row) || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    } catch {
      return [];
    }
  };

  const readCachedAttachmentUrl = (entry) => {
    try {
      const loanCache = readLoanFileCache();
      for (const row of loanCache) {
        if (loanCacheMatchesEntry(entry, row)) {
          const url = normalizeStoredFileUrl(getCacheRowUrl(row));
          if (url) return url;
        }
      }

      const entryNo = entry?.entry_no ?? entry?.entryNo;
      if (entryNo != null) {
        const entryAmount = getLoanAmountAbs(entry);
        const entryDate = normalizeDateKey(entry?.date || entry?.timestamp || entry?.created_at);
        for (const row of loanCache) {
          const rowNo = row?.entry_no ?? row?.entryNo;
          if (rowNo == null || String(rowNo) !== String(entryNo)) continue;
          const rowAmount = Number(row?.amount) || 0;
          if (entryAmount > 0 && rowAmount > 0 && Math.abs(entryAmount - rowAmount) > 0.01) continue;
          const rowDate = normalizeDateKey(row?.date);
          if (entryDate && rowDate && entryDate !== rowDate) continue;
          const url = normalizeStoredFileUrl(getCacheRowUrl(row));
          if (url) return url;
        }
      }

      const lastLoanFile = JSON.parse(sessionStorage.getItem('aab_loan_last_selected_file') || 'null');
      if (lastLoanFile && typeof lastLoanFile === 'object') {
        const lastNo = lastLoanFile.entry_no ?? lastLoanFile.entryNo;
        if (entryNo != null && lastNo != null && String(lastNo) === String(entryNo)) {
          const url = normalizeStoredFileUrl(
            lastLoanFile.previewDataUrl || lastLoanFile.file_url || lastLoanFile.fileUrl
          );
          if (url) return url;
        }
      }

      const lastBill = JSON.parse(sessionStorage.getItem('aab_last_bill_payment') || 'null');
      if (lastBill && typeof lastBill === 'object') {
        const vendorId = String(entry?.vendor_id ?? entry?.vendorId ?? '');
        const amount = getLoanAmountAbs(entry);
        const date = normalizeDateKey(entry?.date || entry?.timestamp || entry?.created_at);
        const mode = entry?.loan_payment_mode ?? entry?.loanPaymentMode ?? '';
        if (!vendorId || String(lastBill.vendorId ?? lastBill.vendor_id) === vendorId) {
          const billAmount = Number(lastBill.amount) || 0;
          const billDate = normalizeDateKey(lastBill.date);
          const billMode = lastBill.mode ?? lastBill.paymentMode ?? '';
          const amountOk = !amount || !billAmount || Math.abs(amount - billAmount) <= 0.01;
          const dateOk = !date || !billDate || date === billDate;
          const modeOk = paymentModesMatch(mode, billMode);
          if (amountOk && dateOk && modeOk) {
            const url = normalizeStoredFileUrl(lastBill.url ?? lastBill.bill_url);
            if (url) return url;
          }
        }
      }
    } catch {
      // ignore
    }
    return '';
  };

  const resolveAttachmentForEntry = (entry) => {
    if (!entry) return '';
    return (
      resolveEntryFileUrl(entry) ||
      readCachedAttachmentUrl(entry) ||
      ''
    );
  };

  const enrichLoanData = (rows) => {
    const list = Array.isArray(rows) ? rows : [];
    return list.map((entry) => {
      const attachmentUrl = resolveAttachmentForEntry(entry);
      if (!attachmentUrl) return entry;
      return { ...entry, file_url: attachmentUrl };
    });
  };

  const parsePaymentsResponse = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.payments)) return data.payments;
    if (Array.isArray(data?.data)) return data.data;
    if (data && typeof data === 'object' && resolveEntryFileUrl(data)) return [data];
    return [];
  };

  const fetchBillTrackersList = async () => {
    if (billTrackersCacheRef.current) return billTrackersCacheRef.current;
    const endpoints = [
      'https://backendaab.in/aabuildersDash/api/vendor-payments/trackers/enriched/paid',
      withBranchUrl('https://backendaab.in/aabuildersDash/api/vendor-payments/trackers/pending'),
      'https://backendaab.in/aabuildersDash/api/vendor-payments/trackers',
    ];
    const merged = [];
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) continue;
        const data = await response.json().catch(() => []);
        if (Array.isArray(data)) merged.push(...data);
      } catch {
        // ignore
      }
    }
    billTrackersCacheRef.current = merged;
    return merged;
  };

  const fetchTrackerPayments = async (trackerId) => {
    const key = String(trackerId);
    if (billPaymentsCacheRef.current[key]) return billPaymentsCacheRef.current[key];
    const requestUrls = [
      withBranchUrl(`https://backendaab.in/aabuildersDash/api/vendor-bill-tracker/get/${trackerId}`),
      `https://backendaab.in/aabuildersDash/api/vendor-bill-tracker/get/${trackerId}`,
    ];
    for (const requestUrl of requestUrls) {
      try {
        const response = await fetch(requestUrl, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) continue;
        const data = await response.json().catch(() => []);
        const rows = parsePaymentsResponse(data);
        if (rows.length > 0) {
          billPaymentsCacheRef.current[key] = rows;
          return rows;
        }
      } catch {
        // try next url
      }
    }
    return [];
  };

  const findBillUrlInPayments = (entry, payments) => {
    if (!Array.isArray(payments) || payments.length === 0) return '';
    const matched = payments.filter((payment) => paymentMatchesLoanEntry(entry, payment));
    const pools = [matched];
    if (matched.length === 0) {
      const entryAmount = getLoanAmountAbs(entry);
      const amountMatched = payments.filter((payment) => {
        const paymentAmount = getPaymentAmountAbs(payment);
        return entryAmount > 0 && paymentAmount > 0 && Math.abs(entryAmount - paymentAmount) <= 0.01;
      });
      if (amountMatched.length > 0) pools.push(amountMatched);
    }
    pools.push(payments);
    for (const pool of pools) {
      for (let i = pool.length - 1; i >= 0; i -= 1) {
        const url = resolveEntryFileUrl(pool[i]);
        if (url) return url;
      }
    }
    return '';
  };

  const fetchWeeklyExpenseRows = async (weekNo) => {
    const key = String(weekNo);
    if (weeklyExpenseRowsCacheRef.current?.[key]) {
      return weeklyExpenseRowsCacheRef.current[key];
    }
    const weekUrls = [
      withBranchUrl(`https://backendaab.in/aabuildersDash/api/weekly-expenses/week/${weekNo}`),
      `https://backendaab.in/aabuildersDash/api/weekly-expenses/week/${weekNo}`,
    ];
    for (const weekUrl of weekUrls) {
      try {
        const response = await fetch(weekUrl, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) continue;
        const data = await response.json().catch(() => []);
        const rows = Array.isArray(data) ? data : [];
        if (!weeklyExpenseRowsCacheRef.current) weeklyExpenseRowsCacheRef.current = {};
        weeklyExpenseRowsCacheRef.current[key] = rows;
        return rows;
      } catch {
        // try next
      }
    }
    return [];
  };

  const findFileUrlInExpenseRows = (entry, rows) => {
    if (!Array.isArray(rows) || rows.length === 0) return '';
    for (let i = rows.length - 1; i >= 0; i -= 1) {
      if (!expenseRowMatchesEntry(entry, rows[i])) continue;
      const url = resolveEntryFileUrl(rows[i]);
      if (url) return url;
    }
    return '';
  };

  const fetchWeeklyExpenseAttachment = async (entry) => {
    const weekNo = getWeekNumberFromDate(entry?.date || entry?.timestamp || entry?.created_at);
    if (!weekNo) return '';
    const weekNumbers = [weekNo - 1, weekNo, weekNo + 1].filter((w) => w > 0);
    for (const week of weekNumbers) {
      const rows = await fetchWeeklyExpenseRows(week);
      const url = findFileUrlInExpenseRows(entry, rows);
      if (url) return url;
    }
    return '';
  };

  const formatDateForDailyApi = (dateString) => {
    const key = normalizeDateKey(dateString);
    if (!key) return '';
    const [y, m, d] = key.split('-');
    return `${y}-${m}-${d}`;
  };

  const fetchDailyPaymentRows = async (dateString) => {
    const dateStr = formatDateForDailyApi(dateString);
    if (!dateStr) return [];
    if (dailyPaymentsByDateCacheRef.current[dateStr]) {
      return dailyPaymentsByDateCacheRef.current[dateStr];
    }
    const urls = [
      withBranchUrl(`https://backendaab.in/aabuildersDash/api/daily-payments/date/${dateStr}`),
      `https://backendaab.in/aabuildersDash/api/daily-payments/date/${dateStr}`,
    ];
    for (const requestUrl of urls) {
      try {
        const response = await fetch(requestUrl, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) continue;
        const data = await response.json().catch(() => []);
        const rows = Array.isArray(data) ? data : [];
        dailyPaymentsByDateCacheRef.current[dateStr] = rows;
        return rows;
      } catch {
        // try next
      }
    }
    return [];
  };

  const fetchDailyPaymentAttachment = async (entry) => {
    const rows = await fetchDailyPaymentRows(entry?.date || entry?.timestamp || entry?.created_at);
    return findFileUrlInExpenseRows(entry, rows);
  };

  const fetchBillPaymentAttachment = async (entry) => {
    const weeklyUrl = await fetchWeeklyExpenseAttachment(entry);
    if (weeklyUrl) return weeklyUrl;

    const dailyUrl = await fetchDailyPaymentAttachment(entry);
    if (dailyUrl) return dailyUrl;

    const trackerId =
      entry?.vendor_payment_tracker_id ??
      entry?.vendor_payments_tracker_id ??
      entry?.vendorPaymentTrackerId ??
      entry?.vendorPaymentsTrackerId;
    if (trackerId) {
      const payments = await fetchTrackerPayments(trackerId);
      const url = findBillUrlInPayments(entry, payments);
      if (url) return url;
    }

    const vendorId = entry?.vendor_id ?? entry?.vendorId;
    if (!vendorId) return '';

    const trackers = await fetchBillTrackersList();
    const vendorTrackers = trackers
      .filter((tracker) => String(tracker?.vendor_id ?? tracker?.vendorId ?? '') === String(vendorId))
      .sort((a, b) => {
        const dateA = new Date(a?.date || a?.updated_at || a?.created_at || 0).getTime();
        const dateB = new Date(b?.date || b?.updated_at || b?.created_at || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 30);

    for (const tracker of vendorTrackers) {
      const id = tracker?.id ?? tracker?.bill_id ?? tracker?.billId;
      if (!id) continue;
      const payments = await fetchTrackerPayments(id);
      const url = findBillUrlInPayments(entry, payments);
      if (url) return url;
    }

    return '';
  };

  const fetchLoanAuditAttachment = async (entry) => {
    const entryId = getEntryLoanId(entry);
    if (!entryId) return '';
    try {
      const response = await fetch(
        `https://backendaab.in/aabuildersDash/api/loans/audit/history/${entryId}`,
        { credentials: 'include', headers: { 'Content-Type': 'application/json' } }
      );
      if (!response.ok) return '';
      const data = await response.json().catch(() => []);
      const audits = Array.isArray(data)
        ? data
        : Array.isArray(data?.audits)
          ? data.audits
          : Array.isArray(data?.history)
            ? data.history
            : [];
      for (let i = audits.length - 1; i >= 0; i -= 1) {
        const url = resolveEntryFileUrl(audits[i]);
        if (url) return url;
      }
      for (let i = audits.length - 1; i >= 0; i -= 1) {
        const audit = audits[i];
        const url = normalizeStoredFileUrl(
          audit?.new_file_url ?? audit?.newFileUrl ?? audit?.old_file_url ?? audit?.oldFileUrl ?? ''
        );
        if (url) return url;
      }
    } catch {
      // ignore
    }
    return '';
  };

  const fetchLoanDetailAttachment = async (entry) => {
    const entryId = getEntryLoanId(entry);
    if (!entryId) return '';
    const detailUrls = [
      withBranchUrl(`https://backendaab.in/aabuildersDash/api/loans/${entryId}`),
      `https://backendaab.in/aabuildersDash/api/loans/${entryId}`,
    ];
    for (const detailUrl of detailUrls) {
      try {
        const response = await fetch(detailUrl, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) continue;
        const data = await response.json();
        const unwrapped = unwrapLoanPayload(data);
        const detail = Array.isArray(unwrapped)
          ? unwrapped.find((row) => String(getEntryLoanId(row)) === String(entryId)) || unwrapped[0]
          : unwrapped;
        const merged = detail ? { ...entry, ...detail } : entry;
        const url = resolveEntryFileUrl(merged) || readCachedAttachmentUrl(merged);
        if (url) return url;
      } catch {
        // try next url
      }
    }
    return '';
  };

  const prefetchFromCashRegisterExpenses = async (rows) => {
    const list = Array.isArray(rows) ? rows : [];
    const weekSet = new Set();
    list.forEach((entry) => {
      const weekNo = getWeekNumberFromDate(entry?.date || entry?.timestamp || entry?.created_at);
      if (weekNo > 0) {
        weekSet.add(weekNo - 1);
        weekSet.add(weekNo);
        weekSet.add(weekNo + 1);
      }
    });

    const loanIdToUrl = new Map();
    const expenseRowsWithFiles = [];

    await Promise.all(
      [...weekSet].map(async (week) => {
        const weekRows = await fetchWeeklyExpenseRows(week);
        weekRows.forEach((row) => {
          const url = resolveEntryFileUrl(row);
          if (!url) return;
          const linkedLoanId = row?.loan_portal_id ?? row?.loanPortalId;
          if (linkedLoanId != null) loanIdToUrl.set(String(linkedLoanId), url);
          expenseRowsWithFiles.push(row);
        });
      })
    );

    return list.map((entry) => {
      if (resolveAttachmentForEntry(entry)) return entry;
      const entryId = getEntryLoanId(entry);
      if (entryId != null && loanIdToUrl.has(String(entryId))) {
        return { ...entry, file_url: loanIdToUrl.get(String(entryId)) };
      }
      for (let i = expenseRowsWithFiles.length - 1; i >= 0; i -= 1) {
        if (!expenseRowMatchesEntry(entry, expenseRowsWithFiles[i])) continue;
        const url = resolveEntryFileUrl(expenseRowsWithFiles[i]);
        if (url) return { ...entry, file_url: url };
      }
      return entry;
    });
  };

  const prefetchMissingLoanAttachments = async (rows) => {
    const list = Array.isArray(rows) ? rows : [];
    const targets = list
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => !resolveAttachmentForEntry(entry) && getEntryLoanId(entry));
    if (targets.length === 0) return list;

    const enriched = list.map((entry) => ({ ...entry }));
    const batchSize = 12;
    for (let offset = 0; offset < targets.length; offset += batchSize) {
      const batch = targets.slice(offset, offset + batchSize);
      await Promise.all(
        batch.map(async ({ entry, index }) => {
          let url = await fetchLoanDetailAttachment(entry);
          if (!url) url = await fetchLoanAuditAttachment(entry);
          if (!url) url = await fetchWeeklyExpenseAttachment(entry);
          if (!url) url = await fetchDailyPaymentAttachment(entry);
          if (url) enriched[index] = { ...enriched[index], file_url: url };
        })
      );
    }
    return enriched;
  };

  const fetchEntryFileUrl = async (entry) => {
    let url = resolveAttachmentForEntry(entry);
    if (url) return url;

    url = await fetchLoanDetailAttachment(entry);
    if (url) return url;

    url = await fetchLoanAuditAttachment(entry);
    if (url) return url;

    url = await fetchWeeklyExpenseAttachment(entry);
    if (url) return url;

    url = await fetchDailyPaymentAttachment(entry);
    if (url) return url;

    return fetchBillPaymentAttachment(entry);
  };

  const handleAmountFileClick = async (entry, presetAttachmentUrl = '') => {
    setShowFilePreviewModal(true);
    setPreviewFileUrl('');
    setFilePreviewLoading(true);
    try {
      const immediateUrl = presetAttachmentUrl || resolveAttachmentForEntry(entry);
      const url = immediateUrl || await fetchEntryFileUrl(entry);
      if (url) {
        try {
          const cache = readLoanFileCache();
          const alreadyCached = cache.some((row) => loanCacheMatchesEntry(entry, row));
          if (!alreadyCached) {
            const next = [
              {
                loanPortalId: getEntryLoanId(entry),
                entry_no: entry?.entry_no ?? entry?.entryNo,
                vendor_id: entry?.vendor_id ?? entry?.vendorId ?? 0,
                contractor_id: entry?.contractor_id ?? entry?.contractorId ?? 0,
                employee_id: entry?.employee_id ?? entry?.employeeId ?? 0,
                labour_id: entry?.labour_id ?? entry?.labourId ?? 0,
                amount: getLoanAmountAbs(entry),
                date: entry?.date || entry?.timestamp,
                loan_payment_mode: entry?.loan_payment_mode,
                file_url: url.startsWith('data:') ? '' : url,
                previewDataUrl: url.startsWith('data:') ? url : '',
              },
              ...cache,
            ].slice(0, 500);
            sessionStorage.setItem('aab_loan_file_cache', JSON.stringify(next));
            localStorage.setItem('aab_loan_file_cache', JSON.stringify(next));
            window.dispatchEvent(new Event('loanFileCacheUpdated'));
          }
        } catch {
          // ignore cache write errors
        }
      }
      setPreviewFileUrl(url);
      if (url) {
        const entryId = getEntryLoanId(entry);
        setLoanData((prev) =>
          prev.map((row) => {
            const rowId = getEntryLoanId(row);
            const sameId = entryId != null && rowId != null && String(rowId) === String(entryId);
            const sameEntryNo =
              String(row?.entry_no ?? row?.entryNo ?? '') === String(entry?.entry_no ?? entry?.entryNo ?? '') &&
              (entry?.entry_no != null || entry?.entryNo != null);
            if (!sameId && !sameEntryNo) return row;
            return { ...row, file_url: url.startsWith('data:') ? row.file_url || '' : url };
          })
        );
      }
    } finally {
      setFilePreviewLoading(false);
    }
  };

  const closeFilePreviewModal = () => {
    setShowFilePreviewModal(false);
    setPreviewFileUrl('');
    setFilePreviewLoading(false);
  };

  const isPdfPreview = (url) => {
    const lower = String(url || '').toLowerCase();
    return lower.includes('.pdf') || lower.includes('application/pdf') || lower.startsWith('data:application/pdf');
  };

  useEffect(() => {
    const fetchData = async () => {
      billTrackersCacheRef.current = null;
      billPaymentsCacheRef.current = {};
      weeklyExpenseRowsCacheRef.current = null;
      dailyPaymentsByDateCacheRef.current = {};
      try {
        const listUrls = [
          withBranchUrl('https://backendaab.in/aabuildersDash/api/loans/all'),
          'https://backendaab.in/aabuildersDash/api/loans/all',
        ];
        const fetchedLists = [];
        for (const listUrl of listUrls) {
          const response = await fetch(listUrl, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          if (!response.ok) continue;
          const data = await response.json().catch(() => []);
          if (Array.isArray(data)) fetchedLists.push(data);
        }
        const rows = mergeLoanRows(fetchedLists);
        const withCache = enrichLoanData(rows);
        setLoanData(withCache);
        const withCashFiles = await prefetchFromCashRegisterExpenses(withCache);
        setLoanData(enrichLoanData(withCashFiles));
        const withDetails = await prefetchMissingLoanAttachments(withCashFiles);
        setLoanData(enrichLoanData(withDetails));
      } catch (error) {
        console.error('Error fetching loan data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const handleLoanUpdate = () => fetchData();
    const handleStorage = (event) => {
      if (event.key === 'aab_loan_file_cache') {
        setLoanData((prev) => enrichLoanData(prev));
      }
    };
    const handleLoanFileCacheUpdate = () => {
      setLoanData((prev) => enrichLoanData(prev));
    };
    window.addEventListener('loanUpdated', handleLoanUpdate);
    window.addEventListener('loanFileCacheUpdated', handleLoanFileCacheUpdate);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('loanUpdated', handleLoanUpdate);
      window.removeEventListener('loanFileCacheUpdated', handleLoanFileCacheUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [activeBranchId]);

  // Fetch vendors
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
          const data = await response.json();
          setVendorOptions(data.map(item => ({ id: item.id, label: item.vendorName })));
        }
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };
    fetchVendors();
  }, []);

  // Fetch contractors
  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/contractor_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
          const data = await response.json();
          setContractorOptions(data.map(item => ({ id: item.id, label: item.contractorName })));
        }
      } catch (error) {
        console.error("Error fetching contractors:", error);
      }
    };
    fetchContractors();
  }, []);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuildersDash/api/employee_details/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
          const data = await response.json();
          setEmployeeOptions(data.map(item => ({ id: item.id, label: item.employee_name })));
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch labour
  useEffect(() => {
    const fetchLabour = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuildersDash/api/labours-details/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
          const data = await response.json();
          setLabourOptions(data.map(item => ({ id: item.id, label: item.labour_name })));
        }
      } catch (error) {
        console.error("Error fetching labour:", error);
      }
    };
    fetchLabour();
  }, []);

  // Fetch purposes
  useEffect(() => {
    const fetchPurposes = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/loan-purposes/getAll', {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
          const data = await response.json();
          setPurposeOptions(data.map(item => ({ id: item.id, label: item.purpose })));
        }
      } catch (error) {
        console.error("Error fetching purposes:", error);
      }
    };
    fetchPurposes();
  }, []);

  const getAssociateName = (entry) => {
    if (entry.vendor_id) {
      const vendor = vendorOptions.find(v => v.id === entry.vendor_id);
      return vendor ? vendor.label : '';
    }
    if (entry.contractor_id) {
      const contractor = contractorOptions.find(c => c.id === entry.contractor_id);
      return contractor ? contractor.label : '';
    }
    if (entry.employee_id) {
      const employee = employeeOptions.find(e => e.id === entry.employee_id);
      return employee ? employee.label : '';
    }
    if (entry.labour_id) {
      const labour = labourOptions.find(l => l.id === entry.labour_id);
      return labour ? labour.label : '';
    }
    return '';
  };

  const getPurposeName = (purposeId) => {
    if (!purposeId) return '';
    const purpose = purposeOptions.find(p => p.id === parseInt(purposeId));
    return purpose ? purpose.label : '';
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
      const date = new Date(dateTimeString);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const timeStr = `${hours}:${minutes} ${ampm}`;
      if (dateOnly.getTime() === today.getTime()) {
        return `Today • ${timeStr}`;
      } else if (dateOnly.getTime() === yesterday.getTime()) {
        return `Yesterday • ${timeStr}`;
      } else {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year} • ${timeStr}`;
      }
    } catch {
      return '';
    }
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const transformEntries = () => {
    return loanData
      .map((entry) => {
        const associateName = getAssociateName(entry);
        const purposeName = getPurposeName(entry.from_purpose_id);
        const entryType = entry.type || 'Loan';

        let amount = 0;
        if (entryType === 'Loan' || entryType === 'Transfer') {
          amount = parseFloat(entry.amount) || 0;
        } else if (entryType === 'Refund') {
          amount = -(parseFloat(entry.loan_refund_amount) || 0);
        }

        const dateStr = entry.timestamp || entry.createdAt || entry.created_at || entry.date || '';
        const entryNo = entry.entry_no || 0;
        const formattedDate = dateStr ? formatDateOnly(dateStr) : '';

        let prefix = 'LN';
        if (entryType === 'Refund') {
          prefix = 'RF';
        } else if (entryType === 'Transfer') {
          prefix = 'TF';
        }
        const ref = `${prefix} - ${formattedDate} - ${entryNo}`;

        // Get transfer destination for Transfer type
        const transferTo = entryType === 'Transfer' && entry.to_purpose_id
          ? getPurposeName(entry.to_purpose_id)
          : '';

        const attachmentUrl = resolveAttachmentForEntry(entry);
        const enrichedEntry = attachmentUrl ? { ...entry, file_url: attachmentUrl } : entry;

        return {
          id: enrichedEntry.loanPortalId || enrichedEntry.id || `${enrichedEntry.entry_no}-${enrichedEntry.date}`,
          ref,
          associateName,
          purposeName,
          transferTo,
          timestamp: dateStr,
          type: entryType,
          paymentMode: enrichedEntry.loan_payment_mode || '',
          amount,
          attachmentUrl,
          entry: enrichedEntry,
        };
      })
      .sort((a, b) => {
        const noA = a.entry.entry_no || 0;
        const noB = b.entry.entry_no || 0;
        return noB - noA;
      });
  };

  const transformed = transformEntries();

  const filtered = (() => {
    let result = transformed;
    if (typeFilter) {
      result = result.filter((item) => (item.type || '').toLowerCase() === typeFilter.toLowerCase());
    }
    if (associateFilter) {
      result = result.filter((item) => {
        const associateName = item.associateName || '';
        return associateName.toLowerCase() === associateFilter.toLowerCase();
      });
    }
    if (entryNoFilter) {
      result = result.filter((item) => {
        const entryNo = String(item.entry.entry_no || '');
        return entryNo === entryNoFilter;
      });
    }
    if (purposeFilter) {
      result = result.filter((item) => {
        const purposeName = item.purposeName || '';
        return purposeName.toLowerCase() === purposeFilter.toLowerCase();
      });
    }
    if (paymentModeFilter) {
      result = result.filter((item) => {
        const paymentMode = item.paymentMode || '';
        return paymentMode.toLowerCase() === paymentModeFilter.toLowerCase();
      });
    }
    return result;
  })();

  const getPaymentModeBadgeClass = (mode) => {
    if (!mode || mode === '') return 'bg-gray-100 text-gray-600';
    const m = String(mode).toLowerCase();
    if (m === 'cash') return 'bg-[#E7F4FD] text-[#336EA8]';
    return 'bg-[#FFEFFF] text-[#815182]';
  };

  const combinedAssociateOptions = [
    ...vendorOptions.map(opt => opt.label),
    ...contractorOptions.map(opt => opt.label),
    ...employeeOptions.map(opt => opt.label),
    ...labourOptions.map(opt => opt.label)
  ];

  const canEdit = modulePermissions.includes('Edit');
  const canDelete = modulePermissions.includes('Delete');
  const minSwipeDistance = 50;
  const swipeActionWidth = 110;

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    fetchUserModulePermissions(stored?.userRoles || user?.userRoles || [], 'Loan Portal')
      .then(setModulePermissions)
      .catch(() => setModulePermissions([]));
  }, [user]);

  const getEditedByUsername = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      return user?.username || user?.name || stored?.username || stored?.name || 'mobile';
    } catch {
      return user?.username || user?.name || 'mobile';
    }
  };

  const handleTouchStart = (e, cardId) => {
    const touch = e.touches ? e.touches[0] : e;
    setSwipeStates((prev) => ({
      ...prev,
      [cardId]: {
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        isSwiping: false,
        wasExpanded: expandedCardId === cardId,
      },
    }));
  };

  const handleTouchMove = (e, cardId) => {
    const touch = e.touches ? e.touches[0] : e;
    const state = swipeStates[cardId];
    if (!state) return;
    const deltaX = touch.clientX - state.startX;
    const deltaY = touch.clientY - state.startY;
    if (Math.abs(deltaX) <= Math.abs(deltaY)) {
      setSwipeStates((prev) => {
        const next = { ...prev };
        delete next[cardId];
        return next;
      });
      return;
    }
    const isExpanded = expandedCardId === cardId;
    if (deltaX < 0 || (isExpanded && deltaX > 0)) {
      if (e.cancelable) e.preventDefault();
      setSwipeStates((prev) => ({
        ...prev,
        [cardId]: {
          ...prev[cardId],
          currentX: touch.clientX,
          currentY: touch.clientY,
          isSwiping: true,
        },
      }));
    }
  };

  const handleTouchEnd = (cardId) => {
    const state = swipeStates[cardId];
    if (!state) return;
    const deltaX = state.currentX - state.startX;
    const wasExpanded = state.wasExpanded || false;
    if (Math.abs(deltaX) >= minSwipeDistance) {
      if (deltaX < 0) {
        setExpandedCardId(cardId);
      } else if (wasExpanded) {
        setExpandedCardId(null);
      }
    }
    setSwipeStates((prev) => {
      const next = { ...prev };
      delete next[cardId];
      return next;
    });
  };

  const handleEdit = (item) => {
    if (!canEdit) {
      toast.error("You don't have permission to edit.", {
        position: 'top-center',
        autoClose: 3000,
        theme: 'colored',
      });
      return;
    }
    const entry = item.entry || {};
    const payload = {
      ...entry,
      loanPortalId: getEntryLoanId(entry),
      associateName: item.associateName,
      purposeName: item.purposeName,
      isEditMode: true,
    };
    localStorage.setItem('editingLoanEntry', JSON.stringify(payload));
    localStorage.setItem('loanPortalActiveTab', 'loanform');
    window.dispatchEvent(new CustomEvent('editLoanEntry', { detail: payload }));
    setExpandedCardId(null);
  };

  const handleDelete = (item) => {
    if (!canDelete) {
      toast.error("You don't have permission to delete.", {
        position: 'top-center',
        autoClose: 3000,
        theme: 'colored',
      });
      return;
    }
    setLoanToDelete(item);
    setShowDeleteConfirm(true);
    setExpandedCardId(null);
  };

  const confirmDelete = async () => {
    if (!loanToDelete?.entry) {
      setShowDeleteConfirm(false);
      setLoanToDelete(null);
      return;
    }
    const record = loanToDelete.entry;
    const idToDelete = getEntryLoanId(record);
    if (!idToDelete) return;
    try {
      const entryNo = record.entry_no;
      const username = encodeURIComponent(getEditedByUsername());
      const clearedData = {
        loanPortalId: idToDelete,
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
        entry_no: entryNo,
        description: '',
      };
      if (record.type === 'Transfer') {
        const transferRecords = loanData.filter((r) => r.entry_no === entryNo);
        await Promise.all(
          transferRecords.map(async (rec) => {
            const transferId = getEntryLoanId(rec);
            const res = await fetch(
              `https://backendaab.in/aabuildersDash/api/loans/${transferId}?editedBy=${username}`,
              {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  ...clearedData,
                  loanPortalId: transferId,
                  date: rec.date,
                }),
              }
            );
            if (!res.ok) throw new Error('Failed to delete transfer entry');
          })
        );
      } else {
        const res = await fetch(
          `https://backendaab.in/aabuildersDash/api/loans/${idToDelete}?editedBy=${username}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(clearedData),
          }
        );
        if (!res.ok) throw new Error('Failed to delete loan entry');
      }
      toast.success('Loan entry deleted successfully!', {
        position: 'top-center',
        autoClose: 3000,
        theme: 'colored',
      });
      setShowDeleteConfirm(false);
      setLoanToDelete(null);
      window.dispatchEvent(new Event('loanUpdated'));
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete loan entry!', {
        position: 'top-center',
        autoClose: 3000,
        theme: 'colored',
      });
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setLoanToDelete(null);
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      setSwipeStates((prev) => {
        let changed = false;
        const next = { ...prev };
        filtered.forEach((item) => {
          const state = prev[item.id];
          if (!state) return;
          const deltaX = e.clientX - state.startX;
          const deltaY = Math.abs(e.clientY - (state.startY || 0));
          if (Math.abs(deltaX) <= deltaY) return;
          const isExpanded = expandedCardId === item.id;
          if (deltaX < 0 || (isExpanded && deltaX > 0)) {
            next[item.id] = {
              ...state,
              currentX: e.clientX,
              currentY: e.clientY,
              isSwiping: true,
            };
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    };

    const onMouseUp = () => {
      setSwipeStates((prev) => {
        const next = { ...prev };
        filtered.forEach((item) => {
          const state = prev[item.id];
          if (!state) return;
          const deltaX = state.currentX - state.startX;
          const wasExpanded = state.wasExpanded || false;
          if (Math.abs(deltaX) >= minSwipeDistance) {
            if (deltaX < 0) setExpandedCardId(item.id);
            else if (wasExpanded) setExpandedCardId(null);
          }
          delete next[item.id];
        });
        return next;
      });
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [filtered, expandedCardId, minSwipeDistance]);

  return (
    <div
      className="relative w-full bg-white max-w-[360px] mx-auto flex flex-col scrollbar-none overflow-hidden"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {/* Date and Category Section */}
      <div className="">
        <div className="flex-shrink-0 flex mb-[8px] items-center border-b border-[#E0E0E0] justify-between pt-[8px] pb-[8px]">
          <div />
          <div className="flex items-center gap-[8px]">
            <button
              type="button"
              onClick={() => setShowTypeModal(true)}
              className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:underline p-0 border-0 bg-transparent"
            >
              {typeFilter || 'Type'}
            </button>
            {typeFilter && (
              <button
                type="button"
                onClick={() => setTypeFilter('')}
                className="w-4 h-4 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Filter */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between gap-[20px]">
          <div className="flex items-center gap-[4px] min-w-0">
            <button
              type="button"
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-[4px] px-[6px] py-[2px] flex-shrink-0"
            >
              <img src={Filter} alt="Filter" className="w-[11px] h-[11px]" />
              {!(typeFilter || associateFilter || entryNoFilter || purposeFilter || paymentModeFilter) && (
                <span className="text-[13px] font-semibold flex-shrink-0 text-[#9E9E9E]">
                  Filter
                </span>
              )}
            </button>
            {/* Active Filter Tags */}
            <div className="flex items-center gap-[4px] overflow-x-auto no-scrollbar scrollbar-none min-w-0 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {typeFilter && (
                <div className="flex items-center gap-[6px] border px-[6px] py-[2px] rounded-full flex-shrink-0">
                  <span className="text-[11px] font-medium text-black">{typeFilter}</span>
                  <button
                    onClick={() => setTypeFilter('')}
                    className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
              {associateFilter && (
                <div className="flex items-center gap-[6px] border px-[6px] py-[2px] rounded-full flex-shrink-0">
                  <span className="text-[11px] font-medium text-black">Associate</span>
                  <button
                    onClick={() => setAssociateFilter('')}
                    className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
              {entryNoFilter && (
                <div className="flex items-center gap-[6px] border px-[6px] py-[2px] rounded-full flex-shrink-0">
                  <span className="text-[11px] font-medium text-black">Entry. No</span>
                  <button
                    onClick={() => setEntryNoFilter('')}
                    className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
              {purposeFilter && (
                <div className="flex items-center gap-[6px] border px-[6px] py-[2px] rounded-full flex-shrink-0">
                  <span className="text-[11px] font-medium text-black">Purpose</span>
                  <button
                    onClick={() => setPurposeFilter('')}
                    className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
              {paymentModeFilter && (
                <div className="flex items-center gap-[6px] border px-[6px] py-[2px] rounded-full flex-shrink-0">
                  <span className="text-[11px] font-medium text-black">Mode</span>
                  <button
                    onClick={() => setPaymentModeFilter('')}
                    className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          {(typeFilter || associateFilter || entryNoFilter || purposeFilter || paymentModeFilter) && (
            <button
              onClick={() => {
                setTypeFilter('');
                setAssociateFilter('');
                setEntryNoFilter('');
                setPurposeFilter('');
                setPaymentModeFilter('');
              }}
              className="text-[13px] font-semibold hover:text-black transition-colors flex-shrink-0 text-[#9E9E9E]"
            >
              x
            </button>
          )}
        </div>
      </div>
      {/* Cards List - Scrollable */}
      <div
        className="overflow-y-auto no-scrollbar scrollbar-none scrollbar-hide mt-1 max-h-[calc(100vh-160px-80px)]"
        onClick={() => setExpandedCardId(null)}
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[48px]">
            <div className="w-[64px] h-[64px] rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 12H24M8 20H24M8 28H24"
                  stroke="#9E9E9E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="text-[14px] font-medium text-[#9E9E9E] text-center mt-4">
              No loan records found
            </p>
          </div>
        ) : (
          <div className="">
            {filtered.map((item) => {
              const isExpanded = expandedCardId === item.id;
              const swipeState = swipeStates[item.id];
              let swipeOffset = 0;
              if (swipeState?.isSwiping) {
                const deltaX = swipeState.currentX - swipeState.startX;
                if (deltaX < 0) {
                  swipeOffset = Math.max(-swipeActionWidth, deltaX);
                } else if (isExpanded) {
                  swipeOffset = Math.max(-swipeActionWidth, Math.min(0, -swipeActionWidth + deltaX));
                }
              } else if (isExpanded) {
                swipeOffset = -swipeActionWidth;
              }

              return (
                <div
                  key={item.id}
                  className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[8px] min-w-[330px]"
                  style={{
                    height: '95px',
                    userSelect: swipeState?.isSwiping ? 'none' : 'auto',
                  }}
                >
                  <div
                    ref={(el) => {
                      if (el) cardRefs.current[item.id] = el;
                      else delete cardRefs.current[item.id];
                    }}
                    className="flex-1 bg-white rounded-[8px] h-full px-[12px] py-[12px] transition-all duration-300 ease-out"
                    style={{
                      transform: `translateX(${swipeOffset}px)`,
                      touchAction: 'pan-y',
                      willChange: 'transform',
                    }}
                    onTouchStart={(e) => handleTouchStart(e, item.id)}
                    onTouchMove={(e) => handleTouchMove(e, item.id)}
                    onTouchEnd={() => handleTouchEnd(item.id)}
                    onMouseDown={(e) => handleTouchStart(e, item.id)}
                    onClick={(e) => {
                      if (!isExpanded) e.stopPropagation();
                    }}
                  >
                    <div className="flex flex-col gap-[2px]">
                      {/* Row 1: ref and payment mode */}
                      <div className="flex items-center justify-between">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            const desc = item.entry?.description || '';
                            if (desc) {
                              setSelectedDescription(desc);
                              setShowDescriptionModal(true);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              const desc = item.entry?.description || '';
                              if (desc) {
                                setSelectedDescription(desc);
                                setShowDescriptionModal(true);
                              }
                            }
                          }}
                          className={`text-[12px] font-semibold text-black leading-snug ${item.entry?.description ? 'cursor-pointer hover:underline' : ''}`}
                        >
                          {item.ref}
                        </span>
                        <span
                          className={`px-[8px] py-[2px] rounded-full text-[10px] font-medium flex items-center gap-[4px] ${getPaymentModeBadgeClass(
                            item.type === 'Transfer' && !item.paymentMode ? 'Online' : (item.paymentMode || '')
                          )}`}
                        >
                          {item.type === 'Transfer' && !item.paymentMode ? 'Online' : (item.paymentMode || '')}
                        </span>
                      </div>
                      {/* Row 2: associateName */}
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const entry = item.entry || {};
                            const prefill = {
                              vendor_id: entry.vendor_id ?? entry.vendorId ?? 0,
                              contractor_id: entry.contractor_id ?? entry.contractorId ?? 0,
                              employee_id: entry.employee_id ?? entry.employeeId ?? 0,
                              labour_id: entry.labour_id ?? entry.labourId ?? 0,
                              associateName: item.associateName || '',
                              from_purpose_id: entry.from_purpose_id ?? entry.fromPurposeId ?? 0,
                            };
                            localStorage.setItem('loanFormPrefill', JSON.stringify(prefill));
                            localStorage.setItem('loanPortalActiveTab', 'loanform');
                            window.dispatchEvent(new Event('editLoanEntry'));
                          }}
                          className="text-[12px] font-semibold text-black leading-snug break-words text-left cursor-pointer hover:underline focus:outline-none focus:underline"
                          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                        >
                          {item.associateName || 'N/A'}
                        </button>
                        <span></span>
                      </div>
                      {/* Row 3: purposeName and amount */}
                      <div className="flex items-center justify-between">
                        <p
                          className="text-[11px] font-medium text-[#777777] leading-snug break-words"
                          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                        >
                          {item.purposeName || 'N/A'}
                        </p>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAmountFileClick(item.entry, item.attachmentUrl);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAmountFileClick(item.entry, item.attachmentUrl);
                            }
                          }}
                          className={`text-[12px] font-semibold block leading-snug cursor-pointer hover:underline focus:outline-none focus:underline ${item.amount < 0 ? 'text-[#E4572E]' : 'text-[#007233]'}`}
                        >
                          {item.amount < 0 ? '-' : ''}₹{Math.abs(item.amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      {/* Row 4: timestamp and transferTo */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-[#777777] leading-snug">
                          {formatDateTime(item.timestamp)}
                        </span>
                        {item.type === 'Transfer' && item.transferTo && (
                          <p className={`text-[10px] font-semibold leading-snug ${item.amount < 0 ? 'text-[#BF9853]' : 'text-[#007233]'}`}>
                            {item.transferTo}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Edit / Delete - revealed on swipe left */}
                  <div
                    className="absolute right-0 top-0 flex gap-[8px] flex-shrink-0 z-0"
                    style={{
                      opacity: isExpanded || (swipeState?.isSwiping && swipeOffset < -20) ? 1 : 0,
                      transform:
                        swipeOffset < 0
                          ? `translateX(${Math.max(0, swipeActionWidth + swipeOffset)}px)`
                          : `translateX(${swipeActionWidth}px)`,
                      transition: swipeState?.isSwiping ? 'none' : 'opacity 0.2s ease-out, transform 0.3s ease-out',
                      pointerEvents: isExpanded ? 'auto' : 'none',
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                      disabled={!canEdit}
                      className={`w-[48px] h-[95px] bg-[#007233] rounded-[6px] flex items-center justify-center transition-colors shadow-sm ${
                        !canEdit ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#22a882]'
                      }`}
                      title="Edit"
                    >
                      <img src={Edit} alt="Edit" className="w-[18px] h-[18px]" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item);
                      }}
                      disabled={!canDelete}
                      className={`w-[48px] h-[95px] bg-[#E4572E] rounded-[6px] flex items-center justify-center transition-colors shadow-sm ${
                        !canDelete ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#cc4d26]'
                      }`}
                      title="Delete"
                    >
                      <img src={Delete} alt="Delete" className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
      {/* Select Type Modal */}
      {showTypeModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-[16px]"
          onClick={() => {
            setShowTypeModal(false);
            setTypeSearchQuery('');
          }}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div
            className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] -translate-y-[22px] rounded-b-[20px] shadow-lg flex flex-col transform max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-[24px] pt-[20px]">
              <p className="text-[16px] font-semibold text-black">Select Type</p>
              <button
                onClick={() => {
                  setShowTypeModal(false);
                  setTypeSearchQuery('');
                }}
                className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity"
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L10 10M10 1L1 10" stroke="#e4572e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="px-[24px] pt-[4px] pb-[6px]">
              <div className="relative">
                <input
                  type="text"
                  value={typeSearchQuery}
                  onChange={(e) => setTypeSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full h-[32px] pl-[40px] pr-[16px] border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
                  autoFocus
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="6.5" cy="6.5" r="5.5" stroke="#747474" strokeWidth="1.5" />
                    <path d="M9.5 9.5L12 12" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>
            <div
              className="flex-1 overflow-y-auto mb-[8px] px-[24px] min-h-[65vh] [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
            >
              <div className="shadow-md rounded-lg overflow-hidden">
                {(['Loan', 'Refund', 'Transfer']
                  .filter(type => type.toLowerCase().includes(typeSearchQuery.toLowerCase()))
                  .map((type, index) => {
                    const isSelected = typeFilter === type;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setTypeFilter(typeFilter === type ? '' : type);
                          setShowTypeModal(false);
                          setTypeSearchQuery('');
                        }}
                        className={`w-full h-[40px] px-[24px] flex items-center justify-between transition-colors ${isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'
                          }`}
                      >
                        <div className="flex items-center gap-[12px] flex-1 min-w-0">
                          <p className="text-[14px] font-medium text-black text-left truncate">{type}</p>
                        </div>
                        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 ml-3">
                          {isSelected ? (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="10" cy="10" r="9" stroke="#e4572e" strokeWidth="2" fill="none" />
                              <circle cx="10" cy="10" r="4" fill="#e4572e" />
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="10" cy="10" r="9" stroke="#9E9E9E" strokeWidth="1.5" fill="none" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  }))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40"
          onClick={() => setShowFilterModal(false)}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div
            className="bg-white rounded-t-2xl w-full h-[220px] p-[16px] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[16px] font-semibold text-black">Select Filters</p>
              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="w-6 h-6 flex items-center justify-center"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5L15 15" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-[2fr_1fr] gap-[16px] mb-3">
              {/* Associate Filter */}
              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Associate</p>
                <div className="relative">
                  <div
                    onClick={() => setShowAssociateModal(true)}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                    style={{ boxSizing: 'border-box', color: associateFilter ? '#000' : '#9E9E9E' }}
                  >
                    {associateFilter || 'Select'}
                    {associateFilter ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssociateFilter('');
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                      </button>
                    ) : (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Entry. No Filter */}
              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Entry. No</p>
                <div className="relative">
                  <div
                    onClick={() => setShowEntryNoModal(true)}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                    style={{ boxSizing: 'border-box', color: entryNoFilter ? '#000' : '#9E9E9E' }}
                  >
                    {entryNoFilter || 'Select'}
                    {entryNoFilter ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEntryNoFilter('');
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                      </button>
                    ) : (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Purpose Filter */}
              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Purpose</p>
                <div className="relative">
                  <div
                    onClick={() => setShowPurposeModal(true)}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                    style={{ boxSizing: 'border-box', color: purposeFilter ? '#000' : '#9E9E9E' }}
                  >
                    {purposeFilter || 'Select'}
                    {purposeFilter ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPurposeFilter('');
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                      </button>
                    ) : (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Mode Filter */}
              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Mode</p>
                <div className="relative">
                  <div
                    onClick={() => setShowPaymentModeModal(true)}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                    style={{ boxSizing: 'border-box', color: paymentModeFilter ? '#000' : '#9E9E9E' }}
                  >
                    {paymentModeFilter || 'Select'}
                    {paymentModeFilter ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPaymentModeFilter('');
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                      </button>
                    ) : (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Associate Modal */}
      <SelectVendorModal
        isOpen={showAssociateModal}
        onClose={() => setShowAssociateModal(false)}
        onSelect={(value) => {
          setAssociateFilter(value);
          setShowAssociateModal(false);
        }}
        selectedValue={associateFilter}
        options={combinedAssociateOptions}
        fieldName="Associate"
        showStarIcon={false}
      />

      {/* Entry No Modal */}
      <SelectVendorModal
        isOpen={showEntryNoModal}
        onClose={() => setShowEntryNoModal(false)}
        onSelect={(value) => {
          setEntryNoFilter(value);
          setShowEntryNoModal(false);
        }}
        selectedValue={entryNoFilter}
        options={[...new Set(transformed.map((item) => String(item.entry.entry_no || '')))].sort((a, b) => Number(b) - Number(a))}
        fieldName="Entry. No"
        showStarIcon={false}
      />

      {/* Purpose Modal */}
      <SelectVendorModal
        isOpen={showPurposeModal}
        onClose={() => setShowPurposeModal(false)}
        onSelect={(value) => {
          setPurposeFilter(value);
          setShowPurposeModal(false);
        }}
        selectedValue={purposeFilter}
        options={purposeOptions.map(opt => opt.label)}
        fieldName="Purpose"
        showStarIcon={false}
      />

      {/* Payment Mode Modal */}
      <SelectVendorModal
        isOpen={showPaymentModeModal}
        onClose={() => setShowPaymentModeModal(false)}
        onSelect={(value) => {
          setPaymentModeFilter(value);
          setShowPaymentModeModal(false);
        }}
        selectedValue={paymentModeFilter}
        options={paymentModeFilterOptions}
        fieldName="Mode"
        showStarIcon={false}
      />

      {/* Attached file preview (amount tap) */}
      {showFilePreviewModal && (
        <div
          className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-[16px]"
          onClick={closeFilePreviewModal}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div
            className="relative bg-white rounded-[12px] w-full max-w-[320px] max-h-[75vh] flex flex-col overflow-hidden shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeFilePreviewModal}
              className="absolute top-[10px] right-[10px] z-10 w-[28px] h-[28px] flex items-center justify-center"
              aria-label="Close preview"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="#E4572E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="flex-1 overflow-auto bg-white p-[12px] pt-[40px] min-h-[120px] flex items-center justify-center">
              {filePreviewLoading ? (
                <p className="text-[12px] font-medium text-[#777777]">Loading attachment…</p>
              ) : previewFileUrl ? (
                isPdfPreview(previewFileUrl) ? (
                  <iframe
                    src={`${previewFileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    title="Attachment preview"
                    className="w-full min-h-[50vh] border-0"
                  />
                ) : (
                  <img
                    src={previewFileUrl}
                    alt="Attachment preview"
                    className="w-full h-auto object-contain"
                  />
                )
              ) : (
                <p className="text-[12px] font-medium text-[#777777] text-center px-[8px]">
                  No attachment found for this entry.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={3000} theme="colored" />

      {/* Description Modal */}
      {showDescriptionModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-[16px]"
          onClick={() => setShowDescriptionModal(false)}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div
            className="bg-white w-full max-w-[320px] rounded-[12px] p-[20px] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <img src={Pen} alt="Pen" className="w-[74px] h-[74px]" />
            </div>
            <h3 className="text-[18px] font-bold text-gray-500 text-center mb-4">Description!</h3>
            <p className="text-[11px] font-medium text-black text-center mb-6 leading-relaxed">
              {selectedDescription}
            </p>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowDescriptionModal(false)}
                className="px-[32px] py-[8px] bg-black text-white text-[14px] font-semibold rounded-[8px] hover:opacity-90 transition-opacity"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
