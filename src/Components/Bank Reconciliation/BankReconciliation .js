import React, { useEffect, useState, useCallback } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from 'xlsx';
import logo from '../Images/aablogo.png';
import Filter from '../Images/filter (3).png';
import Select from 'react-select';

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
  const [siteOptions, setSiteOptions] = useState([]);
  const [purposeOptions, setPurposeOptions] = useState([]);
  const [tenantOptions, setTenantOptions] = useState([]);
  console.log("tenantOptions", tenantOptions);
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
  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  useEffect(() => {
    const fetchAllOptions = async () => {
      try {
        // Vendors
        const vRes = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/getAll");
        const vData = vRes.ok ? await vRes.json() : [];
        setVendorOptions(vData.map(item => ({ id: item.id, label: item.vendorName })));
        
        // Contractors
        const cRes = await fetch("https://backendaab.in/aabuilderDash/api/contractor_Names/getAll");
        const cData = cRes.ok ? await cRes.json() : [];
        setContractorOptions(cData.map(item => ({ id: item.id, label: item.contractorName })));
        
        // Employees
        const eRes = await fetch("https://backendaab.in/aabuildersDash/api/employee_details/getAll");
        const eData = eRes.ok ? await eRes.json() : [];
        setEmployeeOptions(eData.map(item => ({ id: item.id, label: item.employee_name })));
        
        // Projects with predefined options
        const pRes = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/getAll");
        const pData = pRes.ok ? await pRes.json() : [];
        const formattedProjects = pData.map(item => ({
          value: item.siteName,
          label: item.siteName,
          id: item.id,
          sNo: item.siteNo
        }));
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
          {value:"Multi-Project Batch",label:"Multi-Project Batch",id:10,sNo:"10"}
        ];
        setSiteOptions([...predefinedSiteOptions, ...formattedProjects]);
        
        // Purpose options
        const purposeRes = await fetch('https://backendaab.in/aabuildersDash/api/loan-purposes/getAll');
        const purposeData = purposeRes.ok ? await purposeRes.json() : [];
        setPurposeOptions(purposeData.map(purpose => ({
          value: purpose.purpose,
          label: purpose.purpose,
          id: purpose.id,
          type: 'Purpose'
        })));
        
        // Tenant options
        const tenantRes = await fetch('https://backendaab.in/aabuildersDash/api/tenant_link_shop/getAll');
        const tenantData = tenantRes.ok ? await tenantRes.json() : [];
        setTenantOptions(tenantData.map(tenant => ({
          value: tenant.tenantName,
          label: tenant.tenantName,
          id: tenant.id,
        })));
      } catch { }
    };
    fetchAllOptions();
  }, []);

  // Helper functions for mapping IDs to names
  const getProjectName = (projectId) => {
    const project = siteOptions.find(option => option.id === projectId);
    return project ? project.label : '-';
  };

  const getPurposeName = (purposeId) => {
    const purpose = purposeOptions.find(option => option.id === purposeId);
    return purpose ? purpose.label : '-';
  };

  const getVendorName = (vendorId) => {
    const vendor = vendorOptions.find(option => option.id === vendorId);
    return vendor ? vendor.label : '-';
  };

  const getContractorName = (contractorId) => {
    const contractor = contractorOptions.find(option => option.id === contractorId);
    return contractor ? contractor.label : '-';
  };

  const getEmployeeName = (employeeId) => {
    const employee = employeeOptions.find(option => option.id === employeeId);
    return employee ? employee.label : '-';
  };

  const getTenantName = (tenantId) => {
    const tenant = tenantOptions.find(option => option.id === tenantId);
    return tenant ? tenant.label : '-';
  };

  const getPartyNameAndType = (item) => {
    const contractorName = getContractorName(item.contractor_id);
    const vendorName = getVendorName(item.vendor_id);
    const employeeName = getEmployeeName(item.employee_id);
    const tenantName = getTenantName(item.tenant_id);
    
    if (contractorName !== '-') {
      return { name: contractorName, type: 'Contractor' };
    } else if (vendorName !== '-') {
      return { name: vendorName, type: 'Vendor' };
    } else if (employeeName !== '-') {
      return { name: employeeName, type: 'Employee' };
    } else if (tenantName !== '-') {
      return { name: tenantName, type: 'Tenant' };
    } else {
      return { name: '-', type: '-' };
    }
  };

  const getProjectOrPurposeName = (item) => {
    // Check if this is a tenant - if so, show tenant_complex_name directly from the data
    const partyData = getPartyNameAndType(item);
    if (partyData.type === 'Tenant' && item.tenant_complex_name) {
      return item.tenant_complex_name;
    }
    
    // First try to get project name
    if (item.project_id) {
      const projectName = getProjectName(item.project_id);
      if (projectName !== '-') {
        return projectName;
      }
    }
    
    // If no project_id or project not found, try to get purpose name
    if (item.purpose_id) {
      const purposeName = getPurposeName(item.purpose_id);
      if (purposeName !== '-') {
        return purposeName;
      }
    }
    
    return '-';
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // Toggle direction if clicking the same column
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      // Default to ascending if switching column
      return { key, direction: 'asc' };
    });
  };

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
          (record.projectName || "").toLowerCase().includes(searchLower) ||
          (record.partyName || "").toLowerCase().includes(searchLower) ||
          (record.partyType || "").toLowerCase().includes(searchLower) ||
          (record.type || "").toLowerCase().includes(searchLower) ||
          (record.receiptPayment || "").toLowerCase().includes(searchLower) ||
          debitStr.includes(searchLower) ||
          creditStr.includes(searchLower) ||
          (record.paymentMode || "").toLowerCase().includes(searchLower) ||
          (record.accountNo || "").toLowerCase().includes(searchLower) ||
          (record.chequeNo || "").toLowerCase().includes(searchLower) ||
          (record.transactionNo || "").toLowerCase().includes(searchLower) ||
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
        record.partyName?.toLowerCase() === filterParticular.toLowerCase()
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
        record.paymentMode?.toLowerCase() === filterMode.toLowerCase()
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        // Handle date sorting
        if (sortConfig.key === 'date') {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        }
        
        // Handle numeric sorting for debit and credit
        if (sortConfig.key === 'debit' || sortConfig.key === 'credit') {
          aVal = parseFloat(aVal) || 0;
          bVal = parseFloat(bVal) || 0;
        }
        
        // Handle string sorting (case-insensitive)
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal?.toLowerCase() || '';
        }
        
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredRecords(filtered);
    setCurrentPage(1);
  }, [records, startDate, endDate, selectedMonth, searchTerm, filterDate, filterModule, filterParticular, filterType, filterReceiptPayment, filterMode, sortConfig]);
  const generatePDF = () => {
    const headers = ['Date', 'Module', 'Project Name', 'Party Name', 'Party Type', 'Type', 'Receipt/Payment', 'Debit', 'Credit', 'Payment Mode', 'Account No', 'Cheque No', 'Cheque Date', 'Transaction No', 'Remarks'];
    const orientation = 'landscape';
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
      return [
        record.date ? new Date(record.date).toLocaleDateString("en-GB") : "-",
        record.module,
        record.projectName || "-",
        record.partyName || "-",
        record.partyType || "-",
        record.type || "-",
        record.receiptPayment,
        record.debit ? formatNumber(record.debit) : "-",
        record.credit ? formatNumber(record.credit) : "-",
        record.paymentMode || "-",
        record.accountNo || "-",
        record.chequeNo || "-",
        record.chequeDate ? new Date(record.chequeDate).toLocaleDateString("en-GB") : "-",
        record.transactionNo || "-",
        record.remarks || ""
      ];
    });
    doc.autoTable({
      head: [headers],
      body: tableData,
      startY: startY,
      styles: {
        fontSize: 6,
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
    doc.text(`Total Debit: ${formatNumber(totalDebit)}`, 14, finalY);
    doc.text(`Total Credit: ${formatNumber(totalCredit)}`, 14, finalY + 8);
    doc.text(`Net Balance: ${formatNumber(totalCredit - totalDebit)}`, 14, finalY + 16);
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
      ['Date', 'Module', 'Project Name', 'Party Name', 'Party Type', 'Type', 'Receipt/Payment', 'Debit', 'Credit', 'Payment Mode', 'Account No', 'Cheque No', 'Cheque Date', 'Transaction No', 'Remarks']
    ];
    filteredRecords.forEach(record => {
      wsData.push([
        record.date ? new Date(record.date).toLocaleDateString("en-GB") : "-",
        record.module,
        record.projectName || "-",
        record.partyName || "-",
        record.partyType || "-",
        record.type || "-",
        record.receiptPayment,
        record.debit ? Number(record.debit) : "",
        record.credit ? Number(record.credit) : "",
        record.paymentMode || "-",
        record.accountNo || "-",
        record.chequeNo || "-",
        record.chequeDate ? new Date(record.chequeDate).toLocaleDateString("en-GB") : "-",
        record.transactionNo || "-",
        record.remarks || ""
      ]);
    });
    const totalDebit = filteredRecords.reduce((sum, record) => sum + (parseFloat(record.debit) || 0), 0);
    const totalCredit = filteredRecords.reduce((sum, record) => sum + (parseFloat(record.credit) || 0), 0);
    const netBalance = totalCredit - totalDebit;
    wsData.push([]); 
    wsData.push(['Summary:', '', '', '', '', '', '', totalDebit, totalCredit, '', '', '', '', '', '']);
    wsData.push(['Net Balance:', '', '', '', '', '', '', '', netBalance, '', '', '', '', '', '']);
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bank Reconciliation');
    const colWidths = [
      { wch: 12 }, // Date
      { wch: 15 }, // Module
      { wch: 20 }, // Project Name
      { wch: 20 }, // Party Name
      { wch: 12 }, // Party Type
      { wch: 12 }, // Type
      { wch: 15 }, // Receipt/Payment
      { wch: 12 }, // Debit
      { wch: 12 }, // Credit
      { wch: 15 }, // Payment Mode
      { wch: 15 }, // Account No
      { wch: 12 }, // Cheque No
      { wch: 12 }, // Cheque Date
      { wch: 15 }, // Transaction No
      { wch: 20 }  // Remarks
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
  };
  const handleMouseLeave = (e) => {
    setIsDragging(false);
  };
  const handleMouseUp = (e) => {
    setIsDragging(false);
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
      try {
        const res = await fetch("https://backendaab.in/aabuildersDash/api/weekly-payment-bills/all");
        if (res.ok) {
          const data = await res.json();
          // Map the data to match the table structure
          const mappedData = data.map((item) => {
            const partyData = getPartyNameAndType(item);            
            // Determine module based on which ID is present
            let module = "Bill Payment"; // Default
            if (item.rent_management_id) {
              module = "Rent Management";
            } else if (item.advance_portal_id) {
              module = "Advance Portal";
            } else if (item.staff_advance_portal_id) {
              module = "Staff Advance Portal";
            } else if (item.loan_portal_id) {
              module = "Loan Portal";
            } else if (item.claim_payment_id) {
              module = "Claim Payment";
            } else if (item.expenses_entry_id) {
              module = "Expenses Entry";
            }
            // Determine Receipt/Payment and Debit/Credit based on type
            let receiptPayment = "Payment"; // Default
            let debit = item.amount || 0;
            let credit = "";
            // Special handling for Rent Payment types
            if (item.type === "Rent Payment" && item.rent_management_id) {
              receiptPayment = "Receipt";
              debit = "";
              credit = item.amount || 0;
            } else if (item.type === "Rent Payment Refund" && item.rent_management_id) {
              receiptPayment = "Payment";
              debit = item.amount || 0;
              credit = "";
            }
            return {
              id: item.id,
              date: item.date,
              module: module,
              projectName: getProjectOrPurposeName(item),
              partyName: partyData.name,
              partyType: partyData.type,
              type: item.type || "-",
              receiptPayment: receiptPayment,
              debit: debit,
              credit: credit,
              paymentMode: item.bill_payment_mode || "-",
              accountNo: item.account_number || "-",
              chequeNo: item.cheque_number || "-",
              chequeDate: item.cheque_date || "",
              transactionNo: item.transaction_number || "-",
              remarks: item.remarks || "",
            };
          });
          mappedData.sort((a, b) => new Date(b.date) - new Date(a.date));
          setRecords(mappedData);
          setLoading(false);
        } else {
          console.error("Failed to fetch bill payments");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching bill payments:", error);
        setLoading(false);
      }
    };
    if (
      vendorOptions.length &&
      contractorOptions.length &&
      employeeOptions.length &&
      siteOptions.length
    ) {
      fetchAll();
    }
  }, [vendorOptions, contractorOptions, employeeOptions, siteOptions, purposeOptions, tenantOptions]);
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
    const uniqueParticulars = [...new Set(records.map(r => r.partyName))].filter(Boolean);
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
    const uniqueModes = [...new Set(records.map(r => r.paymentMode))].filter(Boolean);
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
          <div className="border-l-8 border-l-[#BF9853] rounded-lg">
          <div
            className="overflow-auto max-h-[650px] select-none thin-scrollbar"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
          >
            <table className="border-collapse" style={{ minWidth: '100%' }}>
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="bg-[#FAF6ED]">
                  <th className="px-2 py-2 font-bold text-left" style={{ minWidth: '60px', width: '60px' }}>S.No</th>
                  <th 
                    className="px-2 py-2 font-bold text-left cursor-pointer hover:bg-gray-200" 
                    style={{ minWidth: '120px', width: '120px' }}
                    onClick={() => handleSort('date')}
                  >
                    Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-2 py-2 font-bold text-left cursor-pointer hover:bg-gray-200" 
                    style={{ minWidth: '180px', width: '180px' }}
                    onClick={() => handleSort('module')}
                  >
                    Module {sortConfig.key === 'module' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-2 py-2 font-bold text-left cursor-pointer hover:bg-gray-200" 
                    style={{ minWidth: '200px', width: '200px' }}
                    onClick={() => handleSort('projectName')}
                  >
                    Project Name {sortConfig.key === 'projectName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-2 py-2 font-bold text-left cursor-pointer hover:bg-gray-200" 
                    style={{ minWidth: '200px', width: '200px' }}
                    onClick={() => handleSort('partyName')}
                  >
                    Party Name {sortConfig.key === 'partyName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-2 py-2 font-bold text-left cursor-pointer hover:bg-gray-200" 
                    style={{ minWidth: '140px', width: '140px' }}
                    onClick={() => handleSort('partyType')}
                  >
                    Party Type {sortConfig.key === 'partyType' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-2 py-2 font-bold text-left cursor-pointer hover:bg-gray-200" 
                    style={{ minWidth: '160px', width: '160px' }}
                    onClick={() => handleSort('type')}
                  >
                    Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-2 py-2 font-bold text-left cursor-pointer hover:bg-gray-200" 
                    style={{ minWidth: '150px', width: '150px' }}
                    onClick={() => handleSort('receiptPayment')}
                  >
                    Receipt/Payment {sortConfig.key === 'receiptPayment' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-2 py-2 font-bold text-left cursor-pointer hover:bg-gray-200" 
                    style={{ minWidth: '100px', width: '100px' }}
                    onClick={() => handleSort('debit')}
                  >
                    Debit {sortConfig.key === 'debit' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-2 py-2 font-bold text-left cursor-pointer hover:bg-gray-200" 
                    style={{ minWidth: '100px', width: '100px' }}
                    onClick={() => handleSort('credit')}
                  >
                    Credit {sortConfig.key === 'credit' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-2 py-2 font-bold text-left cursor-pointer hover:bg-gray-200" 
                    style={{ minWidth: '150px', width: '150px' }}
                    onClick={() => handleSort('paymentMode')}
                  >
                    Payment Mode {sortConfig.key === 'paymentMode' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-2 py-2 font-bold text-left" style={{ minWidth: '140px', width: '140px' }}>Account No</th>
                  <th className="px-2 py-2 font-bold text-left" style={{ minWidth: '120px', width: '120px' }}>Cheque No</th>
                  <th className="px-2 py-2 font-bold text-left" style={{ minWidth: '120px', width: '120px' }}>Cheque Date</th>
                  <th className="px-2 py-2 font-bold text-left" style={{ minWidth: '140px', width: '140px' }}>Transaction No</th>
                  <th className="px-2 py-2 font-bold text-left" style={{ minWidth: '200px', width: '200px' }}>Remarks</th>
                </tr>
                {showFilters && (
                  <tr className="bg-white border-b border-gray-200">
                    <th className="p-2" style={{ minWidth: '60px', width: '60px' }}></th>
                    <th className="p-2" style={{ minWidth: '120px', width: '120px' }}>
                      <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="p-1 rounded-md bg-transparent w-full border-[3px] border-[#BF9853] border-opacity-[20%] focus:outline-none text-sm"
                      />
                    </th>
                    <th className="p-2" style={{ minWidth: '180px', width: '180px' }}>
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
                    <th className="p-2" style={{ minWidth: '200px', width: '200px' }}></th>
                    <th className="p-2" style={{ minWidth: '200px', width: '200px' }}>
                      <Select
                        options={particularOptions}
                        value={filterParticular ? { value: filterParticular, label: filterParticular } : null}
                        onChange={(opt) => setFilterParticular(opt ? opt.value : "")}
                        className="text-xs"
                        placeholder="Party Name..."
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
                    <th className="p-2" style={{ minWidth: '140px', width: '140px' }}></th>
                    <th className="p-2" style={{ minWidth: '180px', width: '180px' }}>
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
                    <th className="p-2" style={{ minWidth: '150px', width: '150px' }}>
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
                    <th className="p-2" style={{ minWidth: '120px', width: '120px' }}></th>
                    <th className="p-2" style={{ minWidth: '120px', width: '120px' }}></th>
                    <th className="p-2" style={{ minWidth: '150px', width: '150px' }}>
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
                    <th className="p-2" style={{ minWidth: '140px', width: '140px' }}></th>
                    <th className="p-2" style={{ minWidth: '120px', width: '120px' }}></th>
                    <th className="p-2" style={{ minWidth: '120px', width: '120px' }}></th>
                    <th className="p-2" style={{ minWidth: '140px', width: '140px' }}></th>
                    <th className="p-2" style={{ minWidth: '200px', width: '200px' }}></th>
                  </tr>
                )}
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={16} className="text-center p-4 text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={16} className="text-center p-4 text-gray-400">
                      {records.length === 0 ? "No Records available" : "No records found for the selected date range"}
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((rec, idx) => (
                    <tr key={startIndex + idx} className="odd:bg-white even:bg-[#FAF6ED]">
                      <td className="text-sm text-left p-2 font-semibold" style={{ minWidth: '60px', width: '60px' }}>{startIndex + idx + 1}</td>
                      <td className="text-sm text-left p-2 font-semibold whitespace-nowrap" style={{ minWidth: '120px', width: '120px' }}>{rec.date ? new Date(rec.date).toLocaleDateString("en-GB") : "-"}</td>
                      <td className="text-sm text-left p-2 font-semibold" style={{ minWidth: '180px', width: '180px' }}>
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap" title={rec.module}>{rec.module}</div>
                      </td>
                      <td className="text-sm text-left p-2 font-semibold" style={{ minWidth: '200px', width: '200px' }}>
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap" title={rec.projectName}>{rec.projectName}</div>
                      </td>
                      <td className="text-sm text-left p-2 font-semibold" style={{ minWidth: '200px', width: '200px' }}>
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap" title={rec.partyName}>{rec.partyName}</div>
                      </td>
                      <td className="text-sm text-left p-2 font-semibold" style={{ minWidth: '140px', width: '140px' }}>
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap" title={rec.partyType}>{rec.partyType}</div>
                      </td>
                      <td className="text-sm text-left p-2 font-semibold" style={{ minWidth: '160px', width: '160px' }}>
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap" title={rec.type}>{rec.type}</div>
                      </td>
                      <td className="text-sm text-left p-2 font-semibold whitespace-nowrap" style={{ minWidth: '150px', width: '150px' }}>{rec.receiptPayment}</td>
                      <td className="text-sm text-left p-2 font-semibold whitespace-nowrap" style={{ minWidth: '100px', width: '100px' }}>{formatCurrency(rec.debit)}</td>
                      <td className="text-sm text-left p-2 font-semibold whitespace-nowrap" style={{ minWidth: '100px', width: '100px' }}>{formatCurrency(rec.credit)}</td>
                      <td className="text-sm text-left p-2 font-semibold" style={{ minWidth: '150px', width: '150px' }}>
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap" title={rec.paymentMode}>{rec.paymentMode}</div>
                      </td>
                      <td className="text-sm text-left p-2 font-semibold whitespace-nowrap" style={{ minWidth: '140px', width: '140px' }}>{rec.accountNo}</td>
                      <td className="text-sm text-left p-2 font-semibold whitespace-nowrap" style={{ minWidth: '120px', width: '120px' }}>{rec.chequeNo}</td>
                      <td className="text-sm text-left p-2 font-semibold whitespace-nowrap" style={{ minWidth: '120px', width: '120px' }}>{rec.chequeDate ? new Date(rec.chequeDate).toLocaleDateString("en-GB") : "-"}</td>
                      <td className="text-sm text-left p-2 font-semibold whitespace-nowrap" style={{ minWidth: '140px', width: '140px' }}>{rec.transactionNo}</td>
                      <td className="text-sm text-left p-2 font-semibold" style={{ minWidth: '200px', width: '200px' }}>
                        <div className="overflow-hidden text-ellipsis whitespace-nowrap" title={rec.remarks}>{rec.remarks}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
                    <button onClick={() => setShowPdfSettings(false)} className="text-gray-600 hover:text-gray-800" title="Back to Preview">
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
                    if (!showPreview) {setShowPreview(false);}
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
                          <th className="border p-2 text-left font-medium">Date</th>
                          <th className="border p-2 text-left font-medium">Module</th>
                          <th className="border p-2 text-left font-medium">Project Name</th>
                          <th className="border p-2 text-left font-medium">Party Name</th>
                          <th className="border p-2 text-left font-medium">Party Type</th>
                          <th className="border p-2 text-left font-medium">Type</th>
                          <th className="border p-2 text-left font-medium">Receipt/Payment</th>
                          <th className="border p-2 text-right font-medium">Debit</th>
                          <th className="border p-2 text-right font-medium">Credit</th>
                          <th className="border p-2 text-left font-medium">Payment Mode</th>
                          <th className="border p-2 text-left font-medium">Account No</th>
                          <th className="border p-2 text-left font-medium">Cheque No</th>
                          <th className="border p-2 text-left font-medium">Cheque Date</th>
                          <th className="border p-2 text-left font-medium">Transaction No</th>
                          <th className="border p-2 text-left font-medium">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.slice(0, 10).map((record, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="border p-2">
                              {record.date ? new Date(record.date).toLocaleDateString("en-GB") : "-"}
                            </td>
                            <td className="border p-2">{record.module}</td>
                            <td className="border p-2">{record.projectName || "-"}</td>
                            <td className="border p-2">{record.partyName || "-"}</td>
                            <td className="border p-2">{record.partyType || "-"}</td>
                            <td className="border p-2">{record.type || "-"}</td>
                            <td className="border p-2">{record.receiptPayment}</td>
                            <td className="border p-2 text-right text-red-600">
                              {record.debit ? formatNumber(record.debit) : "-"}
                            </td>
                            <td className="border p-2 text-right text-green-600">
                              {record.credit ? formatNumber(record.credit) : "-"}
                            </td>
                            <td className="border p-2">{record.paymentMode || "-"}</td>
                            <td className="border p-2">{record.accountNo || "-"}</td>
                            <td className="border p-2">{record.chequeNo || "-"}</td>
                            <td className="border p-2">{record.chequeDate ? new Date(record.chequeDate).toLocaleDateString("en-GB") : "-"}</td>
                            <td className="border p-2">{record.transactionNo || "-"}</td>
                            <td className="border p-2">{record.remarks || "-"}</td>
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