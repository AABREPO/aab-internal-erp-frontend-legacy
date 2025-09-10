import React, { useState, useEffect, useRef } from 'react';
import jsPDF from "jspdf";
import "jspdf-autotable";
import Select from 'react-select';
import Filter from '../Images/filter (3).png'
import Reload from '../Images/rotate-right.png'
import edit from '../Images/Edit.svg';

const LoanTableview = ({ username, userRoles = [] }) => {
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [combinedOptions, setCombinedOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [siteOptions, setSiteOptions] = useState([]);
  const [loanData, setLoanData] = useState([]);
  const [selectDate, setSelectDate] = useState('');
  const [selectContractororVendorName, setSelectContractororVendorName] = useState('');
  const [selectProjectName, setSelectProjectName] = useState('');
  const [selectTransfer, setSelectTransfer] = useState('');
  const [selectType, setSelectType] = useState('');
  const [selectMode, setSelectMode] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [overallLoan, setOverallLoan] = useState(0);

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

  // Drag functionality for table scrolling
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

  // Helper functions
  const formatWithCommas = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

  // Calculate totals for loan data
  const totalLoanAmount = loanData.reduce(
    (sum, entry) => sum + (Number(entry.loan_amount) || 0),
    0
  );

  const totalPaidAmount = loanData.reduce(
    (sum, entry) => sum + (Number(entry.paid_amount) || 0),
    0
  );

  const totalRemainingAmount = totalLoanAmount - totalPaidAmount;

  // Data fetching and filtering logic
  useEffect(() => {
    return () => cancelMomentum();
  }, []);

  useEffect(() => {
    const fetchVendorNames = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/getAll", {
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
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchVendorNames();
  }, []);

  useEffect(() => {
    const fetchContractorNames = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/contractor_Names/getAll", {
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
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchContractorNames();
  }, []);

  useEffect(() => { 
    setCombinedOptions([...vendorOptions, ...contractorOptions]); 
  }, [vendorOptions, contractorOptions]);

  useEffect(() => {
    const fetchSites = async () => {
      try {
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
        setSiteOptions(formattedData);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchSites();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/loan_portal/getAll');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setLoanData(data);
      } catch (error) {
        console.error('Error fetching loan portal data:', error);
      }
    };
    fetchData();
  }, []);

  const clearFilters = () => {
    setSelectDate('');
    setSelectContractororVendorName('');
    setSelectProjectName('');
    setSelectTransfer('');
    setSelectType('');
    setSelectMode('');
  };

  // Filtered data based on selected filters
  const filteredData = loanData.filter((entry) => {
    // Date filter
    if (selectDate) {
      const [year, month, day] = selectDate.split("-");
      const formattedSelectDate = `${parseInt(day)}-${parseInt(month)}-${year}`;
      const entryDateObj = new Date(entry.date);
      const formattedEntryDate = `${entryDateObj.getDate()}-${entryDateObj.getMonth() + 1}-${entryDateObj.getFullYear()}`;
      if (formattedEntryDate !== formattedSelectDate) return false;
    }
    // Contractor/Vendor filter
    if (selectContractororVendorName) {
      const name =
        entry.vendor_id
          ? getVendorName(entry.vendor_id)
          : getContractorName(entry.contractor_id) || "";
      if (name.toLowerCase() !== selectContractororVendorName.toLowerCase())
        return false;
    }
    // Project Name filter
    if (selectProjectName) {
      const projectName = getSiteName(entry.project_id) || "";
      if (projectName.toLowerCase() !== selectProjectName.toLowerCase())
        return false;
    }
    // Type filter
    if (selectType) {
      if (entry.loan_type?.toLowerCase() !== selectType.toLowerCase()) return false;
    }
    // Mode filter
    if (selectMode) {
      if (entry.payment_mode?.toLowerCase() !== selectMode.toLowerCase()) return false;
    }
    return true;
  });

  // Sorting functionality
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedData = React.useMemo(() => {
    let sortableData = [...filteredData];

    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        let aValue, bValue;

        switch (sortConfig.key) {
          case 'date':
            aValue = new Date(a.date);
            bValue = new Date(b.date);
            break;
          case 'vendor':
            aValue = a.vendor_id ? getVendorName(a.vendor_id) : getContractorName(a.contractor_id);
            bValue = b.vendor_id ? getVendorName(b.vendor_id) : getContractorName(b.contractor_id);
            break;
          case 'project':
            aValue = getSiteName(a.project_id);
            bValue = getSiteName(b.project_id);
            break;
          case 'type':
            aValue = a.loan_type || '';
            bValue = b.loan_type || '';
            break;
          case 'mode':
            aValue = a.payment_mode || '';
            bValue = b.payment_mode || '';
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // Default sorting: Most recent entries first
      sortableData.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });
    }

    return sortableData;
  }, [filteredData, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectDate, selectContractororVendorName, selectProjectName, selectType, selectMode]);

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
    setCurrentPage(1);
  };

  // Export functionality
  const exportPDF = () => {
    const doc = new jsPDF("l", "pt", "a4"); 
    const headers = [
      [
        "S.No",
        "Date",
        "Contractor/Vendor",
        "Project Name",
        "Loan Amount",
        "Paid Amount",
        "Remaining Amount",
        "Loan Type",
        "Description",
        "Payment Mode",
        "E.No"
      ]
    ];
    
    const rows = sortedData.map((entry, index) => [
      index + 1,
      formatDateOnly(entry.date),
      entry.vendor_id
        ? getVendorName(entry.vendor_id)
        : getContractorName(entry.contractor_id),
      getSiteName(entry.project_id),
      entry.loan_amount != null && entry.loan_amount !== ""
        ? Number(entry.loan_amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.paid_amount != null && entry.paid_amount !== ""
        ? Number(entry.paid_amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      (Number(entry.loan_amount) - Number(entry.paid_amount)).toLocaleString("en-US", { maximumFractionDigits: 0 }),
      entry.loan_type,
      entry.description,
      entry.payment_mode,
      entry.entry_no
    ]);
    
    doc.setFontSize(12);
    doc.text("Loan Data Table", 40, 30);
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

    doc.save("LoanData.pdf");
  };

  const exportCSV = () => {
    const csvHeaders = [
      "S.No",
      "Date",
      "Contractor/Vendor",
      "Project Name",
      "Loan Amount",
      "Paid Amount",
      "Remaining Amount",
      "Loan Type",
      "Description",
      "Payment Mode",
      "E.No"
    ];

    const csvRows = sortedData.map((entry, index) => [
      index + 1,
      formatDateOnly(entry.date),
      entry.vendor_id
        ? getVendorName(entry.vendor_id)
        : getContractorName(entry.contractor_id),
      getSiteName(entry.project_id),
      entry.loan_amount != null && entry.loan_amount !== ""
        ? Number(entry.loan_amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.paid_amount != null && entry.paid_amount !== ""
        ? Number(entry.paid_amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      (Number(entry.loan_amount) - Number(entry.paid_amount)).toLocaleString("en-US", { maximumFractionDigits: 0 }),
      entry.loan_type,
      entry.description,
      entry.payment_mode,
      entry.entry_no
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
    link.setAttribute("download", "LoanData.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <body>
      {/* Summary Cards */}
      <div className='w-[1750px] h-[150px] bg-white ml-10 text-left flex gap-5'>
        <div className='ml-8 pt-8'>
          <label className='block mb-2 font-semibold'>Loan Amount</label>
          <input
            className='w-[183px] h-[45px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2'
            value={`₹${totalLoanAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            readOnly
          />
        </div>
        <div className='ml-8 pt-8'>
          <label className='block mb-2 font-semibold'>Transfer Amount</label>
          <input
            className='w-[183px] h-[45px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2'
            value={`₹${totalPaidAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            readOnly
          />
        </div>
        <div className='ml-8 pt-8'>
          <label className='block mb-2 font-semibold'>Refund Amount</label>
          <input
            className='w-[220px] h-[45px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2'
            value={`₹${totalRemainingAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            readOnly
          />
        </div>
      </div>
      
      {/* Table Container */}
      <div className='w-[1750px] ml-10 bg-white mt-5 pt-5'>
        <div
          className={`text-left flex ${selectDate || selectContractororVendorName || selectProjectName || selectType || selectMode
            ? 'flex-col sm:flex-row sm:justify-between'
            : 'flex-row justify-between items-center'
            } mb-3 gap-2`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
            <button className='pl-2' onClick={() => setShowFilters(!showFilters)}>
              <img
                src={Filter}
                alt="Toggle Filter"
                className="w-7 h-7 border border-[#BF9853] rounded-md ml-3"
              />
            </button>
            {(selectDate || selectContractororVendorName || selectProjectName || selectType || selectMode) && (
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-2 sm:mt-0">
                {selectDate && (
                  <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium w-fit">
                    <span className="font-normal">Date: </span>
                    <span className="font-bold">{selectDate}</span>
                    <button onClick={() => setSelectDate('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                  </span>
                )}
                {selectContractororVendorName && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Contractor/Vendor Name: </span>
                    <span className="font-bold">{selectContractororVendorName}</span>
                    <button onClick={() => setSelectContractororVendorName('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectProjectName && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Project Name:</span>
                    <span className="font-bold">{selectProjectName}</span>
                    <button onClick={() => setSelectProjectName('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectType && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Type: </span>
                    <span className="font-bold">{selectType}</span>
                    <button onClick={() => setSelectType('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectMode && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Mode: </span>
                    <span className="font-bold">{selectMode}</span>
                    <button onClick={() => setSelectMode('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
              </div>
            )}
          </div>
          <div className='space-x-4 flex justify-end mr-4'>
            <button onClick={exportPDF} className='text-sm text-[#E4572E] hover:underline font-bold'>Export PDF</button>
            <button onClick={exportCSV} className='text-sm text-[#007233] hover:underline font-bold'>Export XL</button>
            <button className='text-sm text-[#BF9853] hover:underline font-bold'>Print</button>
          </div>
        </div>
        <div className='border-l-8 border-l-[#BF9853] rounded-lg ml-5 mr-5'>
          {/* Single Table with Scrollable Container */}
          <div
            ref={scrollRef}
            className='overflow-auto max-h-[600px]'
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <table className="w-[1955px] border-collapse">
              <thead className="sticky top-0 z-10 bg-white ">
                <tr className="bg-[#FAF6ED]">
                  <th
                    className="pt-2 pl-3 w-44 font-bold text-left cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('date')}
                  >
                    Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-2 w-[220px] font-bold text-left cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('vendor')}
                  >
                    Contractor/Vendor {sortConfig.key === 'vendor' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="px-2 w-[300px] font-bold text-left cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('project')}
                  >
                    Project Name {sortConfig.key === 'project' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-2 w-[120px] font-bold text-left">Loan Amount</th>
                  <th className="px-2 w-[170px] font-bold text-left">Paid Amount</th>
                  <th className="px-2 w-[120px] font-bold text-left">Remaining</th>
                  <th
                    className="px-2 w-[120px] font-bold text-left cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort('type')}
                  >
                    Loan Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-2 w-[120px] font-bold text-left">Description</th>
                  <th
                    className="px-2 w-[220px] font-bold text-left cursor-pointer hover:bg-gray-200 pl-3"
                    onClick={() => handleSort('mode')}
                  >
                    Mode {sortConfig.key === 'mode' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-2 w-[80px] font-bold text-left">E.No</th>
                  <th className="px-2 w-[120px] font-bold text-left">Activity</th>
                </tr>
                {showFilters && (
                  <tr className="bg-white border-b border-gray-200">
                    <th className="pt-2 pb-2 w-44">
                      <input
                        type="date"
                        value={selectDate}
                        onChange={(e) => setSelectDate(e.target.value)}
                        className="p-1 rounded-md bg-transparent w-32 border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none mr-10"
                        placeholder="Search Date..."
                      />
                    </th>
                    <th className="pt-2 pb-2 w-[220px]">
                      <Select
                        options={combinedOptions}
                        value={selectContractororVendorName ? { value: selectContractororVendorName, label: selectContractororVendorName } : null}
                        onChange={(opt) => setSelectContractororVendorName(opt ? opt.value : "")}
                        className="text-xs focus:outline-none"
                        placeholder="Contractor/Ven..."
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
                          }),
                          placeholder: (provided) => ({
                            ...provided,
                            color: '#999',
                            textAlign: 'left',
                          }),
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9,
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            textAlign: 'left',
                            fontWeight: 'normal',
                            fontSize: '15px',
                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                            color: 'black',
                          }),
                          singleValue: (provided) => ({
                            ...provided,
                            textAlign: 'left',
                            fontWeight: 'normal',
                            color: 'black',
                          }),
                        }}
                      />
                    </th>
                    <th className="pt-2 pb-2 w-[300px]">
                      <Select
                        options={siteOptions}
                        value={selectProjectName ? { value: selectProjectName, label: selectProjectName } : null}
                        onChange={(opt) => setSelectProjectName(opt ? opt.value : "")}
                        className="focus:outline-none text-xs"
                        placeholder="Project Name..."
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
                          }),
                          placeholder: (provided) => ({
                            ...provided,
                            color: '#999',
                            textAlign: 'left',
                          }),
                          menu: (provided) => ({
                            ...provided,
                            zIndex: 9,
                          }),
                          option: (provided, state) => ({
                            ...provided,
                            textAlign: 'left',
                            fontWeight: 'normal',
                            fontSize: '15px',
                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                            color: 'black',
                          }),
                          singleValue: (provided) => ({
                            ...provided,
                            textAlign: 'left',
                            fontWeight: 'normal',
                            color: 'black',
                          }),
                        }}
                      />
                    </th>
                    <th className=' pt-2 pb-2'></th>
                    <th className=' pt-2 pb-2'></th>
                    <th className=' pt-2 pb-2'></th>
                    <th className="pt-2 pb-2">
                      <select
                        value={selectType}
                        onChange={(e) => setSelectType(e.target.value)}
                        className="p-1 rounded-md bg-transparent w-[120px] h-[42px] font-normal border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none text-xs"
                        placeholder="Type..."
                      >
                        <option value=''>Select Type...</option>
                        <option value='Personal Loan'>Personal Loan</option>
                        <option value='Business Loan'>Business Loan</option>
                        <option value='Home Loan'>Home Loan</option>
                        <option value='Vehicle Loan'>Vehicle Loan</option>
                      </select>
                    </th>
                    <th className="pt-2 pb-2"></th>
                    <th className="pt-2 pb-2">
                      <select
                        value={selectMode}
                        onChange={(e) => setSelectMode(e.target.value)}
                        className="p-1 rounded-md bg-transparent w-[120px] h-[42px] font-normal border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none text-xs"
                        placeholder="Mode..."
                      >
                        <option value=''>Select</option>
                        <option value='Cash'>Cash</option>
                        <option value='GPay'>GPay</option>
                        <option value='Net Banking'>Net Banking</option>
                      </select>
                    </th>
                    <th className=' pt-2 pb-2'></th>
                    <th className=' pt-2 pb-2'></th>
                  </tr>
                )}
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((entry) => (
                    <tr key={entry.id} className="odd:bg-white even:bg-[#FAF6ED]">
                      <td className="text-sm text-left p-2 w-44 font-semibold">{formatDateOnly(entry.date)}</td>
                      <td className="text-sm text-left w-[250px] font-semibold">
                        {entry.vendor_id
                          ? getVendorName(entry.vendor_id)
                          : getContractorName(entry.contractor_id)}
                      </td>
                      <td className="text-sm text-left w-[420px] font-semibold">
                        {getSiteName(entry.project_id)}
                      </td>
                      <td className="text-sm text-left pl-2 w-[140px] font-semibold">
                        {entry.loan_amount != null && entry.loan_amount !== ""
                          ? Number(entry.loan_amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
                          : ""}
                      </td>
                      <td className="text-sm text-left pl-2 font-semibold w-[220px]">
                        {entry.paid_amount != null && entry.paid_amount !== ""
                          ? Number(entry.paid_amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
                          : ""}
                      </td>
                      <td className="text-sm text-left pl-2 font-semibold w-[150px]">
                        {(Number(entry.loan_amount) - Number(entry.paid_amount)).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </td>
                      <td className="text-sm text-left font-semibold w-[200px]">{entry.loan_type}</td>
                      <td className="text-sm text-left font-semibold w-[140px]">{entry.description}</td>
                      <td className="text-sm text-left font-semibold w-[300px] pl-3">{entry.payment_mode}</td>
                      <td className="text-sm text-left pl-3 font-semibold w-[90px]">{entry.entry_no}</td>
                      <td className="flex py-2 w-[150px]">
                        <button className="rounded-full transition duration-200 ml-2 mr-3">
                          <img
                            src={edit}
                            onClick={() => {
                              setEditingId(entry.loanPortalId || entry.id);
                              setEditFormData({
                                date: entry.date?.split('T')[0] || '',
                                loan_amount: entry.loan_amount || '',
                                paid_amount: entry.paid_amount || '',
                                project_id: entry.project_id || '',
                                vendor_id: entry.vendor_id || '',
                                contractor_id: entry.contractor_id || '',
                                entry_no: entry.entry_no || '',
                                description: entry.description || '',
                                loan_type: entry.loan_type || '',
                                payment_mode: entry.payment_mode || ''
                              });
                              setIsEditModalOpen(true);
                            }}
                            alt="Edit"
                            className=" w-4 h-6 transform hover:scale-110 hover:brightness-110 transition duration-200 "
                          />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-2 text-center text-sm text-gray-400" colSpan={11}>
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
          <div className="flex flex-col sm:flex-row justify-between items-center px-5 py-4 bg-white border-t border-gray-200">
            {/* Items per page selector */}
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <label className="text-sm font-medium text-gray-700">Show:</label>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
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

            {/* Page info */}
            <div className="text-sm text-gray-700 mb-4 sm:mb-0">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} entries
            </div>

            {/* Pagination buttons */}
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

              {/* Page numbers */}
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
        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-[700px]">
              <h2 className="text-lg font-bold mb-4">Edit Loan Entry</h2>
              <div className='grid grid-cols-2 gap-4 text-left ml-5'>
                {/* Date */}
                <div className='flex items-center gap-3'>
                  <label className='font-semibold text-[#E4572E]'>Date</label>
                  <input
                    type='date'
                    placeholder='dd-mm-yyyy'
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className='w-[144px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'
                  />
                </div>
                {/* Contractor/Vendor */}
                <div className=''>
                  <div className='flex'>
                    <label className='font-semibold block'>Contractor/Vendor</label>
                  </div>
                  <Select
                    options={combinedOptions}
                    value={selectedOption}
                    onChange={(opt) => setSelectedOption(opt)}
                    className='w-[263px] h-[45px] rounded-lg focus:outline-none'
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
                        }
                      }),
                    }}
                  />
                </div>
                {/* Project Name */}
                <div>
                  <label className='font-semibold block'>Project Name</label>
                  <Select
                    options={siteOptions || []}
                    placeholder="Select a site..."
                    isSearchable={true}
                    value={siteOptions.find(site => site.id === editFormData.project_id) || null}
                    onChange={(selected) => setEditFormData({ ...editFormData, project_id: selected?.id || '' })}
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderWidth: '2px',
                        borderRadius: '8px',
                        borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'rgba(191, 152, 83, 0.2)',
                        boxShadow: state.isFocused ? '0 0 0 1px rgba(101, 102, 53, 0.1)' : 'none',
                        '&:hover': {
                          borderColor: 'rgba(191, 152, 83, 0.2)',
                        }
                      }),
                    }}
                    isClearable
                    className='w-[263px] h-[45px] focus:outline-none' />
                </div>
                {/* Loan Amount */}
                <div>
                  <label className='font-semibold block'>Loan Amount</label>
                  <input
                    value={formatWithCommas(editFormData.loan_amount)}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/,/g, "");
                      if (!isNaN(rawValue)) {
                        setEditFormData({ ...editFormData, loan_amount: rawValue });
                      }
                    }}
                    className='w-[263px] h-[45px] no-spinner border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'
                  />
                </div>
                {/* Paid Amount */}
                <div>
                  <label className='font-semibold block'>Paid Amount</label>
                  <input
                    value={formatWithCommas(editFormData.paid_amount)}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/,/g, "");
                      if (!isNaN(rawValue)) {
                        setEditFormData({ ...editFormData, paid_amount: rawValue });
                      }
                    }}
                    className='w-[263px] h-[45px] no-spinner border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'
                  />
                </div>
                {/* Loan Type */}
                <div>
                  <label className='font-semibold block'>Loan Type</label>
                  <select
                    value={editFormData.loan_type}
                    onChange={(e) => setEditFormData({ ...editFormData, loan_type: e.target.value })}
                    className='w-[263px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'>
                    <option value=''>Select Type...</option>
                    <option value='Personal Loan'>Personal Loan</option>
                    <option value='Business Loan'>Business Loan</option>
                    <option value='Home Loan'>Home Loan</option>
                    <option value='Vehicle Loan'>Vehicle Loan</option>
                  </select>
                </div>
                {/* Payment Mode */}
                <div>
                  <label className='font-semibold block'>Payment Mode</label>
                  <select
                    value={editFormData.payment_mode}
                    onChange={(e) => setEditFormData({ ...editFormData, payment_mode: e.target.value })}
                    className='w-[263px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'>
                    <option value=''>Select</option>
                    <option value='Cash'>Cash</option>
                    <option value='GPay'>GPay</option>
                    <option value='Net Banking'>Net Banking</option>
                  </select>
                </div>
                {/* Description */}
                <div className='col-span-2'>
                  <label className='font-semibold block'>Description</label>
                  <textarea
                    rows={2}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className='w-[590px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none'>
                  </textarea>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-[#BF9853] w-[100px] h-[45px] rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {/* handleUpdate() */}}
                  className="px-4 py-2 bg-[#BF9853] w-[100px] h-[45px] text-white rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
    </body>
  )
}

export default LoanTableview
