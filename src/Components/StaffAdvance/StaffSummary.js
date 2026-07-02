import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Select from 'react-select';
import jsPDF from "jspdf";
import "jspdf-autotable";
import PdfIcon from '../Images/pdf.png';
import XlIcon from '../Images/sheets.png';
import SearchIcon from '../Images/Searchnew.svg';
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
const SUMMARY_TABLE_CLASS = `table-fixed border-collapse ${EDBC_TABLE_EDGE_TABLE_CLASS} ${EDBC8_COLUMN_LOCK_TABLE_CLASS} ${SUMMARY_EDBC13_COLUMN_LOCK} [&_#EDBC-12]:!pl-0 [&_th#EDBC-13]:!pr-0 [&_td#EDBC-13]:!pr-0`;
const SUMMARY_PURPOSE_TABLE_CLASS = `${SUMMARY_TABLE_CLASS} max-w-full [&_th#EDBC-4]:!w-[230px] [&_td#EDBC-4]:!w-[230px] [&_th#EDBC-4]:!min-w-[230px] [&_td#EDBC-4]:!min-w-[230px] [&_th#EDBC-4]:!max-w-[230px] [&_td#EDBC-4]:!max-w-[230px] [&_td#EDBC-4]:!overflow-hidden`;
const SUMMARY_EMPLOYEE_TABLE_CLASS = `${SUMMARY_TABLE_CLASS} max-w-full [&_th#EDBC-4]:!w-[230px] [&_td#EDBC-4]:!w-[230px] [&_th#EDBC-4]:!min-w-[230px] [&_td#EDBC-4]:!min-w-[230px] [&_th#EDBC-4]:!max-w-[230px] [&_td#EDBC-4]:!max-w-[230px] [&_td#EDBC-4]:!overflow-hidden`;
const SUMMARY_POPUP_TABLE_CLASS = `table-fixed w-[468px] max-w-full border-collapse ${EDBC_TABLE_EDGE_TABLE_CLASS} ${EDBC8_COLUMN_LOCK_TABLE_CLASS} [&_th#EDBC-2]:!w-[130px] [&_td#EDBC-2]:!w-[130px] [&_th#EDBC-2]:!min-w-[130px] [&_td#EDBC-2]:!min-w-[130px] [&_th#EDBC-2]:!max-w-[130px] [&_td#EDBC-2]:!max-w-[130px]`;
const SUMMARY_STATUS_POPUP_TABLE_BASE = `table-fixed border-collapse ${EDBC_TABLE_EDGE_TABLE_CLASS} ${EDBC8_COLUMN_LOCK_TABLE_CLASS} [&_th#EDBC-2]:!w-[130px] [&_td#EDBC-2]:!w-[130px] [&_th#EDBC-2]:!min-w-[130px] [&_td#EDBC-2]:!min-w-[130px] [&_th#EDBC-2]:!max-w-[130px] [&_td#EDBC-2]:!max-w-[130px]`;
const SUMMARY_STATUS_LEFT_POPUP_TABLE_CLASS = `${SUMMARY_STATUS_POPUP_TABLE_BASE} w-[588px] max-w-full [&_th#EDBC-4]:!w-[218px] [&_td#EDBC-4]:!w-[218px] [&_th#EDBC-4]:!min-w-[218px] [&_td#EDBC-4]:!min-w-[218px] [&_th#EDBC-4]:!max-w-[218px] [&_td#EDBC-4]:!max-w-[218px]`;
const SUMMARY_STATUS_RIGHT_POPUP_TABLE_CLASS = `${SUMMARY_STATUS_POPUP_TABLE_BASE} w-[668px] max-w-full [&_th#EDBC-4]:!w-[298px] [&_td#EDBC-4]:!w-[298px] [&_th#EDBC-4]:!min-w-[298px] [&_td#EDBC-4]:!min-w-[298px] [&_th#EDBC-4]:!max-w-[298px] [&_td#EDBC-4]:!max-w-[298px]`;
const SUMMARY_OUTSIDE_SELECT_CLASS = 'custom-select w-[300px] h-[40px] rounded-lg focus:outline-none';
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

const getStaffStatusLabel = (pendingAdvance) => (pendingAdvance > 0 ? 'Pending' : 'Settled');
const BILL_STATUS_PENDING_COLOR = '#E4572E';
const BILL_STATUS_SETTLED_COLOR = '#007233';
const edbc13Config = getEdbcColumnConfig(EDBC_IDS.EDBC13);
const getStaffStatusColor = (pendingAdvance) =>
  pendingAdvance > 0 ? BILL_STATUS_PENDING_COLOR : BILL_STATUS_SETTLED_COLOR;

const EMPTY_SUMMARY_POPUP_CONTEXT = { line1: '', line2: '' };

const formatSummaryPopupContextText = ({ line1, line2 }) => {
  if (!line1 && !line2) return '';
  if (!line1) return line2;
  if (!line2) return line1;
  return `${line1} - ${line2}`;
};

const SummaryPopupContextHeader = ({ context }) => (
  <h3 className="text-[18px] font-semibold text-[#000000]">
    {context.line1 && <span className="block">{context.line1}</span>}
    {context.line2 && <span className="block">{context.line2}</span>}
  </h3>
);

const renderStaffStatusBodyCell = ({
  pendingAdvance,
  rowId,
  rowIndex,
  expandedCells,
  onToggleExpanded,
  onClick,
}) => {
  const label = getStaffStatusLabel(pendingAdvance);
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
        style={{ color: getStaffStatusColor(pendingAdvance) }}
        title={label}
      >
        {label}
      </span>
    </td>
  );
};

const SummaryTableExportActions = ({ onExportPdf, onExportCsv }) => (
  <div className="flex shrink-0 justify-end items-center gap-2">
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

const SummaryTableSearchInput = ({ value, onChange }) => (
  <div className="h-[34px] min-w-0 flex-1 max-w-[286px] border border-[#D6D6D6] rounded-md bg-white flex items-center px-2 gap-1 sm:w-[286px] sm:min-w-[286px] sm:flex-none sm:shrink-0">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search Transactions..."
      className="h-full w-full border-0 p-0 text-[14px] text-[#000000] bg-transparent outline-none"
    />
    <img src={SearchIcon} alt="Search" className="w-[16px] h-[16px] pointer-events-none shrink-0" />
  </div>
);

const SummaryFilterChip = ({ label, value, onClear }) => (
  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium">
    <span className="font-medium text-[#BF9853] whitespace-nowrap">{label}:</span>
    <span className="font-semibold text-[14px] whitespace-nowrap">{value}</span>
    <button type="button" onClick={onClear} className="text-[#E4572E] ml-1 text-2xl leading-none shrink-0">×</button>
  </span>
);

const getEmployeeOptionValue = (option) => `${option.type}-${option.id}`;

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

const SummaryEmployeeNameFilter = ({ value, onChange, options }) => {
  const config = getEdbcColumnConfig(EDBC_IDS.EDBC4);
  if (!config) return null;
  return (
    <th id={EDBC_IDS.EDBC4} className={config.filterThClass}>
      <Select
        className={config.filterWidthClass}
        options={options}
        value={value}
        onChange={onChange}
        getOptionValue={getEmployeeOptionValue}
        getOptionLabel={(option) => option.label}
        placeholder="Employee Name"
        menuPlacement="bottom"
        menuPortalTarget={document.body}
        isSearchable
        noOptionsMessage={() => 'No options'}
        filterOption={(option, input) => {
          const q = input.trim().toLowerCase();
          if (!q) return true;
          return option.label.toLowerCase().includes(q);
        }}
        styles={SUMMARY_FIRST_COLUMN_FILTER_SELECT_STYLES}
      />
    </th>
  );
};

const SummaryEdbcSelectFilter = ({
  columnId,
  placeholder,
  options,
  value,
  onChange,
}) => {
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
    lastMove.current = {
      time: now,
      x: e.clientX,
      y: e.clientY,
    };
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
    if (wasDragging) {
      applyMomentum();
    }
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
    lastMove.current = {
      time: Date.now(),
      x: e.clientX,
      y: e.clientY,
    };
    cancelMomentum();
    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);
  }, [cancelMomentum, handleDocumentMouseMove, handleDocumentMouseUp]);
  return { scrollRef, handleMouseDown };
};

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

const StaffSummary = ({ username, userRoles = [], paymentModeOptions = [] }) => {
  const [empOptions, setEmpOptions] = useState([]);
  const [laboursList, setLaboursList] = useState([]);
  const [staffAdvanceCombinedOptions, setStaffAdvanceCombinedOptions] = useState([]);
  const [purposeOptions, setPurposeOptions] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [selectedEmpOption, setSelectedEmpOption] = useState('');
  const [selectedPurposeOption, setSelectedPurposeOption] = useState('');
  const [totalPendingAdvance, setTotalPendingAdvance] = useState(0);
  const [purposeDetails, setPurposeDetails] = useState([]);
  const [purposePendingAdvance, setPurposePendingAdvance] = useState(0);
  const [purposeBillAmount, setPurposeBillAmount] = useState(0);
  const [totalBillAmount, setTotalBillAmount] = useState(0);
  // Sorting state for both tables
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [purposeSortConfig, setPurposeSortConfig] = useState({ key: null, direction: 'asc' });
  // Tooltip state
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipTitle, setTooltipTitle] = useState("");
  const [tooltipTable, setTooltipTable] = useState('purpose');
  const [showPurposePopup, setShowPurposePopup] = useState(false);
  const [purposePopupData, setPurposePopupData] = useState(null);
  const [purposePopupTitle, setPurposePopupTitle] = useState("");
  const [purposePopupContext, setPurposePopupContext] = useState(EMPTY_SUMMARY_POPUP_CONTEXT);
  const [purposePopupSortConfig, setPurposePopupSortConfig] = useState({ key: null, direction: 'asc' });
  const [showEmpPopup, setShowEmpPopup] = useState(false);
  const [empPopupData, setEmpPopupData] = useState(null);
  const [empPopupTitle, setEmpPopupTitle] = useState("");
  const [empPopupContext, setEmpPopupContext] = useState(EMPTY_SUMMARY_POPUP_CONTEXT);
  const [empPopupSortConfig, setEmpPopupSortConfig] = useState({ key: null, direction: 'asc' });
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [statusPopupData, setStatusPopupData] = useState({ advances: [], refunds: [] });
  const [statusPopupContext, setStatusPopupContext] = useState(EMPTY_SUMMARY_POPUP_CONTEXT);
  const [statusPopupSortConfig, setStatusPopupSortConfig] = useState({ key: null, direction: 'asc' });
  const [isStatusFromPurposeTable, setIsStatusFromPurposeTable] = useState(true);
  useEffect(() => {
    const savedEmp = sessionStorage.getItem('selectedEmpOption');
    try {
      if (savedEmp) setSelectedEmpOption(JSON.parse(savedEmp));
    } catch (error) {
      console.error("Error parsing sessionStorage data:", error);
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  const handleBeforeUnload = () => {
    sessionStorage.removeItem('selectedEmpOption');
  };
  useEffect(() => {
    if (selectedEmpOption) sessionStorage.setItem('selectedEmpOption', JSON.stringify(selectedEmpOption));
  }, [selectedEmpOption]);
  useEffect(() => {
    const saved = localStorage.getItem("staffEmpName");
    if (saved) {
      setSelectedEmpOption(JSON.parse(saved));
    }
  }, []);
  useEffect(() => {
    const savedPurpose = localStorage.getItem("staffPurpose");
    if (savedPurpose) {
      setSelectedPurposeOption(JSON.parse(savedPurpose));
    }
  }, []);
  // Fetch Employee Names
  useEffect(() => {
    const fetchEmpNames = async () => {
      try {
        const res = await fetch("https://backendaab.in/aabuildersDash/api/employee_details/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        setEmpOptions(data.map(item => ({
          value: item.employee_name,
          label: item.employee_name,
          id: item.id,
          type: "Employee"
        })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmpNames();
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
          type: "Labour"
        }));
        setLaboursList(formattedData);
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error fetching Labour names.');
    }
  };
  useEffect(() => { setStaffAdvanceCombinedOptions([...empOptions, ...laboursList]); }, [empOptions, laboursList]);
  // Fetch Purpose Options
  useEffect(() => {
    const fetchPurposeOptions = async () => {
      try {
        const res = await fetch("https://backendaab.in/aabuildersDash/api/purposes/getAll", {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        if (!res.ok) {
          console.warn("Purposes API not available, using empty data");
          setPurposeOptions([]);
          return;
        }
        const data = await res.json();
        setPurposeOptions(data.map(item => ({
          value: item.purpose,
          label: item.purpose,
          id: item.id
        })));
      } catch (err) {
        console.warn("Purpose fetch error:", err);
        setPurposeOptions([]);
      }
    };
    fetchPurposeOptions();
  }, []);
  // Fetch Staff Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://backendaab.in/aabuildersDash/api/staff-advance/all");
        if (!res.ok) {
          console.warn('Staff advance API not available, using empty data');
          setStaffData([]);
          return;
        }
        const data = await res.json();
        setStaffData(data);
      } catch (err) {
        console.warn("Error fetching staff data", err);
        setStaffData([]);
      }
    };
    fetchData();
  }, []);
  const purposeTableScroll = useTableDragScroll();
  const empTableScroll = useTableDragScroll();
  const purposeScrollRef = purposeTableScroll.scrollRef;
  const empScrollRef = empTableScroll.scrollRef;
  const { expandedCells: purposeExpandedCells, toggleExpandedCell: togglePurposeExpandedCell } = useEdbcExpandedCells();
  const { expandedCells: empExpandedCells, toggleExpandedCell: toggleEmpExpandedCell } = useEdbcExpandedCells();
  const [showPurposeFilters, setShowPurposeFilters] = useState(false);
  const [showEmpFilters, setShowEmpFilters] = useState(false);
  const [selectPurposeNameFilter, setSelectPurposeNameFilter] = useState('');
  const [selectPurposeAdvanceFilter, setSelectPurposeAdvanceFilter] = useState('');
  const [selectPurposeRefundFilter, setSelectPurposeRefundFilter] = useState('');
  const [selectPurposeStatusFilter, setSelectPurposeStatusFilter] = useState('');
  const [selectEmpNameFilter, setSelectEmpNameFilter] = useState(null);
  const [selectEmpAdvanceFilter, setSelectEmpAdvanceFilter] = useState('');
  const [selectEmpRefundFilter, setSelectEmpRefundFilter] = useState('');
  const [selectEmpStatusFilter, setSelectEmpStatusFilter] = useState('');
  const purposeFilterRowRef = useRef(null);
  const empFilterRowRef = useRef(null);
  const purposeFilterNudgeUsedRef = useRef(false);
  const empFilterNudgeUsedRef = useRef(false);
  const purposeFilterChipsScrollRef = useRef(null);
  const purposeIsFilterChipsDragging = useRef(false);
  const purposeFilterChipsDragStart = useRef({ x: 0, scrollLeft: 0 });
  const empFilterChipsScrollRef = useRef(null);
  const empIsFilterChipsDragging = useRef(false);
  const empFilterChipsDragStart = useRef({ x: 0, scrollLeft: 0 });
  const [purposeTableSearch, setPurposeTableSearch] = useState('');
  const [empTableSearch, setEmpTableSearch] = useState('');
  const edbc8Config = getEdbcColumnConfig(EDBC_IDS.EDBC8);
  const edbc2Config = getEdbcColumnConfig(EDBC_IDS.EDBC2);
  const edbc4Config = getEdbcColumnConfig(EDBC_IDS.EDBC4);
  const handlePurposeEdbcSort = (field) => {
    if (field === 'vendor') handleSort('purposeName');
    else if (field === 'amount') handleSort('pendingAdvance');
    else if (field === 'paymentMode') handleSort('billStatus');
  };
  const handleEmpEdbcSort = (field) => {
    if (field === 'vendor') handlePurposeSort('name');
    else if (field === 'amount') handlePurposeSort('pendingAdvance');
    else if (field === 'paymentMode') handlePurposeSort('billStatus');
  };
  const purposeHeaderSortField = sortConfig.key === 'purposeName'
    ? 'vendor'
    : sortConfig.key === 'pendingAdvance'
      ? 'amount'
      : sortConfig.key === 'billAmount'
        ? 'amount'
        : sortConfig.key === 'billStatus'
          ? 'paymentMode'
          : null;
  const empHeaderSortField = purposeSortConfig.key === 'name'
    ? 'vendor'
    : purposeSortConfig.key === 'pendingAdvance'
      ? 'amount'
      : purposeSortConfig.key === 'billAmount'
        ? 'amount'
        : purposeSortConfig.key === 'billStatus'
          ? 'paymentMode'
          : null;
  // State for filtered purpose data
  const [purposeData, setPurposeData] = useState([]);
  useEffect(() => {
    const filtered = selectedEmpOption
      ? staffData.filter(item => {
        // Check based on the type of selected option (Employee or Labour)
        if (selectedEmpOption.type === "Employee") {
          // Only check employee-related fields when an employee is selected
          return item.employee_name === selectedEmpOption.value ||
            item.employee_id === selectedEmpOption.id ||
            item.emp_name === selectedEmpOption.value;
        } else if (selectedEmpOption.type === "Labour") {
          // Only check labour-related fields when a labour is selected
          return item.labour_name === selectedEmpOption.value ||
            item.labour_id === selectedEmpOption.id;
        } else {
          // Fallback to original logic if type is not specified
          return item.employee_name === selectedEmpOption.value ||
            item.employee_id === selectedEmpOption.id ||
            item.emp_name === selectedEmpOption.value ||
            item.labour_name === selectedEmpOption.value ||
            item.labour_id === selectedEmpOption.id;
        }
      })
      : staffData;
    const grouped = {};
    let totalPendingAll = 0;
    let totalRefundAll = 0;
    filtered.forEach(curr => {
        const {
          from_purpose_id,
          to_purpose_id,
          amount = 0,
          staff_refund_amount = 0
        } = curr;
        // Handle Transfer type transactions
        if (curr.type === 'Transfer') {
          // For transfer records, the amount field already contains the correct sign
          // Negative amount means money going out from from_purpose_id
          // Positive amount means money coming in to from_purpose_id
          if (from_purpose_id) {
            if (!grouped[from_purpose_id]) {
              grouped[from_purpose_id] = {
                purposeName: purposeOptions.find(p => String(p.id) === String(from_purpose_id))?.label || "-",
                purposeId: from_purpose_id,
                totalAdvance: 0,
                totalRefund: 0
              };
            }
            grouped[from_purpose_id].totalAdvance += parseFloat(amount) || 0; // Amount already has correct sign
          }
        } else {
          // Handle non-transfer transactions (Advance and Refund)
          if (!grouped[from_purpose_id]) {
            grouped[from_purpose_id] = {
              purposeName: purposeOptions.find(p => String(p.id) === String(from_purpose_id))?.label || "-",
              purposeId: from_purpose_id,
              totalAdvance: 0,
              totalRefund: 0
            };
          }
          // For advance entries, amount is positive
          if (curr.type === 'Advance') {
            grouped[from_purpose_id].totalAdvance += parseFloat(amount) || 0;
          }
          // For refund entries, subtract the refund amount
          if (curr.type === 'Refund') {
            grouped[from_purpose_id].totalRefund += parseFloat(staff_refund_amount) || 0;
          }
        }
      });
      const purposeArray = Object.values(grouped)
        .filter(p => p.totalAdvance !== 0 || p.totalRefund !== 0)
        .map(p => {
        const pending = p.totalAdvance - p.totalRefund;
        totalPendingAll += pending;
        totalRefundAll += p.totalRefund;
        return {
          purposeName: p.purposeName,
          pendingAdvance: pending,
          billAmount: p.totalRefund, // Show refund amount
          purposeId: p.purposeId
        };
      });
      setPurposeData(purposeArray);
      setTotalPendingAdvance(totalPendingAll);
      setTotalBillAmount(totalRefundAll); // Show total refund amount
  }, [selectedEmpOption, staffData, purposeOptions]);
  const sortedPurposeOptions = purposeOptions.sort((a, b) =>
    a.label.localeCompare(b.label)
  );
  // Sorting functions
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
  const defaultSort = (data, statusKey = 'pendingAdvance', nameKey = 'purposeName') => {
    return [...data].sort((a, b) => {
      const aStatus = a[statusKey] > 0 ? 1 : 0;
      const bStatus = b[statusKey] > 0 ? 1 : 0;
      if (aStatus !== bStatus) return bStatus - aStatus;

      const aName = (a[nameKey] || '').toLowerCase();
      const bName = (b[nameKey] || '').toLowerCase();
      if (aName < bName) return -1;
      if (aName > bName) return 1;
      return 0;
    });
  };
  const sortData = (data, config, statusKey = 'pendingAdvance', nameKey = 'purposeName') => {
    if (!config.key) {
      return defaultSort(data, statusKey, nameKey);
    }
    return [...data].sort((a, b) => {
      let aValue = a[config.key];
      let bValue = b[config.key];
      if (config.key === 'billStatus') {
        const aStatus = a.pendingAdvance > 0 ? 'Pending' : 'Bill Settled';
        const bStatus = b.pendingAdvance > 0 ? 'Pending' : 'Bill Settled';
        aValue = aStatus;
        bValue = bStatus;
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
  const filteredPurposeData = useMemo(() => {
    return purposeData.filter((purpose) => {
      if (selectPurposeNameFilter && purpose.purposeName !== selectPurposeNameFilter) return false;
      if (!matchesEdbcAmountFilter(purpose.pendingAdvance, selectPurposeAdvanceFilter)) return false;
      if (!matchesEdbcAmountFilter(purpose.billAmount, selectPurposeRefundFilter)) return false;
      const status = getStaffStatusLabel(purpose.pendingAdvance);
      if (selectPurposeStatusFilter && status !== selectPurposeStatusFilter) return false;
      if (!purposeTableSearch.trim()) return true;
      const q = purposeTableSearch.toLowerCase().trim();
      return [purpose.purposeName, purpose.pendingAdvance, purpose.billAmount, status].some((val) =>
        String(val ?? '').toLowerCase().includes(q)
      );
    });
  }, [
    purposeData,
    purposeTableSearch,
    selectPurposeNameFilter,
    selectPurposeAdvanceFilter,
    selectPurposeRefundFilter,
    selectPurposeStatusFilter,
  ]);
  const filteredPurposeDetails = useMemo(() => {
    return purposeDetails.filter((detail) => {
      if (selectEmpNameFilter) {
        if (detail.empId !== selectEmpNameFilter.id || detail.empType !== selectEmpNameFilter.type) {
          return false;
        }
      }
      if (!matchesEdbcAmountFilter(detail.pendingAdvance, selectEmpAdvanceFilter)) return false;
      if (!matchesEdbcAmountFilter(detail.billAmount, selectEmpRefundFilter)) return false;
      const status = getStaffStatusLabel(detail.pendingAdvance);
      if (selectEmpStatusFilter && status !== selectEmpStatusFilter) return false;
      if (!empTableSearch.trim()) return true;
      const q = empTableSearch.toLowerCase().trim();
      return [detail.name, detail.pendingAdvance, detail.billAmount, status].some((val) =>
        String(val ?? '').toLowerCase().includes(q)
      );
    });
  }, [
    purposeDetails,
    empTableSearch,
    selectEmpNameFilter,
    selectEmpAdvanceFilter,
    selectEmpRefundFilter,
    selectEmpStatusFilter,
  ]);
  const purposeNameFilterOptions = useMemo(
    () => [...new Set(purposeData.map((p) => p.purposeName))].sort().map((name) => ({ value: name, label: name })),
    [purposeData],
  );
  const empNameFilterOptions = useMemo(
    () => purposeDetails.map((d) => ({
      id: d.empId,
      label: d.name,
      type: d.empType,
    })),
    [purposeDetails],
  );
  const statusFilterOptions = useMemo(
    () => [{ value: 'Pending', label: 'Pending' }, { value: 'Settled', label: 'Settled' }],
    [],
  );
  const purposeTableTotals = useMemo(() => ({
    advance: purposeData.reduce((sum, row) => sum + (parseFloat(row.pendingAdvance) || 0), 0),
    refund: purposeData.reduce((sum, row) => sum + (parseFloat(row.billAmount) || 0), 0),
  }), [purposeData]);
  const empTableTotals = useMemo(() => ({
    advance: purposeDetails.reduce((sum, row) => sum + (parseFloat(row.pendingAdvance) || 0), 0),
    refund: purposeDetails.reduce((sum, row) => sum + (parseFloat(row.billAmount) || 0), 0),
  }), [purposeDetails]);
  const hasPurposeColumnFilters = Boolean(
    selectPurposeNameFilter ||
    selectPurposeAdvanceFilter.trim() ||
    selectPurposeRefundFilter.trim() ||
    selectPurposeStatusFilter
  );
  const hasEmpColumnFilters = Boolean(
    selectEmpNameFilter ||
    selectEmpAdvanceFilter.trim() ||
    selectEmpRefundFilter.trim() ||
    selectEmpStatusFilter
  );
  const clearPurposeTableFilters = useCallback(() => {
    setSelectedEmpOption('');
    sessionStorage.removeItem('selectedEmpOption');
    setPurposeTableSearch('');
    setSelectPurposeNameFilter('');
    setSelectPurposeAdvanceFilter('');
    setSelectPurposeRefundFilter('');
    setSelectPurposeStatusFilter('');
    setSortConfig({ key: null, direction: 'asc' });
  }, []);
  const clearEmpTableFilters = useCallback(() => {
    setSelectedPurposeOption('');
    localStorage.removeItem('staffPurpose');
    setEmpTableSearch('');
    setSelectEmpNameFilter(null);
    setSelectEmpAdvanceFilter('');
    setSelectEmpRefundFilter('');
    setSelectEmpStatusFilter('');
    setPurposeSortConfig({ key: null, direction: 'asc' });
  }, []);
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
  const handleEmpFilterChipsMouseDown = (e) => {
    if (!empFilterChipsScrollRef.current || e.target.closest('button')) return;
    empIsFilterChipsDragging.current = true;
    empFilterChipsDragStart.current = {
      x: e.clientX,
      scrollLeft: empFilterChipsScrollRef.current.scrollLeft,
    };
    empFilterChipsScrollRef.current.style.cursor = 'grabbing';
    empFilterChipsScrollRef.current.style.userSelect = 'none';
  };
  const handleEmpFilterChipsMouseMove = (e) => {
    if (!empIsFilterChipsDragging.current || !empFilterChipsScrollRef.current) return;
    e.preventDefault();
    const dx = e.clientX - empFilterChipsDragStart.current.x;
    empFilterChipsScrollRef.current.scrollLeft =
      empFilterChipsDragStart.current.scrollLeft - dx;
  };
  const handleEmpFilterChipsMouseUp = () => {
    if (!empFilterChipsScrollRef.current) return;
    empIsFilterChipsDragging.current = false;
    empFilterChipsScrollRef.current.style.cursor = 'grab';
    empFilterChipsScrollRef.current.style.userSelect = '';
  };
  const togglePurposeFilters = useCallback(() => {
    const willOpen = !showPurposeFilters;
    const scroller = purposeScrollRef.current;
    if (willOpen) {
      setShowPurposeFilters(true);
      if (!scroller) return;
      if (scroller.scrollTop <= 0) return;
      if (purposeFilterNudgeUsedRef.current) return;
      purposeFilterNudgeUsedRef.current = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const h = purposeFilterRowRef.current?.offsetHeight || 0;
          if (h > 0) {
            scroller.scrollTop = Math.max(0, scroller.scrollTop - h);
          }
        });
      });
      return;
    }
    const h = purposeFilterRowRef.current?.offsetHeight || 0;
    setShowPurposeFilters(false);
    if (!scroller || h <= 0 || !purposeFilterNudgeUsedRef.current) return;
    purposeFilterNudgeUsedRef.current = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scroller.scrollTop = scroller.scrollTop + h;
      });
    });
  }, [showPurposeFilters, purposeScrollRef]);
  const toggleEmpFilters = useCallback(() => {
    const willOpen = !showEmpFilters;
    const scroller = empScrollRef.current;
    if (willOpen) {
      setShowEmpFilters(true);
      if (!scroller) return;
      if (scroller.scrollTop <= 0) return;
      if (empFilterNudgeUsedRef.current) return;
      empFilterNudgeUsedRef.current = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const h = empFilterRowRef.current?.offsetHeight || 0;
          if (h > 0) {
            scroller.scrollTop = Math.max(0, scroller.scrollTop - h);
          }
        });
      });
      return;
    }
    const h = empFilterRowRef.current?.offsetHeight || 0;
    setShowEmpFilters(false);
    if (!scroller || h <= 0 || !empFilterNudgeUsedRef.current) return;
    empFilterNudgeUsedRef.current = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scroller.scrollTop = scroller.scrollTop + h;
      });
    });
  }, [showEmpFilters, empScrollRef]);
  // Get refund details for tooltip
  const getRefundDetails = (purposeId, empId, empType) => {
    if (!staffData.length) return [];
    const resolvePersonName = (item) => {
      if (item.employee_id) {
        return empOptions.find((e) => e.id === item.employee_id)?.label || item.employee_name || item.emp_name || '-';
      }
      if (item.labour_id) {
        return laboursList.find((l) => l.id === item.labour_id)?.label || item.labour_name || '-';
      }
      return '-';
    };
    const resolvePurposeName = (pid) =>
      purposeOptions.find((p) => String(p.id) === String(pid))?.label || '-';

    return staffData.filter(item => {
      const fromPurposeId = item.from_purpose_id || item.purpose_id;
      const matchesPurpose = purposeId ? fromPurposeId === purposeId : true;
      const matchesEmp = empId
        ? empType === 'Employee'
          ? item.employee_id === empId
          : empType === 'Labour'
            ? item.labour_id === empId
            : item.employee_id === empId || item.labour_id === empId
        : true;
      if (!matchesPurpose || !matchesEmp) return false;
      const refundAmt = parseFloat(item.staff_refund_amount) || 0;
      const amount = parseFloat(item.amount) || 0;
      if (item.type === 'Refund' && refundAmt > 0) {
        return true;
      }
      if (item.type === 'Transfer' && amount < 0) {
        return true;
      }
      return false;
    }).map(item => ({
      date: new Date(item.date).toLocaleDateString('en-GB'),
      amount: item.type === 'Transfer' ? parseFloat(item.amount) || 0 : parseFloat(item.staff_refund_amount) || 0,
      type: item.type === 'Transfer' ? 'Transfer' : 'Refund',
      personName: resolvePersonName(item),
      purposeName: resolvePurposeName(item.from_purpose_id || item.purpose_id),
      transferPurposeName: item.to_purpose_id ? resolvePurposeName(item.to_purpose_id) : null,
      isRefund: true,
      staffAdvancePortalId: item.staffAdvancePortalId || item.id || 0,
    }));
  };
  // Get advance details for tooltip
  const getAdvanceDetails = (purposeId, empId, empType) => {
    if (!staffData.length) return [];
    const resolvePersonName = (item) => {
      if (item.employee_id) {
        return empOptions.find((e) => e.id === item.employee_id)?.label || item.employee_name || item.emp_name || '-';
      }
      if (item.labour_id) {
        return laboursList.find((l) => l.id === item.labour_id)?.label || item.labour_name || '-';
      }
      return '-';
    };
    const resolvePurposeName = (pid) =>
      purposeOptions.find((p) => String(p.id) === String(pid))?.label || '-';

    return staffData.filter(item => {
      const fromPurposeId = item.from_purpose_id || item.purpose_id;
      const matchesPurpose = purposeId ? fromPurposeId === purposeId : true;
      const matchesEmp = empId
        ? empType === 'Employee'
          ? item.employee_id === empId
          : empType === 'Labour'
            ? item.labour_id === empId
            : item.employee_id === empId || item.labour_id === empId
        : true;
      if (!matchesPurpose || !matchesEmp) return false;
      const amount = parseFloat(item.amount) || 0;
      if (item.type === 'Advance' && amount > 0) {
        return true;
      }
      if (item.type === 'Transfer' && amount > 0) {
        return true;
      }
      return false;
    }).map(item => ({
      date: new Date(item.date).toLocaleDateString('en-GB'),
      amount: parseFloat(item.amount) || 0,
      type: item.type === 'Transfer' ? 'Transfer' : 'Advance',
      personName: resolvePersonName(item),
      purposeName: resolvePurposeName(item.from_purpose_id || item.purpose_id),
      transferPurposeName: item.to_purpose_id ? resolvePurposeName(item.to_purpose_id) : null,
      isRefund: false,
      staffAdvancePortalId: item.staffAdvancePortalId || item.id || 0,
    }));
  };
  // Tooltip handlers
  const handleMouseEnter = (event, purposeId, empId, empType, table = 'purpose') => {
    const refundDetails = getRefundDetails(purposeId, empId, empType);
    if (refundDetails.length > 0) {
      setTooltipTitle('Refund Details');
      setTooltipData(refundDetails);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
      setTooltipTable(table);
    }
  };
  const handleMouseLeave = () => {
    setTooltipData(null);
    setTooltipTitle("");
  };
  const handleMouseEnterAdvance = (event, purposeId, empId, empType, table = 'purpose') => {
    const advanceDetails = getAdvanceDetails(purposeId, empId, empType);
    if (advanceDetails.length > 0) {
      setTooltipTitle('Advance Details');
      setTooltipData(advanceDetails);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
      setTooltipTable(table);
    }
  };
  const resolveSummaryEmployeeLabel = ({ empId, empType, selectedEmp }) => {
    if (selectedEmp?.label) return selectedEmp.label;
    if (empId) {
      if (empType === 'Labour') {
        return laboursList.find((l) => l.id === empId)?.label || '-';
      }
      return empOptions.find((e) => e.id === empId)?.label || '-';
    }
    return 'All Employees';
  };
  const resolveSummaryPurposeLabel = ({ purposeId, selectedPurpose, purposeName }) => {
    if (purposeName) return purposeName;
    if (selectedPurpose?.label) return selectedPurpose.label;
    if (purposeId) {
      return purposeOptions.find((p) => String(p.id) === String(purposeId))?.label || '-';
    }
    return 'All Purposes';
  };
  const buildPurposeTablePopupContext = ({
    empId,
    empType,
    purposeId,
    purposeName,
  }) => ({
    line1: resolveSummaryEmployeeLabel({
      empId,
      empType,
      selectedEmp: selectedEmpOption,
    }),
    line2: resolveSummaryPurposeLabel({
      purposeId,
      selectedPurpose: null,
      purposeName,
    }),
  });
  const buildEmployeeTablePopupContext = ({
    purposeId,
    empName,
  }) => ({
    line1: resolveSummaryPurposeLabel({
      purposeId,
      selectedPurpose: selectedPurposeOption,
      purposeName: null,
    }),
    line2: empName || '-',
  });
  const handlePurposeAdvanceClick = (purposeId, empId, empType, purposeName) => {
    const advanceDetails = getAdvanceDetails(purposeId, empId, empType);
    if (advanceDetails.length > 0) {
      setPurposePopupTitle('Advance Details');
      setPurposePopupData(advanceDetails);
      setPurposePopupContext(buildPurposeTablePopupContext({
        empId,
        empType,
        purposeId,
        purposeName,
      }));
      setShowPurposePopup(true);
    }
  };
  const handlePurposeRefundClick = (purposeId, empId, empType, purposeName) => {
    const refundDetails = getRefundDetails(purposeId, empId, empType);
    if (refundDetails.length > 0) {
      setPurposePopupTitle('Refund Details');
      setPurposePopupData(refundDetails);
      setPurposePopupContext(buildPurposeTablePopupContext({
        empId,
        empType,
        purposeId,
        purposeName,
      }));
      setShowPurposePopup(true);
    }
  };
  const handleEmpAdvanceClick = (purposeId, empId, empType, empName) => {
    const advanceDetails = getAdvanceDetails(purposeId, empId, empType);
    if (advanceDetails.length > 0) {
      setEmpPopupTitle('Advance Details');
      setEmpPopupData(advanceDetails);
      setEmpPopupContext(buildEmployeeTablePopupContext({
        purposeId,
        empName,
      }));
      setShowEmpPopup(true);
    }
  };
  const handleEmpRefundClick = (purposeId, empId, empType, empName) => {
    const refundDetails = getRefundDetails(purposeId, empId, empType);
    if (refundDetails.length > 0) {
      setEmpPopupTitle('Refund Details');
      setEmpPopupData(refundDetails);
      setEmpPopupContext(buildEmployeeTablePopupContext({
        purposeId,
        empName,
      }));
      setShowEmpPopup(true);
    }
  };
  const handlePurposeStatusClick = (purposeId, empId, empType, purposeName) => {
    const advanceDetails = getAdvanceDetails(purposeId, empId, empType);
    const refundDetails = getRefundDetails(purposeId, empId, empType);
    setStatusPopupData({ advances: advanceDetails, refunds: refundDetails });
    setStatusPopupContext(buildPurposeTablePopupContext({
      empId,
      empType,
      purposeId,
      purposeName,
    }));
    setIsStatusFromPurposeTable(true);
    setShowStatusPopup(true);
  };
  const handleEmpStatusClick = (purposeId, empId, empType, empName) => {
    const advanceDetails = getAdvanceDetails(purposeId, empId, empType);
    const refundDetails = getRefundDetails(purposeId, empId, empType);
    setStatusPopupData({ advances: advanceDetails, refunds: refundDetails });
    setStatusPopupContext(buildEmployeeTablePopupContext({
      purposeId,
      empName,
    }));
    setIsStatusFromPurposeTable(false);
    setShowStatusPopup(true);
  };
  const handlePurposePopupSort = (key) => {
    const resolvedKey = key === 'vendor'
      ? (selectedEmpOption ? 'transferPurposeName' : 'personName')
      : key;
    let direction = 'asc';
    if (purposePopupSortConfig.key === resolvedKey && purposePopupSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setPurposePopupSortConfig({ key: resolvedKey, direction });
  };
  const handleEmpPopupSort = (key) => {
    const resolvedKey = key === 'vendor'
      ? (selectedPurposeOption ? 'transferPurposeName' : 'purposeName')
      : key;
    let direction = 'asc';
    if (empPopupSortConfig.key === resolvedKey && empPopupSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setEmpPopupSortConfig({ key: resolvedKey, direction });
  };
  const handleStatusPopupSort = (key) => {
    const resolvedKey = key === 'vendor'
      ? (isStatusFromPurposeTable
        ? (selectedEmpOption ? 'transferPurposeName' : 'personName')
        : (selectedPurposeOption ? 'transferPurposeName' : 'purposeName'))
      : key;
    let direction = 'asc';
    if (statusPopupSortConfig.key === resolvedKey && statusPopupSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setStatusPopupSortConfig({ key: resolvedKey, direction });
  };
  const sortPopupData = (data, config) => {
    if (!data || data.length === 0) return [];
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`);
    };
    if (!config.key) {
      return [...data].sort((a, b) => parseDate(b.date) - parseDate(a.date));
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
  const buildStatusCombinedData = (advances, refunds, sortConfig) => {
    const combinedData = [];
    const dateMap = new Map();
    advances.forEach((adv) => {
      const key = `${adv.date}-${adv.staffAdvancePortalId}-advance`;
      dateMap.set(key, {
        date: adv.date,
        staffAdvancePortalId: adv.staffAdvancePortalId,
        advanceAmount: adv.amount,
        refundAmount: 0,
        personName: adv.personName,
        purposeName: adv.purposeName,
        transferPurposeName: adv.transferPurposeName,
        type: adv.type,
        isRefund: adv.isRefund,
      });
    });
    refunds.forEach((ref) => {
      const key = `${ref.date}-${ref.staffAdvancePortalId}-refund`;
      dateMap.set(key, {
        date: ref.date,
        staffAdvancePortalId: ref.staffAdvancePortalId,
        advanceAmount: 0,
        refundAmount: ref.amount,
        personName: ref.personName,
        purposeName: ref.purposeName,
        transferPurposeName: ref.transferPurposeName,
        type: ref.type,
        isRefund: ref.isRefund,
      });
    });
    combinedData.push(...Array.from(dateMap.values()));
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`);
    };
    if (!sortConfig.key) {
      combinedData.sort((a, b) => {
        const dateDiff = parseDate(b.date) - parseDate(a.date);
        if (dateDiff !== 0) return dateDiff;
        return b.staffAdvancePortalId - a.staffAdvancePortalId;
      });
    } else {
      combinedData.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (sortConfig.key === 'date') {
          aValue = parseDate(aValue);
          bValue = parseDate(bValue);
          const primarySort = sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
          if (primarySort !== 0) return primarySort;
          return sortConfig.direction === 'asc' ? a.staffAdvancePortalId - b.staffAdvancePortalId : b.staffAdvancePortalId - a.staffAdvancePortalId;
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          const primarySort = sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
          if (primarySort !== 0) return primarySort;
          return a.staffAdvancePortalId - b.staffAdvancePortalId;
        }
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return a.staffAdvancePortalId - b.staffAdvancePortalId;
      });
    }
    return combinedData;
  };
  const writeSummaryPopupContextToPdf = (doc, context, subtitle, subtitleY = 29, tableStartY = 35) => {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(context.line1 || '', 14, 15);
    doc.text(context.line2 || '', 14, 22);
    doc.setFontSize(10);
    doc.text(subtitle, 14, subtitleY);
    return tableStartY;
  };
  const exportPopupPDF = (data, title, context, isPurposePopup) => {
    const doc = new jsPDF();
    const contextText = formatSummaryPopupContextText(context);
    const tableStartY = writeSummaryPopupContextToPdf(doc, context, title);
    const tableColumn = isPurposePopup && selectedEmpOption
      ? ['Date', 'Transfer', 'Amount']
      : isPurposePopup
        ? ['Date', 'Employee', 'Amount']
        : selectedPurposeOption
          ? ['Date', 'Transfer', 'Amount']
          : ['Date', 'Purpose', 'Amount'];
    const tableRows = [];
    data.forEach((entry) => {
      const row = [entry.date];
      if (isPurposePopup && selectedEmpOption) {
        let transferInfo = '';
        if (entry.isRefund) {
          transferInfo = 'Refund';
        } else if (entry.type === 'Transfer' && entry.transferPurposeName) {
          transferInfo = `${entry.amount < 0 ? 'To: ' : 'From: '}${entry.transferPurposeName}`;
        }
        row.push(transferInfo);
      } else if (isPurposePopup) {
        row.push(entry.personName || '');
      } else if (selectedPurposeOption) {
        let transferInfo = '';
        if (entry.isRefund) {
          transferInfo = 'Refund';
        } else if (entry.type === 'Transfer' && entry.transferPurposeName) {
          transferInfo = `${entry.amount < 0 ? 'To: ' : 'From: '}${entry.transferPurposeName}`;
        }
        row.push(transferInfo);
      } else {
        row.push(entry.purposeName || '');
      }
      row.push(entry.amount.toLocaleString('en-IN'));
      tableRows.push(row);
    });
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    tableRows.push(['Total', '', total.toLocaleString('en-IN')]);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      startY: tableStartY,
      headStyles: {
        fillColor: [255, 255, 255],
        lineWidth: 0.2,
        lineColor: [100, 100, 100],
        fontStyle: 'bold',
      },
      styles: {
        textColor: 0,
        lineWidth: 0.2,
        lineColor: [100, 100, 100],
      },
      columnStyles: {
        2: { halign: 'right' },
      },
      didParseCell(data) {
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [255, 255, 255];
        }
      },
    });
    doc.save(`${contextText.replace(/[^a-z0-9]/gi, '_')}_${title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
  };
  const exportPopupCSV = (data, title, context, isPurposePopup) => {
    const contextText = formatSummaryPopupContextText(context);
    const extraRow = [[contextText], [title], []];
    const headers = isPurposePopup && selectedEmpOption
      ? ['Date', 'Transfer', 'Amount']
      : isPurposePopup
        ? ['Date', 'Employee', 'Amount']
        : selectedPurposeOption
          ? ['Date', 'Transfer', 'Amount']
          : ['Date', 'Purpose', 'Amount'];
    const rows = data.map((entry) => {
      const row = [entry.date];
      if (isPurposePopup && selectedEmpOption) {
        let transferInfo = '';
        if (entry.isRefund) transferInfo = 'Refund';
        else if (entry.type === 'Transfer' && entry.transferPurposeName) {
          transferInfo = `${entry.amount < 0 ? 'To: ' : 'From: '}${entry.transferPurposeName}`;
        }
        row.push(transferInfo);
      } else if (isPurposePopup) {
        row.push(entry.personName || '');
      } else if (selectedPurposeOption) {
        let transferInfo = '';
        if (entry.isRefund) transferInfo = 'Refund';
        else if (entry.type === 'Transfer' && entry.transferPurposeName) {
          transferInfo = `${entry.amount < 0 ? 'To: ' : 'From: '}${entry.transferPurposeName}`;
        }
        row.push(transferInfo);
      } else {
        row.push(entry.purposeName || '');
      }
      row.push(entry.amount.toLocaleString('en-IN'));
      return row;
    });
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    rows.push(['Total', '', total.toLocaleString('en-IN')]);
    const csvContent = [...extraRow, headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${contextText.replace(/[^a-z0-9]/gi, '_')}_${title.replace(/[^a-z0-9]/gi, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const exportStatusPDF = () => {
    const doc = new jsPDF();
    const contextText = formatSummaryPopupContextText(statusPopupContext);
    const tableStartY = writeSummaryPopupContextToPdf(doc, statusPopupContext, 'Status Details');
    const tableColumn = ['Date'];
    if (isStatusFromPurposeTable && !selectedEmpOption) {
      tableColumn.push('Employee');
    } else if (!isStatusFromPurposeTable && !selectedPurposeOption) {
      tableColumn.push('Purpose');
    } else {
      tableColumn.push('Transfer');
    }
    tableColumn.push('Advance', 'Refund');
    const combinedData = buildStatusCombinedData(
      statusPopupData.advances,
      statusPopupData.refunds,
      statusPopupSortConfig
    );
    const tableRows = combinedData.map((entry) => {
      const row = [entry.date];
      if (isStatusFromPurposeTable && !selectedEmpOption) {
        row.push(entry.personName || '-');
      } else if (!isStatusFromPurposeTable && !selectedPurposeOption) {
        row.push(entry.purposeName || '-');
      } else {
        let transferInfo = '-';
        if (entry.isRefund) transferInfo = 'Refund';
        else if (entry.type === 'Transfer' && entry.transferPurposeName) {
          transferInfo = `${entry.advanceAmount < 0 ? 'To: ' : 'From: '}${entry.transferPurposeName}`;
        }
        row.push(transferInfo);
      }
      row.push(
        entry.advanceAmount !== 0 ? entry.advanceAmount.toLocaleString('en-IN') : '-',
        entry.refundAmount !== 0 ? entry.refundAmount.toLocaleString('en-IN') : '-'
      );
      return row;
    });
    const totalAdvance = statusPopupData.advances.reduce((sum, item) => sum + item.amount, 0);
    const totalRefund = statusPopupData.refunds.reduce((sum, item) => sum + item.amount, 0);
    tableRows.push(['Total', '', totalAdvance.toLocaleString('en-IN'), totalRefund.toLocaleString('en-IN')]);
    tableRows.push(['Balance Advance', '', '', (totalAdvance - totalRefund).toLocaleString('en-IN')]);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      startY: tableStartY,
      headStyles: {
        fillColor: [255, 255, 255],
        lineWidth: 0.2,
        lineColor: [100, 100, 100],
        fontStyle: 'bold',
      },
      styles: {
        textColor: 0,
        lineWidth: 0.2,
        lineColor: [100, 100, 100],
      },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right' },
      },
    });
    doc.save(`${contextText.replace(/[^a-z0-9]/gi, '_')}_Status_Details.pdf`);
  };
  const exportStatusCSV = () => {
    const contextText = formatSummaryPopupContextText(statusPopupContext);
    const extraRow = [[contextText], ['Status Details'], []];
    const headers = ['Date'];
    if (isStatusFromPurposeTable && !selectedEmpOption) headers.push('Employee');
    else if (!isStatusFromPurposeTable && !selectedPurposeOption) headers.push('Purpose');
    else headers.push('Transfer');
    headers.push('Advance', 'Refund');
    const combinedData = buildStatusCombinedData(
      statusPopupData.advances,
      statusPopupData.refunds,
      statusPopupSortConfig
    );
    const rows = combinedData.map((entry) => {
      const row = [entry.date];
      if (isStatusFromPurposeTable && !selectedEmpOption) {
        row.push(entry.personName || '-');
      } else if (!isStatusFromPurposeTable && !selectedPurposeOption) {
        row.push(entry.purposeName || '-');
      } else {
        let transferInfo = '-';
        if (entry.isRefund) transferInfo = 'Refund';
        else if (entry.type === 'Transfer' && entry.transferPurposeName) {
          transferInfo = `${entry.advanceAmount < 0 ? 'To: ' : 'From: '}${entry.transferPurposeName}`;
        }
        row.push(transferInfo);
      }
      row.push(
        entry.advanceAmount !== 0 ? entry.advanceAmount.toLocaleString('en-IN') : '-',
        entry.refundAmount !== 0 ? entry.refundAmount.toLocaleString('en-IN') : '-'
      );
      return row;
    });
    const totalAdvance = statusPopupData.advances.reduce((sum, item) => sum + item.amount, 0);
    const totalRefund = statusPopupData.refunds.reduce((sum, item) => sum + item.amount, 0);
    rows.push(['Total', '', totalAdvance.toLocaleString('en-IN'), totalRefund.toLocaleString('en-IN')]);
    rows.push(['Balance Advance', '', '', (totalAdvance - totalRefund).toLocaleString('en-IN')]);
    const csvContent = [...extraRow, headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${contextText.replace(/[^a-z0-9]/gi, '_')}_Status_Details.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const purposePopupEdbcSortField =
    purposePopupSortConfig.key === 'personName' || purposePopupSortConfig.key === 'transferPurposeName'
      ? 'vendor'
      : purposePopupSortConfig.key;
  const empPopupEdbcSortField =
    empPopupSortConfig.key === 'purposeName' || empPopupSortConfig.key === 'transferPurposeName'
      ? 'vendor'
      : empPopupSortConfig.key;
  const statusPopupEdbcSortField =
    statusPopupSortConfig.key === 'personName' || statusPopupSortConfig.key === 'transferPurposeName' || statusPopupSortConfig.key === 'purposeName'
      ? 'vendor'
      : statusPopupSortConfig.key;
  const statusPopupTableClass = isStatusFromPurposeTable
    ? SUMMARY_STATUS_LEFT_POPUP_TABLE_CLASS
    : SUMMARY_STATUS_RIGHT_POPUP_TABLE_CLASS;
  const renderPopupSecondColumn = (entry, isPurposePopup) => {
    if (isPurposePopup) {
      if (!selectedEmpOption) return entry.personName || '-';
      if (entry.isRefund) return <div className="text-xs text-gray-500">Refund</div>;
      if (entry.type === 'Transfer' && selectedEmpOption) {
        return (
          <div className="text-xs text-gray-500">
            {entry.amount < 0 ? 'Transfer To: ' : 'Transfer From: '}
            {entry.transferPurposeName || '-'}
          </div>
        );
      }
      return null;
    }
    if (!selectedPurposeOption) return entry.purposeName || '-';
    if (entry.isRefund) return <div className="text-xs text-gray-500">Refund</div>;
    if (entry.type === 'Transfer' && selectedPurposeOption) {
      return (
        <div className="text-xs text-gray-500">
          {entry.amount < 0 ? 'Transfer To: ' : 'Transfer From: '}
          {entry.transferPurposeName || '-'}
        </div>
      );
    }
    return null;
  };
  const renderStatusSecondColumn = (entry) => {
    if (isStatusFromPurposeTable) {
      if (!selectedEmpOption) return entry.personName || '-';
      if (entry.isRefund) return <div className="text-xs text-gray-500">Refund</div>;
      if (entry.type === 'Transfer' && entry.transferPurposeName) {
        return (
          <div className="text-xs text-gray-500">
            {entry.advanceAmount < 0 ? 'To: ' : 'From: '}
            {entry.transferPurposeName}
          </div>
        );
      }
      return '-';
    }
    if (!selectedPurposeOption) return entry.purposeName || '-';
    if (entry.isRefund) return <div className="text-xs text-gray-500">Refund</div>;
    if (entry.type === 'Transfer' && entry.transferPurposeName) {
      return (
        <div className="text-xs text-gray-500">
          {entry.advanceAmount < 0 ? 'To: ' : 'From: '}
          {entry.transferPurposeName}
        </div>
      );
    }
    return '-';
  };
  useEffect(() => {
    const purposeId = selectedPurposeOption?.id;
    const filtered = selectedPurposeOption
      ? staffData.filter(item => {
        // Check for purpose match - try different possible field names
        return item.from_purpose_id === purposeId ||
          item.purpose_id === purposeId ||
          item.purpose === selectedPurposeOption.value;
      })
      : staffData;
    const grouped = {};
    let totalPending = 0;
    let totalRefund = 0;
    filtered.forEach(curr => {
        const {
          employee_id,
          labour_id,
          from_purpose_id,
          to_purpose_id,
          amount = 0,
          staff_refund_amount = 0
        } = curr;

        // Determine the ID and name based on whether it's an employee or labour
        let personId, personName;
        if (employee_id) {
          personId = employee_id;
          personName = empOptions.find(e => e.id === employee_id)?.label || "-";
        } else if (labour_id) {
          personId = labour_id;
          personName = laboursList.find(l => l.id === labour_id)?.label || "-";
        } else {
          return; // Skip if neither employee_id nor labour_id is present
        }

        if (!grouped[personId]) {
          grouped[personId] = {
            name: personName,
            empId: personId,
            empType: employee_id ? "Employee" : "Labour",
            totalAdvance: 0,
            totalRefund: 0
          };
        }
        // Handle Transfer type transactions
        if (curr.type === 'Transfer') {
          // For transfer records, check if this purpose is the from_purpose_id
          // The amount field already contains the correct sign
          if (!selectedPurposeOption || from_purpose_id === purposeId) {
            grouped[personId].totalAdvance += parseFloat(amount) || 0; // Amount already has correct sign
          }
        } else {
          // Handle non-transfer transactions (Advance and Refund)
          // For advance entries, amount is positive
          if (curr.type === 'Advance') {
            grouped[personId].totalAdvance += parseFloat(amount) || 0;
          }
          // For refund entries, subtract the refund amount
          if (curr.type === 'Refund') {
            grouped[personId].totalRefund += parseFloat(staff_refund_amount) || 0;
          }
        }
      });
      const detailsArray = Object.values(grouped)
        .filter(d => d.totalAdvance !== 0 || d.totalRefund !== 0)
        .map(d => {
        const pending = d.totalAdvance - d.totalRefund;
        totalPending += pending;
        totalRefund += d.totalRefund;
        return {
          name: d.name,
          empId: d.empId,
          empType: d.empType,
          pendingAdvance: pending,
          billAmount: d.totalRefund // Show refund amount
        };
      });
      setPurposeDetails(detailsArray);
      setPurposePendingAdvance(totalPending);
      setPurposeBillAmount(totalRefund); // Show total refund amount
  }, [selectedPurposeOption, staffData, empOptions, laboursList]);
  const exportPDF = () => {
    const doc = new jsPDF();
    if (selectedEmpOption) {
      const { label } = selectedEmpOption;
      const titleText = `Employee - ${label}`;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(titleText, 14, 15);
    }
    const tableColumn = ["Purpose", "Pending Advance", "Refund Amount", "Status"];
    const tableRows = [];
    purposeData.forEach(purpose => {
      const status = purpose.pendingAdvance > 0 ? "Pending" : "Settled";
      tableRows.push([
        purpose.purposeName,
        purpose.pendingAdvance.toLocaleString("en-IN"),
        purpose.billAmount.toLocaleString("en-IN"),
        status
      ]);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      startY: selectedEmpOption ? 20 : 10,
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
      }
    });

    doc.save("Staff_Report.pdf");
  };

  const exportCSV = () => {
    let extraRow = [];

    if (selectedEmpOption) {
      const { label } = selectedEmpOption;
      extraRow = [[`Employee - ${label}`]];
    }

    const headers = ["Purpose", "Pending Advance", "Refund Amount", "Status"];
    const rows = purposeData.map(purpose => [
      purpose.purposeName,
      purpose.pendingAdvance,
      purpose.billAmount,
      purpose.pendingAdvance > 0 ? "Pending" : "Settled"
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
      + [...extraRow, headers, ...rows]
        .map(e => e.join(","))
        .join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "Staff_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPurposePDF = () => {
    const doc = new jsPDF();

    if (selectedPurposeOption) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Purpose - ${selectedPurposeOption.label}`, 14, 15);
    }

    const tableColumn = ["Employee Name", "Pending Advance", "Refund Amount", "Status"];
    const tableRows = [];

    purposeDetails.forEach(d => {
      const status = d.pendingAdvance > 0 ? "Pending" : "Settled";
      tableRows.push([
        d.name,
        d.pendingAdvance.toLocaleString("en-IN"),
        d.billAmount.toLocaleString("en-IN"),
        status
      ]);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      startY: selectedPurposeOption ? 20 : 10,
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
      }
    });

    doc.save("Purpose_Report.pdf");
  };

  const exportPurposeCSV = () => {
    let extraRow = [];

    if (selectedPurposeOption) {
      extraRow = [[`Purpose - ${selectedPurposeOption.label}`]];
    }

    const headers = ["Employee Name", "Pending Advance", "Refund Amount", "Status"];
    const rows = purposeDetails.map(d => [
      d.name,
      d.pendingAdvance,
      d.billAmount,
      d.pendingAdvance > 0 ? "Pending" : "Settled"
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
      + [...extraRow, headers, ...rows]
        .map(e => e.join(","))
        .join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "Purpose_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-104px)] overflow-hidden bg-[#FAF6ED]">
      <div className="p-[18px] flex flex-col flex-1 min-h-0 overflow-hidden bg-[#FAF6ED]">
        <div className="flex flex-col xl:flex-row gap-[18px] flex-1 min-h-0 max-h-full overflow-visible px-[24px] py-[24px] items-stretch bg-white">
          {/* Employee Section */}
          <div className={`flex flex-col flex-1 min-w-0 min-h-0 max-h-full overflow-hidden bg-white rounded-[6px] max-w-[696px] ${SUMMARY_PANEL_SHADOW} px-[24px] py-[24px]`}>
            <div className="w-full min-w-0 flex flex-col flex-1 min-h-0 max-h-full">
              <div className="flex flex-wrap justify-between items-start gap-[12px] mb-[18px] shrink-0 w-full">
                <div className="text-left max-w-[220px]">
                  <label className="block font-semibold mb-[8px]">Employee Name</label>
                  <Select
                    options={staffAdvanceCombinedOptions}
                    value={selectedEmpOption}
                    onChange={(selectedOption) => {
                      setSelectedEmpOption(selectedOption);
                    }}
                    placeholder="Employee Name"
                    className={SUMMARY_OUTSIDE_SELECT_CLASS}
                    isClearable
                    menuPortalTarget={document.body}
                    styles={summaryOutsideSelectStyles}
                  />
                </div>
                <div className="rounded-md px-4 py-[8px] mt-[8px] text-sm shrink-0" style={SUMMARY_BOX_STYLE}>
                  <div className="flex justify-between text-[14px] gap-6 py-0.5">
                    <span className="flex shrink-0 w-[130px] text-black font-semibold">
                      <span className="whitespace-nowrap">Pending Advance</span>
                      <span className="ml-auto">:</span>
                    </span>
                    <span className="font-semibold" style={{ color: '#E4572E' }}>
                      {formatSummaryAmount(totalPendingAdvance)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[14px] gap-6 py-0.5">
                    <span className="flex shrink-0 w-[130px] text-black font-semibold">
                      <span className="whitespace-nowrap">Total Refund</span>
                      <span className="ml-auto">:</span>
                    </span>
                    <span className="font-semibold" style={{ color: '#E4572E' }}>
                      {formatSummaryAmount(totalBillAmount)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 px-[18px] pt-[18px] flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="flex min-w-0 w-[600px] max-w-full flex-nowrap items-end gap-[6px] mb-[9px] shrink-0">
                  <div className={`flex min-w-0 items-center overflow-hidden gap-[6px]${hasPurposeColumnFilters ? ' flex-1 min-w-0' : ' shrink-0'}`}>
                    <EdbcFilterToggleButton onClick={togglePurposeFilters} />
                    {hasPurposeColumnFilters && (
                      <div
                        ref={purposeFilterChipsScrollRef}
                        onMouseDown={handlePurposeFilterChipsMouseDown}
                        onMouseMove={handlePurposeFilterChipsMouseMove}
                        onMouseUp={handlePurposeFilterChipsMouseUp}
                        onMouseLeave={handlePurposeFilterChipsMouseUp}
                        className="flex min-w-0 flex-1 overflow-x-auto flex-nowrap gap-2 no-scrollbar scrollbar-none cursor-grab select-none"
                      >
                        {selectPurposeNameFilter && (
                          <SummaryFilterChip
                            label="Purpose"
                            value={selectPurposeNameFilter}
                            onClear={() => setSelectPurposeNameFilter('')}
                          />
                        )}
                        {selectPurposeAdvanceFilter.trim() && (
                          <SummaryFilterChip
                            label="Advance"
                            value={selectPurposeAdvanceFilter}
                            onClear={() => setSelectPurposeAdvanceFilter('')}
                          />
                        )}
                        {selectPurposeRefundFilter.trim() && (
                          <SummaryFilterChip
                            label="Refund"
                            value={selectPurposeRefundFilter}
                            onClear={() => setSelectPurposeRefundFilter('')}
                          />
                        )}
                        {selectPurposeStatusFilter && (
                          <SummaryFilterChip
                            label="Status"
                            value={selectPurposeStatusFilter}
                            onClear={() => setSelectPurposeStatusFilter('')}
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="ml-auto flex items-end gap-[6px] shrink-0">
                    <EdbcTableToolbarRightActions
                      onClearFilters={clearPurposeTableFilters}
                      overallSearch={purposeTableSearch}
                      onOverallSearchChange={setPurposeTableSearch}
                      showExportIcons={false}
                      clearButtonType="button"
                      wrapperClassName={null}
                      searchWrapperClassName="h-[34px] min-w-0 flex-1 max-w-[286px] border border-[#D6D6D6] rounded-md bg-white flex items-center px-2 sm:w-[286px] sm:min-w-[286px] sm:flex-none sm:shrink-0"
                    />
                    <SummaryTableExportActions onExportPdf={exportPDF} onExportCsv={exportCSV} />
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden pb-[18px] flex flex-col">
                  <div
                    ref={purposeTableScroll.scrollRef}
                    className="rounded-lg border-l-8 border-l-[#BF9853] flex-1 min-h-0 overflow-y-auto overflow-x-auto no-scrollbar scrollbar-none w-full"
                    onMouseDown={purposeTableScroll.handleMouseDown}
                  >
                    <table className={`${SUMMARY_PURPOSE_TABLE_CLASS} ${showPurposeFilters ? '[&_thead_tr:first-child_th]:!border-b-0' : ''}`}>
                      <thead className="sticky top-0 z-20 bg-white">
                        <EdbcTableHeaderRow>
                          <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC4}
                            label="Purpose"
                            sortField={purposeHeaderSortField}
                            sortDirection={sortConfig.direction}
                            onSort={handlePurposeEdbcSort}
                          />
                          <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC8}
                            label="Advance"
                            sortField={purposeHeaderSortField}
                            sortDirection={sortConfig.direction}
                            onSort={handlePurposeEdbcSort}
                          />
                          <EdbcColumnHeader columnId={EDBC_IDS.EDBC8} label="Refund" />
                          <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC13}
                            label="Status"
                            sortField={purposeHeaderSortField}
                            sortDirection={sortConfig.direction}
                            onSort={handlePurposeEdbcSort}
                          />
                        </EdbcTableHeaderRow>
                        {showPurposeFilters && (
                          <EdbcTableFilterRow ref={purposeFilterRowRef}>
                            <SummaryPurposeNameFilter
                              placeholder="Purpose"
                              options={purposeNameFilterOptions}
                              value={selectPurposeNameFilter}
                              onChange={setSelectPurposeNameFilter}
                            />
                            <EdbcTotalAmountFilter
                              columnId={EDBC_IDS.EDBC8}
                              totalAmount={purposeTableTotals.advance}
                              value={selectPurposeAdvanceFilter}
                              onChange={(e) => setSelectPurposeAdvanceFilter(e.target.value)}
                            />
                            <EdbcTotalAmountFilter
                              columnId={EDBC_IDS.EDBC8}
                              totalAmount={purposeTableTotals.refund}
                              value={selectPurposeRefundFilter}
                              onChange={(e) => setSelectPurposeRefundFilter(e.target.value)}
                            />
                            <SummaryEdbcSelectFilter
                              columnId={EDBC_IDS.EDBC13}
                              placeholder="Status"
                              options={statusFilterOptions}
                              value={selectPurposeStatusFilter}
                              onChange={setSelectPurposeStatusFilter}
                            />
                          </EdbcTableFilterRow>
                        )}
                      </thead>
                      <tbody>
                        {sortData(filteredPurposeData, sortConfig, 'pendingAdvance', 'purposeName').length > 0 ? (
                          sortData(filteredPurposeData, sortConfig, 'pendingAdvance', 'purposeName').map((purpose, idx) => (
                            <EdbcTableBodyRow key={purpose.purposeId ?? idx}>
                              <EdbcExpandableBodyCell
                                columnId={EDBC_IDS.EDBC4}
                                expense={{ id: purpose.purposeId, ...purpose }}
                                rowIndex={idx}
                                expandedCells={purposeExpandedCells}
                                onToggleExpanded={togglePurposeExpandedCell}
                                getDisplayValue={(row) => row.purposeName}
                              />
                              <td
                                id={EDBC_IDS.EDBC8}
                                className={edbc8Config?.tdClass}
                                onMouseEnter={(e) => handleMouseEnterAdvance(e, purpose.purposeId, selectedEmpOption?.id, selectedEmpOption?.type)}
                                onMouseLeave={handleMouseLeave}
                              >
                                <span
                                  onClick={() => handlePurposeAdvanceClick(purpose.purposeId, selectedEmpOption?.id, selectedEmpOption?.type, purpose.purposeName)}
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    togglePurposeExpandedCell(`${purpose.purposeId ?? idx}-amount`);
                                  }}
                                  className={`block w-full cursor-pointer ${purposeExpandedCells[`${purpose.purposeId ?? idx}-amount`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                  title={formatSummaryAmount(purpose.pendingAdvance)}
                                >
                                  {formatSummaryAmount(purpose.pendingAdvance)}
                                </span>
                              </td>
                              <td
                                className={edbc8Config?.tdClass}
                                onMouseEnter={(e) => handleMouseEnter(e, purpose.purposeId, selectedEmpOption?.id, selectedEmpOption?.type)}
                                onMouseLeave={handleMouseLeave}
                              >
                                <span
                                  onClick={() => handlePurposeRefundClick(purpose.purposeId, selectedEmpOption?.id, selectedEmpOption?.type, purpose.purposeName)}
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    togglePurposeExpandedCell(`${purpose.purposeId ?? idx}-bill_amount`);
                                  }}
                                  className={`block w-full cursor-pointer ${purposeExpandedCells[`${purpose.purposeId ?? idx}-bill_amount`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                  title={formatSummaryAmount(purpose.billAmount)}
                                >
                                  {formatSummaryAmount(purpose.billAmount)}
                                </span>
                              </td>
                              {renderStaffStatusBodyCell({
                                pendingAdvance: purpose.pendingAdvance,
                                rowId: purpose.purposeId,
                                rowIndex: idx,
                                expandedCells: purposeExpandedCells,
                                onToggleExpanded: togglePurposeExpandedCell,
                                onClick: () => handlePurposeStatusClick(
                                  purpose.purposeId,
                                  selectedEmpOption?.id,
                                  selectedEmpOption?.type,
                                  purpose.purposeName
                                ),
                              })}
                            </EdbcTableBodyRow>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center py-4 text-gray-500 font-semibold">No Entry is available</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Purpose Section */}
          <div className={`flex flex-col flex-1 min-w-0 min-h-0 max-h-full overflow-hidden bg-white rounded-[6px] max-w-[696px] ${SUMMARY_PANEL_SHADOW} px-[24px] py-[24px]`}>
            <div className="w-full min-w-0 flex flex-col flex-1 min-h-0 max-h-full">
              <div className="flex flex-wrap justify-between items-start gap-[12px] mb-[18px] shrink-0 w-full">
                <div className="text-left">
                  <label className="block font-semibold mb-[8px]">Purpose</label>
                  <Select
                    options={purposeOptions || []}
                    placeholder="Purpose"
                    isSearchable={true}
                    value={selectedPurposeOption}
                    onChange={setSelectedPurposeOption}
                    className={SUMMARY_OUTSIDE_SELECT_CLASS}
                    isClearable
                    menuPortalTarget={document.body}
                    styles={summaryOutsideSelectStyles}
                  />
                </div>
                <div className="rounded-md px-4 py-[8px] mt-[8px] text-sm shrink-0" style={SUMMARY_BOX_STYLE}>
                  <div className="flex justify-between text-[14px] gap-6 py-0.5">
                    <span className="flex shrink-0 w-[130px] text-black font-semibold">
                      <span className="whitespace-nowrap">Pending Advance</span>
                      <span className="ml-auto">:</span>
                    </span>
                    <span className="font-semibold" style={{ color: '#E4572E' }}>
                      {formatSummaryAmount(purposePendingAdvance)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[14px] gap-6 py-0.5">
                    <span className="flex shrink-0 w-[130px] text-black font-semibold">
                      <span className="whitespace-nowrap">Total Refund</span>
                      <span className="ml-auto">:</span>
                    </span>
                    <span className="font-semibold" style={{ color: '#E4572E' }}>
                      {formatSummaryAmount(purposeBillAmount)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="border border-gray-200 px-[18px] pt-[18px] flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="flex min-w-0 w-[600px] max-w-full flex-nowrap items-end justify-between gap-[6px] mb-[9px] shrink-0">
                  <div className={`flex min-w-0 items-center overflow-hidden gap-[6px]${hasEmpColumnFilters ? ' flex-1 min-w-0' : ' shrink-0'}`}>
                    <EdbcFilterToggleButton onClick={toggleEmpFilters} />
                    {hasEmpColumnFilters && (
                      <div
                        ref={empFilterChipsScrollRef}
                        onMouseDown={handleEmpFilterChipsMouseDown}
                        onMouseMove={handleEmpFilterChipsMouseMove}
                        onMouseUp={handleEmpFilterChipsMouseUp}
                        onMouseLeave={handleEmpFilterChipsMouseUp}
                        className="flex min-w-0 flex-1 overflow-x-auto flex-nowrap gap-2 no-scrollbar scrollbar-none cursor-grab select-none"
                      >
                        {selectEmpNameFilter && (
                          <SummaryFilterChip
                            label="Employee Name"
                            value={selectEmpNameFilter.label}
                            onClear={() => setSelectEmpNameFilter(null)}
                          />
                        )}
                        {selectEmpAdvanceFilter.trim() && (
                          <SummaryFilterChip
                            label="Advance"
                            value={selectEmpAdvanceFilter}
                            onClear={() => setSelectEmpAdvanceFilter('')}
                          />
                        )}
                        {selectEmpRefundFilter.trim() && (
                          <SummaryFilterChip
                            label="Refund"
                            value={selectEmpRefundFilter}
                            onClear={() => setSelectEmpRefundFilter('')}
                          />
                        )}
                        {selectEmpStatusFilter && (
                          <SummaryFilterChip
                            label="Status"
                            value={selectEmpStatusFilter}
                            onClear={() => setSelectEmpStatusFilter('')}
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-end gap-[6px] shrink-0">
                    <EdbcTableToolbarRightActions
                      onClearFilters={clearEmpTableFilters}
                      overallSearch={empTableSearch}
                      onOverallSearchChange={setEmpTableSearch}
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
                    ref={empTableScroll.scrollRef}
                    className="rounded-lg border-l-8 border-l-[#BF9853] flex-1 min-h-0 overflow-y-auto overflow-x-auto no-scrollbar scrollbar-none w-full"
                    onMouseDown={empTableScroll.handleMouseDown}
                  >
                    <table className={`${SUMMARY_EMPLOYEE_TABLE_CLASS} ${showEmpFilters ? '[&_thead_tr:first-child_th]:!border-b-0' : ''}`}>
                      <thead className="sticky top-0 z-20 bg-white">
                        <EdbcTableHeaderRow>
                          <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC4}
                            label="Employee Name"
                            sortField={empHeaderSortField}
                            sortDirection={purposeSortConfig.direction}
                            onSort={handleEmpEdbcSort}
                          />
                          <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC8}
                            label="Advance"
                            sortField={empHeaderSortField}
                            sortDirection={purposeSortConfig.direction}
                            onSort={handleEmpEdbcSort}
                          />
                          <EdbcColumnHeader columnId={EDBC_IDS.EDBC8} label="Refund" />
                          <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC13}
                            label="Status"
                            sortField={empHeaderSortField}
                            sortDirection={purposeSortConfig.direction}
                            onSort={handleEmpEdbcSort}
                          />
                        </EdbcTableHeaderRow>
                        {showEmpFilters && (
                          <EdbcTableFilterRow ref={empFilterRowRef}>
                            <SummaryEmployeeNameFilter
                              value={selectEmpNameFilter}
                              onChange={setSelectEmpNameFilter}
                              options={empNameFilterOptions}
                            />
                            <EdbcTotalAmountFilter
                              columnId={EDBC_IDS.EDBC8}
                              totalAmount={empTableTotals.advance}
                              value={selectEmpAdvanceFilter}
                              onChange={(e) => setSelectEmpAdvanceFilter(e.target.value)}
                            />
                            <EdbcTotalAmountFilter
                              columnId={EDBC_IDS.EDBC8}
                              totalAmount={empTableTotals.refund}
                              value={selectEmpRefundFilter}
                              onChange={(e) => setSelectEmpRefundFilter(e.target.value)}
                            />
                            <SummaryEdbcSelectFilter
                              columnId={EDBC_IDS.EDBC13}
                              placeholder="Status"
                              options={statusFilterOptions}
                              value={selectEmpStatusFilter}
                              onChange={setSelectEmpStatusFilter}
                            />
                          </EdbcTableFilterRow>
                        )}
                      </thead>
                      <tbody>
                        {sortData(filteredPurposeDetails, purposeSortConfig).length > 0 ? (
                          sortData(filteredPurposeDetails, purposeSortConfig).map((d, idx) => (
                            <EdbcTableBodyRow key={d.empId ?? idx}>
                              <EdbcExpandableBodyCell
                                columnId={EDBC_IDS.EDBC4}
                                expense={{ id: d.empId, ...d }}
                                rowIndex={idx}
                                expandedCells={empExpandedCells}
                                onToggleExpanded={toggleEmpExpandedCell}
                                getDisplayValue={(row) => row.name}
                              />
                              <td
                                id={EDBC_IDS.EDBC8}
                                className={edbc8Config?.tdClass}
                                onMouseEnter={(e) => handleMouseEnterAdvance(e, selectedPurposeOption?.id, d.empId, d.empType, 'employee')}
                                onMouseLeave={handleMouseLeave}
                              >
                                <span
                                  onClick={() => handleEmpAdvanceClick(selectedPurposeOption?.id, d.empId, d.empType, d.name)}
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    toggleEmpExpandedCell(`${d.empId ?? idx}-amount`);
                                  }}
                                  className={`block w-full cursor-pointer ${empExpandedCells[`${d.empId ?? idx}-amount`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                  title={formatSummaryAmount(d.pendingAdvance)}
                                >
                                  {formatSummaryAmount(d.pendingAdvance)}
                                </span>
                              </td>
                              <td
                                className={edbc8Config?.tdClass}
                                onMouseEnter={(e) => handleMouseEnter(e, selectedPurposeOption?.id, d.empId, d.empType, 'employee')}
                                onMouseLeave={handleMouseLeave}
                              >
                                <span
                                  onClick={() => handleEmpRefundClick(selectedPurposeOption?.id, d.empId, d.empType, d.name)}
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    toggleEmpExpandedCell(`${d.empId ?? idx}-bill_amount`);
                                  }}
                                  className={`block w-full cursor-pointer ${empExpandedCells[`${d.empId ?? idx}-bill_amount`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                  title={formatSummaryAmount(d.billAmount)}
                                >
                                  {formatSummaryAmount(d.billAmount)}
                                </span>
                              </td>
                              {renderStaffStatusBodyCell({
                                pendingAdvance: d.pendingAdvance,
                                rowId: d.empId,
                                rowIndex: idx,
                                expandedCells: empExpandedCells,
                                onToggleExpanded: toggleEmpExpandedCell,
                                onClick: () => handleEmpStatusClick(
                                  selectedPurposeOption?.id,
                                  d.empId,
                                  d.empType,
                                  d.name
                                ),
                              })}
                            </EdbcTableBodyRow>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center py-4 text-gray-500 font-semibold">
                              No Entry is available
                            </td>
                          </tr>
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

      {showPurposePopup && (
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
            <div className="mb-2 pr-6">
              <SummaryPopupContextHeader context={purposePopupContext} />
              <p className="text-sm text-gray-600 mt-1">{purposePopupTitle}</p>
            </div>
            <div className="flex w-[468px] max-w-full justify-end mb-3">
              <SummaryTableExportActions
                onExportPdf={() => exportPopupPDF(sortPopupData(purposePopupData, purposePopupSortConfig), purposePopupTitle, purposePopupContext, true)}
                onExportCsv={() => exportPopupCSV(sortPopupData(purposePopupData, purposePopupSortConfig), purposePopupTitle, purposePopupContext, true)}
              />
            </div>
            <div className="mt-4 border-l-8 border-l-[#BF9853] max-h-[55vh] overflow-y-auto no-scrollbar scrollbar-none rounded-lg overflow-hidden">
              <table className={` ${SUMMARY_POPUP_TABLE_CLASS}`}>
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
                      label={!selectedEmpOption ? 'Employee' : 'Transfer'}
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
                  {purposePopupData &&
                    sortPopupData(purposePopupData, purposePopupSortConfig).map((entry, index) => (
                      <EdbcTableBodyRow key={index}>
                        <td id={EDBC_IDS.EDBC2} className={edbc2Config?.tdClass}>{entry.date}</td>
                        <td id={EDBC_IDS.EDBC4} className={edbc4Config?.tdClass}>
                          {renderPopupSecondColumn(entry, true)}
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
                      ₹{purposePopupData &&
                        purposePopupData.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
      {showEmpPopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={() => setShowEmpPopup(false)}
        >
          <div
            className="relative bg-white rounded-lg shadow-xl p-[18px] w-fit text-left max-h-[80vh] overflow-hidden no-scrollbar scrollbar-none"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowEmpPopup(false)}
              className="absolute top-[18px] right-[18px] z-10 flex h-[20px] w-[20px] items-center justify-center"
            >
              <img src={FileRemover} className="w-[10px] h-[10px]" alt="Close" />
            </button>
            <div className="mb-2 pr-6">
              <SummaryPopupContextHeader context={empPopupContext} />
              <p className="text-sm text-gray-600 mt-1">{empPopupTitle}</p>
            </div>
            <div className="flex w-[468px] max-w-full justify-end mb-3">
              <SummaryTableExportActions
                onExportPdf={() => exportPopupPDF(sortPopupData(empPopupData, empPopupSortConfig), empPopupTitle, empPopupContext, false)}
                onExportCsv={() => exportPopupCSV(sortPopupData(empPopupData, empPopupSortConfig), empPopupTitle, empPopupContext, false)}
              />
            </div>
            <div className="mt-4 border-l-8 border-l-[#BF9853] max-h-[55vh] overflow-y-auto no-scrollbar scrollbar-none rounded-lg overflow-hidden">
              <table className={` ${SUMMARY_POPUP_TABLE_CLASS}`}>
                <thead className="sticky top-0 z-20 bg-[#FAF6ED]">
                  <EdbcTableHeaderRow>
                    <EdbcColumnHeader
                      columnId={EDBC_IDS.EDBC2}
                      label="Date"
                      columnWidthClass={EDBC2_FIRST_COLUMN_WIDTH_CLASS}
                      sortField={empPopupEdbcSortField}
                      sortDirection={empPopupSortConfig.direction}
                      onSort={handleEmpPopupSort}
                    />
                    <EdbcColumnHeader
                      columnId={EDBC_IDS.EDBC4}
                      label={!selectedPurposeOption ? 'Purpose' : 'Transfer'}
                      sortField={empPopupEdbcSortField}
                      sortDirection={empPopupSortConfig.direction}
                      onSort={handleEmpPopupSort}
                    />
                    <EdbcColumnHeader
                      columnId={EDBC_IDS.EDBC8}
                      label="Amount"
                      sortField={empPopupEdbcSortField}
                      sortDirection={empPopupSortConfig.direction}
                      onSort={handleEmpPopupSort}
                    />
                  </EdbcTableHeaderRow>
                </thead>
                <tbody>
                  {empPopupData &&
                    sortPopupData(empPopupData, empPopupSortConfig).map((entry, index) => (
                      <EdbcTableBodyRow key={index}>
                        <td id={EDBC_IDS.EDBC2} className={edbc2Config?.tdClass}>{entry.date}</td>
                        <td id={EDBC_IDS.EDBC4} className={edbc4Config?.tdClass}>
                          {renderPopupSecondColumn(entry, false)}
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
                      ₹{empPopupData &&
                        empPopupData.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
      {showStatusPopup && (
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
            <div className="mb-2 pr-6">
              <SummaryPopupContextHeader context={statusPopupContext} />
              <p className="text-sm text-gray-600 mt-1">Status Details</p>
            </div>
            <div className={`flex max-w-full justify-end mb-3 ${isStatusFromPurposeTable ? 'w-[588px]' : 'w-[668px]'}`}>
              <SummaryTableExportActions
                onExportPdf={exportStatusPDF}
                onExportCsv={exportStatusCSV}
              />
            </div>
            <div className="mt-4 border-l-8 border-l-[#BF9853] max-h-[55vh] overflow-y-auto no-scrollbar scrollbar-none rounded-lg overflow-hidden">
              <table className={statusPopupTableClass}>
                <thead className="sticky top-0 z-20 bg-[#FAF6ED]">
                  <EdbcTableHeaderRow>
                    <EdbcColumnHeader
                      columnId={EDBC_IDS.EDBC2}
                      label="Date"
                      columnWidthClass={EDBC2_FIRST_COLUMN_WIDTH_CLASS}
                      sortField={statusPopupEdbcSortField}
                      sortDirection={statusPopupSortConfig.direction}
                      onSort={handleStatusPopupSort}
                    />
                    <EdbcColumnHeader
                      columnId={EDBC_IDS.EDBC4}
                      label={
                        isStatusFromPurposeTable
                          ? (selectedEmpOption ? 'Transfer' : 'Employee')
                          : (selectedPurposeOption ? 'Transfer' : 'Purpose')
                      }
                      sortField={statusPopupEdbcSortField}
                      sortDirection={statusPopupSortConfig.direction}
                      onSort={handleStatusPopupSort}
                    />
                    <th
                      id={EDBC_IDS.EDBC8}
                      className={edbc8Config?.headerClass}
                      onClick={() => handleStatusPopupSort('advanceAmount')}
                    >
                      Advance
                      {statusPopupSortConfig.key === 'advanceAmount' && (
                        <span className="ml-1">{statusPopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th
                      id={EDBC_IDS.EDBC8}
                      className={edbc8Config?.headerClass}
                      onClick={() => handleStatusPopupSort('refundAmount')}
                    >
                      Refund
                      {statusPopupSortConfig.key === 'refundAmount' && (
                        <span className="ml-1">{statusPopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                  </EdbcTableHeaderRow>
                </thead>
                <tbody>
                  {buildStatusCombinedData(
                    statusPopupData.advances,
                    statusPopupData.refunds,
                    statusPopupSortConfig
                  ).map((entry, index) => (
                    <EdbcTableBodyRow key={index}>
                      <td id={EDBC_IDS.EDBC2} className={edbc2Config?.tdClass}>{entry.date}</td>
                      <td id={EDBC_IDS.EDBC4} className={edbc4Config?.tdClass}>
                        {renderStatusSecondColumn(entry)}
                      </td>
                      <td id={EDBC_IDS.EDBC8} className={`${edbc8Config?.tdClass} font-semibold ${entry.advanceAmount < 0 ? 'text-red-600' : ''}`.trim()}>
                        {entry.advanceAmount !== 0 ? `₹${entry.advanceAmount.toLocaleString('en-IN')}` : '-'}
                      </td>
                      <td id={EDBC_IDS.EDBC8} className={`${edbc8Config?.tdClass} font-semibold ${entry.refundAmount < 0 ? 'text-red-600' : ''}`.trim()}>
                        {entry.refundAmount !== 0 ? `₹${entry.refundAmount.toLocaleString('en-IN')}` : '-'}
                      </td>
                    </EdbcTableBodyRow>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#f8f1e5] font-bold h-[40px]">
                    <td id={EDBC_IDS.EDBC2} className={edbc2Config?.tdClass}>Total</td>
                    <td id={EDBC_IDS.EDBC4} className={edbc4Config?.tdClass}></td>
                    <td id={EDBC_IDS.EDBC8} className={edbc8Config?.tdClass}>
                      ₹{statusPopupData.advances.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}
                    </td>
                    <td id={EDBC_IDS.EDBC8} className={edbc8Config?.tdClass}>
                      ₹{statusPopupData.refunds.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr className="bg-[#BF9853] text-white font-bold h-[40px]">
                    <td id={EDBC_IDS.EDBC2} className={edbc2Config?.tdClass} colSpan={2}>Balance Advance</td>
                    <td id={EDBC_IDS.EDBC8} className={`${edbc8Config?.tdClass} text-white`} colSpan={2}>
                      ₹{(
                        statusPopupData.advances.reduce((sum, item) => sum + item.amount, 0) -
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

      {tooltipData && (
        <div
          className="fixed z-50 bg-white text-black p-3 rounded shadow-lg text-sm max-w-xs"
          style={{ left: tooltipPosition.x + 10, top: tooltipPosition.y - 10, pointerEvents: 'none' }}
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
                {entry.personName && tooltipTable === 'purpose' && !selectedEmpOption && (
                  <div className="text-xs text-gray-500 ml-2">({entry.personName})</div>
                )}
                {entry.purposeName && tooltipTable === 'employee' && !selectedPurposeOption && (
                  <div className="text-xs text-gray-500 ml-2">({entry.purposeName})</div>
                )}
                {entry.isRefund && tooltipTable === 'purpose' && selectedEmpOption && (
                  <div className="text-xs text-gray-500 ml-2">(Refund)</div>
                )}
                {entry.isRefund && tooltipTable === 'employee' && selectedPurposeOption && (
                  <div className="text-xs text-gray-500 ml-2">(Refund)</div>
                )}
                {entry.type === 'Transfer' && tooltipTable === 'purpose' && selectedEmpOption && entry.transferPurposeName && !entry.isRefund && (
                  <div className="text-xs text-gray-500 ml-2">
                    ({entry.amount < 0 ? 'Transfer To: ' : 'Transfer From: '}{entry.transferPurposeName})
                  </div>
                )}
                {entry.type === 'Transfer' && tooltipTable === 'employee' && selectedPurposeOption && entry.transferPurposeName && !entry.isRefund && (
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
    </div>
  );
}

export default StaffSummary