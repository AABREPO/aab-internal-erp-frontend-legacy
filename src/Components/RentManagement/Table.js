import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import edit from '../Images/Edit.svg';
import Select from 'react-select';
import QRCode from '../Images/AAB_QR_CODE.jpeg';
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
import { useOrbitPageSync } from '../../utils/useOrbitPageSync';
import { useTabRefreshSignal } from '../../utils/useTabRefreshSignal';
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
    EdbcTotalAmountFilter,
    EdbcFilterToggleButton,
    EdbcTableToolbarRightActions,
    getEdbcColumnConfig,
    formatEdbcFilterDateDMY,
    matchesEdbcAmountFilter,
} from '../ExpensesEntry/databaseExpensesSharedColumns';
Modal.setAppElement('#root');
const rentTableColumnIds = {
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
const RENT_TABLE_EDBC_WIDTH_LOCK_TABLE_CLASS =
    '[&_th#EDBC-13]:!w-[130px] [&_td#EDBC-13]:!w-[130px] [&_th#EDBC-13]:!min-w-[130px] [&_td#EDBC-13]:!min-w-[130px] [&_th#EDBC-13]:!max-w-[130px] [&_td#EDBC-13]:!max-w-[130px] [&_thead_tr>th#EDBC-13]:!overflow-hidden [&_thead_tr:nth-child(2)>th#EDBC-13>div]:!w-[118px] [&_thead_tr:nth-child(2)>th#EDBC-13>div]:!min-w-[118px] [&_thead_tr:nth-child(2)>th#EDBC-13>div]:!max-w-[118px] [&_th#EDBC-3]:!w-[298px] [&_td#EDBC-3]:!w-[298px] [&_th#EDBC-3]:!min-w-[298px] [&_td#EDBC-3]:!min-w-[298px] [&_th#EDBC-3]:!max-w-[298px] [&_td#EDBC-3]:!max-w-[298px] [&_th#EDBC-8]:!w-[120px] [&_td#EDBC-8]:!w-[98px] [&_th#EDBC-8]:!min-w-[120px] [&_td#EDBC-8]:!min-w-[98px] [&_th#EDBC-8]:!max-w-[120px] [&_td#EDBC-8]:!max-w-[98px] [&_th#EDBC-2]:!w-[120px] [&_td#EDBC-2]:!w-[120px] [&_th#EDBC-2]:!min-w-[120px] [&_td#EDBC-2]:!min-w-[120px] [&_th#EDBC-2]:!max-w-[120px] [&_td#EDBC-2]:!max-w-[120px] [&_thead_tr>th#EDBC-2]:!overflow-hidden [&_thead_tr>th#EDBC-2]:!box-border [&_thead_tr>th#EDBC-2]:!pr-[1px] [&_thead_tr:nth-child(2)>th:nth-child(4)]:!w-[120px] [&_thead_tr:nth-child(2)>th:nth-child(4)]:!min-w-[120px] [&_thead_tr:nth-child(2)>th:nth-child(4)]:!max-w-[120px] [&_thead_tr:nth-child(2)>th:nth-child(4)]:!overflow-hidden [&_thead_tr:nth-child(2)>th:nth-child(4)]:!pr-[1px] [&_thead_tr:nth-child(2)>th:nth-child(4)>div]:!w-[120px] [&_thead_tr:nth-child(2)>th:nth-child(4)>div]:!min-w-[120px] [&_thead_tr:nth-child(2)>th:nth-child(4)>div]:!max-w-[120px] [&_thead_tr:nth-child(2)>th:nth-child(4)>div]:!box-border [&_thead_tr:nth-child(2)>th:nth-child(4) button]:!w-[120px] [&_thead_tr:nth-child(2)>th:nth-child(4) button]:!min-w-[120px] [&_thead_tr:nth-child(2)>th:nth-child(4) button]:!max-w-[120px] [&_th#EDBC-17]:!w-[120px] [&_td#EDBC-17]:!w-[120px] [&_th#EDBC-17]:!min-w-[120px] [&_td#EDBC-17]:!min-w-[120px] [&_th#EDBC-17]:!max-w-[120px] [&_td#EDBC-17]:!max-w-[120px] [&_th#EDBC-14]:!w-[158px] [&_td#EDBC-14]:!w-[158px] [&_th#EDBC-14]:!min-w-[158px] [&_td#EDBC-14]:!min-w-[158px] [&_th#EDBC-14]:!max-w-[158px] [&_td#EDBC-14]:!max-w-[158px] [&_th#EDBC-12]:!w-[158px] [&_td#EDBC-12]:!w-[158px] [&_th#EDBC-12]:!min-w-[158px] [&_td#EDBC-12]:!min-w-[158px] [&_th#EDBC-12]:!max-w-[158px] [&_td#EDBC-12]:!max-w-[158px] [&_th#EDBC-16]:!w-[158px] [&_td#EDBC-16]:!w-[158px] [&_th#EDBC-16]:!min-w-[158px] [&_td#EDBC-16]:!min-w-[158px] [&_th#EDBC-16]:!max-w-[158px] [&_td#EDBC-16]:!max-w-[158px] [&_th#EDBC-15]:!w-[158px] [&_td#EDBC-15]:!w-[158px] [&_th#EDBC-15]:!min-w-[158px] [&_td#EDBC-15]:!min-w-[158px] [&_th#EDBC-15]:!max-w-[158px] [&_td#EDBC-15]:!max-w-[158px] [&_th#EDBC-19]:!w-[70px] [&_td#EDBC-19]:!w-[70px] [&_th#EDBC-19]:!min-w-[70px] [&_td#EDBC-19]:!min-w-[70px] [&_th#EDBC-19]:!max-w-[70px] [&_td#EDBC-19]:!max-w-[70px] [&_th#EDBC-20]:!w-[70px] [&_td#EDBC-20]:!w-[70px] [&_th#EDBC-20]:!min-w-[70px] [&_td#EDBC-20]:!min-w-[70px] [&_th#EDBC-20]:!max-w-[70px] [&_td#EDBC-20]:!max-w-[70px]';
const getRentTableCellClass = (columnId, extraClassName = '') =>
    [getEdbcColumnConfig(columnId)?.tdClass || '', extraClassName].filter(Boolean).join(' ');
const Table = ({ username = '', refreshSignal, isActive = true }) => {
    const [rentForms, setRentForms] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [overallSearch, setOverallSearch] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [shopNoOption, setShopNoOption] = useState([]);
    const [tenantNameOption, setTenantNameOption] = useState([]);
    const [paymentModeOption, setPaymentModeOption] = useState([]);
    const [formTypeOptions, setFormTypeOptions] = useState([]);
    const [monthOptions, setMonthOptions] = useState([]);
    const [selectedENo, setSelectedENo] = useState('');
    const [enoOption, setEnoOption] = useState([]);
    const [shopNo, setShopNo] = useState('');
    const [filteredRentForm, setFilteredRentForm] = useState([]);
    const [tenantName, setTenantName] = useState('');
    const [paymentMode, setPaymentMode] = useState('');
    const [formType, setFormType] = useState('');
    const [eno, setEno] = useState('');
    const [selectedRentMonth, setSelectedRentMonth] = useState('');
    const [selectedAmount, setSelectedAmount] = useState('');
    const [selectedEnteredBy, setSelectedEnteredBy] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [enteredByOption, setEnteredByOption] = useState([]);
    // New state variables for projects and tenants data
    const [projects, setProjects] = useState([]);
    const [tenantShopData, setTenantShopData] = useState([]);
    const [shopNoIdToShopNoMap, setShopNoIdToShopNoMap] = useState({});
    const [tenantNameIdToTenantNameMap, setTenantNameIdToTenantNameMap] = useState({});
    // Edit modal state
    const [editId, setEditId] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [editTenantOptions, setEditTenantOptions] = useState([]);
    const [editShopNoOptions, setEditShopNoOptions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
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
    const rentPaymentModes = usePaymentModesForModule(RENT_MANAGEMENT_MODULE_NAME);
    const paymentModeOptions = useMemo(
        () => rentPaymentModes.map((mode) => ({
            value: mode.modeOfPayment,
            label: mode.modeOfPayment,
        })),
        [rentPaymentModes]
    );
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

    const branchFilterOptions = useMemo(() => {
        const ids = [...new Set(rentForms.map((r) => r.branchId ?? r.branch_id).filter((v) => v != null && v !== ''))];
        return ids.map((id) => ({ value: String(id), label: getBranchName(id) || String(id) }));
    }, [rentForms, branchOptions]);

    const amountTotal = useMemo(
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
        const savedSelectedDate = sessionStorage.getItem('selectedDate');
        const savedShopNo = sessionStorage.getItem('shopNo')
        const savedSelectedMonth = sessionStorage.getItem('selectedRentMonth');
        const savedTenantName = sessionStorage.getItem('tenantName');
        const savedFormType = sessionStorage.getItem('formType');
        const savedPaymentMode = sessionStorage.getItem('paymentMode');
        const savedEno = sessionStorage.getItem('selectedENo');
        const savedShowFilter = sessionStorage.getItem('showFilters')
        try {
            if (savedSelectedDate) setSelectedDate(JSON.parse(savedSelectedDate));
            if (savedSelectedMonth) setSelectedRentMonth(JSON.parse(savedSelectedMonth));
            if (savedShopNo) setShopNo(JSON.parse(savedShopNo));
            if (savedTenantName) setTenantName(JSON.parse(savedTenantName));
            if (savedFormType) setFormType(JSON.parse(savedFormType));
            if (savedPaymentMode) setPaymentMode(JSON.parse(savedPaymentMode));
            if (savedEno) setSelectedENo(JSON.parse(savedEno));
            if (savedShowFilter !== null) setShowFilters(JSON.parse(savedShowFilter));
        } catch (error) {
            console.error("Error parsing sessionStorage data:", error);
        }
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);
    const handleBeforeUnload = () => {
        sessionStorage.removeItem('selectedDate');
        sessionStorage.removeItem('shopNo');
        sessionStorage.removeItem('selectedRentMonth');
        sessionStorage.removeItem('tenantName');
        sessionStorage.removeItem('formType');
        sessionStorage.removeItem('selectedENo');
        sessionStorage.removeItem('paymentMode');
        sessionStorage.removeItem('showFilters');
    };
    useEffect(() => {
        if (selectedDate) sessionStorage.setItem('selectedDate', JSON.stringify(selectedDate));
        if (shopNo) sessionStorage.setItem('shopNo', JSON.stringify(shopNo));
        if (selectedRentMonth) sessionStorage.setItem('selectedRentMonth', JSON.stringify(selectedRentMonth));
        if (tenantName) sessionStorage.setItem('tenantName', JSON.stringify(tenantName));
        if (formType) sessionStorage.setItem('formType', JSON.stringify(formType));
        if (selectedENo) sessionStorage.setItem('selectedENo', JSON.stringify(selectedENo));
        if (paymentMode) sessionStorage.setItem('paymentMode', JSON.stringify(paymentMode));
        if (showFilters) sessionStorage.setItem('showFilters', JSON.stringify(showFilters));
    }, [selectedDate, shopNo, selectedRentMonth, tenantName, formType, selectedENo, paymentMode, showFilters]);
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
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const currentItems = filteredRentForm;
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };
    const [allShops, setAllShops] = useState([]);
    useEffect(() => {
        fetchProjects();
    }, []);
    useEffect(() => {
        if (projects.length > 0) {
            fetchTenants();
        }
    }, [projects]);
    // Fetch projects for allShops
    const fetchProjects = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuilderDash/api/projects/getAll');
            if (response.ok) {
                const data = await response.json();
                // Filter for "own project" category
                const ownProjects = Array.isArray(data)
                    ? data.filter(p => (p.projectCategory || '').toLowerCase() === 'own project')
                    : [];
                setProjects(ownProjects);
                console.log('Fetched projects:', ownProjects.length, 'projects');
                // Extract shop data from projects
                const extractedShops = [];
                ownProjects
                    .filter(project => project.projectReferenceName) // Only include projects with projectReferenceName
                    .forEach(project => {
                        // Convert Set to Array if needed
                        const propertyDetailsArray = Array.isArray(project.propertyDetails)
                            ? project.propertyDetails
                            : Array.from(project.propertyDetails || []);
                        propertyDetailsArray.forEach(shop => {
                            if (shop.shopNo) {
                                extractedShops.push({
                                    shopNo: shop.shopNo,
                                    doorNo: shop.doorNo || '',
                                    propertyName: project.projectReferenceName || '', // Use projectReferenceName
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
            console.log('Error fetching projects.');
        }
    };
    // Fetch tenant link data
    const fetchTenants = async () => {
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/tenant_link_shop/getAll');
            if (response.ok) {
                const data = await response.json();
                setTenantShopData(data);
                // Build mapping from shopNoId to shopNo from projects (project management)
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
                // Create ID-based options for edit popup
                const shopMap = new Map();
                data.flatMap(t => (t.shopNos || []).filter(shop => !shop.shopClosureDate))
                    .forEach(shop => {
                        const shopNo = shop.shopNoId ? shopNoIdToShopNoMap[shop.shopNoId] : null;
                        if (shopNo && shop.shopNoId && !shopMap.has(shop.shopNoId)) {
                            shopMap.set(shop.shopNoId, shopNo);
                        }
                    });
                const editShopOptions = Array.from(shopMap.entries()).map(([shopNoId, shopNo]) => ({
                    label: shopNo,
                    value: shopNoId, // Use shopNoId as value
                    shopNo: shopNo
                }));
                setEditShopNoOptions(editShopOptions);
                // Create ID-based tenant options for edit popup from tenant link data
                const editTenantOptions = data.flatMap(t =>
                    (t.shopNos || [])
                        .filter(shop => !shop.shopClosureDate)
                        .map(shop => {
                            const shopNo = shop.shopNoId ? shopNoIdToShopNoMap[shop.shopNoId] : null;
                            return {
                                label: t.tenantName,
                                value: t.id, // Use tenant ID as value
                                tenantName: t.tenantName,
                                shopNoId: shop.shopNoId || null,
                                shopNo: shopNo
                            };
                        })
                        .filter(opt => opt.shopNo)
                );
                // Remove duplicates based on tenant ID
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
    // Build mapping from IDs to actual values
    useEffect(() => {
        // Build shopNoId -> shopNo mapping from projects (project management)
        const shopNoIdMap = {};
        projects
            .filter(project => project.projectReferenceName) // Only include projects with projectReferenceName
            .forEach(project => {
                // Convert Set to Array if needed
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
        // Build tenantNameId -> tenantName mapping from tenantLinkData
        const tenantNameIdMap = {};
        tenantShopData.forEach(tenant => {
            if (tenant.id && tenant.tenantName) {
                tenantNameIdMap[tenant.id] = tenant.tenantName;
            }
        });
        setTenantNameIdToTenantNameMap(tenantNameIdMap);
    }, [projects, tenantShopData]);
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
            // Numeric comparison if both values are numbers
            if (!isNaN(valA) && !isNaN(valB)) {
                return sortOrder === 'asc' ? valA - valB : valB - valA;
            }
            // Sort by "For the Month Of" as date
            if (sortField === 'forTheMonthOf') {
                const dateA = new Date(valA + '-01');
                const dateB = new Date(valB + '-01');
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            }
            // ✅ Sort by Paid On Date
            if (sortField === 'paidOnDate') {
                const dateA = new Date(valA);
                const dateB = new Date(valB);
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            }
            // Default string comparison
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
    useEffect(() => {
        console.log('Sort field:', sortField);
        console.log('Sort order:', sortOrder);
        console.log('Current items:', currentItems);
    }, [sortField, sortOrder, currentItems]);
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
    const resetFilters = () => {
        setSelectedDate('');
        setShopNo('');
        setSelectedRentMonth('');
        setTenantName('');
        setFormType('');
        setSelectedENo('');
        setPaymentMode('');
        setSelectedAmount('');
        setSelectedEnteredBy('');
        setSelectedBranch('');
        setOverallSearch('');
        setShowFilters(false);
        setSortField('');
        setSortOrder('asc');

        sessionStorage.removeItem('selectedDate');
        sessionStorage.removeItem('shopNo');
        sessionStorage.removeItem('selectedRentMonth');
        sessionStorage.removeItem('tenantName');
        sessionStorage.removeItem('formType');
        sessionStorage.removeItem('selectedENo');
        sessionStorage.removeItem('paymentMode');
        sessionStorage.removeItem('showFilters');
    };
    const handleExportExcel = () => {
        if (filteredRentForm.length === 0 || filteredRentForm.length === rentForms.length) {
            alert("No data filtered for export.");
            return;
        }
        const headers = [
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
        const rows = filteredRentForm.map(rent => [
            rent.shopNoId && shopNoIdToShopNoMap[rent.shopNoId] ? shopNoIdToShopNoMap[rent.shopNoId] : rent.shopNo,
            rent.tenantNameId && tenantNameIdToTenantNameMap[rent.tenantNameId] ? tenantNameIdToTenantNameMap[rent.tenantNameId] : rent.tenantName,
            `${Number(rent.refundAmount || rent.amount).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`,
            formatDateOnly(rent.paidOnDate),
            rent.eno,
            rent.forTheMonthOf
                ? new Date(`${rent.forTheMonthOf}-01`).toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                })
                : "",
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
        link.setAttribute("download", "Filtered_Rent_Report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const handleExportPDF = () => {
        if (filteredRentForm.length === 0 || filteredRentForm.length === rentForms.length) {
            alert("No data filtered for export.");
            return;
        }
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Filtered Rent Report", 14, 20);
        const tableColumn = ["Shop No", "Tenant Name", "Amount", "Paid On", "For the Month Of", "Payment Mode", "Type", "Entered By", "Branch", "E No"];
        const tableRows = [];
        filteredRentForm.forEach((rent) => {
            const row = [
                rent.shopNoId && shopNoIdToShopNoMap[rent.shopNoId] ? shopNoIdToShopNoMap[rent.shopNoId] : rent.shopNo,
                rent.tenantNameId && tenantNameIdToTenantNameMap[rent.tenantNameId] ? tenantNameIdToTenantNameMap[rent.tenantNameId] : rent.tenantName,
                `${Number(rent.refundAmount || rent.amount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}`,
                formatDateOnly(rent.paidOnDate),
                rent.forTheMonthOf
                    ? new Date(`${rent.forTheMonthOf}-01`).toLocaleString("default", {
                        month: "long",
                        year: "numeric"
                    })
                    : "",
                rent.paymentMode,
                rent.formType,
                getRentEnteredBy(rent),
                getRentBranchDisplay(rent),
                rent.eno
            ];
            tableRows.push(row);
        });
        doc.autoTable({
            startY: 30,
            head: [tableColumn],
            body: tableRows,
            theme: "grid",
            styles: {
                fontSize: 10,
                fontStyle: 'normal',
                textColor: [100, 100, 100],
                lineColor: [100, 100, 100],
                lineWidth: 0.1,
            },
            headStyles: {
                fontStyle: 'bold',
                fillColor: false,
                textColor: [0, 0, 0],
                lineColor: [0, 0, 0],
                lineWidth: 0.1,
            },
        });
        doc.save("FilteredRentReport.pdf");
    };
    const handlePrint = (rent) => {
        const displayShopNo = rent.shopNoId && shopNoIdToShopNoMap[rent.shopNoId] ? shopNoIdToShopNoMap[rent.shopNoId] : rent.shopNo;
        const displayTenantName = rent.tenantNameId && tenantNameIdToTenantNameMap[rent.tenantNameId] ? tenantNameIdToTenantNameMap[rent.tenantNameId] : rent.tenantName;
        const matchingShop = allShops.find(shop => shop.shopNo === displayShopNo);
        const projectReferenceName = matchingShop?.propertyName || 'N/A'; // propertyName stores projectReferenceName
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
                margin-top: 15px;
            }
            .qr img {
                width: 150px;
                height: 150px;
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
            const matchesShopNo = shopNo ? rent.shopNo === shopNo : true;
            const matchesTenantName = tenantName ? rent.tenantName === tenantName : true;
            const matchesPaymentMode = paymentMode ? rent.paymentMode === paymentMode : true;
            const matchesFormType = formType ? rent.formType === formType : true;
            // Convert selectedDate (YYYY-MM-DD) to DD-MM-YYYY for comparison with backend format
            const formattedSelectedDate = selectedDate ? convertYYYYMMDDToDDMMYYYY(selectedDate) : '';
            const matchesDate = selectedDate ? rent.paidOnDate === formattedSelectedDate : true;
            const matchesENo = selectedENo ? rent.eno === selectedENo : true;
            const matchesMonth = selectedRentMonth
                ? rent.forTheMonthOf &&
                new Date(`${rent.forTheMonthOf}-01`).toLocaleString('default', {
                    month: 'long',
                    year: 'numeric',
                }) === selectedRentMonth
                : true;
            if (selectedAmount.trim() && !matchesEdbcAmountFilter(rent.refundAmount || rent.amount, selectedAmount)) return false;
            if (selectedEnteredBy && getRentEnteredBy(rent).toLowerCase() !== selectedEnteredBy.toLowerCase()) return false;
            if (selectedBranch) {
                const branchId = rent?.branchId ?? rent?.branch_id;
                if (String(branchId) !== String(selectedBranch)) return false;
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
    }, [shopNo, tenantName, paymentMode, formType, selectedRentMonth, selectedDate, rentForms, selectedENo, overallSearch, shopNoIdToShopNoMap, tenantNameIdToTenantNameMap, branchOptions, selectedAmount, selectedEnteredBy, selectedBranch]);

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
    }, [selectedDate, shopNo, selectedRentMonth, tenantName, formType, selectedENo, paymentMode, selectedAmount, selectedEnteredBy, selectedBranch]);

    const formatDateOnly = (dateString) => {
        if (!dateString) return '';
        // If already in DD-MM-YYYY format, just replace - with /
        if (dateString.includes('-') && dateString.split('-')[0].length === 2) {
            return dateString.replace(/-/g, '/');
        }
        // If in YYYY-MM-DD format, convert to DD/MM/YYYY
        if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
            const parts = dateString.split('-');
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        // Try parsing as date
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }
        return dateString;
    };

    // Helper function to convert DD-MM-YYYY to YYYY-MM-DD for date input
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

    // Helper function to convert YYYY-MM-DD to DD-MM-YYYY
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

    // Function to check if shopNoId is linked to tenantNameId in tenant link data
    const isShopLinkedToTenant = (shopNoId, tenantNameId) => {
        if (!shopNoId || !tenantNameId) return false;
        return tenantShopData.some(tenant =>
            tenant.id === tenantNameId &&
            tenant.shopNos &&
            tenant.shopNos.some(shop => shop.shopNoId === shopNoId && !shop.shopClosureDate)
        );
    };

    // Fetch account details
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

    const handleEditClick = (rent) => {
        // Prevent editing Shop Closure or Refund forms
        if (rent.formType === 'Shop Closure' || rent.formType === 'Refund') {
            alert('Cannot edit Shop Closure or Refund forms');
            return;
        }

        // Check if shopNoId is linked to tenantNameId
        if (rent.shopNoId && rent.tenantNameId) {
            if (!isShopLinkedToTenant(rent.shopNoId, rent.tenantNameId)) {
                alert('Cannot edit: Shop is not linked to this tenant in tenant link data');
                return;
            }
        }

        setEditId(rent.id);
        // Convert paidOnDate from DD-MM-YYYY to YYYY-MM-DD for date input
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
        // Validate that shopNoId is linked to tenantNameId
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
        // Backend expects YYYY-MM-DD format, paidOnDate is already in this format from date input
        const formattedPaidOnDate = paidOnDate;
        // Get shopNo and tenantName from IDs
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
                loadRentForms();
                notifyOrbitModuleDataChanged('rent');
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
            // If not available, use paidOnDate which should also be in YYYY-MM-DD format
            const formattedPaidOnDate = paymentModalData.date || paidOnDate;

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
            };

            const rentalUpdateUrl = `https://backendaab.in/aabuildersDash/api/rental_forms/update/${editId}`;
            if (isPaymentModeRequiringBankRegisterLog(paymentModalData.paymentMode)) {
                await postBankRegisterLogSave(
                    bankRegisterLogSaveUrlMatchingRequest(rentalUpdateUrl),
                    "Rent Management",
                    {
                        bill_payment_mode: paymentModalData.paymentMode,
                        amount: parseFloat(paymentModalData.amount || amount),
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
                    date: formattedPaidOnDate,
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
    return (
        <>
            <div className='flex flex-col h-[calc(100vh-104px)] overflow-hidden bg-[#FAF6ED]'>
                <div className='px-[18px] pt-[18px] pb-[18px] flex flex-col flex-1 min-h-0 overflow-hidden bg-[#FAF6ED]'>
                <div className="w-full pt-[18px] px-[18px] pb-[18px] bg-white rounded-[6px] flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="flex flex-col flex-1 min-h-0 overflow-hidden w-max max-w-full">
                    <div className={`text-left flex ${(selectedDate || shopNo || tenantName || paymentMode || formType || selectedRentMonth || selectedENo) ? 'flex-col sm:flex-row sm:justify-between' : 'flex-row justify-between items-center'} mb-[12px] gap-[6px] w-full`}>
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
                            {(selectedDate || shopNo || tenantName || paymentMode || formType || selectedRentMonth || selectedENo || selectedAmount.trim() || selectedEnteredBy || selectedBranch) && (
                                <div className="flex flex-row flex-wrap items-center gap-2 min-w-0">
                                    {selectedDate && (
                                        <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                                            <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Paid on: </span>
                                            <span className="font-semibold text-[14px] truncate min-w-0">{formatEdbcFilterDateDMY(selectedDate)}</span>
                                            <button type="button" onClick={() => { setSelectedDate(''); sessionStorage.removeItem('selectedDate'); }} className="text-[#E4572E] ml-1 text-2xl">×</button>
                                        </span>
                                    )}
                                    {shopNo && (
                                        <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                                            <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Shop No: </span>
                                            <span className="font-semibold text-[14px] truncate min-w-0">{shopNo}</span>
                                            <button type="button" onClick={() => { setShopNo(''); sessionStorage.removeItem('shopNo'); }} className="text-[#E4572E] text-2xl ml-1">×</button>
                                        </span>
                                    )}
                                    {tenantName && (
                                        <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                                            <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Tenant Name: </span>
                                            <span className="font-semibold text-[14px] truncate min-w-0">{tenantName}</span>
                                            <button type="button" onClick={() => { setTenantName(''); sessionStorage.removeItem('tenantName'); }} className="text-[#E4572E] text-2xl ml-1">×</button>
                                        </span>
                                    )}
                                    {selectedAmount.trim() && (
                                        <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                                            <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Amount: </span>
                                            <span className="font-semibold text-[14px] truncate min-w-0">{selectedAmount}</span>
                                            <button type="button" onClick={() => setSelectedAmount('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                        </span>
                                    )}
                                    {paymentMode && (
                                        <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                                            <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Payment Mode: </span>
                                            <span className="font-semibold text-[14px] truncate min-w-0">{paymentMode}</span>
                                            <button type="button" onClick={() => { setPaymentMode(''); sessionStorage.removeItem('paymentMode'); }} className="text-[#E4572E] text-2xl ml-1">×</button>
                                        </span>
                                    )}
                                    {formType && (
                                        <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                                            <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Type: </span>
                                            <span className="font-semibold text-[14px] truncate min-w-0">{formType}</span>
                                            <button type="button" onClick={() => { setFormType(''); sessionStorage.removeItem('formType'); }} className="text-[#E4572E] text-2xl ml-1">×</button>
                                        </span>
                                    )}
                                    {selectedRentMonth && (
                                        <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                                            <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">For the month of: </span>
                                            <span className="font-semibold text-[14px] truncate min-w-0">{selectedRentMonth}</span>
                                            <button type="button" onClick={() => { setSelectedRentMonth(''); sessionStorage.removeItem('selectedRentMonth'); }} className="text-[#E4572E] text-2xl ml-1">×</button>
                                        </span>
                                    )}
                                    {selectedENo && (
                                        <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                                            <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Entry No: </span>
                                            <span className="font-semibold text-[14px] truncate min-w-0">{selectedENo}</span>
                                            <button type="button" onClick={() => { setSelectedENo(''); sessionStorage.removeItem('selectedENo'); }} className="text-[#E4572E] text-2xl ml-1">×</button>
                                        </span>
                                    )}
                                    {selectedEnteredBy && (
                                        <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                                            <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Entered By: </span>
                                            <span className="font-semibold text-[14px] truncate min-w-0">{selectedEnteredBy}</span>
                                            <button type="button" onClick={() => setSelectedEnteredBy('')} className="text-[#E4572E] text-2xl ml-1">×</button>
                                        </span>
                                    )}
                                    {selectedBranch && (
                                        <span className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden">
                                            <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">Branch: </span>
                                            <span className="font-semibold text-[14px] truncate min-w-0">{getBranchName(selectedBranch) || selectedBranch}</span>
                                            <button type="button" onClick={() => setSelectedBranch('')} className="text-[#E4572E] text-2xl ml-1">×</button>
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
                            onMouseLeave={handleMouseUp}
                        >
                            <table className={`border-collapse w-max min-w-max text-left ${RENT_TABLE_EDBC_WIDTH_LOCK_TABLE_CLASS} ${EDBC_TABLE_EDGE_TABLE_CLASS}${showFilters ? ' [&_thead_tr:first-child_th]:!border-b-0' : ''}`}>
                                <thead className="sticky top-0">
                                    <EdbcTableHeaderRow>
                                        <EdbcColumnHeader
                                            columnId={rentTableColumnIds.shopNo}
                                            label="Shop No"
                                            sortField={sortField === 'shopNo' ? getEdbcColumnConfig(rentTableColumnIds.shopNo)?.sortField : ''}
                                            sortDirection={sortOrder}
                                            onSort={() => handleSort('shopNo')}
                                            headerClassName="!text-left"
                                        />
                                        <EdbcColumnHeader
                                            columnId={rentTableColumnIds.tenantName}
                                            label="Tenant Name"
                                            sortField={sortField === 'tenantName' ? getEdbcColumnConfig(rentTableColumnIds.tenantName)?.sortField : ''}
                                            sortDirection={sortOrder}
                                            onSort={() => handleSort('tenantName')}
                                        />
                                        <EdbcColumnHeader
                                            columnId={rentTableColumnIds.amount}
                                            label="Amount"
                                            sortField={sortField === 'amount' ? getEdbcColumnConfig(rentTableColumnIds.amount)?.sortField : ''}
                                            sortDirection={sortOrder}
                                            onSort={() => handleSort('amount')}
                                        />
                                        <EdbcColumnHeader
                                            columnId={rentTableColumnIds.paidOnDate}
                                            label="Paid on"
                                            sortField={sortField === 'paidOnDate' ? getEdbcColumnConfig(rentTableColumnIds.paidOnDate)?.sortField : ''}
                                            sortDirection={sortOrder}
                                            onSort={() => handleSort('paidOnDate')}
                                        />
                                        <EdbcColumnHeader
                                            columnId={rentTableColumnIds.eno}
                                            label="Entry No"
                                            sortField={sortField === 'eno' ? getEdbcColumnConfig(rentTableColumnIds.eno)?.sortField : ''}
                                            sortDirection={sortOrder}
                                            onSort={() => handleSort('eno')}
                                        />
                                        <EdbcColumnHeader
                                            columnId={rentTableColumnIds.forTheMonthOf}
                                            label="For the month of"
                                            sortField={sortField === 'forTheMonthOf' ? getEdbcColumnConfig(rentTableColumnIds.forTheMonthOf)?.sortField : ''}
                                            sortDirection={sortOrder}
                                            onSort={() => handleSort('forTheMonthOf')}
                                        />
                                        <EdbcColumnHeader
                                            columnId={rentTableColumnIds.paymentMode}
                                            label="Payment Mode"
                                            sortField={sortField === 'paymentMode' ? getEdbcColumnConfig(rentTableColumnIds.paymentMode)?.sortField : ''}
                                            sortDirection={sortOrder}
                                            onSort={() => handleSort('paymentMode')}
                                        />
                                        <EdbcColumnHeader
                                            columnId={rentTableColumnIds.formType}
                                            label="Type"
                                            sortField={sortField === 'formType' ? getEdbcColumnConfig(rentTableColumnIds.formType)?.sortField : ''}
                                            sortDirection={sortOrder}
                                            onSort={() => handleSort('formType')}
                                        />
                                        <EdbcColumnHeader
                                            columnId={rentTableColumnIds.branch}
                                            label="Branch"
                                            sortField={sortField === 'branch' ? getEdbcColumnConfig(rentTableColumnIds.branch)?.sortField : ''}
                                            sortDirection={sortOrder}
                                            onSort={() => handleSort('branch')}
                                        />
                                        <EdbcColumnHeader
                                            columnId={rentTableColumnIds.enteredBy}
                                            label="Entered By"
                                            sortField={sortField === 'enteredBy' ? getEdbcColumnConfig(rentTableColumnIds.enteredBy)?.sortField : ''}
                                            sortDirection={sortOrder}
                                            onSort={() => handleSort('enteredBy')}
                                        />
                                        <EdbcColumnHeader columnId={rentTableColumnIds.activity} label="Activity" />
                                        <EdbcColumnHeader columnId={rentTableColumnIds.print} label="Print" />
                                    </EdbcTableHeaderRow>
                                    {showFilters && (
                                        <EdbcTableFilterRow ref={filterRowRef}>
                                            <EdbcSelectFilter
                                                columnId={rentTableColumnIds.shopNo}
                                                placeholder="Shop No"
                                                options={shopNoOption.map((type) => ({ value: type, label: type }))}
                                                value={shopNo}
                                                onChange={(value) => {
                                                    setShopNo(value);
                                                    if (value) {
                                                        sessionStorage.setItem('shopNo', JSON.stringify(value));
                                                    } else {
                                                        sessionStorage.removeItem('shopNo');
                                                    }
                                                }}
                                            />
                                            <EdbcSelectFilter
                                                columnId={rentTableColumnIds.tenantName}
                                                placeholder="Tenant Name"
                                                options={tenantNameOption.map((type) => ({ value: type, label: type }))}
                                                value={tenantName}
                                                onChange={(value) => {
                                                    setTenantName(value);
                                                    if (value) {
                                                        sessionStorage.setItem('tenantName', JSON.stringify(value));
                                                    } else {
                                                        sessionStorage.removeItem('tenantName');
                                                    }
                                                }}
                                            />
                                            <EdbcTotalAmountFilter
                                                columnId={rentTableColumnIds.amount}
                                                totalAmount={amountTotal}
                                                value={selectedAmount}
                                                onChange={(e) => setSelectedAmount(e.target.value)}
                                            />
                                            <EdbcDateFilter
                                                placeholder="Paid on"
                                                value={selectedDate}
                                                onChange={setSelectedDate}
                                            />
                                            <EdbcSelectFilter
                                                columnId={rentTableColumnIds.eno}
                                                placeholder="Entry No"
                                                options={enoOption.map((type) => ({ value: type, label: type }))}
                                                value={selectedENo}
                                                onChange={(value) => {
                                                    setSelectedENo(value);
                                                    if (value) {
                                                        sessionStorage.setItem('selectedENo', JSON.stringify(value));
                                                    } else {
                                                        sessionStorage.removeItem('selectedENo');
                                                    }
                                                }}
                                                textAlign="right"
                                            />
                                            <EdbcSelectFilter
                                                columnId={rentTableColumnIds.forTheMonthOf}
                                                placeholder="For the month of"
                                                options={monthOptions.map((type) => ({ value: type, label: type }))}
                                                value={selectedRentMonth}
                                                onChange={(value) => {
                                                    setSelectedRentMonth(value);
                                                    if (value) {
                                                        sessionStorage.setItem('selectedRentMonth', JSON.stringify(value));
                                                    } else {
                                                        sessionStorage.removeItem('selectedRentMonth');
                                                    }
                                                }}
                                            />
                                            <EdbcSelectFilter
                                                columnId={rentTableColumnIds.paymentMode}
                                                placeholder="Payment mode"
                                                options={paymentModeOption.map((type) => ({ value: type, label: type }))}
                                                value={paymentMode}
                                                onChange={(value) => {
                                                    setPaymentMode(value);
                                                    if (value) {
                                                        sessionStorage.setItem('paymentMode', JSON.stringify(value));
                                                    } else {
                                                        sessionStorage.removeItem('paymentMode');
                                                    }
                                                }}
                                            />
                                            <EdbcSelectFilter
                                                columnId={rentTableColumnIds.formType}
                                                placeholder="Type"
                                                options={formTypeOptions.map((type) => ({ value: type, label: type }))}
                                                value={formType}
                                                onChange={(value) => {
                                                    setFormType(value);
                                                    if (value) {
                                                        sessionStorage.setItem('formType', JSON.stringify(value));
                                                    } else {
                                                        sessionStorage.removeItem('formType');
                                                    }
                                                }}
                                            />
                                            <EdbcSelectFilter
                                                columnId={rentTableColumnIds.branch}
                                                placeholder="Branch"
                                                options={branchFilterOptions}
                                                selectValue={selectedBranch ? branchFilterOptions.find((opt) => String(opt.value) === String(selectedBranch)) || { value: selectedBranch, label: getBranchName(selectedBranch) || selectedBranch } : null}
                                                onChange={(value) => setSelectedBranch(value ? String(value) : '')}
                                            />
                                            <EdbcSelectFilter
                                                columnId={rentTableColumnIds.enteredBy}
                                                placeholder="Entered By"
                                                options={enteredByOption.map((type) => ({ value: type, label: type }))}
                                                value={selectedEnteredBy}
                                                onChange={setSelectedEnteredBy}
                                            />
                                            <EdbcEmptyFilterCell columnId={rentTableColumnIds.activity} />
                                            <EdbcEmptyFilterCell columnId={rentTableColumnIds.print} />
                                        </EdbcTableFilterRow>
                                    )}
                                </thead>
                                <tbody>
                                    {paginatedItems.map((rent, index) => (
                                        <EdbcTableBodyRow key={rent.id}>
                                            <td id={rentTableColumnIds.shopNo} className={getRentTableCellClass(rentTableColumnIds.shopNo, '!text-left')}>
                                                {rent.shopNoId && shopNoIdToShopNoMap[rent.shopNoId]
                                                    ? shopNoIdToShopNoMap[rent.shopNoId]
                                                    : rent.shopNo}
                                            </td>
                                            <td id={rentTableColumnIds.tenantName} className={getRentTableCellClass(rentTableColumnIds.tenantName)}>
                                                {rent.tenantNameId && tenantNameIdToTenantNameMap[rent.tenantNameId]
                                                    ? tenantNameIdToTenantNameMap[rent.tenantNameId]
                                                    : rent.tenantName}
                                            </td>
                                            <td id={rentTableColumnIds.amount} className={getRentTableCellClass(rentTableColumnIds.amount, rent.refundAmount ? '!text-red-500' : '')}>
                                                {Number(rent.refundAmount || rent.amount) === 0
                                                    ? 'NIL'
                                                    : `₹${Number(rent.refundAmount || rent.amount).toLocaleString('en-IN', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}`}
                                            </td>
                                            <td id={rentTableColumnIds.paidOnDate} className={getRentTableCellClass(rentTableColumnIds.paidOnDate)}>
                                                {Number(rent.refundAmount || rent.amount) === 0 ? 'NIL' : formatDateOnly(rent.paidOnDate)}
                                            </td>
                                            <td id={rentTableColumnIds.eno} className={getRentTableCellClass(rentTableColumnIds.eno)}>{rent.eno}</td>
                                            <td id={rentTableColumnIds.forTheMonthOf} className={getRentTableCellClass(rentTableColumnIds.forTheMonthOf)}>
                                                {rent.forTheMonthOf
                                                    ? new Date(`${rent.forTheMonthOf}-01`).toLocaleString('default', {
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })
                                                    : ''}
                                            </td>
                                            <td id={rentTableColumnIds.paymentMode} className={getRentTableCellClass(rentTableColumnIds.paymentMode)}>{rent.paymentMode}</td>
                                            <td id={rentTableColumnIds.formType} className={getRentTableCellClass(rentTableColumnIds.formType)}>{rent.formType}</td>
                                            <td id={rentTableColumnIds.branch} className={getRentTableCellClass(rentTableColumnIds.branch)}>
                                                {getRentBranchDisplay(rent) || '-'}
                                            </td>
                                            <td id={rentTableColumnIds.enteredBy} className={getRentTableCellClass(rentTableColumnIds.enteredBy)}>
                                                {getRentEnteredBy(rent) || '-'}
                                            </td>
                                            <td id={rentTableColumnIds.activity} className={getRentTableCellClass(rentTableColumnIds.activity, '!justify-center')}>
                                                <button
                                                    onClick={() => handleEditClick(rent)}
                                                    disabled={rent.formType === 'Shop Closure' || rent.formType === 'Refund'}
                                                    className={`rounded-full transition duration-200 ml-2 mr-3 ${rent.formType === 'Shop Closure' || rent.formType === 'Refund'
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : ''
                                                        }`}
                                                    title={rent.formType === 'Shop Closure' || rent.formType === 'Refund'
                                                        ? 'Cannot edit Shop Closure or Refund forms'
                                                        : ''}
                                                >
                                                    <img
                                                        src={edit}
                                                        alt="Edit"
                                                        className={`w-4 h-6 transition duration-200 ${rent.formType === 'Shop Closure' || rent.formType === 'Refund'
                                                            ? ''
                                                            : ''
                                                            }`}
                                                    />
                                                </button>
                                            </td>
                                            <td id={rentTableColumnIds.print} className={getRentTableCellClass(rentTableColumnIds.print)}>
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
                    </div>
                        <Modal
                            isOpen={modalIsOpen}
                            onRequestClose={handleCancel}
                            contentLabel="Edit Rent Form"
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
                                            placeholder="--- Select Tenant ---"
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
                </div>
                </div>
            </div>
        </>
    )
}
export default Table;