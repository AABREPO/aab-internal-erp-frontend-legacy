import { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import Attach from '../Images/Attachfile.svg';
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import edit from '../Images/Edit.svg';
import file from '../Images/file.png';

const AdvancePortal = ({ username, userRoles = [], paymentModeOptions = [] }) => {
  // Use paymentModeOptions from props, fallback to default if not provided
  const defaultPaymentModeOptions = [
    { value: 'Cash', label: 'Cash' },
    { value: 'GPay', label: 'GPay' },
    { value: 'PhonePe', label: 'PhonePe' },
    { value: 'Net Banking', label: 'Net Banking' },
    { value: 'Cheque', label: 'Cheque' }
  ];
  const finalPaymentModeOptions = paymentModeOptions.length > 0 ? paymentModeOptions : defaultPaymentModeOptions;

  const [selectedType, setSelectedType] = useState('Advance')
  const [selectedOption, setSelectedOption] = useState(null);
  const [combinedOptions, setCombinedOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [siteOptions, setSiteOptions] = useState([]);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [dateValue, setDateValue] = useState('');
  const [projectAdvance, setProjectAdvance] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [todayAmount, setTodayAmount] = useState(0);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [filteredPaymentMode, setFilteredPaymentMode] = useState('');
  const [filteredAmount, setFilteredAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [transferSiteId, setTransferSiteId] = useState('');
  const [entryNo, setEntryNo] = useState(1);
  const [advanceData, setAdvanceData] = useState([]);
  const [overallAdvance, setOverallAdvance] = useState(0);
  const [selectedAdvanceFile, setSelectedAdvanceFile] = useState(null);
  const fileInputRef = useRef(null);
  const [billAmount, setBillAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Expenses Entry Form states
  const [eno, setEno] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [accountDetails, setAccountDetails] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: "",
    paymentMode: "",
    chequeNo: "",
    chequeDate: "",
    transactionNumber: "",
    accountNumber: ""
  });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isReviewEditMode, setIsReviewEditMode] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  useEffect(() => {
    const savedselectedType = sessionStorage.getItem('selectedType');
    const savedContractorVendor = sessionStorage.getItem('selectedOption');
    const savedProjectName = sessionStorage.getItem('selectedSite');
    const savedoverallAdvance = sessionStorage.getItem('overallAdvance');
    const savedbillAmount = sessionStorage.getItem('billAmount');
    const savedadvanceAmount = sessionStorage.getItem('advanceAmount');
    const savedtransferSiteId = sessionStorage.getItem('transferSiteId');
    const savedpaymentMode = sessionStorage.getItem('paymentMode');
    const saveddescription = sessionStorage.getItem('description');
    try {
      if (savedselectedType) setSelectedType(JSON.parse(savedselectedType));
      if (savedContractorVendor) setSelectedOption(JSON.parse(savedContractorVendor));
      if (savedProjectName) setSelectedSite(JSON.parse(savedProjectName));
      if (savedoverallAdvance) setOverallAdvance(JSON.parse(savedoverallAdvance));
      if (savedbillAmount) setBillAmount(JSON.parse(savedbillAmount));
      if (savedadvanceAmount) setAdvanceAmount(JSON.parse(savedadvanceAmount));
      if (savedtransferSiteId) setTransferSiteId(JSON.parse(savedtransferSiteId));
      if (savedpaymentMode) setPaymentMode(JSON.parse(savedpaymentMode));
      if (saveddescription) setDescription(JSON.parse(saveddescription));
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
    sessionStorage.removeItem('overallAdvance');
    sessionStorage.removeItem('billAmount');
    sessionStorage.removeItem('advanceAmount');
    sessionStorage.removeItem('transferSiteId');
    sessionStorage.removeItem('paymentMode');
    sessionStorage.removeItem('description');
  };
  useEffect(() => {
    if (selectedType) sessionStorage.setItem('selectedType', JSON.stringify(selectedType));
    if (selectedOption) sessionStorage.setItem('selectedOption', JSON.stringify(selectedOption));
    if (selectedSite) sessionStorage.setItem('selectedSite', JSON.stringify(selectedSite));
    if (overallAdvance) sessionStorage.setItem('overallAdvance', JSON.stringify(overallAdvance));
    if (billAmount) sessionStorage.setItem('billAmount', JSON.stringify(billAmount));
    if (advanceAmount) sessionStorage.setItem('advanceAmount', JSON.stringify(advanceAmount));
    if (transferSiteId) sessionStorage.setItem('transferSiteId', JSON.stringify(transferSiteId));
    if (paymentMode) sessionStorage.setItem('paymentMode', JSON.stringify(paymentMode));
    if (description) sessionStorage.setItem('description', JSON.stringify(description));
  }, [selectedType, selectedOption, selectedSite, overallAdvance, billAmount, advanceAmount, transferSiteId, paymentMode, description]);
  const formatWithCommas = (value) => {
    if (value === '' || value === null || value === undefined) return "";
    const numericValue = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(numericValue)) {
      return value.toString();
    }
    return numericValue.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  };
  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (!isNaN(rawValue)) {
      setAdvanceAmount(rawValue);
    }
  };
  const handleProjectChange = (selected) => {
    setSelectedSite(selected);
    if (selected) {
      localStorage.setItem("advanceProjectName", JSON.stringify(selected));
    } else {
      localStorage.removeItem("advanceProjectName");
    }
  };
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
          { value: "Multi-Project Batch", label: "Multi-Project Batch", id: 10, sNo: "10" },
          { value: "Loan Portal", label: "Loan Portal", id: 11, sNo: "11" },
          { value: "Bill Payment Tracker", label: "Bill Payment Tracker", id: 12, sNo: "12" },
        ];
        // Combine backend data with predefined options
        const combinedSiteOptions = [...predefinedSiteOptions, ...formattedData];
        setSiteOptions(combinedSiteOptions);
      } catch (error) {
        console.error("Fetch error: ", error);
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
          { value: "Multi-Project Batch", label: "Multi-Project Batch", id: 10, sNo: "10" },
          { value: "Loan Portal", label: "Loan Portal", id: 11, sNo: "11" },
          { value: "Bill Payment Tracker", label: "Bill Payment Tracker", id: 12, sNo: "12" },
        ];
        setSiteOptions(predefinedSiteOptions);
      }
    };
    fetchSites();
  }, []);
  // Fetch categories for expenses form
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuilderDash/api/expenses_categories/getAll", {
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
          id: item.id,
          value: item.category,
          label: item.category,
        }));
        setCategoryOptions(formattedData);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchCategories();
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
  // Fetch latest ENo for expenses form
  const fetchLatestEno = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/expenses_form/get_form');
      if (!response.ok) {
        throw new Error('Failed to fetch ENo');
      }
      const data = await response.json();
      if (data.length > 0) {
        const sortedData = data.sort((a, b) => b.eno - a.eno);
        const lastEno = sortedData[0].eno;
        setEno(lastEno + 1);
      } else {
        setEno(54173);
      }
    } catch (error) {
      console.error('Error fetching latest ENo:', error);
    }
  };
  useEffect(() => {
    fetchLatestEno();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/advance_portal/getAll');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setAdvanceData(data);
      } catch (error) {
        console.error('Error fetching advance portal data:', error);
      }
    };
    fetchData();
  }, []);
  const handleChange = async (selected) => {
    setSelectedOption(selected);
    if (selected) {
      localStorage.setItem("advanceContractorVendor", JSON.stringify(selected));
    } else {
      localStorage.removeItem("advanceContractorVendor");
    }
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/advance_portal/getAll');
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
          const amount = parseFloat(curr.amount) || 0;
          const billAmount = parseFloat(curr.bill_amount) || 0;
          const refundAmount = parseFloat(curr.refund_amount) || 0;
          return sum + amount - billAmount - refundAmount;
        }, 0);
      setOverallAdvance(total);
    } catch (error) {
      console.error('Error fetching or processing advance data:', error);
      setOverallAdvance(0);
    }
  };
  const calculateProjectAdvance = async (vendorOrContractor, project) => {
    if (!vendorOrContractor || !project) {
      setProjectAdvance('');
      return;
    }
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/advance_portal/getAll');
      if (!response.ok) throw new Error('Failed to fetch advance portal data');
      const data = await response.json();
      const isVendor = vendorOrContractor.type === 'Vendor';
      const idField = isVendor ? 'vendor_id' : 'contractor_id';
      // Filter for only this vendor/contractor & project
      const relevantData = data.filter(
        item => item[idField] === vendorOrContractor.id && item.project_id === project.id
      );
      // Sum amounts, subtract bill_amount & refund_amount
      const total = relevantData.reduce((sum, entry) => {
        const amount = parseFloat(entry.amount) || 0;
        const billAmount = parseFloat(entry.bill_amount) || 0;
        const refundAmount = parseFloat(entry.refund_amount) || 0;
        return sum + amount - billAmount - refundAmount;
      }, 0);
      setProjectAdvance(total.toLocaleString('en-IN', { maximumFractionDigits: 2 }));
    } catch (error) {
      console.error('Error calculating project advance:', error);
      setProjectAdvance('');
    }
  };
  // Combine vendor and contractor options
  useEffect(() => { setCombinedOptions([...vendorOptions, ...contractorOptions]); }, [vendorOptions, contractorOptions]);
  // Get button label based on selected type
  const getButtonLabel = () => {
    switch (selectedType) {
      case 'Advance':
        return 'Pay Advance';
      case 'Transfer':
        return 'Transfer';
      case 'Bill Settlement':
        return 'Settle Bill';
      case 'Refund':
        return 'Refund';
      default:
        return 'Submit';
    }
  };
  // Sort site options alphabetically by label
  const sortedSiteOptions = siteOptions.sort((a, b) =>
    a.label.localeCompare(b.label)
  );
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
  const fetchAdvanceData = async () => {
    try {
      const res = await fetch('https://backendaab.in/aabuildersDash/api/advance_portal/getAll');
      const json = await res.json();
      setAdvanceData(json);
    } catch (error) {
      console.error('Error fetching advance data:', error);
    }
  };
  const validateFormFields = () => {
    // --- Common validation based on type ---
    if (selectedType === 'Advance' || selectedType === 'Refund') {
      if (!selectedOption || !selectedSite || !advanceAmount || !paymentMode) {
        alert("Please fill Nessacary details");
        return false;
      }
    } else if (selectedType === 'Bill Settlement') {
      if (!selectedOption || !selectedSite || !billAmount || !selectedCategory) {
        alert("Please fill Nessacary details");
        return false;
      }
      // --- File upload validation for Bill Settlement ---
      if (!selectedAdvanceFile) {
        alert("Please attach the bill file for Bill Settlement");
        return false;
      }
      // --- Extra validation for Bill Settlement ---
      const rawAmount = advanceAmount.toString().replace(/,/g, '').trim();
      if (rawAmount && !paymentMode) {
        alert("Please select Payment Mode if you enter Amount Given");
        return false;
      }
    } else if (selectedType === 'Transfer') {
      if (!selectedOption || !selectedSite || !advanceAmount || !transferSiteId) {
        alert("Please fill Nessacary details");
        return false;
      }
    } else {
      alert("Please select a valid type");
      return false;
    }
    // --- Validation for Amount Given ---
    const rawAmount = advanceAmount.toString().replace(/,/g, '').trim();
    if ((selectedType === 'Advance' || selectedType === 'Refund' || selectedType === 'Transfer') && !rawAmount) {
      alert("Please fill the Amount Given");
      return false;
    }
    // --- Validation for Bill Amount (only if type is Bill Settlement) ---
    if (selectedType === 'Bill Settlement') {
      const rawBillAmount = billAmount.toString().trim();
      if (!rawBillAmount) {
        alert("Please fill the Bill Amount");
        return false;
      }
    }
    return true;
  };
  const handleSubmit = async () => {
    if (!validateFormFields()) {
      return;
    }
    // Show review modal before submission
    setShowReviewModal(true);
    setIsReviewEditMode(false);
  };
  const handleReviewConfirm = () => {
    if (isReviewEditMode) {
      return;
    }
    if (!validateFormFields()) {
      return;
    }
    // Check if payment mode requires popup details (all modes except Cash)
    const requiresPaymentDetails = paymentMode && paymentMode !== 'Cash' && finalPaymentModeOptions.some(opt => opt.value === paymentMode);
    if (requiresPaymentDetails) {
      // Set up payment modal data and show popup
      setPaymentModalData({
        date: dateValue,
        amount: advanceAmount,
        paymentMode: paymentMode,
        chequeNo: "",
        chequeDate: "",
        transactionNumber: "",
        accountNumber: ""
      });
      setShowPaymentModal(true);
      setShowReviewModal(false);
      return; // Don't proceed with normal submission
    }
    submitAdvanceData();
  };
  const handleReviewClose = () => {
    setShowReviewModal(false);
    setIsReviewEditMode(false);
  };
  const handleReviewSave = () => {
    if (!validateFormFields()) {
      return;
    }
    setIsReviewEditMode(false);
  };
  const renderReviewRow = (label, value) => (
    <div className="flex justify-between gap-4 border border-gray-100 rounded-lg px-4 py-2" key={label}>
      <span className="text-sm font-semibold text-gray-600">{label}</span>
      <span className="text-sm text-gray-800 text-right break-words">{value || '-'}</span>
    </div>
  );
  const submitAdvanceData = async () => {
    setIsSubmitting(true); // Start loading
    setShowReviewModal(false);
    try {
      // Upload file if exists (for Bill Settlement)
      let fileUrl = '';
      if (selectedAdvanceFile && selectedType === 'Bill Settlement') {
        try {
          const formData = new FormData();
          const formatDateOnly = (dateString) => {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
          };
          const finalName = `${formatDateOnly(dateValue)} ${selectedSite.sNo} ${selectedOption.label}`;
          formData.append('file', selectedAdvanceFile);
          formData.append('file_name', finalName);
          const uploadResponse = await fetch("https://backendaab.in/aabuilderDash/expenses/googleUploader/uploadToGoogleDrive", {
            method: "POST",
            body: formData,
          });
          if (!uploadResponse.ok) {
            throw new Error('File upload failed');
          }
          const uploadResult = await uploadResponse.json();
          fileUrl = uploadResult.url;
        } catch (error) {
          console.error('Error during file upload:', error);
          alert('Error during file upload. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }
      const res = await fetch('https://backendaab.in/aabuildersDash/api/advance_portal/getAll');
      if (!res.ok) throw new Error('Failed to fetch entry numbers');
      const allData = await res.json();
      const maxEntryNo = allData.length > 0 ? Math.max(...allData.map(item => item.entry_no || 0)) : 0;
      const nextEntryNo = maxEntryNo + 1;
      const createPayload = (overrides = {}) => ({
        type: selectedType,
        date: dateValue,
        vendor_id: selectedOption?.type === 'Vendor' ? selectedOption.id : 0,
        contractor_id: selectedOption?.type === 'Contractor' ? selectedOption.id : 0,
        project_id: selectedSite?.id || 0,
        transfer_site_id: selectedType === 'Transfer' ? parseInt(transferSiteId) : 0,
        payment_mode: selectedType !== 'Transfer' ? paymentMode : '',
        amount:
          selectedType === 'Advance' || selectedType === 'Transfer' || selectedType === 'Bill Settlement'
            ? parseFloat(advanceAmount) || 0
            : 0,
        bill_amount: selectedType === 'Bill Settlement' ? parseFloat(billAmount) || 0 : 0,
        refund_amount: selectedType === 'Refund' ? parseFloat(advanceAmount) || 0 : 0,
        entry_no: nextEntryNo,
        week_no: getWeekNumber(),
        description: description,
        file_url: fileUrl,
        ...overrides
      });
      if (selectedType === 'Transfer') {
        const amountValue = parseFloat(advanceAmount) || 0;
        const transferSiteIdInt = parseInt(transferSiteId);
        // Check if transferring to Loan Portal (id = 11)
        if (transferSiteIdInt === 11) {
          // First, create loan entry in LoanPortal
          const loanPayload = {
            type: "Transfer",
            date: dateValue,
            amount: Math.abs(amountValue),
            loan_payment_mode: "",
            loan_refund_amount: 0,
            from_purpose_id: 1, // Set to 1 as per requirement
            transfer_Project_id: 0,
            to_purpose_id: 0,
            vendor_id: selectedOption?.type === "Vendor" ? selectedOption.id : 0,
            contractor_id: selectedOption?.type === "Contractor" ? selectedOption.id : 0,
            employee_id: 0,
            labour_id: 0,
            project_id: 0,
            description: "Transfer from Advance Portal",
            file_url: ""
          };
          // Save to LoanPortal
          const loanResponse = await fetch("https://backendaab.in/aabuildersDash/api/loans/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loanPayload)
          });
          if (!loanResponse.ok) {
            throw new Error('Failed to save loan portal data');
          }
          const loanResult = await loanResponse.json();
          const loanPortalId = loanResult.id || loanResult.loanPortalId;
          // Now save advance portal entry with negative amount and loan_portal_id
          const advancePayload = createPayload({
            amount: -Math.abs(amountValue),
            loan_portal_id: loanPortalId
          });
          await fetch('https://backendaab.in/aabuildersDash/api/advance_portal/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(advancePayload)
          });
        } else if (transferSiteIdInt === 12 && selectedOption?.type === 'Vendor') {
          // Check if transferring to Bill Payment Tracker (id = 12) and it's a vendor
          // First, create vendor carry forward entry in Bill Payment Tracker
          const vendorCarryForwardPayload = {
            type: "Transfer",
            date: dateValue,
            vendor_id: selectedOption.id,
            payment_mode: paymentMode || "",
            amount: Math.abs(amountValue),
            bill_amount: 0,
            refund_amount: 0
          };
          // Save to VendorCarryForwardAmountManagement
          const vendorCarryForwardResponse = await fetch("https://backendaab.in/aabuildersDash/api/vendor_carry_forward/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(vendorCarryForwardPayload)
          });
          if (!vendorCarryForwardResponse.ok) {
            throw new Error('Failed to save vendor carry forward amount management data');
          }
          const vendorCarryForwardResult = await vendorCarryForwardResponse.json();
          const vendorCarryForwardId = vendorCarryForwardResult.id || vendorCarryForwardResult.vendorCarryForwardId;
          // Now save advance portal entry with negative amount and vendor_carry_forward_id
          const advancePayload = createPayload({
            amount: -Math.abs(amountValue),
            vendor_carry_forward_id: vendorCarryForwardId
          });
          await fetch('https://backendaab.in/aabuildersDash/api/advance_portal/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(advancePayload)
          });
        } else {
          // Normal transfer logic for other sites
          const firstPayload = createPayload({ amount: -Math.abs(amountValue) });
          const secondPayload = createPayload({
            project_id: transferSiteIdInt,
            transfer_site_id: selectedSite?.id || 0,
            amount: Math.abs(amountValue)
          });
          await Promise.all([
            fetch('https://backendaab.in/aabuildersDash/api/advance_portal/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(firstPayload)
            }),
            fetch('https://backendaab.in/aabuildersDash/api/advance_portal/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(secondPayload)
            })
          ]);
        }
      } else {
        const payload = createPayload();
        await fetch('https://backendaab.in/aabuildersDash/api/advance_portal/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        // Also save to expenses form if Bill Settlement
        if (selectedType === 'Bill Settlement') {
          let vendor = '';
          let contractor = '';
          if (selectedOption?.type === 'Vendor') {
            vendor = selectedOption.label;
          } else if (selectedOption?.type === 'Contractor') {
            contractor = selectedOption.label;
          }
          const expensesPayload = {
            accountType: 'Bill Payments',
            eno: eno,
            date: dateValue,
            siteName: selectedSite ? selectedSite.label : '',
            projectId: selectedSite ? selectedSite.id : null,
            vendor: vendor,
            vendorId: selectedOption?.type === 'Vendor' ? selectedOption.id : null,
            contractor: contractor,
            contractorId: selectedOption?.type === 'Contractor' ? selectedOption.id : null,
            quantity: '',
            amount: parseInt(billAmount) || 0,
            category: selectedCategory ? selectedCategory.label : '',
            comments: description,
            machineTools: '',
            billCopyUrl: fileUrl || '',
            source: "Advance Portal",
          };
          const expensesResponse = await fetch("https://backendaab.in/aabuilderDash/expenses_form/save", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(expensesPayload),
          });
          if (!expensesResponse.ok) {
            const errorText = await expensesResponse.text();
            throw new Error(`Expenses form submission failed: ${errorText}`);
          }
          // Update ENo for next entry
          setEno(eno + 1);
        }
      }
      toast.success('Advance saved successfully!', {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      setAdvanceAmount('');
      setDescription('');
      setPaymentMode('');
      setBillAmount('');
      setSelectedAdvanceFile(null);
      setSelectedCategory(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setEntryNo(nextEntryNo);
      fetchAdvanceData();
      if (selectedOption) handleChange(selectedOption);
      if (selectedOption && selectedSite) calculateProjectAdvance(selectedOption, selectedSite);
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('Failed to save data!', {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const getWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = (now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000);
    const oneWeek = 604800000;
    return Math.floor(diff / oneWeek) + 1;
  };
  useEffect(() => {
    if (selectedOption && selectedSite) {
      calculateProjectAdvance(selectedOption, selectedSite);
    } else {
      setProjectAdvance('');
    }
  }, [selectedOption, selectedSite]);
  useEffect(() => {
    const today = new Date();
    const formatted = today.toISOString().split('T')[0];
    setDateValue(formatted);
  }, []);
  useEffect(() => {
    if (!fromDate || !toDate) {
      setFilteredAmount(0);
      return;
    }
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);
    const filtered = advanceData.filter(entry => {
      const entryDate = new Date(entry.date);
      const isInDateRange = entryDate >= from && entryDate <= to;
      const isMatchingPayment =
        !filteredPaymentMode || entry.payment_mode === filteredPaymentMode;
      return isInDateRange && isMatchingPayment;
    });
    const total = filtered.reduce((sum, entry) => {
      const amount = parseFloat(entry.amount) || 0;
      return sum + amount;
    }, 0);
    setFilteredAmount(total);
  }, [fromDate, toDate, filteredPaymentMode, advanceData]);
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTotal = advanceData
      .filter(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
      })
      .reduce((sum, entry) => {
        const amount = parseFloat(entry.amount) || 0;
        return sum + amount;
      }, 0);
    setTodayAmount(todayTotal);
  }, [advanceData]);
  // ✅ Export PDF function
  const exportPDF = () => {
    const doc = new jsPDF();
    const entityType = selectedOption?.type === "Contractor" ? "Contractor" : "Vendor";
    const entityName = selectedOption?.label || "";
    const projectName = selectedSite?.label || "";
    doc.setFontSize(12);
    doc.text(`${entityType} - ${entityName}`, 14, 20);
    const pageWidth = doc.internal.pageSize.getWidth();
    const projectText = `Project Name: ${projectName}`;
    const textWidth = doc.getTextWidth(projectText);
    doc.text(projectText, pageWidth - textWidth - 14, 20);
    // ✅ Filter data first
    const filteredData = advanceData
      .filter(entry => {
        const isMatchingVendor =
          selectedOption?.type === 'Vendor'
            ? entry.vendor_id === selectedOption.id
            : selectedOption?.type === 'Contractor'
              ? entry.contractor_id === selectedOption.id
              : false;
        const isForCurrentProject = entry.project_id === selectedSite.id;
        return isMatchingVendor && isForCurrentProject;
      })
      // ✅ Sort by type (custom order) then mode
      .sort((a, b) => {
        const typeOrder = ["Advance", "Bill Settlement", "Refund", "Transfer"];
        const typeIndexA = typeOrder.indexOf((a.type || "").trim());
        const typeIndexB = typeOrder.indexOf((b.type || "").trim());
        if (typeIndexA !== typeIndexB) return typeIndexA - typeIndexB;
        const modeA = (a.payment_mode || "").trim().toLowerCase();
        const modeB = (b.payment_mode || "").trim().toLowerCase();
        if (!modeA && modeB) return 1;
        if (modeA && !modeB) return -1;
        return modeA.localeCompare(modeB);
      });
    // ✅ Table columns (removed Contractor/Vendor and Project Name)
    const tableColumn = [
      "S.No",
      "Date",
      "Advance",
      "Bill Amount",
      "Refund Amount",
      "Transfer",
      "Type",
      "Mode",
      "Description"
    ];
    // ✅ Table rows
    const tableRows = filteredData.map((entry, index) => {
      const {
        date,
        amount,
        bill_amount,
        type,
        transfer_site_id,
        payment_mode,
        refund_amount,
        contractor_vendor,
        project_name,
        description
      } = entry;
      const advanceAmount =
        type === 'Refund' ? '' : parseFloat(amount || 0).toLocaleString('en-IN');
      const billAmount =
        type === 'Bill Settlement'
          ? parseFloat(bill_amount || 0).toLocaleString('en-IN')
          : '';
      const refundAmount =
        type === 'Refund'
          ? parseFloat(refund_amount || 0).toLocaleString('en-IN')
          : '';
      let transferText = '';
      if (type === 'Transfer') {
        const siteLabel = siteOptions.find(site => site.id === parseInt(transfer_site_id))?.label;
        transferText =
          parseFloat(amount) < 0
            ? `Transfer to ${siteLabel || 'Unknown Site'}`
            : `Transfer from ${siteLabel || 'Unknown Site'}`;
      }
      return [
        index + 1,
        new Date(date).toLocaleDateString('en-GB'),
        advanceAmount,
        billAmount,
        refundAmount,
        transferText,
        type,
        payment_mode || '',
        description || ''
      ];
    });
    // ✅ Generate PDF table
    doc.autoTable({
      startY: 28,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      styles: { halign: "left" },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        lineWidth: 0.1
      },
      columnStyles: {
        2: { halign: 'right' }, // Advance
        3: { halign: 'right' }, // Bill Amount
        4: { halign: 'right' }  // Refund Amount
      }
    });
    doc.save("Advance_Report.pdf");
  };
  // ✅ Export CSV function
  const exportCSV = () => {
    const entityType = selectedOption?.type === "Contractor" ? "Contractor" : "Vendor";
    const entityName = selectedOption?.label || "";
    const projectName = selectedSite?.label || "";
    const filteredData = advanceData.filter(entry => {
      const isMatchingVendor =
        selectedOption?.type === 'Vendor'
          ? entry.vendor_id === selectedOption.id
          : selectedOption?.type === 'Contractor'
            ? entry.contractor_id === selectedOption.id
            : false;
      const isForCurrentProject = entry.project_id === selectedSite.id;
      return isMatchingVendor && isForCurrentProject;
    });
    const rows = filteredData.map((entry, index) => {
      const { date, amount, bill_amount, type, transfer_site_id, payment_mode, refund_amount } = entry;
      const advanceAmount = (() => {
        if (type === 'Refund') {
          return `-${parseFloat(refund_amount || 0).toLocaleString('en-IN')}`;
        }
        return parseFloat(amount || 0).toLocaleString('en-IN');
      })();
      const billAmount =
        type === 'Bill Settlement'
          ? parseFloat(bill_amount || 0).toLocaleString('en-IN')
          : '';
      let transferOrRefund = '';
      if (type === 'Refund') {
        transferOrRefund = 'Refund';
      } else if (type === 'Transfer') {
        const siteLabel = siteOptions.find(site => site.id === parseInt(transfer_site_id))?.label;
        transferOrRefund =
          parseFloat(amount) < 0
            ? `Transfer to ${siteLabel || 'Unknown Site'}`
            : `Transfer from ${siteLabel || 'Unknown Site'}`;
      }
      return {
        "S.No": index + 1,
        "Date": new Date(date).toLocaleDateString('en-GB'),
        "Advance": advanceAmount,
        "Bill": billAmount,
        "Transfer/Refund": transferOrRefund,
        "Mode": payment_mode || ''
      };
    });
    let csv = `${entityType}: ${entityName},Project Name: ${projectName}\n\n`;
    csv += Object.keys(rows[0] || {}).join(",") + "\n";
    rows.forEach(row => {
      csv += Object.values(row).map(value => `"${value}"`).join(",") + "\n";
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Advance_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  useEffect(() => {
    const { totalAmount, totalRefund, totalBill } = advanceData.reduce(
      (acc, entry) => {
        acc.totalAmount += parseFloat(entry.amount) || 0;
        acc.totalRefund += parseFloat(entry.refund_amount) || 0;
        acc.totalBill += parseFloat(entry.bill_amount) || 0;
        return acc;
      },
      { totalAmount: 0, totalRefund: 0, totalBill: 0 }
    );
    const outstanding = totalAmount - totalRefund - totalBill;
    setTotalOutstanding(outstanding);
  }, [advanceData]);
  const formatNumber = (num) => {
    if (!num) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  const formatDateForReview = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const vendorOrContractorLabel = selectedOption?.label || '-';
  const formattedAdvanceAmount = advanceAmount ? formatWithCommas(advanceAmount) : '-';
  const formattedBillAmount = billAmount ? formatWithCommas(billAmount) : '-';
  const transferSiteLabel = selectedType === 'Transfer' && transferSiteId
    ? sortedSiteOptions.find(option => option.id === parseInt(transferSiteId))?.label || '-'
    : '-';
  const reviewDetails = [
    { label: 'Type', value: selectedType || '-' },
    { label: 'Date', value: formatDateForReview(dateValue) || '-' },
    { label: 'Contractor/Vendor', value: vendorOrContractorLabel },
    { label: selectedOption?.type === 'Vendor' ? 'Vendor ID' : 'Contractor ID', value: selectedOption?.id || '-' },
    { label: 'Project Name', value: selectedSite?.label || '-' },
    { label: 'Project ID', value: selectedSite?.id || '-' },
  ];
  if (selectedType === 'Bill Settlement') {
    reviewDetails.push(
      { label: 'Bill Amount', value: formattedBillAmount },
      { label: 'Category', value: selectedCategory?.label || '-' }
    );
  }
  if (selectedType === 'Transfer') {
    reviewDetails.push(
      { label: 'Transfer Amount', value: formattedAdvanceAmount },
      { label: 'Transfer To Site', value: transferSiteLabel }
    );
  } else if (selectedType === 'Refund') {
    reviewDetails.push(
      { label: 'Refund Amount', value: formattedAdvanceAmount },
      { label: 'Payment Mode', value: paymentMode || '-' }
    );
  } else if (selectedType === 'Advance') {
    reviewDetails.push(
      { label: 'Advance Amount', value: formattedAdvanceAmount },
      { label: 'Payment Mode', value: paymentMode || '-' }
    );
  } else if (selectedType === 'Bill Settlement') {
    const rawAmount = advanceAmount.toString().replace(/,/g, '').trim();
    if (rawAmount) {
      reviewDetails.push(
        { label: 'Amount Given', value: formattedAdvanceAmount },
        { label: 'Payment Mode', value: paymentMode || '-' }
      );
    }
  }
  reviewDetails.push(
    { label: 'Description', value: description || '-' },
    { label: 'File Attached', value: selectedAdvanceFile ? selectedAdvanceFile.name : 'No file attached' }
  );
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedAdvanceFile(file);
    }
    // This ensures the input is cleared even if the same file is selected again next time
    e.target.value = '';
  };
  // File preview URL effect
  useEffect(() => {
    if (!selectedAdvanceFile) {
      setFilePreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedAdvanceFile);
    setFilePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedAdvanceFile]);
  const handleChangeAttachment = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const isPdfPreview = selectedAdvanceFile?.type?.toLowerCase().includes('pdf');
  const handleEditClick = (entry) => {
    setEditingId(entry.advancePortalId);
    setEditFormData({
      date: entry.date?.split('T')[0] || '',
      amount: entry.amount || '',
      project_id: entry.project_id || '',
      vendor_id: entry.vendor_id || '',
      contractor_id: entry.contractor_id || '',
      entry_no: entry.entry_no || '',
      week_no: entry.week_no || '',
      file_url: entry.file_url || '',
      description: entry.description || '',
      bill_amount: entry.bill_amount || '',
      type: entry.type || '',
      transfer_site_id: entry.transfer_site_id || '',
      payment_mode: entry.payment_mode || '',
      refund_amount: entry.refund_amount || ''
    });
    setIsEditModalOpen(true);
  };
  const handlePaymentSubmit = async () => {
    if (!paymentModalData.accountNumber && paymentModalData.paymentMode !== "Cash") {
      alert("Please select account number.");
      return;
    }
    if (paymentModalData.paymentMode === "Cheque" && (!paymentModalData.chequeNo || !paymentModalData.chequeDate)) {
      alert("Please enter cheque number and date.");
      return;
    }
    // File upload validation for Bill Settlement
    if (selectedType === 'Bill Settlement' && !selectedAdvanceFile) {
      alert("Please attach the bill file for Bill Settlement");
      return;
    }
    // Category validation for Bill Settlement
    if (selectedType === 'Bill Settlement' && !selectedCategory) {
      alert("Please select a category for Bill Settlement");
      return;
    }
    setIsSubmitting(true);
    try {
      // Upload file if exists (for Bill Settlement)
      let fileUrl = '';
      if (selectedAdvanceFile && selectedType === 'Bill Settlement') {
        try {
          const formData = new FormData();
          const formatDateOnly = (dateString) => {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
          };
          const now = new Date();
          const timestamp = now.toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          })
            .replace(",", "")
            .replace(/\s/g, "-");
          const finalName = `${timestamp} ${selectedSite.sNo} ${selectedOption.label}`;
          formData.append('file', selectedAdvanceFile);
          formData.append('file_name', finalName);
          const uploadResponse = await fetch("https://backendaab.in/aabuilderDash/expenses/googleUploader/uploadToGoogleDrive", {
            method: "POST",
            body: formData,
          });
          if (!uploadResponse.ok) {
            throw new Error('File upload failed');
          }
          const uploadResult = await uploadResponse.json();
          fileUrl = uploadResult.url;
        } catch (error) {
          console.error('Error during file upload:', error);
          alert('Error during file upload. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }
      // Get entry number
      const res = await fetch('https://backendaab.in/aabuildersDash/api/advance_portal/getAll');
      if (!res.ok) throw new Error('Failed to fetch entry numbers');
      const allData = await res.json();
      const maxEntryNo = allData.length > 0 ? Math.max(...allData.map(item => item.entry_no || 0)) : 0;
      const nextEntryNo = maxEntryNo + 1;
      // Create advance portal payload
      const advancePayload = {
        type: selectedType,
        date: paymentModalData.date,
        vendor_id: selectedOption?.type === 'Vendor' ? selectedOption.id : 0,
        contractor_id: selectedOption?.type === 'Contractor' ? selectedOption.id : 0,
        project_id: selectedSite?.id || 0,
        transfer_site_id: selectedType === 'Transfer' ? parseInt(transferSiteId) : 0,
        payment_mode: paymentModalData.paymentMode,
        amount:
          selectedType === 'Advance' || selectedType === 'Transfer' || selectedType === 'Bill Settlement'
            ? parseFloat(paymentModalData.amount) || 0
            : 0,
        bill_amount: selectedType === 'Bill Settlement' ? parseFloat(billAmount) || 0 : 0,
        refund_amount: selectedType === 'Refund' ? parseFloat(paymentModalData.amount) || 0 : 0,
        entry_no: nextEntryNo,
        week_no: getWeekNumber(),
        description: description,
        file_url: fileUrl,
      };
      // Save to advance portal
      const advanceResponse = await fetch('https://backendaab.in/aabuildersDash/api/advance_portal/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(advancePayload)
      });
      if (!advanceResponse.ok) {
        throw new Error('Failed to save advance portal data');
      }
      const advanceResult = await advanceResponse.json();
      // Create weekly payment bills payload
      const weeklyPaymentBillPayload = {
        date: paymentModalData.date,
        created_at: new Date().toISOString(),
        contractor_id: selectedOption?.type === 'Contractor' ? selectedOption.id : null,
        vendor_id: selectedOption?.type === 'Vendor' ? selectedOption.id : null,
        employee_id: null,
        project_id: selectedSite?.id || null,
        type: selectedType,
        bill_payment_mode: paymentModalData.paymentMode,
        amount: parseFloat(paymentModalData.amount),
        status: true,
        weekly_number: "",
        weekly_payment_expense_id: null,
        advance_portal_id: advanceResult.id || advanceResult.advancePortalId,
        staff_advance_portal_id: null,
        claim_payment_id: null,
        cheque_number: paymentModalData.chequeNo || null,
        cheque_date: paymentModalData.chequeDate || null,
        transaction_number: paymentModalData.transactionNumber || null,
        account_number: paymentModalData.accountNumber || null
      };
      // Save to weekly payment bills
      const weeklyResponse = await fetch('https://backendaab.in/aabuildersDash/api/weekly-payment-bills/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weeklyPaymentBillPayload)
      });
      if (!weeklyResponse.ok) {
        throw new Error('Failed to save weekly payment bills data');
      }
      // Also save to expenses form if Bill Settlement
      if (selectedType === 'Bill Settlement') {
        let vendor = '';
        let contractor = '';
        if (selectedOption?.type === 'Vendor') {
          vendor = selectedOption.label;
        } else if (selectedOption?.type === 'Contractor') {
          contractor = selectedOption.label;
        }
        const expensesPayload = {
          accountType: 'Bill Settlement',
          eno: eno,
          date: paymentModalData.date,
          siteName: selectedSite ? selectedSite.label : '',
          projectId: selectedSite ? selectedSite.id : null,
          vendor: vendor,
          vendorId: selectedOption?.type === 'Vendor' ? selectedOption.id : null,
          contractor: contractor,
          contractorId: selectedOption?.type === 'Contractor' ? selectedOption.id : null,
          quantity: '',
          amount: parseInt(billAmount) || 0,
          category: selectedCategory ? selectedCategory.label : '',
          comments: description,
          machineTools: '',
          billCopyUrl: fileUrl || ''
        };
        const expensesResponse = await fetch("https://backendaab.in/aabuilderDash/expenses_form/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(expensesPayload),
        });
        if (!expensesResponse.ok) {
          const errorText = await expensesResponse.text();
          throw new Error(`Expenses form submission failed: ${errorText}`);
        }
        // Update ENo for next entry
        setEno(eno + 1);
      }
      toast.success('Advance saved successfully and added to Weekly Payment Bills!', {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      // Reset form
      setAdvanceAmount('');
      setDescription('');
      setPaymentMode('');
      setBillAmount('');
      setSelectedAdvanceFile(null);
      setSelectedCategory(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setEntryNo(nextEntryNo);
      setShowPaymentModal(false);
      fetchAdvanceData();
      if (selectedOption) handleChange(selectedOption);
      if (selectedOption && selectedSite) calculateProjectAdvance(selectedOption, selectedSite);
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('Failed to save data!', {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleUpdate = async () => {
    try {
      if (editFormData.type === "Transfer") {
        // Find all rows with the same entry_no
        const sameEntryRows = advanceData.filter(r => r.entry_no === editFormData.entry_no);
        if (sameEntryRows.length === 2) {
          const [record1, record2] = sameEntryRows;
          // Figure out which is being edited
          const editedRecord = sameEntryRows.find(r => r.advancePortalId === editingId);
          const otherRecord = sameEntryRows.find(r => r.advancePortalId !== editingId);
          // Ensure numeric
          const enteredAmount = parseFloat(editFormData.amount) || 0;
          // Prepare updated data
          const updatedEdited = {
            ...editFormData,
            transfer_site_id: parseInt(editFormData.transfer_site_id),
            amount: enteredAmount // positive
          };
          const updatedOther = {
            ...otherRecord,
            project_id: parseInt(editFormData.transfer_site_id), // new "to" site
            transfer_site_id: editedRecord.project_id, // old "from" site
            amount: -Math.abs(enteredAmount) // negative
          };
          // Send both PUT requests
          await Promise.all([
            fetch(`https://backendaab.in/aabuildersDash/api/advance_portal/edit/${editedRecord.advancePortalId}?editedBy=${username}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedEdited)
            }),
            fetch(`https://backendaab.in/aabuildersDash/api/advance_portal/edit/${otherRecord.advancePortalId}?editedBy=${username}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedOther)
            })
          ]);
        } else {
          console.warn('Could not find both Transfer records for entry_no:', editFormData.entry_no);
        }
      } else {
        // Normal single update
        const res = await fetch(`https://backendaab.in/aabuildersDash/api/advance_portal/edit/${editingId}?editedBy=${username}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editFormData)
        });
        if (!res.ok) throw new Error('Failed to update');
      }
      window.location.reload();
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className='bg-[#FAF6ED] pb-10'>
      <div className='overflow-hidden bg-[#FAF6ED] w-full'>
        <div className='px-4 sm:px-6 lg:px-10 overflow-hidden'>
          <div className='flex flex-col xl:flex-row gap-4 xl:gap-10 text-left '>
            <div className='bg-white w-full p-4 px-10 rounded-md text-left xl:flex  items-center pb-6 gap-[16px]'>
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
            <div className='flex flex-col sm:flex-row bg-white w-full h-auto xl:h-[128px] rounded-md p-4 gap-[16px] px-10 '>
              <div className='space-y-2'>
                <h2 className='font-semibold text-sm sm:text-base'>Today Amount</h2>
                <input
                  readOnly
                  type='text'
                  value={todayAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  className='bg-[#F2F2F2] rounded-lg p-2 w-[144px] h-[45px] focus:outline-none text-sm'
                />
              </div>
              <div className='space-y-2'>
                <h2 className='font-semibold text-sm sm:text-base'>Total Outstanding</h2>
                <input
                  readOnly
                  type='text'
                  value={totalOutstanding.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  className='bg-[#F2F2F2] p-2 rounded-lg w-[144px] h-[45px] focus:outline-none text-sm'
                />
              </div>
            </div>
          </div>
        </div>
        <div className='px-4 sm:px-6 lg:px-10 mt-4'>
          <div className='bg-white w-full max-w-[1850px] xl:h-[610px] p-4 lg:p-6 rounded-md shadow-sm'>
            <div className='xl:flex px-4 gap-10'>
              <div className='xl:flex xl:w-[1100px]'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-left'>
                  <div className='space-y-1 flex items-center max-w-[300px]'>
                    <label className='font-semibold text-[#E4572E] text-sm sm:text-base xl:w-40 w-20'>Select Type</label>
                    <Select
                      options={[
                        { value: 'Advance', label: 'Advance' },
                        { value: 'Bill Settlement', label: 'Bill Settlement' },
                        { value: 'Refund', label: 'Refund' },
                        { value: 'Transfer', label: 'Transfer' }
                      ]}
                      value={selectedType ? { value: selectedType, label: selectedType } : null}
                      onChange={(selected) => {
                        const newType = selected ? selected.value : '';
                        setSelectedType(newType);
                        setAdvanceAmount('');
                        setBillAmount('');
                      }}
                      placeholder="Select Type..."
                      isSearchable
                      isClearable
                      styles={customStyles}
                      className='w-full max-w-[330px] rounded-lg focus:outline-none'
                    />
                  </div>
                  <div className='space-y-1 flex gap-3 items-center'>
                    <label className='font-semibold text-[#E4572E] text-sm sm:text-base'>Date</label>
                    <input
                      type='date'
                      placeholder='dd-mm-yyyy'
                      value={dateValue}
                      onChange={(e) => setDateValue(e.target.value)}
                      className='w-full max-w-[330px] h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                    />
                  </div>
                  <div className='space-y-1'>
                    <label className='font-semibold block text-sm sm:text-base'>Contractor/Vendor<span className="text-red-500">*</span></label>
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
                  <div className='space-y-1'>
                    <label className='font-semibold block text-sm sm:text-base'>Overall Advance</label>
                    <input
                      value={overallAdvance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      disabled
                      className='w-full h-[45px] px-2 py-1 rounded-lg bg-[#F2F2F2] focus:outline-none text-sm'
                    />
                  </div>
                  <div className='space-y-1'>
                    <label className='font-semibold block text-sm sm:text-base'>Project Name<span className="text-red-500">*</span></label>
                    <Select
                      options={sortedSiteOptions || []}
                      placeholder="Select a site..."
                      isSearchable={true}
                      value={selectedSite}
                      onChange={handleProjectChange}
                      styles={customStyles}
                      isClearable
                      className='w-full rounded-lg focus:outline-none'
                    />
                  </div>
                  {selectedType !== 'Bill Settlement' && (
                    <div className='space-y-1'>
                      <label className='font-semibold block text-sm sm:text-base'>Project Advance</label>
                      <input
                        value={projectAdvance}
                        readOnly
                        onChange={(e) => setProjectAdvance(e.target.value)}
                        className='w-full h-[45px] px-2 py-1 rounded-lg bg-[#F2F2F2] focus:outline-none text-sm'
                      />
                    </div>
                  )}
                  {selectedType === 'Bill Settlement' && (
                    <div className='space-y-1'>
                      <label className='font-semibold block text-sm sm:text-base'>Bill Amount<span className="text-red-500">*</span></label>
                      <input
                        value={billAmount}
                        onChange={(e) => setBillAmount(e.target.value)}
                        className='w-full h-[45px] px-2 py-1 rounded-lg border-2 border-[#BF9853] border-opacity-30 focus:outline-none text-sm'
                      />
                    </div>
                  )}
                  {selectedType === 'Bill Settlement' && (
                    <div className='space-y-1'>
                      <label className='font-semibold block text-sm sm:text-base'>Category<span className="text-red-500">*</span></label>
                      <Select
                        options={categoryOptions}
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        styles={customStyles}
                        isClearable
                        isSearchable
                        placeholder="Select a category..."
                        className='w-full rounded-lg focus:outline-none'
                      />
                    </div>
                  )}
                  <div className='space-y-1'>
                    <label className='font-semibold block text-sm sm:text-base'>
                      {selectedType === 'Transfer'
                        ? 'Transfer Amount'
                        : selectedType === 'Refund'
                          ? 'Refund Amount'
                          : 'Amount Given'}<span className="text-red-500">*</span>
                    </label>
                    <input
                      value={formatWithCommas(advanceAmount)}
                      onChange={handleAmountChange}
                      className='w-full h-[45px] no-spinner border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                    />
                  </div>
                  <div className='space-y-1'>
                    {selectedType === 'Transfer' ? (
                      <>
                        <label className='font-semibold block text-sm sm:text-base'>Project Name</label>
                        <Select
                          options={sortedSiteOptions}
                          placeholder="Select a site..."
                          isSearchable
                          value={sortedSiteOptions.find(option => option.id === parseInt(transferSiteId)) || null}
                          onChange={(selected) => setTransferSiteId(selected ? selected.id : '')}
                          styles={customStyles}
                          isClearable
                          menuPortalTarget={document.body}
                          className='w-full rounded-lg focus:outline-none'
                        />
                      </>
                    ) : (
                      <>
                        <label className='font-semibold block text-sm sm:text-base'>Payment Mode</label>
                        <Select
                          options={finalPaymentModeOptions}
                          value={paymentMode ? { value: paymentMode, label: paymentMode } : null}
                          onChange={(selected) => setPaymentMode(selected ? selected.value : '')}
                          placeholder="Select"
                          isSearchable
                          isClearable
                          styles={customStyles}
                          className='w-full rounded-lg focus:outline-none'
                        />
                      </>
                    )}
                  </div>
                  <div className='col-span-1 sm:col-span-2 space-y-1'>
                    <label className='font-semibold block text-sm sm:text-base'>Description</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Type your text here..."
                      className='w-full h-[45px] border-2 border-[#BF9853] border-opacity-30 font-medium px-2 py-2 rounded-lg focus:outline-none text-sm'>
                    </textarea>
                  </div>
                  <div className=''>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2">
                      <div className='flex items-center'>
                        <label htmlFor="fileInput" className="cursor-pointer flex items-center text-orange-600 text-sm">
                          <img className='w-5 h-4 mr-1' alt='' src={Attach}></img>
                          Attach file
                        </label>
                        <input type="file" id="fileInput" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                      </div>
                      {selectedAdvanceFile && <span className="text-gray-600 text-sm">{selectedAdvanceFile.name}</span>}
                    </div>
                    <button
                      className='bg-[#c7934c] text-white w-full sm:w-[120px] h-[33px] rounded flex items-center justify-center text-sm xl:mb-0 mb-2'
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : getButtonLabel()}
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
              <div className='w-full'>
                <div className='flex flex-col sm:flex-row items-start sm:items-center justify-end mb-4 gap-4'>
                  <div className='flex items-center gap-2'>
                    <input
                      readOnly
                      value={projectAdvance}
                      className='border-2 w-[112px] p-2 border-[#E4572E] text-[#E4572E] font-bold border-opacity-10 rounded h-[33px] bg-[#F2F2F2] focus:outline-none text-xs'
                    />
                  </div>
                  <div className='flex flex-wrap gap-2 sm:gap-4'>
                    <span onClick={exportPDF} className='text-[#E4572E] font-semibold hover:underline cursor-pointer text-sm'>Export PDF</span>
                    <span onClick={exportCSV} className='text-[#007233] font-semibold hover:underline cursor-pointer text-sm'>Export XL</span>
                    <span className='text-[#BF9853] font-semibold hover:underline cursor-pointer text-sm'>Print</span>
                  </div>
                </div>
                <div className='border-l-8 border-l-[#BF9853] rounded-lg overflow-hidden w-full'>
                  <div className='overflow-x-auto max-h-[400px] overflow-y-auto thin-scrollbar w-full'>
                    <table className="w-full">
                      <thead className="bg-[#FAF6ED] text-left sticky top-0 z-10">
                        <tr>
                          <th className="px-2 sm:px-4 lg:px-6 py-2 text-xs sm:text-sm whitespace-nowrap">Date</th>
                          <th className="px-2 py-2 text-xs sm:text-sm whitespace-nowrap">Advance</th>
                          <th className="px-2 py-2 text-xs sm:text-sm whitespace-nowrap">Bill</th>
                          <th className="px-2 py-2 text-xs sm:text-sm whitespace-nowrap">Transfer/Refund</th>
                          <th className="px-2 py-2 text-xs sm:text-sm whitespace-nowrap">Mode</th>
                          <th className="px-2 py-2 text-xs sm:text-sm whitespace-nowrap">Activity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!selectedOption || !selectedSite ? (
                          <tr>
                            <td colSpan="6" className="text-center py-4 text-sm text-gray-500">
                              Please select a contractor/vendor and project to view advance records.
                            </td>
                          </tr>
                        ) : advanceData
                          .filter(entry => {
                            const isMatchingVendor =
                              selectedOption?.type === 'Vendor'
                                ? entry.vendor_id === selectedOption.id
                                : selectedOption?.type === 'Contractor'
                                  ? entry.contractor_id === selectedOption.id
                                  : false;
                            const isForCurrentProject = entry.project_id === selectedSite.id;
                            return isMatchingVendor && isForCurrentProject;
                          })
                          .sort((a, b) => {
                            // Sort by entry_no in descending order (latest entries first)
                            const entryNoA = a.entry_no || 0;
                            const entryNoB = b.entry_no || 0;
                            return entryNoB - entryNoA;
                          }).length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center py-4 text-sm text-gray-500">
                              No records found for the selected contractor/vendor and project.
                            </td>
                          </tr>
                        ) : (
                          advanceData
                            .filter(entry => {
                              const isMatchingVendor =
                                selectedOption?.type === 'Vendor'
                                  ? entry.vendor_id === selectedOption.id
                                  : selectedOption?.type === 'Contractor'
                                    ? entry.contractor_id === selectedOption.id
                                    : false;
                              const isForCurrentProject = entry.project_id === selectedSite.id;
                              return isMatchingVendor && isForCurrentProject;
                            })
                            .sort((a, b) => {
                              // Sort by entry_no in descending order (latest entries first)
                              const entryNoA = a.entry_no || 0;
                              const entryNoB = b.entry_no || 0;
                              return entryNoB - entryNoA;
                            })
                            .map((entry, index) => {
                              const {
                                date,
                                amount,
                                bill_amount,
                                type,
                                transfer_site_id,
                                payment_mode,
                                refund_amount
                              } = entry;
                              const advanceAmount = (() => {
                                if (type === 'Refund') {
                                  return `-${parseFloat(refund_amount || 0).toLocaleString('en-IN')}`;
                                }
                                return parseFloat(amount || 0).toLocaleString('en-IN');
                              })();
                              const billAmount =
                                type === 'Bill Settlement'
                                  ? parseFloat(bill_amount || 0).toLocaleString('en-IN')
                                  : '';
                              let transferOrRefund = '';
                              if (type === 'Refund') {
                                transferOrRefund = 'Refund';
                              } else if (type === 'Transfer') {
                                const relatedSiteId = transfer_site_id;
                                const siteLabel = siteOptions.find(site => site.id === parseInt(relatedSiteId))?.label;
                                transferOrRefund =
                                  parseFloat(amount) < 0
                                    ? `Transfer to ${siteLabel || 'Unknown Site'}`
                                    : `Transfer from ${siteLabel || 'Unknown Site'}`;
                              }
                              return (
                                <tr key={index} className="border-t hover:bg-gray-50">
                                  <td className="px-2 sm:px-4 lg:px-6 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap">
                                    {new Date(date).toLocaleDateString('en-GB')}
                                  </td>
                                  <td className="px-2 py-2 text-xs sm:text-sm text-right font-semibold whitespace-nowrap">
                                    {advanceAmount}
                                  </td>
                                  <td className="px-2 py-2 text-xs sm:text-sm text-right font-semibold whitespace-nowrap">
                                    {billAmount}
                                  </td>
                                  <td className="px-2 py-2 text-xs sm:text-sm text-left font-semibold break-words min-w-[120px] sm:min-w-[200px]">
                                    {transferOrRefund}
                                  </td>
                                  <td className="px-2 py-2 text-xs sm:text-sm text-left font-semibold whitespace-nowrap">
                                    {payment_mode || ''}
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap">
                                    <div className="flex items-center gap-1 sm:gap-2">
                                      <button className="rounded-full transition duration-200">
                                        <img
                                          src={edit}
                                          onClick={() => handleEditClick(entry)}
                                          alt="Edit"
                                          className="w-4 h-6 transform hover:scale-110 hover:brightness-110 transition duration-200"
                                        />
                                      </button>
                                      {entry.file_url ? (
                                        <a
                                          href={entry.file_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="cursor-pointer"
                                          title="View File"
                                        >
                                          <img
                                            src={file}
                                            className="w-5 h-4 transform hover:scale-110 transition duration-200"
                                            alt="View File"
                                            style={{ filter: 'invert(0%) brightness(0%)' }}
                                          />
                                        </a>
                                      ) : (
                                        <div className="opacity-30">
                                          <img
                                            src={file}
                                            className="w-5 h-4"
                                            alt="No File"
                                            title="No file attached"
                                            style={{ filter: 'invert(0%) brightness(0%)' }}
                                          />
                                        </div>
                                      )}
                                    </div>
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
                    <label className="block mb-2 font-semibold text-sm">Amount</label>
                    <input
                      type="number"
                      value={editFormData.amount}
                      onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                      className="border-2 border-[#BF9853] border-opacity-30 w-full h-[45px] rounded-lg no-spinner focus:outline-none text-sm"
                    />
                  </div>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4'>
                  <div>
                    <label className="block mb-2 font-semibold text-sm">Bill Amount</label>
                    <input
                      type="number"
                      value={editFormData.bill_amount}
                      onChange={(e) => setEditFormData({ ...editFormData, bill_amount: e.target.value })}
                      className="border-2 border-[#BF9853] border-opacity-30 w-full h-[45px] rounded-lg no-spinner focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-sm">Type</label>
                    <Select
                      options={[
                        { value: 'Advance', label: 'Advance' },
                        { value: 'Bill Settlement', label: 'Bill Settlement' },
                        { value: 'Refund', label: 'Refund' },
                        { value: 'Transfer', label: 'Transfer' }
                      ]}
                      value={editFormData.type ? { value: editFormData.type, label: editFormData.type } : null}
                      onChange={(selected) => setEditFormData({ ...editFormData, type: selected ? selected.value : '' })}
                      placeholder="Select Type"
                      isSearchable
                      isClearable
                      styles={customStyles}
                      className="w-full focus:outline-none"
                    />
                  </div>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4'>
                  <div>
                    <label className="block mb-2 font-semibold text-sm">Payment Mode</label>
                    <Select
                      options={finalPaymentModeOptions}
                      value={editFormData.payment_mode ? { value: editFormData.payment_mode, label: editFormData.payment_mode } : null}
                      onChange={(selected) => setEditFormData({ ...editFormData, payment_mode: selected ? selected.value : '' })}
                      placeholder="Select"
                      isSearchable
                      isClearable
                      styles={customStyles}
                      className="w-full focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-sm">Refund Amount</label>
                    <input
                      type="number"
                      value={editFormData.refund_amount}
                      onChange={(e) => setEditFormData({ ...editFormData, refund_amount: e.target.value })}
                      className="border-2 border-[#BF9853] border-opacity-30 w-full h-[45px] rounded-lg no-spinner focus:outline-none text-sm"
                    />
                  </div>
                </div>
                <div className='mb-4'>
                  <label className="block mb-2 font-semibold text-sm">Transfer Site</label>
                  <Select
                    options={sortedSiteOptions}
                    value={sortedSiteOptions.find(site => site.id === editFormData.transfer_site_id) || null}
                    onChange={(selected) => setEditFormData({ ...editFormData, transfer_site_id: selected?.id || '' })}
                    isClearable
                    isSearchable
                    styles={customStyles}
                    className="w-full focus:outline-none"
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
                          value={paymentModalData.date}
                          onChange={(e) => setPaymentModalData(prev => ({ ...prev, date: e.target.value }))}
                          readOnly
                          className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                        <input
                          type="number"
                          value={paymentModalData.amount}
                          readOnly
                          className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full text-gray-600 bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                        <input
                          type="text"
                          value={paymentModalData.paymentMode}
                          readOnly
                          className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full text-gray-600 bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  {(paymentModalData.paymentMode === "GPay" || paymentModalData.paymentMode === "PhonePe" ||
                    paymentModalData.paymentMode === "Net Banking" || paymentModalData.paymentMode === "Cheque") && (
                      <div className="border-2 border-[#BF9853] border-opacity-25 w-full rounded-lg p-4">
                        <div className="space-y-4">
                          {paymentModalData.paymentMode === "Cheque" && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cheque No<span className="text-red-500">*</span></label>
                                <input
                                  type="text"
                                  value={paymentModalData.chequeNo}
                                  onChange={(e) => setPaymentModalData(prev => ({ ...prev, chequeNo: e.target.value }))}
                                  placeholder="Enter cheque number"
                                  className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cheque Date<span className="text-red-500">*</span></label>
                                <input
                                  type="date"
                                  value={paymentModalData.chequeDate}
                                  onChange={(e) => setPaymentModalData(prev => ({ ...prev, chequeDate: e.target.value }))}
                                  className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                />
                              </div>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Number</label>
                              <input
                                type="text"
                                value={paymentModalData.transactionNumber}
                                onChange={(e) => setPaymentModalData(prev => ({ ...prev, transactionNumber: e.target.value }))}
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
                                value={paymentModalData.accountNumber ? { value: paymentModalData.accountNumber, label: paymentModalData.accountNumber } : null}
                                onChange={(selected) => setPaymentModalData(prev => ({ ...prev, accountNumber: selected ? selected.value : '' }))}
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
                  onClick={() => setShowPaymentModal(false)}
                  className="w-[100px] h-[45px] border border-[#BF9853] rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  disabled={isSubmitting}
                  className="w-[100px] h-[45px] bg-[#BF9853] text-white rounded"
                >
                  {isSubmitting ? 'Saving...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
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
                    <h4 className="text-base font-semibold text-gray-700">Advance Details</h4>
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
                              { value: 'Advance', label: 'Advance' },
                              { value: 'Bill Settlement', label: 'Bill Settlement' },
                              { value: 'Refund', label: 'Refund' },
                              { value: 'Transfer', label: 'Transfer' }
                            ]}
                            value={selectedType ? { value: selectedType, label: selectedType } : null}
                            onChange={(selected) => {
                              const newType = selected ? selected.value : '';
                              setSelectedType(newType);
                              setAdvanceAmount('');
                              setBillAmount('');
                            }}
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
                          <label className="text-sm font-semibold mb-1 block">Contractor/Vendor</label>
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
                          <label className="text-sm font-semibold mb-1 block">Project Name</label>
                          <Select
                            options={sortedSiteOptions || []}
                            placeholder="Select a site..."
                            isSearchable={true}
                            value={selectedSite}
                            onChange={handleProjectChange}
                            styles={customStyles}
                            isClearable
                            className="custom-select rounded-lg"
                          />
                        </div>
                        {selectedType === 'Bill Settlement' && (
                          <>
                            <div>
                              <label className="text-sm font-semibold mb-1 block">Bill Amount</label>
                              <input
                                value={billAmount}
                                onChange={(e) => setBillAmount(e.target.value)}
                                className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg px-3 border-opacity-20"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-semibold mb-1 block">Category</label>
                              <Select
                                options={categoryOptions}
                                value={selectedCategory}
                                onChange={setSelectedCategory}
                                styles={customStyles}
                                isClearable
                                isSearchable
                                placeholder="Select a category..."
                                className="custom-select rounded-lg"
                              />
                            </div>
                          </>
                        )}
                        {selectedType !== 'Transfer' && selectedType !== 'Bill Settlement' && (
                          <div>
                            <label className="text-sm font-semibold mb-1 block">Payment Mode</label>
                            <Select
                              options={finalPaymentModeOptions}
                              value={paymentMode ? { value: paymentMode, label: paymentMode } : null}
                              onChange={(selected) => setPaymentMode(selected ? selected.value : '')}
                              placeholder="Select"
                              isSearchable
                              isClearable
                              styles={customStyles}
                              className="custom-select rounded-lg"
                            />
                          </div>
                        )}
                        <div>
                          <label className="text-sm font-semibold mb-1 block">
                            {selectedType === 'Transfer'
                              ? 'Transfer Amount'
                              : selectedType === 'Refund'
                                ? 'Refund Amount'
                                : selectedType === 'Bill Settlement'
                                  ? 'Amount Given'
                                  : 'Amount Given'}
                          </label>
                          <input
                            value={formatWithCommas(advanceAmount)}
                            onChange={handleAmountChange}
                            className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg px-3 border-opacity-20"
                          />
                        </div>
                        {selectedType === 'Transfer' && (
                          <div>
                            <label className="text-sm font-semibold mb-1 block">Transfer To Site</label>
                            <Select
                              options={sortedSiteOptions}
                              placeholder="Select a site..."
                              isSearchable
                              value={sortedSiteOptions.find(option => option.id === parseInt(transferSiteId)) || null}
                              onChange={(selected) => setTransferSiteId(selected ? selected.id : '')}
                              styles={customStyles}
                              isClearable
                              className="custom-select rounded-lg"
                            />
                          </div>
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
                  {selectedAdvanceFile && (
                    <p className="text-xs text-gray-500 mt-2 break-words">{selectedAdvanceFile.name}</p>
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
    </div>
  )
}
export default AdvancePortal