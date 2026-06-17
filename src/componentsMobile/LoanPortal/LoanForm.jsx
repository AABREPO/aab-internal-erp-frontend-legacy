import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Attach from '../Images/Attachfile.svg';
import SelectVendorModal from '../PurchaseOrder/SelectVendorModal';
import DatePickerModal from '../PurchaseOrder/DatePickerModal';
import CloseIcon from '../Images/Close F.svg'
import { fetchUserModulePermissions } from '../utils/fetchUserModulePermissions';
import {
  postBankRegisterLogSave,
  bankRegisterLogSaveUrlMatchingRequest,
  isPaymentModeRequiringBankRegisterLog,
} from '../../utils/bankRegisterLogBeforeWeeklyBill';
import {
  LOAN_PORTAL_MODULE_NAME,
} from '../../utils/paymentModeArrangement';
import { usePaymentModeSelectOptionsForModule } from '../../utils/usePaymentModeArrangement';

const LoanForm = () => {
  // Resolve module permissions (Create/Edit/Delete) for mobile actions.
  const [modulePermissions, setModulePermissions] = useState([]);
  useEffect(() => {
    const stored = (() => {
      try {
        return JSON.parse(localStorage.getItem('user') || '{}');
      } catch {
        return {};
      }
    })();
    fetchUserModulePermissions(stored?.userRoles || [], 'Loan Portal')
      .then(setModulePermissions)
      .catch(() => setModulePermissions([]));
  }, []);

  const canCreate = modulePermissions.includes('Create');
  const canEdit = modulePermissions.includes('Edit');

  const [editingLoanId, setEditingLoanId] = useState(null);
  const [existingFileUrl, setExistingFileUrl] = useState('');
  const [existingFileName, setExistingFileName] = useState('');
  const pendingEditRef = useRef(null);

  const getFileNameFromUrl = (url) => {
    if (!url) return '';
    try {
      const pathname = new URL(url).pathname;
      const name = pathname.split('/').pop();
      return decodeURIComponent(name || '').replace(/\+/g, ' ') || 'Attached file';
    } catch {
      const parts = String(url).split('/');
      const last = parts[parts.length - 1] || '';
      return decodeURIComponent(last.split('?')[0]).replace(/\+/g, ' ') || 'Attached file';
    }
  };

  const resolveEntryFileUrlForEdit = (entry) => {
    const direct = entry?.file_url || entry?.fileUrl || '';
    if (direct && direct !== 'null' && direct !== 'undefined') return direct;

    const loanId = entry?.loanPortalId ?? entry?.id ?? entry?.loan_portal_id;
    const entryNo = entry?.entry_no ?? entry?.entryNo;
    try {
      const cacheRows = [
        ...JSON.parse(sessionStorage.getItem('aab_loan_file_cache') || '[]'),
        ...JSON.parse(localStorage.getItem('aab_loan_file_cache') || '[]'),
      ];
      for (const row of cacheRows) {
        const url = row?.file_url || row?.fileUrl || row?.previewDataUrl || '';
        if (!url) continue;
        if (loanId != null && String(row.loanPortalId ?? row.id ?? row.loan_portal_id) === String(loanId)) {
          return url;
        }
        if (entryNo != null && String(row.entry_no ?? row.entryNo) === String(entryNo)) {
          return url;
        }
      }
    } catch {
      // ignore cache read errors
    }
    return '';
  };

  const setExistingAttachment = (url) => {
    const trimmed = String(url || '').trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') {
      setExistingFileUrl('');
      setExistingFileName('');
      return;
    }
    setExistingFileUrl(trimmed);
    setExistingFileName(getFileNameFromUrl(trimmed));
  };

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
    if (activeBranchId !== null && activeBranchId !== undefined && activeBranchId !== '') {
      url.searchParams.set('branchId', String(activeBranchId));
    }
    return url.toString();
  }, [activeBranchId]);
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
  const [loanAmount, setLoanAmount] = useState('');
  const [associateRecords, setAssociateRecords] = useState([]);
  const pendingPrefillRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [typeSearchQuery, setTypeSearchQuery] = useState('');
  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [showPurposeModal, setShowPurposeModal] = useState(false);
  const [showPaymentModeModal, setShowPaymentModeModal] = useState(false);
  const [showTransferToModal, setShowTransferToModal] = useState(false);
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
  const [siteOptions, setSiteOptions] = useState([]);
  const [combinedTransferToOptions, setCombinedTransferToOptions] = useState([]);
  const [transferSelection, setTransferSelection] = useState(null);
  const accountDetailsLoadedRef = useRef(false);
  const accountDetailsInFlightRef = useRef(null);

  const isTransfer = selectedLoanType === 'Transfer';

  const defaultPaymentModeOptions = useMemo(() => [
    { value: 'Cash', label: 'Cash' },
    { value: 'GPay', label: 'GPay' },
    { value: 'PhonePe', label: 'PhonePe' },
    { value: 'Net Banking', label: 'Net Banking' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'Advance Transfer', label: 'Advance Transfer' }
  ], []);

  const backendPaymentModeOptions = usePaymentModeSelectOptionsForModule(
    LOAN_PORTAL_MODULE_NAME,
    defaultPaymentModeOptions
  );
  const finalPaymentModeOptions = backendPaymentModeOptions.length > 0
    ? backendPaymentModeOptions
    : defaultPaymentModeOptions;

  useEffect(() => {
    accountDetailsLoadedRef.current = false;
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

  // Fetch entry number
  useEffect(() => {
    const fetchEntryNo = async () => {
      try {
        if (localStorage.getItem('editingLoanEntry')) return;
        const response = await fetch('https://backendaab.in/demoAabuildersDash/api/loans/all');
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
        const response = await fetch('https://backendaab.in/demoAabuildersDash/api/loan-purposes/getAll', {
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
        const response = await fetch("https://backendaab.in/demoAabuilderDash/api/vendor_Names/getAll", {
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
        const response = await fetch("https://backendaab.in/demoAabuilderDash/api/contractor_Names/getAll", {
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
        const response = await fetch("https://backendaab.in/demoAabuildersDash/api/employee_details/getAll", {
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
        const response = await fetch("https://backendaab.in/demoAabuildersDash/api/labours-details/getAll", {
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

  const applyLoanEditPayload = useCallback(
    (entry) => {
      if (!entry) return;

      const loanId = entry.loanPortalId ?? entry.id ?? entry.loan_portal_id;
      if (loanId) setEditingLoanId(loanId);

      setSelectedLoanType(entry.type || 'Loan');
      if (entry.entry_no != null) setEntryNo(entry.entry_no);

      if (entry.date) {
        const parsed = new Date(entry.date);
        if (!Number.isNaN(parsed.getTime())) {
          setDateValue(parsed.toISOString().split('T')[0]);
        }
      }

      let associate = null;
      if (entry.vendor_id) {
        associate = vendorOptions.find((opt) => Number(opt.id) === Number(entry.vendor_id));
      } else if (entry.contractor_id) {
        associate = contractorOptions.find((opt) => Number(opt.id) === Number(entry.contractor_id));
      } else if (entry.employee_id) {
        associate = employeeOptions.find((opt) => Number(opt.id) === Number(entry.employee_id));
      } else if (entry.labour_id) {
        associate = labourOptions.find((opt) => Number(opt.id) === Number(entry.labour_id));
      }
      if (!associate && entry.associateName) {
        associate = [...vendorOptions, ...contractorOptions, ...employeeOptions, ...labourOptions].find(
          (opt) => opt.label === entry.associateName
        );
      }
      if (associate) setSelectedOption(associate);

      if (entry.from_purpose_id) {
        setPurpose(String(entry.from_purpose_id));
      } else if (entry.purposeName) {
        const purposeOpt = purposeOptions.find((opt) => opt.label === entry.purposeName);
        if (purposeOpt) setPurpose(String(purposeOpt.id));
      }

      const entryType = entry.type || 'Loan';
      const amount =
        entryType === 'Refund'
          ? Math.abs(parseFloat(entry.loan_refund_amount) || 0)
          : Math.abs(parseFloat(entry.amount) || 0);
      setAmountGiven(amount ? String(amount) : '');

      setPaymentMode(entry.loan_payment_mode || '');
      setDescription(entry.description || '');
      setExistingAttachment(resolveEntryFileUrlForEdit(entry));

      if (entryType === 'Transfer') {
        const transferProjectId = entry.transfer_Project_id ?? entry.transfer_project_id;
        if (transferProjectId) {
          const site = siteOptions.find((opt) => Number(opt.id) === Number(transferProjectId));
          if (site) setTransferSelection(site);
        } else if (entry.to_purpose_id) {
          const purposeTarget = purposeOptions.find((opt) => Number(opt.id) === Number(entry.to_purpose_id));
          if (purposeTarget) setTransferSelection(purposeTarget);
        }
      } else {
        setTransferSelection(null);
      }
    },
    [vendorOptions, contractorOptions, employeeOptions, labourOptions, purposeOptions, siteOptions]
  );

  useEffect(() => {
    const readStoredEditEntry = () => {
      try {
        const raw = localStorage.getItem('editingLoanEntry');
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    };

    const handleEditLoanEntry = (event) => {
      const entry = event?.detail || readStoredEditEntry();
      if (!entry) return;
      pendingEditRef.current = entry;
      applyLoanEditPayload(entry);
      localStorage.removeItem('editingLoanEntry');
    };

    window.addEventListener('editLoanEntry', handleEditLoanEntry);
    const stored = readStoredEditEntry();
    if (stored) {
      pendingEditRef.current = stored;
      applyLoanEditPayload(stored);
      localStorage.removeItem('editingLoanEntry');
    }

    return () => window.removeEventListener('editLoanEntry', handleEditLoanEntry);
  }, [applyLoanEditPayload]);

  useEffect(() => {
    if (pendingEditRef.current) {
      applyLoanEditPayload(pendingEditRef.current);
    }
  }, [applyLoanEditPayload]);

  useEffect(() => {
    if (!editingLoanId || existingFileUrl) return;
    const fetchExistingFile = async () => {
      try {
        const response = await fetch(
          `https://backendaab.in/demoAabuildersDash/api/loans/${editingLoanId}`,
          { credentials: 'include', headers: { 'Content-Type': 'application/json' } }
        );
        if (!response.ok) return;
        const data = await response.json();
        const detail = Array.isArray(data) ? data[0] : data;
        const url = detail?.file_url || detail?.fileUrl || '';
        if (url) setExistingAttachment(url);
      } catch {
        // ignore
      }
    };
    fetchExistingFile();
  }, [editingLoanId, existingFileUrl]);

  const getEditedByUsername = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      return stored?.username || stored?.name || 'mobile';
    } catch {
      return 'mobile';
    }
  };

  // Fetch sites/projects for Transfer To
  useEffect(() => {
    const predefinedSiteOptions = [
      { value: "Mason Advance", label: "Mason Advance", id: 1, sNo: "1", type: "Site" },
      { value: "Material Advance", label: "Material Advance", id: 2, sNo: "2", type: "Site" },
      { value: "Weekly Advance", label: "Weekly Advance", id: 3, sNo: "3", type: "Site" },
      { value: "Excess Advance", label: "Excess Advance", id: 4, sNo: "4", type: "Site" },
      { value: "Material Rent", label: "Material Rent", id: 5, sNo: "5", type: "Site" },
      { value: "Subhash Kumar - Kunnur", label: "Subhash Kumar - Kunnur", id: 6, sNo: "6", type: "Site" },
      { value: "Summary Bill", label: "Summary Bill", id: 7, sNo: "7", type: "Site" },
      { value: "Daily Wage", label: "Daily Wage", id: 8, sNo: "8", type: "Site" },
      { value: "Rent Management Portal", label: "Rent Management Portal", id: 9, sNo: "9", type: "Site" },
    ];
    const fetchSites = async () => {
      try {
        const response = await fetch("https://backendaab.in/demoAabuilderDash/api/project_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
          const data = await response.json();
          const formattedData = data.map(item => ({
            value: item.siteName,
            label: item.siteName,
            type: "Site",
            id: item.id,
            sNo: item.siteNo
          }));
          setSiteOptions([...predefinedSiteOptions, ...formattedData]);
        } else {
          setSiteOptions(predefinedSiteOptions);
        }
      } catch (error) {
        console.error("Fetch error: ", error);
        setSiteOptions(predefinedSiteOptions);
      }
    };
    fetchSites();
  }, []);

  useEffect(() => {
    setCombinedTransferToOptions([
      ...siteOptions,
      ...purposeOptions,
      ...vendorOptions,
      ...contractorOptions,
      ...employeeOptions,
      ...labourOptions
    ]);
  }, [siteOptions, purposeOptions, vendorOptions, contractorOptions, employeeOptions, labourOptions]);

  // Calculate overall loan and loan amount (per purpose)
  useEffect(() => {
    if (!selectedOption) {
      setOverallLoan(0);
      setLoanAmount('');
      setAssociateRecords([]);
      return;
    }
    const fetchLoanData = async () => {
      try {
        const response = await fetch('https://backendaab.in/demoAabuildersDash/api/loans/all');
        if (response.ok) {
          const data = await response.json();
          const associateEntries = data.filter((item) => {
            if (selectedOption.type === 'Vendor') return item.vendor_id === selectedOption.id;
            if (selectedOption.type === 'Contractor') return item.contractor_id === selectedOption.id;
            if (selectedOption.type === 'Employee') return item.employee_id === selectedOption.id;
            if (selectedOption.type === 'Labour') return item.labour_id === selectedOption.id;
            return false;
          });
          setAssociateRecords(associateEntries);
          const total = associateEntries.reduce((sum, curr) => {
            if (curr.type === 'Loan') return sum + (parseFloat(curr.amount) || 0);
            if (curr.type === 'Refund') return sum - (parseFloat(curr.loan_refund_amount) || 0);
            return sum;
          }, 0);
          setOverallLoan(total);

          if (!purpose) {
            setLoanAmount('');
            return;
          }
          const purposeId = parseInt(purpose, 10);
          const purposeTotal = associateEntries
            .filter((entry) => entry.from_purpose_id === purposeId)
            .reduce((sum, curr) => {
              if (curr.type === 'Loan') return sum + (parseFloat(curr.amount) || 0);
              if (curr.type === 'Refund') return sum - (parseFloat(curr.loan_refund_amount) || 0);
              if (curr.type === 'Transfer') return sum + (parseFloat(curr.amount) || 0);
              return sum;
            }, 0);
          setLoanAmount(purposeTotal.toString());
        }
      } catch (error) {
        console.error('Error fetching loan data:', error);
      }
    };
    fetchLoanData();
  }, [selectedOption, purpose]);

  // Prefill from History: click associate name -> open Loan tab with selection
  useEffect(() => {
    const applyPrefill = () => {
      try {
        const raw = localStorage.getItem('loanFormPrefill');
        if (!raw) return;
        const p = JSON.parse(raw || '{}');
        if (!p || typeof p !== 'object') return;

        pendingPrefillRef.current = p;

        let next = null;
        if (p.vendor_id) next = vendorOptions.find((o) => Number(o.id) === Number(p.vendor_id));
        else if (p.contractor_id) next = contractorOptions.find((o) => Number(o.id) === Number(p.contractor_id));
        else if (p.employee_id) next = employeeOptions.find((o) => Number(o.id) === Number(p.employee_id));
        else if (p.labour_id) next = labourOptions.find((o) => Number(o.id) === Number(p.labour_id));

        if (!next && p.associateName) {
          next = [...vendorOptions, ...contractorOptions, ...employeeOptions, ...labourOptions].find(
            (o) => o.label === p.associateName
          );
        }
        if (next) {
          setSelectedOption(next);
          pendingPrefillRef.current = null;
          localStorage.removeItem('loanFormPrefill');
        }
        if (p.from_purpose_id) setPurpose(String(p.from_purpose_id));
      } catch {
        // ignore
      }
    };

    applyPrefill();
    window.addEventListener('editLoanEntry', applyPrefill);
    return () => window.removeEventListener('editLoanEntry', applyPrefill);
  }, [vendorOptions, contractorOptions, employeeOptions, labourOptions]);

  // If prefill arrived before options, retry once options load.
  useEffect(() => {
    const p = pendingPrefillRef.current;
    if (!p) return;
    let next = null;
    if (p.vendor_id) next = vendorOptions.find((o) => Number(o.id) === Number(p.vendor_id));
    else if (p.contractor_id) next = contractorOptions.find((o) => Number(o.id) === Number(p.contractor_id));
    else if (p.employee_id) next = employeeOptions.find((o) => Number(o.id) === Number(p.employee_id));
    else if (p.labour_id) next = labourOptions.find((o) => Number(o.id) === Number(p.labour_id));
    if (!next && p.associateName) {
      next = [...vendorOptions, ...contractorOptions, ...employeeOptions, ...labourOptions].find((o) => o.label === p.associateName);
    }
    if (!next) return;
    setSelectedOption(next);
    if (p.from_purpose_id) setPurpose(String(p.from_purpose_id));
    pendingPrefillRef.current = null;
    try {
      localStorage.removeItem('loanFormPrefill');
    } catch {
      // ignore
    }
  }, [combinedOptions, vendorOptions, contractorOptions, employeeOptions, labourOptions]);
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
      setExistingFileUrl('');
      setExistingFileName('');
    }
  };
  const handleRemoveFile = () => {
    setSelectedLoanFile(null);
    setExistingFileUrl('');
    setExistingFileName('');
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
  const convertToDateValue = (ddmmyyyy) => {
    const parts = ddmmyyyy.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    return dateValue;
  };
  const ensureAccountDetailsLoaded = useCallback(async () => {
    if (accountDetailsLoadedRef.current) return;
    if (accountDetailsInFlightRef.current) {
      await accountDetailsInFlightRef.current;
      return;
    }
    const run = (async () => {
      try {
        const response = await fetch(withBranchUrl('https://backendaab.in/demoAabuildersDash/api/account-details/getAll'), {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('account-details');
        const data = await response.json();
        const list = Array.isArray(data) ? data : [];
        const sliced = list.slice(0, 500);
        setAccountDetails(sliced);
        if (sliced.length > 0) {
          accountDetailsLoadedRef.current = true;
        }
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
  }, [withBranchUrl]);
  useEffect(() => {
    void ensureAccountDetailsLoaded();
  }, [ensureAccountDetailsLoaded]);
  const accountNumberOptions = useMemo(
    () =>
      accountDetails
        .map((acc) => acc?.account_number || acc?.accountNumber || '')
        .filter(Boolean),
    [accountDetails]
  );
  const isChequePaymentMode = (mode) => String(mode || '').trim().toLowerCase() === 'cheque';
  const requiresPaymentDetailsSheet = () => {
    if (selectedLoanType !== 'Loan') return false;
    return isPaymentModeRequiringBankRegisterLog(paymentMode);
  };
  const validateSubmitForm = () => {
    if (!selectedOption) {
      toast.error("Please select an associate!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return false;
    }
    if (!purpose) {
      toast.error("Please select a purpose!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return false;
    }
    if (!amountGiven || parseFloat(amountGiven) <= 0) {
      toast.error("Please enter a valid amount!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return false;
    }
    if (selectedLoanType === 'Transfer') {
      if (!transferSelection) {
        toast.error("Please select transfer destination!", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored"
        });
        return false;
      }
    } else if (!paymentMode) {
      toast.error("Please select a payment mode!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      return false;
    }
    return true;
  };
  const uploadLoanAttachment = async () => {
    if (!selectedLoanFile) return '';
    const formData = new FormData();
    const now = new Date();
    const timestamp = now
      .toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      })
      .replace(',', '')
      .replace(/\s/g, '-');
    const associateName = selectedOption?.label || 'Loan';
    const finalName = `${timestamp} ${associateName} ${selectedLoanType}`;
    formData.append('files', selectedLoanFile);
    formData.append('folder', 'FileUpload / Loan_Portal');
    formData.append('fileName', finalName);
    const uploadRes = await fetch('https://backendaab.in/demoAabuildersDash/api/files/upload', {
      method: 'POST',
      body: formData,
    });
    if (!uploadRes.ok) throw new Error('File upload failed');
    const uploadResult = await uploadRes.json().catch(() => ({}));
    const uploadedUrl = uploadResult?.urls?.[0] || uploadResult?.url || '';
    if (!uploadedUrl) throw new Error('File upload failed');
    return uploadedUrl;
  };
  const performLoanSubmit = async (paymentDetails = null) => {
    setIsSubmitting(true);
    try {
      const isEditMode = Boolean(editingLoanId);
      if (isEditMode) {
        if (!canEdit) {
          toast.error("You don't have permission to edit Loan entries.", {
            position: "top-center",
            autoClose: 3000,
            theme: "colored"
          });
          setIsSubmitting(false);
          return;
        }
      } else if (!canCreate) {
        toast.error("You don't have permission to create new Loan entries.", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored"
        });
        setIsSubmitting(false);
        return;
      }
      let uploadedFileUrl = '';
      if (selectedLoanFile) {
        try {
          uploadedFileUrl = await uploadLoanAttachment();
        } catch (uploadError) {
          console.error('Loan file upload failed:', uploadError);
          toast.error('File upload failed. Please try again.', {
            position: 'top-center',
            autoClose: 3000,
            theme: 'colored',
          });
          setIsSubmitting(false);
          return;
        }
      }
      if (isEditMode) {
        const entryType = selectedLoanType;
        const isRefund = entryType === 'Refund';
        const updatePayload = {
          loanPortalId: editingLoanId,
          type: entryType,
          date: dateValue,
          amount: isRefund ? 0 : parseFloat(amountGiven) || 0,
          loan_refund_amount: isRefund ? parseFloat(amountGiven) || 0 : 0,
          loan_payment_mode: entryType === 'Transfer' ? '' : paymentMode,
          from_purpose_id: purpose || 0,
          to_purpose_id:
            entryType === 'Transfer' && transferSelection?.type === 'Purpose'
              ? transferSelection.id
              : 0,
          vendor_id: selectedOption?.type === 'Vendor' ? selectedOption.id : 0,
          contractor_id: selectedOption?.type === 'Contractor' ? selectedOption.id : 0,
          employee_id: selectedOption?.type === 'Employee' ? selectedOption.id : 0,
          labour_id: selectedOption?.type === 'Labour' ? selectedOption.id : 0,
          project_id: 0,
          transfer_Project_id:
            entryType === 'Transfer' && transferSelection?.type === 'Site' ? transferSelection.id : 0,
          entry_no: entryNo,
          description: description || '',
          file_url: uploadedFileUrl || existingFileUrl || '',
          advance_portal_id: null,
          branch_id: activeBranchId,
        };
        const username = encodeURIComponent(getEditedByUsername());
        const response = await fetch(
          `https://backendaab.in/demoAabuildersDash/api/loans/${editingLoanId}?editedBy=${username}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(updatePayload),
          }
        );
        if (!response.ok) throw new Error('Failed to update loan entry');
        toast.success('Loan entry updated successfully!', {
          position: 'top-center',
          autoClose: 3000,
          theme: 'colored',
        });
        setEditingLoanId(null);
        setExistingFileUrl('');
        setExistingFileName('');
        pendingEditRef.current = null;
        window.dispatchEvent(new Event('loanUpdated'));
      } else if (selectedLoanType === 'Transfer') {
        const transferAmountValue = parseFloat(amountGiven) || 0;
        const isTransferToAssociate = ["Contractor", "Vendor", "Employee", "Labour"].includes(transferSelection?.type);
        if (isTransferToAssociate) {
          const senderName = selectedOption?.label || '';
          const receiverName = transferSelection?.label || '';
          const transferDesc = description
            ? `${description} - ${senderName} to ${receiverName} amount transferred`
            : `${senderName} to ${receiverName} amount transferred`;
          const senderPayload = {
            type: "Transfer",
            date: dateValue,
            amount: -Math.abs(transferAmountValue),
            loan_payment_mode: "",
            loan_refund_amount: 0,
            from_purpose_id: purpose || 0,
            transfer_Project_id: 0,
            to_purpose_id: 0,
            vendor_id: selectedOption?.type === "Vendor" ? selectedOption.id : 0,
            contractor_id: selectedOption?.type === "Contractor" ? selectedOption.id : 0,
            employee_id: selectedOption?.type === "Employee" ? selectedOption.id : 0,
            labour_id: selectedOption?.type === "Labour" ? selectedOption.id : 0,
            project_id: 0,
            description: transferDesc,
            file_url: uploadedFileUrl || '',
            advance_portal_id: null,
            branch_id: activeBranchId
          };
          const receiverPayload = {
            type: "Loan",
            date: dateValue,
            amount: Math.abs(transferAmountValue),
            loan_payment_mode: "",
            loan_refund_amount: 0,
            from_purpose_id: purpose || 0,
            transfer_Project_id: 0,
            to_purpose_id: 0,
            vendor_id: transferSelection?.type === "Vendor" ? transferSelection.id : 0,
            contractor_id: transferSelection?.type === "Contractor" ? transferSelection.id : 0,
            employee_id: transferSelection?.type === "Employee" ? transferSelection.id : 0,
            labour_id: transferSelection?.type === "Labour" ? transferSelection.id : 0,
            project_id: 0,
            description: transferDesc,
            file_url: uploadedFileUrl || '',
            advance_portal_id: null,
            branch_id: activeBranchId
          };
          const loanSaveUrl = withBranchUrl('https://backendaab.in/demoAabuildersDash/api/loans/save');
          const senderResponse = await fetch(loanSaveUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(senderPayload)
          });
          if (!senderResponse.ok) throw new Error('Failed to save transfer');
          const receiverResponse = await fetch(loanSaveUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(receiverPayload)
          });
          if (!receiverResponse.ok) throw new Error('Failed to save transfer');
        } else {
          const payload = {
            type: "Transfer",
            date: dateValue,
            amount:
              transferSelection?.type === "Site" && (selectedOption?.type === "Vendor" || selectedOption?.type === "Contractor")
                ? -Math.abs(transferAmountValue)
                : transferAmountValue,
            loan_payment_mode: "",
            loan_refund_amount: 0,
            from_purpose_id: purpose || 0,
            transfer_Project_id: transferSelection?.type === "Site" ? transferSelection.id : 0,
            to_purpose_id: transferSelection?.type === "Purpose" ? transferSelection.id : 0,
            vendor_id: selectedOption?.type === "Vendor" ? selectedOption.id : 0,
            contractor_id: selectedOption?.type === "Contractor" ? selectedOption.id : 0,
            employee_id: selectedOption?.type === "Employee" ? selectedOption.id : 0,
            labour_id: selectedOption?.type === "Labour" ? selectedOption.id : 0,
            project_id: 0,
            description: description || '',
            file_url: uploadedFileUrl || '',
            advance_portal_id: null,
            branch_id: activeBranchId
          };
          const response = await fetch(withBranchUrl('https://backendaab.in/demoAabuildersDash/api/loans/save'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
          });
          if (!response.ok) throw new Error('Failed to save transfer');
        }
        toast.success("Transfer completed successfully!", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored"
        });
      } else {
        const isRefund = selectedLoanType === 'Refund';
        const payload = {
          type: selectedLoanType,
          date: dateValue,
          amount: isRefund ? 0 : parseFloat(amountGiven) || 0,
          loan_payment_mode: paymentMode,
          loan_refund_amount: isRefund ? parseFloat(amountGiven) || 0 : 0,
          from_purpose_id: purpose || 0,
          transfer_Project_id: 0,
          to_purpose_id: 0,
          vendor_id: selectedOption?.type === 'Vendor' ? selectedOption.id : 0,
          contractor_id: selectedOption?.type === 'Contractor' ? selectedOption.id : 0,
          employee_id: selectedOption?.type === 'Employee' ? selectedOption.id : 0,
          labour_id: selectedOption?.type === 'Labour' ? selectedOption.id : 0,
          project_id: 0,
          description: description || '',
          file_url: uploadedFileUrl || '',
          advance_portal_id: null,
          branch_id: activeBranchId
        };
        const loanSaveUrl = withBranchUrl('https://backendaab.in/demoAabuildersDash/api/loans/save');
        if (selectedLoanType === 'Loan' && paymentDetails && isPaymentModeRequiringBankRegisterLog(paymentDetails.paymentMode)) {
          await postBankRegisterLogSave(
            bankRegisterLogSaveUrlMatchingRequest(loanSaveUrl),
            'Loan Portal',
            {
              bill_payment_mode: paymentDetails.paymentMode,
              amount: parseFloat(paymentDetails.amount) || 0,
              entered_by: getEditedByUsername(),
            }
          );
        }
        const response = await fetch(loanSaveUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          throw new Error(isRefund ? 'Failed to save refund' : 'Failed to save loan');
        }
        const saved = await response.json().catch(() => ({}));
        if (uploadedFileUrl) {
          try {
            const cacheKey = 'aab_loan_file_cache';
            const existing = JSON.parse(sessionStorage.getItem(cacheKey) || '[]');
            const loanId = saved?.loanPortalId ?? saved?.id ?? saved?.loan_portal_id;
            existing.unshift({
              loanPortalId: loanId,
              entry_no: saved?.entry_no ?? entryNo,
              vendor_id: payload.vendor_id,
              amount: isRefund ? payload.loan_refund_amount : payload.amount,
              date: payload.date,
              loan_payment_mode: payload.loan_payment_mode,
              file_url: uploadedFileUrl,
            });
            sessionStorage.setItem(cacheKey, JSON.stringify(existing.slice(0, 100)));
          } catch {
            // ignore cache errors
          }
        }
        if (selectedLoanType === 'Loan' && paymentDetails) {
          const weeklyPaymentBillPayload = {
            date: paymentDetails.date,
            created_at: new Date().toISOString(),
            contractor_id: selectedOption?.type === 'Contractor' ? selectedOption.id : null,
            vendor_id: selectedOption?.type === 'Vendor' ? selectedOption.id : null,
            employee_id: selectedOption?.type === 'Employee' ? selectedOption.id : null,
            project_id: 0,
            type: 'Loan',
            bill_payment_mode: paymentDetails.paymentMode,
            amount: parseFloat(paymentDetails.amount) || 0,
            status: true,
            weekly_number: '',
            weekly_payment_expense_id: null,
            advance_portal_id: null,
            staff_advance_portal_id: null,
            claim_payment_id: null,
            purpose_id: purpose,
            loan_portal_id: saved?.id || saved?.loanPortalId || saved?.loan_portal_id,
            cheque_number: isChequePaymentMode(paymentDetails.paymentMode) ? paymentDetails.chequeNo : null,
            cheque_date: isChequePaymentMode(paymentDetails.paymentMode) ? paymentDetails.chequeDate : null,
            transaction_number: paymentDetails.transactionNumber || null,
            account_number: paymentDetails.accountNumber || null,
            branch_id: activeBranchId,
          };
          const weeklyBillSaveUrl = withBranchUrl('https://backendaab.in/demoAabuildersDash/api/weekly-payment-bills/save');
          const weeklyResponse = await fetch(weeklyBillSaveUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(weeklyPaymentBillPayload),
          });
          if (!weeklyResponse.ok) throw new Error('Failed to save weekly payment bills data');
          toast.success('Loan entry saved successfully and added to Weekly Payment Bills!', {
            position: "top-center",
            autoClose: 3000,
            theme: "colored"
          });
          setShowPaymentDetailsBottomSheet(false);
          setPaymentModalData({
            date: '',
            amount: '',
            paymentMode: '',
            chequeNo: '',
            chequeDate: '',
            transactionNumber: '',
            accountNumber: ''
          });
        } else {
          toast.success(
            isRefund
              ? 'Refund saved successfully!'
              : 'Loan entry saved successfully!',
            {
              position: "top-center",
              autoClose: 3000,
              theme: "colored"
            }
          );
        }
      }
      if (!isEditMode) {
        // Reset form after create
        setSelectedOption(null);
        setPurpose('');
        setAmountGiven('');
        setPaymentMode('');
        setTransferSelection(null);
        setDescription('');
        setSelectedLoanFile(null);
        setExistingFileUrl('');
        setExistingFileName('');
        setOverallLoan(0);
        setLoanAmount('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setEntryNo((prev) => prev + 1);
        window.dispatchEvent(new Event('loanUpdated'));
      }
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
  const handleSubmit = async () => {
    if (!validateSubmitForm()) return;

    if (!editingLoanId && requiresPaymentDetailsSheet()) {
      if (accountDetails.length === 0) {
        accountDetailsLoadedRef.current = false;
      }
      await ensureAccountDetailsLoaded();
      setPaymentModalData({
        date: dateValue,
        amount: amountGiven.toString().replace(/,/g, '') || '',
        paymentMode: paymentMode,
        chequeNo: '',
        chequeDate: '',
        transactionNumber: '',
        accountNumber: ''
      });
      setShowPaymentDetailsBottomSheet(true);
      return;
    }

    await performLoanSubmit();
  };
  const handlePaymentDetailsSubmit = async () => {
    if (!paymentModalData.accountNumber) {
      toast.error('Please select account number.', {
        position: 'top-center',
        autoClose: 3000,
        theme: 'colored',
      });
      return;
    }
    if (isChequePaymentMode(paymentModalData.paymentMode) && (!paymentModalData.chequeNo || !paymentModalData.chequeDate)) {
      toast.error('Please enter cheque number and date.', {
        position: 'top-center',
        autoClose: 3000,
        theme: 'colored',
      });
      return;
    }
    await performLoanSubmit(paymentModalData);
  };
  const formattedDate = dateValue ? new Date(dateValue).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');
  const handleDateConfirm = (dateString) => {
    const convertedDate = convertToDateValue(dateString);
    setDateValue(convertedDate);
  };
  const handleChequeDateConfirm = (dateString) => {
    const convertedDate = convertToDateValue(dateString);
    setPaymentModalData(prev => ({ ...prev, chequeDate: convertedDate }));
    setShowChequeDatePicker(false);
  };
  const paymentDetailsBottomSheet = showPaymentDetailsBottomSheet ? (
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

          {isChequePaymentMode(paymentModalData.paymentMode) && (
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

          <div>
            <p className="text-[12px] font-semibold text-black mb-1">
              Account Number<span className="text-[#eb2f8e]">*</span>
            </p>
            <div className="relative">
              <div
                onClick={() => {
                  void (async () => {
                    if (accountDetails.length === 0) {
                      accountDetailsLoadedRef.current = false;
                    }
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
  ) : null;

  return (
    <div
      className="flex flex-col flex-1 min-h-0 overflow-hidden"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {/* Form section - no scroll */}
      <div className="flex-shrink-0">
        {/* Loan Number and Date */}
        <div className="flex-shrink-0 flex mb-[8px] items-center border-b border-[#E0E0E0] justify-between pt-[8px] pb-[8px]">
          <div className="flex items-center gap-[8px]">
            <p className="text-[12px] font-semibold text-black leading-normal"># {entryNo}</p>
            <button
              type="button"
              onClick={() => setShowDatePicker(true)}
              className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:underline p-0 border-0 bg-transparent"
            >
              {formattedDate}
            </button>
          </div>
          <div className="flex items-center gap-[8px]">
            <button
              type="button"
              onClick={() => setShowTypeModal(true)}
              className="text-[12px] font-semibold text-black leading-normal cursor-pointer hover:underline p-0 border-0 bg-transparent"
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
              <span className="text-[12px] font-semibold ">{formatWithCommas(overallLoan) || '0.00'}</span>
            </p>
            <div className="relative">
              <div
                onClick={() => setShowAssociateModal(true)}
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
                      setOverallLoan(0);
                      setLoanAmount('');
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

          {/* Purpose */}
          <div className="">
            <p className="flex justify-between items-center text-[12px] font-semibold text-black leading-normal mb-0.5">
              <span>{isTransfer ? 'From Purpose' : 'Purpose'}<span className="text-[#eb2f8e]">*</span></span>
              <span className="text-[12px] font-semibold">{formatWithCommas(loanAmount) || '0.00'}</span>
            </p>
            <div className="relative">
              <div
                onClick={() => setShowPurposeModal(true)}
                className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
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
                      setLoanAmount('');
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
          {isTransfer ? (
            <>
              <div className="">
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                  Transfer To<span className="text-[#eb2f8e]">*</span>
                </p>
                <div className="relative">
                  <div
                    onClick={() => setShowTransferToModal(true)}
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[32px] text-[12px] font-medium bg-white flex items-center cursor-pointer"
                    style={{
                      boxSizing: 'border-box',
                      color: transferSelection ? '#000' : '#9E9E9E'
                    }}
                  >
                    {transferSelection ? transferSelection.label : 'Select'}
                    {transferSelection ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTransferSelection(null);
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
              <div className="">
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                  Transfer Amount<span className="text-[#eb2f8e]">*</span>
                </p>
                <div className="relative">
                  <input
                    type="text"
                    value={formatWithCommas(amountGiven)}
                    onChange={handleAmountChange}
                    placeholder="Enter amount"
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[12px] text-[12px] font-medium bg-white focus:outline-none"
                    style={{
                      boxSizing: 'border-box',
                      color: amountGiven ? '#000' : '#9E9E9E'
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex gap-[10px] items-center">
              <div className="flex-1">
                <p className="text-[12px] font-semibold text-black leading-normal mb-0.5">
                  {selectedLoanType === 'Refund' ? 'Amount' : 'Amount Given'}<span className="text-[#eb2f8e]">*</span>
                </p>
                <div className="relative">
                  <input
                    type="text"
                    value={formatWithCommas(amountGiven)}
                    onChange={handleAmountChange}
                    placeholder="Enter amount"
                    className="w-full h-[32px] border border-[rgba(0,0,0,0.16)] rounded pl-[12px] pr-[12px] text-[12px] font-medium bg-white focus:outline-none"
                    style={{
                      boxSizing: 'border-box',
                      color: amountGiven ? '#000' : '#9E9E9E'
                    }}
                  />
                </div>
              </div>
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
          {(selectedLoanFile || existingFileUrl) && (
            <span className="text-[11px] font-medium text-[#666] break-words min-w-0 flex-1">
              {selectedLoanFile ? selectedLoanFile.name : existingFileName || 'Attached file'}
            </span>
          )}
        </div>
        {/* Loan Button */}
        <button
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            !selectedOption ||
            !purpose ||
            !amountGiven ||
            (isTransfer ? !transferSelection : !paymentMode)
          }
          className={`w-full h-[40px] font-semibold rounded text-[14px] leading-normal ${selectedOption &&
              purpose &&
              amountGiven &&
              (isTransfer ? transferSelection : paymentMode) &&
              !isSubmitting
              ? 'bg-black text-white'
              : 'bg-[#D9D9D9] text-black'
            }`}
        >
          {isSubmitting ? 'Submitting...' : editingLoanId ? 'Update' : selectedLoanType}
        </button>
      </div>

      {/* Loan Records - like ProjectAdvance: list for selected associate */}
      <div className="mt-3 w-full flex-1 min-h-0 flex flex-col">
        {!selectedOption ? (
          <div className="bg-white border border-[#E0E0E0] rounded-[8px] px-[16px] py-[24px] text-center">
            <p className="text-[12px] font-medium text-[#9E9E9E]">Please select an associate to view loan records.</p>
          </div>
        ) : !purpose ? (
          <div className="bg-white border border-[#E0E0E0] rounded-[8px] px-[16px] py-[24px] text-center">
            <p className="text-[12px] font-medium text-[#9E9E9E]">Please select a purpose to view loan records.</p>
          </div>
        ) : (() => {
          const filteredEntries = associateRecords
            .filter((e) => Number(e.from_purpose_id) === Number(purpose))
            .slice()
            .sort((a, b) => (Number(b.entry_no) || 0) - (Number(a.entry_no) || 0));

          if (filteredEntries.length === 0) {
            return (
              <div className="bg-white border border-[#E0E0E0] rounded-[8px] px-[16px] py-[24px] text-center">
                <p className="text-[12px] font-medium text-[#9E9E9E]">No records found for the selected associate and purpose.</p>
              </div>
            );
          }

          const getTypeCode = (t) => {
            switch (t) {
              case 'Refund': return 'RF';
              case 'Transfer': return 'TF';
              case 'Loan': return 'LN';
              default: return 'LN';
            }
          };
          const formatDateOnly = (d) => {
            if (!d) return '';
            const date = new Date(d);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
          };

          return (
            <div
              className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain touch-pan-y space-y-2 pb-2 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {filteredEntries.map((entry, index) => {
                const typeCode = getTypeCode(entry.type);
                const formattedDate = formatDateOnly(entry.timestamp || entry.createdAt || entry.created_at || entry.date);
                const transactionId = `${typeCode} - ${formattedDate} - ${entry.entry_no || ''}`;
                const amount = entry.type === 'Refund'
                  ? -(parseFloat(entry.loan_refund_amount) || 0)
                  : parseFloat(entry.amount) || 0;
                return (
                  <div
                    key={entry.loanPortalId || entry.id || index}
                    className="bg-white border border-[#E0E0E0] border-opacity-30 rounded-[8px] px-[12px] py-[8px] shadow-lg flex justify-between items-start gap-[8px]"
                  >
                    <div className="flex flex-col gap-[4px] flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-black">{transactionId}</p>
                      <p className="text-[11px] font-medium text-[#777777] truncate">
                        {purposeOptions.find((p) => Number(p.id) === Number(entry.from_purpose_id))?.label || ''}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-[4px] flex-shrink-0">
                      <span className={`text-[12px] font-semibold ${amount < 0 ? 'text-[#E4572E]' : 'text-[#007233]'}`}>
                        {amount < 0 ? '-' : ''}₹{Math.abs(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </span>
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
            <div
              className="flex-1 overflow-y-auto mb-[8px] px-[24px] min-h-[65vh] [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
            >
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
                          if (type !== 'Transfer') {
                            setTransferSelection(null);
                          }
                          if (type === 'Transfer') {
                            setPaymentMode('');
                          }
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
        fieldName={isTransfer ? 'From Purpose' : 'Purpose'}
        showStarIcon={false}
      />

      {/* Transfer To Modal */}
      <SelectVendorModal
        isOpen={showTransferToModal}
        onClose={() => setShowTransferToModal(false)}
        onSelect={(value) => {
          const selected = combinedTransferToOptions.find(opt => opt.label === value);
          if (selected) {
            setTransferSelection(selected);
          }
          setShowTransferToModal(false);
        }}
        selectedValue={transferSelection ? transferSelection.label : ''}
        options={combinedTransferToOptions.map(opt => opt.label)}
        fieldName="Transfer To"
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

      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={handleDateConfirm}
        initialDate={formattedDate}
      />

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

      {typeof document !== 'undefined' && paymentDetailsBottomSheet
        ? createPortal(paymentDetailsBottomSheet, document.body)
        : null}

      {typeof document !== 'undefined' && showAccountSelectModal
        ? createPortal(
          <SelectVendorModal
            isOpen={showAccountSelectModal}
            onClose={() => setShowAccountSelectModal(false)}
            onSelect={(value) => {
              setPaymentModalData(prev => ({ ...prev, accountNumber: value }));
              setShowAccountSelectModal(false);
            }}
            selectedValue={paymentModalData.accountNumber}
            options={accountNumberOptions}
            fieldName="Account Number"
            showStarIcon={false}
          />,
          document.body
        )
        : null}

      <ToastContainer position="top-center" autoClose={3000} theme="colored" />
    </div>
  );
};

export default LoanForm;
