import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import jsPDF from "jspdf";
import "jspdf-autotable";
import Select from 'react-select';
import Filter from '../Images/filter (3).png'
import Reload from '../Images/rotate-right.png'
import Pdf from '../Images/pdf.png';
import XL from '../Images/sheets.png';
import { sum } from 'mathjs';
import edit from '../Images/Edit.svg';
import history from '../Images/History.svg';
import remove from '../Images/Delete.svg';
import Attach from '../Images/Attachfile.svg';
import cross from '../Images/cross.png';

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
          if (filters.selectDatabaseMode) setSelectDatabaseMode(filters.selectDatabaseMode);
          if (filters.selectDatabaseEntryNo) setSelectDatabaseEntryNo(filters.selectDatabaseEntryNo);
          if (filters.selectDatabaseSourceFrom) setSelectDatabaseSourceFrom(filters.selectDatabaseSourceFrom);
          if (filters.selectDatabaseBranch) setSelectDatabaseBranch(filters.selectDatabaseBranch);
          if (filters.selectDatabaseEnteredBy) setSelectDatabaseEnteredBy(filters.selectDatabaseEnteredBy);
          if (filters.startDate) setStartDate(filters.startDate);
          if (filters.endDate) setEndDate(filters.endDate);
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
      selectDatabaseMode,
      selectDatabaseEntryNo,
      selectDatabaseSourceFrom,
      selectDatabaseBranch,
      selectDatabaseEnteredBy,
      startDate,
      endDate,
      showFilters
    };
    sessionStorage.setItem('advanceDatabaseFilters', JSON.stringify(filters));
  }, [selectTimeStampDate, selectDatabaseDate, selectDatabaseContractororVendorName, selectDatabaseProjectName, selectDatabaseTransfer, selectDatabaseType, selectDatabaseMode, selectDatabaseEntryNo, selectDatabaseSourceFrom, selectDatabaseBranch, selectDatabaseEnteredBy, startDate, endDate, showFilters]);
  const scrollRef = useRef(null);
  const filterRowRef = useRef(null);
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
          case 'type':
            aValue = a.type || '';
            bValue = b.type || '';
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
        if (sortConfig.key === 'entry_no') {
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
  useEffect(() => {
    setCurrentPage(1);
  }, [selectTimeStampDate, selectDatabaseDate, selectDatabaseContractororVendorName, selectDatabaseProjectName, selectDatabaseTransfer, selectDatabaseType, selectDatabaseMode, selectDatabaseEntryNo, selectDatabaseSourceFrom, selectDatabaseBranch, selectDatabaseEnteredBy, startDate, endDate]);
  const clearFilters = useCallback(() => {
    setSelectTimeStampDate('');
    setSelectDatabaseDate('');
    setSelectDatabaseContractororVendorName('');
    setSelectDatabaseProjectName('');
    setSelectDatabaseTransfer('');
    setSelectDatabaseType('');
    setSelectDatabaseMode('');
    setSelectDatabaseEntryNo('');
    setSelectDatabaseSourceFrom('');
    setSelectDatabaseBranch('');
    setSelectDatabaseEnteredBy('');
    setStartDate('');
    setEndDate('');
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
        payload.refund_amount = sanitizeNumberField(payload.refund_amount);
        payload.project_id = sanitizeNumberField(payload.project_id);
        payload.transfer_site_id = sanitizeNumberField(payload.transfer_site_id);
        payload.vendor_id = sanitizeNumberField(payload.vendor_id);
        payload.contractor_id = sanitizeNumberField(payload.contractor_id);
        payload.week_no = sanitizeNumberField(payload.week_no);
        payload.entry_no = sanitizeNumberField(payload.entry_no);
        return payload;
      };
      const updateRecord = async (id, payload) => {
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
        if (contentType.includes('application/json')) {
          return res.json();
        }
        return null;
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
        const updatedRecord = await updateRecord(editingId, payload);
        await setAllowToEdit(editingId, false);
        setAdvanceData(prev =>
          prev.map(item =>
            item.advancePortalId === editingId ? { ...item, ...payload } : item
          )
        );
      }
      await fetchAdvanceData();
      setIsEditModalOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Update error:', err);
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
      const entryNo = record.entry_no;
      const clearedData = {
        entry_no: entryNo,
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
        refund_amount: ''
      };
      if (record.type === 'Transfer') {
        const transferRecords = advanceData.filter(r => r.entry_no === entryNo);
        if (transferRecords.length !== 2) {
          console.warn(`Expected 2 Transfer records with entry_no ${entryNo}, but found ${transferRecords.length}`);
        }
        await Promise.all(
          transferRecords.map(async rec => {
            const res = await fetch(`https://backendaab.in/demoAabuildersDash/api/advance_portal/edit/${rec.advancePortalId}?editedBy=${username}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(clearedData)
            });
            if (!res.ok) {
              throw new Error(`Failed to clear transfer record with ID: ${rec.advancePortalId}`);
            }
          })
        );
      } else {
        const res = await fetch(`https://backendaab.in/demoAabuildersDash/api/advance_portal/edit/${idToDelete}?editedBy=${username}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clearedData)
        });
        if (!res.ok) {
          throw new Error('Failed to clear record');
        }
      }
      await fetchAdvanceData();
    } catch (error) {
      console.error('Delete error:', error);
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
    <div className='bg-[#FAF6ED]'>
      <div className='max-w-[1850px] bg-white rounded-md ml-10 xl:h-[128px] h-auto mr-10 px-4 text-left flex items-center gap-6'>
        <div className='w-full xl:w-auto xl:justify-between'>
          <div className='flex flex-wrap gap-[10px] p-4'>
            <div className=''>
              <label className='block mb-2 font-semibold'>Advance Amount</label>
              <input
                className='w-full h-[45px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2'
                value={`₹${totalAdvance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                readOnly
              />
            </div>
            <div className=''>
              <label className='block mb-2 font-semibold'>Bill Amount</label>
              <input
                className='w-full h-[45px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2'
                value={`₹${totalBill.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                readOnly
              />
            </div>
            <div className=''>
              <label className='block mb-2 font-semibold'>Transfer Amount </label>
              <input
                value={`₹${totalTransfer.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                readOnly
                className='w-full h-[45px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2' />
            </div>
            <div className=''>
              <label className='block mb-2 font-semibold'>Refund Amount</label>
              <input
                className='w-full h-[45px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2'
                value={`₹${totalRefund.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                readOnly
              />
            </div>
            <div className=''>
              <label className='block mb-2 font-semibold'>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className='w-full max-w-[150px] h-[45px] rounded-lg border-2 border-[#BF9853] border-opacity-25 focus:outline-none p-2'
              />
            </div>
            <div className=''>
              <label className='block mb-2 font-semibold'>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className='w-full max-w-[150px] h-[45px] rounded-lg border-2 border-[#BF9853] border-opacity-25 focus:outline-none p-2'
              />
            </div>
          </div>
        </div>
        <div className='mr-0 xl:px-0 px-4 xl:mb-0 mb-4'>
          <button onClick={() => setIsOpen(true)} className='w-28 h-[35px] border-2 bg-[#BF9853] border-opacity-25 rounded-lg xl:mt-4 text-white'>Migrate</button>
        </div>
      </div>
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="w-full max-w-[1860px] mx-auto p-4 mt-4 bg-white shadow-lg overflow-x-auto">
        <div
          className={`text-left flex ${selectTimeStampDate || selectDatabaseDate || selectDatabaseContractororVendorName || selectDatabaseProjectName || selectDatabaseTransfer || selectDatabaseType || selectDatabaseMode || selectDatabaseEntryNo || selectDatabaseSourceFrom || selectDatabaseBranch || selectDatabaseEnteredBy || startDate || endDate
            ? 'flex-col sm:flex-row sm:justify-between'
            : 'flex-row justify-between items-center'
            } mb-3 gap-2`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
            <button
              className='pl-2'
              onClick={() => {
                const willOpen = !showFilters;
                setShowFilters(willOpen);
                if (!willOpen) return;
                const scroller = scrollRef.current;
                if (!scroller) return;
                if (scroller.scrollTop <= 0) return;
                requestAnimationFrame(() => {
                  const h = filterRowRef.current?.offsetHeight || 0;
                  if (h > 0) scroller.scrollTop = scroller.scrollTop + h;
                });
              }}
            >
              <img
                src={Filter}
                alt="Toggle Filter"
                className="w-7 h-7 border border-[#BF9853] rounded-md"
              />
            </button>
            {(selectTimeStampDate || selectDatabaseDate || selectDatabaseContractororVendorName || selectDatabaseProjectName || selectDatabaseTransfer || selectDatabaseType || selectDatabaseMode || selectDatabaseEntryNo || selectDatabaseSourceFrom || selectDatabaseBranch || selectDatabaseEnteredBy || startDate || endDate) && (
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-2 sm:mt-0">
                {startDate && (
                  <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium w-fit">
                    <span className="font-normal">Start Date: </span>
                    <span className="font-bold">{startDate}</span>
                    <button onClick={() => setStartDate('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                  </span>
                )}
                {endDate && (
                  <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium w-fit">
                    <span className="font-normal">End Date: </span>
                    <span className="font-bold">{endDate}</span>
                    <button onClick={() => setEndDate('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                  </span>
                )}
                {selectTimeStampDate && (
                  <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium w-fit">
                    <span className="font-normal">Timestamp: </span>
                    <span className="font-bold">{selectTimeStampDate}</span>
                    <button onClick={() => setSelectTimeStampDate('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                  </span>
                )}
                {selectDatabaseDate && (
                  <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium w-fit">
                    <span className="font-normal">Date: </span>
                    <span className="font-bold">{selectDatabaseDate}</span>
                    <button onClick={() => setSelectDatabaseDate('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                  </span>
                )}
                {selectDatabaseContractororVendorName && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Contractor/Vendor Name: </span>
                    <span className="font-bold">{selectDatabaseContractororVendorName}</span>
                    <button onClick={() => setSelectDatabaseContractororVendorName('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectDatabaseProjectName && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Project Name:</span>
                    <span className="font-bold">{selectDatabaseProjectName}</span>
                    <button onClick={() => setSelectDatabaseProjectName('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectDatabaseTransfer && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Transfer site: </span>
                    <span className="font-bold">{selectDatabaseTransfer}</span>
                    <button onClick={() => setSelectDatabaseTransfer('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectDatabaseType && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Type: </span>
                    <span className="font-bold">{selectDatabaseType}</span>
                    <button onClick={() => setSelectDatabaseType('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectDatabaseMode && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Mode: </span>
                    <span className="font-bold">{selectDatabaseMode}</span>
                    <button onClick={() => setSelectDatabaseMode('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectDatabaseEntryNo && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Entry No: </span>
                    <span className="font-bold">{selectDatabaseEntryNo}</span>
                    <button onClick={() => setSelectDatabaseEntryNo('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectDatabaseSourceFrom && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Source From: </span>
                    <span className="font-bold">{selectDatabaseSourceFrom}</span>
                    <button onClick={() => setSelectDatabaseSourceFrom('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectDatabaseBranch && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Branch: </span>
                    <span className="font-bold">{getBranchName(selectDatabaseBranch) || selectDatabaseBranch}</span>
                    <button onClick={() => setSelectDatabaseBranch('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectDatabaseEnteredBy && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Entered By: </span>
                    <span className="font-bold">{selectDatabaseEnteredBy}</span>
                    <button onClick={() => setSelectDatabaseEnteredBy('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
              </div>
            )}
          </div>
          <div className='flex items-center gap-2'>
            <button onClick={clearFilters} className='w-10 h-9 border border-[#BF9853] rounded-md font-semibold text-sm text-[#BF9853] flex items-center justify-center gap-2'>
              <img className='w-4 h-4' src={Reload} alt="Reload" />
            </button>
            <div className=' text-left md:text-right md:items-center items-start cursor-default flex max-w-screen-2xl table-auto overflow-auto w-full'>
              <div className='flex items-center'>
                <span className='text-[#E4572E] mr-3 flex items-center gap-1 font-semibold hover:underline cursor-pointer' onClick={exportPDF}>PDF<img src={Pdf} alt="Pdf" className='w-4 h-4' /></span>
                <span className='text-[#007233] mr-1 flex items-center gap-1 font-semibold hover:underline cursor-pointer' onClick={exportCSV}>XL<img src={XL} alt="XL" className='w-4 h-4' /></span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div
            ref={scrollRef}
            className="w-full rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] h-[600px] overflow-x-auto select-none thin-scrollbar"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <table className="table-fixed min-w-[1180px] w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-white ">
                <tr className="bg-[#FAF6ED]">
                  <th className="px-3 w-44 font-bold text-left cursor-pointer hover:bg-gray-200 select-none whitespace-nowrap"
                    onClick={() => handleSort('timestamp')}
                  >
                    Time Stamp {sortConfig.key === 'timestamp' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="pt-2 w-36 font-bold text-left cursor-pointer hover:bg-gray-200 select-none whitespace-nowrap"
                    onClick={() => handleSort('date')}
                  >
                    Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-0.5 w-[220px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none whitespace-nowrap"
                    onClick={() => handleSort('vendor')}
                  >
                    Contractor/Vendor {sortConfig.key === 'vendor' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-0.5 w-[300px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none whitespace-nowrap"
                    onClick={() => handleSort('project')}
                  >
                    Project Name {sortConfig.key === 'project' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-0.5 w-[280px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none whitespace-nowrap"
                    onClick={() => handleSort('transfer')}
                  >
                    Transfer Site {sortConfig.key === 'transfer' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="w-[140px] pl-4 pr-2 font-bold text-right select-none whitespace-nowrap">Advance</th>
                  <th className="w-[140px] pl-2 pr-1.5 font-bold text-right select-none whitespace-nowrap ">Bill Payment</th>
                  <th className="w-[140px] pl-2 pr-3 font-bold text-right select-none whitespace-nowrap ">Refund</th>
                  <th className="px-0.5 pl-3 w-[120px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none whitespace-nowrap"
                    onClick={() => handleSort('type')}
                  >
                    Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-0.5 w-[120px] font-bold text-left select-none whitespace-nowrap">Description</th>
                  <th className="px-0.5 w-[140px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none whitespace-nowrap"
                    onClick={() => handleSort('mode')}
                  >
                    Mode {sortConfig.key === 'mode' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-0.5 w-[150px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none whitespace-nowrap"
                    onClick={() => handleSort('source')}
                  >
                    Source From {sortConfig.key === 'source' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-0.5 w-[150px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none whitespace-nowrap"
                    onClick={() => handleSort('branch')}
                  >
                    Branch {sortConfig.key === 'branch' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-0.5 w-[150px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none whitespace-nowrap"
                    onClick={() => handleSort('enteredBy')}
                  >
                    Entered By {sortConfig.key === 'enteredBy' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-0.5 w-[140px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none whitespace-nowrap"
                    onClick={() => handleSort('entry_no')}
                  >
                    E.No {sortConfig.key === 'entry_no' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-0.5 w-[80px] font-bold text-left select-none whitespace-nowrap">File</th>
                  <th className="px-0.5 w-[120px] font-bold text-left select-none whitespace-nowrap">Activity</th>
                </tr>
                {showFilters && (
                  <tr ref={filterRowRef} className="bg-[#FAF6ED]">
                    <th className="py-3 w-44 min-w-0">
                      <input
                        type="date"
                        value={selectTimeStampDate}
                        onChange={(e) => setSelectTimeStampDate(e.target.value)}
                        className="w-full min-w-0 max-w-full h-[45px] rounded-lg border-2 border-[#BF9853] border-opacity-25 focus:outline-none p-1.5 text-xs"
                      />
                    </th>
                    <th className="py-3 w-36 min-w-0">
                      <input
                        type="date"
                        value={selectDatabaseDate}
                        onChange={(e) => setSelectDatabaseDate(e.target.value)}
                        className="w-full min-w-0 max-w-full h-[45px] rounded-lg border-2 border-[#BF9853] border-opacity-25 focus:outline-none p-1.5 text-xs"
                      />
                    </th>
                    <th className="py-3">
                      <Select
                        className="w-full"
                        options={filterOptionsFromData.vendorContractorOptions}
                        value={selectDatabaseContractororVendorName ? { value: selectDatabaseContractororVendorName, label: selectDatabaseContractororVendorName } : null}
                        onChange={(opt) => setSelectDatabaseContractororVendorName(opt ? opt.value : '')}
                        placeholder="Contractor/Vendor"
                        isSearchable
                        isClearable
                        menuPlacement="bottom"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={customStyles}
                      />
                    </th>
                    <th className="py-3">
                      <Select
                        className="w-full"
                        options={filterOptionsFromData.projectOptions}
                        value={selectDatabaseProjectName ? { value: selectDatabaseProjectName, label: selectDatabaseProjectName } : null}
                        onChange={(opt) => setSelectDatabaseProjectName(opt ? opt.value : '')}
                        placeholder="Project Name"
                        isSearchable
                        isClearable
                        menuPlacement="bottom"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={customStyles}
                      />
                    </th>
                    <th className="py-3">
                      <Select
                        className="w-full"
                        options={filterOptionsFromData.transferSiteOptions}
                        value={selectDatabaseTransfer ? { value: selectDatabaseTransfer, label: selectDatabaseTransfer } : null}
                        onChange={(opt) => setSelectDatabaseTransfer(opt ? opt.value : '')}
                        placeholder="Transfer Site"
                        isSearchable
                        isClearable
                        menuPlacement="bottom"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={customStyles}
                      />
                    </th>
                    <th className="text-base text-right font-bold py-3 pl-4 pr-2">
                      ₹{Number(totals.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </th>
                    <th className="text-base text-right font-bold py-3 pl-2 pr-1.5 ">
                      ₹{Number(totals.bill_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </th>
                    <th className="text-base text-right font-bold py-3 pl-2 pr-3 ">
                      ₹{Number(totals.refund_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </th>
                    <th className="py-3 pl-3">
                      <Select
                        className="w-full"
                        options={filterOptionsFromData.typeOptions.map((t) =>
                          t === BLANK_VALUE ? blankOption : { value: t, label: t }
                        )}
                        value={selectDatabaseType ? { value: selectDatabaseType, label: selectDatabaseType } : null}
                        onChange={(opt) => setSelectDatabaseType(opt ? opt.value : '')}
                        placeholder="Type"
                        isClearable
                        menuPlacement="bottom"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={customStyles}
                      />
                    </th>
                    <th className="py-3" />
                    <th className="py-3">
                      <Select
                        className="w-full"
                        options={filterOptionsFromData.modeOptions.map((m) =>
                          m === BLANK_VALUE ? blankOption : { value: m, label: m }
                        )}
                        value={selectDatabaseMode ? { value: selectDatabaseMode, label: selectDatabaseMode } : null}
                        onChange={(opt) => setSelectDatabaseMode(opt ? opt.value : '')}
                        placeholder="Mode"
                        isClearable
                        menuPlacement="bottom"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={customStyles}
                      />
                    </th>
                    <th className="py-3">
                      <Select
                        className="w-full"
                        options={filterOptionsFromData.sourceFromOptions.map((v) =>
                          v === BLANK_VALUE ? blankOption : { value: v, label: v }
                        )}
                        value={selectDatabaseSourceFrom ? { value: selectDatabaseSourceFrom, label: selectDatabaseSourceFrom } : null}
                        onChange={(opt) => setSelectDatabaseSourceFrom(opt ? opt.value : '')}
                        placeholder="Source From"
                        isClearable
                        menuPlacement="bottom"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={customStyles}
                      />
                    </th>
                    <th className="py-3">
                      <Select
                        className="w-full"
                        options={filterOptionsFromData.branchOptions}
                        value={selectDatabaseBranch ? filterOptionsFromData.branchOptions.find((opt) => String(opt.value) === String(selectDatabaseBranch)) || { value: selectDatabaseBranch, label: getBranchName(selectDatabaseBranch) || selectDatabaseBranch } : null}
                        onChange={(opt) => setSelectDatabaseBranch(opt ? String(opt.value) : '')}
                        placeholder="Branch"
                        isClearable
                        menuPlacement="bottom"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={customStyles}
                      />
                    </th>
                    <th className="py-3">
                      <Select
                        className="w-full"
                        options={filterOptionsFromData.enteredByOptions.map((v) =>
                          v === BLANK_VALUE ? blankOption : { value: v, label: v }
                        )}
                        value={selectDatabaseEnteredBy ? { value: selectDatabaseEnteredBy, label: selectDatabaseEnteredBy } : null}
                        onChange={(opt) => setSelectDatabaseEnteredBy(opt ? opt.value : '')}
                        placeholder="Entered By"
                        isClearable
                        menuPlacement="bottom"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={customStyles}
                      />
                    </th>
                    <th className="py-3">
                      <Select
                        className="w-full"
                        options={filterOptionsFromData.entryNoOptions.map((eno) =>
                          String(eno) === BLANK_VALUE ? blankOption : { value: String(eno), label: String(eno) }
                        )}
                        value={selectDatabaseEntryNo ? { value: String(selectDatabaseEntryNo), label: String(selectDatabaseEntryNo) } : null}
                        onChange={(opt) => setSelectDatabaseEntryNo(opt ? opt.value : '')}
                        placeholder="E.No"
                        isClearable
                        menuPlacement="bottom"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={customStyles}
                      />
                    </th>
                    <th className="py-3" />
                    <th className="py-3" />
                  </tr>
                )}
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((entry) => (
                    <tr key={entry.id} className="odd:bg-white even:bg-[#FAF6ED]">
                      <td className="px-3 text-sm text-left whitespace-nowrap">{formatDate(entry.timestamp)}</td>
                      <td className="px-3 text-sm text-left whitespace-nowrap">{formatDateOnly(entry.date)}</td>
                      <td className="text-sm text-left">
                        {entry.vendor_id
                          ? getVendorName(entry.vendor_id)
                          : getContractorName(entry.contractor_id)}
                      </td>
                      <td className="text-sm text-left px-0.5 min-w-0 max-w-[300px] break-words whitespace-normal">
                        {getSiteName(entry.project_id)}
                      </td>
                      <td className="text-sm text-left px-0.5 min-w-0 max-w-[280px] break-words whitespace-normal">
                        {getSiteName(entry.transfer_site_id)}
                      </td>
                      <td className="text-sm text-right pl-4 pr-2 tabular-nums">
                        {entry.amount != null && entry.amount !== ''
                          ? `₹${Number(entry.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : ''}
                      </td>
                      <td className="text-sm text-right pl-2 pr-1.5 tabular-nums">
                        {entry.bill_amount != null && entry.bill_amount !== ''
                          ? `₹${Number(entry.bill_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : ''}
                      </td>
                      <td className="text-sm text-right pl-2 pr-3 tabular-nums">
                        {entry.refund_amount != null && entry.refund_amount !== ''
                          ? `₹${Number(entry.refund_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : ''}
                      </td>
                      <td className="text-sm text-left pl-3">{entry.type}</td>
                      <td className="text-sm text-left w-[120px] max-w-[120px] break-words overflow-hidden whitespace-normal px-1">{entry.description}</td>
                      <td className="text-sm text-left min-w-0 max-w-[140px] break-words whitespace-normal px-0.5">{entry.payment_mode}</td>
                      <td className="text-sm text-left">{entry.source_from ?? entry.sourceFrom ?? entry.source ?? ''}</td>
                      <td className="text-sm text-left">{getBranchName(entry.branch_id ?? entry.branchId ?? '') || (entry.branch ?? entry.branch_name ?? entry.branchName ?? '')}</td>
                      <td className="text-sm text-left">{entry.enteredBy ?? entry.entered_by ?? entry.request_send_by ?? entry.requested_by ?? entry.createdBy ?? entry.created_by ?? ''}</td>
                      <td className="text-sm text-left pl-3">{entry.entry_no}</td>
                      <td className="px-1 text-sm">
                        {entry.file_url ? (
                          <a
                            href={entry.file_url}
                            className="text-red-500 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </a>
                        ) : (
                          <span></span>
                        )}
                      </td>
                      <td className="flex w-[100px] justify-between py-1.5">
                        <button
                          className={`rounded-full transition duration-200 ml-2 mr-3 ${entry.not_allow_to_edit && !isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={entry.not_allow_to_edit && !isAdmin}
                        >
                          <img
                            src={edit}
                            onClick={entry.not_allow_to_edit && !isAdmin ? undefined : () => handleEditClick(entry)}
                            alt="Edit"
                            className={`w-4 h-6 transition duration-200 ${entry.not_allow_to_edit && !isAdmin ? '' : 'transform hover:scale-110 hover:brightness-110'}`}
                          />
                        </button>
                        <button className={`-ml-5 -mr-2 ${entry.not_allow_to_edit ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                          className={`rounded-full transition duration-200 -mr-1 ${entry.not_allow_to_edit ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={entry.not_allow_to_edit}
                        >
                          <img
                            src={history}
                            alt="history"
                            className={`w-4 h-5 transition duration-200 ${entry.not_allow_to_edit ? '' : 'transform hover:scale-110 hover:brightness-110'}`}
                          />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-2 text-center text-sm text-gray-400" colSpan={18}>
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {sortedData.length > 0 && (
          <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200">
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
      </div>
        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-md w-[65rem] px-6">
              <div className="flex justify-end">
                <button className="text-red-500 mt-3" onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}>
                  <img src={cross} alt='cross' className='w-5 h-5' />
                </button>
              </div>
              <div className='overflow-y-auto pl-[50px] pr-[50px]'>
                <form className="">
                  <h2 className="text-2xl font-bold mb-5">Edit Entry</h2>
                  <div className='text-left'>
                    <div className='grid grid-cols-2 gap-5'>
                      <div className=''>
                        <label className='block font-semibold mb-2'>Select Type</label>
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
                          className='w-full focus:outline-none'
                        />
                      </div>
                      <div className=''>
                        <label className='block font-semibold mb-2'>Date</label>
                        <input
                          type='date'
                          placeholder='dd-mm-yyyy'
                          value={editFormData.date}
                          onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                          className='block w-full border-2 border-[#BF9853] border-opacity-25 font-[600px] p-2 rounded-lg focus:outline-none h-[45px]'
                        />
                      </div>
                      <div className=''>
                        <label className='block font-semibold mb-2'>Contractor/Vendor</label>
                        <Select
                          options={combinedOptions}
                          value={selectedOption}
                          onChange={handleChange}
                          className='w-full rounded-lg focus:outline-none'
                          isSearchable
                          isClearable
                          styles={customStyles}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                        />
                      </div>
                      <div className=''>
                        <label className='block font-semibold mb-2'>Project Name</label>
                        <Select
                          options={sortedSiteOptions || []}
                          placeholder="Select a site..."
                          isSearchable={true}
                          value={sortedSiteOptions.find(site => site.id === editFormData.project_id) || null}
                          onChange={(selected) => setEditFormData({ ...editFormData, project_id: selected?.id || '' })}
                          styles={customStyles}
                          isClearable
                          className='w-full focus:outline-none'
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                        />
                      </div>
                      {editFormData.type === 'Bill Settlement' && (
                        <div className=''>
                          <label className='block font-semibold mb-2'>Bill Amount</label>
                          <input
                            value={editFormData.bill_amount}
                            onChange={(e) => setEditFormData({ ...editFormData, bill_amount: e.target.value })}
                            className='block w-full border-2 border-[#BF9853] font-[600px] border-opacity-25 p-2 rounded-lg focus:outline-none h-[45px]'
                          />
                        </div>
                      )}
                      <div className=''>
                        <label className='block font-semibold mb-2'>
                          {editFormData.type === 'Transfer'
                            ? 'Transfer Amount'
                            : editFormData.type === 'Refund'
                              ? 'Refund Amount'
                              : 'Amount Given'}
                        </label>
                        <input
                          value={editFormData.type === 'Refund' ? formatWithCommas(editFormData.refund_amount) : formatWithCommas(editFormData.amount)}
                          onChange={handleAmountChange}
                          className='block w-full no-spinner border-2 border-[#BF9853] border-opacity-25 font-[600px] p-2 rounded-lg focus:outline-none h-[45px]'
                        />
                      </div>
                      {editFormData.type === 'Transfer' ? (
                        <div className=''>
                          <label className='block font-semibold mb-2'>Transfer To</label>
                          <Select
                            options={sortedSiteOptions}
                            placeholder="Select a site..."
                            isSearchable
                            value={sortedSiteOptions.find(site => site.id === editFormData.transfer_site_id) || null}
                            onChange={(selected) => setEditFormData({ ...editFormData, transfer_site_id: selected?.id || '' })}
                            styles={customStyles}
                            isClearable
                            className='w-full focus:outline-none'
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                          />
                        </div>
                      ) : (
                        <>
                          <div className=''>
                            <label className='block font-semibold mb-2'>Payment Mode</label>
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
                              className='w-full focus:outline-none'
                            />
                          </div>
                          {editFormData.type === 'Bill Settlement' && (
                            <div className='mt-3'>
                              <label className='block font-semibold mb-2'>Attach File</label>
                              <div className="flex items-center gap-2">
                                <label htmlFor="editFileInput" className="cursor-pointer flex items-center text-orange-600 text-sm font-semibold">
                                  <img className='w-5 h-4 mr-1' alt='' src={Attach}></img>
                                  Attach File
                                </label>
                                <input
                                  type="file"
                                  id="editFileInput"
                                  ref={fileInputRef}
                                  className="hidden"
                                  onChange={handleEditFileChange}
                                />
                                {selectedFile && (
                                  <span className="text-gray-600 text-sm">{selectedFile.name}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {/* Description */}
                    <div className=' mt-8'>
                      <label className='block font-semibold mb-2'>Description</label>
                      <textarea
                        rows={3}
                        value={editFormData.description}
                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                        className='block w-full h-[45px] border-2 border-[#BF9853] border-opacity-25 font-[600px] p-2 rounded-lg focus:outline-none'>
                      </textarea>
                    </div>
                  </div>
                </form>
              </div>
              <div className="flex justify-end gap-3 mt-4 mb-5">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="px-4 py-2 border border-[#BF9853] w-[100px] h-[45px] rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-[#BF9853] w-[100px] h-[45px] text-white rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        {isRequestModalOpen && requestingEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
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
