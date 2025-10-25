import React, { useState, useEffect, useRef, useMemo } from 'react';
import jsPDF from "jspdf";
import "jspdf-autotable";
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Filter from '../Images/filter (3).png'
import Reload from '../Images/rotate-right.png'
import edit from '../Images/Edit.svg';
const LoanDatabase = ({ username, userRoles = [] }) => {   
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
  const [editSelectedType, setEditSelectedType] = useState('Loan');
  const [editSelectedOption, setEditSelectedOption] = useState(null);
  const [editSelectedSite, setEditSelectedSite] = useState(null);
  const [editPurpose, setEditPurpose] = useState('');
  const [editTransferSelection, setEditTransferSelection] = useState(null);
  const [editAmountGiven, setEditAmountGiven] = useState('');
  const [editTransferAmount, setEditTransferAmount] = useState('');
  const [editPaymentMode, setEditPaymentMode] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [combinedSitePurposeOptions, setCombinedSitePurposeOptions] = useState([]);
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
  const handleEditTransferAmountChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (!isNaN(rawValue)) {
      setEditTransferAmount(rawValue);
    }
  };
  const formatDateOnly = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  const purposeOptions = useMemo(() => [
    { value: 'Machine Loan', label: 'Machine Loan', id: 1, type: 'Purpose' },
    { value: 'Material Loan', label: 'Material Loan', id: 2, type: 'Purpose' },
    { value: 'Equipment Loan', label: 'Equipment Loan', id: 3, type: 'Purpose' },
    { value: 'Working Capital', label: 'Working Capital', id: 4, type: 'Purpose' },
    { value: 'Other', label: 'Other', id: 5, type: 'Purpose' }
  ], []);

  const paymentModeOptions = useMemo(() => [
    { id: 1, value: 'Cash', label: 'Cash' },
    { id: 2, value: 'GPay', label: 'GPay' },
    { id: 3, value: 'Net Banking', label: 'Net Banking' },
    { id: 4, value: 'Cheque', label: 'Cheque' },
    { id: 5, value: 'Advance Transfer', label: 'Advance Transfer' }
  ], []);

  // Custom styles for Select components in edit modal
  const customStyles = useMemo(() => ({
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
  }), []);
  const getVendorName = (id) =>
    vendorOptions.find(v => v.id === id)?.value || "";
  const getContractorName = (id) =>
    contractorOptions.find(c => c.id === id)?.value || "";
  const getSiteName = (id) =>
    siteOptions.find(s => String(s.id) === String(id))?.value || "";
  const totalLoanAmount = loanData
    .filter(entry => entry.type === "Loan")
    .reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  const totalTransferAmount = loanData
    .filter(entry => entry.type === "Transfer")
    .reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  const totalRefundAmount = loanData
    .filter(entry => entry.type === "Refund")
    .reduce((sum, entry) => sum + (Number(entry.loan_refund_amount) || 0), 0);
  const totalPaidAmount = loanData
    .reduce((sum, entry) => sum + (Number(entry.paid_amount) || 0), 0);
  const totalRemainingAmount = totalLoanAmount - totalPaidAmount;
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

  // Combine site and purpose options for edit modal
  useEffect(() => {
    setCombinedSitePurposeOptions([...siteOptions, ...purposeOptions]);
  }, [siteOptions, purposeOptions]);
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
          sNo: item.siteNo,
          type: 'Site',
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
        const response = await fetch('https://backendaab.in/aabuildersDash/api/loans/all');
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

  const handleUpdate = async () => {
    try {

      const payload = {
        loanPortalId: editingId,
        type: editSelectedType,
        date: editFormData.date,
        amount: (editSelectedType === "Loan" || editSelectedType === "Transfer")
          ? parseFloat(editFormData.loan_amount || 0)
          : 0,
        loan_refund_amount: editSelectedType === "Refund"
          ? parseFloat(editFormData.loan_refund_amount || 0)
          : 0,
        loan_payment_mode: editPaymentMode || "",
        from_purpose_id: editPurpose || 0,
        to_purpose_id: (editSelectedType === "Transfer" && editTransferSelection.type === "Purpose")
          ? (editTransferSelection?.id || 0)
          : 0,
        vendor_id: editSelectedOption?.type === "Vendor" ? editSelectedOption.id : 0,
        contractor_id: editSelectedOption?.type === "Contractor" ? editSelectedOption.id : 0,
        project_id: editFormData.project_id || 0,
        transfer_Project_id: (editSelectedType === "Transfer" && editTransferSelection.type === "Site")
          ? (editTransferSelection?.id || 0)
          : 0,
        entry_no: editFormData.entry_no || 0,
        description: editDescription || "",

      };
      const res = await fetch(
        `https://backendaab.in/aabuildersDash/api/loans/${editingId}?editedBy=${username}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      window.location.reload();
      if (!res.ok) throw new Error('Failed to update');
      const updatedDataArray = await res.json();
      setLoanData(prev => {
        const newData = [...prev];
        updatedDataArray.forEach(entry => {
          const idx = newData.findIndex(item => item.loanPortalId === entry.loanPortalId);
          if (idx === -1) newData.push(entry);
          else newData[idx] = entry;
        });
        return newData;
      });
      setIsEditModalOpen(false);
      toast.success("Entry updated successfully!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to update entry!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };
  return (
    <body>
      <div className='max-w-[95vw] min-h-[128px] bg-white mx-auto px-4 py-4 text-left flex flex-wrap gap-4'>
        <div className=''>
          <label className='block mb-2 font-semibold'>Loan Amount</label>
          <input
            className='w-[180px] h-[45px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2'
            value={`₹${totalLoanAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            readOnly
          />
        </div>
        <div className=''>
          <label className='block mb-2 font-semibold'>Transfer Amount</label>
          <input
            className='w-[220px] h-[45px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2'
            value={`₹${totalTransferAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            readOnly
          />
        </div>
        <div className=''>
          <label className='block mb-2 font-semibold'>Refund Amount</label>
          <input
            className='w-[220px] h-[45px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2'
            value={`₹${totalRefundAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
            readOnly
          />
        </div>
      </div>
      <div className='max-w-[95vw] mx-auto bg-white mt-5 pt-5'>
        <div
          className={`text-left flex ${selectDate || selectContractororVendorName || selectProjectName || selectType || selectMode
            ? 'flex-col sm:flex-row sm:justify-between'
            : 'flex-row justify-between items-center'
            } mb-3 gap-2`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
            <button className='pl-2' onClick={() => setShowFilters(!showFilters)}>
              <img src={Filter} alt="Toggle Filter" className="w-7 h-7 border border-[#BF9853] rounded-md ml-3" />
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
        <div className='border-l-8 border-l-[#BF9853] rounded-lg mx-5'>
          <div ref={scrollRef} className='overflow-auto max-h-[600px]'
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
          >
            <table className="w-full min-w-[1500px] border-collapse">
              <thead className="sticky top-0 z-10 bg-white ">
                <tr className="bg-[#FAF6ED] h-12">
                  <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[120px] font-bold text-left">Timestamp</th>
                  <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[140px] font-bold text-left cursor-pointer hover:bg-gray-200" onClick={() => handleSort('date')}>
                    Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[180px] font-bold text-left cursor-pointer hover:bg-gray-200" onClick={() => handleSort('vendor')}>
                    Associate {sortConfig.key === 'vendor' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[200px] font-bold text-left cursor-pointer hover:bg-gray-200" onClick={() => handleSort('project')}>
                    Purpose {sortConfig.key === 'project' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[120px] font-bold text-left whitespace-nowrap">Transfer To</th>
                  <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[140px] font-bold text-right">Loan</th>
                  <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[120px] font-bold text-right">Refund</th>
                  <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[100px] font-bold text-left cursor-pointer hover:bg-gray-200" onClick={() => handleSort('type')}>
                    Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[120px] font-bold text-left">Description</th>
                  <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[180px] font-bold text-left cursor-pointer hover:bg-gray-200" onClick={() => handleSort('mode')}>
                    Mode {sortConfig.key === 'mode' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[80px] font-bold text-left">E.No</th>
                  <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[100px] font-bold text-left">Activity</th>
                </tr>
                {showFilters && (
                  <tr className="bg-white border-b border-gray-200 h-12">
                    <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[120px]"></th>
                    <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[140px]">
                      <input
                        type="date"
                        value={selectDate}
                        onChange={(e) => setSelectDate(e.target.value)}
                        className="p-1 rounded-md bg-transparent w-full max-w-[130px] border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none"
                        placeholder="Search Date..."
                      />
                    </th>
                    <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[180px]">
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
                    <th className="pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[200px]">
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
                    <th className='pl-4 pr-4 lg:pl-6 lg:pr-6'></th>
                    <th className='pl-4 pr-4 lg:pl-6 lg:pr-6'></th>
                    <th className='pl-4 pr-4 lg:pl-6 lg:pr-6'></th>
                    <th className="pl-4 pr-4 lg:pl-6 lg:pr-6">
                      <select
                        value={selectType}
                        onChange={(e) => setSelectType(e.target.value)}
                        className="p-1 rounded-md bg-transparent w-full max-w-[120px] h-[42px] font-normal border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none text-xs"
                        placeholder="Type..."
                      >
                        <option value=''>Select Type...</option>
                        <option value='Personal Loan'>Personal Loan</option>
                        <option value='Business Loan'>Business Loan</option>
                        <option value='Home Loan'>Home Loan</option>
                        <option value='Vehicle Loan'>Vehicle Loan</option>
                      </select>
                    </th>
                    <th className="pl-4 pr-4 lg:pl-6 lg:pr-6"></th>
                    <th className="pl-4 pr-4 lg:pl-6 lg:pr-6">
                      <select
                        value={selectMode}
                        onChange={(e) => setSelectMode(e.target.value)}
                        className="p-1 rounded-md bg-transparent w-full max-w-[120px] h-[42px] font-normal border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none text-xs"
                        placeholder="Mode..."
                      >
                        <option value=''>Select</option>
                        <option value='Cash'>Cash</option>
                        <option value='GPay'>GPay</option>
                        <option value='Net Banking'>Net Banking</option>
                      </select>
                    </th>
                    <th className='pl-4 pr-4 lg:pl-6 lg:pr-6'></th>
                    <th className='pl-4 pr-4 lg:pl-6 lg:pr-6'></th>
                  </tr>
                )}
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((entry) => (
                    <tr key={entry.loanPortalId || entry.id} className="odd:bg-white even:bg-[#FAF6ED] h-12">
                      <td className="text-sm text-left pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[120px] font-semibold">{formatDate(entry.timestamp)}</td>
                      <td className="text-sm text-left pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[140px] font-semibold">{formatDateOnly(entry.date)}</td>
                      <td className="text-sm text-left pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[180px] font-semibold">
                        {entry.vendor_id ? getVendorName(entry.vendor_id) : getContractorName(entry.contractor_id)}
                      </td>
                      <td className="text-sm text-left pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[200px] font-semibold">
                        {purposeOptions.find(p => p.id === entry.from_purpose_id)?.value || entry.from_purpose_id}
                      </td>
                      <td className="text-sm text-left pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[120px] font-semibold">
                        {entry.type === "Transfer" ? (
                          entry.to_purpose_id
                            ? purposeOptions.find(purpose => purpose.id === entry.to_purpose_id)?.value || ""
                            : siteOptions.find(site => site.id === entry.transfer_Project_id)?.value || ""
                        ) : (
                          ""
                        )}
                      </td>
                      <td className="text-sm text-right pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[140px] font-semibold">
                        {(entry.type === "Loan" || entry.type === "Transfer") && entry.amount
                          ? Number(entry.amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
                          : ""}
                        {entry.type === "Refund" ? "-" : ""}
                      </td>
                      <td className="text-sm text-right pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[120px] font-semibold">
                        {entry.type === "Refund" && entry.loan_refund_amount
                          ? Number(entry.loan_refund_amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
                          : ""}
                      </td>
                      <td className="text-sm text-left pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[100px] font-semibold">{entry.type}</td>
                      <td className="text-sm text-left pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[120px] font-semibold">{entry.description}</td>
                      <td className="text-sm text-left pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[180px] font-semibold">
                        {paymentModeOptions.find(opt => opt.value === entry.loan_payment_mode)?.label || entry.loan_payment_mode || ''}
                      </td>
                      <td className="text-sm text-left pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[80px] font-semibold">{entry.entry_no}</td>
                      <td className="flex py-2 pl-4 pr-4 lg:pl-6 lg:pr-6 min-w-[100px] justify-center">
                        <button className="rounded-full transition duration-200">
                          <img
                            src={edit}
                            alt="Edit"
                            className="w-4 h-6 transform hover:scale-110 hover:brightness-110 transition duration-200"
                            onClick={() => {
                              setEditingId(entry.loanPortalId || entry.id);
                              setEditFormData({
                                date: entry.date?.split('T')[0] || '',
                                loan_amount: entry.amount || '',
                                loan_refund_amount: entry.loan_refund_amount || '',
                                paid_amount: entry.paid_amount || '',
                                project_id: entry.project_id || '',
                                vendor_id: entry.vendor_id || '',
                                contractor_id: entry.contractor_id || '',
                                entry_no: entry.entry_no || '',
                                description: entry.description || '',
                                loan_type: entry.loan_type || '',
                                payment_mode: entry.loan_payment_mode || ''
                              });
                              setEditSelectedType(entry.type || 'Loan');
                              setEditSelectedOption(
                                entry.vendor_id
                                  ? vendorOptions.find(v => v.id === entry.vendor_id)
                                  : entry.contractor_id
                                    ? contractorOptions.find(c => c.id === entry.contractor_id)
                                    : null
                              );
                              setEditSelectedSite(siteOptions.find(s => s.id === entry.project_id) || null);
                              setEditPurpose(entry.from_purpose_id || '');
                              const transferOption = entry.to_purpose_id
                                ? purposeOptions.find(p => p.id === entry.to_purpose_id)
                                : entry.transfer_Project_id
                                  ? siteOptions.find(s => s.id === entry.transfer_Project_id)
                                  : null;

                              setEditTransferSelection(transferOption || null);
                              setEditAmountGiven(entry.amount || '');
                              setEditTransferAmount(entry.amount || '');
                              setEditPaymentMode(entry.loan_payment_mode || '');
                              setEditDescription(entry.description || '');
                              setIsEditModalOpen(true);
                            }}
                          />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="h-12">
                    <td className="pl-6 pr-6 text-center text-sm text-gray-400" colSpan={12}>
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {sortedData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-5 py-4 bg-white border-t border-gray-200">
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
                    <button key={pageNum} onClick={() => goToPage(pageNum)}
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
              <button onClick={goToNextPage} disabled={currentPage === totalPages}
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
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-[800px] max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold mb-4">Edit Loan Entry</h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-left'>
                <div className='space-y-2'>
                  <label className='font-semibold text-[#E4572E] text-sm sm:text-base'>Select Type</label>
                  <select value={editSelectedType} onChange={(e) => setEditSelectedType(e.target.value)}
                    className='w-full h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                  >
                    <option value='Loan'>Loan</option>
                    <option value='Refund'>Refund</option>
                    <option value='Transfer'>Transfer</option>
                  </select>
                </div>
                <div className='space-y-2'>
                  <label className='font-semibold text-[#E4572E] text-sm sm:text-base'>Date</label>
                  <input
                    type='date'
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className='w-full h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='font-semibold block text-sm sm:text-base'>Associate</label>
                  <Select
                    options={combinedOptions}
                    value={editSelectedOption}
                    onChange={setEditSelectedOption}
                    className='w-full rounded-lg focus:outline-none'
                    isClearable
                    styles={customStyles}
                  />
                </div>
                <div className='space-y-2'>
                  <label className='font-semibold block text-sm sm:text-base'>Purpose</label>
                  <select
                    value={editPurpose}
                    onChange={(e) => setEditPurpose(e.target.value)}
                    className='w-full h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                  >
                    <option value=''>Select Purpose</option>
                    {purposeOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='space-y-2'>
                  <label className='font-semibold block text-sm sm:text-base'>
                    {editSelectedType === 'Transfer' ? 'Transfer To' :
                      editSelectedType === 'Refund' ? 'Amount' : 'Amount Given'}
                  </label>
                  {editSelectedType === 'Transfer' ? (
                    <Select
                      options={combinedSitePurposeOptions}
                      value={editTransferSelection}
                      onChange={(selected) => setEditTransferSelection(selected || null)}
                      className='w-full rounded-lg focus:outline-none'
                      isClearable
                      styles={customStyles}
                      placeholder="Select Transfer To"
                    />
                  ) : editSelectedType === 'Refund' ? (
                    <input
                      value={formatWithCommas(editFormData.loan_refund_amount || '')}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/,/g, '');
                        if (!isNaN(rawValue)) {
                          setEditFormData(prev => ({ ...prev, loan_refund_amount: rawValue }));
                        }
                      }}
                      placeholder="Enter Refund Amount"
                      className='w-full h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                    />
                  ) : (
                    <input
                      value={formatWithCommas(editFormData.loan_amount || '')}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/,/g, '');
                        if (!isNaN(rawValue)) {
                          setEditFormData(prev => ({ ...prev, loan_amount: rawValue }));
                        }
                      }}
                      placeholder="Enter Amount"
                      className='w-full h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                    />
                  )}
                </div>
                <div className='space-y-2'>
                  <label className='font-semibold block text-sm sm:text-base'>
                    {editSelectedType === 'Transfer' ? 'Transfer Amount' : 'Payment Mode'}
                  </label>
                  {editSelectedType === 'Transfer' ? (
                    <input
                      value={formatWithCommas(editTransferAmount)}
                      onChange={handleEditTransferAmountChange}
                      placeholder="Enter Amount"
                      className='w-full h-[45px] no-spinner border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                    />
                  ) : (
                    <Select
                      options={paymentModeOptions}
                      value={paymentModeOptions.find(option => option.value === editPaymentMode) || null}
                      onChange={(selected) => setEditPaymentMode(selected ? selected.value : '')}
                      classNamePrefix="react-select"
                      placeholder="Select"
                      isClearable
                    />
                  )}
                </div>
                <div className='col-span-1 sm:col-span-2 space-y-2'>
                  <label className='font-semibold block text-sm sm:text-base'>Description</label>
                  <textarea
                    rows={2}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Type your text here..."
                    className='w-full border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                  />
                </div>
              </div>
              <div className="flex justify-center sm:justify-end gap-3 mt-4">
                <button onClick={() => setIsEditModalOpen(false)} className="w-[100px] h-[45px] border border-[#BF9853] rounded text-sm">
                  Cancel
                </button>
                <button onClick={handleUpdate} className="w-[100px] h-[45px] bg-[#BF9853] text-white rounded text-sm">
                  Save
                </button>

              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="top-center" autoClose={3000} theme="colored" />
    </body>
  )
}
export default LoanDatabase
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