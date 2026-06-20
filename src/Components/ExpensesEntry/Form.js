import { useState, useEffect, useRef, useMemo } from 'react';
import Select from 'react-select';
import Attach from '../Images/Attachfile.svg';
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';
import CustomMonthField from './CustomMonthField';
import CustomDateField from './CustomDateField';
import {
    postBankRegisterLogSave,
    bankRegisterLogSaveUrlMatchingRequest,
    isPaymentModeRequiringBankRegisterLog,
} from '../../utils/bankRegisterLogBeforeWeeklyBill';
import { resolveExpensesEntryIdAfterSave } from '../../utils/advancePortalWeeklyPaymentBill';
import {
    EXPENSE_ENTRY_MODULE_NAME,
} from '../../utils/paymentModeArrangement';
import { usePaymentModesForModule } from '../../utils/usePaymentModeArrangement';
import SideTable from '../Advance Portal/SideTable';

const TOOLS_API_BASE = 'https://backendaab.in/demoAabuildersDash';
const TELECOM_DIRECTORY_ENDPOINT = 'https://backendaab.in/demoAabuildersDash/api/utility-telecom/getAll';
const SUBSCRIPTION_DIRECTORY_ENDPOINT = 'https://backendaab.in/demoAabuildersDash/api/utility-subscription/getAll';

const EXPENSE_FORM_FIELDS = {
    accountType: 'Account Type',
    utilityType: 'Utility Type',
    date: 'Date',
    projectName: 'Project Name',
    vendorContractorName: 'Vendor/Contractor Name',
    quantity: 'Quantity',
    amount: 'Amount',
    category: 'Category',
    paymentMode: 'Payment Mode',
    billArrivalDate: 'Bill Arrival Date',
    itemName: 'Item Name',
    machineName: 'Machine Name',
    machineId: 'Machine ID',
    machineTool: 'Machine Tool',
    forTheMonthOf: 'For The Month Of',
    validityDuration: 'Validity Duration',
    validityType: 'Validity Type',
    activationDate: 'Activation Date',
    description: 'Description',
    chequeNo: 'Cheque No',
    chequeDate: 'Cheque Date',
    transactionNumber: 'Transaction Number',
    accountNumber: 'Account Number',
};

const isAdvanceAdjustmentPaymentMode = (mode) =>
    String(mode ?? '').trim().toLowerCase() === 'advance adjustment';

const resolveVendorMasterId = (item) => {
    const raw = item?.id ?? item?.vendorId ?? item?.vendor_id;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
};

const toVendorSelectOption = (item) => {
    const id = resolveVendorMasterId(item);
    return {
        id,
        vendorId: id,
        vendor_id: id,
        value: item.vendorName,
        label: item.vendorName,
        type: 'Vendor',
        category: item.category,
    };
};

const resolveSelectedVendorId = (opt) => {
    if (!opt || opt.type !== 'Vendor') return null;
    return resolveVendorMasterId(opt);
};

const getPropertyProfessionTaxNo = (property) =>
    String(property?.professionalTaxNo ?? property?.professionTaxNo ?? '').trim();

const getUtilityTypeNumberLabel = (utilityTypeValue) => {
    switch (utilityTypeValue) {
        case 'Electricity':
        default:
            return 'Service Number';
    }
};

const normalizePrefillUtilityType = (prefillData) => {
    const raw = String(prefillData?.utilityType ?? '').trim();
    if (raw === 'Property Tax') return 'Property';
    if (raw === 'Water Tax') return 'Water';
    if (raw === 'Profession Tax') return 'Profession';
    if (raw) return raw;
    if (prefillData?.ebNo) return 'Electricity';
    if (prefillData?.propertyTaxNo) return 'Property';
    if (prefillData?.waterTaxNo) return 'Water';
    if (prefillData?.professionTaxNo || prefillData?.professionalTaxNo) return 'Profession';
    if (prefillData?.utilityTypeNumber) return 'Telecom';
    return '';
};

const UTILITY_PREFILL_VENDOR_BY_TYPE = {
    Electricity: 'TNEB',
    Property: 'Municipal Office',
    Water: 'Municipal Office',
};

const UTILITY_PREFILL_API = {
    Electricity: {
        url: 'https://backendaab.in/demoAabuilderDash/expenses_form/utility/electricity',
        getServiceId: (prefill) => prefill?.ebNo,
    },
    Property: {
        url: 'https://backendaab.in/demoAabuilderDash/expenses_form/utility/property',
        getServiceId: (prefill) => prefill?.propertyTaxNo,
    },
    Water: {
        url: 'https://backendaab.in/demoAabuilderDash/expenses_form/utility/water',
        getServiceId: (prefill) => prefill?.waterTaxNo,
    },
    Profession: {
        url: 'https://backendaab.in/demoAabuilderDash/expenses_form/utility/profession',
        getServiceId: (prefill) => prefill?.professionalTaxNo ?? prefill?.professionTaxNo,
    },
};

const ACCOUNT_TYPE_NAME_ALIASES = {
    Claim: 'Claim Payment',
};

const normalizeAccountTypeName = (name) => String(name ?? '').trim();

const getAccountTypeOptionLabel = (opt) =>
    normalizeAccountTypeName(
        opt?.value ?? opt?.label ?? opt?.accountType ?? opt?.account_type
    );

const getAccountTypeIdFromOption = (opt) => {
    const rawId = opt?.id ?? opt?.Id ?? opt?.account_type_id ?? opt?.accountTypeId;
    if (rawId == null || rawId === '') return null;
    const numericId = Number(rawId);
    return Number.isFinite(numericId) ? numericId : null;
};

const getAccountTypeIdForSave = (accountTypeOptions, accountTypeName) => {
    const raw = normalizeAccountTypeName(accountTypeName);
    if (!raw) return null;
    const candidates = [raw, ACCOUNT_TYPE_NAME_ALIASES[raw]].filter(Boolean);
    for (const candidate of candidates) {
        const match = (accountTypeOptions || []).find(
            (opt) => getAccountTypeOptionLabel(opt) === candidate
        );
        if (match) {
            const id = getAccountTypeIdFromOption(match);
            if (id != null) return id;
        }
    }
    return null;
};

const usesBillArrivalDate = (accountType) =>
    accountType === 'Bill Payments' ||
    accountType === 'Bill Refund' ||
    accountType === 'Bill Payments + Claim';

const normalizeVendorNameKey = (value) => String(value ?? '').trim().toLowerCase();

const findVendorOptionByName = (vendorOptions, vendorName) => {
    const key = normalizeVendorNameKey(vendorName);
    if (!key || !Array.isArray(vendorOptions)) return null;
    return (
        vendorOptions.find(
            (o) =>
                o.type === 'Vendor' &&
                (normalizeVendorNameKey(o.label) === key || normalizeVendorNameKey(o.value) === key)
        ) ?? null
    );
};

const findVendorFromPreviousUtilityEntry = (previousEntry, vendorOptions) => {
    if (!previousEntry || !Array.isArray(vendorOptions)) return null;
    const vid = previousEntry.vendorId ?? previousEntry.vendor_id;
    if (vid != null && Number(vid) > 0) {
        const byId = vendorOptions.find(
            (o) => o.type === 'Vendor' && Number(resolveSelectedVendorId(o)) === Number(vid)
        );
        if (byId) return byId;
    }
    const nameKey = normalizeVendorNameKey(
        previousEntry.vendor ?? previousEntry.vendorName ?? previousEntry.vendor_name
    );
    if (!nameKey) return null;
    return (
        vendorOptions.find((o) => o.type === 'Vendor' && normalizeVendorNameKey(o.label) === nameKey) ?? null
    );
};

const utilityHubReadonlyFieldClass =
    'min-h-[45px] border-2 border-[#BF9853] border-opacity-20 rounded-lg bg-[#FAF6ED] px-3 flex items-center text-sm font-medium text-[#202020]';

const UtilityHubReadonlyField = ({ value, className = '' }) => (
    <div className={`${utilityHubReadonlyFieldClass} ${className}`.trim()} aria-readonly="true">
        {value || '—'}
    </div>
);

const Form = ({
    username,
    userRoles = [],
    embedded = false,
    onSuccess,
    disableWeeklyExpensesSave = false,
    lockUtilityPrefillFields = false,
    lockAccountTypePrefill = false,
}) => {
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

    const resolveActiveBranchId = () => {
        try {
            const selectedBranchId = localStorage.getItem("selectedBranchId");
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const fallbackBranchId = user?.branchId ?? user?.branch_id ?? user?.brachId;
            const resolved = Number(selectedBranchId || fallbackBranchId);
            return Number.isFinite(resolved) && resolved > 0 ? resolved : null;
        } catch {
            return null;
        }
    };
    const [activeBranchId, setActiveBranchId] = useState(() => resolveActiveBranchId());
    const buildBranchUrl = (baseUrl) => {
        const url = new URL(baseUrl);
        if (activeBranchId !== null && activeBranchId !== undefined && activeBranchId !== "") {
            url.searchParams.set("branchId", String(activeBranchId));
        }
        return url.toString();
    };
    const [eno, setEno] = useState(null);
    const [date, setDate] = useState('');
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quantity, setQuantity] = useState("");
    const [comments, setComments] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [contractorOptions, setContractorOptions] = useState([]);
    const [vendorOptionsLoaded, setVendorOptionsLoaded] = useState(false);
    const [contractorOptionsLoaded, setContractorOptionsLoaded] = useState(false);
    const [combinedOptions, setCombinedOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [selectedType, setSelectedType] = useState("");
    const [selectedAccountType, setSelectedAccountType] = useState('Sundry Payment');
    const [selectedAccountTypeId, setSelectedAccountTypeId] = useState(null);
    const [selectedSite, setSelectedSite] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedMachineTools, setSelectedMachine] = useState(null);
    const [selectedToolsItemName, setSelectedToolsItemName] = useState(null);
    const [siteOptions, setSiteOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [machineToolsOptions, setMachineToolsOptions] = useState([]);
    const [toolsItemNameOptions, setToolsItemNameOptions] = useState([]);
    const [accountTypeOptions, setAccountTypeOptions] = useState([]);
    const [showMachineTools, setShowMachineTools] = useState(false);
    const fileInputRef = useRef(null);
    const leftFormColRef = useRef(null);
    const commentsSectionRef = useRef(null);
    const advanceHeaderRef = useRef(null);
    const [sideTableAreaHeight, setSideTableAreaHeight] = useState(null);
    const [sideTableContentHeight, setSideTableContentHeight] = useState(null);
    const prevCategoryOptionsLenRef = useRef(0);
    const billPaymentsPrefillAttemptsRef = useRef(0);
    const [userPermissions, setUserPermissions] = useState([]);
    const moduleName = EXPENSE_ENTRY_MODULE_NAME;
    const [paymentMode, setPaymentMode] = useState('');
    
    const paymentModeOptions = usePaymentModesForModule(moduleName);
    const selectablePaymentModeOptions = useMemo(() => {
        const allModes = Array.isArray(paymentModeOptions) ? paymentModeOptions : [];
        let modes = allModes.filter(
            (mode) => !isAdvanceAdjustmentPaymentMode(mode?.modeOfPayment)
        );
        const hideCash =
            selectedAccountType === 'Claim Payment' || selectedAccountType === 'Sundry Payment';
        if (hideCash) {
            modes = modes.filter((mode) => String(mode?.modeOfPayment ?? '').trim() !== 'Cash');
        }
        return modes;
    }, [paymentModeOptions, selectedAccountType]);
    const filteredCategoryOptions = useMemo(() => {
        const all = Array.isArray(categoryOptions) ? categoryOptions : [];
        if (selectedAccountType === 'Sundry Payment') return all;
        return all.filter(
            (opt) => String(opt?.label ?? opt?.value ?? '').trim() !== 'Machine Repair'
        );
    }, [categoryOptions, selectedAccountType]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentModalData, setPaymentModalData] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: "",
        paymentMode: "",
        chequeNo: "",
        chequeDate: "",
        transactionNumber: "",
        accountNumber: ""
    });
    const [accountDetails, setAccountDetails] = useState([]);
    const [selectedEbNumber, setSelectedEbNumber] = useState(null);
    const [selectedMonths, setSelectedMonths] = useState('');
    const [thirdInput, setThirdInput] = useState('');
    const [validityType, setValidityType] = useState('');
    const [serviceStartingDate, setServiceStartingDate] = useState('');
    /** Bill Payments / Bill Refund / Bill Payments + Claim — sent as `billArrivalDate` (yyyy-MM-dd) to expenses_form API */
    const [billArrivalDate, setBillArrivalDate] = useState('');
    const [summaryBillTotal, setSummaryBillTotal] = useState(null);
    const [summaryBillRemaining, setSummaryBillRemaining] = useState(null);
    const summaryBillMode = summaryBillTotal != null && Number(summaryBillTotal) > 0;
    const [summaryForceCloseAmount, setSummaryForceCloseAmount] = useState('');
    const [splitRemainingLabel, setSplitRemainingLabel] = useState('Summary Bill Remaining');
    const [allowSplitOverpay, setAllowSplitOverpay] = useState(false);
    const [ebNumberOptions, setEbNumberOptions] = useState([]);
    const [utilityType, setUtilityType] = useState('');
    const [projectData, setProjectData] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [isReviewEditMode, setIsReviewEditMode] = useState(false);
    const [filePreviewUrl, setFilePreviewUrl] = useState(null);
    const [advanceData, setAdvanceData] = useState([]);
    const [projectAdvance, setProjectAdvance] = useState('');
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    /** When true, Bill Payments was opened from Weekly Cash Register */
    const [billPaymentsCashRegisterPrefill, setBillPaymentsCashRegisterPrefill] = useState(false);
    /** Weekly expense row id — sync uploaded bill PDF to `PUT .../weekly-expenses/:id/bill-copy-url` */
    const [weeklyExpenseIdForBillCopyUrl, setWeeklyExpenseIdForBillCopyUrl] = useState(null);
    const [duplicateMatchedExpenses, setDuplicateMatchedExpenses] = useState([]);
    const [checkingDuplicate, setCheckingDuplicate] = useState(false);
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
                console.log(permissions);
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
                const merged = [...predefinedSiteOptions, ...formattedData].filter(Boolean);
                const seen = new Set();
                const deduped = [];
                for (const opt of merged) {
                    const key = String(opt?.label ?? opt?.value ?? "").trim().toLowerCase();
                    if (!key || seen.has(key)) continue;
                    seen.add(key);
                    deduped.push(opt);
                }
                setSiteOptions(deduped);
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
                const formattedData = data.map((item) => toVendorSelectOption(item));
                setVendorOptions(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            } finally {
                setVendorOptionsLoaded(true);
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
                    category: item.category,
                }));
                setContractorOptions(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            } finally {
                setContractorOptionsLoaded(true);
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
                    id: item.id,
                    value: item.category,
                    label: item.category,
                }));
                setCategoryOptions(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchCategories();
    }, []);

    const findCategoryOptionByVendorField = (raw) => {
        if (raw == null || raw === '') return null;
        const s = String(raw).trim();
        if (!s) return null;
        return (
            categoryOptions.find(
                (o) => String(o.value).trim() === s || String(o.label).trim() === s
            ) ?? null
        );
    };

    const applyResolvedCategoryOption = (categoryOption) => {
        setSelectedCategory(categoryOption);
        if (categoryOption && categoryOption.label === 'Machine Repair') {
            setShowMachineTools(true);
        } else {
            setShowMachineTools(false);
            setSelectedMachine(null);
            setSelectedToolsItemName(null);
        }
    };

    useEffect(() => {
        const len = categoryOptions.length;
        const becameAvailable = prevCategoryOptionsLenRef.current === 0 && len > 0;
        prevCategoryOptionsLenRef.current = len;
        if (!becameAvailable || !selectedOption?.category) return;
        const match = findCategoryOptionByVendorField(selectedOption.category);
        if (match) applyResolvedCategoryOption(match);
    }, [categoryOptions, selectedOption]);

    useEffect(() => {
        if (selectedAccountType === 'Sundry Payment') return;
        if (selectedCategory?.label === 'Machine Repair') {
            applyResolvedCategoryOption(null);
        }
    }, [selectedAccountType, selectedCategory]);

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
                setMachineToolsOptions(formattedData);
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
    const filteredMachineToolOptions = useMemo(() => {
        if (selectedToolsItemName?.id == null) {
            return [];
        }
        const nameId = String(selectedToolsItemName.id);
        return machineToolsOptions.filter(
            (opt) => String(opt.item_name_id ?? "").trim() === nameId
        );
    }, [machineToolsOptions, selectedToolsItemName]);
    useEffect(() => {
        setSelectedMachine(null);
    }, [selectedToolsItemName]);
    // Fetch advance portal data (for right-side advance history table)
    useEffect(() => {
        const fetchAdvanceData = async () => {
            try {
                const response = await fetch(
                    buildBranchUrl("https://backendaab.in/demoAabuildersDash/api/advance_portal/getAll"),
                    {
                        method: "GET",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error("Network response was not ok: " + response.statusText);
                }
                const data = await response.json();
                const list = Array.isArray(data) ? data : [];
                setAdvanceData(list);
            } catch (error) {
                console.error("Error fetching advance portal data:", error);
            }
        };
        fetchAdvanceData();
    }, [activeBranchId]);

    // Compute project advance locally whenever selection or data changes
    useEffect(() => {
        if (!selectedOption || !selectedSite) {
            setProjectAdvance('0');
            return;
        }
        const isVendor = selectedOption.type === 'Vendor';
        const vid = Number(selectedOption.id);
        const pid = Number(selectedSite.id);
        const relevant = advanceData.filter(item =>
            (isVendor ? item.vendor_id === vid : item.contractor_id === vid) &&
            item.project_id === pid
        );
        const total = relevant.reduce((sum, entry) => {
            const amount = parseFloat(entry.amount) || 0;
            const billAmount = parseFloat(entry.bill_amount) || 0;
            const refundAmount = parseFloat(entry.refund_amount) || 0;
            return sum + amount - billAmount - refundAmount;
        }, 0);
        setProjectAdvance(total.toLocaleString('en-IN'));
    }, [advanceData, selectedOption, selectedSite]);
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
                            accountType: typeName,
                            account_type: typeName,
                        };
                    })
                    .filter((item) => item.value && item.value !== 'Daily Wage');
                setAccountTypeOptions(formattedData);
            } catch (error) {
                console.error("Fetch error: ", error);
            }
        };
        fetchAccountType();
    }, []);
    useEffect(() => {
        if (!selectedAccountType) {
            setSelectedAccountTypeId(null);
            return;
        }
        const prefillId = getAccountTypeIdForSave(accountTypeOptions, selectedAccountType);
        setSelectedAccountTypeId(prefillId);
    }, [selectedAccountType, accountTypeOptions]);
    useEffect(() => {
        if (isAdvanceAdjustmentPaymentMode(paymentMode)) {
            setPaymentMode('');
            return;
        }
        if (
            (selectedAccountType === 'Claim Payment' || selectedAccountType === 'Sundry Payment') &&
            paymentMode === 'Cash'
        ) {
            setPaymentMode('');
        }
    }, [selectedAccountType, paymentMode]);
    const resolveAccountTypeIdForSave = () => {
        if (selectedAccountTypeId != null && Number.isFinite(Number(selectedAccountTypeId))) {
            return Number(selectedAccountTypeId);
        }
        return getAccountTypeIdForSave(accountTypeOptions, selectedAccountType);
    };
    useEffect(() => {
        const fetchAccountDetails = async () => {
            try {
                const response = await fetch('https://backendaab.in/demoAabuildersDash/api/account-details/getAll');
                if (response.ok) {
                    const data = await response.json();
                    setAccountDetails(data);
                } else {
                    console.error('Error fetching account details');
                }
            } catch (error) {
                console.error('Error fetching account details:', error);
            }
        };
        fetchAccountDetails();
    }, []);
    useEffect(() => { setCombinedOptions([...vendorOptions, ...contractorOptions]); }, [vendorOptions, contractorOptions]);

    useEffect(() => {
        if (selectedAccountType !== 'Bill Payments' && billPaymentsCashRegisterPrefill) {
            setBillPaymentsCashRegisterPrefill(false);
        }
    }, [selectedAccountType, billPaymentsCashRegisterPrefill]);

    const lockAccountTypeDisplay = lockUtilityPrefillFields || lockAccountTypePrefill || billPaymentsCashRegisterPrefill;

    useEffect(() => {
        if (!lockUtilityPrefillFields) return;
        if (selectedAccountType !== 'Utility Bills') {
            setSelectedAccountType('Utility Bills');
        }
    }, [lockUtilityPrefillFields, selectedAccountType]);

    useEffect(() => {
        if (lockAccountTypeDisplay) return;
        if (!selectedAccountType) {
            setSelectedAccountType('Sundry Payment');
        }
    }, [lockAccountTypeDisplay, selectedAccountType]);

    useEffect(() => {
        const prefillDataStr = localStorage.getItem('expenseEntryPrefill');
        if (prefillDataStr && siteOptions.length > 0 && accountTypeOptions.length > 0) {
            try {
                const prefillData = JSON.parse(prefillDataStr);
                // Always capture weeklyExpenseId for bill-copy-url sync (Bill Payments / Claim / etc).
                if (prefillData.weeklyExpenseId != null && prefillData.weeklyExpenseId !== '') {
                    const wid = Number(prefillData.weeklyExpenseId);
                    if (Number.isFinite(wid)) {
                        setWeeklyExpenseIdForBillCopyUrl(wid);
                    }
                }

                const prefillAccountTypeName = normalizeAccountTypeName(
                    prefillData.accountType ?? prefillData.account_type
                );
                if (prefillAccountTypeName) {
                    setSelectedAccountType(prefillAccountTypeName);
                    const explicitTypeId = prefillData.accountTypeId ?? prefillData.account_type_id;
                    if (
                        explicitTypeId != null &&
                        String(explicitTypeId).trim() !== '' &&
                        Number.isFinite(Number(explicitTypeId))
                    ) {
                        setSelectedAccountTypeId(Number(explicitTypeId));
                    }
                }

                if (prefillData.accountType === 'Bill Payments') {
                    const vid = prefillData.vendorId ?? prefillData.vendor_id;
                    const cid = prefillData.contractorId ?? prefillData.contractor_id;
                    const vNameRaw = prefillData.vendorName ?? prefillData.vendor ?? prefillData.vendor_name;
                    const cNameRaw = prefillData.contractorName ?? prefillData.contractor ?? prefillData.contractor_name;
                    const rawSummaryTotal = prefillData.summaryBillTotal ?? prefillData.summary_bill_total ?? null;
                    const fromBillPaymentsTracker = !!(
                        prefillData.fromBillPaymentsTracker ??
                        prefillData.from_bill_payments_tracker
                    );
                    const hasVendorName = String(vNameRaw ?? "").trim() !== "";
                    const hasContractorName = String(cNameRaw ?? "").trim() !== "";
                    const needVendor =
                        vid != null &&
                        String(vid).trim() !== '' &&
                        Number.isFinite(Number(vid)) &&
                        Number(vid) > 0;
                    const needContractor =
                        cid != null &&
                        String(cid).trim() !== '' &&
                        Number.isFinite(Number(cid)) &&
                        Number(cid) > 0;
                    // Avoid clearing prefill while only one of vendor/contractor lists has arrived (race: contractors often load first).
                    if (needVendor && !vendorOptionsLoaded) return;
                    if (needContractor && !contractorOptionsLoaded) return;
                    // Also wait for options when we plan to match by name (vendor id may be missing/0 in weekly Bill rows).
                    if (hasVendorName && !vendorOptionsLoaded) return;
                    if (hasContractorName && !contractorOptionsLoaded) return;
                    // If options failed to load (temporary network), do not clear prefill yet.
                    if ((needVendor || hasVendorName) && vendorOptionsLoaded && vendorOptions.length === 0) return;
                    if ((needContractor || hasContractorName) && contractorOptionsLoaded && contractorOptions.length === 0) return;
                    if ((needVendor || needContractor || hasVendorName || hasContractorName) && combinedOptions.length === 0) {
                        return;
                    }
                    const billPayOpt = accountTypeOptions.find((opt) => opt.value === 'Bill Payments');
                    if (billPayOpt) {
                        setSelectedAccountType('Bill Payments');
                    }
                    if (prefillData.siteName) {
                        const siteOption = siteOptions.find(
                            (opt) => String(opt.label).trim() === String(prefillData.siteName).trim()
                        );
                        if (siteOption) {
                            setSelectedSite(siteOption);
                        }
                    }
                    if (prefillData.date) {
                        setDate(prefillData.date);
                    }
                    const prefillBillArrival =
                        prefillData.billArrivalDate ?? prefillData.bill_arrival_date ?? '';
                    if (prefillBillArrival) {
                        const s = String(prefillBillArrival).trim().slice(0, 10);
                        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) setBillArrivalDate(s);
                    }
                    // Summary Bill flow: treat weekly bill amount as "total" and allow splitting into multiple entries.
                    const summaryTotalNum =
                        rawSummaryTotal != null && rawSummaryTotal !== "" && Number.isFinite(Number(rawSummaryTotal))
                            ? Number(rawSummaryTotal)
                            : null;
                    if (summaryTotalNum != null && summaryTotalNum > 0) {
                        setSummaryBillTotal(summaryTotalNum);
                        setSummaryBillRemaining((prev) => (prev == null ? summaryTotalNum : prev));
                        setSplitRemainingLabel(fromBillPaymentsTracker ? 'Bill Payment Remaining' : 'Summary Bill Remaining');
                        setAllowSplitOverpay(fromBillPaymentsTracker);
                        // Do not prefill the Amount box for Summary Bill; user will enter split amounts.
                        setAmount("");
                    } else if (prefillData.amount != null && prefillData.amount !== '') {
                        setAmount(String(prefillData.amount));
                    }
                    let didApplyParty = false;
                    if (needVendor) {
                        const v = combinedOptions.find(
                            (o) => o.type === 'Vendor' && Number(o.id) === Number(vid)
                        );
                        if (v) {
                            setSelectedOption(v);
                            setSelectedType('Vendor');
                            const catOpt = findCategoryOptionByVendorField(v.category);
                            if (catOpt) applyResolvedCategoryOption(catOpt);
                            didApplyParty = true;
                        }
                    } else if (needContractor) {
                        const c = combinedOptions.find(
                            (o) => o.type === 'Contractor' && Number(o.id) === Number(cid)
                        );
                        if (c) {
                            setSelectedOption(c);
                            setSelectedType('Contractor');
                            const catOpt = findCategoryOptionByVendorField(c.category);
                            if (catOpt) applyResolvedCategoryOption(catOpt);
                            didApplyParty = true;
                        }
                    } else {
                        const normalized = (s) => String(s ?? "").trim().toLowerCase();
                        const vName = normalized(vNameRaw);
                        const cName = normalized(cNameRaw);
                        if (vName) {
                            const v = combinedOptions.find(
                                (o) => o.type === "Vendor" && normalized(o.label) === vName
                            );
                            if (v) {
                                setSelectedOption(v);
                                setSelectedType("Vendor");
                                const catOpt = findCategoryOptionByVendorField(v.category);
                                if (catOpt) applyResolvedCategoryOption(catOpt);
                                didApplyParty = true;
                            }
                        } else if (cName) {
                            const c = combinedOptions.find(
                                (o) => o.type === "Contractor" && normalized(o.label) === cName
                            );
                            if (c) {
                                setSelectedOption(c);
                                setSelectedType("Contractor");
                                const catOpt = findCategoryOptionByVendorField(c.category);
                                if (catOpt) applyResolvedCategoryOption(catOpt);
                                didApplyParty = true;
                            }
                        }
                    }
                    if (prefillData.fromWeeklyCashRegister) {
                        setBillPaymentsCashRegisterPrefill(true);
                    }
                    if (didApplyParty) {
                        billPaymentsPrefillAttemptsRef.current = 0;
                        // Keep prefill while Summary Bill is in progress (multiple entries in same popup).
                        if (!summaryTotalNum) {
                            localStorage.removeItem('expenseEntryPrefill');
                        }
                        return;
                    }
                    // If we expected a party (by id or name) but couldn't match yet, keep prefill for a few reruns
                    // (covers slow option loading / temporary fetch delays).
                    if (needVendor || needContractor || hasVendorName || hasContractorName) {
                        billPaymentsPrefillAttemptsRef.current += 1;
                        const attempts = billPaymentsPrefillAttemptsRef.current;
                        if (attempts < 8) return;
                    }
                    billPaymentsPrefillAttemptsRef.current = 0;
                    if (!summaryTotalNum) {
                        localStorage.removeItem('expenseEntryPrefill');
                    }
                    return;
                }

                // Claim / Weekly Payment / other account types (prefill)
                if (prefillData.accountType === 'Claim Payment' || prefillData.accountType === 'Claim') {
                    const claimOpt = accountTypeOptions.find((opt) => opt.value === 'Claim Payment');
                    if (claimOpt) {
                        setSelectedAccountType('Claim Payment');
                    }
                    const vid = prefillData.vendorId ?? prefillData.vendor_id;
                    const cid = prefillData.contractorId ?? prefillData.contractor_id;
                    const vNameRaw = prefillData.vendorName ?? prefillData.vendor ?? prefillData.vendor_name;
                    const cNameRaw = prefillData.contractorName ?? prefillData.contractor ?? prefillData.contractor_name;
                    const hasVendorName = String(vNameRaw ?? "").trim() !== "";
                    const hasContractorName = String(cNameRaw ?? "").trim() !== "";
                    const needVendor =
                        vid != null &&
                        String(vid).trim() !== '' &&
                        Number.isFinite(Number(vid)) &&
                        Number(vid) > 0;
                    const needContractor =
                        cid != null &&
                        String(cid).trim() !== '' &&
                        Number.isFinite(Number(cid)) &&
                        Number(cid) > 0;

                    // Wait until party options are available when we need to prefill vendor/contractor.
                    if (needVendor && !vendorOptionsLoaded) return;
                    if (needContractor && !contractorOptionsLoaded) return;
                    if (hasVendorName && !vendorOptionsLoaded) return;
                    if (hasContractorName && !contractorOptionsLoaded) return;
                    if ((needVendor || needContractor || hasVendorName || hasContractorName) && combinedOptions.length === 0) {
                        return;
                    }

                    if (prefillData.siteName) {
                        const siteOption = siteOptions.find(
                            (opt) => String(opt.label).trim() === String(prefillData.siteName).trim()
                        );
                        if (siteOption) setSelectedSite(siteOption);
                    }
                    if (prefillData.date) setDate(prefillData.date);
                    if (prefillData.amount != null && prefillData.amount !== '') setAmount(String(prefillData.amount));
                    // Prefill party + category (same behavior as Bill Payments)
                    let didApplyParty = false;
                    if (needVendor) {
                        const v = combinedOptions.find((o) => o.type === 'Vendor' && Number(o.id) === Number(vid));
                        if (v) {
                            setSelectedOption(v);
                            setSelectedType('Vendor');
                            const catOpt = findCategoryOptionByVendorField(v.category);
                            if (catOpt) applyResolvedCategoryOption(catOpt);
                            didApplyParty = true;
                        }
                    } else if (needContractor) {
                        const c = combinedOptions.find((o) => o.type === 'Contractor' && Number(o.id) === Number(cid));
                        if (c) {
                            setSelectedOption(c);
                            setSelectedType('Contractor');
                            const catOpt = findCategoryOptionByVendorField(c.category);
                            if (catOpt) applyResolvedCategoryOption(catOpt);
                            didApplyParty = true;
                        }
                    } else {
                        const normalized = (s) => String(s ?? "").trim().toLowerCase();
                        const vName = normalized(vNameRaw);
                        const cName = normalized(cNameRaw);
                        if (vName) {
                            const v = combinedOptions.find((o) => o.type === "Vendor" && normalized(o.label) === vName);
                            if (v) {
                                setSelectedOption(v);
                                setSelectedType("Vendor");
                                const catOpt = findCategoryOptionByVendorField(v.category);
                                if (catOpt) applyResolvedCategoryOption(catOpt);
                                didApplyParty = true;
                            }
                        } else if (cName) {
                            const c = combinedOptions.find((o) => o.type === "Contractor" && normalized(o.label) === cName);
                            if (c) {
                                setSelectedOption(c);
                                setSelectedType("Contractor");
                                const catOpt = findCategoryOptionByVendorField(c.category);
                                if (catOpt) applyResolvedCategoryOption(catOpt);
                                didApplyParty = true;
                            }
                        }
                    }

                    // If we expected a party but couldn't match yet, keep prefill for a later rerender.
                    if ((needVendor || needContractor || hasVendorName || hasContractorName) && !didApplyParty) {
                        return;
                    }

                    localStorage.removeItem('expenseEntryPrefill');
                    return;
                }

                const utilityBillsOption = accountTypeOptions.find(opt => opt.value === 'Utility Bills');
                if (utilityBillsOption) {
                    setSelectedAccountType('Utility Bills');
                }

                const prefillUtilityType = normalizePrefillUtilityType(prefillData);
                if (prefillUtilityType) {
                    setUtilityType(prefillUtilityType);
                }

                const siteOption = siteOptions.find(opt => opt.label === prefillData.siteName);
                if (siteOption) {
                    setSelectedSite(siteOption);
                }

                const fetchPreviousEntry = async () => {
                    const apiConfig = UTILITY_PREFILL_API[prefillUtilityType];
                    if (!apiConfig) return;

                    let previousEntry = null;
                    try {
                        const serviceId = apiConfig.getServiceId(prefillData);
                        if (serviceId != null && String(serviceId).trim() !== '') {
                            const response = await axios.get(apiConfig.url);
                            const entries = Array.isArray(response.data) ? response.data : [];
                            previousEntry = entries
                                .filter(
                                    (entry) =>
                                        String(entry?.utilityTypeNumber ?? '').trim() ===
                                        String(serviceId).trim()
                                )
                                .sort(
                                    (a, b) =>
                                        new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp)
                                )[0];
                        }

                        if (previousEntry) {
                            if (previousEntry.category && categoryOptions.length > 0) {
                                const categoryOption = categoryOptions.find(
                                    (opt) => opt.value === previousEntry.category
                                );
                                if (categoryOption) {
                                    setSelectedCategory(categoryOption);
                                }
                            }
                            if (previousEntry.quantity) {
                                setQuantity(previousEntry.quantity);
                            }
                            if (previousEntry.comments) {
                                setComments(previousEntry.comments);
                            }
                            if (
                                !lockUtilityPrefillFields &&
                                previousEntry.paymentMode &&
                                previousEntry.paymentMode !== 'Cash' &&
                                !isAdvanceAdjustmentPaymentMode(previousEntry.paymentMode)
                            ) {
                                setPaymentMode(previousEntry.paymentMode);
                            }
                            if (previousEntry.utilityValidityDays) {
                                setThirdInput(previousEntry.utilityValidityDays);
                            }
                            if (previousEntry.utilityValidityType) {
                                setValidityType(previousEntry.utilityValidityType);
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching previous utility entry:', error);
                    }

                    const applyUtilityVendorPrefill = () => {
                        if (!UTILITY_PREFILL_VENDOR_BY_TYPE[prefillUtilityType]) return;
                        if (!vendorOptionsLoaded) {
                            setTimeout(applyUtilityVendorPrefill, 500);
                            return;
                        }
                        const applyVendorPrefill = (vendorOpt) => {
                            const vid = resolveSelectedVendorId(vendorOpt);
                            if (!vid) return false;
                            setSelectedOption({
                                ...vendorOpt,
                                id: vid,
                                vendorId: vid,
                                vendor_id: vid,
                                type: 'Vendor',
                            });
                            setSelectedType('Vendor');
                            return true;
                        };
                        const fromPrevious = findVendorFromPreviousUtilityEntry(
                            previousEntry,
                            vendorOptions
                        );
                        if (fromPrevious && applyVendorPrefill(fromPrevious)) return;
                        const defaultName = UTILITY_PREFILL_VENDOR_BY_TYPE[prefillUtilityType];
                        const defaultVendor = findVendorOptionByName(vendorOptions, defaultName);
                        if (defaultVendor) applyVendorPrefill(defaultVendor);
                    };
                    applyUtilityVendorPrefill();
                };
                setTimeout(() => {
                    fetchPreviousEntry();
                }, 500);
            } catch (error) {
                console.error('Error parsing prefill data:', error);
                localStorage.removeItem('expenseEntryPrefill');
            }
        }
    }, [
        siteOptions,
        accountTypeOptions,
        categoryOptions,
        vendorOptions,
        contractorOptions,
        combinedOptions,
        vendorOptionsLoaded,
        contractorOptionsLoaded,
        lockUtilityPrefillFields,
    ]);
    useEffect(() => {
        if (selectedSite && selectedSite.id) {
            fetchProjectData(selectedSite.id);
        } else {
            setProjectData(null);
            setEbNumberOptions([]);
        }
    }, [selectedSite]);
    useEffect(() => {
        if (utilityType && projectData) {
            updateEbNumberOptions(utilityType, projectData);
        } else {
            setEbNumberOptions([]);
        }
    }, [utilityType, projectData]);
    useEffect(() => {
        if (utilityType !== 'Telecom' && utilityType !== 'Subscription') {
            setServiceStartingDate('');
        }
    }, [utilityType]);
    useEffect(() => {
        const prefillDataStr = localStorage.getItem('expenseEntryPrefill');
        if (prefillDataStr && ebNumberOptions.length > 0) {
            try {
                const prefillData = JSON.parse(prefillDataStr);
                const targetNumber =
                    ((prefillData.utilityType === 'Telecom' || prefillData.utilityType === 'Subscription') ? prefillData.utilityTypeNumber : null) ||
                    prefillData.ebNo ||
                    prefillData.propertyTaxNo ||
                    prefillData.waterTaxNo ||
                    prefillData.professionTaxNo ||
                    prefillData.professionalTaxNo ||
                    prefillData.utilityTypeNumber ||
                    (prefillData.utilityIdentifier ? prefillData.utilityIdentifier.value : null) ||
                    null;
                const ebOption = ebNumberOptions.find(opt => opt.value === targetNumber);
                if (ebOption) {
                    setSelectedEbNumber(ebOption);
                    setTimeout(() => {
                        localStorage.removeItem('expenseEntryPrefill');
                    }, 1000);
                }
            } catch (error) {
                console.error('Error setting EB number:', error);
                localStorage.removeItem('expenseEntryPrefill');
            }
        }
    }, [ebNumberOptions]);
    // ISO 8601 week number calculation
    // Week belongs to the year that contains the Thursday of that week
    // Week 1 is the week with the year's first Thursday
    // Monday to Sunday weeks
    const getISOWeekNumber = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        // Get Thursday of the week containing the date
        // Monday = 1, Tuesday = 2, ..., Sunday = 0 (convert to 7)
        const dayOfWeek = d.getDay() || 7; // Convert Sunday (0) to 7
        const thursday = new Date(d);
        thursday.setDate(d.getDate() + 4 - dayOfWeek); // Thursday is 4 days after Monday
        thursday.setHours(0, 0, 0, 0);

        // Use the year that Thursday falls in (ISO 8601 rule)
        const weekYear = thursday.getFullYear();

        // Get January 1st of that year
        const jan1 = new Date(weekYear, 0, 1);
        jan1.setHours(0, 0, 0, 0);

        // Get the Thursday of week 1 (first Thursday of the year)
        const jan1DayOfWeek = jan1.getDay() || 7;
        const firstThursday = new Date(jan1);
        firstThursday.setDate(jan1.getDate() + 4 - jan1DayOfWeek);
        firstThursday.setHours(0, 0, 0, 0);

        // Calculate week number: difference in days divided by 7, plus 1
        const daysDiff = Math.floor((thursday - firstThursday) / 86400000);
        const weekNo = Math.floor(daysDiff / 7) + 1;

        return weekNo;
    };

    const getCurrentWeekNumber = (date) => {
        return getISOWeekNumber(date || new Date());
    };
    const isRowForActiveBranch = (row) => {
        if (activeBranchId === null || activeBranchId === undefined || activeBranchId === '') return true;
        const bid = row?.branch_id ?? row?.branchId;
        if (bid === null || bid === undefined || bid === '') return false;
        return Number(bid) === Number(activeBranchId);
    };
    /** Current ISO week: true if any weekly-expense or payment row has status true. */
    const currentWeekHasStatusTrue = async () => {
        const weekNumber = getCurrentWeekNumber();
        try {
            const [expensesRes, paymentsRes] = await Promise.all([
                fetch(buildBranchUrl(`https://backendaab.in/demoAabuildersDash/api/weekly-expenses/week/${weekNumber}`)),
                fetch(buildBranchUrl(`https://backendaab.in/demoAabuildersDash/api/payments-received/week/${weekNumber}`)),
            ]);
            const expensesData = expensesRes.ok ? await expensesRes.json() : [];
            const paymentsData = paymentsRes.ok ? await paymentsRes.json() : [];
            const expenses = Array.isArray(expensesData) ? expensesData : [];
            const payments = Array.isArray(paymentsData) ? paymentsData : [];
            const hasStatusTrue = (row) => isRowForActiveBranch(row) && row?.status === true;
            return expenses.some(hasStatusTrue) || payments.some(hasStatusTrue);
        } catch (error) {
            console.error('Error resolving weekly expense status:', error);
            return false;
        }
    };
    const fetchProjectData = async (projectId) => {
        try {
            const response = await fetch(`https://backendaab.in/demoAabuilderDash/api/projects/get/${projectId}`);
            if (response.ok) {
                const data = await response.json();
                setProjectData(data);
                return data;
            } else {
                console.error('Failed to fetch project data');
                return null;
            }
        } catch (error) {
            console.error('Error fetching project data:', error);
            return null;
        }
    };
    const updateEbNumberOptions = async (utilityType, projectData) => {
        // Telecom numbers come from telecom directory, filtered by project_id
        if (utilityType === 'Telecom') {
            const pid =
                projectData?.id ??
                projectData?.projectId ??
                projectData?.project_id ??
                selectedSite?.id ??
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
                setEbNumberOptions(
                    unique.map((no, idx) => ({
                        value: no,
                        label: no,
                        id: idx
                    }))
                );
            } catch (e) {
                console.error('Failed to fetch telecom service numbers', e);
                setEbNumberOptions([]);
            }
            return;
        }

        if (utilityType === 'Subscription') {
            const pid =
                projectData?.id ??
                projectData?.projectId ??
                projectData?.project_id ??
                selectedSite?.id ??
                null;
            if (!pid) {
                setEbNumberOptions([]);
                return;
            }
            try {
                const res = await axios.get(SUBSCRIPTION_DIRECTORY_ENDPOINT);
                const rows = Array.isArray(res.data) ? res.data : [];
                const serviceNos = rows
                    .filter((r) => String(r?.project_id ?? r?.projectId ?? '') === String(pid))
                    .map((r) => r?.service_number ?? r?.serviceNumber ?? '')
                    .map((v) => String(v || '').trim())
                    .filter(Boolean);
                const unique = Array.from(new Set(serviceNos));
                setEbNumberOptions(
                    unique.map((no, idx) => ({
                        value: no,
                        label: no,
                        id: idx
                    }))
                );
            } catch (e) {
                console.error('Failed to fetch subscription service numbers', e);
                setEbNumberOptions([]);
            }
            return;
        }

        // Other utilities use project property details
        if (!projectData || !projectData.propertyDetails) {
            setEbNumberOptions([]);
            return;
        }
        const options = [];
        projectData.propertyDetails.forEach((property, index) => {
            let optionValue = '';
            let optionLabel = '';
            switch (utilityType) {
                case 'Electricity':
                    if (property.ebNo) {
                        optionValue = property.ebNo;
                        optionLabel = property.ebNo;
                    }
                    break;
                case 'Property':
                    if (property.propertyTaxNo) {
                        optionValue = property.propertyTaxNo;
                        optionLabel = property.propertyTaxNo;
                    }
                    break;
                case 'Water':
                    if (property.waterTaxNo) {
                        optionValue = property.waterTaxNo;
                        optionLabel = property.waterTaxNo;
                    }
                    break;
                case 'Profession': {
                    const professionTaxNo = getPropertyProfessionTaxNo(property);
                    if (professionTaxNo) {
                        optionValue = professionTaxNo;
                        optionLabel = professionTaxNo;
                    }
                    break;
                }
                default:
                    return;
            }
            if (optionValue && optionLabel) {
                options.push({
                    value: optionValue,
                    label: optionLabel,
                    id: index
                });
            }
        });
        setEbNumberOptions(options);
    };
    const handleChange = (selectedOption) => {
        setSelectedOption(selectedOption);
        if (selectedOption) {
            setSelectedType(selectedOption.type);
            const match = findCategoryOptionByVendorField(selectedOption.category);
            if (match) applyResolvedCategoryOption(match);
        } else {
            setSelectedType("");
        }
    };
    // Helper function to convert image to PDF
    const convertImageToPdf = (file) => {
        return new Promise((resolve, reject) => {
            // Check if file is an image
            const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
            if (!imageTypes.includes(file.type)) {
                // If it's already a PDF, return as is
                resolve(file);
                return;
            }

            // Create an image element to load the file
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.onload = () => {
                    try {
                        // Calculate dimensions to fit A4 page (in mm)
                        const pdfWidth = 210; // A4 width in mm
                        const pdfHeight = 297; // A4 height in mm
                        const imgWidth = img.width;
                        const imgHeight = img.height;

                        // Calculate aspect ratio
                        const imgAspectRatio = imgWidth / imgHeight;
                        const pdfAspectRatio = pdfWidth / pdfHeight;

                        // Determine orientation
                        const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait';
                        let finalWidth, finalHeight;

                        if (orientation === 'landscape') {
                            // Use landscape dimensions
                            if (imgAspectRatio > pdfAspectRatio) {
                                // Image is wider, fit to width
                                finalWidth = pdfWidth;
                                finalHeight = pdfWidth / imgAspectRatio;
                            } else {
                                // Image is taller, fit to height
                                finalHeight = pdfHeight;
                                finalWidth = pdfHeight * imgAspectRatio;
                            }
                        } else {
                            // Use portrait dimensions
                            if (imgAspectRatio > pdfAspectRatio) {
                                // Image is wider, fit to width
                                finalWidth = pdfWidth;
                                finalHeight = pdfWidth / imgAspectRatio;
                            } else {
                                // Image is taller, fit to height
                                finalHeight = pdfHeight;
                                finalWidth = pdfHeight * imgAspectRatio;
                            }
                        }

                        // Center the image on the page
                        const xOffset = (pdfWidth - finalWidth) / 2;
                        const yOffset = (pdfHeight - finalHeight) / 2;

                        // Create a new PDF document
                        const pdf = new jsPDF({
                            orientation: orientation,
                            unit: 'mm',
                            format: 'a4'
                        });

                        // Determine image format for PDF
                        let imgFormat = 'JPEG';
                        if (file.type === 'image/png') {
                            imgFormat = 'PNG';
                        } else if (file.type === 'image/gif') {
                            imgFormat = 'GIF';
                        }

                        // Add the image to PDF
                        pdf.addImage(img, imgFormat, xOffset, yOffset, finalWidth, finalHeight);

                        // Convert PDF to blob
                        const pdfBlob = pdf.output('blob');

                        // Create a File object from the blob with .pdf extension
                        const pdfFile = new File([pdfBlob], file.name.replace(/\.[^/.]+$/, '') + '.pdf', {
                            type: 'application/pdf',
                            lastModified: Date.now()
                        });

                        resolve(pdfFile);
                    } catch (error) {
                        console.error('Error converting image to PDF:', error);
                        reject(error);
                    }
                };

                img.onerror = () => {
                    reject(new Error('Failed to load image'));
                };

                img.src = e.target.result;
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Convert image to PDF if it's an image
                const processedFile = await convertImageToPdf(file);
                setSelectedFile(processedFile);
            } catch (error) {
                console.error('Error processing file:', error);
                alert('Error processing file. Please try again.');
            }
        }
        e.target.value = '';
    };
    useEffect(() => {
        if (!selectedFile) {
            setFilePreviewUrl(null);
            return;
        }
        const objectUrl = URL.createObjectURL(selectedFile);
        setFilePreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);
    const handleCategoryChange = (selectedCategory) => {
        applyResolvedCategoryOption(selectedCategory);
    };
    const fetchLatestEno = async () => {
        try {
            const response = await fetch("https://backendaab.in/demoAabuilderDash/expenses_form/get_form");
            if (!response.ok) {
                throw new Error('Failed to fetch ENo');
            }
            const data = await response.json();
            if (data.length > 0) {
                const sortedData = data.sort((a, b) => b.eno - a.eno);
                const lastEno = sortedData[0].eno;
                setEno(lastEno + 1);
            } else {
                setEno(54173);
            }
        } catch (error) {
            console.error('Error fetching latest ENo:', error);
        }
    };
    const formatNumber = (num) => {
        if (!num) return '';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };
    const handleAmountChange = (e) => {
        const rawValue = e.target.value.replace(/,/g, '');
        if (!isNaN(rawValue)) {
            setAmount(rawValue);
        }
    };
    useEffect(() => {
        fetchLatestEno();
    }, []);
    const formatDateOnly = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };
    const formatDateview = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12;
        return `${day}/${month}/${year} ${hour12}:${minutes} ${ampm}`;
    };
    const toLocalDateStr = (val) => {
        if (!val) return '';
        const d = new Date(val);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };
    const normalizeStr = (s) => (s == null ? '' : String(s).trim());
    const checkForDuplicateEntry = async () => {
        const vendorLabel = normalizeStr(selectedType === 'Vendor' && selectedOption ? selectedOption.label : '');
        const contractorLabel = normalizeStr(selectedType === 'Contractor' && selectedOption ? selectedOption.label : '');
        const siteLabel = normalizeStr(selectedSite ? selectedSite.label : '');
        const amountNum = parseFloat(String(amount).replace(/,/g, '')) || 0;
        const dateStr = date ? (date.includes('-') ? date.split('T')[0] : toLocalDateStr(date)) : '';

        try {
            const response = await fetch(buildBranchUrl("https://backendaab.in/demoAabuilderDash/expenses_form/get_form"));
            if (!response.ok) return [];
            const allExpenses = await response.json();

            const matching = allExpenses.filter((exp) => {
                const expDateStr = toLocalDateStr(exp.date || exp.timestamp);
                const dateMatch = expDateStr === dateStr;
                if (!dateMatch) return false;

                const expAmount = Math.abs(parseFloat(exp.amount) || 0);
                const amountMatch = Math.abs(expAmount - amountNum) < 0.01;
                if (!amountMatch) return false;

                const expSiteName = normalizeStr(exp.siteName || exp.projectName || '');
                const expProjectId = exp.projectId ?? exp.project_id ?? null;
                const selectedProjectId = selectedSite ? Number(selectedSite.id) : null;
                const projectMatch =
                    (siteLabel && expSiteName && expSiteName === siteLabel) ||
                    (selectedProjectId && expProjectId != null && Number(expProjectId) === selectedProjectId);
                if (!projectMatch) return false;

                const expVendor = normalizeStr(exp.vendor || '');
                const expContractor = normalizeStr(exp.contractor || '');
                const expVendorId = exp.vendorId ?? exp.vendor_id ?? null;
                const expContractorId = exp.contractorId ?? exp.contractor_id ?? null;
                const selectedId = selectedOption ? Number(selectedOption.id) : null;

                let vendorContractorMatch = false;
                if (selectedType === 'Vendor') {
                    vendorContractorMatch =
                        (vendorLabel && expVendor === vendorLabel) ||
                        (selectedId != null && expVendorId != null && Number(expVendorId) === selectedId);
                } else if (selectedType === 'Contractor') {
                    vendorContractorMatch =
                        (contractorLabel && expContractor === contractorLabel) ||
                        (selectedId != null && expContractorId != null && Number(expContractorId) === selectedId);
                }
                if (!vendorContractorMatch) return false;

                return true;
            });

            return matching;
        } catch (err) {
            console.error('Error checking duplicate:', err);
            return [];
        }
    };
    const validateFormFields = () => {
        if (!selectedAccountType || !date || !selectedSite || !amount || !selectedCategory || !selectedOption) {
            alert('Please fill out all required fields.');
            return false;
        }
        if (!resolveAccountTypeIdForSave()) {
            alert('Account type ID is missing. Please re-select the account type.');
            return false;
        }
        if (summaryBillMode) {
            const remaining = Number(summaryBillRemaining ?? summaryBillTotal ?? 0) || 0;
            const entryAmt = parseFloat(String(amount).replace(/,/g, '')) || 0;
            if (entryAmt <= 0) {
                alert('Please enter a valid amount.');
                return false;
            }
            if (!allowSplitOverpay && remaining > 0 && entryAmt - remaining > 0.0001) {
                alert(`Entered amount exceeds remaining Summary Bill amount (₹${remaining.toLocaleString('en-IN')}).`);
                return false;
            }
        }
        if (
            (selectedAccountType === 'Claim Payment' ||
                selectedAccountType === 'Utility Bills' ||
                selectedAccountType === 'Sundry Payment') &&
            !paymentMode
        ) {
            alert('Please select a payment mode for this account type.');
            return false;
        }
        if (selectedAccountType === 'Bill Refund' && !selectedFile) {
            alert('PDF file is required for Bill Refund.');
            return false;
        }
        // Bill Arrival Date is optional for Bill Payments / Bill Refund
        if ((selectedAccountType === 'Utility Bills' || selectedAccountType === 'Bill Payments') && !selectedFile) {
            alert('PDF file is required for this account type.');
            return false;
        }
        if (
            selectedAccountType !== 'Daily Wage' &&
            selectedAccountType !== 'Utility Bills' &&
            selectedAccountType !== 'Bill Payments' &&
            selectedAccountType !== 'Bill Refund' &&
            !selectedFile
        ) {
            alert('PDF file is required for this type.');
            return false;
        }
        if (selectedCategory?.label === 'Machine Repair') {
            if (!selectedToolsItemName) {
                alert('Please select an item name for Machine Repair.');
                return false;
            }
            if (!selectedMachineTools) {
                alert('Please select a machine tool for Machine Repair.');
                return false;
            }
        }
        return true;
    };
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!validateFormFields()) {
            return;
        }
        setCheckingDuplicate(true);
        try {
            const duplicates = await checkForDuplicateEntry();
            if (duplicates && duplicates.length > 0) {
                setDuplicateMatchedExpenses(duplicates);
                setShowDuplicateModal(true);
                return;
            }
        } catch (err) {
            console.error('Duplicate check failed:', err);
        } finally {
            setCheckingDuplicate(false);
        }
        setShowReviewModal(true);
        setIsReviewEditMode(false);
    };
    const handleDuplicateIgnore = () => {
        setShowDuplicateModal(false);
        setDuplicateMatchedExpenses([]);
        setShowReviewModal(true);
        setIsReviewEditMode(false);
    };
    const handleDuplicateCancel = () => {
        setShowDuplicateModal(false);
        setDuplicateMatchedExpenses([]);
    };
    const putWeeklyExpenseBillCopyUrl = async (weeklyExpenseId, url) => {
        if (weeklyExpenseId == null || url == null || String(url).trim() === '') return false;
        const res = await fetch(
            `https://backendaab.in/demoAabuildersDash/api/weekly-expenses/${weeklyExpenseId}/bill-copy-url`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(url),
            }
        );
        return res.ok;
    };
    const submitExpenseData = async () => {
        if (
            (selectedAccountType === 'Claim Payment' || selectedAccountType === 'Utility Bills' || selectedAccountType === 'Sundry Payment' || selectedAccountType === 'Bill Payments') &&
            ["GPay", "Gpay", "PhonePe", "Net Banking", "Cheque"].includes(paymentMode)
        ) {
            setPaymentModalData({
                date: date,
                amount: amount,
                paymentMode: paymentMode,
                chequeNo: "",
                chequeDate: "",
                transactionNumber: "",
                accountNumber: ""
            });
            setShowPaymentModal(true);
            setShowReviewModal(false);
            return;
        }
        setIsSubmitting(true);
        setShowReviewModal(false);
        try {
            let vendor = '';
            let contractor = '';
            if (selectedType === 'Vendor') {
                vendor = selectedOption ? selectedOption.label : '';
            } else if (selectedType === 'Contractor') {
                contractor = selectedOption ? selectedOption.label : '';
            }
            let pdfUrl = '';

            if (selectedFile) {
                try {
                    const formData = new FormData();
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
                    const finalName = `${timestamp}_${selectedSite.sNo}_${vendor || contractor}`;
                    // ✅ IMPORTANT: key must be "files" (plural)
                    formData.append("files", selectedFile);
                    // ✅ required
                    formData.append("folder", "FileUpload / Expenses_Entry_Files");
                    // ✅ optional (your backend uses this as prefix)
                    formData.append("fileName", finalName);
                    const uploadResponse = await fetch("https://backendaab.in/demoAabuildersDash/api/files/upload", {
                        method: "POST",
                        body: formData,
                    });
                    if (!uploadResponse.ok) {
                        throw new Error("File upload failed");
                    }
                    const result = await uploadResponse.json();
                    // ✅ backend returns { urls: [] }
                    pdfUrl = result.urls[0];

                } catch (error) {
                    console.error("Error during file upload:", error);
                    alert("Error during file upload. Please try again.");
                    setIsSubmitting(false);
                    return;
                }
            }
            const projectId = selectedSite ? selectedSite.id : null;
            const vendorId = resolveSelectedVendorId(selectedOption);
            const contractorId = selectedType === 'Contractor' && selectedOption ? (selectedOption.id || null) : null;
            const accountTypeId = resolveAccountTypeIdForSave();
            const bodyData = {
                accountType: selectedAccountType,
                accountTypeId,
                date: date,
                paymentMode: paymentMode,
                siteName: selectedSite ? selectedSite.label : '',
                projectId: projectId,
                vendor: vendor,
                vendorId: vendorId,
                contractor: contractor,
                contractorId: contractorId,
                source: "Expenses Entry",
                quantity: quantity,
                amount: selectedAccountType === 'Bill Refund' ? -Math.abs(parseInt(amount)) : parseInt(amount),
                category: selectedCategory ? selectedCategory.label : '',
                comments: comments,
                machineTools: selectedMachineTools?.id != null ? selectedMachineTools.id : null,
                billCopyUrl: pdfUrl || '',
                utilityType: utilityType || '',
                utilityTypeNumber: selectedEbNumber ? selectedEbNumber.label : '',
                utilityForTheMonth: selectedMonths || '',
                utilityValidityDays: thirdInput || '',
                utilityValidityType: validityType || '',
                serviceStartingDate: serviceStartingDate || '',
                billArrivalDate: usesBillArrivalDate(selectedAccountType)
                    ? (String(billArrivalDate || '').trim() || '')
                    : '',
                branchId: activeBranchId,
                enteredBy: username,
                ...(eno != null ? { eno } : {}),
            };
            const formResponse = await fetch(buildBranchUrl("https://backendaab.in/demoAabuilderDash/expenses_form/save"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bodyData),
            });
            let expensesId = null;
            let savedExpenseData = null;
            const responseText = await formResponse.text();
            if (!formResponse.ok) {
                throw new Error(`Form submission failed: ${responseText}`);
            }
            expensesId = resolveExpensesEntryIdAfterSave(responseText);
            console.log("expensesId", expensesId);
            if (!expensesId) {
                throw new Error(
                    'Expenses save response did not include id. Backend must return { id } from expenses_form.'
                );
            }
            const trimmedSaveResponse = responseText.trim();
            if (trimmedSaveResponse.startsWith('{') || trimmedSaveResponse.startsWith('[')) {
                try {
                    savedExpenseData = JSON.parse(trimmedSaveResponse);
                } catch {
                    savedExpenseData = null;
                }
            }
            if (expensesId) {
                try {
                    const verifyResponse = await fetch("https://backendaab.in/demoAabuilderDash/expenses_form/get_form");
                    if (verifyResponse.ok) {
                        const allForms = await verifyResponse.json();
                        const savedForm = allForms.find(f => f.id === expensesId);
                    }
                } catch (verifyError) {
                    console.error('Could not verify saved data:', verifyError);
                }
            }
            // When opened from Cash Register file-upload flows, we must NOT create a weekly-expenses row here.
            if (!disableWeeklyExpensesSave && paymentMode === 'Cash' && expensesId && selectedAccountType !== 'Bill Payments') {
                let vendorId = null;
                let contractorId = null;
                if (selectedType === 'Vendor' && selectedOption) {
                    vendorId = resolveSelectedVendorId(selectedOption);
                } else if (selectedType === 'Contractor' && selectedOption) {
                    contractorId = selectedOption.id;
                }
                const weeklyNumber = getCurrentWeekNumber();
                const weeklyExpenseStatus = await currentWeekHasStatusTrue();
                const weeklyExpenseData = {
                    date: date,
                    created_at: new Date().toISOString(),
                    contractor_id: contractorId,
                    vendor_id: vendorId,
                    employee_id: null,
                    project_id: projectId,
                    type: selectedAccountType === 'Claim Payment' ? "Claim Payment" : selectedAccountType === 'Sundry Payment' ? "Sundry Payment" : selectedAccountType === 'Bill Payments' ? "Bill" : selectedAccountType === 'Utility Bills' ? ( utilityType || "Utility Bills") : "Expense",
                    amount: selectedAccountType === 'Bill Refund' ? -Math.abs(parseFloat(amount)) : parseFloat(amount),
                    status: weeklyExpenseStatus,
                    weekly_number: weeklyNumber,
                    advance_portal_id: null,
                    staff_advance_portal_id: null,
                    loan_portal_id: null,
                    rent_management_id: null,
                    expenses_entry_id: expensesId,
                    send_to_expenses_entry: false,
                    bill_copy_url: pdfUrl || '',
                    branch_id: activeBranchId,
                    entered_by: username,
                    source: "Expenses Entry",
                };
                try {
                    const weeklyExpenseResponse = await fetch("https://backendaab.in/demoAabuildersDash/api/weekly-expenses/save", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(weeklyExpenseData),
                    });
                    if (!weeklyExpenseResponse.ok) {
                        console.error("❌ Weekly expense submission failed");
                    } else {
                        console.log("✅ Weekly expense submitted:", weeklyExpenseData);
                    }
                } catch (error) {
                    console.error("❌ Error submitting weekly expense:", error);
                }
            }
            if (weeklyExpenseIdForBillCopyUrl != null && pdfUrl) {
                const ok = await putWeeklyExpenseBillCopyUrl(weeklyExpenseIdForBillCopyUrl, pdfUrl);
                if (!ok) {
                    toast.warn('Expense saved, but the weekly bill row could not be updated with the file link.');
                }
            }
            if (summaryBillMode) {
                const entryAmt = parseFloat(String(amount).replace(/,/g, "")) || 0;
                const prevRemaining = Number(summaryBillRemaining ?? summaryBillTotal ?? 0) || 0;
                const nextRemainingRaw = prevRemaining - entryAmt;
                const nextRemaining = Math.max(0, Math.round(nextRemainingRaw * 100) / 100);
                if (nextRemaining > 0) {
                    setSummaryBillRemaining(nextRemaining);
                    // Prepare for next split entry; keep prefills (vendor/contractor/category/etc).
                    setAmount('');
                    // Clear only what the user must re-enter for each split.
                    setSelectedSite(null);
                    setProjectData(null);
                    setSelectedEbNumber(null);
                    setEbNumberOptions([]);
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    setShowReviewModal(false);
                    toast.success(`Saved. Remaining amount: ₹${nextRemaining.toLocaleString('en-IN')}`);
                    return;
                }
                // Completed the full Summary Bill amount.
                setSummaryBillTotal(null);
                setSummaryBillRemaining(null);
            }
            resetForm();
            if (typeof onSuccess === 'function') {
                try { await onSuccess(savedExpenseData || null); } catch { }
            }
        } catch (error) {
            console.error('Error during form submission:', error);
            alert('Error during form submission. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleReviewConfirm = () => {
        if (isReviewEditMode) {
            return;
        }
        if (!validateFormFields()) {
            return;
        }
        submitExpenseData();
    };
    const handleReviewClose = () => {
        setShowReviewModal(false);
        setIsReviewEditMode(false);
    };
    const handleReviewSave = () => {
        if (!validateFormFields()) {
            return;
        }
        setIsReviewEditMode(false);
    };
    const handleSummaryForceClose = async () => {
        if (!summaryBillMode) return;
        const remaining = Number(summaryBillRemaining ?? summaryBillTotal ?? 0) || 0;
        const entered = Number(String(summaryForceCloseAmount || '').replace(/,/g, ''));
        if (!Number.isFinite(entered) || entered <= 0) {
            alert('Please enter a valid balance amount to ignore.');
            return;
        }
        if (Math.abs(entered - remaining) > 0.01) {
            alert(`Entered amount should match remaining amount (₹${remaining.toLocaleString('en-IN')}).`);
            return;
        }
        setSummaryBillTotal(null);
        setSummaryBillRemaining(null);
        setSummaryForceCloseAmount('');
        try {
            localStorage.removeItem('expenseEntryPrefill');
        } catch {
            // ignore
        }
        if (typeof onSuccess === 'function') {
            try { await onSuccess({ forcedSummaryClose: true }); } catch { }
        }
    };
    const renderReviewRow = (label, value) => (
        <div className="flex justify-between gap-4 border border-gray-100 rounded-lg px-4 py-2" key={label}>
            <span className="text-sm font-semibold text-gray-600">{label}</span>
            <span className="text-sm text-gray-800 text-right break-words">{value || '-'}</span>
        </div>
    );
    const resetForm = () => {
        setAmount('');
        setQuantity('');
        setComments('');
        setSelectedFile(null);
        setSelectedOption(null);
        setSelectedSite(null);
        setSelectedCategory(null);
        setSelectedMachine(null);
        setSelectedToolsItemName(null);
        setSelectedType("");
        setPaymentMode('');
        setBillPaymentsCashRegisterPrefill(false);
        setWeeklyExpenseIdForBillCopyUrl(null);
        setSelectedEbNumber(null);
        setSelectedMonths('');
        setThirdInput('');
        setValidityType('');
        setServiceStartingDate('');
        setBillArrivalDate('');
        setUtilityType('');
        setProjectData(null);
        setEbNumberOptions([]);
        setShowReviewModal(false);
        setIsReviewEditMode(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    const handlePaymentSubmit = async () => {
        if (!paymentModalData.accountNumber && paymentModalData.paymentMode !== "Cash") {
            alert("Please select account number.");
            return;
        }
        if (paymentModalData.paymentMode === "Cheque" && (!paymentModalData.chequeNo || !paymentModalData.chequeDate)) {
            alert("Please enter cheque number and date.");
            return;
        }
        if ((selectedAccountType === 'Utility Bills' || selectedAccountType === 'Bill Payments') && !selectedFile) {
            alert('PDF file is required for this account type.');
            return;
        }
        if (!resolveAccountTypeIdForSave()) {
            alert('Account type ID is missing. Please re-select the account type.');
            return;
        }
        // Bill Arrival Date is optional for Bill Payments
        setIsSubmitting(true);
        try {
            let pdfUrl = '';

            if (selectedFile) {
                try {
                    const formData = new FormData();

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

                    const finalName = `${timestamp} ${selectedSite.sNo} ${selectedOption.label}`;

                    // ✅ IMPORTANT: key must be "files" (plural)
                    formData.append("files", selectedFile);

                    // ✅ required
                    formData.append("folder", "FileUpload / Expenses_Entry_Files");

                    // ✅ optional (your backend uses this as prefix)
                    formData.append("fileName", finalName);

                    const uploadResponse = await fetch("https://backendaab.in/demoAabuildersDash/api/files/upload", {
                        method: "POST",
                        body: formData,
                    });

                    if (!uploadResponse.ok) {
                        throw new Error("File upload failed");
                    }

                    const result = await uploadResponse.json();

                    // ✅ backend returns { urls: [] }
                    pdfUrl = result.urls[0];

                } catch (error) {
                    console.error("Error during file upload:", error);
                    alert("Error during file upload. Please try again.");
                    setIsSubmitting(false);
                    return;
                }
            }
            let vendor = '';
            let contractor = '';
            if (selectedType === 'Vendor') {
                vendor = selectedOption ? selectedOption.label : '';
            } else if (selectedType === 'Contractor') {
                contractor = selectedOption ? selectedOption.label : '';
            }
            const projectId = selectedSite ? selectedSite.id : null;
            const vendorId = resolveSelectedVendorId(selectedOption);
            const contractorId = selectedType === 'Contractor' && selectedOption ? (selectedOption.id || null) : null;
            const accountTypeId = resolveAccountTypeIdForSave();
            const expensesPayload = {
                accountType: selectedAccountType,
                accountTypeId,
                date: paymentModalData.date,
                siteName: selectedSite ? selectedSite.label : '',
                projectId: projectId,
                vendor: vendor,
                vendorId: vendorId,
                vendor_id: vendorId,
                contractor: contractor,
                contractorId: contractorId,
                contractor_id: contractorId,
                quantity: quantity,
                amount: parseInt(paymentModalData.amount),
                source: "Expenses Entry",
                category: selectedCategory ? selectedCategory.label : '',
                comments: comments,
                machineTools: selectedMachineTools?.id != null ? selectedMachineTools.id : null,
                billCopyUrl: pdfUrl || '',
                paymentMode: paymentModalData.paymentMode,
                utilityType: utilityType || '',
                utilityTypeNumber: selectedEbNumber ? selectedEbNumber.label : '',
                utilityForTheMonth: selectedMonths || '',
                utilityValidityDays: thirdInput || '',
                utilityValidityType: validityType || '',
                serviceStartingDate: serviceStartingDate || '',
                billArrivalDate: usesBillArrivalDate(selectedAccountType)
                    ? (String(billArrivalDate || '').trim() || '')
                    : '',
                branchId: activeBranchId,
                enteredBy: username,
                ...(eno != null ? { eno } : {}),
            };
            const expensesSaveUrl = buildBranchUrl("https://backendaab.in/demoAabuilderDash/expenses_form/save");
            if (
                selectedAccountType !== 'Bill Payments' &&
                isPaymentModeRequiringBankRegisterLog(paymentModalData.paymentMode)
            ) {
                await postBankRegisterLogSave(
                    bankRegisterLogSaveUrlMatchingRequest(expensesSaveUrl),
                    "Expense Entry",
                    {
                        bill_payment_mode: paymentModalData.paymentMode,
                        amount: paymentModalData.amount,
                        entered_by: username,
                    }
                );
            }
            const expensesResponse = await fetch(expensesSaveUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(expensesPayload),
            });
            let expensesId = null;
            let savedExpenseData = null;
            const responseText = await expensesResponse.text();
            if (!expensesResponse.ok) {
                throw new Error(`Expenses form submission failed: ${responseText}`);
            }
            expensesId = resolveExpensesEntryIdAfterSave(responseText);
            if (!expensesId) {
                throw new Error(
                    'Expenses save response did not include id. Backend must return { id } from expenses_form.'
                );
            }
            const trimmedSaveResponse = responseText.trim();
            if (trimmedSaveResponse.startsWith('{') || trimmedSaveResponse.startsWith('[')) {
                try {
                    savedExpenseData = JSON.parse(trimmedSaveResponse);
                } catch {
                    savedExpenseData = { id: expensesId };
                }
            } else {
                savedExpenseData = { id: expensesId, message: responseText };
            }
            if (expensesId) {
                try {
                    const verifyResponse = await fetch("https://backendaab.in/demoAabuilderDash/expenses_form/get_form");
                    if (verifyResponse.ok) {
                        const allForms = await verifyResponse.json();
                        const savedForm = allForms.find(f => f.id === expensesId);
                    }
                } catch (verifyError) {
                    console.error('Could not verify saved data:', verifyError);
                }
            }
            if (selectedAccountType !== 'Bill Payments') {
                const weeklyPaymentBillPayload = {
                    date: paymentModalData.date,
                    created_at: new Date().toISOString(),
                    contractor_id: selectedOption?.type === 'Contractor' ? selectedOption.id : null,
                    vendor_id: resolveSelectedVendorId(selectedOption),
                    employee_id: null,
                    project_id: selectedSite?.id || null,
                    type: selectedAccountType === 'Claim Payment' ? "Claim Payment" : selectedAccountType === 'Sundry Payment' ? "Sundry Payment" : "Utility Payment",
                    bill_payment_mode: paymentModalData.paymentMode,
                    amount: parseFloat(paymentModalData.amount),
                    status: true,
                    weekly_number: "",
                    expenses_entry_id: expensesId,
                    advance_portal_id: null,
                    staff_advance_portal_id: null,
                    claim_payment_id: null,
                    cheque_number: paymentModalData.chequeNo || null,
                    cheque_date: paymentModalData.chequeDate || null,
                    transaction_number: paymentModalData.transactionNumber || null,
                    account_number: paymentModalData.accountNumber || null,
                    branch_id: activeBranchId,
                    entered_by: username,
                    source: "Expenses Entry",
                };
                const weeklyResponse = await fetch('https://backendaab.in/demoAabuildersDash/api/weekly-payment-bills/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(weeklyPaymentBillPayload)
                });
                let weeklyResult;
                try {
                    const responseText = await weeklyResponse.text();
                    if (!weeklyResponse.ok) {
                        throw new Error(`Weekly payment bills submission failed: ${responseText}`);
                    }
                    if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
                        weeklyResult = JSON.parse(responseText);
                    } else {
                        throw new Error(`Weekly payment bills API returned non-JSON response: ${responseText}`);
                    }
                } catch (parseError) {
                    console.error('Weekly payment bills response parsing error:', parseError);
                    throw new Error('Failed to parse weekly payment bills API response');
                }
                toast.success(`${selectedAccountType} payment saved successfully and added to Weekly Payment Bills!`, {
                    position: "top-center",
                    autoClose: 3000,
                    theme: "colored"
                });
            } else {
                toast.success(`${selectedAccountType} payment saved successfully.`, {
                    position: "top-center",
                    autoClose: 3000,
                    theme: "colored"
                });
            }
            if (weeklyExpenseIdForBillCopyUrl != null && pdfUrl) {
                const ok = await putWeeklyExpenseBillCopyUrl(weeklyExpenseIdForBillCopyUrl, pdfUrl);
                if (!ok) {
                    toast.warn('Expense saved, but the weekly bill row could not be updated with the file link.');
                }
            }
            setEno(eno + 1);
            resetForm();
            setShowPaymentModal(false);
            if (typeof onSuccess === 'function') {
                try { await onSuccess(savedExpenseData || null); } catch { }
            }
        } catch (error) {
            console.error('Error submitting data:', error);
            toast.error('Failed to save data!', {
                position: "top-center",
                autoClose: 3000,
                theme: "colored"
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleChangeAttachment = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    const sortedSiteOptions = siteOptions.sort((a, b) =>
        a.label.localeCompare(b.label)
    );
    const formatDateForReview = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    };
    const vendorOrContractorLabel = selectedOption ? `${selectedOption.label}${selectedType ? ` (${selectedType})` : ''}` : '';
    const formattedAmount = amount ? `${selectedAccountType === 'Bill Refund' ? '-' : ''}₹${formatNumber(Math.abs(amount))}` : '';
    const reviewDetails = [
        { label: EXPENSE_FORM_FIELDS.accountType, value: selectedAccountType || '-' },
        { label: EXPENSE_FORM_FIELDS.date, value: formatDateForReview(date) || '-' },
        { label: EXPENSE_FORM_FIELDS.projectName, value: selectedSite?.label || '-' },
        { label: 'Project Number', value: selectedSite?.sNo || '-' },
        { label: EXPENSE_FORM_FIELDS.vendorContractorName, value: vendorOrContractorLabel || '-' },
    ];
    if (selectedType === 'Vendor' && selectedOption?.id) {
        reviewDetails.push({ label: 'Vendor ID', value: selectedOption.id });
    }
    if (selectedType === 'Contractor' && selectedOption?.id) {
        reviewDetails.push({ label: 'Contractor ID', value: selectedOption.id });
    }
    if (usesBillArrivalDate(selectedAccountType)) {
        reviewDetails.push({
            label: EXPENSE_FORM_FIELDS.billArrivalDate,
            value: formatDateForReview(billArrivalDate) || billArrivalDate || '-',
        });
    }
    reviewDetails.push(
        { label: EXPENSE_FORM_FIELDS.quantity, value: quantity || '-' },
        { label: EXPENSE_FORM_FIELDS.amount, value: formattedAmount || '-' },
        { label: EXPENSE_FORM_FIELDS.category, value: selectedCategory?.label || '-' },
        { label: EXPENSE_FORM_FIELDS.paymentMode, value: paymentMode || '-' },
        { label: EXPENSE_FORM_FIELDS.utilityType, value: utilityType || '-' },
        { label: 'Utility Number', value: selectedEbNumber?.label || '-' },
        { label: EXPENSE_FORM_FIELDS.forTheMonthOf, value: selectedMonths || '-' },
        { label: EXPENSE_FORM_FIELDS.validityDuration, value: thirdInput ? `${thirdInput}${validityType ? ` ${validityType}` : ''}` : '-' },
        { label: EXPENSE_FORM_FIELDS.activationDate, value: formatDateForReview(serviceStartingDate) || '-' },
        { label: EXPENSE_FORM_FIELDS.description, value: comments || '-' },
    );
    const isPdfPreview = selectedFile?.type?.toLowerCase().includes('pdf');
    useEffect(() => {
        const today = new Date();
        const formatted = today.toISOString().split('T')[0];
        setDate(formatted);
    }, []);
    useEffect(() => {
        if (embedded) return undefined;
        const syncSideTableHeights = () => {
            if (window.innerWidth < 1280) {
                setSideTableAreaHeight(null);
                setSideTableContentHeight(null);
                return;
            }
            const leftEl = leftFormColRef.current;
            const commentsEl = commentsSectionRef.current;
            if (!leftEl || !commentsEl) return;
            const leftTop = leftEl.getBoundingClientRect().top;
            const commentsBottom = commentsEl.getBoundingClientRect().bottom;
            const alignHeight = Math.round(commentsBottom - leftTop);
            if (alignHeight > 0) {
                setSideTableAreaHeight(alignHeight);
                setSideTableContentHeight(alignHeight);
            }
        };
        const scheduleSync = () => {
            requestAnimationFrame(() => requestAnimationFrame(syncSideTableHeights));
        };
        scheduleSync();
        const leftEl = leftFormColRef.current;
        if (!leftEl) return undefined;
        const ro = new ResizeObserver(scheduleSync);
        ro.observe(leftEl);
        const commentsEl = commentsSectionRef.current;
        if (commentsEl) ro.observe(commentsEl);
        const headerEl = advanceHeaderRef.current;
        if (headerEl) ro.observe(headerEl);
        window.addEventListener('resize', scheduleSync);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', scheduleSync);
        };
    }, [embedded]);

    return (
        <div className={embedded ? '' : 'bg-[#FAF6ED] px-[18px] pt-[18px] flex flex-col h-[calc(100vh-104px)] overflow-hidden pb-[18px]'}>
            <style jsx>{`
                input:hover, select:hover, textarea:hover {
                    border-color: rgba(191, 152, 83, 0.2) !important;
                }
                input:focus, select:focus, textarea:focus {
                    border-color: rgba(191, 152, 83, 1) !important;
                    outline: none !important;
                }
                input::placeholder,
                textarea::placeholder {
                    color: #6b7280 !important;
                }
                .expense-entry-form-date > div > div:hover {
                    border-color: rgba(191, 152, 83, 0.2) !important;
                }
                .expense-entry-form-date > div > button:hover {
                    border-color: rgba(191, 152, 83, 0.2) !important;
                }
                .expense-entry-form-date > div > div:focus-within {
                    border-color: rgba(191, 152, 83, 1) !important;
                    outline: none !important;
                    box-shadow: none !important;
                }
                .expense-entry-form-date > div:focus-within > button {
                    border-color: rgba(191, 152, 83, 1) !important;
                    outline: none !important;
                    box-shadow: none !important;
                }
                .expense-entry-form-date input:not(:placeholder-shown) {
                    font-weight: inherit !important;
                }
                form input[type="text"],
                form input[type="number"],
                form textarea,
                form select {
                    padding-top: 0 !important;
                    padding-bottom: 0 !important;
                    margin-top: 0 !important;
                    margin-bottom: 0 !important;
                }
                .expense-entry-form-date input {
                    padding-top: 0 !important;
                    padding-bottom: 0 !important;
                }
            `}</style>
            <div className={`px-[18px] pt-[18px] pb-[18px] bg-white rounded w-full flex-1 min-h-0 overflow-auto no-scrollbar scrollbar-none`}>
                <form onSubmit={handleFormSubmit}>
                    <div className="flex flex-col xl:grid xl:grid-cols-[max-content_minmax(0,1fr)] gap-x-[18px] gap-y-[12px] min-w-0 items-start">
                        <div ref={leftFormColRef} className="xl:col-start-1 xl:row-start-1 space-y-[12px]">
                            {summaryBillMode && (
                                <div className=" rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                                    <div className="text-sm font-semibold text-orange-800">
                                        {splitRemainingLabel}:&nbsp;
                                        <span className="text-base font-bold">
                                            ₹{Number(summaryBillRemaining ?? summaryBillTotal ?? 0).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    <div className="text-xs text-orange-700">
                                        Total:&nbsp;₹{Number(summaryBillTotal ?? 0).toLocaleString('en-IN')}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="Ignore balance amount"
                                            value={summaryForceCloseAmount}
                                            onChange={(e) => {
                                                const raw = String(e.target.value || '');
                                                const cleaned = raw.replace(/[^\d.]/g, '');
                                                const parts = cleaned.split('.');
                                                const normalized = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;
                                                setSummaryForceCloseAmount(normalized);
                                            }}
                                            className="h-[40px] w-[185px] rounded-md border border-orange-300 bg-white px-3 text-[12px] text-black outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSummaryForceClose}
                                            className="h-[34px] rounded-md bg-[#E4572E] px-3 text-[12px] font-semibold text-white"
                                        >
                                            Enter
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div className='lg:flex gap-[16px] flex-wrap items-start'>
                                <div className='text-left w-[300px] min-w-[300px] max-w-[300px] shrink-0'>
                                    <h4 className="text-base font-semibold mb-[8px]">{EXPENSE_FORM_FIELDS.accountType}<span className="text-[#E4572E]">*</span></h4>
                                    {lockAccountTypeDisplay ? (
                                        <UtilityHubReadonlyField
                                            value={
                                                selectedAccountType ||
                                                (lockUtilityPrefillFields ? 'Utility Bills' : '')
                                            }
                                            className="w-[300px]"
                                        />
                                    ) : (
                                    <Select
                                        options={accountTypeOptions}
                                        value={accountTypeOptions.find((option) => option.value === selectedAccountType) || null}
                                        onChange={(selectedOption) => {
                                            const selectedValue = selectedOption ? selectedOption.value : '';
                                            setSelectedAccountType(selectedValue);
                                            setSelectedAccountTypeId(
                                                selectedOption ? getAccountTypeIdFromOption(selectedOption) : null
                                            );
                                        }}
                                        placeholder={EXPENSE_FORM_FIELDS.accountType}
                                        isSearchable={true}
                                        isClearable
                                        styles={customStyles}
                                        className="custom-select rounded-lg w-[300px] h-[40px] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                                    />
                                    )}

                                    {(selectedAccountType === 'Utility Bills' || lockUtilityPrefillFields) && (
                                       <div className='mt-[12px]'>
                                       <h4 className="text-base font-semibold mb-[8px]">
                                         {EXPENSE_FORM_FIELDS.utilityType}<span className="text-[#E4572E]">*</span>
                                       </h4>
                                     
                                       {lockUtilityPrefillFields ? (
                                         <UtilityHubReadonlyField value={utilityType} className="w-[616px]" />
                                       ) : (
                                       <Select
                                         options={[
                                           { value: 'Electricity', label: 'Electricity' },
                                           { value: 'Property', label: 'Property' },
                                           { value: 'Water', label: 'Water' },
                                           { value: 'Profession', label: 'Profession' },
                                           { value: 'Telecom', label: 'Telecom' },
                                           { value: 'Subscription', label: 'Subscription' },
                                         ]}
                                         value={
                                           utilityType
                                             ? { value: utilityType, label: utilityType }
                                             : null
                                         }
                                         onChange={(selectedOption) =>
                                           setUtilityType(selectedOption ? selectedOption.value : '')
                                         }
                                         placeholder={EXPENSE_FORM_FIELDS.utilityType}
                                         styles={customStyles}
                                         isSearchable={true}
                                         isClearable
                                         className="custom-select rounded-lg w-[616px] h-[40px] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                                       />
                                       )}
                                     </div>
                                    )}
                                </div>
                                <div className='text-left'>
                                    <label className="text-md font-semibold mb-[8px] block">{EXPENSE_FORM_FIELDS.date}<span className="text-[#E4572E]">*</span></label>
                                    <div className="expense-entry-form-date w-[300px]">
                                        <CustomDateField
                                            value={date}
                                            onChange={setDate}
                                            placeholder={EXPENSE_FORM_FIELDS.date}
                                            className="w-full text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                                            controlHeightPx={40}
                                            alwaysOpenBelow
                                            anchor="right"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='lg:flex gap-[16px]'>
                                <div className='text-left'>
                                    <label className="text-md font-semibold mb-[8px]  block">{EXPENSE_FORM_FIELDS.projectName}<span className="text-[#E4572E]">*</span></label>
                                    <Select
                                        options={sortedSiteOptions || []}
                                        placeholder={EXPENSE_FORM_FIELDS.projectName}
                                        isSearchable={true}
                                        value={selectedSite}
                                        onChange={setSelectedSite}
                                        styles={customStyles}
                                        isClearable
                                        className="custom-select rounded-lg w-[300px] h-[40px] no-scrollbar scrollbar-none text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                                    />
                                </div>
                                <div className='text-left'>
                                    <div className='flex justify-between  mb-[8px]'>
                                        <label className="text-md font-semibold block">{EXPENSE_FORM_FIELDS.vendorContractorName}<span className="text-[#E4572E]">*</span></label>
                                        {selectedType && <span className="text-[14px] text-[#E4572E] font-semibold block mt-0.5">{selectedType}</span>}
                                    </div>
                                    <Select
                                        options={combinedOptions}
                                        value={selectedOption}
                                        onChange={handleChange}
                                        placeholder={EXPENSE_FORM_FIELDS.vendorContractorName}
                                        styles={customStyles}
                                        isClearable
                                        className="custom-select rounded-lg w-[300px] h-[40px] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                                    />
                                </div>
                            </div>
                            <div className='lg:flex gap-[16px]'>
                                <div className='text-left'>
                                    <label className="text-md font-semibold mb-[8px] block">{EXPENSE_FORM_FIELDS.quantity}</label>
                                    <input
                                        type="text"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder={EXPENSE_FORM_FIELDS.quantity}
                                        className="border-2 border-[#BF9853] rounded-lg px-[8px] w-[300px] h-[40px] focus:outline-none border-opacity-[0.20] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                                    />
                                </div>
                                <div className='text-left'>
                                    <label className="text-md font-semibold mb-[8px] block">{EXPENSE_FORM_FIELDS.amount}<span className="text-[#E4572E]">*</span></label>
                                    <div className="relative w-[300px] h-[40px]">
                                        <span className="absolute top-1/2 left-[8px] transform -translate-y-1/2 text-gray-600 text-lg">₹</span>
                                        <input
                                            type="text"
                                            value={formatNumber(amount)}
                                            onChange={handleAmountChange}
                                            placeholder={EXPENSE_FORM_FIELDS.amount}
                                            onWheel={(e) => e.target.blur()}
                                            className="pl-[20px] pr-4 border-2 border-[#BF9853] rounded-lg w-full h-full focus:outline-none border-opacity-[0.20] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='lg:flex gap-[16px]'>
                                <div className={`text-left ${selectedAccountType === 'Claim Payment' ? '' : ''}`}>
                                    <label className="text-md font-semibold mb-[8px] block">{EXPENSE_FORM_FIELDS.category} <span className="text-[#E4572E]">*</span></label>
                                    <Select
                                        options={filteredCategoryOptions}
                                        value={selectedCategory}
                                        onChange={handleCategoryChange}
                                        styles={customStyles}
                                        isClearable
                                        placeholder={EXPENSE_FORM_FIELDS.category}
                                        className="custom-select rounded-lg w-[300px] h-[40px] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                                    />
                                </div>
                                {(selectedAccountType === 'Claim Payment' || selectedAccountType === 'Utility Bills' || selectedAccountType === 'Sundry Payment') ? (
                                    <div className='text-left'>
                                        <label className="text-md font-semibold mb-[8px] block">{EXPENSE_FORM_FIELDS.paymentMode}<span className="text-[#E4572E]">*</span></label>
                                        <Select
                                            options={selectablePaymentModeOptions.map((mode) => ({
                                                value: mode.modeOfPayment,
                                                label: mode.modeOfPayment,
                                                id: mode.id
                                            }))}
                                            value={paymentMode ? { value: paymentMode, label: paymentMode } : null}
                                            onChange={(selectedOption) => setPaymentMode(selectedOption ? selectedOption.value : '')}
                                            placeholder={EXPENSE_FORM_FIELDS.paymentMode}
                                            isSearchable={true}
                                            isClearable
                                            styles={customStyles}
                                            className="custom-select rounded-lg w-[300px] h-[40px] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                                        />
                                    </div>
                                ) : usesBillArrivalDate(selectedAccountType) ? (
                                    <div className='text-left'>
                                        <label className="text-md font-semibold mb-[8px] block">
                                            {EXPENSE_FORM_FIELDS.billArrivalDate}
                                        </label>
                                        <CustomDateField
                                            value={billArrivalDate}
                                            onChange={setBillArrivalDate}
                                            placeholder={EXPENSE_FORM_FIELDS.billArrivalDate}
                                            className="w-[300px] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                                            controlHeightPx={40}
                                            alwaysOpenBelow
                                            placeholderButtonClassName="!text-sm !font-normal !text-gray-500"
                                        />
                                    </div>
                                ) : showMachineTools ? (
                                    <div className='text-left'>
                                        <label className="text-md font-semibold mb-[8px] block">{EXPENSE_FORM_FIELDS.itemName}</label>
                                        <Select
                                            options={toolsItemNameOptions}
                                            value={selectedToolsItemName}
                                            onChange={setSelectedToolsItemName}
                                            styles={customStyles}
                                            isClearable
                                            placeholder={EXPENSE_FORM_FIELDS.itemName}
                                            className="custom-select rounded-lg w-[300px] h-[40px] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                                        />
                                    </div>
                                ) : null}
                            </div>
                            {selectedAccountType === 'Sundry Payment' && showMachineTools && (
                                <div className='lg:flex gap-[16px]'>
                                    <div className='text-left'>
                                        <label className="text-md font-semibold mb-[8px] block">{EXPENSE_FORM_FIELDS.machineName}<span className="text-[#E4572E]">*</span></label>
                                        <Select
                                            options={toolsItemNameOptions}
                                            value={selectedToolsItemName}
                                            onChange={setSelectedToolsItemName}
                                            styles={customStyles}
                                            isClearable
                                            isSearchable
                                            placeholder={EXPENSE_FORM_FIELDS.machineName}
                                            className="custom-select rounded-lg w-[300px] h-[40px] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                                        />
                                    </div>
                                    <div className='text-left'>
                                        <label className="text-md font-semibold mb-[8px] block">{EXPENSE_FORM_FIELDS.machineId}<span className="text-[#E4572E]">*</span></label>
                                        <Select
                                            options={filteredMachineToolOptions}
                                            value={selectedMachineTools}
                                            onChange={setSelectedMachine}
                                            styles={customStyles}
                                            isClearable
                                            isSearchable
                                            placeholder={
                                                !selectedToolsItemName
                                                    ? EXPENSE_FORM_FIELDS.machineId
                                                    : filteredMachineToolOptions.length === 0
                                                        ? 'No IDs for this machine'
                                                        : EXPENSE_FORM_FIELDS.machineId
                                            }
                                            className="custom-select rounded-lg w-[300px] h-[40px] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                                        />
                                    </div>
                                </div>
                            )}
                            {showMachineTools &&
                                !(selectedAccountType === 'Claim Payment' ||
                                    selectedAccountType === 'Utility Bills' ||
                                    selectedAccountType === 'Sundry Payment' ||
                                    selectedAccountType === 'Bill Payments') && (
                                    <div className='lg:flex gap-[16px]'>
                                        <div className='w-[300px] min-w-[300px] shrink-0' aria-hidden="true" />
                                        <div className='text-left'>
                                            <label className="text-md font-semibold mb-[8px] block">{EXPENSE_FORM_FIELDS.machineTool}</label>
                                            <Select
                                                options={filteredMachineToolOptions}
                                                value={selectedMachineTools}
                                                onChange={setSelectedMachine}
                                                styles={customStyles}
                                                isClearable
                                                placeholder={
                                                    !selectedToolsItemName
                                                        ? EXPENSE_FORM_FIELDS.machineTool
                                                        : filteredMachineToolOptions.length === 0
                                                            ? 'No tools for this item'
                                                            : EXPENSE_FORM_FIELDS.machineTool
                                                }
                                                className="custom-select rounded-lg w-[300px] h-[40px] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            {showMachineTools &&
                                (selectedAccountType === 'Claim Payment' ||
                                    selectedAccountType === 'Utility Bills' ||
                                    selectedAccountType === 'Bill Payments') && (
                                    <div className='lg:flex gap-[16px]'>
                                        <div className='text-left'>
                                            <label className="text-md font-semibold mb-[8px] block">{EXPENSE_FORM_FIELDS.itemName}</label>
                                            <Select
                                                options={toolsItemNameOptions}
                                                value={selectedToolsItemName}
                                                onChange={setSelectedToolsItemName}
                                                styles={customStyles}
                                                isClearable
                                                placeholder={EXPENSE_FORM_FIELDS.itemName}
                                                className="custom-select rounded-lg w-[300px] h-[40px] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                                            />
                                        </div>
                                        <div className='text-left'>
                                            <label className="text-md font-semibold mb-[8px] block">{EXPENSE_FORM_FIELDS.machineTool}</label>
                                            <Select
                                                options={filteredMachineToolOptions}
                                                value={selectedMachineTools}
                                                onChange={setSelectedMachine}
                                                styles={customStyles}
                                                isClearable
                                                placeholder={
                                                    !selectedToolsItemName
                                                        ? EXPENSE_FORM_FIELDS.machineTool
                                                        : filteredMachineToolOptions.length === 0
                                                            ? 'No tools for this item'
                                                            : EXPENSE_FORM_FIELDS.machineTool
                                                }
                                                className="custom-select rounded-lg w-[300px] h-[40px] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            {selectedAccountType === 'Utility Bills' && (
                                <>
                                    <div className='lg:flex gap-[16px]'>
                                        <div className='text-left'>
                                            <label className="text-md font-semibold mb-[8px] block">
                                                {getUtilityTypeNumberLabel(utilityType)}
                                            </label>
                                            <Select
                                                options={ebNumberOptions}
                                                value={selectedEbNumber}
                                                onChange={setSelectedEbNumber}
                                                styles={customStyles}
                                                isClearable
                                                placeholder={`${getUtilityTypeNumberLabel(utilityType)}`}
                                                className={`custom-select rounded-lg ${utilityType === 'Telecom' || utilityType === 'Subscription' ? 'w-[616px]' : 'w-[300px]'} h-[40px] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500`}
                                            />
                                        </div>
                                        {utilityType !== 'Telecom' && utilityType !== 'Subscription' && (
                                        <div className='text-left'>
                                            <label className="text-md font-semibold mb-[8px] block">{EXPENSE_FORM_FIELDS.forTheMonthOf}</label>
                                            <div className="expense-entry-form-date w-[300px]">
                                                <CustomMonthField
                                                    value={selectedMonths}
                                                    onChange={(v) => setSelectedMonths(v)}
                                                    placeholder={EXPENSE_FORM_FIELDS.forTheMonthOf}
                                                    className="w-full text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                                                    anchor="right"
                                                    alwaysOpenAbove
                                                />
                                            </div>
                                        </div>
                                        )}
                                    </div>
                                    {(utilityType === 'Telecom' || utilityType === 'Subscription') && (
                                        <div className="lg:flex gap-[16px] items-end">
                                            <div className="text-left w-[300px]">
                                                <label className="text-md font-semibold mb-[8px] block">{EXPENSE_FORM_FIELDS.validityDuration}<span className="text-[#E4572E]">*</span></label>
                                                <div className="flex gap-2 w-[300px]">
                                                    <input
                                                        type="text"
                                                        value={thirdInput}
                                                        onChange={(e) => setThirdInput(e.target.value)}
                                                        placeholder={EXPENSE_FORM_FIELDS.validityDuration}
                                                        className="min-w-0 flex-1 h-[40px] border-2 border-[#BF9853] rounded-lg px-3 text-sm focus:outline-none border-opacity-20 bg-white text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                                                    />
                                                    <Select
                                                        options={[
                                                            { value: 'Days', label: 'Days' },
                                                            { value: 'Month', label: 'Month' },
                                                            { value: 'Year', label: 'Year' },
                                                        ]}
                                                        value={validityType ? { value: validityType, label: validityType } : null}
                                                        onChange={(selectedOption) => setValidityType(selectedOption ? selectedOption.value : '')}
                                                        placeholder={EXPENSE_FORM_FIELDS.validityType}
                                                        isSearchable
                                                        isClearable
                                                        styles={customStyles}
                                                        className="custom-select rounded-lg w-[110px] h-[40px] text-[14px] font-semibold"
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <label className="text-md font-semibold mb-[8px] block">{EXPENSE_FORM_FIELDS.activationDate}<span className="text-[#E4572E]">*</span></label>
                                                <div className="expense-entry-form-date w-[300px]">
                                                    <CustomDateField
                                                        value={serviceStartingDate}
                                                        onChange={setServiceStartingDate}
                                                        placeholder={EXPENSE_FORM_FIELDS.activationDate}
                                                        className="w-full text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                                                        controlHeightPx={40}
                                                        alwaysOpenAbove
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                            {/* Comments + Attach + Submit kept in left column so there is no empty gap next to the advance table */}
                            <div ref={commentsSectionRef} className=" text-left">
                                <label className="text-md font-semibold mb-[8px] block">{EXPENSE_FORM_FIELDS.description}</label>
                                <textarea
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder={EXPENSE_FORM_FIELDS.description}
                                    className="border-2 border-[#BF9853] rounded-md px-[8px] lg:w-[616px] w-[300px] h-[60px] focus:outline-none border-opacity-[0.20] resize-none text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                                />
                            </div>
                            <div className="flex items-start justify-between lg:w-[616px] w-[300px] gap-2 flex-wrap">
                                <div className='flex shrink-0'>
                                    <label htmlFor="fileInput" className="cursor-pointer flex items-center gap-[6px] text-orange-600">
                                        <img className='w-[15px] h-[16px]' alt='' src={Attach}></img>
                                        <span className="text-[14px] font-semibold">Attach file</span> {(selectedAccountType === 'Utility Bills' || selectedAccountType === 'Bill Payments' || selectedAccountType === 'Bill Refund')}
                                    </label>
                                    <input
                                        type="file"
                                        id="fileInput"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,image/*,application/pdf"
                                    />
                                </div>
                                {selectedFile && <span className="text-gray-600 text-[12px] break-words min-w-0 text-right">{selectedFile.name}</span>}
                            </div>
                            <div className="mt-[12px] flex">
                                {(embedded || userPermissions.includes("Create")) && (
                                    <button
                                        type='submit'
                                        disabled={isSubmitting || checkingDuplicate}
                                        className={`bg-yellow-700 text-white px-6 py-2 rounded-md hover:bg-yellow-600 transition duration-200 ${isSubmitting || checkingDuplicate ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {checkingDuplicate ? 'Checking...' : isSubmitting ? 'Submitting...' : 'Submit'}
                                    </button>
                                )}
                            </div>
                        </div>
                        {/* Advance history table for selected project and vendor/contractor (same logic as Advance Portal) */}
                        {embedded || selectedAccountType === 'Utility Bills' ? null : (
                            <div
                                className={`min-w-0 w-full xl:col-start-2 xl:row-start-1 flex flex-col ${sideTableAreaHeight != null ? 'h-full' : ''}`}
                                style={sideTableAreaHeight != null ? { height: `${sideTableAreaHeight}px` } : undefined}
                            >
                                <div
                                    className={`expense-form-side-table-host min-h-0 overflow-hidden ${sideTableContentHeight != null ? 'flex-1 min-h-0' : ''}`}
                                    style={
                                        sideTableContentHeight != null
                                            ? { height: `${sideTableContentHeight}px` }
                                            : undefined
                                    }
                                >
                                    <SideTable
                                        advanceData={advanceData}
                                        selectedOption={selectedOption}
                                        selectedSite={selectedSite}
                                        siteOptions={siteOptions}
                                        hideDiscountAndActivity
                                        projectAdvance={projectAdvance}
                                        advanceHeaderRef={advanceHeaderRef}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            </div>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
                draggable
                theme="colored"
            />
            {showDuplicateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-[1600px] max-h-[90vh] shadow-lg flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-black">
                                    Possible Duplicate Entry - Matching expenses found
                                </h3>
                                <button
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 text-xl font-bold"
                                    onClick={handleDuplicateCancel}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                                Same date, vendor/contractor, project and amount detected. Total Entries: {duplicateMatchedExpenses.length} |
                                Total Amount: ₹{duplicateMatchedExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                            <div className="overflow-x-auto border-l-8 border-l-[#BF9853] rounded-lg">
                                <table className="table-fixed min-w-full border-collapse">
                                    <thead>
                                        <tr className="bg-[#FAF6ED]">
                                            <th className="px-3 py-3 text-left font-bold text-sm border-b">Time Stamp</th>
                                            <th className="px-3 py-3 text-left font-bold text-sm border-b">Date</th>
                                            <th className="px-3 py-3 text-left font-bold text-sm border-b">E.No</th>
                                            <th className="px-3 py-3 text-left font-bold text-sm border-b">Project Name</th>
                                            <th className="px-3 py-3 text-left font-bold text-sm border-b">Vendor</th>
                                            <th className="px-3 py-3 text-left font-bold text-sm border-b">Contractor</th>
                                            <th className="px-3 py-3 text-left font-bold text-sm border-b">A/C Type</th>
                                            <th className="px-3 py-3 text-left font-bold text-sm border-b">Amount</th>
                                            <th className="px-3 py-3 text-left font-bold text-sm border-b">Comments</th>
                                            <th className="px-3 py-3 text-left font-bold text-sm border-b">Attach File</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {duplicateMatchedExpenses.map((expense, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-[#FAF6ED]'}>
                                                <td className="px-3 py-2 text-left text-sm font-semibold border-b">{formatDate(expense.timestamp || expense.date)}</td>
                                                <td className="px-3 py-2 text-left text-sm font-semibold border-b">{formatDateOnly(expense.date)}</td>
                                                <td className="px-3 py-2 text-left text-sm font-semibold border-b">{expense.eno || '-'}</td>
                                                <td className="px-3 py-2 text-left text-sm font-semibold border-b">{expense.siteName || '-'}</td>
                                                <td className="px-3 py-2 text-left text-sm font-semibold border-b">{expense.vendor || '-'}</td>
                                                <td className="px-3 py-2 text-left text-sm font-semibold border-b">{expense.contractor || '-'}</td>
                                                <td className="px-3 py-2 text-left text-sm font-semibold border-b">{expense.accountType || '-'}</td>
                                                <td className="px-3 py-2 text-left text-sm font-semibold border-b">
                                                    ₹{Number(expense.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-3 py-2 text-left text-sm font-semibold border-b">{expense.comments || '-'}</td>
                                                <td className="px-3 py-2 text-left text-sm border-b">
                                                    {(expense.billCopy || expense.billCopyUrl) ? (
                                                        <a
                                                            href={expense.billCopy || expense.billCopyUrl}
                                                            className="text-red-500 underline font-semibold"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            View
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between">
                            <span className="text-sm text-gray-600">Do you want to proceed anyway?</span>
                            <div className="flex gap-3">
                                <button
                                    className="px-4 py-2 bg-[#BF9853] text-white rounded font-medium hover:bg-[#a67c3a] transition-colors duration-200"
                                    onClick={handleDuplicateIgnore}
                                >
                                    Ignore & Continue
                                </button>
                                <button
                                    className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded font-medium hover:bg-gray-50 transition-colors duration-200"
                                    onClick={handleDuplicateCancel}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showReviewModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white text-left rounded-xl p-6 w-[1400px] h-[680px] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Review Submission</h3>
                            <button onClick={handleReviewClose} className="text-2xl font-bold text-gray-400 hover:text-gray-700">
                                ×
                            </button>
                        </div>
                        <div className="flex flex-1 gap-6 overflow-hidden">
                            <div className="flex-[0.40] flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-base font-semibold text-gray-700">Expense Details</h4>
                                    <button
                                        type="button"
                                        onClick={() => setIsReviewEditMode((prev) => !prev)}
                                        className="px-4 py-2 border border-[#BF9853] text-[#BF9853] rounded-lg hover:bg-[#FFF8EE]"
                                    >
                                        {isReviewEditMode ? 'Cancel Edit' : 'Edit'}
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto pr-4">
                                    {isReviewEditMode ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold mb-1 block">{EXPENSE_FORM_FIELDS.accountType}</label>
                                                {lockAccountTypeDisplay ? (
                                                    <UtilityHubReadonlyField
                                                        value={
                                                            selectedAccountType ||
                                                            (lockUtilityPrefillFields ? 'Utility Bills' : '')
                                                        }
                                                    />
                                                ) : (
                                                <select
                                                    className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg px-3 border-opacity-20"
                                                    value={selectedAccountType}
                                                    onChange={(e) => {
                                                        const selectedValue = e.target.value;
                                                        setSelectedAccountType(selectedValue);
                                                        const selectedOption = accountTypeOptions.find(
                                                            (option) => option.value === selectedValue
                                                        );
                                                        setSelectedAccountTypeId(
                                                            selectedOption ? getAccountTypeIdFromOption(selectedOption) : null
                                                        );
                                                    }}
                                                >
                                                    <option value="" disabled hidden>{EXPENSE_FORM_FIELDS.accountType}</option>
                                                    {accountTypeOptions.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                )}
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold mb-1 block">{EXPENSE_FORM_FIELDS.date}</label>
                                                <CustomDateField
                                                    value={date}
                                                    onChange={setDate}
                                                    placeholder={EXPENSE_FORM_FIELDS.date}
                                                    className="w-full"
                                                    alwaysOpenBelow
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold mb-1 block">{EXPENSE_FORM_FIELDS.projectName}</label>
                                                <Select
                                                    options={sortedSiteOptions || []}
                                                    placeholder={EXPENSE_FORM_FIELDS.projectName}
                                                    isSearchable
                                                    value={selectedSite}
                                                    onChange={setSelectedSite}
                                                    styles={customStyles}
                                                    isClearable
                                                    className="custom-select rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold mb-1 block">{EXPENSE_FORM_FIELDS.vendorContractorName}</label>
                                                <Select
                                                    options={combinedOptions}
                                                    value={selectedOption}
                                                    onChange={handleChange}
                                                    placeholder={EXPENSE_FORM_FIELDS.vendorContractorName}
                                                    styles={customStyles}
                                                    isClearable
                                                    className="custom-select rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold mb-1 block">{EXPENSE_FORM_FIELDS.quantity}</label>
                                                <input
                                                    type="text"
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(e.target.value)}
                                                    placeholder={EXPENSE_FORM_FIELDS.quantity}
                                                    className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg px-3 border-opacity-20"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold mb-1 block">{EXPENSE_FORM_FIELDS.amount}</label>
                                                <div className="relative">
                                                    <span className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-600">₹</span>
                                                    <input
                                                        type="text"
                                                        value={formatNumber(amount)}
                                                        onChange={handleAmountChange}
                                                        placeholder={EXPENSE_FORM_FIELDS.amount}
                                                        className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg pl-7 pr-3 border-opacity-20"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold mb-1 block">{EXPENSE_FORM_FIELDS.category}</label>
                                                <Select
                                                    options={filteredCategoryOptions}
                                                    value={selectedCategory}
                                                    onChange={handleCategoryChange}
                                                    styles={customStyles}
                                                    isClearable
                                                    placeholder={EXPENSE_FORM_FIELDS.category}
                                                    className="custom-select rounded-lg"
                                                />
                                            </div>
                                            {(selectedAccountType === 'Claim Payment' || selectedAccountType === 'Utility Bills' || selectedAccountType === 'Sundry Payment') && (
                                                <div>
                                                    <label className="text-sm font-semibold mb-0.5 block">{EXPENSE_FORM_FIELDS.paymentMode}</label>
                                                    <select
                                                        value={paymentMode}
                                                        onChange={(e) => setPaymentMode(e.target.value)}
                                                        className="w-full h-[45px] border-2 border-[#BF9853] bg-white rounded-lg px-3 border-opacity-20"
                                                    >
                                                        <option value="">{EXPENSE_FORM_FIELDS.paymentMode}</option>
                                                        {selectablePaymentModeOptions.map(mode => (
                                                            <option key={mode.id || mode.modeOfPayment} value={mode.modeOfPayment}>
                                                                {mode.modeOfPayment}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                            {(selectedAccountType === 'Utility Bills' || lockUtilityPrefillFields) && (
                                                <>
                                                    <div>
                                                        <label className="text-sm font-semibold mb-1 block">{EXPENSE_FORM_FIELDS.utilityType}</label>
                                                        {lockUtilityPrefillFields ? (
                                                            <UtilityHubReadonlyField value={utilityType} />
                                                        ) : (
                                                        <select
                                                            value={utilityType}
                                                            onChange={(e) => setUtilityType(e.target.value)}
                                                            className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg px-3 border-opacity-20"
                                                        >
                                                            <option value="" disabled hidden>{EXPENSE_FORM_FIELDS.utilityType}</option>
                                                            <option value="Electricity">Electricity</option>
                                                            <option value="Property">Property</option>
                                                            <option value="Water">Water</option>
                                                            <option value="Profession">Profession</option>
                                                            <option value="Telecom">Telecom</option>
                                                            <option value="Subscription">Subscription</option>
                                                        </select>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-semibold mb-1 block">
                                                            {getUtilityTypeNumberLabel(utilityType)}
                                                        </label>
                                                        <Select
                                                            options={ebNumberOptions}
                                                            value={selectedEbNumber}
                                                            onChange={setSelectedEbNumber}
                                                            styles={customStyles}
                                                            isClearable
                                                            placeholder={getUtilityTypeNumberLabel(utilityType)}
                                                            className="custom-select rounded-lg"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-semibold mb-1 block">{EXPENSE_FORM_FIELDS.forTheMonthOf}</label>
                                                        <input
                                                            type="month"
                                                            value={selectedMonths}
                                                            onChange={(e) => setSelectedMonths(e.target.value)}
                                                            placeholder={EXPENSE_FORM_FIELDS.forTheMonthOf}
                                                            className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg px-3 border-opacity-20"
                                                        />
                                                    </div>
                                                    {(utilityType === 'Telecom' || utilityType === 'Subscription') && (
                                                        <div className="grid gap-3 grid-cols-3">
                                                            <div>
                                                                <label className="text-sm font-semibold mb-1 block">{EXPENSE_FORM_FIELDS.validityDuration}</label>
                                                                <input
                                                                    type="text"
                                                                    value={thirdInput}
                                                                    onChange={(e) => setThirdInput(e.target.value)}
                                                                    placeholder={EXPENSE_FORM_FIELDS.validityDuration}
                                                                    className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg px-3 border-opacity-20"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-semibold mb-1 block">{EXPENSE_FORM_FIELDS.validityType}</label>
                                                                <select
                                                                    value={validityType}
                                                                    onChange={(e) => setValidityType(e.target.value)}
                                                                    className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg px-3 border-opacity-20"
                                                                >
                                                                    <option value="">{EXPENSE_FORM_FIELDS.validityType}</option>
                                                                    <option value="Days">Days</option>
                                                                    <option value="Month">Month</option>
                                                                    <option value="Year">Year</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-semibold mb-1 block">{EXPENSE_FORM_FIELDS.activationDate}</label>
                                                                <CustomDateField
                                                                    value={serviceStartingDate}
                                                                    onChange={setServiceStartingDate}
                                                                    placeholder={EXPENSE_FORM_FIELDS.activationDate}
                                                                    className="w-full"
                                                                    alwaysOpenBelow
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            {usesBillArrivalDate(selectedAccountType) && (
                                                <div>
                                                    <label className="text-sm font-semibold mb-1 block">
                                                        {EXPENSE_FORM_FIELDS.billArrivalDate}
                                                    </label>
                                                    <CustomDateField
                                                        value={billArrivalDate}
                                                        onChange={setBillArrivalDate}
                                                        placeholder={EXPENSE_FORM_FIELDS.billArrivalDate}
                                                        className="w-full"
                                                        alwaysOpenBelow
                                                        placeholderButtonClassName="!text-sm !font-normal !text-gray-500"
                                                    />
                                                </div>
                                            )}
                                            <div className="col-span-2">
                                                <label className="text-sm font-semibold mb-1 block">{EXPENSE_FORM_FIELDS.description}</label>
                                                <input
                                                    type="text"
                                                    value={comments}
                                                    onChange={(e) => setComments(e.target.value)}
                                                    placeholder={EXPENSE_FORM_FIELDS.description}
                                                    className="w-full h-[45px] border-2 border-[#BF9853] rounded-lg px-3 border-opacity-20"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {reviewDetails.map((detail) => renderReviewRow(detail.label, detail.value))}
                                        </div>
                                    )}
                                </div>
                                {isReviewEditMode && (
                                    <div className="flex justify-end gap-3 mt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsReviewEditMode(false)}
                                            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg"
                                        >
                                            Discard
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleReviewSave}
                                            className="px-4 py-2 bg-[#BF9853] text-white rounded-lg"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="w-px bg-gray-200"></div>
                            <div className="flex-[0.65] flex flex-col">
                                <h4 className="text-base font-semibold text-gray-700 mb-3"> Preview</h4>
                                <div className="flex-1 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                                    {filePreviewUrl ? (
                                        isPdfPreview ? (
                                            <iframe
                                                src={`${filePreviewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                                title="Attachment preview"
                                                className="w-full h-full rounded-lg border-none "
                                            />
                                        ) : (
                                            <img src={filePreviewUrl} alt="Attachment preview" className="w-full h-full object-contain" />
                                        )
                                    ) : (
                                        <p className="text-sm text-gray-500">No file selected</p>
                                    )}
                                </div>
                                {selectedFile && (
                                    <p className="text-xs text-gray-500 mt-2 break-words">{selectedFile.name}</p>
                                )}
                                <button
                                    type="button"
                                    onClick={handleChangeAttachment}
                                    className="mt-4 px-4 py-2 border border-[#BF9853] text-[#BF9853] rounded-lg hover:bg-[#FFF8EE]"
                                >
                                    Change Attachfile
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={handleReviewClose}
                                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={handleReviewConfirm}
                                disabled={isSubmitting || isReviewEditMode}
                                className={`px-4 py-2 rounded-lg text-white ${isSubmitting || isReviewEditMode ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#BF9853]'}`}
                            >
                                {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showPaymentModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white text-left rounded-xl p-6 w-[800px] h-[600px] overflow-y-auto flex flex-col">
                        <h3 className="text-lg font-semibold mb-4 text-center">Payment Details</h3>
                        <div className="flex-1 overflow-hidden">
                            <div className="space-y-4 mb-4">
                                <div className="border-2 border-[#BF9853] border-opacity-25 w-full rounded-lg p-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{EXPENSE_FORM_FIELDS.date}</label>
                                            <CustomDateField
                                                value={paymentModalData.date}
                                                onChange={() => {}}
                                                placeholder={EXPENSE_FORM_FIELDS.date}
                                                className="w-full"
                                                alwaysOpenBelow
                                                disabled
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{EXPENSE_FORM_FIELDS.amount}</label>
                                            <input
                                                type="number"
                                                value={paymentModalData.amount}
                                                readOnly
                                                placeholder={EXPENSE_FORM_FIELDS.amount}
                                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full text-gray-600 bg-gray-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{EXPENSE_FORM_FIELDS.paymentMode}</label>
                                            <input
                                                type="text"
                                                value={paymentModalData.paymentMode}
                                                readOnly
                                                placeholder={EXPENSE_FORM_FIELDS.paymentMode}
                                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full text-gray-600 bg-gray-100"
                                            />
                                        </div>
                                    </div>
                                </div>
                                {(paymentModalData.paymentMode === "GPay" || paymentModalData.paymentMode === "PhonePe" || paymentModalData.paymentMode === "Gpay" ||
                                    paymentModalData.paymentMode === "Net Banking" || paymentModalData.paymentMode === "Cheque") && (
                                        <div className="border-2 border-[#BF9853] border-opacity-25 w-full rounded-lg p-4">
                                            <div className="space-y-4">
                                                {paymentModalData.paymentMode === "Cheque" && (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">{EXPENSE_FORM_FIELDS.chequeNo}<span className="text-red-500">*</span></label>
                                                            <input
                                                                type="text"
                                                                value={paymentModalData.chequeNo}
                                                                onChange={(e) => setPaymentModalData(prev => ({ ...prev, chequeNo: e.target.value }))}
                                                                placeholder={EXPENSE_FORM_FIELDS.chequeNo}
                                                                className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">{EXPENSE_FORM_FIELDS.chequeDate}<span className="text-red-500">*</span></label>
                                                            <CustomDateField
                                                                value={paymentModalData.chequeDate}
                                                                onChange={(v) => setPaymentModalData(prev => ({ ...prev, chequeDate: v }))}
                                                                placeholder={EXPENSE_FORM_FIELDS.chequeDate}
                                                                className="w-full"
                                                                alwaysOpenBelow
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">{EXPENSE_FORM_FIELDS.transactionNumber}</label>
                                                        <input
                                                            type="text"
                                                            value={paymentModalData.transactionNumber}
                                                            onChange={(e) => setPaymentModalData(prev => ({ ...prev, transactionNumber: e.target.value }))}
                                                            placeholder={EXPENSE_FORM_FIELDS.transactionNumber}
                                                            className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">{EXPENSE_FORM_FIELDS.accountNumber}<span className="text-red-500">*</span></label>
                                                        <select
                                                            value={paymentModalData.accountNumber}
                                                            onChange={(e) => setPaymentModalData(prev => ({ ...prev, accountNumber: e.target.value }))}
                                                            className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                                        >
                                                            <option value="">{EXPENSE_FORM_FIELDS.accountNumber}</option>
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
                        <div className="flex justify-end gap-3 mt-6 p-4 bg-white">
                            <button onClick={() => setShowPaymentModal(false)} className="px-4 py-2 border border-[#BF9853] text-[#BF9853] rounded-lg">
                                Cancel
                            </button>
                            <button onClick={handlePaymentSubmit} disabled={isSubmitting} className="px-4 py-2 bg-[#BF9853] text-white rounded-lg disabled:bg-gray-400">
                                {isSubmitting ? 'Saving...' : 'Submit'}
                            </button>
                        </div>
                        <button onClick={() => setShowPaymentModal(false)} className="absolute top-3 right-4 text-xl font-bold text-gray-500 hover:text-black">
                            ×
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Form;
const customStyles = {
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

    input: (provided) => ({
        ...provided,
        margin: 0,
        padding: 0,
    }),

    menuList: (provided) => ({
        ...provided,
        paddingTop: 0,
        paddingBottom: 0,
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
        ':active': {
            backgroundColor: state.isSelected ? '#BF9853' : '#FAF6ED',
        },
    }),
};
