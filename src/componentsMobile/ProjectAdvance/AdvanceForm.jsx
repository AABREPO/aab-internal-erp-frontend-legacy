import React, { useState, useEffect, useRef, useCallback } from 'react';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';
import DatePickerModal from '../PurchaseOrder/DatePickerModal';
import Attach from '../Images/Attachfile.svg';
import CloseIcon from '../Images/Close F.svg'
import { fetchUserModulePermissions } from '../utils/fetchUserModulePermissions';
import {
  fetchAdvancePortalListForMobile,
  fetchMaxEntryNoFromBranch,
  computeAdvanceTotalsFromGetAll,
} from './advancePortalApi';

/** Keeps dropdown mapping/render cheap on huge vendor/site lists. */
const MAX_SELECT_OPTIONS = 500;

const AdvanceForm = ({
  username = '',
  userRoles = [],
  paymentModeOptions = [],
  initialFromHistory = null,
  onConsumedInitialFromHistory,
  isAdvanceTabActive = true,
}) => {
  // Resolve module permissions — defer until Advance tab is active (avoid work when tab is hidden).
  const [modulePermissions, setModulePermissions] = useState([]);
  const canCreate = modulePermissions.includes('Create');

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
  const withBranchUrl = useCallback((baseUrl) => {
    const url = new URL(baseUrl);
    if (activeBranchId !== null && activeBranchId !== undefined && activeBranchId !== "") {
      url.searchParams.set("branchId", String(activeBranchId));
    }
    return url.toString();
  }, [activeBranchId]);
  useEffect(() => {
    const syncBranch = () => {
      const nextBranchId = resolveActiveBranchId();
      setActiveBranchId((prevBranchId) => (prevBranchId === nextBranchId ? prevBranchId : nextBranchId));
    };
    syncBranch();
    window.addEventListener("branchSelectionChanged", syncBranch);
    return () => window.removeEventListener("branchSelectionChanged", syncBranch);
  }, []);

  // Use paymentModeOptions from props, fallback to default if not provided
  const defaultPaymentModeOptions = [
    { value: 'Cash', label: 'Cash' },
    { value: 'GPay', label: 'GPay' },
    { value: 'PhonePe', label: 'PhonePe' },
    { value: 'Net Banking', label: 'Net Banking' },
    { value: 'Cheque', label: 'Cheque' }
  ];
  const finalPaymentModeOptions = paymentModeOptions.length > 0 ? paymentModeOptions : defaultPaymentModeOptions;

  const [selectedType, setSelectedType] = useState('Advance');
  const [selectedOption, setSelectedOption] = useState(null);
  const [combinedOptions, setCombinedOptions] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [siteOptions, setSiteOptions] = useState([]);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [dateValue, setDateValue] = useState(new Date().toISOString().split('T')[0]);
  const [projectAdvance, setProjectAdvance] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [description, setDescription] = useState('');
  const [transferSiteId, setTransferSiteId] = useState('');
  const [entryNo, setEntryNo] = useState(1);
  const [advanceData, setAdvanceData] = useState([]);
  const [overallAdvance, setOverallAdvance] = useState(0);
  const [selectedAdvanceFile, setSelectedAdvanceFile] = useState(null);
  const fileInputRef = useRef(null);
  const [billAmount, setBillAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eno, setEno] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [typeSearchQuery, setTypeSearchQuery] = useState('');
  const [showContractorVendorModal, setShowContractorVendorModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showPaymentModeModal, setShowPaymentModeModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTransferSiteModal, setShowTransferSiteModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showChequeDatePicker, setShowChequeDatePicker] = useState(false);
  const [showPaymentDetailsBottomSheet, setShowPaymentDetailsBottomSheet] = useState(false);
  const [paymentModalData, setPaymentModalData] = useState({
    date: '',
    amount: '',
    paymentMode: '',
    chequeNo: '',
    chequeDate: '',
    transactionNumber: '',
    accountNumber: ''
  });
  const [accountDetails, setAccountDetails] = useState([]);
  const [showAccountSelectModal, setShowAccountSelectModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateMatchedExpenses, setDuplicateMatchedExpenses] = useState([]);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [pendingActionAfterIgnore, setPendingActionAfterIgnore] = useState(null);

  /** First visit or branch change → reload advance list; same tab revisit → light refresh only. */
  const advanceStaggerBranchKeyRef = useRef(null);

  /** Vendor/contractor/site/category JSON can be huge — parsing blocks the main thread. Load only when user opens a picker. */
  const masterDropdownsLoadedRef = useRef(false);
  const masterDropdownsInFlightRef = useRef(null);
  const accountDetailsLoadedRef = useRef(false);
  const accountDetailsInFlightRef = useRef(null);

  useEffect(() => {
    masterDropdownsLoadedRef.current = false;
    accountDetailsLoadedRef.current = false;
  }, [activeBranchId]);

  useEffect(() => {
    if (!isAdvanceTabActive) return;
    let cancelled = false;
    const t = setTimeout(() => {
      fetchUserModulePermissions(userRoles, 'Advance Portal')
        .then((p) => {
          if (!cancelled) setModulePermissions(p);
        })
        .catch(() => {
          if (!cancelled) setModulePermissions([]);
        });
    }, 80);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [isAdvanceTabActive, userRoles]);

  const ensureMasterDropdownsLoaded = useCallback(async () => {
    if (masterDropdownsLoadedRef.current) return;
    if (masterDropdownsInFlightRef.current) {
      await masterDropdownsInFlightRef.current;
      return;
    }
    const run = (async () => {
      try {
        const vRes = await fetch('https://backendaab.in/aabuilderDash/api/vendor_Names/getAll', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!vRes.ok) throw new Error('vendor_Names');
        const vData = await vRes.json();
        const vSliced = Array.isArray(vData) ? vData.slice(0, MAX_SELECT_OPTIONS) : [];
        setVendorOptions(
          vSliced.map((item) => ({
            value: item.vendorName,
            label: item.vendorName,
            id: item.id,
            type: 'Vendor',
          }))
        );
        await new Promise((r) => setTimeout(r, 0));

        const cRes = await fetch('https://backendaab.in/aabuilderDash/api/contractor_Names/getAll', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!cRes.ok) throw new Error('contractor_Names');
        const cData = await cRes.json();
        const cSliced = Array.isArray(cData) ? cData.slice(0, MAX_SELECT_OPTIONS) : [];
        setContractorOptions(
          cSliced.map((item) => ({
            value: item.contractorName,
            label: item.contractorName,
            id: item.id,
            type: 'Contractor',
          }))
        );
        await new Promise((r) => setTimeout(r, 0));

        const predefinedSiteOptions = [
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
        try {
          const sRes = await fetch('https://backendaab.in/aabuilderDash/api/project_Names/getAll', {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          if (!sRes.ok) throw new Error('project_Names');
          const sData = await sRes.json();
          const sSliced = Array.isArray(sData) ? sData.slice(0, MAX_SELECT_OPTIONS) : [];
          const formatted = sSliced.map((item) => ({
            value: item.siteName,
            label: item.siteName,
            id: item.id,
            sNo: item.siteNo,
          }));
          setSiteOptions([...predefinedSiteOptions, ...formatted]);
        } catch {
          setSiteOptions(predefinedSiteOptions);
        }
        await new Promise((r) => setTimeout(r, 0));

        const catRes = await fetch('https://backendaab.in/aabuilderDash/api/expenses_categories/getAll', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!catRes.ok) throw new Error('categories');
        const catData = await catRes.json();
        const catSliced = Array.isArray(catData) ? catData.slice(0, MAX_SELECT_OPTIONS) : [];
        setCategoryOptions(
          catSliced.map((item) => ({
            id: item.id,
            value: item.category,
            label: item.category,
          }))
        );
        masterDropdownsLoadedRef.current = true;
      } catch (error) {
        console.error('Master dropdown load error:', error);
      }
    })();
    masterDropdownsInFlightRef.current = run;
    try {
      await run;
    } finally {
      masterDropdownsInFlightRef.current = null;
    }
  }, []);

  const ensureAccountDetailsLoaded = useCallback(async () => {
    if (accountDetailsLoadedRef.current) return;
    if (accountDetailsInFlightRef.current) {
      await accountDetailsInFlightRef.current;
      return;
    }
    const run = (async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/account-details/getAll', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('account-details');
        const data = await response.json();
        const sliced = Array.isArray(data) ? data.slice(0, MAX_SELECT_OPTIONS) : [];
        setAccountDetails(sliced);
        accountDetailsLoadedRef.current = true;
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    })();
    accountDetailsInFlightRef.current = run;
    try {
      await run;
    } finally {
      accountDetailsInFlightRef.current = null;
    }
  }, []);

  // Format date helper
  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  // Session storage management
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

  // Latest expense E.No — only needed for Bill Settlement → expenses_form/save (get_form is huge; do not load on tab open)
  const fetchLatestEno = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuilderDash/expenses_form/get_form');
      if (!response.ok) {
        throw new Error('Failed to fetch ENo');
      }
      const data = await response.json();
      await new Promise((r) => setTimeout(r, 0));
      if (Array.isArray(data) && data.length > 0) {
        let m = 0;
        for (let i = 0; i < data.length; i++) {
          const n = Number(data[i]?.eno ?? 0);
          if (n > m) m = n;
          if (i > 0 && i % 2000 === 0) await new Promise((r) => setTimeout(r, 0));
        }
        setEno(m + 1);
      } else {
        setEno(54173);
      }
    } catch (error) {
      console.error('Error fetching latest ENo:', error);
    }
  };

  useEffect(() => {
    if (selectedType !== 'Bill Settlement') return;
    if (eno != null) return;
    const t = setTimeout(() => {
      fetchLatestEno();
    }, 0);
    return () => clearTimeout(t);
  }, [selectedType, eno]);

  // Fetch advance data — paged / getLast150 only (not getAll)
  const fetchAdvanceData = async () => {
    try {
      const rows = await fetchAdvancePortalListForMobile(withBranchUrl);
      setAdvanceData(rows);
      const maxEntryNo = await fetchMaxEntryNoFromBranch(withBranchUrl);
      setEntryNo(maxEntryNo + 1);
    } catch (error) {
      console.error('Error fetching advance portal data:', error);
    }
  };

  // Advance tab: only load paged advance rows (small JSON). Vendor/project/category lists load on first picker open.
  useEffect(() => {
    if (!isAdvanceTabActive) return;
    advanceStaggerBranchKeyRef.current = String(activeBranchId ?? 'null');
    let cancelled = false;
    const t = setTimeout(() => {
      if (!cancelled) fetchAdvanceData();
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [isAdvanceTabActive, activeBranchId]);

  // Apply initialFromHistory when user navigated from History – only set selection; use existing advanceData load
  useEffect(() => {
    if (!initialFromHistory || !onConsumedInitialFromHistory) return;
    const { selectedOption, selectedSite } = initialFromHistory;
    if (selectedOption) setSelectedOption(selectedOption);
    if (selectedSite) setSelectedSite(selectedSite);
    onConsumedInitialFromHistory();
  }, [initialFromHistory, onConsumedInitialFromHistory]);

  // Vendor overall + project advance: match desktop AdvancePortal.js (full getAll), not paged advanceData.
  const refreshTotalsFromServer = useCallback(async () => {
    if (!selectedOption) {
      setOverallAdvance(0);
      setProjectAdvance('');
      return;
    }
    try {
      const { overall, projectAmount } = await computeAdvanceTotalsFromGetAll(
        withBranchUrl,
        selectedOption,
        selectedSite || null
      );
      setOverallAdvance(overall);
      if (projectAmount !== null) {
        setProjectAdvance(projectAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 }));
      } else {
        setProjectAdvance('');
      }
    } catch (error) {
      console.error('Error fetching advance totals:', error);
      setOverallAdvance(0);
      setProjectAdvance('');
    }
  }, [withBranchUrl, selectedOption, selectedSite]);

  useEffect(() => {
    void refreshTotalsFromServer();
  }, [refreshTotalsFromServer]);

  // Combine vendor and contractor options
  useEffect(() => {
    setCombinedOptions([...vendorOptions, ...contractorOptions]);
  }, [vendorOptions, contractorOptions]);

  // Handle contractor/vendor change — totals refresh via refreshTotalsFromServer (getAll parity with desktop).
  const handleChange = async (selected) => {
    setSelectedOption(selected);
    if (selected) {
      localStorage.setItem("advanceContractorVendor", JSON.stringify(selected));
    } else {
      localStorage.removeItem("advanceContractorVendor");
    }
  };

  // Format with commas
  const formatWithCommas = (value) => {
    if (value === '' || value === null || value === undefined) return "";
    const numericValue = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(numericValue)) {
      return value.toString();
    }
    return numericValue.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  };

  // Handle amount change
  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (!isNaN(rawValue)) {
      setAdvanceAmount(rawValue);
    }
  };

  // Get week number
  const getWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = (now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000);
    const oneWeek = 604800000;
    return Math.floor(diff / oneWeek) + 1;
  };

  // Validate form fields
  const validateFormFields = () => {
    if (selectedType === 'Advance' || selectedType === 'Refund') {
      if (!selectedOption || !selectedSite || !advanceAmount || !paymentMode) {
        alert("Please fill Necessary details");
        return false;
      }
    } else if (selectedType === 'Bill Settlement') {
      if (!selectedOption || !selectedSite || !billAmount || !selectedCategory) {
        alert("Please fill Necessary details");
        return false;
      }
      if (!selectedAdvanceFile) {
        alert("Please attach the bill file for Bill Settlement");
        return false;
      }
      const rawAmount = advanceAmount.toString().replace(/,/g, '').trim();
      if (rawAmount && !paymentMode) {
        alert("Please select Payment Mode if you enter Amount Given");
        return false;
      }
    } else if (selectedType === 'Transfer') {
      if (!selectedOption || !selectedSite || !advanceAmount || !transferSiteId) {
        alert("Please fill Necessary details");
        return false;
      }
    } else {
      alert("Please select a valid type");
      return false;
    }
    const rawAmount = advanceAmount.toString().replace(/,/g, '').trim();
    if ((selectedType === 'Advance' || selectedType === 'Refund' || selectedType === 'Transfer') && !rawAmount) {
      alert("Please fill the Amount Given");
      return false;
    }
    if (selectedType === 'Bill Settlement') {
      const rawBillAmount = billAmount.toString().trim();
      if (!rawBillAmount) {
        alert("Please fill the Bill Amount");
        return false;
      }
    }
    return true;
  };

  // Check for duplicate expense entries (same date, vendor/contractor, project, amount)
  const checkForDuplicateEntry = async (checkDate, checkAmount) => {
    const vendorLabel = selectedOption?.type === 'Vendor' ? selectedOption.label : '';
    const contractorLabel = selectedOption?.type === 'Contractor' ? selectedOption.label : '';
    const siteLabel = selectedSite ? selectedSite.label : '';
    const dateStr = checkDate ? new Date(checkDate).toISOString().split('T')[0] : '';

    try {
      const response = await fetch(withBranchUrl('https://backendaab.in/aabuilderDash/expenses_form/get_form'));
      if (!response.ok) return [];
      const allExpenses = await response.json();

      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const matching = allExpenses.filter((exp) => {
        const expDate = new Date(exp.timestamp || exp.date).toISOString().split('T')[0];
        const expAmount = Math.abs(parseFloat(exp.amount) || 0);
        const dateMatch = expDate === dateStr;
        const amountMatch = Math.abs(expAmount - (checkAmount || 0)) < 0.01;
        const projectMatch = (exp.siteName === siteLabel) || (exp.projectId && selectedSite && Number(exp.projectId) === Number(selectedSite.id));
        let vendorContractorMatch = false;
        if (vendorLabel) vendorContractorMatch = (exp.vendor || '') === vendorLabel;
        else if (contractorLabel) vendorContractorMatch = (exp.contractor || '') === contractorLabel;
        const isWithinLastMonth = new Date(exp.timestamp || exp.date) >= oneMonthAgo;
        return dateMatch && amountMatch && projectMatch && vendorContractorMatch && isWithinLastMonth;
      });

      return matching;
    } catch (err) {
      console.error('Error checking duplicate:', err);
      return [];
    }
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${day}/${month}/${year} ${hour12}:${minutes} ${ampm}`;
  };

  // Submit advance data
  const submitAdvanceData = async () => {
    setIsSubmitting(true);
    if (!canCreate) {
      alert("You don't have permission to create new Advance entries.");
      setIsSubmitting(false);
      return;
    }
    try {
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
      const maxEntryNo = await fetchMaxEntryNoFromBranch(withBranchUrl);
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
        branch_id: activeBranchId,
        ...overrides
      });
      if (selectedType === 'Transfer') {
        const amountValue = parseFloat(advanceAmount) || 0;
        const transferSiteIdInt = parseInt(transferSiteId);
        if (transferSiteIdInt === 11) {
          const loanPayload = {
            type: "Transfer",
            date: dateValue,
            amount: Math.abs(amountValue),
            loan_payment_mode: "",
            loan_refund_amount: 0,
            from_purpose_id: 1,
            transfer_Project_id: 0,
            to_purpose_id: 0,
            vendor_id: selectedOption?.type === "Vendor" ? selectedOption.id : 0,
            contractor_id: selectedOption?.type === "Contractor" ? selectedOption.id : 0,
            employee_id: 0,
            labour_id: 0,
            project_id: 0,
            description: "Transfer from Advance Portal",
            file_url: "",
            branch_id: activeBranchId
          };
          const loanResponse = await fetch(withBranchUrl("https://backendaab.in/aabuildersDash/api/loans/save"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loanPayload)
          });
          if (!loanResponse.ok) {
            throw new Error('Failed to save loan portal data');
          }
          const loanResult = await loanResponse.json();
          const loanPortalId = loanResult.id || loanResult.loanPortalId;
          const advancePayload = createPayload({
            amount: -Math.abs(amountValue),
            loan_portal_id: loanPortalId
          });
          await fetch(withBranchUrl('https://backendaab.in/aabuildersDash/api/advance_portal/save'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(advancePayload)
          });
        } else if (transferSiteIdInt === 12 && selectedOption?.type === 'Vendor') {
          const vendorCarryForwardPayload = {
            type: "Transfer",
            date: dateValue,
            vendor_id: selectedOption.id,
            payment_mode: paymentMode || "",
            amount: Math.abs(amountValue),
            bill_amount: 0,
            refund_amount: 0
          };
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
          const advancePayload = createPayload({
            amount: -Math.abs(amountValue),
            vendor_carry_forward_id: vendorCarryForwardId
          });
          await fetch(withBranchUrl('https://backendaab.in/aabuildersDash/api/advance_portal/save'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(advancePayload)
          });
        } else {
          const firstPayload = createPayload({ amount: -Math.abs(amountValue) });
          const secondPayload = createPayload({
            project_id: transferSiteIdInt,
            transfer_site_id: selectedSite?.id || 0,
            amount: Math.abs(amountValue)
          });
          await Promise.all([
            fetch(withBranchUrl('https://backendaab.in/aabuildersDash/api/advance_portal/save'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(firstPayload)
            }),
            fetch(withBranchUrl('https://backendaab.in/aabuildersDash/api/advance_portal/save'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(secondPayload)
            })
          ]);
        }
      } else {
        const payload = createPayload();
        await fetch(withBranchUrl('https://backendaab.in/aabuildersDash/api/advance_portal/save'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
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
            branchId: activeBranchId,
          };
          const expensesResponse = await fetch(withBranchUrl("https://backendaab.in/aabuilderDash/expenses_form/save"), {
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
          setEno(eno + 1);
        }
      }
      alert('Advance saved successfully!');
      window.dispatchEvent(new CustomEvent('advanceUpdated'));
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
      await fetchAdvanceData();
      await refreshTotalsFromServer();
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('Failed to save data!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if payment mode requires Payment Details bottom sheet (netbanking, online UPI, cheque)
  const requiresPaymentDetailsSheet = () => {
    if (!paymentMode) return false;
    if (paymentMode === 'Cash' || paymentMode === 'Direct') return false;
    return ['GPay', 'PhonePe', 'Net Banking', 'Cheque'].includes(paymentMode);
  };

  const proceedWithPayAdvance = async () => {
    if (requiresPaymentDetailsSheet()) {
      await ensureAccountDetailsLoaded();
      setPaymentModalData({
        date: dateValue,
        amount: advanceAmount.toString().replace(/,/g, '') || '',
        paymentMode: paymentMode,
        chequeNo: '',
        chequeDate: '',
        transactionNumber: '',
        accountNumber: ''
      });
      setShowPaymentDetailsBottomSheet(true);
    } else {
      const confirmed = window.confirm('Are you sure you want to submit?');
      if (confirmed) {
        submitAdvanceData();
      }
    }
  };

  // Handle pay advance: open Payment Details bottom sheet for GPay/PhonePe/Net Banking/Cheque, else submit directly
  const handlePayAdvance = async () => {
    if (!validateFormFields()) return;

    // Duplicate check for Advance and Bill Settlement (they create expense entries)
    if (selectedType === 'Advance' || selectedType === 'Bill Settlement') {
      const checkAmount = selectedType === 'Bill Settlement' ? (parseFloat(billAmount) || 0) : (parseFloat(advanceAmount.toString().replace(/,/g, '')) || 0);
      setCheckingDuplicate(true);
      try {
        const duplicates = await checkForDuplicateEntry(dateValue, checkAmount);
        if (duplicates && duplicates.length > 0) {
          setDuplicateMatchedExpenses(duplicates);
          setPendingActionAfterIgnore('payAdvance');
          setShowDuplicateModal(true);
          setCheckingDuplicate(false);
          return;
        }
      } catch (err) {
        console.error('Duplicate check failed:', err);
      }
      setCheckingDuplicate(false);
    }

    void proceedWithPayAdvance();
  };

  const handleDuplicateIgnore = () => {
    setShowDuplicateModal(false);
    setDuplicateMatchedExpenses([]);
    if (pendingActionAfterIgnore === 'payAdvance') {
      setPendingActionAfterIgnore(null);
      void proceedWithPayAdvance();
    } else if (pendingActionAfterIgnore === 'paymentDetailsSubmit') {
      setPendingActionAfterIgnore(null);
      handlePaymentDetailsSubmit(true);
    }
  };

  const handleDuplicateCancel = () => {
    setShowDuplicateModal(false);
    setDuplicateMatchedExpenses([]);
    setPendingActionAfterIgnore(null);
  };

  // Submit from Payment Details bottom sheet: save advance_portal then weekly-payment-bills (same as AdvancePortal.js)
  const handlePaymentDetailsSubmit = async (skipDuplicateCheck = false) => {
    if (!paymentModalData.accountNumber) {
      alert('Please select account number.');
      return;
    }
    if (paymentModalData.paymentMode === 'Cheque' && (!paymentModalData.chequeNo || !paymentModalData.chequeDate)) {
      alert('Please enter cheque number and date.');
      return;
    }
    if (selectedType === 'Bill Settlement' && !selectedAdvanceFile) {
      alert('Please attach the bill file for Bill Settlement');
      return;
    }
    if (selectedType === 'Bill Settlement' && !selectedCategory) {
      alert('Please select a category for Bill Settlement');
      return;
    }

    if (!skipDuplicateCheck && (selectedType === 'Advance' || selectedType === 'Bill Settlement')) {
      const checkAmount = selectedType === 'Bill Settlement' ? (parseFloat(billAmount) || 0) : (parseFloat(paymentModalData.amount) || 0);
      setCheckingDuplicate(true);
      try {
        const duplicates = await checkForDuplicateEntry(paymentModalData.date, checkAmount);
        if (duplicates && duplicates.length > 0) {
          setDuplicateMatchedExpenses(duplicates);
          setPendingActionAfterIgnore('paymentDetailsSubmit');
          setShowDuplicateModal(true);
          setCheckingDuplicate(false);
          return;
        }
      } catch (err) {
        console.error('Duplicate check failed:', err);
      }
      setCheckingDuplicate(false);
    }

    setIsSubmitting(true);
    try {
      let fileUrl = '';
      if (selectedAdvanceFile && selectedType === 'Bill Settlement') {
        const formData = new FormData();
        const formatDateOnly = (dateString) => {
          const date = new Date(dateString);
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        };
        const finalName = `${formatDateOnly(paymentModalData.date)} ${selectedSite.sNo} ${selectedOption.label}`;
        formData.append('file', selectedAdvanceFile);
        formData.append('file_name', finalName);
        const uploadResponse = await fetch("https://backendaab.in/aabuilderDash/expenses/googleUploader/uploadToGoogleDrive", {
          method: "POST",
          body: formData,
        });
        if (!uploadResponse.ok) throw new Error('File upload failed');
        const uploadResult = await uploadResponse.json();
        fileUrl = uploadResult.url;
      }
      const maxEntryNo = await fetchMaxEntryNoFromBranch(withBranchUrl);
      const nextEntryNo = maxEntryNo + 1;
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
        branch_id: activeBranchId,
      };
      const advanceResponse = await fetch(withBranchUrl('https://backendaab.in/aabuildersDash/api/advance_portal/save'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(advancePayload)
      });
      if (!advanceResponse.ok) throw new Error('Failed to save advance portal data');
      const advanceResult = await advanceResponse.json();
      const advancePortalId = advanceResult.id ?? advanceResult.advancePortalId;

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
        advance_portal_id: advancePortalId,
        staff_advance_portal_id: null,
        claim_payment_id: null,
        cheque_number: paymentModalData.paymentMode === 'Cheque' ? paymentModalData.chequeNo : null,
        cheque_date: paymentModalData.paymentMode === 'Cheque' ? paymentModalData.chequeDate : null,
        transaction_number: paymentModalData.transactionNumber || null,
        account_number: paymentModalData.accountNumber || null,
        branch_id: activeBranchId
      };
      const weeklyResponse = await fetch(withBranchUrl('https://backendaab.in/aabuildersDash/api/weekly-payment-bills/save'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weeklyPaymentBillPayload)
      });
      if (!weeklyResponse.ok) throw new Error('Failed to save weekly payment bills data');

      if (selectedType === 'Bill Settlement') {
        let vendor = '';
        let contractor = '';
        if (selectedOption?.type === 'Vendor') vendor = selectedOption.label;
        else if (selectedOption?.type === 'Contractor') contractor = selectedOption.label;
        const expensesPayload = {
          accountType: 'Bill Payments',
          eno: eno,
          date: paymentModalData.date,
          siteName: selectedSite ? selectedSite.label : '',
          projectId: selectedSite ? selectedSite.id : null,
          vendor,
          vendorId: selectedOption?.type === 'Vendor' ? selectedOption.id : null,
          contractor,
          contractorId: selectedOption?.type === 'Contractor' ? selectedOption.id : null,
          quantity: '',
          amount: parseInt(billAmount) || 0,
          category: selectedCategory ? selectedCategory.label : '',
          comments: description,
          machineTools: '',
          billCopyUrl: fileUrl || '',
          source: "Advance Portal",
          branchId: activeBranchId,
        };
        const expensesResponse = await fetch(withBranchUrl("https://backendaab.in/aabuilderDash/expenses_form/save"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(expensesPayload),
        });
        if (!expensesResponse.ok) {
          const errorText = await expensesResponse.text();
          throw new Error(`Expenses form submission failed: ${errorText}`);
        }
        setEno(eno + 1);
      }

      alert('Advance saved successfully and added to Weekly Payment Bills!');
      window.dispatchEvent(new CustomEvent('advanceUpdated'));
      setAdvanceAmount('');
      setDescription('');
      setPaymentMode('');
      setBillAmount('');
      setSelectedAdvanceFile(null);
      setSelectedCategory(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setEntryNo(nextEntryNo);
      setShowPaymentDetailsBottomSheet(false);
      setPaymentModalData({ date: '', amount: '', paymentMode: '', chequeNo: '', chequeDate: '', transactionNumber: '', accountNumber: '' });
      await fetchAdvanceData();
      await refreshTotalsFromServer();
    } catch (error) {
      console.error('Error submitting payment details:', error);
      alert(error?.message || 'Failed to save data!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file attach (same as AdvancePortal handleFileChange)
  const handleFileAttach = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedAdvanceFile(file);
    }
    e.target.value = ''; // Allow re-selecting the same file
  };

  // Get button label
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

  // Check if all required fields are filled (except description)
  const areAllRequiredFieldsFilled = () => {
    if (!selectedType) return false;

    if (selectedType === 'Advance' || selectedType === 'Refund') {
      return !!(selectedOption && selectedSite && advanceAmount && paymentMode);
    } else if (selectedType === 'Bill Settlement') {
      const hasBillAmount = billAmount && billAmount.toString().trim() !== '';
      const hasCategory = selectedCategory !== null;
      const hasFile = selectedAdvanceFile !== null;
      const rawAmount = advanceAmount ? advanceAmount.toString().replace(/,/g, '').trim() : '';
      // If advanceAmount is filled, paymentMode is required
      const paymentModeValid = !rawAmount || paymentMode;
      return !!(selectedOption && selectedSite && hasBillAmount && hasCategory && hasFile && paymentModeValid);
    } else if (selectedType === 'Transfer') {
      return !!(selectedOption && selectedSite && advanceAmount && transferSiteId);
    }
    return false;
  };

  // Format date for display (DD/MM/YYYY)
  const formattedDate = dateValue ? new Date(dateValue).toLocaleDateString('en-GB') : getTodayDate();

  // Convert DD/MM/YYYY to YYYY-MM-DD for dateValue state
  const convertToDateValue = (ddmmyyyy) => {
    const parts = ddmmyyyy.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    return dateValue; // Return current dateValue if conversion fails
  };

  // Handle date confirmation from DatePickerModal
  const handleDateConfirm = (dateString) => {
    // dateString is in DD/MM/YYYY format from DatePickerModal
    const convertedDate = convertToDateValue(dateString);
    setDateValue(convertedDate);
  };

  // Handle cheque date confirmation from DatePickerModal (Payment Details bottom sheet)
  const handleChequeDateConfirm = (dateString) => {
    const convertedDate = convertToDateValue(dateString);
    setPaymentModalData(prev => ({ ...prev, chequeDate: convertedDate }));
    setShowChequeDatePicker(false);
  };

  return (
    <div
      className="flex flex-col flex-1 min-h-0 overflow-hidden w-full"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {/* Form section - no scroll */}
      <div className="flex-shrink-0">
        {/* Advance Number and Date */}
        <div className="mb-[8px] items-center border-b border-gray-200 pb-[6px] pt-[8px] flex justify-between">
          <div className="flex items-center gap-[8px]">
            <button
              type="button"
              className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:underline p-0 border-0 bg-transparent"
            >
              # {entryNo}
            </button>
            <button
              type="button"
              onClick={() => setShowDatePicker(true)}
              className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:underline p-0 border-0 bg-transparent"
            >
              {formattedDate}
            </button>
          </div>
          <div>
            <button
              type="button"
              onClick={() => setShowTypeModal(true)}
              className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:underline p-0 border-0 bg-transparent"
            >
              {selectedType || 'Select Type'}
            </button>
          </div>
        </div>
        <div className="space-y-[6px]">
          {/* Contractor/Vendor Field */}
          <div className="">
            <p className="flex justify-between items-center text-[12px] font-semibold text-black leading-normal mb-0.5">
              <span>Contractor/Vendor<span className="text-[#eb2f8e]">*</span></span>
              <span className="text-[12px] font-medium text-[#9E9E9E]">{formatWithCommas(overallAdvance)}</span>
            </p>
            <div className="relative">
              <div
                onClick={() => {
                  void (async () => {
                    await ensureMasterDropdownsLoaded();
                    setShowContractorVendorModal(true);
                  })();
                }}
                className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
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
                      setOverallAdvance(0);
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
          {/* Project Name Field */}
          <div className="">
            <p className="text-[12px] flex justify-between items-center font-semibold text-black leading-normal mb-0.5">
              <span>{selectedType === 'Transfer' ? 'From Project' : 'Project Name'}<span className="text-[#eb2f8e]">*</span></span>
              <span className="text-[12px] font-medium text-[#9E9E9E]">{projectAdvance || '0.00'}</span>
            </p>
            <div className="relative">
              <div
                onClick={() => {
                  void (async () => {
                    await ensureMasterDropdownsLoaded();
                    setShowProjectModal(true);
                  })();
                }}
                className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                style={{
                  boxSizing: 'border-box',
                  color: selectedSite ? '#000' : '#9E9E9E'
                }}
              >
                {selectedSite ? selectedSite.label : 'Select'}
                {selectedSite ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSite(null);
                      setProjectAdvance('');
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
          {/* Bill Amount Field - Only for Bill Settlement */}
          {selectedType === 'Bill Settlement' && (
            <div className="">
              <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                Bill Amount<span className="text-[#eb2f8e]">*</span>
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={formatWithCommas(billAmount)}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/,/g, "");
                    if (!isNaN(rawValue)) {
                      setBillAmount(rawValue);
                    }
                  }}
                  className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[12px] text-[12px] font-medium bg-white focus:outline-none"
                  style={{
                    boxSizing: 'border-box',
                    color: billAmount ? '#000' : '#9E9E9E'
                  }}
                  placeholder="Enter bill amount"
                />
              </div>
            </div>
          )}
          {/* Category Field - Only for Bill Settlement */}
          {selectedType === 'Bill Settlement' && (
            <div className="">
              <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                Category<span className="text-[#eb2f8e]">*</span>
              </p>
              <div className="relative">
                <div
                  onClick={() => {
                    void (async () => {
                      await ensureMasterDropdownsLoaded();
                      setShowCategoryModal(true);
                    })();
                  }}
                  className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                  style={{
                    boxSizing: 'border-box',
                    color: selectedCategory ? '#000' : '#9E9E9E'
                  }}
                >
                  {selectedCategory ? selectedCategory.label : 'Select'}
                  {selectedCategory ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategory(null);
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
          {/* Amount Given Field */}
          {selectedType === 'Transfer' ? (
            <>
              {/* To Project Field - Full Width */}
              <div className="">
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                  To Project<span className="text-[#eb2f8e]">*</span>
                </p>
                <div className="relative">
                  <div
                    onClick={() => {
                      void (async () => {
                        await ensureMasterDropdownsLoaded();
                        setShowTransferSiteModal(true);
                      })();
                    }}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                    style={{
                      boxSizing: 'border-box',
                      color: transferSiteId ? '#000' : '#9E9E9E'
                    }}
                  >
                    {transferSiteId ? (siteOptions.find(opt => opt.id === parseInt(transferSiteId))?.label || 'Select') : 'Select'}
                    {transferSiteId ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTransferSiteId('');
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
              {/* Transfer Amount Field - Full Width */}
              <div className="">
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                  Transfer Amount<span className="text-[#eb2f8e]">*</span>
                </p>
                <div className="relative">
                  <input
                    type="text"
                    value={formatWithCommas(advanceAmount)}
                    onChange={handleAmountChange}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[12px] text-[12px] font-medium bg-white focus:outline-none"
                    style={{
                      boxSizing: 'border-box',
                      color: advanceAmount ? '#000' : '#9E9E9E'
                    }}
                    placeholder="Enter amount"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex gap-[10px] items-center">
              <div className="">
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                  {selectedType === 'Refund' ? 'Refund Amount' : 'Amount Given'}<span className="text-[#eb2f8e]">*</span>
                </p>
                <div className="relative">
                  <input
                    type="text"
                    value={formatWithCommas(advanceAmount)}
                    onChange={handleAmountChange}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[12px] text-[12px] font-medium bg-white focus:outline-none"
                    style={{
                      boxSizing: 'border-box',
                      color: advanceAmount ? '#000' : '#9E9E9E'
                    }}
                    placeholder="Enter amount"
                  />
                </div>
              </div>
              {/* Payment Mode Field */}
              <div className="flex-1">
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                  Payment Mode<span className="text-[#eb2f8e]">*</span>
                </p>
                <div className="relative">
                  <div
                    onClick={() => setShowPaymentModeModal(true)}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
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
          )}
          {/* Description Field */}
          <div className="">
            <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
              Description
            </p>
            <textarea
              className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[12px] pt-[4px] items-center text-[12px] font-medium bg-white focus:outline-none"
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
        {/* Attach File - same pattern as AdvancePortal: label wraps clickable area */}
        <div className="flex flex-wrap items-center gap-x-[8px] mb-1 gap-y-[4px] w-full max-w-[328px]">
          <input
            type="file"
            id="fileInput"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileAttach}
            accept="image/*,.pdf,.doc,.docx"
          />
          <label
            htmlFor="fileInput"
            className="cursor-pointer flex items-center gap-[2px] text-orange-600 hover:text-orange-700 active:opacity-80 flex-shrink-0"
          >
            <img className='w-4 h-3' alt='#' src={Attach}></img>
            <span className="text-[12px] font-medium underline">Attach File</span>
          </label>
          {selectedAdvanceFile && (
            <span className="text-[11px] font-medium text-[#666] break-words min-w-0 flex-1">
              {selectedAdvanceFile.name}
            </span>
          )}
        </div>
        {/* Pay Advance Button */}
        <button
          onClick={handlePayAdvance}
          disabled={isSubmitting || checkingDuplicate || !areAllRequiredFieldsFilled()}
          className={`w-full h-[40px] font-semibold rounded text-[14px] leading-normal ${areAllRequiredFieldsFilled() && !isSubmitting && !checkingDuplicate
            ? 'bg-black text-white'
            : 'bg-[#D9D9D9] text-black'
            }`}
        >
          {checkingDuplicate ? 'Checking...' : isSubmitting ? 'Submitting...' : getButtonLabel()}
        </button>
      </div>

      {/* Advance Records - only this section scrolls */}
      <div className="mt-3 w-full flex-1 min-h-0 flex flex-col">
        {!selectedOption || !selectedSite ? (
          <div className="bg-white border border-[#E0E0E0] rounded-[8px] px-[16px] py-[24px] text-center">
            <p className="text-[12px] font-medium text-[#9E9E9E]">
              Please select a contractor/vendor and project to view advance records.
            </p>
          </div>
        ) : (() => {
          const vid = selectedOption?.id != null ? Number(selectedOption.id) : null;
          const pid = selectedSite?.id != null ? Number(selectedSite.id) : null;
          const filteredEntries = advanceData
            .filter(entry => {
              const isMatchingVendor =
                selectedOption?.type === 'Vendor'
                  ? Number(entry.vendor_id) === vid
                  : selectedOption?.type === 'Contractor'
                    ? Number(entry.contractor_id) === vid
                    : false;
              const isForCurrentProject = Number(entry.project_id) === pid;
              return isMatchingVendor && isForCurrentProject;
            })
            .sort((a, b) => {
              const entryNoA = a.entry_no || 0;
              const entryNoB = b.entry_no || 0;
              return entryNoB - entryNoA;
            });
          if (filteredEntries.length === 0) {
            return (
              <div className="bg-white border border-[#E0E0E0] rounded-[8px] px-[16px] py-[24px] text-center">
                <p className="text-[12px] font-medium text-[#9E9E9E]">
                  No records found for the selected contractor/vendor and project.
                </p>
              </div>
            );
          }
          return (
            <div
              className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {filteredEntries.map((entry, index) => {
                const {
                  date,
                  amount,
                  bill_amount,
                  type,
                  transfer_site_id,
                  payment_mode,
                  refund_amount,
                  entry_no
                } = entry;

                // Get type code
                const getTypeCode = (type) => {
                  switch (type) {
                    case 'Refund': return 'RF';
                    case 'Transfer': return 'TF';
                    case 'Bill Settlement': return 'BS';
                    case 'Advance': return 'AD';
                    default: return '';
                  }
                };

                // Format date as DD/MM/YYYY
                const formatDate = (dateString) => {
                  const date = new Date(dateString);
                  const day = String(date.getDate()).padStart(2, '0');
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const year = date.getFullYear();
                  return `${day}/${month}/${year}`;
                };

                const typeCode = getTypeCode(type);
                const formattedDate = formatDate(date);
                const transactionId = `${typeCode} - ${formattedDate} - ${entry_no || ''}`;

                // Get transfer site label for Transfer type
                const transferSiteLabel = type === 'Transfer' && transfer_site_id
                  ? siteOptions.find(site => site.id === parseInt(transfer_site_id))?.label || transfer_site_id
                  : null;

                return (
                  <div
                    key={entry.advancePortalId || index}
                    className="bg-white border border-[#E0E0E0] border-opacity-30 rounded-[8px] px-[12px] py-[8px] shadow-lg flex justify-between items-start gap-[8px]"
                  >
                    {/* Left side: Transaction ID and additional info */}
                    <div className="flex flex-col gap-[4px] flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-black">
                        {transactionId}
                      </p>
                      {type === 'Transfer' && transferSiteLabel && (
                        <p className="text-[12px] font-medium text-black">
                          {transferSiteLabel}
                        </p>
                      )}
                      {type === 'Bill Settlement' && (
                        <p className="text-[12px] font-semibold text-black">
                          ₹{parseFloat(bill_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>

                    {/* Right side: Payment Mode and Amount(s) */}
                    <div className="flex flex-col items-end gap-[4px] flex-shrink-0">
                      {(payment_mode || (type === 'Transfer' && !payment_mode)) && (
                        <span
                          className={`inline-block text-[10px] font-medium pl-[8px] pr-[8px] rounded-full ${type === 'Transfer'
                            ? 'bg-[#FFF3E0] text-black'
                            : type === 'Bill Settlement'
                              ? 'bg-[#007233] text-white'
                              : 'bg-[#FFF3E0] text-[#E4572E]'
                            }`}
                        >
                          {type === 'Transfer' && !payment_mode ? 'Online' : (payment_mode || '')}
                        </span>
                      )}

                      {type === 'Refund' && (
                        <span className="text-[12px] font-semibold text-[#E4572E]">
                          -₹{Math.abs(parseFloat(refund_amount || 0) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                      )}

                      {type === 'Transfer' && (
                        <span className={`text-[12px] font-semibold ${parseFloat(amount || 0) < 0 ? 'text-[#E4572E]' : 'text-[#007233]'}`}>
                          {parseFloat(amount || 0) < 0 ? '-' : ''}₹{Math.abs(parseFloat(amount || 0)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                      )}

                      {type === 'Bill Settlement' && (
                        <span className={`text-[12px] font-semibold ${parseFloat(amount || 0) < 0 ? 'text-[#E4572E]' : 'text-[#007233]'}`}>
                          ₹{parseFloat(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                      )}

                      {type === 'Advance' && (
                        <span className={`text-[12px] font-semibold ${parseFloat(amount || 0) < 0 ? 'text-[#E4572E]' : 'text-[#007233]'}`}>
                          ₹{parseFloat(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
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

            {/* Options List */}
            <div className="flex-1 overflow-y-auto mb-[8px] px-[24px] min-h-[65vh] [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="shadow-md rounded-lg overflow-hidden">
                {(['Advance', 'Bill Settlement', 'Transfer', 'Refund']
                  .filter(type => type.toLowerCase().includes(typeSearchQuery.toLowerCase()))
                  .map((type, index) => {
                    const isSelected = selectedType === type;

                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedType(type);
                          setShowTypeModal(false);
                          setTypeSearchQuery('');
                        }}
                        className={`w-full px-[16px] flex items-center gap-3 transition-colors ${isSelected ? 'bg-[#FFF9E6]' : 'hover:bg-[#F5F5F5]'
                          }`}
                        style={{ minHeight: '44px', maxHeight: '44px', height: '44px' }}
                      >
                        <p className="text-[12px] font-medium text-black text-left">{type}</p>
                      </button>
                    );
                  }))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contractor/Vendor Modal */}
      <SelectVendorModal
        isOpen={showContractorVendorModal}
        onClose={() => setShowContractorVendorModal(false)}
        onSelect={(value) => {
          const selected = combinedOptions.find(opt => opt.label === value);
          if (selected) {
            handleChange(selected);
          }
          setShowContractorVendorModal(false);
        }}
        selectedValue={selectedOption ? selectedOption.label : ''}
        options={combinedOptions.map(opt => opt.label)}
        fieldName="Contractor/Vendor"
        showStarIcon={false}
      />

      {/* Project Name Modal */}
      <SelectVendorModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSelect={(value) => {
          const selected = siteOptions.find(opt => opt.label === value);
          if (selected) {
            setSelectedSite(selected);
          }
          setShowProjectModal(false);
        }}
        selectedValue={selectedSite ? selectedSite.label : ''}
        options={siteOptions.map(opt => opt.label)}
        fieldName="Project Name"
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
        options={finalPaymentModeOptions.map(opt => opt.label)}
        fieldName="Payment Mode"
        showStarIcon={false}
      />

      {/* Category Modal */}
      <SelectVendorModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelect={(value) => {
          const selected = categoryOptions.find(opt => opt.label === value);
          if (selected) {
            setSelectedCategory(selected);
          }
          setShowCategoryModal(false);
        }}
        selectedValue={selectedCategory ? selectedCategory.label : ''}
        options={categoryOptions.map(opt => opt.label)}
        fieldName="Category"
        showStarIcon={false}
      />

      {/* Transfer Site Modal (To Project) */}
      <SelectVendorModal
        isOpen={showTransferSiteModal}
        onClose={() => setShowTransferSiteModal(false)}
        onSelect={(value) => {
          const selected = siteOptions.find(opt => opt.label === value);
          if (selected) {
            setTransferSiteId(selected.id.toString());
          }
          setShowTransferSiteModal(false);
        }}
        selectedValue={transferSiteId ? (siteOptions.find(opt => opt.id === parseInt(transferSiteId))?.label || '') : ''}
        options={siteOptions.map(opt => opt.label)}
        fieldName="To Project"
        showStarIcon={false}
      />

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={handleDateConfirm}
        initialDate={formattedDate}
      />

      {/* Cheque Date Picker Modal for Payment Details bottom sheet */}
      <DatePickerModal
        isOpen={showChequeDatePicker}
        onClose={() => setShowChequeDatePicker(false)}
        onConfirm={handleChequeDateConfirm}
        initialDate={
          paymentModalData.chequeDate
            ? new Date(paymentModalData.chequeDate).toLocaleDateString('en-GB')
            : formattedDate
        }
      />

      {/* Payment Details Bottom Sheet - for Net Banking, Online UPI (GPay/PhonePe), Cheque */}
      {showPaymentDetailsBottomSheet && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center px-[0px]"
          onClick={() => !isSubmitting && setShowPaymentDetailsBottomSheet(false)}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          <div
            className="bg-white w-full max-w-[360px] mx-auto rounded-t-[20px] shadow-lg max-h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-[16px] pt-[16px] pb-[8px] border-b border-[rgba(0,0,0,0.08)]">
              <p className="text-[16px] font-semibold text-black">Payment Details</p>
              <button
                type="button"
                onClick={() => !isSubmitting && setShowPaymentDetailsBottomSheet(false)}
                className="text-[#9E9E9E] text-[20px] font-semibold hover:opacity-80"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-[16px] py-[16px] space-y-4">
              {/* Date, Amount, Payment Mode - readonly */}
              <div className="grid grid-cols-3 gap-[8px]">
                <div>
                  <p className="text-[11px] font-semibold text-black mb-1">Date</p>
                  <div className="h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] flex items-center text-[12px] font-medium bg-[#F5F5F5] text-[#666]">
                    {paymentModalData.date ? new Date(paymentModalData.date).toLocaleDateString('en-GB') : '-'}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-black mb-1">Amount</p>
                  <div className="h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] flex items-center text-[12px] font-medium bg-[#F5F5F5] text-[#666]">
                    {paymentModalData.amount ? `₹${Number(paymentModalData.amount).toLocaleString('en-IN')}` : '-'}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-black mb-1">Payment Mode</p>
                  <div className="h-[36px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] flex items-center text-[12px] font-medium bg-[#F5F5F5] text-[#666]">
                    {paymentModalData.paymentMode || '-'}
                  </div>
                </div>
              </div>

              {/* Cheque fields - only for Cheque */}
              {paymentModalData.paymentMode === 'Cheque' && (
                <div className="grid grid-cols-2 gap-[12px]">
                  <div>
                    <p className="text-[12px] font-semibold text-black mb-1">Cheque No<span className="text-[#eb2f8e]">*</span></p>
                    <input
                      type="text"
                      value={paymentModalData.chequeNo}
                      onChange={(e) => setPaymentModalData(prev => ({ ...prev, chequeNo: e.target.value }))}
                      placeholder="Enter cheque number"
                      className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] text-[12px] font-medium bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-black mb-1">Cheque Date<span className="text-[#eb2f8e]">*</span></p>
                    <div
                      onClick={() => setShowChequeDatePicker(true)}
                      className="relative w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] flex items-center text-[12px] font-medium bg-white cursor-pointer"
                      style={{ color: paymentModalData.chequeDate ? '#000' : '#9E9E9E' }}
                    >
                      {paymentModalData.chequeDate
                        ? new Date(paymentModalData.chequeDate).toLocaleDateString('en-GB')
                        : 'dd-mm-yyyy'}
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="1" y="2.5" width="12" height="10" rx="1.5" stroke="#9E9E9E" strokeWidth="1.2" />
                          <path d="M1 5H13" stroke="#9E9E9E" strokeWidth="1.2" />
                          <path d="M4 1V4" stroke="#9E9E9E" strokeWidth="1.2" strokeLinecap="round" />
                          <path d="M10 1V4" stroke="#9E9E9E" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Number */}
              <div>
                <p className="text-[12px] font-semibold text-black mb-1">Transaction Number</p>
                <input
                  type="text"
                  value={paymentModalData.transactionNumber}
                  onChange={(e) => setPaymentModalData(prev => ({ ...prev, transactionNumber: e.target.value }))}
                  placeholder="Enter transaction number"
                  className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] text-[12px] font-medium bg-white focus:outline-none"
                />
              </div>

              {/* Account Number - required (clearable dropdown) */}
              <div>
                <p className="text-[12px] font-semibold text-black mb-1">
                  Account Number<span className="text-[#eb2f8e]">*</span>
                </p>
                <div className="relative">
                  <div
                    onClick={() => {
                      void (async () => {
                        await ensureAccountDetailsLoaded();
                        setShowAccountSelectModal(true);
                      })();
                    }}
                    className="relative w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                    style={{ color: paymentModalData.accountNumber ? '#000' : '#9E9E9E' }}
                  >
                    {paymentModalData.accountNumber || 'Select Account'}
                    {paymentModalData.accountNumber ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPaymentModalData(prev => ({ ...prev, accountNumber: '' }));
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9 3L3 9M3 3L9 9"
                            stroke="#000"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    ) : (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg
                          width="12"
                          height="8"
                          viewBox="0 0 12 8"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1 1L6 6L11 1"
                            stroke="#9E9E9E"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-[12px] px-[16px] pb-[24px] pt-[8px] border-t border-[rgba(0,0,0,0.08)]">
              <button
                type="button"
                onClick={() => !isSubmitting && setShowPaymentDetailsBottomSheet(false)}
                className="flex-1 h-[40px] border border-[rgba(0,0,0,0.2)] rounded text-[14px] font-semibold text-black bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePaymentDetailsSubmit}
                disabled={isSubmitting}
                className="flex-1 h-[40px] rounded text-[14px] font-semibold text-white bg-black disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Entry Modal - card view matching page UI */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-[16px]">
          <div className="bg-white rounded-[12px] w-full max-w-[90vw] max-h-[85vh] shadow-lg flex flex-col">
            <div className="px-[16px] py-[12px] border-b border-[#E0E0E0] flex-shrink-0">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-black">Possible Duplicate Entry</h3>
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl font-bold"
                  onClick={handleDuplicateCancel}
                >
                  ×
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-600">
                Same date, vendor/contractor, project and amount. Entries: {duplicateMatchedExpenses.length} |
                Total: ₹{duplicateMatchedExpenses.reduce((s, i) => s + Number(i.amount || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex-1 overflow-auto p-[12px] space-y-2">
              {duplicateMatchedExpenses.map((exp, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#E0E0E0] border-opacity-30 rounded-[8px] px-[12px] py-[12px] shadow-lg border-l-4 border-l-[#BF9853]"
                >
                  <div className="flex justify-between items-start gap-[12px]">
                    <div className="flex flex-col gap-[6px] flex-1 min-w-0">
                      <div className="flex flex-wrap gap-x-[8px] gap-y-[2px] text-[11px] text-gray-600">
                        <span>{formatDate(exp.timestamp || exp.date)}</span>
                        <span>•</span>
                        <span>{formatDateOnly(exp.date)}</span>
                      </div>
                      <p className="text-[12px] font-semibold text-black">E.No {exp.eno || '-'}</p>
                      <p className="text-[12px] font-medium text-black">{exp.siteName || '-'}</p>
                      <p className="text-[12px] font-medium text-black">{exp.vendor || exp.contractor || '-'}</p>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      {(exp.billCopy || exp.billCopyUrl) ? (
                        <a
                          href={exp.billCopy || exp.billCopyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[14px] font-semibold text-[#007233] underline underline-offset-1 active:opacity-80"
                        >
                          ₹{Number(exp.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </a>
                      ) : (
                        <span className="text-[14px] font-semibold text-black">
                          ₹{Number(exp.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#FAFAFA] border-t border-[#E0E0E0] px-[16px] py-[12px] flex justify-between items-center">
              <span className="text-xs text-gray-600">Proceed anyway?</span>
              <div className="flex gap-[8px]">
                <button
                  type="button"
                  className="px-[12px] py-[6px] text-sm bg-white border border-[rgba(0,0,0,0.16)] rounded font-medium"
                  onClick={handleDuplicateCancel}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-[12px] py-[6px] text-sm bg-black text-white rounded font-medium"
                  onClick={handleDuplicateIgnore}
                >
                  Ignore & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account selection modal for Payment Details (same style as Contractor/Vendor dropdown) */}
      <SelectVendorModal
        isOpen={showAccountSelectModal}
        onClose={() => setShowAccountSelectModal(false)}
        onSelect={(value) => {
          setPaymentModalData(prev => ({ ...prev, accountNumber: value }));
          setShowAccountSelectModal(false);
        }}
        selectedValue={paymentModalData.accountNumber}
        options={accountDetails.map(acc => acc.account_number || '')}
        fieldName="Account Number"
        showStarIcon={false}
      />
    </div>
  );
};

export default AdvanceForm;
