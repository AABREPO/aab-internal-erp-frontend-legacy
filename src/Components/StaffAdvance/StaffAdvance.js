import { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect } from 'react';
import Select from 'react-select';
import Attach from '../Images/Attachfile.svg';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import {
  postBankRegisterLogSave,
  bankRegisterLogSaveUrlMatchingRequest,
  isPaymentModeRequiringBankRegisterLog,
} from '../../utils/bankRegisterLogBeforeWeeklyBill';
import { notifyOrbitModuleDataChanged } from '../../utils/orbitProjectDataSync';
import { useTabRefreshSignal } from '../../utils/useTabRefreshSignal';
import CustomDateField from '../ExpensesEntry/CustomDateField';
import {
  EDBC_IDS,
  DATABASE_TABLE_FILTER_SELECT_STYLES,
  getEdbcColumnConfig,
  getEdbcColumnHeaderSortProps,
  useEdbcExpandedCells,
  useEdbcTableSort,
  EdbcTableHeaderRow,
  EdbcTableFilterRow,
  EdbcTableBodyRow,
  EdbcColumnHeader,
  EdbcTimestampFilter,
  EdbcSelectFilter,
  EdbcTotalAmountFilter,
  EdbcEmptyFilterCell,
  EdbcDateBodyCell,
  EdbcExpandableBodyCell,
  EdbcActivityBodyCell,
  EDBC_TABLE_EDGE_TABLE_CLASS,
  EDBC2_FIRST_COLUMN_WIDTH_CLASS,
  EdbcFilterToggleButton,
  EdbcTableToolbarRightActions,
  matchesEdbcAmountFilter,
  formatEdbcFilterDateDMY,
} from '../ExpensesEntry/databaseExpensesSharedColumns';

const STAFF_SIDE_TABLE_BLANK_VALUE = 'BLANK';
const STAFF_SIDE_TABLE_BLANK_LABEL = 'Blank';
const staffSideTableBlankOption = { value: STAFF_SIDE_TABLE_BLANK_VALUE, label: STAFF_SIDE_TABLE_BLANK_LABEL };
const STAFF_SIDE_TABLE_COLUMN_LOCK_TABLE_CLASS =
  '[&_thead_tr>th#EDBC-2]:!w-[130px] [&_thead_tr>th#EDBC-2]:!min-w-[130px] [&_thead_tr>th#EDBC-2]:!max-w-[130px] [&_tbody_tr>td#EDBC-2]:!w-[130px] [&_tbody_tr>td#EDBC-2]:!min-w-[130px] [&_tbody_tr>td#EDBC-2]:!max-w-[130px] [&_thead_tr>th#EDBC-2]:!overflow-hidden [&_thead_tr:nth-child(2)>th#EDBC-2>div]:!w-[118px] [&_thead_tr:nth-child(2)>th#EDBC-2>div]:!min-w-[118px] [&_thead_tr:nth-child(2)>th#EDBC-2>div]:!max-w-[118px] [&_thead_tr:nth-child(2)>th#EDBC-2 button]:!w-[118px] [&_thead_tr:nth-child(2)>th#EDBC-2 button]:!min-w-[118px] [&_thead_tr:nth-child(2)>th#EDBC-2 button]:!max-w-[118px] [&_th#EDBC-8]:!w-[120px] [&_td#EDBC-8]:!w-[120px] [&_th#EDBC-8]:!min-w-[120px] [&_td#EDBC-8]:!min-w-[120px] [&_th#EDBC-8]:!max-w-[120px] [&_td#EDBC-8]:!max-w-[120px] [&_th#EDBC-8]:!overflow-hidden [&_td#EDBC-8]:!overflow-hidden [&_th#EDBC-3]:!w-[298px] [&_td#EDBC-3]:!w-[298px] [&_th#EDBC-3]:!min-w-[298px] [&_td#EDBC-3]:!min-w-[298px] [&_th#EDBC-3]:!max-w-[298px] [&_td#EDBC-3]:!max-w-[298px] [&_th#EDBC-3]:!overflow-hidden [&_td#EDBC-3]:!overflow-hidden [&_th#EDBC-13]:!w-[130px] [&_td#EDBC-13]:!w-[130px] [&_th#EDBC-13]:!min-w-[130px] [&_td#EDBC-13]:!min-w-[130px] [&_th#EDBC-13]:!max-w-[130px] [&_td#EDBC-13]:!max-w-[130px] [&_th#EDBC-13]:!overflow-hidden [&_td#EDBC-13]:!overflow-hidden [&_th#EDBC-19]:!w-[70px] [&_td#EDBC-19]:!w-[70px] [&_th#EDBC-19]:!min-w-[70px] [&_td#EDBC-19]:!min-w-[70px] [&_th#EDBC-19]:!max-w-[70px] [&_td#EDBC-19]:!max-w-[70px] [&_thead_tr>th#EDBC-19:last-child]:!pr-[1px] [&_tbody_tr>td#EDBC-19:last-child]:!pr-[1px] [&_thead_tr:nth-child(2)>th:not(#EDBC-3):not(#EDBC-13)]:!overflow-hidden [&_thead_tr:nth-child(2)>th#EDBC-3]:!overflow-visible [&_thead_tr:nth-child(2)>th#EDBC-13]:!overflow-visible';
const STAFF_SIDE_TABLE_FORM_PATH_CSS = `
.expense-form-side-table-host .side-table-form-path .form-side-table-toolbar-row {
  width: 100% !important;
  min-width: 0 !important;
  max-width: 748px !important;
  flex-wrap: wrap !important;
  align-items: flex-start !important;
  align-content: flex-start !important;
}
.expense-form-side-table-host .side-table-form-path .form-side-table-filter-left {
  flex: 1 1 200px !important;
  min-width: 0 !important;
  max-width: 100% !important;
}
.expense-form-side-table-host .side-table-form-path .form-side-table-advance-header {
  width: auto !important;
  min-width: 0 !important;
  max-width: 100% !important;
  flex: none !important;
  margin: 0 !important;
  padding: 0 !important;
}
.expense-form-side-table-host .side-table-form-path .form-side-table-search-column {
  flex: 0 0 auto !important;
  margin-left: auto !important;
  align-items: flex-end !important;
}
.expense-form-side-table-host .side-table-form-path .form-side-table-advance-amount {
  width: auto !important;
  min-width: 0 !important;
  max-width: 100% !important;
  text-align: right !important;
  flex: none !important;
  flex-shrink: 0 !important;
  white-space: nowrap !important;
}
.expense-form-side-table-host .side-table-form-path .form-side-table-search-row {
  flex: 0 0 auto !important;
  justify-content: flex-end !important;
}
`;

const formatStaffSideEdbc8Amount = (value) =>
  `₹${(parseFloat(value) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatStaffSideEdbc8AmountNegative = (value) =>
  `-₹${(Math.abs(parseFloat(value) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const normalizeStaffSideSearchText = (value) =>
  String(value ?? '').toLowerCase().replace(/,/g, '');

const staffEntryMatchesSideTableDateFilter = (entryDate, startDate, endDate) => {
  if (!startDate && !endDate) return true;
  const expenseDate = new Date(entryDate);
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return expenseDate >= start && expenseDate <= end;
  }
  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    return expenseDate >= start;
  }
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return expenseDate <= end;
};

const getStaffSideEntryRowDisplay = (entry, purposeOptions) => {
  const advanceAmount =
    entry.type === 'Refund'
      ? formatStaffSideEdbc8AmountNegative(entry.staff_refund_amount)
      : formatStaffSideEdbc8Amount(entry.amount);
  let transferOrRefund = '';
  if (entry.type === 'Refund') {
    transferOrRefund = 'Refund';
  } else if (entry.type === 'Transfer') {
    const amount = parseFloat(entry.amount) || 0;
    const toPurpose = purposeOptions.find((p) => p.id === entry.to_purpose_id);
    transferOrRefund =
      amount < 0
        ? `Transfer To ${toPurpose?.label || 'Unknown Purpose'}`
        : `Transfer From ${toPurpose?.label || 'Unknown Purpose'}`;
  } else if (entry.staff_refund_amount) {
    transferOrRefund = formatStaffSideEdbc8Amount(entry.staff_refund_amount);
  }
  return {
    advanceAmount,
    transferOrRefund,
    payment_mode: entry.staff_payment_mode || '',
  };
};

const toStaffSideExpenseRow = (entry) => ({ ...entry, id: entry.id, eno: entry.entry_no });

const getFirstVisibleStaffSideTableBodyRow = (scroller) => {
  if (!scroller) return null;
  const thead = scroller.querySelector('thead');
  if (!thead) return null;
  const headerBottom = thead.getBoundingClientRect().bottom;
  const rows = scroller.querySelectorAll('tbody tr');
  let fallback = null;
  for (const row of rows) {
    if (row.querySelector('td[colspan]')) continue;
    const rect = row.getBoundingClientRect();
    if (rect.height <= 0) continue;
    if (!fallback) fallback = row;
    if (rect.top >= headerBottom - 0.5) return row;
  }
  return fallback;
};

const alignStaffSideTableRowBelowHeader = (scroller, row) => {
  if (!scroller || !row) return;
  const thead = scroller.querySelector('thead');
  if (!thead) return;
  const headerBottom = thead.getBoundingClientRect().bottom;
  const rowTop = row.getBoundingClientRect().top;
  const delta = rowTop - headerBottom;
  if (Math.abs(delta) > 0.5) {
    scroller.scrollTop += delta;
  }
};

const ADVANCE_PORTAL_SELECT_CLASS =
  'custom-select rounded-lg w-[300px] h-[40px] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500';
const ADVANCE_PORTAL_AMOUNT_INPUT_CLASS =
  'pl-[20px] pr-4 border-2 border-[#BF9853] rounded-lg w-full h-full focus:outline-none border-opacity-[0.20] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500';
const ADVANCE_PORTAL_READONLY_AMOUNT_INPUT_CLASS =
  'pl-[12px] pr-4 border-2 border-[#BF9853] rounded-lg w-full h-full focus:outline-none border-opacity-[0.20] bg-[#ededed] text-[14px] font-medium cursor-default';
const ADVANCE_PORTAL_FILTER_AMOUNT_INPUT_CLASS =
  'pl-[12px] pr-2 border border-[#00000029] rounded-lg w-full h-full focus:outline-none bg-[#ededed] text-[14px] font-medium cursor-default';
const ADVANCE_PORTAL_TEXTAREA_CLASS =
  'border-2 border-[#BF9853] rounded-md px-[8px] w-[616px] h-[60px] focus:outline-none border-opacity-[0.20] resize-none text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500';
const ADVANCE_PORTAL_LABEL_CLASS = 'text-md font-semibold mb-[8px] block';

const formatNumber = (num) => {
  if (!num) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
const formatAmountDisplay = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const normalized = String(value).replace(/,/g, '');
  const num = Number(normalized);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const AdvancePortalAmountOutput = ({
  value,
  variant = 'form',
  className = '',
  fullWidth = false,
}) => {
  const isFilter = variant === 'filter';
  const isModalReadonly = variant === 'modal-readonly';
  const wrapperClass = isFilter
    ? `relative lg:w-[150px] w-full h-[40px] ${className}`.trim()
    : isModalReadonly
      ? `relative w-full h-[45px] ${className}`.trim()
      : fullWidth
        ? `relative w-full h-[40px] ${className}`.trim()
        : `relative w-[300px] h-[40px] ${className}`.trim();
  const rupeeClass = isFilter
    ? 'absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-600 text-sm pointer-events-none'
    : isModalReadonly
      ? 'absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-600 pointer-events-none'
      : 'absolute top-1/2 left-[8px] transform -translate-y-1/2 text-gray-600 text-lg pointer-events-none';
  const inputClass = isFilter
    ? ADVANCE_PORTAL_FILTER_AMOUNT_INPUT_CLASS
    : isModalReadonly
      ? 'pl-7 pr-3 border-2 border-[#BF9853] border-opacity-25 rounded-lg w-full h-full text-gray-600 bg-gray-100 text-sm cursor-default focus:outline-none'
      : ADVANCE_PORTAL_READONLY_AMOUNT_INPUT_CLASS;
  const formattedValue = formatAmountDisplay(value);
  const displayValue = isModalReadonly
    ? formattedValue
    : (formattedValue ? `₹${formattedValue}` : '');

  return (
    <div className={wrapperClass}>
      {isModalReadonly && <span className={rupeeClass}>₹</span>}
      <input
        type="text"
        readOnly
        tabIndex={-1}
        value={displayValue}
        className={inputClass}
      />
    </div>
  );
};

const AdvancePortalAmountInput = ({
  value,
  onChange,
  placeholder = '',
  variant = 'form',
  className = '',
  fullWidth = false,
}) => {
  const isModal = variant === 'modal';
  const wrapperClass = isModal
    ? `relative w-full h-[45px] ${className}`.trim()
    : fullWidth
      ? `relative w-full h-[40px] ${className}`.trim()
      : `relative w-[300px] h-[40px] ${className}`.trim();
  const rupeeClass = isModal
    ? 'absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-600'
    : 'absolute top-1/2 left-[8px] transform -translate-y-1/2 text-gray-600 text-lg';
  const inputClass = isModal
    ? 'w-full h-[45px] border-2 border-[#BF9853] rounded-lg pl-7 pr-3 border-opacity-20 focus:outline-none text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500'
    : ADVANCE_PORTAL_AMOUNT_INPUT_CLASS;

  return (
    <div className={wrapperClass}>
      <span className={rupeeClass}>₹</span>
      <input
        type="text"
        value={formatNumber(value)}
        onChange={onChange}
        placeholder={placeholder}
        onWheel={(e) => e.target.blur()}
        className={inputClass}
      />
    </div>
  );
};

const StaffAdvance = ({ username, userRoles = [], paymentModeOptions = [], refreshSignal, isActive = true }) => {
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
  // Form state management
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    amountGiven: '',
    paymentMode: '',
    selectedType: '',
    date: new Date().toISOString().split('T')[0], // Set to today's date
    empName: null,
    overallAdvance: '',
    purpose: null,
    advanceAmount: '',
    amountGivenInput: '',
    transferAmount: '',
    description: '',
    labourName: null
  });
  const [staffFromDate, setStaffFromDate] = useState('');
  const [staffToDate, setStaffToDate] = useState('');
  const [staffPaymentMode, setStaffPaymentMode] = useState('');
  const [staffAmountGiven, setStaffAdmountGiven] = useState('');
  const [staffTodayAmount, setTodayAmount] = useState('');
  const [staffTotalOutstanding, setStaffTotalOutstanding] = useState('');
  // Table data state
  const [tableData, setTableData] = useState([]);
  // Filtered table data state - only shows when both EMP Name and Purpose are selected
  const [filteredTableData, setFilteredTableData] = useState([]);
  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  // Payment popup state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentPopupData, setPaymentPopupData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: "",
    paymentMode: "",
    chequeNo: "",
    chequeDate: "",
    transactionNumber: "",
    accountNumber: ""
  });
  const [pendingFormData, setPendingFormData] = useState(null);
  const [accountDetails, setAccountDetails] = useState([]);
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isReviewEditMode, setIsReviewEditMode] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const leftFormColRef = useRef(null);
  const descriptionSectionRef = useRef(null);
  const advanceHeaderRef = useRef(null);
  const [sideTableAreaHeight, setSideTableAreaHeight] = useState(null);
  const [sideTableContentHeight, setSideTableContentHeight] = useState(null);
  const [sideTableOverallSearch, setSideTableOverallSearch] = useState('');
  const [sideTableShowFilters, setSideTableShowFilters] = useState(false);
  const [sideTableFilterDateStart, setSideTableFilterDateStart] = useState('');
  const [sideTableFilterDateEnd, setSideTableFilterDateEnd] = useState('');
  const [sideTableShowDateRangePicker, setSideTableShowDateRangePicker] = useState(false);
  const [sideTableFilterAdvanceAmount, setSideTableFilterAdvanceAmount] = useState('');
  const [sideTableFilterTransferRefund, setSideTableFilterTransferRefund] = useState('');
  const [sideTableFilterMode, setSideTableFilterMode] = useState('');
  const sideTableScrollRef = useRef(null);
  const sideTableFilterRowRef = useRef(null);
  const sideTableFilterNudgeUsedRef = useRef(false);
  const sideTableFilterAnchorRowRef = useRef(null);
  const sideTableFilterScrollTopBeforeToggleRef = useRef(null);
  const sideTableFilterRowHeightBeforeCloseRef = useRef(0);
  const sideTablePendingFilterOpenNudgeRef = useRef(false);
  const sideTablePendingFilterCloseNudgeRef = useRef(false);
  const sideTableFilterChipsScrollRef = useRef(null);
  const sideTableIsFilterChipsDragging = useRef(false);
  const sideTableFilterChipsDragStart = useRef({ x: 0, scrollLeft: 0 });
  // Employee options state
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [laboursList, setLaboursList] = useState([]);
  const [staffAdvanceCombinedOptions, setStaffAdvanceCombinedOptions] = useState([]);
  useEffect(() => {
    const syncBranch = () => {
      const nextBranchId = resolveActiveBranchId();
      setActiveBranchId((prevBranchId) => (prevBranchId === nextBranchId ? prevBranchId : nextBranchId));
    };
    syncBranch();
    window.addEventListener("branchSelectionChanged", syncBranch);
    return () => window.removeEventListener("branchSelectionChanged", syncBranch);
  }, []);
  // Fetch employee details on component mount
  useEffect(() => {
    // Fetch employee details
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
    // Call employee fetch function
    fetchEmployeeDetails();
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

  useEffect(() => { setStaffAdvanceCombinedOptions([...employeeOptions, ...laboursList]); }, [employeeOptions, laboursList]);

  // File change handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
    e.target.value = '';
  };

  // File preview URL effect
  useEffect(() => {
    if (!selectedFile) {
      setFilePreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setFilePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const [purposeOptions, setPurposeOptions] = useState([]);
  // Fetch purpose options from backend on component mount
  useEffect(() => {
    const fetchPurposeOptions = async () => {
      try {
        const response = await fetch("https://backendaab.in/aabuildersDash/api/purposes/getAll", {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
          console.warn("Purposes API not available, using empty data");
          setPurposeOptions([]);
          return;
        }
        const data = await response.json();
        // Format for react-select
        const formatted = data.map(item => ({
          value: item.purpose,
          label: item.purpose,
          id: item.id
        }));
        setPurposeOptions(formatted);
      } catch (error) {
        console.warn("Purpose fetch error:", error);
        setPurposeOptions([]);
      }
    };
    fetchPurposeOptions();
  }, []);
  const customStyles = useMemo(() => ({
    control: (provided, state) => ({
      ...provided,
      fontFamily: 'Manrope',
      borderWidth: '2px',
      borderRadius: '8px',
      minHeight: '40px',
      height: '40px',
      flexWrap: 'nowrap',
      borderColor: state.isFocused
        ? 'rgba(191, 152, 83, 1)'
        : 'rgba(191, 152, 83, 0.2)',
      boxShadow: state.isFocused
        ? '0 0 0 1px rgba(101, 102, 53, 0.2)'
        : 'none',
      '&:hover': {
        borderColor: 'rgba(191, 152, 83, 0.2)',
      },
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
      paddingTop: 0,
      paddingBottom: 0,
      color: 'black',
    }),
    input: (provided) => ({
      ...provided,
      margin: 0,
      padding: 0,
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
      paddingTop: 0,
      paddingBottom: 0,
      maxHeight: '250px',
      overflowY: 'auto',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      '&::-webkit-scrollbar': {
        display: 'none',
      },
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    indicatorsContainer: (provided) => ({
      ...provided,
      flex: '0 0 auto',
      paddingLeft: '0',
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      display: state.hasValue ? 'none' : 'flex',
      color: '#000000',
      flexShrink: 0,
      paddingTop: 0,
      paddingBottom: 0,
    }),
    clearIndicator: (provided) => ({
      ...provided,
      cursor: 'pointer',
      color: '#000000',
      flexShrink: 0,
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: '4px',
      paddingRight: '4px',
    }),
    placeholder: (provided) => ({
      ...provided,
      fontWeight: 'normal',
      fontSize: '14px',
      color: '#A6A5A6',
      margin: 0,
      paddingTop: 0,
      paddingBottom: 0,
      textAlign: 'left',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '100%',
      position: 'absolute',
    }),
    option: (provided, state) => ({
      ...provided,
      minHeight: 36,
      height: 'auto',
      paddingTop: 6,
      paddingBottom: 6,
      whiteSpace: 'normal',
      display: 'flex',
      alignItems: 'center',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTapHighlightColor: '#FAF6ED',
      backgroundColor: state.isSelected
        ? '#BF9853'
        : state.isFocused
          ? '#FAF6ED'
          : provided.backgroundColor,
      color: state.isSelected ? '#FFFFFF' : provided.color,
      ':active': {
        backgroundColor: state.isSelected ? '#BF9853' : '#FAF6ED',
      },
    }),
  }), []);
  // Memoized field configuration to prevent recalculation on every render
  const fieldConfig = useMemo(() => {
    switch (formData.selectedType) {
      case 'Refund':
        return {
          purposeLabel: 'Purpose',
          amountGivenLabel: 'Amount',
          paymentModeLabel: 'Payment Mode',
          showTransferAmount: false
        };
      case 'Transfer':
        return {
          purposeLabel: 'Purpose From',
          amountGivenLabel: 'Purpose To',
          paymentModeLabel: 'Transfer Amount',
          showTransferAmount: true
        };
      default:
        return {
          purposeLabel: 'Purpose',
          amountGivenLabel: 'Amount Given',
          paymentModeLabel: 'Payment Mode',
          showTransferAmount: false
        };
    }
  }, [formData.selectedType]);
  // Payment mode options are now passed as prop from StaffHeading
  // Memoized select type options
  const selectTypeOptions = useMemo(() => [
    { value: 'Advance', label: 'Advance' },
    { value: 'Refund', label: 'Refund' },
    { value: 'Transfer', label: 'Transfer' }
  ], []);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const response = await fetch('https://backendaab.in/aabuildersDash/api/account-details/getAll', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const data = await response.json();
        setAccountDetails(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching account details:', error);
      }
    };
    fetchAccountDetails();
  }, []);

  const accountNumberOptions = useMemo(
    () =>
      accountDetails
        .map((account) => {
          const accountNumber = account?.account_number ?? account?.accountNumber ?? '';
          const value = String(accountNumber).trim();
          if (!value) return null;
          return { value, label: value };
        })
        .filter(Boolean),
    [accountDetails]
  );

  // Handle form input changes
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  // Fetch all records and update table data state
  const fetchRecords = useCallback(async () => {
    try {
      const res = await fetch('https://backendaab.in/aabuildersDash/api/staff-advance/all');
      if (!res.ok) {
        console.warn('Staff advance API not available, using empty data');
        setTableData([]);
        return;
      }
      const data = await res.json();
      setTableData(data);
    } catch (err) {
      console.warn('Error fetching records:', err);
      setTableData([]);
    }
  }, []);

  const filterTableData = useCallback(() => {
    if (!formData.empName || !formData.purpose) {
      setFilteredTableData([]);
      return;
    }
    const filtered = tableData.filter(record => {
      // Check if the selected option is an Employee or Labour
      let matchesEmployee = false;
      if (formData.empName.type === "Employee") {
        // Only check employee_id for Employee type
        matchesEmployee = record.employee_name === formData.empName.value ||
          record.employee_id === formData.empName.id;
      } else if (formData.empName.type === "Labour") {
        // Only check labour_id for Labour type
        matchesEmployee = record.labour_id === formData.empName.id;
      }
      const matchesPurpose = record.purpose === formData.purpose.value ||
        record.purpose_id === formData.purpose.id ||
        record.from_purpose_id === formData.purpose.id;
      return matchesEmployee && matchesPurpose;
    });
    setFilteredTableData(filtered);
  }, [tableData, formData.empName, formData.purpose]);
  useEffect(() => {
    // Clear old-branch data immediately, then load new-branch records
    setTableData([]);
    setFilteredTableData([]);
    fetchRecords();
  }, [fetchRecords]);

  useTabRefreshSignal(refreshSignal, isActive, fetchRecords);

  // Filter table data whenever tableData, empName, or purpose changes
  useEffect(() => {
    filterTableData();
  }, [filterTableData]);

  // Calculate total advance amount for selected employee
  const calculateTotalAdvance = useCallback(() => {
    if (!formData.empName || !tableData.length) {
      return 0;
    }

    const employeeRecords = tableData.filter(record => {
      // Check if the selected option is an Employee or Labour
      if (formData.empName.type === "Employee") {
        // Only check employee_id for Employee type
        return record.employee_name === formData.empName.value ||
          record.employee_id === formData.empName.id ||
          record.emp_name === formData.empName.value;
      } else if (formData.empName.type === "Labour") {
        // Only check labour_id for Labour type
        return record.labour_id === formData.empName.id;
      }
      return false;
    });

    const totalAdvance = employeeRecords.reduce((total, record) => {
      if (record.type === 'Advance') {
        return total + (parseFloat(record.amount) || 0);
      } else if (record.type === 'Refund') {
        return total - (parseFloat(record.staff_refund_amount) || 0);
      }
      return total;
    }, 0);

    return totalAdvance;
  }, [formData.empName, tableData]);

  // Update overall advance when employee selection changes
  useEffect(() => {
    const totalAdvance = calculateTotalAdvance();
    setFormData(prev => ({
      ...prev,
      overallAdvance: totalAdvance.toFixed(2)
    }));
  }, [calculateTotalAdvance]);

  // Calculate total amount for selected purpose and employee
  const calculatePurposeTotal = useCallback(() => {
    if (!formData.purpose || !formData.empName || !tableData.length) {
      return 0;
    }
    const purposeId = formData.purpose.id;
    const employeeId = formData.empName.id;
    const purposeRecords = tableData.filter(record => {
      // Check if the selected option is an Employee or Labour
      let employeeMatch = false;
      if (formData.empName.type === "Employee") {
        // Only check employee_id for Employee type
        employeeMatch = record.employee_name === formData.empName.value ||
          record.employee_id === employeeId ||
          record.emp_name === formData.empName.value;
      } else if (formData.empName.type === "Labour") {
        // Only check labour_id for Labour type
        employeeMatch = record.labour_id === employeeId;
      }
      if (!employeeMatch) return false;
      // Check if purpose matches (only from_purpose_id for all record types)
      return record.purpose === formData.purpose.value ||
        record.purpose_id === purposeId ||
        record.from_purpose_id === purposeId;
    });
    const totalAmount = purposeRecords.reduce((total, record) => {
      const amount = parseFloat(record.amount) || 0;
      const refund = parseFloat(record.staff_refund_amount) || 0;
      if (record.type === "Advance") {
        return total + amount;
      } else if (record.type === "Refund") {
        return total - refund;
      } else if (record.type === "Transfer") {
        // For transfer records, the amount field already contains the correct sign
        // Negative amount means money going out from this purpose
        return total + amount; // amount is already negative, so this subtracts
      }
      return total;
    }, 0);
    return totalAmount;
  }, [formData.purpose, formData.empName, tableData]);
  // Update advance amount when purpose or employee selection changes
  useEffect(() => {
    const purposeTotal = calculatePurposeTotal();
    setFormData(prev => ({
      ...prev,
      advanceAmount: purposeTotal.toFixed(2)
    }));
  }, [calculatePurposeTotal]);
  // Calculate total amount given to all employees based on date range and payment mode
  const calculateTotalAmountGiven = useCallback(() => {
    if (!tableData.length) {
      return 0;
    }
    // Only calculate if both dates are selected (main filter)
    if (!staffFromDate || !staffToDate) {
      return 0;
    }
    let filteredRecords = tableData;
    // Filter by date range (both dates are required - main filter)
    filteredRecords = filteredRecords.filter(record => {
      const recordDate = new Date(record.date);
      const fromDate = new Date(staffFromDate);
      const toDate = new Date(staffToDate);
      return recordDate >= fromDate && recordDate <= toDate;
    });
    // Filter by payment mode (additional filter - optional)
    if (staffPaymentMode) {
      filteredRecords = filteredRecords.filter(record =>
        record.staff_payment_mode === staffPaymentMode
      );
    }
    // Calculate total amount given (only Advance amounts, no subtraction of refunds)
    const totalAmount = filteredRecords.reduce((total, record) => {
      if (record.type === 'Advance') {
        return total + (parseFloat(record.amount) || 0);
      }
      return total;
    }, 0);
    return totalAmount;
  }, [tableData, staffFromDate, staffToDate, staffPaymentMode]);
  // Update amount given when filters change
  useEffect(() => {
    const totalAmount = calculateTotalAmountGiven();
    // Show "0.00" if both dates are not selected, otherwise show the calculated amount
    if (!staffFromDate || !staffToDate) {
      setStaffAdmountGiven("0.00");
    } else {
      setStaffAdmountGiven(totalAmount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }));
    }
  }, [calculateTotalAmountGiven, staffFromDate, staffToDate, staffPaymentMode]);
  // Calculate today's amount for all employees (without any filters)
  const calculateTodayAmount = useCallback(() => {
    if (!tableData.length) {
      return 0;
    }
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const todayRecords = tableData.filter(record => {
      const recordDate = new Date(record.date).toISOString().split('T')[0];
      return recordDate === todayString;
    });
    const todayAmount = todayRecords.reduce((total, record) => {
      if (record.type === 'Advance') {
        return total + (parseFloat(record.amount) || 0);
      }
      return total;
    }, 0);
    return todayAmount;
  }, [tableData]);
  // Calculate total outstanding amount for all employees (without any filters)
  const calculateTotalOutstanding = useCallback(() => {
    if (!tableData.length) {
      return 0;
    }
    const totalOutstanding = tableData.reduce((total, record) => {
      if (record.type === 'Advance') {
        return total + (parseFloat(record.amount) || 0);
      } else if (record.type === 'Refund') {
        return total - (parseFloat(record.staff_refund_amount) || 0);
      }
      return total;
    }, 0);

    return totalOutstanding;
  }, [tableData]);

  // Update today amount when table data changes
  useEffect(() => {
    const todayAmount = calculateTodayAmount();
    setTodayAmount(todayAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }));
  }, [calculateTodayAmount]);

  // Update total outstanding when table data changes
  useEffect(() => {
    const totalOutstanding = calculateTotalOutstanding();
    setStaffTotalOutstanding(totalOutstanding.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }));
  }, [calculateTotalOutstanding]);
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.selectedType || !formData.date || !formData.empName) {
      alert('Please fill in Type, Date, and Employee Name');
      return;
    }
    if ((formData.selectedType === 'Advance' || formData.selectedType === 'Refund') &&
      (!formData.amountGivenInput || (formData.selectedType === 'Advance' && !formData.paymentMode))) {
      alert('Please fill the amount and payment mode');
      return;
    }
    if (formData.selectedType === 'Transfer' &&
      (!formData.purpose || !formData.transferPurpose || !formData.transferAmount)) {
      alert('Please fill all transfer details');
      return;
    }

    // Show review modal first
    setShowReviewModal(true);
    setIsReviewEditMode(false);
  }, [formData]);

  const submitFormData = useCallback(async (dataToSubmit, paymentDetails = null) => {
    setIsSubmitting(true);
    try {
      // Upload file if exists
      let fileUrl = '';
      if (selectedFile) {
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
            second: "2-digit",
            hour12: true
          })
            .replace(",", "")
            .replace(/\s/g, "-");
          const employeeName = dataToSubmit.empName?.label || '';
          const finalName = `${timestamp} ${employeeName}`;
          formData.append('files', selectedFile);
          formData.append('folder', 'FileUpload / Staff_Advances');
          formData.append('fileName', finalName);
          const uploadResponse = await fetch("https://backendaab.in/aabuildersDash/api/files/upload", {
            method: "POST",
            body: formData,
          });
          if (!uploadResponse.ok) {
            throw new Error('File upload failed');
          }
          const uploadResult = await uploadResponse.json();
          fileUrl = uploadResult.urls[0] || '';
        } catch (error) {
          console.error('Error during file upload:', error);
          alert('Error during file upload. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      const resAll = await fetch('https://backendaab.in/aabuildersDash/api/staff-advance/all');
      let allData = [];
      if (resAll.ok) {
        allData = await resAll.json();
      } else {
        console.warn('Staff advance API not available for entry number generation');
      }
      const maxEntryNo = allData.length > 0 ? Math.max(...allData.map(item => item.entryNo || 0)) : 0;
      const nextEntryNo = maxEntryNo + 1;
      const payload = {
        type: dataToSubmit.selectedType,
        date: dataToSubmit.date,
        employee_id: dataToSubmit.empName?.type === "Employee" ? dataToSubmit.empName.id : null,
        labour_id: dataToSubmit.empName?.type === "Labour" ? dataToSubmit.empName.id : null,
        staff_payment_mode: dataToSubmit.paymentMode,
        staff_refund_amount:
          dataToSubmit.selectedType === "Refund"
            ? parseFloat(dataToSubmit.amountGivenInput) || 0
            : 0,
        description: dataToSubmit.description,
        file_url: fileUrl || null,
        entryNo: nextEntryNo,
        weekNo: 0,
        branch_id: activeBranchId,
        entered_by: username,
        source: 'Staff Portal',
      };
      if (dataToSubmit.selectedType === 'Transfer') {
        payload.from_purpose_id = dataToSubmit.purpose.id;
        payload.to_purpose_id = dataToSubmit.transferPurpose.id;
        payload.amount = parseFloat(dataToSubmit.transferAmount) || 0;
      } else {
        payload.from_purpose_id = dataToSubmit.purpose?.id || null;
        payload.to_purpose_id = null;
        payload.amount = dataToSubmit.selectedType === 'Advance' ? parseFloat(dataToSubmit.amountGivenInput) || 0 : 0;
      }
      const staffAdvanceSaveUrl = withBranchUrl('https://backendaab.in/aabuildersDash/api/staff-advance/save');
      if (paymentDetails && isPaymentModeRequiringBankRegisterLog(paymentDetails.paymentMode)) {
        await postBankRegisterLogSave(
          bankRegisterLogSaveUrlMatchingRequest(staffAdvanceSaveUrl),
          "Staff Advance",
          {
            bill_payment_mode: paymentDetails.paymentMode,
            amount: paymentDetails.amount,
            entered_by: username,
            source: "Staff Portal",
          }
        );
      }
      const saveRes = await fetch(staffAdvanceSaveUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!saveRes.ok) {
        console.warn('Save API not available, simulating success');
        toast.success('Record would be saved (API not available)', {
          position: "top-center",
          autoClose: 3000,
          theme: "colored"
        });
        resetForm();
        return;
      }
      const staffAdvanceResult = await saveRes.json();

      // If payment details are provided and payment mode requires weekly payment bills
      if (paymentDetails && ['GPay', 'Gpay', 'PhonePe', 'Net Banking', 'Cheque'].includes(paymentDetails.paymentMode)) {
        const weeklyPaymentBillPayload = {
          date: paymentDetails.date,
          created_at: new Date().toISOString(),
          contractor_id: null,
          vendor_id: null,
          employee_id: dataToSubmit.empName?.type === "Employee" ? dataToSubmit.empName.id : null,
          project_id: null,
          type: dataToSubmit.selectedType,
          bill_payment_mode: paymentDetails.paymentMode,
          amount: parseFloat(paymentDetails.amount),
          status: true,
          weekly_number: "",
          weekly_payment_expense_id: null,
          advance_portal_id: null,
          staff_advance_portal_id: staffAdvanceResult.id || staffAdvanceResult.staffAdvancePortalId,
          claim_payment_id: null,
          purpose_id: payload.from_purpose_id ?? null,
          cheque_number: paymentDetails.chequeNo || null,
          cheque_date: paymentDetails.chequeDate || null,
          transaction_number: paymentDetails.transactionNumber || null,
          account_number: paymentDetails.accountNumber || null,
          branch_id: activeBranchId,
          entered_by: username,
          source: "Staff Portal",
        };
        try {
          const weeklyBillSaveUrl = withBranchUrl("https://backendaab.in/aabuildersDash/api/weekly-payment-bills/save");
          const weeklyPaymentBillResponse = await axios.post(
            weeklyBillSaveUrl,
            weeklyPaymentBillPayload,
            { headers: { "Content-Type": "application/json" } }
          );
          toast.success('Record saved successfully and added to Weekly Payment Bills!', {
            position: "top-center",
            autoClose: 3000,
            theme: "colored"
          });
        } catch (weeklyError) {
          console.error('Error saving to weekly payment bills:', weeklyError);
          toast.success('Record saved successfully! (Weekly Payment Bills failed)', {
            position: "top-center",
            autoClose: 3000,
            theme: "colored"
          });
        }
      } else {
        toast.success('Record saved successfully!', {
          position: "top-center",
          autoClose: 3000,
          theme: "colored"
        });
      }
      resetForm();
      await fetchRecords();
      notifyOrbitModuleDataChanged('staffadvance');
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Error saving data');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedFile, fetchRecords, withBranchUrl, activeBranchId]);

  // Handle payment popup submission
  const handlePaymentSubmit = useCallback(async () => {
    if (!paymentPopupData.paymentMode) {
      alert("Please select a payment mode.");
      return;
    }
    if (!paymentPopupData.amount) {
      alert("Please enter an amount.");
      return;
    }
    if (!paymentPopupData.accountNumber) {
      alert("Please select account number.");
      return;
    }
    if (
      paymentPopupData.paymentMode === "Cheque" &&
      (!paymentPopupData.chequeNo || !paymentPopupData.chequeDate)
    ) {
      alert("Please enter cheque number and date.");
      return;
    }

    // Close the popup and submit with payment details
    setShowPaymentModal(false);
    await submitFormData(pendingFormData, paymentPopupData);

    // Reset payment popup data
    setPaymentPopupData({
      date: new Date().toISOString().split('T')[0],
      amount: "",
      paymentMode: "",
      chequeNo: "",
      chequeDate: "",
      transactionNumber: "",
      accountNumber: ""
    });
    setPendingFormData(null);
  }, [paymentPopupData, pendingFormData, submitFormData]);

  // Handle keyboard enter key press
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);
  // Check if field is required
  const isRequired = useCallback((field) => {
    const requiredFields = ['selectedType', 'date', 'empName'];
    return requiredFields.includes(field);
  }, []);
  // Reset form
  const resetForm = useCallback(() => {
    setFormData(prev => ({
      fromDate: '',
      toDate: '',
      amountGiven: '',
      paymentMode: '',
      selectedType: prev.selectedType, // Preserve selected type
      date: new Date().toISOString().split('T')[0], // Set to today's date
      empName: prev.empName, // Preserve selected employee
      overallAdvance: '',
      purpose: prev.purpose, // Preserve selected purpose
      advanceAmount: '',
      amountGivenInput: '',
      transferAmount: '',
      description: ''
    }));
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);
  // Delete table row
  const deleteRow = useCallback((id) => {
    setTableData(prev => prev.filter(record => record.id !== id));
    // The filtered data will be updated automatically via useEffect
  }, []);
  // Clear all table data
  const clearTable = useCallback(() => {
    if (filteredTableData.length > 0) {
      // Remove only the filtered records from the main table data
      const filteredIds = filteredTableData.map(record => record.id);
      setTableData(prev => prev.filter(record => !filteredIds.includes(record.id)));
      toast.success('Filtered records cleared!', {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
    }
  }, [filteredTableData.length, filteredTableData]);
  // Export functions
  const exportToPDF = useCallback(() => {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      // Add title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Staff Advance Report', 20, 20);
      // Add date range if available
      if (staffFromDate && staffToDate) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date Range: ${staffFromDate} to ${staffToDate}`, 20, 30);
      }
      // Add employee and purpose info if selected
      if (formData.empName && formData.purpose) {
        doc.setFontSize(10);
        doc.text(`Employee: ${formData.empName.label}`, 20, 40);
        doc.text(`Purpose: ${formData.purpose.label}`, 20, 47);
      }
      // Prepare table data
      const tableData = filteredTableData.length > 0 ? filteredTableData : [];
      if (tableData.length === 0) {
        doc.setFontSize(12);
        doc.text('No data available for export', 20, 60);
        doc.save('staff-advance-report.pdf');
        return;
      }
      // Prepare table columns and rows
      const columns = [
        { title: 'Date', dataKey: 'date' },
        { title: 'Advance', dataKey: 'advance' },
        { title: 'Transfer/Refund', dataKey: 'transferRefund' },
        { title: 'Mode', dataKey: 'mode' },
        { title: 'Type', dataKey: 'type' }
      ];
      const rows = tableData.map(record => {
        const advanceAmount = record.type === "Refund"
          ? -Math.abs(record.staff_refund_amount || 0)
          : record.amount;
        const transferRefund = record.type === "Refund"
          ? "Refund"
          : record.type === "Transfer"
            ? (() => {
              const amount = parseFloat(record.amount) || 0;
              if (amount < 0) {
                const toPurposeId = record.to_purpose_id;
                const toPurpose = purposeOptions.find(p => p.id === toPurposeId);
                return `Transfer To ${toPurpose?.label || 'Unknown Purpose'}`;
              } else {
                const fromPurposeId = record.to_purpose_id;
                const fromPurpose = purposeOptions.find(p => p.id === fromPurposeId);
                return `Transfer From ${fromPurpose?.label || 'Unknown Purpose'}`;
              }
            })()
            : record.staff_refund_amount;
        return {
          date: record.date,
          advance: advanceAmount,
          transferRefund: transferRefund,
          mode: record.staff_payment_mode || '',
          type: record.type
        };
      });
      // Add table to PDF
      doc.autoTable({
        columns: columns,
        body: rows,
        startY: 60,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        alternateRowStyles: {
          fillColor: [255, 255, 255],
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        columnStyles: {
          advance: {
            halign: 'right',
            lineColor: [0, 0, 0],
            lineWidth: 0.1
          },
          transferRefund: {
            halign: 'center',
            lineColor: [0, 0, 0],
            lineWidth: 0.1
          },
          mode: {
            halign: 'center',
            lineColor: [0, 0, 0],
            lineWidth: 0.1
          },
          type: {
            halign: 'center',
            lineColor: [0, 0, 0],
            lineWidth: 0.1
          }
        },
        tableLineColor: [0, 0, 0],
        tableLineWidth: 0.1,
      });
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      if (formData.empName && formData.purpose) {
        doc.text(`Total Advance Amount: ${formData.advanceAmount}`, 20, finalY);
      }
      if (staffFromDate && staffToDate) {
        doc.text(`Total Amount Given (${staffFromDate} to ${staffToDate}): ${staffAmountGiven}`, 20, finalY + 10);
      }
      doc.text(`Today's Amount: ${staffTodayAmount}`, 20, finalY + 20);
      doc.text(`Total Outstanding: ${staffTotalOutstanding}`, 20, finalY + 30);
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, doc.internal.pageSize.height - 10);
      }
      const fileName = `staff-advance-report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      toast.success('PDF exported successfully!', {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  }, [filteredTableData, formData, staffFromDate, staffToDate, staffAmountGiven, staffTodayAmount, staffTotalOutstanding, purposeOptions]);
  const exportToExcel = useCallback(() => {
    try {
      // Prepare table data
      const tableData = filteredTableData.length > 0 ? filteredTableData : [];

      if (tableData.length === 0) {
        alert('No data available for export');
        return;
      }

      // Create CSV content starting with title (like PDF)
      const csvRows = [];

      // Add title (like PDF)
      csvRows.push(['Staff Advance Report']);
      csvRows.push(['']); // Empty row

      // Add date range if available (like PDF)
      if (staffFromDate && staffToDate) {
        csvRows.push([`Date Range: ${staffFromDate} to ${staffToDate}`]);
      }

      // Add employee and purpose info if selected (like PDF)
      if (formData.empName && formData.purpose) {
        csvRows.push([`Employee: ${formData.empName.label}`]);
        csvRows.push([`Purpose: ${formData.purpose.label}`]);
      }

      csvRows.push(['']); // Empty row before table

      // Create table headers (same as PDF)
      const headers = ['Date', 'Advance', 'Transfer/Refund', 'Mode', 'Type'];
      csvRows.push(headers);

      // Create table data rows (same logic as PDF)
      const dataRows = tableData.map(record => {
        const advanceAmount = record.type === "Refund"
          ? -Math.abs(record.staff_refund_amount || 0)
          : record.amount;

        const transferRefund = record.type === "Refund"
          ? "Refund"
          : record.type === "Transfer"
            ? (() => {
              const amount = parseFloat(record.amount) || 0;
              if (amount < 0) {
                const toPurposeId = record.to_purpose_id;
                const toPurpose = purposeOptions.find(p => p.id === toPurposeId);
                return `Transfer To ${toPurpose?.label || 'Unknown Purpose'}`;
              } else {
                const fromPurposeId = record.to_purpose_id;
                const fromPurpose = purposeOptions.find(p => p.id === fromPurposeId);
                return `Transfer From ${fromPurpose?.label || 'Unknown Purpose'}`;
              }
            })()
            : record.staff_refund_amount;

        return [
          record.date,
          advanceAmount,
          transferRefund,
          record.staff_payment_mode || '',
          record.type
        ];
      });

      // Add data rows
      csvRows.push(...dataRows);

      // Add empty row before summary (like PDF)
      csvRows.push(['']);

      // Add summary information (same as PDF)
      if (formData.empName && formData.purpose) {
        csvRows.push([`Total Advance Amount: ${formData.advanceAmount}`]);
      }

      if (staffFromDate && staffToDate) {
        csvRows.push([`Total Amount Given (${staffFromDate} to ${staffToDate}): ${staffAmountGiven}`]);
      }

      csvRows.push([`Today's Amount: ${staffTodayAmount}`]);
      csvRows.push([`Total Outstanding: ${staffTotalOutstanding}`]);

      // Add empty row
      csvRows.push(['']);

      // Add footer (like PDF)
      csvRows.push([`Generated on: ${new Date().toLocaleDateString()}`]);

      // Convert to CSV format
      const csvContent = csvRows.map(row =>
        row.map(field => {
          // Escape fields that contain commas, quotes, or newlines
          if (typeof field === 'string' && (field.includes(',') || field.includes('"') || field.includes('\n'))) {
            return `"${field.replace(/"/g, '""')}"`;
          }
          return field;
        }).join(',')
      ).join('\n');

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);

      const fileName = `staff-advance-report-${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV exported successfully!', {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });

    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('Error generating CSV. Please try again.');
    }
  }, [filteredTableData, formData, staffFromDate, staffToDate, staffAmountGiven, staffTodayAmount, staffTotalOutstanding, purposeOptions]);
  const printData = useCallback(() => {
    console.log('Printing...');
    // Add print logic
  }, []);

  const { sortField: sideTableSortField, sortDirection: sideTableSortDirection, handleSort: handleSideTableSort, clearSort: clearSideTableSort } = useEdbcTableSort();
  const { expandedCells: sideTableExpandedCells, toggleExpandedCell: toggleSideTableExpandedCell } = useEdbcExpandedCells();
  const edbc8Config = getEdbcColumnConfig(EDBC_IDS.EDBC8);
  const edbc3Config = getEdbcColumnConfig(EDBC_IDS.EDBC3);
  const edbc13Config = getEdbcColumnConfig(EDBC_IDS.EDBC13);
  const edbc19Config = getEdbcColumnConfig(EDBC_IDS.EDBC19);
  const edbc2ColumnWidthClass = EDBC2_FIRST_COLUMN_WIDTH_CLASS;
  const sideTableEdbcSortProps = useMemo(
    () => getEdbcColumnHeaderSortProps(sideTableSortField, sideTableSortDirection, handleSideTableSort),
    [sideTableSortField, sideTableSortDirection, handleSideTableSort],
  );
  const sideTableColumnWidthClasses = useMemo(
    () => [
      edbc2ColumnWidthClass,
      edbc8Config?.columnWidthClass,
      edbc3Config?.columnWidthClass,
      edbc13Config?.columnWidthClass,
      edbc19Config?.columnWidthClass,
    ].filter(Boolean),
    [edbc2ColumnWidthClass, edbc8Config, edbc3Config, edbc13Config, edbc19Config],
  );
  const sideTableModeFilterOptions = useMemo(() => {
    const modes = new Set();
    filteredTableData.forEach((entry) => {
      const mode = (entry.staff_payment_mode || '').trim();
      if (mode) modes.add(mode);
    });
    return Array.from(modes)
      .sort((a, b) => a.localeCompare(b))
      .map((mode) => ({ value: mode, label: mode }));
  }, [filteredTableData]);
  const sideTableTransferRefundFilterOptions = useMemo(() => {
    const seen = new Set();
    const options = [staffSideTableBlankOption];
    filteredTableData.forEach((entry) => {
      const { transferOrRefund } = getStaffSideEntryRowDisplay(entry, purposeOptions);
      const value = (transferOrRefund || '').trim();
      if (!value || seen.has(value)) return;
      seen.add(value);
      options.push({ value, label: value });
    });
    options.sort((a, b) => {
      if (a.value === STAFF_SIDE_TABLE_BLANK_VALUE) return -1;
      if (b.value === STAFF_SIDE_TABLE_BLANK_VALUE) return 1;
      return a.label.localeCompare(b.label);
    });
    return options;
  }, [filteredTableData, purposeOptions]);
  const sideTableEntriesForFilter = useMemo(() => {
    let entries = filteredTableData;
    if (sideTableFilterDateStart || sideTableFilterDateEnd) {
      entries = entries.filter((entry) =>
        staffEntryMatchesSideTableDateFilter(entry.date, sideTableFilterDateStart, sideTableFilterDateEnd),
      );
    }
    if (sideTableFilterTransferRefund) {
      if (sideTableFilterTransferRefund === STAFF_SIDE_TABLE_BLANK_VALUE) {
        entries = entries.filter(
          (entry) => !getStaffSideEntryRowDisplay(entry, purposeOptions).transferOrRefund.trim(),
        );
      } else {
        entries = entries.filter(
          (entry) =>
            getStaffSideEntryRowDisplay(entry, purposeOptions).transferOrRefund === sideTableFilterTransferRefund,
        );
      }
    }
    if (sideTableFilterMode) {
      entries = entries.filter(
        (entry) => (entry.staff_payment_mode || '').toLowerCase() === sideTableFilterMode.toLowerCase(),
      );
    }
    if (sideTableFilterAdvanceAmount.trim()) {
      entries = entries.filter((entry) => {
        const amountVal = entry.type === 'Refund' ? entry.staff_refund_amount : entry.amount;
        return matchesEdbcAmountFilter(amountVal, sideTableFilterAdvanceAmount);
      });
    }
    if (!sideTableOverallSearch.trim()) return entries;
    const q = normalizeStaffSideSearchText(sideTableOverallSearch.trim());
    return entries.filter((entry) => {
      const { advanceAmount, transferOrRefund, payment_mode } = getStaffSideEntryRowDisplay(entry, purposeOptions);
      const searchable = normalizeStaffSideSearchText(
        [
          new Date(entry.date).toLocaleDateString('en-GB'),
          advanceAmount,
          transferOrRefund,
          payment_mode,
          entry.entry_no,
          entry.type,
          entry.description,
          entry.amount,
          entry.staff_refund_amount,
        ].join(' '),
      );
      return searchable.includes(q);
    });
  }, [
    filteredTableData,
    purposeOptions,
    sideTableFilterDateStart,
    sideTableFilterDateEnd,
    sideTableFilterTransferRefund,
    sideTableFilterMode,
    sideTableFilterAdvanceAmount,
    sideTableOverallSearch,
  ]);
  const sideTableAdvanceTotal = useMemo(
    () =>
      sideTableEntriesForFilter.reduce((total, entry) => {
        if (entry.type === 'Refund') {
          return total - (Number(entry.staff_refund_amount) || 0);
        }
        return total + (Number(entry.amount) || 0);
      }, 0),
    [sideTableEntriesForFilter],
  );
  const sideTableSortedEntries = useMemo(() => {
    const entries = [...sideTableEntriesForFilter];
    if (!sideTableSortField) {
      return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return entries.sort((a, b) => {
      let aValue;
      let bValue;
      if (sideTableSortField === 'amount') {
        const amountVal = (entry) =>
          entry.type === 'Refund' ? -(Number(entry.staff_refund_amount) || 0) : Number(entry.amount) || 0;
        aValue = amountVal(a);
        bValue = amountVal(b);
      } else if (sideTableSortField === 'paymentMode') {
        aValue = (a.staff_payment_mode || '').toLowerCase();
        bValue = (b.staff_payment_mode || '').toLowerCase();
      } else if (sideTableSortField === 'date') {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      } else {
        aValue = String(a[sideTableSortField] ?? '').toLowerCase();
        bValue = String(b[sideTableSortField] ?? '').toLowerCase();
      }
      if (aValue < bValue) return sideTableSortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sideTableSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sideTableEntriesForFilter, sideTableSortField, sideTableSortDirection]);
  const sideTableHasActiveColumnFilters =
    sideTableFilterDateStart ||
    sideTableFilterDateEnd ||
    sideTableFilterTransferRefund ||
    sideTableFilterMode ||
    sideTableFilterAdvanceAmount.trim();
  const clearSideTableFilters = useCallback(() => {
    setSideTableFilterDateStart('');
    setSideTableFilterDateEnd('');
    setSideTableShowDateRangePicker(false);
    setSideTableFilterTransferRefund('');
    setSideTableFilterMode('');
    setSideTableFilterAdvanceAmount('');
    setSideTableOverallSearch('');
    clearSideTableSort();
  }, [clearSideTableSort]);

  const handleSideTableFilterChipsMouseDown = (e) => {
    if (!sideTableFilterChipsScrollRef.current || e.target.closest('button')) return;
    sideTableIsFilterChipsDragging.current = true;
    sideTableFilterChipsDragStart.current = {
      x: e.clientX,
      scrollLeft: sideTableFilterChipsScrollRef.current.scrollLeft,
    };
    sideTableFilterChipsScrollRef.current.style.cursor = 'grabbing';
    sideTableFilterChipsScrollRef.current.style.userSelect = 'none';
  };
  const handleSideTableFilterChipsMouseMove = (e) => {
    if (!sideTableIsFilterChipsDragging.current || !sideTableFilterChipsScrollRef.current) return;
    e.preventDefault();
    const dx = e.clientX - sideTableFilterChipsDragStart.current.x;
    sideTableFilterChipsScrollRef.current.scrollLeft =
      sideTableFilterChipsDragStart.current.scrollLeft - dx;
  };
  const handleSideTableFilterChipsMouseUp = () => {
    if (!sideTableFilterChipsScrollRef.current) return;
    sideTableIsFilterChipsDragging.current = false;
    sideTableFilterChipsScrollRef.current.style.cursor = 'grab';
    sideTableFilterChipsScrollRef.current.style.userSelect = '';
  };

  const toggleSideTableFilters = useCallback(() => {
    const willOpen = !sideTableShowFilters;
    const scroller = sideTableScrollRef.current;
    if (willOpen) {
      if (scroller) {
        sideTableFilterAnchorRowRef.current = getFirstVisibleStaffSideTableBodyRow(scroller);
        sideTableFilterScrollTopBeforeToggleRef.current = scroller.scrollTop;
      }
      sideTablePendingFilterOpenNudgeRef.current = true;
      setSideTableShowFilters(true);
      return;
    }
    if (scroller) {
      sideTableFilterAnchorRowRef.current = getFirstVisibleStaffSideTableBodyRow(scroller);
      sideTableFilterScrollTopBeforeToggleRef.current = scroller.scrollTop;
      sideTableFilterRowHeightBeforeCloseRef.current = sideTableFilterRowRef.current?.offsetHeight || 0;
    }
    sideTablePendingFilterCloseNudgeRef.current = true;
    setSideTableShowFilters(false);
  }, [sideTableShowFilters]);

  useLayoutEffect(() => {
    const el = document.createElement('style');
    el.setAttribute('data-staff-side-table-form-path', '');
    el.textContent = STAFF_SIDE_TABLE_FORM_PATH_CSS;
    document.head.appendChild(el);
    return () => {
      el.remove();
    };
  }, []);

  useLayoutEffect(() => {
    const scroller = sideTableScrollRef.current;
    const row = sideTableFilterAnchorRowRef.current;
    if (!scroller || !row || !scroller.contains(row)) return;

    if (sideTableShowFilters && sideTablePendingFilterOpenNudgeRef.current) {
      sideTablePendingFilterOpenNudgeRef.current = false;
      const savedTop = sideTableFilterScrollTopBeforeToggleRef.current;
      const filterH = sideTableFilterRowRef.current?.offsetHeight || 0;
      if (savedTop != null && filterH > 0) {
        scroller.scrollTop = savedTop + filterH;
      }
      sideTableFilterScrollTopBeforeToggleRef.current = null;
      alignStaffSideTableRowBelowHeader(scroller, row);
      sideTableFilterNudgeUsedRef.current = true;
      return;
    }

    if (!sideTableShowFilters && sideTablePendingFilterCloseNudgeRef.current) {
      sideTablePendingFilterCloseNudgeRef.current = false;
      const savedTop = sideTableFilterScrollTopBeforeToggleRef.current;
      const filterH = sideTableFilterRowHeightBeforeCloseRef.current || 0;
      if (savedTop != null && filterH > 0) {
        scroller.scrollTop = Math.max(0, savedTop - filterH);
      }
      sideTableFilterScrollTopBeforeToggleRef.current = null;
      sideTableFilterRowHeightBeforeCloseRef.current = 0;
      alignStaffSideTableRowBelowHeader(scroller, row);
      sideTableFilterNudgeUsedRef.current = false;
    }
  }, [sideTableShowFilters]);

  // Review modal handlers
  const handleReviewConfirm = useCallback(() => {
    if (isReviewEditMode) {
      return;
    }
    // Validate again before proceeding
    if (!formData.selectedType || !formData.date || !formData.empName) {
      alert('Please fill in Type, Date, and Employee Name');
      return;
    }
    if ((formData.selectedType === 'Advance' || formData.selectedType === 'Refund') &&
      (!formData.amountGivenInput || (formData.selectedType === 'Advance' && !formData.paymentMode))) {
      alert('Please fill the amount and payment mode');
      return;
    }
    if (formData.selectedType === 'Transfer' &&
      (!formData.purpose || !formData.transferPurpose || !formData.transferAmount)) {
      alert('Please fill all transfer details');
      return;
    }

    // Check if payment mode requires popup
    if ((formData.selectedType === 'Advance' || formData.selectedType === 'Refund') &&
      ['GPay', 'Gpay', 'PhonePe', 'Net Banking', 'Cheque'].includes(formData.paymentMode)) {
      // Store form data and show payment popup
      setPendingFormData({ ...formData });
      setPaymentPopupData(prev => ({
        ...prev,
        amount: formData.amountGivenInput,
        paymentMode: formData.paymentMode
      }));
      setShowPaymentModal(true);
      setShowReviewModal(false);
      return;
    }

    // For other payment modes, proceed with normal submission
    submitFormData(formData);
    setShowReviewModal(false);
  }, [formData, isReviewEditMode, submitFormData]);

  const handleReviewClose = useCallback(() => {
    setShowReviewModal(false);
    setIsReviewEditMode(false);
  }, []);

  const handleReviewSave = useCallback(() => {
    // Validate before saving
    if (!formData.selectedType || !formData.date || !formData.empName) {
      alert('Please fill in Type, Date, and Employee Name');
      return;
    }
    setIsReviewEditMode(false);
  }, [formData]);

  const renderReviewRow = useCallback((label, value) => (
    <div className="flex justify-between gap-4 border border-gray-100 rounded-lg px-4 py-2" key={label}>
      <span className="text-sm font-semibold text-gray-600">{label}</span>
      <span className="text-sm text-gray-800 text-right break-words">{value || '-'}</span>
    </div>
  ), []);

  const formatDateForReview = useCallback((dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }, []);

  const handleChangeAttachment = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const isPdfPreview = selectedFile?.type?.toLowerCase().includes('pdf');

  // Prepare review details
  const reviewDetails = [
    { label: 'Type', value: formData.selectedType || '-' },
    { label: 'Date', value: formatDateForReview(formData.date) || '-' },
    { label: 'Employee/Labour Name', value: formData.empName?.label || '-' },
    { label: 'Overall Advance', value: formData.overallAdvance ? `₹${formData.overallAdvance}` : '-' },
    { label: 'Purpose', value: formData.purpose?.label || '-' },
    { label: 'Advance Amount', value: formData.advanceAmount ? `₹${formData.advanceAmount}` : '-' },
  ];

  if (formData.selectedType === 'Transfer') {
    reviewDetails.push(
      { label: 'Transfer Amount', value: formData.transferAmount ? `₹${formData.transferAmount}` : '-' },
      { label: 'Transfer To Purpose', value: formData.transferPurpose?.label || '-' }
    );
  } else if (formData.selectedType === 'Refund') {
    reviewDetails.push(
      { label: 'Refund Amount', value: formData.amountGivenInput ? `₹${formData.amountGivenInput}` : '-' },
      { label: 'Payment Mode', value: formData.paymentMode || '-' }
    );
  } else if (formData.selectedType === 'Advance') {
    reviewDetails.push(
      { label: 'Amount Given', value: formData.amountGivenInput ? `₹${formData.amountGivenInput}` : '-' },
      { label: 'Payment Mode', value: formData.paymentMode || '-' }
    );
  }

  reviewDetails.push(
    { label: 'Description', value: formData.description || '-' },
    { label: 'File Attached', value: selectedFile ? selectedFile.name : 'No file attached' }
  );

  // Edit functionality
  const handleEditClick = useCallback((record) => {
    setEditingId(record.id);
    setEditFormData({
      selectedType: record.type || '',
      date: record.date?.split('T')[0] || '',
      empName:
        employeeOptions.find(emp => emp.id === record.employee_id) ||
        laboursList.find(labour => labour.id === record.labour_id) ||
        null,
      purpose: purposeOptions.find(purpose => purpose.id === record.from_purpose_id) || null,
      amountGivenInput: record.amount || '',
      paymentMode: record.staff_payment_mode || '',
      transferPurpose: purposeOptions.find(purpose => purpose.id === record.to_purpose_id) || null,
      transferAmount: record.type === 'Transfer' ? record.amount : '',
      overallAdvance: '',
      advanceAmount: ''
    });
    setIsEditModalOpen(true);
  }, [employeeOptions, laboursList, purposeOptions]);

  const handleUpdate = useCallback(async () => {
    try {
      const updatePayload = {
        type: editFormData.selectedType,
        date: editFormData.date,
        employee_id: editFormData.empName?.type === "Employee" ? editFormData.empName.id : null,
        labour_id: editFormData.empName?.type === "Labour" ? editFormData.empName.id : null,
        from_purpose_id: editFormData.purpose?.id,
        amount: editFormData.amountGivenInput,
        staff_payment_mode: editFormData.paymentMode,
        branch_id: editFormData.branch_id ?? activeBranchId,
        source: 'Staff Portal',
      };
      if (editFormData.selectedType === 'Transfer') {
        updatePayload.to_purpose_id = editFormData.transferPurpose?.id;
        updatePayload.amount = editFormData.transferAmount;
      }
      const res = await fetch(withBranchUrl(`https://backendaab.in/aabuildersDash/api/staff-advance/${editingId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success('Record updated successfully!', {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      setIsEditModalOpen(false);
      await fetchRecords();
      notifyOrbitModuleDataChanged('staffadvance');
    } catch (err) {
      console.error('Error updating record:', err);
      alert('Error updating record');
    }
  }, [editingId, editFormData, fetchRecords, activeBranchId, withBranchUrl]);

  useEffect(() => {
    const syncSideTableHeights = () => {
      if (window.innerWidth < 1280) {
        setSideTableAreaHeight(null);
        setSideTableContentHeight(null);
        return;
      }
      const leftEl = leftFormColRef.current;
      const descriptionEl = descriptionSectionRef.current;
      if (!leftEl || !descriptionEl) return;
      const leftTop = leftEl.getBoundingClientRect().top;
      const descriptionBottom = descriptionEl.getBoundingClientRect().bottom;
      const alignHeight = Math.round(descriptionBottom - leftTop);
      if (alignHeight > 0) {
        setSideTableAreaHeight(alignHeight);
        setSideTableContentHeight(alignHeight);
      }
    };
    const scheduleSync = () => {
      requestAnimationFrame(() => requestAnimationFrame(syncSideTableHeights));
    };
    scheduleSync();
    const leftEl = leftFormColRef.current;
    if (!leftEl) return undefined;
    const ro = new ResizeObserver(scheduleSync);
    ro.observe(leftEl);
    const descriptionEl = descriptionSectionRef.current;
    if (descriptionEl) ro.observe(descriptionEl);
    const headerEl = advanceHeaderRef.current;
    if (headerEl) ro.observe(headerEl);
    window.addEventListener('resize', scheduleSync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', scheduleSync);
    };
  }, [formData.selectedType]);

  return (
    <div className="flex flex-col h-[calc(100vh-104px)] overflow-hidden bg-[#FAF6ED]">
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden px-[18px] pt-[18px] pb-[18px] bg-[#FAF6ED]">
        <div className="w-full pt-[18px] px-[18px] pb-[18px] rounded-[6px] bg-white mb-[18px] text-left flex items-center gap-6">
          <div className="flex flex-wrap gap-[10px] w-full">
            <div>
              <label className="block mb-[8px] font-semibold text-sm sm:text-base">From Date</label>
              <div className="w-[150px]">
                <CustomDateField
                  value={staffFromDate}
                  onChange={setStaffFromDate}
                  placeholder="From Date"
                  className="w-[150px] [&>div]:!w-[150px] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                  controlHeightPx={40}
                  alwaysOpenBelow
                  anchor="right"
                />
              </div>
            </div>
            <div>
              <label className="block mb-[8px] font-semibold text-sm sm:text-base">To Date</label>
              <div className="w-[150px]">
                <CustomDateField
                  value={staffToDate}
                  onChange={setStaffToDate}
                  placeholder="To Date"
                  className="w-[150px] [&>div]:!w-[150px] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                  controlHeightPx={40}
                  alwaysOpenBelow
                  anchor="right"
                />
              </div>
            </div>
            <div>
              <label className="block mb-[8px] font-semibold text-sm sm:text-base">Payment Mode</label>
              <Select
                value={paymentModeOptions.find(option => option.value === staffPaymentMode) || null}
                onChange={(selected) => setStaffPaymentMode(selected ? selected.value : '')}
                options={paymentModeOptions}
                placeholder="Payment Mode"
                isClearable
                isSearchable
                menuPortalTarget={document.body}
                styles={{
                  ...customStyles,
                  placeholder: (provided) => ({
                    ...customStyles.placeholder(provided),
                    color: '#A6A5A6',
                  }),
                  dropdownIndicator: (provided, state) => ({
                    ...customStyles.dropdownIndicator(provided, state),
                    paddingLeft: 0,
                    paddingRight: 4,
                  }),
                }}
                className="lg:w-[150px] rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block mb-[8px] font-semibold text-sm sm:text-base">Amount Given</label>
              <AdvancePortalAmountOutput variant="filter" value={staffAmountGiven} />
            </div>
            <div>
              <label className="block mb-[8px] font-semibold text-sm sm:text-base">Today Amount</label>
              <AdvancePortalAmountOutput variant="filter" value={staffTodayAmount} />
            </div>
            <div>
              <label className="block mb-[8px] font-semibold text-sm sm:text-base">Total Outstanding</label>
              <AdvancePortalAmountOutput variant="filter" value={staffTotalOutstanding} />
            </div>
          </div>
        </div>

        <div className="w-full flex-1 min-h-0 min-w-0 max-xl:overflow-y-auto xl:overflow-hidden no-scrollbar scrollbar-none flex flex-col pt-[18px] px-[18px] pb-[18px] bg-white rounded-[6px]">
          <form onSubmit={handleSubmit} onKeyPress={handleKeyPress} className="max-xl:flex-none xl:flex flex-1 min-h-0 xl:min-w-0 gap-[18px]">
            <div className="shrink-0 w-fit" ref={leftFormColRef}>
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="text-left max-w-[300px]">
                  <label className={ADVANCE_PORTAL_LABEL_CLASS}>
                    Select Type{isRequired('selectedType') && <span className="text-[#E4572E]">*</span>}
                  </label>
                  <Select
                    value={selectTypeOptions.find(option => option.value === formData.selectedType) || null}
                    onChange={(selected) => handleInputChange('selectedType', selected ? selected.value : '')}
                    options={selectTypeOptions}
                    placeholder="Select Type..."
                    isClearable
                    isSearchable
                    menuPortalTarget={document.body}
                    styles={customStyles}
                    className={ADVANCE_PORTAL_SELECT_CLASS}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                </div>
                <div className="text-left">
                  <label className={ADVANCE_PORTAL_LABEL_CLASS}>
                    Date{isRequired('date') && <span className="text-[#E4572E]">*</span>}
                  </label>
                  <div className="expense-entry-form-date w-[300px]">
                    <CustomDateField
                      value={formData.date}
                      onChange={(value) => handleInputChange('date', value)}
                      placeholder="Date"
                      className="w-full text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                      controlHeightPx={40}
                      alwaysOpenBelow
                      anchor="right"
                    />
                  </div>
                </div>
                <div className="text-left">
                  <div className="flex justify-between mb-[8px]">
                    <label className="text-md font-semibold block">
                      EMP Name{isRequired('empName') && <span className="text-[#E4572E]">*</span>}
                    </label>
                    {formData.empName?.type && (
                      <span className="text-[14px] text-[#E4572E] font-semibold block mt-0.5">{formData.empName.type}</span>
                    )}
                  </div>
                  <Select
                    value={formData.empName}
                    onChange={(value) => handleInputChange('empName', value)}
                    options={staffAdvanceCombinedOptions}
                    className={ADVANCE_PORTAL_SELECT_CLASS}
                    isClearable
                    styles={customStyles}
                    placeholder="Select employee..."
                    isSearchable={true}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                </div>
                <div className="text-left">
                  <label className={ADVANCE_PORTAL_LABEL_CLASS}>Overall Advance</label>
                  <AdvancePortalAmountOutput value={formData.overallAdvance} />
                </div>
                <div className="text-left">
                  <label className={ADVANCE_PORTAL_LABEL_CLASS}>{fieldConfig.purposeLabel}</label>
                  <Select
                    value={formData.purpose}
                    onChange={(value) => handleInputChange('purpose', value)}
                    options={purposeOptions}
                    placeholder="Select a purpose..."
                    isSearchable={true}
                    styles={customStyles}
                    isClearable
                    className={ADVANCE_PORTAL_SELECT_CLASS}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                </div>
                <div className="text-left">
                  <label className={ADVANCE_PORTAL_LABEL_CLASS}>
                    Advance Amount{isRequired('advanceAmount') && <span className="text-[#E4572E]">*</span>}
                  </label>
                  <AdvancePortalAmountOutput value={formData.advanceAmount} />
                </div>
                <div className="col-span-2">
                  <div className="flex flex-row gap-3">
                    <div className="text-left flex-1">
                      <label className={ADVANCE_PORTAL_LABEL_CLASS}>{fieldConfig.amountGivenLabel}</label>
                      {formData.selectedType === 'Transfer' ? (
                        <Select
                          value={formData.transferPurpose}
                          onChange={(value) => handleInputChange('transferPurpose', value)}
                          options={purposeOptions}
                          placeholder="Select purpose to..."
                          styles={customStyles}
                          className={ADVANCE_PORTAL_SELECT_CLASS}
                          isClearable
                        />
                      ) : (
                        <AdvancePortalAmountInput
                          value={formData.amountGivenInput}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/,/g, '');
                            if (!isNaN(rawValue)) {
                              handleInputChange('amountGivenInput', rawValue);
                            }
                          }}
                          placeholder={fieldConfig.amountGivenLabel}
                          fullWidth
                        />
                      )}
                    </div>
                    <div className="text-left">
                      <label className={ADVANCE_PORTAL_LABEL_CLASS}>{fieldConfig.paymentModeLabel}</label>
                      {formData.selectedType === 'Transfer' ? (
                        <AdvancePortalAmountInput
                          value={formData.transferAmount}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/,/g, '');
                            if (!isNaN(rawValue)) {
                              handleInputChange('transferAmount', rawValue);
                            }
                          }}
                          placeholder="Transfer Amount"
                        />
                      ) : (
                        <Select
                          value={paymentModeOptions.find(option => option.value === formData.paymentMode) || null}
                          onChange={(selected) => handleInputChange('paymentMode', selected ? selected.value : '')}
                          options={paymentModeOptions}
                          placeholder="Payment Mode"
                          isClearable
                          isSearchable
                          menuPortalTarget={document.body}
                          styles={customStyles}
                          className={ADVANCE_PORTAL_SELECT_CLASS}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSubmit(e);
                            }
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-span-2 text-left" ref={descriptionSectionRef}>
                  <label className={ADVANCE_PORTAL_LABEL_CLASS}>Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Description"
                    className={`${ADVANCE_PORTAL_TEXTAREA_CLASS} hover:!border-[rgba(191,152,83,0.2)] focus:!border-[rgba(191,152,83,1)]`}
                  />
                </div>
                <div className="col-span-2 min-w-0 overflow-hidden">
                  <div className="flex items-start justify-between lg:w-[616px] w-[300px] gap-2 flex-wrap mb-2 min-w-0">
                    <div className="flex shrink-0">
                      <label htmlFor="fileInput" className="cursor-pointer flex items-center gap-[6px] text-orange-600">
                        <img className="w-[15px] h-[16px]" alt="" src={Attach} />
                        <span className="text-[14px] font-semibold">Attach file</span>
                      </label>
                      <input type="file" id="fileInput" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                    </div>
                    {selectedFile && (
                      <span
                        className="text-gray-600 text-[12px] break-words min-w-0 text-right"
                        title={selectedFile.name}
                      >
                        {selectedFile.name}
                      </span>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`bg-[#c7934c] text-white w-full sm:w-[120px] h-[33px] rounded flex items-center justify-center text-sm xl:mb-0 mb-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? 'Processing...' : 'Pay Advance'}
                  </button>
                </div>
              </div>
            </div>
            <div
              className={`min-w-0 flex-1 flex flex-col ${sideTableAreaHeight != null ? 'h-full' : 'overflow-x-auto'}`}
              style={sideTableAreaHeight != null ? { height: `${sideTableAreaHeight}px` } : undefined}
            >
              <div
                className={`expense-form-side-table-host min-h-0 overflow-hidden ${sideTableContentHeight != null ? 'flex-1 min-h-0' : ''}`}
                style={
                  sideTableContentHeight != null
                    ? { height: `${sideTableContentHeight}px` }
                    : undefined
                }
              >
                <div className="side-table-root side-table-form-path w-full min-w-0 max-w-full flex flex-col h-full min-h-0">
                  <div className="form-side-table-toolbar-row w-full max-w-[748px] min-w-0 shrink-0 text-left mb-[8px]">
                    <div className="flex w-full justify-between items-start gap-[8px] mt-[4px] mb-[12px]">
                      <h2 className="form-side-table-advance-header text-base font-semibold leading-none">
                        Advance
                      </h2>
                      <span className="form-side-table-advance-amount text-base font-bold text-[#E4572E] leading-none">
                        ₹{(!formData.empName || !formData.purpose || sideTableSortedEntries.length === 0)
                          ? '0.00'
                          : formatAmountDisplay(formData.advanceAmount)}
                      </span>
                    </div>
                    <div className="flex min-w-0 w-full flex-nowrap items-center justify-between gap-[6px]">
                      <div
                        className={`form-side-table-filter-left flex min-w-0 items-center overflow-hidden flex-nowrap${sideTableHasActiveColumnFilters ? ' w-full gap-[8px]' : ' shrink-0 gap-[6px]'}`}
                      >
                        <EdbcFilterToggleButton onClick={toggleSideTableFilters} />
                        {sideTableHasActiveColumnFilters && (
                          <div
                            ref={sideTableFilterChipsScrollRef}
                            onMouseDown={handleSideTableFilterChipsMouseDown}
                            onMouseMove={handleSideTableFilterChipsMouseMove}
                            onMouseUp={handleSideTableFilterChipsMouseUp}
                            onMouseLeave={handleSideTableFilterChipsMouseUp}
                            className="flex min-w-0 flex-1 overflow-x-auto flex-nowrap gap-2 no-scrollbar scrollbar-none cursor-grab select-none"
                          >
                            {(sideTableFilterDateStart || sideTableFilterDateEnd) && (
                              <span className="inline-flex shrink-0 items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit whitespace-nowrap">
                                <span className="font-medium text-[#BF9853]">Date: </span>
                                <span className="font-semibold text-[14px]">
                                  {sideTableFilterDateStart && sideTableFilterDateEnd
                                    ? sideTableFilterDateStart === sideTableFilterDateEnd
                                      ? formatEdbcFilterDateDMY(sideTableFilterDateStart)
                                      : `${formatEdbcFilterDateDMY(sideTableFilterDateStart)} – ${formatEdbcFilterDateDMY(sideTableFilterDateEnd)}`
                                    : sideTableFilterDateStart
                                      ? `From ${formatEdbcFilterDateDMY(sideTableFilterDateStart)}`
                                      : formatEdbcFilterDateDMY(sideTableFilterDateEnd)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSideTableFilterDateStart('');
                                    setSideTableFilterDateEnd('');
                                  }}
                                  className="text-[#E4572E] ml-1 text-2xl"
                                >
                                  ×
                                </button>
                              </span>
                            )}
                            {sideTableFilterAdvanceAmount.trim() && (
                              <span className="inline-flex shrink-0 items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit">
                                <span className="font-medium text-[#BF9853]">Advance: </span>
                                <span className="font-semibold text-[14px]">{sideTableFilterAdvanceAmount}</span>
                                <button type="button" onClick={() => setSideTableFilterAdvanceAmount('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                              </span>
                            )}
                            {sideTableFilterTransferRefund && (
                              <span className="inline-flex shrink-0 items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit">
                                <span className="font-medium text-[#BF9853]">Transfer/Refund: </span>
                                <span className="font-semibold text-[14px]">
                                  {sideTableFilterTransferRefund === STAFF_SIDE_TABLE_BLANK_VALUE
                                    ? STAFF_SIDE_TABLE_BLANK_LABEL
                                    : sideTableFilterTransferRefund}
                                </span>
                                <button type="button" onClick={() => setSideTableFilterTransferRefund('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                              </span>
                            )}
                            {sideTableFilterMode && (
                              <span className="inline-flex shrink-0 items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit">
                                <span className="font-medium text-[#BF9853]">Mode: </span>
                                <span className="font-semibold text-[14px]">{sideTableFilterMode}</span>
                                <button type="button" onClick={() => setSideTableFilterMode('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="form-side-table-search-column form-side-table-search-row flex min-w-0 items-center justify-end gap-[6px]">
                        <EdbcTableToolbarRightActions
                          onClearFilters={clearSideTableFilters}
                          overallSearch={sideTableOverallSearch}
                          onOverallSearchChange={setSideTableOverallSearch}
                          searchPlaceholder="Search Transactions..."
                          showExportIcons={true}
                          onExportPdf={exportToPDF}
                          onExportCsv={exportToExcel}
                          clearButtonType="button"
                          wrapperClassName={null}
                          searchWrapperClassName="h-[34px] min-w-0 flex-1 max-w-[286px] border border-[#D6D6D6] rounded-md bg-white flex items-center px-2 sm:w-[286px] sm:min-w-[286px] sm:flex-none sm:shrink-0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-side-table-h-scroll min-w-0 w-full flex-1 min-h-0 flex flex-col overflow-x-auto no-scrollbar scrollbar-none">
                    <div className="w-full min-w-0 flex-1 min-h-0 flex flex-col">
                      <div className="border-l-8 border-l-[#BF9853] w-fit max-w-full flex-1 min-h-0 overflow-hidden rounded-lg box-border flex flex-col">
                        <div
                          ref={sideTableScrollRef}
                          className="w-full flex-1 min-h-0 overflow-x-hidden overflow-y-auto no-scrollbar scrollbar-none select-none"
                          onWheel={() => { sideTableFilterNudgeUsedRef.current = false; }}
                        >
                          <table className={`table-fixed border-collapse ${EDBC_TABLE_EDGE_TABLE_CLASS} ${STAFF_SIDE_TABLE_COLUMN_LOCK_TABLE_CLASS}`.trim()}>
                            <colgroup>
                              {sideTableColumnWidthClasses.map((colClass, index) => (
                                <col key={index} className={colClass} />
                              ))}
                            </colgroup>
                            <thead className="sticky top-0 z-10 bg-white">
                              <EdbcTableHeaderRow>
                                <EdbcColumnHeader
                                  columnId={EDBC_IDS.EDBC2}
                                  label="Date"
                                  columnWidthClass={edbc2ColumnWidthClass}
                                  {...sideTableEdbcSortProps}
                                />
                                <EdbcColumnHeader
                                  columnId={EDBC_IDS.EDBC8}
                                  label="Advance"
                                  {...sideTableEdbcSortProps}
                                />
                                <EdbcColumnHeader
                                  columnId={EDBC_IDS.EDBC3}
                                  label="Transfer/Refund"
                                />
                                <EdbcColumnHeader
                                  columnId={EDBC_IDS.EDBC13}
                                  label="Mode"
                                  {...sideTableEdbcSortProps}
                                />
                                <EdbcColumnHeader
                                  columnId={EDBC_IDS.EDBC19}
                                  label="Activity"
                                />
                              </EdbcTableHeaderRow>
                              {sideTableShowFilters && (
                                <EdbcTableFilterRow ref={sideTableFilterRowRef}>
                                  <EdbcTimestampFilter
                                    columnId={EDBC_IDS.EDBC2}
                                    placeholder="Date"
                                    columnWidthClass="w-[118px]"
                                    timestampStartDate={sideTableFilterDateStart}
                                    timestampEndDate={sideTableFilterDateEnd}
                                    isOpen={sideTableShowDateRangePicker}
                                    onOpen={() => setSideTableShowDateRangePicker(true)}
                                    onClose={() => setSideTableShowDateRangePicker(false)}
                                    onApply={(from, to) => {
                                      setSideTableFilterDateStart(from || '');
                                      setSideTableFilterDateEnd(to || '');
                                    }}
                                  />
                                  <EdbcTotalAmountFilter
                                    columnId={EDBC_IDS.EDBC8}
                                    totalAmount={sideTableAdvanceTotal}
                                    value={sideTableFilterAdvanceAmount}
                                    onChange={(e) => setSideTableFilterAdvanceAmount(e.target.value)}
                                  />
                                  <th id={EDBC_IDS.EDBC3} className={edbc3Config?.filterThClass}>
                                    <Select
                                      className={edbc3Config?.filterWidthClass}
                                      options={sideTableTransferRefundFilterOptions}
                                      value={
                                        !sideTableFilterTransferRefund
                                          ? null
                                          : sideTableFilterTransferRefund === STAFF_SIDE_TABLE_BLANK_VALUE
                                            ? staffSideTableBlankOption
                                            : { value: sideTableFilterTransferRefund, label: sideTableFilterTransferRefund }
                                      }
                                      onChange={(selectedOption) =>
                                        setSideTableFilterTransferRefund(selectedOption ? selectedOption.value : '')
                                      }
                                      placeholder="Transfer/Refund"
                                      menuPlacement="bottom"
                                      menuPortalTarget={document.body}
                                      menuPosition="fixed"
                                      noOptionsMessage={() => null}
                                      isClearable={false}
                                      styles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                                    />
                                  </th>
                                  <th id={EDBC_IDS.EDBC13} className={edbc13Config?.filterThClass}>
                                    <Select
                                      className={edbc13Config?.filterWidthClass}
                                      options={sideTableModeFilterOptions}
                                      value={
                                        !sideTableFilterMode
                                          ? null
                                          : { value: sideTableFilterMode, label: sideTableFilterMode }
                                      }
                                      onChange={(selectedOption) =>
                                        setSideTableFilterMode(selectedOption ? selectedOption.value : '')
                                      }
                                      placeholder="Mode"
                                      menuPlacement="bottom"
                                      menuPortalTarget={document.body}
                                      menuPosition="fixed"
                                      noOptionsMessage={() => null}
                                      isClearable={false}
                                      styles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                                    />
                                  </th>
                                  <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC19} />
                                </EdbcTableFilterRow>
                              )}
                            </thead>
                            <tbody>
                              {!formData.empName || !formData.purpose ? (
                                <tr>
                                  <td colSpan={5} className="text-center py-4 text-sm text-gray-500">
                                    Select both EMP Name and Purpose to view related data
                                  </td>
                                </tr>
                              ) : sideTableSortedEntries.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="text-center py-4 text-sm text-gray-500">
                                    No records found for the selected employee and purpose
                                  </td>
                                </tr>
                              ) : (
                                sideTableSortedEntries.map((entry, index) => {
                                  const row = toStaffSideExpenseRow(entry);
                                  const { advanceAmount, transferOrRefund, payment_mode } =
                                    getStaffSideEntryRowDisplay(entry, purposeOptions);
                                  return (
                                    <EdbcTableBodyRow key={entry.id ?? index}>
                                      <EdbcDateBodyCell
                                        expense={row}
                                        rowIndex={index}
                                        expandedCells={sideTableExpandedCells}
                                        onToggleExpanded={toggleSideTableExpandedCell}
                                        formatValue={(date) => new Date(date).toLocaleDateString('en-GB')}
                                        columnWidthClass={edbc2ColumnWidthClass}
                                      />
                                      <EdbcExpandableBodyCell
                                        columnId={EDBC_IDS.EDBC8}
                                        expense={row}
                                        rowIndex={index}
                                        expandedCells={sideTableExpandedCells}
                                        onToggleExpanded={toggleSideTableExpandedCell}
                                        textAlignClass="text-right"
                                        getDisplayValue={() => advanceAmount}
                                      />
                                      <EdbcExpandableBodyCell
                                        columnId={EDBC_IDS.EDBC3}
                                        expense={row}
                                        rowIndex={index}
                                        expandedCells={sideTableExpandedCells}
                                        onToggleExpanded={toggleSideTableExpandedCell}
                                        getDisplayValue={() => transferOrRefund}
                                      />
                                      <EdbcExpandableBodyCell
                                        columnId={EDBC_IDS.EDBC13}
                                        expense={row}
                                        rowIndex={index}
                                        expandedCells={sideTableExpandedCells}
                                        onToggleExpanded={toggleSideTableExpandedCell}
                                        getDisplayValue={() => payment_mode}
                                      />
                                      <EdbcActivityBodyCell
                                        columnId={EDBC_IDS.EDBC19}
                                        expense={row}
                                        onEdit={handleEditClick}
                                        onDelete={deleteRow}
                                        onHistory={() => { }}
                                        username={username}
                                      />
                                    </EdbcTableBodyRow>
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
            </div>
          </form>
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
            <div className="bg-white p-6 rounded-lg w-[800px] max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold mb-4">Edit Staff Advance Entry</h2>
              <div className='text-left'>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Select Type */}
                  <div className='space-y-2'>
                    <label className='font-semibold text-[#E4572E] block'>
                      Select Type <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={selectTypeOptions.find(option => option.value === editFormData.selectedType) || null}
                      onChange={(selected) => setEditFormData({ ...editFormData, selectedType: selected ? selected.value : '' })}
                      options={selectTypeOptions}
                      placeholder="Select Type..."
                      isClearable
                      isSearchable
                      menuPortalTarget={document.body}
                      styles={customStyles}
                      className='w-full'
                    />
                  </div>

                  {/* Date */}
                  <div className='space-y-2'>
                    <label className='font-semibold text-[#E4572E] block'>
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type='date'
                      value={editFormData.date}
                      onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                      className='w-full h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none focus:border-[#BF9853] transition-colors'
                    />
                  </div>

                  {/* EMP Name */}
                  <div className='space-y-2'>
                    <label className='font-semibold block'>
                      EMP Name <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={editFormData.empName}
                      onChange={(value) => setEditFormData({ ...editFormData, empName: value })}
                      options={staffAdvanceCombinedOptions}
                      className='w-full h-[45px] rounded-lg focus:outline-none'
                      isClearable
                      styles={customStyles}
                      placeholder="Select employee..."
                      isSearchable={true}
                    />
                  </div>

                  {/* Overall Advance */}
                  <div className='space-y-2'>
                    <label className='font-semibold block'>Overall Advance</label>
                    <input
                      value={editFormData.overallAdvance}
                      readOnly
                      className='w-full h-[45px] px-2 py-1 rounded-lg bg-[#F2F2F2] focus:outline-none cursor-not-allowed'
                      placeholder="0.00"
                    />
                  </div>

                  {/* Purpose */}
                  <div className='space-y-2'>
                    <label className='font-semibold block'>Purpose</label>
                    <Select
                      value={editFormData.purpose}
                      onChange={(value) => setEditFormData({ ...editFormData, purpose: value })}
                      options={purposeOptions}
                      placeholder="Select a purpose..."
                      isSearchable={true}
                      styles={customStyles}
                      isClearable
                      className='w-full h-[45px] focus:outline-none'
                    />
                  </div>

                  {/* Advance Amount */}
                  <div className='space-y-2'>
                    <label className='font-semibold block'>Advance Amount</label>
                    <input
                      value={editFormData.advanceAmount}
                      readOnly
                      className='w-full h-[45px] px-2 py-1 rounded-lg bg-[#F2F2F2] focus:outline-none cursor-not-allowed'
                      placeholder="0.00"
                    />
                  </div>

                  {/* Amount Given / Purpose To */}
                  <div className='space-y-2'>
                    <label className='font-semibold block'>
                      {editFormData.selectedType === 'Transfer' ? 'Purpose To' : 'Amount Given'}
                    </label>
                    {editFormData.selectedType === 'Transfer' ? (
                      <Select
                        value={editFormData.transferPurpose}
                        onChange={(value) => setEditFormData({ ...editFormData, transferPurpose: value })}
                        options={purposeOptions}
                        placeholder="Select purpose to..."
                        styles={customStyles}
                        className='w-full h-[45px] rounded-lg focus:outline-none'
                        isClearable
                      />
                    ) : (
                      <input
                        value={editFormData.amountGivenInput}
                        onChange={(e) => setEditFormData({ ...editFormData, amountGivenInput: e.target.value })}
                        className='w-full h-[45px] px-2 py-1 rounded-lg border-2 border-[#BF9853] border-opacity-30 focus:outline-none focus:border-[#BF9853] transition-colors'
                        placeholder="Enter amount given"
                      />
                    )}
                  </div>

                  {/* Payment Mode/Transfer Amount */}
                  <div className='space-y-2'>
                    <label className='font-semibold block'>
                      {editFormData.selectedType === 'Transfer' ? 'Transfer Amount' : 'Payment Mode'}
                    </label>
                    {editFormData.selectedType === 'Transfer' ? (
                      <input
                        value={editFormData.transferAmount}
                        onChange={(e) => setEditFormData({ ...editFormData, transferAmount: e.target.value })}
                        className='w-full h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none focus:border-[#BF9853] transition-colors'
                        placeholder="Enter transfer amount"
                      />
                    ) : (
                      <Select
                        value={paymentModeOptions.find(option => option.value === editFormData.paymentMode) || null}
                        onChange={(selected) => setEditFormData({ ...editFormData, paymentMode: selected ? selected.value : '' })}
                        options={paymentModeOptions}
                        placeholder="Select"
                        isClearable
                        isSearchable
                        menuPortalTarget={document.body}
                        styles={customStyles}
                        className='w-full'
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-[100px] h-[45px] border border-[#BF9853] rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="w-[100px] h-[45px] bg-[#BF9853] text-white rounded hover:bg-[#a67c3a] transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Payment Popup Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white text-left rounded-xl p-6 w-[800px] h-[600px] overflow-y-auto flex flex-col">
              <h3 className="text-lg font-semibold mb-4 text-center">Payment Details</h3>
              <div className="flex-1 overflow-hidden">
                <div className="space-y-4">
                  <div className="border-2 border-[#BF9853] border-opacity-25 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                        <input
                          type="date"
                          value={paymentPopupData.date}
                          onChange={(e) => setPaymentPopupData(prev => ({ ...prev, date: e.target.value }))}
                          readOnly
                          className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                        <input
                          type="number"
                          value={paymentPopupData.amount}
                          readOnly
                          placeholder="Enter amount"
                          className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                        <Select
                          value={paymentModeOptions?.find(option => option.value === paymentPopupData.paymentMode) || null}
                          onChange={(selected) =>
                            setPaymentPopupData((prev) => ({
                              ...prev,
                              paymentMode: selected ? selected.value : '',
                            }))
                          }
                          options={paymentModeOptions || []}
                          placeholder="---Select---"
                          isClearable
                          isSearchable
                          menuPortalTarget={document.body}
                          styles={customStyles}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {(paymentPopupData.paymentMode === "GPay" || paymentPopupData.paymentMode === "Gpay" || paymentPopupData.paymentMode === "PhonePe" ||
                    paymentPopupData.paymentMode === "Net Banking" || paymentPopupData.paymentMode === "Cheque") && (
                      <div className="border-2 border-[#BF9853] border-opacity-25 rounded-lg p-4">
                        <div className="space-y-4">
                          {paymentPopupData.paymentMode === "Cheque" && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cheque No</label>
                                <input
                                  type="text"
                                  value={paymentPopupData.chequeNo}
                                  onChange={(e) => setPaymentPopupData(prev => ({ ...prev, chequeNo: e.target.value }))}
                                  placeholder="Enter cheque number"
                                  className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cheque Date</label>
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
                              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Number</label>
                              <input
                                type="text"
                                value={paymentPopupData.transactionNumber}
                                onChange={(e) => setPaymentPopupData(prev => ({ ...prev, transactionNumber: e.target.value }))}
                                placeholder="Enter transaction number"
                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Number<span className="text-red-500">*</span>
                              </label>
                              <Select
                                value={
                                  paymentPopupData.accountNumber
                                    ? {
                                      value: paymentPopupData.accountNumber,
                                      label: paymentPopupData.accountNumber,
                                    }
                                    : null
                                }
                                onChange={(selected) =>
                                  setPaymentPopupData((prev) => ({
                                    ...prev,
                                    accountNumber: selected ? selected.value : '',
                                  }))
                                }
                                options={accountNumberOptions}
                                placeholder="Select Account"
                                isClearable
                                isSearchable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={customStyles}
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 p-4 bg-white">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentPopupData({
                      date: new Date().toISOString().split('T')[0],
                      amount: "",
                      paymentMode: "",
                      chequeNo: "",
                      chequeDate: "",
                      transactionNumber: "",
                      accountNumber: ""
                    });
                    setPendingFormData(null);
                  }}
                  className="px-4 py-2 border border-[#BF9853] text-[#BF9853] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  className="px-4 py-2 bg-[#BF9853] text-white rounded-lg"
                >
                  Submit
                </button>
              </div>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentPopupData({
                    date: new Date().toISOString().split('T')[0],
                    amount: "",
                    paymentMode: "",
                    chequeNo: "",
                    chequeDate: "",
                    transactionNumber: "",
                    accountNumber: ""
                  });
                  setPendingFormData(null);
                }}
                className="absolute top-3 right-4 text-xl font-bold text-gray-500 hover:text-black"
              >
                ×
              </button>
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
                    <h4 className="text-base font-semibold text-gray-700">Staff Advance Details</h4>
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
                            value={selectTypeOptions.find(option => option.value === formData.selectedType) || null}
                            onChange={(selected) => handleInputChange('selectedType', selected ? selected.value : '')}
                            options={selectTypeOptions}
                            placeholder="Select Type..."
                            isClearable
                            isSearchable
                            menuPortalTarget={document.body}
                            styles={customStyles}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold mb-1 block">Date</label>
                          <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleInputChange('date', e.target.value)}
                            className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg px-3 border-opacity-20"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold mb-1 block">Employee/Labour Name</label>
                          <Select
                            options={staffAdvanceCombinedOptions}
                            value={formData.empName}
                            onChange={(value) => handleInputChange('empName', value)}
                            styles={customStyles}
                            isClearable
                            className="custom-select rounded-lg"
                            isSearchable={true}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold mb-1 block">Purpose</label>
                          <Select
                            options={purposeOptions}
                            value={formData.purpose}
                            onChange={(value) => handleInputChange('purpose', value)}
                            styles={customStyles}
                            isClearable
                            className="custom-select rounded-lg"
                            isSearchable={true}
                          />
                        </div>
                        {formData.selectedType === 'Transfer' && (
                          <>
                            <div>
                              <label className="text-sm font-semibold mb-1 block">Transfer To Purpose</label>
                              <Select
                                options={purposeOptions}
                                value={formData.transferPurpose}
                                onChange={(value) => handleInputChange('transferPurpose', value)}
                                styles={customStyles}
                                isClearable
                                className="custom-select rounded-lg"
                                isSearchable={true}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-semibold mb-1 block">Transfer Amount</label>
                              <input
                                value={formData.transferAmount}
                                onChange={(e) => handleInputChange('transferAmount', e.target.value)}
                                className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg px-3 border-opacity-20"
                              />
                            </div>
                          </>
                        )}
                        {formData.selectedType !== 'Transfer' && (
                          <>
                            <div>
                              <label className="text-sm font-semibold mb-1 block">
                                {formData.selectedType === 'Refund' ? 'Refund Amount' : 'Amount Given'}
                              </label>
                              <input
                                value={formData.amountGivenInput}
                                onChange={(e) => handleInputChange('amountGivenInput', e.target.value)}
                                className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg px-3 border-opacity-20"
                              />
                            </div>
                            {formData.selectedType === 'Advance' && (
                              <div>
                                <label className="text-sm font-semibold mb-1 block">Payment Mode</label>
                                <Select
                                  value={paymentModeOptions.find(option => option.value === formData.paymentMode) || null}
                                  onChange={(selected) => handleInputChange('paymentMode', selected ? selected.value : '')}
                                  options={paymentModeOptions}
                                  placeholder="Select"
                                  isClearable
                                  isSearchable
                                  menuPortalTarget={document.body}
                                  styles={customStyles}
                                  className="w-full"
                                />
                              </div>
                            )}
                          </>
                        )}
                        <div className="col-span-2">
                          <label className="text-sm font-semibold mb-1 block">Description</label>
                          <textarea
                            rows={2}
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
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
                  {selectedFile && (
                    <p className="text-xs text-gray-500 mt-2 break-words">{selectedFile.name}</p>
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

        <ToastContainer />
      </div>
    </div>
  );
};
export default StaffAdvance;