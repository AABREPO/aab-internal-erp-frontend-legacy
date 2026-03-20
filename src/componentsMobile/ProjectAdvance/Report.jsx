import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Filter from '../Images/Filter.png';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';
import Download from '../Images/Download.svg';
import Pen from '../Images/Pen.svg';

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

const getMondayOfWeek = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay() || 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - day + 1);
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
};

const getSundayOfWeek = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay() || 7;
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - day + 7);
  return `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`;
};

// Get Monday of a given ISO week number and year
const getMondayOfISOWeek = (weekNum, yearNum) => {
  const jan4 = new Date(yearNum, 0, 4);
  jan4.setHours(0, 0, 0, 0);
  const jan4Day = jan4.getDay() || 7;
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - jan4Day + 1 + (weekNum - 1) * 7);
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
};

// Format a Date to YYYY-MM-DD in local time (avoids timezone off-by-one from toISOString)
const toLocalDateString = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Parse YYYY-MM-DD as local midnight (so calendar highlight matches displayed range)
const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const parts = String(dateStr).trim().split('-');
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(day)) return null;
  const d = new Date(y, m, day);
  return isNaN(d.getTime()) ? null : d;
};

// Format a Date to DD/MM/YYYY (local) for display
const formatDateToDDMMYYYY = (d) => {
  if (!d || !(d instanceof Date) || isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
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

const Report = () => {
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
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([...PREDEFINED_SITE_OPTIONS]);
  const [week, setWeek] = useState(() => String(getCurrentWeekNumber()).padStart(2, '0'));
  const [year, setYear] = useState(() => String(getCurrentWeekYear()));
  const [startDate, setStartDate] = useState(() => {
    const w = getCurrentWeekNumber();
    const y = getCurrentWeekYear();
    return getMondayOfISOWeek(w, y);
  });
  const [endDate, setEndDate] = useState(() => {
    const w = getCurrentWeekNumber();
    const y = getCurrentWeekYear();
    const mon = getMondayOfISOWeek(w, y);
    return getSundayOfWeek(new Date(mon));
  });
  const [paymentModeFilter, setPaymentModeFilter] = useState('');
  const [showPaymentModeModal, setShowPaymentModeModal] = useState(false);
  const [showWeekYearModal, setShowWeekYearModal] = useState(false);
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [modalWeek, setModalWeek] = useState('');
  const [modalYear, setModalYear] = useState('');
  const [useDateRangeFromCalendar, setUseDateRangeFromCalendar] = useState(false);
  const [calendarView, setCalendarView] = useState(() => new Date());
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [vendorContractorFilter, setVendorContractorFilter] = useState('');
  const [projectNameFilter, setProjectNameFilter] = useState('');
  const [showVendorContractorModal, setShowVendorContractorModal] = useState(false);
  const [showProjectNameModal, setShowProjectNameModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [typeSearchQuery, setTypeSearchQuery] = useState('');
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const weekNum = week ? parseInt(week, 10) : null;
  const yearNum = year ? parseInt(year, 10) : null;

  const openWeekYearModal = () => {
    setModalWeek(week || String(getCurrentWeekNumber()).padStart(2, '0'));
    setModalYear(year || String(getCurrentWeekYear()));
    setShowWeekYearModal(true);
  };

  const defaultPaymentModeOptions = [
    { value: 'Cash', label: 'Cash' },
    { value: 'GPay', label: 'GPay' },
    { value: 'PhonePe', label: 'PhonePe' },
    { value: 'Net Banking', label: 'Net Banking' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'Online', label: 'Online' }
  ];

  const fetchVendors = async () => {
    try {
      const res = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/getAll');
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
      const res = await fetch('https://backendaab.in/aabuilderDash/api/contractor_Names/getAll');
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
      const res = await fetch('https://backendaab.in/aabuilderDash/api/project_Names/getAll');
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

  // Same as AdvanceReport.js: fetch without branchId so data is returned
  const loadAdvanceData = useCallback(async () => {
    try {
      const res = await fetch('https://backendaab.in/aabuildersDash/api/advance_portal/getAll');
      if (!res.ok) throw new Error('Failed to fetch advance data');
      const data = await res.json();
      setAdvanceData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading advance data:', err);
      setAdvanceData([]);
    }
  }, []);

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

  // Filter: same as AdvanceReport — date range only if user picked range from calendar; else week+year
  const filteredData = useMemo(() => {
    if (!advanceData.length) return [];
    let filtered;
    if (useDateRangeFromCalendar && startDate && endDate) {
      const s = parseLocalDate(startDate);
      const e = parseLocalDate(endDate);
      if (s && e) {
        s.setHours(0, 0, 0, 0);
        const eEnd = new Date(e);
        eEnd.setHours(23, 59, 59, 999);
        filtered = advanceData.filter((item) => {
          const d = parseItemDate(item);
          return d && d >= s && d <= eEnd;
        });
      } else {
        filtered = [];
      }
    } else if (weekNum != null && yearNum != null) {
      filtered = advanceData.filter((item) => {
        const d = parseItemDate(item);
        if (!d) return false;
        const itemWeekYear = getWeekYear(d);
        const itemWeekNumber = getISOWeekNumber(d);
        return itemWeekYear === yearNum && itemWeekNumber === weekNum;
      });
    } else {
      filtered = [];
    }
    if (paymentModeFilter) {
      filtered = filtered.filter(
        (item) => (item.payment_mode || '').toString().toLowerCase() === paymentModeFilter.toLowerCase()
      );
    }
    if (vendorContractorFilter) {
      filtered = filtered.filter((item) => {
        const vendorName = getVendorName(item.vendor_id);
        const contractorName = getContractorName(item.contractor_id);
        const entityName = vendorName || contractorName || item.contractor_vendor || '';
        return entityName.toLowerCase() === vendorContractorFilter.toLowerCase();
      });
    }
    if (projectNameFilter) {
      filtered = filtered.filter((item) => {
        const projectName = getProjectName(item.project_id) || item.project_name || '';
        return projectName.toLowerCase() === projectNameFilter.toLowerCase();
      });
    }
    if (typeFilter) {
      filtered = filtered.filter((item) => (item.type || '').toString().toLowerCase() === typeFilter.toLowerCase());
    }
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const vendorName = getVendorName(item.vendor_id);
        const contractorName = getContractorName(item.contractor_id);
        const entityName = vendorName || contractorName || item.contractor_vendor || '';
        const projectName = getProjectName(item.project_id) || item.project_name || '';
        const type = (item.type || '').toString();
        const paymentMode = (item.payment_mode || '').toString();
        const entryNo = String(item.entry_no || '');
        return (
          entityName.toLowerCase().includes(q) ||
          projectName.toLowerCase().includes(q) ||
          type.toLowerCase().includes(q) ||
          paymentMode.toLowerCase().includes(q) ||
          entryNo.toLowerCase().includes(q)
        );
      });
    }
    return [...filtered].sort((a, b) => {
      const dateA = parseItemDate(a);
      const dateB = parseItemDate(b);
      return (dateB?.getTime() ?? 0) - (dateA?.getTime() ?? 0);
    });
  }, [advanceData, startDate, endDate, weekNum, yearNum, paymentModeFilter, vendorContractorFilter, projectNameFilter, typeFilter, searchQuery, useDateRangeFromCalendar, vendorOptions, contractorOptions, siteOptions]);

  // Total Advance = Advance + Cash only (same as AdvanceReport.js)
  const totalAdvance = filteredData
    .filter((r) => (r.type || '').toString().toLowerCase() === 'advance' && (r.payment_mode || '').toString().toLowerCase() === 'cash')
    .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

  const transformed = useMemo(() => {
    return filteredData.map((entry) => {
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
  }, [filteredData, vendorOptions, contractorOptions, siteOptions]);

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'Advance':
        return 'bg-[#E8F5E9] text-[#2E7D32]';
      case 'Bill Settlement':
        return 'bg-[#E3F2FD] text-[#1976D2]';
      case 'Refund':
        return 'bg-[#FFF3E0] text-[#F57C00]';
      case 'Transfer':
        return 'bg-[#FFF3E0] text-black';
      default:
        return 'bg-gray-100 text-gray-600';
    }
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
    try {
      const date = new Date(dateString);
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    } catch {
      return '';
    }
  };

  // Show the selected date range (startDate/endDate) so input and calendar always match
  const dateRangeDisplayText = (() => {
    if (startDate && endDate) {
      const from = parseLocalDate(startDate);
      const to = parseLocalDate(endDate);
      if (from && to) {
        const [a, b] = from <= to ? [from, to] : [to, from];
        return `${formatDateToDDMMYYYY(a)} - ${formatDateToDDMMYYYY(b)}`;
      }
    }
    if (filteredData.length > 0) {
      const dates = filteredData.map((r) => parseItemDate(r)).filter(Boolean);
      if (dates.length > 0) {
        const minD = new Date(Math.min(...dates.map((d) => d.getTime())));
        const maxD = new Date(Math.max(...dates.map((d) => d.getTime())));
        return `${formatDateToDDMMYYYY(minD)} - ${formatDateToDDMMYYYY(maxD)}`;
      }
    }
    return 'Select Date';
  })();

  const openDateRangeModal = () => {
    setCalendarView(startDate ? (parseLocalDate(startDate) || new Date()) : new Date());
    setRangeStart(startDate ? parseLocalDate(startDate) : null);
    setRangeEnd(endDate ? parseLocalDate(endDate) : null);
    setShowDateRangeModal(true);
  };

  const applyDateRange = () => {
    if (rangeStart) {
      const e = rangeEnd || rangeStart;
      const s = rangeStart <= e ? rangeStart : e;
      const end = rangeStart <= e ? e : rangeStart;
      setStartDate(toLocalDateString(s));
      setEndDate(toLocalDateString(end));
      setUseDateRangeFromCalendar(true);
    }
    setShowDateRangeModal(false);
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
      const mon = getMondayOfISOWeek(w, y);
      setStartDate(mon);
      setEndDate(getSundayOfWeek(new Date(mon)));
      setUseDateRangeFromCalendar(false);
    }
    setShowWeekYearModal(false);
  };

  const handleExportPDF = () => {
    if (!filteredData.length) {
      alert("No data to export");
      return;
    }
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const columns = [
      { header: "S.No", dataKey: "sno" },
      { header: "Date", dataKey: "date" },
      { header: "Contractor/Vendor", dataKey: "cv" },
      { header: "Project Name", dataKey: "project" },
      { header: "Advance", dataKey: "advance" },
      { header: "Bill Amount", dataKey: "bill" },
      { header: "Refund Amount", dataKey: "refund" },
      { header: "Transfer", dataKey: "transfer" },
      { header: "Type", dataKey: "type" },
      { header: "Mode", dataKey: "mode" },
      { header: "Description", dataKey: "description" },
      { header: "Attached file", dataKey: "file" },
    ];
    const normStr = v => (v ?? "").toString().trim().toLowerCase();
    function dateKey(val) {
      if (!val) return -Infinity;
      const s = String(val).trim();
      const m1 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (m1) {
        return new Date(+m1[3], +m1[2] - 1, +m1[1]).getTime();
      }
      const t = Date.parse(s);
      return isNaN(t) ? -Infinity : new Date(new Date(t).toDateString()).getTime();
    }
    const sortedData = [...filteredData].sort((a, b) => {
      const typeA = normStr(a.type), typeB = normStr(b.type);
      if (typeA !== typeB) return typeA.localeCompare(typeB);
      const modeA = normStr(a.payment_mode), modeB = normStr(b.payment_mode);
      if (modeA !== modeB) return modeA.localeCompare(modeB);
      return dateKey(a.date) - dateKey(b.date);
    });
    const totalAdvanceCash = sortedData
      .filter(row => normStr(row.type) === "advance" && normStr(row.payment_mode) === "cash")
      .reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
    const rows = sortedData.map((row, index) => {
      const d = new Date(dateKey(row.date));
      return {
        sno: index + 1,
        date: isNaN(d) ? "" : d.toLocaleDateString("en-GB"),
        cv:
          contractorOptions.find(c => c.id === row.contractor_id)?.label ||
          vendorOptions.find(v => v.id === row.vendor_id)?.label || "",
        project: siteOptions.find(s => s.id === row.project_id)?.label || "",
        advance: row.amount?.toLocaleString("en-IN") || "0",
        bill: row.bill_amount?.toLocaleString("en-IN") || "0",
        refund: row.refund_amount?.toLocaleString("en-IN") || "0",
        transfer: siteOptions.find(s => s.id === row.transfer_site_id)?.label || "",
        type: row.type || "",
        mode: row.payment_mode || "",
        description: row.description || "",
        file: row.file_url ? "Yes" : "-",
      };
    });
    const fromDate = startDate ? formatDateOnly(startDate) : (week && year ? `Week ${week}, ${year}` : "");
    const toDate = endDate ? formatDateOnly(endDate) : "";
    doc.autoTable({
      startY: 20,
      body: [
        [
          { content: "Start Date", styles: { fontStyle: 'bold' } },
          fromDate,
          { content: "End Date", styles: { fontStyle: 'bold' } },
          toDate,
          { content: "Total Cash Advance", styles: { fontStyle: 'bold' } },
          totalAdvanceCash.toLocaleString("en-IN"),
        ],
      ],
      theme: 'grid',
      styles: {
        fontSize: 10,
        halign: 'left',
        cellPadding: 5,
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      columnStyles: {
        0: { cellWidth: 110 },
        1: { cellWidth: 140 },
        2: { cellWidth: 110 },
        3: { cellWidth: 140 },
        4: { cellWidth: 140 },
        5: { cellWidth: 103 },
      }
    });
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      columns,
      body: rows,
      styles: {
        fontSize: 8,
        cellPadding: 4,
        overflow: "linebreak",
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
        fillColor: null,
        minCellHeight: 20
      },
      headStyles: {
        fillColor: null,
        textColor: 0,
        fontStyle: 'bold',
        lineWidth: 0.5,
        lineColor: [0, 0, 0]
      },
      alternateRowStyles: { fillColor: null },
      columnStyles: {
        sno: { cellWidth: 28 },
        date: { cellWidth: 50 },
        cv: { cellWidth: 90 },
        project: { cellWidth: 115 },
        advance: { cellWidth: 45, halign: 'right' },
        bill: { cellWidth: 40, halign: 'right' },
        refund: { cellWidth: 40, halign: 'right' },
        transfer: { cellWidth: 115 },
        type: { cellWidth: 60 },
        mode: { cellWidth: 50 },
        description: { cellWidth: 75 },
        file: { cellWidth: 35 },
      }
    });
    if (week && year) {
      const selectedWeekNum = parseInt(week, 10);
      const selectedYear = parseInt(year, 10);
      const billSettlementData = advanceData.filter((item) => {
        const itemDate = parseItemDate(item);
        if (!itemDate) return false;
        const itemWeek = getISOWeekNumber(itemDate);
        const itemWeekYear = getWeekYear(itemDate);
        const itemType = normStr(item.type);
        return itemWeekYear === selectedYear &&
          itemWeek === selectedWeekNum &&
          itemType === "bill settlement";
      });
      if (billSettlementData.length > 0) {
        const sortedBillSettlement = [...billSettlementData].sort((a, b) => {
          const modeA = normStr(a.payment_mode), modeB = normStr(b.payment_mode);
          if (modeA !== modeB) return modeA.localeCompare(modeB);
          const dateA = parseItemDate(a);
          const dateB = parseItemDate(b);
          const timestampA = dateA ? dateA.getTime() : dateKey(a.date);
          const timestampB = dateB ? dateB.getTime() : dateKey(b.date);
          return timestampA - timestampB;
        });
        const billSettlementFromDate = sortedBillSettlement.length
          ? (() => {
            const dates = sortedBillSettlement.map((r) => {
              const d = parseItemDate(r);
              return d ? d.getTime() : (r.date ? new Date(r.date).getTime() : 0);
            }).filter(t => t > 0);
            return dates.length > 0 ? formatDateOnly(new Date(Math.min(...dates)).toISOString()) : "-";
          })()
          : "-";
        const billSettlementToDate = sortedBillSettlement.length
          ? (() => {
            const dates = sortedBillSettlement.map((r) => {
              const d = parseItemDate(r);
              return d ? d.getTime() : (r.date ? new Date(r.date).getTime() : 0);
            }).filter(t => t > 0);
            return dates.length > 0 ? formatDateOnly(new Date(Math.max(...dates)).toISOString()) : "-";
          })()
          : "-";
        const totalBillAmount = sortedBillSettlement
          .reduce((sum, row) => sum + (parseFloat(row.bill_amount) || 0), 0);
        doc.addPage();
        const timestamp = new Date().toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });
        doc.autoTable({
          startY: 20,
          body: [
            [
              { content: "Bill Settlement Report", styles: { fontStyle: 'bold', fontSize: 12 } },
              { content: `Generated: ${timestamp}`, styles: { fontStyle: 'italic', fontSize: 8 } },
            ],
            [
              { content: "Start Date", styles: { fontStyle: 'bold' } },
              billSettlementFromDate,
              { content: "End Date", styles: { fontStyle: 'bold' } },
              billSettlementToDate,
              { content: "Total Bill Amount", styles: { fontStyle: 'bold' } },
              totalBillAmount.toLocaleString("en-IN"),
            ],
          ],
          theme: 'grid',
          styles: {
            fontSize: 10,
            halign: 'left',
            cellPadding: 5,
            lineColor: [0, 0, 0],
            lineWidth: 0.5,
          },
          columnStyles: {
            0: { cellWidth: 110 },
            1: { cellWidth: 140 },
            2: { cellWidth: 110 },
            3: { cellWidth: 140 },
            4: { cellWidth: 140 },
            5: { cellWidth: 103 },
          }
        });
        const billSettlementRows = sortedBillSettlement.map((row, index) => {
          const rowDate = parseItemDate(row);
          const formattedDate = rowDate ? formatDateOnly(rowDate.toISOString()) : "";
          return {
            sno: index + 1,
            date: formattedDate,
            cv:
              contractorOptions.find(c => c.id === row.contractor_id)?.label ||
              vendorOptions.find(v => v.id === row.vendor_id)?.label || "",
            project: siteOptions.find(s => s.id === row.project_id)?.label || "",
            advance: row.amount?.toLocaleString("en-IN") || "0",
            bill: row.bill_amount?.toLocaleString("en-IN") || "0",
            refund: row.refund_amount?.toLocaleString("en-IN") || "0",
            transfer: siteOptions.find(s => s.id === row.transfer_site_id)?.label || "",
            type: row.type || "",
            mode: row.payment_mode || "",
            description: row.description || "",
            file: row.file_url ? "Yes" : "-",
          };
        });
        doc.autoTable({
          startY: doc.lastAutoTable.finalY + 10,
          columns,
          body: billSettlementRows,
          styles: {
            fontSize: 8,
            cellPadding: 4,
            overflow: "linebreak",
            lineWidth: 0.5,
            lineColor: [0, 0, 0],
            fillColor: null,
            minCellHeight: 20
          },
          headStyles: {
            fillColor: null,
            textColor: 0,
            fontStyle: 'bold',
            lineWidth: 0.5,
            lineColor: [0, 0, 0]
          },
          alternateRowStyles: { fillColor: null },
          columnStyles: {
            sno: { cellWidth: 28 },
            date: { cellWidth: 100 },
            cv: { cellWidth: 90 },
            project: { cellWidth: 115 },
            advance: { cellWidth: 45, halign: 'right' },
            bill: { cellWidth: 40, halign: 'right' },
            refund: { cellWidth: 40, halign: 'right' },
            transfer: { cellWidth: 115 },
            type: { cellWidth: 60 },
            mode: { cellWidth: 50 },
            description: { cellWidth: 75 },
            file: { cellWidth: 35 },
          }
        });
      }
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    const fileName = fromDate && toDate
      ? `AdvanceReport_${fromDate.replace(/\//g, "-")}_to_${toDate.replace(/\//g, "-")}_${timestamp}.pdf`
      : `AdvanceReport_Week_${week}_${year}_${timestamp}.pdf`;
    doc.save(fileName);
  };

  return (
    <div
      className="relative w-full bg-white max-w-[360px] mx-auto flex flex-col scrollbar-none overflow-hidden"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <div className="px-[16px] pt-[8px] mb-2">
        <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-[8px]">
          <button
            type="button"
            onClick={openWeekYearModal}
            className="text-[12px] font-semibold text-black leading-normal cursor-pointer"
          >
            #Week {week && year ? `${week}, ${year}` : 'Select'}
          </button>
          <div className="flex items-center gap-[4px]">
            <button
              onClick={() => setShowTypeModal(true)}
              className="text-[12px] font-semibold text-black leading-normal cursor-pointer"
            >
              {typeFilter || 'Type'}
            </button>
            <button
              onClick={handleExportPDF}
              className="w-4 h-4 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full"
              title="Export PDF"
            >
              <img src={Download} alt="Download" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-[16px] flex gap-[8px] items-center">
        <div className="flex-1">
          <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Date Range</p>
          <div
            role="button"
            tabIndex={0}
            onClick={openDateRangeModal}
            onKeyDown={(e) => e.key === 'Enter' && openDateRangeModal()}
            className="relative w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[40px] text-[10px] font-medium bg-white flex items-center cursor-pointer whitespace-nowrap"
            style={{ boxSizing: 'border-box', color: startDate && endDate ? '#000' : '#9E9E9E' }}
          >
            {dateRangeDisplayText}
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#9E9E9E]">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Payment Mode</p>
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
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ) : (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-[16px] mb-1 mt-2">
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="7" cy="7" r="5.5" stroke="#747474" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[36px] pl-[40px] pr-[12px] text-[12px] rounded-full font-medium bg-white focus:outline-none border border-[rgba(0,0,0,0.12)]"
          />
        </div>
      </div>

      <div className="px-[16px] pt-[12px] pb-[8px] flex items-center justify-between">
        <div className="flex items-center gap-[8px] min-w-0">
          <button type="button" onClick={() => setShowFilterModal(true)} className="flex items-center gap-[8px] px-[0px] flex-shrink-0">
            <img src={Filter} alt="Filter" className="w-[12px] h-[11px]" />
            {!(typeFilter || vendorContractorFilter || projectNameFilter || paymentModeFilter) && (
              <span className="text-[13px] font-semibold flex-shrink-0 text-[#9E9E9E]">
                Filter
              </span>
            )}
          </button>
          {/* Active Filter Tags - Next to Filter button */}
          <div className="flex items-center gap-[8px] overflow-x-auto no-scrollbar scrollbar-none min-w-0 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* Type Filter Tag */}
            {typeFilter && (
              <div className="flex items-center gap-[6px] border px-[10px] py-[6px] rounded-full flex-shrink-0">
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
            {/* Contractor/Vendor Filter Tag */}
            {vendorContractorFilter && (
              <div className="flex items-center gap-[6px] border px-[10px] py-[6px] rounded-full flex-shrink-0">
                <span className="text-[11px] font-medium text-black">Vendor/Contractor</span>
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
            {/* Project Name Filter Tag */}
            {projectNameFilter && (
              <div className="flex items-center gap-[6px] border px-[10px] py-[6px] rounded-full flex-shrink-0">
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
              <div className="flex items-center gap-[6px] border px-[10px] py-[6px] rounded-full flex-shrink-0">
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
        <div className="flex items-center gap-[8px]">
          {(typeFilter || vendorContractorFilter || projectNameFilter || paymentModeFilter) && (
            <button 
              onClick={() => {
                setTypeFilter('');
                setVendorContractorFilter('');
                setProjectNameFilter('');
                setPaymentModeFilter('');
              }} 
              className="text-[13px] font-semibold hover:text-black transition-colors flex-shrink-0 text-[#9E9E9E]"
            >
              x
            </button>
          )}
          <div className="text-[12px] font-semibold text-black">
            Total Advance : <span className="text-[#E4572E]">₹{Number(totalAdvance).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto no-scrollbar scrollbar-none scrollbar-hide px-[16px] flex-1 max-h-[430px] pb-[44px]">
        {transformed.length === 0 ? (
          <div className="flex flex-col items-center justify-center">
            <div className="w-[64px] h-[64px] rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 12H24M8 20H24M8 28H24" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[14px] font-medium text-[#9E9E9E] text-center mt-4">No advance records found</p>
          </div>
        ) : (
          transformed.map((item) => (
            <div
              key={item.id}
              className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[8px] min-w-[330px]"
            >
              <div className="flex-1 bg-white rounded-[8px] h-full px-[12px] py-[12px] transition-all duration-300 ease-out">
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
                      className={`px-[8px] py-[2px] rounded-full text-[10px] font-medium flex items-center gap-[4px] ${getTypeBadgeClass(
                        item.type
                      )}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.type === 'Advance'
                            ? 'bg-[#2E7D32]'
                            : item.type === 'Bill Settlement'
                              ? 'bg-[#1976D2]'
                              : item.type === 'Refund'
                                ? 'bg-[#F57C00]'
                                : item.type === 'Transfer'
                                  ? ''
                                  : ''
                        }`}
                      />
                      {item.type === 'Transfer' && !item.paymentMode ? 'Online' : (item.paymentMode || '')}
                    </span>
                  </div>
                  {/* Row 2: entityName and empty space */}
                  <div className="flex items-center justify-between">
                    <p
                      className="text-[12px] font-semibold text-black leading-snug break-words"
                      style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                    >
                      {item.entityName || 'N/A'}
                    </p>
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
                    ) : (
                      <p
                        className={`text-[12px] font-semibold block leading-snug ${
                          item.amount < 0 ? 'text-[#E4572E]' : 'text-[#007233]'
                        }`}
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
                      <span className="text-[12px] font-medium text-[#007233] leading-snug">
                        ₹{parseFloat(item.entry?.bill_amount || item.amount || 0).toLocaleString('en-IN')}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Select Week & Year modal - same style as DatePickerModal.jsx, week shown as "Week 1", "Week 2", etc. */}
      {showWeekYearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center" onClick={() => setShowWeekYearModal(false)}>
          <div className="bg-white w-[320px] rounded-[6px] p-[24px] relative" onClick={(e) => e.stopPropagation()}>
            <p className="text-[16px] font-medium text-black text-center mb-6">Select Week & Year</p>
            <div className="flex justify-center gap-[32px] mb-6">
              {/* Week column - show "Week 1", "Week 2", ... like 2nd image */}
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
              <div
                className="flex flex-col items-center relative"
                onWheel={(e) => handleYearWheel(e, e.deltaY > 0 ? 1 : -1)}
              >
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

      {/* Date Range calendar modal (like 5th image) */}
      {showDateRangeModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={() => setShowDateRangeModal(false)}>
          <div className="bg-white rounded-xl shadow-lg w-[95%] max-w-[340px] p-[16px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <button type="button" onClick={() => setCalendarView(new Date(calendarView.getFullYear(), calendarView.getMonth() - 1))} className="p-[8px] text-black">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <span className="text-[16px] font-semibold">
                {calendarView.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </span>
              <button type="button" onClick={() => setCalendarView(new Date(calendarView.getFullYear(), calendarView.getMonth() + 1))} className="p-[8px] text-black">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-[2px] text-center text-[12px] font-medium text-[#9E9E9E] mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-[2px]">
              {(() => {
                const y = calendarView.getFullYear();
                const m = calendarView.getMonth();
                const first = new Date(y, m, 1);
                const last = new Date(y, m + 1, 0);
                const startPad = (first.getDay() + 7) % 7;
                const days = [];
                for (let i = 0; i < startPad; i++) days.push(null);
                for (let d = 1; d <= last.getDate(); d++) days.push(new Date(y, m, d));
                const isInRange = (d) => {
                  if (!d || !rangeStart) return false;
                  const t = d.getTime();
                  const rs = rangeStart.getTime();
                  const re = rangeEnd ? rangeEnd.getTime() : rs;
                  const low = Math.min(rs, re);
                  const high = Math.max(rs, re);
                  return t >= low && t <= high;
                };
                const isStartOrEnd = (d) => {
                  if (!d) return false;
                  const t = d.getTime();
                  return (rangeStart && t === rangeStart.getTime()) || (rangeEnd && t === rangeEnd.getTime());
                };
                return days.map((d, i) => {
                  if (!d) return <div key={`e-${i}`} />;
                  const inRange = isInRange(d);
                  const highlight = isStartOrEnd(d);
                  return (
                    <button
                      key={d.toISOString()}
                      type="button"
                      onClick={() => {
                        if (!rangeStart || (rangeStart && rangeEnd)) {
                          setRangeStart(d);
                          setRangeEnd(null);
                        } else {
                          setRangeEnd(d);
                        }
                      }}
                      className={`h-9 rounded text-[13px] font-medium ${highlight ? 'bg-black text-white' : inRange ? 'bg-gray-200 text-black' : 'text-black hover:bg-gray-100'}`}
                    >
                      {d.getDate()}
                    </button>
                  );
                });
              })()}
            </div>
            <div className="flex justify-between mt-4 gap-[8px]">
              <button type="button" onClick={() => { setRangeStart(null); setRangeEnd(null); }} className="text-[14px] font-semibold text-[#9E9E9E]">
                Clear
              </button>
              <div className="flex gap-[8px]">
                <button type="button" onClick={() => setShowDateRangeModal(false)} className="px-[16px] py-[8px] text-[14px] font-semibold text-[#9E9E9E]">
                  Cancel
                </button>
                <button type="button" onClick={applyDateRange} className="px-[16px] py-[8px] text-[14px] font-semibold text-white bg-[#E4572E] rounded">
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40" onClick={() => setShowFilterModal(false)}>
          <div className="bg-white rounded-t-2xl w-full max-w-[360px] p-[16px] relative" onClick={(e) => e.stopPropagation()}>
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

            <div className="flex flex-col gap-[16px] mb-3">
              {/* Vendor/Contractor Filter */}
              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Vendor/Contractor</p>
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
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    ) : (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L6 6L11 1" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    ) : (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L6 6L11 1" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-[16px]">
              <button
                type="button"
                onClick={() => {
                  setVendorContractorFilter('');
                  setProjectNameFilter('');
                  setShowFilterModal(false);
                }}
                className="px-[24px] py-[8px] text-[14px] font-semibold text-black border border-[rgba(0,0,0,0.16)] rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="px-[24px] py-[8px] text-[14px] font-semibold text-white bg-black rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <SelectVendorModal
        isOpen={showPaymentModeModal}
        onClose={() => setShowPaymentModeModal(false)}
        onSelect={(value) => {
          setPaymentModeFilter(value);
          setShowPaymentModeModal(false);
        }}
        selectedValue={paymentModeFilter}
        options={defaultPaymentModeOptions.map((opt) => opt.label)}
        fieldName="Payment Mode"
        showStarIcon={false}
      />

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
        fieldName="Vendor/Contractor"
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
            className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[60vh] flex flex-col"
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
            <div className="px-[24px] pt-[16px] pb-[16px]">
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
            <div className="flex-1 overflow-y-auto mb-4 px-[24px] [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="shadow-md rounded-lg overflow-hidden">
                {(['Advance', 'Bill Settlement', 'Transfer', 'Refund']
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
                        {/* Left: Option Text */}
                        <div className="flex items-center gap-[12px] flex-1 min-w-0">
                          <p className="text-[14px] font-medium text-black text-left truncate">{type}</p>
                        </div>

                        {/* Right: Radio Button */}
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
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <img src={Pen} alt="Pen" className="w-[74px] h-[74px]" />
            </div>

            {/* Title */}
            <h3 className="text-[18px] font-bold text-gray-500 text-opacity-70 text-center mb-4">Description!</h3>

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

export default Report;
