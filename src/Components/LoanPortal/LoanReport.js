import React, { useState, useEffect, useRef, useMemo } from "react";
import Select from 'react-select';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

Date.prototype.getWeekNumber = function () {
  const firstDay = new Date(this.getFullYear(), 0, 1);
  const pastDaysOfYear = (this - firstDay) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
};

const LoanReport = ({ username, userRoles = [], paymentModeOptions = [] }) => {
  const [week, setWeek] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [labourOptions, setLabourOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  const [purposeOptions, setPurposeOptions] = useState([]);
  const [loanData, setLoanData] = useState([]);
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

  // Popup state
  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState([]);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupContext, setPopupContext] = useState("");
  const [popupSortConfig, setPopupSortConfig] = useState({ key: null, direction: 'asc' });

  const scrollRef = useRef(null);
  const tableRef = useRef(null);

  // drag-scroll momentum refs
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
  const startYear = 2000;
  const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);


  // Use paymentModeOptions from props, fallback to default if not provided
  const defaultPaymentModeOptions = useMemo(
    () => [
      { id: 1, value: "Cash", label: "Cash" },
      { id: 2, value: "GPay", label: "GPay" },
      { id: 3, value: "PhonePe", label: "PhonePe" },
      { id: 4, value: "Net Banking", label: "Net Banking" },
      { id: 5, value: "Cheque", label: "Cheque" },
      { id: 6, value: "Advance Transfer", label: "Advance Transfer" },
    ],
    []
  );

  const finalPaymentModeOptions = paymentModeOptions.length > 0 ? paymentModeOptions : defaultPaymentModeOptions;

  // Custom styles for Select components
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderWidth: '2px',
      lineHeight: '20px',
      fontSize: '14px',
      height: '45px',
      borderRadius: '8px',
      borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.3)' : 'rgba(191, 152, 83, 0.3)',
      boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.3)' : 'none',
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
        setProgress(20);
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
        setProgress(30);
        const res = await fetch("https://backendaab.in/aabuilderDash/api/contractor_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        setContractorOptions(
          data.map((item) => ({ value: item.contractorName, label: item.contractorName, id: item.id }))
        );
        setProgress(40);
      } catch (err) {
        console.error(err);
        setError("Failed to load contractor data");
      }
    };
    fetchContractorNames();
  }, []);

  // Fetch Employee Names
  useEffect(() => {
    const fetchEmployeeNames = async () => {
      try {
        setProgress(50);
        const response = await fetch("https://backendaab.in/aabuildersDash/api/employee_details/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
          throw new Error("Network response was not ok: " + response.statusText);
        }
        const data = await response.json();
        const formattedData = data.map(item => ({
          value: item.employee_name,
          label: item.employee_name,
          id: item.id,
          type: "Employee",
        }));
        setEmployeeOptions(formattedData);
        setProgress(55);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchEmployeeNames();
  }, []);

  // Fetch Labour Names
  useEffect(() => {
    const fetchLabourNames = async () => {
      try {
        setProgress(60);
        const response = await fetch("https://backendaab.in/aabuildersDash/api/labours-details/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
          throw new Error("Network response was not ok: " + response.statusText);
        }
        const data = await response.json();
        const formattedData = data.map(item => ({
          value: item.labour_name,
          label: item.labour_name,
          id: item.id,
          type: "Labour",
        }));
        setLabourOptions(formattedData);
        setProgress(65);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchLabourNames();
  }, []);

  // Fetch Purpose Options
  useEffect(() => {
    const fetchPurposeOptions = async () => {
      try {
        setProgress(70);
        const response = await fetch('https://backendaab.in/aabuildersDash/api/loan-purposes/getAll', {
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
          value: item.purpose,
          label: item.purpose,
          id: item.id,
          type: 'Purpose'
        }));
        setPurposeOptions(formattedData);
        setProgress(75);
      } catch (error) {
        console.error("Error fetching purpose options: ", error);
        setPurposeOptions([]);
      }
    };
    fetchPurposeOptions();
  }, []);

  // Fetch Site Names
  useEffect(() => {
    const fetchSites = async () => {
      try {
        setProgress(80);
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
          sNo: item.siteNo,
          type: "Site",
        }));
        setSiteOptions(formattedData);
        setProgress(85);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchSites();
  }, []);

  // Fetch Loan Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setProgress(90);
        const res = await fetch("https://backendaab.in/aabuildersDash/api/loans/all", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        setLoanData(data);
        setProgress(100);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching loan data", err);
        setError("Failed to load loan data");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Update getPurposeOrSiteName to use fetched purposeOptions
  const getPurposeOrSiteName = (entry) => {
    if (!entry || !purposeOptions || purposeOptions.length === 0) {
      return "";
    }

    // Check from_purpose_id first (used for all types including Loan, Refund, Transfer)
    if (entry.from_purpose_id) {
      const purpose = purposeOptions.find((p) => {
        const purposeId = String(p.id);
        const entryId = String(entry.from_purpose_id);
        return purposeId === entryId;
      });
      if (purpose && purpose.value) {
        return purpose.value;
      }
    }

    // Fallback to loan_purpose_id if from_purpose_id is not available
    if (entry.loan_purpose_id) {
      const purpose = purposeOptions.find((p) => {
        const purposeId = String(p.id);
        const entryId = String(entry.loan_purpose_id);
        return purposeId === entryId;
      });
      if (purpose && purpose.value) {
        return purpose.value;
      }
    }

    return "";
  };

  // Helper — Week number calculation for Monday-Sunday weeks
  const getWeekNumberFromDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    // Get the Monday of the week containing this date
    const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Convert to Monday = 0
    const mondayOfWeek = new Date(d);
    mondayOfWeek.setDate(d.getDate() + mondayOffset);

    // Get January 1st of the year
    const jan1 = new Date(mondayOfWeek.getFullYear(), 0, 1);
    // Get the Monday of the week containing January 1st
    const jan1DayOfWeek = jan1.getDay();
    const jan1MondayOffset = jan1DayOfWeek === 0 ? -6 : 1 - jan1DayOfWeek;
    const firstMonday = new Date(jan1);
    firstMonday.setDate(jan1.getDate() + jan1MondayOffset);

    // Calculate week number (1-based)
    const diffTime = mondayOfWeek - firstMonday;
    const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1000));
    return Math.floor(diffDays / 7) + 1;
  };

  const getCurrentWeekNumber = () => {
    return getWeekNumberFromDate(new Date());
  };

  // Default to current week
  useEffect(() => {
    const currentWeek = getCurrentWeekNumber();
    setWeek(`Week ${String(currentWeek).padStart(2, "0")}`);
  }, []);

  // Filter logic — if both startDate and endDate are provided, ignore week filter
  useEffect(() => {
    if (!loanData.length) return;

    let filtered = loanData;

    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      // normalize end to end of day
      e.setHours(23, 59, 59, 999);
      filtered = loanData.filter((item) => {
        const d = new Date(item.date);
        return d >= s && d <= e;
      });
    } else if (week) {
      const selectedWeekNum = parseInt(week.replace("Week ", ""), 10);
      filtered = loanData.filter((item) => {
        const d = new Date(item.date);
        return d.getFullYear() === parseInt(year, 10) && getWeekNumberFromDate(item.date) === selectedWeekNum;
      });
    } else {
      // If neither date-range nor week selected, default to empty
      filtered = [];
    }

    // Apply Payment Mode filter
    if (paymentModeFilter) {
      filtered = filtered.filter((item) => (item.loan_payment_mode || "").toString().toLowerCase() === paymentModeFilter.toLowerCase());
    }

    // Apply Type filter
    if (typeFilter) {
      filtered = filtered.filter((item) => (item.type || "").toString().toLowerCase() === typeFilter.toLowerCase());
    }

    setFilteredData(filtered);
  }, [loanData, startDate, endDate, week, year, paymentModeFilter, typeFilter]);

  // fromDate/toDate/totalLoan computations
  const fromDate = filteredData.length
    ? new Date(Math.min(...filteredData.map((r) => new Date(r.date)))).toLocaleDateString("en-GB")
    : "-";
  const toDate = filteredData.length
    ? new Date(Math.max(...filteredData.map((r) => new Date(r.date)))).toLocaleDateString("en-GB")
    : "-";
  const totalLoan = filteredData
    .filter((r) => (r.type === "Loan" || r.type === "Transfer"))
    .reduce((sum, r) => {
      const amount = r.amount || 0;
      return sum + (amount);
    }, 0)
    .toLocaleString("en-IN");

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
  const getAssociateName = (entry) => {
    if (entry.vendor_id) return getLabelById(vendorOptions, entry.vendor_id);
    if (entry.contractor_id) return getLabelById(contractorOptions, entry.contractor_id);
    if (entry.employee_id) return getLabelById(employeeOptions, entry.employee_id);
    if (entry.labour_id) return getLabelById(labourOptions, entry.labour_id);
    return "";
  };
  const getTransferDestination = (entry) => {
    if (entry.type === "Transfer") {
      if (entry.to_purpose_id) {
        return purposeOptions.find((p) => String(p.id) === String(entry.to_purpose_id))?.value || "";
      } else if (entry.transfer_Project_id) {
        return getLabelById(siteOptions, entry.transfer_Project_id);
      }
    }
    return "";
  };
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
        case "associate": {
          va = getAssociateName(a);
          vb = getAssociateName(b);
          break;
        }
        case "purpose": {
          va = getPurposeOrSiteName(a);
          vb = getPurposeOrSiteName(b);
          break;
        }
        case "transfer": {
          va = getTransferDestination(a);
          vb = getTransferDestination(b);
          break;
        }
        case "type":
          va = normStr(a.type);
          vb = normStr(b.type);
          break;
        case "payment_mode":
          va = normStr(a.loan_payment_mode);
          vb = normStr(b.loan_payment_mode);
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
  }, [filteredData, sortConfig, vendorOptions, contractorOptions, employeeOptions, labourOptions, siteOptions, purposeOptions]);
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

  // Popup handlers
  const handleLoanClick = (row) => {
    if (row.type !== "Loan" && row.type !== "Transfer") return;
    const associateName = getAssociateName(row);
    const purposeName = getPurposeOrSiteName(row);
    const filtered = loanData.filter(item => {
      const itemAssociateId = item.vendor_id || item.contractor_id || item.employee_id || item.labour_id;
      const rowAssociateId = row.vendor_id || row.contractor_id || row.employee_id || row.labour_id;
      const itemPurposeId = item.loan_purpose_id || item.from_purpose_id;
      const rowPurposeId = row.loan_purpose_id || row.from_purpose_id;
      return String(itemAssociateId) === String(rowAssociateId) &&
        String(itemPurposeId) === String(rowPurposeId) &&
        (item.type === "Loan" || item.type === "Transfer");
    });
    if (filtered.length > 0) {
      const details = filtered.map(item => ({
        date: new Date(item.date).toLocaleDateString("en-GB"),
        amount: parseFloat(item.amount) || 0,
        type: item.type,
        mode: item.type === "Transfer" ? "" : (finalPaymentModeOptions.find(opt => opt.value === item.loan_payment_mode)?.label || item.loan_payment_mode || ""),
        description: item.description || "",
        transferTo: getTransferDestination(item),
      }));
      setPopupTitle('Loan/Transfer Details');
      setPopupData(details);
      setPopupContext(`${associateName} - ${purposeName}`);
      setShowPopup(true);
    } else {
      alert("No loan/transfer transactions found for this associate and purpose.");
    }
  };

  const handleRefundClick = (row) => {
    if (row.type !== "Refund") return;
    const associateName = getAssociateName(row);
    const purposeName = getPurposeOrSiteName(row);
    const filtered = loanData.filter(item => {
      const itemAssociateId = item.vendor_id || item.contractor_id || item.employee_id || item.labour_id;
      const rowAssociateId = row.vendor_id || row.contractor_id || row.employee_id || row.labour_id;
      const itemPurposeId = item.loan_purpose_id || item.from_purpose_id;
      const rowPurposeId = row.loan_purpose_id || row.from_purpose_id;
      return String(itemAssociateId) === String(rowAssociateId) &&
        String(itemPurposeId) === String(rowPurposeId) &&
        item.type === "Refund";
    });
    if (filtered.length > 0) {
      const details = filtered.map(item => ({
        date: new Date(item.date).toLocaleDateString("en-GB"),
        amount: parseFloat(item.loan_refund_amount) || 0,
        type: item.type,
        mode: finalPaymentModeOptions.find(opt => opt.value === item.loan_payment_mode)?.label || item.loan_payment_mode || "",
        description: item.description || "",
      }));
      setPopupTitle('Refund Details');
      setPopupData(details);
      setPopupContext(`${associateName} - ${purposeName}`);
      setShowPopup(true);
    } else {
      alert("No refund transactions found for this associate and purpose.");
    }
  };

  const handlePopupSort = (key) => {
    let direction = 'asc';
    if (popupSortConfig.key === key && popupSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setPopupSortConfig({ key, direction });
  };

  const sortPopupData = (data, config) => {
    if (!config.key) {
      return [...data].sort((a, b) => {
        const dateA = new Date(a.date.split('/').reverse().join('-'));
        const dateB = new Date(b.date.split('/').reverse().join('-'));
        return dateB - dateA;
      });
    }
    return [...data].sort((a, b) => {
      let aValue = a[config.key];
      let bValue = b[config.key];
      if (config.key === 'date') {
        aValue = new Date(a.date.split('/').reverse().join('-'));
        bValue = new Date(b.date.split('/').reverse().join('-'));
        return config.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return config.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();
      if (aValue < bValue) {
        return config.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return config.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const exportPopupPDF = (data, title, context) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(context, 14, 15);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(title, 14, 25);
    const tableColumn = ["Date", "Amount", "Type", "Mode", "Description"];
    const tableRows = [];
    data.forEach(item => {
      tableRows.push([
        item.date,
        item.amount.toLocaleString("en-IN"),
        item.type,
        item.mode || "-",
        item.description || "-",
      ]);
    });
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        lineWidth: 0.2,
        lineColor: [100, 100, 100],
        fontStyle: "bold"
      },
      styles: {
        textColor: 0,
        lineWidth: 0.2,
        lineColor: [100, 100, 100]
      },
      columnStyles: {
        1: { halign: 'right' }
      }
    });
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 5,
      body: [["Total", total.toLocaleString("en-IN"), "", "", ""]],
      theme: 'grid',
      styles: {
        fontStyle: 'bold',
        textColor: 0,
        lineWidth: 0.2,
        lineColor: [100, 100, 100]
      },
      columnStyles: {
        1: { halign: 'right' }
      }
    });
    const fileName = `${context.replace(/[^a-z0-9]/gi, '_')}_${title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    doc.save(fileName);
  };

  const exportPopupCSV = (data, title, context) => {
    const extraRow = [[context], [title], []];
    const headers = ["Date", "Amount", "Type", "Mode", "Description"];
    const rows = data.map(item => [
      item.date,
      item.amount,
      item.type,
      item.mode || "-",
      item.description || "-",
    ]);
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    rows.push(["Total", total, "", "", ""]);
    let csvContent = "data:text/csv;charset=utf-8,"
      + [...extraRow, headers, ...rows]
        .map(e => e.join(","))
        .join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    const fileName = `${context.replace(/[^a-z0-9]/gi, '_')}_${title.replace(/[^a-z0-9]/gi, '_')}.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleExportPDF = () => {
    if (!filteredData.length) {
      alert("No data to export");
      return;
    }
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    // Set equal margins on left and right
    const marginLeft = 34;
    const marginRight = 34;
    const pageWidth = doc.internal.pageSize.getWidth();
    const availableWidth = pageWidth - marginLeft - marginRight;
    const columns = [
      { header: "S.No", dataKey: "sno" },
      { header: "Date", dataKey: "date" },
      { header: "Associate", dataKey: "associate" },
      { header: "Purpose", dataKey: "purpose" },
      { header: "Transfer To", dataKey: "transfer" },
      { header: "Loan/Transfer", dataKey: "loan" },
      { header: "Refund", dataKey: "refund" },
      { header: "Type", dataKey: "type" },
      { header: "Mode", dataKey: "mode" },
      { header: "Description", dataKey: "description" },
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
      const modeA = normStr(a.loan_payment_mode), modeB = normStr(b.loan_payment_mode);
      if (modeA !== modeB) return modeA.localeCompare(modeB);
      return dateKey(a.date) - dateKey(b.date);
    });
    const totalLoanAmount = sortedData
      .filter(row => normStr(row.type) === "loan" || normStr(row.type) === "transfer")
      .reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
    const rows = sortedData.map((row, index) => {
      const d = new Date(dateKey(row.date));
      return {
        sno: index + 1,
        date: isNaN(d) ? "" : d.toLocaleDateString("en-GB"),
        associate: getAssociateName(row),
        purpose: getPurposeOrSiteName(row),
        transfer: getTransferDestination(row),
        loan: (row.type === "Loan" || row.type === "Transfer") ? (row.amount?.toLocaleString("en-IN") || "0") : "-",
        refund: row.type === "Refund" ? (row.loan_refund_amount?.toLocaleString("en-IN") || "0") : "-",
        type: row.type || "",
        mode: row.type === "Transfer" ? "" : (finalPaymentModeOptions.find(opt => opt.value === row.loan_payment_mode)?.label || row.loan_payment_mode || ""),
        description: row.description || "",
      };
    });
    doc.autoTable({
      startY: 20,
      margin: { left: marginLeft, right: marginRight },
      tableWidth: availableWidth,
      body: [
        [
          { content: "Start Date", styles: { fontStyle: 'bold' } },
          fromDate,
          { content: "End Date", styles: { fontStyle: 'bold' } },
          toDate,
          { content: "Total Loan", styles: { fontStyle: 'bold' } },
          totalLoanAmount.toLocaleString("en-IN"),
        ],
      ],
      theme: 'grid',
      styles: {
        fontSize: 10,
        halign: 'left',
        cellPadding: 5,
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
        overflow: 'linebreak',
      },
      columnStyles: {
        0: { cellWidth: availableWidth / 6 },
        1: { cellWidth: availableWidth / 6 },
        2: { cellWidth: availableWidth / 6 },
        3: { cellWidth: availableWidth / 6 },
        4: { cellWidth: availableWidth / 6 },
        5: { cellWidth: availableWidth / 6 },
      }
    });
    // Calculate column widths to match header table width exactly
    const mainTableAvailableWidth = availableWidth; // Use same width as header table

    // Column width multipliers (proportional)
    const widthMultipliers = {
      sno: 0.4,
      date: 0.8,
      associate: 1.4,
      purpose: 1.2,
      transfer: 1.2,
      loan: 0.8,
      refund: 0.7,
      type: 0.7,
      mode: 0.7,
      description: 1.5
    };

    // Calculate sum of multipliers
    const totalMultiplier = Object.values(widthMultipliers).reduce((sum, val) => sum + val, 0);

    // Normalize to fill exact available width
    const normalizedWidths = {};
    Object.keys(widthMultipliers).forEach((key, index) => {
      normalizedWidths[key] = (mainTableAvailableWidth * widthMultipliers[key]) / totalMultiplier;
    });

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      margin: { left: marginLeft, right: marginRight },
      tableWidth: mainTableAvailableWidth,
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
        lineColor: [0, 0, 0],
        overflow: 'linebreak'
      },
      alternateRowStyles: { fillColor: null },
      columnStyles: {
        sno: { cellWidth: normalizedWidths.sno },
        date: { cellWidth: normalizedWidths.date },
        associate: { cellWidth: normalizedWidths.associate },
        purpose: { cellWidth: normalizedWidths.purpose },
        transfer: { cellWidth: normalizedWidths.transfer },
        loan: { cellWidth: normalizedWidths.loan, halign: 'right' },
        refund: { cellWidth: normalizedWidths.refund, halign: 'right' },
        type: { cellWidth: normalizedWidths.type },
        mode: { cellWidth: normalizedWidths.mode },
        description: { cellWidth: normalizedWidths.description },
      }
    });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    doc.save(`LoanReport_${fromDate.replace(/\//g, "-")}_to_${toDate.replace(/\//g, "-")}_${timestamp}.pdf`);
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
      const modeA = normStr(a.loan_payment_mode), modeB = normStr(b.loan_payment_mode);
      if (modeA !== modeB) return modeA.localeCompare(modeB);
      return dateKey(a.date) - dateKey(b.date);
    });
    const totalLoanAmount = sortedData
      .filter(row => normStr(row.type) === "loan" || normStr(row.type) === "transfer")
      .reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
    const header = [
      "S.No",
      "Date",
      "Associate",
      "Purpose",
      "Transfer To",
      "Loan/Transfer",
      "Refund",
      "Type",
      "Mode",
      "Description",
    ];
    const summaryRow = [
      "", "", "", "",
      `Total Loan: ${totalLoanAmount.toLocaleString("en-IN")}`,
      "", "", "", "", ""
    ];
    const rows = sortedData.map((row, idx) => {
      return [
        idx + 1,
        new Date(row.date).toLocaleDateString("en-GB"),
        getAssociateName(row),
        getPurposeOrSiteName(row),
        getTransferDestination(row),
        (row.type === "Loan" || row.type === "Transfer") ? ((row.amount ?? 0).toLocaleString("en-IN")) : "-",
        row.type === "Refund" ? ((row.loan_refund_amount ?? 0).toLocaleString("en-IN")) : "-",
        row.type || "",
        row.type === "Transfer" ? "" : (finalPaymentModeOptions.find(opt => opt.value === row.loan_payment_mode)?.label || row.loan_payment_mode || ""),
        row.description || "",
      ];
    });
    const aoa = [header, summaryRow, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LoanReport");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      `LoanReport_${fromDate.replace(/\//g, "-")}_to_${toDate.replace(/\//g, "-")}_${timestamp}.xlsx`
    );
  };

  return (
    <div className='bg-[#FAF6ED]'>
      <div className="xl:flex items-start justify-between bg-white p-4 ml-4 sm:ml-6 lg:ml-10 px-5 xl:h-[128px] rounded-md shadow-sm max-w-[95vw] w-full mb-4">
        <div className="block md:flex md:flex-wrap gap-4 text-left w-full">
          <div className="xl:px-0">
            <label className="block font-semibold mb-1">Week No</label>
            <Select
              options={Array.from({ length: getCurrentWeekNumber() }, (_, i) => ({
                value: `Week ${String(i + 1).padStart(2, "0")}`,
                label: `Week ${String(i + 1).padStart(2, "0")}`
              }))}
              value={week ? { value: week, label: week } : null}
              onChange={(selected) => {
                setWeek(selected ? selected.value : '');
                setStartDate("");
                setEndDate("");
              }}
              placeholder="Select"
              isSearchable
              isClearable
              menuPortalTarget={document.body}
              styles={customStyles}
              className=' w-fullrounded-lg focus:outline-none'
            />
          </div>
          <div className="">
            <label className="block font-semibold mb-1">Year</label>
            <Select
              options={years.map((y) => ({
                value: y.toString(),
                label: y.toString()
              }))}
              value={year ? { value: year, label: year } : null}
              onChange={(selected) => setYear(selected ? selected.value : '')}
              placeholder="Select Year"
              isSearchable
              isClearable
              menuPortalTarget={document.body}
              styles={customStyles}
              className=' w-full rounded-lg focus:outline-none'
            />
          </div>
          <div className="">
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
          <div className="">
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
          <div className="">
            <label className="block font-semibold mb-1">Payment Mode</label>
            <Select
              options={[
                ...finalPaymentModeOptions.map((opt) => ({
                  value: opt.value,
                  label: opt.label
                }))
              ]}
              value={paymentModeFilter ? { value: paymentModeFilter, label: finalPaymentModeOptions.find(opt => opt.value === paymentModeFilter)?.label || paymentModeFilter } : null}
              onChange={(selected) => setPaymentModeFilter(selected ? selected.value : '')}
              placeholder="Select Modes"
              isSearchable
              isClearable
              menuPortalTarget={document.body}
              styles={customStyles}
              className=' w-full rounded-lg focus:outline-none'
            />
          </div>
          <div className="">
            <label className="block font-semibold mb-1">Type</label>
            <Select
              options={[
                { value: 'Loan', label: 'Loan' },
                { value: 'Refund', label: 'Refund' },
                { value: 'Transfer', label: 'Transfer' }
              ]}
              value={typeFilter ? { value: typeFilter, label: typeFilter } : null}
              onChange={(selected) => setTypeFilter(selected ? selected.value : '')}
              placeholder="Select Types"
              isSearchable
              isClearable
              menuPortalTarget={document.body}
              styles={customStyles}
              className=' w-full rounded-lg focus:outline-none'
            />
          </div>
        </div>
        <div className="xl:ml-0 max-w-[200px] w-full">
          <div className="text-sm text-right space-y-1 border-2 border-[#E4572E] border-opacity-15 p-1 xl:mt-0 mt-2">
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
              <span className="font-semibold">Total Loan</span> : <span className="text-red-500 font-semibold">{totalLoan}</span>
            </div>
          </div>
        </div>
      </div>
      <div className='max-w-[95vw] w-full rounded-md ml-4 xl:h-[630px] h-auto sm:ml-6 lg:ml-10 px-5 bg-white p-4'>
        <div className='space-x-6 flex justify-end'>
          <button onClick={handleExportPDF} className='text-sm text-[#E4572E] hover:underline font-bold'>Export PDF</button>
          <button onClick={handleExportExcel} className='text-sm text-[#007233] hover:underline font-bold'>Export XL</button>
          <button className='text-sm text-[#BF9853] hover:underline font-bold'>Print</button>
        </div>
        <div
          ref={scrollRef}
          className=" rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] max-h-[500px] overflow-auto select-none "
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <table ref={tableRef} className="table-fixed min-w-[1400px] w-full border-collapse">
            <thead className='bg-[#FAF6ED]'>
              <tr>
                <th
                  className="pt-2 pl-3 w-20 font-bold text-left cursor-pointer hover:bg-gray-200 select-none"
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
                  onClick={() => requestSort("associate")}
                >
                  Associate <SortIcon columnKey="associate" />
                </th>
                <th
                  className="px-2 w-[200px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none"
                  onClick={() => requestSort("purpose")}
                >
                  Purpose <SortIcon columnKey="purpose" />
                </th>
                <th
                  className="px-2 w-[200px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none"
                  onClick={() => requestSort("transfer")}
                >
                  Transfer To <SortIcon columnKey="transfer" />
                </th>
                <th className="px-2 w-[100px] font-bold text-right">Loan/Transfer</th>
                <th className="px-2 w-[100px] font-bold text-right">Refund</th>
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
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-4 text-gray-500 font-semibold">No Entry is available</td>
                </tr>
              ) : (
                currentData.map((row, index) => (
                  <tr key={row.id || index} className="odd:bg-white even:bg-[#FAF6ED]">
                    <td className="text-sm text-left p-3 w-32 font-semibold">{startIndex + index + 1}</td>
                    <td className="text-sm text-left p-3 w-32 font-semibold">{new Date(row.date).toLocaleDateString("en-GB")}</td>
                    <td className="text-sm text-left p-3 w-32 font-semibold">{getAssociateName(row)}</td>
                    <td className="text-sm text-left p-3 w-32 font-semibold">{getPurposeOrSiteName(row)}</td>
                    <td className="text-sm text-left p-3 w-32 font-semibold">{getTransferDestination(row)}</td>
                    <td
                      className={`text-sm text-right p-3 w-32 font-semibold ${(row.type === "Loan" || row.type === "Transfer") ? "cursor-pointer hover:bg-gray-200" : ""}`}
                      onClick={() => {
                        if (row.type === "Loan" || row.type === "Transfer") {
                          handleLoanClick(row);
                        }
                      }}
                    >
                      {(row.type === "Loan" || row.type === "Transfer") ? (row.amount?.toLocaleString("en-IN") || "0") : "-"}
                    </td>
                    <td
                      className={`text-sm text-right p-3 w-32 font-semibold ${row.type === "Refund" ? "cursor-pointer hover:bg-gray-200" : ""}`}
                      onClick={() => {
                        if (row.type === "Refund") {
                          handleRefundClick(row);
                        }
                      }}
                    >
                      {row.type === "Refund" ? (row.loan_refund_amount?.toLocaleString("en-IN") || "0") : "-"}
                    </td>
                    <td className="text-sm text-left p-3 w-32 font-semibold">{row.type || "-"}</td>
                    <td className="text-sm text-left p-3 w-32 font-semibold">{row.type === 'Transfer' ? '' : (finalPaymentModeOptions.find(opt => opt.value === row.loan_payment_mode)?.label || row.loan_payment_mode || "-")}</td>
                    <td className="text-sm text-left p-3 w-32 font-semibold">{row.description || "-"}</td>
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
                options={[
                  { value: 50, label: '50' },
                  { value: 100, label: '100' },
                  { value: 200, label: '200' },
                  { value: 300, label: '300' },
                  { value: 400, label: '400' },
                  { value: 500, label: '500' },
                  { value: 600, label: '600' },
                  { value: 700, label: '700' },
                  { value: 800, label: '800' },
                  { value: 900, label: '900' },
                  { value: 1000, label: '1000' }
                ]}
                value={{ value: itemsPerPage, label: itemsPerPage.toString() }}
                onChange={(selected) => {
                  const newItemsPerPage = selected ? selected.value : 50;
                  setItemsPerPage(newItemsPerPage);
                  setCurrentPage(1);
                }}
                isSearchable
                styles={{
                  ...customStyles,
                  control: (provided) => ({
                    ...provided,
                    minWidth: '100px',
                    height: '38px',
                    borderWidth: '1px',
                    borderColor: '#d1d5db',
                    borderRadius: '6px',
                  }),
                }}
                className="text-sm"
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
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowPopup(false)}
        >
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-xl font-bold text-[#BF9853]">{popupContext}</h3>
                <p className="text-sm text-gray-600 mt-1">{popupTitle}</p>
              </div>
              <button onClick={() => setShowPopup(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex gap-3 text-sm justify-end mb-3">
              <button
                onClick={() => exportPopupPDF(sortPopupData(popupData, popupSortConfig), popupTitle, popupContext)}
                className="flex items-center font-bold hover:underline gap-1 text-[#E4572E]"
              >
                Export PDF
              </button>
              <button
                onClick={() => exportPopupCSV(sortPopupData(popupData, popupSortConfig), popupTitle, popupContext)}
                className="flex items-center font-bold hover:underline gap-1 text-[#007233]"
              >
                Export XL
              </button>
            </div>
            <div className="mt-4 border-l-8 border-l-[#BF9853] rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#f8f1e5]">
                    <th className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handlePopupSort('date')}>
                      Date
                      {popupSortConfig.key === 'date' && (
                        <span className="ml-1">{popupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handlePopupSort('amount')}>
                      Amount
                      {popupSortConfig.key === 'amount' && (
                        <span className="ml-1">{popupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handlePopupSort('type')}>
                      Type
                      {popupSortConfig.key === 'type' && (
                        <span className="ml-1">{popupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handlePopupSort('mode')}>
                      Mode
                      {popupSortConfig.key === 'mode' && (
                        <span className="ml-1">{popupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handlePopupSort('description')}>
                      Description
                      {popupSortConfig.key === 'description' && (
                        <span className="ml-1">{popupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {popupData &&
                    sortPopupData(popupData, popupSortConfig)
                      .map((entry, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-[#FAF6ED]"}>
                          <td className="p-3 text-left">{entry.date}</td>
                          <td className="p-3 text-right font-semibold">₹{entry.amount.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-left">{entry.type}</td>
                          <td className="p-3 text-left">{entry.mode || "-"}</td>
                          <td className="p-3 text-left">{entry.description || "-"}</td>
                        </tr>
                      ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#BF9853] text-white font-bold">
                    <td className="p-3 text-left">Total</td>
                    <td className="p-3 text-right">
                      ₹{popupData &&
                        popupData
                          .reduce((sum, item) => sum + item.amount, 0)
                          .toLocaleString('en-IN')}
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default LoanReport;
