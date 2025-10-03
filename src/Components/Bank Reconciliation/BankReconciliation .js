import React, { useEffect, useState, useCallback } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from 'xlsx';
import logo from '../Images/aablogo.png';
import Filter from '../Images/filter (3).png';
import Select from 'react-select';

const ALLOWED_MODES = [
  "netbanking", "net banking",
  "gpay", "g pay",
  "phonepe", "phone pe"
];
const normalizeMode = (mode) =>
  (mode || "").toLowerCase().replace(/\s/g, "");
const formatCurrency = (val) =>
  val && !isNaN(val) && val !== "" ? `₹${Number(val).toLocaleString("en-IN")}` : "-";
const formatNumber = (val) =>
  val && !isNaN(val) && val !== "" ? Number(val).toLocaleString("en-IN") : "-";
const BankReconciliation = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  // Date filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  // Drag and scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  // For mapping IDs to names
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  // Preview modal state
  const [showPreview, setShowPreview] = useState(false);
  const [previewTab, setPreviewTab] = useState("allEntries");
  const [showPdfSettings, setShowPdfSettings] = useState(false);
  // PDF Settings state
  const [pdfSettings, setPdfSettings] = useState({
    date: true,
    module: true,
    particular: true,
    type: true,
    receiptPayment: true,
    debit: true,
    credit: true,
    mode: true,
    remarks: false,
    appliedFilters: true
  });
  // Table Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [filterParticular, setFilterParticular] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterReceiptPayment, setFilterReceiptPayment] = useState('');
  const [filterMode, setFilterMode] = useState('');
  useEffect(() => {
    const fetchAllOptions = async () => {
      try {
        // Vendors
        const vRes = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/getAll");
        const vData = vRes.ok ? await vRes.json() : [];
        setVendorOptions(vData.map(item => ({ id: item.id, name: item.vendorName })));
        // Contractors
        const cRes = await fetch("https://backendaab.in/aabuilderDash/api/contractor_Names/getAll");
        const cData = cRes.ok ? await cRes.json() : [];
        setContractorOptions(cData.map(item => ({ id: item.id, name: item.contractorName })));
        // Employees
        const eRes = await fetch("https://backendaab.in/aabuildersDash/api/employee_details/getAll");
        const eData = eRes.ok ? await eRes.json() : [];
        setEmployeeOptions(eData.map(item => ({ id: item.id, name: item.employee_name })));
      } catch { }
    };
    fetchAllOptions();
  }, []);
  const getVendorName = (id) => vendorOptions.find(v => String(v.id) === String(id))?.name || "";
  const getContractorName = (id) => contractorOptions.find(c => String(c.id) === String(id))?.name || "";
  const getEmployeeName = (id) => employeeOptions.find(e => String(e.id) === String(id))?.name || "";
  const applyAllFilters = useCallback(() => {
    let filtered = [...records];
    if (startDate || endDate) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date);
        const start = startDate ? new Date(startDate) : new Date('1900-01-01');
        const end = endDate ? new Date(endDate) : new Date('2100-12-31');
        return recordDate >= start && recordDate <= end;
      });
    }
    if (selectedMonth) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date);
        const recordMonth = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
        return recordMonth === selectedMonth;
      });
    }
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(record => {
        const dateStr = record.date ? new Date(record.date).toLocaleDateString("en-GB") : "";
        const debitStr = record.debit ? String(record.debit) : "";
        const creditStr = record.credit ? String(record.credit) : "";
        return (
          dateStr.toLowerCase().includes(searchLower) ||
          (record.module || "").toLowerCase().includes(searchLower) ||
          (record.particular || "").toLowerCase().includes(searchLower) ||
          (record.type || "").toLowerCase().includes(searchLower) ||
          (record.receiptPayment || "").toLowerCase().includes(searchLower) ||
          debitStr.includes(searchLower) ||
          creditStr.includes(searchLower) ||
          (record.mode || "").toLowerCase().includes(searchLower) ||
          (record.remarks || "").toLowerCase().includes(searchLower)
        );
      });
    }
    if (filterDate) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date);
        const filterDateObj = new Date(filterDate);
        return recordDate.toDateString() === filterDateObj.toDateString();
      });
    }
    if (filterModule) {
      filtered = filtered.filter(record =>
        record.module?.toLowerCase() === filterModule.toLowerCase()
      );
    }
    if (filterParticular) {
      filtered = filtered.filter(record =>
        record.particular?.toLowerCase() === filterParticular.toLowerCase()
      );
    }
    if (filterType) {
      filtered = filtered.filter(record =>
        record.type?.toLowerCase() === filterType.toLowerCase()
      );
    }
    if (filterReceiptPayment) {
      filtered = filtered.filter(record =>
        record.receiptPayment?.toLowerCase() === filterReceiptPayment.toLowerCase()
      );
    }
    if (filterMode) {
      filtered = filtered.filter(record =>
        record.mode?.toLowerCase() === filterMode.toLowerCase()
      );
    }
    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [records, startDate, endDate, selectedMonth, searchTerm, filterDate, filterModule, filterParticular, filterType, filterReceiptPayment, filterMode]);
  const generatePDF = () => {
    const headers = [];
    if (pdfSettings.date) headers.push('Date');
    if (pdfSettings.module) headers.push('Module');
    if (pdfSettings.particular) headers.push('Particular');
    if (pdfSettings.type) headers.push('Type');
    if (pdfSettings.receiptPayment) headers.push('Receipt/Payment');
    if (pdfSettings.debit) headers.push('Debit');
    if (pdfSettings.credit) headers.push('Credit');
    if (pdfSettings.mode) headers.push('Mode');
    if (pdfSettings.remarks) headers.push('Remarks');
    const orientation = headers.length >= 6 ? 'landscape' : 'portrait';
    const doc = new jsPDF(orientation, 'mm', 'a4');
    try {
      const img = new Image();
      img.src = logo;
      doc.addImage(img, 'PNG', 14, 10, 15, 15);
    } catch (error) {
      console.log('Logo not added to PDF');
    }
    doc.setFontSize(16);
    doc.text('Bank Reconciliation Report', 32, 22);
    let startY = 35;
    if ((startDate || endDate) && pdfSettings.appliedFilters) {
      doc.setFontSize(10);
      const dateRange = `Date Range: ${startDate || 'Start'} to ${endDate || 'End'}`;
      doc.text(dateRange, 32, 28);
      startY = 45;
    }
    const tableData = filteredRecords.map(record => {
      const row = [];
      if (pdfSettings.date) row.push(record.date ? new Date(record.date).toLocaleDateString("en-GB") : "-");
      if (pdfSettings.module) row.push(record.module);
      if (pdfSettings.particular) row.push(record.particular);
      if (pdfSettings.type) row.push(record.type);
      if (pdfSettings.receiptPayment) row.push(record.receiptPayment);
      if (pdfSettings.debit) row.push(record.debit ? formatNumber(record.debit) : "-");
      if (pdfSettings.credit) row.push(record.credit ? formatNumber(record.credit) : "-");
      if (pdfSettings.mode) row.push(record.mode);
      if (pdfSettings.remarks) row.push(record.remarks || "");
      return row;
    });
    doc.autoTable({
      head: [headers],
      body: tableData,
      startY: startY,
      styles: {
        fontSize: 8,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      headStyles: {
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        fillColor: null
      },
      margin: { left: 14, right: 14 }
    });
    const totalDebit = filteredRecords.reduce((sum, record) => sum + (parseFloat(record.debit) || 0), 0);
    const totalCredit = filteredRecords.reduce((sum, record) => sum + (parseFloat(record.credit) || 0), 0);
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    if (pdfSettings.debit) doc.text(`Total Debit: ${formatNumber(totalDebit)}`, 14, finalY);
    if (pdfSettings.credit) doc.text(`Total Credit: ${formatNumber(totalCredit)}`, 14, pdfSettings.debit ? finalY + 8 : finalY);
    if (pdfSettings.debit && pdfSettings.credit) {
      doc.text(`Net Balance: ${formatNumber(totalCredit - totalDebit)}`, 14, finalY + 16);
    }
    const fileName = `Bank_Reconciliation_${startDate || 'all'}_to_${endDate || 'all'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    setShowPreview(false);
  };
  const openPreview = () => {
    setShowPreview(true);
  };
  const handleSavePdfSettings = () => {
    setShowPdfSettings(false);
  };
  const openPdfSettings = () => {
    setShowPdfSettings(true);
  };
  const generateExcel = () => {
    const wsData = [
      ['Date', 'Module', 'Particular', 'Type', 'Receipt/Payment', 'Debit', 'Credit', 'Mode', 'Remarks']
    ];
    filteredRecords.forEach(record => {
      wsData.push([
        record.date ? new Date(record.date).toLocaleDateString("en-GB") : "-",
        record.module,
        record.particular,
        record.type,
        record.receiptPayment,
        record.debit ? Number(record.debit) : "",
        record.credit ? Number(record.credit) : "",
        record.mode,
        record.remarks || ""
      ]);
    });
    const totalDebit = filteredRecords.reduce((sum, record) => sum + (parseFloat(record.debit) || 0), 0);
    const totalCredit = filteredRecords.reduce((sum, record) => sum + (parseFloat(record.credit) || 0), 0);
    const netBalance = totalCredit - totalDebit;
    wsData.push([]); 
    wsData.push(['Summary:', '', '', '', '', '', '', '', '']);
    wsData.push(['Total Debit:', '', '', '', '', totalDebit, '', '', '']);
    wsData.push(['Total Credit:', '', '', '', '', '', totalCredit, '', '']);
    wsData.push(['Net Balance:', '', '', '', '', '', netBalance, '', '']);
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bank Reconciliation');
    const colWidths = [
      { wch: 12 }, 
      { wch: 15 }, 
      { wch: 20 }, 
      { wch: 12 }, 
      { wch: 15 }, 
      { wch: 12 }, 
      { wch: 12 }, 
      { wch: 15 }, 
      { wch: 15 } 
    ];
    ws['!cols'] = colWidths;
    const headerRange = XLSX.utils.decode_range(ws['!ref']);
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "F5F5DC" } }
      };
    }
    const fileName = `Bank_Reconciliation_${startDate || 'all'}_to_${endDate || 'all'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - e.currentTarget.offsetLeft);
    setStartY(e.pageY - e.currentTarget.offsetTop);
    setScrollLeft(e.currentTarget.scrollLeft);
    setScrollTop(e.currentTarget.scrollTop);
    e.currentTarget.style.cursor = 'grabbing';
  };
  const handleMouseLeave = (e) => {
    setIsDragging(false);
    e.currentTarget.style.cursor = 'grab';
  };
  const handleMouseUp = (e) => {
    setIsDragging(false);
    e.currentTarget.style.cursor = 'grab';
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - e.currentTarget.offsetLeft;
    const y = e.pageY - e.currentTarget.offsetTop;
    const walkX = (x - startX) * 2;
    const walkY = (y - startY) * 2;
    e.currentTarget.scrollLeft = scrollLeft - walkX;
    e.currentTarget.scrollTop = scrollTop - walkY;
  };
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setStartX(touch.pageX - e.currentTarget.offsetLeft);
    setStartY(touch.pageY - e.currentTarget.offsetTop);
    setScrollLeft(e.currentTarget.scrollLeft);
    setScrollTop(e.currentTarget.scrollTop);
  };
  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const x = touch.pageX - e.currentTarget.offsetLeft;
    const y = touch.pageY - e.currentTarget.offsetTop;
    const walkX = (x - startX) * 2;
    const walkY = (y - startY) * 2;
    e.currentTarget.scrollLeft = scrollLeft - walkX;
    e.currentTarget.scrollTop = scrollTop - walkY;
  };
  const handleTouchEnd = () => {
    setIsDragging(false);
  };
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      let all = [];
      // --- Expenses Form ---
      try {
        const res = await fetch("https://backendaab.in/aabuilderDash/expenses_form/get_form");
        if (res.ok) {
          const data = await res.json();
          console.log("Expenses Form Data:", data);
          all = all.concat(
            data
              .filter(item => {
                const mode = (item.paymentMode || item.accountType || "").toLowerCase();
                return ALLOWED_MODES.some(m => mode.includes(m)) && (item.type || item.accountType) !== "Transfer";
              })
              .map(item => {
                let type = item.type || item.accountType || "-";
                let particular = item.vendor || item.contractor || item.employeeName || item.claimNo || "-";
                if (type === "Claim" && (!particular || particular === "-")) {
                  particular = item.employeeName || item.claimNo || "-";
                }
                if (type === "Daily Wage" && (!particular || particular === "-")) {
                  particular = item.employeeName || "-";
                }
                return {
                  date: item.date || item.timestamp,
                  module: "Expenses Form",
                  particular,
                  type,
                  receiptPayment: "Payment",
                  debit: item.amount,
                  credit: "",
                  mode: item.paymentMode || item.accountType || "-",
                  remarks: "",
                };
              })
          );
        }
      } catch { }
      // --- Claim Payments ---
      try {
        const res = await fetch("https://backendaab.in/aabuilderDash/expenses_form/get_form");
        if (res.ok) {
          const data = await res.json();
          const claimRows = data.filter(item => (item.accountType === "Claim" || item.type === "Claim"));
          for (const claim of claimRows) {
            try {
              const payRes = await fetch(`https://backendaab.in/aabuildersDash/api/claim_payments/get/${claim.id}`);
              if (payRes.ok) {
                const payments = await payRes.json();
                console.log("Claim Payments Data:", payments);
                payments
                  .filter(payment => {
                    const mode = (payment.paymentMode || payment.payment_mode || "").toLowerCase();
                    return ALLOWED_MODES.some(m => mode.includes(m)) && (payment.type || "Claim") !== "Transfer";
                  })
                  .forEach(payment => {
                    let particular = claim.employeeName || claim.claimNo || payment.employeeName || payment.claimNo || "-";
                    return all.push({
                      date: payment.date || payment.paymentDate || claim.date || claim.timestamp,
                      module: "Claim Payments",
                      particular,
                      type: "Claim",
                      receiptPayment: "Receipt",
                      debit: "",
                      credit: payment.amount,
                      mode: payment.paymentMode || payment.payment_mode || "-",
                      remarks: "",
                    });
                  });
              }
            } catch { }
          }
        }
      } catch { }
      try {
        const res = await fetch("https://backendaab.in/aabuildersDash/api/rental_forms/getAll");
        if (res.ok) {
          const data = await res.json();
          all = all.concat(
            data
              .filter((item) => {
                const mode = (item.paymentMode || "").toLowerCase();
                return ALLOWED_MODES.some(m => mode.includes(m)) && (item.formType || "Rent") !== "Transfer";
              })
              .map((item) => {
                let debit = "";
                let credit = "";
                let type = item.formType || "Rent";
                if (type === "Rent") {
                  credit = item.amount;
                } else if (type === "Advance") {
                  debit = item.amount;
                } else if (type === "Shop Closure") {
                  credit = item.refundAmount;
                }
                return {
                  date: item.paidOnDate || item.paymentDate || item.timestamp,
                  module: "Rent Management",
                  particular: item.tenantName || item.propertyName || "-",
                  type,
                  receiptPayment: type === "Advance" ? "Payment" : "Receipt",
                  debit,
                  credit,
                  mode: item.paymentMode,
                  remarks: "",
                };
              })
          );
        }
      } catch { }
      try {
        const res = await fetch("https://backendaab.in/aabuildersDash/api/loans/all");
        if (res.ok) {
          const data = await res.json();
          all = all.concat(
            data
              .filter((item) => {
                const mode = (item.loan_payment_mode || "").toLowerCase();
                return ALLOWED_MODES.some(m => mode.includes(m)) && item.type !== "Transfer";
              })
              .map((item) => {
                let isRefund = item.type === "Refund";
                let associate =
                  item.vendor_id
                    ? getVendorName(item.vendor_id)
                    : item.contractor_id
                      ? getContractorName(item.contractor_id)
                      : "-";
                return {
                  date: item.date,
                  module: "Loan Portal",
                  particular: associate,
                  type: item.type,
                  receiptPayment: isRefund ? "Receipt" : "Payment",
                  debit: !isRefund ? item.amount : "",
                  credit: isRefund ? item.loan_refund_amount : "",
                  mode: item.loan_payment_mode,
                  remarks: "",
                };
              })
          );
        }
      } catch { }
      try {
        const res = await fetch("https://backendaab.in/aabuildersDash/api/staff-advance/all");
        if (res.ok) {
          const data = await res.json();
          all = all.concat(
            data
              .filter((item) => {
                const mode = (item.staff_payment_mode || "").toLowerCase();
                return ALLOWED_MODES.some(m => mode.includes(m)) && item.type !== "Transfer";
              })
              .map((item) => {
                let isRefund = item.type === "Refund";
                let empName = getEmployeeName(item.employee_id) || (isRefund ? "Refund" : "-");
                return {
                  date: item.date,
                  module: "Staff Advance",
                  particular: empName,
                  type: item.type,
                  receiptPayment: isRefund ? "Receipt" : "Payment",
                  debit: !isRefund ? item.amount : "",
                  credit: isRefund ? item.staff_refund_amount : "",
                  mode: item.staff_payment_mode,
                  remarks: "",
                };
              })
          );
        }
      } catch { }
      try {
        const res = await fetch("https://backendaab.in/aabuildersDash/api/advance_portal/getAll");
        if (res.ok) {
          const data = await res.json();
          console.log("Advance Portal Data:", data);
          all = all.concat(
            data
              .filter((item) => {
                const mode = (item.payment_mode || "").toLowerCase();
                return ALLOWED_MODES.some(m => mode.includes(m)) && item.type !== "Transfer";
              })
              .map((item) => {
                let debit = "";
                let credit = "";
                let isRefund = item.type === "Refund";
                let isBillSettlement = item.type === "Bill Settlement";
                if (isRefund) {
                  credit = item.refund_amount || 0;
                } else if (isBillSettlement) {
                  debit = item.amount || 0;
                } else {
                  debit = item.amount || 0;
                }
                let associatedName = "-";
                if (item.contractor_id && item.contractor_id !== 0) {
                  associatedName = getContractorName(item.contractor_id) || `Contractor ID: ${item.contractor_id}`;
                } else if (item.vendor_id && item.vendor_id !== 0) {
                  associatedName = getVendorName(item.vendor_id) || `Vendor ID: ${item.vendor_id}`;
                } else if (item.employee_id && item.employee_id !== 0) {
                  associatedName = getEmployeeName(item.employee_id) || `Employee ID: ${item.employee_id}`;
                } else {
                  associatedName = item.description || `Entry No: ${item.entry_no || '-'}`;
                }
                return {
                  date: item.date,
                  module: "Advance Portal",
                  particular: associatedName,
                  type: item.type,
                  receiptPayment: isRefund ? "Receipt" : "Payment",
                  debit,
                  credit,
                  mode: item.payment_mode || "-",
                  remarks: item.description || "",
                };
              })
          );
        }
      } catch { }
      all.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecords(all);
      setLoading(false);
    };
    if (
      vendorOptions.length &&
      contractorOptions.length &&
      employeeOptions.length
    ) {
      fetchAll();
    }
  }, [vendorOptions, contractorOptions, employeeOptions]);
  useEffect(() => {
    if (records.length > 0) {
      applyAllFilters();
    } else {
      setFilteredRecords([]);
    }
  }, [applyAllFilters, records]);
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);
  const moduleOptions = React.useMemo(() => {
    const uniqueModules = [...new Set(records.map(r => r.module))].filter(Boolean);
    return uniqueModules.map(m => ({ value: m, label: m }));
  }, [records]);
  const particularOptions = React.useMemo(() => {
    const uniqueParticulars = [...new Set(records.map(r => r.particular))].filter(Boolean);
    return uniqueParticulars.map(p => ({ value: p, label: p }));
  }, [records]);
  const typeOptions = React.useMemo(() => {
    const uniqueTypes = [...new Set(records.map(r => r.type))].filter(Boolean);
    return uniqueTypes.map(t => ({ value: t, label: t }));
  }, [records]);
  const receiptPaymentOptions = React.useMemo(() => {
    const uniqueReceiptPayments = [...new Set(records.map(r => r.receiptPayment))].filter(Boolean);
    return uniqueReceiptPayments.map(rp => ({ value: rp, label: rp }));
  }, [records]);
  const modeOptions = React.useMemo(() => {
    const uniqueModes = [...new Set(records.map(r => r.mode))].filter(Boolean);
    return uniqueModes.map(m => ({ value: m, label: m }));
  }, [records]);
  return (
    <body className="bg-[#FAF6ED]">
      <div className="w-full p-6">
        <h2 className="text-xl font-bold mb-4">Bank Reconciliation</h2>
        <div className="mb-4 p-6 rounded-lg bg-white ">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-[150px] px-2 py-2 border-2 border-[#BF9853] border-opacity-35 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-[150px] px-2 py-2 border-2 border-[#BF9853] border-opacity-35 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly View
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-[150px] px-2 py-2 border-2 border-[#BF9853] border-opacity-35 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search in all columns..."
                  className="w-[230px] px-2 py-2 border-2 border-[#BF9853] border-opacity-35 rounded-lg focus:outline-none "
                />
              </div>
            </div>
            <div className="flex gap-3">
              <div>
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setSelectedMonth("");
                    setSearchTerm("");
                  }}
                  className="px-4 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Clear Filter
                </button>
              </div>
              <div>
                <button
                  onClick={() => setShowPreview(true)}
                  disabled={filteredRecords.length === 0}
                  className={`px-4 py-2 text-sm rounded-md focus:outline-none focus:ring-2 ${filteredRecords.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#BF9853] text-white hover:bg-[#A6854A] focus:ring-[#BF9853]"
                    }`}
                >
                  Export PDF
                </button>
              </div>
              <div>
                <button
                  onClick={generateExcel}
                  disabled={filteredRecords.length === 0}
                  className={`px-4 py-2 text-sm rounded-md focus:outline-none focus:ring-2 ${filteredRecords.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700 focus:ring-green-600"
                    }`}
                >
                  Export Excel
                </button>
              </div>
            </div>
          </div>
          {filteredRecords.length !== records.length && (
            <div className="mt-2 text-sm text-gray-600">
              Showing {filteredRecords.length} of {records.length} records
            </div>
          )}
        </div>
        <div className="bg-white p-4">
          <div className="mb-4 flex justify-start">
            <button onClick={() => setShowFilters(!showFilters)}>
              <img
                src={Filter}
                alt="Toggle Filter"
                className="w-7 h-7 border border-[#BF9853] rounded-md"
              />
            </button>
          </div>
          <div
            className="overflow-auto border rounded-lg h-[600px] select-none"
            style={{ cursor: isDragging ? 'grabbing' : 'default' }}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
          >
            <table className="w-full border-collapse min-w-[1100px]">
              <thead className="bg-[#FAF6ED] sticky top-0 z-10">
                <tr>
                  <th className="p-2 font-bold text-left w-32">Date</th>
                  <th className="p-2 font-bold text-left w-40">Module</th>
                  <th className="p-2 font-bold text-left w-48">Particular</th>
                  <th className="p-2 font-bold text-left w-32">Type</th>
                  <th className="p-2 font-bold text-left w-40">Receipt/Payment</th>
                  <th className="p-2 font-bold text-left w-32">Debit</th>
                  <th className="p-2 font-bold text-left w-32">Credit</th>
                  <th className="p-2 font-bold text-left w-32">Mode</th>
                  <th className="p-2 font-bold text-left w-32">Remarks</th>
                </tr>
                {showFilters && (
                  <tr className="bg-white border-b border-gray-200">
                    <th className="p-2 w-32">
                      <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="p-1 rounded-md bg-transparent w-full border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none text-sm"
                      />
                    </th>
                    <th className="p-2 w-40">
                      <Select
                        options={moduleOptions}
                        value={filterModule ? { value: filterModule, label: filterModule } : null}
                        onChange={(opt) => setFilterModule(opt ? opt.value : "")}
                        className="text-xs"
                        placeholder="Module..."
                        isSearchable
                        isClearable
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            backgroundColor: 'transparent',
                            borderWidth: '3px',
                            borderColor: 'rgba(191, 152, 83, 0.2)',
                            borderRadius: '6px',
                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                            '&:hover': { borderColor: 'rgba(191, 152, 83, 0.2)' },
                            minHeight: '32px',
                            fontSize: '12px'
                          }),
                          placeholder: (provided) => ({ ...provided, color: '#999' }),
                          menu: (provided) => ({ ...provided, zIndex: 9 }),
                          indicatorSeparator: () => ({ display: 'none' }),
                          dropdownIndicator: (provided) => ({ ...provided, padding: '2px' }),
                          clearIndicator: (provided) => ({ ...provided, padding: '2px' })
                        }}
                      />
                    </th>
                    <th className="p-2 w-48">
                      <Select
                        options={particularOptions}
                        value={filterParticular ? { value: filterParticular, label: filterParticular } : null}
                        onChange={(opt) => setFilterParticular(opt ? opt.value : "")}
                        className="text-xs"
                        placeholder="Particular..."
                        isSearchable
                        isClearable
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            backgroundColor: 'transparent',
                            borderWidth: '3px',
                            borderColor: 'rgba(191, 152, 83, 0.2)',
                            borderRadius: '6px',
                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                            '&:hover': { borderColor: 'rgba(191, 152, 83, 0.2)' },
                            minHeight: '32px',
                            fontSize: '12px'
                          }),
                          placeholder: (provided) => ({ ...provided, color: '#999' }),
                          menu: (provided) => ({ ...provided, zIndex: 9 }),
                          indicatorSeparator: () => ({ display: 'none' }),
                          dropdownIndicator: (provided) => ({ ...provided, padding: '2px' }),
                          clearIndicator: (provided) => ({ ...provided, padding: '2px' })
                        }}
                      />
                    </th>
                    <th className="p-2 w-32">
                      <Select
                        options={typeOptions}
                        value={filterType ? { value: filterType, label: filterType } : null}
                        onChange={(opt) => setFilterType(opt ? opt.value : "")}
                        className="text-xs"
                        placeholder="Type..."
                        isSearchable
                        isClearable
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            backgroundColor: 'transparent',
                            borderWidth: '3px',
                            borderColor: 'rgba(191, 152, 83, 0.2)',
                            borderRadius: '6px',
                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                            '&:hover': { borderColor: 'rgba(191, 152, 83, 0.2)' },
                            minHeight: '32px',
                            fontSize: '12px'
                          }),
                          placeholder: (provided) => ({ ...provided, color: '#999' }),
                          menu: (provided) => ({ ...provided, zIndex: 9 }),
                          indicatorSeparator: () => ({ display: 'none' }),
                          dropdownIndicator: (provided) => ({ ...provided, padding: '2px' }),
                          clearIndicator: (provided) => ({ ...provided, padding: '2px' })
                        }}
                      />
                    </th>
                    <th className="p-2 w-40">
                      <Select
                        options={receiptPaymentOptions}
                        value={filterReceiptPayment ? { value: filterReceiptPayment, label: filterReceiptPayment } : null}
                        onChange={(opt) => setFilterReceiptPayment(opt ? opt.value : "")}
                        className="text-xs"
                        placeholder="Receipt/Payment..."
                        isSearchable
                        isClearable
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            backgroundColor: 'transparent',
                            borderWidth: '3px',
                            borderColor: 'rgba(191, 152, 83, 0.2)',
                            borderRadius: '6px',
                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                            '&:hover': { borderColor: 'rgba(191, 152, 83, 0.2)' },
                            minHeight: '32px',
                            fontSize: '12px'
                          }),
                          placeholder: (provided) => ({ ...provided, color: '#999' }),
                          menu: (provided) => ({ ...provided, zIndex: 9 }),
                          indicatorSeparator: () => ({ display: 'none' }),
                          dropdownIndicator: (provided) => ({ ...provided, padding: '2px' }),
                          clearIndicator: (provided) => ({ ...provided, padding: '2px' })
                        }}
                      />
                    </th>
                    <th className="p-2 w-32"></th>
                    <th className="p-2 w-32"></th>
                    <th className="p-2 w-32">
                      <Select
                        options={modeOptions}
                        value={filterMode ? { value: filterMode, label: filterMode } : null}
                        onChange={(opt) => setFilterMode(opt ? opt.value : "")}
                        className="text-xs"
                        placeholder="Mode..."
                        isSearchable
                        isClearable
                        styles={{
                          control: (provided, state) => ({
                            ...provided,
                            backgroundColor: 'transparent',
                            borderWidth: '3px',
                            borderColor: 'rgba(191, 152, 83, 0.2)',
                            borderRadius: '6px',
                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.5)' : 'none',
                            '&:hover': { borderColor: 'rgba(191, 152, 83, 0.2)' },
                            minHeight: '32px',
                            fontSize: '12px'
                          }),
                          placeholder: (provided) => ({ ...provided, color: '#999' }),
                          menu: (provided) => ({ ...provided, zIndex: 9 }),
                          indicatorSeparator: () => ({ display: 'none' }),
                          dropdownIndicator: (provided) => ({ ...provided, padding: '2px' }),
                          clearIndicator: (provided) => ({ ...provided, padding: '2px' })
                        }}
                      />
                    </th>
                    <th className="p-2 w-32"></th>
                  </tr>
                )}
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center p-4 text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center p-4 text-gray-400">
                      {records.length === 0 ? "No Records available" : "No records found for the selected date range"}
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((rec, idx) => (
                    <tr key={startIndex + idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#FAF6ED]"}>
                      <td className="text-sm p-2 w-32">{rec.date ? new Date(rec.date).toLocaleDateString("en-GB") : "-"}</td>
                      <td className="text-sm p-2 w-40">{rec.module}</td>
                      <td className="text-sm p-2 w-48">{rec.particular}</td>
                      <td className="text-sm p-2 w-32">{rec.type}</td>
                      <td className="text-sm p-2 w-40">{rec.receiptPayment}</td>
                      <td className="text-sm p-2 w-32">{formatCurrency(rec.debit)}</td>
                      <td className="text-sm p-2 w-32">{formatCurrency(rec.credit)}</td>
                      <td className="text-sm p-2 w-32">{rec.mode}</td>
                      <td className="text-sm p-2 w-32"></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {filteredRecords.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={300}>300</option>
                <option value={400}>400</option>
                <option value={500}>500</option>
              </select>
              <span className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredRecords.length)} of {filteredRecords.length} records
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className={`px-3 py-1 text-sm rounded border ${currentPage === 1
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
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
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm rounded border ${currentPage === pageNum
                        ? "bg-[#BF9853] text-white border-[#BF9853]"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 text-sm rounded border ${currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
        {showPdfSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {showPreview && (
                    <button
                      onClick={() => setShowPdfSettings(false)}
                      className="text-gray-600 hover:text-gray-800"
                      title="Back to Preview"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  <h2 className="text-xl font-semibold">PDF Settings</h2>
                </div>
                <button
                  onClick={() => {
                    setShowPdfSettings(false);
                    if (!showPreview) {
                      setShowPreview(false);
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-6">Select columns you wish to include in "All Entries"</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">Date</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Compulsory</span>
                        <input
                          type="checkbox"
                          checked={pdfSettings.date}
                          disabled
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </label>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">Debit</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Compulsory</span>
                        <input
                          type="checkbox"
                          checked={pdfSettings.debit}
                          disabled
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </label>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">Credit</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Compulsory</span>
                        <input
                          type="checkbox"
                          checked={pdfSettings.credit}
                          disabled
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </label>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">Module</span>
                      <input
                        type="checkbox"
                        checked={pdfSettings.module}
                        onChange={(e) => setPdfSettings({ ...pdfSettings, module: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </label>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">Particular</span>
                      <input
                        type="checkbox"
                        checked={pdfSettings.particular}
                        onChange={(e) => setPdfSettings({ ...pdfSettings, particular: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </label>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">Type</span>
                      <input
                        type="checkbox"
                        checked={pdfSettings.type}
                        onChange={(e) => setPdfSettings({ ...pdfSettings, type: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </label>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">Receipt/Payment</span>
                      <input
                        type="checkbox"
                        checked={pdfSettings.receiptPayment}
                        onChange={(e) => setPdfSettings({ ...pdfSettings, receiptPayment: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </label>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">Mode</span>
                      <input
                        type="checkbox"
                        checked={pdfSettings.mode}
                        onChange={(e) => setPdfSettings({ ...pdfSettings, mode: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </label>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">Remarks</span>
                      <input
                        type="checkbox"
                        checked={pdfSettings.remarks}
                        onChange={(e) => setPdfSettings({ ...pdfSettings, remarks: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Other Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm font-medium text-gray-700">Applied Filters</span>
                        <input
                          type="checkbox"
                          checked={pdfSettings.appliedFilters}
                          onChange={(e) => setPdfSettings({ ...pdfSettings, appliedFilters: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end">
                <button
                  onClick={handleSavePdfSettings}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Save PDF Settings
                </button>
              </div>
            </div>
          </div>
        )}
        {showPreview && !showPdfSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Export Transactions</h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-6 py-3 bg-gray-50 border-b">
                <p className="text-sm text-gray-600">Report is generated with following filters</p>
                {(startDate || endDate) && (
                  <div className="mt-2">
                    <span className="text-xs font-medium text-gray-500 uppercase">Date Range</span>
                    <p className="text-sm text-gray-800">
                      {startDate || 'Start'} to {endDate || 'End'}
                    </p>
                  </div>
                )}
              </div>
              <div className="px-6 pt-4 border-b">
                <div className="flex gap-4">
                  <button
                    onClick={() => setPreviewTab("allEntries")}
                    className={`pb-2 px-1 text-sm font-medium border-b-2 ${previewTab === "allEntries"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    All Entries
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <div className="bg-white border rounded-lg p-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={logo}
                          alt="Logo"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="text-lg font-bold">Bank Reconciliation Report</h3>
                          <p className="text-xs text-gray-500">
                            Generated On - {new Date().toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })}, {new Date().toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true
                            })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={openPdfSettings}
                        className="flex items-center gap-2 px-4 py-2 text-sm border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        PDF Settings
                      </button>
                    </div>
                    {(startDate || endDate) && pdfSettings.appliedFilters && (
                      <div className="mb-4">
                        <span className="text-sm font-medium">Date Range:</span>
                        <span className="ml-2 text-sm">{startDate || 'Start'} to {endDate || 'End'}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {pdfSettings.debit && (
                        <div>
                          <p className="text-sm text-gray-600">Total Debit</p>
                          <p className="text-xl font-semibold text-red-600">
                            {formatNumber(filteredRecords.reduce((sum, record) => sum + (parseFloat(record.debit) || 0), 0))}
                          </p>
                        </div>
                      )}
                      {pdfSettings.credit && (
                        <div>
                          <p className="text-sm text-gray-600">Total Credit</p>
                          <p className="text-xl font-semibold text-green-600">
                            {formatNumber(filteredRecords.reduce((sum, record) => sum + (parseFloat(record.credit) || 0), 0))}
                          </p>
                        </div>
                      )}
                      {pdfSettings.debit && pdfSettings.credit && (
                        <div>
                          <p className="text-sm text-gray-600">Final Balance</p>
                          <p className="text-xl font-semibold">
                            {formatNumber(
                              filteredRecords.reduce((sum, record) => sum + (parseFloat(record.credit) || 0), 0) -
                              filteredRecords.reduce((sum, record) => sum + (parseFloat(record.debit) || 0), 0)
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Total No. of entries: {filteredRecords.length}</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          {pdfSettings.date && <th className="border p-2 text-left font-medium">Date</th>}
                          {pdfSettings.module && <th className="border p-2 text-left font-medium">Module</th>}
                          {pdfSettings.particular && <th className="border p-2 text-left font-medium">Particular</th>}
                          {pdfSettings.type && <th className="border p-2 text-left font-medium">Type</th>}
                          {pdfSettings.receiptPayment && <th className="border p-2 text-left font-medium">Receipt/Payment</th>}
                          {pdfSettings.debit && <th className="border p-2 text-right font-medium">Debit</th>}
                          {pdfSettings.credit && <th className="border p-2 text-right font-medium">Credit</th>}
                          {pdfSettings.mode && <th className="border p-2 text-left font-medium">Mode</th>}
                          {pdfSettings.remarks && <th className="border p-2 text-left font-medium">Remarks</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.slice(0, 10).map((record, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            {pdfSettings.date && (
                              <td className="border p-2">
                                {record.date ? new Date(record.date).toLocaleDateString("en-GB") : "-"}
                              </td>
                            )}
                            {pdfSettings.module && <td className="border p-2">{record.module}</td>}
                            {pdfSettings.particular && <td className="border p-2">{record.particular}</td>}
                            {pdfSettings.type && <td className="border p-2">{record.type}</td>}
                            {pdfSettings.receiptPayment && <td className="border p-2">{record.receiptPayment}</td>}
                            {pdfSettings.debit && (
                              <td className="border p-2 text-right text-red-600">
                                {record.debit ? formatNumber(record.debit) : "-"}
                              </td>
                            )}
                            {pdfSettings.credit && (
                              <td className="border p-2 text-right text-green-600">
                                {record.credit ? formatNumber(record.credit) : "-"}
                              </td>
                            )}
                            {pdfSettings.mode && <td className="border p-2">{record.mode}</td>}
                            {pdfSettings.remarks && <td className="border p-2">{record.remarks || "-"}</td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredRecords.length > 10 && (
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Showing 10 of {filteredRecords.length} entries in preview
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-white border-t px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={generatePDF}
                  className="px-6 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download as PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </body >
  );
};

export default BankReconciliation