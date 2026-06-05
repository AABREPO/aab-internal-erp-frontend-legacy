import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import jsPDF from "jspdf";
import "jspdf-autotable";
import Select from 'react-select';
import CustomDateField from '../ExpensesEntry/CustomDateField';
import Filter from '../Images/TableFilter.svg'
import Search from '../Images/Searchnew.svg'
import Reload from '../Images/Clear.svg'
import Pdf from '../Images/pdf.png';
import XL from '../Images/sheets.png';
import { sum } from 'mathjs';
import edit from '../Images/Edit.svg';
import history from '../Images/History.svg';
import remove from '../Images/Delete.svg';
import Attach from '../Images/Attachfile.svg';
import cross from '../Images/cross.png';
import {
  EDBC_IDS,
  DATABASE_TABLE_FILTER_SELECT_STYLES,
  getEdbcColumnConfig,
  useEdbcExpandedCells,
  EdbcTableHeaderRow,
  EdbcTableFilterRow,
  EdbcTableBodyRow,
  EdbcColumnHeader,
  EdbcTimestampFilter,
  EdbcDateFilter,
  EdbcProjectNameFilter,
  EdbcSelectFilter,
  EdbcTextInputFilter,
  EdbcTotalAmountFilter,
  EdbcEmptyFilterCell,
  EdbcTimestampBodyCell,
  EdbcDateBodyCell,
  EdbcExpandableBodyCell,
  EdbcFileBodyCell,
  EDBC_TABLE_EDGE_TABLE_CLASS,
} from '../ExpensesEntry/databaseExpensesSharedColumns';
import { syncWeeklyPaymentBillsForAdvancePortal, isAdvanceOnlinePaymentModeForModal, fetchWeeklyPaymentBillsByAdvancePortalId, getAdvancePortalDisplayAmount, syncExpensesEntryFromAdvancePortalEdit, resolveAdvancePortalExpensesEntryId, clearAdvancePortalRecordsOnDelete, deleteLinkedExpenseEntryOnAdvancePortalDelete, formatWeeklyBillDeleteMessage } from '../../utils/advancePortalWeeklyPaymentBill';
import AdvancePortalEditPaymentModal from './AdvancePortalEditPaymentModal';

const AdvanceDatabase = ({ username, userRoles = [], paymentModeOptions = [], refreshSignal }) => {
  const BLANK_VALUE = 'BLANK';
  const BLANK_LABEL = 'Blank';
  const blankOption = { value: BLANK_VALUE, label: BLANK_LABEL };
  const isBlankish = (value) =>
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '') ||
    value === 0 ||
    value === '0';
  const resolveActiveBranchId = useCallback(() => {
    try {
      const selectedBranchId = localStorage.getItem("selectedBranchId");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const fallbackBranchId = user?.branchId ?? user?.branch_id ?? user?.brachId;
      const resolved = Number(selectedBranchId || fallbackBranchId);
      return Number.isFinite(resolved) && resolved > 0 ? resolved : null;
    } catch {
      return null;
    }
  }, []);
  const [activeBranchId, setActiveBranchId] = useState(() => resolveActiveBranchId());
  const buildBranchUrl = useCallback((baseUrl) => {
    const url = new URL(baseUrl);
    if (activeBranchId !== null && activeBranchId !== undefined && activeBranchId !== "") {
      url.searchParams.set("branchId", String(activeBranchId));
    }
    return url.toString();
  }, [activeBranchId]);
  const [isUploading, setIsUploading] = useState(false);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [combinedOptions, setCombinedOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  const [advanceData, setAdvanceData] = useState([]);
  const [selectTimeStampDate, setSelectTimeStampDate] = useState('');
  const [selectDatabaseDate, setSelectDatabaseDate] = useState('');
  const [selectDatabaseContractororVendorName, setSelectDatabaseContractororVendorName] = useState('');
  const [selectDatabaseProjectName, setSelectDatabaseProjectName] = useState('');
  const [selectDatabaseTransfer, setSelectDatabaseTransfer] = useState('');
  const [selectDatabaseType, setSelectDatabaseType] = useState('');
  const [selectDatabaseDescription, setSelectDatabaseDescription] = useState('');
  const [selectDatabaseMode, setSelectDatabaseMode] = useState('');
  const [selectDatabaseEntryNo, setSelectDatabaseEntryNo] = useState('');
  const [selectDatabaseSourceFrom, setSelectDatabaseSourceFrom] = useState('');
  const [selectDatabaseBranch, setSelectDatabaseBranch] = useState('');
  const [selectDatabaseEnteredBy, setSelectDatabaseEnteredBy] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAdvancePortalModal, setShowAdvancePortalModal] = useState(false);
  const [file, setFile] = useState(null);
  const [advancePortalAudits, setAdvancePortalAudits] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [overallSearch, setOverallSearch] = useState('');
  const [showTimestampDatePicker, setShowTimestampDatePicker] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestingEntry, setRequestingEntry] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [overallAdvance, setOverallAdvance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const pendingAdvanceUpdateRef = useRef(null);
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
  const [isEditPaymentSubmitting, setIsEditPaymentSubmitting] = useState(false);
  const [editPaymentModalData, setEditPaymentModalData] = useState({
    chequeNo: '',
    chequeDate: '',
    transactionNumber: '',
    accountNumber: '',
  });
  const [accountDetails, setAccountDetails] = useState([]);
  const adminUsernames = ['Mahalingam M', 'Admin'];
  const normalizedUsername = (username || '').trim().toLowerCase();
  const isAdminUser = adminUsernames.some(name => name.toLowerCase() === normalizedUsername);
  const isAdmin = isAdminUser ;
  const defaultPaymentModeOptions = [
    { value: 'Cash', label: 'Cash' },
    { value: 'GPay', label: 'GPay' },
    { value: 'PhonePe', label: 'PhonePe' },
    { value: 'Net Banking', label: 'Net Banking' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'Direct', label: 'Direct' }
  ];
  const [backendPaymentModeOptions, setBackendPaymentModeOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const finalPaymentModeOptions = backendPaymentModeOptions.length > 0 ? backendPaymentModeOptions : paymentModeOptions.length > 0 ? paymentModeOptions : defaultPaymentModeOptions;

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch('https://backendaab.in/demoAabuildersDash/api/branch/getAll', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to fetch branches');
        const data = await response.json();
        setBranchOptions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching branches:', error);
        setBranchOptions([]);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const response = await fetch('https://backendaab.in/demoAabuildersDash/api/account-details/getAll');
        if (response.ok) {
          const data = await response.json();
          setAccountDetails(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    };
    fetchAccountDetails();
  }, []);

  useEffect(() => {
    const fetchPaymentModes = async () => {
      try {
        const response = await fetch('https://backendaab.in/demoAabuildersDash/api/payment_mode/getAll');
        if (response.ok) {
          const data = await response.json();
          const options = Array.isArray(data)
            ? data
              .filter(mode => mode.modeOfPayment)
              .map(mode => ({ value: mode.modeOfPayment, label: mode.modeOfPayment }))
            : [];
          setBackendPaymentModeOptions(options);
        }
      } catch (error) {
        console.error('Error fetching payment modes:', error);
      }
    };
    fetchPaymentModes();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  useEffect(() => {
    const isPageRefresh = sessionStorage.getItem('advanceDatabasePageLoaded') === null;
    if (isPageRefresh) {
      sessionStorage.removeItem('advanceDatabaseFilters');
      sessionStorage.setItem('advanceDatabasePageLoaded', 'true');
    } else {
      const savedFilters = sessionStorage.getItem('advanceDatabaseFilters');
      if (savedFilters) {
        try {
          const filters = JSON.parse(savedFilters);
          if (filters.selectTimeStampDate) setSelectTimeStampDate(filters.selectTimeStampDate);
          if (filters.selectDatabaseDate) setSelectDatabaseDate(filters.selectDatabaseDate);
          if (filters.selectDatabaseContractororVendorName) setSelectDatabaseContractororVendorName(filters.selectDatabaseContractororVendorName);
          if (filters.selectDatabaseProjectName) setSelectDatabaseProjectName(filters.selectDatabaseProjectName);
          if (filters.selectDatabaseTransfer) setSelectDatabaseTransfer(filters.selectDatabaseTransfer);
          if (filters.selectDatabaseType) setSelectDatabaseType(filters.selectDatabaseType);
          if (filters.selectDatabaseDescription) setSelectDatabaseDescription(filters.selectDatabaseDescription);
          if (filters.selectDatabaseMode) setSelectDatabaseMode(filters.selectDatabaseMode);
          if (filters.selectDatabaseEntryNo) setSelectDatabaseEntryNo(filters.selectDatabaseEntryNo);
          if (filters.selectDatabaseSourceFrom) setSelectDatabaseSourceFrom(filters.selectDatabaseSourceFrom);
          if (filters.selectDatabaseBranch) setSelectDatabaseBranch(filters.selectDatabaseBranch);
          if (filters.selectDatabaseEnteredBy) setSelectDatabaseEnteredBy(filters.selectDatabaseEnteredBy);
          if (filters.startDate) setStartDate(filters.startDate);
          if (filters.endDate) setEndDate(filters.endDate);
          if (filters.overallSearch) setOverallSearch(filters.overallSearch);
          if (filters.showFilters !== undefined) setShowFilters(filters.showFilters);
        } catch (error) {
          console.error('Error loading filters from sessionStorage:', error);
        }
      }
    }
    return () => {
      sessionStorage.setItem('advanceDatabasePageLoaded', 'true');
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const entries = performance.getEntriesByType('navigation');
      const navigationType = entries.length > 0 ? entries[0].type : null;

      if (navigationType === 'reload') {
        sessionStorage.removeItem('advanceDatabasePageLoaded');
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const filters = {
      selectTimeStampDate,
      selectDatabaseDate,
      selectDatabaseContractororVendorName,
      selectDatabaseProjectName,
      selectDatabaseTransfer,
      selectDatabaseType,
      selectDatabaseDescription,
      selectDatabaseMode,
      selectDatabaseEntryNo,
      selectDatabaseSourceFrom,
      selectDatabaseBranch,
      selectDatabaseEnteredBy,
      startDate,
      endDate,
      overallSearch,
      showFilters
    };
    sessionStorage.setItem('advanceDatabaseFilters', JSON.stringify(filters));
  }, [selectTimeStampDate, selectDatabaseDate, selectDatabaseContractororVendorName, selectDatabaseProjectName, selectDatabaseTransfer, selectDatabaseType, selectDatabaseDescription, selectDatabaseMode, selectDatabaseEntryNo, selectDatabaseSourceFrom, selectDatabaseBranch, selectDatabaseEnteredBy, startDate, endDate, overallSearch, showFilters]);
  const scrollRef = useRef(null);
  const filterRowRef = useRef(null);
  const filterNudgeUsedRef = useRef(false);
  const filterScrollResetSkipRef = useRef(true);
  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const scroll = useRef({ left: 0, top: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);
  const lastMove = useRef({ time: 0, x: 0, y: 0 });
  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    start.current = { x: e.clientX, y: e.clientY };
    scroll.current = {
      left: scrollRef.current.scrollLeft,
      top: scrollRef.current.scrollTop,
    };
    lastMove.current = {
      time: Date.now(),
      x: e.clientX,
      y: e.clientY,
    };
    scrollRef.current.style.cursor = 'grabbing';
    scrollRef.current.style.userSelect = 'none';
    cancelMomentum();
  };
  const handleMouseMove = (e) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    const now = Date.now();
    const dt = now - lastMove.current.time || 16;
    velocity.current = {
      x: (e.clientX - lastMove.current.x) / dt,
      y: (e.clientY - lastMove.current.y) / dt,
    };
    scrollRef.current.scrollLeft = scroll.current.left - dx;
    scrollRef.current.scrollTop = scroll.current.top - dy;
    filterNudgeUsedRef.current = false;
    lastMove.current = {
      time: now,
      x: e.clientX,
      y: e.clientY,
    };
  };
  const handleMouseUp = () => {
    if (!isDragging.current || !scrollRef.current) return;
    isDragging.current = false;
    scrollRef.current.style.cursor = '';
    scrollRef.current.style.userSelect = '';
    applyMomentum();
  };
  const cancelMomentum = () => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
  };
  const applyMomentum = () => {
    if (!scrollRef.current) return;
    const friction = 0.95;
    const minVelocity = 0.1;
    const step = () => {
      const { x, y } = velocity.current;
      if (!scrollRef.current) return;
      if (Math.abs(x) > minVelocity || Math.abs(y) > minVelocity) {
        scrollRef.current.scrollLeft -= x * 20;
        scrollRef.current.scrollTop -= y * 20;
        velocity.current.x *= friction;
        velocity.current.y *= friction;
        animationFrame.current = requestAnimationFrame(step);
      } else {
        cancelMomentum();
      }
    };
    animationFrame.current = requestAnimationFrame(step);
  };
  useEffect(() => {
    return () => cancelMomentum();
  }, []);

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, "");

    if (!isNaN(rawValue)) {
      setEditFormData(prev => {
        const numericValue = rawValue === "" ? "" : Number(rawValue);
        if (prev.type === "Refund") {
          return { ...prev, refund_amount: numericValue, amount: '' };
        }
        return { ...prev, amount: numericValue, refund_amount: '' };
      });
    }
  };
  const formatWithCommas = (value) => {
    if (value === '' || value === null || value === undefined) return "";
    const numericValue = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(numericValue)) {
      return value.toString();
    }
    return numericValue.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  };
  const sanitizeNumberField = (value) => {
    if (value === '' || value === null || value === undefined) return 0;
    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? 0 : numericValue;
  };
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };
  useEffect(() => {
    const fetchVendorNames = async () => {
      try {
        setProgress(10);
        const response = await fetch("https://backendaab.in/demoAabuilderDash/api/vendor_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          throw new Error("Network response was not ok: " + response.statusText);
        }
        const data = await response.json();
        const formattedData = data.map(item => ({
          value: item.vendorName,
          label: item.vendorName,
          id: item.id,
          type: "Vendor",
        }));
        setVendorOptions(formattedData);
        setProgress(25);
      } catch (error) {
        console.error("Fetch error: ", error);
        setError("Failed to load vendor data");
      }
    };
    fetchVendorNames();
  }, []);
  useEffect(() => {
    const fetchContractorNames = async () => {
      try {
        setProgress(35);
        const response = await fetch("https://backendaab.in/demoAabuilderDash/api/contractor_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          throw new Error("Network response was not ok: " + response.statusText);
        }
        const data = await response.json();
        const formattedData = data.map(item => ({
          value: item.contractorName,
          label: item.contractorName,
          id: item.id,
          type: "Contractor",
        }));
        setContractorOptions(formattedData);
        setProgress(50);
      } catch (error) {
        console.error("Fetch error: ", error);
        setError("Failed to load contractor data");
      }
    };
    fetchContractorNames();
  }, []);
  const [categoryOptions, setCategoryOptions] = useState([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://backendaab.in/demoAabuilderDash/api/expenses_categories/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Network response was not ok: " + response.statusText);
        const data = await response.json();
        setCategoryOptions(
          data.map((item) => ({
            id: item.id,
            value: item.category,
            label: item.category,
          }))
        );
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchCategories();
  }, []);
  useEffect(() => { setCombinedOptions([...vendorOptions, ...contractorOptions]); }, [vendorOptions, contractorOptions]);
  const exportPDF = () => {
    const doc = new jsPDF("l", "pt", "a4");
    const headers = [
      [
        "Time Stamp",
        "Date",
        "Contractor/Vendor",
        "Project Name",
        "Transfer Site",
        "Advance",
        "Bill Payment",
        "Refund",
        "Type",
        "Description",
        "Mode",
        "E.No"
      ]
    ];
    const rows = sortedData.map((entry) => [
      formatDate(entry.timestamp),
      formatDateOnly(entry.date),
      entry.vendor_id
        ? getVendorName(entry.vendor_id)
        : getContractorName(entry.contractor_id),
      getSiteName(entry.project_id),
      getSiteName(entry.transfer_site_id),
      entry.amount != null && entry.amount !== ""
        ? Number(entry.amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.bill_amount != null && entry.bill_amount !== ""
        ? Number(entry.bill_amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.refund_amount != null && entry.refund_amount !== ""
        ? Number(entry.refund_amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.type,
      entry.description,
      entry.payment_mode,
      entry.entry_no
    ]);
    doc.setFontSize(16);
    doc.text("Transaction Report", 24, 18);
    doc.autoTable({
      head: [headers[0]],
      body: rows,
      startY: 30,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineWidth: 0.3, 
        lineColor: [100, 100, 100],
        halign: "left"
      },
      headStyles: {
        fillColor: false, 
        textColor: [0, 0, 0],
        fontStyle: "bold",
        lineWidth: 0.3,
        lineColor: [100, 100, 100]
      },
      bodyStyles: {
        fillColor: false,
        textColor: [0, 0, 0],
        lineWidth: 0.3,
        lineColor: [100, 100, 100]
      },
      tableLineWidth: 0.3,
      tableLineColor: [100, 100, 100],
      columnStyles: {
        5: { halign: 'right' },
        6: { halign: 'right' }, 
        7: { halign: 'right' } 
      }
    });
    doc.save("Transaction_Report.pdf");
  };
  const exportCSV = () => {
    const headers = [
      "Time Stamp",
      "Date",
      "Contractor/Vendor",
      "Project Name",
      "Transfer Site",
      "Advance",
      "Bill Payment",
      "Refund",
      "Type",
      "Description",
      "Mode",
      "E.No"
    ];
    const rows = sortedData.map(entry => [
      formatDate(entry.timestamp),
      formatDateOnly(entry.date),
      entry.vendor_id
        ? getVendorName(entry.vendor_id)
        : getContractorName(entry.contractor_id),
      getSiteName(entry.project_id),
      getSiteName(entry.transfer_site_id),
      entry.amount != null && entry.amount !== ""
        ? Number(entry.amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.bill_amount != null && entry.bill_amount !== ""
        ? Number(entry.bill_amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.refund_amount != null && entry.refund_amount !== ""
        ? Number(entry.refund_amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.type || "",
      entry.description || "",
      entry.payment_mode || "",
      entry.entry_no || ""
    ]);
    let csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(row => row.map(value => `"${value}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Transaction_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  useEffect(() => {
    const fetchSites = async () => {
      try {
        setProgress(60);
        const response = await fetch("https://backendaab.in/demoAabuilderDash/api/project_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          throw new Error("Network response was not ok: " + response.statusText);
        }
        const data = await response.json();
        const formattedData = data.map(item => ({
          value: item.siteName,
          label: item.siteName,
          id: item.id,
          sNo: item.siteNo
        }));
        const predefinedSiteOptions = [
          { value: "Mason Advance", label: "Mason Advance", id: 1, sNo: "1" },
          { value: "Material Advance", label: "Material Advance", id: 2, sNo: "2" },
          { value: "Weekly Advance", label: "Weekly Advance", id: 3, sNo: "3" },
          { value: "Excess Advance", label: "Excess Advance", id: 4, sNo: "4" },
          { value: "Material Rent", label: "Material Rent", id: 5, sNo: "5" },
          { value: "Subhash Kumar - Kunnur", label: "Subhash Kumar - Kunnur", id: 6, sNo: "6" },
          { value: "Summary Bill", label: "Summary Bill", id: 7, sNo: "7" },
          { value: "Daily Wage", label: "Daily Wage", id: 8, sNo: "8" },
          { value: "Rent Management Portal", label: "Rent Management Portal", id: 9, sNo: "9" },
          { value: "Multi-Project Batch", label: "Multi-Project Batch", id: 10, sNo: "10" },
          { value: "Loan Portal", label: "Loan Portal", id: 11, sNo: "11" },
        ];
        // Combine backend data with predefined options
        const combinedSiteOptions = [...predefinedSiteOptions, ...formattedData];
        setSiteOptions(combinedSiteOptions);
        setProgress(75);
      } catch (error) {
        console.error("Fetch error: ", error);
        const predefinedSiteOptions = [
          { value: "Mason Advance", label: "Mason Advance", id: 1, sNo: "1" },
          { value: "Material Advance", label: "Material Advance", id: 2, sNo: "2" },
          { value: "Weekly Advance", label: "Weekly Advance", id: 3, sNo: "3" },
          { value: "Excess Advance", label: "Excess Advance", id: 4, sNo: "4" },
          { value: "Material Rent", label: "Material Rent", id: 5, sNo: "5" },
          { value: "Subhash Kumar - Kunnur", label: "Subhash Kumar - Kunnur", id: 6, sNo: "6" },
          { value: "Summary Bill", label: "Summary Bill", id: 7, sNo: "7" },
          { value: "Daily Wage", label: "Daily Wage", id: 8, sNo: "8" },
          { value: "Rent Management Portal", label: "Rent Management Portal", id: 9, sNo: "9" },
          { value: "Multi-Project Batch", label: "Multi-Project Batch", id: 10, sNo: "10" },
          { value: "Loan Portal", label: "Loan Portal", id: 11, sNo: "11" },
        ];
        setSiteOptions(predefinedSiteOptions);
        setProgress(75);
      }
    };
    fetchSites();
  }, []);
  useEffect(() => {
    const syncBranch = () => {
      const nextBranchId = resolveActiveBranchId();
      setActiveBranchId((prevBranchId) =>
        prevBranchId === nextBranchId ? prevBranchId : nextBranchId
      );
    };
    syncBranch();
    window.addEventListener("branchSelectionChanged", syncBranch);
    return () => {
      window.removeEventListener("branchSelectionChanged", syncBranch);
    };
  }, [resolveActiveBranchId]);
  const fetchAdvanceData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      setProgress(85);
      const response = await fetch(buildBranchUrl('https://backendaab.in/demoAabuildersDash/api/advance_portal/getAll'));
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setAdvanceData(Array.isArray(data) ? data : []);
      setProgress(100);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching advance portal data:', error);
      setError('Failed to load advance data');
      setLoading(false);
    }
  }, [buildBranchUrl]);

  useEffect(() => {
    fetchAdvanceData();
  }, [fetchAdvanceData]);

  useEffect(() => {
    if (refreshSignal === undefined) return;
    fetchAdvanceData();
  }, [refreshSignal, fetchAdvanceData]);
  const sortedSiteOptions = siteOptions.sort((a, b) =>
    a.label.localeCompare(b.label)
  );
  const customStyles = useMemo(() => ({
    control: (provided, state) => ({
      ...provided,
      borderWidth: '2px',
      lineHeight: '20px',
      fontSize: '12px',
      height: '45px',
      borderRadius: '8px',
      padding: '0.25rem',
      textAlign: 'left',
      borderColor: 'rgba(191, 152, 83, 0.2)',
      boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.4)' : 'none',
      '&:hover': {
        borderColor: 'rgba(191, 152, 83, 0.4)',
      },
    }),
    clearIndicator: (provided) => ({
      ...provided,
      cursor: 'pointer',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 999,
      maxHeight: '300px',
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: '250px',
      overflowY: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      '&::-webkit-scrollbar': { display: 'none' },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#111827',
    }),
    option: (provided, state) => ({
      ...provided,
      textAlign: 'left',
      fontWeight: 'normal',
      fontSize: '15px',
      backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
      color: 'black',
    }),
    input: (provided) => ({
      ...provided,
      fontWeight: '300',
      color: 'black',
      textAlign: 'left',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#6B7280',
      textAlign: 'left',
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      display: 'none',
    }),
  }), []);
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
    e.target.value = '';
  };
  const handleUpload = async () => {
    if (!file) {
      alert("Please choose a file before uploading.");
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("https://backendaab.in/demoAabuildersDash/api/advance_portal/upload-sql", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const result = await response.text(); 
        alert("File uploaded successfully!");
        await fetchAdvanceData();
      } else {
        const errorText = await response.text();
        alert("Upload failed: " + errorText);
        console.error(errorText);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while uploading the file.");
    } finally {
      setIsUploading(false);
      setIsOpen(false);
    }
  };
  const formatDateOnly = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  const getVendorName = (id) =>
    vendorOptions.find(v => v.id === id)?.value || "";

  const getContractorName = (id) =>
    contractorOptions.find(c => c.id === id)?.value || "";

  const getSiteName = (id) =>
    siteOptions.find(s => String(s.id) === String(id))?.value || "";
  const getAdvanceRecordId = (entry) =>
    Number(entry?.advancePortalId ?? entry?.id ?? 0);
  const compareByAdvanceIdDesc = (a, b) =>
    getAdvanceRecordId(b) - getAdvanceRecordId(a);

  const getBranchName = (id) =>
    branchOptions.find(b => String(b.id) === String(id))?.branch || "";

  const filteredData = advanceData.filter((entry) => {
    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      const entryDate = new Date(entry.date);
      if (entryDate < s || entryDate > e) return false;
    } else if (startDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      const entryDate = new Date(entry.date);
      if (entryDate < s) return false;
    } else if (endDate) {
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      const entryDate = new Date(entry.date);
      if (entryDate > e) return false;
    }
    if (selectTimeStampDate) {
      const selectedDate = new Date(selectTimeStampDate);
      const entryTimestamp = new Date(entry.timestamp);
      if (selectedDate.toDateString() !== entryTimestamp.toDateString()) {
        return false;
      }
    }
    if (selectDatabaseDate) {
      const [year, month, day] = selectDatabaseDate.split("-");
      const formattedSelectDate = `${parseInt(day)}-${parseInt(month)}-${year}`;
      const entryDateObj = new Date(entry.date);
      const formattedEntryDate = `${entryDateObj.getDate()}-${entryDateObj.getMonth() + 1}-${entryDateObj.getFullYear()}`;
      if (formattedEntryDate !== formattedSelectDate) return false;
    }
    if (selectDatabaseContractororVendorName) {
      const name = entry.vendor_id
        ? getVendorName(entry.vendor_id)
        : getContractorName(entry.contractor_id) || "";
      if (selectDatabaseContractororVendorName === BLANK_VALUE) {
        if (!isBlankish(name)) return false;
      } else {
        if (name.toLowerCase() !== selectDatabaseContractororVendorName.toLowerCase()) return false;
      }
    }
    if (selectDatabaseProjectName) {
      const projectName = getSiteName(entry.project_id) || "";
      if (selectDatabaseProjectName === BLANK_VALUE) {
        if (!isBlankish(projectName)) return false;
      } else {
        if (projectName.toLowerCase() !== selectDatabaseProjectName.toLowerCase()) return false;
      }
    }
    if (selectDatabaseTransfer) {
      const transferName = getSiteName(entry.transfer_site_id) || "";
      if (selectDatabaseTransfer === BLANK_VALUE) {
        if (!isBlankish(transferName)) return false;
      } else {
        if (transferName.toLowerCase() !== selectDatabaseTransfer.toLowerCase()) return false;
      }
    }
    if (selectDatabaseType) {
      if (selectDatabaseType === BLANK_VALUE) {
        if (!isBlankish(entry.type)) return false;
      } else {
        if (entry.type?.toLowerCase() !== selectDatabaseType.toLowerCase()) return false;
      }
    }
    if (selectDatabaseDescription.trim()) {
      if (!String(entry.description ?? '').toLowerCase().includes(selectDatabaseDescription.toLowerCase().trim())) return false;
    }
    if (selectDatabaseMode) {
      if (selectDatabaseMode === BLANK_VALUE) {
        if (!isBlankish(entry.payment_mode)) return false;
      } else {
        if (entry.payment_mode?.toLowerCase() !== selectDatabaseMode.toLowerCase()) return false;
      }
    }
    if (selectDatabaseEntryNo) {
      if (selectDatabaseEntryNo === BLANK_VALUE) {
        if (!isBlankish(entry.entry_no)) return false;
      } else {
        if (!entry.entry_no?.toString().includes(selectDatabaseEntryNo.toString())) return false;
      }
    }
    if (selectDatabaseSourceFrom) {
      const sourceVal = entry.source_from ?? entry.sourceFrom ?? entry.source ?? "";
      if (selectDatabaseSourceFrom === BLANK_VALUE) {
        if (!isBlankish(sourceVal)) return false;
      } else {
        if (String(sourceVal).toLowerCase() !== String(selectDatabaseSourceFrom).toLowerCase()) return false;
      }
    }
    if (selectDatabaseBranch) {
      const branchVal = entry.branch_id ?? entry.branchId ?? '';
      if (selectDatabaseBranch === BLANK_VALUE) {
        if (!isBlankish(branchVal)) return false;
      } else {
        if (String(branchVal) !== String(selectDatabaseBranch)) return false;
      }
    }
    if (selectDatabaseEnteredBy) {
      const enteredVal = entry.enteredBy ?? entry.entered_by ?? entry.request_send_by ?? entry.requested_by ?? entry.createdBy ?? entry.created_by ?? "";
      if (selectDatabaseEnteredBy === BLANK_VALUE) {
        if (!isBlankish(enteredVal)) return false;
      } else {
        if (String(enteredVal).toLowerCase() !== String(selectDatabaseEnteredBy).toLowerCase()) return false;
      }
    }
    if (overallSearch.trim()) {
      const q = overallSearch.toLowerCase().trim();
      const searchable = [
        formatDate(entry.timestamp),
        formatDateOnly(entry.date),
        entry.vendor_id ? getVendorName(entry.vendor_id) : getContractorName(entry.contractor_id),
        getSiteName(entry.project_id),
        getSiteName(entry.transfer_site_id),
        entry.amount,
        entry.bill_amount,
        entry.refund_amount,
        entry.type,
        entry.description,
        entry.payment_mode,
        entry.source_from ?? entry.sourceFrom ?? entry.source,
        getBranchName(entry.branch_id ?? entry.branchId),
        entry.enteredBy ?? entry.entered_by ?? entry.request_send_by ?? entry.requested_by ?? entry.createdBy ?? entry.created_by,
        entry.entry_no,
      ]
        .map((v) => String(v ?? '').toLowerCase())
        .join(' ');
      if (!searchable.includes(q)) return false;
    }
    return true;
  });
  // Extract unique values from table data for filter options
  const filterOptionsFromData = React.useMemo(() => {
    const uniqueVendors = new Set();
    const uniqueContractors = new Set();
    const uniqueProjectIds = new Set();
    const uniqueTransferSiteIds = new Set();
    const uniqueTypes = new Set();
    const uniqueModes = new Set();
    const uniqueEntryNos = new Set();
    const uniqueSources = new Set();
    const uniqueBranchIds = new Set();
    const uniqueEnteredBy = new Set();
    let hasBlankVendorContractor = false;
    let hasBlankProject = false;
    let hasBlankTransfer = false;
    let hasBlankType = false;
    let hasBlankMode = false;
    let hasBlankEntryNo = false;
    let hasBlankSource = false;
    let hasBlankBranch = false;
    let hasBlankEnteredBy = false;

    advanceData.forEach(entry => {
      // Extract vendors and contractors
      if (entry.vendor_id) {
        const vendorName = getVendorName(entry.vendor_id);
        if (vendorName) uniqueVendors.add(vendorName);
      }
      if (entry.contractor_id) {
        const contractorName = getContractorName(entry.contractor_id);
        if (contractorName) uniqueContractors.add(contractorName);
      }
      if (!entry.vendor_id && !entry.contractor_id) hasBlankVendorContractor = true;
      
      // Extract project IDs
      if (entry.project_id) {
        const projectName = getSiteName(entry.project_id);
        if (projectName) uniqueProjectIds.add(projectName);
      } else {
        hasBlankProject = true;
      }
      
      // Extract transfer site IDs
      if (entry.transfer_site_id) {
        const transferName = getSiteName(entry.transfer_site_id);
        if (transferName) uniqueTransferSiteIds.add(transferName);
      } else {
        hasBlankTransfer = true;
      }
      
      // Extract types
      if (entry.type) uniqueTypes.add(entry.type);
      else hasBlankType = true;
      
      // Extract payment modes
      if (entry.payment_mode) uniqueModes.add(entry.payment_mode);
      else hasBlankMode = true;
      
      // Extract entry numbers
      if (entry.entry_no) uniqueEntryNos.add(entry.entry_no.toString());
      else hasBlankEntryNo = true;

      const sourceVal = entry.source_from ?? entry.sourceFrom ?? entry.source ?? "";
      if (sourceVal) uniqueSources.add(String(sourceVal));
      else hasBlankSource = true;

      const branchId = entry.branch_id ?? entry.branchId;
      if (branchId != null && branchId !== '') uniqueBranchIds.add(String(branchId));
      else hasBlankBranch = true;

      const enteredVal = entry.enteredBy ?? entry.entered_by ?? entry.request_send_by ?? entry.requested_by ?? entry.createdBy ?? entry.created_by ?? "";
      if (enteredVal) uniqueEnteredBy.add(String(enteredVal));
      else hasBlankEnteredBy = true;
    });

    // Create options arrays for Select components
    const vendorContractorOptions = [
      ...Array.from(uniqueVendors).map(name => {
        const vendor = vendorOptions.find(v => v.value === name);
        return vendor || { value: name, label: name, type: 'Vendor' };
      }),
      ...Array.from(uniqueContractors).map(name => {
        const contractor = contractorOptions.find(c => c.value === name);
        return contractor || { value: name, label: name, type: 'Contractor' };
      })
    ].sort((a, b) => a.label.localeCompare(b.label));
    if (hasBlankVendorContractor) vendorContractorOptions.unshift(blankOption);

    const projectOptions = Array.from(uniqueProjectIds)
      .map(name => {
        const site = siteOptions.find(s => s.value === name);
        return site || { value: name, label: name, id: null };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
    if (hasBlankProject) projectOptions.unshift(blankOption);

    const transferSiteOptions = Array.from(uniqueTransferSiteIds)
      .map(name => {
        const site = siteOptions.find(s => s.value === name);
        return site || { value: name, label: name, id: null };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
    if (hasBlankTransfer) transferSiteOptions.unshift(blankOption);

    const typeOptions = (hasBlankType ? [BLANK_VALUE] : []).concat(Array.from(uniqueTypes).sort());
    const modeOptions = (hasBlankMode ? [BLANK_VALUE] : []).concat(Array.from(uniqueModes).sort());
    const entryNoOptions = (hasBlankEntryNo ? [BLANK_VALUE] : []).concat(
      Array.from(uniqueEntryNos).sort((a, b) => Number(a) - Number(b))
    );

    return {
      vendorContractorOptions,
      projectOptions,
      transferSiteOptions,
      typeOptions,
      modeOptions,
      entryNoOptions,
      sourceFromOptions: (hasBlankSource ? [BLANK_VALUE] : []).concat(Array.from(uniqueSources).sort()),
      branchOptions: Array.from(uniqueBranchIds)
        .map((id) => ({
          value: id,
          label: branchOptions.find((br) => String(br.id) === String(id))?.branch || String(id),
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      enteredByOptions: (hasBlankEnteredBy ? [BLANK_VALUE] : []).concat(Array.from(uniqueEnteredBy).sort()),
    };
  }, [advanceData, vendorOptions, contractorOptions, siteOptions, branchOptions]);
  const sortedData = React.useMemo(() => {
    let sortableData = [...filteredData];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        let aValue, bValue;
        switch (sortConfig.key) {
          case 'timestamp':
            aValue = new Date(a.timestamp);
            bValue = new Date(b.timestamp);
            break;
          case 'date':
            aValue = new Date(a.date);
            bValue = new Date(b.date);
            break;
          case 'entry_no':
            aValue = Number(a.entry_no) || 0;
            bValue = Number(b.entry_no) || 0;
            break;
          case 'vendor':
            aValue = a.vendor_id ? getVendorName(a.vendor_id) : getContractorName(a.contractor_id);
            bValue = b.vendor_id ? getVendorName(b.vendor_id) : getContractorName(b.contractor_id);
            break;
          case 'project':
            aValue = getSiteName(a.project_id);
            bValue = getSiteName(b.project_id);
            break;
          case 'transfer':
            aValue = getSiteName(a.transfer_site_id);
            bValue = getSiteName(b.transfer_site_id);
            break;
          case 'amount':
            aValue = Number(a.amount) || 0;
            bValue = Number(b.amount) || 0;
            break;
          case 'bill_amount':
            aValue = Number(a.bill_amount) || 0;
            bValue = Number(b.bill_amount) || 0;
            break;
          case 'refund_amount':
            aValue = Number(a.refund_amount) || 0;
            bValue = Number(b.refund_amount) || 0;
            break;
          case 'type':
            aValue = a.type || '';
            bValue = b.type || '';
            break;
          case 'description':
            aValue = String(a.description ?? '').toLowerCase();
            bValue = String(b.description ?? '').toLowerCase();
            break;
          case 'mode':
            aValue = a.payment_mode || '';
            bValue = b.payment_mode || '';
            break;
          case 'source':
            aValue = String(a.source_from ?? a.sourceFrom ?? a.source ?? '');
            bValue = String(b.source_from ?? b.sourceFrom ?? b.source ?? '');
            break;
          case 'branch':
            aValue = String(branchOptions.find((br) => String(br.id) === String(a.branch_id ?? a.branchId ?? ''))?.branch || (a.branch ?? a.branch_name ?? a.branchName ?? '')).toLowerCase();
            bValue = String(branchOptions.find((br) => String(br.id) === String(b.branch_id ?? b.branchId ?? ''))?.branch || (b.branch ?? b.branch_name ?? b.branchName ?? '')).toLowerCase();
            break;
          case 'enteredBy':
            aValue = String(a.enteredBy ?? a.entered_by ?? a.request_send_by ?? a.requested_by ?? a.createdBy ?? a.created_by ?? '');
            bValue = String(b.enteredBy ?? b.entered_by ?? b.request_send_by ?? b.requested_by ?? b.createdBy ?? b.created_by ?? '');
            break;
          default:
            return 0;
        }
        if (sortConfig.key === 'timestamp') {
          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return compareByAdvanceIdDesc(a, b);
        }
        if (sortConfig.key === 'date') {
          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return compareByAdvanceIdDesc(a, b);
        }
        if (sortConfig.key === 'entry_no' || sortConfig.key === 'amount' || sortConfig.key === 'bill_amount' || sortConfig.key === 'refund_amount') {
          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return compareByAdvanceIdDesc(a, b);
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return compareByAdvanceIdDesc(a, b);
      });
    } else {
      sortableData.sort(compareByAdvanceIdDesc);
    }
    return sortableData;
  }, [filteredData, sortConfig, branchOptions]);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);
  const { expandedCells, toggleExpandedCell } = useEdbcExpandedCells();
  const edbc8Config = getEdbcColumnConfig(EDBC_IDS.EDBC8);
  const edbc3Config = getEdbcColumnConfig(EDBC_IDS.EDBC3);
  const edbc19TdClass = getEdbcColumnConfig(EDBC_IDS.EDBC19)?.tdClass || '';
  const mapAdvanceSortKeyToEdbc = (key) => {
    if (key === 'project' || key === 'transfer') return 'siteName';
    if (key === 'entry_no') return 'eno';
    if (key === 'mode') return 'paymentMode';
    if (key === 'type') return 'accountType';
    if (key === 'description') return 'comments';
    return key;
  };
  const handleEdbcSort = (edbcField) => {
    const fieldToKey = {
      siteName: 'project',
      eno: 'entry_no',
      paymentMode: 'mode',
      accountType: 'type',
      comments: 'description',
    };
    handleSort(fieldToKey[edbcField] || edbcField);
  };
  const resolveEdbcSortField = (advanceSortKey) =>
    sortConfig.key === advanceSortKey ? mapAdvanceSortKeyToEdbc(advanceSortKey) : '';
  const formatAdvanceAmount = (value) =>
    value != null && value !== ''
      ? `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : '';
  const advCol1Label = 'Time Stamp';
  const advCol2Label = 'Date';
  const advCol3Label = 'Contractor/Vendor';
  const advCol4Label = 'Project Name';
  const advCol5Label = 'Transfer Project';
  const advCol6Label = 'Advance';
  const advCol7Label = 'Bill Payment';
  const advCol8Label = 'Refund';
  const advCol9Label = 'Type';
  const advCol10Label = 'Description';
  const advCol11Label = 'Mode';
  const advCol12Label = 'Source From';
  const advCol13Label = 'Branch';
  const advCol14Label = 'Entered By';
  const advCol15Label = 'Entry No';
  const advCol16Label = 'File';
  const advCol17Label = 'Activity';
  useEffect(() => {
    setCurrentPage(1);
  }, [selectTimeStampDate, selectDatabaseDate, selectDatabaseContractororVendorName, selectDatabaseProjectName, selectDatabaseTransfer, selectDatabaseType, selectDatabaseDescription, selectDatabaseMode, selectDatabaseEntryNo, selectDatabaseSourceFrom, selectDatabaseBranch, selectDatabaseEnteredBy, startDate, endDate, overallSearch]);
  useEffect(() => {
    if (filterScrollResetSkipRef.current) {
      filterScrollResetSkipRef.current = false;
      return;
    }
    if (!showFilters) return;
    const scroller = scrollRef.current;
    if (!scroller) return;
    filterNudgeUsedRef.current = false;
    requestAnimationFrame(() => {
      scroller.scrollTop = 0;
    });
  }, [
    selectTimeStampDate, selectDatabaseDate, selectDatabaseContractororVendorName, selectDatabaseProjectName,
    selectDatabaseTransfer, selectDatabaseType, selectDatabaseDescription, selectDatabaseMode,
    selectDatabaseEntryNo, selectDatabaseSourceFrom, selectDatabaseBranch, selectDatabaseEnteredBy,
    startDate, endDate,
  ]);
  const clearFilters = useCallback(() => {
    setSelectTimeStampDate('');
    setSelectDatabaseDate('');
    setSelectDatabaseContractororVendorName('');
    setSelectDatabaseProjectName('');
    setSelectDatabaseTransfer('');
    setSelectDatabaseType('');
    setSelectDatabaseDescription('');
    setSelectDatabaseMode('');
    setSelectDatabaseEntryNo('');
    setSelectDatabaseSourceFrom('');
    setSelectDatabaseBranch('');
    setSelectDatabaseEnteredBy('');
    setStartDate('');
    setEndDate('');
    setOverallSearch('');
    sessionStorage.removeItem('advanceDatabaseFilters');
  }, []);
  const handleChange = async (selected) => {
    setSelectedOption(selected);
    setEditFormData(prev => {
      if (!prev) return prev;
      if (!selected) {
        return { ...prev, vendor_id: '', contractor_id: '' };
      }
      if (selected.type === 'Vendor') {
        return { ...prev, vendor_id: selected.id, contractor_id: '' };
      }
      if (selected.type === 'Contractor') {
        return { ...prev, contractor_id: selected.id, vendor_id: '' };
      }
      return prev;
    });
    if (!selected) {
      setOverallAdvance(0);
      return;
    }
    try {
      const response = await fetch('https://backendaab.in/demoAabuildersDash/api/advance_portal/getAll');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      const total = data
        .filter(item => {
          return selected.type === 'Vendor'
            ? item.vendor_id === selected.id
            : selected.type === 'Contractor'
              ? item.contractor_id === selected.id
              : false;
        })
        .reduce((sum, curr) => {
          const amount = parseFloat(curr.amount) || 0;
          const billAmount = parseFloat(curr.bill_amount) || 0;
          const refundAmount = parseFloat(curr.refund_amount) || 0;
          return sum + amount - billAmount - refundAmount;
        }, 0);
      setOverallAdvance(total);
    } catch (error) {
      console.error('Error fetching or processing advance data:', error);
      setOverallAdvance(0);
    }
  };
  const totalAdvance = advanceData.reduce(
    (sum, entry) => sum + (Number(entry.amount) || 0),
    0
  );
  const totalBill = advanceData.reduce(
    (sum, entry) => sum + (Number(entry.bill_amount) || 0),
    0
  );
  const totalRefund = advanceData.reduce(
    (sum, entry) => sum + (Number(entry.refund_amount) || 0),
    0
  );
  const totalTransfer = advanceData.reduce((sum, entry) => {
    if (entry.type === "Transfer" && Number(entry.amount) > 0) {
      return sum + Number(entry.amount);
    }
    return sum;
  }, 0);
  const fetchAuditDetails = async (advancePortalId) => {
    try {
      const response = await fetch(`https://backendaab.in/demoAabuildersDash/api/advance_portal/history/${advancePortalId}`);
      const data = await response.json();
      setAdvancePortalAudits(data);
      setShowAdvancePortalModal(true);
    } catch (error) {
      console.error("Error fetching audit details:", error);
    }
  };
  const handleEditClick = (entry) => {
    const sourceVal =
      entry?.source_from ?? entry?.sourceFrom ?? entry?.source ?? '';
    if (String(sourceVal).trim() === 'Loan Portal') return;
    if (!isAdmin && (entry.not_allow_to_edit || entry.allow_to_edit === false)) {
      setRequestingEntry(entry);
      setIsRequestModalOpen(true);
      return;
    }
    setEditingId(entry.advancePortalId);
    setSelectedFile(null); 
    setEditFormData({
      date: entry.date?.split('T')[0] || '',
      amount: entry.amount || '',
      project_id: entry.project_id || '',
      vendor_id: entry.vendor_id || '',
      contractor_id: entry.contractor_id || '',
      entry_no: entry.entry_no || '',
      week_no: entry.week_no || '',
      file_url: entry.file_url || '',
      description: entry.description || '',
      bill_amount: entry.bill_amount || '',
      category: entry.category || '',
      discount_amount: entry.discount_amount ?? '',
      type: entry.type || '',
      transfer_site_id: entry.transfer_site_id || '',
      payment_mode: entry.payment_mode || '',
      refund_amount: entry.refund_amount || ''
    });
    const preSelected = combinedOptions.find(opt =>
      entry.vendor_id ? opt.id === entry.vendor_id && opt.type === "Vendor"
        : entry.contractor_id ? opt.id === entry.contractor_id && opt.type === "Contractor"
          : false
    );
    setSelectedOption(preSelected || null);
    setIsEditModalOpen(true);
  };
  const handleSendEditRequest = async () => {
    if (!requestingEntry) return;
    try {
      const requestData = {
        module_name: 'Advance Portal',
        module_name_id: requestingEntry.advancePortalId,
        module_name_eno: requestingEntry.entry_no,
        request_send_by: username,
        request_approval: false,
        request_completed: false
      };
      const response = await fetch('https://backendaab.in/demoAabuildersDash/api/edit_requests/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestData)
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create edit request');
      }
      alert('Edit request sent successfully. Waiting for admin approval.');
      setIsRequestModalOpen(false);
      setRequestingEntry(null);
    } catch (error) {
      console.error('Error creating edit request:', error);
      alert('Failed to send edit request. Please try again.');
    }
  };
  const handleUpdate = async () => {
    try {
      const currentEntry = advanceData.find(entry => entry.advancePortalId === editingId);
      if (currentEntry && currentEntry.not_allow_to_edit) {
        alert('Editing is not allowed for this record. Please request permission to edit.');
        return;
      }
      let fileUrl = editFormData.file_url || '';
      if (selectedFile) {
        try {
          const formData = new FormData();
          const formatDateOnly = (dateString) => {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
          };
          const selectedSite = siteOptions.find(site => site.id === editFormData.project_id);
          const contractorOrVendor = selectedOption ? selectedOption.label : '';
          const now = new Date();
          const timestamp = now.toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
          })
            .replace(",", "")
            .replace(/\s/g, "-");
          const finalName = `${timestamp} ${selectedSite?.sNo || ''} ${contractorOrVendor}`;
          formData.append('files', selectedFile);          
          formData.append('folder', 'FileUpload / Advance_Portal');
          formData.append('fileName', finalName);
          const uploadResponse = await fetch("https://backendaab.in/demoAabuildersDash/api/files/upload", {
            method: "POST",
            body: formData,
          });
          if (!uploadResponse.ok) {
            throw new Error('Upload failed');
          }
          const uploadResult = await uploadResponse.json();
          fileUrl = uploadResult.url;
        } catch (error) {
          console.error('Error during file upload:', error);
          alert('Error during file upload. Please try again.');
          return;
        }
      }
      const buildPayload = (overrides = {}, typeOverride) => {
        const payload = {
          ...editFormData,
          ...overrides,
          file_url: fileUrl,
          branch_id: editFormData.branch_id ?? currentEntry?.branch_id ?? currentEntry?.branchId ?? activeBranchId,
        };
        if (selectedOption) {
          if (selectedOption.type === 'Vendor') {
            payload.vendor_id = selectedOption.id;
            payload.contractor_id = '';
          } else if (selectedOption.type === 'Contractor') {
            payload.contractor_id = selectedOption.id;
            payload.vendor_id = '';
          }
        }
        const type = typeOverride || payload.type;
        switch (type) {
          case 'Advance':
            payload.bill_amount = '';
            payload.refund_amount = '';
            break;
          case 'Refund':
            payload.bill_amount = '';
            payload.amount = '';
            break;
          case 'Transfer':
            payload.bill_amount = '';
            payload.refund_amount = '';
            payload.payment_mode = '';
            break;
          case 'Bill Settlement':
            payload.refund_amount = '';
            break;
          default:
            break;
        }
        payload.amount = sanitizeNumberField(payload.amount);
        payload.bill_amount = sanitizeNumberField(payload.bill_amount);
        payload.discount_amount = sanitizeNumberField(payload.discount_amount);
        payload.refund_amount = sanitizeNumberField(payload.refund_amount);
        payload.project_id = sanitizeNumberField(payload.project_id);
        payload.transfer_site_id = sanitizeNumberField(payload.transfer_site_id);
        payload.vendor_id = sanitizeNumberField(payload.vendor_id);
        payload.contractor_id = sanitizeNumberField(payload.contractor_id);
        payload.week_no = sanitizeNumberField(payload.week_no);
        payload.entry_no = sanitizeNumberField(payload.entry_no);
        return payload;
      };
      const updateRecord = async (id, payload, modalPaymentData = null) => {
        const res = await fetch(`https://backendaab.in/demoAabuildersDash/api/advance_portal/edit/${id}?editedBy=${username}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || 'Failed to update record');
        }
        const contentType = res.headers.get('content-type') || '';
        let updatedRecord = null;
        if (contentType.includes('application/json')) {
          updatedRecord = await res.json();
        }
        const sourceRecord = advanceData.find((e) => e.advancePortalId === id);
        const expensesEntryId = resolveAdvancePortalExpensesEntryId(sourceRecord);
        await syncWeeklyPaymentBillsForAdvancePortal(id, payload, {
          editedBy: username,
          branchId: activeBranchId,
          modalPaymentData,
          expensesEntryId,
        });
        if (expensesEntryId) {
          await syncExpensesEntryFromAdvancePortalEdit(expensesEntryId, payload, {
            editedBy: username,
            siteOptions,
            selectedOption,
            branchId: activeBranchId,
          });
        }
        return updatedRecord;
      };
      const setAllowToEdit = async (id, allow) => {
        try {
          const res = await fetch(`https://backendaab.in/demoAabuildersDash/api/advance_portal/allow/${id}?allow=${allow}`, {
            method: 'PUT',
            credentials: 'include'
          });
          if (!res.ok) {
            console.error('Failed to update allowToEdit');
          }
        } catch (error) {
          console.error('Error updating allowToEdit:', error);
        }
      };
      const finishEditSuccess = async (payload) => {
        await setAllowToEdit(editingId, false);
        setAdvanceData(prev =>
          prev.map(item =>
            item.advancePortalId === editingId ? { ...item, ...payload } : item
          )
        );
        await fetchAdvanceData();
        setShowEditPaymentModal(false);
        pendingAdvanceUpdateRef.current = null;
        setIsEditModalOpen(false);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      if (editFormData.type === 'Transfer') {
        const sameEntryRows = advanceData.filter(r => r.entry_no === editFormData.entry_no);
        if (sameEntryRows.length === 2) {
          const editedRecord = sameEntryRows.find(r => r.advancePortalId === editingId);
          const otherRecord = sameEntryRows.find(r => r.advancePortalId !== editingId);
          if (editedRecord && otherRecord) {
            const editedAmount = parseFloat(editFormData.amount) || 0;
            const updatedEdited = buildPayload({
              ...editFormData,
              transfer_site_id: parseInt(editFormData.transfer_site_id),
              amount: editedAmount
            }, 'Transfer');
            const updatedOther = buildPayload({
              ...otherRecord,
              project_id: parseInt(editFormData.transfer_site_id),
              transfer_site_id: editedRecord.project_id,
              amount: -editedAmount
            }, 'Transfer');
            await Promise.all([
              updateRecord(editedRecord.advancePortalId, updatedEdited),
              updateRecord(otherRecord.advancePortalId, updatedOther)
            ]);
            await Promise.all([
              setAllowToEdit(editedRecord.advancePortalId, false),
              setAllowToEdit(otherRecord.advancePortalId, false)
            ]);
            setAdvanceData(prev =>
              prev.map(item => {
                if (item.advancePortalId === editedRecord.advancePortalId) {
                  return { ...item, ...updatedEdited };
                }
                if (item.advancePortalId === otherRecord.advancePortalId) {
                  return { ...item, ...updatedOther };
                }
                return item;
              })
            );
          } else {
            console.warn('Transfer pair incomplete for entry_no:', editFormData.entry_no);
            const fallbackPayload = buildPayload({}, 'Transfer');
            await updateRecord(editingId, fallbackPayload);
            await setAllowToEdit(editingId, false);
            setAdvanceData(prev =>
              prev.map(item =>
                item.advancePortalId === editingId ? { ...item, ...fallbackPayload } : item
              )
            );
          }
        } else {
          console.warn('Could not find both Transfer records for entry_no:', editFormData.entry_no);
          const fallbackPayload = buildPayload({}, 'Transfer');
          await updateRecord(editingId, fallbackPayload);
          await setAllowToEdit(editingId, false);
          setAdvanceData(prev =>
            prev.map(item =>
              item.advancePortalId === editingId ? { ...item, ...fallbackPayload } : item
            )
          );
        }
      } else {
        const payload = buildPayload();
        if (isAdvanceOnlinePaymentModeForModal(payload.payment_mode)) {
          pendingAdvanceUpdateRef.current = { payload };
          let existingBill = null;
          try {
            const bills = await fetchWeeklyPaymentBillsByAdvancePortalId(editingId);
            existingBill = Array.isArray(bills) && bills.length > 0 ? bills[0] : null;
          } catch (e) {
            console.warn('Could not fetch existing weekly bill to prefill payment details', e);
          }
          setEditPaymentModalData({
            chequeNo: existingBill?.cheque_number ?? existingBill?.chequeNumber ?? '',
            chequeDate: existingBill?.cheque_date ?? existingBill?.chequeDate ?? '',
            transactionNumber:
              existingBill?.transaction_number ?? existingBill?.transactionNumber ?? '',
            accountNumber: existingBill?.account_number ?? existingBill?.accountNumber ?? '',
          });
          setShowEditPaymentModal(true);
          return;
        }
        await updateRecord(editingId, payload);
        await finishEditSuccess(payload);
        return;
      }
      await fetchAdvanceData();
      setIsEditModalOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to submit edit request. Please try again.');
    }
  };
  const handleEditPaymentModalSubmit = async () => {
    if (!editPaymentModalData.accountNumber) {
      alert('Please select account number.');
      return;
    }
    if (editFormData.payment_mode === 'Cheque' && (!editPaymentModalData.chequeNo || !editPaymentModalData.chequeDate)) {
      alert('Please enter cheque number and date.');
      return;
    }
    const pending = pendingAdvanceUpdateRef.current;
    if (!pending?.payload || !editingId) return;
    setIsEditPaymentSubmitting(true);
    try {
      const payload = pending.payload;
      const res = await fetch(`https://backendaab.in/demoAabuildersDash/api/advance_portal/edit/${editingId}?editedBy=${username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to update record');
      }
      const sourceRecord = advanceData.find((e) => e.advancePortalId === editingId);
      const expensesEntryId = resolveAdvancePortalExpensesEntryId(sourceRecord);
      await syncWeeklyPaymentBillsForAdvancePortal(editingId, payload, {
        editedBy: username,
        branchId: activeBranchId,
        modalPaymentData: editPaymentModalData,
        expensesEntryId,
      });
      if (expensesEntryId) {
        await syncExpensesEntryFromAdvancePortalEdit(expensesEntryId, payload, {
          editedBy: username,
          siteOptions,
          selectedOption,
          branchId: activeBranchId,
        });
      }
      try {
        const allowRes = await fetch(`https://backendaab.in/demoAabuildersDash/api/advance_portal/allow/${editingId}?allow=${false}`, {
          method: 'PUT',
          credentials: 'include',
        });
        if (!allowRes.ok) {
          console.error('Failed to update allowToEdit');
        }
      } catch (allowError) {
        console.error('Error updating allowToEdit:', allowError);
      }
      setAdvanceData(prev =>
        prev.map(item =>
          item.advancePortalId === editingId ? { ...item, ...payload } : item
        )
      );
      await fetchAdvanceData();
      setShowEditPaymentModal(false);
      pendingAdvanceUpdateRef.current = null;
      setIsEditModalOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to submit edit request. Please try again.');
    } finally {
      setIsEditPaymentSubmitting(false);
    }
  };
  const handleDelete = async (idToDelete) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this record?");
    if (!confirmDelete) return;
    try {
      const record = advanceData.find(r => r.advancePortalId === idToDelete);
      if (!record) {
        console.warn('Record not found for ID:', idToDelete);
        return;
      }
      const expensesEntryId = resolveAdvancePortalExpensesEntryId(record);
      let billDeleteMessage = '';
      try {
        const { weeklyBillDelete } = await clearAdvancePortalRecordsOnDelete(
          idToDelete,
          record,
          advanceData,
          username
        );
        billDeleteMessage = formatWeeklyBillDeleteMessage(
          weeklyBillDelete.deletedCount,
          weeklyBillDelete.failedCount
        );
      } catch (billDeleteError) {
        console.error('Failed to delete related bill payments:', billDeleteError);
        billDeleteMessage = ' Failed to delete related bill payment record(s).';
      }
      let expenseDeleteMessage = '';
      if (expensesEntryId) {
        try {
          const { ok } = await deleteLinkedExpenseEntryOnAdvancePortalDelete(
            expensesEntryId,
            username
          );
          expenseDeleteMessage = ok
            ? ' Linked expense entry was also deleted.'
            : ' Failed to delete linked expense entry.';
        } catch (expenseDeleteError) {
          console.error('Failed to delete linked expense entry:', expenseDeleteError);
          expenseDeleteMessage = ' Failed to delete linked expense entry.';
        }
      }
      let loanDeleteMessage = '';
      try {
        const loansRes = await fetch('https://backendaab.in/demoAabuildersDash/api/loans/all', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (loansRes.ok) {
          const loans = await loansRes.json();
          const loansAll = Array.isArray(loans) ? loans : [];

          const linkedLoans = loansAll.filter((l) => {
            const advId = l.advance_portal_id ?? l.advancePortalId;
            return advId != null && String(advId) === String(idToDelete);
          });

          if (linkedLoans.length) {
            const processedEntryNos = new Set();
            const clearLoanRecord = async (loanRec) => {
              const loanId = loanRec.loanPortalId ?? loanRec.id;
              if (!loanId) return;

              const clearedData = {
                loanPortalId: loanId,
                type: '',
                date: loanRec.date,
                amount: 0,
                loan_refund_amount: 0,
                loan_payment_mode: '',
                from_purpose_id: 0,
                to_purpose_id: 0,
                vendor_id: 0,
                contractor_id: 0,
                project_id: 0,
                transfer_Project_id: 0,
                entry_no: loanRec.entry_no ?? 0,
                description: '',
              };

              const res = await fetch(
                `https://backendaab.in/demoAabuildersDash/api/loans/${loanId}?editedBy=${encodeURIComponent(username)}`,
                {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(clearedData),
                  credentials: 'include',
                }
              );
              if (!res.ok) {
                const errText = await res.text().catch(() => '');
                throw new Error(errText || `Failed to clear loan record ${loanId}`);
              }
            };

            // If any linked loan is Transfer, clear both records for same entry_no.
            for (const loanRec of linkedLoans) {
              if (loanRec?.type === 'Transfer') {
                const entryNo = loanRec.entry_no;
                if (!entryNo) continue;
                const key = String(entryNo);
                if (processedEntryNos.has(key)) continue;
                processedEntryNos.add(key);
                const transferRecs = loansAll.filter((r) => String(r.entry_no) === key);
                await Promise.all(transferRecs.map(clearLoanRecord));
              } else {
                await clearLoanRecord(loanRec);
              }
            }

            loanDeleteMessage = ' Linked loan portal record(s) were also cleared.';
          }
        }
      } catch (loanDeleteError) {
        console.error('Failed to clear linked loan portal records:', loanDeleteError);
        loanDeleteMessage = ' Failed to clear linked loan portal record(s).';
      }

      alert(
        `Record deleted successfully.${billDeleteMessage}${expenseDeleteMessage}${loanDeleteMessage}`
      );
      await fetchAdvanceData();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete record. Please try again.');
    }
  };
  const totals = currentData.reduce(
    (acc, entry) => {
      acc.amount += Number(entry.amount) || 0;
      acc.bill_amount += Number(entry.bill_amount) || 0;
      acc.refund_amount += Number(entry.refund_amount) || 0;
      return acc;
    },
    { amount: 0, bill_amount: 0, refund_amount: 0 }
  );
  // Keep rendering the page while loading; data will populate once fetched.
  if (error) {
    return (
      <body className='bg-[#FAF6ED]'>
        <div className='bg-white w-[1850px] h-[500px] p-10 ml-10 flex items-center justify-center'>
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </body>
    );
  }
  return (
    <div className='flex flex-col h-[calc(100vh-104px)] overflow-hidden bg-[#FAF6ED]'>
      <div className='px-[18px] pt-[18px] pb-[18px] flex flex-col flex-1 min-h-0 overflow-hidden bg-[#FAF6ED]'>
      <div className='w-full pt-[18px] px-[18px] pb-[18px] rounded-[6px] bg-white mb-[18px] text-left flex items-center gap-6'>
        <div className='w-full xl:w-auto xl:justify-between'>
          <div className='flex flex-wrap gap-[12px]'>
            <div className=''>
              <label className='block mb-[8px] font-semibold'>Advance Amount</label>
              <input
                className='w-full h-[40px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2'
                value={`₹${totalAdvance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                readOnly
              />
            </div>
            <div className=''>
              <label className='block mb-[8px] font-semibold'>Bill Amount</label>
              <input
                className='w-full h-[40px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2'
                value={`₹${totalBill.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                readOnly
              />
            </div>
            <div className=''>
              <label className='block mb-[8px] font-semibold'>Transfer Amount </label>
              <input
                value={`₹${totalTransfer.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                readOnly
                className='w-full h-[40px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2' />
            </div>
            <div className=''>
              <label className='block mb-[8px] font-semibold'>Refund Amount</label>
              <input
                className='w-full h-[40px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2'
                value={`₹${totalRefund.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                readOnly
              />
            </div>
            <div className=''>
              <label className='block mb-[8px] font-semibold'>Start Date</label>
              <CustomDateField
                value={startDate}
                onChange={setStartDate}
                placeholder="Select date"
                alwaysOpenBelow
                controlHeightPx={40}
                className="w-full max-w-[150px]"
              />
            </div>
            <div className=''>
              <label className='block mb-[8px] font-semibold'>End Date</label>
              <CustomDateField
                value={endDate}
                onChange={setEndDate}
                placeholder="Select date"
                alwaysOpenBelow
                controlHeightPx={40}
                className="w-full max-w-[150px]"
              />
            </div>
          </div>
        </div>
        <div className='mr-0 xl:px-0 px-4 xl:mb-0 mb-4'>
          <button onClick={() => setIsOpen(true)} className='w-28 h-[35px] border-2 bg-[#BF9853] border-opacity-25 rounded-lg xl:mt-4 text-white'>Migrate</button>
        </div>
      </div>
      <div className="w-full pt-[18px] px-[18px] pb-[18px] bg-white rounded-[6px] flex flex-col flex-1 min-h-0 overflow-hidden">
        <div
          className={`text-left flex ${selectTimeStampDate || selectDatabaseDate || selectDatabaseContractororVendorName || selectDatabaseProjectName || selectDatabaseTransfer || selectDatabaseType || selectDatabaseDescription.trim() || selectDatabaseMode || selectDatabaseEntryNo || selectDatabaseSourceFrom || selectDatabaseBranch || selectDatabaseEnteredBy || startDate || endDate
            ? 'flex-col sm:flex-row sm:justify-between'
            : 'flex-row justify-between items-center'
            } mb-[12px] gap-[6px]`}>
          <div className="flex flex-row items-center sm:space-x-3 min-w-0 flex-1 overflow-hidden">
            <button
              className=''
              onClick={() => {
                const willOpen = !showFilters;
                const scroller = scrollRef.current;
                if (willOpen) {
                  setShowFilters(true);
                  if (!scroller) return;
                  if (scroller.scrollTop <= 0) return;
                  if (filterNudgeUsedRef.current) return;
                  filterNudgeUsedRef.current = true;
                  requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                      const h = filterRowRef.current?.offsetHeight || 0;
                      if (h > 0) {
                        scroller.scrollTop = Math.max(0, scroller.scrollTop - h);
                      }
                    });
                  });
                  return;
                }
                const h = filterRowRef.current?.offsetHeight || 0;
                setShowFilters(false);
                if (!scroller || h <= 0 || !filterNudgeUsedRef.current) return;
                filterNudgeUsedRef.current = false;
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    scroller.scrollTop = scroller.scrollTop + h;
                  });
                });
              }}
            >
              <img
                src={Filter}
                alt="Toggle Filter"
                className=" border rounded-md h-[34px]"
              />
            </button>
            {(selectTimeStampDate || selectDatabaseDate || selectDatabaseContractororVendorName || selectDatabaseProjectName || selectDatabaseTransfer || selectDatabaseType || selectDatabaseDescription.trim() || selectDatabaseMode || selectDatabaseEntryNo || selectDatabaseSourceFrom || selectDatabaseBranch || selectDatabaseEnteredBy || startDate || endDate) && (
              <div className="flex flex-row flex-wrap items-center gap-2 min-w-0">
                {startDate && (
                  <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Start Date: </span>
                    <span className="font-semibold text-[14px] truncate min-w-0">{startDate}</span>
                    <button onClick={() => setStartDate('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                  </span>
                )}
                {endDate && (
                  <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">End Date: </span>
                    <span className="font-semibold text-[14px] truncate min-w-0">{endDate}</span>
                    <button onClick={() => setEndDate('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                  </span>
                )}
                {selectTimeStampDate && (
                  <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Timestamp: </span>
                    <span className="font-semibold text-[14px] truncate min-w-0">{selectTimeStampDate}</span>
                    <button onClick={() => setSelectTimeStampDate('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                  </span>
                )}
                {selectDatabaseDate && (
                  <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Date: </span>
                    <span className="font-semibold text-[14px] truncate min-w-0">{selectDatabaseDate}</span>
                    <button onClick={() => setSelectDatabaseDate('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                  </span>
                )}
                {selectDatabaseContractororVendorName && (
                  <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Contractor/Vendor Name: </span>
                    <span className="font-semibold text-[14px] truncate min-w-0">{selectDatabaseContractororVendorName === BLANK_VALUE ? BLANK_LABEL : selectDatabaseContractororVendorName}</span>
                    <button onClick={() => setSelectDatabaseContractororVendorName('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectDatabaseProjectName && (
                  <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Project Name: </span>
                    <span className="font-semibold text-[14px] truncate min-w-0">{selectDatabaseProjectName === BLANK_VALUE ? BLANK_LABEL : selectDatabaseProjectName}</span>
                    <button onClick={() => setSelectDatabaseProjectName('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectDatabaseTransfer && (
                  <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">{advCol5Label}: </span>
                    <span className="font-semibold text-[14px] truncate min-w-0">{selectDatabaseTransfer === BLANK_VALUE ? BLANK_LABEL : selectDatabaseTransfer}</span>
                    <button onClick={() => setSelectDatabaseTransfer('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectDatabaseType && (
                  <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Type: </span>
                    <span className="font-semibold text-[14px] truncate min-w-0">{selectDatabaseType === BLANK_VALUE ? BLANK_LABEL : selectDatabaseType}</span>
                    <button onClick={() => setSelectDatabaseType('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectDatabaseDescription.trim() && (
                  <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Description: </span>
                    <span className="font-semibold text-[14px] truncate min-w-0">{selectDatabaseDescription}</span>
                    <button onClick={() => setSelectDatabaseDescription('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectDatabaseMode && (
                  <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Mode: </span>
                    <span className="font-semibold text-[14px] truncate min-w-0">{selectDatabaseMode === BLANK_VALUE ? BLANK_LABEL : selectDatabaseMode}</span>
                    <button onClick={() => setSelectDatabaseMode('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectDatabaseEntryNo && (
                  <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Entry No: </span>
                    <span className="font-semibold text-[14px] truncate min-w-0">{String(selectDatabaseEntryNo) === BLANK_VALUE ? BLANK_LABEL : selectDatabaseEntryNo}</span>
                    <button onClick={() => setSelectDatabaseEntryNo('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectDatabaseSourceFrom && (
                  <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Source From: </span>
                    <span className="font-semibold text-[14px] truncate min-w-0">{selectDatabaseSourceFrom === BLANK_VALUE ? BLANK_LABEL : selectDatabaseSourceFrom}</span>
                    <button onClick={() => setSelectDatabaseSourceFrom('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectDatabaseBranch && (
                  <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Branch: </span>
                    <span className="font-semibold text-[14px] truncate min-w-0">{selectDatabaseBranch === BLANK_VALUE ? BLANK_LABEL : (getBranchName(selectDatabaseBranch) || selectDatabaseBranch)}</span>
                    <button onClick={() => setSelectDatabaseBranch('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectDatabaseEnteredBy && (
                  <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Entered By: </span>
                    <span className="font-semibold text-[14px] truncate min-w-0">{selectDatabaseEnteredBy === BLANK_VALUE ? BLANK_LABEL : selectDatabaseEnteredBy}</span>
                    <button onClick={() => setSelectDatabaseEnteredBy('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
              </div>
            )}
          </div>
          <div className='flex items-end gap-[6px]'>
            <button onClick={clearFilters} className='flex h-[34px] w-[32px] shrink-0 items-center justify-center'>
              <img className='w-full h-full' src={Reload} alt="Reload" />
            </button>
            <div className="w-[286px] min-w-[286px] shrink-0 h-[34px] border border-[#D6D6D6] rounded-md bg-white flex items-center px-2 gap-1">
              <input
                type="text"
                value={overallSearch}
                onChange={(e) => setOverallSearch(e.target.value)}
                placeholder="Search Transactions..."
                className="h-full w-full border-0 p-0 text-[14px] text-[#000000] bg-transparent outline-none"
              />
              <img src={Search} alt="Search" className="w-[16px] h-[16px] pointer-events-none" />
            </div>
            <div className=' text-left md:text-right md:items-end items-end cursor-default flex justify-end max-w-screen-2xl table-auto overflow-auto w-full scrollbar-none no-scrollbar'>
              <div className='flex items-end text-center '>
                <span className='text-[#E4572E] mr-2 flex items-center gap-1 font-semibold hover:underline cursor-pointer' onClick={exportPDF}>PDF<img src={Pdf} alt="Pdf" className='w-4 h-4' /></span>
                <span className='text-[#007233] flex items-center gap-1 font-semibold hover:underline cursor-pointer' onClick={exportCSV}>XL<img src={XL} alt="XL" className='w-4 h-4' /></span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div
            ref={scrollRef}
            className="w-full rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] flex-1 min-h-0 overflow-auto select-none no-scrollbar scrollbar-none"
            onWheel={() => { filterNudgeUsedRef.current = false; }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <table className={`table-fixed min-w-[1180px] w-full border-collapse ${EDBC_TABLE_EDGE_TABLE_CLASS} [&_#EDBC-12]:!pl-0 [&_#EDBC-9]:!pl-0 [&_thead_tr>th#EDBC-19]:!pr-[1px]`}>
              <thead className="sticky top-0 z-10 bg-white ">
                <EdbcTableHeaderRow>
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC1}
                    label={advCol1Label}
                    sortField={resolveEdbcSortField('timestamp')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC2}
                    label={advCol2Label}
                    sortField={resolveEdbcSortField('date')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC4}
                    label={advCol3Label}
                    sortField={resolveEdbcSortField('vendor')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC3}
                    label={advCol4Label}
                    sortField={resolveEdbcSortField('project')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <th
                    className={edbc3Config?.headerClass}
                    onClick={() => handleSort('transfer')}
                  >
                    {advCol5Label} {sortConfig.key === 'transfer' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                  </th>
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC8}
                    label={advCol6Label}
                    sortField={resolveEdbcSortField('amount')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <th
                    className={edbc8Config?.headerClass}
                    onClick={() => handleSort('bill_amount')}
                  >
                    {advCol7Label} {sortConfig.key === 'bill_amount' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                  </th>
                  <th
                    className={edbc8Config?.headerClass}
                    onClick={() => handleSort('refund_amount')}
                  >
                    {advCol8Label} {sortConfig.key === 'refund_amount' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                  </th>
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC12}
                    label={advCol9Label}
                    sortField={resolveEdbcSortField('type')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC9}
                    label={advCol10Label}
                    sortField={resolveEdbcSortField('description')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC13}
                    label={advCol11Label}
                    sortField={resolveEdbcSortField('mode')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC14}
                    label={advCol12Label}
                    sortField={resolveEdbcSortField('source')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC15}
                    label={advCol13Label}
                    sortField={resolveEdbcSortField('branch')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC16}
                    label={advCol14Label}
                    sortField={resolveEdbcSortField('enteredBy')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC17}
                    label={advCol15Label}
                    sortField={resolveEdbcSortField('entry_no')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader columnId={EDBC_IDS.EDBC20} label={advCol16Label} />
                  <EdbcColumnHeader columnId={EDBC_IDS.EDBC19} label={advCol17Label} />
                </EdbcTableHeaderRow>
                {showFilters && (
                  <EdbcTableFilterRow ref={filterRowRef}>
                    <EdbcTimestampFilter
                      placeholder={advCol1Label}
                      timestampStartDate={selectTimeStampDate}
                      timestampEndDate={selectTimeStampDate}
                      isOpen={showTimestampDatePicker}
                      onOpen={() => setShowTimestampDatePicker(true)}
                      onClose={() => setShowTimestampDatePicker(false)}
                      onApply={(from) => {
                        setSelectTimeStampDate(from || '');
                        setShowTimestampDatePicker(false);
                      }}
                    />
                    <EdbcDateFilter
                      placeholder={advCol2Label}
                      value={selectDatabaseDate}
                      onChange={setSelectDatabaseDate}
                    />
                    <EdbcSelectFilter
                      columnId={EDBC_IDS.EDBC4}
                      placeholder={advCol3Label}
                      options={filterOptionsFromData.vendorContractorOptions}
                      value={selectDatabaseContractororVendorName}
                      onChange={setSelectDatabaseContractororVendorName}
                      blankOption={blankOption}
                      blankValue={BLANK_VALUE}
                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                    />
                    <EdbcProjectNameFilter
                      placeholder={advCol4Label}
                      options={filterOptionsFromData.projectOptions}
                      value={selectDatabaseProjectName}
                      onChange={setSelectDatabaseProjectName}
                      blankOption={blankOption}
                      blankValue={BLANK_VALUE}
                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                    />
                    <EdbcProjectNameFilter
                      placeholder={advCol5Label}
                      options={filterOptionsFromData.transferSiteOptions}
                      value={selectDatabaseTransfer}
                      onChange={setSelectDatabaseTransfer}
                      blankOption={blankOption}
                      blankValue={BLANK_VALUE}
                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                    />
                    <EdbcTotalAmountFilter columnId={EDBC_IDS.EDBC8} totalAmount={totals.amount} />
                    <EdbcTotalAmountFilter columnId={EDBC_IDS.EDBC8} totalAmount={totals.bill_amount} />
                    <EdbcTotalAmountFilter columnId={EDBC_IDS.EDBC8} totalAmount={totals.refund_amount} />
                    <EdbcSelectFilter
                      columnId={EDBC_IDS.EDBC12}
                      placeholder={advCol9Label}
                      options={filterOptionsFromData.typeOptions.map((t) =>
                        t === BLANK_VALUE ? blankOption : { value: t, label: t }
                      )}
                      value={selectDatabaseType}
                      onChange={setSelectDatabaseType}
                      blankOption={blankOption}
                      blankValue={BLANK_VALUE}
                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                    />
                    <EdbcTextInputFilter
                      columnId={EDBC_IDS.EDBC9}
                      placeholder={advCol10Label}
                      value={selectDatabaseDescription}
                      onChange={(e) => setSelectDatabaseDescription(e.target.value)}
                    />
                    <EdbcSelectFilter
                      columnId={EDBC_IDS.EDBC13}
                      placeholder={advCol11Label}
                      options={filterOptionsFromData.modeOptions.map((m) =>
                        m === BLANK_VALUE ? blankOption : { value: m, label: m }
                      )}
                      value={selectDatabaseMode}
                      onChange={setSelectDatabaseMode}
                      blankOption={blankOption}
                      blankValue={BLANK_VALUE}
                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                    />
                    <EdbcSelectFilter
                      columnId={EDBC_IDS.EDBC14}
                      placeholder={advCol12Label}
                      options={filterOptionsFromData.sourceFromOptions.map((v) =>
                        v === BLANK_VALUE ? blankOption : { value: v, label: v }
                      )}
                      value={selectDatabaseSourceFrom}
                      onChange={setSelectDatabaseSourceFrom}
                      blankOption={blankOption}
                      blankValue={BLANK_VALUE}
                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                    />
                    <EdbcSelectFilter
                      columnId={EDBC_IDS.EDBC15}
                      placeholder={advCol13Label}
                      options={filterOptionsFromData.branchOptions}
                      selectValue={selectDatabaseBranch ? filterOptionsFromData.branchOptions.find((opt) => String(opt.value) === String(selectDatabaseBranch)) || { value: selectDatabaseBranch, label: getBranchName(selectDatabaseBranch) || selectDatabaseBranch } : null}
                      onChange={(value) => setSelectDatabaseBranch(value ? String(value) : '')}
                      blankOption={blankOption}
                      blankValue={BLANK_VALUE}
                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                    />
                    <EdbcSelectFilter
                      columnId={EDBC_IDS.EDBC16}
                      placeholder={advCol14Label}
                      options={filterOptionsFromData.enteredByOptions.map((v) =>
                        v === BLANK_VALUE ? blankOption : { value: v, label: v }
                      )}
                      value={selectDatabaseEnteredBy}
                      onChange={setSelectDatabaseEnteredBy}
                      blankOption={blankOption}
                      blankValue={BLANK_VALUE}
                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                    />
                    <EdbcSelectFilter
                      columnId={EDBC_IDS.EDBC17}
                      placeholder={advCol15Label}
                      options={filterOptionsFromData.entryNoOptions.map((eno) =>
                        String(eno) === BLANK_VALUE ? blankOption : { value: String(eno), label: String(eno) }
                      )}
                      value={selectDatabaseEntryNo}
                      onChange={setSelectDatabaseEntryNo}
                      blankOption={blankOption}
                      blankValue={BLANK_VALUE}
                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                      textAlign="right"
                    />
                    <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC20} />
                    <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC19} />
                  </EdbcTableFilterRow>
                )}
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((entry, index) => (
                    <EdbcTableBodyRow key={entry.id}>
                      <EdbcTimestampBodyCell
                        expense={entry}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        formatValue={formatDate}
                      />
                      <EdbcDateBodyCell
                        expense={entry}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        formatValue={formatDateOnly}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC4}
                        expense={entry}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={(row) =>
                          row.vendor_id
                            ? getVendorName(row.vendor_id)
                            : getContractorName(row.contractor_id)
                        }
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC3}
                        expense={entry}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={(row) => getSiteName(row.project_id)}
                      />
                      <td className={edbc3Config?.tdClass}>
                        <span
                          onClick={() => toggleExpandedCell(`${entry.id ?? index}-transfer`)}
                          className={`block w-full cursor-pointer ${expandedCells[`${entry.id ?? index}-transfer`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                          title={getSiteName(entry.transfer_site_id)}
                        >
                          {getSiteName(entry.transfer_site_id)}
                        </span>
                      </td>
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC8}
                        expense={entry}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        textAlignClass="text-right"
                        getDisplayValue={(row) => formatAdvanceAmount(row.amount)}
                      />
                      <td className={`${edbc8Config?.tdClass || ''} text-right`.trim()}>
                        <span
                          onClick={() => toggleExpandedCell(`${entry.id ?? index}-bill_amount`)}
                          className={`block w-full cursor-pointer text-right ${expandedCells[`${entry.id ?? index}-bill_amount`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                          title={formatAdvanceAmount(entry.bill_amount)}
                        >
                          {formatAdvanceAmount(entry.bill_amount)}
                        </span>
                      </td>
                      <td className={`${edbc8Config?.tdClass || ''} text-right`.trim()}>
                        <span
                          onClick={() => toggleExpandedCell(`${entry.id ?? index}-refund_amount`)}
                          className={`block w-full cursor-pointer text-right ${expandedCells[`${entry.id ?? index}-refund_amount`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                          title={formatAdvanceAmount(entry.refund_amount)}
                        >
                          {formatAdvanceAmount(entry.refund_amount)}
                        </span>
                      </td>
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC12}
                        expense={entry}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={(row) => row.type}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC9}
                        expense={entry}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={(row) => row.description || ''}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC13}
                        expense={entry}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={(row) => row.payment_mode}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC14}
                        expense={entry}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={(row) => row.source_from ?? row.sourceFrom ?? row.source ?? ''}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC15}
                        expense={entry}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={(row) => getBranchName(row.branch_id ?? row.branchId ?? '') || (row.branch ?? row.branch_name ?? row.branchName ?? '')}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC16}
                        expense={entry}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={(row) => row.enteredBy ?? row.entered_by ?? row.request_send_by ?? row.requested_by ?? row.createdBy ?? row.created_by ?? ''}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC17}
                        expense={entry}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        textAlignClass="text-right"
                        getDisplayValue={(row) => row.entry_no}
                      />
                      <EdbcFileBodyCell columnId={EDBC_IDS.EDBC20} expense={{ ...entry, billCopy: entry.file_url }} />
                      <td className={edbc19TdClass}>
                        {(() => {
                          const sourceVal =
                            entry?.source_from ?? entry?.sourceFrom ?? entry?.source ?? '';
                          const loanPortalEditDisabled = String(sourceVal).trim() === 'Loan Portal';
                          const editDisabled = loanPortalEditDisabled || (entry.not_allow_to_edit && !isAdmin);
                          return (
                        <button
                          className={`rounded-full transition duration-200 ${editDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={editDisabled}
                        >
                          <img
                            src={edit}
                            onClick={editDisabled ? undefined : () => handleEditClick(entry)}
                            alt="Edit"
                            className={`w-4 h-6 transition duration-200 ${editDisabled ? '' : 'transform hover:scale-110 hover:brightness-110'}`}
                          />
                        </button>
                          );
                        })()}
                        <button className={`${entry.not_allow_to_edit ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={entry.not_allow_to_edit}
                        >
                          <img
                            src={remove}
                            alt='delete'
                            onClick={entry.not_allow_to_edit ? undefined : () => handleDelete(entry.advancePortalId)}
                            className={`w-4 h-4 transition duration-200 ${entry.not_allow_to_edit ? '' : 'transform hover:scale-110 hover:brightness-110'}`} />
                        </button>
                        <button
                          onClick={entry.not_allow_to_edit ? undefined : () => fetchAuditDetails(entry.advancePortalId)}
                          className={`rounded-full transition duration-200 ${entry.not_allow_to_edit ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={entry.not_allow_to_edit}
                        >
                          <img
                            src={history}
                            alt="history"
                            className={`w-4 h-5 transition duration-200 ${entry.not_allow_to_edit ? '' : 'transform hover:scale-110 hover:brightness-110'}`}
                          />
                        </button>
                      </td>
                    </EdbcTableBodyRow>
                  ))
                ) : (
                  <tr>
                    <td className="p-2 text-center text-sm text-gray-400" colSpan={17}>
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {sortedData.length > 0 && (
          <div className="flex shrink-0 items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={300}>300</option>
                <option value={400}>400</option>
                <option value={500}>500</option>
                <option value={600}>600</option>
                <option value={700}>700</option>
                <option value={800}>800</option>
                <option value={900}>900</option>
                <option value={1000}>1000</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} entries
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#BF9853] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    type="button"
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#BF9853] ${currentPage === pageNum
                      ? 'bg-[#BF9853] text-white border-[#BF9853]'
                      : 'border-gray-300 hover:bg-[#BF9853] hover:text-white'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#BF9853] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-[9999]">
            <div className="bg-white rounded-md shadow-lg p-6 w-[400px]">
              <h2 className="text-lg font-semibold mb-4 text-center">
                Upload Bulk Data
              </h2>
              <input
                type="file"
                accept=".csv, .sql"
                onChange={handleFileChange}
                className="border p-2 w-full mb-4"
              />
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleUpload}
                  className={`px-6 py-2 rounded ${isUploading ? "bg-gray-400 cursor-not-allowed" : "bg-[#BF9853] text-white"}`}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 border border-[#BF9853] rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {isEditModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center p-4 bg-gray-800 bg-opacity-50 z-[9999]">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
              <div className="flex items-center justify-between mb-6 border-b-2">
                <h2 className="text-xl font-normal pb-2">Edit Entry</h2>
                <button
                  type="button"
                  className="text-gray-500 hover:text-black"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  <img src={cross} alt="close" className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-[75vh] overflow-y-auto">
                <form className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-500 font-normal text-left">Select Type</label>
                        <Select
                          options={[
                            { value: 'Advance', label: 'Advance' },
                            { value: 'Bill Settlement', label: 'Bill Settlement' },
                            { value: 'Refund', label: 'Refund' },
                            { value: 'Transfer', label: 'Transfer' }
                          ]}
                          value={editFormData.type ? { value: editFormData.type, label: editFormData.type } : null}
                          onChange={(selected) => {
                            const newType = selected ? selected.value : '';
                            setEditFormData(prev => {
                              const updated = { ...prev, type: newType };
                              if (newType === 'Refund') {
                                updated.amount = '';
                                updated.bill_amount = '';
                              } else if (newType === 'Advance') {
                                updated.refund_amount = '';
                                updated.bill_amount = '';
                              } else if (newType === 'Bill Settlement') {
                                updated.refund_amount = '';
                                updated.amount = '';
                              } else if (newType === 'Transfer') {
                                updated.refund_amount = '';
                                updated.bill_amount = '';
                                updated.payment_mode = '';
                              }
                              return updated;
                            });
                          }}
                          placeholder="Select Type..."
                          isSearchable
                          isClearable
                          styles={customStyles}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          className="w-full"
                        />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-normal text-left">Date</label>
                    <div className="mt-1">
                      <input
                        type="date"
                        placeholder="dd-mm-yyyy"
                        value={editFormData.date}
                        onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                        className="block w-full p-2 border-2 border-[rgba(191,152,83,0.2)] rounded-lg focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)] hover:border-[rgba(191,152,83,0.4)] font-normal h-[45px]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-500 font-normal text-left">Contractor/Vendor</label>
                        <Select
                          options={combinedOptions}
                          value={selectedOption}
                          onChange={handleChange}
                          className="w-full"
                          isSearchable
                          isClearable
                          styles={customStyles}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                        />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-normal text-left">Project Name</label>
                        <Select
                          options={sortedSiteOptions || []}
                          placeholder="Select a site..."
                          isSearchable={true}
                          value={sortedSiteOptions.find(site => site.id === editFormData.project_id) || null}
                          onChange={(selected) => setEditFormData({ ...editFormData, project_id: selected?.id || '' })}
                          styles={customStyles}
                          isClearable
                          className="w-full"
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                        />
                  </div>
                      {editFormData.type === 'Bill Settlement' && (
                        <>
                          <div>
                            <label className="block text-gray-500 font-normal text-left">Bill Amount</label>
                            <input
                              value={editFormData.bill_amount}
                              onChange={(e) => setEditFormData({ ...editFormData, bill_amount: e.target.value })}
                              className="block w-full p-2 border-2 border-[rgba(191,152,83,0.2)] rounded-lg focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)] hover:border-[rgba(191,152,83,0.4)] font-normal h-[45px]"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-500 font-normal text-left">Category</label>
                            <Select
                              options={categoryOptions}
                              value={
                                editFormData.category
                                  ? { value: editFormData.category, label: editFormData.category }
                                  : null
                              }
                              onChange={(selected) =>
                                setEditFormData((prev) => ({
                                  ...prev,
                                  category: selected ? selected.value : '',
                                }))
                              }
                              placeholder="Select a category..."
                              isSearchable
                              isClearable
                              styles={customStyles}
                              menuPortalTarget={document.body}
                              menuPosition="fixed"
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-500 font-normal text-left">Discount</label>
                            <input
                              value={formatWithCommas(editFormData.discount_amount)}
                              onChange={(e) => {
                                const rawValue = e.target.value.replace(/,/g, '');
                                if (rawValue === '' || !isNaN(rawValue)) {
                                  setEditFormData((prev) => ({
                                    ...prev,
                                    discount_amount: rawValue === '' ? '' : Number(rawValue),
                                  }));
                                }
                              }}
                              className="block w-full no-spinner p-2 border-2 border-[rgba(191,152,83,0.2)] rounded-lg focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)] hover:border-[rgba(191,152,83,0.4)] font-normal h-[45px]"
                            />
                          </div>
                        </>
                      )}
                  <div>
                    <label className="block text-gray-500 font-normal text-left">
                          {editFormData.type === 'Transfer'
                            ? 'Transfer Amount'
                            : editFormData.type === 'Refund'
                              ? 'Refund Amount'
                              : 'Amount Given'}
                        </label>
                        <input
                          value={editFormData.type === 'Refund' ? formatWithCommas(editFormData.refund_amount) : formatWithCommas(editFormData.amount)}
                          onChange={handleAmountChange}
                          className="block w-full no-spinner p-2 border-2 border-[rgba(191,152,83,0.2)] rounded-lg focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)] hover:border-[rgba(191,152,83,0.4)] font-normal h-[45px]"
                        />
                  </div>
                      {editFormData.type === 'Transfer' ? (
                        <div>
                          <label className="block text-gray-500 font-normal text-left">Transfer To</label>
                          <Select
                            options={sortedSiteOptions}
                            placeholder="Select a site..."
                            isSearchable
                            value={sortedSiteOptions.find(site => site.id === editFormData.transfer_site_id) || null}
                            onChange={(selected) => setEditFormData({ ...editFormData, transfer_site_id: selected?.id || '' })}
                            styles={customStyles}
                            isClearable
                            className="w-full"
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                          />
                        </div>
                      ) : (
                        <>
                          <div>
                            <label className="block text-gray-500 font-normal text-left">Payment Mode</label>
                            <Select
                              options={finalPaymentModeOptions}
                              value={editFormData.payment_mode ? { value: editFormData.payment_mode, label: editFormData.payment_mode } : null}
                              onChange={(selected) => setEditFormData({ ...editFormData, payment_mode: selected ? selected.value : '' })}
                              placeholder="Select"
                              isSearchable
                              isClearable
                              styles={customStyles}
                              menuPortalTarget={document.body}
                              menuPosition="fixed"
                              className="w-full"
                            />
                          </div>
                          <div>
                            <div className="flex">
                              <label
                                className="block text-gray-500 font-normal text-left cursor-pointer"
                                htmlFor="editFileInput"
                              >
                                File URL
                              </label>
                              {selectedFile && (
                                <span className="text-orange-600 ml-4 text-sm">{selectedFile.name}</span>
                              )}
                            </div>
                            <input
                              type="text"
                              name="file_url"
                              value={editFormData.file_url || ''}
                              onChange={(e) =>
                                setEditFormData((prev) => ({ ...prev, file_url: e.target.value }))
                              }
                              className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)] hover:border-opacity-[0.40] font-normal"
                              placeholder="Paste file URL or click label to upload"
                            />
                            <input
                              type="file"
                              id="editFileInput"
                              ref={fileInputRef}
                              className="hidden"
                              onChange={handleEditFileChange}
                            />
                          </div>
                        </>
                      )}
                  <div className="col-span-2">
                    <label className="block text-gray-500 font-normal text-left">Description</label>
                    <textarea
                      rows={3}
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      className="mt-1 block w-full p-2 border-2 border-[rgba(191,152,83,0.2)] rounded-lg focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)] hover:border-[rgba(191,152,83,0.4)] font-normal"
                    />
                  </div>
                </form>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="px-4 py-2 border border-[#BF9853] rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-[#BF9853] text-white rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        <AdvancePortalEditPaymentModal
          isOpen={showEditPaymentModal}
          onClose={() => {
            setShowEditPaymentModal(false);
            pendingAdvanceUpdateRef.current = null;
          }}
          onSubmit={handleEditPaymentModalSubmit}
          isSubmitting={isEditPaymentSubmitting}
          paymentMode={editFormData.payment_mode}
          date={editFormData.date}
          amount={getAdvancePortalDisplayAmount(editFormData)}
          paymentModalData={editPaymentModalData}
          setPaymentModalData={setEditPaymentModalData}
          accountDetails={accountDetails}
          selectStyles={customStyles}
        />
        {isRequestModalOpen && requestingEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
            <div className="bg-white p-6 rounded-lg w-[400px] text-center">
              <h2 className="text-lg font-bold mb-2 text-[#BF9853]">Request Edit Permission</h2>
              <p className="text-gray-700 mb-6">
                You need admin approval to edit this record.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setIsRequestModalOpen(false);
                    setRequestingEntry(null);
                  }}
                  className="px-4 py-2 border border-[#BF9853] w-[100px] h-[45px] rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEditRequest}
                  className="px-4 py-2 bg-[#BF9853] w-[160px] h-[45px] text-white rounded"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        )}
        <AuditModal show={showAdvancePortalModal} onClose={() => setShowAdvancePortalModal(false)} audits={advancePortalAudits} vendorOptions={vendorOptions} contractorOptions={contractorOptions}
          siteOptions={siteOptions} />
      </div>
    </div>

  )
}
export default AdvanceDatabase

const formatDate = (dateString) => {
  const date = new Date(dateString);
  date.setMinutes(date.getMinutes());
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? String(hours).padStart(2, '0') : '12';
  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
};
const AuditModal = ({ show, onClose, audits, vendorOptions, contractorOptions, siteOptions }) => {
  if (!show) return null;
  const getNameById = (id, options) => {
    if (!id && id !== 0) return "-";
    const found = options.find(opt => String(opt.id) === String(id));
    return found ? found.label : id;
  };
  const fields = [
    { oldKey: "old_date", newKey: "new_date", label: "Date", width: "120px" },
    { oldKey: "old_type", newKey: "new_type", label: "Type", width: "100px" },
    { oldKey: "old_project_id", newKey: "new_project_id", label: "Project Name", width: "180px", lookup: siteOptions },
    { oldKey: "old_vendor_id", newKey: "new_vendor_id", label: "Vendor", width: "150px", lookup: vendorOptions },
    { oldKey: "old_contractor_id", newKey: "new_contractor_id", label: "Contractor", width: "150px", lookup: contractorOptions },
    { oldKey: "old_transfer_site_id", newKey: "new_transfer_site_id", label: "Transfer", width: "150px", lookup: siteOptions },
    { oldKey: "old_payment_mode", newKey: "new_payment_mode", label: "Mode", width: "100px" },
    { oldKey: "old_description", newKey: "new_description", label: "Description", width: "200px" },
    { oldKey: "old_amount", newKey: "new_amount", label: "Amount", width: "100px" },
    { oldKey: "old_bill_amount", newKey: "new_bill_amount", label: "Bill Amount", width: "120px" },
    { oldKey: "old_refund_amount", newKey: "new_refund_amount", label: "Refund", width: "100px" },
  ];
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    hours = String(hours).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  };
  const formatDisplayValue = (value, field) => {
    if (
      (field.oldKey?.includes("vendor_id") || field.oldKey?.includes("transfer_site_id") ||
        field.newKey?.includes("vendor_id") || field.newKey?.includes("transfer_site_id")) &&
      String(value) === "0"
    ) {
      return "-";
    }
    if (field.lookup) {
      return getNameById(value, field.lookup);
    }
    if (field.label.includes("Amount")) {
      return value ? Number(value).toLocaleString("en-IN") : "-";
    }
    if (field.label === "Date") {
      return value ? new Date(value).toLocaleDateString("en-GB") : "-";
    }
    return value ?? "-";
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
      <div className="bg-white rounded-md shadow-lg w-[95%] max-w-[1800px] mx-4 p-2">
        <div className="flex justify-between items-center mt-4 ml-7 mr-7">
          <h2 className="text-xl font-bold">History</h2>
          <button onClick={onClose}>
            <h2 className="text-xl text-red-500 -mt-10 font-bold">x</h2>
          </button>
        </div>
        <div className="overflow-auto mt-2 max-h-80 border border-l-8 border-l-[#BF9853] rounded-lg ml-7">
          <table className="table-fixed min-w-full bg-white">
            <thead className="bg-[#FAF6ED]">
              <tr>
                <th style={{ width: "130px" }}>Time Stamp</th>
                <th style={{ width: "120px" }}>Edited By</th>
                {fields.map((f) => (
                  <th
                    key={f.label}
                    style={{ width: f.width }}
                    className="border-b py-2 px-2 text-center font-bold whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    {f.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {audits.map((audit, index) => (
                <tr
                  key={index}
                  className="odd:bg-white even:bg-[#FAF6ED]"
                >
                  <td
                    className="whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ width: "130px" }}
                  >
                    {formatDateTime(audit.edited_date)}
                  </td>
                  <td
                    className="whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ width: "120px" }}
                  >
                    {audit.edited_by}
                  </td>
                  {fields.map((f) => {
                    const oldDisplay = formatDisplayValue(audit[f.oldKey], f);
                    const newDisplay = formatDisplayValue(audit[f.newKey], f);
                    const changed = oldDisplay !== newDisplay;
                    return (
                      <td
                        key={f.label}
                        style={{ width: f.width }}
                        title={changed ? `Previous: ${oldDisplay} → Current: ${newDisplay}` : ""}
                        className={`whitespace-nowrap overflow-hidden text-ellipsis px-2 ${changed ? "bg-[#BF9853] font-bold" : ""
                          }`}
                      >
                        {oldDisplay}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
