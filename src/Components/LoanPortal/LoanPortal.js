import React, { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from 'react';
import Select from 'react-select';
import Attach from '../Images/Attachfile.svg';
import jsPDF from "jspdf";
import "jspdf-autotable";
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
  matchesEdbcPaymentModeFilter,
  equalsEdbcFilterValue,
  TABLE_FILTER_OPTION_HEIGHT_PX,
} from '../ExpensesEntry/databaseExpensesSharedColumns';
import {
  LOAN_PORTAL_MODULE_NAME,
  fetchPaymentModeSelectOptionsForModule,
  subscribePaymentModeArrangementRefresh,
} from '../../utils/paymentModeArrangement';

const ADVANCE_PORTAL_SELECT_CLASS =
  'custom-select rounded-lg w-[300px] h-[40px] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500';
const ADVANCE_PORTAL_TEXTAREA_CLASS =
  'border-2 border-[#BF9853] rounded-md px-[8px] w-[616px] h-[60px] focus:outline-none border-opacity-[0.20] resize-none text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500';
const ADVANCE_PORTAL_LABEL_CLASS = 'text-md font-semibold mb-[8px] block';
const ADVANCE_PORTAL_FILTER_AMOUNT_INPUT_CLASS =
  'pl-[12px] pr-2 border border-[#00000029] rounded-lg w-full h-full focus:outline-none bg-[#ededed] text-[14px] font-medium cursor-default';
const ADVANCE_PORTAL_AMOUNT_INPUT_CLASS =
  'pl-[20px] pr-4 border-2 border-[#BF9853] rounded-lg w-full h-full focus:outline-none border-opacity-[0.20] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500';
const ADVANCE_PORTAL_READONLY_AMOUNT_INPUT_CLASS =
  'pl-[12px] pr-4 border-2 border-[#BF9853] rounded-lg w-full h-full focus:outline-none border-opacity-[0.20] bg-[#ededed] text-[14px] font-medium cursor-default';

const formatNumber = (num) => {
  if (!num) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const LOAN_SIDE_TABLE_BLANK_VALUE = 'BLANK';
const LOAN_SIDE_TABLE_BLANK_LABEL = 'Blank';
const loanSideTableBlankOption = { value: LOAN_SIDE_TABLE_BLANK_VALUE, label: LOAN_SIDE_TABLE_BLANK_LABEL };

const LOAN_TOP_PAYMENT_MODE_MULTI_SELECT_STYLES = {
  ...DATABASE_TABLE_FILTER_SELECT_STYLES,
  multiValue: () => ({ display: 'none' }),
  multiValueLabel: () => ({ display: 'none' }),
  multiValueRemove: () => ({ display: 'none' }),
};

const LoanTopPaymentModeCheckboxOption = ({ innerProps, label, isSelected, isFocused }) => (
  <div
    {...innerProps}
    className="flex items-center gap-2 cursor-pointer select-none"
    style={{
      backgroundColor: isFocused ? '#FAF6ED' : 'white',
      minHeight: `${TABLE_FILTER_OPTION_HEIGHT_PX}px`,
      padding: '0 12px',
    }}
  >
    <span
      className="pointer-events-none shrink-0 inline-flex items-center justify-center box-border rounded-[2px]"
      style={{
        width: 14,
        height: 14,
        border: isSelected ? '2px solid #BF9853' : '2px solid #D1D5DB',
        backgroundColor: isSelected ? '#BF9853' : '#FFFFFF',
      }}
      aria-hidden
    >
      {isSelected ? (
        <svg width="9" height="7" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 4L3.5 6.5L9 1" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </span>
    <span className="text-[14px] font-normal text-black truncate">{label}</span>
  </div>
);
const LOAN_SIDE_TABLE_FORM_PATH_CSS = `
.expense-form-side-table-host .side-table-form-path .form-side-table-toolbar-row {
  width: 100% !important;
  min-width: 0 !important;
  max-width: 868px !important;
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
  justify-content: flex-end !important;
  display: flex !important;
  min-width: 0 !important;
  width: auto !important;
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
  display: flex !important;
  flex-wrap: nowrap !important;
  gap: 6px !important;
}
.expense-form-side-table-host .side-table-form-path .form-side-table-search-column > div.w-full {
  width: auto !important;
  flex: 0 0 auto !important;
  max-width: none !important;
}
`;

const LOAN_SIDE_TABLE_COLUMN_LOCK_TABLE_CLASS =
  '[&_thead_tr>th#EDBC-2]:!w-[130px] [&_thead_tr>th#EDBC-2]:!min-w-[130px] [&_thead_tr>th#EDBC-2]:!max-w-[130px] [&_tbody_tr>td#EDBC-2]:!w-[130px] [&_tbody_tr>td#EDBC-2]:!min-w-[130px] [&_tbody_tr>td#EDBC-2]:!max-w-[130px] [&_thead_tr>th#EDBC-2]:!overflow-hidden [&_thead_tr:nth-child(2)>th#EDBC-2>div]:!w-[118px] [&_thead_tr:nth-child(2)>th#EDBC-2>div]:!min-w-[118px] [&_thead_tr:nth-child(2)>th#EDBC-2>div]:!max-w-[118px] [&_thead_tr:nth-child(2)>th#EDBC-2 button]:!w-[118px] [&_thead_tr:nth-child(2)>th#EDBC-2 button]:!min-w-[118px] [&_thead_tr:nth-child(2)>th#EDBC-2 button]:!max-w-[118px] [&_th#EDBC-8]:!w-[120px] [&_td#EDBC-8]:!w-[120px] [&_th#EDBC-8]:!min-w-[120px] [&_td#EDBC-8]:!min-w-[120px] [&_th#EDBC-8]:!max-w-[120px] [&_td#EDBC-8]:!max-w-[120px] [&_th#EDBC-8]:!overflow-hidden [&_td#EDBC-8]:!overflow-hidden [&_th#EDBC-3]:!w-[298px] [&_td#EDBC-3]:!w-[298px] [&_th#EDBC-3]:!min-w-[298px] [&_td#EDBC-3]:!min-w-[298px] [&_th#EDBC-3]:!max-w-[298px] [&_td#EDBC-3]:!max-w-[298px] [&_th#EDBC-3]:!overflow-hidden [&_td#EDBC-3]:!overflow-hidden [&_th#EDBC-17]:!w-[120px] [&_td#EDBC-17]:!w-[120px] [&_th#EDBC-17]:!min-w-[120px] [&_td#EDBC-17]:!min-w-[120px] [&_th#EDBC-17]:!max-w-[120px] [&_td#EDBC-17]:!max-w-[120px] [&_th#EDBC-17]:!overflow-hidden [&_td#EDBC-17]:!overflow-hidden [&_th#EDBC-13]:!w-[130px] [&_td#EDBC-13]:!w-[130px] [&_th#EDBC-13]:!min-w-[130px] [&_td#EDBC-13]:!min-w-[130px] [&_th#EDBC-13]:!max-w-[130px] [&_td#EDBC-13]:!max-w-[130px] [&_th#EDBC-13]:!overflow-hidden [&_td#EDBC-13]:!overflow-hidden [&_th#EDBC-19]:!w-[70px] [&_td#EDBC-19]:!w-[70px] [&_th#EDBC-19]:!min-w-[70px] [&_td#EDBC-19]:!min-w-[70px] [&_th#EDBC-19]:!max-w-[70px] [&_td#EDBC-19]:!max-w-[70px] [&_thead_tr>th#EDBC-19:last-child]:!pr-[1px] [&_tbody_tr>td#EDBC-19:last-child]:!pr-[1px] [&_thead_tr:nth-child(2)>th:not(#EDBC-3):not(#EDBC-13):not(#EDBC-17)]:!overflow-hidden [&_thead_tr:nth-child(2)>th#EDBC-3]:!overflow-visible [&_thead_tr:nth-child(2)>th#EDBC-13]:!overflow-visible [&_thead_tr:nth-child(2)>th#EDBC-17]:!overflow-visible';

const formatLoanSideEdbc8Amount = (value) =>
  `₹${(parseFloat(value) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatLoanSideEdbc8AmountNegative = (value) =>
  `-₹${(Math.abs(parseFloat(value) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const normalizeLoanSideSearchText = (value) =>
  String(value ?? '').toLowerCase().replace(/,/g, '');

const loanEntryMatchesSideTableDateFilter = (entryDate, startDate, endDate) => {
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

const getLoanSideEntryRowDisplay = (entry, getTransferDestinationFn) => {
  const loanAmount =
    entry.type === 'Refund'
      ? formatLoanSideEdbc8AmountNegative(entry.loan_refund_amount)
      : formatLoanSideEdbc8Amount(entry.amount);
  let transferOrRefund = '';
  if (entry.type === 'Refund') {
    transferOrRefund = 'Refund';
  } else if (entry.type === 'Transfer') {
    transferOrRefund = getTransferDestinationFn(entry) || '';
  }
  return {
    loanAmount,
    transferOrRefund,
    payment_mode: entry.loan_payment_mode || '',
    entry_no: entry.entry_no != null && entry.entry_no !== '' ? String(entry.entry_no) : '',
  };
};

const toLoanSideExpenseRow = (entry) => ({
  ...entry,
  id: entry.loanPortalId || entry.id,
  eno: entry.entry_no,
});

const getFirstVisibleLoanSideTableBodyRow = (scroller) => {
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

const alignLoanSideTableRowBelowHeader = (scroller, row) => {
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
const formatAmountDisplay = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const normalized = String(value).replace(/,/g, '');
  const num = Number(normalized);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const AdvancePortalAmountOutput = ({ value, variant = 'form', className = '', fullWidth = false }) => {
  const isFilter = variant === 'filter';
  const wrapperClass = isFilter
    ? `relative lg:w-[150px] w-full h-[40px] ${className}`.trim()
    : fullWidth
      ? `relative w-full h-[40px] ${className}`.trim()
      : `relative w-[300px] h-[40px] ${className}`.trim();
  const inputClass = isFilter ? ADVANCE_PORTAL_FILTER_AMOUNT_INPUT_CLASS : ADVANCE_PORTAL_READONLY_AMOUNT_INPUT_CLASS;
  const formattedValue = formatAmountDisplay(value);
  const displayValue = formattedValue ? `₹${formattedValue}` : '';
  return (
    <div className={wrapperClass}>
      <input type="text" readOnly tabIndex={-1} value={displayValue} className={inputClass} />
    </div>
  );
};
const AdvancePortalAmountInput = ({ value, onChange, placeholder = '', fullWidth = false, className = '' }) => {
  const wrapperClass = fullWidth
    ? `relative w-full h-[40px] ${className}`.trim()
    : `relative w-[300px] h-[40px] ${className}`.trim();
  return (
    <div className={wrapperClass}>
      <span className="absolute top-1/2 left-[8px] transform -translate-y-1/2 text-gray-600 text-lg">₹</span>
      <input
        type="text"
        value={formatNumber(value)}
        onChange={onChange}
        placeholder={placeholder}
        onWheel={(e) => e.target.blur()}
        className={ADVANCE_PORTAL_AMOUNT_INPUT_CLASS}
      />
    </div>
  );
};

const LoanPortal = ({ username, userRoles = [], paymentModeOptions = [], refreshSignal, isActive = true }) => {
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
  const [filteredPaymentMode, setFilteredPaymentMode] = useState([]);
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
  const [sideTableOverallSearch, setSideTableOverallSearch] = useState('');
  const [sideTableShowFilters, setSideTableShowFilters] = useState(false);
  const [sideTableFilterDateStart, setSideTableFilterDateStart] = useState('');
  const [sideTableFilterDateEnd, setSideTableFilterDateEnd] = useState('');
  const [sideTableShowDateRangePicker, setSideTableShowDateRangePicker] = useState(false);
  const [sideTableFilterLoanAmount, setSideTableFilterLoanAmount] = useState('');
  const [sideTableFilterTransferRefund, setSideTableFilterTransferRefund] = useState('');
  const [sideTableFilterEntryNo, setSideTableFilterEntryNo] = useState('');
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
  const leftFormColRef = useRef(null);
  const descriptionSectionRef = useRef(null);
  const [sideTableAreaHeight, setSideTableAreaHeight] = useState(null);
  const [sideTableContentHeight, setSideTableContentHeight] = useState(null);
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

  useEffect(() => {
    const syncBranch = () => {
      const nextBranchId = resolveActiveBranchId();
      setActiveBranchId((prevBranchId) => (prevBranchId === nextBranchId ? prevBranchId : nextBranchId));
    };
    syncBranch();
    window.addEventListener("branchSelectionChanged", syncBranch);
    return () => window.removeEventListener("branchSelectionChanged", syncBranch);
  }, []);

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
    if (!["GPay", "Gpay", "PhonePe", "Net Banking", "Cheque"].includes(newPaymentMode)) {
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
    setLoanData([]);
    setOverallLoan(0);
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

  useTabRefreshSignal(refreshSignal, isActive, async () => {
    try {
      const response = await fetch('https://backendaab.in/aabuildersDash/api/loans/all');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setLoanData(data);
    } catch (error) {
      console.error('Error refreshing loan portal data:', error);
    }
  });

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
  useEffect(() => {
    if (!selectedOption) {
      setOverallLoan(0);
      return;
    }
    const total = loanData
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
        if (curr.type === 'Transfer') {
          if (curr.transfer_Project_id) return sum + (parseFloat(curr.amount) || 0);
          return sum;
        }
        return sum;
      }, 0);
    setOverallLoan(total);
  }, [loanData, selectedOption]);
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
  // Combine site, purpose, contractor, vendor, employee, and labour options for Transfer To dropdown
  useEffect(() => {
    setCombinedSitePurposeOptions([
      ...siteOptions, 
      ...purposeOptions,
      ...vendorOptions,
      ...contractorOptions,
      ...employeeOptions,
      ...labourOptions
    ]);
  }, [siteOptions, purposeOptions, vendorOptions, contractorOptions, employeeOptions, labourOptions]);
  // Memoized custom styles for Select components
  const customStyles = {
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

    // Check if transferring between associates (Contractor, Vendor, Employee, or Labour)
    const isTransferToAssociate = selectedLoanType === "Transfer" && 
      ["Contractor", "Vendor", "Employee", "Labour"].includes(transferSelection?.type);

    if (isTransferToAssociate) {
      // Create Transfer entry for sender (subtract amount)
      const senderName = selectedOption?.label || '';
      const receiverName = transferSelection?.label || '';
      const transferAmountValue = parseFloat(transferAmount) || 0;
      const transferDesc = description 
        ? `${description} - ${senderName} to ${receiverName} amount transferred`
        : `${senderName} to ${receiverName} amount transferred`;
      const senderPayload = {
        type: "Transfer",
        date: dateValue,
        amount: -Math.abs(transferAmountValue), // Negative amount for sender
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
        file_url: "",
        advance_portal_id: null,
        branch_id: activeBranchId,
        source: "Loan Portal",
        entered_by: username,
      };

      // Create Loan entry for receiver (add amount)
      const receiverLoanDesc = description 
        ? `${description} - ${senderName} to ${receiverName} amount transferred`
        : `${senderName} to ${receiverName} amount transferred`;
      
      const receiverPayload = {
        type: "Transfer",
        date: dateValue,
        amount: Math.abs(transferAmountValue), // Positive amount for receiver
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
        description: receiverLoanDesc,
        file_url: "",
        advance_portal_id: null,
        branch_id: activeBranchId,
        source: "Loan Portal",
        entered_by: username,
      };

      try {
        // Save sender transfer entry
        const senderResponse = await fetch(withBranchUrl("https://backendaab.in/aabuildersDash/api/loans/save"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(senderPayload)
        });

        if (!senderResponse.ok) {
          throw new Error(`Failed to save sender transfer: ${senderResponse.status}`);
        }

        // Save receiver loan entry
        const receiverResponse = await fetch(withBranchUrl("https://backendaab.in/aabuildersDash/api/loans/save"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(receiverPayload)
        });

        if (!receiverResponse.ok) {
          throw new Error(`Failed to save receiver loan: ${receiverResponse.status}`);
        }

        toast.success("Transfer completed successfully!", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored"
        });

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
        // Refresh loan data to show the new entries
        setTimeout(async () => {
          try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/loans/all');
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setLoanData(data);
            notifyOrbitModuleDataChanged('loan');
          } catch (error) {
            console.error('Error refreshing loan data:', error);
          }
        }, 500);
        return; // Exit early after handling associate-to-associate transfer
      } catch (error) {
        console.error("❌ Error saving transfer:", error);
        toast.error("Failed to save transfer!", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored"
        });
        return;
      }
    }

    // Purpose-to-purpose transfer: two entries (same pattern as Advance Portal site transfer)
    const isTransferToPurpose =
      selectedLoanType === "Transfer" && transferSelection?.type === "Purpose";

    if (isTransferToPurpose) {
      const sourcePurposeId = parseInt(purpose, 10) || 0;
      const destPurposeId = parseInt(transferSelection.id, 10) || 0;

      if (!sourcePurposeId || !destPurposeId) {
        toast.error("Invalid purpose selection for transfer!", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored"
        });
        return;
      }

      if (sourcePurposeId === destPurposeId) {
        toast.error("Cannot transfer to the same purpose!", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored"
        });
        return;
      }

      const transferAmountValue = parseFloat(transferAmount) || 0;
      const sourcePurposeLabel =
        purposeOptions.find((p) => p.id === sourcePurposeId)?.label || "Purpose";
      const destPurposeLabel =
        purposeOptions.find((p) => p.id === destPurposeId)?.label || "Purpose";
      const transferDesc = description
        ? `${description} - ${sourcePurposeLabel} to ${destPurposeLabel}`
        : `${sourcePurposeLabel} to ${destPurposeLabel} amount transferred`;

      const associateFields = {
        vendor_id: selectedOption?.type === "Vendor" ? selectedOption.id : 0,
        contractor_id: selectedOption?.type === "Contractor" ? selectedOption.id : 0,
        employee_id: selectedOption?.type === "Employee" ? selectedOption.id : 0,
        labour_id: selectedOption?.type === "Labour" ? selectedOption.id : 0,
      };

      const buildPurposeTransferPayload = (overrides) => ({
        type: "Transfer",
        date: dateValue,
        loan_payment_mode: "",
        loan_refund_amount: 0,
        transfer_Project_id: 0,
        project_id: 0,
        description: transferDesc,
        file_url: "",
        advance_portal_id: null,
        branch_id: activeBranchId,
        source: "Loan Portal",
        entered_by: username,
        ...associateFields,
        ...overrides,
      });

      const sourcePayload = buildPurposeTransferPayload({
        amount: -Math.abs(transferAmountValue),
        from_purpose_id: sourcePurposeId,
        to_purpose_id: destPurposeId,
      });

      const destPayload = buildPurposeTransferPayload({
        amount: Math.abs(transferAmountValue),
        from_purpose_id: destPurposeId,
        to_purpose_id: sourcePurposeId,
      });

      try {
        const loanSaveUrl = withBranchUrl("https://backendaab.in/aabuildersDash/api/loans/save");
        const [sourceResponse, destResponse] = await Promise.all([
          fetch(loanSaveUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sourcePayload),
          }),
          fetch(loanSaveUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(destPayload),
          }),
        ]);

        if (!sourceResponse.ok) {
          throw new Error(`Failed to save source purpose transfer: ${sourceResponse.status}`);
        }
        if (!destResponse.ok) {
          throw new Error(`Failed to save destination purpose transfer: ${destResponse.status}`);
        }

        toast.success("Transfer completed successfully!", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });

        setPaymentPopupData({
          chequeNo: "",
          chequeDate: "",
          transactionNumber: "",
          accountNumber: "",
        });
        setShowPaymentModal(false);
        setShowReviewModal(false);
        setAmountGiven("");
        setTransferAmount("");
        setDescription("");
        setSelectedLoanFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setTimeout(async () => {
          try {
            const response = await fetch("https://backendaab.in/aabuildersDash/api/loans/all");
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setLoanData(data);
            notifyOrbitModuleDataChanged('loan');
          } catch (error) {
            console.error("Error refreshing loan data:", error);
          }
        }, 500);
        return;
      } catch (error) {
        console.error("Error saving purpose-to-purpose transfer:", error);
        toast.error("Failed to save transfer!", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
        return;
      }
    }

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
          file_url: "",
          branch_id: activeBranchId,
          source: "Loan Portal",
          entered_by: username,
        };

        const advanceResponse = await fetch(withBranchUrl('https://backendaab.in/aabuildersDash/api/advance_portal/save'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(advancePayload)
        });

        if (!advanceResponse.ok) {
          throw new Error('Failed to save advance portal data');
        }

        const advanceResult = await advanceResponse.json();
        advancePortalId = advanceResult.id || advanceResult.advancePortalId;
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
      to_purpose_id: 0,
      vendor_id: selectedOption?.type === "Vendor" ? selectedOption.id : 0,
      contractor_id: selectedOption?.type === "Contractor" ? selectedOption.id : 0,
      employee_id: selectedOption?.type === "Employee" ? selectedOption.id : 0,
      labour_id: selectedOption?.type === "Labour" ? selectedOption.id : 0,
      project_id: 0,
      description,
      file_url: "",
      advance_portal_id: advancePortalId || null,
      branch_id: activeBranchId,
      source: "Loan Portal",
      entered_by: username,
    };
    console.log("Submitting loan data with payload:", payload);
    try {
      const loanSaveUrl = withBranchUrl("https://backendaab.in/aabuildersDash/api/loans/save");
      if (selectedLoanType === "Loan" && isPaymentModeRequiringBankRegisterLog(paymentMode)) {
        await postBankRegisterLogSave(
          bankRegisterLogSaveUrlMatchingRequest(loanSaveUrl),
          "Loan Portal",
          {
            bill_payment_mode: paymentMode,
            amount: parseFloat(amountGiven) || 0,
            entered_by: username,
          }
        );
      }
      const response = await fetch(loanSaveUrl, {
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
      // If payment mode is GPay, PhonePe, Net Banking, or Cheque, also save to weekly-payment-bills
      if (selectedLoanType === "Loan" || selectedLoanType === "Refund" && ["GPay", "Gpay", "PhonePe", "Net Banking", "Cheque"].includes(paymentMode)) {
        const weeklyPaymentBillPayload = {
          date: dateValue,
          created_at: new Date().toISOString(),
          contractor_id: selectedOption?.type === "Contractor" ? selectedOption.id : null,
          vendor_id: selectedOption?.type === "Vendor" ? selectedOption.id : null,
          employee_id: selectedOption?.type === "Employee" ? selectedOption.id : null,
          project_id: 0,
          type: selectedLoanType,
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
          account_number: paymentPopupData.accountNumber || null,
          branch_id: activeBranchId,
          source: "Loan Portal",
          entered_by: username,
        };

        const weeklyBillSaveUrl = withBranchUrl("https://backendaab.in/aabuildersDash/api/weekly-payment-bills/save");
        const weeklyPaymentBillResponse = await axios.post(
          weeklyBillSaveUrl,
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
        notifyOrbitModuleDataChanged('loan');
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
    if (!paymentPopupData.accountNumber) {
      toast.error("Please select an account number!", {
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
  const { sortField: sideTableSortField, sortDirection: sideTableSortDirection, handleSort: handleSideTableSort, setSortField: setSideTableSortField, setSortDirection: setSideTableSortDirection } = useEdbcTableSort();
  const { expandedCells: sideTableExpandedCells, toggleExpandedCell: toggleSideTableExpandedCell } = useEdbcExpandedCells();
  const edbc8Config = getEdbcColumnConfig(EDBC_IDS.EDBC8);
  const edbc3Config = getEdbcColumnConfig(EDBC_IDS.EDBC3);
  const edbc17Config = getEdbcColumnConfig(EDBC_IDS.EDBC17);
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
      edbc17Config?.columnWidthClass,
      edbc13Config?.columnWidthClass,
      edbc19Config?.columnWidthClass,
    ].filter(Boolean),
    [edbc2ColumnWidthClass, edbc8Config, edbc3Config, edbc17Config, edbc13Config, edbc19Config],
  );
  const sideTableModeFilterOptions = useMemo(() => {
    const modes = new Set();
    filteredLoanData.forEach((entry) => {
      const mode = (entry.loan_payment_mode || '').trim();
      if (mode) modes.add(mode);
    });
    return Array.from(modes)
      .sort((a, b) => a.localeCompare(b))
      .map((mode) => ({ value: mode, label: mode }));
  }, [filteredLoanData]);
  const sideTableEntryNoFilterOptions = useMemo(() => {
    const entryNos = [...new Set(filteredLoanData.map((entry) => entry.entry_no).filter((n) => n != null && n !== ''))];
    return entryNos
      .sort((a, b) => Number(b) - Number(a))
      .map((n) => ({ value: String(n), label: String(n) }));
  }, [filteredLoanData]);
  const sideTableTransferRefundFilterOptions = useMemo(() => {
    const seen = new Set();
    const options = [loanSideTableBlankOption];
    filteredLoanData.forEach((entry) => {
      const { transferOrRefund } = getLoanSideEntryRowDisplay(entry, getTransferDestination);
      const value = (transferOrRefund || '').trim();
      if (!value || seen.has(value)) return;
      seen.add(value);
      options.push({ value, label: value });
    });
    options.sort((a, b) => {
      if (a.value === LOAN_SIDE_TABLE_BLANK_VALUE) return -1;
      if (b.value === LOAN_SIDE_TABLE_BLANK_VALUE) return 1;
      return a.label.localeCompare(b.label);
    });
    return options;
  }, [filteredLoanData, getTransferDestination]);
  const sideTableEntriesForFilter = useMemo(() => {
    let entries = filteredLoanData;
    if (sideTableFilterDateStart || sideTableFilterDateEnd) {
      entries = entries.filter((entry) =>
        loanEntryMatchesSideTableDateFilter(entry.date, sideTableFilterDateStart, sideTableFilterDateEnd),
      );
    }
    if (sideTableFilterTransferRefund) {
      if (sideTableFilterTransferRefund === LOAN_SIDE_TABLE_BLANK_VALUE) {
        entries = entries.filter(
          (entry) => !getLoanSideEntryRowDisplay(entry, getTransferDestination).transferOrRefund.trim(),
        );
      } else {
        entries = entries.filter(
          (entry) =>
            getLoanSideEntryRowDisplay(entry, getTransferDestination).transferOrRefund === sideTableFilterTransferRefund,
        );
      }
    }
    if (sideTableFilterEntryNo) {
      entries = entries.filter((entry) => String(entry.entry_no ?? '').includes(sideTableFilterEntryNo));
    }
    if (sideTableFilterMode) {
      entries = entries.filter(
        (entry) => (entry.loan_payment_mode || '').toLowerCase() === sideTableFilterMode.toLowerCase(),
      );
    }
    if (sideTableFilterLoanAmount.trim()) {
      entries = entries.filter((entry) => {
        const amountVal = entry.type === 'Refund' ? entry.loan_refund_amount : entry.amount;
        return matchesEdbcAmountFilter(amountVal, sideTableFilterLoanAmount);
      });
    }
    if (!sideTableOverallSearch.trim()) return entries;
    const q = normalizeLoanSideSearchText(sideTableOverallSearch.trim());
    return entries.filter((entry) => {
      const { loanAmount, transferOrRefund, payment_mode, entry_no } = getLoanSideEntryRowDisplay(entry, getTransferDestination);
      const searchable = normalizeLoanSideSearchText(
        [
          new Date(entry.date).toLocaleDateString('en-GB'),
          loanAmount,
          transferOrRefund,
          payment_mode,
          entry_no,
          entry.type,
          entry.description,
          entry.amount,
          entry.loan_refund_amount,
        ].join(' '),
      );
      return searchable.includes(q);
    });
  }, [
    filteredLoanData,
    getTransferDestination,
    sideTableFilterDateStart,
    sideTableFilterDateEnd,
    sideTableFilterTransferRefund,
    sideTableFilterEntryNo,
    sideTableFilterMode,
    sideTableFilterLoanAmount,
    sideTableOverallSearch,
  ]);
  const sideTableLoanTotal = useMemo(
    () =>
      sideTableEntriesForFilter.reduce((total, entry) => {
        if (entry.type === 'Refund') {
          return total - (Number(entry.loan_refund_amount) || 0);
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
          entry.type === 'Refund' ? -(Number(entry.loan_refund_amount) || 0) : Number(entry.amount) || 0;
        aValue = amountVal(a);
        bValue = amountVal(b);
      } else if (sideTableSortField === 'paymentMode') {
        aValue = (a.loan_payment_mode || '').toLowerCase();
        bValue = (b.loan_payment_mode || '').toLowerCase();
      } else if (sideTableSortField === 'siteName') {
        aValue = getLoanSideEntryRowDisplay(a, getTransferDestination).transferOrRefund.toLowerCase();
        bValue = getLoanSideEntryRowDisplay(b, getTransferDestination).transferOrRefund.toLowerCase();
      } else if (sideTableSortField === 'date') {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      } else if (sideTableSortField === 'eno') {
        aValue = String(a.entry_no ?? '').toLowerCase();
        bValue = String(b.entry_no ?? '').toLowerCase();
      } else {
        aValue = String(a[sideTableSortField] ?? '').toLowerCase();
        bValue = String(b[sideTableSortField] ?? '').toLowerCase();
      }
      if (aValue < bValue) return sideTableSortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sideTableSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sideTableEntriesForFilter, sideTableSortField, sideTableSortDirection, getTransferDestination]);
  const sideTableHasActiveColumnFilters =
    sideTableFilterDateStart ||
    sideTableFilterDateEnd ||
    sideTableFilterTransferRefund ||
    sideTableFilterEntryNo ||
    sideTableFilterMode ||
    sideTableFilterLoanAmount.trim();
  const clearSideTableFilters = useCallback(() => {
    setSideTableFilterDateStart('');
    setSideTableFilterDateEnd('');
    setSideTableShowDateRangePicker(false);
    setSideTableFilterTransferRefund('');
    setSideTableFilterEntryNo('');
    setSideTableFilterMode('');
    setSideTableFilterLoanAmount('');
    setSideTableOverallSearch('');
    setSideTableSortField('');
    setSideTableSortDirection('asc');
  }, [setSideTableSortField, setSideTableSortDirection]);
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
        sideTableFilterAnchorRowRef.current = getFirstVisibleLoanSideTableBodyRow(scroller);
        sideTableFilterScrollTopBeforeToggleRef.current = scroller.scrollTop;
      }
      sideTablePendingFilterOpenNudgeRef.current = true;
      setSideTableShowFilters(true);
      return;
    }
    if (scroller) {
      sideTableFilterAnchorRowRef.current = getFirstVisibleLoanSideTableBodyRow(scroller);
      sideTableFilterScrollTopBeforeToggleRef.current = scroller.scrollTop;
      sideTableFilterRowHeightBeforeCloseRef.current = sideTableFilterRowRef.current?.offsetHeight || 0;
    }
    sideTablePendingFilterCloseNudgeRef.current = true;
    setSideTableShowFilters(false);
  }, [sideTableShowFilters]);
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
      alignLoanSideTableRowBelowHeader(scroller, row);
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
      alignLoanSideTableRowBelowHeader(scroller, row);
      sideTableFilterNudgeUsedRef.current = false;
    }
  }, [sideTableShowFilters]);
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
      const isMatchingPayment = matchesEdbcPaymentModeFilter(
        entry.loan_payment_mode,
        filteredPaymentMode,
        {
          blankValue: 'Blank',
          isBlankish: (value) => !value || String(value).trim() === '',
        },
      );
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
    if (selectedLoanType === "Loan" && ["GPay", "Gpay", "PhonePe", "Net Banking", "Cheque"].includes(paymentMode)) {
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
      const payload = {
        ...editFormData,
        branch_id: editFormData.branch_id ?? activeBranchId
      };
      const res = await fetch(`https://backendaab.in/aabuildersDash/api/loans/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to update');
      const response = await fetch('https://backendaab.in/aabuildersDash/api/loans/all');
      if (response.ok) {
        const data = await response.json();
        setLoanData(data);
        notifyOrbitModuleDataChanged('loan');
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
  }, [editingId, editFormData, username, activeBranchId, withBranchUrl]);

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
    window.addEventListener('resize', scheduleSync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', scheduleSync);
    };
  }, [selectedLoanType]);

  useLayoutEffect(() => {
    const el = document.createElement('style');
    el.setAttribute('data-loan-side-table-form-path', '');
    el.textContent = LOAN_SIDE_TABLE_FORM_PATH_CSS;
    document.head.appendChild(el);
    return () => {
      el.remove();
    };
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-104px)] overflow-hidden bg-[#FAF6ED]">
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden px-[18px] pt-[18px] pb-[18px] bg-[#FAF6ED]">
        <div className="w-full pt-[18px] px-[18px] pb-[18px] rounded-[6px] bg-white mb-[18px] text-left flex items-center gap-6">
          <div className="flex flex-wrap gap-[10px] w-full">
            <div>
              <label className="block mb-[8px] font-semibold text-sm sm:text-base">From Date</label>
              <div className="w-[150px]">
                <CustomDateField
                  value={fromDate}
                  onChange={setFromDate}
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
                  value={toDate}
                  onChange={setToDate}
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
                isMulti
                isClearable={false}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                controlShouldRenderValue={false}
                filterOption={() => true}
                options={finalPaymentModeOptions}
                value={finalPaymentModeOptions.filter((option) =>
                  filteredPaymentMode.some((selectedValue) => equalsEdbcFilterValue(option.value, selectedValue)),
                )}
                onChange={(selected) => setFilteredPaymentMode((selected || []).map((option) => option.value))}
                placeholder="Payment Mode"
                menuPortalTarget={document.body}
                noOptionsMessage={() => null}
                components={{ Option: LoanTopPaymentModeCheckboxOption }}
                styles={{
                  ...LOAN_TOP_PAYMENT_MODE_MULTI_SELECT_STYLES,
                  placeholder: (provided) => ({
                    ...LOAN_TOP_PAYMENT_MODE_MULTI_SELECT_STYLES.placeholder(provided),
                    color: '#A6A5A6',
                  }),
                  dropdownIndicator: (provided, state) => ({
                    ...LOAN_TOP_PAYMENT_MODE_MULTI_SELECT_STYLES.dropdownIndicator(provided, state),
                    paddingLeft: 0,
                    paddingRight: 4,
                  }),
                }}
                className="lg:w-[150px] rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block mb-[8px] font-semibold text-sm sm:text-base">Amount Given</label>
              <AdvancePortalAmountOutput variant="filter" value={filteredAmount} />
            </div>
            <div>
              <label className="block mb-[8px] font-semibold text-sm sm:text-base">Today Amount</label>
              <AdvancePortalAmountOutput variant="filter" value={todayAmount} />
            </div>
            <div>
              <label className="block mb-[8px] font-semibold text-sm sm:text-base">Total Outstanding</label>
              <AdvancePortalAmountOutput variant="filter" value={totalOutstanding} />
            </div>
          </div>
        </div>

        <div className="w-full flex-1 min-h-0 min-w-0 max-xl:overflow-y-auto xl:overflow-hidden no-scrollbar scrollbar-none flex flex-col pt-[18px] px-[18px] pb-[18px] bg-white rounded-[6px]">
          <div className="max-xl:flex-none xl:flex flex-1 min-h-0 xl:min-w-0 gap-[18px]">
              <div className="shrink-0 w-fit" ref={leftFormColRef}>
                <div className='grid grid-cols-2 gap-3 text-left'>
                  <div className='text-left max-w-[300px]'>
                    <label className={ADVANCE_PORTAL_LABEL_CLASS}>Account Type<span className="text-[#E4572E]">*</span></label>
                    <Select
                      options={[
                        { value: 'Loan', label: 'Loan' },
                        { value: 'Refund', label: 'Refund' },
                        { value: 'Transfer', label: 'Transfer' }
                      ]}
                      value={selectedLoanType ? { value: selectedLoanType, label: selectedLoanType } : null}
                      onChange={(selected) => setSelectedLoanType(selected ? selected.value : '')}
                      placeholder="Account Type"
                      isSearchable
                      isClearable
                      styles={customStyles}
                      className={ADVANCE_PORTAL_SELECT_CLASS}
                    />
                  </div>
                  <div className='text-left'>
                    <label className={ADVANCE_PORTAL_LABEL_CLASS}>Date<span className="text-[#E4572E]">*</span></label>
                    <div className="expense-entry-form-date w-[300px]">
                      <CustomDateField
                        value={dateValue}
                        onChange={setDateValue}
                        placeholder="Date"
                        className="w-full text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                        controlHeightPx={40}
                        alwaysOpenBelow
                        anchor="right"
                      />
                    </div>
                  </div>
                  <div className='text-left'>
                    <label className={ADVANCE_PORTAL_LABEL_CLASS}>Associate<span className="text-[#E4572E]">*</span></label>
                    <Select
                      options={combinedOptions}
                      value={selectedOption}
                      onChange={handleChange}
                      className={ADVANCE_PORTAL_SELECT_CLASS}
                      isClearable
                      isSearchable
                      styles={customStyles}
                      placeholder="Con/Ven/Emp/Lab"
                    />
                  </div>
                  <div className='text-left'>
                    <label className={ADVANCE_PORTAL_LABEL_CLASS}>Overall Loan</label>
                    <AdvancePortalAmountOutput value={overallLoan} />
                  </div>
                  <div className='text-left'>
                    <label className={ADVANCE_PORTAL_LABEL_CLASS}>Purpose<span className="text-[#E4572E]">*</span></label>
                    <Select
                      options={purposeOptions}
                      value={purpose ? purposeOptions.find(opt => opt.id === parseInt(purpose)) : null}
                      onChange={(selected) => setPurpose(selected ? selected.id : '')}
                      placeholder="Purpose"
                      isSearchable
                      isClearable
                      styles={customStyles}
                      className={ADVANCE_PORTAL_SELECT_CLASS}
                    />
                  </div>
                  <div className='text-left'>
                    <label className={ADVANCE_PORTAL_LABEL_CLASS}>Loan Amount</label>
                    <AdvancePortalAmountOutput value={loanAmount} />
                  </div>
                  <div className='col-span-2'>
                    <div className="flex flex-row gap-3">
                      <div className="text-left flex-1">
                        <label className={ADVANCE_PORTAL_LABEL_CLASS}>
                          {selectedLoanType === 'Transfer' ? 'Transfer To' :
                            selectedLoanType === 'Refund' ? 'Amount' : 'Amount Given'}
                        </label>
                        {selectedLoanType === 'Transfer' ? (
                          <Select
                            options={combinedSitePurposeOptions}
                            value={transferSelection}
                            onChange={(selected) => setTransferSelection(selected || null)}
                            className={ADVANCE_PORTAL_SELECT_CLASS}
                            isClearable
                            isSearchable
                            styles={customStyles}
                            placeholder="Transfer To"
                          />
                        ) : (
                          <AdvancePortalAmountInput
                            value={amountGiven}
                            onChange={handleAmountChange}
                            placeholder={selectedLoanType === 'Refund' ? 'Amount' : 'Amount Given'}
                            fullWidth
                          />
                        )}
                      </div>
                      <div className="text-left">
                        <label className={ADVANCE_PORTAL_LABEL_CLASS}>
                          {selectedLoanType === 'Transfer' ? 'Transfer Amount' : 'Payment Mode'}
                        </label>
                        {selectedLoanType === 'Transfer' ? (
                          <AdvancePortalAmountInput
                            value={transferAmount}
                            onChange={handleTransferAmountChange}
                            placeholder="Transfer Amount"
                          />
                        ) : (
                          <Select
                            options={finalPaymentModeOptions}
                            value={paymentMode ? { value: paymentMode, label: paymentMode } : null}
                            onChange={(selected) => {
                              const newPaymentMode = selected ? selected.value : '';
                              setPaymentMode(newPaymentMode);
                              if (!["GPay", "Gpay", "PhonePe", "Net Banking", "Cheque"].includes(newPaymentMode)) {
                                setPaymentPopupData({
                                  chequeNo: "",
                                  chequeDate: "",
                                  transactionNumber: "",
                                  accountNumber: ""
                                });
                              }
                            }}
                            placeholder="Payment Mode"
                            isSearchable
                            isClearable
                            menuPortalTarget={document.body}
                            styles={customStyles}
                            className={ADVANCE_PORTAL_SELECT_CLASS}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 text-left" ref={descriptionSectionRef}>
                    <label className={ADVANCE_PORTAL_LABEL_CLASS}>Description</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Description"
                      className={`${ADVANCE_PORTAL_TEXTAREA_CLASS} hover:!border-[rgba(191,152,83,0.2)] focus:!border-[rgba(191,152,83,1)]`}
                    />
                  </div>
                  <div className='col-span-2 min-w-0 overflow-hidden'>
                    <div className="flex items-start justify-between lg:w-[616px] w-[300px] gap-2 flex-wrap mb-2 min-w-0">
                      <div className="flex shrink-0">
                        <label htmlFor="fileInput" className="cursor-pointer flex items-center gap-[6px] text-orange-600">
                          <img className="w-[15px] h-[16px]" alt="" src={Attach} />
                          <span className="text-[14px] font-semibold">Attach file</span>
                        </label>
                        <input type="file" id="fileInput" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                      </div>
                      {selectedLoanFile && (
                        <span className="text-gray-600 text-[12px] break-words min-w-0 text-right" title={selectedLoanFile.name}>
                          {selectedLoanFile.name}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      className={`bg-[#c7934c] text-white w-full sm:w-[120px] h-[33px] rounded flex items-center justify-center text-sm xl:mb-0 mb-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                      onClick={handleSubmit}
                    >
                      {isSubmitting ? 'Processing...' : selectedLoanType === 'Refund' ? 'Refund' : selectedLoanType === 'Transfer' ? 'Transfer' : 'Loan'}
                    </button>
                  </div>
                </div>
              </div>
              <div
                className={`min-w-0 flex-1 flex flex-col ${sideTableAreaHeight != null ? 'h-full' : 'overflow-x-auto'}`}
                style={sideTableAreaHeight != null ? { height: `${sideTableAreaHeight}px` } : undefined}
              >
                <div
                  className={`expense-form-side-table-host min-h-0 overflow-hidden w-full ${sideTableContentHeight != null ? 'flex-1 min-h-0' : ''}`}
                  style={
                    sideTableContentHeight != null
                      ? { height: `${sideTableContentHeight}px` }
                      : undefined
                  }
                >
                  <div className="side-table-root side-table-form-path w-full min-w-0 max-w-full flex flex-col h-full min-h-0">
                    <div className="form-side-table-toolbar-row w-full max-w-[868px] min-w-0 shrink-0 text-left mb-[8px]">
                      <div className="flex w-full justify-between items-start gap-[8px] mt-[4px] mb-[12px]">
                        <h2 className="form-side-table-advance-header text-base font-semibold leading-none">Loan</h2>
                        <span className="form-side-table-advance-amount text-base font-bold text-[#E4572E] leading-none">
                          ₹{(!selectedOption || !purpose) ? '0.00' : formatAmountDisplay(loanAmount)}
                        </span>
                      </div>
                      <div className="flex min-w-0 w-full flex-nowrap items-center justify-between gap-[6px]">
                        <div
                          className={`form-side-table-filter-left flex min-w-0 items-center overflow-hidden flex-nowrap${sideTableHasActiveColumnFilters ? ' flex-1 gap-[8px]' : ' shrink-0 gap-[6px]'}`}
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
                              {sideTableFilterLoanAmount.trim() && (
                                <span className="inline-flex shrink-0 items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit">
                                  <span className="font-medium text-[#BF9853]">Loan: </span>
                                  <span className="font-semibold text-[14px]">{sideTableFilterLoanAmount}</span>
                                  <button type="button" onClick={() => setSideTableFilterLoanAmount('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                                </span>
                              )}
                              {sideTableFilterTransferRefund && (
                                <span className="inline-flex shrink-0 items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit">
                                  <span className="font-medium text-[#BF9853]">Transfer/Refund: </span>
                                  <span className="font-semibold text-[14px]">
                                    {sideTableFilterTransferRefund === LOAN_SIDE_TABLE_BLANK_VALUE
                                      ? LOAN_SIDE_TABLE_BLANK_LABEL
                                      : sideTableFilterTransferRefund}
                                  </span>
                                  <button type="button" onClick={() => setSideTableFilterTransferRefund('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                                </span>
                              )}
                              {sideTableFilterEntryNo && (
                                <span className="inline-flex shrink-0 items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit">
                                  <span className="font-medium text-[#BF9853]">Entry No: </span>
                                  <span className="font-semibold text-[14px]">{sideTableFilterEntryNo}</span>
                                  <button type="button" onClick={() => setSideTableFilterEntryNo('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
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
                            onExportPdf={handleExportPDF}
                            onExportCsv={handleExportCSV}
                            clearButtonType="button"
                            wrapperClassName={null}
                            searchWrapperClassName="h-[34px] min-w-0 w-[286px] max-w-[286px] shrink-0 border border-[#D6D6D6] rounded-md bg-white flex items-center px-2"
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
                            <table className={`table-fixed border-collapse ${EDBC_TABLE_EDGE_TABLE_CLASS} ${LOAN_SIDE_TABLE_COLUMN_LOCK_TABLE_CLASS}`.trim()}>
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
                                    label="Loan"
                                    {...sideTableEdbcSortProps}
                                  />
                                  <EdbcColumnHeader
                                    columnId={EDBC_IDS.EDBC3}
                                    label="Transfer/Refund"
                                    {...sideTableEdbcSortProps}
                                  />
                                  <EdbcColumnHeader
                                    columnId={EDBC_IDS.EDBC17}
                                    label="Entry No"
                                    {...sideTableEdbcSortProps}
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
                                      totalAmount={sideTableLoanTotal}
                                      value={sideTableFilterLoanAmount}
                                      onChange={(e) => setSideTableFilterLoanAmount(e.target.value)}
                                    />
                                    <th id={EDBC_IDS.EDBC3} className={edbc3Config?.filterThClass}>
                                      <Select
                                        className={edbc3Config?.filterWidthClass}
                                        options={sideTableTransferRefundFilterOptions}
                                        value={
                                          !sideTableFilterTransferRefund
                                            ? null
                                            : sideTableFilterTransferRefund === LOAN_SIDE_TABLE_BLANK_VALUE
                                              ? loanSideTableBlankOption
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
                                    <EdbcSelectFilter
                                      columnId={EDBC_IDS.EDBC17}
                                      placeholder="Entry No"
                                      options={sideTableEntryNoFilterOptions}
                                      value={sideTableFilterEntryNo}
                                      onChange={setSideTableFilterEntryNo}
                                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                                      textAlign="right"
                                    />
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
                                {!selectedOption || !purpose ? (
                                  <tr>
                                    <td colSpan={6} className="text-center py-4 text-sm text-gray-500">
                                      Please select an associate to view loan records.
                                    </td>
                                  </tr>
                                ) : sideTableSortedEntries.length === 0 ? (
                                  <tr>
                                    <td colSpan={6} className="text-center py-4 text-sm text-gray-500">
                                      No records found for the selected associate and purpose.
                                    </td>
                                  </tr>
                                ) : (
                                  sideTableSortedEntries.map((entry, index) => {
                                    const row = toLoanSideExpenseRow(entry);
                                    const { loanAmount, transferOrRefund, payment_mode, entry_no } =
                                      getLoanSideEntryRowDisplay(entry, getTransferDestination);
                                    return (
                                      <EdbcTableBodyRow key={entry.loanPortalId ?? index}>
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
                                          getDisplayValue={() => loanAmount}
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
                                          columnId={EDBC_IDS.EDBC17}
                                          expense={row}
                                          rowIndex={index}
                                          expandedCells={sideTableExpandedCells}
                                          onToggleExpanded={toggleSideTableExpandedCell}
                                          textAlignClass="text-right"
                                          getDisplayValue={() => entry_no}
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
                                          onDelete={() => {}}
                                          onHistory={() => {}}
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
            </div>
          </div>
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
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
                      placeholder="Payment Mode"
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
                      placeholder="Purpose"
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

                  {(paymentMode === "GPay" || paymentMode === "Gpay" || paymentMode === "PhonePe" ||
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
                              <label className="block text-sm font-medium text-gray-700 mb-2">Account Number<span className="text-red-500">*</span></label>
                              <Select
                                options={accountDetails.map((account) => ({
                                  value: account.account_number,
                                  label: account.account_number
                                }))}
                                value={paymentPopupData.accountNumber ? { value: paymentPopupData.accountNumber, label: paymentPopupData.accountNumber } : null}
                                onChange={(selected) => setPaymentPopupData(prev => ({ ...prev, accountNumber: selected ? selected.value : '' }))}
                                placeholder="Account Number"
                                isSearchable
                                isClearable
                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                menuPosition="fixed"
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
                            placeholder="Type"
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
                            placeholder="Con/Ven/Emp/Lab"
                            className="custom-select rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold mb-1 block">Purpose</label>
                          <Select
                            options={purposeOptions}
                            value={purpose ? purposeOptions.find(opt => opt.id === parseInt(purpose)) : null}
                            onChange={(selected) => setPurpose(selected ? selected.id : '')}
                            placeholder="Purpose"
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
                                  if (!["GPay", "Gpay", "PhonePe", "Net Banking", "Cheque"].includes(newPaymentMode)) {
                                    setPaymentPopupData({
                                      chequeNo: "",
                                      chequeDate: "",
                                      transactionNumber: "",
                                      accountNumber: ""
                                    });
                                  }
                                }}
                                placeholder="Payment Mode"
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
                                placeholder="Transfer To"
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
    </div>
  )
}
export default LoanPortal
