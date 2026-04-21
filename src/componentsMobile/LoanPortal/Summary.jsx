import React, { useCallback, useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Download from '../Images/Download.svg';
import CloseIcon from '../Images/Close F.svg';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';

const DropdownChevron = () => (
  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1L6 6L11 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const Summary = () => {
  const [loanData, setLoanData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [optionsLoading, setOptionsLoading] = useState(true);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [labourOptions, setLabourOptions] = useState([]);
  const [purposeOptions, setPurposeOptions] = useState([]);

  // UI state
  const [activeFilter, setActiveFilter] = useState('Associate'); // 'Associate' | 'Purpose'
  const [associateFilter, setAssociateFilter] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [showPurposeModal, setShowPurposeModal] = useState(false);

  const [showDetailsBottomSheet, setShowDetailsBottomSheet] = useState(false);
  /** 'loan' = loan lines only (like Bill); 'movements' = signed lines (like Advance); 'status' = combined + balance footer */
  const [detailsBottomSheetType, setDetailsBottomSheetType] = useState('loan');
  const [detailsPopupData, setDetailsPopupData] = useState([]);
  const [detailsPopupContext, setDetailsPopupContext] = useState('');
  const [detailsPopupTitle, setDetailsPopupTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://backendaab.in/demoAabuildersDash/api/loans/all');
        if (response.ok) {
          const data = await response.json();
          setLoanData(data);
        }
      } catch (error) {
        console.error('Error fetching loan data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const handleLoanUpdate = () => fetchData();
    window.addEventListener('loanUpdated', handleLoanUpdate);
    return () => window.removeEventListener('loanUpdated', handleLoanUpdate);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const safe = async (fn) => {
      try {
        return await fn();
      } catch (e) {
        console.error(e);
        return [];
      }
    };

    const loadOptions = async () => {
      try {
        const [vendors, contractors, employees, labours, purposes] = await Promise.all([
          safe(async () => {
            const res = await fetch('https://backendaab.in/demoAabuilderDash/api/vendor_Names/getAll', {
              method: 'GET',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) return [];
            const data = await res.json();
            return data.map((item) => ({ id: item.id, label: item.vendorName }));
          }),
          safe(async () => {
            const res = await fetch('https://backendaab.in/demoAabuilderDash/api/contractor_Names/getAll', {
              method: 'GET',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) return [];
            const data = await res.json();
            return data.map((item) => ({ id: item.id, label: item.contractorName }));
          }),
          safe(async () => {
            const res = await fetch('https://backendaab.in/demoAabuildersDash/api/employee_details/getAll', {
              method: 'GET',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) return [];
            const data = await res.json();
            return data.map((item) => ({ id: item.id, label: item.employee_name }));
          }),
          safe(async () => {
            const res = await fetch('https://backendaab.in/demoAabuildersDash/api/labours-details/getAll', {
              method: 'GET',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) return [];
            const data = await res.json();
            return data.map((item) => ({ id: item.id, label: item.labour_name }));
          }),
          safe(async () => {
            const res = await fetch('https://backendaab.in/demoAabuildersDash/api/loan-purposes/getAll', {
              method: 'GET',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) return [];
            const data = await res.json();
            return data.map((item) => ({ id: item.id, label: item.purpose }));
          })
        ]);

        if (!cancelled) {
          setVendorOptions(vendors);
          setContractorOptions(contractors);
          setEmployeeOptions(employees);
          setLabourOptions(labours);
          setPurposeOptions(purposes);
        }
      } finally {
        if (!cancelled) setOptionsLoading(false);
      }
    };

    loadOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  const getAssociateName = (entry) => {
    if (entry.vendor_id) {
      const vendor = vendorOptions.find((v) => v.id === entry.vendor_id);
      return vendor ? vendor.label : '';
    }
    if (entry.contractor_id) {
      const contractor = contractorOptions.find((c) => c.id === entry.contractor_id);
      return contractor ? contractor.label : '';
    }
    if (entry.employee_id) {
      const employee = employeeOptions.find((e) => e.id === entry.employee_id);
      return employee ? employee.label : '';
    }
    if (entry.labour_id) {
      const labour = labourOptions.find((l) => l.id === entry.labour_id);
      return labour ? labour.label : '';
    }
    return '';
  };

  const getPurposeName = (purposeId) => {
    if (!purposeId) return '';
    const purpose = purposeOptions.find((p) => p.id === parseInt(purposeId));
    return purpose ? purpose.label : '';
  };

  const transformedEntries = useMemo(() => {
    return loanData.map((entry, idx) => {
      const entryType = entry.type || 'Loan';
      return {
        id: entry.loanPortalId || entry.id || `${entry.entry_no || idx}-${entry.date || ''}`,
        associateName: getAssociateName(entry),
        purposeId: entry.from_purpose_id,
        purposeName: getPurposeName(entry.from_purpose_id),
        loanAmount: entryType === 'Loan' ? parseFloat(entry.amount) || 0 : 0,
        refundAmount: entryType === 'Refund' ? parseFloat(entry.loan_refund_amount) || 0 : 0,
        transferAmount: entryType === 'Transfer' ? Math.abs(parseFloat(entry.amount) || 0) : 0
      };
    });
  }, [loanData, vendorOptions, contractorOptions, employeeOptions, labourOptions, purposeOptions]);

  const associateOptions = useMemo(() => {
    const names = transformedEntries.map((e) => e.associateName).filter(Boolean);
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b, 'en-IN'));
  }, [transformedEntries]);

  const associateTotals = useMemo(() => {
    const assocLower = associateFilter ? associateFilter.toLowerCase() : '';
    const rows = assocLower
      ? transformedEntries.filter((e) => (e.associateName || '').toLowerCase() === assocLower)
      : transformedEntries;

    const loanAmt = rows.reduce((sum, r) => sum + (r.loanAmount || 0), 0);
    const refundAmt = rows.reduce((sum, r) => sum + (r.refundAmount || 0), 0);
    const transferAmt = rows.reduce((sum, r) => sum + (r.transferAmount || 0), 0);
    const pendingRaw = loanAmt - refundAmt - transferAmt;

    return {
      loanAmount: loanAmt,
      pendingAmount: pendingRaw > 0 ? pendingRaw : 0
    };
  }, [transformedEntries, associateFilter]);

  const purposeTotals = useMemo(() => {
    const purposeLower = purposeFilter ? purposeFilter.toLowerCase() : '';
    const rows = purposeLower
      ? transformedEntries.filter((e) => (e.purposeName || '').toLowerCase() === purposeLower)
      : transformedEntries;

    const loanAmt = rows.reduce((sum, r) => sum + (r.loanAmount || 0), 0);
    const refundAmt = rows.reduce((sum, r) => sum + (r.refundAmount || 0), 0);
    const transferAmt = rows.reduce((sum, r) => sum + (r.transferAmount || 0), 0);
    const pendingRaw = loanAmt - refundAmt - transferAmt;

    return {
      loanAmount: loanAmt,
      pendingAmount: pendingRaw > 0 ? pendingRaw : 0
    };
  }, [transformedEntries, purposeFilter]);

  const purposeOptionsList = useMemo(() => {
    const purposes = transformedEntries.map((e) => e.purposeName).filter(Boolean);
    return Array.from(new Set(purposes)).sort((a, b) => a.localeCompare(b, 'en-IN'));
  }, [transformedEntries]);

  const formatLoanDateOnly = (entry) => {
    const dateStr = entry?.timestamp || entry?.createdAt || entry?.created_at || entry?.date || '';
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getScopedLoanEntries = (kind, cardTitle) => {
    return loanData.filter((entry) => {
      const associateName = getAssociateName(entry);
      const purposeName = getPurposeName(entry.from_purpose_id) || '';
      if (!associateName) return false;

      if (activeFilter === 'Associate') {
        if (associateFilter && associateName.toLowerCase() !== associateFilter.toLowerCase()) return false;
        if (kind === 'card' && cardTitle != null && String(cardTitle).length) {
          const pDisplay = purposeName || 'N/A';
          if (pDisplay.toLowerCase() !== String(cardTitle).toLowerCase()) return false;
        }
        return true;
      }

      if (purposeFilter && (purposeName || 'N/A').toLowerCase() !== purposeFilter.toLowerCase()) return false;
      if (kind === 'card' && cardTitle != null && String(cardTitle).length) {
        if (associateName.toLowerCase() !== String(cardTitle).toLowerCase()) return false;
      }
      return true;
    });
  };

  const entryToMovementRow = (entry) => {
    const entryType = entry.type || 'Loan';
    const date = formatLoanDateOnly(entry);
    const id = entry.loanPortalId ?? entry.id ?? entry.entry_no ?? '';
    let amount = 0;
    let typeCode = 'LN';
    if (entryType === 'Loan') {
      amount = parseFloat(entry.amount) || 0;
      typeCode = 'LN';
    } else if (entryType === 'Refund') {
      amount = -(parseFloat(entry.loan_refund_amount) || 0);
      typeCode = 'RF';
    } else if (entryType === 'Transfer') {
      amount = parseFloat(entry.amount) || 0;
      typeCode = 'TF';
    }
    const transferNote =
      entryType === 'Transfer' && entry.to_purpose_id ? getPurposeName(entry.to_purpose_id) : null;
    return { loanPortalId: id, date, amount, typeCode, transferNote };
  };

  const parsePopupDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return new Date(0);
    const parts = dateStr.split('/');
    if (parts.length !== 3) return new Date(0);
    const [d, m, y] = parts;
    return new Date(`${y}-${m}-${d}`);
  };

  const sortPopupRows = (rows) => {
    return [...rows].sort((a, b) => {
      const diff = parsePopupDate(b.date) - parsePopupDate(a.date);
      if (diff !== 0) return diff;
      const idA = Number(a.loanPortalId) || 0;
      const idB = Number(b.loanPortalId) || 0;
      return idB - idA;
    });
  };

  const buildSheetContext = (kind, cardTitle) => {
    const assocLabel = associateFilter || 'All Associates';
    const purposeLabel = purposeFilter || 'All Purposes';
    if (kind === 'header') {
      return activeFilter === 'Associate'
        ? `${assocLabel} — ${purposeLabel}`
        : `${purposeLabel} — ${assocLabel}`;
    }
    return activeFilter === 'Associate'
      ? `${assocLabel} — ${cardTitle || ''}`
      : `${purposeLabel} — ${cardTitle || ''}`;
  };

  const openLoanSheet = (kind, cardTitle) => {
    const entries = getScopedLoanEntries(kind, cardTitle);
    const loanRows = sortPopupRows(
      entries
        .filter((e) => (e.type || 'Loan') === 'Loan')
        .map((e) => entryToMovementRow(e))
        .filter((r) => (r.amount || 0) > 0)
    );
    if (loanRows.length === 0) return;
    setDetailsBottomSheetType('loan');
    setDetailsPopupTitle('Loan Details');
    setDetailsPopupData(loanRows);
    setDetailsPopupContext(buildSheetContext(kind, cardTitle));
    setShowDetailsBottomSheet(true);
  };

  const openMovementsSheet = (kind, cardTitle) => {
    const entries = getScopedLoanEntries(kind, cardTitle);
    const rows = sortPopupRows(entries.map((e) => entryToMovementRow(e)));
    if (rows.length === 0) return;
    setDetailsBottomSheetType('movements');
    setDetailsPopupTitle('Loan Movements');
    setDetailsPopupData(rows);
    setDetailsPopupContext(buildSheetContext(kind, cardTitle));
    setShowDetailsBottomSheet(true);
  };

  const openStatusSheet = (kind, cardTitle) => {
    const entries = getScopedLoanEntries(kind, cardTitle);
    const rows = sortPopupRows(entries.map((e) => entryToMovementRow(e)));
    if (rows.length === 0) return;
    setDetailsBottomSheetType('status');
    setDetailsPopupTitle('Loan Status');
    setDetailsPopupData(rows);
    setDetailsPopupContext(buildSheetContext(kind, cardTitle));
    setShowDetailsBottomSheet(true);
  };

  const statusTotalsFromRows = useCallback((rows) => {
    let totalLoan = 0;
    let totalOut = 0;
    rows.forEach((e) => {
      if (e.typeCode === 'LN') totalLoan += e.amount || 0;
      if (e.typeCode === 'RF' || e.typeCode === 'TF') totalOut += Math.abs(e.amount || 0);
    });
    return { totalLoan, totalOut, balance: totalLoan - totalOut };
  }, []);

  const exportLoanBottomSheetPDF = useCallback(() => {
    const data = detailsPopupData || [];
    if (data.length === 0) return;
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const ctxLines = doc.splitTextToSize(detailsPopupContext, 180);
    doc.text(ctxLines, 14, 12);
    let y = 12 + ctxLines.length * 5;
    doc.setFontSize(10);
    doc.text(detailsPopupTitle, 14, y);
    y += 6;
    const body = data.map((entry) => [
      `#${entry.typeCode} - ${entry.loanPortalId} ${entry.date}`,
      `${entry.amount < 0 ? '-' : ''}₹${Math.abs(entry.amount || 0).toLocaleString('en-IN')}`
    ]);
    if (detailsBottomSheetType === 'loan') {
      const total = data.reduce((s, e) => s + (e.amount || 0), 0);
      body.push(['Total Loan', `₹${total.toLocaleString('en-IN')}`]);
    } else if (detailsBottomSheetType === 'movements') {
      const total = data.reduce((s, e) => s + (e.amount || 0), 0);
      body.push(['Total', `₹${total.toLocaleString('en-IN')}`]);
    } else {
      const { totalLoan, totalOut, balance } = statusTotalsFromRows(data);
      body.push(['Total', `₹${totalLoan.toLocaleString('en-IN')} - ₹${totalOut.toLocaleString('en-IN')}`]);
      body.push(['Balance Loan', `₹${balance.toLocaleString('en-IN')}`]);
    }
    doc.autoTable({
      head: [['Reference', 'Amount']],
      body,
      startY: y + 2,
      theme: 'grid',
      headStyles: { fillColor: [255, 255, 255], lineWidth: 0.2, lineColor: [100, 100, 100], fontStyle: 'bold' },
      styles: { textColor: 0, lineWidth: 0.2, lineColor: [100, 100, 100], fontSize: 9 },
      columnStyles: { 1: { halign: 'right' } }
    });
    const safe = (detailsPopupContext || 'loan').replace(/[^a-z0-9]/gi, '_');
    doc.save(`${safe}_${(detailsPopupTitle || 'export').replace(/[^a-z0-9]/gi, '_')}.pdf`);
  }, [detailsPopupData, detailsPopupContext, detailsPopupTitle, detailsBottomSheetType, statusTotalsFromRows]);

  /** Associate mode: cards per purpose (like Project Advance per project). Purpose mode: cards per associate. */
  const summaryCards = useMemo(() => {
    const assocLower = associateFilter ? associateFilter.toLowerCase() : '';
    const purposeLower = purposeFilter ? purposeFilter.toLowerCase() : '';
    const q = searchQuery.trim().toLowerCase();
    const map = new Map();

    for (const row of transformedEntries) {
      if (!row.associateName) continue;
      if (activeFilter === 'Associate' && assocLower && row.associateName.toLowerCase() !== assocLower) continue;

      const purposeName = row.purposeName || 'N/A';
      if (activeFilter === 'Purpose' && purposeLower && purposeName.toLowerCase() !== purposeLower) continue;

      let key;
      let title;
      if (activeFilter === 'Associate') {
        key = row.purposeId != null && row.purposeId !== '' ? String(row.purposeId) : purposeName;
        title = purposeName;
      } else {
        key = row.associateName;
        title = row.associateName;
      }

      if (!map.has(key)) {
        map.set(key, { title, loanAmount: 0, refundAmount: 0, transferAmount: 0 });
      }
      const g = map.get(key);
      g.loanAmount += row.loanAmount || 0;
      g.refundAmount += row.refundAmount || 0;
      g.transferAmount += row.transferAmount || 0;
    }

    let cards = Array.from(map.values()).map((g) => {
      const pendingRaw = (g.loanAmount || 0) - (g.refundAmount || 0) - (g.transferAmount || 0);
      const pendingAmount = pendingRaw > 0 ? pendingRaw : 0;
      const isSettled = pendingRaw <= 0;
      return { title: g.title, loanAmount: g.loanAmount, pendingAmount, isSettled };
    });

    cards.sort((a, b) => {
      const aPending = a.isSettled ? 0 : 1;
      const bPending = b.isSettled ? 0 : 1;
      if (aPending !== bPending) return bPending - aPending;
      return (a.title || '').toLowerCase().localeCompare((b.title || '').toLowerCase(), 'en-IN');
    });

    if (q) {
      cards = cards.filter((c) => {
        const loanStr = String(Math.round(c.loanAmount || 0));
        const pendingStr = String(Math.round(c.pendingAmount || 0));
        return (
          (c.title || '').toLowerCase().includes(q) ||
          loanStr.includes(q) ||
          pendingStr.includes(q)
        );
      });
    }

    return cards;
  }, [transformedEntries, associateFilter, purposeFilter, searchQuery, activeFilter]);

  const headerTotals = activeFilter === 'Associate' ? associateTotals : purposeTotals;

  return (
    <div className="relative w-full bg-white max-w-[360px] flex flex-col scrollbar-none overflow-hidden" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="flex-shrink-0">
        <div className="pt-[8px] mb-[8px]">
          <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-[10px]">
            <button type="button" className="text-[12px] font-semibold text-black leading-normal">
              #Week
            </button>
            <button
              type="button"
              className="w-4 h-4 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full"
              title="Download"
            >
              <img src={Download} alt="Download" className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mb-[8px]">
          <div className="flex bg-[#F2F4F7] items-center h-[32px] rounded-md">
            <button
              type="button"
              onClick={() => setActiveFilter('Associate')}
              className={`flex-1 px-[16px] ml-0.5 h-[28px] rounded text-[14px] font-medium transition-colors duration-1000 ease-out ${
                activeFilter === 'Associate' ? 'bg-white text-black' : 'text-[#9E9E9E]'
              }`}
            >
              Associate
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('Purpose')}
              className={`flex-1 px-[16px] mr-0.5 h-[28px] rounded text-[14px] font-medium transition-colors duration-1000 ease-out ${
                activeFilter === 'Purpose' ? 'bg-white text-black' : 'text-[#9E9E9E]'
              }`}
            >
              Purpose
            </button>
          </div>
        </div>

        {activeFilter === 'Associate' ? (
          <div className="mb-[8px]">
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-[12px] font-semibold text-black leading-normal">
                Associate<span className="text-[#E4572E]">*</span>
              </p>
              <button
                type="button"
                onClick={() => openLoanSheet('header', null)}
                className="text-[12px] font-medium text-[#007233] cursor-pointer active:opacity-80 hover:underline text-right"
              >
                Loan Amount : {headerTotals.loanAmount.toLocaleString('en-IN')}
              </button>
            </div>
            <div className="relative">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setShowAssociateModal(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setShowAssociateModal(true);
                }}
                className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                style={{
                  boxSizing: 'border-box',
                  color: associateFilter ? '#000' : '#9E9E9E'
                }}
              >
                {associateFilter || 'Select'}
                {associateFilter ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAssociateFilter('');
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <img src={CloseIcon} alt="Clear" className="w-[12px] h-[12px]" />
                  </button>
                ) : (
                  <DropdownChevron />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-[8px]">
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-[12px] font-semibold text-black leading-normal">
                Purpose<span className="text-[#E4572E]">*</span>
              </p>
              <button
                type="button"
                onClick={() => openLoanSheet('header', null)}
                className="text-[12px] font-medium text-[#007233] cursor-pointer active:opacity-80 hover:underline text-right"
              >
                Loan Amount : {headerTotals.loanAmount.toLocaleString('en-IN')}
              </button>
            </div>
            <div className="relative">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setShowPurposeModal(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setShowPurposeModal(true);
                }}
                className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                style={{
                  boxSizing: 'border-box',
                  color: purposeFilter ? '#000' : '#9E9E9E'
                }}
              >
                {purposeFilter || 'Select'}
                {purposeFilter ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPurposeFilter('');
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <img src={CloseIcon} alt="Clear" className="w-[12px] h-[12px]" />
                  </button>
                ) : (
                  <DropdownChevron />
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mb-[8px]">
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
              className="w-full h-[36px] pl-[40px] pr-[12px] text-[12px] rounded-full font-medium bg-white focus:outline-none border border-[rgba(0,0,0,0.12)] text-black placeholder:text-[#9E9E9E]"
            />
          </div>
        </div>

        <div className="pb-[8px] flex items-center justify-end flex-wrap gap-[12px]">
          <button
            type="button"
            onClick={() => openMovementsSheet('header', null)}
            className="text-[12px] font-semibold text-black cursor-pointer active:opacity-80 text-right"
          >
            Pending Amount :{' '}
            <span className="text-[#E4572E]">{headerTotals.pendingAmount.toLocaleString('en-IN')}</span>
          </button>
          <button
            type="button"
            onClick={() => openStatusSheet('header', null)}
            className="text-[12px] font-semibold text-[#9E9E9E] cursor-pointer active:opacity-80 hover:text-black"
          >
            Status
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar scrollbar-none scrollbar-hide max-h-[calc(100vh-210px-90px)] pb-[105px]">
        {summaryCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[32px]">
            <div className="w-[64px] h-[64px] rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 12H24M8 20H24M8 28H24" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-[14px] font-medium text-[#9E9E9E] text-center mt-4">No loan records found</p>
          </div>
        ) : (
          <div className="space-y-[12px] pb-[8px]">
            {summaryCards.map((card, idx) => {
              const isSettled = card.isSettled;
              return (
                <div
                  key={`${card.title}-${idx}`}
                  className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[8px] min-w-[330px]"
                >
                  <div className="flex-1 bg-white rounded-[8px] h-full px-[12px] py-[12px] transition-all duration-300 ease-out">
                    <div className="flex flex-col gap-[2px]">
                      <div className="flex items-center justify-between">
                        <p
                          className="text-[12px] font-medium text-black leading-snug break-words flex-1"
                          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                        >
                          {card.title}
                        </p>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={() => openStatusSheet('card', card.title)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') openStatusSheet('card', card.title);
                          }}
                          className={`px-[8px] py-[2px] rounded-full text-[10px] font-medium cursor-pointer active:opacity-80 ${
                            isSettled ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFF3E0] text-[#F57C00]'
                          }`}
                        >
                          {isSettled ? 'Settled' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-[8px]">
                        <p
                          role="button"
                          tabIndex={0}
                          onClick={() => openLoanSheet('card', card.title)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') openLoanSheet('card', card.title);
                          }}
                          className="text-[12px] font-medium text-black leading-snug cursor-pointer active:opacity-80 hover:underline"
                        >
                          Loan Amount - {card.loanAmount.toLocaleString('en-IN')}
                        </p>
                        <p
                          role="button"
                          tabIndex={0}
                          onClick={() => openMovementsSheet('card', card.title)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') openMovementsSheet('card', card.title);
                          }}
                          className="text-[12px] font-semibold text-black leading-snug cursor-pointer active:opacity-80 hover:underline"
                        >
                          {card.pendingAmount.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showDetailsBottomSheet && (() => {
        const isStatus = detailsBottomSheetType === 'status';
        const isLoan = detailsBottomSheetType === 'loan';
        const listItems = detailsPopupData || [];
        const totalLoanLines = isLoan ? listItems.reduce((s, e) => s + (e.amount || 0), 0) : 0;
        const totalMovements = !isStatus && !isLoan ? listItems.reduce((s, e) => s + (e.amount || 0), 0) : 0;
        const { totalLoan, totalOut, balance } = isStatus ? statusTotalsFromRows(listItems) : { totalLoan: 0, totalOut: 0, balance: 0 };

        return (
          <div
            className="fixed inset-0 z-[100] flex items-end"
            onClick={() => setShowDetailsBottomSheet(false)}
            style={{ fontFamily: "'Manrope', sans-serif" }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            <div
              className="relative z-10 w-full max-w-[360px] mx-auto bg-white rounded-t-[20px] shadow-lg overflow-hidden flex flex-col"
              style={{ maxHeight: '68vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between px-[16px] pt-[16px] pb-[8px] flex-shrink-0">
                <div className="flex-1 min-w-0 pr-[8px]">
                  <h3 className="text-[14px] font-semibold leading-tight text-black">{detailsPopupContext}</h3>
                  <p className="text-[11px] font-medium text-[#9E9E9E] mt-0.5">{detailsPopupTitle}</p>
                </div>
                <div className="flex items-center gap-[4px] flex-shrink-0">
                  <button
                    type="button"
                    onClick={exportLoanBottomSheetPDF}
                    className="w-9 h-9 flex items-center justify-center rounded-full"
                    title="Export PDF"
                  >
                    <img src={Download} alt="Download" className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-[16px] py-[8px] min-h-0">
                {listItems.map((entry, idx) => {
                  const amountColor =
                    entry.amount < 0 ? 'text-red-600' : entry.typeCode === 'RF' ? 'text-green-600' : 'text-black';
                  const displayAmount = Math.abs(entry.amount || 0).toLocaleString('en-IN');
                  return (
                    <div key={idx} className="py-[8px] border-b border-gray-100 last:border-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] text-gray-800 break-words pr-2">
                          #{entry.typeCode} - {entry.loanPortalId} {entry.date}
                        </span>
                        <span className={`text-[13px] font-semibold flex-shrink-0 ${amountColor}`}>
                          {entry.amount < 0 ? '-' : ''}₹{displayAmount}
                        </span>
                      </div>
                      {entry.typeCode === 'TF' && entry.transferNote && (
                        <p className="text-[11px] text-gray-500 mt-0.5">{entry.transferNote}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-200 px-[16px] py-[8px] bg-white flex-shrink-0">
                {isStatus ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-gray-700">Total</span>
                      <span className="font-semibold text-gray-700">
                        ₹{totalLoan.toLocaleString('en-IN')} - ₹{totalOut.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-[#BF9853]">Balance Loan</span>
                      <span className="font-semibold text-[#BF9853]">₹{balance.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-gray-700">
                      {isLoan ? 'Total Loan' : 'Total'}
                    </span>
                    <span className="font-semibold text-gray-700">
                      ₹{(isLoan ? totalLoanLines : totalMovements).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modals */}
      <SelectVendorModal
        isOpen={showAssociateModal}
        onClose={() => setShowAssociateModal(false)}
        onSelect={(value) => {
          setAssociateFilter(value);
          setShowAssociateModal(false);
        }}
        selectedValue={associateFilter}
        options={associateOptions}
        fieldName="Associate"
        showStarIcon={false}
      />

      <SelectVendorModal
        isOpen={showPurposeModal}
        onClose={() => setShowPurposeModal(false)}
        onSelect={(value) => {
          setPurposeFilter(value);
          setShowPurposeModal(false);
        }}
        selectedValue={purposeFilter}
        options={purposeOptionsList}
        fieldName="Purpose"
        showStarIcon={false}
      />
    </div>
  );
};

export default Summary;
