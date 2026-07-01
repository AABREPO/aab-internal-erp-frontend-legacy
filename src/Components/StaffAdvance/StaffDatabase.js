import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { notifyOrbitModuleDataChanged } from '../../utils/orbitProjectDataSync';
import { useOrbitPageSync } from '../../utils/useOrbitPageSync';
import { useTabRefreshSignal } from '../../utils/useTabRefreshSignal';
import {
  buildStaffEditPayloadFromForm,
  shouldPromptStaffEditPaymentModal,
  fetchStaffEditPaymentModalData,
  syncWeeklyPaymentBillsForStaffAdvancePortal,
  clearStaffAdvanceRecordsOnDelete,
  getStaffAdvanceDisplayAmount,
  isStaffAdvanceChequePaymentMode,
} from '../../utils/staffAdvanceWeeklyPaymentBill';
import { formatWeeklyBillDeleteMessage } from '../../utils/advancePortalWeeklyPaymentBill';
import AdvancePortalEditPaymentModal from '../Advance Portal/AdvancePortalEditPaymentModal';
import jsPDF from "jspdf";
import "jspdf-autotable";
import Select from 'react-select';
import {
  EDBC_IDS,
  DATABASE_TABLE_FILTER_SELECT_STYLES,
  formatEdbcFilterDateDMY,
  getEdbcColumnConfig,
  useEdbcExpandedCells,
  EdbcTableHeaderRow,
  EdbcTableFilterRow,
  EdbcTableBodyRow,
  EdbcColumnHeader,
  EdbcTimestampFilter,
  EdbcProjectNameFilter,
  EdbcSelectFilter,
  EdbcPaymentModeFilter,
  EdbcPaymentModeFilterChip,
  hasEdbcPaymentModeFilter,
  matchesEdbcPaymentModeFilter,
  EdbcEmptyFilterCell,
  EdbcTotalAmountFilter,
  EdbcTextInputFilter,
  matchesEdbcAmountFilter,
  EdbcTimestampBodyCell,
  EdbcDateBodyCell,
  EdbcExpandableBodyCell,
  EdbcFileBodyCell,
  EDBC_TABLE_EDGE_TABLE_CLASS,
  EdbcFilterToggleButton,
  EdbcTableToolbarRightActions,
} from '../ExpensesEntry/databaseExpensesSharedColumns';
import edit from '../Images/Edit.svg';
import history from '../Images/History.svg';
import remove from '../Images/Delete.svg';

const formatAmountDisplay = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const normalized = String(value).replace(/,/g, '');
  const num = Number(normalized);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const ADVANCE_PORTAL_FILTER_AMOUNT_INPUT_CLASS =
  'pl-[12px] pr-2 border border-[#00000029] rounded-lg w-full h-full focus:outline-none bg-[#ededed] text-[14px] font-medium cursor-default';
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

const formatStaffDatabaseAmount = (value) =>
  value != null && value !== ''
    ? Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })
    : '';

const STAFF_TABLEVIEW_BLANK_VALUE = 'BLANK';
const STAFF_TABLEVIEW_BLANK_LABEL = 'Blank';
const staffTableviewBlankOption = { value: STAFF_TABLEVIEW_BLANK_VALUE, label: STAFF_TABLEVIEW_BLANK_LABEL };
const isStaffTableviewBlankish = (value) =>
  value === null ||
  value === undefined ||
  (typeof value === 'string' && value.trim() === '') ||
  value === 0 ||
  value === '0';

const StaffDatabase = ({ username, userRoles = [], paymentModeOptions = [], refreshSignal, isActive = true }) => {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const [filterType, setFilterType] = useState(''); // "" means all types
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [laboursList, setLaboursList] = useState([]);
  const [staffAdvanceCombinedOptions, setStaffAdvanceCombinedOptions] = useState([]);
  // New state variables for advanced functionality
  const [selectDate, setSelectDate] = useState('');
  const [selectDateEnd, setSelectDateEnd] = useState('');
  const [timestampStartDate, setTimestampStartDate] = useState('');
  const [timestampEndDate, setTimestampEndDate] = useState('');
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [showExpenseDateRangePicker, setShowExpenseDateRangePicker] = useState(false);
  const [selectEmployeeName, setSelectEmployeeName] = useState('');
  const [selectPurpose, setSelectPurpose] = useState('');
  const [selectTransferTo, setSelectTransferTo] = useState('');
  const [selectType, setSelectType] = useState('');
  const [selectedPaymentModes, setSelectedPaymentModes] = useState([]);
  const [selectAmount, setSelectAmount] = useState('');
  const [selectRefundAmount, setSelectRefundAmount] = useState('');
  const [selectDescription, setSelectDescription] = useState('');
  const [selectEntryNo, setSelectEntryNo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
  const [isEditPaymentSubmitting, setIsEditPaymentSubmitting] = useState(false);
  const [editPaymentModalData, setEditPaymentModalData] = useState({
    chequeNo: '',
    chequeDate: '',
    transactionNumber: '',
    accountNumber: '',
  });
  const [accountDetails, setAccountDetails] = useState([]);
  const pendingStaffUpdateRef = useRef(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [staffAdvanceAudits, setStaffAdvanceAudits] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const scrollRef = useRef(null);
  const filterRowRef = useRef(null);
  const filterNudgeUsedRef = useRef(false);
  const filterChipsScrollRef = useRef(null);
  const isFilterChipsDragging = useRef(false);
  const filterChipsDragStart = useRef({ x: 0, scrollLeft: 0 });
  const [overallSearch, setOverallSearch] = useState('');
  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const scroll = useRef({ left: 0, top: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);
  const lastMove = useRef({ time: 0, x: 0, y: 0 });

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

  // Fetch all data on mount
  const fetchData = useCallback(async () => {
    setError(null);
    try {
      let recData = [];
      try {
        const recRes = await fetch('https://backendaab.in/aabuildersDash/api/staff-advance/all');
        if (recRes.ok) {
          recData = await recRes.json();
        } else {
          console.warn('Staff advance API not available, using empty data');
        }
      } catch (error) {
        console.warn('Error fetching staff advance data:', error);
      }

      let empData = [];
      try {
        const empRes = await fetch('https://backendaab.in/aabuildersDash/api/employee_details/getAll', {
          credentials: 'include',
        });
        if (empRes.ok) {
          empData = await empRes.json();
        } else {
          console.warn('Employee API not available, using empty data');
        }
      } catch (error) {
        console.warn('Error fetching employee data:', error);
      }

      let purData = [];
      try {
        const purRes = await fetch('https://backendaab.in/aabuildersDash/api/purposes/getAll');
        if (purRes.ok) {
          purData = await purRes.json();
        } else {
          console.warn('Purposes API not available, using empty data');
        }
      } catch (error) {
        console.warn('Error fetching purposes data:', error);
      }

      setRecords(Array.isArray(recData) ? recData : []);
      setEmployees(empData.map(e => ({ id: e.id, label: e.employee_name, type: "Employee" })));
      setPurposes(purData.map(p => ({ id: p.id, label: p.purpose })));
    } catch (error) {
      console.error('Error in fetchData:', error);
      setError('Failed to load data. Some APIs may not be available.');
      setRecords([]);
      setEmployees([]);
      setPurposes([]);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  const refreshStaffRecords = useCallback(async () => {
    try {
      const recRes = await fetch('https://backendaab.in/aabuildersDash/api/staff-advance/all');
      if (recRes.ok) {
        const recData = await recRes.json();
        setRecords(Array.isArray(recData) ? recData : []);
      }
    } catch (error) {
      console.warn('Error refreshing staff advance records:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useOrbitPageSync('staffadvance', refreshStaffRecords, [refreshStaffRecords]);

  useTabRefreshSignal(refreshSignal, isActive, refreshStaffRecords);

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

  useEffect(() => { setStaffAdvanceCombinedOptions([...employees, ...laboursList]); }, [employees, laboursList]);

  // Mouse drag functionality for table scrolling
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

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };
  const { expandedCells, toggleExpandedCell } = useEdbcExpandedCells();
  const edbc8Config = getEdbcColumnConfig(EDBC_IDS.EDBC8);
  const edbc19Config = getEdbcColumnConfig(EDBC_IDS.EDBC19);
  const mapStaffSortKeyToEdbc = (key) => {
    if (key === 'employee') return 'vendor';
    if (key === 'purpose') return 'source';
    if (key === 'transfer') return 'siteName';
    if (key === 'mode') return 'paymentMode';
    if (key === 'type') return 'accountType';
    if (key === 'description') return 'comments';
    if (key === 'entry_no') return 'eno';
    if (key === 'amount') return 'amount';
    if (key === 'timestamp') return 'timestamp';
    return key;
  };
  const handleEdbcSort = (edbcField) => {
    const fieldToKey = {
      vendor: 'employee',
      source: 'purpose',
      siteName: 'transfer',
      paymentMode: 'mode',
      accountType: 'type',
      comments: 'description',
      eno: 'entry_no',
      amount: 'amount',
      date: 'date',
      timestamp: 'timestamp',
    };
    handleSort(fieldToKey[edbcField] || edbcField);
  };
  const resolveEdbcSortField = (staffSortKey) =>
    sortConfig.key === staffSortKey ? mapStaffSortKeyToEdbc(staffSortKey) : '';

  const clearFilters = () => {
    setSelectDate('');
    setSelectDateEnd('');
    setTimestampStartDate('');
    setTimestampEndDate('');
    setSelectEmployeeName('');
    setSelectPurpose('');
    setSelectTransferTo('');
    setSelectType('');
    setSelectedPaymentModes([]);
    setSelectAmount('');
    setSelectRefundAmount('');
    setSelectDescription('');
    setSelectEntryNo('');
    setOverallSearch('');
    setSortConfig({ key: null, direction: 'asc' });
    setShowFilters(false);
  };

  const formatDateOnly = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getEmployeeName = (id) => employees.find(e => e.id === id)?.label || id;
  const getLabourName = (id) => laboursList.find(l => l.id === id)?.label || id;
  const getPurposeName = (id) => purposes.find(p => p.id === id)?.label || id;

  const matchesStaffEntryDateFilter = useCallback((entry) => {
    if (!selectDate && !selectDateEnd) return true;
    const expenseDate = new Date(entry.date);
    if (selectDate && selectDateEnd) {
      const s = new Date(selectDate);
      s.setHours(0, 0, 0, 0);
      const e = new Date(selectDateEnd);
      e.setHours(23, 59, 59, 999);
      return expenseDate >= s && expenseDate <= e;
    }
    if (selectDate) {
      const s = new Date(selectDate);
      s.setHours(0, 0, 0, 0);
      return expenseDate >= s;
    }
    const e = new Date(selectDateEnd);
    e.setHours(23, 59, 59, 999);
    return expenseDate <= e;
  }, [selectDate, selectDateEnd]);

  const matchesStaffTimestampFilter = useCallback((entry) => {
    if (!timestampStartDate && !timestampEndDate) return true;
    const expenseTs = entry.timestamp ? new Date(entry.timestamp) : null;
    if (!expenseTs) return false;
    if (timestampStartDate && timestampEndDate) {
      const ts = new Date(timestampStartDate);
      ts.setHours(0, 0, 0, 0);
      const te = new Date(timestampEndDate);
      te.setHours(23, 59, 59, 999);
      return expenseTs >= ts && expenseTs <= te;
    }
    if (timestampStartDate) {
      const ts = new Date(timestampStartDate);
      ts.setHours(0, 0, 0, 0);
      return expenseTs >= ts;
    }
    const te = new Date(timestampEndDate);
    te.setHours(23, 59, 59, 999);
    return expenseTs <= te;
  }, [timestampStartDate, timestampEndDate]);

  const matchesRecordsForFilterOptions = useCallback((entry, excludeField) => {
    if (!matchesStaffTimestampFilter(entry)) return false;
    if (!matchesStaffEntryDateFilter(entry)) return false;
    if (excludeField !== 'employee' && selectEmployeeName) {
      const employeeName = String(getEmployeeName(entry.employee_id) || getLabourName(entry.labour_id) || '');
      if (selectEmployeeName === STAFF_TABLEVIEW_BLANK_VALUE) {
        if (!isStaffTableviewBlankish(employeeName)) return false;
      } else if (employeeName.toLowerCase() !== selectEmployeeName.toLowerCase()) return false;
    }
    if (excludeField !== 'purpose' && selectPurpose) {
      const purposeName = String(getPurposeName(entry.from_purpose_id) || '');
      if (selectPurpose === STAFF_TABLEVIEW_BLANK_VALUE) {
        if (!isStaffTableviewBlankish(purposeName)) return false;
      } else if (purposeName.toLowerCase() !== selectPurpose.toLowerCase()) return false;
    }
    if (excludeField !== 'transfer' && selectTransferTo) {
      const transferToName = String(getPurposeName(entry.to_purpose_id) || '');
      if (selectTransferTo === STAFF_TABLEVIEW_BLANK_VALUE) {
        if (!isStaffTableviewBlankish(transferToName)) return false;
      } else if (transferToName.toLowerCase() !== selectTransferTo.toLowerCase()) return false;
    }
    if (excludeField !== 'type' && selectType) {
      if (selectType === STAFF_TABLEVIEW_BLANK_VALUE) {
        if (!isStaffTableviewBlankish(entry.type)) return false;
      } else if (String(entry.type || '').toLowerCase() !== selectType.toLowerCase()) return false;
    }
    if (excludeField !== 'mode' && !matchesEdbcPaymentModeFilter(entry.staff_payment_mode, selectedPaymentModes, {
      blankValue: STAFF_TABLEVIEW_BLANK_VALUE,
      isBlankish: isStaffTableviewBlankish,
    })) return false;
    if (excludeField !== 'amount' && selectAmount.trim() && !matchesEdbcAmountFilter(entry.amount, selectAmount)) return false;
    if (excludeField !== 'refund' && selectRefundAmount.trim() && !matchesEdbcAmountFilter(entry.staff_refund_amount, selectRefundAmount)) return false;
    if (excludeField !== 'description' && selectDescription.trim()) {
      if (!String(entry.description ?? '').toLowerCase().includes(selectDescription.toLowerCase().trim())) return false;
    }
    if (excludeField !== 'entryNo' && selectEntryNo) {
      if (selectEntryNo === STAFF_TABLEVIEW_BLANK_VALUE) {
        if (!isStaffTableviewBlankish(entry.entry_no)) return false;
      } else if (!entry.entry_no?.toString().includes(selectEntryNo.toString())) return false;
    }
    return true;
  }, [matchesStaffTimestampFilter, matchesStaffEntryDateFilter, selectEmployeeName, selectPurpose, selectTransferTo, selectType, selectedPaymentModes, selectAmount, selectRefundAmount, selectDescription, selectEntryNo, getEmployeeName, getLabourName, getPurposeName]);

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

  const hasActiveColumnFilters = Boolean(
    selectDate ||
    selectDateEnd ||
    timestampStartDate ||
    timestampEndDate ||
    selectEmployeeName ||
    selectPurpose ||
    selectTransferTo ||
    selectAmount.trim() ||
    selectRefundAmount.trim() ||
    selectDescription.trim() ||
    selectType ||
    hasEdbcPaymentModeFilter(selectedPaymentModes) ||
    selectEntryNo
  );

  const employeeNameOptions = useMemo(() => {
    const uniqueNames = new Set();
    let hasBlank = false;
    records.filter((entry) => matchesRecordsForFilterOptions(entry, 'employee')).forEach((entry) => {
      const name = getEmployeeName(entry.employee_id) || getLabourName(entry.labour_id) || '';
      if (isStaffTableviewBlankish(name)) {
        hasBlank = true;
      } else {
        uniqueNames.add(String(name));
      }
    });
    const options = Array.from(uniqueNames)
      .sort((a, b) => String(a).localeCompare(String(b)))
      .map((name) => ({ value: name, label: name }));
    if (hasBlank) options.unshift(staffTableviewBlankOption);
    return options;
  }, [records, matchesRecordsForFilterOptions, getEmployeeName, getLabourName]);

  const purposeOptions = useMemo(() => {
    const scopedRecords = records.filter((entry) => matchesRecordsForFilterOptions(entry, 'purpose'));
    const uniquePurposes = new Set();
    let hasBlank = false;
    scopedRecords.forEach((entry) => {
      if (!entry.from_purpose_id) {
        hasBlank = true;
        return;
      }
      const purposeName = getPurposeName(entry.from_purpose_id);
      if (isStaffTableviewBlankish(purposeName) || purposeName === entry.from_purpose_id) {
        hasBlank = true;
      } else {
        uniquePurposes.add(String(purposeName));
      }
    });
    const options = Array.from(uniquePurposes)
      .sort((a, b) => String(a).localeCompare(String(b)))
      .map((purpose) => ({
        value: purpose,
        label: purpose,
        id: scopedRecords.find((r) => getPurposeName(r.from_purpose_id) === purpose)?.from_purpose_id,
      }));
    if (hasBlank) options.unshift(staffTableviewBlankOption);
    return options;
  }, [records, matchesRecordsForFilterOptions, getPurposeName]);

  const transferToOptions = useMemo(() => {
    const scopedRecords = records.filter((entry) => matchesRecordsForFilterOptions(entry, 'transfer'));
    const uniqueTransferTo = new Set();
    let hasBlank = false;
    scopedRecords.forEach((entry) => {
      if (!entry.to_purpose_id) {
        hasBlank = true;
        return;
      }
      const transferToName = getPurposeName(entry.to_purpose_id);
      if (isStaffTableviewBlankish(transferToName) || transferToName === entry.to_purpose_id) {
        hasBlank = true;
      } else {
        uniqueTransferTo.add(String(transferToName));
      }
    });
    const options = Array.from(uniqueTransferTo)
      .sort((a, b) => String(a).localeCompare(String(b)))
      .map((transferTo) => ({
        value: transferTo,
        label: transferTo,
        id: scopedRecords.find((r) => getPurposeName(r.to_purpose_id) === transferTo)?.to_purpose_id,
      }));
    if (hasBlank) options.unshift(staffTableviewBlankOption);
    return options;
  }, [records, matchesRecordsForFilterOptions, getPurposeName]);

  const typeOptions = useMemo(() => {
    const uniqueTypes = new Set();
    let hasBlank = false;
    records.filter((entry) => matchesRecordsForFilterOptions(entry, 'type')).forEach((entry) => {
      if (entry.type) uniqueTypes.add(entry.type);
      else hasBlank = true;
    });
    return (hasBlank ? [STAFF_TABLEVIEW_BLANK_VALUE] : []).concat(Array.from(uniqueTypes).sort());
  }, [records, matchesRecordsForFilterOptions]);

  const modeFilterOptions = useMemo(() => {
    const uniqueModes = new Set();
    let hasBlank = false;
    records.filter((entry) => matchesRecordsForFilterOptions(entry, 'mode')).forEach((entry) => {
      if (entry.staff_payment_mode) uniqueModes.add(entry.staff_payment_mode);
      else hasBlank = true;
    });
    const options = Array.from(uniqueModes)
      .sort()
      .map((mode) => ({ value: mode, label: mode }));
    if (hasBlank) options.unshift(staffTableviewBlankOption);
    return options;
  }, [records, matchesRecordsForFilterOptions]);

  // Advanced filtering logic
  const filteredRecords = useMemo(() => {
    return records.filter((entry) => {
      if (!matchesStaffTimestampFilter(entry)) return false;
      if (!matchesStaffEntryDateFilter(entry)) return false;

      // Employee filter
      if (selectEmployeeName) {
        const employeeName = String(getEmployeeName(entry.employee_id) || getLabourName(entry.labour_id) || "");
        if (selectEmployeeName === STAFF_TABLEVIEW_BLANK_VALUE) {
          if (!isStaffTableviewBlankish(employeeName)) return false;
        } else if (employeeName.toLowerCase() !== selectEmployeeName.toLowerCase()) return false;
      }

      if (selectPurpose) {
        const purposeName = String(getPurposeName(entry.from_purpose_id) || "");
        if (selectPurpose === STAFF_TABLEVIEW_BLANK_VALUE) {
          if (!isStaffTableviewBlankish(purposeName)) return false;
        } else if (purposeName.toLowerCase() !== selectPurpose.toLowerCase()) return false;
      }

      if (selectTransferTo) {
        const transferToName = String(getPurposeName(entry.to_purpose_id) || "");
        if (selectTransferTo === STAFF_TABLEVIEW_BLANK_VALUE) {
          if (!isStaffTableviewBlankish(transferToName)) return false;
        } else if (transferToName.toLowerCase() !== selectTransferTo.toLowerCase()) return false;
      }

      if (selectType) {
        if (selectType === STAFF_TABLEVIEW_BLANK_VALUE) {
          if (!isStaffTableviewBlankish(entry.type)) return false;
        } else if (String(entry.type || "").toLowerCase() !== selectType.toLowerCase()) return false;
      }

      if (!matchesEdbcPaymentModeFilter(entry.staff_payment_mode, selectedPaymentModes, {
        blankValue: STAFF_TABLEVIEW_BLANK_VALUE,
        isBlankish: isStaffTableviewBlankish,
      })) return false;

      if (selectAmount.trim() && !matchesEdbcAmountFilter(entry.amount, selectAmount)) return false;
      if (selectRefundAmount.trim() && !matchesEdbcAmountFilter(entry.staff_refund_amount, selectRefundAmount)) return false;
      if (selectDescription.trim()) {
        if (!String(entry.description ?? '').toLowerCase().includes(selectDescription.toLowerCase().trim())) return false;
      }
      if (selectEntryNo) {
        if (selectEntryNo === STAFF_TABLEVIEW_BLANK_VALUE) {
          if (!isStaffTableviewBlankish(entry.entry_no)) return false;
        } else if (!entry.entry_no?.toString().includes(selectEntryNo.toString())) return false;
      }

      if (overallSearch.trim()) {
        const q = overallSearch.toLowerCase().trim();
        const searchable = [
          entry.timestamp ? formatDate(entry.timestamp) : '',
          formatDateOnly(entry.date),
          getEmployeeName(entry.employee_id) || getLabourName(entry.labour_id),
          getPurposeName(entry.from_purpose_id),
          getPurposeName(entry.to_purpose_id),
          entry.amount,
          entry.staff_refund_amount,
          entry.description,
          entry.type,
          entry.staff_payment_mode,
          entry.entry_no,
        ]
          .map((v) => String(v ?? '').toLowerCase())
          .join(' ');
        if (!searchable.includes(q)) return false;
      }

      return true;
    });
  }, [records, selectEmployeeName, selectPurpose, selectTransferTo, selectType, selectedPaymentModes, selectAmount, selectRefundAmount, selectDescription, selectEntryNo, overallSearch, matchesStaffEntryDateFilter, matchesStaffTimestampFilter, getEmployeeName, getLabourName, getPurposeName]);

  const filterColumnTotals = useMemo(() => filteredRecords.reduce(
    (acc, entry) => {
      acc.amount += Number(entry.amount) || 0;
      acc.refund += Number(entry.staff_refund_amount) || 0;
      return acc;
    },
    { amount: 0, refund: 0 }
  ), [filteredRecords]);

  const entryNoOptions = useMemo(() => {
    const uniqueEntryNos = new Set();
    let hasBlank = false;
    records.filter((entry) => matchesRecordsForFilterOptions(entry, 'entryNo')).forEach((entry) => {
      if (entry.entry_no != null && entry.entry_no !== '') {
        uniqueEntryNos.add(String(entry.entry_no));
      } else {
        hasBlank = true;
      }
    });
    return (hasBlank ? [STAFF_TABLEVIEW_BLANK_VALUE] : []).concat(
      Array.from(uniqueEntryNos).sort((a, b) => Number(b) - Number(a)),
    );
  }, [records, matchesRecordsForFilterOptions]);

  // Sorting logic
  const sortedData = useMemo(() => {
    let sortableData = [...filteredRecords];

    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        let aValue, bValue;

        switch (sortConfig.key) {
          case 'timestamp':
            aValue = a.timestamp ? new Date(a.timestamp) : new Date(0);
            bValue = b.timestamp ? new Date(b.timestamp) : new Date(0);
            break;
          case 'date':
            aValue = new Date(a.date);
            bValue = new Date(b.date);
            break;
          case 'employee':
            aValue = getEmployeeName(a.employee_id) || getLabourName(a.labour_id);
            bValue = getEmployeeName(b.employee_id) || getLabourName(b.labour_id);
            break;
          case 'purpose':
            aValue = getPurposeName(a.from_purpose_id);
            bValue = getPurposeName(b.from_purpose_id);
            break;
          case 'transfer':
            aValue = getPurposeName(a.to_purpose_id);
            bValue = getPurposeName(b.to_purpose_id);
            break;
          case 'amount':
            aValue = Number(a.amount) || 0;
            bValue = Number(b.amount) || 0;
            break;
          case 'refund':
            aValue = Number(a.staff_refund_amount) || 0;
            bValue = Number(b.staff_refund_amount) || 0;
            break;
          case 'description':
            aValue = a.description || '';
            bValue = b.description || '';
            break;
          case 'type':
            aValue = a.type || '';
            bValue = b.type || '';
            break;
          case 'mode':
            aValue = a.staff_payment_mode || '';
            bValue = b.staff_payment_mode || '';
            break;
          case 'entry_no':
            aValue = Number(a.entry_no) || 0;
            bValue = Number(b.entry_no) || 0;
            break;
          default:
            return 0;
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // Default sorting: latest entry_no first (descending order)
      sortableData.sort((a, b) => Number(b.entry_no) - Number(a.entry_no));
      console.log("Default sorting by entry_no desc applied:", sortableData.map(item => item.entry_no));
    }

    return sortableData;
  }, [filteredRecords, sortConfig, getEmployeeName, getLabourName, getPurposeName]);



  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectDate, selectDateEnd, timestampStartDate, timestampEndDate, selectEmployeeName, selectPurpose, selectTransferTo, selectType, selectedPaymentModes, selectAmount, selectRefundAmount, selectDescription, selectEntryNo, overallSearch]);

  // Pagination handlers
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
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Calculate summary totals dynamically for filtered records
  const advanceTotal = filteredRecords
    .filter(r => r.type === 'Advance')
    .reduce((acc, r) => acc + (r.amount || 0), 0);
  const transferTotal = filteredRecords
    .filter(r => r.type === 'Transfer')
    .reduce((acc, r) => acc + (r.amount > 0 ? r.amount : 0), 0);
  const refundTotal = filteredRecords
    .filter(r => r.type === 'Refund')
    .reduce((acc, r) => acc + (r.staff_refund_amount || 0), 0);

  // Export functionality
  const exportPDF = () => {
    const doc = new jsPDF("l", "pt", "a4");
    const headers = [
      [
        "S.No",
        "Timestamp",
        "Date",
        "Employee Name",
        "Purpose",
        "Transfer To",
        "Advance",
        "Refund",
        "Type",
        "Mode",
        "Description",
        "E.No"
      ]
    ];
    const rows = sortedData.map((entry, index) => [
      index + 1,
      entry.timestamp ? formatDate(entry.timestamp) : "",
      formatDateOnly(entry.date),
      getEmployeeName(entry.employee_id) || getLabourName(entry.labour_id),
      getPurposeName(entry.from_purpose_id),
      getPurposeName(entry.to_purpose_id),
      entry.amount != null && entry.amount !== ""
        ? Number(entry.amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.staff_refund_amount != null && entry.staff_refund_amount !== ""
        ? Number(entry.staff_refund_amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.type,
      entry.staff_payment_mode,
      entry.description,
      entry.entry_no
    ]);
    doc.setFontSize(12);
    doc.text("Staff Advance Data Table", 40, 30);
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
      }
    });
    doc.save("StaffAdvanceData.pdf");
  };

  const exportCSV = () => {
    const csvHeaders = [
      "S.No",
      "Timestamp",
      "Date",
      "Employee Name",
      "Purpose",
      "Transfer To",
      "Advance",
      "Refund",
      "Type",
      "Mode",
      "Description",
      "Attached file",
      "E.No"
    ];
    const csvRows = sortedData.map((entry, index) => [
      index + 1,
      entry.timestamp ? formatDate(entry.timestamp) : "",
      entry.date ? formatDateOnly(entry.date) : "",
      getEmployeeName(entry.employee_id) || getLabourName(entry.labour_id) || "",
      getPurposeName(entry.from_purpose_id) || "",
      getPurposeName(entry.to_purpose_id) || "",
      entry.amount != null && entry.amount !== ""
        ? Number(entry.amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.staff_refund_amount != null && entry.staff_refund_amount !== ""
        ? Number(entry.staff_refund_amount).toLocaleString("en-US", { maximumFractionDigits: 0 })
        : "",
      entry.type || "",
      entry.staff_payment_mode || "",
      entry.description || "",
      "",
      entry.entry_no || ""
    ]);

    const csvString = [
      csvHeaders.join(","),
      ...csvRows.map(row =>
        row
          .map(value => {
            // Convert null/undefined to empty string, then handle quotes
            const stringValue = value == null ? "" : String(value);
            return `"${stringValue.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
    ].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "StaffAdvanceData.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditClick = (entry) => {
    setEditingId(entry.staffAdvancePortalId || entry.id);
    setEditFormData({
      date: entry.date?.split('T')[0] || '',
      amount: entry.amount || '',
      employee_id: entry.employee_id || '',
      labour_id: entry.labour_id || '',
      from_purpose_id: entry.from_purpose_id || '',
      to_purpose_id: entry.to_purpose_id || '',
      entryNo: entry.entry_no || '',
      description: entry.description || '',
      type: entry.type || '',
      staff_payment_mode: entry.staff_payment_mode || '',
      staff_refund_amount: entry.staff_refund_amount || ''
    });
    setIsEditModalOpen(true);
  };

  const fetchAuditDetails = async (staffAdvancePortalId) => {
    try {
      const response = await fetch(`https://backendaab.in/aabuildersDash/api/staff-advance/audit/history/${staffAdvancePortalId}`);
      const data = await response.json();
      setStaffAdvanceAudits(data);
      setShowHistoryModal(true);
    } catch (error) {
      console.error("Error fetching audit details:", error);
    }
  };

  const performStaffAdvanceUpdate = useCallback(
    async (payload, modalPaymentData = null) => {
      const currentEntry = records.find(
        (r) => String(r.staffAdvancePortalId || r.id) === String(editingId)
      );
      const url = `https://backendaab.in/aabuildersDash/api/staff-advance/${editingId}?editedBy=${username}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Update failed: ${response.statusText}`);
      }
      await response.json();

      try {
        await syncWeeklyPaymentBillsForStaffAdvancePortal(editingId, payload, {
          editedBy: username,
          branchId: currentEntry?.branch_id ?? currentEntry?.branchId ?? null,
          modalPaymentData,
        });
      } catch (weeklyErr) {
        console.error('Weekly payment bill sync failed after staff advance edit:', weeklyErr);
      }

      setIsEditModalOpen(false);
      setShowEditPaymentModal(false);
      pendingStaffUpdateRef.current = null;
      await refreshStaffRecords();
      notifyOrbitModuleDataChanged('staffadvance');
    },
    [editingId, records, refreshStaffRecords, username]
  );

  const handleUpdate = useCallback(async () => {
    try {
      const payload = buildStaffEditPayloadFromForm({ editFormData });
      if (shouldPromptStaffEditPaymentModal(payload)) {
        pendingStaffUpdateRef.current = { payload };
        const modalData = await fetchStaffEditPaymentModalData(editingId, accountDetails);
        setEditPaymentModalData(modalData);
        setShowEditPaymentModal(true);
        return;
      }
      await performStaffAdvanceUpdate(payload);
    } catch (error) {
      console.error('Update error:', error);
      alert(error.message || 'Failed to update record. Please try again.');
    }
  }, [accountDetails, editFormData, editingId, performStaffAdvanceUpdate]);

  const handleEditPaymentModalSubmit = async () => {
    if (!editPaymentModalData.accountNumber) {
      alert('Please select account number.');
      return;
    }
    const pendingPaymentMode =
      pendingStaffUpdateRef.current?.payload?.staff_payment_mode ??
      editFormData.staff_payment_mode;
    if (
      isStaffAdvanceChequePaymentMode(pendingPaymentMode) &&
      (!editPaymentModalData.chequeNo || !editPaymentModalData.chequeDate)
    ) {
      alert('Please enter cheque number and date.');
      return;
    }
    const pending = pendingStaffUpdateRef.current;
    if (!pending?.payload || !editingId) return;

    setIsEditPaymentSubmitting(true);
    try {
      await performStaffAdvanceUpdate(pending.payload, editPaymentModalData);
    } catch (error) {
      console.error('Update error:', error);
      alert(error.message || 'Failed to update record. Please try again.');
    } finally {
      setIsEditPaymentSubmitting(false);
    }
  };

  const handleDelete = async (idToDelete) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this record?");
    if (!confirmDelete) return;

    try {
      const record = records.find(r => r.staffAdvancePortalId === idToDelete || r.id === idToDelete);
      if (!record) {
        console.warn('Record not found for ID:', idToDelete);
        return;
      }

      const { weeklyBillDelete } = await clearStaffAdvanceRecordsOnDelete(
        idToDelete,
        record,
        records,
        username
      );

      await refreshStaffRecords();
      notifyOrbitModuleDataChanged('staffadvance');
      const billDeleteMessage = formatWeeklyBillDeleteMessage(
        weeklyBillDelete.deletedCount,
        weeklyBillDelete.failedCount
      );
      alert(`Record deleted successfully.${billDeleteMessage}`);
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.message || 'Failed to delete record. Please try again.');
    }
  };

  const fieldConfig = useMemo(() => {
    switch (editFormData.type) {
      case 'Refund':
        return {
          purposeLabel: 'Purpose',
          amountGivenLabel: 'Refund Amount',
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
  }, [editFormData.type]);

  useEffect(() => {
    return () => cancelMomentum();
  }, []);

  // Keep rendering the page while loading; data will populate once fetched.
  return (
    <div className='flex flex-col h-[calc(100vh-104px)] overflow-hidden bg-[#FAF6ED]'>
      <div className='px-[18px] pt-[18px] pb-[18px] flex flex-col flex-1 min-h-0 overflow-hidden bg-[#FAF6ED]'>
      <div className='w-full pt-[18px] px-[18px] pb-[18px] rounded-[6px] bg-white mb-[18px] text-left flex items-center gap-6'>
        <div className='w-full xl:w-auto xl:justify-between'>
          <div className='flex flex-wrap gap-[12px]'>
            <div>
              <label className='block mb-[8px] font-semibold text-sm sm:text-base'>Advance Amount</label>
              <AdvancePortalAmountOutput value={advanceTotal} />
            </div>
            <div>
              <label className='block mb-[8px] font-semibold text-sm sm:text-base'>Transfer Amount</label>
              <AdvancePortalAmountOutput value={transferTotal} />
            </div>
            <div>
              <label className='block mb-[8px] font-semibold text-sm sm:text-base'>Refund Amount</label>
              <AdvancePortalAmountOutput value={refundTotal} />
            </div>
          </div>
        </div>
      </div>
      {error && (
        <div className="mb-[18px] p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg w-full">
          <p className="font-semibold">Warning:</p>
          <p>{error}</p>
        </div>
      )}
      <div className="w-full pt-[18px] px-[18px] bg-white rounded-[6px] flex flex-col flex-1 min-h-0 overflow-hidden">
        <div
          className={`text-left flex ${hasActiveColumnFilters
            ? 'flex-col sm:flex-row sm:justify-between'
            : 'flex-row justify-between items-center'
            } mb-[12px] gap-[6px]`}>
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
                {timestampStartDate && (
                  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 text-[16px] w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-semibold shrink-0 whitespace-nowrap">Timestamp: </span>
                    <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{timestampEndDate ? (timestampStartDate === timestampEndDate ? formatEdbcFilterDateDMY(timestampStartDate) : `${formatEdbcFilterDateDMY(timestampStartDate)} – ${formatEdbcFilterDateDMY(timestampEndDate)}`) : `${formatEdbcFilterDateDMY(timestampStartDate)} onwards`}</span>
                    <button type="button" onClick={() => { setTimestampStartDate(''); setTimestampEndDate(''); }} className="text-[#E4572E] ml-1 text-2xl">×</button>
                  </span>
                )}
                {timestampEndDate && !timestampStartDate && (
                  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-semibold shrink-0 whitespace-nowrap">Timestamp until: </span>
                    <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{formatEdbcFilterDateDMY(timestampEndDate)}</span>
                    <button type="button" onClick={() => setTimestampEndDate('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                  </span>
                )}
                {selectDate && selectDateEnd ? (
                  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 text-[16px] w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-semibold shrink-0 whitespace-nowrap">Date: </span>
                    <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">
                      {selectDate === selectDateEnd
                        ? formatEdbcFilterDateDMY(selectDate)
                        : `${formatEdbcFilterDateDMY(selectDate)} – ${formatEdbcFilterDateDMY(selectDateEnd)}`}
                    </span>
                    <button type="button" onClick={() => { setSelectDate(''); setSelectDateEnd(''); }} className="text-[#E4572E] ml-1 text-2xl">×</button>
                  </span>
                ) : selectDate ? (
                  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-semibold shrink-0 whitespace-nowrap">Date: </span>
                    <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{formatEdbcFilterDateDMY(selectDate)} onwards</span>
                    <button type="button" onClick={() => setSelectDate('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                  </span>
                ) : selectDateEnd ? (
                  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-semibold shrink-0 whitespace-nowrap">Date until: </span>
                    <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{formatEdbcFilterDateDMY(selectDateEnd)}</span>
                    <button type="button" onClick={() => setSelectDateEnd('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                  </span>
                ) : null}
                {selectEmployeeName && (
                  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-semibold shrink-0 whitespace-nowrap">Employee: </span>
                    <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectEmployeeName === STAFF_TABLEVIEW_BLANK_VALUE ? STAFF_TABLEVIEW_BLANK_LABEL : selectEmployeeName}</span>
                    <button type="button" onClick={() => setSelectEmployeeName('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectPurpose && (
                  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-semibold shrink-0 whitespace-nowrap">Purpose: </span>
                    <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectPurpose === STAFF_TABLEVIEW_BLANK_VALUE ? STAFF_TABLEVIEW_BLANK_LABEL : selectPurpose}</span>
                    <button type="button" onClick={() => setSelectPurpose('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectTransferTo && (
                  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-semibold shrink-0 whitespace-nowrap">Transfer To: </span>
                    <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectTransferTo === STAFF_TABLEVIEW_BLANK_VALUE ? STAFF_TABLEVIEW_BLANK_LABEL : selectTransferTo}</span>
                    <button type="button" onClick={() => setSelectTransferTo('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectAmount.trim() && (
                  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-semibold shrink-0 whitespace-nowrap">Advance: </span>
                    <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectAmount}</span>
                    <button type="button" onClick={() => setSelectAmount('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectRefundAmount.trim() && (
                  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-semibold shrink-0 whitespace-nowrap">Refund: </span>
                    <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectRefundAmount}</span>
                    <button type="button" onClick={() => setSelectRefundAmount('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectDescription.trim() && (
                  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-semibold shrink-0 whitespace-nowrap">Description: </span>
                    <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectDescription}</span>
                    <button type="button" onClick={() => setSelectDescription('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                {selectType && (
                  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-semibold shrink-0 whitespace-nowrap">Type: </span>
                    <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectType === STAFF_TABLEVIEW_BLANK_VALUE ? STAFF_TABLEVIEW_BLANK_LABEL : selectType}</span>
                    <button type="button" onClick={() => setSelectType('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                  </span>
                )}
                <EdbcPaymentModeFilterChip
                  fieldLabel="Mode"
                  selectedModes={selectedPaymentModes}
                  blankValue={STAFF_TABLEVIEW_BLANK_VALUE}
                  blankLabel={STAFF_TABLEVIEW_BLANK_LABEL}
                  onClear={() => setSelectedPaymentModes([])}
                />
                {selectEntryNo && (
                  <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                    <span className="font-semibold shrink-0 whitespace-nowrap">Entry No: </span>
                    <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{String(selectEntryNo) === STAFF_TABLEVIEW_BLANK_VALUE ? STAFF_TABLEVIEW_BLANK_LABEL : selectEntryNo}</span>
                    <button type="button" onClick={() => setSelectEntryNo('')} className="text-[#E4572E] text-2xl ml-1">×</button>
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
            className="w-full rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] flex-1 min-h-0 overflow-auto select-none scrollbar-none no-scrollbar"
            onWheel={() => { filterNudgeUsedRef.current = false; }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <table className={`table-fixed min-w-[1920px] w-full border-collapse ${EDBC_TABLE_EDGE_TABLE_CLASS}`}>
              <thead className="sticky top-0 z-20 bg-white ">
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
                    label="Employee Name"
                    sortField={resolveEdbcSortField('employee')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC14}
                    label="Purpose"
                    sortField={resolveEdbcSortField('purpose')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC3}
                    label="Transfer To"
                    sortField={resolveEdbcSortField('transfer')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader
                    columnId={EDBC_IDS.EDBC8}
                    label="Advance"
                    sortField={resolveEdbcSortField('amount')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <th
                    id={EDBC_IDS.EDBC8}
                    className={edbc8Config?.headerClass}
                    onClick={() => handleSort('refund')}
                  >
                    Refund
                    {sortConfig.key === 'refund' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ''}
                  </th>
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
                    columnId={EDBC_IDS.EDBC17}
                    label="Entry No"
                    sortField={resolveEdbcSortField('entry_no')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader columnId={EDBC_IDS.EDBC19} label="Activity" />
                  <EdbcColumnHeader columnId={EDBC_IDS.EDBC20} label="File" />
                </EdbcTableHeaderRow>
                {showFilters && (
                  <EdbcTableFilterRow ref={filterRowRef}>
                    <EdbcTimestampFilter
                      placeholder="Timestamp"
                      timestampStartDate={timestampStartDate}
                      timestampEndDate={timestampEndDate}
                      isOpen={showDateRangePicker}
                      onOpen={() => setShowDateRangePicker(true)}
                      onClose={() => setShowDateRangePicker(false)}
                      onApply={(from, to) => {
                        setTimestampStartDate(from || '');
                        setTimestampEndDate(to || '');
                      }}
                    />
                    <EdbcTimestampFilter
                      columnId={EDBC_IDS.EDBC2}
                      placeholder="Date"
                      timestampStartDate={selectDate}
                      timestampEndDate={selectDateEnd}
                      isOpen={showExpenseDateRangePicker}
                      onOpen={() => setShowExpenseDateRangePicker(true)}
                      onClose={() => setShowExpenseDateRangePicker(false)}
                      onApply={(from, to) => {
                        setSelectDate(from || '');
                        setSelectDateEnd(to || '');
                      }}
                    />
                    <EdbcSelectFilter
                      columnId={EDBC_IDS.EDBC4}
                      placeholder="Employee Name"
                      options={employeeNameOptions}
                      value={selectEmployeeName}
                      onChange={setSelectEmployeeName}
                      blankOption={staffTableviewBlankOption}
                      blankValue={STAFF_TABLEVIEW_BLANK_VALUE}
                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                    />
                    <EdbcSelectFilter
                      columnId={EDBC_IDS.EDBC14}
                      placeholder="Purpose"
                      options={purposeOptions}
                      value={selectPurpose}
                      onChange={setSelectPurpose}
                      blankOption={staffTableviewBlankOption}
                      blankValue={STAFF_TABLEVIEW_BLANK_VALUE}
                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                    />
                    <EdbcProjectNameFilter
                      placeholder="Transfer To"
                      options={transferToOptions}
                      value={selectTransferTo}
                      onChange={setSelectTransferTo}
                      blankOption={staffTableviewBlankOption}
                      blankValue={STAFF_TABLEVIEW_BLANK_VALUE}
                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                    />
                    <EdbcTotalAmountFilter columnId={EDBC_IDS.EDBC8} totalAmount={filterColumnTotals.amount} value={selectAmount} onChange={(e) => setSelectAmount(e.target.value)} />
                    <EdbcTotalAmountFilter columnId={EDBC_IDS.EDBC8} totalAmount={filterColumnTotals.refund} value={selectRefundAmount} onChange={(e) => setSelectRefundAmount(e.target.value)} />
                    <EdbcTextInputFilter
                      columnId={EDBC_IDS.EDBC9}
                      placeholder="Description"
                      value={selectDescription}
                      onChange={(e) => setSelectDescription(e.target.value)}
                    />
                    <EdbcSelectFilter
                      columnId={EDBC_IDS.EDBC12}
                      placeholder="Type"
                      options={typeOptions.map((type) =>
                        type === STAFF_TABLEVIEW_BLANK_VALUE ? staffTableviewBlankOption : { value: type, label: type }
                      )}
                      value={selectType}
                      onChange={setSelectType}
                      blankOption={staffTableviewBlankOption}
                      blankValue={STAFF_TABLEVIEW_BLANK_VALUE}
                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                    />
                    <EdbcPaymentModeFilter
                      columnId={EDBC_IDS.EDBC13}
                      placeholder="Mode"
                      options={modeFilterOptions}
                      value={selectedPaymentModes}
                      onChange={setSelectedPaymentModes}
                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                    />
                    <EdbcSelectFilter
                      columnId={EDBC_IDS.EDBC17}
                      placeholder="Entry No"
                      options={entryNoOptions.map((n) =>
                        n === STAFF_TABLEVIEW_BLANK_VALUE ? staffTableviewBlankOption : { value: n, label: n }
                      )}
                      value={selectEntryNo}
                      onChange={setSelectEntryNo}
                      blankOption={staffTableviewBlankOption}
                      blankValue={STAFF_TABLEVIEW_BLANK_VALUE}
                      selectStyles={DATABASE_TABLE_FILTER_SELECT_STYLES}
                      textAlign="right"
                    />
                    <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC19} />
                    <EdbcEmptyFilterCell columnId={EDBC_IDS.EDBC20} />
                  </EdbcTableFilterRow>
                )}
              </thead>
              <tbody>
                {isInitialLoading ? (
                  <tr>
                    <td className="p-8 text-center" colSpan={13}>
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#BF9853] mx-auto mb-3"></div>
                      <p className="text-gray-600 text-sm">Loading data...</p>
                    </td>
                  </tr>
                ) : currentData.length > 0 ? (
                  currentData.map((entry, index) => (
                    <EdbcTableBodyRow key={entry.id}>
                      <EdbcTimestampBodyCell
                        expense={entry}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        formatValue={formatDate}
                      />
                      <EdbcDateBodyCell
                        expense={entry}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        formatValue={formatDateOnly}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC4}
                        expense={entry}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={(row) =>
                          getEmployeeName(row.employee_id) || getLabourName(row.labour_id)
                        }
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC14}
                        expense={entry}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={(row) => getPurposeName(row.from_purpose_id)}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC3}
                        expense={entry}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={(row) => getPurposeName(row.to_purpose_id)}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC8}
                        expense={entry}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        textAlignClass="text-right"
                        getDisplayValue={(row) => formatStaffDatabaseAmount(row.amount)}
                      />
                      <td className={edbc8Config?.tdClass}>
                        <span
                          onClick={() => toggleExpandedCell(`${entry.id ?? index}-refund_amount`)}
                          className={`block w-full cursor-pointer text-right ${expandedCells[`${entry.id ?? index}-refund_amount`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                          title={formatStaffDatabaseAmount(entry.staff_refund_amount)}
                        >
                          {formatStaffDatabaseAmount(entry.staff_refund_amount)}
                        </span>
                      </td>
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC9}
                        expense={entry}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={(row) => row.description || ''}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC12}
                        expense={entry}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={(row) => row.type}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC13}
                        expense={entry}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={(row) => row.staff_payment_mode}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC17}
                        expense={entry}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        textAlignClass="text-right"
                        getDisplayValue={(row) => row.entry_no}
                      />
                      <td id={EDBC_IDS.EDBC19} className={edbc19Config?.tdClass}>
                        <button
                          type="button"
                          onClick={entry.not_allow_to_edit ? undefined : () => handleEditClick(entry)}
                          disabled={entry.not_allow_to_edit}
                          className={`rounded-full transition duration-200 ${entry.not_allow_to_edit ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <img
                            src={edit}
                            alt="Edit"
                            className={`w-4 h-6 transition duration-200 ${entry.not_allow_to_edit ? '' : 'transform hover:scale-110 hover:brightness-110'}`}
                          />
                        </button>
                        <button type="button" className="" disabled={entry.not_allow_to_edit}>
                          <img
                            src={remove}
                            alt="delete"
                            onClick={entry.not_allow_to_edit ? undefined : () => handleDelete(entry.staffAdvancePortalId || entry.id)}
                            className={`w-4 h-4 transition duration-200 ${entry.not_allow_to_edit ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-110 hover:brightness-110'}`}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={entry.not_allow_to_edit ? undefined : () => fetchAuditDetails(entry.staffAdvancePortalId || entry.id)}
                          disabled={entry.not_allow_to_edit}
                          className={`rounded-full transition duration-200 ${entry.not_allow_to_edit ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <img
                            src={history}
                            alt="history"
                            className={`w-4 h-5 transition duration-200 ${entry.not_allow_to_edit ? '' : 'transform hover:scale-110 hover:brightness-110'}`}
                          />
                        </button>
                      </td>
                      <EdbcFileBodyCell columnId={EDBC_IDS.EDBC20} expense={{ ...entry, billCopy: entry.file_url }} />
                    </EdbcTableBodyRow>
                  ))
                ) : (
                  <tr>
                    <td className="p-2 text-center text-sm text-gray-400" colSpan={13}>
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Pagination Controls */}
        {sortedData.length > 0 && (
          <div className="flex shrink-0 items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
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
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} entries
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#BF9853] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
              >
                Previous
              </button>
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
                  <button
                    type="button"
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#BF9853] ${currentPage === pageNum
                      ? 'bg-[#BF9853] text-white border-[#BF9853]'
                      : 'border-gray-300 hover:bg-[#BF9853] hover:text-white'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#BF9853] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-[700px] max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-bold mb-4">Edit Entry</h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left ml-0 sm:ml-5'>
                {/* Select Type */}
                <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3'>
                  <label className='font-semibold text-[#E4572E] text-sm sm:text-base'>Select Type</label>
                  <select
                    value={editFormData.type}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                    className='w-full sm:w-[163px] h-[40px] sm:h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                  >
                    <option value=''>Select Type...</option>
                    <option value='Advance'>Advance</option>
                    <option value='Transfer'>Transfer</option>
                    <option value='Refund'>Refund</option>
                  </select>
                </div>
                {/* Date */}
                <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3'>
                  <label className='font-semibold text-[#E4572E] text-sm sm:text-base'>Date</label>
                  <input
                    type='date'
                    placeholder='dd-mm-yyyy'
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className='w-full sm:w-[144px] h-[40px] sm:h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                  />
                </div>
                {/* Employee */}
                <div className='sm:col-span-1'>
                  <div className='flex'>
                    <label className='font-semibold block text-sm sm:text-base'>Employee</label>
                  </div>
                  <Select
                    options={staffAdvanceCombinedOptions}
                    value={
                      staffAdvanceCombinedOptions.find(
                        opt =>
                          (opt.type === "Employee" && opt.id === editFormData.employee_id) ||
                          (opt.type === "Labour" && opt.id === editFormData.labour_id)
                      ) || null
                    }
                    onChange={(selected) => {
                      if (!selected) {
                        setEditFormData({ ...editFormData, employee_id: '', labour_id: '' });
                        return;
                      }

                      if (selected.type === "Employee") {
                        setEditFormData({ ...editFormData, employee_id: selected.id, labour_id: null });
                      } else {
                        setEditFormData({ ...editFormData, labour_id: selected.id, employee_id: null });
                      }
                    }}
                    className='w-full sm:w-[263px] h-[40px] sm:h-[45px] rounded-lg focus:outline-none'
                    isClearable
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderWidth: '2px',
                        borderRadius: '8px',
                        borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'rgba(191, 152, 83, 0.2)',
                        boxShadow: state.isFocused ? '0 0 0 1px rgba(101, 102, 53, 0.1)' : 'none',
                        '&:hover': {
                          borderColor: 'rgba(191, 152, 83, 0.2)',
                        },
                        minHeight: '40px',
                        fontSize: '14px',
                      }),
                      placeholder: (provided) => ({
                        ...provided,
                        fontSize: '14px',
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        fontSize: '14px',
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isSelected ? 'transparent' : state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'transparent',
                        color: 'black',
                        '&:hover': {
                          backgroundColor: 'rgba(191, 152, 83, 0.1)',
                        },
                      }),
                    }}
                  />
                </div>
                {/* Purpose */}
                <div className='sm:col-span-1'>
                  <label className='font-semibold block text-sm sm:text-base'>{fieldConfig.purposeLabel}</label>
                  <Select
                    options={purposes}
                    value={purposes.find(purp => purp.id === editFormData.from_purpose_id) || null}
                    onChange={(selected) => setEditFormData({ ...editFormData, from_purpose_id: selected?.id || '' })}
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderWidth: '2px',
                        borderRadius: '8px',
                        borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'rgba(191, 152, 83, 0.2)',
                        boxShadow: state.isFocused ? '0 0 0 1px rgba(101, 102, 53, 0.1)' : 'none',
                        '&:hover': {
                          borderColor: 'rgba(191, 152, 83, 0.2)',
                        },
                        minHeight: '40px',
                        fontSize: '14px',
                      }),
                      placeholder: (provided) => ({
                        ...provided,
                        fontSize: '14px',
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        fontSize: '14px',
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isSelected ? 'transparent' : state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'transparent',
                        color: 'black',
                        '&:hover': {
                          backgroundColor: 'rgba(191, 152, 83, 0.1)',
                        },
                      }),
                    }}
                    isClearable
                    className='w-full sm:w-[263px] h-[40px] sm:h-[45px] focus:outline-none' />
                </div>
                {/* Amount */}
                <div className='sm:col-span-1'>
                  <label className='font-semibold block text-sm sm:text-base'>{fieldConfig.amountGivenLabel}</label>
                  {editFormData.type === 'Transfer' ? (
                    <Select
                      options={purposes}
                      value={purposes.find(purp => purp.id === editFormData.to_purpose_id) || null}
                      onChange={(selected) => setEditFormData({ ...editFormData, to_purpose_id: selected?.id || '' })}
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          borderWidth: '2px',
                          borderRadius: '8px',
                          borderColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'rgba(191, 152, 83, 0.2)',
                          boxShadow: state.isFocused ? '0 0 0 1px rgba(101, 102, 53, 0.1)' : 'none',
                          '&:hover': {
                            borderColor: 'rgba(191, 152, 83, 0.2)',
                          },
                          minHeight: '40px',
                          fontSize: '14px',
                        }),
                        placeholder: (provided) => ({
                          ...provided,
                          fontSize: '14px',
                        }),
                        singleValue: (provided) => ({
                          ...provided,
                          fontSize: '14px',
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isSelected ? 'transparent' : state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'transparent',
                          color: 'black',
                          '&:hover': {
                            backgroundColor: 'rgba(191, 152, 83, 0.1)',
                          },
                        }),
                      }}
                      isClearable
                      className='w-full sm:w-[263px] h-[40px] sm:h-[45px] focus:outline-none'
                      placeholder="Select purpose to..."
                    />
                  ) : (
                    <input
                      value={editFormData.type === 'Refund' ? formatWithCommas(editFormData.staff_refund_amount) : formatWithCommas(editFormData.amount)}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/,/g, "");
                        if (!isNaN(rawValue)) {
                          if (editFormData.type === "Refund") {
                            setEditFormData({ ...editFormData, staff_refund_amount: rawValue, amount: '' });
                          } else {
                            setEditFormData({ ...editFormData, amount: rawValue, staff_refund_amount: '' });
                          }
                        }
                      }}
                      className='w-full sm:w-[263px] h-[40px] sm:h-[45px] no-spinner border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                    />
                  )}
                </div>
                {/* Payment Mode */}
                <div className='sm:col-span-1'>
                  <label className='font-semibold block text-sm sm:text-base'>{fieldConfig.paymentModeLabel}</label>
                  {editFormData.type === 'Transfer' ? (
                    <input
                      value={formatWithCommas(editFormData.amount)}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/,/g, "");
                        if (!isNaN(rawValue)) {
                          setEditFormData({ ...editFormData, amount: rawValue });
                        }
                      }}
                      className='w-full sm:w-[263px] h-[40px] sm:h-[45px] no-spinner border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'
                      placeholder="Enter transfer amount"
                    />
                  ) : (
                    <select
                      value={editFormData.staff_payment_mode}
                      onChange={(e) => setEditFormData({ ...editFormData, staff_payment_mode: e.target.value })}
                      className='w-full sm:w-[263px] h-[40px] sm:h-[45px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'>
                      <option value=''>Select</option>
                      {paymentModeOptions && paymentModeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                {/* Description */}
                <div className='col-span-1 sm:col-span-2'>
                  <label className='font-semibold block text-sm sm:text-base'>Description</label>
                  <textarea
                    rows={2}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className='w-full sm:w-[590px] border-2 border-[#BF9853] border-opacity-30 px-2 py-1 rounded-lg focus:outline-none text-sm'>
                  </textarea>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-[#BF9853] w-full sm:w-[100px] h-[40px] sm:h-[45px] rounded text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-[#BF9853] w-full sm:w-[100px] h-[40px] sm:h-[45px] text-white rounded text-sm sm:text-base"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        <StaffAdvanceAuditModal 
          show={showHistoryModal} 
          onClose={() => setShowHistoryModal(false)} 
          audits={staffAdvanceAudits} 
          employees={employees}
          laboursList={laboursList}
          purposes={purposes} 
        />
        <AdvancePortalEditPaymentModal
          isOpen={showEditPaymentModal}
          onClose={() => {
            setShowEditPaymentModal(false);
            pendingStaffUpdateRef.current = null;
          }}
          onSubmit={handleEditPaymentModalSubmit}
          isSubmitting={isEditPaymentSubmitting}
          paymentMode={
            pendingStaffUpdateRef.current?.payload?.staff_payment_mode ??
            editFormData.staff_payment_mode
          }
          date={pendingStaffUpdateRef.current?.payload?.date ?? editFormData.date}
          amount={getStaffAdvanceDisplayAmount(
            pendingStaffUpdateRef.current?.payload || {
              type: editFormData.type,
              amount: editFormData.amount,
              staff_refund_amount: editFormData.staff_refund_amount,
              staff_payment_mode: editFormData.staff_payment_mode,
            }
          )}
          paymentModalData={editPaymentModalData}
          setPaymentModalData={setEditPaymentModalData}
          accountDetails={accountDetails}
        />
      </div>
      </div>
    </div>
  );
}

export default StaffDatabase
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

const StaffAdvanceAuditModal = ({ show, onClose, audits, employees, laboursList, purposes }) => {
  if (!show) return null;
  
  const getNameById = (id, options) => {
    if (!id && id !== 0) return "-";
    const found = options.find(opt => String(opt.id) === String(id));
    return found ? found.label : id;
  };

  const getEmployeeName = (id) => employees.find(e => e.id === id)?.label || id;
  const getLabourName = (id) => laboursList.find(l => l.id === id)?.label || id;
  const getPurposeName = (id) => purposes.find(p => p.id === id)?.label || id;

  const fields = [
    { oldKey: "old_date", newKey: "new_date", label: "Date", width: "120px" },
    { oldKey: "old_type", newKey: "new_type", label: "Type", width: "100px" },
    { oldKey: "old_employee_id", newKey: "new_employee_id", label: "Employee", width: "150px" },
    { oldKey: "old_labour_id", newKey: "new_labour_id", label: "Labour", width: "150px" },
    { oldKey: "old_from_purpose_id", newKey: "new_from_purpose_id", label: "Purpose", width: "150px" },
    { oldKey: "old_to_purpose_id", newKey: "new_to_purpose_id", label: "Transfer To", width: "150px" },
    { oldKey: "old_staff_payment_mode", newKey: "new_staff_payment_mode", label: "Mode", width: "100px" },
    { oldKey: "old_description", newKey: "new_description", label: "Description", width: "200px" },
    { oldKey: "old_amount", newKey: "new_amount", label: "Amount", width: "100px" },
    { oldKey: "old_staff_refund_amount", newKey: "new_staff_refund_amount", label: "Refund", width: "100px" },
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
    if (field.oldKey?.includes("employee_id") || field.newKey?.includes("employee_id")) {
      return value ? getEmployeeName(value) : "-";
    }
    if (field.oldKey?.includes("labour_id") || field.newKey?.includes("labour_id")) {
      return value ? getLabourName(value) : "-";
    }
    if (field.oldKey?.includes("purpose_id") || field.newKey?.includes("purpose_id")) {
      return value ? getPurposeName(value) : "-";
    }
    if (field.label.includes("Amount") || field.label.includes("Refund")) {
      return value ? Number(value).toLocaleString("en-IN") : "-";
    }
    if (field.label === "Date") {
      return value ? new Date(value).toLocaleDateString("en-GB") : "-";
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
        {/* Scroll container for both vertical and horizontal overflow */}
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
              {audits.map((audit, index) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};