import React, { useEffect, useMemo, useState } from 'react';
import Download from '../Images/Download.svg';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/loans/all');
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
            const res = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/getAll', {
              method: 'GET',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) return [];
            const data = await res.json();
            return data.map((item) => ({ id: item.id, label: item.vendorName }));
          }),
          safe(async () => {
            const res = await fetch('https://backendaab.in/aabuilderDash/api/contractor_Names/getAll', {
              method: 'GET',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) return [];
            const data = await res.json();
            return data.map((item) => ({ id: item.id, label: item.contractorName }));
          }),
          safe(async () => {
            const res = await fetch('https://backendaab.in/aabuildersDash/api/employee_details/getAll', {
              method: 'GET',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) return [];
            const data = await res.json();
            return data.map((item) => ({ id: item.id, label: item.employee_name }));
          }),
          safe(async () => {
            const res = await fetch('https://backendaab.in/aabuildersDash/api/labours-details/getAll', {
              method: 'GET',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) return [];
            const data = await res.json();
            return data.map((item) => ({ id: item.id, label: item.labour_name }));
          }),
          safe(async () => {
            const res = await fetch('https://backendaab.in/aabuildersDash/api/loan-purposes/getAll', {
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

  useEffect(() => {
    if (!loading && !optionsLoading && !associateFilter && associateOptions.length > 0) {
      setAssociateFilter(associateOptions[0]);
    }
  }, [loading, optionsLoading, associateFilter, associateOptions]);

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

  const groupedPurposeCards = useMemo(() => {
    const assocLower = associateFilter ? associateFilter.toLowerCase() : '';
    const purposeLower = purposeFilter ? purposeFilter.toLowerCase() : '';
    const q = searchQuery.trim().toLowerCase();

    const map = new Map();
    for (const row of transformedEntries) {
      if (!row.associateName) continue;
      if (assocLower && row.associateName.toLowerCase() !== assocLower) continue;

      const purposeName = row.purposeName || 'N/A';
      if (purposeLower && purposeName.toLowerCase() !== purposeLower) continue;

      const key = row.purposeId != null && row.purposeId !== '' ? String(row.purposeId) : purposeName;
      if (!map.has(key)) {
        map.set(key, {
          purposeName,
          loanAmount: 0,
          refundAmount: 0,
          transferAmount: 0
        });
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
      return {
        purposeName: g.purposeName,
        loanAmount: g.loanAmount,
        pendingAmount,
        isSettled
      };
    });

    // Match screenshot feel: Pending first, then Settled, then name
    cards.sort((a, b) => {
      const aPending = a.isSettled ? 0 : 1;
      const bPending = b.isSettled ? 0 : 1;
      if (aPending !== bPending) return bPending - aPending;
      return (a.purposeName || '').toLowerCase().localeCompare((b.purposeName || '').toLowerCase(), 'en-IN');
    });

    if (q) {
      cards = cards.filter((c) => {
        const loanStr = String(Math.round(c.loanAmount || 0));
        const pendingStr = String(Math.round(c.pendingAmount || 0));
        return (
          (c.purposeName || '').toLowerCase().includes(q) ||
          loanStr.includes(q) ||
          pendingStr.includes(q)
        );
      });
    }

    return cards;
  }, [transformedEntries, associateFilter, purposeFilter, searchQuery]);

  

  const DownChevron = ({ color = '#777777' }) => (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 8L10 13L15 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="relative w-full bg-white max-w-[360px] flex flex-col scrollbar-none overflow-hidden" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="pt-[10px] mb-[8px]">
          <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-[8px]">
            <span className="text-[12px] font-semibold text-black leading-normal">#Week</span>
            <button type="button" className=" flex items-center justify-center hover:bg-gray-100 rounded-full">
              <img src={Download} alt="Download" className="w-[16px] h-[16px]" />
            </button>
          </div>
        </div>

        {/* Top toggle */}
        <div className="mb-[8px]">
          <div className="flex bg-[#F2F4F7] items-center h-[32px] rounded-md">
            <button
              type="button"
              onClick={() => setActiveFilter('Associate')}
              className={`flex-1 px-[16px] ml-0.5 h-[28px] rounded text-[14px] font-medium transition-colors duration-1000 ease-out ${
                activeFilter === 'Associate'
                  ? 'bg-white text-black'
                  : 'text-[#9E9E9E]'
              }`}
            >
              Associate
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('Purpose')}
              className={`flex-1 px-[16px] mr-0.5 h-[28px] rounded text-[14px] font-medium transition-colors duration-1000 ease-out ${
                activeFilter === 'Purpose'
                  ? 'bg-white text-black'
                  : 'text-[#9E9E9E]'
              }`}
            >
              Purpose
            </button>
          </div>
        </div>

        {/* Dropdown + totals */}
        {activeFilter === 'Associate' ? (
          <div className="mb-[8px]">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setShowAssociateModal(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setShowAssociateModal(true);
              }}
              className="bg-white border border-[#E0E0E0] rounded-[12px] px-[12px] py-[12px] cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-black leading-normal break-words">
                  {associateFilter || 'Select'}
                </p>
                <DownChevron color="#000000" />
              </div>
              <div className="mt-[12px] space-y-[6px]">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-medium text-[#9E9E9E] leading-normal">Loan Amount</p>
                  <p className="text-[12px] font-semibold text-[#E4572E] leading-normal">
                    ₹{associateTotals.loanAmount.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-medium text-[#9E9E9E] leading-normal">Pending Amount</p>
                  <p className="text-[12px] font-semibold text-[#007233] leading-normal">
                    ₹{associateTotals.pendingAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-[8px]">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setShowPurposeModal(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setShowPurposeModal(true);
              }}
              className="bg-white border border-[#E0E0E0] rounded-[12px] px-[12px] py-[12px] cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-black leading-normal break-words">
                  {purposeFilter || 'Select'}
                </p>
                <DownChevron />
              </div>
              <div className="mt-[12px] space-y-[6px]">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-medium text-[#9E9E9E] leading-normal">Loan Amount</p>
                  <p className="text-[12px] font-semibold text-[#E4572E] leading-normal">
                    ₹{purposeTotals.loanAmount.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-medium text-[#9E9E9E] leading-normal">Pending Amount</p>
                  <p className="text-[12px] font-semibold text-[#007233] leading-normal">
                    ₹{purposeTotals.pendingAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-[8px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[36px] pl-[40px] pr-[12px] text-[12px] rounded-full font-medium bg-white focus:outline-none border border-[rgba(0,0,0,0.12)] text-black placeholder:text-[#9E9E9E]"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6.5" cy="6.5" r="5.5" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M9.5 9.5L12 12" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Cards list */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar scrollbar-none scrollbar-hide pb-[105px]">
        {groupedPurposeCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[32px]">
            <p className="text-[14px] font-medium text-[#9E9E9E]">No loan records found</p>
          </div>
        ) : (
          <div className="space-y-[12px] pb-[8px]">
            {groupedPurposeCards.map((card, idx) => {
              const isSettled = card.isSettled;
              return (
                <div
                  key={`${card.purposeName}-${idx}`}
                  className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-white rounded-[12px] min-w-[330px]"
                >
                  <div className="flex-1 bg-white rounded-[8px] h-full px-[12px] py-[12px] transition-all duration-300 ease-out">
                    {/* Row 1: Purpose Name + Status pill */}
                    <div className="flex items-start justify-between gap-[10px]">
                      <p
                        className="text-[13px] font-semibold text-black leading-snug break-words flex-1"
                        style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                      >
                        {card.purposeName}
                      </p>
                      <span
                      className={`px-[10px] py-[2px] rounded-full text-[10px] font-medium active:opacity-80 flex items-center gap-[6px] ${
                        isSettled ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFF3E0] text-[#F57C00]'
                      }`}
                      >
                      <span
                        className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${
                          isSettled ? 'bg-[#2E7D32]' : 'bg-[#F57C00]'
                        }`}
                      />
                        {isSettled ? 'Settled' : 'Pending'}
                      </span>
                    </div>

                    {/* Row 2: Loan Amount (left) + Pending (right) */}
                    <div className="flex items-center justify-between gap-[12px] mt-[10px]">
                      <p className="text-[13px] font-medium text-black leading-snug">
                        Loan Amount ₹{card.loanAmount.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[13px] font-semibold text-black leading-snug">
                        ₹{card.pendingAmount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
