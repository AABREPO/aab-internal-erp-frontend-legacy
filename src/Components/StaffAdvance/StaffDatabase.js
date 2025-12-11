import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import jsPDF from "jspdf";
import "jspdf-autotable";
import Select from 'react-select';
import Filter from '../Images/filter (3).png'
import Reload from '../Images/rotate-right.png'
import edit from '../Images/Edit.svg';
import history from '../Images/History.svg';
import remove from '../Images/Delete.svg';

const StaffDatabase = ({ username, userRoles = [], paymentModeOptions = [] }) => {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const [filterType, setFilterType] = useState(''); // "" means all types
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [laboursList, setLaboursList] = useState([]);
  const [staffAdvanceCombinedOptions, setStaffAdvanceCombinedOptions] = useState([]);
  // New state variables for advanced functionality
  const [selectDate, setSelectDate] = useState('');
  const [selectEmployeeName, setSelectEmployeeName] = useState('');
  const [selectPurpose, setSelectPurpose] = useState('');
  const [selectTransferTo, setSelectTransferTo] = useState('');
  const [selectType, setSelectType] = useState('');
  const [selectMode, setSelectMode] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [staffAdvanceAudits, setStaffAdvanceAudits] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const scroll = useRef({ left: 0, top: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);
  const lastMove = useRef({ time: 0, x: 0, y: 0 });

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch staff advance records
        let recData = [];
        try {
          const recRes = await fetch('https://backendaab.in/aabuildersDash/api/staff-advance/all');
          if (recRes.ok) {
            recData = await recRes.json();
          } else {
            console.warn('Staff advance API not available, using empty data');
          }
        } catch (error) {
          console.warn('Error fetching staff advance data:', error);
        }

        // Fetch employee data
        let empData = [];
        try {
          const empRes = await fetch('https://backendaab.in/aabuildersDash/api/employee_details/getAll', {
            credentials: 'include',
          });
          if (empRes.ok) {
            empData = await empRes.json();
          } else {
            console.warn('Employee API not available, using empty data');
          }
        } catch (error) {
          console.warn('Error fetching employee data:', error);
        }

        // Fetch purposes data
        let purData = [];
        try {
          const purRes = await fetch('https://backendaab.in/aabuildersDash/api/purposes/getAll');
          if (purRes.ok) {
            purData = await purRes.json();
          } else {
            console.warn('Purposes API not available, using empty data');
          }
        } catch (error) {
          console.warn('Error fetching purposes data:', error);
        }

        setRecords(recData);
        setEmployees(empData.map(e => ({ id: e.id, label: e.employee_name, type: "Employee" })));
        setPurposes(purData.map(p => ({ id: p.id, label: p.purpose })));
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError('Failed to load data. Some APIs may not be available.');
        // Set empty arrays as fallback
        setRecords([]);
        setEmployees([]);
        setPurposes([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
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

  // Mouse drag functionality for table scrolling
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

  const formatWithCommas = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const clearFilters = () => {
    setSelectDate('');
    setSelectEmployeeName('');
    setSelectPurpose('');
    setSelectTransferTo('');
    setSelectType('');
    setSelectMode('');
  };

  const formatDateOnly = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getEmployeeName = (id) => employees.find(e => e.id === id)?.label || id;
  const getLabourName = (id) => laboursList.find(l => l.id === id)?.label || id;
  const getPurposeName = (id) => purposes.find(p => p.id === id)?.label || id;

  // Get unique employee names from current table data for filter dropdown
  const employeeNameOptions = useMemo(() => {
    const uniqueNames = new Set();
    // Use filteredRecords but exclude employee filter to show all available employees in current view
    records.filter((entry) => {
      // Apply all filters except employee filter
      if (selectDate) {
        const [year, month, day] = selectDate.split("-");
        const formattedSelectDate = `${parseInt(day)}-${parseInt(month)}-${year}`;
        const entryDateObj = new Date(entry.date);
        const formattedEntryDate = `${entryDateObj.getDate()}-${entryDateObj.getMonth() + 1}-${entryDateObj.getFullYear()}`;
        if (formattedEntryDate !== formattedSelectDate) return false;
      }
      if (selectPurpose) {
        const purposeName = String(getPurposeName(entry.from_purpose_id) || "");
        if (purposeName.toLowerCase() !== selectPurpose.toLowerCase()) return false;
      }
      if (selectTransferTo) {
        const transferToName = String(getPurposeName(entry.to_purpose_id) || "");
        if (transferToName.toLowerCase() !== selectTransferTo.toLowerCase()) return false;
      }
      if (selectType) {
        if (String(entry.type || "").toLowerCase() !== selectType.toLowerCase()) return false;
      }
      if (selectMode) {
        if (String(entry.staff_payment_mode || "").toLowerCase() !== selectMode.toLowerCase()) return false;
      }
      return true;
    }).forEach((entry) => {
      const name = getEmployeeName(entry.employee_id) || getLabourName(entry.labour_id);
      if (name) {
        uniqueNames.add(name);
      }
    });
    return Array.from(uniqueNames).map(name => ({ value: name, label: name }));
  }, [records, selectDate, selectPurpose, selectTransferTo, selectType, selectMode, getEmployeeName, getLabourName, getPurposeName]);

  // Get unique purpose options from current table data
  const purposeOptions = useMemo(() => {
    const uniquePurposes = new Set();
    records.filter((entry) => {
      // Apply all filters except purpose filter
      if (selectDate) {
        const [year, month, day] = selectDate.split("-");
        const formattedSelectDate = `${parseInt(day)}-${parseInt(month)}-${year}`;
        const entryDateObj = new Date(entry.date);
        const formattedEntryDate = `${entryDateObj.getDate()}-${entryDateObj.getMonth() + 1}-${entryDateObj.getFullYear()}`;
        if (formattedEntryDate !== formattedSelectDate) return false;
      }
      if (selectEmployeeName) {
        const employeeName = String(getEmployeeName(entry.employee_id) || getLabourName(entry.labour_id) || "");
        if (employeeName.toLowerCase() !== selectEmployeeName.toLowerCase()) return false;
      }
      if (selectTransferTo) {
        const transferToName = String(getPurposeName(entry.to_purpose_id) || "");
        if (transferToName.toLowerCase() !== selectTransferTo.toLowerCase()) return false;
      }
      if (selectType) {
        if (String(entry.type || "").toLowerCase() !== selectType.toLowerCase()) return false;
      }
      if (selectMode) {
        if (String(entry.staff_payment_mode || "").toLowerCase() !== selectMode.toLowerCase()) return false;
      }
      return true;
    }).forEach((entry) => {
      const purposeName = getPurposeName(entry.from_purpose_id);
      if (purposeName && purposeName !== entry.from_purpose_id) {
        uniquePurposes.add(purposeName);
      }
    });
    return Array.from(uniquePurposes).map(purpose => ({ 
      value: purpose, 
      label: purpose, 
      id: records.find(r => getPurposeName(r.from_purpose_id) === purpose)?.from_purpose_id 
    }));
  }, [records, selectDate, selectEmployeeName, selectTransferTo, selectType, selectMode, getPurposeName, getEmployeeName, getLabourName]);

  // Get unique transfer to options from current table data
  const transferToOptions = useMemo(() => {
    const uniqueTransferTo = new Set();
    records.filter((entry) => {
      // Apply all filters except transferTo filter
      if (selectDate) {
        const [year, month, day] = selectDate.split("-");
        const formattedSelectDate = `${parseInt(day)}-${parseInt(month)}-${year}`;
        const entryDateObj = new Date(entry.date);
        const formattedEntryDate = `${entryDateObj.getDate()}-${entryDateObj.getMonth() + 1}-${entryDateObj.getFullYear()}`;
        if (formattedEntryDate !== formattedSelectDate) return false;
      }
      if (selectEmployeeName) {
        const employeeName = String(getEmployeeName(entry.employee_id) || getLabourName(entry.labour_id) || "");
        if (employeeName.toLowerCase() !== selectEmployeeName.toLowerCase()) return false;
      }
      if (selectPurpose) {
        const purposeName = String(getPurposeName(entry.from_purpose_id) || "");
        if (purposeName.toLowerCase() !== selectPurpose.toLowerCase()) return false;
      }
      if (selectType) {
        if (String(entry.type || "").toLowerCase() !== selectType.toLowerCase()) return false;
      }
      if (selectMode) {
        if (String(entry.staff_payment_mode || "").toLowerCase() !== selectMode.toLowerCase()) return false;
      }
      return true;
    }).forEach((entry) => {
      const transferToName = getPurposeName(entry.to_purpose_id);
      if (transferToName && transferToName !== entry.to_purpose_id) {
        uniqueTransferTo.add(transferToName);
      }
    });
    return Array.from(uniqueTransferTo).map(transferTo => ({ 
      value: transferTo, 
      label: transferTo, 
      id: records.find(r => getPurposeName(r.to_purpose_id) === transferTo)?.to_purpose_id 
    }));
  }, [records, selectDate, selectEmployeeName, selectPurpose, selectType, selectMode, getPurposeName, getEmployeeName, getLabourName]);

  // Get unique type options from current table data
  const typeOptions = useMemo(() => {
    const uniqueTypes = new Set();
    records.filter((entry) => {
      // Apply all filters except type filter
      if (selectDate) {
        const [year, month, day] = selectDate.split("-");
        const formattedSelectDate = `${parseInt(day)}-${parseInt(month)}-${year}`;
        const entryDateObj = new Date(entry.date);
        const formattedEntryDate = `${entryDateObj.getDate()}-${entryDateObj.getMonth() + 1}-${entryDateObj.getFullYear()}`;
        if (formattedEntryDate !== formattedSelectDate) return false;
      }
      if (selectEmployeeName) {
        const employeeName = String(getEmployeeName(entry.employee_id) || getLabourName(entry.labour_id) || "");
        if (employeeName.toLowerCase() !== selectEmployeeName.toLowerCase()) return false;
      }
      if (selectPurpose) {
        const purposeName = String(getPurposeName(entry.from_purpose_id) || "");
        if (purposeName.toLowerCase() !== selectPurpose.toLowerCase()) return false;
      }
      if (selectTransferTo) {
        const transferToName = String(getPurposeName(entry.to_purpose_id) || "");
        if (transferToName.toLowerCase() !== selectTransferTo.toLowerCase()) return false;
      }
      if (selectMode) {
        if (String(entry.staff_payment_mode || "").toLowerCase() !== selectMode.toLowerCase()) return false;
      }
      return true;
    }).forEach((entry) => {
      if (entry.type) {
        uniqueTypes.add(entry.type);
      }
    });
    return Array.from(uniqueTypes).sort();
  }, [records, selectDate, selectEmployeeName, selectPurpose, selectTransferTo, selectMode, getEmployeeName, getLabourName, getPurposeName]);

  // Get unique mode options from current table data
  const modeOptions = useMemo(() => {
    const uniqueModes = new Set();
    records.filter((entry) => {
      // Apply all filters except mode filter
      if (selectDate) {
        const [year, month, day] = selectDate.split("-");
        const formattedSelectDate = `${parseInt(day)}-${parseInt(month)}-${year}`;
        const entryDateObj = new Date(entry.date);
        const formattedEntryDate = `${entryDateObj.getDate()}-${entryDateObj.getMonth() + 1}-${entryDateObj.getFullYear()}`;
        if (formattedEntryDate !== formattedSelectDate) return false;
      }
      if (selectEmployeeName) {
        const employeeName = String(getEmployeeName(entry.employee_id) || getLabourName(entry.labour_id) || "");
        if (employeeName.toLowerCase() !== selectEmployeeName.toLowerCase()) return false;
      }
      if (selectPurpose) {
        const purposeName = String(getPurposeName(entry.from_purpose_id) || "");
        if (purposeName.toLowerCase() !== selectPurpose.toLowerCase()) return false;
      }
      if (selectTransferTo) {
        const transferToName = String(getPurposeName(entry.to_purpose_id) || "");
        if (transferToName.toLowerCase() !== selectTransferTo.toLowerCase()) return false;
      }
      if (selectType) {
        if (String(entry.type || "").toLowerCase() !== selectType.toLowerCase()) return false;
      }
      return true;
    }).forEach((entry) => {
      if (entry.staff_payment_mode) {
        uniqueModes.add(entry.staff_payment_mode);
      }
    });
    return Array.from(uniqueModes).sort();
  }, [records, selectDate, selectEmployeeName, selectPurpose, selectTransferTo, selectType, getEmployeeName, getLabourName, getPurposeName]);

  // Advanced filtering logic
  const filteredRecords = useMemo(() => {
    return records.filter((entry) => {
      // Date filter (exact match since it's type="date")
      if (selectDate) {
        const [year, month, day] = selectDate.split("-");
        const formattedSelectDate = `${parseInt(day)}-${parseInt(month)}-${year}`;
        const entryDateObj = new Date(entry.date);
        const formattedEntryDate = `${entryDateObj.getDate()}-${entryDateObj.getMonth() + 1}-${entryDateObj.getFullYear()}`;
        if (formattedEntryDate !== formattedSelectDate) return false;
      }

      // Employee filter
      if (selectEmployeeName) {
        const employeeName = String(getEmployeeName(entry.employee_id) || getLabourName(entry.labour_id) || "");
        if (employeeName.toLowerCase() !== selectEmployeeName.toLowerCase()) return false;
      }

      // Purpose filter
      if (selectPurpose) {
        const purposeName = String(getPurposeName(entry.from_purpose_id) || "");
        if (purposeName.toLowerCase() !== selectPurpose.toLowerCase()) return false;
      }

      // Transfer To filter
      if (selectTransferTo) {
        const transferToName = String(getPurposeName(entry.to_purpose_id) || "");
        if (transferToName.toLowerCase() !== selectTransferTo.toLowerCase()) return false;
      }

      // Type filter
      if (selectType) {
        if (String(entry.type || "").toLowerCase() !== selectType.toLowerCase()) return false;
      }

      // Mode filter
      if (selectMode) {
        if (String(entry.staff_payment_mode || "").toLowerCase() !== selectMode.toLowerCase()) return false;
      }

      return true; // passes all filters
    });
  }, [records, selectDate, selectEmployeeName, selectPurpose, selectTransferTo, selectType, selectMode]);

  // Sorting logic

  // Sorting logic
  const sortedData = useMemo(() => {
    let sortableData = [...filteredRecords];

    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        let aValue, bValue;

        switch (sortConfig.key) {
          case 'date':
            aValue = new Date(a.date);
            bValue = new Date(b.date);
            break;
          case 'employee':
            aValue = getEmployeeName(a.employee_id) || getLabourName(a.labour_id);
            bValue = getEmployeeName(b.employee_id) || getLabourName(b.labour_id);
            break;
          case 'purpose':
            aValue = getPurposeName(a.from_purpose_id);
            bValue = getPurposeName(b.from_purpose_id);
            break;
          case 'transfer':
            aValue = getPurposeName(a.to_purpose_id);
            bValue = getPurposeName(b.to_purpose_id);
            break;
          case 'type':
            aValue = a.type || '';
            bValue = b.type || '';
            break;
          case 'mode':
            aValue = a.staff_payment_mode || '';
            bValue = b.staff_payment_mode || '';
            break;
          case 'entry_no':
            aValue = Number(a.entry_no) || 0;
            bValue = Number(b.entry_no) || 0;
            break;
          default:
            return 0;
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // Default sorting: latest entry_no first (descending order)
      sortableData.sort((a, b) => Number(b.entry_no) - Number(a.entry_no));
      console.log("Default sorting by entry_no desc applied:", sortableData.map(item => item.entry_no));
    }

    return sortableData;
  }, [filteredRecords, sortConfig]);



  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectDate, selectEmployeeName, selectPurpose, selectTransferTo, selectType, selectMode]);

  // Pagination handlers
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

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Calculate summary totals dynamically for filtered records
  const advanceTotal = filteredRecords
    .filter(r => r.type === 'Advance')
    .reduce((acc, r) => acc + (r.amount || 0), 0);
  const transferTotal = filteredRecords
    .filter(r => r.type === 'Transfer')
    .reduce((acc, r) => acc + (r.amount > 0 ? r.amount : 0), 0);
  const refundTotal = filteredRecords
    .filter(r => r.type === 'Refund')
    .reduce((acc, r) => acc + (r.staff_refund_amount || 0), 0);

  // Export functionality
  const exportPDF = () => {
    const doc = new jsPDF("l", "pt", "a4");
    const headers = [
      [
        "S.No",
        "Timestamp",
        "Date",
        "Employee Name",
        "Purpose",
        "Transfer To",
        "Advance",
        "Refund",
        "Type",
        "Mode",
        "Description",
        "E.No"
      ]
    ];
    const rows = sortedData.map((entry, index) => [
      index + 1,
      entry.timestamp ? formatDate(entry.timestamp) : "",
      formatDateOnly(entry.date),
      getEmployeeName(entry.employee_id) || getLabourName(entry.labour_id),
      getPurposeName(entry.from_purpose_id),
      getPurposeName(entry.to_purpose_id),
      entry.amount != null && entry.amount !== ""
        ? Number(entry.amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.staff_refund_amount != null && entry.staff_refund_amount !== ""
        ? Number(entry.staff_refund_amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.type,
      entry.staff_payment_mode,
      entry.description,
      entry.entry_no
    ]);
    doc.setFontSize(12);
    doc.text("Staff Advance Data Table", 40, 30);
    doc.autoTable({
      head: headers,
      body: rows,
      startY: 50,
      styles: {
        fontSize: 8,
        cellPadding: 4,
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
        fillColor: null
      },
      headStyles: {
        fillColor: null,
        textColor: [0, 0, 0],
        fontStyle: "bold",
        lineWidth: 0.5,
        lineColor: [0, 0, 0]
      },
      alternateRowStyles: {
        fillColor: null
      }
    });
    doc.save("StaffAdvanceData.pdf");
  };

  const exportCSV = () => {
    const csvHeaders = [
      "S.No",
      "Timestamp",
      "Date",
      "Employee Name",
      "Purpose",
      "Transfer To",
      "Advance",
      "Refund",
      "Type",
      "Mode",
      "Description",
      "Attached file",
      "E.No"
    ];
    const csvRows = sortedData.map((entry, index) => [
      index + 1,
      entry.timestamp ? formatDate(entry.timestamp) : "",
      entry.date ? formatDateOnly(entry.date) : "",
      getEmployeeName(entry.employee_id) || getLabourName(entry.labour_id) || "",
      getPurposeName(entry.from_purpose_id) || "",
      getPurposeName(entry.to_purpose_id) || "",
      entry.amount != null && entry.amount !== ""
        ? Number(entry.amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.staff_refund_amount != null && entry.staff_refund_amount !== ""
        ? Number(entry.staff_refund_amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.type || "",
      entry.staff_payment_mode || "",
      entry.description || "",
      "",
      entry.entry_no || ""
    ]);

    const csvString = [
      csvHeaders.join(","),
      ...csvRows.map(row =>
        row
          .map(value => {
            // Convert null/undefined to empty string, then handle quotes
            const stringValue = value == null ? "" : String(value);
            return `"${stringValue.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
    ].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "StaffAdvanceData.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditClick = (entry) => {
    setEditingId(entry.staffAdvancePortalId || entry.id);
    setEditFormData({
      date: entry.date?.split('T')[0] || '',
      amount: entry.amount || '',
      employee_id: entry.employee_id || '',
      labour_id: entry.labour_id || '',
      from_purpose_id: entry.from_purpose_id || '',
      to_purpose_id: entry.to_purpose_id || '',
      entryNo: entry.entry_no || '',
      description: entry.description || '',
      type: entry.type || '',
      staff_payment_mode: entry.staff_payment_mode || '',
      staff_refund_amount: entry.staff_refund_amount || ''
    });
    setIsEditModalOpen(true);
  };

  const fetchAuditDetails = async (staffAdvancePortalId) => {
    try {
      const response = await fetch(`https://backendaab.in/aabuildersDash/api/staff-advance/audit/history/${staffAdvancePortalId}`);
      const data = await response.json();
      setStaffAdvanceAudits(data);
      setShowHistoryModal(true);
    } catch (error) {
      console.error("Error fetching audit details:", error);
    }
  };

  const handleUpdate = useCallback(async () => {
    try {
      const url = `https://backendaab.in/aabuildersDash/api/staff-advance/${editingId}?editedBy=${username}`;
      const payload = {
        type: editFormData.type || '',
        date: editFormData.date || '',
        employee_id: editFormData.employee_id || '',
        labour_id: editFormData.labour_id || '',
        from_purpose_id: editFormData.from_purpose_id || null,
        to_purpose_id: editFormData.to_purpose_id || null,
        staff_payment_mode: editFormData.staff_payment_mode || '',
        amount: editFormData.type === "Refund" ? 0 : Number(editFormData.amount || 0),
        staff_refund_amount: editFormData.type === "Refund" ? Number(editFormData.staff_refund_amount || 0) : 0,
        entry_no: editFormData.entryNo ?? null,
        description: editFormData.description || '',
        file_url: editFormData.file_url || ''
      };

      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Update failed: ${response.statusText}`);
      }
      const updatedRecords = await response.json();
      window.location.reload();
      setIsEditModalOpen(false);
      setRecords(prevRecords => {
        const updatedEntryNos = new Set(updatedRecords.map(r => r.entry_no));
        const filteredRecords = prevRecords.filter(record =>
          !updatedEntryNos.has(record.entry_no) ||
          updatedRecords.some(u => u.staffAdvancePortalId === record.staffAdvancePortalId)
        );
        return [...filteredRecords, ...updatedRecords];
      });
    } catch (error) {
      console.error('Update error:', error);
      alert(error.message || 'Failed to update record. Please try again.');
    }
  }, [editFormData, editingId, username]);

  const handleDelete = async (idToDelete) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this record?");
    if (!confirmDelete) return;

    try {
      const record = records.find(r => r.staffAdvancePortalId === idToDelete || r.id === idToDelete);
      if (!record) {
        console.warn('Record not found for ID:', idToDelete);
        return;
      }

      const entryNo = record.entry_no;

      const clearedData = {
        entry_no: entryNo, // Preserve entry_no
        date: record.date,
        amount: '',
        employee_id: '',
        labour_id: '',
        from_purpose_id: '',
        to_purpose_id: '',
        staff_payment_mode: '',
        type: '',
        description: '',
        staff_refund_amount: ''
      };

      const res = await fetch(`https://backendaab.in/aabuildersDash/api/staff-advance/${idToDelete}?editedBy=${username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(clearedData)
      });

      if (!res.ok) {
        throw new Error('Failed to clear record');
      }

      console.log(`Cleared record with ID ${idToDelete}`);
      window.location.reload(); // Refresh to reflect changes
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const fieldConfig = useMemo(() => {
    switch (editFormData.type) {
      case 'Refund':
        return {
          purposeLabel: 'Purpose',
          amountGivenLabel: 'Refund Amount',
          paymentModeLabel: 'Payment Mode',
          showTransferAmount: false
        };
      case 'Transfer':
        return {
          purposeLabel: 'Purpose From',
          amountGivenLabel: 'Purpose To',
          paymentModeLabel: 'Transfer Amount',
          showTransferAmount: true
        };
      default:
        return {
          purposeLabel: 'Purpose',
          amountGivenLabel: 'Amount Given',
          paymentModeLabel: 'Payment Mode',
          showTransferAmount: false
        };
    }
  }, [editFormData.type]);

  useEffect(() => {
    return () => cancelMomentum();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 bg-[#faf6ed] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BF9853] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <body>
      <div className='w-full max-w-[1850px] h-auto bg-white text-left flex  sm:flex-row gap-3 p-3 sm:p-5 mx-2 ml-10 mr-10'>
        <div className=''>
          <label className='block mb-2 font-semibold text-sm sm:text-base'>Advance Amount</label>
          <input
            className='w-full max-w-[183px] h-[40px] sm:h-[45px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2 text-sm sm:text-base'
            value={`₹${advanceTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            readOnly
          />
        </div>
        <div className=''>
          <label className='block mb-2 font-semibold text-sm sm:text-base'>Transfer Amount</label>
          <input
            className='w-full max-w-[220px] h-[40px] sm:h-[45px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2 text-sm sm:text-base'
            value={`₹${transferTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            readOnly
          />
        </div>
        <div className=''>
          <label className='block mb-2 font-semibold text-sm sm:text-base'>Refund Amount</label>
          <input
            className='w-full max-w-[220px] h-[40px] sm:h-[45px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2 text-sm sm:text-base'
            value={`₹${refundTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            readOnly
          />
        </div>
      </div>
      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg w-full">
          <p className="font-semibold">Warning:</p>
          <p>{error}</p>
        </div>
      )}
      <div className='w-full max-w-[1850px] bg-white mt-3 sm:mt-5 pt-3 sm:pt-5 mx-2 ml-10 mr-5'>
        <div
          className={`text-left flex ${selectDate || selectEmployeeName || selectPurpose || selectTransferTo || selectType || selectMode
            ? 'flex-col lg:flex-row lg:justify-between'
            : 'flex-col sm:flex-row sm:justify-between sm:items-center'
            } mb-3 gap-3 sm:gap-2`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
            <button className='pl-0 sm:pl-2' onClick={() => setShowFilters(!showFilters)}>
              <img
                src={Filter}
                alt="Toggle Filter"
                className="w-6 h-6 sm:w-7 sm:h-7 border border-[#BF9853] rounded-md ml-0 sm:ml-3"
              />
            </button>
            {(selectDate || selectEmployeeName || selectPurpose || selectTransferTo || selectType || selectMode) && (
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-2 sm:mt-0">
                {selectDate && (
                  <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 py-1 text-xs sm:text-sm font-medium w-fit">
                    <span className="font-normal">Date: </span>
                    <span className="font-bold">{selectDate}</span>
                    <button onClick={() => setSelectDate('')} className="text-[#BF9853] ml-1 text-lg sm:text-2xl">×</button>
                  </span>
                )}
                {selectEmployeeName && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-xs sm:text-sm font-medium w-fit">
                    <span className="font-normal">Employee: </span>
                    <span className="font-bold">{selectEmployeeName}</span>
                    <button onClick={() => setSelectEmployeeName('')} className="text-[#BF9853] text-lg sm:text-2xl ml-1">×</button>
                  </span>
                )}
                {selectPurpose && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-xs sm:text-sm font-medium w-fit">
                    <span className="font-normal">Purpose:</span>
                    <span className="font-bold">{selectPurpose}</span>
                    <button onClick={() => setSelectPurpose('')} className="text-[#BF9853] text-lg sm:text-2xl ml-1">×</button>
                  </span>
                )}
                {selectTransferTo && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-xs sm:text-sm font-medium w-fit">
                    <span className="font-normal">Transfer To: </span>
                    <span className="font-bold">{selectTransferTo}</span>
                    <button onClick={() => setSelectTransferTo('')} className="text-[#BF9853] text-lg sm:text-2xl ml-1">×</button>
                  </span>
                )}
                {selectType && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-xs sm:text-sm font-medium w-fit">
                    <span className="font-normal">Type: </span>
                    <span className="font-bold">{selectType}</span>
                    <button onClick={() => setSelectType('')} className="text-[#BF9853] text-lg sm:text-2xl ml-1">×</button>
                  </span>
                )}
                {selectMode && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-xs sm:text-sm font-medium w-fit">
                    <span className="font-normal">Mode: </span>
                    <span className="font-bold">{selectMode}</span>
                    <button onClick={() => setSelectMode('')} className="text-[#BF9853] text-lg sm:text-2xl ml-1">×</button>
                  </span>
                )}
              </div>
            )}
          </div>
          <div className='flex flex-col sm:flex-row gap-2 sm:gap-4 sm:justify-end sm:mr-4'>
            <button onClick={exportPDF} className='text-xs sm:text-sm text-[#E4572E] hover:underline font-bold text-left sm:text-right'>Export PDF</button>
            <button onClick={exportCSV} className='text-xs sm:text-sm text-[#007233] hover:underline font-bold text-left sm:text-right'>Export XL</button>
            <button className='text-xs sm:text-sm text-[#BF9853] hover:underline font-bold text-left sm:text-right'>Print</button>
          </div>
        </div>
        <div className='border-l-8 border-l-[#BF9853] rounded-lg ml-2 sm:ml-5 mr-2 sm:mr-5'>
          {/* Single Table with Scrollable Container */}
          <div
            ref={scrollRef}
            className='overflow-auto max-h-[400px] sm:max-h-[500px]'
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-white ">
                <tr className="bg-[#FAF6ED]">
                  <th
                    className="pt-2 pl-1 sm:pl-3 min-w-[80px] sm:min-w-[100px] font-bold text-left cursor-pointer hover:bg-gray-200 text-xs sm:text-sm"
                    onClick={() => handleSort('date')}
                  >
                    <span className="hidden sm:inline">Timestamp</span>
                    <span className="sm:hidden">Time</span> {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="pt-2 pl-1 sm:pl-3 min-w-[80px] sm:min-w-[100px] font-bold text-left cursor-pointer hover:bg-gray-200 text-xs sm:text-sm"
                    onClick={() => handleSort('date')}
                  >
                    Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-1 sm:px-2 min-w-[120px] sm:min-w-[150px] font-bold text-left cursor-pointer hover:bg-gray-200 text-xs sm:text-sm"
                    onClick={() => handleSort('employee')}
                  >
                    <span className="hidden sm:inline">Employee Name</span>
                    <span className="sm:hidden">Employee</span> {sortConfig.key === 'employee' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-1 sm:px-2 min-w-[150px] sm:min-w-[200px] font-bold text-left cursor-pointer hover:bg-gray-200 text-xs sm:text-sm"
                    onClick={() => handleSort('purpose')}
                  >
                    Purpose {sortConfig.key === 'purpose' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-1 sm:px-2 min-w-[150px] sm:min-w-[200px] font-bold text-left cursor-pointer hover:bg-gray-200 text-xs sm:text-sm"
                    onClick={() => handleSort('transfer')}
                  >
                    <span className="hidden sm:inline">Transfer To</span>
                    <span className="sm:hidden">Transfer</span> {sortConfig.key === 'transfer' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-1 sm:px-2 min-w-[60px] sm:min-w-[80px] font-bold text-left text-xs sm:text-sm">Advance</th>
                  <th className="px-1 sm:px-2 min-w-[60px] sm:min-w-[80px] font-bold text-left text-xs sm:text-sm">Refund</th>
                  <th
                    className="px-1 sm:px-2 min-w-[60px] sm:min-w-[80px] font-bold text-left cursor-pointer hover:bg-gray-200 text-xs sm:text-sm"
                    onClick={() => handleSort('type')}
                  >
                    Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-1 sm:px-2 min-w-[80px] sm:min-w-[100px] font-bold text-left cursor-pointer hover:bg-gray-200 text-xs sm:text-sm"
                    onClick={() => handleSort('mode')}
                  >
                    Mode {sortConfig.key === 'mode' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-1 sm:px-2 min-w-[80px] sm:min-w-[100px] font-bold text-left text-xs sm:text-sm">
                    <span className="hidden sm:inline">Description</span>
                    <span className="sm:hidden">Desc</span>
                  </th>
                  <th className="px-1 sm:px-2 min-w-[60px] sm:min-w-[80px] font-bold text-left text-xs sm:text-sm">
                    <span className="hidden sm:inline">Attached file</span>
                    <span className="sm:hidden">File</span>
                  </th>
                  <th
                    className="px-1 sm:px-2 min-w-[50px] sm:min-w-[60px] font-bold text-left cursor-pointer hover:bg-gray-200 text-xs sm:text-sm"
                    onClick={() => handleSort('entry_no')}
                  >
                    E.No {sortConfig.key === 'entry_no' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-1 sm:px-2 min-w-[60px] sm:min-w-[80px] font-bold text-left text-xs sm:text-sm">Activity</th>
                </tr>
                {showFilters && (
                  <tr className="bg-white border-b border-gray-200">
                    <th className="pt-2 pb-2 min-w-[120px] sm:w-44">
                      <input
                        type="date"
                        className="p-1 rounded-md bg-transparent w-full max-w-[120px] sm:w-32 border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none text-xs sm:text-sm"
                      />
                    </th>
                    <th className="pt-2 pb-2 min-w-[120px] sm:w-44">
                      <input
                        type="date"
                        value={selectDate}
                        onChange={(e) => setSelectDate(e.target.value)}
                        className="p-1 rounded-md bg-transparent w-full max-w-[120px] sm:w-32 border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none text-xs sm:text-sm"
                        placeholder="Search Date..."
                      />
                    </th>
                    <th className="pt-2 pb-2 min-w-[150px] sm:w-[220px]">
                      <Select
                        options={employeeNameOptions}
                        value={selectEmployeeName ? { value: selectEmployeeName, label: selectEmployeeName } : null}
                        onChange={(opt) => setSelectEmployeeName(opt ? opt.value : "")}
                        className="text-xs focus:outline-none"
                        placeholder="Employee..."
                        isSearchable
                        isClearable
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            backgroundColor: 'transparent',
                            borderWidth: '3px',
                            borderColor: state.isFocused
                              ? 'rgba(191, 152, 83, 0.2)'
                              : 'rgba(191, 152, 83, 0.2)',
                            borderRadius: '6px',
                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                            '&:hover': {
                              borderColor: 'rgba(191, 152, 83, 0.2)',
                            },
                            minHeight: '32px',
                            fontSize: '12px',
                          }),
                          placeholder: (provided) => ({
                            ...provided,
                            color: '#999',
                            textAlign: 'left',
                            fontSize: '12px',
                          }),
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9,
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            textAlign: 'left',
                            fontWeight: 'normal',
                            fontSize: '12px',
                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                            color: 'black',
                          }),
                          singleValue: (provided) => ({
                            ...provided,
                            textAlign: 'left',
                            fontWeight: 'normal',
                            color: 'black',
                            fontSize: '12px',
                          }),
                        }}
                      />
                    </th>
                    <th className="pt-2 pb-2 min-w-[180px] sm:w-[300px]">
                      <Select
                        options={purposeOptions}
                        value={selectPurpose ? { value: selectPurpose, label: selectPurpose } : null}
                        onChange={(opt) => setSelectPurpose(opt ? opt.value : "")}
                        className="focus:outline-none text-xs"
                        placeholder="Purpose..."
                        isSearchable
                        isClearable
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            backgroundColor: 'transparent',
                            borderWidth: '3px',
                            borderColor: state.isFocused
                              ? 'rgba(191, 152, 83, 0.2)'
                              : 'rgba(191, 152, 83, 0.2)',
                            borderRadius: '6px',
                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                            '&:hover': {
                              borderColor: 'rgba(191, 152, 83, 0.2)',
                            },
                            minHeight: '32px',
                            fontSize: '12px',
                          }),
                          placeholder: (provided) => ({
                            ...provided,
                            color: '#999',
                            textAlign: 'left',
                            fontSize: '12px',
                          }),
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9,
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            textAlign: 'left',
                            fontWeight: 'normal',
                            fontSize: '12px',
                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                            color: 'black',
                          }),
                          singleValue: (provided) => ({
                            ...provided,
                            textAlign: 'left',
                            fontWeight: 'normal',
                            color: 'black',
                            fontSize: '12px',
                          }),
                        }}
                      />
                    </th>
                    <th className="pt-2 pb-2 min-w-[200px] sm:w-[350px]">
                      <Select
                        options={transferToOptions}
                        value={selectTransferTo ? { value: selectTransferTo, label: selectTransferTo } : null}
                        onChange={(opt) => setSelectTransferTo(opt ? opt.value : "")}
                        className="focus:outline-none text-xs"
                        placeholder="Transfer To..."
                        isSearchable
                        isClearable
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            backgroundColor: 'transparent',
                            borderWidth: '3px',
                            borderColor: state.isFocused
                              ? 'rgba(191, 152, 83, 0.2)'
                              : 'rgba(191, 152, 83, 0.2)',
                            borderRadius: '6px',
                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                            '&:hover': {
                              borderColor: 'rgba(191, 152, 83, 0.2)',
                            },
                            minHeight: '32px',
                            fontSize: '12px',
                          }),
                          placeholder: (provided) => ({
                            ...provided,
                            color: '#999',
                            textAlign: 'left',
                            fontSize: '12px',
                          }),
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9,
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            textAlign: 'left',
                            fontWeight: 'normal',
                            fontSize: '12px',
                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                            color: 'black',
                          }),
                          singleValue: (provided) => ({
                            ...provided,
                            textAlign: 'left',
                            fontWeight: 'normal',
                            color: 'black',
                            fontSize: '12px',
                          }),
                        }}
                      />
                    </th>
                    <th className=' pt-2 pb-2'></th>
                    <th className=' pt-2 pb-2'></th>
                    <th className="pt-2 pb-2 min-w-[100px]">
                      <select
                        value={selectType}
                        onChange={(e) => setSelectType(e.target.value)}
                        className="p-1 rounded-md bg-transparent w-full max-w-[100px] sm:w-[120px] h-[32px] sm:h-[42px] font-normal border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none text-xs"
                        placeholder="Type..."
                      >
                        <option value=''>Select Type...</option>
                        {typeOptions.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </th>
                    <th className="pt-2 pb-2 min-w-[100px]">
                      <select
                        value={selectMode}
                        onChange={(e) => setSelectMode(e.target.value)}
                        className="p-1 rounded-md bg-transparent w-full max-w-[100px] sm:w-[120px] h-[32px] sm:h-[42px] font-normal border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none text-xs"
                        placeholder="Mode..."
                      >
                        <option value=''>Select</option>
                        {modeOptions.map((mode) => (
                          <option key={mode} value={mode}>
                            {mode}
                          </option>
                        ))}
                      </select>
                    </th>
                    <th className="pt-2 pb-2"></th>
                    <th className=' pt-2 pb-2'></th>
                    <th className=' pt-2 pb-2'></th>
                    <th className=' pt-2 pb-2'></th>
                  </tr>
                )}
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((entry) => (
                    <tr key={entry.id} className="odd:bg-white even:bg-[#FAF6ED]">
                      <td className="text-xs sm:text-sm text-left p-1 sm:p-2 min-w-[80px] sm:min-w-[100px] font-semibold">
                        <span className="hidden sm:inline">{formatDate(entry.timestamp)}</span>
                        <span className="sm:hidden">{formatDate(entry.timestamp).split(' ')[1]}</span>
                      </td>
                      <td className="text-xs sm:text-sm text-left p-1 sm:p-2 min-w-[80px] sm:min-w-[100px] font-semibold">{formatDateOnly(entry.date)}</td>
                      {/* Employee Name */}
                      <td className="text-xs sm:text-sm text-left p-1 sm:p-2 min-w-[120px] sm:min-w-[150px] font-semibold">
                        <span className="truncate block max-w-[120px] sm:max-w-[150px]" title={getEmployeeName(entry.employee_id) || getLabourName(entry.labour_id)}>
                          {getEmployeeName(entry.employee_id) || getLabourName(entry.labour_id)}
                        </span>
                      </td>
                      {/* Purpose */}
                      <td className="text-xs sm:text-sm text-left p-1 sm:p-2 min-w-[150px] sm:min-w-[200px] font-semibold">
                        <span className="truncate block max-w-[150px] sm:max-w-[200px]" title={getPurposeName(entry.from_purpose_id)}>
                          {getPurposeName(entry.from_purpose_id)}
                        </span>
                      </td>
                      {/* Transfer Purpose */}
                      <td className="text-xs sm:text-sm text-left p-1 sm:p-2 min-w-[150px] sm:min-w-[200px] font-semibold">
                        <span className="truncate block max-w-[150px] sm:max-w-[200px]" title={getPurposeName(entry.to_purpose_id)}>
                          {getPurposeName(entry.to_purpose_id)}
                        </span>
                      </td>
                      {/* Amount */}
                      <td className="text-xs sm:text-sm text-left p-1 sm:p-2 min-w-[60px] sm:min-w-[80px] font-semibold">
                        {entry.amount != null && entry.amount !== ""
                          ? Number(entry.amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })
                          : ""}
                      </td>
                      {/* Refund Amount */}
                      <td className="text-xs sm:text-sm text-left p-1 sm:p-2 min-w-[60px] sm:min-w-[80px] font-semibold">
                        {entry.staff_refund_amount != null && entry.staff_refund_amount !== ""
                          ? Number(entry.staff_refund_amount).toLocaleString("en-IN", { maximumFractionDigits: 0 })
                          : ""}
                      </td>
                      <td className="text-xs sm:text-sm text-left p-1 sm:p-2 min-w-[60px] sm:min-w-[80px] font-semibold">{entry.type}</td>
                      <td className="text-xs sm:text-sm text-left p-1 sm:p-2 min-w-[80px] sm:min-w-[100px] font-semibold">{entry.staff_payment_mode}</td>
                      <td className="text-xs sm:text-sm text-left p-1 sm:p-2 min-w-[80px] sm:min-w-[100px] font-semibold">
                        <span className="truncate block max-w-[80px] sm:max-w-[100px]" title={entry.description}>
                          {entry.description}
                        </span>
                      </td>
                      <td className="text-xs sm:text-sm text-left p-1 sm:p-2 min-w-[60px] sm:min-w-[80px]"></td>
                      <td className="text-xs sm:text-sm text-left p-1 sm:p-2 min-w-[50px] sm:min-w-[60px] font-semibold">{entry.entry_no}</td>
                      <td className="text-xs sm:text-sm text-left p-1 sm:p-2 min-w-[60px] sm:min-w-[80px]">
                        <div className="flex justify-between items-center">
                          <button
                            className={`rounded-full transition duration-200 ml-2 mr-3 ${entry.not_allow_to_edit ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={entry.not_allow_to_edit}
                          >
                            <img
                              src={edit}
                              onClick={entry.not_allow_to_edit ? undefined : () => handleEditClick(entry)}
                              alt="Edit"
                              className={`w-4 h-6 transition duration-200 ${entry.not_allow_to_edit ? '' : 'transform hover:scale-110 hover:brightness-110'}`}
                            />
                          </button>
                          <button 
                            className={`-ml-5 -mr-2 ${entry.not_allow_to_edit ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={entry.not_allow_to_edit}
                          >
                            <img
                              src={remove}
                              alt='delete'
                              onClick={entry.not_allow_to_edit ? undefined : () => handleDelete(entry.staffAdvancePortalId || entry.id)}
                              className={`w-4 h-4 transition duration-200 ${entry.not_allow_to_edit ? '' : 'transform hover:scale-110 hover:brightness-110'}`} />
                          </button>
                          <button 
                            onClick={entry.not_allow_to_edit ? undefined : () => fetchAuditDetails(entry.staffAdvancePortalId || entry.id)} 
                            className={`rounded-full transition duration-200 -mr-1 ${entry.not_allow_to_edit ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={entry.not_allow_to_edit}
                          >
                            <img
                              src={history}
                              alt="history"
                              className={`w-4 h-5 transition duration-200 ${entry.not_allow_to_edit ? '' : 'transform hover:scale-110 hover:brightness-110'}`}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-2 text-center text-sm text-gray-400" colSpan={12}>
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Pagination Controls */}
        {sortedData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-3 sm:px-5 py-3 sm:py-4 bg-white mx-2 sm:mx-0">
            {/* Items per page selector */}
            <div className="flex items-center space-x-2 mb-3 sm:mb-0">
              <label className="text-xs sm:text-sm font-medium text-gray-700">Show:</label>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="border border-gray-300 rounded-md px-1 sm:px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#BF9853] focus:border-transparent"
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
              <span className="text-xs sm:text-sm text-gray-700">entries</span>
            </div>

            {/* Page info */}
            <div className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-0 text-center">
              <span className="hidden sm:inline">Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} entries</span>
              <span className="sm:hidden">{startIndex + 1}-{Math.min(endIndex, sortedData.length)} of {sortedData.length}</span>
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md ${currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-[#BF9853] border border-[#BF9853] hover:bg-[#BF9853] hover:text-white transition-colors'
                  }`}
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>

              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage <= 2) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 1) {
                    pageNum = totalPages - 2 + i;
                  } else {
                    pageNum = currentPage - 1 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md ${currentPage === pageNum
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
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md ${currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-[#BF9853] border border-[#BF9853] hover:bg-[#BF9853] hover:text-white transition-colors'
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-[700px] max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold mb-4">Edit Entry</h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left ml-0 sm:ml-5'>
                {/* Select Type */}
                <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3'>
                  <label className='font-semibold text-[#E4572E] text-sm sm:text-base'>Select Type</label>
                  <select
                    value={editFormData.type}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                    className='w-full sm:w-[163px] h-[40px] sm:h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                  >
                    <option value=''>Select Type...</option>
                    <option value='Advance'>Advance</option>
                    <option value='Transfer'>Transfer</option>
                    <option value='Refund'>Refund</option>
                  </select>
                </div>
                {/* Date */}
                <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3'>
                  <label className='font-semibold text-[#E4572E] text-sm sm:text-base'>Date</label>
                  <input
                    type='date'
                    placeholder='dd-mm-yyyy'
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className='w-full sm:w-[144px] h-[40px] sm:h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                  />
                </div>
                {/* Employee */}
                <div className='sm:col-span-1'>
                  <div className='flex'>
                    <label className='font-semibold block text-sm sm:text-base'>Employee</label>
                  </div>
                  <Select
                    options={staffAdvanceCombinedOptions}
                    value={
                      staffAdvanceCombinedOptions.find(
                        opt =>
                          (opt.type === "Employee" && opt.id === editFormData.employee_id) ||
                          (opt.type === "Labour" && opt.id === editFormData.labour_id)
                      ) || null
                    }
                    onChange={(selected) => {
                      if (!selected) {
                        setEditFormData({ ...editFormData, employee_id: '', labour_id: '' });
                        return;
                      }

                      if (selected.type === "Employee") {
                        setEditFormData({ ...editFormData, employee_id: selected.id, labour_id: null });
                      } else {
                        setEditFormData({ ...editFormData, labour_id: selected.id, employee_id: null });
                      }
                    }}
                    className='w-full sm:w-[263px] h-[40px] sm:h-[45px] rounded-lg focus:outline-none'
                    isClearable
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderWidth: '2px',
                        borderRadius: '8px',
                        borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'rgba(191, 152, 83, 0.2)',
                        boxShadow: state.isFocused ? '0 0 0 1px rgba(101, 102, 53, 0.1)' : 'none',
                        '&:hover': {
                          borderColor: 'rgba(191, 152, 83, 0.2)',
                        },
                        minHeight: '40px',
                        fontSize: '14px',
                      }),
                      placeholder: (provided) => ({
                        ...provided,
                        fontSize: '14px',
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        fontSize: '14px',
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isSelected ? 'transparent' : state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'transparent',
                        color: 'black',
                        '&:hover': {
                          backgroundColor: 'rgba(191, 152, 83, 0.1)',
                        },
                      }),
                    }}
                  />
                </div>
                {/* Purpose */}
                <div className='sm:col-span-1'>
                  <label className='font-semibold block text-sm sm:text-base'>{fieldConfig.purposeLabel}</label>
                  <Select
                    options={purposes}
                    value={purposes.find(purp => purp.id === editFormData.from_purpose_id) || null}
                    onChange={(selected) => setEditFormData({ ...editFormData, from_purpose_id: selected?.id || '' })}
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderWidth: '2px',
                        borderRadius: '8px',
                        borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'rgba(191, 152, 83, 0.2)',
                        boxShadow: state.isFocused ? '0 0 0 1px rgba(101, 102, 53, 0.1)' : 'none',
                        '&:hover': {
                          borderColor: 'rgba(191, 152, 83, 0.2)',
                        },
                        minHeight: '40px',
                        fontSize: '14px',
                      }),
                      placeholder: (provided) => ({
                        ...provided,
                        fontSize: '14px',
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        fontSize: '14px',
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isSelected ? 'transparent' : state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'transparent',
                        color: 'black',
                        '&:hover': {
                          backgroundColor: 'rgba(191, 152, 83, 0.1)',
                        },
                      }),
                    }}
                    isClearable
                    className='w-full sm:w-[263px] h-[40px] sm:h-[45px] focus:outline-none' />
                </div>
                {/* Amount */}
                <div className='sm:col-span-1'>
                  <label className='font-semibold block text-sm sm:text-base'>{fieldConfig.amountGivenLabel}</label>
                  {editFormData.type === 'Transfer' ? (
                    <Select
                      options={purposes}
                      value={purposes.find(purp => purp.id === editFormData.to_purpose_id) || null}
                      onChange={(selected) => setEditFormData({ ...editFormData, to_purpose_id: selected?.id || '' })}
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          borderWidth: '2px',
                          borderRadius: '8px',
                          borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'rgba(191, 152, 83, 0.2)',
                          boxShadow: state.isFocused ? '0 0 0 1px rgba(101, 102, 53, 0.1)' : 'none',
                          '&:hover': {
                            borderColor: 'rgba(191, 152, 83, 0.2)',
                          },
                          minHeight: '40px',
                          fontSize: '14px',
                        }),
                        placeholder: (provided) => ({
                          ...provided,
                          fontSize: '14px',
                        }),
                        singleValue: (provided) => ({
                          ...provided,
                          fontSize: '14px',
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isSelected ? 'transparent' : state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'transparent',
                          color: 'black',
                          '&:hover': {
                            backgroundColor: 'rgba(191, 152, 83, 0.1)',
                          },
                        }),
                      }}
                      isClearable
                      className='w-full sm:w-[263px] h-[40px] sm:h-[45px] focus:outline-none'
                      placeholder="Select purpose to..."
                    />
                  ) : (
                    <input
                      value={editFormData.type === 'Refund' ? formatWithCommas(editFormData.staff_refund_amount) : formatWithCommas(editFormData.amount)}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/,/g, "");
                        if (!isNaN(rawValue)) {
                          if (editFormData.type === "Refund") {
                            setEditFormData({ ...editFormData, staff_refund_amount: rawValue, amount: '' });
                          } else {
                            setEditFormData({ ...editFormData, amount: rawValue, staff_refund_amount: '' });
                          }
                        }
                      }}
                      className='w-full sm:w-[263px] h-[40px] sm:h-[45px] no-spinner border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                    />
                  )}
                </div>
                {/* Payment Mode */}
                <div className='sm:col-span-1'>
                  <label className='font-semibold block text-sm sm:text-base'>{fieldConfig.paymentModeLabel}</label>
                  {editFormData.type === 'Transfer' ? (
                    <input
                      value={formatWithCommas(editFormData.amount)}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/,/g, "");
                        if (!isNaN(rawValue)) {
                          setEditFormData({ ...editFormData, amount: rawValue });
                        }
                      }}
                      className='w-full sm:w-[263px] h-[40px] sm:h-[45px] no-spinner border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                      placeholder="Enter transfer amount"
                    />
                  ) : (
                    <select
                      value={editFormData.staff_payment_mode}
                      onChange={(e) => setEditFormData({ ...editFormData, staff_payment_mode: e.target.value })}
                      className='w-full sm:w-[263px] h-[40px] sm:h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'>
                      <option value=''>Select</option>
                      {paymentModeOptions && paymentModeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                {/* Description */}
                <div className='col-span-1 sm:col-span-2'>
                  <label className='font-semibold block text-sm sm:text-base'>Description</label>
                  <textarea
                    rows={2}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className='w-full sm:w-[590px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'>
                  </textarea>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-[#BF9853] w-full sm:w-[100px] h-[40px] sm:h-[45px] rounded text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-[#BF9853] w-full sm:w-[100px] h-[40px] sm:h-[45px] text-white rounded text-sm sm:text-base"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        <StaffAdvanceAuditModal 
          show={showHistoryModal} 
          onClose={() => setShowHistoryModal(false)} 
          audits={staffAdvanceAudits} 
          employees={employees}
          laboursList={laboursList}
          purposes={purposes} 
        />
      </div>
    </body>
  );
}

export default StaffDatabase
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

const StaffAdvanceAuditModal = ({ show, onClose, audits, employees, laboursList, purposes }) => {
  if (!show) return null;
  
  const getNameById = (id, options) => {
    if (!id && id !== 0) return "-";
    const found = options.find(opt => String(opt.id) === String(id));
    return found ? found.label : id;
  };

  const getEmployeeName = (id) => employees.find(e => e.id === id)?.label || id;
  const getLabourName = (id) => laboursList.find(l => l.id === id)?.label || id;
  const getPurposeName = (id) => purposes.find(p => p.id === id)?.label || id;

  const fields = [
    { oldKey: "old_date", newKey: "new_date", label: "Date", width: "120px" },
    { oldKey: "old_type", newKey: "new_type", label: "Type", width: "100px" },
    { oldKey: "old_employee_id", newKey: "new_employee_id", label: "Employee", width: "150px" },
    { oldKey: "old_labour_id", newKey: "new_labour_id", label: "Labour", width: "150px" },
    { oldKey: "old_from_purpose_id", newKey: "new_from_purpose_id", label: "Purpose", width: "150px" },
    { oldKey: "old_to_purpose_id", newKey: "new_to_purpose_id", label: "Transfer To", width: "150px" },
    { oldKey: "old_staff_payment_mode", newKey: "new_staff_payment_mode", label: "Mode", width: "100px" },
    { oldKey: "old_description", newKey: "new_description", label: "Description", width: "200px" },
    { oldKey: "old_amount", newKey: "new_amount", label: "Amount", width: "100px" },
    { oldKey: "old_staff_refund_amount", newKey: "new_staff_refund_amount", label: "Refund", width: "100px" },
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
    if (field.oldKey?.includes("employee_id") || field.newKey?.includes("employee_id")) {
      return value ? getEmployeeName(value) : "-";
    }
    if (field.oldKey?.includes("labour_id") || field.newKey?.includes("labour_id")) {
      return value ? getLabourName(value) : "-";
    }
    if (field.oldKey?.includes("purpose_id") || field.newKey?.includes("purpose_id")) {
      return value ? getPurposeName(value) : "-";
    }
    if (field.label.includes("Amount") || field.label.includes("Refund")) {
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
        {/* Scroll container for both vertical and horizontal overflow */}
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