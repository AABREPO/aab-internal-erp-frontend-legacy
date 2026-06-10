import React, { useMemo, useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import edit from '../Images/Edit.svg';
import Filter from '../Images/TableFilter.svg';
import Search from '../Images/Searchnew.svg';
import Reload from '../Images/Clear.svg';
import Pdf from '../Images/pdf.png';
import XL from '../Images/sheets.png';
import Select from 'react-select';
import {
  EDBC_IDS,
  getEdbcColumnConfig,
  useEdbcExpandedCells,
  EdbcTableHeaderRow,
  EdbcTableBodyRow,
  EdbcColumnHeader,
  EdbcDateBodyCell,
  EdbcExpandableBodyCell,
  EdbcTableFilterRow,
  EdbcTotalAmountFilter,
  EdbcProjectNameFilter,
  EdbcSelectFilter,
  EdbcEmptyFilterCell,
  EdbcFileBodyCell,
  EdbcTimestampFilter,
  formatEdbcFilterDateDMY,
  DATABASE_TABLE_FILTER_SELECT_STYLES,
  EDBC_TABLE_EDGE_TABLE_CLASS,
  EDBC2_FIRST_COLUMN_WIDTH_CLASS,
} from '../ExpensesEntry/databaseExpensesSharedColumns';

const SIDE_TABLE_DATE_FILTER_CALENDAR_CLASS =
  '[&_thead]:!overflow-visible [&_thead]:!z-30 [&_tbody]:!relative [&_tbody]:!z-0 [&_thead_tr:nth-child(2)>th:first-child]:!overflow-visible [&_thead_tr:nth-child(2)>th:first-child]:!relative [&_thead_tr:nth-child(2)>th:first-child]:!z-40 [&_thead_tr:nth-child(2)>th:first-child>div]:!overflow-visible';

const SIDE_TABLE_DATE_COLUMN_CLASS =
  '[&_thead_tr>th#EDBC-2:first-child]:!w-[130px] [&_thead_tr>th#EDBC-2:first-child]:!max-w-[130px] [&_thead_tr>th#EDBC-2:first-child]:!min-w-[130px] [&_thead_tr>th#EDBC-2:first-child]:!box-border [&_thead_tr:nth-child(2)>th#EDBC-2]:!w-[130px] [&_thead_tr:nth-child(2)>th#EDBC-2]:!max-w-[130px] [&_thead_tr:nth-child(2)>th#EDBC-2]:!min-w-[130px] [&_thead_tr:nth-child(2)>th#EDBC-2]:!box-border [&_thead_tr:nth-child(2)>th#EDBC-2>div]:!w-[120px] [&_thead_tr:nth-child(2)>th#EDBC-2>div]:!max-w-[120px] [&_thead_tr:nth-child(2)>th#EDBC-2>div]:!min-w-[120px] [&_thead_tr:nth-child(2)>th#EDBC-2>div]:!box-border';

const SIDE_TABLE_FIELDS = {
  date: 'Date',
  advance: 'Advance',
  bill: 'Bill',
  discount: 'Discount',
  transferRefund: 'Transfer/Refund',
  entryNo: 'Entry No',
  mode: 'Mode',
  file: 'File',
  activity: 'Activity',
  searchTransactions: 'Search Transactions...',
};

const SIDE_TABLE_FORM_PATH_CSS = `
.expense-form-side-table-host .side-table-form-path .form-side-table-toolbar-row {
  width: 100% !important;
  min-width: 0 !important;
  max-width: 978px !important;
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
  width: 322px !important;
  max-width: 100% !important;
  text-align: right !important;
  flex: none !important;
}
.expense-form-side-table-host .side-table-form-path .form-side-table-search-row {
  flex: 0 0 auto !important;
  justify-content: flex-end !important;
}
`;

const SIDE_TABLE_SORT_KEYS = {
  [SIDE_TABLE_FIELDS.date]: 'date',
  [SIDE_TABLE_FIELDS.advance]: 'amount',
  [SIDE_TABLE_FIELDS.bill]: 'bill_amount',
  [SIDE_TABLE_FIELDS.discount]: 'discount_amount',
  [SIDE_TABLE_FIELDS.transferRefund]: 'siteName',
  [SIDE_TABLE_FIELDS.entryNo]: 'eno',
  [SIDE_TABLE_FIELDS.mode]: 'paymentMode',
};

const sideTableSortIndicator = (activeSortField, sortDirection, columnSortField) => {
  if (activeSortField !== columnSortField) return null;
  return sortDirection === 'asc' ? ' ↑' : ' ↓';
};

const resolveSideTableSelectFilterValue = (value, blankOption, blankValue) => {
  if (!value) return null;
  if (blankValue && value === blankValue) return blankOption;
  return { value, label: value };
};

const buildSideTableRightAlignedSelectStyles = (selectStyles) => ({
  ...selectStyles,
  control: (provided, state) => ({
    ...(typeof selectStyles.control === 'function' ? selectStyles.control(provided, state) : provided),
    textAlign: 'right',
  }),
  valueContainer: (provided, state) => ({
    ...(typeof selectStyles.valueContainer === 'function' ? selectStyles.valueContainer(provided, state) : provided),
    justifyContent: state.hasValue ? 'flex-end' : 'flex-start',
    paddingLeft: state.hasValue ? '2px' : '12px',
    paddingRight: '0px',
  }),
  singleValue: (provided) => ({
    ...(typeof selectStyles.singleValue === 'function' ? selectStyles.singleValue(provided) : provided),
    textAlign: 'right',
  }),
  input: (provided) => ({
    ...(typeof selectStyles.input === 'function' ? selectStyles.input(provided) : provided),
    textAlign: 'right',
  }),
  placeholder: (provided) => ({
    ...(typeof selectStyles.placeholder === 'function' ? selectStyles.placeholder(provided) : provided),
    textAlign: 'left',
    paddingRight: '0px',
    marginRight: 0,
  }),
  option: (provided, state) => ({
    ...(typeof selectStyles.option === 'function' ? selectStyles.option(provided, state) : provided),
    textAlign: 'right',
    justifyContent: 'flex-end',
    paddingRight: '12px',
  }),
});

const buildSideTableEntryNoSelectStyles = (selectStyles) => {
  const baseStyles = buildSideTableRightAlignedSelectStyles(selectStyles);
  return {
    ...baseStyles,
    container: (provided) => ({
      ...(typeof baseStyles.container === 'function' ? baseStyles.container(provided) : provided),
      width: 120,
      minWidth: 120,
      maxWidth: 120,
    }),
    control: (provided, state) => {
      const controlBase = typeof baseStyles.control === 'function'
        ? baseStyles.control(provided, state)
        : provided;
      return {
        ...controlBase,
        width: 120,
        minWidth: 120,
        maxWidth: 120,
        boxSizing: 'border-box',
      };
    },
  };
};

function getFirstVisibleSideTableBodyRow(scroller) {
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
}

function alignSideTableRowBelowHeader(scroller, row) {
  if (!scroller || !row) return;
  const thead = scroller.querySelector('thead');
  if (!thead) return;
  const headerBottom = thead.getBoundingClientRect().bottom;
  const rowTop = row.getBoundingClientRect().top;
  const delta = rowTop - headerBottom;
  if (Math.abs(delta) > 0.5) {
    scroller.scrollTop += delta;
  }
}

const SideTableSelectFilter = ({
  columnId,
  placeholder,
  options,
  value,
  onChange,
  blankOption = null,
  blankValue = null,
  selectStyles,
}) => {
  const config = getEdbcColumnConfig(columnId);
  if (!config) return null;
  const resolvedValue = resolveSideTableSelectFilterValue(value, blankOption, blankValue);
  const resolvedStyles = columnId === EDBC_IDS.EDBC17
    ? buildSideTableEntryNoSelectStyles(selectStyles)
    : selectStyles;
  return (
    <th id={columnId} className={config.filterThClass}>
      <Select
        className={config.filterWidthClass}
        options={options}
        value={resolvedValue}
        onChange={(selectedOption) => onChange(selectedOption ? selectedOption.value : '')}
        placeholder={placeholder}
        menuPlacement="bottom"
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
        noOptionsMessage={() => null}
        styles={resolvedStyles}
      />
    </th>
  );
};

const SideTableColumnHeader = ({
  columnId,
  label,
  sortKey,
  sortField,
  sortDirection,
  onSort,
  columnWidthClass = '',
}) => {
  const config = getEdbcColumnConfig(columnId);
  if (!config || !label) return null;
  const sortable = typeof onSort === 'function' && sortKey;
  let baseHeaderClass = sortable
    ? config.headerClass
    : config.headerClass
        .replace(/\bcursor-pointer\b/g, '')
        .replace(/\bhover:bg-gray-200\b/g, '')
        .replace(/\bselect-none\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
  if (columnId === EDBC_IDS.EDBC2 && columnWidthClass) {
    baseHeaderClass = baseHeaderClass
      .replace(/w-\[[^\]]+\]/g, columnWidthClass)
      .replace(/\bw-\d+\b/g, columnWidthClass);
  }
  return (
    <th
      id={columnId}
      className={baseHeaderClass}
      onClick={sortable ? () => onSort(sortKey) : undefined}
    >
      {label}
      {sortable ? sideTableSortIndicator(sortField, sortDirection, sortKey) : null}
    </th>
  );
};

const useSideTableSort = () => {
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const handleSort = useCallback((field) => {
    setSortField((currentField) => {
      if (currentField === field) {
        setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
        return currentField;
      }
      setSortDirection('asc');
      return field;
    });
  }, []);
  const clearSort = useCallback(() => {
    setSortField('');
    setSortDirection('asc');
  }, []);
  return { sortField, sortDirection, handleSort, clearSort };
};

/** Date sort with optional direction; same date → entry_no tie-break (highest first when desc). */
const compareSideTableByDateThenEntryNo = (a, b, sortDirection = 'desc') => {
  const dateA = new Date(a.date).getTime();
  const dateB = new Date(b.date).getTime();
  const invalidA = Number.isNaN(dateA);
  const invalidB = Number.isNaN(dateB);
  if (invalidA && invalidB) return 0;
  if (invalidA) return 1;
  if (invalidB) return -1;
  if (dateA !== dateB) {
    return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
  }
  return sortDirection === 'asc'
    ? (Number(a.entry_no) || 0) - (Number(b.entry_no) || 0)
    : (Number(b.entry_no) || 0) - (Number(a.entry_no) || 0);
};

const sortSideTableAdvanceEntries = (entries, sortField, sortDirection, siteOptions) => {
  if (!Array.isArray(entries)) return entries;
  if (!sortField) return [...entries].sort((a, b) => compareSideTableByDateThenEntryNo(a, b));
  if (sortField === 'date') {
    return [...entries].sort((a, b) => compareSideTableByDateThenEntryNo(a, b, sortDirection));
  }
  return [...entries].sort((a, b) => {
    let aValue;
    let bValue;
    if (sortField === 'amount') {
      const advanceSortValue = (entry) =>
        entry.type === 'Refund'
          ? -(Number(entry.refund_amount) || 0)
          : Number(entry.amount) || 0;
      aValue = advanceSortValue(a);
      bValue = advanceSortValue(b);
    } else if (sortField === 'bill_amount') {
      const billSortValue = (entry) =>
        entry.type === 'Bill Settlement' ? Number(entry.bill_amount) || 0 : 0;
      aValue = billSortValue(a);
      bValue = billSortValue(b);
    } else if (sortField === 'discount_amount') {
      const discountSortValue = (entry) =>
        entry.type === 'Bill Settlement' ? Number(entry.discount_amount) || 0 : 0;
      aValue = discountSortValue(a);
      bValue = discountSortValue(b);
    } else if (sortField === 'siteName') {
      aValue = getEntryRowDisplay(a, siteOptions).transferOrRefund.toLowerCase();
      bValue = getEntryRowDisplay(b, siteOptions).transferOrRefund.toLowerCase();
    } else if (sortField === 'paymentMode') {
      aValue = (a.payment_mode || '').toLowerCase();
      bValue = (b.payment_mode || '').toLowerCase();
    } else if (sortField === 'eno') {
      aValue = Number(a.entry_no) || 0;
      bValue = Number(b.entry_no) || 0;
    } else {
      aValue = String(a[sortField] ?? '').toLowerCase();
      bValue = String(b[sortField] ?? '').toLowerCase();
    }
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return compareSideTableByDateThenEntryNo(a, b);
  });
};

const filterEntriesForSideTable = (advanceData, selectedOption, selectedSite) =>
  (advanceData || [])
    .filter((entry) => {
      const isMatchingVendor =
        selectedOption?.type === 'Vendor'
          ? entry.vendor_id === selectedOption.id
          : selectedOption?.type === 'Contractor'
            ? entry.contractor_id === selectedOption.id
            : false;
      const isForCurrentProject = entry.project_id === selectedSite?.id;
      return isMatchingVendor && isForCurrentProject;
    })
    .sort((a, b) => compareSideTableByDateThenEntryNo(a, b));

const formatEdbc8Amount = (value) =>
  `₹${(parseFloat(value) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatEdbc8AmountNegative = (value) =>
  `-₹${(Math.abs(parseFloat(value) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getEntryRowDisplay = (entry, siteOptions) => {
  const {
    amount,
    bill_amount,
    discount_amount,
    type,
    transfer_site_id,
    refund_amount,
  } = entry;
  const discountAmt = parseFloat(discount_amount) || 0;
  const advanceAmount = (() => {
    if (type === 'Refund') {
      return formatEdbc8AmountNegative(refund_amount);
    }
    return formatEdbc8Amount(amount);
  })();
  const billAmount =
    type === 'Bill Settlement'
      ? formatEdbc8Amount(bill_amount)
      : '';
  const discountDisplay =
    type === 'Bill Settlement' && discountAmt > 0
      ? formatEdbc8Amount(discountAmt)
      : '';
  let transferOrRefund = '';
  if (type === 'Refund') {
    transferOrRefund = 'Refund';
  } else if (type === 'Transfer') {
    const siteLabel = siteOptions.find((site) => site.id === parseInt(transfer_site_id))?.label;
    transferOrRefund =
      parseFloat(amount) < 0
        ? `Transfer to ${siteLabel || 'Unknown Site'}`
        : `Transfer from ${siteLabel || 'Unknown Site'}`;
  }
  return { advanceAmount, billAmount, discountDisplay, transferOrRefund, payment_mode: entry.payment_mode || '' };
};

const toExpenseRow = (entry) => ({ ...entry, id: entry.advancePortalId, eno: entry.entry_no });

const BLANK_VALUE = 'BLANK';
const BLANK_LABEL = 'Blank';
const blankOption = { value: BLANK_VALUE, label: BLANK_LABEL };

const normalizeOverallSearchText = (value) =>
  String(value ?? '').toLowerCase().replace(/,/g, '');

const entryMatchesSideTableDateFilter = (entryDate, startDate, endDate) => {
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

const SideTable = ({
  advanceData,
  selectedOption,
  selectedSite,
  siteOptions,
  onEditClick = () => {},
  hideDiscountAndActivity = false,
  projectAdvance,
  advanceHeaderRef,
}) => {
  const [overallSearch, setOverallSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [filterTransferRefund, setFilterTransferRefund] = useState('');
  const [filterMode, setFilterMode] = useState('');
  const [filterEntryNo, setFilterEntryNo] = useState('');
  const filterRowRef = useRef(null);
  const scrollRef = useRef(null);
  const filterChipsScrollRef = useRef(null);
  const filterNudgeUsedRef = useRef(false);
  const filterAnchorRowRef = useRef(null);
  const filterScrollTopBeforeToggleRef = useRef(null);
  const filterRowHeightBeforeCloseRef = useRef(0);
  const pendingFilterOpenNudgeRef = useRef(false);
  const pendingFilterCloseNudgeRef = useRef(false);
  const filterScrollResetSkipRef = useRef(true);
  const isDragging = useRef(false);
  const isFilterChipsDragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const scroll = useRef({ left: 0, top: 0 });
  const filterChipsDragStart = useRef({ x: 0, scrollLeft: 0 });
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
    filterNudgeUsedRef.current = false;
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
    filterChipsScrollRef.current.scrollLeft = filterChipsDragStart.current.scrollLeft - dx;
  };
  const handleFilterChipsMouseUp = () => {
    if (!filterChipsScrollRef.current) return;
    isFilterChipsDragging.current = false;
    filterChipsScrollRef.current.style.cursor = 'grab';
    filterChipsScrollRef.current.style.userSelect = '';
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
  useEffect(() => () => cancelMomentum(), []);
  useEffect(() => {
    if (filterScrollResetSkipRef.current) {
      filterScrollResetSkipRef.current = false;
      return;
    }
    if (!showFilters) return;
    const scroller = scrollRef.current;
    if (!scroller) return;
    filterNudgeUsedRef.current = false;
    requestAnimationFrame(() => {
      scroller.scrollTop = 0;
    });
  }, [filterDateStart, filterDateEnd, filterTransferRefund, filterMode, filterEntryNo]);
  useLayoutEffect(() => {
    if (!hideDiscountAndActivity) return undefined;
    const el = document.createElement('style');
    el.setAttribute('data-side-table-form-path', '');
    el.textContent = SIDE_TABLE_FORM_PATH_CSS;
    document.head.appendChild(el);
    return () => {
      el.remove();
    };
  }, [hideDiscountAndActivity]);
  /** Keep the same first visible data row below thead when filters open or close. */
  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    const row = filterAnchorRowRef.current;
    if (!scroller || !row || !scroller.contains(row)) return;

    if (showFilters && pendingFilterOpenNudgeRef.current) {
      pendingFilterOpenNudgeRef.current = false;
      const savedTop = filterScrollTopBeforeToggleRef.current;
      const filterH = filterRowRef.current?.offsetHeight || 0;
      if (savedTop != null && filterH > 0) {
        scroller.scrollTop = savedTop + filterH;
      }
      filterScrollTopBeforeToggleRef.current = null;
      alignSideTableRowBelowHeader(scroller, row);
      filterNudgeUsedRef.current = true;
      return;
    }

    if (!showFilters && pendingFilterCloseNudgeRef.current) {
      pendingFilterCloseNudgeRef.current = false;
      const savedTop = filterScrollTopBeforeToggleRef.current;
      const filterH = filterRowHeightBeforeCloseRef.current || 0;
      if (savedTop != null && filterH > 0) {
        scroller.scrollTop = Math.max(0, savedTop - filterH);
      }
      filterScrollTopBeforeToggleRef.current = null;
      filterRowHeightBeforeCloseRef.current = 0;
      alignSideTableRowBelowHeader(scroller, row);
      filterNudgeUsedRef.current = false;
    }
  }, [showFilters]);
  const baseEntries = useMemo(
    () => filterEntriesForSideTable(advanceData, selectedOption, selectedSite),
    [advanceData, selectedOption, selectedSite]
  );
  const modeFilterOptions = useMemo(() => {
    const modes = new Set();
    baseEntries.forEach((entry) => {
      const mode = (entry.payment_mode || '').trim();
      if (mode) modes.add(mode);
    });
    return Array.from(modes)
      .sort((a, b) => a.localeCompare(b))
      .map((mode) => ({ value: mode, label: mode }));
  }, [baseEntries]);
  const transferRefundFilterOptions = useMemo(() => {
    const seen = new Set();
    let hasBlank = false;
    const options = [];
    baseEntries.forEach((entry) => {
      const { transferOrRefund } = getEntryRowDisplay(entry, siteOptions);
      const value = (transferOrRefund || '').trim();
      if (!value) {
        hasBlank = true;
        return;
      }
      if (!seen.has(value)) {
        seen.add(value);
        options.push({ value, label: value });
      }
    });
    options.sort((a, b) => a.label.localeCompare(b.label));
    if (hasBlank) options.unshift(blankOption);
    return options;
  }, [baseEntries, siteOptions]);
  const entriesForFilterOptions = useMemo(() => {
    let entries = baseEntries;
    if (filterDateStart || filterDateEnd) {
      entries = entries.filter((entry) =>
        entryMatchesSideTableDateFilter(entry.date, filterDateStart, filterDateEnd)
      );
    }
    if (filterTransferRefund) {
      if (filterTransferRefund === BLANK_VALUE) {
        entries = entries.filter(
          (entry) => !getEntryRowDisplay(entry, siteOptions).transferOrRefund.trim()
        );
      } else {
        entries = entries.filter(
          (entry) =>
            getEntryRowDisplay(entry, siteOptions).transferOrRefund === filterTransferRefund
        );
      }
    }
    if (filterMode) {
      entries = entries.filter(
        (entry) => (entry.payment_mode || '').toLowerCase() === filterMode.toLowerCase()
      );
    }
    if (!overallSearch.trim()) return entries;
    const q = normalizeOverallSearchText(overallSearch.trim());
    return entries.filter((entry) => {
      const { advanceAmount, billAmount, discountDisplay, transferOrRefund, payment_mode } =
        getEntryRowDisplay(entry, siteOptions);
      const searchable = normalizeOverallSearchText(
        [
          new Date(entry.date).toLocaleDateString('en-GB'),
          advanceAmount,
          billAmount,
          discountDisplay,
          transferOrRefund,
          payment_mode,
          entry.entry_no,
          entry.type,
          entry.description,
          entry.amount,
          entry.bill_amount,
          entry.discount_amount,
          entry.refund_amount,
        ].join(' '),
      );
      return searchable.includes(q);
    });
  }, [baseEntries, filterDateStart, filterDateEnd, filterTransferRefund, filterMode, overallSearch, siteOptions]);
  const entryNoFilterOptions = useMemo(() => {
    if (!hideDiscountAndActivity) return [];
    const seen = new Set();
    let hasBlank = false;
    const options = [];
    entriesForFilterOptions.forEach((entry) => {
      const value = entry.entry_no;
      if (value == null || value === '') {
        hasBlank = true;
        return;
      }
      const key = String(value);
      if (!seen.has(key)) {
        seen.add(key);
        options.push({ value: key, label: key });
      }
    });
    options.sort((a, b) => Number(a.value) - Number(b.value));
    if (hasBlank) options.unshift(blankOption);
    return options;
  }, [entriesForFilterOptions, hideDiscountAndActivity]);
  const hasActiveColumnFilters =
    filterDateStart ||
    filterDateEnd ||
    filterTransferRefund ||
    filterMode ||
    (hideDiscountAndActivity && filterEntryNo);
  const tableEntries = useMemo(() => {
    let entries = entriesForFilterOptions;
    if (hideDiscountAndActivity && filterEntryNo) {
      if (filterEntryNo === BLANK_VALUE) {
        entries = entries.filter((entry) => entry.entry_no == null || entry.entry_no === '');
      } else {
        entries = entries.filter(
          (entry) => String(entry.entry_no) === String(filterEntryNo)
        );
      }
    }
    return entries;
  }, [
    entriesForFilterOptions,
    filterEntryNo,
    hideDiscountAndActivity,
  ]);
  const totals = useMemo(
    () =>
      tableEntries.reduce(
        (acc, entry) => {
          if (entry.type === 'Refund') {
            acc.advance -= Number(entry.refund_amount) || 0;
          } else {
            acc.advance += Number(entry.amount) || 0;
          }
          if (entry.type === 'Bill Settlement') {
            acc.bill += Number(entry.bill_amount) || 0;
            acc.discount += Number(entry.discount_amount) || 0;
          }
          return acc;
        },
        { advance: 0, bill: 0, discount: 0 }
      ),
    [tableEntries]
  );
  const { sortField, sortDirection, handleSort, clearSort } = useSideTableSort();
  const sortedTableEntries = useMemo(
    () => sortSideTableAdvanceEntries(tableEntries, sortField, sortDirection, siteOptions),
    [tableEntries, sortField, sortDirection, siteOptions],
  );
  const { expandedCells, toggleExpandedCell } = useEdbcExpandedCells();
  const edbc8Config = getEdbcColumnConfig(EDBC_IDS.EDBC8);
  const edbc3Config = getEdbcColumnConfig(EDBC_IDS.EDBC3);
  const edbc13Config = getEdbcColumnConfig(EDBC_IDS.EDBC13);
  const edbc17Config = getEdbcColumnConfig(EDBC_IDS.EDBC17);
  const edbc20Config = getEdbcColumnConfig(EDBC_IDS.EDBC20);
  const edbc19Config = getEdbcColumnConfig(EDBC_IDS.EDBC19);
  const edbc19TdClass = edbc19Config?.tdClass || '';
  const tableColSpan = hideDiscountAndActivity ? 7 : 8;
  const tableWidthClass = hideDiscountAndActivity ? 'w-[978px] max-w-[978px]' : 'w-[1038px] max-w-[1038px]';
  const formSideTableHostWidthClass = hideDiscountAndActivity ? 'w-[978px]' : 'w-fit';
  const formSideTableFilterSelectStyles = useMemo(
    () => ({
      ...DATABASE_TABLE_FILTER_SELECT_STYLES,
      container: (provided) => ({
        ...provided,
        width: '100%',
        maxWidth: '100%',
      }),
      control: (provided, state) => ({
        ...DATABASE_TABLE_FILTER_SELECT_STYLES.control(provided, state),
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
      }),
      menuPortal: (provided) => ({
        ...provided,
        zIndex: 99999,
      }),
    }),
    [],
  );
  const formSideTableClass = hideDiscountAndActivity
    ? [
        '[&_thead_tr:nth-child(2)>th#EDBC-3]:!overflow-visible [&_thead_tr:nth-child(2)>th#EDBC-17]:!overflow-visible [&_thead_tr:nth-child(2)>th#EDBC-13]:!overflow-visible',
        '[&_thead_tr:nth-child(2)>th#EDBC-3]:!box-border [&_thead_tr:nth-child(2)>th#EDBC-17]:!box-border [&_thead_tr:nth-child(2)>th#EDBC-13]:!box-border',
        '[&_thead_tr:nth-child(2)>th#EDBC-3>div]:!w-full [&_thead_tr:nth-child(2)>th#EDBC-3>div]:!max-w-full [&_thead_tr:nth-child(2)>th#EDBC-3>div]:!min-w-0',
        '[&_thead_tr:nth-child(2)>th#EDBC-3]:!p-0 [&_thead_tr:nth-child(2)>th#EDBC-17]:!pl-0 [&_thead_tr:nth-child(2)>th#EDBC-17]:!py-0 [&_thead_tr:nth-child(2)>th#EDBC-13]:!p-0',
        '[&_thead_tr:nth-child(2)>th#EDBC-17>div]:!w-full [&_thead_tr:nth-child(2)>th#EDBC-17>div]:!max-w-full [&_thead_tr:nth-child(2)>th#EDBC-17>div]:!min-w-0',
        '[&_thead_tr:nth-child(2)>th#EDBC-13>div]:!w-full [&_thead_tr:nth-child(2)>th#EDBC-13>div]:!max-w-full [&_thead_tr:nth-child(2)>th#EDBC-13>div]:!min-w-0',
        '[&_thead_tr:nth-child(2)>th#EDBC-20]:!pl-[6px]',
        '[&]:!overflow-x-hidden',
      ].join(' ')
    : '';
  const formSideTableSpacerRow = hideDiscountAndActivity ? (
    <tr aria-hidden="true" className="h-0 overflow-hidden pointer-events-none">
      <td colSpan={tableColSpan} className="h-0 p-0 border-0 leading-[0] text-[0px] overflow-hidden">
        &#8203;
      </td>
    </tr>
  ) : null;

  const exportPDF = () => {
    const doc = new jsPDF();
    const entityType = selectedOption?.type === 'Contractor' ? 'Contractor' : 'Vendor';
    const entityName = selectedOption?.label || '';
    const projectName = selectedSite?.label || '';
    doc.setFontSize(12);
    doc.text(`${entityType} - ${entityName}`, 14, 20);
    const pageWidth = doc.internal.pageSize.getWidth();
    const projectText = `Project Name: ${projectName}`;
    const textWidth = doc.getTextWidth(projectText);
    doc.text(projectText, pageWidth - textWidth - 14, 20);
    const filteredData = filterEntriesForSideTable(advanceData, selectedOption, selectedSite)
      .sort((a, b) => {
        const typeOrder = ['Advance', 'Bill Settlement', 'Refund', 'Transfer'];
        const typeIndexA = typeOrder.indexOf((a.type || '').trim());
        const typeIndexB = typeOrder.indexOf((b.type || '').trim());
        if (typeIndexA !== typeIndexB) return typeIndexA - typeIndexB;
        const modeA = (a.payment_mode || '').trim().toLowerCase();
        const modeB = (b.payment_mode || '').trim().toLowerCase();
        if (!modeA && modeB) return 1;
        if (modeA && !modeB) return -1;
        return modeA.localeCompare(modeB);
      });
    const tableColumn = [
      'S.No',
      'Date',
      'Advance',
      'Bill Amount',
      'Discount',
      'Refund Amount',
      'Transfer',
      'Type',
      'Mode',
      'Description',
    ];
    const tableRows = filteredData.map((entry, index) => {
      const {
        date,
        amount,
        bill_amount,
        discount_amount,
        type,
        transfer_site_id,
        payment_mode,
        refund_amount,
        description,
      } = entry;
      const advanceAmount =
        type === 'Refund' ? '' : formatEdbc8Amount(amount);
      const billAmount =
        type === 'Bill Settlement'
          ? formatEdbc8Amount(bill_amount)
          : '';
      const discountDisplay =
        type === 'Bill Settlement' && (parseFloat(discount_amount) || 0) > 0
          ? formatEdbc8Amount(discount_amount)
          : '';
      const refundAmount =
        type === 'Refund'
          ? formatEdbc8Amount(refund_amount)
          : '';
      let transferText = '';
      if (type === 'Transfer') {
        const siteLabel = siteOptions.find((site) => site.id === parseInt(transfer_site_id))?.label;
        transferText =
          parseFloat(amount) < 0
            ? `Transfer to ${siteLabel || 'Unknown Site'}`
            : `Transfer from ${siteLabel || 'Unknown Site'}`;
      }
      return [
        index + 1,
        new Date(date).toLocaleDateString('en-GB'),
        advanceAmount,
        billAmount,
        discountDisplay,
        refundAmount,
        transferText,
        type,
        payment_mode || '',
        description || '',
      ];
    });
    doc.autoTable({
      startY: 28,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: { halign: 'left' },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        lineWidth: 0.1,
      },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
      },
    });
    doc.save('Advance_Report.pdf');
  };

  const exportCSV = () => {
    const entityType = selectedOption?.type === 'Contractor' ? 'Contractor' : 'Vendor';
    const entityName = selectedOption?.label || '';
    const projectName = selectedSite?.label || '';
    const filteredData = filterEntriesForSideTable(advanceData, selectedOption, selectedSite);
    const rows = filteredData.map((entry, index) => {
      const { date, amount, bill_amount, discount_amount, type, transfer_site_id, payment_mode, refund_amount } = entry;
      const advanceAmount = (() => {
        if (type === 'Refund') {
          return formatEdbc8AmountNegative(refund_amount);
        }
        return formatEdbc8Amount(amount);
      })();
      const billAmount =
        type === 'Bill Settlement'
          ? formatEdbc8Amount(bill_amount)
          : '';
      const discountCsv =
        type === 'Bill Settlement' && (parseFloat(discount_amount) || 0) > 0
          ? formatEdbc8Amount(discount_amount)
          : '';
      let transferOrRefund = '';
      if (type === 'Refund') {
        transferOrRefund = 'Refund';
      } else if (type === 'Transfer') {
        const siteLabel = siteOptions.find((site) => site.id === parseInt(transfer_site_id))?.label;
        transferOrRefund =
          parseFloat(amount) < 0
            ? `Transfer to ${siteLabel || 'Unknown Site'}`
            : `Transfer from ${siteLabel || 'Unknown Site'}`;
      }
      return {
        'S.No': index + 1,
        Date: new Date(date).toLocaleDateString('en-GB'),
        Advance: advanceAmount,
        Bill: billAmount,
        Discount: discountCsv,
        'Transfer/Refund': transferOrRefund,
        Mode: payment_mode || '',
      };
    });
    let csv = `${entityType}: ${entityName},Project Name: ${projectName}\n\n`;
    csv += `${Object.keys(rows[0] || {}).join(',')}\n`;
    rows.forEach((row) => {
      csv += `${Object.values(row).map((value) => `"${value}"`).join(',')}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Advance_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setFilterDateStart('');
    setFilterDateEnd('');
    setShowDateRangePicker(false);
    setFilterTransferRefund('');
    setFilterMode('');
    setFilterEntryNo('');
    setOverallSearch('');
    clearSort();
  };

  const toggleFilters = () => {
    const willOpen = !showFilters;
    const scroller = scrollRef.current;
    if (willOpen) {
      if (scroller) {
        filterAnchorRowRef.current = getFirstVisibleSideTableBodyRow(scroller);
        filterScrollTopBeforeToggleRef.current = scroller.scrollTop;
      }
      pendingFilterOpenNudgeRef.current = true;
      setShowFilters(true);
      return;
    }
    if (scroller) {
      filterAnchorRowRef.current = getFirstVisibleSideTableBodyRow(scroller);
      filterScrollTopBeforeToggleRef.current = scroller.scrollTop;
      filterRowHeightBeforeCloseRef.current = filterRowRef.current?.offsetHeight || 0;
    }
    pendingFilterCloseNudgeRef.current = true;
    setShowFilters(false);
  };

  const formSideTableSearchActions = (
    <>
      <button type="button" onClick={clearFilters} className="flex h-[30px] w-[30px] shrink-0 items-center justify-center">
        <img className="w-full h-full" src={Reload} alt="Reload" />
      </button>
      <div className="w-[286px] min-w-[286px] max-w-[286px] shrink-0 h-[34px] border border-[#D6D6D6] rounded-md bg-white flex items-center px-2">
        <input
          type="text"
          value={overallSearch}
          onChange={(e) => setOverallSearch(e.target.value)}
          placeholder={SIDE_TABLE_FIELDS.searchTransactions}
          className="h-full w-full border-0 p-0 text-[14px] text-[#000000] bg-transparent outline-none"
        />
        <img src={Search} alt="Search" className="w-[16px] h-[16px] pointer-events-none" />
      </div>
    </>
  );

  const formSideTableFilterToolbarLeft = (
    <div
      className={
        hideDiscountAndActivity
          ? `flex min-w-0 w-full items-center overflow-hidden${hasActiveColumnFilters ? ' gap-[8px]' : ' gap-[6px]'}`
          : 'flex shrink-0 flex-col sm:flex-row sm:items-center sm:space-x-3'
      }
    >
      <button type="button" onClick={toggleFilters} className="shrink-0">
        <img src={Filter} alt="Toggle Filter" className="h-[34px] w-auto shrink-0 border rounded-md" />
      </button>
      {hasActiveColumnFilters && (
        <div
          ref={hideDiscountAndActivity ? filterChipsScrollRef : null}
          onMouseDown={hideDiscountAndActivity ? handleFilterChipsMouseDown : undefined}
          onMouseMove={hideDiscountAndActivity ? handleFilterChipsMouseMove : undefined}
          onMouseUp={hideDiscountAndActivity ? handleFilterChipsMouseUp : undefined}
          onMouseLeave={hideDiscountAndActivity ? handleFilterChipsMouseUp : undefined}
          className={
            hideDiscountAndActivity
              ? 'flex min-w-0 flex-1 overflow-x-auto flex-nowrap gap-2 no-scrollbar scrollbar-none cursor-grab select-none'
              : 'flex flex-col sm:flex-row flex-wrap gap-2 mt-2 sm:mt-0'
          }
        >
          {(filterDateStart || filterDateEnd) && (
            <span className="inline-flex shrink-0 items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit">
              <span className="font-medium text-[#BF9853]">{SIDE_TABLE_FIELDS.date}: </span>
              <span className="font-semibold text-[14px]">
                {filterDateStart && filterDateEnd
                  ? filterDateStart === filterDateEnd
                    ? formatEdbcFilterDateDMY(filterDateStart)
                    : `${formatEdbcFilterDateDMY(filterDateStart)} – ${formatEdbcFilterDateDMY(filterDateEnd)}`
                  : filterDateStart
                    ? `From ${formatEdbcFilterDateDMY(filterDateStart)}`
                    : formatEdbcFilterDateDMY(filterDateEnd)}
              </span>
              <button
                type="button"
                onClick={() => {
                  setFilterDateStart('');
                  setFilterDateEnd('');
                }}
                className="text-[#E4572E] ml-1 text-2xl"
              >
                ×
              </button>
            </span>
          )}
          {filterTransferRefund && (
            <span className="inline-flex shrink-0 items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit">
              <span className="font-medium text-[#BF9853]">{SIDE_TABLE_FIELDS.transferRefund}: </span>
              <span className="font-semibold text-[14px]">
                {filterTransferRefund === BLANK_VALUE ? BLANK_LABEL : filterTransferRefund}
              </span>
              <button type="button" onClick={() => setFilterTransferRefund('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
            </span>
          )}
          {filterMode && (
            <span className="inline-flex shrink-0 items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit">
              <span className="font-medium text-[#BF9853]">{SIDE_TABLE_FIELDS.mode}: </span>
              <span className="font-semibold text-[14px]">{filterMode}</span>
              <button type="button" onClick={() => setFilterMode('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
            </span>
          )}
          {hideDiscountAndActivity && filterEntryNo && (
            <span className="inline-flex shrink-0 items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit">
              <span className="font-medium text-[#BF9853]">{SIDE_TABLE_FIELDS.entryNo}: </span>
              <span className="font-semibold text-[14px]">
                {filterEntryNo === BLANK_VALUE ? BLANK_LABEL : filterEntryNo}
              </span>
              <button type="button" onClick={() => setFilterEntryNo('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );

  const formSideTableTableSection = (
    <div className={`border-l-8 border-l-[#BF9853] rounded-lg ${showFilters ? 'overflow-visible' : 'overflow-hidden'} box-border shrink-0 ${formSideTableHostWidthClass} ${hideDiscountAndActivity ? 'min-w-[978px]' : 'max-w-full'}`}>
        <div
          ref={scrollRef}
          className={`overflow-x-hidden max-h-[400px] overflow-y-scroll no-scrollbar scrollbar-none select-none ${hideDiscountAndActivity ? 'w-[978px] min-w-[978px] shrink-0' : 'w-full'}`}
          onWheel={() => { filterNudgeUsedRef.current = false; }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <table className={`table-fixed ${tableWidthClass} border-collapse ${EDBC_TABLE_EDGE_TABLE_CLASS} ${SIDE_TABLE_DATE_FILTER_CALENDAR_CLASS} ${SIDE_TABLE_DATE_COLUMN_CLASS} ${formSideTableClass}`}>
            <colgroup>
              <col className={EDBC2_FIRST_COLUMN_WIDTH_CLASS} />
              <col className={edbc8Config?.columnWidthClass} />
              <col className={edbc8Config?.columnWidthClass} />
              {!hideDiscountAndActivity && <col className={edbc8Config?.columnWidthClass} />}
              <col className={edbc3Config?.columnWidthClass} />
              {hideDiscountAndActivity && <col className={edbc17Config?.columnWidthClass} />}
              <col className={edbc13Config?.columnWidthClass} />
              {hideDiscountAndActivity && <col className={edbc20Config?.columnWidthClass} />}
              {!hideDiscountAndActivity && <col className={edbc19Config?.columnWidthClass} />}
              {!hideDiscountAndActivity && <col className={edbc20Config?.columnWidthClass} />}
            </colgroup>
            <thead className={`sticky top-0 bg-white ${showFilters ? 'z-30' : 'z-10'}`}>
              <EdbcTableHeaderRow>
                <EdbcColumnHeader
                  columnId={EDBC_IDS.EDBC2}
                  label={SIDE_TABLE_FIELDS.date}
                  columnWidthClass={EDBC2_FIRST_COLUMN_WIDTH_CLASS}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SideTableColumnHeader
                  columnId={EDBC_IDS.EDBC8}
                  label={SIDE_TABLE_FIELDS.advance}
                  sortKey={SIDE_TABLE_SORT_KEYS[SIDE_TABLE_FIELDS.advance]}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SideTableColumnHeader
                  columnId={EDBC_IDS.EDBC8}
                  label={SIDE_TABLE_FIELDS.bill}
                  sortKey={SIDE_TABLE_SORT_KEYS[SIDE_TABLE_FIELDS.bill]}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                {!hideDiscountAndActivity && (
                  <SideTableColumnHeader
                    columnId={EDBC_IDS.EDBC8}
                    label={SIDE_TABLE_FIELDS.discount}
                    sortKey={SIDE_TABLE_SORT_KEYS[SIDE_TABLE_FIELDS.discount]}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                )}
                <SideTableColumnHeader
                  columnId={EDBC_IDS.EDBC3}
                  label={SIDE_TABLE_FIELDS.transferRefund}
                  sortKey={SIDE_TABLE_SORT_KEYS[SIDE_TABLE_FIELDS.transferRefund]}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                {hideDiscountAndActivity && (
                  <SideTableColumnHeader
                    columnId={EDBC_IDS.EDBC17}
                    label={SIDE_TABLE_FIELDS.entryNo}
                    sortKey={SIDE_TABLE_SORT_KEYS[SIDE_TABLE_FIELDS.entryNo]}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                )}
                <SideTableColumnHeader
                  columnId={EDBC_IDS.EDBC13}
                  label={SIDE_TABLE_FIELDS.mode}
                  sortKey={SIDE_TABLE_SORT_KEYS[SIDE_TABLE_FIELDS.mode]}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                {hideDiscountAndActivity && (
                  <EdbcColumnHeader columnId={EDBC_IDS.EDBC20} label={SIDE_TABLE_FIELDS.file} />
                )}
                {!hideDiscountAndActivity && (
                  <EdbcColumnHeader columnId={EDBC_IDS.EDBC19} label={SIDE_TABLE_FIELDS.activity} />
                )}
                {!hideDiscountAndActivity && (
                  <EdbcColumnHeader columnId={EDBC_IDS.EDBC20} label={SIDE_TABLE_FIELDS.file} />
                )}
              </EdbcTableHeaderRow>
              {showFilters && (
                <EdbcTableFilterRow ref={filterRowRef}>
                  <EdbcTimestampFilter
                    columnId={EDBC_IDS.EDBC2}
                    placeholder={SIDE_TABLE_FIELDS.date}
                    timestampStartDate={filterDateStart}
                    timestampEndDate={filterDateEnd}
                    isOpen={showDateRangePicker}
                    onOpen={() => setShowDateRangePicker(true)}
                    onClose={() => setShowDateRangePicker(false)}
                    onApply={(from, to) => {
                      setFilterDateStart(from || '');
                      setFilterDateEnd(to || '');
                    }}
                  />
                  <EdbcTotalAmountFilter columnId={EDBC_IDS.EDBC8} totalAmount={totals.advance} />
                  <EdbcTotalAmountFilter columnId={EDBC_IDS.EDBC8} totalAmount={totals.bill} />
                  {!hideDiscountAndActivity && (
                    <EdbcTotalAmountFilter columnId={EDBC_IDS.EDBC8} totalAmount={totals.discount} />
                  )}
                  {hideDiscountAndActivity ? (
                    <SideTableSelectFilter
                      columnId={EDBC_IDS.EDBC3}
                      placeholder={SIDE_TABLE_FIELDS.transferRefund}
                      options={transferRefundFilterOptions}
                      value={filterTransferRefund}
                      onChange={setFilterTransferRefund}
                      blankOption={blankOption}
                      blankValue={BLANK_VALUE}
                      selectStyles={formSideTableFilterSelectStyles}
                    />
                  ) : (
                    <EdbcProjectNameFilter
                      placeholder={SIDE_TABLE_FIELDS.transferRefund}
                      options={transferRefundFilterOptions}
                      value={filterTransferRefund}
                      onChange={setFilterTransferRefund}
                      blankOption={blankOption}
                      blankValue={BLANK_VALUE}
                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                    />
                  )}
                  {hideDiscountAndActivity && (
                    <SideTableSelectFilter
                      columnId={EDBC_IDS.EDBC17}
                      placeholder={SIDE_TABLE_FIELDS.entryNo}
                      options={entryNoFilterOptions}
                      value={filterEntryNo}
                      onChange={setFilterEntryNo}
                      blankOption={blankOption}
                      blankValue={BLANK_VALUE}
                      selectStyles={formSideTableFilterSelectStyles}
                    />
                  )}
                  {hideDiscountAndActivity ? (
                    <SideTableSelectFilter
                      columnId={EDBC_IDS.EDBC13}
                      placeholder={SIDE_TABLE_FIELDS.mode}
                      options={modeFilterOptions}
                      value={filterMode}
                      onChange={setFilterMode}
                      selectStyles={formSideTableFilterSelectStyles}
                    />
                  ) : (
                    <EdbcSelectFilter
                      columnId={EDBC_IDS.EDBC13}
                      placeholder={SIDE_TABLE_FIELDS.mode}
                      options={modeFilterOptions}
                      value={filterMode}
                      onChange={setFilterMode}
                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                    />
                  )}
                  {hideDiscountAndActivity && (
                    <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC20} />
                  )}
                  {!hideDiscountAndActivity && (
                    <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC19} />
                  )}
                  {!hideDiscountAndActivity && (
                    <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC20} />
                  )}
                </EdbcTableFilterRow>
              )}
            </thead>
            <tbody>
              {!selectedOption || !selectedSite ? (
                <tr>
                  <td colSpan={tableColSpan} className="text-center py-4 text-sm text-gray-500">
                    Please select a contractor/vendor and project to view advance records.
                  </td>
                </tr>
              ) : sortedTableEntries.length === 0 ? (
                <tr>
                  <td colSpan={tableColSpan} className="text-center py-4 text-sm text-gray-500">
                    No records found for the selected contractor/vendor and project.
                  </td>
                </tr>
              ) : (
                <>
                {sortedTableEntries.map((entry, index) => {
                  const row = toExpenseRow(entry);
                  const { advanceAmount, billAmount, discountDisplay, transferOrRefund, payment_mode } =
                    getEntryRowDisplay(entry, siteOptions);
                  const rowKey = entry.advancePortalId ?? index;
                  return (
                    <EdbcTableBodyRow key={rowKey}>
                      <EdbcDateBodyCell
                        expense={row}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        formatValue={(date) => new Date(date).toLocaleDateString('en-GB')}
                        columnWidthClass={EDBC2_FIRST_COLUMN_WIDTH_CLASS}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC8}
                        expense={row}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        textAlignClass="text-right"
                        getDisplayValue={() => advanceAmount}
                      />
                      <td className={`${edbc8Config?.tdClass || ''} text-right`.trim()}>
                        <span
                          onClick={() => toggleExpandedCell(`${rowKey}-bill_amount`)}
                          className={`block w-full cursor-pointer text-right ${expandedCells[`${rowKey}-bill_amount`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                          title={billAmount}
                        >
                          {billAmount}
                        </span>
                      </td>
                      {!hideDiscountAndActivity && (
                        <td className={`${edbc8Config?.tdClass || ''} text-right`.trim()}>
                          <span
                            onClick={() => toggleExpandedCell(`${rowKey}-discount_amount`)}
                            className={`block w-full cursor-pointer text-right ${expandedCells[`${rowKey}-discount_amount`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                            title={discountDisplay}
                          >
                            {discountDisplay}
                          </span>
                        </td>
                      )}
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC3}
                        expense={row}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={() => transferOrRefund}
                      />
                      {hideDiscountAndActivity && (
                        <EdbcExpandableBodyCell
                          columnId={EDBC_IDS.EDBC17}
                          expense={row}
                          rowIndex={index}
                          expandedCells={expandedCells}
                          onToggleExpanded={toggleExpandedCell}
                          textAlignClass="text-right"
                          getDisplayValue={(expense) => expense.eno ?? ''}
                        />
                      )}
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC13}
                        expense={row}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={() => payment_mode}
                      />
                      {hideDiscountAndActivity && (
                        <EdbcFileBodyCell
                          columnId={EDBC_IDS.EDBC20}
                          expense={{ ...row, billCopy: entry.file_url }}
                        />
                      )}
                      {!hideDiscountAndActivity && (
                        <td id={EDBC_IDS.EDBC19} className={edbc19TdClass}>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <button type="button" className="rounded-full transition duration-200">
                              <img
                                src={edit}
                                onClick={() => onEditClick(entry)}
                                alt="Edit"
                                className="w-4 h-6 transform hover:scale-110 hover:brightness-110 transition duration-200"
                              />
                            </button>
                          </div>
                        </td>
                      )}
                      {!hideDiscountAndActivity && (
                        <EdbcFileBodyCell
                          columnId={EDBC_IDS.EDBC20}
                          expense={{ ...row, billCopy: entry.file_url }}
                        />
                      )}
                    </EdbcTableBodyRow>
                  );
                })}
                {formSideTableSpacerRow}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
  );

  const formSideTableScrollInner = (
    <>
      <div
        className={`text-left flex mb-[12px] ${
          hasActiveColumnFilters ? 'flex-col sm:flex-row sm:justify-between' : 'flex-row justify-between items-center'
        } gap-[px] w-full`}
      >
        {formSideTableFilterToolbarLeft}
        <div className="flex min-w-0 items-end justify-end">
          {formSideTableSearchActions}
        </div>
      </div>
      {formSideTableTableSection}
    </>
  );

  const formSideTableFormContent = (
    <>
      <div className="form-side-table-toolbar-row w-full max-w-[978px] min-w-0 shrink-0 text-left flex flex-wrap mb-[12px] justify-between items-start gap-y-2 gap-x-2">
        <div className="form-side-table-filter-left flex min-w-0 flex-[1_1_200px] max-w-full flex-col gap-1">
          {projectAdvance != null && (
            <h2
              ref={advanceHeaderRef}
              className="form-side-table-advance-header text-base font-semibold leading-none"
            >
              Advance
            </h2>
          )}
          {formSideTableFilterToolbarLeft}
        </div>
        <div className="form-side-table-search-column flex flex-col items-end gap-1 ml-auto shrink-0">
          {projectAdvance != null && (
            <span className="form-side-table-advance-amount text-base font-bold text-[#E4572E] leading-none">
              ₹{projectAdvance || '0'}
            </span>
          )}
          <div className="form-side-table-search-row flex shrink-0 items-center gap-[6px]">
            {formSideTableSearchActions}
          </div>
        </div>
      </div>
      <div className="form-side-table-h-scroll min-w-0 w-full overflow-x-auto no-scrollbar scrollbar-none shrink-0">
        <div className="w-[978px] min-w-[978px] shrink-0 flex flex-col">
          {formSideTableTableSection}
        </div>
      </div>
    </>
  );

  return (
    <div className={`side-table-root ${hideDiscountAndActivity ? 'side-table-form-path w-full min-w-0 max-w-full' : 'w-full min-w-0 max-w-full'} flex flex-col`}>
      {hideDiscountAndActivity ? (
        formSideTableFormContent
      ) : (
        <div className={`${formSideTableHostWidthClass} max-w-full shrink-0 flex flex-col`}>
          {formSideTableScrollInner}
        </div>
      )}
    </div>
  );
};

export default SideTable;
