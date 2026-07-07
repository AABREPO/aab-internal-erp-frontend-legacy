import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useOrbitPageSync } from '../../utils/useOrbitPageSync';
import { useTabRefreshSignal } from '../../utils/useTabRefreshSignal';
import axios from 'axios';
import Modal from 'react-modal';
import edit from '../Images/Edit.svg';
import history from '../Images/History.svg';
import remove from '../Images/Delete.svg';
import Select from 'react-select';
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
    postBankRegisterLogSave,
    bankRegisterLogSaveUrlMatchingRequest,
    isPaymentModeRequiringBankRegisterLog,
} from '../../utils/bankRegisterLogBeforeWeeklyBill';
import {
    loadRentPaymentModalData,
    syncWeeklyPaymentBillsForRentManagement,
} from '../../utils/rentManagementWeeklyPaymentBill';
import { notifyOrbitModuleDataChanged } from '../../utils/orbitProjectDataSync';
import {
    RENT_MANAGEMENT_MODULE_NAME,
} from '../../utils/paymentModeArrangement';
import { usePaymentModesForModule } from '../../utils/usePaymentModeArrangement';
import QRCode from '../Images/AAB_QR_CODE.jpeg';
import {
    EDBC_IDS,
    EDBC_TABLE_EDGE_TABLE_CLASS,
    EdbcColumnHeader,
    EdbcDateFilter,
    EdbcEmptyFilterCell,
    EdbcTableBodyRow,
    EdbcTableFilterRow,
    EdbcTableHeaderRow,
    EdbcSelectFilter,
    EdbcTimestampFilter,
    EdbcTotalAmountFilter,
    EdbcFilterToggleButton,
    EdbcTableToolbarRightActions,
    getEdbcColumnConfig,
    matchesEdbcAmountFilter,
    formatEdbcFilterDateDMY,
} from '../ExpensesEntry/databaseExpensesSharedColumns';
Modal.setAppElement('#root');
const rentDatabaseColumnIds = {
    timestamp: EDBC_IDS.EDBC1,
    shopNo: EDBC_IDS.EDBC13,
    tenantName: EDBC_IDS.EDBC3,
    amount: EDBC_IDS.EDBC8,
    paidOnDate: EDBC_IDS.EDBC2,
    eno: EDBC_IDS.EDBC17,
    forTheMonthOf: EDBC_IDS.EDBC14,
    paymentMode: EDBC_IDS.EDBC14,
    formType: EDBC_IDS.EDBC12,
    branch: EDBC_IDS.EDBC15,
    enteredBy: EDBC_IDS.EDBC16,
    activity: EDBC_IDS.EDBC19,
    print: EDBC_IDS.EDBC20,
};
const RENT_DATABASE_EDBC_WIDTH_LOCK_TABLE_CLASS =
    '[&_th#EDBC-1]:!w-[168px] [&_td#EDBC-1]:!w-[168px] [&_th#EDBC-1]:!min-w-[168px] [&_td#EDBC-1]:!min-w-[168px] [&_th#EDBC-1]:!max-w-[168px] [&_td#EDBC-1]:!max-w-[168px] [&_th#EDBC-13]:!w-[130px] [&_td#EDBC-13]:!w-[130px] [&_th#EDBC-13]:!min-w-[130px] [&_td#EDBC-13]:!min-w-[130px] [&_th#EDBC-13]:!max-w-[130px] [&_td#EDBC-13]:!max-w-[130px] [&_thead_tr>th#EDBC-13]:!overflow-hidden [&_thead_tr:nth-child(2)>th#EDBC-13>div]:!w-[130px] [&_thead_tr:nth-child(2)>th#EDBC-13>div]:!min-w-[130px] [&_thead_tr:nth-child(2)>th#EDBC-13>div]:!max-w-[130px] [&_th#EDBC-3]:!w-[298px] [&_td#EDBC-3]:!w-[298px] [&_th#EDBC-3]:!min-w-[298px] [&_td#EDBC-3]:!min-w-[298px] [&_th#EDBC-3]:!max-w-[298px] [&_td#EDBC-3]:!max-w-[298px] [&_th#EDBC-8]:!w-[120px] [&_td#EDBC-8]:!w-[98px] [&_th#EDBC-8]:!min-w-[120px] [&_td#EDBC-8]:!min-w-[98px] [&_th#EDBC-8]:!max-w-[120px] [&_td#EDBC-8]:!max-w-[98px] [&_th#EDBC-2]:!w-[120px] [&_td#EDBC-2]:!w-[120px] [&_th#EDBC-2]:!min-w-[120px] [&_td#EDBC-2]:!min-w-[120px] [&_th#EDBC-2]:!max-w-[120px] [&_td#EDBC-2]:!max-w-[120px] [&_thead_tr>th#EDBC-2]:!overflow-hidden [&_thead_tr>th#EDBC-2]:!box-border [&_thead_tr>th#EDBC-2]:!pr-[1px] [&_thead_tr:nth-child(2)>th:nth-child(5)]:!w-[120px] [&_thead_tr:nth-child(2)>th:nth-child(5)]:!min-w-[120px] [&_thead_tr:nth-child(2)>th:nth-child(5)]:!max-w-[120px] [&_thead_tr:nth-child(2)>th:nth-child(5)]:!overflow-hidden [&_thead_tr:nth-child(2)>th:nth-child(5)]:!pr-[1px] [&_thead_tr:nth-child(2)>th:nth-child(5)>div]:!w-[120px] [&_thead_tr:nth-child(2)>th:nth-child(5)>div]:!min-w-[120px] [&_thead_tr:nth-child(2)>th:nth-child(5)>div]:!max-w-[120px] [&_thead_tr:nth-child(2)>th:nth-child(5)>div]:!box-border [&_thead_tr:nth-child(2)>th:nth-child(5) button]:!w-[120px] [&_thead_tr:nth-child(2)>th:nth-child(5) button]:!min-w-[120px] [&_thead_tr:nth-child(2)>th:nth-child(5) button]:!max-w-[120px] [&_th#EDBC-17]:!w-[120px] [&_td#EDBC-17]:!w-[120px] [&_th#EDBC-17]:!min-w-[120px] [&_td#EDBC-17]:!min-w-[120px] [&_th#EDBC-17]:!max-w-[120px] [&_td#EDBC-17]:!max-w-[120px] [&_th#EDBC-14]:!w-[158px] [&_td#EDBC-14]:!w-[158px] [&_th#EDBC-14]:!min-w-[158px] [&_td#EDBC-14]:!min-w-[158px] [&_th#EDBC-14]:!max-w-[158px] [&_td#EDBC-14]:!max-w-[158px] [&_th#EDBC-12]:!w-[158px] [&_td#EDBC-12]:!w-[158px] [&_th#EDBC-12]:!min-w-[158px] [&_td#EDBC-12]:!min-w-[158px] [&_th#EDBC-12]:!max-w-[158px] [&_td#EDBC-12]:!max-w-[158px] [&_th#EDBC-16]:!w-[158px] [&_td#EDBC-16]:!w-[158px] [&_th#EDBC-16]:!min-w-[158px] [&_td#EDBC-16]:!min-w-[158px] [&_th#EDBC-16]:!max-w-[158px] [&_td#EDBC-16]:!max-w-[158px] [&_th#EDBC-15]:!w-[158px] [&_td#EDBC-15]:!w-[158px] [&_th#EDBC-15]:!min-w-[158px] [&_td#EDBC-15]:!min-w-[158px] [&_th#EDBC-15]:!max-w-[158px] [&_td#EDBC-15]:!max-w-[158px] [&_th#EDBC-19]:!w-[70px] [&_td#EDBC-19]:!w-[70px] [&_th#EDBC-19]:!min-w-[70px] [&_td#EDBC-19]:!min-w-[70px] [&_th#EDBC-19]:!max-w-[70px] [&_td#EDBC-19]:!max-w-[70px] [&_th#EDBC-20]:!w-[70px] [&_td#EDBC-20]:!w-[70px] [&_th#EDBC-20]:!min-w-[70px] [&_td#EDBC-20]:!min-w-[70px] [&_th#EDBC-20]:!max-w-[70px] [&_td#EDBC-20]:!max-w-[70px]';
const getRentDatabaseCellClass = (columnId, extraClassName = '') =>
    [getEdbcColumnConfig(columnId)?.tdClass || '', extraClassName].filter(Boolean).join(' ');

const RentDatabase = ({ username, userRoles = [], refreshSignal, isActive = true }) => {
    const [rentForms, setRentForms] = useState([]);
    const [dbShowFilters, setDbShowFilters] = useState(false);
    const [overallSearch, setOverallSearch] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState("");
    const [selectedDbDate, setSelectedDbDate] = useState('');
    const [shopNoOption, setShopNoOption] = useState([]);
    const [tenantNameOption, setTenantNameOption] = useState([]);
    const [paymentModeOption, setPaymentModeOption] = useState([]);
    const [formTypeOptions, setFormTypeOptions] = useState([]);
    const [monthOptions, setMonthOptions] = useState([]);
    const [enoOption, setEnoOption] = useState([]);
    const [dbShopNo, setDbShopNo] = useState('');
    const [filteredRentForm, setFilteredRentForm] = useState([]);
    const [dbTenantName, setDbTenantName] = useState('');
    const [dbPaymentMode, setDbPaymentMode] = useState('');
    const [dbFormType, setDbFormType] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [audits, setAudits] = useState([]);
    const [selectedDbMonth, setSelectedDbMonth] = useState('');
    const [selectedDbENo, setSelectedDbENo] = useState('');
    const [dbTimestampDate, setDbTimestampDate] = useState('');
    const [showDbTimestampDatePicker, setShowDbTimestampDatePicker] = useState(false);
    const [dbAmount, setDbAmount] = useState('');
    const [dbEnteredBy, setDbEnteredBy] = useState('');
    const [dbBranch, setDbBranch] = useState('');
    const [enteredByOption, setEnteredByOption] = useState([]);
    useEffect(() => {
        const savedSelectedDbDate = sessionStorage.getItem('selectedDbDate');
        const savedDbShopNo = sessionStorage.getItem('dbShopNo')
        const savedSelectedDbMonth = sessionStorage.getItem('selectedDbMonth');
        const savedDbTenantName = sessionStorage.getItem('dbTenantName');
        const savedDbFormType = sessionStorage.getItem('dbFormType');
        const savedDbPaymentMode = sessionStorage.getItem('dbPaymentMode');
        const savedDbEno = sessionStorage.getItem('selectedDbENo');
        const savedDbShowFilter = sessionStorage.getItem('dbShowFilters')
        try {
            if (savedSelectedDbDate) setSelectedDbDate(JSON.parse(savedSelectedDbDate));
            if (savedSelectedDbMonth) setSelectedDbMonth(JSON.parse(savedSelectedDbMonth));
            if (savedDbShopNo) setDbShopNo(JSON.parse(savedDbShopNo));
            if (savedDbTenantName) setDbTenantName(JSON.parse(savedDbTenantName));
            if (savedDbFormType) setDbFormType(JSON.parse(savedDbFormType));
            if (savedDbPaymentMode) setDbPaymentMode(JSON.parse(savedDbPaymentMode));
            if (savedDbEno) setSelectedDbENo(JSON.parse(savedDbEno));
            if (savedDbShowFilter !== null) setDbShowFilters(JSON.parse(savedDbShowFilter));
        } catch (error) {
            console.error("Error parsing sessionStorage data:", error);
        }
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);
    const handleBeforeUnload = () => {
        sessionStorage.removeItem('selectedDbDate');
        sessionStorage.removeItem('dbShopNo');
        sessionStorage.removeItem('selectedDbMonth');
        sessionStorage.removeItem('dbTenantName');
        sessionStorage.removeItem('dbFormType');
        sessionStorage.removeItem('selectedDbENo');
        sessionStorage.removeItem('dbPaymentMode');
        sessionStorage.removeItem('dbShowFilters');
    };
    useEffect(() => {
        if (selectedDbDate) sessionStorage.setItem('selectedDbDate', JSON.stringify(selectedDbDate));
        if (dbShopNo) sessionStorage.setItem('dbShopNo', JSON.stringify(dbShopNo));
        if (selectedDbMonth) sessionStorage.setItem('selectedMonth', JSON.stringify(selectedDbMonth));
        if (dbTenantName) sessionStorage.setItem('dbTenantName', JSON.stringify(dbTenantName));
        if (dbFormType) sessionStorage.setItem('dbFormType', JSON.stringify(dbFormType));
        if (selectedDbENo) sessionStorage.setItem('selectedDbENo', JSON.stringify(selectedDbENo));
        if (dbPaymentMode) sessionStorage.setItem('dbPaymentMode', JSON.stringify(dbPaymentMode));
        if (dbShowFilters) sessionStorage.setItem('dbShowFilters', JSON.stringify(dbShowFilters));
    }, [selectedDbDate, dbShopNo, selectedDbMonth, dbTenantName, dbFormType, selectedDbENo, dbPaymentMode, dbShowFilters]);
    const scrollRef = useRef(null);
    const filterRowRef = useRef(null);
    const filterNudgeUsedRef = useRef(false);
    const filterScrollResetSkipRef = useRef(true);
    const isDragging = useRef(false);
    const start = useRef({ x: 0, y: 0 });
    const scroll = useRef({ left: 0, top: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const animationFrame = useRef(null);
    const lastMove = useRef({ time: 0, x: 0, y: 0 });
    const [editId, setEditId] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [tenantOptions, setTenantOptions] = useState([]);
    const [shopNoOptions, setShopNoOptions] = useState([]);
    const [editTenantOptions, setEditTenantOptions] = useState([]);
    const [editShopNoOptions, setEditShopNoOptions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentModalData, setPaymentModalData] = useState({
        date: '',
        amount: '',
        paymentMode: '',
        chequeNo: '',
        chequeDate: '',
        transactionNumber: '',
        accountNumber: ""
    });
    const [accountDetails, setAccountDetails] = useState([]);
    const [rentFormData, setRentFormData] = useState({
        formType: '',
        shopNo: '',
        shopNoId: null,
        tenantName: '',
        tenantNameId: null,
        amount: '',
        refundAmount: '',
        paymentMode: '',
        paidOnDate: '',
        forTheMonthOf: '',
        attachedFile: '',
    });
    const [userPermissions, setUserPermissions] = useState([]);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const fileInputRef = useRef(null);
    const currentItems = filteredRentForm;
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };
    useEffect(() => {
        console.log('Sort field:', sortField);
        console.log('Sort order:', sortOrder);
        console.log('Current items:', currentItems);
    }, [sortField, sortOrder, currentItems]);
    const [allShops, setAllShops] = useState([]);
    const [projects, setProjects] = useState([]);
    const [tenantShopData, setTenantShopData] = useState([]);
    const [shopNoIdToShopNoMap, setShopNoIdToShopNoMap] = useState({});
    const [tenantNameIdToTenantNameMap, setTenantNameIdToTenantNameMap] = useState({});
    const [branchOptions, setBranchOptions] = useState([]);

    const getRentEnteredBy = (rent) =>
        String(rent?.enteredBy ?? rent?.entered_by ?? rent?.createdBy ?? rent?.created_by ?? '').trim();

    const getRentBranchDisplay = (rent) => {
        const branchId = rent?.branchId ?? rent?.branch_id;
        if (branchId != null && branchId !== '') {
            const match = branchOptions.find((b) => String(b.id) === String(branchId));
            const name = match?.branch ?? match?.branchName ?? '';
            if (name) return String(name).trim();
        }
        return String(rent?.branch ?? rent?.branch_name ?? rent?.branchName ?? '').trim();
    };

    const getBranchName = (branchId) => {
        const match = branchOptions.find((b) => String(b.id) === String(branchId));
        return String(match?.branch ?? match?.branchName ?? '').trim();
    };

    const sortedItems = sortField
        ? [...currentItems].sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];
            if (sortField === 'amount') {
                const numA = Number(a.refundAmount || a.amount) || 0;
                const numB = Number(b.refundAmount || b.amount) || 0;
                return sortOrder === 'asc' ? numA - numB : numB - numA;
            }
            if (sortField === 'branch') {
                const strA = getRentBranchDisplay(a).toLowerCase();
                const strB = getRentBranchDisplay(b).toLowerCase();
                return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
            }
            if (sortField === 'enteredBy') {
                const strA = getRentEnteredBy(a).toLowerCase();
                const strB = getRentEnteredBy(b).toLowerCase();
                return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
            }
            if (!isNaN(valA) && !isNaN(valB)) {
                return sortOrder === 'asc' ? valA - valB : valB - valA;
            }
            if (sortField === 'forTheMonthOf') {
                const dateA = new Date(valA + '-01');
                const dateB = new Date(valB + '-01');
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            }
            if (sortField === 'paidOnDate') {
                const dateA = new Date(valA);
                const dateB = new Date(valB);
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            }
            if (sortField === 'timestamp') {
                const dateA = new Date(valA);
                const dateB = new Date(valB);
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            }
            const strA = valA?.toString().toLowerCase() || '';
            const strB = valB?.toString().toLowerCase() || '';
            return sortOrder === 'asc'
                ? strA.localeCompare(strB)
                : strB.localeCompare(strA);
        })
        : currentItems;
    const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = sortedItems.slice(startIndex, endIndex);
    useEffect(() => {
        const nextTotalPages = Math.max(1, Math.ceil(sortedItems.length / itemsPerPage));
        setCurrentPage((page) => (page > nextTotalPages ? nextTotalPages : page));
    }, [sortedItems.length, itemsPerPage]);

    const dbBranchFilterOptions = useMemo(() => {
        const ids = [...new Set(rentForms.map((r) => r.branchId ?? r.branch_id).filter((v) => v != null && v !== ''))];
        return ids.map((id) => ({ value: String(id), label: getBranchName(id) || String(id) }));
    }, [rentForms, branchOptions]);

    const dbAmountTotal = useMemo(
        () => rentForms.reduce((sum, rent) => sum + (Number(rent.refundAmount || rent.amount) || 0), 0),
        [rentForms]
    );

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await fetch('https://backendaab.in/aabuildersDash/api/branch/getAll', {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
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
        fetchProjects();
    }, []);
    const fetchProjects = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuilderDash/api/projects/getAll');
            if (response.ok) {
                const data = await response.json();
                const ownProjects = Array.isArray(data)
                    ? data.filter(p => (p.projectCategory || '').toLowerCase() === 'own project')
                    : [];
                setProjects(ownProjects);
                const extractedShops = [];
                ownProjects
                    .filter(project => project.projectReferenceName) 
                    .forEach(project => {
                        const propertyDetailsArray = Array.isArray(project.propertyDetails)
                            ? project.propertyDetails
                            : Array.from(project.propertyDetails || []);
                        propertyDetailsArray.forEach(shop => {
                            if (shop.shopNo) {
                                extractedShops.push({
                                    shopNo: shop.shopNo,
                                    doorNo: shop.doorNo || '',
                                    propertyName: project.projectReferenceName || '',
                                    advance: null,
                                    tenantName: null,
                                    tenantId: null,
                                    shopId: shop.id,
                                    active: false
                                });
                            }
                        });
                    });
                setAllShops(extractedShops);
            } else {
                console.log('Error fetching projects.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const moduleName = "Rent Management";
    useEffect(() => {
        const fetchUserRoles = async () => {
            try {
                const response = await axios.get("https://backendaab.in/aabuilderDash/api/user_roles/all");
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
    const isShopLinkedToTenant = (shopNoId, tenantNameId) => {
        if (!shopNoId || !tenantNameId) return false;
        return tenantShopData.some(tenant => 
            tenant.id === tenantNameId && 
            tenant.shopNos && 
            tenant.shopNos.some(shop => shop.shopNoId === shopNoId && !shop.shopClosureDate)
        );
    };
    const handleEditClick = (rent) => {
        if (rent.formType === 'Shop Closure' || rent.formType === 'Refund') {
            alert('Cannot edit Shop Closure or Refund forms');
            return;
        }
        if (rent.shopNoId && rent.tenantNameId) {
            if (!isShopLinkedToTenant(rent.shopNoId, rent.tenantNameId)) {
                alert('Cannot edit: Shop is not linked to this tenant in tenant link data');
                return;
            }
        }
        setEditId(rent.id);
        const convertedRent = {
            ...rent,
            paidOnDate: convertDDMMYYYYToYYYYMMDD(rent.paidOnDate),
            shopNo: rent.shopNoId && shopNoIdToShopNoMap[rent.shopNoId] ? shopNoIdToShopNoMap[rent.shopNoId] : rent.shopNo,
            tenantName: rent.tenantNameId && tenantNameIdToTenantNameMap[rent.tenantNameId] ? tenantNameIdToTenantNameMap[rent.tenantNameId] : rent.tenantName
        };
        setRentFormData(convertedRent);
        setModalIsOpen(true);
    };
    const handleCancel = () => {
        setModalIsOpen(false);
    };
    const rentPaymentModes = usePaymentModesForModule(RENT_MANAGEMENT_MODULE_NAME);
    const paymentModeOptions = useMemo(
        () => rentPaymentModes.map((mode) => ({
            value: mode.modeOfPayment,
            label: mode.modeOfPayment,
        })),
        [rentPaymentModes]
    );
    useEffect(() => {
        const fetchAccountDetails = async () => {
            try {
                const response = await fetch('https://backendaab.in/aabuildersDash/api/account-details/getAll');
                if (response.ok) {
                    const data = await response.json();
                    setAccountDetails(data);
                }
            } catch (error) {
                console.error('Error fetching account details:', error);
            }
        };
        fetchAccountDetails();
    }, []);
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
    const handlePrint = (rent) => {
        const displayShopNo = rent.shopNoId && shopNoIdToShopNoMap[rent.shopNoId] ? shopNoIdToShopNoMap[rent.shopNoId] : rent.shopNo;
        const displayTenantName = rent.tenantNameId && tenantNameIdToTenantNameMap[rent.tenantNameId] ? tenantNameIdToTenantNameMap[rent.tenantNameId] : rent.tenantName;
        const matchingShop = allShops.find(shop => shop.shopNo === displayShopNo);
        const projectReferenceName = matchingShop?.propertyName || 'N/A';
        const qrCodeImage = QRCode;
        const receiptHtml = `
    <html>
    <head>
        <title>Receipt</title>
        <style>
            @media print {
                @page { 
                    size: A4; 
                    margin: 10mm;
                }
                body { 
                    margin: 0;
                    padding: 10px;
                }
                .no-break {
                    page-break-inside: avoid;
                    break-inside: avoid;
                }
            }
            body { 
                font-family: Arial, sans-serif; 
                padding: 15px; 
                margin: 0;
                font-size: 12px;
            }
            h2 { 
                text-align: center; 
                margin: 10px 0;
                font-size: 18px;
            }
            h3 {
                margin: 10px 0 5px 0;
                font-size: 14px;
            }
            table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 10px;
                font-size: 11px;
            }
            td, th { 
                padding: 5px; 
                border: 1px solid #ccc; 
            }
            .label { 
                font-weight: bold; 
                width: 40%; 
            }
            .signature { 
                margin-top: 15px;
                font-size: 11px;
            }
            .bank-details-table { 
                margin-top: 15px;
            }
            .qr { 
                text-align: center; 
                margin-top: 20px;
            }
            .qr img {
                width: 200px;
                height: 200px;
            }
        </style>
    </head>
    <body>
        <h2>Rent Payment Receipt</h2>
        <table class="no-break">
            <tr><td class="label">Shop No</td><td>${displayShopNo}</td></tr>
            <tr><td class="label">Tenant Name</td><td>${displayTenantName}</td></tr>
            <tr><td class="label">Project Reference Name</td><td>${projectReferenceName}</td></tr>
            <tr><td class="label">Amount Paid</td><td>₹${Number(rent.refundAmount || rent.amount).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}</td></tr>
            <tr><td class="label">Paid On</td><td>${formatDateOnly(rent.paidOnDate)}</td></tr>
            <tr><td class="label">Receipt No</td><td>${rent.eno}</td></tr>
            <tr><td class="label">For the Month Of</td><td>${rent.forTheMonthOf
                ? new Date(`${rent.forTheMonthOf}-01`).toLocaleString('default', {
                    month: 'long',
                    year: 'numeric',
                })
                : ''}</td></tr>
            <tr><td class="label">Payment Mode</td><td>${rent.paymentMode}</td></tr>
            <tr><td class="label">Type</td><td>${rent.formType}</td></tr>
        </table>

        <div class="no-break">
            <div class="signature">
                <p>Signature: __________________________</p>
            </div>

            <div class="bank-details-table">
                <h3>Bank Details</h3>
                <table>
                    <tr><td class="label">Bank</td><td>KVB</td></tr>
                    <tr><td class="label">Name</td><td>AA Builders</td></tr>
                    <tr><td class="label">Account Number</td><td>1804155000040012</td></tr>
                    <tr><td class="label">IFSC Code</td><td>KVBL0001804</td></tr>
                    <tr><td class="label">Branch</td><td>Srivilliputtur</td></tr>
                    <tr><td class="label">UPI ID</td><td>office.aabuilders@okhdfcbank</td></tr>
                    <tr><td class="label">GPay Number</td><td>93634 11241</td></tr>
                </table>
            </div>

            <div class="qr">
                <p><strong>Scan to Pay</strong></p>
                <img src="${qrCodeImage}" alt="QR Code" />
            </div>
        </div>

        <script>
            window.onload = function () {
                window.print();
            };
        </script>
    </body>
    </html>
    `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(receiptHtml);
        printWindow.document.close();
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
    const applyRentFormsResponse = useCallback((responseData) => {
        const sortedExpenses = responseData.sort((a, b) => {
            const enoA = parseInt(a.id, 10);
            const enoB = parseInt(b.id, 10);
            return enoB - enoA;
        });
        setRentForms(sortedExpenses);
        setFilteredRentForm(sortedExpenses);
        const uniqueEnos = [...new Set(responseData.map(rent => rent.eno))];
        const uniqueShopNo = [...new Set(responseData.map(rent => rent.shopNo))];
        const uniqueTenantName = [...new Set(responseData.map(rent => rent.tenantName))];
        const uniquePaymentMode = [...new Set(responseData.map(rent => rent.paymentMode))];
        const uniqueFormType = [...new Set(responseData.map(rent => rent.formType))];
        const uniqueForTheMonthOf = [...new Set(responseData.map(rent => rent.forTheMonthOf))];
        setEnoOption(uniqueEnos);
        setShopNoOption(uniqueShopNo);
        setTenantNameOption(uniqueTenantName);
        setPaymentModeOption(uniquePaymentMode);
        setFormTypeOptions(uniqueFormType);
        uniqueForTheMonthOf.sort();
        const formattedMonths = uniqueForTheMonthOf.map(monthStr => {
            const [year, month] = monthStr.split('-');
            const date = new Date(year, parseInt(month) - 1);
            return date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
        });
        setMonthOptions(formattedMonths);
    }, []);

    const loadRentForms = useCallback(() => {
        axios
            .get('https://backendaab.in/aabuildersDash/api/rental_forms/getAll')
            .then((response) => applyRentFormsResponse(response.data))
            .catch((error) => {
                console.error('Error fetching expenses:', error);
            });
    }, [applyRentFormsResponse]);

    useEffect(() => {
        loadRentForms();
    }, [loadRentForms]);

    useOrbitPageSync('rent', loadRentForms, [loadRentForms]);

    useTabRefreshSignal(refreshSignal, isActive, loadRentForms);

    useEffect(() => {
        const filtered = rentForms.filter(rent => {
            if (dbTimestampDate) {
                const selectedDate = new Date(dbTimestampDate);
                const entryTimestamp = new Date(rent.timestamp);
                if (selectedDate.toDateString() !== entryTimestamp.toDateString()) {
                    return false;
                }
            }
            const matchesShopNo = dbShopNo ? rent.shopNo === dbShopNo : true;
            const matchesTenantName = dbTenantName ? rent.tenantName === dbTenantName : true;
            const matchesPaymentMode = dbPaymentMode ? rent.paymentMode === dbPaymentMode : true;
            const matchesFormType = dbFormType ? rent.formType === dbFormType : true;
            const formattedSelectedDate = selectedDbDate ? convertYYYYMMDDToDDMMYYYY(selectedDbDate) : '';
            const matchesDate = selectedDbDate ? rent.paidOnDate === formattedSelectedDate : true;
            const matchesENo = selectedDbENo ? rent.eno === selectedDbENo : true;
            const matchesMonth = selectedDbMonth
                ? rent.forTheMonthOf &&
                new Date(`${rent.forTheMonthOf}-01`).toLocaleString('default', {
                    month: 'long',
                    year: 'numeric',
                }) === selectedDbMonth
                : true;
            if (dbAmount.trim() && !matchesEdbcAmountFilter(rent.refundAmount || rent.amount, dbAmount)) return false;
            if (dbEnteredBy && getRentEnteredBy(rent).toLowerCase() !== dbEnteredBy.toLowerCase()) return false;
            if (dbBranch) {
                const branchId = rent?.branchId ?? rent?.branch_id;
                if (String(branchId) !== String(dbBranch)) return false;
            }
            if (overallSearch.trim()) {
                const q = overallSearch.toLowerCase().trim();
                const shopDisplay = rent.shopNoId && shopNoIdToShopNoMap[rent.shopNoId] ? shopNoIdToShopNoMap[rent.shopNoId] : rent.shopNo;
                const tenantDisplay = rent.tenantNameId && tenantNameIdToTenantNameMap[rent.tenantNameId] ? tenantNameIdToTenantNameMap[rent.tenantNameId] : rent.tenantName;
                const monthDisplay = rent.forTheMonthOf
                    ? new Date(`${rent.forTheMonthOf}-01`).toLocaleString('default', {
                        month: 'long',
                        year: 'numeric',
                    })
                    : '';
                const searchable = [
                    formatDate(rent.timestamp),
                    shopDisplay,
                    tenantDisplay,
                    rent.refundAmount || rent.amount,
                    rent.paidOnDate,
                    rent.eno,
                    monthDisplay,
                    rent.paymentMode,
                    rent.formType,
                    getRentEnteredBy(rent),
                    getRentBranchDisplay(rent),
                ]
                    .map((v) => String(v ?? '').toLowerCase())
                    .join(' ');
                if (!searchable.includes(q)) return false;
            }
            return (
                matchesShopNo &&
                matchesTenantName &&
                matchesPaymentMode &&
                matchesFormType &&
                matchesMonth &&
                matchesDate &&
                matchesENo
            );
        });
        setFilteredRentForm(filtered);
        const getUnique = (key) => [...new Set(filtered.map(item => item[key]).filter(Boolean))];
        setShopNoOption(getUnique('shopNo'));
        setTenantNameOption(getUnique('tenantName'));
        setPaymentModeOption(getUnique('paymentMode'));
        setFormTypeOptions(getUnique('formType'));
        setEnoOption(getUnique('eno'));
        setEnteredByOption([...new Set(filtered.map((rent) => getRentEnteredBy(rent)).filter(Boolean))]);
        const uniqueMonths = getUnique('forTheMonthOf').sort();
        const formattedMonths = uniqueMonths.map(monthStr => {
            const [year, month] = monthStr.split('-');
            const date = new Date(year, parseInt(month) - 1);
            return date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
        });
        setMonthOptions(formattedMonths);
    }, [dbShopNo, dbTenantName, dbPaymentMode, dbFormType, selectedDbMonth, selectedDbDate, rentForms, selectedDbENo, overallSearch, shopNoIdToShopNoMap, tenantNameIdToTenantNameMap, branchOptions, dbTimestampDate, dbAmount, dbEnteredBy, dbBranch]);

    useEffect(() => {
        if (filterScrollResetSkipRef.current) {
            filterScrollResetSkipRef.current = false;
            return;
        }
        if (!dbShowFilters) return;
        const scroller = scrollRef.current;
        if (!scroller) return;
        filterNudgeUsedRef.current = false;
        requestAnimationFrame(() => {
            scroller.scrollTop = 0;
        });
    }, [selectedDbDate, dbShopNo, selectedDbMonth, dbTenantName, dbFormType, selectedDbENo, dbPaymentMode, dbTimestampDate, dbAmount, dbEnteredBy, dbBranch]);

    const convertDDMMYYYYToYYYYMMDD = (dateString) => {
        if (!dateString) return '';
        if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
            return dateString;
        }
        if (dateString.includes('-')) {
            const parts = dateString.split('-');
            if (parts.length === 3 && parts[0].length === 2) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        return dateString;
    };
    const convertYYYYMMDDToDDMMYYYY = (dateString) => {
        if (!dateString) return '';
        if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
            return dateString;
        }
        if (dateString.includes('-')) {
            const parts = dateString.split('-');
            if (parts.length === 3 && parts[0].length === 4) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        }
        return dateString;
    };
    const formatDateOnly = (dateString) => {
        if (!dateString) return '';
        if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
            return dateString.replace(/-/g, '/');
        }
        if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
            const parts = dateString.split('-');
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }
        return dateString;
    };
    useEffect(() => {
        fetchTenants();
    }, [projects]);
    const fetchTenants = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/tenant_link_shop/getAll');
            if (response.ok) {
                const data = await response.json();
                setTenantShopData(data);
                const shopNoIdToShopNoMap = {};
                projects
                    .filter(project => project.projectReferenceName)
                    .forEach(project => {
                        const propertyDetailsArray = Array.isArray(project.propertyDetails)
                            ? project.propertyDetails
                            : Array.from(project.propertyDetails || []);
                        propertyDetailsArray.forEach(detail => {
                            if (detail.shopNo && detail.id) {
                                shopNoIdToShopNoMap[detail.id] = detail.shopNo;
                            }
                        });
                    });
                const options = data.flatMap(t =>
                    (t.shopNos || [])
                        .filter(shop => !shop.shopClosureDate) 
                        .map(shop => {
                            const shopNo = shop.shopNoId ? shopNoIdToShopNoMap[shop.shopNoId] : null;
                            return {
                                label: t.tenantName,
                                value: t.tenantName,
                                tenantId: t.id,
                                shopNo: shopNo,
                                shopNoId: shop.shopNoId || null
                            };
                        })
                        .filter(opt => opt.shopNo)
                );
                const tenantOptionsUnique = options.filter(
                    (t, i, arr) => t.label && arr.findIndex(x => x.value === t.value) === i
                );
                setTenantOptions(tenantOptionsUnique);
                const shopMap = new Map();
                options.forEach(o => {
                    if (o.shopNo && !shopMap.has(o.shopNo)) {
                        shopMap.set(o.shopNo, o.shopNoId);
                    }
                });
                const shopOptions = Array.from(shopMap.entries()).map(([shopNo, shopNoId]) => ({
                    label: shopNo,
                    value: shopNo,
                    shopNoId: shopNoId
                }));
                setShopNoOptions(shopOptions);
                const editShopOptions = Array.from(shopMap.entries()).map(([shopNo, shopNoId]) => ({
                    label: shopNo,
                    value: shopNoId, 
                    shopNo: shopNo
                }));
                setEditShopNoOptions(editShopOptions);
                const editTenantOptions = data.flatMap(t =>
                    (t.shopNos || [])
                        .filter(shop => !shop.shopClosureDate)
                        .map(shop => {
                            const shopNo = shop.shopNoId ? shopNoIdToShopNoMap[shop.shopNoId] : null;
                            return {
                                label: t.tenantName,
                                value: t.id, 
                                tenantName: t.tenantName,
                                shopNoId: shop.shopNoId || null,
                                shopNo: shopNo
                            };
                        })
                        .filter(opt => opt.shopNo)
                );
                const uniqueEditTenantOptions = editTenantOptions.filter(
                    (t, i, arr) => arr.findIndex(x => x.value === t.value) === i
                );
                setEditTenantOptions(uniqueEditTenantOptions);
            } else {
                console.log('Error fetching tenant link data.');
            }
        } catch (error) {
            console.error('Error:', error);
            console.log('Error fetching tenant link data.');
        }
    };
    useEffect(() => {
        const shopNoIdMap = {};
        projects
            .filter(project => project.projectReferenceName) 
            .forEach(project => {
                const propertyDetailsArray = Array.isArray(project.propertyDetails)
                    ? project.propertyDetails
                    : Array.from(project.propertyDetails || []);
                propertyDetailsArray.forEach(detail => {
                    if (detail.id && detail.shopNo) {
                        shopNoIdMap[detail.id] = detail.shopNo;
                    }
                });
            });
        setShopNoIdToShopNoMap(shopNoIdMap);
        const tenantNameIdMap = {};
        tenantShopData.forEach(tenant => {
            if (tenant.id && tenant.tenantName) {
                tenantNameIdMap[tenant.id] = tenant.tenantName;
            }
        });
        setTenantNameIdToTenantNameMap(tenantNameIdMap);
    }, [projects, tenantShopData]);
    const handleChange = (e) => {
        const { name, type, value, files } = e.target;
        if (name === "paidOnDate" && value === "") {
            return; 
        }
        setRentFormData({
            ...rentFormData,
            [name]: type === "file" ? files[0] : value
        });
    };
    const fetchAuditDetails = async (rentFormId) => {
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/rental_forms/audit/${rentFormId}`);
            const data = await response.json();
            setAudits(data);
            console.log(data);
            setShowModal(true);
        } catch (error) {
            console.error("Error fetching audit details:", error);
        }
    };
    const requiresRentPaymentModal = (mode) =>
        ["GPay", "PhonePe", "Net Banking", "Cheque", "Gpay"].includes(mode);

    const openRentPaymentModal = async (overrides = {}) => {
        const defaults = {
            date: rentFormData.paidOnDate || new Date().toISOString().split('T')[0],
            amount: rentFormData.amount || "",
            paymentMode: overrides.paymentMode || rentFormData.paymentMode,
        };
        const modalData = await loadRentPaymentModalData(editId, defaults);
        setPaymentModalData(modalData);
        setShowPaymentModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Check if payment mode requires bank details
        if (requiresRentPaymentModal(rentFormData.paymentMode)) {
            // Show payment modal if not already shown
            if (!showPaymentModal) {
                await openRentPaymentModal();
            }
            return;
        }
        if (rentFormData.shopNoId && rentFormData.tenantNameId) {
            if (!isShopLinkedToTenant(rentFormData.shopNoId, rentFormData.tenantNameId)) {
                alert('Cannot save: Selected shop is not linked to selected tenant in tenant link data');
                return;
            }
        }
        const {
            formType, shopNoId, tenantNameId, amount,
            refundAmount, paymentMode, paidOnDate,
            forTheMonthOf, attachedFile
        } = rentFormData;
        const formattedPaidOnDate = convertYYYYMMDDToDDMMYYYY(paidOnDate);
        const shopNo = shopNoId && shopNoIdToShopNoMap[shopNoId] ? shopNoIdToShopNoMap[shopNoId] : '';
        const tenantName = tenantNameId && tenantNameIdToTenantNameMap[tenantNameId] ? tenantNameIdToTenantNameMap[tenantNameId] : '';
        const payload = {
            formType,
            shopNo: shopNo,
            shopNoId: shopNoId,
            tenantName: tenantName, 
            tenantNameId: tenantNameId,
            amount,
            refundAmount,
            paymentMode,
            paidOnDate: formattedPaidOnDate,
            forTheMonthOf,
            attachedFile,
            editedBy: username,
        };
        setIsSubmitting(true);
        try {
            const response = await fetch(`https://backendaab.in/aabuildersDash/api/rental_forms/update/${editId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            if (response.ok) {
                alert('Rent form updated successfully!');
                handleCancel();
            } else {
                const errorMsg = await response.text();
                alert(`Failed to update: ${errorMsg}`);
            }
        } catch (error) {
            console.error('Error updating rent form:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
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

        setIsSubmitting(true);
        try {
            // Validate that shopNoId is linked to tenantNameId
            if (rentFormData.shopNoId && rentFormData.tenantNameId) {
                if (!isShopLinkedToTenant(rentFormData.shopNoId, rentFormData.tenantNameId)) {
                    alert('Cannot save: Selected shop is not linked to selected tenant in tenant link data');
                    setIsSubmitting(false);
                    return;
                }
            }
            const {
                formType, shopNoId, tenantNameId, amount,
                refundAmount, paidOnDate, forTheMonthOf, attachedFile
            } = rentFormData;

            // Use date in YYYY-MM-DD format (paymentModalData.date is already in this format from date input)
            // If not available, use paidOnDate which should also be in YYYY-MM-DD format from date input
            const dateForWeeklyBills = paymentModalData.date || paidOnDate;
            
            // Convert date from YYYY-MM-DD to DD-MM-YYYY format for rental form update
            const formattedPaidOnDate = paymentModalData.date ? convertYYYYMMDDToDDMMYYYY(paymentModalData.date) : convertYYYYMMDDToDDMMYYYY(paidOnDate);

            // Get shopNo and tenantName from IDs
            const shopNo = shopNoId && shopNoIdToShopNoMap[shopNoId] ? shopNoIdToShopNoMap[shopNoId] : '';
            const tenantName = tenantNameId && tenantNameIdToTenantNameMap[tenantNameId] ? tenantNameIdToTenantNameMap[tenantNameId] : '';

            // Find the project ID and projectReferenceName from shopNoId
            let projectId = null;
            let projectReferenceName = null;
            projects.forEach(project => {
                if (project.propertyDetails) {
                    const propertyDetailsArray = Array.isArray(project.propertyDetails)
                        ? project.propertyDetails
                        : Array.from(project.propertyDetails || []);
                    const property = propertyDetailsArray.find(p => p.id === shopNoId);
                    if (property) {
                        projectId = project.id;
                        projectReferenceName = project.projectReferenceName || null;
                    }
                }
            });

            const payload = {
                formType,
                shopNo: shopNo,
                shopNoId: shopNoId,
                tenantName: tenantName,
                tenantNameId: tenantNameId,
                amount: paymentModalData.amount || amount,
                refundAmount,
                paymentMode: paymentModalData.paymentMode,
                paidOnDate: formattedPaidOnDate,
                forTheMonthOf,
                attachedFile,
                editedBy: username,
            };

            const rentalUpdateUrl = `https://backendaab.in/aabuildersDash/api/rental_forms/update/${editId}`;
            if (isPaymentModeRequiringBankRegisterLog(paymentModalData.paymentMode)) {
                await postBankRegisterLogSave(
                    bankRegisterLogSaveUrlMatchingRequest(rentalUpdateUrl),
                    "Rent Management",
                    {
                        bill_payment_mode: paymentModalData.paymentMode,
                        amount: parseFloat(paymentModalData.amount || amount),
                        entered_by: username,
                    }
                );
            }

            // Update rental form first
            const updateResponse = await fetch(rentalUpdateUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!updateResponse.ok) {
                const errorMsg = await updateResponse.text();
                throw new Error(`Failed to update rental form: ${errorMsg}`);
            }

            // Get the updated rental form ID
            let rentalFormId = editId;

            // Sync weekly-payment-bills (update existing by rent_management_id or create new)
            await syncWeeklyPaymentBillsForRentManagement(
                rentalFormId,
                {
                    date: dateForWeeklyBills,
                    amount: parseFloat(paymentModalData.amount || amount),
                    payment_mode: paymentModalData.paymentMode,
                    project_id: projectId,
                    tenant_id: tenantNameId,
                    tenant_complex_name: projectReferenceName,
                },
                {
                    editedBy: username,
                    modalPaymentData: paymentModalData,
                }
            );

            alert('Rent form updated successfully and added to Weekly Payment Bills!');
            setShowPaymentModal(false);
            handleCancel();
            loadRentForms();
            notifyOrbitModuleDataChanged('rent');
        } catch (error) {
            console.error('Error submitting payment:', error);
            alert(`Failed to save: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    const resetFilters = () => {
        setSelectedDbDate('');
        setDbShopNo('');
        setDbTenantName('');
        setDbPaymentMode('');
        setDbFormType('');
        setSelectedDbMonth('');
        setSelectedDbENo('');
        setDbTimestampDate('');
        setDbAmount('');
        setDbEnteredBy('');
        setDbBranch('');
        setOverallSearch('');
        setDbShowFilters(false);
        setSortField('');
        setSortOrder('asc');
        sessionStorage.removeItem('selectedDbDate');
        sessionStorage.removeItem('dbShopNo');
        sessionStorage.removeItem('selectedDbMonth');
        sessionStorage.removeItem('dbTenantName');
        sessionStorage.removeItem('dbFormType');
        sessionStorage.removeItem('selectedDbENo');
        sessionStorage.removeItem('dbPaymentMode');
        sessionStorage.removeItem('dbShowFilters');
    };
    const handleUpload = async () => {
        if (!selectedFile) {
            setMessage("Please select a file before uploading.");
            return;
        }
        const formData = new FormData();
        formData.append("file", selectedFile);
        try {
            const response = await axios.post("https://backendaab.in/aabuildersDash/api/rental_forms/upload_old_data", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setMessage(response.data);
        } catch (error) {
            setMessage("Upload failed: " + (error.response?.data || error.message));
        }
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };
    const handleExportExcel = () => {
        const headers = [
            "Timestamp",
            "Shop No",
            "Tenant Name",
            "Amount",
            "Paid On",
            "E No",
            "For the Month Of",
            "Payment Mode",
            "Type",
            "Entered By",
            "Branch"
        ];
        const rows = currentItems.map(rent => [
            formatDate(rent.timestamp),
            rent.shopNoId && shopNoIdToShopNoMap[rent.shopNoId] ? shopNoIdToShopNoMap[rent.shopNoId] : rent.shopNo,
            rent.tenantNameId && tenantNameIdToTenantNameMap[rent.tenantNameId] ? tenantNameIdToTenantNameMap[rent.tenantNameId] : rent.tenantName,
            `${Number(rent.refundAmount || rent.amount).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`,
            formatDateOnly(rent.paidOnDate),
            rent.eno,
            rent.forTheMonthOf
                ? new Date(`${rent.forTheMonthOf}-01`).toLocaleString('default', {
                    month: 'long',
                    year: 'numeric',
                })
                : '',
            rent.paymentMode,
            rent.formType,
            getRentEnteredBy(rent),
            getRentBranchDisplay(rent)
        ]);
        const csvContent = [headers, ...rows]
            .map(row => row.map(value => `"${value}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "Rent Report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(12);
        doc.text('Rent Collection Report', 14, 15);
        const tableColumn = [
            "Timestamp", "Shop No", "Tenant Name", "Amount", "Paid On",
            "E No", "For the Month Of", "Payment Mode", "Type", "Entered By", "Branch"
        ];
        const tableRows = filteredRentForm.map((rent) => [
            formatDate(rent.timestamp),
            rent.shopNoId && shopNoIdToShopNoMap[rent.shopNoId] ? shopNoIdToShopNoMap[rent.shopNoId] : rent.shopNo,
            rent.tenantNameId && tenantNameIdToTenantNameMap[rent.tenantNameId] ? tenantNameIdToTenantNameMap[rent.tenantNameId] : rent.tenantName,
            `${Number(rent.refundAmount || rent.amount).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`,
            formatDateOnly(rent.paidOnDate),
            rent.eno,
            rent.forTheMonthOf
                ? new Date(`${rent.forTheMonthOf}-01`).toLocaleString('default', {
                    month: 'long',
                    year: 'numeric',
                })
                : '',
            rent.paymentMode,
            rent.formType,
            getRentEnteredBy(rent),
            getRentBranchDisplay(rent)
        ]);
        doc.autoTable({
            startY: 20,
            head: [tableColumn],
            body: tableRows,
            styles: {
                fontSize: 9,
                cellPadding: 2,
                halign: 'left',
                valign: 'middle',
                textColor: [80, 80, 80],
            },
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                lineColor: [200, 200, 200],
                lineWidth: 0.1,
            },
            bodyStyles: {

                lineWidth: 0.1,
            },
            alternateRowStyles: {
                fillColor: false,
            },
        });
        doc.save('Rent_Report.pdf');
    };
    const handleDelete = async (id, username) => {
        if (window.confirm('Are you sure you want to delete this Rent?')) {
            try {
                const response = await fetch(
                    `https://backendaab.in/aabuildersDash/api/rental_forms/delete/${id}?editedBy=${encodeURIComponent(username)}`,
                    {
                        method: 'POST',
                    }
                );
                if (response.ok) {
                    alert('Expenses deleted successfully!!!');
                    loadRentForms();
                    notifyOrbitModuleDataChanged('rent');
                } else {
                    alert('Failed to delete expense');
                }
            } catch (error) {
                console.error('Failed to delete expense:', error);
            }
        }
    };
    return (
        <body className="bg-[#FAF6ED] ">
            <div className='flex flex-col h-[calc(100vh-104px)] overflow-hidden bg-[#FAF6ED]'>
                <div className='px-[18px] pt-[18px] pb-[18px] flex flex-col flex-1 min-h-0 overflow-hidden bg-[#FAF6ED]'>
                <div className="w-full pt-[18px] px-[18px] pb-[18px] bg-white rounded-[6px] flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="flex flex-col flex-1 min-h-0 overflow-hidden w-max max-w-full">
                    <div className="flex justify-between sm:flex-row sm:items-center sm:space-x-3 mb-[12px] gap-[6px] w-full">
                        <div className='flex gap-4'>
                            <EdbcFilterToggleButton
                                onClick={() => {
                                    const willOpen = !dbShowFilters;
                                    const scroller = scrollRef.current;
                                    if (willOpen) {
                                        setDbShowFilters(true);
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
                                    setDbShowFilters(false);
                                    if (!scroller || h <= 0 || !filterNudgeUsedRef.current) return;
                                    filterNudgeUsedRef.current = false;
                                    requestAnimationFrame(() => {
                                        requestAnimationFrame(() => {
                                            scroller.scrollTop = scroller.scrollTop + h;
                                        });
                                    });
                                }}
                            />
                            {(selectedDbDate || dbShopNo || dbTenantName || dbPaymentMode || dbFormType || selectedDbMonth || selectedDbENo || dbTimestampDate || dbAmount.trim() || dbEnteredBy || dbBranch) && (
                                <div className="flex flex-row flex-wrap items-center gap-2 min-w-0">
                                    {dbTimestampDate && (
                                        <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-[16px] font-medium w-fit max-w-full min-w-0 overflow-hidden">
                                            <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Timestamp: </span>
                                            <span className="font-semibold text-[14px] truncate min-w-0">{formatEdbcFilterDateDMY(dbTimestampDate)}</span>
                                            <button type="button" onClick={() => setDbTimestampDate('')} className="text-[#E4572E] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {selectedDbDate && (
                                        <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                                            <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Paid on: </span>
                                            <span className="font-semibold text-[14px] truncate min-w-0">{formatEdbcFilterDateDMY(selectedDbDate)}</span>
                                            <button type="button" onClick={() => { setSelectedDbDate(''); sessionStorage.removeItem('selectedDbDate'); }} className="text-[#E4572E] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {dbShopNo && (
                                        <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                                            <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Shop No: </span>
                                            <span className="font-semibold text-[14px] truncate min-w-0">{dbShopNo}</span>
                                            <button type="button" onClick={() => { setDbShopNo(''); sessionStorage.removeItem('dbShopNo'); }} className="text-[#E4572E] text-2xl ml-1">×</button>
                                        </span>
                                    )}
                                    {dbTenantName && (
                                        <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                                            <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Tenant Name: </span>
                                            <span className="font-semibold text-[14px] truncate min-w-0">{dbTenantName}</span>
                                            <button type="button" onClick={() => { setDbTenantName(''); sessionStorage.removeItem('dbTenantName'); }} className="text-[#E4572E] text-2xl ml-1">×</button>
                                        </span>
                                    )}
                                    {dbAmount.trim() && (
                                        <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                                            <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Amount: </span>
                                            <span className="font-semibold text-[14px] truncate min-w-0">{dbAmount}</span>
                                            <button type="button" onClick={() => setDbAmount('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                        </span>
                                    )}
                                    {dbPaymentMode && (
                                        <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                                            <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Payment Mode: </span>
                                            <span className="font-semibold text-[14px] truncate min-w-0">{dbPaymentMode}</span>
                                            <button type="button" onClick={() => { setDbPaymentMode(''); sessionStorage.removeItem('dbPaymentMode'); }} className="text-[#E4572E] text-2xl ml-1">×</button>
                                        </span>
                                    )}
                                    {dbFormType && (
                                        <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                                            <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Type: </span>
                                            <span className="font-semibold text-[14px] truncate min-w-0">{dbFormType}</span>
                                            <button type="button" onClick={() => { setDbFormType(''); sessionStorage.removeItem('dbFormType'); }} className="text-[#E4572E] text-2xl ml-1">×</button>
                                        </span>
                                    )}
                                    {selectedDbMonth && (
                                        <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                                            <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">For the month of: </span>
                                            <span className="font-semibold text-[14px] truncate min-w-0">{selectedDbMonth}</span>
                                            <button type="button" onClick={() => { setSelectedDbMonth(''); sessionStorage.removeItem('selectedDbMonth'); }} className="text-[#E4572E] text-2xl ml-1">×</button>
                                        </span>
                                    )}
                                    {selectedDbENo && (
                                        <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                                            <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Entry No: </span>
                                            <span className="font-semibold text-[14px] truncate min-w-0">{selectedDbENo}</span>
                                            <button type="button" onClick={() => { setSelectedDbENo(''); sessionStorage.removeItem('selectedDbENo'); }} className="text-[#E4572E] text-2xl ml-1">×</button>
                                        </span>
                                    )}
                                    {dbEnteredBy && (
                                        <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                                            <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Entered By: </span>
                                            <span className="font-semibold text-[14px] truncate min-w-0">{dbEnteredBy}</span>
                                            <button type="button" onClick={() => setDbEnteredBy('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                        </span>
                                    )}
                                    {dbBranch && (
                                        <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                                            <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Branch: </span>
                                            <span className="font-semibold text-[14px] truncate min-w-0">{getBranchName(dbBranch) || dbBranch}</span>
                                            <button type="button" onClick={() => setDbBranch('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <EdbcTableToolbarRightActions
                            onClearFilters={resetFilters}
                            overallSearch={overallSearch}
                            onOverallSearchChange={setOverallSearch}
                            showExportIcons
                            onExportPdf={handleExportPDF}
                            onExportCsv={handleExportExcel}
                        />
                    </div>
                        <div
                            ref={scrollRef}
                            className="w-full rounded-lg border-l-8 border-l-[#BF9853] flex-1 min-h-0 overflow-auto select-none no-scrollbar"
                            onWheel={() => { filterNudgeUsedRef.current = false; }}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp} >
                            <table className={`border-collapse w-max min-w-max text-left ${RENT_DATABASE_EDBC_WIDTH_LOCK_TABLE_CLASS} ${EDBC_TABLE_EDGE_TABLE_CLASS}${dbShowFilters ? ' [&_thead_tr:first-child_th]:!border-b-0' : ''}`}>
                                <thead className="sticky top-0">
                                    <EdbcTableHeaderRow>
                                        <EdbcColumnHeader
                                            columnId={rentDatabaseColumnIds.timestamp}
                                            label="Timestamp"
                                            sortField={sortField === 'timestamp' ? getEdbcColumnConfig(rentDatabaseColumnIds.timestamp)?.sortField : ''}
                                            sortDirection={sortOrder}
                                            onSort={() => handleSort('timestamp')}
                                        />
                                        <EdbcColumnHeader
                                            columnId={rentDatabaseColumnIds.shopNo}
                                            label="Shop No"
                                            sortField={sortField === 'shopNo' ? getEdbcColumnConfig(rentDatabaseColumnIds.shopNo)?.sortField : ''}
                                            sortDirection={sortOrder}
                                            onSort={() => handleSort('shopNo')}
                                            headerClassName="!text-left"
                                        />
                                        <EdbcColumnHeader
                                            columnId={rentDatabaseColumnIds.tenantName}
                                            label="Tenant Name"
                                            sortField={sortField === 'tenantName' ? getEdbcColumnConfig(rentDatabaseColumnIds.tenantName)?.sortField : ''}
                                            sortDirection={sortOrder}
                                            onSort={() => handleSort('tenantName')}
                                        />
                                        <EdbcColumnHeader
                                            columnId={rentDatabaseColumnIds.amount}
                                            label="Amount"
                                            sortField={sortField === 'amount' ? getEdbcColumnConfig(rentDatabaseColumnIds.amount)?.sortField : ''}
                                            sortDirection={sortOrder}
                                            onSort={() => handleSort('amount')}
                                        />
                                        <EdbcColumnHeader
                                            columnId={rentDatabaseColumnIds.paidOnDate}
                                            label="Paid on"
                                            sortField={sortField === 'paidOnDate' ? getEdbcColumnConfig(rentDatabaseColumnIds.paidOnDate)?.sortField : ''}
                                            sortDirection={sortOrder}
                                            onSort={() => handleSort('paidOnDate')}
                                        />
                                        <EdbcColumnHeader
                                            columnId={rentDatabaseColumnIds.eno}
                                            label="Entry No"
                                            sortField={sortField === 'eno' ? getEdbcColumnConfig(rentDatabaseColumnIds.eno)?.sortField : ''}
                                            sortDirection={sortOrder}
                                            onSort={() => handleSort('eno')}
                                        />
                                        <EdbcColumnHeader
                                            columnId={rentDatabaseColumnIds.forTheMonthOf}
                                            label="For the month of"
                                            sortField={sortField === 'forTheMonthOf' ? getEdbcColumnConfig(rentDatabaseColumnIds.forTheMonthOf)?.sortField : ''}
                                            sortDirection={sortOrder}
                                            onSort={() => handleSort('forTheMonthOf')}
                                        />
                                        <EdbcColumnHeader
                                            columnId={rentDatabaseColumnIds.paymentMode}
                                            label="Payment Mode"
                                            sortField={sortField === 'paymentMode' ? getEdbcColumnConfig(rentDatabaseColumnIds.paymentMode)?.sortField : ''}
                                            sortDirection={sortOrder}
                                            onSort={() => handleSort('paymentMode')}
                                        />
                                        <EdbcColumnHeader
                                            columnId={rentDatabaseColumnIds.formType}
                                            label="Type"
                                            sortField={sortField === 'formType' ? getEdbcColumnConfig(rentDatabaseColumnIds.formType)?.sortField : ''}
                                            sortDirection={sortOrder}
                                            onSort={() => handleSort('formType')}
                                        />
                                        <EdbcColumnHeader
                                            columnId={rentDatabaseColumnIds.branch}
                                            label="Branch"
                                            sortField={sortField === 'branch' ? getEdbcColumnConfig(rentDatabaseColumnIds.branch)?.sortField : ''}
                                            sortDirection={sortOrder}
                                            onSort={() => handleSort('branch')}
                                        />
                                        <EdbcColumnHeader
                                            columnId={rentDatabaseColumnIds.enteredBy}
                                            label="Entered By"
                                            sortField={sortField === 'enteredBy' ? getEdbcColumnConfig(rentDatabaseColumnIds.enteredBy)?.sortField : ''}
                                            sortDirection={sortOrder}
                                            onSort={() => handleSort('enteredBy')}
                                        />
                                        <EdbcColumnHeader columnId={rentDatabaseColumnIds.activity} label="Activity" />
                                        <EdbcColumnHeader columnId={rentDatabaseColumnIds.print} label="Print" />
                                    </EdbcTableHeaderRow>
                                    {dbShowFilters && (
                                        <EdbcTableFilterRow ref={filterRowRef}>
                                            <EdbcTimestampFilter
                                                columnId={rentDatabaseColumnIds.timestamp}
                                                placeholder="Timestamp"
                                                timestampStartDate={dbTimestampDate}
                                                timestampEndDate={dbTimestampDate}
                                                isOpen={showDbTimestampDatePicker}
                                                onOpen={() => setShowDbTimestampDatePicker(true)}
                                                onClose={() => setShowDbTimestampDatePicker(false)}
                                                onApply={(from) => {
                                                    setDbTimestampDate(from || '');
                                                    setShowDbTimestampDatePicker(false);
                                                }}
                                            />
                                            <EdbcSelectFilter
                                                columnId={rentDatabaseColumnIds.shopNo}
                                                placeholder="Shop No"
                                                options={shopNoOption.map((type) => ({ value: type, label: type }))}
                                                value={dbShopNo}
                                                onChange={(value) => {
                                                    setDbShopNo(value);
                                                    if (value) {
                                                        sessionStorage.setItem('dbShopNo', JSON.stringify(value));
                                                    } else {
                                                        sessionStorage.removeItem('dbShopNo');
                                                    }
                                                }}
                                            />
                                            <EdbcSelectFilter
                                                columnId={rentDatabaseColumnIds.tenantName}
                                                placeholder="Tenant Name"
                                                options={tenantNameOption.map((type) => ({ value: type, label: type }))}
                                                value={dbTenantName}
                                                onChange={(value) => {
                                                    setDbTenantName(value);
                                                    if (value) {
                                                        sessionStorage.setItem('dbTenantName', JSON.stringify(value));
                                                    } else {
                                                        sessionStorage.removeItem('dbTenantName');
                                                    }
                                                }}
                                            />
                                            <EdbcTotalAmountFilter
                                                columnId={rentDatabaseColumnIds.amount}
                                                totalAmount={dbAmountTotal}
                                                value={dbAmount}
                                                onChange={(e) => setDbAmount(e.target.value)}
                                            />
                                            <EdbcDateFilter
                                                placeholder="Paid on"
                                                value={selectedDbDate}
                                                onChange={setSelectedDbDate}
                                            />
                                            <EdbcSelectFilter
                                                columnId={rentDatabaseColumnIds.eno}
                                                placeholder="Entry No"
                                                options={enoOption.map((type) => ({ value: type, label: type }))}
                                                value={selectedDbENo}
                                                onChange={(value) => {
                                                    setSelectedDbENo(value);
                                                    if (value) {
                                                        sessionStorage.setItem('selectedDbENo', JSON.stringify(value));
                                                    } else {
                                                        sessionStorage.removeItem('selectedDbENo');
                                                    }
                                                }}
                                                textAlign="right"
                                            />
                                            <EdbcSelectFilter
                                                columnId={rentDatabaseColumnIds.forTheMonthOf}
                                                placeholder="For the month of"
                                                options={monthOptions.map((type) => ({ value: type, label: type }))}
                                                value={selectedDbMonth}
                                                onChange={(value) => {
                                                    setSelectedDbMonth(value);
                                                    if (value) {
                                                        sessionStorage.setItem('selectedDbMonth', JSON.stringify(value));
                                                    } else {
                                                        sessionStorage.removeItem('selectedDbMonth');
                                                    }
                                                }}
                                            />
                                            <EdbcSelectFilter
                                                columnId={rentDatabaseColumnIds.paymentMode}
                                                placeholder="Payment mode"
                                                options={paymentModeOption.map((type) => ({ value: type, label: type }))}
                                                value={dbPaymentMode}
                                                onChange={(value) => {
                                                    setDbPaymentMode(value);
                                                    if (value) {
                                                        sessionStorage.setItem('dbPaymentMode', JSON.stringify(value));
                                                    } else {
                                                        sessionStorage.removeItem('dbPaymentMode');
                                                    }
                                                }}
                                            />
                                            <EdbcSelectFilter
                                                columnId={rentDatabaseColumnIds.formType}
                                                placeholder="Type"
                                                options={formTypeOptions.map((type) => ({ value: type, label: type }))}
                                                value={dbFormType}
                                                onChange={(value) => {
                                                    setDbFormType(value);
                                                    if (value) {
                                                        sessionStorage.setItem('dbFormType', JSON.stringify(value));
                                                    } else {
                                                        sessionStorage.removeItem('dbFormType');
                                                    }
                                                }}
                                            />
                                            <EdbcSelectFilter
                                                columnId={rentDatabaseColumnIds.branch}
                                                placeholder="Branch"
                                                options={dbBranchFilterOptions}
                                                selectValue={dbBranch ? dbBranchFilterOptions.find((opt) => String(opt.value) === String(dbBranch)) || { value: dbBranch, label: getBranchName(dbBranch) || dbBranch } : null}
                                                onChange={(value) => setDbBranch(value ? String(value) : '')}
                                            />
                                            <EdbcSelectFilter
                                                columnId={rentDatabaseColumnIds.enteredBy}
                                                placeholder="Entered By"
                                                options={enteredByOption.map((type) => ({ value: type, label: type }))}
                                                value={dbEnteredBy}
                                                onChange={setDbEnteredBy}
                                            />
                                            <EdbcEmptyFilterCell columnId={rentDatabaseColumnIds.activity} />
                                            <EdbcEmptyFilterCell columnId={rentDatabaseColumnIds.print} />
                                        </EdbcTableFilterRow>
                                    )}
                                </thead>
                                <tbody>
                                    {paginatedItems.map((rent) => (
                                        <EdbcTableBodyRow key={rent.id}>
                                            <td id={rentDatabaseColumnIds.timestamp} className={getRentDatabaseCellClass(rentDatabaseColumnIds.timestamp)}>
                                                {formatDate(rent.timestamp)}
                                            </td>
                                            <td id={rentDatabaseColumnIds.shopNo} className={getRentDatabaseCellClass(rentDatabaseColumnIds.shopNo, '!text-left')}>
                                                {rent.shopNoId && shopNoIdToShopNoMap[rent.shopNoId]
                                                    ? shopNoIdToShopNoMap[rent.shopNoId]
                                                    : rent.shopNo}
                                            </td>
                                            <td id={rentDatabaseColumnIds.tenantName} className={getRentDatabaseCellClass(rentDatabaseColumnIds.tenantName)}>
                                                {rent.tenantNameId && tenantNameIdToTenantNameMap[rent.tenantNameId]
                                                    ? tenantNameIdToTenantNameMap[rent.tenantNameId]
                                                    : rent.tenantName}
                                            </td>
                                            <td id={rentDatabaseColumnIds.amount} className={getRentDatabaseCellClass(rentDatabaseColumnIds.amount, rent.refundAmount ? '!text-red-500' : '')}>
                                                {Number(rent.refundAmount || rent.amount) === 0
                                                    ? 'NIL'
                                                    : `₹${Number(rent.refundAmount || rent.amount).toLocaleString('en-IN', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}`}
                                            </td>
                                            <td id={rentDatabaseColumnIds.paidOnDate} className={getRentDatabaseCellClass(rentDatabaseColumnIds.paidOnDate)}>
                                                {Number(rent.refundAmount || rent.amount) === 0 ? 'NIL' : formatDateOnly(rent.paidOnDate)}
                                            </td>
                                            <td id={rentDatabaseColumnIds.eno} className={getRentDatabaseCellClass(rentDatabaseColumnIds.eno)}>{rent.eno}</td>
                                            <td id={rentDatabaseColumnIds.forTheMonthOf} className={getRentDatabaseCellClass(rentDatabaseColumnIds.forTheMonthOf)}>
                                                {rent.forTheMonthOf
                                                    ? new Date(`${rent.forTheMonthOf}-01`).toLocaleString('default', {
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })
                                                    : ''}
                                            </td>
                                            <td id={rentDatabaseColumnIds.paymentMode} className={getRentDatabaseCellClass(rentDatabaseColumnIds.paymentMode)}>{rent.paymentMode}</td>
                                            <td id={rentDatabaseColumnIds.formType} className={getRentDatabaseCellClass(rentDatabaseColumnIds.formType)}>{rent.formType}</td>
                                            <td id={rentDatabaseColumnIds.branch} className={getRentDatabaseCellClass(rentDatabaseColumnIds.branch)}>
                                                {getRentBranchDisplay(rent) || '-'}
                                            </td>
                                            <td id={rentDatabaseColumnIds.enteredBy} className={getRentDatabaseCellClass(rentDatabaseColumnIds.enteredBy)}>
                                                {getRentEnteredBy(rent) || '-'}
                                            </td>
                                            <td id={rentDatabaseColumnIds.activity} className={`${getRentDatabaseCellClass(rentDatabaseColumnIds.activity)} flex justify-between`}>
                                                <button
                                                    onClick={() => handleEditClick(rent)}
                                                    disabled={rent.formType === 'Shop Closure' || rent.formType === 'Refund'}
                                                    className={`rounded-full transition duration-200 ml-2 mr-3 ${
                                                        rent.formType === 'Shop Closure' || rent.formType === 'Refund'
                                                            ? 'cursor-not-allowed'
                                                            : ''
                                                    }`}
                                                    title={rent.formType === 'Shop Closure' || rent.formType === 'Refund'
                                                        ? 'Cannot edit Shop Closure or Refund forms'
                                                        : ''}
                                                >
                                                    <img
                                                        src={edit}
                                                        alt="Edit"
                                                        className="w-4 h-6 transition duration-200"
                                                    />
                                                </button>
                                                {userPermissions.includes("Delete") && (
                                                    <button className=" -ml-5 -mr-2">
                                                        <img
                                                            src={remove}
                                                            alt='delete'
                                                            onClick={() => handleDelete(rent.id, username)}
                                                            className='w-4 h-4 transition duration-200' />
                                                    </button>
                                                )}
                                                <button onClick={() => fetchAuditDetails(rent.id)} className="rounded-full transition duration-200 -mr-1">
                                                    <img
                                                        src={history}
                                                        alt="history"
                                                        className="w-4 h-5 transition duration-200"
                                                    />
                                                </button>
                                            </td>
                                            <td id={rentDatabaseColumnIds.print} className={getRentDatabaseCellClass(rentDatabaseColumnIds.print)}>
                                                <button className="text-blue-600 underline text-xs sm:text-sm" onClick={() => handlePrint(rent)}>
                                                    Print
                                                </button>
                                            </td>
                                        </EdbcTableBodyRow>
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
                                    Showing {startIndex + 1} to {Math.min(endIndex, sortedItems.length)} of {sortedItems.length} entries
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
                        <Modal
                            isOpen={modalIsOpen}
                            onRequestClose={handleCancel}
                            contentLabel="Edit Expense"
                            className="fixed inset-0 flex items-center justify-center p-4 bg-gray-800 bg-opacity-50"
                            overlayClassName="fixed inset-0">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
                                <h2 className="text-xl font-bold mb-6 border-b-2">Edit Rent Form</h2>
                                <form className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-500 font-semibold text-left">Type</label>
                                        <select
                                            name="formType"
                                            value={rentFormData.formType}
                                            onChange={handleChange}
                                            className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none">
                                            <option value="" disabled>--- Select ---</option>
                                            <option value="Rent">Rent</option>
                                            <option value="Advance">Advance</option>
                                            <option value="Shop Closure">Shop Closure</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 font-semibold text-left">Shop No</label>
                                        <Select
                                            name="shopNo"
                                            value={editShopNoOptions.find(option => option.value === rentFormData.shopNoId)}
                                            onChange={(selectedOption) => {
                                                const newShopNoId = selectedOption?.value || null;
                                                if (newShopNoId && rentFormData.tenantNameId) {
                                                    if (!isShopLinkedToTenant(newShopNoId, rentFormData.tenantNameId)) {
                                                        alert('Selected shop is not linked to the selected tenant in tenant link data');
                                                        return;
                                                    }
                                                }
                                                setRentFormData({
                                                    ...rentFormData,
                                                    shopNo: selectedOption?.shopNo || '',
                                                    shopNoId: newShopNoId
                                                });
                                            }}
                                            options={editShopNoOptions}
                                            placeholder="--- Select Shop ---"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderColor: 'rgba(191, 152, 83, 0.2)',
                                                    borderWidth: '2px',
                                                    borderRadius: '0.5rem',
                                                    padding: '0.25rem',
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
                                            }}
                                            menuPlacement="bottom"
                                            menuPosition="absolute"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 font-semibold text-left">Tenant Name </label>
                                        <Select
                                            name="tenantName"
                                            options={editTenantOptions}
                                            value={editTenantOptions.find(opt => opt.value === rentFormData.tenantNameId)}
                                            onChange={(selectedOption) => {
                                                const newTenantNameId = selectedOption?.value || null;
                                                if (rentFormData.shopNoId && newTenantNameId) {
                                                    if (!isShopLinkedToTenant(rentFormData.shopNoId, newTenantNameId)) {
                                                        alert('Selected tenant is not linked to the selected shop in tenant link data');
                                                        return;
                                                    }
                                                }
                                                setRentFormData({
                                                    ...rentFormData,
                                                    tenantName: selectedOption?.tenantName || '',
                                                    tenantNameId: newTenantNameId
                                                });
                                            }}
                                            isClearable
                                            styles={{
                                                control: (base, state) => ({
                                                    ...base,
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
                                                }),
                                                menu: (base) => ({
                                                    ...base,
                                                    zIndex: 999,
                                                }),
                                            }}
                                            placeholder="--- Select Contractor ---"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 font-semibold text-left">Paid On Date</label>
                                        <input
                                            type="date"
                                            name="paidOnDate"
                                            value={rentFormData.paidOnDate}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 font-semibold text-left">Amount </label>
                                        <input
                                            type="text"
                                            name="amount"
                                            value={rentFormData.amount}
                                            onChange={handleChange}
                                            className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-500 font-semibold text-left">Payment Mode </label>
                                        <Select
                                            name="paymentMode"
                                            value={paymentModeOptions.find(option => option.value === rentFormData.paymentMode)}
                                            onChange={async (selectedOption) => {
                                                const newPaymentMode = selectedOption?.value || '';
                                                setRentFormData({ ...rentFormData, paymentMode: newPaymentMode });
                                                if (requiresRentPaymentModal(newPaymentMode)) {
                                                    await openRentPaymentModal({ paymentMode: newPaymentMode });
                                                } else {
                                                    setShowPaymentModal(false);
                                                }
                                            }}
                                            options={paymentModeOptions}
                                            placeholder="--- Select PaymentMode ---"
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    borderColor: 'rgba(191, 152, 83, 0.2)',
                                                    borderWidth: '2px',
                                                    borderRadius: '0.5rem',
                                                    padding: '0.25rem',
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
                                            }}
                                            menuPlacement="bottom"
                                            menuPosition="absolute"
                                        />
                                    </div>
                                    <input
                                        type="month"
                                        name="forTheMonthOf"
                                        value={rentFormData.forTheMonthOf}
                                        onChange={handleChange}
                                        className="mt-1 block w-full p-2 border-2 border-[#BF9853] rounded-lg border-opacity-[0.20] focus:outline-none"
                                    />
                                    <div className="col-span-2 flex justify-end space-x-4 mt-4 border-t-2 ">
                                        <button type="button" onClick={handleCancel} className="px-4 py-2 border-2 border-opacity-[] border-[#BF9853] text-[#BF9853] rounded mt-3">
                                            Cancel
                                        </button>
                                        <button type="submit" onClick={handleSubmit} disabled={isSubmitting}
                                            className={`px-4 py-2 bg-[#BF9853] text-white rounded mt-3 transition duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </Modal>
                        {showPaymentModal && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                <div className="bg-white text-left rounded-xl p-6 w-[800px] h-[600px] overflow-y-auto flex flex-col">
                                    <h3 className="text-lg font-semibold mb-4 text-center">Payment Details</h3>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="space-y-4 mb-4">
                                            <div className="border-2 border-[#BF9853] border-opacity-25 w-full rounded-lg p-4">
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                                        <input
                                                            type="date"
                                                            value={paymentModalData.date}
                                                            onChange={(e) => setPaymentModalData(prev => ({ ...prev, date: e.target.value }))}
                                                            className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                                                        <input
                                                            type="number"
                                                            value={paymentModalData.amount}
                                                            onChange={(e) => setPaymentModalData(prev => ({ ...prev, amount: e.target.value }))}
                                                            className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                                                        <input
                                                            type="text"
                                                            value={paymentModalData.paymentMode}
                                                            readOnly
                                                            className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full text-gray-600 bg-gray-100"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            {(paymentModalData.paymentMode === "Gpay" || paymentModalData.paymentMode === "PhonePe" || paymentModalData.paymentMode === "GPay" ||
                                                paymentModalData.paymentMode === "Net Banking" || paymentModalData.paymentMode === "Cheque") && (
                                                    <div className="border-2 border-[#BF9853] border-opacity-25 w-full rounded-lg p-4">
                                                        <div className="space-y-4">
                                                            {paymentModalData.paymentMode === "Cheque" && (
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Cheque No<span className="text-red-500">*</span></label>
                                                                        <input
                                                                            type="text"
                                                                            value={paymentModalData.chequeNo}
                                                                            onChange={(e) => setPaymentModalData(prev => ({ ...prev, chequeNo: e.target.value }))}
                                                                            placeholder="Enter cheque number"
                                                                            className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Cheque Date<span className="text-red-500">*</span></label>
                                                                        <input
                                                                            type="date"
                                                                            value={paymentModalData.chequeDate}
                                                                            onChange={(e) => setPaymentModalData(prev => ({ ...prev, chequeDate: e.target.value }))}
                                                                            className="border-2 border-[#BF9853] border-opacity-25 p-2 rounded-lg w-full focus:outline-none"
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
                                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Number<span className="text-red-500">*</span></label>
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
                        <AuditModal show={showModal} onClose={() => setShowModal(false)} audits={audits} />
                    </div>
                </div>
                </div>
            </div>
        </body>
    )
}
export default RentDatabase;
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
const AuditModal = ({ show, onClose, audits }) => {
    if (!show) return null;
    const fields = [
        { key: "TenantName", label: "Tenant Name" },
        { key: "ShopNo", label: "Shop No" },
        { key: "FormType", label: "Form Type" },
        { key: "ForTheMonthOf", label: "For Month" },
        { key: "PaidOnDate", label: "Paid On" },
        { key: "PaymentMode", label: "Payment Mode" },
        { key: "RefundAmount", label: "Refund Amount" },
        { key: "AttachedFile", label: "File" },
        { key: "Amount", label: "Amount" },
    ];
    const formatDate = (dateString) => {
        if (!dateString) return "-";
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
    const formatDateDDMMYYYY = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        if (isNaN(date)) return "-";
        return date.toLocaleDateString("en-GB");
    };
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-md shadow-lg w-[95%] max-w-[1400px] mx-4 p-4">
                <div className="flex justify-between items-center mt-4 ml-7 mr-7">
                    <h2 className="text-xl font-bold">History</h2>
                    <button onClick={onClose}>
                        <h2 className="text-xl text-red-500 -mt-10 font-bold">x</h2>
                    </button>
                </div>
                <div className="overflow-auto mt-2 max-h-96 border border-l-8 border-l-[#BF9853] rounded-lg ml-7">
                    <table className="table-fixed min-w-full bg-white">
                        <thead className="bg-[#FAF6ED]">
                            <tr>
                                <th className="border-b py-2 px-2 text-left text-base font-bold">Time Stamp</th>
                                <th className="border-b py-2 px-2 text-left text-base font-bold">Edited By</th>
                                {fields.map(({ label }, idx) => (
                                    <th key={idx} className="border-b py-2 px-2 text-center text-base font-bold whitespace-nowrap">{label}</th>
                                ))}
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
                                            let oldVal = audit[`old${key}`];
                                            if (key.toLowerCase().includes("amount")) {
                                                oldVal = oldVal && !isNaN(oldVal)
                                                    ? Number(oldVal).toLocaleString("en-IN")
                                                    : "-";
                                            }
                                            if (key.toLowerCase().includes("paidondate")) {
                                                oldVal = oldVal
                                                    ? new Date(oldVal).toLocaleDateString("en-GB")
                                                    : "-";
                                            }
                                            return (
                                                <td
                                                    key={key}
                                                    style={{ width: columnWidths[i] }}
                                                    className="border text-sm text-center"
                                                >
                                                    {oldVal ?? "-"}
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
                                            let oldVal = audit[`old${key}`];
                                            let newVal = audit[`new${key}`];
                                            if (key.toLowerCase().includes("amount")) {
                                                oldVal = oldVal && !isNaN(oldVal)
                                                    ? Number(oldVal).toLocaleString("en-IN")
                                                    : "-";
                                                newVal = newVal && !isNaN(newVal)
                                                    ? Number(newVal).toLocaleString("en-IN")
                                                    : "-";
                                            }
                                            if (key.toLowerCase().includes("paidondate")) {
                                                oldVal = formatDateDDMMYYYY(oldVal);
                                                newVal = formatDateDDMMYYYY(newVal);
                                            }
                                            const changed = oldVal !== newVal;
                                            return (
                                                <td
                                                    key={key}
                                                    style={{ width: columnWidths[i] }}
                                                    className={`border text-sm text-center ${changed ? "bg-[#BF9853] text-black font-bold" : ""}`}
                                                >
                                                    {newVal ?? "-"}
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