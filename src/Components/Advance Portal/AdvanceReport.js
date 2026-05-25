import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Select from "react-select";

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

const AdvanceReport = ({ username, userRoles = [], paymentModeOptions = [], refreshSignal }) => {
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
      borderWidth: '2px',
      lineHeight: '20px',
      fontSize: '14px',
      minHeight: '45px',
      height: '45px',
      borderRadius: '8px',
      borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.5)' : 'rgba(191, 152, 83, 0.25)',
      boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
      '&:hover': {
        borderColor: 'rgba(191, 152, 83, 0.5)',
      },
    }),
    clearIndicator: (provided) => ({
      ...provided,
      cursor: 'pointer',
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
      maxHeight: '250px',
      overflowY: 'auto',
    }),
    singleValue: (provided) => ({
      ...provided,
      fontWeight: '500',
      color: 'black',
      textAlign: 'left',
    }),
    option: (provided, state) => ({
      ...provided,
      fontWeight: '500',
      backgroundColor: state.isSelected 
        ? 'rgba(191, 152, 83, 0.3)' 
        : state.isFocused 
          ? 'rgba(191, 152, 83, 0.1)' 
          : 'white',
      color: 'black',
      textAlign: 'left',
    }),
    input: (provided) => ({
      ...provided,
      fontWeight: '500',
      color: 'black',
      textAlign: 'left',
    }),
    placeholder: (provided) => ({
      ...provided,
      fontWeight: '500',
      color: '#999',
      textAlign: 'left',
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
        const res = await fetch("https://backendaab.in/demoAabuilderDash/api/vendor_Names/getAll", {
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
        const res = await fetch("https://backendaab.in/demoAabuilderDash/api/contractor_Names/getAll", {
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
      const res = await fetch(buildBranchUrl("https://backendaab.in/demoAabuildersDash/api/advance_portal/getAll"));
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
    fetchAdvanceData();
  }, [refreshSignal, fetchAdvanceData]);

  useEffect(() => {
    const loadProjectAndEmployeeMasters = async () => {
      try {
        const [projRes, empRes] = await Promise.all([
          fetch("https://backendaab.in/demoAabuilderDash/api/projects/getAll", {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }),
          fetch("https://backendaab.in/demoAabuildersDash/api/employee_details/getAll", {
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

    setFilteredData(filtered);
  }, [advanceData, startDate, endDate, week, year, paymentModeFilter, typeFilter]);

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
    .toLocaleString("en-IN");
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
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, week, year, paymentModeFilter, typeFilter]);
  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>;
  };
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const openPdfExportModal = () => {
    if (!filteredData.length) {
      alert("No data to export");
      return;
    }
    setPdfExportModalOpen(true);
  };

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
        advance: row.amount?.toLocaleString("en-IN") || "0",
        bill: row.bill_amount?.toLocaleString("en-IN") || "0",
        refund: row.refund_amount?.toLocaleString("en-IN") || "0",
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
          { content: filteredReportTotal.toLocaleString("en-IN"), styles: { halign: 'right' } },
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
            advance: row.amount?.toLocaleString("en-IN") || "0",
            bill: row.bill_amount?.toLocaleString("en-IN") || "0",
            refund: row.refund_amount?.toLocaleString("en-IN") || "0",
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
      `${filteredReportTotalLabel}: ${filteredReportTotal.toLocaleString("en-IN")}`,
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
        (row.amount ?? 0).toLocaleString("en-IN"),
        (row.bill_amount ?? 0).toLocaleString("en-IN"),
        (row.refund_amount ?? 0).toLocaleString("en-IN"),
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
          ["Start Date", billSettlementFromDate, "End Date", billSettlementToDate, "Total Bill Amount", totalBillAmount.toLocaleString("en-IN"), "", "", "", "", "", ""],
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
            (row.amount ?? 0).toLocaleString("en-IN"),
            (row.bill_amount ?? 0).toLocaleString("en-IN"),
            (row.refund_amount ?? 0).toLocaleString("en-IN"),
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
    <div className='bg-[#FAF6ED]'>
      <div className="flex flex-wrap flex-col xl:space-y-0 space-y-4 xl:flex-row items-start justify-between bg-white p-4 ml-10 mr-10 px-8 lg:h-[128px] rounded-md shadow-sm max-w-[1850px] mb-4">
        <div className="flex flex-wrap gap-4 text-left">
          <div>
            <label className="block font-semibold mb-1">Week No</label>
            <Select
              value={week ? { value: week, label: week } : null}
              onChange={(selectedOption) => {
                const value = selectedOption ? selectedOption.value : "";
                setWeek(value);
                setStartDate("");
                setEndDate("");
              }}
              options={Array.from({ length: 53 }, (_, i) => ({
                value: `Week ${String(i + 1).padStart(2, "0")}`,
                label: `Week ${String(i + 1).padStart(2, "0")}`,
              }))}
              placeholder="Select"
              isSearchable
              isClearable
              styles={customStyles}
              className="w-full h-[45px]"
              classNamePrefix="select"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Year</label>
            <Select
              value={year ? { value: year, label: year } : null}
              onChange={(selectedOption) => setYear(selectedOption ? selectedOption.value : "")}
              options={years.map((y) => ({
                value: y.toString(),
                label: y.toString(),
              }))}
              placeholder="Select Year"
              isSearchable
              isClearable
              styles={customStyles}
              className="w-full h-[45px]"
              classNamePrefix="select"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setWeek("");
              }}
              className="border-2 border-[#BF9853] border-opacity-25 rounded-lg px-3 py-2 w-full h-[45px] focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setWeek("");
              }}
              className="border-2 border-[#BF9853] border-opacity-25 rounded-lg px-3 py-2 w-full h-[45px] focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Payment Mode</label>
            <Select
              value={paymentModeFilter ? { value: paymentModeFilter, label: paymentModeFilter } : null}
              onChange={(selectedOption) => setPaymentModeFilter(selectedOption ? selectedOption.value : "")}
              options={finalPaymentModeOptions}
              placeholder="All Modes"
              isSearchable
              isClearable
              styles={customStyles}
              className="w-[168px]"
              classNamePrefix="select"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Type</label>
            <Select
              value={typeFilter ? { value: typeFilter, label: typeFilter } : null}
              onChange={(selectedOption) => setTypeFilter(selectedOption ? selectedOption.value : "")}
              options={[
                { value: "Advance", label: "Advance" },
                { value: "Bill Settlement", label: "Bill Settlement" },
                { value: "Refund", label: "Refund" },
                { value: "Transfer", label: "Transfer" },
              ]}
              placeholder="All Types"
              isSearchable
              isClearable
              styles={customStyles}
              className="w-[168px]"
              classNamePrefix="select"
            />
          </div>
        </div>
        <div>
          <div className="text-sm text-right space-y-1 border-2 border-[#E4572E] border-opacity-15 p-1">
            <div>
              <span className="font-semibold">From Date</span> :{" "}
              <span className="text-red-500">
                {startDate
                  ? new Date(startDate).toLocaleDateString("en-GB")
                  : fromDate || "-"}
              </span>
            </div>
            <div>
              <span className="font-semibold">To Date</span> :{" "}
              <span className="text-red-500">
                {endDate
                  ? new Date(endDate).toLocaleDateString("en-GB")
                  : toDate || "-"}
              </span>
            </div>
          </div>
          <div className="text-sm text-right space-y-1 border-2 border-[#E4572E] border-opacity-15 p-1 mt-2">
            <div>
              <span className="font-semibold">Total Advance</span> : <span className="text-red-500 font-semibold">{totalAdvance}</span>
            </div>
          </div>
        </div>
      </div>
      <div className='max-w-[1850px] rounded-md h-[650px] ml-10 mr-10 px-8 bg-white p-4'>
        <div className='space-x-6 flex justify-end'>
          <button onClick={openPdfExportModal} className='text-sm text-[#E4572E] hover:underline font-bold'>Export PDF</button>
          <button onClick={handleExportExcel} className='text-sm text-[#007233] hover:underline font-bold'>Export XL</button>
          <button className='text-sm text-[#BF9853] hover:underline font-bold'>Print</button>
        </div>
        <div
          ref={scrollRef}
          className=" rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] h-[500px] overflow-auto select-none "
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <table ref={tableRef} className="table-fixed min-w-[1835px] w-full border-collapse">
            <thead className='bg-[#FAF6ED]'>
              <tr>
                <th
                  className="py-2 pl-3 w-20 font-bold text-left cursor-pointer hover:bg-gray-200 select-none"
                  onClick={() => requestSort("sno")}
                >
                  S.No <SortIcon columnKey="sno" />
                </th>
                <th
                  className="pt-2 pl-3 w-32 font-bold text-left cursor-pointer hover:bg-gray-200 select-none"
                  onClick={() => requestSort("date")}
                >
                  Date <SortIcon columnKey="date" />
                </th>
                <th
                  className="px-2 w-[200px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none"
                  onClick={() => requestSort("cv")}
                >
                  Contractor/Vendor <SortIcon columnKey="cv" />
                </th>
                <th
                  className="px-2 w-[240px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none"
                  onClick={() => requestSort("project")}
                >
                  Project Name <SortIcon columnKey="project" />
                </th>
                <th className="px-2 w-[100px] font-bold text-right">Advance</th>
                <th className="px-2 w-[100px] font-bold text-right">Bill Amount</th>
                <th className="px-2 w-[120px] font-bold text-right">Refund Amount</th>
                <th
                  className="px-2 w-[100px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none"
                  onClick={() => requestSort("transfer")}
                >
                  Transfer <SortIcon columnKey="transfer" />
                </th>
                <th
                  className="px-2 w-[100px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none"
                  onClick={() => requestSort("type")}
                >
                  Type <SortIcon columnKey="type" />
                </th>
                <th
                  className="px-2 w-[100px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none"
                  onClick={() => requestSort("payment_mode")}
                >
                  Mode <SortIcon columnKey="payment_mode" />
                </th>
                <th
                  className="px-2 w-[200px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none"
                  onClick={() => requestSort("description")}
                >
                  Description <SortIcon columnKey="description" />
                </th>
                <th className="px-2 w-[100px] font-bold text-left whitespace-nowrap">File</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center py-4 text-gray-500 font-semibold">No Entry is available</td>
                </tr>
              ) : (
                currentData.map((row, index) => (
                  <tr key={row.id || index} className="odd:bg-white even:bg-[#FAF6ED]">
                    <td className="text-sm text-left p-3 w-32 font-semibold">{startIndex + index + 1}</td>
                    <td className="text-sm text-left p-3 w-32 font-semibold">{new Date(row.date).toLocaleDateString("en-GB")}</td>
                    <td className="text-sm text-left p-3 w-32 font-semibold">{contractorOptions.find(c => c.id === row.contractor_id)?.label || vendorOptions.find(v => v.id === row.vendor_id)?.label || "-"}</td>
                    <td className="text-sm text-left p-3 w-32 font-semibold">{siteOptions.find(s => String(s.id) === String(row.project_id))?.label || "-"}</td>
                    <td className="text-sm text-right p-3 w-32 font-semibold">{row.amount?.toLocaleString("en-IN") || "0"}</td>
                    <td className="text-sm text-right p-3 w-32 font-semibold">{row.bill_amount?.toLocaleString("en-IN") || "0"}</td>
                    <td className="text-sm text-right pr-1 p-3 w-32 font-semibold">{row.refund_amount?.toLocaleString("en-IN") || "0"}</td>
                    <td className="text-sm text-left p-3 w-32 font-semibold">{siteOptions.find(s => s.id === row.transfer_site_id)?.label || "-"}</td>
                    <td className="text-sm text-left p-3 w-32 font-semibold">{row.type || "-"}</td>
                    <td className="text-sm text-left p-3 w-32 font-semibold">{row.payment_mode || "-"}</td>
                    <td className="text-sm text-left p-3 w-32 font-semibold">{row.description || "-"}</td>
                    <td className="text-sm text-left p-3 w-32 font-semibold">
                      {row.file_url ? (
                        <a
                          href={row.file_url}
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {sortedData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-5 py-4 bg-white border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Show:</label>
              <Select
                value={{ value: itemsPerPage, label: itemsPerPage.toString() }}
                onChange={(selectedOption) => {
                  const newItemsPerPage = selectedOption ? selectedOption.value : 50;
                  setItemsPerPage(newItemsPerPage);
                  setCurrentPage(1);
                }}
                options={[
                  { value: 50, label: "50" },
                  { value: 100, label: "100" },
                  { value: 200, label: "200" },
                  { value: 300, label: "300" },
                  { value: 400, label: "400" },
                  { value: 500, label: "500" },
                  { value: 600, label: "600" },
                  { value: 700, label: "700" },
                  { value: 800, label: "800" },
                  { value: 900, label: "900" },
                  { value: 1000, label: "1000" },
                ]}
                isSearchable
                styles={{
                  ...customStyles,
                  control: (provided, state) => ({
                    ...provided,
                    borderWidth: '1px',
                    minHeight: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    borderColor: state.isFocused ? '#BF9853' : '#d1d5db',
                    boxShadow: state.isFocused ? '0 0 0 2px rgba(191, 152, 83, 0.2)' : 'none',
                    fontSize: '14px',
                  }),
                }}
                className="w-24"
                classNamePrefix="select"
              />
              <span className="text-sm text-gray-700">entries</span>
            </div>
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 text-sm font-medium rounded-md ${currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-[#BF9853] border border-[#BF9853] hover:bg-[#BF9853] hover:text-white transition-colors'
                  }`}
              >
                Previous
              </button>
              <div className="flex items-center space-x-1">
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
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${currentPage === pageNum
                        ? 'bg-[#BF9853] text-white'
                        : 'bg-white text-[#BF9853] border border-[#BF9853] hover:bg-[#BF9853] hover:text-white transition-colors'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 text-sm font-medium rounded-md ${currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-[#BF9853] border border-[#BF9853] hover:bg-[#BF9853] hover:text-white transition-colors'
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
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