import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import edit from '../Images/Edit.svg';
import Select from 'react-select';
import Filter from '../Images/filter (3).png'
import Reload from '../Images/rotate-right.png'
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    postBankRegisterLogSave,
    bankRegisterLogSaveUrlMatchingRequest,
    isPaymentModeRequiringBankRegisterLog,
} from '../../utils/bankRegisterLogBeforeWeeklyBill';
import XL from '../Images/sheets.png'
import Pdf from '../Images/pdf.png'
import CustomDateField from './CustomDateField';
import { Calendar } from 'lucide-react';
import DateRangePicker from './DateRangePicker';
Modal.setAppElement('#root');
const EDIT_POPUP_UTILITY_TYPE_OPTIONS = [
    { value: 'Electricity', label: 'Electricity' },
    { value: 'Property', label: 'Property' },
    { value: 'Water', label: 'Water' },
    { value: 'Telecom', label: 'Telecom' },
    { value: 'Subscription', label: 'Subscription' },
];
const EDIT_POPUP_VALIDITY_TYPE_OPTIONS = [
    { value: 'Days', label: 'Days' },
    { value: 'Month', label: 'Month' },
    { value: 'Year', label: 'Year' },
];
const TOOLS_API_BASE = 'https://backendaab.in/demoAabuildersDash';

/** Scoped styles to match Bank Register ledger table UI (BankRegisterPayments.jsx). */
const TVE_LEDGER_TABLE_UI_CSS = `
.tve-exp-ledger-ui{
  --gold:#D6AB60; --gold-soft:#E6C68A; --gold-deep:#B8924B;
  --ink:#212121; --ink-2:#3a3a3a; --muted:#8a8275;
  --cream:#FBF7F0; --cream-2:#F5EFE3; --cream-3:#FAF4E8; --row-alt:#FAF4E8;
  --line:#EADFC8; --line-soft:#f0e9d8;
  --green:#2f9e6e; --green-bg:#E0F1E5;
  --red:#d23b3b; --red-bg:#FFE7E7;
}
.tve-exp-ledger-ui .ledger-card{background:#fff;border:1px solid var(--line);border-radius:12px;overflow:hidden;display:flex;}
.tve-exp-ledger-ui .ledger-card .accent{width:5px;background:var(--gold);flex-shrink:0;}
.tve-exp-ledger-ui .ledger-card .body{flex:1;min-width:0;}
/* Same as BankRegisterPayments.jsx .ledger-table: fixed layout + separate borders + colgroup widths = no column shift when filter row mounts. */
.tve-exp-ledger-ui .ledger-table{width:100%;table-layout:fixed;border-collapse:separate;border-spacing:0;}
.tve-exp-ledger-ui .ledger-table th{
  font-size:12px;font-weight:700;color:var(--ink);text-align:left;padding:12px 10px;background:#fff;
  white-space:nowrap;border-bottom:1px solid var(--line);letter-spacing:0.005em;
  position:sticky;top:0;z-index:2;vertical-align:middle;
}
.tve-exp-ledger-ui .ledger-table th.text-right,
.tve-exp-ledger-ui .ledger-table td.text-right{text-align:right;}
/* Amount column: one shared right edge for heading, filter total, and row amounts */
.tve-exp-ledger-ui .ledger-table th.tve-amount-col,
.tve-exp-ledger-ui .ledger-table td.tve-amount-col{
  text-align:right;
  font-variant-numeric:tabular-nums;
  padding-left:10px;
  padding-right:10px;
  box-sizing:border-box;
  letter-spacing:normal;
  font-size:12.5px;
  font-weight:400;
  white-space:nowrap;
}
.tve-exp-ledger-ui .ledger-table thead tr:first-child th.tve-amount-col .tve-amount-th-inner{
  display:inline-flex;
  width:100%;
  justify-content:flex-end;
  align-items:center;
  gap:3px;
}
.tve-exp-ledger-ui .ledger-table thead tr.filter-row th.tve-amount-col{font-weight:400;}
.tve-exp-ledger-ui .ledger-table thead tr:first-child th.tve-amount-col{font-weight:700;}
.tve-exp-ledger-ui .ledger-table th:hover{background:var(--cream-2);}
.tve-exp-ledger-ui .ledger-table thead tr.filter-row th{
  position:sticky;top:var(--tve-sticky-header-h, 44px);z-index:3;background:#fff;
  border-top:1px solid var(--line);
  padding-top:8px;padding-bottom:5px;padding-left:10px;padding-right:10px;
}
.tve-exp-ledger-ui .ledger-table.tve-filters-open tbody tr:first-child td{
  padding-top:6px !important;
}
.tve-exp-ledger-ui .ledger-table thead tr.filter-row th:first-child{z-index:4;}
/* When filter row is shown: same as Bank Register noBottomBorder — only remove double border; keep default th padding (12px 10px) so headings/data vertical rhythm matches. */
.tve-exp-ledger-ui .ledger-table.tve-filters-open thead tr:first-child th{
  border-bottom:0 !important;
}
.tve-exp-ledger-ui .ledger-table td{
  font-size:12.5px;color:var(--ink-2);padding:12px 10px;vertical-align:middle;
  border-top:1px solid var(--line-soft);
}
.tve-exp-ledger-ui .ledger-table td.tve-col-wrap{white-space:normal;word-break:break-word;}
.tve-exp-ledger-ui .ledger-table tbody tr:nth-child(even){background:var(--row-alt);}
.tve-exp-ledger-ui .num-cell{font-variant-numeric:tabular-nums;white-space:nowrap;}
.tve-exp-ledger-ui .truncate-cell{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.tve-exp-ledger-ui .ink{color:var(--ink);}
.tve-exp-ledger-ui .muted{color:var(--muted);}
.tve-exp-ledger-ui .table-scroll{max-height:600px;overflow-y:auto;overflow-x:auto;}
.tve-exp-ledger-ui .table-scroll::-webkit-scrollbar{width:8px;height:8px;}
.tve-exp-ledger-ui .table-scroll::-webkit-scrollbar-thumb{background:var(--line);border-radius:8px;}
.tve-exp-ledger-ui .table-scroll::-webkit-scrollbar-thumb:hover{background:var(--gold-soft);}
.tve-exp-ledger-ui .table-scroll::-webkit-scrollbar-track{background:transparent;}
.tve-exp-ledger-ui .expenses-table-wrap .ledger-table{min-width:1971px;}
.tve-exp-ledger-ui .act-cell{display:flex;align-items:center;justify-content:flex-start;gap:7px;}
`;

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [exportFilteredExpenses, setExportFilteredExpenses] = useState([]);
    const [editId, setEditId] = useState(null);
    const sentToWeeklyPaymentBillsRef = useRef(new Set());
    const [siteOptions, setSiteOptions] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [contractorOptions, setContractorOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [machineToolsOptions, setMachineToolsOptions] = useState([]);
    const [machineToolsCatalog, setMachineToolsCatalog] = useState([]);
    const [branchOptions, setBranchOptions] = useState([]);
    const [sourceOptions, setSourceOptions] = useState([]);
    const [branchFilterOptions, setBranchFilterOptions] = useState([]);
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
    const [selectedFile, setSelectedFile] = useState(null);
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
    const [selectedBranch, setSelectedBranch] = useState(() => {
        return localStorage.getItem('expenseFilter_branch') || '';
    });
    const [accountTypeOption, setAccountTypeOption] = useState([]);
    const [editAccountTypeOptions, setEditAccountTypeOptions] = useState([]);
    const [siteOption, setSiteOption] = useState([]);
    const [vendorOption, setVendorOption] = useState([]);
    const [contractorOption, setContractorOption] = useState([]);
    const [categoryOption, setCategoryOption] = useState([]);
    const [machineToolsOption, setMachineToolsOption] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [showDateRangePicker, setShowDateRangePicker] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const scrollRef = useRef(null);
    const filterRowRef = useRef(null);
    const headerRowRef = useRef(null);
    const isDragging = useRef(false);
    const start = useRef({ x: 0, y: 0 });
    const scroll = useRef({ left: 0, top: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const animationFrame = useRef(null);
    const lastMove = useRef({ time: 0, x: 0, y: 0 });
    const handleMouseDown = (e) => {
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
        const STYLE_ID = 'tve-expense-ledger-table-ui-css';
        if (document.getElementById(STYLE_ID)) return;
        const el = document.createElement('style');
        el.id = STYLE_ID;
        el.textContent = TVE_LEDGER_TABLE_UI_CSS;
        document.head.appendChild(el);
    }, []);
    /** Keeps filter-row `top` equal to sort-header height so tbody does not show between sticky rows. */
    useLayoutEffect(() => {
        const scroller = scrollRef.current;
        const headerTr = headerRowRef.current;
        if (!scroller || !headerTr) return undefined;
        const apply = () => {
            const h = headerTr.getBoundingClientRect().height;
            if (h > 0) scroller.style.setProperty('--tve-sticky-header-h', `${h}px`);
        };
        apply();
        const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(apply) : null;
        ro?.observe(headerTr);
        window.addEventListener('resize', apply);
        return () => {
            ro?.disconnect();
            window.removeEventListener('resize', apply);
            scroller.style.removeProperty('--tve-sticky-header-h');
        };
    }, [showFilters]);
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
        localStorage.setItem('expenseFilter_branch', selectedBranch);
    }, [selectedBranch]);
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
        const uniqueEnos = [...new Set(response.data.map(expense => expense.eno))];
        const uniqueAccountTypes = [...new Set(response.data.map(expense => expense.accountType))];
        const uniqueProjectNames = [...new Set(response.data.map(expense => expense.siteName))];
        const siteOptions = uniqueProjectNames.map(name => ({ value: name, label: name }));
        const uniqueVendorOptions = [...new Set(response.data.map(expense => expense.vendor))];
        const vendorOptions = uniqueVendorOptions.map(name => ({ value: name, label: name }));
        const uniqueContractorOptions = [...new Set(response.data.map(expense => expense.contractor))];
        const uniqueCategoryOptions = [...new Set(response.data.map(expense => expense.category))];
        const contractorOption = uniqueContractorOptions.map(name => ({ value: name, label: name }));
        const categoryOption = uniqueCategoryOptions.map(name => ({ value: name, label: name }));
        setEnoOptions(uniqueEnos);
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
            return (
                (selectedSiteName ? expense.siteName === selectedSiteName : true) &&
                (selectedVendor ? expense.vendor === selectedVendor : true) &&
                (selectedContractor ? expense.contractor === selectedContractor : true) &&
                (selectedCategory ? expense.category === selectedCategory : true) &&
                (selectedMachineTools ? String(expense.machineTools ?? '') === String(selectedMachineTools) : true) &&
                (selectedSource ? expense.source === selectedSource : true) &&
                (selectedBranch ? String(expense.branch_id ?? expense.branchId ?? '') === String(selectedBranch) : true) &&
                (selectedAccountType ?
                    (selectedAccountType === 'Unknown' ?
                        (!expense.accountType || expense.accountType === '') :
                        expense.accountType === selectedAccountType
                    ) : true) &&
                (selectedEno ? String(expense.eno) === String(selectedEno) : true)
            );
        });
        setFilteredExpenses(filtered);
        setCurrentPage(1);
        const anyFilterApplied = [
            selectedSiteName,
            selectedVendor,
            selectedContractor,
            selectedCategory,
            selectedMachineTools,
            selectedSource,
            selectedBranch,
            selectedAccountType,
            startDate,
            endDate,
            selectedEno
        ].some(Boolean);
        setExportFilteredExpenses(anyFilterApplied ? filtered : []);
        const total = filtered.reduce((sum, item) => sum + Number(item.amount || 0), 0);
        setTotalAmount(total);
        const getOptions = (data, key) => {
            const unique = [...new Set(data.map(item => item[key]).filter(Boolean))];
            return unique.map(val => ({ value: val, label: val }));
        };
        setSiteOptions(getOptions(filtered, "siteName"));
        setVendorOptions(getOptions(filtered, "vendor"));
        setContractorOptions(getOptions(filtered, "contractor"));
        setCategoryOptions(getOptions(filtered, "category"));
        setSourceOptions(getOptions(filtered, "source"));
        const uniqueBranchIds = [...new Set(filtered.map(item => item.branch_id ?? item.branchId).filter(Boolean))];
        setBranchFilterOptions(
            uniqueBranchIds.map(id => ({
                value: String(id),
                label: branchOptions.find(branch => String(branch.id) === String(id))?.branch || String(id)
            }))
        );
        const uniqueToolIds = [...new Set(filtered.map((item) => item.machineTools).filter((v) => v != null && v !== ''))];
        setMachineToolsOptions(
            uniqueToolIds.map((id) => ({
                value: String(id),
                label:
                    machineToolsIdToLabel[id] ??
                    machineToolsIdToLabel[String(id)] ??
                    String(id),
            }))
        );
        setAccountTypeOptions(getOptions(filtered, "accountType"));
        setEnoOptions([...new Set(filtered.map(item => item.eno).filter(Boolean))]);
    }, [
        selectedSiteName,
        selectedVendor,
        selectedContractor,
        selectedCategory,
        selectedMachineTools,
        selectedSource,
        selectedBranch,
        selectedAccountType,
        startDate,
        endDate,
        selectedEno,
        expenses,
        machineToolsIdToLabel,
        branchOptions
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
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
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
        if (!raw) return '—';
        const head = String(raw).trim().slice(0, 10);
        if (/^\d{4}-\d{2}-\d{2}$/.test(head)) return formatChipDateDMY(head) || '—';
        try {
            return formatDateOnly(raw) || '—';
        } catch {
            return String(raw);
        }
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
        const isPaymentType = (updatedFormData.accountType === 'Claim' || updatedFormData.accountType === 'Utility Bills' || updatedFormData.accountType === 'Weekly Payment');
        const isNonCashPaymentMode = ['GPay', 'PhonePe', 'Net Banking', 'Cheque'].includes(updatedFormData.paymentMode);
        const previousPaymentMode = expenses.find(e => e.id === editId)?.paymentMode || '';
        const isChangingFromCashToOnline = previousPaymentMode === 'Cash' && isNonCashPaymentMode;
        if (isPaymentType && isNonCashPaymentMode && isChangingFromCashToOnline) {
            pendingUpdateFormDataRef.current = updatedFormData;
            setPaymentModalData({
                chequeNo: '',
                chequeDate: '',
                transactionNumber: '',
                accountNumber: ''
            });
            setShowPaymentModal(true);
            setIsSubmitting(false);
            return;
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
        const isPaymentTypeForWeekly = (updatedFormData.accountType === 'Claim' || updatedFormData.accountType === 'Utility Bills' || updatedFormData.accountType === 'Weekly Payment');
        if (
            isPaymentTypeForWeekly &&
            isPaymentModeRequiringBankRegisterLog(updatedFormData.paymentMode) &&
            editId &&
            !sentToWeeklyPaymentBillsRef.current.has(editId)
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
        const isPaymentType = (updatedFormData.accountType === 'Claim' || updatedFormData.accountType === 'Utility Bills' || updatedFormData.accountType === 'Weekly Payment');
        const isNonCashPaymentMode = ['GPay', 'PhonePe', 'Net Banking', 'Cheque'].includes(updatedFormData.paymentMode);
        if (isPaymentType && isNonCashPaymentMode && editId && !sentToWeeklyPaymentBillsRef.current.has(editId)) {
            try {
                const weeklyPaymentBillPayload = {
                    date: updatedFormData.date,
                    created_at: new Date().toISOString(),
                    contractor_id: updatedFormData.contractorId || null,
                    vendor_id: updatedFormData.vendorId || null,
                    employee_id: null,
                    project_id: updatedFormData.projectId || null,
                    type: updatedFormData.accountType === 'Claim' ? 'Claim Payment' : updatedFormData.accountType === 'Weekly Payment' ? 'Weekly Payment' : 'Utility Payment',
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
                    account_number: (modalPaymentData && modalPaymentData.accountNumber) || null
                };
                const weeklyResponse = await fetch('https://backendaab.in/demoAabuildersDash/api/weekly-payment-bills/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(weeklyPaymentBillPayload)
                });
                if (weeklyResponse.ok) sentToWeeklyPaymentBillsRef.current.add(editId);
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
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };
    const customStyles = useMemo(() => ({
        control: (provided, state) => ({
            ...provided,
            borderWidth: '2px',
            lineHeight: '20px',
            fontSize: '14px',
            fontWeight: 100,
            minHeight: '41px',
            height: '41px',
            borderRadius: '8px',
            padding: '0.15rem',
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
            fontWeight: 400,
            marginRight: 0,
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#d3d5db',
            textAlign: 'left',
            fontWeight: 'normal',
        }),
        input: (provided) => ({
            ...provided,
            fontWeight: 400,
        }),
        valueContainer: (provided) => ({
            ...provided,
            paddingRight: '2px',
            fontWeight: 400,
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            paddingLeft: '0px',
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            padding: '4px',
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
            color: '#d3d5db',
            textAlign: 'left',
            fontWeight: 'normal',
        }),
        indicatorSeparator: (provided) => ({
            ...provided,
            display: 'none',
        }),
    }), []);
    /** BankRegisterPayments.jsx filter `selectStyles` — used only on ledger table filter row so spacing matches bank; modals keep `customStyles`. */
    const ledgerFilterSelectStyles = useMemo(() => ({
        control: (base) => ({
            ...base,
            minHeight: 45,
            height: 'auto',
            borderRadius: 8,
            borderColor: 'var(--line)',
            borderWidth: '1px',
            boxShadow: 'none',
            backgroundColor: '#fff',
            textAlign: 'left',
            fontWeight: 400,
        }),
        valueContainer: (base) => ({ ...base, padding: '4px 8px', flexWrap: 'nowrap' }),
        input: (base) => ({ ...base, margin: 0, padding: 0, fontWeight: 400, fontSize: 13 }),
        indicatorsContainer: (base) => ({ ...base, height: 45 }),
        dropdownIndicator: (base) => ({ ...base, padding: 6 }),
        indicatorSeparator: () => ({ display: 'none' }),
        clearIndicator: (base) => ({ ...base, padding: 0 }),
        menu: (base) => ({ ...base, zIndex: 999 }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        option: (base) => ({ ...base, fontSize: 13, textAlign: 'left' }),
        placeholder: (base) => ({ ...base, fontSize: 13, fontWeight: 400, color: 'var(--ink-2)' }),
        singleValue: (base) => ({
            ...base,
            fontSize: 13,
            fontWeight: 400,
            color: 'var(--ink-2)',
            textAlign: 'left',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        }),
        menuList: (base) => ({
            ...base,
            textAlign: 'left',
            maxHeight: 250,
            overflowY: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
        }),
    }), []);
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
    const handleCancel = () => {
        setModalIsOpen(false);
        setSelectedFile(null);
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
        setStartDate('');
        setEndDate('');
        setSelectedEno('');
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
        localStorage.removeItem('expenseFilter_branch');
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
    return (
        <body className=' bg-[#FAF6ED] px-6'>
            <div>

                <div className="w-full p-6 pb-10 bg-white shadow-lg overflow-x-auto">
                    <div className={`text-left flex ${selectedSiteName || selectedVendor || selectedContractor || selectedCategory || selectedAccountType || selectedMachineTools || selectedSource || selectedBranch || startDate || endDate || selectedEno
                        ? 'flex-col sm:flex-row sm:justify-between' : 'flex-row justify-between items-center'} mb-3 gap-2`}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                            <button
                                className='w-9 h-9 border border-[#BF9853] rounded-md flex items-center justify-center text-[#BF9853]'
                                onClick={() => {
                                    const willOpen = !showFilters;
                                    setShowFilters(willOpen);
                                    if (!willOpen) return;
                                    const scroller = scrollRef.current;
                                    if (!scroller) return;
                                    if (scroller.scrollTop <= 0) return;
                                    requestAnimationFrame(() => {
                                        const h = filterRowRef.current?.offsetHeight || 0;
                                        if (h > 0) scroller.scrollTop = scroller.scrollTop + h;
                                    });
                                }}
                            >
                                <img
                                    src={Filter}
                                    alt="Toggle Filter"
                                    className="w-5 h-5 object-contain"
                                />
                            </button>
                            {(selectedSiteName || selectedVendor || selectedContractor || selectedCategory || selectedAccountType || selectedMachineTools || selectedSource || selectedBranch || startDate || endDate || selectedEno) && (
                                <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-2 sm:mt-0">
                                    {startDate && endDate ? (
                                        <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium w-fit">
                                            <span className="font-normal">Start date: </span>
                                            <span className="font-bold">{startDate.split('-').reverse().join('-')}</span>
                                            <span className="font-normal">, End date: </span>
                                            <span className="font-bold">{endDate.split('-').reverse().join('-')}</span>
                                            <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    ) : startDate ? (
                                        <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium w-fit">
                                            <span className="font-normal">Start date: </span>
                                            <span className="font-bold">{startDate.split('-').reverse().join('-')}</span>
                                            <button onClick={() => setStartDate('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    ) : endDate ? (
                                        <span className="inline-flex items-center gap-1 border text-[#BF9853] border-[#BF9853] rounded px-2 text-sm font-medium w-fit">
                                            <span className="font-normal">End date: </span>
                                            <span className="font-bold">{endDate.split('-').reverse().join('-')}</span>
                                            <button onClick={() => setEndDate('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    ) : null}
                                    {selectedSiteName && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Site Name: </span>
                                            <span className="font-bold">{selectedSiteName}</span>
                                            <button onClick={() => setSelectedSiteName('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {selectedVendor && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Vendor Name: </span>
                                            <span className="font-bold">{selectedVendor}</span>
                                            <button onClick={() => setSelectedVendor('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {selectedContractor && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Contractor Name: </span>
                                            <span className="font-bold">{selectedContractor}</span>
                                            <button onClick={() => setSelectedContractor('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {selectedCategory && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Category: </span>
                                            <span className="font-bold">{selectedCategory}</span>
                                            <button onClick={() => setSelectedCategory('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {selectedAccountType && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Mode: </span>
                                            <span className="font-bold">{selectedAccountType}</span>
                                            <button onClick={() => setSelectedAccountType('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {selectedMachineTools && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Tools: </span>
                                            <span className="font-bold">{getMachineToolsItemIdDisplay(selectedMachineTools)}</span>
                                            <button onClick={() => setSelectedMachineTools('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {selectedSource && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Source From: </span>
                                            <span className="font-bold">{selectedSource}</span>
                                            <button onClick={() => setSelectedSource('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {selectedBranch && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">Branch: </span>
                                            <span className="font-bold">{getBranchName(selectedBranch) || selectedBranch}</span>
                                            <button onClick={() => setSelectedBranch('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {selectedEno && (
                                        <span className="inline-flex items-center gap-1 text-[#BF9853] border border-[#BF9853] rounded px-2 py-1 text-sm font-medium w-fit">
                                            <span className="font-normal">E.No: </span>
                                            <span className="font-bold">{selectedEno}</span>
                                            <button onClick={() => setSelectedEno('')} className="text-[#BF9853] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className='flex items-center gap-2'>
                            <button onClick={clearFilters}
                                className='w-10 h-9 border border-[#BF9853] rounded-md font-semibold text-sm text-[#BF9853] flex items-center justify-center gap-2' >
                                <img className='w-4 h-4' src={Reload} alt="Reload" />
                            </button>
                            <div className=' text-left md:text-right md:items-center items-start cursor-default flex max-w-screen-2xl table-auto overflow-auto w-full'>
                                <div className='flex items-center'>
                                    <span className='text-[#E4572E] mr-4 flex items-center gap-1 font-semibold hover:underline cursor-pointer' onClick={generateFilteredPDF}>PDF<img src={Pdf} alt="Pdf" className='w-4 h-4' /></span>
                                    <span className='text-[#007233] mr-1 flex items-center gap-1 font-semibold hover:underline cursor-pointer' onClick={exportToCSV}>XL<img src={XL} alt="XL" className='w-4 h-4' /></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="tve-exp-ledger-ui w-full" style={{ color: 'var(--ink, #212121)' }}>
                        <div className="ledger-card">
                            <div className="accent" aria-hidden="true" />
                            <div className="body">
                                <div
                                    ref={scrollRef}
                                    className="desk-table expenses-table-wrap table-scroll select-none px-2 thin-scrollbar"
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                >
                                    <table className={`ledger-table min-w-[1971px] w-full${showFilters ? ' tve-filters-open' : ''}`}>
                                        <colgroup>
                                            <col style={{ width: '150px' }} />
                                            <col style={{ width: '280px' }} />
                                            <col style={{ width: '220px' }} />
                                            <col style={{ width: '200px' }} />
                                            <col style={{ width: '100px' }} />
                                            <col style={{ width: '70px' }} />
                                            <col style={{ width: '90px' }} />
                                            <col style={{ width: '110px' }} />
                                            <col style={{ width: '110px' }} />                                            
                                            <col style={{ width: '120px' }} />
                                            <col style={{ width: '110px' }} />
                                            <col style={{ width: '110px' }} />
                                            <col style={{ width: '120px' }} />
                                            <col style={{ width: '100px' }} />
                                            <col style={{ width: '100px' }} />
                                            <col style={{ width: '40px' }} />
                                            <col style={{ width: '30px' }} />
                                        </colgroup>
                                <thead>
                                    <tr ref={headerRowRef}>
                                        <th className="w-[150px] text-left cursor-pointer select-none" onClick={() => handleSort('date')}>
                                            Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="w-[280px] text-left cursor-pointer select-none" onClick={() => handleSort('siteName')}>
                                            Project Name {sortField === 'siteName' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="w-[220px] text-left cursor-pointer select-none" onClick={() => handleSort('vendor')}>
                                            Vendor {sortField === 'vendor' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="w-[200px] text-left cursor-pointer select-none" onClick={() => handleSort('contractor')}>
                                            Contractor {sortField === 'contractor' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="w-[100px] text-left cursor-pointer select-none" onClick={() => handleSort('staff')}>
                                            Staff {sortField === 'staff' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="w-[70px] text-left cursor-pointer select-none" onClick={() => handleSort('quantity')}>
                                            Quantity {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="w-[90px] tve-amount-col text-right cursor-pointer select-none" onClick={() => handleSort('amount')}>
                                            <span className="tve-amount-th-inner">
                                                {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                                                <span>Amount</span>
                                            </span>
                                        </th>                                        
                                        <th className="w-[110px] text-left cursor-pointer select-none" onClick={() => handleSort('category')}>
                                            Category {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="w-[110px] text-left cursor-pointer select-none" onClick={() => handleSort('accountType')}>
                                            A/C Type {sortField === 'accountType' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="w-[120px] text-left cursor-pointer select-none" onClick={() => handleSort('comments')}>
                                            Description {sortField === 'comments' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="w-[110px] text-left cursor-pointer select-none" onClick={() => handleSort('machineTools')}>
                                            Machine Tools {sortField === 'machineTools' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="w-[110px] text-left cursor-pointer select-none" onClick={() => handleSort('source')}>
                                            Source From {sortField === 'source' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="w-[120px] text-left cursor-pointer select-none" onClick={() => handleSort('branch')}>
                                            Branch {sortField === 'branch' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="w-[100px] text-left cursor-pointer select-none" onClick={() => handleSort('eno')}>
                                            E.No {sortField === 'eno' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="w-[100px] text-left cursor-pointer select-none" onClick={() => handleSort('billArrivalDate')}>
                                            Bill Arrival {sortField === 'billArrivalDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="w-[40px] text-left">Edit</th>
                                        <th className="w-[30px] text-left">File</th>
                                    </tr>
                                    {showFilters && (
                                        <tr ref={filterRowRef} className="filter-row">
                                            <th>
                                                <div className="relative [&>button]:!border-2 [&>button]:!border-[rgba(191,152,83,0.2)] [&>button]:!rounded-lg [&>button]:!shadow-none [&>button:hover]:!border-[rgba(191,152,83,0.4)] [&>button:focus]:!outline-none [&>button:focus]:!ring-0 [&>button:focus]:!shadow-[0_0_0_1px_rgba(191,152,83,0.4)] [&>button:focus-visible]:!outline-none [&>button:focus-visible]:!ring-0 [&>button:focus-visible]:!shadow-[0_0_0_1px_rgba(191,152,83,0.4)]">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowDateRangePicker(true)}
                                                        className="w-full max-w-[130px] h-[45px] px-2 py-0 text-sm !font-normal bg-white text-left flex items-center gap-1"
                                                    >
                                                        <span className={`text-[14px] truncate flex-1 min-w-0 text-left ${startDate && endDate ? 'text-black font-medium' : 'text-[#d3d5db] !font-normal'}`}>
                                                            {startDate
                                                                ? endDate
                                                                    ? `${startDate.split('-').reverse().join('-')} – ${endDate.split('-').reverse().join('-')}`
                                                                    : `From ${startDate.split('-').reverse().join('-')}`
                                                                : 'Date'}
                                                        </span>
                                                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                    </button>
                                                    <DateRangePicker
                                                        isOpen={showDateRangePicker}
                                                        onClose={() => setShowDateRangePicker(false)}
                                                        startDate={startDate}
                                                        endDate={endDate}
                                                        variant="dropdown"
                                                        onApply={(from, to) => {
                                                            setStartDate(from);
                                                            setEndDate(to);
                                                        }}
                                                    />
                                                </div>
                                            </th>
                                            <th>
                                                <Select
                                                    className="w-full"
                                                    options={siteOptions}
                                                    value={selectedSiteName ? { value: selectedSiteName, label: selectedSiteName } : null}
                                                    onChange={(selectedOption) => setSelectedSiteName(selectedOption ? selectedOption.value : '')}
                                                    placeholder="All"
                                                    isClearable
                                                    isSearchable
                                                    menuPlacement="bottom"
                                                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                    styles={ledgerFilterSelectStyles}
                                                />
                                            </th>
                                            <th>
                                                <Select
                                                    className="w-full"
                                                    options={vendorOptions}
                                                    value={selectedVendor ? { value: selectedVendor, label: selectedVendor } : null}
                                                    onChange={(selectedOption) => setSelectedVendor(selectedOption ? selectedOption.value : '')}
                                                    placeholder="All"
                                                    isClearable
                                                    isSearchable
                                                    menuPlacement="bottom"
                                                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                    styles={ledgerFilterSelectStyles}
                                                />
                                            </th>
                                            <th>
                                                <Select
                                                    className="w-full"
                                                    options={contractorOptions}
                                                    value={selectedContractor ? { value: selectedContractor, label: selectedContractor } : null}
                                                    onChange={(selectedOption) => setSelectedContractor(selectedOption ? selectedOption.value : '')}
                                                    placeholder="All"
                                                    isClearable
                                                    isSearchable
                                                    menuPlacement="bottom"
                                                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                    styles={ledgerFilterSelectStyles}
                                                />
                                            </th>
                                            <th></th>
                                            <th></th>
                                            <th className="tve-amount-col num-cell text-right text-[color:var(--ink-2)] whitespace-nowrap">
                                                ₹{Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </th>
                                            <th>
                                                <Select
                                                    className="w-full"
                                                    options={categoryOptions}
                                                    value={selectedCategory ? { value: selectedCategory, label: selectedCategory } : null}
                                                    onChange={(selectedOption) => setSelectedCategory(selectedOption ? selectedOption.value : '')}
                                                    placeholder="All"
                                                    isClearable
                                                    isSearchable
                                                    menuPlacement="bottom"
                                                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                    styles={ledgerFilterSelectStyles}
                                                />
                                            </th>
                                            <th>
                                                <Select
                                                    className="w-full"
                                                    options={accountTypeOptions}
                                                    value={selectedAccountType ? { value: selectedAccountType, label: selectedAccountType } : null}
                                                    onChange={(selectedOption) => setSelectedAccountType(selectedOption ? selectedOption.value : '')}
                                                    placeholder="All"
                                                    isClearable
                                                    isSearchable
                                                    menuPlacement="bottom"
                                                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                    styles={ledgerFilterSelectStyles}
                                                />
                                            </th>                                            
                                            <th></th>
                                            <th>
                                                <Select
                                                    className="w-full"
                                                    options={machineToolsOptions}
                                                    value={selectedMachineTools ? machineToolsOptions.find(opt => opt.value === String(selectedMachineTools)) : null}
                                                    onChange={(selectedOption) => setSelectedMachineTools(selectedOption ? selectedOption.value : '')}
                                                    placeholder="All"
                                                    isClearable
                                                    isSearchable
                                                    menuPlacement="bottom"
                                                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                    styles={ledgerFilterSelectStyles}
                                                />
                                            </th>
                                            <th>
                                                <Select
                                                    className="w-full"
                                                    options={sourceOptions}
                                                    value={selectedSource ? { value: selectedSource, label: selectedSource } : null}
                                                    onChange={(selectedOption) => setSelectedSource(selectedOption ? selectedOption.value : '')}
                                                    placeholder="All"
                                                    isClearable
                                                    isSearchable
                                                    menuPlacement="bottom"
                                                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                    styles={ledgerFilterSelectStyles}
                                                />
                                            </th>
                                            <th>
                                                <Select
                                                    className="w-full"
                                                    options={branchFilterOptions}
                                                    value={selectedBranch ? branchFilterOptions.find(opt => opt.value === String(selectedBranch)) : null}
                                                    onChange={(selectedOption) => setSelectedBranch(selectedOption ? selectedOption.value : '')}
                                                    placeholder="All"
                                                    isClearable
                                                    isSearchable
                                                    menuPlacement="bottom"
                                                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                    styles={ledgerFilterSelectStyles}
                                                />
                                            </th>
                                            <th>
                                                <Select
                                                    className="w-full"
                                                    options={enoOptions.map((eno) => ({ value: String(eno), label: String(eno) }))}
                                                    value={selectedEno ? { value: String(selectedEno), label: String(selectedEno) } : null}
                                                    onChange={(selectedOption) => setSelectedEno(selectedOption ? selectedOption.value : '')}
                                                    placeholder="All"
                                                    isClearable
                                                    isSearchable
                                                    menuPlacement="bottom"
                                                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                    styles={ledgerFilterSelectStyles}
                                                />
                                            </th>
                                            <th aria-label="Bill Arrival filter" />
                                            <th></th>
                                            <th></th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody>
                                    {currentItems.map((expense, index) => (
                                        <tr key={expense.id}>
                                            <td className="num-cell text-left pl-3 w-[200px]">{formatDateOnly(expense.date)}</td>
                                            <td className="ink truncate-cell text-left w-60" title={getDisplaySiteName(expense)}>{getDisplaySiteName(expense)}</td>
                                            <td className="truncate-cell text-left" title={getDisplayVendorName(expense)}>{getDisplayVendorName(expense)}</td>
                                            <td className="truncate-cell text-left" title={getDisplayContractorName(expense)}>{getDisplayContractorName(expense)}</td>
                                            <td className="truncate-cell text-left" title={getDisplayStaffName(expense)}>{getDisplayStaffName(expense)}</td>
                                            <td className="num-cell text-right">{expense.quantity}</td>
                                            <td className="tve-amount-col num-cell ink text-right font-normal w-[90px]">
                                                ₹{Number(expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="truncate-cell text-left" title={expense.category}>{expense.category}</td>
                                            <td className="truncate-cell text-left" title={expense.accountType}>{expense.accountType}</td>
                                            <td className="tve-col-wrap text-left max-w-[260px] px-1">{expense.comments || ''}</td>
                                            <td className="truncate-cell text-left" title={getMachineToolsItemIdDisplay(expense.machineTools)}>{getMachineToolsItemIdDisplay(expense.machineTools)}</td>
                                            <td className="truncate-cell text-left" title={expense.source}>{expense.source}</td>
                                            <td className="truncate-cell text-left" title={getBranchName(expense.branch_id ?? expense.branchId ?? '') || ''}>{getBranchName(expense.branch_id ?? expense.branchId ?? '') || ''}</td>
                                            <td className="num-cell text-left pl-3">{expense.eno}</td>
                                            <td className="num-cell text-left px-1 whitespace-nowrap">{formatBillArrivalDisplay(expense.billArrivalDate)}</td>
                                            <td className="py-1.5 w-[50px]">
                                                <div className="act-cell">
                                                <button
                                                    onClick={() => handleEditClick(expense)}
                                                    className="rounded-full transition duration-200 inline-flex items-center justify-center"
                                                    title="Edit"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 14.75 17.56"
                                                        className="w-5 h-5 transform hover:scale-110 hover:brightness-110 transition duration-200"
                                                        fill="none"
                                                        stroke="#007233"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        aria-label="Edit"
                                                    >
                                                        <line x1="9.709" y1="2.451" x2="12.451" y2="5.042" />
                                                        <path d="M4.556,12.462 L0.773,13.693 L1.773,9.893 L11.159,0.072 a0.273,0.273 0 0 1 0.383,0 l2.371,2.223 a0.266,0.266 0 0 1 0.016,0.379 z" />
                                                        <line x1="0.0" y1="16.0" x2="11.395" y2="16.0" />
                                                    </svg>
                                                </button>
                                                </div>
                                            </td>
                                            <td className="px-1">
                                                {expense.billCopy ? (
                                                    <a href={expense.billCopy} className="text-red-500 underline" target="_blank" rel="noopener noreferrer">
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
                            </div>
                        </div>
                    </div>
                        <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200">
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
                            contentLabel="Edit Expense"
                            className="fixed inset-0 flex items-center justify-center p-4 bg-gray-800 bg-opacity-50 z-[9999]"
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
                                        <input
                                            type="text"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)] hover:border-opacity-[0.40] font-normal"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 font-normal text-left">Category *</label>
                                        <Select
                                            name="category"
                                            value={categoryOption.find(option => option.value === formData.category)}
                                            onChange={(selectedOption) =>
                                                setFormData({ ...formData, category: selectedOption?.value || '' })
                                            }
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
                                        <input
                                            type="text"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleChange}
                                            className="mt-1 block w-full p-2 pl-6 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)] hover:border-opacity-[0.40] font-normal"
                                            onWheel={(e) => e.target.blur()}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 font-normal text-left">Comments *</label>
                                        <input
                                            type="text"
                                            name="comments"
                                            value={formData.comments}
                                            onChange={handleChange}
                                            className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none focus:ring-0 focus:shadow-[0_0_0_1px_rgba(191,152,83,0.4)] hover:border-opacity-[0.40] font-normal"
                                        />
                                    </div>
                                    <div>
                                        <div className=' flex'>
                                            <label className="block text-gray-500 font-normal text-left cursor-pointer" htmlFor="fileInput">Bill Copy URL</label>
                                            {selectedFile && <span className="text-orange-600 ml-4">{selectedFile.name}</span>}
                                        </div>
                                        <input
                                            type="text"
                                            name="billCopy"
                                            value={formData.billCopy}
                                            onChange={handleChange}
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
                                    {(formData.accountType === 'Claim' || formData.accountType === 'Utility Bills' || formData.accountType === 'Weekly Payment') && (
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
                                                <div className="col-span-2 grid grid-cols-3 gap-4 w-full">

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
                                                            placeholder="--- Select ---"
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
                                            className={`px-4 py-2 bg-[#BF9853] text-white rounded mt-3 transition duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            {isSubmitting ? 'Submitting...' : 'Submit'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </Modal>
                        {showPaymentModal && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
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
                                            {(formData.paymentMode === 'GPay' || formData.paymentMode === 'PhonePe' || formData.paymentMode === 'Net Banking' || formData.paymentMode === 'Cheque') && (
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
                        )}
                    </div>
                </div>
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
