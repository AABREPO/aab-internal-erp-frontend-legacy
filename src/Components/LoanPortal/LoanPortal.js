import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Select from 'react-select';
import Attach from '../Images/Attachfile.svg';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import edit from '../Images/Edit.svg';
import axios from 'axios';

const LoanPortal = ({ username, userRoles = [], paymentModeOptions = [] }) => {
  const [selectedLoanType, setSelectedLoanType] = useState('Loan')
  const [selectedOption, setSelectedOption] = useState(null);
  const [combinedOptions, setCombinedOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [labourOptions, setLabourOptions] = useState([]);
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
  const [paymentPopupData, setPaymentPopupData] = useState({
    chequeNo: "",
    chequeDate: "",
    transactionNumber: "",
    accountNumber: ""
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isReviewEditMode, setIsReviewEditMode] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [accountDetails, setAccountDetails] = useState([]);

  // State for purpose options - fetched from API
  const [purposeOptions, setPurposeOptions] = useState([]);

  // Use paymentModeOptions from props, fallback to default if not provided
  const defaultPaymentModeOptions = useMemo(() => [
    { value: 'Cash', label: 'Cash' },
    { value: 'GPay', label: 'GPay' },
    { value: 'PhonePe', label: 'PhonePe' },
    { value: 'Net Banking', label: 'Net Banking' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'Advance Transfer', label: 'Advance Transfer' }
  ], []);

  const finalPaymentModeOptions = paymentModeOptions.length > 0 ? paymentModeOptions : defaultPaymentModeOptions;

  useEffect(() => {
    const savedselectedLoanType = sessionStorage.getItem('selectedLoanType');
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
      if (savedselectedLoanType) setSelectedLoanType(JSON.parse(savedselectedLoanType));
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
    sessionStorage.removeItem('selectedLoanType');
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
    if (selectedLoanType) sessionStorage.setItem('selectedLoanType', JSON.stringify(selectedLoanType));
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
  }, [selectedLoanType, selectedOption, selectedSite, overallLoan, loanAmount, amountGiven, transferTo, transferAmount, paymentMode, description, purpose]);

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

  const handlePaymentModeChange = useCallback((e) => {
    const newPaymentMode = e.target.value;
    setPaymentMode(newPaymentMode);
    // Reset payment popup data when payment mode changes
    if (!["GPay", "PhonePe", "Net Banking", "Cheque"].includes(newPaymentMode)) {
      setPaymentPopupData({
        chequeNo: "",
        chequeDate: "",
        transactionNumber: "",
        accountNumber: ""
      });
    }
  }, []);

  // Fetch purpose options from API
  useEffect(() => {
    const fetchPurposeOptions = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/loan-purposes/getAll', {
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
          value: item.purpose,
          label: item.purpose,
          id: item.id,
          type: 'Purpose'
        }));
        setPurposeOptions(formattedData);
      } catch (error) {
        console.error("Error fetching purpose options: ", error);
        // Fallback to empty array on error
        setPurposeOptions([]);
      }
    };
    fetchPurposeOptions();
  }, []);

  // Fetch account details
  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuildersDash/api/account-details/getAll", {
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
        setAccountDetails(data);
      } catch (error) {
        console.error("Error fetching account details:", error);
      }
    };
    fetchAccountDetails();
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

  // Fetch employee names
  useEffect(() => {
    const fetchEmployeeNames = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuildersDash/api/employee_details/getAll", {
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
          value: item.employee_name,
          label: item.employee_name,
          id: item.id,
          type: "Employee",
        }));
        setEmployeeOptions(formattedData);
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
          headers: {
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          throw new Error("Network response was not ok: " + response.statusText);
        }
        const data = await response.json();
        const formattedData = data.map(item => ({
          value: item.labour_name,
          label: item.labour_name,
          id: item.id,
          type: "Labour",
        }));
        setLabourOptions(formattedData);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchLabourNames();
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
            value: "Mason Advance",
            label: "Mason Advance",
            id: 1,
            sNo: "1"
          },
          {
            value: "Material Advance",
            label: "Material Advance",
            id: 2,
            sNo: "2"
          },
          {
            value: "Weekly Advance",
            label: "Weekly Advance",
            id: 3,
            sNo: "3"
          },
          {
            value: "Excess Advance",
            label: "Excess Advance",
            id: 4,
            sNo: "4"
          },
          {
            value: "Material Rent",
            label: "Material Rent",
            id: 5,
            sNo: "5"
          },
          {
            value: "Subhash Kumar - Kunnur",
            label: "Subhash Kumar - Kunnur",
            id: 6,
            sNo: "6"
          },
          {
            value: "Summary Bill",
            label: "Summary Bill",
            id: 7,
            sNo: "7"
          },
          {
            value: "Daily Wage",
            label: "Daily Wage",
            id: 8,
            sNo: "8"
          },
          {
            value: "Rent Management Portal",
            label: "Rent Management Portal",
            id: 9,
            sNo: "9"
          }
        ];
        const combinedSiteOptions = [...predefinedSiteOptions, ...formattedData];
        setSiteOptions(combinedSiteOptions);
      } catch (error) {
        console.error("Fetch error: ", error);
        const predefinedSiteOptions = [
          {
            value: "Mason Advance",
            label: "Mason Advance",
            id: 1,
            sNo: "1"
          },
          {
            value: "Material Advance",
            label: "Material Advance",
            id: 2,
            sNo: "2"
          },
          {
            value: "Weekly Advance",
            label: "Weekly Advance",
            id: 3,
            sNo: "3"
          },
          {
            value: "Excess Advance",
            label: "Excess Advance",
            id: 4,
            sNo: "4"
          },
          {
            value: "Material Rent",
            label: "Material Rent",
            id: 5,
            sNo: "5"
          },
          {
            value: "Subhash Kumar - Kunnur",
            label: "Subhash Kumar - Kunnur",
            id: 6,
            sNo: "6"
          },
          {
            value: "Summary Bill",
            label: "Summary Bill",
            id: 7,
            sNo: "7"
          },
          {
            value: "Daily Wage",
            label: "Daily Wage",
            id: 8,
            sNo: "8"
          },
          {
            value: "Rent Management Portal",
            label: "Rent Management Portal",
            id: 9,
            sNo: "9"
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
        const response = await fetch('https://backendaab.in/aabuildersDash/api/loans/all');
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
      const response = await fetch('https://backendaab.in/aabuildersDash/api/loans/all');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      const total = data
        .filter(item => {
          if (selected.type === 'Vendor') {
            return item.vendor_id === selected.id;
          } else if (selected.type === 'Contractor') {
            return item.contractor_id === selected.id;
          } else if (selected.type === 'Employee') {
            return item.employee_id === selected.id;
          } else if (selected.type === 'Labour') {
            return item.labour_id === selected.id;
          }
          return false;
        })
        .reduce((sum, curr) => {
          if (curr.type === 'Loan') {
            // Add loan amounts
            const amount = parseFloat(curr.amount) || 0;
            return sum + amount;
          } else if (curr.type === 'Refund') {
            // Subtract refund amounts
            const refundAmount = parseFloat(curr.loan_refund_amount) || 0;
            return sum - refundAmount;
          } else if (curr.type === 'Transfer') {
            // For transfers, subtract only if transfer_Project_id exists (money going out)
            if (curr.transfer_Project_id) {
              const transferAmount = parseFloat(curr.amount) || 0;
              return sum + transferAmount; // amount is already negative, so this subtracts
            }
            // If no transfer_Project_id, it's a purpose-to-purpose transfer, don't subtract
            return sum;
          }
          return sum;
        }, 0);
      setOverallLoan(total);
    } catch (error) {
      console.error('Error fetching or processing loan data:', error);
      setOverallLoan(0);
    }
  }, []);
  // Combine vendor, contractor, employee, and labour options
  useEffect(() => {
    setCombinedOptions([...vendorOptions, ...contractorOptions, ...employeeOptions, ...labourOptions]);
  }, [vendorOptions, contractorOptions, employeeOptions, labourOptions]);

  // Calculate loan amount for selected purpose and associate
  const calculateLoanAmount = useCallback(() => {
    if (!selectedOption || !purpose) {
      setLoanAmount('');
      return;
    }
    const purposeId = parseInt(purpose, 10);
    const total = loanData
      .filter(entry => {
        // Filter by associate
        let matchesAssociate = false;
        if (selectedOption.type === 'Vendor') {
          matchesAssociate = entry.vendor_id === selectedOption.id;
        } else if (selectedOption.type === 'Contractor') {
          matchesAssociate = entry.contractor_id === selectedOption.id;
        } else if (selectedOption.type === 'Employee') {
          matchesAssociate = entry.employee_id === selectedOption.id;
        } else if (selectedOption.type === 'Labour') {
          matchesAssociate = entry.labour_id === selectedOption.id;
        }
        // Filter by purpose
        const matchesPurpose = entry.from_purpose_id === purposeId;
        return matchesAssociate && matchesPurpose;
      })
      .reduce((sum, curr) => {
        if (curr.type === 'Loan') {
          // Add loan amounts
          const amount = parseFloat(curr.amount) || 0;
          return sum + amount;
        } else if (curr.type === 'Refund') {
          // Subtract refund amounts
          const refundAmount = parseFloat(curr.loan_refund_amount) || 0;
          return sum - refundAmount;
        } else if (curr.type === 'Transfer') {
          // Subtract transfer amounts (money going out)
          const transferAmount = parseFloat(curr.amount) || 0;
          return sum + transferAmount; // amount is already negative, so this subtracts
        }
        return sum;
      }, 0);
    setLoanAmount(total.toString());
  }, [loanData, selectedOption, purpose]);
  // Update loan amount when data, selectedOption, or purpose changes
  useEffect(() => {
    calculateLoanAmount();
  }, [calculateLoanAmount]);
  // Combine site and purpose options
  useEffect(() => {
    setCombinedSitePurposeOptions([...siteOptions, ...purposeOptions]);
  }, [siteOptions, purposeOptions]);
  // Memoized custom styles for Select components
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderWidth: '2px',
      lineHeight: '20px',
      fontSize: '14px',
      height: '45px',
      borderRadius: '8px',
      borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.3)' : 'rgba(191, 152, 83, 0.3)',
      boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.3)' : 'none',
    }),
    clearIndicator: (provided) => ({
      ...provided,
      cursor: 'pointer',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      maxHeight: '300px',
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    menuList: (provided) => ({
      ...provided,
      maxHeight: '250px',
      overflowY: 'auto',
    }),
    singleValue: (provided) => ({
      ...provided,
      fontWeight: '500',
      color: 'black',
      textAlign: 'left',
    }),
    option: (provided, state) => ({
      ...provided,
      fontWeight: '500',
      backgroundColor: state.isSelected
        ? 'rgba(191, 152, 83, 0.3)'
        : state.isFocused
          ? 'rgba(191, 152, 83, 0.1)'
          : 'white',
      color: 'black',
      textAlign: 'left',
    }),
    input: (provided) => ({
      ...provided,
      fontWeight: '500',
      color: 'black',
      textAlign: 'left',
    }),
    placeholder: (provided) => ({
      ...provided,
      fontWeight: '500',
      color: '#999',
      textAlign: 'left',
    }),
  };
  // Function to handle the initial submit button click
  const handleSubmit = async () => {
    // Comprehensive validation for all required fields
    if (!selectedLoanType) {
      toast.error("Please select a loan type!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return;
    }

    if (!dateValue) {
      toast.error("Please select a date!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return;
    }

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

    // Validation based on loan type
    if (selectedLoanType === "Loan") {
      if (!amountGiven || parseFloat(amountGiven) <= 0) {
        toast.error("Please enter a valid amount given!", {
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
    }

    if (selectedLoanType === "Refund") {
      if (!amountGiven || parseFloat(amountGiven) <= 0) {
        toast.error("Please enter a valid refund amount!", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored"
        });
        return;
      }
    }

    if (selectedLoanType === "Transfer") {
      if (!transferSelection) {
        toast.error("Please select transfer destination!", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored"
        });
        return;
      }

      if (!transferAmount || parseFloat(transferAmount) <= 0) {
        toast.error("Please enter a valid transfer amount!", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored"
        });
        return;
      }
    }

    // Show review modal before submission
    setShowReviewModal(true);
    setIsReviewEditMode(false);
  };

  // Function to actually submit the loan data
  const submitLoanData = async () => {
    let advancePortalId = null;

    // Check if transferring to a project (Site) for Vendor or Contractor
    if (selectedLoanType === "Transfer" &&
      transferSelection?.type === "Site" &&
      (selectedOption?.type === "Vendor" || selectedOption?.type === "Contractor")) {

      // First, create advance portal entry with positive amount
      try {
        // Get entry number for advance portal
        const res = await fetch('https://backendaab.in/aabuildersDash/api/advance_portal/getAll');
        if (!res.ok) throw new Error('Failed to fetch advance portal entry numbers');
        const allData = await res.json();
        const maxEntryNo = allData.length > 0 ? Math.max(...allData.map(item => item.entry_no || 0)) : 0;
        const nextEntryNo = maxEntryNo + 1;

        const advancePayload = {
          type: "Transfer",
          date: dateValue,
          vendor_id: selectedOption?.type === "Vendor" ? selectedOption.id : 0,
          contractor_id: selectedOption?.type === "Contractor" ? selectedOption.id : 0,
          project_id: transferSelection.id, // Transfer to this project
          transfer_site_id: 11, // Transfer from Loan Portal (id = 11)
          payment_mode: "",
          amount: Math.abs(parseFloat(transferAmount) || 0), // Positive amount
          bill_amount: 0,
          refund_amount: 0,
          entry_no: nextEntryNo,
          week_no: getWeekNumber(),
          description: "Transfer from Loan Portal",
          file_url: ""
        };

        const advanceResponse = await fetch('https://backendaab.in/aabuildersDash/api/advance_portal/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(advancePayload)
        });

        if (!advanceResponse.ok) {
          throw new Error('Failed to save advance portal data');
        }

        const advanceResult = await advanceResponse.json();
        console.log('✅ Advance portal entry created:', advanceResult);
        advancePortalId = advanceResult.id || advanceResult.advancePortalId;
        console.log('Advance Portal ID to link:', advancePortalId);
      } catch (error) {
        console.error('Error creating advance portal entry:', error);
        toast.error('Failed to create advance portal entry!', {
          position: "top-center",
          autoClose: 3000,
          theme: "colored"
        });
        return; // Stop execution if advance portal entry fails
      }
    }
    const payload = {
      type: selectedLoanType,
      date: dateValue,
      amount:
        selectedLoanType === "Loan"
          ? parseFloat(amountGiven) || 0
          : selectedLoanType === "Transfer"
            ? transferSelection?.type === "Site" && (selectedOption?.type === "Vendor" || selectedOption?.type === "Contractor")
              ? -Math.abs(parseFloat(transferAmount) || 0) // Negative amount for transfer to project
              : parseFloat(transferAmount) || 0
              : 0,
      loan_payment_mode: paymentMode,
      loan_refund_amount: selectedLoanType === "Refund" ? parseFloat(amountGiven) || 0 : 0,
      from_purpose_id: purpose || 0,
      transfer_Project_id: transferSelection?.type === "Site" ? transferSelection.id : 0,
      to_purpose_id: transferSelection?.type === "Purpose" ? transferSelection.id : 0,
      vendor_id: selectedOption?.type === "Vendor" ? selectedOption.id : 0,
      contractor_id: selectedOption?.type === "Contractor" ? selectedOption.id : 0,
      employee_id: selectedOption?.type === "Employee" ? selectedOption.id : 0,
      labour_id: selectedOption?.type === "Labour" ? selectedOption.id : 0,
      project_id: 0,
      description,
      file_url: "",
      advance_portal_id: advancePortalId || null
    };
    console.log("Submitting loan data with payload:", payload);
    try {
      const response = await fetch("https://backendaab.in/aabuildersDash/api/loans/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Failed to save loan: ${response.status}`);
      }
      const loanResult = await response.json();
      console.log("✅ Loan saved successfully:", loanResult);
      // If payment mode is GPay, PhonePe, Net Banking, or Cheque, also save to weekly-payment-bills
      if (selectedLoanType === "Loan" && ["GPay", "PhonePe", "Net Banking", "Cheque"].includes(paymentMode)) {
        const weeklyPaymentBillPayload = {
          date: dateValue,
          created_at: new Date().toISOString(),
          contractor_id: selectedOption?.type === "Contractor" ? selectedOption.id : null,
          vendor_id: selectedOption?.type === "Vendor" ? selectedOption.id : null,
          employee_id: selectedOption?.type === "Employee" ? selectedOption.id : null,
          project_id: 0,
          type: "Loan",
          bill_payment_mode: paymentMode,
          amount: parseFloat(amountGiven) || 0,
          status: true,
          weekly_number: "",
          weekly_payment_expense_id: null,
          advance_portal_id: null,
          staff_advance_portal_id: null,
          claim_payment_id: null,
          purpose_id: purpose,
          loan_portal_id: loanResult.id || loanResult.loanPortalId,
          cheque_number: paymentMode === "Cheque" ? paymentPopupData.chequeNo : null,
          cheque_date: paymentMode === "Cheque" ? paymentPopupData.chequeDate : null,
          transaction_number: paymentPopupData.transactionNumber || null,
          account_number: paymentPopupData.accountNumber || null
        };

        const weeklyPaymentBillResponse = await axios.post(
          "https://backendaab.in/aabuildersDash/api/weekly-payment-bills/save",
          weeklyPaymentBillPayload,
          { headers: { "Content-Type": "application/json" } }
        );

        toast.success("Loan saved successfully and added to Weekly Payment Bills!", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored"
        });
      } else {
        toast.success("Loan saved successfully!", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored"
        });
      }
      // Reset payment popup data and close modals
      setPaymentPopupData({
        chequeNo: "",
        chequeDate: "",
        transactionNumber: "",
        accountNumber: ""
      });
      setShowPaymentModal(false);
      setShowReviewModal(false);
      // Reset form fields
      setAmountGiven('');
      setTransferAmount('');
      setDescription('');
      setSelectedLoanFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Refresh loan data to show the new entry
      setTimeout(async () => {
        try {
          const response = await fetch('https://backendaab.in/aabuildersDash/api/loans/all');
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          setLoanData(data);
        } catch (error) {
          console.error('Error refreshing loan data:', error);
        }
      }, 500);
    } catch (error) {
      console.error("❌ Error saving loan:", error);
      toast.error("Failed to save loan!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
    }
  };
  // Function to handle payment modal submission
  const handlePaymentModalSubmit = async () => {
    // Validate payment details
    if (!paymentPopupData.transactionNumber || !paymentPopupData.accountNumber) {
      toast.error("Please fill all payment details!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return;
    }
    if (paymentMode === "Cheque" && (!paymentPopupData.chequeNo || !paymentPopupData.chequeDate)) {
      toast.error("Please fill cheque details!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return;
    }
    await submitLoanData();
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
  const getTransferDestination = useCallback((entry) => {
    if (entry.type !== "Transfer") return "";
    const transferAmount = parseFloat(entry.amount) || 0;
    const currentPurposeId = parseInt(purpose, 10);
    // Negative amount: from_purpose_id = selected purpose → Show "Transfer To [to_purpose_id]"
    if (transferAmount < 0 && entry.from_purpose_id === currentPurposeId) {
      if (entry.to_purpose_id) {
        const toPurpose = purposeOptions.find(p => p.id === entry.to_purpose_id)?.label || "";
        return `Transfer To ${toPurpose}`;
      } else if (entry.transfer_Project_id) {
        const toSite = siteOptions.find(s => s.id === entry.transfer_Project_id)?.label || "";
        return `Transfer To ${toSite}`;
      }
    }
    // Positive amount: from_purpose_id = selected purpose → Show "Transfer From [to_purpose_id]"
    if (transferAmount > 0 && entry.from_purpose_id === currentPurposeId) {
      if (entry.to_purpose_id) {
        const toPurpose = purposeOptions.find(p => p.id === entry.to_purpose_id)?.label || "";
        return `Transfer From ${toPurpose}`;
      } else if (entry.transfer_Project_id) {
        const toSite = siteOptions.find(s => s.id === entry.transfer_Project_id)?.label || "";
        return `Transfer From ${toSite}`;
      }
    }
    return "";
  }, [purpose, purposeOptions, siteOptions]);
  const filteredLoanData = useMemo(() => {
    if (!selectedOption || !purpose) return [];
    const purposeId = parseInt(purpose, 10);
    function matchesAssociate(entry) {
      if (selectedOption.type === 'Vendor') return entry.vendor_id === selectedOption.id;
      if (selectedOption.type === 'Contractor') return entry.contractor_id === selectedOption.id;
      if (selectedOption.type === 'Employee') return entry.employee_id === selectedOption.id;
      if (selectedOption.type === 'Labour') return entry.labour_id === selectedOption.id;
      if (selectedOption.type === 'Site') return entry.project_id === selectedOption.id;
      return false;
    }
    function matchesPurpose(entry) {
      // For all types, only show entries where selected purpose is the from_purpose_id
      return entry.from_purpose_id === purposeId;
    }
    return loanData
      .filter(entry => matchesAssociate(entry) && matchesPurpose(entry))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [loanData, selectedOption, purpose]);
  // Calculate filtered amount based on date range and payment mode (excluding refund amounts)
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
        !filteredPaymentMode || entry.loan_payment_mode === filteredPaymentMode;
      return isInDateRange && isMatchingPayment;
    });
    const total = filtered.reduce((sum, entry) => {
      if (entry.type === 'Loan') {
        const amount = Math.abs(parseFloat(entry.amount) || 0);
        return sum + amount;
      } else {
        return sum;
      }
    }, 0);
    setFilteredAmount(total);
  }, [fromDate, toDate, filteredPaymentMode, loanData]);
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
        if (entry.type === 'Refund') {
          return sum;
        } else {
          const amount = Math.abs(parseFloat(entry.amount) || 0);
          return sum + amount;
        }
      }, 0);
    setTodayAmount(todayTotal);
  }, [loanData]);
  useEffect(() => {
    const total = loanData.reduce((sum, entry) => {
      if (entry.type === 'Loan') {
        const amount = parseFloat(entry.amount) || 0;
        return sum + amount;
      } else if (entry.type === 'Refund') {
        const refundAmount = parseFloat(entry.loan_refund_amount) || 0;
        return sum - refundAmount;
      } else if (entry.type === 'Transfer') {
        const transferAmount = parseFloat(entry.amount) || 0;
        return sum + transferAmount;
      }
      return sum;
    }, 0);
    setTotalOutstanding(total);
  }, [loanData]);
  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedLoanFile(file);
    }
    e.target.value = '';
  }, []);
  // File preview URL effect
  useEffect(() => {
    if (!selectedLoanFile) {
      setFilePreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedLoanFile);
    setFilePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedLoanFile]);
  // Review modal handlers
  const handleReviewConfirm = () => {
    if (isReviewEditMode) {
      return;
    }
    // Re-validate before proceeding
    if (!selectedLoanType || !dateValue || !selectedOption || !purpose) {
      toast.error("Please fill all required fields!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return;
    }
    // Validation based on loan type
    if (selectedLoanType === "Loan") {
      if (!amountGiven || parseFloat(amountGiven) <= 0) {
        toast.error("Please enter a valid amount given!", {
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
    }
    if (selectedLoanType === "Refund") {
      if (!amountGiven || parseFloat(amountGiven) <= 0) {
        toast.error("Please enter a valid refund amount!", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored"
        });
        return;
      }
    }
    if (selectedLoanType === "Transfer") {
      if (!transferSelection) {
        toast.error("Please select transfer destination!", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored"
        });
        return;
      }
      if (!transferAmount || parseFloat(transferAmount) <= 0) {
        toast.error("Please enter a valid transfer amount!", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored"
        });
        return;
      }
    }
    // Check if we need to show payment details popup
    if (selectedLoanType === "Loan" && ["GPay", "PhonePe", "Net Banking", "Cheque"].includes(paymentMode)) {
      setShowReviewModal(false);
      setShowPaymentModal(true);
      return;
    }
    // Otherwise, proceed with direct submission
    submitLoanData();
  };
  const handleReviewClose = () => {
    setShowReviewModal(false);
    setIsReviewEditMode(false);
  };
  const handleReviewSave = () => {
    setIsReviewEditMode(false);
  };

  const renderReviewRow = (label, value) => (
    <div className="flex justify-between gap-4 border border-gray-100 rounded-lg px-4 py-2" key={label}>
      <span className="text-sm font-semibold text-gray-600">{label}</span>
      <span className="text-sm text-gray-800 text-right break-words">{value || '-'}</span>
    </div>
  );

  const formatDateForReview = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleChangeAttachment = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const isPdfPreview = selectedLoanFile?.type?.toLowerCase().includes('pdf');

  // Helper function to format date
  const formatDateOnly = useCallback((dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }, []);

  // Export PDF function
  const handleExportPDF = useCallback(() => {
    if (!filteredLoanData || filteredLoanData.length === 0) {
      toast.error("No data to export!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return;
    }
    const doc = new jsPDF();
    const entityType = selectedOption?.type === "Contractor" ? "Contractor"
      : selectedOption?.type === "Vendor" ? "Vendor"
        : selectedOption?.type === "Employee" ? "Employee"
          : selectedOption?.type === "Labour" ? "Labour"
            : "Associate";
    const entityName = selectedOption?.label || "";
    const purposeName = purposeOptions.find(p => p.id === parseInt(purpose))?.label || "";
    doc.setFontSize(12);
    doc.text(`${entityType} - ${entityName}`, 14, 20);
    const pageWidth = doc.internal.pageSize.getWidth();
    const purposeText = `Purpose: ${purposeName}`;
    const textWidth = doc.getTextWidth(purposeText);
    doc.text(purposeText, pageWidth - textWidth - 14, 20);
    // Filter and sort data
    const filteredData = filteredLoanData
      .sort((a, b) => {
        // Sort by type (custom order) then date (descending)
        const typeOrder = ["Loan", "Refund", "Transfer"];
        const typeIndexA = typeOrder.indexOf((a.type || "").trim());
        const typeIndexB = typeOrder.indexOf((b.type || "").trim());
        if (typeIndexA !== typeIndexB) return typeIndexA - typeIndexB;
        // Then sort by date (newest first)
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });
    // Table columns
    const tableColumn = [
      "S.No",
      "Date",
      "Loan",
      "Transfer/Refund",
      "Type",
      "Mode",
      "Description"
    ];
    // Table rows
    const tableRows = filteredData.map((entry, index) => {
      const {
        date,
        amount,
        loan_refund_amount,
        loan_payment_mode,
        type,
        description
      } = entry;
      // Format loan amount (positive for Loan, negative for Refund shown in Loan column)
      let loanAmount = '';
      if (type === 'Refund') {
        loanAmount = loan_refund_amount != null
          ? (-Math.abs(loan_refund_amount)).toLocaleString('en-IN')
          : '';
      } else {
        loanAmount = amount != null
          ? parseFloat(amount).toLocaleString('en-IN')
          : '';
      }
      let transferRefundText = '';
      if (type === 'Refund') {
        transferRefundText = 'Refund';
      } else if (type === 'Transfer') {
        transferRefundText = getTransferDestination(entry) || '';
      }
      return [
        index + 1,
        new Date(date).toLocaleDateString('en-GB'),
        loanAmount,
        transferRefundText,
        type || '',
        loan_payment_mode || '',
        description || ''
      ];
    });
    // Generate PDF table
    doc.autoTable({
      startY: 28,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      styles: { halign: "left", fontSize: 8 },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        lineWidth: 0.1,
        fontStyle: "bold"
      },
      columnStyles: {
        2: { halign: 'right' } // Loan
      }
    });
    const fileName = `LoanPortal_${selectedOption?.label || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }, [filteredLoanData, selectedOption, purpose, purposeOptions, getTransferDestination, toast]);
  // Export CSV function
  const handleExportCSV = useCallback(() => {
    if (!filteredLoanData || filteredLoanData.length === 0) {
      toast.error("No data to export!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return;
    }
    const csvHeaders = [
      "S.No",
      "Date",
      "Loan",
      "Transfer/Refund",
      "Type",
      "Mode",
      "Description"
    ];
    // Filter and sort data
    const filteredData = filteredLoanData
      .sort((a, b) => {
        const typeOrder = ["Loan", "Refund", "Transfer"];
        const typeIndexA = typeOrder.indexOf((a.type || "").trim());
        const typeIndexB = typeOrder.indexOf((b.type || "").trim());

        if (typeIndexA !== typeIndexB) return typeIndexA - typeIndexB;

        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });
    const csvRows = filteredData.map((entry, index) => {
      const { date, amount, loan_refund_amount, loan_payment_mode, type, description } = entry;
      // Format loan amount
      let loanAmount = '';
      if (type === 'Refund') {
        loanAmount = loan_refund_amount != null
          ? (-Math.abs(loan_refund_amount)).toLocaleString('en-IN')
          : '';
      } else {
        loanAmount = amount != null
          ? parseFloat(amount).toLocaleString('en-IN')
          : '';
      }
      // Get transfer/refund info
      let transferRefund = '';
      if (type === 'Refund') {
        transferRefund = 'Refund';
      } else if (type === 'Transfer') {
        transferRefund = getTransferDestination(entry) || '';
      }
      return [
        index + 1,
        formatDateOnly(date),
        loanAmount,
        transferRefund,
        type || '',
        loan_payment_mode || '',
        description || ''
      ];
    });
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
    const fileName = `LoanPortal_${selectedOption?.label || 'Report'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredLoanData, selectedOption, getTransferDestination, formatDateOnly, toast]);
  // Build review details array
  const reviewDetails = [
    { label: 'Type', value: selectedLoanType || '-' },
    { label: 'Date', value: formatDateForReview(dateValue) || '-' },
    { label: 'Associate', value: selectedOption?.label || '-' },
    { label: selectedOption?.type === 'Vendor' ? 'Vendor ID' : selectedOption?.type === 'Contractor' ? 'Contractor ID' : selectedOption?.type === 'Employee' ? 'Employee ID' : selectedOption?.type === 'Labour' ? 'Labour ID' : 'Associate ID', value: selectedOption?.id || '-' },
    { label: 'Purpose', value: purposeOptions.find(p => p.id === parseInt(purpose))?.label || '-' },
    { label: 'Purpose ID', value: purpose || '-' },
  ];
  if (selectedLoanType === 'Loan') {
    reviewDetails.push(
      { label: 'Amount Given', value: formatWithCommas(amountGiven) || '-' },
      { label: 'Payment Mode', value: paymentMode || '-' }
    );
  } else if (selectedLoanType === 'Refund') {
    reviewDetails.push(
      { label: 'Refund Amount', value: formatWithCommas(amountGiven) || '-' }
    );
  } else if (selectedLoanType === 'Transfer') {
    reviewDetails.push(
      { label: 'Transfer To', value: transferSelection?.label || '-' },
      { label: 'Transfer Amount', value: formatWithCommas(transferAmount) || '-' }
    );
  }
  reviewDetails.push(
    { label: 'Description', value: description || '-' },
    { label: 'File Attached', value: selectedLoanFile ? selectedLoanFile.name : 'No file attached' }
  );
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
      const res = await fetch(`https://backendaab.in/aabuildersDash/api/loans/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      if (!res.ok) throw new Error('Failed to update');
      const response = await fetch('https://backendaab.in/aabuildersDash/api/loans/all');
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
        <div className='mr-10 ml-10'>
          <div className=' xl:flex gap-10 max-w-[95vw] text-left'>
            <div className='bg-white w-full p-4 px-4 py-2 rounded text-left xl:flex  items-center pb-6 gap-[16px]'>
              <div className='space-y-2 flex-1'>
                <h2 className='font-semibold text-sm sm:text-base'>From Date</h2>
                <input
                  type='date'
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className='border-2 border-[#BF9853] border-opacity-30 rounded-lg px-2 py-1 w-full h-[45px] focus:outline-none text-sm'
                />
              </div>
              <div className='space-y-2 flex-1'>
                <h2 className='font-semibold text-sm sm:text-base'>To Date</h2>
                <input
                  type='date'
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className='border-2 border-[#BF9853] border-opacity-30 rounded-lg px-2 py-1 w-full h-[45px] focus:outline-none text-sm'
                />
              </div>
              <div className='space-y-2 flex-1'>
                <h2 className='font-semibold text-sm sm:text-base'>Amount Given</h2>
                <input
                  readOnly
                  value={filteredAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  className='bg-[#F2F2F2] rounded-lg p-2 w-full h-[45px] focus:outline-none text-sm'
                />
              </div>
              <div className='space-y-2 flex-1'>
                <h2 className='font-semibold text-sm sm:text-base'>Payment Mode</h2>
                <Select
                  options={finalPaymentModeOptions}
                  value={filteredPaymentMode ? { value: filteredPaymentMode, label: filteredPaymentMode } : null}
                  onChange={(selected) => setFilteredPaymentMode(selected ? selected.value : '')}
                  placeholder="Select"
                  isSearchable
                  isClearable
                  menuPortalTarget={document.body}
                  styles={customStyles}
                  className='w-full rounded-lg focus:outline-none'
                />
              </div>
            </div>
            <div className='flex flex-col xl:flex-row xl:mt-0 mt-4 bg-white w-full xl:max-w-[1100px] h-auto xl:h-[128px] rounded-md p-4 gap-[16px] px-10 '>
              <div className='space-y-2'>
                <h2 className='font-semibold text-sm sm:text-base'>Today Amount</h2>
                <input readOnly type='text'
                  value={todayAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  className='bg-[#F2F2F2] rounded-lg p-2 w-full h-[45px] focus:outline-none text-sm'
                />
              </div>
              <div className='space-y-2'>
                <h2 className='font-semibold text-sm sm:text-base'>Total Outstanding</h2>
                <input readOnly type='text'
                  value={totalOutstanding.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  className='bg-[#F2F2F2] p-2 rounded-lg w-full h-[45px] focus:outline-none text-sm'
                />
              </div>
            </div>
          </div>
        </div>
        <div className='mr-10 ml-10 mt-5'>
          <div className='bg-white w-full max-w-[95vw] xl:h-[630px] h-auto p-4 lg:p-6 rounded-md shadow-sm'>
            <div className='flex flex-col xl:flex-row gap-6 '>
              <div className='flex-1 xl:max-w-[600px]'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-left'>
                  <div className='space-y-2 flex items-center'>
                    <label className='font-semibold text-[#E4572E] text-sm sm:text-base w-40'>Select Type</label>
                    <Select
                      options={[
                        { value: 'Loan', label: 'Loan' },
                        { value: 'Refund', label: 'Refund' },
                        { value: 'Transfer', label: 'Transfer' }
                      ]}
                      value={selectedLoanType ? { value: selectedLoanType, label: selectedLoanType } : null}
                      onChange={(selected) => setSelectedLoanType(selected ? selected.value : '')}
                      placeholder="Select Type..."
                      isSearchable
                      isClearable
                      styles={customStyles}
                      className='w-full rounded-lg focus:outline-none'
                    />
                  </div>
                  <div className='space-y-2 flex items-center gap-5'>
                    <label className='font-semibold text-[#E4572E] text-sm sm:text-base'>Date</label>
                    <input
                      type='date'
                      value={dateValue}
                      onChange={(e) => setDateValue(e.target.value)}
                      className='w-full h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='font-semibold block text-sm sm:text-base'>Associate</label>
                    <Select
                      options={combinedOptions}
                      value={selectedOption}
                      onChange={handleChange}
                      className='w-full rounded-lg focus:outline-none'
                      isClearable
                      isSearchable
                      styles={customStyles}
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='font-semibold block text-sm sm:text-base'>Overall Loan</label>
                    <input
                      value={overallLoan.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      disabled
                      className='w-full h-[45px] px-2 py-1 rounded-lg bg-[#F2F2F2] focus:outline-none text-sm'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='font-semibold block text-sm sm:text-base'>Purpose</label>
                    <Select
                      options={purposeOptions}
                      value={purpose ? purposeOptions.find(opt => opt.id === parseInt(purpose)) : null}
                      onChange={(selected) => setPurpose(selected ? selected.id : '')}
                      placeholder="Select Purpose"
                      isSearchable
                      isClearable
                      styles={customStyles}
                      className='w-full rounded-lg focus:outline-none'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='font-semibold block text-sm sm:text-base'>Loan Amount</label>
                    <input
                      value={formatWithCommas(loanAmount)}
                      readOnly
                      disabled
                      className='w-full h-[45px] px-2 py-1 rounded-lg bg-[#F2F2F2] focus:outline-none text-sm'
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='font-semibold block text-sm sm:text-base'>
                      {selectedLoanType === 'Transfer' ? 'Transfer To' :
                        selectedLoanType === 'Refund' ? 'Amount' : 'Amount Given'}
                    </label>
                    {selectedLoanType === 'Transfer' ? (
                      <Select
                        options={combinedSitePurposeOptions}
                        value={transferSelection}
                        onChange={(selected) => setTransferSelection(selected || null)}
                        className='w-full rounded-lg focus:outline-none'
                        isClearable
                        isSearchable
                        styles={customStyles}
                        placeholder="Select Transfer To"
                      />
                    ) : (
                      <input
                        value={selectedLoanType === 'Refund' ? formatWithCommas(amountGiven) : formatWithCommas(amountGiven)}
                        onChange={handleAmountChange}
                        placeholder="Enter Amount"
                        className='w-full h-[45px] no-spinner border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                      />
                    )}
                  </div>
                  <div className='space-y-2'>
                    <label className='font-semibold block text-sm sm:text-base'>
                      {selectedLoanType === 'Transfer' ? 'Transfer Amount' : 'Payment Mode'}
                    </label>
                    {selectedLoanType === 'Transfer' ? (
                      <input
                        value={formatWithCommas(transferAmount)}
                        onChange={handleTransferAmountChange}
                        placeholder="Enter Amount"
                        className='w-full h-[45px] no-spinner border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                      />
                    ) : (
                      <Select
                        options={finalPaymentModeOptions}
                        value={paymentMode ? { value: paymentMode, label: paymentMode } : null}
                        onChange={(selected) => {
                          const newPaymentMode = selected ? selected.value : '';
                          setPaymentMode(newPaymentMode);
                          // Reset payment popup data when payment mode changes
                          if (!["GPay", "PhonePe", "Net Banking", "Cheque"].includes(newPaymentMode)) {
                            setPaymentPopupData({
                              chequeNo: "",
                              chequeDate: "",
                              transactionNumber: "",
                              accountNumber: ""
                            });
                          }
                        }}
                        placeholder="Select"
                        isSearchable
                        isClearable
                        styles={customStyles}
                        className='w-full rounded-lg focus:outline-none'
                      />
                    )}
                  </div>
                  <div className='col-span-1 sm:col-span-2 space-y-2'>
                    <label className='font-semibold block text-sm sm:text-base'>Description</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Type your text here..."
                      className='w-full h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-2 rounded-lg focus:outline-none text-sm'
                    />
                  </div>
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
                    <button className='bg-[#c7934c] text-white w-full sm:w-[120px] h-[33px] rounded flex items-center justify-center text-sm'
                      onClick={handleSubmit} disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : selectedLoanType}
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
              <div className='flex-1 xl:ml-6 xl:min-w-[800px]'>
                <div className='flex flex-col sm:flex-row items-start sm:items-center justify-end mb-4 gap-4'>
                  <div className='flex items-center gap-2'>
                    <input
                      readOnly
                      value={formatWithCommas(loanAmount)}
                      className='border-2 w-[112px] p-2 border-[#E4572E] text-[#E4572E] font-bold border-opacity-10 rounded h-[33px] bg-[#F2F2F2] focus:outline-none text-xs'
                    />
                  </div>
                  <div className='flex flex-wrap gap-2 sm:gap-4'>
                    <span
                      className='text-[#E4572E] font-semibold hover:underline cursor-pointer text-sm'
                      onClick={handleExportPDF}
                    >
                      Export PDF
                    </span>
                    <span
                      className='text-[#007233] font-semibold hover:underline cursor-pointer text-sm'
                      onClick={handleExportCSV}
                    >
                      Export XL
                    </span>
                    <span className='text-[#BF9853] font-semibold hover:underline cursor-pointer text-sm'>Print</span>
                  </div>
                </div>
                <div className='border-l-8 border-l-[#BF9853] rounded-lg overflow-auto'>
                  <div className='overflow-x-auto'>
                    <table className="w-full min-w-[1000px]">
                      <thead className="bg-[#FAF6ED] text-left">
                        <tr>
                          <th className="px-6 py-2 text-xs sm:text-sm w-[130px]">Date</th>
                          <th className="px-2 py-2 text-xs sm:text-sm w-[250px]">Loan</th>
                          <th className="px-2 py-2 text-xs sm:text-sm w-[250px]">Transfer/Refund</th>
                          <th className="px-2 py-2 text-xs sm:text-sm">Mode</th>
                          <th className="px-2 py-2 text-xs sm:text-sm">Activity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!selectedOption ? (
                          <tr>
                            <td colSpan="5" className="text-center py-4 text-sm text-gray-500">
                              Please select an associate to view loan records.
                            </td>
                          </tr>
                        ) : filteredLoanData.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center py-4 text-sm text-gray-500">
                              No records found for the selected associate and purpose.
                            </td>
                          </tr>
                        ) : (
                          filteredLoanData.map((entry) => {
                            const { loanPortalId, date, amount, loan_refund_amount, loan_payment_mode, type } = entry;
                            const formattedDate = date ? new Date(date).toLocaleDateString('en-GB') : '';
                            // Show refund amount as negative value in Loan column for Refund type, otherwise normal amount
                            const displayAmount =
                              type === 'Refund'
                                ? loan_refund_amount != null
                                  ? (-Math.abs(loan_refund_amount)).toLocaleString('en-IN')
                                  : ''
                                : amount != null
                                  ? parseFloat(amount).toLocaleString('en-IN')
                                  : '';

                            return (
                              <tr key={loanPortalId}>
                                <td className="px-2 py-2 text-xs sm:text-sm font-semibold w-[120px]">{formattedDate}</td>
                                <td className={`px-2 py-2 text-xs sm:text-sm text-left font-semibold w-[150px] ${type === 'Refund' ? 'text-red-600' : 'text-green-600'}`}>
                                  {displayAmount}
                                </td>
                                <td className="px-2 py-2 text-xs sm:text-sm text-left font-semibold">
                                  {type === 'Refund' ? 'Refund' : type === 'Transfer' ? getTransferDestination(entry) : ''}
                                </td>
                                <td className="px-2 py-2 text-xs sm:text-sm text-left font-semibold">{loan_payment_mode || ''}</td>
                                <td className="px-2 py-2 w-[120px]">
                                  <button className="rounded-full transition duration-200" onClick={() => handleEditClick(entry)}>
                                    <img
                                      src={edit}
                                      alt="Edit"
                                      className="w-4 h-6 transform hover:scale-110 hover:brightness-110 transition duration-200"
                                    />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                    <Select
                      options={finalPaymentModeOptions}
                      value={editFormData.mode ? { value: editFormData.mode, label: editFormData.mode } : null}
                      onChange={(selected) => setEditFormData({ ...editFormData, mode: selected ? selected.value : '' })}
                      placeholder="Select"
                      isSearchable
                      isClearable
                      styles={customStyles}
                      className="w-full focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-sm">Purpose</label>
                    <Select
                      options={purposeOptions}
                      value={editFormData.purpose ? purposeOptions.find(opt => opt.id === parseInt(editFormData.purpose) || opt.value === editFormData.purpose) : null}
                      onChange={(selected) => setEditFormData({ ...editFormData, purpose: selected ? selected.id : '' })}
                      placeholder="Select Purpose"
                      isSearchable
                      isClearable
                      styles={customStyles}
                      className="w-full focus:outline-none"
                    />
                  </div>
                </div>
                <div className='mb-4'>
                  <label className="block mb-2 font-semibold text-sm">Description</label>
                  <textarea value={editFormData.description} onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="border-2 border-[#BF9853] border-opacity-30 w-full h-[60px] rounded-lg focus:outline-none text-sm"
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

        {/* Payment Details Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white text-left rounded-xl p-6 w-[800px] max-h-[90vh] overflow-y-auto flex flex-col">
              <h3 className="text-lg font-semibold mb-4 text-center">Payment Details</h3>
              <div className="flex-1 overflow-hidden">
                <div className="space-y-4 mb-4">
                  <div className="border-2 border-[#BF9853] border-opacity-25 w-full rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                        <input
                          type="date"
                          value={dateValue}
                          readOnly
                          className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                        <input
                          type="text"
                          value={formatWithCommas(amountGiven)}
                          readOnly
                          className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full text-gray-600 bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                        <input
                          type="text"
                          value={paymentMode}
                          readOnly
                          className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full text-gray-600 bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  {(paymentMode === "GPay" || paymentMode === "PhonePe" ||
                    paymentMode === "Net Banking" || paymentMode === "Cheque") && (
                      <div className="border-2 border-[#BF9853] border-opacity-25 w-full rounded-lg p-4">
                        <div className="space-y-4">
                          {paymentMode === "Cheque" && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cheque No<span className="text-red-500">*</span></label>
                                <input
                                  type="text"
                                  value={paymentPopupData.chequeNo}
                                  onChange={(e) => setPaymentPopupData(prev => ({ ...prev, chequeNo: e.target.value }))}
                                  placeholder="Enter cheque number"
                                  className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cheque Date<span className="text-red-500">*</span></label>
                                <input
                                  type="date"
                                  value={paymentPopupData.chequeDate}
                                  onChange={(e) => setPaymentPopupData(prev => ({ ...prev, chequeDate: e.target.value }))}
                                  className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                />
                              </div>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Number<span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                value={paymentPopupData.transactionNumber}
                                onChange={(e) => setPaymentPopupData(prev => ({ ...prev, transactionNumber: e.target.value }))}
                                placeholder="Enter transaction number"
                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Account Number<span className="text-red-500">*</span></label>
                              <Select
                                options={accountDetails.map((account) => ({
                                  value: account.account_number,
                                  label: account.account_number
                                }))}
                                value={paymentPopupData.accountNumber ? { value: paymentPopupData.accountNumber, label: paymentPopupData.accountNumber } : null}
                                onChange={(selected) => setPaymentPopupData(prev => ({ ...prev, accountNumber: selected ? selected.value : '' }))}
                                placeholder="Select Account"
                                isSearchable
                                isClearable
                                styles={customStyles}
                                className="w-full focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentPopupData({
                      chequeNo: "",
                      chequeDate: "",
                      transactionNumber: "",
                      accountNumber: ""
                    });
                  }}
                  className="w-[100px] h-[45px] border border-[#BF9853] rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentModalSubmit}
                  className="w-[100px] h-[45px] bg-[#BF9853] text-white rounded"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white text-left rounded-xl p-6 w-[1400px] h-[680px] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Review Submission</h3>
                <button onClick={handleReviewClose} className="text-2xl font-bold text-gray-400 hover:text-gray-700">
                  ×
                </button>
              </div>
              <div className="flex flex-1 gap-6 overflow-hidden">
                <div className="flex-[0.40] flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-semibold text-gray-700">Loan Details</h4>
                    <button
                      type="button"
                      onClick={() => setIsReviewEditMode((prev) => !prev)}
                      className="px-4 py-2 border border-[#BF9853] text-[#BF9853] rounded-lg hover:bg-[#FFF8EE]"
                    >
                      {isReviewEditMode ? 'Cancel Edit' : 'Edit'}
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-4">
                    {isReviewEditMode ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-semibold mb-1 block">Type</label>
                          <Select
                            options={[
                              { value: 'Loan', label: 'Loan' },
                              { value: 'Refund', label: 'Refund' },
                              { value: 'Transfer', label: 'Transfer' }
                            ]}
                            value={selectedLoanType ? { value: selectedLoanType, label: selectedLoanType } : null}
                            onChange={(selected) => setSelectedLoanType(selected ? selected.value : '')}
                            placeholder="Select Type..."
                            isSearchable
                            isClearable
                            styles={customStyles}
                            className="custom-select rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold mb-1 block">Date</label>
                          <input
                            type="date"
                            value={dateValue}
                            onChange={(e) => setDateValue(e.target.value)}
                            className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg px-3 border-opacity-20"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold mb-1 block">Associate</label>
                          <Select
                            options={combinedOptions}
                            value={selectedOption}
                            onChange={handleChange}
                            styles={customStyles}
                            isClearable
                            isSearchable
                            className="custom-select rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold mb-1 block">Purpose</label>
                          <Select
                            options={purposeOptions}
                            value={purpose ? purposeOptions.find(opt => opt.id === parseInt(purpose)) : null}
                            onChange={(selected) => setPurpose(selected ? selected.id : '')}
                            placeholder="Select Purpose"
                            isSearchable
                            isClearable
                            styles={customStyles}
                            className="custom-select rounded-lg"
                          />
                        </div>
                        {selectedLoanType === 'Loan' && (
                          <>
                            <div>
                              <label className="text-sm font-semibold mb-1 block">Amount Given</label>
                              <input
                                value={formatWithCommas(amountGiven)}
                                onChange={handleAmountChange}
                                className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg px-3 border-opacity-20"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-semibold mb-1 block">Payment Mode</label>
                              <Select
                                options={finalPaymentModeOptions}
                                value={paymentMode ? { value: paymentMode, label: paymentMode } : null}
                                onChange={(selected) => {
                                  const newPaymentMode = selected ? selected.value : '';
                                  setPaymentMode(newPaymentMode);
                                  // Reset payment popup data when payment mode changes
                                  if (!["GPay", "PhonePe", "Net Banking", "Cheque"].includes(newPaymentMode)) {
                                    setPaymentPopupData({
                                      chequeNo: "",
                                      chequeDate: "",
                                      transactionNumber: "",
                                      accountNumber: ""
                                    });
                                  }
                                }}
                                placeholder="Select"
                                isSearchable
                                isClearable
                                styles={customStyles}
                                className="custom-select rounded-lg"
                              />
                            </div>
                          </>
                        )}
                        {selectedLoanType === 'Refund' && (
                          <div>
                            <label className="text-sm font-semibold mb-1 block">Refund Amount</label>
                            <input
                              value={formatWithCommas(amountGiven)}
                              onChange={handleAmountChange}
                              className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg px-3 border-opacity-20"
                            />
                          </div>
                        )}
                        {selectedLoanType === 'Transfer' && (
                          <>
                            <div>
                              <label className="text-sm font-semibold mb-1 block">Transfer To</label>
                              <Select
                                options={combinedSitePurposeOptions}
                                value={transferSelection}
                                onChange={(selected) => setTransferSelection(selected || null)}
                                styles={customStyles}
                                isClearable
                                placeholder="Select Transfer To"
                                className="custom-select rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-semibold mb-1 block">Transfer Amount</label>
                              <input
                                value={formatWithCommas(transferAmount)}
                                onChange={handleTransferAmountChange}
                                className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg px-3 border-opacity-20"
                              />
                            </div>
                          </>
                        )}
                        <div className="col-span-2">
                          <label className="text-sm font-semibold mb-1 block">Description</label>
                          <textarea
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Type your text here..."
                            className="w-full border-2 border-[#BF9853] rounded-lg px-3 py-2 border-opacity-20"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {reviewDetails.map((detail) => renderReviewRow(detail.label, detail.value))}
                      </div>
                    )}
                  </div>
                  {isReviewEditMode && (
                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => setIsReviewEditMode(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg"
                      >
                        Discard
                      </button>
                      <button
                        type="button"
                        onClick={handleReviewSave}
                        className="px-4 py-2 bg-[#BF9853] text-white rounded-lg"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
                <div className="w-px bg-gray-200"></div>
                <div className="flex-[0.65] flex flex-col">
                  <h4 className="text-base font-semibold text-gray-700 mb-3">Preview</h4>
                  <div className="flex-1 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                    {filePreviewUrl ? (
                      isPdfPreview ? (
                        <iframe
                          src={`${filePreviewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                          title="Attachment preview"
                          className="w-full h-full rounded-lg border-none"
                        />
                      ) : (
                        <img src={filePreviewUrl} alt="Attachment preview" className="w-full h-full object-contain" />
                      )
                    ) : (
                      <p className="text-sm text-gray-500">No file selected</p>
                    )}
                  </div>
                  {selectedLoanFile && (
                    <p className="text-xs text-gray-500 mt-2 break-words">{selectedLoanFile.name}</p>
                  )}
                  <button
                    type="button"
                    onClick={handleChangeAttachment}
                    className="mt-4 px-4 py-2 border border-[#BF9853] text-[#BF9853] rounded-lg hover:bg-[#FFF8EE]"
                  >
                    Change Attachfile
                  </button>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleReviewClose}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleReviewConfirm}
                  disabled={isSubmitting || isReviewEditMode}
                  className={`px-4 py-2 rounded-lg text-white ${isSubmitting || isReviewEditMode ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#BF9853]'}`}
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
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