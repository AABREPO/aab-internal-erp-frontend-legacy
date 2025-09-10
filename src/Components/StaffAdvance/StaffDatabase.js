import React, { useState, useEffect, useMemo, useRef } from 'react';
import jsPDF from "jspdf";
import "jspdf-autotable";
import Select from 'react-select';
import Filter from '../Images/filter (3).png'
import Reload from '../Images/rotate-right.png'
import edit from '../Images/Edit.svg';


const StaffDatabase = () => {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const [filterType, setFilterType] = useState(''); // "" means all types
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setEmployees(empData.map(e => ({ id: e.id, label: e.employee_name })));
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
  const getPurposeName = (id) => purposes.find(p => p.id === id)?.label || id;

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
        const employeeName = getEmployeeName(entry.employee_id) || "";
        if (employeeName.toLowerCase() !== selectEmployeeName.toLowerCase()) return false;
      }

      // Purpose filter
      if (selectPurpose) {
        const purposeName = getPurposeName(entry.from_purpose_id) || "";
        if (purposeName.toLowerCase() !== selectPurpose.toLowerCase()) return false;
      }

      // Transfer To filter
      if (selectTransferTo) {
        const transferToName = getPurposeName(entry.to_purpose_id) || "";
        if (transferToName.toLowerCase() !== selectTransferTo.toLowerCase()) return false;
      }

      // Type filter
      if (selectType) {
        if (entry.type?.toLowerCase() !== selectType.toLowerCase()) return false;
      }

      // Mode filter
      if (selectMode) {
        if (entry.staff_payment_mode?.toLowerCase() !== selectMode.toLowerCase()) return false;
      }

      return true; // passes all filters
    });
  }, [records, selectDate, selectEmployeeName, selectPurpose, selectTransferTo, selectType, selectMode]);

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
            aValue = getEmployeeName(a.employee_id);
            bValue = getEmployeeName(b.employee_id);
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
          default:
            return 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // Default sorting: Most recent entries first (by date descending)
      sortableData.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA; // Descending order (newest first)
      });
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
      formatDateOnly(entry.date),
      getEmployeeName(entry.employee_id),
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
      entry.entryNo
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
      formatDateOnly(entry.date),
      getEmployeeName(entry.employee_id),
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
      "", // Attached file col
      entry.entryNo
    ]);

    const csvString = [
      csvHeaders.join(","),
      ...csvRows.map(row =>
        row
          .map(value => `"${String(value).replace(/"/g, '""')}"`)
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
      from_purpose_id: entry.from_purpose_id || '',
      to_purpose_id: entry.to_purpose_id || '',
      entryNo: entry.entryNo || '',
      description: entry.description || '',
      type: entry.type || '',
      staff_payment_mode: entry.staff_payment_mode || '',
      staff_refund_amount: entry.staff_refund_amount || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      // Add your update logic here
      console.log('Updating record:', editFormData);
      // You can implement the actual update API call here
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Update error:', err);
    }
  };

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
      <div className='w-full max-w-[1750px] h-auto bg-white text-left flex  sm:flex-row gap-3 p-3 sm:p-5 mx-2 ml-10 mr-10'>
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
      <div className='w-full max-w-[1750px] bg-white mt-3 sm:mt-5 pt-3 sm:pt-5 mx-2 ml-10 mr-5'>
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
            className='overflow-auto max-h-[400px] sm:max-h-[600px]'
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
                    <span className="hidden sm:inline">Contractor/Vendor</span>
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
                  <th className="px-1 sm:px-2 min-w-[50px] sm:min-w-[60px] font-bold text-left text-xs sm:text-sm">E.No</th>
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
                        options={employees}
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
                        options={purposes}
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
                        options={purposes}
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
                        <option value='Advance'>Advance</option>
                        <option value='Transfer'>Transfer</option>
                        <option value='Refund'>Refund</option>
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
                        <option value='Cash'>Cash</option>
                        <option value='GPay'>GPay</option>
                        <option value='Net Banking'>Net Banking</option>
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
                        <span className="truncate block max-w-[120px] sm:max-w-[150px]" title={getEmployeeName(entry.employee_id)}>
                          {getEmployeeName(entry.employee_id)}
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
                        <button className="rounded-full transition duration-200 ml-1 sm:ml-2 mr-1 sm:mr-3">
                          <img
                            src={edit}
                            onClick={() => handleEditClick(entry)}
                            alt="Edit"
                            className="w-3 h-4 sm:w-4 sm:h-6 transform hover:scale-110 hover:brightness-110 transition duration-200"
                          />
                        </button>
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
          <div className="flex flex-col sm:flex-row justify-between items-center px-3 sm:px-5 py-3 sm:py-4 bg-white border-t border-gray-200 mx-2 sm:mx-0">
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
                    options={employees}
                    value={employees.find(emp => emp.id === editFormData.employee_id) || null}
                    onChange={(selected) => setEditFormData({ ...editFormData, employee_id: selected?.id || '' })}
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
                    }}
                  />
                </div>
                {/* Purpose */}
                <div className='sm:col-span-1'>
                  <label className='font-semibold block text-sm sm:text-base'>Purpose</label>
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
                    }}
                    isClearable
                    className='w-full sm:w-[263px] h-[40px] sm:h-[45px] focus:outline-none' />
                </div>
                {/* Amount */}
                <div className='sm:col-span-1'>
                  <label className='font-semibold block text-sm sm:text-base'>
                    {editFormData.type === 'Refund' ? 'Refund Amount' : 'Amount Given'}
                  </label>
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
                </div>
                {/* Payment Mode */}
                <div className='sm:col-span-1'>
                  <label className='font-semibold block text-sm sm:text-base'>Payment Mode</label>
                  <select
                    value={editFormData.staff_payment_mode}
                    onChange={(e) => setEditFormData({ ...editFormData, staff_payment_mode: e.target.value })}
                    className='w-full sm:w-[263px] h-[40px] sm:h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'>
                    <option value=''>Select</option>
                    <option value='Cash'>Cash</option>
                    <option value='GPay'>GPay</option>
                    <option value='Net Banking'>Net Banking</option>
                  </select>
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