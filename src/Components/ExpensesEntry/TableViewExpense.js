import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import Modal from 'react-modal';
import edit from '../Images/Edit.svg';
import Select, { components as selectComponents } from 'react-select';
import UploadFile from '../Images/Upload file.svg'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    postBankRegisterLogSave,
    bankRegisterLogSaveUrlMatchingRequest,
    isPaymentModeRequiringBankRegisterLog,
} from '../../utils/bankRegisterLogBeforeWeeklyBill';
import {
    fetchWeeklyPaymentBillsByExpensesEntryId,
    isExpenseEntryWeeklyBillAccountType,
    isExpenseEntryNonCashPaymentMode,
    buildExpenseEntryWeeklyBillSavePayload,
    saveExpenseEntryWeeklyPaymentBill,
    syncWeeklyExpensesForExpensesEntryEdit,
} from '../../utils/expensesEntryWeeklyPaymentBill';
import CustomDateField from './CustomDateField';
import CustomMonthField from './CustomMonthField';
import ExpenseEntryPaymentModal from './ExpenseEntryPaymentModal';
import { Calendar } from 'lucide-react';
import DateRangePicker from './DateRangePicker';
import SingleDatePicker from './SingleDatePicker';
import { Table, TableProvider, buildTableViewExpenseTableContext, BLANK_VALUE, blankOption } from './Table';
import {
    DATABASE_TABLE_FILTER_SELECT_STYLES,
    isAdvancePortalSourceExpense,
    EdbcPaymentModeFilterChip,
    buildEdbcSelectFilterOptions,
    hasEdbcPaymentModeFilter,
    loadEdbcPaymentModeFilterFromStorage,
    matchesEdbcAmountFilter,
    matchesEdbcPaymentModeFilter,
    matchesEdbcSelectFilter,
    normalizeEdbcFilterText,
    saveEdbcPaymentModeFilterToStorage,
    EdbcFilterToggleButton,
    EdbcTableToolbarRightActions,
} from './databaseExpensesSharedColumns';
import { useExpensesListLoader } from './expensesListStore';
import { uploadExpensesEntryBillCopy } from './expensesBillCopyUpload';
import {
    EXPENSE_ENTRY_MODULE_NAME,
    sortEdbcFilterOptionsByArrangement,
} from '../../utils/paymentModeArrangement';
import {
    useModulePaymentModeArrangementList,
    usePaymentModesForModule,
} from '../../utils/usePaymentModeArrangement';
Modal.setAppElement('#root');

const TABLE_VIEW_EXPENSE_FIELDS = {
    date: 'Date',
    projectName: 'Project Name',
    vendorName: 'Vendor Name',
    contractorName: 'Contractor Name',
    staffName: 'Staff Name',
    quantity: 'Quantity',
    amount: 'Amount',
    description: 'Description',
    category: 'Category',
    machineTools: 'Machine Tools',
    machineName: 'Machine Name',
    machineId: 'Machine ID',
    accountType: 'A/C Type',
    serviceNumber: 'Service Number',
    mode: 'Mode',
    sourceFrom: 'Source From',
    branch: 'Branch',
    enteredBy: 'Entered By',
    entryNo: 'Entry No',
    billArrival: 'Bill Arrival',
    activity: 'Edit',
    file: 'File',
    searchTransactions: 'Search Transactions...',
};

const isAdvanceAdjustmentPaymentMode = (mode) =>
    String(mode ?? '').trim().toLowerCase() === 'advance adjustment';

const normalizeAccountTypeName = (name) => String(name ?? '').trim();

const getPropertyProfessionTaxNo = (property) =>
    String(property?.professionalTaxNo ?? property?.professionTaxNo ?? '').trim();

const EDIT_POPUP_UTILITY_TYPE_OPTIONS = [
    { value: 'Electricity', label: 'Electricity' },
    { value: 'Property', label: 'Property' },
    { value: 'Water', label: 'Water' },
    { value: 'Profession', label: 'Profession' },
    { value: 'Telecom', label: 'Telecom' },
    { value: 'Subscription', label: 'Subscription' },
];
const EDIT_POPUP_VALIDITY_TYPE_OPTIONS = [
    { value: 'Days', label: 'Days' },
    { value: 'Month', label: 'Month' },
    { value: 'Year', label: 'Year' },
];
const getEditPopupHeading = (source, defaultTitle) => {
    const s = String(source ?? '').trim();
    return s ? `Edit ${s}` : defaultTitle;
};
const getUtilityTypeNumberLabel = (utilityTypeValue) => {
    switch (utilityTypeValue) {
        case 'Electricity':
        default:
            return 'Service Number';
    }
};
const EDIT_POPUP_SELECT_INDICATOR_COMPONENTS = {
    DropdownIndicator: (props) => {
        if (props.selectProps.value) return null;
        return (
            <selectComponents.DropdownIndicator
                {...props}
                innerProps={{
                    ...props.innerProps,
                    style: { ...props.innerProps?.style, color: '#000000' },
                }}
            />
        );
    },
    ClearIndicator: (props) => {
        if (!props.selectProps.value) return null;
        return (
            <selectComponents.ClearIndicator
                {...props}
                innerProps={{
                    ...props.innerProps,
                    style: { ...props.innerProps?.style, color: '#000000' },
                }}
            />
        );
    },
};
const EDIT_POPUP_SELECT_CLASSNAME = 'font-semibold text-[14px]';
const EDIT_POPUP_MACHINE_SELECT_STYLES = {
    control: (base, state) => ({
        ...base,
        fontWeight: 600,
        borderColor: 'rgba(191, 152, 83, 0.2)',
        borderWidth: '2px',
        borderRadius: '0.5rem',
        height: '40px',
        minHeight: '40px',
        alignItems: 'center',
        textAlign: 'left',
        boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.4)' : 'none',
        '&:hover': { borderColor: 'rgba(191, 152, 83, 0.4)' },
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    placeholder: (base) => ({ ...base, fontWeight: 'normal', color: '#6B7280', textAlign: 'left' }),
    singleValue: (base) => ({ ...base, color: '#111827', fontWeight: 600 }),
    option: (provided, state) => ({
        ...provided,
        textAlign: 'left',
        fontWeight: 600,
        fontSize: '15px',
        backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
        color: 'black',
    }),
    menuPortal: (base) => ({ ...base, zIndex: 10001 }),
    menu: (base) => ({ ...base, zIndex: 999 }),
};
const TOOLS_API_BASE = 'https://backendaab.in/demoAabuildersDash';

/** API expects yyyy-MM-dd; expense form may send dd/MM/yyyy or ISO strings. */
const normalizeWeeklyBillApiDate = (value) => {
    if (value == null || String(value).trim() === '') return null;
    const s = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    // dd/MM/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
        const [dd, mm, yyyy] = s.split('/');
        return `${yyyy}-${mm}-${dd}`;
    }
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

const normalizeWeeklyBillNullableId = (value) => {
    if (value === '' || value === undefined || value === null) return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
};

const pickWeeklyBillModalOrExisting = (modalPaymentData, bill, modalKey, billKey, billKeyAlt) => {
    if (modalPaymentData && modalPaymentData[modalKey] != null && String(modalPaymentData[modalKey]).trim() !== '') {
        return modalPaymentData[modalKey];
    }
    if (bill && bill[billKey] != null && String(bill[billKey]).trim() !== '') return bill[billKey];
    if (bill && billKeyAlt && bill[billKeyAlt] != null && String(bill[billKeyAlt]).trim() !== '') return bill[billKeyAlt];
    return null;
};

const getWeeklyBillTypeFromAccountType = (accountType) => {
    if (accountType === 'Claim Payment') return 'Claim Payment';
    if (accountType === 'Sundry Payment') return 'Sundry Payment';
    return 'Utility Payment';
};

const buildWeeklyPaymentBillUpdatePayload = (updatedFormData, expensesEntryId, bill, { modalPaymentData = null, editedBy = '' } = {}) => {
    const chequeDateRaw = pickWeeklyBillModalOrExisting(
        modalPaymentData,
        bill,
        'chequeDate',
        'cheque_date',
        'chequeDate'
    );
    const chequeDate =
        chequeDateRaw != null
            ? normalizeWeeklyBillApiDate(chequeDateRaw) || String(chequeDateRaw).trim()
            : null;

    const resolvedDate =
        normalizeWeeklyBillApiDate(updatedFormData.date) ??
        normalizeWeeklyBillApiDate(bill?.date) ??
        (typeof bill?.date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(bill.date) ? bill.date.slice(0, 10) : null);

    return {
        id: bill.id,
        date: resolvedDate,
        created_at: bill.created_at ?? bill.createdAt ?? new Date().toISOString(),
        contractor_id: normalizeWeeklyBillNullableId(updatedFormData.contractorId ?? updatedFormData.contractor_id ?? bill.contractor_id),
        vendor_id: normalizeWeeklyBillNullableId(updatedFormData.vendorId ?? updatedFormData.vendor_id ?? bill.vendor_id),
        employee_id: normalizeWeeklyBillNullableId(bill.employee_id ?? bill.employeeId),
        labour_id: normalizeWeeklyBillNullableId(bill.labour_id ?? bill.labourId),
        project_id: normalizeWeeklyBillNullableId(updatedFormData.projectId ?? updatedFormData.project_id ?? bill.project_id),
        type: getWeeklyBillTypeFromAccountType(updatedFormData.accountType),
        amount: parseFloat(updatedFormData.amount) || 0,
        status: bill?.status !== false,
        weekly_number: bill.weekly_number ?? bill.weeklyNumber ?? null,
        weekly_payment_expense_id: normalizeWeeklyBillNullableId(bill.weekly_payment_expense_id ?? bill.weeklyPaymentExpenseId),
        bill_payment_mode: updatedFormData.paymentMode || bill.bill_payment_mode || null,
        advance_portal_id: normalizeWeeklyBillNullableId(bill.advance_portal_id ?? bill.advancePortalId),
        staff_advance_portal_id: normalizeWeeklyBillNullableId(bill.staff_advance_portal_id ?? bill.staffAdvancePortalId),
        tenant_id: normalizeWeeklyBillNullableId(bill.tenant_id ?? bill.tenantId),
        tenant_complex_name: bill.tenant_complex_name ?? bill.tenantComplexName ?? null,
        rent_management_id: normalizeWeeklyBillNullableId(bill.rent_management_id ?? bill.rentManagementId),
        loan_portal_id: normalizeWeeklyBillNullableId(bill.loan_portal_id ?? bill.loanPortalId),
        expenses_entry_id: normalizeWeeklyBillNullableId(expensesEntryId),
        claim_payment_id: normalizeWeeklyBillNullableId(bill.claim_payment_id ?? bill.claimPaymentId),
        purpose_id: normalizeWeeklyBillNullableId(bill.purpose_id ?? bill.purposeId),
        cheque_number: pickWeeklyBillModalOrExisting(
            modalPaymentData,
            bill,
            'chequeNo',
            'cheque_number',
            'chequeNumber'
        ),
        cheque_date: chequeDate,
        transaction_number: pickWeeklyBillModalOrExisting(
            modalPaymentData,
            bill,
            'transactionNumber',
            'transaction_number',
            'transactionNumber'
        ),
        account_number: pickWeeklyBillModalOrExisting(
            modalPaymentData,
            bill,
            'accountNumber',
            'account_number',
            'accountNumber'
        ),
        vendor_payment_tracker_id: bill.vendor_payment_tracker_id ?? bill.vendorPaymentTrackerId ?? null,
        branch_id: normalizeWeeklyBillNullableId(bill.branch_id ?? bill.branchId),
        edited_by: (editedBy || bill.edited_by || bill.editedBy) ?? null,
        entered_by: (bill.entered_by ?? bill.enteredBy ?? editedBy) || null,
    };
};

const updateWeeklyPaymentBillById = async (billId, payload) => {
    const response = await fetch(`${TOOLS_API_BASE}/api/weekly-payment-bills/update/${billId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Weekly payment bill update failed: ${errText}`);
    }
    return response.json();
};

const BLANK_LABEL = 'Blank';

const TableViewExpense = ({ username, userRoles = [], isActive = true }) => {
    const TELECOM_DIRECTORY_ENDPOINT = 'https://backendaab.in/demoAabuildersDash/api/utility-telecom/getAll';
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
    const [activeBranchId, setActiveBranchId] = useState(() => resolveActiveBranchId());
    const {
        expenses,
        expensesLoading,
        expensesLoadingMore,
        expensesTotalCount,
        refetchExpenses,
    } = useExpensesListLoader(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [exportFilteredExpenses, setExportFilteredExpenses] = useState([]);
    const [overallSearch, setOverallSearch] = useState('');
    const [editId, setEditId] = useState(null);
    const sentToWeeklyPaymentBillsRef = useRef(new Set());
    const [siteOptions, setSiteOptions] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [contractorOptions, setContractorOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [machineToolsOptions, setMachineToolsOptions] = useState([]);
    const [machineToolsCatalog, setMachineToolsCatalog] = useState([]);
    const [toolsItemNameOptions, setToolsItemNameOptions] = useState([]);
    const [editPopupSelectedToolsItemName, setEditPopupSelectedToolsItemName] = useState(null);
    const [editPopupSelectedMachine, setEditPopupSelectedMachine] = useState(null);
    const [branchOptions, setBranchOptions] = useState([]);
    const [sourceOptions, setSourceOptions] = useState([]);
    const [paymentModeFilterOptions, setPaymentModeFilterOptions] = useState([]);
    const [branchFilterOptions, setBranchFilterOptions] = useState([]);
    const [enteredByOptions, setEnteredByOptions] = useState([]);
    const [laboursList, setLaboursList] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [selectedSiteName, setSelectedSiteName] = useState(() => {
        return localStorage.getItem('expenseFilter_siteName') || '';
    });
    const [selectedVendor, setSelectedVendor] = useState(() => {
        return localStorage.getItem('expenseFilter_vendor') || '';
    });
    const [selectedContractor, setSelectedContractor] = useState(() => {
        return localStorage.getItem('expenseFilter_contractor') || '';
    });
    const [selectedCategory, setSelectedCategory] = useState(() => {
        return localStorage.getItem('expenseFilter_category') || '';
    });
    const [enoOptions, setEnoOptions] = useState([]);
    const [pendingBillCopyFile, setPendingBillCopyFile] = useState(null);
    const billCopyFileInputRef = useRef(null);
    const [selectedEno, setSelectedEno] = useState(() => {
        return localStorage.getItem('expenseFilter_eno') || '';
    });
    const [accountTypeOptions, setAccountTypeOptions] = useState([]);
    const [selectedMachineTools, setSelectedMachineTools] = useState(() => {
        return localStorage.getItem('expenseFilter_machineTools') || '';
    });
    const [startDate, setStartDate] = useState(() => {
        return localStorage.getItem('expenseFilter_startDate') || '';
    });
    const [endDate, setEndDate] = useState(() => {
        return localStorage.getItem('expenseFilter_endDate') || '';
    });
    const [selectedAccountType, setSelectedAccountType] = useState(() => {
        return localStorage.getItem('expenseFilter_accountType') || '';
    });
    const [selectedSource, setSelectedSource] = useState(() => {
        return localStorage.getItem('expenseFilter_source') || '';
    });
    const [selectedPaymentModes, setSelectedPaymentModes] = useState(() => loadEdbcPaymentModeFilterFromStorage());
    const [selectedBranch, setSelectedBranch] = useState(() => {
        return localStorage.getItem('expenseFilter_branch') || '';
    });
    const [selectedEnteredBy, setSelectedEnteredBy] = useState(() => {
        return localStorage.getItem('expenseFilter_enteredBy') || '';
    });
    const [accountTypeOption, setAccountTypeOption] = useState([]);
    const [editAccountTypeOptions, setEditAccountTypeOptions] = useState([]);
    const [siteOption, setSiteOption] = useState([]);
    const [vendorOption, setVendorOption] = useState([]);
    const [contractorOption, setContractorOption] = useState([]);
    const [categoryOption, setCategoryOption] = useState([]);
    const [machineToolsOption, setMachineToolsOption] = useState([]);
    const [selectedQuantity, setSelectedQuantity] = useState('');
    const [selectedAmount, setSelectedAmount] = useState('');
    const [selectedDescription, setSelectedDescription] = useState('');
    const [selectedServiceNumber, setSelectedServiceNumber] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showDateRangePicker, setShowDateRangePicker] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const scrollRef = useRef(null);
    const filterRowRef = useRef(null);
    const billArrivalFilterRef = useRef(null);
    const [selectedBillArrival, setSelectedBillArrival] = useState('');
    const [showBillArrivalCalendar, setShowBillArrivalCalendar] = useState(false);
    const [billArrivalCalendarPos, setBillArrivalCalendarPos] = useState({ top: 0, left: 0 });
    const filterNudgeUsedRef = useRef(false);
    const filterScrollResetSkipRef = useRef(true);
    const isDragging = useRef(false);
    const start = useRef({ x: 0, y: 0 });
    const scroll = useRef({ left: 0, top: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const animationFrame = useRef(null);
    const lastMove = useRef({ time: 0, x: 0, y: 0 });
    const handleMouseDown = (e) => {
        if (e.target.closest('input, button, a, select, textarea, label, [role="button"], .react-select')) return;
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
        if (!isDragging.current) return;
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
        if (!isDragging.current) return;
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
        const friction = 0.95;
        const minVelocity = 0.1;
        const step = () => {
            const { x, y } = velocity.current;
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
    useEffect(() => {
        return () => cancelMomentum();
    }, []);
    useEffect(() => {
        localStorage.setItem('expenseFilter_siteName', selectedSiteName);
    }, [selectedSiteName]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_vendor', selectedVendor);
    }, [selectedVendor]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_contractor', selectedContractor);
    }, [selectedContractor]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_category', selectedCategory);
    }, [selectedCategory]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_machineTools', selectedMachineTools);
    }, [selectedMachineTools]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_accountType', selectedAccountType);
    }, [selectedAccountType]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_startDate', startDate);
    }, [startDate]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_endDate', endDate);
    }, [endDate]);
    useEffect(() => {
        const fetchAccountDetails = async () => {
            try {
                const response = await fetch('https://backendaab.in/demoAabuildersDash/api/account-details/getAll');
                if (response.ok) {
                    const data = await response.json();
                    setAccountDetails(data);
                }
            } catch (err) {
                console.error('Error fetching account details:', err);
            }
        };
        fetchAccountDetails();
    }, []);
    useEffect(() => {
        localStorage.setItem('expenseFilter_eno', selectedEno);
    }, [selectedEno]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_source', selectedSource);
    }, [selectedSource]);
    useEffect(() => {
        saveEdbcPaymentModeFilterToStorage(selectedPaymentModes);
    }, [selectedPaymentModes]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_branch', selectedBranch);
    }, [selectedBranch]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_enteredBy', selectedEnteredBy);
    }, [selectedEnteredBy]);
    const [formData, setFormData] = useState({
        accountType: '',
        date: '',
        siteName: '',
        vendor: '',
        quantity: '',
        contractor: '',
        amount: '',
        category: '',
        otherVendorName: '',
        otherContractorName: '',
        machineTools: '',
        billCopy: '',
        billCopyUrl: '',
        paymentMode: '',
        utilityType: '',
        utilityTypeNumber: '',
        utilityForTheMonth: '',
        utilityValidityDays: '',
        utilityValidityType: '',
        serviceStartingDate: '',
        projectId: '',
        vendorId: '',
        contractorId: '',
        billArrivalDate: ''
    });
    const [projectData, setProjectData] = useState(null);
    const [ebNumberOptions, setEbNumberOptions] = useState([]);
    const [selectedEbNumber, setSelectedEbNumber] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const fetchProjectData = async (projectId) => {
        try {
            if (!projectId) return null;
            const response = await fetch(`https://backendaab.in/demoAabuilderDash/api/projects/get/${projectId}`);
            if (!response.ok) return null;
            const data = await response.json();
            setProjectData(data);
            return data;
        } catch (error) {
            console.error("Error fetching project data:", error);
            return null;
        }
    };

    const updateEbNumberOptions = async (utilityType, project) => {
        if (!utilityType) {
            setEbNumberOptions([]);
            return;
        }
        if (utilityType === 'Telecom') {
            const pid =
                project?.id ??
                project?.projectId ??
                project?.project_id ??
                formData?.projectId ??
                null;
            if (!pid) {
                setEbNumberOptions([]);
                return;
            }
            try {
                const res = await axios.get(TELECOM_DIRECTORY_ENDPOINT);
                const rows = Array.isArray(res.data) ? res.data : [];
                const serviceNos = rows
                    .filter(r => String(r?.project_id ?? r?.projectId ?? '') === String(pid))
                    .map(r => r?.service_number ?? r?.serviceNumber ?? '')
                    .map(v => String(v || '').trim())
                    .filter(Boolean);
                const unique = Array.from(new Set(serviceNos));
                setEbNumberOptions(unique.map((no, idx) => ({ value: no, label: no, id: idx })));
            } catch (e) {
                console.error('Failed to fetch telecom service numbers', e);
                setEbNumberOptions([]);
            }
            return;
        }
        if (!project || !project.propertyDetails) {
            setEbNumberOptions([]);
            return;
        }
        const options = [];
        project.propertyDetails.forEach((property, index) => {
            let optionValue = '';
            switch (utilityType) {
                case 'Electricity':
                    optionValue = property.ebNo || '';
                    break;
                case 'Property':
                    optionValue = property.propertyTaxNo || '';
                    break;
                case 'Water':
                    optionValue = property.waterTaxNo || '';
                    break;
                case 'Profession':
                    optionValue = getPropertyProfessionTaxNo(property);
                    break;
                default:
                    return;
            }
            const v = String(optionValue || '').trim();
            if (v) options.push({ value: v, label: v, id: index });
        });
        setEbNumberOptions(options);
    };

    useEffect(() => {
        if (!modalIsOpen) return;
        if (formData.accountType !== 'Utility Bills') return;
        if (!formData.projectId) return;
        fetchProjectData(formData.projectId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalIsOpen, formData.accountType, formData.projectId]);

    useEffect(() => {
        if (!modalIsOpen) return;
        if (formData.accountType !== 'Utility Bills') return;
        if (!formData.utilityType) {
            setEbNumberOptions([]);
            setSelectedEbNumber(null);
            return;
        }
        if (projectData) updateEbNumberOptions(formData.utilityType, projectData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalIsOpen, formData.accountType, formData.utilityType, projectData]);

    useEffect(() => {
        if (!modalIsOpen) return;
        if (formData.accountType !== 'Utility Bills') return;
        if (!formData.utilityTypeNumber) {
            setSelectedEbNumber(null);
            return;
        }
        const target = String(formData.utilityTypeNumber).trim();
        const opt = ebNumberOptions.find(o => String(o.value).trim() === target || String(o.label).trim() === target);
        if (opt) setSelectedEbNumber(opt);
    }, [modalIsOpen, formData.accountType, formData.utilityTypeNumber, ebNumberOptions]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentModalData, setPaymentModalData] = useState({
        chequeNo: '',
        chequeDate: '',
        transactionNumber: '',
        accountNumber: ''
    });
    const [accountDetails, setAccountDetails] = useState([]);
    const pendingUpdateFormDataRef = useRef(null);
    const [userPermissions, setUserPermissions] = useState([]);
    const moduleName = EXPENSE_ENTRY_MODULE_NAME;
    const defaultPaymentModeOptions = [
        { modeOfPayment: 'Cash' },
        { modeOfPayment: 'GPay' },
        { modeOfPayment: 'PhonePe' },
        { modeOfPayment: 'Net Banking' },
        { modeOfPayment: 'Cheque' }
    ];
    const paymentModeOptions = usePaymentModesForModule(moduleName, {
        fallbackModes: defaultPaymentModeOptions,
    });
    const expenseEntryPaymentModeOrder = useModulePaymentModeArrangementList(moduleName);
    const finalPaymentModeOptions = paymentModeOptions.length > 0 ? paymentModeOptions : defaultPaymentModeOptions;
    const editPopupSelectablePaymentModeOptions = useMemo(() => {
        const allModes = Array.isArray(finalPaymentModeOptions) ? finalPaymentModeOptions : [];
        let modes = allModes.filter(
            (mode) => !isAdvanceAdjustmentPaymentMode(mode?.modeOfPayment)
        );
        const hideCash =
            formData.accountType === 'Claim Payment' || formData.accountType === 'Sundry Payment';
        if (hideCash) {
            modes = modes.filter((mode) => String(mode?.modeOfPayment ?? '').trim() !== 'Cash');
        }
        return modes;
    }, [finalPaymentModeOptions, formData.accountType]);
    const editPopupSiteOptions = useMemo(
        () => [...siteOption].sort((a, b) => a.label.localeCompare(b.label)),
        [siteOption]
    );
    useEffect(() => {
        if (!modalIsOpen) return;
        if (isAdvanceAdjustmentPaymentMode(formData.paymentMode)) {
            setFormData((prev) => ({ ...prev, paymentMode: '' }));
            return;
        }
        if (
            (formData.accountType === 'Claim Payment' || formData.accountType === 'Sundry Payment') &&
            formData.paymentMode === 'Cash'
        ) {
            setFormData((prev) => ({ ...prev, paymentMode: '' }));
        }
    }, [modalIsOpen, formData.accountType, formData.paymentMode]);
    useEffect(() => {
        const fetchUserRoles = async () => {
            try {
                const response = await axios.get("https://backendaab.in/demoAabuilderDash/api/user_roles/all");
                const allRoles = response.data;
                const userRoleNames = userRoles.map(r => r.roles);
                const matchedRoles = allRoles.filter(role =>
                    userRoleNames.includes(role.userRoles)
                );
                const models = matchedRoles.flatMap(role => role.userModels || []);
                const matchedModel = models.find(role => role.models === moduleName);
                const permissions = matchedModel?.permissions?.[0]?.userPermissions || [];
                setUserPermissions(permissions);
            } catch (error) {
                console.error("Error fetching user roles:", error);
            }
        };
        if (userRoles.length > 0) {
            fetchUserRoles();
        }
    }, [userRoles]);
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
    useEffect(() => {
        const fetchSites = async () => {
            try {
                const response = await fetch("https://backendaab.in/demoAabuilderDash/api/project_Names/getAll", {
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
                    value: item.siteName,
                    label: item.siteName,
                    sNo: item.siteNo
                }));
                setSiteOption(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchSites();
    }, []);
    useEffect(() => {
        const fetchVendorNames = async () => {
            try {
                const response = await fetch("https://backendaab.in/demoAabuilderDash/api/vendor_Names/getAll", {
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
                    value: item.vendorName,
                    label: item.vendorName,
                    type: "Vendor",
                }));
                setVendorOption(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchVendorNames();
    }, []);
    useEffect(() => {
        const fetchContractorNames = async () => {
            try {
                const response = await fetch("https://backendaab.in/demoAabuilderDash/api/contractor_Names/getAll", {
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
                    value: item.contractorName,
                    label: item.contractorName,
                    type: "Contractor",
                }));
                setContractorOption(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchContractorNames();
    }, []);
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("https://backendaab.in/demoAabuilderDash/api/expenses_categories/getAll", {
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
                    value: item.category,
                    label: item.category,
                }));
                setCategoryOption(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchCategories();
    }, []);
    useEffect(() => {
        const fetchMachinTools = async () => {
            try {
                const response = await fetch("https://backendaab.in/demoAabuilderDash/api/machine_tools/getAll", {
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
                    value: item.machineTool,
                    label: item.machineTool,
                }));
                setMachineToolsOption(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchMachinTools();
    }, []);
    useEffect(() => {
        const fetchToolsItemIds = async () => {
            try {
                const response = await fetch(`${TOOLS_API_BASE}/api/tools_item_id/getAll`, {
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
                const list = Array.isArray(data) ? data : [];
                const formattedData = list
                    .map((item) => {
                        const rowId = item.id;
                        const itemIdStr = item.item_id ?? item.itemId ?? "";
                        const itemNameIdStr = item.item_name_id ?? item.itemNameId ?? "";
                        const label =
                            itemIdStr ||
                            (rowId != null ? String(rowId) : "");
                        return {
                            value: rowId != null ? String(rowId) : itemIdStr,
                            label,
                            id: rowId,
                            item_id: itemIdStr,
                            item_name_id: itemNameIdStr,
                        };
                    })
                    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
                setMachineToolsCatalog(formattedData);
            } catch (error) {
                console.error("Fetch error (tools_item_id): ", error);
            }
        };
        fetchToolsItemIds();
    }, []);
    useEffect(() => {
        const fetchToolsItemNames = async () => {
            try {
                const response = await fetch(`${TOOLS_API_BASE}/api/tools_item_name/getAll`, {
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
                const list = Array.isArray(data) ? data : [];
                const formattedData = list
                    .map((item) => ({
                        value: String(item.id),
                        label: item.item_name || "-",
                        id: item.id,
                    }))
                    .sort((a, b) =>
                        a.label.localeCompare(b.label, undefined, { sensitivity: "base" })
                    );
                setToolsItemNameOptions(formattedData);
            } catch (error) {
                console.error("Fetch error (tools_item_name): ", error);
            }
        };
        fetchToolsItemNames();
    }, []);
    const editPopupCategoryOptions = useMemo(() => {
        const all = Array.isArray(categoryOption) ? categoryOption : [];
        if (formData.accountType === 'Sundry Payment') return all;
        return all.filter(
            (opt) => String(opt?.label ?? opt?.value ?? '').trim() !== 'Machine Repair'
        );
    }, [categoryOption, formData.accountType]);
    const editPopupFilteredMachineOptions = useMemo(() => {
        if (editPopupSelectedToolsItemName?.id == null) {
            return [];
        }
        const nameId = String(editPopupSelectedToolsItemName.id);
        return machineToolsCatalog.filter(
            (opt) => String(opt.item_name_id ?? "").trim() === nameId
        );
    }, [machineToolsCatalog, editPopupSelectedToolsItemName]);
    useEffect(() => {
        setEditPopupSelectedMachine((current) => {
            if (current == null) return null;
            if (editPopupSelectedToolsItemName?.id == null) return null;
            if (String(current.item_name_id ?? '').trim() === String(editPopupSelectedToolsItemName.id)) {
                return current;
            }
            return null;
        });
    }, [editPopupSelectedToolsItemName]);
    const machineToolsIdToLabel = useMemo(() => {
        const map = {};
        machineToolsCatalog.forEach((opt) => {
            if (opt.id != null) {
                const label = String(opt.label ?? opt.item_id ?? opt.id);
                map[opt.id] = label;
                map[String(opt.id)] = label;
                map[Number(opt.id)] = label;
            }
        });
        return map;
    }, [machineToolsCatalog]);
    const getMachineToolsItemIdDisplay = useCallback((val) => {
        if (val == null || val === "") return "";
        const resolved =
            machineToolsIdToLabel[val] ??
            machineToolsIdToLabel[String(val)] ??
            machineToolsIdToLabel[Number(val)];
        if (resolved != null && resolved !== "") return resolved;
        return String(val);
    }, [machineToolsIdToLabel]);
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await fetch('https://backendaab.in/demoAabuildersDash/api/branch/getAll', {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!response.ok) throw new Error('Failed to fetch branches');
                const data = await response.json();
                setBranchOptions(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching branches:', error);
                setBranchOptions([]);
            }
        };
        fetchBranches();
    }, []);
    useEffect(() => {
        const branchFilterOptionsBuilt = (Array.isArray(branchOptions) ? branchOptions : []).map((branch) => ({
            value: String(branch.id),
            label: branch.branch || String(branch.id),
        }));
        branchFilterOptionsBuilt.unshift(blankOption);
        setBranchFilterOptions(branchFilterOptionsBuilt);
    }, [branchOptions]);
    useEffect(() => {
        const fetchAccountType = async () => {
            try {
                const response = await fetch("https://backendaab.in/demoAabuilderDash/api/account_type/getAll", {
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
                const formattedData = data
                    .map((item) => {
                        const typeName = normalizeAccountTypeName(
                            item.accountType ?? item.account_type
                        );
                        return {
                            value: typeName,
                            label: typeName,
                            id: item.id ?? item.Id ?? item.account_type_id ?? item.accountTypeId,
                        };
                    })
                    .filter((item) => item.value);
                setAccountTypeOption(formattedData.filter((item) => item.value !== 'Daily Wage'));
                setEditAccountTypeOptions(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchAccountType();
    }, []);
    useEffect(() => {
        const fetchLaboursList = async () => {
            try {
                const response = await fetch('https://backendaab.in/demoAabuildersDash/api/labours-details/getAll');
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
        fetchLaboursList();
    }, []);
    useEffect(() => {
        const fetchEmployeeDetails = async () => {
            try {
                const response = await fetch("https://backendaab.in/demoAabuildersDash/api/employee_details/getAll", {
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
        fetchEmployeeDetails();
    }, []);
    const generateFilteredPDF = () => {
        if (exportFilteredExpenses.length === 0) {
            alert("No filtered data to export.");
            return;
        }
        const doc = new jsPDF({ orientation: "landscape" });
        doc.setFontSize(16);
        doc.text("Filtered Expenses Report", 14, 15);
        autoTable(doc, {
            startY: 25,
            head: [['Date', 'Site', 'Vendor', 'Contractor',
                'Qty', 'Amount', 'Comments', 'Category', 'A/C Type',
                'Machine Tools', 'E.No'
            ]],
            body: exportFilteredExpenses.map(exp => [
                formatDateOnly(exp.date),
                getDisplaySiteName(exp),
                getDisplayVendorName(exp),
                getDisplayContractorName(exp),
                exp.quantity,
                parseInt(exp.amount).toLocaleString(),
                exp.comments,
                exp.category,
                exp.accountType,
                getMachineToolsItemIdDisplay(exp.machineTools),
                exp.eno
            ]),
            styles: {
                fontSize: 8,
            },
            headStyles: {
                fillColor: [191, 152, 83],
            },
        });
        const dateStr = new Date().toISOString().slice(0, 10);
        doc.save(`Filtered_Expenses_${dateStr}.pdf`);
    };
    useEffect(() => {
        const isBlankish = (value) =>
            value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
        const filtered = expenses.filter(expense => {
            if (startDate && endDate) {
                const s = new Date(startDate);
                const e = new Date(endDate);
                e.setHours(23, 59, 59, 999);
                const expenseDate = new Date(expense.date);
                if (expenseDate < s || expenseDate > e) return false;
            } else if (startDate) {
                const s = new Date(startDate);
                s.setHours(0, 0, 0, 0);
                const expenseDate = new Date(expense.date);
                if (expenseDate < s) return false;
            } else if (endDate) {
                const e = new Date(endDate);
                e.setHours(23, 59, 59, 999);
                const expenseDate = new Date(expense.date);
                if (expenseDate > e) return false;
            }
            if (overallSearch.trim()) {
                const q = overallSearch.toLowerCase().trim();
                const searchable = [
                    formatDateOnly(expense.date),
                    getDisplaySiteName(expense),
                    getDisplayVendorName(expense),
                    getDisplayContractorName(expense),
                    getDisplayStaffName(expense),
                    expense.quantity,
                    expense.amount,
                    expense.comments,
                    expense.category,
                    expense.accountType,
                    expense.paymentMode,
                    getMachineToolsItemIdDisplay(expense.machineTools),
                    expense.source,
                    getBranchName(expense.branch_id ?? expense.branchId),
                    expense.enteredBy || ' ',
                    expense.eno,
                    formatBillArrivalDisplay(expense),
                ]
                    .map((v) => String(v ?? '').toLowerCase())
                    .join(' ');
                if (!searchable.includes(q)) return false;
            }
            return (
                matchesEdbcSelectFilter(expense.siteName, selectedSiteName, { blankValue: BLANK_VALUE, isBlankish }) &&
                matchesEdbcSelectFilter(expense.vendor, selectedVendor, { blankValue: BLANK_VALUE, isBlankish }) &&
                matchesEdbcSelectFilter(expense.contractor, selectedContractor, { blankValue: BLANK_VALUE, isBlankish }) &&
                matchesEdbcSelectFilter(expense.category, selectedCategory, { blankValue: BLANK_VALUE, isBlankish }) &&
                matchesEdbcSelectFilter(expense.machineTools, selectedMachineTools, { blankValue: BLANK_VALUE, isBlankish }) &&
                matchesEdbcSelectFilter(expense.source, selectedSource, { blankValue: BLANK_VALUE, isBlankish }) &&
                matchesEdbcPaymentModeFilter(expense.paymentMode, selectedPaymentModes, {
                    blankValue: BLANK_VALUE,
                    isBlankish,
                }) &&
                matchesEdbcSelectFilter(expense.branch_id ?? expense.branchId, selectedBranch, { blankValue: BLANK_VALUE, isBlankish }) &&
                matchesEdbcSelectFilter(expense.enteredBy || ' ', selectedEnteredBy, { blankValue: BLANK_VALUE, isBlankish }) &&
                matchesEdbcSelectFilter(expense.accountType, selectedAccountType, { blankValue: BLANK_VALUE, isBlankish }) &&
                matchesEdbcSelectFilter(expense.eno, selectedEno, { blankValue: BLANK_VALUE, isBlankish }) &&
                (selectedQuantity.trim()
                    ? String(expense.quantity ?? '').toLowerCase().includes(selectedQuantity.toLowerCase().trim())
                    : true) &&
                matchesEdbcAmountFilter(expense.amount, selectedAmount) &&
                (selectedDescription.trim()
                    ? String(expense.comments ?? '').toLowerCase().includes(selectedDescription.toLowerCase().trim())
                    : true) &&
                (selectedServiceNumber.trim()
                    ? String(expense.utilityTypeNumber ?? expense.utility_type_number ?? '').toLowerCase().includes(selectedServiceNumber.toLowerCase().trim())
                    : true) &&
                (selectedBillArrival
                    ? expenseBillArrivalToInput(expense) === selectedBillArrival
                    : true)
            );
        });
        setFilteredExpenses(filtered);
        const anyFilterApplied = [
            selectedSiteName,
            selectedVendor,
            selectedContractor,
            selectedCategory,
            selectedMachineTools,
            selectedSource,
            selectedPaymentModes,
            selectedBranch,
            selectedEnteredBy,
            selectedAccountType,
            startDate,
            endDate,
            selectedEno,
            selectedBillArrival,
            selectedQuantity.trim(),
            selectedAmount.trim(),
            selectedDescription.trim(),
            selectedServiceNumber.trim(),
        ].some(Boolean) || overallSearch.trim();
        setExportFilteredExpenses(anyFilterApplied ? filtered : []);
        const getOptions = (data, key) =>
            buildEdbcSelectFilterOptions(data, key, { blankOption, isBlankish });
        setSiteOptions(getOptions(filtered, "siteName"));
        setVendorOptions(getOptions(filtered, "vendor"));
        setContractorOptions(getOptions(filtered, "contractor"));
        setCategoryOptions(getOptions(filtered, "category"));
        setSourceOptions(getOptions(filtered, "source"));
        setPaymentModeFilterOptions(
            sortEdbcFilterOptionsByArrangement(
                getOptions(filtered, "paymentMode"),
                expenseEntryPaymentModeOrder
            )
        );
        const uniqueEnteredBy = [];
        const seenEnteredBy = new Set();
        filtered.forEach((item) => {
            const enteredBy = item.enteredBy;
            if (isBlankish(enteredBy)) return;
            const key = normalizeEdbcFilterText(enteredBy);
            if (!seenEnteredBy.has(key)) {
                seenEnteredBy.add(key);
                uniqueEnteredBy.push(String(enteredBy));
            }
        });
        const enteredByOptionsBuilt = uniqueEnteredBy.map((val) => ({ value: val, label: val }));
        enteredByOptionsBuilt.unshift(blankOption);
        setEnteredByOptions(enteredByOptionsBuilt);
        const uniqueToolIds = [...new Set(filtered.map((item) => item.machineTools).filter(val => !isBlankish(val)))];
        const machineToolsOptionsBuilt = uniqueToolIds.map((id) => ({
            value: String(id),
            label:
                machineToolsIdToLabel[id] ??
                machineToolsIdToLabel[String(id)] ??
                String(id),
        }));
        machineToolsOptionsBuilt.unshift(blankOption);
        setMachineToolsOptions(machineToolsOptionsBuilt);
        setAccountTypeOptions(getOptions(filtered, "accountType"));
        const uniqueEno = [...new Set(filtered.map(item => item.eno).filter(val => !isBlankish(val)))];
        uniqueEno.unshift(BLANK_VALUE);
        setEnoOptions(uniqueEno);
    }, [
        selectedSiteName,
        selectedVendor,
        selectedContractor,
        selectedCategory,
        selectedMachineTools,
        selectedSource,
        selectedPaymentModes,
        selectedBranch,
        selectedEnteredBy,
        selectedAccountType,
        startDate,
        endDate,
        selectedEno,
        selectedBillArrival,
        selectedQuantity,
        selectedAmount,
        selectedDescription,
        selectedServiceNumber,
        overallSearch,
        expenses,
        machineToolsIdToLabel,
        expenseEntryPaymentModeOrder
    ]);
    useEffect(() => {
        setCurrentPage(1);
    }, [
        selectedSiteName,
        selectedVendor,
        selectedContractor,
        selectedCategory,
        selectedMachineTools,
        selectedSource,
        selectedPaymentModes,
        selectedBranch,
        selectedEnteredBy,
        selectedAccountType,
        startDate,
        endDate,
        selectedEno,
        selectedBillArrival,
        selectedQuantity,
        selectedAmount,
        selectedDescription,
        selectedServiceNumber,
        overallSearch,
    ]);
    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / itemsPerPage));
        setCurrentPage((page) => (page > totalPages ? totalPages : page));
    }, [filteredExpenses.length, itemsPerPage]);
    useEffect(() => {
        if (!showBillArrivalCalendar) return undefined;
        const closeCalendar = () => setShowBillArrivalCalendar(false);
        window.addEventListener('scroll', closeCalendar, true);
        return () => window.removeEventListener('scroll', closeCalendar, true);
    }, [showBillArrivalCalendar]);
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
    }, [
        selectedSiteName, selectedVendor, selectedContractor, selectedCategory, selectedMachineTools,
        selectedSource, selectedPaymentModes, selectedBranch, selectedEnteredBy, selectedAccountType, startDate, endDate,
        selectedEno, selectedBillArrival,
    ]);
    const handleChange = (e) => {
        const { name, type, value, files } = e.target;
        if (name === "date" && value === "") {
            return;
        }
        if (name === "utilityType") {
            setSelectedEbNumber(null);
            setEbNumberOptions([]);
            setFormData({
                ...formData,
                utilityType: value,
                utilityTypeNumber: "",
            });
            return;
        }
        setFormData({
            ...formData,
            [name]: type === "file" ? files[0] : value
        });
    };
    const handleBillCopyFileSelected = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPendingBillCopyFile(file);
    };
    const formatDateOnly = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };
    const formatChipDateDMY = (dateString) => {
        if (!dateString) return '';
        const parts = String(dateString).split('-');
        if (parts.length === 3 && parts[0].length === 4) {
            const [y, m, d] = parts;
            return `${d}-${m}-${y}`;
        }
        return String(dateString);
    };
    const getExpenseBillArrivalRaw = (e) => e?.billArrivalDate ?? e?.bill_arrival_date ?? '';
    const expenseBillArrivalToInput = (e) => {
        const raw = getExpenseBillArrivalRaw(e);
        if (!raw) return '';
        const s = String(raw).trim();
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
        const d = new Date(s);
        return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
    };
    const formatBillArrivalDisplay = (e) => {
        const raw = getExpenseBillArrivalRaw(e);
        if (!raw) return '';
        const head = String(raw).trim().slice(0, 10);
        if (/^\d{4}-\d{2}-\d{2}$/.test(head)) return formatChipDateDMY(head) || '';
        try {
            return formatDateOnly(raw) || '';
        } catch {
            return String(raw);
        }
    };
    const handleSave = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        let resolvedBillCopyUrl = String(formData.billCopyUrl || formData.billCopy || '').trim();
        if (pendingBillCopyFile) {
            try {
                resolvedBillCopyUrl = await uploadExpensesEntryBillCopy(pendingBillCopyFile, {
                    siteName: formData.siteName,
                    vendor: formData.vendor,
                    contractor: formData.contractor,
                });
                setPendingBillCopyFile(null);
                if (billCopyFileInputRef.current) {
                    billCopyFileInputRef.current.value = '';
                }
                setFormData((prev) => ({ ...prev, billCopyUrl: resolvedBillCopyUrl, billCopy: resolvedBillCopyUrl }));
            } catch (error) {
                console.error('Error during file upload:', error);
                alert('Error during file upload. Please try again.');
                setIsSubmitting(false);
                return;
            }
        }
        const updatedFormData = {
            ...formData,
            billCopy: resolvedBillCopyUrl,
            billCopyUrl: resolvedBillCopyUrl,
            editedBy: username,
            machineTools:
                formData.accountType === 'Sundry Payment' && formData.category === 'Machine Repair'
                    ? (editPopupSelectedMachine?.id != null ? editPopupSelectedMachine.id : null)
                    : formData.machineTools,
        };
        // Always ask payment details for online payment modes so user can confirm/change account number.
        if (
            editId &&
            isExpenseEntryWeeklyBillAccountType(updatedFormData.accountType) &&
            isExpenseEntryNonCashPaymentMode(updatedFormData.paymentMode)
        ) {
            pendingUpdateFormDataRef.current = updatedFormData;
            let existingBill = null;
            try {
                const bills = await fetchWeeklyPaymentBillsByExpensesEntryId(editId);
                existingBill = Array.isArray(bills) && bills.length > 0 ? bills[0] : null;
            } catch (e) {
                console.warn('Could not fetch existing weekly bill to prefill payment details', e);
            }
            setPaymentModalData({
                chequeNo: existingBill?.cheque_number ?? existingBill?.chequeNumber ?? '',
                chequeDate: existingBill?.cheque_date ?? existingBill?.chequeDate ?? '',
                transactionNumber: existingBill?.transaction_number ?? existingBill?.transactionNumber ?? '',
                accountNumber: existingBill?.account_number ?? existingBill?.accountNumber ?? '',
                paymentMode: updatedFormData.paymentMode || '',
            });
            setShowPaymentModal(true);
            setIsSubmitting(false);
            return;
        }
        try {
            await performUpdateAndWeeklyBills(updatedFormData);
            await refetchExpenses();
            setModalIsOpen(false);
            setPendingBillCopyFile(null);
            if (billCopyFileInputRef.current) {
                billCopyFileInputRef.current.value = '';
            }
            setIsSubmitting(false);
            alert('Updated successfully!');
        } catch (error) {
            console.error('Error updating expense:', error);
            alert('Failed to update expense');
            setIsSubmitting(false);
        }
    };
    const performUpdateAndWeeklyBills = async (updatedFormData, modalPaymentData = null) => {
        const rawArrival = updatedFormData?.billArrivalDate ?? updatedFormData?.bill_arrival_date;
        let billArrivalForApi = '';
        if (rawArrival != null && String(rawArrival).trim() !== '') {
            const s = String(rawArrival).trim();
            if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
                billArrivalForApi = s.slice(0, 10);
            } else {
                const d = new Date(s);
                billArrivalForApi = Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
            }
        }
        const updatePayload = {
            ...updatedFormData,
            billArrivalDate: billArrivalForApi
        };
        const updateUrl = `https://backendaab.in/demoAabuilderDash/expenses_form/update/${editId}`;
        const expensesEntryId = editId ?? updatedFormData.id;
        const isPaymentTypeForWeekly = isExpenseEntryWeeklyBillAccountType(updatedFormData.accountType);
        const isNonCashPaymentMode = isExpenseEntryNonCashPaymentMode(updatedFormData.paymentMode);
        let existingWeeklyBills = [];
        if (expensesEntryId) {
            existingWeeklyBills = await fetchWeeklyPaymentBillsByExpensesEntryId(expensesEntryId);
        }
        const shouldCreateWeeklyBill =
            isPaymentTypeForWeekly && isNonCashPaymentMode && expensesEntryId && existingWeeklyBills.length === 0;
        if (
            shouldCreateWeeklyBill &&
            isPaymentModeRequiringBankRegisterLog(updatedFormData.paymentMode)
        ) {
            await postBankRegisterLogSave(
                bankRegisterLogSaveUrlMatchingRequest(updateUrl),
                'Expense Entry',
                {
                    bill_payment_mode: updatedFormData.paymentMode,
                    amount: updatedFormData.amount,
                    entered_by: username,
                }
            );
        }
        const response = await fetch(updateUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatePayload)
        });
        if (!response.ok) throw new Error('Failed to update expense');
        if (isPaymentTypeForWeekly && isNonCashPaymentMode && expensesEntryId) {
            try {
                if (existingWeeklyBills.length > 0) {
                    for (const bill of existingWeeklyBills) {
                        if (bill?.id == null) continue;
                        const weeklyPaymentBillPayload = buildWeeklyPaymentBillUpdatePayload(
                            updatedFormData,
                            expensesEntryId,
                            bill,
                            { modalPaymentData, editedBy: username }
                        );
                        await updateWeeklyPaymentBillById(bill.id, weeklyPaymentBillPayload);
                    }
                } else if (shouldCreateWeeklyBill) {
                    const weeklyPaymentBillPayload = buildExpenseEntryWeeklyBillSavePayload(
                        updatedFormData,
                        expensesEntryId,
                        {
                            modalPaymentData,
                            branchId: activeBranchId,
                            enteredBy: username,
                        }
                    );
                    await saveExpenseEntryWeeklyPaymentBill(weeklyPaymentBillPayload, {
                        branchId: activeBranchId,
                    });
                    sentToWeeklyPaymentBillsRef.current.add(expensesEntryId);
                }
            } catch (weeklyErr) {
                console.error('Weekly payment bills sync error:', weeklyErr);
                throw weeklyErr;
            }
        }

        if (expensesEntryId) {
            try {
                await syncWeeklyExpensesForExpensesEntryEdit(expensesEntryId, updatedFormData, {
                    editedBy: username,
                    existingWeeklyBills,
                });
            } catch (weeklyExpenseErr) {
                console.error('Weekly expenses sync error:', weeklyExpenseErr);
                throw weeklyExpenseErr;
            }
        }
    };
    const handlePaymentModalSubmit = async () => {
        if (!paymentModalData.accountNumber) {
            alert('Please select account number.');
            return;
        }
        const pendingPaymentMode =
            paymentModalData.paymentMode ||
            pendingUpdateFormDataRef.current?.paymentMode ||
            formData.paymentMode;
        if (
            String(pendingPaymentMode).toLowerCase() === 'cheque' &&
            (!paymentModalData.chequeNo || !paymentModalData.chequeDate)
        ) {
            alert('Please enter cheque number and date.');
            return;
        }
        const updatedFormData = pendingUpdateFormDataRef.current;
        if (!updatedFormData || !editId) return;
        setIsSubmitting(true);
        try {
            await performUpdateAndWeeklyBills(updatedFormData, paymentModalData);
            await refetchExpenses();
            setShowPaymentModal(false);
            setModalIsOpen(false);
            setPendingBillCopyFile(null);
            if (billCopyFileInputRef.current) {
                billCopyFileInputRef.current.value = '';
            }
            setIsSubmitting(false);
            alert('Updated successfully!');
        } catch (error) {
            console.error('Error updating expense:', error);
            alert('Failed to update expense');
            setIsSubmitting(false);
        }
    };
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };
    const customStyles = DATABASE_TABLE_FILTER_SELECT_STYLES;
    const sortedExpenses = [...filteredExpenses].sort((a, b) => {
        if (!sortField) return 0;
        let aValue = a[sortField];
        let bValue = b[sortField];
        if (sortField === 'date') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else if (sortField === 'eno') {
            aValue = parseInt(aValue) || 0;
            bValue = parseInt(bValue) || 0;
        } else if (sortField === 'machineTools') {
            aValue = String(getMachineToolsItemIdDisplay(a.machineTools) || '').toLowerCase();
            bValue = String(getMachineToolsItemIdDisplay(b.machineTools) || '').toLowerCase();
        } else if (sortField === 'staff') {
            const aLabourId = a.labourId || a.labour_id || a.labourID || a.labour_ID;
            const aEmployeeId = a.employeeId || a.employee_id || a.employeeID || a.employee_ID;
            const bLabourId = b.labourId || b.labour_id || b.labourID || b.labour_ID;
            const bEmployeeId = b.employeeId || b.employee_id || b.employeeID || b.employee_ID;
            aValue = aLabourId ?? aEmployeeId ?? '';
            bValue = bLabourId ?? bEmployeeId ?? '';
            const aNum = Number(aValue);
            const bNum = Number(bValue);
            if (Number.isFinite(aNum) && Number.isFinite(bNum)) {
                aValue = aNum;
                bValue = bNum;
            } else {
                aValue = String(aValue || '').toLowerCase();
                bValue = String(bValue || '').toLowerCase();
            }
        } else if (sortField === 'branch') {
            aValue = String(branchOptions.find((br) => String(br.id) === String(a.branch_id ?? a.branchId ?? ''))?.branch || '').toLowerCase();
            bValue = String(branchOptions.find((br) => String(br.id) === String(b.branch_id ?? b.branchId ?? ''))?.branch || '').toLowerCase();
        } else if (sortField === 'billArrivalDate') {
            aValue = String(a.billArrivalDate ?? a.bill_arrival_date ?? '').trim().slice(0, 10);
            bValue = String(b.billArrivalDate ?? b.bill_arrival_date ?? '').trim().slice(0, 10);
        } else if (sortField === 'utilityTypeNumber') {
            aValue = String(a.utilityTypeNumber ?? a.utility_type_number ?? '').toLowerCase();
            bValue = String(b.utilityTypeNumber ?? b.utility_type_number ?? '').toLowerCase();
        } else if (sortField === 'quantity' || sortField === 'amount') {
            aValue = Number(aValue) || 0;
            bValue = Number(bValue) || 0;
        } else {
            aValue = String(aValue || '').toLowerCase();
            bValue = String(bValue || '').toLowerCase();
        }
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    const totalPages = Math.ceil(sortedExpenses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = sortedExpenses.slice(startIndex, endIndex);
    const currentExportItems = exportFilteredExpenses;
    const totalAmount = currentItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const accountTypeSummary = React.useMemo(() => {
        const summary = {};
        filteredExpenses.forEach(expense => {
            const accountType = expense.accountType || 'Unknown';
            if (!summary[accountType]) {
                summary[accountType] = {
                    totalAmount: 0,
                    entryCount: 0
                };
            }
            summary[accountType].totalAmount += Number(expense.amount) || 0;
            summary[accountType].entryCount += 1;
        });
        return summary;
    }, [filteredExpenses]);
    const projectIdToName = React.useMemo(() => {
        const map = {};
        siteOption.forEach(option => {
            if (option.id) {
                map[option.id] = option.label;
            }
        });
        return map;
    }, [siteOption]);
    const vendorIdToName = React.useMemo(() => {
        const map = {};
        vendorOption.forEach(option => {
            if (option.id) {
                map[option.id] = option.label;
            }
        });
        return map;
    }, [vendorOption]);
    const contractorIdToName = React.useMemo(() => {
        const map = {};
        contractorOption.forEach(option => {
            if (option.id) {
                map[option.id] = option.label;
            }
        });
        return map;
    }, [contractorOption]);
    const editPopupCombinedVendorContractorOptions = useMemo(
        () => [...vendorOption, ...contractorOption, ...employeeOptions, ...laboursList],
        [vendorOption, contractorOption, employeeOptions, laboursList]
    );
    const editPopupSelectedVendorContractor = useMemo(() => {
        const employeeId = formData.employeeId || formData.employee_id || formData.employeeID || formData.employee_ID;
        const labourId = formData.labourId || formData.labour_id || formData.labourID || formData.labour_ID;
        if (formData.vendor) {
            return editPopupCombinedVendorContractorOptions.find(
                (o) => o.type === 'Vendor' && o.value === formData.vendor
            ) || { value: formData.vendor, label: formData.vendor, type: 'Vendor' };
        }
        if (formData.contractor) {
            return editPopupCombinedVendorContractorOptions.find(
                (o) => o.type === 'Contractor' && o.value === formData.contractor
            ) || { value: formData.contractor, label: formData.contractor, type: 'Contractor' };
        }
        if (employeeId) {
            return editPopupCombinedVendorContractorOptions.find(
                (o) => o.type === 'Employee' && String(o.id) === String(employeeId)
            ) || employeeOptions.find((o) => String(o.id) === String(employeeId)) || {
                value: String(employeeId),
                label: String(employeeId),
                type: 'Employee',
                id: employeeId,
            };
        }
        if (labourId) {
            return editPopupCombinedVendorContractorOptions.find(
                (o) => o.type === 'Labour' && String(o.id) === String(labourId)
            ) || laboursList.find((o) => String(o.id) === String(labourId)) || {
                value: String(labourId),
                label: String(labourId),
                type: 'Labour',
                id: labourId,
            };
        }
        return null;
    }, [formData.vendor, formData.contractor, formData.employeeId, formData.employee_id, formData.labourId, formData.labour_id, editPopupCombinedVendorContractorOptions, employeeOptions, laboursList]);
    const editPopupVendorContractorType = formData.vendor
        ? 'Vendor'
        : formData.contractor
            ? 'Contractor'
            : (formData.employeeId || formData.employee_id || formData.employeeID || formData.employee_ID)
                ? 'Employee'
                : (formData.labourId || formData.labour_id || formData.labourID || formData.labour_ID)
                    ? 'Labour'
                    : '';
    const handleEditPopupVendorContractorChange = (selectedOption) => {
        if (!selectedOption) {
            setFormData((prev) => ({
                ...prev,
                vendor: '',
                vendorId: '',
                contractor: '',
                contractorId: '',
                employeeId: '',
                employee_id: null,
                labourId: '',
                labour_id: null,
            }));
            return;
        }
        if (selectedOption.type === 'Vendor') {
            setFormData((prev) => ({
                ...prev,
                vendor: selectedOption.value || '',
                vendorId: selectedOption.id || '',
                contractor: '',
                contractorId: '',
                employeeId: '',
                employee_id: null,
                labourId: '',
                labour_id: null,
            }));
        } else if (selectedOption.type === 'Contractor') {
            setFormData((prev) => ({
                ...prev,
                contractor: selectedOption.value || '',
                contractorId: selectedOption.id || '',
                vendor: '',
                vendorId: '',
                employeeId: '',
                employee_id: null,
                labourId: '',
                labour_id: null,
            }));
        } else if (selectedOption.type === 'Employee') {
            setFormData((prev) => ({
                ...prev,
                employeeId: selectedOption.id || '',
                employee_id: selectedOption.id || null,
                vendor: '',
                vendorId: '',
                contractor: '',
                contractorId: '',
                labourId: '',
                labour_id: null,
            }));
        } else if (selectedOption.type === 'Labour') {
            setFormData((prev) => ({
                ...prev,
                labourId: selectedOption.id || '',
                labour_id: selectedOption.id || null,
                vendor: '',
                vendorId: '',
                contractor: '',
                contractorId: '',
                employeeId: '',
                employee_id: null,
            }));
        }
    };
    const labourIdToName = React.useMemo(() => {
        const map = {};
        laboursList.forEach(option => {
            if (option.id) {
                // Store as both string and number to handle type mismatches
                map[option.id] = option.label;
                map[String(option.id)] = option.label;
                map[Number(option.id)] = option.label;
            }
        });
        return map;
    }, [laboursList]);
    const employeeIdToName = React.useMemo(() => {
        const map = {};
        employeeOptions.forEach(option => {
            if (option.id) {
                // Store as both string and number to handle type mismatches
                map[option.id] = option.label;
                map[String(option.id)] = option.label;
                map[Number(option.id)] = option.label;
            }
        });
        return map;
    }, [employeeOptions]);
    const getDisplaySiteName = (expense) => {
        if (expense.projectId && projectIdToName[expense.projectId]) {
            return projectIdToName[expense.projectId];
        }
        return expense.siteName || '';
    };
    const getDisplayVendorName = (expense) => {
        if (expense.vendorId && vendorIdToName[expense.vendorId]) {
            return vendorIdToName[expense.vendorId];
        }
        return expense.vendor || '';
    };
    const getDisplayContractorName = (expense) => {
        if (expense.contractorId && contractorIdToName[expense.contractorId]) {
            return contractorIdToName[expense.contractorId];
        }
        return expense.contractor || '';
    };
    const getBranchName = (id) =>
        branchOptions.find(b => String(b.id) === String(id))?.branch || "";
    const getDisplayStaffName = (expense) => {
        // Prioritize labour over employee
        // Check all possible field name variations
        const labourId = expense.labourId || expense.labour_id || expense.labourID || expense.labour_ID;
        const employeeId = expense.employeeId || expense.employee_id || expense.employeeID || expense.employee_ID;

        // Debug: log first expense with staff data to see what we're working with
        if ((labourId || employeeId) && !window.staffDebugLogged) {
            window.staffDebugLogged = true;
            console.log('Staff Debug - First expense with staff data:', {
                expenseId: expense.id,
                labourId,
                employeeId,
                labourIdType: typeof labourId,
                employeeIdType: typeof employeeId,
                labourIdToNameSample: Object.keys(labourIdToName).slice(0, 3),
                employeeIdToNameSample: Object.keys(employeeIdToName).slice(0, 3),
                allExpenseKeys: Object.keys(expense),
                expenseSample: Object.keys(expense).filter(k =>
                    k.toLowerCase().includes('labour') ||
                    k.toLowerCase().includes('employee') ||
                    k.toLowerCase().includes('staff')
                )
            });
        }
        if (labourId) {
            const labourName = labourIdToName[labourId] || labourIdToName[String(labourId)] || labourIdToName[Number(labourId)];
            if (labourName) {
                return labourName;
            }
        }
        if (employeeId) {
            const employeeName = employeeIdToName[employeeId] ||
                employeeIdToName[String(employeeId)] ||
                employeeIdToName[Number(employeeId)];
            if (employeeName) {
                return employeeName;
            }
        }
        return '';
    };
    const applyEditPopupMachineSelection = (machineToolsId, catalog = machineToolsCatalog, nameOptions = toolsItemNameOptions) => {
        if (machineToolsId == null || machineToolsId === '') {
            setEditPopupSelectedMachine(null);
            setEditPopupSelectedToolsItemName(null);
            return;
        }
        const machineOpt = catalog.find(
            (o) => o.id == machineToolsId || String(o.id) === String(machineToolsId)
        ) || null;
        setEditPopupSelectedMachine(machineOpt);
        if (!machineOpt) {
            setEditPopupSelectedToolsItemName(null);
            return;
        }
        const nameOpt = nameOptions.find(
            (o) => String(o.id) === String(machineOpt.item_name_id ?? '')
        ) || null;
        setEditPopupSelectedToolsItemName(nameOpt);
    };
    const handleEditClick = (expense) => {
        if (isAdvancePortalSourceExpense(expense)) {
            return;
        }
        setEditId(expense.id);
        setFormData({
            ...expense,
            paymentMode: expense.paymentMode || '',
            utilityType: expense.utilityType || '',
            utilityTypeNumber: expense.utilityTypeNumber || '',
            utilityForTheMonth: expense.utilityForTheMonth || '',
            utilityValidityDays: expense.utilityValidityDays || '',
            utilityValidityType: expense.utilityValidityType || '',
            serviceStartingDate: expense.serviceStartingDate || '',
            projectId: expense.projectId || '',
            vendorId: expense.vendorId || '',
            contractorId: expense.contractorId || '',
            billArrivalDate: expenseBillArrivalToInput(expense),
            billCopyUrl: expense.billCopyUrl || expense.billCopy || '',
            billCopy: expense.billCopy || expense.billCopyUrl || '',
        });
        applyEditPopupMachineSelection(expense.machineTools);
        setPendingBillCopyFile(null);
        if (billCopyFileInputRef.current) {
            billCopyFileInputRef.current.value = '';
        }
        setModalIsOpen(true);
    };
    const handleCancel = () => {
        setModalIsOpen(false);
        setEditPopupSelectedMachine(null);
        setEditPopupSelectedToolsItemName(null);
        setPendingBillCopyFile(null);
        if (billCopyFileInputRef.current) {
            billCopyFileInputRef.current.value = '';
        }
    };
    const clearFilters = () => {
        setSelectedSiteName('');
        setSelectedVendor('');
        setSelectedContractor('');
        setSelectedCategory('');
        setSelectedMachineTools('');
        setSelectedAccountType('');
        setSelectedSource('');
        setSelectedPaymentModes([]);
        setSelectedBranch('');
        setSelectedEnteredBy('');
        setStartDate('');
        setEndDate('');
        setSelectedEno('');
        setSelectedBillArrival('');
        setSelectedQuantity('');
        setSelectedAmount('');
        setSelectedDescription('');
        setSelectedServiceNumber('');
        setOverallSearch('');
        setFilteredExpenses(expenses);
        setCurrentPage(1);
        setSortField('');
        setSortDirection('asc');
        localStorage.removeItem('expenseFilter_siteName');
        localStorage.removeItem('expenseFilter_vendor');
        localStorage.removeItem('expenseFilter_contractor');
        localStorage.removeItem('expenseFilter_category');
        localStorage.removeItem('expenseFilter_machineTools');
        localStorage.removeItem('expenseFilter_accountType');
        localStorage.removeItem('expenseFilter_source');
        localStorage.removeItem('expenseFilter_paymentMode');
        localStorage.removeItem('expenseFilter_branch');
        localStorage.removeItem('expenseFilter_enteredBy');
        localStorage.removeItem('expenseFilter_date');
        localStorage.removeItem('expenseFilter_startDate');
        localStorage.removeItem('expenseFilter_endDate');
        localStorage.removeItem('expenseFilter_eno');
    };
    const exportToCSV = () => {
        if (!currentExportItems || currentExportItems.length === 0) {
            alert("No filtered data to export.");
            return;
        }
        const headers = [
            "Time stamp",
            "Date",
            "Project Name",
            "Vendor",
            "Contractor",
            "Quantity",
            "Amount",
            "Comments",
            "Category",
            "A/C Type",
            "Machine Tools",
            "E.No",
            "Attach file"
        ];
        const rows = currentExportItems.map(expense => [
            formatDate(expense.timestamp),
            formatDateOnly(expense.date),
            getDisplaySiteName(expense),
            getDisplayVendorName(expense),
            getDisplayContractorName(expense),
            expense.quantity,
            `${Number(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            expense.comments,
            expense.category,
            expense.accountType,
            getMachineToolsItemIdDisplay(expense.machineTools),
            expense.eno,
            expense.billCopy || ""
        ]);
        const csvContent = [headers, ...rows]
            .map(row => row.map(value => `"${value}"`).join(","))
            .join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "Expense_Report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const tableViewExpenseContext = useMemo(() => ({
        ...buildTableViewExpenseTableContext({
            fieldLabels: TABLE_VIEW_EXPENSE_FIELDS,
            currentItems,
            showFilters,
            filterRowRef,
            totalAmount,
            selectedQuantity,
            setSelectedQuantity,
            selectedAmount,
            setSelectedAmount,
            selectedDescription,
            setSelectedDescription,
            selectedServiceNumber,
            setSelectedServiceNumber,
            sortField,
            sortDirection,
            handleSort,
            startDate,
            setStartDate,
            endDate,
            setEndDate,
            showDateRangePicker,
            setShowDateRangePicker,
            siteOptions,
            selectedSiteName,
            setSelectedSiteName,
            vendorOptions,
            selectedVendor,
            setSelectedVendor,
            contractorOptions,
            selectedContractor,
            setSelectedContractor,
            categoryOptions,
            selectedCategory,
            setSelectedCategory,
            accountTypeOptions,
            selectedAccountType,
            setSelectedAccountType,
            machineToolsOptions,
            selectedMachineTools,
            setSelectedMachineTools,
            sourceOptions,
            selectedSource,
            setSelectedSource,
            branchFilterOptions,
            selectedBranch,
            setSelectedBranch,
            enteredByOptions,
            selectedEnteredBy,
            setSelectedEnteredBy,
            enoOptions,
            selectedEno,
            setSelectedEno,
            customStyles,
            formatDate,
            formatDateOnly,
            getDisplaySiteName,
            getDisplayVendorName,
            getDisplayContractorName,
            getDisplayStaffName,
            getMachineToolsItemIdDisplay,
            getBranchName,
            formatBillArrivalDisplay,
            handleEditClick,
            username,
            billArrivalFilterRef,
        }),
        paymentModeFilterOptions,
        selectedPaymentModes,
        setSelectedPaymentModes,
        selectedBillArrival,
        setSelectedBillArrival,
        setBillArrivalCalendarPos,
        setShowBillArrivalCalendar,
    }), [
        currentItems,
        showFilters,
        totalAmount,
        selectedQuantity,
        selectedAmount,
        selectedDescription,
        selectedServiceNumber,
        sortField,
        sortDirection,
        startDate,
        endDate,
        showDateRangePicker,
        siteOptions,
        selectedSiteName,
        vendorOptions,
        selectedVendor,
        contractorOptions,
        selectedContractor,
        categoryOptions,
        selectedCategory,
        accountTypeOptions,
        selectedAccountType,
        machineToolsOptions,
        selectedMachineTools,
        sourceOptions,
        selectedSource,
        paymentModeFilterOptions,
        selectedPaymentModes,
        branchFilterOptions,
        selectedBranch,
        enteredByOptions,
        selectedEnteredBy,
        enoOptions,
        selectedEno,
        selectedBillArrival,
    ]);
    return (
        <body className='bg-[#FAF6ED]'>
            <div className='flex flex-col h-[calc(100vh-104px)] overflow-hidden bg-[#FAF6ED]'>
                <div className='px-[18px] pt-[18px] pb-[18px] flex flex-col flex-1 min-h-0 overflow-hidden bg-[#FAF6ED]'>
                    <div className="w-full pt-[18px] px-[18px] bg-white rounded-[6px] flex flex-col flex-1 min-h-0 overflow-hidden">
                        {expensesLoading && expenses.length === 0 ? (
                            <div className="mb-[12px] flex items-center justify-center min-h-[80px] text-[16px] font-medium text-[#666666]">
                                Loading latest expenses...
                            </div>
                        ) : null}
                        <div className={`text-left flex ${selectedSiteName || selectedVendor || selectedContractor || selectedCategory || selectedAccountType || selectedMachineTools || hasEdbcPaymentModeFilter(selectedPaymentModes) || selectedSource || selectedBranch || selectedEnteredBy || startDate || endDate || selectedEno || selectedBillArrival || selectedQuantity.trim() || selectedAmount.trim() || selectedDescription.trim() || selectedServiceNumber.trim()
                            ? 'flex-col sm:flex-row sm:justify-between' : 'flex-row justify-between items-center'} mb-[12px] gap-[6px]`}>
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
                                {(selectedSiteName || selectedVendor || selectedContractor || selectedCategory || selectedAccountType || selectedMachineTools || hasEdbcPaymentModeFilter(selectedPaymentModes) || selectedSource || selectedBranch || selectedEnteredBy || startDate || endDate || selectedEno || selectedBillArrival || selectedQuantity.trim() || selectedAmount.trim() || selectedDescription.trim() || selectedServiceNumber.trim()) && (
                                    <div className="flex flex-row flex-wrap items-center gap-2 min-w-0">
                                        {startDate && endDate ? (
                                            <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 text-[16px] w-fit max-w-full min-w-0 overflow-hidden">
                                                <span className="font-semibold shrink-0 whitespace-nowrap">{TABLE_VIEW_EXPENSE_FIELDS.date}: </span>
                                                <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{startDate === endDate ? formatChipDateDMY(startDate) : `${formatChipDateDMY(startDate)} – ${formatChipDateDMY(endDate)}`}</span>
                                                <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-[#E4572E] ml-1 text-2xl">×</button>
                                            </span>
                                        ) : startDate ? (
                                            <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                                                <span className="font-semibold shrink-0 whitespace-nowrap">{TABLE_VIEW_EXPENSE_FIELDS.date}: </span>
                                                <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{formatChipDateDMY(startDate)} onwards</span>
                                                <button onClick={() => setStartDate('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                                            </span>
                                        ) : endDate ? (
                                            <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                                                <span className="font-semibold shrink-0 whitespace-nowrap">{TABLE_VIEW_EXPENSE_FIELDS.date} until: </span>
                                                <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{formatChipDateDMY(endDate)}</span>
                                                <button onClick={() => setEndDate('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                                            </span>
                                        ) : null}
                                        {selectedSiteName && (
                                            <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                                                <span className="font-semibold shrink-0 whitespace-nowrap">{TABLE_VIEW_EXPENSE_FIELDS.projectName}: </span>
                                                <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectedSiteName}</span>
                                                <button onClick={() => setSelectedSiteName('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedVendor && (
                                            <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                                                <span className="font-semibold shrink-0 whitespace-nowrap">{TABLE_VIEW_EXPENSE_FIELDS.vendorName}: </span>
                                                <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectedVendor}</span>
                                                <button onClick={() => setSelectedVendor('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedContractor && (
                                            <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                                                <span className="font-semibold shrink-0 whitespace-nowrap">Contractor Name: </span>
                                                <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectedContractor}</span>
                                                <button onClick={() => setSelectedContractor('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedCategory && (
                                            <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                                                <span className="font-semibold shrink-0 whitespace-nowrap">{TABLE_VIEW_EXPENSE_FIELDS.category}: </span>
                                                <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectedCategory}</span>
                                                <button onClick={() => setSelectedCategory('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedQuantity.trim() && (
                                            <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                                                <span className="font-semibold shrink-0 whitespace-nowrap">{TABLE_VIEW_EXPENSE_FIELDS.quantity}: </span>
                                                <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectedQuantity}</span>
                                                <button onClick={() => setSelectedQuantity('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedAmount.trim() && (
                                            <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                                                <span className="font-semibold shrink-0 whitespace-nowrap">{TABLE_VIEW_EXPENSE_FIELDS.amount}: </span>
                                                <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectedAmount}</span>
                                                <button onClick={() => setSelectedAmount('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedDescription.trim() && (
                                            <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                                                <span className="font-semibold shrink-0 whitespace-nowrap">{TABLE_VIEW_EXPENSE_FIELDS.description}: </span>
                                                <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectedDescription}</span>
                                                <button onClick={() => setSelectedDescription('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedAccountType && (
                                            <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                                                <span className="font-semibold shrink-0 whitespace-nowrap">{TABLE_VIEW_EXPENSE_FIELDS.accountType}: </span>
                                                <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectedAccountType}</span>
                                                <button onClick={() => setSelectedAccountType('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedServiceNumber.trim() && (
                                            <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                                                <span className="font-semibold shrink-0 whitespace-nowrap">{TABLE_VIEW_EXPENSE_FIELDS.serviceNumber}: </span>
                                                <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectedServiceNumber}</span>
                                                <button onClick={() => setSelectedServiceNumber('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        <EdbcPaymentModeFilterChip
                                            fieldLabel={TABLE_VIEW_EXPENSE_FIELDS.mode}
                                            selectedModes={selectedPaymentModes}
                                            blankValue={BLANK_VALUE}
                                            blankLabel={blankOption.label}
                                            onClear={() => setSelectedPaymentModes([])}
                                        />
                                        {selectedMachineTools && (
                                            <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                                                <span className="font-semibold shrink-0 whitespace-nowrap">{TABLE_VIEW_EXPENSE_FIELDS.machineTools}: </span>
                                                <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{getMachineToolsItemIdDisplay(selectedMachineTools)}</span>
                                                <button onClick={() => setSelectedMachineTools('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedSource && (
                                            <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                                                <span className="font-semibold shrink-0 whitespace-nowrap">{TABLE_VIEW_EXPENSE_FIELDS.sourceFrom}: </span>
                                                <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectedSource}</span>
                                                <button onClick={() => setSelectedSource('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedBranch && (
                                            <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                                                <span className="font-semibold shrink-0 whitespace-nowrap">{TABLE_VIEW_EXPENSE_FIELDS.branch}: </span>
                                                <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{getBranchName(selectedBranch) || selectedBranch}</span>
                                                <button onClick={() => setSelectedBranch('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedEnteredBy && (
                                            <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                                                <span className="font-semibold shrink-0 whitespace-nowrap">{TABLE_VIEW_EXPENSE_FIELDS.enteredBy}: </span>
                                                <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectedEnteredBy === BLANK_VALUE ? BLANK_LABEL : selectedEnteredBy}</span>
                                                <button onClick={() => setSelectedEnteredBy('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedEno && (
                                            <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                                                <span className="font-semibold shrink-0 whitespace-nowrap">{TABLE_VIEW_EXPENSE_FIELDS.entryNo}: </span>
                                                <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{selectedEno}</span>
                                                <button onClick={() => setSelectedEno('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedBillArrival && (
                                            <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#BF9853] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm w-fit max-w-full min-w-0 overflow-hidden">
                                                <span className="font-semibold shrink-0 whitespace-nowrap">Bill Arrival: </span>
                                                <span className="font-semibold text-[14px] text-[#000000] truncate min-w-0">{formatChipDateDMY(selectedBillArrival)}</span>
                                                <button onClick={() => setSelectedBillArrival('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <EdbcTableToolbarRightActions
                                onClearFilters={clearFilters}
                                overallSearch={overallSearch}
                                onOverallSearchChange={setOverallSearch}
                                searchPlaceholder={TABLE_VIEW_EXPENSE_FIELDS.searchTransactions}
                                showExportIcons
                                onExportPdf={generateFilteredPDF}
                                onExportCsv={exportToCSV}
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
                                <TableProvider value={tableViewExpenseContext}>
                                    <Table
                                        showTimestampColumn={false}
                                        showActivityColumn
                                        showServiceNumberColumn
                                        editOnlyActivityColumn
                                        tableClassName="min-w-[2836px]"
                                    />
                                </TableProvider>
                            </div>
                            <div className="flex shrink-0 items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-700">Items per page:</span>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
                                    >
                                        <option value={16}>16</option>
                                        <option value={25}>25</option>
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
                                        Showing {startIndex + 1} to {Math.min(endIndex, sortedExpenses.length)} of {sortedExpenses.length} entries
                                        {expensesLoadingMore ? ' (loading older records...)' : ''}
                                        {!expensesLoadingMore && expensesTotalCount != null && expensesTotalCount > sortedExpenses.length
                                            ? ` / ${expensesTotalCount} total`
                                            : ''}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => setCurrentPage(currentPage - 1)}
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
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
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
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#BF9853] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                            <Modal
                                isOpen={modalIsOpen}
                                onRequestClose={handleCancel}
                                contentLabel={getEditPopupHeading(formData.source, 'Edit Expense')}
                                className="fixed inset-0 flex items-center justify-center p-4 bg-gray-800 bg-opacity-50 z-[9999]"
                                overlayClassName="fixed inset-0 z-[9999]">
                                <div className="bg-white text-left p-6 rounded-lg shadow-lg w-full max-w-2xl">
                                    <div className="flex justify-between items-center mb-[12px]">
                                        <h2 className="text-xl font-bold">{getEditPopupHeading(formData.source, 'Edit Expense')}</h2>
                                        <span className="text-[16px] font-semibold text-[#E4572E]"> {formData.eno}</span>
                                    </div>
                                    <form className="flex flex-col gap-[12px]">
                                        <div className="flex gap-[16px] flex-wrap items-start">
                                        <div className="text-left w-[300px] min-w-[300px] max-w-[300px] shrink-0">
                                            <label className="block text-black font-semibold mb-[8px] text-left">Account Type<span className="text-[#E4572E]">*</span></label>
                                            <div className="w-[300px]">
                                            <Select
                                                name="accountType"
                                                value={editAccountTypeOptions.find(option => option.value === formData.accountType) || null}
                                                onChange={(selectedOption) => {
                                                    const nextAccountType = selectedOption?.value || '';
                                                    if (nextAccountType !== 'Sundry Payment') {
                                                        setEditPopupSelectedToolsItemName(null);
                                                        setEditPopupSelectedMachine(null);
                                                    }
                                                    setFormData((prev) => {
                                                        const parsed = parseFloat(String(prev.amount ?? '').replace(/,/g, ''));
                                                        const hasAmount = prev.amount !== '' && prev.amount != null && !Number.isNaN(parsed);
                                                        let nextAmount = prev.amount;
                                                        if (hasAmount) {
                                                            if (nextAccountType === 'Bill Refund') {
                                                                nextAmount = String(-Math.abs(parsed));
                                                            } else if (prev.accountType === 'Bill Refund') {
                                                                nextAmount = String(Math.abs(parsed));
                                                            }
                                                        }
                                                        return {
                                                            ...prev,
                                                            accountType: nextAccountType,
                                                            amount: nextAmount,
                                                        };
                                                    });
                                                }}
                                                options={editAccountTypeOptions}
                                                placeholder="Select"
                                                isClearable
                                                components={EDIT_POPUP_SELECT_INDICATOR_COMPONENTS}
                                                className={EDIT_POPUP_SELECT_CLASSNAME}
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        fontWeight: 600,
                                                        borderColor: 'rgba(191, 152, 83, 0.2)',
                                                        borderWidth: '2px',
                                                        borderRadius: '0.5rem',
                                                        height: '40px',
                                                        minHeight: '40px',
                                                        alignItems: 'center',
                                                        paddingTop: 0,
                                                        paddingBottom: 0,
                                                        textAlign: 'left',
                                                        boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.4)' : 'none',
                                                        '&:hover': {
                                                            borderColor: 'rgba(191, 152, 83, 0.4)',
                                                        },
                                                    }),
                                                    valueContainer: (base) => ({
                                                        ...base,
                                                        alignItems: 'center',
                                                        paddingTop: 0,
                                                        paddingBottom: 0,
                                                    }),
                                                    indicatorsContainer: (base) => ({
                                                        ...base,
                                                        alignItems: 'center',
                                                    }),
                                                    indicatorSeparator: () => ({
                                                        display: 'none',
                                                    }),
                                                    placeholder: (base) => ({
                                                        ...base,
                                                        fontWeight: 'normal',
                                                        color: '#6B7280',
                                                        textAlign: 'left',
                                                    }),
                                                    option: (provided, state) => ({
                                                        ...provided,
                                                        textAlign: 'left',
                                                        fontWeight: 600,
                                                        fontSize: '15px',
                                                        backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                        color: 'black',
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        color: '#111827',
                                                        fontWeight: 600,
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
                                                        zIndex: 999,
                                                    }),
                                                    menuList: (base) => ({
                                                        ...base,
                                                        scrollbarWidth: 'none',
                                                        msOverflowStyle: 'none',
                                                        '&::-webkit-scrollbar': { display: 'none' },
                                                    }),
                                                }}
                                                menuPlacement="bottom"
                                                menuPosition="absolute"
                                            />
                                            </div>
                                            {formData.accountType === 'Utility Bills' && (
                                                <div className="mt-[12px]">
                                                    <label className="block text-black font-semibold mb-[8px] text-left">Utility Type<span className="text-[#E4572E]">*</span></label>
                                                    <div className="w-[616px]">
                                                    <Select
                                                        name="utilityType"
                                                        options={EDIT_POPUP_UTILITY_TYPE_OPTIONS}
                                                        value={EDIT_POPUP_UTILITY_TYPE_OPTIONS.find((o) => o.value === formData.utilityType) || null}
                                                        onChange={(selectedOption) =>
                                                            setFormData({
                                                                ...formData,
                                                                utilityType: selectedOption?.value || '',
                                                            })
                                                        }
                                                        placeholder="--- Select ---"
                                                        isClearable
                                                        isSearchable
                                                        components={EDIT_POPUP_SELECT_INDICATOR_COMPONENTS}
                                                        className={EDIT_POPUP_SELECT_CLASSNAME}
                                                        styles={{
                                                            control: (base, state) => ({
                                                                ...base,
                                                                fontWeight: 600,
                                                                borderColor: 'rgba(191, 152, 83, 0.2)',
                                                                borderWidth: '2px',
                                                                borderRadius: '0.5rem',
                                                                height: '40px',
                                                                minHeight: '40px',
                                                                alignItems: 'center',
                                                                paddingTop: 0,
                                                                paddingBottom: 0,
                                                                textAlign: 'left',
                                                                boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.4)' : 'none',
                                                                '&:hover': {
                                                                    borderColor: 'rgba(191, 152, 83, 0.4)',
                                                                },
                                                            }),
                                                            valueContainer: (base) => ({
                                                                ...base,
                                                                alignItems: 'center',
                                                                paddingTop: 0,
                                                                paddingBottom: 0,
                                                            }),
                                                            indicatorsContainer: (base) => ({
                                                                ...base,
                                                                alignItems: 'center',
                                                            }),
                                                            indicatorSeparator: () => ({
                                                                display: 'none',
                                                            }),
                                                            placeholder: (base) => ({
                                                                ...base,
                                                                fontWeight: 'normal',
                                                                color: '#6B7280',
                                                                textAlign: 'left',
                                                            }),
                                                            option: (provided, state) => ({
                                                                ...provided,
                                                                textAlign: 'left',
                                                                fontWeight: 600,
                                                                fontSize: '15px',
                                                                backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                                color: 'black',
                                                            }),
                                                            singleValue: (base) => ({
                                                                ...base,
                                                                color: '#111827',
                                                                fontWeight: 600,
                                                            }),
                                                            menu: (base) => ({
                                                                ...base,
                                                                zIndex: 999,
                                                            }),
                                                            menuList: (base) => ({
                                                                ...base,
                                                                scrollbarWidth: 'none',
                                                                msOverflowStyle: 'none',
                                                                '&::-webkit-scrollbar': { display: 'none' },
                                                            }),
                                                        }}
                                                        menuPlacement="bottom"
                                                        menuPosition="absolute"
                                                    />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-left w-[300px]">
                                            <label className="block text-black font-semibold mb-[8px] text-left">Date<span className="text-[#E4572E]">*</span></label>
                                            <div className="w-[300px]">
                                                <CustomDateField
                                                    value={formData.date}
                                                    onChange={(v) => {
                                                        if (!v) return;
                                                        setFormData((prev) => ({ ...prev, date: v }));
                                                    }}
                                                    placeholder="Date"
                                                    alwaysOpenBelow
                                                    controlHeightPx={40}
                                                    className="w-full [&>div]:!w-full [&>div]:!max-w-full [&>div]:!border-2 [&>div]:!border-[rgba(191,152,83,0.2)] [&>div]:!rounded-lg [&>div]:!shadow-none [&>div:hover]:!border-[rgba(191,152,83,0.4)] [&>div:focus-within]:!outline-none [&>div:focus-within]:!ring-0 [&>div:focus-within]:!shadow-[0_0_0_1px_rgba(191,152,83,0.4)] [&>button]:!font-semibold"
                                                />
                                            </div>
                                        </div>
                                        </div>
                                        <div className="flex gap-[16px]">
                                        <div className="text-left w-[300px]">
                                            <label className="block text-black font-semibold mb-[8px] text-left">Project Name<span className="text-[#E4572E]">*</span></label>
                                            <div className="w-[300px]">
                                            <Select
                                                name="siteName"
                                                value={editPopupSiteOptions.find(option => option.value === formData.siteName)}
                                                onChange={(selectedOption) =>
                                                    setFormData({
                                                        ...formData,
                                                        siteName: selectedOption?.value || '',
                                                        projectId: selectedOption?.id || ''
                                                    })
                                                }
                                                options={editPopupSiteOptions}
                                                placeholder="Select Site"
                                                isClearable
                                                components={EDIT_POPUP_SELECT_INDICATOR_COMPONENTS}
                                                className={EDIT_POPUP_SELECT_CLASSNAME}
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        fontWeight: 600,
                                                        borderColor: 'rgba(191, 152, 83, 0.2)',
                                                        borderWidth: '2px',
                                                        borderRadius: '0.5rem',
                                                        height: '40px',
                                                        minHeight: '40px',
                                                        alignItems: 'center',
                                                        paddingTop: 0,
                                                        paddingBottom: 0,
                                                        textAlign: 'left',
                                                        boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.4)' : 'none',
                                                        '&:hover': {
                                                            borderColor: 'rgba(191, 152, 83, 0.4)',
                                                        },
                                                    }),
                                                    valueContainer: (base) => ({
                                                        ...base,
                                                        alignItems: 'center',
                                                        paddingTop: 0,
                                                        paddingBottom: 0,
                                                    }),
                                                    indicatorsContainer: (base) => ({
                                                        ...base,
                                                        alignItems: 'center',
                                                    }),
                                                    indicatorSeparator: () => ({
                                                        display: 'none',
                                                    }),
                                                    placeholder: (base) => ({
                                                        ...base,
                                                        fontWeight: 'normal',
                                                        color: '#6B7280',
                                                        textAlign: 'left',
                                                    }),
                                                    option: (provided, state) => ({
                                                        ...provided,
                                                        textAlign: 'left',
                                                        fontWeight: 600,
                                                        fontSize: '15px',
                                                        backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                        color: 'black',
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        color: '#111827',
                                                        fontWeight: 600,
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
                                                        zIndex: 999,
                                                    }),
                                                    menuList: (base) => ({
                                                        ...base,
                                                        scrollbarWidth: 'none',
                                                        msOverflowStyle: 'none',
                                                        '&::-webkit-scrollbar': { display: 'none' },
                                                    }),
                                                }}
                                                menuPlacement="bottom"
                                                menuPosition="absolute"
                                            />
                                            </div>
                                        </div>
                                        <div className="text-left w-[300px]">
                                            <div className="flex justify-between mb-[8px]">
                                                <label className="block text-black font-semibold text-left">Associate Name<span className="text-[#E4572E]">*</span></label>
                                                {editPopupVendorContractorType && (
                                                    <span className="text-[14px] text-[#E4572E] font-semibold">{editPopupVendorContractorType}</span>
                                                )}
                                            </div>
                                            <div className="w-[300px]">
                                            <Select
                                                name="vendorContractor"
                                                options={editPopupCombinedVendorContractorOptions}
                                                value={editPopupSelectedVendorContractor}
                                                onChange={handleEditPopupVendorContractorChange}
                                                isClearable
                                                isSearchable
                                                components={EDIT_POPUP_SELECT_INDICATOR_COMPONENTS}
                                                className={EDIT_POPUP_SELECT_CLASSNAME}
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        fontWeight: 600,
                                                        borderColor: 'rgba(191, 152, 83, 0.2)',
                                                        borderWidth: '2px',
                                                        borderRadius: '0.5rem',
                                                        height: '40px',
                                                        minHeight: '40px',
                                                        alignItems: 'center',
                                                        paddingTop: 0,
                                                        paddingBottom: 0,
                                                        textAlign: 'left',
                                                        boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.4)' : 'none',
                                                        '&:hover': {
                                                            borderColor: 'rgba(191, 152, 83, 0.4)',
                                                        },
                                                    }),
                                                    valueContainer: (base) => ({
                                                        ...base,
                                                        alignItems: 'center',
                                                        paddingTop: 0,
                                                        paddingBottom: 0,
                                                        flexWrap: 'nowrap',
                                                        overflow: 'hidden',
                                                    }),
                                                    indicatorsContainer: (base) => ({
                                                        ...base,
                                                        alignItems: 'center',
                                                    }),
                                                    indicatorSeparator: () => ({
                                                        display: 'none',
                                                    }),
                                                    placeholder: (base) => ({
                                                        ...base,
                                                        fontWeight: 'normal',
                                                        color: '#6B7280',
                                                        textAlign: 'left',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        maxWidth: '100%',
                                                    }),
                                                    option: (provided, state) => ({
                                                        ...provided,
                                                        textAlign: 'left',
                                                        fontWeight: 600,
                                                        fontSize: '15px',
                                                        backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                        color: 'black',
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        color: '#111827',
                                                        fontWeight: 600,
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
                                                        zIndex: 999,
                                                    }),
                                                    menuList: (base) => ({
                                                        ...base,
                                                        scrollbarWidth: 'none',
                                                        msOverflowStyle: 'none',
                                                        '&::-webkit-scrollbar': { display: 'none' },
                                                    }),
                                                }}
                                                placeholder="Vendor/Contractor/Employee/Labour"
                                            />
                                            </div>
                                        </div>
                                        </div>
                                        <div className="flex gap-[16px]">
                                        <div className="text-left w-[300px]">
                                            <label className="block text-black font-semibold mb-[8px] text-left">Quantity</label>
                                            <input
                                                type="text"
                                                name="quantity"
                                                value={formData.quantity}
                                                onChange={handleChange}
                                                placeholder="Quantity"
                                                className="w-[300px] h-[40px] text-[14px] py-0 px-2 box-border border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)] hover:border-opacity-[0.40] font-semibold placeholder:font-normal"
                                            />
                                        </div>
                                        <div className="text-left w-[300px] relative">
                                            <label className="block text-black font-semibold mb-[8px] text-left">Amount<span className="text-[#E4572E]">*</span></label>
                                            <span className="absolute top-[40px] left-3 text-gray-600 font-normal">₹</span>
                                            <input
                                                type="text"
                                                name="amount"
                                                value={formData.amount}
                                                onChange={handleChange}
                                                placeholder="Amount"
                                                className="w-[300px] h-[40px] text-[14px] py-0 px-2 pl-6 box-border border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)] hover:border-opacity-[0.40] font-semibold placeholder:font-normal"
                                                onWheel={(e) => e.target.blur()}
                                            />
                                        </div>
                                        </div>
                                        <div className="flex gap-[16px]">
                                        <div className="text-left w-[300px]">
                                            <label className="block text-black font-semibold mb-[8px] text-left">Category<span className="text-[#E4572E]">*</span></label>
                                            <div className="w-[300px]">
                                            <Select
                                                name="category"
                                                value={categoryOption.find(option => option.value === formData.category)}
                                                onChange={(selectedOption) => {
                                                    const newCategory = selectedOption?.value || '';
                                                    if (newCategory !== 'Machine Repair') {
                                                        setEditPopupSelectedToolsItemName(null);
                                                        setEditPopupSelectedMachine(null);
                                                    }
                                                    setFormData({
                                                        ...formData,
                                                        category: newCategory,
                                                        machineTools: newCategory === 'Machine Repair' ? formData.machineTools : null,
                                                    });
                                                }}
                                                options={editPopupCategoryOptions}
                                                placeholder="Select Category"
                                                isClearable
                                                components={EDIT_POPUP_SELECT_INDICATOR_COMPONENTS}
                                                className={EDIT_POPUP_SELECT_CLASSNAME}
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        fontWeight: 600,
                                                        borderColor: 'rgba(191, 152, 83, 0.2)',
                                                        borderWidth: '2px',
                                                        borderRadius: '0.5rem',
                                                        height: '40px',
                                                        minHeight: '40px',
                                                        alignItems: 'center',
                                                        paddingTop: 0,
                                                        paddingBottom: 0,
                                                        textAlign: 'left',
                                                        boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.4)' : 'none',
                                                        '&:hover': {
                                                            borderColor: 'rgba(191, 152, 83, 0.4)',
                                                        },
                                                    }),
                                                    valueContainer: (base) => ({
                                                        ...base,
                                                        alignItems: 'center',
                                                        paddingTop: 0,
                                                        paddingBottom: 0,
                                                    }),
                                                    indicatorsContainer: (base) => ({
                                                        ...base,
                                                        alignItems: 'center',
                                                    }),
                                                    indicatorSeparator: () => ({
                                                        display: 'none',
                                                    }),
                                                    placeholder: (base) => ({
                                                        ...base,
                                                        fontWeight: 'normal',
                                                        color: '#6B7280',
                                                        textAlign: 'left',
                                                    }),
                                                    option: (provided, state) => ({
                                                        ...provided,
                                                        textAlign: 'left',
                                                        fontWeight: 600,
                                                        fontSize: '15px',
                                                        backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                        color: 'black',
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        color: '#111827',
                                                        fontWeight: 600,
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
                                                        zIndex: 999,
                                                    }),
                                                    menuList: (base) => ({
                                                        ...base,
                                                        scrollbarWidth: 'none',
                                                        msOverflowStyle: 'none',
                                                        '&::-webkit-scrollbar': { display: 'none' },
                                                    }),
                                                }}
                                                menuPlacement="bottom"
                                                menuPosition="absolute"
                                            />
                                            </div>
                                        </div>
                                        {(formData.accountType === 'Bill Payments' || formData.accountType === 'Bill Refund' || formData.accountType === 'Bill Payments + Claim') && (
                                            <div className="text-left w-[300px]">
                                                <label className="block text-black font-semibold mb-[8px] text-left">Bill Arrival Date</label>
                                                <div className="w-[300px]">
                                                    <CustomDateField
                                                        value={formData.billArrivalDate || ''}
                                                        onChange={(v) => setFormData((prev) => ({ ...prev, billArrivalDate: v }))}
                                                        placeholder="Bill Arrival Date"
                                                        controlHeightPx={40}
                                                        alwaysOpenBelow
                                                        className="w-full [&>div]:!w-full [&>div]:!max-w-full [&>div]:!border-2 [&>div]:!border-[rgba(191,152,83,0.2)] [&>div]:!rounded-lg [&>div]:!shadow-none [&>div:hover]:!border-[rgba(191,152,83,0.4)] [&>div:focus-within]:!outline-none [&>div:focus-within]:!ring-0 [&>div:focus-within]:!shadow-[0_0_0_1px_rgba(191,152,83,0.4)] [&>button]:!font-semibold"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {(formData.accountType === 'Claim Payment' || formData.accountType === 'Utility Bills' || formData.accountType === 'Sundry Payment') && (
                                            <div className="text-left w-[300px]">
                                                <label className="block text-black font-semibold mb-[8px] text-left">Payment Mode<span className="text-[#E4572E]">*</span></label>
                                                <div className="w-[300px]">
                                                <Select
                                                    name="paymentMode"
                                                    options={editPopupSelectablePaymentModeOptions.map((mode) => ({
                                                        value: mode.modeOfPayment,
                                                        label: mode.modeOfPayment,
                                                    }))}
                                                    value={
                                                        editPopupSelectablePaymentModeOptions
                                                            .map((mode) => ({
                                                                value: mode.modeOfPayment,
                                                                label: mode.modeOfPayment,
                                                            }))
                                                            .find((o) => o.value === formData.paymentMode) || null
                                                    }
                                                    onChange={(selectedOption) =>
                                                        setFormData({
                                                            ...formData,
                                                            paymentMode: selectedOption?.value || '',
                                                        })
                                                    }
                                                    placeholder="Select Payment Mode"
                                                    isClearable
                                                    components={EDIT_POPUP_SELECT_INDICATOR_COMPONENTS}
                                                    className={EDIT_POPUP_SELECT_CLASSNAME}
                                                    maxMenuHeight={200}
                                                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                    styles={{
                                                        control: (base, state) => ({
                                                            ...base,
                                                            fontWeight: 600,
                                                            borderColor: 'rgba(191, 152, 83, 0.2)',
                                                            borderWidth: '2px',
                                                            borderRadius: '0.5rem',
                                                            height: '40px',
                                                            minHeight: '40px',
                                                            alignItems: 'center',
                                                            paddingTop: 0,
                                                            paddingBottom: 0,
                                                            textAlign: 'left',
                                                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.4)' : 'none',
                                                            '&:hover': {
                                                                borderColor: 'rgba(191, 152, 83, 0.4)',
                                                            },
                                                        }),
                                                        valueContainer: (base) => ({
                                                            ...base,
                                                            alignItems: 'center',
                                                            paddingTop: 0,
                                                            paddingBottom: 0,
                                                        }),
                                                        indicatorsContainer: (base) => ({
                                                            ...base,
                                                            alignItems: 'center',
                                                        }),
                                                        indicatorSeparator: () => ({
                                                            display: 'none',
                                                        }),
                                                        placeholder: (base) => ({
                                                            ...base,
                                                            fontWeight: 'normal',
                                                            color: '#6B7280',
                                                            textAlign: 'left',
                                                        }),
                                                        option: (provided, state) => ({
                                                            ...provided,
                                                            textAlign: 'left',
                                                            fontWeight: 600,
                                                            fontSize: '15px',
                                                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                            color: 'black',
                                                        }),
                                                        singleValue: (base) => ({
                                                            ...base,
                                                            color: '#111827',
                                                            fontWeight: 600,
                                                        }),
                                                        menuPortal: (base) => ({
                                                            ...base,
                                                            zIndex: 10001,
                                                        }),
                                                        menu: (base) => ({
                                                            ...base,
                                                            zIndex: 999,
                                                        }),
                                                        menuList: (base) => ({
                                                            ...base,
                                                            scrollbarWidth: 'none',
                                                            msOverflowStyle: 'none',
                                                            '&::-webkit-scrollbar': { display: 'none' },
                                                        }),
                                                    }}
                                                    menuPlacement="bottom"
                                                    menuPosition="fixed"
                                                />
                                                </div>
                                            </div>
                                        )}
                                        </div>
                                        {formData.accountType === 'Sundry Payment' && formData.category === 'Machine Repair' && (
                                            <div className="flex gap-[16px]">
                                                <div className="text-left w-[300px]">
                                                    <label className="block text-black font-semibold mb-[8px] text-left">{TABLE_VIEW_EXPENSE_FIELDS.machineName}<span className="text-[#E4572E]">*</span></label>
                                                    <div className="w-[300px]">
                                                        <Select
                                                            options={toolsItemNameOptions}
                                                            value={editPopupSelectedToolsItemName}
                                                            onChange={setEditPopupSelectedToolsItemName}
                                                            placeholder={TABLE_VIEW_EXPENSE_FIELDS.machineName}
                                                            isClearable
                                                            isSearchable
                                                            components={EDIT_POPUP_SELECT_INDICATOR_COMPONENTS}
                                                            className={EDIT_POPUP_SELECT_CLASSNAME}
                                                            styles={EDIT_POPUP_MACHINE_SELECT_STYLES}
                                                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                            menuPlacement="bottom"
                                                            menuPosition="fixed"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="text-left w-[300px]">
                                                    <label className="block text-black font-semibold mb-[8px] text-left">{TABLE_VIEW_EXPENSE_FIELDS.machineId}<span className="text-[#E4572E]">*</span></label>
                                                    <div className="w-[300px]">
                                                        <Select
                                                            options={editPopupFilteredMachineOptions}
                                                            value={editPopupSelectedMachine}
                                                            onChange={setEditPopupSelectedMachine}
                                                            placeholder={
                                                                !editPopupSelectedToolsItemName
                                                                    ? TABLE_VIEW_EXPENSE_FIELDS.machineId
                                                                    : editPopupFilteredMachineOptions.length === 0
                                                                        ? 'No IDs for this machine'
                                                                        : TABLE_VIEW_EXPENSE_FIELDS.machineId
                                                            }
                                                            isClearable
                                                            isSearchable
                                                            components={EDIT_POPUP_SELECT_INDICATOR_COMPONENTS}
                                                            className={EDIT_POPUP_SELECT_CLASSNAME}
                                                            styles={EDIT_POPUP_MACHINE_SELECT_STYLES}
                                                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                            menuPlacement="bottom"
                                                            menuPosition="fixed"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {formData.accountType === 'Utility Bills' && (
                                            <>
                                                <div className="flex gap-[16px]">
                                                <div className={formData.utilityType === 'Telecom' || formData.utilityType === 'Subscription' ? 'w-[616px]' : 'w-[300px]'}>
                                                    <label className="block text-black font-semibold mb-[8px] text-left">
                                                        {getUtilityTypeNumberLabel(formData.utilityType)}
                                                    </label>
                                                    <Select
                                                        options={ebNumberOptions}
                                                        value={selectedEbNumber}
                                                        onChange={(opt) => {
                                                            setSelectedEbNumber(opt);
                                                            setFormData((prev) => ({ ...prev, utilityTypeNumber: opt?.label || "" }));
                                                        }}
                                                        isClearable
                                                        components={EDIT_POPUP_SELECT_INDICATOR_COMPONENTS}
                                                        className={EDIT_POPUP_SELECT_CLASSNAME}
                                                        placeholder={getUtilityTypeNumberLabel(formData.utilityType)}
                                                        styles={{
                                                            ...customStyles,
                                                            control: (base, state) => ({
                                                                ...(typeof customStyles.control === 'function' ? customStyles.control(base, state) : base),
                                                                fontWeight: 600,
                                                                borderColor: 'rgba(191, 152, 83, 0.2)',
                                                                borderWidth: '2px',
                                                                borderRadius: '0.5rem',
                                                                height: '40px',
                                                                minHeight: '40px',
                                                                alignItems: 'center',
                                                                paddingTop: 0,
                                                                paddingBottom: 0,
                                                                textAlign: 'left',
                                                                boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.4)' : 'none',
                                                                '&:hover': {
                                                                    borderColor: 'rgba(191, 152, 83, 0.4)',
                                                                },
                                                            }),
                                                            valueContainer: (base) => ({
                                                                ...(typeof customStyles.valueContainer === 'function' ? customStyles.valueContainer(base) : base),
                                                                alignItems: 'center',
                                                                paddingTop: 0,
                                                                paddingBottom: 0,
                                                            }),
                                                            indicatorsContainer: (base) => ({
                                                                ...(typeof customStyles.indicatorsContainer === 'function' ? customStyles.indicatorsContainer(base) : base),
                                                                alignItems: 'center',
                                                            }),
                                                            indicatorSeparator: () => ({
                                                                display: 'none',
                                                            }),
                                                            option: (provided, state) => ({
                                                                ...(typeof customStyles.option === 'function' ? customStyles.option(provided, state) : provided),
                                                                fontWeight: 600,
                                                            }),
                                                            singleValue: (provided) => ({
                                                                ...(typeof customStyles.singleValue === 'function' ? customStyles.singleValue(provided) : provided),
                                                                fontWeight: 600,
                                                            }),
                                                            menuList: (base) => ({
                                                                ...(typeof customStyles.menuList === 'function' ? customStyles.menuList(base) : base),
                                                                scrollbarWidth: 'none',
                                                                msOverflowStyle: 'none',
                                                                '&::-webkit-scrollbar': { display: 'none' },
                                                            }),
                                                        }}
                                                        menuPlacement="bottom"
                                                        menuPosition="absolute"
                                                    />
                                                </div>
                                                {formData.utilityType !== 'Telecom' && formData.utilityType !== 'Subscription' && (
                                                <div className="w-[300px]">
                                                    <label className="block text-black font-semibold mb-[8px] text-left">For The Month Of</label>
                                                    <div className="w-[300px]">
                                                        <CustomMonthField
                                                            value={formData.utilityForTheMonth}
                                                            onChange={(v) => setFormData((prev) => ({ ...prev, utilityForTheMonth: v }))}
                                                            placeholder="For The Month Of"
                                                            className="w-full"
                                                            alwaysOpenAbove
                                                        />
                                                    </div>
                                                </div>
                                                )}
                                                </div>
                                                {(formData.utilityType === 'Telecom' || formData.utilityType === 'Subscription') && (
                                                    <div className="flex gap-[16px] items-end">
                                                        <div className="w-[300px]">
                                                            <label className="block text-black font-semibold mb-[8px] text-left">Validity Duration<span className="text-[#E4572E]">*</span></label>
                                                            <div className="flex gap-2 w-[300px]">
                                                            <input
                                                                type="text"
                                                                name="utilityValidityDays"
                                                                value={formData.utilityValidityDays}
                                                                onChange={handleChange}
                                                                placeholder="Validity Duration"
                                                                className="min-w-0 flex-1 h-[40px] text-[14px] py-0 px-2 box-border border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)] hover:border-opacity-[0.40] font-semibold placeholder:font-normal"
                                                            />
                                                            <div className="w-[110px]">
                                                            <Select
                                                                name="utilityValidityType"
                                                                options={EDIT_POPUP_VALIDITY_TYPE_OPTIONS}
                                                                value={EDIT_POPUP_VALIDITY_TYPE_OPTIONS.find((o) => o.value === formData.utilityValidityType) || null}
                                                                onChange={(selectedOption) =>
                                                                    setFormData({
                                                                        ...formData,
                                                                        utilityValidityType: selectedOption?.value || '',
                                                                    })
                                                                }
                                                                placeholder="Validity Type"
                                                                isClearable
                                                                isSearchable
                                                                components={EDIT_POPUP_SELECT_INDICATOR_COMPONENTS}
                                                                className={EDIT_POPUP_SELECT_CLASSNAME}
                                                                styles={{
                                                                    control: (base, state) => ({
                                                                        ...base,
                                                                        fontWeight: 600,
                                                                        borderColor: 'rgba(191, 152, 83, 0.2)',
                                                                        borderWidth: '2px',
                                                                        borderRadius: '0.5rem',
                                                                        height: '40px',
                                                                        minHeight: '40px',
                                                                        alignItems: 'center',
                                                                        paddingTop: 0,
                                                                        paddingBottom: 0,
                                                                        textAlign: 'left',
                                                                        boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.4)' : 'none',
                                                                        '&:hover': {
                                                                            borderColor: 'rgba(191, 152, 83, 0.4)',
                                                                        },
                                                                    }),
                                                                    valueContainer: (base) => ({
                                                                        ...base,
                                                                        alignItems: 'center',
                                                                        paddingTop: 0,
                                                                        paddingBottom: 0,
                                                                    }),
                                                                    indicatorsContainer: (base) => ({
                                                                        ...base,
                                                                        alignItems: 'center',
                                                                    }),
                                                                    indicatorSeparator: () => ({
                                                                        display: 'none',
                                                                    }),
                                                                    placeholder: (base) => ({
                                                                        ...base,
                                                                        fontWeight: 'normal',
                                                                        color: '#6B7280',
                                                                        textAlign: 'left',
                                                                    }),
                                                                    option: (provided, state) => ({
                                                                        ...provided,
                                                                        textAlign: 'left',
                                                                        fontWeight: 600,
                                                                        fontSize: '15px',
                                                                        backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                                        color: 'black',
                                                                    }),
                                                                    singleValue: (base) => ({
                                                                        ...base,
                                                                        color: '#111827',
                                                                        fontWeight: 600,
                                                                    }),
                                                                    menu: (base) => ({
                                                                        ...base,
                                                                        zIndex: 999,
                                                                    }),
                                                                    menuList: (base) => ({
                                                                        ...base,
                                                                        scrollbarWidth: 'none',
                                                                        msOverflowStyle: 'none',
                                                                        '&::-webkit-scrollbar': { display: 'none' },
                                                                    }),
                                                                }}
                                                                menuPlacement="bottom"
                                                                menuPosition="absolute"
                                                            />
                                                            </div>
                                                            </div>
                                                        </div>
                                                        <div className="w-[300px]">
                                                            <label className="block text-black font-semibold mb-[8px] text-left">Activation Date<span className="text-[#E4572E]">*</span></label>
                                                            <div className="w-[300px]">
                                                                <CustomDateField
                                                                    value={formData.serviceStartingDate}
                                                                    onChange={(v) => setFormData((prev) => ({ ...prev, serviceStartingDate: v }))}
                                                                    placeholder="Activation Date"
                                                                    controlHeightPx={40}
                                                                    alwaysOpenAbove
                                                                    className="w-full [&>div]:!w-full [&>div]:!max-w-full [&>div]:!border-2 [&>div]:!border-[rgba(191,152,83,0.2)] [&>div]:!rounded-lg [&>div]:!shadow-none [&>div:hover]:!border-[rgba(191,152,83,0.4)] [&>div:focus-within]:!outline-none [&>div:focus-within]:!ring-0 [&>div:focus-within]:!shadow-[0_0_0_1px_rgba(191,152,83,0.4)] [&>button]:!font-semibold"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        <div className="text-left">
                                            <div className="flex justify-between mb-[8px] w-[616px]">
                                                <label className="block text-black font-semibold text-left">Bill Copy URL</label>
                                                {pendingBillCopyFile && (
                                                    <span className="text-[14px] text-[#E4572E] font-semibold">{pendingBillCopyFile.name}</span>
                                                )}
                                            </div>
                                            <div className="flex w-[616px] items-center gap-[8px]">
                                                <input
                                                    type="text"
                                                    name="billCopyUrl"
                                                    value={formData.billCopyUrl ?? formData.billCopy ?? ''}
                                                    onChange={handleChange}
                                                    placeholder="Bill copy URL"
                                                    className="min-w-0 flex-1 h-[40px] text-[14px] py-0 px-2 box-border border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)] hover:border-opacity-[0.40] font-semibold placeholder:font-normal"
                                                />
                                                <input
                                                    ref={billCopyFileInputRef}
                                                    type="file"
                                                    className="hidden"
                                                    accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,image/*,application/pdf"
                                                    onChange={handleBillCopyFileSelected}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => billCopyFileInputRef.current?.click()}
                                                    disabled={isSubmitting}
                                                    className="shrink-0 h-[40px] text-[#BF9853]"
                                                >
                                                    <img src={UploadFile} alt="Upload" className="w-[40px] h-[40px]" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <label className="block text-black font-semibold mb-[8px] text-left">Description</label>
                                            <textarea
                                                name="comments"
                                                value={formData.comments}
                                                onChange={handleChange}
                                                placeholder="Description"
                                                className="border-2 border-[#BF9853] text-[14px] rounded-md px-[8px] w-[616px] h-[60px] focus:outline-none border-opacity-[0.20] resize-none font-semibold placeholder:font-normal placeholder:text-gray-500"
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-4 ">
                                            <button type="button" onClick={handleCancel} className="px-4 py-2 border-2 border-opacity-[] border-[#BF9853] text-[#BF9853] rounded">
                                                Cancel
                                            </button>
                                            <button type="submit" disabled={isSubmitting} onClick={handleSave}
                                                className={`px-4 py-2 bg-[#BF9853] text-white rounded transition duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                {isSubmitting ? 'Submitting...' : 'Submit'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </Modal>
                            {showPaymentModal && (
                                <ExpenseEntryPaymentModal
                                    isOpen={showPaymentModal}
                                    onClose={() => setShowPaymentModal(false)}
                                    onSubmit={handlePaymentModalSubmit}
                                    isSubmitting={isSubmitting}
                                    paymentMode={paymentModalData.paymentMode || pendingUpdateFormDataRef.current?.paymentMode || ''}
                                    date={pendingUpdateFormDataRef.current?.date || ''}
                                    amount={pendingUpdateFormDataRef.current?.amount || ''}
                                    paymentModalData={paymentModalData}
                                    setPaymentModalData={setPaymentModalData}
                                    accountDetails={accountDetails}
                                    selectStyles={customStyles}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {showBillArrivalCalendar && createPortal(
                <>
                    <div
                        className="fixed inset-0 z-[9998]"
                        aria-hidden
                        onMouseDown={() => setShowBillArrivalCalendar(false)}
                    />
                    <div
                        className="fixed z-[9999] w-0 h-0 [&>div]:!top-full [&>div]:!bottom-auto [&>div]:!mt-2 [&>div]:!mb-0 [&>div]:!right-0 [&>div]:!left-auto"
                        style={{
                            top: billArrivalCalendarPos.top,
                            left: billArrivalCalendarPos.left,
                        }}
                    >
                        <SingleDatePicker
                            isOpen
                            onClose={() => setShowBillArrivalCalendar(false)}
                            value={selectedBillArrival || ''}
                            onChange={(v) => {
                                setSelectedBillArrival(v);
                                setShowBillArrivalCalendar(false);
                            }}
                            variant="dropdown"
                            anchor="right"
                        />
                    </div>
                </>,
                document.body
            )}
        </body>
    );
};
export default TableViewExpense;
const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + 330);
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
