import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar } from 'lucide-react';
import axios from 'axios';
import Modal from 'react-modal';
import DateRangePicker from './DateRangePicker';
import CustomDateField from './CustomDateField';
import SingleDatePicker from './SingleDatePicker';
import edit from '../Images/Edit.svg';
import history from '../Images/History.svg';
import remove from '../Images/Delete.svg';
import Select from 'react-select';
import Filter from '../Images/TableFilter.svg'
import Search from '../Images/Searchnew.svg'
import CalendarIcon from "../Images/Calendoricon.png";
import Reload from '../Images/Clear.svg'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    postBankRegisterLogSave,
    bankRegisterLogSaveUrlMatchingRequest,
    isPaymentModeRequiringBankRegisterLog,
} from '../../utils/bankRegisterLogBeforeWeeklyBill';
import XL from '../Images/sheets.png'
import Pdf from '../Images/pdf.png'
Modal.setAppElement('#root');
const TOOLS_API_BASE = 'https://backendaab.in/demoAabuildersDash';
const NON_CASH_PAYMENT_MODES = ['GPay', 'Gpay', 'PhonePe', 'Net Banking', 'Cheque'];
const BLANK_VALUE = 'BLANK';
const BLANK_LABEL = 'Blank';
const blankOption = { value: BLANK_VALUE, label: BLANK_LABEL };
const isBlankish = (value) =>
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '');

const fetchWeeklyPaymentBillsByExpensesEntryId = async (expensesEntryId) => {
    const listResponse = await fetch(`${TOOLS_API_BASE}/api/weekly-payment-bills/all`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!listResponse.ok) {
        throw new Error('Failed to fetch bill payments');
    }
    const billPayments = await listResponse.json();
    return (Array.isArray(billPayments) ? billPayments : []).filter(
        (bill) =>
            bill.expenses_entry_id != null &&
            String(bill.expenses_entry_id) === String(expensesEntryId)
    );
};

const DatabaseExpenses = ({ username, userRoles = [], isActive = true }) => {
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [audits, setAudits] = useState([]);
    const [siteOptions, setSiteOptions] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [contractorOptions, setContractorOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [machineToolsOptions, setMachineToolsOptions] = useState([]);
    const [machineToolsCatalog, setMachineToolsCatalog] = useState([]);
    const [accountTypeOption, setAccountTypeOption] = useState([]);
    const [editAccountTypeOptions, setEditAccountTypeOptions] = useState([]);
    const [siteOption, setSiteOption] = useState([]);
    const [vendorOption, setVendorOption] = useState([]);
    const [contractorOption, setContractorOption] = useState([]);
    const [categoryOption, setCategoryOption] = useState([]);
    const [machineToolsOption, setMachineToolsOption] = useState([]);
    const [laboursList, setLaboursList] = useState([]);
    const [employeeOptions, setEmployeeOptions] = useState([]);
    const [branchOptions, setBranchOptions] = useState([]);
    const [sourceOptions, setSourceOptions] = useState([]);
    const [branchFilterOptions, setBranchFilterOptions] = useState([]);
    const [enteredByOptions, setEnteredByOptions] = useState([]);
    // Initialize filter states from localStorage or defaults
    const [selectedSiteName, setSelectedSiteName] = useState(() => {
        return localStorage.getItem('expenseFilter_siteName') || '';
    });
    const [selectedVendor, setSelectedVendor] = useState(() => {
        return localStorage.getItem('expenseFilter_vendor') || '';
    });
    const [enoOptions, setEnoOptions] = useState([]);
    const [selectedContractor, setSelectedContractor] = useState(() => {
        return localStorage.getItem('expenseFilter_contractor') || '';
    });
    const [selectedCategory, setSelectedCategory] = useState(() => {
        return localStorage.getItem('expenseFilter_category') || '';
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedEno, setSelectedEno] = useState(() => {
        return localStorage.getItem('expenseFilter_eno') || '';
    });
    const [overallSearch, setOverallSearch] = useState('');
    const [accountTypeOptions, setAccountTypeOptions] = useState([]);
    const [selectedMachineTools, setSelectedMachineTools] = useState(() => {
        return localStorage.getItem('expenseFilter_machineTools') || '';
    });
    const [selectedDate, setSelectedDate] = useState(() => {
        return localStorage.getItem('expenseFilter_date') || '';
    });
    const [startDate, setStartDate] = useState(() => {
        return localStorage.getItem('expenseFilter_startDate') || '';
    });
    const [endDate, setEndDate] = useState(() => {
        return localStorage.getItem('expenseFilter_endDate') || '';
    });
    const [timestampStartDate, setTimestampStartDate] = useState(() => {
        return localStorage.getItem('expenseFilter_timestampStartDate') || '';
    });
    const [timestampEndDate, setTimestampEndDate] = useState(() => {
        return localStorage.getItem('expenseFilter_timestampEndDate') || '';
    });
    const [selectedAccountType, setSelectedAccountType] = useState(() => {
        return localStorage.getItem('expenseFilter_accountType') || '';
    });
    const [selectedSource, setSelectedSource] = useState(() => {
        return localStorage.getItem('expenseFilter_source') || '';
    });
    const [selectedBranch, setSelectedBranch] = useState(() => {
        return localStorage.getItem('expenseFilter_branch') || '';
    });
    const [selectedEnteredBy, setSelectedEnteredBy] = useState(() => {
        return localStorage.getItem('expenseFilter_enteredBy') || '';
    });
    const [staffOptions, setStaffOptions] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState('');
    const [selectedQuantity, setSelectedQuantity] = useState('');
    const [selectedDescription, setSelectedDescription] = useState('');
    const [selectedBillArrival, setSelectedBillArrival] = useState('');
    const [showBillArrivalCalendar, setShowBillArrivalCalendar] = useState(false);
    const [billArrivalCalendarPos, setBillArrivalCalendarPos] = useState({ top: 0, left: 0 });
    const billArrivalFilterRef = useRef(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showDateRangePicker, setShowDateRangePicker] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [userPermissions, setUserPermissions] = useState([]);
    const moduleName = "Expense Entry";
    const defaultPaymentModeOptions = [
        { modeOfPayment: 'Cash' },
        { modeOfPayment: 'GPay' },
        { modeOfPayment: 'PhonePe' },
        { modeOfPayment: 'Net Banking' },
        { modeOfPayment: 'Cheque' }
    ];
    const [paymentModeOptions, setPaymentModeOptions] = useState([]);
    const finalPaymentModeOptions = paymentModeOptions.length > 0 ? paymentModeOptions : defaultPaymentModeOptions;
    useEffect(() => {
        const fetchPaymentModes = async () => {
            try {
                const response = await fetch('https://backendaab.in/demoAabuildersDash/api/payment_mode/getAll');
                if (response.ok) {
                    const data = await response.json();
                    setPaymentModeOptions(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error('Error fetching payment modes:', error);
            }
        };
        fetchPaymentModes();
    }, []);
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
    const scrollRef = useRef(null);
    const filterRowRef = useRef(null);
    const filterNudgeUsedRef = useRef(false);
    const isDragging = useRef(false);
    const start = useRef({ x: 0, y: 0 });
    const scroll = useRef({ left: 0, top: 0 });
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
    useEffect(() => {
        return () => cancelMomentum();
    }, []);
    useEffect(() => {
        if (!showBillArrivalCalendar) return undefined;
        const closeCalendar = () => setShowBillArrivalCalendar(false);
        window.addEventListener('scroll', closeCalendar, true);
        return () => window.removeEventListener('scroll', closeCalendar, true);
    }, [showBillArrivalCalendar]);
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
        localStorage.setItem('expenseFilter_date', selectedDate);
    }, [selectedDate]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_startDate', startDate);
    }, [startDate]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_endDate', endDate);
    }, [endDate]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_timestampStartDate', timestampStartDate);
    }, [timestampStartDate]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_timestampEndDate', timestampEndDate);
    }, [timestampEndDate]);

    useEffect(() => {
        localStorage.setItem('expenseFilter_eno', selectedEno);
    }, [selectedEno]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_source', selectedSource);
    }, [selectedSource]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_branch', selectedBranch);
    }, [selectedBranch]);
    useEffect(() => {
        localStorage.setItem('expenseFilter_enteredBy', selectedEnteredBy);
    }, [selectedEnteredBy]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentModalData, setPaymentModalData] = useState({
        chequeNo: '',
        chequeDate: '',
        transactionNumber: '',
        accountNumber: ''
    });
    const [accountDetails, setAccountDetails] = useState([]);
    const pendingUpdateFormDataRef = useRef(null);
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
    const [expandedCells, setExpandedCells] = useState({});
    const customStyles = useMemo(() => ({
        control: (provided, state) => ({
            ...provided,
            borderWidth: '2px',
            lineHeight: '20px',
            fontSize: '14px',
            fontWeight: 'normal',
            height: '36px',
            borderRadius: '8px',
            textAlign: 'left',
            borderColor: 'rgba(191, 152, 83, 0.2)',
            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.4)' : 'none',
            '&:hover': {
                borderColor: 'rgba(191, 152, 83, 0.4)',
            },
        }),
        clearIndicator: (provided) => ({
            ...provided,
            cursor: 'pointer',
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 999,
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
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#111827',
            fontWeight: 'normal',
            marginRight: 0,
        }),
        valueContainer: (provided) => ({
            ...provided,
            paddingLeft: '12px',
            paddingRight: '2px',
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            paddingLeft: '0px',
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            paddingTop: '0px',
            paddingBottom: '0px',
            paddingRight: '6px',
            paddingLeft: '3px',
        }),
        option: (provided, state) => ({
            ...provided,
            textAlign: 'left',
            fontWeight: 'normal',
            fontSize: '15px',
            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
            color: 'black',
        }),
        input: (provided) => ({
            ...provided,
            fontWeight: 'normal',
            color: 'black',
            textAlign: 'left',
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#A6A5A6',
            textAlign: 'left',
            fontWeight: 'normal',
            paddingLeft: '0px',
            paddingTop: '0px',
            paddingBottom: '0px',
        }),
        indicatorSeparator: (provided) => ({
            ...provided,
            display: 'none',
        }),
    }), []);
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
    const refetchExpenses = useCallback(async () => {
        const response = await axios.get('https://backendaab.in/demoAabuilderDash/expenses_form/get_form', {
            params: activeBranchId ? { branchId: activeBranchId } : {},
        });
        const sortedExpenses = response.data.sort((a, b) => {
            const enoA = parseInt(a.eno, 10);
            const enoB = parseInt(b.eno, 10);
            return enoB - enoA;
        });
        setExpenses(sortedExpenses);
        setFilteredExpenses(sortedExpenses);
        const uniqueAccountTypes = [...new Set(response.data.map(expense => expense.accountType))];
        const uniqueProjectNames = [...new Set(response.data.map(expense => expense.siteName))];
        const siteOptions = uniqueProjectNames.map(name => ({ value: name, label: name }));
        const uniqueVendorOptions = [...new Set(response.data.map(expense => expense.vendor))];
        const vendorOptions = uniqueVendorOptions.map(name => ({ value: name, label: name }));
        const uniqueContractorOptions = [...new Set(response.data.map(expense => expense.contractor))];
        const uniqueCategoryOptions = [...new Set(response.data.map(expense => expense.category))];
        const contractorOption = uniqueContractorOptions.map(name => ({ value: name, label: name }));
        const categoryOption = uniqueCategoryOptions.map(name => ({ value: name, label: name }));
        setAccountTypeOptions(uniqueAccountTypes);
        setSiteOptions(siteOptions);
        setVendorOptions(vendorOptions);
        setContractorOptions(contractorOption);
        setCategoryOptions(categoryOption);
    }, [activeBranchId]);
    useEffect(() => {
        refetchExpenses().catch((error) => {
            console.error('Error fetching expenses:', error);
        });
    }, [refetchExpenses]);
    const prevIsActiveRef = useRef(isActive);
    useEffect(() => {
        if (isActive && prevIsActiveRef.current === false) {
            void refetchExpenses();
        }
        prevIsActiveRef.current = isActive;
    }, [isActive, refetchExpenses]);
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
                const formattedData = data.map(item => ({
                    value: item.accountType,
                    label: item.accountType,
                    id: item.id,
                }));
                setAccountTypeOption(formattedData);
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
                console.log('Error fetching Labour names.');
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
    const generateTodayPDF = () => {
        const today = new Date().toISOString().slice(0, 10);
        const todayExpenses = expenses.filter(exp => {
            const expenseDate = new Date(exp.date).toISOString().slice(0, 10);
            return expenseDate === today;
        });
        if (todayExpenses.length === 0) {
            alert("No entries found for today.");
            return;
        }
        const doc = new jsPDF({ orientation: "landscape" });
        doc.setFontSize(16);
        doc.text("Today's Expenses Report", 14, 15);
        autoTable(doc, {
            startY: 25,
            head: [[
                'Time', 'Date', 'Site', 'Vendor', 'Contractor',
                'Qty', 'Amount', 'Comments', 'Category', 'A/C Type',
                'Machine Tools', 'E.No'
            ]],
            body: todayExpenses.map(exp => [
                formatDate(exp.timestamp),
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
        doc.save(`Todays_Expenses_${today}.pdf`);
    };
    useEffect(() => {
        const filtered = expenses.filter(expense => {
            // Date range filter (Start Date and End Date) - filters expense.date
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
            // Timestamp range filter - filters expense.timestamp
            if (timestampStartDate && timestampEndDate) {
                const ts = new Date(timestampStartDate);
                ts.setHours(0, 0, 0, 0);
                const te = new Date(timestampEndDate);
                te.setHours(23, 59, 59, 999);
                const expenseTs = expense.timestamp ? new Date(expense.timestamp) : null;
                if (!expenseTs || expenseTs < ts || expenseTs > te) return false;
            } else if (timestampStartDate) {
                const ts = new Date(timestampStartDate);
                ts.setHours(0, 0, 0, 0);
                const expenseTs = expense.timestamp ? new Date(expense.timestamp) : null;
                if (!expenseTs || expenseTs < ts) return false;
            } else if (timestampEndDate) {
                const te = new Date(timestampEndDate);
                te.setHours(23, 59, 59, 999);
                const expenseTs = expense.timestamp ? new Date(expense.timestamp) : null;
                if (!expenseTs || expenseTs > te) return false;
            }
            if (overallSearch.trim()) {
                const q = overallSearch.toLowerCase().trim();
                const searchable = [
                    formatDate(expense.timestamp),
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
                    getMachineToolsItemIdDisplay(expense.machineTools),
                    expense.source,
                    getBranchName(expense.branch_id ?? expense.branchId),
                    expense.enteredBy || 'Sivaprakasm',
                    expense.eno
                ]
                    .map((v) => String(v ?? '').toLowerCase())
                    .join(' ');
                if (!searchable.includes(q)) return false;
            }
            return (
                (selectedSiteName
                    ? (selectedSiteName === BLANK_VALUE
                        ? isBlankish(expense.siteName)
                        : expense.siteName === selectedSiteName)
                    : true) &&
                (selectedVendor
                    ? (selectedVendor === BLANK_VALUE
                        ? isBlankish(expense.vendor)
                        : expense.vendor === selectedVendor)
                    : true) &&
                (selectedContractor
                    ? (selectedContractor === BLANK_VALUE
                        ? isBlankish(expense.contractor)
                        : expense.contractor === selectedContractor)
                    : true) &&
                (selectedCategory
                    ? (selectedCategory === BLANK_VALUE
                        ? isBlankish(expense.category)
                        : expense.category === selectedCategory)
                    : true) &&
                (selectedMachineTools
                    ? (selectedMachineTools === BLANK_VALUE
                        ? isBlankish(expense.machineTools)
                        : String(expense.machineTools ?? '') === String(selectedMachineTools))
                    : true) &&
                (selectedSource
                    ? (selectedSource === BLANK_VALUE
                        ? isBlankish(expense.source)
                        : expense.source === selectedSource)
                    : true) &&
                (selectedBranch
                    ? (selectedBranch === BLANK_VALUE
                        ? isBlankish(expense.branch_id ?? expense.branchId)
                        : String(expense.branch_id ?? expense.branchId ?? '') === String(selectedBranch))
                    : true) &&
                (selectedEnteredBy
                    ? (selectedEnteredBy === BLANK_VALUE
                        ? isBlankish(expense.enteredBy)
                        : (expense.enteredBy || 'Sivaprakasm') === selectedEnteredBy)
                    : true) &&
                (selectedAccountType ?
                    (selectedAccountType === 'Unknown' ?
                        (!expense.accountType || expense.accountType === '') :
                        expense.accountType === selectedAccountType
                    ) : true) &&
                (selectedDate ? expense.date === selectedDate : true) &&
                (selectedEno
                    ? (selectedEno === BLANK_VALUE
                        ? isBlankish(expense.eno)
                        : String(expense.eno) === String(selectedEno))
                    : true) &&
                (selectedStaff
                    ? (selectedStaff === BLANK_VALUE
                        ? isBlankish(getDisplayStaffName(expense))
                        : getDisplayStaffName(expense) === selectedStaff)
                    : true) &&
                (selectedQuantity.trim()
                    ? String(expense.quantity ?? '').toLowerCase().includes(selectedQuantity.toLowerCase().trim())
                    : true) &&
                (selectedDescription.trim()
                    ? String(expense.comments ?? '').toLowerCase().includes(selectedDescription.toLowerCase().trim())
                    : true) &&
                (selectedBillArrival
                    ? expenseBillArrivalToInput(expense) === selectedBillArrival
                    : true)
            );
        });
        setFilteredExpenses(filtered);
        setCurrentPage(1); // Reset to first page when filters change
        // Set total amount
        const total = filtered.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        setTotalAmount(total);
        // Dynamically update dropdown options from filtered data
        const getOptions = (data, key, includeBlank = true) => {
            const unique = [];
            const seen = new Set();
            let hasBlank = false;
            data.forEach((item) => {
                const value = item[key];
                if (isBlankish(value)) {
                    hasBlank = true;
                    return;
                }
                const normalized = String(value);
                if (!seen.has(normalized)) {
                    seen.add(normalized);
                    unique.push(value);
                }
            });
            const options = unique.map(val => ({ value: val, label: val }));
            if (includeBlank && hasBlank) options.unshift(blankOption);
            return options;
        };
        setSiteOptions(getOptions(filtered, "siteName"));
        setVendorOptions(getOptions(filtered, "vendor"));
        setContractorOptions(getOptions(filtered, "contractor"));
        setCategoryOptions(getOptions(filtered, "category"));
        setSourceOptions(getOptions(filtered, "source"));
        const uniqueStaff = [];
        const seenStaff = new Set();
        let hasBlankStaff = false;
        filtered.forEach((item) => {
            const staff = getDisplayStaffName(item);
            if (isBlankish(staff)) {
                hasBlankStaff = true;
                return;
            }
            if (!seenStaff.has(staff)) {
                seenStaff.add(staff);
                uniqueStaff.push(staff);
            }
        });
        const staffOptionsBuilt = uniqueStaff.map((staff) => ({ value: staff, label: staff }));
        if (hasBlankStaff) staffOptionsBuilt.unshift(blankOption);
        setStaffOptions(staffOptionsBuilt);
        const uniqueBranchIds = [];
        const seenBranchIds = new Set();
        let hasBlankBranch = false;
        filtered.forEach((item) => {
            const rawId = item.branch_id ?? item.branchId;
            if (isBlankish(rawId)) {
                hasBlankBranch = true;
                return;
            }
            const id = String(rawId);
            if (!seenBranchIds.has(id)) {
                seenBranchIds.add(id);
                uniqueBranchIds.push(id);
            }
        });
        const branchFilterOptionsBuilt = uniqueBranchIds.map(id => ({
            value: String(id),
            label: branchOptions.find(branch => String(branch.id) === String(id))?.branch || String(id)
        }));
        if (hasBlankBranch) branchFilterOptionsBuilt.unshift(blankOption);
        setBranchFilterOptions(branchFilterOptionsBuilt);

        const uniqueEnteredBy = [];
        const seenEnteredBy = new Set();
        let hasBlankEnteredBy = false;
        filtered.forEach((item) => {
            const enteredBy = item.enteredBy;
            if (isBlankish(enteredBy)) {
                hasBlankEnteredBy = true;
                return;
            }
            const key = String(enteredBy);
            if (!seenEnteredBy.has(key)) {
                seenEnteredBy.add(key);
                uniqueEnteredBy.push(String(enteredBy));
            }
        });
        const enteredByOptionsBuilt = uniqueEnteredBy.map(val => ({ value: val, label: val }));
        if (hasBlankEnteredBy) enteredByOptionsBuilt.unshift(blankOption);
        setEnteredByOptions(enteredByOptionsBuilt);

        const uniqueToolIds = [];
        const seenToolIds = new Set();
        let hasBlankTools = false;
        filtered.forEach((item) => {
            const toolId = item.machineTools;
            if (isBlankish(toolId)) {
                hasBlankTools = true;
                return;
            }
            const key = String(toolId);
            if (!seenToolIds.has(key)) {
                seenToolIds.add(key);
                uniqueToolIds.push(toolId);
            }
        });
        const machineToolsOptionsBuilt = uniqueToolIds.map((id) => ({
            value: String(id),
            label:
                machineToolsIdToLabel[id] ??
                machineToolsIdToLabel[String(id)] ??
                String(id),
        }));
        if (hasBlankTools) machineToolsOptionsBuilt.unshift(blankOption);
        setMachineToolsOptions(machineToolsOptionsBuilt);

        setAccountTypeOptions(getOptions(filtered, "accountType", false));

        const uniqueEno = [];
        const seenEno = new Set();
        let hasBlankEno = false;
        filtered.forEach((item) => {
            const eno = item.eno;
            if (isBlankish(eno)) {
                hasBlankEno = true;
                return;
            }
            const key = String(eno);
            if (!seenEno.has(key)) {
                seenEno.add(key);
                uniqueEno.push(eno);
            }
        });
        if (hasBlankEno) uniqueEno.unshift(BLANK_VALUE);
        setEnoOptions(uniqueEno);

    }, [selectedSiteName, selectedVendor, selectedContractor, selectedCategory, selectedMachineTools, selectedSource, selectedBranch, selectedEnteredBy, selectedAccountType, selectedDate, startDate, endDate, timestampStartDate, timestampEndDate, selectedEno, selectedStaff, selectedQuantity, selectedDescription, selectedBillArrival, overallSearch, expenses, machineToolsIdToLabel, branchOptions]);
    const handleChange = (e) => {
        const { name, type, value, files } = e.target;
        // Prevent clearing the date field
        if (name === "date" && value === "") {
            return; // Don't update formData if date is being cleared
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
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };
    const formatChipDateDMY = (dateString) => {
        if (!dateString) return '';
        // expected input: yyyy-MM-dd
        const parts = String(dateString).split('-');
        if (parts.length === 3 && parts[0].length === 4) {
            const [y, m, d] = parts;
            return `${d}-${m}-${y}`;
        }
        return String(dateString);
    };
    const formatDateOnly = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    const handleSave = async (event) => {
        event.preventDefault();
        let updatedBillCopy = formData.billCopy;
        setIsSubmitting(true);
        if (selectedFile) {
            try {
                const uploadFormData = new FormData();

                const now = new Date();
                const timestamp = now.toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true
                })
                    .replace(",", "")
                    .replace(/\s/g, "-");

                const finalName = `${timestamp}-${formData.siteName}-${formData.vendor || formData.contractor}`;

                // ✅ CHANGE 1: key must be "files"
                uploadFormData.append("files", selectedFile);

                // ✅ CHANGE 2: required folder
                uploadFormData.append("folder", "FileUpload / Expenses_Entry_Files");

                // ✅ CHANGE 3: optional filename
                uploadFormData.append("fileName", finalName);

                const uploadResponse = await fetch("https://backendaab.in/demoAabuildersDash/api/files/upload", {
                    method: "POST",
                    body: uploadFormData,
                });

                if (!uploadResponse.ok) {
                    throw new Error("File upload failed");
                }

                const result = await uploadResponse.json();

                // ✅ CHANGE 4: new response structure
                updatedBillCopy = result.urls[0];

            } catch (error) {
                console.error("Error during file upload:", error);
                alert("Error during file upload. Please try again.");
                setIsSubmitting(false);
                return;
            }
        }
        const updatedFormData = {
            ...formData,
            billCopy: updatedBillCopy,
            editedBy: username,
        };
        const isPaymentType = (updatedFormData.accountType === 'Claim Payment' || updatedFormData.accountType === 'Utility Bills' || updatedFormData.accountType === 'Sundry Payment');
        const isNonCashPaymentMode = NON_CASH_PAYMENT_MODES.includes(updatedFormData.paymentMode);
        if (isPaymentType && isNonCashPaymentMode && editId) {
            const existingWeeklyBills = await fetchWeeklyPaymentBillsByExpensesEntryId(editId);
            if (existingWeeklyBills.length === 0) {
                pendingUpdateFormDataRef.current = updatedFormData;
                setPaymentModalData({ chequeNo: '', chequeDate: '', transactionNumber: '', accountNumber: '' });
                setShowPaymentModal(true);
                setIsSubmitting(false);
                return;
            }
        }
        try {
            await performUpdateAndWeeklyBills(updatedFormData);
            await refetchExpenses();
            setModalIsOpen(false);
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
        const isPaymentTypeForWeekly = (updatedFormData.accountType === 'Claim Payment' || updatedFormData.accountType === 'Utility Bills' || updatedFormData.accountType === 'Sundry Payment');
        const isNonCashPaymentMode = NON_CASH_PAYMENT_MODES.includes(updatedFormData.paymentMode);
        let existingWeeklyBills = [];
        if (editId && isPaymentTypeForWeekly && isNonCashPaymentMode) {
            existingWeeklyBills = await fetchWeeklyPaymentBillsByExpensesEntryId(editId);
        }
        const shouldSendWeeklyBill = isPaymentTypeForWeekly && isNonCashPaymentMode && editId && existingWeeklyBills.length === 0;
        if (
            shouldSendWeeklyBill &&
            isPaymentModeRequiringBankRegisterLog(updatedFormData.paymentMode)
        ) {
            await postBankRegisterLogSave(
                bankRegisterLogSaveUrlMatchingRequest(updateUrl),
                "Expense Entry",
                {
                    bill_payment_mode: updatedFormData.paymentMode,
                    amount: updatedFormData.amount,
                }
            );
        }
        const response = await fetch(updateUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatePayload)
        });
        if (!response.ok) throw new Error('Failed to update expense');
        if (shouldSendWeeklyBill) {
            try {
                const weeklyPaymentBillPayload = {
                    date: updatedFormData.date,
                    created_at: new Date().toISOString(),
                    contractor_id: updatedFormData.contractorId || null,
                    vendor_id: updatedFormData.vendorId || null,
                    employee_id: null,
                    project_id: updatedFormData.projectId || null,
                    type: updatedFormData.accountType === 'Claim Payment' ? 'Claim Payment' : updatedFormData.accountType === 'Sundry Payment' ? 'Sundry Payment' : 'Utility Payment',
                    bill_payment_mode: updatedFormData.paymentMode,
                    amount: parseFloat(updatedFormData.amount) || 0,
                    status: true,
                    weekly_number: '',
                    expenses_entry_id: editId,
                    advance_portal_id: null,
                    staff_advance_portal_id: null,
                    claim_payment_id: null,
                    cheque_number: (modalPaymentData && modalPaymentData.chequeNo) || null,
                    cheque_date: (modalPaymentData && modalPaymentData.chequeDate) || null,
                    transaction_number: (modalPaymentData && modalPaymentData.transactionNumber) || null,
                    account_number: (modalPaymentData && modalPaymentData.accountNumber) || null,
                    branch_id: activeBranchId,
                    enteredBy: username,
                };
                const weeklyResponse = await fetch(`${TOOLS_API_BASE}/api/weekly-payment-bills/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(weeklyPaymentBillPayload)
                });
                if (!weeklyResponse.ok) {
                    console.error('Weekly payment bills save failed:', await weeklyResponse.text());
                }
            } catch (weeklyErr) {
                console.error('Weekly payment bills save error:', weeklyErr);
            }
        }
    };
    const handlePaymentModalSubmit = async () => {
        if (!paymentModalData.accountNumber) {
            alert('Please select account number.');
            return;
        }
        if (formData.paymentMode === 'Cheque' && (!paymentModalData.chequeNo || !paymentModalData.chequeDate)) {
            alert('Please enter cheque number and date.');
            return;
        }
        const updatedFormData = pendingUpdateFormDataRef.current;
        if (!updatedFormData) return;
        setIsSubmitting(true);
        try {
            await performUpdateAndWeeklyBills(updatedFormData, paymentModalData);
            await refetchExpenses();
            setShowPaymentModal(false);
            setModalIsOpen(false);
            setIsSubmitting(false);
            alert('Updated successfully!');
        } catch (error) {
            console.error('Error updating expense:', error);
            alert('Failed to update expense');
            setIsSubmitting(false);
        }
    };
    // Sorting function
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1); // Reset to first page when sorting
    };
    // Sort data
    const sortedExpenses = [...filteredExpenses].sort((a, b) => {
        if (!sortField) return 0;
        let aValue = a[sortField];
        let bValue = b[sortField];
        // Handle different data types
        if (sortField === 'date') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else if (sortField === 'eno') {
            aValue = parseInt(aValue) || 0;
            bValue = parseInt(bValue) || 0;
        } else if (sortField === 'timestamp') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
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
            aValue = String(getBranchName(a.branch_id ?? a.branchId ?? '') || '').toLowerCase();
            bValue = String(getBranchName(b.branch_id ?? b.branchId ?? '') || '').toLowerCase();
        } else if (sortField === 'billArrivalDate') {
            aValue = String(getExpenseBillArrivalRaw(a) || '').slice(0, 10);
            bValue = String(getExpenseBillArrivalRaw(b) || '').slice(0, 10);
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
    // Pagination logic
    const totalPages = Math.ceil(sortedExpenses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = sortedExpenses.slice(startIndex, endIndex);
    // Calculate account type summary
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
    // Create lookup maps for ID to name conversion
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
    // Helper functions to get display names
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
    const getDisplayStaffName = (expense) => {
        // Prioritize labour over employee
        // Check all possible field name variations
        const labourId = expense.labourId || expense.labour_id || expense.labourID || expense.labour_ID;
        const employeeId = expense.employeeId || expense.employee_id || expense.employeeID || expense.employee_ID;

        if (labourId) {
            // Try both string and number conversion for ID matching
            const labourName = labourIdToName[labourId] ||
                labourIdToName[String(labourId)] ||
                labourIdToName[Number(labourId)];
            if (labourName) {
                return labourName;
            }
        }
        if (employeeId) {
            // Try both string and number conversion for ID matching
            const employeeName = employeeIdToName[employeeId] ||
                employeeIdToName[String(employeeId)] ||
                employeeIdToName[Number(employeeId)];
            if (employeeName) {
                return employeeName;
            }
        }
        return '';
    };
    const getBranchName = (id) =>
        branchOptions.find(b => String(b.id) === String(id))?.branch || "";
    function getExpenseBillArrivalRaw(e) { return e?.billArrivalDate ?? e?.bill_arrival_date ?? ''; }
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
    const handleEditClick = (expense) => {
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
            billArrivalDate: expenseBillArrivalToInput(expense)
        });
        setModalIsOpen(true);
    };
    const deleteRelatedWeeklyPaymentBills = async (expensesEntryId) => {
        const matchingBills = await fetchWeeklyPaymentBillsByExpensesEntryId(expensesEntryId);
        if (matchingBills.length === 0) {
            return { deletedCount: 0, failedCount: 0 };
        }
        const deleteResults = await Promise.all(
            matchingBills.map(async (bill) => {
                const deleteResponse = await fetch(
                    `${TOOLS_API_BASE}/api/weekly-payment-bills/delete/${bill.id}`,
                    {
                        method: 'DELETE',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                    }
                );
                return deleteResponse.ok;
            })
        );
        const deletedCount = deleteResults.filter(Boolean).length;
        return { deletedCount, failedCount: deleteResults.length - deletedCount };
    };
    const handleDelete = async (id, username) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                const response = await fetch(
                    `https://backendaab.in/demoAabuilderDash/expenses_form/delete/${id}?editedBy=${encodeURIComponent(username)}`,
                    {
                        method: 'POST',
                    }
                );
                if (response.ok) {
                    let billDeleteMessage = '';
                    try {
                        const { deletedCount, failedCount } = await deleteRelatedWeeklyPaymentBills(id);
                        if (deletedCount > 0 && failedCount === 0) {
                            billDeleteMessage = ' Related bill payment record(s) were also deleted.';
                        } else if (deletedCount > 0 && failedCount > 0) {
                            billDeleteMessage = ' Some related bill payment record(s) could not be deleted.';
                        } else if (failedCount > 0) {
                            billDeleteMessage = ' Failed to delete related bill payment record(s).';
                        }
                    } catch (billDeleteError) {
                        console.error('Failed to delete related bill payments:', billDeleteError);
                        billDeleteMessage = ' Failed to delete related bill payment record(s).';
                    }
                    alert(`Expenses deleted successfully!!!${billDeleteMessage}`);
                    try {
                        await refetchExpenses();
                    } catch (err) {
                        console.error('Error refetching expenses:', err);
                    }
                } else {
                    alert('Failed to delete expense');
                }
            } catch (error) {
                console.error('Failed to delete expense:', error);
            }
        }
    };
    const handleCancel = () => {
        setModalIsOpen(false);
        setSelectedFile(null);
    };
    const fetchAuditDetails = async (expenseId) => {
        try {
            const response = await fetch(`https://backendaab.in/demoAabuilderDash/expenses_form/audit/${expenseId}`);
            const data = await response.json();
            setAudits(data);
            setShowModal(true);
        } catch (error) {
            console.error("Error fetching audit details:", error);
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
        setSelectedBranch('');
        setSelectedEnteredBy('');
        setSelectedDate('');
        setStartDate('');
        setEndDate('');
        setTimestampStartDate('');
        setTimestampEndDate('');
        setSelectedEno('');
        setSelectedStaff('');
        setSelectedQuantity('');
        setSelectedDescription('');
        setSelectedBillArrival('');
        setOverallSearch('');
        setFilteredExpenses(expenses);
        setCurrentPage(1);
        setSortField('');
        setSortDirection('asc');
        // Clear localStorage as well
        localStorage.removeItem('expenseFilter_siteName');
        localStorage.removeItem('expenseFilter_vendor');
        localStorage.removeItem('expenseFilter_contractor');
        localStorage.removeItem('expenseFilter_category');
        localStorage.removeItem('expenseFilter_machineTools');
        localStorage.removeItem('expenseFilter_accountType');
        localStorage.removeItem('expenseFilter_source');
        localStorage.removeItem('expenseFilter_branch');
        localStorage.removeItem('expenseFilter_enteredBy');
        localStorage.removeItem('expenseFilter_date');
        localStorage.removeItem('expenseFilter_startDate');
        localStorage.removeItem('expenseFilter_endDate');
        localStorage.removeItem('expenseFilter_timestampStartDate');
        localStorage.removeItem('expenseFilter_timestampEndDate');
        localStorage.removeItem('expenseFilter_eno');
    };
    const toggleExpandedCell = (cellKey) => {
        setExpandedCells((prev) => ({
            ...prev,
            [cellKey]: !prev[cellKey],
        }));
    };
    const exportToCSV = () => {
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
        const rows = currentItems.map(expense => [
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
    const generateFilteredPDF = () => {
        const doc = new jsPDF({ orientation: "landscape" });
        doc.setFontSize(16);
        doc.text("Filtered Expenses Report", 14, 15);
        autoTable(doc, {
            startY: 25,
            head: [[
                'Time', 'Date', 'Site', 'Vendor', 'Contractor',
                'Qty', 'Amount', 'Comments', 'Category', 'A/C Type',
                'Machine Tools', 'E.No'
            ]],
            body: currentItems.map(exp => [
                formatDate(exp.timestamp),
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
    return (
        <>
            <div className='flex flex-col h-[calc(100vh-104px)] overflow-hidden bg-[#FAF6ED]'>
                <div className='px-[18px] pt-[18px] pb-[18px] flex flex-col flex-1 min-h-0 overflow-hidden bg-[#FAF6ED]'>
                    {Object.keys(accountTypeSummary).length > 0 ? (
                        <div className="w-full pt-[18px] px-[18px] pb-[18px] rounded-[6px] bg-white mb-[18px]">
                            <div className="flex flex-wrap gap-[12px] items-end text-left">
                                {Object.entries(accountTypeSummary)
                                    .sort(([a], [b]) => {
                                        if (a === 'Unknown') return 1;
                                        if (b === 'Unknown') return -1;
                                        return a.localeCompare(b);
                                    })
                                    .map(([accountType, data]) => (
                                        <div key={accountType} className="cursor-pointer transition-all duration-200 hover:scale-105" onClick={() => setSelectedAccountType(accountType)}>
                                            <div className="flex items-center justify-between mb-[8px]">
                                                <label className={`font-semibold text-[16px] transition-colors duration-200 ${selectedAccountType === accountType ? 'text-[#BF9853]' : 'text-[#000000]'}`}>
                                                    {accountType}
                                                </label>
                                                <span className="text-[14px] text-red-500 font-medium">
                                                    {data.entryCount}
                                                </span>
                                            </div>
                                            <input
                                                type="text"
                                                value={`₹${Number(data.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                                readOnly
                                                className={`${accountType === 'Bill Payments + Claim' || accountType === 'Sundry Payment' ? 'w-[220px]' : 'w-[150px]'} h-[40px] cursor-pointer rounded-lg border-2 focus:outline-none pl-[12px] text-[14px] font-medium transition-all duration-200 ${selectedAccountType === accountType
                                                    ? 'border-[#BF9853] bg-[#FFFFFF] text-[#000000] shadow-md'
                                                    : 'border-[#BF9853] border-opacity-25 bg-[#FFFFFF] text-[#000000] hover:border-[#BF9853] hover:border-opacity-75 hover:shadow-sm'
                                                    }`}
                                            />
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ) : sortedExpenses.length === 0 ? (
                        <div className="w-full pt-[18px] px-[18px] pb-[18px] rounded-[6px] bg-white mb-[18px] flex items-center justify-center min-h-[120px] text-[16px] font-medium text-[#666666]">
                            No datas are matched
                        </div>
                    ) : null}
                    <div className="w-full pt-[18px] px-[18px] bg-white rounded-[6px] flex flex-col flex-1 min-h-0 overflow-hidden">
                        <div
                            className={`text-left flex ${selectedDate || selectedSiteName || selectedVendor || selectedContractor || selectedStaff || selectedQuantity.trim() || selectedDescription.trim() || selectedBillArrival || selectedCategory || selectedAccountType || selectedMachineTools || selectedSource || selectedBranch || selectedEnteredBy || startDate || endDate || timestampStartDate || timestampEndDate || selectedEno
                                ? 'flex-col sm:flex-row sm:justify-between'
                                : 'flex-row justify-between items-center'
                                } mb-[12px] gap-[6px]`}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                                <button
                                    className=''
                                    onClick={() => {
                                        const willOpen = !showFilters;
                                        setShowFilters(willOpen);
                                        if (!willOpen) return;
                                        const scroller = scrollRef.current;
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
                                    }}
                                >
                                    <img
                                        src={Filter}
                                        alt="Toggle Filter"
                                        className=" border rounded-md"
                                    />
                                </button>
                                {(selectedDate || selectedSiteName || selectedVendor || selectedContractor || selectedStaff || selectedQuantity.trim() || selectedDescription.trim() || selectedBillArrival || selectedCategory || selectedAccountType || selectedMachineTools || selectedSource || selectedBranch || selectedEnteredBy || startDate || endDate || timestampStartDate || timestampEndDate || selectedEno) && (
                                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-2 sm:mt-0">
                                        {timestampStartDate && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-[16px] font-medium w-fit">
                                                <span className="font-medium">Timestamp: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{formatChipDateDMY(timestampStartDate)}{timestampEndDate ? ` – ${formatChipDateDMY(timestampEndDate)}` : ' onwards'}</span>
                                                <button onClick={() => { setTimestampStartDate(''); setTimestampEndDate(''); }} className="text-[#E4572E] ml-1 text-2xl">×</button>
                                            </span>
                                        )}
                                        {timestampEndDate && !timestampStartDate && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit">
                                                <span className="font-medium">Timestamp until: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{formatChipDateDMY(timestampEndDate)}</span>
                                                <button onClick={() => setTimestampEndDate('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                                            </span>
                                        )}
                                        {selectedDate && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit">
                                                <span className="font-medium">Date: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{formatChipDateDMY(selectedDate)}</span>
                                                <button onClick={() => setSelectedDate('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                                            </span>
                                        )}
                                        {selectedSiteName && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                <span className="font-medium">Project Name: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{selectedSiteName === BLANK_VALUE ? BLANK_LABEL : selectedSiteName}</span>
                                                <button onClick={() => setSelectedSiteName('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedVendor && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                <span className="font-medium">Vendor Name: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{selectedVendor === BLANK_VALUE ? BLANK_LABEL : selectedVendor}</span>
                                                <button onClick={() => setSelectedVendor('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedContractor && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                <span className="font-medium">Contractor Name: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{selectedContractor === BLANK_VALUE ? BLANK_LABEL : selectedContractor}</span>
                                                <button onClick={() => setSelectedContractor('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedStaff && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                <span className="font-medium">Staff Name: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{selectedStaff === BLANK_VALUE ? BLANK_LABEL : selectedStaff}</span>
                                                <button onClick={() => setSelectedStaff('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedQuantity.trim() && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                <span className="font-medium">Quantity: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{selectedQuantity}</span>
                                                <button onClick={() => setSelectedQuantity('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedDescription.trim() && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                <span className="font-medium">Description: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{selectedDescription}</span>
                                                <button onClick={() => setSelectedDescription('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedCategory && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                <span className="font-medium">Category: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{selectedCategory === BLANK_VALUE ? BLANK_LABEL : selectedCategory}</span>
                                                <button onClick={() => setSelectedCategory('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedAccountType && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                <span className="font-medium">A/C Type: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{selectedAccountType}</span>
                                                <button onClick={() => setSelectedAccountType('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedMachineTools && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                <span className="font-medium">Tools: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{selectedMachineTools === BLANK_VALUE ? BLANK_LABEL : getMachineToolsItemIdDisplay(selectedMachineTools)}</span>
                                                <button onClick={() => setSelectedMachineTools('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedSource && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                <span className="font-medium">Source From: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{selectedSource === BLANK_VALUE ? BLANK_LABEL : selectedSource}</span>
                                                <button onClick={() => setSelectedSource('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedBranch && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                <span className="font-medium">Branch: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{selectedBranch === BLANK_VALUE ? BLANK_LABEL : (getBranchName(selectedBranch) || selectedBranch)}</span>
                                                <button onClick={() => setSelectedBranch('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedEnteredBy && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                <span className="font-medium">Entered By: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{selectedEnteredBy === BLANK_VALUE ? BLANK_LABEL : selectedEnteredBy}</span>
                                                <button onClick={() => setSelectedEnteredBy('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedEno && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                <span className="font-medium">Entry No: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{String(selectedEno) === BLANK_VALUE ? BLANK_LABEL : selectedEno}</span>
                                                <button onClick={() => setSelectedEno('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                        {selectedBillArrival && (
                                            <span className="inline-flex items-center gap-1 border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit">
                                                <span className="font-medium">Bill Arrival: </span>
                                                <span className="font-semibold text-[14px] text-[#BF9853]">{formatChipDateDMY(selectedBillArrival)}</span>
                                                <button onClick={() => setSelectedBillArrival('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className='flex items-end gap-[6px]'>
                                <button onClick={clearFilters} className='flex h-[30px] w-[30px] shrink-0 items-center justify-center'>
                                    <img className='w-full h-full' src={Reload} alt="Reload" />
                                </button>
                                <div className="w-[286px] min-w-[286px]  translate-y-[2px] shrink-0 h-[34px] border border-[#D6D6D6] rounded-md bg-white flex items-center px-2 gap-1">
                                    <input
                                        type="text"
                                        value={overallSearch}
                                        onChange={(e) => setOverallSearch(e.target.value)}
                                        placeholder="Search Transactions..."
                                        className="h-full w-full border-0 p-0 text-[14px] text-[#000000] bg-transparent outline-none"
                                    />
                                    <img src={Search} alt="Search" className="w-[16px] h-[16px] pointer-events-none" />
                                </div>

                                <div className=' text-left md:text-right md:items-end items-end cursor-default flex justify-end max-w-screen-2xl table-auto overflow-auto w-full scrollbar-none no-scrollbar'>
                                    <div className='flex items-end text-center '>
                                        <span className='text-[#E4572E] mr-2 flex items-center gap-1 font-semibold hover:underline cursor-pointer' onClick={generateFilteredPDF}>PDF<img src={Pdf} alt="Pdf" className='w-4 h-4' /></span>
                                        <span className='text-[#007233] flex items-center gap-1 font-semibold hover:underline cursor-pointer' onClick={exportToCSV}>XL<img src={XL} alt="XL" className='w-4 h-4' /></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                            <div
                                ref={scrollRef}
                                className="w-full rounded-lg border border-gray-200 border-l-8 border-l-[#BF9853] flex-1 min-h-0 overflow-auto select-none scrollbar-none no-scrollbar"
                                onWheel={() => { filterNudgeUsedRef.current = false; }}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}>
                                <table className="table-fixed w-full min-w-[1920px] border-collapse">
                                    <thead className="sticky top-0 z-10 bg-white ">
                                        <tr className="bg-[#FAF6ED] h-[40px] text-[16px] font-bold text-center">
                                            <th className="pl-[12px] w-[168px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('timestamp')}>
                                                Timestamp {sortField === 'timestamp' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="w-[120px] pr-[1px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('date')}>
                                                Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="pl-[1px] pr-[1px] w-[298px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('siteName')}>
                                                Project Name {sortField === 'siteName' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="pl-[1px] pr-[1px] w-[218px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('vendor')}>
                                                Vendor Name {sortField === 'vendor' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="pl-[1px] pr-[1px] w-[218px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('contractor')}>
                                                Contractor Name {sortField === 'contractor' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="pl-[1px] pr-[1px] w-[218px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('staff')}>
                                                Staff Name {sortField === 'staff' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="pl-[1px] pr-[1px] w-[78px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('quantity')}>
                                                Quantity {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="pl-[1px] pr-[1px] w-[120px] font-bold text-right cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('amount')}>
                                                Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="pl-[9px] pr-[1px] w-[198px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('comments')}>
                                                Description {sortField === 'comments' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="pl-[1px] pr-[1px] w-[158px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('category')}>
                                                Category {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="pl-[1px] pr-[1px] w-[158px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('machineTools')}>
                                                Machine Tools {sortField === 'machineTools' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="pl-[1px] pr-[1px] w-[158px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('accountType')}>
                                                A/C Type {sortField === 'accountType' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="pl-[1px] pr-[1px] w-[120px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('paymentMode')}>
                                                Mode {sortField === 'paymentMode' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="pl-[1px] pr-[1px] w-[158px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('source')}>
                                                Source From {sortField === 'source' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="pl-[1px] pr-[1px] w-[158px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('branch')}>
                                                Branch {sortField === 'branch' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="pl-[1px] pr-[1px] w-[158px] font-bold text-left cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('enteredBy')}>
                                                Entered By {sortField === 'enteredBy' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="pl-[1px] pr-[1px] w-[120px] font-bold text-right cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('eno')}>
                                                Entry No {sortField === 'eno' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="pl-[1px] pr-[1px] w-[120px] font-bold text-right cursor-pointer hover:bg-gray-200 select-none" onClick={() => handleSort('billArrivalDate')}>
                                                Bill Arrival {sortField === 'billArrivalDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="pl-[9px] pr-[1px] w-[70px] font-bold text-center">Activity</th>
                                            <th className="pl-[6px] pr-[12px] w-[70px] font-bold text-center">File</th>
                                        </tr>
                                        {showFilters && (
                                            <tr ref={filterRowRef} className="bg-[#eeeeee] h-[44px]">
                                                <th className="">
                                                    <div className="relative pl-[10px] [&>button]:!border-2 [&>button]:!border-[rgba(191,152,83,0.2)] [&>button]:!rounded-lg [&>button]:!shadow-none [&>button:hover]:!border-[rgba(191,152,83,0.4)] [&>button:focus]:!outline-none [&>button:focus]:!ring-0 [&>button:focus]:!shadow-[0_0_0_1px_rgba(191,152,83,0.4)] [&>button:focus-visible]:!outline-none [&>button:focus-visible]:!ring-0 [&>button:focus-visible]:!shadow-[0_0_0_1px_rgba(191,152,83,0.4)]">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowDateRangePicker(true)}
                                                            className="w-[158px] box-border h-[36px] pl-[12px] pr-[3px] py-0 text-sm font-normal bg-white text-left flex items-center justify-between"
                                                        >
                                                            <span className={`text-[14px] font-medium truncate flex-1 text-left ${timestampStartDate && timestampEndDate ? 'text-black font-normal' : 'text-[#A6A5A6] font-normal'}`}>
                                                                {timestampStartDate ? (timestampEndDate ? `${timestampStartDate} – ${timestampEndDate}` : `From ${timestampStartDate}`) : 'Timestamp'}
                                                            </span>
                                                            <img src={CalendarIcon} alt="Calendar" className="w-[16px] h-[16px] text-gray-400 flex-shrink-0 mr-[6px] ml-[3px]" />
                                                        </button>
                                                        <DateRangePicker
                                                            isOpen={showDateRangePicker}
                                                            onClose={() => setShowDateRangePicker(false)}
                                                            startDate={timestampStartDate}
                                                            endDate={timestampEndDate}
                                                            variant="dropdown"
                                                            onApply={(from, to) => {
                                                                setTimestampStartDate(from);
                                                                setTimestampEndDate(to);
                                                            }}
                                                        />
                                                    </div>
                                                </th>
                                                <th className=" pr-[1px]">
                                                    <div className="w-[120px]">
                                                        <CustomDateField
                                                            value={selectedDate}
                                                            onChange={setSelectedDate}
                                                            placeholder="Date"
                                                            alwaysOpenBelow
                                                            className={` [&>button]:!border-2 [&>button]:!border-[rgba(191,152,83,0.2)] [&>button]:!rounded-lg [&>button]:!shadow-none [&>button]:!text-[14px] ${selectedDate ? '[&>button]:!text-black [&>button]:!font-normal' : '[&>button]:!text-[#d3d5db] [&>button]:!font-normal'} [&>button:hover]:!border-[rgba(191,152,83,0.4)] [&>button:focus]:!outline-none [&>button:focus]:!ring-0 [&>button:focus]:!shadow-[0_0_0_1px_rgba(191,152,83,0.4)] [&>button:focus-visible]:!outline-none [&>button:focus-visible]:!ring-0 [&>button:focus-visible]:!shadow-[0_0_0_1px_rgba(191,152,83,0.4)]`}
                                                        />
                                                    </div>
                                                </th>
                                                <th className="pl-[1px] pr-[1px]">
                                                    <Select
                                                        className="w-[298px]"
                                                        options={siteOptions}
                                                        value={selectedSiteName ? (selectedSiteName === BLANK_VALUE ? blankOption : { value: selectedSiteName, label: selectedSiteName }) : null}
                                                        onChange={(selectedOption) => setSelectedSiteName(selectedOption ? selectedOption.value : '')}
                                                        placeholder="Project Name"
                                                        menuPlacement="bottom"
                                                        noOptionsMessage={() => null}
                                                        styles={customStyles}
                                                    />
                                                </th>
                                                <th className="pl-[1px] pr-[1px]">
                                                    <Select
                                                        className="w-[218px]"
                                                        options={vendorOptions}
                                                        value={selectedVendor ? (selectedVendor === BLANK_VALUE ? blankOption : { value: selectedVendor, label: selectedVendor }) : null}
                                                        onChange={(selectedOption) => setSelectedVendor(selectedOption ? selectedOption.value : '')}
                                                        placeholder="Vendor Name"
                                                        menuPlacement="bottom"
                                                        noOptionsMessage={() => null}
                                                        styles={customStyles}
                                                    />
                                                </th>
                                                <th className="pl-[1px] pr-[1px]">
                                                    <Select
                                                        className="w-[218px]"
                                                        options={contractorOptions}
                                                        value={selectedContractor ? (selectedContractor === BLANK_VALUE ? blankOption : { value: selectedContractor, label: selectedContractor }) : null}
                                                        onChange={(selectedOption) => setSelectedContractor(selectedOption ? selectedOption.value : '')}
                                                        placeholder="Contractor Name"
                                                        menuPlacement="bottom"
                                                        noOptionsMessage={() => null}
                                                        styles={customStyles}
                                                    />
                                                </th>
                                                <th className="pl-[1px] pr-[1px]">
                                                    <Select
                                                        className="w-[218px]"
                                                        options={staffOptions}
                                                        value={selectedStaff ? (selectedStaff === BLANK_VALUE ? blankOption : { value: selectedStaff, label: selectedStaff }) : null}
                                                        onChange={(selectedOption) => setSelectedStaff(selectedOption ? selectedOption.value : '')}
                                                        placeholder="Staff Name"
                                                        menuPlacement="bottom"
                                                        noOptionsMessage={() => null}
                                                        styles={customStyles}
                                                    />
                                                </th>
                                                <th className="pl-[1px] pr-[1px]">
                                                    <input
                                                        type="text"
                                                        value={selectedQuantity}
                                                        onChange={(e) => setSelectedQuantity(e.target.value)}
                                                        placeholder="Quantity"
                                                        className="w-[78px] h-[36px] box-border rounded-lg border-2 border-[rgba(191,152,83,0.2)] bg-white px-2 text-[14px] font-normal text-black placeholder:text-[#A6A5A6] outline-none hover:border-[rgba(191,152,83,0.4)] focus:border-[rgba(191,152,83,0.4)] focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)]"
                                                    />
                                                </th>
                                                <th className="text-[14px] w-[120px] text-right font-bold ">
                                                    ₹{Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </th>
                                                <th className="pl-[9px] pr-[1px]">
                                                    <input
                                                        type="text"
                                                        value={selectedDescription}
                                                        onChange={(e) => setSelectedDescription(e.target.value)}
                                                        placeholder="Description"
                                                        className="w-[190px] h-[36px] box-border rounded-lg border-2 border-[rgba(191,152,83,0.2)] bg-white px-3 text-[14px] font-normal text-black placeholder:text-[#A6A5A6] outline-none hover:border-[rgba(191,152,83,0.4)] focus:border-[rgba(191,152,83,0.4)] focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)]"
                                                    />
                                                </th>
                                                <th className="pl-[1px] pr-[1px]">
                                                    <Select
                                                        className="w-[158px]"
                                                        options={categoryOptions}
                                                        value={selectedCategory ? (selectedCategory === BLANK_VALUE ? blankOption : { value: selectedCategory, label: selectedCategory }) : null}
                                                        onChange={(selectedOption) => setSelectedCategory(selectedOption ? selectedOption.value : '')}
                                                        placeholder="Category"
                                                        menuPlacement="bottom"
                                                        noOptionsMessage={() => null}
                                                        styles={customStyles}
                                                    />
                                                </th>
                                                <th className="pl-[1px] pr-[1px]">
                                                    <Select
                                                        className="w-[158px]"
                                                        options={machineToolsOptions}
                                                        value={selectedMachineTools ? machineToolsOptions.find(opt => opt.value === String(selectedMachineTools)) : null}
                                                        onChange={(selectedOption) => setSelectedMachineTools(selectedOption ? selectedOption.value : '')}
                                                        placeholder="Machine Tools"
                                                        menuPlacement="bottom"
                                                        noOptionsMessage={() => null}
                                                        styles={customStyles}
                                                    />
                                                </th>
                                                <th className="pl-[1px] pr-[1px]">
                                                    <Select
                                                        className="w-[158px]"
                                                        options={accountTypeOptions}
                                                        value={selectedAccountType ? { value: selectedAccountType, label: selectedAccountType } : null}
                                                        onChange={(selectedOption) => setSelectedAccountType(selectedOption ? selectedOption.value : '')}
                                                        placeholder="A/C Type"
                                                        menuPlacement="bottom"
                                                        noOptionsMessage={() => null}
                                                        styles={customStyles}
                                                    />
                                                </th>
                                                <th className="pl-[1px] pr-[1px]"></th>
                                                <th className="pl-[1px] pr-[1px]">
                                                    <Select
                                                        className="w-[158px]"
                                                        options={sourceOptions}
                                                        value={selectedSource ? (selectedSource === BLANK_VALUE ? blankOption : { value: selectedSource, label: selectedSource }) : null}
                                                        onChange={(selectedOption) => setSelectedSource(selectedOption ? selectedOption.value : '')}
                                                        placeholder="Source From"
                                                        menuPlacement="bottom"
                                                        noOptionsMessage={() => null}
                                                        styles={customStyles}
                                                    />
                                                </th>
                                                <th className="pl-[1px] pr-[1px]">
                                                    <Select
                                                        className="w-[158px]"
                                                        options={branchFilterOptions}
                                                        value={selectedBranch ? branchFilterOptions.find(opt => opt.value === String(selectedBranch)) : null}
                                                        onChange={(selectedOption) => setSelectedBranch(selectedOption ? selectedOption.value : '')}
                                                        placeholder="Branch"
                                                        menuPlacement="bottom"
                                                        noOptionsMessage={() => null}
                                                        styles={customStyles}
                                                    />
                                                </th>
                                                <th className="pl-[1px] pr-[1px]">
                                                    <Select
                                                        className="w-[158px]"
                                                        options={enteredByOptions}
                                                        value={selectedEnteredBy ? (selectedEnteredBy === BLANK_VALUE ? blankOption : { value: selectedEnteredBy, label: selectedEnteredBy }) : null}
                                                        onChange={(selectedOption) => setSelectedEnteredBy(selectedOption ? selectedOption.value : '')}
                                                        placeholder="Entered By"
                                                        menuPlacement="bottom"
                                                        noOptionsMessage={() => null}
                                                        styles={customStyles}
                                                    />
                                                </th>
                                                <th className="pl-[1px] pr-[1px] text-right">
                                                    <Select
                                                        className="w-[120px]"
                                                        options={enoOptions.map((eno) => (String(eno) === BLANK_VALUE ? blankOption : { value: String(eno), label: String(eno) }))}
                                                        value={selectedEno ? (String(selectedEno) === BLANK_VALUE ? blankOption : { value: String(selectedEno), label: String(selectedEno) }) : null}
                                                        onChange={(selectedOption) => setSelectedEno(selectedOption ? selectedOption.value : '')}
                                                        placeholder="Entry No"
                                                        menuPlacement="bottom"
                                                        noOptionsMessage={() => null}
                                                        styles={{
                                                            ...customStyles,
                                                            control: (provided, state) => ({
                                                                ...(typeof customStyles.control === 'function' ? customStyles.control(provided, state) : provided),
                                                                textAlign: 'right',
                                                            }),
                                                            valueContainer: (provided) => ({
                                                                ...(typeof customStyles.valueContainer === 'function' ? customStyles.valueContainer(provided) : provided),
                                                                justifyContent: 'flex-end',
                                                                paddingLeft: '2px',
                                                                paddingRight: '12px',
                                                            }),
                                                            singleValue: (provided) => ({
                                                                ...(typeof customStyles.singleValue === 'function' ? customStyles.singleValue(provided) : provided),
                                                                textAlign: 'right',
                                                            }),
                                                            input: (provided) => ({
                                                                ...(typeof customStyles.input === 'function' ? customStyles.input(provided) : provided),
                                                                textAlign: 'right',
                                                            }),
                                                            placeholder: (provided) => ({
                                                                ...provided,
                                                                textAlign: 'right',
                                                            }),
                                                            option: (provided, state) => ({
                                                                ...(typeof customStyles.option === 'function' ? customStyles.option(provided, state) : provided),
                                                                textAlign: 'right',
                                                            }),
                                                        }}
                                                    />
                                                </th>
                                                <th className="pl-[1px] pr-[1px] text-right">
                                                    <div
                                                        className="w-[98px]"
                                                        ref={billArrivalFilterRef}
                                                        onMouseDown={(e) => {
                                                            if (!e.target.closest('[aria-label="Open calendar"]')) return;
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            const rect = billArrivalFilterRef.current?.getBoundingClientRect();
                                                            if (!rect) return;
                                                            setBillArrivalCalendarPos({ top: rect.bottom, left: rect.right });
                                                            setShowBillArrivalCalendar(true);
                                                        }}
                                                    >
                                                        <CustomDateField
                                                            value={selectedBillArrival}
                                                            onChange={setSelectedBillArrival}
                                                            placeholder="Bill Arrival"
                                                            alwaysOpenBelow
                                                            anchor="right"
                                                            className={` [&>div:first-child]:!w-[120px] [&>div:first-child]:!h-[36px] [&>div.absolute]:!hidden [&>button]:!border-2 [&>button]:!border-[rgba(191,152,83,0.2)] [&>button]:!rounded-lg [&>button]:!shadow-none [&>button]:!text-[14px] ${selectedBillArrival ? '[&>button]:!text-black [&>button]:!font-normal' : '[&>button]:!text-[#d3d5db] [&>button]:!font-normal'} [&>button:hover]:!border-[rgba(191,152,83,0.4)] [&>button:focus]:!outline-none [&>button:focus]:!ring-0 [&>button:focus]:!shadow-[0_0_0_1px_rgba(191,152,83,0.4)] [&>button:focus-visible]:!outline-none [&>button:focus-visible]:!ring-0 [&>button:focus-visible]:!shadow-[0_0_0_1px_rgba(191,152,83,0.4)]`}
                                                        />
                                                    </div>
                                                </th>
                                                <th></th>
                                                <th></th>
                                            </tr>
                                        )}
                                    </thead>
                                    <tbody>
                                        {currentItems.map((expense, index) => (
                                            <tr key={expense.id} className="odd:bg-white even:bg-[#FAF6ED] text-[14px] font-semibold h-[40px]">
                                                <td className="pl-[12px] w-[168px] text-left ">
                                                    <span
                                                        onClick={() => toggleExpandedCell(`${expense.id ?? index}-timestamp`)}
                                                        className={`block w-full cursor-pointer ${expandedCells[`${expense.id ?? index}-timestamp`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                                        title={formatDate(expense.timestamp)}
                                                    >
                                                        {formatDate(expense.timestamp)}
                                                    </span>
                                                </td>
                                                <td className="w-[120px] pr-[1px] text-left ">
                                                    <span
                                                        onClick={() => toggleExpandedCell(`${expense.id ?? index}-date`)}
                                                        className={`block w-full cursor-pointer ${expandedCells[`${expense.id ?? index}-date`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                                        title={formatDateOnly(expense.date)}
                                                    >
                                                        {formatDateOnly(expense.date)}
                                                    </span>
                                                </td>
                                                <td className="pl-[1px] pr-[1px] w-[298px] text-left ">
                                                    <span
                                                        onClick={() => toggleExpandedCell(`${expense.id ?? index}-site`)}
                                                        className={`block w-full cursor-pointer ${expandedCells[`${expense.id ?? index}-site`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                                        title={getDisplaySiteName(expense)}
                                                    >
                                                        {getDisplaySiteName(expense)}
                                                    </span>
                                                </td>
                                                <td className="pl-[1px] pr-[1px] w-[218px] text-left ">
                                                    <span
                                                        onClick={() => toggleExpandedCell(`${expense.id ?? index}-vendor`)}
                                                        className={`block w-full cursor-pointer ${expandedCells[`${expense.id ?? index}-vendor`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                                        title={getDisplayVendorName(expense)}
                                                    >
                                                        {getDisplayVendorName(expense)}
                                                    </span>
                                                </td>
                                                <td className="pl-[1px] pr-[1px] w-[218px] text-left ">
                                                    <span
                                                        onClick={() => toggleExpandedCell(`${expense.id ?? index}-contractor`)}
                                                        className={`block w-full cursor-pointer ${expandedCells[`${expense.id ?? index}-contractor`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                                        title={getDisplayContractorName(expense)}
                                                    >
                                                        {getDisplayContractorName(expense)}
                                                    </span>
                                                </td>
                                                <td className="pl-[1px] pr-[1px] w-[218px] text-left ">
                                                    <span
                                                        onClick={() => toggleExpandedCell(`${expense.id ?? index}-staff`)}
                                                        className={`block w-full cursor-pointer ${expandedCells[`${expense.id ?? index}-staff`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                                        title={getDisplayStaffName(expense)}
                                                    >
                                                        {getDisplayStaffName(expense)}
                                                    </span>
                                                </td>
                                                <td className="pl-[1px] pr-[1px] w-[78px] text-left ">
                                                    <span
                                                        onClick={() => toggleExpandedCell(`${expense.id ?? index}-quantity`)}
                                                        className={`block w-full cursor-pointer ${expandedCells[`${expense.id ?? index}-quantity`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                                        title={String(expense.quantity ?? '')}
                                                    >
                                                        {expense.quantity}
                                                    </span>
                                                </td>
                                                <td className="pl-[1px] pr-[1px] w-[98px] text-right">
                                                    <span
                                                        onClick={() => toggleExpandedCell(`${expense.id ?? index}-amount`)}
                                                        className={`block w-full cursor-pointer text-right ${expandedCells[`${expense.id ?? index}-amount`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                                        title={`₹${Number(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                                    >
                                                        ₹{Number(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="text-left pl-[9px] pr-[1px] w-[198px] px-1">
                                                    <span
                                                        onClick={() => toggleExpandedCell(`${expense.id ?? index}-comments`)}
                                                        className={`block w-full cursor-pointer ${expandedCells[`${expense.id ?? index}-comments`]
                                                            ? 'whitespace-normal break-words'
                                                            : 'truncate whitespace-nowrap overflow-hidden'
                                                            }`}
                                                        title={expense.comments || ''}
                                                    >
                                                        {expense.comments || ''}
                                                    </span>
                                                </td>
                                                <td className="pl-[1px] pr-[1px] w-[158px] text-left ">
                                                    <span
                                                        onClick={() => toggleExpandedCell(`${expense.id ?? index}-category`)}
                                                        className={`block w-full cursor-pointer ${expandedCells[`${expense.id ?? index}-category`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                                        title={expense.category || ''}
                                                    >
                                                        {expense.category}
                                                    </span>
                                                </td>
                                                <td className="pl-[1px] pr-[1px] w-[158px] text-left ">
                                                    <span
                                                        onClick={() => toggleExpandedCell(`${expense.id ?? index}-machineTools`)}
                                                        className={`block w-full cursor-pointer ${expandedCells[`${expense.id ?? index}-machineTools`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                                        title={getMachineToolsItemIdDisplay(expense.machineTools) || ''}
                                                    >
                                                        {getMachineToolsItemIdDisplay(expense.machineTools)}
                                                    </span>
                                                </td>
                                                <td className="pl-[1px] pr-[1px] w-[158px] text-left ">
                                                    <span
                                                        onClick={() => toggleExpandedCell(`${expense.id ?? index}-accountType`)}
                                                        className={`block w-full cursor-pointer ${expandedCells[`${expense.id ?? index}-accountType`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                                        title={expense.accountType || ''}
                                                    >
                                                        {expense.accountType}
                                                    </span>
                                                </td>
                                                <td className="pl-[1px] pr-[1px] w-[120px] text-left ">
                                                    <span
                                                        onClick={() => toggleExpandedCell(`${expense.id ?? index}-paymentMode`)}
                                                        className={`block w-full cursor-pointer ${expandedCells[`${expense.id ?? index}-paymentMode`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                                        title={expense.paymentMode || ''}
                                                    >
                                                        {expense.paymentMode || ''}
                                                    </span>
                                                </td>
                                                <td className="pl-[1px] pr-[1px] w-[158px] text-left ">
                                                    <span
                                                        onClick={() => toggleExpandedCell(`${expense.id ?? index}-source`)}
                                                        className={`block w-full cursor-pointer ${expandedCells[`${expense.id ?? index}-source`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                                        title={expense.source || ''}
                                                    >
                                                        {expense.source}
                                                    </span>
                                                </td>
                                                <td className="pl-[1px] pr-[1px] w-[158px] text-left ">
                                                    <span
                                                        onClick={() => toggleExpandedCell(`${expense.id ?? index}-branch`)}
                                                        className={`block w-full cursor-pointer ${expandedCells[`${expense.id ?? index}-branch`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                                        title={getBranchName(expense.branch_id ?? expense.branchId ?? '') || ''}
                                                    >
                                                        {getBranchName(expense.branch_id ?? expense.branchId ?? '') || ''}
                                                    </span>
                                                </td>
                                                <td className="pl-[1px] pr-[1px] w-[158px] text-left ">
                                                    <span
                                                        onClick={() => toggleExpandedCell(`${expense.id ?? index}-enteredBy`)}
                                                        className={`block w-full cursor-pointer ${expandedCells[`${expense.id ?? index}-enteredBy`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                                        title={expense.enteredBy || 'Sivaprakasm'}
                                                    >
                                                        {expense.enteredBy || 'Sivaprakasm'}
                                                    </span>
                                                </td>
                                                <td className="pl-[1px] pr-[1px] w-[120px] text-right ">
                                                    <span
                                                        onClick={() => toggleExpandedCell(`${expense.id ?? index}-eno`)}
                                                        className={`block w-full cursor-pointer text-right ${expandedCells[`${expense.id ?? index}-eno`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                                        title={String(expense.eno ?? '')}
                                                    >
                                                        {expense.eno}
                                                    </span>
                                                </td>
                                                <td className="pl-[1px] pr-[1px] w-[120px] text-right whitespace-nowrap">
                                                    <span
                                                        onClick={() => toggleExpandedCell(`${expense.id ?? index}-billArrival`)}
                                                        className={`block w-full cursor-pointer text-right ${expandedCells[`${expense.id ?? index}-billArrival`] ? 'whitespace-normal break-words' : 'truncate whitespace-nowrap overflow-hidden'}`}
                                                        title={formatBillArrivalDisplay(expense) || ''}
                                                    >
                                                        {formatBillArrivalDisplay(expense)}
                                                    </span>
                                                </td>
                                                <td className=" flex pl-[9px] pr-[1px] w-[70px] justify-between py-2 gap-[8px]">
                                                    <button onClick={() => handleEditClick(expense)} className="rounded-full transition duration-200">
                                                        <img
                                                            src={edit}
                                                            alt="Edit"
                                                            className=" w-4 h-6 transform hover:scale-110 hover:brightness-110 transition duration-200 "
                                                        />
                                                    </button>
                                                    <button className="">
                                                        <img
                                                            src={remove}
                                                            alt='delete'
                                                            onClick={() => handleDelete(expense.id, username)}
                                                            className='  w-4 h-4 transform hover:scale-110 hover:brightness-110 transition duration-200 ' />
                                                    </button>
                                                    <button onClick={() => fetchAuditDetails(expense.id)} className="rounded-full transition duration-200" >
                                                        <img
                                                            src={history}
                                                            alt="history"
                                                            className=" w-4 h-5 transform hover:scale-110 hover:brightness-110 transition duration-200 "
                                                        />
                                                    </button>
                                                </td>
                                                <td className="pl-[6px] pr-[12px] w-[70px] text-center">
                                                    {expense.billCopy ? (
                                                        <a
                                                            href={expense.billCopy}
                                                            className="text-red-500 underline "
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            View
                                                        </a>
                                                    ) : (
                                                        <span></span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                                    </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}
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
                                            <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                                                className={`px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-[#BF9853] ${currentPage === pageNum
                                                    ? 'bg-[#BF9853] text-white border-[#BF9853]'
                                                    : 'border-gray-300 hover:bg-[#BF9853] hover:text-white'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}
                                        className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#BF9853] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#BF9853]"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                            <Modal isOpen={modalIsOpen} onRequestClose={handleCancel}
                                contentLabel="Edit Expense" className="fixed inset-0 flex items-center justify-center p-4 bg-gray-800 bg-opacity-50 z-[9999]"
                                overlayClassName="fixed inset-0 z-[9999]">
                                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
                                    <h2 className="text-xl font-normal mb-6 border-b-2">Edit Expense</h2>
                                    <form className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-500 font-normal text-left">Date</label>
                                            <div className="mt-1">
                                                <CustomDateField
                                                    value={formData.date}
                                                    onChange={(v) => {
                                                        // Keep existing behavior: prevent clearing the main date field
                                                        if (!v) return;
                                                        setFormData((prev) => ({ ...prev, date: v }));
                                                    }}
                                                    placeholder="Select date"
                                                    alwaysOpenBelow
                                                    className="[&>button]:!border-2 [&>button]:!border-[rgba(191,152,83,0.2)] [&>button]:!rounded-lg [&>button]:!shadow-none [&>button:hover]:!border-[rgba(191,152,83,0.4)] [&>button:focus]:!outline-none [&>button:focus]:!ring-0 [&>button:focus]:!shadow-[0_0_0_1px_rgba(191,152,83,0.4)] [&>button:focus-visible]:!outline-none [&>button:focus-visible]:!ring-0 [&>button:focus-visible]:!shadow-[0_0_0_1px_rgba(191,152,83,0.4)] [&>button]:!font-normal"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 font-normal text-left">Account Type *</label>
                                            <Select
                                                name="accountType"
                                                value={editAccountTypeOptions.find(option => option.value === formData.accountType) || null}
                                                onChange={(selectedOption) =>
                                                    setFormData({
                                                        ...formData,
                                                        accountType: selectedOption?.value || '',
                                                    })
                                                }
                                                options={editAccountTypeOptions}
                                                placeholder="Select"
                                                isClearable
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        fontWeight: 'normal',
                                                        borderColor: 'rgba(191, 152, 83, 0.2)',
                                                        borderWidth: '2px',
                                                        borderRadius: '0.5rem',
                                                        padding: '0.25rem',
                                                        textAlign: 'left',
                                                        boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.4)' : 'none',
                                                        '&:hover': {
                                                            borderColor: 'rgba(191, 152, 83, 0.4)',
                                                        },
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
                                                        fontWeight: 'normal',
                                                        fontSize: '15px',
                                                        backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                        color: 'black',
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        color: '#111827',
                                                        fontWeight: 'normal',
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
                                        <div>
                                            <label className="block text-gray-500 font-normal text-left">Site Name *</label>
                                            <Select
                                                name="siteName"
                                                value={siteOption.find(option => option.value === formData.siteName)}
                                                onChange={(selectedOption) =>
                                                    setFormData({
                                                        ...formData,
                                                        siteName: selectedOption?.value || '',
                                                        projectId: selectedOption?.id || ''
                                                    })
                                                }
                                                options={siteOption}
                                                placeholder="Select Site"
                                                isClearable
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        fontWeight: 'normal',
                                                        borderColor: 'rgba(191, 152, 83, 0.2)',
                                                        borderWidth: '2px',
                                                        borderRadius: '0.5rem',
                                                        padding: '0.25rem',
                                                        textAlign: 'left',
                                                        boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.4)' : 'none',
                                                        '&:hover': {
                                                            borderColor: 'rgba(191, 152, 83, 0.4)',
                                                        },
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
                                                        fontWeight: 'normal',
                                                        fontSize: '15px',
                                                        backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                        color: 'black',
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        color: '#111827',
                                                        fontWeight: 'normal',
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
                                        <div>
                                            <label className="block text-gray-500 font-normal text-left">Vendor Name *</label>
                                            <Select
                                                name="vendor"
                                                options={vendorOption}
                                                value={vendorOption.find(opt => opt.value === formData.vendor)}
                                                onChange={(selectedOption) =>
                                                    setFormData({
                                                        ...formData,
                                                        vendor: selectedOption?.value || '',
                                                        vendorId: selectedOption?.id || '',
                                                        contractor: selectedOption ? '' : formData.contractor,
                                                        contractorId: selectedOption ? '' : formData.contractorId
                                                    })
                                                }
                                                isDisabled={!!formData.contractor}
                                                isClearable
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        fontWeight: 'normal',
                                                        borderColor: 'rgba(191, 152, 83, 0.2)',
                                                        borderWidth: '2px',
                                                        borderRadius: '0.5rem',
                                                        padding: '0.25rem',
                                                        textAlign: 'left',
                                                        boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.4)' : 'none',
                                                        '&:hover': {
                                                            borderColor: 'rgba(191, 152, 83, 0.4)',
                                                        },
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
                                                        fontWeight: 'normal',
                                                        fontSize: '15px',
                                                        backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                        color: 'black',
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        color: '#111827',
                                                        fontWeight: 'normal',
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
                                                placeholder="Select Vendor"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 font-normal text-left">Contractor Name *</label>
                                            <Select
                                                name="contractor"
                                                options={contractorOption}
                                                value={contractorOption.find(opt => opt.value === formData.contractor)}
                                                onChange={(selectedOption) =>
                                                    setFormData({
                                                        ...formData,
                                                        contractor: selectedOption?.value || '',
                                                        contractorId: selectedOption?.id || '',
                                                        vendor: selectedOption ? '' : formData.vendor,
                                                        vendorId: selectedOption ? '' : formData.vendorId
                                                    })
                                                }
                                                isDisabled={!!formData.vendor}
                                                isClearable
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        fontWeight: 'normal',
                                                        borderColor: 'rgba(191, 152, 83, 0.2)',
                                                        borderWidth: '2px',
                                                        borderRadius: '0.5rem',
                                                        padding: '0.25rem',
                                                        textAlign: 'left',
                                                        boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.4)' : 'none',
                                                        '&:hover': {
                                                            borderColor: 'rgba(191, 152, 83, 0.4)',
                                                        },
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
                                                        fontWeight: 'normal',
                                                        fontSize: '15px',
                                                        backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                        color: 'black',
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        color: '#111827',
                                                        fontWeight: 'normal',
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
                                                placeholder="Select Contractor"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 font-normal text-left">Quantity *</label>
                                            <input type="text" name="quantity" value={formData.quantity} onChange={handleChange}
                                                className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)] hover:border-opacity-[0.40] font-normal"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 font-normal text-left">Category *</label>
                                            <Select name="category" value={categoryOption.find(option => option.value === formData.category)}
                                                onChange={(selectedOption) => setFormData({ ...formData, category: selectedOption?.value || '' })}
                                                options={categoryOption}
                                                placeholder="Select Category"
                                                isClearable
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        fontWeight: 'normal',
                                                        borderColor: 'rgba(191, 152, 83, 0.2)',
                                                        borderWidth: '2px',
                                                        borderRadius: '0.5rem',
                                                        padding: '0.25rem',
                                                        textAlign: 'left',
                                                        boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.4)' : 'none',
                                                        '&:hover': {
                                                            borderColor: 'rgba(191, 152, 83, 0.4)',
                                                        },
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
                                                        fontWeight: 'normal',
                                                        fontSize: '15px',
                                                        backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                        color: 'black',
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        color: '#111827',
                                                        fontWeight: 'normal',
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
                                        <div className="relative">
                                            <label className="block text-gray-500 font-normal text-left">Amount *</label>
                                            <span className="absolute top-9 left-3 mt-[2px] text-gray-600 font-normal">₹</span>
                                            <input type="text" name="amount" value={formData.amount} onChange={handleChange}
                                                className="mt-1 block w-full p-2 pl-6 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)] hover:border-opacity-[0.40] font-normal"
                                                onWheel={(e) => e.target.blur()}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 font-normal text-left">Comments *</label>
                                            <input type="text" name="comments" value={formData.comments} onChange={handleChange}
                                                className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)] hover:border-opacity-[0.40] font-normal"
                                            />
                                        </div>
                                        <div>
                                            <div className=' flex'>
                                                <label className="block text-gray-500 font-normal text-left cursor-pointer" htmlFor="fileInput">Bill Copy URL</label>
                                                {selectedFile && <span className="text-orange-600 ml-4">{selectedFile.name}</span>}
                                            </div>
                                            <input type="text" name="billCopy" value={formData.billCopy} onChange={handleChange}
                                                className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)] hover:border-opacity-[0.40] font-normal"
                                            />
                                            <input type="file" className="hidden" id="fileInput" onChange={handleFileChange} />
                                        </div>
                                        {(formData.accountType === 'Bill Payments' || formData.accountType === 'Bill Refund') && (
                                            <div>
                                                <label className="block text-gray-500 font-normal text-left">Bill Arrival Date</label>
                                                <input
                                                    type="date"
                                                    name="billArrivalDate"
                                                    value={formData.billArrivalDate || ''}
                                                    onChange={handleChange}
                                                    className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)] hover:border-opacity-[0.40] font-normal"
                                                />
                                            </div>
                                        )}
                                        {/* Conditional fields based on Account Type */}
                                        {(formData.accountType === 'Claim Payment' || formData.accountType === 'Utility Bills' || formData.accountType === 'Sundry Payment') && (
                                            <div>
                                                <label className="block text-gray-500 font-normal text-left">Payment Mode *</label>
                                                <Select
                                                    name="paymentMode"
                                                    options={finalPaymentModeOptions.map((mode) => ({
                                                        value: mode.modeOfPayment,
                                                        label: mode.modeOfPayment,
                                                    }))}
                                                    value={
                                                        finalPaymentModeOptions
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
                                                    maxMenuHeight={200}
                                                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                    styles={{
                                                        control: (base, state) => ({
                                                            ...base,
                                                            fontWeight: 'normal',
                                                            borderColor: 'rgba(191, 152, 83, 0.2)',
                                                            borderWidth: '2px',
                                                            borderRadius: '0.5rem',
                                                            padding: '0.25rem',
                                                            textAlign: 'left',
                                                            boxShadow: state.isFocused ? '0 0 0 1px rgba(191, 152, 83, 0.4)' : 'none',
                                                            '&:hover': {
                                                                borderColor: 'rgba(191, 152, 83, 0.4)',
                                                            },
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
                                                            fontWeight: 'normal',
                                                            fontSize: '15px',
                                                            backgroundColor: state.isFocused ? 'rgba(191, 152, 83, 0.1)' : 'white',
                                                            color: 'black',
                                                        }),
                                                        singleValue: (base) => ({
                                                            ...base,
                                                            color: '#111827',
                                                            fontWeight: 'normal',
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
                                        )}
                                        {formData.accountType === 'Utility Bills' && (
                                            <>
                                                <div>
                                                    <label className="block text-gray-500 font-normal text-left">Utility Type *</label>
                                                    <select
                                                        name="utilityType"
                                                        value={formData.utilityType}
                                                        onChange={handleChange}
                                                        className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)] hover:border-opacity-[0.40] font-normal">
                                                        <option value="" disabled>--- Select ---</option>
                                                        <option value="Electricity">Electricity</option>
                                                        <option value="Property">Property</option>
                                                        <option value="Water">Water</option>
                                                        <option value="Telecom">Telecom</option>
                                                        <option value="Subscription">Subscription</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-gray-500 font-normal text-left">
                                                        {formData.utilityType === 'Electricity' ? 'EB Number' :
                                                            formData.utilityType === 'Property' ? 'Property Tax Number' :
                                                                formData.utilityType === 'Water' ? 'Water Tax Number' : 'Number'}
                                                    </label>
                                                    <Select
                                                        options={ebNumberOptions}
                                                        value={selectedEbNumber}
                                                        onChange={(opt) => {
                                                            setSelectedEbNumber(opt);
                                                            setFormData((prev) => ({ ...prev, utilityTypeNumber: opt?.label || "" }));
                                                        }}
                                                        isClearable
                                                        placeholder={`Select ${formData.utilityType === 'Electricity' ? 'EB Number' :
                                                            formData.utilityType === 'Property' ? 'Property Tax Number' :
                                                                formData.utilityType === 'Water' ? 'Water Tax Number' : 'Number'}...`}
                                                        styles={{
                                                            ...customStyles,
                                                            singleValue: (provided) => ({
                                                                ...(typeof customStyles.singleValue === 'function' ? customStyles.singleValue(provided) : provided),
                                                                fontWeight: 'normal',
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
                                                <div>
                                                    <label className="block text-gray-500 font-normal text-left">Months</label>
                                                    <input
                                                        type="month"
                                                        name="utilityForTheMonth"
                                                        value={formData.utilityForTheMonth}
                                                        onChange={handleChange}
                                                        placeholder="Enter months..."
                                                        className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)] hover:border-opacity-[0.40] font-normal"
                                                    />
                                                </div>
                                                {(formData.utilityType === 'Telecom' || formData.utilityType === 'Subscription') && (
                                                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">

                                                        {/* Validity */}
                                                        <div>
                                                            <label className="block text-gray-500 font-normal text-left">Validity</label>
                                                            <input
                                                                type="text"
                                                                name="utilityValidityDays"
                                                                value={formData.utilityValidityDays}
                                                                onChange={handleChange}
                                                                placeholder="Enter validity..."
                                                                className="mt-1 w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)] hover:border-opacity-[0.40] font-normal"
                                                            />
                                                        </div>

                                                        {/* Validity Type */}
                                                        <div>
                                                            <label className="block text-gray-500 font-normal text-left">Validity Type</label>
                                                            <select
                                                                name="utilityValidityType"
                                                                value={formData.utilityValidityType}
                                                                onChange={handleChange}
                                                                className="mt-1 w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)] hover:border-opacity-[0.40] font-normal"
                                                            >
                                                                <option value="">--- Select ---</option>
                                                                <option value="Days">Days</option>
                                                                <option value="Month">Month</option>
                                                                <option value="Year">Year</option>
                                                            </select>
                                                        </div>

                                                        {/* Service Start Date */}
                                                        {formData.utilityType === 'Telecom' && (
                                                            <div>
                                                                <label className="block text-gray-500 font-normal text-left">Service Start Date</label>
                                                                <div className="mt-1">
                                                                    <CustomDateField
                                                                        value={formData.serviceStartingDate}
                                                                        onChange={(v) => setFormData((prev) => ({ ...prev, serviceStartingDate: v }))}
                                                                        placeholder="Service start date"
                                                                        className="[&>button]:!font-normal"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                    </div>
                                                )}
                                            </>
                                        )}
                                        <div className="col-span-2 flex justify-end space-x-4 mt-4 border-t-2 ">
                                            <button type="button" onClick={handleCancel} className="px-4 py-2 border-2 border-opacity-[] border-[#BF9853] text-[#BF9853] rounded mt-3">
                                                Cancel
                                            </button>
                                            <button type="submit" disabled={isSubmitting} onClick={handleSave}
                                                className={`px-4 py-2 bg-[#BF9853] text-white rounded mt-3 transition duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {isSubmitting ? 'Submitting...' : 'Submit'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </Modal>
                            {showPaymentModal && createPortal(
                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[10000]">
                                    <div className="bg-white text-left rounded-xl p-6 w-[800px] max-h-[90vh] overflow-y-auto flex flex-col relative">
                                        <h3 className="text-lg font-semibold mb-4 text-center">Payment Details</h3>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="space-y-4 mb-4">
                                                <div className="border-2 border-[#BF9853] border-opacity-25 w-full rounded-lg p-4">
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                                            <CustomDateField
                                                                value={(pendingUpdateFormDataRef.current && pendingUpdateFormDataRef.current.date) || ''}
                                                                onChange={() => { }}
                                                                disabled
                                                                placeholder="Date"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                                                            <input
                                                                type="text"
                                                                value={(pendingUpdateFormDataRef.current && pendingUpdateFormDataRef.current.amount) || ''}
                                                                readOnly
                                                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full text-gray-600 bg-gray-100"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                                                            <input
                                                                type="text"
                                                                value={(pendingUpdateFormDataRef.current && pendingUpdateFormDataRef.current.paymentMode) || ''}
                                                                readOnly
                                                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full text-gray-600 bg-gray-100"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                {(formData.paymentMode === 'GPay'|| formData.paymentMode === 'Gpay' || formData.paymentMode === 'PhonePe' || formData.paymentMode === 'Net Banking' || formData.paymentMode === 'Cheque') && (
                                                    <div className="border-2 border-[#BF9853] border-opacity-25 w-full rounded-lg p-4">
                                                        <div className="space-y-4">
                                                            {formData.paymentMode === 'Cheque' && (
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Cheque No <span className="text-red-500">*</span></label>
                                                                        <input
                                                                            type="text"
                                                                            value={paymentModalData.chequeNo}
                                                                            onChange={(e) => setPaymentModalData(prev => ({ ...prev, chequeNo: e.target.value }))}
                                                                            placeholder="Enter cheque number"
                                                                            className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Cheque Date <span className="text-red-500">*</span></label>
                                                                        <CustomDateField
                                                                            value={paymentModalData.chequeDate}
                                                                            onChange={(v) => setPaymentModalData(prev => ({ ...prev, chequeDate: v }))}
                                                                            placeholder="Cheque date"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Number</label>
                                                                    <input
                                                                        type="text"
                                                                        value={paymentModalData.transactionNumber}
                                                                        onChange={(e) => setPaymentModalData(prev => ({ ...prev, transactionNumber: e.target.value }))}
                                                                        placeholder="Enter transaction number (optional)"
                                                                        className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Number <span className="text-red-500">*</span></label>
                                                                    <select
                                                                        value={paymentModalData.accountNumber}
                                                                        onChange={(e) => setPaymentModalData(prev => ({ ...prev, accountNumber: e.target.value }))}
                                                                        className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                                                    >
                                                                        <option value="">Select Account</option>
                                                                        {accountDetails.map((account) => (
                                                                            <option key={account.id} value={account.account_number}>
                                                                                {account.account_number}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-3 mt-6 p-4 bg-white border-t">
                                            <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 border border-[#BF9853] text-[#BF9853] rounded-lg">
                                                Cancel
                                            </button>
                                            <button type="button" onClick={handlePaymentModalSubmit} disabled={isSubmitting} className="px-4 py-2 bg-[#BF9853] text-white rounded-lg disabled:bg-gray-400">
                                                {isSubmitting ? 'Saving...' : 'Submit'}
                                            </button>
                                        </div>
                                        <button type="button" onClick={() => setShowPaymentModal(false)} className="absolute top-3 right-4 text-xl font-bold text-gray-500 hover:text-black">
                                            ×
                                        </button>
                                    </div>
                                </div>
                            , document.body)}
                            <AuditModal
                                show={showModal}
                                onClose={() => setShowModal(false)}
                                audits={audits}
                                resolveMachineToolsDisplay={getMachineToolsItemIdDisplay}
                            />
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
        </>
    );
};
export default DatabaseExpenses;
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
const AuditModal = ({ show, onClose, audits, resolveMachineToolsDisplay }) => {
    if (!show) return null;
    const fields = [
        { key: "Date", label: "Date" },
        { key: "AccountType", label: "Account Type" },
        { key: "SiteName", label: "Site Name" },
        { key: "Vendor", label: "Vendor" },
        { key: "Contractor", label: "Contractor" },
        { key: "Category", label: "Category" },
        { key: "Quantity", label: "Quantity" },
        { key: "Comments", label: "Comments" },
        { key: "Amount", label: "Amount" },
        { key: "MachineTools", label: "Machine Tools" },
        { key: "BillCopy", label: "Bill Copy" },
    ];
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
    const columnWidths = [
        "210px", "150px", "180px", "160px", "160px", "140px",
        "120px", "200px", "130px", "180px", "150px"
    ];
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-md shadow-lg w-[95%] max-w-[1400px] mx-4 p-4">
                <div className="flex justify-between items-center mt-4 ml-7 mr-7">
                    <h2 className="text-xl font-bold">History</h2>
                    <button onClick={onClose}>
                        <h2 className="text-xl text-red-500 -mt-10 font-bold">x</h2>
                    </button>
                </div>
                <div className="overflow-auto mt-2 max-h-80 border border-l-8 border-l-[#BF9853] rounded-lg ml-7">
                    <table className="table-fixed min-w-full bg-white">
                        <thead className="bg-[#FAF6ED]">
                            <tr>
                                <th style={{ width: '130px' }} className="border-b py-2 px-2 text-left text-base font-bold whitespace-nowrap">Time Stamp</th>
                                <th style={{ width: '120px' }} className="border-b py-2 px-2 text-left text-base font-bold whitespace-nowrap">Edited By</th>
                                <th style={{ width: '210px' }} className="border-b py-2 px-8 text-left text-base font-bold whitespace-nowrap">Date</th>
                                <th style={{ width: '150px' }} className="border-b py-2 px-2 text-center text-base font-bold whitespace-nowrap">Account Type</th>
                                <th style={{ width: '180px' }} className="border-b py-2 px-12 text-center text-base font-bold whitespace-nowrap">Site Name</th>
                                <th style={{ width: '160px' }} className="border-b py-2 px-10 text-center text-base font-bold whitespace-nowrap">Vendor</th>
                                <th style={{ width: '160px' }} className="border-b py-2 px-10 text-center text-base font-bold whitespace-nowrap">Contractor</th>
                                <th style={{ width: '140px' }} className="border-b py-2 px-2 text-center text-base font-bold whitespace-nowrap">Category</th>
                                <th style={{ width: '120px' }} className="border-b py-2 px-2 text-center text-base font-bold whitespace-nowrap">Quantity</th>
                                <th style={{ width: '200px' }} className="border-b py-2 px-2 text-center text-base font-bold whitespace-nowrap">Comments</th>
                                <th style={{ width: '130px' }} className="border-b py-2 px-2 text-center text-base font-bold whitespace-nowrap">Amount</th>
                                <th style={{ width: '180px' }} className="border-b py-2 px-2 text-center text-base font-bold whitespace-nowrap">Machine Tools</th>
                                <th style={{ width: '300px' }} className="border-b py-2 px-14 text-center text-base font-bold whitespace-nowrap">Bill Copy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {audits.map((audit, index) => (
                                <React.Fragment key={index}>
                                    <tr className="odd:bg-white even:bg-[#FAF6ED]">
                                        <td style={{ width: '130px' }} className="border pl-2 text-sm text-left whitespace-nowrap">
                                            {formatDate(audit.editedDate)}
                                        </td>
                                        <td style={{ width: '120px' }} className="border pl-2 text-sm text-left whitespace-nowrap">
                                            {audit.editedBy}
                                        </td>
                                        {fields.map(({ key }, i) => {
                                            let value = audit[`old${key}`];
                                            if (key.toLowerCase().includes("amount")) {
                                                value = value && !isNaN(value) ? Number(value).toLocaleString("en-IN") : "-";
                                            }
                                            if (key.toLowerCase().includes("date")) {
                                                value = value ? new Date(value).toLocaleDateString("en-GB") : "-";
                                            }
                                            if (key === "MachineTools" && resolveMachineToolsDisplay && value != null && value !== "") {
                                                value = resolveMachineToolsDisplay(value);
                                            }
                                            return (
                                                <td key={key} style={{ width: columnWidths[i] }} className="border text-sm text-center">
                                                    {value ?? "-"}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                    <tr className="odd:bg-white even:bg-[#FAF6ED]">
                                        <td style={{ width: '130px' }} className="border pl-2 text-sm text-left whitespace-nowrap">
                                            {formatDate(audit.editedDate)}
                                        </td>
                                        <td style={{ width: '120px' }} className="border pl-2 text-sm text-left whitespace-nowrap">
                                            {audit.editedBy}
                                        </td>
                                        {fields.map(({ key }, i) => {
                                            const oldVal = audit[`old${key}`];
                                            const rawNewVal = audit[`new${key}`];
                                            let value = rawNewVal;
                                            if (key.toLowerCase().includes("amount")) {
                                                value = value && !isNaN(value) ? Number(value).toLocaleString("en-IN") : "-";
                                            }
                                            if (key.toLowerCase().includes("date")) {
                                                value = value ? new Date(value).toLocaleDateString("en-GB") : "-";
                                            }
                                            let displayValue = value;
                                            if (key === "MachineTools" && resolveMachineToolsDisplay && rawNewVal != null && rawNewVal !== "") {
                                                displayValue = resolveMachineToolsDisplay(rawNewVal);
                                            }
                                            const changed = key === "MachineTools"
                                                ? String(oldVal ?? "") !== String(rawNewVal ?? "")
                                                : oldVal !== value;
                                            return (
                                                <td key={key} style={{ width: columnWidths[i] }}
                                                    className={`border text-sm text-center ${changed ? "bg-[#BF9853] text-black font-bold" : ""}`}
                                                >
                                                    {displayValue ?? "-"}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
