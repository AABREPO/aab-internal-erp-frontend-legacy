import React, { useState, useEffect, useRef, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { useOrbitPageSync } from '../../utils/useOrbitPageSync';
import { useTabRefreshSignal } from '../../utils/useTabRefreshSignal';
import "jspdf-autotable";
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Filter from '../Images/TableFilter.svg'
import Search from '../Images/Searchnew.svg'
import Reload from '../Images/Clear.svg'
import Pdf from '../Images/pdf.png'
import XL from '../Images/sheets.png'
import edit from '../Images/Edit.svg';
import history from '../Images/History.svg';
import remove from '../Images/Delete.svg';
import {
  EDBC_IDS,
  DATABASE_TABLE_FILTER_SELECT_STYLES,
  getEdbcColumnConfig,
  useEdbcExpandedCells,
  EdbcTableHeaderRow,
  EdbcTableFilterRow,
  EdbcTableBodyRow,
  EdbcColumnHeader,
  EdbcTimestampFilter,
  EdbcDateFilter,
  EdbcSelectFilter,
  EdbcTextInputFilter,
  EdbcEmptyFilterCell,
  EdbcTotalAmountFilter,
  EdbcTimestampBodyCell,
  EdbcDateBodyCell,
  EdbcExpandableBodyCell,
  EDBC_TABLE_EDGE_TABLE_CLASS,
} from '../ExpensesEntry/databaseExpensesSharedColumns';
import {
  clearLinkedAdvancePortalForLoanDelete,
  formatWeeklyBillDeleteMessage,
} from '../../utils/advancePortalWeeklyPaymentBill';
import {
  buildLoanEditPayloadFromForm,
  clearLoanPortalRecordsOnDelete,
  fetchLoanEditPaymentModalData,
  getLoanPortalDisplayAmount,
  isLoanChequePaymentMode,
  performLoanPortalEditWithSync,
  shouldPromptLoanEditPaymentModal,
} from '../../utils/loanPortalWeeklyPaymentBill';
import { notifyOrbitModuleDataChanged } from '../../utils/orbitProjectDataSync';
import AdvancePortalEditPaymentModal from '../Advance Portal/AdvancePortalEditPaymentModal';

const LOAN_FILTER_OPTION_MIN_HEIGHT_PX = 36;
const LoanDatabase = ({ username, userRoles = [], paymentModeOptions = [], refreshSignal, isActive = true }) => {
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [combinedOptions, setCombinedOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [projectClientNamesById, setProjectClientNamesById] = useState({});
  const [projectClientNamesByName, setProjectClientNamesByName] = useState({});
  const [loanData, setLoanData] = useState([]);
  const [selectTimeStampDate, setSelectTimeStampDate] = useState('');
  const [selectDate, setSelectDate] = useState('');
  const [selectContractororVendorName, setSelectContractororVendorName] = useState('');
  const [selectProjectName, setSelectProjectName] = useState('');
  const [selectType, setSelectType] = useState('');
  const [selectMode, setSelectMode] = useState('');
  const [selectTransfer, setSelectTransfer] = useState('');
  const [selectDescription, setSelectDescription] = useState('');
  const [selectSourceFrom, setSelectSourceFrom] = useState('');
  const [selectBranch, setSelectBranch] = useState('');
  const [selectEntryNo, setSelectEntryNo] = useState('');
  const [overallSearch, setOverallSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showTimestampDatePicker, setShowTimestampDatePicker] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editSelectedType, setEditSelectedType] = useState('Loan');
  const [editSelectedOption, setEditSelectedOption] = useState(null);
  const [editSelectedSite, setEditSelectedSite] = useState(null);
  const [editPurpose, setEditPurpose] = useState('');
  const [editTransferSelection, setEditTransferSelection] = useState(null);
  const [editAmountGiven, setEditAmountGiven] = useState('');
  const [editTransferAmount, setEditTransferAmount] = useState('');
  const [editPaymentMode, setEditPaymentMode] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
  const [isEditPaymentSubmitting, setIsEditPaymentSubmitting] = useState(false);
  const [editPaymentModalData, setEditPaymentModalData] = useState({
    chequeNo: '',
    chequeDate: '',
    transactionNumber: '',
    accountNumber: '',
  });
  const [accountDetails, setAccountDetails] = useState([]);
  const pendingLoanUpdateRef = useRef(null);
  const [combinedSitePurposeOptions, setCombinedSitePurposeOptions] = useState([]);
  const [laboursList, setLaboursList] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [loanPortalAudits, setLoanPortalAudits] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const scroll = useRef({ left: 0, top: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);
  const lastMove = useRef({ time: 0, x: 0, y: 0 });
  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    start.current = { x: e.clientX, y: e.clientY };
    scroll.current = {
      left: scrollRef.current.scrollLeft,
      top: scrollRef.current.scrollTop,
    };
    lastMove.current = {
      time: Date.now(),
      x: e.clientX,
      y: e.clientY,
    };
    scrollRef.current.style.cursor = 'grabbing';
    scrollRef.current.style.userSelect = 'none';
    cancelMomentum();
  };
  const handleMouseMove = (e) => {
    if (!isDragging.current || !scrollRef.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    const now = Date.now();
    const dt = now - lastMove.current.time || 16;
    velocity.current = {
      x: (e.clientX - lastMove.current.x) / dt,
      y: (e.clientY - lastMove.current.y) / dt,
    };
    scrollRef.current.scrollLeft = scroll.current.left - dx;
    scrollRef.current.scrollTop = scroll.current.top - dy;
    lastMove.current = {
      time: now,
      x: e.clientX,
      y: e.clientY,
    };
  };
  const handleMouseUp = () => {
    if (!isDragging.current || !scrollRef.current) return;
    isDragging.current = false;
    scrollRef.current.style.cursor = '';
    scrollRef.current.style.userSelect = '';
    applyMomentum();
  };
  const cancelMomentum = () => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
  };
  const applyMomentum = () => {
    if (!scrollRef.current) return;
    const friction = 0.95;
    const minVelocity = 0.1;
    const step = () => {
      const { x, y } = velocity.current;
      if (!scrollRef.current) return;
      if (Math.abs(x) > minVelocity || Math.abs(y) > minVelocity) {
        scrollRef.current.scrollLeft -= x * 20;
        scrollRef.current.scrollTop -= y * 20;
        velocity.current.x *= friction;
        velocity.current.y *= friction;
        animationFrame.current = requestAnimationFrame(step);
      } else {
        cancelMomentum();
      }
    };
    animationFrame.current = requestAnimationFrame(step);
  };
  const formatWithCommas = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  const handleEditTransferAmountChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, "");
    if (!isNaN(rawValue)) {
      setEditTransferAmount(rawValue);
    }
  };
  const formatDateOnly = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  const [purposeOptions, setPurposeOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  // Use paymentModeOptions from props, fallback to default if not provided
  const defaultPaymentModeOptions = useMemo(() => [
    { id: 1, value: 'Cash', label: 'Cash' },
    { id: 2, value: 'GPay', label: 'GPay' },
    { id: 3, value: 'PhonePe', label: 'PhonePe' },
    { id: 4, value: 'Net Banking', label: 'Net Banking' },
    { id: 5, value: 'Cheque', label: 'Cheque' },
    { id: 6, value: 'Advance Transfer', label: 'Advance Transfer' }
  ], []);

  const [backendPaymentModeOptions, setBackendPaymentModeOptions] = useState([]);
  const finalPaymentModeOptions = backendPaymentModeOptions.length > 0 ? backendPaymentModeOptions : paymentModeOptions.length > 0 ? paymentModeOptions : defaultPaymentModeOptions;

  useEffect(() => {
    const fetchPaymentModes = async () => {
      try {
        const response = await fetch('https://backendaab.in/demoAabuildersDash/api/payment_mode/getAll');
        if (response.ok) {
          const data = await response.json();
          const options = Array.isArray(data)
            ? data
              .filter(mode => mode.modeOfPayment)
              .map(mode => ({ value: mode.modeOfPayment, label: mode.modeOfPayment }))
            : [];
          if (!options.some(option => option.value === 'Advance Transfer')) {
            options.push({ value: 'Advance Transfer', label: 'Advance Transfer' });
          }
          setBackendPaymentModeOptions(options);
        }
      } catch (error) {
        console.error('Error fetching payment modes:', error);
      }
    };
    fetchPaymentModes();
  }, []);

  // Get unique Associate names from loanData for filter dropdown (only show what exists in table)
  const uniqueAssociateOptions = useMemo(() => {
    const associateSet = new Set();

    // Helper function to get client name by project ID
    const getClientNameByProjectId = (projectId) => {
      if (projectId === null || projectId === undefined) return "";
      const directMatch = projectClientNamesById[String(projectId)];
      if (directMatch) return directMatch;
      const siteOption = siteOptions.find(s => String(s.id) === String(projectId));
      const projectName = siteOption?.value || "";
      if (!projectName) return "";
      return projectClientNamesByName[projectName.trim().toLowerCase()] || "";
    };

    loanData.forEach(entry => {
      // Get associate name using the same logic as getAssociateName
      const clientName = getClientNameByProjectId(entry.project_id);
      const vendorName = entry.vendor_id
        ? vendorOptions.find(v => v.id === entry.vendor_id)?.value || ""
        : "";
      const contractorName = entry.contractor_id
        ? contractorOptions.find(c => c.id === entry.contractor_id)?.value || ""
        : "";

      const associateName = clientName || vendorName || contractorName || "";
      if (associateName) {
        associateSet.add(associateName);
      }
    });

    // Convert to array and format for Select component
    return Array.from(associateSet)
      .sort()
      .map(name => ({
        value: name,
        label: name
      }));
  }, [loanData, vendorOptions, contractorOptions, projectClientNamesById, projectClientNamesByName, siteOptions]);

  const associateFilterOptions = useMemo(() => (
    uniqueAssociateOptions.length > 0 ? uniqueAssociateOptions : (clientOptions.length ? clientOptions : combinedOptions)
  ), [uniqueAssociateOptions, clientOptions, combinedOptions]);

  // Get unique Type values from loanData for filter dropdown
  const uniqueTypes = useMemo(() => {
    const types = [...new Set(loanData.map(entry => entry.type).filter(Boolean))];
    return types.sort();
  }, [loanData]);

  // Get unique Payment Mode values from loanData for filter dropdown
  const uniquePaymentModes = useMemo(() => {
    const modes = [...new Set(loanData.map(entry => entry.loan_payment_mode).filter(Boolean))];
    return modes.sort();
  }, [loanData]);

  const uniqueSourceFromOptions = useMemo(() => {
    const sources = [...new Set(loanData.map((entry) => entry.source).filter(Boolean))];
    return sources.sort().map((s) => ({ value: s, label: s }));
  }, [loanData]);

  const uniqueEntryNoOptions = useMemo(() => {
    const entryNos = [...new Set(loanData.map((entry) => entry.entry_no).filter((n) => n != null && n !== ''))];
    return entryNos
      .sort((a, b) => Number(b) - Number(a))
      .map((n) => ({ value: String(n), label: String(n) }));
  }, [loanData]);

  const uniqueTransferToOptions = useMemo(() => {
    const transferSet = new Set();
    loanData.forEach((entry) => {
      if (entry.type !== 'Transfer') return;
      const name = entry.to_purpose_id
        ? purposeOptions.find((p) => p.id === entry.to_purpose_id)?.value
        : siteOptions.find((s) => s.id === entry.transfer_Project_id)?.value;
      if (name) transferSet.add(name);
    });
    return Array.from(transferSet).sort().map((name) => ({ value: name, label: name }));
  }, [loanData, purposeOptions, siteOptions]);

  // Get unique Project/Purpose names from loanData for filter dropdown (only show what exists in table)
  const uniqueProjectPurposeOptions = useMemo(() => {
    const projectPurposeSet = new Set();

    loanData.forEach(entry => {
      // Get project name if project_id exists
      if (entry.project_id) {
        const siteOption = siteOptions.find(s => String(s.id) === String(entry.project_id));
        const projectName = siteOption?.value || "";
        if (projectName) {
          projectPurposeSet.add(projectName);
        }
      }

      // Get purpose name if from_purpose_id exists
      if (entry.from_purpose_id) {
        const purposeOption = purposeOptions.find(p => p.id === entry.from_purpose_id);
        if (purposeOption && purposeOption.value) {
          projectPurposeSet.add(purposeOption.value);
        }
      }
    });

    // Convert to array and format for Select component
    return Array.from(projectPurposeSet)
      .sort()
      .map(name => ({
        value: name,
        label: name
      }));
  }, [loanData, siteOptions, purposeOptions]);

  const purposeTransferFilterSelectStyles = useMemo(() => ({
    ...DATABASE_TABLE_FILTER_SELECT_STYLES,
    option: (provided, state) => ({
      ...DATABASE_TABLE_FILTER_SELECT_STYLES.option(provided, state),
      height: 'auto',
      minHeight: `${LOAN_FILTER_OPTION_MIN_HEIGHT_PX}px`,
      paddingTop: '6px',
      paddingBottom: '6px',
      lineHeight: '1.4',
      whiteSpace: 'normal',
      alignItems: 'flex-start',
    }),
  }), []);

  const customStyles = useMemo(() => ({
    control: (provided, state) => ({
      ...provided,
      borderWidth: '2px',
      lineHeight: '20px',
      fontSize: '12px',
      height: '45px',
      borderRadius: '8px',
      borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.3)' : 'rgba(191, 152, 83, 0.3)',
      boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.3)' : 'none',
      minWidth: '100%',
      maxWidth: '100%',
    }),
    clearIndicator: (provided) => ({
      ...provided,
      cursor: 'pointer',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      maxHeight: '300px',
      minWidth: '100%',
      width: '100%',
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
      color: '#000',
      maxWidth: 'calc(100% - 20px)',
    }),
    placeholder: (provided) => ({
      ...provided,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),
    option: (provided, state) => ({
      ...provided,
      fontWeight: '300',
      fontSize: '14px',
      backgroundColor: state.isSelected
        ? 'rgba(191, 152, 83, 0.3)'
        : state.isFocused
          ? 'rgba(191, 152, 83, 0.1)'
          : 'white',
      color: 'black',
      textAlign: 'left',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),
  }), []);
  const getVendorName = (id) =>
    vendorOptions.find(v => v.id === id)?.value || "";
  const getContractorName = (id) =>
    contractorOptions.find(c => c.id === id)?.value || "";
  const getEmployeeName = (id) =>
    employeeOptions.find(c => c.id === id)?.value || "";
  const getLabourName = (id) =>
    laboursList.find(l => l.id === id)?.value || "";
  const getSiteName = (id) =>
    siteOptions.find(s => String(s.id) === String(id))?.value || "";
  const getBranchName = (id) =>
    branchOptions.find(b => String(b.id) === String(id))?.branch || "";

  const loanBranchFilterOptions = useMemo(() => {
    const branchIds = [
      ...new Set(
        loanData
          .map((entry) => entry.branch_id ?? entry.branchId)
          .filter((id) => id != null && id !== '')
      ),
    ];
    return branchIds
      .map((id) => ({
        value: String(id),
        label: getBranchName(id) || String(id),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [loanData, branchOptions]);

  const resolveLoanPurposeName = (entry) =>
    getSiteName(entry.project_id) ||
    purposeOptions.find((p) => p.id === entry.from_purpose_id)?.value ||
    entry.from_purpose_id ||
    '';

  const resolveLoanTransferToName = (entry) => {
    if (entry.type !== 'Transfer') return '';
    return entry.to_purpose_id
      ? purposeOptions.find((purpose) => purpose.id === entry.to_purpose_id)?.value || ''
      : siteOptions.find((site) => site.id === entry.transfer_Project_id)?.value || '';
  };

  const getClientNameByProjectId = (projectId) => {
    if (projectId === null || projectId === undefined) return "";
    const directMatch = projectClientNamesById[String(projectId)];
    if (directMatch) return directMatch;
    const projectName = getSiteName(projectId);
    if (!projectName) return "";
    return projectClientNamesByName[projectName.trim().toLowerCase()] || "";
  };
  const getAssociateName = (entry) => {
    return getClientNameByProjectId(entry.project_id) ||
      (entry.vendor_id
        ? getVendorName(entry.vendor_id)
        : getContractorName(entry.contractor_id)) ||
      (entry.employee_id
        ? getEmployeeName(entry.employee_id)
        : getLabourName(entry.labour_id)) ||
      "";
  };
  const totalLoanAmount = loanData
    .filter(entry => entry.type === "Loan")
    .reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  const totalTransferAmount = loanData
    .filter(entry => entry.type === "Transfer")
    .reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
  const totalRefundAmount = loanData
    .filter(entry => entry.type === "Refund")
    .reduce((sum, entry) => sum + (Number(entry.loan_refund_amount) || 0), 0);
  const totalPaidAmount = loanData
    .reduce((sum, entry) => sum + (Number(entry.paid_amount) || 0), 0);
  const totalRemainingAmount = totalLoanAmount - totalPaidAmount;
  useEffect(() => {
    return () => cancelMomentum();
  }, []);
  useEffect(() => {
    const fetchVendorNames = async () => {
      try {
        const response = await fetch("https://backendaab.in/demoAabuilderDash/api/vendor_Names/getAll", {
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
        const response = await fetch("https://backendaab.in/demoAabuilderDash/api/contractor_Names/getAll", {
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
    fetchLaboursList();
  }, []);
  const fetchLaboursList = async () => {
    try {
      const response = await fetch('https://backendaab.in/demoAabuildersDash/api/labours-details/getAll');
      if (response.ok) {
        const data = await response.json();
        const formattedData = data.map(item => ({
          value: item.labour_name,
          label: item.labour_name,
          id: item.id,
          type: "Labour",
          salary: item.labour_salary,
          extra: item.extra_amount
        }));
        setLaboursList(formattedData);
      } else {
        console.log('Error fetching Labour names.');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error fetching Labour names.');
    }
  };
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const response = await fetch("https://backendaab.in/demoAabuildersDash/api/employee_details/getAll", {
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
    fetchEmployeeDetails();
  }, []);
  useEffect(() => {
    setCombinedOptions([...vendorOptions, ...contractorOptions]);
  }, [vendorOptions, contractorOptions]);
  useEffect(() => {
    setCombinedSitePurposeOptions([...siteOptions, ...purposeOptions]);
  }, [siteOptions, purposeOptions]);
  // Fetch purpose options from API (align with LoanPortal.js)
  useEffect(() => {
    const fetchPurposeOptions = async () => {
      try {
        const response = await fetch('https://backendaab.in/demoAabuildersDash/api/loan-purposes/getAll', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText);
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
        console.error('Error fetching purpose options: ', error);
        setPurposeOptions([]);
      }
    };
    fetchPurposeOptions();
  }, []);
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await fetch("https://backendaab.in/demoAabuilderDash/api/project_Names/getAll", {
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
          sNo: item.siteNo,
          type: 'Site',
        }));
        setSiteOptions(formattedData);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchSites();
  }, []);
  useEffect(() => {
    const fetchProjectClients = async () => {
      try {
        const response = await fetch("https://backendaab.in/demoAabuilderDash/api/projects/getAll", {
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
        const idMap = {};
        const nameMap = {};
        const clientMap = new Map();
        data.forEach((project) => {
          const projectId = project?.id ?? project?.projectId ?? null;
          const projectName = (project?.projectName || project?.projectReferenceName || "").trim();
          const owners = Array.isArray(project?.ownerDetailsList)
            ? project.ownerDetailsList
            : Array.isArray(project?.ownerDetails)
              ? project.ownerDetails
              : [];
          const ownerNames = owners
            .map(owner => owner?.clientName?.trim())
            .filter(Boolean);
          const displayName = ownerNames.join(", ") || project?.clientName || project?.ownerName || "";
          if (displayName) {
            if (projectId !== null && projectId !== undefined) {
              idMap[String(projectId)] = displayName;
            }
            if (projectName) {
              nameMap[projectName.toLowerCase()] = displayName;
            }
            ownerNames.forEach(name => {
              const normalized = name.toLowerCase();
              if (!clientMap.has(normalized)) {
                clientMap.set(normalized, { value: name, label: name, type: 'Client' });
              }
            });
          }
        });
        setProjectClientNamesById(idMap);
        setProjectClientNamesByName(nameMap);
        setClientOptions(Array.from(clientMap.values()));
      } catch (error) {
        console.error("Error fetching project clients: ", error);
        setProjectClientNamesById({});
        setProjectClientNamesByName({});
        setClientOptions([]);
      }
    };
    fetchProjectClients();
  }, []);
  const fetchLoanData = async () => {
    try {
      const response = await fetch('https://backendaab.in/demoAabuildersDash/api/loans/all');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setLoanData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching loan portal data:', error);
    }
  };

  useEffect(() => {
    fetchLoanData();
  }, []);
  useOrbitPageSync('loan', fetchLoanData, []);

  useTabRefreshSignal(refreshSignal, isActive, fetchLoanData);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const response = await fetch('https://backendaab.in/demoAabuildersDash/api/account-details/getAll');
        if (response.ok) {
          const data = await response.json();
          setAccountDetails(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    };
    fetchAccountDetails();
  }, []);
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch('https://backendaab.in/demoAabuildersDash/api/branch/getAll', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to fetch branches');
        const data = await response.json();
        setBranchOptions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching branches:', error);
        setBranchOptions([]);
      }
    };
    fetchBranches();
  }, []);
  const filteredData = loanData.filter((entry) => {
    if (selectTimeStampDate) {
      const selectedDate = new Date(selectTimeStampDate);
      const entryTimestamp = new Date(entry.timestamp);
      if (selectedDate.toDateString() !== entryTimestamp.toDateString()) {
        return false;
      }
    }
    if (selectDate) {
      const [year, month, day] = selectDate.split("-");
      const formattedSelectDate = `${parseInt(day)}-${parseInt(month)}-${year}`;
      const entryDateObj = new Date(entry.date);
      const formattedEntryDate = `${entryDateObj.getDate()}-${entryDateObj.getMonth() + 1}-${entryDateObj.getFullYear()}`;
      if (formattedEntryDate !== formattedSelectDate) return false;
    }
    if (selectContractororVendorName) {
      const name = getAssociateName(entry) || "";
      if (name.toLowerCase() !== selectContractororVendorName.toLowerCase())
        return false;
    }
    if (selectProjectName) {
      const projectName = getSiteName(entry.project_id) || "";
      const purposeName = purposeOptions.find(p => p.id === entry.from_purpose_id)?.value || "";
      if (projectName.toLowerCase() !== selectProjectName.toLowerCase() &&
        purposeName.toLowerCase() !== selectProjectName.toLowerCase())
        return false;
    }
    if (selectType) {
      if (entry.type?.toLowerCase() !== selectType.toLowerCase()) return false;
    }
    if (selectMode) {
      if (entry.loan_payment_mode?.toLowerCase() !== selectMode.toLowerCase()) return false;
    }
    if (selectTransfer) {
      const transferName = resolveLoanTransferToName(entry) || '';
      if (transferName.toLowerCase() !== selectTransfer.toLowerCase()) return false;
    }
    if (selectDescription.trim()) {
      if (!String(entry.description ?? '').toLowerCase().includes(selectDescription.toLowerCase().trim())) return false;
    }
    if (selectSourceFrom) {
      if (String(entry.source || '').toLowerCase() !== selectSourceFrom.toLowerCase()) return false;
    }
    if (selectBranch) {
      const branchVal = entry.branch_id ?? entry.branchId ?? '';
      if (String(branchVal) !== String(selectBranch)) return false;
    }
    if (selectEntryNo) {
      if (!String(entry.entry_no ?? '').includes(selectEntryNo)) return false;
    }
    if (overallSearch.trim()) {
      const q = overallSearch.toLowerCase().trim();
      const searchable = [
        entry.timestamp ? formatDate(entry.timestamp) : '',
        formatDateOnly(entry.date),
        getAssociateName(entry),
        resolveLoanPurposeName(entry),
        resolveLoanTransferToName(entry),
        entry.amount,
        entry.loan_refund_amount,
        entry.type,
        entry.description,
        entry.loan_payment_mode,
        entry.source,
        getBranchName(entry.branch_id ?? entry.branchId),
        entry.entry_no,
      ]
        .map((v) => String(v ?? '').toLowerCase())
        .join(' ');
      if (!searchable.includes(q)) return false;
    }
    return true;
  });
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };
  const sortedData = React.useMemo(() => {
    let sortableData = [...filteredData];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        let aValue, bValue;
        switch (sortConfig.key) {
          case 'date':
            aValue = new Date(a.date);
            bValue = new Date(b.date);
            break;
          case 'vendor':
            aValue = a.vendor_id ? getVendorName(a.vendor_id) : getContractorName(a.contractor_id);
            bValue = b.vendor_id ? getVendorName(b.vendor_id) : getContractorName(b.contractor_id);
            break;
          case 'project':
            aValue = getSiteName(a.project_id);
            bValue = getSiteName(b.project_id);
            break;
          case 'type':
            aValue = a.type || '';
            bValue = b.type || '';
            break;
          case 'mode':
            aValue = a.loan_payment_mode || '';
            bValue = b.loan_payment_mode || '';
            break;
          default:
            return 0;
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // Sort by newest first - prioritize by entry_no descending (6, 5, 4, 3, 2, 1)
      sortableData.sort((a, b) => {
        const entryNoA = parseInt(a.entry_no) || 0;
        const entryNoB = parseInt(b.entry_no) || 0;

        // Primary sort: entry_no descending (higher entry_no = newer)
        if (entryNoB !== entryNoA) {
          return entryNoB - entryNoA;
        }

        // Secondary sort: If entry_no is same, use timestamp if available
        if (a.timestamp && b.timestamp) {
          const timestampA = new Date(a.timestamp);
          const timestampB = new Date(b.timestamp);
          return timestampB - timestampA;
        }

        // Tertiary sort: If no timestamp, use date (newest first)
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      });
    }
    return sortableData;
  }, [filteredData, sortConfig]);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);
  const totals = useMemo(
    () =>
      filteredData.reduce(
        (acc, entry) => {
          if (entry.type === 'Loan' || entry.type === 'Transfer') {
            acc.loan += Number(entry.amount) || 0;
          }
          if (entry.type === 'Refund') {
            acc.refund += Number(entry.loan_refund_amount) || 0;
          }
          return acc;
        },
        { loan: 0, refund: 0 }
      ),
    [filteredData]
  );
  const { expandedCells, toggleExpandedCell } = useEdbcExpandedCells();
  const edbc4Config = getEdbcColumnConfig(EDBC_IDS.EDBC4);
  const edbc8Config = getEdbcColumnConfig(EDBC_IDS.EDBC8);
  const edbc19TdClass = getEdbcColumnConfig(EDBC_IDS.EDBC19)?.tdClass || '';
  const mapLoanSortKeyToEdbc = (key) => {
    if (key === 'project') return 'siteName';
    if (key === 'entryNo') return 'eno';
    if (key === 'mode') return 'paymentMode';
    if (key === 'type') return 'accountType';
    return key;
  };
  const handleEdbcSort = (edbcField) => {
    const fieldToKey = {
      siteName: 'project',
      eno: 'entryNo',
      paymentMode: 'mode',
      accountType: 'type',
    };
    handleSort(fieldToKey[edbcField] || edbcField);
  };
  const resolveEdbcSortField = (loanSortKey) =>
    sortConfig.key === loanSortKey ? mapLoanSortKeyToEdbc(loanSortKey) : '';
  const formatLoanAmount = (value) =>
    value != null && value !== ''
      ? Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 })
      : '';
  useEffect(() => {
    setCurrentPage(1);
  }, [selectTimeStampDate, selectDate, selectContractororVendorName, selectProjectName, selectTransfer, selectType, selectMode, selectDescription, selectSourceFrom, selectBranch, selectEntryNo, overallSearch]);

  const clearFilters = () => {
    setSelectTimeStampDate('');
    setSelectDate('');
    setSelectContractororVendorName('');
    setSelectProjectName('');
    setSelectTransfer('');
    setSelectType('');
    setSelectMode('');
    setSelectDescription('');
    setSelectSourceFrom('');
    setSelectBranch('');
    setSelectEntryNo('');
    setOverallSearch('');
  };
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };
  const exportPDF = () => {
    const doc = new jsPDF("l", "pt", "a4");
    const headers = [
      [
        "S.No",
        "Timestamp",
        "Date",
        "Associate",
        "Purpose",
        "Transfer To",
        "Loan",
        "Refund",
        "Type",
        "Description",
        "Source",
        "Branch",
        "Mode",
        "E.No"
      ]
    ];
    const rows = sortedData.map((entry, index) => {
      // Get purpose (project_id or from_purpose_id)
      const purposeValue = getSiteName(entry.project_id) ||
        purposeOptions.find(p => p.id === entry.from_purpose_id)?.value ||
        entry.from_purpose_id || "";

      // Get transfer to destination
      const transferTo = entry.type === "Transfer"
        ? (entry.to_purpose_id
          ? purposeOptions.find(purpose => purpose.id === entry.to_purpose_id)?.value || ""
          : siteOptions.find(site => site.id === entry.transfer_Project_id)?.value || "")
        : "";

      // Get loan amount (only for Loan/Transfer type)
      const loanAmount = (entry.type === "Loan" || entry.type === "Transfer") && entry.amount
        ? Number(entry.amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "";

      // Get refund amount (only for Refund type)
      const refundAmount = entry.type === "Refund" && entry.loan_refund_amount
        ? Number(entry.loan_refund_amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "";

      // Get payment mode
      const paymentMode = finalPaymentModeOptions.find(opt => opt.value === entry.loan_payment_mode)?.label ||
        entry.loan_payment_mode || '';

      return [
        index + 1,
        entry.timestamp ? formatDate(entry.timestamp) : "",
        formatDateOnly(entry.date),
        getAssociateName(entry),
        purposeValue,
        transferTo,
        loanAmount,
        refundAmount,
        entry.type || "",
        entry.description || "",
        entry.source || "",
        getBranchName(entry.branch_id ?? entry.branchId ?? '') || "",
        paymentMode,
        entry.entry_no || ""
      ];
    });

    doc.setFontSize(12);
    doc.text("Loan Data Table", 40, 30);
    doc.autoTable({
      head: headers,
      body: rows,
      startY: 50,
      styles: {
        fontSize: 8,
        cellPadding: 4,
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0],
        fillColor: null
      },
      headStyles: {
        fillColor: null,
        textColor: [0, 0, 0],
        fontStyle: "bold",
        lineWidth: 0.5,
        lineColor: [0, 0, 0]
      },
      alternateRowStyles: {
        fillColor: null
      },
      columnStyles: {
        6: { halign: 'right' }, // Loan
        7: { halign: 'right' }  // Refund
      }
    });
    doc.save("LoanData.pdf");
  };
  const exportCSV = () => {
    const csvHeaders = [
      "S.No",
      "Timestamp",
      "Date",
      "Associate",
      "Purpose",
      "Transfer To",
      "Loan",
      "Refund",
      "Type",
      "Description",
      "Source",
      "Branch",
      "Mode",
      "E.No"
    ];
    const csvRows = sortedData.map((entry, index) => {
      // Get purpose (project_id or from_purpose_id)
      const purposeValue = getSiteName(entry.project_id) ||
        purposeOptions.find(p => p.id === entry.from_purpose_id)?.value ||
        entry.from_purpose_id || "";

      // Get transfer to destination
      const transferTo = entry.type === "Transfer"
        ? (entry.to_purpose_id
          ? purposeOptions.find(purpose => purpose.id === entry.to_purpose_id)?.value || ""
          : siteOptions.find(site => site.id === entry.transfer_Project_id)?.value || "")
        : "";

      // Get loan amount (only for Loan/Transfer type)
      const loanAmount = (entry.type === "Loan" || entry.type === "Transfer") && entry.amount
        ? Number(entry.amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "";

      // Get refund amount (only for Refund type)
      const refundAmount = entry.type === "Refund" && entry.loan_refund_amount
        ? Number(entry.loan_refund_amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "";

      // Get payment mode
      const paymentMode = finalPaymentModeOptions.find(opt => opt.value === entry.loan_payment_mode)?.label ||
        entry.loan_payment_mode || '';

      return [
        index + 1,
        entry.timestamp ? formatDate(entry.timestamp) : "",
        formatDateOnly(entry.date),
        getAssociateName(entry),
        purposeValue,
        transferTo,
        loanAmount,
        refundAmount,
        entry.type || "",
        entry.description || "",
        entry.source || "",
        getBranchName(entry.branch_id ?? entry.branchId ?? '') || "",
        paymentMode,
        entry.entry_no || ""
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
    link.setAttribute("download", "LoanData.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const fetchAuditDetails = async (loanPortalId) => {
    try {
      const response = await fetch(`https://backendaab.in/demoAabuildersDash/api/loans/audit/history/${loanPortalId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setLoanPortalAudits(data);
      setShowHistoryModal(true);
    } catch (error) {
      console.error("Error fetching audit details:", error);
      toast.error("Failed to fetch audit history", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };
  const handleDelete = async (idToDelete) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this record?");
    if (!confirmDelete) return;
    try {
      const record = loanData.find(r => r.loanPortalId === idToDelete || r.id === idToDelete);
      if (!record) {
        console.warn('Record not found for ID:', idToDelete);
        toast.error("Record not found", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
        return;
      }

      const { clearedRecords, weeklyBillDelete } = await clearLoanPortalRecordsOnDelete(
        idToDelete,
        record,
        loanData,
        username
      );

      try {
        await clearLinkedAdvancePortalForLoanDelete(clearedRecords, username);
      } catch (linkErr) {
        console.error('Failed to clear linked advance portal(s) for loan delete:', linkErr);
        toast.warning('Loan record cleared, but linked advance portal entry could not be fully removed.', {
          position: 'top-center',
          autoClose: 4000,
          theme: 'colored',
        });
      }

      await fetchLoanData();
      notifyOrbitModuleDataChanged('loan');
      notifyOrbitModuleDataChanged('portal');
      const billDeleteMessage = formatWeeklyBillDeleteMessage(
        weeklyBillDelete.deletedCount,
        weeklyBillDelete.failedCount
      );
      toast.success(`Record deleted successfully.${billDeleteMessage}`, {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || "Failed to delete record!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };
  const buildLoanEditPayload = (currentEntry) =>
    buildLoanEditPayloadFromForm({
      editingId,
      editSelectedType,
      editFormData,
      editTransferSelection,
      editSelectedOption,
      editPurpose,
      editTransferAmount,
      editPaymentMode,
      editDescription,
      currentEntry,
    });

  const performLoanUpdate = async (payload, modalPaymentData = null) => {
    const currentEntry = loanData.find(
      (entry) => String(entry.loanPortalId || entry.id) === String(editingId)
    );

    const { advanceSyncFailed } = await performLoanPortalEditWithSync({
      editingId,
      payload,
      editedBy: username,
      currentEntry,
      siteOptions,
      selectedOption: editSelectedOption,
      modalPaymentData,
    });
    if (advanceSyncFailed) {
      toast.warning('Loan updated, but linked advance portal entry could not be synced.', {
        position: 'top-center',
        autoClose: 4000,
        theme: 'colored',
      });
    }

    await fetchLoanData();
    notifyOrbitModuleDataChanged('loan');
    notifyOrbitModuleDataChanged('portal');
    setShowEditPaymentModal(false);
    pendingLoanUpdateRef.current = null;
    setIsEditModalOpen(false);
    toast.success('Entry updated successfully!', {
      position: 'top-center',
      autoClose: 3000,
      theme: 'colored',
    });
  };

  const handleUpdate = async () => {
    try {
      const currentEntry = loanData.find(
        (entry) => String(entry.loanPortalId || entry.id) === String(editingId)
      );
      if (!currentEntry) {
        toast.error('Record not found.', { position: 'top-center', autoClose: 3000, theme: 'colored' });
        return;
      }

      const payload = buildLoanEditPayload(currentEntry);

      if (shouldPromptLoanEditPaymentModal(payload)) {
        pendingLoanUpdateRef.current = { payload };
        const modalData = await fetchLoanEditPaymentModalData(editingId, accountDetails);
        setEditPaymentModalData(modalData);
        setShowEditPaymentModal(true);
        return;
      }

      await performLoanUpdate(payload);
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to update entry!', {
        position: 'top-center',
        autoClose: 3000,
        theme: 'colored',
      });
    }
  };

  const handleEditPaymentModalSubmit = async () => {
    if (!editPaymentModalData.accountNumber) {
      alert('Please select account number.');
      return;
    }
    const pendingPaymentMode =
      pendingLoanUpdateRef.current?.payload?.loan_payment_mode ?? editPaymentMode;
    if (
      isLoanChequePaymentMode(pendingPaymentMode) &&
      (!editPaymentModalData.chequeNo || !editPaymentModalData.chequeDate)
    ) {
      alert('Please enter cheque number and date.');
      return;
    }
    const pending = pendingLoanUpdateRef.current;
    if (!pending?.payload || !editingId) return;

    setIsEditPaymentSubmitting(true);
    try {
      await performLoanUpdate(pending.payload, editPaymentModalData);
    } catch (err) {
      console.error('Loan payment modal update error:', err);
      toast.error(err.message || 'Failed to update entry!', {
        position: 'top-center',
        autoClose: 3000,
        theme: 'colored',
      });
    } finally {
      setIsEditPaymentSubmitting(false);
    }
  };
  return (
    <body>
      <div className='bg-[#FAF6ED]'>
        <div className='max-w-[1850px] bg-white rounded-md ml-10 h-auto mr-10 px-4 text-left flex items-center gap-6'>
          <div className='w-full xl:w-auto xl:justify-between'>
            <div className='flex flex-wrap gap-[12px] p-[18px]'>
              <div className=''>
                <label className='block mb-[8px] font-semibold'>Loan Amount</label>
                <input
                  className='w-full h-[40px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2'
                  value={`₹${totalLoanAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                  readOnly
                />
              </div>
              <div className=''>
                <label className='block mb-[8px] font-semibold'>Transfer Amount</label>
                <input
                  className='w-full h-[40px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2'
                  value={`₹${totalTransferAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                  readOnly
                />
              </div>
              <div className=''>
                <label className='block mb-[8px] font-semibold'>Refund Amount</label>
                <input
                  className='w-full h-[40px] rounded-lg bg-[#F2F2F2] focus:outline-none p-2'
                  value={`₹${totalRefundAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className=" bg-white shadow-lg overflow-x-auto mt-4 ml-10 mr-10 p-4">
        <div
          className={`text-left flex mx-5 ${selectTimeStampDate || selectDate || selectContractororVendorName || selectProjectName || selectTransfer || selectType || selectMode || selectDescription.trim() || selectSourceFrom || selectBranch || selectEntryNo
            ? 'flex-col sm:flex-row sm:justify-between'
            : 'flex-row justify-between items-center'
            } mb-[12px] gap-[6px]`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
            <button className='' onClick={() => setShowFilters(!showFilters)}>
              <img src={Filter} alt="Toggle Filter" className="border rounded-md" />
            </button>
            {(selectTimeStampDate || selectDate || selectContractororVendorName || selectProjectName || selectTransfer || selectType || selectMode || selectDescription.trim() || selectSourceFrom || selectBranch || selectEntryNo) && (
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-2 sm:mt-0">
                {selectTimeStampDate && (
                  <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium w-fit">
                    <span className="font-normal">Timestamp: </span>
                    <span className="font-bold">{selectTimeStampDate}</span>
                    <button onClick={() => setSelectTimeStampDate('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                  </span>
                )}
                {selectDate && (
                  <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium w-fit">
                    <span className="font-normal">Date: </span>
                    <span className="font-bold">{selectDate}</span>
                    <button onClick={() => setSelectDate('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                  </span>
                )}
                {selectContractororVendorName && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Client Name: </span>
                    <span className="font-bold">{selectContractororVendorName}</span>
                    <button onClick={() => setSelectContractororVendorName('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectProjectName && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Project Name:</span>
                    <span className="font-bold">{selectProjectName}</span>
                    <button onClick={() => setSelectProjectName('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectTransfer && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Transfer To: </span>
                    <span className="font-bold">{selectTransfer}</span>
                    <button onClick={() => setSelectTransfer('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectType && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Type: </span>
                    <span className="font-bold">{selectType}</span>
                    <button onClick={() => setSelectType('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectMode && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Mode: </span>
                    <span className="font-bold">{selectMode}</span>
                    <button onClick={() => setSelectMode('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectDescription.trim() && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Description: </span>
                    <span className="font-bold">{selectDescription}</span>
                    <button onClick={() => setSelectDescription('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectSourceFrom && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Source From: </span>
                    <span className="font-bold">{selectSourceFrom}</span>
                    <button onClick={() => setSelectSourceFrom('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectBranch && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Branch: </span>
                    <span className="font-bold">{getBranchName(selectBranch) || selectBranch}</span>
                    <button onClick={() => setSelectBranch('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectEntryNo && (
                  <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                    <span className="font-normal">Entry No: </span>
                    <span className="font-bold">{selectEntryNo}</span>
                    <button onClick={() => setSelectEntryNo('')} className="text-[#BF9853] text-2xl ml-1">×</button>
                  </span>
                )}
              </div>
            )}
          </div>
          <div className='flex items-end gap-[6px]'>
            <button onClick={clearFilters} className='flex h-[30px] w-[30px] shrink-0 items-center justify-center'>
              <img className='w-full h-full' src={Reload} alt="Reload" />
            </button>
            <div className="w-[286px] min-w-[286px] translate-y-[2px] shrink-0 h-[34px] border border-[#D6D6D6] rounded-md bg-white flex items-center px-2 gap-1">
              <input
                type="text"
                value={overallSearch}
                onChange={(e) => setOverallSearch(e.target.value)}
                placeholder="Search Transactions..."
                className="h-full w-full border-0 p-0 text-[14px] text-[#000000] bg-transparent outline-none"
              />
              <img src={Search} alt="Search" className="w-[16px] h-[16px] pointer-events-none" />
            </div>
            <div className='text-left md:text-right md:items-end items-end cursor-default flex justify-end max-w-screen-2xl table-auto overflow-auto w-full scrollbar-none no-scrollbar'>
              <div className='flex items-end text-center'>
                <span className='text-[#E4572E] mr-2 flex items-center gap-1 font-semibold hover:underline cursor-pointer' onClick={exportPDF}>PDF<img src={Pdf} alt="Pdf" className='w-4 h-4' /></span>
                <span className='text-[#007233] flex items-center gap-1 font-semibold hover:underline cursor-pointer' onClick={exportCSV}>XL<img src={XL} alt="XL" className='w-4 h-4' /></span>
              </div>
            </div>
          </div>
        </div>
        <div className='border-l-8 border-l-[#BF9853] rounded-lg mx-5'>
          <div
            ref={scrollRef}
            className='overflow-auto max-h-[500px] no-scrollbar scrollbar-none'
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <table className={`table-fixed min-w-[1500px] w-screen border-collapse ${EDBC_TABLE_EDGE_TABLE_CLASS}`}>
              <thead className="sticky top-0 z-10 bg-white">
                <EdbcTableHeaderRow>
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC1}
                    label="Timestamp"
                    sortField={resolveEdbcSortField('timestamp')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC2}
                    label="Date"
                    sortField={resolveEdbcSortField('date')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC4}
                    label="Associate"
                    sortField={resolveEdbcSortField('vendor')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <th
                    className={edbc4Config?.headerClass}
                    onClick={() => handleSort('project')}
                  >
                    Purpose {sortConfig.key === 'project' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                  </th>
                  <th className={edbc4Config?.headerClass}>Transfer To</th>
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC8}
                    label="Loan"
                    sortField={resolveEdbcSortField('amount')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <th className={edbc8Config?.headerClass}>Refund</th>
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC12}
                    label="Type"
                    sortField={resolveEdbcSortField('type')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC9}
                    label="Description"
                    sortField={resolveEdbcSortField('description')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC14}
                    label="Source From"
                    sortField={resolveEdbcSortField('source')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC15}
                    label="Branch"
                    sortField={resolveEdbcSortField('branch')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC13}
                    label="Mode"
                    sortField={resolveEdbcSortField('mode')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC17}
                    label="Entry No"
                    sortField={resolveEdbcSortField('entryNo')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader columnId={EDBC_IDS.EDBC19} label="Activity" />
                </EdbcTableHeaderRow>
                {showFilters && (
                  <EdbcTableFilterRow>
                    <EdbcTimestampFilter
                      placeholder="Timestamp"
                      timestampStartDate={selectTimeStampDate}
                      timestampEndDate={selectTimeStampDate}
                      isOpen={showTimestampDatePicker}
                      onOpen={() => setShowTimestampDatePicker(true)}
                      onClose={() => setShowTimestampDatePicker(false)}
                      onApply={(from) => {
                        setSelectTimeStampDate(from || '');
                        setShowTimestampDatePicker(false);
                      }}
                    />
                    <EdbcDateFilter
                      placeholder="Date"
                      value={selectDate}
                      onChange={setSelectDate}
                    />
                    <EdbcSelectFilter
                      columnId={EDBC_IDS.EDBC4}
                      placeholder="Associate"
                      options={associateFilterOptions}
                      value={selectContractororVendorName}
                      onChange={setSelectContractororVendorName}
                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                    />
                    <EdbcSelectFilter
                      columnId={EDBC_IDS.EDBC4}
                      placeholder="Purpose"
                      options={uniqueProjectPurposeOptions}
                      value={selectProjectName}
                      onChange={setSelectProjectName}
                      selectStyles={purposeTransferFilterSelectStyles}
                    />
                    <EdbcSelectFilter
                      columnId={EDBC_IDS.EDBC4}
                      placeholder="Transfer To"
                      options={uniqueTransferToOptions}
                      value={selectTransfer}
                      onChange={setSelectTransfer}
                      selectStyles={purposeTransferFilterSelectStyles}
                    />
                    <EdbcTotalAmountFilter columnId={EDBC_IDS.EDBC8} totalAmount={totals.loan} />
                    <EdbcTotalAmountFilter columnId={EDBC_IDS.EDBC8} totalAmount={totals.refund} />
                    <EdbcSelectFilter
                      columnId={EDBC_IDS.EDBC12}
                      placeholder="Type"
                      options={uniqueTypes.map((t) => ({ value: t, label: t }))}
                      value={selectType}
                      onChange={setSelectType}
                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                    />
                    <EdbcTextInputFilter
                      columnId={EDBC_IDS.EDBC9}
                      placeholder="Description"
                      value={selectDescription}
                      onChange={(e) => setSelectDescription(e.target.value)}
                    />
                    <EdbcSelectFilter
                      columnId={EDBC_IDS.EDBC14}
                      placeholder="Source From"
                      options={uniqueSourceFromOptions}
                      value={selectSourceFrom}
                      onChange={setSelectSourceFrom}
                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                    />
                    <EdbcSelectFilter
                      columnId={EDBC_IDS.EDBC15}
                      placeholder="Branch"
                      options={loanBranchFilterOptions}
                      selectValue={selectBranch ? loanBranchFilterOptions.find((opt) => String(opt.value) === String(selectBranch)) || { value: selectBranch, label: getBranchName(selectBranch) || selectBranch } : null}
                      onChange={(value) => setSelectBranch(value ? String(value) : '')}
                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                    />
                    <EdbcSelectFilter
                      columnId={EDBC_IDS.EDBC13}
                      placeholder="Mode"
                      options={uniquePaymentModes.map((m) => ({ value: m, label: m }))}
                      value={selectMode}
                      onChange={setSelectMode}
                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                    />
                    <EdbcSelectFilter
                      columnId={EDBC_IDS.EDBC17}
                      placeholder="Entry No"
                      options={uniqueEntryNoOptions}
                      value={selectEntryNo}
                      onChange={setSelectEntryNo}
                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                      textAlign="right"
                    />
                    <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC19} />
                  </EdbcTableFilterRow>
                )}
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((entry, index) => (
                    <EdbcTableBodyRow key={entry.loanPortalId || entry.id}>
                      <EdbcTimestampBodyCell
                        expense={{ ...entry, id: entry.loanPortalId || entry.id }}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        formatValue={formatDate}
                      />
                      <EdbcDateBodyCell
                        expense={{ ...entry, id: entry.loanPortalId || entry.id }}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        formatValue={formatDateOnly}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC4}
                        expense={{ ...entry, id: entry.loanPortalId || entry.id }}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={getAssociateName}
                      />
                      <td className={edbc4Config?.tdClass}>
                        <span
                          onClick={() => toggleExpandedCell(`${(entry.loanPortalId || entry.id || index)}-purpose`)}
                          className={`block w-full cursor-pointer ${expandedCells[`${(entry.loanPortalId || entry.id || index)}-purpose`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                          title={resolveLoanPurposeName(entry)}
                        >
                          {resolveLoanPurposeName(entry)}
                        </span>
                      </td>
                      <td className={edbc4Config?.tdClass}>
                        <span
                          onClick={() => toggleExpandedCell(`${(entry.loanPortalId || entry.id || index)}-transfer`)}
                          className={`block w-full cursor-pointer ${expandedCells[`${(entry.loanPortalId || entry.id || index)}-transfer`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                          title={resolveLoanTransferToName(entry)}
                        >
                          {resolveLoanTransferToName(entry)}
                        </span>
                      </td>
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC8}
                        expense={{ ...entry, id: entry.loanPortalId || entry.id }}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        textAlignClass="text-right"
                        getDisplayValue={(row) => {
                          if ((row.type === 'Loan' || row.type === 'Transfer') && row.amount) {
                            return formatLoanAmount(row.amount);
                          }
                          if (row.type === 'Refund') return '-';
                          return '';
                        }}
                      />
                      <td className={`${edbc8Config?.tdClass || ''} text-right`.trim()}>
                        <span
                          onClick={() => toggleExpandedCell(`${(entry.loanPortalId || entry.id || index)}-refund`)}
                          className={`block w-full cursor-pointer text-right ${expandedCells[`${(entry.loanPortalId || entry.id || index)}-refund`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                          title={
                            entry.type === 'Refund' && entry.loan_refund_amount
                              ? formatLoanAmount(entry.loan_refund_amount)
                              : ''
                          }
                        >
                          {entry.type === 'Refund' && entry.loan_refund_amount
                            ? formatLoanAmount(entry.loan_refund_amount)
                            : ''}
                        </span>
                      </td>
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC12}
                        expense={{ ...entry, id: entry.loanPortalId || entry.id }}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={(row) => row.type || ''}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC9}
                        expense={{ ...entry, id: entry.loanPortalId || entry.id }}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={(row) => row.description || ''}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC14}
                        expense={{ ...entry, id: entry.loanPortalId || entry.id }}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={(row) => row.source || ''}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC15}
                        expense={{ ...entry, id: entry.loanPortalId || entry.id }}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={(row) => getBranchName(row.branch_id ?? row.branchId ?? '') || ''}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC13}
                        expense={{ ...entry, id: entry.loanPortalId || entry.id }}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={(row) =>
                          finalPaymentModeOptions.find((opt) => opt.value === row.loan_payment_mode)?.label ||
                          row.loan_payment_mode ||
                          ''
                        }
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC17}
                        expense={{ ...entry, id: entry.loanPortalId || entry.id }}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        textAlignClass="text-right"
                        getDisplayValue={(row) => row.entry_no}
                      />
                      <td className={edbc19TdClass}>
                        <button
                          onClick={() => {
                            setEditingId(entry.loanPortalId || entry.id);
                            setEditFormData({
                              date: entry.date?.split('T')[0] || '',
                              loan_amount: entry.amount || '',
                              loan_refund_amount: entry.loan_refund_amount || '',
                              paid_amount: entry.paid_amount || '',
                              project_id: entry.project_id || '',
                              vendor_id: entry.vendor_id || '',
                              contractor_id: entry.contractor_id || '',
                              entry_no: entry.entry_no || '',
                              description: entry.description || '',
                              loan_type: entry.loan_type || '',
                              payment_mode: entry.loan_payment_mode || ''
                            });
                            setEditSelectedType(entry.type || 'Loan');
                            setEditSelectedOption(
                              entry.vendor_id
                                ? vendorOptions.find(v => v.id === entry.vendor_id)
                                : entry.contractor_id
                                  ? contractorOptions.find(c => c.id === entry.contractor_id)
                                  : null
                            );
                            setEditSelectedSite(siteOptions.find(s => s.id === entry.project_id) || null);
                            setEditPurpose(entry.from_purpose_id || '');
                            const transferOption = entry.to_purpose_id
                              ? purposeOptions.find(p => p.id === entry.to_purpose_id)
                              : entry.transfer_Project_id
                                ? siteOptions.find(s => s.id === entry.transfer_Project_id)
                                : null;

                            setEditTransferSelection(transferOption || null);
                            setEditAmountGiven(entry.amount || '');
                            setEditTransferAmount(entry.amount || '');
                            setEditPaymentMode(entry.loan_payment_mode || '');
                            setEditDescription(entry.description || '');
                            setIsEditModalOpen(true);
                          }}
                          className="rounded-full transition duration-200"
                        >
                          <img
                            src={edit}
                            alt="Edit"
                            className="w-4 h-6 transform hover:scale-110 hover:brightness-110 transition duration-200"
                          />
                        </button>
                        <button className="rounded-full transition duration-200">
                          <img
                            src={remove}
                            alt="delete"
                            className="w-4 h-4 transform hover:scale-110 hover:brightness-110 transition duration-200"
                            onClick={() => handleDelete(entry.loanPortalId || entry.id)}
                          />
                        </button>
                        <button
                          onClick={() => fetchAuditDetails(entry.loanPortalId || entry.id)}
                          className="rounded-full transition duration-200"
                        >
                          <img
                            src={history}
                            alt="history"
                            className="w-4 h-5 transform hover:scale-110 hover:brightness-110 transition duration-200"
                          />
                        </button>
                      </td>
                    </EdbcTableBodyRow>
                  ))
                ) : (
                  <tr>
                    <td className="p-4 text-center text-sm text-gray-400" colSpan={14}>
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {sortedData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center px-5 py-4 bg-white">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <label className="text-sm font-medium text-gray-700">Show:</label>
              <select value={itemsPerPage} onChange={handleItemsPerPageChange}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF9853] focus:border-transparent"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={300}>300</option>
                <option value={400}>400</option>
                <option value={500}>500</option>
                <option value={600}>600</option>
                <option value={700}>700</option>
                <option value={800}>800</option>
                <option value={900}>900</option>
                <option value={1000}>1000</option>
              </select>
              <span className="text-sm text-gray-700">entries</span>
            </div>
            <div className="text-sm text-gray-700 mb-4 sm:mb-0">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={goToPreviousPage} disabled={currentPage === 1}
                className={`px-3 py-1 text-sm font-medium rounded-md ${currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-[#BF9853] border border-[#BF9853] hover:bg-[#BF9853] hover:text-white transition-colors'
                  }`}
              >
                Previous
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button key={pageNum} onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 text-sm font-medium rounded-md ${currentPage === pageNum
                        ? 'bg-[#BF9853] text-white'
                        : 'bg-white text-[#BF9853] border border-[#BF9853] hover:bg-[#BF9853] hover:text-white transition-colors'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button onClick={goToNextPage} disabled={currentPage === totalPages}
                className={`px-3 py-1 text-sm font-medium rounded-md ${currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-[#BF9853] border border-[#BF9853] hover:bg-[#BF9853] hover:text-white transition-colors'
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-[800px] max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold mb-4">Edit Loan Entry</h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-left'>
                <div className='space-y-2'>
                  <label className='font-semibold text-[#E4572E] text-sm sm:text-base'>Select Type</label>
                  <select value={editSelectedType} onChange={(e) => setEditSelectedType(e.target.value)}
                    className='w-full h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                  >
                    <option value='Loan'>Loan</option>
                    <option value='Refund'>Refund</option>
                    <option value='Transfer'>Transfer</option>
                  </select>
                </div>
                <div className='space-y-2'>
                  <label className='font-semibold text-[#E4572E] text-sm sm:text-base'>Date</label>
                  <input
                    type='date'
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className='w-full h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                  />
                </div>
                <div className='space-y-2'>
                  <label className='font-semibold block text-sm sm:text-base'>Associate</label>
                  <Select
                    options={combinedOptions}
                    value={editSelectedOption}
                    onChange={setEditSelectedOption}
                    className='w-full rounded-lg focus:outline-none'
                    isClearable
                    styles={customStyles}
                  />
                </div>
                <div className='space-y-2'>
                  <label className='font-semibold block text-sm sm:text-base'>Purpose</label>
                  <select
                    value={editPurpose}
                    onChange={(e) => setEditPurpose(e.target.value)}
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
                <div className='space-y-2'>
                  <label className='font-semibold block text-sm sm:text-base'>
                    {editSelectedType === 'Transfer' ? 'Transfer To' :
                      editSelectedType === 'Refund' ? 'Amount' : 'Amount Given'}
                  </label>
                  {editSelectedType === 'Transfer' ? (
                    <Select
                      options={combinedSitePurposeOptions}
                      value={editTransferSelection}
                      onChange={(selected) => setEditTransferSelection(selected || null)}
                      className='w-full rounded-lg focus:outline-none'
                      isClearable
                      styles={customStyles}
                      placeholder="Select Transfer To"
                    />
                  ) : editSelectedType === 'Refund' ? (
                    <input
                      value={formatWithCommas(editFormData.loan_refund_amount || '')}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/,/g, '');
                        if (!isNaN(rawValue)) {
                          setEditFormData(prev => ({ ...prev, loan_refund_amount: rawValue }));
                        }
                      }}
                      placeholder="Enter Refund Amount"
                      className='w-full h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                    />
                  ) : (
                    <input
                      value={formatWithCommas(editFormData.loan_amount || '')}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/,/g, '');
                        if (!isNaN(rawValue)) {
                          setEditFormData(prev => ({ ...prev, loan_amount: rawValue }));
                        }
                      }}
                      placeholder="Enter Amount"
                      className='w-full h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                    />
                  )}
                </div>
                <div className='space-y-2'>
                  <label className='font-semibold block text-sm sm:text-base'>
                    {editSelectedType === 'Transfer' ? 'Transfer Amount' : 'Payment Mode'}
                  </label>
                  {editSelectedType === 'Transfer' ? (
                    <input
                      value={formatWithCommas(editTransferAmount)}
                      onChange={handleEditTransferAmountChange}
                      placeholder="Enter Amount"
                      className='w-full h-[45px] no-spinner border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                    />
                  ) : (
                    <select
                      value={editPaymentMode}
                      onChange={(e) => setEditPaymentMode(e.target.value)}
                      className='w-full h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                    >
                      <option value=''>Select</option>
                      {finalPaymentModeOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className='col-span-1 sm:col-span-2 space-y-2'>
                  <label className='font-semibold block text-sm sm:text-base'>Description</label>
                  <textarea
                    rows={2}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Type your text here..."
                    className='w-full border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
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
        <AuditModal
          show={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          audits={loanPortalAudits}
          vendorOptions={vendorOptions}
          contractorOptions={contractorOptions}
          siteOptions={siteOptions}
          purposeOptions={purposeOptions}
        />
      </div>
      <AdvancePortalEditPaymentModal
        isOpen={showEditPaymentModal}
        onClose={() => {
          setShowEditPaymentModal(false);
          pendingLoanUpdateRef.current = null;
        }}
        onSubmit={handleEditPaymentModalSubmit}
        isSubmitting={isEditPaymentSubmitting}
        paymentMode={
          pendingLoanUpdateRef.current?.payload?.loan_payment_mode ?? editPaymentMode
        }
        date={pendingLoanUpdateRef.current?.payload?.date ?? editFormData.date}
        amount={getLoanPortalDisplayAmount(
          pendingLoanUpdateRef.current?.payload || {
            type: editSelectedType,
            amount: editFormData.loan_amount,
            loan_refund_amount: editFormData.loan_refund_amount,
            loan_payment_mode: editPaymentMode,
          }
        )}
        paymentModalData={editPaymentModalData}
        setPaymentModalData={setEditPaymentModalData}
        accountDetails={accountDetails}
        selectStyles={customStyles}
      />
      <ToastContainer position="top-center" autoClose={3000} theme="colored" />
    </body>
  )
}
export default LoanDatabase
const formatDate = (dateString) => {
  const date = new Date(dateString);
  date.setMinutes(date.getMinutes());
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? String(hours).padStart(2, '0') : '12';
  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
};

const AuditModal = ({ show, onClose, audits, vendorOptions, contractorOptions, siteOptions, purposeOptions }) => {
  if (!show) return null;

  const getNameById = (id, options) => {
    if (!id && id !== 0) return "-";
    const found = options.find(opt => String(opt.id) === String(id));
    return found ? found.label : id;
  };

  const fields = [
    { oldKey: "old_date", newKey: "new_date", label: "Date", width: "120px" },
    { oldKey: "old_type", newKey: "new_type", label: "Type", width: "100px" },
    { oldKey: "old_vendor_id", newKey: "new_vendor_id", label: "Vendor", width: "150px", lookup: vendorOptions },
    { oldKey: "old_contractor_id", newKey: "new_contractor_id", label: "Contractor", width: "150px", lookup: contractorOptions },
    { oldKey: "old_project_id", newKey: "new_project_id", label: "Project", width: "180px", lookup: siteOptions },
    { oldKey: "old_transfer_project_id", newKey: "new_transfer_project_id", label: "Transfer Project", width: "180px", lookup: siteOptions },
    { oldKey: "old_from_purpose_id", newKey: "new_from_purpose_id", label: "From Purpose", width: "180px", lookup: purposeOptions },
    { oldKey: "old_to_purpose_id", newKey: "new_to_purpose_id", label: "To Purpose", width: "180px", lookup: purposeOptions },
    { oldKey: "old_loan_payment_mode", newKey: "new_loan_payment_mode", label: "Payment Mode", width: "120px" },
    { oldKey: "old_amount", newKey: "new_amount", label: "Amount", width: "100px" },
    { oldKey: "old_loan_refund_amount", newKey: "new_loan_refund_amount", label: "Refund Amount", width: "120px" },
    { oldKey: "old_description", newKey: "new_description", label: "Description", width: "200px" },
    { oldKey: "old_file_url", newKey: "new_file_url", label: "File URL", width: "200px" },
  ];

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    hours = String(hours).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  };

  const formatDisplayValue = (value, field) => {
    if (
      (field.oldKey?.includes("vendor_id") || field.oldKey?.includes("contractor_id") ||
        field.oldKey?.includes("project_id") || field.oldKey?.includes("transfer_project_id") ||
        field.oldKey?.includes("from_purpose_id") || field.oldKey?.includes("to_purpose_id") ||
        field.newKey?.includes("vendor_id") || field.newKey?.includes("contractor_id") ||
        field.newKey?.includes("project_id") || field.newKey?.includes("transfer_project_id") ||
        field.newKey?.includes("from_purpose_id") || field.newKey?.includes("to_purpose_id")) &&
      String(value) === "0"
    ) {
      return "-";
    }
    if (field.lookup) {
      return getNameById(value, field.lookup);
    }
    if (field.label.includes("Amount")) {
      return value ? Number(value).toLocaleString("en-IN") : "-";
    }
    if (field.label === "Date") {
      return value ? new Date(value).toLocaleDateString("en-GB") : "-";
    }
    if (field.label === "File URL") {
      return value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
          View
        </a>
      ) : "-";
    }
    return value ?? "-";
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-md shadow-lg w-[95%] max-w-[1800px] mx-4 p-2">
        <div className="flex justify-between items-center mt-4 ml-7 mr-7">
          <h2 className="text-xl font-bold">History</h2>
          <button onClick={onClose}>
            <h2 className="text-xl text-red-500 -mt-10 font-bold">x</h2>
          </button>
        </div>
        <div className="overflow-auto mt-2 max-h-80 border border-l-8 border-l-[#BF9853] rounded-lg ml-7">
          <table className="table-fixed min-w-full bg-white">
            <thead className="bg-[#FAF6ED]">
              <tr>
                <th style={{ width: "130px" }}>Time Stamp</th>
                <th style={{ width: "120px" }}>Edited By</th>
                {fields.map((f) => (
                  <th
                    key={f.label}
                    style={{ width: f.width }}
                    className="border-b py-2 px-2 text-center font-bold whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    {f.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {audits.length > 0 ? (
                audits.map((audit, index) => (
                  <tr
                    key={index}
                    className="odd:bg-white even:bg-[#FAF6ED]"
                  >
                    <td
                      className="whitespace-nowrap overflow-hidden text-ellipsis"
                      style={{ width: "130px" }}
                    >
                      {formatDateTime(audit.edited_date)}
                    </td>
                    <td
                      className="whitespace-nowrap overflow-hidden text-ellipsis"
                      style={{ width: "120px" }}
                    >
                      {audit.edited_by}
                    </td>
                    {fields.map((f) => {
                      const oldDisplay = formatDisplayValue(audit[f.oldKey], f);
                      const newDisplay = formatDisplayValue(audit[f.newKey], f);
                      const changed = oldDisplay !== newDisplay;
                      return (
                        <td
                          key={f.label}
                          style={{ width: f.width }}
                          title={changed ? `Previous: ${oldDisplay} → Current: ${newDisplay}` : ""}
                          className={`whitespace-nowrap overflow-hidden text-ellipsis px-2 ${changed ? "bg-[#BF9853] font-bold" : ""
                            }`}
                        >
                          {oldDisplay}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-4 text-center text-sm text-gray-400" colSpan={fields.length + 2}>
                    No audit history available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
