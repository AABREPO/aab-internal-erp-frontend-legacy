import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import axios from 'axios';
import Edit from '../Images/Edit.svg'
import Select from 'react-select';
import jsPDF from "jspdf";
import "jspdf-autotable";
import RentForm from './Form';
import CustomMonthField from '../ExpensesEntry/CustomMonthField';
import { useOrbitPageSync } from '../../utils/useOrbitPageSync';
import { useTabRefreshSignal } from '../../utils/useTabRefreshSignal';
import Pdf from '../Images/pdf.png';
import FileRemover from '../Images/FileRemover.svg';
import {
    EDBC_IDS,
    EdbcColumnHeader,
    EdbcEmptyFilterCell,
    EdbcFilterToggleButton,
    EdbcTableBodyRow,
    EdbcTableFilterRow,
    EdbcTableHeaderRow,
    EdbcTableToolbarRightActions,
    EdbcSelectFilter,
    EdbcTotalAmountFilter,
    getEdbcColumnConfig
} from '../ExpensesEntry/databaseExpensesSharedColumns';

const DASHBOARD_REFRESH_MS = 60_000;

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
const rentDashboardColumnIds = {
    serialNo: EDBC_IDS.EDBC21,
    shopNo: EDBC_IDS.EDBC13,
    shopName: EDBC_IDS.EDBC4,
    doorNo: EDBC_IDS.EDBC22,
    advance: EDBC_IDS.EDBC8,
    month: EDBC_IDS.EDBC22,
    unpaid: EDBC_IDS.EDBC22,
    activity: EDBC_IDS.EDBC19,
};
const RENT_DASHBOARD_EDBC_WIDTH_LOCK_TABLE_CLASS =
    '[&_th#EDBC-21]:!w-[70px] [&_td#EDBC-21]:!w-[70px] [&_th#EDBC-21]:!min-w-[70px] [&_td#EDBC-21]:!min-w-[70px] [&_th#EDBC-21]:!max-w-[70px] [&_td#EDBC-21]:!max-w-[70px] [&_th#EDBC-13]:!w-[130px] [&_td#EDBC-13]:!w-[130px] [&_th#EDBC-13]:!min-w-[130px] [&_td#EDBC-13]:!min-w-[130px] [&_th#EDBC-13]:!max-w-[130px] [&_td#EDBC-13]:!max-w-[130px] [&_th#EDBC-4]:!w-[218px] [&_td#EDBC-4]:!w-[218px] [&_th#EDBC-4]:!min-w-[218px] [&_td#EDBC-4]:!min-w-[218px] [&_th#EDBC-4]:!max-w-[218px] [&_td#EDBC-4]:!max-w-[218px] [&_th#EDBC-22]:!w-[80px] [&_td#EDBC-22]:!w-[80px] [&_th#EDBC-22]:!min-w-[80px] [&_td#EDBC-22]:!min-w-[80px] [&_th#EDBC-22]:!max-w-[80px] [&_td#EDBC-22]:!max-w-[80px] [&_th#EDBC-8]:!w-[120px] [&_td#EDBC-8]:!w-[120px] [&_th#EDBC-8]:!min-w-[120px] [&_td#EDBC-8]:!min-w-[120px] [&_th#EDBC-8]:!max-w-[120px] [&_td#EDBC-8]:!max-w-[120px] [&_th#EDBC-19]:!w-[70px] [&_td#EDBC-19]:!w-[70px] [&_th#EDBC-19]:!min-w-[70px] [&_td#EDBC-19]:!min-w-[70px] [&_th#EDBC-19]:!max-w-[70px] [&_td#EDBC-19]:!max-w-[70px]';
const getRentDashboardCellClass = (columnId, extraClassName = '') =>
    [getEdbcColumnConfig(columnId)?.tdClass || '', extraClassName].filter(Boolean).join(' ');
const dashboardTopFieldClass = 'border-2 border-[#BF9853] rounded-lg px-[8px] h-[40px] focus:outline-none border-opacity-[0.20] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500';
const dashboardTopDropdownStyles = {
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
    indicatorSeparator: () => ({ display: 'none' }),
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
    menu: (provided) => ({
        ...provided,
        zIndex: 9999,
        maxHeight: '300px',
    }),
    menuPortal: (provided) => ({
        ...provided,
        zIndex: 9999,
    }),
    menuList: (provided) => ({
        ...provided,
        paddingTop: 0,
        paddingBottom: 0,
        maxHeight: '250px',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    }),
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
const paymentStatusOptions = [
    { value: 'paid', label: 'Paid' },
    { value: 'unpaid', label: 'Unpaid' },
];
const occupancyStatusOptions = [
    { value: 'occupied', label: 'Occupied Shop' },
    { value: 'vacant', label: 'Vacant Shop' },
    { value: 'vacated', label: 'Vacated Shop' },
];
const Dashboard = ({ refreshSignal, isActive = true }) => {
    const getCurrentMonth = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;
    };
    const [totalMonthlyRent, setTotalMonthlyRent] = useState(0);
    const [rentForms, setRentForms] = useState([]);
    const [tenantShopData, setTenantShopData] = useState([]);
    const [shopNoIdToShopNoMap, setShopNoIdToShopNoMap] = useState({});
    const [tenantNameIdToTenantNameMap, setTenantNameIdToTenantNameMap] = useState({});
    const [editAdvance, setEditAdvance] = useState('');
    const [editRent, setEditRent] = useState('');
    const [editStartingMonth, setEditStartingMonth] = useState('');
    const [tableData, setTableData] = useState([]);
    const [vacatedTableData, setVacatedTableData] = useState([]);
    const [selectedShop, setSelectedShop] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [projects, setProjects] = useState([]);
    const [showVacantPopup, setShowVacantPopup] = useState(false);
    const [sortField, setSortField] = useState('shopNo');
    const [sortOrder, setSortOrder] = useState('asc'); // or 'desc'
    const [selectedShopNo, setSelectedShopNo] = useState('');
    const [selectedTenantName, setSelectedTenantName] = useState('');
    const [selectedDoorNo, setSelectedDoorNo] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [selectedOccupancyStatus, setSelectedOccupancyStatus] = useState('');
    const [selectedMonthYear, setSelectedMonthYear] = useState(getCurrentMonth());
    const [showRentFormPopup, setShowRentFormPopup] = useState(false);
    const [overallSearch, setOverallSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [shopNoFilter, setShopNoFilter] = useState('');
    const [shopNameFilter, setShopNameFilter] = useState('');
    const [doorNoFilter, setDoorNoFilter] = useState('');
    const [advanceFilter, setAdvanceFilter] = useState('');
    const [tableHeight, setTableHeight] = useState(400); // Default height in pixels
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const scrollRef = useRef(null);
    const tableRef = useRef(null);
    const [tableToolbarWidth, setTableToolbarWidth] = useState(null);
    const isDragging = useRef(false);
    const start = useRef({ x: 0, y: 0 });
    const scroll = useRef({ left: 0, top: 0 });
    const velocity = useRef({ x: 0, y: 0 });
    const animationFrame = useRef(null);
    const lastMove = useRef({ time: 0, x: 0, y: 0 });
    const selectedYear = selectedMonthYear ? parseInt(selectedMonthYear.split('-')[0]) : '';
    const selectedMonth = selectedMonthYear ? parseInt(selectedMonthYear.split('-')[1]) - 1 : '';
    useEffect(() => {
        const savedPaymentStatus = sessionStorage.getItem('paymentStatus');
        const savedShopNo = sessionStorage.getItem('selectedShopNo')
        const savedSelectedDoorNo = sessionStorage.getItem('selectedDoorNo');
        const savedSelectedProperty = sessionStorage.getItem('selectedProperty');
        const savedOccupancyStatus = sessionStorage.getItem('selectedOccupancyStatus');
        try {
            if (savedPaymentStatus) setPaymentStatus(JSON.parse(savedPaymentStatus));
            if (savedShopNo) setSelectedShopNo(JSON.parse(savedShopNo));
            if (savedSelectedDoorNo) setSelectedDoorNo(JSON.parse(savedSelectedDoorNo));
            if (savedSelectedProperty) setSelectedProperty(JSON.parse(savedSelectedProperty));
            if (savedOccupancyStatus) setSelectedOccupancyStatus(JSON.parse(savedOccupancyStatus));
        } catch (error) {
            console.error("Error parsing sessionStorage data:", error);
        }
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);
    const handleBeforeUnload = () => {
        sessionStorage.removeItem('paymentStatus');
        sessionStorage.removeItem('selectedShopNo');
        sessionStorage.removeItem('selectedDoorNo');
        sessionStorage.removeItem('selectedTenantName');
        sessionStorage.removeItem('selectedProperty');
        sessionStorage.removeItem('selectedOccupancyStatus');
    };
    useEffect(() => {
        if (paymentStatus) sessionStorage.setItem('paymentStatus', JSON.stringify(paymentStatus));
        if (selectedShopNo) sessionStorage.setItem('selectedShopNo', JSON.stringify(selectedShopNo));
        if (selectedDoorNo) sessionStorage.setItem('selectedDoorNo', JSON.stringify(selectedDoorNo));
        if (selectedTenantName) sessionStorage.setItem('selectedTenantName', JSON.stringify(selectedTenantName));
        if (selectedProperty) sessionStorage.setItem('selectedProperty', JSON.stringify(selectedProperty));
        if (selectedOccupancyStatus) sessionStorage.setItem('selectedOccupancyStatus', JSON.stringify(selectedOccupancyStatus));
    }, [paymentStatus, selectedShopNo, selectedDoorNo, selectedTenantName, selectedProperty, selectedOccupancyStatus]);
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };
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
            } else {
                console.log('Error fetching projects.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const loadRentForms = useCallback(async () => {
        try {
            const response = await axios.get('https://backendaab.in/aabuildersDash/api/rental_forms/getAll');
            const list = Array.isArray(response.data) ? response.data : [];
            const sortedForms = list.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            setRentForms(sortedForms);
        } catch (error) {
            console.error('Error fetching rental data:', error);
        }
    }, []);
    const loadTenants = useCallback(async (projectList = projects) => {
        if (!Array.isArray(projectList) || projectList.length === 0) return;
        try {
            const response = await fetch('https://backendaab.in/aabuildersDash/api/tenant_link_shop/getAll');
            if (response.ok) {
                const data = await response.json();
                setTenantShopData(data);
                const shopNoIdToShopNoMap = {};
                projectList
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
                setShopNoIdToShopNoMap(shopNoIdToShopNoMap);
                const tenantNameIdMap = {};
                data.forEach(tenant => {
                    if (tenant.id && tenant.tenantName) {
                        tenantNameIdMap[tenant.id] = tenant.tenantName;
                    }
                });
                setTenantNameIdToTenantNameMap(tenantNameIdMap);
                let total = 0;
                data.forEach(tenant => {
                    tenant.shopNos?.forEach(shop => {
                        if (!shop.shopClosureDate && shop.monthlyRent) {
                            total += parseFloat(shop.monthlyRent) || 0;
                        }
                    });
                });
                setTotalMonthlyRent(total);
            } else {
                console.error('Error fetching tenants.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }, [projects]);
    const refreshDashboardData = useCallback(async () => {
        await Promise.all([loadRentForms(), loadTenants()]);
    }, [loadRentForms, loadTenants]);
    useEffect(() => {
        loadRentForms();
    }, [loadRentForms]);
    useEffect(() => {
        if (projects.length > 0) {
            loadTenants(projects);
        }
    }, [projects, loadTenants]);
    useOrbitPageSync('rent', refreshDashboardData, [refreshDashboardData]);
    useTabRefreshSignal(refreshSignal, isActive, refreshDashboardData);
    useEffect(() => {
        if (!isActive) return undefined;
        refreshDashboardData();
        const intervalId = window.setInterval(() => {
            refreshDashboardData();
        }, DASHBOARD_REFRESH_MS);
        return () => window.clearInterval(intervalId);
    }, [isActive, refreshDashboardData]);

    const openRentFormPopupForUnpaidMonth = (shop, monthIdx) => {
        if (!shop || monthIdx == null) return;
        const monthStr = `${selectedYear}-${String(monthIdx + 1).padStart(2, '0')}`;
        const monthlyRent =
            shopInfoMap?.[shop.shopNo]?.monthlyRent ??
            shop.monthlyRent ??
            '';
        try {
            sessionStorage.setItem('selectedRentType', JSON.stringify('Rent'));
            sessionStorage.setItem('selectedMonth', JSON.stringify(monthStr));
            sessionStorage.setItem('formShopNo', JSON.stringify(shop.shopNo));
            sessionStorage.setItem('formTenantName', JSON.stringify(shop.tenantName));
            sessionStorage.setItem('amount', JSON.stringify(String(monthlyRent || '')));
            sessionStorage.setItem('calculatedRent', JSON.stringify(String(monthlyRent || '')));
            sessionStorage.setItem('paidOnDate', JSON.stringify(new Date().toISOString().split('T')[0]));
            sessionStorage.setItem('formPaymentMode', JSON.stringify(''));
            sessionStorage.setItem('closureDate', JSON.stringify(''));
        } catch (e) {
            console.error('Failed to set rent form prefill', e);
        }
        setShowRentFormPopup(true);
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
    const shopInfoMap = useMemo(() => {
        const map = {};
        tenantShopData.forEach(tenant => {
            tenant.shopNos?.forEach(shop => {
                if (shop.shopNoId) {
                    const shopNo = shopNoIdToShopNoMap[shop.shopNoId] || '';
                    if (shopNo) {
                        let doorNo = '';
                        let projectReferenceName = '';
                        projects
                            .filter(project => project.projectReferenceName)
                            .forEach(project => {
                                const propertyDetailsArray = Array.isArray(project.propertyDetails)
                                    ? project.propertyDetails
                                    : Array.from(project.propertyDetails || []);
                                propertyDetailsArray.forEach(detail => {
                                    if (detail.id === shop.shopNoId) {
                                        doorNo = detail.doorNo || '';
                                        projectReferenceName = project.projectReferenceName || '';
                                    }
                                });
                            });
                        map[shopNo] = {
                            doorNo: doorNo,
                            projectReferenceName: projectReferenceName,
                            advanceAmount: shop.advanceAmount || '',
                            monthlyRent: shop.monthlyRent || '',
                            tenantId: tenant.id,
                            shopId: shop.shopNoId,
                            startingDate: shop.startingDate,
                            shopClosureDate: shop.shopClosureDate,
                            shouldCollectAdvance: shop.shouldCollectAdvance
                        };
                    }
                }
            });
        });
        return map;
    }, [tenantShopData, shopNoIdToShopNoMap, projects]);
    const parseAmountOrZero = (value) => {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : 0;
    };
    useEffect(() => {
        const buildTenantKey = (shopNo, tenantId, tenantName) => {
            const normalizedShop = shopNo || 'unknown';
            const tenantIdentifier = tenantId
                ? `id:${tenantId}`
                : tenantName
                    ? `name:${tenantName}`
                    : 'vacant';
            return `${normalizedShop}||${tenantIdentifier}`;
        };
        const getTenantKeyFromForm = (entry) => {
            const resolvedShopNo = entry.shopNoId
                ? (shopNoIdToShopNoMap[entry.shopNoId] || entry.shopNo || '')
                : (entry.shopNo || '');
            if (!resolvedShopNo) return null;
            const tenantIdentifier = entry.tenantNameId
                ? `id:${entry.tenantNameId}`
                : entry.tenantName
                    ? `name:${entry.tenantName}`
                    : 'vacant';
            return `${resolvedShopNo}||${tenantIdentifier}`;
        };
        const createMonthBuckets = () => Array(12).fill(null).map(() => []);
        const doesFormBelongToShop = (entry, shop) => {
            const shopMatches = entry.shopNoId
                ? (shop.shopNoId && entry.shopNoId === shop.shopNoId)
                : (entry.shopNo === shop.shopNo);
            if (!shopMatches) return false;
            if (entry.tenantNameId) {
                return shop.tenantId && entry.tenantNameId === shop.tenantId;
            }
            if (entry.tenantName && shop.tenantName) {
                return entry.tenantName === shop.tenantName;
            }
            return !entry.tenantName && !shop.tenantName;
        };
        const allShops = [];
        projects
            .filter(project => project.projectReferenceName)
            .forEach(project => {
                const propertyDetailsArray = Array.isArray(project.propertyDetails) 
                    ? project.propertyDetails 
                    : Array.from(project.propertyDetails || []);
                
                propertyDetailsArray.forEach(shop => {
                    if (shop.shopNo) {
                        allShops.push({
                            shopNo: shop.shopNo,
                            doorNo: shop.doorNo || '',
                            propertyName: project.projectReferenceName || '',
                            advance: null,
                            tenantName: null,
                            tenantId: null,
                            shopId: shop.id,
                            shopNoId: shop.id,
                            active: false,
                            tenantKey: buildTenantKey(shop.shopNo, null, null),
                            isBase: true,
                            hasTenant: false,
                            startingDate: null,
                            shopClosureDate: null,
                            shouldCollectAdvance: true
                        });
                    }
                });
            });
        tenantShopData.forEach(tenant => {
            tenant.shopNos?.forEach(shop => {
                if (!shop?.shopNoId) return;
                const shopNo = shopNoIdToShopNoMap[shop.shopNoId] || '';
                if (!shopNo) return;
                const shopEntryIndex = allShops.findIndex(s => s.shopNo === shopNo && s.isBase);
                if (shopEntryIndex !== -1) {
                    allShops[shopEntryIndex].hasTenant = true;
                }
                const baseEntry = shopEntryIndex !== -1 ? allShops[shopEntryIndex] : null;
                const tenantEntry = {
                    shopNo,
                    doorNo: baseEntry?.doorNo || '',
                    propertyName: baseEntry?.propertyName || '',
                    advance: null,
                    tenantName: tenant.tenantName || '',
                    tenantId: tenant.id,
                    shopId: shop.id || shop.shopNoId,
                    shopNoId: shop.shopNoId,
                    active: !shop.shopClosureDate,
                    tenantKey: buildTenantKey(shopNo, tenant.id, tenant.tenantName),
                    isBase: false,
                    startingDate: shop.startingDate || null,
                    shopClosureDate: shop.shopClosureDate || null,
                    shouldCollectAdvance: shop.shouldCollectAdvance ?? true
                };
                allShops.push(tenantEntry);
            });
        });
        const shopsForTable = allShops.filter(shop => !(shop.isBase && shop.hasTenant));
        // 3. Filter rent data for selected year
        const filteredForms = rentForms.filter(entry => {
            const date = new Date(entry.forTheMonthOf);
            return (entry.formType === 'Rent' || entry.formType === 'Pending Rent') &&
                date.getFullYear() === parseInt(selectedYear);
        });
        // 4. Group rents and collect detailed history using shopNoId
        const groupedRentals = {};
        const rentHistoryMap = {};
        filteredForms.forEach(entry => {
            const month = new Date(entry.forTheMonthOf).getMonth();
            const key = getTenantKeyFromForm(entry);
            if (!key) return;
            const amount = parseFloat(entry.amount || 0);
            const paidOn = formatDateOnly(entry.paidOnDate) || '';
            if (!groupedRentals[key]) {
                groupedRentals[key] = createMonthBuckets();
            }
            if (!rentHistoryMap[key]) {
                rentHistoryMap[key] = createMonthBuckets();
            }
            groupedRentals[key][month].push(amount);
            rentHistoryMap[key][month].push(`${paidOn} - ₹${amount.toLocaleString()}`);
        });
        // 5. Advance map and history using shopNoId
        const advanceMap = {};
        const advanceDetailsMap = {};
        const advanceAdjustmentDetailsMap = {};
        const shopClosureDetailsMap = {};
        const refundDetailsMap = {};
        rentForms.forEach(entry => {
            const key = getTenantKeyFromForm(entry);
            if (!key) return;
            
            if (entry.formType === 'Advance') {
                const amount = parseFloat(entry.amount || 0);
                const paidOn = formatDateOnly(entry.paidOnDate) || '';
                if (!advanceMap[key]) {
                    advanceMap[key] = 0;
                    advanceDetailsMap[key] = [];
                    advanceAdjustmentDetailsMap[key] = [];
                    shopClosureDetailsMap[key] = [];
                    refundDetailsMap[key] = [];
                }
                advanceMap[key] += amount;
                advanceDetailsMap[key].push(`${paidOn} - ₹${amount.toLocaleString()}`);
            } else if ((entry.formType === 'Rent' || entry.formType === 'Pending Rent') && entry.paymentMode?.trim() === 'Advance Adjustment') {
                const amount = parseFloat(entry.amount || 0);
                const paidOn = formatDateOnly(entry.paidOnDate) || '';
                if (!advanceAdjustmentDetailsMap[key]) {
                    advanceAdjustmentDetailsMap[key] = [];
                }
                advanceAdjustmentDetailsMap[key].push(`${paidOn} - ₹${amount.toLocaleString()}`);
            } else if (entry.formType === 'Shop Closure') {
                const amount = parseAmountOrZero(entry.refundAmount ?? entry.amount);
                const paidOn = formatDateOnly(entry.paidOnDate) || '';
                if (!shopClosureDetailsMap[key]) {
                    shopClosureDetailsMap[key] = [];
                }
                shopClosureDetailsMap[key].push(`${paidOn} - ₹${amount.toLocaleString()}`);
            } else if (entry.formType === 'Refund') {
                const amount = parseFloat(entry.refundAmount || entry.amount || 0);
                const paidOn = formatDateOnly(entry.paidOnDate) || '';
                if (!refundDetailsMap[key]) {
                    refundDetailsMap[key] = [];
                }
                refundDetailsMap[key].push(`${paidOn} - ₹${amount.toLocaleString()}`);
            }
        });
        const shopOrder = allShops
            .filter(s => s.isBase)
            .map(s => s.shopNo)
            .filter(Boolean);
        const seenOrder = new Set();
        const orderedShopNos = shopOrder.filter(no => {
            if (seenOrder.has(no)) return false;
            seenOrder.add(no);
            return true;
        });

        const activeRowByShopNo = {};
        const latestVacatedRowByShopNo = {};
        const allVacatedRowsByShopNo = {};
        const vacantRowByShopNo = {};

        const getRowClosureTime = (row) => {
            if (!row?.shopClosureDate) return -1;
            const d = new Date(row.shopClosureDate);
            const t = d.getTime();
            return Number.isFinite(t) ? t : -1;
        };

        shopsForTable.forEach((shop) => {
            const months = groupedRentals[shop.tenantKey] || createMonthBuckets();
            const rentDetails = rentHistoryMap[shop.tenantKey] || createMonthBuckets();
            const advanceAmount = advanceMap[shop.tenantKey] || 0;
            const advanceDetails = advanceDetailsMap[shop.tenantKey] || [];
            const advanceAdjustmentDetails = advanceAdjustmentDetailsMap[shop.tenantKey] || [];
            const shopClosureDetails = shopClosureDetailsMap[shop.tenantKey] || [];
            const refundDetails = refundDetailsMap[shop.tenantKey] || [];
            const totalRentPaid = rentForms
                .filter(entry => {
                    return doesFormBelongToShop(entry, shop) &&
                        (entry.formType === 'Rent' || entry.formType === 'Pending Rent') &&
                        entry.paymentMode?.trim() === 'Advance Adjustment';
                })
                .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
            const totalShopClosurePaid = rentForms
                .filter(entry => {
                    return doesFormBelongToShop(entry, shop) && entry.formType === 'Shop Closure';
                })
                .reduce((sum, entry) => sum + parseAmountOrZero(entry.refundAmount ?? entry.amount), 0);
            const totalRefundPaid = rentForms
                .filter(entry => {
                    return doesFormBelongToShop(entry, shop) && entry.formType === 'Refund';
                })
                .reduce((sum, entry) => sum + parseFloat(entry.refundAmount || entry.amount || 0), 0);
            const remainingAdvance = Math.max(0, advanceAmount - totalRentPaid - totalShopClosurePaid - totalRefundPaid);
            const hadRentPaymentsThisYear = months.some(monthArr => monthArr.length > 0);
            const shopClosureDate = shop.shopClosureDate || shopInfoMap[shop.shopNo]?.shopClosureDate;
            let vacatedThisYear = false;
            if (shopClosureDate && !shop.active) {
                const closureDate = new Date(shopClosureDate);
                const closureYear = closureDate.getFullYear();
                vacatedThisYear = closureYear === parseInt(selectedYear);
            }
            const wasActiveThisYear = hadRentPaymentsThisYear || vacatedThisYear;
            const row = {
                shopNo: shop.shopNo,
                tenantName: shop.active ? shop.tenantName : "Vacant",
                doorNo: shop.doorNo,
                advance: shop.active ? remainingAdvance : null,
                advanceDetails: shop.active ? advanceDetails : [],
                advanceAdjustmentDetails: shop.active ? advanceAdjustmentDetails : [],
                shopClosureDetails: shop.active ? shopClosureDetails : [],
                refundDetails: shop.active ? refundDetails : [],
                months,
                rentDetails,
                propertyName: shop.propertyName,
                vacated: !shop.active && wasActiveThisYear,
                startingDate: shop.startingDate || shopInfoMap[shop.shopNo]?.startingDate || null,
                shopClosureDate: shop.active ? null : shopClosureDate || null,
                shouldCollectAdvance: shop.shouldCollectAdvance ?? (shopInfoMap[shop.shopNo]?.shouldCollectAdvance ?? true)
            };

            if (shop.active) {
                // Only keep one active tenant row per shopNo
                if (!activeRowByShopNo[shop.shopNo]) {
                    activeRowByShopNo[shop.shopNo] = row;
                }
                return;
            }

            if (wasActiveThisYear) {
                // Keep only the latest vacated tenant per shopNo (prevents duplicates)
                const vacatedRow = {
                    ...row,
                    tenantName: shop.tenantName || 'Vacated',
                    vacated: true,
                    advance: remainingAdvance,
                    advanceDetails: advanceDetails,
                    advanceAdjustmentDetails: advanceAdjustmentDetails,
                    shopClosureDetails: shopClosureDetails,
                    refundDetails: refundDetails
                };
                if (!allVacatedRowsByShopNo[shop.shopNo]) {
                    allVacatedRowsByShopNo[shop.shopNo] = [];
                }
                allVacatedRowsByShopNo[shop.shopNo].push(vacatedRow);
                const existing = latestVacatedRowByShopNo[shop.shopNo];
                const existingTime = getRowClosureTime(existing);
                const candidateTime = getRowClosureTime(vacatedRow);
                if (!existing || candidateTime > existingTime) {
                    latestVacatedRowByShopNo[shop.shopNo] = vacatedRow;
                }
            }

            // Prepare a single vacant row per shopNo (shown only when there is no active tenant)
            if (!vacantRowByShopNo[shop.shopNo]) {
                vacantRowByShopNo[shop.shopNo] = {
                    ...row,
                    tenantName: 'Vacant',
                    advance: null,
                    advanceDetails: [],
                    advanceAdjustmentDetails: [],
                    shopClosureDetails: [],
                    refundDetails: [],
                    months: createMonthBuckets(),
                    rentDetails: createMonthBuckets(),
                    vacated: false,
                    shopClosureDate: null
                };
            }
        });

        const finalTableData = [];
        const allShopNos = orderedShopNos.length
            ? orderedShopNos
            : Array.from(new Set(shopsForTable.map(s => s.shopNo).filter(Boolean)));

        allShopNos.forEach((shopNo) => {
            const activeRow = activeRowByShopNo[shopNo];
            if (activeRow) {
                finalTableData.push(activeRow);
                return;
            }
            const vacatedRow = latestVacatedRowByShopNo[shopNo];
            if (vacatedRow) {
                finalTableData.push(vacatedRow);
            }
            const vacantRow = vacantRowByShopNo[shopNo];
            if (vacantRow) {
                finalTableData.push(vacantRow);
            }
        });

        // Add S.No after final assembly
        setTableData(finalTableData.map((r, idx) => ({ ...r, shNo: idx + 1 })));

        // For "Vacated Shop" filter, show ALL vacated tenants per shop (no de-dupe)
        const vacatedOnly = [];
        allShopNos.forEach((shopNo) => {
            const rows = allVacatedRowsByShopNo[shopNo] || [];
            if (!rows.length) return;
            // Show latest vacated first within the shop
            rows
                .slice()
                .sort((a, b) => getRowClosureTime(b) - getRowClosureTime(a))
                .forEach(r => vacatedOnly.push(r));
        });
        setVacatedTableData(vacatedOnly.map((r, idx) => ({ ...r, shNo: idx + 1 })));
    }, [rentForms, tenantShopData, projects, selectedYear, shopNoIdToShopNoMap]);
    const formatINR = (value) => {
        const numericValue = value.replace(/[^0-9]/g, '');
        if (!numericValue) return '';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(Number(numericValue));
    };
    const handleSaveRentAdvance = async () => {
        const { tenantId, shopId } = selectedShop;
        try {
            const updateResponse = await fetch(`https://backendaab.in/aabuildersDash/api/tenant_link_shop/update/${tenantId}/shopNo/${shopId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    monthlyRent: editRent || null,
                    advanceAmount: editAdvance || null
                })
            });
            if (updateResponse.ok) {
                if (editRent && editStartingMonth) {
                    const rentHistoryData = {
                        shopNoId: shopId,
                        rentAmount: editRent,
                        startingMonthForThisRent: editStartingMonth
                    };
                    const historyResponse = await fetch('https://backendaab.in/aabuildersDash/api/rent-history/save', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(rentHistoryData)
                    });
                    if (!historyResponse.ok) {
                        console.error('Failed to save rent history');
                        alert('Rent/Advance updated but failed to save rent history');
                    }
                }
                await loadTenants();
                setShowEditPopup(false);
                setSelectedShop(null);
                setEditRent('');
                setEditAdvance('');
                setEditStartingMonth('');
            } else {
                console.error('Failed to update rent/advance');
                alert('Failed to update rent/advance');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while saving data');
        }
    };
    const filteredTableData = useMemo(() => {
        const sourceData = selectedOccupancyStatus === 'vacated' ? vacatedTableData : tableData;
        return sourceData.filter((shop) => {
            const matchesShopNo = selectedShopNo ? shop.shopNo === selectedShopNo : true;
            const matchesTenantName = selectedTenantName ? shop.tenantName === selectedTenantName : true;
            const matchesDoorNo = selectedDoorNo ? shop.doorNo === selectedDoorNo : true;
            const matchesShopNoFilter = shopNoFilter
                ? shop.shopNo === shopNoFilter
                : true;
            const matchesShopNameFilter = shopNameFilter
                ? shop.tenantName === shopNameFilter
                : true;
            const matchesDoorNoFilter = doorNoFilter
                ? shop.doorNo === doorNoFilter
                : true;
            const advanceFilterText = advanceFilter.replace(/[₹,\s]/g, '').trim();
            const matchesAdvanceFilter = advanceFilterText
                ? String(shop.advance ?? '').replace(/[₹,\s]/g, '').includes(advanceFilterText)
                : true;
            const matchesProperty = selectedProperty ? shop.propertyName === selectedProperty.value : true;
            const isVacant = shop.tenantName === 'Vacant';
            const isVacated = shop.vacated;
            const isOccupied = !isVacant && !isVacated;

            // When filtering by Paid/Unpaid, do not include vacated tenants.
            // Vacated entries have a closure date and shouldn't be considered for month payment status filters/reports.
            if (paymentStatus !== '' && isVacated) return false;

            let matchesOccupancyStatus = true;
            if (selectedOccupancyStatus) {
                if (selectedOccupancyStatus === 'vacant') {
                    matchesOccupancyStatus = isVacant;
                } else if (selectedOccupancyStatus === 'occupied') {
                    matchesOccupancyStatus = isOccupied;
                } else if (selectedOccupancyStatus === 'vacated') {
                    matchesOccupancyStatus = isVacated;
                }
            }
            let matchesMonthStatus = true;
            if (selectedMonth !== '' && paymentStatus !== '') {
                const monthPayments = shop.months?.[selectedMonth] || [];
                const totalAmount = monthPayments.reduce((a, b) => a + b, 0);
                if (paymentStatus === 'paid') {
                    matchesMonthStatus = totalAmount > 0;
                } else if (paymentStatus === 'unpaid') {
                    const startingDate = shop.startingDate ? new Date(shop.startingDate) : null;
                    const selectedMonthDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), 1);
                    // If startingDate is missing, we don't consider any month "started"
                    // (so we shouldn't show/filter unpaid "0" months for that tenant).
                    const hasStarted = startingDate ? startingDate <= selectedMonthDate : false;
                    matchesMonthStatus = totalAmount === 0 && hasStarted;
                }
            }
            const searchText = overallSearch.trim().toLowerCase();
            const monthTotals = Array.isArray(shop.months)
                ? shop.months.map((amounts) => Array.isArray(amounts) ? amounts.reduce((a, b) => a + b, 0) : '').join(' ')
                : '';
            const matchesOverallSearch = searchText
                ? [
                    shop.shopNo,
                    shop.tenantName,
                    shop.doorNo,
                    shop.propertyName,
                    shop.advance,
                    monthTotals,
                ].join(' ').toLowerCase().includes(searchText)
                : true;
            return matchesShopNo && matchesTenantName && matchesDoorNo && matchesShopNoFilter && matchesShopNameFilter && matchesDoorNoFilter && matchesAdvanceFilter && matchesProperty && matchesOccupancyStatus && (!isVacant || paymentStatus === '') && matchesMonthStatus && matchesOverallSearch;
        });
    }, [
        tableData,
        vacatedTableData,
        selectedShopNo,
        selectedTenantName,
        selectedDoorNo,
        selectedMonth,
        paymentStatus,
        selectedProperty,
        selectedOccupancyStatus,
        overallSearch,
        shopNoFilter,
        shopNameFilter,
        doorNoFilter,
        advanceFilter,
    ]);
    const sortedTableData = useMemo(() => {
        return [...filteredTableData].sort((a, b) => {
            const normalize = (val) =>
                val?.toString().replace(/\s+/g, '').toUpperCase() || '';
            const valA = normalize(a[sortField]?.split(',')[0]);
            const valB = normalize(b[sortField]?.split(',')[0]);
            if (sortField === 'shopNo') {
                // Parse shop number: extract first two letters and numeric part
                const parseShopNo = (str) => {
                    if (!str) return { letters: '', number: 0 };
                    // Extract first two letters (or one if only one exists)
                    const letterMatch = str.match(/^([A-Z]{1,2})/);
                    const letters = letterMatch ? letterMatch[1] : '';
                    // Extract numeric part
                    const numberMatch = str.match(/(\d+)/);
                    const number = numberMatch ? parseInt(numberMatch[1], 10) : 0;
                    return { letters, number };
                };                
                const parsedA = parseShopNo(valA);
                const parsedB = parseShopNo(valB);                
                // Compare letters first
                if (parsedA.letters < parsedB.letters) return sortOrder === 'asc' ? -1 : 1;
                if (parsedA.letters > parsedB.letters) return sortOrder === 'asc' ? 1 : -1;                
                // If letters are same, compare numbers numerically
                if (parsedA.number < parsedB.number) return sortOrder === 'asc' ? -1 : 1;
                if (parsedA.number > parsedB.number) return sortOrder === 'asc' ? 1 : -1;                
                return 0;
            }
            if (sortField === 'advance') {
                const amountA = Number(a.advance) || 0;
                const amountB = Number(b.advance) || 0;
                if (amountA < amountB) return sortOrder === 'asc' ? -1 : 1;
                if (amountA > amountB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            }
            // Default sorting for other fields
            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredTableData, sortField, sortOrder]);
    const totalPages = Math.ceil(sortedTableData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTableData = sortedTableData.slice(startIndex, endIndex);
    useEffect(() => {
        const nextTotalPages = Math.max(1, Math.ceil(sortedTableData.length / itemsPerPage));
        setCurrentPage((page) => (page > nextTotalPages ? nextTotalPages : page));
    }, [sortedTableData.length, itemsPerPage]);
    useEffect(() => {
        const updateToolbarWidth = () => {
            if (tableRef.current) {
                setTableToolbarWidth(tableRef.current.offsetWidth + 8);
            }
        };
        updateToolbarWidth();
        const resizeObserver = tableRef.current && typeof ResizeObserver !== 'undefined'
            ? new ResizeObserver(updateToolbarWidth)
            : null;
        if (resizeObserver && tableRef.current) {
            resizeObserver.observe(tableRef.current);
        }
        window.addEventListener('resize', updateToolbarWidth);
        return () => {
            if (resizeObserver) resizeObserver.disconnect();
            window.removeEventListener('resize', updateToolbarWidth);
        };
    }, [showFilters, sortedTableData.length]);
    const options = projects
        .filter(project => project.projectReferenceName) // Only include projects with projectReferenceName
        .map((project) => ({
            value: project.projectReferenceName,
            label: project.projectReferenceName,
        }));
    const shopOptions = [...new Set(tableData.map(shop => shop.shopNo))].map(no => ({ value: no, label: no }));
    const filteredByShop = selectedShopNo
        ? tableData.filter(shop => shop.shopNo === selectedShopNo)
        : tableData;
    const doorOptions = [...new Set(filteredByShop.map(shop => shop.doorNo).filter(Boolean))].map(door => ({ value: door, label: door }));
    const tableShopNoFilterOptions = [...new Set(filteredTableData.map(shop => shop.shopNo).filter(Boolean))].map(no => ({ value: no, label: no }));
    const tableShopNameFilterOptions = [...new Set(filteredTableData.map(shop => shop.tenantName).filter(Boolean))].map(name => ({ value: name, label: name }));
    const tableDoorNoFilterOptions = [...new Set(filteredTableData.map(shop => shop.doorNo).filter(Boolean))].map(door => ({ value: door, label: door }));
    const handleExportPDF = () => {
        const doc = new jsPDF('landscape');
        const monthYearSuffix = `${monthNames[selectedMonth]} ${selectedYear}`;
        const occ = (selectedOccupancyStatus || '').trim().toLowerCase();
        const pay = (paymentStatus || '').trim().toLowerCase();

        let reportTitle;
        if (pay === 'unpaid' && occ === 'occupied') {
            reportTitle = `Unpaid Occupied Shop Report ${monthYearSuffix}`;
        } else if (pay === 'unpaid' && occ === 'vacated') {
            reportTitle = `Unpaid Vacated Shop Report ${monthYearSuffix}`;
        } else if (occ === 'occupied') {
            reportTitle = `Occupied Shop Report ${monthYearSuffix}`;
        } else if (occ === 'vacated') {
            reportTitle = `Vacated Shop Report ${monthYearSuffix}`;
        } else if (pay === 'unpaid') {
            reportTitle = `Unpaid Shops Rent Report ${monthYearSuffix}`;
        } else if (pay === 'paid') {
            reportTitle = `Paid Shops Rent Report ${monthYearSuffix}`;
        } else {
            reportTitle = `Shop Rent Report ${monthYearSuffix}`;
        }

        const tableColumn = [
            "S.No",
            "Shop No",
            "Tenant Name",
            "Door No",
            "Advance",
            ...monthNames,
            "Unpaid"
        ];
        const now = new Date();
        const tableRows = sortedTableData.map((shop, index) => {
            const isVacant = shop.tenantName === 'Vacant';
            const isVacated = shop.vacated;
            const advance = shop.advance != null && shop.shouldCollectAdvance !== false
                ? Number(shop.advance).toLocaleString("en-IN")
                : shop.shouldCollectAdvance === false
                    ? 'NIL'
                    : "";
            const monthValues = shop.months.map((amounts, i) => {
                const isFutureMonth =
                    selectedYear > now.getFullYear() ||
                    (selectedYear === now.getFullYear() && i >= now.getMonth());
                const shopStartDate = shop.startingDate ? new Date(shop.startingDate) : null;
                const hasKnownStart = !!shopStartDate;
                const shopClosureDate = shop.shopClosureDate ? new Date(shop.shopClosureDate) : null;
                const isBeforeStart = shopStartDate
                    ? (selectedYear < shopStartDate.getFullYear() ||
                        (selectedYear === shopStartDate.getFullYear() && i < shopStartDate.getMonth()))
                    : false;
                const isAfterClosure = shopClosureDate && isVacated
                    ? (selectedYear > shopClosureDate.getFullYear() ||
                        (selectedYear === shopClosureDate.getFullYear() && i > shopClosureDate.getMonth()))
                    : false;
                const totalAmount = amounts.reduce((a, b) => a + b, 0);
                if (isVacant || isBeforeStart || isAfterClosure) return "-";
                if (totalAmount > 0) return totalAmount.toLocaleString();
                if (isFutureMonth) return "-";
                if (!hasKnownStart) return "-";
                return "0";
            });
            const unpaidCount = isVacant
                ? "-"
                : shop.months.filter((arr, i) => {
                    const isPastMonth =
                        selectedYear < now.getFullYear() ||
                        (selectedYear === now.getFullYear() && i < now.getMonth());
                    const shopStartDate = shop.startingDate ? new Date(shop.startingDate) : null;
                    const currentMonthDate = new Date(`${selectedYear}-${String(i + 1).padStart(2, '0')}-01`);
                    const isBeforeStart = shopStartDate ? currentMonthDate < shopStartDate : false;
                    const total = arr.reduce((a, b) => a + b, 0);
                    return isPastMonth && total === 0 && !isBeforeStart;
                }).length.toString().padStart(2, '0');
            const tenantDisplay = isVacant
                ? "Vacant"
                : isVacated
                    ? (shop.tenantName && shop.tenantName !== 'Vacated'
                        ? `${shop.tenantName} - Vacated`
                        : 'Vacated')
                    : shop.tenantName;
            return {
                rowData: [
                    index + 1,
                    shop.shopNo,
                    tenantDisplay,
                    shop.doorNo || "-",
                    advance,
                    ...monthValues,
                    unpaidCount,
                ],
                isVacant,
                isVacated,
            };
        });
        doc.setFontSize(12);
        doc.text(reportTitle, 14, 10);
        doc.autoTable({
            head: [tableColumn],
            body: tableRows.map((r) => r.rowData),
            startY: 15,
            styles: {
                fontSize: 7,
                overflow: 'linebreak',
                lineColor: [0, 0, 0],
                lineWidth: 0.1,
                textColor: [0, 0, 0],
            },
            headStyles: {
                fillColor: false,
                textColor: [0, 0, 0],
                fontStyle: 'bold',
            },
            bodyStyles: {
                fillColor: false,
                textColor: [0, 0, 0],
            },
            theme: 'grid'
        });
        const fileName = `${reportTitle.replace(/\s+/g, '-')}.pdf`;
        doc.save(fileName);
    };
    const handleExportVacantPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["S.No", "Shop No", "Door No", "Project Reference Name"];
        const tableRows = portfolioVacantShopsList.map((shop, index) => [
            index + 1,
            shop.shopNo,
            shop.doorNo || 'N/A',
            shop.propertyName || 'N/A'
        ]);
        doc.text("Vacant Shop Details", 14, 10);
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 15,
            styles: {
                fontSize: 10,
                lineColor: [200, 200, 200],
                lineWidth: 0.1,
            },
            headStyles: {
                fillColor: false,
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                lineColor: [200, 200, 200],
                lineWidth: 0.1,
            },
            bodyStyles: {
                fillColor: false,
                textColor: [0, 0, 0],
                lineColor: [200, 200, 200],
                lineWidth: 0.1,
            },
            theme: 'grid',
        });

        doc.save("Vacant-Shops.pdf");
    };
    /** Same rules as table occupancy filter; based on full tableData like other summary totals. */
    const portfolioOccupiedCount = useMemo(
        () => tableData.filter((shop) => shop.tenantName !== 'Vacant' && !shop.vacated).length,
        [tableData]
    );
    const portfolioVacantShopsList = useMemo(() => {
        const vacantShopsList = tableData.filter((shop) => {
            const shopInfo = shopInfoMap[shop.shopNo];
            const isVacant = shop.tenantName === 'Vacant';
            const shouldInclude = !shopInfo || shopInfo.shouldCollectAdvance !== false;
            return isVacant && shouldInclude;
        });
        return vacantShopsList.reduce((acc, current) => {
            const existingShop = acc.find((shop) => shop.shopNo === current.shopNo);
            if (!existingShop) {
                acc.push(current);
            }
            return acc;
        }, []);
    }, [tableData, shopInfoMap]);
    const totalMonthlyRents = useMemo(() => {
        if (selectedMonth === '' || selectedYear === '') return 0;
        const selectedMonthIndex = parseInt(selectedMonth); // 0-based
        const selectedYearNum = parseInt(selectedYear);
        const daysInMonth = new Date(selectedYearNum, selectedMonthIndex + 1, 0).getDate();
        return tableData.reduce((sum, shop) => {
            const isActive = shop.tenantName !== 'Vacant';
            const shopInfo = shopInfoMap[shop.shopNo];
            if (!isActive || !shopInfo?.monthlyRent) return sum;
            const rent = parseFloat(shopInfo.monthlyRent || 0);
            const startDate = shopInfo.startingDate ? new Date(shopInfo.startingDate) : null;
            if (!startDate) {
                return sum + rent;
            }
            const startYear = startDate.getFullYear();
            const startMonth = startDate.getMonth();
            if (startYear > selectedYearNum || (startYear === selectedYearNum && startMonth > selectedMonthIndex)) {
                return sum; // Not started yet
            }
            if (startYear === selectedYearNum && startMonth === selectedMonthIndex) {
                const startDay = startDate.getDate();
                const activeDays = daysInMonth - startDay + 1;
                let prorated = (rent / daysInMonth) * activeDays;
                const rounded = Math.floor(prorated / 10) * 10;
                const diff = prorated - rounded;
                if (diff >= 9) {
                    prorated = Math.round(prorated); // Normal round if very close
                } else {
                    prorated = rounded;
                }
                return sum + prorated;
            }
            return sum + rent; // Full rent
        }, 0);
    }, [tableData, shopInfoMap, selectedMonth, selectedYear]);
    const totalForSelectedMonth = useMemo(() => {
        if (selectedMonth === '' || selectedYear === '') return 0;
        return tableData.reduce((sum, shop) => {
            const amounts = shop.months?.[selectedMonth];
            if (!amounts || !Array.isArray(amounts)) return sum;
            const shopStartDate = shop.startingDate ? new Date(shop.startingDate) : null;
            const selectedMonthDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), 1);
            const isBeforeStart = shopStartDate ? selectedMonthDate < shopStartDate : false;
            if (shop.tenantName === 'Vacant' || isBeforeStart) return sum;
            const totalAmount = amounts.reduce((a, b) => a + b, 0);
            return sum + totalAmount;
        }, 0);
    }, [filteredTableData, selectedMonth, selectedYear]);
    const clearFilters = () => {
        setOverallSearch('');
        setShopNoFilter('');
        setShopNameFilter('');
        setDoorNoFilter('');
        setAdvanceFilter('');
        setSortField('');
        setSortOrder('asc');
    };
    const activeTableFilterChips = [
        shopNoFilter ? { label: 'Shop No', value: shopNoFilter, onClear: () => setShopNoFilter('') } : null,
        shopNameFilter ? { label: 'Shop Name', value: shopNameFilter, onClear: () => setShopNameFilter('') } : null,
        doorNoFilter ? { label: 'D.No', value: doorNoFilter, onClear: () => setDoorNoFilter('') } : null,
        advanceFilter ? { label: 'Advance', value: advanceFilter, onClear: () => setAdvanceFilter('') } : null,
    ].filter(Boolean);
    return (
        <div className="flex flex-col h-[calc(100vh-104px)] overflow-hidden bg-[#FAF6ED]">
            <div className="px-[18px] pt-[18px] pb-[18px] flex flex-col flex-1 min-h-0 overflow-hidden bg-[#FAF6ED]">
            <div className='w-full rounded-[6px] bg-white text-left mb-[18px] shrink-0'>
                <div className="flex flex-wrap items-center justify-between text-left max-md:flex-col max-md:items-stretch">
                    <div className="flex flex-wrap items-center gap-y-4 gap-x-3 text-left p-[18px]">
                    <div className="w-[180px] max-w-full">
                        <h1 className='font-semibold mb-2'>Select Year</h1>
                        <div className="expense-entry-form-date w-[180px] max-w-full">
                            <CustomMonthField
                                value={selectedMonthYear}
                                onChange={(v) => setSelectedMonthYear(v)}
                                placeholder="Select Year"
                                className="w-full text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                            />
                        </div>
                    </div>
                        <div className="w-[180px] max-w-full">
                            <label className="block font-semibold mb-2 text-sm sm:text-base">Payment Status</label>
                            <Select
                                options={paymentStatusOptions}
                                isSearchable
                                isClearable
                                placeholder="Payment Status"
                                className="custom-select rounded-lg w-[180px] h-[40px] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                                classNamePrefix="select"
                                value={paymentStatusOptions.find(option => option.value === paymentStatus) || null}
                                onChange={(selectedOption) => {
                                    const value = selectedOption?.value || '';
                                    setPaymentStatus(value);
                                    if (value) {
                                        sessionStorage.setItem('paymentStatus', JSON.stringify(value));
                                    } else {
                                        sessionStorage.removeItem('paymentStatus');
                                    }
                                }}
                                styles={dashboardTopDropdownStyles}
                            />
                        </div>
                        <div className="w-[220px] max-w-full">
                            <label className="block font-semibold mb-2 text-sm sm:text-base">Project Reference Name</label>
                            <Select
                                options={options}
                                value={selectedProperty}
                                isClearable
                                onChange={(option) => {
                                    setSelectedProperty(option);
                                    if (option) {
                                        sessionStorage.setItem('selectedProperty', JSON.stringify(option));
                                    } else {
                                        sessionStorage.removeItem('selectedProperty');
                                    }
                                }}
                                placeholder="Project Reference Name"
                                isSearchable
                                className="custom-select rounded-lg w-[220px] h-[40px] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                                classNamePrefix="select"
                                styles={dashboardTopDropdownStyles}
                            />
                        </div>
                        <div className="w-[180px] max-w-full">
                            <label className="block font-semibold mb-2 text-sm sm:text-base">Occupancy Status</label>
                            <Select
                                options={occupancyStatusOptions}
                                isSearchable
                                isClearable
                                placeholder="Occupancy Status"
                                className="custom-select rounded-lg w-[180px] h-[40px] text-[14px] font-semibold placeholder:text-[14px] placeholder:font-normal placeholder:text-gray-500"
                                classNamePrefix="select"
                                value={occupancyStatusOptions.find(option => option.value === selectedOccupancyStatus) || null}
                                onChange={(selectedOption) => {
                                    const value = selectedOption?.value || '';
                                    setSelectedOccupancyStatus(value);
                                    if (value) {
                                        sessionStorage.setItem('selectedOccupancyStatus', JSON.stringify(value));
                                    } else {
                                        sessionStorage.removeItem('selectedOccupancyStatus');
                                    }
                                }}
                                styles={dashboardTopDropdownStyles}
                            />
                        </div>
                        <div className="w-[180px] max-w-full">
                            <label className="block font-semibold mb-2 text-sm sm:text-base">Total Occupied Shops</label>
                            <div className={`${dashboardTopFieldClass} w-[180px] max-w-full flex items-center justify-end text-[#E4572E]`}>
                                {portfolioOccupiedCount}
                            </div>
                        </div>
                        <div className="w-[180px] max-w-full">
                            <label className="block font-semibold mb-2 text-sm sm:text-base">Total Shop Vacancy</label>
                            <div
                                className={`${dashboardTopFieldClass} w-[180px] max-w-full flex items-center justify-end text-[#E4572E] cursor-pointer`}
                                onClick={() => setShowVacantPopup(true)}
                            >
                                {portfolioVacantShopsList.length}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center flex-wrap justify-end pt-[8px] pb-[8px] pl-[8px] pr-[18px] max-xl:basis-full max-xl:pl-[18px] max-xl:pt-[18px] max-xl:justify-start max-xl:pb-[18px] max-md:justify-start max-md:px-[18px] max-md:pt-[18px] max-md:pb-[18px] max-md:w-full">
                        <div
                            className="rounded-md px-4 py-[8px] text-sm shrink-0"
                            style={{
                                backgroundColor: '#FFFDF9',
                                backgroundImage: [
                                    'repeating-linear-gradient(90deg, #E4572E66 0 3px, transparent 3px 6px)',
                                    'repeating-linear-gradient(90deg, #E4572E66 0 3px, transparent 3px 6px)',
                                    'repeating-linear-gradient(0deg, #E4572E66 0 3px, transparent 3px 6px)',
                                    'repeating-linear-gradient(0deg, #E4572E66 0 3px, transparent 3px 6px)',
                                ].join(', '),
                                backgroundSize: '100% 1px, 100% 1px, 1px 100%, 1px 100%',
                                backgroundPosition: '0 0, 0 100%, 0 0, 100% 0',
                                backgroundRepeat: 'repeat-x, repeat-x, repeat-y, repeat-y',
                            }}
                        >
                            <div className="flex justify-between text-[14px] gap-6 py-0.5">
                                <span className="flex shrink-0 w-[250px] text-black font-semibold">
                                    <span className="whitespace-nowrap">Total Monthly Rent</span>
                                    <span className="ml-auto">:</span>
                                </span>
                                <span className='font-semibold text-[#E4572E]'>₹{totalMonthlyRents.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                            </div>
                            <div className="flex justify-between text-[14px] gap-6 py-0.5">
                                <span className="flex shrink-0 w-[250px] text-black font-semibold">
                                    <span className="whitespace-nowrap">Collected for {monthNames[selectedMonth]} {selectedYear}</span>
                                    <span className="ml-auto">:</span>
                                </span>
                                <span className="font-semibold text-[#E4572E]">
                                    ₹{totalForSelectedMonth.toLocaleString("en-IN")}
                                </span>
                            </div>
                            <div className="flex justify-between text-[14px] gap-6 py-0.5">
                                <span className="flex shrink-0 w-[250px] text-black font-semibold">
                                    <span className="whitespace-nowrap">Balance {monthNames[selectedMonth]} {selectedYear}</span>
                                    <span className="ml-auto">:</span>
                                </span>
                                <span className="font-semibold text-[#E4572E]">
                                    ₹{(totalMonthlyRents - totalForSelectedMonth).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Rent Table */}
            <div className='w-full pt-[18px] px-[18px] pb-[18px] bg-white rounded-[6px] flex flex-col flex-1 min-h-0 overflow-hidden'>
                <div
                    className="flex min-w-0 flex-nowrap items-center justify-between gap-[6px] mb-[12px] shrink-0 overflow-hidden"
                    style={{ width: tableToolbarWidth ? `${tableToolbarWidth}px` : '100%' }}
                >
                    <div className={`flex min-w-0 items-center overflow-hidden gap-[6px]${activeTableFilterChips.length ? ' flex-1 min-w-0' : ' shrink-0'}`}>
                        <EdbcFilterToggleButton onClick={() => setShowFilters((prev) => !prev)} />
                        {activeTableFilterChips.length > 0 && (
                            <div className="flex min-w-0 flex-1 overflow-x-auto flex-nowrap gap-2 no-scrollbar scrollbar-none">
                                {activeTableFilterChips.map((chip) => (
                                    <span
                                        key={chip.label}
                                        className="inline-flex flex-nowrap items-center gap-1 whitespace-nowrap border text-[#000000] border-[#a1a1a1] h-[34px] rounded px-2 py-1 text-sm font-medium w-fit max-w-full min-w-0 overflow-hidden"
                                    >
                                        <span className="font-medium text-[#BF9853] shrink-0 whitespace-nowrap">{chip.label}: </span>
                                        <span className="font-semibold text-[14px] truncate min-w-0">{chip.value}</span>
                                        <button type="button" onClick={chip.onClear} className="text-[#E4572E] text-2xl ml-1">×</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex min-w-0 items-center justify-end gap-[6px] shrink-0">
                        <EdbcTableToolbarRightActions
                            onClearFilters={clearFilters}
                            overallSearch={overallSearch}
                            onOverallSearchChange={setOverallSearch}
                            showExportIcons={false}
                            clearButtonType="button"
                            wrapperClassName={null}
                            searchWrapperClassName="h-[34px] min-w-0 flex-1 max-w-[286px] border border-[#D6D6D6] rounded-md bg-white flex items-center px-2 gap-1 sm:w-[286px] sm:min-w-[286px] sm:flex-none sm:shrink-0"
                        />
                        <div className="flex shrink-0 items-end gap-2">
                            <span className="text-[#E4572E] flex items-center gap-1 font-semibold hover:underline cursor-pointer" onClick={handleExportPDF}>PDF<img src={Pdf} alt="Pdf" className="w-4 h-4" /></span>
                        </div>
                    </div>
                </div>
                <div ref={scrollRef} className="rounded-lg border-l-8 border-[#BF9853] overflow-auto no-scrollbar scrollbar-none select-none" style={{ height: `${550}px` }}
                    onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
                >
                    <table ref={tableRef} className={`border-collapse w-max min-w-max text-left ${RENT_DASHBOARD_EDBC_WIDTH_LOCK_TABLE_CLASS}`}>
                        <thead className="sticky top-0">
                            <EdbcTableHeaderRow>
                                <EdbcColumnHeader columnId={rentDashboardColumnIds.serialNo} label="S.No" headerClassName="!text-left" />
                                <EdbcColumnHeader
                                    columnId={rentDashboardColumnIds.shopNo}
                                    label="Shop No"
                                    sortField={sortField === 'shopNo' ? getEdbcColumnConfig(rentDashboardColumnIds.shopNo)?.sortField : ''}
                                    sortDirection={sortOrder}
                                    onSort={() => handleSort('shopNo')}
                                    headerClassName="!text-left"
                                />
                                <EdbcColumnHeader
                                    columnId={rentDashboardColumnIds.shopName}
                                    label="Shop Name"
                                    sortField={sortField === 'tenantName' ? getEdbcColumnConfig(rentDashboardColumnIds.shopName)?.sortField : ''}
                                    sortDirection={sortOrder}
                                    onSort={() => handleSort('tenantName')}
                                />
                                <EdbcColumnHeader columnId={rentDashboardColumnIds.doorNo} label="D.No" headerClassName="!text-left" />
                                <EdbcColumnHeader
                                    columnId={rentDashboardColumnIds.advance}
                                    label="Advance"
                                    sortField={sortField === 'advance' ? getEdbcColumnConfig(rentDashboardColumnIds.advance)?.sortField : ''}
                                    sortDirection={sortOrder}
                                    onSort={() => handleSort('advance')}
                                />
                                {monthNames.map((month, i) => (
                                    <EdbcColumnHeader key={i} columnId={rentDashboardColumnIds.month} label={month} />
                                ))}
                                <EdbcColumnHeader columnId={rentDashboardColumnIds.unpaid} label="Unpaid" />
                                <EdbcColumnHeader columnId={rentDashboardColumnIds.activity} label="Activity" />
                            </EdbcTableHeaderRow>
                            {showFilters && (
                                <EdbcTableFilterRow>
                                    <EdbcEmptyFilterCell columnId={rentDashboardColumnIds.serialNo} />
                                    <EdbcSelectFilter
                                        columnId={rentDashboardColumnIds.shopNo}
                                        placeholder="Shop No"
                                        options={tableShopNoFilterOptions}
                                        value={shopNoFilter}
                                        onChange={setShopNoFilter}
                                        textAlign="right"
                                    />
                                    <EdbcSelectFilter
                                        columnId={rentDashboardColumnIds.shopName}
                                        placeholder="Shop Name"
                                        options={tableShopNameFilterOptions}
                                        value={shopNameFilter}
                                        onChange={setShopNameFilter}
                                    />
                                    <EdbcSelectFilter
                                        columnId={rentDashboardColumnIds.doorNo}
                                        placeholder="D.No"
                                        options={tableDoorNoFilterOptions}
                                        value={doorNoFilter}
                                        onChange={setDoorNoFilter}
                                        textAlign="right"
                                    />
                                    <EdbcTotalAmountFilter
                                        columnId={rentDashboardColumnIds.advance}
                                        placeholder="Advance"
                                        value={advanceFilter}
                                        onChange={(e) => setAdvanceFilter(e.target.value)}
                                    />
                                    {monthNames.map((month, i) => (
                                        <EdbcEmptyFilterCell key={i} columnId={rentDashboardColumnIds.month} />
                                    ))}
                                    <EdbcEmptyFilterCell columnId={rentDashboardColumnIds.unpaid} />
                                    <EdbcEmptyFilterCell columnId={rentDashboardColumnIds.activity} />
                                </EdbcTableFilterRow>
                            )}
                        </thead>
                        <tbody>
                            {paginatedTableData.map((shop, index) => {
                                const isVacant = shop.tenantName === 'Vacant';
                                return (
                                    <EdbcTableBodyRow
                                        key={`${shop.shopNo}-${shop.tenantName || 'Vacant'}-${shop.shNo}`}
                                        className={`${isVacant
                                            ? 'bg-[#FFE5C5] text-[#E4572E] italic'
                                            : shop.vacated
                                                ? 'bg-[#FDE2E4] text-gray-600 line-through'
                                                : 'odd:bg-white even:bg-[#FAF6ED]'
                                            }`}
                                    >
                                        <td id={rentDashboardColumnIds.serialNo} className={getRentDashboardCellClass(rentDashboardColumnIds.serialNo, '!text-left')}>{startIndex + index + 1}</td>
                                        <td id={rentDashboardColumnIds.shopNo} className={getRentDashboardCellClass(rentDashboardColumnIds.shopNo, '!text-left')} title={`${shop.doorNo || ''} - ${shop.propertyName || ''}`}>
                                            {shop.shopNo}
                                        </td>
                                        <td id={rentDashboardColumnIds.shopName} className={getRentDashboardCellClass(rentDashboardColumnIds.shopName)}>
                                            {isVacant ? (
                                                <em></em>
                                            ) : (
                                                <span
                                                    className={shop.vacated ? 'line-through text-gray-500' : ''}
                                                    title={shop.vacated ? 'Tenant vacated during this year' : ''}
                                                >
                                                    {shop.tenantName}
                                                </span>
                                            )}
                                        </td>
                                        <td id={rentDashboardColumnIds.doorNo} className={getRentDashboardCellClass(rentDashboardColumnIds.doorNo, '!text-left')}>
                                            {shop.doorNo || '-'}
                                        </td>
                                        <td id={rentDashboardColumnIds.advance} className={getRentDashboardCellClass(rentDashboardColumnIds.advance)} title={(() => {
                                            const advanceDetails = shop.advanceDetails || [];
                                            const adjustmentDetails = shop.advanceAdjustmentDetails || [];
                                            const shopClosureDetails = shop.shopClosureDetails || [];
                                            const refundDetails = shop.refundDetails || [];                                            
                                            let tooltip = [];                                            
                                            // Add advance payments
                                            advanceDetails.forEach(detail => {
                                                tooltip.push(detail);
                                            });                                            
                                            // Add advance adjustments with clear labeling
                                            adjustmentDetails.forEach(detail => {
                                                tooltip.push(detail + ' (Advance Adjustment)');
                                            });                                            
                                            // Add shop closure payments with clear labeling
                                            shopClosureDetails.forEach(detail => {
                                                tooltip.push(detail + ' (Shop Closure)');
                                            });
                                            
                                            // Add refund payments with clear labeling
                                            refundDetails.forEach(detail => {
                                                tooltip.push(detail + ' (Refund)');
                                            });                                            
                                            // Add note for vacated shops
                                            if (shop.vacated && shop.advance > 0) {
                                                tooltip.push('Balance to be returned to tenant');
                                            }                                            
                                            return tooltip.join('\n');
                                        })()}>
                                            {shop.advance != null && shop.shouldCollectAdvance !== false
                                                ? Number(shop.advance).toLocaleString("en-IN", {
                                                    style: "currency",
                                                    currency: "INR",
                                                    maximumFractionDigits: 0
                                                })
                                                : shop.shouldCollectAdvance === false
                                                    ? 'NIL'
                                                    : ""}
                                        </td>
                                        {shop.months.map((amounts, i) => {
                                            const now = new Date();
                                            const isFutureMonth =
                                                selectedYear > now.getFullYear() ||
                                                (selectedYear === now.getFullYear() && i >= now.getMonth());
                                            const totalAmount = amounts.reduce((a, b) => a + b, 0);
                                            const hoverText = shop.rentDetails?.[i]?.join('\n') || "";
                                            const shopStartDate = shop.startingDate ? new Date(shop.startingDate) : null;
                                            const hasKnownStart = !!shopStartDate;
                                            const shopClosureDate = shop.shopClosureDate ? new Date(shop.shopClosureDate) : null;
                                            const isBeforeStart = shopStartDate
                                                ? (selectedYear < shopStartDate.getFullYear() ||
                                                    (selectedYear === shopStartDate.getFullYear() && i < shopStartDate.getMonth()))
                                                : false;
                                            const isAfterClosure = shopClosureDate && shop.vacated
                                                ? (selectedYear > shopClosureDate.getFullYear() ||
                                                    (selectedYear === shopClosureDate.getFullYear() && i > shopClosureDate.getMonth()))
                                                : false;
                                            return (
                                                <td key={i} id={rentDashboardColumnIds.month} className={getRentDashboardCellClass(rentDashboardColumnIds.month)} title={hoverText}>
                                                    {isVacant || isBeforeStart || isAfterClosure ? (
                                                        <span className="text-gray-400 font-medium">-</span>
                                                    ) : totalAmount > 0 ? (
                                                        <span className="text-green-600 font-semibold">{totalAmount.toLocaleString()}</span>
                                                    ) : isFutureMonth ? (
                                                        <span className="text-gray-400 font-medium">-</span>
                                                    ) : !hasKnownStart ? (
                                                        <span className="text-gray-400 font-medium">-</span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="text-[#E4572E] font-medium hover:underline"
                                                            onClick={() => openRentFormPopupForUnpaidMonth(shop, i)}
                                                        >
                                                            0
                                                        </button>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td id={rentDashboardColumnIds.unpaid} className={`${getRentDashboardCellClass(rentDashboardColumnIds.unpaid)} font-bold`}>
                                            {isVacant
                                                ? '-'
                                                : shop.months.filter((arr, i) => {
                                                    const now = new Date();
                                                    const isPastMonth =
                                                        selectedYear < now.getFullYear() ||
                                                        (selectedYear === now.getFullYear() && i < now.getMonth());
                                                    const total = arr.reduce((a, b) => a + b, 0);
                                                    const shopStartDate = shop.startingDate ? new Date(shop.startingDate) : null;
                                                    const hasKnownStart = !!shopStartDate;
                                                    const currentMonthDate = new Date(`${selectedYear}-${String(i + 1).padStart(2, '0')}-01`);
                                                    const isBeforeStart = shopStartDate ? currentMonthDate < shopStartDate : false;
                                                    return isPastMonth && total === 0 && hasKnownStart && !isBeforeStart;
                                                }).length.toString().padStart(2, '0')}
                                        </td>
                                        <td id={rentDashboardColumnIds.activity} className={getRentDashboardCellClass(rentDashboardColumnIds.activity, '!justify-center')}>
                                            {!isVacant && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedShop(shop);
                                                        setShowConfirm(true);
                                                    }}>
                                                    <img src={Edit} alt="" className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </EdbcTableBodyRow>
                                );
                            })}
                            {tableData.length === 0 && (
                                <tr>
                                    <td colSpan="17" className="text-center py-4 text-gray-500">
                                        No data available for {selectedYear}
                                    </td>
                                </tr>
                            )}
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
                            Showing {startIndex + 1} to {Math.min(endIndex, sortedTableData.length)} of {sortedTableData.length} entries
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
            {showConfirm && selectedShop && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40 p-4">
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md">
                        <p className="text-lg sm:text-xl font-semibold mb-2 text-center">
                            Are you sure you want to edit
                        </p>
                        <div className="text-lg sm:text-xl font-semibold mb-6 text-center">
                            <span className="text-[#BF9853]">{selectedShop.tenantName}</span>?
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                            <button className="bg-gray-300 px-4 py-2 rounded-md text-sm sm:text-base" onClick={() => { setShowConfirm(false); setSelectedShop(null); }}>
                                Cancel
                            </button>
                            <button
                                className="bg-[#BF9853] text-white px-4 py-2 rounded-md text-sm sm:text-base"
                                onClick={() => {
                                    const info = shopInfoMap[selectedShop.shopNo] || {};
                                    setEditAdvance(info.advanceAmount || '');
                                    setEditRent(info.monthlyRent || '');
                                    setEditStartingMonth('');
                                    setSelectedShop(prev => ({
                                        ...prev,
                                        tenantId: info.tenantId,
                                        shopId: info.shopId
                                    }));
                                    setShowConfirm(false);
                                    setShowEditPopup(true);
                                }}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showEditPopup && selectedShop && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40 p-4">
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto">
                        <div className="text-left text-base sm:text-lg text-[#E4572E] font-bold mb-4">
                            {selectedShop.tenantName} - {shopInfoMap[selectedShop.shopNo]?.doorNo || ''}
                        </div>
                        <div className="text-left space-y-4">
                            <div>
                                <label className="font-semibold block text-sm sm:text-base mb-1">Rent</label>
                                <input
                                    type="text"
                                    placeholder="Rent"
                                    value={formatINR(editRent)}
                                    onChange={(e) => setEditRent(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full border px-3 py-2 rounded-md focus:outline-none text-sm sm:text-base"
                                />
                            </div>
                            <div>
                                <label className="font-semibold block text-sm sm:text-base mb-1">Advance</label>
                                <input
                                    type="text"
                                    placeholder="Advance"
                                    value={formatINR(editAdvance)}
                                    onChange={(e) => setEditAdvance(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full border px-3 py-2 rounded-md focus:outline-none text-sm sm:text-base"
                                />
                            </div>
                            <div>
                                <label className="font-semibold block text-sm sm:text-base mb-1">Starting Month for This Rent</label>
                                <input
                                    type="month"
                                    value={editStartingMonth}
                                    onChange={(e) => setEditStartingMonth(e.target.value)}
                                    className="w-full border px-3 py-2 rounded-md focus:outline-none text-sm sm:text-base"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end mt-6 gap-3 sm:gap-4">
                            <button 
                                className="bg-gray-300 px-4 py-2 rounded-md text-sm sm:text-base" 
                                onClick={() => { setShowEditPopup(false); setSelectedShop(null); setEditRent(''); setEditAdvance(''); setEditStartingMonth(''); }}
                            >
                                Close
                            </button>
                            <button className="bg-[#BF9853] text-white px-4 py-2 rounded-md text-sm sm:text-base" onClick={handleSaveRentAdvance}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showVacantPopup && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
                    onClick={() => setShowVacantPopup(false)}
                >
                    <div
                        className="relative bg-white rounded-lg shadow-xl p-[18px] w-fit text-left max-h-[80vh] overflow-hidden no-scrollbar scrollbar-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setShowVacantPopup(false)}
                            className="absolute top-[18px] right-[18px] z-10 flex h-[20px] w-[20px] items-center justify-center"
                        >
                            <img src={FileRemover} className="w-[10px] h-[10px]" alt="Close" />
                        </button>
                        <div className="mb-2 pr-6">
                            <p className="text-[16px] font-bold text-[#E4572E]">Vacant Shop Details</p>
                        </div>
                        <div className="flex w-[498px] max-w-full justify-end mb-3">
                            <button className="text-[#E4572E] flex items-center gap-1 font-semibold text-sm cursor-pointer hover:underline" onClick={handleExportVacantPDF}>
                                PDF<img src={Pdf} alt="Pdf" className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="mt-4 border-l-8 border-l-[#BF9853] max-h-[55vh] overflow-y-auto no-scrollbar scrollbar-none rounded-lg overflow-hidden">
                            <table className={`table-fixed w-[498px] max-w-full border-collapse ${RENT_DASHBOARD_EDBC_WIDTH_LOCK_TABLE_CLASS}`}>
                                <thead className="sticky top-0 z-20 bg-[#FAF6ED]">
                                    <EdbcTableHeaderRow>
                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC21} label="S.No" headerClassName="!text-left" />
                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC13} label="Shop No" headerClassName="!text-left" />
                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC22} label="D.No" headerClassName="!text-left" />
                                        <EdbcColumnHeader columnId={EDBC_IDS.EDBC4} label="Project Reference Name" />
                                    </EdbcTableHeaderRow>
                                </thead>
                                <tbody>
                                    {portfolioVacantShopsList.map((shop, index) => (
                                        <EdbcTableBodyRow key={shop.shopNo}>
                                            <td id={EDBC_IDS.EDBC21} className={getRentDashboardCellClass(EDBC_IDS.EDBC21, '!text-left')}>{index + 1}</td>
                                            <td id={EDBC_IDS.EDBC13} className={getRentDashboardCellClass(EDBC_IDS.EDBC13, '!text-left')}>{shop.shopNo}</td>
                                            <td id={EDBC_IDS.EDBC22} className={getRentDashboardCellClass(EDBC_IDS.EDBC22, '!text-left')}>{shop.doorNo || 'N/A'}</td>
                                            <td id={EDBC_IDS.EDBC4} className={getRentDashboardCellClass(EDBC_IDS.EDBC4)}>{shop.propertyName || 'N/A'}</td>
                                        </EdbcTableBodyRow>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {showRentFormPopup ? (
                <div className="fixed inset-0 z-[99999] bg-black/40 flex items-center justify-center p-[18px]">
                    <div className="bg-white rounded-lg w-fit max-w-full max-h-[calc(100vh-36px)] overflow-y-auto shadow-lg relative">
                        <div className="sticky top-0 bg-white px-4 py-[8px] flex items-center justify-between">
                            <p className="text-[18px] font-semibold text-[#000000]">Rent Entry</p>
                            <button
                                type="button"
                                onClick={() => setShowRentFormPopup(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full text-xl"
                            >
                                <img src={FileRemover} alt="Close" className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="[&>div]:!h-auto [&>div]:!p-0 [&>div>div]:!p-[18px]">
                            <RentForm
                                embedded
                                onSuccess={async () => {
                                    setShowRentFormPopup(false);
                                    await refreshDashboardData();
                                }}
                            />
                        </div>
                    </div>
                </div>
            ) : null}
            </div>
        </div>
    );
};
export default Dashboard;