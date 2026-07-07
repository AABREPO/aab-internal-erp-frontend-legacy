import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Select from "react-select";
import CustomDateField from '../ExpensesEntry/CustomDateField';
import Pdf from '../Images/pdf.png';
import XL from '../Images/sheets.png';
import {
  EDBC_IDS,
  DATABASE_TABLE_FILTER_SELECT_STYLES,
  getEdbcColumnConfig,
  useEdbcExpandedCells,
  formatExpenseDateOnly,
  EdbcTableHeaderRow,
  EdbcTableFilterRow,
  EdbcTableBodyRow,
  EdbcColumnHeader,
  EdbcDateFilter,
  EdbcProjectNameFilter,
  EdbcSelectFilter,
  EdbcTextInputFilter,
  EdbcTotalAmountFilter,
  matchesEdbcAmountFilter,
  EdbcEmptyFilterCell,
  EdbcDateBodyCell,
  EdbcExpandableBodyCell,
  EdbcFileBodyCell,
  EDBC_TABLE_EDGE_TABLE_CLASS,
  EdbcFilterToggleButton,
  EdbcTableToolbarRightActions,
} from '../ExpensesEntry/databaseExpensesSharedColumns';

Date.prototype.getWeekNumber = function () {
  const firstDay = new Date(this.getFullYear(), 0, 1);
  const pastDaysOfYear = (this - firstDay) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
};

// Get the current week year (ISO 8601) - may differ from calendar year for weeks spanning year boundaries
const getCurrentWeekYear = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const dayOfWeek = d.getDay() || 7;
  const thursday = new Date(d);
  thursday.setDate(d.getDate() + 4 - dayOfWeek);
  thursday.setHours(0, 0, 0, 0);
  return thursday.getFullYear();
};

const AdvanceReport = ({ username, userRoles = [], paymentModeOptions = [], refreshSignal, isActive = true }) => {
  const BLANK_VALUE = 'BLANK';
  const BLANK_LABEL = '(Blank)';
  const blankOption = { value: BLANK_VALUE, label: BLANK_LABEL };
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
  // Use paymentModeOptions from props, fallback to default if not provided
  const defaultPaymentModeOptions = [
    { value: 'Cash', label: 'Cash' },
    { value: 'GPay', label: 'GPay' },
    { value: 'PhonePe', label: 'PhonePe' },
    { value: 'Net Banking', label: 'Net Banking' },
    { value: 'Cheque', label: 'Cheque' }
  ];
  const finalPaymentModeOptions = paymentModeOptions.length > 0 ? paymentModeOptions : defaultPaymentModeOptions;

  const [week, setWeek] = useState("");
  const [year, setYear] = useState(getCurrentWeekYear().toString());
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  const [advanceData, setAdvanceData] = useState([]);
  /** Master projects (`/api/projects`) — siteEngineerId keyed by project id / site no (same as MasterData). */
  const [projectsFullList, setProjectsFullList] = useState([]);
  /** Employee master — resolve siteEngineerId → display name (same API as MasterData). */
  const [employeeDetailsList, setEmployeeDetailsList] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentModeFilter, setPaymentModeFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [overallSearch, setOverallSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectReportDate, setSelectReportDate] = useState("");
  const [selectReportContractorVendor, setSelectReportContractorVendor] = useState("");
  const [selectReportProjectName, setSelectReportProjectName] = useState("");
  const [selectReportTransfer, setSelectReportTransfer] = useState("");
  const [selectReportType, setSelectReportType] = useState("");
  const [selectReportMode, setSelectReportMode] = useState("");
  const [selectReportDescription, setSelectReportDescription] = useState("");
  const [selectReportAmount, setSelectReportAmount] = useState("");
  const [selectReportBillAmount, setSelectReportBillAmount] = useState("");
  const [selectReportRefundAmount, setSelectReportRefundAmount] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [pdfExportModalOpen, setPdfExportModalOpen] = useState(false);

  const scrollRef = useRef(null);
  const tableRef = useRef(null);
  const filterRowRef = useRef(null);
  const filterNudgeUsedRef = useRef(false);
  const filterScrollResetSkipRef = useRef(true);

  // drag-scroll momentum refs
  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const scroll = useRef({ left: 0, top: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);
  const lastMove = useRef({ time: 0, x: 0, y: 0 });

  // Custom styles for react-select
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      fontFamily: 'Manrope',
      borderWidth: '2px',
      borderRadius: '8px',
      minHeight: '40px',
      height: '40px',
      flexWrap: 'nowrap',
      borderColor: state.isFocused
        ? 'rgba(191, 152, 83, 1)'
        : 'rgba(191, 152, 83, 0.2)',
      boxShadow: state.isFocused
        ? '0 0 0 1px rgba(101, 102, 53, 0.2)'
        : 'none',
      '&:hover': {
        borderColor: 'rgba(191, 152, 83, 0.2)',
      },
    }),
    valueContainer: (provided, state) => ({
      ...provided,
      flex: '1 1 0%',
      minWidth: 0,
      flexWrap: 'nowrap',
      overflow: 'hidden',
      paddingLeft: '12px',
      paddingRight: state.hasValue ? '2px' : provided.paddingRight,
      paddingTop: 0,
      paddingBottom: 0,
      height: '36px',
      alignItems: 'center',
    }),
    singleValue: (provided) => ({
      ...provided,
      maxWidth: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      margin: 0,
      paddingTop: 0,
      paddingBottom: 0,
      color: 'black',
    }),
    input: (provided) => ({
      ...provided,
      margin: 0,
      padding: 0,
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      maxHeight: '300px',
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    menuList: (provided) => ({
      ...provided,
      paddingTop: 0,
      paddingBottom: 0,
      maxHeight: '250px',
      overflowY: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      '&::-webkit-scrollbar': {
        display: 'none',
      },
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    indicatorsContainer: (provided) => ({
      ...provided,
      flex: '0 0 auto',
      paddingLeft: '0',
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      display: state.hasValue ? 'none' : 'flex',
      color: '#000000',
      flexShrink: 0,
      paddingTop: 0,
      paddingBottom: 0,
    }),
    clearIndicator: (provided) => ({
      ...provided,
      cursor: 'pointer',
      color: '#000000',
      flexShrink: 0,
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: '4px',
      paddingRight: '4px',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#A6A5A6',
      textAlign: 'left',
      fontWeight: 'normal',
      fontSize: '14px',
      paddingLeft: '0px',
      paddingTop: '0px',
      paddingBottom: '0px',
      margin: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '100%',
      position: 'absolute',
    }),
    option: (provided, state) => ({
      ...provided,
      minHeight: 36,
      height: 'auto',
      paddingTop: 6,
      paddingBottom: 6,
      whiteSpace: 'normal',
      display: 'flex',
      alignItems: 'center',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTapHighlightColor: '#FAF6ED',
      backgroundColor: state.isSelected
        ? '#BF9853'
        : state.isFocused
          ? '#FAF6ED'
          : provided.backgroundColor,
      color: state.isSelected ? '#FFFFFF' : provided.color,
      ':active': {
        backgroundColor: state.isSelected ? '#BF9853' : '#FAF6ED',
      },
    }),
  };

  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    start.current = { x: e.clientX, y: e.clientY };
    scroll.current = {
      left: scrollRef.current.scrollLeft,
      top: scrollRef.current.scrollTop,
    };
    lastMove.current = { time: Date.now(), x: e.clientX, y: e.clientY };
    scrollRef.current.style.cursor = "grabbing";
    scrollRef.current.style.userSelect = "none";
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
    lastMove.current = { time: now, x: e.clientX, y: e.clientY };
  };
  const handleMouseUp = () => {
    if (!isDragging.current || !scrollRef.current) return;
    isDragging.current = false;
    scrollRef.current.style.cursor = "";
    scrollRef.current.style.userSelect = "";
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

  // Generate years dynamically
  const currentYear = new Date().getFullYear();
  const startYear = 2000; // Change if needed
  const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);

  // Fetch Vendor Names
  useEffect(() => {
    const fetchVendorNames = async () => {
      try {
        setProgress(10);
        const res = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        setVendorOptions(
          data.map((item) => ({ value: item.vendorName, label: item.vendorName, id: item.id }))
        );
        setProgress(25);
      } catch (err) {
        console.error(err);
        setError("Failed to load vendor data");
      }
    };
    fetchVendorNames();
  }, []);

  // Fetch Contractor Names
  useEffect(() => {
    const fetchContractorNames = async () => {
      try {
        setProgress(35);
        const res = await fetch("https://backendaab.in/aabuilderDash/api/contractor_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        setContractorOptions(
          data.map((item) => ({ value: item.contractorName, label: item.contractorName, id: item.id }))
        );
        setProgress(50);
      } catch (err) {
        console.error(err);
        setError("Failed to load contractor data");
      }
    };
    fetchContractorNames();
  }, []);

  // Fetch Site Names
  useEffect(() => {
    const fetchSites = async () => {
      try {
        setProgress(60);
        const response = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/getAll", {
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

        // Add predefined site options with IDs 001, 002, 003, 004
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

        // Fallback: if API fails, still show predefined options
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
      const res = await fetch(buildBranchUrl("https://backendaab.in/aabuildersDash/api/advance_portal/getAll"));
      const data = await res.json();
      setAdvanceData(Array.isArray(data) ? data : []);
      setProgress(100);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching advance data", err);
      setError("Failed to load advance data");
      setLoading(false);
    }
  }, [buildBranchUrl]);

  // Fetch Advance Data
  useEffect(() => {
    fetchAdvanceData();
  }, [fetchAdvanceData]);

  useEffect(() => {
    if (refreshSignal === undefined) return;
    if (!isActive) return;
    fetchAdvanceData();
  }, [refreshSignal, isActive, fetchAdvanceData]);

  useEffect(() => {
    const loadProjectAndEmployeeMasters = async () => {
      try {
        const [projRes, empRes] = await Promise.all([
          fetch("https://backendaab.in/aabuilderDash/api/projects/getAll", {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }),
          fetch("https://backendaab.in/aabuildersDash/api/employee_details/getAll", {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }),
        ]);
        if (projRes.ok) {
          const d = await projRes.json();
          setProjectsFullList(Array.isArray(d) ? d : []);
        }
        if (empRes.ok) {
          const d = await empRes.json();
          setEmployeeDetailsList(Array.isArray(d) ? d : []);
        }
      } catch (e) {
        console.error("AdvanceReport: failed to load projects/employees for site engineer", e);
      }
    };
    loadProjectAndEmployeeMasters();
  }, []);

  const employeeIdToName = useMemo(() => {
    const m = new Map();
    (employeeDetailsList || []).forEach((emp) => {
      const id = emp.id ?? emp.employee_id ?? emp.employeeId;
      if (id == null || id === "") return;
      const name =
        emp.employee_name ??
        emp.employeeName ??
        emp.name ??
        "";
      m.set(String(id), String(name || `ID ${id}`));
    });
    return m;
  }, [employeeDetailsList]);

  const siteEngineerIdByProjectKeys = useMemo(() => {
    const byProjectPk = new Map();
    const bySiteNo = new Map();
    (projectsFullList || []).forEach((p) => {
      const seRaw = p.siteEngineerId ?? p.site_engineer_id ?? p.siteEngineer?.id;
      if (seRaw == null || seRaw === "") return;
      const seStr = String(seRaw).trim();
      if (p.id != null && p.id !== "") byProjectPk.set(String(p.id), seStr);
      const pid = p.projectId ?? p.project_id;
      if (pid != null && String(pid).trim() !== "") bySiteNo.set(String(pid).trim(), seStr);
    });
    return { byProjectPk, bySiteNo };
  }, [projectsFullList]);

  // ISO 8601 week number calculation
  // Week belongs to the year that contains the Thursday of that week
  // Week 1 is the week with the year's first Thursday
  const getISOWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    
    // Get Thursday of the week containing the date
    // Monday = 1, Tuesday = 2, ..., Sunday = 0 (convert to 7)
    const dayOfWeek = d.getDay() || 7; // Convert Sunday (0) to 7
    const thursday = new Date(d);
    thursday.setDate(d.getDate() + 4 - dayOfWeek); // Thursday is 4 days after Monday
    thursday.setHours(0, 0, 0, 0);
    
    // Use the year that Thursday falls in (ISO 8601 rule)
    const weekYear = thursday.getFullYear();
    
    // Get January 1st of that year
    const jan1 = new Date(weekYear, 0, 1);
    jan1.setHours(0, 0, 0, 0);
    
    // Get the Thursday of week 1 (first Thursday of the year)
    const jan1DayOfWeek = jan1.getDay() || 7;
    const firstThursday = new Date(jan1);
    firstThursday.setDate(jan1.getDate() + 4 - jan1DayOfWeek);
    firstThursday.setHours(0, 0, 0, 0);
    
    // Calculate week number: difference in days divided by 7, plus 1
    const daysDiff = Math.floor((thursday - firstThursday) / 86400000);
    const weekNo = Math.floor(daysDiff / 7) + 1;
    
    return weekNo;
  };

  // Get the year that the week belongs to (ISO 8601)
  const getWeekYear = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    
    // Get Thursday of the week containing the date
    const dayOfWeek = d.getDay() || 7;
    const thursday = new Date(d);
    thursday.setDate(d.getDate() + 4 - dayOfWeek);
    thursday.setHours(0, 0, 0, 0);
    
    // Return the year that Thursday falls in
    return thursday.getFullYear();
  };

  const getCurrentWeekNumber = () => {
    return getISOWeekNumber(new Date());
  };

  // Default to current week
  useEffect(() => {
    const currentWeek = getCurrentWeekNumber();
    setWeek(`Week ${String(currentWeek).padStart(2, "0")}`);
  }, []);

  // Filter logic — if both startDate and endDate are provided, ignore week filter
  useEffect(() => {
    if (!advanceData.length) return;

    let filtered = advanceData;

    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      // normalize end to end of day
      e.setHours(23, 59, 59, 999);
      filtered = advanceData.filter((item) => {
        const d = new Date(item.date);
        return d >= s && d <= e;
      });
    } else if (week) {
      const selectedWeekNum = parseInt(week.replace("Week ", ""), 10);
      filtered = advanceData.filter((item) => {
        const d = new Date(item.date);
        const itemWeekYear = getWeekYear(item.date);
        const itemWeekNumber = getISOWeekNumber(item.date);
        return itemWeekYear === parseInt(year, 10) && itemWeekNumber === selectedWeekNum;
      });
    } else {
      // If neither date-range nor week selected, default to empty
      filtered = [];
    }

    // Apply Payment Mode filter
    if (paymentModeFilter) {
      filtered = filtered.filter((item) => (item.payment_mode || "").toString().toLowerCase() === paymentModeFilter.toLowerCase());
    }

    // Apply Type filter
    if (typeFilter) {
      filtered = filtered.filter((item) => (item.type || "").toString().toLowerCase() === typeFilter.toLowerCase());
    }

    if (selectReportDate) {
      const [reportYear, reportMonth, reportDay] = selectReportDate.split("-");
      const formattedSelectDate = `${parseInt(reportDay, 10)}-${parseInt(reportMonth, 10)}-${reportYear}`;
      filtered = filtered.filter((item) => {
        const entryDateObj = new Date(item.date);
        const formattedEntryDate = `${entryDateObj.getDate()}-${entryDateObj.getMonth() + 1}-${entryDateObj.getFullYear()}`;
        return formattedEntryDate === formattedSelectDate;
      });
    }
    if (selectReportContractorVendor) {
      filtered = filtered.filter((item) => {
        const name = contractorOptions.find((c) => c.id === item.contractor_id)?.label
          || vendorOptions.find((v) => v.id === item.vendor_id)?.label
          || "";
        if (selectReportContractorVendor === BLANK_VALUE) {
          return !name || !String(name).trim();
        }
        return name.toLowerCase() === selectReportContractorVendor.toLowerCase();
      });
    }
    if (selectReportProjectName) {
      filtered = filtered.filter((item) => {
        const projectName = siteOptions.find((s) => String(s.id) === String(item.project_id))?.label || "";
        if (selectReportProjectName === BLANK_VALUE) {
          return !projectName || !String(projectName).trim();
        }
        return projectName.toLowerCase() === selectReportProjectName.toLowerCase();
      });
    }
    if (selectReportTransfer) {
      filtered = filtered.filter((item) => {
        const transferName = siteOptions.find((s) => String(s.id) === String(item.transfer_site_id))?.label || "";
        if (selectReportTransfer === BLANK_VALUE) {
          return !transferName || !String(transferName).trim();
        }
        return transferName.toLowerCase() === selectReportTransfer.toLowerCase();
      });
    }
    if (selectReportType) {
      filtered = filtered.filter((item) => {
        if (selectReportType === BLANK_VALUE) {
          return !item.type || !String(item.type).trim();
        }
        return (item.type || "").toString().toLowerCase() === selectReportType.toLowerCase();
      });
    }
    if (selectReportMode) {
      filtered = filtered.filter((item) => {
        if (selectReportMode === BLANK_VALUE) {
          return !item.payment_mode || !String(item.payment_mode).trim();
        }
        return (item.payment_mode || "").toString().toLowerCase() === selectReportMode.toLowerCase();
      });
    }
    if (selectReportDescription.trim()) {
      filtered = filtered.filter((item) =>
        String(item.description ?? "").toLowerCase().includes(selectReportDescription.toLowerCase().trim())
      );
    }
    if (selectReportAmount.trim()) {
      filtered = filtered.filter((item) => matchesEdbcAmountFilter(item.amount, selectReportAmount));
    }
    if (selectReportBillAmount.trim()) {
      filtered = filtered.filter((item) => matchesEdbcAmountFilter(item.bill_amount, selectReportBillAmount));
    }
    if (selectReportRefundAmount.trim()) {
      filtered = filtered.filter((item) => matchesEdbcAmountFilter(item.refund_amount, selectReportRefundAmount));
    }

    if (overallSearch.trim()) {
      const q = overallSearch.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const searchable = [
          new Date(item.date).toLocaleDateString("en-GB"),
          contractorOptions.find((c) => c.id === item.contractor_id)?.label,
          vendorOptions.find((v) => v.id === item.vendor_id)?.label,
          siteOptions.find((s) => String(s.id) === String(item.project_id))?.label,
          item.amount,
          item.bill_amount,
          item.refund_amount,
          siteOptions.find((s) => s.id === item.transfer_site_id)?.label,
          item.type,
          item.payment_mode,
          item.description,
          item.file_url,
        ]
          .map((v) => String(v ?? "").toLowerCase())
          .join(" ");
        return searchable.includes(q);
      });
    }

    setFilteredData(filtered);
  }, [advanceData, startDate, endDate, week, year, paymentModeFilter, typeFilter, selectReportDate, selectReportContractorVendor, selectReportProjectName, selectReportTransfer, selectReportType, selectReportMode, selectReportDescription, selectReportAmount, selectReportBillAmount, selectReportRefundAmount, overallSearch, contractorOptions, vendorOptions, siteOptions]);

  // fromDate/toDate/totalAdvance computations
  const fromDate = filteredData.length
    ? new Date(Math.min(...filteredData.map((r) => new Date(r.date)))).toLocaleDateString("en-GB")
    : "-";
  const toDate = filteredData.length
    ? new Date(Math.max(...filteredData.map((r) => new Date(r.date)))).toLocaleDateString("en-GB")
    : "-";
  const totalAdvance = filteredData
    .reduce((sum, r) => {
      const amount = r.amount || 0;
      return sum + (amount);
    }, 0)
    .toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const getFilteredReportTotalAmount = (rows) =>
    rows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
  const getFilteredReportTotalLabel = () => {
    if (paymentModeFilter && typeFilter) {
      return `Total ${typeFilter} (${paymentModeFilter})`;
    }
    if (paymentModeFilter) {
      return `Total ${paymentModeFilter} Advance`;
    }
    if (typeFilter) {
      return `Total ${typeFilter}`;
    }
    return "Total Advance";
  };
  const getFilteredReportModeLabel = () => paymentModeFilter || "All Modes";
  const normStr = (v) => (v ?? "").toString().trim().toLowerCase();
  const dateKey = (val) => {
    if (!val) return -Infinity;
    const s = String(val).trim();
    const m1 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m1) {
      return new Date(+m1[3], +m1[2] - 1, +m1[1]).getTime();
    }
    const t = Date.parse(s);
    return isNaN(t) ? -Infinity : new Date(new Date(t).toDateString()).getTime();
  };
  const getLabelById = (options, id) => options.find((o) => String(o.id) === String(id))?.label || "";
  const reportFilterOptions = useMemo(() => {
    const getVendorName = (id) =>
      vendorOptions.find((v) => v.id === id)?.value || vendorOptions.find((v) => v.id === id)?.label || "";
    const getContractorName = (id) =>
      contractorOptions.find((c) => c.id === id)?.value || contractorOptions.find((c) => c.id === id)?.label || "";
    const getSiteName = (id) =>
      siteOptions.find((s) => String(s.id) === String(id))?.value
      || siteOptions.find((s) => String(s.id) === String(id))?.label
      || "";

    let tableData = advanceData;
    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      tableData = advanceData.filter((item) => {
        const d = new Date(item.date);
        return d >= s && d <= e;
      });
    } else if (week) {
      const selectedWeekNum = parseInt(week.replace("Week ", ""), 10);
      tableData = advanceData.filter((item) => {
        const itemWeekYear = getWeekYear(item.date);
        const itemWeekNumber = getISOWeekNumber(item.date);
        return itemWeekYear === parseInt(year, 10) && itemWeekNumber === selectedWeekNum;
      });
    } else {
      tableData = [];
    }
    if (paymentModeFilter) {
      tableData = tableData.filter((item) =>
        (item.payment_mode || "").toString().toLowerCase() === paymentModeFilter.toLowerCase()
      );
    }
    if (typeFilter) {
      tableData = tableData.filter((item) =>
        (item.type || "").toString().toLowerCase() === typeFilter.toLowerCase()
      );
    }

    const uniqueVendors = new Set();
    const uniqueContractors = new Set();
    const uniqueProjectIds = new Set();
    const uniqueTransferSiteIds = new Set();
    const uniqueTypes = new Set();
    const uniqueModes = new Set();
    let hasBlankVendorContractor = false;
    let hasBlankProject = false;
    let hasBlankTransfer = false;
    let hasBlankType = false;
    let hasBlankMode = false;

    tableData.forEach((entry) => {
      if (entry.vendor_id) {
        const vendorName = getVendorName(entry.vendor_id);
        if (vendorName) uniqueVendors.add(vendorName);
      }
      if (entry.contractor_id) {
        const contractorName = getContractorName(entry.contractor_id);
        if (contractorName) uniqueContractors.add(contractorName);
      }
      if (!entry.vendor_id && !entry.contractor_id) hasBlankVendorContractor = true;

      if (entry.project_id) {
        const projectName = getSiteName(entry.project_id);
        if (projectName) uniqueProjectIds.add(projectName);
      } else {
        hasBlankProject = true;
      }

      if (entry.transfer_site_id) {
        const transferName = getSiteName(entry.transfer_site_id);
        if (transferName) uniqueTransferSiteIds.add(transferName);
      } else {
        hasBlankTransfer = true;
      }

      if (entry.type) uniqueTypes.add(entry.type);
      else hasBlankType = true;

      if (entry.payment_mode) uniqueModes.add(entry.payment_mode);
      else hasBlankMode = true;
    });

    const vendorContractorOptions = [
      ...Array.from(uniqueVendors).map((name) => {
        const vendor = vendorOptions.find((v) => v.value === name || v.label === name);
        return vendor || { value: name, label: name, type: "Vendor" };
      }),
      ...Array.from(uniqueContractors).map((name) => {
        const contractor = contractorOptions.find((c) => c.value === name || c.label === name);
        return contractor || { value: name, label: name, type: "Contractor" };
      }),
    ].sort((a, b) => a.label.localeCompare(b.label));
    if (hasBlankVendorContractor) vendorContractorOptions.unshift(blankOption);

    const projectOptions = Array.from(uniqueProjectIds)
      .map((name) => {
        const site = siteOptions.find((s) => s.value === name || s.label === name);
        return site || { value: name, label: name, id: null };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
    if (hasBlankProject) projectOptions.unshift(blankOption);

    const transferOptions = Array.from(uniqueTransferSiteIds)
      .map((name) => {
        const site = siteOptions.find((s) => s.value === name || s.label === name);
        return site || { value: name, label: name, id: null };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
    if (hasBlankTransfer) transferOptions.unshift({ value: BLANK_VALUE, label: 'Blank' });

    const typeOptions = (hasBlankType ? [BLANK_VALUE] : []).concat(Array.from(uniqueTypes).sort());
    const modeOptions = (hasBlankMode ? [BLANK_VALUE] : []).concat(Array.from(uniqueModes).sort());

    return {
      vendorContractorOptions,
      projectOptions,
      transferOptions,
      typeOptions,
      modeOptions,
    };
  }, [advanceData, startDate, endDate, week, year, paymentModeFilter, typeFilter, vendorOptions, contractorOptions, siteOptions]);
  const reportTotals = useMemo(() => ({
    amount: filteredData.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0),
    bill_amount: filteredData.reduce((sum, row) => sum + (parseFloat(row.bill_amount) || 0), 0),
    refund_amount: filteredData.reduce((sum, row) => sum + (parseFloat(row.refund_amount) || 0), 0),
  }), [filteredData]);
  const requestSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };
  const sortedData = React.useMemo(() => {
    const data = [...filteredData];
    const { key, direction } = sortConfig || {};
    if (!key) return data;
    if (key === "sno") {
      return direction === "asc" ? data : data.reverse();
    }
    const compare = (a, b) => {
      let va = "";
      let vb = "";
      switch (key) {
        case "date":
          return dateKey(a.date) - dateKey(b.date);
        case "cv": {
          va = getLabelById(contractorOptions, a.contractor_id) || getLabelById(vendorOptions, a.vendor_id);
          vb = getLabelById(contractorOptions, b.contractor_id) || getLabelById(vendorOptions, b.vendor_id);
          break;
        }
        case "project": {
          va = getLabelById(siteOptions, a.project_id);
          vb = getLabelById(siteOptions, b.project_id);
          break;
        }
        case "transfer": {
          va = getLabelById(siteOptions, a.transfer_site_id);
          vb = getLabelById(siteOptions, b.transfer_site_id);
          break;
        }
        case "type":
          va = normStr(a.type);
          vb = normStr(b.type);
          break;
        case "payment_mode":
          va = normStr(a.payment_mode);
          vb = normStr(b.payment_mode);
          break;
        case "description":
          va = normStr(a.description);
          vb = normStr(b.description);
          break;
        case "amount":
          return (parseFloat(a.amount) || 0) - (parseFloat(b.amount) || 0);
        case "bill_amount":
          return (parseFloat(a.bill_amount) || 0) - (parseFloat(b.bill_amount) || 0);
        case "refund_amount":
          return (parseFloat(a.refund_amount) || 0) - (parseFloat(b.refund_amount) || 0);
        default:
          va = "";
          vb = "";
      }
      return va.localeCompare(vb);
    };
    data.sort((a, b) => {
      const c = compare(a, b);
      return direction === "asc" ? c : -c;
    });
    return data;
  }, [filteredData, sortConfig, contractorOptions, vendorOptions, siteOptions]);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);
  const { expandedCells, toggleExpandedCell } = useEdbcExpandedCells();
  const edbc8Config = getEdbcColumnConfig(EDBC_IDS.EDBC8);
  const edbc3Config = getEdbcColumnConfig(EDBC_IDS.EDBC3);
  const edbc21Config = getEdbcColumnConfig(EDBC_IDS.EDBC21);
  const mapReportSortKeyToEdbc = (key) => {
    if (key === "cv") return "vendor";
    if (key === "project" || key === "transfer") return "siteName";
    if (key === "payment_mode") return "paymentMode";
    if (key === "type") return "accountType";
    if (key === "description") return "comments";
    return key;
  };
  const handleEdbcSort = (edbcField) => {
    const fieldToKey = {
      vendor: "cv",
      siteName: "project",
      paymentMode: "payment_mode",
      accountType: "type",
      comments: "description",
    };
    requestSort(fieldToKey[edbcField] || edbcField);
  };
  const resolveEdbcSortField = (reportSortKey) =>
    sortConfig.key === reportSortKey ? mapReportSortKeyToEdbc(reportSortKey) : "";
  const getReportContractorVendorName = (item) =>
    contractorOptions.find((c) => c.id === item.contractor_id)?.label
    || vendorOptions.find((v) => v.id === item.vendor_id)?.label
    || "";
  const getReportProjectName = (item) =>
    siteOptions.find((s) => String(s.id) === String(item.project_id))?.label || "";
  const getReportTransferName = (item) =>
    siteOptions.find((s) => s.id === item.transfer_site_id)?.label || "";
  const formatReportAmount = (value) => {
    if (value == null || value === "" || value === "-") return "";
    const num = Number(value);
    return Number.isFinite(num) ? `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "";
  };
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, week, year, paymentModeFilter, typeFilter, selectReportDate, selectReportContractorVendor, selectReportProjectName, selectReportTransfer, selectReportType, selectReportMode, selectReportDescription, selectReportAmount, selectReportBillAmount, selectReportRefundAmount, overallSearch]);
  const openPdfExportModal = () => {
    if (!filteredData.length) {
      alert("No data to export");
      return;
    }
    setPdfExportModalOpen(true);
  };

  const clearFilters = useCallback(() => {
    const currentWeek = getCurrentWeekNumber();
    setWeek(`Week ${String(currentWeek).padStart(2, "0")}`);
    setYear(getCurrentWeekYear().toString());
    setStartDate("");
    setEndDate("");
    setPaymentModeFilter("");
    setTypeFilter("");
    setOverallSearch("");
    setSelectReportDate("");
    setSelectReportContractorVendor("");
    setSelectReportProjectName("");
    setSelectReportTransfer("");
    setSelectReportType("");
    setSelectReportMode("");
    setSelectReportDescription("");
    setSelectReportAmount("");
    setSelectReportBillAmount("");
    setSelectReportRefundAmount("");
    setSortConfig({ key: null, direction: "asc" });
  }, []);

  const hasActiveColumnFilters = Boolean(
    selectReportDate || selectReportContractorVendor || selectReportProjectName || selectReportTransfer
    || selectReportAmount.trim() || selectReportBillAmount.trim() || selectReportRefundAmount.trim()
    || selectReportType || selectReportMode || selectReportDescription.trim()
  );
  const toggleFilters = useCallback(() => {
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
  }, [showFilters]);

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
    selectReportDate,
    selectReportContractorVendor,
    selectReportProjectName,
    selectReportTransfer,
    selectReportType,
    selectReportMode,
    selectReportDescription,
    selectReportAmount,
    selectReportBillAmount,
    selectReportRefundAmount,
  ]);

  const getSiteEngineerForPdfRow = useCallback(
    (row) => {
      const direct =
        row?.site_engineer ??
        row?.siteEngineer ??
        row?.engineer_name ??
        row?.site_engineer_name ??
        row?.project_engineer ??
        "";
      const directStr = String(direct ?? "").trim();
      if (directStr) return directStr;

      const rowSeId = row?.site_engineer_id ?? row?.siteEngineerId;
      if (rowSeId != null && String(rowSeId).trim() !== "") {
        const idStr = String(rowSeId).trim();
        const fromEmp = employeeIdToName.get(idStr);
        return fromEmp || idStr;
      }

      const site = siteOptions.find((s) => String(s.id) === String(row.project_id));
      const siteNo = site?.sNo != null ? String(site.sNo).trim() : "";
      let seId =
        (siteNo && siteEngineerIdByProjectKeys.bySiteNo.get(siteNo)) ||
        siteEngineerIdByProjectKeys.byProjectPk.get(String(row.project_id));

      if (!seId && site?.label) {
        const proj = (projectsFullList || []).find(
          (p) => String(p.projectName || "").trim() === String(site.label || "").trim()
        );
        const fromProj = proj?.siteEngineerId ?? proj?.site_engineer_id ?? proj?.siteEngineer?.id;
        if (fromProj != null && String(fromProj).trim() !== "") seId = String(fromProj).trim();
      }

      if (!seId) return "";
      const name = employeeIdToName.get(String(seId));
      return name || String(seId);
    },
    [siteOptions, employeeIdToName, siteEngineerIdByProjectKeys, projectsFullList]
  );

  const generateAdvanceReportPdf = (copyType) => {
    setPdfExportModalOpen(false);
    if (!filteredData.length) {
      alert("No data to export");
      return;
    }
    const isAccounts = copyType === "accounts";
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const columnsAccounts = [
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
    const columnsSignature = [
      { header: "S.No", dataKey: "sno" },
      { header: "Date", dataKey: "date" },
      { header: "Contractor/Vendor", dataKey: "cv" },
      { header: "Project Name", dataKey: "project" },
      { header: "Advance", dataKey: "advance" },
      { header: "Bill Amount", dataKey: "bill" },
      { header: "Refund Amount", dataKey: "refund" },
      { header: "Transfer", dataKey: "transfer" },
      { header: "Mode", dataKey: "mode" },
      { header: "Site Engineer", dataKey: "siteEngineer" },
      { header: "Sign", dataKey: "sign" },
    ];
    const columns = isAccounts ? columnsAccounts : columnsSignature;
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
    const filteredReportTotal = getFilteredReportTotalAmount(sortedData);
    const filteredReportTotalLabel = getFilteredReportTotalLabel();
    const filteredReportModeLabel = getFilteredReportModeLabel();
    const reportStartTs = filteredData.length
      ? Math.min(...filteredData.map((r) => new Date(r.date).getTime()))
      : null;
    const reportStartDate =
      reportStartTs != null && Number.isFinite(reportStartTs) ? new Date(reportStartTs) : null;
    const pdfMainWeekDisplay =
      reportStartDate && !Number.isNaN(reportStartDate.getTime())
        ? `${String(getISOWeekNumber(reportStartDate)).padStart(2, "0")} (${getWeekYear(reportStartDate)})`
        : "-";
    const rows = sortedData.map((row, index) => {
      const d = new Date(dateKey(row.date));
      const base = {
        sno: index + 1,
        date: isNaN(d) ? "" : d.toLocaleDateString("en-GB"),
        cv:
          contractorOptions.find(c => c.id === row.contractor_id)?.label ||
          vendorOptions.find(v => v.id === row.vendor_id)?.label || "",
        project: siteOptions.find(s => s.id === row.project_id)?.label || "",
        advance: row.amount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00",
        bill: row.bill_amount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00",
        refund: row.refund_amount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00",
        transfer: siteOptions.find(s => s.id === row.transfer_site_id)?.label || "",
        mode: row.payment_mode || "-",
      };
      if (isAccounts) {
        return {
          ...base,
          type: row.type || "",
          description: row.description || "",
          file: row.file_url ? "Yes" : "-",
        };
      }
      return {
        ...base,
        siteEngineer: getSiteEngineerForPdfRow(row),
        sign: "",
      };
    });
    doc.autoTable({
      startY: 20,
      body: [
        [
          { content: "Week", styles: { fontStyle: 'bold' } },
          pdfMainWeekDisplay,
          { content: "Start Date", styles: { fontStyle: 'bold' } },
          fromDate,
          { content: "End Date", styles: { fontStyle: 'bold' } },
          toDate,
          { content: "Mode", styles: { fontStyle: 'bold' } },
          filteredReportModeLabel,
          { content: filteredReportTotalLabel, styles: { fontStyle: 'bold' } },
          { content: filteredReportTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { halign: 'right' } },
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
        0: { cellWidth: 40 },
        1: { cellWidth: 54 },
        2: { cellWidth: 70 },
        3: { cellWidth: 76 },
        4: { cellWidth: 70 },
        5: { cellWidth: 76 },
        6: { cellWidth: 50 },
        7: { cellWidth: 70 },
        8: { cellWidth: 140 },
        9: { cellWidth: 98, halign: 'right' },
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
        minCellHeight: isAccounts ? 20 : 24
      },
      headStyles: {
        fillColor: null,
        textColor: 0,
        fontStyle: 'bold',
        lineWidth: 0.5,
        lineColor: [0, 0, 0]
      },
      alternateRowStyles: { fillColor: null },
      columnStyles: isAccounts
        ? {
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
        : {
            sno: { cellWidth: 28 },
            date: { cellWidth: 48 },
            cv: { cellWidth: 88 },
            project: { cellWidth: 125 },
            advance: { cellWidth: 44, halign: 'right' },
            bill: { cellWidth: 40, halign: 'right' },
            refund: { cellWidth: 40, halign: 'right' },
            transfer: { cellWidth: 100 },
            mode: { cellWidth: 48 },
            siteEngineer: { cellWidth: 110 },
            sign: { cellWidth: 72},
          }
    });
    if (week && year) {
      const selectedWeekNum = parseInt(week.replace("Week ", ""), 10);
      const selectedYear = parseInt(year, 10);
      const billSettlementData = advanceData.filter((item) => {
        const itemTimestamp = item.timestamp ? new Date(item.timestamp) : new Date(item.date);
        const itemWeek = getISOWeekNumber(itemTimestamp);
        const itemWeekYear = getWeekYear(itemTimestamp);
        const itemType = normStr(item.type);
        return itemWeekYear === selectedYear && 
               itemWeek === selectedWeekNum && 
               itemType === "bill settlement";
      });
      if (billSettlementData.length > 0) {
        const sortedBillSettlement = [...billSettlementData].sort((a, b) => {
          const modeA = normStr(a.payment_mode), modeB = normStr(b.payment_mode);
          if (modeA !== modeB) return modeA.localeCompare(modeB);
          const timestampA = a.timestamp ? new Date(a.timestamp).getTime() : dateKey(a.date);
          const timestampB = b.timestamp ? new Date(b.timestamp).getTime() : dateKey(b.date);
          return timestampA - timestampB;
        });
        const billSettlementFromDate = sortedBillSettlement.length
          ? new Date(Math.min(...sortedBillSettlement.map((r) => {
              return r.timestamp ? new Date(r.timestamp) : new Date(r.date);
            }))).toLocaleDateString("en-GB")
          : "-";
        const billSettlementToDate = sortedBillSettlement.length
          ? new Date(Math.max(...sortedBillSettlement.map((r) => {
              return r.timestamp ? new Date(r.timestamp) : new Date(r.date);
            }))).toLocaleDateString("en-GB")
          : "-";
        const totalBillAmount = sortedBillSettlement
          .reduce((sum, row) => sum + (parseFloat(row.bill_amount) || 0), 0);
        const billSettlementStartTs = sortedBillSettlement.length
          ? Math.min(...sortedBillSettlement.map((r) => {
              return (r.timestamp ? new Date(r.timestamp) : new Date(r.date)).getTime();
            }))
          : null;
        const billSettlementStartDate =
          billSettlementStartTs != null && Number.isFinite(billSettlementStartTs)
            ? new Date(billSettlementStartTs)
            : null;
        const pdfBillWeekDisplay =
          billSettlementStartDate && !Number.isNaN(billSettlementStartDate.getTime())
            ? `Week ${String(getISOWeekNumber(billSettlementStartDate)).padStart(2, "0")} (${getWeekYear(billSettlementStartDate)})`
            : `Week ${String(selectedWeekNum).padStart(2, "0")} (${selectedYear})`;
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
              { content: "Week", styles: { fontStyle: 'bold' } },
              pdfBillWeekDisplay,
              { content: "Start Date", styles: { fontStyle: 'bold' } },
              billSettlementFromDate,
              { content: "End Date", styles: { fontStyle: 'bold' } },
              billSettlementToDate,
              { content: "Total Bill Amount", styles: { fontStyle: 'bold' } },
              totalBillAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
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
            0: { cellWidth: 72 },
            1: { cellWidth: 100 },
            2: { cellWidth: 88 },
            3: { cellWidth: 120 },
            4: { cellWidth: 88 },
            5: { cellWidth: 120 },
            6: { cellWidth: 118 },
            7: { cellWidth: 100 },
          }
        });
        const billSettlementRows = sortedBillSettlement.map((row, index) => {
          const rowDate = row.date ? new Date(row.date) : new Date(row.date);
          const formattedDate = isNaN(rowDate) ? "" : rowDate.toLocaleDateString("en-GB");
          const billBase = {
            sno: index + 1,
            date: formattedDate,
            cv:
              contractorOptions.find(c => c.id === row.contractor_id)?.label ||
              vendorOptions.find(v => v.id === row.vendor_id)?.label || "",
            project: siteOptions.find(s => s.id === row.project_id)?.label || "",
            advance: row.amount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00",
            bill: row.bill_amount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00",
            refund: row.refund_amount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00",
            transfer: siteOptions.find(s => s.id === row.transfer_site_id)?.label || "",
            mode: row.payment_mode || "-",
          };
          if (isAccounts) {
            return {
              ...billBase,
              type: row.type || "",
              description: row.description || "",
              file: row.file_url ? "Yes" : "-",
            };
          }
          return {
            ...billBase,
            siteEngineer: getSiteEngineerForPdfRow(row),
            sign: "",
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
            minCellHeight: isAccounts ? 20 : 24
          },
          headStyles: {
            fillColor: null,
            textColor: 0,
            fontStyle: 'bold',
            lineWidth: 0.5,
            lineColor: [0, 0, 0]
          },
          alternateRowStyles: { fillColor: null },
          columnStyles: isAccounts
            ? {
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
            : {
                sno: { cellWidth: 28 },
                date: { cellWidth: 95 },
                cv: { cellWidth: 88 },
                project: { cellWidth: 115 },
                advance: { cellWidth: 45, halign: 'right' },
                bill: { cellWidth: 40, halign: 'right' },
                refund: { cellWidth: 40, halign: 'right' },
                transfer: { cellWidth: 105 },
                mode: { cellWidth: 48 },
                siteEngineer: { cellWidth: 100 },
                sign: { cellWidth: 52, minCellHeight: 36 },
              }
        });
      }
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    const copyLabel = isAccounts ? "AccountsCopy" : "SignatureCopy";
    doc.save(`AdvanceReport_${copyLabel}_${fromDate.replace(/\//g, "-")}_to_${toDate.replace(/\//g, "-")}_${timestamp}.pdf`);
  };
  const handleExportExcel = () => {
    if (!filteredData.length) {
      alert("No data to export");
      return;
    }
    const normStr = v => (v ?? "").toString().trim().toLowerCase();
    const dateKey = (val) => {
      if (!val) return -Infinity;
      const s = String(val).trim();
      const parts = s.split("/");
      if (parts.length === 3) {
        const [dd, mm, yyyy] = parts;
        return new Date(`${yyyy}-${mm}-${dd}`).getTime();
      }
      const d = new Date(val);
      return isNaN(d) ? -Infinity : new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    };
    const sortedData = [...filteredData].sort((a, b) => {
      const typeA = normStr(a.type), typeB = normStr(b.type);
      if (typeA !== typeB) return typeA.localeCompare(typeB);
      const modeA = normStr(a.payment_mode), modeB = normStr(b.payment_mode);
      if (modeA !== modeB) return modeA.localeCompare(modeB);
      return dateKey(a.date) - dateKey(b.date);
    });
    const filteredReportTotal = getFilteredReportTotalAmount(sortedData);
    const filteredReportTotalLabel = getFilteredReportTotalLabel();
    const filteredReportModeLabel = getFilteredReportModeLabel();
    const header = [
      "S.No",
      "Date",
      "Contractor/Vendor",
      "Project Name",
      "Advance",
      "Bill Amount",
      "Refund Amount",
      "Transfer",
      "Type",
      "Mode",
      "Description",
      "Attached file",
    ];
    const summaryRow = [
      "", "", "", "",
      `${filteredReportTotalLabel}: ${filteredReportTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      "", "", "", "", `Mode: ${filteredReportModeLabel}`, "", ""
    ];
    const rows = sortedData.map((row, idx) => {
      const contractor = contractorOptions.find((c) => c.id === row.contractor_id)?.label;
      const vendor = vendorOptions.find((v) => v.id === row.vendor_id)?.label;
      const project = siteOptions.find((s) => s.id === row.project_id)?.label;
      const transferSite = siteOptions.find((s) => s.id === row.transfer_site_id)?.label;
      return [
        idx + 1,
        new Date(row.date).toLocaleDateString("en-GB"),
        contractor || vendor || "",
        project || "",
        (row.amount ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        (row.bill_amount ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        (row.refund_amount ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        transferSite || "",
        row.type || "",
        row.payment_mode || "",
        row.description || "",
        row.file_url ? "Yes" : "-",
      ];
    });
    const aoa = [header, summaryRow, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AdvanceReport");
    if (week && year) {
      const selectedWeekNum = parseInt(week.replace("Week ", ""), 10);
      const selectedYear = parseInt(year, 10);
      const billSettlementData = advanceData.filter((item) => {
        const itemTimestamp = item.timestamp ? new Date(item.timestamp) : new Date(item.date);
        const itemWeek = getISOWeekNumber(itemTimestamp);
        const itemWeekYear = getWeekYear(itemTimestamp);
        const itemType = normStr(item.type);
        return itemWeekYear === selectedYear && 
               itemWeek === selectedWeekNum && 
               itemType === "bill settlement";
      });
      if (billSettlementData.length > 0) {
        const sortedBillSettlement = [...billSettlementData].sort((a, b) => {
          const modeA = normStr(a.payment_mode), modeB = normStr(b.payment_mode);
          if (modeA !== modeB) return modeA.localeCompare(modeB);
          const timestampA = a.timestamp ? new Date(a.timestamp).getTime() : dateKey(a.date);
          const timestampB = b.timestamp ? new Date(b.timestamp).getTime() : dateKey(b.date);
          return timestampA - timestampB;
        });
        const billSettlementFromDate = sortedBillSettlement.length
          ? new Date(Math.min(...sortedBillSettlement.map((r) => {
              return r.timestamp ? new Date(r.timestamp) : new Date(r.date);
            }))).toLocaleDateString("en-GB")
          : "-";
        const billSettlementToDate = sortedBillSettlement.length
          ? new Date(Math.max(...sortedBillSettlement.map((r) => {
              return r.timestamp ? new Date(r.timestamp) : new Date(r.date);
            }))).toLocaleDateString("en-GB")
          : "-";
        const totalBillAmount = sortedBillSettlement
          .reduce((sum, row) => sum + (parseFloat(row.bill_amount) || 0), 0);
        const timestamp = new Date().toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });
        const billSettlementHeader = [
          "S.No",
          "Date",
          "Contractor/Vendor",
          "Project Name",
          "Advance",
          "Bill Amount",
          "Refund Amount",
          "Transfer",
          "Type",
          "Mode",
          "Description",
          "Attached file",
        ];
        const billSettlementSummaryRows = [
          ["Bill Settlement Report", "", "", "", "", "", "", "", "", "", "", ""],
          [`Generated: ${timestamp}`, "", "", "", "", "", "", "", "", "", "", ""],
          ["", "", "", "", "", "", "", "", "", "", "", ""],
          ["Start Date", billSettlementFromDate, "End Date", billSettlementToDate, "Total Bill Amount", totalBillAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), "", "", "", "", "", ""],
          ["", "", "", "", "", "", "", "", "", "", "", ""],
        ];
        const billSettlementRows = sortedBillSettlement.map((row, idx) => {
          const contractor = contractorOptions.find((c) => c.id === row.contractor_id)?.label;
          const vendor = vendorOptions.find((v) => v.id === row.vendor_id)?.label;
          const project = siteOptions.find((s) => s.id === row.project_id)?.label;
          const transferSite = siteOptions.find((s) => s.id === row.transfer_site_id)?.label;
          const rowDate = row.timestamp ? new Date(row.timestamp) : new Date(row.date);
          return [
            idx + 1,
            isNaN(rowDate) ? "" : (row.timestamp 
              ? rowDate.toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                })
              : rowDate.toLocaleDateString("en-GB")),
            contractor || vendor || "",
            project || "",
            (row.amount ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            (row.bill_amount ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            (row.refund_amount ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            transferSite || "",
            row.type || "",
            row.payment_mode || "",
            row.description || "",
            row.file_url ? "Yes" : "-",
          ];
        });
        const billSettlementAoa = [
          ...billSettlementSummaryRows,
          billSettlementHeader,
          ...billSettlementRows
        ];
        const billSettlementWs = XLSX.utils.aoa_to_sheet(billSettlementAoa);
        XLSX.utils.book_append_sheet(wb, billSettlementWs, "Bill Settlement");
      }
    }
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      `AdvanceReport_${fromDate.replace(/\//g, "-")}_to_${toDate.replace(/\//g, "-")}_${timestamp}.xlsx`
    );
  };
  const weekSelectOptions = useMemo(() => {
    const selectedYear = parseInt(year, 10);
    if (!Number.isFinite(selectedYear)) return [];
    const now = new Date();
    const currentWeekNum = getISOWeekNumber(now);
    const currentWeekYear = getWeekYear(now);
    let maxWeek = 0;
    if (selectedYear < currentWeekYear) {
      maxWeek = getISOWeekNumber(new Date(selectedYear, 11, 28));
    } else if (selectedYear === currentWeekYear) {
      maxWeek = currentWeekNum;
    }
    if (maxWeek < 1) return [];
    return Array.from({ length: maxWeek }, (_, i) => {
      const w = maxWeek - i;
      const label = `Week ${String(w).padStart(2, "0")}`;
      return { value: label, label };
    });
  }, [year]);
  // Keep rendering the page while loading; data will populate once fetched.
  if (error) {
    return (
      <div className='bg-[#FAF6ED]'>
        <div className='bg-white w-full max-w-[1850px] h-[500px] rounded-md p-10 ml-4 sm:ml-6 lg:ml-10 flex items-center justify-center mx-auto'>
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-[calc(100vh-104px)] overflow-hidden bg-[#FAF6ED]">
      <div className="px-[18px] pt-[18px] pb-[18px] flex flex-col flex-1 min-h-0 overflow-hidden bg-[#FAF6ED]">
      <div className="w-full rounded-[6px] bg-white mb-[18px] shrink-0">
        <div className="flex flex-wrap items-center justify-between text-left max-md:flex-col max-md:items-stretch">
        <div className="flex flex-wrap items-center space-x-3 text-left p-[18px]">
          <div>
            <label className="block font-semibold mb-[8px]">Week No</label>
            <Select
              value={week ? { value: week, label: week } : null}
              onChange={(selectedOption) => {
                const value = selectedOption ? selectedOption.value : "";
                setWeek(value);
                setStartDate("");
                setEndDate("");
              }}
              options={weekSelectOptions}
              placeholder="Week No"
              isSearchable
              isClearable
              styles={customStyles}
              className="w-[150px] h-[40px]"
              classNamePrefix="select"
            />
          </div>
          <div>
            <label className="block font-semibold mb-[8px]">Year</label>
            <Select
              value={year ? { value: year, label: year } : null}
              onChange={(selectedOption) => setYear(selectedOption ? selectedOption.value : "")}
              options={[...years].reverse().map((y) => ({
                value: y.toString(),
                label: y.toString(),
              }))}
              placeholder="Year"
              isSearchable
              isClearable
              styles={customStyles}
              className="w-[150px] h-[40px]"
              classNamePrefix="select"
            />
          </div>
        </div>
        <div className="flex items-center flex-wrap justify-end pr-[18px] max-xl:basis-full max-xl:pl-[18px] max-xl:justify-start max-xl:pb-[18px] max-md:justify-start max-md:px-[18px] max-md:pb-[18px] max-md:w-full">
          <div
            className="rounded-md px-4 py-[8px] text-sm shrink-0"
            style={{
              backgroundColor: '#FFFDF9',
              backgroundImage: [
                'repeating-linear-gradient(90deg, #E4572E66 0 3px, transparent 3px 6px)',
                'repeating-linear-gradient(90deg, #E4572E66 0 3px, transparent 3px 6px)',
                'repeating-linear-gradient(0deg, #E4572E66 0 3px, transparent 3px 6px)',
                'repeating-linear-gradient(0deg, #E4572E66 0 3px, transparent 3px 6px)',
              ].join(', '),
              backgroundSize: '100% 1px, 100% 1px, 1px 100%, 1px 100%',
              backgroundPosition: '0 0, 0 100%, 0 0, 100% 0',
              backgroundRepeat: 'repeat-x, repeat-x, repeat-y, repeat-y',
            }}
          >
            <div className="flex justify-between text-[14px] gap-6 py-0.5">
              <span className="flex shrink-0 w-[110px] text-black font-semibold">
                <span className="whitespace-nowrap">From Date</span>
                <span className="ml-auto">:</span>
              </span>
              <span className="font-semibold" style={{ color: '#E4572E' }}>
                {startDate
                  ? new Date(startDate).toLocaleDateString("en-GB")
                  : fromDate || "-"}
              </span>
            </div>
            <div className="flex justify-between text-[14px] gap-6 py-0.5">
              <span className="flex shrink-0 w-[110px] text-black font-semibold">
                <span className="whitespace-nowrap">To Date</span>
                <span className="ml-auto">:</span>
              </span>
              <span className="font-semibold" style={{ color: '#E4572E' }}>
                {endDate
                  ? new Date(endDate).toLocaleDateString("en-GB")
                  : toDate || "-"}
              </span>
            </div>
            <div className="flex justify-between text-[14px] gap-6 py-0.5">
              <span className="flex shrink-0 w-[110px] text-black font-semibold">
                <span className="whitespace-nowrap">Total Advance</span>
                <span className="ml-auto">:</span>
              </span>
              <span className="font-semibold" style={{ color: '#E4572E' }}>
                {totalAdvance}
              </span>
            </div>
          </div>
        </div>
        </div>
      </div>
      <div className="w-full pt-[18px] px-[18px] pb-[18px] bg-white rounded-[6px] flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="flex min-w-0 w-full flex-nowrap items-center justify-between gap-[6px] mb-[12px] shrink-0 overflow-hidden">
          <div className={`flex min-w-0 items-center overflow-hidden gap-[6px]${hasActiveColumnFilters ? ' flex-1 min-w-0' : ' shrink-0'}`}>
            <EdbcFilterToggleButton onClick={toggleFilters} />
            {hasActiveColumnFilters && (
              <div className="flex min-w-0 flex-1 overflow-x-auto flex-nowrap gap-2 no-scrollbar scrollbar-none">
                {selectReportDate && (
                  <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Date: </span>
                    <span className="font-semibold text-[14px] truncate min-w-0">{selectReportDate}</span>
                    <button onClick={() => setSelectReportDate('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                  </span>
                )}
                {selectReportContractorVendor && (
                  <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Contractor/Vendor Name: </span>
                    <span className="font-semibold text-[14px] truncate min-w-0">{selectReportContractorVendor === BLANK_VALUE ? BLANK_LABEL : selectReportContractorVendor}</span>
                    <button onClick={() => setSelectReportContractorVendor('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectReportProjectName && (
                  <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Project Name: </span>
                    <span className="font-semibold text-[14px] truncate min-w-0">{selectReportProjectName === BLANK_VALUE ? BLANK_LABEL : selectReportProjectName}</span>
                    <button onClick={() => setSelectReportProjectName('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectReportTransfer && (
                  <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Transfer: </span>
                    <span className="font-semibold text-[14px] truncate min-w-0">{selectReportTransfer === BLANK_VALUE ? 'Blank' : selectReportTransfer}</span>
                    <button onClick={() => setSelectReportTransfer('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectReportAmount.trim() && (
                  <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Advance: </span>
                    <span className="font-semibold text-[14px] truncate min-w-0">{selectReportAmount}</span>
                    <button onClick={() => setSelectReportAmount('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectReportBillAmount.trim() && (
                  <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Bill Payment: </span>
                    <span className="font-semibold text-[14px] truncate min-w-0">{selectReportBillAmount}</span>
                    <button onClick={() => setSelectReportBillAmount('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectReportRefundAmount.trim() && (
                  <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Refund: </span>
                    <span className="font-semibold text-[14px] truncate min-w-0">{selectReportRefundAmount}</span>
                    <button onClick={() => setSelectReportRefundAmount('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectReportType && (
                  <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Type: </span>
                    <span className="font-semibold text-[14px] truncate min-w-0">{selectReportType === BLANK_VALUE ? BLANK_LABEL : selectReportType}</span>
                    <button onClick={() => setSelectReportType('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectReportMode && (
                  <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Mode: </span>
                    <span className="font-semibold text-[14px] truncate min-w-0">{selectReportMode === BLANK_VALUE ? BLANK_LABEL : selectReportMode}</span>
                    <button onClick={() => setSelectReportMode('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectReportDescription.trim() && (
                  <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Description: </span>
                    <span className="font-semibold text-[14px] truncate min-w-0">{selectReportDescription}</span>
                    <button onClick={() => setSelectReportDescription('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex min-w-0 items-center justify-end gap-[6px] shrink-0">
            <EdbcTableToolbarRightActions
              onClearFilters={clearFilters}
              overallSearch={overallSearch}
              onOverallSearchChange={setOverallSearch}
              showExportIcons={false}
              clearButtonType="button"
              wrapperClassName={null}
              searchWrapperClassName="h-[34px] min-w-0 flex-1 max-w-[286px] border border-[#D6D6D6] rounded-md bg-white flex items-center px-2 sm:w-[286px] sm:min-w-[286px] sm:flex-none sm:shrink-0"
            />
            <div className="flex shrink-0 items-end gap-2">
              <span className="text-[#E4572E] flex items-center gap-1 font-semibold hover:underline cursor-pointer" onClick={openPdfExportModal}>PDF<img src={Pdf} alt="Pdf" className="w-4 h-4" /></span>
              <span className="text-[#007233] flex items-center gap-1 font-semibold hover:underline cursor-pointer" onClick={handleExportExcel}>XL<img src={XL} alt="XL" className="w-4 h-4" /></span>
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <div
          ref={scrollRef}
          className="w-full rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] flex-1 min-h-0 overflow-auto select-none scrollbar-none no-scrollbar"
          onWheel={() => { filterNudgeUsedRef.current = false; }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <table ref={tableRef} className={`table-fixed min-w-[1630px] w-full border-collapse ${EDBC_TABLE_EDGE_TABLE_CLASS} [&_thead_th]:!p-0 [&_thead_th]:align-middle [&_thead_th#EDBC-8]:!pr-[9px] [&_thead_tr:first-child>th:nth-child(6)]:!pr-[9px] [&_thead_tr:first-child>th:nth-child(7)]:!pr-[9px] ${showFilters ? '[&_thead_tr:first-child_th]:!border-b-0' : ''}`}>
            <thead className="sticky top-0 z-20 bg-[#FAF6ED]">
              <EdbcTableHeaderRow>
                <EdbcColumnHeader columnId={EDBC_IDS.EDBC21} label="S.No" />
                <EdbcColumnHeader
                  columnId={EDBC_IDS.EDBC2}
                  label="Date"
                  sortField={resolveEdbcSortField("date")}
                  sortDirection={sortConfig.direction}
                  onSort={handleEdbcSort}
                />
                <EdbcColumnHeader
                  columnId={EDBC_IDS.EDBC3}
                  label="Project Name"
                  sortField={resolveEdbcSortField("project")}
                  sortDirection={sortConfig.direction}
                  onSort={handleEdbcSort}
                />
                <EdbcColumnHeader
                  columnId={EDBC_IDS.EDBC4}
                  label="Contractor/Vendor"
                  sortField={resolveEdbcSortField("cv")}
                  sortDirection={sortConfig.direction}
                  onSort={handleEdbcSort}
                />
                <EdbcColumnHeader
                  columnId={EDBC_IDS.EDBC8}
                  label="Advance"
                  sortField={resolveEdbcSortField("amount")}
                  sortDirection={sortConfig.direction}
                  onSort={handleEdbcSort}
                />
                <th
                  className={edbc8Config?.headerClass}
                  onClick={() => requestSort("bill_amount")}
                >
                  Bill Payment {sortConfig.key === "bill_amount" && (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                </th>
                <th
                  className={edbc8Config?.headerClass}
                  onClick={() => requestSort("refund_amount")}
                >
                  Refund {sortConfig.key === "refund_amount" && (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                </th>
                <th
                  className={edbc3Config?.headerClass}
                  onClick={() => requestSort("transfer")}
                >
                  Transfer {sortConfig.key === "transfer" && (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                </th>
                <EdbcColumnHeader
                  columnId={EDBC_IDS.EDBC12}
                  label="Type"
                  sortField={resolveEdbcSortField("type")}
                  sortDirection={sortConfig.direction}
                  onSort={handleEdbcSort}
                />
                <EdbcColumnHeader
                  columnId={EDBC_IDS.EDBC13}
                  label="Mode"
                  sortField={resolveEdbcSortField("payment_mode")}
                  sortDirection={sortConfig.direction}
                  onSort={handleEdbcSort}
                />
                <EdbcColumnHeader
                  columnId={EDBC_IDS.EDBC9}
                  label="Description"
                  sortField={resolveEdbcSortField("description")}
                  sortDirection={sortConfig.direction}
                  onSort={handleEdbcSort}
                />
                <EdbcColumnHeader columnId={EDBC_IDS.EDBC20} label="File" />
              </EdbcTableHeaderRow>
              {showFilters && (
                <EdbcTableFilterRow ref={filterRowRef}>
                  <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC21} />
                  <EdbcDateFilter
                    placeholder="Date"
                    value={selectReportDate}
                    onChange={setSelectReportDate}
                  />
                  <EdbcProjectNameFilter
                    placeholder="Project Name"
                    options={reportFilterOptions.projectOptions}
                    value={selectReportProjectName}
                    onChange={setSelectReportProjectName}
                    blankOption={blankOption}
                    blankValue={BLANK_VALUE}
                    selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                  />
                  <EdbcSelectFilter
                    columnId={EDBC_IDS.EDBC4}
                    placeholder="Contractor/Vendor"
                    options={reportFilterOptions.vendorContractorOptions}
                    value={selectReportContractorVendor}
                    onChange={setSelectReportContractorVendor}
                    blankOption={blankOption}
                    blankValue={BLANK_VALUE}
                    selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                  />
                  <EdbcTotalAmountFilter columnId={EDBC_IDS.EDBC8} totalAmount={reportTotals.amount} value={selectReportAmount} onChange={(e) => setSelectReportAmount(e.target.value)} />
                  <EdbcTotalAmountFilter columnId={EDBC_IDS.EDBC8} totalAmount={reportTotals.bill_amount} value={selectReportBillAmount} onChange={(e) => setSelectReportBillAmount(e.target.value)} />
                  <EdbcTotalAmountFilter columnId={EDBC_IDS.EDBC8} totalAmount={reportTotals.refund_amount} value={selectReportRefundAmount} onChange={(e) => setSelectReportRefundAmount(e.target.value)} />
                  <EdbcProjectNameFilter
                    placeholder="Transfer"
                    options={reportFilterOptions.transferOptions}
                    value={selectReportTransfer}
                    onChange={setSelectReportTransfer}
                    blankOption={{ value: BLANK_VALUE, label: 'Blank' }}
                    blankValue={BLANK_VALUE}
                    isClearable
                    selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                  />
                  <EdbcSelectFilter
                    columnId={EDBC_IDS.EDBC12}
                    placeholder="Type"
                    options={reportFilterOptions.typeOptions.map((t) =>
                      t === BLANK_VALUE ? blankOption : { value: t, label: t }
                    )}
                    value={selectReportType}
                    onChange={setSelectReportType}
                    blankOption={blankOption}
                    blankValue={BLANK_VALUE}
                    selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                  />
                  <EdbcSelectFilter
                    columnId={EDBC_IDS.EDBC13}
                    placeholder="Mode"
                    options={reportFilterOptions.modeOptions.map((m) =>
                      m === BLANK_VALUE ? blankOption : { value: m, label: m }
                    )}
                    value={selectReportMode}
                    onChange={setSelectReportMode}
                    blankOption={blankOption}
                    blankValue={BLANK_VALUE}
                    selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                  />
                  <EdbcTextInputFilter
                    columnId={EDBC_IDS.EDBC9}
                    placeholder="Description"
                    value={selectReportDescription}
                    onChange={(e) => setSelectReportDescription(e.target.value)}
                  />
                  <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC20} />
                </EdbcTableFilterRow>
              )}
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center py-4 text-gray-500 font-semibold">No Entry is available</td>
                </tr>
              ) : (
                currentData.map((row, index) => (
                  <EdbcTableBodyRow key={row.id || index}>
                    <td id={EDBC_IDS.EDBC21} className={edbc21Config?.tdClass}>
                      {startIndex + index + 1}
                    </td>
                    <EdbcDateBodyCell
                      expense={row}
                      rowIndex={index}
                      expandedCells={expandedCells}
                      onToggleExpanded={toggleExpandedCell}
                      formatValue={formatExpenseDateOnly}
                    />
                    <EdbcExpandableBodyCell
                      columnId={EDBC_IDS.EDBC3}
                      expense={row}
                      rowIndex={index}
                      expandedCells={expandedCells}
                      onToggleExpanded={toggleExpandedCell}
                      getDisplayValue={getReportProjectName}
                    />
                    <EdbcExpandableBodyCell
                      columnId={EDBC_IDS.EDBC4}
                      expense={row}
                      rowIndex={index}
                      expandedCells={expandedCells}
                      onToggleExpanded={toggleExpandedCell}
                      getDisplayValue={getReportContractorVendorName}
                    />
                    <EdbcExpandableBodyCell
                      columnId={EDBC_IDS.EDBC8}
                      expense={row}
                      rowIndex={index}
                      expandedCells={expandedCells}
                      onToggleExpanded={toggleExpandedCell}
                      textAlignClass="text-right"
                      getDisplayValue={(entry) => formatReportAmount(entry.amount)}
                    />
                    <td className={`${edbc8Config?.tdClass || ""} text-right`.trim()}>
                      <span
                        onClick={() => toggleExpandedCell(`${row.id ?? index}-bill_amount`)}
                        className={`block w-full cursor-pointer text-right ${expandedCells[`${row.id ?? index}-bill_amount`] ? "whitespace-normal break-words" : "truncate whitespace-nowrap overflow-hidden"}`}
                        title={formatReportAmount(row.bill_amount)}
                      >
                        {formatReportAmount(row.bill_amount)}
                      </span>
                    </td>
                    <td className={`${edbc8Config?.tdClass || ""} text-right`.trim()}>
                      <span
                        onClick={() => toggleExpandedCell(`${row.id ?? index}-refund_amount`)}
                        className={`block w-full cursor-pointer text-right ${expandedCells[`${row.id ?? index}-refund_amount`] ? "whitespace-normal break-words" : "truncate whitespace-nowrap overflow-hidden"}`}
                        title={formatReportAmount(row.refund_amount)}
                      >
                        {formatReportAmount(row.refund_amount)}
                      </span>
                    </td>
                    <td className={edbc3Config?.tdClass}>
                      <span
                        onClick={() => toggleExpandedCell(`${row.id ?? index}-transfer`)}
                        className={`block w-full cursor-pointer ${expandedCells[`${row.id ?? index}-transfer`] ? "whitespace-normal break-words" : "truncate whitespace-nowrap overflow-hidden"}`}
                        title={getReportTransferName(row)}
                      >
                        {getReportTransferName(row) || ""}
                      </span>
                    </td>
                    <EdbcExpandableBodyCell
                      columnId={EDBC_IDS.EDBC12}
                      expense={row}
                      rowIndex={index}
                      expandedCells={expandedCells}
                      onToggleExpanded={toggleExpandedCell}
                      getDisplayValue={(entry) => (entry.type && entry.type !== "-") ? entry.type : ""}
                    />
                    <EdbcExpandableBodyCell
                      columnId={EDBC_IDS.EDBC13}
                      expense={row}
                      rowIndex={index}
                      expandedCells={expandedCells}
                      onToggleExpanded={toggleExpandedCell}
                      getDisplayValue={(entry) => (entry.payment_mode && entry.payment_mode !== "-") ? entry.payment_mode : ""}
                    />
                    <EdbcExpandableBodyCell
                      columnId={EDBC_IDS.EDBC9}
                      expense={row}
                      rowIndex={index}
                      expandedCells={expandedCells}
                      onToggleExpanded={toggleExpandedCell}
                      getDisplayValue={(entry) => (entry.description && entry.description !== "-") ? entry.description : ""}
                    />
                    <EdbcFileBodyCell columnId={EDBC_IDS.EDBC20} expense={{ ...row, billCopy: row.file_url }} />
                  </EdbcTableBodyRow>
                ))
              )}
            </tbody>
          </table>
        </div>
        </div>
        <div className="flex shrink-0 items-center justify-between mt-4 px-4 py-3 border-t border-gray-200">
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
              Showing {sortedData.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} entries
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1 || totalPages === 0}
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
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#BF9853] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      </div>
      {pdfExportModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setPdfExportModalOpen(false)}
          role="presentation"
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pdf-export-modal-title"
          >
            <h3 id="pdf-export-modal-title" className="text-lg font-bold text-gray-900 mb-2">
              Export PDF
            </h3>
            <p className="text-sm text-gray-600 mb-6">Which PDF do you want to generate?</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                className="flex-1 py-2.5 px-4 rounded-md border-2 border-[#BF9853] text-[#BF9853] font-semibold hover:bg-[#BF9853] hover:text-white transition-colors"
                onClick={() => generateAdvanceReportPdf("accounts")}
              >
                Accounts Copy
              </button>
              <button
                type="button"
                className="flex-1 py-2.5 px-4 rounded-md border-2 border-[#BF9853] bg-[#BF9853] text-white font-semibold hover:opacity-90 transition-opacity"
                onClick={() => generateAdvanceReportPdf("signature")}
              >
                Signature Copy
              </button>
            </div>
            <button
              type="button"
              className="mt-4 w-full text-sm text-gray-500 hover:text-gray-800 py-2"
              onClick={() => setPdfExportModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdvanceReport;