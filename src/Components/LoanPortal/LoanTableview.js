import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import jsPDF from "jspdf";
import "jspdf-autotable";
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import edit from '../Images/Edit.svg';
import remove from '../Images/Delete.svg';
import { useOrbitPageSync } from '../../utils/useOrbitPageSync';
import { useTabRefreshSignal } from '../../utils/useTabRefreshSignal';
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
  EdbcSelectFilter,
  EdbcTextInputFilter,
  EdbcEmptyFilterCell,
  EdbcTotalAmountFilter,
  EdbcDateBodyCell,
  EdbcExpandableBodyCell,
  EDBC_TABLE_EDGE_TABLE_CLASS,
  EDBC2_FIRST_COLUMN_WIDTH_CLASS,
  EdbcFilterToggleButton,
  EdbcTableToolbarRightActions,
  formatEdbcFilterDateDMY,
} from '../ExpensesEntry/databaseExpensesSharedColumns';
import {
  clearLinkedAdvancePortalForLoanDelete,
  formatWeeklyBillDeleteMessage,
  resolveFilesUploadResponseUrl,
} from '../../utils/advancePortalWeeklyPaymentBill';
import CustomDateField from '../ExpensesEntry/CustomDateField';
import UploadFile from '../Images/Upload file.svg';
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
import {
  LOAN_PORTAL_MODULE_NAME,
  fetchPaymentModeSelectOptionsForModule,
  subscribePaymentModeArrangementRefresh,
} from '../../utils/paymentModeArrangement';

const ADVANCE_PORTAL_FILTER_AMOUNT_INPUT_CLASS =
  'pl-[12px] pr-2 border border-[#00000029] rounded-lg w-full h-full focus:outline-none bg-[#ededed] text-[14px] font-medium cursor-default';
const formatAmountDisplay = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const normalized = String(value).replace(/,/g, '');
  const num = Number(normalized);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const AdvancePortalAmountOutput = ({ value, className = '' }) => {
  const formattedValue = formatAmountDisplay(value);
  const displayValue = formattedValue ? `₹${formattedValue}` : '';
  return (
    <div className={`relative lg:w-[150px] w-full h-[40px] ${className}`.trim()}>
      <input
        type="text"
        readOnly
        tabIndex={-1}
        value={displayValue}
        className={ADVANCE_PORTAL_FILTER_AMOUNT_INPUT_CLASS}
      />
    </div>
  );
};
const ADVANCE_PORTAL_SELECT_CLASS =
  'custom-select rounded-lg w-[300px] h-[40px] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500';
const ADVANCE_PORTAL_INPUT_CLASS =
  'border-2 border-[#BF9853] rounded-lg px-[8px] w-full h-[40px] focus:outline-none border-opacity-[0.20] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500';
const ADVANCE_PORTAL_READONLY_AMOUNT_INPUT_CLASS =
  'pl-[12px] pr-4 border-2 border-[#BF9853] rounded-lg w-full h-[40px] focus:outline-none border-opacity-[0.20] bg-[#ededed] text-[14px] font-medium cursor-default';
const ADVANCE_PORTAL_TEXTAREA_CLASS =
  'border-2 border-[#BF9853] rounded-md px-[8px] w-full h-[60px] focus:outline-none border-opacity-[0.20] resize-none text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500';
const ADVANCE_PORTAL_LABEL_CLASS = 'text-md font-semibold mb-[8px] block';
const LOAN_EDIT_MODAL_SELECT_STYLES = {
  control: (provided, state) => ({
    ...provided,
    fontFamily: 'Manrope',
    borderWidth: '2px',
    borderRadius: '8px',
    minHeight: '40px',
    height: '40px',
    flexWrap: 'nowrap',
    borderColor: state.isFocused ? 'rgba(191, 152, 83, 1)' : 'rgba(191, 152, 83, 0.2)',
    boxShadow: state.isFocused ? '0 0 0 1px rgba(101, 102, 53, 0.2)' : 'none',
    '&:hover': { borderColor: 'rgba(191, 152, 83, 0.2)' },
  }),
  valueContainer: (provided, state) => ({
    ...provided,
    flex: '1 1 0%',
    minWidth: 0,
    flexWrap: 'nowrap',
    overflow: 'hidden',
    paddingLeft: '12px',
    paddingRight: state.hasValue ? '2px' : provided.paddingRight,
    paddingTop: 0,
    paddingBottom: 0,
    height: '36px',
    alignItems: 'center',
  }),
  singleValue: (provided) => ({
    ...provided,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    margin: 0,
    color: 'black',
  }),
  input: (provided) => ({ ...provided, margin: 0, padding: 0 }),
  menu: (provided) => ({ ...provided, zIndex: 9999, maxHeight: '300px' }),
  menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
  menuList: (provided) => ({
    ...provided,
    paddingTop: 0,
    paddingBottom: 0,
    maxHeight: '250px',
    overflowY: 'auto',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  indicatorsContainer: (provided) => ({ ...provided, flex: '0 0 auto', paddingLeft: '0' }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    display: state.hasValue ? 'none' : 'flex',
    color: '#000000',
    flexShrink: 0,
  }),
  clearIndicator: (provided) => ({ ...provided, cursor: 'pointer', color: '#000000', flexShrink: 0 }),
  placeholder: (provided) => ({
    ...provided,
    fontWeight: 'normal',
    fontSize: '14px',
    color: '#A6A5A6',
  }),
};
const LoanEditAmountOutput = ({ value }) => {
  const formattedValue = formatAmountDisplay(value);
  const displayValue = formattedValue ? `₹${formattedValue}` : '';
  return (
    <div className="relative w-[300px] h-[40px]">
      <input type="text" readOnly tabIndex={-1} value={displayValue} className={ADVANCE_PORTAL_READONLY_AMOUNT_INPUT_CLASS} />
    </div>
  );
};
const LoanEditAmountInput = ({ value, onChange, placeholder = '' }) => (
  <div className="relative w-full h-[40px]">
    <span className="absolute top-1/2 left-[8px] transform -translate-y-1/2 text-gray-600 text-lg">₹</span>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onWheel={(e) => e.target.blur()}
      className="pl-[20px] pr-4 border-2 border-[#BF9853] rounded-lg w-full h-full focus:outline-none border-opacity-[0.20] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
    />
  </div>
);
const formatLoanEditNumber = (num) => {
  if (!num) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
const calculateLoanEditOverallTotal = (data, option) => {
  if (!option) return '';
  return data
    .filter((item) => {
      if (option.type === 'Vendor') return item.vendor_id === option.id;
      if (option.type === 'Contractor') return item.contractor_id === option.id;
      if (option.type === 'Employee') return item.employee_id === option.id;
      if (option.type === 'Labour') return item.labour_id === option.id;
      return false;
    })
    .reduce((sum, curr) => {
      if (curr.type === 'Loan') return sum + (parseFloat(curr.amount) || 0);
      if (curr.type === 'Refund') return sum - (parseFloat(curr.loan_refund_amount) || 0);
      if (curr.type === 'Transfer') {
        if (curr.transfer_Project_id) return sum + (parseFloat(curr.amount) || 0);
        return sum;
      }
      return sum;
    }, 0);
};
const calculateLoanEditPurposeTotal = (data, option, purposeId) => {
  if (!option || !purposeId) return '';
  const parsedPurposeId = parseInt(purposeId, 10);
  return data
    .filter((entry) => {
      let matchesAssociate = false;
      if (option.type === 'Vendor') matchesAssociate = entry.vendor_id === option.id;
      else if (option.type === 'Contractor') matchesAssociate = entry.contractor_id === option.id;
      else if (option.type === 'Employee') matchesAssociate = entry.employee_id === option.id;
      else if (option.type === 'Labour') matchesAssociate = entry.labour_id === option.id;
      return matchesAssociate && entry.from_purpose_id === parsedPurposeId;
    })
    .reduce((sum, curr) => {
      if (curr.type === 'Loan') return sum + (parseFloat(curr.amount) || 0);
      if (curr.type === 'Refund') return sum - (parseFloat(curr.loan_refund_amount) || 0);
      if (curr.type === 'Transfer') {
        if (curr.transfer_Project_id) return sum + (parseFloat(curr.amount) || 0);
        return sum;
      }
      return sum;
    }, 0);
};

const LoanTableview = ({ username, userRoles = [], paymentModeOptions = [], refreshSignal, isActive = true }) => {
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [combinedOptions, setCombinedOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [siteOptions, setSiteOptions] = useState([]);
  const [clientOptions, setClientOptions] = useState([]);
  const [projectClientNamesById, setProjectClientNamesById] = useState({});
  const [projectClientNamesByName, setProjectClientNamesByName] = useState({});
  const [loanData, setLoanData] = useState([]);
  const [selectDate, setSelectDate] = useState('');
  const [selectDateEnd, setSelectDateEnd] = useState('');
  const [showTableDateRangePicker, setShowTableDateRangePicker] = useState(false);
  const [selectContractororVendorName, setSelectContractororVendorName] = useState('');
  const [selectProjectName, setSelectProjectName] = useState('');
  const [selectTransfer, setSelectTransfer] = useState('');
  const [selectType, setSelectType] = useState('');
  const [selectMode, setSelectMode] = useState('');
  const [selectDescription, setSelectDescription] = useState('');
  const [selectSourceFrom, setSelectSourceFrom] = useState('');
  const [selectBranch, setSelectBranch] = useState('');
  const [selectEntryNo, setSelectEntryNo] = useState('');
  const [overallSearch, setOverallSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const fileInputRef = useRef(null);
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
  const [overallLoan, setOverallLoan] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [isRequestLoanModalOpen, setIsRequestLoanModalOpen] = useState(false);
  const adminUsernames = ['Mahalingam M', 'Admin'];
  const normalizedUsername = (username || '').trim().toLowerCase();
  const isAdminUser = adminUsernames.some(name => name.toLowerCase() === normalizedUsername);
  const isAdmin = isAdminUser;
  const [requestingLoanEntry, setRequestingLoanEntry] = useState(null);
  const scrollRef = useRef(null);
  const filterRowRef = useRef(null);
  const filterNudgeUsedRef = useRef(false);
  const filterChipsScrollRef = useRef(null);
  const isFilterChipsDragging = useRef(false);
  const filterChipsDragStart = useRef({ x: 0, scrollLeft: 0 });
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
  const handleEditFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const editOverallLoan = useMemo(
    () => calculateLoanEditOverallTotal(loanData, editSelectedOption),
    [loanData, editSelectedOption]
  );
  const editLoanAmount = useMemo(
    () => calculateLoanEditPurposeTotal(loanData, editSelectedOption, editPurpose),
    [loanData, editSelectedOption, editPurpose]
  );
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
        const options = await fetchPaymentModeSelectOptionsForModule(
          LOAN_PORTAL_MODULE_NAME,
          paymentModeOptions.length > 0 ? paymentModeOptions : defaultPaymentModeOptions
        );
        setBackendPaymentModeOptions(options);
      } catch (error) {
        console.error('Error fetching payment modes:', error);
      }
    };
    fetchPaymentModes();
    return subscribePaymentModeArrangementRefresh(fetchPaymentModes);
  }, [paymentModeOptions, defaultPaymentModeOptions]);

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
    fetchLaboursList();
  }, []);
  const fetchLaboursList = async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/labours-details/getAll');
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
        const response = await fetch('https://backendaab.in/aabuildersDash/api/loan-purposes/getAll', {
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
        const response = await fetch("https://backendaab.in/aabuilderDash/api/projects/getAll", {
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
        data.forEach((project, index) => {
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

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/account-details/getAll');
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

  const fetchLoanTableData = useCallback(async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/loans/all');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setLoanData(data);
    } catch (error) {
      console.error('Error fetching loan portal data:', error);
    }
  }, []);

  useEffect(() => {
    fetchLoanTableData();
  }, [fetchLoanTableData]);

  useOrbitPageSync('loan', fetchLoanTableData, [fetchLoanTableData]);

  useTabRefreshSignal(refreshSignal, isActive, fetchLoanTableData);
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/branch/getAll', {
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
  const resolveLoanTransferToName = (entry) => {
    if (entry.type !== 'Transfer') return '';
    return entry.to_purpose_id
      ? purposeOptions.find((purpose) => purpose.id === entry.to_purpose_id)?.value || ''
      : siteOptions.find((site) => site.id === entry.transfer_Project_id)?.value || '';
  };
  const resolveLoanPurposeName = (entry) =>
    getSiteName(entry.project_id) ||
    purposeOptions.find((p) => p.id === entry.from_purpose_id)?.value ||
    entry.from_purpose_id ||
    '';
  const filteredData = loanData.filter((entry) => {
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
      if (projectName.toLowerCase() !== selectProjectName.toLowerCase())
        return false;
    }
    if (selectTransfer) {
      const transferName = resolveLoanTransferToName(entry) || '';
      if (transferName.toLowerCase() !== selectTransfer.toLowerCase()) return false;
    }
    if (selectType) {
      if (entry.type?.toLowerCase() !== selectType.toLowerCase()) return false;
    }
    if (selectMode) {
      if (entry.loan_payment_mode?.toLowerCase() !== selectMode.toLowerCase()) return false;
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
      const paymentModeLabel =
        finalPaymentModeOptions.find((opt) => opt.value === entry.loan_payment_mode)?.label ||
        entry.loan_payment_mode ||
        '';
      const searchable = [
        formatDateOnly(entry.date),
        getAssociateName(entry),
        resolveLoanPurposeName(entry),
        resolveLoanTransferToName(entry),
        entry.amount,
        entry.loan_refund_amount,
        entry.type,
        entry.description,
        entry.source,
        getBranchName(entry.branch_id ?? entry.branchId ?? ''),
        paymentModeLabel,
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
  const resolveEdbcSortField = (advanceSortKey) =>
    sortConfig.key === advanceSortKey ? mapLoanSortKeyToEdbc(advanceSortKey) : '';
  const formatLoanAmount = (value) =>
    value != null && value !== ''
      ? Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 })
      : '';
  const getPurposeDisplay = (entry) => resolveLoanPurposeName(entry);
  const getTransferDisplay = (entry) => resolveLoanTransferToName(entry);
  const clearFilters = () => {
    setSelectDate('');
    setSelectContractororVendorName('');
    setSelectProjectName('');
    setSelectTransfer('');
    setSelectType('');
    setSelectDescription('');
    setSelectMode('');
    setSelectSourceFrom('');
    setSelectBranch('');
    setSelectEntryNo('');
    setOverallSearch('');
    setShowFilters(false);
  };
  const handleFilterChipsMouseDown = (e) => {
    if (!filterChipsScrollRef.current || e.target.closest('button')) return;
    isFilterChipsDragging.current = true;
    filterChipsDragStart.current = {
      x: e.clientX,
      scrollLeft: filterChipsScrollRef.current.scrollLeft,
    };
    filterChipsScrollRef.current.style.cursor = 'grabbing';
    filterChipsScrollRef.current.style.userSelect = 'none';
  };
  const handleFilterChipsMouseMove = (e) => {
    if (!isFilterChipsDragging.current || !filterChipsScrollRef.current) return;
    e.preventDefault();
    const dx = e.clientX - filterChipsDragStart.current.x;
    filterChipsScrollRef.current.scrollLeft =
      filterChipsDragStart.current.scrollLeft - dx;
  };
  const handleFilterChipsMouseUp = () => {
    if (!filterChipsScrollRef.current) return;
    isFilterChipsDragging.current = false;
    filterChipsScrollRef.current.style.cursor = 'grab';
    filterChipsScrollRef.current.style.userSelect = '';
  };
  const hasActiveColumnFilters =
    selectDate ||
    selectContractororVendorName ||
    selectProjectName ||
    selectTransfer ||
    selectType ||
    selectMode ||
    selectDescription.trim() ||
    selectSourceFrom ||
    selectBranch ||
    selectEntryNo;
  useEffect(() => {
    setCurrentPage(1);
  }, [selectDate, selectContractororVendorName, selectProjectName, selectTransfer, selectType, selectMode, selectDescription, selectSourceFrom, selectBranch, selectEntryNo, overallSearch]);
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
        5: { halign: 'right' }, // Loan
        6: { halign: 'right' }  // Refund
      }
    });
    doc.save("LoanData.pdf");
  };
  const exportCSV = () => {
    const csvHeaders = [
      "S.No",
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
      const purposeValue = getSiteName(entry.project_id) ||
        purposeOptions.find(p => p.id === entry.from_purpose_id)?.value ||
        entry.from_purpose_id || "";
      const transferTo = entry.type === "Transfer"
        ? (entry.to_purpose_id
          ? purposeOptions.find(purpose => purpose.id === entry.to_purpose_id)?.value || ""
          : siteOptions.find(site => site.id === entry.transfer_Project_id)?.value || "")
        : "";
      const loanAmount = (entry.type === "Loan" || entry.type === "Transfer") && entry.amount
        ? Number(entry.amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "";
      const refundAmount = entry.type === "Refund" && entry.loan_refund_amount
        ? Number(entry.loan_refund_amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "";
      const paymentMode = finalPaymentModeOptions.find(opt => opt.value === entry.loan_payment_mode)?.label ||
        entry.loan_payment_mode || '';
      return [
        index + 1,
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

    await fetchLoanTableData();
    setShowEditPaymentModal(false);
    pendingLoanUpdateRef.current = null;
    closeEditModal();
    notifyOrbitModuleDataChanged('loan');
    notifyOrbitModuleDataChanged('portal');
    toast.success('Entry updated successfully!', {
      position: 'top-center',
      autoClose: 3000,
      theme: 'colored',
    });
  };

  const handleUpdate = async () => {
    if (isEditSubmitting) return;
    setIsEditSubmitting(true);
    try {
      const currentEntry = loanData.find(
        (entry) => String(entry.loanPortalId || entry.id) === String(editingId)
      );
      if (!currentEntry) {
        toast.error('Record not found.', { position: 'top-center', autoClose: 3000, theme: 'colored' });
        return;
      }

      let fileUrl = editFormData.file_url || '';
      if (selectedFile) {
        const formData = new FormData();
        const now = new Date();
        const timestamp = now.toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).replace(',', '').replace(/\s/g, '-');
        const associateName = editSelectedOption?.label || '';
        formData.append('files', selectedFile);
        formData.append('folder', 'FileUpload / Loan_Portal');
        formData.append('fileName', `${timestamp} ${associateName}`);
        const uploadResponse = await fetch('https://backendaab.in/aabuildersDash/api/files/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadResponse.ok) throw new Error('Upload failed');
        const uploadResult = await uploadResponse.json();
        fileUrl = resolveFilesUploadResponseUrl(uploadResult);
        if (!fileUrl) throw new Error('Upload succeeded but no file URL was returned');
        setEditFormData((prev) => ({ ...prev, file_url: fileUrl }));
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }

      const payload = {
        ...buildLoanEditPayloadFromForm({
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
        }),
        file_url: fileUrl,
      };

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
    } finally {
      setIsEditSubmitting(false);
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

  const handleDelete = async (idToDelete) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this record?');
    if (!confirmDelete) return;

    try {
      const record = loanData.find(
        (row) => String(row.loanPortalId || row.id) === String(idToDelete)
      );
      if (!record) {
        toast.error('Record not found', {
          position: 'top-center',
          autoClose: 3000,
          theme: 'colored',
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

      await fetchLoanTableData();
      notifyOrbitModuleDataChanged('loan');
      notifyOrbitModuleDataChanged('portal');
      const billDeleteMessage = formatWeeklyBillDeleteMessage(
        weeklyBillDelete.deletedCount,
        weeklyBillDelete.failedCount
      );
      toast.success(`Record deleted successfully.${billDeleteMessage}`, {
        position: 'top-center',
        autoClose: 3000,
        theme: 'colored',
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete record!', {
        position: 'top-center',
        autoClose: 3000,
        theme: 'colored',
      });
    }
  };
  const handleSendLoanEditRequest = async () => {
    if (!requestingLoanEntry) return;
    try {
      const requestData = {
        module_name: 'Loan Portal',
        module_name_id: requestingLoanEntry.loanPortalId,
        module_name_eno: requestingLoanEntry.entry_no,
        request_send_by: username,
        request_approval: false,
        request_completed: false
      };
      const response = await fetch('https://backendaab.in/aabuildersDash/api/edit_requests/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestData)
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create edit request');
      }
      alert('Edit request sent successfully. Waiting for admin approval.');
      window.dispatchEvent(new Event('editRequestCreated'));
      setIsRequestLoanModalOpen(false);
      setRequestingLoanEntry(null);
    } catch (error) {
      console.error('Error creating edit request:', error);
      alert('Failed to send edit request. Please try again.');
    }
  };
  return (
    <div className='flex flex-col h-[calc(100vh-104px)] overflow-hidden bg-[#FAF6ED]'>
      <div className='px-[18px] pt-[18px] pb-[18px] flex flex-col flex-1 min-h-0 overflow-hidden bg-[#FAF6ED]'>
        <div className='w-full pt-[18px] px-[18px] pb-[18px] rounded-[6px] bg-white mb-[18px] text-left flex items-center gap-6'>
          <div className='w-full xl:w-auto xl:justify-between'>
            <div className='flex flex-wrap gap-[12px]'>
              <div>
                <label className='block mb-[8px] font-semibold text-sm sm:text-base'>Loan Amount</label>
                <AdvancePortalAmountOutput value={totalLoanAmount} />
              </div>
              <div>
                <label className='block mb-[8px] font-semibold text-sm sm:text-base'>Transfer Amount</label>
                <AdvancePortalAmountOutput value={totalTransferAmount} />
              </div>
              <div>
                <label className='block mb-[8px] font-semibold text-sm sm:text-base'>Refund Amount</label>
                <AdvancePortalAmountOutput value={totalRefundAmount} />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full pt-[18px] px-[18px] pb-[18px] bg-white rounded-[6px] flex flex-col flex-1 min-h-0 overflow-hidden">
        <div
          className={`text-left flex ${hasActiveColumnFilters ? 'flex-col sm:flex-row sm:justify-between' : 'flex-row justify-between items-center'} mb-[12px] gap-[6px]`}>
          <div className="flex flex-row items-center sm:space-x-3 min-w-0 flex-1 overflow-hidden">
            <EdbcFilterToggleButton
              onClick={() => {
                const willOpen = !showFilters;
                const scroller = scrollRef.current;
                if (willOpen) {
                  setShowFilters(true);
                  if (!scroller) return;
                  if (scroller.scrollTop <= 0) return;
                  if (filterNudgeUsedRef.current) return;
                  filterNudgeUsedRef.current = true;
                  requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                      const h = filterRowRef.current?.offsetHeight || 0;
                      if (h > 0) {
                        scroller.scrollTop = Math.max(0, scroller.scrollTop - h);
                      }
                    });
                  });
                  return;
                }
                const h = filterRowRef.current?.offsetHeight || 0;
                setShowFilters(false);
                if (!scroller || h <= 0 || !filterNudgeUsedRef.current) return;
                filterNudgeUsedRef.current = false;
                requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                    scroller.scrollTop = scroller.scrollTop + h;
                  });
                });
              }}
            />
            {hasActiveColumnFilters && (
              <div
                ref={filterChipsScrollRef}
                onMouseDown={handleFilterChipsMouseDown}
                onMouseMove={handleFilterChipsMouseMove}
                onMouseUp={handleFilterChipsMouseUp}
                onMouseLeave={handleFilterChipsMouseUp}
                className="flex min-w-0 flex-1 overflow-x-auto flex-nowrap items-center gap-2 no-scrollbar scrollbar-none cursor-grab select-none"
              >
                {selectDate && (
                  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-semibold shrink-0 whitespace-nowrap">Date: </span>
                    <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{formatEdbcFilterDateDMY(selectDate)}</span>
                    <button onClick={() => setSelectDate('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                  </span>
                )}
                {selectContractororVendorName && (
                  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-semibold shrink-0 whitespace-nowrap">Client Name: </span>
                    <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectContractororVendorName}</span>
                    <button onClick={() => setSelectContractororVendorName('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectProjectName && (
                  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-semibold shrink-0 whitespace-nowrap">Project Name:</span>
                    <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectProjectName}</span>
                    <button onClick={() => setSelectProjectName('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectTransfer && (
                  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-semibold shrink-0 whitespace-nowrap">Transfer To: </span>
                    <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectTransfer}</span>
                    <button onClick={() => setSelectTransfer('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectType && (
                  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-semibold shrink-0 whitespace-nowrap">Type: </span>
                    <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectType}</span>
                    <button onClick={() => setSelectType('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectMode && (
                  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-semibold shrink-0 whitespace-nowrap">Mode: </span>
                    <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectMode}</span>
                    <button onClick={() => setSelectMode('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectDescription.trim() && (
                  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-semibold shrink-0 whitespace-nowrap">Description: </span>
                    <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectDescription}</span>
                    <button onClick={() => setSelectDescription('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectSourceFrom && (
                  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-semibold shrink-0 whitespace-nowrap">Source From: </span>
                    <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectSourceFrom}</span>
                    <button onClick={() => setSelectSourceFrom('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectBranch && (
                  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-semibold shrink-0 whitespace-nowrap">Branch: </span>
                    <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{getBranchName(selectBranch) || selectBranch}</span>
                    <button onClick={() => setSelectBranch('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectEntryNo && (
                  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-semibold shrink-0 whitespace-nowrap">Entry No: </span>
                    <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectEntryNo}</span>
                    <button onClick={() => setSelectEntryNo('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
              </div>
            )}
          </div>
          <EdbcTableToolbarRightActions
            onClearFilters={clearFilters}
            overallSearch={overallSearch}
            onOverallSearchChange={setOverallSearch}
            searchPlaceholder="Search Transactions..."
            showExportIcons
            onExportPdf={exportPDF}
            onExportCsv={exportCSV}
          />
        </div>
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div
            ref={scrollRef}
            className="w-full rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] flex-1 min-h-0 overflow-auto select-none no-scrollbar scrollbar-none"
            onWheel={() => { filterNudgeUsedRef.current = false; }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <table className={`table-fixed min-w-[1790px] w-full border-collapse ${EDBC_TABLE_EDGE_TABLE_CLASS}`}>
              <thead className="sticky top-0 z-20 bg-white">
                <EdbcTableHeaderRow>
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC2}
                    label="Date"
                    sortField={resolveEdbcSortField('date')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                    columnWidthClass={EDBC2_FIRST_COLUMN_WIDTH_CLASS}
                  />
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC4}
                    label="Associate"
                    sortField={resolveEdbcSortField('vendor')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC4}
                    label="Purpose"
                    sortField={resolveEdbcSortField('project')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC3}
                    label="Transfer To"
                  />
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC8}
                    label="Loan"
                    sortField={resolveEdbcSortField('amount')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <th id={EDBC_IDS.EDBC8} className={edbc8Config?.headerClass}>Refund</th>
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC9}
                    label="Description"
                    sortField={resolveEdbcSortField('description')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC12}
                    label="Type"
                    sortField={resolveEdbcSortField('type')}
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
                    columnId={EDBC_IDS.EDBC17}
                    label="Entry No"
                    sortField={resolveEdbcSortField('entryNo')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader columnId={EDBC_IDS.EDBC19} label="Activity" />
                </EdbcTableHeaderRow>
                {showFilters && (
                  <EdbcTableFilterRow ref={filterRowRef}>
                    <EdbcTimestampFilter
                      columnId={EDBC_IDS.EDBC2}
                      placeholder="Date"
                      timestampStartDate={selectDate}
                      timestampEndDate={selectDateEnd}
                      isOpen={showTableDateRangePicker}
                      onOpen={() => setShowTableDateRangePicker(true)}
                      onClose={() => setShowTableDateRangePicker(false)}
                      onApply={(from, to) => {
                        setSelectDate(from || '');
                        setSelectDateEnd(to || '');
                      }}
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
                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                    />
                    <EdbcSelectFilter
                      columnId={EDBC_IDS.EDBC3}
                      placeholder="Transfer To"
                      options={uniqueTransferToOptions}
                      value={selectTransfer}
                      onChange={setSelectTransfer}
                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                    />
                    <EdbcTotalAmountFilter columnId={EDBC_IDS.EDBC8} totalAmount={totals.loan} />
                    <EdbcTotalAmountFilter columnId={EDBC_IDS.EDBC8} totalAmount={totals.refund} />
                    <EdbcTextInputFilter
                      columnId={EDBC_IDS.EDBC9}
                      placeholder="Description"
                      value={selectDescription}
                      onChange={(e) => setSelectDescription(e.target.value)}
                    />
                    <EdbcSelectFilter
                      columnId={EDBC_IDS.EDBC12}
                      placeholder="Type"
                      options={uniqueTypes.map((t) => ({ value: t, label: t }))}
                      value={selectType}
                      onChange={setSelectType}
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
                      <EdbcDateBodyCell
                        expense={{ ...entry, id: entry.loanPortalId || entry.id }}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        formatValue={formatDateOnly}
                        columnWidthClass={EDBC2_FIRST_COLUMN_WIDTH_CLASS}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC4}
                        expense={{ ...entry, id: entry.loanPortalId || entry.id }}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={getAssociateName}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC4}
                        expense={{ ...entry, id: entry.loanPortalId || entry.id }}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={getPurposeDisplay}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC3}
                        expense={{ ...entry, id: entry.loanPortalId || entry.id }}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={getTransferDisplay}
                      />
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
                        columnId={EDBC_IDS.EDBC9}
                        expense={{ ...entry, id: entry.loanPortalId || entry.id }}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={(row) => row.description || ''}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC12}
                        expense={{ ...entry, id: entry.loanPortalId || entry.id }}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={(row) => row.type || ''}
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
                        columnId={EDBC_IDS.EDBC17}
                        expense={{ ...entry, id: entry.loanPortalId || entry.id }}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        textAlignClass="text-right"
                        getDisplayValue={(row) => row.entry_no}
                      />
                      <td className={edbc19TdClass.replace(/\bjustify-between\b/, 'justify-center items-center gap-2')}>
                        <button className="rounded-full transition duration-200">
                          <img
                            src={edit}
                            alt="Edit"
                            className="w-4 h-6 transform hover:scale-110 hover:brightness-110 transition duration-200"
                            onClick={() => {
                              if (!isAdmin && (entry.not_allow_to_edit || entry.allow_to_edit === false)) {
                                setRequestingLoanEntry(entry);
                                setIsRequestLoanModalOpen(true);
                                return;
                              }
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
                                payment_mode: entry.loan_payment_mode || '',
                                file_url: entry.file_url || entry.fileUrl || '',
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
                      </td>
                    </EdbcTableBodyRow>
                  ))
                ) : (
                  <tr className="h-12">
                    <td className="pl-6 pr-6 text-center text-sm text-gray-400" colSpan={13}>
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
          <div className="fixed inset-0 flex items-center justify-center p-4 bg-gray-800 bg-opacity-50 z-[9999]">
            <div className="bg-white text-left p-6 rounded-lg shadow-lg w-full max-w-2xl">
              <div className="flex justify-between items-center mb-[14px]">
                <h2 className="text-[18px] font-semibold text-black">Edit Loan Entry</h2>
                <span className="text-[16px] font-semibold text-[#E4572E]">{editFormData.entry_no}</span>
              </div>
              <div className="max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="text-left max-w-[300px]">
                    <label className={ADVANCE_PORTAL_LABEL_CLASS}>Account Type</label>
                    <Select
                      options={[
                        { value: 'Loan', label: 'Loan' },
                        { value: 'Refund', label: 'Refund' },
                        { value: 'Transfer', label: 'Transfer' },
                      ]}
                      value={editSelectedType ? { value: editSelectedType, label: editSelectedType } : null}
                      onChange={(selected) => setEditSelectedType(selected ? selected.value : '')}
                      placeholder="Account Type"
                      isSearchable
                      isClearable
                      styles={LOAN_EDIT_MODAL_SELECT_STYLES}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      className={ADVANCE_PORTAL_SELECT_CLASS}
                    />
                  </div>
                  <div className="text-left">
                    <label className={ADVANCE_PORTAL_LABEL_CLASS}>Date</label>
                    <div className="expense-entry-form-date w-[300px]">
                      <CustomDateField
                        value={editFormData.date}
                        onChange={(value) => setEditFormData({ ...editFormData, date: value })}
                        placeholder="Date"
                        className="w-full text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                        controlHeightPx={40}
                        alwaysOpenBelow
                        anchor="right"
                      />
                    </div>
                  </div>
                  <div className="text-left">
                    <label className={ADVANCE_PORTAL_LABEL_CLASS}>Associate</label>
                    <Select
                      options={combinedOptions}
                      value={editSelectedOption}
                      onChange={setEditSelectedOption}
                      placeholder="Associate"
                      className={ADVANCE_PORTAL_SELECT_CLASS}
                      isClearable
                      isSearchable
                      styles={LOAN_EDIT_MODAL_SELECT_STYLES}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </div>
                  <div className="text-left">
                    <label className={ADVANCE_PORTAL_LABEL_CLASS}>Overall Loan</label>
                    <LoanEditAmountOutput value={editOverallLoan} />
                  </div>
                  <div className="text-left">
                    <label className={ADVANCE_PORTAL_LABEL_CLASS}>Purpose</label>
                    <Select
                      options={purposeOptions}
                      value={editPurpose ? purposeOptions.find((opt) => opt.id === parseInt(editPurpose, 10)) : null}
                      onChange={(selected) => setEditPurpose(selected ? selected.id : '')}
                      placeholder="Purpose"
                      isSearchable
                      isClearable
                      styles={LOAN_EDIT_MODAL_SELECT_STYLES}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      className={ADVANCE_PORTAL_SELECT_CLASS}
                    />
                  </div>
                  <div className="text-left">
                    <label className={ADVANCE_PORTAL_LABEL_CLASS}>Loan Amount</label>
                    <LoanEditAmountOutput value={editLoanAmount} />
                  </div>
                  <div className="col-span-2">
                    <div className="flex flex-row gap-3">
                      <div className="text-left flex-1">
                        <label className={ADVANCE_PORTAL_LABEL_CLASS}>
                          {editSelectedType === 'Transfer' ? 'Transfer To' :
                            editSelectedType === 'Refund' ? 'Amount' : 'Amount Given'}
                        </label>
                        {editSelectedType === 'Transfer' ? (
                          <Select
                            options={combinedSitePurposeOptions}
                            value={editTransferSelection}
                            onChange={(selected) => setEditTransferSelection(selected || null)}
                            className={ADVANCE_PORTAL_SELECT_CLASS}
                            isClearable
                            isSearchable
                            styles={LOAN_EDIT_MODAL_SELECT_STYLES}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            placeholder="Transfer To"
                          />
                        ) : (
                          <LoanEditAmountInput
                            value={formatLoanEditNumber(
                              editSelectedType === 'Refund'
                                ? editFormData.loan_refund_amount || ''
                                : editFormData.loan_amount || ''
                            )}
                            onChange={(e) => {
                              const rawValue = e.target.value.replace(/,/g, '');
                              if (!isNaN(rawValue)) {
                                if (editSelectedType === 'Refund') {
                                  setEditFormData((prev) => ({ ...prev, loan_refund_amount: rawValue }));
                                } else {
                                  setEditFormData((prev) => ({
                                    ...prev,
                                    loan_amount: rawValue === '' ? '' : Number(rawValue),
                                  }));
                                }
                              }
                            }}
                            placeholder={editSelectedType === 'Refund' ? 'Amount' : 'Amount Given'}
                          />
                        )}
                      </div>
                      <div className="text-left flex-1">
                        <label className={ADVANCE_PORTAL_LABEL_CLASS}>
                          {editSelectedType === 'Transfer' ? 'Transfer Amount' : 'Payment Mode'}
                        </label>
                        {editSelectedType === 'Transfer' ? (
                          <LoanEditAmountInput
                            value={formatLoanEditNumber(editTransferAmount)}
                            onChange={handleEditTransferAmountChange}
                            placeholder="Transfer Amount"
                          />
                        ) : (
                          <Select
                            options={finalPaymentModeOptions}
                            value={editPaymentMode ? { value: editPaymentMode, label: editPaymentMode } : null}
                            onChange={(selected) => setEditPaymentMode(selected ? selected.value : '')}
                            placeholder="Payment Mode"
                            isSearchable
                            isClearable
                            styles={LOAN_EDIT_MODAL_SELECT_STYLES}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            className={ADVANCE_PORTAL_SELECT_CLASS}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 text-left">
                    <div className="flex justify-between mb-[8px]">
                      <label className={ADVANCE_PORTAL_LABEL_CLASS}>File URL</label>
                      {selectedFile && (
                        <span className="text-[14px] text-[#E4572E] font-semibold">{selectedFile.name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-[8px]">
                      <input
                        type="text"
                        name="file_url"
                        value={editFormData.file_url || ''}
                        onChange={(e) => setEditFormData((prev) => ({ ...prev, file_url: e.target.value }))}
                        placeholder="File URL"
                        className="min-w-0 flex-1 h-[40px] text-[14px] py-0 px-2 box-border border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none font-semibold placeholder:font-normal"
                      />
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,image/*,application/pdf"
                        onChange={handleEditFileChange}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isEditSubmitting}
                        className="shrink-0 h-[40px] text-[#BF9853]"
                      >
                        <img src={UploadFile} alt="Upload" className="w-[40px] h-[40px]" />
                      </button>
                    </div>
                  </div>
                  <div className="col-span-2 text-left">
                    <label className={ADVANCE_PORTAL_LABEL_CLASS}>Description</label>
                    <textarea
                      rows={2}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description"
                      className={`${ADVANCE_PORTAL_TEXTAREA_CLASS} hover:!border-[rgba(191,152,83,0.2)] focus:!border-[rgba(191,152,83,1)]`}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 border-2 border-[#BF9853] text-[#BF9853] rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdate}
                    disabled={isEditSubmitting}
                    className={`px-4 py-2 bg-[#BF9853] text-white rounded transition duration-200 ${isEditSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isEditSubmitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {isRequestLoanModalOpen && requestingLoanEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-[400px] text-center">
              <h2 className="text-lg font-bold mb-2 text-[#BF9853]">Request Edit Permission</h2>
              <p className="text-gray-700 mb-6">
                You need admin approval to edit this record.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setIsRequestLoanModalOpen(false);
                    setRequestingLoanEntry(null);
                  }}
                  className="px-4 py-2 border border-[#BF9853] w-[100px] h-[45px] rounded"
                >
                  Cancel
                </button>
                <button onClick={handleSendLoanEditRequest} className="px-4 py-2 bg-[#BF9853] w-[160px] h-[45px] text-white rounded" >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        )}
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
      </div>
    </div>
  );
}
export default LoanTableview
