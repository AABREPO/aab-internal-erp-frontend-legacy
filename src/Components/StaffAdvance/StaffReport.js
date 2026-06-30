import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Select from 'react-select';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Filter from '../Images/TableFilter.svg';
import Search from '../Images/Searchnew.svg';
import Reload from '../Images/Clear.svg';
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
  EDBC_TABLE_EDGE_TABLE_CLASS,
} from '../ExpensesEntry/databaseExpensesSharedColumns';

Date.prototype.getWeekNumber = function () {
  const firstDay = new Date(this.getFullYear(), 0, 1);
  const pastDaysOfYear = (this - firstDay) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
};

const StaffReport = ({ username, userRoles = [], paymentModeOptions = [] }) => {
  const BLANK_VALUE = 'BLANK';
  const BLANK_LABEL = '(Blank)';
  const blankOption = { value: BLANK_VALUE, label: BLANK_LABEL };

  const [week, setWeek] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [siteOptions, setSiteOptions] = useState([]);
  const [purposeOptions, setPurposeOptions] = useState([]);
  const [advanceData, setAdvanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentModeFilter, setPaymentModeFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [overallSearch, setOverallSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectReportDate, setSelectReportDate] = useState("");
  const [selectReportEmployeeName, setSelectReportEmployeeName] = useState("");
  const [selectReportPurpose, setSelectReportPurpose] = useState("");
  const [selectReportTransfer, setSelectReportTransfer] = useState("");
  const [selectReportType, setSelectReportType] = useState("");
  const [selectReportMode, setSelectReportMode] = useState("");
  const [selectReportDescription, setSelectReportDescription] = useState("");
  const [selectReportAmount, setSelectReportAmount] = useState("");
  const [selectReportRefundAmount, setSelectReportRefundAmount] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50); // Pagination for better performance
  const [employees, setEmployees] = useState([]);
  const [laboursList, setLaboursList] = useState([]);
  const [staffAdvanceCombinedOptions, setStaffAdvanceCombinedOptions] = useState([]);
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

  // Generate years dynamically
  const currentYear = new Date().getFullYear();
  const startYear = 2000; // Change if needed
  const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);

  // Fetch Employee Names (for Contractor/Vendor column)
  useEffect(() => {
    const fetchEmployeeNames = async () => {
      try {
        const res = await fetch('https://backendaab.in/aabuildersDash/api/employee_details/getAll', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Failed to fetch employees');
        const data = await res.json();
        setEmployees(
          data.map((item) => ({ value: item.employee_name, label: item.employee_name, id: item.id, type: "Employee" }))
        );
      } catch (error) {
        console.error(error);
      }
    };
    fetchEmployeeNames();
  }, []);

  useEffect(() => {
    fetchLaboursList();
  }, []);
  const fetchLaboursList = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/labours-details/getAll');
      if (response.ok) {
        const data = await response.json();
        const formattedData = data.map(item => ({
          value: item.labour_name,
          label: item.labour_name,
          id: item.id,
          type: "Labour",
          salary: item.labour_salary,
          extra: item.extra_amount
        }));
        setLaboursList(formattedData);
      } else {
        console.log('Error fetching Labour names.');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error fetching Labour names.');
    }
  };

  useEffect(() => { setStaffAdvanceCombinedOptions([...employees, ...laboursList]); }, [employees, laboursList]);

  // Fetch Purpose Names (for Project Name column)
  useEffect(() => {
    const fetchPurposeNames = async () => {
      try {
        const res = await fetch('https://backendaab.in/aabuildersDash/api/purposes/getAll', {
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Failed to fetch purposes');
        const data = await res.json();
        setPurposeOptions(
          data.map((item) => ({ value: item.purpose, label: item.purpose, id: item.id }))
        );
      } catch (error) {
        console.error(error);
      }
    };
    fetchPurposeNames();
  }, []);

  // Fetch Staff Advance Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://backendaab.in/aabuildersDash/api/staff-advance/all");
        const data = await res.json();
        setAdvanceData(data);
      } catch (err) {
        console.error("Error fetching staff advance data", err);
      }
    };
    fetchData();
  }, []);

  // Helper — ISO-ish week number (keeps original behavior)
  const getWeekNumberFromDate = (date) => {
    const d = new Date(date);
    const oneJan = new Date(d.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((d - oneJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
  };

  const getCurrentWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + start.getDay() + 1) / 7);
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
        return d.getFullYear() === parseInt(year, 10) && getWeekNumberFromDate(item.date) === selectedWeekNum;
      });
    } else {
      // If neither date-range nor week selected, default to empty
      filtered = [];
    }

    // Apply Payment Mode filter
    if (paymentModeFilter) {
      filtered = filtered.filter((item) => item.staff_payment_mode === paymentModeFilter);
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
    if (selectReportEmployeeName) {
      filtered = filtered.filter((item) => {
        const name = employees.find((e) => e.id === item.employee_id)?.label
          || laboursList.find((l) => l.id === item.labour_id)?.label
          || "";
        if (selectReportEmployeeName === BLANK_VALUE) {
          return !name || !String(name).trim();
        }
        return name.toLowerCase() === selectReportEmployeeName.toLowerCase();
      });
    }
    if (selectReportPurpose) {
      filtered = filtered.filter((item) => {
        const purposeName = purposeOptions.find((s) => String(s.id) === String(item.from_purpose_id))?.label || "";
        if (selectReportPurpose === BLANK_VALUE) {
          return !purposeName || !String(purposeName).trim();
        }
        return purposeName.toLowerCase() === selectReportPurpose.toLowerCase();
      });
    }
    if (selectReportTransfer) {
      filtered = filtered.filter((item) => {
        const transferName = purposeOptions.find((s) => String(s.id) === String(item.to_purpose_id))?.label
          || siteOptions.find((s) => s.id === item.to_purpose_id)?.label
          || "";
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
          return !item.staff_payment_mode || !String(item.staff_payment_mode).trim();
        }
        return (item.staff_payment_mode || "").toString().toLowerCase() === selectReportMode.toLowerCase();
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
    if (selectReportRefundAmount.trim()) {
      filtered = filtered.filter((item) => matchesEdbcAmountFilter(item.staff_refund_amount, selectReportRefundAmount));
    }

    if (overallSearch.trim()) {
      const q = overallSearch.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const searchable = [
          new Date(item.date).toLocaleDateString("en-GB"),
          employees.find((e) => e.id === item.employee_id)?.label,
          laboursList.find((l) => l.id === item.labour_id)?.label,
          purposeOptions.find((s) => String(s.id) === String(item.from_purpose_id))?.label,
          item.amount,
          item.staff_refund_amount,
          purposeOptions.find((s) => String(s.id) === String(item.to_purpose_id))?.label,
          siteOptions.find((s) => s.id === item.to_purpose_id)?.label,
          item.type,
          item.staff_payment_mode,
          item.description,
        ]
          .map((v) => String(v ?? "").toLowerCase())
          .join(" ");
        return searchable.includes(q);
      });
    }

    setFilteredData(filtered);
  }, [advanceData, startDate, endDate, week, year, paymentModeFilter, typeFilter, selectReportDate, selectReportEmployeeName, selectReportPurpose, selectReportTransfer, selectReportType, selectReportMode, selectReportDescription, selectReportAmount, selectReportRefundAmount, overallSearch, employees, laboursList, purposeOptions, siteOptions]);

  // fromDate/toDate/totalAdvance computations
  const fromDate = filteredData.length
    ? new Date(Math.min(...filteredData.map((r) => new Date(r.date)))).toLocaleDateString("en-GB")
    : "-";
  const toDate = filteredData.length
    ? new Date(Math.max(...filteredData.map((r) => new Date(r.date)))).toLocaleDateString("en-GB")
    : "-";
  const totalAdvance = filteredData
    .filter((r) => r.type === "Advance")
    .reduce((sum, r) => {
      const amount = r.amount || 0;
      return sum + amount;
    }, 0)
    .toLocaleString("en-IN");

  const getReportEmployeeName = (item) =>
    employees.find((e) => e.id === item.employee_id)?.label
    || laboursList.find((l) => l.id === item.labour_id)?.label
    || "";
  const getReportPurposeName = (item) =>
    purposeOptions.find((s) => String(s.id) === String(item.from_purpose_id))?.label || "";
  const getReportTransferName = (item) =>
    purposeOptions.find((s) => String(s.id) === String(item.to_purpose_id))?.label
    || siteOptions.find((s) => s.id === item.to_purpose_id)?.label
    || "";

  const formatReportAmount = (value) => {
    if (value == null || value === "" || value === "-") return "";
    const num = Number(value);
    return Number.isFinite(num) ? `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "";
  };

  const reportFilterOptions = useMemo(() => {
    const getEmployeeName = (item) =>
      employees.find((e) => e.id === item.employee_id)?.label
      || laboursList.find((l) => l.id === item.labour_id)?.label
      || "";
    const getPurposeName = (id) =>
      purposeOptions.find((s) => String(s.id) === String(id))?.label || "";
    const getTransferName = (id) =>
      purposeOptions.find((s) => String(s.id) === String(id))?.label
      || siteOptions.find((s) => s.id === id)?.label
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
        const d = new Date(item.date);
        return d.getFullYear() === parseInt(year, 10) && getWeekNumberFromDate(item.date) === selectedWeekNum;
      });
    } else {
      tableData = [];
    }
    if (paymentModeFilter) {
      tableData = tableData.filter((item) => item.staff_payment_mode === paymentModeFilter);
    }
    if (typeFilter) {
      tableData = tableData.filter((item) =>
        (item.type || "").toString().toLowerCase() === typeFilter.toLowerCase()
      );
    }

    const uniqueEmployees = new Set();
    const uniquePurposes = new Set();
    const uniqueTransfers = new Set();
    const uniqueTypes = new Set();
    const uniqueModes = new Set();
    let hasBlankEmployee = false;
    let hasBlankPurpose = false;
    let hasBlankTransfer = false;
    let hasBlankType = false;
    let hasBlankMode = false;

    tableData.forEach((entry) => {
      const empName = getEmployeeName(entry);
      if (empName) uniqueEmployees.add(empName);
      else hasBlankEmployee = true;

      if (entry.from_purpose_id) {
        const purposeName = getPurposeName(entry.from_purpose_id);
        if (purposeName) uniquePurposes.add(purposeName);
      } else {
        hasBlankPurpose = true;
      }

      if (entry.to_purpose_id) {
        const transferName = getTransferName(entry.to_purpose_id);
        if (transferName) uniqueTransfers.add(transferName);
      } else {
        hasBlankTransfer = true;
      }

      if (entry.type) uniqueTypes.add(entry.type);
      else hasBlankType = true;

      if (entry.staff_payment_mode) uniqueModes.add(entry.staff_payment_mode);
      else hasBlankMode = true;
    });

    const employeeOptions = Array.from(uniqueEmployees)
      .map((name) => ({ value: name, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label));
    if (hasBlankEmployee) employeeOptions.unshift(blankOption);

    const purposeFilterOptions = Array.from(uniquePurposes)
      .map((name) => ({ value: name, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label));
    if (hasBlankPurpose) purposeFilterOptions.unshift(blankOption);

    const transferOptions = Array.from(uniqueTransfers)
      .map((name) => ({ value: name, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label));
    if (hasBlankTransfer) transferOptions.unshift({ value: BLANK_VALUE, label: 'Blank' });

    const typeOptions = (hasBlankType ? [BLANK_VALUE] : []).concat(Array.from(uniqueTypes).sort());
    const modeOptions = (hasBlankMode ? [BLANK_VALUE] : []).concat(Array.from(uniqueModes).sort());

    return {
      employeeOptions,
      purposeOptions: purposeFilterOptions,
      transferOptions,
      typeOptions,
      modeOptions,
    };
  }, [advanceData, startDate, endDate, week, year, paymentModeFilter, typeFilter, employees, laboursList, purposeOptions, siteOptions]);

  const reportTotals = useMemo(() => ({
    amount: filteredData.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0),
    refund_amount: filteredData.reduce((sum, row) => sum + (parseFloat(row.staff_refund_amount) || 0), 0),
  }), [filteredData]);

  const clearFilters = useCallback(() => {
    const currentWeek = getCurrentWeekNumber();
    setWeek(`Week ${String(currentWeek).padStart(2, "0")}`);
    setYear(new Date().getFullYear().toString());
    setStartDate("");
    setEndDate("");
    setPaymentModeFilter("");
    setTypeFilter("");
    setOverallSearch("");
    setSelectReportDate("");
    setSelectReportEmployeeName("");
    setSelectReportPurpose("");
    setSelectReportTransfer("");
    setSelectReportType("");
    setSelectReportMode("");
    setSelectReportDescription("");
    setSelectReportAmount("");
    setSelectReportRefundAmount("");
  }, []);

  // Sorting helpers and memoized sorted rows for rendering
  const normStr = (v) => (v ?? "").toString().trim().toLowerCase();

  const dateKey = (val) => {
    if (!val) return -Infinity;
    const s = String(val).trim();

    // Handle DD/MM/YYYY format
    const m1 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m1) {
      return new Date(+m1[3], +m1[2] - 1, +m1[1]).getTime();
    }

    // Handle ISO date format (YYYY-MM-DD)
    const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      return new Date(+isoMatch[1], +isoMatch[2] - 1, +isoMatch[3]).getTime();
    }

    // Try direct Date parsing for other formats
    const parsedDate = new Date(s);
    if (!isNaN(parsedDate.getTime())) {
      // Normalize to start of day to avoid time component issues
      return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()).getTime();
    }

    return -Infinity;
  };

  const getLabelById = (options, id) => options.find((o) => String(o.id) === String(id))?.label || "";

  const requestSort = useCallback((key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
    setCurrentPage(1); // Reset to first page when sorting
  }, []);

  const sortedData = useMemo(() => {
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
          // Use timestamp for proper chronological sorting
          const timestampA = dateKey(a.date);
          const timestampB = dateKey(b.date);
          return timestampA - timestampB;
        case "cv": {
          va = getLabelById(employees, a.employee_id);
          vb = getLabelById(employees, b.employee_id);
          break;
        }
        case "project": {
          va = getLabelById(purposeOptions, a.from_purpose_id);
          vb = getLabelById(purposeOptions, b.from_purpose_id);
          break;
        }
        case "transfer": {
          va = getLabelById(purposeOptions, a.to_purpose_id);
          vb = getLabelById(purposeOptions, b.to_purpose_id);
          break;
        }
        case "type":
          va = normStr(a.type);
          vb = normStr(b.type);
          break;
        case "payment_mode":
          va = normStr(a.staff_payment_mode);
          vb = normStr(b.staff_payment_mode);
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
  }, [filteredData, sortConfig, employees, purposeOptions]);

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = useMemo(() => {
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, startIndex, endIndex]);

  const currentData = paginatedData;
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

  const hasActiveColumnFilters = selectReportDate || selectReportEmployeeName || selectReportPurpose || selectReportTransfer || selectReportAmount.trim() || selectReportRefundAmount.trim() || selectReportType || selectReportMode || selectReportDescription.trim();

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, week, year, paymentModeFilter, typeFilter, selectReportDate, selectReportEmployeeName, selectReportPurpose, selectReportTransfer, selectReportType, selectReportMode, selectReportDescription, selectReportAmount, selectReportRefundAmount, overallSearch]);

  // Pagination handlers (moved after totalPages calculation)
  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const handleItemsPerPageChange = useCallback((e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);


  // Export PDF (landscape) of tableRef
  const handleExportPDF = () => {
    if (!filteredData.length) {
      alert("No data to export");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

    const columns = [
      { header: "S.No", dataKey: "sno" },
      { header: "Date", dataKey: "date" },
      { header: "Employee Name", dataKey: "cv" },
      { header: "Purpose", dataKey: "project" },
      { header: "Advance", dataKey: "advance" },
      { header: "Refund Amount", dataKey: "refund" },
      { header: "Transfer", dataKey: "transfer" },
      { header: "Type", dataKey: "type" },
      { header: "Mode", dataKey: "mode" },
      { header: "Description", dataKey: "description" },
    ];

    const normStr = v => (v ?? "").toString().trim().toLowerCase();

    function dateKey(val) {
      if (!val) return -Infinity;
      const s = String(val).trim();

      // Handle DD/MM/YYYY format
      const m1 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (m1) {
        return new Date(+m1[3], +m1[2] - 1, +m1[1]).getTime();
      }

      // Handle ISO date format (YYYY-MM-DD)
      const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (isoMatch) {
        return new Date(+isoMatch[1], +isoMatch[2] - 1, +isoMatch[3]).getTime();
      }

      // Try direct Date parsing for other formats
      const parsedDate = new Date(s);
      if (!isNaN(parsedDate.getTime())) {
        // Normalize to start of day to avoid time component issues
        return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()).getTime();
      }

      return -Infinity;
    }

    const sortedData = [...filteredData].sort((a, b) => {
      const typeA = normStr(a.type), typeB = normStr(b.type);
      if (typeA !== typeB) return typeA.localeCompare(typeB);

      const modeA = normStr(a.payment_mode), modeB = normStr(b.payment_mode);
      if (modeA !== modeB) return modeA.localeCompare(modeB);

      return dateKey(a.date) - dateKey(b.date);
    });

    const totalAdvanceCash = sortedData
      .filter(row => normStr(row.type) === "advance" && normStr(row.staff_payment_mode) === "cash")
      .reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);

    const rows = sortedData.map((row, index) => {
      const d = new Date(dateKey(row.date));
      return {
        sno: index + 1,
        date: isNaN(d) ? "" : d.toLocaleDateString("en-GB"),
        cv: employees.find(v => v.id === row.employee_id)?.label || "",
        project: purposeOptions.find(s => s.id === row.from_purpose_id)?.label || "",
        advance: row.amount?.toLocaleString("en-IN") || "0",
        refund: row.staff_refund_amount?.toLocaleString("en-IN") || "0",
        transfer: siteOptions.find(s => s.id === row.to_purpose_id)?.label || "",
        type: row.type || "",
        mode: row.staff_payment_mode || "",
        description: row.description || "",
      };
    });

    // Draw merged header as part of the table
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
        5: { cellWidth: 124 },
      }
    });

    // Main data table starts after header
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
        cv: { cellWidth: 102 },
        project: { cellWidth: 130 },
        advance: { cellWidth: 45 },
        refund: { cellWidth: 40 },
        transfer: { cellWidth: 130 },
        type: { cellWidth: 65 },
        mode: { cellWidth: 54 },
        description: { cellWidth: 120 },
      }
    });

    doc.save(`StaffReport_${fromDate.replace(/\//g, "-")}_to_${toDate.replace(/\//g, "-")}.pdf`);
  };

  // Export Excel using xlsx
  const handleExportExcel = () => {
    if (!filteredData.length) {
      alert("No data to export");
      return;
    }

    const normStr = v => (v ?? "").toString().trim().toLowerCase();

    const dateKey = (val) => {
      if (!val) return -Infinity;
      const s = String(val).trim();

      // Handle DD/MM/YYYY format
      const m1 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (m1) {
        return new Date(+m1[3], +m1[2] - 1, +m1[1]).getTime();
      }

      // Handle ISO date format (YYYY-MM-DD)
      const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (isoMatch) {
        return new Date(+isoMatch[1], +isoMatch[2] - 1, +isoMatch[3]).getTime();
      }

      // Try direct Date parsing for other formats
      const parsedDate = new Date(s);
      if (!isNaN(parsedDate.getTime())) {
        // Normalize to start of day to avoid time component issues
        return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()).getTime();
      }

      return -Infinity;
    };

    const sortedData = [...filteredData].sort((a, b) => {
      const typeA = normStr(a.type), typeB = normStr(b.type);
      if (typeA !== typeB) return typeA.localeCompare(typeB);

      const modeA = normStr(a.payment_mode), modeB = normStr(b.payment_mode);
      if (modeA !== modeB) return modeA.localeCompare(modeB);

      return dateKey(a.date) - dateKey(b.date);
    });

    const totalAdvanceCash = sortedData
      .filter(row => normStr(row.type) === "advance" && normStr(row.staff_payment_mode) === "cash")
      .reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);

    const header = [
      "S.No",
      "Date",
      "Employee Name",
      "Purpose",
      "Advance",
      "Bill Amount",
      "Refund Amount",
      "Transfer",
      "Type",
      "Mode",
      "Description",
    ];

    const summaryRow = [
      "", "", "", "",
      `Total Cash Advance: ${totalAdvanceCash.toLocaleString("en-IN")}`,
      "", "", "", "", "", ""
    ];

    const rows = sortedData.map((row, idx) => {
      const employee = employees.find((v) => v.id === row.employee_id)?.label;
      const purpose = purposeOptions.find((s) => s.id === row.from_purpose_id)?.label;
      const transferPurpose = purposeOptions.find((s) => s.id === row.to_purpose_id)?.label;

      return [
        idx + 1,
        new Date(row.date).toLocaleDateString("en-GB"),
        employee || "",
        purpose || "",
        (row.amount ?? 0).toLocaleString("en-IN"),
        (row.staff_bill_amount ?? 0).toLocaleString("en-IN"),
        (row.staff_refund_amount ?? 0).toLocaleString("en-IN"),
        transferPurpose || "",
        row.type || "",
        row.staff_payment_mode || "",
        row.description || "",
      ];
    });

    const aoa = [header, summaryRow, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "StaffReport");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      `StaffReport_${fromDate.replace(/\//g, "-")}_to_${toDate.replace(/\//g, "-")}.xlsx`
    );
  };

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
                  options={Array.from({ length: getCurrentWeekNumber() }, (_, i) => ({
                    label: `Week ${String(i + 1).padStart(2, "0")}`,
                    value: `Week ${String(i + 1).padStart(2, "0")}`,
                  }))}
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
                  options={years.map((y) => ({
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
              <div>
                <label className="block font-semibold mb-[8px]">Payment Mode</label>
                <Select
                  value={paymentModeFilter ? { value: paymentModeFilter, label: paymentModeFilter } : null}
                  onChange={(selectedOption) => setPaymentModeFilter(selectedOption ? selectedOption.value : "")}
                  options={paymentModeOptions}
                  placeholder="Payment Mode"
                  isSearchable
                  isClearable
                  styles={{
                    ...customStyles,
                    placeholder: (provided) => ({
                      ...customStyles.placeholder(provided),
                      color: '#A6A5A6',
                    }),
                    dropdownIndicator: (provided, state) => ({
                      ...customStyles.dropdownIndicator(provided, state),
                      paddingLeft: 0,
                      paddingRight: 4,
                    }),
                  }}
                  className="w-[150px] h-[40px]"
                  classNamePrefix="select"
                />
              </div>
              <div>
                <label className="block font-semibold mb-[8px]">Type</label>
                <Select
                  value={typeFilter ? { value: typeFilter, label: typeFilter } : null}
                  onChange={(selectedOption) => setTypeFilter(selectedOption ? selectedOption.value : "")}
                  options={[
                    { value: "Advance", label: "Advance" },
                    { value: "Refund", label: "Refund" },
                    { value: "Transfer", label: "Transfer" },
                  ]}
                  placeholder="Type"
                  isSearchable
                  isClearable
                  styles={{
                    ...customStyles,
                    placeholder: (provided) => ({
                      ...customStyles.placeholder(provided),
                      color: '#A6A5A6',
                    }),
                    dropdownIndicator: (provided, state) => ({
                      ...customStyles.dropdownIndicator(provided, state),
                      paddingLeft: 0,
                      paddingRight: 4,
                    }),
                  }}
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

        <div className="w-full max-w-[1850px] mx-auto pt-[18px] px-[18px] pb-[18px] bg-white rounded-[6px] flex flex-col flex-1 min-h-0 overflow-hidden">
          <div
            className={`text-left flex ${hasActiveColumnFilters
              ? 'flex-col sm:flex-row sm:justify-between'
              : 'flex-row justify-between items-center'
              } mb-[12px] gap-[6px] shrink-0`}
          >
            <div className="flex flex-row items-center sm:space-x-3 min-w-0 flex-1 overflow-hidden">
              <button className="" type="button" onClick={() => setShowFilters((prev) => !prev)}>
                <img
                  src={Filter}
                  alt="Toggle Filter"
                  className="border rounded-md h-[34px]"
                />
              </button>
              {hasActiveColumnFilters && (
                <div className="flex flex-row flex-wrap items-center gap-2 min-w-0">
                  {selectReportDate && (
                    <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                      <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Date: </span>
                      <span className="font-semibold text-[14px] truncate min-w-0">{selectReportDate}</span>
                      <button type="button" onClick={() => setSelectReportDate('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                    </span>
                  )}
                  {selectReportEmployeeName && (
                    <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                      <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Employee Name: </span>
                      <span className="font-semibold text-[14px] truncate min-w-0">{selectReportEmployeeName === BLANK_VALUE ? BLANK_LABEL : selectReportEmployeeName}</span>
                      <button type="button" onClick={() => setSelectReportEmployeeName('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                    </span>
                  )}
                  {selectReportPurpose && (
                    <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                      <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Purpose: </span>
                      <span className="font-semibold text-[14px] truncate min-w-0">{selectReportPurpose === BLANK_VALUE ? BLANK_LABEL : selectReportPurpose}</span>
                      <button type="button" onClick={() => setSelectReportPurpose('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                    </span>
                  )}
                  {selectReportTransfer && (
                    <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                      <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Transfer: </span>
                      <span className="font-semibold text-[14px] truncate min-w-0">{selectReportTransfer === BLANK_VALUE ? 'Blank' : selectReportTransfer}</span>
                      <button type="button" onClick={() => setSelectReportTransfer('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                    </span>
                  )}
                  {selectReportAmount.trim() && (
                    <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                      <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Advance: </span>
                      <span className="font-semibold text-[14px] truncate min-w-0">{selectReportAmount}</span>
                      <button type="button" onClick={() => setSelectReportAmount('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                    </span>
                  )}
                  {selectReportRefundAmount.trim() && (
                    <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                      <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Refund Amount: </span>
                      <span className="font-semibold text-[14px] truncate min-w-0">{selectReportRefundAmount}</span>
                      <button type="button" onClick={() => setSelectReportRefundAmount('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                    </span>
                  )}
                  {selectReportType && (
                    <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                      <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Type: </span>
                      <span className="font-semibold text-[14px] truncate min-w-0">{selectReportType === BLANK_VALUE ? BLANK_LABEL : selectReportType}</span>
                      <button type="button" onClick={() => setSelectReportType('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                    </span>
                  )}
                  {selectReportMode && (
                    <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                      <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Mode: </span>
                      <span className="font-semibold text-[14px] truncate min-w-0">{selectReportMode === BLANK_VALUE ? BLANK_LABEL : selectReportMode}</span>
                      <button type="button" onClick={() => setSelectReportMode('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                    </span>
                  )}
                  {selectReportDescription.trim() && (
                    <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                      <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Description: </span>
                      <span className="font-semibold text-[14px] truncate min-w-0">{selectReportDescription}</span>
                      <button type="button" onClick={() => setSelectReportDescription('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-end gap-[6px]">
              <button type="button" onClick={clearFilters} className="flex h-[34px] w-[32px] shrink-0 items-center justify-center">
                <img className="w-full h-full" src={Reload} alt="Reload" />
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
              <div className="text-left md:text-right md:items-end items-end cursor-default flex justify-end">
                <div className="flex items-end text-center">
                  <span className="text-[#E4572E] mr-2 flex items-center gap-1 font-semibold hover:underline cursor-pointer" onClick={handleExportPDF}>PDF<img src={Pdf} alt="Pdf" className="w-4 h-4" /></span>
                  <span className="text-[#007233] flex items-center gap-1 font-semibold hover:underline cursor-pointer" onClick={handleExportExcel}>XL<img src={XL} alt="XL" className="w-4 h-4" /></span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div
              ref={scrollRef}
              className="w-full rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] flex-1 min-h-0 overflow-auto select-none scrollbar-none no-scrollbar"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <table ref={tableRef} className={`table-fixed min-w-[1400px] w-full border-collapse ${EDBC_TABLE_EDGE_TABLE_CLASS} [&_thead_th]:!p-0 [&_thead_th]:align-middle [&_thead_th#EDBC-8]:!pr-[9px] ${showFilters ? '[&_thead_tr:first-child_th]:!border-b-0' : ''}`}>
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
                      columnId={EDBC_IDS.EDBC4}
                      label="Employee Name"
                      sortField={resolveEdbcSortField("cv")}
                      sortDirection={sortConfig.direction}
                      onSort={handleEdbcSort}
                    />
                    <EdbcColumnHeader
                      columnId={EDBC_IDS.EDBC3}
                      label="Purpose"
                      sortField={resolveEdbcSortField("project")}
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
                    <th className={edbc8Config?.headerClass}>
                      Refund Amount
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
                  </EdbcTableHeaderRow>
                  {showFilters && (
                    <EdbcTableFilterRow>
                      <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC21} />
                      <EdbcDateFilter
                        placeholder="Date"
                        value={selectReportDate}
                        onChange={setSelectReportDate}
                      />
                      <EdbcSelectFilter
                        columnId={EDBC_IDS.EDBC4}
                        placeholder="Employee Name"
                        options={reportFilterOptions.employeeOptions}
                        value={selectReportEmployeeName}
                        onChange={setSelectReportEmployeeName}
                        blankOption={blankOption}
                        blankValue={BLANK_VALUE}
                        selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                      />
                      <EdbcProjectNameFilter
                        placeholder="Purpose"
                        options={reportFilterOptions.purposeOptions}
                        value={selectReportPurpose}
                        onChange={setSelectReportPurpose}
                        blankOption={blankOption}
                        blankValue={BLANK_VALUE}
                        selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                      />
                      <EdbcTotalAmountFilter columnId={EDBC_IDS.EDBC8} totalAmount={reportTotals.amount} value={selectReportAmount} onChange={(e) => setSelectReportAmount(e.target.value)} />
                      <EdbcTotalAmountFilter columnId={EDBC_IDS.EDBC8} totalAmount={reportTotals.refund_amount} value={selectReportRefundAmount} onChange={(e) => setSelectReportRefundAmount(e.target.value)} />
                      <EdbcProjectNameFilter
                        placeholder="Transfer"
                        options={reportFilterOptions.transferOptions}
                        value={selectReportTransfer}
                        onChange={setSelectReportTransfer}
                        blankOption={blankOption}
                        blankValue={BLANK_VALUE}
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
                    </EdbcTableFilterRow>
                  )}
                </thead>
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center py-4 text-gray-500 font-semibold">No Entry is available</td>
                    </tr>
                  ) : (
                    currentData.map((row, index) => (
                      <EdbcTableBodyRow key={row.staffAdvancePortalId || index}>
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
                          columnId={EDBC_IDS.EDBC4}
                          expense={row}
                          rowIndex={index}
                          expandedCells={expandedCells}
                          onToggleExpanded={toggleExpandedCell}
                          getDisplayValue={getReportEmployeeName}
                        />
                        <EdbcExpandableBodyCell
                          columnId={EDBC_IDS.EDBC3}
                          expense={row}
                          rowIndex={index}
                          expandedCells={expandedCells}
                          onToggleExpanded={toggleExpandedCell}
                          getDisplayValue={getReportPurposeName}
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
                            onClick={() => toggleExpandedCell(`${row.staffAdvancePortalId ?? index}-refund_amount`)}
                            className={`block w-full cursor-pointer text-right ${expandedCells[`${row.staffAdvancePortalId ?? index}-refund_amount`] ? "whitespace-normal break-words" : "truncate whitespace-nowrap overflow-hidden"}`}
                            title={formatReportAmount(row.staff_refund_amount)}
                          >
                            {formatReportAmount(row.staff_refund_amount)}
                          </span>
                        </td>
                        <td className={edbc3Config?.tdClass}>
                          <span
                            onClick={() => toggleExpandedCell(`${row.staffAdvancePortalId ?? index}-transfer`)}
                            className={`block w-full cursor-pointer ${expandedCells[`${row.staffAdvancePortalId ?? index}-transfer`] ? "whitespace-normal break-words" : "truncate whitespace-nowrap overflow-hidden"}`}
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
                          getDisplayValue={(entry) => (entry.staff_payment_mode && entry.staff_payment_mode !== "-") ? entry.staff_payment_mode : ""}
                        />
                        <EdbcExpandableBodyCell
                          columnId={EDBC_IDS.EDBC9}
                          expense={row}
                          rowIndex={index}
                          expandedCells={expandedCells}
                          onToggleExpanded={toggleExpandedCell}
                          getDisplayValue={(entry) => (entry.description && entry.description !== "-") ? entry.description : ""}
                        />
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
                onChange={handleItemsPerPageChange}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
              >
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
                type="button"
                onClick={goToPreviousPage}
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
                    type="button"
                    onClick={() => goToPage(pageNum)}
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
                onClick={goToNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#BF9853] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffReport;

