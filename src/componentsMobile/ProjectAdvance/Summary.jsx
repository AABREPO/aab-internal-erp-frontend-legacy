import React, { useState, useEffect, useCallback } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Filter from '../Images/Filter.png';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';
import Download from '../Images/Download.svg'
import CloseIcon from '../Images/Close F.svg'

const PREDEFINED_SITE_OPTIONS = [
  { value: 'Mason Advance', label: 'Mason Advance', id: 1, sNo: '1' },
  { value: 'Material Advance', label: 'Material Advance', id: 2, sNo: '2' },
  { value: 'Weekly Advance', label: 'Weekly Advance', id: 3, sNo: '3' },
  { value: 'Excess Advance', label: 'Excess Advance', id: 4, sNo: '4' },
  { value: 'Material Rent', label: 'Material Rent', id: 5, sNo: '5' },
  { value: 'Subhash Kumar - Kunnur', label: 'Subhash Kumar - Kunnur', id: 6, sNo: '6' },
  { value: 'Summary Bill', label: 'Summary Bill', id: 7, sNo: '7' },
  { value: 'Daily Wage', label: 'Daily Wage', id: 8, sNo: '8' },
  { value: 'Rent Management Portal', label: 'Rent Management Portal', id: 9, sNo: '9' },
  { value: 'Multi-Project Batch', label: 'Multi-Project Batch', id: 10, sNo: '10' },
  { value: 'Loan Portal', label: 'Loan Portal', id: 11, sNo: '11' },
  { value: 'Bill Payment Tracker', label: 'Bill Payment Tracker', id: 12, sNo: '12' },
];

const Summary = () => {
  const resolveActiveBranchId = () => {
    try {
      const selectedBranchId = localStorage.getItem('selectedBranchId');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const fallbackBranchId = user?.branchId ?? user?.branch_id ?? user?.brachId;
      const resolved = Number(selectedBranchId || fallbackBranchId);
      return Number.isFinite(resolved) && resolved > 0 ? resolved : null;
    } catch {
      return null;
    }
  };
  const [activeBranchId] = useState(() => resolveActiveBranchId());
  const withBranchUrl = (baseUrl) => {
    const url = new URL(baseUrl);
    if (activeBranchId !== null && activeBranchId !== undefined && activeBranchId !== '') {
      url.searchParams.set('branchId', String(activeBranchId));
    }
    return url.toString();
  };

  const [advanceData, setAdvanceData] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([...PREDEFINED_SITE_OPTIONS]);
  const [combinedOptions, setCombinedOptions] = useState([]);
  const [selectedContractorOrVendorOption, setSelectedContractorOrVendorOption] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewMode, setViewMode] = useState('Contractor/Vendor'); // 'Contractor/Vendor' or 'Project'
  const [showContractorVendorModal, setShowContractorVendorModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [summaryData, setSummaryData] = useState([]);
  const [totalBillAmount, setTotalBillAmount] = useState(0);
  const [totalPendingAdvance, setTotalPendingAdvance] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [projectNameFilter, setProjectNameFilter] = useState('');
  const [billStatusFilter, setBillStatusFilter] = useState('');
  const [showProjectNameModal, setShowProjectNameModal] = useState(false);
  const [showBillStatusModal, setShowBillStatusModal] = useState(false);

  // Bottom sheet state for Bill/Advance/Status details (same content as AdvanceSummary popups)
  const [showDetailsBottomSheet, setShowDetailsBottomSheet] = useState(false);
  const [detailsBottomSheetType, setDetailsBottomSheetType] = useState('bill'); // 'bill' | 'advance' | 'status'
  const [detailsPopupData, setDetailsPopupData] = useState(null);
  const [detailsPopupTitle, setDetailsPopupTitle] = useState('');
  const [detailsPopupContext, setDetailsPopupContext] = useState('');
  const [detailsPopupSortConfig, setDetailsPopupSortConfig] = useState({ key: null, direction: 'asc' });
  const [billStatusPopupData, setBillStatusPopupData] = useState({ advances: [], bills: [] });
  const [billStatusPopupContext, setBillStatusPopupContext] = useState('');
  const [billStatusPopupSortConfig, setBillStatusPopupSortConfig] = useState({ key: null, direction: 'asc' });
  const [isDetailsFromProjectView, setIsDetailsFromProjectView] = useState(true);

  const fetchVendors = async () => {
    try {
      const res = await fetch('https://backendaab.in/demoAabuilderDash/api/vendor_Names/getAll');
      if (res.ok) {
        const data = await res.json();
        setVendorOptions(data.map((item) => ({
          id: item.id,
          label: item.vendorName,
          type: 'Vendor'
        })));
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  };

  const fetchContractors = async () => {
    try {
      const res = await fetch('https://backendaab.in/demoAabuilderDash/api/contractor_Names/getAll');
      if (res.ok) {
        const data = await res.json();
        setContractorOptions(data.map((item) => ({
          id: item.id,
          label: item.contractorName,
          type: 'Contractor'
        })));
      }
    } catch (err) {
      console.error('Error fetching contractors:', err);
    }
  };

  const fetchSites = async () => {
    try {
      const res = await fetch('https://backendaab.in/demoAabuilderDash/api/project_Names/getAll');
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((item) => ({
          value: item.siteName,
          label: item.siteName,
          id: item.id,
          sNo: item.siteNo,
        }));
        setSiteOptions([...PREDEFINED_SITE_OPTIONS, ...formatted]);
      }
    } catch (err) {
      console.error('Error fetching sites:', err);
      setSiteOptions([...PREDEFINED_SITE_OPTIONS]);
    }
  };

  const loadAdvanceData = useCallback(async () => {
    try {
      // Mobile: avoid fetching the full dataset (can crash the browser on large payloads).
      const res = await fetch(withBranchUrl('https://backendaab.in/demoAabuildersDash/api/advance_portal/getLast150'));
      if (!res.ok) throw new Error('Failed to fetch advance data');
      const data = await res.json();
      setAdvanceData(data);
    } catch (err) {
      console.error('Error loading advance data:', err);
    }
  }, [activeBranchId]);

  useEffect(() => {
    fetchVendors();
    fetchContractors();
    fetchSites();
  }, []);

  useEffect(() => {
    loadAdvanceData();
    const handleAdvanceUpdate = () => loadAdvanceData();
    window.addEventListener('advanceUpdated', handleAdvanceUpdate);
    return () => window.removeEventListener('advanceUpdated', handleAdvanceUpdate);
  }, [loadAdvanceData]);

  useEffect(() => {
    setCombinedOptions([...vendorOptions, ...contractorOptions]);
  }, [vendorOptions, contractorOptions]);

  const getVendorName = (vendorId) => {
    const v = vendorOptions.find((x) => x.id === vendorId);
    return v?.label || '';
  };

  const getContractorName = (contractorId) => {
    const c = contractorOptions.find((x) => x.id === contractorId);
    return c?.label || '';
  };

  const getProjectName = (projectId) => {
    const s = siteOptions.find((x) => x.id === projectId);
    return s?.label || s?.value || '';
  };

  // Same as AdvanceSummary: get bill details for popup
  const getBillDetails = (projectId, contractorVendorId, contractorVendorType) => {
    if (!advanceData.length) return [];
    return advanceData.filter(item => {
      const matchesProject = projectId ? item.project_id === projectId : true;
      const matchesEntity = contractorVendorId
        ? (contractorVendorType === 'Contractor'
          ? item.contractor_id === contractorVendorId
          : item.vendor_id === contractorVendorId)
        : true;
      return matchesProject && matchesEntity && item.bill_amount > 0;
    }).map(item => ({
      advancePortalId: item.advancePortalId || 0,
      date: new Date(item.date).toLocaleDateString('en-GB'),
      amount: parseFloat(item.bill_amount) || 0,
      projectName: siteOptions.find(s => String(s.id) === String(item.project_id))?.label || 'Unknown Site',
      contractorVendorName: item.contractor_id
        ? contractorOptions.find(c => c.id === item.contractor_id)?.label || '-'
        : vendorOptions.find(v => v.id === item.vendor_id)?.label || '-',
      type: item.type || 'Bill',
      file_url: (item.file_url && typeof item.file_url === 'string' && item.file_url.trim() !== '') ? item.file_url : null
    }));
  };

  // Same as AdvanceSummary: get advance details for popup
  const getAdvanceDetails = (projectId, contractorVendorId, contractorVendorType) => {
    if (!advanceData.length) return [];
    const bothFiltersApplied = contractorVendorId && projectId;
    return advanceData.filter(item => {
      const matchesProject = projectId ? item.project_id === projectId : true;
      const matchesEntity = contractorVendorId
        ? (contractorVendorType === 'Contractor'
          ? item.contractor_id === contractorVendorId
          : item.vendor_id === contractorVendorId)
        : true;
      const hasAmount = (parseFloat(item.amount) || 0) !== 0;
      const hasRefund = (parseFloat(item.refund_amount) || 0) !== 0;
      return matchesProject && matchesEntity && (hasAmount || hasRefund);
    }).map(item => {
      let amount = parseFloat(item.amount) || 0;
      const refundAmount = parseFloat(item.refund_amount) || 0;
      if (refundAmount !== 0) amount = -refundAmount;
      if (bothFiltersApplied && item.type === 'Transfer') {
        amount = parseFloat(item.amount) || 0;
      }
      return {
        advancePortalId: item.advancePortalId || 0,
        date: new Date(item.date).toLocaleDateString('en-GB'),
        amount,
        projectName: siteOptions.find(s => String(s.id) === String(item.project_id))?.label || 'Unknown Site',
        contractorVendorName: item.contractor_id
          ? contractorOptions.find(c => c.id === item.contractor_id)?.label || '-'
          : vendorOptions.find(v => v.id === item.vendor_id)?.label || '-',
        type: refundAmount !== 0 ? 'Refund' : (item.type || 'Advance'),
        transferSiteName: item.transfer_site_id
          ? siteOptions.find(s => String(s.id) === String(item.transfer_site_id))?.label || '-'
          : null,
        isRefund: refundAmount !== 0
      };
    });
  };

  const sortPopupData = (data, config) => {
    if (!data || data.length === 0) return [];
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`);
    };
    if (!config.key) {
      return [...data].sort((a, b) => {
        const aDate = parseDate(a.date);
        const bDate = parseDate(b.date);
        return bDate - aDate;
      });
    }
    return [...data].sort((a, b) => {
      let aValue = a[config.key];
      let bValue = b[config.key];
      if (config.key === 'date') {
        aValue = parseDate(aValue);
        bValue = parseDate(bValue);
        return config.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return config.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();
      if (aValue < bValue) return config.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return config.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleDetailsSort = (key) => {
    const direction = detailsPopupSortConfig.key === key && detailsPopupSortConfig.direction === 'asc' ? 'desc' : 'asc';
    setDetailsPopupSortConfig({ key, direction });
  };

  const handleBillStatusSort = (key) => {
    const direction = billStatusPopupSortConfig.key === key && billStatusPopupSortConfig.direction === 'asc' ? 'desc' : 'asc';
    setBillStatusPopupSortConfig({ key, direction });
  };

  // Click handlers - open bottom sheet with Bill or Advance or Status content
  const handleBillAmountClick = (item) => {
    let projectId, contractorVendorId, contractorVendorType, projectName, contractorVendorName;
    if (viewMode === 'Contractor/Vendor') {
      projectId = item.projectId;
      contractorVendorId = selectedContractorOrVendorOption?.id ?? null;
      contractorVendorType = selectedContractorOrVendorOption?.type ?? null;
      projectName = item.name;
      contractorVendorName = selectedContractorOrVendorOption ? selectedContractorOrVendorOption.label : 'All Contractors/Vendors';
      setIsDetailsFromProjectView(true);
    } else {
      projectId = selectedProject?.id ?? null;
      contractorVendorId = item.entityId;
      contractorVendorType = item.entityType;
      contractorVendorName = item.name;
      projectName = selectedProject ? selectedProject.label : 'All Projects';
      setIsDetailsFromProjectView(false);
    }
    const billDetails = getBillDetails(projectId, contractorVendorId, contractorVendorType);
    if (billDetails.length > 0) {
      setDetailsBottomSheetType('bill');
      setDetailsPopupTitle('Bill Details');
      setDetailsPopupData(billDetails);
      setDetailsPopupContext(isDetailsFromProjectView ? `${contractorVendorName} - ${projectName}` : `${projectName} - ${contractorVendorName}`);
      setDetailsPopupSortConfig({ key: null, direction: 'asc' });
      setShowDetailsBottomSheet(true);
    }
  };

  const handleAdvanceAmountClick = (item) => {
    let projectId, contractorVendorId, contractorVendorType, projectName, contractorVendorName;
    if (viewMode === 'Contractor/Vendor') {
      projectId = item.projectId;
      contractorVendorId = selectedContractorOrVendorOption?.id ?? null;
      contractorVendorType = selectedContractorOrVendorOption?.type ?? null;
      projectName = item.name;
      contractorVendorName = selectedContractorOrVendorOption ? selectedContractorOrVendorOption.label : 'All Contractors/Vendors';
      setIsDetailsFromProjectView(true);
    } else {
      projectId = selectedProject?.id ?? null;
      contractorVendorId = item.entityId;
      contractorVendorType = item.entityType;
      contractorVendorName = item.name;
      projectName = selectedProject ? selectedProject.label : 'All Projects';
      setIsDetailsFromProjectView(false);
    }
    const advanceDetails = getAdvanceDetails(projectId, contractorVendorId, contractorVendorType);
    if (advanceDetails.length > 0) {
      setDetailsBottomSheetType('advance');
      setDetailsPopupTitle('Advance Details');
      setDetailsPopupData(advanceDetails);
      setDetailsPopupContext(isDetailsFromProjectView ? `${contractorVendorName} - ${projectName}` : `${projectName} - ${contractorVendorName}`);
      setDetailsPopupSortConfig({ key: null, direction: 'asc' });
      setShowDetailsBottomSheet(true);
    }
  };

  const handleStatusClick = (item) => {
    let projectId, contractorVendorId, contractorVendorType, projectName, contractorVendorName;
    if (viewMode === 'Contractor/Vendor') {
      projectId = item.projectId;
      contractorVendorId = selectedContractorOrVendorOption?.id ?? null;
      contractorVendorType = selectedContractorOrVendorOption?.type ?? null;
      projectName = item.name;
      contractorVendorName = selectedContractorOrVendorOption ? selectedContractorOrVendorOption.label : 'All Contractors/Vendors';
      setIsDetailsFromProjectView(true);
    } else {
      projectId = selectedProject?.id ?? null;
      contractorVendorId = item.entityId;
      contractorVendorType = item.entityType;
      contractorVendorName = item.name;
      projectName = selectedProject ? selectedProject.label : 'All Projects';
      setIsDetailsFromProjectView(false);
    }
    const advanceDetails = getAdvanceDetails(projectId, contractorVendorId, contractorVendorType);
    const billDetails = getBillDetails(projectId, contractorVendorId, contractorVendorType);
    setBillStatusPopupData({ advances: advanceDetails, bills: billDetails });
    setBillStatusPopupContext(isDetailsFromProjectView ? `${contractorVendorName} - ${projectName}` : `${projectName} - ${contractorVendorName}`);
    setBillStatusPopupSortConfig({ key: null, direction: 'asc' });
    setDetailsBottomSheetType('status');
    setShowDetailsBottomSheet(true);
  };

  // Export PDF for Bill/Advance details bottom sheet (adapted from AdvanceSummary exportPopupPDF)
  const exportDetailsPDF = () => {
    if (detailsBottomSheetType === 'status') {
      exportBillStatusPDF();
      return;
    }
    const data = sortPopupData(detailsPopupData, detailsPopupSortConfig);
    if (!data || data.length === 0) return;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(detailsPopupContext, 14, 15);
    doc.setFontSize(10);
    doc.text(detailsPopupTitle, 14, 22);
    const isProjectPopup = isDetailsFromProjectView;
    const tableColumn = isProjectPopup && selectedContractorOrVendorOption
      ? ['Date', 'Transfer', 'Amount']
      : isProjectPopup ? ['Date', 'Contractor/Vendor', 'Amount'] : selectedProject
        ? ['Date', 'Transfer', 'Amount']
        : ['Date', 'Project Name', 'Amount'];
    const tableRows = data.map(entry => {
      const row = [entry.date];
      if (isProjectPopup && selectedContractorOrVendorOption) {
        let transferInfo = entry.isRefund ? 'Refund' : (entry.type === 'Transfer' && entry.transferSiteName ? `${entry.amount < 0 ? 'To: ' : 'From: '}${entry.transferSiteName}` : '');
        row.push(transferInfo);
      } else if (isProjectPopup) row.push(entry.contractorVendorName || '');
      else if (selectedProject) {
        let transferInfo = entry.isRefund ? 'Refund' : (entry.type === 'Transfer' && entry.transferSiteName ? `${entry.amount < 0 ? 'To: ' : 'From: '}${entry.transferSiteName}` : '');
        row.push(transferInfo);
      } else row.push(entry.projectName || '');
      row.push(entry.amount.toLocaleString('en-IN'));
      return row;
    });
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    tableRows.push(['Total', '', total.toLocaleString('en-IN')]);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      startY: 28,
      headStyles: { fillColor: [255, 255, 255], lineWidth: 0.2, lineColor: [100, 100, 100], fontStyle: 'bold' },
      styles: { textColor: 0, lineWidth: 0.2, lineColor: [100, 100, 100] },
      columnStyles: { 2: { halign: 'right' } },
      didParseCell: function (data) {
        // Highlight total row
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [255, 255, 255];
        }
      }
    });
    doc.save(`${detailsPopupContext.replace(/[^a-z0-9]/gi, '_')}_${detailsPopupTitle.replace(/[^a-z0-9]/gi, '_')}.pdf`);
  };

  const exportBillStatusPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(billStatusPopupContext, 14, 15);
    doc.setFontSize(10);
    doc.text('Bill Status Details', 14, 22);
    let tableColumn = ['Date'];
    if (!isDetailsFromProjectView && !selectedProject) tableColumn.push('Project Name');
    else if (isDetailsFromProjectView && !selectedContractorOrVendorOption) tableColumn.push('Contractor/Vendor');
    else tableColumn.push('Transfer');
    tableColumn.push('Advance Amount', 'Bill Amount');
    const combinedData = [];
    const dateMap = new Map();
    billStatusPopupData.advances.forEach(adv => {
      dateMap.set(`${adv.date}-${adv.advancePortalId}`, {
        date: adv.date, advancePortalId: adv.advancePortalId, advanceAmount: adv.amount, billAmount: 0,
        projectName: adv.projectName, contractorVendorName: adv.contractorVendorName,
        transferSiteName: adv.transferSiteName, type: adv.type, isRefund: adv.isRefund
      });
    });
    billStatusPopupData.bills.forEach(bill => {
      const key = `${bill.date}-${bill.advancePortalId}`;
      if (dateMap.has(key)) dateMap.get(key).billAmount = bill.amount;
      else dateMap.set(key, {
        date: bill.date, advancePortalId: bill.advancePortalId, advanceAmount: 0, billAmount: bill.amount,
        projectName: bill.projectName, contractorVendorName: bill.contractorVendorName,
        transferSiteName: bill.transferSiteName, type: bill.type, isRefund: false
      });
    });
    combinedData.push(...Array.from(dateMap.values()));
    const parseDate = (dateStr) => {
      const [d, m, y] = dateStr.split('/');
      return new Date(`${y}-${m}-${d}`);
    };
    if (!billStatusPopupSortConfig.key) {
      combinedData.sort((a, b) => {
        const diff = parseDate(b.date) - parseDate(a.date);
        return diff !== 0 ? diff : b.advancePortalId - a.advancePortalId;
      });
    } else {
      combinedData.sort((a, b) => {
        let av = a[billStatusPopupSortConfig.key];
        let bv = b[billStatusPopupSortConfig.key];
        if (billStatusPopupSortConfig.key === 'date') {
          av = parseDate(av);
          bv = parseDate(bv);
          const p = billStatusPopupSortConfig.direction === 'asc' ? av - bv : bv - av;
          return p !== 0 ? p : billStatusPopupSortConfig.direction === 'asc' ? a.advancePortalId - b.advancePortalId : b.advancePortalId - a.advancePortalId;
        }
        if (typeof av === 'number' && typeof bv === 'number') {
          const p = billStatusPopupSortConfig.direction === 'asc' ? av - bv : bv - av;
          return p !== 0 ? p : a.advancePortalId - b.advancePortalId;
        }
        av = String(av || '').toLowerCase();
        bv = String(bv || '').toLowerCase();
        if (av < bv) return billStatusPopupSortConfig.direction === 'asc' ? -1 : 1;
        if (av > bv) return billStatusPopupSortConfig.direction === 'asc' ? 1 : -1;
        return a.advancePortalId - b.advancePortalId;
      });
    }
    const tableRows = combinedData.map(entry => {
      const row = [entry.date];
      if (!isDetailsFromProjectView && !selectedProject) row.push(entry.projectName || '-');
      else if (isDetailsFromProjectView && !selectedContractorOrVendorOption) row.push(entry.contractorVendorName || '-');
      else row.push(entry.isRefund ? 'Refund' : (entry.type === 'Transfer' && entry.transferSiteName ? `${entry.advanceAmount < 0 ? 'To: ' : 'From: '}${entry.transferSiteName}` : '-'));
      row.push(entry.advanceAmount !== 0 ? entry.advanceAmount.toLocaleString('en-IN') : '-', entry.billAmount !== 0 ? entry.billAmount.toLocaleString('en-IN') : '-');
      return row;
    });
    const totalAdvance = billStatusPopupData.advances.reduce((s, i) => s + i.amount, 0);
    const totalBill = billStatusPopupData.bills.reduce((s, i) => s + i.amount, 0);
    tableRows.push(['Total', '', totalAdvance.toLocaleString('en-IN'), totalBill.toLocaleString('en-IN')]);
    tableRows.push(['Balance Advance', '', '', (totalAdvance - totalBill).toLocaleString('en-IN')]);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      startY: 28,
      headStyles: { fillColor: [255, 255, 255], lineWidth: 0.2, lineColor: [100, 100, 100], fontStyle: 'bold' },
      styles: { textColor: 0, lineWidth: 0.2, lineColor: [100, 100, 100] },
      columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' } },
      didParseCell: function (data) {
        // Highlight total and balance rows (same style as AdvanceSummary)
        if (data.row.index === tableRows.length - 2 || data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          if (data.row.index === tableRows.length - 1) {
            data.cell.styles.fillColor = [191, 152, 83]; // Gold for balance
            data.cell.styles.textColor = [255, 255, 255]; // White text
          } else {
            data.cell.styles.fillColor = [248, 241, 229]; // Light beige for total
          }
        }
      }
    });
    doc.save(`${billStatusPopupContext.replace(/[^a-z0-9]/gi, '_')}_Bill_Status.pdf`);
  };

  // Main summary PDF export (like AdvanceSummary exportPDF / exportsiteNamePDF)
  const exportSummaryPDF = () => {
    const doc = new jsPDF();
    if (viewMode === 'Contractor/Vendor' && selectedContractorOrVendorOption) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${selectedContractorOrVendorOption.type} - ${selectedContractorOrVendorOption.label}`, 14, 15);
    } else if (viewMode === 'Project' && selectedProject) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Site Name - ${selectedProject.label}`, 14, 15);
    } else if (viewMode === 'Project') {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('All Sites - Contractor/Vendor Summary', 14, 15);
    }
    const tableColumn = viewMode === 'Contractor/Vendor' ? ['Project Name', 'Pending Advance', 'Bill Amount', 'Bill Status'] : ['Contractor/Vendor', 'Pending Advance', 'Bill Amount', 'Bill Status'];
    const tableRows = summaryData.map(item => {
      const status = item.pendingAdvance > 0 ? 'Pending' : 'Bill Settled';
      return [item.name, item.pendingAdvance.toLocaleString('en-IN'), item.billAmount.toLocaleString('en-IN'), status];
    });
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      startY: (viewMode === 'Contractor/Vendor' && selectedContractorOrVendorOption) || (viewMode === 'Project') ? 20 : 10,
      headStyles: { fillColor: [255, 255, 255], textColor: 0, lineWidth: 0.2, lineColor: [100, 100, 100], fontStyle: 'bold' },
      styles: { textColor: 0, lineWidth: 0.2, lineColor: [100, 100, 100] },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } }
    });
    const fileName = viewMode === 'Contractor/Vendor' ? 'Project_Report.pdf' : (selectedProject ? 'Site_Report.pdf' : 'All_Sites_Contractor_Report.pdf');
    doc.save(fileName);
  };

  // Calculate summary data based on view mode - matches AdvanceSummary logic
  useEffect(() => {
    if (!advanceData.length) {
      setSummaryData([]);
      setTotalBillAmount(0);
      setTotalPendingAdvance(0);
      return;
    }

    let totalBillAll = 0;
    let totalPendingAll = 0;
    const grouped = {};

    if (viewMode === 'Contractor/Vendor') {
      // When Contractor/Vendor mode: group by Project (filtered by selected contractor/vendor if selected)
      let filteredData = advanceData;

      if (selectedContractorOrVendorOption) {
        filteredData = advanceData.filter(item => {
          if (selectedContractorOrVendorOption.type === "Vendor") {
            return item.vendor_id === selectedContractorOrVendorOption.id;
          }
          if (selectedContractorOrVendorOption.type === "Contractor") {
            return item.contractor_id === selectedContractorOrVendorOption.id;
          }
          return false;
        });
      }

      filteredData.forEach((curr) => {
        const {
          project_id,
          amount = 0,
          bill_amount = 0,
          refund_amount = 0
        } = curr;

        if (project_id) {
          if (!grouped[project_id]) {
            grouped[project_id] = {
              name: getProjectName(project_id) || "-",
              projectId: project_id,
              totalAdvance: 0,
              totalBill: 0,
              totalRefund: 0
            };
          }
          grouped[project_id].totalAdvance += parseFloat(amount) || 0;
          grouped[project_id].totalBill += parseFloat(bill_amount) || 0;
          grouped[project_id].totalRefund += parseFloat(refund_amount) || 0;
        }
      });

      const summaryArray = Object.values(grouped).map((item) => {
        const pending = item.totalAdvance - item.totalBill - item.totalRefund;
        totalPendingAll += pending;
        totalBillAll += item.totalBill;
        return {
          name: item.name,
          billAmount: item.totalBill,
          pendingAdvance: pending,
          projectId: item.projectId
        };
      });

      // Sort: Pending first, then Settled; alphabetically by name within each group (same as AdvanceSummary.js)
      summaryArray.sort((a, b) => {
        const aStatus = a.pendingAdvance > 0 ? 1 : 0;
        const bStatus = b.pendingAdvance > 0 ? 1 : 0;
        if (aStatus !== bStatus) return bStatus - aStatus;
        return (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase());
      });

      setSummaryData(summaryArray);
    } else {
      // When Project mode: group by Contractor/Vendor (filtered by selected project if selected)
      let filteredData = advanceData;

      if (selectedProject) {
        filteredData = advanceData.filter(item => item.project_id === selectedProject.id);
      }

      filteredData.forEach((item) => {
        const entityId = item.vendor_id || item.contractor_id;
        const entityType = item.vendor_id ? 'Vendor' : 'Contractor';
        const entityName = item.vendor_id
          ? getVendorName(item.vendor_id)
          : getContractorName(item.contractor_id);

        if (!entityId || !entityName) return;

        const key = `${entityType}-${entityId}`;
        if (!grouped[key]) {
          grouped[key] = {
            name: entityName,
            entityId,
            entityType,
            totalAdvance: 0,
            totalBill: 0,
            totalRefund: 0,
          };
        }

        grouped[key].totalAdvance += parseFloat(item.amount) || 0;
        grouped[key].totalBill += parseFloat(item.bill_amount) || 0;
        grouped[key].totalRefund += parseFloat(item.refund_amount) || 0;
      });

      const summaryArray = Object.values(grouped).map((item) => {
        const pending = item.totalAdvance - item.totalBill - item.totalRefund;
        totalPendingAll += pending;
        totalBillAll += item.totalBill;
        return {
          name: item.name,
          billAmount: item.totalBill,
          pendingAdvance: pending,
          entityId: item.entityId,
          entityType: item.entityType,
        };
      });

      // Sort: Pending first, then Settled; alphabetically by name within each group (same as AdvanceSummary.js)
      summaryArray.sort((a, b) => {
        const aStatus = a.pendingAdvance > 0 ? 1 : 0;
        const bStatus = b.pendingAdvance > 0 ? 1 : 0;
        if (aStatus !== bStatus) return bStatus - aStatus;
        return (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase());
      });

      setSummaryData(summaryArray);
    }

    setTotalBillAmount(totalBillAll);
    setTotalPendingAdvance(totalPendingAll);
  }, [viewMode, selectedContractorOrVendorOption, selectedProject, advanceData, vendorOptions, contractorOptions, siteOptions]);

  const filteredSummaryData = summaryData.filter((item) => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const name = (item.name || '').toLowerCase();
      const bill = item.billAmount != null ? String(item.billAmount).toLowerCase() : '';
      const pending = item.pendingAdvance != null ? String(item.pendingAdvance).toLowerCase() : '';
      if (
        !name.includes(query) &&
        !bill.includes(query) &&
        !pending.includes(query)
      ) return false;
    }
    if (projectNameFilter && viewMode === 'Contractor/Vendor') {
      if ((item.name || '') !== projectNameFilter) return false;
    }
    if (billStatusFilter) {
      const isSettled = item.pendingAdvance != null && item.pendingAdvance <= 0;
      const status = billStatusFilter.toLowerCase();
      if (status.includes('settled') && !isSettled) return false;
      if (status.includes('pending') && isSettled) return false;
    }
    return true;
  });

  return (
    <div
      className="relative w-full bg-white max-w-[360px] flex flex-col scrollbar-none overflow-hidden"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {/* Date and Category Section */}
      <div className=" pt-[8px] mb-[8px]">
        <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-[10px]">
          <button className="text-[12px] font-semibold text-black leading-normal">#Week</button>
          <button
            onClick={exportSummaryPDF}
            className="w-4 h-4 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full"
            title="Export PDF"
          >
            <img src={Download} alt="Download" className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className=" mb-[8px]">
        <div className="flex bg-[#F2F4F7] items-center h-[32px] rounded-md">
          <button
            onClick={() => {
              setViewMode('Contractor/Vendor');
              setSelectedProject(null);
            }}
            className={`flex-1 px-[16px] ml-0.5 h-[28px] rounded text-[14px] font-medium transition-colors duration-1000 ease-out ${viewMode === 'Contractor/Vendor'
                ? 'bg-white text-black'
                : 'text-[#9E9E9E]'
              }`}
          >
            Contractor/Vendor
          </button>
          <button
            onClick={() => {
              setViewMode('Project');
              setSelectedContractorOrVendorOption(null);
            }}
            className={`flex-1 px-[16px] mr-0.5 h-[28px] rounded text-[14px] font-medium transition-colors duration-1000 ease-out ${viewMode === 'Project'
                ? 'bg-white text-black'
                : 'text-[#9E9E9E]'
              }`}
          >
            Project
          </button>
        </div>
      </div>

      {/* Contractor/Vendor Selection */}
      {viewMode === 'Contractor/Vendor' && (
        <div className=" mb-[8px]">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-[12px] font-semibold text-black leading-normal">
              Contractor/Vendor<span className="text-[#E4572E]">*</span>
            </p>
            <span className="text-[12px] font-medium text-[#007233]">
              Bill Amount : {totalBillAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="relative">
            <div
              onClick={() => setShowContractorVendorModal(true)}
              className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
              style={{
                boxSizing: 'border-box',
                color: selectedContractorOrVendorOption ? '#000' : '#9E9E9E'
              }}
            >
              {selectedContractorOrVendorOption ? selectedContractorOrVendorOption.label : 'Select'}
              {selectedContractorOrVendorOption ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedContractorOrVendorOption(null);
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                >
                  <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                </button>
              ) : (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Project Selection */}
      {viewMode === 'Project' && (
        <div className=" mb-[8px]">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-[12px] font-semibold text-black leading-normal">
              Project<span className="text-[#E4572E]">*</span>
            </p>
            <span className="text-[12px] font-medium text-[#007233]">
              Bill Amount : {totalBillAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="relative">
            <div
              onClick={() => setShowProjectModal(true)}
              className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
              style={{
                boxSizing: 'border-box',
                color: selectedProject ? '#000' : '#9E9E9E'
              }}
            >
              {selectedProject ? selectedProject.label : 'Select'}
              {selectedProject ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProject(null);
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                >
                  <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                </button>
              ) : (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className=" mb-[8px]">
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="7" cy="7" r="5.5" stroke="#747474" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[36px] pl-[40px] pr-[12px] text-[12px] rounded-full font-medium bg-white focus:outline-none border border-[rgba(0,0,0,0.12)]"
          />
        </div>
      </div>

      {/* Filter and Pending Advance */}
      <div className=" pb-[8px] flex items-center justify-between flex-wrap gap-[8px]">
        <div className="flex items-center gap-[8px] min-w-0">
          <button
            type="button"
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-[8px] px-[0px] flex-shrink-0"
          >
            <img src={Filter} alt="Filter" className="w-[12px] h-[11px]" />
            {!(projectNameFilter || billStatusFilter) && (
              <span className="text-[13px] font-semibold flex-shrink-0 text-[#9E9E9E]">
                Filter
              </span>
            )}
          </button>
          {/* Active Filter Tags - Next to Filter button */}
          <div className="flex items-center gap-[8px] overflow-x-auto no-scrollbar scrollbar-none min-w-0 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* Project Name Filter Tag */}
            {projectNameFilter && (
              <div className="flex items-center gap-[6px] border px-[10px] py-[6px] rounded-full flex-shrink-0">
                <span className="text-[11px] font-medium text-black">Project</span>
                <button
                  onClick={() => setProjectNameFilter('')}
                  className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}
            {/* Bill Status Filter Tag */}
            {billStatusFilter && (
              <div className="flex items-center gap-[6px] border px-[10px] py-[6px] rounded-full flex-shrink-0">
                <span className="text-[11px] font-medium text-black">Bill Status</span>
                <button
                  onClick={() => setBillStatusFilter('')}
                  className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-[8px]">
          {(projectNameFilter || billStatusFilter) && (
            <button 
              onClick={() => {
                setProjectNameFilter('');
                setBillStatusFilter('');
              }} 
              className="text-[13px] font-semibold hover:text-black transition-colors flex-shrink-0 text-[#9E9E9E]"
            >
              x
            </button>
          )}
          <div className="text-[12px] font-semibold text-black">
            Pending Advance : <span className="text-[#E4572E]">{totalPendingAdvance.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Cards List - Scrollable */}
      <div
        className="overflow-y-auto no-scrollbar scrollbar-none scrollbar-hide max-h-[calc(100vh-210px-90px)] pb-[105px]"
      >
        {filteredSummaryData.length === 0 ? (
          <div className="flex flex-col items-center justify-center">
            <div className="w-[64px] h-[64px] rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 12H24M8 20H24M8 28H24"
                  stroke="#9E9E9E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="text-[14px] font-medium text-[#9E9E9E] text-center mt-4">
              No summary records found
            </p>
          </div>
        ) : (
          filteredSummaryData.map((item, index) => {
            const isSettled = item.pendingAdvance <= 0;
            return (
              <div
                key={index}
                className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[8px] min-w-[330px]"
              >
                <div className="flex-1 bg-white rounded-[8px] h-full px-[12px] py-[12px] transition-all duration-300 ease-out">
                  <div className="flex flex-col gap-[2px]">
                    {/* Row 1: Name and Status - Status clickable */}
                    <div className="flex items-center justify-between">
                      <p
                        className="text-[12px] font-medium text-black leading-snug break-words flex-1"
                        style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                      >
                        {item.name}
                      </p>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={() => handleStatusClick(item)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleStatusClick(item); }}
                        className={`px-[8px] py-[2px] rounded-full text-[10px] font-medium cursor-pointer active:opacity-80 ${isSettled
                            ? 'bg-[#E8F5E9] text-[#2E7D32]'
                            : 'bg-[#FFF3E0] text-[#F57C00]'
                          }`}
                      >
                        {isSettled ? 'Bill Settled' : 'Pending'}
                      </span>
                    </div>
                    {/* Row 2: Bill Amount and Pending Advance - flex layout */}
                    <div className="flex items-center justify-between gap-[8px]">
                      <p
                        role="button"
                        tabIndex={0}
                        onClick={() => handleBillAmountClick(item)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleBillAmountClick(item); }}
                        className="text-[12px] font-medium text-black leading-snug cursor-pointer active:opacity-80 hover:underline"
                      >
                        Bill Amount - {item.billAmount.toLocaleString('en-IN')}
                      </p>
                      <p
                        role="button"
                        tabIndex={0}
                        onClick={() => handleAdvanceAmountClick(item)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAdvanceAmountClick(item); }}
                        className="text-[12px] font-semibold text-black leading-snug cursor-pointer active:opacity-80 hover:underline"
                      >
                        {item.pendingAdvance.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Contractor/Vendor Modal */}
      <SelectVendorModal
        isOpen={showContractorVendorModal}
        onClose={() => setShowContractorVendorModal(false)}
        onSelect={(value) => {
          const selected = combinedOptions.find(opt => opt.label === value);
          if (selected) {
            setSelectedContractorOrVendorOption(selected);
          }
          setShowContractorVendorModal(false);
        }}
        selectedValue={selectedContractorOrVendorOption ? selectedContractorOrVendorOption.label : ''}
        options={combinedOptions.map(opt => opt.label)}
        fieldName="Contractor/Vendor"
      />

      {/* Project Modal */}
      <SelectVendorModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSelect={(value) => {
          const selected = siteOptions.find(opt => opt.label === value);
          if (selected) {
            setSelectedProject(selected);
          }
          setShowProjectModal(false);
        }}
        selectedValue={selectedProject ? selectedProject.label : ''}
        options={siteOptions.map(opt => opt.label)}
        fieldName="Project"
      />

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40" onClick={() => setShowFilterModal(false)}>
          <div className="bg-white rounded-t-2xl w-full p-[16px] relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[16px] font-semibold text-black">Select Filters</p>
              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="w-6 h-6 flex items-center justify-center"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5L15 15" stroke="#E4572E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-[16px] mb-3">
              {/* Project Name Filter */}
              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Project Name</p>
                <div className="relative">
                  <div
                    onClick={() => setShowProjectNameModal(true)}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                    style={{ boxSizing: 'border-box', color: projectNameFilter ? '#000' : '#9E9E9E' }}
                  >
                    {projectNameFilter || 'Select'}
                    {projectNameFilter ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectNameFilter('');
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                      </button>
                    ) : (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bill Status Filter */}
              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Bill Status</p>
                <div className="relative">
                  <div
                    onClick={() => setShowBillStatusModal(true)}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                    style={{ boxSizing: 'border-box', color: billStatusFilter ? '#000' : '#9E9E9E' }}
                  >
                    {billStatusFilter || 'Select'}
                    {billStatusFilter ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBillStatusFilter('');
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <img src={CloseIcon} alt="Close" className="w-[12px] h-[12px]" />
                      </button>
                    ) : (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-[16px]">
              <button
                type="button"
                onClick={() => {
                  setProjectNameFilter('');
                  setBillStatusFilter('');
                  setShowFilterModal(false);
                }}
                className="px-[24px] py-[8px] text-[14px] font-semibold text-black border border-[rgba(0,0,0,0.16)] rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="px-[24px] py-[8px] text-[14px] font-semibold text-white bg-black rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Name filter dropdown - higher z-index when opened from Filter sheet */}
      <SelectVendorModal
        isOpen={showProjectNameModal}
        onClose={() => setShowProjectNameModal(false)}
        onSelect={(value) => {
          setProjectNameFilter(value);
          setShowProjectNameModal(false);
        }}
        selectedValue={projectNameFilter}
        options={siteOptions.map((opt) => opt.label || opt.value)}
        fieldName="Project Name"
        showStarIcon={false}
        zIndex={10000}
      />

      {/* Bill Status filter dropdown - higher z-index when opened from Filter sheet */}
      <SelectVendorModal
        isOpen={showBillStatusModal}
        onClose={() => setShowBillStatusModal(false)}
        onSelect={(value) => {
          setBillStatusFilter(value);
          setShowBillStatusModal(false);
        }}
        selectedValue={billStatusFilter}
        options={['Bill Settled', 'Pending']}
        fieldName="Bill Status"
        showStarIcon={false}
        zIndex={10000}
      />

      {/* Bottom Sheet - compact list, single scrollable page */}
      {showDetailsBottomSheet && (() => {
        const isStatus = detailsBottomSheetType === 'status';
        const isBill = detailsBottomSheetType === 'bill';
        const isAdvance = detailsBottomSheetType === 'advance';
        // Type code for list prefix: BS, RF, AD, TF
        const getAdvanceTypeCode = (entry) => {
          if (entry.isRefund || entry.type === 'Refund') return 'RF';
          if (entry.type === 'Transfer') return 'TF';
          return 'AD';
        };

        let listItems = [];
        if (!isStatus && detailsPopupData) {
          listItems = sortPopupData(detailsPopupData, detailsPopupSortConfig);
        } else if (isStatus) {
          const parseDate = (str) => { const [d, m, y] = str.split('/'); return new Date(`${y}-${m}-${d}`); };
          const rows = [];
          billStatusPopupData.bills.forEach(bill => {
            rows.push({ typeCode: 'BS', date: bill.date, amount: bill.amount, advancePortalId: bill.advancePortalId, transferSiteName: null });
          });
          billStatusPopupData.advances.forEach(adv => {
            const typeCode = adv.isRefund || adv.type === 'Refund' ? 'RF' : adv.type === 'Transfer' ? 'TF' : 'AD';
            rows.push({ typeCode, date: adv.date, amount: adv.amount, advancePortalId: adv.advancePortalId, transferSiteName: adv.transferSiteName || null });
          });
          listItems = rows.sort((a, b) => {
            const d = parseDate(b.date) - parseDate(a.date);
            return d !== 0 ? d : (b.advancePortalId - a.advancePortalId);
          });
        }

        const totalAdvanceForStatus = isStatus
          ? billStatusPopupData.advances.reduce((sum, item) => sum + (item.amount || 0), 0)
          : 0;
        const totalBillForStatus = isStatus
          ? billStatusPopupData.bills.reduce((sum, item) => sum + (item.amount || 0), 0)
          : 0;
        const balanceForStatus = isStatus ? (totalAdvanceForStatus - totalBillForStatus) : 0;

        const totalForSingleType = !isStatus
          ? listItems.reduce((sum, entry) => sum + (entry.amount || 0), 0)
          : 0;

        return (
          <div
            className="fixed inset-0 z-50 flex items-end"
            onClick={() => setShowDetailsBottomSheet(false)}
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            <div
              className="relative z-10 w-full max-w-[360px] mx-auto bg-white rounded-t-[20px] shadow-lg overflow-hidden flex flex-col"
              style={{ maxHeight: '68vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header: title + download icon + close */}
              <div className="flex items-start justify-between px-[16px] pt-[16px] pb-[8px] flex-shrink-0">
                <div className="flex-1 min-w-0 pr-[8px]">
                  <h3 className="text-[14px] font-semibold leading-tight line-clamp-[8px]">
                    {isStatus ? billStatusPopupContext : detailsPopupContext}
                  </h3>
                </div>
                <div className="flex items-center gap-[4px] flex-shrink-0">
                  <button
                    onClick={exportDetailsPDF}
                    className="w-9 h-9 flex items-center justify-center rounded-full"
                    title="Export PDF"
                  >
                    <img src={Download} alt="Download" className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content: single scrollable list with type codes (BS/RF/AD/TF) and transfer site for TF */}
              <div className="flex-1 overflow-y-auto px-[16px] py-[8px] min-h-0">
                {!isStatus && listItems.map((entry, idx) => {
                const typeCode = isBill ? 'BS' : getAdvanceTypeCode(entry);
                const amountColor = entry.amount < 0 ? 'text-red-600' : (typeCode === 'RF' ? 'text-green-600' : 'text-black');
                const displayAmount = Math.abs(entry.amount || 0).toLocaleString('en-IN');
                return (
                  <div key={idx} className="py-[8px] border-b border-gray-100 last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-gray-800">#{typeCode} - {entry.advancePortalId || idx + 1} {entry.date}</span>
                      <span className={`text-[13px] font-semibold ${amountColor}`}>
                        {entry.amount < 0 ? '-' : ''}₹{displayAmount}
                      </span>
                    </div>
                    {isAdvance && typeCode === 'TF' && entry.transferSiteName && (
                      <p className="text-[11px] text-gray-500 mt-0.5 pl-[0px]">{entry.transferSiteName}</p>
                    )}
                  </div>
                );
              })}
                {isStatus && listItems.map((entry, idx) => {
                const amountColor = entry.amount < 0 ? 'text-red-600' : (entry.typeCode === 'RF' ? 'text-green-600' : 'text-black');
                const displayAmount = Math.abs(entry.amount || 0).toLocaleString('en-IN');
                return (
                  <div key={idx} className="py-[8px] border-b border-gray-100 last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-gray-800">#{entry.typeCode} - {entry.advancePortalId || idx + 1} {entry.date}</span>
                      <span className={`text-[13px] font-semibold ${amountColor}`}>
                        {entry.amount < 0 ? '-' : ''}₹{displayAmount}
                      </span>
                    </div>
                    {entry.typeCode === 'TF' && entry.transferSiteName && (
                      <p className="text-[11px] text-gray-500 mt-0.5 pl-[0px]">{entry.transferSiteName}</p>
                    )}
                  </div>
                );
              })}
              </div>

              {/* Footer: totals and balance */}
              <div className="border-t border-gray-200 px-[16px] py-[8px] bg-white flex-shrink-0">
                {isStatus ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-gray-700">Total</span>
                      <span className="font-semibold text-gray-700">
                        ₹{totalAdvanceForStatus.toLocaleString('en-IN')} - ₹{totalBillForStatus.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-[#BF9853]">Balance Advance</span>
                      <span className="font-semibold text-[#BF9853]">
                        ₹{balanceForStatus.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-gray-700">
                      {isBill ? 'Total Bill' : 'Total Advance'}
                    </span>
                    <span className="font-semibold text-gray-700">
                      ₹{totalForSingleType.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Summary;
