import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Select from 'react-select';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import PdfIcon from '../Images/pdf.png';
import XlIcon from '../Images/sheets.png';
import FileRemover from '../Images/FileRemover.svg';
import {
  EDBC_IDS,
  getEdbcColumnConfig,
  EdbcTableHeaderRow,
  EdbcTableFilterRow,
  EdbcTableBodyRow,
  EdbcColumnHeader,
  EdbcTotalAmountFilter,
  matchesEdbcAmountFilter,
  DATABASE_TABLE_FILTER_SELECT_STYLES,
  EDBC_TABLE_EDGE_TABLE_CLASS,
  EDBC8_COLUMN_LOCK_TABLE_CLASS,
  EDBC2_FIRST_COLUMN_WIDTH_CLASS,
  useEdbcExpandedCells,
  EdbcExpandableBodyCell,
  EdbcFilterToggleButton,
  EdbcTableToolbarRightActions,
  EdbcEmptyFilterCell,
} from '../ExpensesEntry/databaseExpensesSharedColumns';

const SUMMARY_FIRST_COLUMN_FILTER_SELECT_STYLES = {
  ...DATABASE_TABLE_FILTER_SELECT_STYLES,
  dropdownIndicator: (provided, state) => ({
    ...DATABASE_TABLE_FILTER_SELECT_STYLES.dropdownIndicator(provided, state),
    display: state.hasValue ? 'none' : 'flex',
  }),
};

const SUMMARY_EDBC13_COLUMN_LOCK =
  '[&_th#EDBC-13]:!w-[130px] [&_td#EDBC-13]:!w-[130px] [&_th#EDBC-13]:!min-w-[130px] [&_td#EDBC-13]:!min-w-[130px] [&_th#EDBC-13]:!max-w-[130px] [&_td#EDBC-13]:!max-w-[130px] [&_th#EDBC-13]:!overflow-hidden [&_td#EDBC-13]:!overflow-hidden';
const SUMMARY_EDBC14_COLUMN_LOCK =
  '[&_th#EDBC-14]:!w-[158px] [&_td#EDBC-14]:!w-[158px] [&_th#EDBC-14]:!min-w-[158px] [&_td#EDBC-14]:!min-w-[158px] [&_th#EDBC-14]:!max-w-[158px] [&_td#EDBC-14]:!max-w-[158px]';
const SUMMARY_EDBC4_COLUMN_LOCK =
  '[&_th#EDBC-4]:!w-[230px] [&_td#EDBC-4]:!w-[230px] [&_th#EDBC-4]:!min-w-[230px] [&_td#EDBC-4]:!min-w-[230px] [&_th#EDBC-4]:!max-w-[230px] [&_td#EDBC-4]:!max-w-[230px] [&_th#EDBC-4]:!overflow-hidden [&_td#EDBC-4]:!overflow-hidden';
const SUMMARY_EDBC3_COLUMN_LOCK =
  '[&_th#EDBC-3]:!w-[310px] [&_td#EDBC-3]:!w-[310px] [&_th#EDBC-3]:!min-w-[310px] [&_td#EDBC-3]:!min-w-[310px] [&_th#EDBC-3]:!max-w-[310px] [&_td#EDBC-3]:!max-w-[310px] [&_th#EDBC-3]:!overflow-hidden [&_td#EDBC-3]:!overflow-hidden';
const SUMMARY_TABLE_CLASS = `table-fixed border-collapse ${EDBC_TABLE_EDGE_TABLE_CLASS} ${EDBC8_COLUMN_LOCK_TABLE_CLASS} ${SUMMARY_EDBC13_COLUMN_LOCK} ${SUMMARY_EDBC14_COLUMN_LOCK} [&_th#EDBC-13]:!pr-0 [&_td#EDBC-13]:!pr-0 [&_th#EDBC-14]:!pr-0 [&_td#EDBC-14]:!pr-0`;
const SUMMARY_LEFT_TABLE_CLASS = `${SUMMARY_TABLE_CLASS} ${SUMMARY_EDBC4_COLUMN_LOCK} w-[758px] min-w-[758px]`;
const SUMMARY_RIGHT_TABLE_CLASS = `${SUMMARY_TABLE_CLASS} ${SUMMARY_EDBC3_COLUMN_LOCK} w-[838px] min-w-[838px]`;
const LOAN_SUMMARY_LEFT_TABLE_TOOLBAR_WIDTH_CLASS = 'w-[758px]';
const LOAN_SUMMARY_RIGHT_TABLE_TOOLBAR_WIDTH_CLASS = 'w-[838px]';
const LOAN_SUMMARY_LEFT_PANEL_HEADER_WIDTH_CLASS = 'w-[794px]';
const LOAN_SUMMARY_RIGHT_PANEL_HEADER_WIDTH_CLASS = 'w-[874px]';

const SUMMARY_POPUP_TABLE_CLASS = `table-fixed w-[468px] max-w-full border-collapse ${EDBC_TABLE_EDGE_TABLE_CLASS} ${EDBC8_COLUMN_LOCK_TABLE_CLASS} [&_th#EDBC-2]:!w-[130px] [&_td#EDBC-2]:!w-[130px] [&_th#EDBC-2]:!min-w-[130px] [&_td#EDBC-2]:!min-w-[130px] [&_th#EDBC-2]:!max-w-[130px] [&_td#EDBC-2]:!max-w-[130px]`;

const SummaryPopupContextHeader = ({ context }) => (
  <h3 className="text-[18px] font-semibold text-[#000000] min-w-0 break-words whitespace-normal">
    {context}
  </h3>
);

const SummaryPopupExportActions = ({ onExportPdf, onExportCsv }) => (
  <div className="flex shrink-0 justify-end items-center gap-[8px]">
    <span
      className="text-[#E4572E] flex items-center gap-1 font-semibold hover:underline cursor-pointer"
      onClick={onExportPdf}
    >
      PDF
      <img src={PdfIcon} alt="Pdf" className="w-4 h-4" />
    </span>
    <span
      className="text-[#007233] flex items-center gap-1 font-semibold hover:underline cursor-pointer"
      onClick={onExportCsv}
    >
      XL
      <img src={XlIcon} alt="XL" className="w-4 h-4" />
    </span>
  </div>
);

const SUMMARY_OUTSIDE_SELECT_CLASS = 'custom-select w-[300px] h-[40px] rounded-lg focus:outline-none';
const summaryOutsideSelectStyles = {
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
    height: '41px',
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
    fontWeight: '500',
  }),
  input: (provided) => ({
    ...provided,
    margin: 0,
    padding: 0,
    fontWeight: '500',
    color: 'black',
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
    fontWeight: '500',
    textAlign: 'left',
    '&:active': {
      backgroundColor: state.isSelected ? '#BF9853' : '#FAF6ED',
    },
  }),
};
const SUMMARY_PANEL_SHADOW =
  'shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1),0_-8px_15px_-3px_rgba(0,0,0,0.1)]';
const SUMMARY_BOX_STYLE = {
  backgroundColor: '#FFFDF9',
  backgroundImage: [
    'repeating-linear-gradient(90deg, #E4572E66 0 3px, transparent 3px 6px)',
    'repeating-linear-gradient(90deg, #E4572E66 0 3px, transparent 3px 6px)',
    'repeating-linear-gradient(0deg, #E4572E66 0 3px, transparent 3px 6px)',
    'repeating-linear-gradient(0deg, #E4572E66 0 3px, transparent 3px 6px)',
  ].join(', '),
  backgroundSize: '100% 1px, 100% 1px, 1px 100%, 1px 100%',
  backgroundPosition: '0 0, 0 100%, 0 0, 100% 0',
  backgroundRepeat: 'repeat-x, repeat-x, repeat-y, repeat-y',
};
const formatSummaryAmount = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const edbc2Config = getEdbcColumnConfig(EDBC_IDS.EDBC2);
const edbc4Config = getEdbcColumnConfig(EDBC_IDS.EDBC4);
const edbc8Config = getEdbcColumnConfig(EDBC_IDS.EDBC8);
const edbc13Config = getEdbcColumnConfig(EDBC_IDS.EDBC13);
const edbc14Config = getEdbcColumnConfig(EDBC_IDS.EDBC14);
const LOAN_STATUS_PENDING_COLOR = '#E4572E';
const LOAN_STATUS_CLEARED_COLOR = '#007233';

const SummaryFilterChip = ({ label, value, onClear }) => (
  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium">
    <span className="font-medium text-[#BF9853] whitespace-nowrap">{label}:</span>
    <span className="font-semibold text-[14px] whitespace-nowrap">{value}</span>
    <button type="button" onClick={onClear} className="text-[#E4572E] ml-1 text-2xl leading-none shrink-0">×</button>
  </span>
);

const SummaryEdbcSelectFilter = ({ columnId, placeholder, options, value, onChange }) => {
  const config = getEdbcColumnConfig(columnId);
  if (!config) return null;
  const resolvedValue = value ? { value, label: value } : null;
  return (
    <th id={columnId} className={config.filterThClass}>
      <Select
        className={config.filterWidthClass}
        options={options}
        value={resolvedValue}
        onChange={(selectedOption) => onChange(selectedOption ? selectedOption.value : '')}
        placeholder={placeholder}
        menuPlacement="bottom"
        menuPortalTarget={document.body}
        isSearchable
        noOptionsMessage={() => 'No options'}
        styles={SUMMARY_FIRST_COLUMN_FILTER_SELECT_STYLES}
      />
    </th>
  );
};

const SummaryPurposeNameFilter = ({ placeholder, options, value, onChange }) => {
  const config = getEdbcColumnConfig(EDBC_IDS.EDBC4);
  if (!config) return null;
  const resolvedValue = value ? { value, label: value } : null;
  return (
    <th id={EDBC_IDS.EDBC4} className={config.filterThClass}>
      <Select
        className={config.filterWidthClass}
        options={options}
        value={resolvedValue}
        onChange={(selectedOption) => onChange(selectedOption ? selectedOption.value : '')}
        placeholder={placeholder}
        menuPlacement="bottom"
        menuPortalTarget={document.body}
        isSearchable
        noOptionsMessage={() => 'No options'}
        styles={SUMMARY_FIRST_COLUMN_FILTER_SELECT_STYLES}
      />
    </th>
  );
};

const SummaryAssociateNameFilter = ({ placeholder, options, value, onChange }) => {
  const config = getEdbcColumnConfig(EDBC_IDS.EDBC3);
  if (!config) return null;
  const resolvedValue = value ? { value, label: value } : null;
  return (
    <th id={EDBC_IDS.EDBC3} className={config.filterThClass}>
      <Select
        className={config.filterWidthClass}
        options={options}
        value={resolvedValue}
        onChange={(selectedOption) => onChange(selectedOption ? selectedOption.value : '')}
        placeholder={placeholder}
        menuPlacement="bottom"
        menuPortalTarget={document.body}
        isSearchable
        noOptionsMessage={() => 'No options'}
        styles={SUMMARY_FIRST_COLUMN_FILTER_SELECT_STYLES}
      />
    </th>
  );
};

const renderLoanStatusBodyCell = ({
  status,
  pendingLoan,
  rowId,
  rowIndex,
  expandedCells,
  onToggleExpanded,
  onClick,
}) => {
  const cellKey = `${rowId ?? rowIndex}-paymentMode`;
  const expanded = expandedCells[cellKey];
  const tdClass = edbc13Config?.tdClass;
  return (
    <td id={EDBC_IDS.EDBC13} className={`${tdClass} !pr-0`}>
      <span
        onClick={onClick}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onToggleExpanded(cellKey);
        }}
        className={`block w-full cursor-pointer font-semibold ${expanded ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
        style={{ color: pendingLoan > 0 ? LOAN_STATUS_PENDING_COLOR : LOAN_STATUS_CLEARED_COLOR }}
        title={status}
      >
        {status}
      </span>
    </td>
  );
};

const useTableDragScroll = () => {
  const scrollRef = useRef(null);
  const isPointerDown = useRef(false);
  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const scroll = useRef({ left: 0, top: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);
  const lastMove = useRef({ time: 0, x: 0, y: 0 });
  const resetDragState = useCallback(() => {
    isPointerDown.current = false;
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = '';
      scrollRef.current.style.userSelect = '';
    }
  }, []);
  const cancelMomentum = useCallback(() => {
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
  }, []);
  const applyMomentum = useCallback(() => {
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
  }, [cancelMomentum]);
  const handleDocumentMouseMove = useCallback((e) => {
    if (!isPointerDown.current || !scrollRef.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (!isDragging.current) {
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
      isDragging.current = true;
      scrollRef.current.style.cursor = 'grabbing';
      scrollRef.current.style.userSelect = 'none';
    }
    const now = Date.now();
    const dt = now - lastMove.current.time || 16;
    velocity.current = {
      x: (e.clientX - lastMove.current.x) / dt,
      y: (e.clientY - lastMove.current.y) / dt,
    };
    scrollRef.current.scrollLeft = scroll.current.left - dx;
    scrollRef.current.scrollTop = scroll.current.top - dy;
    lastMove.current = { time: now, x: e.clientX, y: e.clientY };
  }, []);
  const handleDocumentMouseUp = useCallback(() => {
    document.removeEventListener('mousemove', handleDocumentMouseMove);
    document.removeEventListener('mouseup', handleDocumentMouseUp);
    if (!scrollRef.current) {
      resetDragState();
      return;
    }
    const wasDragging = isDragging.current;
    resetDragState();
    if (wasDragging) applyMomentum();
  }, [applyMomentum, handleDocumentMouseMove, resetDragState]);
  const handleMouseDown = useCallback((e) => {
    if (!scrollRef.current || e.button !== 0) return;
    isPointerDown.current = true;
    isDragging.current = false;
    start.current = { x: e.clientX, y: e.clientY };
    scroll.current = {
      left: scrollRef.current.scrollLeft,
      top: scrollRef.current.scrollTop,
    };
    lastMove.current = { time: Date.now(), x: e.clientX, y: e.clientY };
    cancelMomentum();
    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);
  }, [cancelMomentum, handleDocumentMouseMove, handleDocumentMouseUp]);
  return { scrollRef, handleMouseDown };
};

const SummaryTableExportActions = ({ onExportPdf, onExportCsv }) => (
  <div className="flex shrink-0 items-end gap-2">
    <span className="text-[#E4572E] flex items-center gap-1 font-semibold hover:underline cursor-pointer" onClick={onExportPdf}>
      PDF<img src={PdfIcon} alt="Pdf" className="w-4 h-4" />
    </span>
    <span className="text-[#007233] flex items-center gap-1 font-semibold hover:underline cursor-pointer" onClick={onExportCsv}>
      XL<img src={XlIcon} alt="XL" className="w-4 h-4" />
    </span>
  </div>
);

const LoanSummary = () => {
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [labourOptions, setLabourOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  const [purposeOptions, setPurposeOptions] = useState([]);
  const [loanData, setLoanData] = useState([]);
  const [combinedOptions, setCombinedOptions] = useState([]);
  const [selectedAssociate, setSelectedAssociate] = useState(null);
  const [selectedPurpose, setSelectedPurpose] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [tooltipTitle, setTooltipTitle] = useState("");
  const [tooltipTable, setTooltipTable] = useState('associate');
  const [pendingAdvanceAssociate, setPendingAdvanceAssociate] = useState(0);
  const [pendingAdvancePurpose, setPendingAdvancePurpose] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [purposeSortConfig, setPurposeSortConfig] = useState({ key: null, direction: 'asc' });
  
  // Popup/Modal state for Associate panel (Left Panel)
  const [associatePopupData, setAssociatePopupData] = useState(null);
  const [associatePopupTitle, setAssociatePopupTitle] = useState("");
  const [associatePopupContext, setAssociatePopupContext] = useState("");
  const [showAssociatePopup, setShowAssociatePopup] = useState(false);
  const [associatePopupSortConfig, setAssociatePopupSortConfig] = useState({ key: null, direction: 'asc' });
  
  // Popup/Modal state for Purpose panel (Right Panel)
  const [purposePopupData, setPurposePopupData] = useState(null);
  const [purposePopupTitle, setPurposePopupTitle] = useState("");
  const [purposePopupContext, setPurposePopupContext] = useState("");
  const [showPurposePopup, setShowPurposePopup] = useState(false);
  const [purposePopupSortConfig, setPurposePopupSortConfig] = useState({ key: null, direction: 'asc' });
  
  // Popup/Modal state for Status popup (combined loan + refund)
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [statusPopupData, setStatusPopupData] = useState({ loans: [], refunds: [] });
  const [statusPopupContext, setStatusPopupContext] = useState("");
  const [statusPopupSortConfig, setStatusPopupSortConfig] = useState({ key: null, direction: 'asc' });
  const [isStatusFromAssociatePanel, setIsStatusFromAssociatePanel] = useState(true);

  const associateTableScroll = useTableDragScroll();
  const purposeTableScroll = useTableDragScroll();
  const associateScrollRef = associateTableScroll.scrollRef;
  const purposeScrollRef = purposeTableScroll.scrollRef;
  const { expandedCells: associateExpandedCells, toggleExpandedCell: toggleAssociateExpandedCell } = useEdbcExpandedCells();
  const { expandedCells: purposeExpandedCells, toggleExpandedCell: togglePurposeExpandedCell } = useEdbcExpandedCells();
  const [showAssociateFilters, setShowAssociateFilters] = useState(false);
  const [showPurposeTableFilters, setShowPurposeTableFilters] = useState(false);
  const [selectAssociatePurposeFilter, setSelectAssociatePurposeFilter] = useState('');
  const [selectAssociateLoanFilter, setSelectAssociateLoanFilter] = useState('');
  const [selectAssociateBalanceFilter, setSelectAssociateBalanceFilter] = useState('');
  const [selectAssociateStatusFilter, setSelectAssociateStatusFilter] = useState('');
  const [selectPurposeAssociateFilter, setSelectPurposeAssociateFilter] = useState('');
  const [selectPurposeLoanFilter, setSelectPurposeLoanFilter] = useState('');
  const [selectPurposeBalanceFilter, setSelectPurposeBalanceFilter] = useState('');
  const [selectPurposeStatusFilter, setSelectPurposeStatusFilter] = useState('');
  const [associateTableSearch, setAssociateTableSearch] = useState('');
  const [purposeTableSearch, setPurposeTableSearch] = useState('');
  const associateFilterRowRef = useRef(null);
  const purposeFilterRowRef = useRef(null);
  const associateFilterNudgeUsedRef = useRef(false);
  const purposeFilterNudgeUsedRef = useRef(false);
  const associateFilterChipsScrollRef = useRef(null);
  const associateIsFilterChipsDragging = useRef(false);
  const associateFilterChipsDragStart = useRef({ x: 0, scrollLeft: 0 });
  const purposeFilterChipsScrollRef = useRef(null);
  const purposeIsFilterChipsDragging = useRef(false);
  const purposeFilterChipsDragStart = useRef({ x: 0, scrollLeft: 0 });

  const getPurposeName = (id) => {
    const purpose = purposeOptions.find(p => String(p.id) === String(id));
    return purpose ? purpose.value : "";
  };

  const getAssociateName = (id) => {
    // search in vendorOptions, contractorOptions, employeeOptions, and labourOptions combined
    const assoc = [...vendorOptions, ...contractorOptions, ...employeeOptions, ...labourOptions].find(a => String(a.id) === String(id));
    return assoc ? assoc.value : "";
  };

  const matchesSummaryAssociate = (item, associateId) => {
    if (!associateId) return true;
    const assocId = item.vendor_id || item.contractor_id || item.employee_id || item.labour_id;
    return String(assocId) === String(associateId);
  };

  const matchesSummaryPurpose = (item, purposeId) => {
    if (!purposeId) return true;
    const pid = item.loan_purpose_id || item.from_purpose_id;
    return String(pid) === String(purposeId);
  };

  const resolveLoanAssociateName = (item) =>
    getAssociateName(item.vendor_id || item.contractor_id || item.employee_id || item.labour_id);

  const resolveLoanPurposeName = (item) =>
    getPurposeName(item.loan_purpose_id || item.from_purpose_id);

  const getLoanTooltipDetails = (associateId, purposeId) => {
    if (!loanData.length) return [];
    return loanData.filter((item) =>
      matchesSummaryAssociate(item, associateId) &&
      matchesSummaryPurpose(item, purposeId) &&
      (item.type === 'Loan' || item.type === 'Transfer'),
    ).map((item) => ({
      date: new Date(item.date).toLocaleDateString('en-GB'),
      amount: parseFloat(item.amount) || 0,
      type: item.type,
      associateName: resolveLoanAssociateName(item),
      purposeName: resolveLoanPurposeName(item),
      transferPurposeName: item.type === 'Transfer' && item.to_purpose_id
        ? getPurposeName(item.to_purpose_id)
        : null,
      isRefund: false,
    }));
  };

  const getBalanceTooltipDetails = (associateId, purposeId) => {
    if (!loanData.length) return [];
    return loanData.filter((item) =>
      matchesSummaryAssociate(item, associateId) &&
      matchesSummaryPurpose(item, purposeId) &&
      ((item.type === 'Loan' || item.type === 'Transfer') || item.type === 'Refund'),
    ).map((item) => {
      if (item.type === 'Refund') {
        return {
          date: new Date(item.date).toLocaleDateString('en-GB'),
          amount: -(parseFloat(item.loan_refund_amount) || 0),
          type: item.type,
          associateName: resolveLoanAssociateName(item),
          purposeName: resolveLoanPurposeName(item),
          isRefund: true,
        };
      }
      return {
        date: new Date(item.date).toLocaleDateString('en-GB'),
        amount: parseFloat(item.amount) || 0,
        type: item.type,
        associateName: resolveLoanAssociateName(item),
        purposeName: resolveLoanPurposeName(item),
        transferPurposeName: item.type === 'Transfer' && item.to_purpose_id
          ? getPurposeName(item.to_purpose_id)
          : null,
        isRefund: false,
      };
    });
  };
  
  useEffect(() => {
    setCombinedOptions([...vendorOptions, ...contractorOptions, ...employeeOptions, ...labourOptions]);
  }, [vendorOptions, contractorOptions, employeeOptions, labourOptions]);
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setProgress(10);
        const res = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (!res.ok) throw new Error("Failed to fetch vendors");
        const data = await res.json();
        setVendorOptions(
          data.map((item) => ({
            id: item.id,
            value: item.vendorName,
            label: item.vendorName,
            type: "Vendor",
          }))
        );
        setProgress(25);
      } catch (error) {
        console.error(error);
        setError("Failed to load vendor data");
      }
    };
    fetchVendors();
  }, []);
  useEffect(() => {
    const fetchContractors = async () => {
      try {
        setProgress(35);
        const res = await fetch("https://backendaab.in/aabuilderDash/api/contractor_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (!res.ok) throw new Error("Failed to fetch contractors");
        const data = await res.json();
        setContractorOptions(
          data.map((item) => ({
            id: item.id,
            value: item.contractorName,
            label: item.contractorName,
            type: "Contractor",
          }))
        );
        setProgress(45);
      } catch (error) {
        console.error(error);
        setError("Failed to load contractor data");
      }
    };
    fetchContractors();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setProgress(50);
        const response = await fetch("https://backendaab.in/aabuildersDash/api/employee_details/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
          throw new Error("Network response was not ok: " + response.statusText);
        }
        const data = await response.json();
        const formattedData = data.map(item => ({
          id: item.id,
          value: item.employee_name,
          label: item.employee_name,
          type: "Employee",
        }));
        setEmployeeOptions(formattedData);
        setProgress(60);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchLabours = async () => {
      try {
        setProgress(65);
        const response = await fetch("https://backendaab.in/aabuildersDash/api/labours-details/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
          throw new Error("Network response was not ok: " + response.statusText);
        }
        const data = await response.json();
        const formattedData = data.map(item => ({
          id: item.id,
          value: item.labour_name,
          label: item.labour_name,
          type: "Labour",
        }));
        setLabourOptions(formattedData);
        setProgress(70);
      } catch (error) {
        console.error("Fetch error: ", error);
      }
    };
    fetchLabours();
  }, []);

  useEffect(() => {
    const fetchPurposeOptions = async () => {
      try {
        setProgress(75);
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
          id: item.id,
          value: item.purpose,
          label: item.purpose,
          type: 'Purpose'
        }));
        setPurposeOptions(formattedData);
        setProgress(80);
      } catch (error) {
        console.error("Error fetching purpose options: ", error);
        setPurposeOptions([]);
      }
    };
    fetchPurposeOptions();
  }, []);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        setProgress(85);
        const res = await fetch("https://backendaab.in/aabuilderDash/api/project_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (!res.ok) throw new Error("Failed to fetch sites");
        const data = await res.json();
        setSiteOptions(
          data.map((item) => ({
            id: item.id,
            value: item.siteName,
            label: item.siteName,
            sNo: item.siteNo,
            type: "Site",
          }))
        );
        setProgress(90);
      } catch (error) {
        console.error(error);
        setError("Failed to load site data");
      }
    };
    fetchSites();
  }, []);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setProgress(90);
        const res = await fetch("https://backendaab.in/aabuildersDash/api/loans/all", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        if (!res.ok) throw new Error("Failed to fetch loans");
        const data = await res.json();
        setLoanData(data);
        setProgress(100);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError("Failed to load loan data");
        setLoading(false);
      }
    };
    fetchLoans();
  }, []);

  useEffect(() => {
    let sum = 0;
    if (!selectedAssociate) {
      loanData.forEach(e => {
        if (e.type === "Loan" || e.type === "Transfer") sum += Number(e.amount) || 0;
        else if (e.type === "Refund") sum -= Number(e.loan_refund_amount) || 0;
      });
      setPendingAdvanceAssociate(sum);
      return;
    }
    loanData.forEach(e => {
      const assocId = e.vendor_id || e.contractor_id || e.employee_id || e.labour_id;
      if (String(assocId) !== String(selectedAssociate.id)) return;
      if (e.type === "Loan" || e.type === "Transfer") sum += Number(e.amount) || 0;
      else if (e.type === "Refund") sum -= Number(e.loan_refund_amount) || 0;
    });
    setPendingAdvanceAssociate(sum);
  }, [selectedAssociate, loanData]);

  useEffect(() => {
    let sum = 0;
    if (!selectedPurpose) {
      loanData.forEach(e => {
        if (e.type === "Loan" || e.type === "Transfer") sum += Number(e.amount) || 0;
        else if (e.type === "Refund") sum -= Number(e.loan_refund_amount) || 0;
      });
      setPendingAdvancePurpose(sum);
      return;
    }
    loanData.forEach(e => {
      const purposeId = e.loan_purpose_id || e.from_purpose_id;
      if (String(purposeId) !== String(selectedPurpose.id)) return;
      if (e.type === "Loan" || e.type === "Transfer") sum += Number(e.amount) || 0;
      else if (e.type === "Refund") sum -= Number(e.loan_refund_amount) || 0;
    });
    setPendingAdvancePurpose(sum);
  }, [selectedPurpose, loanData]);

  // Group data for left and right separately
  const summaryByAssociate = useMemo(() => {
    const map = {};
    loanData.forEach(e => {
      const assocId = e.vendor_id || e.contractor_id || e.employee_id || e.labour_id;
      const purposeId = e.loan_purpose_id || e.from_purpose_id;
      if (!purposeId) return;
      if (selectedAssociate) {
        if (!assocId) return;
      if (String(assocId) !== String(selectedAssociate.id)) return;
      const key = `${assocId}-${purposeId}`;
      if (!map[key]) map[key] = { associateId: assocId, purposeId, pendingLoan: 0, refund: 0 };
      if (e.type === "Loan" || e.type === "Transfer") map[key].pendingLoan += Number(e.amount) || 0;
      else if (e.type === "Refund") map[key].refund += Number(e.loan_refund_amount) || 0;
      } else {
        const key = String(purposeId);
        if (!map[key]) map[key] = { purposeId, pendingLoan: 0, refund: 0 };
        if (e.type === "Loan" || e.type === "Transfer") map[key].pendingLoan += Number(e.amount) || 0;
        else if (e.type === "Refund") map[key].refund += Number(e.loan_refund_amount) || 0;
      }
    });
    Object.values(map).forEach(item => item.status = item.pendingLoan > 0 ? "Pending" : "Cleared");
    return Object.values(map).filter(item => item.pendingLoan !== 0 || item.refund !== 0);
  }, [loanData, selectedAssociate]);

  const summaryByPurpose = useMemo(() => {
    const map = {};
    loanData.forEach(e => {
      const assocId = e.vendor_id || e.contractor_id || e.employee_id || e.labour_id;
      const purposeId = e.loan_purpose_id || e.from_purpose_id;
      if (selectedPurpose) {
      if (!assocId || !purposeId) return;
      if (String(purposeId) !== String(selectedPurpose.id)) return;
      const key = `${purposeId}-${assocId}`;
      if (!map[key]) map[key] = { purposeId, associateId: assocId, pendingLoan: 0, refund: 0 };
      if (e.type === "Loan" || e.type === "Transfer") map[key].pendingLoan += Number(e.amount) || 0;
      else if (e.type === "Refund") map[key].refund += Number(e.loan_refund_amount) || 0;
      } else {
        if (!assocId) return;
        const key = String(assocId);
        if (!map[key]) map[key] = { associateId: assocId, pendingLoan: 0, refund: 0 };
        if (e.type === "Loan" || e.type === "Transfer") map[key].pendingLoan += Number(e.amount) || 0;
        else if (e.type === "Refund") map[key].refund += Number(e.loan_refund_amount) || 0;
      }
    });
    Object.values(map).forEach(item => item.status = item.pendingLoan > 0 ? "Pending" : "Cleared");
    return Object.values(map).filter(item => item.pendingLoan !== 0 || item.refund !== 0);
  }, [loanData, selectedPurpose]);


  const hideTooltip = () => {
    setTooltipData(null);
    setTooltipTitle('');
  };

  const handleLoanMouseEnter = (e, associateId, purposeId, table = 'associate') => {
    const details = getLoanTooltipDetails(associateId, purposeId);
    if (details.length > 0) {
      setTooltipTitle('Loan Details');
      setTooltipData(details);
      setTooltipPos({ x: e.clientX, y: e.clientY });
      setTooltipTable(table);
    }
  };

  const handleBalanceMouseEnter = (e, associateId, purposeId, table = 'associate') => {
    const details = getBalanceTooltipDetails(associateId, purposeId);
    if (details.length > 0) {
      setTooltipTitle('Balance Details');
      setTooltipData(details);
      setTooltipPos({ x: e.clientX, y: e.clientY });
      setTooltipTable(table);
    }
  };

  const buildLoanPopupRow = (item, amount) => ({
      date: new Date(item.date).toLocaleDateString('en-GB'),
    amount,
      type: item.type,
      mode: item.type === "Transfer" ? "" : (item.loan_payment_mode || ""),
      description: item.description || "",
    transferTo: item.type === "Transfer"
      ? (item.to_purpose_id ? getPurposeName(item.to_purpose_id) : (item.transfer_Project_id ? siteOptions.find(s => String(s.id) === String(item.transfer_Project_id))?.value || "" : ""))
      : "",
    associateName: resolveLoanAssociateName(item),
    purposeName: resolveLoanPurposeName(item),
    isRefund: item.type === 'Refund',
  });

  // Click handlers for Associate panel (Left Panel) - Opens popup
  const handleAssociateLoanClick = (associateId, purposeId, purposeName) => {
    const loanDetails = loanData.filter(
      x => matchesSummaryAssociate(x, associateId) &&
        matchesSummaryPurpose(x, purposeId) &&
        (x.type === 'Loan' || x.type === 'Transfer')
    ).map(item => buildLoanPopupRow(item, parseFloat(item.amount) || 0));
    if (loanDetails.length > 0) {
      setAssociatePopupTitle('Loan/Transfer Details');
      setAssociatePopupData(loanDetails);
      const associateName = selectedAssociate ? selectedAssociate.label : "All Associates";
      setAssociatePopupContext(`${associateName} - ${purposeName}`);
      setShowAssociatePopup(true);
    }
  };

  const handleAssociateBalanceClick = (associateId, purposeId, purposeName) => {
    // Get all transactions (loans, transfers, and refunds) that affect the balance
    const allTransactions = loanData.filter(
      x => matchesSummaryAssociate(x, associateId) &&
        matchesSummaryPurpose(x, purposeId) &&
        ((x.type === 'Loan' || x.type === 'Transfer') || x.type === "Refund")
    ).map(item => {
      if (item.type === "Refund") {
        return buildLoanPopupRow(item, -(parseFloat(item.loan_refund_amount) || 0));
      }
      return buildLoanPopupRow(item, parseFloat(item.amount) || 0);
    });
    if (allTransactions.length > 0) {
      setAssociatePopupTitle('Balance Details');
      setAssociatePopupData(allTransactions);
      const associateName = selectedAssociate ? selectedAssociate.label : "All Associates";
      setAssociatePopupContext(`${associateName} - ${purposeName}`);
      setShowAssociatePopup(true);
    }
  };

  const handleAssociateStatusClick = (associateId, purposeId, purposeName) => {
    const loanDetails = loanData.filter(
      x => matchesSummaryAssociate(x, associateId) &&
        matchesSummaryPurpose(x, purposeId) &&
        (x.type === 'Loan' || x.type === 'Transfer')
    ).map(item => buildLoanPopupRow(item, parseFloat(item.amount) || 0));
    const refundDetails = loanData.filter(
      x => matchesSummaryAssociate(x, associateId) &&
        matchesSummaryPurpose(x, purposeId) &&
        x.type === "Refund"
    ).map(item => buildLoanPopupRow(item, parseFloat(item.loan_refund_amount) || 0));
    setStatusPopupData({ loans: loanDetails, refunds: refundDetails });
    const associateName = selectedAssociate ? selectedAssociate.label : "All Associates";
    setStatusPopupContext(`${associateName} - ${purposeName}`);
    setIsStatusFromAssociatePanel(true);
    setShowStatusPopup(true);
  };

  // Click handlers for Purpose panel (Right Panel) - Opens popup
  const handlePurposeLoanClick = (associateId, purposeId, associateName) => {
    const loanDetails = loanData.filter(
      x => matchesSummaryAssociate(x, associateId) &&
        matchesSummaryPurpose(x, purposeId) &&
        (x.type === 'Loan' || x.type === 'Transfer')
    ).map(item => buildLoanPopupRow(item, parseFloat(item.amount) || 0));
    if (loanDetails.length > 0) {
      setPurposePopupTitle('Loan/Transfer Details');
      setPurposePopupData(loanDetails);
      const purposeName = selectedPurpose ? selectedPurpose.label : "All Purposes";
      setPurposePopupContext(`${purposeName} - ${associateName}`);
      setShowPurposePopup(true);
    }
  };

  const handlePurposeBalanceClick = (associateId, purposeId, associateName) => {
    // Get all transactions (loans, transfers, and refunds) that affect the balance
    const allTransactions = loanData.filter(
      x => matchesSummaryAssociate(x, associateId) &&
        matchesSummaryPurpose(x, purposeId) &&
        ((x.type === 'Loan' || x.type === 'Transfer') || x.type === "Refund")
    ).map(item => {
      if (item.type === "Refund") {
        return buildLoanPopupRow(item, -(parseFloat(item.loan_refund_amount) || 0));
      }
      return buildLoanPopupRow(item, parseFloat(item.amount) || 0);
    });
    if (allTransactions.length > 0) {
      setPurposePopupTitle('Balance Details');
      setPurposePopupData(allTransactions);
      const purposeName = selectedPurpose ? selectedPurpose.label : "All Purposes";
      setPurposePopupContext(`${purposeName} - ${associateName}`);
      setShowPurposePopup(true);
    }
  };

  const handlePurposeStatusClick = (associateId, purposeId, associateName) => {
    const loanDetails = loanData.filter(
      x => matchesSummaryAssociate(x, associateId) &&
        matchesSummaryPurpose(x, purposeId) &&
        (x.type === 'Loan' || x.type === 'Transfer')
    ).map(item => buildLoanPopupRow(item, parseFloat(item.amount) || 0));
    const refundDetails = loanData.filter(
      x => matchesSummaryAssociate(x, associateId) &&
        matchesSummaryPurpose(x, purposeId) &&
        x.type === "Refund"
    ).map(item => buildLoanPopupRow(item, parseFloat(item.loan_refund_amount) || 0));
    setStatusPopupData({ loans: loanDetails, refunds: refundDetails });
    const purposeName = selectedPurpose ? selectedPurpose.label : "All Purposes";
    setStatusPopupContext(`${purposeName} - ${associateName}`);
    setIsStatusFromAssociatePanel(false);
    setShowStatusPopup(true);
  };

  // Export functions for Associate panel (Left Panel)
  const exportAssociatePDF = () => {
    const doc = new jsPDF();
    if (!sortedSummaryByAssociate.length) {
      alert("No data to export.");
      return;
    }
    if (selectedAssociate) {
      const { type, label } = selectedAssociate;
      const titleText = `${type} - ${label}`;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(titleText, 14, 15);
    }
    const tableColumn = ["Purpose", "Loan", "Balance", "Status"];
    const tableRows = [];
    sortedSummaryByAssociate.forEach(item => {
      tableRows.push([
        getPurposeName(item.purposeId),
        item.pendingLoan.toLocaleString("en-IN"),
        (item.pendingLoan - item.refund).toLocaleString("en-IN"),
        item.status
      ]);
    });
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      startY: selectedAssociate ? 20 : 10,
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        lineWidth: 0.2,
        lineColor: [100, 100, 100],
        fontStyle: "bold"
      },
      styles: {
        textColor: 0,
        lineWidth: 0.2,
        lineColor: [100, 100, 100]
      },
      columnStyles: {
        1: { halign: 'right' }, // Pending Loan
        2: { halign: 'right' }  // Balance
      }
    });
    doc.save("LoanSummary_Associate.pdf");
  };

  const exportAssociateCSV = () => {
    if (!sortedSummaryByAssociate.length) {
      alert("No data to export.");
      return;
    }
    let extraRow = [];
    if (selectedAssociate) {
      const { type, label } = selectedAssociate;
      extraRow = [[`${type} - ${label}`]];
    }
    const headers = ["Purpose", "Loan", "Balance", "Status"];
    const rows = sortedSummaryByAssociate.map(item => [
      getPurposeName(item.purposeId),
      item.pendingLoan,
      item.pendingLoan - item.refund,
      item.status
    ]);
    let csvContent = "data:text/csv;charset=utf-8,"
      + [...extraRow, headers, ...rows]
        .map(e => e.join(","))
        .join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "LoanSummary_Associate.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export functions for Purpose panel (Right Panel)
  const exportPurposePDF = () => {
    const doc = new jsPDF();
    if (!sortedSummaryByPurpose.length) {
      alert("No data to export.");
      return;
    }
    if (selectedPurpose) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Purpose - ${selectedPurpose.label}`, 14, 15);
    } else {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("All Purposes - Associate Summary", 14, 15);
    }
    const tableColumn = ["Associate", "Loan", "Balance", "Status"];
    const tableRows = [];
    sortedSummaryByPurpose.forEach(item => {
      tableRows.push([
        getAssociateName(item.associateId),
        item.pendingLoan.toLocaleString("en-IN"),
        (item.pendingLoan - item.refund).toLocaleString("en-IN"),
        item.status
      ]);
    });
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      startY: 20,
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        lineWidth: 0.2,
        lineColor: [100, 100, 100],
        fontStyle: "bold"
      },
      styles: {
        textColor: 0,
        lineWidth: 0.2,
        lineColor: [100, 100, 100]
      },
      columnStyles: {
        1: { halign: 'right' }, // Pending Loan
        2: { halign: 'right' }  // Balance
      }
    });
    const fileName = selectedPurpose ? "LoanSummary_Purpose.pdf" : "LoanSummary_AllPurposes.pdf";
    doc.save(fileName);
  };

  const exportPurposeCSV = () => {
    if (!sortedSummaryByPurpose.length) {
      alert("No data to export.");
      return;
    }
    let extraRow = [];
    if (selectedPurpose) {
      extraRow = [[`Purpose - ${selectedPurpose.label}`]];
    } else {
      extraRow = [["All Purposes - Associate Summary"]];
    }
    const headers = ["Associate", "Loan", "Balance", "Status"];
    const rows = sortedSummaryByPurpose.map(item => [
      getAssociateName(item.associateId),
      item.pendingLoan,
      item.pendingLoan - item.refund,
      item.status
    ]);
    let csvContent = "data:text/csv;charset=utf-8,"
      + [...extraRow, headers, ...rows]
        .map(e => e.join(","))
        .join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    const fileName = selectedPurpose ? "LoanSummary_Purpose.csv" : "LoanSummary_AllPurposes.csv";
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Popup sorting handlers
  const handleAssociatePopupSort = (key) => {
    let resolvedKey = key;
    if (key === 'vendor') {
      resolvedKey = selectedAssociate ? 'transferTo' : 'associateName';
    }
    let direction = 'asc';
    if (associatePopupSortConfig.key === resolvedKey && associatePopupSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setAssociatePopupSortConfig({ key: resolvedKey, direction });
  };

  const handlePurposePopupSort = (key) => {
    let resolvedKey = key;
    if (key === 'vendor') {
      resolvedKey = selectedPurpose ? 'transferTo' : 'purposeName';
    }
    let direction = 'asc';
    if (purposePopupSortConfig.key === resolvedKey && purposePopupSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setPurposePopupSortConfig({ key: resolvedKey, direction });
  };

  const handleStatusPopupSort = (key) => {
    let direction = 'asc';
    if (statusPopupSortConfig.key === key && statusPopupSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setStatusPopupSortConfig({ key, direction });
  };

  // Sort popup data
  const sortPopupData = (data, config) => {
    if (!data || data.length === 0) return [];
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`);
    };
    if (!config.key) {
      return [...data].sort((a, b) => {
        const aDate = parseDate(a.date);
        const bDate = parseDate(b.date);
        return bDate - aDate;
      });
    }
    return [...data].sort((a, b) => {
      let aValue = a[config.key];
      let bValue = b[config.key];
      if (config.key === 'date') {
        aValue = parseDate(aValue);
        bValue = parseDate(bValue);
        return config.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return config.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();
      if (aValue < bValue) return config.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return config.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Export Popup PDF
  const exportPopupPDF = (data, title, context) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(context, 14, 15);
    doc.setFontSize(10);
    doc.text(title, 14, 22);
    const tableColumn = ["Date", "Transfer", "Amount"];
    const tableRows = [];
    data.forEach(item => {
      let transferInfo = '-';
      if (item.transferTo) {
        transferInfo = `${item.amount < 0 ? 'Transfer To: ' : 'Transfer From: '}${item.transferTo}`;
      } else if (item.type === 'Refund') {
        transferInfo = 'Refund';
      }
      tableRows.push([
        item.date,
        transferInfo,
        item.amount.toLocaleString("en-IN"),
      ]);
    });
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    const totalRow = ["Total", "", total.toLocaleString("en-IN")];
    tableRows.push(totalRow);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255],
        lineWidth: 0.2,
        lineColor: [100, 100, 100],
        fontStyle: "bold"
      },
      styles: {
        textColor: 0,
        lineWidth: 0.2,
        lineColor: [100, 100, 100]
      },
      columnStyles: {
        2: { halign: 'right' }
      },
      didParseCell: function (data) {
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [255, 255, 255];
        }
      }
    });
    const fileName = `${context.replace(/[^a-z0-9]/gi, '_')}_${title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    doc.save(fileName);
  };

  // Export Popup CSV
  const exportPopupCSV = (data, title, context) => {
    const extraRow = [[context], [title], []];
    const headers = ["Date", "Transfer", "Amount"];
    const rows = data.map(item => {
      let transferInfo = '-';
      if (item.transferTo) {
        transferInfo = `${item.amount < 0 ? 'Transfer To: ' : 'Transfer From: '}${item.transferTo}`;
      } else if (item.type === 'Refund') {
        transferInfo = 'Refund';
      }
      return [
        item.date,
        transferInfo,
        item.amount,
      ];
    });
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    rows.push(["Total", "", total]);
    let csvContent = "data:text/csv;charset=utf-8,"
      + [...extraRow, headers, ...rows]
        .map(e => e.join(","))
        .join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    const fileName = `${context.replace(/[^a-z0-9]/gi, '_')}_${title.replace(/[^a-z0-9]/gi, '_')}.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Status Popup PDF
  const exportStatusPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(statusPopupContext, 14, 15);
    doc.setFontSize(10);
    doc.text("Status Details", 14, 22);
    const tableColumn = ["Date", "Loan Amount", "Refund Amount", "Type", "Mode", "Description"];
    const combinedData = [];
    const dateMap = new Map();
    statusPopupData.loans.forEach(loan => {
      const key = `${loan.date}`;
      dateMap.set(key, {
        date: loan.date,
        loanAmount: loan.amount,
        refundAmount: 0,
        type: loan.type,
        mode: loan.mode,
        description: loan.description,
      });
    });
    statusPopupData.refunds.forEach(refund => {
      const key = `${refund.date}`;
      if (dateMap.has(key)) {
        dateMap.get(key).refundAmount = refund.amount;
      } else {
        dateMap.set(key, {
          date: refund.date,
          loanAmount: 0,
          refundAmount: refund.amount,
          type: refund.type,
          mode: refund.mode,
          description: refund.description,
        });
      }
    });
    combinedData.push(...Array.from(dateMap.values()));
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`);
    };
    if (!statusPopupSortConfig.key) {
      combinedData.sort((a, b) => parseDate(b.date) - parseDate(a.date));
    } else {
      combinedData.sort((a, b) => {
        let aValue = a[statusPopupSortConfig.key];
        let bValue = b[statusPopupSortConfig.key];
        if (statusPopupSortConfig.key === 'date') {
          aValue = parseDate(aValue);
          bValue = parseDate(bValue);
          return statusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return statusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
        if (aValue < bValue) return statusPopupSortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return statusPopupSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    const tableRows = combinedData.map(entry => [
      entry.date,
      entry.loanAmount !== 0 ? entry.loanAmount.toLocaleString("en-IN") : "-",
      entry.refundAmount !== 0 ? entry.refundAmount.toLocaleString("en-IN") : "-",
      entry.type,
      entry.mode || "-",
      entry.description || "-",
    ]);
    const totalLoan = statusPopupData.loans.reduce((sum, item) => sum + item.amount, 0);
    const totalRefund = statusPopupData.refunds.reduce((sum, item) => sum + item.amount, 0);
    const balance = totalLoan - totalRefund;
    tableRows.push(["Total", totalLoan.toLocaleString("en-IN"), totalRefund.toLocaleString("en-IN"), "", "", ""]);
    tableRows.push(["Balance", "", balance.toLocaleString("en-IN"), "", "", ""]);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255],
        lineWidth: 0.2,
        lineColor: [100, 100, 100],
        fontStyle: "bold"
      },
      styles: {
        textColor: 0,
        lineWidth: 0.2,
        lineColor: [100, 100, 100]
      },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' }
      },
      didParseCell: function (data) {
        if (data.row.index === tableRows.length - 2 || data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          if (data.row.index === tableRows.length - 1) {
            data.cell.styles.fillColor = [191, 152, 83];
            data.cell.styles.textColor = [255, 255, 255];
          }
        }
      }
    });
    const fileName = `${statusPopupContext.replace(/[^a-z0-9]/gi, '_')}_Status.pdf`;
    doc.save(fileName);
  };

  // Export Status Popup CSV
  const exportStatusCSV = () => {
    const extraRow = [[statusPopupContext], ["Status Details"], []];
    const headers = ["Date", "Loan Amount", "Refund Amount", "Type", "Mode", "Description"];
    const combinedData = [];
    const dateMap = new Map();
    statusPopupData.loans.forEach(loan => {
      const key = `${loan.date}`;
      dateMap.set(key, {
        date: loan.date,
        loanAmount: loan.amount,
        refundAmount: 0,
        type: loan.type,
        mode: loan.mode,
        description: loan.description,
      });
    });
    statusPopupData.refunds.forEach(refund => {
      const key = `${refund.date}`;
      if (dateMap.has(key)) {
        dateMap.get(key).refundAmount = refund.amount;
      } else {
        dateMap.set(key, {
          date: refund.date,
          loanAmount: 0,
          refundAmount: refund.amount,
          type: refund.type,
          mode: refund.mode,
          description: refund.description,
        });
      }
    });
    combinedData.push(...Array.from(dateMap.values()));
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`);
    };
    if (!statusPopupSortConfig.key) {
      combinedData.sort((a, b) => parseDate(b.date) - parseDate(a.date));
    } else {
      combinedData.sort((a, b) => {
        let aValue = a[statusPopupSortConfig.key];
        let bValue = b[statusPopupSortConfig.key];
        if (statusPopupSortConfig.key === 'date') {
          aValue = parseDate(aValue);
          bValue = parseDate(bValue);
          return statusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return statusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
        if (aValue < bValue) return statusPopupSortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return statusPopupSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    const rows = combinedData.map(entry => [
      entry.date,
      entry.loanAmount !== 0 ? entry.loanAmount : "-",
      entry.refundAmount !== 0 ? entry.refundAmount : "-",
      entry.type,
      entry.mode || "-",
      entry.description || "-",
    ]);
    const totalLoan = statusPopupData.loans.reduce((sum, item) => sum + item.amount, 0);
    const totalRefund = statusPopupData.refunds.reduce((sum, item) => sum + item.amount, 0);
    const balance = totalLoan - totalRefund;
    rows.push(["Total", totalLoan, totalRefund, "", "", ""]);
    rows.push(["Balance", "", balance, "", "", ""]);
    let csvContent = "data:text/csv;charset=utf-8,"
      + [...extraRow, headers, ...rows]
        .map(e => e.join(","))
        .join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    const fileName = `${statusPopupContext.replace(/[^a-z0-9]/gi, '_')}_Status.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handlePurposeSort = (key) => {
    let direction = 'asc';
    if (purposeSortConfig.key === key && purposeSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setPurposeSortConfig({ key, direction });
  };

  const sortData = (data, config, statusKey = 'pendingLoan', nameKey = 'purposeId') => {
    if (!config.key) {
      return [...data].sort((a, b) => {
        const aStatus = a[statusKey] > 0 ? 1 : 0;
        const bStatus = b[statusKey] > 0 ? 1 : 0;
        if (aStatus !== bStatus) return bStatus - aStatus;
        const aName = (a[nameKey] || '').toString();
        const bName = (b[nameKey] || '').toString();
        if (aName < bName) return -1;
        if (aName > bName) return 1;
        return 0;
      });
    }
    return [...data].sort((a, b) => {
      let aValue = a[config.key];
      let bValue = b[config.key];
      if (config.key === 'balance') {
        aValue = a.pendingLoan - a.refund;
        bValue = b.pendingLoan - b.refund;
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return config.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();
      if (aValue < bValue) {
        return config.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return config.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const handleAssociateEdbcSort = (field) => {
    if (field === 'vendor') handleSort('purposeId');
    else if (field === 'amount') handleSort('pendingLoan');
    else if (field === 'paymentMode') handleSort('status');
  };

  const handlePurposePanelEdbcSort = (field) => {
    if (field === 'siteName') handlePurposeSort('associateId');
    else if (field === 'amount') handlePurposeSort('pendingLoan');
    else if (field === 'paymentMode') handlePurposeSort('status');
  };

  const statusFilterOptions = useMemo(
    () => [{ value: 'Pending', label: 'Pending' }, { value: 'Cleared', label: 'Cleared' }],
    [],
  );

  const filteredSummaryByAssociate = useMemo(() => {
    return summaryByAssociate.filter((item) => {
      const purposeName = getPurposeName(item.purposeId);
      if (selectAssociatePurposeFilter && purposeName !== selectAssociatePurposeFilter) return false;
      if (!matchesEdbcAmountFilter(item.pendingLoan, selectAssociateLoanFilter)) return false;
      const balance = item.pendingLoan - item.refund;
      if (!matchesEdbcAmountFilter(balance, selectAssociateBalanceFilter)) return false;
      if (selectAssociateStatusFilter && item.status !== selectAssociateStatusFilter) return false;
      if (!associateTableSearch.trim()) return true;
      const q = associateTableSearch.toLowerCase().trim();
      return [purposeName, item.pendingLoan, balance, item.status].some((val) =>
        String(val ?? '').toLowerCase().includes(q),
      );
    });
  }, [
    summaryByAssociate,
    purposeOptions,
    selectAssociatePurposeFilter,
    selectAssociateLoanFilter,
    selectAssociateBalanceFilter,
    selectAssociateStatusFilter,
    associateTableSearch,
  ]);

  const filteredSummaryByPurpose = useMemo(() => {
    return summaryByPurpose.filter((item) => {
      const associateName = getAssociateName(item.associateId);
      if (selectPurposeAssociateFilter && associateName !== selectPurposeAssociateFilter) return false;
      if (!matchesEdbcAmountFilter(item.pendingLoan, selectPurposeLoanFilter)) return false;
      const balance = item.pendingLoan - item.refund;
      if (!matchesEdbcAmountFilter(balance, selectPurposeBalanceFilter)) return false;
      if (selectPurposeStatusFilter && item.status !== selectPurposeStatusFilter) return false;
      if (!purposeTableSearch.trim()) return true;
      const q = purposeTableSearch.toLowerCase().trim();
      return [associateName, item.pendingLoan, balance, item.status].some((val) =>
        String(val ?? '').toLowerCase().includes(q),
      );
    });
  }, [
    summaryByPurpose,
    vendorOptions,
    contractorOptions,
    employeeOptions,
    labourOptions,
    selectPurposeAssociateFilter,
    selectPurposeLoanFilter,
    selectPurposeBalanceFilter,
    selectPurposeStatusFilter,
    purposeTableSearch,
  ]);

  const associatePurposeFilterOptions = useMemo(
    () => [...new Set(summaryByAssociate.map((item) => getPurposeName(item.purposeId)).filter(Boolean))]
      .sort()
      .map((name) => ({ value: name, label: name })),
    [summaryByAssociate, purposeOptions],
  );

  const purposeAssociateFilterOptions = useMemo(
    () => [...new Set(summaryByPurpose.map((item) => getAssociateName(item.associateId)).filter(Boolean))]
      .sort()
      .map((name) => ({ value: name, label: name })),
    [summaryByPurpose, vendorOptions, contractorOptions, employeeOptions, labourOptions],
  );

  const associateTableTotals = useMemo(() => ({
    loan: summaryByAssociate.reduce((sum, row) => sum + (Number(row.pendingLoan) || 0), 0),
    balance: summaryByAssociate.reduce((sum, row) => sum + ((Number(row.pendingLoan) || 0) - (Number(row.refund) || 0)), 0),
  }), [summaryByAssociate]);

  const purposeTableTotals = useMemo(() => ({
    loan: summaryByPurpose.reduce((sum, row) => sum + (Number(row.pendingLoan) || 0), 0),
    balance: summaryByPurpose.reduce((sum, row) => sum + ((Number(row.pendingLoan) || 0) - (Number(row.refund) || 0)), 0),
  }), [summaryByPurpose]);

  const hasAssociateColumnFilters = Boolean(
    selectAssociatePurposeFilter ||
    selectAssociateLoanFilter.trim() ||
    selectAssociateBalanceFilter.trim() ||
    selectAssociateStatusFilter,
  );

  const hasPurposeColumnFilters = Boolean(
    selectPurposeAssociateFilter ||
    selectPurposeLoanFilter.trim() ||
    selectPurposeBalanceFilter.trim() ||
    selectPurposeStatusFilter,
  );

  const clearAssociateTableFilters = useCallback(() => {
    setAssociateTableSearch('');
    setSelectAssociatePurposeFilter('');
    setSelectAssociateLoanFilter('');
    setSelectAssociateBalanceFilter('');
    setSelectAssociateStatusFilter('');
    setSortConfig({ key: null, direction: 'asc' });
  }, []);

  const clearPurposeTableFilters = useCallback(() => {
    setPurposeTableSearch('');
    setSelectPurposeAssociateFilter('');
    setSelectPurposeLoanFilter('');
    setSelectPurposeBalanceFilter('');
    setSelectPurposeStatusFilter('');
    setPurposeSortConfig({ key: null, direction: 'asc' });
  }, []);

  const handleAssociateFilterChipsMouseDown = (e) => {
    if (!associateFilterChipsScrollRef.current || e.target.closest('button')) return;
    associateIsFilterChipsDragging.current = true;
    associateFilterChipsDragStart.current = {
      x: e.clientX,
      scrollLeft: associateFilterChipsScrollRef.current.scrollLeft,
    };
    associateFilterChipsScrollRef.current.style.cursor = 'grabbing';
    associateFilterChipsScrollRef.current.style.userSelect = 'none';
  };
  const handleAssociateFilterChipsMouseMove = (e) => {
    if (!associateIsFilterChipsDragging.current || !associateFilterChipsScrollRef.current) return;
    e.preventDefault();
    const dx = e.clientX - associateFilterChipsDragStart.current.x;
    associateFilterChipsScrollRef.current.scrollLeft =
      associateFilterChipsDragStart.current.scrollLeft - dx;
  };
  const handleAssociateFilterChipsMouseUp = () => {
    if (!associateFilterChipsScrollRef.current) return;
    associateIsFilterChipsDragging.current = false;
    associateFilterChipsScrollRef.current.style.cursor = 'grab';
    associateFilterChipsScrollRef.current.style.userSelect = '';
  };

  const handlePurposeFilterChipsMouseDown = (e) => {
    if (!purposeFilterChipsScrollRef.current || e.target.closest('button')) return;
    purposeIsFilterChipsDragging.current = true;
    purposeFilterChipsDragStart.current = {
      x: e.clientX,
      scrollLeft: purposeFilterChipsScrollRef.current.scrollLeft,
    };
    purposeFilterChipsScrollRef.current.style.cursor = 'grabbing';
    purposeFilterChipsScrollRef.current.style.userSelect = 'none';
  };
  const handlePurposeFilterChipsMouseMove = (e) => {
    if (!purposeIsFilterChipsDragging.current || !purposeFilterChipsScrollRef.current) return;
    e.preventDefault();
    const dx = e.clientX - purposeFilterChipsDragStart.current.x;
    purposeFilterChipsScrollRef.current.scrollLeft =
      purposeFilterChipsDragStart.current.scrollLeft - dx;
  };
  const handlePurposeFilterChipsMouseUp = () => {
    if (!purposeFilterChipsScrollRef.current) return;
    purposeIsFilterChipsDragging.current = false;
    purposeFilterChipsScrollRef.current.style.cursor = 'grab';
    purposeFilterChipsScrollRef.current.style.userSelect = '';
  };

  const toggleAssociateFilters = useCallback(() => {
    const willOpen = !showAssociateFilters;
    const scroller = associateScrollRef.current;
    if (willOpen) {
      setShowAssociateFilters(true);
      if (!scroller || scroller.scrollTop <= 0 || associateFilterNudgeUsedRef.current) return;
      associateFilterNudgeUsedRef.current = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const h = associateFilterRowRef.current?.offsetHeight || 0;
          if (h > 0) scroller.scrollTop = Math.max(0, scroller.scrollTop - h);
        });
      });
      return;
    }
    setShowAssociateFilters(false);
  }, [showAssociateFilters, associateScrollRef]);

  const togglePurposeTableFilters = useCallback(() => {
    const willOpen = !showPurposeTableFilters;
    const scroller = purposeScrollRef.current;
    if (willOpen) {
      setShowPurposeTableFilters(true);
      if (!scroller || scroller.scrollTop <= 0 || purposeFilterNudgeUsedRef.current) return;
      purposeFilterNudgeUsedRef.current = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const h = purposeFilterRowRef.current?.offsetHeight || 0;
          if (h > 0) scroller.scrollTop = Math.max(0, scroller.scrollTop - h);
        });
      });
      return;
    }
    setShowPurposeTableFilters(false);
  }, [showPurposeTableFilters, purposeScrollRef]);

  const associatePopupEdbcSortField =
    associatePopupSortConfig.key === 'transferTo' || associatePopupSortConfig.key === 'associateName'
      ? 'vendor'
      : associatePopupSortConfig.key;
  const purposePopupEdbcSortField =
    purposePopupSortConfig.key === 'transferTo' || purposePopupSortConfig.key === 'purposeName'
      ? 'vendor'
      : purposePopupSortConfig.key;

  const renderLoanPopupSecondColumn = (entry, isAssociatePanel) => {
    if (isAssociatePanel) {
      if (!selectedAssociate) return entry.associateName || '-';
      if (entry.isRefund || entry.type === 'Refund') return <div className="text-xs text-gray-500">Refund</div>;
      if (entry.type === 'Transfer' && entry.transferTo) {
  return (
          <div className="text-xs text-gray-500">
            {entry.amount < 0 ? 'Transfer To: ' : 'Transfer From: '}
            {entry.transferTo}
          </div>
        );
      }
      return null;
    }
    if (!selectedPurpose) return entry.purposeName || '-';
    if (entry.isRefund || entry.type === 'Refund') return <div className="text-xs text-gray-500">Refund</div>;
    if (entry.type === 'Transfer' && entry.transferTo) {
      return (
        <div className="text-xs text-gray-500">
          {entry.amount < 0 ? 'Transfer To: ' : 'Transfer From: '}
          {entry.transferTo}
        </div>
      );
    }
    return null;
  };

  const sortedSummaryByAssociate = sortData(filteredSummaryByAssociate, sortConfig, 'pendingLoan', 'purposeId');
  const sortedSummaryByPurpose = sortData(filteredSummaryByPurpose, purposeSortConfig, 'pendingLoan', 'associateId');

  return (
    <div className="flex flex-col h-[calc(100vh-104px)] overflow-hidden bg-[#FAF6ED]">
      <div className="p-[18px] flex flex-col flex-1 min-h-0 overflow-hidden bg-[#FAF6ED]">
        <div className="flex flex-col xl:flex-row gap-[18px] flex-1 min-h-0 max-h-full overflow-visible px-[24px] py-[24px] items-stretch bg-white">
          {/* Left Panel: Associate Summary */}
          <div className={`flex flex-col flex-1 w-fit max-w-full min-w-0 min-h-0 max-h-full overflow-hidden bg-white rounded-[6px] ${SUMMARY_PANEL_SHADOW} px-[24px] py-[24px]`}>
            <div className="w-full min-w-0 flex flex-col flex-1 min-h-0 max-h-full">
              <div className={`flex flex-nowrap justify-between items-end gap-[12px] mb-[18px] shrink-0 max-w-full self-start ${LOAN_SUMMARY_LEFT_PANEL_HEADER_WIDTH_CLASS}`}>
                <div className="text-left">
                  <label className="block font-semibold mb-[8px]">Associate</label>
              <Select
                options={combinedOptions}
                value={selectedAssociate}
                onChange={setSelectedAssociate}
                    placeholder="Con/Ven/Emp/Lab"
                    className={SUMMARY_OUTSIDE_SELECT_CLASS}
                isClearable
                menuPortalTarget={document.body}
                    styles={summaryOutsideSelectStyles}
              />
              </div>
                <div className="rounded-md px-4 py-[8px] text-sm shrink-0" style={SUMMARY_BOX_STYLE}>
                  <div className="flex justify-between text-[14px] gap-6 py-0.5">
                    <span className="flex shrink-0 w-[130px] text-black font-semibold">
                      <span className="whitespace-nowrap">Pending Loan</span>
                      <span className="ml-auto">:</span>
                    </span>
                    <span className="font-semibold" style={{ color: '#E4572E' }}>
                      {formatSummaryAmount(pendingAdvanceAssociate)}
                    </span>
            </div>
          </div>
          </div>
              <div className="border border-gray-200 px-[18px] pt-[18px] flex flex-col flex-1 min-h-0 overflow-hidden self-start w-fit max-w-full">
                <div className={`flex min-w-0 ${LOAN_SUMMARY_LEFT_TABLE_TOOLBAR_WIDTH_CLASS} max-w-full flex-nowrap items-center justify-between gap-[6px] mb-[9px] shrink-0 overflow-hidden`}>
                  <div className={`flex min-w-0 items-center overflow-hidden gap-[6px]${hasAssociateColumnFilters ? ' flex-1 min-w-0' : ' shrink-0'}`}>
                    <EdbcFilterToggleButton onClick={toggleAssociateFilters} />
                    {hasAssociateColumnFilters && (
                      <div
                        ref={associateFilterChipsScrollRef}
                        onMouseDown={handleAssociateFilterChipsMouseDown}
                        onMouseMove={handleAssociateFilterChipsMouseMove}
                        onMouseUp={handleAssociateFilterChipsMouseUp}
                        onMouseLeave={handleAssociateFilterChipsMouseUp}
                        className="flex min-w-0 flex-1 overflow-x-auto flex-nowrap gap-2 no-scrollbar scrollbar-none cursor-grab select-none"
                      >
                        {selectAssociatePurposeFilter && (
                          <SummaryFilterChip label="Purpose" value={selectAssociatePurposeFilter} onClear={() => setSelectAssociatePurposeFilter('')} />
                        )}
                        {selectAssociateLoanFilter.trim() && (
                          <SummaryFilterChip label="Loan" value={selectAssociateLoanFilter} onClear={() => setSelectAssociateLoanFilter('')} />
                        )}
                        {selectAssociateBalanceFilter.trim() && (
                          <SummaryFilterChip label="Balance" value={selectAssociateBalanceFilter} onClear={() => setSelectAssociateBalanceFilter('')} />
                        )}
                        {selectAssociateStatusFilter && (
                          <SummaryFilterChip label="Status" value={selectAssociateStatusFilter} onClear={() => setSelectAssociateStatusFilter('')} />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-end gap-[6px] shrink-0">
                    <EdbcTableToolbarRightActions
                      onClearFilters={clearAssociateTableFilters}
                      overallSearch={associateTableSearch}
                      onOverallSearchChange={setAssociateTableSearch}
                      showExportIcons={false}
                      clearButtonType="button"
                      wrapperClassName={null}
                      searchWrapperClassName="h-[34px] min-w-0 flex-1 max-w-[286px] border border-[#D6D6D6] rounded-md bg-white flex items-center px-2 sm:w-[286px] sm:min-w-[286px] sm:flex-none sm:shrink-0"
                    />
                    <SummaryTableExportActions onExportPdf={exportAssociatePDF} onExportCsv={exportAssociateCSV} />
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden pb-[18px] flex flex-col">
                  <div
                    ref={associateTableScroll.scrollRef}
                    className="rounded-lg border-l-8 border-l-[#BF9853] flex-1 min-h-0 w-full min-w-0 max-w-full overflow-y-auto overflow-x-auto no-scrollbar scrollbar-none"
                    onMouseDown={associateTableScroll.handleMouseDown}
                >
            <table className={`${SUMMARY_LEFT_TABLE_CLASS} ${showAssociateFilters ? '[&_thead_tr:first-child_th]:!border-b-0' : ''}`}>
                      <thead className="sticky top-0 z-20 bg-white">
                        <EdbcTableHeaderRow>
                          <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC4}
                            label="Purpose"
                            sortField={sortConfig.key === 'purposeId' ? 'vendor' : null}
                            sortDirection={sortConfig.direction}
                            onSort={handleAssociateEdbcSort}
                          />
                          <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC8}
                            label="Loan"
                            sortField={sortConfig.key === 'pendingLoan' ? 'amount' : null}
                            sortDirection={sortConfig.direction}
                            onSort={handleAssociateEdbcSort}
                          />
                          <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC8}
                            label="Balance"
                            sortField={sortConfig.key === 'balance' ? 'amount' : null}
                            sortDirection={sortConfig.direction}
                            onSort={() => handleSort('balance')}
                          />
                          <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC13}
                            label="Status"
                            sortField={sortConfig.key === 'status' ? 'paymentMode' : null}
                            sortDirection={sortConfig.direction}
                            onSort={handleAssociateEdbcSort}
                          />
                          <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC14}
                            label="Frequency"
                          />
                        </EdbcTableHeaderRow>
                        {showAssociateFilters && (
                          <EdbcTableFilterRow ref={associateFilterRowRef}>
                            <SummaryPurposeNameFilter
                              placeholder="Purpose"
                              options={associatePurposeFilterOptions}
                              value={selectAssociatePurposeFilter}
                              onChange={setSelectAssociatePurposeFilter}
                            />
                            <EdbcTotalAmountFilter
                              columnId={EDBC_IDS.EDBC8}
                              totalAmount={associateTableTotals.loan}
                              value={selectAssociateLoanFilter}
                              onChange={(e) => setSelectAssociateLoanFilter(e.target.value)}
                            />
                            <EdbcTotalAmountFilter
                              columnId={EDBC_IDS.EDBC8}
                              totalAmount={associateTableTotals.balance}
                              value={selectAssociateBalanceFilter}
                              onChange={(e) => setSelectAssociateBalanceFilter(e.target.value)}
                            />
                            <SummaryEdbcSelectFilter
                              columnId={EDBC_IDS.EDBC13}
                              placeholder="Status"
                              options={statusFilterOptions}
                              value={selectAssociateStatusFilter}
                              onChange={setSelectAssociateStatusFilter}
                            />
                            <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC14} />
                          </EdbcTableFilterRow>
                        )}
              </thead>
              <tbody>
                {sortedSummaryByAssociate.length === 0 ? (
                  <tr><td colSpan={5} className="text-center p-6 text-gray-500">No Records Available</td></tr>
                ) : sortedSummaryByAssociate.map((item, i) => (
                          <EdbcTableBodyRow key={i}>
                            <EdbcExpandableBodyCell
                              columnId={EDBC_IDS.EDBC4}
                              expense={{ id: item.purposeId, ...item }}
                              rowIndex={i}
                              expandedCells={associateExpandedCells}
                              onToggleExpanded={toggleAssociateExpandedCell}
                              getDisplayValue={() => getPurposeName(item.purposeId)}
                            />
                            <td
                              id={EDBC_IDS.EDBC8}
                              className={edbc8Config?.tdClass}
                              onMouseEnter={(e) => handleLoanMouseEnter(e, selectedAssociate?.id, item.purposeId, 'associate')}
                      onMouseLeave={hideTooltip}
                            >
                              <span
                                onClick={() => handleAssociateLoanClick(selectedAssociate?.id, item.purposeId, getPurposeName(item.purposeId))}
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  toggleAssociateExpandedCell(`${item.purposeId ?? i}-loan`);
                                }}
                                className={`block w-full cursor-pointer ${associateExpandedCells[`${item.purposeId ?? i}-loan`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                title={formatSummaryAmount(item.pendingLoan)}
                              >
                                {formatSummaryAmount(item.pendingLoan)}
                              </span>
                    </td>
                    <td 
                              className={edbc8Config?.tdClass}
                              onMouseEnter={(e) => handleBalanceMouseEnter(e, selectedAssociate?.id, item.purposeId, 'associate')}
                      onMouseLeave={hideTooltip}
                            >
                              <span
                                onClick={() => handleAssociateBalanceClick(selectedAssociate?.id, item.purposeId, getPurposeName(item.purposeId))}
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  toggleAssociateExpandedCell(`${item.purposeId ?? i}-balance`);
                                }}
                                className={`block w-full cursor-pointer ${associateExpandedCells[`${item.purposeId ?? i}-balance`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                title={formatSummaryAmount(item.pendingLoan - item.refund)}
                              >
                                {formatSummaryAmount(item.pendingLoan - item.refund)}
                              </span>
                    </td>
                            {renderLoanStatusBodyCell({
                              status: item.status,
                              pendingLoan: item.pendingLoan,
                              rowId: item.purposeId,
                              rowIndex: i,
                              expandedCells: associateExpandedCells,
                              onToggleExpanded: toggleAssociateExpandedCell,
                              onClick: () => handleAssociateStatusClick(selectedAssociate?.id, item.purposeId, getPurposeName(item.purposeId)),
                            })}
                            <td id={EDBC_IDS.EDBC14} className={edbc14Config?.tdClass}></td>
                          </EdbcTableBodyRow>
                ))}
              </tbody>
            </table>
                  </div>
                </div>
              </div>
          </div>
        </div>

          {/* Right Panel: Purpose Summary */}
          <div className={`flex flex-col flex-1 w-fit max-w-full min-w-0 min-h-0 max-h-full overflow-hidden bg-white rounded-[6px] ${SUMMARY_PANEL_SHADOW} px-[24px] py-[24px]`}>
            <div className="w-full min-w-0 flex flex-col flex-1 min-h-0 max-h-full">
              <div className={`flex flex-nowrap justify-between items-end gap-[12px] mb-[18px] shrink-0 max-w-full self-start ${LOAN_SUMMARY_RIGHT_PANEL_HEADER_WIDTH_CLASS}`}>
                <div className="text-left">
                  <label className="block font-semibold mb-[8px]">Purpose</label>
              <Select
                options={purposeOptions}
                value={selectedPurpose}
                onChange={setSelectedPurpose}
                    placeholder="Purpose"
                    isSearchable={true}
                    className={SUMMARY_OUTSIDE_SELECT_CLASS}
                isClearable
                menuPortalTarget={document.body}
                    styles={summaryOutsideSelectStyles}
              />
              </div>
                <div className="rounded-md px-4 py-[8px] text-sm shrink-0" style={SUMMARY_BOX_STYLE}>
                  <div className="flex justify-between text-[14px] gap-6 py-0.5">
                    <span className="flex shrink-0 w-[130px] text-black font-semibold">
                      <span className="whitespace-nowrap">Pending Loan</span>
                      <span className="ml-auto">:</span>
                    </span>
                    <span className="font-semibold" style={{ color: '#E4572E' }}>
                      {formatSummaryAmount(pendingAdvancePurpose)}
                    </span>
            </div>
          </div>
          </div>
              <div className="border border-gray-200 px-[18px] pt-[18px] flex flex-col flex-1 min-h-0 overflow-hidden self-start w-fit max-w-full">
                <div className={`flex min-w-0 ${LOAN_SUMMARY_RIGHT_TABLE_TOOLBAR_WIDTH_CLASS} max-w-full flex-nowrap items-center justify-between gap-[6px] mb-[9px] shrink-0 overflow-hidden`}>
                  <div className={`flex min-w-0 items-center overflow-hidden gap-[6px]${hasPurposeColumnFilters ? ' flex-1 min-w-0' : ' shrink-0'}`}>
                    <EdbcFilterToggleButton onClick={togglePurposeTableFilters} />
                    {hasPurposeColumnFilters && (
                      <div
                        ref={purposeFilterChipsScrollRef}
                        onMouseDown={handlePurposeFilterChipsMouseDown}
                        onMouseMove={handlePurposeFilterChipsMouseMove}
                        onMouseUp={handlePurposeFilterChipsMouseUp}
                        onMouseLeave={handlePurposeFilterChipsMouseUp}
                        className="flex min-w-0 flex-1 overflow-x-auto flex-nowrap gap-2 no-scrollbar scrollbar-none cursor-grab select-none"
                      >
                        {selectPurposeAssociateFilter && (
                          <SummaryFilterChip label="Associate" value={selectPurposeAssociateFilter} onClear={() => setSelectPurposeAssociateFilter('')} />
                        )}
                        {selectPurposeLoanFilter.trim() && (
                          <SummaryFilterChip label="Loan" value={selectPurposeLoanFilter} onClear={() => setSelectPurposeLoanFilter('')} />
                        )}
                        {selectPurposeBalanceFilter.trim() && (
                          <SummaryFilterChip label="Balance" value={selectPurposeBalanceFilter} onClear={() => setSelectPurposeBalanceFilter('')} />
                        )}
                        {selectPurposeStatusFilter && (
                          <SummaryFilterChip label="Status" value={selectPurposeStatusFilter} onClear={() => setSelectPurposeStatusFilter('')} />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-end gap-[6px] shrink-0">
                    <EdbcTableToolbarRightActions
                      onClearFilters={clearPurposeTableFilters}
                      overallSearch={purposeTableSearch}
                      onOverallSearchChange={setPurposeTableSearch}
                      showExportIcons={false}
                      clearButtonType="button"
                      wrapperClassName={null}
                      searchWrapperClassName="h-[34px] min-w-0 flex-1 max-w-[286px] border border-[#D6D6D6] rounded-md bg-white flex items-center px-2 sm:w-[286px] sm:min-w-[286px] sm:flex-none sm:shrink-0"
                    />
                    <SummaryTableExportActions onExportPdf={exportPurposePDF} onExportCsv={exportPurposeCSV} />
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden pb-[18px] flex flex-col">
                  <div
                    ref={purposeTableScroll.scrollRef}
                    className="rounded-lg border-l-8 border-l-[#BF9853] flex-1 min-h-0 w-full min-w-0 max-w-full overflow-y-auto overflow-x-auto no-scrollbar scrollbar-none"
                    onMouseDown={purposeTableScroll.handleMouseDown}
                >
            <table className={`${SUMMARY_RIGHT_TABLE_CLASS} ${showPurposeTableFilters ? '[&_thead_tr:first-child_th]:!border-b-0' : ''}`}>
                      <thead className="sticky top-0 z-20 bg-white">
                        <EdbcTableHeaderRow>
                          <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC3}
                            label="Associate"
                            sortField={purposeSortConfig.key === 'associateId' ? 'siteName' : null}
                            sortDirection={purposeSortConfig.direction}
                            onSort={handlePurposePanelEdbcSort}
                          />
                          <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC8}
                            label="Loan"
                            sortField={purposeSortConfig.key === 'pendingLoan' ? 'amount' : null}
                            sortDirection={purposeSortConfig.direction}
                            onSort={handlePurposePanelEdbcSort}
                          />
                          <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC8}
                            label="Balance"
                            sortField={purposeSortConfig.key === 'balance' ? 'amount' : null}
                            sortDirection={purposeSortConfig.direction}
                            onSort={() => handlePurposeSort('balance')}
                          />
                          <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC13}
                            label="Status"
                            sortField={purposeSortConfig.key === 'status' ? 'paymentMode' : null}
                            sortDirection={purposeSortConfig.direction}
                            onSort={handlePurposePanelEdbcSort}
                          />
                          <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC14}
                            label="Frequency"
                          />
                        </EdbcTableHeaderRow>
                        {showPurposeTableFilters && (
                          <EdbcTableFilterRow ref={purposeFilterRowRef}>
                            <SummaryAssociateNameFilter
                              placeholder="Associate"
                              options={purposeAssociateFilterOptions}
                              value={selectPurposeAssociateFilter}
                              onChange={setSelectPurposeAssociateFilter}
                            />
                            <EdbcTotalAmountFilter
                              columnId={EDBC_IDS.EDBC8}
                              totalAmount={purposeTableTotals.loan}
                              value={selectPurposeLoanFilter}
                              onChange={(e) => setSelectPurposeLoanFilter(e.target.value)}
                            />
                            <EdbcTotalAmountFilter
                              columnId={EDBC_IDS.EDBC8}
                              totalAmount={purposeTableTotals.balance}
                              value={selectPurposeBalanceFilter}
                              onChange={(e) => setSelectPurposeBalanceFilter(e.target.value)}
                            />
                            <SummaryEdbcSelectFilter
                              columnId={EDBC_IDS.EDBC13}
                              placeholder="Status"
                              options={statusFilterOptions}
                              value={selectPurposeStatusFilter}
                              onChange={setSelectPurposeStatusFilter}
                            />
                            <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC14} />
                          </EdbcTableFilterRow>
                        )}
              </thead>
              <tbody>
                {sortedSummaryByPurpose.length === 0 ? (
                  <tr><td colSpan={5} className="text-center p-6 text-gray-500">No Records Available</td></tr>
                ) : sortedSummaryByPurpose.map((item, i) => (
                          <EdbcTableBodyRow key={i}>
                            <EdbcExpandableBodyCell
                              columnId={EDBC_IDS.EDBC3}
                              expense={{ id: item.associateId, ...item }}
                              rowIndex={i}
                              expandedCells={purposeExpandedCells}
                              onToggleExpanded={togglePurposeExpandedCell}
                              getDisplayValue={() => getAssociateName(item.associateId)}
                            />
                            <td
                              id={EDBC_IDS.EDBC8}
                              className={edbc8Config?.tdClass}
                              onMouseEnter={(e) => handleLoanMouseEnter(e, item.associateId, selectedPurpose?.id, 'purpose')}
                      onMouseLeave={hideTooltip}
                            >
                              <span
                                onClick={() => handlePurposeLoanClick(item.associateId, selectedPurpose?.id, getAssociateName(item.associateId))}
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  togglePurposeExpandedCell(`${item.associateId ?? i}-loan`);
                                }}
                                className={`block w-full cursor-pointer ${purposeExpandedCells[`${item.associateId ?? i}-loan`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                title={formatSummaryAmount(item.pendingLoan)}
                              >
                                {formatSummaryAmount(item.pendingLoan)}
                              </span>
                    </td>
                    <td 
                              className={edbc8Config?.tdClass}
                              onMouseEnter={(e) => handleBalanceMouseEnter(e, item.associateId, selectedPurpose?.id, 'purpose')}
                      onMouseLeave={hideTooltip}
                            >
                              <span
                                onClick={() => handlePurposeBalanceClick(item.associateId, selectedPurpose?.id, getAssociateName(item.associateId))}
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  togglePurposeExpandedCell(`${item.associateId ?? i}-balance`);
                                }}
                                className={`block w-full cursor-pointer ${purposeExpandedCells[`${item.associateId ?? i}-balance`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                title={formatSummaryAmount(item.pendingLoan - item.refund)}
                              >
                                {formatSummaryAmount(item.pendingLoan - item.refund)}
                              </span>
                    </td>
                            {renderLoanStatusBodyCell({
                              status: item.status,
                              pendingLoan: item.pendingLoan,
                              rowId: item.associateId,
                              rowIndex: i,
                              expandedCells: purposeExpandedCells,
                              onToggleExpanded: togglePurposeExpandedCell,
                              onClick: () => handlePurposeStatusClick(item.associateId, selectedPurpose?.id, getAssociateName(item.associateId)),
                            })}
                            <td id={EDBC_IDS.EDBC14} className={edbc14Config?.tdClass}></td>
                          </EdbcTableBodyRow>
                ))}
              </tbody>
            </table>
                  </div>
                </div>
          </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
        {tooltipData && (
          <div
            className="fixed z-50 bg-white text-black p-3 rounded shadow-lg text-sm max-w-xs"
            style={{ left: tooltipPos.x + 10, top: tooltipPos.y - 10, pointerEvents: 'none' }}
          >
            <div className="font-semibold mb-2">{tooltipTitle || 'Details'}:</div>
            {tooltipData
              .slice()
              .reverse()
              .map((entry, index) => (
                <div key={index} className="mb-1">
                  <span className="text-gray-600">{entry.date}:</span>
                  <span className={`ml-2 ${entry.amount < 0 ? 'text-red-600' : ''}`}>
                    ₹{entry.amount.toLocaleString('en-IN')}
                  </span>
                  {entry.associateName && tooltipTable === 'associate' && !selectedAssociate && (
                    <div className="text-xs text-gray-500 ml-2">({entry.associateName})</div>
                  )}
                  {entry.purposeName && tooltipTable === 'purpose' && !selectedPurpose && (
                    <div className="text-xs text-gray-500 ml-2">({entry.purposeName})</div>
                  )}
                  {entry.isRefund && tooltipTable === 'associate' && selectedAssociate && (
                    <div className="text-xs text-gray-500 ml-2">(Refund)</div>
                  )}
                  {entry.isRefund && tooltipTable === 'purpose' && selectedPurpose && (
                    <div className="text-xs text-gray-500 ml-2">(Refund)</div>
                  )}
                  {entry.type === 'Transfer' && tooltipTable === 'associate' && selectedAssociate && entry.transferPurposeName && !entry.isRefund && (
                    <div className="text-xs text-gray-500 ml-2">
                      ({entry.amount < 0 ? 'Transfer To: ' : 'Transfer From: '}{entry.transferPurposeName})
                </div>
                  )}
                  {entry.type === 'Transfer' && tooltipTable === 'purpose' && selectedPurpose && entry.transferPurposeName && !entry.isRefund && (
                    <div className="text-xs text-gray-500 ml-2">
                      ({entry.amount < 0 ? 'Transfer To: ' : 'Transfer From: '}{entry.transferPurposeName})
              </div>
                  )}
                </div>
              ))}
            <div className="mt-2 pt-2 border-t border-gray-600">
              <span className="font-semibold">
                Total: ₹
                {tooltipData
                  .reduce((sum, item) => sum + item.amount, 0)
                  .toLocaleString('en-IN')}
              </span>
          </div>
        </div>
      )}

      {/* Associate Popup */}
      {showAssociatePopup && associatePopupData && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={() => setShowAssociatePopup(false)}
        >
            <div
              className="relative bg-white rounded-lg shadow-xl p-[18px] w-fit text-left max-h-[80vh] overflow-hidden no-scrollbar scrollbar-none"
            onClick={(e) => e.stopPropagation()}
          >
              <button
                type="button"
                onClick={() => setShowAssociatePopup(false)}
                className="absolute top-[18px] right-[18px] z-10 flex h-[20px] w-[20px] items-center justify-center"
              >
                <img src={FileRemover} className="w-[10px] h-[10px]" alt="Close" />
              </button>
              <div className="mb-2 pr-[46px] w-[468px] max-w-full min-w-0">
                <SummaryPopupContextHeader context={associatePopupContext} />
                <p className="text-sm text-gray-600 mt-1">{associatePopupTitle}</p>
                <div className="flex w-[468px] max-w-full justify-end mt-[8px]">
                  <SummaryPopupExportActions
                    onExportPdf={() => exportPopupPDF(sortPopupData(associatePopupData, associatePopupSortConfig), associatePopupTitle, associatePopupContext)}
                    onExportCsv={() => exportPopupCSV(sortPopupData(associatePopupData, associatePopupSortConfig), associatePopupTitle, associatePopupContext)}
                  />
                </div>
            </div>
              <div className="mt-[8px] border-l-8 border-l-[#BF9853] max-h-[55vh] overflow-y-auto no-scrollbar scrollbar-none rounded-lg overflow-hidden">
                <table className={SUMMARY_POPUP_TABLE_CLASS}>
                  <thead className="sticky top-0 z-20 bg-[#FAF6ED]">
                    <EdbcTableHeaderRow>
                      <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC2}
                        label="Date"
                        columnWidthClass={EDBC2_FIRST_COLUMN_WIDTH_CLASS}
                        sortField={associatePopupEdbcSortField}
                        sortDirection={associatePopupSortConfig.direction}
                        onSort={handleAssociatePopupSort}
                      />
                      <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC4}
                        label={!selectedAssociate ? 'Associate' : 'Transfer'}
                        sortField={associatePopupEdbcSortField}
                        sortDirection={associatePopupSortConfig.direction}
                        onSort={handleAssociatePopupSort}
                      />
                      <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC8}
                        label="Amount"
                        sortField={associatePopupEdbcSortField}
                        sortDirection={associatePopupSortConfig.direction}
                        onSort={handleAssociatePopupSort}
                      />
                    </EdbcTableHeaderRow>
                </thead>
                <tbody>
                    {sortPopupData(associatePopupData, associatePopupSortConfig).map((entry, index) => (
                      <EdbcTableBodyRow key={index}>
                        <td id={EDBC_IDS.EDBC2} className={edbc2Config?.tdClass}>{entry.date}</td>
                        <td id={EDBC_IDS.EDBC4} className={edbc4Config?.tdClass}>
                          {renderLoanPopupSecondColumn(entry, true)}
                        </td>
                        <td id={EDBC_IDS.EDBC8} className={`${edbc8Config?.tdClass} font-semibold ${entry.amount < 0 ? 'text-red-600' : ''}`.trim()}>
                          ₹{entry.amount.toLocaleString('en-IN')}
                        </td>
                      </EdbcTableBodyRow>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="bg-[#BF9853] text-white h-[40px] font-bold">
                      <td id={EDBC_IDS.EDBC2} className={edbc2Config?.tdClass}>Total</td>
                      <td id={EDBC_IDS.EDBC4} className={edbc4Config?.tdClass}></td>
                      <td id={EDBC_IDS.EDBC8} className={`${edbc8Config?.tdClass} text-white`}>
                        ₹{associatePopupData.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Purpose Popup */}
      {showPurposePopup && purposePopupData && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={() => setShowPurposePopup(false)}
        >
            <div
              className="relative bg-white rounded-lg shadow-xl p-[18px] w-fit text-left max-h-[80vh] overflow-hidden no-scrollbar scrollbar-none"
            onClick={(e) => e.stopPropagation()}
          >
              <button
                type="button"
                onClick={() => setShowPurposePopup(false)}
                className="absolute top-[18px] right-[18px] z-10 flex h-[20px] w-[20px] items-center justify-center"
              >
                <img src={FileRemover} className="w-[10px] h-[10px]" alt="Close" />
              </button>
              <div className="mb-2 pr-[46px] w-[468px] max-w-full min-w-0">
                <SummaryPopupContextHeader context={purposePopupContext} />
                <p className="text-sm text-gray-600 mt-1">{purposePopupTitle}</p>
                <div className="flex w-[468px] max-w-full justify-end mt-[8px]">
                  <SummaryPopupExportActions
                    onExportPdf={() => exportPopupPDF(sortPopupData(purposePopupData, purposePopupSortConfig), purposePopupTitle, purposePopupContext)}
                    onExportCsv={() => exportPopupCSV(sortPopupData(purposePopupData, purposePopupSortConfig), purposePopupTitle, purposePopupContext)}
                  />
                </div>
            </div>
              <div className="mt-[8px] border-l-8 border-l-[#BF9853] max-h-[55vh] overflow-y-auto no-scrollbar scrollbar-none rounded-lg overflow-hidden">
                <table className={SUMMARY_POPUP_TABLE_CLASS}>
                  <thead className="sticky top-0 z-20 bg-[#FAF6ED]">
                    <EdbcTableHeaderRow>
                      <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC2}
                        label="Date"
                        columnWidthClass={EDBC2_FIRST_COLUMN_WIDTH_CLASS}
                        sortField={purposePopupEdbcSortField}
                        sortDirection={purposePopupSortConfig.direction}
                        onSort={handlePurposePopupSort}
                      />
                      <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC4}
                        label={!selectedPurpose ? 'Purpose' : 'Transfer'}
                        sortField={purposePopupEdbcSortField}
                        sortDirection={purposePopupSortConfig.direction}
                        onSort={handlePurposePopupSort}
                      />
                      <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC8}
                        label="Amount"
                        sortField={purposePopupEdbcSortField}
                        sortDirection={purposePopupSortConfig.direction}
                        onSort={handlePurposePopupSort}
                      />
                    </EdbcTableHeaderRow>
                </thead>
                <tbody>
                    {sortPopupData(purposePopupData, purposePopupSortConfig).map((entry, index) => (
                      <EdbcTableBodyRow key={index}>
                        <td id={EDBC_IDS.EDBC2} className={edbc2Config?.tdClass}>{entry.date}</td>
                        <td id={EDBC_IDS.EDBC4} className={edbc4Config?.tdClass}>
                          {renderLoanPopupSecondColumn(entry, false)}
                        </td>
                        <td id={EDBC_IDS.EDBC8} className={`${edbc8Config?.tdClass} font-semibold ${entry.amount < 0 ? 'text-red-600' : ''}`.trim()}>
                          ₹{entry.amount.toLocaleString('en-IN')}
                        </td>
                      </EdbcTableBodyRow>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="bg-[#BF9853] text-white h-[40px] font-bold">
                      <td id={EDBC_IDS.EDBC2} className={edbc2Config?.tdClass}>Total</td>
                      <td id={EDBC_IDS.EDBC4} className={edbc4Config?.tdClass}></td>
                      <td id={EDBC_IDS.EDBC8} className={`${edbc8Config?.tdClass} text-white`}>
                        ₹{purposePopupData.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Status Popup */}
      {showStatusPopup && statusPopupData && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={() => setShowStatusPopup(false)}
        >
            <div
              className="relative bg-white rounded-lg shadow-xl p-[18px] w-fit text-left max-h-[80vh] overflow-hidden no-scrollbar scrollbar-none"
            onClick={(e) => e.stopPropagation()}
          >
              <button
                type="button"
                onClick={() => setShowStatusPopup(false)}
                className="absolute top-[18px] right-[18px] z-10 flex h-[20px] w-[20px] items-center justify-center"
              >
                <img src={FileRemover} className="w-[10px] h-[10px]" alt="Close" />
              </button>
              <div className="mb-2 pr-[46px] w-[468px] max-w-full min-w-0">
                <SummaryPopupContextHeader context={statusPopupContext} />
                <p className="text-sm text-gray-600 mt-1">Status Details</p>
                <div className="flex w-[468px] max-w-full justify-end mt-[8px]">
                  <SummaryPopupExportActions
                    onExportPdf={exportStatusPDF}
                    onExportCsv={exportStatusCSV}
                  />
                </div>
            </div>
              <div className="mt-[8px] border-l-8 border-l-[#BF9853] max-h-[55vh] overflow-y-auto no-scrollbar scrollbar-none rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#f8f1e5]">
                    <th className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleStatusPopupSort('date')}>
                      Date
                      {statusPopupSortConfig.key === 'date' && (
                        <span className="ml-1">{statusPopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleStatusPopupSort('loanAmount')}>
                      Loan Amount
                      {statusPopupSortConfig.key === 'loanAmount' && (
                        <span className="ml-1">{statusPopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="p-3 text-right font-semibold cursor-pointer hover:bg-gray-200" onClick={() => handleStatusPopupSort('refundAmount')}>
                      Refund Amount
                      {statusPopupSortConfig.key === 'refundAmount' && (
                        <span className="ml-1">{statusPopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const combinedData = [];
                    const dateMap = new Map();
                    statusPopupData.loans.forEach(loan => {
                      const key = `${loan.date}`;
                      dateMap.set(key, {
                        date: loan.date,
                        loanAmount: loan.amount,
                        refundAmount: 0,
                      });
                    });
                    statusPopupData.refunds.forEach(refund => {
                      const key = `${refund.date}`;
                      if (dateMap.has(key)) {
                        dateMap.get(key).refundAmount = refund.amount;
                      } else {
                        dateMap.set(key, {
                          date: refund.date,
                          loanAmount: 0,
                          refundAmount: refund.amount,
                        });
                      }
                    });
                    combinedData.push(...Array.from(dateMap.values()));
                    const parseDate = (dateStr) => {
                      const [day, month, year] = dateStr.split('/');
                      return new Date(`${year}-${month}-${day}`);
                    };
                    if (!statusPopupSortConfig.key) {
                      combinedData.sort((a, b) => parseDate(b.date) - parseDate(a.date));
                    } else {
                      combinedData.sort((a, b) => {
                        let aValue = a[statusPopupSortConfig.key];
                        let bValue = b[statusPopupSortConfig.key];
                        if (statusPopupSortConfig.key === 'date') {
                          aValue = parseDate(aValue);
                          bValue = parseDate(bValue);
                          return statusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
                        }
                        if (typeof aValue === 'number' && typeof bValue === 'number') {
                          return statusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
                        }
                        return 0;
                      });
                    }
                    return combinedData.map((entry, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-[#FAF6ED]"}>
                        <td className="p-3 text-left">{entry.date}</td>
                        <td className={`p-3 text-right font-semibold ${entry.loanAmount < 0 ? 'text-red-600' : ''}`}>
                          {entry.loanAmount !== 0 ? `₹${entry.loanAmount.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="p-3 text-right font-semibold">
                          {entry.refundAmount !== 0 ? `₹${entry.refundAmount.toLocaleString('en-IN')}` : '-'}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
                <tfoot>
                  <tr className="bg-[#f8f1e5] font-bold">
                    <td className="p-3 text-left">Total</td>
                    <td className="p-3 text-right">
                      ₹{statusPopupData.loans.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right">
                      ₹{statusPopupData.refunds.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr className="bg-[#BF9853] text-white font-bold">
                    <td className="p-3 text-left">Balance Loan</td>
                    <td className="p-3 text-right" colSpan="2">
                      ₹{(
                        statusPopupData.loans.reduce((sum, item) => sum + item.amount, 0) -
                        statusPopupData.refunds.reduce((sum, item) => sum + item.amount, 0)
                      ).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default LoanSummary;
