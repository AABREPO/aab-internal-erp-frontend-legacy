import React, { useState, useEffect, useRef, useCallback } from 'react';
import Select from 'react-select';
import jsPDF from "jspdf";
import "jspdf-autotable";
import PdfIcon from '../Images/pdf.png';
import XlIcon from '../Images/sheets.png';
import {
  EDBC_IDS,
  getEdbcColumnConfig,
  EdbcTableHeaderRow,
  EdbcTableBodyRow,
  EdbcColumnHeader,
  EDBC_TABLE_EDGE_TABLE_CLASS,
  EDBC8_COLUMN_LOCK_TABLE_CLASS,
  useEdbcExpandedCells,
  EdbcExpandableBodyCell,
  EdbcFilterToggleButton,
} from '../ExpensesEntry/databaseExpensesSharedColumns';

const SUMMARY_EDBC13_COLUMN_LOCK =
  '[&_th#EDBC-13]:!w-[130px] [&_td#EDBC-13]:!w-[130px] [&_th#EDBC-13]:!min-w-[130px] [&_td#EDBC-13]:!min-w-[130px] [&_th#EDBC-13]:!max-w-[130px] [&_td#EDBC-13]:!max-w-[130px] [&_th#EDBC-13]:!overflow-hidden [&_td#EDBC-13]:!overflow-hidden';
const SUMMARY_TABLE_CLASS = `table-fixed border-collapse ${EDBC_TABLE_EDGE_TABLE_CLASS} ${EDBC8_COLUMN_LOCK_TABLE_CLASS} ${SUMMARY_EDBC13_COLUMN_LOCK} [&_#EDBC-12]:!pl-0 [&_th#EDBC-13]:!pr-0 [&_td#EDBC-13]:!pr-0`;
const SUMMARY_PURPOSE_TABLE_CLASS = `${SUMMARY_TABLE_CLASS} w-[668px] max-w-full [&_th#EDBC-3]:!w-[298px] [&_td#EDBC-3]:!w-[298px] [&_th#EDBC-3]:!min-w-[298px] [&_td#EDBC-3]:!min-w-[298px] [&_th#EDBC-3]:!max-w-[298px] [&_td#EDBC-3]:!max-w-[298px] [&_th#EDBC-3]:!overflow-hidden [&_td#EDBC-3]:!overflow-hidden [&_thead_tr:nth-child(2)>th:first-child>div]:!w-[286px] [&_thead_tr:nth-child(2)>th:first-child>div]:!min-w-[286px] [&_thead_tr:nth-child(2)>th:first-child>div]:!max-w-[286px]`;
const SUMMARY_EMPLOYEE_TABLE_CLASS = `${SUMMARY_TABLE_CLASS} w-[600px] max-w-full [&_th#EDBC-4]:!w-[230px] [&_td#EDBC-4]:!w-[230px] [&_th#EDBC-4]:!min-w-[230px] [&_td#EDBC-4]:!min-w-[230px] [&_th#EDBC-4]:!max-w-[230px] [&_td#EDBC-4]:!max-w-[230px] [&_td#EDBC-4]:!overflow-hidden`;
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

const renderStaffStatusBodyCell = ({
  pendingAdvance,
  rowId,
  rowIndex,
  expandedCells,
  onToggleExpanded,
}) => {
  const label = getStaffStatusLabel(pendingAdvance);
  const cellKey = `${rowId ?? rowIndex}-paymentMode`;
  const expanded = expandedCells[cellKey];
  const tdClass = edbc13Config?.tdClass;
  return (
    <td id={EDBC_IDS.EDBC13} className={`${tdClass} !pr-0`}>
      <span
        onDoubleClick={(e) => {
          e.stopPropagation();
          onToggleExpanded(cellKey);
        }}
        className={`block w-full font-semibold ${expanded ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
        style={{ color: getStaffStatusColor(pendingAdvance) }}
        title={label}
      >
        {label}
      </span>
    </td>
  );
};

const SummaryTableExportActions = ({ onExportPdf, onExportCsv }) => (
  <div className="flex shrink-0 items-end gap-2">
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
  const { expandedCells: purposeExpandedCells, toggleExpandedCell: togglePurposeExpandedCell } = useEdbcExpandedCells();
  const { expandedCells: empExpandedCells, toggleExpandedCell: toggleEmpExpandedCell } = useEdbcExpandedCells();
  const [showPurposeFilters, setShowPurposeFilters] = useState(false);
  const [showEmpFilters, setShowEmpFilters] = useState(false);
  const edbc8Config = getEdbcColumnConfig(EDBC_IDS.EDBC8);
  const handlePurposeEdbcSort = (field) => {
    if (field === 'siteName') handleSort('purposeName');
    else if (field === 'amount') handleSort('pendingAdvance');
    else if (field === 'paymentMode') handleSort('billStatus');
  };
  const handleEmpEdbcSort = (field) => {
    if (field === 'vendor') handlePurposeSort('name');
    else if (field === 'amount') handlePurposeSort('pendingAdvance');
    else if (field === 'paymentMode') handlePurposeSort('billStatus');
  };
  const purposeHeaderSortField = sortConfig.key === 'purposeName'
    ? 'siteName'
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
    if (selectedEmpOption) {
      const filtered = staffData.filter(item => {
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
      });
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
      const purposeArray = Object.values(grouped).map(p => {
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
    } else {
      setPurposeData([]);
      setTotalPendingAdvance(0);
      setTotalBillAmount(0);
    }
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
  // Get refund details for tooltip
  const getRefundDetails = (purposeId, empId, empType) => {
    if (!staffData.length) return [];
    return staffData.filter(item => {
      let matchesEmp = false;
      if (empType === "Employee") {
        matchesEmp = item.employee_id === empId;
      } else if (empType === "Labour") {
        matchesEmp = item.labour_id === empId;
      } else {
        // Fallback to original logic
        matchesEmp = item.employee_id === empId || item.labour_id === empId;
      }
      if (!matchesEmp) return false;
      // Handle regular refunds
      if (item.type === 'Refund' && item.from_purpose_id === purposeId && item.staff_refund_amount > 0) {
        return true;
      }
      // Handle transfers where this purpose is the source (negative amount)
      if (item.type === 'Transfer' && item.from_purpose_id === purposeId && item.amount < 0) {
        return true;
      }
      return false;
    }).map(item => ({
      date: new Date(item.date).toLocaleDateString('en-GB'),
      amount: item.type === 'Transfer' ? parseFloat(item.amount) || 0 : parseFloat(item.staff_refund_amount) || 0,
      type: item.type === 'Transfer' ? 'Transfer Out' : 'Refund'
    }));
  };
  // Get advance details for tooltip
  const getAdvanceDetails = (purposeId, empId, empType) => {
    if (!staffData.length) return [];
    return staffData.filter(item => {
      let matchesEmp = false;
      if (empType === "Employee") {
        matchesEmp = item.employee_id === empId;
      } else if (empType === "Labour") {
        matchesEmp = item.labour_id === empId;
      } else {
        // Fallback to original logic
        matchesEmp = item.employee_id === empId || item.labour_id === empId;
      }
      if (!matchesEmp) return false;
      // Handle regular advances
      if (item.type === 'Advance' && item.from_purpose_id === purposeId && item.amount > 0) {
        return true;
      }
      // Handle transfers where this purpose is the destination (positive amount)
      if (item.type === 'Transfer' && item.from_purpose_id === purposeId && item.amount > 0) {
        return true;
      }
      return false;
    }).map(item => ({
      date: new Date(item.date).toLocaleDateString('en-GB'),
      amount: parseFloat(item.amount) || 0,
      type: item.type === 'Transfer' ? 'Transfer In' : 'Advance'
    }));
  };
  // Tooltip handlers
  const handleMouseEnter = (event, purposeId, empId, empType) => {
    const refundDetails = getRefundDetails(purposeId, empId, empType);
    if (refundDetails.length > 0) {
      setTooltipTitle('Refund Details');
      setTooltipData(refundDetails);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };
  const handleMouseLeave = () => {
    setTooltipData(null);
    setTooltipTitle("");
  };
  const handleMouseEnterAdvance = (event, purposeId, empId, empType) => {
    const advanceDetails = getAdvanceDetails(purposeId, empId, empType);
    if (advanceDetails.length > 0) {
      setTooltipTitle('Advance Details');
      setTooltipData(advanceDetails);
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };
  useEffect(() => {
    if (selectedPurposeOption) {
      const purposeId = selectedPurposeOption.id;
      const filtered = staffData.filter(item => {
        // Check for purpose match - try different possible field names
        return item.from_purpose_id === purposeId ||
          item.purpose_id === purposeId ||
          item.purpose === selectedPurposeOption.value;
      });
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
          if (from_purpose_id === purposeId) {
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
      const detailsArray = Object.values(grouped).map(d => {
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
    } else {
      setPurposeDetails([]);
      setPurposePendingAdvance(0);
      setPurposeBillAmount(0);
    }
  }, [selectedPurposeOption, staffData, empOptions]);
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
          <div className={`flex flex-col flex-1 min-w-0 min-h-0 max-h-full overflow-hidden bg-white rounded-[6px] max-w-[770px] ${SUMMARY_PANEL_SHADOW} px-[24px] py-[24px]`}>
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
                <div className="flex min-w-0 w-[676px] max-w-full flex-nowrap items-end justify-between gap-[6px] mb-[9px] shrink-0 overflow-hidden">
                  <div className="flex min-w-0 items-center overflow-hidden gap-[6px] shrink-0">
                    <EdbcFilterToggleButton onClick={() => setShowPurposeFilters((v) => !v)} />
                  </div>
                  <div className="flex flex-nowrap shrink-0 items-end justify-end gap-[6px]">
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
                            columnId={EDBC_IDS.EDBC3}
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
                          <EdbcColumnHeader columnId={EDBC_IDS.EDBC8} label="Refund Amount" />
                          <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC13}
                            label="Status"
                            sortField={purposeHeaderSortField}
                            sortDirection={sortConfig.direction}
                            onSort={handlePurposeEdbcSort}
                          />
                        </EdbcTableHeaderRow>
                      </thead>
                      <tbody>
                        {sortData(purposeData, sortConfig, 'pendingAdvance', 'purposeName').length > 0 ? (
                          sortData(purposeData, sortConfig, 'pendingAdvance', 'purposeName').map((purpose, idx) => (
                            <EdbcTableBodyRow key={purpose.purposeId ?? idx}>
                              <EdbcExpandableBodyCell
                                columnId={EDBC_IDS.EDBC3}
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
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    togglePurposeExpandedCell(`${purpose.purposeId ?? idx}-amount`);
                                  }}
                                  className={`block w-full cursor-help ${purposeExpandedCells[`${purpose.purposeId ?? idx}-amount`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
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
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    togglePurposeExpandedCell(`${purpose.purposeId ?? idx}-bill_amount`);
                                  }}
                                  className={`block w-full cursor-help ${purposeExpandedCells[`${purpose.purposeId ?? idx}-bill_amount`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
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
                <div className="flex min-w-0 w-full flex-nowrap items-end justify-between gap-[6px] mb-[9px] shrink-0 overflow-hidden">
                  <div className="flex min-w-0 items-center overflow-hidden gap-[6px] shrink-0">
                    <EdbcFilterToggleButton onClick={() => setShowEmpFilters((v) => !v)} />
                  </div>
                  <div className="flex flex-nowrap shrink-0 items-end justify-end gap-[6px]">
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
                          <EdbcColumnHeader columnId={EDBC_IDS.EDBC8} label="Refund Amount" />
                          <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC13}
                            label="Status"
                            sortField={empHeaderSortField}
                            sortDirection={purposeSortConfig.direction}
                            onSort={handleEmpEdbcSort}
                          />
                        </EdbcTableHeaderRow>
                      </thead>
                      <tbody>
                        {sortData(purposeDetails, purposeSortConfig).length > 0 ? (
                          sortData(purposeDetails, purposeSortConfig).map((d, idx) => (
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
                                onMouseEnter={(e) => handleMouseEnterAdvance(e, selectedPurposeOption?.id, d.empId, d.empType)}
                                onMouseLeave={handleMouseLeave}
                              >
                                <span
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    toggleEmpExpandedCell(`${d.empId ?? idx}-amount`);
                                  }}
                                  className={`block w-full cursor-help ${empExpandedCells[`${d.empId ?? idx}-amount`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                  title={formatSummaryAmount(d.pendingAdvance)}
                                >
                                  {formatSummaryAmount(d.pendingAdvance)}
                                </span>
                              </td>
                              <td
                                className={edbc8Config?.tdClass}
                                onMouseEnter={(e) => handleMouseEnter(e, selectedPurposeOption?.id, d.empId, d.empType)}
                                onMouseLeave={handleMouseLeave}
                              >
                                <span
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    toggleEmpExpandedCell(`${d.empId ?? idx}-bill_amount`);
                                  }}
                                  className={`block w-full cursor-help ${empExpandedCells[`${d.empId ?? idx}-bill_amount`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
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

      {/* Enhanced Tooltip Component */}
      {tooltipData && (
        <div
          className="fixed z-50 bg-white text-black p-4 rounded-lg shadow-xl border border-gray-200 text-sm max-w-sm"
          style={{
            left: Math.min(tooltipPosition.x + 10, window.innerWidth - 320),
            top: Math.max(tooltipPosition.y - 10, 10),
            pointerEvents: 'none',
            transform: tooltipPosition.x > window.innerWidth - 320 ? 'translateX(-100%)' : 'none'
          }}
        >
          <div className="font-semibold mb-3 text-gray-800 border-b border-gray-200 pb-2">
            {tooltipTitle || 'Details'}
          </div>
          <div className="max-h-48 overflow-y-auto">
            {tooltipData.map((entry, index) => (
              <div key={index} className="mb-2 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-gray-600 text-xs">{entry.date}</span>
                  {entry.type && <span className="text-xs text-blue-600 font-medium">{entry.type}</span>}
                </div>
                <span className="font-mono font-semibold">₹{entry.amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
            <span className="font-semibold text-gray-800">Total:</span>
            <span className="font-mono font-bold text-lg">₹{tooltipData.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffSummary