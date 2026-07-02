import React, { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react';
import { notifyOrbitModuleDataChanged } from '../../utils/orbitProjectDataSync';
import { useOrbitPageSync } from '../../utils/useOrbitPageSync';
import { useTabRefreshSignal } from '../../utils/useTabRefreshSignal';
import {
  buildStaffEditPayloadFromForm,
  shouldPromptStaffEditPaymentModal,
  fetchStaffEditPaymentModalData,
  syncWeeklyPaymentBillsForStaffAdvancePortal,
  getStaffAdvanceDisplayAmount,
  isStaffAdvanceChequePaymentMode,
} from '../../utils/staffAdvanceWeeklyPaymentBill';
import { resolveFilesUploadResponseUrl } from '../../utils/advancePortalWeeklyPaymentBill';
import AdvancePortalEditPaymentModal from '../Advance Portal/AdvancePortalEditPaymentModal';
import UploadFile from '../Images/Upload file.svg';
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
  EdbcDateBodyCell,
  EdbcExpandableBodyCell,
  EdbcFileBodyCell,
  EDBC_TABLE_EDGE_TABLE_CLASS,
  EDBC2_FIRST_COLUMN_WIDTH_CLASS,
  EdbcFilterToggleButton,
  EdbcTableToolbarRightActions,
} from '../ExpensesEntry/databaseExpensesSharedColumns';
import jsPDF from "jspdf";
import "jspdf-autotable";
import Select from 'react-select';
import edit from '../Images/Edit.svg';

const STAFF_TABLEVIEW_BLANK_VALUE = 'BLANK';
const STAFF_TABLEVIEW_BLANK_LABEL = 'Blank';
const staffTableviewBlankOption = { value: STAFF_TABLEVIEW_BLANK_VALUE, label: STAFF_TABLEVIEW_BLANK_LABEL };
const isStaffTableviewBlankish = (value) =>
  value === null ||
  value === undefined ||
  (typeof value === 'string' && value.trim() === '') ||
  value === 0 ||
  value === '0';

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

const ADVANCE_PORTAL_SELECT_CLASS =
  'custom-select rounded-lg w-[300px] h-[40px] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500';
const ADVANCE_PORTAL_INPUT_CLASS =
  'border-2 border-[#BF9853] rounded-lg px-[8px] w-[300px] h-[40px] focus:outline-none border-opacity-[0.20] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500';
const ADVANCE_PORTAL_READONLY_INPUT_CLASS =
  'border-2 border-[#BF9853] rounded-lg px-[8px] w-[300px] h-[40px] focus:outline-none border-opacity-[0.20] bg-[#ededed] text-[14px] font-semibold';
const ADVANCE_PORTAL_LABEL_CLASS = 'text-md font-semibold mb-[8px] block';
const ADVANCE_PORTAL_TEXTAREA_CLASS =
  'border-2 border-[#BF9853] rounded-md px-[8px] w-[616px] h-[60px] focus:outline-none border-opacity-[0.20] resize-none text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500';
const STAFF_EDIT_SELECT_TYPE_OPTIONS = [
  { value: 'Advance', label: 'Advance' },
  { value: 'Refund', label: 'Refund' },
  { value: 'Transfer', label: 'Transfer' },
];
const STAFF_EDIT_MODAL_SELECT_STYLES = {
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
    paddingTop: 0,
    paddingBottom: 0,
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
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  indicatorsContainer: (provided) => ({ ...provided, flex: '0 0 auto', paddingLeft: '0' }),
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
    backgroundColor: state.isSelected ? '#BF9853' : state.isFocused ? '#FAF6ED' : provided.backgroundColor,
    color: state.isSelected ? '#FFFFFF' : provided.color,
    ':active': { backgroundColor: state.isSelected ? '#BF9853' : '#FAF6ED' },
  }),
};

const formatStaffTableAmount = (value) =>
  value != null && value !== ''
    ? `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
    : '';

const calculateStaffEditOverallAdvance = (records, empSelection) => {
  if (!empSelection || !records?.length) return '';
  const employeeRecords = records.filter((record) => {
    if (empSelection.type === 'Employee') return record.employee_id === empSelection.id;
    if (empSelection.type === 'Labour') return record.labour_id === empSelection.id;
    return false;
  });
  const totalAdvance = employeeRecords.reduce((total, record) => {
    if (record.type === 'Advance') return total + (parseFloat(record.amount) || 0);
    if (record.type === 'Refund') return total - (parseFloat(record.staff_refund_amount) || 0);
    return total;
  }, 0);
  return totalAdvance.toFixed(2);
};

const calculateStaffEditAdvanceAmount = (records, empSelection, fromPurposeId) => {
  if (!empSelection || !fromPurposeId || !records?.length) return '';
  const purposeRecords = records.filter((record) => {
    let employeeMatch = false;
    if (empSelection.type === 'Employee') employeeMatch = record.employee_id === empSelection.id;
    else if (empSelection.type === 'Labour') employeeMatch = record.labour_id === empSelection.id;
    if (!employeeMatch) return false;
    return record.from_purpose_id === fromPurposeId;
  });
  const totalAmount = purposeRecords.reduce((total, record) => {
    const amount = parseFloat(record.amount) || 0;
    const refund = parseFloat(record.staff_refund_amount) || 0;
    if (record.type === 'Advance') return total + amount;
    if (record.type === 'Refund') return total - refund;
    if (record.type === 'Transfer') return total + amount;
    return total;
  }, 0);
  return totalAmount.toFixed(2);
};

const EditModal = memo(({
  isOpen,
  editFormData,
  setEditFormData,
  staffAdvanceCombinedOptions,
  purposes,
  paymentModeOptions,
  records,
  selectedFile,
  fileInputRef,
  onFileChange,
  onClose,
  onUpdate,
}) => {
  const empSelection = useMemo(
    () =>
      staffAdvanceCombinedOptions.find(
        (opt) =>
          (opt.type === 'Employee' && opt.id === editFormData.employee_id) ||
          (opt.type === 'Labour' && opt.id === editFormData.labour_id)
      ) || null,
    [staffAdvanceCombinedOptions, editFormData.employee_id, editFormData.labour_id]
  );

  const overallAdvance = useMemo(
    () => calculateStaffEditOverallAdvance(records, empSelection),
    [records, empSelection]
  );

  const advanceAmount = useMemo(
    () => calculateStaffEditAdvanceAmount(records, empSelection, editFormData.from_purpose_id),
    [records, empSelection, editFormData.from_purpose_id]
  );

  const amountGivenValue =
    editFormData.type === 'Refund'
      ? (editFormData.staff_refund_amount ?? '')
      : (editFormData.amount ?? '');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-gray-800 bg-opacity-50 z-[9999]">
      <div className="bg-white text-left p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <div className="flex justify-between items-center mb-[14px]">
          <h2 className="text-[18px] font-semibold text-black">Edit Staff Advance Entry</h2>
          <span className="text-[16px] font-semibold text-[#E4572E]">{editFormData.entryNo}</span>
        </div>
        <div className="max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="text-left max-w-[300px]">
              <label className={ADVANCE_PORTAL_LABEL_CLASS}>Select Type</label>
              <Select
                value={STAFF_EDIT_SELECT_TYPE_OPTIONS.find((option) => option.value === editFormData.type) || null}
                onChange={(selected) =>
                  setEditFormData((prev) => ({ ...prev, type: selected ? selected.value : '' }))
                }
                options={STAFF_EDIT_SELECT_TYPE_OPTIONS}
                placeholder="Select Type..."
                isClearable
                isSearchable
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={STAFF_EDIT_MODAL_SELECT_STYLES}
                className={ADVANCE_PORTAL_SELECT_CLASS}
              />
            </div>
            <div className="text-left">
              <label className={ADVANCE_PORTAL_LABEL_CLASS}>Date</label>
              <input
                type="date"
                value={editFormData.date}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, date: e.target.value }))}
                className={`${ADVANCE_PORTAL_INPUT_CLASS} hover:!border-[rgba(191,152,83,0.2)] focus:!border-[rgba(191,152,83,1)]`}
              />
            </div>
            <div className="text-left">
              <label className={ADVANCE_PORTAL_LABEL_CLASS}>EMP Name</label>
              <Select
                value={empSelection}
                onChange={(selected) => {
                  if (!selected) {
                    setEditFormData((prev) => ({ ...prev, employee_id: '', labour_id: '' }));
                    return;
                  }
                  if (selected.type === 'Employee') {
                    setEditFormData((prev) => ({ ...prev, employee_id: selected.id, labour_id: null }));
                  } else {
                    setEditFormData((prev) => ({ ...prev, labour_id: selected.id, employee_id: null }));
                  }
                }}
                options={staffAdvanceCombinedOptions}
                placeholder="Select employee..."
                isClearable
                isSearchable
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={STAFF_EDIT_MODAL_SELECT_STYLES}
                className={ADVANCE_PORTAL_SELECT_CLASS}
              />
            </div>
            <div className="text-left">
              <label className={ADVANCE_PORTAL_LABEL_CLASS}>Overall Advance</label>
              <input
                value={
                  overallAdvance
                    ? Number(overallAdvance).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : ''
                }
                readOnly
                className={ADVANCE_PORTAL_READONLY_INPUT_CLASS}
                placeholder="0.00"
              />
            </div>
            <div className="text-left">
              <label className={ADVANCE_PORTAL_LABEL_CLASS}>Purpose</label>
              <Select
                value={purposes.find((purp) => purp.id === editFormData.from_purpose_id) || null}
                onChange={(selected) =>
                  setEditFormData((prev) => ({ ...prev, from_purpose_id: selected?.id || '' }))
                }
                options={purposes}
                placeholder="Select a purpose..."
                isSearchable
                isClearable
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={STAFF_EDIT_MODAL_SELECT_STYLES}
                className={ADVANCE_PORTAL_SELECT_CLASS}
              />
            </div>
            <div className="text-left">
              <label className={ADVANCE_PORTAL_LABEL_CLASS}>Advance Amount</label>
              <input
                value={
                  advanceAmount
                    ? Number(advanceAmount).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : ''
                }
                readOnly
                className={ADVANCE_PORTAL_READONLY_INPUT_CLASS}
                placeholder="0.00"
              />
            </div>
            <div className="text-left">
              <label className={ADVANCE_PORTAL_LABEL_CLASS}>
                {editFormData.type === 'Transfer' ? 'Purpose To' : 'Amount Given'}
              </label>
              {editFormData.type === 'Transfer' ? (
                <Select
                  value={purposes.find((purp) => purp.id === editFormData.to_purpose_id) || null}
                  onChange={(selected) =>
                    setEditFormData((prev) => ({ ...prev, to_purpose_id: selected?.id || '' }))
                  }
                  options={purposes}
                  placeholder="Select purpose to..."
                  isClearable
                  isSearchable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={STAFF_EDIT_MODAL_SELECT_STYLES}
                  className={ADVANCE_PORTAL_SELECT_CLASS}
                />
              ) : (
                <input
                  value={amountGivenValue}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    if (editFormData.type === 'Refund') {
                      setEditFormData((prev) => ({ ...prev, staff_refund_amount: rawValue, amount: '' }));
                    } else {
                      setEditFormData((prev) => ({ ...prev, amount: rawValue, staff_refund_amount: '' }));
                    }
                  }}
                  className={`${ADVANCE_PORTAL_INPUT_CLASS} no-spinner hover:!border-[rgba(191,152,83,0.2)] focus:!border-[rgba(191,152,83,1)]`}
                  placeholder="Enter amount given"
                />
              )}
            </div>
            <div className="text-left">
              <label className={ADVANCE_PORTAL_LABEL_CLASS}>
                {editFormData.type === 'Transfer' ? 'Transfer Amount' : 'Payment Mode'}
              </label>
              {editFormData.type === 'Transfer' ? (
                <input
                  value={editFormData.amount ?? ''}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  className={`${ADVANCE_PORTAL_INPUT_CLASS} no-spinner hover:!border-[rgba(191,152,83,0.2)] focus:!border-[rgba(191,152,83,1)]`}
                  placeholder="Enter transfer amount"
                />
              ) : (
                <Select
                  value={
                    paymentModeOptions.find((option) => option.value === editFormData.staff_payment_mode) ||
                    null
                  }
                  onChange={(selected) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      staff_payment_mode: selected ? selected.value : '',
                    }))
                  }
                  options={paymentModeOptions}
                  placeholder="Select"
                  isClearable
                  isSearchable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={STAFF_EDIT_MODAL_SELECT_STYLES}
                  className={ADVANCE_PORTAL_SELECT_CLASS}
                />
              )}
            </div>
          </div>
          <div className="text-left mt-[8px]">
            <div className="flex justify-between w-[616px]">
              <label className={ADVANCE_PORTAL_LABEL_CLASS}>File URL</label>
              {selectedFile && (
                <span className="text-[14px] text-[#E4572E] font-semibold">{selectedFile.name}</span>
              )}
            </div>
            <div className="flex w-[616px] items-center gap-[8px]">
              <input
                type="text"
                name="file_url"
                value={editFormData.file_url || ''}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, file_url: e.target.value }))
                }
                placeholder="File URL"
                className="min-w-0 flex-1 h-[40px] text-[14px] py-0 px-2 box-border border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)] hover:border-opacity-[0.40] font-semibold placeholder:font-normal"
              />
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,image/*,application/pdf"
                onChange={onFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 h-[40px] text-[#BF9853]"
              >
                <img src={UploadFile} alt="Upload" className="w-[40px] h-[40px]" />
              </button>
            </div>
          </div>
          <div className="text-left mt-[8px]">
            <label className={ADVANCE_PORTAL_LABEL_CLASS}>Description</label>
            <textarea
              rows={2}
              value={editFormData.description || ''}
              onChange={(e) =>
                setEditFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Description"
              className={`${ADVANCE_PORTAL_TEXTAREA_CLASS} hover:!border-[rgba(191,152,83,0.2)] focus:!border-[rgba(191,152,83,1)]`}
            />
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-opacity-[] border-[#BF9853] text-[#BF9853] rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onUpdate}
              className="px-4 py-2 bg-[#BF9853] text-white rounded transition duration-200"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

EditModal.displayName = 'EditModal';

const TableView = ({ username, userRoles = [], paymentModeOptions = [], refreshSignal, isActive = true }) => {
  const [vendorOptions, setVendorOptions] = useState([]);
  const [contractorOptions, setContractorOptions] = useState([]);
  const [combinedOptions, setCombinedOptions] = useState([]);
  const [siteOptions, setSiteOptions] = useState([]);
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [laboursList, setLaboursList] = useState([]);
  const [isRequestStaffModalOpen, setIsRequestStaffModalOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectDate, setSelectDate] = useState('');
  const [selectDateEnd, setSelectDateEnd] = useState('');
  const [showTableDateRangePicker, setShowTableDateRangePicker] = useState(false);
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
  const [overallSearch, setOverallSearch] = useState('');
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
  const editFileInputRef = useRef(null);
  const [editSelectedFile, setEditSelectedFile] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const scrollRef = useRef(null);
  const filterRowRef = useRef(null);
  const filterNudgeUsedRef = useRef(false);
  const filterChipsScrollRef = useRef(null);
  const isFilterChipsDragging = useRef(false);
  const filterChipsDragStart = useRef({ x: 0, scrollLeft: 0 });
  const [staffAdvanceCombinedOptions, setStaffAdvanceCombinedOptions] = useState([]);
  const adminUsernames = ['Mahalingam M', 'Admin'];
  const normalizedUsername = (username || '').trim().toLowerCase();
  const isAdminUser = adminUsernames.some(name => name.toLowerCase() === normalizedUsername);
  const isAdmin = isAdminUser;
  const [requestingStaffEntry, setRequestingStaffEntry] = useState(null);
  const isDragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const scroll = useRef({ left: 0, top: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(null);
  const lastMove = useRef({ time: 0, x: 0, y: 0 });
  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const [recRes, empRes, purRes] = await Promise.allSettled([
        fetch('https://backendaab.in/aabuildersDash/api/staff-advance/all'),
        fetch('https://backendaab.in/aabuildersDash/api/employee_details/getAll', {
          credentials: 'include',
        }),
        fetch('https://backendaab.in/aabuildersDash/api/purposes/getAll')
      ]);
      const recData = recRes.status === 'fulfilled' && recRes.value.ok
        ? await recRes.value.json()
        : [];
      const empData = empRes.status === 'fulfilled' && empRes.value.ok
        ? await empRes.value.json()
        : [];
      const purData = purRes.status === 'fulfilled' && purRes.value.ok
        ? await purRes.value.json()
        : [];
      setRecords(Array.isArray(recData) ? recData : []);
      setEmployees(empData.map(e => ({ id: e.id, label: e.employee_name, type: "Employee" })));
      setPurposes(purData.map(p => ({ id: p.id, label: p.purpose })));
      const failedAPIs = [];
      if (recRes.status === 'rejected' || !recRes.value?.ok) failedAPIs.push('Staff Advance');
      if (empRes.status === 'rejected' || !empRes.value?.ok) failedAPIs.push('Employee Details');
      if (purRes.status === 'rejected' || !purRes.value?.ok) failedAPIs.push('Purposes');
      if (failedAPIs.length > 0) {
        setError(`Warning: Some data may not be available (${failedAPIs.join(', ')})`);
      }
    } catch (error) {
      console.error('Error in fetchData:', error);
      setError('Failed to load data. Please try refreshing the page.');
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
    }
  };
  useEffect(() => { setStaffAdvanceCombinedOptions([...employees, ...laboursList]); }, [employees, laboursList]);

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
  const formatWithCommas = useCallback((value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }, []);
  const formatDateOnly = useCallback((dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }, []);
  const getEmployeeName = useCallback((id) => employees.find(e => e.id === id)?.label || id, [employees]);
  const getLabourName = useCallback((id) => laboursList.find(l => l.id === id)?.label || id, [laboursList]);
  const getPurposeName = useCallback((id) => purposes.find(p => p.id === id)?.label || id, [purposes]);
  const matchesRecordsForFilterOptions = useCallback((entry, excludeField) => {
    if (selectDate || selectDateEnd) {
      const entryDate = new Date(entry.date);
      if (selectDate && selectDateEnd) {
        const start = new Date(selectDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(selectDateEnd);
        end.setHours(23, 59, 59, 999);
        if (entryDate < start || entryDate > end) return false;
      } else if (selectDate) {
        const start = new Date(selectDate);
        start.setHours(0, 0, 0, 0);
        if (entryDate < start) return false;
      } else if (selectDateEnd) {
        const end = new Date(selectDateEnd);
        end.setHours(23, 59, 59, 999);
        if (entryDate > end) return false;
      }
    }
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
  }, [selectDate, selectDateEnd, selectEmployeeName, selectPurpose, selectTransferTo, selectType, selectedPaymentModes, selectAmount, selectRefundAmount, selectDescription, selectEntryNo, getEmployeeName, getLabourName, getPurposeName]);
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
  const handleSort = useCallback((key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  }, []);
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
    if (key === 'entryNo') return 'eno';
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
      eno: 'entryNo',
      amount: 'amount',
    };
    handleSort(fieldToKey[edbcField] || edbcField);
  };
  const resolveEdbcSortField = (staffSortKey) =>
    sortConfig.key === staffSortKey ? mapStaffSortKeyToEdbc(staffSortKey) : '';
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
  useEffect(() => { setCombinedOptions([...vendorOptions, ...contractorOptions]); }, [vendorOptions, contractorOptions]);
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
          sNo: item.siteNo
        }));
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
        const combinedSiteOptions = [...predefinedSiteOptions, ...formattedData];
        setSiteOptions(combinedSiteOptions);
      } catch (error) {
        console.error("Fetch error: ", error);
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
      }
    };
    fetchSites();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectDate, selectDateEnd, selectEmployeeName, selectPurpose, selectTransferTo, selectType, selectedPaymentModes, selectAmount, selectRefundAmount, selectDescription, selectEntryNo]);
  // Memoized edit handlers
  const handleEditClick = useCallback((entry) => {
    if (!isAdmin && (entry.not_allow_to_edit || entry.allow_to_edit === false)) {
      setRequestingStaffEntry(entry);
      setIsRequestStaffModalOpen(true);
      return;
    }
    setEditingId(entry.staffAdvancePortalId || entry.id);
    setEditSelectedFile(null);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
    setEditFormData({
      date: entry.date?.split('T')[0] || '',
      amount: entry.amount || '',
      employee_id: entry.employee_id || '',
      labour_id: entry.labour_id || '',
      from_purpose_id: entry.from_purpose_id || '',
      to_purpose_id: entry.to_purpose_id || '',
      entryNo: entry.entryNo || '',
      description: entry.description || '',
      file_url: entry.file_url || '',
      type: entry.type || '',
      staff_payment_mode: entry.staff_payment_mode || '',
      staff_refund_amount: entry.staff_refund_amount || ''
    });
    setIsEditModalOpen(true);
  }, []);

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

  const handleEditFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setEditSelectedFile(file);
    }
    e.target.value = '';
  }, []);

  const handleUpdate = useCallback(async () => {
    try {
      let formDataForPayload = { ...editFormData };
      if (editSelectedFile) {
        try {
          const uploadFormData = new FormData();
          const now = new Date();
          const timestamp = now
            .toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true,
            })
            .replace(',', '')
            .replace(/\s/g, '-');
          const empSelection =
            staffAdvanceCombinedOptions.find(
              (opt) =>
                (opt.type === 'Employee' && opt.id === editFormData.employee_id) ||
                (opt.type === 'Labour' && opt.id === editFormData.labour_id)
            ) || null;
          const employeeName = empSelection?.label || '';
          const finalName = `${timestamp} ${employeeName}`;
          uploadFormData.append('files', editSelectedFile);
          uploadFormData.append('folder', 'FileUpload / Staff_Advances');
          uploadFormData.append('fileName', finalName);
          const uploadResponse = await fetch('https://backendaab.in/aabuildersDash/api/files/upload', {
            method: 'POST',
            body: uploadFormData,
          });
          if (!uploadResponse.ok) {
            throw new Error('Upload failed');
          }
          const uploadResult = await uploadResponse.json();
          const fileUrl = resolveFilesUploadResponseUrl(uploadResult);
          if (!fileUrl) {
            throw new Error('Upload succeeded but no file URL was returned');
          }
          formDataForPayload = { ...formDataForPayload, file_url: fileUrl };
          setEditFormData(formDataForPayload);
          setEditSelectedFile(null);
          if (editFileInputRef.current) {
            editFileInputRef.current.value = '';
          }
        } catch (error) {
          console.error('Error during file upload:', error);
          alert('Error during file upload. Please try again.');
          return;
        }
      }
      const payload = buildStaffEditPayloadFromForm({ editFormData: formDataForPayload });
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
  }, [accountDetails, editFormData, editSelectedFile, editingId, performStaffAdvanceUpdate, staffAdvanceCombinedOptions]);

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
  const [debouncedFilters, setDebouncedFilters] = useState({
    selectDate: '',
    selectDateEnd: '',
    selectEmployeeName: '',
    selectPurpose: '',
    selectTransferTo: '',
    selectType: '',
    selectedPaymentModes: [],
    selectAmount: '',
    selectRefundAmount: '',
    selectDescription: '',
    selectEntryNo: ''
  });
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters({
        selectDate,
        selectDateEnd,
        selectEmployeeName,
        selectPurpose,
        selectTransferTo,
        selectType,
        selectedPaymentModes,
        selectAmount,
        selectRefundAmount,
        selectDescription,
        selectEntryNo
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [selectDate, selectDateEnd, selectEmployeeName, selectPurpose, selectTransferTo, selectType, selectedPaymentModes, selectAmount, selectRefundAmount, selectDescription, selectEntryNo]);
  const filteredRecords = useMemo(() => {
    return records.filter((entry) => {
      if (debouncedFilters.selectDate || debouncedFilters.selectDateEnd) {
        const entryDate = new Date(entry.date);
        if (debouncedFilters.selectDate && debouncedFilters.selectDateEnd) {
          const start = new Date(debouncedFilters.selectDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(debouncedFilters.selectDateEnd);
          end.setHours(23, 59, 59, 999);
          if (entryDate < start || entryDate > end) return false;
        } else if (debouncedFilters.selectDate) {
          const start = new Date(debouncedFilters.selectDate);
          start.setHours(0, 0, 0, 0);
          if (entryDate < start) return false;
        } else if (debouncedFilters.selectDateEnd) {
          const end = new Date(debouncedFilters.selectDateEnd);
          end.setHours(23, 59, 59, 999);
          if (entryDate > end) return false;
        }
      }
      if (debouncedFilters.selectEmployeeName) {
        const employeeName = String(getEmployeeName(entry.employee_id) || getLabourName(entry.labour_id) || "");
        if (debouncedFilters.selectEmployeeName === STAFF_TABLEVIEW_BLANK_VALUE) {
          if (!isStaffTableviewBlankish(employeeName)) return false;
        } else if (employeeName.toLowerCase() !== debouncedFilters.selectEmployeeName.toLowerCase()) return false;
      }
      if (debouncedFilters.selectPurpose) {
        const purposeName = String(getPurposeName(entry.from_purpose_id) || "");
        if (debouncedFilters.selectPurpose === STAFF_TABLEVIEW_BLANK_VALUE) {
          if (!isStaffTableviewBlankish(purposeName)) return false;
        } else if (purposeName.toLowerCase() !== debouncedFilters.selectPurpose.toLowerCase()) return false;
      }
      if (debouncedFilters.selectTransferTo) {
        const transferToName = String(getPurposeName(entry.to_purpose_id) || "");
        if (debouncedFilters.selectTransferTo === STAFF_TABLEVIEW_BLANK_VALUE) {
          if (!isStaffTableviewBlankish(transferToName)) return false;
        } else if (transferToName.toLowerCase() !== debouncedFilters.selectTransferTo.toLowerCase()) return false;
      }
      if (debouncedFilters.selectType) {
        if (debouncedFilters.selectType === STAFF_TABLEVIEW_BLANK_VALUE) {
          if (!isStaffTableviewBlankish(entry.type)) return false;
        } else if (String(entry.type || "").toLowerCase() !== debouncedFilters.selectType.toLowerCase()) return false;
      }
      if (!matchesEdbcPaymentModeFilter(entry.staff_payment_mode, debouncedFilters.selectedPaymentModes, {
        blankValue: STAFF_TABLEVIEW_BLANK_VALUE,
        isBlankish: isStaffTableviewBlankish,
      })) return false;
      if (debouncedFilters.selectAmount.trim() && !matchesEdbcAmountFilter(entry.amount, debouncedFilters.selectAmount)) return false;
      if (debouncedFilters.selectRefundAmount.trim() && !matchesEdbcAmountFilter(entry.staff_refund_amount, debouncedFilters.selectRefundAmount)) return false;
      if (debouncedFilters.selectDescription.trim()) {
        if (!String(entry.description ?? '').toLowerCase().includes(debouncedFilters.selectDescription.toLowerCase().trim())) return false;
      }
      if (debouncedFilters.selectEntryNo) {
        if (debouncedFilters.selectEntryNo === STAFF_TABLEVIEW_BLANK_VALUE) {
          if (!isStaffTableviewBlankish(entry.entry_no)) return false;
        } else if (!entry.entry_no?.toString().includes(debouncedFilters.selectEntryNo.toString())) return false;
      }
      if (overallSearch.trim()) {
        const q = overallSearch.toLowerCase().trim();
        const searchable = [
          formatDateOnly(entry.date),
          getEmployeeName(entry.employee_id) || getLabourName(entry.labour_id),
          getPurposeName(entry.from_purpose_id),
          getPurposeName(entry.to_purpose_id),
          entry.amount,
          entry.staff_refund_amount,
          entry.type,
          entry.staff_payment_mode,
          entry.description,
          entry.entry_no,
        ]
          .map((v) => String(v ?? '').toLowerCase())
          .join(' ');
        if (!searchable.includes(q)) return false;
      }
      return true;
    });
  }, [records, debouncedFilters, overallSearch, getEmployeeName, getLabourName, getPurposeName, formatDateOnly]);
  const advanceTotal = filteredRecords
    .filter(r => r.type === 'Advance')
    .reduce((acc, r) => acc + (r.amount || 0), 0);
  const transferTotal = filteredRecords
    .filter(r => r.type === 'Transfer')
    .reduce((acc, r) => acc + (r.amount > 0 ? r.amount : 0), 0);
  const refundTotal = filteredRecords
    .filter(r => r.type === 'Refund')
    .reduce((acc, r) => acc + (r.staff_refund_amount || 0), 0);
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
  const sortedData = useMemo(() => {
    let sortableData = [...filteredRecords];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        let aValue, bValue;
        switch (sortConfig.key) {
          case 'date':
            aValue = new Date(a.date);
            bValue = new Date(b.date);
            break;
          case 'employee':
            aValue = String(getEmployeeName(a.employee_id) || getLabourName(a.labour_id) || '');
            bValue = String(getEmployeeName(b.employee_id) || getLabourName(b.labour_id) || '');
            break;
          case 'purpose':
            aValue = getPurposeName(a.from_purpose_id);
            bValue = getPurposeName(b.from_purpose_id);
            break;
          case 'transfer':
            aValue = getPurposeName(a.to_purpose_id);
            bValue = getPurposeName(b.to_purpose_id);
            break;
          case 'type':
            aValue = a.type || '';
            bValue = b.type || '';
            break;
          case 'mode':
            aValue = a.staff_payment_mode || '';
            bValue = b.staff_payment_mode || '';
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
          case 'entryNo':
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
      sortableData.sort((a, b) => Number(b.entry_no) - Number(a.entry_no));
    }
    return sortableData;
  }, [filteredRecords, sortConfig, getEmployeeName, getLabourName, getPurposeName]);
  const exportPDF = useCallback(() => {
    const doc = new jsPDF("l", "pt", "a4");
    const headers = [
      [
        "S.No",
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
      entry.entry_no || ""
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
  }, [sortedData, formatDateOnly, getEmployeeName, getLabourName, getPurposeName]);
  const exportCSV = useCallback(() => {
    const csvHeaders = [
      "S.No",
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
  }, [sortedData, formatDateOnly, getEmployeeName, getLabourName, getPurposeName]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = useMemo(
    () => sortedData.slice(startIndex, endIndex),
    [sortedData, startIndex, endIndex]
  );
  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);
  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);
  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);
  const handleItemsPerPageChange = useCallback((e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);
  useEffect(() => {
    return () => {
      cancelMomentum();
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);
  useEffect(() => {
    return () => {
      if (scrollRef.current) {
        scrollRef.current.removeEventListener('mousedown', handleMouseDown);
        scrollRef.current.removeEventListener('mousemove', handleMouseMove);
        scrollRef.current.removeEventListener('mouseup', handleMouseUp);
        scrollRef.current.removeEventListener('mouseleave', handleMouseUp);
      }
    };
  },[]);
  const clearFilters = () => {
    setSelectDate('');
    setSelectDateEnd('');
    setShowTableDateRangePicker(false);
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
    selectDateEnd ||
    selectEmployeeName ||
    selectPurpose ||
    selectTransferTo ||
    selectAmount.trim() ||
    selectRefundAmount.trim() ||
    selectDescription.trim() ||
    selectType ||
    hasEdbcPaymentModeFilter(selectedPaymentModes) ||
    selectEntryNo;
  if (error && error.startsWith('Failed to load')) {
    return (
      <div className='flex flex-col h-[calc(100vh-104px)] overflow-hidden bg-[#FAF6ED]'>
        <div className='px-[18px] pt-[18px] pb-[18px] flex flex-col flex-1 min-h-0 overflow-hidden bg-[#FAF6ED]'>
          <div className='bg-white w-full rounded-[6px] p-10 flex flex-1 items-center justify-center'>
            <div className="text-lg text-red-600">{error}</div>
          </div>
        </div>
      </div>
    );
  }
  const handleSendStaffEditRequest = async () => {
    if (!requestingStaffEntry) return;
    try {
      const requestData = {
        module_name: 'Staff Portal',
        module_name_id: requestingStaffEntry.staffAdvancePortalId,
        module_name_eno: requestingStaffEntry.entry_no,
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
      setIsRequestStaffModalOpen(false);
      setRequestingStaffEntry(null);
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
        {error && !error.startsWith('Failed to load') && (
          <div className="mb-[12px] p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-[6px] w-full">
            <p className="font-semibold text-sm">Warning:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
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
                  {selectDate && selectDateEnd ? (
                    <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 text-[16px] w-fit max-w-full min-w-0 overflow-hidden">
                      <span className="font-semibold shrink-0 whitespace-nowrap">Date: </span>
                      <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">
                        {selectDate === selectDateEnd
                          ? formatEdbcFilterDateDMY(selectDate)
                          : `${formatEdbcFilterDateDMY(selectDate)} – ${formatEdbcFilterDateDMY(selectDateEnd)}`}
                      </span>
                      <button onClick={() => { setSelectDate(''); setSelectDateEnd(''); }} className="text-[#E4572E] ml-1 text-2xl">×</button>
                    </span>
                  ) : selectDate ? (
                    <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                      <span className="font-semibold shrink-0 whitespace-nowrap">Date: </span>
                      <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{formatEdbcFilterDateDMY(selectDate)} onwards</span>
                      <button onClick={() => setSelectDate('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                    </span>
                  ) : selectDateEnd ? (
                    <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                      <span className="font-semibold shrink-0 whitespace-nowrap">Date until: </span>
                      <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{formatEdbcFilterDateDMY(selectDateEnd)}</span>
                      <button onClick={() => setSelectDateEnd('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                    </span>
                  ) : null}
                  {selectEmployeeName && (
                    <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                      <span className="font-semibold shrink-0 whitespace-nowrap">Employee: </span>
                      <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectEmployeeName === STAFF_TABLEVIEW_BLANK_VALUE ? STAFF_TABLEVIEW_BLANK_LABEL : selectEmployeeName}</span>
                      <button onClick={() => setSelectEmployeeName('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                    </span>
                  )}
                  {selectPurpose && (
                    <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                      <span className="font-semibold shrink-0 whitespace-nowrap">Purpose: </span>
                      <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectPurpose === STAFF_TABLEVIEW_BLANK_VALUE ? STAFF_TABLEVIEW_BLANK_LABEL : selectPurpose}</span>
                      <button onClick={() => setSelectPurpose('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                    </span>
                  )}
                  {selectTransferTo && (
                    <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                      <span className="font-semibold shrink-0 whitespace-nowrap">Transfer To: </span>
                      <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectTransferTo === STAFF_TABLEVIEW_BLANK_VALUE ? STAFF_TABLEVIEW_BLANK_LABEL : selectTransferTo}</span>
                      <button onClick={() => setSelectTransferTo('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                    </span>
                  )}
                  {selectAmount.trim() && (
                    <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                      <span className="font-semibold shrink-0 whitespace-nowrap">Advance: </span>
                      <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectAmount}</span>
                      <button onClick={() => setSelectAmount('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                    </span>
                  )}
                  {selectRefundAmount.trim() && (
                    <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                      <span className="font-semibold shrink-0 whitespace-nowrap">Refund: </span>
                      <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectRefundAmount}</span>
                      <button onClick={() => setSelectRefundAmount('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                    </span>
                  )}
                  {selectDescription.trim() && (
                    <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                      <span className="font-semibold shrink-0 whitespace-nowrap">Description: </span>
                      <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectDescription}</span>
                      <button onClick={() => setSelectDescription('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                    </span>
                  )}
                  {selectType && (
                    <span className="inline-flex shrink-0 flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                      <span className="font-semibold shrink-0 whitespace-nowrap">Type: </span>
                      <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectType === STAFF_TABLEVIEW_BLANK_VALUE ? STAFF_TABLEVIEW_BLANK_LABEL : selectType}</span>
                      <button onClick={() => setSelectType('')} className="text-[#E4572E] text-2xl ml-1">×</button>
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
                    sortField={resolveEdbcSortField('entryNo')}
                    sortDirection={sortConfig.direction}
                    onSort={handleEdbcSort}
                  />
                  <EdbcColumnHeader columnId={EDBC_IDS.EDBC19} label="Activity" />
                  <EdbcColumnHeader columnId={EDBC_IDS.EDBC20} label="File" />
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
                    <td className="p-4 text-center text-sm text-gray-500" colSpan={12}>
                      Loading data...
                    </td>
                  </tr>
                ) : currentData.length > 0 ? (
                  currentData.map((entry, index) => (
                    <EdbcTableBodyRow key={entry.id}>
                      <EdbcDateBodyCell
                        expense={entry}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        formatValue={formatDateOnly}
                        columnWidthClass={EDBC2_FIRST_COLUMN_WIDTH_CLASS}
                      />
                      <EdbcExpandableBodyCell
                        columnId={EDBC_IDS.EDBC4}
                        expense={entry}
                        rowIndex={index}
                        expandedCells={expandedCells}
                        onToggleExpanded={toggleExpandedCell}
                        getDisplayValue={(row) =>
                          getEmployeeName(row.employee_id) || getLabourName(row.labour_id) || '0'
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
                        getDisplayValue={(row) => formatStaffTableAmount(row.amount)}
                      />
                      <td className={edbc8Config?.tdClass}>
                        <span
                          onClick={() => toggleExpandedCell(`${entry.id ?? index}-refund_amount`)}
                          className={`block w-full cursor-pointer text-right ${expandedCells[`${entry.id ?? index}-refund_amount`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                          title={formatStaffTableAmount(entry.staff_refund_amount)}
                        >
                          {formatStaffTableAmount(entry.staff_refund_amount)}
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
                      <td id={EDBC_IDS.EDBC19} className={`${edbc19Config?.tdClass || ''} !justify-center`}>
                        <button
                          type="button"
                          className={`rounded-full transition duration-200 ${entry.not_allow_to_edit ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={entry.not_allow_to_edit}
                          onClick={entry.not_allow_to_edit ? undefined : () => handleEditClick(entry)}
                        >
                          <img
                            src={edit}
                            alt="Edit"
                            className={`w-4 h-6 transition duration-200 ${entry.not_allow_to_edit ? '' : 'transform hover:scale-110 hover:brightness-110'}`}
                          />
                        </button>
                      </td>
                      <EdbcFileBodyCell columnId={EDBC_IDS.EDBC20} expense={{ ...entry, billCopy: entry.file_url }} />
                    </EdbcTableBodyRow>
                  ))
                ) : (
                  <tr>
                    <td className="p-2 text-center text-sm text-gray-400" colSpan={12}>
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
          {sortedData.length > 0 && (
            <div className="flex shrink-0 items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Items per page:</span>
                <select value={itemsPerPage} onChange={handleItemsPerPageChange}
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
                <button onClick={goToPreviousPage} disabled={currentPage === 1}
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
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#BF9853] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
        {isEditModalOpen && (
          <EditModal
            isOpen={isEditModalOpen}
            editFormData={editFormData}
            setEditFormData={setEditFormData}
            staffAdvanceCombinedOptions={staffAdvanceCombinedOptions}
            purposes={purposes}
            paymentModeOptions={paymentModeOptions}
            records={records}
            selectedFile={editSelectedFile}
            fileInputRef={editFileInputRef}
            onFileChange={handleEditFileChange}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditSelectedFile(null);
              if (editFileInputRef.current) {
                editFileInputRef.current.value = '';
              }
            }}
            onUpdate={handleUpdate}
          />
        )}
        {isRequestStaffModalOpen && requestingStaffEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-[400px] text-center">
              <h2 className="text-lg font-bold mb-2 text-[#BF9853]">Request Edit Permission</h2>
              <p className="text-gray-700 mb-6">
                You need admin approval to edit this record.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setIsRequestStaffModalOpen(false);
                    setRequestingStaffEntry(null);
                  }}
                  className="px-4 py-2 border border-[#BF9853] w-[100px] h-[45px] rounded"
                >
                  Cancel
                </button>
                <button onClick={handleSendStaffEditRequest} className="px-4 py-2 bg-[#BF9853] w-[160px] h-[45px] text-white rounded" >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        )}
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
  );
};
export default memo(TableView);