import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Select from 'react-select';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

Date.prototype.getWeekNumber = function () {
  const firstDay = new Date(this.getFullYear(), 0, 1);
  const pastDaysOfYear = (this - firstDay) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
};

const StaffReport = ({ username, userRoles = [], paymentModeOptions = [] }) => {
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
    .filter((r) => r.type === "Advance")
    .reduce((sum, r) => {
      const amount = r.amount || 0;
      return sum + amount;
    }, 0)
    .toLocaleString("en-IN");

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

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, week, year, paymentModeFilter, typeFilter]);

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

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return <span className="ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>;
  };

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
    <div className="w-full max-w-full">
      {/* Filter Section */}
      <div className="bg-white p-3 sm:p-4 rounded-md shadow-sm mb-4 ml-10 mr-10">
        {/* Mobile/Tablet Layout */}
        <div className="block lg:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
            <div>
              <label className="block font-semibold mb-1 text-sm">Week No</label>
              <Select
                value={week ? { label: week, value: week } : null}
                onChange={(selected) => {
                  setWeek(selected?.value || "");
                  setStartDate("");
                  setEndDate("");
                }}
                options={Array.from({ length: getCurrentWeekNumber() }, (_, i) => ({
                  label: `Week ${String(i + 1).padStart(2, "0")}`,
                  value: `Week ${String(i + 1).padStart(2, "0")}`,
                }))}
                isSearchable
                isClearable
                placeholder="Select Week"
                className="w-full text-sm"
                styles={customStyles}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-sm">Year</label>
              <Select
                value={year ? { label: year, value: year } : null}
                onChange={(selected) => setYear(selected?.value || "")}
                options={years.map((y) => ({ label: y, value: y }))}
                isSearchable
                isClearable
                placeholder="Select Year"
                className="w-full text-sm"
                styles={customStyles}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-sm">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setWeek("");
                }}
                className="border-2 border-[#BF9853] border-opacity-25 rounded-lg px-3 py-2 w-full h-[40px] focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-sm">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setWeek("");
                }}
                className="border-2 border-[#BF9853] border-opacity-25 rounded-lg px-3 py-2 w-full h-[40px] focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-sm">Payment Mode</label>
              <Select
                value={
                  paymentModeFilter
                    ? { label: paymentModeFilter, value: paymentModeFilter }
                    : null
                }
                onChange={(selected) => setPaymentModeFilter(selected?.value || "")}
                options={paymentModeOptions}
                isSearchable
                isClearable
                placeholder="Select Modes"
                className="w-full text-sm"
                styles={customStyles}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-sm">Type</label>
              <Select
                value={
                  typeFilter ? { label: typeFilter, value: typeFilter } : null
                }
                onChange={(selected) => setTypeFilter(selected?.value || "")}
                options={[
                  { value: "", label: "All Types" },
                  { value: "Advance", label: "Advance" },
                  { value: "Refund", label: "Refund" },
                  { value: "Transfer", label: "Transfer" },
                ]}
                isSearchable
                isClearable
                placeholder="Select Types"
                className="w-full text-sm"
                styles={customStyles}
              />
            </div>
          </div>
        </div>
        {/* Desktop Layout */}
        <div className="hidden lg:flex items-start justify-between">
          <div className="flex flex-wrap gap-4 text-left">
            <div>
              <label className="block font-semibold mb-1">Week No</label>
              <Select
                value={week ? { label: week, value: week } : null}
                onChange={(selected) => {
                  setWeek(selected?.value || "");
                  setStartDate("");
                  setEndDate("");
                }}
                options={Array.from({ length: getCurrentWeekNumber() }, (_, i) => ({
                  label: `Week ${String(i + 1).padStart(2, "0")}`,
                  value: `Week ${String(i + 1).padStart(2, "0")}`,
                }))}
                isSearchable
                isClearable
                placeholder="Select Week"
                className="w-full text-sm"
                styles={customStyles}
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Year</label>
              <Select
                value={year ? { label: year, value: year } : null}
                onChange={(selected) => setYear(selected?.value || "")}
                options={years.map((y) => ({ label: y, value: y }))}
                isSearchable
                isClearable
                placeholder="Select Year"
                className="w-full text-sm"
                styles={customStyles}
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
                value={
                  paymentModeFilter
                    ? { label: paymentModeFilter, value: paymentModeFilter }
                    : null
                }
                onChange={(selected) => setPaymentModeFilter(selected?.value || "")}
                options={paymentModeOptions}
                isSearchable
                isClearable
                placeholder="Select Modes"
                className="w-full text-sm"
                styles={customStyles}
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Type</label>
              <Select
                value={
                  typeFilter ? { label: typeFilter, value: typeFilter } : null
                }
                onChange={(selected) => setTypeFilter(selected?.value || "")}
                  options={[
                  { value: "Advance", label: "Advance" },
                  { value: "Refund", label: "Refund" },
                  { value: "Transfer", label: "Transfer" },
                ]}
                isSearchable
                isClearable
                placeholder="Select Types"
                className="w-full text-sm"
                styles={customStyles}
              />
            </div>
          </div>

          {/* Summary Section */}
          <div className="flex-shrink-0">
            <div className="text-sm text-right space-y-1 border-2 border-[#E4572E] border-opacity-15 p-2 mb-2">
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
            <div className="text-sm text-right space-y-1 border-2 border-[#E4572E] border-opacity-15 p-2">
              <div>
                <span className="font-semibold">Total Advance</span> : <span className="text-red-500 font-semibold">{totalAdvance}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Summary Section */}
        <div className="block lg:hidden mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="text-sm border-2 border-[#E4572E] border-opacity-15 p-2 rounded">
              <div className="mb-1">
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
            <div className="text-sm border-2 border-[#E4572E] border-opacity-15 p-2 rounded">
              <div>
                <span className="font-semibold">Total Advance</span> : <span className="text-red-500 font-semibold">{totalAdvance}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm ml-10 mr-10">
        {/* Export Buttons */}
        <div className="flex flex-wrap justify-end gap-3 p-4 ">
          <button
            onClick={handleExportPDF}
            className="text-sm text-[#E4572E] hover:underline font-bold px-3 py-1 rounded hover:bg-red-50 transition-colors"
          >
            Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="text-sm text-[#007233] hover:underline font-bold px-3 py-1 rounded hover:bg-green-50 transition-colors"
          >
            Export XL
          </button>
          <button className="text-sm text-[#BF9853] hover:underline font-bold px-3 py-1 rounded hover:bg-yellow-50 transition-colors">
            Print
          </button>
        </div>

        {/* Table Container */}
        <div
          ref={scrollRef}
          className="rounded-lg border border-l-8 border-l-[#BF9853] lg:h-[500px] overflow-auto select-none ml-5 mr-5"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <table ref={tableRef} className="table-fixed min-w-[1200px] lg:min-w-[1235px] w-full border-collapse">
            <thead className="bg-[#FAF6ED] sticky top-0 z-10">
              <tr>
                <th className="pt-2 pl-3 w-16 lg:w-20 font-bold text-left select-none text-xs lg:text-sm">
                  S.No
                </th>
                <th
                  className="pt-2 pl-3 w-24 lg:w-36 font-bold text-left cursor-pointer hover:bg-gray-200 select-none text-xs lg:text-sm"
                  onClick={() => requestSort("date")}
                >
                  Date <SortIcon columnKey="date" />
                </th>
                <th
                  className="px-2 w-[180px] lg:w-[220px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none text-xs lg:text-sm"
                  onClick={() => requestSort("cv")}
                >
                  Employee Name <SortIcon columnKey="cv" />
                </th>
                <th
                  className="px-2 w-[200px] lg:w-[270px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none text-xs lg:text-sm"
                  onClick={() => requestSort("project")}
                >
                  Purpose <SortIcon columnKey="project" />
                </th>
                <th className="px-2 w-[80px] lg:w-[100px] font-bold text-left text-xs lg:text-sm">Advance</th>
                <th className="px-2 w-[100px] lg:w-[120px] font-bold text-left text-xs lg:text-sm">Refund Amount</th>
                <th
                  className="px-2 w-[180px] lg:w-[220px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none text-xs lg:text-sm"
                  onClick={() => requestSort("transfer")}
                >
                  Transfer <SortIcon columnKey="transfer" />
                </th>
                <th
                  className="px-2 w-[120px] lg:w-[160px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none text-xs lg:text-sm"
                  onClick={() => requestSort("type")}
                >
                  Type <SortIcon columnKey="type" />
                </th>
                <th
                  className="px-2 w-[100px] lg:w-[120px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none text-xs lg:text-sm"
                  onClick={() => requestSort("payment_mode")}
                >
                  Mode <SortIcon columnKey="payment_mode" />
                </th>
                <th className="px-2 w-[100px] lg:w-[120px] font-bold text-left select-none text-xs lg:text-sm">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-8 text-gray-500 font-semibold">
                    No Entry is available
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr key={row.staffAdvancePortalId || index} className="odd:bg-white even:bg-[#FAF6ED] hover:bg-gray-50 transition-colors">
                    <td className="text-xs lg:text-sm text-left p-2 lg:p-3 font-semibold">{startIndex + index + 1}</td>
                    <td className="text-xs lg:text-sm text-left p-2 lg:p-3 font-semibold">
                      {new Date(row.date).toLocaleDateString("en-GB")}
                    </td>
                    <td className="text-xs lg:text-sm text-left p-2 lg:p-3 font-semibold truncate" title={employees.find(v => v.id === row.employee_id)?.label || laboursList.find(v => v.id === row.labour_id)?.label || "-"}>
                      {employees.find(v => v.id === row.employee_id)?.label || laboursList.find(v => v.id === row.labour_id)?.label || "-"}
                    </td>
                    <td className="text-xs lg:text-sm text-left p-2 lg:p-3 font-semibold truncate" title={purposeOptions.find(s => String(s.id) === String(row.from_purpose_id))?.label || "-"}>
                      {purposeOptions.find(s => String(s.id) === String(row.from_purpose_id))?.label || "-"}
                    </td>
                    <td className="text-xs lg:text-sm text-left p-2 lg:p-3 font-semibold">
                      {row.amount?.toLocaleString("en-IN") || "0"}
                    </td>
                    <td className="text-xs lg:text-sm text-left p-2 lg:p-3 font-semibold">
                      {row.staff_refund_amount?.toLocaleString("en-IN") || "0"}
                    </td>
                    <td className="text-xs lg:text-sm text-left p-2 lg:p-3 font-semibold truncate" title={siteOptions.find(s => s.id === row.to_purpose_id)?.label || "-"}>
                      {siteOptions.find(s => s.id === row.to_purpose_id)?.label || "-"}
                    </td>
                    <td className="text-xs lg:text-sm text-left p-2 lg:p-3 font-semibold">
                      {row.type || "-"}
                    </td>
                    <td className="text-xs lg:text-sm text-left p-2 lg:p-3 font-semibold">
                      {row.staff_payment_mode || "-"}
                    </td>
                    <td className="text-xs lg:text-sm text-left p-2 lg:p-3 font-semibold truncate" title={row.description || "-"}>
                      {row.description || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {sortedData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-5 py-4 bg-white ">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <label className="text-sm font-medium text-gray-700">Show:</label>
              <select value={itemsPerPage} onChange={handleItemsPerPageChange}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF9853] focus:border-transparent"
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
              <span className="text-sm text-gray-700">entries</span>
            </div>
            <div className="text-sm text-gray-700 mb-4 sm:mb-0">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={goToPreviousPage} disabled={currentPage === 1}
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
    </div>
  );
};

export default StaffReport;

