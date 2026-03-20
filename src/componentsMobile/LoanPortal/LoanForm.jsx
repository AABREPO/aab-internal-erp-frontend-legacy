import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Attach from '../Images/Attachfile.svg';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';

const LoanForm = () => {
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

  const [activeBranchId, setActiveBranchId] = useState(() => resolveActiveBranchId());
  const [selectedLoanType, setSelectedLoanType] = useState('Loan');
  const [selectedOption, setSelectedOption] = useState(null);
  const [combinedOptions, setCombinedOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [labourOptions, setLabourOptions] = useState([]);
  const [purposeOptions, setPurposeOptions] = useState([]);
  const [amountGiven, setAmountGiven] = useState('');
  const [dateValue, setDateValue] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState('');
  const [entryNo, setEntryNo] = useState(1);
  const [selectedLoanFile, setSelectedLoanFile] = useState(null);
  const [overallLoan, setOverallLoan] = useState(0);
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [typeSearchQuery, setTypeSearchQuery] = useState('');
  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [showPurposeModal, setShowPurposeModal] = useState(false);
  const [showPaymentModeModal, setShowPaymentModeModal] = useState(false);

  const paymentModeOptions = [
    { value: 'Cash', label: 'Cash' },
    { value: 'GPay', label: 'GPay' },
    { value: 'PhonePe', label: 'PhonePe' },
    { value: 'Net Banking', label: 'Net Banking' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'Advance Transfer', label: 'Advance Transfer' }
  ];

  useEffect(() => {
    const syncBranch = () => {
      const nextBranchId = resolveActiveBranchId();
      setActiveBranchId((prevBranchId) => (prevBranchId === nextBranchId ? prevBranchId : nextBranchId));
    };
    syncBranch();
    window.addEventListener("branchSelectionChanged", syncBranch);
    return () => window.removeEventListener("branchSelectionChanged", syncBranch);
  }, []);

  // Fetch entry number
  useEffect(() => {
    const fetchEntryNo = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/loans/all');
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            const maxEntryNo = Math.max(...data.map(item => parseInt(item.entry_no) || 0));
            setEntryNo(maxEntryNo + 1);
          }
        }
      } catch (error) {
        console.error('Error fetching entry number:', error);
      }
    };
    fetchEntryNo();
  }, []);

  // Fetch purpose options
  useEffect(() => {
    const fetchPurposeOptions = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/loan-purposes/getAll', {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
          const data = await response.json();
          const formattedData = data.map(item => ({
            value: item.purpose,
            label: item.purpose,
            id: item.id,
            type: 'Purpose'
          }));
          setPurposeOptions(formattedData);
        }
      } catch (error) {
        console.error("Error fetching purpose options: ", error);
      }
    };
    fetchPurposeOptions();
  }, []);

  // Fetch vendor names
  useEffect(() => {
    const fetchVendorNames = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
          const data = await response.json();
          const formattedData = data.map(item => ({
            value: item.vendorName,
            label: item.vendorName,
            id: item.id,
            type: "Vendor",
          }));
          setVendorOptions(formattedData);
        }
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchVendorNames();
  }, []);

  // Fetch contractor names
  useEffect(() => {
    const fetchContractorNames = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/contractor_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
          const data = await response.json();
          const formattedData = data.map(item => ({
            value: item.contractorName,
            label: item.contractorName,
            id: item.id,
            type: "Contractor",
          }));
          setContractorOptions(formattedData);
        }
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchContractorNames();
  }, []);

  // Fetch employee names
  useEffect(() => {
    const fetchEmployeeNames = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuildersDash/api/employee_details/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
          const data = await response.json();
          const formattedData = data.map(item => ({
            value: item.employee_name,
            label: item.employee_name,
            id: item.id,
            type: "Employee",
          }));
          setEmployeeOptions(formattedData);
        }
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchEmployeeNames();
  }, []);

  // Fetch labour names
  useEffect(() => {
    const fetchLabourNames = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuildersDash/api/labours-details/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
          const data = await response.json();
          const formattedData = data.map(item => ({
            value: item.labour_name,
            label: item.labour_name,
            id: item.id,
            type: "Labour",
          }));
          setLabourOptions(formattedData);
        }
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchLabourNames();
  }, []);

  // Combine options
  useEffect(() => {
    setCombinedOptions([...vendorOptions, ...contractorOptions, ...employeeOptions, ...labourOptions]);
  }, [vendorOptions, contractorOptions, employeeOptions, labourOptions]);

  // Calculate overall loan
  useEffect(() => {
    if (!selectedOption) {
      setOverallLoan(0);
      return;
    }
    const fetchLoanData = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/loans/all');
        if (response.ok) {
          const data = await response.json();
          const total = data
            .filter((item) => {
              if (selectedOption.type === 'Vendor') return item.vendor_id === selectedOption.id;
              if (selectedOption.type === 'Contractor') return item.contractor_id === selectedOption.id;
              if (selectedOption.type === 'Employee') return item.employee_id === selectedOption.id;
              if (selectedOption.type === 'Labour') return item.labour_id === selectedOption.id;
              return false;
            })
            .reduce((sum, curr) => {
              if (curr.type === 'Loan') return sum + (parseFloat(curr.amount) || 0);
              if (curr.type === 'Refund') return sum - (parseFloat(curr.loan_refund_amount) || 0);
              return sum;
            }, 0);
          setOverallLoan(total);
        }
      } catch (error) {
        console.error('Error fetching loan data:', error);
      }
    };
    fetchLoanData();
  }, [selectedOption]);

  const formatWithCommas = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (!isNaN(rawValue)) {
      setAmountGiven(rawValue);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedLoanFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedLoanFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = async () => {
    if (!selectedOption) {
      toast.error("Please select an associate!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return;
    }

    if (!purpose) {
      toast.error("Please select a purpose!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return;
    }

    if (!amountGiven || parseFloat(amountGiven) <= 0) {
      toast.error("Please enter a valid amount!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return;
    }

    if (!paymentMode) {
      toast.error("Please select a payment mode!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('type', selectedLoanType);
      formData.append('date', dateValue);
      formData.append('amount', amountGiven);
      formData.append('loan_payment_mode', paymentMode);
      formData.append('from_purpose_id', purpose);
      formData.append('entry_no', entryNo);
      formData.append('description', description || '');
      
      if (selectedOption.type === 'Vendor') {
        formData.append('vendor_id', selectedOption.id);
      } else if (selectedOption.type === 'Contractor') {
        formData.append('contractor_id', selectedOption.id);
      } else if (selectedOption.type === 'Employee') {
        formData.append('employee_id', selectedOption.id);
      } else if (selectedOption.type === 'Labour') {
        formData.append('labour_id', selectedOption.id);
      }

      if (activeBranchId) {
        formData.append('branch_id', activeBranchId);
      }

      if (selectedLoanFile) {
        formData.append('file', selectedLoanFile);
      }

      const response = await fetch('https://backendaab.in/aabuildersDash/api/loans/save', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to save loan');
      }

      toast.success("Loan entry saved successfully!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });

      // Reset form
      setSelectedOption(null);
      setPurpose('');
      setAmountGiven('');
      setPaymentMode('');
      setDescription('');
      setSelectedLoanFile(null);
      setOverallLoan(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Increment entry number
      setEntryNo(prev => prev + 1);
    } catch (error) {
      console.error('Error submitting loan:', error);
      toast.error("Failed to save loan entry!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="px-[16px] flex flex-col flex-1 min-h-0 overflow-hidden"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {/* Form section - no scroll */}
      <div className="flex-shrink-0">
      {/* Loan Number and Date */}
      <div className="mb-2 items-center border-b border-gray-200 pb-[4px] mt-1.5 flex justify-between">
        <div className="flex items-center gap-[8px] mt-0.5">
          <span className="text-[12px] font-semibold text-black leading-normal"># {entryNo}</span>
          <span className="text-[12px] font-semibold text-black leading-normal">{formatDate(dateValue)}</span>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setShowTypeModal(true)}
            className="text-[12px] font-semibold text-black leading-normal underline-offset-2 hover:underline"
          >
            {selectedLoanType || 'Select Type'}
          </button>
        </div>
      </div>
      <div className="space-y-[6px]">
        {/* Associate */}
        <div className="">
          <p className="flex justify-between items-center text-[12px] font-semibold text-black leading-normal mb-0.5">
            <span>Associate<span className="text-[#eb2f8e]">*</span></span>
            <span className="text-[12px] font-medium text-[#9E9E9E]">{formatWithCommas(overallLoan)}</span>
          </p>
          <div className="relative">
            <div
              onClick={() => setShowAssociateModal(true)}
              className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
              style={{
                boxSizing: 'border-box',
                color: selectedOption ? '#000' : '#9E9E9E'
              }}
            >
              {selectedOption ? selectedOption.label : 'Select'}
              {selectedOption ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOption(null);
                    setOverallLoan(0);
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ) : (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Purpose */}
        <div className="">
          <p className="text-[12px] flex justify-between items-center font-semibold text-black leading-normal mb-0.5">
            <span>Purpose<span className="text-[#eb2f8e]">*</span></span>
            <span className="text-[12px] font-medium text-[#9E9E9E]">0.00</span>
          </p>
          <div className="relative">
            <div
              onClick={() => setShowPurposeModal(true)}
              className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
              style={{
                boxSizing: 'border-box',
                color: purpose ? '#000' : '#9E9E9E'
              }}
            >
              {purpose ? (purposeOptions.find(opt => opt.id === parseInt(purpose))?.label || 'Select') : 'Select'}
              {purpose ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPurpose('');
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ) : (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Amount Given and Payment Mode - Side by Side */}
        <div className="flex justify-between items-center w-[328px]">
          <div className="">
            <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
              Amount Given<span className="text-[#eb2f8e]">*</span>
            </p>
            <div className="relative">
              <input
                type="text"
                value={formatWithCommas(amountGiven)}
                onChange={handleAmountChange}
                placeholder="Enter amount"
                className="w-[160px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[12px] text-[12px] font-medium bg-white focus:outline-none"
                style={{
                  boxSizing: 'border-box',
                  color: amountGiven ? '#000' : '#9E9E9E'
                }}
              />
            </div>
          </div>
          {/* Payment Mode Field */}
          <div className="">
            <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
              Payment Mode<span className="text-[#eb2f8e]">*</span>
            </p>
            <div className="relative">
              <div
                onClick={() => setShowPaymentModeModal(true)}
                className="w-[160px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                style={{
                  boxSizing: 'border-box',
                  color: paymentMode ? '#000' : '#9E9E9E'
                }}
              >
                {paymentMode || 'Select'}
                {paymentMode ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPaymentMode('');
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 3L3 9M3 3L9 9" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L6 6L11 1" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description Field */}
        <div className="">
          <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
            Description
          </p>
          <textarea
            className="w-[328px] h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[12px] pt-[4px] items-center text-[12px] font-medium bg-white focus:outline-none"
            placeholder="Type Here"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              boxSizing: 'border-box',
              color: description ? '#000' : '#9E9E9E'
            }}
          />
        </div>
      </div>
      {/* Attach File - same pattern as AdvanceForm */}
      <div className="flex flex-wrap items-center gap-x-[8px] mb-1 gap-y-[4px] w-full max-w-[328px]">
        <input
          type="file"
          id="fileInput"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,.pdf"
        />
        <label
          htmlFor="fileInput"
          className="cursor-pointer flex items-center gap-[2px] text-orange-600 hover:text-orange-700 active:opacity-80 flex-shrink-0"
        >
          <img className='w-4 h-3' alt='#' src={Attach}></img>
          <span className="text-[12px] font-medium underline">Attach File</span>
        </label>
        {selectedLoanFile && (
          <span className="text-[11px] font-medium text-[#666] break-words min-w-0 flex-1">
            {selectedLoanFile.name}
          </span>
        )}
      </div>
      {/* Loan Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !selectedOption || !purpose || !amountGiven || !paymentMode}
        className={`w-[328px] h-[40px] font-semibold rounded text-[14px] leading-normal ${
          selectedOption && purpose && amountGiven && paymentMode && !isSubmitting
            ? 'bg-black text-white'
            : 'bg-[#D9D9D9] text-black'
        }`}
      >
        {isSubmitting ? 'Submitting...' : 'Loan'}
      </button>
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
            className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] rounded-b-[20px] shadow-lg max-h-[60vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
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

            {/* Search Bar */}
            <div className="px-[24px] pt-[16px] pb-[16px]">
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

            {/* Options List */}
            <div className="flex-1 overflow-y-auto mb-4 px-[24px] [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="shadow-md rounded-lg overflow-hidden">
                {(['Loan', 'Refund', 'Transfer']
                  .filter(type => type.toLowerCase().includes(typeSearchQuery.toLowerCase()))
                  .map((type, index) => {
                    const isSelected = selectedLoanType === type;

                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedLoanType(type);
                          setShowTypeModal(false);
                          setTypeSearchQuery('');
                        }}
                        className={`w-full h-[40px] px-[24px] flex items-center justify-between transition-colors ${isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'
                          }`}
                      >
                        {/* Left: Option Text */}
                        <div className="flex items-center gap-[12px] flex-1 min-w-0">
                          <p className="text-[14px] font-medium text-black text-left truncate">{type}</p>
                        </div>

                        {/* Right: Radio Button */}
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

      {/* Associate Modal */}
      <SelectVendorModal
        isOpen={showAssociateModal}
        onClose={() => setShowAssociateModal(false)}
        onSelect={(value) => {
          const selected = combinedOptions.find(opt => opt.label === value);
          if (selected) {
            setSelectedOption(selected);
          }
          setShowAssociateModal(false);
        }}
        selectedValue={selectedOption ? selectedOption.label : ''}
        options={combinedOptions.map(opt => opt.label)}
        fieldName="Associate"
        showStarIcon={false}
      />

      {/* Purpose Modal */}
      <SelectVendorModal
        isOpen={showPurposeModal}
        onClose={() => setShowPurposeModal(false)}
        onSelect={(value) => {
          const selected = purposeOptions.find(opt => opt.label === value);
          if (selected) {
            setPurpose(selected.id.toString());
          }
          setShowPurposeModal(false);
        }}
        selectedValue={purpose ? (purposeOptions.find(opt => opt.id === parseInt(purpose))?.label || '') : ''}
        options={purposeOptions.map(opt => opt.label)}
        fieldName="Purpose"
        showStarIcon={false}
      />

      {/* Payment Mode Modal */}
      <SelectVendorModal
        isOpen={showPaymentModeModal}
        onClose={() => setShowPaymentModeModal(false)}
        onSelect={(value) => {
          setPaymentMode(value);
          setShowPaymentModeModal(false);
        }}
        selectedValue={paymentMode}
        options={paymentModeOptions.map(opt => opt.label)}
        fieldName="Payment Mode"
        showStarIcon={false}
      />

      <ToastContainer position="top-center" autoClose={3000} theme="colored" />
    </div>
  );
};

export default LoanForm;
