export const PAYMENT_MODE_OPTIONS = [
  { value: 'Cash', label: 'Cash' },
  { value: 'GPay', label: 'GPay' },
  { value: 'PhonePe', label: 'PhonePe' },
  { value: 'Net Banking', label: 'Net Banking' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'Direct', label: 'Direct' }
];

export const TYPE_OPTIONS = [
  { value: 'Advance', label: 'Advance' },
  { value: 'Refund', label: 'Refund' },
  { value: 'Transfer', label: 'Transfer' }
];

export const DIGITAL_PAYMENT_MODES = ['GPay', 'PhonePe', 'Net Banking', 'Cheque'];

const sortByLabel = (items) =>
  [...items].sort((left, right) => (left.label || '').localeCompare(right.label || ''));

export const createMobileSelectStyles = ({ compact = false } = {}) => {
  const height = compact ? 28 : 32;

  return {
    control: (provided, state) => ({
      ...provided,
      minHeight: `${height}px`,
      height: `${height}px`,
      borderRadius: '6px',
      borderColor: state.isFocused ? '#BF9853' : '#D9D9D9',
      boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.12)' : 'none',
      fontSize: '12px',
      '&:hover': {
        borderColor: '#BF9853'
      }
    }),
    valueContainer: (provided) => ({
      ...provided,
      minHeight: `${height}px`,
      padding: compact ? '0 8px' : '0 10px'
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: `${height}px`
    }),
    input: (provided) => ({
      ...provided,
      margin: 0,
      padding: 0,
      fontSize: '12px'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#A6A6A6',
      fontSize: '12px'
    }),
    singleValue: (provided) => ({
      ...provided,
      fontSize: '12px',
      color: '#171717'
    }),
    indicatorSeparator: () => ({
      display: 'none'
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      padding: compact ? 4 : 6
    }),
    clearIndicator: (provided) => ({
      ...provided,
      padding: compact ? 4 : 6
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      fontSize: '12px'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.08)' : '#FFFFFF',
      color: '#171717',
      fontSize: '12px',
      '&:active': {
        backgroundColor: 'rgba(191, 152, 83, 0.14)'
      }
    })
  };
};

export const parseNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const todayIso = () => new Date().toISOString().split('T')[0];

export const resolveActiveBranchId = (user) => {
  try {
    const selectedBranchId = localStorage.getItem('selectedBranchId');
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const sourceUser = user || storedUser;
    const fallbackBranchId =
      sourceUser?.branchId ?? sourceUser?.branch_id ?? sourceUser?.brachId;
    const resolved = Number(selectedBranchId || fallbackBranchId);
    return Number.isFinite(resolved) && resolved > 0 ? resolved : null;
  } catch {
    return null;
  }
};

export const withBranchUrl = (baseUrl, activeBranchId) => {
  const url = new URL(baseUrl);
  if (activeBranchId !== null && activeBranchId !== undefined && activeBranchId !== '') {
    url.searchParams.set('branchId', String(activeBranchId));
  }
  return url.toString();
};

export const formatCurrency = (value, digits = 0) =>
  parseNumber(value).toLocaleString('en-IN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });

export const formatCurrencyWithSymbol = (value, digits = 0) => `₹${formatCurrency(value, digits)}`;

export const formatDateDisplay = (dateValue) => {
  if (!dateValue) return '--/--/----';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '--/--/----';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatTimeDisplay = (dateValue) => {
  if (!dateValue) return '--:--';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatRelativeDateTime = (dateValue) => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((startOfToday - startOfTarget) / 86400000);

  let dayLabel = formatDateDisplay(dateValue);
  if (diffDays === 0) dayLabel = 'Today';
  if (diffDays === 1) dayLabel = 'Yesterday';

  return `${dayLabel} | ${formatDateDisplay(dateValue)} | ${formatTimeDisplay(dateValue)}`;
};

export const getWeekNumber = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 0;
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const elapsedDays = Math.floor((date - firstDay) / 86400000);
  return Math.ceil((elapsedDays + firstDay.getDay() + 1) / 7);
};

export const getCurrentWeekRange = () => {
  const today = new Date();
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(today);
  start.setDate(today.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return {
    start,
    end,
    label: `Week ${String(getWeekNumber(today)).padStart(2, '0')}`
  };
};

export const isDateWithinRange = (dateValue, startDate, endDate) => {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return date >= start && date <= end;
};

export const normalizeEmployees = (items = []) =>
  sortByLabel(
    items.map((item) => ({
      value: item.employee_name,
      label: item.employee_name,
      id: item.id,
      type: 'Employee'
    }))
  );

export const normalizeLabours = (items = []) =>
  sortByLabel(
    items.map((item) => ({
      value: item.labour_name,
      label: item.labour_name,
      id: item.id,
      type: 'Labour'
    }))
  );

export const normalizePurposes = (items = []) =>
  sortByLabel(
    items.map((item) => ({
      value: item.purpose,
      label: item.purpose,
      id: item.id
    }))
  );

const getRecordBranchId = (record) => record?.branch_id ?? record?.branchId ?? null;

export const filterRecordsByBranch = (records = [], activeBranchId) => {
  if (!activeBranchId) return records;
  return records.filter((record) => {
    const branchId = getRecordBranchId(record);
    if (branchId === null || branchId === undefined || branchId === '') return true;
    return Number(branchId) === Number(activeBranchId);
  });
};

export const getPersonName = (record, peopleOptions = []) => {
  const employeeId = record?.employee_id ?? record?.employeeId;
  const labourId = record?.labour_id ?? record?.labourId;
  const employeeMatch = employeeId
    ? peopleOptions.find((item) => item.type === 'Employee' && String(item.id) === String(employeeId))
    : null;
  const labourMatch = labourId
    ? peopleOptions.find((item) => item.type === 'Labour' && String(item.id) === String(labourId))
    : null;

  return (
    employeeMatch?.label ||
    labourMatch?.label ||
    record?.employee_name ||
    record?.emp_name ||
    record?.labour_name ||
    'Unknown'
  );
};

export const getPurposeName = (purposeId, purposeOptions = []) => {
  if (purposeId === null || purposeId === undefined || purposeId === '') return 'Unknown';
  const purpose = purposeOptions.find((item) => String(item.id) === String(purposeId));
  return purpose?.label || 'Unknown';
};

export const getEntryNumber = (record) => record?.entryNo ?? record?.entry_no ?? record?.id ?? '-';

export const getRecordSignedAmount = (record) => {
  if (!record) return 0;
  if (record.type === 'Refund') return -parseNumber(record.staff_refund_amount);
  if (record.type === 'Transfer') return parseNumber(record.amount);
  return parseNumber(record.amount);
};

const matchesSelectedPerson = (record, selectedPerson) => {
  if (!selectedPerson) return false;
  if (selectedPerson.type === 'Employee') {
    return (
      String(record.employee_id ?? '') === String(selectedPerson.id) ||
      record.employee_name === selectedPerson.value ||
      record.emp_name === selectedPerson.value
    );
  }

  return (
    String(record.labour_id ?? '') === String(selectedPerson.id) ||
    record.labour_name === selectedPerson.value
  );
};

export const buildEmployeePurposeSummary = (records = [], selectedPerson, purposeOptions = []) => {
  if (!selectedPerson) {
    return {
      items: [],
      overview: {
        grossAdvance: 0,
        totalRefund: 0,
        pendingAmount: 0
      }
    };
  }

  const grouped = {};
  let grossAdvance = 0;
  let totalRefund = 0;

  records.forEach((record) => {
    if (!matchesSelectedPerson(record, selectedPerson)) return;

    const purposeId = record.from_purpose_id ?? record.purpose_id ?? null;
    if (!purposeId) return;

    if (!grouped[purposeId]) {
      grouped[purposeId] = {
        purposeId,
        purposeName: getPurposeName(purposeId, purposeOptions),
        totalAdvance: 0,
        totalRefund: 0
      };
    }

    if (record.type === 'Transfer') {
      grouped[purposeId].totalAdvance += parseNumber(record.amount);
      if (parseNumber(record.amount) > 0) {
        grossAdvance += parseNumber(record.amount);
      }
      return;
    }

    if (record.type === 'Advance') {
      grouped[purposeId].totalAdvance += parseNumber(record.amount);
      grossAdvance += parseNumber(record.amount);
      return;
    }

    if (record.type === 'Refund') {
      grouped[purposeId].totalRefund += parseNumber(record.staff_refund_amount);
      totalRefund += parseNumber(record.staff_refund_amount);
    }
  });

  const items = Object.values(grouped)
    .map((item) => ({
      ...item,
      pendingAdvance: item.totalAdvance - item.totalRefund
    }))
    .sort((left, right) => (right.pendingAdvance || 0) - (left.pendingAdvance || 0));

  const pendingAmount = items.reduce((sum, item) => sum + parseNumber(item.pendingAdvance), 0);

  return {
    items,
    overview: {
      grossAdvance,
      totalRefund,
      pendingAmount
    }
  };
};

export const buildPurposePersonSummary = (records = [], selectedPurpose, peopleOptions = []) => {
  if (!selectedPurpose) {
    return {
      items: [],
      overview: {
        grossAdvance: 0,
        totalRefund: 0,
        pendingAmount: 0
      }
    };
  }

  const grouped = {};
  let grossAdvance = 0;
  let totalRefund = 0;

  records.forEach((record) => {
    const matchesPurpose =
      String(record.from_purpose_id ?? record.purpose_id ?? '') === String(selectedPurpose.id) ||
      record.purpose === selectedPurpose.value;

    if (!matchesPurpose) return;

    const personKey =
      record.employee_id != null
        ? `employee-${record.employee_id}`
        : record.labour_id != null
          ? `labour-${record.labour_id}`
          : null;

    if (!personKey) return;

    if (!grouped[personKey]) {
      grouped[personKey] = {
        personKey,
        personName: getPersonName(record, peopleOptions),
        personId: record.employee_id ?? record.labour_id,
        personType: record.employee_id != null ? 'Employee' : 'Labour',
        totalAdvance: 0,
        totalRefund: 0
      };
    }

    if (record.type === 'Transfer') {
      grouped[personKey].totalAdvance += parseNumber(record.amount);
      if (parseNumber(record.amount) > 0) {
        grossAdvance += parseNumber(record.amount);
      }
      return;
    }

    if (record.type === 'Advance') {
      grouped[personKey].totalAdvance += parseNumber(record.amount);
      grossAdvance += parseNumber(record.amount);
      return;
    }

    if (record.type === 'Refund') {
      grouped[personKey].totalRefund += parseNumber(record.staff_refund_amount);
      totalRefund += parseNumber(record.staff_refund_amount);
    }
  });

  const items = Object.values(grouped)
    .map((item) => ({
      ...item,
      pendingAdvance: item.totalAdvance - item.totalRefund
    }))
    .sort((left, right) => (right.pendingAdvance || 0) - (left.pendingAdvance || 0));

  const pendingAmount = items.reduce((sum, item) => sum + parseNumber(item.pendingAdvance), 0);

  return {
    items,
    overview: {
      grossAdvance,
      totalRefund,
      pendingAmount
    }
  };
};

export const createCsvRows = (records = [], peopleOptions = [], purposeOptions = []) =>
  records.map((record) => [
    getEntryNumber(record),
    formatDateDisplay(record.date),
    getPersonName(record, peopleOptions),
    getPurposeName(record.from_purpose_id ?? record.purpose_id, purposeOptions),
    record.type || '',
    record.staff_payment_mode || '',
    record.type === 'Refund'
      ? parseNumber(record.staff_refund_amount)
      : parseNumber(record.amount),
    record.description || ''
  ]);

export const downloadCsv = (filename, headers, rows) => {
  const escapeCell = (value) => {
    const stringValue = String(value ?? '');
    return `"${stringValue.replace(/"/g, '""')}"`;
  };

  const content = [headers, ...rows]
    .map((row) => row.map(escapeCell).join(','))
    .join('\n');

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const matchesStaffAdvanceDateFilter = (entryDate, selectDate) => {
  if (!selectDate) return true;
  if (!entryDate) return false;
  const [year, month, day] = selectDate.split('-');
  const formattedSelectDate = `${parseInt(day, 10)}-${parseInt(month, 10)}-${year}`;
  const entryDateObj = new Date(entryDate);
  if (Number.isNaN(entryDateObj.getTime())) return false;
  const formattedEntryDate = `${entryDateObj.getDate()}-${entryDateObj.getMonth() + 1}-${entryDateObj.getFullYear()}`;
  return formattedEntryDate === formattedSelectDate;
};

export const isStaffAdvanceRecordLocked = (entry) => Boolean(entry?.not_allow_to_edit);

export const loadStaffAdvanceData = async (activeBranchId, { applyBranchFilter = true } = {}) => {
  const [employeeResult, labourResult, purposeResult, recordResult] = await Promise.allSettled([
    fetch('https://backendaab.in/aabuildersDash/api/employee_details/getAll', {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    }),
    fetch('https://backendaab.in/aabuildersDash/api/labours-details/getAll'),
    fetch('https://backendaab.in/aabuildersDash/api/purposes/getAll'),
    fetch('https://backendaab.in/aabuildersDash/api/staff-advance/all')
  ]);

  const [employees, labours, purposes, records] = await Promise.all([
    employeeResult.status === 'fulfilled' && employeeResult.value.ok
      ? employeeResult.value.json()
      : Promise.resolve([]),
    labourResult.status === 'fulfilled' && labourResult.value.ok
      ? labourResult.value.json()
      : Promise.resolve([]),
    purposeResult.status === 'fulfilled' && purposeResult.value.ok
      ? purposeResult.value.json()
      : Promise.resolve([]),
    recordResult.status === 'fulfilled' && recordResult.value.ok
      ? recordResult.value.json()
      : Promise.resolve([])
  ]);

  const normalizedEmployees = normalizeEmployees(Array.isArray(employees) ? employees : []);
  const normalizedLabours = normalizeLabours(Array.isArray(labours) ? labours : []);
  const normalizedPurposes = normalizePurposes(Array.isArray(purposes) ? purposes : []);
  const allRecords = Array.isArray(records) ? records : [];
  const filteredRecords = applyBranchFilter
    ? filterRecordsByBranch(allRecords, activeBranchId)
    : allRecords;

  return {
    employees: normalizedEmployees,
    labours: normalizedLabours,
    purposes: normalizedPurposes,
    peopleOptions: sortByLabel([...normalizedEmployees, ...normalizedLabours]),
    records: filteredRecords
  };
};
