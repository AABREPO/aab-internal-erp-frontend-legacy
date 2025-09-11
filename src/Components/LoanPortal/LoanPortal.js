import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Select from 'react-select';
import Attach from '../Images/Attachfile.svg';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import edit from '../Images/Edit.svg';
import axios from 'axios';

const LoanPortal = ({ username, userRoles = [] }) => {
  const [selectedType, setSelectedType] = useState('Loan')
  const [selectedOption, setSelectedOption] = useState(null);
  const [combinedOptions, setCombinedOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [siteOptions, setSiteOptions] = useState([]);
  const [combinedSitePurposeOptions, setCombinedSitePurposeOptions] = useState([]);
  const [loanAmount, setLoanAmount] = useState('');
  const [dateValue, setDateValue] = useState('');
  const [overallLoan, setOverallLoan] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [todayAmount, setTodayAmount] = useState(0);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [filteredPaymentMode, setFilteredPaymentMode] = useState('');
  const [filteredAmount, setFilteredAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [amountGiven, setAmountGiven] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [entryNo, setEntryNo] = useState(1);
  const [selectedContractorOrVendorOption, setSelectedContractorOrVendorOption] = useState(null);
  const [transferSelection, setTransferSelection] = useState(null);
  const [loanData, setLoanData] = useState([]);
  const [selectedLoanFile, setSelectedLoanFile] = useState(null);
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  // Memoized options to prevent unnecessary re-renders
  const purposeOptions = useMemo(() => [
    { value: 'Machine Loan', label: 'Machine Loan', id: 1, type: 'Purpose' },
    { value: 'Material Loan', label: 'Material Loan', id: 2, type: 'Purpose' },
    { value: 'Equipment Loan', label: 'Equipment Loan', id: 3, type: 'Purpose' },
    { value: 'Working Capital', label: 'Working Capital', id: 4, type: 'Purpose' },
    { value: 'Other', label: 'Other', id: 5, type: 'Purpose' }
  ], []);

  const paymentModeOptions = useMemo(() => [
    { value: 'Cash', label: 'Cash' },
    { value: 'GPay', label: 'GPay' },
    { value: 'Net Banking', label: 'Net Banking' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'Advance Transfer', label: 'Advance Transfer' }
  ], []);

  useEffect(() => {
    const savedselectedType = sessionStorage.getItem('selectedType');
    const savedContractorVendor = sessionStorage.getItem('selectedOption');
    const savedProjectName = sessionStorage.getItem('selectedSite');
    const savedoverallLoan = sessionStorage.getItem('overallLoan');
    const savedloanAmount = sessionStorage.getItem('loanAmount');
    const savedamountGiven = sessionStorage.getItem('amountGiven');
    const savedtransferTo = sessionStorage.getItem('transferTo');
    const savedtransferAmount = sessionStorage.getItem('transferAmount');
    const savedpaymentMode = sessionStorage.getItem('paymentMode');
    const saveddescription = sessionStorage.getItem('description');
    const savedpurpose = sessionStorage.getItem('purpose');

    try {
      if (savedselectedType) setSelectedType(JSON.parse(savedselectedType));
      if (savedContractorVendor) setSelectedOption(JSON.parse(savedContractorVendor));
      if (savedProjectName) setSelectedSite(JSON.parse(savedProjectName));
      if (savedoverallLoan) setOverallLoan(JSON.parse(savedoverallLoan));
      if (savedloanAmount) setLoanAmount(JSON.parse(savedloanAmount));
      if (savedamountGiven) setAmountGiven(JSON.parse(savedamountGiven));
      if (savedtransferTo) setTransferTo(JSON.parse(savedtransferTo));
      if (savedtransferAmount) setTransferAmount(JSON.parse(savedtransferAmount));
      if (savedpaymentMode) setPaymentMode(JSON.parse(savedpaymentMode));
      if (saveddescription) setDescription(JSON.parse(saveddescription));
      if (savedpurpose) setPurpose(JSON.parse(savedpurpose));
    } catch (error) {
      console.error("Error parsing sessionStorage data:", error);
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleBeforeUnload = () => {
    sessionStorage.removeItem('selectedType');
    sessionStorage.removeItem('selectedOption');
    sessionStorage.removeItem('selectedSite');
    sessionStorage.removeItem('overallLoan');
    sessionStorage.removeItem('loanAmount');
    sessionStorage.removeItem('amountGiven');
    sessionStorage.removeItem('transferTo');
    sessionStorage.removeItem('transferAmount');
    sessionStorage.removeItem('paymentMode');
    sessionStorage.removeItem('description');
    sessionStorage.removeItem('purpose');
  };

  useEffect(() => {
    if (selectedType) sessionStorage.setItem('selectedType', JSON.stringify(selectedType));
    if (selectedOption) sessionStorage.setItem('selectedOption', JSON.stringify(selectedOption));
    if (selectedSite) sessionStorage.setItem('selectedSite', JSON.stringify(selectedSite));
    if (overallLoan) sessionStorage.setItem('overallLoan', JSON.stringify(overallLoan));
    if (loanAmount) sessionStorage.setItem('loanAmount', JSON.stringify(loanAmount));
    if (amountGiven) sessionStorage.setItem('amountGiven', JSON.stringify(amountGiven));
    if (transferTo) sessionStorage.setItem('transferTo', JSON.stringify(transferTo));
    if (transferAmount) sessionStorage.setItem('transferAmount', JSON.stringify(transferAmount));
    if (paymentMode) sessionStorage.setItem('paymentMode', JSON.stringify(paymentMode));
    if (description) sessionStorage.setItem('description', JSON.stringify(description));
    if (purpose) sessionStorage.setItem('purpose', JSON.stringify(purpose));
  }, [selectedType, selectedOption, selectedSite, overallLoan, loanAmount, amountGiven, transferTo, transferAmount, paymentMode, description, purpose]);

  // Memoized utility functions
  const formatWithCommas = useCallback((value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, []);

  // Optimized event handlers with useCallback
  const handleAmountChange = useCallback((e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (!isNaN(rawValue)) {
      setAmountGiven(rawValue);
    }
  }, []);

  const handleLoanAmountChange = useCallback((e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (!isNaN(rawValue)) {
      setLoanAmount(rawValue);
    }
  }, []);

  const handleTransferAmountChange = useCallback((e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (!isNaN(rawValue)) {
      setTransferAmount(rawValue);
    }
  }, []);

  // Fetch vendor names
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

  // Fetch contractor names
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

  // Fetch sites/projects
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
          type: "Site",
          id: item.id,
          sNo: item.siteNo
        }));

        // Add predefined site options
        const predefinedSiteOptions = [
          {
            value: "Perumal Metal Works",
            label: "Perumal Metal Works",
            id: "1",
            type: "Site",
            sNo: "1"
          },
          {
            value: "Ramar Krishnankovil",
            label: "Ramar Krishnankovil",
            id: "2",
            type: "Site",
            sNo: "2"
          }
        ];

        const combinedSiteOptions = [...predefinedSiteOptions, ...formattedData];
        setSiteOptions(combinedSiteOptions);
      } catch (error) {
        console.error("Fetch error: ", error);
        const predefinedSiteOptions = [
          {
            value: "Perumal Metal Works",
            label: "Perumal Metal Works",
            id: "1",
            type: "Site",
            sNo: "1"
          },
          {
            value: "Ramar Krishnankovil",
            label: "Ramar Krishnankovil",
            id: "2",
            type: "Site",
            sNo: "2"
          }
        ];
        setSiteOptions(predefinedSiteOptions);
      }
    };
    fetchSites();
  }, []);

  // Fetch loan data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8082/api/loans/all');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setLoanData(data);
      } catch (error) {
        console.error('Error fetching loan portal data:', error);
        // Set sample data for demonstration
        setLoanData([
          {
            id: 1,
            date: '2024-11-20',
            loan_amount: 5000,
            transfer_refund: '',
            mode: 'G pay',
            type: 'Loan'
          },
          {
            id: 2,
            date: '2024-11-14',
            loan_amount: -20000,
            transfer_refund: 'Ramar Krishnankovil',
            mode: 'Advance Transfer',
            type: 'Transfer'
          },
          {
            id: 3,
            date: '2024-10-10',
            loan_amount: -4000,
            transfer_refund: '',
            mode: 'Refund',
            type: 'Refund'
          },
          {
            id: 4,
            date: '2024-10-08',
            loan_amount: 24000,
            transfer_refund: '',
            mode: 'Net Banking',
            type: 'Loan'
          }
        ]);
      }
    };
    fetchData();
  }, []);

  // Optimized handleChange with useCallback
  const handleChange = useCallback(async (selected) => {
    setSelectedOption(selected);
    if (selected) {
      localStorage.setItem("loanContractorVendor", JSON.stringify(selected));
    } else {
      localStorage.removeItem("loanContractorVendor");
    }

    try {
      const response = await fetch('http://localhost:8082/api/loans/all');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      const total = data
        .filter(item => {
          return selected.type === 'Vendor'
            ? item.vendor_id === selected.id
            : selected.type === 'Contractor'
              ? item.contractor_id === selected.id
              : false;
        })
        .reduce((sum, curr) => {
          const amount = parseFloat(curr.loan_amount) || 0;
          return sum + amount;
        }, 0);

      setOverallLoan(total);
    } catch (error) {
      console.error('Error fetching or processing loan data:', error);
      setOverallLoan(0);
    }
  }, []);


  // Combine vendor and contractor options
  useEffect(() => {
    setCombinedOptions([...vendorOptions, ...contractorOptions]);
  }, [vendorOptions, contractorOptions]);

  // Combine site and purpose options
  useEffect(() => {
    setCombinedSitePurposeOptions([...siteOptions, ...purposeOptions]);
  }, [siteOptions, purposeOptions]);

  // Memoized custom styles for Select components
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

  // Optimized handleSubmit with useCallback
  const handleSubmit = async () => {
    const payload = {
      type: selectedType,
      date: dateValue,
      amount:
        selectedType === "Loan"
          ? parseFloat(amountGiven) || 0
          : selectedType === "Transfer"
            ? parseFloat(transferAmount) || 0
            : 0,
      loan_payment_mode: paymentMode,
      loan_refund_amount: selectedType === "Refund" ? parseFloat(amountGiven) || 0 : 0,
      from_purpose_id: purpose || 0,
      transfer_Project_id: transferSelection?.type === "Site" ? transferSelection.id : 0,
      to_purpose_id: transferSelection?.type === "Purpose" ? transferSelection.id : 0,
      vendor_id: selectedOption?.type === "Vendor" ? selectedOption.id : 0,
      contractor_id: selectedOption?.type === "Contractor" ? selectedOption.id : 0,
      entry_no: entryNo || null,
      description,
      file_url: ""
    };

    console.log("🚀 Payload ready to send:", payload);
    try {
      const response = await fetch("http://localhost:8082/api/loans/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });  
      if (!response.ok) {
        throw new Error(`Failed to save loan: ${response.status}`);
      }  
      const data = await response.json();
      console.log("✅ Loan saved successfully:", data);
      window.location.reload();
    } catch (error) {
      console.error("❌ Error saving loan:", error);
    }
  };

  // Function to get the current week number
  const getWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = (now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000);
    const oneWeek = 604800000;
    return Math.floor(diff / oneWeek) + 1;
  };
  useEffect(() => {
    const today = new Date();
    const formatted = today.toISOString().split('T')[0];
    setDateValue(formatted);
  }, []);
  // Memoized filtered loan data for better performance
  const filteredLoanData = useMemo(() => {
    if (!selectedOption) return [];
    return loanData
      .filter(entry => {
        const isMatchingVendor =
          selectedOption?.type === 'Vendor'
            ? entry.vendor_id === selectedOption.id
            : selectedOption?.type === 'Contractor'
              ? entry.contractor_id === selectedOption.id
              : false;
        return isMatchingVendor;
      })
      .sort((a, b) => {
        const timeA = new Date(a.date || a.timestamp).getTime() || 0;
        const timeB = new Date(b.date || b.timestamp).getTime() || 0;
        return timeB - timeA;
      });
  }, [loanData, selectedOption]);

  // Calculate filtered amount based on date range and payment mode
  useEffect(() => {
    if (!fromDate || !toDate) {
      setFilteredAmount(0);
      return;
    }
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);
    const filtered = loanData.filter(entry => {
      const entryDate = new Date(entry.date);
      const isInDateRange = entryDate >= from && entryDate <= to;
      const isMatchingPayment =
        !filteredPaymentMode || entry.mode === filteredPaymentMode;
      return isInDateRange && isMatchingPayment;
    });
    const total = filtered.reduce((sum, entry) => {
      const amount = parseFloat(entry.loan_amount) || 0;
      return sum + amount;
    }, 0);
    setFilteredAmount(total);
  }, [fromDate, toDate, filteredPaymentMode, loanData]);

  // Calculate today's total amount
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTotal = loanData
      .filter(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
      })
      .reduce((sum, entry) => {
        const amount = parseFloat(entry.loan_amount) || 0;
        return sum + amount;
      }, 0);
    setTodayAmount(todayTotal);
  }, [loanData]);

  // Calculate total outstanding
  useEffect(() => {
    const total = loanData.reduce((sum, entry) => {
      const amount = parseFloat(entry.loan_amount) || 0;
      return sum + amount;
    }, 0);
    setTotalOutstanding(total);
  }, [loanData]);

  // Optimized handlers with useCallback
  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedLoanFile(file);
    }
    e.target.value = '';
  }, []);

  const handleEditClick = useCallback((entry) => {
    setEditingId(entry.id);
    setEditFormData({
      date: entry.date?.split('T')[0] || '',
      loan_amount: entry.loan_amount || '',
      mode: entry.mode || '',
      description: entry.description || '',
      purpose: entry.purpose || ''
    });
    setIsEditModalOpen(true);
  }, []);

  const handleUpdate = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:8082/api/loans/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      if (!res.ok) throw new Error('Failed to update');
      // Refresh data instead of reloading the page
      const response = await fetch('http://localhost:8082/api/loans/all');
      if (response.ok) {
        const data = await response.json();
        setLoanData(data);
      }
      setIsEditModalOpen(false);
      toast.success('Entry updated successfully!', {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to update entry!', {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
    }
  }, [editingId, editFormData, username]);

  return (
    <body>
      <div>
        {/* Top Summary Bar */}
        <div className='bg-white w-full max-w-[1700px] ml-10 mr-10 p-4 text-left'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4'>
            <div className='space-y-2'>
              <h2 className='font-semibold text-sm sm:text-base'>From Date</h2>
              <input
                type='date'
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className='border-2 border-[#BF9853] border-opacity-30 rounded-lg pl-3 w-full h-[45px] focus:outline-none text-sm'
              />
            </div>
            <div className='space-y-2'>
              <h2 className='font-semibold text-sm sm:text-base'>To Date</h2>
              <input
                type='date'
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className='border-2 border-[#BF9853] border-opacity-30 rounded-lg pl-3 w-full h-[45px] focus:outline-none text-sm'
              />
            </div>
            <div className='space-y-2'>
              <h2 className='font-semibold text-sm sm:text-base'>Amount Given</h2>
              <input
                readOnly
                value={filteredAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                className='bg-[#F2F2F2] rounded-lg p-2 w-full h-[45px] focus:outline-none text-sm'
              />
            </div>
            <div className='space-y-2'>
              <h2 className='font-semibold text-sm sm:text-base'>Payment Mode</h2>
              <select
                value={filteredPaymentMode}
                onChange={(e) => setFilteredPaymentMode(e.target.value)}
                className='w-full h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
              >
                <option value=''>Select</option>
                <option value='Cash'>Cash</option>
                <option value='GPay'>GPay</option>
                <option value='Net Banking'>Net Banking</option>
                <option value='Cheque'>Cheque</option>
                <option value='Advance Transfer'>Advance Transfer</option>
              </select>
            </div>
            <div className='space-y-2'>
              <h2 className='font-semibold text-sm sm:text-base'>Today Amount</h2>
              <input
                readOnly
                type='text'
                value={todayAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                className='bg-[#F2F2F2] rounded-lg p-2 w-full h-[45px] focus:outline-none text-sm'
              />
            </div>
            <div className='space-y-2'>
              <h2 className='font-semibold text-sm sm:text-base'>Total Outstanding</h2>
              <input
                readOnly
                type='text'
                value={totalOutstanding.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                className='bg-[#F2F2F2] p-2 rounded-lg w-full h-[45px] focus:outline-none text-sm'
              />
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className=' ml-10 mr-10 mt-5'>
          <div className='bg-white w-full max-w-[1700px] p-4 lg:p-6 rounded-md shadow-sm'>
            <div className='flex flex-col xl:flex-row gap-6'>
              {/* Left Form Section */}
              <div className='flex-1'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-left'>
                  {/* Select Type */}
                  <div className='space-y-2'>
                    <label className='font-semibold text-[#E4572E] text-sm sm:text-base'>Select Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className='w-full h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                    >
                      <option value='Loan'>Loan</option>
                      <option value='Refund'>Refund</option>
                      <option value='Transfer'>Transfer</option>
                    </select>
                  </div>

                  {/* Date */}
                  <div className='space-y-2'>
                    <label className='font-semibold text-[#E4572E] text-sm sm:text-base'>Date</label>
                    <input
                      type='date'
                      value={dateValue}
                      onChange={(e) => setDateValue(e.target.value)}
                      className='w-full h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                    />
                  </div>

                  {/* Contractor/Vendor */}
                  <div className='space-y-2'>
                    <label className='font-semibold block text-sm sm:text-base'>Associate</label>
                    <Select
                      options={combinedOptions}
                      value={selectedOption}
                      onChange={handleChange}
                      className='w-full rounded-lg focus:outline-none'
                      isClearable
                      styles={customStyles}
                    />
                  </div>

                  {/* Overall Loan */}
                  <div className='space-y-2'>
                    <label className='font-semibold block text-sm sm:text-base'>Overall Loan</label>
                    <input
                      value={overallLoan.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      disabled
                      className='w-full h-[45px] px-2 py-1 rounded-lg bg-[#F2F2F2] focus:outline-none text-sm'
                    />
                  </div>

                  {/* Purpose */}
                  <div className='space-y-2'>
                    <label className='font-semibold block text-sm sm:text-base'>Purpose</label>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
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

                  {/* Loan Amount */}
                  <div className='space-y-2'>
                    <label className='font-semibold block text-sm sm:text-base'>Loan Amount</label>
                    <input
                      value={formatWithCommas(loanAmount)}
                      onChange={handleLoanAmountChange}
                      className='w-full h-[45px] no-spinner border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                    />
                  </div>

                  {/* Dynamic Amount/Transfer To Field */}
                  <div className='space-y-2'>
                    <label className='font-semibold block text-sm sm:text-base'>
                      {selectedType === 'Transfer' ? 'Transfer To' :
                        selectedType === 'Refund' ? 'Amount' : 'Amount Given'}
                    </label>
                    {selectedType === 'Transfer' ? (
                      <Select
                        options={combinedSitePurposeOptions}
                        value={transferSelection}
                        onChange={(selected) => setTransferSelection(selected || null)}
                        className='w-full rounded-lg focus:outline-none'
                        isClearable
                        styles={customStyles}
                        placeholder="Select Transfer To"
                      />
                    ) : (
                      <input
                        value={selectedType === 'Refund' ? formatWithCommas(amountGiven) : formatWithCommas(amountGiven)}
                        onChange={handleAmountChange}
                        placeholder="Enter Amount"
                        className='w-full h-[45px] no-spinner border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                      />
                    )}
                  </div>

                  {/* Dynamic Payment Mode/Transfer Amount Field */}
                  <div className='space-y-2'>
                    <label className='font-semibold block text-sm sm:text-base'>
                      {selectedType === 'Transfer' ? 'Transfer Amount' : 'Payment Mode'}
                    </label>
                    {selectedType === 'Transfer' ? (
                      <input
                        value={formatWithCommas(transferAmount)}
                        onChange={handleTransferAmountChange}
                        placeholder="Enter Amount"
                        className='w-full h-[45px] no-spinner border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                      />
                    ) : (
                      <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                        className='w-full h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                      >
                        <option value=''>Select</option>
                        {paymentModeOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Description */}
                  <div className='col-span-1 sm:col-span-2 space-y-2'>
                    <label className='font-semibold block text-sm sm:text-base'>Description</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Type your text here..."
                      className='w-full border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                    />
                  </div>

                  {/* Attach file and Pay Loan button */}
                  <div className='col-span-1 sm:col-span-2 space-y-4'>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <div className='flex items-center'>
                        <label htmlFor="fileInput" className="cursor-pointer flex items-center text-orange-600 text-sm">
                          <img className='w-5 h-4 mr-1' alt='' src={Attach}></img>
                          Attach file
                        </label>
                        <input type="file" id="fileInput" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                      </div>
                      {selectedLoanFile && <span className="text-gray-600 text-sm">{selectedLoanFile.name}</span>}
                    </div>
                    <button
                      className='bg-[#c7934c] text-white w-full sm:w-[120px] h-[33px] rounded flex items-center justify-center text-sm'
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : selectedType}
                    </button>
                    <ToastContainer
                      position="top-right"
                      autoClose={3000}
                      hideProgressBar={false}
                      closeOnClick
                      pauseOnHover
                      draggable
                      theme="colored"
                    />
                  </div>
                </div>
              </div>

              {/* Right Table Section */}
              <div className='flex-1 xl:ml-6'>
                <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2'>
                  <div className='flex items-center gap-2'>
                    <input
                      readOnly
                      className='border-2 w-[112px] p-2 border-[#E4572E] text-[#E4572E] font-bold border-opacity-10 rounded h-[33px] bg-[#F2F2F2] focus:outline-none text-xs'
                    />
                  </div>
                  <div className='flex flex-wrap gap-2 sm:gap-4'>
                    <span className='text-[#E4572E] font-semibold hover:underline cursor-pointer text-sm'>Export PDF</span>
                    <span className='text-[#007233] font-semibold hover:underline cursor-pointer text-sm'>Export XL</span>
                    <span className='text-[#BF9853] font-semibold hover:underline cursor-pointer text-sm'>Print</span>
                  </div>
                </div>
                <div className='border-l-8 border-l-[#BF9853] rounded-lg h-[400px] overflow-auto'>
                  {selectedOption && (
                    <div className='overflow-x-auto'>
                      <table className="w-full min-w-[600px]">
                        <thead className="bg-[#FAF6ED] text-left">
                          <tr>
                            <th className="px-2 py-2 text-xs sm:text-sm">Date</th>
                            <th className="px-2 py-2 text-xs sm:text-sm">Loan</th>
                            <th className="px-2 py-2 text-xs sm:text-sm">Transfer/Refund</th>
                            <th className="px-2 py-2 text-xs sm:text-sm">Mode</th>
                            <th className="px-2 py-2 text-xs sm:text-sm">Activity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLoanData.map((entry, index) => {
                            const { date, loan_amount, transfer_refund, mode } = entry;

                            return (
                              <tr key={index} className="border-t">
                                <td className="px-2 py-2 text-xs sm:text-sm font-semibold">
                                  {new Date(date).toLocaleDateString('en-GB')}
                                </td>
                                <td className="px-2 py-2 text-xs sm:text-sm text-left font-semibold">
                                  {parseFloat(loan_amount || 0).toLocaleString('en-IN')}
                                </td>
                                <td className="px-2 py-2 text-xs sm:text-sm text-left font-semibold">
                                  {transfer_refund || ''}
                                </td>
                                <td className="px-2 py-2 text-xs sm:text-sm text-left font-semibold">
                                  {mode || ''}
                                </td>
                                <td className="px-2 py-2">
                                  <button className="rounded-full transition duration-200">
                                    <img
                                      src={edit}
                                      onClick={() => handleEditClick(entry)}
                                      alt="Edit"
                                      className="w-4 h-6 transform hover:scale-110 hover:brightness-110 transition duration-200"
                                    />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold mb-4">Edit Entry</h2>
              <div className='text-left'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4'>
                  <div>
                    <label className="mb-2 font-semibold block text-sm">Date</label>
                    <input
                      type="date"
                      value={editFormData.date}
                      onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                      className="border-2 border-[#BF9853] border-opacity-30 w-full h-[45px] pl-3 rounded-lg focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-sm">Loan Amount</label>
                    <input
                      type="number"
                      value={editFormData.loan_amount}
                      onChange={(e) => setEditFormData({ ...editFormData, loan_amount: e.target.value })}
                      className="border-2 border-[#BF9853] border-opacity-30 w-full h-[45px] rounded-lg no-spinner focus:outline-none text-sm"
                    />
                  </div>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4'>
                  <div>
                    <label className="block mb-2 font-semibold text-sm">Payment Mode</label>
                    <select
                      value={editFormData.mode}
                      onChange={(e) => setEditFormData({ ...editFormData, mode: e.target.value })}
                      className="border-2 border-[#BF9853] border-opacity-30 w-full h-[45px] rounded-lg focus:outline-none text-sm"
                    >
                      <option value="">Select</option>
                      {paymentModeOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-sm">Purpose</label>
                    <select
                      value={editFormData.purpose}
                      onChange={(e) => setEditFormData({ ...editFormData, purpose: e.target.value })}
                      className="border-2 border-[#BF9853] border-opacity-30 w-full h-[45px] rounded-lg focus:outline-none text-sm"
                    >
                      <option value="">Select Purpose</option>
                      {purposeOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className='mb-4'>
                  <label className="block mb-2 font-semibold text-sm">Description</label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="border-2 border-[#BF9853] border-opacity-30 w-full h-[60px] rounded-lg focus:outline-none text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-center sm:justify-end gap-3 mt-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-[100px] h-[45px] border border-[#BF9853] rounded text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="w-[100px] h-[45px] bg-[#BF9853] text-white rounded text-sm"
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

export default LoanPortal
