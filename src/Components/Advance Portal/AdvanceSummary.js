import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTabRefreshSignal } from '../../utils/useTabRefreshSignal';
import Select from 'react-select';
import jsPDF from "jspdf";
import "jspdf-autotable";
import AdvanceForm from './AdvancePortal';
import PdfIcon from '../Images/pdf.png';
import XlIcon from '../Images/sheets.png';
import FileRemover from '../Images/FileRemover.svg';
import {
  EDBC_IDS,
  DATABASE_TABLE_FILTER_SELECT_STYLES,
  getEdbcColumnConfig,
  EdbcTableHeaderRow,
  EdbcTableFilterRow,
  EdbcTableBodyRow,
  EdbcColumnHeader,
  EdbcProjectNameFilter,
  EdbcTotalAmountFilter,
  matchesEdbcAmountFilter,
  normalizeEdbcAmountFilterText,
  EDBC_TABLE_EDGE_TABLE_CLASS,
  EDBC8_COLUMN_LOCK_TABLE_CLASS,
  EDBC2_FIRST_COLUMN_WIDTH_CLASS,
  useEdbcExpandedCells,
  EdbcExpandableBodyCell,
  EdbcFilterToggleButton,
  EdbcTableToolbarRightActions,
} from '../ExpensesEntry/databaseExpensesSharedColumns';
import { use } from 'react';

const SUMMARY_FIRST_COLUMN_FILTER_SELECT_STYLES = {
  ...DATABASE_TABLE_FILTER_SELECT_STYLES,
  dropdownIndicator: (provided, state) => ({
    ...DATABASE_TABLE_FILTER_SELECT_STYLES.dropdownIndicator(provided, state),
    display: state.hasValue ? 'none' : 'flex',
  }),
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

const SUMMARY_EDBC13_COLUMN_LOCK =
  '[&_th#EDBC-13]:!w-[130px] [&_td#EDBC-13]:!w-[130px] [&_th#EDBC-13]:!min-w-[130px] [&_td#EDBC-13]:!min-w-[130px] [&_th#EDBC-13]:!max-w-[130px] [&_td#EDBC-13]:!max-w-[130px] [&_th#EDBC-13]:!overflow-hidden [&_td#EDBC-13]:!overflow-hidden';
const SUMMARY_FIRST_COLUMN_PAD = '';
const SUMMARY_TABLE_CLASS = `table-fixed border-collapse ${EDBC_TABLE_EDGE_TABLE_CLASS} ${EDBC8_COLUMN_LOCK_TABLE_CLASS} ${SUMMARY_EDBC13_COLUMN_LOCK} ${SUMMARY_FIRST_COLUMN_PAD} [&_#EDBC-12]:!pl-0 [&_th#EDBC-13]:!pr-0 [&_td#EDBC-13]:!pr-0`;
const SUMMARY_PROJECT_TABLE_CLASS = `${SUMMARY_TABLE_CLASS} w-[668px] max-w-full [&_th#EDBC-3]:!w-[298px] [&_td#EDBC-3]:!w-[298px] [&_th#EDBC-3]:!min-w-[298px] [&_td#EDBC-3]:!min-w-[298px] [&_th#EDBC-3]:!max-w-[298px] [&_td#EDBC-3]:!max-w-[298px] [&_th#EDBC-3]:!overflow-hidden [&_td#EDBC-3]:!overflow-hidden [&_thead_tr:nth-child(2)>th:first-child>div]:!w-[286px] [&_thead_tr:nth-child(2)>th:first-child>div]:!min-w-[286px] [&_thead_tr:nth-child(2)>th:first-child>div]:!max-w-[286px]`;
const SUMMARY_SITE_TABLE_CLASS = `${SUMMARY_TABLE_CLASS} w-[600px] max-w-full [&_th#EDBC-4]:!w-[230px] [&_td#EDBC-4]:!w-[230px] [&_th#EDBC-4]:!min-w-[230px] [&_td#EDBC-4]:!min-w-[230px] [&_th#EDBC-4]:!max-w-[230px] [&_td#EDBC-4]:!max-w-[230px] [&_td#EDBC-4]:!overflow-hidden`;
const SUMMARY_POPUP_TABLE_CLASS = `table-fixed w-[468px] max-w-full border-collapse ${EDBC_TABLE_EDGE_TABLE_CLASS} ${EDBC8_COLUMN_LOCK_TABLE_CLASS} [&_th#EDBC-2]:!w-[130px] [&_td#EDBC-2]:!w-[130px] [&_th#EDBC-2]:!min-w-[130px] [&_td#EDBC-2]:!min-w-[130px] [&_th#EDBC-2]:!max-w-[130px] [&_td#EDBC-2]:!max-w-[130px]`;
const SUMMARY_BILL_STATUS_POPUP_TABLE_BASE = `table-fixed border-collapse ${EDBC_TABLE_EDGE_TABLE_CLASS} ${EDBC8_COLUMN_LOCK_TABLE_CLASS} [&_th#EDBC-2]:!w-[130px] [&_td#EDBC-2]:!w-[130px] [&_th#EDBC-2]:!min-w-[130px] [&_td#EDBC-2]:!min-w-[130px] [&_th#EDBC-2]:!max-w-[130px] [&_td#EDBC-2]:!max-w-[130px]`;
const SUMMARY_BILL_STATUS_LEFT_POPUP_TABLE_CLASS = `${SUMMARY_BILL_STATUS_POPUP_TABLE_BASE} w-[588px] max-w-full [&_th#EDBC-4]:!w-[218px] [&_td#EDBC-4]:!w-[218px] [&_th#EDBC-4]:!min-w-[218px] [&_td#EDBC-4]:!min-w-[218px] [&_th#EDBC-4]:!max-w-[218px] [&_td#EDBC-4]:!max-w-[218px]`;
const SUMMARY_BILL_STATUS_RIGHT_POPUP_TABLE_CLASS = `${SUMMARY_BILL_STATUS_POPUP_TABLE_BASE} w-[668px] max-w-full [&_th#EDBC-3]:!w-[298px] [&_td#EDBC-3]:!w-[298px] [&_th#EDBC-3]:!min-w-[298px] [&_td#EDBC-3]:!min-w-[298px] [&_th#EDBC-3]:!max-w-[298px] [&_td#EDBC-3]:!max-w-[298px]`;
const SUMMARY_OUTSIDE_SELECT_CLASS = 'custom-select w-[300px] h-[40px] rounded-lg focus:outline-none';
const SUMMARY_PROJECT_NAME_SELECT_CLASS = 'custom-select w-[300px] h-[40px] rounded-lg focus:outline-none';
const SUMMARY_PANEL_SHADOW =
  'shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1),0_-8px_15px_-3px_rgba(0,0,0,0.1)]';

const SummaryFilterChip = ({ label, value, onClear }) => (
  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium">
    <span className="font-medium text-[#BF9853] whitespace-nowrap">{label}:</span>
    <span className="font-semibold text-[14px] whitespace-nowrap">{value}</span>
    <button type="button" onClick={onClear} className="text-[#E4572E] ml-1 text-2xl leading-none shrink-0">×</button>
  </span>
);

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

const EMPTY_SUMMARY_POPUP_CONTEXT = { line1: '', line2: '' };

const formatSummaryPopupContextText = ({ line1, line2 }) => {
  if (!line1 && !line2) return '';
  if (!line1) return line2;
  if (!line2) return line1;
  return `${line1} - ${line2}`;
};

const resolveSummaryContractorVendorLabel = ({
  contractorVendorId,
  contractorVendorType,
  contractorOptions,
  vendorOptions,
  selectedOption,
}) => {
  if (selectedOption?.label) return selectedOption.label;
  if (contractorVendorId) {
    if (contractorVendorType === 'Contractor') {
      return contractorOptions.find((c) => c.id === contractorVendorId)?.label || '-';
    }
    return vendorOptions.find((v) => v.id === contractorVendorId)?.label || '-';
  }
  return 'All Contractors/Vendors';
};

const resolveSummaryProjectLabel = ({
  projectId,
  siteOptions,
  selectedSite,
  projectName,
}) => {
  if (projectName) return projectName;
  if (selectedSite?.label) return selectedSite.label;
  if (projectId) {
    return siteOptions.find((s) => String(s.id) === String(projectId))?.label || 'All Projects';
  }
  return 'All Projects';
};

const buildFirstTablePopupContext = ({
  contractorVendorId,
  contractorVendorType,
  contractorOptions,
  vendorOptions,
  selectedOption,
  projectId,
  siteOptions,
  projectName,
}) => ({
  line1: resolveSummaryContractorVendorLabel({
    contractorVendorId,
    contractorVendorType,
    contractorOptions,
    vendorOptions,
    selectedOption,
  }),
  line2: resolveSummaryProjectLabel({
    projectId,
    siteOptions,
    selectedSite: null,
    projectName,
  }),
});

const buildSecondTablePopupContext = ({
  projectId,
  siteOptions,
  selectedSite,
  contractorVendorName,
}) => ({
  line1: resolveSummaryProjectLabel({
    projectId,
    siteOptions,
    selectedSite,
    projectName: null,
  }),
  line2: contractorVendorName || '-',
});

const SummaryPopupContextHeader = ({ context }) => (
  <h3 className="text-[18px] font-semibold text-[#000000] min-w-0 break-words whitespace-normal">
    {context.line1}
    {context.line1 && context.line2 && ' - '}
    {context.line2}
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

const getContractorVendorOptionValue = (option) => `${option.type}-${option.id}`;

const SummaryContractorVendorFilter = ({ value, onChange, options }) => {
  const config = getEdbcColumnConfig(EDBC_IDS.EDBC4);
  if (!config) return null;
  return (
    <th id={EDBC_IDS.EDBC4} className={config.filterThClass}>
      <Select
        className={config.filterWidthClass}
        options={options}
        value={value}
        onChange={onChange}
        getOptionValue={getContractorVendorOptionValue}
        getOptionLabel={(option) => option.label}
        placeholder="Contractor/Vendor"
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
  isClearable = false,
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
        isClearable={isClearable}
        isSearchable
        noOptionsMessage={() => 'No options'}
        styles={SUMMARY_FIRST_COLUMN_FILTER_SELECT_STYLES}
      />
    </th>
  );
};
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
const getBillStatusLabel = (pendingAdvance) => (pendingAdvance > 0 ? 'Pending' : 'Bill Settled');
const buildSummaryRowSearchText = ({ name, pendingAdvance, billAmount }) => {
  const billStatus = getBillStatusLabel(pendingAdvance);
  return [
    name,
    pendingAdvance,
    billAmount,
    billStatus,
    formatSummaryAmount(pendingAdvance),
    formatSummaryAmount(billAmount),
    normalizeEdbcAmountFilterText(pendingAdvance),
    normalizeEdbcAmountFilterText(billAmount),
  ]
    .map((v) => String(v ?? '').toLowerCase())
    .join(' ');
};
const matchesSummaryUniversalSearch = (query, rowFields) => {
  const q = String(query ?? '').trim().toLowerCase();
  if (!q) return true;
  const searchable = buildSummaryRowSearchText(rowFields);
  const qAmount = normalizeEdbcAmountFilterText(query).toLowerCase();
  return searchable.includes(q) || (qAmount && searchable.includes(qAmount));
};
const BILL_STATUS_PENDING_COLOR = '#E4572E';
const BILL_STATUS_SETTLED_COLOR = '#007233';
const edbc13Config = getEdbcColumnConfig(EDBC_IDS.EDBC13);
const getBillStatusColor = (pendingAdvance) =>
  pendingAdvance > 0 ? BILL_STATUS_PENDING_COLOR : BILL_STATUS_SETTLED_COLOR;
const renderBillStatusBodyCell = ({
  pendingAdvance,
  rowId,
  rowIndex,
  expandedCells,
  onToggleExpanded,
  onClick,
}) => {
  const label = getBillStatusLabel(pendingAdvance);
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
        style={{ color: getBillStatusColor(pendingAdvance) }}
        title={label}
      >
        {label}
      </span>
    </td>
  );
};
const AdvanceSummary = ({ refreshSignal, isActive = true }) => {
  const resolveActiveBranchId = useCallback(() => {
    try {
      const selectedBranchId = localStorage.getItem("selectedBranchId");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const fallbackBranchId = user?.branchId ?? user?.branch_id ?? user?.brachId;
      const resolved = Number(selectedBranchId || fallbackBranchId);
      return Number.isFinite(resolved) && resolved > 0 ? resolved : null;
    } catch {
      return null;
    }
  }, []);
  const [showAdvanceForm, setShowAdvanceForm] = useState(false);
  const [activeBranchId, setActiveBranchId] = useState(() => resolveActiveBranchId());
  const buildBranchUrl = useCallback((baseUrl) => {
    const url = new URL(baseUrl);
    if (activeBranchId !== null && activeBranchId !== undefined && activeBranchId !== "") {
      url.searchParams.set("branchId", String(activeBranchId));
    }
    return url.toString();
  }, [activeBranchId]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  const [advanceData, setAdvanceData] = useState([]);
  const [combinedOptions, setCombinedOptions] = useState([]);
  const [selectedContractorOrVendorOption, setSelectedContractorOrVendorOption] = useState('');
  const [totalPendingAdvance, setTotalPendingAdvance] = useState(0);
  const [siteDetails, setSiteDetails] = useState([]);
  const [sitePendingAdvance, setSitePendingAdvance] = useState(0);
  const [siteBillAmount, setSiteBillAmount] = useState(0);
  const [totalBillAmount, setTotalBillAmount] = useState(0);
  const [projectSearch, setProjectSearch] = useState('');
  const [siteSearch, setSiteSearch] = useState('');
  const [showProjectFilters, setShowProjectFilters] = useState(false);
  const [showSiteFilters, setShowSiteFilters] = useState(false);
  const [selectProjectNameFilter, setSelectProjectNameFilter] = useState('');
  const [selectProjectAdvanceFilter, setSelectProjectAdvanceFilter] = useState('');
  const [selectProjectBillAmountFilter, setSelectProjectBillAmountFilter] = useState('');
  const [selectProjectBillStatusFilter, setSelectProjectBillStatusFilter] = useState('');
  const [selectSiteContractorFilter, setSelectSiteContractorFilter] = useState(null);
  const [selectSiteAdvanceFilter, setSelectSiteAdvanceFilter] = useState('');
  const [selectSiteBillAmountFilter, setSelectSiteBillAmountFilter] = useState('');
  const [selectSiteBillStatusFilter, setSelectSiteBillStatusFilter] = useState('');
  const { expandedCells: projectExpandedCells, toggleExpandedCell: toggleProjectExpandedCell } = useEdbcExpandedCells();
  const { expandedCells: siteExpandedCells, toggleExpandedCell: toggleSiteExpandedCell } = useEdbcExpandedCells();
  const projectTableScroll = useTableDragScroll();
  const siteTableScroll = useTableDragScroll();
  const projectScrollRef = projectTableScroll.scrollRef;
  const siteScrollRef = siteTableScroll.scrollRef;
  const projectFilterRowRef = useRef(null);
  const siteFilterRowRef = useRef(null);
  const projectFilterNudgeUsedRef = useRef(false);
  const siteFilterNudgeUsedRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  // Sorting state for both tables
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [siteSortConfig, setSiteSortConfig] = useState({ key: null, direction: 'asc' });
  // Tooltip state for first table (Project table - shows contractor/vendor names)
  const [projectTooltipData, setProjectTooltipData] = useState(null);
  const [projectTooltipPosition, setProjectTooltipPosition] = useState({ x: 0, y: 0 });
  const [projectTooltipTitle, setProjectTooltipTitle] = useState("");
  // Tooltip state for second table (Contractor/Vendor table - shows project names)
  const [siteTooltipData, setSiteTooltipData] = useState(null);
  const [siteTooltipPosition, setSiteTooltipPosition] = useState({ x: 0, y: 0 });
  const [siteTooltipTitle, setSiteTooltipTitle] = useState("");
  // Popup/Modal state for first table
  const [projectPopupData, setProjectPopupData] = useState(null);
  const [projectPopupTitle, setProjectPopupTitle] = useState("");
  const [projectPopupContext, setProjectPopupContext] = useState(EMPTY_SUMMARY_POPUP_CONTEXT);
  const [showProjectPopup, setShowProjectPopup] = useState(false);
  const [projectPopupSortConfig, setProjectPopupSortConfig] = useState({ key: null, direction: 'asc' });
  // Popup/Modal state for second table
  const [sitePopupData, setSitePopupData] = useState(null);
  const [sitePopupTitle, setSitePopupTitle] = useState("");
  const [sitePopupContext, setSitePopupContext] = useState(EMPTY_SUMMARY_POPUP_CONTEXT);
  const [showSitePopup, setShowSitePopup] = useState(false);
  const [sitePopupSortConfig, setSitePopupSortConfig] = useState({ key: null, direction: 'asc' });
  // Popup/Modal state for Bill Status popup (combined advance + bill)
  const [showBillStatusPopup, setShowBillStatusPopup] = useState(false);
  const [billStatusPopupData, setBillStatusPopupData] = useState({ advances: [], bills: [] });
  const [billStatusPopupContext, setBillStatusPopupContext] = useState(EMPTY_SUMMARY_POPUP_CONTEXT);
  const [billStatusPopupSortConfig, setBillStatusPopupSortConfig] = useState({ key: null, direction: 'asc' });
  const [isBillStatusFromFirstTable, setIsBillStatusFromFirstTable] = useState(true);
  // Function to convert Google Drive URL to viewable format for opening in new tab
  const convertToViewableUrl = (url) => {
    if (!url) return url;

    // Check if it's a Google Drive URL
    if (url.includes('drive.google.com')) {
      // Extract file ID from various Google Drive URL formats
      let fileId = null;

      // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
      const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match1) {
        fileId = match1[1];
      }

      // Format: https://drive.google.com/open?id=FILE_ID
      if (!fileId) {
        const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (match2) {
          fileId = match2[1];
        }
      }

      // Format: https://drive.google.com/uc?id=FILE_ID
      if (!fileId) {
        const match3 = url.match(/\/uc\?id=([a-zA-Z0-9_-]+)/);
        if (match3) {
          fileId = match3[1];
        }
      }

      if (fileId) {
        // Return view URL for opening in new tab
        return `https://drive.google.com/file/d/${fileId}/view`;
      }
    }

    // If not a Google Drive URL or couldn't extract ID, return original URL
    return url;
  };
  useEffect(() => {
    const savedContractorVendor = sessionStorage.getItem('selectedContractorOrVendorOption');
    try {
      if (savedContractorVendor) setSelectedContractorOrVendorOption(JSON.parse(savedContractorVendor));
    } catch (error) {
      console.error("Error parsing sessionStorage data:", error);
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  const handleBeforeUnload = () => {
    sessionStorage.removeItem('selectedContractorOrVendorOption');
  };
  useEffect(() => {
    if (selectedContractorOrVendorOption) sessionStorage.setItem('selectedContractorOrVendorOption', JSON.stringify(selectedContractorOrVendorOption));
  }, [selectedContractorOrVendorOption]);
  useEffect(() => {
    const saved = localStorage.getItem("advanceContractorVendor");
    if (saved) {
      setSelectedContractorOrVendorOption(JSON.parse(saved));
    }
  }, []);


  const openAdvanceFormWithPrefill = (contractorVendorOption, projectOption) => {
    try {
      // AdvancePortal reads these keys on mount for autofill.
      if (contractorVendorOption) {
        sessionStorage.setItem('selectedOption', JSON.stringify(contractorVendorOption));
        localStorage.setItem('advanceContractorVendor', JSON.stringify(contractorVendorOption));
      } else {
        sessionStorage.removeItem('selectedOption');
        localStorage.removeItem('advanceContractorVendor');
      }

      if (projectOption) {
        sessionStorage.setItem('selectedSite', JSON.stringify(projectOption));
        localStorage.setItem('advanceProjectName', JSON.stringify(projectOption));
      } else {
        sessionStorage.removeItem('selectedSite');
        localStorage.removeItem('advanceProjectName');
      }

      sessionStorage.setItem('selectedType', JSON.stringify('Advance'));
    } catch (err) {
      console.error('Failed to set advance prefill', err);
    }
    setShowAdvanceForm(true);
  };


  // Removed localStorage effect for selectedAdvanceSite to allow default null state
  // Fetch Vendor Names
  useEffect(() => {
    const fetchVendorNames = async () => {
      try {
        setProgress(10);
        const res = await fetch("https://backendaab.in/aabuilderDash/api/vendor_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        setVendorOptions(data.map(item => ({
          value: item.vendorName,
          label: item.vendorName,
          type: "Vendor",
          id: item.id
        })));
        setProgress(25);
      } catch (err) {
        console.error(err);
        setError("Failed to load vendor data");
      }
    };
    fetchVendorNames();
  }, []);
  // Fetch Contractor Names
  useEffect(() => {
    const fetchContractorNames = async () => {
      try {
        setProgress(35);
        const res = await fetch("https://backendaab.in/aabuilderDash/api/contractor_Names/getAll", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        setContractorOptions(data.map(item => ({
          value: item.contractorName,
          label: item.contractorName,
          type: "Contractor",
          id: item.id
        })));
        setProgress(50);
      } catch (err) {
        console.error(err);
        setError("Failed to load contractor data");
      }
    };
    fetchContractorNames();
  }, []);
  useEffect(() => { setCombinedOptions([...vendorOptions, ...contractorOptions]); }, [vendorOptions, contractorOptions]);
  // Fetch Site Names
  useEffect(() => {
    const fetchSites = async () => {
      try {
        setProgress(60);
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
        // Add predefined site options with IDs 001, 002, 003, 004
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
        ];
        // Combine backend data with predefined options
        const combinedSiteOptions = [...predefinedSiteOptions, ...formattedData];
        setSiteOptions(combinedSiteOptions);
        setProgress(75);
      } catch (error) {
        console.error("Fetch error: ", error);
        // Fallback: if API fails, still show predefined options
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
        ];
        setSiteOptions(predefinedSiteOptions);
        setProgress(75);
      }
    };
    fetchSites();
  }, []);
  useEffect(() => {
    const syncBranch = () => {
      const nextBranchId = resolveActiveBranchId();
      setActiveBranchId((prevBranchId) =>
        prevBranchId === nextBranchId ? prevBranchId : nextBranchId
      );
    };
    syncBranch();
    window.addEventListener("branchSelectionChanged", syncBranch);
    return () => {
      window.removeEventListener("branchSelectionChanged", syncBranch);
    };
  }, [resolveActiveBranchId]);

  const fetchAdvanceFormData = useCallback(async ({ showLoader = false } = {}) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      setProgress(85);
      const response = await fetch(buildBranchUrl("https://backendaab.in/aabuildersDash/api/advance_portal/getAll"), {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch advance data: ${response.status}`);
      }
      const data = await response.json();
      setAdvanceData(Array.isArray(data) ? data : []);
      setProgress(100);
      setError(null);
    } catch (err) {
      console.error("Error fetching advance form data", err);
      setError("Failed to load advance data");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, [buildBranchUrl]);

  useEffect(() => {
    fetchAdvanceFormData({ showLoader: true });
  }, [fetchAdvanceFormData]);

  useTabRefreshSignal(refreshSignal, isActive, () => fetchAdvanceFormData({ showLoader: false }));

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
      color: '#6b7280',
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
  const [selectedAdvanceSite, setSelectedAdvanceSite] = useState(null);
  const [projectData, setProjectData] = useState([]);
  useEffect(() => {
    if (selectedContractorOrVendorOption) {
      // When a specific contractor/vendor is selected, show projects for that entity only
      const filtered = advanceData.filter(item => {
        if (selectedContractorOrVendorOption.type === "Vendor") {
          return item.vendor_id === selectedContractorOrVendorOption.id;
        }
        if (selectedContractorOrVendorOption.type === "Contractor") {
          return item.contractor_id === selectedContractorOrVendorOption.id;
        }
        return false;
      });
      const grouped = {};
      let totalPendingAll = 0;
      let totalBillAll = 0;
      filtered.forEach(curr => {
        const {
          project_id,
          amount = 0,
          bill_amount = 0,
          refund_amount = 0,
          discount_amount = 0
        } = curr;
        if (!grouped[project_id]) {
          grouped[project_id] = {
            projectName: siteOptions.find(s => String(s.id) === String(project_id))?.label || "-",
            projectId: project_id,
            totalAdvance: 0,
            totalBill: 0,
            totalDiscount: 0,
            totalRefund: 0
          };
        }
        grouped[project_id].totalAdvance += parseFloat(amount) || 0;
        grouped[project_id].totalBill += parseFloat(bill_amount) || 0;
        grouped[project_id].totalDiscount += parseFloat(discount_amount) || 0;
        grouped[project_id].totalRefund += parseFloat(refund_amount) || 0;
      });
      const projectArray = Object.values(grouped).map(p => {
        // Net bill = bill_amount - discount_amount
        const netBill = p.totalBill - p.totalDiscount;
        const pending = p.totalAdvance - netBill - p.totalRefund;
        totalPendingAll += pending;
        totalBillAll += netBill;
        return {
          projectName: p.projectName,
          pendingAdvance: pending,
          billAmount: netBill,
          projectId: p.projectId
        };
      });
      setProjectData(projectArray);
      setTotalPendingAdvance(totalPendingAll);
      setTotalBillAmount(totalBillAll);
    } else {
      const grouped = {};
      let totalPendingAll = 0;
      let totalBillAll = 0;

      advanceData.forEach(curr => {
        const {
          project_id,
          amount = 0,
          bill_amount = 0,
          refund_amount = 0,
          discount_amount = 0
        } = curr;

        if (project_id) {
          if (!grouped[project_id]) {
            grouped[project_id] = {
              projectName: siteOptions.find(s => String(s.id) === String(project_id))?.label || "-",
              projectId: project_id,
              totalAdvance: 0,
              totalBill: 0,
              totalDiscount: 0,
              totalRefund: 0
            };
          }
          grouped[project_id].totalAdvance += parseFloat(amount) || 0;
          grouped[project_id].totalBill += parseFloat(bill_amount) || 0;
          grouped[project_id].totalDiscount += parseFloat(discount_amount) || 0;
          grouped[project_id].totalRefund += parseFloat(refund_amount) || 0;
        }
      });

      const projectArray = Object.values(grouped).map(p => {
        // Net bill = bill_amount - discount_amount
        const netBill = p.totalBill - p.totalDiscount;
        const pending = p.totalAdvance - netBill - p.totalRefund;
        totalPendingAll += pending;
        totalBillAll += netBill;
        return {
          projectName: p.projectName,
          pendingAdvance: pending,
          billAmount: netBill,
          projectId: p.projectId
        };
      });

      setProjectData(projectArray);
      setTotalPendingAdvance(totalPendingAll);
      setTotalBillAmount(totalBillAll);
    }
  }, [selectedContractorOrVendorOption, advanceData, siteOptions]);
  const sortedSiteOptions = siteOptions.sort((a, b) =>
    a.label.localeCompare(b.label)
  );
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  const handleSiteSort = (key) => {
    let direction = 'asc';
    if (siteSortConfig.key === key && siteSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSiteSortConfig({ key, direction });
  };
  const defaultSort = (data, statusKey = 'pendingAdvance', nameKey = 'projectName') => {
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
  const sortData = (data, config, statusKey = 'pendingAdvance', nameKey = 'projectName') => {
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
  const getBillDetails = (projectId, contractorVendorId, contractorVendorType) => {
    if (!advanceData.length) return [];
    return advanceData.filter(item => {
      const matchesProject = projectId ? item.project_id === projectId : true;
      // If no contractor/vendor is selected, show all bills for the project
      const matchesEntity = contractorVendorId
        ? (contractorVendorType === 'Contractor'
          ? item.contractor_id === contractorVendorId
          : item.vendor_id === contractorVendorId)
        : true;
      const billAmt = parseFloat(item.bill_amount) || 0;
      const discountAmt = parseFloat(item.discount_amount) || 0;
      return matchesProject && matchesEntity && (billAmt > 0 || discountAmt > 0);
    }).flatMap(item => {
      const date = new Date(item.date).toLocaleDateString('en-GB');
      const billAmt = parseFloat(item.bill_amount) || 0;
      const discountAmt = parseFloat(item.discount_amount) || 0;
      const projectName = siteOptions.find(s => String(s.id) === String(item.project_id))?.label || "Unknown Site";
      const contractorVendorName = item.contractor_id
        ? contractorOptions.find(c => c.id === item.contractor_id)?.label || "-"
        : vendorOptions.find(v => v.id === item.vendor_id)?.label || "-";
      const fileUrl = (item.file_url && typeof item.file_url === 'string' && item.file_url.trim() !== '') ? item.file_url : null;

      const rows = [];
      if (billAmt > 0) {
        rows.push({
          kind: 'main',
          advancePortalId: item.advancePortalId || 0,
          date,
          amount: billAmt,
          projectName,
          contractorVendorName,
          type: item.type || "Bill",
          file_url: fileUrl
        });
      }
      if (discountAmt > 0) {
        // Discount reduces the effective bill amount, so show it as a negative entry
        rows.push({
          kind: 'discount',
          advancePortalId: item.advancePortalId || 0,
          date,
          amount: -discountAmt,
          projectName,
          contractorVendorName,
          type: "Discount",
          file_url: null
        });
      }
      return rows;
    });
  };
  const getAdvanceDetails = (projectId, contractorVendorId, contractorVendorType) => {
    if (!advanceData.length) return [];

    // Check if both contractor/vendor and project are selected
    const bothFiltersApplied = contractorVendorId && projectId;

    return advanceData.filter(item => {
      const matchesProject = projectId ? item.project_id === projectId : true;
      // If no contractor/vendor is selected, show all advances for the project
      const matchesEntity = contractorVendorId
        ? (contractorVendorType === 'Contractor'
          ? item.contractor_id === contractorVendorId
          : item.vendor_id === contractorVendorId)
        : true;
      const hasAmount = (parseFloat(item.amount) || 0) !== 0;
      const hasRefund = (parseFloat(item.refund_amount) || 0) !== 0;
      return matchesProject && matchesEntity && (hasAmount || hasRefund);
    }).map(item => {
      let amount = parseFloat(item.amount) || 0;
      const refundAmount = parseFloat(item.refund_amount) || 0;

      // If there's a refund amount, use it as negative (money returned)
      if (refundAmount !== 0) {
        amount = -refundAmount; // Show refund as negative
      }

      // Handle Transfer type amounts when both filters are applied
      if (bothFiltersApplied && item.type === 'Transfer') {
        // Transfer amounts are already stored with correct sign:
        // Negative = Transfer To (money going out to transfer_site_id)
        // Positive = Transfer From (money coming from transfer_site_id)
        // Keep the amount as is
        amount = parseFloat(item.amount) || 0;
      }

      return {
        kind: 'main',
        advancePortalId: item.advancePortalId || 0,
        date: new Date(item.date).toLocaleDateString('en-GB'),
        amount: amount,
        projectName: siteOptions.find(s => String(s.id) === String(item.project_id))?.label || "Unknown Site",
        contractorVendorName: item.contractor_id
          ? contractorOptions.find(c => c.id === item.contractor_id)?.label || "-"
          : vendorOptions.find(v => v.id === item.vendor_id)?.label || "-",
        type: refundAmount !== 0 ? "Refund" : (item.type || "Advance"),
        transferSiteName: item.transfer_site_id
          ? siteOptions.find(s => String(s.id) === String(item.transfer_site_id))?.label || "-"
          : null,
        isRefund: refundAmount !== 0
      };
    });
  };
  // Handlers for first table (Project table)
  const handleProjectBillMouseEnter = (event, projectId, contractorVendorId, contractorVendorType) => {
    const billDetails = getBillDetails(projectId, contractorVendorId, contractorVendorType);
    if (billDetails.length > 0) {
      setProjectTooltipTitle('Bill Details');
      setProjectTooltipData(billDetails);
      setProjectTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };
  const handleProjectMouseLeave = () => {
    setProjectTooltipData(null);
    setProjectTooltipTitle("");
  };
  const handleProjectAdvanceMouseEnter = (event, projectId, contractorVendorId, contractorVendorType) => {
    const advanceDetails = getAdvanceDetails(projectId, contractorVendorId, contractorVendorType);
    if (advanceDetails.length > 0) {
      setProjectTooltipTitle('Advance Details');
      setProjectTooltipData(advanceDetails);
      setProjectTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };

  // Handlers for second table (Contractor/Vendor table)
  const handleSiteBillMouseEnter = (event, projectId, contractorVendorId, contractorVendorType) => {
    const billDetails = getBillDetails(projectId, contractorVendorId, contractorVendorType);
    if (billDetails.length > 0) {
      setSiteTooltipTitle('Bill Details');
      setSiteTooltipData(billDetails);
      setSiteTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };
  const handleSiteMouseLeave = () => {
    setSiteTooltipData(null);
    setSiteTooltipTitle("");
  };
  const handleSiteAdvanceMouseEnter = (event, projectId, contractorVendorId, contractorVendorType) => {
    const advanceDetails = getAdvanceDetails(projectId, contractorVendorId, contractorVendorType);
    if (advanceDetails.length > 0) {
      setSiteTooltipTitle('Advance Details');
      setSiteTooltipData(advanceDetails);
      setSiteTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };

  // Click handlers for first table (Project table) - Opens popup
  const handleProjectAdvanceClick = (projectId, contractorVendorId, contractorVendorType, projectName) => {
    const advanceDetails = getAdvanceDetails(projectId, contractorVendorId, contractorVendorType);
    if (advanceDetails.length > 0) {
      setProjectPopupTitle('Advance Details');
      setProjectPopupData(advanceDetails);
      setProjectPopupContext(buildFirstTablePopupContext({
        contractorVendorId,
        contractorVendorType,
        contractorOptions,
        vendorOptions,
        selectedOption: selectedContractorOrVendorOption,
        projectId,
        siteOptions,
        projectName,
      }));
      setShowProjectPopup(true);
    }
  };
  const handleProjectBillClick = (projectId, contractorVendorId, contractorVendorType, projectName) => {
    const billDetails = getBillDetails(projectId, contractorVendorId, contractorVendorType);
    if (billDetails.length > 0) {
      setProjectPopupTitle('Bill Details');
      setProjectPopupData(billDetails);
      setProjectPopupContext(buildFirstTablePopupContext({
        contractorVendorId,
        contractorVendorType,
        contractorOptions,
        vendorOptions,
        selectedOption: selectedContractorOrVendorOption,
        projectId,
        siteOptions,
        projectName,
      }));
      setShowProjectPopup(true);
    }
  };

  // Click handlers for second table (Contractor/Vendor table) - Opens popup
  const handleSiteAdvanceClick = (projectId, contractorVendorId, contractorVendorType, contractorVendorName) => {
    const advanceDetails = getAdvanceDetails(projectId, contractorVendorId, contractorVendorType);
    if (advanceDetails.length > 0) {
      setSitePopupTitle('Advance Details');
      setSitePopupData(advanceDetails);
      setSitePopupContext(buildSecondTablePopupContext({
        projectId,
        siteOptions,
        selectedSite: selectedAdvanceSite,
        contractorVendorName,
      }));
      setShowSitePopup(true);
    }
  };
  const handleSiteBillClick = (projectId, contractorVendorId, contractorVendorType, contractorVendorName) => {
    const billDetails = getBillDetails(projectId, contractorVendorId, contractorVendorType);
    if (billDetails.length > 0) {
      setSitePopupTitle('Bill Details');
      setSitePopupData(billDetails);
      setSitePopupContext(buildSecondTablePopupContext({
        projectId,
        siteOptions,
        selectedSite: selectedAdvanceSite,
        contractorVendorName,
      }));
      setShowSitePopup(true);
    }
  };

  // Click handlers for Bill Status - Opens combined popup showing both advances and bills
  const handleProjectBillStatusClick = (projectId, contractorVendorId, contractorVendorType, projectName) => {
    const advanceDetails = getAdvanceDetails(projectId, contractorVendorId, contractorVendorType);
    const billDetails = getBillDetails(projectId, contractorVendorId, contractorVendorType);

    setBillStatusPopupData({ advances: advanceDetails, bills: billDetails });
    setBillStatusPopupContext(buildFirstTablePopupContext({
      contractorVendorId,
      contractorVendorType,
      contractorOptions,
      vendorOptions,
      selectedOption: selectedContractorOrVendorOption,
      projectId,
      siteOptions,
      projectName,
    }));
    setIsBillStatusFromFirstTable(true);
    setShowBillStatusPopup(true);
  };

  const handleSiteBillStatusClick = (projectId, contractorVendorId, contractorVendorType, contractorVendorName) => {
    const advanceDetails = getAdvanceDetails(projectId, contractorVendorId, contractorVendorType);
    const billDetails = getBillDetails(projectId, contractorVendorId, contractorVendorType);

    setBillStatusPopupData({ advances: advanceDetails, bills: billDetails });
    setBillStatusPopupContext(buildSecondTablePopupContext({
      projectId,
      siteOptions,
      selectedSite: selectedAdvanceSite,
      contractorVendorName,
    }));
    setIsBillStatusFromFirstTable(false);
    setShowBillStatusPopup(true);
  };

  const handleProjectNameClick = (proj) => {
    if (!selectedContractorOrVendorOption || !proj?.projectId) return;
    const projectOption = siteOptions.find((s) => String(s.id) === String(proj.projectId)) || {
      id: proj.projectId,
      value: proj.projectName,
      label: proj.projectName
    };
    openAdvanceFormWithPrefill(selectedContractorOrVendorOption, projectOption);
  };

  const handleSiteNameClick = (siteRow) => {
    if (!selectedAdvanceSite || !siteRow?.entityId || !siteRow?.entityType) return;
    const sourceOptions = siteRow.entityType === 'Contractor' ? contractorOptions : vendorOptions;
    const matched = sourceOptions.find((o) => String(o.id) === String(siteRow.entityId));
    const contractorVendorOption = matched || {
      id: siteRow.entityId,
      value: siteRow.name,
      label: siteRow.name,
      type: siteRow.entityType
    };
    openAdvanceFormWithPrefill(contractorVendorOption, selectedAdvanceSite);
  };
  useEffect(() => {
    if (selectedAdvanceSite) {
      // When a specific site is selected, show contractors/vendors for that site only
      const siteId = selectedAdvanceSite.id;
      const filtered = advanceData.filter(item => item.project_id === siteId);
      const grouped = {};
      let totalPending = 0;
      let totalBill = 0;
      filtered.forEach(curr => {
        const {
          contractor_id,
          vendor_id,
          type,
          amount = 0,
          bill_amount = 0,
          refund_amount = 0,
          discount_amount = 0
        } = curr;
        const entityId = contractor_id || vendor_id;
        const entityType = contractor_id ? "Contractor" : "Vendor";
        const entityName =
          entityType === "Contractor"
            ? contractorOptions.find(c => c.id === entityId)?.label || "-"
            : vendorOptions.find(v => v.id === entityId)?.label || "-";
        if (!grouped[entityId]) {
          grouped[entityId] = {
            name: entityName,
            entityId: entityId,
            entityType: entityType,
            pendingAdvance: 0,
            billAmount: 0
          };
        }
        grouped[entityId].pendingAdvance += parseFloat(amount) || 0;
        // Net bill = bill_amount - discount_amount
        grouped[entityId].billAmount += (parseFloat(bill_amount) || 0) - (parseFloat(discount_amount) || 0);
        grouped[entityId].pendingAdvance -= ((parseFloat(bill_amount) || 0) - (parseFloat(discount_amount) || 0)) + (parseFloat(refund_amount) || 0);
      });
      const detailsArray = Object.values(grouped);
      detailsArray.forEach(d => {
        totalPending += d.pendingAdvance;
        totalBill += d.billAmount;
      });
      setSiteDetails(detailsArray);
      setSitePendingAdvance(totalPending);
      setSiteBillAmount(totalBill);
    } else {
      // When no site is selected, show all contractors/vendors with their totals across all sites
      const grouped = {};
      let totalPending = 0;
      let totalBill = 0;

      advanceData.forEach(curr => {
        const {
          contractor_id,
          vendor_id,
          type,
          amount = 0,
          bill_amount = 0,
          refund_amount = 0,
          discount_amount = 0
        } = curr;
        const entityId = contractor_id || vendor_id;
        const entityType = contractor_id ? "Contractor" : "Vendor";
        const entityName =
          entityType === "Contractor"
            ? contractorOptions.find(c => c.id === entityId)?.label || "-"
            : vendorOptions.find(v => v.id === entityId)?.label || "-";

        if (entityId && entityName !== "-") {
          if (!grouped[entityId]) {
            grouped[entityId] = {
              name: entityName,
              entityId: entityId,
              entityType: entityType,
              pendingAdvance: 0,
              billAmount: 0
            };
          }
          grouped[entityId].pendingAdvance += parseFloat(amount) || 0;
          // Net bill = bill_amount - discount_amount
          grouped[entityId].billAmount += (parseFloat(bill_amount) || 0) - (parseFloat(discount_amount) || 0);
          grouped[entityId].pendingAdvance -= ((parseFloat(bill_amount) || 0) - (parseFloat(discount_amount) || 0)) + (parseFloat(refund_amount) || 0);
        }
      });

      const detailsArray = Object.values(grouped);
      detailsArray.forEach(d => {
        totalPending += d.pendingAdvance;
        totalBill += d.billAmount;
      });
      setSiteDetails(detailsArray);
      setSitePendingAdvance(totalPending);
      setSiteBillAmount(totalBill);
    }
  }, [selectedAdvanceSite, advanceData, contractorOptions, vendorOptions]);
  const sortedFilteredData = useMemo(() => {
    const sorted = sortData(projectData, sortConfig, 'pendingAdvance', 'projectName');
    const q = projectSearch.trim();
    return sorted.filter((proj) => {
      if (selectProjectNameFilter && proj.projectName !== selectProjectNameFilter) return false;
      if (!matchesEdbcAmountFilter(proj.pendingAdvance, selectProjectAdvanceFilter)) return false;
      if (!matchesEdbcAmountFilter(proj.billAmount, selectProjectBillAmountFilter)) return false;
      const billStatus = proj.pendingAdvance > 0 ? 'Pending' : 'Bill Settled';
      if (selectProjectBillStatusFilter && billStatus !== selectProjectBillStatusFilter) return false;
      if (!matchesSummaryUniversalSearch(q, {
        name: proj.projectName,
        pendingAdvance: proj.pendingAdvance,
        billAmount: proj.billAmount,
      })) return false;
      return true;
    });
  }, [projectData, sortConfig, projectSearch, selectProjectNameFilter, selectProjectAdvanceFilter, selectProjectBillAmountFilter, selectProjectBillStatusFilter]);
  const sortedSiteDisplayData = useMemo(() => {
    const sorted = sortData(siteDetails, siteSortConfig);
    const q = siteSearch.trim();
    return sorted.filter((d) => {
      if (selectSiteContractorFilter) {
        if (
          d.entityId !== selectSiteContractorFilter.id ||
          d.entityType !== selectSiteContractorFilter.type
        ) return false;
      }
      if (!matchesEdbcAmountFilter(d.pendingAdvance, selectSiteAdvanceFilter)) return false;
      if (!matchesEdbcAmountFilter(d.billAmount, selectSiteBillAmountFilter)) return false;
      const billStatus = d.pendingAdvance > 0 ? 'Pending' : 'Bill Settled';
      if (selectSiteBillStatusFilter && billStatus !== selectSiteBillStatusFilter) return false;
      if (!matchesSummaryUniversalSearch(q, {
        name: d.name,
        pendingAdvance: d.pendingAdvance,
        billAmount: d.billAmount,
      })) return false;
      return true;
    });
  }, [siteDetails, siteSortConfig, siteSearch, selectSiteContractorFilter, selectSiteAdvanceFilter, selectSiteBillAmountFilter, selectSiteBillStatusFilter]);
  const projectNameFilterOptions = useMemo(
    () => [...new Set(projectData.map((p) => p.projectName))].sort().map((name) => ({ value: name, label: name })),
    [projectData],
  );
  const billStatusFilterOptions = useMemo(
    () => [{ value: 'Pending', label: 'Pending' }, { value: 'Bill Settled', label: 'Bill Settled' }],
    [],
  );
  const clearProjectContractorSelection = useCallback(() => {
    setSelectedContractorOrVendorOption(null);
    sessionStorage.removeItem('selectedContractorOrVendorOption');
    localStorage.removeItem('advanceContractorVendor');
  }, []);
  const clearProjectTableFilters = useCallback(() => {
    clearProjectContractorSelection();
    setProjectSearch('');
    setSelectProjectNameFilter('');
    setSelectProjectAdvanceFilter('');
    setSelectProjectBillAmountFilter('');
    setSelectProjectBillStatusFilter('');
    setSortConfig({ key: null, direction: 'asc' });
  }, [clearProjectContractorSelection]);
  const clearSiteTableFilters = useCallback(() => {
    setSelectedAdvanceSite(null);
    setSiteSearch('');
    setSelectSiteContractorFilter(null);
    setSelectSiteAdvanceFilter('');
    setSelectSiteBillAmountFilter('');
    setSelectSiteBillStatusFilter('');
    setSiteSortConfig({ key: null, direction: 'asc' });
  }, []);
  const hasProjectColumnFilters = Boolean(
    selectProjectNameFilter ||
    selectProjectAdvanceFilter.trim() ||
    selectProjectBillAmountFilter.trim() ||
    selectProjectBillStatusFilter
  );
  const hasSiteColumnFilters = Boolean(
    selectSiteContractorFilter ||
    selectSiteAdvanceFilter.trim() ||
    selectSiteBillAmountFilter.trim() ||
    selectSiteBillStatusFilter
  );
  const toggleProjectFilters = useCallback(() => {
    const willOpen = !showProjectFilters;
    const scroller = projectScrollRef.current;
    if (willOpen) {
      setShowProjectFilters(true);
      if (!scroller) return;
      if (scroller.scrollTop <= 0) return;
      if (projectFilterNudgeUsedRef.current) return;
      projectFilterNudgeUsedRef.current = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const h = projectFilterRowRef.current?.offsetHeight || 0;
          if (h > 0) {
            scroller.scrollTop = Math.max(0, scroller.scrollTop - h);
          }
        });
      });
      return;
    }
    const h = projectFilterRowRef.current?.offsetHeight || 0;
    setShowProjectFilters(false);
    if (!scroller || h <= 0 || !projectFilterNudgeUsedRef.current) return;
    projectFilterNudgeUsedRef.current = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scroller.scrollTop = scroller.scrollTop + h;
      });
    });
  }, [showProjectFilters, projectScrollRef]);
  const toggleSiteFilters = useCallback(() => {
    const willOpen = !showSiteFilters;
    const scroller = siteScrollRef.current;
    if (willOpen) {
      setShowSiteFilters(true);
      if (!scroller) return;
      if (scroller.scrollTop <= 0) return;
      if (siteFilterNudgeUsedRef.current) return;
      siteFilterNudgeUsedRef.current = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const h = siteFilterRowRef.current?.offsetHeight || 0;
          if (h > 0) {
            scroller.scrollTop = Math.max(0, scroller.scrollTop - h);
          }
        });
      });
      return;
    }
    const h = siteFilterRowRef.current?.offsetHeight || 0;
    setShowSiteFilters(false);
    if (!scroller || h <= 0 || !siteFilterNudgeUsedRef.current) return;
    siteFilterNudgeUsedRef.current = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scroller.scrollTop = scroller.scrollTop + h;
      });
    });
  }, [showSiteFilters, siteScrollRef]);
  useEffect(() => {
    if (!showProjectFilters) return;
    const scroller = projectScrollRef.current;
    if (!scroller) return;
    projectFilterNudgeUsedRef.current = false;
    requestAnimationFrame(() => {
      scroller.scrollTop = 0;
    });
  }, [
    selectProjectNameFilter,
    selectProjectAdvanceFilter,
    selectProjectBillAmountFilter,
    selectProjectBillStatusFilter,
  ]);
  useEffect(() => {
    if (!showSiteFilters) return;
    const scroller = siteScrollRef.current;
    if (!scroller) return;
    siteFilterNudgeUsedRef.current = false;
    requestAnimationFrame(() => {
      scroller.scrollTop = 0;
    });
  }, [
    selectSiteContractorFilter,
    selectSiteAdvanceFilter,
    selectSiteBillAmountFilter,
    selectSiteBillStatusFilter,
  ]);
  const projectTableTotals = useMemo(() => ({
    advance: projectData.reduce((sum, row) => sum + (parseFloat(row.pendingAdvance) || 0), 0),
    billAmount: projectData.reduce((sum, row) => sum + (parseFloat(row.billAmount) || 0), 0),
  }), [projectData]);
  const siteTableTotals = useMemo(() => ({
    advance: siteDetails.reduce((sum, row) => sum + (parseFloat(row.pendingAdvance) || 0), 0),
    billAmount: siteDetails.reduce((sum, row) => sum + (parseFloat(row.billAmount) || 0), 0),
  }), [siteDetails]);
  const handleProjectEdbcSort = (field) => {
    if (field === 'siteName') handleSort('projectName');
    else if (field === 'amount') handleSort('pendingAdvance');
    else if (field === 'paymentMode') handleSort('billStatus');
  };
  const handleSiteEdbcSort = (field) => {
    if (field === 'vendor') handleSiteSort('name');
    else if (field === 'amount') handleSiteSort('pendingAdvance');
    else if (field === 'paymentMode') handleSiteSort('billStatus');
  };
  const projectHeaderSortField = sortConfig.key === 'projectName'
    ? 'siteName'
    : sortConfig.key === 'pendingAdvance'
      ? 'amount'
      : sortConfig.key === 'billAmount'
        ? 'amount'
        : sortConfig.key === 'billStatus'
          ? 'paymentMode'
          : null;
  const siteHeaderSortField = siteSortConfig.key === 'name'
    ? 'vendor'
    : siteSortConfig.key === 'pendingAdvance'
      ? 'amount'
      : siteSortConfig.key === 'billAmount'
        ? 'amount'
        : siteSortConfig.key === 'billStatus'
          ? 'paymentMode'
          : null;
  const edbc2Config = getEdbcColumnConfig(EDBC_IDS.EDBC2);
  const edbc3Config = getEdbcColumnConfig(EDBC_IDS.EDBC3);
  const edbc4Config = getEdbcColumnConfig(EDBC_IDS.EDBC4);
  const edbc8Config = getEdbcColumnConfig(EDBC_IDS.EDBC8);
  const billStatusPopupEdbcSortField =
    billStatusPopupSortConfig.key === 'contractorVendorName' || billStatusPopupSortConfig.key === 'transferSiteName'
      ? 'vendor'
      : billStatusPopupSortConfig.key === 'projectName'
        ? 'siteName'
        : billStatusPopupSortConfig.key;
  const billStatusPopupTableClass = isBillStatusFromFirstTable
    ? SUMMARY_BILL_STATUS_LEFT_POPUP_TABLE_CLASS
    : SUMMARY_BILL_STATUS_RIGHT_POPUP_TABLE_CLASS;
  const projectPopupEdbcSortField =
    projectPopupSortConfig.key === 'contractorVendorName' || projectPopupSortConfig.key === 'transferSiteName'
      ? 'vendor'
      : projectPopupSortConfig.key;
  const sitePopupEdbcSortField =
    sitePopupSortConfig.key === 'projectName' || sitePopupSortConfig.key === 'transferSiteName'
      ? 'vendor'
      : sitePopupSortConfig.key;
  const exportPDF = () => {
    const doc = new jsPDF();
    if (selectedContractorOrVendorOption) {
      const { type, label } = selectedContractorOrVendorOption;
      const titleText = `${type} - ${label}`;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(titleText, 14, 15);
    }
    const tableColumn = ["Project Name", "Pending Advance", "Bill Amount", "Bill Status"];
    const tableRows = [];
    sortedFilteredData.forEach(proj => {
      const status = proj.pendingAdvance > 0 ? "Pending" : "Bill Settled";
      tableRows.push([
        proj.projectName,
        proj.pendingAdvance.toLocaleString("en-IN"),
        proj.billAmount.toLocaleString("en-IN"),
        status
      ]);
    });
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      startY: selectedContractorOrVendorOption ? 20 : 10,
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
        1: { halign: 'right' }, // Pending Advance
        2: { halign: 'right' }  // Bill Amount
      }
    });
    doc.save("Project_Report.pdf");
  };
  const exportCSV = () => {
    let extraRow = [];
    if (selectedContractorOrVendorOption) {
      const { type, label } = selectedContractorOrVendorOption;
      extraRow = [[`${type} - ${label}`]];
    }
    const headers = ["Project Name", "Pending Advance", "Bill Amount", "Bill Status"];
    const sortedProjectData = sortData(projectData, sortConfig, 'pendingAdvance', 'projectName');
    const rows = sortedFilteredData.map(proj => [
      proj.projectName,
      proj.pendingAdvance,
      proj.billAmount,
      proj.pendingAdvance > 0 ? "Pending" : "Bill Settled"
    ]);
    let csvContent = "data:text/csv;charset=utf-8,"
      + [...extraRow, headers, ...rows]
        .map(e => e.join(","))
        .join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "Project_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const exportsiteNamePDF = () => {
    const doc = new jsPDF();
    if (selectedAdvanceSite) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Site Name - ${selectedAdvanceSite.label}`, 14, 15);
    } else {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("All Sites - Contractor/Vendor Summary", 14, 15);
    }
    const tableColumn = ["Contractor/Vendor", "Pending Advance", "Bill Amount", "Bill Status"];
    const tableRows = [];
    const sortedSiteDetails = sortData(siteDetails, siteSortConfig);
    sortedSiteDetails.forEach(d => {
      const status = d.pendingAdvance > 0 ? "Pending" : "Bill Settled";
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
        1: { halign: 'right' }, // Pending Advance
        2: { halign: 'right' }  // Bill Amount
      }
    });
    const fileName = selectedAdvanceSite ? "Site_Report.pdf" : "All_Sites_Contractor_Report.pdf";
    doc.save(fileName);
  };
  const exportSiteNameCSV = () => {
    let extraRow = [];
    if (selectedAdvanceSite) {
      extraRow = [[`Site Name - ${selectedAdvanceSite.label}`]];
    } else {
      extraRow = [["All Sites - Contractor/Vendor Summary"]];
    }
    const headers = ["Contractor/Vendor", "Pending Advance", "Bill Amount", "Bill Status"];
    const sortedSiteDetails = sortData(siteDetails, siteSortConfig);
    const rows = sortedSiteDetails.map(d => [
      d.name,
      d.pendingAdvance,
      d.billAmount,
      d.pendingAdvance > 0 ? "Pending" : "Bill Settled"
    ]);
    let csvContent = "data:text/csv;charset=utf-8,"
      + [...extraRow, headers, ...rows]
        .map(e => e.join(","))
        .join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    const fileName = selectedAdvanceSite ? "Site_Report.csv" : "All_Sites_Contractor_Report.csv";
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Popup sorting handlers
  const handleProjectPopupSort = (key) => {
    const resolvedKey = key === 'vendor'
      ? (selectedContractorOrVendorOption ? 'transferSiteName' : 'contractorVendorName')
      : key;
    let direction = 'asc';
    if (projectPopupSortConfig.key === resolvedKey && projectPopupSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setProjectPopupSortConfig({ key: resolvedKey, direction });
  };

  const handleSitePopupSort = (key) => {
    const resolvedKey = key === 'vendor'
      ? (selectedAdvanceSite ? 'transferSiteName' : 'projectName')
      : key;
    let direction = 'asc';
    if (sitePopupSortConfig.key === resolvedKey && sitePopupSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSitePopupSortConfig({ key: resolvedKey, direction });
  };

  const handleBillStatusPopupSort = (key) => {
    const resolvedKey = key === 'vendor'
      ? (isBillStatusFromFirstTable
        ? (selectedContractorOrVendorOption ? 'transferSiteName' : 'contractorVendorName')
        : (selectedAdvanceSite ? 'transferSiteName' : 'projectName'))
      : key === 'siteName'
        ? (selectedAdvanceSite ? 'transferSiteName' : 'projectName')
        : key;
    let direction = 'asc';
    if (billStatusPopupSortConfig.key === resolvedKey && billStatusPopupSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setBillStatusPopupSortConfig({ key: resolvedKey, direction });
  };

  // Sort popup data
  const sortPopupData = (data, config) => {
    if (!data || data.length === 0) return [];

    // Helper function to parse date string (DD/MM/YYYY) to Date object
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`);
    };

    // Default: Sort by date in descending order (newest/most recent date first)
    if (!config.key) {
      return [...data].sort((a, b) => {
        const aDate = parseDate(a.date);
        const bDate = parseDate(b.date);
        return bDate - aDate; // Descending order: most recent date first
      });
    }

    return [...data].sort((a, b) => {
      let aValue = a[config.key];
      let bValue = b[config.key];

      // Handle date sorting
      if (config.key === 'date') {
        aValue = parseDate(aValue);
        bValue = parseDate(bValue);
        return config.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }

      // Handle numeric sorting
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return config.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle string sorting
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();
      if (aValue < bValue) return config.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return config.direction === 'asc' ? 1 : -1;
      return 0;
    });
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

  // Export Popup PDF
  const exportPopupPDF = (data, title, context, isProjectPopup) => {
    const doc = new jsPDF();
    const contextText = formatSummaryPopupContextText(context);
    const tableStartY = writeSummaryPopupContextToPdf(doc, context, title);

    const tableColumn = isProjectPopup && selectedContractorOrVendorOption
      ? ["Date", "Transfer", "Amount"]
      : isProjectPopup
        ? ["Date", "Contractor/Vendor", "Amount"]
        : selectedAdvanceSite
          ? ["Date", "Transfer", "Amount"]
          : ["Date", "Project Name", "Amount"];

    const tableRows = [];
    data.forEach(entry => {
      const row = [entry.date];

      if (isProjectPopup && selectedContractorOrVendorOption) {
        let transferInfo = '';
        if (entry.isRefund) {
          transferInfo = 'Refund';
        } else if (entry.type === 'Transfer' && entry.transferSiteName) {
          transferInfo = `${entry.amount < 0 ? 'To: ' : 'From: '}${entry.transferSiteName}`;
        }
        row.push(transferInfo);
      } else if (isProjectPopup) {
        row.push(entry.contractorVendorName || "");
      } else if (selectedAdvanceSite) {
        let transferInfo = '';
        if (entry.isRefund) {
          transferInfo = 'Refund';
        } else if (entry.type === 'Transfer' && entry.transferSiteName) {
          transferInfo = `${entry.amount < 0 ? 'To: ' : 'From: '}${entry.transferSiteName}`;
        }
        row.push(transferInfo);
      } else {
        row.push(entry.projectName || "");
      }

      row.push(entry.amount.toLocaleString("en-IN"));
      tableRows.push(row);
    });

    // Add total row
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    const totalRow = ["Total"];
    if (isProjectPopup && selectedContractorOrVendorOption) {
      totalRow.push("");
    } else if (isProjectPopup) {
      totalRow.push("");
    } else if (selectedAdvanceSite) {
      totalRow.push("");
    } else {
      totalRow.push("");
    }
    totalRow.push(total.toLocaleString("en-IN"));
    tableRows.push(totalRow);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      startY: tableStartY,
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
        2: { halign: 'right' }  // Amount column
      },
      didParseCell: function (data) {
        // Make the total row bold
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [255, 255, 255];
        }
      }
    });

    const fileName = `${contextText.replace(/[^a-z0-9]/gi, '_')}_${title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    doc.save(fileName);
  };

  // Export Popup CSV
  const exportPopupCSV = (data, title, context, isProjectPopup) => {
    const contextText = formatSummaryPopupContextText(context);
    const extraRow = [[contextText], [title], []];

    const headers = isProjectPopup && selectedContractorOrVendorOption
      ? ["Date", "Transfer", "Amount"]
      : isProjectPopup
        ? ["Date", "Contractor/Vendor", "Amount"]
        : selectedAdvanceSite
          ? ["Date", "Transfer", "Amount"]
          : ["Date", "Project Name", "Amount"];

    const rows = data.map(entry => {
      const row = [entry.date];

      if (isProjectPopup && selectedContractorOrVendorOption) {
        let transferInfo = '';
        if (entry.isRefund) {
          transferInfo = 'Refund';
        } else if (entry.type === 'Transfer' && entry.transferSiteName) {
          transferInfo = `${entry.amount < 0 ? 'To: ' : 'From: '}${entry.transferSiteName}`;
        } else {
          transferInfo = '-';
        }
        row.push(transferInfo);
      } else if (isProjectPopup) {
        row.push(entry.contractorVendorName || "-");
      } else if (selectedAdvanceSite) {
        let transferInfo = '';
        if (entry.isRefund) {
          transferInfo = 'Refund';
        } else if (entry.type === 'Transfer' && entry.transferSiteName) {
          transferInfo = `${entry.amount < 0 ? 'To: ' : 'From: '}${entry.transferSiteName}`;
        } else {
          transferInfo = '-';
        }
        row.push(transferInfo);
      } else {
        row.push(entry.projectName || "-");
      }
      row.push(entry.amount);
      return row;
    });
    // Add total row
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    rows.push(["Total", "", total]);
    let csvContent = "data:text/csv;charset=utf-8,"
      + [...extraRow, headers, ...rows]
        .map(e => e.join(","))
        .join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    const fileName = `${contextText.replace(/[^a-z0-9]/gi, '_')}_${title.replace(/[^a-z0-9]/gi, '_')}.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Bill Status Popup PDF
  const exportBillStatusPDF = () => {
    const doc = new jsPDF();
    const contextText = formatSummaryPopupContextText(billStatusPopupContext);
    const tableStartY = writeSummaryPopupContextToPdf(doc, billStatusPopupContext, 'Bill Status Details');

    // Determine columns based on context
    let tableColumn = ["Date"];
    if (!isBillStatusFromFirstTable && !selectedAdvanceSite) {
      tableColumn.push("Project Name");
    } else if (isBillStatusFromFirstTable && !selectedContractorOrVendorOption) {
      tableColumn.push("Contractor/Vendor");
    } else if ((isBillStatusFromFirstTable && selectedContractorOrVendorOption) ||
      (!isBillStatusFromFirstTable && selectedAdvanceSite)) {
      tableColumn.push("Transfer");
    }
    tableColumn.push("Advance Amount", "Bill Amount");

    // Prepare data
    const combinedData = [];
    const dateMap = new Map();

    billStatusPopupData.advances.forEach(adv => {
      const key = `${adv.date}-${adv.advancePortalId}-${adv.kind || 'main'}`;
      dateMap.set(key, {
        date: adv.date,
        advancePortalId: adv.advancePortalId,
        advanceAmount: adv.amount,
        billAmount: 0,
        projectName: adv.projectName,
        contractorVendorName: adv.contractorVendorName,
        transferSiteName: adv.transferSiteName,
        type: adv.type,
        isRefund: adv.isRefund
      });
    });

    billStatusPopupData.bills.forEach(bill => {
      const key = `${bill.date}-${bill.advancePortalId}-${bill.kind || 'main'}`;
      if (dateMap.has(key)) {
        dateMap.get(key).billAmount = bill.amount;
        dateMap.get(key).file_url = bill.file_url || null;
        dateMap.get(key).type = bill.type || dateMap.get(key).type;
      } else {
        dateMap.set(key, {
          date: bill.date,
          advancePortalId: bill.advancePortalId,
          advanceAmount: 0,
          billAmount: bill.amount,
          projectName: bill.projectName,
          contractorVendorName: bill.contractorVendorName,
          transferSiteName: bill.transferSiteName,
          type: bill.type,
          isRefund: false,
          file_url: bill.file_url || null
        });
      }
    });

    combinedData.push(...Array.from(dateMap.values()));

    // Sort by date (newest first)
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`);
    };

    // Apply sorting based on billStatusPopupSortConfig
    if (!billStatusPopupSortConfig.key) {
      combinedData.sort((a, b) => {
        const dateDiff = parseDate(b.date) - parseDate(a.date);
        if (dateDiff !== 0) return dateDiff;
        // Secondary sort by advancePortalId (entry number) - descending to match date order
        return b.advancePortalId - a.advancePortalId;
      });
    } else {
      combinedData.sort((a, b) => {
        let aValue = a[billStatusPopupSortConfig.key];
        let bValue = b[billStatusPopupSortConfig.key];

        if (billStatusPopupSortConfig.key === 'date') {
          aValue = parseDate(aValue);
          bValue = parseDate(bValue);
          const primarySort = billStatusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
          if (primarySort !== 0) return primarySort;
          // Secondary sort by advancePortalId (entry number) - match the direction of date sort
          return billStatusPopupSortConfig.direction === 'asc' ? a.advancePortalId - b.advancePortalId : b.advancePortalId - a.advancePortalId;
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          const primarySort = billStatusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
          if (primarySort !== 0) return primarySort;
          // Secondary sort by advancePortalId (entry number) - always ascending for amounts
          return a.advancePortalId - b.advancePortalId;
        }

        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
        if (aValue < bValue) return billStatusPopupSortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return billStatusPopupSortConfig.direction === 'asc' ? 1 : -1;
        // Secondary sort by advancePortalId (entry number) - always ascending for text fields
        return a.advancePortalId - b.advancePortalId;
      });
    }

    const tableRows = [];
    combinedData.forEach(entry => {
      const row = [entry.date];

      if (!isBillStatusFromFirstTable && !selectedAdvanceSite) {
        row.push(entry.projectName || "-");
      } else if (isBillStatusFromFirstTable && !selectedContractorOrVendorOption) {
        row.push(entry.contractorVendorName || "-");
      } else if ((isBillStatusFromFirstTable && selectedContractorOrVendorOption) ||
        (!isBillStatusFromFirstTable && selectedAdvanceSite)) {
        let transferInfo = '-';
        if (entry.isRefund) {
          transferInfo = 'Refund';
        } else if (entry.type === 'Transfer' && entry.transferSiteName) {
          transferInfo = `${entry.advanceAmount < 0 ? 'To: ' : 'From: '}${entry.transferSiteName}`;
        }
        row.push(transferInfo);
      }

      row.push(
        entry.advanceAmount !== 0 ? entry.advanceAmount.toLocaleString("en-IN") : "-",
        entry.billAmount !== 0 ? entry.billAmount.toLocaleString("en-IN") : "-"
      );
      tableRows.push(row);
    });

    // Add total row
    const totalAdvance = billStatusPopupData.advances.reduce((sum, item) => sum + item.amount, 0);
    const totalBill = billStatusPopupData.bills.reduce((sum, item) => sum + item.amount, 0);
    const totalRow = ["Total"];
    if (tableColumn.length === 4) totalRow.push("");
    totalRow.push(
      totalAdvance.toLocaleString("en-IN"),
      totalBill.toLocaleString("en-IN")
    );
    tableRows.push(totalRow);

    // Add balance row
    const balance = totalAdvance - totalBill;
    const balanceRow = ["Balance Advance"];
    if (tableColumn.length === 4) balanceRow.push("");
    balanceRow.push("", balance.toLocaleString("en-IN"));
    tableRows.push(balanceRow);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      startY: tableStartY,
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
        2: { halign: 'right' }, // Advance Amount
        3: { halign: 'right' }  // Bill Amount
      },
      didParseCell: function (data) {
        // Make the total and balance rows bold
        if (data.row.index === tableRows.length - 2 || data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          if (data.row.index === tableRows.length - 1) {
            data.cell.styles.fillColor = [191, 152, 83]; // Gold color for balance
            data.cell.styles.textColor = [255, 255, 255]; // White text
          } else {
            data.cell.styles.fillColor = [248, 241, 229]; // Light beige for total
          }
        }
      }
    });

    const fileName = `${contextText.replace(/[^a-z0-9]/gi, '_')}_Bill_Status.pdf`;
    doc.save(fileName);
  };

  // Export Bill Status Popup CSV
  const exportBillStatusCSV = () => {
    const contextText = formatSummaryPopupContextText(billStatusPopupContext);
    const extraRow = [[contextText], ["Bill Status Details"], []];

    // Determine columns based on context
    let headers = ["Date"];
    if (!isBillStatusFromFirstTable && !selectedAdvanceSite) {
      headers.push("Project Name");
    } else if (isBillStatusFromFirstTable && !selectedContractorOrVendorOption) {
      headers.push("Contractor/Vendor");
    } else if ((isBillStatusFromFirstTable && selectedContractorOrVendorOption) ||
      (!isBillStatusFromFirstTable && selectedAdvanceSite)) {
      headers.push("Transfer");
    }
    headers.push("Advance Amount", "Bill Amount");

    // Prepare data
    const combinedData = [];
    const dateMap = new Map();

    billStatusPopupData.advances.forEach(adv => {
      const key = `${adv.date}-${adv.advancePortalId}`;
      dateMap.set(key, {
        date: adv.date,
        advancePortalId: adv.advancePortalId,
        advanceAmount: adv.amount,
        billAmount: 0,
        projectName: adv.projectName,
        contractorVendorName: adv.contractorVendorName,
        transferSiteName: adv.transferSiteName,
        type: adv.type,
        isRefund: adv.isRefund
      });
    });

    billStatusPopupData.bills.forEach(bill => {
      const key = `${bill.date}-${bill.advancePortalId}`;
      if (dateMap.has(key)) {
        dateMap.get(key).billAmount = bill.amount;
        dateMap.get(key).file_url = bill.file_url || null;
      } else {
        dateMap.set(key, {
          date: bill.date,
          advancePortalId: bill.advancePortalId,
          advanceAmount: 0,
          billAmount: bill.amount,
          projectName: bill.projectName,
          contractorVendorName: bill.contractorVendorName,
          transferSiteName: bill.transferSiteName,
          type: bill.type,
          isRefund: false,
          file_url: bill.file_url || null
        });
      }
    });

    combinedData.push(...Array.from(dateMap.values()));

    // Sort by date (newest first)
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month}-${day}`);
    };

    // Apply sorting based on billStatusPopupSortConfig
    if (!billStatusPopupSortConfig.key) {
      combinedData.sort((a, b) => {
        const dateDiff = parseDate(b.date) - parseDate(a.date);
        if (dateDiff !== 0) return dateDiff;
        // Secondary sort by advancePortalId (entry number) - descending to match date order
        return b.advancePortalId - a.advancePortalId;
      });
    } else {
      combinedData.sort((a, b) => {
        let aValue = a[billStatusPopupSortConfig.key];
        let bValue = b[billStatusPopupSortConfig.key];

        if (billStatusPopupSortConfig.key === 'date') {
          aValue = parseDate(aValue);
          bValue = parseDate(bValue);
          const primarySort = billStatusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
          if (primarySort !== 0) return primarySort;
          // Secondary sort by advancePortalId (entry number) - match the direction of date sort
          return billStatusPopupSortConfig.direction === 'asc' ? a.advancePortalId - b.advancePortalId : b.advancePortalId - a.advancePortalId;
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          const primarySort = billStatusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
          if (primarySort !== 0) return primarySort;
          // Secondary sort by advancePortalId (entry number) - always ascending for amounts
          return a.advancePortalId - b.advancePortalId;
        }

        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
        if (aValue < bValue) return billStatusPopupSortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return billStatusPopupSortConfig.direction === 'asc' ? 1 : -1;
        // Secondary sort by advancePortalId (entry number) - always ascending for text fields
        return a.advancePortalId - b.advancePortalId;
      });
    }

    const rows = combinedData.map(entry => {
      const row = [entry.date];

      if (!isBillStatusFromFirstTable && !selectedAdvanceSite) {
        row.push(entry.projectName || "-");
      } else if (isBillStatusFromFirstTable && !selectedContractorOrVendorOption) {
        row.push(entry.contractorVendorName || "-");
      } else if ((isBillStatusFromFirstTable && selectedContractorOrVendorOption) ||
        (!isBillStatusFromFirstTable && selectedAdvanceSite)) {
        let transferInfo = '-';
        if (entry.isRefund) {
          transferInfo = 'Refund';
        } else if (entry.type === 'Transfer' && entry.transferSiteName) {
          transferInfo = `${entry.advanceAmount < 0 ? 'To: ' : 'From: '}${entry.transferSiteName}`;
        }
        row.push(transferInfo);
      }

      row.push(
        entry.advanceAmount !== 0 ? entry.advanceAmount : "-",
        entry.billAmount !== 0 ? entry.billAmount : "-"
      );
      return row;
    });

    // Add total row
    const totalAdvance = billStatusPopupData.advances.reduce((sum, item) => sum + item.amount, 0);
    const totalBill = billStatusPopupData.bills.reduce((sum, item) => sum + item.amount, 0);
    const totalRow = ["Total"];
    if (headers.length === 4) totalRow.push("");
    totalRow.push(totalAdvance, totalBill);
    rows.push(totalRow);

    // Add balance row
    const balance = totalAdvance - totalBill;
    const balanceRow = ["Balance Advance"];
    if (headers.length === 4) balanceRow.push("");
    balanceRow.push("", balance);
    rows.push(balanceRow);

    let csvContent = "data:text/csv;charset=utf-8,"
      + [...extraRow, headers, ...rows]
        .map(e => e.join(","))
        .join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    const fileName = `${contextText.replace(/[^a-z0-9]/gi, '_')}_Bill_Status.csv`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Keep rendering the page while loading; data will populate once fetched.

  if (error) {
    return (
      <body className='bg-[#FAF6ED]'>
        <div className='bg-white w-full max-w-[1850px] h-[500px] rounded-md p-10 ml-4 sm:ml-6 lg:ml-10 flex items-center justify-center mx-auto'>
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </body>
    );
  }

  return (
    <div className='flex flex-col h-[calc(100vh-104px)] overflow-hidden bg-[#FAF6ED]'>
      <div className='p-[18px] flex flex-col flex-1 min-h-0 overflow-hidden bg-[#FAF6ED]'>
        <div className="flex flex-col xl:flex-row gap-[18px] flex-1 min-h-0 max-h-full overflow-visible px-[24px] py-[24px] items-stretch bg-white">
          <div className={`flex flex-col flex-1 min-w-0 min-h-0 max-h-full overflow-hidden bg-white rounded-[6px] max-w-[770px] ${SUMMARY_PANEL_SHADOW} px-[24px] py-[24px]`}>
            <div className="w-full min-w-0 flex flex-col flex-1 min-h-0 max-h-full">
              <div className="flex flex-wrap justify-between items-start gap-[12px] mb-[18px] shrink-0 w-full">
                <div className="text-left max-w-[220px]">
                  <label className="block font-semibold mb-[8px]">Vendor/Contractor</label>
                  <Select
                    options={combinedOptions}
                    value={selectedContractorOrVendorOption}
                    onChange={(selectedOption) => {
                      setSelectedContractorOrVendorOption(selectedOption);
                    }}
                    placeholder="Vendor/Contractor"
                    className={SUMMARY_OUTSIDE_SELECT_CLASS}
                    isClearable
                    menuPortalTarget={document.body}
                    styles={summaryOutsideSelectStyles}
                  />
                </div>
                <div className="rounded-md px-4 py-[8px] mt-[8px] text-sm shrink-0 " style={SUMMARY_BOX_STYLE}>
                  <div className="flex justify-between text-[14px] gap-6 py-0.5">
                    <span className="flex shrink-0 w-[130px] text-black font-semibold">
                      <span className="whitespace-nowrap">Project Advance</span>
                      <span className="ml-auto">:</span>
                    </span>
                    <span className="font-semibold" style={{ color: '#E4572E' }}>
                      {formatSummaryAmount(totalPendingAdvance)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[14px] gap-6 py-0.5">
                    <span className="flex shrink-0 w-[130px] text-black font-semibold">
                      <span className="whitespace-nowrap">Bill Amount</span>
                      <span className="ml-auto">:</span>
                    </span>
                    <span className="font-semibold" style={{ color: '#E4572E' }}>
                      {formatSummaryAmount(totalBillAmount)}
                    </span>
                  </div>
                </div>
              </div>
              <div className='border border-gray-200 px-[18px] pt-[18px] flex flex-col flex-1 min-h-0 overflow-hidden'>
                <div className="flex min-w-0 w-full flex-nowrap items-center justify-between gap-[6px] mb-[9px] shrink-0 overflow-hidden">
                  <div className={`flex min-w-0 items-center overflow-hidden gap-[6px]${hasProjectColumnFilters ? ' flex-1 min-w-0' : ' shrink-0'}`}>
                    <EdbcFilterToggleButton onClick={toggleProjectFilters} />
                    {hasProjectColumnFilters && (
                      <div className="flex min-w-0 flex-1 overflow-x-auto flex-nowrap gap-2 no-scrollbar scrollbar-none">
                        {selectProjectNameFilter && (
                          <SummaryFilterChip
                            label="Project Name"
                            value={selectProjectNameFilter}
                            onClear={() => setSelectProjectNameFilter('')}
                          />
                        )}
                        {selectProjectAdvanceFilter.trim() && (
                          <SummaryFilterChip
                            label="Advance"
                            value={selectProjectAdvanceFilter}
                            onClear={() => setSelectProjectAdvanceFilter('')}
                          />
                        )}
                        {selectProjectBillAmountFilter.trim() && (
                          <SummaryFilterChip
                            label="Bill Amount"
                            value={selectProjectBillAmountFilter}
                            onClear={() => setSelectProjectBillAmountFilter('')}
                          />
                        )}
                        {selectProjectBillStatusFilter && (
                          <SummaryFilterChip
                            label="Bill Status"
                            value={selectProjectBillStatusFilter}
                            onClear={() => setSelectProjectBillStatusFilter('')}
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 items-center justify-end gap-[6px] shrink-0">
                    <EdbcTableToolbarRightActions
                      onClearFilters={clearProjectTableFilters}
                      overallSearch={projectSearch}
                      onOverallSearchChange={setProjectSearch}
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
                    ref={projectTableScroll.scrollRef}
                    className="rounded-lg border-l-8 border-l-[#BF9853] flex-1 min-h-0 overflow-y-auto overflow-x-auto no-scrollbar scrollbar-none w-full"
                    onMouseDown={projectTableScroll.handleMouseDown}
                  >
                    <table className={`${SUMMARY_PROJECT_TABLE_CLASS} ${showProjectFilters ? '[&_thead_tr:first-child_th]:!border-b-0' : ''}`}>
                      <thead className="sticky top-0 z-20 bg-white">
                        <EdbcTableHeaderRow>
                          <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC3}
                            label="Project Name"
                            sortField={projectHeaderSortField}
                            sortDirection={sortConfig.direction}
                            onSort={handleProjectEdbcSort}
                          />
                          <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC8}
                            label="Advance"
                            sortField={projectHeaderSortField}
                            sortDirection={sortConfig.direction}
                            onSort={handleProjectEdbcSort}
                          />
                          <EdbcColumnHeader columnId={EDBC_IDS.EDBC8} label="Bill Amount" />
                          <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC13}
                            label="Bill Status"
                            sortField={projectHeaderSortField}
                            sortDirection={sortConfig.direction}
                            onSort={handleProjectEdbcSort}
                          />
                        </EdbcTableHeaderRow>
                        {showProjectFilters && (
                          <EdbcTableFilterRow ref={projectFilterRowRef}>
                            <EdbcProjectNameFilter
                              placeholder="Project Name"
                              options={projectNameFilterOptions}
                              value={selectProjectNameFilter}
                              onChange={setSelectProjectNameFilter}
                              selectStyles={SUMMARY_FIRST_COLUMN_FILTER_SELECT_STYLES}
                            />
                            <EdbcTotalAmountFilter
                              columnId={EDBC_IDS.EDBC8}
                              totalAmount={projectTableTotals.advance}
                              value={selectProjectAdvanceFilter}
                              onChange={(e) => setSelectProjectAdvanceFilter(e.target.value)}
                            />
                            <EdbcTotalAmountFilter
                              columnId={EDBC_IDS.EDBC8}
                              totalAmount={projectTableTotals.billAmount}
                              value={selectProjectBillAmountFilter}
                              onChange={(e) => setSelectProjectBillAmountFilter(e.target.value)}
                            />
                            <SummaryEdbcSelectFilter
                              columnId={EDBC_IDS.EDBC13}
                              placeholder="Bill Status"
                              options={billStatusFilterOptions}
                              value={selectProjectBillStatusFilter}
                              onChange={setSelectProjectBillStatusFilter}
                            />
                          </EdbcTableFilterRow>
                        )}
                      </thead>
                      <tbody>
                        {sortedFilteredData.length > 0 ? (
                          sortedFilteredData.map((proj, idx) => (
                            <EdbcTableBodyRow key={proj.projectId ?? idx}>
                              <EdbcExpandableBodyCell
                                columnId={EDBC_IDS.EDBC3}
                                expense={{ id: proj.projectId, ...proj }}
                                rowIndex={idx}
                                expandedCells={projectExpandedCells}
                                onToggleExpanded={toggleProjectExpandedCell}
                                getDisplayValue={(row) => row.projectName}
                              />
                              <td
                                id={EDBC_IDS.EDBC8}
                                className={edbc8Config?.tdClass}
                                onMouseEnter={(e) => handleProjectAdvanceMouseEnter(e, proj.projectId, selectedContractorOrVendorOption?.id, selectedContractorOrVendorOption?.type)}
                                onMouseLeave={handleProjectMouseLeave}
                              >
                                <span
                                  onClick={() => handleProjectAdvanceClick(proj.projectId, selectedContractorOrVendorOption?.id, selectedContractorOrVendorOption?.type, proj.projectName)}
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    toggleProjectExpandedCell(`${proj.projectId ?? idx}-amount`);
                                  }}
                                  className={`block w-full cursor-pointer ${projectExpandedCells[`${proj.projectId ?? idx}-amount`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                  title={formatSummaryAmount(proj.pendingAdvance)}
                                >
                                  {formatSummaryAmount(proj.pendingAdvance)}
                                </span>
                              </td>
                              <td
                                className={edbc8Config?.tdClass}
                                onMouseEnter={(e) => handleProjectBillMouseEnter(e, proj.projectId, selectedContractorOrVendorOption?.id, selectedContractorOrVendorOption?.type)}
                                onMouseLeave={handleProjectMouseLeave}
                              >
                                <span
                                  onClick={() => handleProjectBillClick(proj.projectId, selectedContractorOrVendorOption?.id, selectedContractorOrVendorOption?.type, proj.projectName)}
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    toggleProjectExpandedCell(`${proj.projectId ?? idx}-bill_amount`);
                                  }}
                                  className={`block w-full cursor-pointer ${projectExpandedCells[`${proj.projectId ?? idx}-bill_amount`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                  title={formatSummaryAmount(proj.billAmount)}
                                >
                                  {formatSummaryAmount(proj.billAmount)}
                                </span>
                              </td>
                              {renderBillStatusBodyCell({
                                pendingAdvance: proj.pendingAdvance,
                                rowId: proj.projectId,
                                rowIndex: idx,
                                expandedCells: projectExpandedCells,
                                onToggleExpanded: toggleProjectExpandedCell,
                                onClick: () => handleProjectBillStatusClick(
                                  proj.projectId,
                                  selectedContractorOrVendorOption?.id,
                                  selectedContractorOrVendorOption?.type,
                                  proj.projectName
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
          <div className={`flex flex-col flex-1 min-w-0 min-h-0 max-h-full overflow-hidden bg-white rounded-[6px] max-w-[696px] ${SUMMARY_PANEL_SHADOW} px-[24px] py-[24px]`}>
            <div className="w-full min-w-0 flex flex-col flex-1 min-h-0 max-h-full">
              <div className="flex flex-wrap justify-between items-start gap-[12px] mb-[18px] shrink-0 w-full">
                <div className="text-left">
                  <label className="block font-semibold mb-[8px]">Project Name</label>
                  <Select
                    options={sortedSiteOptions || []}
                    value={selectedAdvanceSite}
                    onChange={setSelectedAdvanceSite}
                    placeholder="Project Name"
                    className={SUMMARY_PROJECT_NAME_SELECT_CLASS}
                    isSearchable={true}
                    isClearable
                    menuPortalTarget={document.body}
                    styles={summaryOutsideSelectStyles}
                  />
                </div>
                <div className="rounded-md px-4 py-[8px] mt-[8px] text-sm shrink-0" style={SUMMARY_BOX_STYLE}>
                  <div className="flex justify-between text-[14px] gap-6 py-0.5">
                    <span className="flex shrink-0 w-[130px] text-black font-semibold">
                      <span className="whitespace-nowrap">Project Advance</span>
                      <span className="ml-auto">:</span>
                    </span>
                    <span className="font-semibold" style={{ color: '#E4572E' }}>
                      {formatSummaryAmount(sitePendingAdvance)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[14px] gap-6 py-0.5">
                    <span className="flex shrink-0 w-[130px] text-black font-semibold">
                      <span className="whitespace-nowrap">Bill Amount</span>
                      <span className="ml-auto">:</span>
                    </span>
                    <span className="font-semibold" style={{ color: '#E4572E' }}>
                      {formatSummaryAmount(siteBillAmount)}
                    </span>
                  </div>
                </div>
              </div>
              <div className='border border-gray-200 px-[18px] pt-[18px] flex flex-col flex-1 min-h-0 overflow-hidden'>
                <div className="flex min-w-0 w-full flex-nowrap items-center justify-between gap-[6px] mb-[9px] shrink-0 overflow-hidden">
                  <div className={`flex min-w-0 items-center overflow-hidden gap-[6px]${hasSiteColumnFilters ? ' flex-1 min-w-0' : ' shrink-0'}`}>
                    <EdbcFilterToggleButton onClick={toggleSiteFilters} />
                    {hasSiteColumnFilters && (
                      <div className="flex min-w-0 flex-1 overflow-x-auto flex-nowrap gap-2 no-scrollbar scrollbar-none">
                        {selectSiteContractorFilter && (
                          <SummaryFilterChip
                            label="Contractor/Vendor"
                            value={selectSiteContractorFilter.label}
                            onClear={() => setSelectSiteContractorFilter(null)}
                          />
                        )}
                        {selectSiteAdvanceFilter.trim() && (
                          <SummaryFilterChip
                            label="Advance"
                            value={selectSiteAdvanceFilter}
                            onClear={() => setSelectSiteAdvanceFilter('')}
                          />
                        )}
                        {selectSiteBillAmountFilter.trim() && (
                          <SummaryFilterChip
                            label="Bill Amount"
                            value={selectSiteBillAmountFilter}
                            onClear={() => setSelectSiteBillAmountFilter('')}
                          />
                        )}
                        {selectSiteBillStatusFilter && (
                          <SummaryFilterChip
                            label="Bill Status"
                            value={selectSiteBillStatusFilter}
                            onClear={() => setSelectSiteBillStatusFilter('')}
                          />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 items-center justify-end gap-[6px] shrink-0">
                    <EdbcTableToolbarRightActions
                      onClearFilters={clearSiteTableFilters}
                      overallSearch={siteSearch}
                      onOverallSearchChange={setSiteSearch}
                      showExportIcons={false}
                      clearButtonType="button"
                      wrapperClassName={null}
                      searchWrapperClassName="h-[34px] min-w-0 flex-1 max-w-[286px] border border-[#D6D6D6] rounded-md bg-white flex items-center px-2 sm:w-[286px] sm:min-w-[286px] sm:flex-none sm:shrink-0"
                    />
                    <SummaryTableExportActions onExportPdf={exportsiteNamePDF} onExportCsv={exportSiteNameCSV} />
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden pb-[18px] flex flex-col">
                  <div
                    ref={siteTableScroll.scrollRef}
                    className="rounded-lg border-l-8 border-l-[#BF9853] flex-1 min-h-0 overflow-y-auto overflow-x-auto no-scrollbar scrollbar-none w-full"
                    onMouseDown={siteTableScroll.handleMouseDown}
                  >
                    <table className={`${SUMMARY_SITE_TABLE_CLASS} ${showSiteFilters ? '[&_thead_tr:first-child_th]:!border-b-0' : ''}`}>
                      <thead className="sticky top-0 z-20 bg-white">
                        <EdbcTableHeaderRow>
                          <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC4}
                            label="Contractor/Vendor"
                            sortField={siteHeaderSortField}
                            sortDirection={siteSortConfig.direction}
                            onSort={handleSiteEdbcSort}
                          />
                          <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC8}
                            label="Advance"
                            sortField={siteHeaderSortField}
                            sortDirection={siteSortConfig.direction}
                            onSort={handleSiteEdbcSort}
                          />
                          <EdbcColumnHeader columnId={EDBC_IDS.EDBC8} label="Bill Amount" />
                          <EdbcColumnHeader
                            columnId={EDBC_IDS.EDBC13}
                            label="Bill Status"
                            sortField={siteHeaderSortField}
                            sortDirection={siteSortConfig.direction}
                            onSort={handleSiteEdbcSort}
                          />
                        </EdbcTableHeaderRow>
                        {showSiteFilters && (
                          <EdbcTableFilterRow ref={siteFilterRowRef}>
                            <SummaryContractorVendorFilter
                              value={selectSiteContractorFilter}
                              onChange={setSelectSiteContractorFilter}
                              options={combinedOptions}
                            />
                            <EdbcTotalAmountFilter
                              columnId={EDBC_IDS.EDBC8}
                              totalAmount={siteTableTotals.advance}
                              value={selectSiteAdvanceFilter}
                              onChange={(e) => setSelectSiteAdvanceFilter(e.target.value)}
                            />
                            <EdbcTotalAmountFilter
                              columnId={EDBC_IDS.EDBC8}
                              totalAmount={siteTableTotals.billAmount}
                              value={selectSiteBillAmountFilter}
                              onChange={(e) => setSelectSiteBillAmountFilter(e.target.value)}
                            />
                            <SummaryEdbcSelectFilter
                              columnId={EDBC_IDS.EDBC13}
                              placeholder="Bill Status"
                              options={billStatusFilterOptions}
                              value={selectSiteBillStatusFilter}
                              onChange={setSelectSiteBillStatusFilter}
                            />
                          </EdbcTableFilterRow>
                        )}
                      </thead>
                      <tbody>
                        {sortedSiteDisplayData.length > 0 ? (
                          sortedSiteDisplayData.map((d, idx) => (
                            <EdbcTableBodyRow key={d.entityId ?? idx}>
                              <EdbcExpandableBodyCell
                                columnId={EDBC_IDS.EDBC4}
                                expense={{ id: d.entityId, ...d }}
                                rowIndex={idx}
                                expandedCells={siteExpandedCells}
                                onToggleExpanded={toggleSiteExpandedCell}
                                getDisplayValue={(row) => row.name}
                              />
                              <td
                                id={EDBC_IDS.EDBC8}
                                className={edbc8Config?.tdClass}
                                onMouseEnter={(e) => handleSiteAdvanceMouseEnter(e, selectedAdvanceSite?.id || null, d.entityId, d.entityType)}
                                onMouseLeave={handleSiteMouseLeave}
                              >
                                <span
                                  onClick={() => handleSiteAdvanceClick(selectedAdvanceSite?.id || null, d.entityId, d.entityType, d.name)}
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    toggleSiteExpandedCell(`${d.entityId ?? idx}-amount`);
                                  }}
                                  className={`block w-full cursor-pointer ${siteExpandedCells[`${d.entityId ?? idx}-amount`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                  title={formatSummaryAmount(d.pendingAdvance)}
                                >
                                  {formatSummaryAmount(d.pendingAdvance)}
                                </span>
                              </td>
                              <td
                                className={edbc8Config?.tdClass}
                                onMouseEnter={(e) => handleSiteBillMouseEnter(e, selectedAdvanceSite?.id || null, d.entityId, d.entityType)}
                                onMouseLeave={handleSiteMouseLeave}
                              >
                                <span
                                  onClick={() => handleSiteBillClick(selectedAdvanceSite?.id || null, d.entityId, d.entityType, d.name)}
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    toggleSiteExpandedCell(`${d.entityId ?? idx}-bill_amount`);
                                  }}
                                  className={`block w-full cursor-pointer ${siteExpandedCells[`${d.entityId ?? idx}-bill_amount`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                  title={formatSummaryAmount(d.billAmount)}
                                >
                                  {formatSummaryAmount(d.billAmount)}
                                </span>
                              </td>
                              {renderBillStatusBodyCell({
                                pendingAdvance: d.pendingAdvance,
                                rowId: d.entityId,
                                rowIndex: idx,
                                expandedCells: siteExpandedCells,
                                onToggleExpanded: toggleSiteExpandedCell,
                                onClick: () => handleSiteBillStatusClick(
                                  selectedAdvanceSite?.id || null,
                                  d.entityId,
                                  d.entityType,
                                  d.name
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
        </div>
      </div>
      {projectTooltipData && (
        <div className="fixed z-50 bg-white text-black p-3 rounded shadow-lg text-sm max-w-xs"
          style={{ left: projectTooltipPosition.x + 10, top: projectTooltipPosition.y - 10, pointerEvents: 'none' }}
        >
          <div className="font-semibold mb-2">{projectTooltipTitle || 'Details'}:</div>
          {projectTooltipData
            .slice()
            .reverse()
            .map((entry, index) => (
              <div key={index} className="mb-1">
                <span className="text-gray-600">{entry.date}:</span>
                <span className={`ml-2 ${entry.amount < 0 ? 'text-red-600' : ''}`}>
                  ₹{entry.amount.toLocaleString('en-IN')}
                </span>
                {entry.contractorVendorName && !selectedContractorOrVendorOption && (
                  <div className="text-xs text-gray-500 ml-2">({entry.contractorVendorName})</div>
                )}
                {entry.isRefund && selectedContractorOrVendorOption && (
                  <div className="text-xs text-gray-500 ml-2">(Refund)</div>
                )}
                {entry.type === 'Transfer' && selectedContractorOrVendorOption && entry.transferSiteName && !entry.isRefund && (
                  <div className="text-xs text-gray-500 ml-2">
                    ({entry.amount < 0 ? 'Transfer To: ' : 'Transfer From: '}{entry.transferSiteName})
                  </div>
                )}
              </div>
            ))}
          <div className="mt-2 pt-2 border-t border-gray-600">
            <span className="font-semibold">
              Total: ₹
              {projectTooltipData
                .reduce((sum, item) => sum + item.amount, 0)
                .toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}
      {siteTooltipData && (
        <div className="fixed z-50 bg-white text-black p-3 rounded shadow-lg text-sm max-w-xs"
          style={{ left: siteTooltipPosition.x + 10, top: siteTooltipPosition.y - 10, pointerEvents: 'none' }}
        >
          <div className="font-semibold mb-2">{siteTooltipTitle || 'Details'}:</div>
          {siteTooltipData
            .slice()
            .reverse()
            .map((entry, index) => (
              <div key={index} className="mb-1">
                <span className="text-gray-600">{entry.date}:</span>
                <span className={`ml-2 ${entry.amount < 0 ? 'text-red-600' : ''}`}>
                  ₹{entry.amount.toLocaleString('en-IN')}
                </span>
                {entry.projectName && !selectedAdvanceSite && (
                  <div className="text-xs text-gray-500 ml-2">({entry.projectName})</div>
                )}
                {entry.isRefund && selectedAdvanceSite && (
                  <div className="text-xs text-gray-500 ml-2">(Refund)</div>
                )}
                {entry.type === 'Transfer' && selectedAdvanceSite && entry.transferSiteName && !entry.isRefund && (
                  <div className="text-xs text-gray-500 ml-2">
                    ({entry.amount < 0 ? 'Transfer To: ' : 'Transfer From: '}{entry.transferSiteName})
                  </div>
                )}
              </div>
            ))}
          <div className="mt-2 pt-2 border-t border-gray-600">
            <span className="font-semibold">
              Total: ₹
              {siteTooltipData
                .reduce((sum, item) => sum + item.amount, 0)
                .toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}
      {showProjectPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={() => setShowProjectPopup(false)}
        >
          <div className="relative bg-white rounded-lg shadow-xl p-[18px] w-fit text-left max-h-[80vh] overflow-hidden no-scrollbar scrollbar-none"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowProjectPopup(false)}
              className="absolute top-[18px] right-[18px] z-10 flex h-[20px] w-[20px] items-center justify-center"
            >
              <img src={FileRemover} className="w-[10px] h-[10px]" alt="Close" />
            </button>
            <div className="mb-2 pr-[46px] w-[468px] max-w-full min-w-0">
              <SummaryPopupContextHeader context={projectPopupContext} />
              <p className="text-sm text-gray-600 mt-1">{projectPopupTitle}</p>
              <div className="flex w-[468px] max-w-full justify-end mt-[8px]">
                <SummaryPopupExportActions
                  onExportPdf={() => exportPopupPDF(sortPopupData(projectPopupData, projectPopupSortConfig), projectPopupTitle, projectPopupContext, true)}
                  onExportCsv={() => exportPopupCSV(sortPopupData(projectPopupData, projectPopupSortConfig), projectPopupTitle, projectPopupContext, true)}
                />
              </div>
            </div>
            <div className="mt-[8px] border-l-8 border-l-[#BF9853] max-h-[55vh] overflow-y-auto no-scrollbar scrollbar-none rounded-lg overflow-hidden">
              <table className={` ${SUMMARY_POPUP_TABLE_CLASS}`}>
                <thead className="sticky top-0 z-20 bg-[#FAF6ED]">
                  <EdbcTableHeaderRow>
                    <EdbcColumnHeader
                      columnId={EDBC_IDS.EDBC2}
                      label="Date"
                      columnWidthClass={EDBC2_FIRST_COLUMN_WIDTH_CLASS}
                      sortField={projectPopupEdbcSortField}
                      sortDirection={projectPopupSortConfig.direction}
                      onSort={handleProjectPopupSort}
                    />
                    <EdbcColumnHeader
                      columnId={EDBC_IDS.EDBC4}
                      label={!selectedContractorOrVendorOption ? 'Contractor/Vendor' : 'Transfer'}
                      sortField={projectPopupEdbcSortField}
                      sortDirection={projectPopupSortConfig.direction}
                      onSort={handleProjectPopupSort}
                    />
                    <EdbcColumnHeader
                      columnId={EDBC_IDS.EDBC8}
                      label="Amount"
                      sortField={projectPopupEdbcSortField}
                      sortDirection={projectPopupSortConfig.direction}
                      onSort={handleProjectPopupSort}
                    />
                  </EdbcTableHeaderRow>
                </thead>
                <tbody>
                  {projectPopupData &&
                    sortPopupData(projectPopupData, projectPopupSortConfig)
                      .map((entry, index) => (
                        <EdbcTableBodyRow key={index}>
                          <td id={EDBC_IDS.EDBC2} className={edbc2Config?.tdClass}>{entry.date}</td>
                          <td id={EDBC_IDS.EDBC4} className={edbc4Config?.tdClass}>
                            {!selectedContractorOrVendorOption ? (
                              entry.contractorVendorName || '-'
                            ) : entry.isRefund ? (
                              <div className="text-xs text-gray-500">Refund</div>
                            ) : entry.type === 'Transfer' && selectedContractorOrVendorOption ? (
                              <div className="text-xs text-gray-500">
                                {entry.amount < 0 ? 'Transfer To: ' : 'Transfer From: '}
                                {entry.transferSiteName || '-'}
                              </div>
                            ) : null}
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
                      ₹{projectPopupData &&
                        projectPopupData
                          .reduce((sum, item) => sum + item.amount, 0)
                          .toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
      {showSitePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={() => setShowSitePopup(false)}
        >
          <div className="relative bg-white rounded-lg shadow-xl p-[18px] w-fit text-left max-h-[80vh] overflow-hidden no-scrollbar scrollbar-none"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowSitePopup(false)}
              className="absolute top-[18px] right-[18px] z-10 flex h-[20px] w-[20px] items-center justify-center"
            >
              <img src={FileRemover} className="w-[10px] h-[10px]" alt="Close" />
            </button>
            <div className="mb-2 pr-[46px] w-[468px] max-w-full min-w-0">
              <SummaryPopupContextHeader context={sitePopupContext} />
              <p className="text-sm text-gray-600 mt-1">{sitePopupTitle}</p>
              <div className="flex w-[468px] max-w-full justify-end mt-[8px]">
                <SummaryPopupExportActions
                  onExportPdf={() => exportPopupPDF(sortPopupData(sitePopupData, sitePopupSortConfig), sitePopupTitle, sitePopupContext, false)}
                  onExportCsv={() => exportPopupCSV(sortPopupData(sitePopupData, sitePopupSortConfig), sitePopupTitle, sitePopupContext, false)}
                />
              </div>
            </div>
            <div className="mt-[8px] border-l-8 border-l-[#BF9853] max-h-[55vh] overflow-y-auto no-scrollbar scrollbar-none rounded-lg overflow-hidden">
              <table className={` ${SUMMARY_POPUP_TABLE_CLASS}`}>
                <thead className="sticky top-0 z-20 bg-[#FAF6ED]">
                  <EdbcTableHeaderRow>
                    <EdbcColumnHeader
                      columnId={EDBC_IDS.EDBC2}
                      label="Date"
                      columnWidthClass={EDBC2_FIRST_COLUMN_WIDTH_CLASS}
                      sortField={sitePopupEdbcSortField}
                      sortDirection={sitePopupSortConfig.direction}
                      onSort={handleSitePopupSort}
                    />
                    <EdbcColumnHeader
                      columnId={EDBC_IDS.EDBC4}
                      label={!selectedAdvanceSite ? 'Project Name' : 'Transfer'}
                      sortField={sitePopupEdbcSortField}
                      sortDirection={sitePopupSortConfig.direction}
                      onSort={handleSitePopupSort}
                    />
                    <EdbcColumnHeader
                      columnId={EDBC_IDS.EDBC8}
                      label="Amount"
                      sortField={sitePopupEdbcSortField}
                      sortDirection={sitePopupSortConfig.direction}
                      onSort={handleSitePopupSort}
                    />
                  </EdbcTableHeaderRow>
                </thead>
                <tbody>
                  {sitePopupData &&
                    sortPopupData(sitePopupData, sitePopupSortConfig)
                      .map((entry, index) => (
                        <EdbcTableBodyRow key={index}>
                          <td id={EDBC_IDS.EDBC2} className={edbc2Config?.tdClass}>{entry.date}</td>
                          <td id={EDBC_IDS.EDBC4} className={edbc4Config?.tdClass}>
                            {!selectedAdvanceSite ? (
                              entry.projectName || '-'
                            ) : entry.isRefund ? (
                              <div className="text-xs text-gray-500">Refund</div>
                            ) : entry.type === 'Transfer' && selectedAdvanceSite ? (
                              <div className="text-xs text-gray-500">
                                {entry.amount < 0 ? 'Transfer To: ' : 'Transfer From: '}
                                {entry.transferSiteName || '-'}
                              </div>
                            ) : null}
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
                      ₹{sitePopupData &&
                        sitePopupData
                          .reduce((sum, item) => sum + item.amount, 0)
                          .toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
      {showBillStatusPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={() => setShowBillStatusPopup(false)}
        >
          <div className="relative bg-white rounded-lg shadow-xl p-[18px] w-fit text-left max-h-[80vh] overflow-hidden no-scrollbar scrollbar-none"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowBillStatusPopup(false)}
              className="absolute top-[18px] right-[18px] z-10 flex h-[20px] w-[20px] items-center justify-center"
            >
              <img src={FileRemover} className="w-[10px] h-[10px]" alt="Close" />
            </button>
            <div className={`mb-2 pr-[46px] max-w-full min-w-0 ${isBillStatusFromFirstTable ? 'w-[588px]' : 'w-[668px]'}`}>
              <SummaryPopupContextHeader context={billStatusPopupContext} />
              <p className="text-sm text-gray-600 mt-1">Bill Status Details</p>
              <div className={`flex max-w-full justify-end mt-[8px] ${isBillStatusFromFirstTable ? 'w-[588px]' : 'w-[668px]'}`}>
                <SummaryPopupExportActions
                  onExportPdf={exportBillStatusPDF}
                  onExportCsv={exportBillStatusCSV}
                />
              </div>
            </div>
            <div className="mt-[8px] border-l-8 border-l-[#BF9853] max-h-[55vh] overflow-y-auto no-scrollbar scrollbar-none rounded-lg overflow-hidden">
              <table className={billStatusPopupTableClass}>
                <thead className="sticky top-0 z-20 bg-[#FAF6ED]">
                  <EdbcTableHeaderRow>
                    <EdbcColumnHeader
                      columnId={EDBC_IDS.EDBC2}
                      label="Date"
                      columnWidthClass={EDBC2_FIRST_COLUMN_WIDTH_CLASS}
                      sortField={billStatusPopupEdbcSortField}
                      sortDirection={billStatusPopupSortConfig.direction}
                      onSort={handleBillStatusPopupSort}
                    />
                    {isBillStatusFromFirstTable ? (
                      <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC4}
                        label={selectedContractorOrVendorOption ? 'Transfer' : 'Contractor/Vendor'}
                        sortField={billStatusPopupEdbcSortField}
                        sortDirection={billStatusPopupSortConfig.direction}
                        onSort={handleBillStatusPopupSort}
                      />
                    ) : (
                      <EdbcColumnHeader
                        columnId={EDBC_IDS.EDBC3}
                        label={selectedAdvanceSite ? 'Transfer' : 'Project Name'}
                        sortField={billStatusPopupEdbcSortField}
                        sortDirection={billStatusPopupSortConfig.direction}
                        onSort={handleBillStatusPopupSort}
                      />
                    )}
                    <th
                      id={EDBC_IDS.EDBC8}
                      className={edbc8Config?.headerClass}
                      onClick={() => handleBillStatusPopupSort('advanceAmount')}
                    >
                      Advance
                      {billStatusPopupSortConfig.key === 'advanceAmount' && (
                        <span className="ml-1">{billStatusPopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th
                      id={EDBC_IDS.EDBC8}
                      className={edbc8Config?.headerClass}
                      onClick={() => handleBillStatusPopupSort('billAmount')}
                    >
                      Bill Amount
                      {billStatusPopupSortConfig.key === 'billAmount' && (
                        <span className="ml-1">{billStatusPopupSortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                  </EdbcTableHeaderRow>
                </thead>
                <tbody>
                  {(() => {
                    const combinedData = [];
                    const dateMap = new Map();
                    billStatusPopupData.advances.forEach(adv => {
                      const key = `${adv.date}-${adv.advancePortalId}-${adv.kind || 'main'}`;
                      dateMap.set(key, {
                        date: adv.date,
                        advancePortalId: adv.advancePortalId,
                        advanceAmount: adv.amount,
                        billAmount: 0,
                        projectName: adv.projectName,
                        contractorVendorName: adv.contractorVendorName,
                        transferSiteName: adv.transferSiteName,
                        type: adv.type,
                        isRefund: adv.isRefund
                      });
                    });
                    billStatusPopupData.bills.forEach(bill => {
                      const key = `${bill.date}-${bill.advancePortalId}-${bill.kind || 'main'}`;
                      const fileUrl = bill.file_url && bill.file_url.trim() !== '' ? bill.file_url : null;
                      if (dateMap.has(key)) {
                        dateMap.get(key).billAmount = bill.amount;
                        dateMap.get(key).file_url = fileUrl;
                        dateMap.get(key).type = bill.type || dateMap.get(key).type;
                      } else {
                        dateMap.set(key, {
                          date: bill.date,
                          advancePortalId: bill.advancePortalId,
                          advanceAmount: 0,
                          billAmount: bill.amount,
                          projectName: bill.projectName,
                          contractorVendorName: bill.contractorVendorName,
                          transferSiteName: bill.transferSiteName,
                          type: bill.type,
                          isRefund: false,
                          file_url: fileUrl
                        });
                      }
                    });
                    combinedData.push(...Array.from(dateMap.values()));
                    const parseDate = (dateStr) => {
                      const [day, month, year] = dateStr.split('/');
                      return new Date(`${year}-${month}-${day}`);
                    };
                    if (!billStatusPopupSortConfig.key) {
                      combinedData.sort((a, b) => {
                        const dateDiff = parseDate(b.date) - parseDate(a.date);
                        if (dateDiff !== 0) return dateDiff;
                        return b.advancePortalId - a.advancePortalId;
                      });
                    } else {
                      combinedData.sort((a, b) => {
                        let aValue = a[billStatusPopupSortConfig.key];
                        let bValue = b[billStatusPopupSortConfig.key];
                        if (billStatusPopupSortConfig.key === 'date') {
                          aValue = parseDate(aValue);
                          bValue = parseDate(bValue);
                          const primarySort = billStatusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
                          if (primarySort !== 0) return primarySort;
                          return billStatusPopupSortConfig.direction === 'asc' ? a.advancePortalId - b.advancePortalId : b.advancePortalId - a.advancePortalId;
                        }
                        if (typeof aValue === 'number' && typeof bValue === 'number') {
                          const primarySort = billStatusPopupSortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
                          if (primarySort !== 0) return primarySort;
                          return a.advancePortalId - b.advancePortalId;
                        }
                        aValue = String(aValue || '').toLowerCase();
                        bValue = String(bValue || '').toLowerCase();
                        if (aValue < bValue) return billStatusPopupSortConfig.direction === 'asc' ? -1 : 1;
                        if (aValue > bValue) return billStatusPopupSortConfig.direction === 'asc' ? 1 : -1;
                        return a.advancePortalId - b.advancePortalId;
                      });
                    }

                    return combinedData.map((entry, index) => (
                      <EdbcTableBodyRow key={index}>
                        <td id={EDBC_IDS.EDBC2} className={edbc2Config?.tdClass}>{entry.date}</td>
                        {isBillStatusFromFirstTable ? (
                          <td id={EDBC_IDS.EDBC4} className={edbc4Config?.tdClass}>
                            {!selectedContractorOrVendorOption ? (
                              entry.contractorVendorName || '-'
                            ) : entry.isRefund ? (
                              <div className="text-xs text-gray-500">Refund</div>
                            ) : entry.type === 'Transfer' && entry.transferSiteName ? (
                              <div className="text-xs text-gray-500">
                                {entry.advanceAmount < 0 ? 'To: ' : 'From: '}
                                {entry.transferSiteName}
                              </div>
                            ) : '-'}
                          </td>
                        ) : (
                          <td id={EDBC_IDS.EDBC3} className={edbc3Config?.tdClass}>
                            {!selectedAdvanceSite ? (
                              entry.projectName || '-'
                            ) : entry.isRefund ? (
                              <div className="text-xs text-gray-500">Refund</div>
                            ) : entry.type === 'Transfer' && entry.transferSiteName ? (
                              <div className="text-xs text-gray-500">
                                {entry.advanceAmount < 0 ? 'To: ' : 'From: '}
                                {entry.transferSiteName}
                              </div>
                            ) : '-'}
                          </td>
                        )}
                        <td id={EDBC_IDS.EDBC8} className={`${edbc8Config?.tdClass} font-semibold ${entry.advanceAmount < 0 ? 'text-red-600' : ''}`.trim()}>
                          {entry.advanceAmount !== 0 ? `₹${entry.advanceAmount.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td
                          id={EDBC_IDS.EDBC8}
                          className={`${edbc8Config?.tdClass} font-semibold ${entry.billAmount !== 0 && entry.file_url ? 'cursor-pointer hover:underline' : ''}`.trim()}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (entry.billAmount !== 0 && entry.file_url) {
                              const viewableUrl = convertToViewableUrl(entry.file_url);
                              window.open(viewableUrl, '_blank', 'noopener,noreferrer');
                            }
                          }}
                          style={entry.billAmount !== 0 && entry.file_url ? {
                            cursor: 'pointer'
                          } : {}}
                          title={entry.billAmount !== 0 && entry.file_url ? 'Click to open bill document in new tab' : ''}
                        >
                          {entry.billAmount !== 0 ? `₹${entry.billAmount.toLocaleString('en-IN')}` : '-'}
                        </td>
                      </EdbcTableBodyRow>
                    ));
                  })()}
                </tbody>
                <tfoot>
                  <tr className="bg-[#f8f1e5] font-bold h-[40px]">
                    <td id={EDBC_IDS.EDBC2} className={edbc2Config?.tdClass}>Total</td>
                    <td id={isBillStatusFromFirstTable ? EDBC_IDS.EDBC4 : EDBC_IDS.EDBC3} className={isBillStatusFromFirstTable ? edbc4Config?.tdClass : edbc3Config?.tdClass}></td>
                    <td id={EDBC_IDS.EDBC8} className={edbc8Config?.tdClass}>
                      ₹{billStatusPopupData.advances.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}
                    </td>
                    <td id={EDBC_IDS.EDBC8} className={edbc8Config?.tdClass}>
                      ₹{billStatusPopupData.bills.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr className="bg-[#BF9853] text-white font-bold h-[40px]">
                    <td id={EDBC_IDS.EDBC2} className={edbc2Config?.tdClass} colSpan={2}>Balance Advance</td>
                    <td id={EDBC_IDS.EDBC8} className={`${edbc8Config?.tdClass} text-white`} colSpan={2}>
                      ₹{(
                        billStatusPopupData.advances.reduce((sum, item) => sum + item.amount, 0) -
                        billStatusPopupData.bills.reduce((sum, item) => sum + item.amount, 0)
                      ).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
      {showAdvanceForm ? (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-[1824px] max-h-[92vh] overflow-y-auto shadow-lg relative">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#202020]">Advance Portal Entry</p>
              <button
                type="button"
                onClick={() => setShowAdvanceForm(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 text-xl"
              >
                ×
              </button>
            </div>
            <div className="p-3">
              <AdvanceForm
                embedded
                onSuccess={async () => {
                  setShowAdvanceForm(false);
                  await fetchAdvanceFormData();
                }}
              />
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}
export default AdvanceSummary