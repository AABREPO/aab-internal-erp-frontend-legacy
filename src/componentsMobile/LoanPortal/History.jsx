import React, { useState, useEffect } from 'react';
import Filter from '../Images/Filter.png';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';
import Pen from '../Images/Pen.svg';
import CloseIcon from '../Images/Close F.svg'

const History = () => {
  const resolveActiveBranchId = () => {
    try {
      const selectedBranchId = localStorage.getItem("selectedBranchId");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
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
    if (activeBranchId !== null && activeBranchId !== undefined && activeBranchId !== "") {
      url.searchParams.set("branchId", String(activeBranchId));
    }
    return url.toString();
  };

  const [loanData, setLoanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [labourOptions, setLabourOptions] = useState([]);
  const [purposeOptions, setPurposeOptions] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [typeSearchQuery, setTypeSearchQuery] = useState('');
  const [associateFilter, setAssociateFilter] = useState('');
  const [entryNoFilter, setEntryNoFilter] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('');
  const [paymentModeFilter, setPaymentModeFilter] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [showEntryNoModal, setShowEntryNoModal] = useState(false);
  const [showPurposeModal, setShowPurposeModal] = useState(false);
  const [showPaymentModeModal, setShowPaymentModeModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(withBranchUrl('https://backendaab.in/aabuildersDash/api/loans/all'));
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
  }, [activeBranchId]);

  // Fetch vendors
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
          const data = await response.json();
          setVendorOptions(data.map(item => ({ id: item.id, label: item.vendorName })));
        }
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };
    fetchVendors();
  }, []);

  // Fetch contractors
  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/contractor_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
          const data = await response.json();
          setContractorOptions(data.map(item => ({ id: item.id, label: item.contractorName })));
        }
      } catch (error) {
        console.error("Error fetching contractors:", error);
      }
    };
    fetchContractors();
  }, []);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuildersDash/api/employee_details/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
          const data = await response.json();
          setEmployeeOptions(data.map(item => ({ id: item.id, label: item.employee_name })));
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch labour
  useEffect(() => {
    const fetchLabour = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuildersDash/api/labours-details/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
          const data = await response.json();
          setLabourOptions(data.map(item => ({ id: item.id, label: item.labour_name })));
        }
      } catch (error) {
        console.error("Error fetching labour:", error);
      }
    };
    fetchLabour();
  }, []);

  // Fetch purposes
  useEffect(() => {
    const fetchPurposes = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/loan-purposes/getAll', {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
          const data = await response.json();
          setPurposeOptions(data.map(item => ({ id: item.id, label: item.purpose })));
        }
      } catch (error) {
        console.error("Error fetching purposes:", error);
      }
    };
    fetchPurposes();
  }, []);

  const getAssociateName = (entry) => {
    if (entry.vendor_id) {
      const vendor = vendorOptions.find(v => v.id === entry.vendor_id);
      return vendor ? vendor.label : '';
    }
    if (entry.contractor_id) {
      const contractor = contractorOptions.find(c => c.id === entry.contractor_id);
      return contractor ? contractor.label : '';
    }
    if (entry.employee_id) {
      const employee = employeeOptions.find(e => e.id === entry.employee_id);
      return employee ? employee.label : '';
    }
    if (entry.labour_id) {
      const labour = labourOptions.find(l => l.id === entry.labour_id);
      return labour ? labour.label : '';
    }
    return '';
  };

  const getPurposeName = (purposeId) => {
    if (!purposeId) return '';
    const purpose = purposeOptions.find(p => p.id === parseInt(purposeId));
    return purpose ? purpose.label : '';
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
      const date = new Date(dateTimeString);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const timeStr = `${hours}:${minutes} ${ampm}`;
      if (dateOnly.getTime() === today.getTime()) {
        return `Today • ${timeStr}`;
      } else if (dateOnly.getTime() === yesterday.getTime()) {
        return `Yesterday • ${timeStr}`;
      } else {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year} • ${timeStr}`;
      }
    } catch {
      return '';
    }
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const transformEntries = () => {
    return loanData
      .map((entry) => {
        const associateName = getAssociateName(entry);
        const purposeName = getPurposeName(entry.from_purpose_id);
        const entryType = entry.type || 'Loan';

        let amount = 0;
        if (entryType === 'Loan' || entryType === 'Transfer') {
          amount = parseFloat(entry.amount) || 0;
        } else if (entryType === 'Refund') {
          amount = -(parseFloat(entry.loan_refund_amount) || 0);
        }

        const dateStr = entry.timestamp || entry.createdAt || entry.created_at || entry.date || '';
        const entryNo = entry.entry_no || 0;
        const formattedDate = dateStr ? formatDateOnly(dateStr) : '';

        let prefix = 'LN';
        if (entryType === 'Refund') {
          prefix = 'RF';
        } else if (entryType === 'Transfer') {
          prefix = 'TF';
        }
        const ref = `${prefix} - ${formattedDate} - ${entryNo}`;

        // Get transfer destination for Transfer type
        const transferTo = entryType === 'Transfer' && entry.to_purpose_id
          ? getPurposeName(entry.to_purpose_id)
          : '';

        return {
          id: entry.loanPortalId || entry.id || `${entry.entry_no}-${entry.date}`,
          ref,
          associateName,
          purposeName,
          transferTo,
          timestamp: dateStr,
          type: entryType,
          paymentMode: entry.loan_payment_mode || '',
          amount,
          entry,
        };
      })
      .sort((a, b) => {
        const noA = a.entry.entry_no || 0;
        const noB = b.entry.entry_no || 0;
        return noB - noA;
      });
  };

  const transformed = transformEntries();

  const filtered = (() => {
    let result = transformed;
    if (typeFilter) {
      result = result.filter((item) => (item.type || '').toLowerCase() === typeFilter.toLowerCase());
    }
    if (associateFilter) {
      result = result.filter((item) => {
        const associateName = item.associateName || '';
        return associateName.toLowerCase() === associateFilter.toLowerCase();
      });
    }
    if (entryNoFilter) {
      result = result.filter((item) => {
        const entryNo = String(item.entry.entry_no || '');
        return entryNo === entryNoFilter;
      });
    }
    if (purposeFilter) {
      result = result.filter((item) => {
        const purposeName = item.purposeName || '';
        return purposeName.toLowerCase() === purposeFilter.toLowerCase();
      });
    }
    if (paymentModeFilter) {
      result = result.filter((item) => {
        const paymentMode = item.paymentMode || '';
        return paymentMode.toLowerCase() === paymentModeFilter.toLowerCase();
      });
    }
    return result;
  })();

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'Loan':
        return 'bg-[#FFF3E0] text-[#E4572E]';
      case 'Refund':
        return 'bg-[#FFF3E0] text-[#E4572E]';
      case 'Transfer':
        return 'bg-[#FFF3E0] text-black';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const combinedAssociateOptions = [
    ...vendorOptions.map(opt => opt.label),
    ...contractorOptions.map(opt => opt.label),
    ...employeeOptions.map(opt => opt.label),
    ...labourOptions.map(opt => opt.label)
  ];

  return (
    <div
      className="relative w-full bg-white max-w-[360px] mx-auto flex flex-col scrollbar-none overflow-hidden"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {/* Date and Category Section */}
      <div className="">
        <div className="flex-shrink-0 flex mb-[8px] items-center border-b border-[#E0E0E0] justify-between pt-[8px] pb-[8px]">
          <div />
          <div className="flex items-center gap-[8px]">
            <button
              type="button"
              onClick={() => setShowTypeModal(true)}
              className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:underline p-0 border-0 bg-transparent"
            >
              {typeFilter || 'Type'}
            </button>
            {typeFilter && (
              <button
                type="button"
                onClick={() => setTypeFilter('')}
                className="w-4 h-4 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Filter */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between gap-[20px]">
          <div className="flex items-center gap-[4px] min-w-0">
            <button
              type="button"
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-[4px] px-[6px] py-[2px] flex-shrink-0"
            >
              <img src={Filter} alt="Filter" className="w-[11px] h-[11px]" />
              {!(typeFilter || associateFilter || entryNoFilter || purposeFilter || paymentModeFilter) && (
                <span className="text-[13px] font-semibold flex-shrink-0 text-[#9E9E9E]">
                  Filter
                </span>
              )}
            </button>
            {/* Active Filter Tags */}
            <div className="flex items-center gap-[4px] overflow-x-auto no-scrollbar scrollbar-none min-w-0 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {typeFilter && (
                <div className="flex items-center gap-[6px] border px-[6px] py-[2px] rounded-full flex-shrink-0">
                  <span className="text-[11px] font-medium text-black">{typeFilter}</span>
                  <button
                    onClick={() => setTypeFilter('')}
                    className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
              {associateFilter && (
                <div className="flex items-center gap-[6px] border px-[6px] py-[2px] rounded-full flex-shrink-0">
                  <span className="text-[11px] font-medium text-black">Associate</span>
                  <button
                    onClick={() => setAssociateFilter('')}
                    className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
              {entryNoFilter && (
                <div className="flex items-center gap-[6px] border px-[6px] py-[2px] rounded-full flex-shrink-0">
                  <span className="text-[11px] font-medium text-black">Entry. No</span>
                  <button
                    onClick={() => setEntryNoFilter('')}
                    className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
              {purposeFilter && (
                <div className="flex items-center gap-[6px] border px-[6px] py-[2px] rounded-full flex-shrink-0">
                  <span className="text-[11px] font-medium text-black">Purpose</span>
                  <button
                    onClick={() => setPurposeFilter('')}
                    className="w-4 h-4 flex items-center justify-center hover:bg-gray-300 rounded-full transition-colors"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 3L3 7M3 3L7 7" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
              {paymentModeFilter && (
                <div className="flex items-center gap-[6px] border px-[6px] py-[2px] rounded-full flex-shrink-0">
                  <span className="text-[11px] font-medium text-black">Mode</span>
                  <button
                    onClick={() => setPaymentModeFilter('')}
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
          {(typeFilter || associateFilter || entryNoFilter || purposeFilter || paymentModeFilter) && (
            <button
              onClick={() => {
                setTypeFilter('');
                setAssociateFilter('');
                setEntryNoFilter('');
                setPurposeFilter('');
                setPaymentModeFilter('');
              }}
              className="text-[13px] font-semibold hover:text-black transition-colors flex-shrink-0 text-[#9E9E9E]"
            >
              x
            </button>
          )}
        </div>
      </div>
      {/* Cards List - Scrollable */}
      <div
        className="overflow-y-auto no-scrollbar scrollbar-none scrollbar-hide mt-1 max-h-[calc(100vh-160px-80px)]"
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[48px]">
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
              No loan records found
            </p>
          </div>
        ) : (
          <div className="">
            {filtered.map((item) => {
              return (
                <div
                  key={item.id}
                  className="relative overflow-hidden shadow-lg border border-[#E0E0E0] border-opacity-30 bg-[#F8F8F8] rounded-[8px] min-w-[330px]"
                  style={{
                    height: '95px',
                  }}
                >
                  <div
                    className="flex-1 bg-white rounded-[8px] h-full px-[12px] py-[12px]"
                  >
                    <div className="flex flex-col gap-[2px]">
                      {/* Row 1: ref and payment mode */}
                      <div className="flex items-center justify-between">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            const desc = item.entry?.description || '';
                            if (desc) {
                              setSelectedDescription(desc);
                              setShowDescriptionModal(true);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              const desc = item.entry?.description || '';
                              if (desc) {
                                setSelectedDescription(desc);
                                setShowDescriptionModal(true);
                              }
                            }
                          }}
                          className={`text-[12px] font-semibold text-black leading-snug ${item.entry?.description ? 'cursor-pointer hover:underline' : ''}`}
                        >
                          {item.ref}
                        </span>
                        <span
                          className={`px-[8px] py-[2px] rounded-full text-[10px] font-medium flex items-center gap-[4px] ${getTypeBadgeClass(
                            item.type
                          )}`}
                        >
                          {item.type === 'Transfer' && !item.paymentMode ? 'Online' : (item.paymentMode || '')}
                        </span>
                      </div>
                      {/* Row 2: associateName */}
                      <div className="flex items-center justify-between">
                        <p
                          className="text-[12px] font-semibold text-black leading-snug break-words"
                          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                        >
                          {item.associateName || 'N/A'}
                        </p>
                        <span></span>
                      </div>
                      {/* Row 3: purposeName and amount */}
                      <div className="flex items-center justify-between">
                        <p
                          className="text-[11px] font-medium text-[#777777] leading-snug break-words"
                          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                        >
                          {item.purposeName || 'N/A'}
                        </p>
                        {item.entry?.file_url ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(item.entry.file_url, '_blank', 'noopener,noreferrer');
                            }}
                            className={`text-[12px] font-semibold block leading-snug cursor-pointer hover:underline focus:outline-none focus:underline ${item.amount < 0 ? 'text-[#E4572E]' : 'text-[#007233]'}`}
                          >
                            {item.amount < 0 ? '-' : ''}₹{Math.abs(item.amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </button>
                        ) : (
                          <p
                            className={`text-[12px] font-semibold block leading-snug ${item.amount < 0 ? 'text-[#E4572E]' : 'text-[#007233]'}`}
                          >
                            {item.amount < 0 ? '-' : ''}₹{Math.abs(item.amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                      {/* Row 4: timestamp and transferTo */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-[#777777] leading-snug">
                          {formatDateTime(item.timestamp)}
                        </span>
                        {item.type === 'Transfer' && item.transferTo && (
                          <p className={`text-[10px] font-semibold leading-snug ${item.amount < 0 ? 'text-[#BF9853]' : 'text-[#007233]'}`}>
                            {item.transferTo}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Select Type Modal */}
      {showTypeModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-[16px]"
          onClick={() => {
            setShowTypeModal(false);
            setTypeSearchQuery('');
          }}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div
            className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] -translate-y-[22px] rounded-b-[20px] shadow-lg flex flex-col transform max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-[24px] pt-[20px]">
              <p className="text-[16px] font-semibold text-black">Select Type</p>
              <button
                onClick={() => {
                  setShowTypeModal(false);
                  setTypeSearchQuery('');
                }}
                className="text-red-500 text-[20px] font-semibold hover:opacity-80 transition-opacity"
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L10 10M10 1L1 10" stroke="#e4572e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="px-[24px] pt-[4px] pb-[6px]">
              <div className="relative">
                <input
                  type="text"
                  value={typeSearchQuery}
                  onChange={(e) => setTypeSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full h-[32px] pl-[40px] pr-[16px] border border-[rgba(0,0,0,0.16)] rounded-[8px] text-[12px] font-medium text-black placeholder:text-[#9E9E9E] bg-white focus:outline-none"
                  autoFocus
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="6.5" cy="6.5" r="5.5" stroke="#747474" strokeWidth="1.5" />
                    <path d="M9.5 9.5L12 12" stroke="#747474" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>
            <div
              className="flex-1 overflow-y-auto mb-[8px] px-[24px] min-h-[65vh] [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
            >
              <div className="shadow-md rounded-lg overflow-hidden">
                {(['Loan', 'Refund', 'Transfer']
                  .filter(type => type.toLowerCase().includes(typeSearchQuery.toLowerCase()))
                  .map((type, index) => {
                    const isSelected = typeFilter === type;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setTypeFilter(typeFilter === type ? '' : type);
                          setShowTypeModal(false);
                          setTypeSearchQuery('');
                        }}
                        className={`w-full h-[40px] px-[24px] flex items-center justify-between transition-colors ${isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'
                          }`}
                      >
                        <div className="flex items-center gap-[12px] flex-1 min-w-0">
                          <p className="text-[14px] font-medium text-black text-left truncate">{type}</p>
                        </div>
                        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 ml-3">
                          {isSelected ? (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="10" cy="10" r="9" stroke="#e4572e" strokeWidth="2" fill="none" />
                              <circle cx="10" cy="10" r="4" fill="#e4572e" />
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="10" cy="10" r="9" stroke="#9E9E9E" strokeWidth="1.5" fill="none" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  }))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40"
          onClick={() => setShowFilterModal(false)}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div
            className="bg-white rounded-t-2xl w-full h-[220px] p-[16px] relative"
            onClick={(e) => e.stopPropagation()}
          >
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
            <div className="grid grid-cols-[2fr_1fr] gap-[16px] mb-3">
              {/* Associate Filter */}
              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Associate</p>
                <div className="relative">
                  <div
                    onClick={() => setShowAssociateModal(true)}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                    style={{ boxSizing: 'border-box', color: associateFilter ? '#000' : '#9E9E9E' }}
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
              {/* Entry. No Filter */}
              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Entry. No</p>
                <div className="relative">
                  <div
                    onClick={() => setShowEntryNoModal(true)}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                    style={{ boxSizing: 'border-box', color: entryNoFilter ? '#000' : '#9E9E9E' }}
                  >
                    {entryNoFilter || 'Select'}
                    {entryNoFilter ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEntryNoFilter('');
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
              {/* Purpose Filter */}
              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Purpose</p>
                <div className="relative">
                  <div
                    onClick={() => setShowPurposeModal(true)}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                    style={{ boxSizing: 'border-box', color: purposeFilter ? '#000' : '#9E9E9E' }}
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
              {/* Mode Filter */}
              <div>
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">Mode</p>
                <div className="relative">
                  <div
                    onClick={() => setShowPaymentModeModal(true)}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                    style={{ boxSizing: 'border-box', color: paymentModeFilter ? '#000' : '#9E9E9E' }}
                  >
                    {paymentModeFilter || 'Select'}
                    {paymentModeFilter ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPaymentModeFilter('');
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
          </div>
        </div>
      )}

      {/* Associate Modal */}
      <SelectVendorModal
        isOpen={showAssociateModal}
        onClose={() => setShowAssociateModal(false)}
        onSelect={(value) => {
          setAssociateFilter(value);
          setShowAssociateModal(false);
        }}
        selectedValue={associateFilter}
        options={combinedAssociateOptions}
        fieldName="Associate"
        showStarIcon={false}
      />

      {/* Entry No Modal */}
      <SelectVendorModal
        isOpen={showEntryNoModal}
        onClose={() => setShowEntryNoModal(false)}
        onSelect={(value) => {
          setEntryNoFilter(value);
          setShowEntryNoModal(false);
        }}
        selectedValue={entryNoFilter}
        options={[...new Set(transformed.map((item) => String(item.entry.entry_no || '')))].sort((a, b) => Number(b) - Number(a))}
        fieldName="Entry. No"
        showStarIcon={false}
      />

      {/* Purpose Modal */}
      <SelectVendorModal
        isOpen={showPurposeModal}
        onClose={() => setShowPurposeModal(false)}
        onSelect={(value) => {
          setPurposeFilter(value);
          setShowPurposeModal(false);
        }}
        selectedValue={purposeFilter}
        options={purposeOptions.map(opt => opt.label)}
        fieldName="Purpose"
        showStarIcon={false}
      />

      {/* Payment Mode Modal */}
      <SelectVendorModal
        isOpen={showPaymentModeModal}
        onClose={() => setShowPaymentModeModal(false)}
        onSelect={(value) => {
          setPaymentModeFilter(value);
          setShowPaymentModeModal(false);
        }}
        selectedValue={paymentModeFilter}
        options={['Cash', 'GPay', 'PhonePe', 'Net Banking', 'Cheque', 'Advance Transfer']}
        fieldName="Mode"
        showStarIcon={false}
      />

      {/* Description Modal */}
      {showDescriptionModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-[16px]"
          onClick={() => setShowDescriptionModal(false)}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div
            className="bg-white w-full max-w-[320px] rounded-[12px] p-[20px] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <img src={Pen} alt="Pen" className="w-[74px] h-[74px]" />
            </div>
            <h3 className="text-[18px] font-bold text-gray-500 text-center mb-4">Description!</h3>
            <p className="text-[11px] font-medium text-black text-center mb-6 leading-relaxed">
              {selectedDescription}
            </p>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowDescriptionModal(false)}
                className="px-[32px] py-[8px] bg-black text-white text-[14px] font-semibold rounded-[8px] hover:opacity-90 transition-opacity"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
