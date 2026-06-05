import React, { useState, useEffect, useCallback, useRef } from 'react';
import Filter from '../Images/Filter.png';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';
import UploadFile from '../Images/Upload Small.svg';
import Pen from '../Images/Pen.svg';
import CloseIcon from '../Images/Close F.svg'
import DeleteConfirmModal from '../PurchaseOrder/DeleteConfirmModal';
import Edit from '../Images/edit1.png'
import Delete from '../Images/delete.png'
import { fetchUserModulePermissions } from '../utils/fetchUserModulePermissions';

// ISO 8601 week helpers (same as AdvanceReport.js)
const getISOWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayOfWeek = d.getDay() || 7;
  const thursday = new Date(d);
  thursday.setDate(d.getDate() + 4 - dayOfWeek);
  thursday.setHours(0, 0, 0, 0);
  const weekYear = thursday.getFullYear();
  const jan1 = new Date(weekYear, 0, 1);
  jan1.setHours(0, 0, 0, 0);
  const jan1DayOfWeek = jan1.getDay() || 7;
  const firstThursday = new Date(jan1);
  firstThursday.setDate(jan1.getDate() + 4 - jan1DayOfWeek);
  firstThursday.setHours(0, 0, 0, 0);
  const daysDiff = Math.floor((thursday - firstThursday) / 86400000);
  return Math.floor(daysDiff / 7) + 1;
};

const getWeekYear = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayOfWeek = d.getDay() || 7;
  const thursday = new Date(d);
  thursday.setDate(d.getDate() + 4 - dayOfWeek);
  return thursday.getFullYear();
};

const getCurrentWeekNumber = () => getISOWeekNumber(new Date());
const getCurrentWeekYear = () => getWeekYear(new Date());

// Get Monday of a given ISO week number and year
const getMondayOfISOWeek = (weekNum, yearNum) => {
  const jan4 = new Date(yearNum, 0, 4);
  jan4.setHours(0, 0, 0, 0);
  const jan4Day = jan4.getDay() || 7;
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - jan4Day + 1 + (weekNum - 1) * 7);
  return monday.toISOString().slice(0, 10);
};

const PREDEFINED_SITE_OPTIONS = [
  { value: 'Mason Advance', label: 'Mason Advance', id: 1, sNo: '1' },
  { value: 'Material Advance', label: 'Material Advance', id: 2, sNo: '2' },
  { value: 'Weekly Advance', label: 'Weekly Advance', id: 3, sNo: '3' },
  { value: 'Excess Advance', label: 'Excess Advance', id: 4, sNo: '4' },
  { value: 'Material Rent', label: 'Material Rent', id: 5, sNo: '5' },
  { value: 'Subhash Kumar - Kunnur', label: 'Subhash Kumar - Kunnur', id: 6, sNo: '6' },
  { value: 'Summary Bill', label: 'Summary Bill', id: 7, sNo: '7' },
  { value: 'Daily Wage', label: 'Daily Wage', id: 8, sNo: '8' },
  { value: 'Rent Management Portal', label: 'Rent Management Portal', id: 9, sNo: '9' },
  { value: 'Multi-Project Batch', label: 'Multi-Project Batch', id: 10, sNo: '10' },
  { value: 'Loan Portal', label: 'Loan Portal', id: 11, sNo: '11' },
  { value: 'Bill Payment Tracker', label: 'Bill Payment Tracker', id: 12, sNo: '12' },
];

const History = ({ onVendorClick, user } = {}) => {
  const resolveActiveBranchId = () => {
    try {
      const selectedBranchId = localStorage.getItem('selectedBranchId');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
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
    if (activeBranchId !== null && activeBranchId !== undefined && activeBranchId !== '') {
      url.searchParams.set('branchId', String(activeBranchId));
    }
    return url.toString();
  };

  const [advanceData, setAdvanceData] = useState([]);

  // Resolve module permissions from user's roles (used to block History "upload/update" actions).
  const [modulePermissions, setModulePermissions] = useState([]);
  useEffect(() => {
    const moduleName = 'Advance Portal';
    const resolvedUserRoles =
      user?.userRoles ||
      (() => {
        try {
          const stored = JSON.parse(localStorage.getItem('user') || '{}');
          return stored?.userRoles || [];
        } catch {
          return [];
        }
      })();

    fetchUserModulePermissions(resolvedUserRoles, moduleName)
      .then(setModulePermissions)
      .catch(() => setModulePermissions([]));
  }, [user?.userRoles]);

  const canEdit = modulePermissions.includes('Edit');
  const canDelete = modulePermissions.includes('Delete');

  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([...PREDEFINED_SITE_OPTIONS]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [typeSearchQuery, setTypeSearchQuery] = useState('');
  const [week, setWeek] = useState(() => String(getCurrentWeekNumber()).padStart(2, '0'));
  const [year, setYear] = useState(() => String(getCurrentWeekYear()));
  const [showWeekYearModal, setShowWeekYearModal] = useState(false);
  const [modalWeek, setModalWeek] = useState('');
  const [modalYear, setModalYear] = useState('');
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [vendorContractorFilter, setVendorContractorFilter] = useState('');
  const [entryNoFilter, setEntryNoFilter] = useState('');
  const [projectNameFilter, setProjectNameFilter] = useState('');
  const [paymentModeFilter, setPaymentModeFilter] = useState('');
  const [showVendorContractorModal, setShowVendorContractorModal] = useState(false);
  const [showEntryNoModal, setShowEntryNoModal] = useState(false);
  const [showProjectNameModal, setShowProjectNameModal] = useState(false);
  const [showPaymentModeModal, setShowPaymentModeModal] = useState(false);

  // Swipe-to-upload: same as PO History Clone - right swipe reveals upload button on left
  const [swipeStates, setSwipeStates] = useState({});
  const [uploadExpandedId, setUploadExpandedId] = useState(null);
  const [editDeleteExpandedId, setEditDeleteExpandedId] = useState(null);
  const [uploadingForId, setUploadingForId] = useState(null);
  const [showUploadConfirmModal, setShowUploadConfirmModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null); // 'uploading' | 'completed'
  const [itemToUploadFor, setItemToUploadFor] = useState(null);
  const cardRefs = useRef({});
  const fileInputRef = useRef(null);
  const uploadExpandedIdRef = useRef(uploadExpandedId);
  const editDeleteExpandedIdRef = useRef(editDeleteExpandedId);

  const weekNum = week ? parseInt(week, 10) : null;
  const yearNum = year ? parseInt(year, 10) : null;

  useEffect(() => {
    uploadExpandedIdRef.current = uploadExpandedId;
  }, [uploadExpandedId]);
  useEffect(() => {
    editDeleteExpandedIdRef.current = editDeleteExpandedId;
  }, [editDeleteExpandedId]);

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

  const fetchVendors = async () => {
    try {
      const res = await fetch('https://backendaab.in/demoAabuilderDash/api/vendor_Names/getAll');
      if (res.ok) {
        const data = await res.json();
        setVendorOptions(data.map((item) => ({ id: item.id, label: item.vendorName })));
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  };

  const fetchContractors = async () => {
    try {
      const res = await fetch('https://backendaab.in/demoAabuilderDash/api/contractor_Names/getAll');
      if (res.ok) {
        const data = await res.json();
        setContractorOptions(data.map((item) => ({ id: item.id, label: item.contractorName })));
      }
    } catch (err) {
      console.error('Error fetching contractors:', err);
    }
  };

  const fetchSites = async () => {
    try {
      const res = await fetch('https://backendaab.in/demoAabuilderDash/api/project_Names/getAll');
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((item) => ({
          value: item.siteName,
          label: item.siteName,
          id: item.id,
          sNo: item.siteNo,
        }));
        setSiteOptions([...PREDEFINED_SITE_OPTIONS, ...formatted]);
      }
    } catch (err) {
      console.error('Error fetching sites:', err);
      setSiteOptions([...PREDEFINED_SITE_OPTIONS]);
    }
  };

  const hasActiveFilters = !!(typeFilter || vendorContractorFilter || entryNoFilter || projectNameFilter || paymentModeFilter || searchQuery);

  const loadAdvanceData = useCallback(async () => {
    try {
      const endpoint = hasActiveFilters
        ? 'https://backendaab.in/demoAabuildersDash/api/advance_portal/getAll'
        : 'https://backendaab.in/demoAabuildersDash/api/advance_portal/getLast150';
      const res = await fetch(withBranchUrl(endpoint));
      if (!res.ok) throw new Error('Failed to fetch advance data');
      const data = await res.json();
      setAdvanceData(data);
    } catch (err) {
      console.error('Error loading advance data:', err);
    }
  }, [activeBranchId, hasActiveFilters]);

  useEffect(() => {
    fetchVendors();
    fetchContractors();
    fetchSites();
  }, []);

  useEffect(() => {
    loadAdvanceData();
    const handleAdvanceUpdate = () => loadAdvanceData();
    window.addEventListener('advanceUpdated', handleAdvanceUpdate);
    return () => window.removeEventListener('advanceUpdated', handleAdvanceUpdate);
  }, [loadAdvanceData]);

  const getVendorName = (vendorId) => {
    const v = vendorOptions.find((x) => x.id === vendorId);
    return v?.label || '';
  };
  const getContractorName = (contractorId) => {
    const c = contractorOptions.find((x) => x.id === contractorId);
    return c?.label || '';
  };
  const getProjectName = (projectId) => {
    const s = siteOptions.find((x) => x.id === projectId);
    return s?.label || s?.value || '';
  };

  // Parse date from API (same as AdvanceReport: supports ISO or DD/MM/YYYY)
  const parseItemDate = (item) => {
    const raw = item.date || item.timestamp || item.createdAt || item.created_at || '';
    if (!raw) return null;
    const s = String(raw).trim();
    const ddmmyy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyy) {
      const [, dd, mm, yyyy] = ddmmyy;
      const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      return isNaN(d.getTime()) ? new Date(s) : d;
    }
    const parsed = new Date(s);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const transformEntries = () => {
    return advanceData
      .map((entry) => {
        const vendorName = getVendorName(entry.vendor_id);
        const contractorName = getContractorName(entry.contractor_id);
        const entityName = vendorName || contractorName || entry.contractor_vendor || '';
        const projectName = getProjectName(entry.project_id) || entry.project_name || '';

        let amount = 0;
        const t = entry.type || '';
        if (t === 'Refund') {
          amount = -(parseFloat(entry.refund_amount) || 0);
        } else if (t === 'Bill Settlement') {
          amount = parseFloat(entry.bill_amount) || 0;
        } else {
          amount = parseFloat(entry.amount) || 0;
        }

        const dateStr = entry.timestamp || entry.createdAt || entry.created_at || '';
        const entryNo = entry.entry_no || 0;
        const year = dateStr ? new Date(dateStr).getFullYear() : new Date().getFullYear();
        let prefix = 'AD';
        if (t === 'Bill Settlement') {
          prefix = 'BS';
        } else if (t === 'Transfer') {
          prefix = 'TF';
        } else if (t === 'Refund') {
          prefix = 'RF';
        }
        const ref = `${prefix} - ${year} - ${entryNo}`;

        // Get transfer site name for Transfer type
        const transferSiteName = t === 'Transfer' && entry.transfer_site_id
          ? getProjectName(entry.transfer_site_id) || ''
          : '';

        return {
          id: entry.advancePortalId || entry.id || `${entry.entry_no}-${entry.date}`,
          ref,
          entityName,
          projectName,
          transferSiteName,
          timestamp: dateStr,
          type: t || 'Advance',
          paymentMode: entry.payment_mode || '',
          amount,
          entry,
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
    if (searchQuery) {
      result = result.filter(
        (item) =>
          (item.entityName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.projectName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.ref || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.type || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (typeFilter) {
      result = result.filter((item) => (item.type || '').toLowerCase() === typeFilter.toLowerCase());
    }
    if (vendorContractorFilter) {
      result = result.filter((item) => {
        const entityName = item.entityName || '';
        return entityName.toLowerCase() === vendorContractorFilter.toLowerCase();
      });
    }
    if (entryNoFilter) {
      result = result.filter((item) => {
        const entryNo = String(item.entry.entry_no || '');
        return entryNo === entryNoFilter;
      });
    }
    if (projectNameFilter) {
      result = result.filter((item) => {
        const projectName = item.projectName || '';
        return projectName.toLowerCase() === projectNameFilter.toLowerCase();
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

  const openWeekYearModal = () => {
    setModalWeek(week || String(getCurrentWeekNumber()).padStart(2, '0'));
    setModalYear(year || String(getCurrentWeekYear()));
    setShowWeekYearModal(true);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 12 }, (_, i) => currentYear - 5 + i);
  const weeks = Array.from({ length: 53 }, (_, i) => String(i + 1).padStart(2, '0'));

  const getVisibleWeeks = () => {
    const w = parseInt(modalWeek, 10) || 1;
    const prev = w <= 1 ? 53 : w - 1;
    const next = w >= 53 ? 1 : w + 1;
    return [prev, w, next].map((n) => String(n).padStart(2, '0'));
  };
  const getVisibleYears = () => {
    const y = parseInt(modalYear, 10) || currentYear;
    return [y - 1, y, y + 1];
  };
  const handleWeekWheel = (e, delta) => {
    e.preventDefault();
    const w = parseInt(modalWeek, 10) || 1;
    const next = delta > 0 ? (w >= 53 ? 1 : w + 1) : (w <= 1 ? 53 : w - 1);
    setModalWeek(String(next).padStart(2, '0'));
  };
  const handleYearWheel = (e, delta) => {
    e.preventDefault();
    const y = parseInt(modalYear, 10) || currentYear;
    setModalYear(String(y + (delta > 0 ? 1 : -1)));
  };
  const handleWeekYearOk = () => {
    const w = parseInt(modalWeek, 10);
    const y = parseInt(modalYear, 10);
    if (w >= 1 && w <= 53 && y) {
      setWeek(String(w).padStart(2, '0'));
      setYear(String(y));
    }
    setShowWeekYearModal(false);
  };

  // Swipe handlers - same pattern as PurchaseOrder History (Clone button on left, right swipe)
  const minSwipeDistance = 50;

  const handleUploadClick = (item) => {
    if (!canEdit) {
      alert("You don't have permission to edit.");
      return;
    }
    setItemToUploadFor(item);
    setShowUploadConfirmModal(true);
  };

  const handleUploadConfirm = () => {
    if (!canEdit) {
      setShowUploadConfirmModal(false);
      setItemToUploadFor(null);
      return;
    }
    if (!itemToUploadFor) return;
    setShowUploadConfirmModal(false);
    setUploadingForId(itemToUploadFor.id);
    setItemToUploadFor(null);
    setTimeout(() => fileInputRef.current?.click(), 100);
  };

  const handleUploadCancel = () => {
    setShowUploadConfirmModal(false);
    setItemToUploadFor(null);
  };

  const handleFileChange = async (e) => {
    const file = e.target?.files?.[0];
    e.target.value = '';
    if (!file || !uploadingForId) {
      setUploadingForId(null);
      return;
    }
    if (!canEdit) {
      alert("You don't have permission to edit.");
      setUploadingForId(null);
      return;
    }
    const item = filtered.find((i) => i.id === uploadingForId);
    if (!item) {
      setUploadingForId(null);
      return;
    }
    setUploadStatus('uploading');
    const entryId = item.entry?.advancePortalId || item.entry?.id || uploadingForId;
    try {
      const formData = new FormData();
      const now = new Date();
      const timestamp = now.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).replace(',', '').replace(/\s/g, '-');
      const site = siteOptions.find((s) => s.id === item.entry?.project_id);
      const entityName = item.entityName || '';
      const finalName = `${timestamp} ${site?.sNo || ''} ${entityName}`;
      formData.append('file', file);
      formData.append('file_name', finalName);
      const uploadRes = await fetch('https://backendaab.in/demoAabuilderDash/expenses/googleUploader/uploadToGoogleDrive', {
        method: 'POST',
        body: formData,
      });
      if (!uploadRes.ok) throw new Error('Upload failed');
      const uploadResult = await uploadRes.json();
      const fileUrl = uploadResult.url;
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const username = user?.username || user?.name || '';
      const payload = { ...item.entry, file_url: fileUrl };
      const editRes = await fetch(`https://backendaab.in/demoAabuildersDash/api/advance_portal/edit/${entryId}?editedBy=${username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!editRes.ok) {
        const errText = await editRes.text();
        throw new Error(errText || 'Failed to update record');
      }
      setUploadExpandedId(null);
      loadAdvanceData();
      window.dispatchEvent(new Event('advanceUpdated'));
      setUploadStatus('completed');
      setTimeout(() => setUploadStatus(null), 2500);
    } catch (err) {
      console.error('Upload or update failed:', err);
      setUploadStatus(null);
      alert(err?.message || 'Failed to upload file. Please try again.');
    } finally {
      setUploadingForId(null);
    }
  };

  const handleEdit = (item) => {
    if (!canEdit) {
      alert("You don't have permission to edit.");
      return;
    }
    if (!item) return;

    const entry = item.entry || {};
    const vendorId = entry.vendor_id;
    const contractorId = entry.contractor_id;
    const projectId = entry.project_id;

    let selectedOption = null;
    if (vendorId) {
      const v = vendorOptions.find((x) => x.id === vendorId);
      if (v) selectedOption = { value: v.label, label: v.label, id: v.id, type: 'Vendor' };
    }
    if (!selectedOption && contractorId) {
      const c = contractorOptions.find((x) => x.id === contractorId);
      if (c) selectedOption = { value: c.label, label: c.label, id: c.id, type: 'Contractor' };
    }

    const site = siteOptions.find((x) => x.id === projectId);
    const selectedSite = site ? { value: site.value || site.label, label: site.label, id: site.id, sNo: site.sNo } : null;

    // Prefill AdvanceForm using its sessionStorage reader (mobile form uses sessionStorage for initial values).
    ['selectedType', 'selectedOption', 'selectedSite', 'overallAdvance', 'billAmount', 'advanceAmount', 'transferSiteId', 'paymentMode', 'description'].forEach(
      (k) => sessionStorage.removeItem(k)
    );

    const resolvedType = item.type || entry.type || 'Advance';
    const absAmount = Math.abs(parseFloat(item.amount || 0) || 0);
    const absBillAmount = Math.abs(parseFloat(entry.bill_amount || item.amount || 0) || 0);
    const transferSiteIdVal = entry.transfer_site_id ?? entry.transferSiteId ?? '';

    sessionStorage.setItem('selectedType', JSON.stringify(resolvedType));
    if (selectedOption) sessionStorage.setItem('selectedOption', JSON.stringify(selectedOption));
    if (selectedSite) sessionStorage.setItem('selectedSite', JSON.stringify(selectedSite));
    sessionStorage.setItem('overallAdvance', JSON.stringify(absAmount));
    if (resolvedType === 'Bill Settlement') {
      sessionStorage.setItem('billAmount', JSON.stringify(absBillAmount));
    } else {
      sessionStorage.setItem('advanceAmount', JSON.stringify(absAmount));
      if (resolvedType === 'Transfer') {
        sessionStorage.setItem('transferSiteId', JSON.stringify(transferSiteIdVal));
      }
    }
    sessionStorage.setItem('paymentMode', JSON.stringify(item.paymentMode || entry.payment_mode || ''));
    sessionStorage.setItem('description', JSON.stringify(entry.description || ''));

    setUploadExpandedId(null);
    setEditDeleteExpandedId(null);
    setSwipeStates({});

    onVendorClick?.({
      selectedOption,
      selectedSite,
      billDetails: {
        ref: item.ref,
        amount: item.amount,
        paymentMode: item.paymentMode,
        timestamp: item.timestamp,
        type: item.type,
        entryNo: entry.entry_no,
        date: entry.date || entry.timestamp,
      },
    });
  };

  const requestDelete = (item) => {
    if (!canDelete) {
      alert("You don't have permission to delete.");
      return;
    }
    setEntryToDelete(item || null);
    setShowDeleteConfirmModal(true);
    setUploadExpandedId(null);
    setEditDeleteExpandedId(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setEntryToDelete(null);
  };

  const confirmDelete = async () => {
    if (!canDelete) {
      cancelDelete();
      return;
    }
    if (!entryToDelete) return;

    const entry = entryToDelete.entry || {};
    const recordType = entry.type || entryToDelete.type || '';
    const entryNo = entry.entry_no;

    if (entryNo === undefined || entryNo === null) {
      cancelDelete();
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const username = user?.username || user?.name || '';

    const clearedData = {
      entry_no: entryNo,
      date: entry.date || entry.timestamp || '',
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
      refund_amount: ''
    };

    try {
      if (recordType === 'Transfer') {
        const transferRecords = advanceData.filter((r) => String(r.entry_no) === String(entryNo));
        await Promise.all(
          transferRecords.map(async (rec) => {
            const idToDelete = rec.advancePortalId || rec.id;
            if (!idToDelete) return;
            const res = await fetch(`https://backendaab.in/demoAabuildersDash/api/advance_portal/edit/${idToDelete}?editedBy=${username}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(clearedData),
            });
            if (!res.ok) throw new Error('Failed to clear transfer record');
          })
        );
      } else {
        const idToDelete = entry.advancePortalId || entry.id || entryToDelete.id;
        if (!idToDelete) return;
        const res = await fetch(`https://backendaab.in/demoAabuildersDash/api/advance_portal/edit/${idToDelete}?editedBy=${username}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clearedData),
        });
        if (!res.ok) throw new Error('Failed to clear record');
      }

      setShowDeleteConfirmModal(false);
      setEntryToDelete(null);
      setEditDeleteExpandedId(null);
      setUploadExpandedId(null);
      loadAdvanceData();
      window.dispatchEvent(new Event('advanceUpdated'));
    } catch (err) {
      console.error('Delete error:', err);
      cancelDelete();
      alert('Failed to delete record');
    }
  };

  // Attach swipe listeners - same as PurchaseOrder History
  useEffect(() => {
    const cleanups = [];
    const globalMouseMoveHandler = (e) => {
      setSwipeStates((prev) => {
        let hasChanges = false;
        const newState = { ...prev };
        filtered.forEach((item) => {
          const state = prev[item.id];
          if (!state) return;
          const deltaX = e.clientX - state.startX;
          if (deltaX !== 0) {
            newState[item.id] = {
              ...state,
              currentX: e.clientX,
              isSwiping: true,
              wasUploadExpanded: state.wasUploadExpanded,
              wasEditDeleteExpanded: state.wasEditDeleteExpanded,
            };
            hasChanges = true;
          }
        });
        return hasChanges ? newState : prev;
      });
    };
    const globalMouseUpHandler = () => {
      setSwipeStates((prev) => {
        const newState = { ...prev };
        filtered.forEach((item) => {
          const state = prev[item.id];
          if (!state) return;
          const deltaX = state.currentX - state.startX;
          const absDeltaX = Math.abs(deltaX);
          const wasUploadExpanded = state.wasUploadExpanded || false;
          const wasEditDeleteExpanded = state.wasEditDeleteExpanded || false;
          if (absDeltaX >= minSwipeDistance) {
            if (deltaX > 0) {
              if (wasEditDeleteExpanded) {
                setEditDeleteExpandedId(null);
                setUploadExpandedId(null);
              } else if (!wasUploadExpanded) {
                setUploadExpandedId(item.id);
                setEditDeleteExpandedId(null);
              }
            } else {
              if (wasUploadExpanded) {
                setUploadExpandedId(null);
              } else if (!wasEditDeleteExpanded) {
                setEditDeleteExpandedId(item.id);
                setUploadExpandedId(null);
              }
            }
          }
          delete newState[item.id];
        });
        return newState;
      });
    };
    document.addEventListener('mousemove', globalMouseMoveHandler);
    document.addEventListener('mouseup', globalMouseUpHandler);
    cleanups.push(() => {
      document.removeEventListener('mousemove', globalMouseMoveHandler);
      document.removeEventListener('mouseup', globalMouseUpHandler);
    });
    filtered.forEach((item) => {
      const el = cardRefs.current[item.id];
      if (!el) return;
      const touchStartHandler = (e) => {
        const touch = e.touches[0];
        const wasUploadExpanded = uploadExpandedIdRef.current === item.id;
        const wasEditDeleteExpanded = editDeleteExpandedIdRef.current === item.id;
        setSwipeStates((prev) => ({
          ...prev,
          [item.id]: {
            startX: touch.clientX,
            startY: touch.clientY,
            currentX: touch.clientX,
            currentY: touch.clientY,
            isSwiping: false,
            wasUploadExpanded,
            wasEditDeleteExpanded,
          },
        }));
      };
      const touchMoveHandler = (e) => {
        const touch = e.touches[0];
        setSwipeStates((prev) => {
          const state = prev[item.id];
          if (!state) return prev;
          const deltaX = touch.clientX - state.startX;
          const deltaY = touch.clientY - state.startY;
          const absDeltaX = Math.abs(deltaX);
          const absDeltaY = Math.abs(deltaY);
          if (absDeltaX <= absDeltaY) {
            const next = { ...prev };
            delete next[item.id];
            return next;
          }
          if (deltaX !== 0) {
            e.preventDefault();
            return {
              ...prev,
              [item.id]: {
                ...state,
                currentX: touch.clientX,
                currentY: touch.clientY,
                isSwiping: true,
                wasUploadExpanded: state.wasUploadExpanded,
                wasEditDeleteExpanded: state.wasEditDeleteExpanded,
              },
            };
          }
          return prev;
        });
      };
      const touchEndHandler = () => {
        setSwipeStates((prev) => {
          const state = prev[item.id];
          if (!state) return prev;
          const deltaX = state.currentX - state.startX;
          const absDeltaX = Math.abs(deltaX);
          const wasUploadExpanded = state.wasUploadExpanded || false;
          const wasEditDeleteExpanded = state.wasEditDeleteExpanded || false;
          if (absDeltaX >= minSwipeDistance) {
            if (deltaX > 0) {
              if (wasEditDeleteExpanded) {
                setEditDeleteExpandedId(null);
                setUploadExpandedId(null);
              } else if (!wasUploadExpanded) {
                setUploadExpandedId(item.id);
                setEditDeleteExpandedId(null);
              }
            } else {
              if (wasUploadExpanded) {
                setUploadExpandedId(null);
              } else if (!wasEditDeleteExpanded) {
                setEditDeleteExpandedId(item.id);
                setUploadExpandedId(null);
              }
            }
          }
          const next = { ...prev };
          delete next[item.id];
          return next;
        });
      };
      const mouseDownHandler = (e) => {
        e.preventDefault();
        const wasUploadExpanded = uploadExpandedIdRef.current === item.id;
        const wasEditDeleteExpanded = editDeleteExpandedIdRef.current === item.id;
        setSwipeStates((prev) => ({
          ...prev,
          [item.id]: {
            startX: e.clientX,
            currentX: e.clientX,
            isSwiping: false,
            wasUploadExpanded,
            wasEditDeleteExpanded,
          },
        }));
      };
      el.addEventListener('touchstart', touchStartHandler, { passive: false });
      el.addEventListener('touchmove', touchMoveHandler, { passive: false });
      el.addEventListener('touchend', touchEndHandler, { passive: false });
      el.addEventListener('mousedown', mouseDownHandler);
      cleanups.push(() => {
        el.removeEventListener('touchstart', touchStartHandler);
        el.removeEventListener('touchmove', touchMoveHandler);
        el.removeEventListener('touchend', touchEndHandler);
        el.removeEventListener('mousedown', mouseDownHandler);
      });
    });
    return () => cleanups.forEach((c) => c());
  }, [filtered, minSwipeDistance]);

  return (
    <div
      className="relative w-full bg-white max-w-[360px] flex flex-col scrollbar-none overflow-hidden"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {/* Date and Category Section */}
      <div className="pt-[10px]">
        <div className="flex-shrink-0 flex mb-[8px] items-center border-b border-[#E0E0E0] justify-between pb-[10px]">
          <div />
          <div className="flex items-center gap-[4px]">
            <button
              type="button"
              onClick={() => setShowTypeModal(true)}
              className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:opacity-80 transition-opacity"
            >
              {typeFilter || 'Type'}
            </button>
            {typeFilter && (
              <button
                type="button"
                onClick={() => setTypeFilter('')}
                className="w-4 h-4 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
              >
                <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
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
              {!(typeFilter || vendorContractorFilter || entryNoFilter || projectNameFilter || paymentModeFilter) && (
                <span className="text-[13px] font-semibold flex-shrink-0 text-[#9E9E9E]">
                  Filter
                </span>
              )}
            </button>
            {/* Active Filter Tags - Next to Filter button */}
            <div className="flex items-center gap-[4px] overflow-x-auto no-scrollbar scrollbar-none min-w-0 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {/* Contractor/Vendor Filter Tag */}
              {vendorContractorFilter && (
                <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
                  <span className="text-[11px] font-medium text-black">Contractor/Vendor</span>
                  <button
                    onClick={() => setVendorContractorFilter('')}
                    className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
              {/* Entry No Filter Tag */}
              {entryNoFilter && (
                <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
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
              {/* Project Name Filter Tag */}
              {projectNameFilter && (
                <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
                  <span className="text-[11px] font-medium text-black">Project</span>
                  <button
                    onClick={() => setProjectNameFilter('')}
                    className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
              {/* Mode Filter Tag */}
              {paymentModeFilter && (
                <div className="flex items-center border px-[6px] py-[2px] rounded-full flex-shrink-0">
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
          {(vendorContractorFilter || entryNoFilter || projectNameFilter || paymentModeFilter) && (
            <button
              onClick={() => {
                setVendorContractorFilter('');
                setEntryNoFilter('');
                setProjectNameFilter('');
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
        onClick={() => {
          setUploadExpandedId(null);
          setEditDeleteExpandedId(null);
        }}
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
              {searchQuery ? 'No advance records found' : 'No advance records yet'}
            </p>
          </div>
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf,.pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileChange}
            />
            {filtered.map((item) => {
              const swipeState = swipeStates[item.id];
              const isUploadExpanded = uploadExpandedId === item.id;
              const isEditDeleteExpanded = editDeleteExpandedId === item.id;
              const swipeActionWidth = 110;
              let swipeOffset = 0;
              if (swipeState?.isSwiping) {
                const dx = swipeState.currentX - swipeState.startX;
                if (dx < 0) {
                  // Swiping left - reveal edit/delete on right (unless upload was already expanded)
                  swipeOffset = isUploadExpanded ? Math.max(0, 48 + dx) : Math.max(-swipeActionWidth, dx);
                } else {
                  // Swiping right - reveal upload on left (unless edit/delete was already expanded)
                  swipeOffset = isEditDeleteExpanded
                    ? Math.max(-swipeActionWidth, Math.min(0, -swipeActionWidth + dx))
                    : Math.min(48, dx);
                }
              } else if (isEditDeleteExpanded) {
                swipeOffset = -swipeActionWidth;
              } else if (isUploadExpanded) {
                swipeOffset = 48;
              }
              return (
                <div
                  key={item.id}
                  className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[8px] min-w-[330px]"
                  style={{
                    height: '95px',
                    userSelect: swipeState?.isSwiping ? 'none' : 'auto',
                    WebkitUserSelect: swipeState?.isSwiping ? 'none' : 'auto',
                  }}
                >
                  {/* Upload button - behind card on left, revealed on right swipe (same as PO Clone) */}
                  <div
                    className="absolute left-0 top-[0px] flex gap-[8px] flex-shrink-0 z-0"
                    style={{
                      opacity: (isUploadExpanded || (swipeState && swipeState.isSwiping && swipeOffset > 20)) ? 1 : 0,
                      transition: 'opacity 0.2s ease-out',
                      pointerEvents: isUploadExpanded ? 'auto' : 'none',
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUploadClick(item);
                      }}
                      disabled={!!uploadingForId}
                      className="w-[48px] h-[95px] bg-[#BF9853] rounded-[6px] flex items-center justify-center hover:bg-[#a88645] transition-colors shadow-sm disabled:opacity-60"
                      title="Upload file"
                    >
                      <img src={UploadFile} alt="Upload File" className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                  {/* Edit/Delete buttons - behind card on the right, revealed on left swipe */}
                  <div
                    className="absolute right-0 top-[0px] flex gap-[8px] flex-shrink-0 z-0"
                    style={{
                      opacity: (isEditDeleteExpanded || (swipeState && swipeState.isSwiping && swipeOffset < -20)) ? 1 : 0,
                      transform: swipeOffset < 0
                        ? `translateX(${Math.max(0, swipeActionWidth + swipeOffset)}px)`
                        : `translateX(${swipeActionWidth}px)`,
                      transition: 'opacity 0.2s ease-out',
                      pointerEvents: isEditDeleteExpanded ? 'auto' : 'none',
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                      disabled={!canEdit}
                      className={`w-[48px] h-[95px] bg-[#007233] rounded-[6px] flex items-center justify-center gap-[6px] hover:bg-[#22a882] transition-colors shadow-sm ${
                        !canEdit ? 'opacity-50 cursor-not-allowed hover:bg-[#007233]' : ''
                      }`}
                      title="Edit"
                    >
                      <img src={Edit} alt="Edit" className="w-[18px] h-[18px]" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        requestDelete(item);
                      }}
                      disabled={!canDelete}
                      className={`w-[48px] h-[95px] bg-[#E4572E] flex rounded-[6px] items-center justify-center gap-[6px] hover:bg-[#cc4d26] transition-colors shadow-sm ${
                        !canDelete ? 'opacity-50 cursor-not-allowed hover:bg-[#E4572E]' : ''
                      }`}
                      title="Delete"
                    >
                      <img src={Delete} alt="Delete" className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                  <div
                    ref={(el) => {
                      if (el) cardRefs.current[item.id] = el;
                      else delete cardRefs.current[item.id];
                    }}
                    className="flex-1 bg-white rounded-[8px] h-full px-[12px] py-[12px] transition-all duration-300 ease-out"
                    style={{
                      transform: `translateX(${swipeOffset}px)`,
                      touchAction: 'pan-y',
                      userSelect: swipeState?.isSwiping ? 'none' : 'auto',
                      WebkitUserSelect: swipeState?.isSwiping ? 'none' : 'auto',
                      MozUserSelect: swipeState?.isSwiping ? 'none' : 'auto',
                      msUserSelect: swipeState?.isSwiping ? 'none' : 'auto',
                      willChange: 'transform',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transition: swipeState?.isSwiping ? 'none' : 'transform 0.3s ease-out',
                    }}
                    onClick={(e) => {
                      if (!isUploadExpanded) e.stopPropagation();
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
                      {/* Row 2: entityName (clickable – opens Advance form with vendor/project and bill details) and empty space */}
                      <div className="flex items-center justify-between">
                        {onVendorClick ? (
                          <button
                            type="button"
                            onClick={() => {
                              const entry = item.entry || {};
                              const vendorId = entry.vendor_id;
                              const contractorId = entry.contractor_id;
                              const projectId = entry.project_id;
                              let selectedOption = null;
                              if (vendorId) {
                                const v = vendorOptions.find((x) => x.id === vendorId);
                                if (v) selectedOption = { value: v.label, label: v.label, id: v.id, type: 'Vendor' };
                              }
                              if (!selectedOption && contractorId) {
                                const c = contractorOptions.find((x) => x.id === contractorId);
                                if (c) selectedOption = { value: c.label, label: c.label, id: c.id, type: 'Contractor' };
                              }
                              const site = siteOptions.find((x) => x.id === projectId);
                              const selectedSite = site ? { value: site.value || site.label, label: site.label, id: site.id, sNo: site.sNo } : null;
                              onVendorClick({
                                selectedOption,
                                selectedSite,
                                billDetails: {
                                  ref: item.ref,
                                  amount: item.amount,
                                  paymentMode: item.paymentMode,
                                  timestamp: item.timestamp,
                                  type: item.type,
                                  entryNo: entry.entry_no,
                                  date: entry.date || entry.timestamp,
                                },
                              });
                            }}
                            className="text-[12px] font-semibold text-black leading-snug break-words text-left cursor-pointer hover:underline focus:outline-none focus:underline"
                            style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                          >
                            {item.entityName || 'N/A'}
                          </button>
                        ) : (
                          <p
                            className="text-[12px] font-semibold text-black leading-snug break-words"
                            style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                          >
                            {item.entityName || 'N/A'}
                          </p>
                        )}
                        <span></span>
                      </div>
                      {/* Row 3: projectName and amount/refund_amount (not bill_amount) */}
                      <div className="flex items-center justify-between">
                        <p
                          className="text-[11px] font-medium text-[#777777] leading-snug break-words"
                          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                        >
                          {item.projectName || 'N/A'}
                        </p>
                        {item.type === 'Bill Settlement' ? (
                          <span className="text-[12px] font-semibold leading-snug text-[#007233]">
                            ₹{parseFloat(item.entry?.amount || 0).toLocaleString('en-IN')}
                          </span>
                        ) : item.entry?.file_url ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(item.entry.file_url, '_blank', 'noopener,noreferrer');
                            }}
                            className={`text-[12px] font-semibold block leading-snug cursor-pointer hover:underline focus:outline-none focus:underline ${item.amount < 0 ? 'text-[#E4572E]' : 'text-[#007233]'}`}
                          >
                            {item.amount < 0 ? '-' : ''}₹{Math.abs(item.amount).toLocaleString('en-IN')}
                          </button>
                        ) : (
                          <p
                            className={`text-[12px] font-semibold block leading-snug ${item.amount < 0 ? 'text-[#E4572E]' : 'text-[#007233]'}`}
                          >
                            {item.amount < 0 ? '-' : ''}₹{Math.abs(item.amount).toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                      {/* Row 4: timestamp and bill_amount (or transfer site) */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-[#777777] leading-snug">
                          {formatDateTime(item.timestamp)}
                        </span>
                        {item.type === 'Transfer' && item.transferSiteName ? (
                          <p className={`text-[10px] font-semibold leading-snug ${item.amount < 0 ? 'text-[#BF9853]' : 'text-[#007233]'}`}>
                            {item.transferSiteName}
                          </p>
                        ) : item.type === 'Bill Settlement' ? (
                          item.entry?.file_url ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(item.entry.file_url, '_blank', 'noopener,noreferrer');
                              }}
                              className="text-[12px] font-medium text-[#007233] leading-snug cursor-pointer hover:underline focus:outline-none focus:underline"
                            >
                              ₹{parseFloat(item.entry?.bill_amount || item.amount || 0).toLocaleString('en-IN')}
                            </button>
                          ) : (
                            <span className="text-[12px] font-medium text-[#007233] leading-snug">
                              ₹{parseFloat(item.entry?.bill_amount || item.amount || 0).toLocaleString('en-IN')}
                            </span>
                          )
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
      {/* Upload confirmation modal */}
      {showUploadConfirmModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-[16px]"
          onClick={handleUploadCancel}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div
            className="bg-white w-full max-w-[320px] rounded-[12px] p-[20px] shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[16px] font-semibold text-black text-center mb-4">
              Upload file for this entry?
            </p>
            <div className="flex gap-[12px]">
              <button
                type="button"
                onClick={handleUploadCancel}
                className="flex-1 py-[10px] text-[14px] font-semibold text-black border border-[rgba(0,0,0,0.2)] rounded-[8px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadConfirm}
                className="flex-1 py-[10px] text-[14px] font-semibold text-white bg-[#BF9853] rounded-[8px]"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete confirmation modal */}
      <DeleteConfirmModal isOpen={showDeleteConfirmModal} onCancel={cancelDelete} onConfirm={confirmDelete} />
      {/* Uploading overlay */}
      {uploadStatus === 'uploading' && (
        <div
          className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-[16px]"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div className="bg-white rounded-[12px] p-[24px] flex flex-col items-center gap-[16px] min-w-[200px]">
            <div className="w-10 h-10 border-2 border-[#BF9853] border-t-transparent rounded-full animate-spin" />
            <p className="text-[14px] font-medium text-black">Uploading and updating...</p>
          </div>
        </div>
      )}
      {/* Upload completed toast */}
      {uploadStatus === 'completed' && (
        <div
          className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-[16px] pointer-events-none"
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div className="bg-white rounded-[12px] px-[24px] py-[16px] flex items-center gap-[12px] shadow-lg">
            <div className="w-8 h-8 rounded-full bg-[#2E7D32] flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-[14px] font-semibold text-black">Upload file completed</p>
          </div>
        </div>
      )}
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
            {/* Header */}
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

            {/* Search Bar */}
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

            {/* Options List */}
            <div className="flex-1 overflow-y-auto mb-[8px] px-[24px] min-h-[65vh] [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="shadow-md rounded-lg overflow-hidden">
                {(['Advance', 'Bill Settlement', 'Transfer', 'Refund']
                  .filter(type => type.toLowerCase().includes(typeSearchQuery.toLowerCase()))
                  .map((type, index) => {
                    const isSelected = typeFilter === type;

                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setTypeFilter(type);
                          setShowTypeModal(false);
                          setTypeSearchQuery('');
                        }}
                        className={`w-full px-[16px] flex items-center gap-3 transition-colors ${isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'
                          }`}
                        style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}
                      >
                        <p className="text-[12px] font-medium text-black text-left">{type}</p>
                      </button>
                    );
                  }))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Select Week & Year modal */}
      {showWeekYearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center" onClick={() => setShowWeekYearModal(false)}>
          <div className="bg-white w-[320px] rounded-[6px] p-[24px] relative" onClick={(e) => e.stopPropagation()}>
            <p className="text-[16px] font-medium text-black text-center mb-6">Select Week & Year</p>
            <div className="flex justify-center gap-[32px] mb-6">
              {/* Week column - show "Week 1", "Week 2", ... */}
              <div
                className="flex flex-col items-center relative"
                onWheel={(e) => handleWeekWheel(e, e.deltaY > 0 ? 1 : -1)}
              >
                {getVisibleWeeks().map((w, idx) => (
                  <div key={`${w}-${idx}`} className="relative w-full flex flex-col items-center">
                    {idx > 0 && <div className="absolute top-[0px] left-0 right-0 h-[0.5px] bg-[rgba(0,0,0,0.16)]" />}
                    <button
                      type="button"
                      onClick={() => setModalWeek(w)}
                      className={`min-w-[72px] h-8 text-[14px] relative ${modalWeek === w ? 'font-medium text-black' : 'font-normal text-[#979ea3]'}`}
                    >
                      Week {parseInt(w, 10)}
                    </button>
                    {idx < 2 && <div className="absolute bottom-0 left-0 right-0 h-[0.5px] bg-[rgba(0,0,0,0.16)]" />}
                  </div>
                ))}
              </div>
              {/* Year column */}
              <div className="flex flex-col items-center relative" onWheel={(e) => handleYearWheel(e, e.deltaY > 0 ? 1 : -1)}>
                {getVisibleYears().map((y, idx) => (
                  <div key={`${y}-${idx}`} className="relative w-full flex flex-col items-center">
                    {idx > 0 && <div className="absolute top-[0px] left-0 right-0 h-[0.5px] bg-[rgba(0,0,0,0.16)]" />}
                    <button
                      type="button"
                      onClick={() => setModalYear(String(y))}
                      className={`w-12 h-8 text-[14px] relative ${modalYear === String(y) ? 'font-medium text-black' : 'font-normal text-[#979ea3]'}`}
                    >
                      {y}
                    </button>
                    {idx < 2 && <div className="absolute bottom-0 left-0 right-0 h-[0.5px] bg-[rgba(0,0,0,0.16)]" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-[16px]">
              <button type="button" onClick={() => setShowWeekYearModal(false)} className="text-[#656565] text-[16px] font-semibold">
                Cancel
              </button>
              <button type="button" onClick={handleWeekYearOk} className="text-[#bf9853] text-[16px] font-bold">
                OK
              </button>
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
            className="bg-white rounded-t-2xl w-full p-[16px] h-[220px] relative"
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
              {/* Contractor/Vendor Filter */}
              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Contractor/Vendor</p>
                <div className="relative">
                  <div
                    onClick={() => setShowVendorContractorModal(true)}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                    style={{ boxSizing: 'border-box', color: vendorContractorFilter ? '#000' : '#9E9E9E' }}
                  >
                    {vendorContractorFilter || 'Select'}
                    {vendorContractorFilter ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVendorContractorFilter('');
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

              {/* Project Name Filter */}
              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Project Name</p>
                <div className="relative">
                  <div
                    onClick={() => setShowProjectNameModal(true)}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                    style={{ boxSizing: 'border-box', color: projectNameFilter ? '#000' : '#9E9E9E' }}
                  >
                    {projectNameFilter || 'Select'}
                    {projectNameFilter ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectNameFilter('');
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

      {/* Vendor/Contractor Modal - higher z-index when opened from Filter sheet */}
      <SelectVendorModal
        isOpen={showVendorContractorModal}
        onClose={() => setShowVendorContractorModal(false)}
        onSelect={(value) => {
          setVendorContractorFilter(value);
          setShowVendorContractorModal(false);
        }}
        selectedValue={vendorContractorFilter}
        options={[...vendorOptions.map((opt) => opt.label), ...contractorOptions.map((opt) => opt.label)]}
        fieldName="Contractor/Vendor"
        showStarIcon={false}
        zIndex={10000}
      />

      {/* Entry No Modal - higher z-index when opened from Filter sheet */}
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
        zIndex={10000}
      />

      {/* Project Name Modal - higher z-index when opened from Filter sheet */}
      <SelectVendorModal
        isOpen={showProjectNameModal}
        onClose={() => setShowProjectNameModal(false)}
        onSelect={(value) => {
          setProjectNameFilter(value);
          setShowProjectNameModal(false);
        }}
        selectedValue={projectNameFilter}
        options={siteOptions.map((opt) => opt.label || opt.value)}
        fieldName="Project Name"
        showStarIcon={false}
        zIndex={10000}
      />

      {/* Payment Mode Modal - higher z-index when opened from Filter sheet */}
      <SelectVendorModal
        isOpen={showPaymentModeModal}
        onClose={() => setShowPaymentModeModal(false)}
        onSelect={(value) => {
          setPaymentModeFilter(value);
          setShowPaymentModeModal(false);
        }}
        selectedValue={paymentModeFilter}
        options={['Cash', 'GPay', 'PhonePe', 'Net Banking', 'Cheque', 'Online']}
        fieldName="Mode"
        showStarIcon={false}
        zIndex={10000}
      />

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
            {/* Icon - image has its own background */}
            <div className="flex justify-center mb-4">
              <img src={Pen} alt="Pen" className="w-[74px] h-[74px]" />
            </div>

            {/* Title */}
            <h3 className="text-[18px] font-bold text-gray-500 text-center mb-4">Description!</h3>

            {/* Description Content */}
            <p className="text-[11px] font-medium text-black text-center mb-6 leading-relaxed">
              {selectedDescription}
            </p>

            {/* Okay Button */}
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
